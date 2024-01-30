/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL3NyYy9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGNBQWMsRUFDZCxpQkFBaUIsRUFJakIsUUFBUSxFQUVSLFlBQVksRUFHWixXQUFXLEVBQ1gsbUJBQW1CLEdBQ3BCLE1BQU0sZUFBZSxDQUFDO0FBVXZCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFM0UsTUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsTUFBTSxPQUFPLHlCQUF5QjtJQU1wQyxZQUNVLE9BQXlCLEVBQ3pCLEtBQWtCLEVBQ2xCLEtBQWEsRUFDYixPQUEyQixFQUMzQixjQUF3QixFQUN4QixRQUF5QixFQUN6QixNQUFxQixFQUNyQixnQkFBdUMsRUFDdkMsWUFBeUM7UUFSekMsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7UUFDekIsVUFBSyxHQUFMLEtBQUssQ0FBYTtRQUNsQixVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsWUFBTyxHQUFQLE9BQU8sQ0FBb0I7UUFDM0IsbUJBQWMsR0FBZCxjQUFjLENBQVU7UUFDeEIsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7UUFDekIsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUNyQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXVCO1FBQ3ZDLGlCQUFZLEdBQVosWUFBWSxDQUE2QjtRQWQzQyx3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QUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDbkQsTUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkMsSUFBSSxRQUFRLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDckIsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxlQUFlLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFDRCxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUV4QixJQUFJLHNCQUFzQixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbEMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUNELE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzlELENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxFQUFPLEVBQUUsUUFBZ0I7SUFDaEQsTUFBTSxPQUFPLEdBQVEsT0FBTyxDQUFDLFNBQVMsQ0FBQztJQUV2QyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVk7UUFDdEMsQ0FBQyxDQUFDLGtGQUFrRjtZQUNsRixDQUFDLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUM7UUFDbkUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNaLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQXBwbGljYXRpb25SZWYsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnRGYWN0b3J5LFxuICBDb21wb25lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0b3IsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBTdGF0aWNQcm92aWRlcixcbiAgVGVzdGFiaWxpdHksXG4gIFRlc3RhYmlsaXR5UmVnaXN0cnksXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBJQXR0cmlidXRlcyxcbiAgSUF1Z21lbnRlZEpRdWVyeSxcbiAgSUNvbXBpbGVTZXJ2aWNlLFxuICBJTmdNb2RlbENvbnRyb2xsZXIsXG4gIElQYXJzZVNlcnZpY2UsXG4gIElTY29wZSxcbn0gZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQge1Byb3BlcnR5QmluZGluZ30gZnJvbSAnLi9jb21wb25lbnRfaW5mbyc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtjbGVhbkRhdGEsIGdldFR5cGVOYW1lLCBob29rdXBOZ01vZGVsLCBzdHJpY3RFcXVhbHN9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlLFxufTtcblxuZXhwb3J0IGNsYXNzIERvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXIge1xuICBwcml2YXRlIGltcGxlbWVudHNPbkNoYW5nZXMgPSBmYWxzZTtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZUNvdW50OiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGlucHV0Q2hhbmdlczogU2ltcGxlQ2hhbmdlcyA9IHt9O1xuICBwcml2YXRlIGNvbXBvbmVudFNjb3BlOiBJU2NvcGU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5LFxuICAgIHByaXZhdGUgYXR0cnM6IElBdHRyaWJ1dGVzLFxuICAgIHByaXZhdGUgc2NvcGU6IElTY29wZSxcbiAgICBwcml2YXRlIG5nTW9kZWw6IElOZ01vZGVsQ29udHJvbGxlcixcbiAgICBwcml2YXRlIHBhcmVudEluamVjdG9yOiBJbmplY3RvcixcbiAgICBwcml2YXRlICRjb21waWxlOiBJQ29tcGlsZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSAkcGFyc2U6IElQYXJzZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4sXG4gICAgcHJpdmF0ZSB3cmFwQ2FsbGJhY2s6IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT4gVCxcbiAgKSB7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZSA9IHNjb3BlLiRuZXcoKTtcbiAgfVxuXG4gIGNvbXBpbGVDb250ZW50cygpOiBOb2RlW11bXSB7XG4gICAgY29uc3QgY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IFtdO1xuICAgIGNvbnN0IHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gdGhpcy5ncm91cFByb2plY3RhYmxlTm9kZXMoKTtcbiAgICBjb25zdCBsaW5rRm5zID0gcHJvamVjdGFibGVOb2Rlcy5tYXAoKG5vZGVzKSA9PiB0aGlzLiRjb21waWxlKG5vZGVzKSk7XG5cbiAgICB0aGlzLmVsZW1lbnQuZW1wdHkhKCk7XG5cbiAgICBsaW5rRm5zLmZvckVhY2goKGxpbmtGbikgPT4ge1xuICAgICAgbGlua0ZuKHRoaXMuc2NvcGUsIChjbG9uZTogTm9kZVtdKSA9PiB7XG4gICAgICAgIGNvbXBpbGVkUHJvamVjdGFibGVOb2Rlcy5wdXNoKGNsb25lKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZCEoY2xvbmUpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzO1xuICB9XG5cbiAgY3JlYXRlQ29tcG9uZW50QW5kU2V0dXAoXG4gICAgcHJvamVjdGFibGVOb2RlczogTm9kZVtdW10sXG4gICAgbWFudWFsbHlBdHRhY2hWaWV3ID0gZmFsc2UsXG4gICAgcHJvcGFnYXRlRGlnZXN0ID0gdHJ1ZSxcbiAgKTogQ29tcG9uZW50UmVmPGFueT4ge1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXMpO1xuICAgIHRoaXMuc2V0dXBJbnB1dHMobWFudWFsbHlBdHRhY2hWaWV3LCBwcm9wYWdhdGVEaWdlc3QsIGNvbXBvbmVudCk7XG4gICAgdGhpcy5zZXR1cE91dHB1dHMoY29tcG9uZW50LmNvbXBvbmVudFJlZik7XG4gICAgdGhpcy5yZWdpc3RlckNsZWFudXAoY29tcG9uZW50LmNvbXBvbmVudFJlZik7XG5cbiAgICByZXR1cm4gY29tcG9uZW50LmNvbXBvbmVudFJlZjtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdKTogQ29tcG9uZW50SW5mbyB7XG4gICAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW3twcm92aWRlOiAkU0NPUEUsIHVzZVZhbHVlOiB0aGlzLmNvbXBvbmVudFNjb3BlfV07XG4gICAgY29uc3QgY2hpbGRJbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZSh7XG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgIHBhcmVudDogdGhpcy5wYXJlbnRJbmplY3RvcixcbiAgICAgIG5hbWU6ICdEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5jcmVhdGUoXG4gICAgICBjaGlsZEluamVjdG9yLFxuICAgICAgcHJvamVjdGFibGVOb2RlcyxcbiAgICAgIHRoaXMuZWxlbWVudFswXSxcbiAgICApO1xuICAgIGNvbnN0IHZpZXdDaGFuZ2VEZXRlY3RvciA9IGNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgIGNvbnN0IGNoYW5nZURldGVjdG9yID0gY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmO1xuXG4gICAgLy8gdGVzdGFiaWxpdHkgaG9vayBpcyBjb21tb25seSBhZGRlZCBkdXJpbmcgY29tcG9uZW50IGJvb3RzdHJhcCBpblxuICAgIC8vIHBhY2thZ2VzL2NvcmUvc3JjL2FwcGxpY2F0aW9uX3JlZi5ib290c3RyYXAoKVxuICAgIC8vIGluIGRvd25ncmFkZWQgYXBwbGljYXRpb24sIGNvbXBvbmVudCBjcmVhdGlvbiB3aWxsIHRha2UgcGxhY2UgaGVyZSBhcyB3ZWxsIGFzIGFkZGluZyB0aGVcbiAgICAvLyB0ZXN0YWJpbGl0eSBob29rLlxuICAgIGNvbnN0IHRlc3RhYmlsaXR5ID0gY29tcG9uZW50UmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eSwgbnVsbCk7XG4gICAgaWYgKHRlc3RhYmlsaXR5KSB7XG4gICAgICBjb21wb25lbnRSZWYuaW5qZWN0b3JcbiAgICAgICAgLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KVxuICAgICAgICAucmVnaXN0ZXJBcHBsaWNhdGlvbihjb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCwgdGVzdGFiaWxpdHkpO1xuICAgIH1cblxuICAgIGhvb2t1cE5nTW9kZWwodGhpcy5uZ01vZGVsLCBjb21wb25lbnRSZWYuaW5zdGFuY2UpO1xuXG4gICAgcmV0dXJuIHt2aWV3Q2hhbmdlRGV0ZWN0b3IsIGNvbXBvbmVudFJlZiwgY2hhbmdlRGV0ZWN0b3J9O1xuICB9XG5cbiAgcHJpdmF0ZSBzZXR1cElucHV0cyhcbiAgICBtYW51YWxseUF0dGFjaFZpZXc6IGJvb2xlYW4sXG4gICAgcHJvcGFnYXRlRGlnZXN0ID0gdHJ1ZSxcbiAgICB7Y29tcG9uZW50UmVmLCBjaGFuZ2VEZXRlY3Rvciwgdmlld0NoYW5nZURldGVjdG9yfTogQ29tcG9uZW50SW5mbyxcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLmF0dHJzO1xuICAgIGNvbnN0IGlucHV0cyA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5pbnB1dHMgfHwgW107XG4gICAgZm9yIChjb25zdCBpbnB1dCBvZiBpbnB1dHMpIHtcbiAgICAgIGNvbnN0IGlucHV0QmluZGluZyA9IG5ldyBQcm9wZXJ0eUJpbmRpbmcoaW5wdXQucHJvcE5hbWUsIGlucHV0LnRlbXBsYXRlTmFtZSk7XG4gICAgICBsZXQgZXhwcjogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dEJpbmRpbmcuYXR0cikpIHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZUZuID0gKChwcm9wKSA9PiB7XG4gICAgICAgICAgbGV0IHByZXZWYWx1ZSA9IElOSVRJQUxfVkFMVUU7XG4gICAgICAgICAgcmV0dXJuIChjdXJyVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5LCBib3RoIGAkb2JzZXJ2ZSgpYCBhbmQgYCR3YXRjaCgpYCB3aWxsIGNhbGwgdGhpcyBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghc3RyaWN0RXF1YWxzKHByZXZWYWx1ZSwgY3VyclZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAocHJldlZhbHVlID09PSBJTklUSUFMX1ZBTFVFKSB7XG4gICAgICAgICAgICAgICAgcHJldlZhbHVlID0gY3VyclZhbHVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbnB1dChjb21wb25lbnRSZWYsIHByb3AsIHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgICAgICAgcHJldlZhbHVlID0gY3VyclZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pKGlucHV0QmluZGluZy5wcm9wKTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoaW5wdXRCaW5kaW5nLmF0dHIsIG9ic2VydmVGbik7XG5cbiAgICAgICAgLy8gVXNlIGAkd2F0Y2goKWAgKGluIGFkZGl0aW9uIHRvIGAkb2JzZXJ2ZSgpYCkgaW4gb3JkZXIgdG8gaW5pdGlhbGl6ZSB0aGUgaW5wdXQgaW4gdGltZVxuICAgICAgICAvLyBmb3IgYG5nT25DaGFuZ2VzKClgLiBUaGlzIGlzIG5lY2Vzc2FyeSBpZiB3ZSBhcmUgYWxyZWFkeSBpbiBhIGAkZGlnZXN0YCwgd2hpY2ggbWVhbnMgdGhhdFxuICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAgKHdoaWNoIGlzIGNhbGxlZCBieSBhIHdhdGNoZXIpIHdpbGwgcnVuIGJlZm9yZSB0aGUgYCRvYnNlcnZlKClgIGNhbGxiYWNrLlxuICAgICAgICBsZXQgdW53YXRjaDogRnVuY3Rpb24gfCBudWxsID0gdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgICAgIHVud2F0Y2ghKCk7XG4gICAgICAgICAgdW53YXRjaCA9IG51bGw7XG4gICAgICAgICAgb2JzZXJ2ZUZuKGF0dHJzW2lucHV0QmluZGluZy5hdHRyXSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dEJpbmRpbmcuYmluZEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dEJpbmRpbmcuYmluZEF0dHJdO1xuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dEJpbmRpbmcuYnJhY2tldEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dEJpbmRpbmcuYnJhY2tldEF0dHJdO1xuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dEJpbmRpbmcuYmluZG9uQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0QmluZGluZy5iaW5kb25BdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXRCaW5kaW5nLmJyYWNrZXRQYXJlbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dEJpbmRpbmcuYnJhY2tldFBhcmVuQXR0cl07XG4gICAgICB9XG4gICAgICBpZiAoZXhwciAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHdhdGNoRm4gPSAoXG4gICAgICAgICAgKHByb3ApID0+IChjdXJyVmFsdWU6IHVua25vd24sIHByZXZWYWx1ZTogdW5rbm93bikgPT5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQoY29tcG9uZW50UmVmLCBwcm9wLCBwcmV2VmFsdWUsIGN1cnJWYWx1ZSlcbiAgICAgICAgKShpbnB1dEJpbmRpbmcucHJvcCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKGV4cHIsIHdhdGNoRm4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWAgYW5kIENoYW5nZSBEZXRlY3Rpb24gKHdoZW4gbmVjZXNzYXJ5KVxuICAgIGNvbnN0IGRldGVjdENoYW5nZXMgPSAoKSA9PiBjaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgY29uc3QgcHJvdG90eXBlID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUucHJvdG90eXBlO1xuICAgIHRoaXMuaW1wbGVtZW50c09uQ2hhbmdlcyA9ICEhKHByb3RvdHlwZSAmJiAoPE9uQ2hhbmdlcz5wcm90b3R5cGUpLm5nT25DaGFuZ2VzKTtcblxuICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKFxuICAgICAgKCkgPT4gdGhpcy5pbnB1dENoYW5nZUNvdW50LFxuICAgICAgdGhpcy53cmFwQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICAvLyBJbnZva2UgYG5nT25DaGFuZ2VzKClgXG4gICAgICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgICAgICBjb25zdCBpbnB1dENoYW5nZXMgPSB0aGlzLmlucHV0Q2hhbmdlcztcbiAgICAgICAgICB0aGlzLmlucHV0Q2hhbmdlcyA9IHt9O1xuICAgICAgICAgICg8T25DaGFuZ2VzPmNvbXBvbmVudFJlZi5pbnN0YW5jZSkubmdPbkNoYW5nZXMoaW5wdXRDaGFuZ2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZpZXdDaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcblxuICAgICAgICAvLyBJZiBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gd2hlbiBpbnB1dHMgY2hhbmdlLlxuICAgICAgICBpZiAoIXByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgICAgIGRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcblxuICAgIC8vIElmIG5vdCBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gb24gZXZlcnkgZGlnZXN0XG4gICAgaWYgKHByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2godGhpcy53cmFwQ2FsbGJhY2soZGV0ZWN0Q2hhbmdlcykpO1xuICAgIH1cblxuICAgIC8vIElmIG5lY2Vzc2FyeSwgYXR0YWNoIHRoZSB2aWV3IHNvIHRoYXQgaXQgd2lsbCBiZSBkaXJ0eS1jaGVja2VkLlxuICAgIC8vIChBbGxvdyB0aW1lIGZvciB0aGUgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgdG8gYmUgc2V0IGFuZCBgbmdPbkNoYW5nZXMoKWAgdG8gYmUgY2FsbGVkLilcbiAgICBpZiAobWFudWFsbHlBdHRhY2hWaWV3IHx8ICFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIGxldCB1bndhdGNoOiBGdW5jdGlvbiB8IG51bGwgPSB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgIHVud2F0Y2ghKCk7XG4gICAgICAgIHVud2F0Y2ggPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IGFwcFJlZiA9IHRoaXMucGFyZW50SW5qZWN0b3IuZ2V0PEFwcGxpY2F0aW9uUmVmPihBcHBsaWNhdGlvblJlZik7XG4gICAgICAgIGFwcFJlZi5hdHRhY2hWaWV3KGNvbXBvbmVudFJlZi5ob3N0Vmlldyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldHVwT3V0cHV0cyhjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KSB7XG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLmF0dHJzO1xuICAgIGNvbnN0IG91dHB1dHMgPSB0aGlzLmNvbXBvbmVudEZhY3Rvcnkub3V0cHV0cyB8fCBbXTtcbiAgICBmb3IgKGNvbnN0IG91dHB1dCBvZiBvdXRwdXRzKSB7XG4gICAgICBjb25zdCBvdXRwdXRCaW5kaW5ncyA9IG5ldyBQcm9wZXJ0eUJpbmRpbmcob3V0cHV0LnByb3BOYW1lLCBvdXRwdXQudGVtcGxhdGVOYW1lKTtcbiAgICAgIGNvbnN0IGJpbmRvbkF0dHIgPSBvdXRwdXRCaW5kaW5ncy5iaW5kb25BdHRyLnN1YnN0cmluZyhcbiAgICAgICAgMCxcbiAgICAgICAgb3V0cHV0QmluZGluZ3MuYmluZG9uQXR0ci5sZW5ndGggLSA2LFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGJyYWNrZXRQYXJlbkF0dHIgPSBgWygke291dHB1dEJpbmRpbmdzLmJyYWNrZXRQYXJlbkF0dHIuc3Vic3RyaW5nKFxuICAgICAgICAyLFxuICAgICAgICBvdXRwdXRCaW5kaW5ncy5icmFja2V0UGFyZW5BdHRyLmxlbmd0aCAtIDgsXG4gICAgICApfSldYDtcbiAgICAgIC8vIG9yZGVyIGJlbG93IGlzIGltcG9ydGFudCAtIGZpcnN0IHVwZGF0ZSBiaW5kaW5ncyB0aGVuIGV2YWx1YXRlIGV4cHJlc3Npb25zXG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYmluZG9uQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChjb21wb25lbnRSZWYsIG91dHB1dEJpbmRpbmdzLCBhdHRyc1tiaW5kb25BdHRyXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChjb21wb25lbnRSZWYsIG91dHB1dEJpbmRpbmdzLCBhdHRyc1ticmFja2V0UGFyZW5BdHRyXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkob3V0cHV0QmluZGluZ3Mub25BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KGNvbXBvbmVudFJlZiwgb3V0cHV0QmluZGluZ3MsIGF0dHJzW291dHB1dEJpbmRpbmdzLm9uQXR0cl0pO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dEJpbmRpbmdzLnBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChjb21wb25lbnRSZWYsIG91dHB1dEJpbmRpbmdzLCBhdHRyc1tvdXRwdXRCaW5kaW5ncy5wYXJlbkF0dHJdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN1YnNjcmliZVRvT3V0cHV0KFxuICAgIGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT4sXG4gICAgb3V0cHV0OiBQcm9wZXJ0eUJpbmRpbmcsXG4gICAgZXhwcjogc3RyaW5nLFxuICAgIGlzQXNzaWdubWVudDogYm9vbGVhbiA9IGZhbHNlLFxuICApIHtcbiAgICBjb25zdCBnZXR0ZXIgPSB0aGlzLiRwYXJzZShleHByKTtcbiAgICBjb25zdCBzZXR0ZXIgPSBnZXR0ZXIuYXNzaWduO1xuICAgIGlmIChpc0Fzc2lnbm1lbnQgJiYgIXNldHRlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHByZXNzaW9uICcke2V4cHJ9JyBpcyBub3QgYXNzaWduYWJsZSFgKTtcbiAgICB9XG4gICAgY29uc3QgZW1pdHRlciA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZVtvdXRwdXQucHJvcF0gYXMgRXZlbnRFbWl0dGVyPGFueT47XG4gICAgaWYgKGVtaXR0ZXIpIHtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGVtaXR0ZXIuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogaXNBc3NpZ25tZW50XG4gICAgICAgICAgPyAodjogYW55KSA9PiBzZXR0ZXIhKHRoaXMuc2NvcGUsIHYpXG4gICAgICAgICAgOiAodjogYW55KSA9PiBnZXR0ZXIodGhpcy5zY29wZSwgeyckZXZlbnQnOiB2fSksXG4gICAgICB9KTtcbiAgICAgIGNvbXBvbmVudFJlZi5vbkRlc3Ryb3koKCkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBNaXNzaW5nIGVtaXR0ZXIgJyR7b3V0cHV0LnByb3B9JyBvbiBjb21wb25lbnQgJyR7Z2V0VHlwZU5hbWUoXG4gICAgICAgICAgdGhpcy5jb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUsXG4gICAgICAgICl9JyFgLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyQ2xlYW51cChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KSB7XG4gICAgY29uc3QgdGVzdGFiaWxpdHlSZWdpc3RyeSA9IGNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSk7XG4gICAgY29uc3QgZGVzdHJveUNvbXBvbmVudFJlZiA9IHRoaXMud3JhcENhbGxiYWNrKCgpID0+IGNvbXBvbmVudFJlZi5kZXN0cm95KCkpO1xuICAgIGxldCBkZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuZWxlbWVudC5vbiEoJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgLy8gVGhlIGAkZGVzdHJveWAgZXZlbnQgbWF5IGhhdmUgYmVlbiB0cmlnZ2VyZWQgYnkgdGhlIGBjbGVhbkRhdGEoKWAgY2FsbCBpbiB0aGVcbiAgICAgIC8vIGBjb21wb25lbnRTY29wZWAgYCRkZXN0cm95YCBoYW5kbGVyIGJlbG93LiBJbiB0aGF0IGNhc2UsIHdlIGRvbid0IHdhbnQgdG8gY2FsbFxuICAgICAgLy8gYGNvbXBvbmVudFNjb3BlLiRkZXN0cm95KClgIGFnYWluLlxuICAgICAgaWYgKCFkZXN0cm95ZWQpIHRoaXMuY29tcG9uZW50U2NvcGUuJGRlc3Ryb3koKTtcbiAgICB9KTtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICBpZiAoIWRlc3Ryb3llZCkge1xuICAgICAgICBkZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB0ZXN0YWJpbGl0eVJlZ2lzdHJ5LnVucmVnaXN0ZXJBcHBsaWNhdGlvbihjb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCk7XG5cbiAgICAgICAgLy8gVGhlIGBjb21wb25lbnRTY29wZWAgbWlnaHQgYmUgZ2V0dGluZyBkZXN0cm95ZWQsIGJlY2F1c2UgYW4gYW5jZXN0b3IgZWxlbWVudCBpcyBiZWluZ1xuICAgICAgICAvLyByZW1vdmVkL2Rlc3Ryb3llZC4gSWYgdGhhdCBpcyB0aGUgY2FzZSwganFMaXRlL2pRdWVyeSB3b3VsZCBub3JtYWxseSBpbnZva2UgYGNsZWFuRGF0YSgpYFxuICAgICAgICAvLyBvbiB0aGUgcmVtb3ZlZCBlbGVtZW50IGFuZCBhbGwgZGVzY2VuZGFudHMuXG4gICAgICAgIC8vICAgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzJlNzJlYTEzZmE5OGJlYmY2ZWQ0YjVlM2M0NWVhZjVmOTkwZWQxNmYvc3JjL2pxTGl0ZS5qcyNMMzQ5LUwzNTVcbiAgICAgICAgLy8gICBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iLzY5ODRkMTc0NzYyM2RiYzVlODdmZDZjMjYxYTViNmIxNjI4YzEwN2Mvc3JjL21hbmlwdWxhdGlvbi5qcyNMMTgyXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEhlcmUsIGhvd2V2ZXIsIGBkZXN0cm95Q29tcG9uZW50UmVmKClgIG1heSB1bmRlciBzb21lIGNpcmN1bXN0YW5jZXMgcmVtb3ZlIHRoZSBlbGVtZW50XG4gICAgICAgIC8vIGZyb20gdGhlIERPTSBhbmQgdGhlcmVmb3JlIGl0IHdpbGwgbm8gbG9uZ2VyIGJlIGEgZGVzY2VuZGFudCBvZiB0aGUgcmVtb3ZlZCBlbGVtZW50IHdoZW5cbiAgICAgICAgLy8gYGNsZWFuRGF0YSgpYCBpcyBjYWxsZWQuIFRoaXMgd291bGQgcmVzdWx0IGluIGEgbWVtb3J5IGxlYWssIGJlY2F1c2UgdGhlIGVsZW1lbnQncyBkYXRhXG4gICAgICAgIC8vIGFuZCBldmVudCBoYW5kbGVycyAoYW5kIGFsbCBvYmplY3RzIGRpcmVjdGx5IG9yIGluZGlyZWN0bHkgcmVmZXJlbmNlZCBieSB0aGVtKSB3b3VsZCBiZVxuICAgICAgICAvLyByZXRhaW5lZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVG8gZW5zdXJlIHRoZSBlbGVtZW50IGlzIGFsd2F5cyBwcm9wZXJseSBjbGVhbmVkIHVwLCB3ZSBtYW51YWxseSBjYWxsIGBjbGVhbkRhdGEoKWAgb25cbiAgICAgICAgLy8gdGhpcyBlbGVtZW50IGFuZCBpdHMgZGVzY2VuZGFudHMgYmVmb3JlIGRlc3Ryb3lpbmcgdGhlIGBDb21wb25lbnRSZWZgLlxuICAgICAgICBjbGVhbkRhdGEodGhpcy5lbGVtZW50WzBdKTtcblxuICAgICAgICBkZXN0cm95Q29tcG9uZW50UmVmKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUlucHV0KFxuICAgIGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT4sXG4gICAgcHJvcDogc3RyaW5nLFxuICAgIHByZXZWYWx1ZTogYW55LFxuICAgIGN1cnJWYWx1ZTogYW55LFxuICApIHtcbiAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICB0aGlzLmlucHV0Q2hhbmdlc1twcm9wXSA9IG5ldyBTaW1wbGVDaGFuZ2UocHJldlZhbHVlLCBjdXJyVmFsdWUsIHByZXZWYWx1ZSA9PT0gY3VyclZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLmlucHV0Q2hhbmdlQ291bnQrKztcbiAgICBjb21wb25lbnRSZWYuaW5zdGFuY2VbcHJvcF0gPSBjdXJyVmFsdWU7XG4gIH1cblxuICBwcml2YXRlIGdyb3VwUHJvamVjdGFibGVOb2RlcygpIHtcbiAgICBsZXQgbmdDb250ZW50U2VsZWN0b3JzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm5nQ29udGVudFNlbGVjdG9ycztcbiAgICByZXR1cm4gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzLCB0aGlzLmVsZW1lbnQuY29udGVudHMhKCkpO1xuICB9XG59XG5cbi8qKlxuICogR3JvdXAgYSBzZXQgb2YgRE9NIG5vZGVzIGludG8gYG5nQ29udGVudGAgZ3JvdXBzLCBiYXNlZCBvbiB0aGUgZ2l2ZW4gY29udGVudCBzZWxlY3RvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cE5vZGVzQnlTZWxlY3RvcihuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdLCBub2RlczogTm9kZVtdKTogTm9kZVtdW10ge1xuICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwLCBpaSA9IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkgPCBpaTsgKytpKSB7XG4gICAgcHJvamVjdGFibGVOb2Rlc1tpXSA9IFtdO1xuICB9XG5cbiAgZm9yIChsZXQgaiA9IDAsIGpqID0gbm9kZXMubGVuZ3RoOyBqIDwgamo7ICsraikge1xuICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tqXTtcbiAgICBjb25zdCBuZ0NvbnRlbnRJbmRleCA9IGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KG5vZGUsIG5nQ29udGVudFNlbGVjdG9ycyk7XG4gICAgaWYgKG5nQ29udGVudEluZGV4ICE9IG51bGwpIHtcbiAgICAgIHByb2plY3RhYmxlTm9kZXNbbmdDb250ZW50SW5kZXhdLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByb2plY3RhYmxlTm9kZXM7XG59XG5cbmZ1bmN0aW9uIGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KGVsZW1lbnQ6IGFueSwgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSk6IG51bWJlciB8IG51bGwge1xuICBjb25zdCBuZ0NvbnRlbnRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICBsZXQgd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyID0gLTE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBuZ0NvbnRlbnRTZWxlY3RvcnNbaV07XG4gICAgaWYgKHNlbGVjdG9yID09PSAnKicpIHtcbiAgICAgIHdpbGRjYXJkTmdDb250ZW50SW5kZXggPSBpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWF0Y2hlc1NlbGVjdG9yKGVsZW1lbnQsIHNlbGVjdG9yKSkge1xuICAgICAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2goaSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5nQ29udGVudEluZGljZXMuc29ydCgpO1xuXG4gIGlmICh3aWxkY2FyZE5nQ29udGVudEluZGV4ICE9PSAtMSkge1xuICAgIG5nQ29udGVudEluZGljZXMucHVzaCh3aWxkY2FyZE5nQ29udGVudEluZGV4KTtcbiAgfVxuICByZXR1cm4gbmdDb250ZW50SW5kaWNlcy5sZW5ndGggPyBuZ0NvbnRlbnRJbmRpY2VzWzBdIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gbWF0Y2hlc1NlbGVjdG9yKGVsOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgZWxQcm90byA9IDxhbnk+RWxlbWVudC5wcm90b3R5cGU7XG5cbiAgcmV0dXJuIGVsLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERVxuICAgID8gLy8gbWF0Y2hlcyBpcyBzdXBwb3J0ZWQgYnkgYWxsIGJyb3dzZXJzIGZyb20gMjAxNCBvbndhcmRzIGV4Y2VwdCBub24tY2hyb21pdW0gZWRnZVxuICAgICAgKGVsUHJvdG8ubWF0Y2hlcyA/PyBlbFByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yKS5jYWxsKGVsLCBzZWxlY3RvcilcbiAgICA6IGZhbHNlO1xufVxuXG5pbnRlcmZhY2UgQ29tcG9uZW50SW5mbyB7XG4gIGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT47XG4gIGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZjtcbiAgdmlld0NoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZjtcbn1cbiJdfQ==