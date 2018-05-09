/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, NgModule, NgZone, Testability } from '@angular/core';
import * as angular from '../common/angular1';
import { $$TESTABILITY, $DELEGATE, $INJECTOR, $INTERVAL, $PROVIDE, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_MODULE_NAME } from '../common/constants';
import { controllerKey } from '../common/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
/**
 * \@description
 *
 * An `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * The `upgrade/static` package contains helpers that allow AngularJS and Angular components
 * to be used together inside a hybrid upgrade application, which supports AoT compilation.
 *
 * Specifically, the classes and functions in the `upgrade/static` module allow the following:
 * 1. Creation of an Angular directive that wraps and exposes an AngularJS component so
 *    that it can be used in an Angular template. See `UpgradeComponent`.
 * 2. Creation of an AngularJS directive that wraps and exposes an Angular component so
 *    that it can be used in an AngularJS template. See `downgradeComponent`.
 * 3. Creation of an Angular root injector provider that wraps and exposes an AngularJS
 *    service so that it can be injected into an Angular context. See
 *    {\@link UpgradeModule#upgrading-an-angular-1-service Upgrading an AngularJS service} below.
 * 4. Creation of an AngularJS service that wraps and exposes an Angular injectable
 *    so that it can be injected into an AngularJS context. See `downgradeInjectable`.
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application. See the
 *    {\@link UpgradeModule#examples example} below.
 *
 * ### Mental Model
 *
 * When reasoning about how a hybrid application works it is useful to have a mental model which
 * describes what is happening and explains what is happening at the lowest level.
 *
 * 1. There are two independent frameworks running in a single application, each framework treats
 *    the other as a black box.
 * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
 *    instantiated the element is the owner. Each framework only updates/interacts with its own
 *    DOM elements and ignores others.
 * 3. AngularJS directives always execute inside the AngularJS framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular components always execute inside the Angular framework codebase regardless of
 *    where they are instantiated.
 * 5. An AngularJS component can be "upgraded"" to an Angular component. This is achieved by
 *    defining an Angular directive, which bootstraps the AngularJS component at its location
 *    in the DOM. See `UpgradeComponent`.
 * 6. An Angular component can be "downgraded"" to an AngularJS component. This is achieved by
 *    defining an AngularJS directive, which bootstraps the Angular component at its location
 *    in the DOM. See `downgradeComponent`.
 * 7. Whenever an "upgraded"/"downgraded" component is instantiated the host element is owned by
 *    the framework doing the instantiation. The other framework then instantiates and owns the
 *    view for that component.
 *    a. This implies that the component bindings will always follow the semantics of the
 *       instantiation framework.
 *    b. The DOM attributes are parsed by the framework that owns the current template. So
 *       attributes in AngularJS templates must use kebab-case, while AngularJS templates must
 *       use camelCase.
 *    c. However the template binding syntax will always use the Angular style, e.g. square
 *       brackets (`[...]`) for property binding.
 * 8. Angular is bootstrapped first; AngularJS is bootstrapped second. AngularJS always owns the
 *    root component of the application.
 * 9. The new application is running in an Angular zone, and therefore it no longer needs calls
 *    to `$apply()`.
 *
 * ### Core AngularJS services
 * Importing this `NgModule` will add providers for the core
 * [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * ### Bootstrap
 * The runtime instance of this class contains a {\@link UpgradeModule#bootstrap `bootstrap()`}
 * method, which you use to bootstrap the top level AngularJS module onto an element in the
 * DOM for the hybrid upgrade app.
 *
 * It also contains properties to access the {\@link UpgradeModule#injector root injector}, the
 * bootstrap `NgZone` and the
 * [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
 *
 * ### Examples
 *
 * Import the `UpgradeModule` into your top level {\@link NgModule Angular `NgModule`}.
 *
 * {\@example upgrade/static/ts/module.ts region='ng2-module'}
 *
 * Then bootstrap the hybrid upgrade app's module, get hold of the `UpgradeModule` instance
 * and use it to bootstrap the top level [AngularJS
 * module](https://docs.angularjs.org/api/ng/type/angular.Module).
 *
 * {\@example upgrade/static/ts/module.ts region='bootstrap'}
 *
 * {\@a upgrading-an-angular-1-service}
 *
 * ### Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {\@example upgrade/static/ts/module.ts region="ng1-title-case-service"}
 *
 * Then you should define an Angular provider to be included in your `NgModule` `providers`
 * property.
 *
 * {\@example upgrade/static/ts/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {\@example upgrade/static/ts/module.ts region="use-ng1-upgraded-service"}
 *
 * \@experimental
 */
