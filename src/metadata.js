/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DirectiveResolver } from '@angular/compiler/index';
const /** @type {?} */ COMPONENT_SELECTOR = /^[\w|-]*$/;
const /** @type {?} */ SKEWER_CASE = /-(\w)/g;
const /** @type {?} */ directiveResolver = new DirectiveResolver();
/**
 * @param {?} type
 * @return {?}
 */
export function getComponentInfo(type) {
    const /** @type {?} */ resolvedMetadata = directiveResolver.resolve(type);
    let /** @type {?} */ selector = resolvedMetadata.selector;
    if (!selector.match(COMPONENT_SELECTOR)) {
        throw new Error('Only selectors matching element names are supported, got: ' + selector);
    }
    selector = selector.replace(SKEWER_CASE, (all /** TODO #9100 */, letter) => letter.toUpperCase());
    return {
        type: type,
        selector: selector,
        inputs: parseFields(resolvedMetadata.inputs),
        outputs: parseFields(resolvedMetadata.outputs)
    };
}
/**
 * @param {?} names
 * @return {?}
 */
export function parseFields(names) {
    const /** @type {?} */ attrProps = [];
    if (names) {
        for (let /** @type {?} */ i = 0; i < names.length; i++) {
            const /** @type {?} */ parts = names[i].split(':');
            const /** @type {?} */ prop = parts[0].trim();
            const /** @type {?} */ attr = (parts[1] || parts[0]).trim();
            const /** @type {?} */ capitalAttr = attr.charAt(0).toUpperCase() + attr.substr(1);
            attrProps.push(/** @type {?} */ ({
                prop: prop,
                attr: attr,
                bracketAttr: `[${attr}]`,
                parenAttr: `(${attr})`,
                bracketParenAttr: `[(${attr})]`,
                onAttr: `on${capitalAttr}`,
                bindAttr: `bind${capitalAttr}`,
                bindonAttr: `bindon${capitalAttr}`
            }));
        }
    }
    return attrProps;
}
//# sourceMappingURL=metadata.js.map