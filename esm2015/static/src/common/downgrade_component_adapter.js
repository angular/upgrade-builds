/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
        const linkFns = projectableNodes.map(nodes => this.$compile(nodes)); /** @type {?} */
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
        /** @type {?} */
        const providers = [{ provide: $SCOPE, useValue: this.componentScope }];
        /** @type {?} */
        const childInjector = Injector.create({ providers: providers, parent: this.parentInjector, name: 'DowngradeComponentAdapter' });
        this.componentRef =
            this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        this.viewChangeDetector = this.componentRef.injector.get(ChangeDetectorRef);
        this.changeDetector = this.componentRef.changeDetectorRef;
        this.component = this.componentRef.instance;
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
                /** @type {?} */
                let unwatch = this.componentScope.$watch(() => {
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
                /** @type {?} */
                const watchFn = (prop => (currValue, prevValue) => this.updateInput(prop, prevValue, currValue))(input.prop);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        /** @type {?} */
        const detectChanges = () => this.changeDetector.detectChanges();
        /** @type {?} */
        const prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && (/** @type {?} */ (prototype)).ngOnChanges);
        this.componentScope.$watch(() => this.inputChangeCount, this.wrapCallback(() => {
            // Invoke `ngOnChanges()`
            if (this.implementsOnChanges) {
                /** @type {?} */
                const inputChanges = this.inputChanges;
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
            /** @type {?} */
            let unwatch = this.componentScope.$watch(() => {
                /** @type {?} */ ((unwatch))();
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
        const emitter = /** @type {?} */ (this.component[output.prop]);
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
        /** @type {?} */
        const destroyComponentRef = this.wrapCallback(() => this.componentRef.destroy());
        /** @type {?} */
        let destroyed = false; /** @type {?} */
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
        /** @type {?} */
        let ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, /** @type {?} */ ((this.element.contents))());
    }
}
if (false) {
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
        const elProto = /** @type {?} */ (Element.prototype);
        _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
            elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
    }
    return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL2NvbW1vbi9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsY0FBYyxFQUFFLGlCQUFpQixFQUFnRCxRQUFRLEVBQWEsWUFBWSxFQUFpQyxXQUFXLEVBQUUsbUJBQW1CLEVBQU8sTUFBTSxlQUFlLENBQUM7QUFHeE4sT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDbkMsT0FBTyxFQUFDLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBRXJFLE1BQU0sYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUVGLE1BQU0sT0FBTyx5QkFBeUI7Ozs7Ozs7Ozs7Ozs7SUFhcEMsWUFDWSxTQUEyQyxLQUEwQixFQUNyRSxPQUErQixPQUFtQyxFQUNsRSxnQkFBa0MsU0FBbUMsRUFDckUsVUFBMkMsTUFBNkIsRUFDeEUsa0JBQ0E7UUFMQSxZQUFPLEdBQVAsT0FBTztRQUFvQyxVQUFLLEdBQUwsS0FBSyxDQUFxQjtRQUNyRSxVQUFLLEdBQUwsS0FBSztRQUEwQixZQUFPLEdBQVAsT0FBTyxDQUE0QjtRQUNsRSxtQkFBYyxHQUFkLGNBQWM7UUFBb0IsY0FBUyxHQUFULFNBQVMsQ0FBMEI7UUFDckUsYUFBUSxHQUFSLFFBQVE7UUFBbUMsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7UUFDeEUscUJBQWdCLEdBQWhCLGdCQUFnQjtRQUNoQixpQkFBWSxHQUFaLFlBQVk7bUNBbEJNLEtBQUs7Z0NBQ0EsQ0FBQzs0QkFDRSxFQUFFO1FBaUJ0QyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNwQzs7OztJQUVELGVBQWU7O1FBQ2IsTUFBTSx3QkFBd0IsR0FBYSxFQUFFLENBQUM7O1FBQzlDLE1BQU0sZ0JBQWdCLEdBQWEsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7O1FBQ2hFLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztVQUVwRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7UUFFbEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQWEsRUFBRSxFQUFFO2dCQUNuQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7a0JBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUs7YUFDNUIsQ0FBQyxDQUFDO1NBQ0osQ0FBQyxDQUFDO1FBRUgsT0FBTyx3QkFBd0IsQ0FBQztLQUNqQzs7Ozs7SUFFRCxlQUFlLENBQUMsZ0JBQTBCOztRQUN4QyxNQUFNLFNBQVMsR0FBcUIsQ0FBQyxFQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDOztRQUN2RixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUNqQyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLDJCQUEyQixFQUFDLENBQUMsQ0FBQztRQUU1RixJQUFJLENBQUMsWUFBWTtZQUNiLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLGdCQUFnQixFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuRixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDO1FBQzFELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7O1FBTTVDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEUsSUFBSSxXQUFXLEVBQUU7WUFDZixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7aUJBQzlDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztTQUNqRjtRQUVELGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUM3Qzs7Ozs7O0lBRUQsV0FBVyxDQUFDLFdBQW9CLEVBQUUsZUFBZSxHQUFHLElBQUk7O1FBQ3RELE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O1FBQ3pCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1FBQ2xELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztZQUN0QyxNQUFNLEtBQUssR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7WUFDOUUsSUFBSSxJQUFJLEdBQWdCLElBQUksQ0FBQztZQUU3QixJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFOztnQkFDcEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTs7b0JBQ3hCLElBQUksU0FBUyxHQUFHLGFBQWEsQ0FBQztvQkFDOUIsT0FBTyxDQUFDLFNBQWMsRUFBRSxFQUFFOzt3QkFFeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUU7NEJBQ3ZDLElBQUksU0FBUyxLQUFLLGFBQWEsRUFBRTtnQ0FDL0IsU0FBUyxHQUFHLFNBQVMsQ0FBQzs2QkFDdkI7NEJBRUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUM3QyxTQUFTLEdBQUcsU0FBUyxDQUFDO3lCQUN2QjtxQkFDRixDQUFDO2lCQUNILENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2YsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDOztnQkFLdEMsSUFBSSxPQUFPLEdBQWtCLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTt1Q0FDM0QsT0FBTztvQkFDUCxPQUFPLEdBQUcsSUFBSSxDQUFDO29CQUNmLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7aUJBQzlCLENBQUMsQ0FBQzthQUVKO2lCQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQy9DLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCO2lCQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ2xELElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2pDO2lCQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ2pELElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ2hDO2lCQUFNLElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDdkQsSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUN0QztZQUNELElBQUksSUFBSSxJQUFJLElBQUksRUFBRTs7Z0JBQ2hCLE1BQU0sT0FBTyxHQUNULENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQWMsRUFBRSxTQUFjLEVBQUUsRUFBRSxDQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQzthQUMzQztTQUNGOztRQUdELE1BQU0sYUFBYSxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLENBQUM7O1FBQ2hFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksbUJBQVksU0FBUyxFQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFL0UsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFOztZQUU3RSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTs7Z0JBQzVCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO2dCQUN2QixtQkFBWSxJQUFJLENBQUMsU0FBUyxFQUFDLENBQUMsV0FBVyxvQkFBQyxZQUFZLEdBQUcsQ0FBQzthQUN6RDtZQUVELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7WUFHdkMsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDcEIsYUFBYSxFQUFFLENBQUM7YUFDakI7U0FDRixDQUFDLENBQUMsQ0FBQzs7UUFHSixJQUFJLGVBQWUsRUFBRTtZQUNuQixJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7U0FDOUQ7OztRQUlELElBQUksV0FBVyxJQUFJLENBQUMsZUFBZSxFQUFFOztZQUNuQyxJQUFJLE9BQU8sR0FBa0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO21DQUMzRCxPQUFPO2dCQUNQLE9BQU8sR0FBRyxJQUFJLENBQUM7O2dCQUVmLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFpQixjQUFjLENBQUMsQ0FBQztnQkFDdkUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQy9DLENBQUMsQ0FBQztTQUNKO0tBQ0Y7Ozs7SUFFRCxZQUFZOztRQUNWLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O1FBQ3pCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3BELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztZQUN2QyxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7WUFDakYsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDOztZQUNoRixNQUFNLGdCQUFnQixHQUNsQixLQUFLLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQzs7WUFFdEYsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUN6RDtZQUNELElBQUksS0FBSyxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUMxQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQy9EO1lBQ0QsSUFBSSxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdEQ7WUFDRCxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUMxQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzthQUN6RDtTQUNGO0tBQ0Y7Ozs7Ozs7SUFFTyxpQkFBaUIsQ0FBQyxNQUF1QixFQUFFLElBQVksRUFBRSxlQUF3QixLQUFLOztRQUM1RixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOztRQUNqQyxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxJQUFJLHNCQUFzQixDQUFDLENBQUM7U0FDNUQ7O1FBQ0QsTUFBTSxPQUFPLHFCQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBc0IsRUFBQztRQUNqRSxJQUFJLE9BQU8sRUFBRTtZQUNYLE9BQU8sQ0FBQyxTQUFTLENBQUM7Z0JBQ2hCLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBTSxFQUFFLEVBQUUsb0JBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUMsUUFBUSxFQUFFLENBQUMsRUFBQyxDQUFDO2FBQ25FLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxNQUFNLElBQUksS0FBSyxDQUNYLG9CQUFvQixNQUFNLENBQUMsSUFBSSxtQkFBbUIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNsSDs7Ozs7SUFHSCxlQUFlOztRQUNiLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7O1FBQ2pGLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztVQUV0QixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUU7UUFDbEUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtZQUN2QyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNkLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztxQkFDOUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3JFLG1CQUFtQixFQUFFLENBQUM7YUFDdkI7U0FDRixDQUFDLENBQUM7S0FDSjs7OztJQUVELFdBQVcsS0FBZSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUU7Ozs7Ozs7SUFFdEQsV0FBVyxDQUFDLElBQVksRUFBRSxTQUFjLEVBQUUsU0FBYztRQUM5RCxJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUM1QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksWUFBWSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDO1NBQzNGO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUM7Ozs7O0lBR25DLHFCQUFxQjs7UUFDbkIsSUFBSSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLENBQUM7UUFDbEUsT0FBTyxvQkFBb0IsQ0FBQyxrQkFBa0IscUJBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssQ0FBQztLQUM1RTtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFLRCxNQUFNLFVBQVUsb0JBQW9CLENBQUMsa0JBQTRCLEVBQUUsS0FBYTs7SUFDOUUsTUFBTSxnQkFBZ0IsR0FBYSxFQUFFLENBQUM7O0lBQ3RDLElBQUksc0JBQXNCLENBQVM7SUFFbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQzNELGdCQUFnQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUMxQjtJQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7O1FBQzlDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7UUFDdEIsTUFBTSxjQUFjLEdBQUcsMEJBQTBCLENBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDNUUsSUFBSSxjQUFjLElBQUksSUFBSSxFQUFFO1lBQzFCLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QztLQUNGO0lBRUQsT0FBTyxnQkFBZ0IsQ0FBQztDQUN6Qjs7Ozs7O0FBRUQsU0FBUywwQkFBMEIsQ0FBQyxPQUFZLEVBQUUsa0JBQTRCOztJQUM1RSxNQUFNLGdCQUFnQixHQUFhLEVBQUUsQ0FBQzs7SUFDdEMsSUFBSSxzQkFBc0IsR0FBVyxDQUFDLENBQUMsQ0FBQztJQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztRQUNsRCxNQUFNLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QyxJQUFJLFFBQVEsS0FBSyxHQUFHLEVBQUU7WUFDcEIsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO1NBQzVCO2FBQU07WUFDTCxJQUFJLGVBQWUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUU7Z0JBQ3RDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQjtTQUNGO0tBQ0Y7SUFDRCxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUV4QixJQUFJLHNCQUFzQixLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ2pDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Q0FDN0Q7O0FBRUQsSUFBSSxRQUFRLENBQTJDOzs7Ozs7QUFFdkQsU0FBUyxlQUFlLENBQUMsRUFBTyxFQUFFLFFBQWdCO0lBQ2hELElBQUksQ0FBQyxRQUFRLEVBQUU7O1FBQ2IsTUFBTSxPQUFPLHFCQUFRLE9BQU8sQ0FBQyxTQUFTLEVBQUM7UUFDdkMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLGVBQWUsSUFBSSxPQUFPLENBQUMsa0JBQWtCO1lBQy9FLE9BQU8sQ0FBQyxpQkFBaUIsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLHFCQUFxQixDQUFDO0tBQzVGO0lBQ0QsT0FBTyxFQUFFLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Q0FDaEYiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXBwbGljYXRpb25SZWYsIENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBTdGF0aWNQcm92aWRlciwgVGVzdGFiaWxpdHksIFRlc3RhYmlsaXR5UmVnaXN0cnksIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHtQcm9wZXJ0eUJpbmRpbmd9IGZyb20gJy4vY29tcG9uZW50X2luZm8nO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Z2V0Q29tcG9uZW50TmFtZSwgaG9va3VwTmdNb2RlbCwgc3RyaWN0RXF1YWxzfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBJTklUSUFMX1ZBTFVFID0ge1xuICBfX1VOSU5JVElBTElaRURfXzogdHJ1ZVxufTtcblxuZXhwb3J0IGNsYXNzIERvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXIge1xuICBwcml2YXRlIGltcGxlbWVudHNPbkNoYW5nZXMgPSBmYWxzZTtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZUNvdW50OiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGlucHV0Q2hhbmdlczogU2ltcGxlQ2hhbmdlcyA9IHt9O1xuICBwcml2YXRlIGNvbXBvbmVudFNjb3BlOiBhbmd1bGFyLklTY29wZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgY29tcG9uZW50UmVmICE6IENvbXBvbmVudFJlZjxhbnk+O1xuICBwcml2YXRlIGNvbXBvbmVudDogYW55O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvciAhOiBDaGFuZ2VEZXRlY3RvclJlZjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgdmlld0NoYW5nZURldGVjdG9yICE6IENoYW5nZURldGVjdG9yUmVmO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsXG4gICAgICBwcml2YXRlIHNjb3BlOiBhbmd1bGFyLklTY29wZSwgcHJpdmF0ZSBuZ01vZGVsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcixcbiAgICAgIHByaXZhdGUgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yLCBwcml2YXRlICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLFxuICAgICAgcHJpdmF0ZSAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsIHByaXZhdGUgJHBhcnNlOiBhbmd1bGFyLklQYXJzZVNlcnZpY2UsXG4gICAgICBwcml2YXRlIGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55PixcbiAgICAgIHByaXZhdGUgd3JhcENhbGxiYWNrOiA8VD4oY2I6ICgpID0+IFQpID0+ICgpID0+IFQpIHtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlID0gc2NvcGUuJG5ldygpO1xuICB9XG5cbiAgY29tcGlsZUNvbnRlbnRzKCk6IE5vZGVbXVtdIHtcbiAgICBjb25zdCBjb21waWxlZFByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gW107XG4gICAgY29uc3QgcHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSB0aGlzLmdyb3VwUHJvamVjdGFibGVOb2RlcygpO1xuICAgIGNvbnN0IGxpbmtGbnMgPSBwcm9qZWN0YWJsZU5vZGVzLm1hcChub2RlcyA9PiB0aGlzLiRjb21waWxlKG5vZGVzKSk7XG5cbiAgICB0aGlzLmVsZW1lbnQuZW1wdHkgISgpO1xuXG4gICAgbGlua0Zucy5mb3JFYWNoKGxpbmtGbiA9PiB7XG4gICAgICBsaW5rRm4odGhpcy5zY29wZSwgKGNsb25lOiBOb2RlW10pID0+IHtcbiAgICAgICAgY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzLnB1c2goY2xvbmUpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kICEoY2xvbmUpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzO1xuICB9XG5cbiAgY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdKSB7XG4gICAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW3twcm92aWRlOiAkU0NPUEUsIHVzZVZhbHVlOiB0aGlzLmNvbXBvbmVudFNjb3BlfV07XG4gICAgY29uc3QgY2hpbGRJbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZShcbiAgICAgICAge3Byb3ZpZGVyczogcHJvdmlkZXJzLCBwYXJlbnQ6IHRoaXMucGFyZW50SW5qZWN0b3IsIG5hbWU6ICdEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyJ30pO1xuXG4gICAgdGhpcy5jb21wb25lbnRSZWYgPVxuICAgICAgICB0aGlzLmNvbXBvbmVudEZhY3RvcnkuY3JlYXRlKGNoaWxkSW5qZWN0b3IsIHByb2plY3RhYmxlTm9kZXMsIHRoaXMuZWxlbWVudFswXSk7XG4gICAgdGhpcy52aWV3Q2hhbmdlRGV0ZWN0b3IgPSB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IgPSB0aGlzLmNvbXBvbmVudFJlZi5jaGFuZ2VEZXRlY3RvclJlZjtcbiAgICB0aGlzLmNvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50UmVmLmluc3RhbmNlO1xuXG4gICAgLy8gdGVzdGFiaWxpdHkgaG9vayBpcyBjb21tb25seSBhZGRlZCBkdXJpbmcgY29tcG9uZW50IGJvb3RzdHJhcCBpblxuICAgIC8vIHBhY2thZ2VzL2NvcmUvc3JjL2FwcGxpY2F0aW9uX3JlZi5ib290c3RyYXAoKVxuICAgIC8vIGluIGRvd25ncmFkZWQgYXBwbGljYXRpb24sIGNvbXBvbmVudCBjcmVhdGlvbiB3aWxsIHRha2UgcGxhY2UgaGVyZSBhcyB3ZWxsIGFzIGFkZGluZyB0aGVcbiAgICAvLyB0ZXN0YWJpbGl0eSBob29rLlxuICAgIGNvbnN0IHRlc3RhYmlsaXR5ID0gdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5LCBudWxsKTtcbiAgICBpZiAodGVzdGFiaWxpdHkpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KVxuICAgICAgICAgIC5yZWdpc3RlckFwcGxpY2F0aW9uKHRoaXMuY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQsIHRlc3RhYmlsaXR5KTtcbiAgICB9XG5cbiAgICBob29rdXBOZ01vZGVsKHRoaXMubmdNb2RlbCwgdGhpcy5jb21wb25lbnQpO1xuICB9XG5cbiAgc2V0dXBJbnB1dHMobmVlZHNOZ1pvbmU6IGJvb2xlYW4sIHByb3BhZ2F0ZURpZ2VzdCA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cnM7XG4gICAgY29uc3QgaW5wdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmlucHV0cyB8fCBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW5wdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKGlucHV0c1tpXS5wcm9wTmFtZSwgaW5wdXRzW2ldLnRlbXBsYXRlTmFtZSk7XG4gICAgICBsZXQgZXhwcjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYXR0cikpIHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZUZuID0gKHByb3AgPT4ge1xuICAgICAgICAgIGxldCBwcmV2VmFsdWUgPSBJTklUSUFMX1ZBTFVFO1xuICAgICAgICAgIHJldHVybiAoY3VyclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSwgYm90aCBgJG9ic2VydmUoKWAgYW5kIGAkd2F0Y2goKWAgd2lsbCBjYWxsIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIXN0cmljdEVxdWFscyhwcmV2VmFsdWUsIGN1cnJWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKHByZXZWYWx1ZSA9PT0gSU5JVElBTF9WQUxVRSkge1xuICAgICAgICAgICAgICAgIHByZXZWYWx1ZSA9IGN1cnJWYWx1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuICAgICAgICAgICAgICBwcmV2VmFsdWUgPSBjdXJyVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkoaW5wdXQucHJvcCk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKGlucHV0LmF0dHIsIG9ic2VydmVGbik7XG5cbiAgICAgICAgLy8gVXNlIGAkd2F0Y2goKWAgKGluIGFkZGl0aW9uIHRvIGAkb2JzZXJ2ZSgpYCkgaW4gb3JkZXIgdG8gaW5pdGlhbGl6ZSB0aGUgaW5wdXQgaW4gdGltZVxuICAgICAgICAvLyBmb3IgYG5nT25DaGFuZ2VzKClgLiBUaGlzIGlzIG5lY2Vzc2FyeSBpZiB3ZSBhcmUgYWxyZWFkeSBpbiBhIGAkZGlnZXN0YCwgd2hpY2ggbWVhbnMgdGhhdFxuICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAgKHdoaWNoIGlzIGNhbGxlZCBieSBhIHdhdGNoZXIpIHdpbGwgcnVuIGJlZm9yZSB0aGUgYCRvYnNlcnZlKClgIGNhbGxiYWNrLlxuICAgICAgICBsZXQgdW53YXRjaDogRnVuY3Rpb258bnVsbCA9IHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgICB1bndhdGNoID0gbnVsbDtcbiAgICAgICAgICBvYnNlcnZlRm4oYXR0cnNbaW5wdXQuYXR0cl0pO1xuICAgICAgICB9KTtcblxuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5iaW5kQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJpbmRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5icmFja2V0QXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJpbmRvbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5iaW5kb25BdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJyYWNrZXRQYXJlbkF0dHJdO1xuICAgICAgfVxuICAgICAgaWYgKGV4cHIgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCB3YXRjaEZuID1cbiAgICAgICAgICAgIChwcm9wID0+IChjdXJyVmFsdWU6IGFueSwgcHJldlZhbHVlOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpKShpbnB1dC5wcm9wKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goZXhwciwgd2F0Y2hGbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW52b2tlIGBuZ09uQ2hhbmdlcygpYCBhbmQgQ2hhbmdlIERldGVjdGlvbiAod2hlbiBuZWNlc3NhcnkpXG4gICAgY29uc3QgZGV0ZWN0Q2hhbmdlcyA9ICgpID0+IHRoaXMuY2hhbmdlRGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIGNvbnN0IHByb3RvdHlwZSA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5jb21wb25lbnRUeXBlLnByb3RvdHlwZTtcbiAgICB0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMgPSAhIShwcm90b3R5cGUgJiYgKDxPbkNoYW5nZXM+cHJvdG90eXBlKS5uZ09uQ2hhbmdlcyk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB0aGlzLmlucHV0Q2hhbmdlQ291bnQsIHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHtcbiAgICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWBcbiAgICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaW5wdXRDaGFuZ2VzID0gdGhpcy5pbnB1dENoYW5nZXM7XG4gICAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzID0ge307XG4gICAgICAgICg8T25DaGFuZ2VzPnRoaXMuY29tcG9uZW50KS5uZ09uQ2hhbmdlcyhpbnB1dENoYW5nZXMgISk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudmlld0NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuXG4gICAgICAvLyBJZiBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gd2hlbiBpbnB1dHMgY2hhbmdlLlxuICAgICAgaWYgKCFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgICAgZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8vIElmIG5vdCBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gb24gZXZlcnkgZGlnZXN0XG4gICAgaWYgKHByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2godGhpcy53cmFwQ2FsbGJhY2soZGV0ZWN0Q2hhbmdlcykpO1xuICAgIH1cblxuICAgIC8vIElmIG5lY2Vzc2FyeSwgYXR0YWNoIHRoZSB2aWV3IHNvIHRoYXQgaXQgd2lsbCBiZSBkaXJ0eS1jaGVja2VkLlxuICAgIC8vIChBbGxvdyB0aW1lIGZvciB0aGUgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgdG8gYmUgc2V0IGFuZCBgbmdPbkNoYW5nZXMoKWAgdG8gYmUgY2FsbGVkLilcbiAgICBpZiAobmVlZHNOZ1pvbmUgfHwgIXByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgbGV0IHVud2F0Y2g6IEZ1bmN0aW9ufG51bGwgPSB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgIHVud2F0Y2ggISgpO1xuICAgICAgICB1bndhdGNoID0gbnVsbDtcblxuICAgICAgICBjb25zdCBhcHBSZWYgPSB0aGlzLnBhcmVudEluamVjdG9yLmdldDxBcHBsaWNhdGlvblJlZj4oQXBwbGljYXRpb25SZWYpO1xuICAgICAgICBhcHBSZWYuYXR0YWNoVmlldyh0aGlzLmNvbXBvbmVudFJlZi5ob3N0Vmlldyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXR1cE91dHB1dHMoKSB7XG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLmF0dHJzO1xuICAgIGNvbnN0IG91dHB1dHMgPSB0aGlzLmNvbXBvbmVudEZhY3Rvcnkub3V0cHV0cyB8fCBbXTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG91dHB1dHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IG91dHB1dCA9IG5ldyBQcm9wZXJ0eUJpbmRpbmcob3V0cHV0c1tqXS5wcm9wTmFtZSwgb3V0cHV0c1tqXS50ZW1wbGF0ZU5hbWUpO1xuICAgICAgY29uc3QgYmluZG9uQXR0ciA9IG91dHB1dC5iaW5kb25BdHRyLnN1YnN0cmluZygwLCBvdXRwdXQuYmluZG9uQXR0ci5sZW5ndGggLSA2KTtcbiAgICAgIGNvbnN0IGJyYWNrZXRQYXJlbkF0dHIgPVxuICAgICAgICAgIGBbKCR7b3V0cHV0LmJyYWNrZXRQYXJlbkF0dHIuc3Vic3RyaW5nKDIsIG91dHB1dC5icmFja2V0UGFyZW5BdHRyLmxlbmd0aCAtIDgpfSldYDtcbiAgICAgIC8vIG9yZGVyIGJlbG93IGlzIGltcG9ydGFudCAtIGZpcnN0IHVwZGF0ZSBiaW5kaW5ncyB0aGVuIGV2YWx1YXRlIGV4cHJlc3Npb25zXG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYmluZG9uQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW2JpbmRvbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShicmFja2V0UGFyZW5BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbYnJhY2tldFBhcmVuQXR0cl0sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dC5vbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tvdXRwdXQub25BdHRyXSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkob3V0cHV0LnBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW291dHB1dC5wYXJlbkF0dHJdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN1YnNjcmliZVRvT3V0cHV0KG91dHB1dDogUHJvcGVydHlCaW5kaW5nLCBleHByOiBzdHJpbmcsIGlzQXNzaWdubWVudDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgY29uc3QgZ2V0dGVyID0gdGhpcy4kcGFyc2UoZXhwcik7XG4gICAgY29uc3Qgc2V0dGVyID0gZ2V0dGVyLmFzc2lnbjtcbiAgICBpZiAoaXNBc3NpZ25tZW50ICYmICFzZXR0ZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwcmVzc2lvbiAnJHtleHByfScgaXMgbm90IGFzc2lnbmFibGUhYCk7XG4gICAgfVxuICAgIGNvbnN0IGVtaXR0ZXIgPSB0aGlzLmNvbXBvbmVudFtvdXRwdXQucHJvcF0gYXMgRXZlbnRFbWl0dGVyPGFueT47XG4gICAgaWYgKGVtaXR0ZXIpIHtcbiAgICAgIGVtaXR0ZXIuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogaXNBc3NpZ25tZW50ID8gKHY6IGFueSkgPT4gc2V0dGVyICEodGhpcy5zY29wZSwgdikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodjogYW55KSA9PiBnZXR0ZXIodGhpcy5zY29wZSwgeyckZXZlbnQnOiB2fSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYE1pc3NpbmcgZW1pdHRlciAnJHtvdXRwdXQucHJvcH0nIG9uIGNvbXBvbmVudCAnJHtnZXRDb21wb25lbnROYW1lKHRoaXMuY29tcG9uZW50RmFjdG9yeS5jb21wb25lbnRUeXBlKX0nIWApO1xuICAgIH1cbiAgfVxuXG4gIHJlZ2lzdGVyQ2xlYW51cCgpIHtcbiAgICBjb25zdCBkZXN0cm95Q29tcG9uZW50UmVmID0gdGhpcy53cmFwQ2FsbGJhY2soKCkgPT4gdGhpcy5jb21wb25lbnRSZWYuZGVzdHJveSgpKTtcbiAgICBsZXQgZGVzdHJveWVkID0gZmFsc2U7XG5cbiAgICB0aGlzLmVsZW1lbnQub24gISgnJGRlc3Ryb3knLCAoKSA9PiB0aGlzLmNvbXBvbmVudFNjb3BlLiRkZXN0cm95KCkpO1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICAgIGlmICghZGVzdHJveWVkKSB7XG4gICAgICAgIGRlc3Ryb3llZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KVxuICAgICAgICAgICAgLnVucmVnaXN0ZXJBcHBsaWNhdGlvbih0aGlzLmNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgZGVzdHJveUNvbXBvbmVudFJlZigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0SW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3I7IH1cblxuICBwcml2YXRlIHVwZGF0ZUlucHV0KHByb3A6IHN0cmluZywgcHJldlZhbHVlOiBhbnksIGN1cnJWYWx1ZTogYW55KSB7XG4gICAgaWYgKHRoaXMuaW1wbGVtZW50c09uQ2hhbmdlcykge1xuICAgICAgdGhpcy5pbnB1dENoYW5nZXNbcHJvcF0gPSBuZXcgU2ltcGxlQ2hhbmdlKHByZXZWYWx1ZSwgY3VyclZhbHVlLCBwcmV2VmFsdWUgPT09IGN1cnJWYWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5pbnB1dENoYW5nZUNvdW50Kys7XG4gICAgdGhpcy5jb21wb25lbnRbcHJvcF0gPSBjdXJyVmFsdWU7XG4gIH1cblxuICBncm91cFByb2plY3RhYmxlTm9kZXMoKSB7XG4gICAgbGV0IG5nQ29udGVudFNlbGVjdG9ycyA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5uZ0NvbnRlbnRTZWxlY3RvcnM7XG4gICAgcmV0dXJuIGdyb3VwTm9kZXNCeVNlbGVjdG9yKG5nQ29udGVudFNlbGVjdG9ycywgdGhpcy5lbGVtZW50LmNvbnRlbnRzICEoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBHcm91cCBhIHNldCBvZiBET00gbm9kZXMgaW50byBgbmdDb250ZW50YCBncm91cHMsIGJhc2VkIG9uIHRoZSBnaXZlbiBjb250ZW50IHNlbGVjdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwTm9kZXNCeVNlbGVjdG9yKG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10sIG5vZGVzOiBOb2RlW10pOiBOb2RlW11bXSB7XG4gIGNvbnN0IHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gW107XG4gIGxldCB3aWxkY2FyZE5nQ29udGVudEluZGV4OiBudW1iZXI7XG5cbiAgZm9yIChsZXQgaSA9IDAsIGlpID0gbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aDsgaSA8IGlpOyArK2kpIHtcbiAgICBwcm9qZWN0YWJsZU5vZGVzW2ldID0gW107XG4gIH1cblxuICBmb3IgKGxldCBqID0gMCwgamogPSBub2Rlcy5sZW5ndGg7IGogPCBqajsgKytqKSB7XG4gICAgY29uc3Qgbm9kZSA9IG5vZGVzW2pdO1xuICAgIGNvbnN0IG5nQ29udGVudEluZGV4ID0gZmluZE1hdGNoaW5nTmdDb250ZW50SW5kZXgobm9kZSwgbmdDb250ZW50U2VsZWN0b3JzKTtcbiAgICBpZiAobmdDb250ZW50SW5kZXggIT0gbnVsbCkge1xuICAgICAgcHJvamVjdGFibGVOb2Rlc1tuZ0NvbnRlbnRJbmRleF0ucHVzaChub2RlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJvamVjdGFibGVOb2Rlcztcbn1cblxuZnVuY3Rpb24gZmluZE1hdGNoaW5nTmdDb250ZW50SW5kZXgoZWxlbWVudDogYW55LCBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdKTogbnVtYmVyfG51bGwge1xuICBjb25zdCBuZ0NvbnRlbnRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICBsZXQgd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyID0gLTE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBuZ0NvbnRlbnRTZWxlY3RvcnNbaV07XG4gICAgaWYgKHNlbGVjdG9yID09PSAnKicpIHtcbiAgICAgIHdpbGRjYXJkTmdDb250ZW50SW5kZXggPSBpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWF0Y2hlc1NlbGVjdG9yKGVsZW1lbnQsIHNlbGVjdG9yKSkge1xuICAgICAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2goaSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5nQ29udGVudEluZGljZXMuc29ydCgpO1xuXG4gIGlmICh3aWxkY2FyZE5nQ29udGVudEluZGV4ICE9PSAtMSkge1xuICAgIG5nQ29udGVudEluZGljZXMucHVzaCh3aWxkY2FyZE5nQ29udGVudEluZGV4KTtcbiAgfVxuICByZXR1cm4gbmdDb250ZW50SW5kaWNlcy5sZW5ndGggPyBuZ0NvbnRlbnRJbmRpY2VzWzBdIDogbnVsbDtcbn1cblxubGV0IF9tYXRjaGVzOiAodGhpczogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PiBib29sZWFuO1xuXG5mdW5jdGlvbiBtYXRjaGVzU2VsZWN0b3IoZWw6IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIV9tYXRjaGVzKSB7XG4gICAgY29uc3QgZWxQcm90byA9IDxhbnk+RWxlbWVudC5wcm90b3R5cGU7XG4gICAgX21hdGNoZXMgPSBlbFByb3RvLm1hdGNoZXMgfHwgZWxQcm90by5tYXRjaGVzU2VsZWN0b3IgfHwgZWxQcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgZWxQcm90by5tc01hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLm9NYXRjaGVzU2VsZWN0b3IgfHwgZWxQcm90by53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG4gIH1cbiAgcmV0dXJuIGVsLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSA/IF9tYXRjaGVzLmNhbGwoZWwsIHNlbGVjdG9yKSA6IGZhbHNlO1xufVxuIl19