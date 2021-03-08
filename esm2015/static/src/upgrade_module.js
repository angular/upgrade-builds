/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, isDevMode, NgModule, NgZone, PlatformRef, Testability } from '@angular/core';
import { bootstrap, element as angularElement, module_ as angularModule } from '../../src/common/src/angular1';
import { $$TESTABILITY, $DELEGATE, $INJECTOR, $INTERVAL, $PROVIDE, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_APP_TYPE_KEY, UPGRADE_MODULE_NAME } from '../../src/common/src/constants';
import { controllerKey, destroyApp } from '../../src/common/src/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
import * as i0 from "@angular/core";
/**
 * @description
 *
 * An `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static)
 * library for hybrid upgrade apps that support AOT compilation*
 *
 * The `upgrade/static` package contains helpers that allow AngularJS and Angular components
 * to be used together inside a hybrid upgrade application, which supports AOT compilation.
 *
 * Specifically, the classes and functions in the `upgrade/static` module allow the following:
 *
 * 1. Creation of an Angular directive that wraps and exposes an AngularJS component so
 *    that it can be used in an Angular template. See `UpgradeComponent`.
 * 2. Creation of an AngularJS directive that wraps and exposes an Angular component so
 *    that it can be used in an AngularJS template. See `downgradeComponent`.
 * 3. Creation of an Angular root injector provider that wraps and exposes an AngularJS
 *    service so that it can be injected into an Angular context. See
 *    {@link UpgradeModule#upgrading-an-angular-1-service Upgrading an AngularJS service} below.
 * 4. Creation of an AngularJS service that wraps and exposes an Angular injectable
 *    so that it can be injected into an AngularJS context. See `downgradeInjectable`.
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * @usageNotes
 *
 * ```ts
 * import {UpgradeModule} from '@angular/upgrade/static';
 * ```
 *
 * See also the {@link UpgradeModule#examples examples} below.
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
 * * Core AngularJS services
 *   Importing this `NgModule` will add providers for the core
 *   [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * * Bootstrap
 *   The runtime instance of this class contains a {@link UpgradeModule#bootstrap `bootstrap()`}
 *   method, which you use to bootstrap the top level AngularJS module onto an element in the
 *   DOM for the hybrid upgrade app.
 *
 *   It also contains properties to access the {@link UpgradeModule#injector root injector}, the
 *   bootstrap `NgZone` and the
 *   [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
 *
 * ### Examples
 *
 * Import the `UpgradeModule` into your top level {@link NgModule Angular `NgModule`}.
 *
 * {@example upgrade/static/ts/full/module.ts region='ng2-module'}
 *
 * Then inject `UpgradeModule` into your Angular `NgModule` and use it to bootstrap the top level
 * [AngularJS module](https://docs.angularjs.org/api/ng/type/angular.Module) in the
 * `ngDoBootstrap()` method.
 *
 * {@example upgrade/static/ts/full/module.ts region='bootstrap-ng1'}
 *
 * Finally, kick off the whole process, by bootstraping your top level Angular `NgModule`.
 *
 * {@example upgrade/static/ts/full/module.ts region='bootstrap-ng2'}
 *
 * {@a upgrading-an-angular-1-service}
 * ### Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-text-formatter-service"}
 *
 * Then you should define an Angular provider to be included in your `NgModule` `providers`
 * property.
 *
 * {@example upgrade/static/ts/full/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {@example upgrade/static/ts/full/module.ts region="use-ng1-upgraded-service"}
 *
 * @publicApi
 */
