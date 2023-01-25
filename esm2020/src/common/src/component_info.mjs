/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
    constructor(prop, attr) {
        this.prop = prop;
        this.attr = attr;
        this.bracketAttr = `[${this.attr}]`;
        this.parenAttr = `(${this.attr})`;
        this.bracketParenAttr = `[(${this.attr})]`;
        const capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.slice(1);
        this.onAttr = `on${capitalAttr}`;
        this.bindAttr = `bind${capitalAttr}`;
        this.bindonAttr = `bindon${capitalAttr}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vc3JjL2NvbXBvbmVudF9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLGVBQWU7SUFRMUIsWUFBbUIsSUFBWSxFQUFTLElBQVk7UUFBakMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQVE7UUFDbEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztRQUMzQyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssV0FBVyxFQUFFLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLFdBQVcsRUFBRSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxXQUFXLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBBIGBQcm9wZXJ0eUJpbmRpbmdgIHJlcHJlc2VudHMgYSBtYXBwaW5nIGJldHdlZW4gYSBwcm9wZXJ0eSBuYW1lXG4gKiBhbmQgYW4gYXR0cmlidXRlIG5hbWUuIEl0IGlzIHBhcnNlZCBmcm9tIGEgc3RyaW5nIG9mIHRoZSBmb3JtXG4gKiBgXCJwcm9wOiBhdHRyXCJgOyBvciBzaW1wbHkgYFwicHJvcEFuZEF0dHJcIiB3aGVyZSB0aGUgcHJvcGVydHlcbiAqIGFuZCBhdHRyaWJ1dGUgaGF2ZSB0aGUgc2FtZSBpZGVudGlmaWVyLlxuICovXG5leHBvcnQgY2xhc3MgUHJvcGVydHlCaW5kaW5nIHtcbiAgYnJhY2tldEF0dHI6IHN0cmluZztcbiAgYnJhY2tldFBhcmVuQXR0cjogc3RyaW5nO1xuICBwYXJlbkF0dHI6IHN0cmluZztcbiAgb25BdHRyOiBzdHJpbmc7XG4gIGJpbmRBdHRyOiBzdHJpbmc7XG4gIGJpbmRvbkF0dHI6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvcDogc3RyaW5nLCBwdWJsaWMgYXR0cjogc3RyaW5nKSB7XG4gICAgdGhpcy5icmFja2V0QXR0ciA9IGBbJHt0aGlzLmF0dHJ9XWA7XG4gICAgdGhpcy5wYXJlbkF0dHIgPSBgKCR7dGhpcy5hdHRyfSlgO1xuICAgIHRoaXMuYnJhY2tldFBhcmVuQXR0ciA9IGBbKCR7dGhpcy5hdHRyfSldYDtcbiAgICBjb25zdCBjYXBpdGFsQXR0ciA9IHRoaXMuYXR0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuYXR0ci5zbGljZSgxKTtcbiAgICB0aGlzLm9uQXR0ciA9IGBvbiR7Y2FwaXRhbEF0dHJ9YDtcbiAgICB0aGlzLmJpbmRBdHRyID0gYGJpbmQke2NhcGl0YWxBdHRyfWA7XG4gICAgdGhpcy5iaW5kb25BdHRyID0gYGJpbmRvbiR7Y2FwaXRhbEF0dHJ9YDtcbiAgfVxufVxuIl19