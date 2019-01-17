/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { $INJECTOR, INJECTOR_KEY } from './constants';
import { getTypeName, isFunction, validateInjectionKey } from './util';
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
 * \@publicApi
 * @param {?} token an `InjectionToken` that identifies a service provided from Angular.
 * @param {?=} downgradedModule the name of the downgraded module (if any) that the injectable
 * "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose injector will
 * be used for instantiating the injectable.<br />
 * (This option is only necessary when using `downgradeModule()` to downgrade more than one Angular
 * module.)
 *
 * @return {?} a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 */
export function downgradeInjectable(token, downgradedModule = '') {
    /** @type {?} */
    const factory = function ($injector) {
        /** @type {?} */
        const injectorKey = `${INJECTOR_KEY}${downgradedModule}`;
        /** @type {?} */
        const injectableName = isFunction(token) ? getTypeName(token) : String(token);
        /** @type {?} */
        const attemptedAction = `instantiating injectable '${injectableName}'`;
        validateInjectionKey($injector, downgradedModule, injectorKey, attemptedAction);
        /** @type {?} */
        const injector = $injector.get(injectorKey);
        return injector.get(token);
    };
    ((/** @type {?} */ (factory)))['$inject'] = [$INJECTOR];
    return factory;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2luamVjdGFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvY29tbW9uL2Rvd25ncmFkZV9pbmplY3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBVUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDcEQsT0FBTyxFQUFDLFdBQVcsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4RHJFLE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxLQUFVLEVBQUUsbUJBQTJCLEVBQUU7O1VBQ3JFLE9BQU8sR0FBRyxVQUFTLFNBQW1DOztjQUNwRCxXQUFXLEdBQUcsR0FBRyxZQUFZLEdBQUcsZ0JBQWdCLEVBQUU7O2NBQ2xELGNBQWMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQzs7Y0FDdkUsZUFBZSxHQUFHLDZCQUE2QixjQUFjLEdBQUc7UUFFdEUsb0JBQW9CLENBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUMsQ0FBQzs7Y0FFMUUsUUFBUSxHQUFhLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO1FBQ3JELE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQ0QsQ0FBQyxtQkFBQSxPQUFPLEVBQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFMUMsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHskSU5KRUNUT1IsIElOSkVDVE9SX0tFWX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtnZXRUeXBlTmFtZSwgaXNGdW5jdGlvbiwgdmFsaWRhdGVJbmplY3Rpb25LZXl9IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdG8gYWxsb3cgYW4gQW5ndWxhciBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFySlMuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBwcm92aWRlcyBhY2Nlc3MgdG8gdGhlIEFuZ3VsYXJcbiAqIHNlcnZpY2UgaWRlbnRpZmllZCBieSB0aGUgYHRva2VuYCBwYXJhbWV0ZXIuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIEZpcnN0IGVuc3VyZSB0aGF0IHRoZSBzZXJ2aWNlIHRvIGJlIGRvd25ncmFkZWQgaXMgcHJvdmlkZWQgaW4gYW4gYE5nTW9kdWxlYFxuICogdGhhdCB3aWxsIGJlIHBhcnQgb2YgdGhlIHVwZ3JhZGUgYXBwbGljYXRpb24uIEZvciBleGFtcGxlLCBsZXQncyBhc3N1bWUgd2UgaGF2ZVxuICogZGVmaW5lZCBgSGVyb2VzU2VydmljZWBcbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lcy1zZXJ2aWNlXCJ9XG4gKlxuICogYW5kIHRoYXQgd2UgaGF2ZSBpbmNsdWRlZCB0aGlzIGluIG91ciB1cGdyYWRlIGFwcCBgTmdNb2R1bGVgXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1tb2R1bGVcIn1cbiAqXG4gKiBOb3cgd2UgY2FuIHJlZ2lzdGVyIHRoZSBgZG93bmdyYWRlSW5qZWN0YWJsZWAgZmFjdG9yeSBmdW5jdGlvbiBmb3IgdGhlIHNlcnZpY2VcbiAqIG9uIGFuIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cImRvd25ncmFkZS1uZzItaGVyb2VzLXNlcnZpY2VcIn1cbiAqXG4gKiBJbnNpZGUgYW4gQW5ndWxhckpTIGNvbXBvbmVudCdzIGNvbnRyb2xsZXIgd2UgY2FuIGdldCBob2xkIG9mIHRoZVxuICogZG93bmdyYWRlZCBzZXJ2aWNlIHZpYSB0aGUgbmFtZSB3ZSBnYXZlIHdoZW4gZG93bmdyYWRpbmcuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cImV4YW1wbGUtYXBwXCJ9XG4gKlxuICogPGRpdiBjbGFzcz1cImFsZXJ0IGlzLWltcG9ydGFudFwiPlxuICpcbiAqICAgV2hlbiB1c2luZyBgZG93bmdyYWRlTW9kdWxlKClgLCBkb3duZ3JhZGVkIGluamVjdGFibGVzIHdpbGwgbm90IGJlIGF2YWlsYWJsZSB1bnRpbCB0aGUgQW5ndWxhclxuICogICBtb2R1bGUgdGhhdCBwcm92aWRlcyB0aGVtIGlzIGluc3RhbnRpYXRlZC4gSW4gb3JkZXIgdG8gYmUgc2FmZSwgeW91IG5lZWQgdG8gZW5zdXJlIHRoYXQgdGhlXG4gKiAgIGRvd25ncmFkZWQgaW5qZWN0YWJsZXMgYXJlIG5vdCB1c2VkIGFueXdoZXJlIF9vdXRzaWRlXyB0aGUgcGFydCBvZiB0aGUgYXBwIHdoZXJlIGl0IGlzXG4gKiAgIGd1YXJhbnRlZWQgdGhhdCB0aGVpciBtb2R1bGUgaGFzIGJlZW4gaW5zdGFudGlhdGVkLlxuICpcbiAqICAgRm9yIGV4YW1wbGUsIGl0IGlzIF9PS18gdG8gdXNlIGEgZG93bmdyYWRlZCBzZXJ2aWNlIGluIGFuIHVwZ3JhZGVkIGNvbXBvbmVudCB0aGF0IGlzIG9ubHkgdXNlZFxuICogICBmcm9tIGEgZG93bmdyYWRlZCBBbmd1bGFyIGNvbXBvbmVudCBwcm92aWRlZCBieSB0aGUgc2FtZSBBbmd1bGFyIG1vZHVsZSBhcyB0aGUgaW5qZWN0YWJsZSwgYnV0XG4gKiAgIGl0IGlzIF9ub3QgT0tfIHRvIHVzZSBpdCBpbiBhbiBBbmd1bGFySlMgY29tcG9uZW50IHRoYXQgbWF5IGJlIHVzZWQgaW5kZXBlbmRlbnRseSBvZiBBbmd1bGFyIG9yXG4gKiAgIHVzZSBpdCBpbiBhIGRvd25ncmFkZWQgQW5ndWxhciBjb21wb25lbnQgZnJvbSBhIGRpZmZlcmVudCBtb2R1bGUuXG4gKlxuICogPC9kaXY+XG4gKlxuICogQHBhcmFtIHRva2VuIGFuIGBJbmplY3Rpb25Ub2tlbmAgdGhhdCBpZGVudGlmaWVzIGEgc2VydmljZSBwcm92aWRlZCBmcm9tIEFuZ3VsYXIuXG4gKiBAcGFyYW0gZG93bmdyYWRlZE1vZHVsZSB0aGUgbmFtZSBvZiB0aGUgZG93bmdyYWRlZCBtb2R1bGUgKGlmIGFueSkgdGhhdCB0aGUgaW5qZWN0YWJsZVxuICogXCJiZWxvbmdzIHRvXCIsIGFzIHJldHVybmVkIGJ5IGEgY2FsbCB0byBgZG93bmdyYWRlTW9kdWxlKClgLiBJdCBpcyB0aGUgbW9kdWxlLCB3aG9zZSBpbmplY3RvciB3aWxsXG4gKiBiZSB1c2VkIGZvciBpbnN0YW50aWF0aW5nIHRoZSBpbmplY3RhYmxlLjxiciAvPlxuICogKFRoaXMgb3B0aW9uIGlzIG9ubHkgbmVjZXNzYXJ5IHdoZW4gdXNpbmcgYGRvd25ncmFkZU1vZHVsZSgpYCB0byBkb3duZ3JhZGUgbW9yZSB0aGFuIG9uZSBBbmd1bGFyXG4gKiBtb2R1bGUuKVxuICpcbiAqIEByZXR1cm5zIGEgW2ZhY3RvcnkgZnVuY3Rpb25dKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2d1aWRlL2RpKSB0aGF0IGNhbiBiZVxuICogdXNlZCB0byByZWdpc3RlciB0aGUgc2VydmljZSBvbiBhbiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUluamVjdGFibGUodG9rZW46IGFueSwgZG93bmdyYWRlZE1vZHVsZTogc3RyaW5nID0gJycpOiBGdW5jdGlvbiB7XG4gIGNvbnN0IGZhY3RvcnkgPSBmdW5jdGlvbigkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSkge1xuICAgIGNvbnN0IGluamVjdG9yS2V5ID0gYCR7SU5KRUNUT1JfS0VZfSR7ZG93bmdyYWRlZE1vZHVsZX1gO1xuICAgIGNvbnN0IGluamVjdGFibGVOYW1lID0gaXNGdW5jdGlvbih0b2tlbikgPyBnZXRUeXBlTmFtZSh0b2tlbikgOiBTdHJpbmcodG9rZW4pO1xuICAgIGNvbnN0IGF0dGVtcHRlZEFjdGlvbiA9IGBpbnN0YW50aWF0aW5nIGluamVjdGFibGUgJyR7aW5qZWN0YWJsZU5hbWV9J2A7XG5cbiAgICB2YWxpZGF0ZUluamVjdGlvbktleSgkaW5qZWN0b3IsIGRvd25ncmFkZWRNb2R1bGUsIGluamVjdG9yS2V5LCBhdHRlbXB0ZWRBY3Rpb24pO1xuXG4gICAgY29uc3QgaW5qZWN0b3I6IEluamVjdG9yID0gJGluamVjdG9yLmdldChpbmplY3RvcktleSk7XG4gICAgcmV0dXJuIGluamVjdG9yLmdldCh0b2tlbik7XG4gIH07XG4gIChmYWN0b3J5IGFzIGFueSlbJyRpbmplY3QnXSA9IFskSU5KRUNUT1JdO1xuXG4gIHJldHVybiBmYWN0b3J5O1xufVxuIl19