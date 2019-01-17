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
import { EventEmitter, ɵlooseIdentical as looseIdentical } from '@angular/core';
import { $SCOPE } from '../common/constants';
import { UpgradeHelper } from '../common/upgrade_helper';
import { isFunction } from '../common/util';
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
 * library for hybrid upgrade apps that support AoT compilation.*
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
 * because the AoT compiler requires that this information is statically available at
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
export class UpgradeComponent {
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
            const callDoCheck = () => (/** @type {?} */ (this.controllerInstance.$doCheck))();
            this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
            callDoCheck();
        }
        // Linking
        /** @type {?} */
        const link = this.directive.link;
        /** @type {?} */
        const preLink = (typeof link == 'object') && ((/** @type {?} */ (link))).pre;
        /** @type {?} */
        const postLink = (typeof link == 'object') ? ((/** @type {?} */ (link))).post : link;
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
        twoWayBoundProperties.forEach((propName, idx) => {
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
        });
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
        const context = (btcIsObject) ? directive.bindToController : directive.scope;
        /** @type {?} */
        const bindings = new Bindings();
        if (typeof context == 'object') {
            Object.keys(context).forEach(propName => {
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
            });
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
            .forEach(propName => {
            /** @type {?} */
            const outputName = this.bindings.propertyToOutputMap[propName];
            ((/** @type {?} */ (this)))[outputName] = new EventEmitter();
        });
    }
    /**
     * @private
     * @return {?}
     */
    bindOutputs() {
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach(propName => {
            /** @type {?} */
            const outputName = this.bindings.propertyToOutputMap[propName];
            /** @type {?} */
            const emitter = ((/** @type {?} */ (this)))[outputName];
            this.bindingDestination[propName] = (value) => emitter.emit(value);
        });
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    forwardChanges(changes) {
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach(propName => this.bindingDestination[propName] = changes[propName].currentValue);
        if (isFunction(this.bindingDestination.$onChanges)) {
            this.bindingDestination.$onChanges(changes);
        }
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvc3RhdGljL3VwZ3JhZGVfY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFzQixZQUFZLEVBQXlELGVBQWUsSUFBSSxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFMUosT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBMkMsYUFBYSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakcsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGdCQUFnQixDQUFDOztNQUVwQyxhQUFhLEdBQVEsZUFBZTs7TUFDcEMsYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEI7QUFFRCxNQUFNLFFBQVE7SUFBZDtRQUNFLDBCQUFxQixHQUFhLEVBQUUsQ0FBQztRQUNyQywwQkFBcUIsR0FBVSxFQUFFLENBQUM7UUFFbEMsOEJBQXlCLEdBQWEsRUFBRSxDQUFDO1FBRXpDLHdCQUFtQixHQUFpQyxFQUFFLENBQUM7SUFDekQsQ0FBQztDQUFBOzs7SUFOQyx5Q0FBcUM7O0lBQ3JDLHlDQUFrQzs7SUFFbEMsNkNBQXlDOztJQUV6Qyx1Q0FBdUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEN6RCxNQUFNLE9BQU8sZ0JBQWdCOzs7Ozs7Ozs7Ozs7Ozs7SUFxQzNCLFlBQW9CLElBQVksRUFBVSxVQUFzQixFQUFVLFFBQWtCO1FBQXhFLFNBQUksR0FBSixJQUFJLENBQVE7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUMxRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJ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UUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXBGLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNsRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzdDO0lBQ0gsQ0FBQztDQUNGOzs7Ozs7SUFuT0Msa0NBQThCOzs7OztJQUU5QixxQ0FBNEM7Ozs7O0lBRTVDLG1DQUF5Qjs7Ozs7SUFDekIsb0NBQTJDOzs7OztJQUMzQywyQ0FBd0M7Ozs7O0lBRXhDLHFDQUFzQzs7Ozs7SUFDdEMsb0NBQTJCOzs7OztJQUczQiw4Q0FBa0Q7Ozs7O0lBRWxELDhDQUFrRDs7Ozs7SUFNbEQsMENBQStDOzs7OztJQUcvQyxvREFBNkM7Ozs7O0lBYWpDLGdDQUFvQjs7Ozs7SUFBRSxzQ0FBOEI7Ozs7O0lBQUUsb0NBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RvQ2hlY2ssIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFNpbXBsZUNoYW5nZXMsIMm1bG9vc2VJZGVudGljYWwgYXMgbG9vc2VJZGVudGljYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi9jb21tb24vYW5ndWxhcjEnO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHtJQmluZGluZ0Rlc3RpbmF0aW9uLCBJQ29udHJvbGxlckluc3RhbmNlLCBVcGdyYWRlSGVscGVyfSBmcm9tICcuLi9jb21tb24vdXBncmFkZV9oZWxwZXInO1xuaW1wb3J0IHtpc0Z1bmN0aW9ufSBmcm9tICcuLi9jb21tb24vdXRpbCc7XG5cbmNvbnN0IE5PVF9TVVBQT1JURUQ6IGFueSA9ICdOT1RfU1VQUE9SVEVEJztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuXG5jbGFzcyBCaW5kaW5ncyB7XG4gIHR3b1dheUJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgdHdvV2F5Qm91bmRMYXN0VmFsdWVzOiBhbnlbXSA9IFtdO1xuXG4gIGV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cbiAgcHJvcGVydHlUb091dHB1dE1hcDoge1twcm9wTmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGNsYXNzIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXIuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24uKlxuICpcbiAqIFRoaXMgaGVscGVyIGNsYXNzIHNob3VsZCBiZSB1c2VkIGFzIGEgYmFzZSBjbGFzcyBmb3IgY3JlYXRpbmcgQW5ndWxhciBkaXJlY3RpdmVzXG4gKiB0aGF0IHdyYXAgQW5ndWxhckpTIGNvbXBvbmVudHMgdGhhdCBuZWVkIHRvIGJlIFwidXBncmFkZWRcIi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogTGV0J3MgYXNzdW1lIHRoYXQgeW91IGhhdmUgYW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYWxsZWQgYG5nMUhlcm9gIHRoYXQgbmVlZHNcbiAqIHRvIGJlIG1hZGUgYXZhaWxhYmxlIGluIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyb1wifVxuICpcbiAqIFdlIG11c3QgY3JlYXRlIGEgYERpcmVjdGl2ZWAgdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFySlMgY29tcG9uZW50XG4gKiBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyby13cmFwcGVyXCJ9XG4gKlxuICogSW4gdGhpcyBleGFtcGxlIHlvdSBjYW4gc2VlIHRoYXQgd2UgbXVzdCBkZXJpdmUgZnJvbSB0aGUgYFVwZ3JhZGVDb21wb25lbnRgXG4gKiBiYXNlIGNsYXNzIGJ1dCBhbHNvIHByb3ZpZGUgYW4ge0BsaW5rIERpcmVjdGl2ZSBgQERpcmVjdGl2ZWB9IGRlY29yYXRvci4gVGhpcyBpc1xuICogYmVjYXVzZSB0aGUgQW9UIGNvbXBpbGVyIHJlcXVpcmVzIHRoYXQgdGhpcyBpbmZvcm1hdGlvbiBpcyBzdGF0aWNhbGx5IGF2YWlsYWJsZSBhdFxuICogY29tcGlsZSB0aW1lLlxuICpcbiAqIE5vdGUgdGhhdCB3ZSBtdXN0IGRvIHRoZSBmb2xsb3dpbmc6XG4gKiAqIHNwZWNpZnkgdGhlIGRpcmVjdGl2ZSdzIHNlbGVjdG9yIChgbmcxLWhlcm9gKVxuICogKiBzcGVjaWZ5IGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgdGhhdCB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBleHBlY3RzXG4gKiAqIGRlcml2ZSBmcm9tIGBVcGdyYWRlQ29tcG9uZW50YFxuICogKiBjYWxsIHRoZSBiYXNlIGNsYXNzIGZyb20gdGhlIGNvbnN0cnVjdG9yLCBwYXNzaW5nXG4gKiAgICogdGhlIEFuZ3VsYXJKUyBuYW1lIG9mIHRoZSBjb21wb25lbnQgKGBuZzFIZXJvYClcbiAqICAgKiB0aGUgYEVsZW1lbnRSZWZgIGFuZCBgSW5qZWN0b3JgIGZvciB0aGUgY29tcG9uZW50IHdyYXBwZXJcbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgaGVscGVyOiBVcGdyYWRlSGVscGVyO1xuXG4gIHByaXZhdGUgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2U7XG5cbiAgcHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50O1xuICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XG4gIHByaXZhdGUgJGNvbXBvbmVudFNjb3BlOiBhbmd1bGFyLklTY29wZTtcblxuICBwcml2YXRlIGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlO1xuICBwcml2YXRlIGJpbmRpbmdzOiBCaW5kaW5ncztcblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBjb250cm9sbGVySW5zdGFuY2UgITogSUNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgYmluZGluZ0Rlc3RpbmF0aW9uICE6IElCaW5kaW5nRGVzdGluYXRpb247XG5cbiAgLy8gV2Ugd2lsbCBiZSBpbnN0YW50aWF0aW5nIHRoZSBjb250cm9sbGVyIGluIHRoZSBgbmdPbkluaXRgIGhvb2ssIHdoZW4gdGhlXG4gIC8vIGZpcnN0IGBuZ09uQ2hhbmdlc2Agd2lsbCBoYXZlIGJlZW4gYWxyZWFkeSB0cmlnZ2VyZWQuIFdlIHN0b3JlIHRoZVxuICAvLyBgU2ltcGxlQ2hhbmdlc2AgYW5kIFwicGxheSB0aGVtIGJhY2tcIiBsYXRlci5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgcGVuZGluZ0NoYW5nZXMgITogU2ltcGxlQ2hhbmdlcyB8IG51bGw7XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgdW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyICE6IEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFVwZ3JhZGVDb21wb25lbnRgIGluc3RhbmNlLiBZb3Ugc2hvdWxkIG5vdCBub3JtYWxseSBuZWVkIHRvIGRvIHRoaXMuXG4gICAqIEluc3RlYWQgeW91IHNob3VsZCBkZXJpdmUgYSBuZXcgY2xhc3MgZnJvbSB0aGlzIG9uZSBhbmQgY2FsbCB0aGUgc3VwZXIgY29uc3RydWN0b3JcbiAgICogZnJvbSB0aGUgYmFzZSBjbGFzcy5cbiAgICpcbiAgICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIiB9XG4gICAqXG4gICAqICogVGhlIGBuYW1lYCBwYXJhbWV0ZXIgc2hvdWxkIGJlIHRoZSBuYW1lIG9mIHRoZSBBbmd1bGFySlMgZGlyZWN0aXZlLlxuICAgKiAqIFRoZSBgZWxlbWVudFJlZmAgYW5kIGBpbmplY3RvcmAgcGFyYW1ldGVycyBzaG91bGQgYmUgYWNxdWlyZWQgZnJvbSBBbmd1bGFyIGJ5IGRlcGVuZGVuY3lcbiAgICogICBpbmplY3Rpb24gaW50byB0aGUgYmFzZSBjbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbmFtZTogc3RyaW5nLCBwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5oZWxwZXIgPSBuZXcgVXBncmFkZUhlbHBlcihpbmplY3RvciwgbmFtZSwgZWxlbWVudFJlZik7XG5cbiAgICB0aGlzLiRpbmplY3RvciA9IHRoaXMuaGVscGVyLiRpbmplY3RvcjtcblxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuaGVscGVyLmVsZW1lbnQ7XG4gICAgdGhpcy4kZWxlbWVudCA9IHRoaXMuaGVscGVyLiRlbGVtZW50O1xuXG4gICAgdGhpcy5kaXJlY3RpdmUgPSB0aGlzLmhlbHBlci5kaXJlY3RpdmU7XG4gICAgdGhpcy5iaW5kaW5ncyA9IHRoaXMuaW5pdGlhbGl6ZUJpbmRpbmdzKHRoaXMuZGlyZWN0aXZlKTtcblxuICAgIC8vIFdlIGFzayBmb3IgdGhlIEFuZ3VsYXJKUyBzY29wZSBmcm9tIHRoZSBBbmd1bGFyIGluamVjdG9yLCBzaW5jZVxuICAgIC8vIHdlIHdpbGwgcHV0IHRoZSBuZXcgY29tcG9uZW50IHNjb3BlIG9udG8gdGhlIG5ldyBpbmplY3RvciBmb3IgZWFjaCBjb21wb25lbnRcbiAgICBjb25zdCAkcGFyZW50U2NvcGUgPSBpbmplY3Rvci5nZXQoJFNDT1BFKTtcbiAgICAvLyBRVUVTVElPTiAxOiBTaG91bGQgd2UgY3JlYXRlIGFuIGlzb2xhdGVkIHNjb3BlIGlmIHRoZSBzY29wZSBpcyBvbmx5IHRydWU/XG4gICAgLy8gUVVFU1RJT04gMjogU2hvdWxkIHdlIG1ha2UgdGhlIHNjb3BlIGFjY2Vzc2libGUgdGhyb3VnaCBgJGVsZW1lbnQuc2NvcGUoKS9pc29sYXRlU2NvcGUoKWA/XG4gICAgdGhpcy4kY29tcG9uZW50U2NvcGUgPSAkcGFyZW50U2NvcGUuJG5ldyghIXRoaXMuZGlyZWN0aXZlLnNjb3BlKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZU91dHB1dHMoKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIENvbGxlY3QgY29udGVudHMsIGluc2VydCBhbmQgY29tcGlsZSB0ZW1wbGF0ZVxuICAgIGNvbnN0IGF0dGFjaENoaWxkTm9kZXM6IGFuZ3VsYXIuSUxpbmtGbnx1bmRlZmluZWQgPSB0aGlzLmhlbHBlci5wcmVwYXJlVHJhbnNjbHVzaW9uKCk7XG4gICAgY29uc3QgbGlua0ZuID0gdGhpcy5oZWxwZXIuY29tcGlsZVRlbXBsYXRlKCk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGlmIChjb250cm9sbGVyVHlwZSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuJGNvbXBvbmVudFNjb3BlKTtcbiAgICB9IGVsc2UgaWYgKGJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVXBncmFkZWQgZGlyZWN0aXZlICcke3RoaXMuZGlyZWN0aXZlLm5hbWV9JyBzcGVjaWZpZXMgJ2JpbmRUb0NvbnRyb2xsZXInIGJ1dCBubyBjb250cm9sbGVyLmApO1xuICAgIH1cblxuICAgIC8vIFNldCB1cCBvdXRwdXRzXG4gICAgdGhpcy5iaW5kaW5nRGVzdGluYXRpb24gPSBiaW5kVG9Db250cm9sbGVyID8gdGhpcy5jb250cm9sbGVySW5zdGFuY2UgOiB0aGlzLiRjb21wb25lbnRTY29wZTtcbiAgICB0aGlzLmJpbmRPdXRwdXRzKCk7XG5cbiAgICAvLyBSZXF1aXJlIG90aGVyIGNvbnRyb2xsZXJzXG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9XG4gICAgICAgIHRoaXMuaGVscGVyLnJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSk7XG5cbiAgICAvLyBIb29rOiAkb25DaGFuZ2VzXG4gICAgaWYgKHRoaXMucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgIHRoaXMuZm9yd2FyZENoYW5nZXModGhpcy5wZW5kaW5nQ2hhbmdlcyk7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkb25Jbml0XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkZG9DaGVja1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKSkge1xuICAgICAgY29uc3QgY2FsbERvQ2hlY2sgPSAoKSA9PiB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjayAhKCk7XG5cbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyID0gdGhpcy4kY29tcG9uZW50U2NvcGUuJHBhcmVudC4kd2F0Y2goY2FsbERvQ2hlY2spO1xuICAgICAgY2FsbERvQ2hlY2soKTtcbiAgICB9XG5cbiAgICAvLyBMaW5raW5nXG4gICAgY29uc3QgbGluayA9IHRoaXMuZGlyZWN0aXZlLmxpbms7XG4gICAgY29uc3QgcHJlTGluayA9ICh0eXBlb2YgbGluayA9PSAnb2JqZWN0JykgJiYgKGxpbmsgYXMgYW5ndWxhci5JRGlyZWN0aXZlUHJlUG9zdCkucHJlO1xuICAgIGNvbnN0IHBvc3RMaW5rID0gKHR5cGVvZiBsaW5rID09ICdvYmplY3QnKSA/IChsaW5rIGFzIGFuZ3VsYXIuSURpcmVjdGl2ZVByZVBvc3QpLnBvc3QgOiBsaW5rO1xuICAgIGNvbnN0IGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzID0gTk9UX1NVUFBPUlRFRDtcbiAgICBjb25zdCB0cmFuc2NsdWRlRm46IGFuZ3VsYXIuSVRyYW5zY2x1ZGVGdW5jdGlvbiA9IE5PVF9TVVBQT1JURUQ7XG4gICAgaWYgKHByZUxpbmspIHtcbiAgICAgIHByZUxpbmsodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIGxpbmtGbih0aGlzLiRjb21wb25lbnRTY29wZSwgbnVsbCAhLCB7cGFyZW50Qm91bmRUcmFuc2NsdWRlRm46IGF0dGFjaENoaWxkTm9kZXN9KTtcblxuICAgIGlmIChwb3N0TGluaykge1xuICAgICAgcG9zdExpbmsodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRwb3N0TGlua1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoIXRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uKSB7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gY2hhbmdlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb3J3YXJkQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3QgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzID0gdGhpcy5iaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXM7XG4gICAgY29uc3QgdHdvV2F5Qm91bmRMYXN0VmFsdWVzID0gdGhpcy5iaW5kaW5ncy50d29XYXlCb3VuZExhc3RWYWx1ZXM7XG4gICAgY29uc3QgcHJvcGVydHlUb091dHB1dE1hcCA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcDtcblxuICAgIHR3b1dheUJvdW5kUHJvcGVydGllcy5mb3JFYWNoKChwcm9wTmFtZSwgaWR4KSA9PiB7XG4gICAgICBjb25zdCBuZXdWYWx1ZSA9IHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdHdvV2F5Qm91bmRMYXN0VmFsdWVzW2lkeF07XG5cbiAgICAgIGlmICghbG9vc2VJZGVudGljYWwobmV3VmFsdWUsIG9sZFZhbHVlKSkge1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lID0gcHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGV2ZW50RW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4gPSAodGhpcyBhcyBhbnkpW291dHB1dE5hbWVdO1xuXG4gICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KG5ld1ZhbHVlKTtcbiAgICAgICAgdHdvV2F5Qm91bmRMYXN0VmFsdWVzW2lkeF0gPSBuZXdWYWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyKSkge1xuICAgICAgdGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIoKTtcbiAgICB9XG4gICAgdGhpcy5oZWxwZXIub25EZXN0cm95KHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSk7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemVCaW5kaW5ncyhkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZSkge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIGRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXMoZGlyZWN0aXZlLnNjb3BlICEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gKGJ0Y0lzT2JqZWN0KSA/IGRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyIDogZGlyZWN0aXZlLnNjb3BlO1xuICAgIGNvbnN0IGJpbmRpbmdzID0gbmV3IEJpbmRpbmdzKCk7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHQgPT0gJ29iamVjdCcpIHtcbiAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQpLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gY29udGV4dFtwcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gZGVmaW5pdGlvbi5jaGFyQXQoMCk7XG5cbiAgICAgICAgLy8gUVVFU1RJT046IFdoYXQgYWJvdXQgYD0qYD8gSWdub3JlPyBUaHJvdz8gU3VwcG9ydD9cblxuICAgICAgICBzd2l0Y2ggKGJpbmRpbmdUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIHNwZWNpYWwuIFRoZXkgd2lsbCBiZSBkZWZpbmVkIGFzIGlucHV0cyBvbiB0aGVcbiAgICAgICAgICAgIC8vIHVwZ3JhZGVkIGNvbXBvbmVudCBmYWNhZGUgYW5kIHRoZSBjaGFuZ2UgcHJvcGFnYXRpb24gd2lsbCBiZSBoYW5kbGVkIGJ5XG4gICAgICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIGJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnR3b1dheUJvdW5kTGFzdFZhbHVlcy5wdXNoKElOSVRJQUxfVkFMVUUpO1xuICAgICAgICAgICAgYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV0gPSBwcm9wTmFtZSArICdDaGFuZ2UnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICBiaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgICAgYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZXQganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIG1hcHBpbmcgJyR7YmluZGluZ1R5cGV9JyBpbiAnJHtqc29ufScgaW4gJyR7dGhpcy5uYW1lfScgZGlyZWN0aXZlLmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmluZGluZ3M7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemVPdXRwdXRzKCkge1xuICAgIC8vIEluaXRpYWxpemUgdGhlIG91dHB1dHMgZm9yIGA9YCBhbmQgYCZgIGJpbmRpbmdzXG4gICAgdGhpcy5iaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXMuY29uY2F0KHRoaXMuYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcylcbiAgICAgICAgLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgICAgICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV0gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBiaW5kT3V0cHV0cygpIHtcbiAgICAvLyBCaW5kIGAmYCBiaW5kaW5ncyB0byB0aGUgY29ycmVzcG9uZGluZyBvdXRwdXRzXG4gICAgdGhpcy5iaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICBjb25zdCBlbWl0dGVyID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgdGhpcy5iaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gKHZhbHVlOiBhbnkpID0+IGVtaXR0ZXIuZW1pdCh2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGZvcndhcmRDaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAvLyBGb3J3YXJkIGlucHV0IGNoYW5nZXMgdG8gYGJpbmRpbmdEZXN0aW5hdGlvbmBcbiAgICBPYmplY3Qua2V5cyhjaGFuZ2VzKS5mb3JFYWNoKFxuICAgICAgICBwcm9wTmFtZSA9PiB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV0gPSBjaGFuZ2VzW3Byb3BOYW1lXS5jdXJyZW50VmFsdWUpO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24odGhpcy5iaW5kaW5nRGVzdGluYXRpb24uJG9uQ2hhbmdlcykpIHtcbiAgICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG59XG4iXX0=