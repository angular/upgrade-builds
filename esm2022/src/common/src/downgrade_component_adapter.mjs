/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ApplicationRef, ChangeDetectorRef, Injector, SimpleChange, Testability, TestabilityRegistry, ɵSIGNAL as SIGNAL, } from '@angular/core';
import { PropertyBinding } from './component_info';
import { $SCOPE } from './constants';
import { cleanData, getTypeName, hookupNgModel, strictEquals } from './util';
const INITIAL_VALUE = {
    __UNINITIALIZED__: true,
};
export class DowngradeComponentAdapter {
    constructor(element, attrs, scope, ngModel, parentInjector, $compile, $parse, componentFactory, wrapCallback, unsafelyOverwriteSignalInputs) {
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.ngModel = ngModel;
        this.parentInjector = parentInjector;
        this.$compile = $compile;
        this.$parse = $parse;
        this.componentFactory = componentFactory;
        this.wrapCallback = wrapCallback;
        this.unsafelyOverwriteSignalInputs = unsafelyOverwriteSignalInputs;
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
                const observeFn = ((prop, isSignal) => {
                    let prevValue = INITIAL_VALUE;
                    return (currValue) => {
                        // Initially, both `$observe()` and `$watch()` will call this function.
                        if (!strictEquals(prevValue, currValue)) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            this.updateInput(componentRef, prop, prevValue, currValue, isSignal);
                            prevValue = currValue;
                        }
                    };
                })(inputBinding.prop, input.isSignal);
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
                const watchFn = ((prop, isSignal) => (currValue, prevValue) => this.updateInput(componentRef, prop, prevValue, currValue, isSignal))(inputBinding.prop, input.isSignal);
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
    updateInput(componentRef, prop, prevValue, currValue, isSignal) {
        if (this.implementsOnChanges) {
            this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
        }
        this.inputChangeCount++;
        if (isSignal && !this.unsafelyOverwriteSignalInputs) {
            const node = componentRef.instance[prop][SIGNAL];
            node.applyValueToInputSignal(node, currValue);
        }
        else {
            componentRef.instance[prop] = currValue;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL3NyYy9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGNBQWMsRUFDZCxpQkFBaUIsRUFJakIsUUFBUSxFQUVSLFlBQVksRUFHWixXQUFXLEVBQ1gsbUJBQW1CLEVBRW5CLE9BQU8sSUFBSSxNQUFNLEdBQ2xCLE1BQU0sZUFBZSxDQUFDO0FBVXZCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFM0UsTUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsTUFBTSxPQUFPLHlCQUF5QjtJQU1wQyxZQUNVLE9BQXlCLEVBQ3pCLEtBQWtCLEVBQ2xCLEtBQWEsRUFDYixPQUEyQixFQUMzQixjQUF3QixFQUN4QixRQUF5QixFQUN6QixNQUFxQixFQUNyQixnQkFBdUMsRUFDdkMsWUFBeUMsRUFDaEMsNkJBQXNDO1FBVC9DLFlBQU8sR0FBUCxPQUFPLENBQWtCO1FBQ3pCLFVBQUssR0FBTCxLQUFLLENBQWE7UUFDbEIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLFlBQU8sR0FBUCxPQUFPLENBQW9CO1FBQzNCLG1CQUFjLEdBQWQsY0FBYyxDQUFVO1FBQ3hCLGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQ3pCLFdBQU0sR0FBTixNQUFNLENBQWU7UUFDckIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUF1QjtR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ZSxDQUFDLEVBQU8sRUFBRSxRQUFnQjtJQUNoRCxNQUFNLE9BQU8sR0FBUSxPQUFPLENBQUMsU0FBUyxDQUFDO0lBRXZDLE9BQU8sRUFBRSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsWUFBWTtRQUN0QyxDQUFDLENBQUMsa0ZBQWtGO1lBQ2xGLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQztRQUNuRSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ1osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQXBwbGljYXRpb25SZWYsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnRGYWN0b3J5LFxuICBDb21wb25lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0b3IsXG4gIE9uQ2hhbmdlcyxcbiAgU2ltcGxlQ2hhbmdlLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBTdGF0aWNQcm92aWRlcixcbiAgVGVzdGFiaWxpdHksXG4gIFRlc3RhYmlsaXR5UmVnaXN0cnksXG4gIHR5cGUgybVJbnB1dFNpZ25hbE5vZGUgYXMgSW5wdXRTaWduYWxOb2RlLFxuICDJtVNJR05BTCBhcyBTSUdOQUwsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBJQXR0cmlidXRlcyxcbiAgSUF1Z21lbnRlZEpRdWVyeSxcbiAgSUNvbXBpbGVTZXJ2aWNlLFxuICBJTmdNb2RlbENvbnRyb2xsZXIsXG4gIElQYXJzZVNlcnZpY2UsXG4gIElTY29wZSxcbn0gZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQge1Byb3BlcnR5QmluZGluZ30gZnJvbSAnLi9jb21wb25lbnRfaW5mbyc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtjbGVhbkRhdGEsIGdldFR5cGVOYW1lLCBob29rdXBOZ01vZGVsLCBzdHJpY3RFcXVhbHN9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlLFxufTtcblxuZXhwb3J0IGNsYXNzIERvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXIge1xuICBwcml2YXRlIGltcGxlbWVudHNPbkNoYW5nZXMgPSBmYWxzZTtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZUNvdW50OiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGlucHV0Q2hhbmdlczogU2ltcGxlQ2hhbmdlcyA9IHt9O1xuICBwcml2YXRlIGNvbXBvbmVudFNjb3BlOiBJU2NvcGU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5LFxuICAgIHByaXZhdGUgYXR0cnM6IElBdHRyaWJ1dGVzLFxuICAgIHByaXZhdGUgc2NvcGU6IElTY29wZSxcbiAgICBwcml2YXRlIG5nTW9kZWw6IElOZ01vZGVsQ29udHJvbGxlcixcbiAgICBwcml2YXRlIHBhcmVudEluamVjdG9yOiBJbmplY3RvcixcbiAgICBwcml2YXRlICRjb21waWxlOiBJQ29tcGlsZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSAkcGFyc2U6IElQYXJzZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4sXG4gICAgcHJpdmF0ZSB3cmFwQ2FsbGJhY2s6IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT4gVCxcbiAgICBwcml2YXRlIHJlYWRvbmx5IHVuc2FmZWx5T3ZlcndyaXRlU2lnbmFsSW5wdXRzOiBib29sZWFuLFxuICApIHtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlID0gc2NvcGUuJG5ldygpO1xuICB9XG5cbiAgY29tcGlsZUNvbnRlbnRzKCk6IE5vZGVbXVtdIHtcbiAgICBjb25zdCBjb21waWxlZFByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gW107XG4gICAgY29uc3QgcHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSB0aGlzLmdyb3VwUHJvamVjdGFibGVOb2RlcygpO1xuICAgIGNvbnN0IGxpbmtGbnMgPSBwcm9qZWN0YWJsZU5vZGVzLm1hcCgobm9kZXMpID0+IHRoaXMuJGNvbXBpbGUobm9kZXMpKTtcblxuICAgIHRoaXMuZWxlbWVudC5lbXB0eSEoKTtcblxuICAgIGxpbmtGbnMuZm9yRWFjaCgobGlua0ZuKSA9PiB7XG4gICAgICBsaW5rRm4odGhpcy5zY29wZSwgKGNsb25lOiBOb2RlW10pID0+IHtcbiAgICAgICAgY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzLnB1c2goY2xvbmUpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kIShjbG9uZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb21waWxlZFByb2plY3RhYmxlTm9kZXM7XG4gIH1cblxuICBjcmVhdGVDb21wb25lbnRBbmRTZXR1cChcbiAgICBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSxcbiAgICBtYW51YWxseUF0dGFjaFZpZXcgPSBmYWxzZSxcbiAgICBwcm9wYWdhdGVEaWdlc3QgPSB0cnVlLFxuICApOiBDb21wb25lbnRSZWY8YW55PiB7XG4gICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5jcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2Rlcyk7XG4gICAgdGhpcy5zZXR1cElucHV0cyhtYW51YWxseUF0dGFjaFZpZXcsIHByb3BhZ2F0ZURpZ2VzdCwgY29tcG9uZW50KTtcbiAgICB0aGlzLnNldHVwT3V0cHV0cyhjb21wb25lbnQuY29tcG9uZW50UmVmKTtcbiAgICB0aGlzLnJlZ2lzdGVyQ2xlYW51cChjb21wb25lbnQuY29tcG9uZW50UmVmKTtcblxuICAgIHJldHVybiBjb21wb25lbnQuY29tcG9uZW50UmVmO1xuICB9XG5cbiAgcHJpdmF0ZSBjcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2RlczogTm9kZVtdW10pOiBDb21wb25lbnRJbmZvIHtcbiAgICBjb25zdCBwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbe3Byb3ZpZGU6ICRTQ09QRSwgdXNlVmFsdWU6IHRoaXMuY29tcG9uZW50U2NvcGV9XTtcbiAgICBjb25zdCBjaGlsZEluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKHtcbiAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgcGFyZW50OiB0aGlzLnBhcmVudEluamVjdG9yLFxuICAgICAgbmFtZTogJ0Rvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXInLFxuICAgIH0pO1xuXG4gICAgY29uc3QgY29tcG9uZW50UmVmID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmNyZWF0ZShcbiAgICAgIGNoaWxkSW5qZWN0b3IsXG4gICAgICBwcm9qZWN0YWJsZU5vZGVzLFxuICAgICAgdGhpcy5lbGVtZW50WzBdLFxuICAgICk7XG4gICAgY29uc3Qgdmlld0NoYW5nZURldGVjdG9yID0gY29tcG9uZW50UmVmLmluamVjdG9yLmdldChDaGFuZ2VEZXRlY3RvclJlZik7XG4gICAgY29uc3QgY2hhbmdlRGV0ZWN0b3IgPSBjb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWY7XG5cbiAgICAvLyB0ZXN0YWJpbGl0eSBob29rIGlzIGNvbW1vbmx5IGFkZGVkIGR1cmluZyBjb21wb25lbnQgYm9vdHN0cmFwIGluXG4gICAgLy8gcGFja2FnZXMvY29yZS9zcmMvYXBwbGljYXRpb25fcmVmLmJvb3RzdHJhcCgpXG4gICAgLy8gaW4gZG93bmdyYWRlZCBhcHBsaWNhdGlvbiwgY29tcG9uZW50IGNyZWF0aW9uIHdpbGwgdGFrZSBwbGFjZSBoZXJlIGFzIHdlbGwgYXMgYWRkaW5nIHRoZVxuICAgIC8vIHRlc3RhYmlsaXR5IGhvb2suXG4gICAgY29uc3QgdGVzdGFiaWxpdHkgPSBjb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5LCBudWxsKTtcbiAgICBpZiAodGVzdGFiaWxpdHkpIHtcbiAgICAgIGNvbXBvbmVudFJlZi5pbmplY3RvclxuICAgICAgICAuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgIC5yZWdpc3RlckFwcGxpY2F0aW9uKGNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LCB0ZXN0YWJpbGl0eSk7XG4gICAgfVxuXG4gICAgaG9va3VwTmdNb2RlbCh0aGlzLm5nTW9kZWwsIGNvbXBvbmVudFJlZi5pbnN0YW5jZSk7XG5cbiAgICByZXR1cm4ge3ZpZXdDaGFuZ2VEZXRlY3RvciwgY29tcG9uZW50UmVmLCBjaGFuZ2VEZXRlY3Rvcn07XG4gIH1cblxuICBwcml2YXRlIHNldHVwSW5wdXRzKFxuICAgIG1hbnVhbGx5QXR0YWNoVmlldzogYm9vbGVhbixcbiAgICBwcm9wYWdhdGVEaWdlc3QgPSB0cnVlLFxuICAgIHtjb21wb25lbnRSZWYsIGNoYW5nZURldGVjdG9yLCB2aWV3Q2hhbmdlRGV0ZWN0b3J9OiBDb21wb25lbnRJbmZvLFxuICApOiB2b2lkIHtcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cnM7XG4gICAgY29uc3QgaW5wdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmlucHV0cyB8fCBbXTtcbiAgICBmb3IgKGNvbnN0IGlucHV0IG9mIGlucHV0cykge1xuICAgICAgY29uc3QgaW5wdXRCaW5kaW5nID0gbmV3IFByb3BlcnR5QmluZGluZyhpbnB1dC5wcm9wTmFtZSwgaW5wdXQudGVtcGxhdGVOYW1lKTtcbiAgICAgIGxldCBleHByOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0QmluZGluZy5hdHRyKSkge1xuICAgICAgICBjb25zdCBvYnNlcnZlRm4gPSAoKHByb3AsIGlzU2lnbmFsKSA9PiB7XG4gICAgICAgICAgbGV0IHByZXZWYWx1ZSA9IElOSVRJQUxfVkFMVUU7XG4gICAgICAgICAgcmV0dXJuIChjdXJyVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5LCBib3RoIGAkb2JzZXJ2ZSgpYCBhbmQgYCR3YXRjaCgpYCB3aWxsIGNhbGwgdGhpcyBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghc3RyaWN0RXF1YWxzKHByZXZWYWx1ZSwgY3VyclZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAocHJldlZhbHVlID09PSBJTklUSUFMX1ZBTFVFKSB7XG4gICAgICAgICAgICAgICAgcHJldlZhbHVlID0gY3VyclZhbHVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbnB1dChjb21wb25lbnRSZWYsIHByb3AsIHByZXZWYWx1ZSwgY3VyclZhbHVlLCBpc1NpZ25hbCk7XG4gICAgICAgICAgICAgIHByZXZWYWx1ZSA9IGN1cnJWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KShpbnB1dEJpbmRpbmcucHJvcCwgaW5wdXQuaXNTaWduYWwpO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZShpbnB1dEJpbmRpbmcuYXR0ciwgb2JzZXJ2ZUZuKTtcblxuICAgICAgICAvLyBVc2UgYCR3YXRjaCgpYCAoaW4gYWRkaXRpb24gdG8gYCRvYnNlcnZlKClgKSBpbiBvcmRlciB0byBpbml0aWFsaXplIHRoZSBpbnB1dCBpbiB0aW1lXG4gICAgICAgIC8vIGZvciBgbmdPbkNoYW5nZXMoKWAuIFRoaXMgaXMgbmVjZXNzYXJ5IGlmIHdlIGFyZSBhbHJlYWR5IGluIGEgYCRkaWdlc3RgLCB3aGljaCBtZWFucyB0aGF0XG4gICAgICAgIC8vIGBuZ09uQ2hhbmdlcygpYCAod2hpY2ggaXMgY2FsbGVkIGJ5IGEgd2F0Y2hlcikgd2lsbCBydW4gYmVmb3JlIHRoZSBgJG9ic2VydmUoKWAgY2FsbGJhY2suXG4gICAgICAgIGxldCB1bndhdGNoOiBGdW5jdGlvbiB8IG51bGwgPSB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgICAgdW53YXRjaCEoKTtcbiAgICAgICAgICB1bndhdGNoID0gbnVsbDtcbiAgICAgICAgICBvYnNlcnZlRm4oYXR0cnNbaW5wdXRCaW5kaW5nLmF0dHJdKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0QmluZGluZy5iaW5kQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0QmluZGluZy5iaW5kQXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0QmluZGluZy5icmFja2V0QXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0QmluZGluZy5icmFja2V0QXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0QmluZGluZy5iaW5kb25BdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXRCaW5kaW5nLmJpbmRvbkF0dHJdO1xuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dEJpbmRpbmcuYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0QmluZGluZy5icmFja2V0UGFyZW5BdHRyXTtcbiAgICAgIH1cbiAgICAgIGlmIChleHByICE9IG51bGwpIHtcbiAgICAgICAgY29uc3Qgd2F0Y2hGbiA9IChcbiAgICAgICAgICAocHJvcCwgaXNTaWduYWwpID0+IChjdXJyVmFsdWU6IHVua25vd24sIHByZXZWYWx1ZTogdW5rbm93bikgPT5cbiAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQoY29tcG9uZW50UmVmLCBwcm9wLCBwcmV2VmFsdWUsIGN1cnJWYWx1ZSwgaXNTaWduYWwpXG4gICAgICAgICkoaW5wdXRCaW5kaW5nLnByb3AsIGlucHV0LmlzU2lnbmFsKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goZXhwciwgd2F0Y2hGbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW52b2tlIGBuZ09uQ2hhbmdlcygpYCBhbmQgQ2hhbmdlIERldGVjdGlvbiAod2hlbiBuZWNlc3NhcnkpXG4gICAgY29uc3QgZGV0ZWN0Q2hhbmdlcyA9ICgpID0+IGNoYW5nZURldGVjdG9yLmRldGVjdENoYW5nZXMoKTtcbiAgICBjb25zdCBwcm90b3R5cGUgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZS5wcm90b3R5cGU7XG4gICAgdGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzID0gISEocHJvdG90eXBlICYmICg8T25DaGFuZ2VzPnByb3RvdHlwZSkubmdPbkNoYW5nZXMpO1xuXG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goXG4gICAgICAoKSA9PiB0aGlzLmlucHV0Q2hhbmdlQ291bnQsXG4gICAgICB0aGlzLndyYXBDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWBcbiAgICAgICAgaWYgKHRoaXMuaW1wbGVtZW50c09uQ2hhbmdlcykge1xuICAgICAgICAgIGNvbnN0IGlucHV0Q2hhbmdlcyA9IHRoaXMuaW5wdXRDaGFuZ2VzO1xuICAgICAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzID0ge307XG4gICAgICAgICAgKDxPbkNoYW5nZXM+Y29tcG9uZW50UmVmLmluc3RhbmNlKS5uZ09uQ2hhbmdlcyhpbnB1dENoYW5nZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmlld0NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuXG4gICAgICAgIC8vIElmIG9wdGVkIG91dCBvZiBwcm9wYWdhdGluZyBkaWdlc3RzLCBpbnZva2UgY2hhbmdlIGRldGVjdGlvbiB3aGVuIGlucHV0cyBjaGFuZ2UuXG4gICAgICAgIGlmICghcHJvcGFnYXRlRGlnZXN0KSB7XG4gICAgICAgICAgZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuXG4gICAgLy8gSWYgbm90IG9wdGVkIG91dCBvZiBwcm9wYWdhdGluZyBkaWdlc3RzLCBpbnZva2UgY2hhbmdlIGRldGVjdGlvbiBvbiBldmVyeSBkaWdlc3RcbiAgICBpZiAocHJvcGFnYXRlRGlnZXN0KSB7XG4gICAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCh0aGlzLndyYXBDYWxsYmFjayhkZXRlY3RDaGFuZ2VzKSk7XG4gICAgfVxuXG4gICAgLy8gSWYgbmVjZXNzYXJ5LCBhdHRhY2ggdGhlIHZpZXcgc28gdGhhdCBpdCB3aWxsIGJlIGRpcnR5LWNoZWNrZWQuXG4gICAgLy8gKEFsbG93IHRpbWUgZm9yIHRoZSBpbml0aWFsIGlucHV0IHZhbHVlcyB0byBiZSBzZXQgYW5kIGBuZ09uQ2hhbmdlcygpYCB0byBiZSBjYWxsZWQuKVxuICAgIGlmIChtYW51YWxseUF0dGFjaFZpZXcgfHwgIXByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgbGV0IHVud2F0Y2g6IEZ1bmN0aW9uIHwgbnVsbCA9IHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgdW53YXRjaCEoKTtcbiAgICAgICAgdW53YXRjaCA9IG51bGw7XG5cbiAgICAgICAgY29uc3QgYXBwUmVmID0gdGhpcy5wYXJlbnRJbmplY3Rvci5nZXQ8QXBwbGljYXRpb25SZWY+KEFwcGxpY2F0aW9uUmVmKTtcbiAgICAgICAgYXBwUmVmLmF0dGFjaFZpZXcoY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBPdXRwdXRzKGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT4pIHtcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cnM7XG4gICAgY29uc3Qgb3V0cHV0cyA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5vdXRwdXRzIHx8IFtdO1xuICAgIGZvciAoY29uc3Qgb3V0cHV0IG9mIG91dHB1dHMpIHtcbiAgICAgIGNvbnN0IG91dHB1dEJpbmRpbmdzID0gbmV3IFByb3BlcnR5QmluZGluZyhvdXRwdXQucHJvcE5hbWUsIG91dHB1dC50ZW1wbGF0ZU5hbWUpO1xuICAgICAgY29uc3QgYmluZG9uQXR0ciA9IG91dHB1dEJpbmRpbmdzLmJpbmRvbkF0dHIuc3Vic3RyaW5nKFxuICAgICAgICAwLFxuICAgICAgICBvdXRwdXRCaW5kaW5ncy5iaW5kb25BdHRyLmxlbmd0aCAtIDYsXG4gICAgICApO1xuICAgICAgY29uc3QgYnJhY2tldFBhcmVuQXR0ciA9IGBbKCR7b3V0cHV0QmluZGluZ3MuYnJhY2tldFBhcmVuQXR0ci5zdWJzdHJpbmcoXG4gICAgICAgIDIsXG4gICAgICAgIG91dHB1dEJpbmRpbmdzLmJyYWNrZXRQYXJlbkF0dHIubGVuZ3RoIC0gOCxcbiAgICAgICl9KV1gO1xuICAgICAgLy8gb3JkZXIgYmVsb3cgaXMgaW1wb3J0YW50IC0gZmlyc3QgdXBkYXRlIGJpbmRpbmdzIHRoZW4gZXZhbHVhdGUgZXhwcmVzc2lvbnNcbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShiaW5kb25BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KGNvbXBvbmVudFJlZiwgb3V0cHV0QmluZGluZ3MsIGF0dHJzW2JpbmRvbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShicmFja2V0UGFyZW5BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KGNvbXBvbmVudFJlZiwgb3V0cHV0QmluZGluZ3MsIGF0dHJzW2JyYWNrZXRQYXJlbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXRCaW5kaW5ncy5vbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQoY29tcG9uZW50UmVmLCBvdXRwdXRCaW5kaW5ncywgYXR0cnNbb3V0cHV0QmluZGluZ3Mub25BdHRyXSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkob3V0cHV0QmluZGluZ3MucGFyZW5BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KGNvbXBvbmVudFJlZiwgb3V0cHV0QmluZGluZ3MsIGF0dHJzW291dHB1dEJpbmRpbmdzLnBhcmVuQXR0cl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3Vic2NyaWJlVG9PdXRwdXQoXG4gICAgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PixcbiAgICBvdXRwdXQ6IFByb3BlcnR5QmluZGluZyxcbiAgICBleHByOiBzdHJpbmcsXG4gICAgaXNBc3NpZ25tZW50OiBib29sZWFuID0gZmFsc2UsXG4gICkge1xuICAgIGNvbnN0IGdldHRlciA9IHRoaXMuJHBhcnNlKGV4cHIpO1xuICAgIGNvbnN0IHNldHRlciA9IGdldHRlci5hc3NpZ247XG4gICAgaWYgKGlzQXNzaWdubWVudCAmJiAhc2V0dGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cHJlc3Npb24gJyR7ZXhwcn0nIGlzIG5vdCBhc3NpZ25hYmxlIWApO1xuICAgIH1cbiAgICBjb25zdCBlbWl0dGVyID0gY29tcG9uZW50UmVmLmluc3RhbmNlW291dHB1dC5wcm9wXSBhcyBFdmVudEVtaXR0ZXI8YW55PjtcbiAgICBpZiAoZW1pdHRlcikge1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gZW1pdHRlci5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiBpc0Fzc2lnbm1lbnRcbiAgICAgICAgICA/ICh2OiBhbnkpID0+IHNldHRlciEodGhpcy5zY29wZSwgdilcbiAgICAgICAgICA6ICh2OiBhbnkpID0+IGdldHRlcih0aGlzLnNjb3BlLCB7JyRldmVudCc6IHZ9KSxcbiAgICAgIH0pO1xuICAgICAgY29tcG9uZW50UmVmLm9uRGVzdHJveSgoKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYE1pc3NpbmcgZW1pdHRlciAnJHtvdXRwdXQucHJvcH0nIG9uIGNvbXBvbmVudCAnJHtnZXRUeXBlTmFtZShcbiAgICAgICAgICB0aGlzLmNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZSxcbiAgICAgICAgKX0nIWAsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJDbGVhbnVwKGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT4pIHtcbiAgICBjb25zdCB0ZXN0YWJpbGl0eVJlZ2lzdHJ5ID0gY29tcG9uZW50UmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KTtcbiAgICBjb25zdCBkZXN0cm95Q29tcG9uZW50UmVmID0gdGhpcy53cmFwQ2FsbGJhY2soKCkgPT4gY29tcG9uZW50UmVmLmRlc3Ryb3koKSk7XG4gICAgbGV0IGRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5lbGVtZW50Lm9uISgnJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAvLyBUaGUgYCRkZXN0cm95YCBldmVudCBtYXkgaGF2ZSBiZWVuIHRyaWdnZXJlZCBieSB0aGUgYGNsZWFuRGF0YSgpYCBjYWxsIGluIHRoZVxuICAgICAgLy8gYGNvbXBvbmVudFNjb3BlYCBgJGRlc3Ryb3lgIGhhbmRsZXIgYmVsb3cuIEluIHRoYXQgY2FzZSwgd2UgZG9uJ3Qgd2FudCB0byBjYWxsXG4gICAgICAvLyBgY29tcG9uZW50U2NvcGUuJGRlc3Ryb3koKWAgYWdhaW4uXG4gICAgICBpZiAoIWRlc3Ryb3llZCkgdGhpcy5jb21wb25lbnRTY29wZS4kZGVzdHJveSgpO1xuICAgIH0pO1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICAgIGlmICghZGVzdHJveWVkKSB7XG4gICAgICAgIGRlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIHRlc3RhYmlsaXR5UmVnaXN0cnkudW5yZWdpc3RlckFwcGxpY2F0aW9uKGNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcblxuICAgICAgICAvLyBUaGUgYGNvbXBvbmVudFNjb3BlYCBtaWdodCBiZSBnZXR0aW5nIGRlc3Ryb3llZCwgYmVjYXVzZSBhbiBhbmNlc3RvciBlbGVtZW50IGlzIGJlaW5nXG4gICAgICAgIC8vIHJlbW92ZWQvZGVzdHJveWVkLiBJZiB0aGF0IGlzIHRoZSBjYXNlLCBqcUxpdGUvalF1ZXJ5IHdvdWxkIG5vcm1hbGx5IGludm9rZSBgY2xlYW5EYXRhKClgXG4gICAgICAgIC8vIG9uIHRoZSByZW1vdmVkIGVsZW1lbnQgYW5kIGFsbCBkZXNjZW5kYW50cy5cbiAgICAgICAgLy8gICBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvMmU3MmVhMTNmYTk4YmViZjZlZDRiNWUzYzQ1ZWFmNWY5OTBlZDE2Zi9zcmMvanFMaXRlLmpzI0wzNDktTDM1NVxuICAgICAgICAvLyAgIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L2Jsb2IvNjk4NGQxNzQ3NjIzZGJjNWU4N2ZkNmMyNjFhNWI2YjE2MjhjMTA3Yy9zcmMvbWFuaXB1bGF0aW9uLmpzI0wxODJcbiAgICAgICAgLy9cbiAgICAgICAgLy8gSGVyZSwgaG93ZXZlciwgYGRlc3Ryb3lDb21wb25lbnRSZWYoKWAgbWF5IHVuZGVyIHNvbWUgY2lyY3Vtc3RhbmNlcyByZW1vdmUgdGhlIGVsZW1lbnRcbiAgICAgICAgLy8gZnJvbSB0aGUgRE9NIGFuZCB0aGVyZWZvcmUgaXQgd2lsbCBubyBsb25nZXIgYmUgYSBkZXNjZW5kYW50IG9mIHRoZSByZW1vdmVkIGVsZW1lbnQgd2hlblxuICAgICAgICAvLyBgY2xlYW5EYXRhKClgIGlzIGNhbGxlZC4gVGhpcyB3b3VsZCByZXN1bHQgaW4gYSBtZW1vcnkgbGVhaywgYmVjYXVzZSB0aGUgZWxlbWVudCdzIGRhdGFcbiAgICAgICAgLy8gYW5kIGV2ZW50IGhhbmRsZXJzIChhbmQgYWxsIG9iamVjdHMgZGlyZWN0bHkgb3IgaW5kaXJlY3RseSByZWZlcmVuY2VkIGJ5IHRoZW0pIHdvdWxkIGJlXG4gICAgICAgIC8vIHJldGFpbmVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUbyBlbnN1cmUgdGhlIGVsZW1lbnQgaXMgYWx3YXlzIHByb3Blcmx5IGNsZWFuZWQgdXAsIHdlIG1hbnVhbGx5IGNhbGwgYGNsZWFuRGF0YSgpYCBvblxuICAgICAgICAvLyB0aGlzIGVsZW1lbnQgYW5kIGl0cyBkZXNjZW5kYW50cyBiZWZvcmUgZGVzdHJveWluZyB0aGUgYENvbXBvbmVudFJlZmAuXG4gICAgICAgIGNsZWFuRGF0YSh0aGlzLmVsZW1lbnRbMF0pO1xuXG4gICAgICAgIGRlc3Ryb3lDb21wb25lbnRSZWYoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlSW5wdXQoXG4gICAgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PixcbiAgICBwcm9wOiBzdHJpbmcsXG4gICAgcHJldlZhbHVlOiBhbnksXG4gICAgY3VyclZhbHVlOiBhbnksXG4gICAgaXNTaWduYWw6IGJvb2xlYW4sXG4gICkge1xuICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzW3Byb3BdID0gbmV3IFNpbXBsZUNoYW5nZShwcmV2VmFsdWUsIGN1cnJWYWx1ZSwgcHJldlZhbHVlID09PSBjdXJyVmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuaW5wdXRDaGFuZ2VDb3VudCsrO1xuICAgIGlmIChpc1NpZ25hbCAmJiAhdGhpcy51bnNhZmVseU92ZXJ3cml0ZVNpZ25hbElucHV0cykge1xuICAgICAgY29uc3Qgbm9kZSA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZVtwcm9wXVtTSUdOQUxdIGFzIElucHV0U2lnbmFsTm9kZTx1bmtub3duLCB1bmtub3duPjtcbiAgICAgIG5vZGUuYXBwbHlWYWx1ZVRvSW5wdXRTaWduYWwobm9kZSwgY3VyclZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29tcG9uZW50UmVmLmluc3RhbmNlW3Byb3BdID0gY3VyclZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCkge1xuICAgIGxldCBuZ0NvbnRlbnRTZWxlY3RvcnMgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkubmdDb250ZW50U2VsZWN0b3JzO1xuICAgIHJldHVybiBncm91cE5vZGVzQnlTZWxlY3RvcihuZ0NvbnRlbnRTZWxlY3RvcnMsIHRoaXMuZWxlbWVudC5jb250ZW50cyEoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBHcm91cCBhIHNldCBvZiBET00gbm9kZXMgaW50byBgbmdDb250ZW50YCBncm91cHMsIGJhc2VkIG9uIHRoZSBnaXZlbiBjb250ZW50IHNlbGVjdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwTm9kZXNCeVNlbGVjdG9yKG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10sIG5vZGVzOiBOb2RlW10pOiBOb2RlW11bXSB7XG4gIGNvbnN0IHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDAsIGlpID0gbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aDsgaSA8IGlpOyArK2kpIHtcbiAgICBwcm9qZWN0YWJsZU5vZGVzW2ldID0gW107XG4gIH1cblxuICBmb3IgKGxldCBqID0gMCwgamogPSBub2Rlcy5sZW5ndGg7IGogPCBqajsgKytqKSB7XG4gICAgY29uc3Qgbm9kZSA9IG5vZGVzW2pdO1xuICAgIGNvbnN0IG5nQ29udGVudEluZGV4ID0gZmluZE1hdGNoaW5nTmdDb250ZW50SW5kZXgobm9kZSwgbmdDb250ZW50U2VsZWN0b3JzKTtcbiAgICBpZiAobmdDb250ZW50SW5kZXggIT0gbnVsbCkge1xuICAgICAgcHJvamVjdGFibGVOb2Rlc1tuZ0NvbnRlbnRJbmRleF0ucHVzaChub2RlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJvamVjdGFibGVOb2Rlcztcbn1cblxuZnVuY3Rpb24gZmluZE1hdGNoaW5nTmdDb250ZW50SW5kZXgoZWxlbWVudDogYW55LCBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdKTogbnVtYmVyIHwgbnVsbCB7XG4gIGNvbnN0IG5nQ29udGVudEluZGljZXM6IG51bWJlcltdID0gW107XG4gIGxldCB3aWxkY2FyZE5nQ29udGVudEluZGV4OiBudW1iZXIgPSAtMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IG5nQ29udGVudFNlbGVjdG9yc1tpXTtcbiAgICBpZiAoc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IGk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXRjaGVzU2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKSB7XG4gICAgICAgIG5nQ29udGVudEluZGljZXMucHVzaChpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmdDb250ZW50SW5kaWNlcy5zb3J0KCk7XG5cbiAgaWYgKHdpbGRjYXJkTmdDb250ZW50SW5kZXggIT09IC0xKSB7XG4gICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKHdpbGRjYXJkTmdDb250ZW50SW5kZXgpO1xuICB9XG4gIHJldHVybiBuZ0NvbnRlbnRJbmRpY2VzLmxlbmd0aCA/IG5nQ29udGVudEluZGljZXNbMF0gOiBudWxsO1xufVxuXG5mdW5jdGlvbiBtYXRjaGVzU2VsZWN0b3IoZWw6IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBlbFByb3RvID0gPGFueT5FbGVtZW50LnByb3RvdHlwZTtcblxuICByZXR1cm4gZWwubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFXG4gICAgPyAvLyBtYXRjaGVzIGlzIHN1cHBvcnRlZCBieSBhbGwgYnJvd3NlcnMgZnJvbSAyMDE0IG9ud2FyZHMgZXhjZXB0IG5vbi1jaHJvbWl1bSBlZGdlXG4gICAgICAoZWxQcm90by5tYXRjaGVzID8/IGVsUHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IpLmNhbGwoZWwsIHNlbGVjdG9yKVxuICAgIDogZmFsc2U7XG59XG5cbmludGVyZmFjZSBDb21wb25lbnRJbmZvIHtcbiAgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PjtcbiAgY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmO1xuICB2aWV3Q2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmO1xufVxuIl19