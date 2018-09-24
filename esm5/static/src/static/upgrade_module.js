import * as tslib_1 from "tslib";
import * as i0 from "@angular/core";
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
    UpgradeModule.ngModuleDef = i0.ɵdefineNgModule({ type: UpgradeModule, bootstrap: [], declarations: [], imports: [], exports: [] });
    UpgradeModule.ngInjectorDef = i0.defineInjector({ factory: function UpgradeModule_Factory() { return new UpgradeModule(i0.inject(i0.INJECTOR), i0.inject(NgZone)); }, providers: [angular1Providers], imports: [] });
    return UpgradeModule;
}());
export { UpgradeModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvc3RhdGljL3VwZ3JhZGVfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV0RSxPQUFPLEtBQUssT0FBTyxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqSixPQUFPLEVBQWdCLGFBQWEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTVELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzNFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUd6Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRIRztBQUNIO0lBU0U7SUFDSSx1REFBdUQ7SUFDdkQsUUFBa0I7SUFDbEIscURBQXFEO0lBQzlDLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxpQ0FBUyxHQUFULFVBQ0ksT0FBZ0IsRUFBRSxP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LGFBQWEsQ0FBQyxlQUFlLEdBQUcsU0FBUyxDQUFDO1FBRTFDLHNEQUFzRDtRQUN0RCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFRLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFckYsbURBQW1EO1FBQ25ELElBQUksYUFBYSxDQUFDLGVBQWUsRUFBRTtZQUNqQyxJQUFNLHlCQUF1QixHQUFlLGFBQWEsQ0FBQyxlQUFlLENBQUM7WUFDMUUsSUFBTSxRQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMzQixhQUFhLENBQUMsZUFBZSxHQUFHO2dCQUFBLGlCQUkvQjtnQkFIQyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUM7Z0JBQ3JCLGFBQWEsQ0FBQyxlQUFlLEdBQUcseUJBQXVCLENBQUM7Z0JBQ3hELE9BQU8sUUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFNLE9BQUEsYUFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsS0FBSSxFQUFFLElBQUksQ0FBQyxFQUEvQyxDQUErQyxDQUFDLENBQUM7WUFDM0UsQ0FBQyxDQUFDO1NBQ0g7SUFDSCxDQUFDOzJEQTVJVSxhQUFhOzZHQUFiLGFBQWEsbUNBWUwsTUFBTSxrQkFiTCxDQUFDLGlCQUFpQixDQUFDO3dCQS9JekM7Q0E2UkMsQUE5SUQsSUE4SUM7U0E3SVksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RvciwgTmdNb2R1bGUsIE5nWm9uZSwgVGVzdGFiaWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5pbXBvcnQgeyQkVEVTVEFCSUxJVFksICRERUxFR0FURSwgJElOSkVDVE9SLCAkSU5URVJWQUwsICRQUk9WSURFLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgVVBHUkFERV9NT0RVTEVfTkFNRX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge0xhenlNb2R1bGVSZWYsIGNvbnRyb2xsZXJLZXl9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuaW1wb3J0IHthbmd1bGFyMVByb3ZpZGVycywgc2V0VGVtcEluamVjdG9yUmVmfSBmcm9tICcuL2FuZ3VsYXIxX3Byb3ZpZGVycyc7XG5pbXBvcnQge05nQWRhcHRlckluamVjdG9yfSBmcm9tICcuL3V0aWwnO1xuXG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQW4gYE5nTW9kdWxlYCwgd2hpY2ggeW91IGltcG9ydCB0byBwcm92aWRlIEFuZ3VsYXJKUyBjb3JlIHNlcnZpY2VzLFxuICogYW5kIGhhcyBhbiBpbnN0YW5jZSBtZXRob2QgdXNlZCB0byBib290c3RyYXAgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlL3N0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGUgYHVwZ3JhZGUvc3RhdGljYCBwYWNrYWdlIGNvbnRhaW5zIGhlbHBlcnMgdGhhdCBhbGxvdyBBbmd1bGFySlMgYW5kIEFuZ3VsYXIgY29tcG9uZW50c1xuICogdG8gYmUgdXNlZCB0b2dldGhlciBpbnNpZGUgYSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbiwgd2hpY2ggc3VwcG9ydHMgQW9UIGNvbXBpbGF0aW9uLlxuICpcbiAqIFNwZWNpZmljYWxseSwgdGhlIGNsYXNzZXMgYW5kIGZ1bmN0aW9ucyBpbiB0aGUgYHVwZ3JhZGUvc3RhdGljYCBtb2R1bGUgYWxsb3cgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAxLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhciB0ZW1wbGF0ZS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDIuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFyIGNvbXBvbmVudCBzb1xuICogICAgdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiBhbiBBbmd1bGFySlMgdGVtcGxhdGUuIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDMuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXIgcm9vdCBpbmplY3RvciBwcm92aWRlciB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXJKU1xuICogICAgc2VydmljZSBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXIgY29udGV4dC4gU2VlXG4gKiAgICB7QGxpbmsgVXBncmFkZU1vZHVsZSN1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2UgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlfSBiZWxvdy5cbiAqIDQuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBpbmplY3RhYmxlXG4gKiAgICBzbyB0aGF0IGl0IGNhbiBiZSBpbmplY3RlZCBpbnRvIGFuIEFuZ3VsYXJKUyBjb250ZXh0LiBTZWUgYGRvd25ncmFkZUluamVjdGFibGVgLlxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG4gKiBgYGBcbiAqXG4gKiBTZWUgYWxzbyB0aGUge0BsaW5rIFVwZ3JhZGVNb2R1bGUjZXhhbXBsZXMgZXhhbXBsZXN9IGJlbG93LlxuICpcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXJKUyBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSB0aGUgQW5ndWxhciBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNS4gQW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYW4gYmUgXCJ1cGdyYWRlZFwiXCIgdG8gYW4gQW5ndWxhciBjb21wb25lbnQuIFRoaXMgaXMgYWNoaWV2ZWQgYnlcbiAqICAgIGRlZmluaW5nIGFuIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGF0IGl0cyBsb2NhdGlvblxuICogICAgaW4gdGhlIERPTS4gU2VlIGBVcGdyYWRlQ29tcG9uZW50YC5cbiAqIDYuIEFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbiBiZSBcImRvd25ncmFkZWRcIiB0byBhbiBBbmd1bGFySlMgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFySlMgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFyIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgZG93bmdyYWRlQ29tcG9uZW50YC5cbiAqIDcuIFdoZW5ldmVyIGFuIFwidXBncmFkZWRcIi9cImRvd25ncmFkZWRcIiBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnlcbiAqICAgIHRoZSBmcmFtZXdvcmsgZG9pbmcgdGhlIGluc3RhbnRpYXRpb24uIFRoZSBvdGhlciBmcmFtZXdvcmsgdGhlbiBpbnN0YW50aWF0ZXMgYW5kIG93bnMgdGhlXG4gKiAgICB2aWV3IGZvciB0aGF0IGNvbXBvbmVudC5cbiAqICAgIDEuIFRoaXMgaW1wbGllcyB0aGF0IHRoZSBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay5cbiAqICAgIDIuIFRoZSBET00gYXR0cmlidXRlcyBhcmUgcGFyc2VkIGJ5IHRoZSBmcmFtZXdvcmsgdGhhdCBvd25zIHRoZSBjdXJyZW50IHRlbXBsYXRlLiBTb1xuICogICAgICAgYXR0cmlidXRlcyBpbiBBbmd1bGFySlMgdGVtcGxhdGVzIG11c3QgdXNlIGtlYmFiLWNhc2UsIHdoaWxlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMgbXVzdCB1c2VcbiAqICAgICAgIGNhbWVsQ2FzZS5cbiAqICAgIDMuIEhvd2V2ZXIgdGhlIHRlbXBsYXRlIGJpbmRpbmcgc3ludGF4IHdpbGwgYWx3YXlzIHVzZSB0aGUgQW5ndWxhciBzdHlsZSwgZS5nLiBzcXVhcmVcbiAqICAgICAgIGJyYWNrZXRzIChgWy4uLl1gKSBmb3IgcHJvcGVydHkgYmluZGluZy5cbiAqIDguIEFuZ3VsYXIgaXMgYm9vdHN0cmFwcGVkIGZpcnN0OyBBbmd1bGFySlMgaXMgYm9vdHN0cmFwcGVkIHNlY29uZC4gQW5ndWxhckpTIGFsd2F5cyBvd25zIHRoZVxuICogICAgcm9vdCBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIGFuIEFuZ3VsYXIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHMgdG9cbiAqICAgIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIFRoZSBgVXBncmFkZU1vZHVsZWAgY2xhc3NcbiAqXG4gKiBUaGlzIGNsYXNzIGlzIGFuIGBOZ01vZHVsZWAsIHdoaWNoIHlvdSBpbXBvcnQgdG8gcHJvdmlkZSBBbmd1bGFySlMgY29yZSBzZXJ2aWNlcyxcbiAqIGFuZCBoYXMgYW4gaW5zdGFuY2UgbWV0aG9kIHVzZWQgdG8gYm9vdHN0cmFwIHRoZSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAqIENvcmUgQW5ndWxhckpTIHNlcnZpY2VzXG4gKiAgIEltcG9ydGluZyB0aGlzIGBOZ01vZHVsZWAgd2lsbCBhZGQgcHJvdmlkZXJzIGZvciB0aGUgY29yZVxuICogICBbQW5ndWxhckpTIHNlcnZpY2VzXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZSkgdG8gdGhlIHJvb3QgaW5qZWN0b3IuXG4gKlxuICogKiBCb290c3RyYXBcbiAqICAgVGhlIHJ1bnRpbWUgaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcyBjb250YWlucyBhIHtAbGluayBVcGdyYWRlTW9kdWxlI2Jvb3RzdHJhcCBgYm9vdHN0cmFwKClgfVxuICogICBtZXRob2QsIHdoaWNoIHlvdSB1c2UgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWwgQW5ndWxhckpTIG1vZHVsZSBvbnRvIGFuIGVsZW1lbnQgaW4gdGhlXG4gKiAgIERPTSBmb3IgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcC5cbiAqXG4gKiAgIEl0IGFsc28gY29udGFpbnMgcHJvcGVydGllcyB0byBhY2Nlc3MgdGhlIHtAbGluayBVcGdyYWRlTW9kdWxlI2luamVjdG9yIHJvb3QgaW5qZWN0b3J9LCB0aGVcbiAqICAgYm9vdHN0cmFwIGBOZ1pvbmVgIGFuZCB0aGVcbiAqICAgW0FuZ3VsYXJKUyAkaW5qZWN0b3JdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9hdXRvL3NlcnZpY2UvJGluamVjdG9yKS5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBJbXBvcnQgdGhlIGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgdG9wIGxldmVsIHtAbGluayBOZ01vZHVsZSBBbmd1bGFyIGBOZ01vZHVsZWB9LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J25nMi1tb2R1bGUnfVxuICpcbiAqIFRoZW4gaW5qZWN0IGBVcGdyYWRlTW9kdWxlYCBpbnRvIHlvdXIgQW5ndWxhciBgTmdNb2R1bGVgIGFuZCB1c2UgaXQgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWxcbiAqIFtBbmd1bGFySlMgbW9kdWxlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS9hbmd1bGFyLk1vZHVsZSkgaW4gdGhlXG4gKiBgbmdEb0Jvb3RzdHJhcCgpYCBtZXRob2QuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMSd9XG4gKlxuICogRmluYWxseSwga2ljayBvZmYgdGhlIHdob2xlIHByb2Nlc3MsIGJ5IGJvb3RzdHJhcGluZyB5b3VyIHRvcCBsZXZlbCBBbmd1bGFyIGBOZ01vZHVsZWAuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj0nYm9vdHN0cmFwLW5nMid9XG4gKlxuICoge0BhIHVwZ3JhZGluZy1hbi1hbmd1bGFyLTEtc2VydmljZX1cbiAqICMjIyBVcGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2VcbiAqXG4gKiBUaGVyZSBpcyBubyBzcGVjaWZpYyBBUEkgZm9yIHVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZS4gSW5zdGVhZCB5b3Ugc2hvdWxkIGp1c3QgZm9sbG93IHRoZVxuICogZm9sbG93aW5nIHJlY2lwZTpcbiAqXG4gKiBMZXQncyBzYXkgeW91IGhhdmUgYW4gQW5ndWxhckpTIHNlcnZpY2U6XG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS10ZXh0LWZvcm1hdHRlci1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3Ugc2hvdWxkIGRlZmluZSBhbiBBbmd1bGFyIHByb3ZpZGVyIHRvIGJlIGluY2x1ZGVkIGluIHlvdXIgYE5nTW9kdWxlYCBgcHJvdmlkZXJzYFxuICogcHJvcGVydHkuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cInVwZ3JhZGUtbmcxLXNlcnZpY2VcIn1cbiAqXG4gKiBUaGVuIHlvdSBjYW4gdXNlIHRoZSBcInVwZ3JhZGVkXCIgQW5ndWxhckpTIHNlcnZpY2UgYnkgaW5qZWN0aW5nIGl0IGludG8gYW4gQW5ndWxhciBjb21wb25lbnRcbiAqIG9yIHNlcnZpY2UuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cInVzZS1uZzEtdXBncmFkZWQtc2VydmljZVwifVxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQE5nTW9kdWxlKHtwcm92aWRlcnM6IFthbmd1bGFyMVByb3ZpZGVyc119KVxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVNb2R1bGUge1xuICAvKipcbiAgICogVGhlIEFuZ3VsYXJKUyBgJGluamVjdG9yYCBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgJGluamVjdG9yOiBhbnkgLyphbmd1bGFyLklJbmplY3RvclNlcnZpY2UqLztcbiAgLyoqIFRoZSBBbmd1bGFyIEluamVjdG9yICoqL1xuICBwdWJsaWMgaW5qZWN0b3I6IEluamVjdG9yO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqIFRoZSByb290IGBJbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLiAqL1xuICAgICAgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgLyoqIFRoZSBib290c3RyYXAgem9uZSBmb3IgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24gKi9cbiAgICAgIHB1YmxpYyBuZ1pvbmU6IE5nWm9uZSkge1xuICAgIHRoaXMuaW5qZWN0b3IgPSBuZXcgTmdBZGFwdGVySW5qZWN0b3IoaW5qZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJvb3RzdHJhcCBhbiBBbmd1bGFySlMgYXBwbGljYXRpb24gZnJvbSB0aGlzIE5nTW9kdWxlXG4gICAqIEBwYXJhbSBlbGVtZW50IHRoZSBlbGVtZW50IG9uIHdoaWNoIHRvIGJvb3RzdHJhcCB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uXG4gICAqIEBwYXJhbSBbbW9kdWxlc10gdGhlIEFuZ3VsYXJKUyBtb2R1bGVzIHRvIGJvb3RzdHJhcCBmb3IgdGhpcyBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gW2NvbmZpZ10gb3B0aW9uYWwgZXh0cmEgQW5ndWxhckpTIGJvb3RzdHJhcCBjb25maWd1cmF0aW9uXG4gICAqL1xuICBib290c3RyYXAoXG4gICAgICBlbGVtZW50OiBFbGVtZW50LCBtb2R1bGVzOiBzdHJpbmdbXSA9IFtdLCBjb25maWc/OiBhbnkgLyphbmd1bGFyLklBbmd1bGFyQm9vdHN0cmFwQ29uZmlnKi8pIHtcbiAgICBjb25zdCBJTklUX01PRFVMRV9OQU1FID0gVVBHUkFERV9NT0RVTEVfTkFNRSArICcuaW5pdCc7XG5cbiAgICAvLyBDcmVhdGUgYW4gbmcxIG1vZHVsZSB0byBib290c3RyYXBcbiAgICBjb25zdCBpbml0TW9kdWxlID1cbiAgICAgICAgYW5ndWxhclxuICAgICAgICAgICAgLm1vZHVsZShJTklUX01PRFVMRV9OQU1FLCBbXSlcblxuICAgICAgICAgICAgLnZhbHVlKElOSkVDVE9SX0tFWSwgdGhpcy5pbmplY3RvcilcblxuICAgICAgICAgICAgLmZhY3RvcnkoXG4gICAgICAgICAgICAgICAgTEFaWV9NT0RVTEVfUkVGLFxuICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgIElOSkVDVE9SX0tFWSxcbiAgICAgICAgICAgICAgICAgIChpbmplY3RvcjogSW5qZWN0b3IpID0+ICh7IGluamVjdG9yLCBuZWVkc05nWm9uZTogZmFsc2UgfSBhcyBMYXp5TW9kdWxlUmVmKVxuICAgICAgICAgICAgICAgIF0pXG5cbiAgICAgICAgICAgIC5jb25maWcoW1xuICAgICAgICAgICAgICAkUFJPVklERSwgJElOSkVDVE9SLFxuICAgICAgICAgICAgICAoJHByb3ZpZGU6IGFuZ3VsYXIuSVByb3ZpZGVTZXJ2aWNlLCAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCQkVEVTVEFCSUxJVFkpKSB7XG4gICAgICAgICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJCRURVNUQUJJTElUWSwgW1xuICAgICAgICAgICAgICAgICAgICAkREVMRUdBVEUsXG4gICAgICAgICAgICAgICAgICAgICh0ZXN0YWJpbGl0eURlbGVnYXRlOiBhbmd1bGFyLklUZXN0YWJpbGl0eVNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbFdoZW5TdGFibGU6IEZ1bmN0aW9uID0gdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluamVjdG9yID0gdGhpcy5pbmplY3RvcjtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBDYW5ub3QgdXNlIGFycm93IGZ1bmN0aW9uIGJlbG93IGJlY2F1c2Ugd2UgbmVlZCB0aGUgY29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1doZW5TdGFibGUgPSBmdW5jdGlvbihjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsV2hlblN0YWJsZS5jYWxsKHRlc3RhYmlsaXR5RGVsZWdhdGUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZzJUZXN0YWJpbGl0eTogVGVzdGFiaWxpdHkgPSBpbmplY3Rvci5nZXQoVGVzdGFiaWxpdHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmcyVGVzdGFiaWxpdHkuaXNTdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmcyVGVzdGFiaWxpdHkud2hlblN0YWJsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3V2hlblN0YWJsZS5iaW5kKHRlc3RhYmlsaXR5RGVsZWdhdGUsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGUgPSBuZXdXaGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoJGluamVjdG9yLmhhcygkSU5URVJWQUwpKSB7XG4gICAgICAgICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJElOVEVSVkFMLCBbXG4gICAgICAgICAgICAgICAgICAgICRERUxFR0FURSxcbiAgICAgICAgICAgICAgICAgICAgKGludGVydmFsRGVsZWdhdGU6IGFuZ3VsYXIuSUludGVydmFsU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFdyYXAgdGhlICRpbnRlcnZhbCBzZXJ2aWNlIHNvIHRoYXQgc2V0SW50ZXJ2YWwgaXMgY2FsbGVkIG91dHNpZGUgTmdab25lLFxuICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1dCB0aGUgY2FsbGJhY2sgaXMgc3RpbGwgaW52b2tlZCB3aXRoaW4gaXQuIFRoaXMgaXMgc28gdGhhdCAkaW50ZXJ2YWxcbiAgICAgICAgICAgICAgICAgICAgICAvLyB3b24ndCBibG9jayBzdGFiaWxpdHksIHdoaWNoIHByZXNlcnZlcyB0aGUgYmVoYXZpb3IgZnJvbSBBbmd1bGFySlMuXG4gICAgICAgICAgICAgICAgICAgICAgbGV0IHdyYXBwZWRJbnRlcnZhbCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIChmbjogRnVuY3Rpb24sIGRlbGF5OiBudW1iZXIsIGNvdW50PzogbnVtYmVyLCBpbnZva2VBcHBseT86IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5wYXNzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW50ZXJ2YWxEZWxlZ2F0ZSgoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUnVuIGNhbGxiYWNrIGluIHRoZSBuZXh0IFZNIHR1cm4gLSAkaW50ZXJ2YWwgY2FsbHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gJHJvb3RTY29wZS4kYXBwbHksIGFuZCBydW5uaW5nIHRoZSBjYWxsYmFjayBpbiBOZ1pvbmUgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjYXVzZSBhICckZGlnZXN0IGFscmVhZHkgaW4gcHJvZ3Jlc3MnIGVycm9yIGlmIGl0J3MgaW4gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNhbWUgdm0gdHVybi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IHRoaXMubmdab25lLnJ1bigoKSA9PiBmbiguLi5hcmdzKSk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXksIGNvdW50LCBpbnZva2VBcHBseSwgLi4ucGFzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAod3JhcHBlZEludGVydmFsIGFzIGFueSlbJ2NhbmNlbCddID0gaW50ZXJ2YWxEZWxlZ2F0ZS5jYW5jZWw7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdyYXBwZWRJbnRlcnZhbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKVxuXG4gICAgICAgICAgICAucnVuKFtcbiAgICAgICAgICAgICAgJElOSkVDVE9SLFxuICAgICAgICAgICAgICAoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRpbmplY3RvciA9ICRpbmplY3RvcjtcblxuICAgICAgICAgICAgICAgIC8vIEluaXRpYWxpemUgdGhlIG5nMSAkaW5qZWN0b3IgcHJvdmlkZXJcbiAgICAgICAgICAgICAgICBzZXRUZW1wSW5qZWN0b3JSZWYoJGluamVjdG9yKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluamVjdG9yLmdldCgkSU5KRUNUT1IpO1xuXG4gICAgICAgICAgICAgICAgLy8gUHV0IHRoZSBpbmplY3RvciBvbiB0aGUgRE9NLCBzbyB0aGF0IGl0IGNhbiBiZSBcInJlcXVpcmVkXCJcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkuZGF0YSAhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgdGhpcy5pbmplY3Rvcik7XG5cbiAgICAgICAgICAgICAgICAvLyBXaXJlIHVwIHRoZSBuZzEgcm9vdFNjb3BlIHRvIHJ1biBhIGRpZ2VzdCBjeWNsZSB3aGVuZXZlciB0aGUgem9uZSBzZXR0bGVzXG4gICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBkbyB0aGlzIGluIHRoZSBuZXh0IHRpY2sgc28gdGhhdCB3ZSBkb24ndCBwcmV2ZW50IHRoZSBib290dXBcbiAgICAgICAgICAgICAgICAvLyBzdGFiaWxpemluZ1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgJHJvb3RTY29wZSA9ICRpbmplY3Rvci5nZXQoJyRyb290U2NvcGUnKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUub25NaWNyb3Rhc2tFbXB0eS5zdWJzY3JpYmUoKCkgPT4gJHJvb3RTY29wZS4kZGlnZXN0KCkpO1xuICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4geyBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTsgfSk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pO1xuXG4gICAgY29uc3QgdXBncmFkZU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKFVQR1JBREVfTU9EVUxFX05BTUUsIFtJTklUX01PRFVMRV9OQU1FXS5jb25jYXQobW9kdWxlcykpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHJlc3VtZUJvb3RzdHJhcCgpIG9ubHkgZXhpc3RzIGlmIHRoZSBjdXJyZW50IGJvb3RzdHJhcCBpcyBkZWZlcnJlZFxuICAgIGNvbnN0IHdpbmRvd0FuZ3VsYXIgPSAod2luZG93IGFzIGFueSlbJ2FuZ3VsYXInXTtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIEJvb3RzdHJhcCB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uIGluc2lkZSBvdXIgem9uZVxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7IGFuZ3VsYXIuYm9vdHN0cmFwKGVsZW1lbnQsIFt1cGdyYWRlTW9kdWxlLm5hbWVdLCBjb25maWcpOyB9KTtcblxuICAgIC8vIFBhdGNoIHJlc3VtZUJvb3RzdHJhcCgpIHRvIHJ1biBpbnNpZGUgdGhlIG5nWm9uZVxuICAgIGlmICh3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCkge1xuICAgICAgY29uc3Qgb3JpZ2luYWxSZXN1bWVCb290c3RyYXA6ICgpID0+IHZvaWQgPSB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcDtcbiAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMubmdab25lO1xuICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgbGV0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gb3JpZ2luYWxSZXN1bWVCb290c3RyYXA7XG4gICAgICAgIHJldHVybiBuZ1pvbmUucnVuKCgpID0+IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwLmFwcGx5KHRoaXMsIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfVxuICB9XG59XG4iXX0=