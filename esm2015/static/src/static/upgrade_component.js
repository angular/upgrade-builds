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
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper class should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
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
 * \@experimental
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
        /** @type {?} */
        const attachChildNodes = this.helper.prepareTransclusion();
        /** @type {?} */
        const linkFn = this.helper.compileTemplate();
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
            const callDoCheck = () => /** @type {?} */ ((this.controllerInstance.$doCheck))();
            this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
            callDoCheck();
        }
        /** @type {?} */
        const link = this.directive.link;
        /** @type {?} */
        const preLink = (typeof link == 'object') && (/** @type {?} */ (link)).pre;
        /** @type {?} */
        const postLink = (typeof link == 'object') ? (/** @type {?} */ (link)).post : link;
        /** @type {?} */
        const attrs = NOT_SUPPORTED;
        /** @type {?} */
        const transcludeFn = NOT_SUPPORTED;
        if (preLink) {
            preLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        linkFn(this.$componentScope, /** @type {?} */ ((null)), { parentBoundTranscludeFn: attachChildNodes });
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
                const eventEmitter = (/** @type {?} */ (this))[outputName];
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
     * @param {?} directive
     * @return {?}
     */
    initializeBindings(directive) {
        /** @type {?} */
        const btcIsObject = typeof directive.bindToController === 'object';
        if (btcIsObject && Object.keys(/** @type {?} */ ((directive.scope))).length) {
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
     * @return {?}
     */
    initializeOutputs() {
        // Initialize the outputs for `=` and `&` bindings
        this.bindings.twoWayBoundProperties.concat(this.bindings.expressionBoundProperties)
            .forEach(propName => {
            /** @type {?} */
            const outputName = this.bindings.propertyToOutputMap[propName];
            (/** @type {?} */ (this))[outputName] = new EventEmitter();
        });
    }
    /**
     * @return {?}
     */
    bindOutputs() {
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach(propName => {
            /** @type {?} */
            const outputName = this.bindings.propertyToOutputMap[propName];
            /** @type {?} */
            const emitter = (/** @type {?} */ (this))[outputName];
            this.bindingDestination[propName] = (value) => emitter.emit(value);
        });
    }
    /**
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
    /** @type {?} */
    UpgradeComponent.prototype.helper;
    /** @type {?} */
    UpgradeComponent.prototype.$injector;
    /** @type {?} */
    UpgradeComponent.prototype.element;
    /** @type {?} */
    UpgradeComponent.prototype.$element;
    /** @type {?} */
    UpgradeComponent.prototype.$componentScope;
    /** @type {?} */
    UpgradeComponent.prototype.directive;
    /** @type {?} */
    UpgradeComponent.prototype.bindings;
    /** @type {?} */
    UpgradeComponent.prototype.controllerInstance;
    /** @type {?} */
    UpgradeComponent.prototype.bindingDestination;
    /** @type {?} */
    UpgradeComponent.prototype.pendingChanges;
    /** @type {?} */
    UpgradeComponent.prototype.unregisterDoCheckWatcher;
    /** @type {?} */
    UpgradeComponent.prototype.name;
    /** @type {?} */
    UpgradeComponent.prototype.elementRef;
    /** @type {?} */
    UpgradeComponent.prototype.injector;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvc3RhdGljL3VwZ3JhZGVfY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFzQixZQUFZLEVBQXlELGVBQWUsSUFBSSxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFMUosT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBMkMsYUFBYSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakcsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGdCQUFnQixDQUFDOztBQUUxQyxNQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7O0FBQzNDLE1BQU0sYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUVGLE1BQU0sUUFBUTs7cUNBQ3NCLEVBQUU7cUNBQ0wsRUFBRTt5Q0FFSyxFQUFFO21DQUVZLEVBQUU7O0NBQ3ZEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0NELE1BQU0sT0FBTyxnQkFBZ0I7Ozs7Ozs7Ozs7Ozs7OztJQXFDM0IsWUFBb0IsSUFBWSxFQUFVLFVBQXNCLEVBQVUsUUFBa0I7UUFBeEUsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFVLGVBQVUsR0FBVixVQUFVLENBQVk7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQzFGLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUU1RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBRXZDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxD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QzdDOztDQUVKIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RvQ2hlY2ssIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFNpbXBsZUNoYW5nZXMsIMm1bG9vc2VJZGVudGljYWwgYXMgbG9vc2VJZGVudGljYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi9jb21tb24vYW5ndWxhcjEnO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHtJQmluZGluZ0Rlc3RpbmF0aW9uLCBJQ29udHJvbGxlckluc3RhbmNlLCBVcGdyYWRlSGVscGVyfSBmcm9tICcuLi9jb21tb24vdXBncmFkZV9oZWxwZXInO1xuaW1wb3J0IHtpc0Z1bmN0aW9ufSBmcm9tICcuLi9jb21tb24vdXRpbCc7XG5cbmNvbnN0IE5PVF9TVVBQT1JURUQ6IGFueSA9ICdOT1RfU1VQUE9SVEVEJztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuXG5jbGFzcyBCaW5kaW5ncyB7XG4gIHR3b1dheUJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgdHdvV2F5Qm91bmRMYXN0VmFsdWVzOiBhbnlbXSA9IFtdO1xuXG4gIGV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cbiAgcHJvcGVydHlUb091dHB1dE1hcDoge1twcm9wTmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGNsYXNzIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXIuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhpcyBoZWxwZXIgY2xhc3Mgc2hvdWxkIGJlIHVzZWQgYXMgYSBiYXNlIGNsYXNzIGZvciBjcmVhdGluZyBBbmd1bGFyIGRpcmVjdGl2ZXNcbiAqIHRoYXQgd3JhcCBBbmd1bGFySlMgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgXCJ1cGdyYWRlZFwiLlxuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIExldCdzIGFzc3VtZSB0aGF0IHlvdSBoYXZlIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FsbGVkIGBuZzFIZXJvYCB0aGF0IG5lZWRzXG4gKiB0byBiZSBtYWRlIGF2YWlsYWJsZSBpbiBBbmd1bGFyIHRlbXBsYXRlcy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLWhlcm9cIn1cbiAqXG4gKiBXZSBtdXN0IGNyZWF0ZSBhIGBEaXJlY3RpdmVgIHRoYXQgd2lsbCBtYWtlIHRoaXMgQW5ndWxhckpTIGNvbXBvbmVudFxuICogYXZhaWxhYmxlIGluc2lkZSBBbmd1bGFyIHRlbXBsYXRlcy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLWhlcm8td3JhcHBlclwifVxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSB5b3UgY2FuIHNlZSB0aGF0IHdlIG11c3QgZGVyaXZlIGZyb20gdGhlIGBVcGdyYWRlQ29tcG9uZW50YFxuICogYmFzZSBjbGFzcyBidXQgYWxzbyBwcm92aWRlIGFuIHtAbGluayBEaXJlY3RpdmUgYEBEaXJlY3RpdmVgfSBkZWNvcmF0b3IuIFRoaXMgaXNcbiAqIGJlY2F1c2UgdGhlIEFvVCBjb21waWxlciByZXF1aXJlcyB0aGF0IHRoaXMgaW5mb3JtYXRpb24gaXMgc3RhdGljYWxseSBhdmFpbGFibGUgYXRcbiAqIGNvbXBpbGUgdGltZS5cbiAqXG4gKiBOb3RlIHRoYXQgd2UgbXVzdCBkbyB0aGUgZm9sbG93aW5nOlxuICogKiBzcGVjaWZ5IHRoZSBkaXJlY3RpdmUncyBzZWxlY3RvciAoYG5nMS1oZXJvYClcbiAqICogc3BlY2lmeSBhbGwgaW5wdXRzIGFuZCBvdXRwdXRzIHRoYXQgdGhlIEFuZ3VsYXJKUyBjb21wb25lbnQgZXhwZWN0c1xuICogKiBkZXJpdmUgZnJvbSBgVXBncmFkZUNvbXBvbmVudGBcbiAqICogY2FsbCB0aGUgYmFzZSBjbGFzcyBmcm9tIHRoZSBjb25zdHJ1Y3RvciwgcGFzc2luZ1xuICogICAqIHRoZSBBbmd1bGFySlMgbmFtZSBvZiB0aGUgY29tcG9uZW50IChgbmcxSGVyb2ApXG4gKiAgICogdGhlIGBFbGVtZW50UmVmYCBhbmQgYEluamVjdG9yYCBmb3IgdGhlIGNvbXBvbmVudCB3cmFwcGVyXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgY2xhc3MgVXBncmFkZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGhlbHBlcjogVXBncmFkZUhlbHBlcjtcblxuICBwcml2YXRlICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlO1xuXG4gIHByaXZhdGUgZWxlbWVudDogRWxlbWVudDtcbiAgcHJpdmF0ZSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5O1xuICBwcml2YXRlICRjb21wb25lbnRTY29wZTogYW5ndWxhci5JU2NvcGU7XG5cbiAgcHJpdmF0ZSBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZTtcbiAgcHJpdmF0ZSBiaW5kaW5nczogQmluZGluZ3M7XG5cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgY29udHJvbGxlckluc3RhbmNlICE6IElDb250cm9sbGVySW5zdGFuY2U7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGJpbmRpbmdEZXN0aW5hdGlvbiAhOiBJQmluZGluZ0Rlc3RpbmF0aW9uO1xuXG4gIC8vIFdlIHdpbGwgYmUgaW5zdGFudGlhdGluZyB0aGUgY29udHJvbGxlciBpbiB0aGUgYG5nT25Jbml0YCBob29rLCB3aGVuIHRoZVxuICAvLyBmaXJzdCBgbmdPbkNoYW5nZXNgIHdpbGwgaGF2ZSBiZWVuIGFscmVhZHkgdHJpZ2dlcmVkLiBXZSBzdG9yZSB0aGVcbiAgLy8gYFNpbXBsZUNoYW5nZXNgIGFuZCBcInBsYXkgdGhlbSBiYWNrXCIgbGF0ZXIuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHBlbmRpbmdDaGFuZ2VzICE6IFNpbXBsZUNoYW5nZXMgfCBudWxsO1xuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlciAhOiBGdW5jdGlvbjtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBVcGdyYWRlQ29tcG9uZW50YCBpbnN0YW5jZS4gWW91IHNob3VsZCBub3Qgbm9ybWFsbHkgbmVlZCB0byBkbyB0aGlzLlxuICAgKiBJbnN0ZWFkIHlvdSBzaG91bGQgZGVyaXZlIGEgbmV3IGNsYXNzIGZyb20gdGhpcyBvbmUgYW5kIGNhbGwgdGhlIHN1cGVyIGNvbnN0cnVjdG9yXG4gICAqIGZyb20gdGhlIGJhc2UgY2xhc3MuXG4gICAqXG4gICAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyby13cmFwcGVyXCIgfVxuICAgKlxuICAgKiAqIFRoZSBgbmFtZWAgcGFyYW1ldGVyIHNob3VsZCBiZSB0aGUgbmFtZSBvZiB0aGUgQW5ndWxhckpTIGRpcmVjdGl2ZS5cbiAgICogKiBUaGUgYGVsZW1lbnRSZWZgIGFuZCBgaW5qZWN0b3JgIHBhcmFtZXRlcnMgc2hvdWxkIGJlIGFjcXVpcmVkIGZyb20gQW5ndWxhciBieSBkZXBlbmRlbmN5XG4gICAqICAgaW5qZWN0aW9uIGludG8gdGhlIGJhc2UgY2xhc3MgY29uc3RydWN0b3IuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5hbWU6IHN0cmluZywgcHJpdmF0ZSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMuaGVscGVyID0gbmV3IFVwZ3JhZGVIZWxwZXIoaW5qZWN0b3IsIG5hbWUsIGVsZW1lbnRSZWYpO1xuXG4gICAgdGhpcy4kaW5qZWN0b3IgPSB0aGlzLmhlbHBlci4kaW5qZWN0b3I7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLmhlbHBlci5lbGVtZW50O1xuICAgIHRoaXMuJGVsZW1lbnQgPSB0aGlzLmhlbHBlci4kZWxlbWVudDtcblxuICAgIHRoaXMuZGlyZWN0aXZlID0gdGhpcy5oZWxwZXIuZGlyZWN0aXZlO1xuICAgIHRoaXMuYmluZGluZ3MgPSB0aGlzLmluaXRpYWxpemVCaW5kaW5ncyh0aGlzLmRpcmVjdGl2ZSk7XG5cbiAgICAvLyBXZSBhc2sgZm9yIHRoZSBBbmd1bGFySlMgc2NvcGUgZnJvbSB0aGUgQW5ndWxhciBpbmplY3Rvciwgc2luY2VcbiAgICAvLyB3ZSB3aWxsIHB1dCB0aGUgbmV3IGNvbXBvbmVudCBzY29wZSBvbnRvIHRoZSBuZXcgaW5qZWN0b3IgZm9yIGVhY2ggY29tcG9uZW50XG4gICAgY29uc3QgJHBhcmVudFNjb3BlID0gaW5qZWN0b3IuZ2V0KCRTQ09QRSk7XG4gICAgLy8gUVVFU1RJT04gMTogU2hvdWxkIHdlIGNyZWF0ZSBhbiBpc29sYXRlZCBzY29wZSBpZiB0aGUgc2NvcGUgaXMgb25seSB0cnVlP1xuICAgIC8vIFFVRVNUSU9OIDI6IFNob3VsZCB3ZSBtYWtlIHRoZSBzY29wZSBhY2Nlc3NpYmxlIHRocm91Z2ggYCRlbGVtZW50LnNjb3BlKCkvaXNvbGF0ZVNjb3BlKClgP1xuICAgIHRoaXMuJGNvbXBvbmVudFNjb3BlID0gJHBhcmVudFNjb3BlLiRuZXcoISF0aGlzLmRpcmVjdGl2ZS5zY29wZSk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVPdXRwdXRzKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBDb2xsZWN0IGNvbnRlbnRzLCBpbnNlcnQgYW5kIGNvbXBpbGUgdGVtcGxhdGVcbiAgICBjb25zdCBhdHRhY2hDaGlsZE5vZGVzOiBhbmd1bGFyLklMaW5rRm58dW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSgpO1xuXG4gICAgLy8gSW5zdGFudGlhdGUgY29udHJvbGxlclxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICBjb25zdCBiaW5kVG9Db250cm9sbGVyID0gdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlcjtcbiAgICBpZiAoY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLiRjb21wb25lbnRTY29wZSk7XG4gICAgfSBlbHNlIGlmIChiaW5kVG9Db250cm9sbGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHt0aGlzLmRpcmVjdGl2ZS5uYW1lfScgc3BlY2lmaWVzICdiaW5kVG9Db250cm9sbGVyJyBidXQgbm8gY29udHJvbGxlci5gKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgb3V0cHV0c1xuICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uID0gYmluZFRvQ29udHJvbGxlciA/IHRoaXMuY29udHJvbGxlckluc3RhbmNlIDogdGhpcy4kY29tcG9uZW50U2NvcGU7XG4gICAgdGhpcy5iaW5kT3V0cHV0cygpO1xuXG4gICAgLy8gUmVxdWlyZSBvdGhlciBjb250cm9sbGVyc1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPVxuICAgICAgICB0aGlzLmhlbHBlci5yZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnModGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuXG4gICAgLy8gSG9vazogJG9uQ2hhbmdlc1xuICAgIGlmICh0aGlzLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICB0aGlzLmZvcndhcmRDaGFuZ2VzKHRoaXMucGVuZGluZ0NoYW5nZXMpO1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJG9uSW5pdFxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJGRvQ2hlY2tcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaykpIHtcbiAgICAgIGNvbnN0IGNhbGxEb0NoZWNrID0gKCkgPT4gdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2sgISgpO1xuXG4gICAgICB0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlciA9IHRoaXMuJGNvbXBvbmVudFNjb3BlLiRwYXJlbnQuJHdhdGNoKGNhbGxEb0NoZWNrKTtcbiAgICAgIGNhbGxEb0NoZWNrKCk7XG4gICAgfVxuXG4gICAgLy8gTGlua2luZ1xuICAgIGNvbnN0IGxpbmsgPSB0aGlzLmRpcmVjdGl2ZS5saW5rO1xuICAgIGNvbnN0IHByZUxpbmsgPSAodHlwZW9mIGxpbmsgPT0gJ29iamVjdCcpICYmIChsaW5rIGFzIGFuZ3VsYXIuSURpcmVjdGl2ZVByZVBvc3QpLnByZTtcbiAgICBjb25zdCBwb3N0TGluayA9ICh0eXBlb2YgbGluayA9PSAnb2JqZWN0JykgPyAobGluayBhcyBhbmd1bGFyLklEaXJlY3RpdmVQcmVQb3N0KS5wb3N0IDogbGluaztcbiAgICBjb25zdCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBhbmd1bGFyLklUcmFuc2NsdWRlRnVuY3Rpb24gPSBOT1RfU1VQUE9SVEVEO1xuICAgIGlmIChwcmVMaW5rKSB7XG4gICAgICBwcmVMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy4kY29tcG9uZW50U2NvcGUsIG51bGwgISwge3BhcmVudEJvdW5kVHJhbnNjbHVkZUZuOiBhdHRhY2hDaGlsZE5vZGVzfSk7XG5cbiAgICBpZiAocG9zdExpbmspIHtcbiAgICAgIHBvc3RMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkcG9zdExpbmtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmspKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmsoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKCF0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbikge1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IGNoYW5nZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9yd2FyZENoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGNvbnN0IHR3b1dheUJvdW5kUHJvcGVydGllcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzO1xuICAgIGNvbnN0IHR3b1dheUJvdW5kTGFzdFZhbHVlcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRMYXN0VmFsdWVzO1xuICAgIGNvbnN0IHByb3BlcnR5VG9PdXRwdXRNYXAgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXA7XG5cbiAgICB0d29XYXlCb3VuZFByb3BlcnRpZXMuZm9yRWFjaCgocHJvcE5hbWUsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV07XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdO1xuXG4gICAgICBpZiAoIWxvb3NlSWRlbnRpY2FsKG5ld1ZhbHVlLCBvbGRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChuZXdWYWx1ZSk7XG4gICAgICAgIHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcikpIHtcbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyKCk7XG4gICAgfVxuICAgIHRoaXMuaGVscGVyLm9uRGVzdHJveSh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplQmluZGluZ3MoZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmUpIHtcbiAgICBjb25zdCBidGNJc09iamVjdCA9IHR5cGVvZiBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA9PT0gJ29iamVjdCc7XG4gICAgaWYgKGJ0Y0lzT2JqZWN0ICYmIE9iamVjdC5rZXlzKGRpcmVjdGl2ZS5zY29wZSAhKS5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQmluZGluZyBkZWZpbml0aW9ucyBvbiBzY29wZSBhbmQgY29udHJvbGxlciBhdCB0aGUgc2FtZSB0aW1lIGlzIG5vdCBzdXBwb3J0ZWQuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dCA9IChidGNJc09iamVjdCkgPyBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA6IGRpcmVjdGl2ZS5zY29wZTtcbiAgICBjb25zdCBiaW5kaW5ncyA9IG5ldyBCaW5kaW5ncygpO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgc3dpdGNoIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLiBUaGV5IHdpbGwgYmUgZGVmaW5lZCBhcyBpbnB1dHMgb24gdGhlXG4gICAgICAgICAgICAvLyB1cGdyYWRlZCBjb21wb25lbnQgZmFjYWRlIGFuZCB0aGUgY2hhbmdlIHByb3BhZ2F0aW9uIHdpbGwgYmUgaGFuZGxlZCBieVxuICAgICAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZExhc3RWYWx1ZXMucHVzaChJTklUSUFMX1ZBTFVFKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWUgKyAnQ2hhbmdlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke3RoaXMubmFtZX0nIGRpcmVjdGl2ZS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJpbmRpbmdzO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplT3V0cHV0cygpIHtcbiAgICAvLyBJbml0aWFsaXplIHRoZSBvdXRwdXRzIGZvciBgPWAgYW5kIGAmYCBiaW5kaW5nc1xuICAgIHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzLmNvbmNhdCh0aGlzLmJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMpXG4gICAgICAgIC5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBvdXRwdXROYW1lID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgICAgICAodGhpcyBhcyBhbnkpW291dHB1dE5hbWVdID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYmluZE91dHB1dHMoKSB7XG4gICAgLy8gQmluZCBgJmAgYmluZGluZ3MgdG8gdGhlIGNvcnJlc3BvbmRpbmcgb3V0cHV0c1xuICAgIHRoaXMuYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcy5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgZW1pdHRlciA9ICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV07XG5cbiAgICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXSA9ICh2YWx1ZTogYW55KSA9PiBlbWl0dGVyLmVtaXQodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3J3YXJkQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgLy8gRm9yd2FyZCBpbnB1dCBjaGFuZ2VzIHRvIGBiaW5kaW5nRGVzdGluYXRpb25gXG4gICAgT2JqZWN0LmtleXMoY2hhbmdlcykuZm9yRWFjaChcbiAgICAgICAgcHJvcE5hbWUgPT4gdGhpcy5iaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gY2hhbmdlc1twcm9wTmFtZV0uY3VycmVudFZhbHVlKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMpKSB7XG4gICAgICB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbi4kb25DaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxufVxuIl19