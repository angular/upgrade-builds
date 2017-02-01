/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export var ContentProjectionHelper = (function () {
    function ContentProjectionHelper() {
    }
    /**
     * @param {?} $injector
     * @param {?} component
     * @param {?} nodes
     * @return {?}
     */
    ContentProjectionHelper.prototype.groupProjectableNodes = function ($injector, component, nodes) {
        // By default, do not support multi-slot projection,
        // as `upgrade/static` does not support it yet.
        return [nodes];
    };
    return ContentProjectionHelper;
}());
//# sourceMappingURL=content_projection_helper.js.map