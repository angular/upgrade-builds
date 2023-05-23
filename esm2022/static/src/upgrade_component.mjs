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
    /** @nodoc */
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.0-next.1+sha-c464b01", ngImport: i0, type: UpgradeComponent, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "16.1.0-next.1+sha-c464b01", type: UpgradeComponent, usesOnChanges: true, ngImport: i0 }); }
}
export { UpgradeComponent };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.0-next.1+sha-c464b01", ngImport: i0, type: UpgradeComponent, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: undefined }, { type: i0.ElementRef }, { type: i0.Injector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBOEMsTUFBTSxlQUFlLENBQUM7QUFHbEksT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3RELE9BQU8sRUFBMkMsYUFBYSxFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDNUcsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDJCQUEyQixDQUFDOztBQUVyRCxNQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFDM0MsTUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsTUFBTSxRQUFRO0lBQWQ7UUFDRSwwQkFBcUIsR0FBYSxFQUFFLENBQUM7UUFDckMsMEJBQXFCLEdBQVUsRUFBRSxDQUFDO1FBRWxDLDhCQUF5QixHQUFhLEVBQUUsQ0FBQztRQUV6Qyx3QkFBbUIsR0FBaUMsRUFBRSxDQUFDO0lBQ3pELENBQUM7Q0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Q0c7QUFDSCxNQUNhLGdCQUFnQjtJQW1CM0I7Ozs7Ozs7Ozs7T0FVRztJQUNILFlBQVksSUFBWSxFQUFFLFVBQXNCLEVBQUUsUUFBa0I7UUFsQnBFLDJFQUEyRTtRQUMzRSxxRUFBcUU7UUFDckUsOENBQThDO1FBQ3RDLG1CQUFjLEdBQXVCLElBQUksQ0FBQztRQWdCaEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTVELElBQUksQ0FB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QUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVPLGNBQWMsQ0FBQyxPQUFzQixFQUFFLGtCQUF1QztRQUNwRixnREFBZ0Q7UUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQ3hCLFFBQVEsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRS9FLElBQUksVUFBVSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN4QztJQUNILENBQUM7eUhBcE9VLGdCQUFnQjs2R0FBaEIsZ0JBQWdCOztTQUFoQixnQkFBZ0I7c0dBQWhCLGdCQUFnQjtrQkFENUIsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3RvciwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgU2ltcGxlQ2hhbmdlc30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SUF0dHJpYnV0ZXMsIElBdWdtZW50ZWRKUXVlcnksIElEaXJlY3RpdmUsIElJbmplY3RvclNlcnZpY2UsIElMaW5rRm4sIElTY29wZSwgSVRyYW5zY2x1ZGVGdW5jdGlvbn0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvYW5ndWxhcjEnO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4uLy4uL3NyYy9jb21tb24vc3JjL2NvbnN0YW50cyc7XG5pbXBvcnQge0lCaW5kaW5nRGVzdGluYXRpb24sIElDb250cm9sbGVySW5zdGFuY2UsIFVwZ3JhZGVIZWxwZXJ9IGZyb20gJy4uLy4uL3NyYy9jb21tb24vc3JjL3VwZ3JhZGVfaGVscGVyJztcbmltcG9ydCB7aXNGdW5jdGlvbn0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvdXRpbCc7XG5cbmNvbnN0IE5PVF9TVVBQT1JURUQ6IGFueSA9ICdOT1RfU1VQUE9SVEVEJztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuXG5jbGFzcyBCaW5kaW5ncyB7XG4gIHR3b1dheUJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgdHdvV2F5Qm91bmRMYXN0VmFsdWVzOiBhbnlbXSA9IFtdO1xuXG4gIGV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cbiAgcHJvcGVydHlUb091dHB1dE1hcDoge1twcm9wTmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGNsYXNzIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXIuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBT1QgY29tcGlsYXRpb24uKlxuICpcbiAqIFRoaXMgaGVscGVyIGNsYXNzIHNob3VsZCBiZSB1c2VkIGFzIGEgYmFzZSBjbGFzcyBmb3IgY3JlYXRpbmcgQW5ndWxhciBkaXJlY3RpdmVzXG4gKiB0aGF0IHdyYXAgQW5ndWxhckpTIGNvbXBvbmVudHMgdGhhdCBuZWVkIHRvIGJlIFwidXBncmFkZWRcIi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogTGV0J3MgYXNzdW1lIHRoYXQgeW91IGhhdmUgYW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYWxsZWQgYG5nMUhlcm9gIHRoYXQgbmVlZHNcbiAqIHRvIGJlIG1hZGUgYXZhaWxhYmxlIGluIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyb1wifVxuICpcbiAqIFdlIG11c3QgY3JlYXRlIGEgYERpcmVjdGl2ZWAgdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFySlMgY29tcG9uZW50XG4gKiBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXIgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyby13cmFwcGVyXCJ9XG4gKlxuICogSW4gdGhpcyBleGFtcGxlIHlvdSBjYW4gc2VlIHRoYXQgd2UgbXVzdCBkZXJpdmUgZnJvbSB0aGUgYFVwZ3JhZGVDb21wb25lbnRgXG4gKiBiYXNlIGNsYXNzIGJ1dCBhbHNvIHByb3ZpZGUgYW4ge0BsaW5rIERpcmVjdGl2ZSBgQERpcmVjdGl2ZWB9IGRlY29yYXRvci4gVGhpcyBpc1xuICogYmVjYXVzZSB0aGUgQU9UIGNvbXBpbGVyIHJlcXVpcmVzIHRoYXQgdGhpcyBpbmZvcm1hdGlvbiBpcyBzdGF0aWNhbGx5IGF2YWlsYWJsZSBhdFxuICogY29tcGlsZSB0aW1lLlxuICpcbiAqIE5vdGUgdGhhdCB3ZSBtdXN0IGRvIHRoZSBmb2xsb3dpbmc6XG4gKiAqIHNwZWNpZnkgdGhlIGRpcmVjdGl2ZSdzIHNlbGVjdG9yIChgbmcxLWhlcm9gKVxuICogKiBzcGVjaWZ5IGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgdGhhdCB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBleHBlY3RzXG4gKiAqIGRlcml2ZSBmcm9tIGBVcGdyYWRlQ29tcG9uZW50YFxuICogKiBjYWxsIHRoZSBiYXNlIGNsYXNzIGZyb20gdGhlIGNvbnN0cnVjdG9yLCBwYXNzaW5nXG4gKiAgICogdGhlIEFuZ3VsYXJKUyBuYW1lIG9mIHRoZSBjb21wb25lbnQgKGBuZzFIZXJvYClcbiAqICAgKiB0aGUgYEVsZW1lbnRSZWZgIGFuZCBgSW5qZWN0b3JgIGZvciB0aGUgY29tcG9uZW50IHdyYXBwZXJcbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZXh0ZW5zaWJsZVxuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBjbGFzcyBVcGdyYWRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgaGVscGVyOiBVcGdyYWRlSGVscGVyO1xuXG4gIHByaXZhdGUgJGVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnk7XG4gIHByaXZhdGUgJGNvbXBvbmVudFNjb3BlOiBJU2NvcGU7XG5cbiAgcHJpdmF0ZSBkaXJlY3RpdmU6IElEaXJlY3RpdmU7XG4gIHByaXZhdGUgYmluZGluZ3M6IEJpbmRpbmdzO1xuXG4gIHByaXZhdGUgY29udHJvbGxlckluc3RhbmNlPzogSUNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgcHJpdmF0ZSBiaW5kaW5nRGVzdGluYXRpb24/OiBJQmluZGluZ0Rlc3RpbmF0aW9uO1xuXG4gIC8vIFdlIHdpbGwgYmUgaW5zdGFudGlhdGluZyB0aGUgY29udHJvbGxlciBpbiB0aGUgYG5nT25Jbml0YCBob29rLCB3aGVuIHRoZVxuICAvLyBmaXJzdCBgbmdPbkNoYW5nZXNgIHdpbGwgaGF2ZSBiZWVuIGFscmVhZHkgdHJpZ2dlcmVkLiBXZSBzdG9yZSB0aGVcbiAgLy8gYFNpbXBsZUNoYW5nZXNgIGFuZCBcInBsYXkgdGhlbSBiYWNrXCIgbGF0ZXIuXG4gIHByaXZhdGUgcGVuZGluZ0NoYW5nZXM6IFNpbXBsZUNoYW5nZXN8bnVsbCA9IG51bGw7XG5cbiAgcHJpdmF0ZSB1bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXI/OiBGdW5jdGlvbjtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBVcGdyYWRlQ29tcG9uZW50YCBpbnN0YW5jZS4gWW91IHNob3VsZCBub3Qgbm9ybWFsbHkgbmVlZCB0byBkbyB0aGlzLlxuICAgKiBJbnN0ZWFkIHlvdSBzaG91bGQgZGVyaXZlIGEgbmV3IGNsYXNzIGZyb20gdGhpcyBvbmUgYW5kIGNhbGwgdGhlIHN1cGVyIGNvbnN0cnVjdG9yXG4gICAqIGZyb20gdGhlIGJhc2UgY2xhc3MuXG4gICAqXG4gICAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtaGVyby13cmFwcGVyXCIgfVxuICAgKlxuICAgKiAqIFRoZSBgbmFtZWAgcGFyYW1ldGVyIHNob3VsZCBiZSB0aGUgbmFtZSBvZiB0aGUgQW5ndWxhckpTIGRpcmVjdGl2ZS5cbiAgICogKiBUaGUgYGVsZW1lbnRSZWZgIGFuZCBgaW5qZWN0b3JgIHBhcmFtZXRlcnMgc2hvdWxkIGJlIGFjcXVpcmVkIGZyb20gQW5ndWxhciBieSBkZXBlbmRlbmN5XG4gICAqICAgaW5qZWN0aW9uIGludG8gdGhlIGJhc2UgY2xhc3MgY29uc3RydWN0b3IuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMuaGVscGVyID0gbmV3IFVwZ3JhZGVIZWxwZXIoaW5qZWN0b3IsIG5hbWUsIGVsZW1lbnRSZWYpO1xuXG4gICAgdGhpcy4kZWxlbWVudCA9IHRoaXMuaGVscGVyLiRlbGVtZW50O1xuXG4gICAgdGhpcy5kaXJlY3RpdmUgPSB0aGlzLmhlbHBlci5kaXJlY3RpdmU7XG4gICAgdGhpcy5iaW5kaW5ncyA9IHRoaXMuaW5pdGlhbGl6ZUJpbmRpbmdzKHRoaXMuZGlyZWN0aXZlLCBuYW1lKTtcblxuICAgIC8vIFdlIGFzayBmb3IgdGhlIEFuZ3VsYXJKUyBzY29wZSBmcm9tIHRoZSBBbmd1bGFyIGluamVjdG9yLCBzaW5jZVxuICAgIC8vIHdlIHdpbGwgcHV0IHRoZSBuZXcgY29tcG9uZW50IHNjb3BlIG9udG8gdGhlIG5ldyBpbmplY3RvciBmb3IgZWFjaCBjb21wb25lbnRcbiAgICBjb25zdCAkcGFyZW50U2NvcGUgPSBpbmplY3Rvci5nZXQoJFNDT1BFKTtcbiAgICAvLyBRVUVTVElPTiAxOiBTaG91bGQgd2UgY3JlYXRlIGFuIGlzb2xhdGVkIHNjb3BlIGlmIHRoZSBzY29wZSBpcyBvbmx5IHRydWU/XG4gICAgLy8gUVVFU1RJT04gMjogU2hvdWxkIHdlIG1ha2UgdGhlIHNjb3BlIGFjY2Vzc2libGUgdGhyb3VnaCBgJGVsZW1lbnQuc2NvcGUoKS9pc29sYXRlU2NvcGUoKWA/XG4gICAgdGhpcy4kY29tcG9uZW50U2NvcGUgPSAkcGFyZW50U2NvcGUuJG5ldyghIXRoaXMuZGlyZWN0aXZlLnNjb3BlKTtcblxuICAgIHRoaXMuaW5pdGlhbGl6ZU91dHB1dHMoKTtcbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gQ29sbGVjdCBjb250ZW50cywgaW5zZXJ0IGFuZCBjb21waWxlIHRlbXBsYXRlXG4gICAgY29uc3QgYXR0YWNoQ2hpbGROb2RlczogSUxpbmtGbnx1bmRlZmluZWQgPSB0aGlzLmhlbHBlci5wcmVwYXJlVHJhbnNjbHVzaW9uKCk7XG4gICAgY29uc3QgbGlua0ZuID0gdGhpcy5oZWxwZXIuY29tcGlsZVRlbXBsYXRlKCk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGxldCBjb250cm9sbGVySW5zdGFuY2UgPSBjb250cm9sbGVyVHlwZSA/XG4gICAgICAgIHRoaXMuaGVscGVyLmJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgdGhpcy4kY29tcG9uZW50U2NvcGUpIDpcbiAgICAgICAgdW5kZWZpbmVkO1xuICAgIGxldCBiaW5kaW5nRGVzdGluYXRpb246IElCaW5kaW5nRGVzdGluYXRpb247XG5cbiAgICBpZiAoIWJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIGJpbmRpbmdEZXN0aW5hdGlvbiA9IHRoaXMuJGNvbXBvbmVudFNjb3BlO1xuICAgIH0gZWxzZSBpZiAoY29udHJvbGxlclR5cGUgJiYgY29udHJvbGxlckluc3RhbmNlKSB7XG4gICAgICBiaW5kaW5nRGVzdGluYXRpb24gPSBjb250cm9sbGVySW5zdGFuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVXBncmFkZWQgZGlyZWN0aXZlICcke1xuICAgICAgICAgIHRoaXMuZGlyZWN0aXZlLm5hbWV9JyBzcGVjaWZpZXMgJ2JpbmRUb0NvbnRyb2xsZXInIGJ1dCBubyBjb250cm9sbGVyLmApO1xuICAgIH1cbiAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA9IGNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgICB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbiA9IGJpbmRpbmdEZXN0aW5hdGlvbjtcblxuICAgIC8vIFNldCB1cCBvdXRwdXRzXG4gICAgdGhpcy5iaW5kT3V0cHV0cyhiaW5kaW5nRGVzdGluYXRpb24pO1xuXG4gICAgLy8gUmVxdWlyZSBvdGhlciBjb250cm9sbGVyc1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPSB0aGlzLmhlbHBlci5yZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnMoY29udHJvbGxlckluc3RhbmNlKTtcblxuICAgIC8vIEhvb2s6ICRvbkNoYW5nZXNcbiAgICBpZiAodGhpcy5wZW5kaW5nQ2hhbmdlcykge1xuICAgICAgdGhpcy5mb3J3YXJkQ2hhbmdlcyh0aGlzLnBlbmRpbmdDaGFuZ2VzLCBiaW5kaW5nRGVzdGluYXRpb24pO1xuICAgICAgdGhpcy5wZW5kaW5nQ2hhbmdlcyA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJG9uSW5pdFxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJGRvQ2hlY2tcbiAgICBpZiAoY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24oY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKSkge1xuICAgICAgY29uc3QgY2FsbERvQ2hlY2sgPSAoKSA9PiBjb250cm9sbGVySW5zdGFuY2U/LiRkb0NoZWNrPy4oKTtcblxuICAgICAgdGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIgPSB0aGlzLiRjb21wb25lbnRTY29wZS4kcGFyZW50LiR3YXRjaChjYWxsRG9DaGVjayk7XG4gICAgICBjYWxsRG9DaGVjaygpO1xuICAgIH1cblxuICAgIC8vIExpbmtpbmdcbiAgICBjb25zdCBsaW5rID0gdGhpcy5kaXJlY3RpdmUubGluaztcbiAgICBjb25zdCBwcmVMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgJiYgbGluay5wcmU7XG4gICAgY29uc3QgcG9zdExpbmsgPSB0eXBlb2YgbGluayA9PSAnb2JqZWN0JyA/IGxpbmsucG9zdCA6IGxpbms7XG4gICAgY29uc3QgYXR0cnM6IElBdHRyaWJ1dGVzID0gTk9UX1NVUFBPUlRFRDtcbiAgICBjb25zdCB0cmFuc2NsdWRlRm46IElUcmFuc2NsdWRlRnVuY3Rpb24gPSBOT1RfU1VQUE9SVEVEO1xuICAgIGlmIChwcmVMaW5rKSB7XG4gICAgICBwcmVMaW5rKHRoaXMuJGNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy4kY29tcG9uZW50U2NvcGUsIG51bGwhLCB7cGFyZW50Qm91bmRUcmFuc2NsdWRlRm46IGF0dGFjaENoaWxkTm9kZXN9KTtcblxuICAgIGlmIChwb3N0TGluaykge1xuICAgICAgcG9zdExpbmsodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRwb3N0TGlua1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmICghdGhpcy5iaW5kaW5nRGVzdGluYXRpb24pIHtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBjaGFuZ2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvcndhcmRDaGFuZ2VzKGNoYW5nZXMsIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nRG9DaGVjaygpIHtcbiAgICBjb25zdCB0d29XYXlCb3VuZFByb3BlcnRpZXMgPSB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcztcbiAgICBjb25zdCB0d29XYXlCb3VuZExhc3RWYWx1ZXMgPSB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kTGFzdFZhbHVlcztcbiAgICBjb25zdCBwcm9wZXJ0eVRvT3V0cHV0TWFwID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwO1xuXG4gICAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpZHgpID0+IHtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5iaW5kaW5nRGVzdGluYXRpb24/Lltwcm9wTmFtZV07XG4gICAgICBjb25zdCBvbGRWYWx1ZSA9IHR3b1dheUJvdW5kTGFzdFZhbHVlc1tpZHhdO1xuXG4gICAgICBpZiAoIU9iamVjdC5pcyhuZXdWYWx1ZSwgb2xkVmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSBwcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV07XG5cbiAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQobmV3VmFsdWUpO1xuICAgICAgICB0d29XYXlCb3VuZExhc3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcikpIHtcbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyKCk7XG4gICAgfVxuICAgIHRoaXMuaGVscGVyLm9uRGVzdHJveSh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplQmluZGluZ3MoZGlyZWN0aXZlOiBJRGlyZWN0aXZlLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBidGNJc09iamVjdCA9IHR5cGVvZiBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA9PT0gJ29iamVjdCc7XG4gICAgaWYgKGJ0Y0lzT2JqZWN0ICYmIE9iamVjdC5rZXlzKGRpcmVjdGl2ZS5zY29wZSEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gYnRjSXNPYmplY3QgPyBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA6IGRpcmVjdGl2ZS5zY29wZTtcbiAgICBjb25zdCBiaW5kaW5ncyA9IG5ldyBCaW5kaW5ncygpO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgc3dpdGNoIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLiBUaGV5IHdpbGwgYmUgZGVmaW5lZCBhcyBpbnB1dHMgb24gdGhlXG4gICAgICAgICAgICAvLyB1cGdyYWRlZCBjb21wb25lbnQgZmFjYWRlIGFuZCB0aGUgY2hhbmdlIHByb3BhZ2F0aW9uIHdpbGwgYmUgaGFuZGxlZCBieVxuICAgICAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZExhc3RWYWx1ZXMucHVzaChJTklUSUFMX1ZBTFVFKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWUgKyAnQ2hhbmdlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke25hbWV9JyBkaXJlY3RpdmUuYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBiaW5kaW5ncztcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZU91dHB1dHMoKSB7XG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgb3V0cHV0cyBmb3IgYD1gIGFuZCBgJmAgYmluZGluZ3NcbiAgICB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcy5jb25jYXQodGhpcy5iaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzKVxuICAgICAgICAuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICAgICAgKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGJpbmRPdXRwdXRzKGJpbmRpbmdEZXN0aW5hdGlvbjogSUJpbmRpbmdEZXN0aW5hdGlvbikge1xuICAgIC8vIEJpbmQgYCZgIGJpbmRpbmdzIHRvIHRoZSBjb3JyZXNwb25kaW5nIG91dHB1dHNcbiAgICB0aGlzLmJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICBjb25zdCBvdXRwdXROYW1lID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IGVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXTtcblxuICAgICAgYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXSA9ICh2YWx1ZTogYW55KSA9PiBlbWl0dGVyLmVtaXQodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3J3YXJkQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLCBiaW5kaW5nRGVzdGluYXRpb246IElCaW5kaW5nRGVzdGluYXRpb24pIHtcbiAgICAvLyBGb3J3YXJkIGlucHV0IGNoYW5nZXMgdG8gYGJpbmRpbmdEZXN0aW5hdGlvbmBcbiAgICBPYmplY3Qua2V5cyhjaGFuZ2VzKS5mb3JFYWNoKFxuICAgICAgICBwcm9wTmFtZSA9PiBiaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gY2hhbmdlc1twcm9wTmFtZV0uY3VycmVudFZhbHVlKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKGJpbmRpbmdEZXN0aW5hdGlvbi4kb25DaGFuZ2VzKSkge1xuICAgICAgYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMoY2hhbmdlcyk7XG4gICAgfVxuICB9XG59XG4iXX0=