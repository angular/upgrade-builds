/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR as NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core';
var NgAdapterInjector = /** @class */ (function () {
    function NgAdapterInjector(modInjector) {
        this.modInjector = modInjector;
    }
    // When Angular locate a service in the component injector tree, the not found value is set to
    // `NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR`. In such a case we should not walk up to the module
    // injector.
    // AngularJS only supports a single tree and should always check the module injector.
    // When Angular locate a service in the component injector tree, the not found value is set to
    // `NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR`. In such a case we should not walk up to the module
    // injector.
    // AngularJS only supports a single tree and should always check the module injector.
    NgAdapterInjector.prototype.get = 
    // When Angular locate a service in the component injector tree, the not found value is set to
    // `NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR`. In such a case we should not walk up to the module
    // injector.
    // AngularJS only supports a single tree and should always check the module injector.
    function (token, notFoundValue) {
        if (notFoundValue === NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
            return notFoundValue;
        }
        return this.modInjector.get(token, notFoundValue);
    };
    return NgAdapterInjector;
}());
export { NgAdapterInjector };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9zdGF0aWMvdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBUUEsT0FBTyxFQUFXLHNDQUFzQyxJQUFJLHFDQUFxQyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3hILElBQUE7SUFDRSwyQkFBb0IsV0FBcUI7UUFBckIsZ0JBQVcsR0FBWCxXQUFXLENBQVU7S0FBSTtJQUU3Qyw4RkFBOEY7SUFDOUYsOEZBQThGO0lBQzlGLFlBQVk7SUFDWixxRkFBcUY7Ozs7O0lBQ3JGLCtCQUFHOzs7OztJQUFILFVBQUksS0FBVSxFQUFFLGFBQW1CO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsS0FBSyxxQ0FBcUMsQ0FBQyxDQUFDLENBQUM7WUFDNUQsTUFBTSxDQUFDLGFBQWEsQ0FBQztTQUN0QjtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUM7S0FDbkQ7NEJBeEJIO0lBeUJDLENBQUE7QUFkRCw2QkFjQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RvciwgybVOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SIGFzIE5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbmV4cG9ydCBjbGFzcyBOZ0FkYXB0ZXJJbmplY3RvciBpbXBsZW1lbnRzIEluamVjdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBtb2RJbmplY3RvcjogSW5qZWN0b3IpIHt9XG5cbiAgLy8gV2hlbiBBbmd1bGFyIGxvY2F0ZSBhIHNlcnZpY2UgaW4gdGhlIGNvbXBvbmVudCBpbmplY3RvciB0cmVlLCB0aGUgbm90IGZvdW5kIHZhbHVlIGlzIHNldCB0b1xuICAvLyBgTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUmAuIEluIHN1Y2ggYSBjYXNlIHdlIHNob3VsZCBub3Qgd2FsayB1cCB0byB0aGUgbW9kdWxlXG4gIC8vIGluamVjdG9yLlxuICAvLyBBbmd1bGFySlMgb25seSBzdXBwb3J0cyBhIHNpbmdsZSB0cmVlIGFuZCBzaG91bGQgYWx3YXlzIGNoZWNrIHRoZSBtb2R1bGUgaW5qZWN0b3IuXG4gIGdldCh0b2tlbjogYW55LCBub3RGb3VuZFZhbHVlPzogYW55KTogYW55IHtcbiAgICBpZiAobm90Rm91bmRWYWx1ZSA9PT0gTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUikge1xuICAgICAgcmV0dXJuIG5vdEZvdW5kVmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubW9kSW5qZWN0b3IuZ2V0KHRva2VuLCBub3RGb3VuZFZhbHVlKTtcbiAgfVxufVxuIl19