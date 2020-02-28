/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { platformBrowser } from '@angular/platform-browser';
import { module_ as angularModule } from '../../src/common/src/angular1';
import { $INJECTOR, $PROVIDE, DOWNGRADED_MODULE_COUNT_KEY, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_APP_TYPE_KEY, UPGRADE_MODULE_NAME } from '../../src/common/src/constants';
import { getDowngradedModuleCount, isFunction } from '../../src/common/src/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
var moduleUid = 0;
/**
 * @description
 *
 * A helper function for creating an AngularJS module that can bootstrap an Angular module
 * "on-demand" (possibly lazily) when a {@link downgradeComponent downgraded component} needs to be
 * instantiated.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static) library for hybrid upgrade apps that
 * support AOT compilation.*
 *
 * It allows loading/bootstrapping the Angular part of a hybrid application lazily and not having to
 * pay the cost up-front. For example, you can have an AngularJS application that uses Angular for
 * specific routes and only instantiate the Angular modules if/when the user visits one of these
 * routes.
 *
 * The Angular module will be bootstrapped once (when requested for the first time) and the same
 * reference will be used from that point onwards.
 *
 * `downgradeModule()` requires either an `NgModuleFactory` or a function:
 * - `NgModuleFactory`: If you pass an `NgModuleFactory`, it will be used to instantiate a module
 *   using `platformBrowser`'s {@link PlatformRef#bootstrapModuleFactory bootstrapModuleFactory()}.
 * - `Function`: If you pass a function, it is expected to return a promise resolving to an
 *   `NgModuleRef`. The function is called with an array of extra {@link StaticProvider Providers}
 *   that are expected to be available from the returned `NgModuleRef`'s `Injector`.
 *
 * `downgradeModule()` returns the name of the created AngularJS wrapper module. You can use it to
 * declare a dependency in your main AngularJS module.
 *
 * {@example upgrade/static/ts/lite/module.ts region="basic-how-to"}
 *
 * For more details on how to use `downgradeModule()` see
 * [Upgrading for Performance](guide/upgrade-performance).
 *
 * @usageNotes
 *
 * Apart from `UpgradeModule`, you can use the rest of the `upgrade/static` helpers as usual to
 * build a hybrid application. Note that the Angular pieces (e.g. downgraded services) will not be
 * available until the downgraded module has been bootstrapped, i.e. by instantiating a downgraded
 * component.
 *
 * <div class="alert is-important">
 *
 *   You cannot use `downgradeModule()` and `UpgradeModule` in the same hybrid application.<br />
 *   Use one or the other.
 *
 * </div>
 *
 * ### Differences with `UpgradeModule`
 *
 * Besides their different API, there are two important internal differences between
 * `downgradeModule()` and `UpgradeModule` that affect the behavior of hybrid applications:
 *
 * 1. Unlike `UpgradeModule`, `downgradeModule()` does not bootstrap the main AngularJS module
 *    inside the {@link NgZone Angular zone}.
 * 2. Unlike `UpgradeModule`, `downgradeModule()` does not automatically run a
 *    [$digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest) when changes are
 *    detected in the Angular part of the application.
 *
 * What this means is that applications using `UpgradeModule` will run change detection more
 * frequently in order to ensure that both frameworks are properly notified about possible changes.
 * This will inevitably result in more change detection runs than necessary.
 *
 * `downgradeModule()`, on the other side, does not try to tie the two change detection systems as
 * tightly, restricting the explicit change detection runs only to cases where it knows it is
 * necessary (e.g. when the inputs of a downgraded component change). This improves performance,
 * especially in change-detection-heavy applications, but leaves it up to the developer to manually
 * notify each framework as needed.
 *
 * For a more detailed discussion of the differences and their implications, see
 * [Upgrading for Performance](guide/upgrade-performance).
 *
 * <div class="alert is-helpful">
 *
 *   You can manually trigger a change detection run in AngularJS using
 *   [scope.$apply(...)](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply) or
 *   [$rootScope.$digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest).
 *
 *   You can manually trigger a change detection run in Angular using {@link NgZone#run
 *   ngZone.run(...)}.
 *
 * </div>
 *
 * ### Downgrading multiple modules
 *
 * It is possible to downgrade multiple modules and include them in an AngularJS application. In
 * that case, each downgraded module will be bootstrapped when an associated downgraded component or
 * injectable needs to be instantiated.
 *
 * Things to keep in mind, when downgrading multiple modules:
 *
 * - Each downgraded component/injectable needs to be explicitly associated with a downgraded
 *   module. See `downgradeComponent()` and `downgradeInjectable()` for more details.
 *
 * - If you want some injectables to be shared among all downgraded modules, you can provide them as
 *   `StaticProvider`s, when creating the `PlatformRef` (e.g. via `platformBrowser` or
 *   `platformBrowserDynamic`).
 *
 * - When using {@link PlatformRef#bootstrapmodule `bootstrapModule()`} or
 *   {@link PlatformRef#bootstrapmodulefactory `bootstrapModuleFactory()`} to bootstrap the
 *   downgraded modules, each one is considered a "root" module. As a consequence, a new instance
 *   will be created for every injectable provided in `"root"` (via
 *   {@link Injectable#providedIn `providedIn`}).
 *   If this is not your intention, you can have a shared module (that will act as act as the "root"
 *   module) and create all downgraded modules using that module's injector:
 *
 *   {@example upgrade/static/ts/lite-multi-shared/module.ts region="shared-root-module"}
 *
 * @publicApi
 */
