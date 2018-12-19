/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Injector, NgModule, NgZone, Testability } from '@angular/core';
import * as angular from '../common/angular1';
import { $$TESTABILITY, $DELEGATE, $INJECTOR, $INTERVAL, $PROVIDE, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_APP_TYPE_KEY, UPGRADE_MODULE_NAME } from '../common/constants';
import { controllerKey } from '../common/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
/**
 * @description
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
var UpgradeModule = /** @class */ (function () {
    function UpgradeModule(
    /** The root `Injector` for the upgrade application. */
    injector, 
    /** The bootstrap zone for the upgrade application */
    ngZone) {
        this.ngZone = ngZone;
        this.injector = new NgAdapterInjector(injector);
    }
    /**
     * Bootstrap an AngularJS application from this NgModule
     * @param element the element on which to bootstrap the AngularJS application
     * @param [modules] the AngularJS modules to bootstrap for this application
     * @param [config] optional extra AngularJS bootstrap configuration
     */
    UpgradeModule.prototype.bootstrap = function (element, modules, config /*angular.IAngularBootstrapConfig*/) {
        var _this = this;
        if (modules === void 0) { modules = []; }
        var INIT_MODULE_NAME = UPGRADE_MODULE_NAME + '.init';
        // Create an ng1 module to bootstrap
        var initModule = angular
            .module(INIT_MODULE_NAME, [])
            .constant(UPGRADE_APP_TYPE_KEY, 2 /* Static */)
            .value(INJECTOR_KEY, this.injector)
            .factory(LAZY_MODULE_REF, [
            INJECTOR_KEY,
            function (injector) { return ({ injector: injector, needsNgZone: false }); }
        ])
            .config([
            $PROVIDE, $INJECTOR,
            function ($provide, $injector) {
                if ($injector.has($$TESTABILITY)) {
                    $provide.decorator($$TESTABILITY, [
                        $DELEGATE,
                        function (testabilityDelegate) {
                            var originalWhenStable = testabilityDelegate.whenStable;
                            var injector = _this.injector;
                            // Cannot use arrow function below because we need the context
                            var newWhenStable = function (callback) {
                                originalWhenStable.call(testabilityDelegate, function () {
                                    var ng2Testability = injector.get(Testability);
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
                        function (intervalDelegate) {
                            // Wrap the $interval service so that setInterval is called outside NgZone,
                            // but the callback is still invoked within it. This is so that $interval
                            // won't block stability, which preserves the behavior from AngularJS.
                            var wrappedInterval = function (fn, delay, count, invokeApply) {
                                var pass = [];
                                for (var _i = 4; _i < arguments.length; _i++) {
                                    pass[_i - 4] = arguments[_i];
                                }
                                return _this.ngZone.runOutsideAngular(function () {
                                    return intervalDelegate.apply(void 0, tslib_1.__spread([function () {
                                            var args = [];
                                            for (var _i = 0; _i < arguments.length; _i++) {
                                                args[_i] = arguments[_i];
                                            }
                                            // Run callback in the next VM turn - $interval calls
                                            // $rootScope.$apply, and running the callback in NgZone will
                                            // cause a '$digest already in progress' error if it's in the
                                            // same vm turn.
                                            setTimeout(function () { _this.ngZone.run(function () { return fn.apply(void 0, tslib_1.__spread(args)); }); });
                                        }, delay, count, invokeApply], pass));
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
            function ($injector) {
                _this.$injector = $injector;
                // Initialize the ng1 $injector provider
                setTempInjectorRef($injector);
                _this.injector.get($INJECTOR);
                // Put the injector on the DOM, so that it can be "required"
                angular.element(element).data(controllerKey(INJECTOR_KEY), _this.injector);
                // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
                // We need to do this in the next tick so that we don't prevent the bootup
                // stabilizing
                setTimeout(function () {
                    var $rootScope = $injector.get('$rootScope');
                    var subscription = _this.ngZone.onMicrotaskEmpty.subscribe(function () { return $rootScope.$digest(); });
                    $rootScope.$on('$destroy', function () { subscription.unsubscribe(); });
                }, 0);
            }
        ]);
        var upgradeModule = angular.module(UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        var windowAngular = window['angular'];
        windowAngular.resumeBootstrap = undefined;
        // Bootstrap the AngularJS application inside our zone
        this.ngZone.run(function () { angular.bootstrap(element, [upgradeModule.name], config); });
        // Patch resumeBootstrap() to run inside the ngZone
        if (windowAngular.resumeBootstrap) {
            var originalResumeBootstrap_1 = windowAngular.resumeBootstrap;
            var ngZone_1 = this.ngZone;
            windowAngular.resumeBootstrap = function () {
                var _this = this;
                var args = arguments;
                windowAngular.resumeBootstrap = originalResumeBootstrap_1;
                return ngZone_1.run(function () { return windowAngular.resumeBootstrap.apply(_this, args); });
            };
        }
    };
    UpgradeModule = tslib_1.__decorate([
        NgModule({ providers: [angular1Providers] }),
        tslib_1.__metadata("design:paramtypes", [Injector,
            NgZone])
    ], UpgradeModule);
    return UpgradeModule;
}());
export { UpgradeModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvc3RhdGljL3VwZ3JhZGVfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRFLE9BQU8sS0FBSyxPQUFPLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxvQkFBb0IsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZLLE9BQU8sRUFBZ0MsYUFBYSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUUsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDM0UsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBR3pDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEhHO0FBRUg7SUFRRTtJQUNJLHVEQUF1RDtJQUN2RCxRQUFrQjtJQUNsQixxREFBcUQ7SUFDOUMsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGlDQUFTLEdBQVQsVUFDSSxPQUFnQixFQUFFLE9BQXNCLEVBQUUsTUFBWSxD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QUFDLENBQUM7UUFDakQsYUFBYSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7UUFFMUMsc0RBQXNEO1FBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGNBQVEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRixtREFBbUQ7UUFDbkQsSUFBSSxhQUFhLENBQUMsZUFBZSxFQUFFO1lBQ2pDLElBQU0seUJBQXVCLEdBQWUsYUFBYSxDQUFDLGVBQWUsQ0FBQztZQUMxRSxJQUFNLFFBQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzNCLGFBQWEsQ0FBQyxlQUFlLEdBQUc7Z0JBQUEsaUJBSS9CO2dCQUhDLElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQztnQkFDckIsYUFBYSxDQUFDLGVBQWUsR0FBRyx5QkFBdUIsQ0FBQztnQkFDeEQsT0FBTyxRQUFNLENBQUMsR0FBRyxDQUFDLGNBQU0sT0FBQSxhQUFhLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxLQUFJLEVBQUUsSUFBSSxDQUFDLEVBQS9DLENBQStDLENBQUMsQ0FBQztZQUMzRSxDQUFDLENBQUM7U0FDSDtJQUNILENBQUM7SUE5SVUsYUFBYTtRQUR6QixRQUFRLENBQUMsRUFBQyxTQUFTLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDLENBQUM7aURBVzNCLFFBQVE7WUFFSCxNQUFNO09BWmQsYUFBYSxDQStJekI7SUFBRCxvQkFBQztDQUFBLEFBL0lELElBK0lDO1NBL0lZLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIE5nTW9kdWxlLCBOZ1pvbmUsIFRlc3RhYmlsaXR5fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi9jb21tb24vYW5ndWxhcjEnO1xuaW1wb3J0IHskJFRFU1RBQklMSVRZLCAkREVMRUdBVEUsICRJTkpFQ1RPUiwgJElOVEVSVkFMLCAkUFJPVklERSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFVQR1JBREVfQVBQX1RZUEVfS0VZLCBVUEdSQURFX01PRFVMRV9OQU1FfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgVXBncmFkZUFwcFR5cGUsIGNvbnRyb2xsZXJLZXl9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuaW1wb3J0IHthbmd1bGFyMVByb3ZpZGVycywgc2V0VGVtcEluamVjdG9yUmVmfSBmcm9tICcuL2FuZ3VsYXIxX3Byb3ZpZGVycyc7XG5pbXBvcnQge05nQWRhcHRlckluamVjdG9yfSBmcm9tICcuL3V0aWwnO1xuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYE5nTW9kdWxlYCwgd2hpY2ggeW91IGltcG9ydCB0byBwcm92aWRlIEFuZ3VsYXJKUyBjb3JlIHNlcnZpY2VzLFxuICogYW5kIGhhcyBhbiBpbnN0YW5jZSBtZXRob2QgdXNlZCB0byBib290c3RyYXAgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlL3N0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGUgYHVwZ3JhZGUvc3RhdGljYCBwYWNrYWdlIGNvbnRhaW5zIGhlbHBlcnMgdGhhdCBhbGxvdyBBbmd1bGFySlMgYW5kIEFuZ3VsYXIgY29tcG9uZW50c1xuICogdG8gYmUgdXNlZCB0b2dldGhlciBpbnNpZGUgYSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbiwgd2hpY2ggc3VwcG9ydHMgQW9UIGNvbXBpbGF0aW9uLlxuICpcbiAqIFNwZWNpZmljYWxseSwgdGhlIGNsYXNzZXMgYW5kIGZ1bmN0aW9ucyBpbiB0aGUgYHVwZ3JhZGUvc3RhdGljYCBtb2R1bGUgYWxsb3cgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAxLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhciB0ZW1wbGF0ZS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDIuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFyIGNvbXBvbmVudCBzb1xuICogICAgdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiBhbiBBbmd1bGFySlMgdGVtcGxhdGUuIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDMuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXIgcm9vdCBpbmplY3RvciBwcm92aWRlciB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKU1xuICogICAgc2VydmljZSBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXIgY29udGV4dC4gU2VlXG4gKiAgICB7QGxpbmsgVXBncmFkZU1vZHVsZSN1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2UgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlfSBiZWxvdy5cbiAqIDQuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBpbmplY3RhYmxlXG4gKiAgICBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXJKUyBjb250ZXh0LiBTZWUgYGRvd25ncmFkZUluamVjdGFibGVgLlxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG4gKiBgYGBcbiAqXG4gKiBTZWUgYWxzbyB0aGUge0BsaW5rIFVwZ3JhZGVNb2R1bGUjZXhhbXBsZXMgZXhhbXBsZXN9IGJlbG93LlxuICpcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXJKUyBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSB0aGUgQW5ndWxhciBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNS4gQW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYW4gYmUgXCJ1cGdyYWRlZFwiXCIgdG8gYW4gQW5ndWxhciBjb21wb25lbnQuIFRoaXMgaXMgYWNoaWV2ZWQgYnlcbiAqICAgIGRlZmluaW5nIGFuIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGF0IGl0cyBsb2NhdGlvblxuICogICAgaW4gdGhlIERPTS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDYuIEFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbiBiZSBcImRvd25ncmFkZWRcIiB0byBhbiBBbmd1bGFySlMgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFySlMgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFyIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDcuIFdoZW5ldmVyIGFuIFwidXBncmFkZWRcIi9cImRvd25ncmFkZWRcIiBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnlcbiAqICAgIHRoZSBmcmFtZXdvcmsgZG9pbmcgdGhlIGluc3RhbnRpYXRpb24uIFRoZSBvdGhlciBmcmFtZXdvcmsgdGhlbiBpbnN0YW50aWF0ZXMgYW5kIG93bnMgdGhlXG4gKiAgICB2aWV3IGZvciB0aGF0IGNvbXBvbmVudC5cbiAqICAgIDEuIFRoaXMgaW1wbGllcyB0aGF0IHRoZSBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay5cbiAqICAgIDIuIFRoZSBET00gYXR0cmlidXRlcyBhcmUgcGFyc2VkIGJ5IHRoZSBmcmFtZXdvcmsgdGhhdCBvd25zIHRoZSBjdXJyZW50IHRlbXBsYXRlLiBTb1xuICogICAgICAgYXR0cmlidXRlcyBpbiBBbmd1bGFySlMgdGVtcGxhdGVzIG11c3QgdXNlIGtlYmFiLWNhc2UsIHdoaWxlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMgbXVzdCB1c2VcbiAqICAgICAgIGNhbWVsQ2FzZS5cbiAqICAgIDMuIEhvd2V2ZXIgdGhlIHRlbXBsYXRlIGJpbmRpbmcgc3ludGF4IHdpbGwgYWx3YXlzIHVzZSB0aGUgQW5ndWxhciBzdHlsZSwgZS5nLiBzcXVhcmVcbiAqICAgICAgIGJyYWNrZXRzIChgWy4uLl1gKSBmb3IgcHJvcGVydHkgYmluZGluZy5cbiAqIDguIEFuZ3VsYXIgaXMgYm9vdHN0cmFwcGVkIGZpcnN0OyBBbmd1bGFySlMgaXMgYm9vdHN0cmFwcGVkIHNlY29uZC4gQW5ndWxhckpTIGFsd2F5cyBvd25zIHRoZVxuICogICAgcm9vdCBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGFuIEFuZ3VsYXIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHMgdG9cbiAqICAgIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIFRoZSBgVXBncmFkZU1vZHVsZWAgY2xhc3NcbiAqXG4gKiBUaGlzIGNsYXNzIGlzIGFuIGBOZ01vZHVsZWAsIHdoaWNoIHlvdSBpbXBvcnQgdG8gcHJvdmlkZSBBbmd1bGFySlMgY29yZSBzZXJ2aWNlcyxcbiAqIGFuZCBoYXMgYW4gaW5zdGFuY2UgbWV0aG9kIHVzZWQgdG8gYm9vdHN0cmFwIHRoZSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAqIENvcmUgQW5ndWxhckpTIHNlcnZpY2VzXG4gKiAgIEltcG9ydGluZyB0aGlzIGBOZ01vZHVsZWAgd2lsbCBhZGQgcHJvdmlkZXJzIGZvciB0aGUgY29yZVxuICogICBbQW5ndWxhckpTIHNlcnZpY2VzXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZSkgdG8gdGhlIHJvb3QgaW5qZWN0b3IuXG4gKlxuICogKiBCb290c3RyYXBcbiAqICAgVGhlIHJ1bnRpbWUgaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcyBjb250YWlucyBhIHtAbGluayBVcGdyYWRlTW9kdWxlI2Jvb3RzdHJhcCBgYm9vdHN0cmFwKClgfVxuICogICBtZXRob2QsIHdoaWNoIHlvdSB1c2UgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWwgQW5ndWxhckpTIG1vZHVsZSBvbnRvIGFuIGVsZW1lbnQgaW4gdGhlXG4gKiAgIERPTSBmb3IgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcC5cbiAqXG4gKiAgIEl0IGFsc28gY29udGFpbnMgcHJvcGVydGllcyB0byBhY2Nlc3MgdGhlIHtAbGluayBVcGdyYWRlTW9kdWxlI2luamVjdG9yIHJvb3QgaW5qZWN0b3J9LCB0aGVcbiAqICAgYm9vdHN0cmFwIGBOZ1pvbmVgIGFuZCB0aGVcbiAqICAgW0FuZ3VsYXJKUyAkaW5qZWN0b3JdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9hdXRvL3NlcnZpY2UvJGluamVjdG9yKS5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBJbXBvcnQgdGhlIGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgdG9wIGxldmVsIHtAbGluayBOZ01vZHVsZSBBbmd1bGFyIGBOZ01vZHVsZWB9LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J25nMi1tb2R1bGUnfVxuICpcbiAqIFRoZW4gaW5qZWN0IGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgQW5ndWxhciBgTmdNb2R1bGVgIGFuZCB1c2UgaXQgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWxcbiAqIFtBbmd1bGFySlMgbW9kdWxlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS9hbmd1bGFyLk1vZHVsZSkgaW4gdGhlXG4gKiBgbmdEb0Jvb3RzdHJhcCgpYCBtZXRob2QuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMSd9XG4gKlxuICogRmluYWxseSwga2ljayBvZmYgdGhlIHdob2xlIHByb2Nlc3MsIGJ5IGJvb3RzdHJhcGluZyB5b3VyIHRvcCBsZXZlbCBBbmd1bGFyIGBOZ01vZHVsZWAuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMid9XG4gKlxuICoge0BhIHVwZ3JhZGluZy1hbi1hbmd1bGFyLTEtc2VydmljZX1cbiAqICMjIyBVcGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2VcbiAqXG4gKiBUaGVyZSBpcyBubyBzcGVjaWZpYyBBUEkgZm9yIHVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZS4gSW5zdGVhZCB5b3Ugc2hvdWxkIGp1c3QgZm9sbG93IHRoZVxuICogZm9sbG93aW5nIHJlY2lwZTpcbiAqXG4gKiBMZXQncyBzYXkgeW91IGhhdmUgYW4gQW5ndWxhckpTIHNlcnZpY2U6XG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS10ZXh0LWZvcm1hdHRlci1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3Ugc2hvdWxkIGRlZmluZSBhbiBBbmd1bGFyIHByb3ZpZGVyIHRvIGJlIGluY2x1ZGVkIGluIHlvdXIgYE5nTW9kdWxlYCBgcHJvdmlkZXJzYFxuICogcHJvcGVydHkuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cInVwZ3JhZGUtbmcxLXNlcnZpY2VcIn1cbiAqXG4gKiBUaGVuIHlvdSBjYW4gdXNlIHRoZSBcInVwZ3JhZGVkXCIgQW5ndWxhckpTIHNlcnZpY2UgYnkgaW5qZWN0aW5nIGl0IGludG8gYW4gQW5ndWxhciBjb21wb25lbnRcbiAqIG9yIHNlcnZpY2UuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cInVzZS1uZzEtdXBncmFkZWQtc2VydmljZVwifVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQE5nTW9kdWxlKHtwcm92aWRlcnM6IFthbmd1bGFyMVByb3ZpZGVyc119KVxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVNb2R1bGUge1xuICAvKipcbiAgICogVGhlIEFuZ3VsYXJKUyBgJGluamVjdG9yYCBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgJGluamVjdG9yOiBhbnkgLyphbmd1bGFyLklJbmplY3RvclNlcnZpY2UqLztcbiAgLyoqIFRoZSBBbmd1bGFyIEluamVjdG9yICoqL1xuICBwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIFRoZSByb290IGBJbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLiAqL1xuICAgICAgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgLyoqIFRoZSBib290c3RyYXAgem9uZSBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24gKi9cbiAgICAgIHB1YmxpYyBuZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuaW5qZWN0b3IgPSBuZXcgTmdBZGFwdGVySW5qZWN0b3IoaW5qZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJvb3RzdHJhcCBhbiBBbmd1bGFySlMgYXBwbGljYXRpb24gZnJvbSB0aGlzIE5nTW9kdWxlXG4gICAqIEBwYXJhbSBlbGVtZW50IHRoZSBlbGVtZW50IG9uIHdoaWNoIHRvIGJvb3RzdHJhcCB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSBbbW9kdWxlc10gdGhlIEFuZ3VsYXJKUyBtb2R1bGVzIHRvIGJvb3RzdHJhcCBmb3IgdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gW2NvbmZpZ10gb3B0aW9uYWwgZXh0cmEgQW5ndWxhckpTIGJvb3RzdHJhcCBjb25maWd1cmF0aW9uXG4gICAqL1xuICBib290c3RyYXAoXG4gICAgICBlbGVtZW50OiBFbGVtZW50LCBtb2R1bGVzOiBzdHJpbmdbXSA9IFtdLCBjb25maWc/OiBhbnkgLyphbmd1bGFyLklBbmd1bGFyQm9vdHN0cmFwQ29uZmlnKi8pIHtcbiAgICBjb25zdCBJTklUX01PRFVMRV9OQU1FID0gVVBHUkFERV9NT0RVTEVfTkFNRSArICcuaW5pdCc7XG5cbiAgICAvLyBDcmVhdGUgYW4gbmcxIG1vZHVsZSB0byBib290c3RyYXBcbiAgICBjb25zdCBpbml0TW9kdWxlID1cbiAgICAgICAgYW5ndWxhclxuICAgICAgICAgICAgLm1vZHVsZShJTklUX01PRFVMRV9OQU1FLCBbXSlcblxuICAgICAgICAgICAgLmNvbnN0YW50KFVQR1JBREVfQVBQX1RZUEVfS0VZLCBVcGdyYWRlQXBwVHlwZS5TdGF0aWMpXG5cbiAgICAgICAgICAgIC52YWx1ZShJTkpFQ1RPUl9LRVksIHRoaXMuaW5qZWN0b3IpXG5cbiAgICAgICAgICAgIC5mYWN0b3J5KFxuICAgICAgICAgICAgICAgIExBWllfTU9EVUxFX1JFRixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICBJTkpFQ1RPUl9LRVksXG4gICAgICAgICAgICAgICAgICAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiAoeyBpbmplY3RvciwgbmVlZHNOZ1pvbmU6IGZhbHNlIH0gYXMgTGF6eU1vZHVsZVJlZilcbiAgICAgICAgICAgICAgICBdKVxuXG4gICAgICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAgICAgJFBST1ZJREUsICRJTkpFQ1RPUixcbiAgICAgICAgICAgICAgKCRwcm92aWRlOiBhbmd1bGFyLklQcm92aWRlU2VydmljZSwgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoJGluamVjdG9yLmhhcygkJFRFU1RBQklMSVRZKSkge1xuICAgICAgICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCQkVEVTVEFCSUxJVFksIFtcbiAgICAgICAgICAgICAgICAgICAgJERFTEVHQVRFLFxuICAgICAgICAgICAgICAgICAgICAodGVzdGFiaWxpdHlEZWxlZ2F0ZTogYW5ndWxhci5JVGVzdGFiaWxpdHlTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmplY3RvciA9IHRoaXMuaW5qZWN0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdXaGVuU3RhYmxlID0gZnVuY3Rpb24oY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFdoZW5TdGFibGUuY2FsbCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID0gaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5nMlRlc3RhYmlsaXR5LmlzU3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nMlRlc3RhYmlsaXR5LndoZW5TdGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1doZW5TdGFibGUuYmluZCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBjYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdGFiaWxpdHlEZWxlZ2F0ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJElOVEVSVkFMKSkge1xuICAgICAgICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCRJTlRFUlZBTCwgW1xuICAgICAgICAgICAgICAgICAgICAkREVMRUdBVEUsXG4gICAgICAgICAgICAgICAgICAgIChpbnRlcnZhbERlbGVnYXRlOiBhbmd1bGFyLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBXcmFwIHRoZSAkaW50ZXJ2YWwgc2VydmljZSBzbyB0aGF0IHNldEludGVydmFsIGlzIGNhbGxlZCBvdXRzaWRlIE5nWm9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhlIGNhbGxiYWNrIGlzIHN0aWxsIGludm9rZWQgd2l0aGluIGl0LiBUaGlzIGlzIHNvIHRoYXQgJGludGVydmFsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gd29uJ3QgYmxvY2sgc3RhYmlsaXR5LCB3aGljaCBwcmVzZXJ2ZXMgdGhlIGJlaGF2aW9yIGZyb20gQW5ndWxhckpTLlxuICAgICAgICAgICAgICAgICAgICAgIGxldCB3cmFwcGVkSW50ZXJ2YWwgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAoZm46IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCBjb3VudD86IG51bWJlciwgaW52b2tlQXBwbHk/OiBib29sZWFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucGFzczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsRGVsZWdhdGUoKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJ1biBjYWxsYmFjayBpbiB0aGUgbmV4dCBWTSB0dXJuIC0gJGludGVydmFsIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGFwcGx5LCBhbmQgcnVubmluZyB0aGUgY2FsbGJhY2sgaW4gTmdab25lIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2F1c2UgYSAnJGRpZ2VzdCBhbHJlYWR5IGluIHByb2dyZXNzJyBlcnJvciBpZiBpdCdzIGluIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzYW1lIHZtIHR1cm4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gZm4oLi4uYXJncykpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGRlbGF5LCBjb3VudCwgaW52b2tlQXBwbHksIC4uLnBhc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgKHdyYXBwZWRJbnRlcnZhbCBhcyBhbnkpWydjYW5jZWwnXSA9IGludGVydmFsRGVsZWdhdGUuY2FuY2VsO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3cmFwcGVkSW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgLnJ1bihbXG4gICAgICAgICAgICAgICRJTkpFQ1RPUixcbiAgICAgICAgICAgICAgKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kaW5qZWN0b3IgPSAkaW5qZWN0b3I7XG5cbiAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBuZzEgJGluamVjdG9yIHByb3ZpZGVyXG4gICAgICAgICAgICAgICAgc2V0VGVtcEluamVjdG9yUmVmKCRpbmplY3Rvcik7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmplY3Rvci5nZXQoJElOSkVDVE9SKTtcblxuICAgICAgICAgICAgICAgIC8vIFB1dCB0aGUgaW5qZWN0b3Igb24gdGhlIERPTSwgc28gdGhhdCBpdCBjYW4gYmUgXCJyZXF1aXJlZFwiXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLmRhdGEgIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIHRoaXMuaW5qZWN0b3IpO1xuXG4gICAgICAgICAgICAgICAgLy8gV2lyZSB1cCB0aGUgbmcxIHJvb3RTY29wZSB0byBydW4gYSBkaWdlc3QgY3ljbGUgd2hlbmV2ZXIgdGhlIHpvbmUgc2V0dGxlc1xuICAgICAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZG8gdGhpcyBpbiB0aGUgbmV4dCB0aWNrIHNvIHRoYXQgd2UgZG9uJ3QgcHJldmVudCB0aGUgYm9vdHVwXG4gICAgICAgICAgICAgICAgLy8gc3RhYmlsaXppbmdcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0ICRyb290U2NvcGUgPSAkaW5qZWN0b3IuZ2V0KCckcm9vdFNjb3BlJyk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPVxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmdab25lLm9uTWljcm90YXNrRW1wdHkuc3Vic2NyaWJlKCgpID0+ICRyb290U2NvcGUuJGRpZ2VzdCgpKTtcbiAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHsgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7IH0pO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcblxuICAgIGNvbnN0IHVwZ3JhZGVNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShVUEdSQURFX01PRFVMRV9OQU1FLCBbSU5JVF9NT0RVTEVfTkFNRV0uY29uY2F0KG1vZHVsZXMpKTtcblxuICAgIC8vIE1ha2Ugc3VyZSByZXN1bWVCb290c3RyYXAoKSBvbmx5IGV4aXN0cyBpZiB0aGUgY3VycmVudCBib290c3RyYXAgaXMgZGVmZXJyZWRcbiAgICBjb25zdCB3aW5kb3dBbmd1bGFyID0gKHdpbmRvdyBhcyBhbnkpWydhbmd1bGFyJ107XG4gICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBCb290c3RyYXAgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiBpbnNpZGUgb3VyIHpvbmVcbiAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4geyBhbmd1bGFyLmJvb3RzdHJhcChlbGVtZW50LCBbdXBncmFkZU1vZHVsZS5uYW1lXSwgY29uZmlnKTsgfSk7XG5cbiAgICAvLyBQYXRjaCByZXN1bWVCb290c3RyYXAoKSB0byBydW4gaW5zaWRlIHRoZSBuZ1pvbmVcbiAgICBpZiAod2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXApIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXA7XG4gICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLm5nWm9uZTtcbiAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICByZXR1cm4gbmdab25lLnJ1bigoKSA9PiB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcC5hcHBseSh0aGlzLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuIl19