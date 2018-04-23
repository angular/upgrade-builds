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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL3N0YXRpYy91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFRQSxPQUFPLEVBQVcsc0NBQXNDLElBQUkscUNBQXFDLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHeEgsSUFBQTtJQUNFLDJCQUFvQixXQUFxQjtRQUFyQixnQkFBVyxHQUFYLFdBQVcsQ0FBVTtLQUFJO0lBRTdDLDhGQUE4RjtJQUM5Riw4RkFBOEY7SUFDOUYsWUFBWTtJQUNaLHFGQUFxRjs7Ozs7SUFDckYsK0JBQUc7Ozs7O0lBQUgsVUFBSSxLQUFVLEVBQUUsYUFBbUI7UUFDakMsRUFBRSxDQUFDLENBQUMsYUFBYSxLQUFLLHFDQUFxQyxDQUFDLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsYUFBYSxDQUFDO1NBQ3RCO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQztLQUNuRDs0QkF4Qkg7SUF5QkMsQ0FBQTtBQWRELDZCQWNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCDJtU5PVF9GT1VORF9DSEVDS19PTkxZX0VMRU1FTlRfSU5KRUNUT1IgYXMgTk9UX0ZPVU5EX0NIRUNLX09OTFlfRUxFTUVOVF9JTkpFQ1RPUn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuZXhwb3J0IGNsYXNzIE5nQWRhcHRlckluamVjdG9yIGltcGxlbWVudHMgSW5qZWN0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG1vZEluamVjdG9yOiBJbmplY3Rvcikge31cblxuICAvLyBXaGVuIEFuZ3VsYXIgbG9jYXRlIGEgc2VydmljZSBpbiB0aGUgY29tcG9uZW50IGluamVjdG9yIHRyZWUsIHRoZSBub3QgZm91bmQgdmFsdWUgaXMgc2V0IHRvXG4gIC8vIGBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SYC4gSW4gc3VjaCBhIGNhc2Ugd2Ugc2hvdWxkIG5vdCB3YWxrIHVwIHRvIHRoZSBtb2R1bGVcbiAgLy8gaW5qZWN0b3IuXG4gIC8vIEFuZ3VsYXJKUyBvbmx5IHN1cHBvcnRzIGEgc2luZ2xlIHRyZWUgYW5kIHNob3VsZCBhbHdheXMgY2hlY2sgdGhlIG1vZHVsZSBpbmplY3Rvci5cbiAgZ2V0KHRva2VuOiBhbnksIG5vdEZvdW5kVmFsdWU/OiBhbnkpOiBhbnkge1xuICAgIGlmIChub3RGb3VuZFZhbHVlID09PSBOT1RfRk9VTkRfQ0hFQ0tfT05MWV9FTEVNRU5UX0lOSkVDVE9SKSB7XG4gICAgICByZXR1cm4gbm90Rm91bmRWYWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5tb2RJbmplY3Rvci5nZXQodG9rZW4sIG5vdEZvdW5kVmFsdWUpO1xuICB9XG59XG4iXX0=