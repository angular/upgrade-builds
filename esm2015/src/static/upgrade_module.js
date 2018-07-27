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
 * *Part of the [upgrade/static](api?query=upgrade/static)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * The `upgrade/static` package contains helpers that allow AngularJS and Angular components
 * to be used together inside a hybrid upgrade application, which supports AoT compilation.
 *
 * Specifically, the classes and functions in the `upgrade/static` module allow the following:
 *
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
 *    coexisting in a single application.
 *
 * \@usageNotes
 *
 * ```ts
 * import {UpgradeModule} from '\@angular/upgrade/static';
 * ```
 *
 * See also the {\@link UpgradeModule#examples examples} below.
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
 * 6. An Angular component can be "downgraded" to an AngularJS component. This is achieved by
 *    defining an AngularJS directive, which bootstraps the Angular component at its location
 *    in the DOM. See `downgradeComponent`.
 * 7. Whenever an "upgraded"/"downgraded" component is instantiated the host element is owned by
 *    the framework doing the instantiation. The other framework then instantiates and owns the
 *    view for that component.
 *    1. This implies that the component bindings will always follow the semantics of the
 *       instantiation framework.
 *    2. The DOM attributes are parsed by the framework that owns the current template. So
 *       attributes in AngularJS templates must use kebab-case, while AngularJS templates must use
 *       camelCase.
 *    3. However the template binding syntax will always use the Angular style, e.g. square
 *       brackets (`[...]`) for property binding.
 * 8. Angular is bootstrapped first; AngularJS is bootstrapped second. AngularJS always owns the
 *    root component of the application.
 * 9. The new application is running in an Angular zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### The `UpgradeModule` class
 *
 * This class is an `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * #### Core AngularJS services
 * Importing this `NgModule` will add providers for the core
 * [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * #### Bootstrap
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
 * {\@example upgrade/static/ts/full/module.ts region='ng2-module'}
 *
 * Then inject `UpgradeModule` into your Angular `NgModule` and use it to bootstrap the top level
 * [AngularJS module](https://docs.angularjs.org/api/ng/type/angular.Module) in the
 * `ngDoBootstrap()` method.
 *
 * {\@example upgrade/static/ts/full/module.ts region='bootstrap-ng1'}
 *
 * Finally, kick off the whole process, by bootstraping your top level Angular `NgModule`.
 *
 * {\@example upgrade/static/ts/full/module.ts region='bootstrap-ng2'}
 *
 * {\@a upgrading-an-angular-1-service}
 * ### Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng1-text-formatter-service"}
 *
 * Then you should define an Angular provider to be included in your `NgModule` `providers`
 * property.
 *
 * {\@example upgrade/static/ts/full/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {\@example upgrade/static/ts/full/module.ts region="use-ng1-upgraded-service"}
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
        /** @type {?} */
        const INIT_MODULE_NAME = UPGRADE_MODULE_NAME + '.init';
        /** @type {?} */
        const initModule = angular
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
                            /** @type {?} */
                            const originalWhenStable = testabilityDelegate.whenStable;
                            /** @type {?} */
                            const injector = this.injector;
                            /** @type {?} */
                            const newWhenStable = function (callback) {
                                originalWhenStable.call(testabilityDelegate, function () {
                                    /** @type {?} */
                                    const ng2Testability = injector.get(Testability);
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
                            /** @type {?} */
                            let wrappedInterval = (fn, delay, count, invokeApply, ...pass) => {
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
                    /** @type {?} */
                    const $rootScope = $injector.get('$rootScope');
                    /** @type {?} */
                    const subscription = this.ngZone.onMicrotaskEmpty.subscribe(() => $rootScope.$digest());
                    $rootScope.$on('$destroy', () => { subscription.unsubscribe(); });
                }, 0);
            }
        ]);
        /** @type {?} */
        const upgradeModule = angular.module(UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));
        /** @type {?} */
        const windowAngular = (/** @type {?} */ (window))['angular'];
        windowAngular.resumeBootstrap = undefined;
        // Bootstrap the AngularJS application inside our zone
        this.ngZone.run(() => { angular.bootstrap(element, [upgradeModule.name], config); });
        // Patch resumeBootstrap() to run inside the ngZone
        if (windowAngular.resumeBootstrap) {
            /** @type {?} */
            const originalResumeBootstrap = windowAngular.resumeBootstrap;
            /** @type {?} */
            const ngZone = this.ngZone;
            windowAngular.resumeBootstrap = function () {
                /** @type {?} */
                let args = arguments;
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
    { type: Injector },
    { type: NgZone }
];
if (false) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9zdGF0aWMvdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRFLE9BQU8sS0FBSyxPQUFPLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pKLE9BQU8sRUFBZ0IsYUFBYSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDM0UsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpSXpDLE1BQU07Ozs7O0lBUUo7SUFFSSxBQURBLHVEQUF1RDtJQUN2RCxRQUFrQixFQUVYO1FBQUEsV0FBTSxHQUFOLE1BQU07UUFDZixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDakQ7Ozs7Ozs7O0lBUUQsU0FBUyxDQUNMLE9BQWdCLEVBQUUsVUFBb0IsRUFBRSxFQUFFLE1BQVk7O1FBQ3hELE1BQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLEdBQUcsT0FBTyxDQUFD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QUksSUFBSSxHQUFHLFNBQVMsQ0FBQztnQkFDckIsYUFBYSxDQUFDLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQztnQkFDeEQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzFFLENBQUM7U0FDSDtLQUNGOzs7WUE3SUYsUUFBUSxTQUFDLEVBQUMsU0FBUyxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBQzs7OztZQXZJbEMsUUFBUTtZQUFZLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIE5nTW9kdWxlLCBOZ1pvbmUsIFRlc3RhYmlsaXR5fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi9jb21tb24vYW5ndWxhcjEnO1xuaW1wb3J0IHskJFRFU1RBQklMSVRZLCAkREVMRUdBVEUsICRJTkpFQ1RPUiwgJElOVEVSVkFMLCAkUFJPVklERSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFVQR1JBREVfTU9EVUxFX05BTUV9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHtMYXp5TW9kdWxlUmVmLCBjb250cm9sbGVyS2V5fSBmcm9tICcuLi9jb21tb24vdXRpbCc7XG5cbmltcG9ydCB7YW5ndWxhcjFQcm92aWRlcnMsIHNldFRlbXBJbmplY3RvclJlZn0gZnJvbSAnLi9hbmd1bGFyMV9wcm92aWRlcnMnO1xuaW1wb3J0IHtOZ0FkYXB0ZXJJbmplY3Rvcn0gZnJvbSAnLi91dGlsJztcblxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFuIGBOZ01vZHVsZWAsIHdoaWNoIHlvdSBpbXBvcnQgdG8gcHJvdmlkZSBBbmd1bGFySlMgY29yZSBzZXJ2aWNlcyxcbiAqIGFuZCBoYXMgYW4gaW5zdGFuY2UgbWV0aG9kIHVzZWQgdG8gYm9vdHN0cmFwIHRoZSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZS9zdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhlIGB1cGdyYWRlL3N0YXRpY2AgcGFja2FnZSBjb250YWlucyBoZWxwZXJzIHRoYXQgYWxsb3cgQW5ndWxhckpTIGFuZCBBbmd1bGFyIGNvbXBvbmVudHNcbiAqIHRvIGJlIHVzZWQgdG9nZXRoZXIgaW5zaWRlIGEgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24sIHdoaWNoIHN1cHBvcnRzIEFvVCBjb21waWxhdGlvbi5cbiAqXG4gKiBTcGVjaWZpY2FsbHksIHRoZSBjbGFzc2VzIGFuZCBmdW5jdGlvbnMgaW4gdGhlIGB1cGdyYWRlL3N0YXRpY2AgbW9kdWxlIGFsbG93IHRoZSBmb2xsb3dpbmc6XG4gKlxuICogMS4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhciBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFySlMgY29tcG9uZW50IHNvXG4gKiAgICB0aGF0IGl0IGNhbiBiZSB1c2VkIGluIGFuIEFuZ3VsYXIgdGVtcGxhdGUuIFNlZSBgVXBncmFkZUNvbXBvbmVudGAuXG4gKiAyLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFySlMgZGlyZWN0aXZlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhckpTIHRlbXBsYXRlLiBTZWUgYGRvd25ncmFkZUNvbXBvbmVudGAuXG4gKiAzLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIHJvb3QgaW5qZWN0b3IgcHJvdmlkZXIgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFySlNcbiAqICAgIHNlcnZpY2Ugc28gdGhhdCBpdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBhbiBBbmd1bGFyIGNvbnRleHQuIFNlZVxuICogICAge0BsaW5rIFVwZ3JhZGVNb2R1bGUjdXBncmFkaW5nLWFuLWFuZ3VsYXItMS1zZXJ2aWNlIFVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZX0gYmVsb3cuXG4gKiA0LiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFySlMgc2VydmljZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXIgaW5qZWN0YWJsZVxuICogICAgc28gdGhhdCBpdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBhbiBBbmd1bGFySlMgY29udGV4dC4gU2VlIGBkb3duZ3JhZGVJbmplY3RhYmxlYC5cbiAqIDMuIEJvb3RzdHJhcHBpbmcgb2YgYSBoeWJyaWQgQW5ndWxhciBhcHBsaWNhdGlvbiB3aGljaCBjb250YWlucyBib3RoIG9mIHRoZSBmcmFtZXdvcmtzXG4gKiAgICBjb2V4aXN0aW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7VXBncmFkZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuICogYGBgXG4gKlxuICogU2VlIGFsc28gdGhlIHtAbGluayBVcGdyYWRlTW9kdWxlI2V4YW1wbGVzIGV4YW1wbGVzfSBiZWxvdy5cbiAqXG4gKiAjIyMgTWVudGFsIE1vZGVsXG4gKlxuICogV2hlbiByZWFzb25pbmcgYWJvdXQgaG93IGEgaHlicmlkIGFwcGxpY2F0aW9uIHdvcmtzIGl0IGlzIHVzZWZ1bCB0byBoYXZlIGEgbWVudGFsIG1vZGVsIHdoaWNoXG4gKiBkZXNjcmliZXMgd2hhdCBpcyBoYXBwZW5pbmcgYW5kIGV4cGxhaW5zIHdoYXQgaXMgaGFwcGVuaW5nIGF0IHRoZSBsb3dlc3QgbGV2ZWwuXG4gKlxuICogMS4gVGhlcmUgYXJlIHR3byBpbmRlcGVuZGVudCBmcmFtZXdvcmtzIHJ1bm5pbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24sIGVhY2ggZnJhbWV3b3JrIHRyZWF0c1xuICogICAgdGhlIG90aGVyIGFzIGEgYmxhY2sgYm94LlxuICogMi4gRWFjaCBET00gZWxlbWVudCBvbiB0aGUgcGFnZSBpcyBvd25lZCBleGFjdGx5IGJ5IG9uZSBmcmFtZXdvcmsuIFdoaWNoZXZlciBmcmFtZXdvcmtcbiAqICAgIGluc3RhbnRpYXRlZCB0aGUgZWxlbWVudCBpcyB0aGUgb3duZXIuIEVhY2ggZnJhbWV3b3JrIG9ubHkgdXBkYXRlcy9pbnRlcmFjdHMgd2l0aCBpdHMgb3duXG4gKiAgICBET00gZWxlbWVudHMgYW5kIGlnbm9yZXMgb3RoZXJzLlxuICogMy4gQW5ndWxhckpTIGRpcmVjdGl2ZXMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIHRoZSBBbmd1bGFySlMgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDQuIEFuZ3VsYXIgY29tcG9uZW50cyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXIgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDUuIEFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FuIGJlIFwidXBncmFkZWRcIlwiIHRvIGFuIEFuZ3VsYXIgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFyIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgVXBncmFkZUNvbXBvbmVudGAuXG4gKiA2LiBBbiBBbmd1bGFyIGNvbXBvbmVudCBjYW4gYmUgXCJkb3duZ3JhZGVkXCIgdG8gYW4gQW5ndWxhckpTIGNvbXBvbmVudC4gVGhpcyBpcyBhY2hpZXZlZCBieVxuICogICAgZGVmaW5pbmcgYW4gQW5ndWxhckpTIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhciBjb21wb25lbnQgYXQgaXRzIGxvY2F0aW9uXG4gKiAgICBpbiB0aGUgRE9NLiBTZWUgYGRvd25ncmFkZUNvbXBvbmVudGAuXG4gKiA3LiBXaGVuZXZlciBhbiBcInVwZ3JhZGVkXCIvXCJkb3duZ3JhZGVkXCIgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5XG4gKiAgICB0aGUgZnJhbWV3b3JrIGRvaW5nIHRoZSBpbnN0YW50aWF0aW9uLiBUaGUgb3RoZXIgZnJhbWV3b3JrIHRoZW4gaW5zdGFudGlhdGVzIGFuZCBvd25zIHRoZVxuICogICAgdmlldyBmb3IgdGhhdCBjb21wb25lbnQuXG4gKiAgICAxLiBUaGlzIGltcGxpZXMgdGhhdCB0aGUgY29tcG9uZW50IGJpbmRpbmdzIHdpbGwgYWx3YXlzIGZvbGxvdyB0aGUgc2VtYW50aWNzIG9mIHRoZVxuICogICAgICAgaW5zdGFudGlhdGlvbiBmcmFtZXdvcmsuXG4gKiAgICAyLiBUaGUgRE9NIGF0dHJpYnV0ZXMgYXJlIHBhcnNlZCBieSB0aGUgZnJhbWV3b3JrIHRoYXQgb3ducyB0aGUgY3VycmVudCB0ZW1wbGF0ZS4gU29cbiAqICAgICAgIGF0dHJpYnV0ZXMgaW4gQW5ndWxhckpTIHRlbXBsYXRlcyBtdXN0IHVzZSBrZWJhYi1jYXNlLCB3aGlsZSBBbmd1bGFySlMgdGVtcGxhdGVzIG11c3QgdXNlXG4gKiAgICAgICBjYW1lbENhc2UuXG4gKiAgICAzLiBIb3dldmVyIHRoZSB0ZW1wbGF0ZSBiaW5kaW5nIHN5bnRheCB3aWxsIGFsd2F5cyB1c2UgdGhlIEFuZ3VsYXIgc3R5bGUsIGUuZy4gc3F1YXJlXG4gKiAgICAgICBicmFja2V0cyAoYFsuLi5dYCkgZm9yIHByb3BlcnR5IGJpbmRpbmcuXG4gKiA4LiBBbmd1bGFyIGlzIGJvb3RzdHJhcHBlZCBmaXJzdDsgQW5ndWxhckpTIGlzIGJvb3RzdHJhcHBlZCBzZWNvbmQuIEFuZ3VsYXJKUyBhbHdheXMgb3ducyB0aGVcbiAqICAgIHJvb3QgY29tcG9uZW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqIDkuIFRoZSBuZXcgYXBwbGljYXRpb24gaXMgcnVubmluZyBpbiBhbiBBbmd1bGFyIHpvbmUsIGFuZCB0aGVyZWZvcmUgaXQgbm8gbG9uZ2VyIG5lZWRzIGNhbGxzIHRvXG4gKiAgICBgJGFwcGx5KClgLlxuICpcbiAqICMjIyBUaGUgYFVwZ3JhZGVNb2R1bGVgIGNsYXNzXG4gKlxuICogVGhpcyBjbGFzcyBpcyBhbiBgTmdNb2R1bGVgLCB3aGljaCB5b3UgaW1wb3J0IHRvIHByb3ZpZGUgQW5ndWxhckpTIGNvcmUgc2VydmljZXMsXG4gKiBhbmQgaGFzIGFuIGluc3RhbmNlIG1ldGhvZCB1c2VkIHRvIGJvb3RzdHJhcCB0aGUgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gKlxuICogIyMjIyBDb3JlIEFuZ3VsYXJKUyBzZXJ2aWNlc1xuICogSW1wb3J0aW5nIHRoaXMgYE5nTW9kdWxlYCB3aWxsIGFkZCBwcm92aWRlcnMgZm9yIHRoZSBjb3JlXG4gKiBbQW5ndWxhckpTIHNlcnZpY2VzXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZSkgdG8gdGhlIHJvb3QgaW5qZWN0b3IuXG4gKlxuICogIyMjIyBCb290c3RyYXBcbiAqIFRoZSBydW50aW1lIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgY29udGFpbnMgYSB7QGxpbmsgVXBncmFkZU1vZHVsZSNib290c3RyYXAgYGJvb3RzdHJhcCgpYH1cbiAqIG1ldGhvZCwgd2hpY2ggeW91IHVzZSB0byBib290c3RyYXAgdGhlIHRvcCBsZXZlbCBBbmd1bGFySlMgbW9kdWxlIG9udG8gYW4gZWxlbWVudCBpbiB0aGVcbiAqIERPTSBmb3IgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcC5cbiAqXG4gKiBJdCBhbHNvIGNvbnRhaW5zIHByb3BlcnRpZXMgdG8gYWNjZXNzIHRoZSB7QGxpbmsgVXBncmFkZU1vZHVsZSNpbmplY3RvciByb290IGluamVjdG9yfSwgdGhlXG4gKiBib290c3RyYXAgYE5nWm9uZWAgYW5kIHRoZVxuICogW0FuZ3VsYXJKUyAkaW5qZWN0b3JdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9hdXRvL3NlcnZpY2UvJGluamVjdG9yKS5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBJbXBvcnQgdGhlIGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgdG9wIGxldmVsIHtAbGluayBOZ01vZHVsZSBBbmd1bGFyIGBOZ01vZHVsZWB9LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J25nMi1tb2R1bGUnfVxuICpcbiAqIFRoZW4gaW5qZWN0IGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgQW5ndWxhciBgTmdNb2R1bGVgIGFuZCB1c2UgaXQgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWxcbiAqIFtBbmd1bGFySlMgbW9kdWxlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS9hbmd1bGFyLk1vZHVsZSkgaW4gdGhlXG4gKiBgbmdEb0Jvb3RzdHJhcCgpYCBtZXRob2QuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMSd9XG4gKlxuICogRmluYWxseSwga2ljayBvZmYgdGhlIHdob2xlIHByb2Nlc3MsIGJ5IGJvb3RzdHJhcGluZyB5b3VyIHRvcCBsZXZlbCBBbmd1bGFyIGBOZ01vZHVsZWAuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMid9XG4gKlxuICoge0BhIHVwZ3JhZGluZy1hbi1hbmd1bGFyLTEtc2VydmljZX1cbiAqICMjIyBVcGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2VcbiAqXG4gKiBUaGVyZSBpcyBubyBzcGVjaWZpYyBBUEkgZm9yIHVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZS4gSW5zdGVhZCB5b3Ugc2hvdWxkIGp1c3QgZm9sbG93IHRoZVxuICogZm9sbG93aW5nIHJlY2lwZTpcbiAqXG4gKiBMZXQncyBzYXkgeW91IGhhdmUgYW4gQW5ndWxhckpTIHNlcnZpY2U6XG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS10ZXh0LWZvcm1hdHRlci1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3Ugc2hvdWxkIGRlZmluZSBhbiBBbmd1bGFyIHByb3ZpZGVyIHRvIGJlIGluY2x1ZGVkIGluIHlvdXIgYE5nTW9kdWxlYCBgcHJvdmlkZXJzYFxuICogcHJvcGVydHkuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cInVwZ3JhZGUtbmcxLXNlcnZpY2VcIn1cbiAqXG4gKiBUaGVuIHlvdSBjYW4gdXNlIHRoZSBcInVwZ3JhZGVkXCIgQW5ndWxhckpTIHNlcnZpY2UgYnkgaW5qZWN0aW5nIGl0IGludG8gYW4gQW5ndWxhciBjb21wb25lbnRcbiAqIG9yIHNlcnZpY2UuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cInVzZS1uZzEtdXBncmFkZWQtc2VydmljZVwifVxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQE5nTW9kdWxlKHtwcm92aWRlcnM6IFthbmd1bGFyMVByb3ZpZGVyc119KVxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVNb2R1bGUge1xuICAvKipcbiAgICogVGhlIEFuZ3VsYXJKUyBgJGluamVjdG9yYCBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgJGluamVjdG9yOiBhbnkgLyphbmd1bGFyLklJbmplY3RvclNlcnZpY2UqLztcbiAgLyoqIFRoZSBBbmd1bGFyIEluamVjdG9yICoqL1xuICBwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIFRoZSByb290IGBJbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLiAqL1xuICAgICAgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgLyoqIFRoZSBib290c3RyYXAgem9uZSBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24gKi9cbiAgICAgIHB1YmxpYyBuZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuaW5qZWN0b3IgPSBuZXcgTmdBZGFwdGVySW5qZWN0b3IoaW5qZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJvb3RzdHJhcCBhbiBBbmd1bGFySlMgYXBwbGljYXRpb24gZnJvbSB0aGlzIE5nTW9kdWxlXG4gICAqIEBwYXJhbSBlbGVtZW50IHRoZSBlbGVtZW50IG9uIHdoaWNoIHRvIGJvb3RzdHJhcCB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSBbbW9kdWxlc10gdGhlIEFuZ3VsYXJKUyBtb2R1bGVzIHRvIGJvb3RzdHJhcCBmb3IgdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gW2NvbmZpZ10gb3B0aW9uYWwgZXh0cmEgQW5ndWxhckpTIGJvb3RzdHJhcCBjb25maWd1cmF0aW9uXG4gICAqL1xuICBib290c3RyYXAoXG4gICAgICBlbGVtZW50OiBFbGVtZW50LCBtb2R1bGVzOiBzdHJpbmdbXSA9IFtdLCBjb25maWc/OiBhbnkgLyphbmd1bGFyLklBbmd1bGFyQm9vdHN0cmFwQ29uZmlnKi8pIHtcbiAgICBjb25zdCBJTklUX01PRFVMRV9OQU1FID0gVVBHUkFERV9NT0RVTEVfTkFNRSArICcuaW5pdCc7XG5cbiAgICAvLyBDcmVhdGUgYW4gbmcxIG1vZHVsZSB0byBib290c3RyYXBcbiAgICBjb25zdCBpbml0TW9kdWxlID1cbiAgICAgICAgYW5ndWxhclxuICAgICAgICAgICAgLm1vZHVsZShJTklUX01PRFVMRV9OQU1FLCBbXSlcblxuICAgICAgICAgICAgLnZhbHVlKElOSkVDVE9SX0tFWSwgdGhpcy5pbmplY3RvcilcblxuICAgICAgICAgICAgLmZhY3RvcnkoXG4gICAgICAgICAgICAgICAgTEFaWV9NT0RVTEVfUkVGLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIElOSkVDVE9SX0tFWSxcbiAgICAgICAgICAgICAgICAgIChpbmplY3RvcjogSW5qZWN0b3IpID0+ICh7IGluamVjdG9yLCBuZWVkc05nWm9uZTogZmFsc2UgfSBhcyBMYXp5TW9kdWxlUmVmKVxuICAgICAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICAgIC5jb25maWcoW1xuICAgICAgICAgICAgICAkUFJPVklERSwgJElOSkVDVE9SLFxuICAgICAgICAgICAgICAoJHByb3ZpZGU6IGFuZ3VsYXIuSVByb3ZpZGVTZXJ2aWNlLCAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCQkVEVTVEFCSUxJVFkpKSB7XG4gICAgICAgICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJCRURVNUQUJJTElUWSwgW1xuICAgICAgICAgICAgICAgICAgICAkREVMRUdBVEUsXG4gICAgICAgICAgICAgICAgICAgICh0ZXN0YWJpbGl0eURlbGVnYXRlOiBhbmd1bGFyLklUZXN0YWJpbGl0eVNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbFdoZW5TdGFibGU6IEZ1bmN0aW9uID0gdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluamVjdG9yID0gdGhpcy5pbmplY3RvcjtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBDYW5ub3QgdXNlIGFycm93IGZ1bmN0aW9uIGJlbG93IGJlY2F1c2Ugd2UgbmVlZCB0aGUgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1doZW5TdGFibGUgPSBmdW5jdGlvbihjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsV2hlblN0YWJsZS5jYWxsKHRlc3RhYmlsaXR5RGVsZWdhdGUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZzJUZXN0YWJpbGl0eTogVGVzdGFiaWxpdHkgPSBpbmplY3Rvci5nZXQoVGVzdGFiaWxpdHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmcyVGVzdGFiaWxpdHkuaXNTdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmcyVGVzdGFiaWxpdHkud2hlblN0YWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3V2hlblN0YWJsZS5iaW5kKHRlc3RhYmlsaXR5RGVsZWdhdGUsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGUgPSBuZXdXaGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoJGluamVjdG9yLmhhcygkSU5URVJWQUwpKSB7XG4gICAgICAgICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJElOVEVSVkFMLCBbXG4gICAgICAgICAgICAgICAgICAgICRERUxFR0FURSxcbiAgICAgICAgICAgICAgICAgICAgKGludGVydmFsRGVsZWdhdGU6IGFuZ3VsYXIuSUludGVydmFsU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFdyYXAgdGhlICRpbnRlcnZhbCBzZXJ2aWNlIHNvIHRoYXQgc2V0SW50ZXJ2YWwgaXMgY2FsbGVkIG91dHNpZGUgTmdab25lLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGUgY2FsbGJhY2sgaXMgc3RpbGwgaW52b2tlZCB3aXRoaW4gaXQuIFRoaXMgaXMgc28gdGhhdCAkaW50ZXJ2YWxcbiAgICAgICAgICAgICAgICAgICAgICAvLyB3b24ndCBibG9jayBzdGFiaWxpdHksIHdoaWNoIHByZXNlcnZlcyB0aGUgYmVoYXZpb3IgZnJvbSBBbmd1bGFySlMuXG4gICAgICAgICAgICAgICAgICAgICAgbGV0IHdyYXBwZWRJbnRlcnZhbCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIChmbjogRnVuY3Rpb24sIGRlbGF5OiBudW1iZXIsIGNvdW50PzogbnVtYmVyLCBpbnZva2VBcHBseT86IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5wYXNzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW50ZXJ2YWxEZWxlZ2F0ZSgoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUnVuIGNhbGxiYWNrIGluIHRoZSBuZXh0IFZNIHR1cm4gLSAkaW50ZXJ2YWwgY2FsbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kYXBwbHksIGFuZCBydW5uaW5nIHRoZSBjYWxsYmFjayBpbiBOZ1pvbmUgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXVzZSBhICckZGlnZXN0IGFscmVhZHkgaW4gcHJvZ3Jlc3MnIGVycm9yIGlmIGl0J3MgaW4gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNhbWUgdm0gdHVybi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMubmdab25lLnJ1bigoKSA9PiBmbiguLi5hcmdzKSk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXksIGNvdW50LCBpbnZva2VBcHBseSwgLi4ucGFzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAod3JhcHBlZEludGVydmFsIGFzIGFueSlbJ2NhbmNlbCddID0gaW50ZXJ2YWxEZWxlZ2F0ZS5jYW5jZWw7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWRJbnRlcnZhbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKVxuXG4gICAgICAgICAgICAucnVuKFtcbiAgICAgICAgICAgICAgJElOSkVDVE9SLFxuICAgICAgICAgICAgICAoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRpbmplY3RvciA9ICRpbmplY3RvcjtcblxuICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIG5nMSAkaW5qZWN0b3IgcHJvdmlkZXJcbiAgICAgICAgICAgICAgICBzZXRUZW1wSW5qZWN0b3JSZWYoJGluamVjdG9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluamVjdG9yLmdldCgkSU5KRUNUT1IpO1xuXG4gICAgICAgICAgICAgICAgLy8gUHV0IHRoZSBpbmplY3RvciBvbiB0aGUgRE9NLCBzbyB0aGF0IGl0IGNhbiBiZSBcInJlcXVpcmVkXCJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkuZGF0YSAhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgdGhpcy5pbmplY3Rvcik7XG5cbiAgICAgICAgICAgICAgICAvLyBXaXJlIHVwIHRoZSBuZzEgcm9vdFNjb3BlIHRvIHJ1biBhIGRpZ2VzdCBjeWNsZSB3aGVuZXZlciB0aGUgem9uZSBzZXR0bGVzXG4gICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBkbyB0aGlzIGluIHRoZSBuZXh0IHRpY2sgc28gdGhhdCB3ZSBkb24ndCBwcmV2ZW50IHRoZSBib290dXBcbiAgICAgICAgICAgICAgICAvLyBzdGFiaWxpemluZ1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgJHJvb3RTY29wZSA9ICRpbmplY3Rvci5nZXQoJyRyb290U2NvcGUnKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUub25NaWNyb3Rhc2tFbXB0eS5zdWJzY3JpYmUoKCkgPT4gJHJvb3RTY29wZS4kZGlnZXN0KCkpO1xuICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4geyBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTsgfSk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pO1xuXG4gICAgY29uc3QgdXBncmFkZU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFVQR1JBREVfTU9EVUxFX05BTUUsIFtJTklUX01PRFVMRV9OQU1FXS5jb25jYXQobW9kdWxlcykpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHJlc3VtZUJvb3RzdHJhcCgpIG9ubHkgZXhpc3RzIGlmIHRoZSBjdXJyZW50IGJvb3RzdHJhcCBpcyBkZWZlcnJlZFxuICAgIGNvbnN0IHdpbmRvd0FuZ3VsYXIgPSAod2luZG93IGFzIGFueSlbJ2FuZ3VsYXInXTtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIEJvb3RzdHJhcCB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uIGluc2lkZSBvdXIgem9uZVxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7IGFuZ3VsYXIuYm9vdHN0cmFwKGVsZW1lbnQsIFt1cGdyYWRlTW9kdWxlLm5hbWVdLCBjb25maWcpOyB9KTtcblxuICAgIC8vIFBhdGNoIHJlc3VtZUJvb3RzdHJhcCgpIHRvIHJ1biBpbnNpZGUgdGhlIG5nWm9uZVxuICAgIGlmICh3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCkge1xuICAgICAgY29uc3Qgb3JpZ2luYWxSZXN1bWVCb290c3RyYXA6ICgpID0+IHZvaWQgPSB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcDtcbiAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMubmdab25lO1xuICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gb3JpZ2luYWxSZXN1bWVCb290c3RyYXA7XG4gICAgICAgIHJldHVybiBuZ1pvbmUucnVuKCgpID0+IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwLmFwcGx5KHRoaXMsIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfVxuICB9XG59XG4iXX0=