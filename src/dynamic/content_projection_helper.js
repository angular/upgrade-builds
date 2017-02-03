/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { CssSelector, SelectorMatcher, createElementCssSelector } from '@angular/compiler';
import { COMPILER_KEY } from '../common/constants';
import { ContentProjectionHelper } from '../common/content_projection_helper';
import { getAttributesAsArray, getComponentName } from '../common/util';
export var DynamicContentProjectionHelper = (function (_super) {
    __extends(DynamicContentProjectionHelper, _super);
    function DynamicContentProjectionHelper() {
        _super.apply(this, arguments);
    }
    /**
     * @param {?} $injector
     * @param {?} component
     * @param {?} nodes
     * @return {?}
     */
    DynamicContentProjectionHelper.prototype.groupProjectableNodes = function ($injector, component, nodes) {
        var /** @type {?} */ ng2Compiler = ($injector.get(COMPILER_KEY));
        var /** @type {?} */ ngContentSelectors = ng2Compiler.getNgContentSelectors(component);
        if (!ngContentSelectors) {
            throw new Error('Expecting ngContentSelectors for: ' + getComponentName(component));
        }
        return this.groupNodesBySelector(ngContentSelectors, nodes);
    };
    /**
     * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
     * @param {?} ngContentSelectors
     * @param {?} nodes
     * @return {?}
     */
    DynamicContentProjectionHelper.prototype.groupNodesBySelector = function (ngContentSelectors, nodes) {
        var /** @type {?} */ projectableNodes = [];
        var /** @type {?} */ matcher = new SelectorMatcher();
        var /** @type {?} */ wildcardNgContentIndex;
        for (var /** @type {?} */ i = 0, /** @type {?} */ ii = ngContentSelectors.length; i < ii; ++i) {
            projectableNodes[i] = [];
            var /** @type {?} */ selector = ngContentSelectors[i];
            if (selector === '*') {
                wildcardNgContentIndex = i;
            }
            else {
                matcher.addSelectables(CssSelector.parse(selector), i);
            }
        }
        var _loop_1 = function(j, jj) {
            var /** @type {?} */ ngContentIndices = [];
            var /** @type {?} */ node = nodes[j];
            var /** @type {?} */ selector = createElementCssSelector(node.nodeName.toLowerCase(), getAttributesAsArray(node));
            matcher.match(selector, function (_, index) { return ngContentIndices.push(index); });
            ngContentIndices.sort();
            if (wildcardNgContentIndex !== undefined) {
                ngContentIndices.push(wildcardNgContentIndex);
            }
            if (ngContentIndices.length) {
                projectableNodes[ngContentIndices[0]].push(node);
            }
        };
        for (var /** @type {?} */ j = 0, /** @type {?} */ jj = nodes.length; j < jj; ++j) {
            _loop_1(j, jj);
        }
        return projectableNodes;
    };
    return DynamicContentProjectionHelper;
}(ContentProjectionHelper));
//# sourceMappingURL=content_projection_helper.js.map