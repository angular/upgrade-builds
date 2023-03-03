/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Injector } from '@angular/core';
import { $SCOPE } from '../../src/common/src/constants';
import { UpgradeHelper } from '../../src/common/src/upgrade_helper';
import { isFunction } from '../../src/common/src/util';
import * as i0 from "@angular/core";
const NOT_SUPPORTED = 'NOT_SUPPORTED';
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
class UpgradeComponent {
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
        this.helper = new UpgradeHelper(injector, name, elementRef);
        this.$element = this.helper.$element;
        this.directive = this.helper.directive;
        this.bindings = this.initializeBindings(this.directive, name);
        // We ask for the AngularJS scope from the Angular injector, since
        // we will put the new component scope onto the new injector for each component
        const $parentScope = injector.get($SCOPE);
        // QUESTION 1: Should we create an isolated scope if the scope is only true?
        // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
        this.$componentScope = $parentScope.$new(!!this.directive.scope);
        this.initializeOutputs();
    }
    ngOnInit() {
        // Collect contents, insert and compile template
        const attachChildNodes = this.helper.prepareTransclusion();
        const linkFn = this.helper.compileTemplate();
        // Instantiate controller
        const controllerType = this.directive.controller;
        const bindToController = this.directive.bindToController;
        let controllerInstance = controllerType ?
            this.helper.buildController(controllerType, this.$componentScope) :
            undefined;
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
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        // Hook: $doCheck
        if (controllerInstance && isFunction(controllerInstance.$doCheck)) {
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
        if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
            this.controllerInstance.$postLink();
        }
    }
    ngOnChanges(changes) {
        if (!this.bindingDestination) {
            this.pendingChanges = changes;
        }
        else {
            this.forwardChanges(changes, this.bindingDestination);
        }
    }
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
    ngOnDestroy() {
        if (isFunction(this.unregisterDoCheckWatcher)) {
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
            Object.keys(context).forEach(propName => {
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
        this.bindings.twoWayBoundProperties.concat(this.bindings.expressionBoundProperties)
            .forEach(propName => {
            const outputName = this.bindings.propertyToOutputMap[propName];
            this[outputName] = new EventEmitter();
        });
    }
    bindOutputs(bindingDestination) {
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach(propName => {
            const outputName = this.bindings.propertyToOutputMap[propName];
            const emitter = this[outputName];
            bindingDestination[propName] = (value) => emitter.emit(value);
        });
    }
    forwardChanges(changes, bindingDestination) {
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach(propName => bindingDestination[propName] = changes[propName].currentValue);
        if (isFunction(bindingDestination.$onChanges)) {
            bindingDestination.$onChanges(changes);
        }
    }
}
UpgradeComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.0.0-next.1+sha-9737df3", ngImport: i0, type: UpgradeComponent, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive });
UpgradeComponent.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.0.0-next.1+sha-9737df3", type: UpgradeComponent, usesOnChanges: true, ngImport: i0 });
export { UpgradeComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.0.0-next.1+sha-9737df3", ngImport: i0, type: UpgradeComponent, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: undefined }, { type: i0.ElementRef }, { type: i0.Injector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBOEMsTUFBTSxlQUFlLENBQUM7QUFHbEksT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3RELE9BQU8sRUFBMkMsYUFBYSxFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDNUcsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDJCQUEyQixDQUFDOztBQUVyRCxNQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFDM0MsTUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsTUFBTSxRQUFRO0lBQWQ7UUFDRSwwQkFBcUIsR0FBYSxFQUFFLENBQUM7UUFDckMsMEJBQXFCLEdBQVUsRUFBRSxDQUFDO1FBRWxDLDhCQUF5QixHQUFhLEVBQUUsQ0FBQztRQUV6Qyx3QkFBbUIsR0FBaUMsRUFBRSxDQUFDO0lBQ3pELENBQUM7Q0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Q0c7QUFDSCxNQUNhLGdCQUFnQjtJQW1CM0I7Ozs7Ozs7Ozs7T0FVRztJQUNILFlBQVksSUFBWSxFQUFFLFVBQXNCLEVBQUUsUUFBa0I7UUFsQnBFLDJFQUEyRTtRQUMzRSxxRUFBcUU7UUFDckUsOENBQThDO1FBQ3RDLG1CQUFjLEdBQXVCLElBQUksQ0FBQztRQWdCaEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTVELElBQUksQ0FB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SUFDTCxDQUFDO0lBRU8sY0FBYyxDQUFDLE9BQXNCLEVBQUUsa0JBQXVDO1FBQ3BGLGdEQUFnRDtRQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FDeEIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFL0UsSUFBSSxVQUFVLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDN0Msa0JBQWtCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3hDO0lBQ0gsQ0FBQzs7d0hBaE9VLGdCQUFnQjs0R0FBaEIsZ0JBQWdCO1NBQWhCLGdCQUFnQjtzR0FBaEIsZ0JBQWdCO2tCQUQ1QixTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdG9yLCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgT25Jbml0LCBTaW1wbGVDaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJQXR0cmlidXRlcywgSUF1Z21lbnRlZEpRdWVyeSwgSURpcmVjdGl2ZSwgSUluamVjdG9yU2VydmljZSwgSUxpbmtGbiwgSVNjb3BlLCBJVHJhbnNjbHVkZUZ1bmN0aW9ufSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7SUJpbmRpbmdEZXN0aW5hdGlvbiwgSUNvbnRyb2xsZXJJbnN0YW5jZSwgVXBncmFkZUhlbHBlcn0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvdXBncmFkZV9oZWxwZXInO1xuaW1wb3J0IHtpc0Z1bmN0aW9ufSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy91dGlsJztcblxuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmNsYXNzIEJpbmRpbmdzIHtcbiAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICB0d29XYXlCb3VuZExhc3RWYWx1ZXM6IGFueVtdID0gW107XG5cbiAgZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblxuICBwcm9wZXJ0eVRvT3V0cHV0TWFwOiB7W3Byb3BOYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgY2xhc3MgdGhhdCBhbGxvd3MgYW4gQW5ndWxhckpTIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhci5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFPVCBjb21waWxhdGlvbi4qXG4gKlxuICogVGhpcyBoZWxwZXIgY2xhc3Mgc2hvdWxkIGJlIHVzZWQgYXMgYSBiYXNlIGNsYXNzIGZvciBjcmVhdGluZyBBbmd1bGFyIGRpcmVjdGl2ZXNcbiAqIHRoYXQgd3JhcCBBbmd1bGFySlMgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgXCJ1cGdyYWRlZFwiLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBMZXQncyBhc3N1bWUgdGhhdCB5b3UgaGF2ZSBhbiBBbmd1bGFySlMgY29tcG9uZW50IGNhbGxlZCBgbmcxSGVyb2AgdGhhdCBuZWVkc1xuICogdG8gYmUgbWFkZSBhdmFpbGFibGUgaW4gQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYSBgRGlyZWN0aXZlYCB0aGF0IHdpbGwgbWFrZSB0aGlzIEFuZ3VsYXJKUyBjb21wb25lbnRcbiAqIGF2YWlsYWJsZSBpbnNpZGUgQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIn1cbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUgeW91IGNhbiBzZWUgdGhhdCB3ZSBtdXN0IGRlcml2ZSBmcm9tIHRoZSBgVXBncmFkZUNvbXBvbmVudGBcbiAqIGJhc2UgY2xhc3MgYnV0IGFsc28gcHJvdmlkZSBhbiB7QGxpbmsgRGlyZWN0aXZlIGBARGlyZWN0aXZlYH0gZGVjb3JhdG9yLiBUaGlzIGlzXG4gKiBiZWNhdXNlIHRoZSBBT1QgY29tcGlsZXIgcmVxdWlyZXMgdGhhdCB0aGlzIGluZm9ybWF0aW9uIGlzIHN0YXRpY2FsbHkgYXZhaWxhYmxlIGF0XG4gKiBjb21waWxlIHRpbWUuXG4gKlxuICogTm90ZSB0aGF0IHdlIG11c3QgZG8gdGhlIGZvbGxvd2luZzpcbiAqICogc3BlY2lmeSB0aGUgZGlyZWN0aXZlJ3Mgc2VsZWN0b3IgKGBuZzEtaGVyb2ApXG4gKiAqIHNwZWNpZnkgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyB0aGF0IHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGV4cGVjdHNcbiAqICogZGVyaXZlIGZyb20gYFVwZ3JhZGVDb21wb25lbnRgXG4gKiAqIGNhbGwgdGhlIGJhc2UgY2xhc3MgZnJvbSB0aGUgY29uc3RydWN0b3IsIHBhc3NpbmdcbiAqICAgKiB0aGUgQW5ndWxhckpTIG5hbWUgb2YgdGhlIGNvbXBvbmVudCAoYG5nMUhlcm9gKVxuICogICAqIHRoZSBgRWxlbWVudFJlZmAgYW5kIGBJbmplY3RvcmAgZm9yIHRoZSBjb21wb25lbnQgd3JhcHBlclxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBleHRlbnNpYmxlXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjaywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBoZWxwZXI6IFVwZ3JhZGVIZWxwZXI7XG5cbiAgcHJpdmF0ZSAkZWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeTtcbiAgcHJpdmF0ZSAkY29tcG9uZW50U2NvcGU6IElTY29wZTtcblxuICBwcml2YXRlIGRpcmVjdGl2ZTogSURpcmVjdGl2ZTtcbiAgcHJpdmF0ZSBiaW5kaW5nczogQmluZGluZ3M7XG5cbiAgcHJpdmF0ZSBjb250cm9sbGVySW5zdGFuY2U/OiBJQ29udHJvbGxlckluc3RhbmNlO1xuICBwcml2YXRlIGJpbmRpbmdEZXN0aW5hdGlvbj86IElCaW5kaW5nRGVzdGluYXRpb247XG5cbiAgLy8gV2Ugd2lsbCBiZSBpbnN0YW50aWF0aW5nIHRoZSBjb250cm9sbGVyIGluIHRoZSBgbmdPbkluaXRgIGhvb2ssIHdoZW4gdGhlXG4gIC8vIGZpcnN0IGBuZ09uQ2hhbmdlc2Agd2lsbCBoYXZlIGJlZW4gYWxyZWFkeSB0cmlnZ2VyZWQuIFdlIHN0b3JlIHRoZVxuICAvLyBgU2ltcGxlQ2hhbmdlc2AgYW5kIFwicGxheSB0aGVtIGJhY2tcIiBsYXRlci5cbiAgcHJpdmF0ZSBwZW5kaW5nQ2hhbmdlczogU2ltcGxlQ2hhbmdlc3xudWxsID0gbnVsbDtcblxuICBwcml2YXRlIHVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcj86IEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFVwZ3JhZGVDb21wb25lbnRgIGluc3RhbmNlLiBZb3Ugc2hvdWxkIG5vdCBub3JtYWxseSBuZWVkIHRvIGRvIHRoaXMuXG4gICAqIEluc3RlYWQgeW91IHNob3VsZCBkZXJpdmUgYSBuZXcgY2xhc3MgZnJvbSB0aGlzIG9uZSBhbmQgY2FsbCB0aGUgc3VwZXIgY29uc3RydWN0b3JcbiAgICogZnJvbSB0aGUgYmFzZSBjbGFzcy5cbiAgICpcbiAgICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIiB9XG4gICAqXG4gICAqICogVGhlIGBuYW1lYCBwYXJhbWV0ZXIgc2hvdWxkIGJlIHRoZSBuYW1lIG9mIHRoZSBBbmd1bGFySlMgZGlyZWN0aXZlLlxuICAgKiAqIFRoZSBgZWxlbWVudFJlZmAgYW5kIGBpbmplY3RvcmAgcGFyYW1ldGVycyBzaG91bGQgYmUgYWNxdWlyZWQgZnJvbSBBbmd1bGFyIGJ5IGRlcGVuZGVuY3lcbiAgICogICBpbmplY3Rpb24gaW50byB0aGUgYmFzZSBjbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZywgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5oZWxwZXIgPSBuZXcgVXBncmFkZUhlbHBlcihpbmplY3RvciwgbmFtZSwgZWxlbWVudFJlZik7XG5cbiAgICB0aGlzLiRlbGVtZW50ID0gdGhpcy5oZWxwZXIuJGVsZW1lbnQ7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZSA9IHRoaXMuaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmJpbmRpbmdzID0gdGhpcy5pbml0aWFsaXplQmluZGluZ3ModGhpcy5kaXJlY3RpdmUsIG5hbWUpO1xuXG4gICAgLy8gV2UgYXNrIGZvciB0aGUgQW5ndWxhckpTIHNjb3BlIGZyb20gdGhlIEFuZ3VsYXIgaW5qZWN0b3IsIHNpbmNlXG4gICAgLy8gd2Ugd2lsbCBwdXQgdGhlIG5ldyBjb21wb25lbnQgc2NvcGUgb250byB0aGUgbmV3IGluamVjdG9yIGZvciBlYWNoIGNvbXBvbmVudFxuICAgIGNvbnN0ICRwYXJlbnRTY29wZSA9IGluamVjdG9yLmdldCgkU0NPUEUpO1xuICAgIC8vIFFVRVNUSU9OIDE6IFNob3VsZCB3ZSBjcmVhdGUgYW4gaXNvbGF0ZWQgc2NvcGUgaWYgdGhlIHNjb3BlIGlzIG9ubHkgdHJ1ZT9cbiAgICAvLyBRVUVTVElPTiAyOiBTaG91bGQgd2UgbWFrZSB0aGUgc2NvcGUgYWNjZXNzaWJsZSB0aHJvdWdoIGAkZWxlbWVudC5zY29wZSgpL2lzb2xhdGVTY29wZSgpYD9cbiAgICB0aGlzLiRjb21wb25lbnRTY29wZSA9ICRwYXJlbnRTY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplT3V0cHV0cygpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gQ29sbGVjdCBjb250ZW50cywgaW5zZXJ0IGFuZCBjb21waWxlIHRlbXBsYXRlXG4gICAgY29uc3QgYXR0YWNoQ2hpbGROb2RlczogSUxpbmtGbnx1bmRlZmluZWQgPSB0aGlzLmhlbHBlci5wcmVwYXJlVHJhbnNjbHVzaW9uKCk7XG4gICAgY29uc3QgbGlua0ZuID0gdGhpcy5oZWxwZXIuY29tcGlsZVRlbXBsYXRlKCk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGxldCBjb250cm9sbGVySW5zdGFuY2UgPSBjb250cm9sbGVyVHlwZSA/XG4gICAgICAgIHRoaXMuaGVscGVyLmJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgdGhpcy4kY29tcG9uZW50U2NvcGUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIGxldCBiaW5kaW5nRGVzdGluYXRpb246IElCaW5kaW5nRGVzdGluYXRpb247XG5cbiAgICBpZiAoIWJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIGJpbmRpbmdEZXN0aW5hdGlvbiA9IHRoaXMuJGNvbXBvbmVudFNjb3BlO1xuICAgIH0gZWxzZSBpZiAoY29udHJvbGxlclR5cGUgJiYgY29udHJvbGxlckluc3RhbmNlKSB7XG4gICAgICBiaW5kaW5nRGVzdGluYXRpb24gPSBjb250cm9sbGVySW5zdGFuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVXBncmFkZWQgZGlyZWN0aXZlICcke1xuICAgICAgICAgIHRoaXMuZGlyZWN0aXZlLm5hbWV9JyBzcGVjaWZpZXMgJ2JpbmRUb0NvbnRyb2xsZXInIGJ1dCBubyBjb250cm9sbGVyLmApO1xuICAgIH1cbiAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA9IGNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgICB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbiA9IGJpbmRpbmdEZXN0aW5hdGlvbjtcblxuICAgIC8vIFNldCB1cCBvdXRwdXRzXG4gICAgdGhpcy5iaW5kT3V0cHV0cyhiaW5kaW5nRGVzdGluYXRpb24pO1xuXG4gICAgLy8gUmVxdWlyZSBvdGhlciBjb250cm9sbGVyc1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPSB0aGlzLmhlbHBlci5yZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnMoY29udHJvbGxlckluc3RhbmNlKTtcblxuICAgIC8vIEhvb2s6ICRvbkNoYW5nZXNcbiAgICBpZiAodGhpcy5wZW5kaW5nQ2hhbmdlcykge1xuICAgICAgdGhpcy5mb3J3YXJkQ2hhbmdlcyh0aGlzLnBlbmRpbmdDaGFuZ2VzLCBiaW5kaW5nRGVzdGluYXRpb24pO1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJG9uSW5pdFxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJGRvQ2hlY2tcbiAgICBpZiAoY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24oY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKSkge1xuICAgICAgY29uc3QgY2FsbERvQ2hlY2sgPSAoKSA9PiBjb250cm9sbGVySW5zdGFuY2U/LiRkb0NoZWNrPy4oKTtcblxuICAgICAgdGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIgPSB0aGlzLiRjb21wb25lbnRTY29wZS4kcGFyZW50LiR3YXRjaChjYWxsRG9DaGVjayk7XG4gICAgICBjYWxsRG9DaGVjaygpO1xuICAgIH1cblxuICAgIC8vIExpbmtpbmdcbiAgICBjb25zdCBsaW5rID0gdGhpcy5kaXJlY3RpdmUubGluaztcbiAgICBjb25zdCBwcmVMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgJiYgbGluay5wcmU7XG4gICAgY29uc3QgcG9zdExpbmsgPSB0eXBlb2YgbGluayA9PSAnb2JqZWN0JyA/IGxpbmsucG9zdCA6IGxpbms7XG4gICAgY29uc3QgYXR0cnM6IElBdHRyaWJ1dGVzID0gTk9UX1NVUFBPUlRFRDtcbiAgICBjb25zdCB0cmFuc2NsdWRlRm46IElUcmFuc2NsdWRlRnVuY3Rpb24gPSBOT1RfU1VQUE9SVEVEO1xuICAgIGlmIChwcmVMaW5rKSB7XG4gICAgICBwcmVMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy4kY29tcG9uZW50U2NvcGUsIG51bGwhLCB7cGFyZW50Qm91bmRUcmFuc2NsdWRlRm46IGF0dGFjaENoaWxkTm9kZXN9KTtcblxuICAgIGlmIChwb3N0TGluaykge1xuICAgICAgcG9zdExpbmsodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRwb3N0TGlua1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAoIXRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uKSB7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gY2hhbmdlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb3J3YXJkQ2hhbmdlcyhjaGFuZ2VzLCB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbik7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGNvbnN0IHR3b1dheUJvdW5kUHJvcGVydGllcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzO1xuICAgIGNvbnN0IHR3b1dheUJvdW5kTGFzdFZhbHVlcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRMYXN0VmFsdWVzO1xuICAgIGNvbnN0IHByb3BlcnR5VG9PdXRwdXRNYXAgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXA7XG5cbiAgICB0d29XYXlCb3VuZFByb3BlcnRpZXMuZm9yRWFjaCgocHJvcE5hbWUsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbj8uW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IG9sZFZhbHVlID0gdHdvV2F5Qm91bmRMYXN0VmFsdWVzW2lkeF07XG5cbiAgICAgIGlmICghT2JqZWN0LmlzKG5ld1ZhbHVlLCBvbGRWYWx1ZSkpIHtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChuZXdWYWx1ZSk7XG4gICAgICAgIHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdID0gbmV3VmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcikpIHtcbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyKCk7XG4gICAgfVxuICAgIHRoaXMuaGVscGVyLm9uRGVzdHJveSh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplQmluZGluZ3MoZGlyZWN0aXZlOiBJRGlyZWN0aXZlLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBidGNJc09iamVjdCA9IHR5cGVvZiBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA9PT0gJ29iamVjdCc7XG4gICAgaWYgKGJ0Y0lzT2JqZWN0ICYmIE9iamVjdC5rZXlzKGRpcmVjdGl2ZS5zY29wZSEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gYnRjSXNPYmplY3QgPyBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA6IGRpcmVjdGl2ZS5zY29wZTtcbiAgICBjb25zdCBiaW5kaW5ncyA9IG5ldyBCaW5kaW5ncygpO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgc3dpdGNoIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLiBUaGV5IHdpbGwgYmUgZGVmaW5lZCBhcyBpbnB1dHMgb24gdGhlXG4gICAgICAgICAgICAvLyB1cGdyYWRlZCBjb21wb25lbnQgZmFjYWRlIGFuZCB0aGUgY2hhbmdlIHByb3BhZ2F0aW9uIHdpbGwgYmUgaGFuZGxlZCBieVxuICAgICAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZExhc3RWYWx1ZXMucHVzaChJTklUSUFMX1ZBTFVFKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWUgKyAnQ2hhbmdlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke25hbWV9JyBkaXJlY3RpdmUuYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBiaW5kaW5ncztcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZU91dHB1dHMoKSB7XG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgb3V0cHV0cyBmb3IgYD1gIGFuZCBgJmAgYmluZGluZ3NcbiAgICB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcy5jb25jYXQodGhpcy5iaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzKVxuICAgICAgICAuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICAgICAgKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGJpbmRPdXRwdXRzKGJpbmRpbmdEZXN0aW5hdGlvbjogSUJpbmRpbmdEZXN0aW5hdGlvbikge1xuICAgIC8vIEJpbmQgYCZgIGJpbmRpbmdzIHRvIHRoZSBjb3JyZXNwb25kaW5nIG91dHB1dHNcbiAgICB0aGlzLmJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICBjb25zdCBvdXRwdXROYW1lID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IGVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXSA9ICh2YWx1ZTogYW55KSA9PiBlbWl0dGVyLmVtaXQodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3J3YXJkQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLCBiaW5kaW5nRGVzdGluYXRpb246IElCaW5kaW5nRGVzdGluYXRpb24pIHtcbiAgICAvLyBGb3J3YXJkIGlucHV0IGNoYW5nZXMgdG8gYGJpbmRpbmdEZXN0aW5hdGlvbmBcbiAgICBPYmplY3Qua2V5cyhjaGFuZ2VzKS5mb3JFYWNoKFxuICAgICAgICBwcm9wTmFtZSA9PiBiaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gY2hhbmdlc1twcm9wTmFtZV0uY3VycmVudFZhbHVlKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGJpbmRpbmdEZXN0aW5hdGlvbi4kb25DaGFuZ2VzKSkge1xuICAgICAgYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG59XG4iXX0=