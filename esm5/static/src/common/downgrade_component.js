/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver, NgZone } from '@angular/core';
import { $COMPILE, $INJECTOR, $PARSE, INJECTOR_KEY, LAZY_MODULE_REF, REQUIRE_INJECTOR, REQUIRE_NG_MODEL } from './constants';
import { DowngradeComponentAdapter } from './downgrade_component_adapter';
import { controllerKey, getComponentName, isFunction } from './util';
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
 * * `component: Type<any>`: The type of the Component that will be downgraded
 * * `propagateDigest?: boolean`: Whether to perform {@link ChangeDetectorRef#detectChanges
 *   change detection} on the component on every
 *   [$digest](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest). If set to `false`,
 *   change detection will still be performed when any of the component's inputs changes.
 *   (Default: true)
 *
 * @returns a factory function that can be used to register the component in an
 * AngularJS module.
 *
 * @experimental
 */
export function downgradeComponent(info) {
    var directiveFactory = function ($compile, $injector, $parse) {
        // When using `UpgradeModule`, we don't need to ensure callbacks to Angular APIs (e.g. change
        // detection) are run inside the Angular zone, because `$digest()` will be run inside the zone
        // (except if explicitly escaped, in which case we shouldn't force it back in).
        // When using `downgradeModule()` though, we need to ensure such callbacks are run inside the
        // Angular zone.
        var needsNgZone = false;
        var wrapCallback = function (cb) { return cb; };
        var ngZone;
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
                var ranAsync = false;
                if (!parentInjector) {
                    var lazyModuleRef = $injector.get(LAZY_MODULE_REF);
                    needsNgZone = lazyModuleRef.needsNgZone;
                    parentInjector = lazyModuleRef.injector || lazyModuleRef.promise;
                }
                var doDowngrade = function (injector) {
                    var componentFactoryResolver = injector.get(ComponentFactoryResolver);
                    var componentFactory = componentFactoryResolver.resolveComponentFactory(info.component);
                    if (!componentFactory) {
                        throw new Error('Expecting ComponentFactory for: ' + getComponentName(info.component));
                    }
                    var injectorPromise = new ParentInjectorPromise(element);
                    var facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory, wrapCallback);
                    var projectableNodes = facade.compileContents();
                    facade.createComponent(projectableNodes);
                    facade.setupInputs(needsNgZone, info.propagateDigest);
                    facade.setupOutputs();
                    facade.registerCleanup();
                    injectorPromise.resolve(facade.getInjector());
                    if (ranAsync) {
                        // If this is run async, it is possible that it is not run inside a
                        // digest and initial input values will not be detected.
                        scope.$evalAsync(function () { });
                    }
                };
                var downgradeFn = !needsNgZone ? doDowngrade : function (injector) {
                    if (!ngZone) {
                        ngZone = injector.get(NgZone);
                        wrapCallback = function (cb) { return function () {
                            return NgZone.isInAngularZone() ? cb() : ngZone.run(cb);
                        }; };
                    }
                    wrapCallback(function () { return doDowngrade(injector); })();
                };
                if (isThenable(parentInjector)) {
                    parentInjector.then(downgradeFn);
                }
                else {
                    downgradeFn(parentInjector);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQW1CLHdCQUF3QixFQUFZLE1BQU0sRUFBTyxNQUFNLGVBQWUsQ0FBQztBQUdqRyxPQUFPLEVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUMzSCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RSxPQUFPLEVBQWdCLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFPbEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0gsTUFBTSw2QkFBNkIsSUFVbEM7SUFDQyxJQUFNLGdCQUFnQixHQUNXLFVBQ0ksUUFBaUMsRUFDakMsU0FBbUMsRUFDbkMsTUFBNkI7UUFDaEUsNkZBQTZGO1FBQzdGLDhGQUE4RjtRQUM5RiwrRUFBK0U7UUFDL0UsNkZBQTZGO1FBQzdGLGdCQUFnQjtRQUNoQixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxZQUFZLEdBQUcsVUFBSSxFQUFXLElBQUssT0FBQSxFQUFFLEVBQUYsQ0FBRSxDQUFDO1FBQzFDLElBQUksTUFBYyxDQUFDO1FBRW5CLE1BQU0sQ0FBQztZQUNMLFFBQVEsRUFBRSxHQUFHO1lBQ2IsUUFBUSxFQUFFLElBQUk7WUFDZCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQztZQUM3QyxJQUFJLEVBQUUsVUFB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QUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUVoRCwrQ0FBK0M7UUFDL0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFNLENBQUM7UUFFdEIsNEJBQTRCO1FBQzVCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUSxJQUFJLE9BQUEsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFDSCw0QkFBQztBQUFELENBQUMsQUEvQkQsSUErQkM7QUFFRCxvQkFBdUIsR0FBVztJQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFFLEdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSW5qZWN0b3IsIE5nWm9uZSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRDT01QSUxFLCAkSU5KRUNUT1IsICRQQVJTRSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFJFUVVJUkVfSU5KRUNUT1IsIFJFUVVJUkVfTkdfTU9ERUx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcn0gZnJvbSAnLi9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXInO1xuaW1wb3J0IHtMYXp5TW9kdWxlUmVmLCBjb250cm9sbGVyS2V5LCBnZXRDb21wb25lbnROYW1lLCBpc0Z1bmN0aW9ufSBmcm9tICcuL3V0aWwnO1xuXG5cbmludGVyZmFjZSBUaGVuYWJsZTxUPiB7XG4gIHRoZW4oY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gYW55KTogYW55O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFySlMuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdG8gYmUgdXNlZCBmb3IgcmVnaXN0ZXJpbmdcbiAqIGFuIEFuZ3VsYXJKUyB3cmFwcGVyIGRpcmVjdGl2ZSBmb3IgXCJkb3duZ3JhZGluZ1wiIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIExldCdzIGFzc3VtZSB0aGF0IHlvdSBoYXZlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbGxlZCBgbmcySGVyb2VzYCB0aGF0IG5lZWRzXG4gKiB0byBiZSBtYWRlIGF2YWlsYWJsZSBpbiBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYW4gQW5ndWxhckpTIFtkaXJlY3RpdmVdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2d1aWRlL2RpcmVjdGl2ZSlcbiAqIHRoYXQgd2lsbCBtYWtlIHRoaXMgQW5ndWxhciBjb21wb25lbnQgYXZhaWxhYmxlIGluc2lkZSBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICogVGhlIGBkb3duZ3JhZGVDb21wb25lbnQoKWAgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCB3ZVxuICogY2FuIHVzZSB0byBkZWZpbmUgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyB0aGUgXCJkb3duZ3JhZGVkXCIgY29tcG9uZW50LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXdyYXBwZXJcIn1cbiAqXG4gKiBAcGFyYW0gaW5mbyBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQ29tcG9uZW50IHRoYXQgaXMgYmVpbmcgZG93bmdyYWRlZDpcbiAqXG4gKiAqIGBjb21wb25lbnQ6IFR5cGU8YW55PmA6IFRoZSB0eXBlIG9mIHRoZSBDb21wb25lbnQgdGhhdCB3aWxsIGJlIGRvd25ncmFkZWRcbiAqICogYHByb3BhZ2F0ZURpZ2VzdD86IGJvb2xlYW5gOiBXaGV0aGVyIHRvIHBlcmZvcm0ge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGVjdENoYW5nZXNcbiAqICAgY2hhbmdlIGRldGVjdGlvbn0gb24gdGhlIGNvbXBvbmVudCBvbiBldmVyeVxuICogICBbJGRpZ2VzdF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KS4gSWYgc2V0IHRvIGBmYWxzZWAsXG4gKiAgIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBzdGlsbCBiZSBwZXJmb3JtZWQgd2hlbiBhbnkgb2YgdGhlIGNvbXBvbmVudCdzIGlucHV0cyBjaGFuZ2VzLlxuICogICAoRGVmYXVsdDogdHJ1ZSlcbiAqXG4gKiBAcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGluIGFuXG4gKiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUNvbXBvbmVudChpbmZvOiB7XG4gIGNvbXBvbmVudDogVHlwZTxhbnk+O1xuICAvKiogQGV4cGVyaW1lbnRhbCAqL1xuICBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIGlucHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIG91dHB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBzZWxlY3RvcnM/OiBzdHJpbmdbXTtcbn0pOiBhbnkgLyogYW5ndWxhci5JSW5qZWN0YWJsZSAqLyB7XG4gIGNvbnN0IGRpcmVjdGl2ZUZhY3Rvcnk6XG4gICAgICBhbmd1bGFyLklBbm5vdGF0ZWRGdW5jdGlvbiA9IGZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSk6IGFuZ3VsYXIuSURpcmVjdGl2ZSB7XG4gICAgLy8gV2hlbiB1c2luZyBgVXBncmFkZU1vZHVsZWAsIHdlIGRvbid0IG5lZWQgdG8gZW5zdXJlIGNhbGxiYWNrcyB0byBBbmd1bGFyIEFQSXMgKGUuZy4gY2hhbmdlXG4gICAgLy8gZGV0ZWN0aW9uKSBhcmUgcnVuIGluc2lkZSB0aGUgQW5ndWxhciB6b25lLCBiZWNhdXNlIGAkZGlnZXN0KClgIHdpbGwgYmUgcnVuIGluc2lkZSB0aGUgem9uZVxuICAgIC8vIChleGNlcHQgaWYgZXhwbGljaXRseSBlc2NhcGVkLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZG4ndCBmb3JjZSBpdCBiYWNrIGluKS5cbiAgICAvLyBXaGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAgdGhvdWdoLCB3ZSBuZWVkIHRvIGVuc3VyZSBzdWNoIGNhbGxiYWNrcyBhcmUgcnVuIGluc2lkZSB0aGVcbiAgICAvLyBBbmd1bGFyIHpvbmUuXG4gICAgbGV0IG5lZWRzTmdab25lID0gZmFsc2U7XG4gICAgbGV0IHdyYXBDYWxsYmFjayA9IDxUPihjYjogKCkgPT4gVCkgPT4gY2I7XG4gICAgbGV0IG5nWm9uZTogTmdab25lO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6IFtSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMXSxcbiAgICAgIGxpbms6IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgcmVxdWlyZWQ6IGFueVtdKSA9PiB7XG4gICAgICAgIC8vIFdlIG1pZ2h0IGhhdmUgdG8gY29tcGlsZSB0aGUgY29udGVudHMgYXN5bmNocm9ub3VzbHksIGJlY2F1c2UgdGhpcyBtaWdodCBoYXZlIGJlZW5cbiAgICAgICAgLy8gdHJpZ2dlcmVkIGJ5IGBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJgLCBiZWZvcmUgdGhlIEFuZ3VsYXIgdGVtcGxhdGVzIGhhdmVcbiAgICAgICAgLy8gYmVlbiBjb21waWxlZC5cblxuICAgICAgICBjb25zdCBuZ01vZGVsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciA9IHJlcXVpcmVkWzFdO1xuICAgICAgICBsZXQgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yfFRoZW5hYmxlPEluamVjdG9yPnx1bmRlZmluZWQgPSByZXF1aXJlZFswXTtcbiAgICAgICAgbGV0IHJhbkFzeW5jID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFwYXJlbnRJbmplY3Rvcikge1xuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWYgPSAkaW5qZWN0b3IuZ2V0KExBWllfTU9EVUxFX1JFRikgYXMgTGF6eU1vZHVsZVJlZjtcbiAgICAgICAgICBuZWVkc05nWm9uZSA9IGxhenlNb2R1bGVSZWYubmVlZHNOZ1pvbmU7XG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IgPSBsYXp5TW9kdWxlUmVmLmluamVjdG9yIHx8IGxhenlNb2R1bGVSZWYucHJvbWlzZSBhcyBQcm9taXNlPEluamVjdG9yPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRvRG93bmdyYWRlID0gKGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyID1cbiAgICAgICAgICAgICAgaW5qZWN0b3IuZ2V0KENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+ID1cbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGluZm8uY29tcG9uZW50KSAhO1xuXG4gICAgICAgICAgaWYgKCFjb21wb25lbnRGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGluZyBDb21wb25lbnRGYWN0b3J5IGZvcjogJyArIGdldENvbXBvbmVudE5hbWUoaW5mby5jb21wb25lbnQpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpbmplY3RvclByb21pc2UgPSBuZXcgUGFyZW50SW5qZWN0b3JQcm9taXNlKGVsZW1lbnQpO1xuICAgICAgICAgIGNvbnN0IGZhY2FkZSA9IG5ldyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyKFxuICAgICAgICAgICAgICBlbGVtZW50LCBhdHRycywgc2NvcGUsIG5nTW9kZWwsIGluamVjdG9yLCAkaW5qZWN0b3IsICRjb21waWxlLCAkcGFyc2UsXG4gICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnksIHdyYXBDYWxsYmFjayk7XG5cbiAgICAgICAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzID0gZmFjYWRlLmNvbXBpbGVDb250ZW50cygpO1xuICAgICAgICAgIGZhY2FkZS5jcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2Rlcyk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwSW5wdXRzKG5lZWRzTmdab25lLCBpbmZvLnByb3BhZ2F0ZURpZ2VzdCk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwT3V0cHV0cygpO1xuICAgICAgICAgIGZhY2FkZS5yZWdpc3RlckNsZWFudXAoKTtcblxuICAgICAgICAgIGluamVjdG9yUHJvbWlzZS5yZXNvbHZlKGZhY2FkZS5nZXRJbmplY3RvcigpKTtcblxuICAgICAgICAgIGlmIChyYW5Bc3luYykge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBydW4gYXN5bmMsIGl0IGlzIHBvc3NpYmxlIHRoYXQgaXQgaXMgbm90IHJ1biBpbnNpZGUgYVxuICAgICAgICAgICAgLy8gZGlnZXN0IGFuZCBpbml0aWFsIGlucHV0IHZhbHVlcyB3aWxsIG5vdCBiZSBkZXRlY3RlZC5cbiAgICAgICAgICAgIHNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge30pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkb3duZ3JhZGVGbiA9ICFuZWVkc05nWm9uZSA/IGRvRG93bmdyYWRlIDogKGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIGlmICghbmdab25lKSB7XG4gICAgICAgICAgICBuZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgICAgIHdyYXBDYWxsYmFjayA9IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT5cbiAgICAgICAgICAgICAgICBOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkgPyBjYigpIDogbmdab25lLnJ1bihjYik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd3JhcENhbGxiYWNrKCgpID0+IGRvRG93bmdyYWRlKGluamVjdG9yKSkoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNUaGVuYWJsZTxJbmplY3Rvcj4ocGFyZW50SW5qZWN0b3IpKSB7XG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IudGhlbihkb3duZ3JhZGVGbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG93bmdyYWRlRm4ocGFyZW50SW5qZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmFuQXN5bmMgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gYnJhY2tldC1ub3RhdGlvbiBiZWNhdXNlIG9mIGNsb3N1cmUgLSBzZWUgIzE0NDQxXG4gIGRpcmVjdGl2ZUZhY3RvcnlbJyRpbmplY3QnXSA9IFskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0VdO1xuICByZXR1cm4gZGlyZWN0aXZlRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhciAxJ3MgJGNvbXBpbGUuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSB7XG4gIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcml2YXRlIGluamVjdG9yS2V5OiBzdHJpbmcgPSBjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSk7XG4gIHByaXZhdGUgY2FsbGJhY2tzOiAoKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAvLyBTdG9yZSB0aGUgcHJvbWlzZSBvbiB0aGUgZWxlbWVudC5cbiAgICBlbGVtZW50LmRhdGEgISh0aGlzLmluamVjdG9yS2V5LCB0aGlzKTtcbiAgfVxuXG4gIHRoZW4oY2FsbGJhY2s6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSkge1xuICAgIGlmICh0aGlzLmluamVjdG9yKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLmluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZShpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG5cbiAgICAvLyBTdG9yZSB0aGUgcmVhbCBpbmplY3RvciBvbiB0aGUgZWxlbWVudC5cbiAgICB0aGlzLmVsZW1lbnQuZGF0YSAhKHRoaXMuaW5qZWN0b3JLZXksIGluamVjdG9yKTtcblxuICAgIC8vIFJlbGVhc2UgdGhlIGVsZW1lbnQgdG8gcHJldmVudCBtZW1vcnkgbGVha3MuXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbCAhO1xuXG4gICAgLy8gUnVuIHRoZSBxdWV1ZWQgY2FsbGJhY2tzLlxuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2soaW5qZWN0b3IpKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVGhlbmFibGU8VD4ob2JqOiBvYmplY3QpOiBvYmogaXMgVGhlbmFibGU8VD4ge1xuICByZXR1cm4gaXNGdW5jdGlvbigob2JqIGFzIGFueSkudGhlbik7XG59XG4iXX0=