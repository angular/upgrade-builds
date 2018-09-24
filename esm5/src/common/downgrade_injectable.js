/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { INJECTOR_KEY } from './constants';
/**
 * @description
 *
 * A helper function to allow an Angular service to be accessible from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper function returns a factory function that provides access to the Angular
 * service identified by the `token` parameter.
 *
 * @usageNotes
 * ### Examples
 *
 * First ensure that the service to be downgraded is provided in an `NgModule`
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app `NgModule`
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {@example upgrade/static/ts/full/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {@example upgrade/static/ts/full/module.ts region="example-app"}
 *
 * @param token an `InjectionToken` that identifies a service provided from Angular.
 *
 * @returns a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 * @experimental
 */
export function downgradeInjectable(token) {
    var factory = function (i) { return i.get(token); };
    factory['$inject'] = [INJECTOR_KEY];
    return factory;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2luamVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vZG93bmdyYWRlX2luamVjdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBR0gsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUV6Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNILE1BQU0sOEJBQThCLEtBQVU7SUFDNUMsSUFBTSxPQUFPLEdBQUcsVUFBUyxDQUFXLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELE9BQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRTdDLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtJTkpFQ1RPUl9LRVl9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0byBhbGxvdyBhbiBBbmd1bGFyIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXJKUy5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGlzIGhlbHBlciBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IHByb3ZpZGVzIGFjY2VzcyB0byB0aGUgQW5ndWxhclxuICogc2VydmljZSBpZGVudGlmaWVkIGJ5IHRoZSBgdG9rZW5gIHBhcmFtZXRlci5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogRmlyc3QgZW5zdXJlIHRoYXQgdGhlIHNlcnZpY2UgdG8gYmUgZG93bmdyYWRlZCBpcyBwcm92aWRlZCBpbiBhbiBgTmdNb2R1bGVgXG4gKiB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi4gRm9yIGV4YW1wbGUsIGxldCdzIGFzc3VtZSB3ZSBoYXZlXG4gKiBkZWZpbmVkIGBIZXJvZXNTZXJ2aWNlYFxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXNlcnZpY2VcIn1cbiAqXG4gKiBhbmQgdGhhdCB3ZSBoYXZlIGluY2x1ZGVkIHRoaXMgaW4gb3VyIHVwZ3JhZGUgYXBwIGBOZ01vZHVsZWBcbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLW1vZHVsZVwifVxuICpcbiAqIE5vdyB3ZSBjYW4gcmVnaXN0ZXIgdGhlIGBkb3duZ3JhZGVJbmplY3RhYmxlYCBmYWN0b3J5IGZ1bmN0aW9uIGZvciB0aGUgc2VydmljZVxuICogb24gYW4gQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwiZG93bmdyYWRlLW5nMi1oZXJvZXMtc2VydmljZVwifVxuICpcbiAqIEluc2lkZSBhbiBBbmd1bGFySlMgY29tcG9uZW50J3MgY29udHJvbGxlciB3ZSBjYW4gZ2V0IGhvbGQgb2YgdGhlXG4gKiBkb3duZ3JhZGVkIHNlcnZpY2UgdmlhIHRoZSBuYW1lIHdlIGdhdmUgd2hlbiBkb3duZ3JhZGluZy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwiZXhhbXBsZS1hcHBcIn1cbiAqXG4gKiBAcGFyYW0gdG9rZW4gYW4gYEluamVjdGlvblRva2VuYCB0aGF0IGlkZW50aWZpZXMgYSBzZXJ2aWNlIHByb3ZpZGVkIGZyb20gQW5ndWxhci5cbiAqXG4gKiBAcmV0dXJucyBhIFtmYWN0b3J5IGZ1bmN0aW9uXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9ndWlkZS9kaSkgdGhhdCBjYW4gYmVcbiAqIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIHNlcnZpY2Ugb24gYW4gQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVJbmplY3RhYmxlKHRva2VuOiBhbnkpOiBGdW5jdGlvbiB7XG4gIGNvbnN0IGZhY3RvcnkgPSBmdW5jdGlvbihpOiBJbmplY3RvcikgeyByZXR1cm4gaS5nZXQodG9rZW4pOyB9O1xuICAoZmFjdG9yeSBhcyBhbnkpWyckaW5qZWN0J10gPSBbSU5KRUNUT1JfS0VZXTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn1cbiJdfQ==