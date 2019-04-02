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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi9kb3duZ3JhZGVfY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFtQix3QkFBd0IsRUFBWSxNQUFNLEVBQU8sTUFBTSxlQUFlLENBQUM7QUFHakcsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDM0gsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDeEUsT0FBTyxFQUFnQyxhQUFhLEVBQUUsd0JBQXdCLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7QUFHaEssdUJBRUM7Ozs7OztJQURDLGtEQUF1Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUR6QyxNQUFNLFVBQVUsa0JBQWtCLENBQUMsSUFRbEM7O1VBQ08sZ0JBQWdCOzs7Ozs7SUFBdUIsVUFDekMsUUFBeUIsRUFBRSxTQUEyQixFQUFFLE1BQXFCOzs7Ozs7Ozs7O2NBU3pFLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsaUJBQXdCOztjQUN0RSxZQUFZLEdBQ2QsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7OztRQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLENBQUM7Ozs7UUFBQyxFQUFFLENBQUMsRUFBRTs7O1FBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxD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b3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBJbmplY3RvciwgTmdab25lLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJQW5ub3RhdGVkRnVuY3Rpb24sIElBdHRyaWJ1dGVzLCBJQXVnbWVudGVkSlF1ZXJ5LCBJQ29tcGlsZVNlcnZpY2UsIElEaXJlY3RpdmUsIElJbmplY3RvclNlcnZpY2UsIElOZ01vZGVsQ29udHJvbGxlciwgSVBhcnNlU2VydmljZSwgSVNjb3BlfSBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7JENPTVBJTEUsICRJTkpFQ1RPUiwgJFBBUlNFLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyfSBmcm9tICcuL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlcic7XG5pbXBvcnQge0xhenlNb2R1bGVSZWYsIFVwZ3JhZGVBcHBUeXBlLCBjb250cm9sbGVyS2V5LCBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQsIGdldFR5cGVOYW1lLCBnZXRVcGdyYWRlQXBwVHlwZSwgaXNGdW5jdGlvbiwgdmFsaWRhdGVJbmplY3Rpb25LZXl9IGZyb20gJy4vdXRpbCc7XG5cblxuaW50ZXJmYWNlIFRoZW5hYmxlPFQ+IHtcbiAgdGhlbihjYWxsYmFjazogKHZhbHVlOiBUKSA9PiBhbnkpOiBhbnk7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdGhhdCBhbGxvd3MgYW4gQW5ndWxhciBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXJKUy5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGlzIGhlbHBlciBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0byBiZSB1c2VkIGZvciByZWdpc3RlcmluZ1xuICogYW4gQW5ndWxhckpTIHdyYXBwZXIgZGlyZWN0aXZlIGZvciBcImRvd25ncmFkaW5nXCIgYW4gQW5ndWxhciBjb21wb25lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIExldCdzIGFzc3VtZSB0aGF0IHlvdSBoYXZlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbGxlZCBgbmcySGVyb2VzYCB0aGF0IG5lZWRzXG4gKiB0byBiZSBtYWRlIGF2YWlsYWJsZSBpbiBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYW4gQW5ndWxhckpTIFtkaXJlY3RpdmVdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2d1aWRlL2RpcmVjdGl2ZSlcbiAqIHRoYXQgd2lsbCBtYWtlIHRoaXMgQW5ndWxhciBjb21wb25lbnQgYXZhaWxhYmxlIGluc2lkZSBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICogVGhlIGBkb3duZ3JhZGVDb21wb25lbnQoKWAgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCB3ZVxuICogY2FuIHVzZSB0byBkZWZpbmUgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyB0aGUgXCJkb3duZ3JhZGVkXCIgY29tcG9uZW50LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXdyYXBwZXJcIn1cbiAqXG4gKiBAcGFyYW0gaW5mbyBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQ29tcG9uZW50IHRoYXQgaXMgYmVpbmcgZG93bmdyYWRlZDpcbiAqXG4gKiAtIGBjb21wb25lbnQ6IFR5cGU8YW55PmA6IFRoZSB0eXBlIG9mIHRoZSBDb21wb25lbnQgdGhhdCB3aWxsIGJlIGRvd25ncmFkZWRcbiAqIC0gYGRvd25ncmFkZWRNb2R1bGU/OiBzdHJpbmdgOiBUaGUgbmFtZSBvZiB0aGUgZG93bmdyYWRlZCBtb2R1bGUgKGlmIGFueSkgdGhhdCB0aGUgY29tcG9uZW50XG4gKiAgIFwiYmVsb25ncyB0b1wiLCBhcyByZXR1cm5lZCBieSBhIGNhbGwgdG8gYGRvd25ncmFkZU1vZHVsZSgpYC4gSXQgaXMgdGhlIG1vZHVsZSwgd2hvc2VcbiAqICAgY29ycmVzcG9uZGluZyBBbmd1bGFyIG1vZHVsZSB3aWxsIGJlIGJvb3RzdHJhcHBlZCwgd2hlbiB0aGUgY29tcG9uZW50IG5lZWRzIHRvIGJlIGluc3RhbnRpYXRlZC5cbiAqICAgPGJyIC8+XG4gKiAgIChUaGlzIG9wdGlvbiBpcyBvbmx5IG5lY2Vzc2FyeSB3aGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAgdG8gZG93bmdyYWRlIG1vcmUgdGhhbiBvbmVcbiAqICAgQW5ndWxhciBtb2R1bGUuKVxuICogLSBgcHJvcGFnYXRlRGlnZXN0PzogYm9vbGVhbmA6IFdoZXRoZXIgdG8gcGVyZm9ybSB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JSZWYjZGV0ZWN0Q2hhbmdlc1xuICogICBjaGFuZ2UgZGV0ZWN0aW9ufSBvbiB0aGUgY29tcG9uZW50IG9uIGV2ZXJ5XG4gKiAgIFskZGlnZXN0XShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlIyRkaWdlc3QpLiBJZiBzZXQgdG8gYGZhbHNlYCxcbiAqICAgY2hhbmdlIGRldGVjdGlvbiB3aWxsIHN0aWxsIGJlIHBlcmZvcm1lZCB3aGVuIGFueSBvZiB0aGUgY29tcG9uZW50J3MgaW5wdXRzIGNoYW5nZXMuXG4gKiAgIChEZWZhdWx0OiB0cnVlKVxuICpcbiAqIEByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlZ2lzdGVyIHRoZSBjb21wb25lbnQgaW4gYW5cbiAqIEFuZ3VsYXJKUyBtb2R1bGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZG93bmdyYWRlQ29tcG9uZW50KGluZm86IHtcbiAgY29tcG9uZW50OiBUeXBlPGFueT47IGRvd25ncmFkZWRNb2R1bGU/OiBzdHJpbmc7IHByb3BhZ2F0ZURpZ2VzdD86IGJvb2xlYW47XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgaW5wdXRzPzogc3RyaW5nW107XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgb3V0cHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIHNlbGVjdG9ycz86IHN0cmluZ1tdO1xufSk6IGFueSAvKiBhbmd1bGFyLklJbmplY3RhYmxlICovIHtcbiAgY29uc3QgZGlyZWN0aXZlRmFjdG9yeTogSUFubm90YXRlZEZ1bmN0aW9uID0gZnVuY3Rpb24oXG4gICAgICAkY29tcGlsZTogSUNvbXBpbGVTZXJ2aWNlLCAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UsICRwYXJzZTogSVBhcnNlU2VydmljZSk6IElEaXJlY3RpdmUge1xuICAgIC8vIFdoZW4gdXNpbmcgYGRvd25ncmFkZU1vZHVsZSgpYCwgd2UgbmVlZCB0byBoYW5kbGUgY2VydGFpbiB0aGluZ3Mgc3BlY2lhbGx5LiBGb3IgZXhhbXBsZTpcbiAgICAvLyAtIFdlIGFsd2F5cyBuZWVkIHRvIGF0dGFjaCB0aGUgY29tcG9uZW50IHZpZXcgdG8gdGhlIGBBcHBsaWNhdGlvblJlZmAgZm9yIGl0IHRvIGJlXG4gICAgLy8gICBkaXJ0eS1jaGVja2VkLlxuICAgIC8vIC0gV2UgbmVlZCB0byBlbnN1cmUgY2FsbGJhY2tzIHRvIEFuZ3VsYXIgQVBJcyAoZS5nLiBjaGFuZ2UgZGV0ZWN0aW9uKSBhcmUgcnVuIGluc2lkZSB0aGVcbiAgICAvLyAgIEFuZ3VsYXIgem9uZS5cbiAgICAvLyAgIE5PVEU6IFRoaXMgaXMgbm90IG5lZWRlZCwgd2hlbiB1c2luZyBgVXBncmFkZU1vZHVsZWAsIGJlY2F1c2UgYCRkaWdlc3QoKWAgd2lsbCBiZSBydW5cbiAgICAvLyAgICAgICAgIGluc2lkZSB0aGUgQW5ndWxhciB6b25lIChleGNlcHQgaWYgZXhwbGljaXRseSBlc2NhcGVkLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZG4ndFxuICAgIC8vICAgICAgICAgZm9yY2UgaXQgYmFjayBpbikuXG4gICAgY29uc3QgaXNOZ1VwZ3JhZGVMaXRlID0gZ2V0VXBncmFkZUFwcFR5cGUoJGluamVjdG9yKSA9PT0gVXBncmFkZUFwcFR5cGUuTGl0ZTtcbiAgICBjb25zdCB3cmFwQ2FsbGJhY2s6IDxUPihjYjogKCkgPT4gVCkgPT4gdHlwZW9mIGNiID1cbiAgICAgICAgIWlzTmdVcGdyYWRlTGl0ZSA/IGNiID0+IGNiIDogY2IgPT4gKCkgPT4gTmdab25lLmlzSW5Bbmd1bGFyWm9uZSgpID8gY2IoKSA6IG5nWm9uZS5ydW4oY2IpO1xuICAgIGxldCBuZ1pvbmU6IE5nWm9uZTtcblxuICAgIC8vIFdoZW4gZG93bmdyYWRpbmcgbXVsdGlwbGUgbW9kdWxlcywgc3BlY2lhbCBoYW5kbGluZyBpcyBuZWVkZWQgd3J0IGluamVjdG9ycy5cbiAgICBjb25zdCBoYXNNdWx0aXBsZURvd25ncmFkZWRNb2R1bGVzID1cbiAgICAgICAgaXNOZ1VwZ3JhZGVMaXRlICYmIChnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQoJGluamVjdG9yKSA+IDEpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6IFtSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMXSxcbiAgICAgIGxpbms6IChzY29wZTogSVNjb3BlLCBlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogSUF0dHJpYnV0ZXMsIHJlcXVpcmVkOiBhbnlbXSkgPT4ge1xuICAgICAgICAvLyBXZSBtaWdodCBoYXZlIHRvIGNvbXBpbGUgdGhlIGNvbnRlbnRzIGFzeW5jaHJvbm91c2x5LCBiZWNhdXNlIHRoaXMgbWlnaHQgaGF2ZSBiZWVuXG4gICAgICAgIC8vIHRyaWdnZXJlZCBieSBgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyYCwgYmVmb3JlIHRoZSBBbmd1bGFyIHRlbXBsYXRlcyBoYXZlXG4gICAgICAgIC8vIGJlZW4gY29tcGlsZWQuXG5cbiAgICAgICAgY29uc3QgbmdNb2RlbDogSU5nTW9kZWxDb250cm9sbGVyID0gcmVxdWlyZWRbMV07XG4gICAgICAgIGNvbnN0IHBhcmVudEluamVjdG9yOiBJbmplY3RvcnxUaGVuYWJsZTxJbmplY3Rvcj58dW5kZWZpbmVkID0gcmVxdWlyZWRbMF07XG4gICAgICAgIGxldCBtb2R1bGVJbmplY3RvcjogSW5qZWN0b3J8VGhlbmFibGU8SW5qZWN0b3I+fHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHJhbkFzeW5jID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFwYXJlbnRJbmplY3RvciB8fCBoYXNNdWx0aXBsZURvd25ncmFkZWRNb2R1bGVzKSB7XG4gICAgICAgICAgY29uc3QgZG93bmdyYWRlZE1vZHVsZSA9IGluZm8uZG93bmdyYWRlZE1vZHVsZSB8fCAnJztcbiAgICAgICAgICBjb25zdCBsYXp5TW9kdWxlUmVmS2V5ID0gYCR7TEFaWV9NT0RVTEVfUkVGfSR7ZG93bmdyYWRlZE1vZHVsZX1gO1xuICAgICAgICAgIGNvbnN0IGF0dGVtcHRlZEFjdGlvbiA9IGBpbnN0YW50aWF0aW5nIGNvbXBvbmVudCAnJHtnZXRUeXBlTmFtZShpbmZvLmNvbXBvbmVudCl9J2A7XG5cbiAgICAgICAgICB2YWxpZGF0ZUluamVjdGlvbktleSgkaW5qZWN0b3IsIGRvd25ncmFkZWRNb2R1bGUsIGxhenlNb2R1bGVSZWZLZXksIGF0dGVtcHRlZEFjdGlvbik7XG5cbiAgICAgICAgICBjb25zdCBsYXp5TW9kdWxlUmVmID0gJGluamVjdG9yLmdldChsYXp5TW9kdWxlUmVmS2V5KSBhcyBMYXp5TW9kdWxlUmVmO1xuICAgICAgICAgIG1vZHVsZUluamVjdG9yID0gbGF6eU1vZHVsZVJlZi5pbmplY3RvciB8fCBsYXp5TW9kdWxlUmVmLnByb21pc2UgYXMgUHJvbWlzZTxJbmplY3Rvcj47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RlczpcbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlcmUgYXJlIHR3byBpbmplY3RvcnM6IGBmaW5hbE1vZHVsZUluamVjdG9yYCBhbmQgYGZpbmFsUGFyZW50SW5qZWN0b3JgICh0aGV5IG1pZ2h0IGJlXG4gICAgICAgIC8vIHRoZSBzYW1lIGluc3RhbmNlLCBidXQgdGhhdCBpcyBpcnJlbGV2YW50KTpcbiAgICAgICAgLy8gLSBgZmluYWxNb2R1bGVJbmplY3RvcmAgaXMgdXNlZCB0byByZXRyaWV2ZSBgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyYCwgdGh1cyBpdCBtdXN0IGJlXG4gICAgICAgIC8vICAgb24gdGhlIHNhbWUgdHJlZSBhcyB0aGUgYE5nTW9kdWxlYCB0aGF0IGRlY2xhcmVzIHRoaXMgZG93bmdyYWRlZCBjb21wb25lbnQuXG4gICAgICAgIC8vIC0gYGZpbmFsUGFyZW50SW5qZWN0b3JgIGlzIHVzZWQgZm9yIGFsbCBvdGhlciBpbmplY3Rpb24gcHVycG9zZXMuXG4gICAgICAgIC8vICAgKE5vdGUgdGhhdCBBbmd1bGFyIGtub3dzIHRvIG9ubHkgdHJhdmVyc2UgdGhlIGNvbXBvbmVudC10cmVlIHBhcnQgb2YgdGhhdCBpbmplY3RvcixcbiAgICAgICAgLy8gICB3aGVuIGxvb2tpbmcgZm9yIGFuIGluamVjdGFibGUgYW5kIHRoZW4gc3dpdGNoIHRvIHRoZSBtb2R1bGUgaW5qZWN0b3IuKVxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGVyZSBhcmUgYmFzaWNhbGx5IHRocmVlIGNhc2VzOlxuICAgICAgICAvLyAtIElmIHRoZXJlIGlzIG5vIHBhcmVudCBjb21wb25lbnQgKHRodXMgbm8gYHBhcmVudEluamVjdG9yYCksIHdlIGJvb3RzdHJhcCB0aGUgZG93bmdyYWRlZFxuICAgICAgICAvLyAgIGBOZ01vZHVsZWAgYW5kIHVzZSBpdHMgaW5qZWN0b3IgYXMgYm90aCBgZmluYWxNb2R1bGVJbmplY3RvcmAgYW5kXG4gICAgICAgIC8vICAgYGZpbmFsUGFyZW50SW5qZWN0b3JgLlxuICAgICAgICAvLyAtIElmIHRoZXJlIGlzIGEgcGFyZW50IGNvbXBvbmVudCAoYW5kIHRodXMgYSBgcGFyZW50SW5qZWN0b3JgKSBhbmQgd2UgYXJlIHN1cmUgdGhhdCBpdFxuICAgICAgICAvLyAgIGJlbG9uZ3MgdG8gdGhlIHNhbWUgYE5nTW9kdWxlYCBhcyB0aGlzIGRvd25ncmFkZWQgY29tcG9uZW50IChlLmcuIGJlY2F1c2UgdGhlcmUgaXMgb25seVxuICAgICAgICAvLyAgIG9uZSBkb3duZ3JhZGVkIG1vZHVsZSwgd2UgdXNlIHRoYXQgYHBhcmVudEluamVjdG9yYCBhcyBib3RoIGBmaW5hbE1vZHVsZUluamVjdG9yYCBhbmRcbiAgICAgICAgLy8gICBgZmluYWxQYXJlbnRJbmplY3RvcmAuXG4gICAgICAgIC8vIC0gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50LCBidXQgaXQgbWF5IGJlbG9uZyB0byBhIGRpZmZlcmVudCBgTmdNb2R1bGVgLCB0aGVuIHdlXG4gICAgICAgIC8vICAgdXNlIHRoZSBgcGFyZW50SW5qZWN0b3JgIGFzIGBmaW5hbFBhcmVudEluamVjdG9yYCBhbmQgdGhpcyBkb3duZ3JhZGVkIGNvbXBvbmVudCdzXG4gICAgICAgIC8vICAgZGVjbGFyaW5nIGBOZ01vZHVsZWAncyBpbmplY3RvciBhcyBgZmluYWxNb2R1bGVJbmplY3RvcmAuXG4gICAgICAgIC8vICAgTm90ZSAxOiBJZiB0aGUgYE5nTW9kdWxlYCBpcyBhbHJlYWR5IGJvb3RzdHJhcHBlZCwgd2UganVzdCBnZXQgaXRzIGluamVjdG9yICh3ZSBkb24ndFxuICAgICAgICAvLyAgICAgICAgICAgYm9vdHN0cmFwIGFnYWluKS5cbiAgICAgICAgLy8gICBOb3RlIDI6IEl0IGlzIHBvc3NpYmxlIHRoYXQgKHdoaWxlIHRoZXJlIGFyZSBtdWx0aXBsZSBkb3duZ3JhZGVkIG1vZHVsZXMpIHRoaXNcbiAgICAgICAgLy8gICAgICAgICAgIGRvd25ncmFkZWQgY29tcG9uZW50IGFuZCBpdHMgcGFyZW50IGNvbXBvbmVudCBib3RoIGJlbG9uZyB0byB0aGUgc2FtZSBOZ01vZHVsZS5cbiAgICAgICAgLy8gICAgICAgICAgIEluIHRoYXQgY2FzZSwgd2UgY291bGQgaGF2ZSB1c2VkIHRoZSBgcGFyZW50SW5qZWN0b3JgIGFzIGJvdGhcbiAgICAgICAgLy8gICAgICAgICAgIGBmaW5hbE1vZHVsZUluamVjdG9yYCBhbmQgYGZpbmFsUGFyZW50SW5qZWN0b3JgLCBidXQgKGZvciBzaW1wbGljaXR5KSB3ZSBhcmVcbiAgICAgICAgLy8gICAgICAgICAgIHRyZWF0aW5nIHRoaXMgY2FzZSBhcyBpZiB0aGV5IGJlbG9uZyB0byBkaWZmZXJlbnQgYE5nTW9kdWxlYHMuIFRoYXQgZG9lc24ndFxuICAgICAgICAvLyAgICAgICAgICAgcmVhbGx5IGFmZmVjdCBhbnl0aGluZywgc2luY2UgYHBhcmVudEluamVjdG9yYCBoYXMgYG1vZHVsZUluamVjdG9yYCBhcyBhbmNlc3RvclxuICAgICAgICAvLyAgICAgICAgICAgYW5kIHRyeWluZyB0byByZXNvbHZlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgIGZyb20gZWl0aGVyIG9uZSB3aWxsIHJldHVyblxuICAgICAgICAvLyAgICAgICAgICAgdGhlIHNhbWUgaW5zdGFuY2UuXG5cbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50LCB1c2UgaXRzIGluamVjdG9yIGFzIHBhcmVudCBpbmplY3Rvci5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIFwidG9wLWxldmVsXCIgQW5ndWxhciBjb21wb25lbnQsIHVzZSB0aGUgbW9kdWxlIGluamVjdG9yLlxuICAgICAgICBjb25zdCBmaW5hbFBhcmVudEluamVjdG9yID0gcGFyZW50SW5qZWN0b3IgfHwgbW9kdWxlSW5qZWN0b3IgITtcblxuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgXCJ0b3AtbGV2ZWxcIiBBbmd1bGFyIGNvbXBvbmVudCBvciB0aGUgcGFyZW50IGNvbXBvbmVudCBtYXkgYmVsb25nIHRvIGFcbiAgICAgICAgLy8gZGlmZmVyZW50IGBOZ01vZHVsZWAsIHVzZSB0aGUgbW9kdWxlIGluamVjdG9yIGZvciBtb2R1bGUtc3BlY2lmaWMgZGVwZW5kZW5jaWVzLlxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHBhcmVudCBjb21wb25lbnQgdGhhdCBiZWxvbmdzIHRvIHRoZSBzYW1lIGBOZ01vZHVsZWAsIHVzZSBpdHMgaW5qZWN0b3IuXG4gICAgICAgIGNvbnN0IGZpbmFsTW9kdWxlSW5qZWN0b3IgPSBtb2R1bGVJbmplY3RvciB8fCBwYXJlbnRJbmplY3RvciAhO1xuXG4gICAgICAgIGNvbnN0IGRvRG93bmdyYWRlID0gKGluamVjdG9yOiBJbmplY3RvciwgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgLy8gUmV0cmlldmUgYENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcmAgZnJvbSB0aGUgaW5qZWN0b3IgdGllZCB0byB0aGUgYE5nTW9kdWxlYCB0aGlzXG4gICAgICAgICAgLy8gY29tcG9uZW50IGJlbG9uZ3MgdG8uXG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgPVxuICAgICAgICAgICAgICBtb2R1bGVJbmplY3Rvci5nZXQoQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyKTtcbiAgICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4gPVxuICAgICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoaW5mby5jb21wb25lbnQpICE7XG5cbiAgICAgICAgICBpZiAoIWNvbXBvbmVudEZhY3RvcnkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0aW5nIENvbXBvbmVudEZhY3RvcnkgZm9yOiAke2dldFR5cGVOYW1lKGluZm8uY29tcG9uZW50KX1gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpbmplY3RvclByb21pc2UgPSBuZXcgUGFyZW50SW5qZWN0b3JQcm9taXNlKGVsZW1lbnQpO1xuICAgICAgICAgIGNvbnN0IGZhY2FkZSA9IG5ldyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyKFxuICAgICAgICAgICAgICBlbGVtZW50LCBhdHRycywgc2NvcGUsIG5nTW9kZWwsIGluamVjdG9yLCAkaW5qZWN0b3IsICRjb21waWxlLCAkcGFyc2UsXG4gICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnksIHdyYXBDYWxsYmFjayk7XG5cbiAgICAgICAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzID0gZmFjYWRlLmNvbXBpbGVDb250ZW50cygpO1xuICAgICAgICAgIGZhY2FkZS5jcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2Rlcyk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwSW5wdXRzKGlzTmdVcGdyYWRlTGl0ZSwgaW5mby5wcm9wYWdhdGVEaWdlc3QpO1xuICAgICAgICAgIGZhY2FkZS5zZXR1cE91dHB1dHMoKTtcbiAgICAgICAgICBmYWNhZGUucmVnaXN0ZXJDbGVhbnVwKCk7XG5cbiAgICAgICAgICBpbmplY3RvclByb21pc2UucmVzb2x2ZShmYWNhZGUuZ2V0SW5qZWN0b3IoKSk7XG5cbiAgICAgICAgICBpZiAocmFuQXN5bmMpIHtcbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgcnVuIGFzeW5jLCBpdCBpcyBwb3NzaWJsZSB0aGF0IGl0IGlzIG5vdCBydW4gaW5zaWRlIGFcbiAgICAgICAgICAgIC8vIGRpZ2VzdCBhbmQgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgd2lsbCBub3QgYmUgZGV0ZWN0ZWQuXG4gICAgICAgICAgICBzY29wZS4kZXZhbEFzeW5jKCgpID0+IHt9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZG93bmdyYWRlRm4gPVxuICAgICAgICAgICAgIWlzTmdVcGdyYWRlTGl0ZSA/IGRvRG93bmdyYWRlIDogKHBJbmplY3RvcjogSW5qZWN0b3IsIG1JbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFuZ1pvbmUpIHtcbiAgICAgICAgICAgICAgICBuZ1pvbmUgPSBwSW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB3cmFwQ2FsbGJhY2soKCkgPT4gZG9Eb3duZ3JhZGUocEluamVjdG9yLCBtSW5qZWN0b3IpKSgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNUaGVuYWJsZShmaW5hbFBhcmVudEluamVjdG9yKSB8fCBpc1RoZW5hYmxlKGZpbmFsTW9kdWxlSW5qZWN0b3IpKSB7XG4gICAgICAgICAgUHJvbWlzZS5hbGwoW2ZpbmFsUGFyZW50SW5qZWN0b3IsIGZpbmFsTW9kdWxlSW5qZWN0b3JdKVxuICAgICAgICAgICAgICAudGhlbigoW3BJbmplY3RvciwgbUluamVjdG9yXSkgPT4gZG93bmdyYWRlRm4ocEluamVjdG9yLCBtSW5qZWN0b3IpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb3duZ3JhZGVGbihmaW5hbFBhcmVudEluamVjdG9yLCBmaW5hbE1vZHVsZUluamVjdG9yKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJhbkFzeW5jID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIGJyYWNrZXQtbm90YXRpb24gYmVjYXVzZSBvZiBjbG9zdXJlIC0gc2VlICMxNDQ0MVxuICBkaXJlY3RpdmVGYWN0b3J5WyckaW5qZWN0J10gPSBbJENPTVBJTEUsICRJTkpFQ1RPUiwgJFBBUlNFXTtcbiAgcmV0dXJuIGRpcmVjdGl2ZUZhY3Rvcnk7XG59XG5cbi8qKlxuICogU3luY2hyb25vdXMgcHJvbWlzZS1saWtlIG9iamVjdCB0byB3cmFwIHBhcmVudCBpbmplY3RvcnMsXG4gKiB0byBwcmVzZXJ2ZSB0aGUgc3luY2hyb25vdXMgbmF0dXJlIG9mIEFuZ3VsYXIgMSdzICRjb21waWxlLlxuICovXG5jbGFzcyBQYXJlbnRJbmplY3RvclByb21pc2Uge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBpbmplY3RvciAhOiBJbmplY3RvcjtcbiAgcHJpdmF0ZSBpbmplY3RvcktleTogc3RyaW5nID0gY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpO1xuICBwcml2YXRlIGNhbGxiYWNrczogKChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSlbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgIC8vIFN0b3JlIHRoZSBwcm9taXNlIG9uIHRoZSBlbGVtZW50LlxuICAgIGVsZW1lbnQuZGF0YSAhKHRoaXMuaW5qZWN0b3JLZXksIHRoaXMpO1xuICB9XG5cbiAgdGhlbihjYWxsYmFjazogKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KSB7XG4gICAgaWYgKHRoaXMuaW5qZWN0b3IpIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMuaW5qZWN0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZXNvbHZlKGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMuaW5qZWN0b3IgPSBpbmplY3RvcjtcblxuICAgIC8vIFN0b3JlIHRoZSByZWFsIGluamVjdG9yIG9uIHRoZSBlbGVtZW50LlxuICAgIHRoaXMuZWxlbWVudC5kYXRhICEodGhpcy5pbmplY3RvcktleSwgaW5qZWN0b3IpO1xuXG4gICAgLy8gUmVsZWFzZSB0aGUgZWxlbWVudCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrcy5cbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsICE7XG5cbiAgICAvLyBSdW4gdGhlIHF1ZXVlZCBjYWxsYmFja3MuXG4gICAgdGhpcy5jYWxsYmFja3MuZm9yRWFjaChjYWxsYmFjayA9PiBjYWxsYmFjayhpbmplY3RvcikpO1xuICAgIHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNUaGVuYWJsZTxUPihvYmo6IG9iamVjdCk6IG9iaiBpcyBUaGVuYWJsZTxUPiB7XG4gIHJldHVybiBpc0Z1bmN0aW9uKChvYmogYXMgYW55KS50aGVuKTtcbn1cbiJdfQ==