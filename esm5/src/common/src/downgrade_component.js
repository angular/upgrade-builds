/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __extends, __read } from "tslib";
import { ComponentFactoryResolver, NgZone } from '@angular/core';
import { $COMPILE, $INJECTOR, $PARSE, INJECTOR_KEY, LAZY_MODULE_REF, REQUIRE_INJECTOR, REQUIRE_NG_MODEL } from './constants';
import { DowngradeComponentAdapter } from './downgrade_component_adapter';
import { SyncPromise } from './promise_util';
import { controllerKey, getDowngradedModuleCount, getTypeName, getUpgradeAppType, validateInjectionKey } from './util';
/**
 * @description
 *
 * A helper function that allows an Angular component to be used from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation*
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
 * For more details and examples on downgrading Angular components to AngularJS components please
 * visit the [Upgrade guide](guide/upgrade#using-angular-components-from-angularjs-code).
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
                // NOTE:
                // Not using `ParentInjectorPromise.all()` (which is inherited from `SyncPromise`), because
                // Closure Compiler (or some related tool) complains:
                // `TypeError: ...$src$downgrade_component_ParentInjectorPromise.all is not a function`
                SyncPromise.all([finalParentInjector, finalModuleInjector])
                    .then(function (_a) {
                    var _b = __read(_a, 2), pInjector = _b[0], mInjector = _b[1];
                    return downgradeFn(pInjector, mInjector);
                });
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
 * to preserve the synchronous nature of AngularJS's `$compile`.
 */
