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
            const callDoCheck = () => this.controllerInstance.$doCheck();
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
            this.forwardChanges(changes);
        }
    }
    ngDoCheck() {
        const twoWayBoundProperties = this.bindings.twoWayBoundProperties;
        const twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
        const propertyToOutputMap = this.bindings.propertyToOutputMap;
        twoWayBoundProperties.forEach((propName, idx) => {
            const newValue = this.bindingDestination[propName];
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
    initializeBindings(directive) {
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
                        throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
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
    bindOutputs() {
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach(propName => {
            const outputName = this.bindings.propertyToOutputMap[propName];
            const emitter = this[outputName];
            this.bindingDestination[propName] = (value) => emitter.emit(value);
        });
    }
    forwardChanges(changes) {
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach(propName => this.bindingDestination[propName] = changes[propName].currentValue);
        if (isFunction(this.bindingDestination.$onChanges)) {
            this.bindingDestination.$onChanges(changes);
        }
    }
}
UpgradeComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.6+19.sha-3ad033c", ngImport: i0, type: UpgradeComponent, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive });
UpgradeComponent.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "14.0.0-next.6+19.sha-3ad033c", type: UpgradeComponent, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.6+19.sha-3ad033c", ngImport: i0, type: UpgradeComponent, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: undefined }, { type: i0.ElementRef }, { type: i0.Injector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBOEMsTUFBTSxlQUFlLENBQUM7QUFHbEksT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3RELE9BQU8sRUFBMkMsYUFBYSxFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDNUcsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDJCQUEyQixDQUFDOztBQUVyRCxNQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFDM0MsTUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsTUFBTSxRQUFRO0lBQWQ7UUFDRSwwQkFBcUIsR0FBYSxFQUFFLENBQUM7UUFDckMsMEJBQXFCLEdBQVUsRUFBRSxDQUFDO1FBRWxDLDhCQUF5QixHQUFhLEVBQUUsQ0FBQztRQUV6Qyx3QkFBbUIsR0FBaUMsRUFBRSxDQUFDO0lBQ3pELENBQUM7Q0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Q0c7QUFFSCxNQUFNLE9BQU8sZ0JBQWdCO0lBMEIzQjs7Ozs7Ozs7OztPQVVHO0lBQ0gsWUFBb0IsSUFBWSxFQUFVLFVBQXNCLEVBQVUsUUFBa0I7UUFBeEUsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFVLGVBQVUsR0FBVixVQUFVLENBQVk7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQzFGLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztR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QyxnREFBZ0Q7UUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQ3hCLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVwRixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDbEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM3QztJQUNILENBQUM7O3dIQW5PVSxnQkFBZ0I7NEdBQWhCLGdCQUFnQjtzR0FBaEIsZ0JBQWdCO2tCQUQ1QixTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdG9yLCBPbkNoYW5nZXMsIE9uRGVzdHJveSwgT25Jbml0LCBTaW1wbGVDaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJQXR0cmlidXRlcywgSUF1Z21lbnRlZEpRdWVyeSwgSURpcmVjdGl2ZSwgSUluamVjdG9yU2VydmljZSwgSUxpbmtGbiwgSVNjb3BlLCBJVHJhbnNjbHVkZUZ1bmN0aW9ufSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7SUJpbmRpbmdEZXN0aW5hdGlvbiwgSUNvbnRyb2xsZXJJbnN0YW5jZSwgVXBncmFkZUhlbHBlcn0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvdXBncmFkZV9oZWxwZXInO1xuaW1wb3J0IHtpc0Z1bmN0aW9ufSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy91dGlsJztcblxuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmNsYXNzIEJpbmRpbmdzIHtcbiAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICB0d29XYXlCb3VuZExhc3RWYWx1ZXM6IGFueVtdID0gW107XG5cbiAgZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblxuICBwcm9wZXJ0eVRvT3V0cHV0TWFwOiB7W3Byb3BOYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgY2xhc3MgdGhhdCBhbGxvd3MgYW4gQW5ndWxhckpTIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhci5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFPVCBjb21waWxhdGlvbi4qXG4gKlxuICogVGhpcyBoZWxwZXIgY2xhc3Mgc2hvdWxkIGJlIHVzZWQgYXMgYSBiYXNlIGNsYXNzIGZvciBjcmVhdGluZyBBbmd1bGFyIGRpcmVjdGl2ZXNcbiAqIHRoYXQgd3JhcCBBbmd1bGFySlMgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgXCJ1cGdyYWRlZFwiLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBMZXQncyBhc3N1bWUgdGhhdCB5b3UgaGF2ZSBhbiBBbmd1bGFySlMgY29tcG9uZW50IGNhbGxlZCBgbmcxSGVyb2AgdGhhdCBuZWVkc1xuICogdG8gYmUgbWFkZSBhdmFpbGFibGUgaW4gQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYSBgRGlyZWN0aXZlYCB0aGF0IHdpbGwgbWFrZSB0aGlzIEFuZ3VsYXJKUyBjb21wb25lbnRcbiAqIGF2YWlsYWJsZSBpbnNpZGUgQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIn1cbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUgeW91IGNhbiBzZWUgdGhhdCB3ZSBtdXN0IGRlcml2ZSBmcm9tIHRoZSBgVXBncmFkZUNvbXBvbmVudGBcbiAqIGJhc2UgY2xhc3MgYnV0IGFsc28gcHJvdmlkZSBhbiB7QGxpbmsgRGlyZWN0aXZlIGBARGlyZWN0aXZlYH0gZGVjb3JhdG9yLiBUaGlzIGlzXG4gKiBiZWNhdXNlIHRoZSBBT1QgY29tcGlsZXIgcmVxdWlyZXMgdGhhdCB0aGlzIGluZm9ybWF0aW9uIGlzIHN0YXRpY2FsbHkgYXZhaWxhYmxlIGF0XG4gKiBjb21waWxlIHRpbWUuXG4gKlxuICogTm90ZSB0aGF0IHdlIG11c3QgZG8gdGhlIGZvbGxvd2luZzpcbiAqICogc3BlY2lmeSB0aGUgZGlyZWN0aXZlJ3Mgc2VsZWN0b3IgKGBuZzEtaGVyb2ApXG4gKiAqIHNwZWNpZnkgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyB0aGF0IHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGV4cGVjdHNcbiAqICogZGVyaXZlIGZyb20gYFVwZ3JhZGVDb21wb25lbnRgXG4gKiAqIGNhbGwgdGhlIGJhc2UgY2xhc3MgZnJvbSB0aGUgY29uc3RydWN0b3IsIHBhc3NpbmdcbiAqICAgKiB0aGUgQW5ndWxhckpTIG5hbWUgb2YgdGhlIGNvbXBvbmVudCAoYG5nMUhlcm9gKVxuICogICAqIHRoZSBgRWxlbWVudFJlZmAgYW5kIGBJbmplY3RvcmAgZm9yIHRoZSBjb21wb25lbnQgd3JhcHBlclxuICpcbiAqIEBwdWJsaWNBcGlcbiAqIEBleHRlbnNpYmxlXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjaywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBoZWxwZXI6IFVwZ3JhZGVIZWxwZXI7XG5cbiAgcHJpdmF0ZSAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2U7XG5cbiAgcHJpdmF0ZSBlbGVtZW50OiBFbGVtZW50O1xuICBwcml2YXRlICRlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5O1xuICBwcml2YXRlICRjb21wb25lbnRTY29wZTogSVNjb3BlO1xuXG4gIHByaXZhdGUgZGlyZWN0aXZlOiBJRGlyZWN0aXZlO1xuICBwcml2YXRlIGJpbmRpbmdzOiBCaW5kaW5ncztcblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBjb250cm9sbGVySW5zdGFuY2UhOiBJQ29udHJvbGxlckluc3RhbmNlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBiaW5kaW5nRGVzdGluYXRpb24hOiBJQmluZGluZ0Rlc3RpbmF0aW9uO1xuXG4gIC8vIFdlIHdpbGwgYmUgaW5zdGFudGlhdGluZyB0aGUgY29udHJvbGxlciBpbiB0aGUgYG5nT25Jbml0YCBob29rLCB3aGVuIHRoZVxuICAvLyBmaXJzdCBgbmdPbkNoYW5nZXNgIHdpbGwgaGF2ZSBiZWVuIGFscmVhZHkgdHJpZ2dlcmVkLiBXZSBzdG9yZSB0aGVcbiAgLy8gYFNpbXBsZUNoYW5nZXNgIGFuZCBcInBsYXkgdGhlbSBiYWNrXCIgbGF0ZXIuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHBlbmRpbmdDaGFuZ2VzITogU2ltcGxlQ2hhbmdlc3xudWxsO1xuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIHVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlciE6IEZ1bmN0aW9uO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFVwZ3JhZGVDb21wb25lbnRgIGluc3RhbmNlLiBZb3Ugc2hvdWxkIG5vdCBub3JtYWxseSBuZWVkIHRvIGRvIHRoaXMuXG4gICAqIEluc3RlYWQgeW91IHNob3VsZCBkZXJpdmUgYSBuZXcgY2xhc3MgZnJvbSB0aGlzIG9uZSBhbmQgY2FsbCB0aGUgc3VwZXIgY29uc3RydWN0b3JcbiAgICogZnJvbSB0aGUgYmFzZSBjbGFzcy5cbiAgICpcbiAgICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIiB9XG4gICAqXG4gICAqICogVGhlIGBuYW1lYCBwYXJhbWV0ZXIgc2hvdWxkIGJlIHRoZSBuYW1lIG9mIHRoZSBBbmd1bGFySlMgZGlyZWN0aXZlLlxuICAgKiAqIFRoZSBgZWxlbWVudFJlZmAgYW5kIGBpbmplY3RvcmAgcGFyYW1ldGVycyBzaG91bGQgYmUgYWNxdWlyZWQgZnJvbSBBbmd1bGFyIGJ5IGRlcGVuZGVuY3lcbiAgICogICBpbmplY3Rpb24gaW50byB0aGUgYmFzZSBjbGFzcyBjb25zdHJ1Y3Rvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbmFtZTogc3RyaW5nLCBwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5oZWxwZXIgPSBuZXcgVXBncmFkZUhlbHBlcihpbmplY3RvciwgbmFtZSwgZWxlbWVudFJlZik7XG5cbiAgICB0aGlzLiRpbmplY3RvciA9IHRoaXMuaGVscGVyLiRpbmplY3RvcjtcblxuICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuaGVscGVyLmVsZW1lbnQ7XG4gICAgdGhpcy4kZWxlbWVudCA9IHRoaXMuaGVscGVyLiRlbGVtZW50O1xuXG4gICAgdGhpcy5kaXJlY3RpdmUgPSB0aGlzLmhlbHBlci5kaXJlY3RpdmU7XG4gICAgdGhpcy5iaW5kaW5ncyA9IHRoaXMuaW5pdGlhbGl6ZUJpbmRpbmdzKHRoaXMuZGlyZWN0aXZlKTtcblxuICAgIC8vIFdlIGFzayBmb3IgdGhlIEFuZ3VsYXJKUyBzY29wZSBmcm9tIHRoZSBBbmd1bGFyIGluamVjdG9yLCBzaW5jZVxuICAgIC8vIHdlIHdpbGwgcHV0IHRoZSBuZXcgY29tcG9uZW50IHNjb3BlIG9udG8gdGhlIG5ldyBpbmplY3RvciBmb3IgZWFjaCBjb21wb25lbnRcbiAgICBjb25zdCAkcGFyZW50U2NvcGUgPSBpbmplY3Rvci5nZXQoJFNDT1BFKTtcbiAgICAvLyBRVUVTVElPTiAxOiBTaG91bGQgd2UgY3JlYXRlIGFuIGlzb2xhdGVkIHNjb3BlIGlmIHRoZSBzY29wZSBpcyBvbmx5IHRydWU/XG4gICAgLy8gUVVFU1RJT04gMjogU2hvdWxkIHdlIG1ha2UgdGhlIHNjb3BlIGFjY2Vzc2libGUgdGhyb3VnaCBgJGVsZW1lbnQuc2NvcGUoKS9pc29sYXRlU2NvcGUoKWA/XG4gICAgdGhpcy4kY29tcG9uZW50U2NvcGUgPSAkcGFyZW50U2NvcGUuJG5ldyghIXRoaXMuZGlyZWN0aXZlLnNjb3BlKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZU91dHB1dHMoKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIENvbGxlY3QgY29udGVudHMsIGluc2VydCBhbmQgY29tcGlsZSB0ZW1wbGF0ZVxuICAgIGNvbnN0IGF0dGFjaENoaWxkTm9kZXM6IElMaW5rRm58dW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSgpO1xuXG4gICAgLy8gSW5zdGFudGlhdGUgY29udHJvbGxlclxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICBjb25zdCBiaW5kVG9Db250cm9sbGVyID0gdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlcjtcbiAgICBpZiAoY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLiRjb21wb25lbnRTY29wZSk7XG4gICAgfSBlbHNlIGlmIChiaW5kVG9Db250cm9sbGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHtcbiAgICAgICAgICB0aGlzLmRpcmVjdGl2ZS5uYW1lfScgc3BlY2lmaWVzICdiaW5kVG9Db250cm9sbGVyJyBidXQgbm8gY29udHJvbGxlci5gKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdXAgb3V0cHV0c1xuICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uID0gYmluZFRvQ29udHJvbGxlciA/IHRoaXMuY29udHJvbGxlckluc3RhbmNlIDogdGhpcy4kY29tcG9uZW50U2NvcGU7XG4gICAgdGhpcy5iaW5kT3V0cHV0cygpO1xuXG4gICAgLy8gUmVxdWlyZSBvdGhlciBjb250cm9sbGVyc1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPVxuICAgICAgICB0aGlzLmhlbHBlci5yZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnModGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuXG4gICAgLy8gSG9vazogJG9uQ2hhbmdlc1xuICAgIGlmICh0aGlzLnBlbmRpbmdDaGFuZ2VzKSB7XG4gICAgICB0aGlzLmZvcndhcmRDaGFuZ2VzKHRoaXMucGVuZGluZ0NoYW5nZXMpO1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJG9uSW5pdFxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJGRvQ2hlY2tcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaykpIHtcbiAgICAgIGNvbnN0IGNhbGxEb0NoZWNrID0gKCkgPT4gdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2shKCk7XG5cbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyID0gdGhpcy4kY29tcG9uZW50U2NvcGUuJHBhcmVudC4kd2F0Y2goY2FsbERvQ2hlY2spO1xuICAgICAgY2FsbERvQ2hlY2soKTtcbiAgICB9XG5cbiAgICAvLyBMaW5raW5nXG4gICAgY29uc3QgbGluayA9IHRoaXMuZGlyZWN0aXZlLmxpbms7XG4gICAgY29uc3QgcHJlTGluayA9IHR5cGVvZiBsaW5rID09ICdvYmplY3QnICYmIGxpbmsucHJlO1xuICAgIGNvbnN0IHBvc3RMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgPyBsaW5rLnBvc3QgOiBsaW5rO1xuICAgIGNvbnN0IGF0dHJzOiBJQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBJVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgbGlua0ZuKHRoaXMuJGNvbXBvbmVudFNjb3BlLCBudWxsISwge3BhcmVudEJvdW5kVHJhbnNjbHVkZUZuOiBhdHRhY2hDaGlsZE5vZGVzfSk7XG5cbiAgICBpZiAocG9zdExpbmspIHtcbiAgICAgIHBvc3RMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkcG9zdExpbmtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmspKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmsoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKCF0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbikge1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IGNoYW5nZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9yd2FyZENoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGNvbnN0IHR3b1dheUJvdW5kUHJvcGVydGllcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzO1xuICAgIGNvbnN0IHR3b1dheUJvdW5kTGFzdFZhbHVlcyA9IHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRMYXN0VmFsdWVzO1xuICAgIGNvbnN0IHByb3BlcnR5VG9PdXRwdXRNYXAgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXA7XG5cbiAgICB0d29XYXlCb3VuZFByb3BlcnRpZXMuZm9yRWFjaCgocHJvcE5hbWUsIGlkeCkgPT4ge1xuICAgICAgY29uc3QgbmV3VmFsdWUgPSB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV07XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdO1xuXG4gICAgICBpZiAoIU9iamVjdC5pcyhuZXdWYWx1ZSwgb2xkVmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSBwcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV07XG5cbiAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQobmV3VmFsdWUpO1xuICAgICAgICB0d29XYXlCb3VuZExhc3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIpKSB7XG4gICAgICB0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcigpO1xuICAgIH1cbiAgICB0aGlzLmhlbHBlci5vbkRlc3Ryb3kodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUJpbmRpbmdzKGRpcmVjdGl2ZTogSURpcmVjdGl2ZSkge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIGRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXMoZGlyZWN0aXZlLnNjb3BlISkubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEJpbmRpbmcgZGVmaW5pdGlvbnMgb24gc2NvcGUgYW5kIGNvbnRyb2xsZXIgYXQgdGhlIHNhbWUgdGltZSBpcyBub3Qgc3VwcG9ydGVkLmApO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRleHQgPSBidGNJc09iamVjdCA/IGRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyIDogZGlyZWN0aXZlLnNjb3BlO1xuICAgIGNvbnN0IGJpbmRpbmdzID0gbmV3IEJpbmRpbmdzKCk7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHQgPT0gJ29iamVjdCcpIHtcbiAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQpLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gY29udGV4dFtwcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gZGVmaW5pdGlvbi5jaGFyQXQoMCk7XG5cbiAgICAgICAgLy8gUVVFU1RJT046IFdoYXQgYWJvdXQgYD0qYD8gSWdub3JlPyBUaHJvdz8gU3VwcG9ydD9cblxuICAgICAgICBzd2l0Y2ggKGJpbmRpbmdUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIHNwZWNpYWwuIFRoZXkgd2lsbCBiZSBkZWZpbmVkIGFzIGlucHV0cyBvbiB0aGVcbiAgICAgICAgICAgIC8vIHVwZ3JhZGVkIGNvbXBvbmVudCBmYWNhZGUgYW5kIHRoZSBjaGFuZ2UgcHJvcGFnYXRpb24gd2lsbCBiZSBoYW5kbGVkIGJ5XG4gICAgICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIGJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnR3b1dheUJvdW5kTGFzdFZhbHVlcy5wdXNoKElOSVRJQUxfVkFMVUUpO1xuICAgICAgICAgICAgYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV0gPSBwcm9wTmFtZSArICdDaGFuZ2UnO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICBiaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgICAgYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZXQganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIG1hcHBpbmcgJyR7YmluZGluZ1R5cGV9JyBpbiAnJHtqc29ufScgaW4gJyR7dGhpcy5uYW1lfScgZGlyZWN0aXZlLmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmluZGluZ3M7XG4gIH1cblxuICBwcml2YXRlIGluaXRpYWxpemVPdXRwdXRzKCkge1xuICAgIC8vIEluaXRpYWxpemUgdGhlIG91dHB1dHMgZm9yIGA9YCBhbmQgYCZgIGJpbmRpbmdzXG4gICAgdGhpcy5iaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXMuY29uY2F0KHRoaXMuYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcylcbiAgICAgICAgLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgICAgICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV0gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBiaW5kT3V0cHV0cygpIHtcbiAgICAvLyBCaW5kIGAmYCBiaW5kaW5ncyB0byB0aGUgY29ycmVzcG9uZGluZyBvdXRwdXRzXG4gICAgdGhpcy5iaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICBjb25zdCBlbWl0dGVyID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgdGhpcy5iaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gKHZhbHVlOiBhbnkpID0+IGVtaXR0ZXIuZW1pdCh2YWx1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGZvcndhcmRDaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICAvLyBGb3J3YXJkIGlucHV0IGNoYW5nZXMgdG8gYGJpbmRpbmdEZXN0aW5hdGlvbmBcbiAgICBPYmplY3Qua2V5cyhjaGFuZ2VzKS5mb3JFYWNoKFxuICAgICAgICBwcm9wTmFtZSA9PiB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV0gPSBjaGFuZ2VzW3Byb3BOYW1lXS5jdXJyZW50VmFsdWUpO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24odGhpcy5iaW5kaW5nRGVzdGluYXRpb24uJG9uQ2hhbmdlcykpIHtcbiAgICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG59XG4iXX0=