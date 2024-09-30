/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector, NgModule } from '@angular/core';
import { ɵangular1 as angular, ɵconstants } from '@angular/upgrade/static';
import * as i0 from "@angular/core";
let $injector = null;
let injector;
export function $injectorFactory() {
    return $injector;
}
export class AngularTestingModule {
    constructor(i) {
        injector = i;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.6+sha-b9d846d", ngImport: i0, type: AngularTestingModule, deps: [{ token: i0.Injector }], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.2.6+sha-b9d846d", ngImport: i0, type: AngularTestingModule }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.2.6+sha-b9d846d", ngImport: i0, type: AngularTestingModule, providers: [{ provide: ɵconstants.$INJECTOR, useFactory: $injectorFactory }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.6+sha-b9d846d", ngImport: i0, type: AngularTestingModule, decorators: [{
            type: NgModule,
            args: [{ providers: [{ provide: ɵconstants.$INJECTOR, useFactory: $injectorFactory }] }]
        }], ctorParameters: () => [{ type: i0.Injector }] });
/**
 * A helper function to use when unit testing Angular services that depend upon upgraded AngularJS
 * services.
 *
 * This function returns an `NgModule` decorated class that is configured to wire up the Angular
 * and AngularJS injectors without the need to actually bootstrap a hybrid application.
 * This makes it simpler and faster to unit test services.
 *
 * Use the returned class as an "import" when configuring the `TestBed`.
 *
 * In the following code snippet, we are configuring the TestBed with two imports.
 * The `Ng2AppModule` is the Angular part of our hybrid application and the `ng1AppModule` is the
 * AngularJS part.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts" region="angular-setup"></code-example>
 *
 * Once this is done we can get hold of services via the Angular `Injector` as normal.
 * Services that are (or have dependencies on) an upgraded AngularJS service, will be instantiated
 * as needed by the AngularJS `$injector`.
 *
 * In the following code snippet, `HeroesService` is an Angular service that depends upon an
 * AngularJS service, `titleCase`.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts" region="angular-spec"></code-example>
 *
 * <div class="alert is-important">
 *
 * This helper is for testing services not Components.
 * For Component testing you must still bootstrap a hybrid app. See `UpgradeModule` or
 * `downgradeModule` for more information.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The resulting configuration does not wire up AngularJS digests to Zone hooks. It is the
 * responsibility of the test writer to call `$rootScope.$apply`, as necessary, to trigger
 * AngularJS handlers of async events from Angular.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The helper sets up global variables to hold the shared Angular and AngularJS injectors.
 *
 * * Only call this helper once per spec.
 * * Do not use `createAngularTestingModule` in the same spec as `createAngularJSTestingModule`.
 *
 * </div>
 *
 * Here is the example application and its unit tests that use `createAngularTestingModule`
 * and `createAngularJSTestingModule`.
 *
 * <code-tabs>
 *  <code-pane header="module.spec.ts" path="upgrade/static/ts/full/module.spec.ts"></code-pane>
 *  <code-pane header="module.ts" path="upgrade/static/ts/full/module.ts"></code-pane>
 * </code-tabs>
 *
 *
 * @param angularJSModules a collection of the names of AngularJS modules to include in the
 * configuration.
 * @param [strictDi] whether the AngularJS injector should have `strictDI` enabled.
 *
 * @publicApi
 */
