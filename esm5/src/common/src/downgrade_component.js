/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ComponentFactoryResolver, NgZone } from '@angular/core';
import { $COMPILE, $INJECTOR, $PARSE, INJECTOR_KEY, LAZY_MODULE_REF, REQUIRE_INJECTOR, REQUIRE_NG_MODEL } from './constants';
import { DowngradeComponentAdapter } from './downgrade_component_adapter';
import { controllerKey, getDowngradedModuleCount, getTypeName, getUpgradeAppType, isFunction, validateInjectionKey } from './util';
/**
 * @description
 *
 * A helper function that allows an Angular component to be used from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper function returns a factory function to be used for registering
 * an AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * @usageNotes
 * ### Examples
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes-wrapper"}
 *
 * @param info contains information about the Component that is being downgraded:
 *
 * - `component: Type<any>`: The type of the Component that will be downgraded
 * - `downgradedModule?: string`: The name of the downgraded module (if any) that the component
 *   "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose
 *   corresponding Angular module will be bootstrapped, when the component needs to be instantiated.
 *   <br />
 *   (This option is only necessary when using `downgradeModule()` to downgrade more than one
 *   Angular module.)
 * - `propagateDigest?: boolean`: Whether to perform {@link ChangeDetectorRef#detectChanges
 *   change detection} on the component on every
 *   [$digest](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest). If set to `false`,
 *   change detection will still be performed when any of the component's inputs changes.
 *   (Default: true)
 *
 * @returns a factory function that can be used to register the component in an
 * AngularJS module.
 *
 * @publicApi
 */
export function downgradeComponent(info) {
    var directiveFactory = function ($compile, $injector, $parse) {
        // When using `downgradeModule()`, we need to handle certain things specially. For example:
        // - We always need to attach the component view to the `ApplicationRef` for it to be
        //   dirty-checked.
        // - We need to ensure callbacks to Angular APIs (e.g. change detection) are run inside the
        //   Angular zone.
        //   NOTE: This is not needed, when using `UpgradeModule`, because `$digest()` will be run
        //         inside the Angular zone (except if explicitly escaped, in which case we shouldn't
        //         force it back in).
        var isNgUpgradeLite = getUpgradeAppType($injector) === 3 /* Lite */;
        var wrapCallback = !isNgUpgradeLite ? function (cb) { return cb; } : function (cb) { return function () { return NgZone.isInAngularZone() ? cb() : ngZone.run(cb); }; };
        var ngZone;
        // When downgrading multiple modules, special handling is needed wrt injectors.
        var hasMultipleDowngradedModules = isNgUpgradeLite && (getDowngradedModuleCount($injector) > 1);
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: function (scope, element, attrs, required) {
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                var ngModel = required[1];
                var parentInjector = required[0];
                var moduleInjector = undefined;
                var ranAsync = false;
                if (!parentInjector || hasMultipleDowngradedModules) {
                    var downgradedModule = info.downgradedModule || '';
                    var lazyModuleRefKey = "" + LAZY_MODULE_REF + downgradedModule;
                    var attemptedAction = "instantiating component '" + getTypeName(info.component) + "'";
                    validateInjectionKey($injector, downgradedModule, lazyModuleRefKey, attemptedAction);
                    var lazyModuleRef = $injector.get(lazyModuleRefKey);
                    moduleInjector = lazyModuleRef.injector || lazyModuleRef.promise;
                }
                // Notes:
                //
                // There are two injectors: `finalModuleInjector` and `finalParentInjector` (they might be
                // the same instance, but that is irrelevant):
                // - `finalModuleInjector` is used to retrieve `ComponentFactoryResolver`, thus it must be
                //   on the same tree as the `NgModule` that declares this downgraded component.
                // - `finalParentInjector` is used for all other injection purposes.
                //   (Note that Angular knows to only traverse the component-tree part of that injector,
                //   when looking for an injectable and then switch to the module injector.)
                //
                // There are basically three cases:
                // - If there is no parent component (thus no `parentInjector`), we bootstrap the downgraded
                //   `NgModule` and use its injector as both `finalModuleInjector` and
                //   `finalParentInjector`.
                // - If there is a parent component (and thus a `parentInjector`) and we are sure that it
                //   belongs to the same `NgModule` as this downgraded component (e.g. because there is only
                //   one downgraded module, we use that `parentInjector` as both `finalModuleInjector` and
                //   `finalParentInjector`.
                // - If there is a parent component, but it may belong to a different `NgModule`, then we
                //   use the `parentInjector` as `finalParentInjector` and this downgraded component's
                //   declaring `NgModule`'s injector as `finalModuleInjector`.
                //   Note 1: If the `NgModule` is already bootstrapped, we just get its injector (we don't
                //           bootstrap again).
                //   Note 2: It is possible that (while there are multiple downgraded modules) this
                //           downgraded component and its parent component both belong to the same NgModule.
                //           In that case, we could have used the `parentInjector` as both
                //           `finalModuleInjector` and `finalParentInjector`, but (for simplicity) we are
                //           treating this case as if they belong to different `NgModule`s. That doesn't
                //           really affect anything, since `parentInjector` has `moduleInjector` as ancestor
                //           and trying to resolve `ComponentFactoryResolver` from either one will return
                //           the same instance.
                // If there is a parent component, use its injector as parent injector.
                // If this is a "top-level" Angular component, use the module injector.
                var finalParentInjector = parentInjector || moduleInjector;
                // If this is a "top-level" Angular component or the parent component may belong to a
                // different `NgModule`, use the module injector for module-specific dependencies.
                // If there is a parent component that belongs to the same `NgModule`, use its injector.
                var finalModuleInjector = moduleInjector || parentInjector;
                var doDowngrade = function (injector, moduleInjector) {
                    // Retrieve `ComponentFactoryResolver` from the injector tied to the `NgModule` this
                    // component belongs to.
                    var componentFactoryResolver = moduleInjector.get(ComponentFactoryResolver);
                    var componentFactory = componentFactoryResolver.resolveComponentFactory(info.component);
                    if (!componentFactory) {
                        throw new Error("Expecting ComponentFactory for: " + getTypeName(info.component));
                    }
                    var injectorPromise = new ParentInjectorPromise(element);
                    var facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory, wrapCallback);
                    var projectableNodes = facade.compileContents();
                    facade.createComponent(projectableNodes);
                    facade.setupInputs(isNgUpgradeLite, info.propagateDigest);
                    facade.setupOutputs();
                    facade.registerCleanup();
                    injectorPromise.resolve(facade.getInjector());
                    if (ranAsync) {
                        // If this is run async, it is possible that it is not run inside a
                        // digest and initial input values will not be detected.
                        scope.$evalAsync(function () { });
                    }
                };
                var downgradeFn = !isNgUpgradeLite ? doDowngrade : function (pInjector, mInjector) {
                    if (!ngZone) {
                        ngZone = pInjector.get(NgZone);
                    }
                    wrapCallback(function () { return doDowngrade(pInjector, mInjector); })();
                };
                if (isThenable(finalParentInjector) || isThenable(finalModuleInjector)) {
                    Promise.all([finalParentInjector, finalModuleInjector])
                        .then(function (_a) {
                        var _b = tslib_1.__read(_a, 2), pInjector = _b[0], mInjector = _b[1];
                        return downgradeFn(pInjector, mInjector);
                    });
                }
                else {
                    downgradeFn(finalParentInjector, finalModuleInjector);
                }
                ranAsync = true;
            }
        };
    };
    // bracket-notation because of closure - see #14441
    directiveFactory['$inject'] = [$COMPILE, $INJECTOR, $PARSE];
    return directiveFactory;
}
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of Angular 1's $compile.
 */
