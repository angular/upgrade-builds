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
import { $$TESTABILITY, $DELEGATE, $INJECTOR, $INTERVAL, $PROVIDE, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_MODULE_NAME } from '../common/constants';
import { controllerKey } from '../common/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
/**
 * @description
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
 *    {@link UpgradeModule#upgrading-an-angular-1-service Upgrading an AngularJS service} below.
 * 4. Creation of an AngularJS service that wraps and exposes an Angular injectable
 *    so that it can be injected into an AngularJS context. See `downgradeInjectable`.
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application. See the
 *    {@link UpgradeModule#examples example} below.
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
 * The runtime instance of this class contains a {@link UpgradeModule#bootstrap `bootstrap()`}
 * method, which you use to bootstrap the top level AngularJS module onto an element in the
 * DOM for the hybrid upgrade app.
 *
 * It also contains properties to access the {@link UpgradeModule#injector root injector}, the
 * bootstrap `NgZone` and the
 * [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
 *
 * ### Examples
 *
 * Import the `UpgradeModule` into your top level {@link NgModule Angular `NgModule`}.
 *
 * {@example upgrade/static/ts/module.ts region='ng2-module'}
 *
 * Then bootstrap the hybrid upgrade app's module, get hold of the `UpgradeModule` instance
 * and use it to bootstrap the top level [AngularJS
 * module](https://docs.angularjs.org/api/ng/type/angular.Module).
 *
 * {@example upgrade/static/ts/module.ts region='bootstrap'}
 *
 * {@a upgrading-an-angular-1-service}
 *
 * ### Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {@example upgrade/static/ts/module.ts region="ng1-title-case-service"}
 *
 * Then you should define an Angular provider to be included in your `NgModule` `providers`
 * property.
 *
 * {@example upgrade/static/ts/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {@example upgrade/static/ts/module.ts region="use-ng1-upgraded-service"}
 *
 * @experimental
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
    UpgradeModule.decorators = [
        { type: NgModule, args: [{ providers: [angular1Providers] },] }
    ];
    /** @nocollapse */
    UpgradeModule.ctorParameters = function () { return [
        { type: Injector },
        { type: NgZone }
    ]; };
    return UpgradeModule;
}());
export { UpgradeModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvc3RhdGljL3VwZ3JhZGVfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRFLE9BQU8sS0FBSyxPQUFPLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2pKLE9BQU8sRUFBZ0IsYUFBYSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDM0UsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBR3pDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0R0c7QUFDSDtJQVNFO0lBQ0ksdURBQXVEO0lBQ3ZELFFBQWtCO0lBQ2xCLHFEQUFxRDtJQUM5QyxNQUFjO1FBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsaUNBQVMsR0FBVCxVQUNJLE9BQWdCLEVBQUUsT0FBc0IsRUFBRSxNQUFZLENB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QUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRTlGLCtFQUErRTtRQUMvRSxJQUFNLGFBQWEsR0FBSSxNQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsYUFBYSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7UUFFMUMsc0RBQXNEO1FBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGNBQVEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVyRixtREFBbUQ7UUFDbkQsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBTSx5QkFBdUIsR0FBZSxhQUFhLENBQUMsZUFBZSxDQUFDO1lBQzFFLElBQU0sUUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDM0IsYUFBYSxDQUFDLGVBQWUsR0FBRztnQkFBQSxpQkFJL0I7Z0JBSEMsSUFBSSxJQUFJLEdBQUcsU0FBUyxDQUFDO2dCQUNyQixhQUFhLENBQUMsZUFBZSxHQUFHLHlCQUF1QixDQUFDO2dCQUN4RCxNQUFNLENBQUMsUUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFNLE9BQUEsYUFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSSxFQUFFLElBQUksQ0FBQyxFQUEvQyxDQUErQyxDQUFDLENBQUM7WUFDM0UsQ0FBQyxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7O2dCQTdJRixRQUFRLFNBQUMsRUFBQyxTQUFTLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFDOzs7O2dCQXZIbEMsUUFBUTtnQkFBWSxNQUFNOztJQXFRbEMsb0JBQUM7Q0FBQSxBQTlJRCxJQThJQztTQTdJWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBOZ01vZHVsZSwgTmdab25lLCBUZXN0YWJpbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi4vY29tbW9uL2FuZ3VsYXIxJztcbmltcG9ydCB7JCRURVNUQUJJTElUWSwgJERFTEVHQVRFLCAkSU5KRUNUT1IsICRJTlRFUlZBTCwgJFBST1ZJREUsIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBVUEdSQURFX01PRFVMRV9OQU1FfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgY29udHJvbGxlcktleX0gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuXG5pbXBvcnQge2FuZ3VsYXIxUHJvdmlkZXJzLCBzZXRUZW1wSW5qZWN0b3JSZWZ9IGZyb20gJy4vYW5ndWxhcjFfcHJvdmlkZXJzJztcbmltcG9ydCB7TmdBZGFwdGVySW5qZWN0b3J9IGZyb20gJy4vdXRpbCc7XG5cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBbiBgTmdNb2R1bGVgLCB3aGljaCB5b3UgaW1wb3J0IHRvIHByb3ZpZGUgQW5ndWxhckpTIGNvcmUgc2VydmljZXMsXG4gKiBhbmQgaGFzIGFuIGluc3RhbmNlIG1ldGhvZCB1c2VkIHRvIGJvb3RzdHJhcCB0aGUgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhlIGB1cGdyYWRlL3N0YXRpY2AgcGFja2FnZSBjb250YWlucyBoZWxwZXJzIHRoYXQgYWxsb3cgQW5ndWxhckpTIGFuZCBBbmd1bGFyIGNvbXBvbmVudHNcbiAqIHRvIGJlIHVzZWQgdG9nZXRoZXIgaW5zaWRlIGEgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24sIHdoaWNoIHN1cHBvcnRzIEFvVCBjb21waWxhdGlvbi5cbiAqXG4gKiBTcGVjaWZpY2FsbHksIHRoZSBjbGFzc2VzIGFuZCBmdW5jdGlvbnMgaW4gdGhlIGB1cGdyYWRlL3N0YXRpY2AgbW9kdWxlIGFsbG93IHRoZSBmb2xsb3dpbmc6XG4gKiAxLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhciB0ZW1wbGF0ZS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDIuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFyIGNvbXBvbmVudCBzb1xuICogICAgdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiBhbiBBbmd1bGFySlMgdGVtcGxhdGUuIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDMuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXIgcm9vdCBpbmplY3RvciBwcm92aWRlciB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKU1xuICogICAgc2VydmljZSBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXIgY29udGV4dC4gU2VlXG4gKiAgICB7QGxpbmsgVXBncmFkZU1vZHVsZSN1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2UgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlfSBiZWxvdy5cbiAqIDQuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBpbmplY3RhYmxlXG4gKiAgICBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXJKUyBjb250ZXh0LiBTZWUgYGRvd25ncmFkZUluamVjdGFibGVgLlxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uIFNlZSB0aGVcbiAqICAgIHtAbGluayBVcGdyYWRlTW9kdWxlI2V4YW1wbGVzIGV4YW1wbGV9IGJlbG93LlxuICpcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXJKUyBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSB0aGUgQW5ndWxhciBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNS4gQW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYW4gYmUgXCJ1cGdyYWRlZFwiXCIgdG8gYW4gQW5ndWxhciBjb21wb25lbnQuIFRoaXMgaXMgYWNoaWV2ZWQgYnlcbiAqICAgIGRlZmluaW5nIGFuIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGF0IGl0cyBsb2NhdGlvblxuICogICAgaW4gdGhlIERPTS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDYuIEFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbiBiZSBcImRvd25ncmFkZWRcIlwiIHRvIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQuIFRoaXMgaXMgYWNoaWV2ZWQgYnlcbiAqICAgIGRlZmluaW5nIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXIgY29tcG9uZW50IGF0IGl0cyBsb2NhdGlvblxuICogICAgaW4gdGhlIERPTS4gU2VlIGBkb3duZ3JhZGVDb21wb25lbnRgLlxuICogNy4gV2hlbmV2ZXIgYW4gXCJ1cGdyYWRlZFwiL1wiZG93bmdyYWRlZFwiIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieVxuICogICAgdGhlIGZyYW1ld29yayBkb2luZyB0aGUgaW5zdGFudGlhdGlvbi4gVGhlIG90aGVyIGZyYW1ld29yayB0aGVuIGluc3RhbnRpYXRlcyBhbmQgb3ducyB0aGVcbiAqICAgIHZpZXcgZm9yIHRoYXQgY29tcG9uZW50LlxuICogICAgYS4gVGhpcyBpbXBsaWVzIHRoYXQgdGhlIGNvbXBvbmVudCBiaW5kaW5ncyB3aWxsIGFsd2F5cyBmb2xsb3cgdGhlIHNlbWFudGljcyBvZiB0aGVcbiAqICAgICAgIGluc3RhbnRpYXRpb24gZnJhbWV3b3JrLlxuICogICAgYi4gVGhlIERPTSBhdHRyaWJ1dGVzIGFyZSBwYXJzZWQgYnkgdGhlIGZyYW1ld29yayB0aGF0IG93bnMgdGhlIGN1cnJlbnQgdGVtcGxhdGUuIFNvXG4gKiAgICAgICBhdHRyaWJ1dGVzIGluIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMgbXVzdCB1c2Uga2ViYWItY2FzZSwgd2hpbGUgQW5ndWxhckpTIHRlbXBsYXRlcyBtdXN0XG4gKiAgICAgICB1c2UgY2FtZWxDYXNlLlxuICogICAgYy4gSG93ZXZlciB0aGUgdGVtcGxhdGUgYmluZGluZyBzeW50YXggd2lsbCBhbHdheXMgdXNlIHRoZSBBbmd1bGFyIHN0eWxlLCBlLmcuIHNxdWFyZVxuICogICAgICAgYnJhY2tldHMgKGBbLi4uXWApIGZvciBwcm9wZXJ0eSBiaW5kaW5nLlxuICogOC4gQW5ndWxhciBpcyBib290c3RyYXBwZWQgZmlyc3Q7IEFuZ3VsYXJKUyBpcyBib290c3RyYXBwZWQgc2Vjb25kLiBBbmd1bGFySlMgYWx3YXlzIG93bnMgdGhlXG4gKiAgICByb290IGNvbXBvbmVudCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKiA5LiBUaGUgbmV3IGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gYW4gQW5ndWxhciB6b25lLCBhbmQgdGhlcmVmb3JlIGl0IG5vIGxvbmdlciBuZWVkcyBjYWxsc1xuICogICAgdG8gYCRhcHBseSgpYC5cbiAqXG4gKiAjIyMgQ29yZSBBbmd1bGFySlMgc2VydmljZXNcbiAqIEltcG9ydGluZyB0aGlzIGBOZ01vZHVsZWAgd2lsbCBhZGQgcHJvdmlkZXJzIGZvciB0aGUgY29yZVxuICogW0FuZ3VsYXJKUyBzZXJ2aWNlc10oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3NlcnZpY2UpIHRvIHRoZSByb290IGluamVjdG9yLlxuICpcbiAqICMjIyBCb290c3RyYXBcbiAqIFRoZSBydW50aW1lIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgY29udGFpbnMgYSB7QGxpbmsgVXBncmFkZU1vZHVsZSNib290c3RyYXAgYGJvb3RzdHJhcCgpYH1cbiAqIG1ldGhvZCwgd2hpY2ggeW91IHVzZSB0byBib290c3RyYXAgdGhlIHRvcCBsZXZlbCBBbmd1bGFySlMgbW9kdWxlIG9udG8gYW4gZWxlbWVudCBpbiB0aGVcbiAqIERPTSBmb3IgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcC5cbiAqXG4gKiBJdCBhbHNvIGNvbnRhaW5zIHByb3BlcnRpZXMgdG8gYWNjZXNzIHRoZSB7QGxpbmsgVXBncmFkZU1vZHVsZSNpbmplY3RvciByb290IGluamVjdG9yfSwgdGhlXG4gKiBib290c3RyYXAgYE5nWm9uZWAgYW5kIHRoZVxuICogW0FuZ3VsYXJKUyAkaW5qZWN0b3JdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9hdXRvL3NlcnZpY2UvJGluamVjdG9yKS5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBJbXBvcnQgdGhlIGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgdG9wIGxldmVsIHtAbGluayBOZ01vZHVsZSBBbmd1bGFyIGBOZ01vZHVsZWB9LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9tb2R1bGUudHMgcmVnaW9uPSduZzItbW9kdWxlJ31cbiAqXG4gKiBUaGVuIGJvb3RzdHJhcCB0aGUgaHlicmlkIHVwZ3JhZGUgYXBwJ3MgbW9kdWxlLCBnZXQgaG9sZCBvZiB0aGUgYFVwZ3JhZGVNb2R1bGVgIGluc3RhbmNlXG4gKiBhbmQgdXNlIGl0IHRvIGJvb3RzdHJhcCB0aGUgdG9wIGxldmVsIFtBbmd1bGFySlNcbiAqIG1vZHVsZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvYW5ndWxhci5Nb2R1bGUpLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9tb2R1bGUudHMgcmVnaW9uPSdib290c3RyYXAnfVxuICpcbiAqIHtAYSB1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2V9XG4gKlxuICogIyMjIFVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZVxuICpcbiAqIFRoZXJlIGlzIG5vIHNwZWNpZmljIEFQSSBmb3IgdXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlLiBJbnN0ZWFkIHlvdSBzaG91bGQganVzdCBmb2xsb3cgdGhlXG4gKiBmb2xsb3dpbmcgcmVjaXBlOlxuICpcbiAqIExldCdzIHNheSB5b3UgaGF2ZSBhbiBBbmd1bGFySlMgc2VydmljZTpcbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS10aXRsZS1jYXNlLXNlcnZpY2VcIn1cbiAqXG4gKiBUaGVuIHlvdSBzaG91bGQgZGVmaW5lIGFuIEFuZ3VsYXIgcHJvdmlkZXIgdG8gYmUgaW5jbHVkZWQgaW4geW91ciBgTmdNb2R1bGVgIGBwcm92aWRlcnNgXG4gKiBwcm9wZXJ0eS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvbW9kdWxlLnRzIHJlZ2lvbj1cInVwZ3JhZGUtbmcxLXNlcnZpY2VcIn1cbiAqXG4gKiBUaGVuIHlvdSBjYW4gdXNlIHRoZSBcInVwZ3JhZGVkXCIgQW5ndWxhckpTIHNlcnZpY2UgYnkgaW5qZWN0aW5nIGl0IGludG8gYW4gQW5ndWxhciBjb21wb25lbnRcbiAqIG9yIHNlcnZpY2UuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL21vZHVsZS50cyByZWdpb249XCJ1c2UtbmcxLXVwZ3JhZGVkLXNlcnZpY2VcIn1cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBOZ01vZHVsZSh7cHJvdmlkZXJzOiBbYW5ndWxhcjFQcm92aWRlcnNdfSlcbmV4cG9ydCBjbGFzcyBVcGdyYWRlTW9kdWxlIHtcbiAgLyoqXG4gICAqIFRoZSBBbmd1bGFySlMgYCRpbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljICRpbmplY3RvcjogYW55IC8qYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKi87XG4gIC8qKiBUaGUgQW5ndWxhciBJbmplY3RvciAqKi9cbiAgcHVibGljIGluamVjdG9yOiBJbmplY3RvcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBUaGUgcm9vdCBgSW5qZWN0b3JgIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi4gKi9cbiAgICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgIC8qKiBUaGUgYm9vdHN0cmFwIHpvbmUgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uICovXG4gICAgICBwdWJsaWMgbmdab25lOiBOZ1pvbmUpIHtcbiAgICB0aGlzLmluamVjdG9yID0gbmV3IE5nQWRhcHRlckluamVjdG9yKGluamVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYW4gQW5ndWxhckpTIGFwcGxpY2F0aW9uIGZyb20gdGhpcyBOZ01vZHVsZVxuICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCBvbiB3aGljaCB0byBib290c3RyYXAgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gW21vZHVsZXNdIHRoZSBBbmd1bGFySlMgbW9kdWxlcyB0byBib290c3RyYXAgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIFtjb25maWddIG9wdGlvbmFsIGV4dHJhIEFuZ3VsYXJKUyBib290c3RyYXAgY29uZmlndXJhdGlvblxuICAgKi9cbiAgYm9vdHN0cmFwKFxuICAgICAgZWxlbWVudDogRWxlbWVudCwgbW9kdWxlczogc3RyaW5nW10gPSBbXSwgY29uZmlnPzogYW55IC8qYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyovKSB7XG4gICAgY29uc3QgSU5JVF9NT0RVTEVfTkFNRSA9IFVQR1JBREVfTU9EVUxFX05BTUUgKyAnLmluaXQnO1xuXG4gICAgLy8gQ3JlYXRlIGFuIG5nMSBtb2R1bGUgdG8gYm9vdHN0cmFwXG4gICAgY29uc3QgaW5pdE1vZHVsZSA9XG4gICAgICAgIGFuZ3VsYXJcbiAgICAgICAgICAgIC5tb2R1bGUoSU5JVF9NT0RVTEVfTkFNRSwgW10pXG5cbiAgICAgICAgICAgIC52YWx1ZShJTkpFQ1RPUl9LRVksIHRoaXMuaW5qZWN0b3IpXG5cbiAgICAgICAgICAgIC5mYWN0b3J5KFxuICAgICAgICAgICAgICAgIExBWllfTU9EVUxFX1JFRixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICBJTkpFQ1RPUl9LRVksXG4gICAgICAgICAgICAgICAgICAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiAoeyBpbmplY3RvciwgbmVlZHNOZ1pvbmU6IGZhbHNlIH0gYXMgTGF6eU1vZHVsZVJlZilcbiAgICAgICAgICAgICAgICBdKVxuXG4gICAgICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAgICAgJFBST1ZJREUsICRJTkpFQ1RPUixcbiAgICAgICAgICAgICAgKCRwcm92aWRlOiBhbmd1bGFyLklQcm92aWRlU2VydmljZSwgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoJGluamVjdG9yLmhhcygkJFRFU1RBQklMSVRZKSkge1xuICAgICAgICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCQkVEVTVEFCSUxJVFksIFtcbiAgICAgICAgICAgICAgICAgICAgJERFTEVHQVRFLFxuICAgICAgICAgICAgICAgICAgICAodGVzdGFiaWxpdHlEZWxlZ2F0ZTogYW5ndWxhci5JVGVzdGFiaWxpdHlTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmplY3RvciA9IHRoaXMuaW5qZWN0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdXaGVuU3RhYmxlID0gZnVuY3Rpb24oY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFdoZW5TdGFibGUuY2FsbCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID0gaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5nMlRlc3RhYmlsaXR5LmlzU3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nMlRlc3RhYmlsaXR5LndoZW5TdGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1doZW5TdGFibGUuYmluZCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBjYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdGFiaWxpdHlEZWxlZ2F0ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJElOVEVSVkFMKSkge1xuICAgICAgICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCRJTlRFUlZBTCwgW1xuICAgICAgICAgICAgICAgICAgICAkREVMRUdBVEUsXG4gICAgICAgICAgICAgICAgICAgIChpbnRlcnZhbERlbGVnYXRlOiBhbmd1bGFyLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBXcmFwIHRoZSAkaW50ZXJ2YWwgc2VydmljZSBzbyB0aGF0IHNldEludGVydmFsIGlzIGNhbGxlZCBvdXRzaWRlIE5nWm9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhlIGNhbGxiYWNrIGlzIHN0aWxsIGludm9rZWQgd2l0aGluIGl0LiBUaGlzIGlzIHNvIHRoYXQgJGludGVydmFsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gd29uJ3QgYmxvY2sgc3RhYmlsaXR5LCB3aGljaCBwcmVzZXJ2ZXMgdGhlIGJlaGF2aW9yIGZyb20gQW5ndWxhckpTLlxuICAgICAgICAgICAgICAgICAgICAgIGxldCB3cmFwcGVkSW50ZXJ2YWwgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAoZm46IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCBjb3VudD86IG51bWJlciwgaW52b2tlQXBwbHk/OiBib29sZWFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucGFzczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsRGVsZWdhdGUoKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJ1biBjYWxsYmFjayBpbiB0aGUgbmV4dCBWTSB0dXJuIC0gJGludGVydmFsIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGFwcGx5LCBhbmQgcnVubmluZyB0aGUgY2FsbGJhY2sgaW4gTmdab25lIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2F1c2UgYSAnJGRpZ2VzdCBhbHJlYWR5IGluIHByb2dyZXNzJyBlcnJvciBpZiBpdCdzIGluIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzYW1lIHZtIHR1cm4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gZm4oLi4uYXJncykpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGRlbGF5LCBjb3VudCwgaW52b2tlQXBwbHksIC4uLnBhc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgKHdyYXBwZWRJbnRlcnZhbCBhcyBhbnkpWydjYW5jZWwnXSA9IGludGVydmFsRGVsZWdhdGUuY2FuY2VsO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3cmFwcGVkSW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgLnJ1bihbXG4gICAgICAgICAgICAgICRJTkpFQ1RPUixcbiAgICAgICAgICAgICAgKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kaW5qZWN0b3IgPSAkaW5qZWN0b3I7XG5cbiAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBuZzEgJGluamVjdG9yIHByb3ZpZGVyXG4gICAgICAgICAgICAgICAgc2V0VGVtcEluamVjdG9yUmVmKCRpbmplY3Rvcik7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmplY3Rvci5nZXQoJElOSkVDVE9SKTtcblxuICAgICAgICAgICAgICAgIC8vIFB1dCB0aGUgaW5qZWN0b3Igb24gdGhlIERPTSwgc28gdGhhdCBpdCBjYW4gYmUgXCJyZXF1aXJlZFwiXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLmRhdGEgIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIHRoaXMuaW5qZWN0b3IpO1xuXG4gICAgICAgICAgICAgICAgLy8gV2lyZSB1cCB0aGUgbmcxIHJvb3RTY29wZSB0byBydW4gYSBkaWdlc3QgY3ljbGUgd2hlbmV2ZXIgdGhlIHpvbmUgc2V0dGxlc1xuICAgICAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZG8gdGhpcyBpbiB0aGUgbmV4dCB0aWNrIHNvIHRoYXQgd2UgZG9uJ3QgcHJldmVudCB0aGUgYm9vdHVwXG4gICAgICAgICAgICAgICAgLy8gc3RhYmlsaXppbmdcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0ICRyb290U2NvcGUgPSAkaW5qZWN0b3IuZ2V0KCckcm9vdFNjb3BlJyk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPVxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmdab25lLm9uTWljcm90YXNrRW1wdHkuc3Vic2NyaWJlKCgpID0+ICRyb290U2NvcGUuJGRpZ2VzdCgpKTtcbiAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHsgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7IH0pO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcblxuICAgIGNvbnN0IHVwZ3JhZGVNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShVUEdSQURFX01PRFVMRV9OQU1FLCBbSU5JVF9NT0RVTEVfTkFNRV0uY29uY2F0KG1vZHVsZXMpKTtcblxuICAgIC8vIE1ha2Ugc3VyZSByZXN1bWVCb290c3RyYXAoKSBvbmx5IGV4aXN0cyBpZiB0aGUgY3VycmVudCBib290c3RyYXAgaXMgZGVmZXJyZWRcbiAgICBjb25zdCB3aW5kb3dBbmd1bGFyID0gKHdpbmRvdyBhcyBhbnkpWydhbmd1bGFyJ107XG4gICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBCb290c3RyYXAgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiBpbnNpZGUgb3VyIHpvbmVcbiAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4geyBhbmd1bGFyLmJvb3RzdHJhcChlbGVtZW50LCBbdXBncmFkZU1vZHVsZS5uYW1lXSwgY29uZmlnKTsgfSk7XG5cbiAgICAvLyBQYXRjaCByZXN1bWVCb290c3RyYXAoKSB0byBydW4gaW5zaWRlIHRoZSBuZ1pvbmVcbiAgICBpZiAod2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXApIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXA7XG4gICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLm5nWm9uZTtcbiAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICByZXR1cm4gbmdab25lLnJ1bigoKSA9PiB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcC5hcHBseSh0aGlzLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuIl19