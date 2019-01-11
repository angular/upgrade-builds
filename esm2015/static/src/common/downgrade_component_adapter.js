/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
import { getTypeName, hookupNgModel, strictEquals } from './util';
/** @type {?} */
const INITIAL_VALUE = {
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
        /** @type {?} */
        const compiledProjectableNodes = [];
        /** @type {?} */
        const projectableNodes = this.groupProjectableNodes();
        /** @type {?} */
        const linkFns = projectableNodes.map(nodes => this.$compile(nodes));
        (/** @type {?} */ (this.element.empty))();
        linkFns.forEach(linkFn => {
            linkFn(this.scope, (clone) => {
                compiledProjectableNodes.push(clone);
                (/** @type {?} */ (this.element.append))(clone);
            });
        });
        return compiledProjectableNodes;
    }
    /**
     * @param {?} projectableNodes
     * @return {?}
     */
    createComponent(projectableNodes) {
        /** @type {?} */
        const providers = [{ provide: $SCOPE, useValue: this.componentScope }];
        /** @type {?} */
        const childInjector = Injector.create({ providers: providers, parent: this.parentInjector, name: 'DowngradeComponentAdapter' });
        this.componentRef =
            this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        this.viewChangeDetector = this.componentRef.injector.get(ChangeDetectorRef);
        this.changeDetector = this.componentRef.changeDetectorRef;
        this.component = this.componentRef.instance;
        // testability hook is commonly added during component bootstrap in
        // packages/core/src/application_ref.bootstrap()
        // in downgraded application, component creation will take place here as well as adding the
        // testability hook.
        /** @type {?} */
        const testability = this.componentRef.injector.get(Testability, null);
        if (testability) {
            this.componentRef.injector.get(TestabilityRegistry)
                .registerApplication(this.componentRef.location.nativeElement, testability);
        }
        hookupNgModel(this.ngModel, this.component);
    }
    /**
     * @param {?} manuallyAttachView
     * @param {?=} propagateDigest
     * @return {?}
     */
    setupInputs(manuallyAttachView, propagateDigest = true) {
        /** @type {?} */
        const attrs = this.attrs;
        /** @type {?} */
        const inputs = this.componentFactory.inputs || [];
        for (let i = 0; i < inputs.length; i++) {
            /** @type {?} */
            const input = new PropertyBinding(inputs[i].propName, inputs[i].templateName);
            /** @type {?} */
            let expr = null;
            if (attrs.hasOwnProperty(input.attr)) {
                /** @type {?} */
                const observeFn = (prop => {
                    /** @type {?} */
                    let prevValue = INITIAL_VALUE;
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
                /** @type {?} */
                let unwatch = this.componentScope.$watch(() => {
                    (/** @type {?} */ (unwatch))();
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
                /** @type {?} */
                const watchFn = (prop => (currValue, prevValue) => this.updateInput(prop, prevValue, currValue))(input.prop);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        // Invoke `ngOnChanges()` and Change Detection (when necessary)
        /** @type {?} */
        const detectChanges = () => this.changeDetector.detectChanges();
        /** @type {?} */
        const prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && ((/** @type {?} */ (prototype))).ngOnChanges);
        this.componentScope.$watch(() => this.inputChangeCount, this.wrapCallback(() => {
            // Invoke `ngOnChanges()`
            if (this.implementsOnChanges) {
                /** @type {?} */
                const inputChanges = this.inputChanges;
                this.inputChanges = {};
                ((/** @type {?} */ (this.component))).ngOnChanges((/** @type {?} */ (inputChanges)));
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
        if (manuallyAttachView || !propagateDigest) {
            /** @type {?} */
            let unwatch = this.componentScope.$watch(() => {
                (/** @type {?} */ (unwatch))();
                unwatch = null;
                /** @type {?} */
                const appRef = this.parentInjector.get(ApplicationRef);
                appRef.attachView(this.componentRef.hostView);
            });
        }
    }
    /**
     * @return {?}
     */
    setupOutputs() {
        /** @type {?} */
        const attrs = this.attrs;
        /** @type {?} */
        const outputs = this.componentFactory.outputs || [];
        for (let j = 0; j < outputs.length; j++) {
            /** @type {?} */
            const output = new PropertyBinding(outputs[j].propName, outputs[j].templateName);
            /** @type {?} */
            const bindonAttr = output.bindonAttr.substring(0, output.bindonAttr.length - 6);
            /** @type {?} */
            const bracketParenAttr = `[(${output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8)})]`;
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
     * @private
     * @param {?} output
     * @param {?} expr
     * @param {?=} isAssignment
     * @return {?}
     */
    subscribeToOutput(output, expr, isAssignment = false) {
        /** @type {?} */
        const getter = this.$parse(expr);
        /** @type {?} */
        const setter = getter.assign;
        if (isAssignment && !setter) {
            throw new Error(`Expression '${expr}' is not assignable!`);
        }
        /** @type {?} */
        const emitter = (/** @type {?} */ (this.component[output.prop]));
        if (emitter) {
            emitter.subscribe({
                next: isAssignment ? (v) => (/** @type {?} */ (setter))(this.scope, v) :
                    (v) => getter(this.scope, { '$event': v })
            });
        }
        else {
            throw new Error(`Missing emitter '${output.prop}' on component '${getTypeName(this.componentFactory.componentType)}'!`);
        }
    }
    /**
     * @return {?}
     */
    registerCleanup() {
        /** @type {?} */
        const destroyComponentRef = this.wrapCallback(() => this.componentRef.destroy());
        /** @type {?} */
        let destroyed = false;
        (/** @type {?} */ (this.element.on))('$destroy', () => this.componentScope.$destroy());
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
     * @private
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
        /** @type {?} */
        let ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, (/** @type {?} */ (this.element.contents))());
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.implementsOnChanges;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.inputChangeCount;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.inputChanges;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.componentScope;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.componentRef;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.component;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.changeDetector;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.viewChangeDetector;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.element;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.attrs;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.scope;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.ngModel;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.parentInjector;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.$injector;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.$compile;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.$parse;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.componentFactory;
    /**
     * @type {?}
     * @private
     */
    DowngradeComponentAdapter.prototype.wrapCallback;
}
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 * @param {?} ngContentSelectors
 * @param {?} nodes
 * @return {?}
 */
export function groupNodesBySelector(ngContentSelectors, nodes) {
    /** @type {?} */
    const projectableNodes = [];
    /** @type {?} */
    let wildcardNgContentIndex;
    for (let i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
        projectableNodes[i] = [];
    }
    for (let j = 0, jj = nodes.length; j < jj; ++j) {
        /** @type {?} */
        const node = nodes[j];
        /** @type {?} */
        const ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
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
    /** @type {?} */
    const ngContentIndices = [];
    /** @type {?} */
    let wildcardNgContentIndex = -1;
    for (let i = 0; i < ngContentSelectors.length; i++) {
        /** @type {?} */
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
/** @type {?} */
let _matches;
/**
 * @param {?} el
 * @param {?} selector
 * @return {?}
 */
function matchesSelector(el, selector) {
    if (!_matches) {
        /** @type {?} */
        const elProto = (/** @type {?} */ (Element.prototype));
        _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
            elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
    }
    return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL2NvbW1vbi9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsY0FBYyxFQUFFLGlCQUFpQixFQUFnRCxRQUFRLEVBQWEsWUFBWSxFQUFpQyxXQUFXLEVBQUUsbUJBQW1CLEVBQU8sTUFBTSxlQUFlLENBQUM7QUFHeE4sT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDbkMsT0FBTyxFQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sUUFBUSxDQUFDOztNQUUxRCxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QjtBQUVELE1BQU0sT0FBTyx5QkFBeUI7Ozs7Ozs7Ozs7Ozs7SUFhcEMsWUFDWSxPQUFpQyxFQUFVLEtBQTBCLEVBQ3JFLEtBQXFCLEVBQVUsT0FBbUMsRUFDbEUsY0FBd0IsRUFBVSxTQUFtQyxFQUNyRSxRQUFpQyxFQUFVLE1BQTZCLEVBQ3hFLGdCQUF1QyxFQUN2QyxZQUF5QztRQUx6QyxZQUFPLEdBQVAsT0FBTyxDQUEwQjtRQUFVLFVBQUssR0FBTCxLQUFLLENBQXFCO1FBQ3JFLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7UUFDbEUsbUJBQWMsR0FBZCxjQUFjLENBQVU7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUEwQjtRQUNyRSxhQUFRLEdBQVIsUUFBUSxDQUF5QjtRQUFVLFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQ3hFLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBdUI7UUFDdkMs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QVksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNqRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FwcGxpY2F0aW9uUmVmLCBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdG9yLCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlcywgU3RhdGljUHJvdmlkZXIsIFRlc3RhYmlsaXR5LCBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7UHJvcGVydHlCaW5kaW5nfSBmcm9tICcuL2NvbXBvbmVudF9pbmZvJztcbmltcG9ydCB7JFNDT1BFfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2dldFR5cGVOYW1lLCBob29rdXBOZ01vZGVsLCBzdHJpY3RFcXVhbHN9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuXG5leHBvcnQgY2xhc3MgRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlciB7XG4gIHByaXZhdGUgaW1wbGVtZW50c09uQ2hhbmdlcyA9IGZhbHNlO1xuICBwcml2YXRlIGlucHV0Q2hhbmdlQ291bnQ6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgaW5wdXRDaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzID0ge307XG4gIHByaXZhdGUgY29tcG9uZW50U2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBjb21wb25lbnRSZWYgITogQ29tcG9uZW50UmVmPGFueT47XG4gIHByaXZhdGUgY29tcG9uZW50OiBhbnk7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNoYW5nZURldGVjdG9yICE6IENoYW5nZURldGVjdG9yUmVmO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSB2aWV3Q2hhbmdlRGV0ZWN0b3IgITogQ2hhbmdlRGV0ZWN0b3JSZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyxcbiAgICAgIHByaXZhdGUgc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBwcml2YXRlIG5nTW9kZWw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyLFxuICAgICAgcHJpdmF0ZSBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsXG4gICAgICBwcml2YXRlICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSwgcHJpdmF0ZSAkcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSxcbiAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+LFxuICAgICAgcHJpdmF0ZSB3cmFwQ2FsbGJhY2s6IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT4gVCkge1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCk7XG4gIH1cblxuICBjb21waWxlQ29udGVudHMoKTogTm9kZVtdW10ge1xuICAgIGNvbnN0IGNvbXBpbGVkUHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IHRoaXMuZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCk7XG4gICAgY29uc3QgbGlua0ZucyA9IHByb2plY3RhYmxlTm9kZXMubWFwKG5vZGVzID0+IHRoaXMuJGNvbXBpbGUobm9kZXMpKTtcblxuICAgIHRoaXMuZWxlbWVudC5lbXB0eSAhKCk7XG5cbiAgICBsaW5rRm5zLmZvckVhY2gobGlua0ZuID0+IHtcbiAgICAgIGxpbmtGbih0aGlzLnNjb3BlLCAoY2xvbmU6IE5vZGVbXSkgPT4ge1xuICAgICAgICBjb21waWxlZFByb2plY3RhYmxlTm9kZXMucHVzaChjbG9uZSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmQgIShjbG9uZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb21waWxlZFByb2plY3RhYmxlTm9kZXM7XG4gIH1cblxuICBjcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2RlczogTm9kZVtdW10pIHtcbiAgICBjb25zdCBwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbe3Byb3ZpZGU6ICRTQ09QRSwgdXNlVmFsdWU6IHRoaXMuY29tcG9uZW50U2NvcGV9XTtcbiAgICBjb25zdCBjaGlsZEluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKFxuICAgICAgICB7cHJvdmlkZXJzOiBwcm92aWRlcnMsIHBhcmVudDogdGhpcy5wYXJlbnRJbmplY3RvciwgbmFtZTogJ0Rvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXInfSk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFJlZiA9XG4gICAgICAgIHRoaXMuY29tcG9uZW50RmFjdG9yeS5jcmVhdGUoY2hpbGRJbmplY3RvciwgcHJvamVjdGFibGVOb2RlcywgdGhpcy5lbGVtZW50WzBdKTtcbiAgICB0aGlzLnZpZXdDaGFuZ2VEZXRlY3RvciA9IHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChDaGFuZ2VEZXRlY3RvclJlZik7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvciA9IHRoaXMuY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmO1xuICAgIHRoaXMuY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRSZWYuaW5zdGFuY2U7XG5cbiAgICAvLyB0ZXN0YWJpbGl0eSBob29rIGlzIGNvbW1vbmx5IGFkZGVkIGR1cmluZyBjb21wb25lbnQgYm9vdHN0cmFwIGluXG4gICAgLy8gcGFja2FnZXMvY29yZS9zcmMvYXBwbGljYXRpb25fcmVmLmJvb3RzdHJhcCgpXG4gICAgLy8gaW4gZG93bmdyYWRlZCBhcHBsaWNhdGlvbiwgY29tcG9uZW50IGNyZWF0aW9uIHdpbGwgdGFrZSBwbGFjZSBoZXJlIGFzIHdlbGwgYXMgYWRkaW5nIHRoZVxuICAgIC8vIHRlc3RhYmlsaXR5IGhvb2suXG4gICAgY29uc3QgdGVzdGFiaWxpdHkgPSB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHksIG51bGwpO1xuICAgIGlmICh0ZXN0YWJpbGl0eSkge1xuICAgICAgdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24odGhpcy5jb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCwgdGVzdGFiaWxpdHkpO1xuICAgIH1cblxuICAgIGhvb2t1cE5nTW9kZWwodGhpcy5uZ01vZGVsLCB0aGlzLmNvbXBvbmVudCk7XG4gIH1cblxuICBzZXR1cElucHV0cyhtYW51YWxseUF0dGFjaFZpZXc6IGJvb2xlYW4sIHByb3BhZ2F0ZURpZ2VzdCA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cnM7XG4gICAgY29uc3QgaW5wdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmlucHV0cyB8fCBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW5wdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKGlucHV0c1tpXS5wcm9wTmFtZSwgaW5wdXRzW2ldLnRlbXBsYXRlTmFtZSk7XG4gICAgICBsZXQgZXhwcjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYXR0cikpIHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZUZuID0gKHByb3AgPT4ge1xuICAgICAgICAgIGxldCBwcmV2VmFsdWUgPSBJTklUSUFMX1ZBTFVFO1xuICAgICAgICAgIHJldHVybiAoY3VyclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSwgYm90aCBgJG9ic2VydmUoKWAgYW5kIGAkd2F0Y2goKWAgd2lsbCBjYWxsIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIXN0cmljdEVxdWFscyhwcmV2VmFsdWUsIGN1cnJWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKHByZXZWYWx1ZSA9PT0gSU5JVElBTF9WQUxVRSkge1xuICAgICAgICAgICAgICAgIHByZXZWYWx1ZSA9IGN1cnJWYWx1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuICAgICAgICAgICAgICBwcmV2VmFsdWUgPSBjdXJyVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkoaW5wdXQucHJvcCk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKGlucHV0LmF0dHIsIG9ic2VydmVGbik7XG5cbiAgICAgICAgLy8gVXNlIGAkd2F0Y2goKWAgKGluIGFkZGl0aW9uIHRvIGAkb2JzZXJ2ZSgpYCkgaW4gb3JkZXIgdG8gaW5pdGlhbGl6ZSB0aGUgaW5wdXQgaW4gdGltZVxuICAgICAgICAvLyBmb3IgYG5nT25DaGFuZ2VzKClgLiBUaGlzIGlzIG5lY2Vzc2FyeSBpZiB3ZSBhcmUgYWxyZWFkeSBpbiBhIGAkZGlnZXN0YCwgd2hpY2ggbWVhbnMgdGhhdFxuICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAgKHdoaWNoIGlzIGNhbGxlZCBieSBhIHdhdGNoZXIpIHdpbGwgcnVuIGJlZm9yZSB0aGUgYCRvYnNlcnZlKClgIGNhbGxiYWNrLlxuICAgICAgICBsZXQgdW53YXRjaDogRnVuY3Rpb258bnVsbCA9IHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgICB1bndhdGNoID0gbnVsbDtcbiAgICAgICAgICBvYnNlcnZlRm4oYXR0cnNbaW5wdXQuYXR0cl0pO1xuICAgICAgICB9KTtcblxuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5iaW5kQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJpbmRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5icmFja2V0QXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJpbmRvbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5iaW5kb25BdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJyYWNrZXRQYXJlbkF0dHJdO1xuICAgICAgfVxuICAgICAgaWYgKGV4cHIgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCB3YXRjaEZuID1cbiAgICAgICAgICAgIChwcm9wID0+IChjdXJyVmFsdWU6IGFueSwgcHJldlZhbHVlOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpKShpbnB1dC5wcm9wKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goZXhwciwgd2F0Y2hGbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW52b2tlIGBuZ09uQ2hhbmdlcygpYCBhbmQgQ2hhbmdlIERldGVjdGlvbiAod2hlbiBuZWNlc3NhcnkpXG4gICAgY29uc3QgZGV0ZWN0Q2hhbmdlcyA9ICgpID0+IHRoaXMuY2hhbmdlRGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIGNvbnN0IHByb3RvdHlwZSA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5jb21wb25lbnRUeXBlLnByb3RvdHlwZTtcbiAgICB0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMgPSAhIShwcm90b3R5cGUgJiYgKDxPbkNoYW5nZXM+cHJvdG90eXBlKS5uZ09uQ2hhbmdlcyk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB0aGlzLmlucHV0Q2hhbmdlQ291bnQsIHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHtcbiAgICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWBcbiAgICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaW5wdXRDaGFuZ2VzID0gdGhpcy5pbnB1dENoYW5nZXM7XG4gICAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzID0ge307XG4gICAgICAgICg8T25DaGFuZ2VzPnRoaXMuY29tcG9uZW50KS5uZ09uQ2hhbmdlcyhpbnB1dENoYW5nZXMgISk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudmlld0NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuXG4gICAgICAvLyBJZiBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gd2hlbiBpbnB1dHMgY2hhbmdlLlxuICAgICAgaWYgKCFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgICAgZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8vIElmIG5vdCBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gb24gZXZlcnkgZGlnZXN0XG4gICAgaWYgKHByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2godGhpcy53cmFwQ2FsbGJhY2soZGV0ZWN0Q2hhbmdlcykpO1xuICAgIH1cblxuICAgIC8vIElmIG5lY2Vzc2FyeSwgYXR0YWNoIHRoZSB2aWV3IHNvIHRoYXQgaXQgd2lsbCBiZSBkaXJ0eS1jaGVja2VkLlxuICAgIC8vIChBbGxvdyB0aW1lIGZvciB0aGUgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgdG8gYmUgc2V0IGFuZCBgbmdPbkNoYW5nZXMoKWAgdG8gYmUgY2FsbGVkLilcbiAgICBpZiAobWFudWFsbHlBdHRhY2hWaWV3IHx8ICFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIGxldCB1bndhdGNoOiBGdW5jdGlvbnxudWxsID0gdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgdW53YXRjaCA9IG51bGw7XG5cbiAgICAgICAgY29uc3QgYXBwUmVmID0gdGhpcy5wYXJlbnRJbmplY3Rvci5nZXQ8QXBwbGljYXRpb25SZWY+KEFwcGxpY2F0aW9uUmVmKTtcbiAgICAgICAgYXBwUmVmLmF0dGFjaFZpZXcodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0dXBPdXRwdXRzKCkge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBvdXRwdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm91dHB1dHMgfHwgW107XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBvdXRwdXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKG91dHB1dHNbal0ucHJvcE5hbWUsIG91dHB1dHNbal0udGVtcGxhdGVOYW1lKTtcbiAgICAgIGNvbnN0IGJpbmRvbkF0dHIgPSBvdXRwdXQuYmluZG9uQXR0ci5zdWJzdHJpbmcoMCwgb3V0cHV0LmJpbmRvbkF0dHIubGVuZ3RoIC0gNik7XG4gICAgICBjb25zdCBicmFja2V0UGFyZW5BdHRyID1cbiAgICAgICAgICBgWygke291dHB1dC5icmFja2V0UGFyZW5BdHRyLnN1YnN0cmluZygyLCBvdXRwdXQuYnJhY2tldFBhcmVuQXR0ci5sZW5ndGggLSA4KX0pXWA7XG4gICAgICAvLyBvcmRlciBiZWxvdyBpcyBpbXBvcnRhbnQgLSBmaXJzdCB1cGRhdGUgYmluZGluZ3MgdGhlbiBldmFsdWF0ZSBleHByZXNzaW9uc1xuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJpbmRvbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tiaW5kb25BdHRyXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW2JyYWNrZXRQYXJlbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXQub25BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbb3V0cHV0Lm9uQXR0cl0pO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dC5wYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tvdXRwdXQucGFyZW5BdHRyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVUb091dHB1dChvdXRwdXQ6IFByb3BlcnR5QmluZGluZywgZXhwcjogc3RyaW5nLCBpc0Fzc2lnbm1lbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGdldHRlciA9IHRoaXMuJHBhcnNlKGV4cHIpO1xuICAgIGNvbnN0IHNldHRlciA9IGdldHRlci5hc3NpZ247XG4gICAgaWYgKGlzQXNzaWdubWVudCAmJiAhc2V0dGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cHJlc3Npb24gJyR7ZXhwcn0nIGlzIG5vdCBhc3NpZ25hYmxlIWApO1xuICAgIH1cbiAgICBjb25zdCBlbWl0dGVyID0gdGhpcy5jb21wb25lbnRbb3V0cHV0LnByb3BdIGFzIEV2ZW50RW1pdHRlcjxhbnk+O1xuICAgIGlmIChlbWl0dGVyKSB7XG4gICAgICBlbWl0dGVyLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IGlzQXNzaWdubWVudCA/ICh2OiBhbnkpID0+IHNldHRlciAhKHRoaXMuc2NvcGUsIHYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHY6IGFueSkgPT4gZ2V0dGVyKHRoaXMuc2NvcGUsIHsnJGV2ZW50Jzogdn0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBNaXNzaW5nIGVtaXR0ZXIgJyR7b3V0cHV0LnByb3B9JyBvbiBjb21wb25lbnQgJyR7Z2V0VHlwZU5hbWUodGhpcy5jb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUpfSchYCk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJDbGVhbnVwKCkge1xuICAgIGNvbnN0IGRlc3Ryb3lDb21wb25lbnRSZWYgPSB0aGlzLndyYXBDYWxsYmFjaygoKSA9PiB0aGlzLmNvbXBvbmVudFJlZi5kZXN0cm95KCkpO1xuICAgIGxldCBkZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuZWxlbWVudC5vbiAhKCckZGVzdHJveScsICgpID0+IHRoaXMuY29tcG9uZW50U2NvcGUuJGRlc3Ryb3koKSk7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgaWYgKCFkZXN0cm95ZWQpIHtcbiAgICAgICAgZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgICAudW5yZWdpc3RlckFwcGxpY2F0aW9uKHRoaXMuY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICBkZXN0cm95Q29tcG9uZW50UmVmKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRJbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3RvcjsgfVxuXG4gIHByaXZhdGUgdXBkYXRlSW5wdXQocHJvcDogc3RyaW5nLCBwcmV2VmFsdWU6IGFueSwgY3VyclZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICB0aGlzLmlucHV0Q2hhbmdlc1twcm9wXSA9IG5ldyBTaW1wbGVDaGFuZ2UocHJldlZhbHVlLCBjdXJyVmFsdWUsIHByZXZWYWx1ZSA9PT0gY3VyclZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLmlucHV0Q2hhbmdlQ291bnQrKztcbiAgICB0aGlzLmNvbXBvbmVudFtwcm9wXSA9IGN1cnJWYWx1ZTtcbiAgfVxuXG4gIGdyb3VwUHJvamVjdGFibGVOb2RlcygpIHtcbiAgICBsZXQgbmdDb250ZW50U2VsZWN0b3JzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm5nQ29udGVudFNlbGVjdG9ycztcbiAgICByZXR1cm4gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzLCB0aGlzLmVsZW1lbnQuY29udGVudHMgISgpKTtcbiAgfVxufVxuXG4vKipcbiAqIEdyb3VwIGEgc2V0IG9mIERPTSBub2RlcyBpbnRvIGBuZ0NvbnRlbnRgIGdyb3VwcywgYmFzZWQgb24gdGhlIGdpdmVuIGNvbnRlbnQgc2VsZWN0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSwgbm9kZXM6IE5vZGVbXSk6IE5vZGVbXVtdIHtcbiAgY29uc3QgcHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgbGV0IHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlcjtcblxuICBmb3IgKGxldCBpID0gMCwgaWkgPSBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpIDwgaWk7ICsraSkge1xuICAgIHByb2plY3RhYmxlTm9kZXNbaV0gPSBbXTtcbiAgfVxuXG4gIGZvciAobGV0IGogPSAwLCBqaiA9IG5vZGVzLmxlbmd0aDsgaiA8IGpqOyArK2opIHtcbiAgICBjb25zdCBub2RlID0gbm9kZXNbal07XG4gICAgY29uc3QgbmdDb250ZW50SW5kZXggPSBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChub2RlLCBuZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgIGlmIChuZ0NvbnRlbnRJbmRleCAhPSBudWxsKSB7XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzW25nQ29udGVudEluZGV4XS5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9qZWN0YWJsZU5vZGVzO1xufVxuXG5mdW5jdGlvbiBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChlbGVtZW50OiBhbnksIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10pOiBudW1iZXJ8bnVsbCB7XG4gIGNvbnN0IG5nQ29udGVudEluZGljZXM6IG51bWJlcltdID0gW107XG4gIGxldCB3aWxkY2FyZE5nQ29udGVudEluZGV4OiBudW1iZXIgPSAtMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IG5nQ29udGVudFNlbGVjdG9yc1tpXTtcbiAgICBpZiAoc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IGk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXRjaGVzU2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKSB7XG4gICAgICAgIG5nQ29udGVudEluZGljZXMucHVzaChpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmdDb250ZW50SW5kaWNlcy5zb3J0KCk7XG5cbiAgaWYgKHdpbGRjYXJkTmdDb250ZW50SW5kZXggIT09IC0xKSB7XG4gICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKHdpbGRjYXJkTmdDb250ZW50SW5kZXgpO1xuICB9XG4gIHJldHVybiBuZ0NvbnRlbnRJbmRpY2VzLmxlbmd0aCA/IG5nQ29udGVudEluZGljZXNbMF0gOiBudWxsO1xufVxuXG5sZXQgX21hdGNoZXM6ICh0aGlzOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIG1hdGNoZXNTZWxlY3RvcihlbDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghX21hdGNoZXMpIHtcbiAgICBjb25zdCBlbFByb3RvID0gPGFueT5FbGVtZW50LnByb3RvdHlwZTtcbiAgICBfbWF0Y2hlcyA9IGVsUHJvdG8ubWF0Y2hlcyB8fCBlbFByb3RvLm1hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBlbFByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgfVxuICByZXR1cm4gZWwubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFID8gX21hdGNoZXMuY2FsbChlbCwgc2VsZWN0b3IpIDogZmFsc2U7XG59XG4iXX0=