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
var angular = {
    bootstrap: noNg,
    module: noNg,
    element: noNg,
    version: undefined,
    resumeBootstrap: noNg,
    getTestability: noNg
};
try {
    if (window.hasOwnProperty('angular')) {
        angular = window.angular;
    }
}
catch (e) {
    // ignore in CJS mode.
}
/**
 * @deprecated Use {@link setAngularJSGlobal} instead.
 */
export function setAngularLib(ng) {
    setAngularJSGlobal(ng);
}
/**
 * @deprecated Use {@link getAngularJSGlobal} instead.
 */
export function getAngularLib() {
    return getAngularJSGlobal();
}
/**
 * Resets the AngularJS global.
 *
 * Used when AngularJS is loaded lazily, and not available on `window`.
 *
 * @stable
 */
export function setAngularJSGlobal(ng) {
    angular = ng;
    version = ng && ng.version;
}
/**
 * Returns the current AngularJS global.
 *
 * @stable
 */
export function getAngularJSGlobal() {
    return angular;
}
export var bootstrap = function (e, modules, config) {
    return angular.bootstrap(e, modules, config);
};
export var module = function (prefix, dependencies) {
    return angular.module(prefix, dependencies);
};
export var element = function (e) { return angular.element(e); };
export var resumeBootstrap = function () { return angular.resumeBootstrap(); };
export var getTestability = function (e) { return angular.getTestability(e); };
export var version = angular.version;
//# sourceMappingURL=angular1.js.map