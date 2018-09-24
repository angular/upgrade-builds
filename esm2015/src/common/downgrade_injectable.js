/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { INJECTOR_KEY } from './constants';
/**
 * \@description
 *
 * A helper function to allow an Angular service to be accessible from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper function returns a factory function that provides access to the Angular
 * service identified by the `token` parameter.
 *
 * \@usageNotes
 * ### Examples
 *
 * First ensure that the service to be downgraded is provided in an `NgModule`
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app `NgModule`
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {\@example upgrade/static/ts/full/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {\@example upgrade/static/ts/full/module.ts region="example-app"}
 *
 * \@experimental
 * @param {?} token an `InjectionToken` that identifies a service provided from Angular.
 *
 * @return {?} a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 */
export function downgradeInjectable(token) {
    /** @type {?} */
    const factory = function (i) { return i.get(token); };
    (/** @type {?} */ (factory))['$inject'] = [INJECTOR_KEY];
    return factory;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2luamVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vZG93bmdyYWRlX2luamVjdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFTQSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQ3pDLE1BQU0sOEJBQThCLEtBQVU7O0lBQzVDLE1BQU0sT0FBTyxHQUFHLFVBQVMsQ0FBVyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDL0QsbUJBQUMsT0FBYyxFQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUU3QyxPQUFPLE9BQU8sQ0FBQztDQUNoQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0lOSkVDVE9SX0tFWX0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGFsbG93IGFuIEFuZ3VsYXIgc2VydmljZSB0byBiZSBhY2Nlc3NpYmxlIGZyb20gQW5ndWxhckpTLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQW9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBBbmd1bGFyXG4gKiBzZXJ2aWNlIGlkZW50aWZpZWQgYnkgdGhlIGB0b2tlbmAgcGFyYW1ldGVyLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBGaXJzdCBlbnN1cmUgdGhhdCB0aGUgc2VydmljZSB0byBiZSBkb3duZ3JhZGVkIGlzIHByb3ZpZGVkIGluIGFuIGBOZ01vZHVsZWBcbiAqIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLiBGb3IgZXhhbXBsZSwgbGV0J3MgYXNzdW1lIHdlIGhhdmVcbiAqIGRlZmluZWQgYEhlcm9lc1NlcnZpY2VgXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXMtc2VydmljZVwifVxuICpcbiAqIGFuZCB0aGF0IHdlIGhhdmUgaW5jbHVkZWQgdGhpcyBpbiBvdXIgdXBncmFkZSBhcHAgYE5nTW9kdWxlYFxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItbW9kdWxlXCJ9XG4gKlxuICogTm93IHdlIGNhbiByZWdpc3RlciB0aGUgYGRvd25ncmFkZUluamVjdGFibGVgIGZhY3RvcnkgZnVuY3Rpb24gZm9yIHRoZSBzZXJ2aWNlXG4gKiBvbiBhbiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJkb3duZ3JhZGUtbmcyLWhlcm9lcy1zZXJ2aWNlXCJ9XG4gKlxuICogSW5zaWRlIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQncyBjb250cm9sbGVyIHdlIGNhbiBnZXQgaG9sZCBvZiB0aGVcbiAqIGRvd25ncmFkZWQgc2VydmljZSB2aWEgdGhlIG5hbWUgd2UgZ2F2ZSB3aGVuIGRvd25ncmFkaW5nLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJleGFtcGxlLWFwcFwifVxuICpcbiAqIEBwYXJhbSB0b2tlbiBhbiBgSW5qZWN0aW9uVG9rZW5gIHRoYXQgaWRlbnRpZmllcyBhIHNlcnZpY2UgcHJvdmlkZWQgZnJvbSBBbmd1bGFyLlxuICpcbiAqIEByZXR1cm5zIGEgW2ZhY3RvcnkgZnVuY3Rpb25dKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2d1aWRlL2RpKSB0aGF0IGNhbiBiZVxuICogdXNlZCB0byByZWdpc3RlciB0aGUgc2VydmljZSBvbiBhbiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUluamVjdGFibGUodG9rZW46IGFueSk6IEZ1bmN0aW9uIHtcbiAgY29uc3QgZmFjdG9yeSA9IGZ1bmN0aW9uKGk6IEluamVjdG9yKSB7IHJldHVybiBpLmdldCh0b2tlbik7IH07XG4gIChmYWN0b3J5IGFzIGFueSlbJyRpbmplY3QnXSA9IFtJTkpFQ1RPUl9LRVldO1xuXG4gIHJldHVybiBmYWN0b3J5O1xufVxuIl19