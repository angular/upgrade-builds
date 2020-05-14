/**
 * @fileoverview added by tsickle
 * Generated from: packages/upgrade/static/src/upgrade_component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Directive, ElementRef, EventEmitter, Injector, ɵlooseIdentical as looseIdentical } from '@angular/core';
import { $SCOPE } from '../../src/common/src/constants';
import { UpgradeHelper } from '../../src/common/src/upgrade_helper';
import { isFunction } from '../../src/common/src/util';
import * as i0 from "@angular/core";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @type {?} */
const NOT_SUPPORTED = 'NOT_SUPPORTED';
/** @type {?} */
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
class Bindings {
    constructor() {
        this.twoWayBoundProperties = [];
        this.twoWayBoundLastValues = [];
        this.expressionBoundProperties = [];
        this.propertyToOutputMap = {};
    }
}
if (false) {
    /** @type {?} */
    Bindings.prototype.twoWayBoundProperties;
    /** @type {?} */
    Bindings.prototype.twoWayBoundLastValues;
    /** @type {?} */
    Bindings.prototype.expressionBoundProperties;
    /** @type {?} */
    Bindings.prototype.propertyToOutputMap;
}
/**
 * \@description
 *
 * A helper class that allows an AngularJS component to be used from Angular.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation.*
 *
 * This helper class should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
 * \@usageNotes
 * ### Examples
 *
 * Let's assume that you have an AngularJS component called `ng1Hero` that needs
 * to be made available in Angular templates.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng1-hero"}
 *
 * We must create a `Directive` that will make this AngularJS component
 * available inside Angular templates.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper"}
 *
 * In this example you can see that we must derive from the `UpgradeComponent`
 * base class but also provide an {\@link Directive `\@Directive`} decorator. This is
 * because the AOT compiler requires that this information is statically available at
 * compile time.
 *
 * Note that we must do the following:
 * * specify the directive's selector (`ng1-hero`)
 * * specify all inputs and outputs that the AngularJS component expects
 * * derive from `UpgradeComponent`
 * * call the base class from the constructor, passing
 *   * the AngularJS name of the component (`ng1Hero`)
 *   * the `ElementRef` and `Injector` for the component wrapper
 *
 * \@publicApi
 */
let UpgradeComponent = /** @class */ (() => {
    /**
     * \@description
     *
     * A helper class that allows an AngularJS component to be used from Angular.
     *
     * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
     * library for hybrid upgrade apps that support AOT compilation.*
     *
     * This helper class should be used as a base class for creating Angular directives
     * that wrap AngularJS components that need to be "upgraded".
     *
     * \@usageNotes
     * ### Examples
     *
     * Let's assume that you have an AngularJS component called `ng1Hero` that needs
     * to be made available in Angular templates.
     *
     * {\@example upgrade/static/ts/full/module.ts region="ng1-hero"}
     *
     * We must create a `Directive` that will make this AngularJS component
     * available inside Angular templates.
     *
     * {\@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper"}
     *
     * In this example you can see that we must derive from the `UpgradeComponent`
     * base class but also provide an {\@link Directive `\@Directive`} decorator. This is
     * because the AOT compiler requires that this information is statically available at
     * compile time.
     *
     * Note that we must do the following:
     * * specify the directive's selector (`ng1-hero`)
     * * specify all inputs and outputs that the AngularJS component expects
     * * derive from `UpgradeComponent`
     * * call the base class from the constructor, passing
     *   * the AngularJS name of the component (`ng1Hero`)
     *   * the `ElementRef` and `Injector` for the component wrapper
     *
     * \@publicApi
     */
    class UpgradeComponent {
        /**
         * Create a new `UpgradeComponent` instance. You should not normally need to do this.
         * Instead you should derive a new class from this one and call the super constructor
         * from the base class.
         *
         * {\@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper" }
         *
         * * The `name` parameter should be the name of the AngularJS directive.
         * * The `elementRef` and `injector` parameters should be acquired from Angular by dependency
         *   injection into the base class constructor.
         * @param {?} name
         * @param {?} elementRef
         * @param {?} injector
         */
        constructor(name, elementRef, injector) {
            this.name = name;
            this.elementRef = elementRef;
            this.injector = injector;
            this.helper = new UpgradeHelper(injector, name, elementRef);
            this.$injector = this.helper.$injector;
            this.element = this.helper.element;
            this.$element = this.helper.$element;
            this.directive = this.helper.directive;
            this.bindings = this.initializeBindings(this.directive);
            // We ask for the AngularJS scope from the Angular injector, since
            // we will put the new component scope onto the new injector for each component
            /** @type {?} */
            const $parentScope = injector.get($SCOPE);
            // QUESTION 1: Should we create an isolated scope if the scope is only true?
            // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
            this.$componentScope = $parentScope.$new(!!this.directive.scope);
            this.initializeOutputs();
        }
        /**
         * @return {?}
         */
        ngOnInit() {
            // Collect contents, insert and compile template
            /** @type {?} */
            const attachChildNodes = this.helper.prepareTransclusion();
            /** @type {?} */
            const linkFn = this.helper.compileTemplate();
            // Instantiate controller
            /** @type {?} */
            const controllerType = this.directive.controller;
            /** @type {?} */
            const bindToController = this.directive.bindToController;
            if (controllerType) {
                this.controllerInstance = this.helper.buildController(controllerType, this.$componentScope);
            }
            else if (bindToController) {
                throw new Error(`Upgraded directive '${this.directive.name}' specifies 'bindToController' but no controller.`);
            }
            // Set up outputs
            this.bindingDestination = bindToController ? this.controllerInstance : this.$componentScope;
            this.bindOutputs();
            // Require other controllers
            /** @type {?} */
            const requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
            // Hook: $onChanges
            if (this.pendingChanges) {
                this.forwardChanges(this.pendingChanges);
                this.pendingChanges = null;
            }
            // Hook: $onInit
            if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
                this.controllerInstance.$onInit();
            }
            // Hook: $doCheck
            if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
                /** @type {?} */
                const callDoCheck = (/**
                 * @return {?}
                 */
                () => (/** @type {?} */ (this.controllerInstance.$doCheck))());
                this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
                callDoCheck();
            }
            // Linking
            /** @type {?} */
            const link = this.directive.link;
            /** @type {?} */
            const preLink = typeof link == 'object' && link.pre;
            /** @type {?} */
            const postLink = typeof link == 'object' ? link.post : link;
            /** @type {?} */
            const attrs = NOT_SUPPORTED;
            /** @type {?} */
            const transcludeFn = NOT_SUPPORTED;
            if (preLink) {
                preLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
            }
            linkFn(this.$componentScope, (/** @type {?} */ (null)), { parentBoundTranscludeFn: attachChildNodes });
            if (postLink) {
                postLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
            }
            // Hook: $postLink
            if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
                this.controllerInstance.$postLink();
            }
        }
        /**
         * @param {?} changes
         * @return {?}
         */
        ngOnChanges(changes) {
            if (!this.bindingDestination) {
                this.pendingChanges = changes;
            }
            else {
                this.forwardChanges(changes);
            }
        }
        /**
         * @return {?}
         */
        ngDoCheck() {
            /** @type {?} */
            const twoWayBoundProperties = this.bindings.twoWayBoundProperties;
            /** @type {?} */
            const twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
            /** @type {?} */
            const propertyToOutputMap = this.bindings.propertyToOutputMap;
            twoWayBoundProperties.forEach((/**
             * @param {?} propName
             * @param {?} idx
             * @return {?}
             */
            (propName, idx) => {
                /** @type {?} */
                const newValue = this.bindingDestination[propName];
                /** @type {?} */
                const oldValue = twoWayBoundLastValues[idx];
                if (!looseIdentical(newValue, oldValue)) {
                    /** @type {?} */
                    const outputName = propertyToOutputMap[propName];
                    /** @type {?} */
                    const eventEmitter = ((/** @type {?} */ (this)))[outputName];
                    eventEmitter.emit(newValue);
                    twoWayBoundLastValues[idx] = newValue;
                }
            }));
        }
        /**
         * @return {?}
         */
        ngOnDestroy() {
            if (isFunction(this.unregisterDoCheckWatcher)) {
                this.unregisterDoCheckWatcher();
            }
            this.helper.onDestroy(this.$componentScope, this.controllerInstance);
        }
        /**
         * @private
         * @param {?} directive
         * @return {?}
         */
        initializeBindings(directive) {
            /** @type {?} */
            const btcIsObject = typeof directive.bindToController === 'object';
            if (btcIsObject && Object.keys((/** @type {?} */ (directive.scope))).length) {
                throw new Error(`Binding definitions on scope and controller at the same time is not supported.`);
            }
            /** @type {?} */
            const context = btcIsObject ? directive.bindToController : directive.scope;
            /** @type {?} */
            const bindings = new Bindings();
            if (typeof context == 'object') {
                Object.keys(context).forEach((/**
                 * @param {?} propName
                 * @return {?}
                 */
                propName => {
                    /** @type {?} */
                    const definition = context[propName];
                    /** @type {?} */
                    const bindingType = definition.charAt(0);
                    // QUESTION: What about `=*`? Ignore? Throw? Support?
                    switch (bindingType) {
                        case '@':
                        case '<':
                            // We don't need to do anything special. They will be defined as inputs on the
                            // upgraded component facade and the change propagation will be handled by
                            // `ngOnChanges()`.
                            break;
                        case '=':
                            bindings.twoWayBoundProperties.push(propName);
                            bindings.twoWayBoundLastValues.push(INITIAL_VALUE);
                            bindings.propertyToOutputMap[propName] = propName + 'Change';
                            break;
                        case '&':
                            bindings.expressionBoundProperties.push(propName);
                            bindings.propertyToOutputMap[propName] = propName;
                            break;
                        default:
                            /** @type {?} */
                            let json = JSON.stringify(context);
                            throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
                    }
                }));
            }
            return bindings;
        }
        /**
         * @private
         * @return {?}
         */
        initializeOutputs() {
            // Initialize the outputs for `=` and `&` bindings
            this.bindings.twoWayBoundProperties.concat(this.bindings.expressionBoundProperties)
                .forEach((/**
             * @param {?} propName
             * @return {?}
             */
            propName => {
                /** @type {?} */
                const outputName = this.bindings.propertyToOutputMap[propName];
                ((/** @type {?} */ (this)))[outputName] = new EventEmitter();
            }));
        }
        /**
         * @private
         * @return {?}
         */
        bindOutputs() {
            // Bind `&` bindings to the corresponding outputs
            this.bindings.expressionBoundProperties.forEach((/**
             * @param {?} propName
             * @return {?}
             */
            propName => {
                /** @type {?} */
                const outputName = this.bindings.propertyToOutputMap[propName];
                /** @type {?} */
                const emitter = ((/** @type {?} */ (this)))[outputName];
                this.bindingDestination[propName] = (/**
                 * @param {?} value
                 * @return {?}
                 */
                (value) => emitter.emit(value));
            }));
        }
        /**
         * @private
         * @param {?} changes
         * @return {?}
         */
        forwardChanges(changes) {
            // Forward input changes to `bindingDestination`
            Object.keys(changes).forEach((/**
             * @param {?} propName
             * @return {?}
             */
            propName => this.bindingDestination[propName] = changes[propName].currentValue));
            if (isFunction(this.bindingDestination.$onChanges)) {
                this.bindingDestination.$onChanges(changes);
            }
        }
    }
    UpgradeComponent.decorators = [
        { type: Directive },
    ];
    /** @nocollapse */
    UpgradeComponent.ctorParameters = () => [
        { type: String },
        { type: ElementRef },
        { type: Injector }
    ];
    /** @nocollapse */ UpgradeComponent.ɵfac = function UpgradeComponent_Factory(t) { i0.ɵɵinvalidFactory(); };
    /** @nocollapse */ UpgradeComponent.ɵdir = i0.ɵɵdefineDirective({ type: UpgradeComponent, features: [i0.ɵɵNgOnChangesFeature] });
    return UpgradeComponent;
})();
export { UpgradeComponent };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(UpgradeComponent, [{
        type: Directive
    }], function () { return [{ type: undefined }, { type: i0.ElementRef }, { type: i0.Injector }]; }, null); })();
