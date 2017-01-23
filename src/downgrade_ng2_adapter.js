/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ReflectiveInjector, SimpleChange } from '@angular/core/index';
import { NG1_SCOPE } from './constants';
import { hookupNgModel } from './util';
const /** @type {?} */ INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
export class DowngradeNg2ComponentAdapter {
    /**
     * @param {?} info
     * @param {?} element
     * @param {?} attrs
     * @param {?} scope
     * @param {?} ngModel
     * @param {?} parentInjector
     * @param {?} parse
     * @param {?} componentFactory
     */
    constructor(info, element, attrs, scope, ngModel, parentInjector, parse, componentFactory) {
        this.info = info;
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.ngModel = ngModel;
        this.parentInjector = parentInjector;
        this.parse = parse;
        this.componentFactory = componentFactory;
        this.component = null;
        this.inputChangeCount = 0;
        this.inputChanges = null;
        this.componentRef = null;
        this.changeDetector = null;
        this.componentScope = scope.$new();
    }
    /**
     * @param {?} projectableNodes
     * @return {?}
     */
    bootstrapNg2(projectableNodes) {
        const /** @type {?} */ childInjector = ReflectiveInjector.resolveAndCreate([{ provide: NG1_SCOPE, useValue: this.componentScope }], this.parentInjector);
        this.componentRef =
            this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        this.changeDetector = this.componentRef.changeDetectorRef;
        this.component = this.componentRef.instance;
        hookupNgModel(this.ngModel, this.component);
    }
    /**
     * @return {?}
     */
    setupInputs() {
        const /** @type {?} */ attrs = this.attrs;
        const /** @type {?} */ inputs = this.info.inputs || [];
        for (let /** @type {?} */ i = 0; i < inputs.length; i++) {
            const /** @type {?} */ input = inputs[i];
            let /** @type {?} */ expr = null;
            if (attrs.hasOwnProperty(input.attr)) {
                const /** @type {?} */ observeFn = ((prop /** TODO #9100 */) => {
                    let /** @type {?} */ prevValue = INITIAL_VALUE;
                    return (value /** TODO #9100 */) => {
                        if (this.inputChanges !== null) {
                            this.inputChangeCount++;
                            this.inputChanges[prop] = new SimpleChange(value, prevValue === INITIAL_VALUE ? value : prevValue, prevValue === INITIAL_VALUE);
                            prevValue = value;
                        }
                        this.component[prop] = value;
                    };
                })(input.prop);
                attrs.$observe(input.attr, observeFn);
            }
            else if (attrs.hasOwnProperty(input.bindAttr)) {
                expr = ((attrs) /** TODO #9100 */)[input.bindAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketAttr)) {
                expr = ((attrs) /** TODO #9100 */)[input.bracketAttr];
            }
            else if (attrs.hasOwnProperty(input.bindonAttr)) {
                expr = ((attrs) /** TODO #9100 */)[input.bindonAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
                expr = ((attrs) /** TODO #9100 */)[input.bracketParenAttr];
            }
            if (expr != null) {
                const /** @type {?} */ watchFn = ((prop /** TODO #9100 */) => (value /** TODO #9100 */, prevValue /** TODO #9100 */) => {
                    if (this.inputChanges != null) {
                        this.inputChangeCount++;
                        this.inputChanges[prop] = new SimpleChange(prevValue, value, prevValue === value);
                    }
                    this.component[prop] = value;
                })(input.prop);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        const /** @type {?} */ prototype = this.info.type.prototype;
        if (prototype && ((prototype)).ngOnChanges) {
            // Detect: OnChanges interface
            this.inputChanges = {};
            this.componentScope.$watch(() => this.inputChangeCount, () => {
                const /** @type {?} */ inputChanges = this.inputChanges;
                this.inputChanges = {};
                ((this.component)).ngOnChanges(inputChanges);
            });
        }
        this.componentScope.$watch(() => this.changeDetector && this.changeDetector.detectChanges());
    }
    /**
     * @return {?}
     */
    setupOutputs() {
        const /** @type {?} */ attrs = this.attrs;
        const /** @type {?} */ outputs = this.info.outputs || [];
        for (let /** @type {?} */ j = 0; j < outputs.length; j++) {
            const /** @type {?} */ output = outputs[j];
            let /** @type {?} */ expr = null;
            let /** @type {?} */ assignExpr = false;
            const /** @type {?} */ bindonAttr = output.bindonAttr ? output.bindonAttr.substring(0, output.bindonAttr.length - 6) : null;
            const /** @type {?} */ bracketParenAttr = output.bracketParenAttr ?
                `[(${output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8)})]` :
                null;
            if (attrs.hasOwnProperty(output.onAttr)) {
                expr = ((attrs) /** TODO #9100 */)[output.onAttr];
            }
            else if (attrs.hasOwnProperty(output.parenAttr)) {
                expr = ((attrs) /** TODO #9100 */)[output.parenAttr];
            }
            else if (attrs.hasOwnProperty(bindonAttr)) {
                expr = ((attrs) /** TODO #9100 */)[bindonAttr];
                assignExpr = true;
            }
            else if (attrs.hasOwnProperty(bracketParenAttr)) {
                expr = ((attrs) /** TODO #9100 */)[bracketParenAttr];
                assignExpr = true;
            }
            if (expr != null && assignExpr != null) {
                const /** @type {?} */ getter = this.parse(expr);
                const /** @type {?} */ setter = getter.assign;
                if (assignExpr && !setter) {
                    throw new Error(`Expression '${expr}' is not assignable!`);
                }
                const /** @type {?} */ emitter = (this.component[output.prop]);
                if (emitter) {
                    emitter.subscribe({
                        next: assignExpr ?
                            ((setter) => (v /** TODO #9100 */) => setter(this.scope, v))(setter) :
                            ((getter) => (v /** TODO #9100 */) => getter(this.scope, { $event: v }))(getter)
                    });
                }
                else {
                    throw new Error(`Missing emitter '${output.prop}' on component '${this.info.selector}'!`);
                }
            }
        }
    }
    /**
     * @return {?}
     */
    registerCleanup() {
        this.element.bind('$destroy', () => {
            this.componentScope.$destroy();
            this.componentRef.destroy();
        });
    }
}
function DowngradeNg2ComponentAdapter_tsickle_Closure_declarations() {
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.component;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.inputChangeCount;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.inputChanges;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.componentRef;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.changeDetector;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.componentScope;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.info;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.element;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.attrs;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.scope;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.ngModel;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.parentInjector;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.parse;
    /** @type {?} */
    DowngradeNg2ComponentAdapter.prototype.componentFactory;
}
//# sourceMappingURL=downgrade_ng2_adapter.js.map