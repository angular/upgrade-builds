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
import { ComponentFactoryResolver, NgZone } from '@angular/core';
import { $COMPILE, $INJECTOR, $PARSE, INJECTOR_KEY, LAZY_MODULE_REF, REQUIRE_INJECTOR, REQUIRE_NG_MODEL } from './constants';
import { DowngradeComponentAdapter } from './downgrade_component_adapter';
import { controllerKey, getDowngradedModuleCount, getTypeName, getUpgradeAppType, isFunction, validateInjectionKey } from './util';
/**
 * @record
 * @template T
 */
function Thenable() { }
if (false) {
    /**
     * @param {?} callback
     * @return {?}
     */
    Thenable.prototype.then = function (callback) { };
}
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
 * - `component: Type<any>`: The type of the Component that will be downgraded
 * - `downgradedModule?: string`: The name of the downgraded module (if any) that the component
 *   "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose
 *   corresponding Angular module will be bootstrapped, when the component needs to be instantiated.
 *   <br />
 *   (This option is only necessary when using `downgradeModule()` to downgrade more than one
 *   Angular module.)
 * - `propagateDigest?: boolean`: Whether to perform {\@link ChangeDetectorRef#detectChanges
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
        // When using `downgradeModule()`, we need to handle certain things specially. For example:
        // - We always need to attach the component view to the `ApplicationRef` for it to be
        //   dirty-checked.
        // - We need to ensure callbacks to Angular APIs (e.g. change detection) are run inside the
        //   Angular zone.
        //   NOTE: This is not needed, when using `UpgradeModule`, because `$digest()` will be run
        //         inside the Angular zone (except if explicitly escaped, in which case we shouldn't
        //         force it back in).
        /** @type {?} */
        const isNgUpgradeLite = getUpgradeAppType($injector) === 3 /* Lite */;
        /** @type {?} */
        const wrapCallback = !isNgUpgradeLite ? cb => cb : cb => () => NgZone.isInAngularZone() ? cb() : ngZone.run(cb);
        /** @type {?} */
        let ngZone;
        // When downgrading multiple modules, special handling is needed wrt injectors.
        /** @type {?} */
        const hasMultipleDowngradedModules = isNgUpgradeLite && (getDowngradedModuleCount($injector) > 1);
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: (scope, element, attrs, required) => {
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                /** @type {?} */
                const ngModel = required[1];
                /** @type {?} */
                const parentInjector = required[0];
                /** @type {?} */
                let moduleInjector = undefined;
                /** @type {?} */
                let ranAsync = false;
                if (!parentInjector || hasMultipleDowngradedModules) {
                    /** @type {?} */
                    const downgradedModule = info.downgradedModule || '';
                    /** @type {?} */
                    const lazyModuleRefKey = `${LAZY_MODULE_REF}${downgradedModule}`;
                    /** @type {?} */
                    const attemptedAction = `instantiating component '${getTypeName(info.component)}'`;
                    validateInjectionKey($injector, downgradedModule, lazyModuleRefKey, attemptedAction);
                    /** @type {?} */
                    const lazyModuleRef = (/** @type {?} */ ($injector.get(lazyModuleRefKey)));
                    moduleInjector = lazyModuleRef.injector || (/** @type {?} */ (lazyModuleRef.promise));
                }
                // Notes:
                //
                // There are two injectors: `finalModuleInjector` and `finalParentInjector` (they might be
                // the same instance, but that is irrelevant):
                // - `finalModuleInjector` is used to retrieve `ComponentFactoryResolver`, thus it must be
                //   on the same tree as the `NgModule` that declares this downgraded component.
                // - `finalParentInjector` is used for all other injection purposes.
                //   (Note that Angular knows to only traverse the component-tree part of that injector,
                //   when looking for an injectable and then switch to the module injector.)
                //
                // There are basically three cases:
                // - If there is no parent component (thus no `parentInjector`), we bootstrap the downgraded
                //   `NgModule` and use its injector as both `finalModuleInjector` and
                //   `finalParentInjector`.
                // - If there is a parent component (and thus a `parentInjector`) and we are sure that it
                //   belongs to the same `NgModule` as this downgraded component (e.g. because there is only
                //   one downgraded module, we use that `parentInjector` as both `finalModuleInjector` and
                //   `finalParentInjector`.
                // - If there is a parent component, but it may belong to a different `NgModule`, then we
                //   use the `parentInjector` as `finalParentInjector` and this downgraded component's
                //   declaring `NgModule`'s injector as `finalModuleInjector`.
                //   Note 1: If the `NgModule` is already bootstrapped, we just get its injector (we don't
                //           bootstrap again).
                //   Note 2: It is possible that (while there are multiple downgraded modules) this
                //           downgraded component and its parent component both belong to the same NgModule.
                //           In that case, we could have used the `parentInjector` as both
                //           `finalModuleInjector` and `finalParentInjector`, but (for simplicity) we are
                //           treating this case as if they belong to different `NgModule`s. That doesn't
                //           really affect anything, since `parentInjector` has `moduleInjector` as ancestor
                //           and trying to resolve `ComponentFactoryResolver` from either one will return
                //           the same instance.
                // If there is a parent component, use its injector as parent injector.
                // If this is a "top-level" Angular component, use the module injector.
                /** @type {?} */
                const finalParentInjector = parentInjector || (/** @type {?} */ (moduleInjector));
                // If this is a "top-level" Angular component or the parent component may belong to a
                // different `NgModule`, use the module injector for module-specific dependencies.
                // If there is a parent component that belongs to the same `NgModule`, use its injector.
                /** @type {?} */
                const finalModuleInjector = moduleInjector || (/** @type {?} */ (parentInjector));
                /** @type {?} */
                const doDowngrade = (injector, moduleInjector) => {
                    // Retrieve `ComponentFactoryResolver` from the injector tied to the `NgModule` this
                    // component belongs to.
                    /** @type {?} */
                    const componentFactoryResolver = moduleInjector.get(ComponentFactoryResolver);
                    /** @type {?} */
                    const componentFactory = (/** @type {?} */ (componentFactoryResolver.resolveComponentFactory(info.component)));
                    if (!componentFactory) {
                        throw new Error(`Expecting ComponentFactory for: ${getTypeName(info.component)}`);
                    }
                    /** @type {?} */
                    const injectorPromise = new ParentInjectorPromise(element);
                    /** @type {?} */
                    const facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory, wrapCallback);
                    /** @type {?} */
                    const projectableNodes = facade.compileContents();
                    facade.createComponent(projectableNodes);
                    facade.setupInputs(isNgUpgradeLite, info.propagateDigest);
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
                const downgradeFn = !isNgUpgradeLite ? doDowngrade : (pInjector, mInjector) => {
                    if (!ngZone) {
                        ngZone = pInjector.get(NgZone);
                    }
                    wrapCallback(() => doDowngrade(pInjector, mInjector))();
                };
                if (isThenable(finalParentInjector) || isThenable(finalModuleInjector)) {
                    Promise.all([finalParentInjector, finalModuleInjector])
                        .then(([pInjector, mInjector]) => downgradeFn(pInjector, mInjector));
                }
                else {
                    downgradeFn(finalParentInjector, finalModuleInjector);
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
        // Store the promise on the element.
        (/** @type {?} */ (element.data))(this.injectorKey, this);
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
        this.injector = injector;
        // Store the real injector on the element.
        (/** @type {?} */ (this.element.data))(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = (/** @type {?} */ (null));
        // Run the queued callbacks.
        this.callbacks.forEach(callback => callback(injector));
        this.callbacks.length = 0;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    ParentInjectorPromise.prototype.injector;
    /**
     * @type {?}
     * @private
     */
    ParentInjectorPromise.prototype.injectorKey;
    /**
     * @type {?}
     * @private
     */
    ParentInjectorPromise.prototype.callbacks;
    /**
     * @type {?}
     * @private
     */
    ParentInjectorPromise.prototype.element;
}
/**
 * @template T
 * @param {?} obj
 * @return {?}
 */
function isThenable(obj) {
    return isFunction(((/** @type {?} */ (obj))).then);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBbUIsd0JBQXdCLEVBQVksTUFBTSxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBR2pHLE9BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzNILE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBZ0MsYUFBYSxFQUFFLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7O0FBR2hLLHVCQUVDOzs7Ozs7SUFEQyxrREFBdUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlEekMsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBUWxDOztVQUNPLGdCQUFnQixHQUNXLFVBQ0ksUUFBaUMsRUFDakMsU0FBbUMsRUFDbkMsTUFBNkI7Ozs7Ozs7Ozs7Y0FTMUQsZUFBZSxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxpQkFBd0I7O2NBQ3RFLFlBQVksR0FDZCxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFD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QWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBJbmplY3RvciwgTmdab25lLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7JENPTVBJTEUsICRJTkpFQ1RPUiwgJFBBUlNFLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyfSBmcm9tICcuL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlcic7XG5pbXBvcnQge0xhenlNb2R1bGVSZWYsIFVwZ3JhZGVBcHBUeXBlLCBjb250cm9sbGVyS2V5LCBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQsIGdldFR5cGVOYW1lLCBnZXRVcGdyYWRlQXBwVHlwZSwgaXNGdW5jdGlvbiwgdmFsaWRhdGVJbmplY3Rpb25LZXl9IGZyb20gJy4vdXRpbCc7XG5cblxuaW50ZXJmYWNlIFRoZW5hYmxlPFQ+IHtcbiAgdGhlbihjYWxsYmFjazogKHZhbHVlOiBUKSA9PiBhbnkpOiBhbnk7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdGhhdCBhbGxvd3MgYW4gQW5ndWxhciBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXJKUy5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGlzIGhlbHBlciBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0byBiZSB1c2VkIGZvciByZWdpc3RlcmluZ1xuICogYW4gQW5ndWxhckpTIHdyYXBwZXIgZGlyZWN0aXZlIGZvciBcImRvd25ncmFkaW5nXCIgYW4gQW5ndWxhciBjb21wb25lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIExldCdzIGFzc3VtZSB0aGF0IHlvdSBoYXZlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbGxlZCBgbmcySGVyb2VzYCB0aGF0IG5lZWRzXG4gKiB0byBiZSBtYWRlIGF2YWlsYWJsZSBpbiBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYW4gQW5ndWxhckpTIFtkaXJlY3RpdmVdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2d1aWRlL2RpcmVjdGl2ZSlcbiAqIHRoYXQgd2lsbCBtYWtlIHRoaXMgQW5ndWxhciBjb21wb25lbnQgYXZhaWxhYmxlIGluc2lkZSBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICogVGhlIGBkb3duZ3JhZGVDb21wb25lbnQoKWAgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCB3ZVxuICogY2FuIHVzZSB0byBkZWZpbmUgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyB0aGUgXCJkb3duZ3JhZGVkXCIgY29tcG9uZW50LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXdyYXBwZXJcIn1cbiAqXG4gKiBAcGFyYW0gaW5mbyBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQ29tcG9uZW50IHRoYXQgaXMgYmVpbmcgZG93bmdyYWRlZDpcbiAqXG4gKiAtIGBjb21wb25lbnQ6IFR5cGU8YW55PmA6IFRoZSB0eXBlIG9mIHRoZSBDb21wb25lbnQgdGhhdCB3aWxsIGJlIGRvd25ncmFkZWRcbiAqIC0gYGRvd25ncmFkZWRNb2R1bGU/OiBzdHJpbmdgOiBUaGUgbmFtZSBvZiB0aGUgZG93bmdyYWRlZCBtb2R1bGUgKGlmIGFueSkgdGhhdCB0aGUgY29tcG9uZW50XG4gKiAgIFwiYmVsb25ncyB0b1wiLCBhcyByZXR1cm5lZCBieSBhIGNhbGwgdG8gYGRvd25ncmFkZU1vZHVsZSgpYC4gSXQgaXMgdGhlIG1vZHVsZSwgd2hvc2VcbiAqICAgY29ycmVzcG9uZGluZyBBbmd1bGFyIG1vZHVsZSB3aWxsIGJlIGJvb3RzdHJhcHBlZCwgd2hlbiB0aGUgY29tcG9uZW50IG5lZWRzIHRvIGJlIGluc3RhbnRpYXRlZC5cbiAqICAgPGJyIC8+XG4gKiAgIChUaGlzIG9wdGlvbiBpcyBvbmx5IG5lY2Vzc2FyeSB3aGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAgdG8gZG93bmdyYWRlIG1vcmUgdGhhbiBvbmVcbiAqICAgQW5ndWxhciBtb2R1bGUuKVxuICogLSBgcHJvcGFnYXRlRGlnZXN0PzogYm9vbGVhbmA6IFdoZXRoZXIgdG8gcGVyZm9ybSB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JSZWYjZGV0ZWN0Q2hhbmdlc1xuICogICBjaGFuZ2UgZGV0ZWN0aW9ufSBvbiB0aGUgY29tcG9uZW50IG9uIGV2ZXJ5XG4gKiAgIFskZGlnZXN0XShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlIyRkaWdlc3QpLiBJZiBzZXQgdG8gYGZhbHNlYCxcbiAqICAgY2hhbmdlIGRldGVjdGlvbiB3aWxsIHN0aWxsIGJlIHBlcmZvcm1lZCB3aGVuIGFueSBvZiB0aGUgY29tcG9uZW50J3MgaW5wdXRzIGNoYW5nZXMuXG4gKiAgIChEZWZhdWx0OiB0cnVlKVxuICpcbiAqIEByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgaW4gYW5cbiAqIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZG93bmdyYWRlQ29tcG9uZW50KGluZm86IHtcbiAgY29tcG9uZW50OiBUeXBlPGFueT47IGRvd25ncmFkZWRNb2R1bGU/OiBzdHJpbmc7IHByb3BhZ2F0ZURpZ2VzdD86IGJvb2xlYW47XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgaW5wdXRzPzogc3RyaW5nW107XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgb3V0cHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIHNlbGVjdG9ycz86IHN0cmluZ1tdO1xufSk6IGFueSAvKiBhbmd1bGFyLklJbmplY3RhYmxlICovIHtcbiAgY29uc3QgZGlyZWN0aXZlRmFjdG9yeTpcbiAgICAgIGFuZ3VsYXIuSUFubm90YXRlZEZ1bmN0aW9uID0gZnVuY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRwYXJzZTogYW5ndWxhci5JUGFyc2VTZXJ2aWNlKTogYW5ndWxhci5JRGlyZWN0aXZlIHtcbiAgICAvLyBXaGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAsIHdlIG5lZWQgdG8gaGFuZGxlIGNlcnRhaW4gdGhpbmdzIHNwZWNpYWxseS4gRm9yIGV4YW1wbGU6XG4gICAgLy8gLSBXZSBhbHdheXMgbmVlZCB0byBhdHRhY2ggdGhlIGNvbXBvbmVudCB2aWV3IHRvIHRoZSBgQXBwbGljYXRpb25SZWZgIGZvciBpdCB0byBiZVxuICAgIC8vICAgZGlydHktY2hlY2tlZC5cbiAgICAvLyAtIFdlIG5lZWQgdG8gZW5zdXJlIGNhbGxiYWNrcyB0byBBbmd1bGFyIEFQSXMgKGUuZy4gY2hhbmdlIGRldGVjdGlvbikgYXJlIHJ1biBpbnNpZGUgdGhlXG4gICAgLy8gICBBbmd1bGFyIHpvbmUuXG4gICAgLy8gICBOT1RFOiBUaGlzIGlzIG5vdCBuZWVkZWQsIHdoZW4gdXNpbmcgYFVwZ3JhZGVNb2R1bGVgLCBiZWNhdXNlIGAkZGlnZXN0KClgIHdpbGwgYmUgcnVuXG4gICAgLy8gICAgICAgICBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZSAoZXhjZXB0IGlmIGV4cGxpY2l0bHkgZXNjYXBlZCwgaW4gd2hpY2ggY2FzZSB3ZSBzaG91bGRuJ3RcbiAgICAvLyAgICAgICAgIGZvcmNlIGl0IGJhY2sgaW4pLlxuICAgIGNvbnN0IGlzTmdVcGdyYWRlTGl0ZSA9IGdldFVwZ3JhZGVBcHBUeXBlKCRpbmplY3RvcikgPT09IFVwZ3JhZGVBcHBUeXBlLkxpdGU7XG4gICAgY29uc3Qgd3JhcENhbGxiYWNrOiA8VD4oY2I6ICgpID0+IFQpID0+IHR5cGVvZiBjYiA9XG4gICAgICAgICFpc05nVXBncmFkZUxpdGUgPyBjYiA9PiBjYiA6IGNiID0+ICgpID0+IE5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSA/IGNiKCkgOiBuZ1pvbmUucnVuKGNiKTtcbiAgICBsZXQgbmdab25lOiBOZ1pvbmU7XG5cbiAgICAvLyBXaGVuIGRvd25ncmFkaW5nIG11bHRpcGxlIG1vZHVsZXMsIHNwZWNpYWwgaGFuZGxpbmcgaXMgbmVlZGVkIHdydCBpbmplY3RvcnMuXG4gICAgY29uc3QgaGFzTXVsdGlwbGVEb3duZ3JhZGVkTW9kdWxlcyA9XG4gICAgICAgIGlzTmdVcGdyYWRlTGl0ZSAmJiAoZ2V0RG93bmdyYWRlZE1vZHVsZUNvdW50KCRpbmplY3RvcikgPiAxKTtcblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgdGVybWluYWw6IHRydWUsXG4gICAgICByZXF1aXJlOiBbUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTF0sXG4gICAgICBsaW5rOiAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLFxuICAgICAgICAgICAgIHJlcXVpcmVkOiBhbnlbXSkgPT4ge1xuICAgICAgICAvLyBXZSBtaWdodCBoYXZlIHRvIGNvbXBpbGUgdGhlIGNvbnRlbnRzIGFzeW5jaHJvbm91c2x5LCBiZWNhdXNlIHRoaXMgbWlnaHQgaGF2ZSBiZWVuXG4gICAgICAgIC8vIHRyaWdnZXJlZCBieSBgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyYCwgYmVmb3JlIHRoZSBBbmd1bGFyIHRlbXBsYXRlcyBoYXZlXG4gICAgICAgIC8vIGJlZW4gY29tcGlsZWQuXG5cbiAgICAgICAgY29uc3QgbmdNb2RlbDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIgPSByZXF1aXJlZFsxXTtcbiAgICAgICAgY29uc3QgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yfFRoZW5hYmxlPEluamVjdG9yPnx1bmRlZmluZWQgPSByZXF1aXJlZFswXTtcbiAgICAgICAgbGV0IG1vZHVsZUluamVjdG9yOiBJbmplY3RvcnxUaGVuYWJsZTxJbmplY3Rvcj58dW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcmFuQXN5bmMgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIXBhcmVudEluamVjdG9yIHx8IGhhc011bHRpcGxlRG93bmdyYWRlZE1vZHVsZXMpIHtcbiAgICAgICAgICBjb25zdCBkb3duZ3JhZGVkTW9kdWxlID0gaW5mby5kb3duZ3JhZGVkTW9kdWxlIHx8ICcnO1xuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWZLZXkgPSBgJHtMQVpZX01PRFVMRV9SRUZ9JHtkb3duZ3JhZGVkTW9kdWxlfWA7XG4gICAgICAgICAgY29uc3QgYXR0ZW1wdGVkQWN0aW9uID0gYGluc3RhbnRpYXRpbmcgY29tcG9uZW50ICcke2dldFR5cGVOYW1lKGluZm8uY29tcG9uZW50KX0nYDtcblxuICAgICAgICAgIHZhbGlkYXRlSW5qZWN0aW9uS2V5KCRpbmplY3RvciwgZG93bmdyYWRlZE1vZHVsZSwgbGF6eU1vZHVsZVJlZktleSwgYXR0ZW1wdGVkQWN0aW9uKTtcblxuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWYgPSAkaW5qZWN0b3IuZ2V0KGxhenlNb2R1bGVSZWZLZXkpIGFzIExhenlNb2R1bGVSZWY7XG4gICAgICAgICAgbW9kdWxlSW5qZWN0b3IgPSBsYXp5TW9kdWxlUmVmLmluamVjdG9yIHx8IGxhenlNb2R1bGVSZWYucHJvbWlzZSBhcyBQcm9taXNlPEluamVjdG9yPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGVzOlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGVyZSBhcmUgdHdvIGluamVjdG9yczogYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZCBgZmluYWxQYXJlbnRJbmplY3RvcmAgKHRoZXkgbWlnaHQgYmVcbiAgICAgICAgLy8gdGhlIHNhbWUgaW5zdGFuY2UsIGJ1dCB0aGF0IGlzIGlycmVsZXZhbnQpOlxuICAgICAgICAvLyAtIGBmaW5hbE1vZHVsZUluamVjdG9yYCBpcyB1c2VkIHRvIHJldHJpZXZlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgLCB0aHVzIGl0IG11c3QgYmVcbiAgICAgICAgLy8gICBvbiB0aGUgc2FtZSB0cmVlIGFzIHRoZSBgTmdNb2R1bGVgIHRoYXQgZGVjbGFyZXMgdGhpcyBkb3duZ3JhZGVkIGNvbXBvbmVudC5cbiAgICAgICAgLy8gLSBgZmluYWxQYXJlbnRJbmplY3RvcmAgaXMgdXNlZCBmb3IgYWxsIG90aGVyIGluamVjdGlvbiBwdXJwb3Nlcy5cbiAgICAgICAgLy8gICAoTm90ZSB0aGF0IEFuZ3VsYXIga25vd3MgdG8gb25seSB0cmF2ZXJzZSB0aGUgY29tcG9uZW50LXRyZWUgcGFydCBvZiB0aGF0IGluamVjdG9yLFxuICAgICAgICAvLyAgIHdoZW4gbG9va2luZyBmb3IgYW4gaW5qZWN0YWJsZSBhbmQgdGhlbiBzd2l0Y2ggdG8gdGhlIG1vZHVsZSBpbmplY3Rvci4pXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZXJlIGFyZSBiYXNpY2FsbHkgdGhyZWUgY2FzZXM6XG4gICAgICAgIC8vIC0gSWYgdGhlcmUgaXMgbm8gcGFyZW50IGNvbXBvbmVudCAodGh1cyBubyBgcGFyZW50SW5qZWN0b3JgKSwgd2UgYm9vdHN0cmFwIHRoZSBkb3duZ3JhZGVkXG4gICAgICAgIC8vICAgYE5nTW9kdWxlYCBhbmQgdXNlIGl0cyBpbmplY3RvciBhcyBib3RoIGBmaW5hbE1vZHVsZUluamVjdG9yYCBhbmRcbiAgICAgICAgLy8gICBgZmluYWxQYXJlbnRJbmplY3RvcmAuXG4gICAgICAgIC8vIC0gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50IChhbmQgdGh1cyBhIGBwYXJlbnRJbmplY3RvcmApIGFuZCB3ZSBhcmUgc3VyZSB0aGF0IGl0XG4gICAgICAgIC8vICAgYmVsb25ncyB0byB0aGUgc2FtZSBgTmdNb2R1bGVgIGFzIHRoaXMgZG93bmdyYWRlZCBjb21wb25lbnQgKGUuZy4gYmVjYXVzZSB0aGVyZSBpcyBvbmx5XG4gICAgICAgIC8vICAgb25lIGRvd25ncmFkZWQgbW9kdWxlLCB3ZSB1c2UgdGhhdCBgcGFyZW50SW5qZWN0b3JgIGFzIGJvdGggYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZFxuICAgICAgICAvLyAgIGBmaW5hbFBhcmVudEluamVjdG9yYC5cbiAgICAgICAgLy8gLSBJZiB0aGVyZSBpcyBhIHBhcmVudCBjb21wb25lbnQsIGJ1dCBpdCBtYXkgYmVsb25nIHRvIGEgZGlmZmVyZW50IGBOZ01vZHVsZWAsIHRoZW4gd2VcbiAgICAgICAgLy8gICB1c2UgdGhlIGBwYXJlbnRJbmplY3RvcmAgYXMgYGZpbmFsUGFyZW50SW5qZWN0b3JgIGFuZCB0aGlzIGRvd25ncmFkZWQgY29tcG9uZW50J3NcbiAgICAgICAgLy8gICBkZWNsYXJpbmcgYE5nTW9kdWxlYCdzIGluamVjdG9yIGFzIGBmaW5hbE1vZHVsZUluamVjdG9yYC5cbiAgICAgICAgLy8gICBOb3RlIDE6IElmIHRoZSBgTmdNb2R1bGVgIGlzIGFscmVhZHkgYm9vdHN0cmFwcGVkLCB3ZSBqdXN0IGdldCBpdHMgaW5qZWN0b3IgKHdlIGRvbid0XG4gICAgICAgIC8vICAgICAgICAgICBib290c3RyYXAgYWdhaW4pLlxuICAgICAgICAvLyAgIE5vdGUgMjogSXQgaXMgcG9zc2libGUgdGhhdCAod2hpbGUgdGhlcmUgYXJlIG11bHRpcGxlIGRvd25ncmFkZWQgbW9kdWxlcykgdGhpc1xuICAgICAgICAvLyAgICAgICAgICAgZG93bmdyYWRlZCBjb21wb25lbnQgYW5kIGl0cyBwYXJlbnQgY29tcG9uZW50IGJvdGggYmVsb25nIHRvIHRoZSBzYW1lIE5nTW9kdWxlLlxuICAgICAgICAvLyAgICAgICAgICAgSW4gdGhhdCBjYXNlLCB3ZSBjb3VsZCBoYXZlIHVzZWQgdGhlIGBwYXJlbnRJbmplY3RvcmAgYXMgYm90aFxuICAgICAgICAvLyAgICAgICAgICAgYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZCBgZmluYWxQYXJlbnRJbmplY3RvcmAsIGJ1dCAoZm9yIHNpbXBsaWNpdHkpIHdlIGFyZVxuICAgICAgICAvLyAgICAgICAgICAgdHJlYXRpbmcgdGhpcyBjYXNlIGFzIGlmIHRoZXkgYmVsb25nIHRvIGRpZmZlcmVudCBgTmdNb2R1bGVgcy4gVGhhdCBkb2Vzbid0XG4gICAgICAgIC8vICAgICAgICAgICByZWFsbHkgYWZmZWN0IGFueXRoaW5nLCBzaW5jZSBgcGFyZW50SW5qZWN0b3JgIGhhcyBgbW9kdWxlSW5qZWN0b3JgIGFzIGFuY2VzdG9yXG4gICAgICAgIC8vICAgICAgICAgICBhbmQgdHJ5aW5nIHRvIHJlc29sdmUgYENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcmAgZnJvbSBlaXRoZXIgb25lIHdpbGwgcmV0dXJuXG4gICAgICAgIC8vICAgICAgICAgICB0aGUgc2FtZSBpbnN0YW5jZS5cblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHBhcmVudCBjb21wb25lbnQsIHVzZSBpdHMgaW5qZWN0b3IgYXMgcGFyZW50IGluamVjdG9yLlxuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgXCJ0b3AtbGV2ZWxcIiBBbmd1bGFyIGNvbXBvbmVudCwgdXNlIHRoZSBtb2R1bGUgaW5qZWN0b3IuXG4gICAgICAgIGNvbnN0IGZpbmFsUGFyZW50SW5qZWN0b3IgPSBwYXJlbnRJbmplY3RvciB8fCBtb2R1bGVJbmplY3RvciAhO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBcInRvcC1sZXZlbFwiIEFuZ3VsYXIgY29tcG9uZW50IG9yIHRoZSBwYXJlbnQgY29tcG9uZW50IG1heSBiZWxvbmcgdG8gYVxuICAgICAgICAvLyBkaWZmZXJlbnQgYE5nTW9kdWxlYCwgdXNlIHRoZSBtb2R1bGUgaW5qZWN0b3IgZm9yIG1vZHVsZS1zcGVjaWZpYyBkZXBlbmRlbmNpZXMuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgcGFyZW50IGNvbXBvbmVudCB0aGF0IGJlbG9uZ3MgdG8gdGhlIHNhbWUgYE5nTW9kdWxlYCwgdXNlIGl0cyBpbmplY3Rvci5cbiAgICAgICAgY29uc3QgZmluYWxNb2R1bGVJbmplY3RvciA9IG1vZHVsZUluamVjdG9yIHx8IHBhcmVudEluamVjdG9yICE7XG5cbiAgICAgICAgY29uc3QgZG9Eb3duZ3JhZGUgPSAoaW5qZWN0b3I6IEluamVjdG9yLCBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAvLyBSZXRyaWV2ZSBgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyYCBmcm9tIHRoZSBpbmplY3RvciB0aWVkIHRvIHRoZSBgTmdNb2R1bGVgIHRoaXNcbiAgICAgICAgICAvLyBjb21wb25lbnQgYmVsb25ncyB0by5cbiAgICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciA9XG4gICAgICAgICAgICAgIG1vZHVsZUluamVjdG9yLmdldChDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55PiA9XG4gICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShpbmZvLmNvbXBvbmVudCkgITtcblxuICAgICAgICAgIGlmICghY29tcG9uZW50RmFjdG9yeSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RpbmcgQ29tcG9uZW50RmFjdG9yeSBmb3I6ICR7Z2V0VHlwZU5hbWUoaW5mby5jb21wb25lbnQpfWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGluamVjdG9yUHJvbWlzZSA9IG5ldyBQYXJlbnRJbmplY3RvclByb21pc2UoZWxlbWVudCk7XG4gICAgICAgICAgY29uc3QgZmFjYWRlID0gbmV3IERvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXIoXG4gICAgICAgICAgICAgIGVsZW1lbnQsIGF0dHJzLCBzY29wZSwgbmdNb2RlbCwgaW5qZWN0b3IsICRpbmplY3RvciwgJGNvbXBpbGUsICRwYXJzZSxcbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeSwgd3JhcENhbGxiYWNrKTtcblxuICAgICAgICAgIGNvbnN0IHByb2plY3RhYmxlTm9kZXMgPSBmYWNhZGUuY29tcGlsZUNvbnRlbnRzKCk7XG4gICAgICAgICAgZmFjYWRlLmNyZWF0ZUNvbXBvbmVudChwcm9qZWN0YWJsZU5vZGVzKTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBJbnB1dHMoaXNOZ1VwZ3JhZGVMaXRlLCBpbmZvLnByb3BhZ2F0ZURpZ2VzdCk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwT3V0cHV0cygpO1xuICAgICAgICAgIGZhY2FkZS5yZWdpc3RlckNsZWFudXAoKTtcblxuICAgICAgICAgIGluamVjdG9yUHJvbWlzZS5yZXNvbHZlKGZhY2FkZS5nZXRJbmplY3RvcigpKTtcblxuICAgICAgICAgIGlmIChyYW5Bc3luYykge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBydW4gYXN5bmMsIGl0IGlzIHBvc3NpYmxlIHRoYXQgaXQgaXMgbm90IHJ1biBpbnNpZGUgYVxuICAgICAgICAgICAgLy8gZGlnZXN0IGFuZCBpbml0aWFsIGlucHV0IHZhbHVlcyB3aWxsIG5vdCBiZSBkZXRlY3RlZC5cbiAgICAgICAgICAgIHNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge30pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkb3duZ3JhZGVGbiA9XG4gICAgICAgICAgICAhaXNOZ1VwZ3JhZGVMaXRlID8gZG9Eb3duZ3JhZGUgOiAocEluamVjdG9yOiBJbmplY3RvciwgbUluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgICAgICBpZiAoIW5nWm9uZSkge1xuICAgICAgICAgICAgICAgIG5nWm9uZSA9IHBJbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHdyYXBDYWxsYmFjaygoKSA9PiBkb0Rvd25ncmFkZShwSW5qZWN0b3IsIG1JbmplY3RvcikpKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGlmIChpc1RoZW5hYmxlKGZpbmFsUGFyZW50SW5qZWN0b3IpIHx8IGlzVGhlbmFibGUoZmluYWxNb2R1bGVJbmplY3RvcikpIHtcbiAgICAgICAgICBQcm9taXNlLmFsbChbZmluYWxQYXJlbnRJbmplY3RvciwgZmluYWxNb2R1bGVJbmplY3Rvcl0pXG4gICAgICAgICAgICAgIC50aGVuKChbcEluamVjdG9yLCBtSW5qZWN0b3JdKSA9PiBkb3duZ3JhZGVGbihwSW5qZWN0b3IsIG1JbmplY3RvcikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvd25ncmFkZUZuKGZpbmFsUGFyZW50SW5qZWN0b3IsIGZpbmFsTW9kdWxlSW5qZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmFuQXN5bmMgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gYnJhY2tldC1ub3RhdGlvbiBiZWNhdXNlIG9mIGNsb3N1cmUgLSBzZWUgIzE0NDQxXG4gIGRpcmVjdGl2ZUZhY3RvcnlbJyRpbmplY3QnXSA9IFskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0VdO1xuICByZXR1cm4gZGlyZWN0aXZlRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhciAxJ3MgJGNvbXBpbGUuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGluamVjdG9yICE6IEluamVjdG9yO1xuICBwcml2YXRlIGluamVjdG9yS2V5OiBzdHJpbmcgPSBjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSk7XG4gIHByaXZhdGUgY2FsbGJhY2tzOiAoKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAvLyBTdG9yZSB0aGUgcHJvbWlzZSBvbiB0aGUgZWxlbWVudC5cbiAgICBlbGVtZW50LmRhdGEgISh0aGlzLmluamVjdG9yS2V5LCB0aGlzKTtcbiAgfVxuXG4gIHRoZW4oY2FsbGJhY2s6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSkge1xuICAgIGlmICh0aGlzLmluamVjdG9yKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLmluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZShpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG5cbiAgICAvLyBTdG9yZSB0aGUgcmVhbCBpbmplY3RvciBvbiB0aGUgZWxlbWVudC5cbiAgICB0aGlzLmVsZW1lbnQuZGF0YSAhKHRoaXMuaW5qZWN0b3JLZXksIGluamVjdG9yKTtcblxuICAgIC8vIFJlbGVhc2UgdGhlIGVsZW1lbnQgdG8gcHJldmVudCBtZW1vcnkgbGVha3MuXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbCAhO1xuXG4gICAgLy8gUnVuIHRoZSBxdWV1ZWQgY2FsbGJhY2tzLlxuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2soaW5qZWN0b3IpKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVGhlbmFibGU8VD4ob2JqOiBvYmplY3QpOiBvYmogaXMgVGhlbmFibGU8VD4ge1xuICByZXR1cm4gaXNGdW5jdGlvbigob2JqIGFzIGFueSkudGhlbik7XG59XG4iXX0=