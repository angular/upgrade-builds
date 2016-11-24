/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DirectiveResolver } from '@angular/compiler';
var /** @type {?} */ COMPONENT_SELECTOR = /^[\w|-]*$/;
var /** @type {?} */ SKEWER_CASE = /-(\w)/g;
var /** @type {?} */ directiveResolver = new DirectiveResolver();
/**
 * @param {?} type
 * @return {?}
 */
export function getComponentInfo(type) {
    var /** @type {?} */ resolvedMetadata = directiveResolver.resolve(type);
    var /** @type {?} */ selector = resolvedMetadata.selector;
    if (!selector.match(COMPONENT_SELECTOR)) {
        throw new Error('Only selectors matching element names are supported, got: ' + selector);
    }
    selector = selector.replace(SKEWER_CASE, function (all /** TODO #9100 */, letter) { return letter.toUpperCase(); });
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
    var /** @type {?} */ attrProps = [];
    if (names) {
        for (var /** @type {?} */ i = 0; i < names.length; i++) {
            var /** @type {?} */ parts = names[i].split(':');
            var /** @type {?} */ prop = parts[0].trim();
            var /** @type {?} */ attr = (parts[1] || parts[0]).trim();
            var /** @type {?} */ capitalAttr = attr.charAt(0).toUpperCase() + attr.substr(1);
            attrProps.push(/** @type {?} */ ({
                prop: prop,
                attr: attr,
                bracketAttr: "[" + attr + "]",
                parenAttr: "(" + attr + ")",
                bracketParenAttr: "[(" + attr + ")]",
                onAttr: "on" + capitalAttr,
                bindAttr: "bind" + capitalAttr,
                bindonAttr: "bindon" + capitalAttr
            }));
        }
    }
    return attrProps;
}
//# sourceMappingURL=metadata.js.map