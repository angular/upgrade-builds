/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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
export class PropertyBinding {
    /**
     * @param {?} prop
     * @param {?} attr
     */
    constructor(prop, attr) {
        this.prop = prop;
        this.attr = attr;
        this.parseBinding();
    }
    /**
     * @private
     * @return {?}
     */
    parseBinding() {
        this.bracketAttr = `[${this.attr}]`;
        this.parenAttr = `(${this.attr})`;
        this.bracketParenAttr = `[(${this.attr})]`;
        /** @type {?} */
        const capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.substr(1);
        this.onAttr = `on${capitalAttr}`;
        this.bindAttr = `bind${capitalAttr}`;
        this.bindonAttr = `bindon${capitalAttr}`;
    }
}
if (false) {
    /** @type {?} */
    PropertyBinding.prototype.bracketAttr;
    /** @type {?} */
    PropertyBinding.prototype.bracketParenAttr;
    /** @type {?} */
    PropertyBinding.prototype.parenAttr;
    /** @type {?} */
    PropertyBinding.prototype.onAttr;
    /** @type {?} */
    PropertyBinding.prototype.bindAttr;
    /** @type {?} */
    PropertyBinding.prototype.bindonAttr;
    /** @type {?} */
    PropertyBinding.prototype.prop;
    /** @type {?} */
    PropertyBinding.prototype.attr;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvY29tbW9uL2NvbXBvbmVudF9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBY0EsTUFBTSxPQUFPLGVBQWU7Ozs7O0lBYzFCLFlBQW1CLElBQVksRUFBUyxJQUFZO1FBQWpDLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQUMsQ0FBQzs7Ozs7SUFFdEUsWUFBWTtRQUNsQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDbEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDOztjQUNyQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzNFLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxXQUFXLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sV0FBVyxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLFdBQVcsRUFBRSxDQUFDO0lBQzNDLENBQUM7Q0FDRjs7O0lBdkJDLHNDQUFzQjs7SUFFdEIsMkNBQTJCOztJQUUzQixvQ0FBb0I7O0lBRXBCLGlDQUFpQjs7SUFFakIsbUNBQW1COztJQUVuQixxQ0FBcUI7O0lBRVQsK0JBQW1COztJQUFFLCtCQUFtQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIGBQcm9wZXJ0eUJpbmRpbmdgIHJlcHJlc2VudHMgYSBtYXBwaW5nIGJldHdlZW4gYSBwcm9wZXJ0eSBuYW1lXG4gKiBhbmQgYW4gYXR0cmlidXRlIG5hbWUuIEl0IGlzIHBhcnNlZCBmcm9tIGEgc3RyaW5nIG9mIHRoZSBmb3JtXG4gKiBgXCJwcm9wOiBhdHRyXCJgOyBvciBzaW1wbHkgYFwicHJvcEFuZEF0dHJcIiB3aGVyZSB0aGUgcHJvcGVydHlcbiAqIGFuZCBhdHRyaWJ1dGUgaGF2ZSB0aGUgc2FtZSBpZGVudGlmaWVyLlxuICovXG5leHBvcnQgY2xhc3MgUHJvcGVydHlCaW5kaW5nIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIGJyYWNrZXRBdHRyICE6IHN0cmluZztcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIGJyYWNrZXRQYXJlbkF0dHIgITogc3RyaW5nO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcGFyZW5BdHRyICE6IHN0cmluZztcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIG9uQXR0ciAhOiBzdHJpbmc7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBiaW5kQXR0ciAhOiBzdHJpbmc7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBiaW5kb25BdHRyICE6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvcDogc3RyaW5nLCBwdWJsaWMgYXR0cjogc3RyaW5nKSB7IHRoaXMucGFyc2VCaW5kaW5nKCk7IH1cblxuICBwcml2YXRlIHBhcnNlQmluZGluZygpIHtcbiAgICB0aGlzLmJyYWNrZXRBdHRyID0gYFske3RoaXMuYXR0cn1dYDtcbiAgICB0aGlzLnBhcmVuQXR0ciA9IGAoJHt0aGlzLmF0dHJ9KWA7XG4gICAgdGhpcy5icmFja2V0UGFyZW5BdHRyID0gYFsoJHt0aGlzLmF0dHJ9KV1gO1xuICAgIGNvbnN0IGNhcGl0YWxBdHRyID0gdGhpcy5hdHRyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5hdHRyLnN1YnN0cigxKTtcbiAgICB0aGlzLm9uQXR0ciA9IGBvbiR7Y2FwaXRhbEF0dHJ9YDtcbiAgICB0aGlzLmJpbmRBdHRyID0gYGJpbmQke2NhcGl0YWxBdHRyfWA7XG4gICAgdGhpcy5iaW5kb25BdHRyID0gYGJpbmRvbiR7Y2FwaXRhbEF0dHJ9YDtcbiAgfVxufVxuIl19