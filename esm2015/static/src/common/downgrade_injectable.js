/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
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
 * ### Examples
 *
 * First ensure that the service to be downgraded is provided in an `NgModule`
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app `NgModule`
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {\@example upgrade/static/ts/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {\@example upgrade/static/ts/module.ts region="example-app"}
 *
 * \@experimental
 * @param {?} token an `InjectionToken` that identifies a service provided from Angular.
 *
 * @return {?} a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 */
export function downgradeInjectable(token) {
    const /** @type {?} */ factory = function (i) { return i.get(token); };
    (/** @type {?} */ (factory))['$inject'] = [INJECTOR_KEY];
    return factory;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2luamVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvY29tbW9uL2Rvd25ncmFkZV9pbmplY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBU0EsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQ3pDLE1BQU0sOEJBQThCLEtBQVU7SUFDNUMsdUJBQU0sT0FBTyxHQUFHLFVBQVMsQ0FBVyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUMvRCxtQkFBQyxPQUFjLEVBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRTdDLE1BQU0sQ0FBQyxPQUFPLENBQUM7Q0FDaEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtJTkpFQ1RPUl9LRVl9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byBhbGxvdyBhbiBBbmd1bGFyIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXJKUy5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGlzIGhlbHBlciBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IHByb3ZpZGVzIGFjY2VzcyB0byB0aGUgQW5ndWxhclxuICogc2VydmljZSBpZGVudGlmaWVkIGJ5IHRoZSBgdG9rZW5gIHBhcmFtZXRlci5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBGaXJzdCBlbnN1cmUgdGhhdCB0aGUgc2VydmljZSB0byBiZSBkb3duZ3JhZGVkIGlzIHByb3ZpZGVkIGluIGFuIGBOZ01vZHVsZWBcbiAqIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLiBGb3IgZXhhbXBsZSwgbGV0J3MgYXNzdW1lIHdlIGhhdmVcbiAqIGRlZmluZWQgYEhlcm9lc1NlcnZpY2VgXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXNlcnZpY2VcIn1cbiAqXG4gKiBhbmQgdGhhdCB3ZSBoYXZlIGluY2x1ZGVkIHRoaXMgaW4gb3VyIHVwZ3JhZGUgYXBwIGBOZ01vZHVsZWBcbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1tb2R1bGVcIn1cbiAqXG4gKiBOb3cgd2UgY2FuIHJlZ2lzdGVyIHRoZSBgZG93bmdyYWRlSW5qZWN0YWJsZWAgZmFjdG9yeSBmdW5jdGlvbiBmb3IgdGhlIHNlcnZpY2VcbiAqIG9uIGFuIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL21vZHVsZS50cyByZWdpb249XCJkb3duZ3JhZGUtbmcyLWhlcm9lcy1zZXJ2aWNlXCJ9XG4gKlxuICogSW5zaWRlIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQncyBjb250cm9sbGVyIHdlIGNhbiBnZXQgaG9sZCBvZiB0aGVcbiAqIGRvd25ncmFkZWQgc2VydmljZSB2aWEgdGhlIG5hbWUgd2UgZ2F2ZSB3aGVuIGRvd25ncmFkaW5nLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9tb2R1bGUudHMgcmVnaW9uPVwiZXhhbXBsZS1hcHBcIn1cbiAqXG4gKiBAcGFyYW0gdG9rZW4gYW4gYEluamVjdGlvblRva2VuYCB0aGF0IGlkZW50aWZpZXMgYSBzZXJ2aWNlIHByb3ZpZGVkIGZyb20gQW5ndWxhci5cbiAqXG4gKiBAcmV0dXJucyBhIFtmYWN0b3J5IGZ1bmN0aW9uXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9ndWlkZS9kaSkgdGhhdCBjYW4gYmVcbiAqIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIHNlcnZpY2Ugb24gYW4gQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVJbmplY3RhYmxlKHRva2VuOiBhbnkpOiBGdW5jdGlvbiB7XG4gIGNvbnN0IGZhY3RvcnkgPSBmdW5jdGlvbihpOiBJbmplY3RvcikgeyByZXR1cm4gaS5nZXQodG9rZW4pOyB9O1xuICAoZmFjdG9yeSBhcyBhbnkpWyckaW5qZWN0J10gPSBbSU5KRUNUT1JfS0VZXTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn1cbiJdfQ==