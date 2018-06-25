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
var PropertyBinding = /** @class */ (function () {
    function PropertyBinding(prop, attr) {
        this.prop = prop;
        this.attr = attr;
        this.parseBinding();
    }
    PropertyBinding.prototype.parseBinding = function () {
        this.bracketAttr = "[" + this.attr + "]";
        this.parenAttr = "(" + this.attr + ")";
        this.bracketParenAttr = "[(" + this.attr + ")]";
        var capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.substr(1);
        this.onAttr = "on" + capitalAttr;
        this.bindAttr = "bind" + capitalAttr;
        this.bindonAttr = "bindon" + capitalAttr;
    };
    return PropertyBinding;
}());
export { PropertyBinding };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvY29tbW9uL2NvbXBvbmVudF9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVIOzs7OztHQUtHO0FBQ0g7SUFRRSx5QkFBbUIsSUFBWSxFQUFTLElBQVk7UUFBakMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQVE7UUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFBQyxDQUFDO0lBRXRFLHNDQUFZLEdBQXBCO1FBQ0UsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFJLElBQUksQ0FBQyxJQUFJLE1BQUcsQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQUksSUFBSSxDQUFDLElBQUksTUFBRyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFLLElBQUksQ0FBQyxJQUFJLE9BQUksQ0FBQztRQUMzQyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQUssV0FBYSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBTyxXQUFhLENBQUM7UUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxXQUFTLFdBQWEsQ0FBQztJQUMzQyxDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBbkJELElBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEEgYFByb3BlcnR5QmluZGluZ2AgcmVwcmVzZW50cyBhIG1hcHBpbmcgYmV0d2VlbiBhIHByb3BlcnR5IG5hbWVcbiAqIGFuZCBhbiBhdHRyaWJ1dGUgbmFtZS4gSXQgaXMgcGFyc2VkIGZyb20gYSBzdHJpbmcgb2YgdGhlIGZvcm1cbiAqIGBcInByb3A6IGF0dHJcImA7IG9yIHNpbXBseSBgXCJwcm9wQW5kQXR0clwiIHdoZXJlIHRoZSBwcm9wZXJ0eVxuICogYW5kIGF0dHJpYnV0ZSBoYXZlIHRoZSBzYW1lIGlkZW50aWZpZXIuXG4gKi9cbmV4cG9ydCBjbGFzcyBQcm9wZXJ0eUJpbmRpbmcge1xuICBicmFja2V0QXR0cjogc3RyaW5nO1xuICBicmFja2V0UGFyZW5BdHRyOiBzdHJpbmc7XG4gIHBhcmVuQXR0cjogc3RyaW5nO1xuICBvbkF0dHI6IHN0cmluZztcbiAgYmluZEF0dHI6IHN0cmluZztcbiAgYmluZG9uQXR0cjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm9wOiBzdHJpbmcsIHB1YmxpYyBhdHRyOiBzdHJpbmcpIHsgdGhpcy5wYXJzZUJpbmRpbmcoKTsgfVxuXG4gIHByaXZhdGUgcGFyc2VCaW5kaW5nKCkge1xuICAgIHRoaXMuYnJhY2tldEF0dHIgPSBgWyR7dGhpcy5hdHRyfV1gO1xuICAgIHRoaXMucGFyZW5BdHRyID0gYCgke3RoaXMuYXR0cn0pYDtcbiAgICB0aGlzLmJyYWNrZXRQYXJlbkF0dHIgPSBgWygke3RoaXMuYXR0cn0pXWA7XG4gICAgY29uc3QgY2FwaXRhbEF0dHIgPSB0aGlzLmF0dHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0aGlzLmF0dHIuc3Vic3RyKDEpO1xuICAgIHRoaXMub25BdHRyID0gYG9uJHtjYXBpdGFsQXR0cn1gO1xuICAgIHRoaXMuYmluZEF0dHIgPSBgYmluZCR7Y2FwaXRhbEF0dHJ9YDtcbiAgICB0aGlzLmJpbmRvbkF0dHIgPSBgYmluZG9uJHtjYXBpdGFsQXR0cn1gO1xuICB9XG59XG4iXX0=