var ParentInjectorPromise = /** @class */ (function (_super) {
    __extends(ParentInjectorPromise, _super);
    function ParentInjectorPromise(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.injectorKey = controllerKey(INJECTOR_KEY);
        // Store the promise on the element.
        element.data(_this.injectorKey, _this);
        return _this;
    }
    ParentInjectorPromise.prototype.resolve = function (injector) {
        // Store the real injector on the element.
        this.element.data(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = null;
        // Resolve the promise.
        _super.prototype.resolve.call(this, injector);
    };
    return ParentInjectorPromise;
}(SyncPromise));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi9zcmMvZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFtQix3QkFBd0IsRUFBWSxNQUFNLEVBQU8sTUFBTSxlQUFlLENBQUM7QUFHakcsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDM0gsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDeEUsT0FBTyxFQUFDLFdBQVcsRUFBVyxNQUFNLGdCQUFnQixDQUFDO0FBQ3JELE9BQU8sRUFBZ0MsYUFBYSxFQUFFLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUdwSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0RHO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBUWxDO0lBQ0MsSUFBTSxnQkFBZ0IsR0FBdUIsVUFDekMsUUFBeUIsRUFBRSxTQUEyQixFQUFFLE1BQXFCO1FBQy9FLDJGQUEyRjtRQUMzRixxRkFBcUY7UUFDckYsbUJBQW1CO1FBQ25CLDJGQUEyRjtRQUMzRixrQkFBa0I7UUFDbEIsMEZBQTBGO1FBQzFGLDRGQUE0RjtRQUM1Riw2QkFBNkI7UUFDN0IsSUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGlCQUF3QixDQUFDO1FBQzdFLElBQU0sWUFBWSxHQUNkLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxVQUFB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LENBQUM7UUFFaEQsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBTSxDQUFDO1FBRXRCLHVCQUF1QjtRQUN2QixpQkFBTSxPQUFPLFlBQUMsUUFBUSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUNILDRCQUFDO0FBQUQsQ0FBQyxBQXBCRCxDQUFvQyxXQUFXLEdBb0I5QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yLCBOZ1pvbmUsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0lBbm5vdGF0ZWRGdW5jdGlvbiwgSUF0dHJpYnV0ZXMsIElBdWdtZW50ZWRKUXVlcnksIElDb21waWxlU2VydmljZSwgSURpcmVjdGl2ZSwgSUluamVjdG9yU2VydmljZSwgSU5nTW9kZWxDb250cm9sbGVyLCBJUGFyc2VTZXJ2aWNlLCBJU2NvcGV9IGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0UsIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0Rvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXJ9IGZyb20gJy4vZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyJztcbmltcG9ydCB7U3luY1Byb21pc2UsIFRoZW5hYmxlfSBmcm9tICcuL3Byb21pc2VfdXRpbCc7XG5pbXBvcnQge0xhenlNb2R1bGVSZWYsIFVwZ3JhZGVBcHBUeXBlLCBjb250cm9sbGVyS2V5LCBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQsIGdldFR5cGVOYW1lLCBnZXRVcGdyYWRlQXBwVHlwZSwgdmFsaWRhdGVJbmplY3Rpb25LZXl9IGZyb20gJy4vdXRpbCc7XG5cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IGFsbG93cyBhbiBBbmd1bGFyIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQU9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRvIGJlIHVzZWQgZm9yIHJlZ2lzdGVyaW5nXG4gKiBhbiBBbmd1bGFySlMgd3JhcHBlciBkaXJlY3RpdmUgZm9yIFwiZG93bmdyYWRpbmdcIiBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogTGV0J3MgYXNzdW1lIHRoYXQgeW91IGhhdmUgYW4gQW5ndWxhciBjb21wb25lbnQgY2FsbGVkIGBuZzJIZXJvZXNgIHRoYXQgbmVlZHNcbiAqIHRvIGJlIG1hZGUgYXZhaWxhYmxlIGluIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXNcIn1cbiAqXG4gKiBXZSBtdXN0IGNyZWF0ZSBhbiBBbmd1bGFySlMgW2RpcmVjdGl2ZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvZ3VpZGUvZGlyZWN0aXZlKVxuICogdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFyIGNvbXBvbmVudCBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMuXG4gKiBUaGUgYGRvd25ncmFkZUNvbXBvbmVudCgpYCBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IHdlXG4gKiBjYW4gdXNlIHRvIGRlZmluZSB0aGUgQW5ndWxhckpTIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIHRoZSBcImRvd25ncmFkZWRcIiBjb21wb25lbnQuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXMtd3JhcHBlclwifVxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGVzIG9uIGRvd25ncmFkaW5nIEFuZ3VsYXIgY29tcG9uZW50cyB0byBBbmd1bGFySlMgY29tcG9uZW50cyBwbGVhc2VcbiAqIHZpc2l0IHRoZSBbVXBncmFkZSBndWlkZV0oZ3VpZGUvdXBncmFkZSN1c2luZy1hbmd1bGFyLWNvbXBvbmVudHMtZnJvbS1hbmd1bGFyanMtY29kZSkuXG4gKlxuICogQHBhcmFtIGluZm8gY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIENvbXBvbmVudCB0aGF0IGlzIGJlaW5nIGRvd25ncmFkZWQ6XG4gKlxuICogLSBgY29tcG9uZW50OiBUeXBlPGFueT5gOiBUaGUgdHlwZSBvZiB0aGUgQ29tcG9uZW50IHRoYXQgd2lsbCBiZSBkb3duZ3JhZGVkXG4gKiAtIGBkb3duZ3JhZGVkTW9kdWxlPzogc3RyaW5nYDogVGhlIG5hbWUgb2YgdGhlIGRvd25ncmFkZWQgbW9kdWxlIChpZiBhbnkpIHRoYXQgdGhlIGNvbXBvbmVudFxuICogICBcImJlbG9uZ3MgdG9cIiwgYXMgcmV0dXJuZWQgYnkgYSBjYWxsIHRvIGBkb3duZ3JhZGVNb2R1bGUoKWAuIEl0IGlzIHRoZSBtb2R1bGUsIHdob3NlXG4gKiAgIGNvcnJlc3BvbmRpbmcgQW5ndWxhciBtb2R1bGUgd2lsbCBiZSBib290c3RyYXBwZWQsIHdoZW4gdGhlIGNvbXBvbmVudCBuZWVkcyB0byBiZSBpbnN0YW50aWF0ZWQuXG4gKiAgIDxiciAvPlxuICogICAoVGhpcyBvcHRpb24gaXMgb25seSBuZWNlc3Nhcnkgd2hlbiB1c2luZyBgZG93bmdyYWRlTW9kdWxlKClgIHRvIGRvd25ncmFkZSBtb3JlIHRoYW4gb25lXG4gKiAgIEFuZ3VsYXIgbW9kdWxlLilcbiAqIC0gYHByb3BhZ2F0ZURpZ2VzdD86IGJvb2xlYW5gOiBXaGV0aGVyIHRvIHBlcmZvcm0ge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGVjdENoYW5nZXNcbiAqICAgY2hhbmdlIGRldGVjdGlvbn0gb24gdGhlIGNvbXBvbmVudCBvbiBldmVyeVxuICogICBbJGRpZ2VzdF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KS4gSWYgc2V0IHRvIGBmYWxzZWAsXG4gKiAgIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBzdGlsbCBiZSBwZXJmb3JtZWQgd2hlbiBhbnkgb2YgdGhlIGNvbXBvbmVudCdzIGlucHV0cyBjaGFuZ2VzLlxuICogICAoRGVmYXVsdDogdHJ1ZSlcbiAqXG4gKiBAcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGluIGFuXG4gKiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUNvbXBvbmVudChpbmZvOiB7XG4gIGNvbXBvbmVudDogVHlwZTxhbnk+OyBkb3duZ3JhZGVkTW9kdWxlPzogc3RyaW5nOyBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIGlucHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIG91dHB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBzZWxlY3RvcnM/OiBzdHJpbmdbXTtcbn0pOiBhbnkgLyogYW5ndWxhci5JSW5qZWN0YWJsZSAqLyB7XG4gIGNvbnN0IGRpcmVjdGl2ZUZhY3Rvcnk6IElBbm5vdGF0ZWRGdW5jdGlvbiA9IGZ1bmN0aW9uKFxuICAgICAgJGNvbXBpbGU6IElDb21waWxlU2VydmljZSwgJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlLCAkcGFyc2U6IElQYXJzZVNlcnZpY2UpOiBJRGlyZWN0aXZlIHtcbiAgICAvLyBXaGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAsIHdlIG5lZWQgdG8gaGFuZGxlIGNlcnRhaW4gdGhpbmdzIHNwZWNpYWxseS4gRm9yIGV4YW1wbGU6XG4gICAgLy8gLSBXZSBhbHdheXMgbmVlZCB0byBhdHRhY2ggdGhlIGNvbXBvbmVudCB2aWV3IHRvIHRoZSBgQXBwbGljYXRpb25SZWZgIGZvciBpdCB0byBiZVxuICAgIC8vICAgZGlydHktY2hlY2tlZC5cbiAgICAvLyAtIFdlIG5lZWQgdG8gZW5zdXJlIGNhbGxiYWNrcyB0byBBbmd1bGFyIEFQSXMgKGUuZy4gY2hhbmdlIGRldGVjdGlvbikgYXJlIHJ1biBpbnNpZGUgdGhlXG4gICAgLy8gICBBbmd1bGFyIHpvbmUuXG4gICAgLy8gICBOT1RFOiBUaGlzIGlzIG5vdCBuZWVkZWQsIHdoZW4gdXNpbmcgYFVwZ3JhZGVNb2R1bGVgLCBiZWNhdXNlIGAkZGlnZXN0KClgIHdpbGwgYmUgcnVuXG4gICAgLy8gICAgICAgICBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZSAoZXhjZXB0IGlmIGV4cGxpY2l0bHkgZXNjYXBlZCwgaW4gd2hpY2ggY2FzZSB3ZSBzaG91bGRuJ3RcbiAgICAvLyAgICAgICAgIGZvcmNlIGl0IGJhY2sgaW4pLlxuICAgIGNvbnN0IGlzTmdVcGdyYWRlTGl0ZSA9IGdldFVwZ3JhZGVBcHBUeXBlKCRpbmplY3RvcikgPT09IFVwZ3JhZGVBcHBUeXBlLkxpdGU7XG4gICAgY29uc3Qgd3JhcENhbGxiYWNrOiA8VD4oY2I6ICgpID0+IFQpID0+IHR5cGVvZiBjYiA9XG4gICAgICAgICFpc05nVXBncmFkZUxpdGUgPyBjYiA9PiBjYiA6IGNiID0+ICgpID0+IE5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSA/IGNiKCkgOiBuZ1pvbmUucnVuKGNiKTtcbiAgICBsZXQgbmdab25lOiBOZ1pvbmU7XG5cbiAgICAvLyBXaGVuIGRvd25ncmFkaW5nIG11bHRpcGxlIG1vZHVsZXMsIHNwZWNpYWwgaGFuZGxpbmcgaXMgbmVlZGVkIHdydCBpbmplY3RvcnMuXG4gICAgY29uc3QgaGFzTXVsdGlwbGVEb3duZ3JhZGVkTW9kdWxlcyA9XG4gICAgICAgIGlzTmdVcGdyYWRlTGl0ZSAmJiAoZ2V0RG93bmdyYWRlZE1vZHVsZUNvdW50KCRpbmplY3RvcikgPiAxKTtcblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgdGVybWluYWw6IHRydWUsXG4gICAgICByZXF1aXJlOiBbUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTF0sXG4gICAgICBsaW5rOiAoc2NvcGU6IElTY29wZSwgZWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IElBdHRyaWJ1dGVzLCByZXF1aXJlZDogYW55W10pID0+IHtcbiAgICAgICAgLy8gV2UgbWlnaHQgaGF2ZSB0byBjb21waWxlIHRoZSBjb250ZW50cyBhc3luY2hyb25vdXNseSwgYmVjYXVzZSB0aGlzIG1pZ2h0IGhhdmUgYmVlblxuICAgICAgICAvLyB0cmlnZ2VyZWQgYnkgYFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcmAsIGJlZm9yZSB0aGUgQW5ndWxhciB0ZW1wbGF0ZXMgaGF2ZVxuICAgICAgICAvLyBiZWVuIGNvbXBpbGVkLlxuXG4gICAgICAgIGNvbnN0IG5nTW9kZWw6IElOZ01vZGVsQ29udHJvbGxlciA9IHJlcXVpcmVkWzFdO1xuICAgICAgICBjb25zdCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3J8VGhlbmFibGU8SW5qZWN0b3I+fHVuZGVmaW5lZCA9IHJlcXVpcmVkWzBdO1xuICAgICAgICBsZXQgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yfFRoZW5hYmxlPEluamVjdG9yPnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByYW5Bc3luYyA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghcGFyZW50SW5qZWN0b3IgfHwgaGFzTXVsdGlwbGVEb3duZ3JhZGVkTW9kdWxlcykge1xuICAgICAgICAgIGNvbnN0IGRvd25ncmFkZWRNb2R1bGUgPSBpbmZvLmRvd25ncmFkZWRNb2R1bGUgfHwgJyc7XG4gICAgICAgICAgY29uc3QgbGF6eU1vZHVsZVJlZktleSA9IGAke0xBWllfTU9EVUxFX1JFRn0ke2Rvd25ncmFkZWRNb2R1bGV9YDtcbiAgICAgICAgICBjb25zdCBhdHRlbXB0ZWRBY3Rpb24gPSBgaW5zdGFudGlhdGluZyBjb21wb25lbnQgJyR7Z2V0VHlwZU5hbWUoaW5mby5jb21wb25lbnQpfSdgO1xuXG4gICAgICAgICAgdmFsaWRhdGVJbmplY3Rpb25LZXkoJGluamVjdG9yLCBkb3duZ3JhZGVkTW9kdWxlLCBsYXp5TW9kdWxlUmVmS2V5LCBhdHRlbXB0ZWRBY3Rpb24pO1xuXG4gICAgICAgICAgY29uc3QgbGF6eU1vZHVsZVJlZiA9ICRpbmplY3Rvci5nZXQobGF6eU1vZHVsZVJlZktleSkgYXMgTGF6eU1vZHVsZVJlZjtcbiAgICAgICAgICBtb2R1bGVJbmplY3RvciA9IGxhenlNb2R1bGVSZWYuaW5qZWN0b3IgfHwgbGF6eU1vZHVsZVJlZi5wcm9taXNlIGFzIFByb21pc2U8SW5qZWN0b3I+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm90ZXM6XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZXJlIGFyZSB0d28gaW5qZWN0b3JzOiBgZmluYWxNb2R1bGVJbmplY3RvcmAgYW5kIGBmaW5hbFBhcmVudEluamVjdG9yYCAodGhleSBtaWdodCBiZVxuICAgICAgICAvLyB0aGUgc2FtZSBpbnN0YW5jZSwgYnV0IHRoYXQgaXMgaXJyZWxldmFudCk6XG4gICAgICAgIC8vIC0gYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGlzIHVzZWQgdG8gcmV0cmlldmUgYENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcmAsIHRodXMgaXQgbXVzdCBiZVxuICAgICAgICAvLyAgIG9uIHRoZSBzYW1lIHRyZWUgYXMgdGhlIGBOZ01vZHVsZWAgdGhhdCBkZWNsYXJlcyB0aGlzIGRvd25ncmFkZWQgY29tcG9uZW50LlxuICAgICAgICAvLyAtIGBmaW5hbFBhcmVudEluamVjdG9yYCBpcyB1c2VkIGZvciBhbGwgb3RoZXIgaW5qZWN0aW9uIHB1cnBvc2VzLlxuICAgICAgICAvLyAgIChOb3RlIHRoYXQgQW5ndWxhciBrbm93cyB0byBvbmx5IHRyYXZlcnNlIHRoZSBjb21wb25lbnQtdHJlZSBwYXJ0IG9mIHRoYXQgaW5qZWN0b3IsXG4gICAgICAgIC8vICAgd2hlbiBsb29raW5nIGZvciBhbiBpbmplY3RhYmxlIGFuZCB0aGVuIHN3aXRjaCB0byB0aGUgbW9kdWxlIGluamVjdG9yLilcbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlcmUgYXJlIGJhc2ljYWxseSB0aHJlZSBjYXNlczpcbiAgICAgICAgLy8gLSBJZiB0aGVyZSBpcyBubyBwYXJlbnQgY29tcG9uZW50ICh0aHVzIG5vIGBwYXJlbnRJbmplY3RvcmApLCB3ZSBib290c3RyYXAgdGhlIGRvd25ncmFkZWRcbiAgICAgICAgLy8gICBgTmdNb2R1bGVgIGFuZCB1c2UgaXRzIGluamVjdG9yIGFzIGJvdGggYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZFxuICAgICAgICAvLyAgIGBmaW5hbFBhcmVudEluamVjdG9yYC5cbiAgICAgICAgLy8gLSBJZiB0aGVyZSBpcyBhIHBhcmVudCBjb21wb25lbnQgKGFuZCB0aHVzIGEgYHBhcmVudEluamVjdG9yYCkgYW5kIHdlIGFyZSBzdXJlIHRoYXQgaXRcbiAgICAgICAgLy8gICBiZWxvbmdzIHRvIHRoZSBzYW1lIGBOZ01vZHVsZWAgYXMgdGhpcyBkb3duZ3JhZGVkIGNvbXBvbmVudCAoZS5nLiBiZWNhdXNlIHRoZXJlIGlzIG9ubHlcbiAgICAgICAgLy8gICBvbmUgZG93bmdyYWRlZCBtb2R1bGUsIHdlIHVzZSB0aGF0IGBwYXJlbnRJbmplY3RvcmAgYXMgYm90aCBgZmluYWxNb2R1bGVJbmplY3RvcmAgYW5kXG4gICAgICAgIC8vICAgYGZpbmFsUGFyZW50SW5qZWN0b3JgLlxuICAgICAgICAvLyAtIElmIHRoZXJlIGlzIGEgcGFyZW50IGNvbXBvbmVudCwgYnV0IGl0IG1heSBiZWxvbmcgdG8gYSBkaWZmZXJlbnQgYE5nTW9kdWxlYCwgdGhlbiB3ZVxuICAgICAgICAvLyAgIHVzZSB0aGUgYHBhcmVudEluamVjdG9yYCBhcyBgZmluYWxQYXJlbnRJbmplY3RvcmAgYW5kIHRoaXMgZG93bmdyYWRlZCBjb21wb25lbnQnc1xuICAgICAgICAvLyAgIGRlY2xhcmluZyBgTmdNb2R1bGVgJ3MgaW5qZWN0b3IgYXMgYGZpbmFsTW9kdWxlSW5qZWN0b3JgLlxuICAgICAgICAvLyAgIE5vdGUgMTogSWYgdGhlIGBOZ01vZHVsZWAgaXMgYWxyZWFkeSBib290c3RyYXBwZWQsIHdlIGp1c3QgZ2V0IGl0cyBpbmplY3RvciAod2UgZG9uJ3RcbiAgICAgICAgLy8gICAgICAgICAgIGJvb3RzdHJhcCBhZ2FpbikuXG4gICAgICAgIC8vICAgTm90ZSAyOiBJdCBpcyBwb3NzaWJsZSB0aGF0ICh3aGlsZSB0aGVyZSBhcmUgbXVsdGlwbGUgZG93bmdyYWRlZCBtb2R1bGVzKSB0aGlzXG4gICAgICAgIC8vICAgICAgICAgICBkb3duZ3JhZGVkIGNvbXBvbmVudCBhbmQgaXRzIHBhcmVudCBjb21wb25lbnQgYm90aCBiZWxvbmcgdG8gdGhlIHNhbWUgTmdNb2R1bGUuXG4gICAgICAgIC8vICAgICAgICAgICBJbiB0aGF0IGNhc2UsIHdlIGNvdWxkIGhhdmUgdXNlZCB0aGUgYHBhcmVudEluamVjdG9yYCBhcyBib3RoXG4gICAgICAgIC8vICAgICAgICAgICBgZmluYWxNb2R1bGVJbmplY3RvcmAgYW5kIGBmaW5hbFBhcmVudEluamVjdG9yYCwgYnV0IChmb3Igc2ltcGxpY2l0eSkgd2UgYXJlXG4gICAgICAgIC8vICAgICAgICAgICB0cmVhdGluZyB0aGlzIGNhc2UgYXMgaWYgdGhleSBiZWxvbmcgdG8gZGlmZmVyZW50IGBOZ01vZHVsZWBzLiBUaGF0IGRvZXNuJ3RcbiAgICAgICAgLy8gICAgICAgICAgIHJlYWxseSBhZmZlY3QgYW55dGhpbmcsIHNpbmNlIGBwYXJlbnRJbmplY3RvcmAgaGFzIGBtb2R1bGVJbmplY3RvcmAgYXMgYW5jZXN0b3JcbiAgICAgICAgLy8gICAgICAgICAgIGFuZCB0cnlpbmcgdG8gcmVzb2x2ZSBgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyYCBmcm9tIGVpdGhlciBvbmUgd2lsbCByZXR1cm5cbiAgICAgICAgLy8gICAgICAgICAgIHRoZSBzYW1lIGluc3RhbmNlLlxuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgcGFyZW50IGNvbXBvbmVudCwgdXNlIGl0cyBpbmplY3RvciBhcyBwYXJlbnQgaW5qZWN0b3IuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBcInRvcC1sZXZlbFwiIEFuZ3VsYXIgY29tcG9uZW50LCB1c2UgdGhlIG1vZHVsZSBpbmplY3Rvci5cbiAgICAgICAgY29uc3QgZmluYWxQYXJlbnRJbmplY3RvciA9IHBhcmVudEluamVjdG9yIHx8IG1vZHVsZUluamVjdG9yICE7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIFwidG9wLWxldmVsXCIgQW5ndWxhciBjb21wb25lbnQgb3IgdGhlIHBhcmVudCBjb21wb25lbnQgbWF5IGJlbG9uZyB0byBhXG4gICAgICAgIC8vIGRpZmZlcmVudCBgTmdNb2R1bGVgLCB1c2UgdGhlIG1vZHVsZSBpbmplY3RvciBmb3IgbW9kdWxlLXNwZWNpZmljIGRlcGVuZGVuY2llcy5cbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50IHRoYXQgYmVsb25ncyB0byB0aGUgc2FtZSBgTmdNb2R1bGVgLCB1c2UgaXRzIGluamVjdG9yLlxuICAgICAgICBjb25zdCBmaW5hbE1vZHVsZUluamVjdG9yID0gbW9kdWxlSW5qZWN0b3IgfHwgcGFyZW50SW5qZWN0b3IgITtcblxuICAgICAgICBjb25zdCBkb0Rvd25ncmFkZSA9IChpbmplY3RvcjogSW5qZWN0b3IsIG1vZHVsZUluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIC8vIFJldHJpZXZlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgIGZyb20gdGhlIGluamVjdG9yIHRpZWQgdG8gdGhlIGBOZ01vZHVsZWAgdGhpc1xuICAgICAgICAgIC8vIGNvbXBvbmVudCBiZWxvbmdzIHRvLlxuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyID1cbiAgICAgICAgICAgICAgbW9kdWxlSW5qZWN0b3IuZ2V0KENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+ID1cbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGluZm8uY29tcG9uZW50KSAhO1xuXG4gICAgICAgICAgaWYgKCFjb21wb25lbnRGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGluZyBDb21wb25lbnRGYWN0b3J5IGZvcjogJHtnZXRUeXBlTmFtZShpbmZvLmNvbXBvbmVudCl9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaW5qZWN0b3JQcm9taXNlID0gbmV3IFBhcmVudEluamVjdG9yUHJvbWlzZShlbGVtZW50KTtcbiAgICAgICAgICBjb25zdCBmYWNhZGUgPSBuZXcgRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcihcbiAgICAgICAgICAgICAgZWxlbWVudCwgYXR0cnMsIHNjb3BlLCBuZ01vZGVsLCBpbmplY3RvciwgJGluamVjdG9yLCAkY29tcGlsZSwgJHBhcnNlLFxuICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5LCB3cmFwQ2FsbGJhY2spO1xuXG4gICAgICAgICAgY29uc3QgcHJvamVjdGFibGVOb2RlcyA9IGZhY2FkZS5jb21waWxlQ29udGVudHMoKTtcbiAgICAgICAgICBmYWNhZGUuY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXMpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cElucHV0cyhpc05nVXBncmFkZUxpdGUsIGluZm8ucHJvcGFnYXRlRGlnZXN0KTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBPdXRwdXRzKCk7XG4gICAgICAgICAgZmFjYWRlLnJlZ2lzdGVyQ2xlYW51cCgpO1xuXG4gICAgICAgICAgaW5qZWN0b3JQcm9taXNlLnJlc29sdmUoZmFjYWRlLmdldEluamVjdG9yKCkpO1xuXG4gICAgICAgICAgaWYgKHJhbkFzeW5jKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIHJ1biBhc3luYywgaXQgaXMgcG9zc2libGUgdGhhdCBpdCBpcyBub3QgcnVuIGluc2lkZSBhXG4gICAgICAgICAgICAvLyBkaWdlc3QgYW5kIGluaXRpYWwgaW5wdXQgdmFsdWVzIHdpbGwgbm90IGJlIGRldGVjdGVkLlxuICAgICAgICAgICAgc2NvcGUuJGV2YWxBc3luYygoKSA9PiB7fSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGRvd25ncmFkZUZuID1cbiAgICAgICAgICAgICFpc05nVXBncmFkZUxpdGUgPyBkb0Rvd25ncmFkZSA6IChwSW5qZWN0b3I6IEluamVjdG9yLCBtSW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghbmdab25lKSB7XG4gICAgICAgICAgICAgICAgbmdab25lID0gcEluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgd3JhcENhbGxiYWNrKCgpID0+IGRvRG93bmdyYWRlKHBJbmplY3RvciwgbUluamVjdG9yKSkoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gTk9URTpcbiAgICAgICAgLy8gTm90IHVzaW5nIGBQYXJlbnRJbmplY3RvclByb21pc2UuYWxsKClgICh3aGljaCBpcyBpbmhlcml0ZWQgZnJvbSBgU3luY1Byb21pc2VgKSwgYmVjYXVzZVxuICAgICAgICAvLyBDbG9zdXJlIENvbXBpbGVyIChvciBzb21lIHJlbGF0ZWQgdG9vbCkgY29tcGxhaW5zOlxuICAgICAgICAvLyBgVHlwZUVycm9yOiAuLi4kc3JjJGRvd25ncmFkZV9jb21wb25lbnRfUGFyZW50SW5qZWN0b3JQcm9taXNlLmFsbCBpcyBub3QgYSBmdW5jdGlvbmBcbiAgICAgICAgU3luY1Byb21pc2UuYWxsKFtmaW5hbFBhcmVudEluamVjdG9yLCBmaW5hbE1vZHVsZUluamVjdG9yXSlcbiAgICAgICAgICAgIC50aGVuKChbcEluamVjdG9yLCBtSW5qZWN0b3JdKSA9PiBkb3duZ3JhZGVGbihwSW5qZWN0b3IsIG1JbmplY3RvcikpO1xuXG4gICAgICAgIHJhbkFzeW5jID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIGJyYWNrZXQtbm90YXRpb24gYmVjYXVzZSBvZiBjbG9zdXJlIC0gc2VlICMxNDQ0MVxuICBkaXJlY3RpdmVGYWN0b3J5WyckaW5qZWN0J10gPSBbJENPTVBJTEUsICRJTkpFQ1RPUiwgJFBBUlNFXTtcbiAgcmV0dXJuIGRpcmVjdGl2ZUZhY3Rvcnk7XG59XG5cbi8qKlxuICogU3luY2hyb25vdXMgcHJvbWlzZS1saWtlIG9iamVjdCB0byB3cmFwIHBhcmVudCBpbmplY3RvcnMsXG4gKiB0byBwcmVzZXJ2ZSB0aGUgc3luY2hyb25vdXMgbmF0dXJlIG9mIEFuZ3VsYXJKUydzIGAkY29tcGlsZWAuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSBleHRlbmRzIFN5bmNQcm9taXNlPEluamVjdG9yPiB7XG4gIHByaXZhdGUgaW5qZWN0b3JLZXk6IHN0cmluZyA9IGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy8gU3RvcmUgdGhlIHByb21pc2Ugb24gdGhlIGVsZW1lbnQuXG4gICAgZWxlbWVudC5kYXRhICEodGhpcy5pbmplY3RvcktleSwgdGhpcyk7XG4gIH1cblxuICByZXNvbHZlKGluamVjdG9yOiBJbmplY3Rvcik6IHZvaWQge1xuICAgIC8vIFN0b3JlIHRoZSByZWFsIGluamVjdG9yIG9uIHRoZSBlbGVtZW50LlxuICAgIHRoaXMuZWxlbWVudC5kYXRhICEodGhpcy5pbmplY3RvcktleSwgaW5qZWN0b3IpO1xuXG4gICAgLy8gUmVsZWFzZSB0aGUgZWxlbWVudCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrcy5cbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsICE7XG5cbiAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlLlxuICAgIHN1cGVyLnJlc29sdmUoaW5qZWN0b3IpO1xuICB9XG59XG4iXX0=