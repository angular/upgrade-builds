/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, NgModule, NgZone, Testability } from '@angular/core';
import * as angular from '../angular_js';
import { controllerKey } from '../util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { $$TESTABILITY, $DELEGATE, $INJECTOR, $PROVIDE, INJECTOR_KEY, UPGRADE_MODULE_NAME } from './constants';
/**
 * The Ng1Module contains providers for the Ng1Adapter and all the core Angular 1 services;
 * and also holds the `bootstrapNg1()` method fo bootstrapping an upgraded Angular 1 app.
 * @experimental
 */
export var UpgradeModule = (function () {
    function UpgradeModule(injector, ngZone) {
        this.injector = injector;
        this.ngZone = ngZone;
    }
    /**
     * Bootstrap an Angular 1 application from this NgModule
     * @param element the element on which to bootstrap the Angular 1 application
     * @param [modules] the Angular 1 modules to bootstrap for this application
     * @param [config] optional extra Angular 1 bootstrap configuration
     */
    UpgradeModule.prototype.bootstrap = function (element, modules, config) {
        var _this = this;
        if (modules === void 0) { modules = []; }
        // Create an ng1 module to bootstrap
        var upgradeModule = angular
            .module(UPGRADE_MODULE_NAME, modules)
            .value(INJECTOR_KEY, this.injector)
            .config([
            $PROVIDE, $INJECTOR,
            function ($provide, $injector) {
                if ($injector.has($$TESTABILITY)) {
                    $provide.decorator($$TESTABILITY, [
                        $DELEGATE,
                        function (testabilityDelegate) {
                            var originalWhenStable = testabilityDelegate.whenStable;
                            var injector = _this.injector;
                            // Cannot use arrow function below because we need to grab the context
                            var newWhenStable = function (callback) {
                                var whenStableContext = this;
                                originalWhenStable.call(this, function () {
                                    var ng2Testability = injector.get(Testability);
                                    if (ng2Testability.isStable()) {
                                        callback.apply(this, arguments);
                                    }
                                    else {
                                        ng2Testability.whenStable(newWhenStable.bind(whenStableContext, callback));
                                    }
                                });
                            };
                            testabilityDelegate.whenStable = newWhenStable;
                            return testabilityDelegate;
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
                var $rootScope = $injector.get('$rootScope');
                _this.ngZone.onMicrotaskEmpty.subscribe(function () { return _this.ngZone.runOutsideAngular(function () { return $rootScope.$evalAsync(); }); });
            }
        ]);
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        var windowAngular = window['angular'];
        windowAngular.resumeBootstrap = undefined;
        // Bootstrap the angular 1 application inside our zone
        this.ngZone.run(function () { angular.bootstrap(element, [upgradeModule.name], config); });
        // Patch resumeBootstrap() to run inside the ngZone
        if (windowAngular.resumeBootstrap) {
            var originalResumeBootstrap_1 = windowAngular.resumeBootstrap;
            var ngZone_1 = this.ngZone;
            windowAngular.resumeBootstrap = function () {
                var _this = this;
                var args = arguments;
                windowAngular.resumeBootstrap = originalResumeBootstrap_1;
                ngZone_1.run(function () { windowAngular.resumeBootstrap.apply(_this, args); });
            };
        }
    };
    UpgradeModule.decorators = [
        { type: NgModule, args: [{ providers: angular1Providers },] },
    ];
    /** @nocollapse */
    UpgradeModule.ctorParameters = [
        { type: Injector, },
        { type: NgZone, },
    ];
    return UpgradeModule;
}());
//# sourceMappingURL=upgrade_module.js.map