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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBbUIsd0JBQXdCLEVBQVksTUFBTSxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBR2pHLE9BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzNILE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBZ0IsYUFBYSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4Q2xGLE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxJQVVsQzs7SUFDQyxNQUFNLGdCQUFnQixHQUNXLFVBQ0ksUUFBaUMsRUFDakMsU0FBbUMsRUFDbkMsTUFBNkI7O1FBTWhFLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQzs7UUFDeEIsSUFBSSxZQUFZLEdBQUcsQ0FBSSxFQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7UUFDMUMsSUFBSSxNQUFNLENBQVM7UUFFbkIsT0FBTztZQUNMLFFBQVEsRUFBRSxHQUFHO1lBQ2IsUUFBUSxFQUFFLElBQUk7WUFDZCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQztZQUM3QyxJQUFJLEVBQUUsQ0FBQyxLQUFxQixFQUFFLE9BQWlDLEVBQUUsS0FBMEIsRUFDcEYsUUFBZSxFQUFFLEVBQUU7O2dCQUt4QixNQUFNLE9BQU8sR0FBK0IsUUFB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QUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM1RCxPQUFPLGdCQUFnQixDQUFDO0NBQ3pCOzs7OztBQU1ELE1BQU0scUJBQXFCOzs7O0lBTXpCLFlBQW9CLE9BQWlDO1FBQWpDLFlBQU8sR0FBUCxPQUFPLENBQTBCOzJCQUh2QixhQUFhLENBQUMsWUFBWSxDQUFDO3lCQUNKLEVBQUU7OztRQUlyRCxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSTtLQUN0Qzs7Ozs7SUFFRCxJQUFJLENBQUMsUUFBcUM7UUFDeEMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekI7YUFBTTtZQUNMLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO0tBQ0Y7Ozs7O0lBRUQsT0FBTyxDQUFDLFFBQWtCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOzs7UUFHekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxRQUFROztRQUc5QyxJQUFJLENBQUMsT0FBTyxzQkFBRyxJQUFJLEVBQUUsQ0FBQzs7UUFHdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7S0FDM0I7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7OztBQUVELFNBQVMsVUFBVSxDQUFJLEdBQVc7SUFDaEMsT0FBTyxVQUFVLENBQUMsbUJBQUMsR0FBVSxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDdEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBJbmplY3RvciwgTmdab25lLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7JENPTVBJTEUsICRJTkpFQ1RPUiwgJFBBUlNFLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyfSBmcm9tICcuL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlcic7XG5pbXBvcnQge0xhenlNb2R1bGVSZWYsIGNvbnRyb2xsZXJLZXksIGdldENvbXBvbmVudE5hbWUsIGlzRnVuY3Rpb259IGZyb20gJy4vdXRpbCc7XG5cblxuaW50ZXJmYWNlIFRoZW5hYmxlPFQ+IHtcbiAgdGhlbihjYWxsYmFjazogKHZhbHVlOiBUKSA9PiBhbnkpOiBhbnk7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdGhhdCBhbGxvd3MgYW4gQW5ndWxhciBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXJKUy5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGlzIGhlbHBlciBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0byBiZSB1c2VkIGZvciByZWdpc3RlcmluZ1xuICogYW4gQW5ndWxhckpTIHdyYXBwZXIgZGlyZWN0aXZlIGZvciBcImRvd25ncmFkaW5nXCIgYW4gQW5ndWxhciBjb21wb25lbnQuXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogTGV0J3MgYXNzdW1lIHRoYXQgeW91IGhhdmUgYW4gQW5ndWxhciBjb21wb25lbnQgY2FsbGVkIGBuZzJIZXJvZXNgIHRoYXQgbmVlZHNcbiAqIHRvIGJlIG1hZGUgYXZhaWxhYmxlIGluIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXNcIn1cbiAqXG4gKiBXZSBtdXN0IGNyZWF0ZSBhbiBBbmd1bGFySlMgW2RpcmVjdGl2ZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvZ3VpZGUvZGlyZWN0aXZlKVxuICogdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFyIGNvbXBvbmVudCBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMuXG4gKiBUaGUgYGRvd25ncmFkZUNvbXBvbmVudCgpYCBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IHdlXG4gKiBjYW4gdXNlIHRvIGRlZmluZSB0aGUgQW5ndWxhckpTIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIHRoZSBcImRvd25ncmFkZWRcIiBjb21wb25lbnQuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXMtd3JhcHBlclwifVxuICpcbiAqIEBwYXJhbSBpbmZvIGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBDb21wb25lbnQgdGhhdCBpcyBiZWluZyBkb3duZ3JhZGVkOlxuICpcbiAqICogYGNvbXBvbmVudDogVHlwZTxhbnk+YDogVGhlIHR5cGUgb2YgdGhlIENvbXBvbmVudCB0aGF0IHdpbGwgYmUgZG93bmdyYWRlZFxuICogKiBgcHJvcGFnYXRlRGlnZXN0PzogYm9vbGVhbmA6IFdoZXRoZXIgdG8gcGVyZm9ybSB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JSZWYjZGV0ZWN0Q2hhbmdlc1xuICogICBjaGFuZ2UgZGV0ZWN0aW9ufSBvbiB0aGUgY29tcG9uZW50IG9uIGV2ZXJ5XG4gKiAgIFskZGlnZXN0XShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlIyRkaWdlc3QpLiBJZiBzZXQgdG8gYGZhbHNlYCxcbiAqICAgY2hhbmdlIGRldGVjdGlvbiB3aWxsIHN0aWxsIGJlIHBlcmZvcm1lZCB3aGVuIGFueSBvZiB0aGUgY29tcG9uZW50J3MgaW5wdXRzIGNoYW5nZXMuXG4gKiAgIChEZWZhdWx0OiB0cnVlKVxuICpcbiAqIEByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgaW4gYW5cbiAqIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICogQGV4cGVyaW1lbnRhbFxuICovXG5leHBvcnQgZnVuY3Rpb24gZG93bmdyYWRlQ29tcG9uZW50KGluZm86IHtcbiAgY29tcG9uZW50OiBUeXBlPGFueT47XG4gIC8qKiBAZXhwZXJpbWVudGFsICovXG4gIHByb3BhZ2F0ZURpZ2VzdD86IGJvb2xlYW47XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgaW5wdXRzPzogc3RyaW5nW107XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgb3V0cHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIHNlbGVjdG9ycz86IHN0cmluZ1tdO1xufSk6IGFueSAvKiBhbmd1bGFyLklJbmplY3RhYmxlICovIHtcbiAgY29uc3QgZGlyZWN0aXZlRmFjdG9yeTpcbiAgICAgIGFuZ3VsYXIuSUFubm90YXRlZEZ1bmN0aW9uID0gZnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRwYXJzZTogYW5ndWxhci5JUGFyc2VTZXJ2aWNlKTogYW5ndWxhci5JRGlyZWN0aXZlIHtcbiAgICAvLyBXaGVuIHVzaW5nIGBVcGdyYWRlTW9kdWxlYCwgd2UgZG9uJ3QgbmVlZCB0byBlbnN1cmUgY2FsbGJhY2tzIHRvIEFuZ3VsYXIgQVBJcyAoZS5nLiBjaGFuZ2VcbiAgICAvLyBkZXRlY3Rpb24pIGFyZSBydW4gaW5zaWRlIHRoZSBBbmd1bGFyIHpvbmUsIGJlY2F1c2UgYCRkaWdlc3QoKWAgd2lsbCBiZSBydW4gaW5zaWRlIHRoZSB6b25lXG4gICAgLy8gKGV4Y2VwdCBpZiBleHBsaWNpdGx5IGVzY2FwZWQsIGluIHdoaWNoIGNhc2Ugd2Ugc2hvdWxkbid0IGZvcmNlIGl0IGJhY2sgaW4pLlxuICAgIC8vIFdoZW4gdXNpbmcgYGRvd25ncmFkZU1vZHVsZSgpYCB0aG91Z2gsIHdlIG5lZWQgdG8gZW5zdXJlIHN1Y2ggY2FsbGJhY2tzIGFyZSBydW4gaW5zaWRlIHRoZVxuICAgIC8vIEFuZ3VsYXIgem9uZS5cbiAgICBsZXQgbmVlZHNOZ1pvbmUgPSBmYWxzZTtcbiAgICBsZXQgd3JhcENhbGxiYWNrID0gPFQ+KGNiOiAoKSA9PiBUKSA9PiBjYjtcbiAgICBsZXQgbmdab25lOiBOZ1pvbmU7XG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgICAgcmVxdWlyZTogW1JFUVVJUkVfSU5KRUNUT1IsIFJFUVVJUkVfTkdfTU9ERUxdLFxuICAgICAgbGluazogKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyxcbiAgICAgICAgICAgICByZXF1aXJlZDogYW55W10pID0+IHtcbiAgICAgICAgLy8gV2UgbWlnaHQgaGF2ZSB0byBjb21waWxlIHRoZSBjb250ZW50cyBhc3luY2hyb25vdXNseSwgYmVjYXVzZSB0aGlzIG1pZ2h0IGhhdmUgYmVlblxuICAgICAgICAvLyB0cmlnZ2VyZWQgYnkgYFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcmAsIGJlZm9yZSB0aGUgQW5ndWxhciB0ZW1wbGF0ZXMgaGF2ZVxuICAgICAgICAvLyBiZWVuIGNvbXBpbGVkLlxuXG4gICAgICAgIGNvbnN0IG5nTW9kZWw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyID0gcmVxdWlyZWRbMV07XG4gICAgICAgIGxldCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3J8VGhlbmFibGU8SW5qZWN0b3I+fHVuZGVmaW5lZCA9IHJlcXVpcmVkWzBdO1xuICAgICAgICBsZXQgcmFuQXN5bmMgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIXBhcmVudEluamVjdG9yKSB7XG4gICAgICAgICAgY29uc3QgbGF6eU1vZHVsZVJlZiA9ICRpbmplY3Rvci5nZXQoTEFaWV9NT0RVTEVfUkVGKSBhcyBMYXp5TW9kdWxlUmVmO1xuICAgICAgICAgIG5lZWRzTmdab25lID0gbGF6eU1vZHVsZVJlZi5uZWVkc05nWm9uZTtcbiAgICAgICAgICBwYXJlbnRJbmplY3RvciA9IGxhenlNb2R1bGVSZWYuaW5qZWN0b3IgfHwgbGF6eU1vZHVsZVJlZi5wcm9taXNlIGFzIFByb21pc2U8SW5qZWN0b3I+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZG9Eb3duZ3JhZGUgPSAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgPVxuICAgICAgICAgICAgICBpbmplY3Rvci5nZXQoQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4gPVxuICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoaW5mby5jb21wb25lbnQpICE7XG5cbiAgICAgICAgICBpZiAoIWNvbXBvbmVudEZhY3RvcnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0aW5nIENvbXBvbmVudEZhY3RvcnkgZm9yOiAnICsgZ2V0Q29tcG9uZW50TmFtZShpbmZvLmNvbXBvbmVudCkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGluamVjdG9yUHJvbWlzZSA9IG5ldyBQYXJlbnRJbmplY3RvclByb21pc2UoZWxlbWVudCk7XG4gICAgICAgICAgY29uc3QgZmFjYWRlID0gbmV3IERvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXIoXG4gICAgICAgICAgICAgIGVsZW1lbnQsIGF0dHJzLCBzY29wZSwgbmdNb2RlbCwgaW5qZWN0b3IsICRpbmplY3RvciwgJGNvbXBpbGUsICRwYXJzZSxcbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeSwgd3JhcENhbGxiYWNrKTtcblxuICAgICAgICAgIGNvbnN0IHByb2plY3RhYmxlTm9kZXMgPSBmYWNhZGUuY29tcGlsZUNvbnRlbnRzKCk7XG4gICAgICAgICAgZmFjYWRlLmNyZWF0ZUNvbXBvbmVudChwcm9qZWN0YWJsZU5vZGVzKTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBJbnB1dHMobmVlZHNOZ1pvbmUsIGluZm8ucHJvcGFnYXRlRGlnZXN0KTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBPdXRwdXRzKCk7XG4gICAgICAgICAgZmFjYWRlLnJlZ2lzdGVyQ2xlYW51cCgpO1xuXG4gICAgICAgICAgaW5qZWN0b3JQcm9taXNlLnJlc29sdmUoZmFjYWRlLmdldEluamVjdG9yKCkpO1xuXG4gICAgICAgICAgaWYgKHJhbkFzeW5jKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIHJ1biBhc3luYywgaXQgaXMgcG9zc2libGUgdGhhdCBpdCBpcyBub3QgcnVuIGluc2lkZSBhXG4gICAgICAgICAgICAvLyBkaWdlc3QgYW5kIGluaXRpYWwgaW5wdXQgdmFsdWVzIHdpbGwgbm90IGJlIGRldGVjdGVkLlxuICAgICAgICAgICAgc2NvcGUuJGV2YWxBc3luYygoKSA9PiB7fSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGRvd25ncmFkZUZuID0gIW5lZWRzTmdab25lID8gZG9Eb3duZ3JhZGUgOiAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgaWYgKCFuZ1pvbmUpIHtcbiAgICAgICAgICAgIG5nWm9uZSA9IGluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgICAgICAgd3JhcENhbGxiYWNrID0gPFQ+KGNiOiAoKSA9PiBUKSA9PiAoKSA9PlxuICAgICAgICAgICAgICAgIE5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSA/IGNiKCkgOiBuZ1pvbmUucnVuKGNiKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB3cmFwQ2FsbGJhY2soKCkgPT4gZG9Eb3duZ3JhZGUoaW5qZWN0b3IpKSgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpc1RoZW5hYmxlPEluamVjdG9yPihwYXJlbnRJbmplY3RvcikpIHtcbiAgICAgICAgICBwYXJlbnRJbmplY3Rvci50aGVuKGRvd25ncmFkZUZuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb3duZ3JhZGVGbihwYXJlbnRJbmplY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICByYW5Bc3luYyA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBicmFja2V0LW5vdGF0aW9uIGJlY2F1c2Ugb2YgY2xvc3VyZSAtIHNlZSAjMTQ0NDFcbiAgZGlyZWN0aXZlRmFjdG9yeVsnJGluamVjdCddID0gWyRDT01QSUxFLCAkSU5KRUNUT1IsICRQQVJTRV07XG4gIHJldHVybiBkaXJlY3RpdmVGYWN0b3J5O1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzIHByb21pc2UtbGlrZSBvYmplY3QgdG8gd3JhcCBwYXJlbnQgaW5qZWN0b3JzLFxuICogdG8gcHJlc2VydmUgdGhlIHN5bmNocm9ub3VzIG5hdHVyZSBvZiBBbmd1bGFyIDEncyAkY29tcGlsZS5cbiAqL1xuY2xhc3MgUGFyZW50SW5qZWN0b3JQcm9taXNlIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgaW5qZWN0b3IgITogSW5qZWN0b3I7XG4gIHByaXZhdGUgaW5qZWN0b3JLZXk6IHN0cmluZyA9IGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKTtcbiAgcHJpdmF0ZSBjYWxsYmFja3M6ICgoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgIC8vIFN0b3JlIHRoZSBwcm9taXNlIG9uIHRoZSBlbGVtZW50LlxuICAgIGVsZW1lbnQuZGF0YSAhKHRoaXMuaW5qZWN0b3JLZXksIHRoaXMpO1xuICB9XG5cbiAgdGhlbihjYWxsYmFjazogKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KSB7XG4gICAgaWYgKHRoaXMuaW5qZWN0b3IpIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMuaW5qZWN0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZXNvbHZlKGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMuaW5qZWN0b3IgPSBpbmplY3RvcjtcblxuICAgIC8vIFN0b3JlIHRoZSByZWFsIGluamVjdG9yIG9uIHRoZSBlbGVtZW50LlxuICAgIHRoaXMuZWxlbWVudC5kYXRhICEodGhpcy5pbmplY3RvcktleSwgaW5qZWN0b3IpO1xuXG4gICAgLy8gUmVsZWFzZSB0aGUgZWxlbWVudCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrcy5cbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsICE7XG5cbiAgICAvLyBSdW4gdGhlIHF1ZXVlZCBjYWxsYmFja3MuXG4gICAgdGhpcy5jYWxsYmFja3MuZm9yRWFjaChjYWxsYmFjayA9PiBjYWxsYmFjayhpbmplY3RvcikpO1xuICAgIHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNUaGVuYWJsZTxUPihvYmo6IG9iamVjdCk6IG9iaiBpcyBUaGVuYWJsZTxUPiB7XG4gIHJldHVybiBpc0Z1bmN0aW9uKChvYmogYXMgYW55KS50aGVuKTtcbn1cbiJdfQ==