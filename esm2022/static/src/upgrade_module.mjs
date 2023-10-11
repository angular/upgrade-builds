/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, NgModule, NgZone, PlatformRef, Testability } from '@angular/core';
import { ɵangular1, ɵconstants, ɵutil } from '../common';
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
 * * Core AngularJS services<br />
 *   Importing this `NgModule` will add providers for the core
 *   [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * * Bootstrap<br />
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
 * Finally, kick off the whole process, by bootstrapping your top level Angular `NgModule`.
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
     * @return The value returned by
     *     [angular.bootstrap()](https://docs.angularjs.org/api/ng/function/angular.bootstrap).
     */
    bootstrap(element, modules = [], config /*angular.IAngularBootstrapConfig*/) {
        const INIT_MODULE_NAME = ɵconstants.UPGRADE_MODULE_NAME + '.init';
        // Create an ng1 module to bootstrap
        ɵangular1
            .module_(INIT_MODULE_NAME, [])
            .constant(ɵconstants.UPGRADE_APP_TYPE_KEY, 2 /* ɵutil.UpgradeAppType.Static */)
            .value(ɵconstants.INJECTOR_KEY, this.injector)
            .factory(ɵconstants.LAZY_MODULE_REF, [ɵconstants.INJECTOR_KEY, (injector) => ({ injector })])
            .config([
            ɵconstants.$PROVIDE, ɵconstants.$INJECTOR,
            ($provide, $injector) => {
                if ($injector.has(ɵconstants.$$TESTABILITY)) {
                    $provide.decorator(ɵconstants.$$TESTABILITY, [
                        ɵconstants.$DELEGATE,
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
                if ($injector.has(ɵconstants.$INTERVAL)) {
                    $provide.decorator(ɵconstants.$INTERVAL, [
                        ɵconstants.$DELEGATE,
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
                            Object.keys(intervalDelegate)
                                .forEach(prop => wrappedInterval[prop] = intervalDelegate[prop]);
                            // the `flush` method will be present when ngMocks is used
                            if (intervalDelegate.hasOwnProperty('flush')) {
                                wrappedInterval['flush'] = () => {
                                    intervalDelegate['flush']();
                                    return wrappedInterval;
                                };
                            }
                            return wrappedInterval;
                        }
                    ]);
                }
            }
        ])
            .run([
            ɵconstants.$INJECTOR,
            ($injector) => {
                this.$injector = $injector;
                const $rootScope = $injector.get('$rootScope');
                // Initialize the ng1 $injector provider
                setTempInjectorRef($injector);
                this.injector.get(ɵconstants.$INJECTOR);
                // Put the injector on the DOM, so that it can be "required"
                ɵangular1.element(element).data(ɵutil.controllerKey(ɵconstants.INJECTOR_KEY), this.injector);
                // Destroy the AngularJS app once the Angular `PlatformRef` is destroyed.
                // This does not happen in a typical SPA scenario, but it might be useful for
                // other use-cases where disposing of an Angular/AngularJS app is necessary
                // (such as Hot Module Replacement (HMR)).
                // See https://github.com/angular/angular/issues/39935.
                this.platformRef.onDestroy(() => ɵutil.destroyApp($injector));
                // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
                // We need to do this in the next tick so that we don't prevent the bootup stabilizing
                setTimeout(() => {
                    const subscription = this.ngZone.onMicrotaskEmpty.subscribe(() => {
                        if ($rootScope.$$phase) {
                            if (typeof ngDevMode === 'undefined' || ngDevMode) {
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
        const upgradeModule = ɵangular1.module_(ɵconstants.UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        const windowAngular = window['angular'];
        windowAngular.resumeBootstrap = undefined;
        // Bootstrap the AngularJS application inside our zone
        const returnValue = this.ngZone.run(() => ɵangular1.bootstrap(element, [upgradeModule.name], config));
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
        return returnValue;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.0-next.7+sha-44a75aa", ngImport: i0, type: UpgradeModule, deps: [{ token: i0.Injector }, { token: i0.NgZone }, { token: i0.PlatformRef }], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "17.0.0-next.7+sha-44a75aa", ngImport: i0, type: UpgradeModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "17.0.0-next.7+sha-44a75aa", ngImport: i0, type: UpgradeModule, providers: [angular1Providers] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.0-next.7+sha-44a75aa", ngImport: i0, type: UpgradeModule, decorators: [{
            type: NgModule,
            args: [{ providers: [angular1Providers] }]
        }], ctorParameters: () => [{ type: i0.Injector }, { type: i0.NgZone }, { type: i0.PlatformRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbkYsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRXZELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzNFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7QUFJekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0SEc7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQVF4QjtJQUNJLHVEQUF1RDtJQUN2RCxRQUFrQjtJQUNsQixxREFBcUQ7SUFDOUMsTUFBYztJQUNyQjs7OztPQUlHO0lBQ0ssV0FBd0I7UUFOekIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQU1iLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBQ2xDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILFNBQVMsQ0FDTCxPQUFnQixFQUFFLFVBQW9CLEVBQUUsRUFBRSxNQUFZLENBQUMsbUNBQW1DO1FBRTVGLE1BQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FB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QUNuRCxJQUFJLGFBQWEsQ0FBQyxlQUFlLEVBQUU7WUFDakMsTUFBTSx1QkFBdUIsR0FBZSxhQUFhLENBQUMsZUFBZSxDQUFDO1lBQzFFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDM0IsYUFBYSxDQUFDLGVBQWUsR0FBRztnQkFDOUIsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDO2dCQUNyQixhQUFhLENBQUMsZUFBZSxHQUFHLHVCQUF1QixDQUFDO2dCQUN4RCxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDM0UsQ0FBQyxDQUFDO1NBQ0g7UUFFRCxPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO3lIQXRMVSxhQUFhOzBIQUFiLGFBQWE7MEhBQWIsYUFBYSxhQURKLENBQUMsaUJBQWlCLENBQUM7O3NHQUM1QixhQUFhO2tCQUR6QixRQUFRO21CQUFDLEVBQUMsU0FBUyxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBOZ01vZHVsZSwgTmdab25lLCBQbGF0Zm9ybVJlZiwgVGVzdGFiaWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge8m1YW5ndWxhcjEsIMm1Y29uc3RhbnRzLCDJtXV0aWx9IGZyb20gJy4uL2NvbW1vbic7XG5cbmltcG9ydCB7YW5ndWxhcjFQcm92aWRlcnMsIHNldFRlbXBJbmplY3RvclJlZn0gZnJvbSAnLi9hbmd1bGFyMV9wcm92aWRlcnMnO1xuaW1wb3J0IHtOZ0FkYXB0ZXJJbmplY3Rvcn0gZnJvbSAnLi91dGlsJztcblxuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYE5nTW9kdWxlYCwgd2hpY2ggeW91IGltcG9ydCB0byBwcm92aWRlIEFuZ3VsYXJKUyBjb3JlIHNlcnZpY2VzLFxuICogYW5kIGhhcyBhbiBpbnN0YW5jZSBtZXRob2QgdXNlZCB0byBib290c3RyYXAgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlL3N0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFPVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGUgYHVwZ3JhZGUvc3RhdGljYCBwYWNrYWdlIGNvbnRhaW5zIGhlbHBlcnMgdGhhdCBhbGxvdyBBbmd1bGFySlMgYW5kIEFuZ3VsYXIgY29tcG9uZW50c1xuICogdG8gYmUgdXNlZCB0b2dldGhlciBpbnNpZGUgYSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbiwgd2hpY2ggc3VwcG9ydHMgQU9UIGNvbXBpbGF0aW9uLlxuICpcbiAqIFNwZWNpZmljYWxseSwgdGhlIGNsYXNzZXMgYW5kIGZ1bmN0aW9ucyBpbiB0aGUgYHVwZ3JhZGUvc3RhdGljYCBtb2R1bGUgYWxsb3cgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAxLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhciB0ZW1wbGF0ZS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDIuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFyIGNvbXBvbmVudCBzb1xuICogICAgdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiBhbiBBbmd1bGFySlMgdGVtcGxhdGUuIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDMuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXIgcm9vdCBpbmplY3RvciBwcm92aWRlciB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKU1xuICogICAgc2VydmljZSBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXIgY29udGV4dC4gU2VlXG4gKiAgICB7QGxpbmsgVXBncmFkZU1vZHVsZSN1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2UgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlfSBiZWxvdy5cbiAqIDQuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBpbmplY3RhYmxlXG4gKiAgICBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXJKUyBjb250ZXh0LiBTZWUgYGRvd25ncmFkZUluamVjdGFibGVgLlxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG4gKiBgYGBcbiAqXG4gKiBTZWUgYWxzbyB0aGUge0BsaW5rIFVwZ3JhZGVNb2R1bGUjZXhhbXBsZXMgZXhhbXBsZXN9IGJlbG93LlxuICpcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXJKUyBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSB0aGUgQW5ndWxhciBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNS4gQW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYW4gYmUgXCJ1cGdyYWRlZFwiXCIgdG8gYW4gQW5ndWxhciBjb21wb25lbnQuIFRoaXMgaXMgYWNoaWV2ZWQgYnlcbiAqICAgIGRlZmluaW5nIGFuIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGF0IGl0cyBsb2NhdGlvblxuICogICAgaW4gdGhlIERPTS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDYuIEFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbiBiZSBcImRvd25ncmFkZWRcIiB0byBhbiBBbmd1bGFySlMgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFySlMgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFyIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDcuIFdoZW5ldmVyIGFuIFwidXBncmFkZWRcIi9cImRvd25ncmFkZWRcIiBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnlcbiAqICAgIHRoZSBmcmFtZXdvcmsgZG9pbmcgdGhlIGluc3RhbnRpYXRpb24uIFRoZSBvdGhlciBmcmFtZXdvcmsgdGhlbiBpbnN0YW50aWF0ZXMgYW5kIG93bnMgdGhlXG4gKiAgICB2aWV3IGZvciB0aGF0IGNvbXBvbmVudC5cbiAqICAgIDEuIFRoaXMgaW1wbGllcyB0aGF0IHRoZSBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay5cbiAqICAgIDIuIFRoZSBET00gYXR0cmlidXRlcyBhcmUgcGFyc2VkIGJ5IHRoZSBmcmFtZXdvcmsgdGhhdCBvd25zIHRoZSBjdXJyZW50IHRlbXBsYXRlLiBTb1xuICogICAgICAgYXR0cmlidXRlcyBpbiBBbmd1bGFySlMgdGVtcGxhdGVzIG11c3QgdXNlIGtlYmFiLWNhc2UsIHdoaWxlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMgbXVzdCB1c2VcbiAqICAgICAgIGNhbWVsQ2FzZS5cbiAqICAgIDMuIEhvd2V2ZXIgdGhlIHRlbXBsYXRlIGJpbmRpbmcgc3ludGF4IHdpbGwgYWx3YXlzIHVzZSB0aGUgQW5ndWxhciBzdHlsZSwgZS5nLiBzcXVhcmVcbiAqICAgICAgIGJyYWNrZXRzIChgWy4uLl1gKSBmb3IgcHJvcGVydHkgYmluZGluZy5cbiAqIDguIEFuZ3VsYXIgaXMgYm9vdHN0cmFwcGVkIGZpcnN0OyBBbmd1bGFySlMgaXMgYm9vdHN0cmFwcGVkIHNlY29uZC4gQW5ndWxhckpTIGFsd2F5cyBvd25zIHRoZVxuICogICAgcm9vdCBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGFuIEFuZ3VsYXIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHMgdG9cbiAqICAgIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIFRoZSBgVXBncmFkZU1vZHVsZWAgY2xhc3NcbiAqXG4gKiBUaGlzIGNsYXNzIGlzIGFuIGBOZ01vZHVsZWAsIHdoaWNoIHlvdSBpbXBvcnQgdG8gcHJvdmlkZSBBbmd1bGFySlMgY29yZSBzZXJ2aWNlcyxcbiAqIGFuZCBoYXMgYW4gaW5zdGFuY2UgbWV0aG9kIHVzZWQgdG8gYm9vdHN0cmFwIHRoZSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAqIENvcmUgQW5ndWxhckpTIHNlcnZpY2VzPGJyIC8+XG4gKiAgIEltcG9ydGluZyB0aGlzIGBOZ01vZHVsZWAgd2lsbCBhZGQgcHJvdmlkZXJzIGZvciB0aGUgY29yZVxuICogICBbQW5ndWxhckpTIHNlcnZpY2VzXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZSkgdG8gdGhlIHJvb3QgaW5qZWN0b3IuXG4gKlxuICogKiBCb290c3RyYXA8YnIgLz5cbiAqICAgVGhlIHJ1bnRpbWUgaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcyBjb250YWlucyBhIHtAbGluayBVcGdyYWRlTW9kdWxlI2Jvb3RzdHJhcCBgYm9vdHN0cmFwKClgfVxuICogICBtZXRob2QsIHdoaWNoIHlvdSB1c2UgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWwgQW5ndWxhckpTIG1vZHVsZSBvbnRvIGFuIGVsZW1lbnQgaW4gdGhlXG4gKiAgIERPTSBmb3IgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcC5cbiAqXG4gKiAgIEl0IGFsc28gY29udGFpbnMgcHJvcGVydGllcyB0byBhY2Nlc3MgdGhlIHtAbGluayBVcGdyYWRlTW9kdWxlI2luamVjdG9yIHJvb3QgaW5qZWN0b3J9LCB0aGVcbiAqICAgYm9vdHN0cmFwIGBOZ1pvbmVgIGFuZCB0aGVcbiAqICAgW0FuZ3VsYXJKUyAkaW5qZWN0b3JdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9hdXRvL3NlcnZpY2UvJGluamVjdG9yKS5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBJbXBvcnQgdGhlIGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgdG9wIGxldmVsIHtAbGluayBOZ01vZHVsZSBBbmd1bGFyIGBOZ01vZHVsZWB9LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J25nMi1tb2R1bGUnfVxuICpcbiAqIFRoZW4gaW5qZWN0IGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgQW5ndWxhciBgTmdNb2R1bGVgIGFuZCB1c2UgaXQgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWxcbiAqIFtBbmd1bGFySlMgbW9kdWxlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS9hbmd1bGFyLk1vZHVsZSkgaW4gdGhlXG4gKiBgbmdEb0Jvb3RzdHJhcCgpYCBtZXRob2QuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMSd9XG4gKlxuICogRmluYWxseSwga2ljayBvZmYgdGhlIHdob2xlIHByb2Nlc3MsIGJ5IGJvb3RzdHJhcHBpbmcgeW91ciB0b3AgbGV2ZWwgQW5ndWxhciBgTmdNb2R1bGVgLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J2Jvb3RzdHJhcC1uZzInfVxuICpcbiAqIHtAYSB1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2V9XG4gKiAjIyMgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlXG4gKlxuICogVGhlcmUgaXMgbm8gc3BlY2lmaWMgQVBJIGZvciB1cGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2UuIEluc3RlYWQgeW91IHNob3VsZCBqdXN0IGZvbGxvdyB0aGVcbiAqIGZvbGxvd2luZyByZWNpcGU6XG4gKlxuICogTGV0J3Mgc2F5IHlvdSBoYXZlIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlOlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtdGV4dC1mb3JtYXR0ZXItc2VydmljZVwifVxuICpcbiAqIFRoZW4geW91IHNob3VsZCBkZWZpbmUgYW4gQW5ndWxhciBwcm92aWRlciB0byBiZSBpbmNsdWRlZCBpbiB5b3VyIGBOZ01vZHVsZWAgYHByb3ZpZGVyc2BcbiAqIHByb3BlcnR5LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJ1cGdyYWRlLW5nMS1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3UgY2FuIHVzZSB0aGUgXCJ1cGdyYWRlZFwiIEFuZ3VsYXJKUyBzZXJ2aWNlIGJ5IGluamVjdGluZyBpdCBpbnRvIGFuIEFuZ3VsYXIgY29tcG9uZW50XG4gKiBvciBzZXJ2aWNlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJ1c2UtbmcxLXVwZ3JhZGVkLXNlcnZpY2VcIn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7cHJvdmlkZXJzOiBbYW5ndWxhcjFQcm92aWRlcnNdfSlcbmV4cG9ydCBjbGFzcyBVcGdyYWRlTW9kdWxlIHtcbiAgLyoqXG4gICAqIFRoZSBBbmd1bGFySlMgYCRpbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljICRpbmplY3RvcjogYW55IC8qYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKi87XG4gIC8qKiBUaGUgQW5ndWxhciBJbmplY3RvciAqKi9cbiAgcHVibGljIGluamVjdG9yOiBJbmplY3RvcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBUaGUgcm9vdCBgSW5qZWN0b3JgIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi4gKi9cbiAgICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgIC8qKiBUaGUgYm9vdHN0cmFwIHpvbmUgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uICovXG4gICAgICBwdWJsaWMgbmdab25lOiBOZ1pvbmUsXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBvd25pbmcgYE5nTW9kdWxlUmVmYHMgYFBsYXRmb3JtUmVmYCBpbnN0YW5jZS5cbiAgICAgICAqIFRoaXMgaXMgdXNlZCB0byB0aWUgdGhlIGxpZmVjeWNsZSBvZiB0aGUgYm9vdHN0cmFwcGVkIEFuZ3VsYXJKUyBhcHBzIHRvIHRoYXQgb2YgdGhlIEFuZ3VsYXJcbiAgICAgICAqIGBQbGF0Zm9ybVJlZmAuXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgcGxhdGZvcm1SZWY6IFBsYXRmb3JtUmVmKSB7XG4gICAgdGhpcy5pbmplY3RvciA9IG5ldyBOZ0FkYXB0ZXJJbmplY3RvcihpbmplY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQm9vdHN0cmFwIGFuIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiBmcm9tIHRoaXMgTmdNb2R1bGVcbiAgICogQHBhcmFtIGVsZW1lbnQgdGhlIGVsZW1lbnQgb24gd2hpY2ggdG8gYm9vdHN0cmFwIHRoZSBBbmd1bGFySlMgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIFttb2R1bGVzXSB0aGUgQW5ndWxhckpTIG1vZHVsZXMgdG8gYm9vdHN0cmFwIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSBbY29uZmlnXSBvcHRpb25hbCBleHRyYSBBbmd1bGFySlMgYm9vdHN0cmFwIGNvbmZpZ3VyYXRpb25cbiAgICogQHJldHVybiBUaGUgdmFsdWUgcmV0dXJuZWQgYnlcbiAgICogICAgIFthbmd1bGFyLmJvb3RzdHJhcCgpXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvZnVuY3Rpb24vYW5ndWxhci5ib290c3RyYXApLlxuICAgKi9cbiAgYm9vdHN0cmFwKFxuICAgICAgZWxlbWVudDogRWxlbWVudCwgbW9kdWxlczogc3RyaW5nW10gPSBbXSwgY29uZmlnPzogYW55IC8qYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyovKTpcbiAgICAgIGFueSAvKlJldHVyblR5cGU8dHlwZW9mIGFuZ3VsYXIuYm9vdHN0cmFwPiovIHtcbiAgICBjb25zdCBJTklUX01PRFVMRV9OQU1FID0gybVjb25zdGFudHMuVVBHUkFERV9NT0RVTEVfTkFNRSArICcuaW5pdCc7XG5cbiAgICAvLyBDcmVhdGUgYW4gbmcxIG1vZHVsZSB0byBib290c3RyYXBcbiAgICDJtWFuZ3VsYXIxXG4gICAgICAgIC5tb2R1bGVfKElOSVRfTU9EVUxFX05BTUUsIFtdKVxuXG4gICAgICAgIC5jb25zdGFudCjJtWNvbnN0YW50cy5VUEdSQURFX0FQUF9UWVBFX0tFWSwgybV1dGlsLlVwZ3JhZGVBcHBUeXBlLlN0YXRpYylcblxuICAgICAgICAudmFsdWUoybVjb25zdGFudHMuSU5KRUNUT1JfS0VZLCB0aGlzLmluamVjdG9yKVxuXG4gICAgICAgIC5mYWN0b3J5KFxuICAgICAgICAgICAgybVjb25zdGFudHMuTEFaWV9NT0RVTEVfUkVGLFxuICAgICAgICAgICAgW8m1Y29uc3RhbnRzLklOSkVDVE9SX0tFWSwgKGluamVjdG9yOiBJbmplY3RvcikgPT4gKHtpbmplY3Rvcn0gYXMgybV1dGlsLkxhenlNb2R1bGVSZWYpXSlcblxuICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICDJtWNvbnN0YW50cy4kUFJPVklERSwgybVjb25zdGFudHMuJElOSkVDVE9SLFxuICAgICAgICAgICgkcHJvdmlkZTogybVhbmd1bGFyMS5JUHJvdmlkZVNlcnZpY2UsICRpbmplY3RvcjogybVhbmd1bGFyMS5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICBpZiAoJGluamVjdG9yLmhhcyjJtWNvbnN0YW50cy4kJFRFU1RBQklMSVRZKSkge1xuICAgICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoybVjb25zdGFudHMuJCRURVNUQUJJTElUWSwgW1xuICAgICAgICAgICAgICAgIMm1Y29uc3RhbnRzLiRERUxFR0FURSxcbiAgICAgICAgICAgICAgICAodGVzdGFiaWxpdHlEZWxlZ2F0ZTogybVhbmd1bGFyMS5JVGVzdGFiaWxpdHlTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbFdoZW5TdGFibGU6IEZ1bmN0aW9uID0gdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLmluamVjdG9yO1xuICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1doZW5TdGFibGUgPSBmdW5jdGlvbihjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxXaGVuU3RhYmxlLmNhbGwodGVzdGFiaWxpdHlEZWxlZ2F0ZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID0gaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAobmcyVGVzdGFiaWxpdHkuaXNTdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmcyVGVzdGFiaWxpdHkud2hlblN0YWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdXaGVuU3RhYmxlLmJpbmQodGVzdGFiaWxpdHlEZWxlZ2F0ZSwgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkaW5qZWN0b3IuaGFzKMm1Y29uc3RhbnRzLiRJTlRFUlZBTCkpIHtcbiAgICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKMm1Y29uc3RhbnRzLiRJTlRFUlZBTCwgW1xuICAgICAgICAgICAgICAgIMm1Y29uc3RhbnRzLiRERUxFR0FURSxcbiAgICAgICAgICAgICAgICAoaW50ZXJ2YWxEZWxlZ2F0ZTogybVhbmd1bGFyMS5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyBXcmFwIHRoZSAkaW50ZXJ2YWwgc2VydmljZSBzbyB0aGF0IHNldEludGVydmFsIGlzIGNhbGxlZCBvdXRzaWRlIE5nWm9uZSxcbiAgICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGUgY2FsbGJhY2sgaXMgc3RpbGwgaW52b2tlZCB3aXRoaW4gaXQuIFRoaXMgaXMgc28gdGhhdCAkaW50ZXJ2YWxcbiAgICAgICAgICAgICAgICAgIC8vIHdvbid0IGJsb2NrIHN0YWJpbGl0eSwgd2hpY2ggcHJlc2VydmVzIHRoZSBiZWhhdmlvciBmcm9tIEFuZ3VsYXJKUy5cbiAgICAgICAgICAgICAgICAgIGxldCB3cmFwcGVkSW50ZXJ2YWwgPVxuICAgICAgICAgICAgICAgICAgICAgIChmbjogRnVuY3Rpb24sIGRlbGF5OiBudW1iZXIsIGNvdW50PzogbnVtYmVyLCBpbnZva2VBcHBseT86IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgIC4uLnBhc3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW50ZXJ2YWxEZWxlZ2F0ZSgoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSdW4gY2FsbGJhY2sgaW4gdGhlIG5leHQgVk0gdHVybiAtICRpbnRlcnZhbCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGFwcGx5LCBhbmQgcnVubmluZyB0aGUgY2FsbGJhY2sgaW4gTmdab25lIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXVzZSBhICckZGlnZXN0IGFscmVhZHkgaW4gcHJvZ3Jlc3MnIGVycm9yIGlmIGl0J3MgaW4gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2FtZSB2bSB0dXJuLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IGZuKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXksIGNvdW50LCBpbnZva2VBcHBseSwgLi4ucGFzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAoT2JqZWN0LmtleXMoaW50ZXJ2YWxEZWxlZ2F0ZSkgYXMgKGtleW9mIMm1YW5ndWxhcjEuSUludGVydmFsU2VydmljZSlbXSlcbiAgICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChwcm9wID0+ICh3cmFwcGVkSW50ZXJ2YWwgYXMgYW55KVtwcm9wXSA9IGludGVydmFsRGVsZWdhdGVbcHJvcF0pO1xuXG4gICAgICAgICAgICAgICAgICAvLyB0aGUgYGZsdXNoYCBtZXRob2Qgd2lsbCBiZSBwcmVzZW50IHdoZW4gbmdNb2NrcyBpcyB1c2VkXG4gICAgICAgICAgICAgICAgICBpZiAoaW50ZXJ2YWxEZWxlZ2F0ZS5oYXNPd25Qcm9wZXJ0eSgnZmx1c2gnKSkge1xuICAgICAgICAgICAgICAgICAgICAod3JhcHBlZEludGVydmFsIGFzIGFueSlbJ2ZsdXNoJ10gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgKGludGVydmFsRGVsZWdhdGUgYXMgYW55KVsnZmx1c2gnXSgpO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3cmFwcGVkSW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiB3cmFwcGVkSW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF0pXG5cbiAgICAgICAgLnJ1bihbXG4gICAgICAgICAgybVjb25zdGFudHMuJElOSkVDVE9SLFxuICAgICAgICAgICgkaW5qZWN0b3I6IMm1YW5ndWxhcjEuSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy4kaW5qZWN0b3IgPSAkaW5qZWN0b3I7XG4gICAgICAgICAgICBjb25zdCAkcm9vdFNjb3BlID0gJGluamVjdG9yLmdldCgnJHJvb3RTY29wZScpO1xuXG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBuZzEgJGluamVjdG9yIHByb3ZpZGVyXG4gICAgICAgICAgICBzZXRUZW1wSW5qZWN0b3JSZWYoJGluamVjdG9yKTtcbiAgICAgICAgICAgIHRoaXMuaW5qZWN0b3IuZ2V0KMm1Y29uc3RhbnRzLiRJTkpFQ1RPUik7XG5cbiAgICAgICAgICAgIC8vIFB1dCB0aGUgaW5qZWN0b3Igb24gdGhlIERPTSwgc28gdGhhdCBpdCBjYW4gYmUgXCJyZXF1aXJlZFwiXG4gICAgICAgICAgICDJtWFuZ3VsYXIxLmVsZW1lbnQoZWxlbWVudCkuZGF0YSFcbiAgICAgICAgICAgICAgICAoybV1dGlsLmNvbnRyb2xsZXJLZXkoybVjb25zdGFudHMuSU5KRUNUT1JfS0VZKSwgdGhpcy5pbmplY3Rvcik7XG5cbiAgICAgICAgICAgIC8vIERlc3Ryb3kgdGhlIEFuZ3VsYXJKUyBhcHAgb25jZSB0aGUgQW5ndWxhciBgUGxhdGZvcm1SZWZgIGlzIGRlc3Ryb3llZC5cbiAgICAgICAgICAgIC8vIFRoaXMgZG9lcyBub3QgaGFwcGVuIGluIGEgdHlwaWNhbCBTUEEgc2NlbmFyaW8sIGJ1dCBpdCBtaWdodCBiZSB1c2VmdWwgZm9yXG4gICAgICAgICAgICAvLyBvdGhlciB1c2UtY2FzZXMgd2hlcmUgZGlzcG9zaW5nIG9mIGFuIEFuZ3VsYXIvQW5ndWxhckpTIGFwcCBpcyBuZWNlc3NhcnlcbiAgICAgICAgICAgIC8vIChzdWNoIGFzIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnQgKEhNUikpLlxuICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzM5OTM1LlxuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybVJlZi5vbkRlc3Ryb3koKCkgPT4gybV1dGlsLmRlc3Ryb3lBcHAoJGluamVjdG9yKSk7XG5cbiAgICAgICAgICAgIC8vIFdpcmUgdXAgdGhlIG5nMSByb290U2NvcGUgdG8gcnVuIGEgZGlnZXN0IGN5Y2xlIHdoZW5ldmVyIHRoZSB6b25lIHNldHRsZXNcbiAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZG8gdGhpcyBpbiB0aGUgbmV4dCB0aWNrIHNvIHRoYXQgd2UgZG9uJ3QgcHJldmVudCB0aGUgYm9vdHVwIHN0YWJpbGl6aW5nXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5uZ1pvbmUub25NaWNyb3Rhc2tFbXB0eS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLiQkcGhhc2UpIHtcbiAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ0EgZGlnZXN0IHdhcyB0cmlnZ2VyZWQgd2hpbGUgb25lIHdhcyBhbHJlYWR5IGluIHByb2dyZXNzLiBUaGlzIG1heSBtZWFuIHRoYXQgc29tZXRoaW5nIGlzIHRyaWdnZXJpbmcgZGlnZXN0cyBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmUuJyk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHJldHVybiAkcm9vdFNjb3BlLiRldmFsQXN5bmMoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gJHJvb3RTY29wZS4kZGlnZXN0KCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICBdKTtcblxuICAgIGNvbnN0IHVwZ3JhZGVNb2R1bGUgPVxuICAgICAgICDJtWFuZ3VsYXIxLm1vZHVsZV8oybVjb25zdGFudHMuVVBHUkFERV9NT0RVTEVfTkFNRSwgW0lOSVRfTU9EVUxFX05BTUVdLmNvbmNhdChtb2R1bGVzKSk7XG5cbiAgICAvLyBNYWtlIHN1cmUgcmVzdW1lQm9vdHN0cmFwKCkgb25seSBleGlzdHMgaWYgdGhlIGN1cnJlbnQgYm9vdHN0cmFwIGlzIGRlZmVycmVkXG4gICAgY29uc3Qgd2luZG93QW5ndWxhciA9ICh3aW5kb3cgYXMgYW55KVsnYW5ndWxhciddO1xuICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gQm9vdHN0cmFwIHRoZSBBbmd1bGFySlMgYXBwbGljYXRpb24gaW5zaWRlIG91ciB6b25lXG4gICAgY29uc3QgcmV0dXJuVmFsdWUgPVxuICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gybVhbmd1bGFyMS5ib290c3RyYXAoZWxlbWVudCwgW3VwZ3JhZGVNb2R1bGUubmFtZV0sIGNvbmZpZykpO1xuXG4gICAgLy8gUGF0Y2ggcmVzdW1lQm9vdHN0cmFwKCkgdG8gcnVuIGluc2lkZSB0aGUgbmdab25lXG4gICAgaWYgKHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwO1xuICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5uZ1pvbmU7XG4gICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDtcbiAgICAgICAgcmV0dXJuIG5nWm9uZS5ydW4oKCkgPT4gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAuYXBwbHkodGhpcywgYXJncykpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH1cbn1cbiJdfQ==