export function downgradeModule(moduleFactoryOrBootstrapFn) {
    var lazyModuleName = UPGRADE_MODULE_NAME + ".lazy" + ++moduleUid;
    var lazyModuleRefKey = "" + LAZY_MODULE_REF + lazyModuleName;
    var lazyInjectorKey = "" + INJECTOR_KEY + lazyModuleName;
    var bootstrapFn = isFunction(moduleFactoryOrBootstrapFn) ?
        moduleFactoryOrBootstrapFn :
        function (extraProviders) {
            return platformBrowser(extraProviders).bootstrapModuleFactory(moduleFactoryOrBootstrapFn);
        };
    var injector;
    // Create an ng1 module to bootstrap.
    angularModule(lazyModuleName, [])
        .constant(UPGRADE_APP_TYPE_KEY, 3 /* Lite */)
        .factory(INJECTOR_KEY, [lazyInjectorKey, identity])
        .factory(lazyInjectorKey, function () {
        if (!injector) {
            throw new Error('Trying to get the Angular injector before bootstrapping the corresponding ' +
                'Angular module.');
        }
        return injector;
    })
        .factory(LAZY_MODULE_REF, [lazyModuleRefKey, identity])
        .factory(lazyModuleRefKey, [
        $INJECTOR,
        function ($injector) {
            setTempInjectorRef($injector);
            var result = {
                promise: bootstrapFn(angular1Providers).then(function (ref) {
                    injector = result.injector = new NgAdapterInjector(ref.injector);
                    injector.get($INJECTOR);
                    return injector;
                })
            };
            return result;
        }
    ])
        .config([
        $INJECTOR, $PROVIDE,
        function ($injector, $provide) {
            $provide.constant(DOWNGRADED_MODULE_COUNT_KEY, getDowngradedModuleCount($injector) + 1);
        }
    ]);
    return lazyModuleName;
}
function identity(x) {
    return x;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9kb3duZ3JhZGVfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUdILE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUxRCxPQUFPLEVBQW9DLE9BQU8sSUFBSSxhQUFhLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRyxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSwyQkFBMkIsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLG9CQUFvQixFQUFFLG1CQUFtQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDMUssT0FBTyxFQUFnQyx3QkFBd0IsRUFBRSxVQUFVLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUU5RyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUMzRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFHekMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBRWxCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0R0c7QUFDSCxNQUFNLFVBQVUsZUFBZSxDQUMzQiwwQkFDK0Q7SUFDakUsSUFBTSxjQUFjLEdBQU0sbUJBQW1CLGFBQVEsRUFBRSxTQUFXLENBQUM7SUFDbkUsSUFBTSxnQkFBZ0IsR0FBRyxLQUFHLGVBQWUsR0FBRyxjQUFnQixDQUFDO0lBQy9ELElBQU0sZUFBZSxHQUFHLEtBQUcsWUFBWSxHQUFHLGNBQWdCLENBQUM7SUFFM0QsSUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztRQUN4RCwwQkFBMEIsQ0FBQyxDQUFDO1FBQzVCLFVBQUMsY0FBZ0M7WUFDN0IsT0FBQSxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUMsc0JBQXNCLENBQUMsMEJBQTBCLENBQUM7UUFBbEYsQ0FBa0YsQ0FBQztJQUUzRixJQUFJLFFBQWtCLENBQUM7SUFFdkIscUNBQXFDO0lBQ3JDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO1NBQzVCLFFBQVEsQ0FBQyxvQkFBb0IsZUFBc0I7U0FDbkQsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNsRCxPQUFPLENBQ0osZUFBZSxFQUNmO1FBQ0UsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLE1BQU0sSUFBSSxLQUFLLENBQ1gsNEVBQTRFO2dCQUM1RSxpQkFBaUIsQ0FBQyxDQUFDO1NBQ3hCO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQyxDQUFDO1NBQ0wsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ3RELE9BQU8sQ0FDSixnQkFBZ0IsRUFDaEI7UUFDRSxTQUFTO1FBQ1QsVUFBQyxTQUEyQjtZQUMxQixrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5QixJQUFNLE1BQU0sR0FBa0I7Z0JBQzVCLE9BQU8sRUFBRSxXQUFXLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxHQUFHO29CQUM5QyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDakUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFeEIsT0FBTyxRQUFRLENBQUM7Z0JBQ2xCLENBQUMsQ0FBQzthQUNILENBQUM7WUFDRixPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO0tBQ0YsQ0FBQztTQUNMLE1BQU0sQ0FBQztRQUNOLFNBQVMsRUFBRSxRQUFRO1FBQ25CLFVBQUMsU0FBMkIsRUFBRSxRQUF5QjtZQUNyRCxRQUFRLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUM7S0FDRixDQUFDLENBQUM7SUFFUCxPQUFPLGNBQWMsQ0FBQztBQUN4QixDQUFDO0FBRUQsU0FBUyxRQUFRLENBQVUsQ0FBSTtJQUM3QixPQUFPLENBQUMsQ0FBQztBQUNYLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIE5nTW9kdWxlRmFjdG9yeSwgTmdNb2R1bGVSZWYsIFN0YXRpY1Byb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7cGxhdGZvcm1Ccm93c2VyfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcblxuaW1wb3J0IHtJSW5qZWN0b3JTZXJ2aWNlLCBJUHJvdmlkZVNlcnZpY2UsIG1vZHVsZV8gYXMgYW5ndWxhck1vZHVsZX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvYW5ndWxhcjEnO1xuaW1wb3J0IHskSU5KRUNUT1IsICRQUk9WSURFLCBET1dOR1JBREVEX01PRFVMRV9DT1VOVF9LRVksIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBVUEdSQURFX0FQUF9UWVBFX0tFWSwgVVBHUkFERV9NT0RVTEVfTkFNRX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgVXBncmFkZUFwcFR5cGUsIGdldERvd25ncmFkZWRNb2R1bGVDb3VudCwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvdXRpbCc7XG5cbmltcG9ydCB7YW5ndWxhcjFQcm92aWRlcnMsIHNldFRlbXBJbmplY3RvclJlZn0gZnJvbSAnLi9hbmd1bGFyMV9wcm92aWRlcnMnO1xuaW1wb3J0IHtOZ0FkYXB0ZXJJbmplY3Rvcn0gZnJvbSAnLi91dGlsJztcblxuXG5sZXQgbW9kdWxlVWlkID0gMDtcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYW4gQW5ndWxhckpTIG1vZHVsZSB0aGF0IGNhbiBib290c3RyYXAgYW4gQW5ndWxhciBtb2R1bGVcbiAqIFwib24tZGVtYW5kXCIgKHBvc3NpYmx5IGxhemlseSkgd2hlbiBhIHtAbGluayBkb3duZ3JhZGVDb21wb25lbnQgZG93bmdyYWRlZCBjb21wb25lbnR9IG5lZWRzIHRvIGJlXG4gKiBpbnN0YW50aWF0ZWQuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUvc3RhdGljKSBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXRcbiAqIHN1cHBvcnQgQU9UIGNvbXBpbGF0aW9uLipcbiAqXG4gKiBJdCBhbGxvd3MgbG9hZGluZy9ib290c3RyYXBwaW5nIHRoZSBBbmd1bGFyIHBhcnQgb2YgYSBoeWJyaWQgYXBwbGljYXRpb24gbGF6aWx5IGFuZCBub3QgaGF2aW5nIHRvXG4gKiBwYXkgdGhlIGNvc3QgdXAtZnJvbnQuIEZvciBleGFtcGxlLCB5b3UgY2FuIGhhdmUgYW4gQW5ndWxhckpTIGFwcGxpY2F0aW9uIHRoYXQgdXNlcyBBbmd1bGFyIGZvclxuICogc3BlY2lmaWMgcm91dGVzIGFuZCBvbmx5IGluc3RhbnRpYXRlIHRoZSBBbmd1bGFyIG1vZHVsZXMgaWYvd2hlbiB0aGUgdXNlciB2aXNpdHMgb25lIG9mIHRoZXNlXG4gKiByb3V0ZXMuXG4gKlxuICogVGhlIEFuZ3VsYXIgbW9kdWxlIHdpbGwgYmUgYm9vdHN0cmFwcGVkIG9uY2UgKHdoZW4gcmVxdWVzdGVkIGZvciB0aGUgZmlyc3QgdGltZSkgYW5kIHRoZSBzYW1lXG4gKiByZWZlcmVuY2Ugd2lsbCBiZSB1c2VkIGZyb20gdGhhdCBwb2ludCBvbndhcmRzLlxuICpcbiAqIGBkb3duZ3JhZGVNb2R1bGUoKWAgcmVxdWlyZXMgZWl0aGVyIGFuIGBOZ01vZHVsZUZhY3RvcnlgIG9yIGEgZnVuY3Rpb246XG4gKiAtIGBOZ01vZHVsZUZhY3RvcnlgOiBJZiB5b3UgcGFzcyBhbiBgTmdNb2R1bGVGYWN0b3J5YCwgaXQgd2lsbCBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIGEgbW9kdWxlXG4gKiAgIHVzaW5nIGBwbGF0Zm9ybUJyb3dzZXJgJ3Mge0BsaW5rIFBsYXRmb3JtUmVmI2Jvb3RzdHJhcE1vZHVsZUZhY3RvcnkgYm9vdHN0cmFwTW9kdWxlRmFjdG9yeSgpfS5cbiAqIC0gYEZ1bmN0aW9uYDogSWYgeW91IHBhc3MgYSBmdW5jdGlvbiwgaXQgaXMgZXhwZWN0ZWQgdG8gcmV0dXJuIGEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYW5cbiAqICAgYE5nTW9kdWxlUmVmYC4gVGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGFuIGFycmF5IG9mIGV4dHJhIHtAbGluayBTdGF0aWNQcm92aWRlciBQcm92aWRlcnN9XG4gKiAgIHRoYXQgYXJlIGV4cGVjdGVkIHRvIGJlIGF2YWlsYWJsZSBmcm9tIHRoZSByZXR1cm5lZCBgTmdNb2R1bGVSZWZgJ3MgYEluamVjdG9yYC5cbiAqXG4gKiBgZG93bmdyYWRlTW9kdWxlKClgIHJldHVybnMgdGhlIG5hbWUgb2YgdGhlIGNyZWF0ZWQgQW5ndWxhckpTIHdyYXBwZXIgbW9kdWxlLiBZb3UgY2FuIHVzZSBpdCB0b1xuICogZGVjbGFyZSBhIGRlcGVuZGVuY3kgaW4geW91ciBtYWluIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2xpdGUvbW9kdWxlLnRzIHJlZ2lvbj1cImJhc2ljLWhvdy10b1wifVxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMgb24gaG93IHRvIHVzZSBgZG93bmdyYWRlTW9kdWxlKClgIHNlZVxuICogW1VwZ3JhZGluZyBmb3IgUGVyZm9ybWFuY2VdKGd1aWRlL3VwZ3JhZGUtcGVyZm9ybWFuY2UpLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQXBhcnQgZnJvbSBgVXBncmFkZU1vZHVsZWAsIHlvdSBjYW4gdXNlIHRoZSByZXN0IG9mIHRoZSBgdXBncmFkZS9zdGF0aWNgIGhlbHBlcnMgYXMgdXN1YWwgdG9cbiAqIGJ1aWxkIGEgaHlicmlkIGFwcGxpY2F0aW9uLiBOb3RlIHRoYXQgdGhlIEFuZ3VsYXIgcGllY2VzIChlLmcuIGRvd25ncmFkZWQgc2VydmljZXMpIHdpbGwgbm90IGJlXG4gKiBhdmFpbGFibGUgdW50aWwgdGhlIGRvd25ncmFkZWQgbW9kdWxlIGhhcyBiZWVuIGJvb3RzdHJhcHBlZCwgaS5lLiBieSBpbnN0YW50aWF0aW5nIGEgZG93bmdyYWRlZFxuICogY29tcG9uZW50LlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1pbXBvcnRhbnRcIj5cbiAqXG4gKiAgIFlvdSBjYW5ub3QgdXNlIGBkb3duZ3JhZGVNb2R1bGUoKWAgYW5kIGBVcGdyYWRlTW9kdWxlYCBpbiB0aGUgc2FtZSBoeWJyaWQgYXBwbGljYXRpb24uPGJyIC8+XG4gKiAgIFVzZSBvbmUgb3IgdGhlIG90aGVyLlxuICpcbiAqIDwvZGl2PlxuICpcbiAqICMjIyBEaWZmZXJlbmNlcyB3aXRoIGBVcGdyYWRlTW9kdWxlYFxuICpcbiAqIEJlc2lkZXMgdGhlaXIgZGlmZmVyZW50IEFQSSwgdGhlcmUgYXJlIHR3byBpbXBvcnRhbnQgaW50ZXJuYWwgZGlmZmVyZW5jZXMgYmV0d2VlblxuICogYGRvd25ncmFkZU1vZHVsZSgpYCBhbmQgYFVwZ3JhZGVNb2R1bGVgIHRoYXQgYWZmZWN0IHRoZSBiZWhhdmlvciBvZiBoeWJyaWQgYXBwbGljYXRpb25zOlxuICpcbiAqIDEuIFVubGlrZSBgVXBncmFkZU1vZHVsZWAsIGBkb3duZ3JhZGVNb2R1bGUoKWAgZG9lcyBub3QgYm9vdHN0cmFwIHRoZSBtYWluIEFuZ3VsYXJKUyBtb2R1bGVcbiAqICAgIGluc2lkZSB0aGUge0BsaW5rIE5nWm9uZSBBbmd1bGFyIHpvbmV9LlxuICogMi4gVW5saWtlIGBVcGdyYWRlTW9kdWxlYCwgYGRvd25ncmFkZU1vZHVsZSgpYCBkb2VzIG5vdCBhdXRvbWF0aWNhbGx5IHJ1biBhXG4gKiAgICBbJGRpZ2VzdCgpXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlIyRkaWdlc3QpIHdoZW4gY2hhbmdlcyBhcmVcbiAqICAgIGRldGVjdGVkIGluIHRoZSBBbmd1bGFyIHBhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIFdoYXQgdGhpcyBtZWFucyBpcyB0aGF0IGFwcGxpY2F0aW9ucyB1c2luZyBgVXBncmFkZU1vZHVsZWAgd2lsbCBydW4gY2hhbmdlIGRldGVjdGlvbiBtb3JlXG4gKiBmcmVxdWVudGx5IGluIG9yZGVyIHRvIGVuc3VyZSB0aGF0IGJvdGggZnJhbWV3b3JrcyBhcmUgcHJvcGVybHkgbm90aWZpZWQgYWJvdXQgcG9zc2libGUgY2hhbmdlcy5cbiAqIFRoaXMgd2lsbCBpbmV2aXRhYmx5IHJlc3VsdCBpbiBtb3JlIGNoYW5nZSBkZXRlY3Rpb24gcnVucyB0aGFuIG5lY2Vzc2FyeS5cbiAqXG4gKiBgZG93bmdyYWRlTW9kdWxlKClgLCBvbiB0aGUgb3RoZXIgc2lkZSwgZG9lcyBub3QgdHJ5IHRvIHRpZSB0aGUgdHdvIGNoYW5nZSBkZXRlY3Rpb24gc3lzdGVtcyBhc1xuICogdGlnaHRseSwgcmVzdHJpY3RpbmcgdGhlIGV4cGxpY2l0IGNoYW5nZSBkZXRlY3Rpb24gcnVucyBvbmx5IHRvIGNhc2VzIHdoZXJlIGl0IGtub3dzIGl0IGlzXG4gKiBuZWNlc3NhcnkgKGUuZy4gd2hlbiB0aGUgaW5wdXRzIG9mIGEgZG93bmdyYWRlZCBjb21wb25lbnQgY2hhbmdlKS4gVGhpcyBpbXByb3ZlcyBwZXJmb3JtYW5jZSxcbiAqIGVzcGVjaWFsbHkgaW4gY2hhbmdlLWRldGVjdGlvbi1oZWF2eSBhcHBsaWNhdGlvbnMsIGJ1dCBsZWF2ZXMgaXQgdXAgdG8gdGhlIGRldmVsb3BlciB0byBtYW51YWxseVxuICogbm90aWZ5IGVhY2ggZnJhbWV3b3JrIGFzIG5lZWRlZC5cbiAqXG4gKiBGb3IgYSBtb3JlIGRldGFpbGVkIGRpc2N1c3Npb24gb2YgdGhlIGRpZmZlcmVuY2VzIGFuZCB0aGVpciBpbXBsaWNhdGlvbnMsIHNlZVxuICogW1VwZ3JhZGluZyBmb3IgUGVyZm9ybWFuY2VdKGd1aWRlL3VwZ3JhZGUtcGVyZm9ybWFuY2UpLlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1oZWxwZnVsXCI+XG4gKlxuICogICBZb3UgY2FuIG1hbnVhbGx5IHRyaWdnZXIgYSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1biBpbiBBbmd1bGFySlMgdXNpbmdcbiAqICAgW3Njb3BlLiRhcHBseSguLi4pXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlIyRhcHBseSkgb3JcbiAqICAgWyRyb290U2NvcGUuJGRpZ2VzdCgpXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlIyRkaWdlc3QpLlxuICpcbiAqICAgWW91IGNhbiBtYW51YWxseSB0cmlnZ2VyIGEgY2hhbmdlIGRldGVjdGlvbiBydW4gaW4gQW5ndWxhciB1c2luZyB7QGxpbmsgTmdab25lI3J1blxuICogICBuZ1pvbmUucnVuKC4uLil9LlxuICpcbiAqIDwvZGl2PlxuICpcbiAqICMjIyBEb3duZ3JhZGluZyBtdWx0aXBsZSBtb2R1bGVzXG4gKlxuICogSXQgaXMgcG9zc2libGUgdG8gZG93bmdyYWRlIG11bHRpcGxlIG1vZHVsZXMgYW5kIGluY2x1ZGUgdGhlbSBpbiBhbiBBbmd1bGFySlMgYXBwbGljYXRpb24uIEluXG4gKiB0aGF0IGNhc2UsIGVhY2ggZG93bmdyYWRlZCBtb2R1bGUgd2lsbCBiZSBib290c3RyYXBwZWQgd2hlbiBhbiBhc3NvY2lhdGVkIGRvd25ncmFkZWQgY29tcG9uZW50IG9yXG4gKiBpbmplY3RhYmxlIG5lZWRzIHRvIGJlIGluc3RhbnRpYXRlZC5cbiAqXG4gKiBUaGluZ3MgdG8ga2VlcCBpbiBtaW5kLCB3aGVuIGRvd25ncmFkaW5nIG11bHRpcGxlIG1vZHVsZXM6XG4gKlxuICogLSBFYWNoIGRvd25ncmFkZWQgY29tcG9uZW50L2luamVjdGFibGUgbmVlZHMgdG8gYmUgZXhwbGljaXRseSBhc3NvY2lhdGVkIHdpdGggYSBkb3duZ3JhZGVkXG4gKiAgIG1vZHVsZS4gU2VlIGBkb3duZ3JhZGVDb21wb25lbnQoKWAgYW5kIGBkb3duZ3JhZGVJbmplY3RhYmxlKClgIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogLSBJZiB5b3Ugd2FudCBzb21lIGluamVjdGFibGVzIHRvIGJlIHNoYXJlZCBhbW9uZyBhbGwgZG93bmdyYWRlZCBtb2R1bGVzLCB5b3UgY2FuIHByb3ZpZGUgdGhlbSBhc1xuICogICBgU3RhdGljUHJvdmlkZXJgcywgd2hlbiBjcmVhdGluZyB0aGUgYFBsYXRmb3JtUmVmYCAoZS5nLiB2aWEgYHBsYXRmb3JtQnJvd3NlcmAgb3JcbiAqICAgYHBsYXRmb3JtQnJvd3NlckR5bmFtaWNgKS5cbiAqXG4gKiAtIFdoZW4gdXNpbmcge0BsaW5rIFBsYXRmb3JtUmVmI2Jvb3RzdHJhcG1vZHVsZSBgYm9vdHN0cmFwTW9kdWxlKClgfSBvclxuICogICB7QGxpbmsgUGxhdGZvcm1SZWYjYm9vdHN0cmFwbW9kdWxlZmFjdG9yeSBgYm9vdHN0cmFwTW9kdWxlRmFjdG9yeSgpYH0gdG8gYm9vdHN0cmFwIHRoZVxuICogICBkb3duZ3JhZGVkIG1vZHVsZXMsIGVhY2ggb25lIGlzIGNvbnNpZGVyZWQgYSBcInJvb3RcIiBtb2R1bGUuIEFzIGEgY29uc2VxdWVuY2UsIGEgbmV3IGluc3RhbmNlXG4gKiAgIHdpbGwgYmUgY3JlYXRlZCBmb3IgZXZlcnkgaW5qZWN0YWJsZSBwcm92aWRlZCBpbiBgXCJyb290XCJgICh2aWFcbiAqICAge0BsaW5rIEluamVjdGFibGUjcHJvdmlkZWRJbiBgcHJvdmlkZWRJbmB9KS5cbiAqICAgSWYgdGhpcyBpcyBub3QgeW91ciBpbnRlbnRpb24sIHlvdSBjYW4gaGF2ZSBhIHNoYXJlZCBtb2R1bGUgKHRoYXQgd2lsbCBhY3QgYXMgYWN0IGFzIHRoZSBcInJvb3RcIlxuICogICBtb2R1bGUpIGFuZCBjcmVhdGUgYWxsIGRvd25ncmFkZWQgbW9kdWxlcyB1c2luZyB0aGF0IG1vZHVsZSdzIGluamVjdG9yOlxuICpcbiAqICAge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2xpdGUtbXVsdGktc2hhcmVkL21vZHVsZS50cyByZWdpb249XCJzaGFyZWQtcm9vdC1tb2R1bGVcIn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVNb2R1bGU8VD4oXG4gICAgbW9kdWxlRmFjdG9yeU9yQm9vdHN0cmFwRm46IE5nTW9kdWxlRmFjdG9yeTxUPnxcbiAgICAoKGV4dHJhUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdKSA9PiBQcm9taXNlPE5nTW9kdWxlUmVmPFQ+PikpOiBzdHJpbmcge1xuICBjb25zdCBsYXp5TW9kdWxlTmFtZSA9IGAke1VQR1JBREVfTU9EVUxFX05BTUV9LmxhenkkeysrbW9kdWxlVWlkfWA7XG4gIGNvbnN0IGxhenlNb2R1bGVSZWZLZXkgPSBgJHtMQVpZX01PRFVMRV9SRUZ9JHtsYXp5TW9kdWxlTmFtZX1gO1xuICBjb25zdCBsYXp5SW5qZWN0b3JLZXkgPSBgJHtJTkpFQ1RPUl9LRVl9JHtsYXp5TW9kdWxlTmFtZX1gO1xuXG4gIGNvbnN0IGJvb3RzdHJhcEZuID0gaXNGdW5jdGlvbihtb2R1bGVGYWN0b3J5T3JCb290c3RyYXBGbikgP1xuICAgICAgbW9kdWxlRmFjdG9yeU9yQm9vdHN0cmFwRm4gOlxuICAgICAgKGV4dHJhUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdKSA9PlxuICAgICAgICAgIHBsYXRmb3JtQnJvd3NlcihleHRyYVByb3ZpZGVycykuYm9vdHN0cmFwTW9kdWxlRmFjdG9yeShtb2R1bGVGYWN0b3J5T3JCb290c3RyYXBGbik7XG5cbiAgbGV0IGluamVjdG9yOiBJbmplY3RvcjtcblxuICAvLyBDcmVhdGUgYW4gbmcxIG1vZHVsZSB0byBib290c3RyYXAuXG4gIGFuZ3VsYXJNb2R1bGUobGF6eU1vZHVsZU5hbWUsIFtdKVxuICAgICAgLmNvbnN0YW50KFVQR1JBREVfQVBQX1RZUEVfS0VZLCBVcGdyYWRlQXBwVHlwZS5MaXRlKVxuICAgICAgLmZhY3RvcnkoSU5KRUNUT1JfS0VZLCBbbGF6eUluamVjdG9yS2V5LCBpZGVudGl0eV0pXG4gICAgICAuZmFjdG9yeShcbiAgICAgICAgICBsYXp5SW5qZWN0b3JLZXksXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFpbmplY3Rvcikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAnVHJ5aW5nIHRvIGdldCB0aGUgQW5ndWxhciBpbmplY3RvciBiZWZvcmUgYm9vdHN0cmFwcGluZyB0aGUgY29ycmVzcG9uZGluZyAnICtcbiAgICAgICAgICAgICAgICAgICdBbmd1bGFyIG1vZHVsZS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbmplY3RvcjtcbiAgICAgICAgICB9KVxuICAgICAgLmZhY3RvcnkoTEFaWV9NT0RVTEVfUkVGLCBbbGF6eU1vZHVsZVJlZktleSwgaWRlbnRpdHldKVxuICAgICAgLmZhY3RvcnkoXG4gICAgICAgICAgbGF6eU1vZHVsZVJlZktleSxcbiAgICAgICAgICBbXG4gICAgICAgICAgICAkSU5KRUNUT1IsXG4gICAgICAgICAgICAoJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgIHNldFRlbXBJbmplY3RvclJlZigkaW5qZWN0b3IpO1xuICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IExhenlNb2R1bGVSZWYgPSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZTogYm9vdHN0cmFwRm4oYW5ndWxhcjFQcm92aWRlcnMpLnRoZW4ocmVmID0+IHtcbiAgICAgICAgICAgICAgICAgIGluamVjdG9yID0gcmVzdWx0LmluamVjdG9yID0gbmV3IE5nQWRhcHRlckluamVjdG9yKHJlZi5pbmplY3Rvcik7XG4gICAgICAgICAgICAgICAgICBpbmplY3Rvci5nZXQoJElOSkVDVE9SKTtcblxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluamVjdG9yO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgXSlcbiAgICAgIC5jb25maWcoW1xuICAgICAgICAkSU5KRUNUT1IsICRQUk9WSURFLFxuICAgICAgICAoJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlLCAkcHJvdmlkZTogSVByb3ZpZGVTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgJHByb3ZpZGUuY29uc3RhbnQoRE9XTkdSQURFRF9NT0RVTEVfQ09VTlRfS0VZLCBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQoJGluamVjdG9yKSArIDEpO1xuICAgICAgICB9XG4gICAgICBdKTtcblxuICByZXR1cm4gbGF6eU1vZHVsZU5hbWU7XG59XG5cbmZ1bmN0aW9uIGlkZW50aXR5PFQgPSBhbnk+KHg6IFQpOiBUIHtcbiAgcmV0dXJuIHg7XG59XG4iXX0=