export class UpgradeModule {
    /**
     * @param {?} injector
     * @param {?} ngZone
     */
    constructor(/** The root `Injector` for the upgrade application. */
    /** The root `Injector` for the upgrade application. */
    injector, ngZone) {
        this.ngZone = ngZone;
        this.injector = new NgAdapterInjector(injector);
    }
    /**
     * Bootstrap an AngularJS application from this NgModule
     * @param {?} element the element on which to bootstrap the AngularJS application
     * @param {?=} modules
     * @param {?=} config
     * @return {?}
     */
    bootstrap(element, modules = [], config /*angular.IAngularBootstrapConfig*/) {
        const /** @type {?} */ INIT_MODULE_NAME = UPGRADE_MODULE_NAME + '.init';
        // Create an ng1 module to bootstrap
        const /** @type {?} */ initModule = angular
            .module(INIT_MODULE_NAME, [])
            .value(INJECTOR_KEY, this.injector)
            .factory(LAZY_MODULE_REF, [
            INJECTOR_KEY,
            (injector) => (/** @type {?} */ ({ injector, needsNgZone: false }))
        ])
            .config([
            $PROVIDE, $INJECTOR,
            ($provide, $injector) => {
                if ($injector.has($$TESTABILITY)) {
                    $provide.decorator($$TESTABILITY, [
                        $DELEGATE,
                        (testabilityDelegate) => {
                            const /** @type {?} */ originalWhenStable = testabilityDelegate.whenStable;
                            const /** @type {?} */ injector = this.injector;
                            // Cannot use arrow function below because we need the context
                            const /** @type {?} */ newWhenStable = function (callback) {
                                originalWhenStable.call(testabilityDelegate, function () {
                                    const /** @type {?} */ ng2Testability = injector.get(Testability);
                                    if (ng2Testability.isStable()) {
                                        callback();
                                    }
                                    else {
                                        ng2Testability.whenStable(newWhenStable.bind(testabilityDelegate, callback));
                                    }
                                });
                            };
                            testabilityDelegate.whenStable = newWhenStable;
                            return testabilityDelegate;
                        }
                    ]);
                }
                if ($injector.has($INTERVAL)) {
                    $provide.decorator($INTERVAL, [
                        $DELEGATE,
                        (intervalDelegate) => {
                            // Wrap the $interval service so that setInterval is called outside NgZone,
                            // but the callback is still invoked within it. This is so that $interval
                            // won't block stability, which preserves the behavior from AngularJS.
                            let /** @type {?} */ wrappedInterval = (fn, delay, count, invokeApply, ...pass) => {
                                return this.ngZone.runOutsideAngular(() => {
                                    return intervalDelegate((...args) => {
                                        // Run callback in the next VM turn - $interval calls
                                        // $rootScope.$apply, and running the callback in NgZone will
                                        // cause a '$digest already in progress' error if it's in the
                                        // same vm turn.
                                        setTimeout(() => { this.ngZone.run(() => fn(...args)); });
                                    }, delay, count, invokeApply, ...pass);
                                });
                            };
                            (/** @type {?} */ (wrappedInterval))['cancel'] = intervalDelegate.cancel;
                            return wrappedInterval;
                        }
                    ]);
                }
            }
        ])
            .run([
            $INJECTOR,
            ($injector) => {
                this.$injector = $injector;
                // Initialize the ng1 $injector provider
                setTempInjectorRef($injector);
                this.injector.get($INJECTOR); /** @type {?} */
                ((
                // Put the injector on the DOM, so that it can be "required"
                angular.element(element).data))(controllerKey(INJECTOR_KEY), this.injector);
                // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
                // We need to do this in the next tick so that we don't prevent the bootup
                // stabilizing
                setTimeout(() => {
                    const /** @type {?} */ $rootScope = $injector.get('$rootScope');
                    const /** @type {?} */ subscription = this.ngZone.onMicrotaskEmpty.subscribe(() => $rootScope.$digest());
                    $rootScope.$on('$destroy', () => { subscription.unsubscribe(); });
                }, 0);
            }
        ]);
        const /** @type {?} */ upgradeModule = angular.module(UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        const /** @type {?} */ windowAngular = (/** @type {?} */ (window))['angular'];
        windowAngular.resumeBootstrap = undefined;
        // Bootstrap the AngularJS application inside our zone
        this.ngZone.run(() => { angular.bootstrap(element, [upgradeModule.name], config); });
        // Patch resumeBootstrap() to run inside the ngZone
        if (windowAngular.resumeBootstrap) {
            const /** @type {?} */ originalResumeBootstrap = windowAngular.resumeBootstrap;
            const /** @type {?} */ ngZone = this.ngZone;
            windowAngular.resumeBootstrap = function () {
                let /** @type {?} */ args = arguments;
                windowAngular.resumeBootstrap = originalResumeBootstrap;
                return ngZone.run(() => windowAngular.resumeBootstrap.apply(this, args));
            };
        }
    }
}
UpgradeModule.decorators = [
    { type: NgModule, args: [{ providers: [angular1Providers] },] }
];
/** @nocollapse */
UpgradeModule.ctorParameters = () => [
    { type: Injector, },
    { type: NgZone, },
];
function UpgradeModule_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    UpgradeModule.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    UpgradeModule.ctorParameters;
    /**
     * The AngularJS `$injector` for the upgrade application.
     * @type {?}
     */
    UpgradeModule.prototype.$injector;
    /**
     * The Angular Injector *
     * @type {?}
     */
    UpgradeModule.prototype.injector;
    /**
     * The bootstrap zone for the upgrade application
     * @type {?}
     */
    UpgradeModule.prototype.ngZone;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9zdGF0aWMvdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRFLE9BQU8sS0FBSyxPQUFPLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pKLE9BQU8sRUFBZ0IsYUFBYSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDM0UsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlIekMsTUFBTTs7Ozs7SUFRSjtJQUVJLEFBREEsdURBQXVEO0lBQ3ZELFFBQWtCLEVBRVg7UUFBQSxXQUFNLEdBQU4sTUFBTTtRQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNqRDs7Ozs7Ozs7SUFRRCxTQUFTLENBQ0wsT0FBZ0IsRUFBRSxVQUFvQixFQUFFLEVBQUUsTUFBWTtRQUN4RCx1QkFBTSxnQkFBZ0IsR0FBRyxtQkFBbUIsR0FBRyxPQUFPLENBQUM7O1FBR3ZELHVCQUFNLFVB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QixHQUFlLGFBQWEsQ0FBQyxlQUFlLENBQUM7WUFDMUUsdUJBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDM0IsYUFBYSxDQUFDLGVBQWUsR0FBRztnQkFDOUIscUJBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQztnQkFDckIsYUFBYSxDQUFDLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQztnQkFDeEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7YUFDMUUsQ0FBQztTQUNIO0tBQ0Y7OztZQTdJRixRQUFRLFNBQUMsRUFBQyxTQUFTLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDOzs7O1lBdkhsQyxRQUFRO1lBQVksTUFBTSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RvciwgTmdNb2R1bGUsIE5nWm9uZSwgVGVzdGFiaWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5pbXBvcnQgeyQkVEVTVEFCSUxJVFksICRERUxFR0FURSwgJElOSkVDVE9SLCAkSU5URVJWQUwsICRQUk9WSURFLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgVVBHUkFERV9NT0RVTEVfTkFNRX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge0xhenlNb2R1bGVSZWYsIGNvbnRyb2xsZXJLZXl9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuaW1wb3J0IHthbmd1bGFyMVByb3ZpZGVycywgc2V0VGVtcEluamVjdG9yUmVmfSBmcm9tICcuL2FuZ3VsYXIxX3Byb3ZpZGVycyc7XG5pbXBvcnQge05nQWRhcHRlckluamVjdG9yfSBmcm9tICcuL3V0aWwnO1xuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYE5nTW9kdWxlYCwgd2hpY2ggeW91IGltcG9ydCB0byBwcm92aWRlIEFuZ3VsYXJKUyBjb3JlIHNlcnZpY2VzLFxuICogYW5kIGhhcyBhbiBpbnN0YW5jZSBtZXRob2QgdXNlZCB0byBib290c3RyYXAgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQW9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoZSBgdXBncmFkZS9zdGF0aWNgIHBhY2thZ2UgY29udGFpbnMgaGVscGVycyB0aGF0IGFsbG93IEFuZ3VsYXJKUyBhbmQgQW5ndWxhciBjb21wb25lbnRzXG4gKiB0byBiZSB1c2VkIHRvZ2V0aGVyIGluc2lkZSBhIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLCB3aGljaCBzdXBwb3J0cyBBb1QgY29tcGlsYXRpb24uXG4gKlxuICogU3BlY2lmaWNhbGx5LCB0aGUgY2xhc3NlcyBhbmQgZnVuY3Rpb25zIGluIHRoZSBgdXBncmFkZS9zdGF0aWNgIG1vZHVsZSBhbGxvdyB0aGUgZm9sbG93aW5nOlxuICogMS4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhciBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFySlMgY29tcG9uZW50IHNvXG4gKiAgICB0aGF0IGl0IGNhbiBiZSB1c2VkIGluIGFuIEFuZ3VsYXIgdGVtcGxhdGUuIFNlZSBgVXBncmFkZUNvbXBvbmVudGAuXG4gKiAyLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFySlMgZGlyZWN0aXZlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhckpTIHRlbXBsYXRlLiBTZWUgYGRvd25ncmFkZUNvbXBvbmVudGAuXG4gKiAzLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIHJvb3QgaW5qZWN0b3IgcHJvdmlkZXIgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFySlNcbiAqICAgIHNlcnZpY2Ugc28gdGhhdCBpdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBhbiBBbmd1bGFyIGNvbnRleHQuIFNlZVxuICogICAge0BsaW5rIFVwZ3JhZGVNb2R1bGUjdXBncmFkaW5nLWFuLWFuZ3VsYXItMS1zZXJ2aWNlIFVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZX0gYmVsb3cuXG4gKiA0LiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFySlMgc2VydmljZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXIgaW5qZWN0YWJsZVxuICogICAgc28gdGhhdCBpdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBhbiBBbmd1bGFySlMgY29udGV4dC4gU2VlIGBkb3duZ3JhZGVJbmplY3RhYmxlYC5cbiAqIDMuIEJvb3RzdHJhcHBpbmcgb2YgYSBoeWJyaWQgQW5ndWxhciBhcHBsaWNhdGlvbiB3aGljaCBjb250YWlucyBib3RoIG9mIHRoZSBmcmFtZXdvcmtzXG4gKiAgICBjb2V4aXN0aW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLiBTZWUgdGhlXG4gKiAgICB7QGxpbmsgVXBncmFkZU1vZHVsZSNleGFtcGxlcyBleGFtcGxlfSBiZWxvdy5cbiAqXG4gKiAjIyMgTWVudGFsIE1vZGVsXG4gKlxuICogV2hlbiByZWFzb25pbmcgYWJvdXQgaG93IGEgaHlicmlkIGFwcGxpY2F0aW9uIHdvcmtzIGl0IGlzIHVzZWZ1bCB0byBoYXZlIGEgbWVudGFsIG1vZGVsIHdoaWNoXG4gKiBkZXNjcmliZXMgd2hhdCBpcyBoYXBwZW5pbmcgYW5kIGV4cGxhaW5zIHdoYXQgaXMgaGFwcGVuaW5nIGF0IHRoZSBsb3dlc3QgbGV2ZWwuXG4gKlxuICogMS4gVGhlcmUgYXJlIHR3byBpbmRlcGVuZGVudCBmcmFtZXdvcmtzIHJ1bm5pbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24sIGVhY2ggZnJhbWV3b3JrIHRyZWF0c1xuICogICAgdGhlIG90aGVyIGFzIGEgYmxhY2sgYm94LlxuICogMi4gRWFjaCBET00gZWxlbWVudCBvbiB0aGUgcGFnZSBpcyBvd25lZCBleGFjdGx5IGJ5IG9uZSBmcmFtZXdvcmsuIFdoaWNoZXZlciBmcmFtZXdvcmtcbiAqICAgIGluc3RhbnRpYXRlZCB0aGUgZWxlbWVudCBpcyB0aGUgb3duZXIuIEVhY2ggZnJhbWV3b3JrIG9ubHkgdXBkYXRlcy9pbnRlcmFjdHMgd2l0aCBpdHMgb3duXG4gKiAgICBET00gZWxlbWVudHMgYW5kIGlnbm9yZXMgb3RoZXJzLlxuICogMy4gQW5ndWxhckpTIGRpcmVjdGl2ZXMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIHRoZSBBbmd1bGFySlMgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDQuIEFuZ3VsYXIgY29tcG9uZW50cyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXIgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDUuIEFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FuIGJlIFwidXBncmFkZWRcIlwiIHRvIGFuIEFuZ3VsYXIgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFyIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgVXBncmFkZUNvbXBvbmVudGAuXG4gKiA2LiBBbiBBbmd1bGFyIGNvbXBvbmVudCBjYW4gYmUgXCJkb3duZ3JhZGVkXCJcIiB0byBhbiBBbmd1bGFySlMgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFySlMgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFyIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDcuIFdoZW5ldmVyIGFuIFwidXBncmFkZWRcIi9cImRvd25ncmFkZWRcIiBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnlcbiAqICAgIHRoZSBmcmFtZXdvcmsgZG9pbmcgdGhlIGluc3RhbnRpYXRpb24uIFRoZSBvdGhlciBmcmFtZXdvcmsgdGhlbiBpbnN0YW50aWF0ZXMgYW5kIG93bnMgdGhlXG4gKiAgICB2aWV3IGZvciB0aGF0IGNvbXBvbmVudC5cbiAqICAgIGEuIFRoaXMgaW1wbGllcyB0aGF0IHRoZSBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay5cbiAqICAgIGIuIFRoZSBET00gYXR0cmlidXRlcyBhcmUgcGFyc2VkIGJ5IHRoZSBmcmFtZXdvcmsgdGhhdCBvd25zIHRoZSBjdXJyZW50IHRlbXBsYXRlLiBTb1xuICogICAgICAgYXR0cmlidXRlcyBpbiBBbmd1bGFySlMgdGVtcGxhdGVzIG11c3QgdXNlIGtlYmFiLWNhc2UsIHdoaWxlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMgbXVzdFxuICogICAgICAgdXNlIGNhbWVsQ2FzZS5cbiAqICAgIGMuIEhvd2V2ZXIgdGhlIHRlbXBsYXRlIGJpbmRpbmcgc3ludGF4IHdpbGwgYWx3YXlzIHVzZSB0aGUgQW5ndWxhciBzdHlsZSwgZS5nLiBzcXVhcmVcbiAqICAgICAgIGJyYWNrZXRzIChgWy4uLl1gKSBmb3IgcHJvcGVydHkgYmluZGluZy5cbiAqIDguIEFuZ3VsYXIgaXMgYm9vdHN0cmFwcGVkIGZpcnN0OyBBbmd1bGFySlMgaXMgYm9vdHN0cmFwcGVkIHNlY29uZC4gQW5ndWxhckpTIGFsd2F5cyBvd25zIHRoZVxuICogICAgcm9vdCBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGFuIEFuZ3VsYXIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHNcbiAqICAgIHRvIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIENvcmUgQW5ndWxhckpTIHNlcnZpY2VzXG4gKiBJbXBvcnRpbmcgdGhpcyBgTmdNb2R1bGVgIHdpbGwgYWRkIHByb3ZpZGVycyBmb3IgdGhlIGNvcmVcbiAqIFtBbmd1bGFySlMgc2VydmljZXNdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9zZXJ2aWNlKSB0byB0aGUgcm9vdCBpbmplY3Rvci5cbiAqXG4gKiAjIyMgQm9vdHN0cmFwXG4gKiBUaGUgcnVudGltZSBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIGNvbnRhaW5zIGEge0BsaW5rIFVwZ3JhZGVNb2R1bGUjYm9vdHN0cmFwIGBib290c3RyYXAoKWB9XG4gKiBtZXRob2QsIHdoaWNoIHlvdSB1c2UgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWwgQW5ndWxhckpTIG1vZHVsZSBvbnRvIGFuIGVsZW1lbnQgaW4gdGhlXG4gKiBET00gZm9yIHRoZSBoeWJyaWQgdXBncmFkZSBhcHAuXG4gKlxuICogSXQgYWxzbyBjb250YWlucyBwcm9wZXJ0aWVzIHRvIGFjY2VzcyB0aGUge0BsaW5rIFVwZ3JhZGVNb2R1bGUjaW5qZWN0b3Igcm9vdCBpbmplY3Rvcn0sIHRoZVxuICogYm9vdHN0cmFwIGBOZ1pvbmVgIGFuZCB0aGVcbiAqIFtBbmd1bGFySlMgJGluamVjdG9yXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvYXV0by9zZXJ2aWNlLyRpbmplY3RvcikuXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogSW1wb3J0IHRoZSBgVXBncmFkZU1vZHVsZWAgaW50byB5b3VyIHRvcCBsZXZlbCB7QGxpbmsgTmdNb2R1bGUgQW5ndWxhciBgTmdNb2R1bGVgfS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nbmcyLW1vZHVsZSd9XG4gKlxuICogVGhlbiBib290c3RyYXAgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcCdzIG1vZHVsZSwgZ2V0IGhvbGQgb2YgdGhlIGBVcGdyYWRlTW9kdWxlYCBpbnN0YW5jZVxuICogYW5kIHVzZSBpdCB0byBib290c3RyYXAgdGhlIHRvcCBsZXZlbCBbQW5ndWxhckpTXG4gKiBtb2R1bGVdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy90eXBlL2FuZ3VsYXIuTW9kdWxlKS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwJ31cbiAqXG4gKiB7QGEgdXBncmFkaW5nLWFuLWFuZ3VsYXItMS1zZXJ2aWNlfVxuICpcbiAqICMjIyBVcGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2VcbiAqXG4gKiBUaGVyZSBpcyBubyBzcGVjaWZpYyBBUEkgZm9yIHVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZS4gSW5zdGVhZCB5b3Ugc2hvdWxkIGp1c3QgZm9sbG93IHRoZVxuICogZm9sbG93aW5nIHJlY2lwZTpcbiAqXG4gKiBMZXQncyBzYXkgeW91IGhhdmUgYW4gQW5ndWxhckpTIHNlcnZpY2U6XG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL21vZHVsZS50cyByZWdpb249XCJuZzEtdGl0bGUtY2FzZS1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3Ugc2hvdWxkIGRlZmluZSBhbiBBbmd1bGFyIHByb3ZpZGVyIHRvIGJlIGluY2x1ZGVkIGluIHlvdXIgYE5nTW9kdWxlYCBgcHJvdmlkZXJzYFxuICogcHJvcGVydHkuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL21vZHVsZS50cyByZWdpb249XCJ1cGdyYWRlLW5nMS1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3UgY2FuIHVzZSB0aGUgXCJ1cGdyYWRlZFwiIEFuZ3VsYXJKUyBzZXJ2aWNlIGJ5IGluamVjdGluZyBpdCBpbnRvIGFuIEFuZ3VsYXIgY29tcG9uZW50XG4gKiBvciBzZXJ2aWNlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9tb2R1bGUudHMgcmVnaW9uPVwidXNlLW5nMS11cGdyYWRlZC1zZXJ2aWNlXCJ9XG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5ATmdNb2R1bGUoe3Byb3ZpZGVyczogW2FuZ3VsYXIxUHJvdmlkZXJzXX0pXG5leHBvcnQgY2xhc3MgVXBncmFkZU1vZHVsZSB7XG4gIC8qKlxuICAgKiBUaGUgQW5ndWxhckpTIGAkaW5qZWN0b3JgIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHB1YmxpYyAkaW5qZWN0b3I6IGFueSAvKmFuZ3VsYXIuSUluamVjdG9yU2VydmljZSovO1xuICAvKiogVGhlIEFuZ3VsYXIgSW5qZWN0b3IgKiovXG4gIHB1YmxpYyBpbmplY3RvcjogSW5qZWN0b3I7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogVGhlIHJvb3QgYEluamVjdG9yYCBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24uICovXG4gICAgICBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAvKiogVGhlIGJvb3RzdHJhcCB6b25lIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbiAqL1xuICAgICAgcHVibGljIG5nWm9uZTogTmdab25lKSB7XG4gICAgdGhpcy5pbmplY3RvciA9IG5ldyBOZ0FkYXB0ZXJJbmplY3RvcihpbmplY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQm9vdHN0cmFwIGFuIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiBmcm9tIHRoaXMgTmdNb2R1bGVcbiAgICogQHBhcmFtIGVsZW1lbnQgdGhlIGVsZW1lbnQgb24gd2hpY2ggdG8gYm9vdHN0cmFwIHRoZSBBbmd1bGFySlMgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIFttb2R1bGVzXSB0aGUgQW5ndWxhckpTIG1vZHVsZXMgdG8gYm9vdHN0cmFwIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSBbY29uZmlnXSBvcHRpb25hbCBleHRyYSBBbmd1bGFySlMgYm9vdHN0cmFwIGNvbmZpZ3VyYXRpb25cbiAgICovXG4gIGJvb3RzdHJhcChcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQsIG1vZHVsZXM6IHN0cmluZ1tdID0gW10sIGNvbmZpZz86IGFueSAvKmFuZ3VsYXIuSUFuZ3VsYXJCb290c3RyYXBDb25maWcqLykge1xuICAgIGNvbnN0IElOSVRfTU9EVUxFX05BTUUgPSBVUEdSQURFX01PRFVMRV9OQU1FICsgJy5pbml0JztcblxuICAgIC8vIENyZWF0ZSBhbiBuZzEgbW9kdWxlIHRvIGJvb3RzdHJhcFxuICAgIGNvbnN0IGluaXRNb2R1bGUgPVxuICAgICAgICBhbmd1bGFyXG4gICAgICAgICAgICAubW9kdWxlKElOSVRfTU9EVUxFX05BTUUsIFtdKVxuXG4gICAgICAgICAgICAudmFsdWUoSU5KRUNUT1JfS0VZLCB0aGlzLmluamVjdG9yKVxuXG4gICAgICAgICAgICAuZmFjdG9yeShcbiAgICAgICAgICAgICAgICBMQVpZX01PRFVMRV9SRUYsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgSU5KRUNUT1JfS0VZLFxuICAgICAgICAgICAgICAgICAgKGluamVjdG9yOiBJbmplY3RvcikgPT4gKHsgaW5qZWN0b3IsIG5lZWRzTmdab25lOiBmYWxzZSB9IGFzIExhenlNb2R1bGVSZWYpXG4gICAgICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgLmNvbmZpZyhbXG4gICAgICAgICAgICAgICRQUk9WSURFLCAkSU5KRUNUT1IsXG4gICAgICAgICAgICAgICgkcHJvdmlkZTogYW5ndWxhci5JUHJvdmlkZVNlcnZpY2UsICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJCRURVNUQUJJTElUWSkpIHtcbiAgICAgICAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcigkJFRFU1RBQklMSVRZLCBbXG4gICAgICAgICAgICAgICAgICAgICRERUxFR0FURSxcbiAgICAgICAgICAgICAgICAgICAgKHRlc3RhYmlsaXR5RGVsZWdhdGU6IGFuZ3VsYXIuSVRlc3RhYmlsaXR5U2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsV2hlblN0YWJsZTogRnVuY3Rpb24gPSB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLmluamVjdG9yO1xuICAgICAgICAgICAgICAgICAgICAgIC8vIENhbm5vdCB1c2UgYXJyb3cgZnVuY3Rpb24gYmVsb3cgYmVjYXVzZSB3ZSBuZWVkIHRoZSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3V2hlblN0YWJsZSA9IGZ1bmN0aW9uKGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxXaGVuU3RhYmxlLmNhbGwodGVzdGFiaWxpdHlEZWxlZ2F0ZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5nMlRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSA9IGluamVjdG9yLmdldChUZXN0YWJpbGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZzJUZXN0YWJpbGl0eS5pc1N0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZzJUZXN0YWJpbGl0eS53aGVuU3RhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdXaGVuU3RhYmxlLmJpbmQodGVzdGFiaWxpdHlEZWxlZ2F0ZSwgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgIHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZSA9IG5ld1doZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlc3RhYmlsaXR5RGVsZWdhdGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCRJTlRFUlZBTCkpIHtcbiAgICAgICAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcigkSU5URVJWQUwsIFtcbiAgICAgICAgICAgICAgICAgICAgJERFTEVHQVRFLFxuICAgICAgICAgICAgICAgICAgICAoaW50ZXJ2YWxEZWxlZ2F0ZTogYW5ndWxhci5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gV3JhcCB0aGUgJGludGVydmFsIHNlcnZpY2Ugc28gdGhhdCBzZXRJbnRlcnZhbCBpcyBjYWxsZWQgb3V0c2lkZSBOZ1pvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoZSBjYWxsYmFjayBpcyBzdGlsbCBpbnZva2VkIHdpdGhpbiBpdC4gVGhpcyBpcyBzbyB0aGF0ICRpbnRlcnZhbFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHdvbid0IGJsb2NrIHN0YWJpbGl0eSwgd2hpY2ggcHJlc2VydmVzIHRoZSBiZWhhdmlvciBmcm9tIEFuZ3VsYXJKUy5cbiAgICAgICAgICAgICAgICAgICAgICBsZXQgd3JhcHBlZEludGVydmFsID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKGZuOiBGdW5jdGlvbiwgZGVsYXk6IG51bWJlciwgY291bnQ/OiBudW1iZXIsIGludm9rZUFwcGx5PzogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnBhc3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnZhbERlbGVnYXRlKCguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSdW4gY2FsbGJhY2sgaW4gdGhlIG5leHQgVk0gdHVybiAtICRpbnRlcnZhbCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRhcHBseSwgYW5kIHJ1bm5pbmcgdGhlIGNhbGxiYWNrIGluIE5nWm9uZSB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhdXNlIGEgJyRkaWdlc3QgYWxyZWFkeSBpbiBwcm9ncmVzcycgZXJyb3IgaWYgaXQncyBpbiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2FtZSB2bSB0dXJuLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy5uZ1pvbmUucnVuKCgpID0+IGZuKC4uLmFyZ3MpKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSwgY291bnQsIGludm9rZUFwcGx5LCAuLi5wYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICh3cmFwcGVkSW50ZXJ2YWwgYXMgYW55KVsnY2FuY2VsJ10gPSBpbnRlcnZhbERlbGVnYXRlLmNhbmNlbDtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlZEludGVydmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICAgIC5ydW4oW1xuICAgICAgICAgICAgICAkSU5KRUNUT1IsXG4gICAgICAgICAgICAgICgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJGluamVjdG9yID0gJGluamVjdG9yO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgbmcxICRpbmplY3RvciBwcm92aWRlclxuICAgICAgICAgICAgICAgIHNldFRlbXBJbmplY3RvclJlZigkaW5qZWN0b3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5qZWN0b3IuZ2V0KCRJTkpFQ1RPUik7XG5cbiAgICAgICAgICAgICAgICAvLyBQdXQgdGhlIGluamVjdG9yIG9uIHRoZSBET00sIHNvIHRoYXQgaXQgY2FuIGJlIFwicmVxdWlyZWRcIlxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5kYXRhICEoY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpLCB0aGlzLmluamVjdG9yKTtcblxuICAgICAgICAgICAgICAgIC8vIFdpcmUgdXAgdGhlIG5nMSByb290U2NvcGUgdG8gcnVuIGEgZGlnZXN0IGN5Y2xlIHdoZW5ldmVyIHRoZSB6b25lIHNldHRsZXNcbiAgICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRvIGRvIHRoaXMgaW4gdGhlIG5leHQgdGljayBzbyB0aGF0IHdlIGRvbid0IHByZXZlbnQgdGhlIGJvb3R1cFxuICAgICAgICAgICAgICAgIC8vIHN0YWJpbGl6aW5nXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCAkcm9vdFNjb3BlID0gJGluamVjdG9yLmdldCgnJHJvb3RTY29wZScpO1xuICAgICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LnN1YnNjcmliZSgoKSA9PiAkcm9vdFNjb3BlLiRkaWdlc3QoKSk7XG4gICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpOyB9KTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSk7XG5cbiAgICBjb25zdCB1cGdyYWRlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoVVBHUkFERV9NT0RVTEVfTkFNRSwgW0lOSVRfTU9EVUxFX05BTUVdLmNvbmNhdChtb2R1bGVzKSk7XG5cbiAgICAvLyBNYWtlIHN1cmUgcmVzdW1lQm9vdHN0cmFwKCkgb25seSBleGlzdHMgaWYgdGhlIGN1cnJlbnQgYm9vdHN0cmFwIGlzIGRlZmVycmVkXG4gICAgY29uc3Qgd2luZG93QW5ndWxhciA9ICh3aW5kb3cgYXMgYW55KVsnYW5ndWxhciddO1xuICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gQm9vdHN0cmFwIHRoZSBBbmd1bGFySlMgYXBwbGljYXRpb24gaW5zaWRlIG91ciB6b25lXG4gICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHsgYW5ndWxhci5ib290c3RyYXAoZWxlbWVudCwgW3VwZ3JhZGVNb2R1bGUubmFtZV0sIGNvbmZpZyk7IH0pO1xuXG4gICAgLy8gUGF0Y2ggcmVzdW1lQm9vdHN0cmFwKCkgdG8gcnVuIGluc2lkZSB0aGUgbmdab25lXG4gICAgaWYgKHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwO1xuICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5uZ1pvbmU7XG4gICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDtcbiAgICAgICAgcmV0dXJuIG5nWm9uZS5ydW4oKCkgPT4gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAuYXBwbHkodGhpcywgYXJncykpO1xuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==