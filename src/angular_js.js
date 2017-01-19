/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @return {?}
 */
function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
let /** @type {?} */ angular = ({
    bootstrap: noNg,
    module: noNg,
    element: noNg,
    version: noNg,
    resumeBootstrap: noNg,
    getTestability: noNg
});
try {
    if (window.hasOwnProperty('angular')) {
        angular = ((window)).angular;
    }
}
catch (e) {
}
export const /** @type {?} */ bootstrap = angular.bootstrap;
export const /** @type {?} */ module = angular.module;
export const /** @type {?} */ element = angular.element;
export const /** @type {?} */ version = angular.version;
export const /** @type {?} */ resumeBootstrap = angular.resumeBootstrap;
export const /** @type {?} */ getTestability = angular.getTestability;
//# sourceMappingURL=angular_js.js.map