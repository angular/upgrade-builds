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
UpgradeModule.decorators = [
    { type: NgModule, args: [{ providers: [angular1Providers] },] }
];
UpgradeModule.ctorParameters = () => [
    { type: Injector },
    { type: NgZone },
    { type: PlatformRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTlGLE9BQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxJQUFJLGNBQWMsRUFBNEUsT0FBTyxJQUFJLGFBQWEsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3ZMLE9BQU8sRUFBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNsTCxPQUFPLEVBQUMsYUFBYSxFQUFFLFVBQVUsRUFBZ0MsTUFBTSwyQkFBMkIsQ0FBQztBQUVuRyxPQUFPLEVBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUMzRSxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFJekM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0SEc7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQVF4QjtJQUNJLHVEQUF1RDtJQUN2RCxRQUFrQjtJQUNsQixxREFBcUQ7SUFDOUMsTUFBYztJQUNyQjs7OztPQUlHO0lBQ0ssV0FBd0I7UUFOekIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQU1iLGdCQUFX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QXVCLEdBQWUsYUFBYSxDQUFDLGVBQWUsQ0FBQztZQUMxRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzNCLGFBQWEsQ0FBQyxlQUFlLEdBQUc7Z0JBQzlCLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQztnQkFDckIsYUFBYSxDQUFDLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQztnQkFDeEQsT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNFLENBQUMsQ0FBQztTQUNIO0lBQ0gsQ0FBQzs7O1lBL0tGLFFBQVEsU0FBQyxFQUFDLFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUM7OztZQXhJbEMsUUFBUTtZQUF1QixNQUFNO1lBQUUsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBpc0Rldk1vZGUsIE5nTW9kdWxlLCBOZ1pvbmUsIFBsYXRmb3JtUmVmLCBUZXN0YWJpbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Ym9vdHN0cmFwLCBlbGVtZW50IGFzIGFuZ3VsYXJFbGVtZW50LCBJSW5qZWN0b3JTZXJ2aWNlLCBJSW50ZXJ2YWxTZXJ2aWNlLCBJUHJvdmlkZVNlcnZpY2UsIElUZXN0YWJpbGl0eVNlcnZpY2UsIG1vZHVsZV8gYXMgYW5ndWxhck1vZHVsZX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvYW5ndWxhcjEnO1xuaW1wb3J0IHskJFRFU1RBQklMSVRZLCAkREVMRUdBVEUsICRJTkpFQ1RPUiwgJElOVEVSVkFMLCAkUFJPVklERSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFVQR1JBREVfQVBQX1RZUEVfS0VZLCBVUEdSQURFX01PRFVMRV9OQU1FfSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy9jb25zdGFudHMnO1xuaW1wb3J0IHtjb250cm9sbGVyS2V5LCBkZXN0cm95QXBwLCBMYXp5TW9kdWxlUmVmLCBVcGdyYWRlQXBwVHlwZX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvdXRpbCc7XG5cbmltcG9ydCB7YW5ndWxhcjFQcm92aWRlcnMsIHNldFRlbXBJbmplY3RvclJlZn0gZnJvbSAnLi9hbmd1bGFyMV9wcm92aWRlcnMnO1xuaW1wb3J0IHtOZ0FkYXB0ZXJJbmplY3Rvcn0gZnJvbSAnLi91dGlsJztcblxuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYE5nTW9kdWxlYCwgd2hpY2ggeW91IGltcG9ydCB0byBwcm92aWRlIEFuZ3VsYXJKUyBjb3JlIHNlcnZpY2VzLFxuICogYW5kIGhhcyBhbiBpbnN0YW5jZSBtZXRob2QgdXNlZCB0byBib290c3RyYXAgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlL3N0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFPVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGUgYHVwZ3JhZGUvc3RhdGljYCBwYWNrYWdlIGNvbnRhaW5zIGhlbHBlcnMgdGhhdCBhbGxvdyBBbmd1bGFySlMgYW5kIEFuZ3VsYXIgY29tcG9uZW50c1xuICogdG8gYmUgdXNlZCB0b2dldGhlciBpbnNpZGUgYSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbiwgd2hpY2ggc3VwcG9ydHMgQU9UIGNvbXBpbGF0aW9uLlxuICpcbiAqIFNwZWNpZmljYWxseSwgdGhlIGNsYXNzZXMgYW5kIGZ1bmN0aW9ucyBpbiB0aGUgYHVwZ3JhZGUvc3RhdGljYCBtb2R1bGUgYWxsb3cgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAxLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhciB0ZW1wbGF0ZS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDIuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFyIGNvbXBvbmVudCBzb1xuICogICAgdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiBhbiBBbmd1bGFySlMgdGVtcGxhdGUuIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDMuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXIgcm9vdCBpbmplY3RvciBwcm92aWRlciB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKU1xuICogICAgc2VydmljZSBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXIgY29udGV4dC4gU2VlXG4gKiAgICB7QGxpbmsgVXBncmFkZU1vZHVsZSN1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2UgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlfSBiZWxvdy5cbiAqIDQuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBpbmplY3RhYmxlXG4gKiAgICBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXJKUyBjb250ZXh0LiBTZWUgYGRvd25ncmFkZUluamVjdGFibGVgLlxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG4gKiBgYGBcbiAqXG4gKiBTZWUgYWxzbyB0aGUge0BsaW5rIFVwZ3JhZGVNb2R1bGUjZXhhbXBsZXMgZXhhbXBsZXN9IGJlbG93LlxuICpcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXJKUyBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSB0aGUgQW5ndWxhciBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNS4gQW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYW4gYmUgXCJ1cGdyYWRlZFwiXCIgdG8gYW4gQW5ndWxhciBjb21wb25lbnQuIFRoaXMgaXMgYWNoaWV2ZWQgYnlcbiAqICAgIGRlZmluaW5nIGFuIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGF0IGl0cyBsb2NhdGlvblxuICogICAgaW4gdGhlIERPTS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDYuIEFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbiBiZSBcImRvd25ncmFkZWRcIiB0byBhbiBBbmd1bGFySlMgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFySlMgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFyIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDcuIFdoZW5ldmVyIGFuIFwidXBncmFkZWRcIi9cImRvd25ncmFkZWRcIiBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnlcbiAqICAgIHRoZSBmcmFtZXdvcmsgZG9pbmcgdGhlIGluc3RhbnRpYXRpb24uIFRoZSBvdGhlciBmcmFtZXdvcmsgdGhlbiBpbnN0YW50aWF0ZXMgYW5kIG93bnMgdGhlXG4gKiAgICB2aWV3IGZvciB0aGF0IGNvbXBvbmVudC5cbiAqICAgIDEuIFRoaXMgaW1wbGllcyB0aGF0IHRoZSBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay5cbiAqICAgIDIuIFRoZSBET00gYXR0cmlidXRlcyBhcmUgcGFyc2VkIGJ5IHRoZSBmcmFtZXdvcmsgdGhhdCBvd25zIHRoZSBjdXJyZW50IHRlbXBsYXRlLiBTb1xuICogICAgICAgYXR0cmlidXRlcyBpbiBBbmd1bGFySlMgdGVtcGxhdGVzIG11c3QgdXNlIGtlYmFiLWNhc2UsIHdoaWxlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMgbXVzdCB1c2VcbiAqICAgICAgIGNhbWVsQ2FzZS5cbiAqICAgIDMuIEhvd2V2ZXIgdGhlIHRlbXBsYXRlIGJpbmRpbmcgc3ludGF4IHdpbGwgYWx3YXlzIHVzZSB0aGUgQW5ndWxhciBzdHlsZSwgZS5nLiBzcXVhcmVcbiAqICAgICAgIGJyYWNrZXRzIChgWy4uLl1gKSBmb3IgcHJvcGVydHkgYmluZGluZy5cbiAqIDguIEFuZ3VsYXIgaXMgYm9vdHN0cmFwcGVkIGZpcnN0OyBBbmd1bGFySlMgaXMgYm9vdHN0cmFwcGVkIHNlY29uZC4gQW5ndWxhckpTIGFsd2F5cyBvd25zIHRoZVxuICogICAgcm9vdCBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGFuIEFuZ3VsYXIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHMgdG9cbiAqICAgIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIFRoZSBgVXBncmFkZU1vZHVsZWAgY2xhc3NcbiAqXG4gKiBUaGlzIGNsYXNzIGlzIGFuIGBOZ01vZHVsZWAsIHdoaWNoIHlvdSBpbXBvcnQgdG8gcHJvdmlkZSBBbmd1bGFySlMgY29yZSBzZXJ2aWNlcyxcbiAqIGFuZCBoYXMgYW4gaW5zdGFuY2UgbWV0aG9kIHVzZWQgdG8gYm9vdHN0cmFwIHRoZSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAqIENvcmUgQW5ndWxhckpTIHNlcnZpY2VzXG4gKiAgIEltcG9ydGluZyB0aGlzIGBOZ01vZHVsZWAgd2lsbCBhZGQgcHJvdmlkZXJzIGZvciB0aGUgY29yZVxuICogICBbQW5ndWxhckpTIHNlcnZpY2VzXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZSkgdG8gdGhlIHJvb3QgaW5qZWN0b3IuXG4gKlxuICogKiBCb290c3RyYXBcbiAqICAgVGhlIHJ1bnRpbWUgaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcyBjb250YWlucyBhIHtAbGluayBVcGdyYWRlTW9kdWxlI2Jvb3RzdHJhcCBgYm9vdHN0cmFwKClgfVxuICogICBtZXRob2QsIHdoaWNoIHlvdSB1c2UgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWwgQW5ndWxhckpTIG1vZHVsZSBvbnRvIGFuIGVsZW1lbnQgaW4gdGhlXG4gKiAgIERPTSBmb3IgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcC5cbiAqXG4gKiAgIEl0IGFsc28gY29udGFpbnMgcHJvcGVydGllcyB0byBhY2Nlc3MgdGhlIHtAbGluayBVcGdyYWRlTW9kdWxlI2luamVjdG9yIHJvb3QgaW5qZWN0b3J9LCB0aGVcbiAqICAgYm9vdHN0cmFwIGBOZ1pvbmVgIGFuZCB0aGVcbiAqICAgW0FuZ3VsYXJKUyAkaW5qZWN0b3JdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9hdXRvL3NlcnZpY2UvJGluamVjdG9yKS5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBJbXBvcnQgdGhlIGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgdG9wIGxldmVsIHtAbGluayBOZ01vZHVsZSBBbmd1bGFyIGBOZ01vZHVsZWB9LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J25nMi1tb2R1bGUnfVxuICpcbiAqIFRoZW4gaW5qZWN0IGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgQW5ndWxhciBgTmdNb2R1bGVgIGFuZCB1c2UgaXQgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWxcbiAqIFtBbmd1bGFySlMgbW9kdWxlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS9hbmd1bGFyLk1vZHVsZSkgaW4gdGhlXG4gKiBgbmdEb0Jvb3RzdHJhcCgpYCBtZXRob2QuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMSd9XG4gKlxuICogRmluYWxseSwga2ljayBvZmYgdGhlIHdob2xlIHByb2Nlc3MsIGJ5IGJvb3RzdHJhcHBpbmcgeW91ciB0b3AgbGV2ZWwgQW5ndWxhciBgTmdNb2R1bGVgLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J2Jvb3RzdHJhcC1uZzInfVxuICpcbiAqIHtAYSB1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2V9XG4gKiAjIyMgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlXG4gKlxuICogVGhlcmUgaXMgbm8gc3BlY2lmaWMgQVBJIGZvciB1cGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2UuIEluc3RlYWQgeW91IHNob3VsZCBqdXN0IGZvbGxvdyB0aGVcbiAqIGZvbGxvd2luZyByZWNpcGU6XG4gKlxuICogTGV0J3Mgc2F5IHlvdSBoYXZlIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlOlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtdGV4dC1mb3JtYXR0ZXItc2VydmljZVwifVxuICpcbiAqIFRoZW4geW91IHNob3VsZCBkZWZpbmUgYW4gQW5ndWxhciBwcm92aWRlciB0byBiZSBpbmNsdWRlZCBpbiB5b3VyIGBOZ01vZHVsZWAgYHByb3ZpZGVyc2BcbiAqIHByb3BlcnR5LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJ1cGdyYWRlLW5nMS1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3UgY2FuIHVzZSB0aGUgXCJ1cGdyYWRlZFwiIEFuZ3VsYXJKUyBzZXJ2aWNlIGJ5IGluamVjdGluZyBpdCBpbnRvIGFuIEFuZ3VsYXIgY29tcG9uZW50XG4gKiBvciBzZXJ2aWNlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJ1c2UtbmcxLXVwZ3JhZGVkLXNlcnZpY2VcIn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7cHJvdmlkZXJzOiBbYW5ndWxhcjFQcm92aWRlcnNdfSlcbmV4cG9ydCBjbGFzcyBVcGdyYWRlTW9kdWxlIHtcbiAgLyoqXG4gICAqIFRoZSBBbmd1bGFySlMgYCRpbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljICRpbmplY3RvcjogYW55IC8qYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKi87XG4gIC8qKiBUaGUgQW5ndWxhciBJbmplY3RvciAqKi9cbiAgcHVibGljIGluamVjdG9yOiBJbmplY3RvcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBUaGUgcm9vdCBgSW5qZWN0b3JgIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi4gKi9cbiAgICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgIC8qKiBUaGUgYm9vdHN0cmFwIHpvbmUgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uICovXG4gICAgICBwdWJsaWMgbmdab25lOiBOZ1pvbmUsXG4gICAgICAvKipcbiAgICAgICAqIFRoZSBvd25pbmcgYE5nTW9kdWxlUmVmYHMgYFBsYXRmb3JtUmVmYCBpbnN0YW5jZS5cbiAgICAgICAqIFRoaXMgaXMgdXNlZCB0byB0aWUgdGhlIGxpZmVjeWNsZSBvZiB0aGUgYm9vdHN0cmFwcGVkIEFuZ3VsYXJKUyBhcHBzIHRvIHRoYXQgb2YgdGhlIEFuZ3VsYXJcbiAgICAgICAqIGBQbGF0Zm9ybVJlZmAuXG4gICAgICAgKi9cbiAgICAgIHByaXZhdGUgcGxhdGZvcm1SZWY6IFBsYXRmb3JtUmVmKSB7XG4gICAgdGhpcy5pbmplY3RvciA9IG5ldyBOZ0FkYXB0ZXJJbmplY3RvcihpbmplY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQm9vdHN0cmFwIGFuIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiBmcm9tIHRoaXMgTmdNb2R1bGVcbiAgICogQHBhcmFtIGVsZW1lbnQgdGhlIGVsZW1lbnQgb24gd2hpY2ggdG8gYm9vdHN0cmFwIHRoZSBBbmd1bGFySlMgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIFttb2R1bGVzXSB0aGUgQW5ndWxhckpTIG1vZHVsZXMgdG8gYm9vdHN0cmFwIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSBbY29uZmlnXSBvcHRpb25hbCBleHRyYSBBbmd1bGFySlMgYm9vdHN0cmFwIGNvbmZpZ3VyYXRpb25cbiAgICovXG4gIGJvb3RzdHJhcChcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQsIG1vZHVsZXM6IHN0cmluZ1tdID0gW10sIGNvbmZpZz86IGFueSAvKmFuZ3VsYXIuSUFuZ3VsYXJCb290c3RyYXBDb25maWcqLykge1xuICAgIGNvbnN0IElOSVRfTU9EVUxFX05BTUUgPSBVUEdSQURFX01PRFVMRV9OQU1FICsgJy5pbml0JztcblxuICAgIC8vIENyZWF0ZSBhbiBuZzEgbW9kdWxlIHRvIGJvb3RzdHJhcFxuICAgIGFuZ3VsYXJNb2R1bGUoSU5JVF9NT0RVTEVfTkFNRSwgW10pXG5cbiAgICAgICAgLmNvbnN0YW50KFVQR1JBREVfQVBQX1RZUEVfS0VZLCBVcGdyYWRlQXBwVHlwZS5TdGF0aWMpXG5cbiAgICAgICAgLnZhbHVlKElOSkVDVE9SX0tFWSwgdGhpcy5pbmplY3RvcilcblxuICAgICAgICAuZmFjdG9yeShcbiAgICAgICAgICAgIExBWllfTU9EVUxFX1JFRiwgW0lOSkVDVE9SX0tFWSwgKGluamVjdG9yOiBJbmplY3RvcikgPT4gKHtpbmplY3Rvcn0gYXMgTGF6eU1vZHVsZVJlZildKVxuXG4gICAgICAgIC5jb25maWcoW1xuICAgICAgICAgICRQUk9WSURFLCAkSU5KRUNUT1IsXG4gICAgICAgICAgKCRwcm92aWRlOiBJUHJvdmlkZVNlcnZpY2UsICRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJCRURVNUQUJJTElUWSkpIHtcbiAgICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCQkVEVTVEFCSUxJVFksIFtcbiAgICAgICAgICAgICAgICAkREVMRUdBVEUsXG4gICAgICAgICAgICAgICAgKHRlc3RhYmlsaXR5RGVsZWdhdGU6IElUZXN0YWJpbGl0eVNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsV2hlblN0YWJsZTogRnVuY3Rpb24gPSB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgICBjb25zdCBpbmplY3RvciA9IHRoaXMuaW5qZWN0b3I7XG4gICAgICAgICAgICAgICAgICAvLyBDYW5ub3QgdXNlIGFycm93IGZ1bmN0aW9uIGJlbG93IGJlY2F1c2Ugd2UgbmVlZCB0aGUgY29udGV4dFxuICAgICAgICAgICAgICAgICAgY29uc3QgbmV3V2hlblN0YWJsZSA9IGZ1bmN0aW9uKGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFdoZW5TdGFibGUuY2FsbCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZzJUZXN0YWJpbGl0eTogVGVzdGFiaWxpdHkgPSBpbmplY3Rvci5nZXQoVGVzdGFiaWxpdHkpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChuZzJUZXN0YWJpbGl0eS5pc1N0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZzJUZXN0YWJpbGl0eS53aGVuU3RhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1doZW5TdGFibGUuYmluZCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBjYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGUgPSBuZXdXaGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlc3RhYmlsaXR5RGVsZWdhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJElOVEVSVkFMKSkge1xuICAgICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJElOVEVSVkFMLCBbXG4gICAgICAgICAgICAgICAgJERFTEVHQVRFLFxuICAgICAgICAgICAgICAgIChpbnRlcnZhbERlbGVnYXRlOiBJSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvLyBXcmFwIHRoZSAkaW50ZXJ2YWwgc2VydmljZSBzbyB0aGF0IHNldEludGVydmFsIGlzIGNhbGxlZCBvdXRzaWRlIE5nWm9uZSxcbiAgICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGUgY2FsbGJhY2sgaXMgc3RpbGwgaW52b2tlZCB3aXRoaW4gaXQuIFRoaXMgaXMgc28gdGhhdCAkaW50ZXJ2YWxcbiAgICAgICAgICAgICAgICAgIC8vIHdvbid0IGJsb2NrIHN0YWJpbGl0eSwgd2hpY2ggcHJlc2VydmVzIHRoZSBiZWhhdmlvciBmcm9tIEFuZ3VsYXJKUy5cbiAgICAgICAgICAgICAgICAgIGxldCB3cmFwcGVkSW50ZXJ2YWwgPVxuICAgICAgICAgICAgICAgICAgICAgIChmbjogRnVuY3Rpb24sIGRlbGF5OiBudW1iZXIsIGNvdW50PzogbnVtYmVyLCBpbnZva2VBcHBseT86IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgIC4uLnBhc3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW50ZXJ2YWxEZWxlZ2F0ZSgoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSdW4gY2FsbGJhY2sgaW4gdGhlIG5leHQgVk0gdHVybiAtICRpbnRlcnZhbCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGFwcGx5LCBhbmQgcnVubmluZyB0aGUgY2FsbGJhY2sgaW4gTmdab25lIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXVzZSBhICckZGlnZXN0IGFscmVhZHkgaW4gcHJvZ3Jlc3MnIGVycm9yIGlmIGl0J3MgaW4gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2FtZSB2bSB0dXJuLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IGZuKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXksIGNvdW50LCBpbnZva2VBcHBseSwgLi4ucGFzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAoT2JqZWN0LmtleXMoaW50ZXJ2YWxEZWxlZ2F0ZSkgYXMgKGtleW9mIElJbnRlcnZhbFNlcnZpY2UpW10pXG4gICAgICAgICAgICAgICAgICAgICAgLmZvckVhY2gocHJvcCA9PiAod3JhcHBlZEludGVydmFsIGFzIGFueSlbcHJvcF0gPSBpbnRlcnZhbERlbGVnYXRlW3Byb3BdKTtcblxuICAgICAgICAgICAgICAgICAgLy8gdGhlIGBmbHVzaGAgbWV0aG9kIHdpbGwgYmUgcHJlc2VudCB3aGVuIG5nTW9ja3MgaXMgdXNlZFxuICAgICAgICAgICAgICAgICAgaWYgKGludGVydmFsRGVsZWdhdGUuaGFzT3duUHJvcGVydHkoJ2ZsdXNoJykpIHtcbiAgICAgICAgICAgICAgICAgICAgKHdyYXBwZWRJbnRlcnZhbCBhcyBhbnkpWydmbHVzaCddID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIChpbnRlcnZhbERlbGVnYXRlIGFzIGFueSlbJ2ZsdXNoJ10oKTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlZEludGVydmFsO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlZEludGVydmFsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdKVxuXG4gICAgICAgIC5ydW4oW1xuICAgICAgICAgICRJTkpFQ1RPUixcbiAgICAgICAgICAoJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLiRpbmplY3RvciA9ICRpbmplY3RvcjtcbiAgICAgICAgICAgIGNvbnN0ICRyb290U2NvcGUgPSAkaW5qZWN0b3IuZ2V0KCckcm9vdFNjb3BlJyk7XG5cbiAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIG5nMSAkaW5qZWN0b3IgcHJvdmlkZXJcbiAgICAgICAgICAgIHNldFRlbXBJbmplY3RvclJlZigkaW5qZWN0b3IpO1xuICAgICAgICAgICAgdGhpcy5pbmplY3Rvci5nZXQoJElOSkVDVE9SKTtcblxuICAgICAgICAgICAgLy8gUHV0IHRoZSBpbmplY3RvciBvbiB0aGUgRE9NLCBzbyB0aGF0IGl0IGNhbiBiZSBcInJlcXVpcmVkXCJcbiAgICAgICAgICAgIGFuZ3VsYXJFbGVtZW50KGVsZW1lbnQpLmRhdGEhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgdGhpcy5pbmplY3Rvcik7XG5cbiAgICAgICAgICAgIC8vIERlc3Ryb3kgdGhlIEFuZ3VsYXJKUyBhcHAgb25jZSB0aGUgQW5ndWxhciBgUGxhdGZvcm1SZWZgIGlzIGRlc3Ryb3llZC5cbiAgICAgICAgICAgIC8vIFRoaXMgZG9lcyBub3QgaGFwcGVuIGluIGEgdHlwaWNhbCBTUEEgc2NlbmFyaW8sIGJ1dCBpdCBtaWdodCBiZSB1c2VmdWwgZm9yXG4gICAgICAgICAgICAvLyBvdGhlciB1c2UtY2FzZXMgd2hlcmUgZGlzcG9zaW5nIG9mIGFuIEFuZ3VsYXIvQW5ndWxhckpTIGFwcCBpcyBuZWNlc3NhcnlcbiAgICAgICAgICAgIC8vIChzdWNoIGFzIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnQgKEhNUikpLlxuICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzM5OTM1LlxuICAgICAgICAgICAgdGhpcy5wbGF0Zm9ybVJlZi5vbkRlc3Ryb3koKCkgPT4gZGVzdHJveUFwcCgkaW5qZWN0b3IpKTtcblxuICAgICAgICAgICAgLy8gV2lyZSB1cCB0aGUgbmcxIHJvb3RTY29wZSB0byBydW4gYSBkaWdlc3QgY3ljbGUgd2hlbmV2ZXIgdGhlIHpvbmUgc2V0dGxlc1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBkbyB0aGlzIGluIHRoZSBuZXh0IHRpY2sgc28gdGhhdCB3ZSBkb24ndCBwcmV2ZW50IHRoZSBib290dXAgc3RhYmlsaXppbmdcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLm5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuJCRwaGFzZSkge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICdBIGRpZ2VzdCB3YXMgdHJpZ2dlcmVkIHdoaWxlIG9uZSB3YXMgYWxyZWFkeSBpbiBwcm9ncmVzcy4gVGhpcyBtYXkgbWVhbiB0aGF0IHNvbWV0aGluZyBpcyB0cmlnZ2VyaW5nIGRpZ2VzdHMgb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lLicpO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICByZXR1cm4gJHJvb3RTY29wZS4kZXZhbEFzeW5jKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuICRyb290U2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG5cbiAgICBjb25zdCB1cGdyYWRlTW9kdWxlID0gYW5ndWxhck1vZHVsZShVUEdSQURFX01PRFVMRV9OQU1FLCBbSU5JVF9NT0RVTEVfTkFNRV0uY29uY2F0KG1vZHVsZXMpKTtcblxuICAgIC8vIE1ha2Ugc3VyZSByZXN1bWVCb290c3RyYXAoKSBvbmx5IGV4aXN0cyBpZiB0aGUgY3VycmVudCBib290c3RyYXAgaXMgZGVmZXJyZWRcbiAgICBjb25zdCB3aW5kb3dBbmd1bGFyID0gKHdpbmRvdyBhcyBhbnkpWydhbmd1bGFyJ107XG4gICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBCb290c3RyYXAgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiBpbnNpZGUgb3VyIHpvbmVcbiAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgYm9vdHN0cmFwKGVsZW1lbnQsIFt1cGdyYWRlTW9kdWxlLm5hbWVdLCBjb25maWcpO1xuICAgIH0pO1xuXG4gICAgLy8gUGF0Y2ggcmVzdW1lQm9vdHN0cmFwKCkgdG8gcnVuIGluc2lkZSB0aGUgbmdab25lXG4gICAgaWYgKHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwO1xuICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5uZ1pvbmU7XG4gICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDtcbiAgICAgICAgcmV0dXJuIG5nWm9uZS5ydW4oKCkgPT4gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAuYXBwbHkodGhpcywgYXJncykpO1xuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==