/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ɵangular1 as ng, ɵconstants } from '@angular/upgrade/static';
/**
 * A helper function to use when unit testing AngularJS services that depend upon downgraded Angular
 * services.
 *
 * This function returns an AngularJS module that is configured to wire up the AngularJS and Angular
 * injectors without the need to actually bootstrap a hybrid application.
 * This makes it simpler and faster to unit test services.
 *
 * Use the returned AngularJS module in a call to
 * [`angular.mocks.module`](https://docs.angularjs.org/api/ngMock/function/angular.mock.module) to
 * include this module in the unit test injector.
 *
 * In the following code snippet, we are configuring the `$injector` with two modules:
 * The AngularJS `ng1AppModule`, which is the AngularJS part of our hybrid application and the
 * `Ng2AppModule`, which is the Angular part.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts"
 * region="angularjs-setup"></code-example>
 *
 * Once this is done we can get hold of services via the AngularJS `$injector` as normal.
 * Services that are (or have dependencies on) a downgraded Angular service, will be instantiated as
 * needed by the Angular root `Injector`.
 *
 * In the following code snippet, `heroesService` is a downgraded Angular service that we are
 * accessing from AngularJS.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts"
 * region="angularjs-spec"></code-example>
 *
 * <div class="alert is-important">
 *
 * This helper is for testing services not components.
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
 * * Do not use `createAngularJSTestingModule` in the same spec as `createAngularTestingModule`.
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
 * @param angularModules a collection of Angular modules to include in the configuration.
 *
 * @publicApi
 */
