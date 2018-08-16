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
 * \@experimental
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBbUIsd0JBQXdCLEVBQVksTUFBTSxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBR2pHLE9BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzNILE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBZ0IsYUFBYSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4Q2xGLE1BQU0sNkJBQTZCLElBVWxDOztJQUNDLE1BQU0sZ0JBQWdCLEdBQ1csVUFDSSxRQUFpQyxFQUNqQyxTQUFtQyxFQUNuQyxNQUE2Qjs7UUFNaEUsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDOztRQUN4QixJQUFJLFlBQVksR0FBRyxDQUFJLEVBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDOztRQUMxQyxJQUFJLE1BQU0sQ0FBUztRQUVuQixPQUFPO1lBQ0wsUUFBUSxFQUFFLEdBQUc7WUFDYixRQUFRLEVBQUUsSUFBSTtZQUNkLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDO1lBQzdDLElBQUksRUFBRSxDQUFDLEtBQXFCLEVBQUUsT0FBaUMsRUFBRSxLQUEwQixFQUNwRixRQUFlLEVBQUUsRUFBRTs7Z0JBS3hCLE1BQU0sT0FBTyxHQUErQixRQUFRLENBQUMsQ0FB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QUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzVELE9BQU8sZ0JBQWdCLENBQUM7Q0FDekI7Ozs7O0FBTUQ7Ozs7SUFNRSxZQUFvQixPQUFpQztRQUFqQyxZQUFPLEdBQVAsT0FBTyxDQUEwQjsyQkFIdkIsYUFBYSxDQUFDLFlBQVksQ0FBQzt5QkFDSixFQUFFOzs7UUFJckQsT0FBTyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUk7S0FDdEM7Ozs7O0lBRUQsSUFBSSxDQUFDLFFBQXFDO1FBQ3hDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3pCO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMvQjtLQUNGOzs7OztJQUVELE9BQU8sQ0FBQyxRQUFrQjtRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzs7O1FBR3pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUTs7UUFHOUMsSUFBSSxDQUFDLE9BQU8sc0JBQUcsSUFBSSxFQUFFLENBQUM7O1FBR3RCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQzNCO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxvQkFBdUIsR0FBVztJQUNoQyxPQUFPLFVBQVUsQ0FBQyxtQkFBQyxHQUFVLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN0QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yLCBOZ1pvbmUsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0UsIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0Rvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXJ9IGZyb20gJy4vZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgY29udHJvbGxlcktleSwgZ2V0Q29tcG9uZW50TmFtZSwgaXNGdW5jdGlvbn0gZnJvbSAnLi91dGlsJztcblxuXG5pbnRlcmZhY2UgVGhlbmFibGU8VD4ge1xuICB0aGVuKGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IGFueSk6IGFueTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IGFsbG93cyBhbiBBbmd1bGFyIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQW9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRvIGJlIHVzZWQgZm9yIHJlZ2lzdGVyaW5nXG4gKiBhbiBBbmd1bGFySlMgd3JhcHBlciBkaXJlY3RpdmUgZm9yIFwiZG93bmdyYWRpbmdcIiBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBMZXQncyBhc3N1bWUgdGhhdCB5b3UgaGF2ZSBhbiBBbmd1bGFyIGNvbXBvbmVudCBjYWxsZWQgYG5nMkhlcm9lc2AgdGhhdCBuZWVkc1xuICogdG8gYmUgbWFkZSBhdmFpbGFibGUgaW4gQW5ndWxhckpTIHRlbXBsYXRlcy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lc1wifVxuICpcbiAqIFdlIG11c3QgY3JlYXRlIGFuIEFuZ3VsYXJKUyBbZGlyZWN0aXZlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9ndWlkZS9kaXJlY3RpdmUpXG4gKiB0aGF0IHdpbGwgbWFrZSB0aGlzIEFuZ3VsYXIgY29tcG9uZW50IGF2YWlsYWJsZSBpbnNpZGUgQW5ndWxhckpTIHRlbXBsYXRlcy5cbiAqIFRoZSBgZG93bmdyYWRlQ29tcG9uZW50KClgIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgd2VcbiAqIGNhbiB1c2UgdG8gZGVmaW5lIHRoZSBBbmd1bGFySlMgZGlyZWN0aXZlIHRoYXQgd3JhcHMgdGhlIFwiZG93bmdyYWRlZFwiIGNvbXBvbmVudC5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lcy13cmFwcGVyXCJ9XG4gKlxuICogQHBhcmFtIGluZm8gY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIENvbXBvbmVudCB0aGF0IGlzIGJlaW5nIGRvd25ncmFkZWQ6XG4gKlxuICogKiBgY29tcG9uZW50OiBUeXBlPGFueT5gOiBUaGUgdHlwZSBvZiB0aGUgQ29tcG9uZW50IHRoYXQgd2lsbCBiZSBkb3duZ3JhZGVkXG4gKiAqIGBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuYDogV2hldGhlciB0byBwZXJmb3JtIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRlY3RDaGFuZ2VzXG4gKiAgIGNoYW5nZSBkZXRlY3Rpb259IG9uIHRoZSBjb21wb25lbnQgb24gZXZlcnlcbiAqICAgWyRkaWdlc3RdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy90eXBlLyRyb290U2NvcGUuU2NvcGUjJGRpZ2VzdCkuIElmIHNldCB0byBgZmFsc2VgLFxuICogICBjaGFuZ2UgZGV0ZWN0aW9uIHdpbGwgc3RpbGwgYmUgcGVyZm9ybWVkIHdoZW4gYW55IG9mIHRoZSBjb21wb25lbnQncyBpbnB1dHMgY2hhbmdlcy5cbiAqICAgKERlZmF1bHQ6IHRydWUpXG4gKlxuICogQHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBpbiBhblxuICogQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVDb21wb25lbnQoaW5mbzoge1xuICBjb21wb25lbnQ6IFR5cGU8YW55PjtcbiAgLyoqIEBleHBlcmltZW50YWwgKi9cbiAgcHJvcGFnYXRlRGlnZXN0PzogYm9vbGVhbjtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBpbnB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBvdXRwdXRzPzogc3RyaW5nW107XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgc2VsZWN0b3JzPzogc3RyaW5nW107XG59KTogYW55IC8qIGFuZ3VsYXIuSUluamVjdGFibGUgKi8ge1xuICBjb25zdCBkaXJlY3RpdmVGYWN0b3J5OlxuICAgICAgYW5ndWxhci5JQW5ub3RhdGVkRnVuY3Rpb24gPSBmdW5jdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHBhcnNlOiBhbmd1bGFyLklQYXJzZVNlcnZpY2UpOiBhbmd1bGFyLklEaXJlY3RpdmUge1xuICAgIC8vIFdoZW4gdXNpbmcgYFVwZ3JhZGVNb2R1bGVgLCB3ZSBkb24ndCBuZWVkIHRvIGVuc3VyZSBjYWxsYmFja3MgdG8gQW5ndWxhciBBUElzIChlLmcuIGNoYW5nZVxuICAgIC8vIGRldGVjdGlvbikgYXJlIHJ1biBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZSwgYmVjYXVzZSBgJGRpZ2VzdCgpYCB3aWxsIGJlIHJ1biBpbnNpZGUgdGhlIHpvbmVcbiAgICAvLyAoZXhjZXB0IGlmIGV4cGxpY2l0bHkgZXNjYXBlZCwgaW4gd2hpY2ggY2FzZSB3ZSBzaG91bGRuJ3QgZm9yY2UgaXQgYmFjayBpbikuXG4gICAgLy8gV2hlbiB1c2luZyBgZG93bmdyYWRlTW9kdWxlKClgIHRob3VnaCwgd2UgbmVlZCB0byBlbnN1cmUgc3VjaCBjYWxsYmFja3MgYXJlIHJ1biBpbnNpZGUgdGhlXG4gICAgLy8gQW5ndWxhciB6b25lLlxuICAgIGxldCBuZWVkc05nWm9uZSA9IGZhbHNlO1xuICAgIGxldCB3cmFwQ2FsbGJhY2sgPSA8VD4oY2I6ICgpID0+IFQpID0+IGNiO1xuICAgIGxldCBuZ1pvbmU6IE5nWm9uZTtcblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgdGVybWluYWw6IHRydWUsXG4gICAgICByZXF1aXJlOiBbUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTF0sXG4gICAgICBsaW5rOiAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgIHJlcXVpcmVkOiBhbnlbXSkgPT4ge1xuICAgICAgICAvLyBXZSBtaWdodCBoYXZlIHRvIGNvbXBpbGUgdGhlIGNvbnRlbnRzIGFzeW5jaHJvbm91c2x5LCBiZWNhdXNlIHRoaXMgbWlnaHQgaGF2ZSBiZWVuXG4gICAgICAgIC8vIHRyaWdnZXJlZCBieSBgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyYCwgYmVmb3JlIHRoZSBBbmd1bGFyIHRlbXBsYXRlcyBoYXZlXG4gICAgICAgIC8vIGJlZW4gY29tcGlsZWQuXG5cbiAgICAgICAgY29uc3QgbmdNb2RlbDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIgPSByZXF1aXJlZFsxXTtcbiAgICAgICAgbGV0IHBhcmVudEluamVjdG9yOiBJbmplY3RvcnxUaGVuYWJsZTxJbmplY3Rvcj58dW5kZWZpbmVkID0gcmVxdWlyZWRbMF07XG4gICAgICAgIGxldCByYW5Bc3luYyA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghcGFyZW50SW5qZWN0b3IpIHtcbiAgICAgICAgICBjb25zdCBsYXp5TW9kdWxlUmVmID0gJGluamVjdG9yLmdldChMQVpZX01PRFVMRV9SRUYpIGFzIExhenlNb2R1bGVSZWY7XG4gICAgICAgICAgbmVlZHNOZ1pvbmUgPSBsYXp5TW9kdWxlUmVmLm5lZWRzTmdab25lO1xuICAgICAgICAgIHBhcmVudEluamVjdG9yID0gbGF6eU1vZHVsZVJlZi5pbmplY3RvciB8fCBsYXp5TW9kdWxlUmVmLnByb21pc2UgYXMgUHJvbWlzZTxJbmplY3Rvcj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkb0Rvd25ncmFkZSA9IChpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciA9XG4gICAgICAgICAgICAgIGluamVjdG9yLmdldChDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55PiA9XG4gICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShpbmZvLmNvbXBvbmVudCkgITtcblxuICAgICAgICAgIGlmICghY29tcG9uZW50RmFjdG9yeSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RpbmcgQ29tcG9uZW50RmFjdG9yeSBmb3I6ICcgKyBnZXRDb21wb25lbnROYW1lKGluZm8uY29tcG9uZW50KSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaW5qZWN0b3JQcm9taXNlID0gbmV3IFBhcmVudEluamVjdG9yUHJvbWlzZShlbGVtZW50KTtcbiAgICAgICAgICBjb25zdCBmYWNhZGUgPSBuZXcgRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcihcbiAgICAgICAgICAgICAgZWxlbWVudCwgYXR0cnMsIHNjb3BlLCBuZ01vZGVsLCBpbmplY3RvciwgJGluamVjdG9yLCAkY29tcGlsZSwgJHBhcnNlLFxuICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5LCB3cmFwQ2FsbGJhY2spO1xuXG4gICAgICAgICAgY29uc3QgcHJvamVjdGFibGVOb2RlcyA9IGZhY2FkZS5jb21waWxlQ29udGVudHMoKTtcbiAgICAgICAgICBmYWNhZGUuY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXMpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cElucHV0cyhuZWVkc05nWm9uZSwgaW5mby5wcm9wYWdhdGVEaWdlc3QpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cE91dHB1dHMoKTtcbiAgICAgICAgICBmYWNhZGUucmVnaXN0ZXJDbGVhbnVwKCk7XG5cbiAgICAgICAgICBpbmplY3RvclByb21pc2UucmVzb2x2ZShmYWNhZGUuZ2V0SW5qZWN0b3IoKSk7XG5cbiAgICAgICAgICBpZiAocmFuQXN5bmMpIHtcbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgcnVuIGFzeW5jLCBpdCBpcyBwb3NzaWJsZSB0aGF0IGl0IGlzIG5vdCBydW4gaW5zaWRlIGFcbiAgICAgICAgICAgIC8vIGRpZ2VzdCBhbmQgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgd2lsbCBub3QgYmUgZGV0ZWN0ZWQuXG4gICAgICAgICAgICBzY29wZS4kZXZhbEFzeW5jKCgpID0+IHt9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZG93bmdyYWRlRm4gPSAhbmVlZHNOZ1pvbmUgPyBkb0Rvd25ncmFkZSA6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICBpZiAoIW5nWm9uZSkge1xuICAgICAgICAgICAgbmdab25lID0gaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgICAgICB3cmFwQ2FsbGJhY2sgPSA8VD4oY2I6ICgpID0+IFQpID0+ICgpID0+XG4gICAgICAgICAgICAgICAgTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpID8gY2IoKSA6IG5nWm9uZS5ydW4oY2IpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHdyYXBDYWxsYmFjaygoKSA9PiBkb0Rvd25ncmFkZShpbmplY3RvcikpKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGlzVGhlbmFibGU8SW5qZWN0b3I+KHBhcmVudEluamVjdG9yKSkge1xuICAgICAgICAgIHBhcmVudEluamVjdG9yLnRoZW4oZG93bmdyYWRlRm4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvd25ncmFkZUZuKHBhcmVudEluamVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJhbkFzeW5jID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIGJyYWNrZXQtbm90YXRpb24gYmVjYXVzZSBvZiBjbG9zdXJlIC0gc2VlICMxNDQ0MVxuICBkaXJlY3RpdmVGYWN0b3J5WyckaW5qZWN0J10gPSBbJENPTVBJTEUsICRJTkpFQ1RPUiwgJFBBUlNFXTtcbiAgcmV0dXJuIGRpcmVjdGl2ZUZhY3Rvcnk7XG59XG5cbi8qKlxuICogU3luY2hyb25vdXMgcHJvbWlzZS1saWtlIG9iamVjdCB0byB3cmFwIHBhcmVudCBpbmplY3RvcnMsXG4gKiB0byBwcmVzZXJ2ZSB0aGUgc3luY2hyb25vdXMgbmF0dXJlIG9mIEFuZ3VsYXIgMSdzICRjb21waWxlLlxuICovXG5jbGFzcyBQYXJlbnRJbmplY3RvclByb21pc2Uge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBpbmplY3RvciAhOiBJbmplY3RvcjtcbiAgcHJpdmF0ZSBpbmplY3RvcktleTogc3RyaW5nID0gY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpO1xuICBwcml2YXRlIGNhbGxiYWNrczogKChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSlbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgLy8gU3RvcmUgdGhlIHByb21pc2Ugb24gdGhlIGVsZW1lbnQuXG4gICAgZWxlbWVudC5kYXRhICEodGhpcy5pbmplY3RvcktleSwgdGhpcyk7XG4gIH1cblxuICB0aGVuKGNhbGxiYWNrOiAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbmplY3Rvcikge1xuICAgICAgY2FsbGJhY2sodGhpcy5pbmplY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmUoaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5pbmplY3RvciA9IGluamVjdG9yO1xuXG4gICAgLy8gU3RvcmUgdGhlIHJlYWwgaW5qZWN0b3Igb24gdGhlIGVsZW1lbnQuXG4gICAgdGhpcy5lbGVtZW50LmRhdGEgISh0aGlzLmluamVjdG9yS2V5LCBpbmplY3Rvcik7XG5cbiAgICAvLyBSZWxlYXNlIHRoZSBlbGVtZW50IHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLlxuICAgIHRoaXMuZWxlbWVudCA9IG51bGwgITtcblxuICAgIC8vIFJ1biB0aGUgcXVldWVkIGNhbGxiYWNrcy5cbiAgICB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKGluamVjdG9yKSk7XG4gICAgdGhpcy5jYWxsYmFja3MubGVuZ3RoID0gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1RoZW5hYmxlPFQ+KG9iajogb2JqZWN0KTogb2JqIGlzIFRoZW5hYmxlPFQ+IHtcbiAgcmV0dXJuIGlzRnVuY3Rpb24oKG9iaiBhcyBhbnkpLnRoZW4pO1xufVxuIl19