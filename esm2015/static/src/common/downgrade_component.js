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
import { ComponentFactoryResolver, NgZone } from '@angular/core';
import { $COMPILE, $INJECTOR, $PARSE, INJECTOR_KEY, LAZY_MODULE_REF, REQUIRE_INJECTOR, REQUIRE_NG_MODEL } from './constants';
import { DowngradeComponentAdapter } from './downgrade_component_adapter';
import { controllerKey, getComponentName, isFunction } from './util';
/**
 * @record
 * @template T
 */
function Thenable() { }
/** @type {?} */
Thenable.prototype.then;
/**
 * \@description
 *
 * A helper function that allows an Angular component to be used from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper function returns a factory function to be used for registering
 * an AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * \@usageNotes
 * ### Examples
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-heroes-wrapper"}
 *
 * \@publicApi
 * @param {?} info contains information about the Component that is being downgraded:
 *
 * * `component: Type<any>`: The type of the Component that will be downgraded
 * * `propagateDigest?: boolean`: Whether to perform {\@link ChangeDetectorRef#detectChanges
 *   change detection} on the component on every
 *   [$digest](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest). If set to `false`,
 *   change detection will still be performed when any of the component's inputs changes.
 *   (Default: true)
 *
 * @return {?} a factory function that can be used to register the component in an
 * AngularJS module.
 *
 */
export function downgradeComponent(info) {
    /** @type {?} */
    const directiveFactory = function ($compile, $injector, $parse) {
        /** @type {?} */
        let needsNgZone = false;
        /** @type {?} */
        let wrapCallback = (cb) => cb;
        /** @type {?} */
        let ngZone;
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: (scope, element, attrs, required) => {
                /** @type {?} */
                const ngModel = required[1];
                /** @type {?} */
                let parentInjector = required[0];
                /** @type {?} */
                let ranAsync = false;
                if (!parentInjector) {
                    /** @type {?} */
                    const lazyModuleRef = /** @type {?} */ ($injector.get(LAZY_MODULE_REF));
                    needsNgZone = lazyModuleRef.needsNgZone;
                    parentInjector = lazyModuleRef.injector || /** @type {?} */ (lazyModuleRef.promise);
                }
                /** @type {?} */
                const doDowngrade = (injector) => {
                    /** @type {?} */
                    const componentFactoryResolver = injector.get(ComponentFactoryResolver);
                    /** @type {?} */
                    const componentFactory = /** @type {?} */ ((componentFactoryResolver.resolveComponentFactory(info.component)));
                    if (!componentFactory) {
                        throw new Error('Expecting ComponentFactory for: ' + getComponentName(info.component));
                    }
                    /** @type {?} */
                    const injectorPromise = new ParentInjectorPromise(element);
                    /** @type {?} */
                    const facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory, wrapCallback);
                    /** @type {?} */
                    const projectableNodes = facade.compileContents();
                    facade.createComponent(projectableNodes);
                    facade.setupInputs(needsNgZone, info.propagateDigest);
                    facade.setupOutputs();
                    facade.registerCleanup();
                    injectorPromise.resolve(facade.getInjector());
                    if (ranAsync) {
                        // If this is run async, it is possible that it is not run inside a
                        // digest and initial input values will not be detected.
                        scope.$evalAsync(() => { });
                    }
                };
                /** @type {?} */
                const downgradeFn = !needsNgZone ? doDowngrade : (injector) => {
                    if (!ngZone) {
                        ngZone = injector.get(NgZone);
                        wrapCallback = (cb) => () => NgZone.isInAngularZone() ? cb() : ngZone.run(cb);
                    }
                    wrapCallback(() => doDowngrade(injector))();
                };
                if (isThenable(parentInjector)) {
                    parentInjector.then(downgradeFn);
                }
                else {
                    downgradeFn(parentInjector);
                }
                ranAsync = true;
            }
        };
    };
    // bracket-notation because of closure - see #14441
    directiveFactory['$inject'] = [$COMPILE, $INJECTOR, $PARSE];
    return directiveFactory;
}
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of Angular 1's $compile.
 */