export class UpgradeModule {
    constructor(
    /** The root `Injector` for the upgrade application. */
    injector, 
    /** The bootstrap zone for the upgrade application */
    ngZone, 
    /**
     * The owning `NgModuleRef`s `PlatformRef` instance.
     * This is used to tie the lifecycle of the bootstrapped AngularJS apps to that of the Angular
     * `PlatformRef`.
     */
    platformRef) {
        this.ngZone = ngZone;
        this.platformRef = platformRef;
        this.injector = new NgAdapterInjector(injector);
    }
    /**
     * Bootstrap an AngularJS application from this NgModule
     * @param element the element on which to bootstrap the AngularJS application
     * @param [modules] the AngularJS modules to bootstrap for this application
     * @param [config] optional extra AngularJS bootstrap configuration
     */
    bootstrap(element, modules = [], config /*angular.IAngularBootstrapConfig*/) {
        const INIT_MODULE_NAME = UPGRADE_MODULE_NAME + '.init';
        // Create an ng1 module to bootstrap
        angularModule(INIT_MODULE_NAME, [])
            .constant(UPGRADE_APP_TYPE_KEY, 2 /* Static */)
            .value(INJECTOR_KEY, this.injector)
            .factory(LAZY_MODULE_REF, [INJECTOR_KEY, (injector) => ({ injector })])
            .config([
            $PROVIDE, $INJECTOR,
            ($provide, $injector) => {
                if ($injector.has($$TESTABILITY)) {
                    $provide.decorator($$TESTABILITY, [
                        $DELEGATE,
                        (testabilityDelegate) => {
                            const originalWhenStable = testabilityDelegate.whenStable;
                            const injector = this.injector;
                            // Cannot use arrow function below because we need the context
                            const newWhenStable = function (callback) {
                                originalWhenStable.call(testabilityDelegate, function () {
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
                            // Wrap the $interval service so that setInterval is called outside NgZone,
                            // but the callback is still invoked within it. This is so that $interval
                            // won't block stability, which preserves the behavior from AngularJS.
                            let wrappedInterval = (fn, delay, count, invokeApply, ...pass) => {
                                return this.ngZone.runOutsideAngular(() => {
                                    return intervalDelegate((...args) => {
                                        // Run callback in the next VM turn - $interval calls
                                        // $rootScope.$apply, and running the callback in NgZone will
                                        // cause a '$digest already in progress' error if it's in the
                                        // same vm turn.
                                        setTimeout(() => {
                                            this.ngZone.run(() => fn(...args));
                                        });
                                    }, delay, count, invokeApply, ...pass);
                                });
                            };
                            wrappedInterval['cancel'] = intervalDelegate.cancel;
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
                const $rootScope = $injector.get('$rootScope');
                // Initialize the ng1 $injector provider
                setTempInjectorRef($injector);
                this.injector.get($INJECTOR);
                // Put the injector on the DOM, so that it can be "required"
                angularElement(element).data(controllerKey(INJECTOR_KEY), this.injector);
                // Destroy the AngularJS app once the Angular `PlatformRef` is destroyed.
                // This does not happen in a typical SPA scenario, but it might be useful for
                // other use-cases where disposing of an Angular/AngularJS app is necessary
                // (such as Hot Module Replacement (HMR)).
                // See https://github.com/angular/angular/issues/39935.
                this.platformRef.onDestroy(() => destroyApp($injector));
                // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
                // We need to do this in the next tick so that we don't prevent the bootup stabilizing
                setTimeout(() => {
                    const subscription = this.ngZone.onMicrotaskEmpty.subscribe(() => {
                        if ($rootScope.$$phase) {
                            if (isDevMode()) {
                                console.warn('A digest was triggered while one was already in progress. This may mean that something is triggering digests outside the Angular zone.');
                            }
                            return $rootScope.$evalAsync();
                        }
                        return $rootScope.$digest();
                    });
                    $rootScope.$on('$destroy', () => {
                        subscription.unsubscribe();
                    });
                }, 0);
            }
        ]);
        const upgradeModule = angularModule(UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        const windowAngular = window['angular'];
        windowAngular.resumeBootstrap = undefined;
        // Bootstrap the AngularJS application inside our zone
        this.ngZone.run(() => {
            bootstrap(element, [upgradeModule.name], config);
        });
        // Patch resumeBootstrap() to run inside the ngZone
        if (windowAngular.resumeBootstrap) {
            const originalResumeBootstrap = windowAngular.resumeBootstrap;
            const ngZone = this.ngZone;
            windowAngular.resumeBootstrap = function () {
                let args = arguments;
                windowAngular.resumeBootstrap = originalResumeBootstrap;
                return ngZone.run(() => windowAngular.resumeBootstrap.apply(this, args));
            };
        }
    }
}
UpgradeModule.ɵmod = /*@__PURE__*/ i0.ɵɵdefineNgModule({ type: UpgradeModule });
UpgradeModule.ɵinj = /*@__PURE__*/ i0.ɵɵdefineInjector({ factory: function UpgradeModule_Factory(t) { return new (t || UpgradeModule)(i0.ɵɵinject(i0.Injector), i0.ɵɵinject(i0.NgZone), i0.ɵɵinject(i0.PlatformRef)); }, providers: [angular1Providers] });
(function () { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UpgradeModule, [{
        type: NgModule,
        args: [{ providers: [angular1Providers] }]
    }], function () { return [{ type: i0.Injector }, { type: i0.NgZone }, { type: i0.PlatformRef }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTlGLE9BQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxJQUFJLGNBQWMsRUFBNEUsT0FBTyxJQUFJLGFBQWEsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3ZMLE9BQU8sRUFBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNsTCxPQUFPLEVBQUMsYUFBYSxFQUFFLFVBQVUsRUFBZ0MsTUFBTSwyQkFBMkIsQ0FBQztBQUVuRyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUMzRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBSXpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEhHO0FBRUgsTUFBTSxPQUFPLGFBQWE7SUFReEI7SUFDSSx1REFBdUQ7SUFDdkQsUUFBa0I7SUFDbEIscURBQXFEO0lBQzlDLE1BQWM7SUFDckI7Ozs7T0FJRztJQUNLLFdBQXdCO1FBTnpCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFNYixnQkFB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LENBQUM7WUFDM0UsQ0FBQyxDQUFDO1NBQ0g7SUFDSCxDQUFDOzsrREFwS1UsYUFBYTt1SEFBYixhQUFhLGdHQURKLENBQUMsaUJBQWlCLENBQUM7dUZBQzVCLGFBQWE7Y0FEekIsUUFBUTtlQUFDLEVBQUMsU0FBUyxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBpc0Rldk1vZGUsIE5nTW9kdWxlLCBOZ1pvbmUsIFBsYXRmb3JtUmVmLCBUZXN0YWJpbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Ym9vdHN0cmFwLCBlbGVtZW50IGFzIGFuZ3VsYXJFbGVtZW50LCBJSW5qZWN0b3JTZXJ2aWNlLCBJSW50ZXJ2YWxTZXJ2aWNlLCBJUHJvdmlkZVNlcnZpY2UsIElUZXN0YWJpbGl0eVNlcnZpY2UsIG1vZHVsZV8gYXMgYW5ndWxhck1vZHVsZX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvYW5ndWxhcjEnO1xuaW1wb3J0IHskJFRFU1RBQklMSVRZLCAkREVMRUdBVEUsICRJTkpFQ1RPUiwgJElOVEVSVkFMLCAkUFJPVklERSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFVQR1JBREVfQVBQX1RZUEVfS0VZLCBVUEdSQURFX01PRFVMRV9OQU1FfSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy9jb25zdGFudHMnO1xuaW1wb3J0IHtjb250cm9sbGVyS2V5LCBkZXN0cm95QXBwLCBMYXp5TW9kdWxlUmVmLCBVcGdyYWRlQXBwVHlwZX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvdXRpbCc7XG5cbmltcG9ydCB7YW5ndWxhcjFQcm92aWRlcnMsIHNldFRlbXBJbmplY3RvclJlZn0gZnJvbSAnLi9hbmd1bGFyMV9wcm92aWRlcnMnO1xuaW1wb3J0IHtOZ0FkYXB0ZXJJbmplY3Rvcn0gZnJvbSAnLi91dGlsJztcblxuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYE5nTW9kdWxlYCwgd2hpY2ggeW91IGltcG9ydCB0byBwcm92aWRlIEFuZ3VsYXJKUyBjb3JlIHNlcnZpY2VzLFxuICogYW5kIGhhcyBhbiBpbnN0YW5jZSBtZXRob2QgdXNlZCB0byBib290c3RyYXAgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlL3N0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFPVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGUgYHVwZ3JhZGUvc3RhdGljYCBwYWNrYWdlIGNvbnRhaW5zIGhlbHBlcnMgdGhhdCBhbGxvdyBBbmd1bGFySlMgYW5kIEFuZ3VsYXIgY29tcG9uZW50c1xuICogdG8gYmUgdXNlZCB0b2dldGhlciBpbnNpZGUgYSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbiwgd2hpY2ggc3VwcG9ydHMgQU9UIGNvbXBpbGF0aW9uLlxuICpcbiAqIFNwZWNpZmljYWxseSwgdGhlIGNsYXNzZXMgYW5kIGZ1bmN0aW9ucyBpbiB0aGUgYHVwZ3JhZGUvc3RhdGljYCBtb2R1bGUgYWxsb3cgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAxLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhciB0ZW1wbGF0ZS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDIuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFyIGNvbXBvbmVudCBzb1xuICogICAgdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiBhbiBBbmd1bGFySlMgdGVtcGxhdGUuIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDMuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXIgcm9vdCBpbmplY3RvciBwcm92aWRlciB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKU1xuICogICAgc2VydmljZSBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXIgY29udGV4dC4gU2VlXG4gKiAgICB7QGxpbmsgVXBncmFkZU1vZHVsZSN1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2UgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlfSBiZWxvdy5cbiAqIDQuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBpbmplY3RhYmxlXG4gKiAgICBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXJKUyBjb250ZXh0LiBTZWUgYGRvd25ncmFkZUluamVjdGFibGVgLlxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG4gKiBgYGBcbiAqXG4gKiBTZWUgYWxzbyB0aGUge0BsaW5rIFVwZ3JhZGVNb2R1bGUjZXhhbXBsZXMgZXhhbXBsZXN9IGJlbG93LlxuICpcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXJKUyBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSB0aGUgQW5ndWxhciBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNS4gQW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYW4gYmUgXCJ1cGdyYWRlZFwiXCIgdG8gYW4gQW5ndWxhciBjb21wb25lbnQuIFRoaXMgaXMgYWNoaWV2ZWQgYnlcbiAqICAgIGRlZmluaW5nIGFuIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGF0IGl0cyBsb2NhdGlvblxuICogICAgaW4gdGhlIERPTS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDYuIEFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbiBiZSBcImRvd25ncmFkZWRcIiB0byBhbiBBbmd1bGFySlMgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFySlMgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFyIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDcuIFdoZW5ldmVyIGFuIFwidXBncmFkZWRcIi9cImRvd25ncmFkZWRcIiBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnlcbiAqICAgIHRoZSBmcmFtZXdvcmsgZG9pbmcgdGhlIGluc3RhbnRpYXRpb24uIFRoZSBvdGhlciBmcmFtZXdvcmsgdGhlbiBpbnN0YW50aWF0ZXMgYW5kIG93bnMgdGhlXG4gKiAgICB2aWV3IGZvciB0aGF0IGNvbXBvbmVudC5cbiAqICAgIDEuIFRoaXMgaW1wbGllcyB0aGF0IHRoZSBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay5cbiAqICAgIDIuIFRoZSBET00gYXR0cmlidXRlcyBhcmUgcGFyc2VkIGJ5IHRoZSBmcmFtZXdvcmsgdGhhdCBvd25zIHRoZSBjdXJyZW50IHRlbXBsYXRlLiBTb1xuICogICAgICAgYXR0cmlidXRlcyBpbiBBbmd1bGFySlMgdGVtcGxhdGVzIG11c3QgdXNlIGtlYmFiLWNhc2UsIHdoaWxlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMgbXVzdCB1c2VcbiAqICAgICAgIGNhbWVsQ2FzZS5cbiAqICAgIDMuIEhvd2V2ZXIgdGhlIHRlbXBsYXRlIGJpbmRpbmcgc3ludGF4IHdpbGwgYWx3YXlzIHVzZSB0aGUgQW5ndWxhciBzdHlsZSwgZS5nLiBzcXVhcmVcbiAqICAgICAgIGJyYWNrZXRzIChgWy4uLl1gKSBmb3IgcHJvcGVydHkgYmluZGluZy5cbiAqIDguIEFuZ3VsYXIgaXMgYm9vdHN0cmFwcGVkIGZpcnN0OyBBbmd1bGFySlMgaXMgYm9vdHN0cmFwcGVkIHNlY29uZC4gQW5ndWxhckpTIGFsd2F5cyBvd25zIHRoZVxuICogICAgcm9vdCBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGFuIEFuZ3VsYXIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHMgdG9cbiAqICAgIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIFRoZSBgVXBncmFkZU1vZHVsZWAgY2xhc3NcbiAqXG4gKiBUaGlzIGNsYXNzIGlzIGFuIGBOZ01vZHVsZWAsIHdoaWNoIHlvdSBpbXBvcnQgdG8gcHJvdmlkZSBBbmd1bGFySlMgY29yZSBzZXJ2aWNlcyxcbiAqIGFuZCBoYXMgYW4gaW5zdGFuY2UgbWV0aG9kIHVzZWQgdG8gYm9vdHN0cmFwIHRoZSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAqIENvcmUgQW5ndWxhckpTIHNlcnZpY2VzXG4gKiAgIEltcG9ydGluZyB0aGlzIGBOZ01vZHVsZWAgd2lsbCBhZGQgcHJvdmlkZXJzIGZvciB0aGUgY29yZVxuICogICBbQW5ndWxhckpTIHNlcnZpY2VzXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZSkgdG8gdGhlIHJvb3QgaW5qZWN0b3IuXG4gKlxuICogKiBCb290c3RyYXBcbiAqICAgVGhlIHJ1bnRpbWUgaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcyBjb250YWlucyBhIHtAbGluayBVcGdyYWRlTW9kdWxlI2Jvb3RzdHJhcCBgYm9vdHN0cmFwKClgfVxuICogICBtZXRob2QsIHdoaWNoIHlvdSB1c2UgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWwgQW5ndWxhckpTIG1vZHVsZSBvbnRvIGFuIGVsZW1lbnQgaW4gdGhlXG4gKiAgIERPTSBmb3IgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcC5cbiAqXG4gKiAgIEl0IGFsc28gY29udGFpbnMgcHJvcGVydGllcyB0byBhY2Nlc3MgdGhlIHtAbGluayBVcGdyYWRlTW9kdWxlI2luamVjdG9yIHJvb3QgaW5qZWN0b3J9LCB0aGVcbiAqICAgYm9vdHN0cmFwIGBOZ1pvbmVgIGFuZCB0aGVcbiAqICAgW0FuZ3VsYXJKUyAkaW5qZWN0b3JdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9hdXRvL3NlcnZpY2UvJGluamVjdG9yKS5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBJbXBvcnQgdGhlIGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgdG9wIGxldmVsIHtAbGluayBOZ01vZHVsZSBBbmd1bGFyIGBOZ01vZHVsZWB9LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J25nMi1tb2R1bGUnfVxuICpcbiAqIFRoZW4gaW5qZWN0IGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgQW5ndWxhciBgTmdNb2R1bGVgIGFuZCB1c2UgaXQgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWxcbiAqIFtBbmd1bGFySlMgbW9kdWxlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS9hbmd1bGFyLk1vZHVsZSkgaW4gdGhlXG4gKiBgbmdEb0Jvb3RzdHJhcCgpYCBtZXRob2QuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMSd9XG4gKlxuICogRmluYWxseSwga2ljayBvZmYgdGhlIHdob2xlIHByb2Nlc3MsIGJ5IGJvb3RzdHJhcGluZyB5b3VyIHRvcCBsZXZlbCBBbmd1bGFyIGBOZ01vZHVsZWAuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMid9XG4gKlxuICoge0BhIHVwZ3JhZGluZy1hbi1hbmd1bGFyLTEtc2VydmljZX1cbiAqICMjIyBVcGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2VcbiAqXG4gKiBUaGVyZSBpcyBubyBzcGVjaWZpYyBBUEkgZm9yIHVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZS4gSW5zdGVhZCB5b3Ugc2hvdWxkIGp1c3QgZm9sbG93IHRoZVxuICogZm9sbG93aW5nIHJlY2lwZTpcbiAqXG4gKiBMZXQncyBzYXkgeW91IGhhdmUgYW4gQW5ndWxhckpTIHNlcnZpY2U6XG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS10ZXh0LWZvcm1hdHRlci1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3Ugc2hvdWxkIGRlZmluZSBhbiBBbmd1bGFyIHByb3ZpZGVyIHRvIGJlIGluY2x1ZGVkIGluIHlvdXIgYE5nTW9kdWxlYCBgcHJvdmlkZXJzYFxuICogcHJvcGVydHkuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cInVwZ3JhZGUtbmcxLXNlcnZpY2VcIn1cbiAqXG4gKiBUaGVuIHlvdSBjYW4gdXNlIHRoZSBcInVwZ3JhZGVkXCIgQW5ndWxhckpTIHNlcnZpY2UgYnkgaW5qZWN0aW5nIGl0IGludG8gYW4gQW5ndWxhciBjb21wb25lbnRcbiAqIG9yIHNlcnZpY2UuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cInVzZS1uZzEtdXBncmFkZWQtc2VydmljZVwifVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtwcm92aWRlcnM6IFthbmd1bGFyMVByb3ZpZGVyc119KVxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVNb2R1bGUge1xuICAvKipcbiAgICogVGhlIEFuZ3VsYXJKUyBgJGluamVjdG9yYCBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgJGluamVjdG9yOiBhbnkgLyphbmd1bGFyLklJbmplY3RvclNlcnZpY2UqLztcbiAgLyoqIFRoZSBBbmd1bGFyIEluamVjdG9yICoqL1xuICBwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIFRoZSByb290IGBJbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLiAqL1xuICAgICAgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgLyoqIFRoZSBib290c3RyYXAgem9uZSBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24gKi9cbiAgICAgIHB1YmxpYyBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgIC8qKlxuICAgICAgICogVGhlIG93bmluZyBgTmdNb2R1bGVSZWZgcyBgUGxhdGZvcm1SZWZgIGluc3RhbmNlLlxuICAgICAgICogVGhpcyBpcyB1c2VkIHRvIHRpZSB0aGUgbGlmZWN5Y2xlIG9mIHRoZSBib290c3RyYXBwZWQgQW5ndWxhckpTIGFwcHMgdG8gdGhhdCBvZiB0aGUgQW5ndWxhclxuICAgICAgICogYFBsYXRmb3JtUmVmYC5cbiAgICAgICAqL1xuICAgICAgcHJpdmF0ZSBwbGF0Zm9ybVJlZjogUGxhdGZvcm1SZWYpIHtcbiAgICB0aGlzLmluamVjdG9yID0gbmV3IE5nQWRhcHRlckluamVjdG9yKGluamVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYW4gQW5ndWxhckpTIGFwcGxpY2F0aW9uIGZyb20gdGhpcyBOZ01vZHVsZVxuICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCBvbiB3aGljaCB0byBib290c3RyYXAgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gW21vZHVsZXNdIHRoZSBBbmd1bGFySlMgbW9kdWxlcyB0byBib290c3RyYXAgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIFtjb25maWddIG9wdGlvbmFsIGV4dHJhIEFuZ3VsYXJKUyBib290c3RyYXAgY29uZmlndXJhdGlvblxuICAgKi9cbiAgYm9vdHN0cmFwKFxuICAgICAgZWxlbWVudDogRWxlbWVudCwgbW9kdWxlczogc3RyaW5nW10gPSBbXSwgY29uZmlnPzogYW55IC8qYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyovKSB7XG4gICAgY29uc3QgSU5JVF9NT0RVTEVfTkFNRSA9IFVQR1JBREVfTU9EVUxFX05BTUUgKyAnLmluaXQnO1xuXG4gICAgLy8gQ3JlYXRlIGFuIG5nMSBtb2R1bGUgdG8gYm9vdHN0cmFwXG4gICAgYW5ndWxhck1vZHVsZShJTklUX01PRFVMRV9OQU1FLCBbXSlcblxuICAgICAgICAuY29uc3RhbnQoVVBHUkFERV9BUFBfVFlQRV9LRVksIFVwZ3JhZGVBcHBUeXBlLlN0YXRpYylcblxuICAgICAgICAudmFsdWUoSU5KRUNUT1JfS0VZLCB0aGlzLmluamVjdG9yKVxuXG4gICAgICAgIC5mYWN0b3J5KFxuICAgICAgICAgICAgTEFaWV9NT0RVTEVfUkVGLCBbSU5KRUNUT1JfS0VZLCAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiAoe2luamVjdG9yfSBhcyBMYXp5TW9kdWxlUmVmKV0pXG5cbiAgICAgICAgLmNvbmZpZyhbXG4gICAgICAgICAgJFBST1ZJREUsICRJTkpFQ1RPUixcbiAgICAgICAgICAoJHByb3ZpZGU6IElQcm92aWRlU2VydmljZSwgJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICBpZiAoJGluamVjdG9yLmhhcygkJFRFU1RBQklMSVRZKSkge1xuICAgICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJCRURVNUQUJJTElUWSwgW1xuICAgICAgICAgICAgICAgICRERUxFR0FURSxcbiAgICAgICAgICAgICAgICAodGVzdGFiaWxpdHlEZWxlZ2F0ZTogSVRlc3RhYmlsaXR5U2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGluamVjdG9yID0gdGhpcy5pbmplY3RvcjtcbiAgICAgICAgICAgICAgICAgIC8vIENhbm5vdCB1c2UgYXJyb3cgZnVuY3Rpb24gYmVsb3cgYmVjYXVzZSB3ZSBuZWVkIHRoZSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdXaGVuU3RhYmxlID0gZnVuY3Rpb24oY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsV2hlblN0YWJsZS5jYWxsKHRlc3RhYmlsaXR5RGVsZWdhdGUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5nMlRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSA9IGluamVjdG9yLmdldChUZXN0YWJpbGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKG5nMlRlc3RhYmlsaXR5LmlzU3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nMlRlc3RhYmlsaXR5LndoZW5TdGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3V2hlblN0YWJsZS5iaW5kKHRlc3RhYmlsaXR5RGVsZWdhdGUsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgIHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZSA9IG5ld1doZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdGFiaWxpdHlEZWxlZ2F0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJGluamVjdG9yLmhhcygkSU5URVJWQUwpKSB7XG4gICAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcigkSU5URVJWQUwsIFtcbiAgICAgICAgICAgICAgICAkREVMRUdBVEUsXG4gICAgICAgICAgICAgICAgKGludGVydmFsRGVsZWdhdGU6IElJbnRlcnZhbFNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgIC8vIFdyYXAgdGhlICRpbnRlcnZhbCBzZXJ2aWNlIHNvIHRoYXQgc2V0SW50ZXJ2YWwgaXMgY2FsbGVkIG91dHNpZGUgTmdab25lLFxuICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoZSBjYWxsYmFjayBpcyBzdGlsbCBpbnZva2VkIHdpdGhpbiBpdC4gVGhpcyBpcyBzbyB0aGF0ICRpbnRlcnZhbFxuICAgICAgICAgICAgICAgICAgLy8gd29uJ3QgYmxvY2sgc3RhYmlsaXR5LCB3aGljaCBwcmVzZXJ2ZXMgdGhlIGJlaGF2aW9yIGZyb20gQW5ndWxhckpTLlxuICAgICAgICAgICAgICAgICAgbGV0IHdyYXBwZWRJbnRlcnZhbCA9XG4gICAgICAgICAgICAgICAgICAgICAgKGZuOiBGdW5jdGlvbiwgZGVsYXk6IG51bWJlciwgY291bnQ/OiBudW1iZXIsIGludm9rZUFwcGx5PzogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICAgLi4ucGFzczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnZhbERlbGVnYXRlKCguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJ1biBjYWxsYmFjayBpbiB0aGUgbmV4dCBWTSB0dXJuIC0gJGludGVydmFsIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kYXBwbHksIGFuZCBydW5uaW5nIHRoZSBjYWxsYmFjayBpbiBOZ1pvbmUgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhdXNlIGEgJyRkaWdlc3QgYWxyZWFkeSBpbiBwcm9ncmVzcycgZXJyb3IgaWYgaXQncyBpbiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzYW1lIHZtIHR1cm4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gZm4oLi4uYXJncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSwgY291bnQsIGludm9rZUFwcGx5LCAuLi5wYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICh3cmFwcGVkSW50ZXJ2YWwgYXMgYW55KVsnY2FuY2VsJ10gPSBpbnRlcnZhbERlbGVnYXRlLmNhbmNlbDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB3cmFwcGVkSW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF0pXG5cbiAgICAgICAgLnJ1bihbXG4gICAgICAgICAgJElOSkVDVE9SLFxuICAgICAgICAgICgkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMuJGluamVjdG9yID0gJGluamVjdG9yO1xuICAgICAgICAgICAgY29uc3QgJHJvb3RTY29wZSA9ICRpbmplY3Rvci5nZXQoJyRyb290U2NvcGUnKTtcblxuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgbmcxICRpbmplY3RvciBwcm92aWRlclxuICAgICAgICAgICAgc2V0VGVtcEluamVjdG9yUmVmKCRpbmplY3Rvcik7XG4gICAgICAgICAgICB0aGlzLmluamVjdG9yLmdldCgkSU5KRUNUT1IpO1xuXG4gICAgICAgICAgICAvLyBQdXQgdGhlIGluamVjdG9yIG9uIHRoZSBET00sIHNvIHRoYXQgaXQgY2FuIGJlIFwicmVxdWlyZWRcIlxuICAgICAgICAgICAgYW5ndWxhckVsZW1lbnQoZWxlbWVudCkuZGF0YSEoY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpLCB0aGlzLmluamVjdG9yKTtcblxuICAgICAgICAgICAgLy8gRGVzdHJveSB0aGUgQW5ndWxhckpTIGFwcCBvbmNlIHRoZSBBbmd1bGFyIGBQbGF0Zm9ybVJlZmAgaXMgZGVzdHJveWVkLlxuICAgICAgICAgICAgLy8gVGhpcyBkb2VzIG5vdCBoYXBwZW4gaW4gYSB0eXBpY2FsIFNQQSBzY2VuYXJpbywgYnV0IGl0IG1pZ2h0IGJlIHVzZWZ1bCBmb3JcbiAgICAgICAgICAgIC8vIG90aGVyIHVzZS1jYXNlcyB3aGVyZSBkaXNwb3Npbmcgb2YgYW4gQW5ndWxhci9Bbmd1bGFySlMgYXBwIGlzIG5lY2Vzc2FyeVxuICAgICAgICAgICAgLy8gKHN1Y2ggYXMgSG90IE1vZHVsZSBSZXBsYWNlbWVudCAoSE1SKSkuXG4gICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9pc3N1ZXMvMzk5MzUuXG4gICAgICAgICAgICB0aGlzLnBsYXRmb3JtUmVmLm9uRGVzdHJveSgoKSA9PiBkZXN0cm95QXBwKCRpbmplY3RvcikpO1xuXG4gICAgICAgICAgICAvLyBXaXJlIHVwIHRoZSBuZzEgcm9vdFNjb3BlIHRvIHJ1biBhIGRpZ2VzdCBjeWNsZSB3aGVuZXZlciB0aGUgem9uZSBzZXR0bGVzXG4gICAgICAgICAgICAvLyBXZSBuZWVkIHRvIGRvIHRoaXMgaW4gdGhlIG5leHQgdGljayBzbyB0aGF0IHdlIGRvbid0IHByZXZlbnQgdGhlIGJvb3R1cCBzdGFiaWxpemluZ1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMubmdab25lLm9uTWljcm90YXNrRW1wdHkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoJHJvb3RTY29wZS4kJHBoYXNlKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNEZXZNb2RlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0EgZGlnZXN0IHdhcyB0cmlnZ2VyZWQgd2hpbGUgb25lIHdhcyBhbHJlYWR5IGluIHByb2dyZXNzLiBUaGlzIG1heSBtZWFuIHRoYXQgc29tZXRoaW5nIGlzIHRyaWdnZXJpbmcgZGlnZXN0cyBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmUuJyk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiAkcm9vdFNjb3BlLiRldmFsQXN5bmMoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJHJvb3RTY29wZS4kZGlnZXN0KCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICBdKTtcblxuICAgIGNvbnN0IHVwZ3JhZGVNb2R1bGUgPSBhbmd1bGFyTW9kdWxlKFVQR1JBREVfTU9EVUxFX05BTUUsIFtJTklUX01PRFVMRV9OQU1FXS5jb25jYXQobW9kdWxlcykpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHJlc3VtZUJvb3RzdHJhcCgpIG9ubHkgZXhpc3RzIGlmIHRoZSBjdXJyZW50IGJvb3RzdHJhcCBpcyBkZWZlcnJlZFxuICAgIGNvbnN0IHdpbmRvd0FuZ3VsYXIgPSAod2luZG93IGFzIGFueSlbJ2FuZ3VsYXInXTtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIEJvb3RzdHJhcCB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uIGluc2lkZSBvdXIgem9uZVxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICBib290c3RyYXAoZWxlbWVudCwgW3VwZ3JhZGVNb2R1bGUubmFtZV0sIGNvbmZpZyk7XG4gICAgfSk7XG5cbiAgICAvLyBQYXRjaCByZXN1bWVCb290c3RyYXAoKSB0byBydW4gaW5zaWRlIHRoZSBuZ1pvbmVcbiAgICBpZiAod2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXApIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXA7XG4gICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLm5nWm9uZTtcbiAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICByZXR1cm4gbmdab25lLnJ1bigoKSA9PiB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcC5hcHBseSh0aGlzLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuIl19