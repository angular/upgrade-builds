/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
    const directiveFactory = (/**
     * @param {?} $compile
     * @param {?} $injector
     * @param {?} $parse
     * @return {?}
     */
    function ($compile, $injector, $parse) {
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
        const wrapCallback = !isNgUpgradeLite ? (/**
         * @param {?} cb
         * @return {?}
         */
        cb => cb) : (/**
         * @param {?} cb
         * @return {?}
         */
        cb => (/**
         * @return {?}
         */
        () => NgZone.isInAngularZone() ? cb() : ngZone.run(cb)));
        /** @type {?} */
        let ngZone;
        // When downgrading multiple modules, special handling is needed wrt injectors.
        /** @type {?} */
        const hasMultipleDowngradedModules = isNgUpgradeLite && (getDowngradedModuleCount($injector) > 1);
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: (/**
             * @param {?} scope
             * @param {?} element
             * @param {?} attrs
             * @param {?} required
             * @return {?}
             */
            (scope, element, attrs, required) => {
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
                const doDowngrade = (/**
                 * @param {?} injector
                 * @param {?} moduleInjector
                 * @return {?}
                 */
                (injector, moduleInjector) => {
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
                        scope.$evalAsync((/**
                         * @return {?}
                         */
                        () => { }));
                    }
                });
                /** @type {?} */
                const downgradeFn = !isNgUpgradeLite ? doDowngrade : (/**
                 * @param {?} pInjector
                 * @param {?} mInjector
                 * @return {?}
                 */
                (pInjector, mInjector) => {
                    if (!ngZone) {
                        ngZone = pInjector.get(NgZone);
                    }
                    wrapCallback((/**
                     * @return {?}
                     */
                    () => doDowngrade(pInjector, mInjector)))();
                });
                if (isThenable(finalParentInjector) || isThenable(finalModuleInjector)) {
                    Promise.all([finalParentInjector, finalModuleInjector])
                        .then((/**
                     * @param {?} __0
                     * @return {?}
                     */
                    ([pInjector, mInjector]) => downgradeFn(pInjector, mInjector)));
                }
                else {
                    downgradeFn(finalParentInjector, finalModuleInjector);
                }
                ranAsync = true;
            })
        };
    });
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
        this.callbacks.forEach((/**
         * @param {?} callback
         * @return {?}
         */
        callback => callback(injector)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBbUIsd0JBQXdCLEVBQVksTUFBTSxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBR2pHLE9BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzNILE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBZ0MsYUFBYSxFQUFFLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7O0FBR2hLLHVCQUVDOzs7Ozs7SUFEQyxrREFBdUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlEekMsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBUWxDOztVQUNPLGdCQUFnQjs7Ozs7O0lBQXVCLFVBQ3pDLFFBQXlCLEVBQUUsU0FBMkIsRUFBRSxNQUFxQjs7Ozs7Ozs7OztjQVN6RSxlQUFlLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLGlCQUF3Qjs7Y0FDdEUsWUFBWSxHQUNkLENBQUMsZUFBZSxDQUFDLENBQUM7Ozs7UUFBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBQyxDQUFDOzs7O1FBQUMsRUFBRSxDQUFDLEVBQUU7OztRQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxD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QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSW5qZWN0b3IsIE5nWm9uZSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SUFubm90YXRlZEZ1bmN0aW9uLCBJQXR0cmlidXRlcywgSUF1Z21lbnRlZEpRdWVyeSwgSUNvbXBpbGVTZXJ2aWNlLCBJRGlyZWN0aXZlLCBJSW5qZWN0b3JTZXJ2aWNlLCBJTmdNb2RlbENvbnRyb2xsZXIsIElQYXJzZVNlcnZpY2UsIElTY29wZX0gZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRDT01QSUxFLCAkSU5KRUNUT1IsICRQQVJTRSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFJFUVVJUkVfSU5KRUNUT1IsIFJFUVVJUkVfTkdfTU9ERUx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcn0gZnJvbSAnLi9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXInO1xuaW1wb3J0IHtMYXp5TW9kdWxlUmVmLCBVcGdyYWRlQXBwVHlwZSwgY29udHJvbGxlcktleSwgZ2V0RG93bmdyYWRlZE1vZHVsZUNvdW50LCBnZXRUeXBlTmFtZSwgZ2V0VXBncmFkZUFwcFR5cGUsIGlzRnVuY3Rpb24sIHZhbGlkYXRlSW5qZWN0aW9uS2V5fSBmcm9tICcuL3V0aWwnO1xuXG5cbmludGVyZmFjZSBUaGVuYWJsZTxUPiB7XG4gIHRoZW4oY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gYW55KTogYW55O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFySlMuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdG8gYmUgdXNlZCBmb3IgcmVnaXN0ZXJpbmdcbiAqIGFuIEFuZ3VsYXJKUyB3cmFwcGVyIGRpcmVjdGl2ZSBmb3IgXCJkb3duZ3JhZGluZ1wiIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBMZXQncyBhc3N1bWUgdGhhdCB5b3UgaGF2ZSBhbiBBbmd1bGFyIGNvbXBvbmVudCBjYWxsZWQgYG5nMkhlcm9lc2AgdGhhdCBuZWVkc1xuICogdG8gYmUgbWFkZSBhdmFpbGFibGUgaW4gQW5ndWxhckpTIHRlbXBsYXRlcy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lc1wifVxuICpcbiAqIFdlIG11c3QgY3JlYXRlIGFuIEFuZ3VsYXJKUyBbZGlyZWN0aXZlXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9ndWlkZS9kaXJlY3RpdmUpXG4gKiB0aGF0IHdpbGwgbWFrZSB0aGlzIEFuZ3VsYXIgY29tcG9uZW50IGF2YWlsYWJsZSBpbnNpZGUgQW5ndWxhckpTIHRlbXBsYXRlcy5cbiAqIFRoZSBgZG93bmdyYWRlQ29tcG9uZW50KClgIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgd2VcbiAqIGNhbiB1c2UgdG8gZGVmaW5lIHRoZSBBbmd1bGFySlMgZGlyZWN0aXZlIHRoYXQgd3JhcHMgdGhlIFwiZG93bmdyYWRlZFwiIGNvbXBvbmVudC5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcyLWhlcm9lcy13cmFwcGVyXCJ9XG4gKlxuICogQHBhcmFtIGluZm8gY29udGFpbnMgaW5mb3JtYXRpb24gYWJvdXQgdGhlIENvbXBvbmVudCB0aGF0IGlzIGJlaW5nIGRvd25ncmFkZWQ6XG4gKlxuICogLSBgY29tcG9uZW50OiBUeXBlPGFueT5gOiBUaGUgdHlwZSBvZiB0aGUgQ29tcG9uZW50IHRoYXQgd2lsbCBiZSBkb3duZ3JhZGVkXG4gKiAtIGBkb3duZ3JhZGVkTW9kdWxlPzogc3RyaW5nYDogVGhlIG5hbWUgb2YgdGhlIGRvd25ncmFkZWQgbW9kdWxlIChpZiBhbnkpIHRoYXQgdGhlIGNvbXBvbmVudFxuICogICBcImJlbG9uZ3MgdG9cIiwgYXMgcmV0dXJuZWQgYnkgYSBjYWxsIHRvIGBkb3duZ3JhZGVNb2R1bGUoKWAuIEl0IGlzIHRoZSBtb2R1bGUsIHdob3NlXG4gKiAgIGNvcnJlc3BvbmRpbmcgQW5ndWxhciBtb2R1bGUgd2lsbCBiZSBib290c3RyYXBwZWQsIHdoZW4gdGhlIGNvbXBvbmVudCBuZWVkcyB0byBiZSBpbnN0YW50aWF0ZWQuXG4gKiAgIDxiciAvPlxuICogICAoVGhpcyBvcHRpb24gaXMgb25seSBuZWNlc3Nhcnkgd2hlbiB1c2luZyBgZG93bmdyYWRlTW9kdWxlKClgIHRvIGRvd25ncmFkZSBtb3JlIHRoYW4gb25lXG4gKiAgIEFuZ3VsYXIgbW9kdWxlLilcbiAqIC0gYHByb3BhZ2F0ZURpZ2VzdD86IGJvb2xlYW5gOiBXaGV0aGVyIHRvIHBlcmZvcm0ge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGVjdENoYW5nZXNcbiAqICAgY2hhbmdlIGRldGVjdGlvbn0gb24gdGhlIGNvbXBvbmVudCBvbiBldmVyeVxuICogICBbJGRpZ2VzdF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KS4gSWYgc2V0IHRvIGBmYWxzZWAsXG4gKiAgIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBzdGlsbCBiZSBwZXJmb3JtZWQgd2hlbiBhbnkgb2YgdGhlIGNvbXBvbmVudCdzIGlucHV0cyBjaGFuZ2VzLlxuICogICAoRGVmYXVsdDogdHJ1ZSlcbiAqXG4gKiBAcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGluIGFuXG4gKiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUNvbXBvbmVudChpbmZvOiB7XG4gIGNvbXBvbmVudDogVHlwZTxhbnk+OyBkb3duZ3JhZGVkTW9kdWxlPzogc3RyaW5nOyBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIGlucHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIG91dHB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBzZWxlY3RvcnM/OiBzdHJpbmdbXTtcbn0pOiBhbnkgLyogYW5ndWxhci5JSW5qZWN0YWJsZSAqLyB7XG4gIGNvbnN0IGRpcmVjdGl2ZUZhY3Rvcnk6IElBbm5vdGF0ZWRGdW5jdGlvbiA9IGZ1bmN0aW9uKFxuICAgICAgJGNvbXBpbGU6IElDb21waWxlU2VydmljZSwgJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlLCAkcGFyc2U6IElQYXJzZVNlcnZpY2UpOiBJRGlyZWN0aXZlIHtcbiAgICAvLyBXaGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAsIHdlIG5lZWQgdG8gaGFuZGxlIGNlcnRhaW4gdGhpbmdzIHNwZWNpYWxseS4gRm9yIGV4YW1wbGU6XG4gICAgLy8gLSBXZSBhbHdheXMgbmVlZCB0byBhdHRhY2ggdGhlIGNvbXBvbmVudCB2aWV3IHRvIHRoZSBgQXBwbGljYXRpb25SZWZgIGZvciBpdCB0byBiZVxuICAgIC8vICAgZGlydHktY2hlY2tlZC5cbiAgICAvLyAtIFdlIG5lZWQgdG8gZW5zdXJlIGNhbGxiYWNrcyB0byBBbmd1bGFyIEFQSXMgKGUuZy4gY2hhbmdlIGRldGVjdGlvbikgYXJlIHJ1biBpbnNpZGUgdGhlXG4gICAgLy8gICBBbmd1bGFyIHpvbmUuXG4gICAgLy8gICBOT1RFOiBUaGlzIGlzIG5vdCBuZWVkZWQsIHdoZW4gdXNpbmcgYFVwZ3JhZGVNb2R1bGVgLCBiZWNhdXNlIGAkZGlnZXN0KClgIHdpbGwgYmUgcnVuXG4gICAgLy8gICAgICAgICBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZSAoZXhjZXB0IGlmIGV4cGxpY2l0bHkgZXNjYXBlZCwgaW4gd2hpY2ggY2FzZSB3ZSBzaG91bGRuJ3RcbiAgICAvLyAgICAgICAgIGZvcmNlIGl0IGJhY2sgaW4pLlxuICAgIGNvbnN0IGlzTmdVcGdyYWRlTGl0ZSA9IGdldFVwZ3JhZGVBcHBUeXBlKCRpbmplY3RvcikgPT09IFVwZ3JhZGVBcHBUeXBlLkxpdGU7XG4gICAgY29uc3Qgd3JhcENhbGxiYWNrOiA8VD4oY2I6ICgpID0+IFQpID0+IHR5cGVvZiBjYiA9XG4gICAgICAgICFpc05nVXBncmFkZUxpdGUgPyBjYiA9PiBjYiA6IGNiID0+ICgpID0+IE5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSA/IGNiKCkgOiBuZ1pvbmUucnVuKGNiKTtcbiAgICBsZXQgbmdab25lOiBOZ1pvbmU7XG5cbiAgICAvLyBXaGVuIGRvd25ncmFkaW5nIG11bHRpcGxlIG1vZHVsZXMsIHNwZWNpYWwgaGFuZGxpbmcgaXMgbmVlZGVkIHdydCBpbmplY3RvcnMuXG4gICAgY29uc3QgaGFzTXVsdGlwbGVEb3duZ3JhZGVkTW9kdWxlcyA9XG4gICAgICAgIGlzTmdVcGdyYWRlTGl0ZSAmJiAoZ2V0RG93bmdyYWRlZE1vZHVsZUNvdW50KCRpbmplY3RvcikgPiAxKTtcblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgdGVybWluYWw6IHRydWUsXG4gICAgICByZXF1aXJlOiBbUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTF0sXG4gICAgICBsaW5rOiAoc2NvcGU6IElTY29wZSwgZWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IElBdHRyaWJ1dGVzLCByZXF1aXJlZDogYW55W10pID0+IHtcbiAgICAgICAgLy8gV2UgbWlnaHQgaGF2ZSB0byBjb21waWxlIHRoZSBjb250ZW50cyBhc3luY2hyb25vdXNseSwgYmVjYXVzZSB0aGlzIG1pZ2h0IGhhdmUgYmVlblxuICAgICAgICAvLyB0cmlnZ2VyZWQgYnkgYFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcmAsIGJlZm9yZSB0aGUgQW5ndWxhciB0ZW1wbGF0ZXMgaGF2ZVxuICAgICAgICAvLyBiZWVuIGNvbXBpbGVkLlxuXG4gICAgICAgIGNvbnN0IG5nTW9kZWw6IElOZ01vZGVsQ29udHJvbGxlciA9IHJlcXVpcmVkWzFdO1xuICAgICAgICBjb25zdCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3J8VGhlbmFibGU8SW5qZWN0b3I+fHVuZGVmaW5lZCA9IHJlcXVpcmVkWzBdO1xuICAgICAgICBsZXQgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yfFRoZW5hYmxlPEluamVjdG9yPnx1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGxldCByYW5Bc3luYyA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghcGFyZW50SW5qZWN0b3IgfHwgaGFzTXVsdGlwbGVEb3duZ3JhZGVkTW9kdWxlcykge1xuICAgICAgICAgIGNvbnN0IGRvd25ncmFkZWRNb2R1bGUgPSBpbmZvLmRvd25ncmFkZWRNb2R1bGUgfHwgJyc7XG4gICAgICAgICAgY29uc3QgbGF6eU1vZHVsZVJlZktleSA9IGAke0xBWllfTU9EVUxFX1JFRn0ke2Rvd25ncmFkZWRNb2R1bGV9YDtcbiAgICAgICAgICBjb25zdCBhdHRlbXB0ZWRBY3Rpb24gPSBgaW5zdGFudGlhdGluZyBjb21wb25lbnQgJyR7Z2V0VHlwZU5hbWUoaW5mby5jb21wb25lbnQpfSdgO1xuXG4gICAgICAgICAgdmFsaWRhdGVJbmplY3Rpb25LZXkoJGluamVjdG9yLCBkb3duZ3JhZGVkTW9kdWxlLCBsYXp5TW9kdWxlUmVmS2V5LCBhdHRlbXB0ZWRBY3Rpb24pO1xuXG4gICAgICAgICAgY29uc3QgbGF6eU1vZHVsZVJlZiA9ICRpbmplY3Rvci5nZXQobGF6eU1vZHVsZVJlZktleSkgYXMgTGF6eU1vZHVsZVJlZjtcbiAgICAgICAgICBtb2R1bGVJbmplY3RvciA9IGxhenlNb2R1bGVSZWYuaW5qZWN0b3IgfHwgbGF6eU1vZHVsZVJlZi5wcm9taXNlIGFzIFByb21pc2U8SW5qZWN0b3I+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm90ZXM6XG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZXJlIGFyZSB0d28gaW5qZWN0b3JzOiBgZmluYWxNb2R1bGVJbmplY3RvcmAgYW5kIGBmaW5hbFBhcmVudEluamVjdG9yYCAodGhleSBtaWdodCBiZVxuICAgICAgICAvLyB0aGUgc2FtZSBpbnN0YW5jZSwgYnV0IHRoYXQgaXMgaXJyZWxldmFudCk6XG4gICAgICAgIC8vIC0gYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGlzIHVzZWQgdG8gcmV0cmlldmUgYENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcmAsIHRodXMgaXQgbXVzdCBiZVxuICAgICAgICAvLyAgIG9uIHRoZSBzYW1lIHRyZWUgYXMgdGhlIGBOZ01vZHVsZWAgdGhhdCBkZWNsYXJlcyB0aGlzIGRvd25ncmFkZWQgY29tcG9uZW50LlxuICAgICAgICAvLyAtIGBmaW5hbFBhcmVudEluamVjdG9yYCBpcyB1c2VkIGZvciBhbGwgb3RoZXIgaW5qZWN0aW9uIHB1cnBvc2VzLlxuICAgICAgICAvLyAgIChOb3RlIHRoYXQgQW5ndWxhciBrbm93cyB0byBvbmx5IHRyYXZlcnNlIHRoZSBjb21wb25lbnQtdHJlZSBwYXJ0IG9mIHRoYXQgaW5qZWN0b3IsXG4gICAgICAgIC8vICAgd2hlbiBsb29raW5nIGZvciBhbiBpbmplY3RhYmxlIGFuZCB0aGVuIHN3aXRjaCB0byB0aGUgbW9kdWxlIGluamVjdG9yLilcbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlcmUgYXJlIGJhc2ljYWxseSB0aHJlZSBjYXNlczpcbiAgICAgICAgLy8gLSBJZiB0aGVyZSBpcyBubyBwYXJlbnQgY29tcG9uZW50ICh0aHVzIG5vIGBwYXJlbnRJbmplY3RvcmApLCB3ZSBib290c3RyYXAgdGhlIGRvd25ncmFkZWRcbiAgICAgICAgLy8gICBgTmdNb2R1bGVgIGFuZCB1c2UgaXRzIGluamVjdG9yIGFzIGJvdGggYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZFxuICAgICAgICAvLyAgIGBmaW5hbFBhcmVudEluamVjdG9yYC5cbiAgICAgICAgLy8gLSBJZiB0aGVyZSBpcyBhIHBhcmVudCBjb21wb25lbnQgKGFuZCB0aHVzIGEgYHBhcmVudEluamVjdG9yYCkgYW5kIHdlIGFyZSBzdXJlIHRoYXQgaXRcbiAgICAgICAgLy8gICBiZWxvbmdzIHRvIHRoZSBzYW1lIGBOZ01vZHVsZWAgYXMgdGhpcyBkb3duZ3JhZGVkIGNvbXBvbmVudCAoZS5nLiBiZWNhdXNlIHRoZXJlIGlzIG9ubHlcbiAgICAgICAgLy8gICBvbmUgZG93bmdyYWRlZCBtb2R1bGUsIHdlIHVzZSB0aGF0IGBwYXJlbnRJbmplY3RvcmAgYXMgYm90aCBgZmluYWxNb2R1bGVJbmplY3RvcmAgYW5kXG4gICAgICAgIC8vICAgYGZpbmFsUGFyZW50SW5qZWN0b3JgLlxuICAgICAgICAvLyAtIElmIHRoZXJlIGlzIGEgcGFyZW50IGNvbXBvbmVudCwgYnV0IGl0IG1heSBiZWxvbmcgdG8gYSBkaWZmZXJlbnQgYE5nTW9kdWxlYCwgdGhlbiB3ZVxuICAgICAgICAvLyAgIHVzZSB0aGUgYHBhcmVudEluamVjdG9yYCBhcyBgZmluYWxQYXJlbnRJbmplY3RvcmAgYW5kIHRoaXMgZG93bmdyYWRlZCBjb21wb25lbnQnc1xuICAgICAgICAvLyAgIGRlY2xhcmluZyBgTmdNb2R1bGVgJ3MgaW5qZWN0b3IgYXMgYGZpbmFsTW9kdWxlSW5qZWN0b3JgLlxuICAgICAgICAvLyAgIE5vdGUgMTogSWYgdGhlIGBOZ01vZHVsZWAgaXMgYWxyZWFkeSBib290c3RyYXBwZWQsIHdlIGp1c3QgZ2V0IGl0cyBpbmplY3RvciAod2UgZG9uJ3RcbiAgICAgICAgLy8gICAgICAgICAgIGJvb3RzdHJhcCBhZ2FpbikuXG4gICAgICAgIC8vICAgTm90ZSAyOiBJdCBpcyBwb3NzaWJsZSB0aGF0ICh3aGlsZSB0aGVyZSBhcmUgbXVsdGlwbGUgZG93bmdyYWRlZCBtb2R1bGVzKSB0aGlzXG4gICAgICAgIC8vICAgICAgICAgICBkb3duZ3JhZGVkIGNvbXBvbmVudCBhbmQgaXRzIHBhcmVudCBjb21wb25lbnQgYm90aCBiZWxvbmcgdG8gdGhlIHNhbWUgTmdNb2R1bGUuXG4gICAgICAgIC8vICAgICAgICAgICBJbiB0aGF0IGNhc2UsIHdlIGNvdWxkIGhhdmUgdXNlZCB0aGUgYHBhcmVudEluamVjdG9yYCBhcyBib3RoXG4gICAgICAgIC8vICAgICAgICAgICBgZmluYWxNb2R1bGVJbmplY3RvcmAgYW5kIGBmaW5hbFBhcmVudEluamVjdG9yYCwgYnV0IChmb3Igc2ltcGxpY2l0eSkgd2UgYXJlXG4gICAgICAgIC8vICAgICAgICAgICB0cmVhdGluZyB0aGlzIGNhc2UgYXMgaWYgdGhleSBiZWxvbmcgdG8gZGlmZmVyZW50IGBOZ01vZHVsZWBzLiBUaGF0IGRvZXNuJ3RcbiAgICAgICAgLy8gICAgICAgICAgIHJlYWxseSBhZmZlY3QgYW55dGhpbmcsIHNpbmNlIGBwYXJlbnRJbmplY3RvcmAgaGFzIGBtb2R1bGVJbmplY3RvcmAgYXMgYW5jZXN0b3JcbiAgICAgICAgLy8gICAgICAgICAgIGFuZCB0cnlpbmcgdG8gcmVzb2x2ZSBgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyYCBmcm9tIGVpdGhlciBvbmUgd2lsbCByZXR1cm5cbiAgICAgICAgLy8gICAgICAgICAgIHRoZSBzYW1lIGluc3RhbmNlLlxuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgcGFyZW50IGNvbXBvbmVudCwgdXNlIGl0cyBpbmplY3RvciBhcyBwYXJlbnQgaW5qZWN0b3IuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBcInRvcC1sZXZlbFwiIEFuZ3VsYXIgY29tcG9uZW50LCB1c2UgdGhlIG1vZHVsZSBpbmplY3Rvci5cbiAgICAgICAgY29uc3QgZmluYWxQYXJlbnRJbmplY3RvciA9IHBhcmVudEluamVjdG9yIHx8IG1vZHVsZUluamVjdG9yICE7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIFwidG9wLWxldmVsXCIgQW5ndWxhciBjb21wb25lbnQgb3IgdGhlIHBhcmVudCBjb21wb25lbnQgbWF5IGJlbG9uZyB0byBhXG4gICAgICAgIC8vIGRpZmZlcmVudCBgTmdNb2R1bGVgLCB1c2UgdGhlIG1vZHVsZSBpbmplY3RvciBmb3IgbW9kdWxlLXNwZWNpZmljIGRlcGVuZGVuY2llcy5cbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50IHRoYXQgYmVsb25ncyB0byB0aGUgc2FtZSBgTmdNb2R1bGVgLCB1c2UgaXRzIGluamVjdG9yLlxuICAgICAgICBjb25zdCBmaW5hbE1vZHVsZUluamVjdG9yID0gbW9kdWxlSW5qZWN0b3IgfHwgcGFyZW50SW5qZWN0b3IgITtcblxuICAgICAgICBjb25zdCBkb0Rvd25ncmFkZSA9IChpbmplY3RvcjogSW5qZWN0b3IsIG1vZHVsZUluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIC8vIFJldHJpZXZlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgIGZyb20gdGhlIGluamVjdG9yIHRpZWQgdG8gdGhlIGBOZ01vZHVsZWAgdGhpc1xuICAgICAgICAgIC8vIGNvbXBvbmVudCBiZWxvbmdzIHRvLlxuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyID1cbiAgICAgICAgICAgICAgbW9kdWxlSW5qZWN0b3IuZ2V0KENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+ID1cbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGluZm8uY29tcG9uZW50KSAhO1xuXG4gICAgICAgICAgaWYgKCFjb21wb25lbnRGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGluZyBDb21wb25lbnRGYWN0b3J5IGZvcjogJHtnZXRUeXBlTmFtZShpbmZvLmNvbXBvbmVudCl9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaW5qZWN0b3JQcm9taXNlID0gbmV3IFBhcmVudEluamVjdG9yUHJvbWlzZShlbGVtZW50KTtcbiAgICAgICAgICBjb25zdCBmYWNhZGUgPSBuZXcgRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcihcbiAgICAgICAgICAgICAgZWxlbWVudCwgYXR0cnMsIHNjb3BlLCBuZ01vZGVsLCBpbmplY3RvciwgJGluamVjdG9yLCAkY29tcGlsZSwgJHBhcnNlLFxuICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5LCB3cmFwQ2FsbGJhY2spO1xuXG4gICAgICAgICAgY29uc3QgcHJvamVjdGFibGVOb2RlcyA9IGZhY2FkZS5jb21waWxlQ29udGVudHMoKTtcbiAgICAgICAgICBmYWNhZGUuY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXMpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cElucHV0cyhpc05nVXBncmFkZUxpdGUsIGluZm8ucHJvcGFnYXRlRGlnZXN0KTtcbiAgICAgICAgICBmYWNhZGUuc2V0dXBPdXRwdXRzKCk7XG4gICAgICAgICAgZmFjYWRlLnJlZ2lzdGVyQ2xlYW51cCgpO1xuXG4gICAgICAgICAgaW5qZWN0b3JQcm9taXNlLnJlc29sdmUoZmFjYWRlLmdldEluamVjdG9yKCkpO1xuXG4gICAgICAgICAgaWYgKHJhbkFzeW5jKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIHJ1biBhc3luYywgaXQgaXMgcG9zc2libGUgdGhhdCBpdCBpcyBub3QgcnVuIGluc2lkZSBhXG4gICAgICAgICAgICAvLyBkaWdlc3QgYW5kIGluaXRpYWwgaW5wdXQgdmFsdWVzIHdpbGwgbm90IGJlIGRldGVjdGVkLlxuICAgICAgICAgICAgc2NvcGUuJGV2YWxBc3luYygoKSA9PiB7fSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IGRvd25ncmFkZUZuID1cbiAgICAgICAgICAgICFpc05nVXBncmFkZUxpdGUgPyBkb0Rvd25ncmFkZSA6IChwSW5qZWN0b3I6IEluamVjdG9yLCBtSW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghbmdab25lKSB7XG4gICAgICAgICAgICAgICAgbmdab25lID0gcEluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgd3JhcENhbGxiYWNrKCgpID0+IGRvRG93bmdyYWRlKHBJbmplY3RvciwgbUluamVjdG9yKSkoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgaWYgKGlzVGhlbmFibGUoZmluYWxQYXJlbnRJbmplY3RvcikgfHwgaXNUaGVuYWJsZShmaW5hbE1vZHVsZUluamVjdG9yKSkge1xuICAgICAgICAgIFByb21pc2UuYWxsKFtmaW5hbFBhcmVudEluamVjdG9yLCBmaW5hbE1vZHVsZUluamVjdG9yXSlcbiAgICAgICAgICAgICAgLnRoZW4oKFtwSW5qZWN0b3IsIG1JbmplY3Rvcl0pID0+IGRvd25ncmFkZUZuKHBJbmplY3RvciwgbUluamVjdG9yKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG93bmdyYWRlRm4oZmluYWxQYXJlbnRJbmplY3RvciwgZmluYWxNb2R1bGVJbmplY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICByYW5Bc3luYyA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBicmFja2V0LW5vdGF0aW9uIGJlY2F1c2Ugb2YgY2xvc3VyZSAtIHNlZSAjMTQ0NDFcbiAgZGlyZWN0aXZlRmFjdG9yeVsnJGluamVjdCddID0gWyRDT01QSUxFLCAkSU5KRUNUT1IsICRQQVJTRV07XG4gIHJldHVybiBkaXJlY3RpdmVGYWN0b3J5O1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzIHByb21pc2UtbGlrZSBvYmplY3QgdG8gd3JhcCBwYXJlbnQgaW5qZWN0b3JzLFxuICogdG8gcHJlc2VydmUgdGhlIHN5bmNocm9ub3VzIG5hdHVyZSBvZiBBbmd1bGFyIDEncyAkY29tcGlsZS5cbiAqL1xuY2xhc3MgUGFyZW50SW5qZWN0b3JQcm9taXNlIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgaW5qZWN0b3IgITogSW5qZWN0b3I7XG4gIHByaXZhdGUgaW5qZWN0b3JLZXk6IHN0cmluZyA9IGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKTtcbiAgcHJpdmF0ZSBjYWxsYmFja3M6ICgoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAvLyBTdG9yZSB0aGUgcHJvbWlzZSBvbiB0aGUgZWxlbWVudC5cbiAgICBlbGVtZW50LmRhdGEgISh0aGlzLmluamVjdG9yS2V5LCB0aGlzKTtcbiAgfVxuXG4gIHRoZW4oY2FsbGJhY2s6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSkge1xuICAgIGlmICh0aGlzLmluamVjdG9yKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLmluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZShpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG5cbiAgICAvLyBTdG9yZSB0aGUgcmVhbCBpbmplY3RvciBvbiB0aGUgZWxlbWVudC5cbiAgICB0aGlzLmVsZW1lbnQuZGF0YSAhKHRoaXMuaW5qZWN0b3JLZXksIGluamVjdG9yKTtcblxuICAgIC8vIFJlbGVhc2UgdGhlIGVsZW1lbnQgdG8gcHJldmVudCBtZW1vcnkgbGVha3MuXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbCAhO1xuXG4gICAgLy8gUnVuIHRoZSBxdWV1ZWQgY2FsbGJhY2tzLlxuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2soaW5qZWN0b3IpKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVGhlbmFibGU8VD4ob2JqOiBvYmplY3QpOiBvYmogaXMgVGhlbmFibGU8VD4ge1xuICByZXR1cm4gaXNGdW5jdGlvbigob2JqIGFzIGFueSkudGhlbik7XG59XG4iXX0=