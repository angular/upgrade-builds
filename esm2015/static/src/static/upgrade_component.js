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
import { EventEmitter, ɵlooseIdentical as looseIdentical } from '@angular/core';
import { $SCOPE } from '../common/constants';
import { UpgradeHelper } from '../common/upgrade_helper';
import { isFunction } from '../common/util';
const /** @type {?} */ NOT_SUPPORTED = 'NOT_SUPPORTED';
const /** @type {?} */ INITIAL_VALUE = {
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
function Bindings_tsickle_Closure_declarations() {
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
        // We ask for the AngularJS scope from the Angular injector, since
        // we will put the new component scope onto the new injector for each component
        const /** @type {?} */ $parentScope = injector.get($SCOPE);
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
        const /** @type {?} */ attachChildNodes = this.helper.prepareTransclusion();
        const /** @type {?} */ linkFn = this.helper.compileTemplate();
        // Instantiate controller
        const /** @type {?} */ controllerType = this.directive.controller;
        const /** @type {?} */ bindToController = this.directive.bindToController;
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
        const /** @type {?} */ requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
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
            const /** @type {?} */ callDoCheck = () => /** @type {?} */ ((this.controllerInstance.$doCheck))();
            this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
            callDoCheck();
        }
        // Linking
        const /** @type {?} */ link = this.directive.link;
        const /** @type {?} */ preLink = (typeof link == 'object') && (/** @type {?} */ (link)).pre;
        const /** @type {?} */ postLink = (typeof link == 'object') ? (/** @type {?} */ (link)).post : link;
        const /** @type {?} */ attrs = NOT_SUPPORTED;
        const /** @type {?} */ transcludeFn = NOT_SUPPORTED;
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
        const /** @type {?} */ twoWayBoundProperties = this.bindings.twoWayBoundProperties;
        const /** @type {?} */ twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
        const /** @type {?} */ propertyToOutputMap = this.bindings.propertyToOutputMap;
        twoWayBoundProperties.forEach((propName, idx) => {
            const /** @type {?} */ newValue = this.bindingDestination[propName];
            const /** @type {?} */ oldValue = twoWayBoundLastValues[idx];
            if (!looseIdentical(newValue, oldValue)) {
                const /** @type {?} */ outputName = propertyToOutputMap[propName];
                const /** @type {?} */ eventEmitter = (/** @type {?} */ (this))[outputName];
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
        if (this.controllerInstance && isFunction(this.controllerInstance.$onDestroy)) {
            this.controllerInstance.$onDestroy();
        }
        this.$componentScope.$destroy();
    }
    /**
     * @param {?} directive
     * @return {?}
     */
    initializeBindings(directive) {
        const /** @type {?} */ btcIsObject = typeof directive.bindToController === 'object';
        if (btcIsObject && Object.keys(/** @type {?} */ ((directive.scope))).length) {
            throw new Error(`Binding definitions on scope and controller at the same time is not supported.`);
        }
        const /** @type {?} */ context = (btcIsObject) ? directive.bindToController : directive.scope;
        const /** @type {?} */ bindings = new Bindings();
        if (typeof context == 'object') {
            Object.keys(context).forEach(propName => {
                const /** @type {?} */ definition = context[propName];
                const /** @type {?} */ bindingType = definition.charAt(0);
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
                        let /** @type {?} */ json = JSON.stringify(context);
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
            const /** @type {?} */ outputName = this.bindings.propertyToOutputMap[propName];
            (/** @type {?} */ (this))[outputName] = new EventEmitter();
        });
    }
    /**
     * @return {?}
     */
    bindOutputs() {
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach(propName => {
            const /** @type {?} */ outputName = this.bindings.propertyToOutputMap[propName];
            const /** @type {?} */ emitter = (/** @type {?} */ (this))[outputName];
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
function UpgradeComponent_tsickle_Closure_declarations() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvc3RhdGljL3VwZ3JhZGVfY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFzQixZQUFZLEVBQXlELGVBQWUsSUFBSSxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFMUosT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBMkMsYUFBYSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakcsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTFDLHVCQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFDM0MsdUJBQU0sYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUVGOztxQ0FDb0MsRUFBRTtxQ0FDTCxFQUFFO3lDQUVLLEVBQUU7bUNBRVksRUFBRTs7Q0FDdkQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3Q0QsTUFBTTs7Ozs7Ozs7Ozs7Ozs7O0lBZ0NKLFlBQW9CLElBQVksRUFBVSxVQUFzQixFQUFVLFFBQWtCO1FBQXhFLFNBQUksR0FBSixJQUFJLENBQVE7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUMxRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFNUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUV2QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFD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LENBQUM7WUFFMUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3pFLENBQUMsQ0FBQzs7Ozs7O0lBR0csY0FBYyxDQUFDLE9BQXNCOztRQUUzQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FDeEIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXBGLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDN0M7O0NBRUoiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RG9DaGVjaywgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3RvciwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgU2ltcGxlQ2hhbmdlcywgybVsb29zZUlkZW50aWNhbCBhcyBsb29zZUlkZW50aWNhbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge0lCaW5kaW5nRGVzdGluYXRpb24sIElDb250cm9sbGVySW5zdGFuY2UsIFVwZ3JhZGVIZWxwZXJ9IGZyb20gJy4uL2NvbW1vbi91cGdyYWRlX2hlbHBlcic7XG5pbXBvcnQge2lzRnVuY3Rpb259IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmNsYXNzIEJpbmRpbmdzIHtcbiAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICB0d29XYXlCb3VuZExhc3RWYWx1ZXM6IGFueVtdID0gW107XG5cbiAgZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblxuICBwcm9wZXJ0eVRvT3V0cHV0TWFwOiB7W3Byb3BOYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgY2xhc3MgdGhhdCBhbGxvd3MgYW4gQW5ndWxhckpTIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhci5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGlzIGhlbHBlciBjbGFzcyBzaG91bGQgYmUgdXNlZCBhcyBhIGJhc2UgY2xhc3MgZm9yIGNyZWF0aW5nIEFuZ3VsYXIgZGlyZWN0aXZlc1xuICogdGhhdCB3cmFwIEFuZ3VsYXJKUyBjb21wb25lbnRzIHRoYXQgbmVlZCB0byBiZSBcInVwZ3JhZGVkXCIuXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogTGV0J3MgYXNzdW1lIHRoYXQgeW91IGhhdmUgYW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYWxsZWQgYG5nMUhlcm9gIHRoYXQgbmVlZHNcbiAqIHRvIGJlIG1hZGUgYXZhaWxhYmxlIGluIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyb1wifVxuICpcbiAqIFdlIG11c3QgY3JlYXRlIGEgYERpcmVjdGl2ZWAgdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFySlMgY29tcG9uZW50XG4gKiBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyby13cmFwcGVyXCJ9XG4gKlxuICogSW4gdGhpcyBleGFtcGxlIHlvdSBjYW4gc2VlIHRoYXQgd2UgbXVzdCBkZXJpdmUgZnJvbSB0aGUgYFVwZ3JhZGVDb21wb25lbnRgXG4gKiBiYXNlIGNsYXNzIGJ1dCBhbHNvIHByb3ZpZGUgYW4ge0BsaW5rIERpcmVjdGl2ZSBgQERpcmVjdGl2ZWB9IGRlY29yYXRvci4gVGhpcyBpc1xuICogYmVjYXVzZSB0aGUgQW9UIGNvbXBpbGVyIHJlcXVpcmVzIHRoYXQgdGhpcyBpbmZvcm1hdGlvbiBpcyBzdGF0aWNhbGx5IGF2YWlsYWJsZSBhdFxuICogY29tcGlsZSB0aW1lLlxuICpcbiAqIE5vdGUgdGhhdCB3ZSBtdXN0IGRvIHRoZSBmb2xsb3dpbmc6XG4gKiAqIHNwZWNpZnkgdGhlIGRpcmVjdGl2ZSdzIHNlbGVjdG9yIChgbmcxLWhlcm9gKVxuICogKiBzcGVjaWZ5IGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgdGhhdCB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBleHBlY3RzXG4gKiAqIGRlcml2ZSBmcm9tIGBVcGdyYWRlQ29tcG9uZW50YFxuICogKiBjYWxsIHRoZSBiYXNlIGNsYXNzIGZyb20gdGhlIGNvbnN0cnVjdG9yLCBwYXNzaW5nXG4gKiAgICogdGhlIEFuZ3VsYXJKUyBuYW1lIG9mIHRoZSBjb21wb25lbnQgKGBuZzFIZXJvYClcbiAqICAgKiB0aGUgYEVsZW1lbnRSZWZgIGFuZCBgSW5qZWN0b3JgIGZvciB0aGUgY29tcG9uZW50IHdyYXBwZXJcbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgaGVscGVyOiBVcGdyYWRlSGVscGVyO1xuXG4gIHByaXZhdGUgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2U7XG5cbiAgcHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50O1xuICBwcml2YXRlICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XG4gIHByaXZhdGUgJGNvbXBvbmVudFNjb3BlOiBhbmd1bGFyLklTY29wZTtcblxuICBwcml2YXRlIGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlO1xuICBwcml2YXRlIGJpbmRpbmdzOiBCaW5kaW5ncztcblxuICBwcml2YXRlIGNvbnRyb2xsZXJJbnN0YW5jZTogSUNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgcHJpdmF0ZSBiaW5kaW5nRGVzdGluYXRpb246IElCaW5kaW5nRGVzdGluYXRpb247XG5cbiAgLy8gV2Ugd2lsbCBiZSBpbnN0YW50aWF0aW5nIHRoZSBjb250cm9sbGVyIGluIHRoZSBgbmdPbkluaXRgIGhvb2ssIHdoZW4gdGhlIGZpcnN0IGBuZ09uQ2hhbmdlc2BcbiAgLy8gd2lsbCBoYXZlIGJlZW4gYWxyZWFkeSB0cmlnZ2VyZWQuIFdlIHN0b3JlIHRoZSBgU2ltcGxlQ2hhbmdlc2AgYW5kIFwicGxheSB0aGVtIGJhY2tcIiBsYXRlci5cbiAgcHJpdmF0ZSBwZW5kaW5nQ2hhbmdlczogU2ltcGxlQ2hhbmdlc3xudWxsO1xuXG4gIHByaXZhdGUgdW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyOiBGdW5jdGlvbjtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBVcGdyYWRlQ29tcG9uZW50YCBpbnN0YW5jZS4gWW91IHNob3VsZCBub3Qgbm9ybWFsbHkgbmVlZCB0byBkbyB0aGlzLlxuICAgKiBJbnN0ZWFkIHlvdSBzaG91bGQgZGVyaXZlIGEgbmV3IGNsYXNzIGZyb20gdGhpcyBvbmUgYW5kIGNhbGwgdGhlIHN1cGVyIGNvbnN0cnVjdG9yXG4gICAqIGZyb20gdGhlIGJhc2UgY2xhc3MuXG4gICAqXG4gICAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyby13cmFwcGVyXCIgfVxuICAgKlxuICAgKiAqIFRoZSBgbmFtZWAgcGFyYW1ldGVyIHNob3VsZCBiZSB0aGUgbmFtZSBvZiB0aGUgQW5ndWxhckpTIGRpcmVjdGl2ZS5cbiAgICogKiBUaGUgYGVsZW1lbnRSZWZgIGFuZCBgaW5qZWN0b3JgIHBhcmFtZXRlcnMgc2hvdWxkIGJlIGFjcXVpcmVkIGZyb20gQW5ndWxhciBieSBkZXBlbmRlbmN5XG4gICAqICAgaW5qZWN0aW9uIGludG8gdGhlIGJhc2UgY2xhc3MgY29uc3RydWN0b3IuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5hbWU6IHN0cmluZywgcHJpdmF0ZSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMuaGVscGVyID0gbmV3IFVwZ3JhZGVIZWxwZXIoaW5qZWN0b3IsIG5hbWUsIGVsZW1lbnRSZWYpO1xuXG4gICAgdGhpcy4kaW5qZWN0b3IgPSB0aGlzLmhlbHBlci4kaW5qZWN0b3I7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLmhlbHBlci5lbGVtZW50O1xuICAgIHRoaXMuJGVsZW1lbnQgPSB0aGlzLmhlbHBlci4kZWxlbWVudDtcblxuICAgIHRoaXMuZGlyZWN0aXZlID0gdGhpcy5oZWxwZXIuZGlyZWN0aXZlO1xuICAgIHRoaXMuYmluZGluZ3MgPSB0aGlzLmluaXRpYWxpemVCaW5kaW5ncyh0aGlzLmRpcmVjdGl2ZSk7XG5cbiAgICAvLyBXZSBhc2sgZm9yIHRoZSBBbmd1bGFySlMgc2NvcGUgZnJvbSB0aGUgQW5ndWxhciBpbmplY3Rvciwgc2luY2VcbiAgICAvLyB3ZSB3aWxsIHB1dCB0aGUgbmV3IGNvbXBvbmVudCBzY29wZSBvbnRvIHRoZSBuZXcgaW5qZWN0b3IgZm9yIGVhY2ggY29tcG9uZW50XG4gICAgY29uc3QgJHBhcmVudFNjb3BlID0gaW5qZWN0b3IuZ2V0KCRTQ09QRSk7XG4gICAgLy8gUVVFU1RJT04gMTogU2hvdWxkIHdlIGNyZWF0ZSBhbiBpc29sYXRlZCBzY29wZSBpZiB0aGUgc2NvcGUgaXMgb25seSB0cnVlP1xuICAgIC8vIFFVRVNUSU9OIDI6IFNob3VsZCB3ZSBtYWtlIHRoZSBzY29wZSBhY2Nlc3NpYmxlIHRocm91Z2ggYCRlbGVtZW50LnNjb3BlKCkvaXNvbGF0ZVNjb3BlKClgP1xuICAgIHRoaXMuJGNvbXBvbmVudFNjb3BlID0gJHBhcmVudFNjb3BlLiRuZXcoISF0aGlzLmRpcmVjdGl2ZS5zY29wZSk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVPdXRwdXRzKCk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBDb2xsZWN0IGNvbnRlbnRzLCBpbnNlcnQgYW5kIGNvbXBpbGUgdGVtcGxhdGVcbiAgICBjb25zdCBhdHRhY2hDaGlsZE5vZGVzOiBhbmd1bGFyLklMaW5rRm58dW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSgpO1xuXG4gICAgLy8gSW5zdGFudGlhdGUgY29udHJvbGxlclxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICBjb25zdCBiaW5kVG9Db250cm9sbGVyID0gdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlcjtcbiAgICBpZiAoY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLiRjb21wb25lbnRTY29wZSk7XG4gICAgfSBlbHNlIGlmIChiaW5kVG9Db250cm9sbGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHt0aGlzLmRpcmVjdGl2ZS5uYW1lfScgc3BlY2lmaWVzICdiaW5kVG9Db250cm9sbGVyJyBidXQgbm8gY29udHJvbGxlci5gKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgb3V0cHV0c1xuICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uID0gYmluZFRvQ29udHJvbGxlciA/IHRoaXMuY29udHJvbGxlckluc3RhbmNlIDogdGhpcy4kY29tcG9uZW50U2NvcGU7XG4gICAgdGhpcy5iaW5kT3V0cHV0cygpO1xuXG4gICAgLy8gUmVxdWlyZSBvdGhlciBjb250cm9sbGVyc1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPVxuICAgICAgICB0aGlzLmhlbHBlci5yZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnModGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuXG4gICAgLy8gSG9vazogJG9uQ2hhbmdlc1xuICAgIGlmICh0aGlzLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICB0aGlzLmZvcndhcmRDaGFuZ2VzKHRoaXMucGVuZGluZ0NoYW5nZXMpO1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJG9uSW5pdFxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJGRvQ2hlY2tcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaykpIHtcbiAgICAgIGNvbnN0IGNhbGxEb0NoZWNrID0gKCkgPT4gdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2sgISgpO1xuXG4gICAgICB0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlciA9IHRoaXMuJGNvbXBvbmVudFNjb3BlLiRwYXJlbnQuJHdhdGNoKGNhbGxEb0NoZWNrKTtcbiAgICAgIGNhbGxEb0NoZWNrKCk7XG4gICAgfVxuXG4gICAgLy8gTGlua2luZ1xuICAgIGNvbnN0IGxpbmsgPSB0aGlzLmRpcmVjdGl2ZS5saW5rO1xuICAgIGNvbnN0IHByZUxpbmsgPSAodHlwZW9mIGxpbmsgPT0gJ29iamVjdCcpICYmIChsaW5rIGFzIGFuZ3VsYXIuSURpcmVjdGl2ZVByZVBvc3QpLnByZTtcbiAgICBjb25zdCBwb3N0TGluayA9ICh0eXBlb2YgbGluayA9PSAnb2JqZWN0JykgPyAobGluayBhcyBhbmd1bGFyLklEaXJlY3RpdmVQcmVQb3N0KS5wb3N0IDogbGluaztcbiAgICBjb25zdCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBhbmd1bGFyLklUcmFuc2NsdWRlRnVuY3Rpb24gPSBOT1RfU1VQUE9SVEVEO1xuICAgIGlmIChwcmVMaW5rKSB7XG4gICAgICBwcmVMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy4kY29tcG9uZW50U2NvcGUsIG51bGwgISwge3BhcmVudEJvdW5kVHJhbnNjbHVkZUZuOiBhdHRhY2hDaGlsZE5vZGVzfSk7XG5cbiAgICBpZiAocG9zdExpbmspIHtcbiAgICAgIHBvc3RMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkcG9zdExpbmtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmspKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmsoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKCF0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbikge1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IGNoYW5nZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9yd2FyZENoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGNvbnN0IHR3b1dheUJvdW5kUHJvcGVydGllcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzO1xuICAgIGNvbnN0IHR3b1dheUJvdW5kTGFzdFZhbHVlcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRMYXN0VmFsdWVzO1xuICAgIGNvbnN0IHByb3BlcnR5VG9PdXRwdXRNYXAgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXA7XG5cbiAgICB0d29XYXlCb3VuZFByb3BlcnRpZXMuZm9yRWFjaCgocHJvcE5hbWUsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV07XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdO1xuXG4gICAgICBpZiAoIWxvb3NlSWRlbnRpY2FsKG5ld1ZhbHVlLCBvbGRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChuZXdWYWx1ZSk7XG4gICAgICAgIHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcikpIHtcbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkRlc3Ryb3kpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25EZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMuJGNvbXBvbmVudFNjb3BlLiRkZXN0cm95KCk7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemVCaW5kaW5ncyhkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZSkge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIGRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXMoZGlyZWN0aXZlLnNjb3BlICEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gKGJ0Y0lzT2JqZWN0KSA/IGRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyIDogZGlyZWN0aXZlLnNjb3BlO1xuICAgIGNvbnN0IGJpbmRpbmdzID0gbmV3IEJpbmRpbmdzKCk7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHQgPT0gJ29iamVjdCcpIHtcbiAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQpLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gY29udGV4dFtwcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gZGVmaW5pdGlvbi5jaGFyQXQoMCk7XG5cbiAgICAgICAgLy8gUVVFU1RJT046IFdoYXQgYWJvdXQgYD0qYD8gSWdub3JlPyBUaHJvdz8gU3VwcG9ydD9cblxuICAgICAgICBzd2l0Y2ggKGJpbmRpbmdUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIHNwZWNpYWwuIFRoZXkgd2lsbCBiZSBkZWZpbmVkIGFzIGlucHV0cyBvbiB0aGVcbiAgICAgICAgICAgIC8vIHVwZ3JhZGVkIGNvbXBvbmVudCBmYWNhZGUgYW5kIHRoZSBjaGFuZ2UgcHJvcGFnYXRpb24gd2lsbCBiZSBoYW5kbGVkIGJ5XG4gICAgICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIGJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnR3b1dheUJvdW5kTGFzdFZhbHVlcy5wdXNoKElOSVRJQUxfVkFMVUUpO1xuICAgICAgICAgICAgYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV0gPSBwcm9wTmFtZSArICdDaGFuZ2UnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICBiaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgICAgYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZXQganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIG1hcHBpbmcgJyR7YmluZGluZ1R5cGV9JyBpbiAnJHtqc29ufScgaW4gJyR7dGhpcy5uYW1lfScgZGlyZWN0aXZlLmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmluZGluZ3M7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemVPdXRwdXRzKCkge1xuICAgIC8vIEluaXRpYWxpemUgdGhlIG91dHB1dHMgZm9yIGA9YCBhbmQgYCZgIGJpbmRpbmdzXG4gICAgdGhpcy5iaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXMuY29uY2F0KHRoaXMuYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcylcbiAgICAgICAgLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgICAgICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV0gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBiaW5kT3V0cHV0cygpIHtcbiAgICAvLyBCaW5kIGAmYCBiaW5kaW5ncyB0byB0aGUgY29ycmVzcG9uZGluZyBvdXRwdXRzXG4gICAgdGhpcy5iaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICBjb25zdCBlbWl0dGVyID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgdGhpcy5iaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gKHZhbHVlOiBhbnkpID0+IGVtaXR0ZXIuZW1pdCh2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGZvcndhcmRDaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAvLyBGb3J3YXJkIGlucHV0IGNoYW5nZXMgdG8gYGJpbmRpbmdEZXN0aW5hdGlvbmBcbiAgICBPYmplY3Qua2V5cyhjaGFuZ2VzKS5mb3JFYWNoKFxuICAgICAgICBwcm9wTmFtZSA9PiB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV0gPSBjaGFuZ2VzW3Byb3BOYW1lXS5jdXJyZW50VmFsdWUpO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24odGhpcy5iaW5kaW5nRGVzdGluYXRpb24uJG9uQ2hhbmdlcykpIHtcbiAgICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG59XG4iXX0=