if (false) {
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.helper;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.$injector;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.element;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.$element;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.$componentScope;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.directive;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.bindings;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.controllerInstance;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.bindingDestination;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.pendingChanges;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.unregisterDoCheckWatcher;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.name;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.elementRef;
    /**
     * @type {?}
     * @private
     */
    UpgradeComponent.prototype.injector;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFXLFVBQVUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUErQyxlQUFlLElBQUksY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3JLLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN0RCxPQUFPLEVBQTJDLGFBQWEsRUFBQyxNQUFNLHFDQUFxQyxDQUFDO0FBQzVHLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQzs7Ozs7Ozs7OztNQUUvQyxhQUFhLEdBQVEsZUFBZTs7TUFDcEMsYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEI7QUFFRCxNQUFNLFFBQVE7SUFBZDtRQUNFLDBCQUFxQixHQUFhLEVBQUUsQ0FBQztRQUNyQywwQkFBcUIsR0FBVSxFQUFFLENBQUM7UUFFbEMsOEJBQXlCLEdBQWEsRUFBRSxDQUFDO1FBRXpDLHdCQUFtQixHQUFpQyxFQUFFLENBQUM7SUFDekQsQ0FBQztDQUFBOzs7SUFOQyx5Q0FBcUM7O0lBQ3JDLHlDQUFrQzs7SUFFbEMsNkNBQXlDOztJQUV6Qyx1Q0FBdUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEN6RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLE1BQ2EsZ0JBQWdCOzs7Ozs7Ozs7Ozs7Ozs7UUFxQzNCLFlBQW9CLElBQVksRUFBVSxVQUFzQixFQUFVLFFBQWtCO1lBQXhFLFNBQUksR0FBSixJQUFJLENBQVE7WUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFZO1lBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtZQUMxRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFNUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUV2QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFFckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Ozs7a0JBSWxELFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUN6Qyw0RUFBNEU7WUFDNUUsNkZBQTZGO1lBQzdGLElBQUksQ0FBQyxlQUFlLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVqRSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUMzQixDQUFDOzs7O1FBRUQsUUFBUTs7O2tCQUVBLGdCQUFnQixHQUFzQixJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFOztrQkFDdkUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFOzs7a0JBR3RDLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVU7O2tCQUMxQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQjtZQUN4RCxJQUFJLGNBQWMsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7YUFDN0Y7aUJBQU0sSUFBSSxnQkFBZ0IsRUFBRTtnQkFDM0IsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFDWixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksbURBQW1ELENBQUMsQ0FBQzthQUM3RTtZQUVELGlCQUFpQjtZQUNqQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUM1RixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7OztrQkFHYixtQkFBbUIsR0FDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7WUFFMUUsbUJBQW1CO1lBQ25CLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO2FBQzVCO1lBRUQsZ0JBQWdCO1lBQ2hCLElBQUksSUFBSSxDQUFDLGtCQUFrQixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUNuQztZQUVELGlCQUFpQjtZQUNqQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFOztzQkFDckUsV0FBVzs7O2dCQUFHLEdBQUcsRUFBRSxDQUFDLG1CQUFBLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUMsRUFBRSxDQUFBO2dCQUU3RCxJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNqRixXQUFXLEVBQUUsQ0FBQzthQUNmOzs7a0JBR0ssSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSTs7a0JBQzFCLE9BQU8sR0FBRyxPQUFPLElBQUksSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUc7O2tCQUM3QyxRQUFRLEdBQUcsT0FBTyxJQUFJLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJOztrQkFDckQsS0FBSyxHQUFnQixhQUFhOztrQkFDbEMsWUFBWSxHQUF3QixhQUFhO1lBQ3ZELElBQUksT0FBTyxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixFQUFFLFlBQVksQ0FBQyxDQUFDO2FBQ3hGO1lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsbUJBQUEsSUFBSSxFQUFDLEVBQUUsRUFBQyx1QkFBdUIsRUFBRSxnQkFBZ0IsRUFBQyxDQUFDLENBQUM7WUFFakYsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDekY7WUFFRCxrQkFBa0I7WUFDbEIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDNUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxDQUFDO2FBQ3JDO1FBQ0gsQ0FBQzs7Ozs7UUFFRCxXQUFXLENBQUMsT0FBc0I7WUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7YUFDL0I7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM5QjtRQUNILENBQUM7Ozs7UUFFRCxTQUFTOztrQkFDRCxxQkFBcUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQjs7a0JBQzNELHFCQUFxQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCOztrQkFDM0QsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUI7WUFFN0QscUJBQXFCLENBQUMsT0FBTzs7Ozs7WUFBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsRUFBRTs7c0JBQ3hDLFFBQVEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDOztzQkFDNUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQztnQkFFM0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUU7OzBCQUNqQyxVQUFVLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDOzswQkFDMUMsWUFBWSxHQUFzQixDQUFDLG1CQUFBLElBQUksRUFBTyxDQUFDLENBQUMsVUFBVSxDQUFDO29CQUVqRSxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUM1QixxQkFBcUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7aUJBQ3ZDO1lBQ0gsQ0FBQyxFQUFDLENBQUM7UUFDTCxDQUFDOzs7O1FBRUQsV0FBVztZQUNULElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO2dCQUM3QyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzthQUNqQztZQUNELElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDdkUsQ0FBQzs7Ozs7O1FBRU8sa0JBQWtCLENBQUMsU0FBcUI7O2tCQUN4QyxXQUFXLEdBQUcsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLEtBQUssUUFBUTtZQUNsRSxJQUFJLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFBLFNBQVMsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtnQkFDdkQsTUFBTSxJQUFJLEtBQUssQ0FDWCxnRkFBZ0YsQ0FBQyxDQUFDO2FBQ3ZGOztrQkFFSyxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLOztrQkFDcEUsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFO1lBRS9CLElBQUksT0FBTyxPQUFPLElBQUksUUFBUSxFQUFFO2dCQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU87Ozs7Z0JBQUMsUUFBUSxDQUFDLEVBQUU7OzBCQUNoQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQzs7MEJBQzlCLFdBQVcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFFeEMscURBQXFEO29CQUVyRCxRQUFRLFdBQVcsRUFBRTt3QkFDbkIsS0FBSyxHQUFHLENBQUM7d0JBQ1QsS0FBSyxHQUFHOzRCQUNOLDhFQUE4RTs0QkFDOUUsMEVBQTBFOzRCQUMxRSxtQkFBbUI7NEJBQ25CLE1BQU07d0JBQ1IsS0FBSyxHQUFHOzRCQUNOLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7NEJBQzlDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7NEJBQ25ELFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDOzRCQUM3RCxNQUFNO3dCQUNSLEtBQUssR0FBRzs0QkFDTixRQUFRLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUNsRCxRQUFRLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEdBQUcsUUFBUSxDQUFDOzRCQUNsRCxNQUFNO3dCQUNSOztnQ0FDTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7NEJBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQ1gsdUJBQXVCLFdBQVcsU0FBUyxJQUFJLFNBQVMsSUFBSSxDQUFDLElBQUksY0FBYyxDQUFDLENBQUM7cUJBQ3hGO2dCQUNILENBQUMsRUFBQyxDQUFDO2FBQ0o7WUFFRCxPQUFPLFFBQVEsQ0FBQztRQUNsQixDQUFDOzs7OztRQUVPLGlCQUFpQjtZQUN2QixrREFBa0Q7WUFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQztpQkFDOUUsT0FBTzs7OztZQUFDLFFBQVEsQ0FBQyxFQUFFOztzQkFDWixVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUM7Z0JBQzlELENBQUMsbUJBQUEsSUFBSSxFQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1lBQ2pELENBQUMsRUFBQyxDQUFDO1FBQ1QsQ0FBQzs7Ozs7UUFFTyxXQUFXO1lBQ2pCLGlEQUFpRDtZQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDLE9BQU87Ozs7WUFBQyxRQUFRLENBQUMsRUFBRTs7c0JBQ25ELFVBQVUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQzs7c0JBQ3hELE9BQU8sR0FBRyxDQUFDLG1CQUFBLElBQUksRUFBTyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUV6QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDOzs7O2dCQUFHLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBLENBQUM7WUFDMUUsQ0FBQyxFQUFDLENBQUM7UUFDTCxDQUFDOzs7Ozs7UUFFTyxjQUFjLENBQUMsT0FBc0I7WUFDM0MsZ0RBQWdEO1lBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTzs7OztZQUN4QixRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxFQUFDLENBQUM7WUFFcEYsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNsRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQzdDO1FBQ0gsQ0FBQzs7O2dCQXBPRixTQUFTOzs7OztnQkE1RGtCLFVBQVU7Z0JBQWdCLFFBQVE7Ozs0RUE2RGpELGdCQUFnQjsyQkFyRTdCO0tBeVNDO1NBcE9ZLGdCQUFnQjtrREFBaEIsZ0JBQWdCO2NBRDVCLFNBQVM7Ozs7Ozs7SUFFUixrQ0FBOEI7Ozs7O0lBRTlCLHFDQUFvQzs7Ozs7SUFFcEMsbUNBQXlCOzs7OztJQUN6QixvQ0FBbUM7Ozs7O0lBQ25DLDJDQUFnQzs7Ozs7SUFFaEMscUNBQThCOzs7OztJQUM5QixvQ0FBMkI7Ozs7O0lBRzNCLDhDQUFpRDs7Ozs7SUFFakQsOENBQWlEOzs7OztJQU1qRCwwQ0FBNEM7Ozs7O0lBRzVDLG9EQUE0Qzs7Ozs7SUFhaEMsZ0NBQW9COzs7OztJQUFFLHNDQUE4Qjs7Ozs7SUFBRSxvQ0FBMEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdG9yLCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgT25Jbml0LCBTaW1wbGVDaGFuZ2VzLCDJtWxvb3NlSWRlbnRpY2FsIGFzIGxvb3NlSWRlbnRpY2FsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJQXR0cmlidXRlcywgSUF1Z21lbnRlZEpRdWVyeSwgSURpcmVjdGl2ZSwgSUluamVjdG9yU2VydmljZSwgSUxpbmtGbiwgSVNjb3BlLCBJVHJhbnNjbHVkZUZ1bmN0aW9ufSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7SUJpbmRpbmdEZXN0aW5hdGlvbiwgSUNvbnRyb2xsZXJJbnN0YW5jZSwgVXBncmFkZUhlbHBlcn0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvdXBncmFkZV9oZWxwZXInO1xuaW1wb3J0IHtpc0Z1bmN0aW9ufSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy91dGlsJztcblxuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmNsYXNzIEJpbmRpbmdzIHtcbiAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICB0d29XYXlCb3VuZExhc3RWYWx1ZXM6IGFueVtdID0gW107XG5cbiAgZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblxuICBwcm9wZXJ0eVRvT3V0cHV0TWFwOiB7W3Byb3BOYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgY2xhc3MgdGhhdCBhbGxvd3MgYW4gQW5ndWxhckpTIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhci5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFPVCBjb21waWxhdGlvbi4qXG4gKlxuICogVGhpcyBoZWxwZXIgY2xhc3Mgc2hvdWxkIGJlIHVzZWQgYXMgYSBiYXNlIGNsYXNzIGZvciBjcmVhdGluZyBBbmd1bGFyIGRpcmVjdGl2ZXNcbiAqIHRoYXQgd3JhcCBBbmd1bGFySlMgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgXCJ1cGdyYWRlZFwiLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBMZXQncyBhc3N1bWUgdGhhdCB5b3UgaGF2ZSBhbiBBbmd1bGFySlMgY29tcG9uZW50IGNhbGxlZCBgbmcxSGVyb2AgdGhhdCBuZWVkc1xuICogdG8gYmUgbWFkZSBhdmFpbGFibGUgaW4gQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYSBgRGlyZWN0aXZlYCB0aGF0IHdpbGwgbWFrZSB0aGlzIEFuZ3VsYXJKUyBjb21wb25lbnRcbiAqIGF2YWlsYWJsZSBpbnNpZGUgQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIn1cbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUgeW91IGNhbiBzZWUgdGhhdCB3ZSBtdXN0IGRlcml2ZSBmcm9tIHRoZSBgVXBncmFkZUNvbXBvbmVudGBcbiAqIGJhc2UgY2xhc3MgYnV0IGFsc28gcHJvdmlkZSBhbiB7QGxpbmsgRGlyZWN0aXZlIGBARGlyZWN0aXZlYH0gZGVjb3JhdG9yLiBUaGlzIGlzXG4gKiBiZWNhdXNlIHRoZSBBT1QgY29tcGlsZXIgcmVxdWlyZXMgdGhhdCB0aGlzIGluZm9ybWF0aW9uIGlzIHN0YXRpY2FsbHkgYXZhaWxhYmxlIGF0XG4gKiBjb21waWxlIHRpbWUuXG4gKlxuICogTm90ZSB0aGF0IHdlIG11c3QgZG8gdGhlIGZvbGxvd2luZzpcbiAqICogc3BlY2lmeSB0aGUgZGlyZWN0aXZlJ3Mgc2VsZWN0b3IgKGBuZzEtaGVyb2ApXG4gKiAqIHNwZWNpZnkgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyB0aGF0IHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGV4cGVjdHNcbiAqICogZGVyaXZlIGZyb20gYFVwZ3JhZGVDb21wb25lbnRgXG4gKiAqIGNhbGwgdGhlIGJhc2UgY2xhc3MgZnJvbSB0aGUgY29uc3RydWN0b3IsIHBhc3NpbmdcbiAqICAgKiB0aGUgQW5ndWxhckpTIG5hbWUgb2YgdGhlIGNvbXBvbmVudCAoYG5nMUhlcm9gKVxuICogICAqIHRoZSBgRWxlbWVudFJlZmAgYW5kIGBJbmplY3RvcmAgZm9yIHRoZSBjb21wb25lbnQgd3JhcHBlclxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgY2xhc3MgVXBncmFkZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGhlbHBlcjogVXBncmFkZUhlbHBlcjtcblxuICBwcml2YXRlICRpbmplY3RvcjogSUluamVjdG9yU2VydmljZTtcblxuICBwcml2YXRlIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gIHByaXZhdGUgJGVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnk7XG4gIHByaXZhdGUgJGNvbXBvbmVudFNjb3BlOiBJU2NvcGU7XG5cbiAgcHJpdmF0ZSBkaXJlY3RpdmU6IElEaXJlY3RpdmU7XG4gIHByaXZhdGUgYmluZGluZ3M6IEJpbmRpbmdzO1xuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNvbnRyb2xsZXJJbnN0YW5jZSE6IElDb250cm9sbGVySW5zdGFuY2U7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGJpbmRpbmdEZXN0aW5hdGlvbiE6IElCaW5kaW5nRGVzdGluYXRpb247XG5cbiAgLy8gV2Ugd2lsbCBiZSBpbnN0YW50aWF0aW5nIHRoZSBjb250cm9sbGVyIGluIHRoZSBgbmdPbkluaXRgIGhvb2ssIHdoZW4gdGhlXG4gIC8vIGZpcnN0IGBuZ09uQ2hhbmdlc2Agd2lsbCBoYXZlIGJlZW4gYWxyZWFkeSB0cmlnZ2VyZWQuIFdlIHN0b3JlIHRoZVxuICAvLyBgU2ltcGxlQ2hhbmdlc2AgYW5kIFwicGxheSB0aGVtIGJhY2tcIiBsYXRlci5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgcGVuZGluZ0NoYW5nZXMhOiBTaW1wbGVDaGFuZ2VzfG51bGw7XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgdW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyITogRnVuY3Rpb247XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgVXBncmFkZUNvbXBvbmVudGAgaW5zdGFuY2UuIFlvdSBzaG91bGQgbm90IG5vcm1hbGx5IG5lZWQgdG8gZG8gdGhpcy5cbiAgICogSW5zdGVhZCB5b3Ugc2hvdWxkIGRlcml2ZSBhIG5ldyBjbGFzcyBmcm9tIHRoaXMgb25lIGFuZCBjYWxsIHRoZSBzdXBlciBjb25zdHJ1Y3RvclxuICAgKiBmcm9tIHRoZSBiYXNlIGNsYXNzLlxuICAgKlxuICAgKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLWhlcm8td3JhcHBlclwiIH1cbiAgICpcbiAgICogKiBUaGUgYG5hbWVgIHBhcmFtZXRlciBzaG91bGQgYmUgdGhlIG5hbWUgb2YgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUuXG4gICAqICogVGhlIGBlbGVtZW50UmVmYCBhbmQgYGluamVjdG9yYCBwYXJhbWV0ZXJzIHNob3VsZCBiZSBhY3F1aXJlZCBmcm9tIEFuZ3VsYXIgYnkgZGVwZW5kZW5jeVxuICAgKiAgIGluamVjdGlvbiBpbnRvIHRoZSBiYXNlIGNsYXNzIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuYW1lOiBzdHJpbmcsIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmhlbHBlciA9IG5ldyBVcGdyYWRlSGVscGVyKGluamVjdG9yLCBuYW1lLCBlbGVtZW50UmVmKTtcblxuICAgIHRoaXMuJGluamVjdG9yID0gdGhpcy5oZWxwZXIuJGluamVjdG9yO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5oZWxwZXIuZWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gdGhpcy5oZWxwZXIuJGVsZW1lbnQ7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZSA9IHRoaXMuaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmJpbmRpbmdzID0gdGhpcy5pbml0aWFsaXplQmluZGluZ3ModGhpcy5kaXJlY3RpdmUpO1xuXG4gICAgLy8gV2UgYXNrIGZvciB0aGUgQW5ndWxhckpTIHNjb3BlIGZyb20gdGhlIEFuZ3VsYXIgaW5qZWN0b3IsIHNpbmNlXG4gICAgLy8gd2Ugd2lsbCBwdXQgdGhlIG5ldyBjb21wb25lbnQgc2NvcGUgb250byB0aGUgbmV3IGluamVjdG9yIGZvciBlYWNoIGNvbXBvbmVudFxuICAgIGNvbnN0ICRwYXJlbnRTY29wZSA9IGluamVjdG9yLmdldCgkU0NPUEUpO1xuICAgIC8vIFFVRVNUSU9OIDE6IFNob3VsZCB3ZSBjcmVhdGUgYW4gaXNvbGF0ZWQgc2NvcGUgaWYgdGhlIHNjb3BlIGlzIG9ubHkgdHJ1ZT9cbiAgICAvLyBRVUVTVElPTiAyOiBTaG91bGQgd2UgbWFrZSB0aGUgc2NvcGUgYWNjZXNzaWJsZSB0aHJvdWdoIGAkZWxlbWVudC5zY29wZSgpL2lzb2xhdGVTY29wZSgpYD9cbiAgICB0aGlzLiRjb21wb25lbnRTY29wZSA9ICRwYXJlbnRTY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplT3V0cHV0cygpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gQ29sbGVjdCBjb250ZW50cywgaW5zZXJ0IGFuZCBjb21waWxlIHRlbXBsYXRlXG4gICAgY29uc3QgYXR0YWNoQ2hpbGROb2RlczogSUxpbmtGbnx1bmRlZmluZWQgPSB0aGlzLmhlbHBlci5wcmVwYXJlVHJhbnNjbHVzaW9uKCk7XG4gICAgY29uc3QgbGlua0ZuID0gdGhpcy5oZWxwZXIuY29tcGlsZVRlbXBsYXRlKCk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGlmIChjb250cm9sbGVyVHlwZSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuJGNvbXBvbmVudFNjb3BlKTtcbiAgICB9IGVsc2UgaWYgKGJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVXBncmFkZWQgZGlyZWN0aXZlICcke1xuICAgICAgICAgIHRoaXMuZGlyZWN0aXZlLm5hbWV9JyBzcGVjaWZpZXMgJ2JpbmRUb0NvbnRyb2xsZXInIGJ1dCBubyBjb250cm9sbGVyLmApO1xuICAgIH1cblxuICAgIC8vIFNldCB1cCBvdXRwdXRzXG4gICAgdGhpcy5iaW5kaW5nRGVzdGluYXRpb24gPSBiaW5kVG9Db250cm9sbGVyID8gdGhpcy5jb250cm9sbGVySW5zdGFuY2UgOiB0aGlzLiRjb21wb25lbnRTY29wZTtcbiAgICB0aGlzLmJpbmRPdXRwdXRzKCk7XG5cbiAgICAvLyBSZXF1aXJlIG90aGVyIGNvbnRyb2xsZXJzXG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9XG4gICAgICAgIHRoaXMuaGVscGVyLnJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSk7XG5cbiAgICAvLyBIb29rOiAkb25DaGFuZ2VzXG4gICAgaWYgKHRoaXMucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgIHRoaXMuZm9yd2FyZENoYW5nZXModGhpcy5wZW5kaW5nQ2hhbmdlcyk7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkb25Jbml0XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkZG9DaGVja1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKSkge1xuICAgICAgY29uc3QgY2FsbERvQ2hlY2sgPSAoKSA9PiB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjayEoKTtcblxuICAgICAgdGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIgPSB0aGlzLiRjb21wb25lbnRTY29wZS4kcGFyZW50LiR3YXRjaChjYWxsRG9DaGVjayk7XG4gICAgICBjYWxsRG9DaGVjaygpO1xuICAgIH1cblxuICAgIC8vIExpbmtpbmdcbiAgICBjb25zdCBsaW5rID0gdGhpcy5kaXJlY3RpdmUubGluaztcbiAgICBjb25zdCBwcmVMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgJiYgbGluay5wcmU7XG4gICAgY29uc3QgcG9zdExpbmsgPSB0eXBlb2YgbGluayA9PSAnb2JqZWN0JyA/IGxpbmsucG9zdCA6IGxpbms7XG4gICAgY29uc3QgYXR0cnM6IElBdHRyaWJ1dGVzID0gTk9UX1NVUFBPUlRFRDtcbiAgICBjb25zdCB0cmFuc2NsdWRlRm46IElUcmFuc2NsdWRlRnVuY3Rpb24gPSBOT1RfU1VQUE9SVEVEO1xuICAgIGlmIChwcmVMaW5rKSB7XG4gICAgICBwcmVMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy4kY29tcG9uZW50U2NvcGUsIG51bGwhLCB7cGFyZW50Qm91bmRUcmFuc2NsdWRlRm46IGF0dGFjaENoaWxkTm9kZXN9KTtcblxuICAgIGlmIChwb3N0TGluaykge1xuICAgICAgcG9zdExpbmsodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRwb3N0TGlua1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoIXRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uKSB7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gY2hhbmdlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb3J3YXJkQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3QgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzID0gdGhpcy5iaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXM7XG4gICAgY29uc3QgdHdvV2F5Qm91bmRMYXN0VmFsdWVzID0gdGhpcy5iaW5kaW5ncy50d29XYXlCb3VuZExhc3RWYWx1ZXM7XG4gICAgY29uc3QgcHJvcGVydHlUb091dHB1dE1hcCA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcDtcblxuICAgIHR3b1dheUJvdW5kUHJvcGVydGllcy5mb3JFYWNoKChwcm9wTmFtZSwgaWR4KSA9PiB7XG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdHdvV2F5Qm91bmRMYXN0VmFsdWVzW2lkeF07XG5cbiAgICAgIGlmICghbG9vc2VJZGVudGljYWwobmV3VmFsdWUsIG9sZFZhbHVlKSkge1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lID0gcHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGV2ZW50RW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4gPSAodGhpcyBhcyBhbnkpW291dHB1dE5hbWVdO1xuXG4gICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KG5ld1ZhbHVlKTtcbiAgICAgICAgdHdvV2F5Qm91bmRMYXN0VmFsdWVzW2lkeF0gPSBuZXdWYWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyKSkge1xuICAgICAgdGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIoKTtcbiAgICB9XG4gICAgdGhpcy5oZWxwZXIub25EZXN0cm95KHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSk7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemVCaW5kaW5ncyhkaXJlY3RpdmU6IElEaXJlY3RpdmUpIHtcbiAgICBjb25zdCBidGNJc09iamVjdCA9IHR5cGVvZiBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA9PT0gJ29iamVjdCc7XG4gICAgaWYgKGJ0Y0lzT2JqZWN0ICYmIE9iamVjdC5rZXlzKGRpcmVjdGl2ZS5zY29wZSEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gYnRjSXNPYmplY3QgPyBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA6IGRpcmVjdGl2ZS5zY29wZTtcbiAgICBjb25zdCBiaW5kaW5ncyA9IG5ldyBCaW5kaW5ncygpO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgc3dpdGNoIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLiBUaGV5IHdpbGwgYmUgZGVmaW5lZCBhcyBpbnB1dHMgb24gdGhlXG4gICAgICAgICAgICAvLyB1cGdyYWRlZCBjb21wb25lbnQgZmFjYWRlIGFuZCB0aGUgY2hhbmdlIHByb3BhZ2F0aW9uIHdpbGwgYmUgaGFuZGxlZCBieVxuICAgICAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZExhc3RWYWx1ZXMucHVzaChJTklUSUFMX1ZBTFVFKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWUgKyAnQ2hhbmdlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke3RoaXMubmFtZX0nIGRpcmVjdGl2ZS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJpbmRpbmdzO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplT3V0cHV0cygpIHtcbiAgICAvLyBJbml0aWFsaXplIHRoZSBvdXRwdXRzIGZvciBgPWAgYW5kIGAmYCBiaW5kaW5nc1xuICAgIHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzLmNvbmNhdCh0aGlzLmJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMpXG4gICAgICAgIC5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBvdXRwdXROYW1lID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgICAgICAodGhpcyBhcyBhbnkpW291dHB1dE5hbWVdID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYmluZE91dHB1dHMoKSB7XG4gICAgLy8gQmluZCBgJmAgYmluZGluZ3MgdG8gdGhlIGNvcnJlc3BvbmRpbmcgb3V0cHV0c1xuICAgIHRoaXMuYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcy5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgZW1pdHRlciA9ICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV07XG5cbiAgICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXSA9ICh2YWx1ZTogYW55KSA9PiBlbWl0dGVyLmVtaXQodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3J3YXJkQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgLy8gRm9yd2FyZCBpbnB1dCBjaGFuZ2VzIHRvIGBiaW5kaW5nRGVzdGluYXRpb25gXG4gICAgT2JqZWN0LmtleXMoY2hhbmdlcykuZm9yRWFjaChcbiAgICAgICAgcHJvcE5hbWUgPT4gdGhpcy5iaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gY2hhbmdlc1twcm9wTmFtZV0uY3VycmVudFZhbHVlKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMpKSB7XG4gICAgICB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbi4kb25DaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxufVxuIl19