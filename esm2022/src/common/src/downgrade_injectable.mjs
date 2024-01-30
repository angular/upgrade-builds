/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { $INJECTOR, INJECTOR_KEY } from './constants';
import { getTypeName, isFunction, validateInjectionKey } from './util';
/**
 * @description
 *
 * A helper function to allow an Angular service to be accessible from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation*
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
 * <div class="alert is-important">
 *
 *   When using `downgradeModule()`, downgraded injectables will not be available until the Angular
 *   module that provides them is instantiated. In order to be safe, you need to ensure that the
 *   downgraded injectables are not used anywhere _outside_ the part of the app where it is
 *   guaranteed that their module has been instantiated.
 *
 *   For example, it is _OK_ to use a downgraded service in an upgraded component that is only used
 *   from a downgraded Angular component provided by the same Angular module as the injectable, but
 *   it is _not OK_ to use it in an AngularJS component that may be used independently of Angular or
 *   use it in a downgraded Angular component from a different module.
 *
 * </div>
 *
 * @param token an `InjectionToken` that identifies a service provided from Angular.
 * @param downgradedModule the name of the downgraded module (if any) that the injectable
 * "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose injector will
 * be used for instantiating the injectable.<br />
 * (This option is only necessary when using `downgradeModule()` to downgrade more than one Angular
 * module.)
 *
 * @returns a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 * @publicApi
 */
