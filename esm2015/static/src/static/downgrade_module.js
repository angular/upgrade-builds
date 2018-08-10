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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9zdGF0aWMvZG93bmdyYWRlX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUxRCxPQUFPLEtBQUssT0FBTyxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2xHLE9BQU8sRUFBZ0IsVUFBVSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFekQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDM0UsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUZ6QyxNQUFNLDBCQUNGLDBCQUMrRDs7SUFDakUsTUFBTSxnQkFBZ0IsR0FBRyxtQkFBbUIsR0FBRyxPQUFPLENBQUM7O0lBQ3ZELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUM7UUFDeEQsMEJBQTBCLENBQUMsQ0FBQztRQUM1QixDQUFDLGNBQWdDLEVBQUUsRUFBRSxDQUNqQyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUMsc0JBQXNCLENBQUMsMEJBQTBCLENBQUMsQ0FBQzs7SUFFM0YsSUFBSSxRQUFRLENBQVc7O0lBR3ZCLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDO1NBQy9CLE9BQU8sQ0FDSixZQUFZLEVBQ1osR0FBRyxFQUFFO1FBQ0gsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLE1BQU0sSUFBSSxLQUFLLENBQ1gsNEVBQTRFLENBQUMsQ0FBQztTQUNuRjtRQUNELE9BQU8sUUFBUSxDQUFDO0tBQ2pCLENBQUM7U0FDTCxPQUFPLENBQUMsZUFBZSxFQUFFO1FBQ3hCLFNBQVM7UUFDVCxDQUFDLFNBQW1DLEVBQUUsRUFBRTtZQUN0QyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7WUFDOUIsTUFBTSxNQUFNLEdBQWtCO2dCQUM1QixXQUFXLEVBQUUsSUFBSTtnQkFDakIsT0FBTyxFQUFFLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDakQsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2pFLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBRXhCLE9BQU8sUUFBUSxDQUFDO2lCQUNqQixDQUFDO2FBQ0gsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDO1NBQ2Y7S0FDRixDQUFDLENBQUM7SUFFUCxPQUFPLGdCQUFnQixDQUFDO0NBQ3pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBOZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlUmVmLCBTdGF0aWNQcm92aWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge3BsYXRmb3JtQnJvd3Nlcn0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi4vY29tbW9uL2FuZ3VsYXIxJztcbmltcG9ydCB7JElOSkVDVE9SLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgVVBHUkFERV9NT0RVTEVfTkFNRX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge0xhenlNb2R1bGVSZWYsIGlzRnVuY3Rpb259IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuaW1wb3J0IHthbmd1bGFyMVByb3ZpZGVycywgc2V0VGVtcEluamVjdG9yUmVmfSBmcm9tICcuL2FuZ3VsYXIxX3Byb3ZpZGVycyc7XG5pbXBvcnQge05nQWRhcHRlckluamVjdG9yfSBmcm9tICcuL3V0aWwnO1xuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGFuIEFuZ3VsYXJKUyBtb2R1bGUgdGhhdCBjYW4gYm9vdHN0cmFwIGFuIEFuZ3VsYXIgbW9kdWxlXG4gKiBcIm9uLWRlbWFuZFwiIChwb3NzaWJseSBsYXppbHkpIHdoZW4gYSB7QGxpbmsgZG93bmdyYWRlQ29tcG9uZW50IGRvd25ncmFkZWQgY29tcG9uZW50fSBuZWVkcyB0byBiZVxuICogaW5zdGFudGlhdGVkLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlL3N0YXRpYykgbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0XG4gKiBzdXBwb3J0IEFvVCBjb21waWxhdGlvbi4qXG4gKlxuICogSXQgYWxsb3dzIGxvYWRpbmcvYm9vdHN0cmFwcGluZyB0aGUgQW5ndWxhciBwYXJ0IG9mIGEgaHlicmlkIGFwcGxpY2F0aW9uIGxhemlseSBhbmQgbm90IGhhdmluZyB0b1xuICogcGF5IHRoZSBjb3N0IHVwLWZyb250LiBGb3IgZXhhbXBsZSwgeW91IGNhbiBoYXZlIGFuIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiB0aGF0IHVzZXMgQW5ndWxhciBmb3JcbiAqIHNwZWNpZmljIHJvdXRlcyBhbmQgb25seSBpbnN0YW50aWF0ZSB0aGUgQW5ndWxhciBtb2R1bGVzIGlmL3doZW4gdGhlIHVzZXIgdmlzaXRzIG9uZSBvZiB0aGVzZVxuICogcm91dGVzLlxuICpcbiAqIFRoZSBBbmd1bGFyIG1vZHVsZSB3aWxsIGJlIGJvb3RzdHJhcHBlZCBvbmNlICh3aGVuIHJlcXVlc3RlZCBmb3IgdGhlIGZpcnN0IHRpbWUpIGFuZCB0aGUgc2FtZVxuICogcmVmZXJlbmNlIHdpbGwgYmUgdXNlZCBmcm9tIHRoYXQgcG9pbnQgb253YXJkcy5cbiAqXG4gKiBgZG93bmdyYWRlTW9kdWxlKClgIHJlcXVpcmVzIGVpdGhlciBhbiBgTmdNb2R1bGVGYWN0b3J5YCBvciBhIGZ1bmN0aW9uOlxuICogLSBgTmdNb2R1bGVGYWN0b3J5YDogSWYgeW91IHBhc3MgYW4gYE5nTW9kdWxlRmFjdG9yeWAsIGl0IHdpbGwgYmUgdXNlZCB0byBpbnN0YW50aWF0ZSBhIG1vZHVsZVxuICogICB1c2luZyBgcGxhdGZvcm1Ccm93c2VyYCdzIHtAbGluayBQbGF0Zm9ybVJlZiNib290c3RyYXBNb2R1bGVGYWN0b3J5IGJvb3RzdHJhcE1vZHVsZUZhY3RvcnkoKX0uXG4gKiAtIGBGdW5jdGlvbmA6IElmIHlvdSBwYXNzIGEgZnVuY3Rpb24sIGl0IGlzIGV4cGVjdGVkIHRvIHJldHVybiBhIHByb21pc2UgcmVzb2x2aW5nIHRvIGFuXG4gKiAgIGBOZ01vZHVsZVJlZmAuIFRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCBhbiBhcnJheSBvZiBleHRyYSB7QGxpbmsgU3RhdGljUHJvdmlkZXIgUHJvdmlkZXJzfVxuICogICB0aGF0IGFyZSBleHBlY3RlZCB0byBiZSBhdmFpbGFibGUgZnJvbSB0aGUgcmV0dXJuZWQgYE5nTW9kdWxlUmVmYCdzIGBJbmplY3RvcmAuXG4gKlxuICogYGRvd25ncmFkZU1vZHVsZSgpYCByZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBjcmVhdGVkIEFuZ3VsYXJKUyB3cmFwcGVyIG1vZHVsZS4gWW91IGNhbiB1c2UgaXQgdG9cbiAqIGRlY2xhcmUgYSBkZXBlbmRlbmN5IGluIHlvdXIgbWFpbiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9saXRlL21vZHVsZS50cyByZWdpb249XCJiYXNpYy1ob3ctdG9cIn1cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzIG9uIGhvdyB0byB1c2UgYGRvd25ncmFkZU1vZHVsZSgpYCBzZWVcbiAqIFtVcGdyYWRpbmcgZm9yIFBlcmZvcm1hbmNlXShndWlkZS91cGdyYWRlLXBlcmZvcm1hbmNlKS5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIEFwYXJ0IGZyb20gYFVwZ3JhZGVNb2R1bGVgLCB5b3UgY2FuIHVzZSB0aGUgcmVzdCBvZiB0aGUgYHVwZ3JhZGUvc3RhdGljYCBoZWxwZXJzIGFzIHVzdWFsIHRvXG4gKiBidWlsZCBhIGh5YnJpZCBhcHBsaWNhdGlvbi4gTm90ZSB0aGF0IHRoZSBBbmd1bGFyIHBpZWNlcyAoZS5nLiBkb3duZ3JhZGVkIHNlcnZpY2VzKSB3aWxsIG5vdCBiZVxuICogYXZhaWxhYmxlIHVudGlsIHRoZSBkb3duZ3JhZGVkIG1vZHVsZSBoYXMgYmVlbiBib290c3RyYXBwZWQsIGkuZS4gYnkgaW5zdGFudGlhdGluZyBhIGRvd25ncmFkZWRcbiAqIGNvbXBvbmVudC5cbiAqXG4gKiA8ZGl2IGNsYXNzPVwiYWxlcnQgaXMtaW1wb3J0YW50XCI+XG4gKlxuICogICBZb3UgY2Fubm90IHVzZSBgZG93bmdyYWRlTW9kdWxlKClgIGFuZCBgVXBncmFkZU1vZHVsZWAgaW4gdGhlIHNhbWUgaHlicmlkIGFwcGxpY2F0aW9uLjxiciAvPlxuICogICBVc2Ugb25lIG9yIHRoZSBvdGhlci5cbiAqXG4gKiA8L2Rpdj5cbiAqXG4gKiAjIyMgRGlmZmVyZW5jZXMgd2l0aCBgVXBncmFkZU1vZHVsZWBcbiAqXG4gKiBCZXNpZGVzIHRoZWlyIGRpZmZlcmVudCBBUEksIHRoZXJlIGFyZSB0d28gaW1wb3J0YW50IGludGVybmFsIGRpZmZlcmVuY2VzIGJldHdlZW5cbiAqIGBkb3duZ3JhZGVNb2R1bGUoKWAgYW5kIGBVcGdyYWRlTW9kdWxlYCB0aGF0IGFmZmVjdCB0aGUgYmVoYXZpb3Igb2YgaHlicmlkIGFwcGxpY2F0aW9uczpcbiAqXG4gKiAxLiBVbmxpa2UgYFVwZ3JhZGVNb2R1bGVgLCBgZG93bmdyYWRlTW9kdWxlKClgIGRvZXMgbm90IGJvb3RzdHJhcCB0aGUgbWFpbiBBbmd1bGFySlMgbW9kdWxlXG4gKiAgICBpbnNpZGUgdGhlIHtAbGluayBOZ1pvbmUgQW5ndWxhciB6b25lfS5cbiAqIDIuIFVubGlrZSBgVXBncmFkZU1vZHVsZWAsIGBkb3duZ3JhZGVNb2R1bGUoKWAgZG9lcyBub3QgYXV0b21hdGljYWxseSBydW4gYVxuICogICAgWyRkaWdlc3QoKV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KSB3aGVuIGNoYW5nZXMgYXJlXG4gKiAgICBkZXRlY3RlZCBpbiB0aGUgQW5ndWxhciBwYXJ0IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBXaGF0IHRoaXMgbWVhbnMgaXMgdGhhdCBhcHBsaWNhdGlvbnMgdXNpbmcgYFVwZ3JhZGVNb2R1bGVgIHdpbGwgcnVuIGNoYW5nZSBkZXRlY3Rpb24gbW9yZVxuICogZnJlcXVlbnRseSBpbiBvcmRlciB0byBlbnN1cmUgdGhhdCBib3RoIGZyYW1ld29ya3MgYXJlIHByb3Blcmx5IG5vdGlmaWVkIGFib3V0IHBvc3NpYmxlIGNoYW5nZXMuXG4gKiBUaGlzIHdpbGwgaW5ldml0YWJseSByZXN1bHQgaW4gbW9yZSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgdGhhbiBuZWNlc3NhcnkuXG4gKlxuICogYGRvd25ncmFkZU1vZHVsZSgpYCwgb24gdGhlIG90aGVyIHNpZGUsIGRvZXMgbm90IHRyeSB0byB0aWUgdGhlIHR3byBjaGFuZ2UgZGV0ZWN0aW9uIHN5c3RlbXMgYXNcbiAqIHRpZ2h0bHksIHJlc3RyaWN0aW5nIHRoZSBleHBsaWNpdCBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgb25seSB0byBjYXNlcyB3aGVyZSBpdCBrbm93cyBpdCBpc1xuICogbmVjZXNzYXJ5IChlLmcuIHdoZW4gdGhlIGlucHV0cyBvZiBhIGRvd25ncmFkZWQgY29tcG9uZW50IGNoYW5nZSkuIFRoaXMgaW1wcm92ZXMgcGVyZm9ybWFuY2UsXG4gKiBlc3BlY2lhbGx5IGluIGNoYW5nZS1kZXRlY3Rpb24taGVhdnkgYXBwbGljYXRpb25zLCBidXQgbGVhdmVzIGl0IHVwIHRvIHRoZSBkZXZlbG9wZXIgdG8gbWFudWFsbHlcbiAqIG5vdGlmeSBlYWNoIGZyYW1ld29yayBhcyBuZWVkZWQuXG4gKlxuICogRm9yIGEgbW9yZSBkZXRhaWxlZCBkaXNjdXNzaW9uIG9mIHRoZSBkaWZmZXJlbmNlcyBhbmQgdGhlaXIgaW1wbGljYXRpb25zLCBzZWVcbiAqIFtVcGdyYWRpbmcgZm9yIFBlcmZvcm1hbmNlXShndWlkZS91cGdyYWRlLXBlcmZvcm1hbmNlKS5cbiAqXG4gKiA8ZGl2IGNsYXNzPVwiYWxlcnQgaXMtaGVscGZ1bFwiPlxuICpcbiAqICAgWW91IGNhbiBtYW51YWxseSB0cmlnZ2VyIGEgY2hhbmdlIGRldGVjdGlvbiBydW4gaW4gQW5ndWxhckpTIHVzaW5nXG4gKiAgIFtzY29wZS4kYXBwbHkoLi4uKV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkYXBwbHkpIG9yXG4gKiAgIFskcm9vdFNjb3BlLiRkaWdlc3QoKV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KS5cbiAqXG4gKiAgIFlvdSBjYW4gbWFudWFsbHkgdHJpZ2dlciBhIGNoYW5nZSBkZXRlY3Rpb24gcnVuIGluIEFuZ3VsYXIgdXNpbmcge0BsaW5rIE5nWm9uZSNydW5cbiAqICAgbmdab25lLnJ1biguLi4pfS5cbiAqXG4gKiA8L2Rpdj5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVNb2R1bGU8VD4oXG4gICAgbW9kdWxlRmFjdG9yeU9yQm9vdHN0cmFwRm46IE5nTW9kdWxlRmFjdG9yeTxUPnxcbiAgICAoKGV4dHJhUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdKSA9PiBQcm9taXNlPE5nTW9kdWxlUmVmPFQ+PikpOiBzdHJpbmcge1xuICBjb25zdCBMQVpZX01PRFVMRV9OQU1FID0gVVBHUkFERV9NT0RVTEVfTkFNRSArICcubGF6eSc7XG4gIGNvbnN0IGJvb3RzdHJhcEZuID0gaXNGdW5jdGlvbihtb2R1bGVGYWN0b3J5T3JCb290c3RyYXBGbikgP1xuICAgICAgbW9kdWxlRmFjdG9yeU9yQm9vdHN0cmFwRm4gOlxuICAgICAgKGV4dHJhUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdKSA9PlxuICAgICAgICAgIHBsYXRmb3JtQnJvd3NlcihleHRyYVByb3ZpZGVycykuYm9vdHN0cmFwTW9kdWxlRmFjdG9yeShtb2R1bGVGYWN0b3J5T3JCb290c3RyYXBGbik7XG5cbiAgbGV0IGluamVjdG9yOiBJbmplY3RvcjtcblxuICAvLyBDcmVhdGUgYW4gbmcxIG1vZHVsZSB0byBib290c3RyYXAuXG4gIGFuZ3VsYXIubW9kdWxlKExBWllfTU9EVUxFX05BTUUsIFtdKVxuICAgICAgLmZhY3RvcnkoXG4gICAgICAgICAgSU5KRUNUT1JfS0VZLFxuICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgIGlmICghaW5qZWN0b3IpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgJ1RyeWluZyB0byBnZXQgdGhlIEFuZ3VsYXIgaW5qZWN0b3IgYmVmb3JlIGJvb3RzdHJhcHBpbmcgYW4gQW5ndWxhciBtb2R1bGUuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaW5qZWN0b3I7XG4gICAgICAgICAgfSlcbiAgICAgIC5mYWN0b3J5KExBWllfTU9EVUxFX1JFRiwgW1xuICAgICAgICAkSU5KRUNUT1IsXG4gICAgICAgICgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgIHNldFRlbXBJbmplY3RvclJlZigkaW5qZWN0b3IpO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdDogTGF6eU1vZHVsZVJlZiA9IHtcbiAgICAgICAgICAgIG5lZWRzTmdab25lOiB0cnVlLFxuICAgICAgICAgICAgcHJvbWlzZTogYm9vdHN0cmFwRm4oYW5ndWxhcjFQcm92aWRlcnMpLnRoZW4ocmVmID0+IHtcbiAgICAgICAgICAgICAgaW5qZWN0b3IgPSByZXN1bHQuaW5qZWN0b3IgPSBuZXcgTmdBZGFwdGVySW5qZWN0b3IocmVmLmluamVjdG9yKTtcbiAgICAgICAgICAgICAgaW5qZWN0b3IuZ2V0KCRJTkpFQ1RPUik7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGluamVjdG9yO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIF0pO1xuXG4gIHJldHVybiBMQVpZX01PRFVMRV9OQU1FO1xufVxuIl19