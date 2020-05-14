/**
 * @fileoverview added by tsickle
 * Generated from: packages/upgrade/static/src/upgrade_component.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Injector, ɵlooseIdentical as looseIdentical } from '@angular/core';
import { $SCOPE } from '../../src/common/src/constants';
import { UpgradeHelper } from '../../src/common/src/upgrade_helper';
import { isFunction } from '../../src/common/src/util';
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
        { type: Directive }
    ];
    /** @nocollapse */
    UpgradeComponent.ctorParameters = () => [
        { type: String },
        { type: ElementRef },
        { type: Injector }
    ];
    return UpgradeComponent;
})();
export { UpgradeComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBK0MsZUFBZSxJQUFJLGNBQWMsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUdySyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEQsT0FBTyxFQUEyQyxhQUFhLEVBQUMsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1RyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sMkJBQTJCLENBQUM7O01BRS9DLGFBQWEsR0FBUSxlQUFlOztNQUNwQyxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QjtBQUVELE1BQU0sUUFBUTtJQUFkO1FBQ0UsMEJBQXFCLEdBQWEsRUFBRSxDQUFDO1FBQ3JDLDBCQUFxQixHQUFVLEVBQUUsQ0FBQztRQUVsQyw4QkFBeUIsR0FBYSxFQUFFLENBQUM7UUFFekMsd0JBQW1CLEdBQWlDLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0NBQUE7OztJQU5DLHlDQUFxQzs7SUFDckMseUNBQWtDOztJQUVsQyw2Q0FBeUM7O0lBRXpDLHVDQUF1RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQ3pEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsTUFDYSxnQkFBZ0I7Ozs7Ozs7Ozs7Ozs7OztRQXFDM0IsWUFBb0IsSUFBWSxFQUFVLFVBQXNCLEVBQVUsUUFBa0I7WUFBeEUsU0FBSSxHQUFKLElBQUksQ0FBUTtZQUFVLGVBQVUsR0FBVixVQUFVLENBQVk7WUFBVSxhQUFRLEdBQVIsUUFBUSxD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QyxPQUFPOzs7O1lBQ3hCLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLEVBQUMsQ0FBQztZQUVwRixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDN0M7UUFDSCxDQUFDOzs7Z0JBcE9GLFNBQVM7Ozs7O2dCQTVEa0IsVUFBVTtnQkFBZ0IsUUFBUTs7SUFpUzlELHVCQUFDO0tBQUE7U0FwT1ksZ0JBQWdCOzs7Ozs7SUFDM0Isa0NBQThCOzs7OztJQUU5QixxQ0FBb0M7Ozs7O0lBRXBDLG1DQUF5Qjs7Ozs7SUFDekIsb0NBQW1DOzs7OztJQUNuQywyQ0FBZ0M7Ozs7O0lBRWhDLHFDQUE4Qjs7Ozs7SUFDOUIsb0NBQTJCOzs7OztJQUczQiw4Q0FBaUQ7Ozs7O0lBRWpELDhDQUFpRDs7Ozs7SUFNakQsMENBQTRDOzs7OztJQUc1QyxvREFBNEM7Ozs7O0lBYWhDLGdDQUFvQjs7Ozs7SUFBRSxzQ0FBOEI7Ozs7O0lBQUUsb0NBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3RvciwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgU2ltcGxlQ2hhbmdlcywgybVsb29zZUlkZW50aWNhbCBhcyBsb29zZUlkZW50aWNhbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SUF0dHJpYnV0ZXMsIElBdWdtZW50ZWRKUXVlcnksIElEaXJlY3RpdmUsIElJbmplY3RvclNlcnZpY2UsIElMaW5rRm4sIElTY29wZSwgSVRyYW5zY2x1ZGVGdW5jdGlvbn0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvYW5ndWxhcjEnO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4uLy4uL3NyYy9jb21tb24vc3JjL2NvbnN0YW50cyc7XG5pbXBvcnQge0lCaW5kaW5nRGVzdGluYXRpb24sIElDb250cm9sbGVySW5zdGFuY2UsIFVwZ3JhZGVIZWxwZXJ9IGZyb20gJy4uLy4uL3NyYy9jb21tb24vc3JjL3VwZ3JhZGVfaGVscGVyJztcbmltcG9ydCB7aXNGdW5jdGlvbn0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvdXRpbCc7XG5cbmNvbnN0IE5PVF9TVVBQT1JURUQ6IGFueSA9ICdOT1RfU1VQUE9SVEVEJztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuXG5jbGFzcyBCaW5kaW5ncyB7XG4gIHR3b1dheUJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgdHdvV2F5Qm91bmRMYXN0VmFsdWVzOiBhbnlbXSA9IFtdO1xuXG4gIGV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cbiAgcHJvcGVydHlUb091dHB1dE1hcDoge1twcm9wTmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGNsYXNzIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXIuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBT1QgY29tcGlsYXRpb24uKlxuICpcbiAqIFRoaXMgaGVscGVyIGNsYXNzIHNob3VsZCBiZSB1c2VkIGFzIGEgYmFzZSBjbGFzcyBmb3IgY3JlYXRpbmcgQW5ndWxhciBkaXJlY3RpdmVzXG4gKiB0aGF0IHdyYXAgQW5ndWxhckpTIGNvbXBvbmVudHMgdGhhdCBuZWVkIHRvIGJlIFwidXBncmFkZWRcIi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogTGV0J3MgYXNzdW1lIHRoYXQgeW91IGhhdmUgYW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYWxsZWQgYG5nMUhlcm9gIHRoYXQgbmVlZHNcbiAqIHRvIGJlIG1hZGUgYXZhaWxhYmxlIGluIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyb1wifVxuICpcbiAqIFdlIG11c3QgY3JlYXRlIGEgYERpcmVjdGl2ZWAgdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFySlMgY29tcG9uZW50XG4gKiBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyby13cmFwcGVyXCJ9XG4gKlxuICogSW4gdGhpcyBleGFtcGxlIHlvdSBjYW4gc2VlIHRoYXQgd2UgbXVzdCBkZXJpdmUgZnJvbSB0aGUgYFVwZ3JhZGVDb21wb25lbnRgXG4gKiBiYXNlIGNsYXNzIGJ1dCBhbHNvIHByb3ZpZGUgYW4ge0BsaW5rIERpcmVjdGl2ZSBgQERpcmVjdGl2ZWB9IGRlY29yYXRvci4gVGhpcyBpc1xuICogYmVjYXVzZSB0aGUgQU9UIGNvbXBpbGVyIHJlcXVpcmVzIHRoYXQgdGhpcyBpbmZvcm1hdGlvbiBpcyBzdGF0aWNhbGx5IGF2YWlsYWJsZSBhdFxuICogY29tcGlsZSB0aW1lLlxuICpcbiAqIE5vdGUgdGhhdCB3ZSBtdXN0IGRvIHRoZSBmb2xsb3dpbmc6XG4gKiAqIHNwZWNpZnkgdGhlIGRpcmVjdGl2ZSdzIHNlbGVjdG9yIChgbmcxLWhlcm9gKVxuICogKiBzcGVjaWZ5IGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgdGhhdCB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBleHBlY3RzXG4gKiAqIGRlcml2ZSBmcm9tIGBVcGdyYWRlQ29tcG9uZW50YFxuICogKiBjYWxsIHRoZSBiYXNlIGNsYXNzIGZyb20gdGhlIGNvbnN0cnVjdG9yLCBwYXNzaW5nXG4gKiAgICogdGhlIEFuZ3VsYXJKUyBuYW1lIG9mIHRoZSBjb21wb25lbnQgKGBuZzFIZXJvYClcbiAqICAgKiB0aGUgYEVsZW1lbnRSZWZgIGFuZCBgSW5qZWN0b3JgIGZvciB0aGUgY29tcG9uZW50IHdyYXBwZXJcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjaywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBoZWxwZXI6IFVwZ3JhZGVIZWxwZXI7XG5cbiAgcHJpdmF0ZSAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2U7XG5cbiAgcHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50O1xuICBwcml2YXRlICRlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5O1xuICBwcml2YXRlICRjb21wb25lbnRTY29wZTogSVNjb3BlO1xuXG4gIHByaXZhdGUgZGlyZWN0aXZlOiBJRGlyZWN0aXZlO1xuICBwcml2YXRlIGJpbmRpbmdzOiBCaW5kaW5ncztcblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBjb250cm9sbGVySW5zdGFuY2UhOiBJQ29udHJvbGxlckluc3RhbmNlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBiaW5kaW5nRGVzdGluYXRpb24hOiBJQmluZGluZ0Rlc3RpbmF0aW9uO1xuXG4gIC8vIFdlIHdpbGwgYmUgaW5zdGFudGlhdGluZyB0aGUgY29udHJvbGxlciBpbiB0aGUgYG5nT25Jbml0YCBob29rLCB3aGVuIHRoZVxuICAvLyBmaXJzdCBgbmdPbkNoYW5nZXNgIHdpbGwgaGF2ZSBiZWVuIGFscmVhZHkgdHJpZ2dlcmVkLiBXZSBzdG9yZSB0aGVcbiAgLy8gYFNpbXBsZUNoYW5nZXNgIGFuZCBcInBsYXkgdGhlbSBiYWNrXCIgbGF0ZXIuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHBlbmRpbmdDaGFuZ2VzITogU2ltcGxlQ2hhbmdlc3xudWxsO1xuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlciE6IEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFVwZ3JhZGVDb21wb25lbnRgIGluc3RhbmNlLiBZb3Ugc2hvdWxkIG5vdCBub3JtYWxseSBuZWVkIHRvIGRvIHRoaXMuXG4gICAqIEluc3RlYWQgeW91IHNob3VsZCBkZXJpdmUgYSBuZXcgY2xhc3MgZnJvbSB0aGlzIG9uZSBhbmQgY2FsbCB0aGUgc3VwZXIgY29uc3RydWN0b3JcbiAgICogZnJvbSB0aGUgYmFzZSBjbGFzcy5cbiAgICpcbiAgICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIiB9XG4gICAqXG4gICAqICogVGhlIGBuYW1lYCBwYXJhbWV0ZXIgc2hvdWxkIGJlIHRoZSBuYW1lIG9mIHRoZSBBbmd1bGFySlMgZGlyZWN0aXZlLlxuICAgKiAqIFRoZSBgZWxlbWVudFJlZmAgYW5kIGBpbmplY3RvcmAgcGFyYW1ldGVycyBzaG91bGQgYmUgYWNxdWlyZWQgZnJvbSBBbmd1bGFyIGJ5IGRlcGVuZGVuY3lcbiAgICogICBpbmplY3Rpb24gaW50byB0aGUgYmFzZSBjbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbmFtZTogc3RyaW5nLCBwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5oZWxwZXIgPSBuZXcgVXBncmFkZUhlbHBlcihpbmplY3RvciwgbmFtZSwgZWxlbWVudFJlZik7XG5cbiAgICB0aGlzLiRpbmplY3RvciA9IHRoaXMuaGVscGVyLiRpbmplY3RvcjtcblxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuaGVscGVyLmVsZW1lbnQ7XG4gICAgdGhpcy4kZWxlbWVudCA9IHRoaXMuaGVscGVyLiRlbGVtZW50O1xuXG4gICAgdGhpcy5kaXJlY3RpdmUgPSB0aGlzLmhlbHBlci5kaXJlY3RpdmU7XG4gICAgdGhpcy5iaW5kaW5ncyA9IHRoaXMuaW5pdGlhbGl6ZUJpbmRpbmdzKHRoaXMuZGlyZWN0aXZlKTtcblxuICAgIC8vIFdlIGFzayBmb3IgdGhlIEFuZ3VsYXJKUyBzY29wZSBmcm9tIHRoZSBBbmd1bGFyIGluamVjdG9yLCBzaW5jZVxuICAgIC8vIHdlIHdpbGwgcHV0IHRoZSBuZXcgY29tcG9uZW50IHNjb3BlIG9udG8gdGhlIG5ldyBpbmplY3RvciBmb3IgZWFjaCBjb21wb25lbnRcbiAgICBjb25zdCAkcGFyZW50U2NvcGUgPSBpbmplY3Rvci5nZXQoJFNDT1BFKTtcbiAgICAvLyBRVUVTVElPTiAxOiBTaG91bGQgd2UgY3JlYXRlIGFuIGlzb2xhdGVkIHNjb3BlIGlmIHRoZSBzY29wZSBpcyBvbmx5IHRydWU/XG4gICAgLy8gUVVFU1RJT04gMjogU2hvdWxkIHdlIG1ha2UgdGhlIHNjb3BlIGFjY2Vzc2libGUgdGhyb3VnaCBgJGVsZW1lbnQuc2NvcGUoKS9pc29sYXRlU2NvcGUoKWA/XG4gICAgdGhpcy4kY29tcG9uZW50U2NvcGUgPSAkcGFyZW50U2NvcGUuJG5ldyghIXRoaXMuZGlyZWN0aXZlLnNjb3BlKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZU91dHB1dHMoKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIENvbGxlY3QgY29udGVudHMsIGluc2VydCBhbmQgY29tcGlsZSB0ZW1wbGF0ZVxuICAgIGNvbnN0IGF0dGFjaENoaWxkTm9kZXM6IElMaW5rRm58dW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSgpO1xuXG4gICAgLy8gSW5zdGFudGlhdGUgY29udHJvbGxlclxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICBjb25zdCBiaW5kVG9Db250cm9sbGVyID0gdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlcjtcbiAgICBpZiAoY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLiRjb21wb25lbnRTY29wZSk7XG4gICAgfSBlbHNlIGlmIChiaW5kVG9Db250cm9sbGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHtcbiAgICAgICAgICB0aGlzLmRpcmVjdGl2ZS5uYW1lfScgc3BlY2lmaWVzICdiaW5kVG9Db250cm9sbGVyJyBidXQgbm8gY29udHJvbGxlci5gKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgb3V0cHV0c1xuICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uID0gYmluZFRvQ29udHJvbGxlciA/IHRoaXMuY29udHJvbGxlckluc3RhbmNlIDogdGhpcy4kY29tcG9uZW50U2NvcGU7XG4gICAgdGhpcy5iaW5kT3V0cHV0cygpO1xuXG4gICAgLy8gUmVxdWlyZSBvdGhlciBjb250cm9sbGVyc1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPVxuICAgICAgICB0aGlzLmhlbHBlci5yZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnModGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuXG4gICAgLy8gSG9vazogJG9uQ2hhbmdlc1xuICAgIGlmICh0aGlzLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICB0aGlzLmZvcndhcmRDaGFuZ2VzKHRoaXMucGVuZGluZ0NoYW5nZXMpO1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJG9uSW5pdFxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJGRvQ2hlY2tcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaykpIHtcbiAgICAgIGNvbnN0IGNhbGxEb0NoZWNrID0gKCkgPT4gdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2shKCk7XG5cbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyID0gdGhpcy4kY29tcG9uZW50U2NvcGUuJHBhcmVudC4kd2F0Y2goY2FsbERvQ2hlY2spO1xuICAgICAgY2FsbERvQ2hlY2soKTtcbiAgICB9XG5cbiAgICAvLyBMaW5raW5nXG4gICAgY29uc3QgbGluayA9IHRoaXMuZGlyZWN0aXZlLmxpbms7XG4gICAgY29uc3QgcHJlTGluayA9IHR5cGVvZiBsaW5rID09ICdvYmplY3QnICYmIGxpbmsucHJlO1xuICAgIGNvbnN0IHBvc3RMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgPyBsaW5rLnBvc3QgOiBsaW5rO1xuICAgIGNvbnN0IGF0dHJzOiBJQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBJVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgbGlua0ZuKHRoaXMuJGNvbXBvbmVudFNjb3BlLCBudWxsISwge3BhcmVudEJvdW5kVHJhbnNjbHVkZUZuOiBhdHRhY2hDaGlsZE5vZGVzfSk7XG5cbiAgICBpZiAocG9zdExpbmspIHtcbiAgICAgIHBvc3RMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkcG9zdExpbmtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmspKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmsoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKCF0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbikge1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IGNoYW5nZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9yd2FyZENoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGNvbnN0IHR3b1dheUJvdW5kUHJvcGVydGllcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzO1xuICAgIGNvbnN0IHR3b1dheUJvdW5kTGFzdFZhbHVlcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRMYXN0VmFsdWVzO1xuICAgIGNvbnN0IHByb3BlcnR5VG9PdXRwdXRNYXAgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXA7XG5cbiAgICB0d29XYXlCb3VuZFByb3BlcnRpZXMuZm9yRWFjaCgocHJvcE5hbWUsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV07XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdO1xuXG4gICAgICBpZiAoIWxvb3NlSWRlbnRpY2FsKG5ld1ZhbHVlLCBvbGRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChuZXdWYWx1ZSk7XG4gICAgICAgIHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcikpIHtcbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyKCk7XG4gICAgfVxuICAgIHRoaXMuaGVscGVyLm9uRGVzdHJveSh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplQmluZGluZ3MoZGlyZWN0aXZlOiBJRGlyZWN0aXZlKSB7XG4gICAgY29uc3QgYnRjSXNPYmplY3QgPSB0eXBlb2YgZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgPT09ICdvYmplY3QnO1xuICAgIGlmIChidGNJc09iamVjdCAmJiBPYmplY3Qua2V5cyhkaXJlY3RpdmUuc2NvcGUhKS5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQmluZGluZyBkZWZpbml0aW9ucyBvbiBzY29wZSBhbmQgY29udHJvbGxlciBhdCB0aGUgc2FtZSB0aW1lIGlzIG5vdCBzdXBwb3J0ZWQuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dCA9IGJ0Y0lzT2JqZWN0ID8gZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgOiBkaXJlY3RpdmUuc2NvcGU7XG4gICAgY29uc3QgYmluZGluZ3MgPSBuZXcgQmluZGluZ3MoKTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoY29udGV4dCkuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb250ZXh0W3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBkZWZpbml0aW9uLmNoYXJBdCgwKTtcblxuICAgICAgICAvLyBRVUVTVElPTjogV2hhdCBhYm91dCBgPSpgPyBJZ25vcmU/IFRocm93PyBTdXBwb3J0P1xuXG4gICAgICAgIHN3aXRjaCAoYmluZGluZ1R5cGUpIHtcbiAgICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgc3BlY2lhbC4gVGhleSB3aWxsIGJlIGRlZmluZWQgYXMgaW5wdXRzIG9uIHRoZVxuICAgICAgICAgICAgLy8gdXBncmFkZWQgY29tcG9uZW50IGZhY2FkZSBhbmQgdGhlIGNoYW5nZSBwcm9wYWdhdGlvbiB3aWxsIGJlIGhhbmRsZWQgYnlcbiAgICAgICAgICAgIC8vIGBuZ09uQ2hhbmdlcygpYC5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJz0nOlxuICAgICAgICAgICAgYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgICAgYmluZGluZ3MudHdvV2F5Qm91bmRMYXN0VmFsdWVzLnB1c2goSU5JVElBTF9WQUxVRSk7XG4gICAgICAgICAgICBiaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXSA9IHByb3BOYW1lICsgJ0NoYW5nZSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgIGJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICBiaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxldCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGV4dCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgbWFwcGluZyAnJHtiaW5kaW5nVHlwZX0nIGluICcke2pzb259JyBpbiAnJHt0aGlzLm5hbWV9JyBkaXJlY3RpdmUuYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBiaW5kaW5ncztcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZU91dHB1dHMoKSB7XG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgb3V0cHV0cyBmb3IgYD1gIGFuZCBgJmAgYmluZGluZ3NcbiAgICB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcy5jb25jYXQodGhpcy5iaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzKVxuICAgICAgICAuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICAgICAgKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGJpbmRPdXRwdXRzKCkge1xuICAgIC8vIEJpbmQgYCZgIGJpbmRpbmdzIHRvIHRoZSBjb3JyZXNwb25kaW5nIG91dHB1dHNcbiAgICB0aGlzLmJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICBjb25zdCBvdXRwdXROYW1lID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IGVtaXR0ZXIgPSAodGhpcyBhcyBhbnkpW291dHB1dE5hbWVdO1xuXG4gICAgICB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV0gPSAodmFsdWU6IGFueSkgPT4gZW1pdHRlci5lbWl0KHZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZm9yd2FyZENoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIC8vIEZvcndhcmQgaW5wdXQgY2hhbmdlcyB0byBgYmluZGluZ0Rlc3RpbmF0aW9uYFxuICAgIE9iamVjdC5rZXlzKGNoYW5nZXMpLmZvckVhY2goXG4gICAgICAgIHByb3BOYW1lID0+IHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXSA9IGNoYW5nZXNbcHJvcE5hbWVdLmN1cnJlbnRWYWx1ZSk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbi4kb25DaGFuZ2VzKSkge1xuICAgICAgdGhpcy5iaW5kaW5nRGVzdGluYXRpb24uJG9uQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==