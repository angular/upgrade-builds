/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CssSelector, SelectorMatcher, createElementCssSelector } from '@angular/compiler/index';
import { COMPILER_KEY } from '../common/constants';
import { ContentProjectionHelper } from '../common/content_projection_helper';
import { getAttributesAsArray, getComponentName } from '../common/util';
export class DynamicContentProjectionHelper extends ContentProjectionHelper {
    /**
     * @param {?} $injector
     * @param {?} component
     * @param {?} nodes
     * @return {?}
     */
    groupProjectableNodes($injector, component, nodes) {
        const /** @type {?} */ ng2Compiler = ($injector.get(COMPILER_KEY));
        const /** @type {?} */ ngContentSelectors = ng2Compiler.getNgContentSelectors(component);
        if (!ngContentSelectors) {
            throw new Error('Expecting ngContentSelectors for: ' + getComponentName(component));
        }
        return this.groupNodesBySelector(ngContentSelectors, nodes);
    }
    /**
     * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
     * @param {?} ngContentSelectors
     * @param {?} nodes
     * @return {?}
     */
    groupNodesBySelector(ngContentSelectors, nodes) {
        const /** @type {?} */ projectableNodes = [];
        let /** @type {?} */ matcher = new SelectorMatcher();
        let /** @type {?} */ wildcardNgContentIndex;
        for (let /** @type {?} */ i = 0, /** @type {?} */ ii = ngContentSelectors.length; i < ii; ++i) {
            projectableNodes[i] = [];
            const /** @type {?} */ selector = ngContentSelectors[i];
            if (selector === '*') {
                wildcardNgContentIndex = i;
            }
            else {
                matcher.addSelectables(CssSelector.parse(selector), i);
            }
        }
        for (let /** @type {?} */ j = 0, /** @type {?} */ jj = nodes.length; j < jj; ++j) {
            const /** @type {?} */ ngContentIndices = [];
            const /** @type {?} */ node = nodes[j];
            const /** @type {?} */ selector = createElementCssSelector(node.nodeName.toLowerCase(), getAttributesAsArray(node));
            matcher.match(selector, (_, index) => ngContentIndices.push(index));
            ngContentIndices.sort();
            if (wildcardNgContentIndex !== undefined) {
                ngContentIndices.push(wildcardNgContentIndex);
            }
            if (ngContentIndices.length) {
                projectableNodes[ngContentIndices[0]].push(node);
            }
        }
        return projectableNodes;
    }
}
//# sourceMappingURL=content_projection_helper.js.map