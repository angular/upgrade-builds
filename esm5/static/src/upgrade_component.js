/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, ɵlooseIdentical as looseIdentical } from '@angular/core';
import { $SCOPE } from '../../src/common/src/constants';
import { UpgradeHelper } from '../../src/common/src/upgrade_helper';
import { isFunction } from '../../src/common/src/util';
import * as i0 from "@angular/core";
var NOT_SUPPORTED = 'NOT_SUPPORTED';
var INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var Bindings = /** @class */ (function () {
    function Bindings() {
        this.twoWayBoundProperties = [];
        this.twoWayBoundLastValues = [];
        this.expressionBoundProperties = [];
        this.propertyToOutputMap = {};
    }
    return Bindings;
}());
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
 */
var UpgradeComponent = /** @class */ (function () {
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
    function UpgradeComponent(name, elementRef, injector) {
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
        var $parentScope = injector.get($SCOPE);
        // QUESTION 1: Should we create an isolated scope if the scope is only true?
        // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
        this.$componentScope = $parentScope.$new(!!this.directive.scope);
        this.initializeOutputs();
    }
    UpgradeComponent.prototype.ngOnInit = function () {
        var _this = this;
        // Collect contents, insert and compile template
        var attachChildNodes = this.helper.prepareTransclusion();
        var linkFn = this.helper.compileTemplate();
        // Instantiate controller
        var controllerType = this.directive.controller;
        var bindToController = this.directive.bindToController;
        if (controllerType) {
            this.controllerInstance = this.helper.buildController(controllerType, this.$componentScope);
        }
        else if (bindToController) {
            throw new Error("Upgraded directive '" + this.directive.name + "' specifies 'bindToController' but no controller.");
        }
        // Set up outputs
        this.bindingDestination = bindToController ? this.controllerInstance : this.$componentScope;
        this.bindOutputs();
        // Require other controllers
        var requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
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
            var callDoCheck = function () { return _this.controllerInstance.$doCheck(); };
            this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
            callDoCheck();
        }
        // Linking
        var link = this.directive.link;
        var preLink = typeof link == 'object' && link.pre;
        var postLink = typeof link == 'object' ? link.post : link;
        var attrs = NOT_SUPPORTED;
        var transcludeFn = NOT_SUPPORTED;
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
    };
    UpgradeComponent.prototype.ngOnChanges = function (changes) {
        if (!this.bindingDestination) {
            this.pendingChanges = changes;
        }
        else {
            this.forwardChanges(changes);
        }
    };
    UpgradeComponent.prototype.ngDoCheck = function () {
        var _this = this;
        var twoWayBoundProperties = this.bindings.twoWayBoundProperties;
        var twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
        var propertyToOutputMap = this.bindings.propertyToOutputMap;
        twoWayBoundProperties.forEach(function (propName, idx) {
            var newValue = _this.bindingDestination[propName];
            var oldValue = twoWayBoundLastValues[idx];
            if (!looseIdentical(newValue, oldValue)) {
                var outputName = propertyToOutputMap[propName];
                var eventEmitter = _this[outputName];
                eventEmitter.emit(newValue);
                twoWayBoundLastValues[idx] = newValue;
            }
        });
    };
    UpgradeComponent.prototype.ngOnDestroy = function () {
        if (isFunction(this.unregisterDoCheckWatcher)) {
            this.unregisterDoCheckWatcher();
        }
        this.helper.onDestroy(this.$componentScope, this.controllerInstance);
    };
    UpgradeComponent.prototype.initializeBindings = function (directive) {
        var _this = this;
        var btcIsObject = typeof directive.bindToController === 'object';
        if (btcIsObject && Object.keys(directive.scope).length) {
            throw new Error("Binding definitions on scope and controller at the same time is not supported.");
        }
        var context = btcIsObject ? directive.bindToController : directive.scope;
        var bindings = new Bindings();
        if (typeof context == 'object') {
            Object.keys(context).forEach(function (propName) {
                var definition = context[propName];
                var bindingType = definition.charAt(0);
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
                        var json = JSON.stringify(context);
                        throw new Error("Unexpected mapping '" + bindingType + "' in '" + json + "' in '" + _this.name + "' directive.");
                }
            });
        }
        return bindings;
    };
    UpgradeComponent.prototype.initializeOutputs = function () {
        var _this = this;
        // Initialize the outputs for `=` and `&` bindings
        this.bindings.twoWayBoundProperties.concat(this.bindings.expressionBoundProperties)
            .forEach(function (propName) {
            var outputName = _this.bindings.propertyToOutputMap[propName];
            _this[outputName] = new EventEmitter();
        });
    };
    UpgradeComponent.prototype.bindOutputs = function () {
        var _this = this;
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach(function (propName) {
            var outputName = _this.bindings.propertyToOutputMap[propName];
            var emitter = _this[outputName];
            _this.bindingDestination[propName] = function (value) { return emitter.emit(value); };
        });
    };
    UpgradeComponent.prototype.forwardChanges = function (changes) {
        var _this = this;
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach(function (propName) { return _this.bindingDestination[propName] = changes[propName].currentValue; });
        if (isFunction(this.bindingDestination.$onChanges)) {
            this.bindingDestination.$onChanges(changes);
        }
    };
    UpgradeComponent.ɵfac = function UpgradeComponent_Factory(t) { i0.ɵɵinvalidFactory(); };
    UpgradeComponent.ɵdir = i0.ɵɵdefineDirective({ type: UpgradeComponent, features: [i0.ɵɵNgOnChangesFeature] });
    return UpgradeComponent;
}());
export { UpgradeComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFzQixZQUFZLEVBQXlELGVBQWUsSUFBSSxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHMUosT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLGdDQUFnQyxDQUFDO0FBQ3RELE9BQU8sRUFBMkMsYUFBYSxFQUFDLE1BQU0scUNBQXFDLENBQUM7QUFDNUcsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLDJCQUEyQixDQUFDOztBQUVyRCxJQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFDM0MsSUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUY7SUFBQTtRQUNFLDBCQUFxQixHQUFhLEVBQUUsQ0FBQztRQUNyQywwQkFBcUIsR0FBVSxFQUFFLENBQUM7UUFFbEMsOEJBQXlCLEdBQWEsRUFBRSxDQUFDO1FBRXpDLHdCQUFtQixHQUFpQyxFQUFFLENBQUM7SUFDekQsQ0FBQztJQUFELGVBQUM7QUFBRCxDQUFDLEFBUEQsSUFPQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNDRztBQUNIO0lBMEJFOzs7Ozs7Ozs7O09BVUc7SUFDSCwwQkFBb0IsSUFBWSxFQUFVLFVBQXNCLEVBQVUsUUFBa0I7UUFBeEUsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFVLGVBQVUsR0FBVixVQUFVLENBQVk7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQzFGLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztR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S0FBSyxDQUFDLEVBQW5CLENBQW1CLENBQUM7UUFDMUUsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8seUNBQWMsR0FBdEIsVUFBdUIsT0FBc0I7UUFBN0MsaUJBUUM7UUFQQyxnREFBZ0Q7UUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQ3hCLFVBQUEsUUFBUSxJQUFJLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxZQUFZLEVBQWxFLENBQWtFLENBQUMsQ0FBQztRQUVwRixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDbEQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM3QztJQUNILENBQUM7O3lEQW5PVSxnQkFBZ0I7MkJBcEU3QjtDQXdTQyxBQXBPRCxJQW9PQztTQXBPWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RG9DaGVjaywgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3RvciwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgU2ltcGxlQ2hhbmdlcywgybVsb29zZUlkZW50aWNhbCBhcyBsb29zZUlkZW50aWNhbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SUF0dHJpYnV0ZXMsIElBdWdtZW50ZWRKUXVlcnksIElEaXJlY3RpdmUsIElEaXJlY3RpdmVQcmVQb3N0LCBJSW5qZWN0b3JTZXJ2aWNlLCBJTGlua0ZuLCBJU2NvcGUsIElUcmFuc2NsdWRlRnVuY3Rpb259IGZyb20gJy4uLy4uL3NyYy9jb21tb24vc3JjL2FuZ3VsYXIxJztcbmltcG9ydCB7JFNDT1BFfSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy9jb25zdGFudHMnO1xuaW1wb3J0IHtJQmluZGluZ0Rlc3RpbmF0aW9uLCBJQ29udHJvbGxlckluc3RhbmNlLCBVcGdyYWRlSGVscGVyfSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy91cGdyYWRlX2hlbHBlcic7XG5pbXBvcnQge2lzRnVuY3Rpb259IGZyb20gJy4uLy4uL3NyYy9jb21tb24vc3JjL3V0aWwnO1xuXG5jb25zdCBOT1RfU1VQUE9SVEVEOiBhbnkgPSAnTk9UX1NVUFBPUlRFRCc7XG5jb25zdCBJTklUSUFMX1ZBTFVFID0ge1xuICBfX1VOSU5JVElBTElaRURfXzogdHJ1ZVxufTtcblxuY2xhc3MgQmluZGluZ3Mge1xuICB0d29XYXlCb3VuZFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG4gIHR3b1dheUJvdW5kTGFzdFZhbHVlczogYW55W10gPSBbXTtcblxuICBleHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIHByb3BlcnR5VG9PdXRwdXRNYXA6IHtbcHJvcE5hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBjbGFzcyB0aGF0IGFsbG93cyBhbiBBbmd1bGFySlMgY29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFyLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQU9UIGNvbXBpbGF0aW9uLipcbiAqXG4gKiBUaGlzIGhlbHBlciBjbGFzcyBzaG91bGQgYmUgdXNlZCBhcyBhIGJhc2UgY2xhc3MgZm9yIGNyZWF0aW5nIEFuZ3VsYXIgZGlyZWN0aXZlc1xuICogdGhhdCB3cmFwIEFuZ3VsYXJKUyBjb21wb25lbnRzIHRoYXQgbmVlZCB0byBiZSBcInVwZ3JhZGVkXCIuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIExldCdzIGFzc3VtZSB0aGF0IHlvdSBoYXZlIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FsbGVkIGBuZzFIZXJvYCB0aGF0IG5lZWRzXG4gKiB0byBiZSBtYWRlIGF2YWlsYWJsZSBpbiBBbmd1bGFyIHRlbXBsYXRlcy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLWhlcm9cIn1cbiAqXG4gKiBXZSBtdXN0IGNyZWF0ZSBhIGBEaXJlY3RpdmVgIHRoYXQgd2lsbCBtYWtlIHRoaXMgQW5ndWxhckpTIGNvbXBvbmVudFxuICogYXZhaWxhYmxlIGluc2lkZSBBbmd1bGFyIHRlbXBsYXRlcy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLWhlcm8td3JhcHBlclwifVxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSB5b3UgY2FuIHNlZSB0aGF0IHdlIG11c3QgZGVyaXZlIGZyb20gdGhlIGBVcGdyYWRlQ29tcG9uZW50YFxuICogYmFzZSBjbGFzcyBidXQgYWxzbyBwcm92aWRlIGFuIHtAbGluayBEaXJlY3RpdmUgYEBEaXJlY3RpdmVgfSBkZWNvcmF0b3IuIFRoaXMgaXNcbiAqIGJlY2F1c2UgdGhlIEFPVCBjb21waWxlciByZXF1aXJlcyB0aGF0IHRoaXMgaW5mb3JtYXRpb24gaXMgc3RhdGljYWxseSBhdmFpbGFibGUgYXRcbiAqIGNvbXBpbGUgdGltZS5cbiAqXG4gKiBOb3RlIHRoYXQgd2UgbXVzdCBkbyB0aGUgZm9sbG93aW5nOlxuICogKiBzcGVjaWZ5IHRoZSBkaXJlY3RpdmUncyBzZWxlY3RvciAoYG5nMS1oZXJvYClcbiAqICogc3BlY2lmeSBhbGwgaW5wdXRzIGFuZCBvdXRwdXRzIHRoYXQgdGhlIEFuZ3VsYXJKUyBjb21wb25lbnQgZXhwZWN0c1xuICogKiBkZXJpdmUgZnJvbSBgVXBncmFkZUNvbXBvbmVudGBcbiAqICogY2FsbCB0aGUgYmFzZSBjbGFzcyBmcm9tIHRoZSBjb25zdHJ1Y3RvciwgcGFzc2luZ1xuICogICAqIHRoZSBBbmd1bGFySlMgbmFtZSBvZiB0aGUgY29tcG9uZW50IChgbmcxSGVyb2ApXG4gKiAgICogdGhlIGBFbGVtZW50UmVmYCBhbmQgYEluamVjdG9yYCBmb3IgdGhlIGNvbXBvbmVudCB3cmFwcGVyXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgVXBncmFkZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrLCBPbkRlc3Ryb3kge1xuICBwcml2YXRlIGhlbHBlcjogVXBncmFkZUhlbHBlcjtcblxuICBwcml2YXRlICRpbmplY3RvcjogSUluamVjdG9yU2VydmljZTtcblxuICBwcml2YXRlIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gIHByaXZhdGUgJGVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnk7XG4gIHByaXZhdGUgJGNvbXBvbmVudFNjb3BlOiBJU2NvcGU7XG5cbiAgcHJpdmF0ZSBkaXJlY3RpdmU6IElEaXJlY3RpdmU7XG4gIHByaXZhdGUgYmluZGluZ3M6IEJpbmRpbmdzO1xuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNvbnRyb2xsZXJJbnN0YW5jZSAhOiBJQ29udHJvbGxlckluc3RhbmNlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBiaW5kaW5nRGVzdGluYXRpb24gITogSUJpbmRpbmdEZXN0aW5hdGlvbjtcblxuICAvLyBXZSB3aWxsIGJlIGluc3RhbnRpYXRpbmcgdGhlIGNvbnRyb2xsZXIgaW4gdGhlIGBuZ09uSW5pdGAgaG9vaywgd2hlbiB0aGVcbiAgLy8gZmlyc3QgYG5nT25DaGFuZ2VzYCB3aWxsIGhhdmUgYmVlbiBhbHJlYWR5IHRyaWdnZXJlZC4gV2Ugc3RvcmUgdGhlXG4gIC8vIGBTaW1wbGVDaGFuZ2VzYCBhbmQgXCJwbGF5IHRoZW0gYmFja1wiIGxhdGVyLlxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBwZW5kaW5nQ2hhbmdlcyAhOiBTaW1wbGVDaGFuZ2VzIHwgbnVsbDtcblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSB1bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIgITogRnVuY3Rpb247XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgVXBncmFkZUNvbXBvbmVudGAgaW5zdGFuY2UuIFlvdSBzaG91bGQgbm90IG5vcm1hbGx5IG5lZWQgdG8gZG8gdGhpcy5cbiAgICogSW5zdGVhZCB5b3Ugc2hvdWxkIGRlcml2ZSBhIG5ldyBjbGFzcyBmcm9tIHRoaXMgb25lIGFuZCBjYWxsIHRoZSBzdXBlciBjb25zdHJ1Y3RvclxuICAgKiBmcm9tIHRoZSBiYXNlIGNsYXNzLlxuICAgKlxuICAgKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLWhlcm8td3JhcHBlclwiIH1cbiAgICpcbiAgICogKiBUaGUgYG5hbWVgIHBhcmFtZXRlciBzaG91bGQgYmUgdGhlIG5hbWUgb2YgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUuXG4gICAqICogVGhlIGBlbGVtZW50UmVmYCBhbmQgYGluamVjdG9yYCBwYXJhbWV0ZXJzIHNob3VsZCBiZSBhY3F1aXJlZCBmcm9tIEFuZ3VsYXIgYnkgZGVwZW5kZW5jeVxuICAgKiAgIGluamVjdGlvbiBpbnRvIHRoZSBiYXNlIGNsYXNzIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuYW1lOiBzdHJpbmcsIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmhlbHBlciA9IG5ldyBVcGdyYWRlSGVscGVyKGluamVjdG9yLCBuYW1lLCBlbGVtZW50UmVmKTtcblxuICAgIHRoaXMuJGluamVjdG9yID0gdGhpcy5oZWxwZXIuJGluamVjdG9yO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5oZWxwZXIuZWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gdGhpcy5oZWxwZXIuJGVsZW1lbnQ7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZSA9IHRoaXMuaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmJpbmRpbmdzID0gdGhpcy5pbml0aWFsaXplQmluZGluZ3ModGhpcy5kaXJlY3RpdmUpO1xuXG4gICAgLy8gV2UgYXNrIGZvciB0aGUgQW5ndWxhckpTIHNjb3BlIGZyb20gdGhlIEFuZ3VsYXIgaW5qZWN0b3IsIHNpbmNlXG4gICAgLy8gd2Ugd2lsbCBwdXQgdGhlIG5ldyBjb21wb25lbnQgc2NvcGUgb250byB0aGUgbmV3IGluamVjdG9yIGZvciBlYWNoIGNvbXBvbmVudFxuICAgIGNvbnN0ICRwYXJlbnRTY29wZSA9IGluamVjdG9yLmdldCgkU0NPUEUpO1xuICAgIC8vIFFVRVNUSU9OIDE6IFNob3VsZCB3ZSBjcmVhdGUgYW4gaXNvbGF0ZWQgc2NvcGUgaWYgdGhlIHNjb3BlIGlzIG9ubHkgdHJ1ZT9cbiAgICAvLyBRVUVTVElPTiAyOiBTaG91bGQgd2UgbWFrZSB0aGUgc2NvcGUgYWNjZXNzaWJsZSB0aHJvdWdoIGAkZWxlbWVudC5zY29wZSgpL2lzb2xhdGVTY29wZSgpYD9cbiAgICB0aGlzLiRjb21wb25lbnRTY29wZSA9ICRwYXJlbnRTY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplT3V0cHV0cygpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gQ29sbGVjdCBjb250ZW50cywgaW5zZXJ0IGFuZCBjb21waWxlIHRlbXBsYXRlXG4gICAgY29uc3QgYXR0YWNoQ2hpbGROb2RlczogSUxpbmtGbnx1bmRlZmluZWQgPSB0aGlzLmhlbHBlci5wcmVwYXJlVHJhbnNjbHVzaW9uKCk7XG4gICAgY29uc3QgbGlua0ZuID0gdGhpcy5oZWxwZXIuY29tcGlsZVRlbXBsYXRlKCk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGlmIChjb250cm9sbGVyVHlwZSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuJGNvbXBvbmVudFNjb3BlKTtcbiAgICB9IGVsc2UgaWYgKGJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVXBncmFkZWQgZGlyZWN0aXZlICcke3RoaXMuZGlyZWN0aXZlLm5hbWV9JyBzcGVjaWZpZXMgJ2JpbmRUb0NvbnRyb2xsZXInIGJ1dCBubyBjb250cm9sbGVyLmApO1xuICAgIH1cblxuICAgIC8vIFNldCB1cCBvdXRwdXRzXG4gICAgdGhpcy5iaW5kaW5nRGVzdGluYXRpb24gPSBiaW5kVG9Db250cm9sbGVyID8gdGhpcy5jb250cm9sbGVySW5zdGFuY2UgOiB0aGlzLiRjb21wb25lbnRTY29wZTtcbiAgICB0aGlzLmJpbmRPdXRwdXRzKCk7XG5cbiAgICAvLyBSZXF1aXJlIG90aGVyIGNvbnRyb2xsZXJzXG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9XG4gICAgICAgIHRoaXMuaGVscGVyLnJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSk7XG5cbiAgICAvLyBIb29rOiAkb25DaGFuZ2VzXG4gICAgaWYgKHRoaXMucGVuZGluZ0NoYW5nZXMpIHtcbiAgICAgIHRoaXMuZm9yd2FyZENoYW5nZXModGhpcy5wZW5kaW5nQ2hhbmdlcyk7XG4gICAgICB0aGlzLnBlbmRpbmdDaGFuZ2VzID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkb25Jbml0XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkZG9DaGVja1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKSkge1xuICAgICAgY29uc3QgY2FsbERvQ2hlY2sgPSAoKSA9PiB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjayAhKCk7XG5cbiAgICAgIHRoaXMudW5yZWdpc3RlckRvQ2hlY2tXYXRjaGVyID0gdGhpcy4kY29tcG9uZW50U2NvcGUuJHBhcmVudC4kd2F0Y2goY2FsbERvQ2hlY2spO1xuICAgICAgY2FsbERvQ2hlY2soKTtcbiAgICB9XG5cbiAgICAvLyBMaW5raW5nXG4gICAgY29uc3QgbGluayA9IHRoaXMuZGlyZWN0aXZlLmxpbms7XG4gICAgY29uc3QgcHJlTGluayA9IHR5cGVvZiBsaW5rID09ICdvYmplY3QnICYmIGxpbmsucHJlO1xuICAgIGNvbnN0IHBvc3RMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgPyBsaW5rLnBvc3QgOiBsaW5rO1xuICAgIGNvbnN0IGF0dHJzOiBJQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBJVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgbGlua0ZuKHRoaXMuJGNvbXBvbmVudFNjb3BlLCBudWxsICEsIHtwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbjogYXR0YWNoQ2hpbGROb2Rlc30pO1xuXG4gICAgaWYgKHBvc3RMaW5rKSB7XG4gICAgICBwb3N0TGluayh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJHBvc3RMaW5rXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmICghdGhpcy5iaW5kaW5nRGVzdGluYXRpb24pIHtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBjaGFuZ2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvcndhcmRDaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBjb25zdCB0d29XYXlCb3VuZFByb3BlcnRpZXMgPSB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcztcbiAgICBjb25zdCB0d29XYXlCb3VuZExhc3RWYWx1ZXMgPSB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kTGFzdFZhbHVlcztcbiAgICBjb25zdCBwcm9wZXJ0eVRvT3V0cHV0TWFwID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwO1xuXG4gICAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpZHgpID0+IHtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5iaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdO1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0d29XYXlCb3VuZExhc3RWYWx1ZXNbaWR4XTtcblxuICAgICAgaWYgKCFsb29zZUlkZW50aWNhbChuZXdWYWx1ZSwgb2xkVmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSBwcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV07XG5cbiAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQobmV3VmFsdWUpO1xuICAgICAgICB0d29XYXlCb3VuZExhc3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIpKSB7XG4gICAgICB0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcigpO1xuICAgIH1cbiAgICB0aGlzLmhlbHBlci5vbkRlc3Ryb3kodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUJpbmRpbmdzKGRpcmVjdGl2ZTogSURpcmVjdGl2ZSkge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIGRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXMoZGlyZWN0aXZlLnNjb3BlICEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gYnRjSXNPYmplY3QgPyBkaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciA6IGRpcmVjdGl2ZS5zY29wZTtcbiAgICBjb25zdCBiaW5kaW5ncyA9IG5ldyBCaW5kaW5ncygpO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgc3dpdGNoIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnl0aGluZyBzcGVjaWFsLiBUaGV5IHdpbGwgYmUgZGVmaW5lZCBhcyBpbnB1dHMgb24gdGhlXG4gICAgICAgICAgICAvLyB1cGdyYWRlZCBjb21wb25lbnQgZmFjYWRlIGFuZCB0aGUgY2hhbmdlIHByb3BhZ2F0aW9uIHdpbGwgYmUgaGFuZGxlZCBieVxuICAgICAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZFByb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICBiaW5kaW5ncy50d29XYXlCb3VuZExhc3RWYWx1ZXMucHVzaChJTklUSUFMX1ZBTFVFKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWUgKyAnQ2hhbmdlJztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIGJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke3RoaXMubmFtZX0nIGRpcmVjdGl2ZS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJpbmRpbmdzO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0aWFsaXplT3V0cHV0cygpIHtcbiAgICAvLyBJbml0aWFsaXplIHRoZSBvdXRwdXRzIGZvciBgPWAgYW5kIGAmYCBiaW5kaW5nc1xuICAgIHRoaXMuYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzLmNvbmNhdCh0aGlzLmJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMpXG4gICAgICAgIC5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBvdXRwdXROYW1lID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgICAgICAodGhpcyBhcyBhbnkpW291dHB1dE5hbWVdID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgYmluZE91dHB1dHMoKSB7XG4gICAgLy8gQmluZCBgJmAgYmluZGluZ3MgdG8gdGhlIGNvcnJlc3BvbmRpbmcgb3V0cHV0c1xuICAgIHRoaXMuYmluZGluZ3MuZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllcy5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSB0aGlzLmJpbmRpbmdzLnByb3BlcnR5VG9PdXRwdXRNYXBbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgZW1pdHRlciA9ICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV07XG5cbiAgICAgIHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXSA9ICh2YWx1ZTogYW55KSA9PiBlbWl0dGVyLmVtaXQodmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBmb3J3YXJkQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgLy8gRm9yd2FyZCBpbnB1dCBjaGFuZ2VzIHRvIGBiaW5kaW5nRGVzdGluYXRpb25gXG4gICAgT2JqZWN0LmtleXMoY2hhbmdlcykuZm9yRWFjaChcbiAgICAgICAgcHJvcE5hbWUgPT4gdGhpcy5iaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdID0gY2hhbmdlc1twcm9wTmFtZV0uY3VycmVudFZhbHVlKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uLiRvbkNoYW5nZXMpKSB7XG4gICAgICB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbi4kb25DaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxufVxuIl19