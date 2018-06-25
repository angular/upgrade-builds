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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxjQUFjLEVBQUUsaUJBQWlCLEVBQWdELFFBQVEsRUFBYSxZQUFZLEVBQWlDLFdBQVcsRUFBRSxtQkFBbUIsRUFBTyxNQUFNLGVBQWUsQ0FBQztBQUd4TixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNuQyxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVyRSx1QkFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsTUFBTTs7Ozs7Ozs7Ozs7OztJQVVKLFlBQ1ksU0FBMkMsS0FBMEIsRUFDckUsT0FBK0IsT0FBbUMsRUFDbEUsZ0JBQWtDLFNBQW1DLEVBQ3JFLFVBQTJDLE1BQTZCLEVBQ3hFLGtCQUNBO1FBTEEsWUFBTyxHQUFQLE9BQU87UUFBb0MsVUFBSyxHQUFMLEtBQUssQ0FBcUI7UUFDckUsVUFBSyxHQUFMLEtBQUs7UUFBMEIsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7UUFDbEUsbUJBQWMsR0FBZCxjQUFjO1FBQW9CLGNBQVMsR0FBVCxTQUFTLENBQTBCO1FBQ3JFLGFBQVEsR0FBUixRQUFRO1FBQW1DLFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQ3hFLHFCQUFnQixHQUFoQixnQkFBZ0I7UUFDaEIsaUJBQVksR0FBWixZQUFZO21DQWZNLEtBQUs7Z0NBQ0EsQ0FBQzs0QkFDRSxFQUFFO1FBY3RDLElBQUksQ0FBQyxjQUFj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RXhCLElBQUksc0JBQXNCLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDakMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7S0FDL0M7SUFDRCxPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztDQUM3RDtBQUVELHFCQUFJLFFBQWtELENBQUM7Ozs7OztBQUV2RCx5QkFBeUIsRUFBTyxFQUFFLFFBQWdCO0lBQ2hELElBQUksQ0FBQyxRQUFRLEVBQUU7UUFDYix1QkFBTSxPQUFPLHFCQUFRLE9BQU8sQ0FBQyxTQUFTLENBQUEsQ0FBQztRQUN2QyxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsZUFBZSxJQUFJLE9BQU8sQ0FBQyxrQkFBa0I7WUFDL0UsT0FBTyxDQUFDLGlCQUFpQixJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLENBQUMscUJBQXFCLENBQUM7S0FDNUY7SUFDRCxPQUFPLEVBQUUsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztDQUNoRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcHBsaWNhdGlvblJlZiwgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3RvciwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2UsIFNpbXBsZUNoYW5nZXMsIFN0YXRpY1Byb3ZpZGVyLCBUZXN0YWJpbGl0eSwgVGVzdGFiaWxpdHlSZWdpc3RyeSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQge1Byb3BlcnR5QmluZGluZ30gZnJvbSAnLi9jb21wb25lbnRfaW5mbyc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtnZXRDb21wb25lbnROYW1lLCBob29rdXBOZ01vZGVsLCBzdHJpY3RFcXVhbHN9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuXG5leHBvcnQgY2xhc3MgRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlciB7XG4gIHByaXZhdGUgaW1wbGVtZW50c09uQ2hhbmdlcyA9IGZhbHNlO1xuICBwcml2YXRlIGlucHV0Q2hhbmdlQ291bnQ6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgaW5wdXRDaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzID0ge307XG4gIHByaXZhdGUgY29tcG9uZW50U2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xuICBwcml2YXRlIGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT47XG4gIHByaXZhdGUgY29tcG9uZW50OiBhbnk7XG4gIHByaXZhdGUgY2hhbmdlRGV0ZWN0b3I6IENoYW5nZURldGVjdG9yUmVmO1xuICBwcml2YXRlIHZpZXdDaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyxcbiAgICAgIHByaXZhdGUgc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBwcml2YXRlIG5nTW9kZWw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyLFxuICAgICAgcHJpdmF0ZSBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsXG4gICAgICBwcml2YXRlICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSwgcHJpdmF0ZSAkcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSxcbiAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+LFxuICAgICAgcHJpdmF0ZSB3cmFwQ2FsbGJhY2s6IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT4gVCkge1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCk7XG4gIH1cblxuICBjb21waWxlQ29udGVudHMoKTogTm9kZVtdW10ge1xuICAgIGNvbnN0IGNvbXBpbGVkUHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IHRoaXMuZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCk7XG4gICAgY29uc3QgbGlua0ZucyA9IHByb2plY3RhYmxlTm9kZXMubWFwKG5vZGVzID0+IHRoaXMuJGNvbXBpbGUobm9kZXMpKTtcblxuICAgIHRoaXMuZWxlbWVudC5lbXB0eSAhKCk7XG5cbiAgICBsaW5rRm5zLmZvckVhY2gobGlua0ZuID0+IHtcbiAgICAgIGxpbmtGbih0aGlzLnNjb3BlLCAoY2xvbmU6IE5vZGVbXSkgPT4ge1xuICAgICAgICBjb21waWxlZFByb2plY3RhYmxlTm9kZXMucHVzaChjbG9uZSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmQgIShjbG9uZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb21waWxlZFByb2plY3RhYmxlTm9kZXM7XG4gIH1cblxuICBjcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2RlczogTm9kZVtdW10pIHtcbiAgICBjb25zdCBwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbe3Byb3ZpZGU6ICRTQ09QRSwgdXNlVmFsdWU6IHRoaXMuY29tcG9uZW50U2NvcGV9XTtcbiAgICBjb25zdCBjaGlsZEluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKFxuICAgICAgICB7cHJvdmlkZXJzOiBwcm92aWRlcnMsIHBhcmVudDogdGhpcy5wYXJlbnRJbmplY3RvciwgbmFtZTogJ0Rvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXInfSk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFJlZiA9XG4gICAgICAgIHRoaXMuY29tcG9uZW50RmFjdG9yeS5jcmVhdGUoY2hpbGRJbmplY3RvciwgcHJvamVjdGFibGVOb2RlcywgdGhpcy5lbGVtZW50WzBdKTtcbiAgICB0aGlzLnZpZXdDaGFuZ2VEZXRlY3RvciA9IHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChDaGFuZ2VEZXRlY3RvclJlZik7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvciA9IHRoaXMuY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmO1xuICAgIHRoaXMuY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRSZWYuaW5zdGFuY2U7XG5cbiAgICAvLyB0ZXN0YWJpbGl0eSBob29rIGlzIGNvbW1vbmx5IGFkZGVkIGR1cmluZyBjb21wb25lbnQgYm9vdHN0cmFwIGluXG4gICAgLy8gcGFja2FnZXMvY29yZS9zcmMvYXBwbGljYXRpb25fcmVmLmJvb3RzdHJhcCgpXG4gICAgLy8gaW4gZG93bmdyYWRlZCBhcHBsaWNhdGlvbiwgY29tcG9uZW50IGNyZWF0aW9uIHdpbGwgdGFrZSBwbGFjZSBoZXJlIGFzIHdlbGwgYXMgYWRkaW5nIHRoZVxuICAgIC8vIHRlc3RhYmlsaXR5IGhvb2suXG4gICAgY29uc3QgdGVzdGFiaWxpdHkgPSB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHksIG51bGwpO1xuICAgIGlmICh0ZXN0YWJpbGl0eSkge1xuICAgICAgdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24odGhpcy5jb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCwgdGVzdGFiaWxpdHkpO1xuICAgIH1cblxuICAgIGhvb2t1cE5nTW9kZWwodGhpcy5uZ01vZGVsLCB0aGlzLmNvbXBvbmVudCk7XG4gIH1cblxuICBzZXR1cElucHV0cyhuZWVkc05nWm9uZTogYm9vbGVhbiwgcHJvcGFnYXRlRGlnZXN0ID0gdHJ1ZSk6IHZvaWQge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBpbnB1dHMgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkuaW5wdXRzIHx8IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBpbnB1dCA9IG5ldyBQcm9wZXJ0eUJpbmRpbmcoaW5wdXRzW2ldLnByb3BOYW1lLCBpbnB1dHNbaV0udGVtcGxhdGVOYW1lKTtcbiAgICAgIGxldCBleHByOiBzdHJpbmd8bnVsbCA9IG51bGw7XG5cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5hdHRyKSkge1xuICAgICAgICBjb25zdCBvYnNlcnZlRm4gPSAocHJvcCA9PiB7XG4gICAgICAgICAgbGV0IHByZXZWYWx1ZSA9IElOSVRJQUxfVkFMVUU7XG4gICAgICAgICAgcmV0dXJuIChjdXJyVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5LCBib3RoIGAkb2JzZXJ2ZSgpYCBhbmQgYCR3YXRjaCgpYCB3aWxsIGNhbGwgdGhpcyBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghc3RyaWN0RXF1YWxzKHByZXZWYWx1ZSwgY3VyclZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAocHJldlZhbHVlID09PSBJTklUSUFMX1ZBTFVFKSB7XG4gICAgICAgICAgICAgICAgcHJldlZhbHVlID0gY3VyclZhbHVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbnB1dChwcm9wLCBwcmV2VmFsdWUsIGN1cnJWYWx1ZSk7XG4gICAgICAgICAgICAgIHByZXZWYWx1ZSA9IGN1cnJWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICB9KShpbnB1dC5wcm9wKTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoaW5wdXQuYXR0ciwgb2JzZXJ2ZUZuKTtcblxuICAgICAgICAvLyBVc2UgYCR3YXRjaCgpYCAoaW4gYWRkaXRpb24gdG8gYCRvYnNlcnZlKClgKSBpbiBvcmRlciB0byBpbml0aWFsaXplIHRoZSBpbnB1dCBpbiB0aW1lXG4gICAgICAgIC8vIGZvciBgbmdPbkNoYW5nZXMoKWAuIFRoaXMgaXMgbmVjZXNzYXJ5IGlmIHdlIGFyZSBhbHJlYWR5IGluIGEgYCRkaWdlc3RgLCB3aGljaCBtZWFucyB0aGF0XG4gICAgICAgIC8vIGBuZ09uQ2hhbmdlcygpYCAod2hpY2ggaXMgY2FsbGVkIGJ5IGEgd2F0Y2hlcikgd2lsbCBydW4gYmVmb3JlIHRoZSBgJG9ic2VydmUoKWAgY2FsbGJhY2suXG4gICAgICAgIGxldCB1bndhdGNoOiBGdW5jdGlvbnxudWxsID0gdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgICAgIHVud2F0Y2ggISgpO1xuICAgICAgICAgIHVud2F0Y2ggPSBudWxsO1xuICAgICAgICAgIG9ic2VydmVGbihhdHRyc1tpbnB1dC5hdHRyXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJpbmRBdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXQuYmluZEF0dHJdO1xuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5icmFja2V0QXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJyYWNrZXRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYmluZG9uQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJpbmRvbkF0dHJdO1xuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5icmFja2V0UGFyZW5BdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXQuYnJhY2tldFBhcmVuQXR0cl07XG4gICAgICB9XG4gICAgICBpZiAoZXhwciAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHdhdGNoRm4gPVxuICAgICAgICAgICAgKHByb3AgPT4gKGN1cnJWYWx1ZTogYW55LCBwcmV2VmFsdWU6IGFueSkgPT5cbiAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbnB1dChwcm9wLCBwcmV2VmFsdWUsIGN1cnJWYWx1ZSkpKGlucHV0LnByb3ApO1xuICAgICAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaChleHByLCB3YXRjaEZuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbnZva2UgYG5nT25DaGFuZ2VzKClgIGFuZCBDaGFuZ2UgRGV0ZWN0aW9uICh3aGVuIG5lY2Vzc2FyeSlcbiAgICBjb25zdCBkZXRlY3RDaGFuZ2VzID0gKCkgPT4gdGhpcy5jaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgY29uc3QgcHJvdG90eXBlID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUucHJvdG90eXBlO1xuICAgIHRoaXMuaW1wbGVtZW50c09uQ2hhbmdlcyA9ICEhKHByb3RvdHlwZSAmJiAoPE9uQ2hhbmdlcz5wcm90b3R5cGUpLm5nT25DaGFuZ2VzKTtcblxuICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHRoaXMuaW5wdXRDaGFuZ2VDb3VudCwgdGhpcy53cmFwQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgLy8gSW52b2tlIGBuZ09uQ2hhbmdlcygpYFxuICAgICAgaWYgKHRoaXMuaW1wbGVtZW50c09uQ2hhbmdlcykge1xuICAgICAgICBjb25zdCBpbnB1dENoYW5nZXMgPSB0aGlzLmlucHV0Q2hhbmdlcztcbiAgICAgICAgdGhpcy5pbnB1dENoYW5nZXMgPSB7fTtcbiAgICAgICAgKDxPbkNoYW5nZXM+dGhpcy5jb21wb25lbnQpLm5nT25DaGFuZ2VzKGlucHV0Q2hhbmdlcyAhKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy52aWV3Q2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG5cbiAgICAgIC8vIElmIG9wdGVkIG91dCBvZiBwcm9wYWdhdGluZyBkaWdlc3RzLCBpbnZva2UgY2hhbmdlIGRldGVjdGlvbiB3aGVuIGlucHV0cyBjaGFuZ2UuXG4gICAgICBpZiAoIXByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgICBkZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgLy8gSWYgbm90IG9wdGVkIG91dCBvZiBwcm9wYWdhdGluZyBkaWdlc3RzLCBpbnZva2UgY2hhbmdlIGRldGVjdGlvbiBvbiBldmVyeSBkaWdlc3RcbiAgICBpZiAocHJvcGFnYXRlRGlnZXN0KSB7XG4gICAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCh0aGlzLndyYXBDYWxsYmFjayhkZXRlY3RDaGFuZ2VzKSk7XG4gICAgfVxuXG4gICAgLy8gSWYgbmVjZXNzYXJ5LCBhdHRhY2ggdGhlIHZpZXcgc28gdGhhdCBpdCB3aWxsIGJlIGRpcnR5LWNoZWNrZWQuXG4gICAgLy8gKEFsbG93IHRpbWUgZm9yIHRoZSBpbml0aWFsIGlucHV0IHZhbHVlcyB0byBiZSBzZXQgYW5kIGBuZ09uQ2hhbmdlcygpYCB0byBiZSBjYWxsZWQuKVxuICAgIGlmIChuZWVkc05nWm9uZSB8fCAhcHJvcGFnYXRlRGlnZXN0KSB7XG4gICAgICBsZXQgdW53YXRjaDogRnVuY3Rpb258bnVsbCA9IHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgdW53YXRjaCAhKCk7XG4gICAgICAgIHVud2F0Y2ggPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IGFwcFJlZiA9IHRoaXMucGFyZW50SW5qZWN0b3IuZ2V0PEFwcGxpY2F0aW9uUmVmPihBcHBsaWNhdGlvblJlZik7XG4gICAgICAgIGFwcFJlZi5hdHRhY2hWaWV3KHRoaXMuY29tcG9uZW50UmVmLmhvc3RWaWV3KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNldHVwT3V0cHV0cygpIHtcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cnM7XG4gICAgY29uc3Qgb3V0cHV0cyA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5vdXRwdXRzIHx8IFtdO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgb3V0cHV0cy5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3Qgb3V0cHV0ID0gbmV3IFByb3BlcnR5QmluZGluZyhvdXRwdXRzW2pdLnByb3BOYW1lLCBvdXRwdXRzW2pdLnRlbXBsYXRlTmFtZSk7XG4gICAgICBjb25zdCBiaW5kb25BdHRyID0gb3V0cHV0LmJpbmRvbkF0dHIuc3Vic3RyaW5nKDAsIG91dHB1dC5iaW5kb25BdHRyLmxlbmd0aCAtIDYpO1xuICAgICAgY29uc3QgYnJhY2tldFBhcmVuQXR0ciA9XG4gICAgICAgICAgYFsoJHtvdXRwdXQuYnJhY2tldFBhcmVuQXR0ci5zdWJzdHJpbmcoMiwgb3V0cHV0LmJyYWNrZXRQYXJlbkF0dHIubGVuZ3RoIC0gOCl9KV1gO1xuICAgICAgLy8gb3JkZXIgYmVsb3cgaXMgaW1wb3J0YW50IC0gZmlyc3QgdXBkYXRlIGJpbmRpbmdzIHRoZW4gZXZhbHVhdGUgZXhwcmVzc2lvbnNcbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShiaW5kb25BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbYmluZG9uQXR0cl0sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJyYWNrZXRQYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1ticmFja2V0UGFyZW5BdHRyXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkob3V0cHV0Lm9uQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW291dHB1dC5vbkF0dHJdKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXQucGFyZW5BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbb3V0cHV0LnBhcmVuQXR0cl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0OiBQcm9wZXJ0eUJpbmRpbmcsIGV4cHI6IHN0cmluZywgaXNBc3NpZ25tZW50OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBjb25zdCBnZXR0ZXIgPSB0aGlzLiRwYXJzZShleHByKTtcbiAgICBjb25zdCBzZXR0ZXIgPSBnZXR0ZXIuYXNzaWduO1xuICAgIGlmIChpc0Fzc2lnbm1lbnQgJiYgIXNldHRlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHByZXNzaW9uICcke2V4cHJ9JyBpcyBub3QgYXNzaWduYWJsZSFgKTtcbiAgICB9XG4gICAgY29uc3QgZW1pdHRlciA9IHRoaXMuY29tcG9uZW50W291dHB1dC5wcm9wXSBhcyBFdmVudEVtaXR0ZXI8YW55PjtcbiAgICBpZiAoZW1pdHRlcikge1xuICAgICAgZW1pdHRlci5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiBpc0Fzc2lnbm1lbnQgPyAodjogYW55KSA9PiBzZXR0ZXIgISh0aGlzLnNjb3BlLCB2KSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICh2OiBhbnkpID0+IGdldHRlcih0aGlzLnNjb3BlLCB7JyRldmVudCc6IHZ9KVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgTWlzc2luZyBlbWl0dGVyICcke291dHB1dC5wcm9wfScgb24gY29tcG9uZW50ICcke2dldENvbXBvbmVudE5hbWUodGhpcy5jb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUpfSchYCk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJDbGVhbnVwKCkge1xuICAgIGNvbnN0IGRlc3Ryb3lDb21wb25lbnRSZWYgPSB0aGlzLndyYXBDYWxsYmFjaygoKSA9PiB0aGlzLmNvbXBvbmVudFJlZi5kZXN0cm95KCkpO1xuICAgIGxldCBkZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuZWxlbWVudC5vbiAhKCckZGVzdHJveScsICgpID0+IHRoaXMuY29tcG9uZW50U2NvcGUuJGRlc3Ryb3koKSk7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgaWYgKCFkZXN0cm95ZWQpIHtcbiAgICAgICAgZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgICAudW5yZWdpc3RlckFwcGxpY2F0aW9uKHRoaXMuY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICBkZXN0cm95Q29tcG9uZW50UmVmKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRJbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3RvcjsgfVxuXG4gIHByaXZhdGUgdXBkYXRlSW5wdXQocHJvcDogc3RyaW5nLCBwcmV2VmFsdWU6IGFueSwgY3VyclZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICB0aGlzLmlucHV0Q2hhbmdlc1twcm9wXSA9IG5ldyBTaW1wbGVDaGFuZ2UocHJldlZhbHVlLCBjdXJyVmFsdWUsIHByZXZWYWx1ZSA9PT0gY3VyclZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLmlucHV0Q2hhbmdlQ291bnQrKztcbiAgICB0aGlzLmNvbXBvbmVudFtwcm9wXSA9IGN1cnJWYWx1ZTtcbiAgfVxuXG4gIGdyb3VwUHJvamVjdGFibGVOb2RlcygpIHtcbiAgICBsZXQgbmdDb250ZW50U2VsZWN0b3JzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm5nQ29udGVudFNlbGVjdG9ycztcbiAgICByZXR1cm4gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzLCB0aGlzLmVsZW1lbnQuY29udGVudHMgISgpKTtcbiAgfVxufVxuXG4vKipcbiAqIEdyb3VwIGEgc2V0IG9mIERPTSBub2RlcyBpbnRvIGBuZ0NvbnRlbnRgIGdyb3VwcywgYmFzZWQgb24gdGhlIGdpdmVuIGNvbnRlbnQgc2VsZWN0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSwgbm9kZXM6IE5vZGVbXSk6IE5vZGVbXVtdIHtcbiAgY29uc3QgcHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgbGV0IHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlcjtcblxuICBmb3IgKGxldCBpID0gMCwgaWkgPSBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpIDwgaWk7ICsraSkge1xuICAgIHByb2plY3RhYmxlTm9kZXNbaV0gPSBbXTtcbiAgfVxuXG4gIGZvciAobGV0IGogPSAwLCBqaiA9IG5vZGVzLmxlbmd0aDsgaiA8IGpqOyArK2opIHtcbiAgICBjb25zdCBub2RlID0gbm9kZXNbal07XG4gICAgY29uc3QgbmdDb250ZW50SW5kZXggPSBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChub2RlLCBuZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgIGlmIChuZ0NvbnRlbnRJbmRleCAhPSBudWxsKSB7XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzW25nQ29udGVudEluZGV4XS5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9qZWN0YWJsZU5vZGVzO1xufVxuXG5mdW5jdGlvbiBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChlbGVtZW50OiBhbnksIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10pOiBudW1iZXJ8bnVsbCB7XG4gIGNvbnN0IG5nQ29udGVudEluZGljZXM6IG51bWJlcltdID0gW107XG4gIGxldCB3aWxkY2FyZE5nQ29udGVudEluZGV4OiBudW1iZXIgPSAtMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IG5nQ29udGVudFNlbGVjdG9yc1tpXTtcbiAgICBpZiAoc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IGk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXRjaGVzU2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKSB7XG4gICAgICAgIG5nQ29udGVudEluZGljZXMucHVzaChpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmdDb250ZW50SW5kaWNlcy5zb3J0KCk7XG5cbiAgaWYgKHdpbGRjYXJkTmdDb250ZW50SW5kZXggIT09IC0xKSB7XG4gICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKHdpbGRjYXJkTmdDb250ZW50SW5kZXgpO1xuICB9XG4gIHJldHVybiBuZ0NvbnRlbnRJbmRpY2VzLmxlbmd0aCA/IG5nQ29udGVudEluZGljZXNbMF0gOiBudWxsO1xufVxuXG5sZXQgX21hdGNoZXM6ICh0aGlzOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIG1hdGNoZXNTZWxlY3RvcihlbDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghX21hdGNoZXMpIHtcbiAgICBjb25zdCBlbFByb3RvID0gPGFueT5FbGVtZW50LnByb3RvdHlwZTtcbiAgICBfbWF0Y2hlcyA9IGVsUHJvdG8ubWF0Y2hlcyB8fCBlbFByb3RvLm1hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBlbFByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgfVxuICByZXR1cm4gZWwubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFID8gX21hdGNoZXMuY2FsbChlbCwgc2VsZWN0b3IpIDogZmFsc2U7XG59XG4iXX0=