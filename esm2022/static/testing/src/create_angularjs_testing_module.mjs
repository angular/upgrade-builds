/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlX2FuZ3VsYXJqc190ZXN0aW5nX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3Rlc3Rpbmcvc3JjL2NyZWF0ZV9hbmd1bGFyanNfdGVzdGluZ19tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDOUMsT0FBTyxFQUFDLFNBQVMsSUFBSSxFQUFFLEVBQUUsVUFBVSxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFJcEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtFRztBQUNILE1BQU0sVUFBVSw0QkFBNEIsQ0FBQyxjQUFxQjtJQUNoRSxPQUFPLEVBQUU7U0FDTixPQUFPLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxDQUFDO1NBQ3ZDLFFBQVEsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLGdDQUF3QjtTQUNoRSxPQUFPLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRTtRQUNoQyxVQUFVLENBQUMsU0FBUztRQUNwQixDQUFDLFNBQThCLEVBQUUsRUFBRTtZQUNqQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7Z0JBQzdCLE9BQU8sRUFBRSxjQUFjO2dCQUN2QixTQUFTLEVBQUUsQ0FBQyxFQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUMsQ0FBQzthQUNsRSxDQUFDLENBQUM7WUFDSCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsQ0FBQztLQUNGLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDWixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtUZXN0QmVkfSBmcm9tICdAYW5ndWxhci9jb3JlL3Rlc3RpbmcnO1xuaW1wb3J0IHvJtWFuZ3VsYXIxIGFzIG5nLCDJtWNvbnN0YW50c30gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuXG5pbXBvcnQge1VwZ3JhZGVBcHBUeXBlfSBmcm9tICcuLi8uLi8uLi9zcmMvY29tbW9uL3NyYy91dGlsJztcblxuLyoqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byB1c2Ugd2hlbiB1bml0IHRlc3RpbmcgQW5ndWxhckpTIHNlcnZpY2VzIHRoYXQgZGVwZW5kIHVwb24gZG93bmdyYWRlZCBBbmd1bGFyXG4gKiBzZXJ2aWNlcy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgYW4gQW5ndWxhckpTIG1vZHVsZSB0aGF0IGlzIGNvbmZpZ3VyZWQgdG8gd2lyZSB1cCB0aGUgQW5ndWxhckpTIGFuZCBBbmd1bGFyXG4gKiBpbmplY3RvcnMgd2l0aG91dCB0aGUgbmVlZCB0byBhY3R1YWxseSBib290c3RyYXAgYSBoeWJyaWQgYXBwbGljYXRpb24uXG4gKiBUaGlzIG1ha2VzIGl0IHNpbXBsZXIgYW5kIGZhc3RlciB0byB1bml0IHRlc3Qgc2VydmljZXMuXG4gKlxuICogVXNlIHRoZSByZXR1cm5lZCBBbmd1bGFySlMgbW9kdWxlIGluIGEgY2FsbCB0b1xuICogW2Bhbmd1bGFyLm1vY2tzLm1vZHVsZWBdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZ01vY2svZnVuY3Rpb24vYW5ndWxhci5tb2NrLm1vZHVsZSkgdG9cbiAqIGluY2x1ZGUgdGhpcyBtb2R1bGUgaW4gdGhlIHVuaXQgdGVzdCBpbmplY3Rvci5cbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGNvZGUgc25pcHBldCwgd2UgYXJlIGNvbmZpZ3VyaW5nIHRoZSBgJGluamVjdG9yYCB3aXRoIHR3byBtb2R1bGVzOlxuICogVGhlIEFuZ3VsYXJKUyBgbmcxQXBwTW9kdWxlYCwgd2hpY2ggaXMgdGhlIEFuZ3VsYXJKUyBwYXJ0IG9mIG91ciBoeWJyaWQgYXBwbGljYXRpb24gYW5kIHRoZVxuICogYE5nMkFwcE1vZHVsZWAsIHdoaWNoIGlzIHRoZSBBbmd1bGFyIHBhcnQuXG4gKlxuICogPGNvZGUtZXhhbXBsZSBwYXRoPVwidXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUuc3BlYy50c1wiXG4gKiByZWdpb249XCJhbmd1bGFyanMtc2V0dXBcIj48L2NvZGUtZXhhbXBsZT5cbiAqXG4gKiBPbmNlIHRoaXMgaXMgZG9uZSB3ZSBjYW4gZ2V0IGhvbGQgb2Ygc2VydmljZXMgdmlhIHRoZSBBbmd1bGFySlMgYCRpbmplY3RvcmAgYXMgbm9ybWFsLlxuICogU2VydmljZXMgdGhhdCBhcmUgKG9yIGhhdmUgZGVwZW5kZW5jaWVzIG9uKSBhIGRvd25ncmFkZWQgQW5ndWxhciBzZXJ2aWNlLCB3aWxsIGJlIGluc3RhbnRpYXRlZCBhc1xuICogbmVlZGVkIGJ5IHRoZSBBbmd1bGFyIHJvb3QgYEluamVjdG9yYC5cbiAqXG4gKiBJbiB0aGUgZm9sbG93aW5nIGNvZGUgc25pcHBldCwgYGhlcm9lc1NlcnZpY2VgIGlzIGEgZG93bmdyYWRlZCBBbmd1bGFyIHNlcnZpY2UgdGhhdCB3ZSBhcmVcbiAqIGFjY2Vzc2luZyBmcm9tIEFuZ3VsYXJKUy5cbiAqXG4gKiA8Y29kZS1leGFtcGxlIHBhdGg9XCJ1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS5zcGVjLnRzXCJcbiAqIHJlZ2lvbj1cImFuZ3VsYXJqcy1zcGVjXCI+PC9jb2RlLWV4YW1wbGU+XG4gKlxuICogPGRpdiBjbGFzcz1cImFsZXJ0IGlzLWltcG9ydGFudFwiPlxuICpcbiAqIFRoaXMgaGVscGVyIGlzIGZvciB0ZXN0aW5nIHNlcnZpY2VzIG5vdCBjb21wb25lbnRzLlxuICogRm9yIENvbXBvbmVudCB0ZXN0aW5nIHlvdSBtdXN0IHN0aWxsIGJvb3RzdHJhcCBhIGh5YnJpZCBhcHAuIFNlZSBgVXBncmFkZU1vZHVsZWAgb3JcbiAqIGBkb3duZ3JhZGVNb2R1bGVgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICpcbiAqIDwvZGl2PlxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1pbXBvcnRhbnRcIj5cbiAqXG4gKiBUaGUgcmVzdWx0aW5nIGNvbmZpZ3VyYXRpb24gZG9lcyBub3Qgd2lyZSB1cCBBbmd1bGFySlMgZGlnZXN0cyB0byBab25lIGhvb2tzLiBJdCBpcyB0aGVcbiAqIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSB0ZXN0IHdyaXRlciB0byBjYWxsIGAkcm9vdFNjb3BlLiRhcHBseWAsIGFzIG5lY2Vzc2FyeSwgdG8gdHJpZ2dlclxuICogQW5ndWxhckpTIGhhbmRsZXJzIG9mIGFzeW5jIGV2ZW50cyBmcm9tIEFuZ3VsYXIuXG4gKlxuICogPC9kaXY+XG4gKlxuICogPGRpdiBjbGFzcz1cImFsZXJ0IGlzLWltcG9ydGFudFwiPlxuICpcbiAqIFRoZSBoZWxwZXIgc2V0cyB1cCBnbG9iYWwgdmFyaWFibGVzIHRvIGhvbGQgdGhlIHNoYXJlZCBBbmd1bGFyIGFuZCBBbmd1bGFySlMgaW5qZWN0b3JzLlxuICpcbiAqICogT25seSBjYWxsIHRoaXMgaGVscGVyIG9uY2UgcGVyIHNwZWMuXG4gKiAqIERvIG5vdCB1c2UgYGNyZWF0ZUFuZ3VsYXJKU1Rlc3RpbmdNb2R1bGVgIGluIHRoZSBzYW1lIHNwZWMgYXMgYGNyZWF0ZUFuZ3VsYXJUZXN0aW5nTW9kdWxlYC5cbiAqXG4gKiA8L2Rpdj5cbiAqXG4gKiBIZXJlIGlzIHRoZSBleGFtcGxlIGFwcGxpY2F0aW9uIGFuZCBpdHMgdW5pdCB0ZXN0cyB0aGF0IHVzZSBgY3JlYXRlQW5ndWxhclRlc3RpbmdNb2R1bGVgXG4gKiBhbmQgYGNyZWF0ZUFuZ3VsYXJKU1Rlc3RpbmdNb2R1bGVgLlxuICpcbiAqIDxjb2RlLXRhYnM+XG4gKiAgPGNvZGUtcGFuZSBoZWFkZXI9XCJtb2R1bGUuc3BlYy50c1wiIHBhdGg9XCJ1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS5zcGVjLnRzXCI+PC9jb2RlLXBhbmU+XG4gKiAgPGNvZGUtcGFuZSBoZWFkZXI9XCJtb2R1bGUudHNcIiBwYXRoPVwidXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHNcIj48L2NvZGUtcGFuZT5cbiAqIDwvY29kZS10YWJzPlxuICpcbiAqXG4gKiBAcGFyYW0gYW5ndWxhck1vZHVsZXMgYSBjb2xsZWN0aW9uIG9mIEFuZ3VsYXIgbW9kdWxlcyB0byBpbmNsdWRlIGluIHRoZSBjb25maWd1cmF0aW9uLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFuZ3VsYXJKU1Rlc3RpbmdNb2R1bGUoYW5ndWxhck1vZHVsZXM6IGFueVtdKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5nXG4gICAgLm1vZHVsZV8oJyQkYW5ndWxhckpTVGVzdGluZ01vZHVsZScsIFtdKVxuICAgIC5jb25zdGFudCjJtWNvbnN0YW50cy5VUEdSQURFX0FQUF9UWVBFX0tFWSwgVXBncmFkZUFwcFR5cGUuU3RhdGljKVxuICAgIC5mYWN0b3J5KMm1Y29uc3RhbnRzLklOSkVDVE9SX0tFWSwgW1xuICAgICAgybVjb25zdGFudHMuJElOSkVDVE9SLFxuICAgICAgKCRpbmplY3RvcjogbmcuSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICBUZXN0QmVkLmNvbmZpZ3VyZVRlc3RpbmdNb2R1bGUoe1xuICAgICAgICAgIGltcG9ydHM6IGFuZ3VsYXJNb2R1bGVzLFxuICAgICAgICAgIHByb3ZpZGVyczogW3twcm92aWRlOiDJtWNvbnN0YW50cy4kSU5KRUNUT1IsIHVzZVZhbHVlOiAkaW5qZWN0b3J9XSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBUZXN0QmVkLmluamVjdChJbmplY3Rvcik7XG4gICAgICB9LFxuICAgIF0pLm5hbWU7XG59XG4iXX0=