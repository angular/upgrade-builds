/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ApplicationRef, ChangeDetectorRef, Injector, SimpleChange, Testability, TestabilityRegistry } from '@angular/core';
import { PropertyBinding } from './component_info';
import { $SCOPE } from './constants';
import { getComponentName, hookupNgModel, strictEquals } from './util';
const /** @type {?} */ INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
export class DowngradeComponentAdapter {
    /**
     * @param {?} element
     * @param {?} attrs
     * @param {?} scope
     * @param {?} ngModel
     * @param {?} parentInjector
     * @param {?} $injector
     * @param {?} $compile
     * @param {?} $parse
     * @param {?} componentFactory
     * @param {?} wrapCallback
     */
    constructor(element, attrs, scope, ngModel, parentInjector, $injector, $compile, $parse, componentFactory, wrapCallback) {
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.ngModel = ngModel;
        this.parentInjector = parentInjector;
        this.$injector = $injector;
        this.$compile = $compile;
        this.$parse = $parse;
        this.componentFactory = componentFactory;
        this.wrapCallback = wrapCallback;
        this.implementsOnChanges = false;
        this.inputChangeCount = 0;
        this.inputChanges = {};
        this.componentScope = scope.$new();
    }
    /**
     * @return {?}
     */
    compileContents() {
        const /** @type {?} */ compiledProjectableNodes = [];
        const /** @type {?} */ projectableNodes = this.groupProjectableNodes();
        const /** @type {?} */ linkFns = projectableNodes.map(nodes => this.$compile(nodes)); /** @type {?} */
        ((this.element.empty))();
        linkFns.forEach(linkFn => {
            linkFn(this.scope, (clone) => {
                compiledProjectableNodes.push(clone); /** @type {?} */
                ((this.element.append))(clone);
            });
        });
        return compiledProjectableNodes;
    }
    /**
     * @param {?} projectableNodes
     * @return {?}
     */
    createComponent(projectableNodes) {
        const /** @type {?} */ providers = [{ provide: $SCOPE, useValue: this.componentScope }];
        const /** @type {?} */ childInjector = Injector.create({ providers: providers, parent: this.parentInjector, name: 'DowngradeComponentAdapter' });
        this.componentRef =
            this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        this.viewChangeDetector = this.componentRef.injector.get(ChangeDetectorRef);
        this.changeDetector = this.componentRef.changeDetectorRef;
        this.component = this.componentRef.instance;
        // testability hook is commonly added during component bootstrap in
        // packages/core/src/application_ref.bootstrap()
        // in downgraded application, component creation will take place here as well as adding the
        // testability hook.
        const /** @type {?} */ testability = this.componentRef.injector.get(Testability, null);
        if (testability) {
            this.componentRef.injector.get(TestabilityRegistry)
                .registerApplication(this.componentRef.location.nativeElement, testability);
        }
        hookupNgModel(this.ngModel, this.component);
    }
    /**
     * @param {?} needsNgZone
     * @param {?=} propagateDigest
     * @return {?}
     */
    setupInputs(needsNgZone, propagateDigest = true) {
        const /** @type {?} */ attrs = this.attrs;
        const /** @type {?} */ inputs = this.componentFactory.inputs || [];
        for (let /** @type {?} */ i = 0; i < inputs.length; i++) {
            const /** @type {?} */ input = new PropertyBinding(inputs[i].propName, inputs[i].templateName);
            let /** @type {?} */ expr = null;
            if (attrs.hasOwnProperty(input.attr)) {
                const /** @type {?} */ observeFn = (prop => {
                    let /** @type {?} */ prevValue = INITIAL_VALUE;
                    return (currValue) => {
                        // Initially, both `$observe()` and `$watch()` will call this function.
                        if (!strictEquals(prevValue, currValue)) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            this.updateInput(prop, prevValue, currValue);
                            prevValue = currValue;
                        }
                    };
                })(input.prop);
                attrs.$observe(input.attr, observeFn);
                // Use `$watch()` (in addition to `$observe()`) in order to initialize the input in time
                // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
                // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
                let /** @type {?} */ unwatch = this.componentScope.$watch(() => {
                    /** @type {?} */ ((unwatch))();
                    unwatch = null;
                    observeFn(attrs[input.attr]);
                });
            }
            else if (attrs.hasOwnProperty(input.bindAttr)) {
                expr = attrs[input.bindAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketAttr)) {
                expr = attrs[input.bracketAttr];
            }
            else if (attrs.hasOwnProperty(input.bindonAttr)) {
                expr = attrs[input.bindonAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
                expr = attrs[input.bracketParenAttr];
            }
            if (expr != null) {
                const /** @type {?} */ watchFn = (prop => (currValue, prevValue) => this.updateInput(prop, prevValue, currValue))(input.prop);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        // Invoke `ngOnChanges()` and Change Detection (when necessary)
        const /** @type {?} */ detectChanges = () => this.changeDetector.detectChanges();
        const /** @type {?} */ prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && (/** @type {?} */ (prototype)).ngOnChanges);
        this.componentScope.$watch(() => this.inputChangeCount, this.wrapCallback(() => {
            // Invoke `ngOnChanges()`
            if (this.implementsOnChanges) {
                const /** @type {?} */ inputChanges = this.inputChanges;
                this.inputChanges = {};
                (/** @type {?} */ (this.component)).ngOnChanges(/** @type {?} */ ((inputChanges)));
            }
            this.viewChangeDetector.markForCheck();
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
        if (needsNgZone || !propagateDigest) {
            let /** @type {?} */ unwatch = this.componentScope.$watch(() => {
                /** @type {?} */ ((unwatch))();
                unwatch = null;
                const /** @type {?} */ appRef = this.parentInjector.get(ApplicationRef);
                appRef.attachView(this.componentRef.hostView);
            });
        }
    }
    /**
     * @return {?}
     */
    setupOutputs() {
        const /** @type {?} */ attrs = this.attrs;
        const /** @type {?} */ outputs = this.componentFactory.outputs || [];
        for (let /** @type {?} */ j = 0; j < outputs.length; j++) {
            const /** @type {?} */ output = new PropertyBinding(outputs[j].propName, outputs[j].templateName);
            const /** @type {?} */ bindonAttr = output.bindonAttr.substring(0, output.bindonAttr.length - 6);
            const /** @type {?} */ bracketParenAttr = `[(${output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8)})]`;
            // order below is important - first update bindings then evaluate expressions
            if (attrs.hasOwnProperty(bindonAttr)) {
                this.subscribeToOutput(output, attrs[bindonAttr], true);
            }
            if (attrs.hasOwnProperty(bracketParenAttr)) {
                this.subscribeToOutput(output, attrs[bracketParenAttr], true);
            }
            if (attrs.hasOwnProperty(output.onAttr)) {
                this.subscribeToOutput(output, attrs[output.onAttr]);
            }
            if (attrs.hasOwnProperty(output.parenAttr)) {
                this.subscribeToOutput(output, attrs[output.parenAttr]);
            }
        }
    }
    /**
     * @param {?} output
     * @param {?} expr
     * @param {?=} isAssignment
     * @return {?}
     */
    subscribeToOutput(output, expr, isAssignment = false) {
        const /** @type {?} */ getter = this.$parse(expr);
        const /** @type {?} */ setter = getter.assign;
        if (isAssignment && !setter) {
            throw new Error(`Expression '${expr}' is not assignable!`);
        }
        const /** @type {?} */ emitter = /** @type {?} */ (this.component[output.prop]);
        if (emitter) {
            emitter.subscribe({
                next: isAssignment ? (v) => /** @type {?} */ ((setter))(this.scope, v) :
                    (v) => getter(this.scope, { '$event': v })
            });
        }
        else {
            throw new Error(`Missing emitter '${output.prop}' on component '${getComponentName(this.componentFactory.componentType)}'!`);
        }
    }
    /**
     * @return {?}
     */
    registerCleanup() {
        const /** @type {?} */ destroyComponentRef = this.wrapCallback(() => this.componentRef.destroy());
        let /** @type {?} */ destroyed = false; /** @type {?} */
        ((this.element.on))('$destroy', () => this.componentScope.$destroy());
        this.componentScope.$on('$destroy', () => {
            if (!destroyed) {
                destroyed = true;
                this.componentRef.injector.get(TestabilityRegistry)
                    .unregisterApplication(this.componentRef.location.nativeElement);
                destroyComponentRef();
            }
        });
    }
    /**
     * @return {?}
     */
    getInjector() { return this.componentRef.injector; }
    /**
     * @param {?} prop
     * @param {?} prevValue
     * @param {?} currValue
     * @return {?}
     */
    updateInput(prop, prevValue, currValue) {
        if (this.implementsOnChanges) {
            this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
        }
        this.inputChangeCount++;
        this.component[prop] = currValue;
    }
    /**
     * @return {?}
     */
    groupProjectableNodes() {
        let /** @type {?} */ ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, /** @type {?} */ ((this.element.contents))());
    }
}
function DowngradeComponentAdapter_tsickle_Closure_declarations() {
    /** @type {?} */
    DowngradeComponentAdapter.prototype.implementsOnChanges;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.inputChangeCount;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.inputChanges;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.componentScope;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.componentRef;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.component;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.changeDetector;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.viewChangeDetector;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.element;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.attrs;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.scope;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.ngModel;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.parentInjector;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.$injector;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.$compile;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.$parse;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.componentFactory;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.wrapCallback;
}
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 * @param {?} ngContentSelectors
 * @param {?} nodes
 * @return {?}
 */
export function groupNodesBySelector(ngContentSelectors, nodes) {
    const /** @type {?} */ projectableNodes = [];
    let /** @type {?} */ wildcardNgContentIndex;
    for (let /** @type {?} */ i = 0, /** @type {?} */ ii = ngContentSelectors.length; i < ii; ++i) {
        projectableNodes[i] = [];
    }
    for (let /** @type {?} */ j = 0, /** @type {?} */ jj = nodes.length; j < jj; ++j) {
        const /** @type {?} */ node = nodes[j];
        const /** @type {?} */ ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
        if (ngContentIndex != null) {
            projectableNodes[ngContentIndex].push(node);
        }
    }
    return projectableNodes;
}
/**
 * @param {?} element
 * @param {?} ngContentSelectors
 * @return {?}
 */
function findMatchingNgContentIndex(element, ngContentSelectors) {
    const /** @type {?} */ ngContentIndices = [];
    let /** @type {?} */ wildcardNgContentIndex = -1;
    for (let /** @type {?} */ i = 0; i < ngContentSelectors.length; i++) {
        const /** @type {?} */ selector = ngContentSelectors[i];
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
let /** @type {?} */ _matches;
/**
 * @param {?} el
 * @param {?} selector
 * @return {?}
 */
function matchesSelector(el, selector) {
    if (!_matches) {
        const /** @type {?} */ elProto = /** @type {?} */ (Element.prototype);
        _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
            elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
    }
    return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxjQUFjLEVBQUUsaUJBQWlCLEVBQWdELFFBQVEsRUFBYSxZQUFZLEVBQWlDLFdBQVcsRUFBRSxtQkFBbUIsRUFBTyxNQUFNLGVBQWUsQ0FBQztBQUd4TixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNuQyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVyRSx1QkFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsTUFBTTs7Ozs7Ozs7Ozs7OztJQWFKLFlBQ1ksU0FBMkMsS0FBMEIsRUFDckUsT0FBK0IsT0FBbUMsRUFDbEUsZ0JBQWtDLFNBQW1DLEVBQ3JFLFVBQTJDLE1BQTZCLEVBQ3hFLGtCQUNBO1FBTEEsWUFBTyxHQUFQLE9BQU87UUFBb0MsVUFBSyxHQUFMLEtBQUssQ0FBcUI7UUFDckUsVUFBSyxHQUFMLEtBQUs7UUFBMEIsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7UUFDbEUsbUJBQWMsR0FBZCxjQUFjO1FBQW9CLGNBQVMsR0FBVCxTQUFTLENBQTBCO1FBQ3JFLGFBQVEsR0FBUixRQUFRO1FBQW1DLFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQ3hFLHFCQUFnQixHQUFoQixnQkFBZ0I7UUFDaEIsaUJBQVksR0FBWixZQUFZO21DQWxCTSxLQUFLO2dDQUNBLENBQUM7NEJBQ0UsRUFBRTtRQWlCdEMsSUFBSSxDQUFDLGNB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SUFFeEIsSUFBSSxzQkFBc0IsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNqQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztLQUMvQztJQUNELE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0NBQzdEO0FBRUQscUJBQUksUUFBa0QsQ0FBQzs7Ozs7O0FBRXZELHlCQUF5QixFQUFPLEVBQUUsUUFBZ0I7SUFDaEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNiLHVCQUFNLE9BQU8scUJBQVEsT0FBTyxDQUFDLFNBQVMsQ0FBQSxDQUFDO1FBQ3ZDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLGtCQUFrQjtZQUMvRSxPQUFPLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQztLQUM1RjtJQUNELE9BQU8sRUFBRSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0NBQ2hGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FwcGxpY2F0aW9uUmVmLCBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdG9yLCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlcywgU3RhdGljUHJvdmlkZXIsIFRlc3RhYmlsaXR5LCBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7UHJvcGVydHlCaW5kaW5nfSBmcm9tICcuL2NvbXBvbmVudF9pbmZvJztcbmltcG9ydCB7JFNDT1BFfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2dldENvbXBvbmVudE5hbWUsIGhvb2t1cE5nTW9kZWwsIHN0cmljdEVxdWFsc30gZnJvbSAnLi91dGlsJztcblxuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmV4cG9ydCBjbGFzcyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpbXBsZW1lbnRzT25DaGFuZ2VzID0gZmFsc2U7XG4gIHByaXZhdGUgaW5wdXRDaGFuZ2VDb3VudDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZXM6IFNpbXBsZUNoYW5nZXMgPSB7fTtcbiAgcHJpdmF0ZSBjb21wb25lbnRTY29wZTogYW5ndWxhci5JU2NvcGU7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNvbXBvbmVudFJlZiAhOiBDb21wb25lbnRSZWY8YW55PjtcbiAgcHJpdmF0ZSBjb21wb25lbnQ6IGFueTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgY2hhbmdlRGV0ZWN0b3IgITogQ2hhbmdlRGV0ZWN0b3JSZWY7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHZpZXdDaGFuZ2VEZXRlY3RvciAhOiBDaGFuZ2VEZXRlY3RvclJlZjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLFxuICAgICAgcHJpdmF0ZSBzY29wZTogYW5ndWxhci5JU2NvcGUsIHByaXZhdGUgbmdNb2RlbDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIsXG4gICAgICBwcml2YXRlIHBhcmVudEluamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSxcbiAgICAgIHByaXZhdGUgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLCBwcml2YXRlICRwYXJzZTogYW5ndWxhci5JUGFyc2VTZXJ2aWNlLFxuICAgICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4sXG4gICAgICBwcml2YXRlIHdyYXBDYWxsYmFjazogPFQ+KGNiOiAoKSA9PiBUKSA9PiAoKSA9PiBUKSB7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZSA9IHNjb3BlLiRuZXcoKTtcbiAgfVxuXG4gIGNvbXBpbGVDb250ZW50cygpOiBOb2RlW11bXSB7XG4gICAgY29uc3QgY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IFtdO1xuICAgIGNvbnN0IHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gdGhpcy5ncm91cFByb2plY3RhYmxlTm9kZXMoKTtcbiAgICBjb25zdCBsaW5rRm5zID0gcHJvamVjdGFibGVOb2Rlcy5tYXAobm9kZXMgPT4gdGhpcy4kY29tcGlsZShub2RlcykpO1xuXG4gICAgdGhpcy5lbGVtZW50LmVtcHR5ICEoKTtcblxuICAgIGxpbmtGbnMuZm9yRWFjaChsaW5rRm4gPT4ge1xuICAgICAgbGlua0ZuKHRoaXMuc2NvcGUsIChjbG9uZTogTm9kZVtdKSA9PiB7XG4gICAgICAgIGNvbXBpbGVkUHJvamVjdGFibGVOb2Rlcy5wdXNoKGNsb25lKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZCAhKGNsb25lKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbXBpbGVkUHJvamVjdGFibGVOb2RlcztcbiAgfVxuXG4gIGNyZWF0ZUNvbXBvbmVudChwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSkge1xuICAgIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFt7cHJvdmlkZTogJFNDT1BFLCB1c2VWYWx1ZTogdGhpcy5jb21wb25lbnRTY29wZX1dO1xuICAgIGNvbnN0IGNoaWxkSW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoXG4gICAgICAgIHtwcm92aWRlcnM6IHByb3ZpZGVycywgcGFyZW50OiB0aGlzLnBhcmVudEluamVjdG9yLCBuYW1lOiAnRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcid9KTtcblxuICAgIHRoaXMuY29tcG9uZW50UmVmID1cbiAgICAgICAgdGhpcy5jb21wb25lbnRGYWN0b3J5LmNyZWF0ZShjaGlsZEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzLCB0aGlzLmVsZW1lbnRbMF0pO1xuICAgIHRoaXMudmlld0NoYW5nZURldGVjdG9yID0gdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yID0gdGhpcy5jb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWY7XG4gICAgdGhpcy5jb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudFJlZi5pbnN0YW5jZTtcblxuICAgIC8vIHRlc3RhYmlsaXR5IGhvb2sgaXMgY29tbW9ubHkgYWRkZWQgZHVyaW5nIGNvbXBvbmVudCBib290c3RyYXAgaW5cbiAgICAvLyBwYWNrYWdlcy9jb3JlL3NyYy9hcHBsaWNhdGlvbl9yZWYuYm9vdHN0cmFwKClcbiAgICAvLyBpbiBkb3duZ3JhZGVkIGFwcGxpY2F0aW9uLCBjb21wb25lbnQgY3JlYXRpb24gd2lsbCB0YWtlIHBsYWNlIGhlcmUgYXMgd2VsbCBhcyBhZGRpbmcgdGhlXG4gICAgLy8gdGVzdGFiaWxpdHkgaG9vay5cbiAgICBjb25zdCB0ZXN0YWJpbGl0eSA9IHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eSwgbnVsbCk7XG4gICAgaWYgKHRlc3RhYmlsaXR5KSB7XG4gICAgICB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgICAucmVnaXN0ZXJBcHBsaWNhdGlvbih0aGlzLmNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LCB0ZXN0YWJpbGl0eSk7XG4gICAgfVxuXG4gICAgaG9va3VwTmdNb2RlbCh0aGlzLm5nTW9kZWwsIHRoaXMuY29tcG9uZW50KTtcbiAgfVxuXG4gIHNldHVwSW5wdXRzKG5lZWRzTmdab25lOiBib29sZWFuLCBwcm9wYWdhdGVEaWdlc3QgPSB0cnVlKTogdm9pZCB7XG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLmF0dHJzO1xuICAgIGNvbnN0IGlucHV0cyA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5pbnB1dHMgfHwgW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gbmV3IFByb3BlcnR5QmluZGluZyhpbnB1dHNbaV0ucHJvcE5hbWUsIGlucHV0c1tpXS50ZW1wbGF0ZU5hbWUpO1xuICAgICAgbGV0IGV4cHI6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmF0dHIpKSB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVGbiA9IChwcm9wID0+IHtcbiAgICAgICAgICBsZXQgcHJldlZhbHVlID0gSU5JVElBTF9WQUxVRTtcbiAgICAgICAgICByZXR1cm4gKGN1cnJWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyBJbml0aWFsbHksIGJvdGggYCRvYnNlcnZlKClgIGFuZCBgJHdhdGNoKClgIHdpbGwgY2FsbCB0aGlzIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFzdHJpY3RFcXVhbHMocHJldlZhbHVlLCBjdXJyVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGlmIChwcmV2VmFsdWUgPT09IElOSVRJQUxfVkFMVUUpIHtcbiAgICAgICAgICAgICAgICBwcmV2VmFsdWUgPSBjdXJyVmFsdWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0KHByb3AsIHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgICAgICAgcHJldlZhbHVlID0gY3VyclZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pKGlucHV0LnByb3ApO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZShpbnB1dC5hdHRyLCBvYnNlcnZlRm4pO1xuXG4gICAgICAgIC8vIFVzZSBgJHdhdGNoKClgIChpbiBhZGRpdGlvbiB0byBgJG9ic2VydmUoKWApIGluIG9yZGVyIHRvIGluaXRpYWxpemUgdGhlIGlucHV0IGluIHRpbWVcbiAgICAgICAgLy8gZm9yIGBuZ09uQ2hhbmdlcygpYC4gVGhpcyBpcyBuZWNlc3NhcnkgaWYgd2UgYXJlIGFscmVhZHkgaW4gYSBgJGRpZ2VzdGAsIHdoaWNoIG1lYW5zIHRoYXRcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgICh3aGljaCBpcyBjYWxsZWQgYnkgYSB3YXRjaGVyKSB3aWxsIHJ1biBiZWZvcmUgdGhlIGAkb2JzZXJ2ZSgpYCBjYWxsYmFjay5cbiAgICAgICAgbGV0IHVud2F0Y2g6IEZ1bmN0aW9ufG51bGwgPSB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgICAgdW53YXRjaCAhKCk7XG4gICAgICAgICAgdW53YXRjaCA9IG51bGw7XG4gICAgICAgICAgb2JzZXJ2ZUZuKGF0dHJzW2lucHV0LmF0dHJdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYmluZEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5iaW5kQXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJyYWNrZXRBdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXQuYnJhY2tldEF0dHJdO1xuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5iaW5kb25BdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXQuYmluZG9uQXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJyYWNrZXRQYXJlbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5icmFja2V0UGFyZW5BdHRyXTtcbiAgICAgIH1cbiAgICAgIGlmIChleHByICE9IG51bGwpIHtcbiAgICAgICAgY29uc3Qgd2F0Y2hGbiA9XG4gICAgICAgICAgICAocHJvcCA9PiAoY3VyclZhbHVlOiBhbnksIHByZXZWYWx1ZTogYW55KSA9PlxuICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0KHByb3AsIHByZXZWYWx1ZSwgY3VyclZhbHVlKSkoaW5wdXQucHJvcCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKGV4cHIsIHdhdGNoRm4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWAgYW5kIENoYW5nZSBEZXRlY3Rpb24gKHdoZW4gbmVjZXNzYXJ5KVxuICAgIGNvbnN0IGRldGVjdENoYW5nZXMgPSAoKSA9PiB0aGlzLmNoYW5nZURldGVjdG9yLmRldGVjdENoYW5nZXMoKTtcbiAgICBjb25zdCBwcm90b3R5cGUgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZS5wcm90b3R5cGU7XG4gICAgdGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzID0gISEocHJvdG90eXBlICYmICg8T25DaGFuZ2VzPnByb3RvdHlwZSkubmdPbkNoYW5nZXMpO1xuXG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5pbnB1dENoYW5nZUNvdW50LCB0aGlzLndyYXBDYWxsYmFjaygoKSA9PiB7XG4gICAgICAvLyBJbnZva2UgYG5nT25DaGFuZ2VzKClgXG4gICAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICAgIGNvbnN0IGlucHV0Q2hhbmdlcyA9IHRoaXMuaW5wdXRDaGFuZ2VzO1xuICAgICAgICB0aGlzLmlucHV0Q2hhbmdlcyA9IHt9O1xuICAgICAgICAoPE9uQ2hhbmdlcz50aGlzLmNvbXBvbmVudCkubmdPbkNoYW5nZXMoaW5wdXRDaGFuZ2VzICEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnZpZXdDaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcblxuICAgICAgLy8gSWYgb3B0ZWQgb3V0IG9mIHByb3BhZ2F0aW5nIGRpZ2VzdHMsIGludm9rZSBjaGFuZ2UgZGV0ZWN0aW9uIHdoZW4gaW5wdXRzIGNoYW5nZS5cbiAgICAgIGlmICghcHJvcGFnYXRlRGlnZXN0KSB7XG4gICAgICAgIGRldGVjdENoYW5nZXMoKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICAvLyBJZiBub3Qgb3B0ZWQgb3V0IG9mIHByb3BhZ2F0aW5nIGRpZ2VzdHMsIGludm9rZSBjaGFuZ2UgZGV0ZWN0aW9uIG9uIGV2ZXJ5IGRpZ2VzdFxuICAgIGlmIChwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKHRoaXMud3JhcENhbGxiYWNrKGRldGVjdENoYW5nZXMpKTtcbiAgICB9XG5cbiAgICAvLyBJZiBuZWNlc3NhcnksIGF0dGFjaCB0aGUgdmlldyBzbyB0aGF0IGl0IHdpbGwgYmUgZGlydHktY2hlY2tlZC5cbiAgICAvLyAoQWxsb3cgdGltZSBmb3IgdGhlIGluaXRpYWwgaW5wdXQgdmFsdWVzIHRvIGJlIHNldCBhbmQgYG5nT25DaGFuZ2VzKClgIHRvIGJlIGNhbGxlZC4pXG4gICAgaWYgKG5lZWRzTmdab25lIHx8ICFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIGxldCB1bndhdGNoOiBGdW5jdGlvbnxudWxsID0gdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgdW53YXRjaCA9IG51bGw7XG5cbiAgICAgICAgY29uc3QgYXBwUmVmID0gdGhpcy5wYXJlbnRJbmplY3Rvci5nZXQ8QXBwbGljYXRpb25SZWY+KEFwcGxpY2F0aW9uUmVmKTtcbiAgICAgICAgYXBwUmVmLmF0dGFjaFZpZXcodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0dXBPdXRwdXRzKCkge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBvdXRwdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm91dHB1dHMgfHwgW107XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBvdXRwdXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKG91dHB1dHNbal0ucHJvcE5hbWUsIG91dHB1dHNbal0udGVtcGxhdGVOYW1lKTtcbiAgICAgIGNvbnN0IGJpbmRvbkF0dHIgPSBvdXRwdXQuYmluZG9uQXR0ci5zdWJzdHJpbmcoMCwgb3V0cHV0LmJpbmRvbkF0dHIubGVuZ3RoIC0gNik7XG4gICAgICBjb25zdCBicmFja2V0UGFyZW5BdHRyID1cbiAgICAgICAgICBgWygke291dHB1dC5icmFja2V0UGFyZW5BdHRyLnN1YnN0cmluZygyLCBvdXRwdXQuYnJhY2tldFBhcmVuQXR0ci5sZW5ndGggLSA4KX0pXWA7XG4gICAgICAvLyBvcmRlciBiZWxvdyBpcyBpbXBvcnRhbnQgLSBmaXJzdCB1cGRhdGUgYmluZGluZ3MgdGhlbiBldmFsdWF0ZSBleHByZXNzaW9uc1xuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJpbmRvbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tiaW5kb25BdHRyXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW2JyYWNrZXRQYXJlbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXQub25BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbb3V0cHV0Lm9uQXR0cl0pO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dC5wYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tvdXRwdXQucGFyZW5BdHRyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVUb091dHB1dChvdXRwdXQ6IFByb3BlcnR5QmluZGluZywgZXhwcjogc3RyaW5nLCBpc0Fzc2lnbm1lbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGdldHRlciA9IHRoaXMuJHBhcnNlKGV4cHIpO1xuICAgIGNvbnN0IHNldHRlciA9IGdldHRlci5hc3NpZ247XG4gICAgaWYgKGlzQXNzaWdubWVudCAmJiAhc2V0dGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cHJlc3Npb24gJyR7ZXhwcn0nIGlzIG5vdCBhc3NpZ25hYmxlIWApO1xuICAgIH1cbiAgICBjb25zdCBlbWl0dGVyID0gdGhpcy5jb21wb25lbnRbb3V0cHV0LnByb3BdIGFzIEV2ZW50RW1pdHRlcjxhbnk+O1xuICAgIGlmIChlbWl0dGVyKSB7XG4gICAgICBlbWl0dGVyLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IGlzQXNzaWdubWVudCA/ICh2OiBhbnkpID0+IHNldHRlciAhKHRoaXMuc2NvcGUsIHYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHY6IGFueSkgPT4gZ2V0dGVyKHRoaXMuc2NvcGUsIHsnJGV2ZW50Jzogdn0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBNaXNzaW5nIGVtaXR0ZXIgJyR7b3V0cHV0LnByb3B9JyBvbiBjb21wb25lbnQgJyR7Z2V0Q29tcG9uZW50TmFtZSh0aGlzLmNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZSl9JyFgKTtcbiAgICB9XG4gIH1cblxuICByZWdpc3RlckNsZWFudXAoKSB7XG4gICAgY29uc3QgZGVzdHJveUNvbXBvbmVudFJlZiA9IHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHRoaXMuY29tcG9uZW50UmVmLmRlc3Ryb3koKSk7XG4gICAgbGV0IGRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5lbGVtZW50Lm9uICEoJyRkZXN0cm95JywgKCkgPT4gdGhpcy5jb21wb25lbnRTY29wZS4kZGVzdHJveSgpKTtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICBpZiAoIWRlc3Ryb3llZCkge1xuICAgICAgICBkZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgICAgIC51bnJlZ2lzdGVyQXBwbGljYXRpb24odGhpcy5jb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIGRlc3Ryb3lDb21wb25lbnRSZWYoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yOyB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVJbnB1dChwcm9wOiBzdHJpbmcsIHByZXZWYWx1ZTogYW55LCBjdXJyVmFsdWU6IGFueSkge1xuICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzW3Byb3BdID0gbmV3IFNpbXBsZUNoYW5nZShwcmV2VmFsdWUsIGN1cnJWYWx1ZSwgcHJldlZhbHVlID09PSBjdXJyVmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuaW5wdXRDaGFuZ2VDb3VudCsrO1xuICAgIHRoaXMuY29tcG9uZW50W3Byb3BdID0gY3VyclZhbHVlO1xuICB9XG5cbiAgZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCkge1xuICAgIGxldCBuZ0NvbnRlbnRTZWxlY3RvcnMgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkubmdDb250ZW50U2VsZWN0b3JzO1xuICAgIHJldHVybiBncm91cE5vZGVzQnlTZWxlY3RvcihuZ0NvbnRlbnRTZWxlY3RvcnMsIHRoaXMuZWxlbWVudC5jb250ZW50cyAhKCkpO1xuICB9XG59XG5cbi8qKlxuICogR3JvdXAgYSBzZXQgb2YgRE9NIG5vZGVzIGludG8gYG5nQ29udGVudGAgZ3JvdXBzLCBiYXNlZCBvbiB0aGUgZ2l2ZW4gY29udGVudCBzZWxlY3RvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cE5vZGVzQnlTZWxlY3RvcihuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdLCBub2RlczogTm9kZVtdKTogTm9kZVtdW10ge1xuICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IFtdO1xuICBsZXQgd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyO1xuXG4gIGZvciAobGV0IGkgPSAwLCBpaSA9IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkgPCBpaTsgKytpKSB7XG4gICAgcHJvamVjdGFibGVOb2Rlc1tpXSA9IFtdO1xuICB9XG5cbiAgZm9yIChsZXQgaiA9IDAsIGpqID0gbm9kZXMubGVuZ3RoOyBqIDwgamo7ICsraikge1xuICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tqXTtcbiAgICBjb25zdCBuZ0NvbnRlbnRJbmRleCA9IGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KG5vZGUsIG5nQ29udGVudFNlbGVjdG9ycyk7XG4gICAgaWYgKG5nQ29udGVudEluZGV4ICE9IG51bGwpIHtcbiAgICAgIHByb2plY3RhYmxlTm9kZXNbbmdDb250ZW50SW5kZXhdLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByb2plY3RhYmxlTm9kZXM7XG59XG5cbmZ1bmN0aW9uIGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KGVsZW1lbnQ6IGFueSwgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSk6IG51bWJlcnxudWxsIHtcbiAgY29uc3QgbmdDb250ZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgbGV0IHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlciA9IC0xO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gbmdDb250ZW50U2VsZWN0b3JzW2ldO1xuICAgIGlmIChzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gaTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hdGNoZXNTZWxlY3RvcihlbGVtZW50LCBzZWxlY3RvcikpIHtcbiAgICAgICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKGkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBuZ0NvbnRlbnRJbmRpY2VzLnNvcnQoKTtcblxuICBpZiAod2lsZGNhcmROZ0NvbnRlbnRJbmRleCAhPT0gLTEpIHtcbiAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2god2lsZGNhcmROZ0NvbnRlbnRJbmRleCk7XG4gIH1cbiAgcmV0dXJuIG5nQ29udGVudEluZGljZXMubGVuZ3RoID8gbmdDb250ZW50SW5kaWNlc1swXSA6IG51bGw7XG59XG5cbmxldCBfbWF0Y2hlczogKHRoaXM6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuZnVuY3Rpb24gbWF0Y2hlc1NlbGVjdG9yKGVsOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFfbWF0Y2hlcykge1xuICAgIGNvbnN0IGVsUHJvdG8gPSA8YW55PkVsZW1lbnQucHJvdG90eXBlO1xuICAgIF9tYXRjaGVzID0gZWxQcm90by5tYXRjaGVzIHx8IGVsUHJvdG8ubWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgIGVsUHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHwgZWxQcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xuICB9XG4gIHJldHVybiBlbC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUgPyBfbWF0Y2hlcy5jYWxsKGVsLCBzZWxlY3RvcikgOiBmYWxzZTtcbn1cbiJdfQ==