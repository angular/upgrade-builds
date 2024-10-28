/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Directive, ElementRef, EventEmitter, Injector, } from '@angular/core';
import { ɵconstants, ɵupgradeHelper, ɵutil } from '../common';
import * as i0 from "@angular/core";
const NOT_SUPPORTED = 'NOT_SUPPORTED';
const INITIAL_VALUE = {
    __UNINITIALIZED__: true,
};
class Bindings {
    constructor() {
        this.twoWayBoundProperties = [];
        this.twoWayBoundLastValues = [];
        this.expressionBoundProperties = [];
        this.propertyToOutputMap = {};
    }
}
/**
 * @description
 *
 * A helper class that allows an AngularJS component to be used from Angular.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation.*
 *
 * This helper class should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
 * @usageNotes
 * ### Examples
 *
 * Let's assume that you have an AngularJS component called `ng1Hero` that needs
 * to be made available in Angular templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-hero"}
 *
 * We must create a `Directive` that will make this AngularJS component
 * available inside Angular templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper"}
 *
 * In this example you can see that we must derive from the `UpgradeComponent`
 * base class but also provide an {@link Directive `@Directive`} decorator. This is
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
 * @publicApi
 * @extensible
 */
export class UpgradeComponent {
    /**
     * Create a new `UpgradeComponent` instance. You should not normally need to do this.
     * Instead you should derive a new class from this one and call the super constructor
     * from the base class.
     *
     * {@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper" }
     *
     * * The `name` parameter should be the name of the AngularJS directive.
     * * The `elementRef` and `injector` parameters should be acquired from Angular by dependency
     *   injection into the base class constructor.
     */
    constructor(name, elementRef, injector) {
        // We will be instantiating the controller in the `ngOnInit` hook, when the
        // first `ngOnChanges` will have been already triggered. We store the
        // `SimpleChanges` and "play them back" later.
        this.pendingChanges = null;
        this.helper = new ɵupgradeHelper.UpgradeHelper(injector, name, elementRef);
        this.$element = this.helper.$element;
        this.directive = this.helper.directive;
        this.bindings = this.initializeBindings(this.directive, name);
        // We ask for the AngularJS scope from the Angular injector, since
        // we will put the new component scope onto the new injector for each component
        const $parentScope = injector.get(ɵconstants.$SCOPE);
        // QUESTION 1: Should we create an isolated scope if the scope is only true?
        // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
        this.$componentScope = $parentScope.$new(!!this.directive.scope);
        this.initializeOutputs();
    }
    /** @nodoc */
    ngOnInit() {
        // Collect contents, insert and compile template
        const attachChildNodes = this.helper.prepareTransclusion();
        const linkFn = this.helper.compileTemplate();
        // Instantiate controller
        const controllerType = this.directive.controller;
        const bindToController = this.directive.bindToController;
        let controllerInstance = controllerType
            ? this.helper.buildController(controllerType, this.$componentScope)
            : undefined;
        let bindingDestination;
        if (!bindToController) {
            bindingDestination = this.$componentScope;
        }
        else if (controllerType && controllerInstance) {
            bindingDestination = controllerInstance;
        }
        else {
            throw new Error(`Upgraded directive '${this.directive.name}' specifies 'bindToController' but no controller.`);
        }
        this.controllerInstance = controllerInstance;
        this.bindingDestination = bindingDestination;
        // Set up outputs
        this.bindOutputs(bindingDestination);
        // Require other controllers
        const requiredControllers = this.helper.resolveAndBindRequiredControllers(controllerInstance);
        // Hook: $onChanges
        if (this.pendingChanges) {
            this.forwardChanges(this.pendingChanges, bindingDestination);
            this.pendingChanges = null;
        }
        // Hook: $onInit
        if (this.controllerInstance && ɵutil.isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        // Hook: $doCheck
        if (controllerInstance && ɵutil.isFunction(controllerInstance.$doCheck)) {
            const callDoCheck = () => controllerInstance?.$doCheck?.();
            this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
            callDoCheck();
        }
        // Linking
        const link = this.directive.link;
        const preLink = typeof link == 'object' && link.pre;
        const postLink = typeof link == 'object' ? link.post : link;
        const attrs = NOT_SUPPORTED;
        const transcludeFn = NOT_SUPPORTED;
        if (preLink) {
            preLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        linkFn(this.$componentScope, null, { parentBoundTranscludeFn: attachChildNodes });
        if (postLink) {
            postLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        // Hook: $postLink
        if (this.controllerInstance && ɵutil.isFunction(this.controllerInstance.$postLink)) {
            this.controllerInstance.$postLink();
        }
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if (!this.bindingDestination) {
            this.pendingChanges = changes;
        }
        else {
            this.forwardChanges(changes, this.bindingDestination);
        }
    }
    /** @nodoc */
    ngDoCheck() {
        const twoWayBoundProperties = this.bindings.twoWayBoundProperties;
        const twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
        const propertyToOutputMap = this.bindings.propertyToOutputMap;
        twoWayBoundProperties.forEach((propName, idx) => {
            const newValue = this.bindingDestination?.[propName];
            const oldValue = twoWayBoundLastValues[idx];
            if (!Object.is(newValue, oldValue)) {
                const outputName = propertyToOutputMap[propName];
                const eventEmitter = this[outputName];
                eventEmitter.emit(newValue);
                twoWayBoundLastValues[idx] = newValue;
            }
        });
    }
    /** @nodoc */
    ngOnDestroy() {
        if (ɵutil.isFunction(this.unregisterDoCheckWatcher)) {
            this.unregisterDoCheckWatcher();
        }
        this.helper.onDestroy(this.$componentScope, this.controllerInstance);
    }
    initializeBindings(directive, name) {
        const btcIsObject = typeof directive.bindToController === 'object';
        if (btcIsObject && Object.keys(directive.scope).length) {
            throw new Error(`Binding definitions on scope and controller at the same time is not supported.`);
        }
        const context = btcIsObject ? directive.bindToController : directive.scope;
        const bindings = new Bindings();
        if (typeof context == 'object') {
            Object.keys(context).forEach((propName) => {
                const definition = context[propName];
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
                        let json = JSON.stringify(context);
                        throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${name}' directive.`);
                }
            });
        }
        return bindings;
    }
    initializeOutputs() {
        // Initialize the outputs for `=` and `&` bindings
        this.bindings.twoWayBoundProperties
            .concat(this.bindings.expressionBoundProperties)
            .forEach((propName) => {
            const outputName = this.bindings.propertyToOutputMap[propName];
            this[outputName] = new EventEmitter();
        });
    }
    bindOutputs(bindingDestination) {
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach((propName) => {
            const outputName = this.bindings.propertyToOutputMap[propName];
            const emitter = this[outputName];
            bindingDestination[propName] = (value) => emitter.emit(value);
        });
    }
    forwardChanges(changes, bindingDestination) {
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach((propName) => (bindingDestination[propName] = changes[propName].currentValue));
        if (ɵutil.isFunction(bindingDestination.$onChanges)) {
            bindingDestination.$onChanges(changes);
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.9+sha-ddda355", ngImport: i0, type: UpgradeComponent, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.9+sha-ddda355", type: UpgradeComponent, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.9+sha-ddda355", ngImport: i0, type: UpgradeComponent, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: undefined }, { type: i0.ElementRef }, { type: i0.Injector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFFVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFFBQVEsR0FLVCxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQVksVUFBVSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUMsTUFBTSxXQUFXLENBQUM7O0FBRXZFLE1BQU0sYUFBYSxHQUFRLGVBQWUsQ0FBQztBQUMzQyxNQUFNLGFBQWEsR0FBRztJQUNwQixpQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFFRixNQUFNLFFBQVE7SUFBZDtRQUNFLDBCQUFxQixHQUFhLEVBQUUsQ0FBQztRQUNyQywwQkFBcUIsR0FBVSxFQUFFLENBQUM7UUFFbEMsOEJBQXlCLEdBQWEsRUFBRSxDQUFDO1FBRXpDLHdCQUFtQixHQUFpQyxFQUFFLENBQUM7SUFDekQsQ0FBQztDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVDRztBQUVILE1BQU0sT0FBTyxnQkFBZ0I7SUFtQjNCOzs7Ozs7Ozs7O09BVUc7SUFDSCxZQUFZLElBQVksRUFBRSxVQUFzQixFQUFFLFFBQWtCO1FBbEJwRSwyRUFBMkU7UUFDM0UscUVBQXFFO1FBQ3JFLDhDQUE4QztRQUN0QyxtQkFBYyxHQUF5QixJQUFJLENBQUM7UUFnQmxELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFM0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUVyQyxJQUFJLENB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R0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sT0FBTyxHQUF1QixJQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFN0Qsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sY0FBYyxDQUNwQixPQUFzQixFQUN0QixrQkFBc0Q7UUFFdEQsZ0RBQWdEO1FBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUMxQixDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQzlFLENBQUM7UUFFRixJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUNwRCxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsQ0FBQztJQUNILENBQUM7eUhBNU9VLGdCQUFnQjs2R0FBaEIsZ0JBQWdCOztzR0FBaEIsZ0JBQWdCO2tCQUQ1QixTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIERvQ2hlY2ssXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0b3IsXG4gIE9uQ2hhbmdlcyxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIFNpbXBsZUNoYW5nZXMsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge8m1YW5ndWxhcjEsIMm1Y29uc3RhbnRzLCDJtXVwZ3JhZGVIZWxwZXIsIMm1dXRpbH0gZnJvbSAnLi4vY29tbW9uJztcblxuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWUsXG59O1xuXG5jbGFzcyBCaW5kaW5ncyB7XG4gIHR3b1dheUJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgdHdvV2F5Qm91bmRMYXN0VmFsdWVzOiBhbnlbXSA9IFtdO1xuXG4gIGV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cbiAgcHJvcGVydHlUb091dHB1dE1hcDoge1twcm9wTmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGNsYXNzIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXIuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBT1QgY29tcGlsYXRpb24uKlxuICpcbiAqIFRoaXMgaGVscGVyIGNsYXNzIHNob3VsZCBiZSB1c2VkIGFzIGEgYmFzZSBjbGFzcyBmb3IgY3JlYXRpbmcgQW5ndWxhciBkaXJlY3RpdmVzXG4gKiB0aGF0IHdyYXAgQW5ndWxhckpTIGNvbXBvbmVudHMgdGhhdCBuZWVkIHRvIGJlIFwidXBncmFkZWRcIi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogTGV0J3MgYXNzdW1lIHRoYXQgeW91IGhhdmUgYW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYWxsZWQgYG5nMUhlcm9gIHRoYXQgbmVlZHNcbiAqIHRvIGJlIG1hZGUgYXZhaWxhYmxlIGluIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyb1wifVxuICpcbiAqIFdlIG11c3QgY3JlYXRlIGEgYERpcmVjdGl2ZWAgdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFySlMgY29tcG9uZW50XG4gKiBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyby13cmFwcGVyXCJ9XG4gKlxuICogSW4gdGhpcyBleGFtcGxlIHlvdSBjYW4gc2VlIHRoYXQgd2UgbXVzdCBkZXJpdmUgZnJvbSB0aGUgYFVwZ3JhZGVDb21wb25lbnRgXG4gKiBiYXNlIGNsYXNzIGJ1dCBhbHNvIHByb3ZpZGUgYW4ge0BsaW5rIERpcmVjdGl2ZSBgQERpcmVjdGl2ZWB9IGRlY29yYXRvci4gVGhpcyBpc1xuICogYmVjYXVzZSB0aGUgQU9UIGNvbXBpbGVyIHJlcXVpcmVzIHRoYXQgdGhpcyBpbmZvcm1hdGlvbiBpcyBzdGF0aWNhbGx5IGF2YWlsYWJsZSBhdFxuICogY29tcGlsZSB0aW1lLlxuICpcbiAqIE5vdGUgdGhhdCB3ZSBtdXN0IGRvIHRoZSBmb2xsb3dpbmc6XG4gKiAqIHNwZWNpZnkgdGhlIGRpcmVjdGl2ZSdzIHNlbGVjdG9yIChgbmcxLWhlcm9gKVxuICogKiBzcGVjaWZ5IGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgdGhhdCB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBleHBlY3RzXG4gKiAqIGRlcml2ZSBmcm9tIGBVcGdyYWRlQ29tcG9uZW50YFxuICogKiBjYWxsIHRoZSBiYXNlIGNsYXNzIGZyb20gdGhlIGNvbnN0cnVjdG9yLCBwYXNzaW5nXG4gKiAgICogdGhlIEFuZ3VsYXJKUyBuYW1lIG9mIHRoZSBjb21wb25lbnQgKGBuZzFIZXJvYClcbiAqICAgKiB0aGUgYEVsZW1lbnRSZWZgIGFuZCBgSW5qZWN0b3JgIGZvciB0aGUgY29tcG9uZW50IHdyYXBwZXJcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZXh0ZW5zaWJsZVxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBjbGFzcyBVcGdyYWRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgaGVscGVyOiDJtXVwZ3JhZGVIZWxwZXIuVXBncmFkZUhlbHBlcjtcblxuICBwcml2YXRlICRlbGVtZW50OiDJtWFuZ3VsYXIxLklBdWdtZW50ZWRKUXVlcnk7XG4gIHByaXZhdGUgJGNvbXBvbmVudFNjb3BlOiDJtWFuZ3VsYXIxLklTY29wZTtcblxuICBwcml2YXRlIGRpcmVjdGl2ZTogybVhbmd1bGFyMS5JRGlyZWN0aXZlO1xuICBwcml2YXRlIGJpbmRpbmdzOiBCaW5kaW5ncztcblxuICBwcml2YXRlIGNvbnRyb2xsZXJJbnN0YW5jZT86IMm1dXBncmFkZUhlbHBlci5JQ29udHJvbGxlckluc3RhbmNlO1xuICBwcml2YXRlIGJpbmRpbmdEZXN0aW5hdGlvbj86IMm1dXBncmFkZUhlbHBlci5JQmluZGluZ0Rlc3RpbmF0aW9uO1xuXG4gIC8vIFdlIHdpbGwgYmUgaW5zdGFudGlhdGluZyB0aGUgY29udHJvbGxlciBpbiB0aGUgYG5nT25Jbml0YCBob29rLCB3aGVuIHRoZVxuICAvLyBmaXJzdCBgbmdPbkNoYW5nZXNgIHdpbGwgaGF2ZSBiZWVuIGFscmVhZHkgdHJpZ2dlcmVkLiBXZSBzdG9yZSB0aGVcbiAgLy8gYFNpbXBsZUNoYW5nZXNgIGFuZCBcInBsYXkgdGhlbSBiYWNrXCIgbGF0ZXIuXG4gIHByaXZhdGUgcGVuZGluZ0NoYW5nZXM6IFNpbXBsZUNoYW5nZXMgfCBudWxsID0gbnVsbDtcblxuICBwcml2YXRlIHVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcj86IEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFVwZ3JhZGVDb21wb25lbnRgIGluc3RhbmNlLiBZb3Ugc2hvdWxkIG5vdCBub3JtYWxseSBuZWVkIHRvIGRvIHRoaXMuXG4gICAqIEluc3RlYWQgeW91IHNob3VsZCBkZXJpdmUgYSBuZXcgY2xhc3MgZnJvbSB0aGlzIG9uZSBhbmQgY2FsbCB0aGUgc3VwZXIgY29uc3RydWN0b3JcbiAgICogZnJvbSB0aGUgYmFzZSBjbGFzcy5cbiAgICpcbiAgICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIiB9XG4gICAqXG4gICAqICogVGhlIGBuYW1lYCBwYXJhbWV0ZXIgc2hvdWxkIGJlIHRoZSBuYW1lIG9mIHRoZSBBbmd1bGFySlMgZGlyZWN0aXZlLlxuICAgKiAqIFRoZSBgZWxlbWVudFJlZmAgYW5kIGBpbmplY3RvcmAgcGFyYW1ldGVycyBzaG91bGQgYmUgYWNxdWlyZWQgZnJvbSBBbmd1bGFyIGJ5IGRlcGVuZGVuY3lcbiAgICogICBpbmplY3Rpb24gaW50byB0aGUgYmFzZSBjbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5oZWxwZXIgPSBuZXcgybV1cGdyYWRlSGVscGVyLlVwZ3JhZGVIZWxwZXIoaW5qZWN0b3IsIG5hbWUsIGVsZW1lbnRSZWYpO1xuXG4gICAgdGhpcy4kZWxlbWVudCA9IHRoaXMuaGVscGVyLiRlbGVtZW50O1xuXG4gICAgdGhpcy5kaXJlY3RpdmUgPSB0aGlzLmhlbHBlci5kaXJlY3RpdmU7XG4gICAgdGhpcy5iaW5kaW5ncyA9IHRoaXMuaW5pdGlhbGl6ZUJpbmRpbmdzKHRoaXMuZGlyZWN0aXZlLCBuYW1lKTtcblxuICAgIC8vIFdlIGFzayBmb3IgdGhlIEFuZ3VsYXJKUyBzY29wZSBmcm9tIHRoZSBBbmd1bGFyIGluamVjdG9yLCBzaW5jZVxuICAgIC8vIHdlIHdpbGwgcHV0IHRoZSBuZXcgY29tcG9uZW50IHNjb3BlIG9udG8gdGhlIG5ldyBpbmplY3RvciBmb3IgZWFjaCBjb21wb25lbnRcbiAgICBjb25zdCAkcGFyZW50U2NvcGUgPSBpbmplY3Rvci5nZXQoybVjb25zdGFudHMuJFNDT1BFKTtcbiAgICAvLyBRVUVTVElPTiAxOiBTaG91bGQgd2UgY3JlYXRlIGFuIGlzb2xhdGVkIHNjb3BlIGlmIHRoZSBzY29wZSBpcyBvbmx5IHRydWU/XG4gICAgLy8gUVVFU1RJT04gMjogU2hvdWxkIHdlIG1ha2UgdGhlIHNjb3BlIGFjY2Vzc2libGUgdGhyb3VnaCBgJGVsZW1lbnQuc2NvcGUoKS9pc29sYXRlU2NvcGUoKWA/XG4gICAgdGhpcy4kY29tcG9uZW50U2NvcGUgPSAkcGFyZW50U2NvcGUuJG5ldyghIXRoaXMuZGlyZWN0aXZlLnNjb3BlKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZU91dHB1dHMoKTtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gQ29sbGVjdCBjb250ZW50cywgaW5zZXJ0IGFuZCBjb21waWxlIHRlbXBsYXRlXG4gICAgY29uc3QgYXR0YWNoQ2hpbGROb2RlczogybVhbmd1bGFyMS5JTGlua0ZuIHwgdW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSgpO1xuXG4gICAgLy8gSW5zdGFudGlhdGUgY29udHJvbGxlclxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICBjb25zdCBiaW5kVG9Db250cm9sbGVyID0gdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlcjtcbiAgICBsZXQgY29udHJvbGxlckluc3RhbmNlID0gY29udHJvbGxlclR5cGVcbiAgICAgID8gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLiRjb21wb25lbnRTY29wZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuICAgIGxldCBiaW5kaW5nRGVzdGluYXRpb246IMm1dXBncmFkZUhlbHBlci5JQmluZGluZ0Rlc3RpbmF0aW9uO1xuXG4gICAgaWYgKCFiaW5kVG9Db250cm9sbGVyKSB7XG4gICAgICBiaW5kaW5nRGVzdGluYXRpb24gPSB0aGlzLiRjb21wb25lbnRTY29wZTtcbiAgICB9IGVsc2UgaWYgKGNvbnRyb2xsZXJUeXBlICYmIGNvbnRyb2xsZXJJbnN0YW5jZSkge1xuICAgICAgYmluZGluZ0Rlc3RpbmF0aW9uID0gY29udHJvbGxlckluc3RhbmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBVcGdyYWRlZCBkaXJlY3RpdmUgJyR7dGhpcy5kaXJlY3RpdmUubmFtZX0nIHNwZWNpZmllcyAnYmluZFRvQ29udHJvbGxlcicgYnV0IG5vIGNvbnRyb2xsZXIuYCxcbiAgICAgICk7XG4gICAgfVxuICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gY29udHJvbGxlckluc3RhbmNlO1xuICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uID0gYmluZGluZ0Rlc3RpbmF0aW9uO1xuXG4gICAgLy8gU2V0IHVwIG91dHB1dHNcbiAgICB0aGlzLmJpbmRPdXRwdXRzKGJpbmRpbmdEZXN0aW5hdGlvbik7XG5cbiAgICAvLyBSZXF1aXJlIG90aGVyIGNvbnRyb2xsZXJzXG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9IHRoaXMuaGVscGVyLnJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyhjb250cm9sbGVySW5zdGFuY2UpO1xuXG4gICAgLy8gSG9vazogJG9uQ2hhbmdlc1xuICAgIGlmICh0aGlzLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICB0aGlzLmZvcndhcmRDaGFuZ2VzKHRoaXMucGVuZGluZ0NoYW5nZXMsIGJpbmRpbmdEZXN0aW5hdGlvbik7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkb25Jbml0XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIMm1dXRpbC5pc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJGRvQ2hlY2tcbiAgICBpZiAoY29udHJvbGxlckluc3RhbmNlICYmIMm1dXRpbC5pc0Z1bmN0aW9uKGNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaykpIHtcbiAgICAgIGNvbnN0IGNhbGxEb0NoZWNrID0gKCkgPT4gY29udHJvbGxlckluc3RhbmNlPy4kZG9DaGVjaz8uKCk7XG5cbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyID0gdGhpcy4kY29tcG9uZW50U2NvcGUuJHBhcmVudC4kd2F0Y2goY2FsbERvQ2hlY2spO1xuICAgICAgY2FsbERvQ2hlY2soKTtcbiAgICB9XG5cbiAgICAvLyBMaW5raW5nXG4gICAgY29uc3QgbGluayA9IHRoaXMuZGlyZWN0aXZlLmxpbms7XG4gICAgY29uc3QgcHJlTGluayA9IHR5cGVvZiBsaW5rID09ICdvYmplY3QnICYmIGxpbmsucHJlO1xuICAgIGNvbnN0IHBvc3RMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgPyBsaW5rLnBvc3QgOiBsaW5rO1xuICAgIGNvbnN0IGF0dHJzOiDJtWFuZ3VsYXIxLklBdHRyaWJ1dGVzID0gTk9UX1NVUFBPUlRFRDtcbiAgICBjb25zdCB0cmFuc2NsdWRlRm46IMm1YW5ndWxhcjEuSVRyYW5zY2x1ZGVGdW5jdGlvbiA9IE5PVF9TVVBQT1JURUQ7XG4gICAgaWYgKHByZUxpbmspIHtcbiAgICAgIHByZUxpbmsodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIGxpbmtGbih0aGlzLiRjb21wb25lbnRTY29wZSwgbnVsbCEsIHtwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbjogYXR0YWNoQ2hpbGROb2Rlc30pO1xuXG4gICAgaWYgKHBvc3RMaW5rKSB7XG4gICAgICBwb3N0TGluayh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJHBvc3RMaW5rXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIMm1dXRpbC5pc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmICghdGhpcy5iaW5kaW5nRGVzdGluYXRpb24pIHtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBjaGFuZ2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvcndhcmRDaGFuZ2VzKGNoYW5nZXMsIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nRG9DaGVjaygpIHtcbiAgICBjb25zdCB0d29XYXlCb3VuZFByb3BlcnRpZXMgPSB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcztcbiAgICBjb25zdCB0d29XYXlCb3VuZExhc3RWYWx1ZXMgPSB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kTGFzdFZhbHVlcztcbiAgICBjb25zdCBwcm9wZXJ0eVRvT3V0cHV0TWFwID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwO1xuXG4gICAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpZHgpID0+IHtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5iaW5kaW5nRGVzdGluYXRpb24/Lltwcm9wTmFtZV07XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdO1xuXG4gICAgICBpZiAoIU9iamVjdC5pcyhuZXdWYWx1ZSwgb2xkVmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSBwcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV07XG5cbiAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQobmV3VmFsdWUpO1xuICAgICAgICB0d29XYXlCb3VuZExhc3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoybV1dGlsLmlzRnVuY3Rpb24odGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIpKSB7XG4gICAgICB0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcigpO1xuICAgIH1cbiAgICB0aGlzLmhlbHBlci5vbkRlc3Ryb3kodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUJpbmRpbmdzKGRpcmVjdGl2ZTogybVhbmd1bGFyMS5JRGlyZWN0aXZlLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBidGNJc09iamVjdCA9IHR5cGVvZiBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA9PT0gJ29iamVjdCc7XG4gICAgaWYgKGJ0Y0lzT2JqZWN0ICYmIE9iamVjdC5rZXlzKGRpcmVjdGl2ZS5zY29wZSEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgQmluZGluZyBkZWZpbml0aW9ucyBvbiBzY29wZSBhbmQgY29udHJvbGxlciBhdCB0aGUgc2FtZSB0aW1lIGlzIG5vdCBzdXBwb3J0ZWQuYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dCA9IGJ0Y0lzT2JqZWN0ID8gZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgOiBkaXJlY3RpdmUuc2NvcGU7XG4gICAgY29uc3QgYmluZGluZ3MgPSBuZXcgQmluZGluZ3MoKTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoY29udGV4dCkuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgc3dpdGNoIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLiBUaGV5IHdpbGwgYmUgZGVmaW5lZCBhcyBpbnB1dHMgb24gdGhlXG4gICAgICAgICAgICAvLyB1cGdyYWRlZCBjb21wb25lbnQgZmFjYWRlIGFuZCB0aGUgY2hhbmdlIHByb3BhZ2F0aW9uIHdpbGwgYmUgaGFuZGxlZCBieVxuICAgICAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZExhc3RWYWx1ZXMucHVzaChJTklUSUFMX1ZBTFVFKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWUgKyAnQ2hhbmdlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgbWFwcGluZyAnJHtiaW5kaW5nVHlwZX0nIGluICcke2pzb259JyBpbiAnJHtuYW1lfScgZGlyZWN0aXZlLmAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmluZGluZ3M7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemVPdXRwdXRzKCkge1xuICAgIC8vIEluaXRpYWxpemUgdGhlIG91dHB1dHMgZm9yIGA9YCBhbmQgYCZgIGJpbmRpbmdzXG4gICAgdGhpcy5iaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXNcbiAgICAgIC5jb25jYXQodGhpcy5iaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzKVxuICAgICAgLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgICAodGhpcyBhcyBhbnkpW291dHB1dE5hbWVdID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGJpbmRPdXRwdXRzKGJpbmRpbmdEZXN0aW5hdGlvbjogybV1cGdyYWRlSGVscGVyLklCaW5kaW5nRGVzdGluYXRpb24pIHtcbiAgICAvLyBCaW5kIGAmYCBiaW5kaW5ncyB0byB0aGUgY29ycmVzcG9uZGluZyBvdXRwdXRzXG4gICAgdGhpcy5iaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG4gICAgICBjb25zdCBvdXRwdXROYW1lID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IGVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXSA9ICh2YWx1ZTogYW55KSA9PiBlbWl0dGVyLmVtaXQodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3J3YXJkQ2hhbmdlcyhcbiAgICBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLFxuICAgIGJpbmRpbmdEZXN0aW5hdGlvbjogybV1cGdyYWRlSGVscGVyLklCaW5kaW5nRGVzdGluYXRpb24sXG4gICkge1xuICAgIC8vIEZvcndhcmQgaW5wdXQgY2hhbmdlcyB0byBgYmluZGluZ0Rlc3RpbmF0aW9uYFxuICAgIE9iamVjdC5rZXlzKGNoYW5nZXMpLmZvckVhY2goXG4gICAgICAocHJvcE5hbWUpID0+IChiaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gY2hhbmdlc1twcm9wTmFtZV0uY3VycmVudFZhbHVlKSxcbiAgICApO1xuXG4gICAgaWYgKMm1dXRpbC5pc0Z1bmN0aW9uKGJpbmRpbmdEZXN0aW5hdGlvbi4kb25DaGFuZ2VzKSkge1xuICAgICAgYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG59XG4iXX0=