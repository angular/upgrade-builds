/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A `PropertyBinding` represents a mapping between a property name
 * and an attribute name. It is parsed from a string of the form
 * `"prop: attr"`; or simply `"propAndAttr" where the property
 * and attribute have the same identifier.
 */
export declare class PropertyBinding {
    prop: string;
    attr: string;
    bracketAttr: string;
    bracketParenAttr: string;
    parenAttr: string;
    onAttr: string;
    bindAttr: string;
    bindonAttr: string;
    constructor(prop: string, attr: string);
    private parseBinding();
}
