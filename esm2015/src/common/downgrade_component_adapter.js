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
     * @param {?} needsNgZone
     * @param {?=} propagateDigest
     * @return {?}
     */
    setupInputs(needsNgZone, propagateDigest = true) {
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
        if (needsNgZone || !propagateDigest) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxjQUFjLEVBQUUsaUJBQWlCLEVBQWdELFFBQVEsRUFBYSxZQUFZLEVBQWlDLFdBQVcsRUFBRSxtQkFBbUIsRUFBTyxNQUFNLGVBQWUsQ0FBQztBQUd4TixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNuQyxPQUFPLEVBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7O01BRTFELGFBQWEsR0FBRztJQUNwQixpQkFBaUIsRUFBRSxJQUFJO0NBQ3hCO0FBRUQsTUFBTSxPQUFPLHlCQUF5Qjs7Ozs7Ozs7Ozs7OztJQWFwQyxZQUNZLE9BQWlDLEVBQVUsS0FBMEIsRUFDckUsS0FBcUIsRUFBVSxPQUFtQyxFQUNsRSxjQUF3QixFQUFVLFNBQW1DLEVBQ3JFLFFBQWlDLEVBQVUsTUFBNkIsRUFDeEUsZ0JBQXVDLEVBQ3ZDLFlBQXlDO1FBTHpDLFlBQU8sR0FBUCxPQUFPLENBQTBCO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBcUI7UUFDckUsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUE0QjtRQUNsRSxtQkFBYyxHQUFkLGNBQWMsQ0FBVTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQTBCO1FBQ3JFLGFBQVEsR0FBUixRQUFRLENBQXlCO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7UUFDeEUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUF1QjtRQUN2QyxpQkFBWSxHQUFaLFlBQVksQ0FBNkI7UUFsQjdDLHdCQUFtQixHQUFHLEtBQUssQ0FBQztRQUM1QixxQkFBZ0IsR0FBVyxDQUFDLENBQUM7UUFDN0IsaUJBQVksR0FBa0IsRUFBRSxDQUFDO1FBaUJ2QyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNyQyxDQUFDOzs7O0lBRUQsZUFBZTs7Y0FDUCx3QkFBd0IsR0FBYSxFQUFFOztjQUN2QyxnQkFBZ0IsR0FBYSxJQUFJLENBQUMscUJBQXFCLEVBQUU7O2NBQ3pELE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRW5FLG1CQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztRQUV2QixPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBYSxFQUFFLEVBQUU7Z0JBQ25DLHdCQUF3QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDckMsbUJBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyx3QkFBd0IsQ0FBQztJQUNsQyxDQUFDOzs7OztJQUVELGVBQWUsQ0FBQyxnQkFBMEI7O2NBQ2xDLFNBQVMsR0FBcUIsQ0FBQyxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUMsQ0FBQzs7Y0FDaEYsYUFBYSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQ2pDLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsMkJBQTJCLEVBQUMsQ0FBQztRQUUzRixJQUFJLENBQUMsWUFBWTtZQUNiLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO1FBQzFELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7Ozs7OztjQU10QyxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUM7UUFDckUsSUFBSSxXQUFXLEVBQUU7WUFDZixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7aUJBQzlDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztTQUNqRjtRQUVELGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5QyxDQUFDOzs7Ozs7SUFFRCxXQUFXLENBQUMsV0FBb0IsRUFBRSxlQUFlLEdBQUcsSUFBSTs7Y0FDaEQsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLOztjQUNsQixNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxFQUFFO1FBQ2pELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztrQkFDaEMsS0FBSyxHQUFHLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQzs7Z0JBQ3pFLElBQUksR0FBZ0IsSUFBSTtZQUU1QixJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFOztzQkFDOUIsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7O3dCQUNwQixTQUFTLEdBQUcsYUFBYTtvQkFDN0IsT0FBTyxDQUFDLFNBQWMsRUFBRSxFQUFFO3dCQUN4Qix1RUFBdUU7d0JBQ3ZFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxFQUFFOzRCQUN2QyxJQUFJLFNBQVMsS0FBSyxhQUFhLEVBQUU7Z0NBQy9CLFNBQVMsR0FBRyxTQUFTLENBQUM7NkJBQ3ZCOzRCQUVELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDN0MsU0FBUyxHQUFHLFNBQVMsQ0FBQzt5QkFDdkI7b0JBQ0gsQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ2QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDOzs7OztvQkFLbEMsT0FBTyxHQUFrQixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7b0JBQzNELG1CQUFBLE9BQU8sRUFBRSxFQUFFLENBQUM7b0JBQ1osT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDZixTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixDQUFDLENBQUM7YUFFSDtpQkFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMvQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5QjtpQkFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNsRCxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNqQztpQkFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNqRCxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUNoQztpQkFBTSxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7Z0JBQ3ZELElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7YUFDdEM7WUFDRCxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7O3NCQUNWLE9BQU8sR0FDVCxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFjLEVBQUUsU0FBYyxFQUFFLEVBQUUsQ0FDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDbEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQzNDO1NBQ0Y7OztjQUdLLGFBQWEsR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRTs7Y0FDekQsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsU0FBUztRQUMvRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsbUJBQVcsU0FBUyxFQUFBLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUvRSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUU7WUFDN0UseUJBQXlCO1lBQ3pCLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFOztzQkFDdEIsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZO2dCQUN0QyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQyxtQkFBVyxJQUFJLENBQUMsU0FBUyxFQUFBLENBQUMsQ0FBQyxXQUFXLENBQUMsbUJBQUEsWUFBWSxFQUFFLENBQUMsQ0FBQzthQUN6RDtZQUVELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUV2QyxtRkFBbUY7WUFDbkYsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDcEIsYUFBYSxFQUFFLENBQUM7YUFDakI7UUFDSCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosbUZBQW1GO1FBQ25GLElBQUksZUFBZSxFQUFFO1lBQ25CLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztTQUM5RDtRQUVELGtFQUFrRTtRQUNsRSx3RkFBd0Y7UUFDeEYsSUFBSSxXQUFXLElBQUksQ0FBQyxlQUFlLEVBQUU7O2dCQUMvQixPQUFPLEdBQWtCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtnQkFDM0QsbUJBQUEsT0FBTyxFQUFFLEVBQUUsQ0FBQztnQkFDWixPQUFPLEdBQUcsSUFBSSxDQUFDOztzQkFFVCxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQWlCLGNBQWMsQ0FBQztnQkFDdEUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hELENBQUMsQ0FBQztTQUNIO0lBQ0gsQ0FBQzs7OztJQUVELFlBQVk7O2NBQ0osS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLOztjQUNsQixPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sSUFBSSxFQUFFO1FBQ25ELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztrQkFDakMsTUFBTSxHQUFHLElBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQzs7a0JBQzFFLFVBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztrQkFDekUsZ0JBQWdCLEdBQ2xCLEtBQUssTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSTtZQUNyRiw2RUFBNkU7WUFDN0UsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN6RDtZQUNELElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUMxQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQy9EO1lBQ0QsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdEQ7WUFDRCxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUMxQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUN6RDtTQUNGO0lBQ0gsQ0FBQzs7Ozs7Ozs7SUFFTyxpQkFBaUIsQ0FBQyxNQUF1QixFQUFFLElBQVksRUFBRSxlQUF3QixLQUFLOztjQUN0RixNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7O2NBQzFCLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTTtRQUM1QixJQUFJLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUMzQixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsSUFBSSxzQkFBc0IsQ0FBQyxDQUFDO1NBQzVEOztjQUNLLE9BQU8sR0FBRyxtQkFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBcUI7UUFDaEUsSUFBSSxPQUFPLEVBQUU7WUFDWCxPQUFPLENBQUMsU0FBUyxDQUFDO2dCQUNoQixJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsbUJBQUEsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQyxDQUFDLENBQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBQyxRQUFRLEVBQUUsQ0FBQyxFQUFDLENBQUM7YUFDbkUsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQ1gsb0JBQW9CLE1BQU0sQ0FBQyxJQUFJLG1CQUFtQixXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3RztJQUNILENBQUM7Ozs7SUFFRCxlQUFlOztjQUNQLG1CQUFtQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7WUFDNUUsU0FBUyxHQUFHLEtBQUs7UUFFckIsbUJBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3BFLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7WUFDdkMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDZCxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7cUJBQzlDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNyRSxtQkFBbUIsRUFBRSxDQUFDO2FBQ3ZCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDOzs7O0lBRUQsV0FBVyxLQUFlLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzs7Ozs7OztJQUV0RCxXQUFXLENBQUMsSUFBWSxFQUFFLFNBQWMsRUFBRSxTQUFjO1FBQzlELElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxZQUFZLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUM7U0FDM0Y7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNuQyxDQUFDOzs7O0lBRUQscUJBQXFCOztZQUNmLGtCQUFrQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0I7UUFDakUsT0FBTyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxtQkFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3RSxDQUFDO0NBQ0Y7Ozs7OztJQWhPQyx3REFBb0M7Ozs7O0lBQ3BDLHFEQUFxQzs7Ozs7SUFDckMsaURBQXlDOzs7OztJQUN6QyxtREFBdUM7Ozs7O0lBRXZDLGlEQUEwQzs7Ozs7SUFDMUMsOENBQXVCOzs7OztJQUV2QixtREFBNEM7Ozs7O0lBRTVDLHVEQUFnRDs7Ozs7SUFHNUMsNENBQXlDOzs7OztJQUFFLDBDQUFrQzs7Ozs7SUFDN0UsMENBQTZCOzs7OztJQUFFLDRDQUEyQzs7Ozs7SUFDMUUsbURBQWdDOzs7OztJQUFFLDhDQUEyQzs7Ozs7SUFDN0UsNkNBQXlDOzs7OztJQUFFLDJDQUFxQzs7Ozs7SUFDaEYscURBQStDOzs7OztJQUMvQyxpREFBaUQ7Ozs7Ozs7O0FBbU52RCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsa0JBQTRCLEVBQUUsS0FBYTs7VUFDeEUsZ0JBQWdCLEdBQWEsRUFBRTs7UUFDakMsc0JBQThCO0lBRWxDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtRQUMzRCxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDMUI7SUFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFOztjQUN4QyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQzs7Y0FDZixjQUFjLEdBQUcsMEJBQTBCLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDO1FBQzNFLElBQUksY0FBYyxJQUFJLElBQUksRUFBRTtZQUMxQixnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0M7S0FDRjtJQUVELE9BQU8sZ0JBQWdCLENBQUM7QUFDMUIsQ0FBQzs7Ozs7O0FBRUQsU0FBUywwQkFBMEIsQ0FBQyxPQUFZLEVBQUUsa0JBQTRCOztVQUN0RSxnQkFBZ0IsR0FBYSxFQUFFOztRQUNqQyxzQkFBc0IsR0FBVyxDQUFDLENBQUM7SUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7Y0FDNUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUN0QyxJQUFJLFFBQVEsS0FBSyxHQUFHLEVBQUU7WUFDcEIsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO1NBQzVCO2FBQU07WUFDTCxJQUFJLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUU7Z0JBQ3RDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQjtTQUNGO0tBQ0Y7SUFDRCxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUV4QixJQUFJLHNCQUFzQixLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ2pDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDOUQsQ0FBQzs7SUFFRyxRQUFrRDs7Ozs7O0FBRXRELFNBQVMsZUFBZSxDQUFDLEVBQU8sRUFBRSxRQUFnQjtJQUNoRCxJQUFJLENBQUMsUUFBUSxFQUFFOztjQUNQLE9BQU8sR0FBRyxtQkFBSyxPQUFPLENBQUMsU0FBUyxFQUFBO1FBQ3RDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLGtCQUFrQjtZQUMvRSxPQUFPLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQztLQUM1RjtJQUNELE9BQU8sRUFBRSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ2pGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXBwbGljYXRpb25SZWYsIENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBTdGF0aWNQcm92aWRlciwgVGVzdGFiaWxpdHksIFRlc3RhYmlsaXR5UmVnaXN0cnksIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHtQcm9wZXJ0eUJpbmRpbmd9IGZyb20gJy4vY29tcG9uZW50X2luZm8nO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Z2V0VHlwZU5hbWUsIGhvb2t1cE5nTW9kZWwsIHN0cmljdEVxdWFsc30gZnJvbSAnLi91dGlsJztcblxuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmV4cG9ydCBjbGFzcyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpbXBsZW1lbnRzT25DaGFuZ2VzID0gZmFsc2U7XG4gIHByaXZhdGUgaW5wdXRDaGFuZ2VDb3VudDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZXM6IFNpbXBsZUNoYW5nZXMgPSB7fTtcbiAgcHJpdmF0ZSBjb21wb25lbnRTY29wZTogYW5ndWxhci5JU2NvcGU7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNvbXBvbmVudFJlZiAhOiBDb21wb25lbnRSZWY8YW55PjtcbiAgcHJpdmF0ZSBjb21wb25lbnQ6IGFueTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgY2hhbmdlRGV0ZWN0b3IgITogQ2hhbmdlRGV0ZWN0b3JSZWY7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHZpZXdDaGFuZ2VEZXRlY3RvciAhOiBDaGFuZ2VEZXRlY3RvclJlZjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLFxuICAgICAgcHJpdmF0ZSBzY29wZTogYW5ndWxhci5JU2NvcGUsIHByaXZhdGUgbmdNb2RlbDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIsXG4gICAgICBwcml2YXRlIHBhcmVudEluamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSxcbiAgICAgIHByaXZhdGUgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLCBwcml2YXRlICRwYXJzZTogYW5ndWxhci5JUGFyc2VTZXJ2aWNlLFxuICAgICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4sXG4gICAgICBwcml2YXRlIHdyYXBDYWxsYmFjazogPFQ+KGNiOiAoKSA9PiBUKSA9PiAoKSA9PiBUKSB7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZSA9IHNjb3BlLiRuZXcoKTtcbiAgfVxuXG4gIGNvbXBpbGVDb250ZW50cygpOiBOb2RlW11bXSB7XG4gICAgY29uc3QgY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IFtdO1xuICAgIGNvbnN0IHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gdGhpcy5ncm91cFByb2plY3RhYmxlTm9kZXMoKTtcbiAgICBjb25zdCBsaW5rRm5zID0gcHJvamVjdGFibGVOb2Rlcy5tYXAobm9kZXMgPT4gdGhpcy4kY29tcGlsZShub2RlcykpO1xuXG4gICAgdGhpcy5lbGVtZW50LmVtcHR5ICEoKTtcblxuICAgIGxpbmtGbnMuZm9yRWFjaChsaW5rRm4gPT4ge1xuICAgICAgbGlua0ZuKHRoaXMuc2NvcGUsIChjbG9uZTogTm9kZVtdKSA9PiB7XG4gICAgICAgIGNvbXBpbGVkUHJvamVjdGFibGVOb2Rlcy5wdXNoKGNsb25lKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZCAhKGNsb25lKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbXBpbGVkUHJvamVjdGFibGVOb2RlcztcbiAgfVxuXG4gIGNyZWF0ZUNvbXBvbmVudChwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSkge1xuICAgIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFt7cHJvdmlkZTogJFNDT1BFLCB1c2VWYWx1ZTogdGhpcy5jb21wb25lbnRTY29wZX1dO1xuICAgIGNvbnN0IGNoaWxkSW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoXG4gICAgICAgIHtwcm92aWRlcnM6IHByb3ZpZGVycywgcGFyZW50OiB0aGlzLnBhcmVudEluamVjdG9yLCBuYW1lOiAnRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcid9KTtcblxuICAgIHRoaXMuY29tcG9uZW50UmVmID1cbiAgICAgICAgdGhpcy5jb21wb25lbnRGYWN0b3J5LmNyZWF0ZShjaGlsZEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzLCB0aGlzLmVsZW1lbnRbMF0pO1xuICAgIHRoaXMudmlld0NoYW5nZURldGVjdG9yID0gdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yID0gdGhpcy5jb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWY7XG4gICAgdGhpcy5jb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudFJlZi5pbnN0YW5jZTtcblxuICAgIC8vIHRlc3RhYmlsaXR5IGhvb2sgaXMgY29tbW9ubHkgYWRkZWQgZHVyaW5nIGNvbXBvbmVudCBib290c3RyYXAgaW5cbiAgICAvLyBwYWNrYWdlcy9jb3JlL3NyYy9hcHBsaWNhdGlvbl9yZWYuYm9vdHN0cmFwKClcbiAgICAvLyBpbiBkb3duZ3JhZGVkIGFwcGxpY2F0aW9uLCBjb21wb25lbnQgY3JlYXRpb24gd2lsbCB0YWtlIHBsYWNlIGhlcmUgYXMgd2VsbCBhcyBhZGRpbmcgdGhlXG4gICAgLy8gdGVzdGFiaWxpdHkgaG9vay5cbiAgICBjb25zdCB0ZXN0YWJpbGl0eSA9IHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eSwgbnVsbCk7XG4gICAgaWYgKHRlc3RhYmlsaXR5KSB7XG4gICAgICB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgICAucmVnaXN0ZXJBcHBsaWNhdGlvbih0aGlzLmNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LCB0ZXN0YWJpbGl0eSk7XG4gICAgfVxuXG4gICAgaG9va3VwTmdNb2RlbCh0aGlzLm5nTW9kZWwsIHRoaXMuY29tcG9uZW50KTtcbiAgfVxuXG4gIHNldHVwSW5wdXRzKG5lZWRzTmdab25lOiBib29sZWFuLCBwcm9wYWdhdGVEaWdlc3QgPSB0cnVlKTogdm9pZCB7XG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLmF0dHJzO1xuICAgIGNvbnN0IGlucHV0cyA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5pbnB1dHMgfHwgW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gbmV3IFByb3BlcnR5QmluZGluZyhpbnB1dHNbaV0ucHJvcE5hbWUsIGlucHV0c1tpXS50ZW1wbGF0ZU5hbWUpO1xuICAgICAgbGV0IGV4cHI6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmF0dHIpKSB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVGbiA9IChwcm9wID0+IHtcbiAgICAgICAgICBsZXQgcHJldlZhbHVlID0gSU5JVElBTF9WQUxVRTtcbiAgICAgICAgICByZXR1cm4gKGN1cnJWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyBJbml0aWFsbHksIGJvdGggYCRvYnNlcnZlKClgIGFuZCBgJHdhdGNoKClgIHdpbGwgY2FsbCB0aGlzIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFzdHJpY3RFcXVhbHMocHJldlZhbHVlLCBjdXJyVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGlmIChwcmV2VmFsdWUgPT09IElOSVRJQUxfVkFMVUUpIHtcbiAgICAgICAgICAgICAgICBwcmV2VmFsdWUgPSBjdXJyVmFsdWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0KHByb3AsIHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgICAgICAgcHJldlZhbHVlID0gY3VyclZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pKGlucHV0LnByb3ApO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZShpbnB1dC5hdHRyLCBvYnNlcnZlRm4pO1xuXG4gICAgICAgIC8vIFVzZSBgJHdhdGNoKClgIChpbiBhZGRpdGlvbiB0byBgJG9ic2VydmUoKWApIGluIG9yZGVyIHRvIGluaXRpYWxpemUgdGhlIGlucHV0IGluIHRpbWVcbiAgICAgICAgLy8gZm9yIGBuZ09uQ2hhbmdlcygpYC4gVGhpcyBpcyBuZWNlc3NhcnkgaWYgd2UgYXJlIGFscmVhZHkgaW4gYSBgJGRpZ2VzdGAsIHdoaWNoIG1lYW5zIHRoYXRcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgICh3aGljaCBpcyBjYWxsZWQgYnkgYSB3YXRjaGVyKSB3aWxsIHJ1biBiZWZvcmUgdGhlIGAkb2JzZXJ2ZSgpYCBjYWxsYmFjay5cbiAgICAgICAgbGV0IHVud2F0Y2g6IEZ1bmN0aW9ufG51bGwgPSB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgICAgdW53YXRjaCAhKCk7XG4gICAgICAgICAgdW53YXRjaCA9IG51bGw7XG4gICAgICAgICAgb2JzZXJ2ZUZuKGF0dHJzW2lucHV0LmF0dHJdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYmluZEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5iaW5kQXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJyYWNrZXRBdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXQuYnJhY2tldEF0dHJdO1xuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5iaW5kb25BdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXQuYmluZG9uQXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJyYWNrZXRQYXJlbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5icmFja2V0UGFyZW5BdHRyXTtcbiAgICAgIH1cbiAgICAgIGlmIChleHByICE9IG51bGwpIHtcbiAgICAgICAgY29uc3Qgd2F0Y2hGbiA9XG4gICAgICAgICAgICAocHJvcCA9PiAoY3VyclZhbHVlOiBhbnksIHByZXZWYWx1ZTogYW55KSA9PlxuICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0KHByb3AsIHByZXZWYWx1ZSwgY3VyclZhbHVlKSkoaW5wdXQucHJvcCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKGV4cHIsIHdhdGNoRm4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWAgYW5kIENoYW5nZSBEZXRlY3Rpb24gKHdoZW4gbmVjZXNzYXJ5KVxuICAgIGNvbnN0IGRldGVjdENoYW5nZXMgPSAoKSA9PiB0aGlzLmNoYW5nZURldGVjdG9yLmRldGVjdENoYW5nZXMoKTtcbiAgICBjb25zdCBwcm90b3R5cGUgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZS5wcm90b3R5cGU7XG4gICAgdGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzID0gISEocHJvdG90eXBlICYmICg8T25DaGFuZ2VzPnByb3RvdHlwZSkubmdPbkNoYW5nZXMpO1xuXG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5pbnB1dENoYW5nZUNvdW50LCB0aGlzLndyYXBDYWxsYmFjaygoKSA9PiB7XG4gICAgICAvLyBJbnZva2UgYG5nT25DaGFuZ2VzKClgXG4gICAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICAgIGNvbnN0IGlucHV0Q2hhbmdlcyA9IHRoaXMuaW5wdXRDaGFuZ2VzO1xuICAgICAgICB0aGlzLmlucHV0Q2hhbmdlcyA9IHt9O1xuICAgICAgICAoPE9uQ2hhbmdlcz50aGlzLmNvbXBvbmVudCkubmdPbkNoYW5nZXMoaW5wdXRDaGFuZ2VzICEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnZpZXdDaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcblxuICAgICAgLy8gSWYgb3B0ZWQgb3V0IG9mIHByb3BhZ2F0aW5nIGRpZ2VzdHMsIGludm9rZSBjaGFuZ2UgZGV0ZWN0aW9uIHdoZW4gaW5wdXRzIGNoYW5nZS5cbiAgICAgIGlmICghcHJvcGFnYXRlRGlnZXN0KSB7XG4gICAgICAgIGRldGVjdENoYW5nZXMoKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICAvLyBJZiBub3Qgb3B0ZWQgb3V0IG9mIHByb3BhZ2F0aW5nIGRpZ2VzdHMsIGludm9rZSBjaGFuZ2UgZGV0ZWN0aW9uIG9uIGV2ZXJ5IGRpZ2VzdFxuICAgIGlmIChwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKHRoaXMud3JhcENhbGxiYWNrKGRldGVjdENoYW5nZXMpKTtcbiAgICB9XG5cbiAgICAvLyBJZiBuZWNlc3NhcnksIGF0dGFjaCB0aGUgdmlldyBzbyB0aGF0IGl0IHdpbGwgYmUgZGlydHktY2hlY2tlZC5cbiAgICAvLyAoQWxsb3cgdGltZSBmb3IgdGhlIGluaXRpYWwgaW5wdXQgdmFsdWVzIHRvIGJlIHNldCBhbmQgYG5nT25DaGFuZ2VzKClgIHRvIGJlIGNhbGxlZC4pXG4gICAgaWYgKG5lZWRzTmdab25lIHx8ICFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIGxldCB1bndhdGNoOiBGdW5jdGlvbnxudWxsID0gdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgdW53YXRjaCA9IG51bGw7XG5cbiAgICAgICAgY29uc3QgYXBwUmVmID0gdGhpcy5wYXJlbnRJbmplY3Rvci5nZXQ8QXBwbGljYXRpb25SZWY+KEFwcGxpY2F0aW9uUmVmKTtcbiAgICAgICAgYXBwUmVmLmF0dGFjaFZpZXcodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0dXBPdXRwdXRzKCkge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBvdXRwdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm91dHB1dHMgfHwgW107XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBvdXRwdXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKG91dHB1dHNbal0ucHJvcE5hbWUsIG91dHB1dHNbal0udGVtcGxhdGVOYW1lKTtcbiAgICAgIGNvbnN0IGJpbmRvbkF0dHIgPSBvdXRwdXQuYmluZG9uQXR0ci5zdWJzdHJpbmcoMCwgb3V0cHV0LmJpbmRvbkF0dHIubGVuZ3RoIC0gNik7XG4gICAgICBjb25zdCBicmFja2V0UGFyZW5BdHRyID1cbiAgICAgICAgICBgWygke291dHB1dC5icmFja2V0UGFyZW5BdHRyLnN1YnN0cmluZygyLCBvdXRwdXQuYnJhY2tldFBhcmVuQXR0ci5sZW5ndGggLSA4KX0pXWA7XG4gICAgICAvLyBvcmRlciBiZWxvdyBpcyBpbXBvcnRhbnQgLSBmaXJzdCB1cGRhdGUgYmluZGluZ3MgdGhlbiBldmFsdWF0ZSBleHByZXNzaW9uc1xuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJpbmRvbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tiaW5kb25BdHRyXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW2JyYWNrZXRQYXJlbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXQub25BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbb3V0cHV0Lm9uQXR0cl0pO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dC5wYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tvdXRwdXQucGFyZW5BdHRyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVUb091dHB1dChvdXRwdXQ6IFByb3BlcnR5QmluZGluZywgZXhwcjogc3RyaW5nLCBpc0Fzc2lnbm1lbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGdldHRlciA9IHRoaXMuJHBhcnNlKGV4cHIpO1xuICAgIGNvbnN0IHNldHRlciA9IGdldHRlci5hc3NpZ247XG4gICAgaWYgKGlzQXNzaWdubWVudCAmJiAhc2V0dGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cHJlc3Npb24gJyR7ZXhwcn0nIGlzIG5vdCBhc3NpZ25hYmxlIWApO1xuICAgIH1cbiAgICBjb25zdCBlbWl0dGVyID0gdGhpcy5jb21wb25lbnRbb3V0cHV0LnByb3BdIGFzIEV2ZW50RW1pdHRlcjxhbnk+O1xuICAgIGlmIChlbWl0dGVyKSB7XG4gICAgICBlbWl0dGVyLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IGlzQXNzaWdubWVudCA/ICh2OiBhbnkpID0+IHNldHRlciAhKHRoaXMuc2NvcGUsIHYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHY6IGFueSkgPT4gZ2V0dGVyKHRoaXMuc2NvcGUsIHsnJGV2ZW50Jzogdn0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBNaXNzaW5nIGVtaXR0ZXIgJyR7b3V0cHV0LnByb3B9JyBvbiBjb21wb25lbnQgJyR7Z2V0VHlwZU5hbWUodGhpcy5jb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUpfSchYCk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJDbGVhbnVwKCkge1xuICAgIGNvbnN0IGRlc3Ryb3lDb21wb25lbnRSZWYgPSB0aGlzLndyYXBDYWxsYmFjaygoKSA9PiB0aGlzLmNvbXBvbmVudFJlZi5kZXN0cm95KCkpO1xuICAgIGxldCBkZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuZWxlbWVudC5vbiAhKCckZGVzdHJveScsICgpID0+IHRoaXMuY29tcG9uZW50U2NvcGUuJGRlc3Ryb3koKSk7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgaWYgKCFkZXN0cm95ZWQpIHtcbiAgICAgICAgZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgICAudW5yZWdpc3RlckFwcGxpY2F0aW9uKHRoaXMuY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICBkZXN0cm95Q29tcG9uZW50UmVmKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRJbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3RvcjsgfVxuXG4gIHByaXZhdGUgdXBkYXRlSW5wdXQocHJvcDogc3RyaW5nLCBwcmV2VmFsdWU6IGFueSwgY3VyclZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICB0aGlzLmlucHV0Q2hhbmdlc1twcm9wXSA9IG5ldyBTaW1wbGVDaGFuZ2UocHJldlZhbHVlLCBjdXJyVmFsdWUsIHByZXZWYWx1ZSA9PT0gY3VyclZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLmlucHV0Q2hhbmdlQ291bnQrKztcbiAgICB0aGlzLmNvbXBvbmVudFtwcm9wXSA9IGN1cnJWYWx1ZTtcbiAgfVxuXG4gIGdyb3VwUHJvamVjdGFibGVOb2RlcygpIHtcbiAgICBsZXQgbmdDb250ZW50U2VsZWN0b3JzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm5nQ29udGVudFNlbGVjdG9ycztcbiAgICByZXR1cm4gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzLCB0aGlzLmVsZW1lbnQuY29udGVudHMgISgpKTtcbiAgfVxufVxuXG4vKipcbiAqIEdyb3VwIGEgc2V0IG9mIERPTSBub2RlcyBpbnRvIGBuZ0NvbnRlbnRgIGdyb3VwcywgYmFzZWQgb24gdGhlIGdpdmVuIGNvbnRlbnQgc2VsZWN0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSwgbm9kZXM6IE5vZGVbXSk6IE5vZGVbXVtdIHtcbiAgY29uc3QgcHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgbGV0IHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlcjtcblxuICBmb3IgKGxldCBpID0gMCwgaWkgPSBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpIDwgaWk7ICsraSkge1xuICAgIHByb2plY3RhYmxlTm9kZXNbaV0gPSBbXTtcbiAgfVxuXG4gIGZvciAobGV0IGogPSAwLCBqaiA9IG5vZGVzLmxlbmd0aDsgaiA8IGpqOyArK2opIHtcbiAgICBjb25zdCBub2RlID0gbm9kZXNbal07XG4gICAgY29uc3QgbmdDb250ZW50SW5kZXggPSBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChub2RlLCBuZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgIGlmIChuZ0NvbnRlbnRJbmRleCAhPSBudWxsKSB7XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzW25nQ29udGVudEluZGV4XS5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9qZWN0YWJsZU5vZGVzO1xufVxuXG5mdW5jdGlvbiBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChlbGVtZW50OiBhbnksIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10pOiBudW1iZXJ8bnVsbCB7XG4gIGNvbnN0IG5nQ29udGVudEluZGljZXM6IG51bWJlcltdID0gW107XG4gIGxldCB3aWxkY2FyZE5nQ29udGVudEluZGV4OiBudW1iZXIgPSAtMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IG5nQ29udGVudFNlbGVjdG9yc1tpXTtcbiAgICBpZiAoc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IGk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXRjaGVzU2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKSB7XG4gICAgICAgIG5nQ29udGVudEluZGljZXMucHVzaChpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmdDb250ZW50SW5kaWNlcy5zb3J0KCk7XG5cbiAgaWYgKHdpbGRjYXJkTmdDb250ZW50SW5kZXggIT09IC0xKSB7XG4gICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKHdpbGRjYXJkTmdDb250ZW50SW5kZXgpO1xuICB9XG4gIHJldHVybiBuZ0NvbnRlbnRJbmRpY2VzLmxlbmd0aCA/IG5nQ29udGVudEluZGljZXNbMF0gOiBudWxsO1xufVxuXG5sZXQgX21hdGNoZXM6ICh0aGlzOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIG1hdGNoZXNTZWxlY3RvcihlbDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghX21hdGNoZXMpIHtcbiAgICBjb25zdCBlbFByb3RvID0gPGFueT5FbGVtZW50LnByb3RvdHlwZTtcbiAgICBfbWF0Y2hlcyA9IGVsUHJvdG8ubWF0Y2hlcyB8fCBlbFByb3RvLm1hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBlbFByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgfVxuICByZXR1cm4gZWwubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFID8gX21hdGNoZXMuY2FsbChlbCwgc2VsZWN0b3IpIDogZmFsc2U7XG59XG4iXX0=