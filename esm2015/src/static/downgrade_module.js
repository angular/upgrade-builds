/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { platformBrowser } from '@angular/platform-browser';
import * as angular from '../common/angular1';
import { $INJECTOR, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_MODULE_NAME } from '../common/constants';
import { isFunction } from '../common/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
/**
 * \@description
 *
 * A helper function for creating an AngularJS module that can bootstrap an Angular module
 * "on-demand" (possibly lazily) when a {\@link downgradeComponent downgraded component} needs to be
 * instantiated.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static) library for hybrid upgrade apps that
 * support AoT compilation.*
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
 *   using `platformBrowser`'s {\@link PlatformRef#bootstrapModuleFactory bootstrapModuleFactory()}.
 * - `Function`: If you pass a function, it is expected to return a promise resolving to an
 *   `NgModuleRef`. The function is called with an array of extra {\@link StaticProvider Providers}
 *   that are expected to be available from the returned `NgModuleRef`'s `Injector`.
 *
 * `downgradeModule()` returns the name of the created AngularJS wrapper module. You can use it to
 * declare a dependency in your main AngularJS module.
 *
 * {\@example upgrade/static/ts/lite/module.ts region="basic-how-to"}
 *
 * For more details on how to use `downgradeModule()` see
 * [Upgrading for Performance](guide/upgrade-performance).
 *
 * \@usageNotes
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
 *    inside the {\@link NgZone Angular zone}.
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
 *   You can manually trigger a change detection run in Angular using {\@link NgZone#run
 *   ngZone.run(...)}.
 *
 * </div>
 *
 * \@experimental
 * @template T
 * @param {?} moduleFactoryOrBootstrapFn
 * @return {?}
 */
