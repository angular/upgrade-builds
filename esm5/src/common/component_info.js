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
var /**
 * A `PropertyBinding` represents a mapping between a property name
 * and an attribute name. It is parsed from a string of the form
 * `"prop: attr"`; or simply `"propAndAttr" where the property
 * and attribute have the same identifier.
 */
PropertyBinding = /** @class */ (function () {
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
/**
 * A `PropertyBinding` represents a mapping between a property name
 * and an attribute name. It is parsed from a string of the form
 * `"prop: attr"`; or simply `"propAndAttr" where the property
 * and attribute have the same identifier.
 */
export { PropertyBinding };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50X2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vY29tcG9uZW50X2luZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWNBOzs7Ozs7QUFBQTtJQVFFLHlCQUFtQixJQUFZLEVBQVMsSUFBWTtRQUFqQyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUFFO0lBRXRFLHNDQUFZLEdBQXBCO1FBQ0UsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFJLElBQUksQ0FBQyxJQUFJLE1BQUcsQ0FBQztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQUksSUFBSSxDQUFDLElBQUksTUFBRyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxPQUFLLElBQUksQ0FBQyxJQUFJLE9BQUksQ0FBQztRQUMzQyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQUssV0FBYSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxRQUFRLEdBQUcsU0FBTyxXQUFhLENBQUM7UUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxXQUFTLFdBQWEsQ0FBQztLQUMxQzswQkFoQ0g7SUFpQ0MsQ0FBQTs7Ozs7OztBQW5CRCwyQkFtQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQSBgUHJvcGVydHlCaW5kaW5nYCByZXByZXNlbnRzIGEgbWFwcGluZyBiZXR3ZWVuIGEgcHJvcGVydHkgbmFtZVxuICogYW5kIGFuIGF0dHJpYnV0ZSBuYW1lLiBJdCBpcyBwYXJzZWQgZnJvbSBhIHN0cmluZyBvZiB0aGUgZm9ybVxuICogYFwicHJvcDogYXR0clwiYDsgb3Igc2ltcGx5IGBcInByb3BBbmRBdHRyXCIgd2hlcmUgdGhlIHByb3BlcnR5XG4gKiBhbmQgYXR0cmlidXRlIGhhdmUgdGhlIHNhbWUgaWRlbnRpZmllci5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb3BlcnR5QmluZGluZyB7XG4gIGJyYWNrZXRBdHRyOiBzdHJpbmc7XG4gIGJyYWNrZXRQYXJlbkF0dHI6IHN0cmluZztcbiAgcGFyZW5BdHRyOiBzdHJpbmc7XG4gIG9uQXR0cjogc3RyaW5nO1xuICBiaW5kQXR0cjogc3RyaW5nO1xuICBiaW5kb25BdHRyOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIHByb3A6IHN0cmluZywgcHVibGljIGF0dHI6IHN0cmluZykgeyB0aGlzLnBhcnNlQmluZGluZygpOyB9XG5cbiAgcHJpdmF0ZSBwYXJzZUJpbmRpbmcoKSB7XG4gICAgdGhpcy5icmFja2V0QXR0ciA9IGBbJHt0aGlzLmF0dHJ9XWA7XG4gICAgdGhpcy5wYXJlbkF0dHIgPSBgKCR7dGhpcy5hdHRyfSlgO1xuICAgIHRoaXMuYnJhY2tldFBhcmVuQXR0ciA9IGBbKCR7dGhpcy5hdHRyfSldYDtcbiAgICBjb25zdCBjYXBpdGFsQXR0ciA9IHRoaXMuYXR0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHRoaXMuYXR0ci5zdWJzdHIoMSk7XG4gICAgdGhpcy5vbkF0dHIgPSBgb24ke2NhcGl0YWxBdHRyfWA7XG4gICAgdGhpcy5iaW5kQXR0ciA9IGBiaW5kJHtjYXBpdGFsQXR0cn1gO1xuICAgIHRoaXMuYmluZG9uQXR0ciA9IGBiaW5kb24ke2NhcGl0YWxBdHRyfWA7XG4gIH1cbn1cbiJdfQ==