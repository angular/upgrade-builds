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
 * ### Examples
 *
 * First ensure that the service to be downgraded is provided in an `NgModule`
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app `NgModule`
 *
 * {@example upgrade/static/ts/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {@example upgrade/static/ts/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {@example upgrade/static/ts/module.ts region="example-app"}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2luamVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vZG93bmdyYWRlX2luamVjdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVNBLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEN6QyxNQUFNLDhCQUE4QixLQUFVO0lBQzVDLElBQU0sT0FBTyxHQUFHLFVBQVMsQ0FBVyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUM5RCxPQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUU3QyxNQUFNLENBQUMsT0FBTyxDQUFDO0NBQ2hCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7SU5KRUNUT1JfS0VZfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gYWxsb3cgYW4gQW5ndWxhciBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFySlMuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBwcm92aWRlcyBhY2Nlc3MgdG8gdGhlIEFuZ3VsYXJcbiAqIHNlcnZpY2UgaWRlbnRpZmllZCBieSB0aGUgYHRva2VuYCBwYXJhbWV0ZXIuXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogRmlyc3QgZW5zdXJlIHRoYXQgdGhlIHNlcnZpY2UgdG8gYmUgZG93bmdyYWRlZCBpcyBwcm92aWRlZCBpbiBhbiBgTmdNb2R1bGVgXG4gKiB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi4gRm9yIGV4YW1wbGUsIGxldCdzIGFzc3VtZSB3ZSBoYXZlXG4gKiBkZWZpbmVkIGBIZXJvZXNTZXJ2aWNlYFxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lcy1zZXJ2aWNlXCJ9XG4gKlxuICogYW5kIHRoYXQgd2UgaGF2ZSBpbmNsdWRlZCB0aGlzIGluIG91ciB1cGdyYWRlIGFwcCBgTmdNb2R1bGVgXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL21vZHVsZS50cyByZWdpb249XCJuZzItbW9kdWxlXCJ9XG4gKlxuICogTm93IHdlIGNhbiByZWdpc3RlciB0aGUgYGRvd25ncmFkZUluamVjdGFibGVgIGZhY3RvcnkgZnVuY3Rpb24gZm9yIHRoZSBzZXJ2aWNlXG4gKiBvbiBhbiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9tb2R1bGUudHMgcmVnaW9uPVwiZG93bmdyYWRlLW5nMi1oZXJvZXMtc2VydmljZVwifVxuICpcbiAqIEluc2lkZSBhbiBBbmd1bGFySlMgY29tcG9uZW50J3MgY29udHJvbGxlciB3ZSBjYW4gZ2V0IGhvbGQgb2YgdGhlXG4gKiBkb3duZ3JhZGVkIHNlcnZpY2UgdmlhIHRoZSBuYW1lIHdlIGdhdmUgd2hlbiBkb3duZ3JhZGluZy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvbW9kdWxlLnRzIHJlZ2lvbj1cImV4YW1wbGUtYXBwXCJ9XG4gKlxuICogQHBhcmFtIHRva2VuIGFuIGBJbmplY3Rpb25Ub2tlbmAgdGhhdCBpZGVudGlmaWVzIGEgc2VydmljZSBwcm92aWRlZCBmcm9tIEFuZ3VsYXIuXG4gKlxuICogQHJldHVybnMgYSBbZmFjdG9yeSBmdW5jdGlvbl0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvZ3VpZGUvZGkpIHRoYXQgY2FuIGJlXG4gKiB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBzZXJ2aWNlIG9uIGFuIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gZG93bmdyYWRlSW5qZWN0YWJsZSh0b2tlbjogYW55KTogRnVuY3Rpb24ge1xuICBjb25zdCBmYWN0b3J5ID0gZnVuY3Rpb24oaTogSW5qZWN0b3IpIHsgcmV0dXJuIGkuZ2V0KHRva2VuKTsgfTtcbiAgKGZhY3RvcnkgYXMgYW55KVsnJGluamVjdCddID0gW0lOSkVDVE9SX0tFWV07XG5cbiAgcmV0dXJuIGZhY3Rvcnk7XG59XG4iXX0=