export function downgradeModule(moduleFactoryOrBootstrapFn) {
    /** @type {?} */
    const LAZY_MODULE_NAME = UPGRADE_MODULE_NAME + '.lazy';
    /** @type {?} */
    const bootstrapFn = isFunction(moduleFactoryOrBootstrapFn) ?
        moduleFactoryOrBootstrapFn :
        (extraProviders) => platformBrowser(extraProviders).bootstrapModuleFactory(moduleFactoryOrBootstrapFn);
    /** @type {?} */
    let injector;
    // Create an ng1 module to bootstrap.
    angular.module(LAZY_MODULE_NAME, [])
        .factory(INJECTOR_KEY, () => {
        if (!injector) {
            throw new Error('Trying to get the Angular injector before bootstrapping an Angular module.');
        }
        return injector;
    })
        .factory(LAZY_MODULE_REF, [
        $INJECTOR,
        ($injector) => {
            setTempInjectorRef($injector);
            /** @type {?} */
            const result = {
                needsNgZone: true,
                promise: bootstrapFn(angular1Providers).then(ref => {
                    injector = result.injector = new NgAdapterInjector(ref.injector);
                    injector.get($INJECTOR);
                    return injector;
                })
            };
            return result;
        }
    ]);
    return LAZY_MODULE_NAME;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL3N0YXRpYy9kb3duZ3JhZGVfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBU0EsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDJCQUEyQixDQUFDO0FBRTFELE9BQU8sS0FBSyxPQUFPLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLG1CQUFtQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbEcsT0FBTyxFQUFnQixVQUFVLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV6RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUMzRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1RnpDLE1BQU0sMEJBQ0YsMEJBQytEOztJQUNqRSxNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixHQUFHLE9BQU8sQ0FBQzs7SUFDdkQsTUFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztRQUN4RCwwQkFBMEIsQ0FBQyxDQUFDO1FBQzVCLENBQUMsY0FBZ0MsRUFBRSxFQUFFLENBQ2pDLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDOztJQUUzRixJQUFJLFFBQVEsQ0FBVzs7SUFHdkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7U0FDL0IsT0FBTyxDQUNKLFlBQVksRUFDWixHQUFHLEVBQUU7UUFDSCxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FDWCw0RUFBNEUsQ0FBQyxDQUFDO1NBQ25GO1FBQ0QsT0FBTyxRQUFRLENBQUM7S0FDakIsQ0FBQztTQUNMLE9BQU8sQ0FBQyxlQUFlLEVBQUU7UUFDeEIsU0FBUztRQUNULENBQUMsU0FBbUMsRUFBRSxFQUFFO1lBQ3RDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztZQUM5QixNQUFNLE1BQU0sR0FBa0I7Z0JBQzVCLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixPQUFPLEVBQUUsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUNqRCxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDakUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFFeEIsT0FBTyxRQUFRLENBQUM7aUJBQ2pCLENBQUM7YUFDSCxDQUFDO1lBQ0YsT0FBTyxNQUFNLENBQUM7U0FDZjtLQUNGLENBQUMsQ0FBQztJQUVQLE9BQU8sZ0JBQWdCLENBQUM7Q0FDekIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIE5nTW9kdWxlRmFjdG9yeSwgTmdNb2R1bGVSZWYsIFN0YXRpY1Byb3ZpZGVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7cGxhdGZvcm1Ccm93c2VyfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi9jb21tb24vYW5ndWxhcjEnO1xuaW1wb3J0IHskSU5KRUNUT1IsIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBVUEdSQURFX01PRFVMRV9OQU1FfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuXG5pbXBvcnQge2FuZ3VsYXIxUHJvdmlkZXJzLCBzZXRUZW1wSW5qZWN0b3JSZWZ9IGZyb20gJy4vYW5ndWxhcjFfcHJvdmlkZXJzJztcbmltcG9ydCB7TmdBZGFwdGVySW5qZWN0b3J9IGZyb20gJy4vdXRpbCc7XG5cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYW4gQW5ndWxhckpTIG1vZHVsZSB0aGF0IGNhbiBib290c3RyYXAgYW4gQW5ndWxhciBtb2R1bGVcbiAqIFwib24tZGVtYW5kXCIgKHBvc3NpYmx5IGxhemlseSkgd2hlbiBhIHtAbGluayBkb3duZ3JhZGVDb21wb25lbnQgZG93bmdyYWRlZCBjb21wb25lbnR9IG5lZWRzIHRvIGJlXG4gKiBpbnN0YW50aWF0ZWQuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUvc3RhdGljKSBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXRcbiAqIHN1cHBvcnQgQW9UIGNvbXBpbGF0aW9uLipcbiAqXG4gKiBJdCBhbGxvd3MgbG9hZGluZy9ib290c3RyYXBwaW5nIHRoZSBBbmd1bGFyIHBhcnQgb2YgYSBoeWJyaWQgYXBwbGljYXRpb24gbGF6aWx5IGFuZCBub3QgaGF2aW5nIHRvXG4gKiBwYXkgdGhlIGNvc3QgdXAtZnJvbnQuIEZvciBleGFtcGxlLCB5b3UgY2FuIGhhdmUgYW4gQW5ndWxhckpTIGFwcGxpY2F0aW9uIHRoYXQgdXNlcyBBbmd1bGFyIGZvclxuICogc3BlY2lmaWMgcm91dGVzIGFuZCBvbmx5IGluc3RhbnRpYXRlIHRoZSBBbmd1bGFyIG1vZHVsZXMgaWYvd2hlbiB0aGUgdXNlciB2aXNpdHMgb25lIG9mIHRoZXNlXG4gKiByb3V0ZXMuXG4gKlxuICogVGhlIEFuZ3VsYXIgbW9kdWxlIHdpbGwgYmUgYm9vdHN0cmFwcGVkIG9uY2UgKHdoZW4gcmVxdWVzdGVkIGZvciB0aGUgZmlyc3QgdGltZSkgYW5kIHRoZSBzYW1lXG4gKiByZWZlcmVuY2Ugd2lsbCBiZSB1c2VkIGZyb20gdGhhdCBwb2ludCBvbndhcmRzLlxuICpcbiAqIGBkb3duZ3JhZGVNb2R1bGUoKWAgcmVxdWlyZXMgZWl0aGVyIGFuIGBOZ01vZHVsZUZhY3RvcnlgIG9yIGEgZnVuY3Rpb246XG4gKiAtIGBOZ01vZHVsZUZhY3RvcnlgOiBJZiB5b3UgcGFzcyBhbiBgTmdNb2R1bGVGYWN0b3J5YCwgaXQgd2lsbCBiZSB1c2VkIHRvIGluc3RhbnRpYXRlIGEgbW9kdWxlXG4gKiAgIHVzaW5nIGBwbGF0Zm9ybUJyb3dzZXJgJ3Mge0BsaW5rIFBsYXRmb3JtUmVmI2Jvb3RzdHJhcE1vZHVsZUZhY3RvcnkgYm9vdHN0cmFwTW9kdWxlRmFjdG9yeSgpfS5cbiAqIC0gYEZ1bmN0aW9uYDogSWYgeW91IHBhc3MgYSBmdW5jdGlvbiwgaXQgaXMgZXhwZWN0ZWQgdG8gcmV0dXJuIGEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYW5cbiAqICAgYE5nTW9kdWxlUmVmYC4gVGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGFuIGFycmF5IG9mIGV4dHJhIHtAbGluayBTdGF0aWNQcm92aWRlciBQcm92aWRlcnN9XG4gKiAgIHRoYXQgYXJlIGV4cGVjdGVkIHRvIGJlIGF2YWlsYWJsZSBmcm9tIHRoZSByZXR1cm5lZCBgTmdNb2R1bGVSZWZgJ3MgYEluamVjdG9yYC5cbiAqXG4gKiBgZG93bmdyYWRlTW9kdWxlKClgIHJldHVybnMgdGhlIG5hbWUgb2YgdGhlIGNyZWF0ZWQgQW5ndWxhckpTIHdyYXBwZXIgbW9kdWxlLiBZb3UgY2FuIHVzZSBpdCB0b1xuICogZGVjbGFyZSBhIGRlcGVuZGVuY3kgaW4geW91ciBtYWluIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2xpdGUvbW9kdWxlLnRzIHJlZ2lvbj1cImJhc2ljLWhvdy10b1wifVxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMgb24gaG93IHRvIHVzZSBgZG93bmdyYWRlTW9kdWxlKClgIHNlZVxuICogW1VwZ3JhZGluZyBmb3IgUGVyZm9ybWFuY2VdKGd1aWRlL3VwZ3JhZGUtcGVyZm9ybWFuY2UpLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogQXBhcnQgZnJvbSBgVXBncmFkZU1vZHVsZWAsIHlvdSBjYW4gdXNlIHRoZSByZXN0IG9mIHRoZSBgdXBncmFkZS9zdGF0aWNgIGhlbHBlcnMgYXMgdXN1YWwgdG9cbiAqIGJ1aWxkIGEgaHlicmlkIGFwcGxpY2F0aW9uLiBOb3RlIHRoYXQgdGhlIEFuZ3VsYXIgcGllY2VzIChlLmcuIGRvd25ncmFkZWQgc2VydmljZXMpIHdpbGwgbm90IGJlXG4gKiBhdmFpbGFibGUgdW50aWwgdGhlIGRvd25ncmFkZWQgbW9kdWxlIGhhcyBiZWVuIGJvb3RzdHJhcHBlZCwgaS5lLiBieSBpbnN0YW50aWF0aW5nIGEgZG93bmdyYWRlZFxuICogY29tcG9uZW50LlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1pbXBvcnRhbnRcIj5cbiAqXG4gKiAgIFlvdSBjYW5ub3QgdXNlIGBkb3duZ3JhZGVNb2R1bGUoKWAgYW5kIGBVcGdyYWRlTW9kdWxlYCBpbiB0aGUgc2FtZSBoeWJyaWQgYXBwbGljYXRpb24uPGJyIC8+XG4gKiAgIFVzZSBvbmUgb3IgdGhlIG90aGVyLlxuICpcbiAqIDwvZGl2PlxuICpcbiAqICMjIyBEaWZmZXJlbmNlcyB3aXRoIGBVcGdyYWRlTW9kdWxlYFxuICpcbiAqIEJlc2lkZXMgdGhlaXIgZGlmZmVyZW50IEFQSSwgdGhlcmUgYXJlIHR3byBpbXBvcnRhbnQgaW50ZXJuYWwgZGlmZmVyZW5jZXMgYmV0d2VlblxuICogYGRvd25ncmFkZU1vZHVsZSgpYCBhbmQgYFVwZ3JhZGVNb2R1bGVgIHRoYXQgYWZmZWN0IHRoZSBiZWhhdmlvciBvZiBoeWJyaWQgYXBwbGljYXRpb25zOlxuICpcbiAqIDEuIFVubGlrZSBgVXBncmFkZU1vZHVsZWAsIGBkb3duZ3JhZGVNb2R1bGUoKWAgZG9lcyBub3QgYm9vdHN0cmFwIHRoZSBtYWluIEFuZ3VsYXJKUyBtb2R1bGVcbiAqICAgIGluc2lkZSB0aGUge0BsaW5rIE5nWm9uZSBBbmd1bGFyIHpvbmV9LlxuICogMi4gVW5saWtlIGBVcGdyYWRlTW9kdWxlYCwgYGRvd25ncmFkZU1vZHVsZSgpYCBkb2VzIG5vdCBhdXRvbWF0aWNhbGx5IHJ1biBhXG4gKiAgICBbJGRpZ2VzdCgpXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlIyRkaWdlc3QpIHdoZW4gY2hhbmdlcyBhcmVcbiAqICAgIGRldGVjdGVkIGluIHRoZSBBbmd1bGFyIHBhcnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqIFdoYXQgdGhpcyBtZWFucyBpcyB0aGF0IGFwcGxpY2F0aW9ucyB1c2luZyBgVXBncmFkZU1vZHVsZWAgd2lsbCBydW4gY2hhbmdlIGRldGVjdGlvbiBtb3JlXG4gKiBmcmVxdWVudGx5IGluIG9yZGVyIHRvIGVuc3VyZSB0aGF0IGJvdGggZnJhbWV3b3JrcyBhcmUgcHJvcGVybHkgbm90aWZpZWQgYWJvdXQgcG9zc2libGUgY2hhbmdlcy5cbiAqIFRoaXMgd2lsbCBpbmV2aXRhYmx5IHJlc3VsdCBpbiBtb3JlIGNoYW5nZSBkZXRlY3Rpb24gcnVucyB0aGFuIG5lY2Vzc2FyeS5cbiAqXG4gKiBgZG93bmdyYWRlTW9kdWxlKClgLCBvbiB0aGUgb3RoZXIgc2lkZSwgZG9lcyBub3QgdHJ5IHRvIHRpZSB0aGUgdHdvIGNoYW5nZSBkZXRlY3Rpb24gc3lzdGVtcyBhc1xuICogdGlnaHRseSwgcmVzdHJpY3RpbmcgdGhlIGV4cGxpY2l0IGNoYW5nZSBkZXRlY3Rpb24gcnVucyBvbmx5IHRvIGNhc2VzIHdoZXJlIGl0IGtub3dzIGl0IGlzXG4gKiBuZWNlc3NhcnkgKGUuZy4gd2hlbiB0aGUgaW5wdXRzIG9mIGEgZG93bmdyYWRlZCBjb21wb25lbnQgY2hhbmdlKS4gVGhpcyBpbXByb3ZlcyBwZXJmb3JtYW5jZSxcbiAqIGVzcGVjaWFsbHkgaW4gY2hhbmdlLWRldGVjdGlvbi1oZWF2eSBhcHBsaWNhdGlvbnMsIGJ1dCBsZWF2ZXMgaXQgdXAgdG8gdGhlIGRldmVsb3BlciB0byBtYW51YWxseVxuICogbm90aWZ5IGVhY2ggZnJhbWV3b3JrIGFzIG5lZWRlZC5cbiAqXG4gKiBGb3IgYSBtb3JlIGRldGFpbGVkIGRpc2N1c3Npb24gb2YgdGhlIGRpZmZlcmVuY2VzIGFuZCB0aGVpciBpbXBsaWNhdGlvbnMsIHNlZVxuICogW1VwZ3JhZGluZyBmb3IgUGVyZm9ybWFuY2VdKGd1aWRlL3VwZ3JhZGUtcGVyZm9ybWFuY2UpLlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1oZWxwZnVsXCI+XG4gKlxuICogICBZb3UgY2FuIG1hbnVhbGx5IHRyaWdnZXIgYSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1biBpbiBBbmd1bGFySlMgdXNpbmdcbiAqICAgW3Njb3BlLiRhcHBseSguLi4pXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlIyRhcHBseSkgb3JcbiAqICAgWyRyb290U2NvcGUuJGRpZ2VzdCgpXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlIyRkaWdlc3QpLlxuICpcbiAqICAgWW91IGNhbiBtYW51YWxseSB0cmlnZ2VyIGEgY2hhbmdlIGRldGVjdGlvbiBydW4gaW4gQW5ndWxhciB1c2luZyB7QGxpbmsgTmdab25lI3J1blxuICogICBuZ1pvbmUucnVuKC4uLil9LlxuICpcbiAqIDwvZGl2PlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZU1vZHVsZTxUPihcbiAgICBtb2R1bGVGYWN0b3J5T3JCb290c3RyYXBGbjogTmdNb2R1bGVGYWN0b3J5PFQ+fFxuICAgICgoZXh0cmFQcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10pID0+IFByb21pc2U8TmdNb2R1bGVSZWY8VD4+KSk6IHN0cmluZyB7XG4gIGNvbnN0IExBWllfTU9EVUxFX05BTUUgPSBVUEdSQURFX01PRFVMRV9OQU1FICsgJy5sYXp5JztcbiAgY29uc3QgYm9vdHN0cmFwRm4gPSBpc0Z1bmN0aW9uKG1vZHVsZUZhY3RvcnlPckJvb3RzdHJhcEZuKSA/XG4gICAgICBtb2R1bGVGYWN0b3J5T3JCb290c3RyYXBGbiA6XG4gICAgICAoZXh0cmFQcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10pID0+XG4gICAgICAgICAgcGxhdGZvcm1Ccm93c2VyKGV4dHJhUHJvdmlkZXJzKS5ib290c3RyYXBNb2R1bGVGYWN0b3J5KG1vZHVsZUZhY3RvcnlPckJvb3RzdHJhcEZuKTtcblxuICBsZXQgaW5qZWN0b3I6IEluamVjdG9yO1xuXG4gIC8vIENyZWF0ZSBhbiBuZzEgbW9kdWxlIHRvIGJvb3RzdHJhcC5cbiAgYW5ndWxhci5tb2R1bGUoTEFaWV9NT0RVTEVfTkFNRSwgW10pXG4gICAgICAuZmFjdG9yeShcbiAgICAgICAgICBJTkpFQ1RPUl9LRVksXG4gICAgICAgICAgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFpbmplY3Rvcikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAnVHJ5aW5nIHRvIGdldCB0aGUgQW5ndWxhciBpbmplY3RvciBiZWZvcmUgYm9vdHN0cmFwcGluZyBhbiBBbmd1bGFyIG1vZHVsZS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBpbmplY3RvcjtcbiAgICAgICAgICB9KVxuICAgICAgLmZhY3RvcnkoTEFaWV9NT0RVTEVfUkVGLCBbXG4gICAgICAgICRJTkpFQ1RPUixcbiAgICAgICAgKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgc2V0VGVtcEluamVjdG9yUmVmKCRpbmplY3Rvcik7XG4gICAgICAgICAgY29uc3QgcmVzdWx0OiBMYXp5TW9kdWxlUmVmID0ge1xuICAgICAgICAgICAgbmVlZHNOZ1pvbmU6IHRydWUsXG4gICAgICAgICAgICBwcm9taXNlOiBib290c3RyYXBGbihhbmd1bGFyMVByb3ZpZGVycykudGhlbihyZWYgPT4ge1xuICAgICAgICAgICAgICBpbmplY3RvciA9IHJlc3VsdC5pbmplY3RvciA9IG5ldyBOZ0FkYXB0ZXJJbmplY3RvcihyZWYuaW5qZWN0b3IpO1xuICAgICAgICAgICAgICBpbmplY3Rvci5nZXQoJElOSkVDVE9SKTtcblxuICAgICAgICAgICAgICByZXR1cm4gaW5qZWN0b3I7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgXSk7XG5cbiAgcmV0dXJuIExBWllfTU9EVUxFX05BTUU7XG59XG4iXX0=