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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vc3JjL2NvbXBvbmVudF9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLGVBQWU7SUFRMUIsWUFDUyxJQUFZLEVBQ1osSUFBWTtRQURaLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBRW5CLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQztRQUNsQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7UUFDM0MsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLFdBQVcsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxXQUFXLEVBQUUsQ0FBQztRQUNyQyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsV0FBVyxFQUFFLENBQUM7SUFDM0MsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQSBgUHJvcGVydHlCaW5kaW5nYCByZXByZXNlbnRzIGEgbWFwcGluZyBiZXR3ZWVuIGEgcHJvcGVydHkgbmFtZVxuICogYW5kIGFuIGF0dHJpYnV0ZSBuYW1lLiBJdCBpcyBwYXJzZWQgZnJvbSBhIHN0cmluZyBvZiB0aGUgZm9ybVxuICogYFwicHJvcDogYXR0clwiYDsgb3Igc2ltcGx5IGBcInByb3BBbmRBdHRyXCIgd2hlcmUgdGhlIHByb3BlcnR5XG4gKiBhbmQgYXR0cmlidXRlIGhhdmUgdGhlIHNhbWUgaWRlbnRpZmllci5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3BlcnR5QmluZGluZyB7XG4gIGJyYWNrZXRBdHRyOiBzdHJpbmc7XG4gIGJyYWNrZXRQYXJlbkF0dHI6IHN0cmluZztcbiAgcGFyZW5BdHRyOiBzdHJpbmc7XG4gIG9uQXR0cjogc3RyaW5nO1xuICBiaW5kQXR0cjogc3RyaW5nO1xuICBiaW5kb25BdHRyOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHByb3A6IHN0cmluZyxcbiAgICBwdWJsaWMgYXR0cjogc3RyaW5nLFxuICApIHtcbiAgICB0aGlzLmJyYWNrZXRBdHRyID0gYFske3RoaXMuYXR0cn1dYDtcbiAgICB0aGlzLnBhcmVuQXR0ciA9IGAoJHt0aGlzLmF0dHJ9KWA7XG4gICAgdGhpcy5icmFja2V0UGFyZW5BdHRyID0gYFsoJHt0aGlzLmF0dHJ9KV1gO1xuICAgIGNvbnN0IGNhcGl0YWxBdHRyID0gdGhpcy5hdHRyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGhpcy5hdHRyLnNsaWNlKDEpO1xuICAgIHRoaXMub25BdHRyID0gYG9uJHtjYXBpdGFsQXR0cn1gO1xuICAgIHRoaXMuYmluZEF0dHIgPSBgYmluZCR7Y2FwaXRhbEF0dHJ9YDtcbiAgICB0aGlzLmJpbmRvbkF0dHIgPSBgYmluZG9uJHtjYXBpdGFsQXR0cn1gO1xuICB9XG59XG4iXX0=