var ParentInjectorPromise = /** @class */ (function () {
    function ParentInjectorPromise(element) {
        this.element = element;
        this.injectorKey = controllerKey(INJECTOR_KEY);
        this.callbacks = [];
        // Store the promise on the element.
        element.data(this.injectorKey, this);
    }
    ParentInjectorPromise.prototype.then = function (callback) {
        if (this.injector) {
            callback(this.injector);
        }
        else {
            this.callbacks.push(callback);
        }
    };
    ParentInjectorPromise.prototype.resolve = function (injector) {
        this.injector = injector;
        // Store the real injector on the element.
        this.element.data(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = null;
        // Run the queued callbacks.
        this.callbacks.forEach(function (callback) { return callback(injector); });
        this.callbacks.length = 0;
    };
    return ParentInjectorPromise;
}());
function isThenable(obj) {
    return isFunction(obj.then);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi9zcmMvZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFtQix3QkFBd0IsRUFBWSxNQUFNLEVBQU8sTUFBTSxlQUFlLENBQUM7QUFHakcsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDM0gsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDeEUsT0FBTyxFQUFnQyxhQUFhLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQU9oSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNkNHO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBUWxDO0lBQ0MsSUFBTSxnQkFBZ0IsR0FBdUIsVUFDekMsUUFBeUIsRUFBRSxTQUEyQixFQUFFLE1BQXFCO1FBQy9FLDJGQUEyRjtRQUMzRixxRkFBcUY7UUFDckYsbUJBQW1CO1FBQ25CLDJGQUEyRjtRQUMzRixrQkFBa0I7UUFDbEIsMEZBQTBGO1FBQzFGLDRGQUE0RjtRQUM1Riw2QkFBNkI7UUFDN0IsSUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGlCQUF3QixDQUFDO1FBQzdFLElBQU0sWUFBWSxHQUNkLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxVQUFBLEVBQUUsSUFBSSxPQUFBLEVBQUUsRUFBRixDQUFFLENBQUMs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SUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3pCO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQjtJQUNILENBQUM7SUFFRCx1Q0FBTyxHQUFQLFVBQVEsUUFBa0I7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFFekIsMENBQTBDO1FBQzFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFaEQsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBTSxDQUFDO1FBRXRCLDRCQUE0QjtRQUM1QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFBLFFBQVEsSUFBSSxPQUFBLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0gsNEJBQUM7QUFBRCxDQUFDLEFBaENELElBZ0NDO0FBRUQsU0FBUyxVQUFVLENBQUksR0FBVztJQUNoQyxPQUFPLFVBQVUsQ0FBRSxHQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yLCBOZ1pvbmUsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0lBbm5vdGF0ZWRGdW5jdGlvbiwgSUF0dHJpYnV0ZXMsIElBdWdtZW50ZWRKUXVlcnksIElDb21waWxlU2VydmljZSwgSURpcmVjdGl2ZSwgSUluamVjdG9yU2VydmljZSwgSU5nTW9kZWxDb250cm9sbGVyLCBJUGFyc2VTZXJ2aWNlLCBJU2NvcGV9IGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0UsIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0Rvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXJ9IGZyb20gJy4vZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgVXBncmFkZUFwcFR5cGUsIGNvbnRyb2xsZXJLZXksIGdldERvd25ncmFkZWRNb2R1bGVDb3VudCwgZ2V0VHlwZU5hbWUsIGdldFVwZ3JhZGVBcHBUeXBlLCBpc0Z1bmN0aW9uLCB2YWxpZGF0ZUluamVjdGlvbktleX0gZnJvbSAnLi91dGlsJztcblxuXG5pbnRlcmZhY2UgVGhlbmFibGU8VD4ge1xuICB0aGVuKGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IGFueSk6IGFueTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IGFsbG93cyBhbiBBbmd1bGFyIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQW9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRvIGJlIHVzZWQgZm9yIHJlZ2lzdGVyaW5nXG4gKiBhbiBBbmd1bGFySlMgd3JhcHBlciBkaXJlY3RpdmUgZm9yIFwiZG93bmdyYWRpbmdcIiBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogTGV0J3MgYXNzdW1lIHRoYXQgeW91IGhhdmUgYW4gQW5ndWxhciBjb21wb25lbnQgY2FsbGVkIGBuZzJIZXJvZXNgIHRoYXQgbmVlZHNcbiAqIHRvIGJlIG1hZGUgYXZhaWxhYmxlIGluIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXNcIn1cbiAqXG4gKiBXZSBtdXN0IGNyZWF0ZSBhbiBBbmd1bGFySlMgW2RpcmVjdGl2ZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvZ3VpZGUvZGlyZWN0aXZlKVxuICogdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFyIGNvbXBvbmVudCBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMuXG4gKiBUaGUgYGRvd25ncmFkZUNvbXBvbmVudCgpYCBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IHdlXG4gKiBjYW4gdXNlIHRvIGRlZmluZSB0aGUgQW5ndWxhckpTIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIHRoZSBcImRvd25ncmFkZWRcIiBjb21wb25lbnQuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXMtd3JhcHBlclwifVxuICpcbiAqIEBwYXJhbSBpbmZvIGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBDb21wb25lbnQgdGhhdCBpcyBiZWluZyBkb3duZ3JhZGVkOlxuICpcbiAqIC0gYGNvbXBvbmVudDogVHlwZTxhbnk+YDogVGhlIHR5cGUgb2YgdGhlIENvbXBvbmVudCB0aGF0IHdpbGwgYmUgZG93bmdyYWRlZFxuICogLSBgZG93bmdyYWRlZE1vZHVsZT86IHN0cmluZ2A6IFRoZSBuYW1lIG9mIHRoZSBkb3duZ3JhZGVkIG1vZHVsZSAoaWYgYW55KSB0aGF0IHRoZSBjb21wb25lbnRcbiAqICAgXCJiZWxvbmdzIHRvXCIsIGFzIHJldHVybmVkIGJ5IGEgY2FsbCB0byBgZG93bmdyYWRlTW9kdWxlKClgLiBJdCBpcyB0aGUgbW9kdWxlLCB3aG9zZVxuICogICBjb3JyZXNwb25kaW5nIEFuZ3VsYXIgbW9kdWxlIHdpbGwgYmUgYm9vdHN0cmFwcGVkLCB3aGVuIHRoZSBjb21wb25lbnQgbmVlZHMgdG8gYmUgaW5zdGFudGlhdGVkLlxuICogICA8YnIgLz5cbiAqICAgKFRoaXMgb3B0aW9uIGlzIG9ubHkgbmVjZXNzYXJ5IHdoZW4gdXNpbmcgYGRvd25ncmFkZU1vZHVsZSgpYCB0byBkb3duZ3JhZGUgbW9yZSB0aGFuIG9uZVxuICogICBBbmd1bGFyIG1vZHVsZS4pXG4gKiAtIGBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuYDogV2hldGhlciB0byBwZXJmb3JtIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRlY3RDaGFuZ2VzXG4gKiAgIGNoYW5nZSBkZXRlY3Rpb259IG9uIHRoZSBjb21wb25lbnQgb24gZXZlcnlcbiAqICAgWyRkaWdlc3RdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy90eXBlLyRyb290U2NvcGUuU2NvcGUjJGRpZ2VzdCkuIElmIHNldCB0byBgZmFsc2VgLFxuICogICBjaGFuZ2UgZGV0ZWN0aW9uIHdpbGwgc3RpbGwgYmUgcGVyZm9ybWVkIHdoZW4gYW55IG9mIHRoZSBjb21wb25lbnQncyBpbnB1dHMgY2hhbmdlcy5cbiAqICAgKERlZmF1bHQ6IHRydWUpXG4gKlxuICogQHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBpbiBhblxuICogQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVDb21wb25lbnQoaW5mbzoge1xuICBjb21wb25lbnQ6IFR5cGU8YW55PjsgZG93bmdyYWRlZE1vZHVsZT86IHN0cmluZzsgcHJvcGFnYXRlRGlnZXN0PzogYm9vbGVhbjtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBpbnB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBvdXRwdXRzPzogc3RyaW5nW107XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgc2VsZWN0b3JzPzogc3RyaW5nW107XG59KTogYW55IC8qIGFuZ3VsYXIuSUluamVjdGFibGUgKi8ge1xuICBjb25zdCBkaXJlY3RpdmVGYWN0b3J5OiBJQW5ub3RhdGVkRnVuY3Rpb24gPSBmdW5jdGlvbihcbiAgICAgICRjb21waWxlOiBJQ29tcGlsZVNlcnZpY2UsICRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSwgJHBhcnNlOiBJUGFyc2VTZXJ2aWNlKTogSURpcmVjdGl2ZSB7XG4gICAgLy8gV2hlbiB1c2luZyBgZG93bmdyYWRlTW9kdWxlKClgLCB3ZSBuZWVkIHRvIGhhbmRsZSBjZXJ0YWluIHRoaW5ncyBzcGVjaWFsbHkuIEZvciBleGFtcGxlOlxuICAgIC8vIC0gV2UgYWx3YXlzIG5lZWQgdG8gYXR0YWNoIHRoZSBjb21wb25lbnQgdmlldyB0byB0aGUgYEFwcGxpY2F0aW9uUmVmYCBmb3IgaXQgdG8gYmVcbiAgICAvLyAgIGRpcnR5LWNoZWNrZWQuXG4gICAgLy8gLSBXZSBuZWVkIHRvIGVuc3VyZSBjYWxsYmFja3MgdG8gQW5ndWxhciBBUElzIChlLmcuIGNoYW5nZSBkZXRlY3Rpb24pIGFyZSBydW4gaW5zaWRlIHRoZVxuICAgIC8vICAgQW5ndWxhciB6b25lLlxuICAgIC8vICAgTk9URTogVGhpcyBpcyBub3QgbmVlZGVkLCB3aGVuIHVzaW5nIGBVcGdyYWRlTW9kdWxlYCwgYmVjYXVzZSBgJGRpZ2VzdCgpYCB3aWxsIGJlIHJ1blxuICAgIC8vICAgICAgICAgaW5zaWRlIHRoZSBBbmd1bGFyIHpvbmUgKGV4Y2VwdCBpZiBleHBsaWNpdGx5IGVzY2FwZWQsIGluIHdoaWNoIGNhc2Ugd2Ugc2hvdWxkbid0XG4gICAgLy8gICAgICAgICBmb3JjZSBpdCBiYWNrIGluKS5cbiAgICBjb25zdCBpc05nVXBncmFkZUxpdGUgPSBnZXRVcGdyYWRlQXBwVHlwZSgkaW5qZWN0b3IpID09PSBVcGdyYWRlQXBwVHlwZS5MaXRlO1xuICAgIGNvbnN0IHdyYXBDYWxsYmFjazogPFQ+KGNiOiAoKSA9PiBUKSA9PiB0eXBlb2YgY2IgPVxuICAgICAgICAhaXNOZ1VwZ3JhZGVMaXRlID8gY2IgPT4gY2IgOiBjYiA9PiAoKSA9PiBOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkgPyBjYigpIDogbmdab25lLnJ1bihjYik7XG4gICAgbGV0IG5nWm9uZTogTmdab25lO1xuXG4gICAgLy8gV2hlbiBkb3duZ3JhZGluZyBtdWx0aXBsZSBtb2R1bGVzLCBzcGVjaWFsIGhhbmRsaW5nIGlzIG5lZWRlZCB3cnQgaW5qZWN0b3JzLlxuICAgIGNvbnN0IGhhc011bHRpcGxlRG93bmdyYWRlZE1vZHVsZXMgPVxuICAgICAgICBpc05nVXBncmFkZUxpdGUgJiYgKGdldERvd25ncmFkZWRNb2R1bGVDb3VudCgkaW5qZWN0b3IpID4gMSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgICAgcmVxdWlyZTogW1JFUVVJUkVfSU5KRUNUT1IsIFJFUVVJUkVfTkdfTU9ERUxdLFxuICAgICAgbGluazogKHNjb3BlOiBJU2NvcGUsIGVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBJQXR0cmlidXRlcywgcmVxdWlyZWQ6IGFueVtdKSA9PiB7XG4gICAgICAgIC8vIFdlIG1pZ2h0IGhhdmUgdG8gY29tcGlsZSB0aGUgY29udGVudHMgYXN5bmNocm9ub3VzbHksIGJlY2F1c2UgdGhpcyBtaWdodCBoYXZlIGJlZW5cbiAgICAgICAgLy8gdHJpZ2dlcmVkIGJ5IGBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJgLCBiZWZvcmUgdGhlIEFuZ3VsYXIgdGVtcGxhdGVzIGhhdmVcbiAgICAgICAgLy8gYmVlbiBjb21waWxlZC5cblxuICAgICAgICBjb25zdCBuZ01vZGVsOiBJTmdNb2RlbENvbnRyb2xsZXIgPSByZXF1aXJlZFsxXTtcbiAgICAgICAgY29uc3QgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yfFRoZW5hYmxlPEluamVjdG9yPnx1bmRlZmluZWQgPSByZXF1aXJlZFswXTtcbiAgICAgICAgbGV0IG1vZHVsZUluamVjdG9yOiBJbmplY3RvcnxUaGVuYWJsZTxJbmplY3Rvcj58dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcmFuQXN5bmMgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIXBhcmVudEluamVjdG9yIHx8IGhhc011bHRpcGxlRG93bmdyYWRlZE1vZHVsZXMpIHtcbiAgICAgICAgICBjb25zdCBkb3duZ3JhZGVkTW9kdWxlID0gaW5mby5kb3duZ3JhZGVkTW9kdWxlIHx8ICcnO1xuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWZLZXkgPSBgJHtMQVpZX01PRFVMRV9SRUZ9JHtkb3duZ3JhZGVkTW9kdWxlfWA7XG4gICAgICAgICAgY29uc3QgYXR0ZW1wdGVkQWN0aW9uID0gYGluc3RhbnRpYXRpbmcgY29tcG9uZW50ICcke2dldFR5cGVOYW1lKGluZm8uY29tcG9uZW50KX0nYDtcblxuICAgICAgICAgIHZhbGlkYXRlSW5qZWN0aW9uS2V5KCRpbmplY3RvciwgZG93bmdyYWRlZE1vZHVsZSwgbGF6eU1vZHVsZVJlZktleSwgYXR0ZW1wdGVkQWN0aW9uKTtcblxuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWYgPSAkaW5qZWN0b3IuZ2V0KGxhenlNb2R1bGVSZWZLZXkpIGFzIExhenlNb2R1bGVSZWY7XG4gICAgICAgICAgbW9kdWxlSW5qZWN0b3IgPSBsYXp5TW9kdWxlUmVmLmluamVjdG9yIHx8IGxhenlNb2R1bGVSZWYucHJvbWlzZSBhcyBQcm9taXNlPEluamVjdG9yPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGVzOlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGVyZSBhcmUgdHdvIGluamVjdG9yczogYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZCBgZmluYWxQYXJlbnRJbmplY3RvcmAgKHRoZXkgbWlnaHQgYmVcbiAgICAgICAgLy8gdGhlIHNhbWUgaW5zdGFuY2UsIGJ1dCB0aGF0IGlzIGlycmVsZXZhbnQpOlxuICAgICAgICAvLyAtIGBmaW5hbE1vZHVsZUluamVjdG9yYCBpcyB1c2VkIHRvIHJldHJpZXZlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgLCB0aHVzIGl0IG11c3QgYmVcbiAgICAgICAgLy8gICBvbiB0aGUgc2FtZSB0cmVlIGFzIHRoZSBgTmdNb2R1bGVgIHRoYXQgZGVjbGFyZXMgdGhpcyBkb3duZ3JhZGVkIGNvbXBvbmVudC5cbiAgICAgICAgLy8gLSBgZmluYWxQYXJlbnRJbmplY3RvcmAgaXMgdXNlZCBmb3IgYWxsIG90aGVyIGluamVjdGlvbiBwdXJwb3Nlcy5cbiAgICAgICAgLy8gICAoTm90ZSB0aGF0IEFuZ3VsYXIga25vd3MgdG8gb25seSB0cmF2ZXJzZSB0aGUgY29tcG9uZW50LXRyZWUgcGFydCBvZiB0aGF0IGluamVjdG9yLFxuICAgICAgICAvLyAgIHdoZW4gbG9va2luZyBmb3IgYW4gaW5qZWN0YWJsZSBhbmQgdGhlbiBzd2l0Y2ggdG8gdGhlIG1vZHVsZSBpbmplY3Rvci4pXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZXJlIGFyZSBiYXNpY2FsbHkgdGhyZWUgY2FzZXM6XG4gICAgICAgIC8vIC0gSWYgdGhlcmUgaXMgbm8gcGFyZW50IGNvbXBvbmVudCAodGh1cyBubyBgcGFyZW50SW5qZWN0b3JgKSwgd2UgYm9vdHN0cmFwIHRoZSBkb3duZ3JhZGVkXG4gICAgICAgIC8vICAgYE5nTW9kdWxlYCBhbmQgdXNlIGl0cyBpbmplY3RvciBhcyBib3RoIGBmaW5hbE1vZHVsZUluamVjdG9yYCBhbmRcbiAgICAgICAgLy8gICBgZmluYWxQYXJlbnRJbmplY3RvcmAuXG4gICAgICAgIC8vIC0gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50IChhbmQgdGh1cyBhIGBwYXJlbnRJbmplY3RvcmApIGFuZCB3ZSBhcmUgc3VyZSB0aGF0IGl0XG4gICAgICAgIC8vICAgYmVsb25ncyB0byB0aGUgc2FtZSBgTmdNb2R1bGVgIGFzIHRoaXMgZG93bmdyYWRlZCBjb21wb25lbnQgKGUuZy4gYmVjYXVzZSB0aGVyZSBpcyBvbmx5XG4gICAgICAgIC8vICAgb25lIGRvd25ncmFkZWQgbW9kdWxlLCB3ZSB1c2UgdGhhdCBgcGFyZW50SW5qZWN0b3JgIGFzIGJvdGggYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZFxuICAgICAgICAvLyAgIGBmaW5hbFBhcmVudEluamVjdG9yYC5cbiAgICAgICAgLy8gLSBJZiB0aGVyZSBpcyBhIHBhcmVudCBjb21wb25lbnQsIGJ1dCBpdCBtYXkgYmVsb25nIHRvIGEgZGlmZmVyZW50IGBOZ01vZHVsZWAsIHRoZW4gd2VcbiAgICAgICAgLy8gICB1c2UgdGhlIGBwYXJlbnRJbmplY3RvcmAgYXMgYGZpbmFsUGFyZW50SW5qZWN0b3JgIGFuZCB0aGlzIGRvd25ncmFkZWQgY29tcG9uZW50J3NcbiAgICAgICAgLy8gICBkZWNsYXJpbmcgYE5nTW9kdWxlYCdzIGluamVjdG9yIGFzIGBmaW5hbE1vZHVsZUluamVjdG9yYC5cbiAgICAgICAgLy8gICBOb3RlIDE6IElmIHRoZSBgTmdNb2R1bGVgIGlzIGFscmVhZHkgYm9vdHN0cmFwcGVkLCB3ZSBqdXN0IGdldCBpdHMgaW5qZWN0b3IgKHdlIGRvbid0XG4gICAgICAgIC8vICAgICAgICAgICBib290c3RyYXAgYWdhaW4pLlxuICAgICAgICAvLyAgIE5vdGUgMjogSXQgaXMgcG9zc2libGUgdGhhdCAod2hpbGUgdGhlcmUgYXJlIG11bHRpcGxlIGRvd25ncmFkZWQgbW9kdWxlcykgdGhpc1xuICAgICAgICAvLyAgICAgICAgICAgZG93bmdyYWRlZCBjb21wb25lbnQgYW5kIGl0cyBwYXJlbnQgY29tcG9uZW50IGJvdGggYmVsb25nIHRvIHRoZSBzYW1lIE5nTW9kdWxlLlxuICAgICAgICAvLyAgICAgICAgICAgSW4gdGhhdCBjYXNlLCB3ZSBjb3VsZCBoYXZlIHVzZWQgdGhlIGBwYXJlbnRJbmplY3RvcmAgYXMgYm90aFxuICAgICAgICAvLyAgICAgICAgICAgYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZCBgZmluYWxQYXJlbnRJbmplY3RvcmAsIGJ1dCAoZm9yIHNpbXBsaWNpdHkpIHdlIGFyZVxuICAgICAgICAvLyAgICAgICAgICAgdHJlYXRpbmcgdGhpcyBjYXNlIGFzIGlmIHRoZXkgYmVsb25nIHRvIGRpZmZlcmVudCBgTmdNb2R1bGVgcy4gVGhhdCBkb2Vzbid0XG4gICAgICAgIC8vICAgICAgICAgICByZWFsbHkgYWZmZWN0IGFueXRoaW5nLCBzaW5jZSBgcGFyZW50SW5qZWN0b3JgIGhhcyBgbW9kdWxlSW5qZWN0b3JgIGFzIGFuY2VzdG9yXG4gICAgICAgIC8vICAgICAgICAgICBhbmQgdHJ5aW5nIHRvIHJlc29sdmUgYENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcmAgZnJvbSBlaXRoZXIgb25lIHdpbGwgcmV0dXJuXG4gICAgICAgIC8vICAgICAgICAgICB0aGUgc2FtZSBpbnN0YW5jZS5cblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHBhcmVudCBjb21wb25lbnQsIHVzZSBpdHMgaW5qZWN0b3IgYXMgcGFyZW50IGluamVjdG9yLlxuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgXCJ0b3AtbGV2ZWxcIiBBbmd1bGFyIGNvbXBvbmVudCwgdXNlIHRoZSBtb2R1bGUgaW5qZWN0b3IuXG4gICAgICAgIGNvbnN0IGZpbmFsUGFyZW50SW5qZWN0b3IgPSBwYXJlbnRJbmplY3RvciB8fCBtb2R1bGVJbmplY3RvciAhO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBcInRvcC1sZXZlbFwiIEFuZ3VsYXIgY29tcG9uZW50IG9yIHRoZSBwYXJlbnQgY29tcG9uZW50IG1heSBiZWxvbmcgdG8gYVxuICAgICAgICAvLyBkaWZmZXJlbnQgYE5nTW9kdWxlYCwgdXNlIHRoZSBtb2R1bGUgaW5qZWN0b3IgZm9yIG1vZHVsZS1zcGVjaWZpYyBkZXBlbmRlbmNpZXMuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgcGFyZW50IGNvbXBvbmVudCB0aGF0IGJlbG9uZ3MgdG8gdGhlIHNhbWUgYE5nTW9kdWxlYCwgdXNlIGl0cyBpbmplY3Rvci5cbiAgICAgICAgY29uc3QgZmluYWxNb2R1bGVJbmplY3RvciA9IG1vZHVsZUluamVjdG9yIHx8IHBhcmVudEluamVjdG9yICE7XG5cbiAgICAgICAgY29uc3QgZG9Eb3duZ3JhZGUgPSAoaW5qZWN0b3I6IEluamVjdG9yLCBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAvLyBSZXRyaWV2ZSBgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyYCBmcm9tIHRoZSBpbmplY3RvciB0aWVkIHRvIHRoZSBgTmdNb2R1bGVgIHRoaXNcbiAgICAgICAgICAvLyBjb21wb25lbnQgYmVsb25ncyB0by5cbiAgICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciA9XG4gICAgICAgICAgICAgIG1vZHVsZUluamVjdG9yLmdldChDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55PiA9XG4gICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShpbmZvLmNvbXBvbmVudCkgITtcblxuICAgICAgICAgIGlmICghY29tcG9uZW50RmFjdG9yeSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RpbmcgQ29tcG9uZW50RmFjdG9yeSBmb3I6ICR7Z2V0VHlwZU5hbWUoaW5mby5jb21wb25lbnQpfWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGluamVjdG9yUHJvbWlzZSA9IG5ldyBQYXJlbnRJbmplY3RvclByb21pc2UoZWxlbWVudCk7XG4gICAgICAgICAgY29uc3QgZmFjYWRlID0gbmV3IERvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXIoXG4gICAgICAgICAgICAgIGVsZW1lbnQsIGF0dHJzLCBzY29wZSwgbmdNb2RlbCwgaW5qZWN0b3IsICRpbmplY3RvciwgJGNvbXBpbGUsICRwYXJzZSxcbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeSwgd3JhcENhbGxiYWNrKTtcblxuICAgICAgICAgIGNvbnN0IHByb2plY3RhYmxlTm9kZXMgPSBmYWNhZGUuY29tcGlsZUNvbnRlbnRzKCk7XG4gICAgICAgICAgZmFjYWRlLmNyZWF0ZUNvbXBvbmVudChwcm9qZWN0YWJsZU5vZGVzKTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBJbnB1dHMoaXNOZ1VwZ3JhZGVMaXRlLCBpbmZvLnByb3BhZ2F0ZURpZ2VzdCk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwT3V0cHV0cygpO1xuICAgICAgICAgIGZhY2FkZS5yZWdpc3RlckNsZWFudXAoKTtcblxuICAgICAgICAgIGluamVjdG9yUHJvbWlzZS5yZXNvbHZlKGZhY2FkZS5nZXRJbmplY3RvcigpKTtcblxuICAgICAgICAgIGlmIChyYW5Bc3luYykge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBydW4gYXN5bmMsIGl0IGlzIHBvc3NpYmxlIHRoYXQgaXQgaXMgbm90IHJ1biBpbnNpZGUgYVxuICAgICAgICAgICAgLy8gZGlnZXN0IGFuZCBpbml0aWFsIGlucHV0IHZhbHVlcyB3aWxsIG5vdCBiZSBkZXRlY3RlZC5cbiAgICAgICAgICAgIHNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge30pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkb3duZ3JhZGVGbiA9XG4gICAgICAgICAgICAhaXNOZ1VwZ3JhZGVMaXRlID8gZG9Eb3duZ3JhZGUgOiAocEluamVjdG9yOiBJbmplY3RvciwgbUluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgICAgICBpZiAoIW5nWm9uZSkge1xuICAgICAgICAgICAgICAgIG5nWm9uZSA9IHBJbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHdyYXBDYWxsYmFjaygoKSA9PiBkb0Rvd25ncmFkZShwSW5qZWN0b3IsIG1JbmplY3RvcikpKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpc1RoZW5hYmxlKGZpbmFsUGFyZW50SW5qZWN0b3IpIHx8IGlzVGhlbmFibGUoZmluYWxNb2R1bGVJbmplY3RvcikpIHtcbiAgICAgICAgICBQcm9taXNlLmFsbChbZmluYWxQYXJlbnRJbmplY3RvciwgZmluYWxNb2R1bGVJbmplY3Rvcl0pXG4gICAgICAgICAgICAgIC50aGVuKChbcEluamVjdG9yLCBtSW5qZWN0b3JdKSA9PiBkb3duZ3JhZGVGbihwSW5qZWN0b3IsIG1JbmplY3RvcikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvd25ncmFkZUZuKGZpbmFsUGFyZW50SW5qZWN0b3IsIGZpbmFsTW9kdWxlSW5qZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmFuQXN5bmMgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gYnJhY2tldC1ub3RhdGlvbiBiZWNhdXNlIG9mIGNsb3N1cmUgLSBzZWUgIzE0NDQxXG4gIGRpcmVjdGl2ZUZhY3RvcnlbJyRpbmplY3QnXSA9IFskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0VdO1xuICByZXR1cm4gZGlyZWN0aXZlRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhciAxJ3MgJGNvbXBpbGUuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGluamVjdG9yICE6IEluamVjdG9yO1xuICBwcml2YXRlIGluamVjdG9yS2V5OiBzdHJpbmcgPSBjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSk7XG4gIHByaXZhdGUgY2FsbGJhY2tzOiAoKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgLy8gU3RvcmUgdGhlIHByb21pc2Ugb24gdGhlIGVsZW1lbnQuXG4gICAgZWxlbWVudC5kYXRhICEodGhpcy5pbmplY3RvcktleSwgdGhpcyk7XG4gIH1cblxuICB0aGVuKGNhbGxiYWNrOiAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbmplY3Rvcikge1xuICAgICAgY2FsbGJhY2sodGhpcy5pbmplY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmUoaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5pbmplY3RvciA9IGluamVjdG9yO1xuXG4gICAgLy8gU3RvcmUgdGhlIHJlYWwgaW5qZWN0b3Igb24gdGhlIGVsZW1lbnQuXG4gICAgdGhpcy5lbGVtZW50LmRhdGEgISh0aGlzLmluamVjdG9yS2V5LCBpbmplY3Rvcik7XG5cbiAgICAvLyBSZWxlYXNlIHRoZSBlbGVtZW50IHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLlxuICAgIHRoaXMuZWxlbWVudCA9IG51bGwgITtcblxuICAgIC8vIFJ1biB0aGUgcXVldWVkIGNhbGxiYWNrcy5cbiAgICB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKGluamVjdG9yKSk7XG4gICAgdGhpcy5jYWxsYmFja3MubGVuZ3RoID0gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1RoZW5hYmxlPFQ+KG9iajogb2JqZWN0KTogb2JqIGlzIFRoZW5hYmxlPFQ+IHtcbiAgcmV0dXJuIGlzRnVuY3Rpb24oKG9iaiBhcyBhbnkpLnRoZW4pO1xufVxuIl19