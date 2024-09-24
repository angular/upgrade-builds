/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationRef, ChangeDetectorRef, Injector, SimpleChange, Testability, TestabilityRegistry, } from '@angular/core';
import { PropertyBinding } from './component_info';
import { $SCOPE } from './constants';
import { cleanData, getTypeName, hookupNgModel, strictEquals } from './util';
const INITIAL_VALUE = {
    __UNINITIALIZED__: true,
};
export class DowngradeComponentAdapter {
    constructor(element, attrs, scope, ngModel, parentInjector, $compile, $parse, componentFactory, wrapCallback) {
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.ngModel = ngModel;
        this.parentInjector = parentInjector;
        this.$compile = $compile;
        this.$parse = $parse;
        this.componentFactory = componentFactory;
        this.wrapCallback = wrapCallback;
        this.implementsOnChanges = false;
        this.inputChangeCount = 0;
        this.inputChanges = {};
        this.componentScope = scope.$new();
    }
    compileContents() {
        const compiledProjectableNodes = [];
        const projectableNodes = this.groupProjectableNodes();
        const linkFns = projectableNodes.map((nodes) => this.$compile(nodes));
        this.element.empty();
        linkFns.forEach((linkFn) => {
            linkFn(this.scope, (clone) => {
                compiledProjectableNodes.push(clone);
                this.element.append(clone);
            });
        });
        return compiledProjectableNodes;
    }
    createComponentAndSetup(projectableNodes, manuallyAttachView = false, propagateDigest = true) {
        const component = this.createComponent(projectableNodes);
        this.setupInputs(manuallyAttachView, propagateDigest, component);
        this.setupOutputs(component.componentRef);
        this.registerCleanup(component.componentRef);
        return component.componentRef;
    }
    createComponent(projectableNodes) {
        const providers = [{ provide: $SCOPE, useValue: this.componentScope }];
        const childInjector = Injector.create({
            providers: providers,
            parent: this.parentInjector,
            name: 'DowngradeComponentAdapter',
        });
        const componentRef = this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        const viewChangeDetector = componentRef.injector.get(ChangeDetectorRef);
        const changeDetector = componentRef.changeDetectorRef;
        // testability hook is commonly added during component bootstrap in
        // packages/core/src/application_ref.bootstrap()
        // in downgraded application, component creation will take place here as well as adding the
        // testability hook.
        const testability = componentRef.injector.get(Testability, null);
        if (testability) {
            componentRef.injector
                .get(TestabilityRegistry)
                .registerApplication(componentRef.location.nativeElement, testability);
        }
        hookupNgModel(this.ngModel, componentRef.instance);
        return { viewChangeDetector, componentRef, changeDetector };
    }
    setupInputs(manuallyAttachView, propagateDigest = true, { componentRef, changeDetector, viewChangeDetector }) {
        const attrs = this.attrs;
        const inputs = this.componentFactory.inputs || [];
        for (const input of inputs) {
            const inputBinding = new PropertyBinding(input.propName, input.templateName);
            let expr = null;
            if (attrs.hasOwnProperty(inputBinding.attr)) {
                const observeFn = ((prop) => {
                    let prevValue = INITIAL_VALUE;
                    return (currValue) => {
                        // Initially, both `$observe()` and `$watch()` will call this function.
                        if (!strictEquals(prevValue, currValue)) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            this.updateInput(componentRef, prop, prevValue, currValue);
                            prevValue = currValue;
                        }
                    };
                })(inputBinding.prop);
                attrs.$observe(inputBinding.attr, observeFn);
                // Use `$watch()` (in addition to `$observe()`) in order to initialize the input in time
                // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
                // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
                let unwatch = this.componentScope.$watch(() => {
                    unwatch();
                    unwatch = null;
                    observeFn(attrs[inputBinding.attr]);
                });
            }
            else if (attrs.hasOwnProperty(inputBinding.bindAttr)) {
                expr = attrs[inputBinding.bindAttr];
            }
            else if (attrs.hasOwnProperty(inputBinding.bracketAttr)) {
                expr = attrs[inputBinding.bracketAttr];
            }
            else if (attrs.hasOwnProperty(inputBinding.bindonAttr)) {
                expr = attrs[inputBinding.bindonAttr];
            }
            else if (attrs.hasOwnProperty(inputBinding.bracketParenAttr)) {
                expr = attrs[inputBinding.bracketParenAttr];
            }
            if (expr != null) {
                const watchFn = ((prop) => (currValue, prevValue) => this.updateInput(componentRef, prop, prevValue, currValue))(inputBinding.prop);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        // Invoke `ngOnChanges()` and Change Detection (when necessary)
        const detectChanges = () => changeDetector.detectChanges();
        const prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && prototype.ngOnChanges);
        this.componentScope.$watch(() => this.inputChangeCount, this.wrapCallback(() => {
            // Invoke `ngOnChanges()`
            if (this.implementsOnChanges) {
                const inputChanges = this.inputChanges;
                this.inputChanges = {};
                componentRef.instance.ngOnChanges(inputChanges);
            }
            viewChangeDetector.markForCheck();
            // If opted out of propagating digests, invoke change detection when inputs change.
            if (!propagateDigest) {
                detectChanges();
            }
        }));
        // If not opted out of propagating digests, invoke change detection on every digest
        if (propagateDigest) {
            this.componentScope.$watch(this.wrapCallback(detectChanges));
        }
        // If necessary, attach the view so that it will be dirty-checked.
        // (Allow time for the initial input values to be set and `ngOnChanges()` to be called.)
        if (manuallyAttachView || !propagateDigest) {
            let unwatch = this.componentScope.$watch(() => {
                unwatch();
                unwatch = null;
                const appRef = this.parentInjector.get(ApplicationRef);
                appRef.attachView(componentRef.hostView);
            });
        }
    }
    setupOutputs(componentRef) {
        const attrs = this.attrs;
        const outputs = this.componentFactory.outputs || [];
        for (const output of outputs) {
            const outputBindings = new PropertyBinding(output.propName, output.templateName);
            const bindonAttr = outputBindings.bindonAttr.substring(0, outputBindings.bindonAttr.length - 6);
            const bracketParenAttr = `[(${outputBindings.bracketParenAttr.substring(2, outputBindings.bracketParenAttr.length - 8)})]`;
            // order below is important - first update bindings then evaluate expressions
            if (attrs.hasOwnProperty(bindonAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[bindonAttr], true);
            }
            if (attrs.hasOwnProperty(bracketParenAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[bracketParenAttr], true);
            }
            if (attrs.hasOwnProperty(outputBindings.onAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[outputBindings.onAttr]);
            }
            if (attrs.hasOwnProperty(outputBindings.parenAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[outputBindings.parenAttr]);
            }
        }
    }
    subscribeToOutput(componentRef, output, expr, isAssignment = false) {
        const getter = this.$parse(expr);
        const setter = getter.assign;
        if (isAssignment && !setter) {
            throw new Error(`Expression '${expr}' is not assignable!`);
        }
        const emitter = componentRef.instance[output.prop];
        if (emitter) {
            const subscription = emitter.subscribe({
                next: isAssignment
                    ? (v) => setter(this.scope, v)
                    : (v) => getter(this.scope, { '$event': v }),
            });
            componentRef.onDestroy(() => subscription.unsubscribe());
        }
        else {
            throw new Error(`Missing emitter '${output.prop}' on component '${getTypeName(this.componentFactory.componentType)}'!`);
        }
    }
    registerCleanup(componentRef) {
        const testabilityRegistry = componentRef.injector.get(TestabilityRegistry);
        const destroyComponentRef = this.wrapCallback(() => componentRef.destroy());
        let destroyed = false;
        this.element.on('$destroy', () => {
            // The `$destroy` event may have been triggered by the `cleanData()` call in the
            // `componentScope` `$destroy` handler below. In that case, we don't want to call
            // `componentScope.$destroy()` again.
            if (!destroyed)
                this.componentScope.$destroy();
        });
        this.componentScope.$on('$destroy', () => {
            if (!destroyed) {
                destroyed = true;
                testabilityRegistry.unregisterApplication(componentRef.location.nativeElement);
                // The `componentScope` might be getting destroyed, because an ancestor element is being
                // removed/destroyed. If that is the case, jqLite/jQuery would normally invoke `cleanData()`
                // on the removed element and all descendants.
                //   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/jqLite.js#L349-L355
                //   https://github.com/jquery/jquery/blob/6984d1747623dbc5e87fd6c261a5b6b1628c107c/src/manipulation.js#L182
                //
                // Here, however, `destroyComponentRef()` may under some circumstances remove the element
                // from the DOM and therefore it will no longer be a descendant of the removed element when
                // `cleanData()` is called. This would result in a memory leak, because the element's data
                // and event handlers (and all objects directly or indirectly referenced by them) would be
                // retained.
                //
                // To ensure the element is always properly cleaned up, we manually call `cleanData()` on
                // this element and its descendants before destroying the `ComponentRef`.
                cleanData(this.element[0]);
                destroyComponentRef();
            }
        });
    }
    updateInput(componentRef, prop, prevValue, currValue) {
        if (this.implementsOnChanges) {
            this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
        }
        this.inputChangeCount++;
        componentRef.instance[prop] = currValue;
    }
    groupProjectableNodes() {
        let ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, this.element.contents());
    }
}
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 */
export function groupNodesBySelector(ngContentSelectors, nodes) {
    const projectableNodes = [];
    for (let i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
        projectableNodes[i] = [];
    }
    for (let j = 0, jj = nodes.length; j < jj; ++j) {
        const node = nodes[j];
        const ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
        if (ngContentIndex != null) {
            projectableNodes[ngContentIndex].push(node);
        }
    }
    return projectableNodes;
}
function findMatchingNgContentIndex(element, ngContentSelectors) {
    const ngContentIndices = [];
    let wildcardNgContentIndex = -1;
    for (let i = 0; i < ngContentSelectors.length; i++) {
        const selector = ngContentSelectors[i];
        if (selector === '*') {
            wildcardNgContentIndex = i;
        }
        else {
            if (matchesSelector(element, selector)) {
                ngContentIndices.push(i);
            }
        }
    }
    ngContentIndices.sort();
    if (wildcardNgContentIndex !== -1) {
        ngContentIndices.push(wildcardNgContentIndex);
    }
    return ngContentIndices.length ? ngContentIndices[0] : null;
}
function matchesSelector(el, selector) {
    const elProto = Element.prototype;
    return el.nodeType === Node.ELEMENT_NODE
        ? // matches is supported by all browsers from 2014 onwards except non-chromium edge
            (elProto.matches ?? elProto.msMatchesSelector).call(el, selector)
        : false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL3NyYy9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGNBQWMsRUFDZCxpQkFBaUIsRUFJakIsUUFBUSxFQUVSLFlBQVksRUFHWixXQUFXLEVBQ1gsbUJBQW1CLEdBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBVXZCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFM0UsTUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsTUFBTSxPQUFPLHlCQUF5QjtJQU1wQyxZQUNVLE9BQXlCLEVBQ3pCLEtBQWtCLEVBQ2xCLEtBQWEsRUFDYixPQUEyQixFQUMzQixjQUF3QixFQUN4QixRQUF5QixFQUN6QixNQUFxQixFQUNyQixnQkFBdUMsRUFDdkMsWUFBeUM7UUFSekMsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7UUFDekIsVUFBSyxHQUFMLEtBQUssQ0FBYTtRQUNsQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUFDM0IsbUJBQWMsR0FBZCxjQUFjLENBQVU7UUFDeEIsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7UUFDekIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUNyQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXVCO1FBQ3ZDLGlCQUFZLEdBQVosWUFBWSxDQUE2QjtRQWQzQyx3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QUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDbkQsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkMsSUFBSSxRQUFRLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDckIsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUV4QixJQUFJLHNCQUFzQixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbEMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNELE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzlELENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxFQUFPLEVBQUUsUUFBZ0I7SUFDaEQsTUFBTSxPQUFPLEdBQVEsT0FBTyxDQUFDLFNBQVMsQ0FBQztJQUV2QyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVk7UUFDdEMsQ0FBQyxDQUFDLGtGQUFrRjtZQUNsRixDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUM7UUFDbkUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNaLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIEFwcGxpY2F0aW9uUmVmLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ29tcG9uZW50RmFjdG9yeSxcbiAgQ29tcG9uZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIEluamVjdG9yLFxuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZSxcbiAgU2ltcGxlQ2hhbmdlcyxcbiAgU3RhdGljUHJvdmlkZXIsXG4gIFRlc3RhYmlsaXR5LFxuICBUZXN0YWJpbGl0eVJlZ2lzdHJ5LFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtcbiAgSUF0dHJpYnV0ZXMsXG4gIElBdWdtZW50ZWRKUXVlcnksXG4gIElDb21waWxlU2VydmljZSxcbiAgSU5nTW9kZWxDb250cm9sbGVyLFxuICBJUGFyc2VTZXJ2aWNlLFxuICBJU2NvcGUsXG59IGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHtQcm9wZXJ0eUJpbmRpbmd9IGZyb20gJy4vY29tcG9uZW50X2luZm8nO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y2xlYW5EYXRhLCBnZXRUeXBlTmFtZSwgaG9va3VwTmdNb2RlbCwgc3RyaWN0RXF1YWxzfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBJTklUSUFMX1ZBTFVFID0ge1xuICBfX1VOSU5JVElBTElaRURfXzogdHJ1ZSxcbn07XG5cbmV4cG9ydCBjbGFzcyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpbXBsZW1lbnRzT25DaGFuZ2VzID0gZmFsc2U7XG4gIHByaXZhdGUgaW5wdXRDaGFuZ2VDb3VudDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZXM6IFNpbXBsZUNoYW5nZXMgPSB7fTtcbiAgcHJpdmF0ZSBjb21wb25lbnRTY29wZTogSVNjb3BlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeSxcbiAgICBwcml2YXRlIGF0dHJzOiBJQXR0cmlidXRlcyxcbiAgICBwcml2YXRlIHNjb3BlOiBJU2NvcGUsXG4gICAgcHJpdmF0ZSBuZ01vZGVsOiBJTmdNb2RlbENvbnRyb2xsZXIsXG4gICAgcHJpdmF0ZSBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsXG4gICAgcHJpdmF0ZSAkY29tcGlsZTogSUNvbXBpbGVTZXJ2aWNlLFxuICAgIHByaXZhdGUgJHBhcnNlOiBJUGFyc2VTZXJ2aWNlLFxuICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+LFxuICAgIHByaXZhdGUgd3JhcENhbGxiYWNrOiA8VD4oY2I6ICgpID0+IFQpID0+ICgpID0+IFQsXG4gICkge1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCk7XG4gIH1cblxuICBjb21waWxlQ29udGVudHMoKTogTm9kZVtdW10ge1xuICAgIGNvbnN0IGNvbXBpbGVkUHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IHRoaXMuZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCk7XG4gICAgY29uc3QgbGlua0ZucyA9IHByb2plY3RhYmxlTm9kZXMubWFwKChub2RlcykgPT4gdGhpcy4kY29tcGlsZShub2RlcykpO1xuXG4gICAgdGhpcy5lbGVtZW50LmVtcHR5ISgpO1xuXG4gICAgbGlua0Zucy5mb3JFYWNoKChsaW5rRm4pID0+IHtcbiAgICAgIGxpbmtGbih0aGlzLnNjb3BlLCAoY2xvbmU6IE5vZGVbXSkgPT4ge1xuICAgICAgICBjb21waWxlZFByb2plY3RhYmxlTm9kZXMucHVzaChjbG9uZSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmQhKGNsb25lKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbXBpbGVkUHJvamVjdGFibGVOb2RlcztcbiAgfVxuXG4gIGNyZWF0ZUNvbXBvbmVudEFuZFNldHVwKFxuICAgIHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdLFxuICAgIG1hbnVhbGx5QXR0YWNoVmlldyA9IGZhbHNlLFxuICAgIHByb3BhZ2F0ZURpZ2VzdCA9IHRydWUsXG4gICk6IENvbXBvbmVudFJlZjxhbnk+IHtcbiAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmNyZWF0ZUNvbXBvbmVudChwcm9qZWN0YWJsZU5vZGVzKTtcbiAgICB0aGlzLnNldHVwSW5wdXRzKG1hbnVhbGx5QXR0YWNoVmlldywgcHJvcGFnYXRlRGlnZXN0LCBjb21wb25lbnQpO1xuICAgIHRoaXMuc2V0dXBPdXRwdXRzKGNvbXBvbmVudC5jb21wb25lbnRSZWYpO1xuICAgIHRoaXMucmVnaXN0ZXJDbGVhbnVwKGNvbXBvbmVudC5jb21wb25lbnRSZWYpO1xuXG4gICAgcmV0dXJuIGNvbXBvbmVudC5jb21wb25lbnRSZWY7XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZUNvbXBvbmVudChwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSk6IENvbXBvbmVudEluZm8ge1xuICAgIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFt7cHJvdmlkZTogJFNDT1BFLCB1c2VWYWx1ZTogdGhpcy5jb21wb25lbnRTY29wZX1dO1xuICAgIGNvbnN0IGNoaWxkSW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoe1xuICAgICAgcHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gICAgICBwYXJlbnQ6IHRoaXMucGFyZW50SW5qZWN0b3IsXG4gICAgICBuYW1lOiAnRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcicsXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb21wb25lbnRSZWYgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkuY3JlYXRlKFxuICAgICAgY2hpbGRJbmplY3RvcixcbiAgICAgIHByb2plY3RhYmxlTm9kZXMsXG4gICAgICB0aGlzLmVsZW1lbnRbMF0sXG4gICAgKTtcbiAgICBjb25zdCB2aWV3Q2hhbmdlRGV0ZWN0b3IgPSBjb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgICBjb25zdCBjaGFuZ2VEZXRlY3RvciA9IGNvbXBvbmVudFJlZi5jaGFuZ2VEZXRlY3RvclJlZjtcblxuICAgIC8vIHRlc3RhYmlsaXR5IGhvb2sgaXMgY29tbW9ubHkgYWRkZWQgZHVyaW5nIGNvbXBvbmVudCBib290c3RyYXAgaW5cbiAgICAvLyBwYWNrYWdlcy9jb3JlL3NyYy9hcHBsaWNhdGlvbl9yZWYuYm9vdHN0cmFwKClcbiAgICAvLyBpbiBkb3duZ3JhZGVkIGFwcGxpY2F0aW9uLCBjb21wb25lbnQgY3JlYXRpb24gd2lsbCB0YWtlIHBsYWNlIGhlcmUgYXMgd2VsbCBhcyBhZGRpbmcgdGhlXG4gICAgLy8gdGVzdGFiaWxpdHkgaG9vay5cbiAgICBjb25zdCB0ZXN0YWJpbGl0eSA9IGNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHksIG51bGwpO1xuICAgIGlmICh0ZXN0YWJpbGl0eSkge1xuICAgICAgY29tcG9uZW50UmVmLmluamVjdG9yXG4gICAgICAgIC5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24oY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQsIHRlc3RhYmlsaXR5KTtcbiAgICB9XG5cbiAgICBob29rdXBOZ01vZGVsKHRoaXMubmdNb2RlbCwgY29tcG9uZW50UmVmLmluc3RhbmNlKTtcblxuICAgIHJldHVybiB7dmlld0NoYW5nZURldGVjdG9yLCBjb21wb25lbnRSZWYsIGNoYW5nZURldGVjdG9yfTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBJbnB1dHMoXG4gICAgbWFudWFsbHlBdHRhY2hWaWV3OiBib29sZWFuLFxuICAgIHByb3BhZ2F0ZURpZ2VzdCA9IHRydWUsXG4gICAge2NvbXBvbmVudFJlZiwgY2hhbmdlRGV0ZWN0b3IsIHZpZXdDaGFuZ2VEZXRlY3Rvcn06IENvbXBvbmVudEluZm8sXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBpbnB1dHMgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkuaW5wdXRzIHx8IFtdO1xuICAgIGZvciAoY29uc3QgaW5wdXQgb2YgaW5wdXRzKSB7XG4gICAgICBjb25zdCBpbnB1dEJpbmRpbmcgPSBuZXcgUHJvcGVydHlCaW5kaW5nKGlucHV0LnByb3BOYW1lLCBpbnB1dC50ZW1wbGF0ZU5hbWUpO1xuICAgICAgbGV0IGV4cHI6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXRCaW5kaW5nLmF0dHIpKSB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVGbiA9ICgocHJvcCkgPT4ge1xuICAgICAgICAgIGxldCBwcmV2VmFsdWUgPSBJTklUSUFMX1ZBTFVFO1xuICAgICAgICAgIHJldHVybiAoY3VyclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSwgYm90aCBgJG9ic2VydmUoKWAgYW5kIGAkd2F0Y2goKWAgd2lsbCBjYWxsIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIXN0cmljdEVxdWFscyhwcmV2VmFsdWUsIGN1cnJWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKHByZXZWYWx1ZSA9PT0gSU5JVElBTF9WQUxVRSkge1xuICAgICAgICAgICAgICAgIHByZXZWYWx1ZSA9IGN1cnJWYWx1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQoY29tcG9uZW50UmVmLCBwcm9wLCBwcmV2VmFsdWUsIGN1cnJWYWx1ZSk7XG4gICAgICAgICAgICAgIHByZXZWYWx1ZSA9IGN1cnJWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KShpbnB1dEJpbmRpbmcucHJvcCk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKGlucHV0QmluZGluZy5hdHRyLCBvYnNlcnZlRm4pO1xuXG4gICAgICAgIC8vIFVzZSBgJHdhdGNoKClgIChpbiBhZGRpdGlvbiB0byBgJG9ic2VydmUoKWApIGluIG9yZGVyIHRvIGluaXRpYWxpemUgdGhlIGlucHV0IGluIHRpbWVcbiAgICAgICAgLy8gZm9yIGBuZ09uQ2hhbmdlcygpYC4gVGhpcyBpcyBuZWNlc3NhcnkgaWYgd2UgYXJlIGFscmVhZHkgaW4gYSBgJGRpZ2VzdGAsIHdoaWNoIG1lYW5zIHRoYXRcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgICh3aGljaCBpcyBjYWxsZWQgYnkgYSB3YXRjaGVyKSB3aWxsIHJ1biBiZWZvcmUgdGhlIGAkb2JzZXJ2ZSgpYCBjYWxsYmFjay5cbiAgICAgICAgbGV0IHVud2F0Y2g6IEZ1bmN0aW9uIHwgbnVsbCA9IHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgICB1bndhdGNoISgpO1xuICAgICAgICAgIHVud2F0Y2ggPSBudWxsO1xuICAgICAgICAgIG9ic2VydmVGbihhdHRyc1tpbnB1dEJpbmRpbmcuYXR0cl0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXRCaW5kaW5nLmJpbmRBdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXRCaW5kaW5nLmJpbmRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXRCaW5kaW5nLmJyYWNrZXRBdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXRCaW5kaW5nLmJyYWNrZXRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXRCaW5kaW5nLmJpbmRvbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dEJpbmRpbmcuYmluZG9uQXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0QmluZGluZy5icmFja2V0UGFyZW5BdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXRCaW5kaW5nLmJyYWNrZXRQYXJlbkF0dHJdO1xuICAgICAgfVxuICAgICAgaWYgKGV4cHIgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCB3YXRjaEZuID0gKFxuICAgICAgICAgIChwcm9wKSA9PiAoY3VyclZhbHVlOiB1bmtub3duLCBwcmV2VmFsdWU6IHVua25vd24pID0+XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0KGNvbXBvbmVudFJlZiwgcHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpXG4gICAgICAgICkoaW5wdXRCaW5kaW5nLnByb3ApO1xuICAgICAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaChleHByLCB3YXRjaEZuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbnZva2UgYG5nT25DaGFuZ2VzKClgIGFuZCBDaGFuZ2UgRGV0ZWN0aW9uICh3aGVuIG5lY2Vzc2FyeSlcbiAgICBjb25zdCBkZXRlY3RDaGFuZ2VzID0gKCkgPT4gY2hhbmdlRGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIGNvbnN0IHByb3RvdHlwZSA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5jb21wb25lbnRUeXBlLnByb3RvdHlwZTtcbiAgICB0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMgPSAhIShwcm90b3R5cGUgJiYgKDxPbkNoYW5nZXM+cHJvdG90eXBlKS5uZ09uQ2hhbmdlcyk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaChcbiAgICAgICgpID0+IHRoaXMuaW5wdXRDaGFuZ2VDb3VudCxcbiAgICAgIHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgLy8gSW52b2tlIGBuZ09uQ2hhbmdlcygpYFxuICAgICAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICAgICAgY29uc3QgaW5wdXRDaGFuZ2VzID0gdGhpcy5pbnB1dENoYW5nZXM7XG4gICAgICAgICAgdGhpcy5pbnB1dENoYW5nZXMgPSB7fTtcbiAgICAgICAgICAoPE9uQ2hhbmdlcz5jb21wb25lbnRSZWYuaW5zdGFuY2UpLm5nT25DaGFuZ2VzKGlucHV0Q2hhbmdlcyk7XG4gICAgICAgIH1cblxuICAgICAgICB2aWV3Q2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG5cbiAgICAgICAgLy8gSWYgb3B0ZWQgb3V0IG9mIHByb3BhZ2F0aW5nIGRpZ2VzdHMsIGludm9rZSBjaGFuZ2UgZGV0ZWN0aW9uIHdoZW4gaW5wdXRzIGNoYW5nZS5cbiAgICAgICAgaWYgKCFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgICAgICBkZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG5cbiAgICAvLyBJZiBub3Qgb3B0ZWQgb3V0IG9mIHByb3BhZ2F0aW5nIGRpZ2VzdHMsIGludm9rZSBjaGFuZ2UgZGV0ZWN0aW9uIG9uIGV2ZXJ5IGRpZ2VzdFxuICAgIGlmIChwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKHRoaXMud3JhcENhbGxiYWNrKGRldGVjdENoYW5nZXMpKTtcbiAgICB9XG5cbiAgICAvLyBJZiBuZWNlc3NhcnksIGF0dGFjaCB0aGUgdmlldyBzbyB0aGF0IGl0IHdpbGwgYmUgZGlydHktY2hlY2tlZC5cbiAgICAvLyAoQWxsb3cgdGltZSBmb3IgdGhlIGluaXRpYWwgaW5wdXQgdmFsdWVzIHRvIGJlIHNldCBhbmQgYG5nT25DaGFuZ2VzKClgIHRvIGJlIGNhbGxlZC4pXG4gICAgaWYgKG1hbnVhbGx5QXR0YWNoVmlldyB8fCAhcHJvcGFnYXRlRGlnZXN0KSB7XG4gICAgICBsZXQgdW53YXRjaDogRnVuY3Rpb24gfCBudWxsID0gdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgICB1bndhdGNoISgpO1xuICAgICAgICB1bndhdGNoID0gbnVsbDtcblxuICAgICAgICBjb25zdCBhcHBSZWYgPSB0aGlzLnBhcmVudEluamVjdG9yLmdldDxBcHBsaWNhdGlvblJlZj4oQXBwbGljYXRpb25SZWYpO1xuICAgICAgICBhcHBSZWYuYXR0YWNoVmlldyhjb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cE91dHB1dHMoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55Pikge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBvdXRwdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm91dHB1dHMgfHwgW107XG4gICAgZm9yIChjb25zdCBvdXRwdXQgb2Ygb3V0cHV0cykge1xuICAgICAgY29uc3Qgb3V0cHV0QmluZGluZ3MgPSBuZXcgUHJvcGVydHlCaW5kaW5nKG91dHB1dC5wcm9wTmFtZSwgb3V0cHV0LnRlbXBsYXRlTmFtZSk7XG4gICAgICBjb25zdCBiaW5kb25BdHRyID0gb3V0cHV0QmluZGluZ3MuYmluZG9uQXR0ci5zdWJzdHJpbmcoXG4gICAgICAgIDAsXG4gICAgICAgIG91dHB1dEJpbmRpbmdzLmJpbmRvbkF0dHIubGVuZ3RoIC0gNixcbiAgICAgICk7XG4gICAgICBjb25zdCBicmFja2V0UGFyZW5BdHRyID0gYFsoJHtvdXRwdXRCaW5kaW5ncy5icmFja2V0UGFyZW5BdHRyLnN1YnN0cmluZyhcbiAgICAgICAgMixcbiAgICAgICAgb3V0cHV0QmluZGluZ3MuYnJhY2tldFBhcmVuQXR0ci5sZW5ndGggLSA4LFxuICAgICAgKX0pXWA7XG4gICAgICAvLyBvcmRlciBiZWxvdyBpcyBpbXBvcnRhbnQgLSBmaXJzdCB1cGRhdGUgYmluZGluZ3MgdGhlbiBldmFsdWF0ZSBleHByZXNzaW9uc1xuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJpbmRvbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQoY29tcG9uZW50UmVmLCBvdXRwdXRCaW5kaW5ncywgYXR0cnNbYmluZG9uQXR0cl0sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJyYWNrZXRQYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQoY29tcG9uZW50UmVmLCBvdXRwdXRCaW5kaW5ncywgYXR0cnNbYnJhY2tldFBhcmVuQXR0cl0sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dEJpbmRpbmdzLm9uQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChjb21wb25lbnRSZWYsIG91dHB1dEJpbmRpbmdzLCBhdHRyc1tvdXRwdXRCaW5kaW5ncy5vbkF0dHJdKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXRCaW5kaW5ncy5wYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQoY29tcG9uZW50UmVmLCBvdXRwdXRCaW5kaW5ncywgYXR0cnNbb3V0cHV0QmluZGluZ3MucGFyZW5BdHRyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVUb091dHB1dChcbiAgICBjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+LFxuICAgIG91dHB1dDogUHJvcGVydHlCaW5kaW5nLFxuICAgIGV4cHI6IHN0cmluZyxcbiAgICBpc0Fzc2lnbm1lbnQ6IGJvb2xlYW4gPSBmYWxzZSxcbiAgKSB7XG4gICAgY29uc3QgZ2V0dGVyID0gdGhpcy4kcGFyc2UoZXhwcik7XG4gICAgY29uc3Qgc2V0dGVyID0gZ2V0dGVyLmFzc2lnbjtcbiAgICBpZiAoaXNBc3NpZ25tZW50ICYmICFzZXR0ZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwcmVzc2lvbiAnJHtleHByfScgaXMgbm90IGFzc2lnbmFibGUhYCk7XG4gICAgfVxuICAgIGNvbnN0IGVtaXR0ZXIgPSBjb21wb25lbnRSZWYuaW5zdGFuY2Vbb3V0cHV0LnByb3BdIGFzIEV2ZW50RW1pdHRlcjxhbnk+O1xuICAgIGlmIChlbWl0dGVyKSB7XG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBlbWl0dGVyLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IGlzQXNzaWdubWVudFxuICAgICAgICAgID8gKHY6IGFueSkgPT4gc2V0dGVyISh0aGlzLnNjb3BlLCB2KVxuICAgICAgICAgIDogKHY6IGFueSkgPT4gZ2V0dGVyKHRoaXMuc2NvcGUsIHsnJGV2ZW50Jzogdn0pLFxuICAgICAgfSk7XG4gICAgICBjb21wb25lbnRSZWYub25EZXN0cm95KCgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgTWlzc2luZyBlbWl0dGVyICcke291dHB1dC5wcm9wfScgb24gY29tcG9uZW50ICcke2dldFR5cGVOYW1lKFxuICAgICAgICAgIHRoaXMuY29tcG9uZW50RmFjdG9yeS5jb21wb25lbnRUeXBlLFxuICAgICAgICApfSchYCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3RlckNsZWFudXAoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55Pikge1xuICAgIGNvbnN0IHRlc3RhYmlsaXR5UmVnaXN0cnkgPSBjb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpO1xuICAgIGNvbnN0IGRlc3Ryb3lDb21wb25lbnRSZWYgPSB0aGlzLndyYXBDYWxsYmFjaygoKSA9PiBjb21wb25lbnRSZWYuZGVzdHJveSgpKTtcbiAgICBsZXQgZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmVsZW1lbnQub24hKCckZGVzdHJveScsICgpID0+IHtcbiAgICAgIC8vIFRoZSBgJGRlc3Ryb3lgIGV2ZW50IG1heSBoYXZlIGJlZW4gdHJpZ2dlcmVkIGJ5IHRoZSBgY2xlYW5EYXRhKClgIGNhbGwgaW4gdGhlXG4gICAgICAvLyBgY29tcG9uZW50U2NvcGVgIGAkZGVzdHJveWAgaGFuZGxlciBiZWxvdy4gSW4gdGhhdCBjYXNlLCB3ZSBkb24ndCB3YW50IHRvIGNhbGxcbiAgICAgIC8vIGBjb21wb25lbnRTY29wZS4kZGVzdHJveSgpYCBhZ2Fpbi5cbiAgICAgIGlmICghZGVzdHJveWVkKSB0aGlzLmNvbXBvbmVudFNjb3BlLiRkZXN0cm95KCk7XG4gICAgfSk7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgaWYgKCFkZXN0cm95ZWQpIHtcbiAgICAgICAgZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgdGVzdGFiaWxpdHlSZWdpc3RyeS51bnJlZ2lzdGVyQXBwbGljYXRpb24oY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuXG4gICAgICAgIC8vIFRoZSBgY29tcG9uZW50U2NvcGVgIG1pZ2h0IGJlIGdldHRpbmcgZGVzdHJveWVkLCBiZWNhdXNlIGFuIGFuY2VzdG9yIGVsZW1lbnQgaXMgYmVpbmdcbiAgICAgICAgLy8gcmVtb3ZlZC9kZXN0cm95ZWQuIElmIHRoYXQgaXMgdGhlIGNhc2UsIGpxTGl0ZS9qUXVlcnkgd291bGQgbm9ybWFsbHkgaW52b2tlIGBjbGVhbkRhdGEoKWBcbiAgICAgICAgLy8gb24gdGhlIHJlbW92ZWQgZWxlbWVudCBhbmQgYWxsIGRlc2NlbmRhbnRzLlxuICAgICAgICAvLyAgIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi8yZTcyZWExM2ZhOThiZWJmNmVkNGI1ZTNjNDVlYWY1Zjk5MGVkMTZmL3NyYy9qcUxpdGUuanMjTDM0OS1MMzU1XG4gICAgICAgIC8vICAgaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9qcXVlcnkvYmxvYi82OTg0ZDE3NDc2MjNkYmM1ZTg3ZmQ2YzI2MWE1YjZiMTYyOGMxMDdjL3NyYy9tYW5pcHVsYXRpb24uanMjTDE4MlxuICAgICAgICAvL1xuICAgICAgICAvLyBIZXJlLCBob3dldmVyLCBgZGVzdHJveUNvbXBvbmVudFJlZigpYCBtYXkgdW5kZXIgc29tZSBjaXJjdW1zdGFuY2VzIHJlbW92ZSB0aGUgZWxlbWVudFxuICAgICAgICAvLyBmcm9tIHRoZSBET00gYW5kIHRoZXJlZm9yZSBpdCB3aWxsIG5vIGxvbmdlciBiZSBhIGRlc2NlbmRhbnQgb2YgdGhlIHJlbW92ZWQgZWxlbWVudCB3aGVuXG4gICAgICAgIC8vIGBjbGVhbkRhdGEoKWAgaXMgY2FsbGVkLiBUaGlzIHdvdWxkIHJlc3VsdCBpbiBhIG1lbW9yeSBsZWFrLCBiZWNhdXNlIHRoZSBlbGVtZW50J3MgZGF0YVxuICAgICAgICAvLyBhbmQgZXZlbnQgaGFuZGxlcnMgKGFuZCBhbGwgb2JqZWN0cyBkaXJlY3RseSBvciBpbmRpcmVjdGx5IHJlZmVyZW5jZWQgYnkgdGhlbSkgd291bGQgYmVcbiAgICAgICAgLy8gcmV0YWluZWQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRvIGVuc3VyZSB0aGUgZWxlbWVudCBpcyBhbHdheXMgcHJvcGVybHkgY2xlYW5lZCB1cCwgd2UgbWFudWFsbHkgY2FsbCBgY2xlYW5EYXRhKClgIG9uXG4gICAgICAgIC8vIHRoaXMgZWxlbWVudCBhbmQgaXRzIGRlc2NlbmRhbnRzIGJlZm9yZSBkZXN0cm95aW5nIHRoZSBgQ29tcG9uZW50UmVmYC5cbiAgICAgICAgY2xlYW5EYXRhKHRoaXMuZWxlbWVudFswXSk7XG5cbiAgICAgICAgZGVzdHJveUNvbXBvbmVudFJlZigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVJbnB1dChcbiAgICBjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+LFxuICAgIHByb3A6IHN0cmluZyxcbiAgICBwcmV2VmFsdWU6IGFueSxcbiAgICBjdXJyVmFsdWU6IGFueSxcbiAgKSB7XG4gICAgaWYgKHRoaXMuaW1wbGVtZW50c09uQ2hhbmdlcykge1xuICAgICAgdGhpcy5pbnB1dENoYW5nZXNbcHJvcF0gPSBuZXcgU2ltcGxlQ2hhbmdlKHByZXZWYWx1ZSwgY3VyclZhbHVlLCBwcmV2VmFsdWUgPT09IGN1cnJWYWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5pbnB1dENoYW5nZUNvdW50Kys7XG4gICAgY29tcG9uZW50UmVmLmluc3RhbmNlW3Byb3BdID0gY3VyclZhbHVlO1xuICB9XG5cbiAgcHJpdmF0ZSBncm91cFByb2plY3RhYmxlTm9kZXMoKSB7XG4gICAgbGV0IG5nQ29udGVudFNlbGVjdG9ycyA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5uZ0NvbnRlbnRTZWxlY3RvcnM7XG4gICAgcmV0dXJuIGdyb3VwTm9kZXNCeVNlbGVjdG9yKG5nQ29udGVudFNlbGVjdG9ycywgdGhpcy5lbGVtZW50LmNvbnRlbnRzISgpKTtcbiAgfVxufVxuXG4vKipcbiAqIEdyb3VwIGEgc2V0IG9mIERPTSBub2RlcyBpbnRvIGBuZ0NvbnRlbnRgIGdyb3VwcywgYmFzZWQgb24gdGhlIGdpdmVuIGNvbnRlbnQgc2VsZWN0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSwgbm9kZXM6IE5vZGVbXSk6IE5vZGVbXVtdIHtcbiAgY29uc3QgcHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMCwgaWkgPSBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpIDwgaWk7ICsraSkge1xuICAgIHByb2plY3RhYmxlTm9kZXNbaV0gPSBbXTtcbiAgfVxuXG4gIGZvciAobGV0IGogPSAwLCBqaiA9IG5vZGVzLmxlbmd0aDsgaiA8IGpqOyArK2opIHtcbiAgICBjb25zdCBub2RlID0gbm9kZXNbal07XG4gICAgY29uc3QgbmdDb250ZW50SW5kZXggPSBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChub2RlLCBuZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgIGlmIChuZ0NvbnRlbnRJbmRleCAhPSBudWxsKSB7XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzW25nQ29udGVudEluZGV4XS5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9qZWN0YWJsZU5vZGVzO1xufVxuXG5mdW5jdGlvbiBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChlbGVtZW50OiBhbnksIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10pOiBudW1iZXIgfCBudWxsIHtcbiAgY29uc3QgbmdDb250ZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgbGV0IHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlciA9IC0xO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gbmdDb250ZW50U2VsZWN0b3JzW2ldO1xuICAgIGlmIChzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gaTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hdGNoZXNTZWxlY3RvcihlbGVtZW50LCBzZWxlY3RvcikpIHtcbiAgICAgICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKGkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBuZ0NvbnRlbnRJbmRpY2VzLnNvcnQoKTtcblxuICBpZiAod2lsZGNhcmROZ0NvbnRlbnRJbmRleCAhPT0gLTEpIHtcbiAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2god2lsZGNhcmROZ0NvbnRlbnRJbmRleCk7XG4gIH1cbiAgcmV0dXJuIG5nQ29udGVudEluZGljZXMubGVuZ3RoID8gbmdDb250ZW50SW5kaWNlc1swXSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIG1hdGNoZXNTZWxlY3RvcihlbDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGVsUHJvdG8gPSA8YW55PkVsZW1lbnQucHJvdG90eXBlO1xuXG4gIHJldHVybiBlbC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREVcbiAgICA/IC8vIG1hdGNoZXMgaXMgc3VwcG9ydGVkIGJ5IGFsbCBicm93c2VycyBmcm9tIDIwMTQgb253YXJkcyBleGNlcHQgbm9uLWNocm9taXVtIGVkZ2VcbiAgICAgIChlbFByb3RvLm1hdGNoZXMgPz8gZWxQcm90by5tc01hdGNoZXNTZWxlY3RvcikuY2FsbChlbCwgc2VsZWN0b3IpXG4gICAgOiBmYWxzZTtcbn1cblxuaW50ZXJmYWNlIENvbXBvbmVudEluZm8ge1xuICBjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+O1xuICBjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG4gIHZpZXdDaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG59XG4iXX0=