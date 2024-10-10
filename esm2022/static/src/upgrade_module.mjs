/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
            .factory(ɵconstants.LAZY_MODULE_REF, [
            ɵconstants.INJECTOR_KEY,
            (injector) => ({ injector }),
        ])
            .config([
            ɵconstants.$PROVIDE,
            ɵconstants.$INJECTOR,
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
                        },
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
                            Object.keys(intervalDelegate).forEach((prop) => (wrappedInterval[prop] = intervalDelegate[prop]));
                            // the `flush` method will be present when ngMocks is used
                            if (intervalDelegate.hasOwnProperty('flush')) {
                                wrappedInterval['flush'] = () => {
                                    intervalDelegate['flush']();
                                    return wrappedInterval;
                                };
                            }
                            return wrappedInterval;
                        },
                    ]);
                }
            },
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
            },
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.8+sha-4746794", ngImport: i0, type: UpgradeModule, deps: [{ token: i0.Injector }, { token: i0.NgZone }, { token: i0.PlatformRef }], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.8+sha-4746794", ngImport: i0, type: UpgradeModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.8+sha-4746794", ngImport: i0, type: UpgradeModule, providers: [angular1Providers] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.8+sha-4746794", ngImport: i0, type: UpgradeModule, decorators: [{
            type: NgModule,
            args: [{ providers: [angular1Providers] }]
        }], ctorParameters: () => [{ type: i0.Injector }, { type: i0.NgZone }, { type: i0.PlatformRef }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFbkYsT0FBTyxFQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRXZELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzNFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7QUFFekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0SEc7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQVF4QjtJQUNFLHVEQUF1RDtJQUN2RCxRQUFrQjtJQUNsQixxREFBcUQ7SUFDOUMsTUFBYztJQUNyQjs7OztPQUlHO0lBQ0ssV0FBd0I7UUFOekIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQU1iLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBRWhDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILFNBQVMsQ0FDUCxPQUFnQixFQUNoQixVQUFvQixFQUFFLEVBQ3RCLE1BQVksQ0FBQyxtQ0FBbUM7UUFFaEQsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxD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LENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FDM0QsQ0FBQztRQUVGLG1EQUFtRDtRQUNuRCxJQUFJLGFBQWEsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNsQyxNQUFNLHVCQUF1QixHQUFlLGFBQWEsQ0FBQyxlQUFlLENBQUM7WUFDMUUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMzQixhQUFhLENBQUMsZUFBZSxHQUFHO2dCQUM5QixJQUFJLElBQUksR0FBRyxTQUFTLENBQUM7Z0JBQ3JCLGFBQWEsQ0FBQyxlQUFlLEdBQUcsdUJBQXVCLENBQUM7Z0JBQ3hELE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRSxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQzt5SEEzTVUsYUFBYTswSEFBYixhQUFhOzBIQUFiLGFBQWEsYUFESixDQUFDLGlCQUFpQixDQUFDOztzR0FDNUIsYUFBYTtrQkFEekIsUUFBUTttQkFBQyxFQUFDLFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5kZXYvbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIE5nTW9kdWxlLCBOZ1pvbmUsIFBsYXRmb3JtUmVmLCBUZXN0YWJpbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ybVhbmd1bGFyMSwgybVjb25zdGFudHMsIMm1dXRpbH0gZnJvbSAnLi4vY29tbW9uJztcblxuaW1wb3J0IHthbmd1bGFyMVByb3ZpZGVycywgc2V0VGVtcEluamVjdG9yUmVmfSBmcm9tICcuL2FuZ3VsYXIxX3Byb3ZpZGVycyc7XG5pbXBvcnQge05nQWRhcHRlckluamVjdG9yfSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFuIGBOZ01vZHVsZWAsIHdoaWNoIHlvdSBpbXBvcnQgdG8gcHJvdmlkZSBBbmd1bGFySlMgY29yZSBzZXJ2aWNlcyxcbiAqIGFuZCBoYXMgYW4gaW5zdGFuY2UgbWV0aG9kIHVzZWQgdG8gYm9vdHN0cmFwIHRoZSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZS9zdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBT1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhlIGB1cGdyYWRlL3N0YXRpY2AgcGFja2FnZSBjb250YWlucyBoZWxwZXJzIHRoYXQgYWxsb3cgQW5ndWxhckpTIGFuZCBBbmd1bGFyIGNvbXBvbmVudHNcbiAqIHRvIGJlIHVzZWQgdG9nZXRoZXIgaW5zaWRlIGEgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24sIHdoaWNoIHN1cHBvcnRzIEFPVCBjb21waWxhdGlvbi5cbiAqXG4gKiBTcGVjaWZpY2FsbHksIHRoZSBjbGFzc2VzIGFuZCBmdW5jdGlvbnMgaW4gdGhlIGB1cGdyYWRlL3N0YXRpY2AgbW9kdWxlIGFsbG93IHRoZSBmb2xsb3dpbmc6XG4gKlxuICogMS4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhciBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFySlMgY29tcG9uZW50IHNvXG4gKiAgICB0aGF0IGl0IGNhbiBiZSB1c2VkIGluIGFuIEFuZ3VsYXIgdGVtcGxhdGUuIFNlZSBgVXBncmFkZUNvbXBvbmVudGAuXG4gKiAyLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFySlMgZGlyZWN0aXZlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhckpTIHRlbXBsYXRlLiBTZWUgYGRvd25ncmFkZUNvbXBvbmVudGAuXG4gKiAzLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIHJvb3QgaW5qZWN0b3IgcHJvdmlkZXIgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFySlNcbiAqICAgIHNlcnZpY2Ugc28gdGhhdCBpdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBhbiBBbmd1bGFyIGNvbnRleHQuIFNlZVxuICogICAge0BsaW5rIFVwZ3JhZGVNb2R1bGUjdXBncmFkaW5nLWFuLWFuZ3VsYXItMS1zZXJ2aWNlIFVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZX0gYmVsb3cuXG4gKiA0LiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFySlMgc2VydmljZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXIgaW5qZWN0YWJsZVxuICogICAgc28gdGhhdCBpdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBhbiBBbmd1bGFySlMgY29udGV4dC4gU2VlIGBkb3duZ3JhZGVJbmplY3RhYmxlYC5cbiAqIDMuIEJvb3RzdHJhcHBpbmcgb2YgYSBoeWJyaWQgQW5ndWxhciBhcHBsaWNhdGlvbiB3aGljaCBjb250YWlucyBib3RoIG9mIHRoZSBmcmFtZXdvcmtzXG4gKiAgICBjb2V4aXN0aW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7VXBncmFkZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuICogYGBgXG4gKlxuICogU2VlIGFsc28gdGhlIHtAbGluayBVcGdyYWRlTW9kdWxlI2V4YW1wbGVzIGV4YW1wbGVzfSBiZWxvdy5cbiAqXG4gKiAjIyMgTWVudGFsIE1vZGVsXG4gKlxuICogV2hlbiByZWFzb25pbmcgYWJvdXQgaG93IGEgaHlicmlkIGFwcGxpY2F0aW9uIHdvcmtzIGl0IGlzIHVzZWZ1bCB0byBoYXZlIGEgbWVudGFsIG1vZGVsIHdoaWNoXG4gKiBkZXNjcmliZXMgd2hhdCBpcyBoYXBwZW5pbmcgYW5kIGV4cGxhaW5zIHdoYXQgaXMgaGFwcGVuaW5nIGF0IHRoZSBsb3dlc3QgbGV2ZWwuXG4gKlxuICogMS4gVGhlcmUgYXJlIHR3byBpbmRlcGVuZGVudCBmcmFtZXdvcmtzIHJ1bm5pbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24sIGVhY2ggZnJhbWV3b3JrIHRyZWF0c1xuICogICAgdGhlIG90aGVyIGFzIGEgYmxhY2sgYm94LlxuICogMi4gRWFjaCBET00gZWxlbWVudCBvbiB0aGUgcGFnZSBpcyBvd25lZCBleGFjdGx5IGJ5IG9uZSBmcmFtZXdvcmsuIFdoaWNoZXZlciBmcmFtZXdvcmtcbiAqICAgIGluc3RhbnRpYXRlZCB0aGUgZWxlbWVudCBpcyB0aGUgb3duZXIuIEVhY2ggZnJhbWV3b3JrIG9ubHkgdXBkYXRlcy9pbnRlcmFjdHMgd2l0aCBpdHMgb3duXG4gKiAgICBET00gZWxlbWVudHMgYW5kIGlnbm9yZXMgb3RoZXJzLlxuICogMy4gQW5ndWxhckpTIGRpcmVjdGl2ZXMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIHRoZSBBbmd1bGFySlMgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDQuIEFuZ3VsYXIgY29tcG9uZW50cyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXIgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDUuIEFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FuIGJlIFwidXBncmFkZWRcIlwiIHRvIGFuIEFuZ3VsYXIgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFyIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgVXBncmFkZUNvbXBvbmVudGAuXG4gKiA2LiBBbiBBbmd1bGFyIGNvbXBvbmVudCBjYW4gYmUgXCJkb3duZ3JhZGVkXCIgdG8gYW4gQW5ndWxhckpTIGNvbXBvbmVudC4gVGhpcyBpcyBhY2hpZXZlZCBieVxuICogICAgZGVmaW5pbmcgYW4gQW5ndWxhckpTIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhciBjb21wb25lbnQgYXQgaXRzIGxvY2F0aW9uXG4gKiAgICBpbiB0aGUgRE9NLiBTZWUgYGRvd25ncmFkZUNvbXBvbmVudGAuXG4gKiA3LiBXaGVuZXZlciBhbiBcInVwZ3JhZGVkXCIvXCJkb3duZ3JhZGVkXCIgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5XG4gKiAgICB0aGUgZnJhbWV3b3JrIGRvaW5nIHRoZSBpbnN0YW50aWF0aW9uLiBUaGUgb3RoZXIgZnJhbWV3b3JrIHRoZW4gaW5zdGFudGlhdGVzIGFuZCBvd25zIHRoZVxuICogICAgdmlldyBmb3IgdGhhdCBjb21wb25lbnQuXG4gKiAgICAxLiBUaGlzIGltcGxpZXMgdGhhdCB0aGUgY29tcG9uZW50IGJpbmRpbmdzIHdpbGwgYWx3YXlzIGZvbGxvdyB0aGUgc2VtYW50aWNzIG9mIHRoZVxuICogICAgICAgaW5zdGFudGlhdGlvbiBmcmFtZXdvcmsuXG4gKiAgICAyLiBUaGUgRE9NIGF0dHJpYnV0ZXMgYXJlIHBhcnNlZCBieSB0aGUgZnJhbWV3b3JrIHRoYXQgb3ducyB0aGUgY3VycmVudCB0ZW1wbGF0ZS4gU29cbiAqICAgICAgIGF0dHJpYnV0ZXMgaW4gQW5ndWxhckpTIHRlbXBsYXRlcyBtdXN0IHVzZSBrZWJhYi1jYXNlLCB3aGlsZSBBbmd1bGFySlMgdGVtcGxhdGVzIG11c3QgdXNlXG4gKiAgICAgICBjYW1lbENhc2UuXG4gKiAgICAzLiBIb3dldmVyIHRoZSB0ZW1wbGF0ZSBiaW5kaW5nIHN5bnRheCB3aWxsIGFsd2F5cyB1c2UgdGhlIEFuZ3VsYXIgc3R5bGUsIGUuZy4gc3F1YXJlXG4gKiAgICAgICBicmFja2V0cyAoYFsuLi5dYCkgZm9yIHByb3BlcnR5IGJpbmRpbmcuXG4gKiA4LiBBbmd1bGFyIGlzIGJvb3RzdHJhcHBlZCBmaXJzdDsgQW5ndWxhckpTIGlzIGJvb3RzdHJhcHBlZCBzZWNvbmQuIEFuZ3VsYXJKUyBhbHdheXMgb3ducyB0aGVcbiAqICAgIHJvb3QgY29tcG9uZW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqIDkuIFRoZSBuZXcgYXBwbGljYXRpb24gaXMgcnVubmluZyBpbiBhbiBBbmd1bGFyIHpvbmUsIGFuZCB0aGVyZWZvcmUgaXQgbm8gbG9uZ2VyIG5lZWRzIGNhbGxzIHRvXG4gKiAgICBgJGFwcGx5KClgLlxuICpcbiAqICMjIyBUaGUgYFVwZ3JhZGVNb2R1bGVgIGNsYXNzXG4gKlxuICogVGhpcyBjbGFzcyBpcyBhbiBgTmdNb2R1bGVgLCB3aGljaCB5b3UgaW1wb3J0IHRvIHByb3ZpZGUgQW5ndWxhckpTIGNvcmUgc2VydmljZXMsXG4gKiBhbmQgaGFzIGFuIGluc3RhbmNlIG1ldGhvZCB1c2VkIHRvIGJvb3RzdHJhcCB0aGUgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gKlxuICogKiBDb3JlIEFuZ3VsYXJKUyBzZXJ2aWNlczxiciAvPlxuICogICBJbXBvcnRpbmcgdGhpcyBgTmdNb2R1bGVgIHdpbGwgYWRkIHByb3ZpZGVycyBmb3IgdGhlIGNvcmVcbiAqICAgW0FuZ3VsYXJKUyBzZXJ2aWNlc10oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3NlcnZpY2UpIHRvIHRoZSByb290IGluamVjdG9yLlxuICpcbiAqICogQm9vdHN0cmFwPGJyIC8+XG4gKiAgIFRoZSBydW50aW1lIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgY29udGFpbnMgYSB7QGxpbmsgVXBncmFkZU1vZHVsZSNib290c3RyYXAgYGJvb3RzdHJhcCgpYH1cbiAqICAgbWV0aG9kLCB3aGljaCB5b3UgdXNlIHRvIGJvb3RzdHJhcCB0aGUgdG9wIGxldmVsIEFuZ3VsYXJKUyBtb2R1bGUgb250byBhbiBlbGVtZW50IGluIHRoZVxuICogICBET00gZm9yIHRoZSBoeWJyaWQgdXBncmFkZSBhcHAuXG4gKlxuICogICBJdCBhbHNvIGNvbnRhaW5zIHByb3BlcnRpZXMgdG8gYWNjZXNzIHRoZSB7QGxpbmsgVXBncmFkZU1vZHVsZSNpbmplY3RvciByb290IGluamVjdG9yfSwgdGhlXG4gKiAgIGJvb3RzdHJhcCBgTmdab25lYCBhbmQgdGhlXG4gKiAgIFtBbmd1bGFySlMgJGluamVjdG9yXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvYXV0by9zZXJ2aWNlLyRpbmplY3RvcikuXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogSW1wb3J0IHRoZSBgVXBncmFkZU1vZHVsZWAgaW50byB5b3VyIHRvcCBsZXZlbCB7QGxpbmsgTmdNb2R1bGUgQW5ndWxhciBgTmdNb2R1bGVgfS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPSduZzItbW9kdWxlJ31cbiAqXG4gKiBUaGVuIGluamVjdCBgVXBncmFkZU1vZHVsZWAgaW50byB5b3VyIEFuZ3VsYXIgYE5nTW9kdWxlYCBhbmQgdXNlIGl0IHRvIGJvb3RzdHJhcCB0aGUgdG9wIGxldmVsXG4gKiBbQW5ndWxhckpTIG1vZHVsZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvYW5ndWxhci5Nb2R1bGUpIGluIHRoZVxuICogYG5nRG9Cb290c3RyYXAoKWAgbWV0aG9kLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J2Jvb3RzdHJhcC1uZzEnfVxuICpcbiAqIEZpbmFsbHksIGtpY2sgb2ZmIHRoZSB3aG9sZSBwcm9jZXNzLCBieSBib290c3RyYXBwaW5nIHlvdXIgdG9wIGxldmVsIEFuZ3VsYXIgYE5nTW9kdWxlYC5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPSdib290c3RyYXAtbmcyJ31cbiAqXG4gKiB7QGEgdXBncmFkaW5nLWFuLWFuZ3VsYXItMS1zZXJ2aWNlfVxuICogIyMjIFVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZVxuICpcbiAqIFRoZXJlIGlzIG5vIHNwZWNpZmljIEFQSSBmb3IgdXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlLiBJbnN0ZWFkIHlvdSBzaG91bGQganVzdCBmb2xsb3cgdGhlXG4gKiBmb2xsb3dpbmcgcmVjaXBlOlxuICpcbiAqIExldCdzIHNheSB5b3UgaGF2ZSBhbiBBbmd1bGFySlMgc2VydmljZTpcbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLXRleHQtZm9ybWF0dGVyLXNlcnZpY2VcIn1cbiAqXG4gKiBUaGVuIHlvdSBzaG91bGQgZGVmaW5lIGFuIEFuZ3VsYXIgcHJvdmlkZXIgdG8gYmUgaW5jbHVkZWQgaW4geW91ciBgTmdNb2R1bGVgIGBwcm92aWRlcnNgXG4gKiBwcm9wZXJ0eS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwidXBncmFkZS1uZzEtc2VydmljZVwifVxuICpcbiAqIFRoZW4geW91IGNhbiB1c2UgdGhlIFwidXBncmFkZWRcIiBBbmd1bGFySlMgc2VydmljZSBieSBpbmplY3RpbmcgaXQgaW50byBhbiBBbmd1bGFyIGNvbXBvbmVudFxuICogb3Igc2VydmljZS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwidXNlLW5nMS11cGdyYWRlZC1zZXJ2aWNlXCJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ATmdNb2R1bGUoe3Byb3ZpZGVyczogW2FuZ3VsYXIxUHJvdmlkZXJzXX0pXG5leHBvcnQgY2xhc3MgVXBncmFkZU1vZHVsZSB7XG4gIC8qKlxuICAgKiBUaGUgQW5ndWxhckpTIGAkaW5qZWN0b3JgIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHB1YmxpYyAkaW5qZWN0b3I6IGFueSAvKmFuZ3VsYXIuSUluamVjdG9yU2VydmljZSovO1xuICAvKiogVGhlIEFuZ3VsYXIgSW5qZWN0b3IgKiovXG4gIHB1YmxpYyBpbmplY3RvcjogSW5qZWN0b3I7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgLyoqIFRoZSByb290IGBJbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLiAqL1xuICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAvKiogVGhlIGJvb3RzdHJhcCB6b25lIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbiAqL1xuICAgIHB1YmxpYyBuZ1pvbmU6IE5nWm9uZSxcbiAgICAvKipcbiAgICAgKiBUaGUgb3duaW5nIGBOZ01vZHVsZVJlZmBzIGBQbGF0Zm9ybVJlZmAgaW5zdGFuY2UuXG4gICAgICogVGhpcyBpcyB1c2VkIHRvIHRpZSB0aGUgbGlmZWN5Y2xlIG9mIHRoZSBib290c3RyYXBwZWQgQW5ndWxhckpTIGFwcHMgdG8gdGhhdCBvZiB0aGUgQW5ndWxhclxuICAgICAqIGBQbGF0Zm9ybVJlZmAuXG4gICAgICovXG4gICAgcHJpdmF0ZSBwbGF0Zm9ybVJlZjogUGxhdGZvcm1SZWYsXG4gICkge1xuICAgIHRoaXMuaW5qZWN0b3IgPSBuZXcgTmdBZGFwdGVySW5qZWN0b3IoaW5qZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJvb3RzdHJhcCBhbiBBbmd1bGFySlMgYXBwbGljYXRpb24gZnJvbSB0aGlzIE5nTW9kdWxlXG4gICAqIEBwYXJhbSBlbGVtZW50IHRoZSBlbGVtZW50IG9uIHdoaWNoIHRvIGJvb3RzdHJhcCB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSBbbW9kdWxlc10gdGhlIEFuZ3VsYXJKUyBtb2R1bGVzIHRvIGJvb3RzdHJhcCBmb3IgdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gW2NvbmZpZ10gb3B0aW9uYWwgZXh0cmEgQW5ndWxhckpTIGJvb3RzdHJhcCBjb25maWd1cmF0aW9uXG4gICAqIEByZXR1cm4gVGhlIHZhbHVlIHJldHVybmVkIGJ5XG4gICAqICAgICBbYW5ndWxhci5ib290c3RyYXAoKV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL2Z1bmN0aW9uL2FuZ3VsYXIuYm9vdHN0cmFwKS5cbiAgICovXG4gIGJvb3RzdHJhcChcbiAgICBlbGVtZW50OiBFbGVtZW50LFxuICAgIG1vZHVsZXM6IHN0cmluZ1tdID0gW10sXG4gICAgY29uZmlnPzogYW55IC8qYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyovLFxuICApOiBhbnkgLypSZXR1cm5UeXBlPHR5cGVvZiBhbmd1bGFyLmJvb3RzdHJhcD4qLyB7XG4gICAgY29uc3QgSU5JVF9NT0RVTEVfTkFNRSA9IMm1Y29uc3RhbnRzLlVQR1JBREVfTU9EVUxFX05BTUUgKyAnLmluaXQnO1xuXG4gICAgLy8gQ3JlYXRlIGFuIG5nMSBtb2R1bGUgdG8gYm9vdHN0cmFwXG4gICAgybVhbmd1bGFyMVxuICAgICAgLm1vZHVsZV8oSU5JVF9NT0RVTEVfTkFNRSwgW10pXG5cbiAgICAgIC5jb25zdGFudCjJtWNvbnN0YW50cy5VUEdSQURFX0FQUF9UWVBFX0tFWSwgybV1dGlsLlVwZ3JhZGVBcHBUeXBlLlN0YXRpYylcblxuICAgICAgLnZhbHVlKMm1Y29uc3RhbnRzLklOSkVDVE9SX0tFWSwgdGhpcy5pbmplY3RvcilcblxuICAgICAgLmZhY3RvcnkoybVjb25zdGFudHMuTEFaWV9NT0RVTEVfUkVGLCBbXG4gICAgICAgIMm1Y29uc3RhbnRzLklOSkVDVE9SX0tFWSxcbiAgICAgICAgKGluamVjdG9yOiBJbmplY3RvcikgPT4gKHtpbmplY3Rvcn0pIGFzIMm1dXRpbC5MYXp5TW9kdWxlUmVmLFxuICAgICAgXSlcblxuICAgICAgLmNvbmZpZyhbXG4gICAgICAgIMm1Y29uc3RhbnRzLiRQUk9WSURFLFxuICAgICAgICDJtWNvbnN0YW50cy4kSU5KRUNUT1IsXG4gICAgICAgICgkcHJvdmlkZTogybVhbmd1bGFyMS5JUHJvdmlkZVNlcnZpY2UsICRpbmplY3RvcjogybVhbmd1bGFyMS5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoybVjb25zdGFudHMuJCRURVNUQUJJTElUWSkpIHtcbiAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcijJtWNvbnN0YW50cy4kJFRFU1RBQklMSVRZLCBbXG4gICAgICAgICAgICAgIMm1Y29uc3RhbnRzLiRERUxFR0FURSxcbiAgICAgICAgICAgICAgKHRlc3RhYmlsaXR5RGVsZWdhdGU6IMm1YW5ndWxhcjEuSVRlc3RhYmlsaXR5U2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsV2hlblN0YWJsZTogRnVuY3Rpb24gPSB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLmluamVjdG9yO1xuICAgICAgICAgICAgICAgIC8vIENhbm5vdCB1c2UgYXJyb3cgZnVuY3Rpb24gYmVsb3cgYmVjYXVzZSB3ZSBuZWVkIHRoZSBjb250ZXh0XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3V2hlblN0YWJsZSA9IGZ1bmN0aW9uIChjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgIG9yaWdpbmFsV2hlblN0YWJsZS5jYWxsKHRlc3RhYmlsaXR5RGVsZWdhdGUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID0gaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5nMlRlc3RhYmlsaXR5LmlzU3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIG5nMlRlc3RhYmlsaXR5LndoZW5TdGFibGUobmV3V2hlblN0YWJsZS5iaW5kKHRlc3RhYmlsaXR5RGVsZWdhdGUsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGUgPSBuZXdXaGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoybVjb25zdGFudHMuJElOVEVSVkFMKSkge1xuICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKMm1Y29uc3RhbnRzLiRJTlRFUlZBTCwgW1xuICAgICAgICAgICAgICDJtWNvbnN0YW50cy4kREVMRUdBVEUsXG4gICAgICAgICAgICAgIChpbnRlcnZhbERlbGVnYXRlOiDJtWFuZ3VsYXIxLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBXcmFwIHRoZSAkaW50ZXJ2YWwgc2VydmljZSBzbyB0aGF0IHNldEludGVydmFsIGlzIGNhbGxlZCBvdXRzaWRlIE5nWm9uZSxcbiAgICAgICAgICAgICAgICAvLyBidXQgdGhlIGNhbGxiYWNrIGlzIHN0aWxsIGludm9rZWQgd2l0aGluIGl0LiBUaGlzIGlzIHNvIHRoYXQgJGludGVydmFsXG4gICAgICAgICAgICAgICAgLy8gd29uJ3QgYmxvY2sgc3RhYmlsaXR5LCB3aGljaCBwcmVzZXJ2ZXMgdGhlIGJlaGF2aW9yIGZyb20gQW5ndWxhckpTLlxuICAgICAgICAgICAgICAgIGxldCB3cmFwcGVkSW50ZXJ2YWwgPSAoXG4gICAgICAgICAgICAgICAgICBmbjogRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICBkZWxheTogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgY291bnQ/OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICBpbnZva2VBcHBseT86IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAuLi5wYXNzOiBhbnlbXVxuICAgICAgICAgICAgICAgICkgPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsRGVsZWdhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSdW4gY2FsbGJhY2sgaW4gdGhlIG5leHQgVk0gdHVybiAtICRpbnRlcnZhbCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kYXBwbHksIGFuZCBydW5uaW5nIHRoZSBjYWxsYmFjayBpbiBOZ1pvbmUgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2F1c2UgYSAnJGRpZ2VzdCBhbHJlYWR5IGluIHByb2dyZXNzJyBlcnJvciBpZiBpdCdzIGluIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2FtZSB2bSB0dXJuLlxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiBmbiguLi5hcmdzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIGRlbGF5LFxuICAgICAgICAgICAgICAgICAgICAgIGNvdW50LFxuICAgICAgICAgICAgICAgICAgICAgIGludm9rZUFwcGx5LFxuICAgICAgICAgICAgICAgICAgICAgIC4uLnBhc3MsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgKE9iamVjdC5rZXlzKGludGVydmFsRGVsZWdhdGUpIGFzIChrZXlvZiDJtWFuZ3VsYXIxLklJbnRlcnZhbFNlcnZpY2UpW10pLmZvckVhY2goXG4gICAgICAgICAgICAgICAgICAocHJvcCkgPT4gKCh3cmFwcGVkSW50ZXJ2YWwgYXMgYW55KVtwcm9wXSA9IGludGVydmFsRGVsZWdhdGVbcHJvcF0pLFxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAvLyB0aGUgYGZsdXNoYCBtZXRob2Qgd2lsbCBiZSBwcmVzZW50IHdoZW4gbmdNb2NrcyBpcyB1c2VkXG4gICAgICAgICAgICAgICAgaWYgKGludGVydmFsRGVsZWdhdGUuaGFzT3duUHJvcGVydHkoJ2ZsdXNoJykpIHtcbiAgICAgICAgICAgICAgICAgICh3cmFwcGVkSW50ZXJ2YWwgYXMgYW55KVsnZmx1c2gnXSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgKGludGVydmFsRGVsZWdhdGUgYXMgYW55KVsnZmx1c2gnXSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlZEludGVydmFsO1xuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlZEludGVydmFsO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgXSlcblxuICAgICAgLnJ1bihbXG4gICAgICAgIMm1Y29uc3RhbnRzLiRJTkpFQ1RPUixcbiAgICAgICAgKCRpbmplY3RvcjogybVhbmd1bGFyMS5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgdGhpcy4kaW5qZWN0b3IgPSAkaW5qZWN0b3I7XG4gICAgICAgICAgY29uc3QgJHJvb3RTY29wZSA9ICRpbmplY3Rvci5nZXQoJyRyb290U2NvcGUnKTtcblxuICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIG5nMSAkaW5qZWN0b3IgcHJvdmlkZXJcbiAgICAgICAgICBzZXRUZW1wSW5qZWN0b3JSZWYoJGluamVjdG9yKTtcbiAgICAgICAgICB0aGlzLmluamVjdG9yLmdldCjJtWNvbnN0YW50cy4kSU5KRUNUT1IpO1xuXG4gICAgICAgICAgLy8gUHV0IHRoZSBpbmplY3RvciBvbiB0aGUgRE9NLCBzbyB0aGF0IGl0IGNhbiBiZSBcInJlcXVpcmVkXCJcbiAgICAgICAgICDJtWFuZ3VsYXIxLmVsZW1lbnQoZWxlbWVudCkuZGF0YSEoXG4gICAgICAgICAgICDJtXV0aWwuY29udHJvbGxlcktleSjJtWNvbnN0YW50cy5JTkpFQ1RPUl9LRVkpLFxuICAgICAgICAgICAgdGhpcy5pbmplY3RvcixcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgLy8gRGVzdHJveSB0aGUgQW5ndWxhckpTIGFwcCBvbmNlIHRoZSBBbmd1bGFyIGBQbGF0Zm9ybVJlZmAgaXMgZGVzdHJveWVkLlxuICAgICAgICAgIC8vIFRoaXMgZG9lcyBub3QgaGFwcGVuIGluIGEgdHlwaWNhbCBTUEEgc2NlbmFyaW8sIGJ1dCBpdCBtaWdodCBiZSB1c2VmdWwgZm9yXG4gICAgICAgICAgLy8gb3RoZXIgdXNlLWNhc2VzIHdoZXJlIGRpc3Bvc2luZyBvZiBhbiBBbmd1bGFyL0FuZ3VsYXJKUyBhcHAgaXMgbmVjZXNzYXJ5XG4gICAgICAgICAgLy8gKHN1Y2ggYXMgSG90IE1vZHVsZSBSZXBsYWNlbWVudCAoSE1SKSkuXG4gICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzM5OTM1LlxuICAgICAgICAgIHRoaXMucGxhdGZvcm1SZWYub25EZXN0cm95KCgpID0+IMm1dXRpbC5kZXN0cm95QXBwKCRpbmplY3RvcikpO1xuXG4gICAgICAgICAgLy8gV2lyZSB1cCB0aGUgbmcxIHJvb3RTY29wZSB0byBydW4gYSBkaWdlc3QgY3ljbGUgd2hlbmV2ZXIgdGhlIHpvbmUgc2V0dGxlc1xuICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZG8gdGhpcyBpbiB0aGUgbmV4dCB0aWNrIHNvIHRoYXQgd2UgZG9uJ3QgcHJldmVudCB0aGUgYm9vdHVwIHN0YWJpbGl6aW5nXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLm5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICgkcm9vdFNjb3BlLiQkcGhhc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICdBIGRpZ2VzdCB3YXMgdHJpZ2dlcmVkIHdoaWxlIG9uZSB3YXMgYWxyZWFkeSBpbiBwcm9ncmVzcy4gVGhpcyBtYXkgbWVhbiB0aGF0IHNvbWV0aGluZyBpcyB0cmlnZ2VyaW5nIGRpZ2VzdHMgb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lLicsXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiAkcm9vdFNjb3BlLiRldmFsQXN5bmMoKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHJldHVybiAkcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9LFxuICAgICAgXSk7XG5cbiAgICBjb25zdCB1cGdyYWRlTW9kdWxlID0gybVhbmd1bGFyMS5tb2R1bGVfKFxuICAgICAgybVjb25zdGFudHMuVVBHUkFERV9NT0RVTEVfTkFNRSxcbiAgICAgIFtJTklUX01PRFVMRV9OQU1FXS5jb25jYXQobW9kdWxlcyksXG4gICAgKTtcblxuICAgIC8vIE1ha2Ugc3VyZSByZXN1bWVCb290c3RyYXAoKSBvbmx5IGV4aXN0cyBpZiB0aGUgY3VycmVudCBib290c3RyYXAgaXMgZGVmZXJyZWRcbiAgICBjb25zdCB3aW5kb3dBbmd1bGFyID0gKHdpbmRvdyBhcyBhbnkpWydhbmd1bGFyJ107XG4gICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBCb290c3RyYXAgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiBpbnNpZGUgb3VyIHpvbmVcbiAgICBjb25zdCByZXR1cm5WYWx1ZSA9IHRoaXMubmdab25lLnJ1bigoKSA9PlxuICAgICAgybVhbmd1bGFyMS5ib290c3RyYXAoZWxlbWVudCwgW3VwZ3JhZGVNb2R1bGUubmFtZV0sIGNvbmZpZyksXG4gICAgKTtcblxuICAgIC8vIFBhdGNoIHJlc3VtZUJvb3RzdHJhcCgpIHRvIHJ1biBpbnNpZGUgdGhlIG5nWm9uZVxuICAgIGlmICh3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCkge1xuICAgICAgY29uc3Qgb3JpZ2luYWxSZXN1bWVCb290c3RyYXA6ICgpID0+IHZvaWQgPSB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcDtcbiAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMubmdab25lO1xuICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICByZXR1cm4gbmdab25lLnJ1bigoKSA9PiB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcC5hcHBseSh0aGlzLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxufVxuIl19