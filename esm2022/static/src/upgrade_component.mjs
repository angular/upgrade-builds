/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.4+sha-a3b1dc0", ngImport: i0, type: UpgradeComponent, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.4+sha-a3b1dc0", type: UpgradeComponent, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.4+sha-a3b1dc0", ngImport: i0, type: UpgradeComponent, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: undefined }, { type: i0.ElementRef }, { type: i0.Injector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLFNBQVMsRUFFVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLFFBQVEsR0FLVCxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQVksVUFBVSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUMsTUFBTSxXQUFXLENBQUM7O0FBRXZFLE1BQU0sYUFBYSxHQUFRLGVBQWUsQ0FBQztBQUMzQyxNQUFNLGFBQWEsR0FBRztJQUNwQixpQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFFRixNQUFNLFFBQVE7SUFBZDtRQUNFLDBCQUFxQixHQUFhLEVBQUUsQ0FBQztRQUNyQywwQkFBcUIsR0FBVSxFQUFFLENBQUM7UUFFbEMsOEJBQXlCLEdBQWEsRUFBRSxDQUFDO1FBRXpDLHdCQUFtQixHQUFpQyxFQUFFLENBQUM7SUFDekQsQ0FBQztDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVDRztBQUVILE1BQU0sT0FBTyxnQkFBZ0I7SUFtQjNCOzs7Ozs7Ozs7O09BVUc7SUFDSCxZQUFZLElBQVksRUFBRSxVQUFzQixFQUFFLFFBQWtCO1FBbEJwRSwyRUFBMkU7UUFDM0UscUVBQXFFO1FBQ3JFLDhDQUE4QztRQUN0QyxtQkFBYyxHQUF5QixJQUFJLENBQUM7UUFnQmxELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFM0UsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUVyQyxJQUFJLENB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R0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9ELE1BQU0sT0FBTyxHQUF1QixJQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFN0Qsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sY0FBYyxDQUNwQixPQUFzQixFQUN0QixrQkFBc0Q7UUFFdEQsZ0RBQWdEO1FBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUMxQixDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQzlFLENBQUM7UUFFRixJQUFJLEtBQUssQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUNwRCxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsQ0FBQztJQUNILENBQUM7eUhBNU9VLGdCQUFnQjs2R0FBaEIsZ0JBQWdCOztzR0FBaEIsZ0JBQWdCO2tCQUQ1QixTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRG9DaGVjayxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3RvcixcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgU2ltcGxlQ2hhbmdlcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ybVhbmd1bGFyMSwgybVjb25zdGFudHMsIMm1dXBncmFkZUhlbHBlciwgybV1dGlsfSBmcm9tICcuLi9jb21tb24nO1xuXG5jb25zdCBOT1RfU1VQUE9SVEVEOiBhbnkgPSAnTk9UX1NVUFBPUlRFRCc7XG5jb25zdCBJTklUSUFMX1ZBTFVFID0ge1xuICBfX1VOSU5JVElBTElaRURfXzogdHJ1ZSxcbn07XG5cbmNsYXNzIEJpbmRpbmdzIHtcbiAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICB0d29XYXlCb3VuZExhc3RWYWx1ZXM6IGFueVtdID0gW107XG5cbiAgZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblxuICBwcm9wZXJ0eVRvT3V0cHV0TWFwOiB7W3Byb3BOYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgY2xhc3MgdGhhdCBhbGxvd3MgYW4gQW5ndWxhckpTIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhci5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFPVCBjb21waWxhdGlvbi4qXG4gKlxuICogVGhpcyBoZWxwZXIgY2xhc3Mgc2hvdWxkIGJlIHVzZWQgYXMgYSBiYXNlIGNsYXNzIGZvciBjcmVhdGluZyBBbmd1bGFyIGRpcmVjdGl2ZXNcbiAqIHRoYXQgd3JhcCBBbmd1bGFySlMgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgXCJ1cGdyYWRlZFwiLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBMZXQncyBhc3N1bWUgdGhhdCB5b3UgaGF2ZSBhbiBBbmd1bGFySlMgY29tcG9uZW50IGNhbGxlZCBgbmcxSGVyb2AgdGhhdCBuZWVkc1xuICogdG8gYmUgbWFkZSBhdmFpbGFibGUgaW4gQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYSBgRGlyZWN0aXZlYCB0aGF0IHdpbGwgbWFrZSB0aGlzIEFuZ3VsYXJKUyBjb21wb25lbnRcbiAqIGF2YWlsYWJsZSBpbnNpZGUgQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIn1cbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUgeW91IGNhbiBzZWUgdGhhdCB3ZSBtdXN0IGRlcml2ZSBmcm9tIHRoZSBgVXBncmFkZUNvbXBvbmVudGBcbiAqIGJhc2UgY2xhc3MgYnV0IGFsc28gcHJvdmlkZSBhbiB7QGxpbmsgRGlyZWN0aXZlIGBARGlyZWN0aXZlYH0gZGVjb3JhdG9yLiBUaGlzIGlzXG4gKiBiZWNhdXNlIHRoZSBBT1QgY29tcGlsZXIgcmVxdWlyZXMgdGhhdCB0aGlzIGluZm9ybWF0aW9uIGlzIHN0YXRpY2FsbHkgYXZhaWxhYmxlIGF0XG4gKiBjb21waWxlIHRpbWUuXG4gKlxuICogTm90ZSB0aGF0IHdlIG11c3QgZG8gdGhlIGZvbGxvd2luZzpcbiAqICogc3BlY2lmeSB0aGUgZGlyZWN0aXZlJ3Mgc2VsZWN0b3IgKGBuZzEtaGVyb2ApXG4gKiAqIHNwZWNpZnkgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyB0aGF0IHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGV4cGVjdHNcbiAqICogZGVyaXZlIGZyb20gYFVwZ3JhZGVDb21wb25lbnRgXG4gKiAqIGNhbGwgdGhlIGJhc2UgY2xhc3MgZnJvbSB0aGUgY29uc3RydWN0b3IsIHBhc3NpbmdcbiAqICAgKiB0aGUgQW5ndWxhckpTIG5hbWUgb2YgdGhlIGNvbXBvbmVudCAoYG5nMUhlcm9gKVxuICogICAqIHRoZSBgRWxlbWVudFJlZmAgYW5kIGBJbmplY3RvcmAgZm9yIHRoZSBjb21wb25lbnQgd3JhcHBlclxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBleHRlbnNpYmxlXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjaywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBoZWxwZXI6IMm1dXBncmFkZUhlbHBlci5VcGdyYWRlSGVscGVyO1xuXG4gIHByaXZhdGUgJGVsZW1lbnQ6IMm1YW5ndWxhcjEuSUF1Z21lbnRlZEpRdWVyeTtcbiAgcHJpdmF0ZSAkY29tcG9uZW50U2NvcGU6IMm1YW5ndWxhcjEuSVNjb3BlO1xuXG4gIHByaXZhdGUgZGlyZWN0aXZlOiDJtWFuZ3VsYXIxLklEaXJlY3RpdmU7XG4gIHByaXZhdGUgYmluZGluZ3M6IEJpbmRpbmdzO1xuXG4gIHByaXZhdGUgY29udHJvbGxlckluc3RhbmNlPzogybV1cGdyYWRlSGVscGVyLklDb250cm9sbGVySW5zdGFuY2U7XG4gIHByaXZhdGUgYmluZGluZ0Rlc3RpbmF0aW9uPzogybV1cGdyYWRlSGVscGVyLklCaW5kaW5nRGVzdGluYXRpb247XG5cbiAgLy8gV2Ugd2lsbCBiZSBpbnN0YW50aWF0aW5nIHRoZSBjb250cm9sbGVyIGluIHRoZSBgbmdPbkluaXRgIGhvb2ssIHdoZW4gdGhlXG4gIC8vIGZpcnN0IGBuZ09uQ2hhbmdlc2Agd2lsbCBoYXZlIGJlZW4gYWxyZWFkeSB0cmlnZ2VyZWQuIFdlIHN0b3JlIHRoZVxuICAvLyBgU2ltcGxlQ2hhbmdlc2AgYW5kIFwicGxheSB0aGVtIGJhY2tcIiBsYXRlci5cbiAgcHJpdmF0ZSBwZW5kaW5nQ2hhbmdlczogU2ltcGxlQ2hhbmdlcyB8IG51bGwgPSBudWxsO1xuXG4gIHByaXZhdGUgdW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyPzogRnVuY3Rpb247XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgVXBncmFkZUNvbXBvbmVudGAgaW5zdGFuY2UuIFlvdSBzaG91bGQgbm90IG5vcm1hbGx5IG5lZWQgdG8gZG8gdGhpcy5cbiAgICogSW5zdGVhZCB5b3Ugc2hvdWxkIGRlcml2ZSBhIG5ldyBjbGFzcyBmcm9tIHRoaXMgb25lIGFuZCBjYWxsIHRoZSBzdXBlciBjb25zdHJ1Y3RvclxuICAgKiBmcm9tIHRoZSBiYXNlIGNsYXNzLlxuICAgKlxuICAgKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLWhlcm8td3JhcHBlclwiIH1cbiAgICpcbiAgICogKiBUaGUgYG5hbWVgIHBhcmFtZXRlciBzaG91bGQgYmUgdGhlIG5hbWUgb2YgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUuXG4gICAqICogVGhlIGBlbGVtZW50UmVmYCBhbmQgYGluamVjdG9yYCBwYXJhbWV0ZXJzIHNob3VsZCBiZSBhY3F1aXJlZCBmcm9tIEFuZ3VsYXIgYnkgZGVwZW5kZW5jeVxuICAgKiAgIGluamVjdGlvbiBpbnRvIHRoZSBiYXNlIGNsYXNzIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmhlbHBlciA9IG5ldyDJtXVwZ3JhZGVIZWxwZXIuVXBncmFkZUhlbHBlcihpbmplY3RvciwgbmFtZSwgZWxlbWVudFJlZik7XG5cbiAgICB0aGlzLiRlbGVtZW50ID0gdGhpcy5oZWxwZXIuJGVsZW1lbnQ7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZSA9IHRoaXMuaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmJpbmRpbmdzID0gdGhpcy5pbml0aWFsaXplQmluZGluZ3ModGhpcy5kaXJlY3RpdmUsIG5hbWUpO1xuXG4gICAgLy8gV2UgYXNrIGZvciB0aGUgQW5ndWxhckpTIHNjb3BlIGZyb20gdGhlIEFuZ3VsYXIgaW5qZWN0b3IsIHNpbmNlXG4gICAgLy8gd2Ugd2lsbCBwdXQgdGhlIG5ldyBjb21wb25lbnQgc2NvcGUgb250byB0aGUgbmV3IGluamVjdG9yIGZvciBlYWNoIGNvbXBvbmVudFxuICAgIGNvbnN0ICRwYXJlbnRTY29wZSA9IGluamVjdG9yLmdldCjJtWNvbnN0YW50cy4kU0NPUEUpO1xuICAgIC8vIFFVRVNUSU9OIDE6IFNob3VsZCB3ZSBjcmVhdGUgYW4gaXNvbGF0ZWQgc2NvcGUgaWYgdGhlIHNjb3BlIGlzIG9ubHkgdHJ1ZT9cbiAgICAvLyBRVUVTVElPTiAyOiBTaG91bGQgd2UgbWFrZSB0aGUgc2NvcGUgYWNjZXNzaWJsZSB0aHJvdWdoIGAkZWxlbWVudC5zY29wZSgpL2lzb2xhdGVTY29wZSgpYD9cbiAgICB0aGlzLiRjb21wb25lbnRTY29wZSA9ICRwYXJlbnRTY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplT3V0cHV0cygpO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBDb2xsZWN0IGNvbnRlbnRzLCBpbnNlcnQgYW5kIGNvbXBpbGUgdGVtcGxhdGVcbiAgICBjb25zdCBhdHRhY2hDaGlsZE5vZGVzOiDJtWFuZ3VsYXIxLklMaW5rRm4gfCB1bmRlZmluZWQgPSB0aGlzLmhlbHBlci5wcmVwYXJlVHJhbnNjbHVzaW9uKCk7XG4gICAgY29uc3QgbGlua0ZuID0gdGhpcy5oZWxwZXIuY29tcGlsZVRlbXBsYXRlKCk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGxldCBjb250cm9sbGVySW5zdGFuY2UgPSBjb250cm9sbGVyVHlwZVxuICAgICAgPyB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuJGNvbXBvbmVudFNjb3BlKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gICAgbGV0IGJpbmRpbmdEZXN0aW5hdGlvbjogybV1cGdyYWRlSGVscGVyLklCaW5kaW5nRGVzdGluYXRpb247XG5cbiAgICBpZiAoIWJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIGJpbmRpbmdEZXN0aW5hdGlvbiA9IHRoaXMuJGNvbXBvbmVudFNjb3BlO1xuICAgIH0gZWxzZSBpZiAoY29udHJvbGxlclR5cGUgJiYgY29udHJvbGxlckluc3RhbmNlKSB7XG4gICAgICBiaW5kaW5nRGVzdGluYXRpb24gPSBjb250cm9sbGVySW5zdGFuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYFVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHt0aGlzLmRpcmVjdGl2ZS5uYW1lfScgc3BlY2lmaWVzICdiaW5kVG9Db250cm9sbGVyJyBidXQgbm8gY29udHJvbGxlci5gLFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSBjb250cm9sbGVySW5zdGFuY2U7XG4gICAgdGhpcy5iaW5kaW5nRGVzdGluYXRpb24gPSBiaW5kaW5nRGVzdGluYXRpb247XG5cbiAgICAvLyBTZXQgdXAgb3V0cHV0c1xuICAgIHRoaXMuYmluZE91dHB1dHMoYmluZGluZ0Rlc3RpbmF0aW9uKTtcblxuICAgIC8vIFJlcXVpcmUgb3RoZXIgY29udHJvbGxlcnNcbiAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzID0gdGhpcy5oZWxwZXIucmVzb2x2ZUFuZEJpbmRSZXF1aXJlZENvbnRyb2xsZXJzKGNvbnRyb2xsZXJJbnN0YW5jZSk7XG5cbiAgICAvLyBIb29rOiAkb25DaGFuZ2VzXG4gICAgaWYgKHRoaXMucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgIHRoaXMuZm9yd2FyZENoYW5nZXModGhpcy5wZW5kaW5nQ2hhbmdlcywgYmluZGluZ0Rlc3RpbmF0aW9uKTtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRvbkluaXRcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgybV1dGlsLmlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkZG9DaGVja1xuICAgIGlmIChjb250cm9sbGVySW5zdGFuY2UgJiYgybV1dGlsLmlzRnVuY3Rpb24oY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKSkge1xuICAgICAgY29uc3QgY2FsbERvQ2hlY2sgPSAoKSA9PiBjb250cm9sbGVySW5zdGFuY2U/LiRkb0NoZWNrPy4oKTtcblxuICAgICAgdGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIgPSB0aGlzLiRjb21wb25lbnRTY29wZS4kcGFyZW50LiR3YXRjaChjYWxsRG9DaGVjayk7XG4gICAgICBjYWxsRG9DaGVjaygpO1xuICAgIH1cblxuICAgIC8vIExpbmtpbmdcbiAgICBjb25zdCBsaW5rID0gdGhpcy5kaXJlY3RpdmUubGluaztcbiAgICBjb25zdCBwcmVMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgJiYgbGluay5wcmU7XG4gICAgY29uc3QgcG9zdExpbmsgPSB0eXBlb2YgbGluayA9PSAnb2JqZWN0JyA/IGxpbmsucG9zdCA6IGxpbms7XG4gICAgY29uc3QgYXR0cnM6IMm1YW5ndWxhcjEuSUF0dHJpYnV0ZXMgPSBOT1RfU1VQUE9SVEVEO1xuICAgIGNvbnN0IHRyYW5zY2x1ZGVGbjogybVhbmd1bGFyMS5JVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgbGlua0ZuKHRoaXMuJGNvbXBvbmVudFNjb3BlLCBudWxsISwge3BhcmVudEJvdW5kVHJhbnNjbHVkZUZuOiBhdHRhY2hDaGlsZE5vZGVzfSk7XG5cbiAgICBpZiAocG9zdExpbmspIHtcbiAgICAgIHBvc3RMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkcG9zdExpbmtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgybV1dGlsLmlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKCF0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbikge1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IGNoYW5nZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9yd2FyZENoYW5nZXMoY2hhbmdlcywgdGhpcy5iaW5kaW5nRGVzdGluYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdEb0NoZWNrKCkge1xuICAgIGNvbnN0IHR3b1dheUJvdW5kUHJvcGVydGllcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzO1xuICAgIGNvbnN0IHR3b1dheUJvdW5kTGFzdFZhbHVlcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRMYXN0VmFsdWVzO1xuICAgIGNvbnN0IHByb3BlcnR5VG9PdXRwdXRNYXAgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXA7XG5cbiAgICB0d29XYXlCb3VuZFByb3BlcnRpZXMuZm9yRWFjaCgocHJvcE5hbWUsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbj8uW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdHdvV2F5Qm91bmRMYXN0VmFsdWVzW2lkeF07XG5cbiAgICAgIGlmICghT2JqZWN0LmlzKG5ld1ZhbHVlLCBvbGRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChuZXdWYWx1ZSk7XG4gICAgICAgIHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICjJtXV0aWwuaXNGdW5jdGlvbih0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcikpIHtcbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyKCk7XG4gICAgfVxuICAgIHRoaXMuaGVscGVyLm9uRGVzdHJveSh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplQmluZGluZ3MoZGlyZWN0aXZlOiDJtWFuZ3VsYXIxLklEaXJlY3RpdmUsIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIGRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXMoZGlyZWN0aXZlLnNjb3BlISkubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgaXMgbm90IHN1cHBvcnRlZC5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gYnRjSXNPYmplY3QgPyBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA6IGRpcmVjdGl2ZS5zY29wZTtcbiAgICBjb25zdCBiaW5kaW5ncyA9IG5ldyBCaW5kaW5ncygpO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKChwcm9wTmFtZSkgPT4ge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gY29udGV4dFtwcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gZGVmaW5pdGlvbi5jaGFyQXQoMCk7XG5cbiAgICAgICAgLy8gUVVFU1RJT046IFdoYXQgYWJvdXQgYD0qYD8gSWdub3JlPyBUaHJvdz8gU3VwcG9ydD9cblxuICAgICAgICBzd2l0Y2ggKGJpbmRpbmdUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIHNwZWNpYWwuIFRoZXkgd2lsbCBiZSBkZWZpbmVkIGFzIGlucHV0cyBvbiB0aGVcbiAgICAgICAgICAgIC8vIHVwZ3JhZGVkIGNvbXBvbmVudCBmYWNhZGUgYW5kIHRoZSBjaGFuZ2UgcHJvcGFnYXRpb24gd2lsbCBiZSBoYW5kbGVkIGJ5XG4gICAgICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIGJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnR3b1dheUJvdW5kTGFzdFZhbHVlcy5wdXNoKElOSVRJQUxfVkFMVUUpO1xuICAgICAgICAgICAgYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV0gPSBwcm9wTmFtZSArICdDaGFuZ2UnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICBiaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgICAgYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZXQganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke25hbWV9JyBkaXJlY3RpdmUuYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBiaW5kaW5ncztcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZU91dHB1dHMoKSB7XG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgb3V0cHV0cyBmb3IgYD1gIGFuZCBgJmAgYmluZGluZ3NcbiAgICB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllc1xuICAgICAgLmNvbmNhdCh0aGlzLmJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMpXG4gICAgICAuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICAgICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV0gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYmluZE91dHB1dHMoYmluZGluZ0Rlc3RpbmF0aW9uOiDJtXVwZ3JhZGVIZWxwZXIuSUJpbmRpbmdEZXN0aW5hdGlvbikge1xuICAgIC8vIEJpbmQgYCZgIGJpbmRpbmdzIHRvIHRoZSBjb3JyZXNwb25kaW5nIG91dHB1dHNcbiAgICB0aGlzLmJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgZW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4gPSAodGhpcyBhcyBhbnkpW291dHB1dE5hbWVdO1xuXG4gICAgICBiaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gKHZhbHVlOiBhbnkpID0+IGVtaXR0ZXIuZW1pdCh2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGZvcndhcmRDaGFuZ2VzKFxuICAgIGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMsXG4gICAgYmluZGluZ0Rlc3RpbmF0aW9uOiDJtXVwZ3JhZGVIZWxwZXIuSUJpbmRpbmdEZXN0aW5hdGlvbixcbiAgKSB7XG4gICAgLy8gRm9yd2FyZCBpbnB1dCBjaGFuZ2VzIHRvIGBiaW5kaW5nRGVzdGluYXRpb25gXG4gICAgT2JqZWN0LmtleXMoY2hhbmdlcykuZm9yRWFjaChcbiAgICAgIChwcm9wTmFtZSkgPT4gKGJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV0gPSBjaGFuZ2VzW3Byb3BOYW1lXS5jdXJyZW50VmFsdWUpLFxuICAgICk7XG5cbiAgICBpZiAoybV1dGlsLmlzRnVuY3Rpb24oYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMpKSB7XG4gICAgICBiaW5kaW5nRGVzdGluYXRpb24uJG9uQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==