export function downgradeInjectable(token, downgradedModule = '') {
    const factory = function ($injector) {
        const injectorKey = `${INJECTOR_KEY}${downgradedModule}`;
        const injectableName = isFunction(token) ? getTypeName(token) : String(token);
        const attemptedAction = `instantiating injectable '${injectableName}'`;
        validateInjectionKey($injector, downgradedModule, injectorKey, attemptedAction);
        try {
            const injector = $injector.get(injectorKey);
            return injector.get(token);
        }
        catch (err) {
            throw new Error(`Error while ${attemptedAction}: ${err.message || err}`);
        }
    };
    factory['$inject'] = [$INJECTOR];
    return factory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2luamVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vc3JjL2Rvd25ncmFkZV9pbmplY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUtILE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3BELE9BQU8sRUFBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRXJFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJERztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxLQUFVLEVBQUUsbUJBQTJCLEVBQUU7SUFDM0UsTUFBTSxPQUFPLEdBQUcsVUFBVSxTQUEyQjtRQUNuRCxNQUFNLFdBQVcsR0FBRyxHQUFHLFlBQVksR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3pELE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUUsTUFBTSxlQUFlLEdBQUcsNkJBQTZCLGNBQWMsR0FBRyxDQUFDO1FBRXZFLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFaEYsSUFBSSxDQUFDO1lBQ0gsTUFBTSxRQUFRLEdBQWEsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0RCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLGVBQWUsZUFBZSxLQUFNLEdBQWEsQ0FBQyxPQUFPLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN0RixDQUFDO0lBQ0gsQ0FBQyxDQUFDO0lBQ0QsT0FBZSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFMUMsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJSW5qZWN0b3JTZXJ2aWNlfSBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7JElOSkVDVE9SLCBJTkpFQ1RPUl9LRVl9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Z2V0VHlwZU5hbWUsIGlzRnVuY3Rpb24sIHZhbGlkYXRlSW5qZWN0aW9uS2V5fSBmcm9tICcuL3V0aWwnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRvIGFsbG93IGFuIEFuZ3VsYXIgc2VydmljZSB0byBiZSBhY2Nlc3NpYmxlIGZyb20gQW5ndWxhckpTLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQU9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgcHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBBbmd1bGFyXG4gKiBzZXJ2aWNlIGlkZW50aWZpZWQgYnkgdGhlIGB0b2tlbmAgcGFyYW1ldGVyLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBGaXJzdCBlbnN1cmUgdGhhdCB0aGUgc2VydmljZSB0byBiZSBkb3duZ3JhZGVkIGlzIHByb3ZpZGVkIGluIGFuIGBOZ01vZHVsZWBcbiAqIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLiBGb3IgZXhhbXBsZSwgbGV0J3MgYXNzdW1lIHdlIGhhdmVcbiAqIGRlZmluZWQgYEhlcm9lc1NlcnZpY2VgXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXMtc2VydmljZVwifVxuICpcbiAqIGFuZCB0aGF0IHdlIGhhdmUgaW5jbHVkZWQgdGhpcyBpbiBvdXIgdXBncmFkZSBhcHAgYE5nTW9kdWxlYFxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItbW9kdWxlXCJ9XG4gKlxuICogTm93IHdlIGNhbiByZWdpc3RlciB0aGUgYGRvd25ncmFkZUluamVjdGFibGVgIGZhY3RvcnkgZnVuY3Rpb24gZm9yIHRoZSBzZXJ2aWNlXG4gKiBvbiBhbiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJkb3duZ3JhZGUtbmcyLWhlcm9lcy1zZXJ2aWNlXCJ9XG4gKlxuICogSW5zaWRlIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQncyBjb250cm9sbGVyIHdlIGNhbiBnZXQgaG9sZCBvZiB0aGVcbiAqIGRvd25ncmFkZWQgc2VydmljZSB2aWEgdGhlIG5hbWUgd2UgZ2F2ZSB3aGVuIGRvd25ncmFkaW5nLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJleGFtcGxlLWFwcFwifVxuICpcbiAqIDxkaXYgY2xhc3M9XCJhbGVydCBpcy1pbXBvcnRhbnRcIj5cbiAqXG4gKiAgIFdoZW4gdXNpbmcgYGRvd25ncmFkZU1vZHVsZSgpYCwgZG93bmdyYWRlZCBpbmplY3RhYmxlcyB3aWxsIG5vdCBiZSBhdmFpbGFibGUgdW50aWwgdGhlIEFuZ3VsYXJcbiAqICAgbW9kdWxlIHRoYXQgcHJvdmlkZXMgdGhlbSBpcyBpbnN0YW50aWF0ZWQuIEluIG9yZGVyIHRvIGJlIHNhZmUsIHlvdSBuZWVkIHRvIGVuc3VyZSB0aGF0IHRoZVxuICogICBkb3duZ3JhZGVkIGluamVjdGFibGVzIGFyZSBub3QgdXNlZCBhbnl3aGVyZSBfb3V0c2lkZV8gdGhlIHBhcnQgb2YgdGhlIGFwcCB3aGVyZSBpdCBpc1xuICogICBndWFyYW50ZWVkIHRoYXQgdGhlaXIgbW9kdWxlIGhhcyBiZWVuIGluc3RhbnRpYXRlZC5cbiAqXG4gKiAgIEZvciBleGFtcGxlLCBpdCBpcyBfT0tfIHRvIHVzZSBhIGRvd25ncmFkZWQgc2VydmljZSBpbiBhbiB1cGdyYWRlZCBjb21wb25lbnQgdGhhdCBpcyBvbmx5IHVzZWRcbiAqICAgZnJvbSBhIGRvd25ncmFkZWQgQW5ndWxhciBjb21wb25lbnQgcHJvdmlkZWQgYnkgdGhlIHNhbWUgQW5ndWxhciBtb2R1bGUgYXMgdGhlIGluamVjdGFibGUsIGJ1dFxuICogICBpdCBpcyBfbm90IE9LXyB0byB1c2UgaXQgaW4gYW4gQW5ndWxhckpTIGNvbXBvbmVudCB0aGF0IG1heSBiZSB1c2VkIGluZGVwZW5kZW50bHkgb2YgQW5ndWxhciBvclxuICogICB1c2UgaXQgaW4gYSBkb3duZ3JhZGVkIEFuZ3VsYXIgY29tcG9uZW50IGZyb20gYSBkaWZmZXJlbnQgbW9kdWxlLlxuICpcbiAqIDwvZGl2PlxuICpcbiAqIEBwYXJhbSB0b2tlbiBhbiBgSW5qZWN0aW9uVG9rZW5gIHRoYXQgaWRlbnRpZmllcyBhIHNlcnZpY2UgcHJvdmlkZWQgZnJvbSBBbmd1bGFyLlxuICogQHBhcmFtIGRvd25ncmFkZWRNb2R1bGUgdGhlIG5hbWUgb2YgdGhlIGRvd25ncmFkZWQgbW9kdWxlIChpZiBhbnkpIHRoYXQgdGhlIGluamVjdGFibGVcbiAqIFwiYmVsb25ncyB0b1wiLCBhcyByZXR1cm5lZCBieSBhIGNhbGwgdG8gYGRvd25ncmFkZU1vZHVsZSgpYC4gSXQgaXMgdGhlIG1vZHVsZSwgd2hvc2UgaW5qZWN0b3Igd2lsbFxuICogYmUgdXNlZCBmb3IgaW5zdGFudGlhdGluZyB0aGUgaW5qZWN0YWJsZS48YnIgLz5cbiAqIChUaGlzIG9wdGlvbiBpcyBvbmx5IG5lY2Vzc2FyeSB3aGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAgdG8gZG93bmdyYWRlIG1vcmUgdGhhbiBvbmUgQW5ndWxhclxuICogbW9kdWxlLilcbiAqXG4gKiBAcmV0dXJucyBhIFtmYWN0b3J5IGZ1bmN0aW9uXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9ndWlkZS9kaSkgdGhhdCBjYW4gYmVcbiAqIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIHNlcnZpY2Ugb24gYW4gQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVJbmplY3RhYmxlKHRva2VuOiBhbnksIGRvd25ncmFkZWRNb2R1bGU6IHN0cmluZyA9ICcnKTogRnVuY3Rpb24ge1xuICBjb25zdCBmYWN0b3J5ID0gZnVuY3Rpb24gKCRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSkge1xuICAgIGNvbnN0IGluamVjdG9yS2V5ID0gYCR7SU5KRUNUT1JfS0VZfSR7ZG93bmdyYWRlZE1vZHVsZX1gO1xuICAgIGNvbnN0IGluamVjdGFibGVOYW1lID0gaXNGdW5jdGlvbih0b2tlbikgPyBnZXRUeXBlTmFtZSh0b2tlbikgOiBTdHJpbmcodG9rZW4pO1xuICAgIGNvbnN0IGF0dGVtcHRlZEFjdGlvbiA9IGBpbnN0YW50aWF0aW5nIGluamVjdGFibGUgJyR7aW5qZWN0YWJsZU5hbWV9J2A7XG5cbiAgICB2YWxpZGF0ZUluamVjdGlvbktleSgkaW5qZWN0b3IsIGRvd25ncmFkZWRNb2R1bGUsIGluamVjdG9yS2V5LCBhdHRlbXB0ZWRBY3Rpb24pO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGluamVjdG9yOiBJbmplY3RvciA9ICRpbmplY3Rvci5nZXQoaW5qZWN0b3JLZXkpO1xuICAgICAgcmV0dXJuIGluamVjdG9yLmdldCh0b2tlbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogJHsoZXJyIGFzIEVycm9yKS5tZXNzYWdlIHx8IGVycn1gKTtcbiAgICB9XG4gIH07XG4gIChmYWN0b3J5IGFzIGFueSlbJyRpbmplY3QnXSA9IFskSU5KRUNUT1JdO1xuXG4gIHJldHVybiBmYWN0b3J5O1xufVxuIl19