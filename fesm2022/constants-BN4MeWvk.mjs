/**
 * @license Angular v19.2.5+sha-1232034
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
const noNgElement = (() => noNg());
noNgElement.cleanData = noNg;
let angular = {
    bootstrap: noNg,
    module: noNg,
    element: noNgElement,
    injector: noNg,
    version: undefined,
    resumeBootstrap: noNg,
    getTestability: noNg,
};
try {
    if (window.hasOwnProperty('angular')) {
        angular = window.angular;
    }
}
catch {
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
const bootstrap = (e, modules, config) => angular.bootstrap(e, modules, config);
// Do not declare as `module` to avoid webpack bug
// (see https://github.com/angular/angular/issues/30050).
const module_ = (prefix, dependencies) => angular.module(prefix, dependencies);
const element = ((e) => angular.element(e));
element.cleanData = (nodes) => angular.element.cleanData(nodes);
const injector = (modules, strictDi) => angular.injector(modules, strictDi);
const resumeBootstrap = () => angular.resumeBootstrap();
const getTestability = (e) => angular.getTestability(e);

var angular1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    bootstrap: bootstrap,
    element: element,
    getAngularJSGlobal: getAngularJSGlobal,
    getAngularLib: getAngularLib,
    getTestability: getTestability,
    injector: injector,
    module_: module_,
    resumeBootstrap: resumeBootstrap,
    setAngularJSGlobal: setAngularJSGlobal,
    setAngularLib: setAngularLib
});

const $COMPILE = '$compile';
const $CONTROLLER = '$controller';
const $DELEGATE = '$delegate';
const $EXCEPTION_HANDLER = '$exceptionHandler';
const $HTTP_BACKEND = '$httpBackend';
const $INJECTOR = '$injector';
const $INTERVAL = '$interval';
const $PARSE = '$parse';
const $PROVIDE = '$provide';
const $ROOT_ELEMENT = '$rootElement';
const $ROOT_SCOPE = '$rootScope';
const $SCOPE = '$scope';
const $TEMPLATE_CACHE = '$templateCache';
const $TEMPLATE_REQUEST = '$templateRequest';
const $$TESTABILITY = '$$testability';
const COMPILER_KEY = '$$angularCompiler';
const DOWNGRADED_MODULE_COUNT_KEY = '$$angularDowngradedModuleCount';
const GROUP_PROJECTABLE_NODES_KEY = '$$angularGroupProjectableNodes';
const INJECTOR_KEY = '$$angularInjector';
const LAZY_MODULE_REF = '$$angularLazyModuleRef';
const NG_ZONE_KEY = '$$angularNgZone';
const UPGRADE_APP_TYPE_KEY = '$$angularUpgradeAppType';
const REQUIRE_INJECTOR = '?^^' + INJECTOR_KEY;
const REQUIRE_NG_MODEL = '?ngModel';
const UPGRADE_MODULE_NAME = '$$UpgradeModule';

var constants = /*#__PURE__*/Object.freeze({
    __proto__: null,
    $$TESTABILITY: $$TESTABILITY,
    $COMPILE: $COMPILE,
    $CONTROLLER: $CONTROLLER,
    $DELEGATE: $DELEGATE,
    $EXCEPTION_HANDLER: $EXCEPTION_HANDLER,
    $HTTP_BACKEND: $HTTP_BACKEND,
    $INJECTOR: $INJECTOR,
    $INTERVAL: $INTERVAL,
    $PARSE: $PARSE,
    $PROVIDE: $PROVIDE,
    $ROOT_ELEMENT: $ROOT_ELEMENT,
    $ROOT_SCOPE: $ROOT_SCOPE,
    $SCOPE: $SCOPE,
    $TEMPLATE_CACHE: $TEMPLATE_CACHE,
    $TEMPLATE_REQUEST: $TEMPLATE_REQUEST,
    COMPILER_KEY: COMPILER_KEY,
    DOWNGRADED_MODULE_COUNT_KEY: DOWNGRADED_MODULE_COUNT_KEY,
    GROUP_PROJECTABLE_NODES_KEY: GROUP_PROJECTABLE_NODES_KEY,
    INJECTOR_KEY: INJECTOR_KEY,
    LAZY_MODULE_REF: LAZY_MODULE_REF,
    NG_ZONE_KEY: NG_ZONE_KEY,
    REQUIRE_INJECTOR: REQUIRE_INJECTOR,
    REQUIRE_NG_MODEL: REQUIRE_NG_MODEL,
    UPGRADE_APP_TYPE_KEY: UPGRADE_APP_TYPE_KEY,
    UPGRADE_MODULE_NAME: UPGRADE_MODULE_NAME
});

export { $SCOPE as $, COMPILER_KEY as C, DOWNGRADED_MODULE_COUNT_KEY as D, INJECTOR_KEY as I, LAZY_MODULE_REF as L, NG_ZONE_KEY as N, REQUIRE_INJECTOR as R, UPGRADE_APP_TYPE_KEY as U, $INJECTOR as a, bootstrap as b, $ROOT_SCOPE as c, $$TESTABILITY as d, element as e, $COMPILE as f, UPGRADE_MODULE_NAME as g, $PROVIDE as h, $DELEGATE as i, $INTERVAL as j, getAngularJSGlobal as k, getAngularLib as l, module_ as m, setAngularLib as n, angular1 as o, constants as p, $ROOT_ELEMENT as q, $PARSE as r, setAngularJSGlobal as s, REQUIRE_NG_MODEL as t, $CONTROLLER as u, $TEMPLATE_CACHE as v, $HTTP_BACKEND as w, injector as x };
//# sourceMappingURL=constants-BN4MeWvk.mjs.map
