/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
import { $INJECTOR, $PROVIDE, DOWNGRADED_MODULE_COUNT_KEY, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_APP_TYPE_KEY, UPGRADE_MODULE_NAME } from '../common/constants';
import { getDowngradedModuleCount, isFunction } from '../common/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
/** @type {?} */
let moduleUid = 0;
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
 * - When using {\@link PlatformRef#bootstrapmodule `bootstrapModule()`} or
 *   {\@link PlatformRef#bootstrapmodulefactory `bootstrapModuleFactory()`} to bootstrap the
 *   downgraded modules, each one is considered a "root" module. As a consequence, a new instance
 *   will be created for every injectable provided in `"root"` (via
 *   {\@link Injectable#providedIn `providedIn`}).
 *   If this is not your intention, you can have a shared module (that will act as act as the "root"
 *   module) and create all downgraded modules using that module's injector:
 *
 *   {\@example upgrade/static/ts/lite-multi-shared/module.ts region="shared-root-module"}
 *
 * \@publicApi
 * @template T
 * @param {?} moduleFactoryOrBootstrapFn
 * @return {?}
 */
export function downgradeModule(moduleFactoryOrBootstrapFn) {
    /** @type {?} */
    const lazyModuleName = `${UPGRADE_MODULE_NAME}.lazy${++moduleUid}`;
    /** @type {?} */
    const lazyModuleRefKey = `${LAZY_MODULE_REF}${lazyModuleName}`;
    /** @type {?} */
    const lazyInjectorKey = `${INJECTOR_KEY}${lazyModuleName}`;
    /** @type {?} */
    const bootstrapFn = isFunction(moduleFactoryOrBootstrapFn) ?
        moduleFactoryOrBootstrapFn :
        (extraProviders) => platformBrowser(extraProviders).bootstrapModuleFactory(moduleFactoryOrBootstrapFn);
    /** @type {?} */
    let injector;
    // Create an ng1 module to bootstrap.
    angular.module(lazyModuleName, [])
        .constant(UPGRADE_APP_TYPE_KEY, 3 /* Lite */)
        .factory(INJECTOR_KEY, [lazyInjectorKey, identity])
        .factory(lazyInjectorKey, () => {
        if (!injector) {
            throw new Error('Trying to get the Angular injector before bootstrapping the corresponding ' +
                'Angular module.');
        }
        return injector;
    })
        .factory(LAZY_MODULE_REF, [lazyModuleRefKey, identity])
        .factory(lazyModuleRefKey, [
        $INJECTOR,
        ($injector) => {
            setTempInjectorRef($injector);
            /** @type {?} */
            const result = {
                promise: bootstrapFn(angular1Providers).then(ref => {
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
        ($injector, $provide) => {
            $provide.constant(DOWNGRADED_MODULE_COUNT_KEY, getDowngradedModuleCount($injector) + 1);
        }
    ]);
    return lazyModuleName;
}
/**
 * @template T
 * @param {?} x
 * @return {?}
 */
function identity(x) {
    return x;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9zdGF0aWMvZG93bmdyYWRlX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUxRCxPQUFPLEtBQUssT0FBTyxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLDJCQUEyQixFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvSixPQUFPLEVBQWdDLHdCQUF3QixFQUFFLFVBQVUsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRW5HLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzNFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7SUFHckMsU0FBUyxHQUFHLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0dqQixNQUFNLFVBQVUsZUFBZSxDQUMzQiwwQkFDK0Q7O1VBQzNELGNBQWMsR0FBRyxHQUFHLG1CQUFtQixRQUFRLEVBQUUsU0FBUyxFQUFFOztVQUM1RCxnQkFBZ0IsR0FBRyxHQUFHLGVBQWUsR0FBRyxjQUFjLEVBQUU7O1VBQ3hELGVBQWUsR0FBRyxHQUFHLFlBQVksR0FBRyxjQUFjLEVBQUU7O1VBRXBELFdBQVcsR0FBRyxVQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1FBQ3hELDBCQUEwQixDQUFDLENBQUM7UUFDNUIsQ0FBQyxjQUFnQyxFQUFFLEVBQUUsQ0FDakMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLDBCQUEwQixDQUFDOztRQUV0RixRQUFrQjtJQUV0QixxQ0FBcUM7SUFDckMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO1NBQzdCLFFBQVEsQ0FBQyxvQkFBb0IsZUFBc0I7U0FDbkQsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNsRCxPQUFPLENBQ0osZUFBZSxFQUNmLEdBQUcsRUFBRTtRQUNILElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUNYLDRFQUE0RTtnQkFDNUUsaUJBQWlCLENBQUMsQ0FBQztTQUN4QjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUMsQ0FBQztTQUNMLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUN0RCxPQUFPLENBQ0osZ0JBQWdCLEVBQ2hCO1FBQ0UsU0FBUztRQUNULENBQUMsU0FBbUMsRUFBRSxFQUFFO1lBQ3RDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztrQkFDeEIsTUFBTSxHQUFrQjtnQkFDNUIsT0FBTyxFQUFFLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDakQsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2pFLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBRXhCLE9BQU8sUUFBUSxDQUFDO2dCQUNsQixDQUFDLENBQUM7YUFDSDtZQUNELE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7S0FDRixDQUFDO1NBQ0wsTUFBTSxDQUFDO1FBQ04sU0FBUyxFQUFFLFFBQVE7UUFDbkIsQ0FBQyxTQUFtQyxFQUFFLFFBQWlDLEVBQUUsRUFBRTtZQUN6RSxRQUFRLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUM7S0FDRixDQUFDLENBQUM7SUFFUCxPQUFPLGNBQWMsQ0FBQztBQUN4QixDQUFDOzs7Ozs7QUFFRCxTQUFTLFFBQVEsQ0FBVSxDQUFJO0lBQzdCLE9BQU8sQ0FBQyxDQUFDO0FBQ1gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RvciwgTmdNb2R1bGVGYWN0b3J5LCBOZ01vZHVsZVJlZiwgU3RhdGljUHJvdmlkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtwbGF0Zm9ybUJyb3dzZXJ9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRJTkpFQ1RPUiwgJFBST1ZJREUsIERPV05HUkFERURfTU9EVUxFX0NPVU5UX0tFWSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFVQR1JBREVfQVBQX1RZUEVfS0VZLCBVUEdSQURFX01PRFVMRV9OQU1FfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgVXBncmFkZUFwcFR5cGUsIGdldERvd25ncmFkZWRNb2R1bGVDb3VudCwgaXNGdW5jdGlvbn0gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuXG5pbXBvcnQge2FuZ3VsYXIxUHJvdmlkZXJzLCBzZXRUZW1wSW5qZWN0b3JSZWZ9IGZyb20gJy4vYW5ndWxhcjFfcHJvdmlkZXJzJztcbmltcG9ydCB7TmdBZGFwdGVySW5qZWN0b3J9IGZyb20gJy4vdXRpbCc7XG5cblxubGV0IG1vZHVsZVVpZCA9IDA7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGFuIEFuZ3VsYXJKUyBtb2R1bGUgdGhhdCBjYW4gYm9vdHN0cmFwIGFuIEFuZ3VsYXIgbW9kdWxlXG4gKiBcIm9uLWRlbWFuZFwiIChwb3NzaWJseSBsYXppbHkpIHdoZW4gYSB7QGxpbmsgZG93bmdyYWRlQ29tcG9uZW50IGRvd25ncmFkZWQgY29tcG9uZW50fSBuZWVkcyB0byBiZVxuICogaW5zdGFudGlhdGVkLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlL3N0YXRpYykgbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0XG4gKiBzdXBwb3J0IEFvVCBjb21waWxhdGlvbi4qXG4gKlxuICogSXQgYWxsb3dzIGxvYWRpbmcvYm9vdHN0cmFwcGluZyB0aGUgQW5ndWxhciBwYXJ0IG9mIGEgaHlicmlkIGFwcGxpY2F0aW9uIGxhemlseSBhbmQgbm90IGhhdmluZyB0b1xuICogcGF5IHRoZSBjb3N0IHVwLWZyb250LiBGb3IgZXhhbXBsZSwgeW91IGNhbiBoYXZlIGFuIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiB0aGF0IHVzZXMgQW5ndWxhciBmb3JcbiAqIHNwZWNpZmljIHJvdXRlcyBhbmQgb25seSBpbnN0YW50aWF0ZSB0aGUgQW5ndWxhciBtb2R1bGVzIGlmL3doZW4gdGhlIHVzZXIgdmlzaXRzIG9uZSBvZiB0aGVzZVxuICogcm91dGVzLlxuICpcbiAqIFRoZSBBbmd1bGFyIG1vZHVsZSB3aWxsIGJlIGJvb3RzdHJhcHBlZCBvbmNlICh3aGVuIHJlcXVlc3RlZCBmb3IgdGhlIGZpcnN0IHRpbWUpIGFuZCB0aGUgc2FtZVxuICogcmVmZXJlbmNlIHdpbGwgYmUgdXNlZCBmcm9tIHRoYXQgcG9pbnQgb253YXJkcy5cbiAqXG4gKiBgZG93bmdyYWRlTW9kdWxlKClgIHJlcXVpcmVzIGVpdGhlciBhbiBgTmdNb2R1bGVGYWN0b3J5YCBvciBhIGZ1bmN0aW9uOlxuICogLSBgTmdNb2R1bGVGYWN0b3J5YDogSWYgeW91IHBhc3MgYW4gYE5nTW9kdWxlRmFjdG9yeWAsIGl0IHdpbGwgYmUgdXNlZCB0byBpbnN0YW50aWF0ZSBhIG1vZHVsZVxuICogICB1c2luZyBgcGxhdGZvcm1Ccm93c2VyYCdzIHtAbGluayBQbGF0Zm9ybVJlZiNib290c3RyYXBNb2R1bGVGYWN0b3J5IGJvb3RzdHJhcE1vZHVsZUZhY3RvcnkoKX0uXG4gKiAtIGBGdW5jdGlvbmA6IElmIHlvdSBwYXNzIGEgZnVuY3Rpb24sIGl0IGlzIGV4cGVjdGVkIHRvIHJldHVybiBhIHByb21pc2UgcmVzb2x2aW5nIHRvIGFuXG4gKiAgIGBOZ01vZHVsZVJlZmAuIFRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBhbiBhcnJheSBvZiBleHRyYSB7QGxpbmsgU3RhdGljUHJvdmlkZXIgUHJvdmlkZXJzfVxuICogICB0aGF0IGFyZSBleHBlY3RlZCB0byBiZSBhdmFpbGFibGUgZnJvbSB0aGUgcmV0dXJuZWQgYE5nTW9kdWxlUmVmYCdzIGBJbmplY3RvcmAuXG4gKlxuICogYGRvd25ncmFkZU1vZHVsZSgpYCByZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBjcmVhdGVkIEFuZ3VsYXJKUyB3cmFwcGVyIG1vZHVsZS4gWW91IGNhbiB1c2UgaXQgdG9cbiAqIGRlY2xhcmUgYSBkZXBlbmRlbmN5IGluIHlvdXIgbWFpbiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9saXRlL21vZHVsZS50cyByZWdpb249XCJiYXNpYy1ob3ctdG9cIn1cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzIG9uIGhvdyB0byB1c2UgYGRvd25ncmFkZU1vZHVsZSgpYCBzZWVcbiAqIFtVcGdyYWRpbmcgZm9yIFBlcmZvcm1hbmNlXShndWlkZS91cGdyYWRlLXBlcmZvcm1hbmNlKS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEFwYXJ0IGZyb20gYFVwZ3JhZGVNb2R1bGVgLCB5b3UgY2FuIHVzZSB0aGUgcmVzdCBvZiB0aGUgYHVwZ3JhZGUvc3RhdGljYCBoZWxwZXJzIGFzIHVzdWFsIHRvXG4gKiBidWlsZCBhIGh5YnJpZCBhcHBsaWNhdGlvbi4gTm90ZSB0aGF0IHRoZSBBbmd1bGFyIHBpZWNlcyAoZS5nLiBkb3duZ3JhZGVkIHNlcnZpY2VzKSB3aWxsIG5vdCBiZVxuICogYXZhaWxhYmxlIHVudGlsIHRoZSBkb3duZ3JhZGVkIG1vZHVsZSBoYXMgYmVlbiBib290c3RyYXBwZWQsIGkuZS4gYnkgaW5zdGFudGlhdGluZyBhIGRvd25ncmFkZWRcbiAqIGNvbXBvbmVudC5cbiAqXG4gKiA8ZGl2IGNsYXNzPVwiYWxlcnQgaXMtaW1wb3J0YW50XCI+XG4gKlxuICogICBZb3UgY2Fubm90IHVzZSBgZG93bmdyYWRlTW9kdWxlKClgIGFuZCBgVXBncmFkZU1vZHVsZWAgaW4gdGhlIHNhbWUgaHlicmlkIGFwcGxpY2F0aW9uLjxiciAvPlxuICogICBVc2Ugb25lIG9yIHRoZSBvdGhlci5cbiAqXG4gKiA8L2Rpdj5cbiAqXG4gKiAjIyMgRGlmZmVyZW5jZXMgd2l0aCBgVXBncmFkZU1vZHVsZWBcbiAqXG4gKiBCZXNpZGVzIHRoZWlyIGRpZmZlcmVudCBBUEksIHRoZXJlIGFyZSB0d28gaW1wb3J0YW50IGludGVybmFsIGRpZmZlcmVuY2VzIGJldHdlZW5cbiAqIGBkb3duZ3JhZGVNb2R1bGUoKWAgYW5kIGBVcGdyYWRlTW9kdWxlYCB0aGF0IGFmZmVjdCB0aGUgYmVoYXZpb3Igb2YgaHlicmlkIGFwcGxpY2F0aW9uczpcbiAqXG4gKiAxLiBVbmxpa2UgYFVwZ3JhZGVNb2R1bGVgLCBgZG93bmdyYWRlTW9kdWxlKClgIGRvZXMgbm90IGJvb3RzdHJhcCB0aGUgbWFpbiBBbmd1bGFySlMgbW9kdWxlXG4gKiAgICBpbnNpZGUgdGhlIHtAbGluayBOZ1pvbmUgQW5ndWxhciB6b25lfS5cbiAqIDIuIFVubGlrZSBgVXBncmFkZU1vZHVsZWAsIGBkb3duZ3JhZGVNb2R1bGUoKWAgZG9lcyBub3QgYXV0b21hdGljYWxseSBydW4gYVxuICogICAgWyRkaWdlc3QoKV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KSB3aGVuIGNoYW5nZXMgYXJlXG4gKiAgICBkZXRlY3RlZCBpbiB0aGUgQW5ndWxhciBwYXJ0IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBXaGF0IHRoaXMgbWVhbnMgaXMgdGhhdCBhcHBsaWNhdGlvbnMgdXNpbmcgYFVwZ3JhZGVNb2R1bGVgIHdpbGwgcnVuIGNoYW5nZSBkZXRlY3Rpb24gbW9yZVxuICogZnJlcXVlbnRseSBpbiBvcmRlciB0byBlbnN1cmUgdGhhdCBib3RoIGZyYW1ld29ya3MgYXJlIHByb3Blcmx5IG5vdGlmaWVkIGFib3V0IHBvc3NpYmxlIGNoYW5nZXMuXG4gKiBUaGlzIHdpbGwgaW5ldml0YWJseSByZXN1bHQgaW4gbW9yZSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgdGhhbiBuZWNlc3NhcnkuXG4gKlxuICogYGRvd25ncmFkZU1vZHVsZSgpYCwgb24gdGhlIG90aGVyIHNpZGUsIGRvZXMgbm90IHRyeSB0byB0aWUgdGhlIHR3byBjaGFuZ2UgZGV0ZWN0aW9uIHN5c3RlbXMgYXNcbiAqIHRpZ2h0bHksIHJlc3RyaWN0aW5nIHRoZSBleHBsaWNpdCBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgb25seSB0byBjYXNlcyB3aGVyZSBpdCBrbm93cyBpdCBpc1xuICogbmVjZXNzYXJ5IChlLmcuIHdoZW4gdGhlIGlucHV0cyBvZiBhIGRvd25ncmFkZWQgY29tcG9uZW50IGNoYW5nZSkuIFRoaXMgaW1wcm92ZXMgcGVyZm9ybWFuY2UsXG4gKiBlc3BlY2lhbGx5IGluIGNoYW5nZS1kZXRlY3Rpb24taGVhdnkgYXBwbGljYXRpb25zLCBidXQgbGVhdmVzIGl0IHVwIHRvIHRoZSBkZXZlbG9wZXIgdG8gbWFudWFsbHlcbiAqIG5vdGlmeSBlYWNoIGZyYW1ld29yayBhcyBuZWVkZWQuXG4gKlxuICogRm9yIGEgbW9yZSBkZXRhaWxlZCBkaXNjdXNzaW9uIG9mIHRoZSBkaWZmZXJlbmNlcyBhbmQgdGhlaXIgaW1wbGljYXRpb25zLCBzZWVcbiAqIFtVcGdyYWRpbmcgZm9yIFBlcmZvcm1hbmNlXShndWlkZS91cGdyYWRlLXBlcmZvcm1hbmNlKS5cbiAqXG4gKiA8ZGl2IGNsYXNzPVwiYWxlcnQgaXMtaGVscGZ1bFwiPlxuICpcbiAqICAgWW91IGNhbiBtYW51YWxseSB0cmlnZ2VyIGEgY2hhbmdlIGRldGVjdGlvbiBydW4gaW4gQW5ndWxhckpTIHVzaW5nXG4gKiAgIFtzY29wZS4kYXBwbHkoLi4uKV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkYXBwbHkpIG9yXG4gKiAgIFskcm9vdFNjb3BlLiRkaWdlc3QoKV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KS5cbiAqXG4gKiAgIFlvdSBjYW4gbWFudWFsbHkgdHJpZ2dlciBhIGNoYW5nZSBkZXRlY3Rpb24gcnVuIGluIEFuZ3VsYXIgdXNpbmcge0BsaW5rIE5nWm9uZSNydW5cbiAqICAgbmdab25lLnJ1biguLi4pfS5cbiAqXG4gKiA8L2Rpdj5cbiAqXG4gKiAjIyMgRG93bmdyYWRpbmcgbXVsdGlwbGUgbW9kdWxlc1xuICpcbiAqIEl0IGlzIHBvc3NpYmxlIHRvIGRvd25ncmFkZSBtdWx0aXBsZSBtb2R1bGVzIGFuZCBpbmNsdWRlIHRoZW0gaW4gYW4gQW5ndWxhckpTIGFwcGxpY2F0aW9uLiBJblxuICogdGhhdCBjYXNlLCBlYWNoIGRvd25ncmFkZWQgbW9kdWxlIHdpbGwgYmUgYm9vdHN0cmFwcGVkIHdoZW4gYW4gYXNzb2NpYXRlZCBkb3duZ3JhZGVkIGNvbXBvbmVudCBvclxuICogaW5qZWN0YWJsZSBuZWVkcyB0byBiZSBpbnN0YW50aWF0ZWQuXG4gKlxuICogVGhpbmdzIHRvIGtlZXAgaW4gbWluZCwgd2hlbiBkb3duZ3JhZGluZyBtdWx0aXBsZSBtb2R1bGVzOlxuICpcbiAqIC0gRWFjaCBkb3duZ3JhZGVkIGNvbXBvbmVudC9pbmplY3RhYmxlIG5lZWRzIHRvIGJlIGV4cGxpY2l0bHkgYXNzb2NpYXRlZCB3aXRoIGEgZG93bmdyYWRlZFxuICogICBtb2R1bGUuIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50KClgIGFuZCBgZG93bmdyYWRlSW5qZWN0YWJsZSgpYCBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIC0gSWYgeW91IHdhbnQgc29tZSBpbmplY3RhYmxlcyB0byBiZSBzaGFyZWQgYW1vbmcgYWxsIGRvd25ncmFkZWQgbW9kdWxlcywgeW91IGNhbiBwcm92aWRlIHRoZW0gYXNcbiAqICAgYFN0YXRpY1Byb3ZpZGVyYHMsIHdoZW4gY3JlYXRpbmcgdGhlIGBQbGF0Zm9ybVJlZmAgKGUuZy4gdmlhIGBwbGF0Zm9ybUJyb3dzZXJgIG9yXG4gKiAgIGBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljYCkuXG4gKlxuICogLSBXaGVuIHVzaW5nIHtAbGluayBQbGF0Zm9ybVJlZiNib290c3RyYXBtb2R1bGUgYGJvb3RzdHJhcE1vZHVsZSgpYH0gb3JcbiAqICAge0BsaW5rIFBsYXRmb3JtUmVmI2Jvb3RzdHJhcG1vZHVsZWZhY3RvcnkgYGJvb3RzdHJhcE1vZHVsZUZhY3RvcnkoKWB9IHRvIGJvb3RzdHJhcCB0aGVcbiAqICAgZG93bmdyYWRlZCBtb2R1bGVzLCBlYWNoIG9uZSBpcyBjb25zaWRlcmVkIGEgXCJyb290XCIgbW9kdWxlLiBBcyBhIGNvbnNlcXVlbmNlLCBhIG5ldyBpbnN0YW5jZVxuICogICB3aWxsIGJlIGNyZWF0ZWQgZm9yIGV2ZXJ5IGluamVjdGFibGUgcHJvdmlkZWQgaW4gYFwicm9vdFwiYCAodmlhXG4gKiAgIHtAbGluayBJbmplY3RhYmxlI3Byb3ZpZGVkSW4gYHByb3ZpZGVkSW5gfSkuXG4gKiAgIElmIHRoaXMgaXMgbm90IHlvdXIgaW50ZW50aW9uLCB5b3UgY2FuIGhhdmUgYSBzaGFyZWQgbW9kdWxlICh0aGF0IHdpbGwgYWN0IGFzIGFjdCBhcyB0aGUgXCJyb290XCJcbiAqICAgbW9kdWxlKSBhbmQgY3JlYXRlIGFsbCBkb3duZ3JhZGVkIG1vZHVsZXMgdXNpbmcgdGhhdCBtb2R1bGUncyBpbmplY3RvcjpcbiAqXG4gKiAgIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9saXRlLW11bHRpLXNoYXJlZC9tb2R1bGUudHMgcmVnaW9uPVwic2hhcmVkLXJvb3QtbW9kdWxlXCJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZG93bmdyYWRlTW9kdWxlPFQ+KFxuICAgIG1vZHVsZUZhY3RvcnlPckJvb3RzdHJhcEZuOiBOZ01vZHVsZUZhY3Rvcnk8VD58XG4gICAgKChleHRyYVByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSkgPT4gUHJvbWlzZTxOZ01vZHVsZVJlZjxUPj4pKTogc3RyaW5nIHtcbiAgY29uc3QgbGF6eU1vZHVsZU5hbWUgPSBgJHtVUEdSQURFX01PRFVMRV9OQU1FfS5sYXp5JHsrK21vZHVsZVVpZH1gO1xuICBjb25zdCBsYXp5TW9kdWxlUmVmS2V5ID0gYCR7TEFaWV9NT0RVTEVfUkVGfSR7bGF6eU1vZHVsZU5hbWV9YDtcbiAgY29uc3QgbGF6eUluamVjdG9yS2V5ID0gYCR7SU5KRUNUT1JfS0VZfSR7bGF6eU1vZHVsZU5hbWV9YDtcblxuICBjb25zdCBib290c3RyYXBGbiA9IGlzRnVuY3Rpb24obW9kdWxlRmFjdG9yeU9yQm9vdHN0cmFwRm4pID9cbiAgICAgIG1vZHVsZUZhY3RvcnlPckJvb3RzdHJhcEZuIDpcbiAgICAgIChleHRyYVByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSkgPT5cbiAgICAgICAgICBwbGF0Zm9ybUJyb3dzZXIoZXh0cmFQcm92aWRlcnMpLmJvb3RzdHJhcE1vZHVsZUZhY3RvcnkobW9kdWxlRmFjdG9yeU9yQm9vdHN0cmFwRm4pO1xuXG4gIGxldCBpbmplY3RvcjogSW5qZWN0b3I7XG5cbiAgLy8gQ3JlYXRlIGFuIG5nMSBtb2R1bGUgdG8gYm9vdHN0cmFwLlxuICBhbmd1bGFyLm1vZHVsZShsYXp5TW9kdWxlTmFtZSwgW10pXG4gICAgICAuY29uc3RhbnQoVVBHUkFERV9BUFBfVFlQRV9LRVksIFVwZ3JhZGVBcHBUeXBlLkxpdGUpXG4gICAgICAuZmFjdG9yeShJTkpFQ1RPUl9LRVksIFtsYXp5SW5qZWN0b3JLZXksIGlkZW50aXR5XSlcbiAgICAgIC5mYWN0b3J5KFxuICAgICAgICAgIGxhenlJbmplY3RvcktleSxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWluamVjdG9yKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICdUcnlpbmcgdG8gZ2V0IHRoZSBBbmd1bGFyIGluamVjdG9yIGJlZm9yZSBib290c3RyYXBwaW5nIHRoZSBjb3JyZXNwb25kaW5nICcgK1xuICAgICAgICAgICAgICAgICAgJ0FuZ3VsYXIgbW9kdWxlLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluamVjdG9yO1xuICAgICAgICAgIH0pXG4gICAgICAuZmFjdG9yeShMQVpZX01PRFVMRV9SRUYsIFtsYXp5TW9kdWxlUmVmS2V5LCBpZGVudGl0eV0pXG4gICAgICAuZmFjdG9yeShcbiAgICAgICAgICBsYXp5TW9kdWxlUmVmS2V5LFxuICAgICAgICAgIFtcbiAgICAgICAgICAgICRJTkpFQ1RPUixcbiAgICAgICAgICAgICgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICBzZXRUZW1wSW5qZWN0b3JSZWYoJGluamVjdG9yKTtcbiAgICAgICAgICAgICAgY29uc3QgcmVzdWx0OiBMYXp5TW9kdWxlUmVmID0ge1xuICAgICAgICAgICAgICAgIHByb21pc2U6IGJvb3RzdHJhcEZuKGFuZ3VsYXIxUHJvdmlkZXJzKS50aGVuKHJlZiA9PiB7XG4gICAgICAgICAgICAgICAgICBpbmplY3RvciA9IHJlc3VsdC5pbmplY3RvciA9IG5ldyBOZ0FkYXB0ZXJJbmplY3RvcihyZWYuaW5qZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgaW5qZWN0b3IuZ2V0KCRJTkpFQ1RPUik7XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbmplY3RvcjtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pXG4gICAgICAuY29uZmlnKFtcbiAgICAgICAgJElOSkVDVE9SLCAkUFJPVklERSxcbiAgICAgICAgKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCAkcHJvdmlkZTogYW5ndWxhci5JUHJvdmlkZVNlcnZpY2UpID0+IHtcbiAgICAgICAgICAkcHJvdmlkZS5jb25zdGFudChET1dOR1JBREVEX01PRFVMRV9DT1VOVF9LRVksIGdldERvd25ncmFkZWRNb2R1bGVDb3VudCgkaW5qZWN0b3IpICsgMSk7XG4gICAgICAgIH1cbiAgICAgIF0pO1xuXG4gIHJldHVybiBsYXp5TW9kdWxlTmFtZTtcbn1cblxuZnVuY3Rpb24gaWRlbnRpdHk8VCA9IGFueT4oeDogVCk6IFQge1xuICByZXR1cm4geDtcbn1cbiJdfQ==