export function createAngularJSTestingModule(angularModules) {
    return ng
        .module_('$$angularJSTestingModule', [])
        .constant(ɵconstants.UPGRADE_APP_TYPE_KEY, 2 /* UpgradeAppType.Static */)
        .factory(ɵconstants.INJECTOR_KEY, [
        ɵconstants.$INJECTOR,
        ($injector) => {
            TestBed.configureTestingModule({
                imports: angularModules,
                providers: [{ provide: ɵconstants.$INJECTOR, useValue: $injector }],
            });
            return TestBed.inject(Injector);
        },
    ]).name;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX2FuZ3VsYXJqc190ZXN0aW5nX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3Rlc3Rpbmcvc3JjL2NyZWF0ZV9hbmd1bGFyanNfdGVzdGluZ19tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDOUMsT0FBTyxFQUFDLFNBQVMsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFJcEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtFRztBQUNILE1BQU0sVUFBVSw0QkFBNEIsQ0FBQyxjQUFxQjtJQUNoRSxPQUFPLEVBQUU7U0FDTixPQUFPLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxDQUFDO1NBQ3ZDLFFBQVEsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLGdDQUF3QjtTQUNoRSxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRTtRQUNoQyxVQUFVLENBQUMsU0FBUztRQUNwQixDQUFDLFNBQThCLEVBQUUsRUFBRTtZQUNqQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7Z0JBQzdCLE9BQU8sRUFBRSxjQUFjO2dCQUN2QixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsQ0FBQzthQUNsRSxDQUFDLENBQUM7WUFDSCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsQ0FBQztLQUNGLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDWixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuZGV2L2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7VGVzdEJlZH0gZnJvbSAnQGFuZ3VsYXIvY29yZS90ZXN0aW5nJztcbmltcG9ydCB7ybVhbmd1bGFyMSBhcyBuZywgybVjb25zdGFudHN9IGZyb20gJ0Bhbmd1bGFyL3VwZ3JhZGUvc3RhdGljJztcblxuaW1wb3J0IHtVcGdyYWRlQXBwVHlwZX0gZnJvbSAnLi4vLi4vLi4vc3JjL2NvbW1vbi9zcmMvdXRpbCc7XG5cbi8qKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gdXNlIHdoZW4gdW5pdCB0ZXN0aW5nIEFuZ3VsYXJKUyBzZXJ2aWNlcyB0aGF0IGRlcGVuZCB1cG9uIGRvd25ncmFkZWQgQW5ndWxhclxuICogc2VydmljZXMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGFuIEFuZ3VsYXJKUyBtb2R1bGUgdGhhdCBpcyBjb25maWd1cmVkIHRvIHdpcmUgdXAgdGhlIEFuZ3VsYXJKUyBhbmQgQW5ndWxhclxuICogaW5qZWN0b3JzIHdpdGhvdXQgdGhlIG5lZWQgdG8gYWN0dWFsbHkgYm9vdHN0cmFwIGEgaHlicmlkIGFwcGxpY2F0aW9uLlxuICogVGhpcyBtYWtlcyBpdCBzaW1wbGVyIGFuZCBmYXN0ZXIgdG8gdW5pdCB0ZXN0IHNlcnZpY2VzLlxuICpcbiAqIFVzZSB0aGUgcmV0dXJuZWQgQW5ndWxhckpTIG1vZHVsZSBpbiBhIGNhbGwgdG9cbiAqIFtgYW5ndWxhci5tb2Nrcy5tb2R1bGVgXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmdNb2NrL2Z1bmN0aW9uL2FuZ3VsYXIubW9jay5tb2R1bGUpIHRvXG4gKiBpbmNsdWRlIHRoaXMgbW9kdWxlIGluIHRoZSB1bml0IHRlc3QgaW5qZWN0b3IuXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBjb2RlIHNuaXBwZXQsIHdlIGFyZSBjb25maWd1cmluZyB0aGUgYCRpbmplY3RvcmAgd2l0aCB0d28gbW9kdWxlczpcbiAqIFRoZSBBbmd1bGFySlMgYG5nMUFwcE1vZHVsZWAsIHdoaWNoIGlzIHRoZSBBbmd1bGFySlMgcGFydCBvZiBvdXIgaHlicmlkIGFwcGxpY2F0aW9uIGFuZCB0aGVcbiAqIGBOZzJBcHBNb2R1bGVgLCB3aGljaCBpcyB0aGUgQW5ndWxhciBwYXJ0LlxuICpcbiAqIDxjb2RlLWV4YW1wbGUgcGF0aD1cInVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnNwZWMudHNcIlxuICogcmVnaW9uPVwiYW5ndWxhcmpzLXNldHVwXCI+PC9jb2RlLWV4YW1wbGU+XG4gKlxuICogT25jZSB0aGlzIGlzIGRvbmUgd2UgY2FuIGdldCBob2xkIG9mIHNlcnZpY2VzIHZpYSB0aGUgQW5ndWxhckpTIGAkaW5qZWN0b3JgIGFzIG5vcm1hbC5cbiAqIFNlcnZpY2VzIHRoYXQgYXJlIChvciBoYXZlIGRlcGVuZGVuY2llcyBvbikgYSBkb3duZ3JhZGVkIEFuZ3VsYXIgc2VydmljZSwgd2lsbCBiZSBpbnN0YW50aWF0ZWQgYXNcbiAqIG5lZWRlZCBieSB0aGUgQW5ndWxhciByb290IGBJbmplY3RvcmAuXG4gKlxuICogSW4gdGhlIGZvbGxvd2luZyBjb2RlIHNuaXBwZXQsIGBoZXJvZXNTZXJ2aWNlYCBpcyBhIGRvd25ncmFkZWQgQW5ndWxhciBzZXJ2aWNlIHRoYXQgd2UgYXJlXG4gKiBhY2Nlc3NpbmcgZnJvbSBBbmd1bGFySlMuXG4gKlxuICogPGNvZGUtZXhhbXBsZSBwYXRoPVwidXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUuc3BlYy50c1wiXG4gKiByZWdpb249XCJhbmd1bGFyanMtc3BlY1wiPjwvY29kZS1leGFtcGxlPlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1pbXBvcnRhbnRcIj5cbiAqXG4gKiBUaGlzIGhlbHBlciBpcyBmb3IgdGVzdGluZyBzZXJ2aWNlcyBub3QgY29tcG9uZW50cy5cbiAqIEZvciBDb21wb25lbnQgdGVzdGluZyB5b3UgbXVzdCBzdGlsbCBib290c3RyYXAgYSBoeWJyaWQgYXBwLiBTZWUgYFVwZ3JhZGVNb2R1bGVgIG9yXG4gKiBgZG93bmdyYWRlTW9kdWxlYCBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqXG4gKiA8L2Rpdj5cbiAqXG4gKiA8ZGl2IGNsYXNzPVwiYWxlcnQgaXMtaW1wb3J0YW50XCI+XG4gKlxuICogVGhlIHJlc3VsdGluZyBjb25maWd1cmF0aW9uIGRvZXMgbm90IHdpcmUgdXAgQW5ndWxhckpTIGRpZ2VzdHMgdG8gWm9uZSBob29rcy4gSXQgaXMgdGhlXG4gKiByZXNwb25zaWJpbGl0eSBvZiB0aGUgdGVzdCB3cml0ZXIgdG8gY2FsbCBgJHJvb3RTY29wZS4kYXBwbHlgLCBhcyBuZWNlc3NhcnksIHRvIHRyaWdnZXJcbiAqIEFuZ3VsYXJKUyBoYW5kbGVycyBvZiBhc3luYyBldmVudHMgZnJvbSBBbmd1bGFyLlxuICpcbiAqIDwvZGl2PlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1pbXBvcnRhbnRcIj5cbiAqXG4gKiBUaGUgaGVscGVyIHNldHMgdXAgZ2xvYmFsIHZhcmlhYmxlcyB0byBob2xkIHRoZSBzaGFyZWQgQW5ndWxhciBhbmQgQW5ndWxhckpTIGluamVjdG9ycy5cbiAqXG4gKiAqIE9ubHkgY2FsbCB0aGlzIGhlbHBlciBvbmNlIHBlciBzcGVjLlxuICogKiBEbyBub3QgdXNlIGBjcmVhdGVBbmd1bGFySlNUZXN0aW5nTW9kdWxlYCBpbiB0aGUgc2FtZSBzcGVjIGFzIGBjcmVhdGVBbmd1bGFyVGVzdGluZ01vZHVsZWAuXG4gKlxuICogPC9kaXY+XG4gKlxuICogSGVyZSBpcyB0aGUgZXhhbXBsZSBhcHBsaWNhdGlvbiBhbmQgaXRzIHVuaXQgdGVzdHMgdGhhdCB1c2UgYGNyZWF0ZUFuZ3VsYXJUZXN0aW5nTW9kdWxlYFxuICogYW5kIGBjcmVhdGVBbmd1bGFySlNUZXN0aW5nTW9kdWxlYC5cbiAqXG4gKiA8Y29kZS10YWJzPlxuICogIDxjb2RlLXBhbmUgaGVhZGVyPVwibW9kdWxlLnNwZWMudHNcIiBwYXRoPVwidXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUuc3BlYy50c1wiPjwvY29kZS1wYW5lPlxuICogIDxjb2RlLXBhbmUgaGVhZGVyPVwibW9kdWxlLnRzXCIgcGF0aD1cInVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzXCI+PC9jb2RlLXBhbmU+XG4gKiA8L2NvZGUtdGFicz5cbiAqXG4gKlxuICogQHBhcmFtIGFuZ3VsYXJNb2R1bGVzIGEgY29sbGVjdGlvbiBvZiBBbmd1bGFyIG1vZHVsZXMgdG8gaW5jbHVkZSBpbiB0aGUgY29uZmlndXJhdGlvbi5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBbmd1bGFySlNUZXN0aW5nTW9kdWxlKGFuZ3VsYXJNb2R1bGVzOiBhbnlbXSk6IHN0cmluZyB7XG4gIHJldHVybiBuZ1xuICAgIC5tb2R1bGVfKCckJGFuZ3VsYXJKU1Rlc3RpbmdNb2R1bGUnLCBbXSlcbiAgICAuY29uc3RhbnQoybVjb25zdGFudHMuVVBHUkFERV9BUFBfVFlQRV9LRVksIFVwZ3JhZGVBcHBUeXBlLlN0YXRpYylcbiAgICAuZmFjdG9yeSjJtWNvbnN0YW50cy5JTkpFQ1RPUl9LRVksIFtcbiAgICAgIMm1Y29uc3RhbnRzLiRJTkpFQ1RPUixcbiAgICAgICgkaW5qZWN0b3I6IG5nLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgVGVzdEJlZC5jb25maWd1cmVUZXN0aW5nTW9kdWxlKHtcbiAgICAgICAgICBpbXBvcnRzOiBhbmd1bGFyTW9kdWxlcyxcbiAgICAgICAgICBwcm92aWRlcnM6IFt7cHJvdmlkZTogybVjb25zdGFudHMuJElOSkVDVE9SLCB1c2VWYWx1ZTogJGluamVjdG9yfV0sXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gVGVzdEJlZC5pbmplY3QoSW5qZWN0b3IpO1xuICAgICAgfSxcbiAgICBdKS5uYW1lO1xufVxuIl19