class ParentInjectorPromise {
    /**
     * @param {?} element
     */
    constructor(element) {
        this.element = element;
        this.injectorKey = controllerKey(INJECTOR_KEY);
        this.callbacks = [];
        /** @type {?} */ ((
        // Store the promise on the element.
        element.data))(this.injectorKey, this);
    }
    /**
     * @param {?} callback
     * @return {?}
     */
    then(callback) {
        if (this.injector) {
            callback(this.injector);
        }
        else {
            this.callbacks.push(callback);
        }
    }
    /**
     * @param {?} injector
     * @return {?}
     */
    resolve(injector) {
        this.injector = injector; /** @type {?} */
        ((
        // Store the real injector on the element.
        this.element.data))(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = /** @type {?} */ ((null));
        // Run the queued callbacks.
        this.callbacks.forEach(callback => callback(injector));
        this.callbacks.length = 0;
    }
}
if (false) {
    /** @type {?} */
    ParentInjectorPromise.prototype.injector;
    /** @type {?} */
    ParentInjectorPromise.prototype.injectorKey;
    /** @type {?} */
    ParentInjectorPromise.prototype.callbacks;
    /** @type {?} */
    ParentInjectorPromise.prototype.element;
}
/**
 * @template T
 * @param {?} obj
 * @return {?}
 */
function isThenable(obj) {
    return isFunction((/** @type {?} */ (obj)).then);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBbUIsd0JBQXdCLEVBQVksTUFBTSxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBR2pHLE9BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzNILE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBZ0IsYUFBYSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBK0NsRixNQUFNLFVBQVUsa0JBQWtCLENBQUMsSUFRbEM7O0lBQ0MsTUFBTSxnQkFBZ0IsR0FDVyxVQUNJLFFBQWlDLEVBQ2pDLFNBQW1DLEVBQ25DLE1BQTZCOztRQU1oRSxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7O1FBQ3hCLElBQUksWUFBWSxHQUFHLENBQUksRUFBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7O1FBQzFDLElBQUksTUFBTSxDQUFTO1FBRW5CLE9BQU87WUFDTCxRQUFRLEVBQUUsR0FBRztZQUNiLFFBQVEsRUFBRSxJQUFJO1lBQ2QsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUM7WUFDN0MsSUFBSSxFQUFFLENBQUMsS0FBcUIsRUFBRSxPQUFpQyxFQUFFLEtBQTBCLEVBQ3BGLFFBQWUsRUFBRSxFQUFFOztnQkFLeEIsTUFBTSxPQUFPLEdBQStCLFFB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RUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDNUQsT0FBTyxnQkFBZ0IsQ0FBQztDQUN6Qjs7Ozs7QUFNRCxNQUFNLHFCQUFxQjs7OztJQU16QixZQUFvQixPQUFpQztRQUFqQyxZQUFPLEdBQVAsT0FBTyxDQUEwQjsyQkFIdkIsYUFBYSxDQUFDLFlBQVksQ0FBQzt5QkFDSixFQUFFOzs7UUFJckQsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUk7S0FDdEM7Ozs7O0lBRUQsSUFBSSxDQUFDLFFBQXFDO1FBQ3hDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3pCO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQjtLQUNGOzs7OztJQUVELE9BQU8sQ0FBQyxRQUFrQjtRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzs7O1FBR3pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUTs7UUFHOUMsSUFBSSxDQUFDLE9BQU8sc0JBQUcsSUFBSSxFQUFFLENBQUM7O1FBR3RCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQzNCO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxTQUFTLFVBQVUsQ0FBSSxHQUFXO0lBQ2hDLE9BQU8sVUFBVSxDQUFDLG1CQUFDLEdBQVUsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSW5qZWN0b3IsIE5nWm9uZSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRDT01QSUxFLCAkSU5KRUNUT1IsICRQQVJTRSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFJFUVVJUkVfSU5KRUNUT1IsIFJFUVVJUkVfTkdfTU9ERUx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcn0gZnJvbSAnLi9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXInO1xuaW1wb3J0IHtMYXp5TW9kdWxlUmVmLCBjb250cm9sbGVyS2V5LCBnZXRDb21wb25lbnROYW1lLCBpc0Z1bmN0aW9ufSBmcm9tICcuL3V0aWwnO1xuXG5cbmludGVyZmFjZSBUaGVuYWJsZTxUPiB7XG4gIHRoZW4oY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gYW55KTogYW55O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFySlMuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdG8gYmUgdXNlZCBmb3IgcmVnaXN0ZXJpbmdcbiAqIGFuIEFuZ3VsYXJKUyB3cmFwcGVyIGRpcmVjdGl2ZSBmb3IgXCJkb3duZ3JhZGluZ1wiIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBMZXQncyBhc3N1bWUgdGhhdCB5b3UgaGF2ZSBhbiBBbmd1bGFyIGNvbXBvbmVudCBjYWxsZWQgYG5nMkhlcm9lc2AgdGhhdCBuZWVkc1xuICogdG8gYmUgbWFkZSBhdmFpbGFibGUgaW4gQW5ndWxhckpTIHRlbXBsYXRlcy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lc1wifVxuICpcbiAqIFdlIG11c3QgY3JlYXRlIGFuIEFuZ3VsYXJKUyBbZGlyZWN0aXZlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9ndWlkZS9kaXJlY3RpdmUpXG4gKiB0aGF0IHdpbGwgbWFrZSB0aGlzIEFuZ3VsYXIgY29tcG9uZW50IGF2YWlsYWJsZSBpbnNpZGUgQW5ndWxhckpTIHRlbXBsYXRlcy5cbiAqIFRoZSBgZG93bmdyYWRlQ29tcG9uZW50KClgIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgd2VcbiAqIGNhbiB1c2UgdG8gZGVmaW5lIHRoZSBBbmd1bGFySlMgZGlyZWN0aXZlIHRoYXQgd3JhcHMgdGhlIFwiZG93bmdyYWRlZFwiIGNvbXBvbmVudC5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lcy13cmFwcGVyXCJ9XG4gKlxuICogQHBhcmFtIGluZm8gY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIENvbXBvbmVudCB0aGF0IGlzIGJlaW5nIGRvd25ncmFkZWQ6XG4gKlxuICogKiBgY29tcG9uZW50OiBUeXBlPGFueT5gOiBUaGUgdHlwZSBvZiB0aGUgQ29tcG9uZW50IHRoYXQgd2lsbCBiZSBkb3duZ3JhZGVkXG4gKiAqIGBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuYDogV2hldGhlciB0byBwZXJmb3JtIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRlY3RDaGFuZ2VzXG4gKiAgIGNoYW5nZSBkZXRlY3Rpb259IG9uIHRoZSBjb21wb25lbnQgb24gZXZlcnlcbiAqICAgWyRkaWdlc3RdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy90eXBlLyRyb290U2NvcGUuU2NvcGUjJGRpZ2VzdCkuIElmIHNldCB0byBgZmFsc2VgLFxuICogICBjaGFuZ2UgZGV0ZWN0aW9uIHdpbGwgc3RpbGwgYmUgcGVyZm9ybWVkIHdoZW4gYW55IG9mIHRoZSBjb21wb25lbnQncyBpbnB1dHMgY2hhbmdlcy5cbiAqICAgKERlZmF1bHQ6IHRydWUpXG4gKlxuICogQHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBpbiBhblxuICogQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVDb21wb25lbnQoaW5mbzoge1xuICBjb21wb25lbnQ6IFR5cGU8YW55PjsgcHJvcGFnYXRlRGlnZXN0PzogYm9vbGVhbjtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBpbnB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBvdXRwdXRzPzogc3RyaW5nW107XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgc2VsZWN0b3JzPzogc3RyaW5nW107XG59KTogYW55IC8qIGFuZ3VsYXIuSUluamVjdGFibGUgKi8ge1xuICBjb25zdCBkaXJlY3RpdmVGYWN0b3J5OlxuICAgICAgYW5ndWxhci5JQW5ub3RhdGVkRnVuY3Rpb24gPSBmdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHBhcnNlOiBhbmd1bGFyLklQYXJzZVNlcnZpY2UpOiBhbmd1bGFyLklEaXJlY3RpdmUge1xuICAgIC8vIFdoZW4gdXNpbmcgYFVwZ3JhZGVNb2R1bGVgLCB3ZSBkb24ndCBuZWVkIHRvIGVuc3VyZSBjYWxsYmFja3MgdG8gQW5ndWxhciBBUElzIChlLmcuIGNoYW5nZVxuICAgIC8vIGRldGVjdGlvbikgYXJlIHJ1biBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZSwgYmVjYXVzZSBgJGRpZ2VzdCgpYCB3aWxsIGJlIHJ1biBpbnNpZGUgdGhlIHpvbmVcbiAgICAvLyAoZXhjZXB0IGlmIGV4cGxpY2l0bHkgZXNjYXBlZCwgaW4gd2hpY2ggY2FzZSB3ZSBzaG91bGRuJ3QgZm9yY2UgaXQgYmFjayBpbikuXG4gICAgLy8gV2hlbiB1c2luZyBgZG93bmdyYWRlTW9kdWxlKClgIHRob3VnaCwgd2UgbmVlZCB0byBlbnN1cmUgc3VjaCBjYWxsYmFja3MgYXJlIHJ1biBpbnNpZGUgdGhlXG4gICAgLy8gQW5ndWxhciB6b25lLlxuICAgIGxldCBuZWVkc05nWm9uZSA9IGZhbHNlO1xuICAgIGxldCB3cmFwQ2FsbGJhY2sgPSA8VD4oY2I6ICgpID0+IFQpID0+IGNiO1xuICAgIGxldCBuZ1pvbmU6IE5nWm9uZTtcblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgdGVybWluYWw6IHRydWUsXG4gICAgICByZXF1aXJlOiBbUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTF0sXG4gICAgICBsaW5rOiAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgIHJlcXVpcmVkOiBhbnlbXSkgPT4ge1xuICAgICAgICAvLyBXZSBtaWdodCBoYXZlIHRvIGNvbXBpbGUgdGhlIGNvbnRlbnRzIGFzeW5jaHJvbm91c2x5LCBiZWNhdXNlIHRoaXMgbWlnaHQgaGF2ZSBiZWVuXG4gICAgICAgIC8vIHRyaWdnZXJlZCBieSBgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyYCwgYmVmb3JlIHRoZSBBbmd1bGFyIHRlbXBsYXRlcyBoYXZlXG4gICAgICAgIC8vIGJlZW4gY29tcGlsZWQuXG5cbiAgICAgICAgY29uc3QgbmdNb2RlbDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIgPSByZXF1aXJlZFsxXTtcbiAgICAgICAgbGV0IHBhcmVudEluamVjdG9yOiBJbmplY3RvcnxUaGVuYWJsZTxJbmplY3Rvcj58dW5kZWZpbmVkID0gcmVxdWlyZWRbMF07XG4gICAgICAgIGxldCByYW5Bc3luYyA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghcGFyZW50SW5qZWN0b3IpIHtcbiAgICAgICAgICBjb25zdCBsYXp5TW9kdWxlUmVmID0gJGluamVjdG9yLmdldChMQVpZX01PRFVMRV9SRUYpIGFzIExhenlNb2R1bGVSZWY7XG4gICAgICAgICAgbmVlZHNOZ1pvbmUgPSBsYXp5TW9kdWxlUmVmLm5lZWRzTmdab25lO1xuICAgICAgICAgIHBhcmVudEluamVjdG9yID0gbGF6eU1vZHVsZVJlZi5pbmplY3RvciB8fCBsYXp5TW9kdWxlUmVmLnByb21pc2UgYXMgUHJvbWlzZTxJbmplY3Rvcj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkb0Rvd25ncmFkZSA9IChpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciA9XG4gICAgICAgICAgICAgIGluamVjdG9yLmdldChDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55PiA9XG4gICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShpbmZvLmNvbXBvbmVudCkgITtcblxuICAgICAgICAgIGlmICghY29tcG9uZW50RmFjdG9yeSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RpbmcgQ29tcG9uZW50RmFjdG9yeSBmb3I6ICcgKyBnZXRDb21wb25lbnROYW1lKGluZm8uY29tcG9uZW50KSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaW5qZWN0b3JQcm9taXNlID0gbmV3IFBhcmVudEluamVjdG9yUHJvbWlzZShlbGVtZW50KTtcbiAgICAgICAgICBjb25zdCBmYWNhZGUgPSBuZXcgRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcihcbiAgICAgICAgICAgICAgZWxlbWVudCwgYXR0cnMsIHNjb3BlLCBuZ01vZGVsLCBpbmplY3RvciwgJGluamVjdG9yLCAkY29tcGlsZSwgJHBhcnNlLFxuICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5LCB3cmFwQ2FsbGJhY2spO1xuXG4gICAgICAgICAgY29uc3QgcHJvamVjdGFibGVOb2RlcyA9IGZhY2FkZS5jb21waWxlQ29udGVudHMoKTtcbiAgICAgICAgICBmYWNhZGUuY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXMpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cElucHV0cyhuZWVkc05nWm9uZSwgaW5mby5wcm9wYWdhdGVEaWdlc3QpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cE91dHB1dHMoKTtcbiAgICAgICAgICBmYWNhZGUucmVnaXN0ZXJDbGVhbnVwKCk7XG5cbiAgICAgICAgICBpbmplY3RvclByb21pc2UucmVzb2x2ZShmYWNhZGUuZ2V0SW5qZWN0b3IoKSk7XG5cbiAgICAgICAgICBpZiAocmFuQXN5bmMpIHtcbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgcnVuIGFzeW5jLCBpdCBpcyBwb3NzaWJsZSB0aGF0IGl0IGlzIG5vdCBydW4gaW5zaWRlIGFcbiAgICAgICAgICAgIC8vIGRpZ2VzdCBhbmQgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgd2lsbCBub3QgYmUgZGV0ZWN0ZWQuXG4gICAgICAgICAgICBzY29wZS4kZXZhbEFzeW5jKCgpID0+IHt9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZG93bmdyYWRlRm4gPSAhbmVlZHNOZ1pvbmUgPyBkb0Rvd25ncmFkZSA6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICBpZiAoIW5nWm9uZSkge1xuICAgICAgICAgICAgbmdab25lID0gaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgICAgICB3cmFwQ2FsbGJhY2sgPSA8VD4oY2I6ICgpID0+IFQpID0+ICgpID0+XG4gICAgICAgICAgICAgICAgTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpID8gY2IoKSA6IG5nWm9uZS5ydW4oY2IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdyYXBDYWxsYmFjaygoKSA9PiBkb0Rvd25ncmFkZShpbmplY3RvcikpKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGlzVGhlbmFibGU8SW5qZWN0b3I+KHBhcmVudEluamVjdG9yKSkge1xuICAgICAgICAgIHBhcmVudEluamVjdG9yLnRoZW4oZG93bmdyYWRlRm4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvd25ncmFkZUZuKHBhcmVudEluamVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJhbkFzeW5jID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIGJyYWNrZXQtbm90YXRpb24gYmVjYXVzZSBvZiBjbG9zdXJlIC0gc2VlICMxNDQ0MVxuICBkaXJlY3RpdmVGYWN0b3J5WyckaW5qZWN0J10gPSBbJENPTVBJTEUsICRJTkpFQ1RPUiwgJFBBUlNFXTtcbiAgcmV0dXJuIGRpcmVjdGl2ZUZhY3Rvcnk7XG59XG5cbi8qKlxuICogU3luY2hyb25vdXMgcHJvbWlzZS1saWtlIG9iamVjdCB0byB3cmFwIHBhcmVudCBpbmplY3RvcnMsXG4gKiB0byBwcmVzZXJ2ZSB0aGUgc3luY2hyb25vdXMgbmF0dXJlIG9mIEFuZ3VsYXIgMSdzICRjb21waWxlLlxuICovXG5jbGFzcyBQYXJlbnRJbmplY3RvclByb21pc2Uge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBpbmplY3RvciAhOiBJbmplY3RvcjtcbiAgcHJpdmF0ZSBpbmplY3RvcktleTogc3RyaW5nID0gY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpO1xuICBwcml2YXRlIGNhbGxiYWNrczogKChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSlbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgLy8gU3RvcmUgdGhlIHByb21pc2Ugb24gdGhlIGVsZW1lbnQuXG4gICAgZWxlbWVudC5kYXRhICEodGhpcy5pbmplY3RvcktleSwgdGhpcyk7XG4gIH1cblxuICB0aGVuKGNhbGxiYWNrOiAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbmplY3Rvcikge1xuICAgICAgY2FsbGJhY2sodGhpcy5pbmplY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmUoaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5pbmplY3RvciA9IGluamVjdG9yO1xuXG4gICAgLy8gU3RvcmUgdGhlIHJlYWwgaW5qZWN0b3Igb24gdGhlIGVsZW1lbnQuXG4gICAgdGhpcy5lbGVtZW50LmRhdGEgISh0aGlzLmluamVjdG9yS2V5LCBpbmplY3Rvcik7XG5cbiAgICAvLyBSZWxlYXNlIHRoZSBlbGVtZW50IHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLlxuICAgIHRoaXMuZWxlbWVudCA9IG51bGwgITtcblxuICAgIC8vIFJ1biB0aGUgcXVldWVkIGNhbGxiYWNrcy5cbiAgICB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKGluamVjdG9yKSk7XG4gICAgdGhpcy5jYWxsYmFja3MubGVuZ3RoID0gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1RoZW5hYmxlPFQ+KG9iajogb2JqZWN0KTogb2JqIGlzIFRoZW5hYmxlPFQ+IHtcbiAgcmV0dXJuIGlzRnVuY3Rpb24oKG9iaiBhcyBhbnkpLnRoZW4pO1xufVxuIl19