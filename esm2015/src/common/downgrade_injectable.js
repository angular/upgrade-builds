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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2luamVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vZG93bmdyYWRlX2luamVjdGFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFTQSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBDekMsTUFBTSw4QkFBOEIsS0FBVTs7SUFDNUMsTUFBTSxPQUFPLEdBQUcsVUFBUyxDQUFXLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUMvRCxtQkFBQyxPQUFjLEVBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRTdDLE9BQU8sT0FBTyxDQUFDO0NBQ2hCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7SU5KRUNUT1JfS0VZfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gYWxsb3cgYW4gQW5ndWxhciBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFySlMuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBwcm92aWRlcyBhY2Nlc3MgdG8gdGhlIEFuZ3VsYXJcbiAqIHNlcnZpY2UgaWRlbnRpZmllZCBieSB0aGUgYHRva2VuYCBwYXJhbWV0ZXIuXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogRmlyc3QgZW5zdXJlIHRoYXQgdGhlIHNlcnZpY2UgdG8gYmUgZG93bmdyYWRlZCBpcyBwcm92aWRlZCBpbiBhbiBgTmdNb2R1bGVgXG4gKiB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi4gRm9yIGV4YW1wbGUsIGxldCdzIGFzc3VtZSB3ZSBoYXZlXG4gKiBkZWZpbmVkIGBIZXJvZXNTZXJ2aWNlYFxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXNlcnZpY2VcIn1cbiAqXG4gKiBhbmQgdGhhdCB3ZSBoYXZlIGluY2x1ZGVkIHRoaXMgaW4gb3VyIHVwZ3JhZGUgYXBwIGBOZ01vZHVsZWBcbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLW1vZHVsZVwifVxuICpcbiAqIE5vdyB3ZSBjYW4gcmVnaXN0ZXIgdGhlIGBkb3duZ3JhZGVJbmplY3RhYmxlYCBmYWN0b3J5IGZ1bmN0aW9uIGZvciB0aGUgc2VydmljZVxuICogb24gYW4gQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwiZG93bmdyYWRlLW5nMi1oZXJvZXMtc2VydmljZVwifVxuICpcbiAqIEluc2lkZSBhbiBBbmd1bGFySlMgY29tcG9uZW50J3MgY29udHJvbGxlciB3ZSBjYW4gZ2V0IGhvbGQgb2YgdGhlXG4gKiBkb3duZ3JhZGVkIHNlcnZpY2UgdmlhIHRoZSBuYW1lIHdlIGdhdmUgd2hlbiBkb3duZ3JhZGluZy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwiZXhhbXBsZS1hcHBcIn1cbiAqXG4gKiBAcGFyYW0gdG9rZW4gYW4gYEluamVjdGlvblRva2VuYCB0aGF0IGlkZW50aWZpZXMgYSBzZXJ2aWNlIHByb3ZpZGVkIGZyb20gQW5ndWxhci5cbiAqXG4gKiBAcmV0dXJucyBhIFtmYWN0b3J5IGZ1bmN0aW9uXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9ndWlkZS9kaSkgdGhhdCBjYW4gYmVcbiAqIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIHNlcnZpY2Ugb24gYW4gQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVJbmplY3RhYmxlKHRva2VuOiBhbnkpOiBGdW5jdGlvbiB7XG4gIGNvbnN0IGZhY3RvcnkgPSBmdW5jdGlvbihpOiBJbmplY3RvcikgeyByZXR1cm4gaS5nZXQodG9rZW4pOyB9O1xuICAoZmFjdG9yeSBhcyBhbnkpWyckaW5qZWN0J10gPSBbSU5KRUNUT1JfS0VZXTtcblxuICByZXR1cm4gZmFjdG9yeTtcbn1cbiJdfQ==