/**
 * @license Angular v9.1.12
 * (c) 2010-2020 Google LLC. https://angular.io/
 * License: MIT
 */

import { __decorate, __metadata } from 'tslib';
import { NgModule, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
var noNgElement = (function () { return noNg(); });
noNgElement.cleanData = noNg;
var angular = {
    bootstrap: noNg,
    module: noNg,
    element: noNgElement,
    injector: noNg,
    version: undefined,
    resumeBootstrap: noNg,
    getTestability: noNg
};
try {
    if (window.hasOwnProperty('angular')) {
        angular = window.angular;
    }
}
catch (_a) {
    // ignore in CJS mode.
}
/**
 * @deprecated Use `setAngularJSGlobal` instead.
 *
 * @publicApi
 */
function setAngularLib(ng) {
    setAngularJSGlobal(ng);
}
/**
 * @deprecated Use `getAngularJSGlobal` instead.
 *
 * @publicApi
 */
function getAngularLib() {
    return getAngularJSGlobal();
}
/**
 * Resets the AngularJS global.
 *
 * Used when AngularJS is loaded lazily, and not available on `window`.
 *
 * @publicApi
 */
function setAngularJSGlobal(ng) {
    angular = ng;
}
/**
 * Returns the current AngularJS global.
 *
 * @publicApi
 */
function getAngularJSGlobal() {
    return angular;
}
var bootstrap = function (e, modules, config) {
    return angular.bootstrap(e, modules, config);
};
// Do not declare as `module` to avoid webpack bug
// (see https://github.com/angular/angular/issues/30050).
var module_ = function (prefix, dependencies) {
    return angular.module(prefix, dependencies);
};
var element = (function (e) { return angular.element(e); });
element.cleanData = function (nodes) { return angular.element.cleanData(nodes); };
var injector = function (modules, strictDi) { return angular.injector(modules, strictDi); };
var resumeBootstrap = function () { return angular.resumeBootstrap(); };
var getTestability = function (e) { return angular.getTestability(e); };

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var $COMPILE = '$compile';
var $CONTROLLER = '$controller';
var $DELEGATE = '$delegate';
var $EXCEPTION_HANDLER = '$exceptionHandler';
var $HTTP_BACKEND = '$httpBackend';
var $INJECTOR = '$injector';
var $INTERVAL = '$interval';
var $PARSE = '$parse';
var $PROVIDE = '$provide';
var $ROOT_SCOPE = '$rootScope';
var $SCOPE = '$scope';
var $TEMPLATE_CACHE = '$templateCache';
var $TEMPLATE_REQUEST = '$templateRequest';
var $$TESTABILITY = '$$testability';
var COMPILER_KEY = '$$angularCompiler';
var DOWNGRADED_MODULE_COUNT_KEY = '$$angularDowngradedModuleCount';
var GROUP_PROJECTABLE_NODES_KEY = '$$angularGroupProjectableNodes';
var INJECTOR_KEY = '$$angularInjector';
var LAZY_MODULE_REF = '$$angularLazyModuleRef';
var NG_ZONE_KEY = '$$angularNgZone';
var UPGRADE_APP_TYPE_KEY = '$$angularUpgradeAppType';
var REQUIRE_INJECTOR = '?^^' + INJECTOR_KEY;
var REQUIRE_NG_MODEL = '?ngModel';
var UPGRADE_MODULE_NAME = '$$UpgradeModule';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var $injector = null;
var injector$1;
function $injectorFactory() {
    return $injector;
}
var AngularTestingModule = /** @class */ (function () {
    function AngularTestingModule(i) {
        injector$1 = i;
    }
    AngularTestingModule = __decorate([
        NgModule({ providers: [{ provide: $INJECTOR, useFactory: $injectorFactory }] }),
        __metadata("design:paramtypes", [Injector])
    ], AngularTestingModule);
    return AngularTestingModule;
}());
/**
 * A helper function to use when unit testing Angular services that depend upon upgraded AngularJS
 * services.
 *
 * This function returns an `NgModule` decorated class that is configured to wire up the Angular
 * and AngularJS injectors without the need to actually bootstrap a hybrid application.
 * This makes it simpler and faster to unit test services.
 *
 * Use the returned class as an "import" when configuring the `TestBed`.
 *
 * In the following code snippet, we are configuring the TestBed with two imports.
 * The `Ng2AppModule` is the Angular part of our hybrid application and the `ng1AppModule` is the
 * AngularJS part.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts" region="angular-setup"></code-example>
 *
 * Once this is done we can get hold of services via the Angular `Injector` as normal.
 * Services that are (or have dependencies on) an upgraded AngularJS service, will be instantiated
 * as needed by the AngularJS `$injector`.
 *
 * In the following code snippet, `HeroesService` is an Angular service that depends upon an
 * AngularJS service, `titleCase`.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts" region="angular-spec"></code-example>
 *
 * <div class="alert is-important">
 *
 * This helper is for testing services not Components.
 * For Component testing you must still bootstrap a hybrid app. See `UpgradeModule` or
 * `downgradeModule` for more information.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The resulting configuration does not wire up AngularJS digests to Zone hooks. It is the
 * responsibility of the test writer to call `$rootScope.$apply`, as necessary, to trigger
 * AngularJS handlers of async events from Angular.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The helper sets up global variables to hold the shared Angular and AngularJS injectors.
 *
 * * Only call this helper once per spec.
 * * Do not use `createAngularTestingModule` in the same spec as `createAngularJSTestingModule`.
 *
 * </div>
 *
 * Here is the example application and its unit tests that use `createAngularTestingModule`
 * and `createAngularJSTestingModule`.
 *
 * <code-tabs>
 *  <code-pane header="module.spec.ts" path="upgrade/static/ts/full/module.spec.ts"></code-pane>
 *  <code-pane header="module.ts" path="upgrade/static/ts/full/module.ts"></code-pane>
 * </code-tabs>
 *
 *
 * @param angularJSModules a collection of the names of AngularJS modules to include in the
 * configuration.
 * @param [strictDi] whether the AngularJS injector should have `strictDI` enabled.
 *
 * @publicApi
 */
function createAngularTestingModule(angularJSModules, strictDi) {
    module_('$$angularJSTestingModule', angularJSModules)
        .constant(UPGRADE_APP_TYPE_KEY, 2 /* Static */)
        .factory(INJECTOR_KEY, function () { return injector$1; });
    $injector = injector(['ng', '$$angularJSTestingModule'], strictDi);
    return AngularTestingModule;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A helper function to use when unit testing AngularJS services that depend upon downgraded Angular
 * services.
 *
 * This function returns an AngularJS module that is configured to wire up the AngularJS and Angular
 * injectors without the need to actually bootstrap a hybrid application.
 * This makes it simpler and faster to unit test services.
 *
 * Use the returned AngularJS module in a call to
 * [`angular.mocks.module`](https://docs.angularjs.org/api/ngMock/function/angular.mock.module) to
 * include this module in the unit test injector.
 *
 * In the following code snippet, we are configuring the `$injector` with two modules:
 * The AngularJS `ng1AppModule`, which is the AngularJS part of our hybrid application and the
 * `Ng2AppModule`, which is the Angular part.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts"
 * region="angularjs-setup"></code-example>
 *
 * Once this is done we can get hold of services via the AngularJS `$injector` as normal.
 * Services that are (or have dependencies on) a downgraded Angular service, will be instantiated as
 * needed by the Angular root `Injector`.
 *
 * In the following code snippet, `heroesService` is a downgraded Angular service that we are
 * accessing from AngularJS.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts"
 * region="angularjs-spec"></code-example>
 *
 * <div class="alert is-important">
 *
 * This helper is for testing services not components.
 * For Component testing you must still bootstrap a hybrid app. See `UpgradeModule` or
 * `downgradeModule` for more information.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The resulting configuration does not wire up AngularJS digests to Zone hooks. It is the
 * responsibility of the test writer to call `$rootScope.$apply`, as necessary, to trigger
 * AngularJS handlers of async events from Angular.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The helper sets up global variables to hold the shared Angular and AngularJS injectors.
 *
 * * Only call this helper once per spec.
 * * Do not use `createAngularJSTestingModule` in the same spec as `createAngularTestingModule`.
 *
 * </div>
 *
 * Here is the example application and its unit tests that use `createAngularTestingModule`
 * and `createAngularJSTestingModule`.
 *
 * <code-tabs>
 *  <code-pane header="module.spec.ts" path="upgrade/static/ts/full/module.spec.ts"></code-pane>
 *  <code-pane header="module.ts" path="upgrade/static/ts/full/module.ts"></code-pane>
 * </code-tabs>
 *
 *
 * @param angularModules a collection of Angular modules to include in the configuration.
 *
 * @publicApi
 */
function createAngularJSTestingModule(angularModules) {
    return module_('$$angularJSTestingModule', [])
        .constant(UPGRADE_APP_TYPE_KEY, 2 /* Static */)
        .factory(INJECTOR_KEY, [
        $INJECTOR,
        function ($injector) {
            TestBed.configureTestingModule({
                imports: angularModules,
                providers: [{ provide: $INJECTOR, useValue: $injector }]
            });
            return TestBed.inject(Injector);
        }
    ])
        .name;
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Generated bundle index. Do not edit.
 */

export { createAngularJSTestingModule, createAngularTestingModule, module_ as ɵangular_packages_upgrade_static_testing_testing_a, UPGRADE_APP_TYPE_KEY as ɵangular_packages_upgrade_static_testing_testing_b, INJECTOR_KEY as ɵangular_packages_upgrade_static_testing_testing_d };
//# sourceMappingURL=testing.js.map