export function createAngularTestingModule(angularJSModules, strictDi) {
    angular
        .module_('$$angularJSTestingModule', angularJSModules)
        .constant(ɵconstants.UPGRADE_APP_TYPE_KEY, 2 /* UpgradeAppType.Static */)
        .factory(ɵconstants.INJECTOR_KEY, () => injector);
    $injector = angular.injector(['ng', '$$angularJSTestingModule'], strictDi);
    return AngularTestingModule;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX2FuZ3VsYXJfdGVzdGluZ19tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy90ZXN0aW5nL3NyYy9jcmVhdGVfYW5ndWxhcl90ZXN0aW5nX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBTyxNQUFNLGVBQWUsQ0FBQztBQUN2RCxPQUFPLEVBQUMsU0FBUyxJQUFJLE9BQU8sRUFBRSxVQUFVLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQzs7QUFJekUsSUFBSSxTQUFTLEdBQW9DLElBQUksQ0FBQztBQUN0RCxJQUFJLFFBQWtCLENBQUM7QUFFdkIsTUFBTSxVQUFVLGdCQUFnQjtJQUM5QixPQUFPLFNBQVMsQ0FBQztBQUNuQixDQUFDO0FBR0QsTUFBTSxPQUFPLG9CQUFvQjtJQUMvQixZQUFZLENBQVc7UUFDckIsUUFBUSxHQUFHLENBQUMsQ0FBQztJQUNmLENBQUM7eUhBSFUsb0JBQW9COzBIQUFwQixvQkFBb0I7MEhBQXBCLG9CQUFvQixhQURYLENBQUMsRUFBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQzs7c0dBQ3hFLG9CQUFvQjtrQkFEaEMsUUFBUTttQkFBQyxFQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFDLENBQUMsRUFBQzs7QUFPdEY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnRUc7QUFDSCxNQUFNLFVBQVUsMEJBQTBCLENBQ3hDLGdCQUEwQixFQUMxQixRQUFrQjtJQUVsQixPQUFPO1NBQ0osT0FBTyxDQUFDLDBCQUEwQixFQUFFLGdCQUFnQixDQUFDO1NBQ3JELFFBQVEsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLGdDQUF3QjtTQUNoRSxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwRCxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSwwQkFBMEIsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzNFLE9BQU8sb0JBQW9CLENBQUM7QUFDOUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RvciwgTmdNb2R1bGUsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHvJtWFuZ3VsYXIxIGFzIGFuZ3VsYXIsIMm1Y29uc3RhbnRzfSBmcm9tICdAYW5ndWxhci91cGdyYWRlL3N0YXRpYyc7XG5cbmltcG9ydCB7VXBncmFkZUFwcFR5cGV9IGZyb20gJy4uLy4uLy4uL3NyYy9jb21tb24vc3JjL3V0aWwnO1xuXG5sZXQgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UgfCBudWxsID0gbnVsbDtcbmxldCBpbmplY3RvcjogSW5qZWN0b3I7XG5cbmV4cG9ydCBmdW5jdGlvbiAkaW5qZWN0b3JGYWN0b3J5KCkge1xuICByZXR1cm4gJGluamVjdG9yO1xufVxuXG5ATmdNb2R1bGUoe3Byb3ZpZGVyczogW3twcm92aWRlOiDJtWNvbnN0YW50cy4kSU5KRUNUT1IsIHVzZUZhY3Rvcnk6ICRpbmplY3RvckZhY3Rvcnl9XX0pXG5leHBvcnQgY2xhc3MgQW5ndWxhclRlc3RpbmdNb2R1bGUge1xuICBjb25zdHJ1Y3RvcihpOiBJbmplY3Rvcikge1xuICAgIGluamVjdG9yID0gaTtcbiAgfVxufVxuXG4vKipcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIHVzZSB3aGVuIHVuaXQgdGVzdGluZyBBbmd1bGFyIHNlcnZpY2VzIHRoYXQgZGVwZW5kIHVwb24gdXBncmFkZWQgQW5ndWxhckpTXG4gKiBzZXJ2aWNlcy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYW4gYE5nTW9kdWxlYCBkZWNvcmF0ZWQgY2xhc3MgdGhhdCBpcyBjb25maWd1cmVkIHRvIHdpcmUgdXAgdGhlIEFuZ3VsYXJcbiAqIGFuZCBBbmd1bGFySlMgaW5qZWN0b3JzIHdpdGhvdXQgdGhlIG5lZWQgdG8gYWN0dWFsbHkgYm9vdHN0cmFwIGEgaHlicmlkIGFwcGxpY2F0aW9uLlxuICogVGhpcyBtYWtlcyBpdCBzaW1wbGVyIGFuZCBmYXN0ZXIgdG8gdW5pdCB0ZXN0IHNlcnZpY2VzLlxuICpcbiAqIFVzZSB0aGUgcmV0dXJuZWQgY2xhc3MgYXMgYW4gXCJpbXBvcnRcIiB3aGVuIGNvbmZpZ3VyaW5nIHRoZSBgVGVzdEJlZGAuXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBjb2RlIHNuaXBwZXQsIHdlIGFyZSBjb25maWd1cmluZyB0aGUgVGVzdEJlZCB3aXRoIHR3byBpbXBvcnRzLlxuICogVGhlIGBOZzJBcHBNb2R1bGVgIGlzIHRoZSBBbmd1bGFyIHBhcnQgb2Ygb3VyIGh5YnJpZCBhcHBsaWNhdGlvbiBhbmQgdGhlIGBuZzFBcHBNb2R1bGVgIGlzIHRoZVxuICogQW5ndWxhckpTIHBhcnQuXG4gKlxuICogPGNvZGUtZXhhbXBsZSBwYXRoPVwidXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUuc3BlYy50c1wiIHJlZ2lvbj1cImFuZ3VsYXItc2V0dXBcIj48L2NvZGUtZXhhbXBsZT5cbiAqXG4gKiBPbmNlIHRoaXMgaXMgZG9uZSB3ZSBjYW4gZ2V0IGhvbGQgb2Ygc2VydmljZXMgdmlhIHRoZSBBbmd1bGFyIGBJbmplY3RvcmAgYXMgbm9ybWFsLlxuICogU2VydmljZXMgdGhhdCBhcmUgKG9yIGhhdmUgZGVwZW5kZW5jaWVzIG9uKSBhbiB1cGdyYWRlZCBBbmd1bGFySlMgc2VydmljZSwgd2lsbCBiZSBpbnN0YW50aWF0ZWRcbiAqIGFzIG5lZWRlZCBieSB0aGUgQW5ndWxhckpTIGAkaW5qZWN0b3JgLlxuICpcbiAqIEluIHRoZSBmb2xsb3dpbmcgY29kZSBzbmlwcGV0LCBgSGVyb2VzU2VydmljZWAgaXMgYW4gQW5ndWxhciBzZXJ2aWNlIHRoYXQgZGVwZW5kcyB1cG9uIGFuXG4gKiBBbmd1bGFySlMgc2VydmljZSwgYHRpdGxlQ2FzZWAuXG4gKlxuICogPGNvZGUtZXhhbXBsZSBwYXRoPVwidXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUuc3BlYy50c1wiIHJlZ2lvbj1cImFuZ3VsYXItc3BlY1wiPjwvY29kZS1leGFtcGxlPlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1pbXBvcnRhbnRcIj5cbiAqXG4gKiBUaGlzIGhlbHBlciBpcyBmb3IgdGVzdGluZyBzZXJ2aWNlcyBub3QgQ29tcG9uZW50cy5cbiAqIEZvciBDb21wb25lbnQgdGVzdGluZyB5b3UgbXVzdCBzdGlsbCBib290c3RyYXAgYSBoeWJyaWQgYXBwLiBTZWUgYFVwZ3JhZGVNb2R1bGVgIG9yXG4gKiBgZG93bmdyYWRlTW9kdWxlYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiA8L2Rpdj5cbiAqXG4gKiA8ZGl2IGNsYXNzPVwiYWxlcnQgaXMtaW1wb3J0YW50XCI+XG4gKlxuICogVGhlIHJlc3VsdGluZyBjb25maWd1cmF0aW9uIGRvZXMgbm90IHdpcmUgdXAgQW5ndWxhckpTIGRpZ2VzdHMgdG8gWm9uZSBob29rcy4gSXQgaXMgdGhlXG4gKiByZXNwb25zaWJpbGl0eSBvZiB0aGUgdGVzdCB3cml0ZXIgdG8gY2FsbCBgJHJvb3RTY29wZS4kYXBwbHlgLCBhcyBuZWNlc3NhcnksIHRvIHRyaWdnZXJcbiAqIEFuZ3VsYXJKUyBoYW5kbGVycyBvZiBhc3luYyBldmVudHMgZnJvbSBBbmd1bGFyLlxuICpcbiAqIDwvZGl2PlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1pbXBvcnRhbnRcIj5cbiAqXG4gKiBUaGUgaGVscGVyIHNldHMgdXAgZ2xvYmFsIHZhcmlhYmxlcyB0byBob2xkIHRoZSBzaGFyZWQgQW5ndWxhciBhbmQgQW5ndWxhckpTIGluamVjdG9ycy5cbiAqXG4gKiAqIE9ubHkgY2FsbCB0aGlzIGhlbHBlciBvbmNlIHBlciBzcGVjLlxuICogKiBEbyBub3QgdXNlIGBjcmVhdGVBbmd1bGFyVGVzdGluZ01vZHVsZWAgaW4gdGhlIHNhbWUgc3BlYyBhcyBgY3JlYXRlQW5ndWxhckpTVGVzdGluZ01vZHVsZWAuXG4gKlxuICogPC9kaXY+XG4gKlxuICogSGVyZSBpcyB0aGUgZXhhbXBsZSBhcHBsaWNhdGlvbiBhbmQgaXRzIHVuaXQgdGVzdHMgdGhhdCB1c2UgYGNyZWF0ZUFuZ3VsYXJUZXN0aW5nTW9kdWxlYFxuICogYW5kIGBjcmVhdGVBbmd1bGFySlNUZXN0aW5nTW9kdWxlYC5cbiAqXG4gKiA8Y29kZS10YWJzPlxuICogIDxjb2RlLXBhbmUgaGVhZGVyPVwibW9kdWxlLnNwZWMudHNcIiBwYXRoPVwidXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUuc3BlYy50c1wiPjwvY29kZS1wYW5lPlxuICogIDxjb2RlLXBhbmUgaGVhZGVyPVwibW9kdWxlLnRzXCIgcGF0aD1cInVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzXCI+PC9jb2RlLXBhbmU+XG4gKiA8L2NvZGUtdGFicz5cbiAqXG4gKlxuICogQHBhcmFtIGFuZ3VsYXJKU01vZHVsZXMgYSBjb2xsZWN0aW9uIG9mIHRoZSBuYW1lcyBvZiBBbmd1bGFySlMgbW9kdWxlcyB0byBpbmNsdWRlIGluIHRoZVxuICogY29uZmlndXJhdGlvbi5cbiAqIEBwYXJhbSBbc3RyaWN0RGldIHdoZXRoZXIgdGhlIEFuZ3VsYXJKUyBpbmplY3RvciBzaG91bGQgaGF2ZSBgc3RyaWN0RElgIGVuYWJsZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQW5ndWxhclRlc3RpbmdNb2R1bGUoXG4gIGFuZ3VsYXJKU01vZHVsZXM6IHN0cmluZ1tdLFxuICBzdHJpY3REaT86IGJvb2xlYW4sXG4pOiBUeXBlPGFueT4ge1xuICBhbmd1bGFyXG4gICAgLm1vZHVsZV8oJyQkYW5ndWxhckpTVGVzdGluZ01vZHVsZScsIGFuZ3VsYXJKU01vZHVsZXMpXG4gICAgLmNvbnN0YW50KMm1Y29uc3RhbnRzLlVQR1JBREVfQVBQX1RZUEVfS0VZLCBVcGdyYWRlQXBwVHlwZS5TdGF0aWMpXG4gICAgLmZhY3RvcnkoybVjb25zdGFudHMuSU5KRUNUT1JfS0VZLCAoKSA9PiBpbmplY3Rvcik7XG4gICRpbmplY3RvciA9IGFuZ3VsYXIuaW5qZWN0b3IoWyduZycsICckJGFuZ3VsYXJKU1Rlc3RpbmdNb2R1bGUnXSwgc3RyaWN0RGkpO1xuICByZXR1cm4gQW5ndWxhclRlc3RpbmdNb2R1bGU7XG59XG4iXX0=