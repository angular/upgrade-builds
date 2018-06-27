/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
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
function Thenable_tsickle_Closure_declarations() {
    /** @type {?} */
    Thenable.prototype.then;
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
    const /** @type {?} */ directiveFactory = function ($compile, $injector, $parse) {
        // When using `UpgradeModule`, we don't need to ensure callbacks to Angular APIs (e.g. change
        // detection) are run inside the Angular zone, because `$digest()` will be run inside the zone
        // (except if explicitly escaped, in which case we shouldn't force it back in).
        // When using `downgradeModule()` though, we need to ensure such callbacks are run inside the
        // Angular zone.
        let /** @type {?} */ needsNgZone = false;
        let /** @type {?} */ wrapCallback = (cb) => cb;
        let /** @type {?} */ ngZone;
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: (scope, element, attrs, required) => {
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                const /** @type {?} */ ngModel = required[1];
                let /** @type {?} */ parentInjector = required[0];
                let /** @type {?} */ ranAsync = false;
                if (!parentInjector) {
                    const /** @type {?} */ lazyModuleRef = /** @type {?} */ ($injector.get(LAZY_MODULE_REF));
                    needsNgZone = lazyModuleRef.needsNgZone;
                    parentInjector = lazyModuleRef.injector || /** @type {?} */ (lazyModuleRef.promise);
                }
                const /** @type {?} */ doDowngrade = (injector) => {
                    const /** @type {?} */ componentFactoryResolver = injector.get(ComponentFactoryResolver);
                    const /** @type {?} */ componentFactory = /** @type {?} */ ((componentFactoryResolver.resolveComponentFactory(info.component)));
                    if (!componentFactory) {
                        throw new Error('Expecting ComponentFactory for: ' + getComponentName(info.component));
                    }
                    const /** @type {?} */ injectorPromise = new ParentInjectorPromise(element);
                    const /** @type {?} */ facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory, wrapCallback);
                    const /** @type {?} */ projectableNodes = facade.compileContents();
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
                const /** @type {?} */ downgradeFn = !needsNgZone ? doDowngrade : (injector) => {
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
function ParentInjectorPromise_tsickle_Closure_declarations() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBbUIsd0JBQXdCLEVBQVksTUFBTSxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBR2pHLE9BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzNILE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBZ0IsYUFBYSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThDbEYsTUFBTSw2QkFBNkIsSUFVbEM7SUFDQyx1QkFBTSxnQkFBZ0IsR0FDVyxVQUNJLFFBQWlDLEVBQ2pDLFNBQW1DLEVBQ25DLE1BQTZCOzs7Ozs7UUFNaEUscUJBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixxQkFBSSxZQUFZLEdBQUcsQ0FBSSxFQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxQyxxQkFBSSxNQUFjLENBQUM7UUFFbkIsTUFBTSxDQUFDO1lBQ0wsUUFBUSxFQUFFLEdBQUc7WUFDYixRQUFRLEVBQUUsSUFBSTtZQUNkLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDO1lBQzdDLElBQUksRUFBRSxDQUFDLEtBQXFCLEVBQUUsT0FBaUMsRUFBRSxLQUEwQixFQUNwRixRQUFlLEVBQUUsRUFBRTs7OztnQkFLeEIsdUJBQU0sT0FBTyxHQUEr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QUFNLENBQUMsVUFBVSxDQUFDLG1CQUFDLEdBQVUsRUFBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSW5qZWN0b3IsIE5nWm9uZSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRDT01QSUxFLCAkSU5KRUNUT1IsICRQQVJTRSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIFJFUVVJUkVfSU5KRUNUT1IsIFJFUVVJUkVfTkdfTU9ERUx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcn0gZnJvbSAnLi9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXInO1xuaW1wb3J0IHtMYXp5TW9kdWxlUmVmLCBjb250cm9sbGVyS2V5LCBnZXRDb21wb25lbnROYW1lLCBpc0Z1bmN0aW9ufSBmcm9tICcuL3V0aWwnO1xuXG5cbmludGVyZmFjZSBUaGVuYWJsZTxUPiB7XG4gIHRoZW4oY2FsbGJhY2s6ICh2YWx1ZTogVCkgPT4gYW55KTogYW55O1xufVxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgYWxsb3dzIGFuIEFuZ3VsYXIgY29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFySlMuXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUlMkZzdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBb1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdG8gYmUgdXNlZCBmb3IgcmVnaXN0ZXJpbmdcbiAqIGFuIEFuZ3VsYXJKUyB3cmFwcGVyIGRpcmVjdGl2ZSBmb3IgXCJkb3duZ3JhZGluZ1wiIGFuIEFuZ3VsYXIgY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIExldCdzIGFzc3VtZSB0aGF0IHlvdSBoYXZlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbGxlZCBgbmcySGVyb2VzYCB0aGF0IG5lZWRzXG4gKiB0byBiZSBtYWRlIGF2YWlsYWJsZSBpbiBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYW4gQW5ndWxhckpTIFtkaXJlY3RpdmVdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2d1aWRlL2RpcmVjdGl2ZSlcbiAqIHRoYXQgd2lsbCBtYWtlIHRoaXMgQW5ndWxhciBjb21wb25lbnQgYXZhaWxhYmxlIGluc2lkZSBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICogVGhlIGBkb3duZ3JhZGVDb21wb25lbnQoKWAgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCB3ZVxuICogY2FuIHVzZSB0byBkZWZpbmUgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyB0aGUgXCJkb3duZ3JhZGVkXCIgY29tcG9uZW50LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXdyYXBwZXJcIn1cbiAqXG4gKiBAcGFyYW0gaW5mbyBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQ29tcG9uZW50IHRoYXQgaXMgYmVpbmcgZG93bmdyYWRlZDpcbiAqXG4gKiAqIGBjb21wb25lbnQ6IFR5cGU8YW55PmA6IFRoZSB0eXBlIG9mIHRoZSBDb21wb25lbnQgdGhhdCB3aWxsIGJlIGRvd25ncmFkZWRcbiAqICogYHByb3BhZ2F0ZURpZ2VzdD86IGJvb2xlYW5gOiBXaGV0aGVyIHRvIHBlcmZvcm0ge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGVjdENoYW5nZXNcbiAqICAgY2hhbmdlIGRldGVjdGlvbn0gb24gdGhlIGNvbXBvbmVudCBvbiBldmVyeVxuICogICBbJGRpZ2VzdF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KS4gSWYgc2V0IHRvIGBmYWxzZWAsXG4gKiAgIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBzdGlsbCBiZSBwZXJmb3JtZWQgd2hlbiBhbnkgb2YgdGhlIGNvbXBvbmVudCdzIGlucHV0cyBjaGFuZ2VzLlxuICogICAoRGVmYXVsdDogdHJ1ZSlcbiAqXG4gKiBAcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGluIGFuXG4gKiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUNvbXBvbmVudChpbmZvOiB7XG4gIGNvbXBvbmVudDogVHlwZTxhbnk+O1xuICAvKiogQGV4cGVyaW1lbnRhbCAqL1xuICBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIGlucHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIG91dHB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBzZWxlY3RvcnM/OiBzdHJpbmdbXTtcbn0pOiBhbnkgLyogYW5ndWxhci5JSW5qZWN0YWJsZSAqLyB7XG4gIGNvbnN0IGRpcmVjdGl2ZUZhY3Rvcnk6XG4gICAgICBhbmd1bGFyLklBbm5vdGF0ZWRGdW5jdGlvbiA9IGZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSk6IGFuZ3VsYXIuSURpcmVjdGl2ZSB7XG4gICAgLy8gV2hlbiB1c2luZyBgVXBncmFkZU1vZHVsZWAsIHdlIGRvbid0IG5lZWQgdG8gZW5zdXJlIGNhbGxiYWNrcyB0byBBbmd1bGFyIEFQSXMgKGUuZy4gY2hhbmdlXG4gICAgLy8gZGV0ZWN0aW9uKSBhcmUgcnVuIGluc2lkZSB0aGUgQW5ndWxhciB6b25lLCBiZWNhdXNlIGAkZGlnZXN0KClgIHdpbGwgYmUgcnVuIGluc2lkZSB0aGUgem9uZVxuICAgIC8vIChleGNlcHQgaWYgZXhwbGljaXRseSBlc2NhcGVkLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZG4ndCBmb3JjZSBpdCBiYWNrIGluKS5cbiAgICAvLyBXaGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAgdGhvdWdoLCB3ZSBuZWVkIHRvIGVuc3VyZSBzdWNoIGNhbGxiYWNrcyBhcmUgcnVuIGluc2lkZSB0aGVcbiAgICAvLyBBbmd1bGFyIHpvbmUuXG4gICAgbGV0IG5lZWRzTmdab25lID0gZmFsc2U7XG4gICAgbGV0IHdyYXBDYWxsYmFjayA9IDxUPihjYjogKCkgPT4gVCkgPT4gY2I7XG4gICAgbGV0IG5nWm9uZTogTmdab25lO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6IFtSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMXSxcbiAgICAgIGxpbms6IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgcmVxdWlyZWQ6IGFueVtdKSA9PiB7XG4gICAgICAgIC8vIFdlIG1pZ2h0IGhhdmUgdG8gY29tcGlsZSB0aGUgY29udGVudHMgYXN5bmNocm9ub3VzbHksIGJlY2F1c2UgdGhpcyBtaWdodCBoYXZlIGJlZW5cbiAgICAgICAgLy8gdHJpZ2dlcmVkIGJ5IGBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJgLCBiZWZvcmUgdGhlIEFuZ3VsYXIgdGVtcGxhdGVzIGhhdmVcbiAgICAgICAgLy8gYmVlbiBjb21waWxlZC5cblxuICAgICAgICBjb25zdCBuZ01vZGVsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciA9IHJlcXVpcmVkWzFdO1xuICAgICAgICBsZXQgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yfFRoZW5hYmxlPEluamVjdG9yPnx1bmRlZmluZWQgPSByZXF1aXJlZFswXTtcbiAgICAgICAgbGV0IHJhbkFzeW5jID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFwYXJlbnRJbmplY3Rvcikge1xuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWYgPSAkaW5qZWN0b3IuZ2V0KExBWllfTU9EVUxFX1JFRikgYXMgTGF6eU1vZHVsZVJlZjtcbiAgICAgICAgICBuZWVkc05nWm9uZSA9IGxhenlNb2R1bGVSZWYubmVlZHNOZ1pvbmU7XG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IgPSBsYXp5TW9kdWxlUmVmLmluamVjdG9yIHx8IGxhenlNb2R1bGVSZWYucHJvbWlzZSBhcyBQcm9taXNlPEluamVjdG9yPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRvRG93bmdyYWRlID0gKGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyID1cbiAgICAgICAgICAgICAgaW5qZWN0b3IuZ2V0KENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+ID1cbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGluZm8uY29tcG9uZW50KSAhO1xuXG4gICAgICAgICAgaWYgKCFjb21wb25lbnRGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGluZyBDb21wb25lbnRGYWN0b3J5IGZvcjogJyArIGdldENvbXBvbmVudE5hbWUoaW5mby5jb21wb25lbnQpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpbmplY3RvclByb21pc2UgPSBuZXcgUGFyZW50SW5qZWN0b3JQcm9taXNlKGVsZW1lbnQpO1xuICAgICAgICAgIGNvbnN0IGZhY2FkZSA9IG5ldyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyKFxuICAgICAgICAgICAgICBlbGVtZW50LCBhdHRycywgc2NvcGUsIG5nTW9kZWwsIGluamVjdG9yLCAkaW5qZWN0b3IsICRjb21waWxlLCAkcGFyc2UsXG4gICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnksIHdyYXBDYWxsYmFjayk7XG5cbiAgICAgICAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzID0gZmFjYWRlLmNvbXBpbGVDb250ZW50cygpO1xuICAgICAgICAgIGZhY2FkZS5jcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2Rlcyk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwSW5wdXRzKG5lZWRzTmdab25lLCBpbmZvLnByb3BhZ2F0ZURpZ2VzdCk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwT3V0cHV0cygpO1xuICAgICAgICAgIGZhY2FkZS5yZWdpc3RlckNsZWFudXAoKTtcblxuICAgICAgICAgIGluamVjdG9yUHJvbWlzZS5yZXNvbHZlKGZhY2FkZS5nZXRJbmplY3RvcigpKTtcblxuICAgICAgICAgIGlmIChyYW5Bc3luYykge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBydW4gYXN5bmMsIGl0IGlzIHBvc3NpYmxlIHRoYXQgaXQgaXMgbm90IHJ1biBpbnNpZGUgYVxuICAgICAgICAgICAgLy8gZGlnZXN0IGFuZCBpbml0aWFsIGlucHV0IHZhbHVlcyB3aWxsIG5vdCBiZSBkZXRlY3RlZC5cbiAgICAgICAgICAgIHNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge30pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkb3duZ3JhZGVGbiA9ICFuZWVkc05nWm9uZSA/IGRvRG93bmdyYWRlIDogKGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIGlmICghbmdab25lKSB7XG4gICAgICAgICAgICBuZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgICAgIHdyYXBDYWxsYmFjayA9IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT5cbiAgICAgICAgICAgICAgICBOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkgPyBjYigpIDogbmdab25lLnJ1bihjYik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd3JhcENhbGxiYWNrKCgpID0+IGRvRG93bmdyYWRlKGluamVjdG9yKSkoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNUaGVuYWJsZTxJbmplY3Rvcj4ocGFyZW50SW5qZWN0b3IpKSB7XG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IudGhlbihkb3duZ3JhZGVGbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG93bmdyYWRlRm4ocGFyZW50SW5qZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmFuQXN5bmMgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gYnJhY2tldC1ub3RhdGlvbiBiZWNhdXNlIG9mIGNsb3N1cmUgLSBzZWUgIzE0NDQxXG4gIGRpcmVjdGl2ZUZhY3RvcnlbJyRpbmplY3QnXSA9IFskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0VdO1xuICByZXR1cm4gZGlyZWN0aXZlRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhciAxJ3MgJGNvbXBpbGUuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSB7XG4gIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcml2YXRlIGluamVjdG9yS2V5OiBzdHJpbmcgPSBjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSk7XG4gIHByaXZhdGUgY2FsbGJhY2tzOiAoKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAvLyBTdG9yZSB0aGUgcHJvbWlzZSBvbiB0aGUgZWxlbWVudC5cbiAgICBlbGVtZW50LmRhdGEgISh0aGlzLmluamVjdG9yS2V5LCB0aGlzKTtcbiAgfVxuXG4gIHRoZW4oY2FsbGJhY2s6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSkge1xuICAgIGlmICh0aGlzLmluamVjdG9yKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLmluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZShpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG5cbiAgICAvLyBTdG9yZSB0aGUgcmVhbCBpbmplY3RvciBvbiB0aGUgZWxlbWVudC5cbiAgICB0aGlzLmVsZW1lbnQuZGF0YSAhKHRoaXMuaW5qZWN0b3JLZXksIGluamVjdG9yKTtcblxuICAgIC8vIFJlbGVhc2UgdGhlIGVsZW1lbnQgdG8gcHJldmVudCBtZW1vcnkgbGVha3MuXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbCAhO1xuXG4gICAgLy8gUnVuIHRoZSBxdWV1ZWQgY2FsbGJhY2tzLlxuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2soaW5qZWN0b3IpKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVGhlbmFibGU8VD4ob2JqOiBvYmplY3QpOiBvYmogaXMgVGhlbmFibGU8VD4ge1xuICByZXR1cm4gaXNGdW5jdGlvbigob2JqIGFzIGFueSkudGhlbik7XG59XG4iXX0=