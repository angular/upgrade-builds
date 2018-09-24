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
 * * Core AngularJS services
 *   Importing this `NgModule` will add providers for the core
 *   [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * * Bootstrap
 *   The runtime instance of this class contains a {\@link UpgradeModule#bootstrap `bootstrap()`}
 *   method, which you use to bootstrap the top level AngularJS module onto an element in the
 *   DOM for the hybrid upgrade app.
 *
 *   It also contains properties to access the {\@link UpgradeModule#injector root injector}, the
 *   bootstrap `NgZone` and the
 *   [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvc3RhdGljL3VwZ3JhZGVfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV0RSxPQUFPLEtBQUssT0FBTyxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqSixPQUFPLEVBQWdCLGFBQWEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTVELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzNFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUl6QyxNQUFNOzs7OztJQVFKO0lBRUksQUFEQSx1REFBdUQ7SUFDdkQsUUFBa0IsRUFFWDtRQUFBLFdBQU0sR0FBTixNQUFNO1FBQ2YsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2pEOzs7Ozs7OztJQVFELFNBQVMsQ0FDTCxPQUFnQixFQUFFLFVBQW9CLEVBQUUsRUFBRSxNQUFZOztRQUN4RCxNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixHQUFHLE9BQU8sQ0FBQzs7UUFHdkQsTUFBTSxVQUFVLEdBQ1osT0FBTzthQUNGLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUM7YUFFNUIsS0FBSyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO2FBRWxDLE9BQU8sQ0FDSixlQUFlLEVBQ2Y7WUFDRSxZQUFZO1lBQ1osQ0FBQyxRQUFrQixFQUFFLEVBQUUsQ0FBQyxtQkFBQyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFtQixFQUFDO1NBQzVFLENBQUM7YUFFTCxNQUFNLENBQUM7WUFDTixRQUFRLEVBQUUsU0FBUztZQUNuQixDQUFDLFFBQWlDLEVBQUUsU0FBbUMsRUFBRSxFQUFFO2dCQUN6RSxJQUFJLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUU7b0JBQ2hDLFFBQVEsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFO3dCQUNoQyxTQUFTO3dCQUNULENBQUMsbUJBQWdELEVBQUUsRUFBRTs7NEJBQ25ELE1BQU0sa0JBQWtCLEdBQWEsbUJBQW1CLENBQUMsVUFBVSxDQUFDOzs0QkFDcEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7NEJBRS9CLE1BQU0sYUFBYSxHQUFHLFVBQVMsUUFBa0I7Z0NBQy9DLGtCQUFrQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRTs7b0NBQzNDLE1BQU0sY0FBYyxHQUFnQixRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29DQUM5RCxJQUFJLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRTt3Q0FDN0IsUUFBUSxFQUFFLENBQUM7cUNBQ1o7eUNBQU07d0NBQ0wsY0FBYyxDQUFDLFVBQVUsQ0FDckIsYUFBYSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO3FDQUN4RDtpQ0FDRixDQUFDLENBQUM7NkJBQ0osQ0FBQzs0QkFFRixtQkFBbUIsQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDOzRCQUMvQyxPQUFPLG1CQUFtQixDQUFDO3lCQUM1QjtxQkFDRixDQUFDLENBQUM7aUJBQ0o7Z0JBRUQsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO29CQUM1QixRQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTt3QkFDNUIsU0FBUzt3QkFDVCxDQUFDLGdCQUEwQyxFQUFFLEVBQUU7OzRCQUk3QyxJQUFJLGVBQWUsR0FDZixDQUFDLEVBQVksRUFBRSxLQUFhLEVBQUUsS0FBYyxFQUFFLFdBQXFCLEVBQ2xFLEdBQUcsSUFBVyxFQUFFLEVBQUU7Z0NBQ2pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7b0NBQ3hDLE9BQU8sZ0JBQWdCLENBQUMsQ0FBQyxHQUFHLElBQVcsRUFBRSxFQUFFOzs7Ozt3Q0FLekMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7cUNBQzNELEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztpQ0FDeEMsQ0FBQyxDQUFDOzZCQUNKLENBQUM7NEJBRU4sbUJBQUMsZUFBc0IsRUFBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQzs0QkFDN0QsT0FBTyxlQUFlLENBQUM7eUJBQ3hCO3FCQUNGLENBQUMsQ0FBQztpQkFDSjthQUNGO1NBQ0YsQ0FBQzthQUVELEdBQUcsQ0FBQztZQUNILFNBQVM7WUFDVCxDQUFDLFNBQW1DLEVBQUUsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7O2dCQUczQixrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7OztnQkFHN0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFROzs7O2dCQUsxRSxVQUFVLENBQUMsR0FBRyxFQUFFOztvQkFDZCxNQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDOztvQkFDL0MsTUFBTSxZQUFZLEdBQ2QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQ3ZFLFVBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDbkUsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNQO1NBQ0YsQ0FBQyxDQUFDOztRQUVYLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOztRQUc5RixNQUFNLGFBQWEsR0FBRyxtQkFBQyxNQUFhLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqRCxhQUFhLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQzs7UUFHMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7O1FBR3JGLElBQUksYUFBYSxDQUFDLGVBQWUsRUFBRTs7WUFDakMsTUFBTSx1QkFBdUIsR0FBZSxhQUFhLENBQUMsZUFBZSxDQUFDOztZQUMxRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzNCLGFBQWEsQ0FBQyxlQUFlLEdBQUc7O2dCQUM5QixJQUFJLElBQUksR0FBRyxTQUFTLENBQUM7Z0JBQ3JCLGFBQWEsQ0FBQyxlQUFlLEdBQUcsdUJBQXVCLENBQUM7Z0JBQ3hELE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUMxRSxDQUFDO1NBQ0g7S0FDRjs7O1lBN0lGLFFBQVEsU0FBQyxFQUFDLFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUM7Ozs7WUF2SWxDLFFBQVE7WUFBWSxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBOZ01vZHVsZSwgTmdab25lLCBUZXN0YWJpbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi4vY29tbW9uL2FuZ3VsYXIxJztcbmltcG9ydCB7JCRURVNUQUJJTElUWSwgJERFTEVHQVRFLCAkSU5KRUNUT1IsICRJTlRFUlZBTCwgJFBST1ZJREUsIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBVUEdSQURFX01PRFVMRV9OQU1FfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgY29udHJvbGxlcktleX0gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuXG5pbXBvcnQge2FuZ3VsYXIxUHJvdmlkZXJzLCBzZXRUZW1wSW5qZWN0b3JSZWZ9IGZyb20gJy4vYW5ndWxhcjFfcHJvdmlkZXJzJztcbmltcG9ydCB7TmdBZGFwdGVySW5qZWN0b3J9IGZyb20gJy4vdXRpbCc7XG5cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBbiBgTmdNb2R1bGVgLCB3aGljaCB5b3UgaW1wb3J0IHRvIHByb3ZpZGUgQW5ndWxhckpTIGNvcmUgc2VydmljZXMsXG4gKiBhbmQgaGFzIGFuIGluc3RhbmNlIG1ldGhvZCB1c2VkIHRvIGJvb3RzdHJhcCB0aGUgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUvc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQW9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoZSBgdXBncmFkZS9zdGF0aWNgIHBhY2thZ2UgY29udGFpbnMgaGVscGVycyB0aGF0IGFsbG93IEFuZ3VsYXJKUyBhbmQgQW5ndWxhciBjb21wb25lbnRzXG4gKiB0byBiZSB1c2VkIHRvZ2V0aGVyIGluc2lkZSBhIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLCB3aGljaCBzdXBwb3J0cyBBb1QgY29tcGlsYXRpb24uXG4gKlxuICogU3BlY2lmaWNhbGx5LCB0aGUgY2xhc3NlcyBhbmQgZnVuY3Rpb25zIGluIHRoZSBgdXBncmFkZS9zdGF0aWNgIG1vZHVsZSBhbGxvdyB0aGUgZm9sbG93aW5nOlxuICpcbiAqIDEuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXIgZGlyZWN0aXZlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhckpTIGNvbXBvbmVudCBzb1xuICogICAgdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiBhbiBBbmd1bGFyIHRlbXBsYXRlLiBTZWUgYFVwZ3JhZGVDb21wb25lbnRgLlxuICogMi4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhckpTIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXIgY29tcG9uZW50IHNvXG4gKiAgICB0aGF0IGl0IGNhbiBiZSB1c2VkIGluIGFuIEFuZ3VsYXJKUyB0ZW1wbGF0ZS4gU2VlIGBkb3duZ3JhZGVDb21wb25lbnRgLlxuICogMy4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhciByb290IGluamVjdG9yIHByb3ZpZGVyIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhckpTXG4gKiAgICBzZXJ2aWNlIHNvIHRoYXQgaXQgY2FuIGJlIGluamVjdGVkIGludG8gYW4gQW5ndWxhciBjb250ZXh0LiBTZWVcbiAqICAgIHtAbGluayBVcGdyYWRlTW9kdWxlI3VwZ3JhZGluZy1hbi1hbmd1bGFyLTEtc2VydmljZSBVcGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2V9IGJlbG93LlxuICogNC4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhckpTIHNlcnZpY2UgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFyIGluamVjdGFibGVcbiAqICAgIHNvIHRoYXQgaXQgY2FuIGJlIGluamVjdGVkIGludG8gYW4gQW5ndWxhckpTIGNvbnRleHQuIFNlZSBgZG93bmdyYWRlSW5qZWN0YWJsZWAuXG4gKiAzLiBCb290c3RyYXBwaW5nIG9mIGEgaHlicmlkIEFuZ3VsYXIgYXBwbGljYXRpb24gd2hpY2ggY29udGFpbnMgYm90aCBvZiB0aGUgZnJhbWV3b3Jrc1xuICogICAgY29leGlzdGluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1VwZ3JhZGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL3VwZ3JhZGUvc3RhdGljJztcbiAqIGBgYFxuICpcbiAqIFNlZSBhbHNvIHRoZSB7QGxpbmsgVXBncmFkZU1vZHVsZSNleGFtcGxlcyBleGFtcGxlc30gYmVsb3cuXG4gKlxuICogIyMjIE1lbnRhbCBNb2RlbFxuICpcbiAqIFdoZW4gcmVhc29uaW5nIGFib3V0IGhvdyBhIGh5YnJpZCBhcHBsaWNhdGlvbiB3b3JrcyBpdCBpcyB1c2VmdWwgdG8gaGF2ZSBhIG1lbnRhbCBtb2RlbCB3aGljaFxuICogZGVzY3JpYmVzIHdoYXQgaXMgaGFwcGVuaW5nIGFuZCBleHBsYWlucyB3aGF0IGlzIGhhcHBlbmluZyBhdCB0aGUgbG93ZXN0IGxldmVsLlxuICpcbiAqIDEuIFRoZXJlIGFyZSB0d28gaW5kZXBlbmRlbnQgZnJhbWV3b3JrcyBydW5uaW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLCBlYWNoIGZyYW1ld29yayB0cmVhdHNcbiAqICAgIHRoZSBvdGhlciBhcyBhIGJsYWNrIGJveC5cbiAqIDIuIEVhY2ggRE9NIGVsZW1lbnQgb24gdGhlIHBhZ2UgaXMgb3duZWQgZXhhY3RseSBieSBvbmUgZnJhbWV3b3JrLiBXaGljaGV2ZXIgZnJhbWV3b3JrXG4gKiAgICBpbnN0YW50aWF0ZWQgdGhlIGVsZW1lbnQgaXMgdGhlIG93bmVyLiBFYWNoIGZyYW1ld29yayBvbmx5IHVwZGF0ZXMvaW50ZXJhY3RzIHdpdGggaXRzIG93blxuICogICAgRE9NIGVsZW1lbnRzIGFuZCBpZ25vcmVzIG90aGVycy5cbiAqIDMuIEFuZ3VsYXJKUyBkaXJlY3RpdmVzIGFsd2F5cyBleGVjdXRlIGluc2lkZSB0aGUgQW5ndWxhckpTIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA0LiBBbmd1bGFyIGNvbXBvbmVudHMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIHRoZSBBbmd1bGFyIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA1LiBBbiBBbmd1bGFySlMgY29tcG9uZW50IGNhbiBiZSBcInVwZ3JhZGVkXCJcIiB0byBhbiBBbmd1bGFyIGNvbXBvbmVudC4gVGhpcyBpcyBhY2hpZXZlZCBieVxuICogICAgZGVmaW5pbmcgYW4gQW5ndWxhciBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXJKUyBjb21wb25lbnQgYXQgaXRzIGxvY2F0aW9uXG4gKiAgICBpbiB0aGUgRE9NLiBTZWUgYFVwZ3JhZGVDb21wb25lbnRgLlxuICogNi4gQW4gQW5ndWxhciBjb21wb25lbnQgY2FuIGJlIFwiZG93bmdyYWRlZFwiIHRvIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQuIFRoaXMgaXMgYWNoaWV2ZWQgYnlcbiAqICAgIGRlZmluaW5nIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXIgY29tcG9uZW50IGF0IGl0cyBsb2NhdGlvblxuICogICAgaW4gdGhlIERPTS4gU2VlIGBkb3duZ3JhZGVDb21wb25lbnRgLlxuICogNy4gV2hlbmV2ZXIgYW4gXCJ1cGdyYWRlZFwiL1wiZG93bmdyYWRlZFwiIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieVxuICogICAgdGhlIGZyYW1ld29yayBkb2luZyB0aGUgaW5zdGFudGlhdGlvbi4gVGhlIG90aGVyIGZyYW1ld29yayB0aGVuIGluc3RhbnRpYXRlcyBhbmQgb3ducyB0aGVcbiAqICAgIHZpZXcgZm9yIHRoYXQgY29tcG9uZW50LlxuICogICAgMS4gVGhpcyBpbXBsaWVzIHRoYXQgdGhlIGNvbXBvbmVudCBiaW5kaW5ncyB3aWxsIGFsd2F5cyBmb2xsb3cgdGhlIHNlbWFudGljcyBvZiB0aGVcbiAqICAgICAgIGluc3RhbnRpYXRpb24gZnJhbWV3b3JrLlxuICogICAgMi4gVGhlIERPTSBhdHRyaWJ1dGVzIGFyZSBwYXJzZWQgYnkgdGhlIGZyYW1ld29yayB0aGF0IG93bnMgdGhlIGN1cnJlbnQgdGVtcGxhdGUuIFNvXG4gKiAgICAgICBhdHRyaWJ1dGVzIGluIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMgbXVzdCB1c2Uga2ViYWItY2FzZSwgd2hpbGUgQW5ndWxhckpTIHRlbXBsYXRlcyBtdXN0IHVzZVxuICogICAgICAgY2FtZWxDYXNlLlxuICogICAgMy4gSG93ZXZlciB0aGUgdGVtcGxhdGUgYmluZGluZyBzeW50YXggd2lsbCBhbHdheXMgdXNlIHRoZSBBbmd1bGFyIHN0eWxlLCBlLmcuIHNxdWFyZVxuICogICAgICAgYnJhY2tldHMgKGBbLi4uXWApIGZvciBwcm9wZXJ0eSBiaW5kaW5nLlxuICogOC4gQW5ndWxhciBpcyBib290c3RyYXBwZWQgZmlyc3Q7IEFuZ3VsYXJKUyBpcyBib290c3RyYXBwZWQgc2Vjb25kLiBBbmd1bGFySlMgYWx3YXlzIG93bnMgdGhlXG4gKiAgICByb290IGNvbXBvbmVudCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKiA5LiBUaGUgbmV3IGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gYW4gQW5ndWxhciB6b25lLCBhbmQgdGhlcmVmb3JlIGl0IG5vIGxvbmdlciBuZWVkcyBjYWxscyB0b1xuICogICAgYCRhcHBseSgpYC5cbiAqXG4gKiAjIyMgVGhlIGBVcGdyYWRlTW9kdWxlYCBjbGFzc1xuICpcbiAqIFRoaXMgY2xhc3MgaXMgYW4gYE5nTW9kdWxlYCwgd2hpY2ggeW91IGltcG9ydCB0byBwcm92aWRlIEFuZ3VsYXJKUyBjb3JlIHNlcnZpY2VzLFxuICogYW5kIGhhcyBhbiBpbnN0YW5jZSBtZXRob2QgdXNlZCB0byBib290c3RyYXAgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICpcbiAqICogQ29yZSBBbmd1bGFySlMgc2VydmljZXNcbiAqICAgSW1wb3J0aW5nIHRoaXMgYE5nTW9kdWxlYCB3aWxsIGFkZCBwcm92aWRlcnMgZm9yIHRoZSBjb3JlXG4gKiAgIFtBbmd1bGFySlMgc2VydmljZXNdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9zZXJ2aWNlKSB0byB0aGUgcm9vdCBpbmplY3Rvci5cbiAqXG4gKiAqIEJvb3RzdHJhcFxuICogICBUaGUgcnVudGltZSBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIGNvbnRhaW5zIGEge0BsaW5rIFVwZ3JhZGVNb2R1bGUjYm9vdHN0cmFwIGBib290c3RyYXAoKWB9XG4gKiAgIG1ldGhvZCwgd2hpY2ggeW91IHVzZSB0byBib290c3RyYXAgdGhlIHRvcCBsZXZlbCBBbmd1bGFySlMgbW9kdWxlIG9udG8gYW4gZWxlbWVudCBpbiB0aGVcbiAqICAgRE9NIGZvciB0aGUgaHlicmlkIHVwZ3JhZGUgYXBwLlxuICpcbiAqICAgSXQgYWxzbyBjb250YWlucyBwcm9wZXJ0aWVzIHRvIGFjY2VzcyB0aGUge0BsaW5rIFVwZ3JhZGVNb2R1bGUjaW5qZWN0b3Igcm9vdCBpbmplY3Rvcn0sIHRoZVxuICogICBib290c3RyYXAgYE5nWm9uZWAgYW5kIHRoZVxuICogICBbQW5ndWxhckpTICRpbmplY3Rvcl0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL2F1dG8vc2VydmljZS8kaW5qZWN0b3IpLlxuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIEltcG9ydCB0aGUgYFVwZ3JhZGVNb2R1bGVgIGludG8geW91ciB0b3AgbGV2ZWwge0BsaW5rIE5nTW9kdWxlIEFuZ3VsYXIgYE5nTW9kdWxlYH0uXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nbmcyLW1vZHVsZSd9XG4gKlxuICogVGhlbiBpbmplY3QgYFVwZ3JhZGVNb2R1bGVgIGludG8geW91ciBBbmd1bGFyIGBOZ01vZHVsZWAgYW5kIHVzZSBpdCB0byBib290c3RyYXAgdGhlIHRvcCBsZXZlbFxuICogW0FuZ3VsYXJKUyBtb2R1bGVdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy90eXBlL2FuZ3VsYXIuTW9kdWxlKSBpbiB0aGVcbiAqIGBuZ0RvQm9vdHN0cmFwKClgIG1ldGhvZC5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPSdib290c3RyYXAtbmcxJ31cbiAqXG4gKiBGaW5hbGx5LCBraWNrIG9mZiB0aGUgd2hvbGUgcHJvY2VzcywgYnkgYm9vdHN0cmFwaW5nIHlvdXIgdG9wIGxldmVsIEFuZ3VsYXIgYE5nTW9kdWxlYC5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPSdib290c3RyYXAtbmcyJ31cbiAqXG4gKiB7QGEgdXBncmFkaW5nLWFuLWFuZ3VsYXItMS1zZXJ2aWNlfVxuICogIyMjIFVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZVxuICpcbiAqIFRoZXJlIGlzIG5vIHNwZWNpZmljIEFQSSBmb3IgdXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlLiBJbnN0ZWFkIHlvdSBzaG91bGQganVzdCBmb2xsb3cgdGhlXG4gKiBmb2xsb3dpbmcgcmVjaXBlOlxuICpcbiAqIExldCdzIHNheSB5b3UgaGF2ZSBhbiBBbmd1bGFySlMgc2VydmljZTpcbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLXRleHQtZm9ybWF0dGVyLXNlcnZpY2VcIn1cbiAqXG4gKiBUaGVuIHlvdSBzaG91bGQgZGVmaW5lIGFuIEFuZ3VsYXIgcHJvdmlkZXIgdG8gYmUgaW5jbHVkZWQgaW4geW91ciBgTmdNb2R1bGVgIGBwcm92aWRlcnNgXG4gKiBwcm9wZXJ0eS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwidXBncmFkZS1uZzEtc2VydmljZVwifVxuICpcbiAqIFRoZW4geW91IGNhbiB1c2UgdGhlIFwidXBncmFkZWRcIiBBbmd1bGFySlMgc2VydmljZSBieSBpbmplY3RpbmcgaXQgaW50byBhbiBBbmd1bGFyIGNvbXBvbmVudFxuICogb3Igc2VydmljZS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwidXNlLW5nMS11cGdyYWRlZC1zZXJ2aWNlXCJ9XG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5ATmdNb2R1bGUoe3Byb3ZpZGVyczogW2FuZ3VsYXIxUHJvdmlkZXJzXX0pXG5leHBvcnQgY2xhc3MgVXBncmFkZU1vZHVsZSB7XG4gIC8qKlxuICAgKiBUaGUgQW5ndWxhckpTIGAkaW5qZWN0b3JgIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHB1YmxpYyAkaW5qZWN0b3I6IGFueSAvKmFuZ3VsYXIuSUluamVjdG9yU2VydmljZSovO1xuICAvKiogVGhlIEFuZ3VsYXIgSW5qZWN0b3IgKiovXG4gIHB1YmxpYyBpbmplY3RvcjogSW5qZWN0b3I7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICAvKiogVGhlIHJvb3QgYEluamVjdG9yYCBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24uICovXG4gICAgICBpbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICAvKiogVGhlIGJvb3RzdHJhcCB6b25lIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbiAqL1xuICAgICAgcHVibGljIG5nWm9uZTogTmdab25lKSB7XG4gICAgdGhpcy5pbmplY3RvciA9IG5ldyBOZ0FkYXB0ZXJJbmplY3RvcihpbmplY3Rvcik7XG4gIH1cblxuICAvKipcbiAgICogQm9vdHN0cmFwIGFuIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiBmcm9tIHRoaXMgTmdNb2R1bGVcbiAgICogQHBhcmFtIGVsZW1lbnQgdGhlIGVsZW1lbnQgb24gd2hpY2ggdG8gYm9vdHN0cmFwIHRoZSBBbmd1bGFySlMgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIFttb2R1bGVzXSB0aGUgQW5ndWxhckpTIG1vZHVsZXMgdG8gYm9vdHN0cmFwIGZvciB0aGlzIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSBbY29uZmlnXSBvcHRpb25hbCBleHRyYSBBbmd1bGFySlMgYm9vdHN0cmFwIGNvbmZpZ3VyYXRpb25cbiAgICovXG4gIGJvb3RzdHJhcChcbiAgICAgIGVsZW1lbnQ6IEVsZW1lbnQsIG1vZHVsZXM6IHN0cmluZ1tdID0gW10sIGNvbmZpZz86IGFueSAvKmFuZ3VsYXIuSUFuZ3VsYXJCb290c3RyYXBDb25maWcqLykge1xuICAgIGNvbnN0IElOSVRfTU9EVUxFX05BTUUgPSBVUEdSQURFX01PRFVMRV9OQU1FICsgJy5pbml0JztcblxuICAgIC8vIENyZWF0ZSBhbiBuZzEgbW9kdWxlIHRvIGJvb3RzdHJhcFxuICAgIGNvbnN0IGluaXRNb2R1bGUgPVxuICAgICAgICBhbmd1bGFyXG4gICAgICAgICAgICAubW9kdWxlKElOSVRfTU9EVUxFX05BTUUsIFtdKVxuXG4gICAgICAgICAgICAudmFsdWUoSU5KRUNUT1JfS0VZLCB0aGlzLmluamVjdG9yKVxuXG4gICAgICAgICAgICAuZmFjdG9yeShcbiAgICAgICAgICAgICAgICBMQVpZX01PRFVMRV9SRUYsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgSU5KRUNUT1JfS0VZLFxuICAgICAgICAgICAgICAgICAgKGluamVjdG9yOiBJbmplY3RvcikgPT4gKHsgaW5qZWN0b3IsIG5lZWRzTmdab25lOiBmYWxzZSB9IGFzIExhenlNb2R1bGVSZWYpXG4gICAgICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgLmNvbmZpZyhbXG4gICAgICAgICAgICAgICRQUk9WSURFLCAkSU5KRUNUT1IsXG4gICAgICAgICAgICAgICgkcHJvdmlkZTogYW5ndWxhci5JUHJvdmlkZVNlcnZpY2UsICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJCRURVNUQUJJTElUWSkpIHtcbiAgICAgICAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcigkJFRFU1RBQklMSVRZLCBbXG4gICAgICAgICAgICAgICAgICAgICRERUxFR0FURSxcbiAgICAgICAgICAgICAgICAgICAgKHRlc3RhYmlsaXR5RGVsZWdhdGU6IGFuZ3VsYXIuSVRlc3RhYmlsaXR5U2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsV2hlblN0YWJsZTogRnVuY3Rpb24gPSB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLmluamVjdG9yO1xuICAgICAgICAgICAgICAgICAgICAgIC8vIENhbm5vdCB1c2UgYXJyb3cgZnVuY3Rpb24gYmVsb3cgYmVjYXVzZSB3ZSBuZWVkIHRoZSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3V2hlblN0YWJsZSA9IGZ1bmN0aW9uKGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxXaGVuU3RhYmxlLmNhbGwodGVzdGFiaWxpdHlEZWxlZ2F0ZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5nMlRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSA9IGluamVjdG9yLmdldChUZXN0YWJpbGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZzJUZXN0YWJpbGl0eS5pc1N0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZzJUZXN0YWJpbGl0eS53aGVuU3RhYmxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdXaGVuU3RhYmxlLmJpbmQodGVzdGFiaWxpdHlEZWxlZ2F0ZSwgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgIHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZSA9IG5ld1doZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlc3RhYmlsaXR5RGVsZWdhdGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCRJTlRFUlZBTCkpIHtcbiAgICAgICAgICAgICAgICAgICRwcm92aWRlLmRlY29yYXRvcigkSU5URVJWQUwsIFtcbiAgICAgICAgICAgICAgICAgICAgJERFTEVHQVRFLFxuICAgICAgICAgICAgICAgICAgICAoaW50ZXJ2YWxEZWxlZ2F0ZTogYW5ndWxhci5JSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gV3JhcCB0aGUgJGludGVydmFsIHNlcnZpY2Ugc28gdGhhdCBzZXRJbnRlcnZhbCBpcyBjYWxsZWQgb3V0c2lkZSBOZ1pvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoZSBjYWxsYmFjayBpcyBzdGlsbCBpbnZva2VkIHdpdGhpbiBpdC4gVGhpcyBpcyBzbyB0aGF0ICRpbnRlcnZhbFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHdvbid0IGJsb2NrIHN0YWJpbGl0eSwgd2hpY2ggcHJlc2VydmVzIHRoZSBiZWhhdmlvciBmcm9tIEFuZ3VsYXJKUy5cbiAgICAgICAgICAgICAgICAgICAgICBsZXQgd3JhcHBlZEludGVydmFsID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKGZuOiBGdW5jdGlvbiwgZGVsYXk6IG51bWJlciwgY291bnQ/OiBudW1iZXIsIGludm9rZUFwcGx5PzogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnBhc3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnZhbERlbGVnYXRlKCguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSdW4gY2FsbGJhY2sgaW4gdGhlIG5leHQgVk0gdHVybiAtICRpbnRlcnZhbCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRhcHBseSwgYW5kIHJ1bm5pbmcgdGhlIGNhbGxiYWNrIGluIE5nWm9uZSB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhdXNlIGEgJyRkaWdlc3QgYWxyZWFkeSBpbiBwcm9ncmVzcycgZXJyb3IgaWYgaXQncyBpbiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2FtZSB2bSB0dXJuLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy5uZ1pvbmUucnVuKCgpID0+IGZuKC4uLmFyZ3MpKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBkZWxheSwgY291bnQsIGludm9rZUFwcGx5LCAuLi5wYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICh3cmFwcGVkSW50ZXJ2YWwgYXMgYW55KVsnY2FuY2VsJ10gPSBpbnRlcnZhbERlbGVnYXRlLmNhbmNlbDtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gd3JhcHBlZEludGVydmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICAgIC5ydW4oW1xuICAgICAgICAgICAgICAkSU5KRUNUT1IsXG4gICAgICAgICAgICAgICgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJGluamVjdG9yID0gJGluamVjdG9yO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgbmcxICRpbmplY3RvciBwcm92aWRlclxuICAgICAgICAgICAgICAgIHNldFRlbXBJbmplY3RvclJlZigkaW5qZWN0b3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5qZWN0b3IuZ2V0KCRJTkpFQ1RPUik7XG5cbiAgICAgICAgICAgICAgICAvLyBQdXQgdGhlIGluamVjdG9yIG9uIHRoZSBET00sIHNvIHRoYXQgaXQgY2FuIGJlIFwicmVxdWlyZWRcIlxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5kYXRhICEoY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpLCB0aGlzLmluamVjdG9yKTtcblxuICAgICAgICAgICAgICAgIC8vIFdpcmUgdXAgdGhlIG5nMSByb290U2NvcGUgdG8gcnVuIGEgZGlnZXN0IGN5Y2xlIHdoZW5ldmVyIHRoZSB6b25lIHNldHRsZXNcbiAgICAgICAgICAgICAgICAvLyBXZSBuZWVkIHRvIGRvIHRoaXMgaW4gdGhlIG5leHQgdGljayBzbyB0aGF0IHdlIGRvbid0IHByZXZlbnQgdGhlIGJvb3R1cFxuICAgICAgICAgICAgICAgIC8vIHN0YWJpbGl6aW5nXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCAkcm9vdFNjb3BlID0gJGluamVjdG9yLmdldCgnJHJvb3RTY29wZScpO1xuICAgICAgICAgICAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LnN1YnNjcmliZSgoKSA9PiAkcm9vdFNjb3BlLiRkaWdlc3QoKSk7XG4gICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpOyB9KTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSk7XG5cbiAgICBjb25zdCB1cGdyYWRlTW9kdWxlID0gYW5ndWxhci5tb2R1bGUoVVBHUkFERV9NT0RVTEVfTkFNRSwgW0lOSVRfTU9EVUxFX05BTUVdLmNvbmNhdChtb2R1bGVzKSk7XG5cbiAgICAvLyBNYWtlIHN1cmUgcmVzdW1lQm9vdHN0cmFwKCkgb25seSBleGlzdHMgaWYgdGhlIGN1cnJlbnQgYm9vdHN0cmFwIGlzIGRlZmVycmVkXG4gICAgY29uc3Qgd2luZG93QW5ndWxhciA9ICh3aW5kb3cgYXMgYW55KVsnYW5ndWxhciddO1xuICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gQm9vdHN0cmFwIHRoZSBBbmd1bGFySlMgYXBwbGljYXRpb24gaW5zaWRlIG91ciB6b25lXG4gICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHsgYW5ndWxhci5ib290c3RyYXAoZWxlbWVudCwgW3VwZ3JhZGVNb2R1bGUubmFtZV0sIGNvbmZpZyk7IH0pO1xuXG4gICAgLy8gUGF0Y2ggcmVzdW1lQm9vdHN0cmFwKCkgdG8gcnVuIGluc2lkZSB0aGUgbmdab25lXG4gICAgaWYgKHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwO1xuICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5uZ1pvbmU7XG4gICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBsZXQgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDtcbiAgICAgICAgcmV0dXJuIG5nWm9uZS5ydW4oKCkgPT4gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAuYXBwbHkodGhpcywgYXJncykpO1xuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==