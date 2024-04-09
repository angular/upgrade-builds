/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver, NgZone } from '@angular/core';
import { $COMPILE, $INJECTOR, $PARSE, INJECTOR_KEY, LAZY_MODULE_REF, REQUIRE_INJECTOR, REQUIRE_NG_MODEL, } from './constants';
import { DowngradeComponentAdapter } from './downgrade_component_adapter';
import { SyncPromise } from './promise_util';
import { controllerKey, getDowngradedModuleCount, getTypeName, getUpgradeAppType, validateInjectionKey, } from './util';
/**
 * @description
 *
 * A helper function that allows an Angular component to be used from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation*
 *
 * This helper function returns a factory function to be used for registering
 * an AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * @usageNotes
 * ### Examples
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes-wrapper"}
 *
 * For more details and examples on downgrading Angular components to AngularJS components please
 * visit the [Upgrade guide](https://angular.io/guide/upgrade#using-angular-components-from-angularjs-code).
 *
 * @param info contains information about the Component that is being downgraded:
 *
 * - `component: Type<any>`: The type of the Component that will be downgraded
 * - `downgradedModule?: string`: The name of the downgraded module (if any) that the component
 *   "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose
 *   corresponding Angular module will be bootstrapped, when the component needs to be instantiated.
 *   <br />
 *   (This option is only necessary when using `downgradeModule()` to downgrade more than one
 *   Angular module.)
 * - `propagateDigest?: boolean`: Whether to perform {@link ChangeDetectorRef#detectChanges} on the
 * component on every
 *   [$digest](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest). If set to `false`,
 *   change detection will still be performed when any of the component's inputs changes.
 *   (Default: true)
 *
 * @returns a factory function that can be used to register the component in an
 * AngularJS module.
 *
 * @publicApi
 */
export function downgradeComponent(info) {
    const directiveFactory = function ($compile, $injector, $parse) {
        // When using `downgradeModule()`, we need to handle certain things specially. For example:
        // - We always need to attach the component view to the `ApplicationRef` for it to be
        //   dirty-checked.
        // - We need to ensure callbacks to Angular APIs (e.g. change detection) are run inside the
        //   Angular zone.
        //   NOTE: This is not needed, when using `UpgradeModule`, because `$digest()` will be run
        //         inside the Angular zone (except if explicitly escaped, in which case we shouldn't
        //         force it back in).
        const isNgUpgradeLite = getUpgradeAppType($injector) === 3 /* UpgradeAppType.Lite */;
        const wrapCallback = !isNgUpgradeLite
            ? (cb) => cb
            : (cb) => () => (NgZone.isInAngularZone() ? cb() : ngZone.run(cb));
        let ngZone;
        // When downgrading multiple modules, special handling is needed wrt injectors.
        const hasMultipleDowngradedModules = isNgUpgradeLite && getDowngradedModuleCount($injector) > 1;
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            // Controller needs to be set so that `angular-component-router.js` (from beta Angular 2)
            // configuration properties can be made available. See:
            // See G3: javascript/angular2/angular1_router_lib.js
            // https://github.com/angular/angular.js/blob/47bf11ee94664367a26ed8c91b9b586d3dd420f5/src/ng/compile.js#L1670-L1691.
            controller: function () { },
            link: (scope, element, attrs, required) => {
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                const ngModel = required[1];
                const parentInjector = required[0];
                let moduleInjector = undefined;
                let ranAsync = false;
                if (!parentInjector || hasMultipleDowngradedModules) {
                    const downgradedModule = info.downgradedModule || '';
                    const lazyModuleRefKey = `${LAZY_MODULE_REF}${downgradedModule}`;
                    const attemptedAction = `instantiating component '${getTypeName(info.component)}'`;
                    validateInjectionKey($injector, downgradedModule, lazyModuleRefKey, attemptedAction);
                    const lazyModuleRef = $injector.get(lazyModuleRefKey);
                    moduleInjector = lazyModuleRef.injector ?? lazyModuleRef.promise;
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
                const finalParentInjector = parentInjector || moduleInjector;
                // If this is a "top-level" Angular component or the parent component may belong to a
                // different `NgModule`, use the module injector for module-specific dependencies.
                // If there is a parent component that belongs to the same `NgModule`, use its injector.
                const finalModuleInjector = moduleInjector || parentInjector;
                const doDowngrade = (injector, moduleInjector) => {
                    // Retrieve `ComponentFactoryResolver` from the injector tied to the `NgModule` this
                    // component belongs to.
                    const componentFactoryResolver = moduleInjector.get(ComponentFactoryResolver);
                    const componentFactory = componentFactoryResolver.resolveComponentFactory(info.component);
                    if (!componentFactory) {
                        throw new Error(`Expecting ComponentFactory for: ${getTypeName(info.component)}`);
                    }
                    const injectorPromise = new ParentInjectorPromise(element);
                    const facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $compile, $parse, componentFactory, wrapCallback);
                    const projectableNodes = facade.compileContents();
                    const componentRef = facade.createComponentAndSetup(projectableNodes, isNgUpgradeLite, info.propagateDigest);
                    injectorPromise.resolve(componentRef.injector);
                    if (ranAsync) {
                        // If this is run async, it is possible that it is not run inside a
                        // digest and initial input values will not be detected.
                        scope.$evalAsync(() => { });
                    }
                };
                const downgradeFn = !isNgUpgradeLite
                    ? doDowngrade
                    : (pInjector, mInjector) => {
                        if (!ngZone) {
                            ngZone = pInjector.get(NgZone);
                        }
                        wrapCallback(() => doDowngrade(pInjector, mInjector))();
                    };
                // NOTE:
                // Not using `ParentInjectorPromise.all()` (which is inherited from `SyncPromise`), because
                // Closure Compiler (or some related tool) complains:
                // `TypeError: ...$src$downgrade_component_ParentInjectorPromise.all is not a function`
                SyncPromise.all([finalParentInjector, finalModuleInjector]).then(([pInjector, mInjector]) => downgradeFn(pInjector, mInjector));
                ranAsync = true;
            },
        };
    };
    // bracket-notation because of closure - see #14441
    directiveFactory['$inject'] = [$COMPILE, $INJECTOR, $PARSE];
    return directiveFactory;
}
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of AngularJS's `$compile`.
 */
class ParentInjectorPromise extends SyncPromise {
    constructor(element) {
        super();
        this.element = element;
        this.injectorKey = controllerKey(INJECTOR_KEY);
        // Store the promise on the element.
        element.data(this.injectorKey, this);
    }
    resolve(injector) {
        // Store the real injector on the element.
        this.element.data(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = null;
        // Resolve the promise.
        super.resolve(injector);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi9zcmMvZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQW1CLHdCQUF3QixFQUFZLE1BQU0sRUFBTyxNQUFNLGVBQWUsQ0FBQztBQWFqRyxPQUFPLEVBQ0wsUUFBUSxFQUNSLFNBQVMsRUFDVCxNQUFNLEVBQ04sWUFBWSxFQUNaLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEdBQ2pCLE1BQU0sYUFBYSxDQUFDO0FBQ3JCLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxXQUFXLEVBQVcsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRCxPQUFPLEVBQ0wsYUFBYSxFQUNiLHdCQUF3QixFQUN4QixXQUFXLEVBQ1gsaUJBQWlCLEVBR2pCLG9CQUFvQixHQUNyQixNQUFNLFFBQVEsQ0FBQztBQUVoQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0RHO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBVWxDO0lBQ0MsTUFBTSxnQkFBZ0IsR0FBdUIsVUFDM0MsUUFBeUIsRUFDekIsU0FBMkIsRUFDM0IsTUFBcUI7UUFFckIsMkZBQTJGO1FBQzNGLHFGQUFxRjtRQUNyRixtQkFBbUI7UUFDbkIsMkZBQTJGO1FBQzNGLGtCQUFrQjtRQUNsQiwwRkFBMEY7UUFDMUYsNEZBQTRGO1FBQzVGLDZCQUE2QjtRQUM3QixNQUFNLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsZ0NBQXdCLENBQUM7UUFDN0UsTUFBTSxZQUFZLEdBQWtDLENBQUMsZUFBZTtZQUNsRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVB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QUUsUUFBUSxDQUFDLENBQUM7UUFFL0MsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSyxDQUFDO1FBRXJCLHVCQUF1QjtRQUN2QixLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgSW5qZWN0b3IsIE5nWm9uZSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG4gIElBbm5vdGF0ZWRGdW5jdGlvbixcbiAgSUF0dHJpYnV0ZXMsXG4gIElBdWdtZW50ZWRKUXVlcnksXG4gIElDb21waWxlU2VydmljZSxcbiAgSURpcmVjdGl2ZSxcbiAgSUluamVjdG9yU2VydmljZSxcbiAgSU5nTW9kZWxDb250cm9sbGVyLFxuICBJUGFyc2VTZXJ2aWNlLFxuICBJU2NvcGUsXG59IGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHtcbiAgJENPTVBJTEUsXG4gICRJTkpFQ1RPUixcbiAgJFBBUlNFLFxuICBJTkpFQ1RPUl9LRVksXG4gIExBWllfTU9EVUxFX1JFRixcbiAgUkVRVUlSRV9JTkpFQ1RPUixcbiAgUkVRVUlSRV9OR19NT0RFTCxcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyfSBmcm9tICcuL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlcic7XG5pbXBvcnQge1N5bmNQcm9taXNlLCBUaGVuYWJsZX0gZnJvbSAnLi9wcm9taXNlX3V0aWwnO1xuaW1wb3J0IHtcbiAgY29udHJvbGxlcktleSxcbiAgZ2V0RG93bmdyYWRlZE1vZHVsZUNvdW50LFxuICBnZXRUeXBlTmFtZSxcbiAgZ2V0VXBncmFkZUFwcFR5cGUsXG4gIExhenlNb2R1bGVSZWYsXG4gIFVwZ3JhZGVBcHBUeXBlLFxuICB2YWxpZGF0ZUluamVjdGlvbktleSxcbn0gZnJvbSAnLi91dGlsJztcblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IGFsbG93cyBhbiBBbmd1bGFyIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQU9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRvIGJlIHVzZWQgZm9yIHJlZ2lzdGVyaW5nXG4gKiBhbiBBbmd1bGFySlMgd3JhcHBlciBkaXJlY3RpdmUgZm9yIFwiZG93bmdyYWRpbmdcIiBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVzXG4gKlxuICogTGV0J3MgYXNzdW1lIHRoYXQgeW91IGhhdmUgYW4gQW5ndWxhciBjb21wb25lbnQgY2FsbGVkIGBuZzJIZXJvZXNgIHRoYXQgbmVlZHNcbiAqIHRvIGJlIG1hZGUgYXZhaWxhYmxlIGluIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXNcIn1cbiAqXG4gKiBXZSBtdXN0IGNyZWF0ZSBhbiBBbmd1bGFySlMgW2RpcmVjdGl2ZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvZ3VpZGUvZGlyZWN0aXZlKVxuICogdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFyIGNvbXBvbmVudCBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMuXG4gKiBUaGUgYGRvd25ncmFkZUNvbXBvbmVudCgpYCBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IHdlXG4gKiBjYW4gdXNlIHRvIGRlZmluZSB0aGUgQW5ndWxhckpTIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIHRoZSBcImRvd25ncmFkZWRcIiBjb21wb25lbnQuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXMtd3JhcHBlclwifVxuICpcbiAqIEZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGVzIG9uIGRvd25ncmFkaW5nIEFuZ3VsYXIgY29tcG9uZW50cyB0byBBbmd1bGFySlMgY29tcG9uZW50cyBwbGVhc2VcbiAqIHZpc2l0IHRoZSBbVXBncmFkZSBndWlkZV0oaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3VwZ3JhZGUjdXNpbmctYW5ndWxhci1jb21wb25lbnRzLWZyb20tYW5ndWxhcmpzLWNvZGUpLlxuICpcbiAqIEBwYXJhbSBpbmZvIGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBDb21wb25lbnQgdGhhdCBpcyBiZWluZyBkb3duZ3JhZGVkOlxuICpcbiAqIC0gYGNvbXBvbmVudDogVHlwZTxhbnk+YDogVGhlIHR5cGUgb2YgdGhlIENvbXBvbmVudCB0aGF0IHdpbGwgYmUgZG93bmdyYWRlZFxuICogLSBgZG93bmdyYWRlZE1vZHVsZT86IHN0cmluZ2A6IFRoZSBuYW1lIG9mIHRoZSBkb3duZ3JhZGVkIG1vZHVsZSAoaWYgYW55KSB0aGF0IHRoZSBjb21wb25lbnRcbiAqICAgXCJiZWxvbmdzIHRvXCIsIGFzIHJldHVybmVkIGJ5IGEgY2FsbCB0byBgZG93bmdyYWRlTW9kdWxlKClgLiBJdCBpcyB0aGUgbW9kdWxlLCB3aG9zZVxuICogICBjb3JyZXNwb25kaW5nIEFuZ3VsYXIgbW9kdWxlIHdpbGwgYmUgYm9vdHN0cmFwcGVkLCB3aGVuIHRoZSBjb21wb25lbnQgbmVlZHMgdG8gYmUgaW5zdGFudGlhdGVkLlxuICogICA8YnIgLz5cbiAqICAgKFRoaXMgb3B0aW9uIGlzIG9ubHkgbmVjZXNzYXJ5IHdoZW4gdXNpbmcgYGRvd25ncmFkZU1vZHVsZSgpYCB0byBkb3duZ3JhZGUgbW9yZSB0aGFuIG9uZVxuICogICBBbmd1bGFyIG1vZHVsZS4pXG4gKiAtIGBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuYDogV2hldGhlciB0byBwZXJmb3JtIHtAbGluayBDaGFuZ2VEZXRlY3RvclJlZiNkZXRlY3RDaGFuZ2VzfSBvbiB0aGVcbiAqIGNvbXBvbmVudCBvbiBldmVyeVxuICogICBbJGRpZ2VzdF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KS4gSWYgc2V0IHRvIGBmYWxzZWAsXG4gKiAgIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBzdGlsbCBiZSBwZXJmb3JtZWQgd2hlbiBhbnkgb2YgdGhlIGNvbXBvbmVudCdzIGlucHV0cyBjaGFuZ2VzLlxuICogICAoRGVmYXVsdDogdHJ1ZSlcbiAqXG4gKiBAcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGluIGFuXG4gKiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUNvbXBvbmVudChpbmZvOiB7XG4gIGNvbXBvbmVudDogVHlwZTxhbnk+O1xuICBkb3duZ3JhZGVkTW9kdWxlPzogc3RyaW5nO1xuICBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIGlucHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIG91dHB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBzZWxlY3RvcnM/OiBzdHJpbmdbXTtcbn0pOiBhbnkgLyogYW5ndWxhci5JSW5qZWN0YWJsZSAqLyB7XG4gIGNvbnN0IGRpcmVjdGl2ZUZhY3Rvcnk6IElBbm5vdGF0ZWRGdW5jdGlvbiA9IGZ1bmN0aW9uIChcbiAgICAkY29tcGlsZTogSUNvbXBpbGVTZXJ2aWNlLFxuICAgICRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSxcbiAgICAkcGFyc2U6IElQYXJzZVNlcnZpY2UsXG4gICk6IElEaXJlY3RpdmUge1xuICAgIC8vIFdoZW4gdXNpbmcgYGRvd25ncmFkZU1vZHVsZSgpYCwgd2UgbmVlZCB0byBoYW5kbGUgY2VydGFpbiB0aGluZ3Mgc3BlY2lhbGx5LiBGb3IgZXhhbXBsZTpcbiAgICAvLyAtIFdlIGFsd2F5cyBuZWVkIHRvIGF0dGFjaCB0aGUgY29tcG9uZW50IHZpZXcgdG8gdGhlIGBBcHBsaWNhdGlvblJlZmAgZm9yIGl0IHRvIGJlXG4gICAgLy8gICBkaXJ0eS1jaGVja2VkLlxuICAgIC8vIC0gV2UgbmVlZCB0byBlbnN1cmUgY2FsbGJhY2tzIHRvIEFuZ3VsYXIgQVBJcyAoZS5nLiBjaGFuZ2UgZGV0ZWN0aW9uKSBhcmUgcnVuIGluc2lkZSB0aGVcbiAgICAvLyAgIEFuZ3VsYXIgem9uZS5cbiAgICAvLyAgIE5PVEU6IFRoaXMgaXMgbm90IG5lZWRlZCwgd2hlbiB1c2luZyBgVXBncmFkZU1vZHVsZWAsIGJlY2F1c2UgYCRkaWdlc3QoKWAgd2lsbCBiZSBydW5cbiAgICAvLyAgICAgICAgIGluc2lkZSB0aGUgQW5ndWxhciB6b25lIChleGNlcHQgaWYgZXhwbGljaXRseSBlc2NhcGVkLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZG4ndFxuICAgIC8vICAgICAgICAgZm9yY2UgaXQgYmFjayBpbikuXG4gICAgY29uc3QgaXNOZ1VwZ3JhZGVMaXRlID0gZ2V0VXBncmFkZUFwcFR5cGUoJGluamVjdG9yKSA9PT0gVXBncmFkZUFwcFR5cGUuTGl0ZTtcbiAgICBjb25zdCB3cmFwQ2FsbGJhY2s6IDxUPihjYjogKCkgPT4gVCkgPT4gdHlwZW9mIGNiID0gIWlzTmdVcGdyYWRlTGl0ZVxuICAgICAgPyAoY2IpID0+IGNiXG4gICAgICA6IChjYikgPT4gKCkgPT4gKE5nWm9uZS5pc0luQW5ndWxhclpvbmUoKSA/IGNiKCkgOiBuZ1pvbmUucnVuKGNiKSk7XG4gICAgbGV0IG5nWm9uZTogTmdab25lO1xuXG4gICAgLy8gV2hlbiBkb3duZ3JhZGluZyBtdWx0aXBsZSBtb2R1bGVzLCBzcGVjaWFsIGhhbmRsaW5nIGlzIG5lZWRlZCB3cnQgaW5qZWN0b3JzLlxuICAgIGNvbnN0IGhhc011bHRpcGxlRG93bmdyYWRlZE1vZHVsZXMgPSBpc05nVXBncmFkZUxpdGUgJiYgZ2V0RG93bmdyYWRlZE1vZHVsZUNvdW50KCRpbmplY3RvcikgPiAxO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6IFtSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMXSxcbiAgICAgIC8vIENvbnRyb2xsZXIgbmVlZHMgdG8gYmUgc2V0IHNvIHRoYXQgYGFuZ3VsYXItY29tcG9uZW50LXJvdXRlci5qc2AgKGZyb20gYmV0YSBBbmd1bGFyIDIpXG4gICAgICAvLyBjb25maWd1cmF0aW9uIHByb3BlcnRpZXMgY2FuIGJlIG1hZGUgYXZhaWxhYmxlLiBTZWU6XG4gICAgICAvLyBTZWUgRzM6IGphdmFzY3JpcHQvYW5ndWxhcjIvYW5ndWxhcjFfcm91dGVyX2xpYi5qc1xuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzQ3YmYxMWVlOTQ2NjQzNjdhMjZlZDhjOTFiOWI1ODZkM2RkNDIwZjUvc3JjL25nL2NvbXBpbGUuanMjTDE2NzAtTDE2OTEuXG4gICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoKSB7fSxcbiAgICAgIGxpbms6IChzY29wZTogSVNjb3BlLCBlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5LCBhdHRyczogSUF0dHJpYnV0ZXMsIHJlcXVpcmVkOiBhbnlbXSkgPT4ge1xuICAgICAgICAvLyBXZSBtaWdodCBoYXZlIHRvIGNvbXBpbGUgdGhlIGNvbnRlbnRzIGFzeW5jaHJvbm91c2x5LCBiZWNhdXNlIHRoaXMgbWlnaHQgaGF2ZSBiZWVuXG4gICAgICAgIC8vIHRyaWdnZXJlZCBieSBgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyYCwgYmVmb3JlIHRoZSBBbmd1bGFyIHRlbXBsYXRlcyBoYXZlXG4gICAgICAgIC8vIGJlZW4gY29tcGlsZWQuXG5cbiAgICAgICAgY29uc3QgbmdNb2RlbDogSU5nTW9kZWxDb250cm9sbGVyID0gcmVxdWlyZWRbMV07XG4gICAgICAgIGNvbnN0IHBhcmVudEluamVjdG9yOiBJbmplY3RvciB8IFRoZW5hYmxlPEluamVjdG9yPiB8IHVuZGVmaW5lZCA9IHJlcXVpcmVkWzBdO1xuICAgICAgICBsZXQgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yIHwgVGhlbmFibGU8SW5qZWN0b3I+IHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICBsZXQgcmFuQXN5bmMgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIXBhcmVudEluamVjdG9yIHx8IGhhc011bHRpcGxlRG93bmdyYWRlZE1vZHVsZXMpIHtcbiAgICAgICAgICBjb25zdCBkb3duZ3JhZGVkTW9kdWxlID0gaW5mby5kb3duZ3JhZGVkTW9kdWxlIHx8ICcnO1xuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWZLZXkgPSBgJHtMQVpZX01PRFVMRV9SRUZ9JHtkb3duZ3JhZGVkTW9kdWxlfWA7XG4gICAgICAgICAgY29uc3QgYXR0ZW1wdGVkQWN0aW9uID0gYGluc3RhbnRpYXRpbmcgY29tcG9uZW50ICcke2dldFR5cGVOYW1lKGluZm8uY29tcG9uZW50KX0nYDtcblxuICAgICAgICAgIHZhbGlkYXRlSW5qZWN0aW9uS2V5KCRpbmplY3RvciwgZG93bmdyYWRlZE1vZHVsZSwgbGF6eU1vZHVsZVJlZktleSwgYXR0ZW1wdGVkQWN0aW9uKTtcblxuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWYgPSAkaW5qZWN0b3IuZ2V0KGxhenlNb2R1bGVSZWZLZXkpIGFzIExhenlNb2R1bGVSZWY7XG4gICAgICAgICAgbW9kdWxlSW5qZWN0b3IgPSBsYXp5TW9kdWxlUmVmLmluamVjdG9yID8/IGxhenlNb2R1bGVSZWYucHJvbWlzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGVzOlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGVyZSBhcmUgdHdvIGluamVjdG9yczogYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZCBgZmluYWxQYXJlbnRJbmplY3RvcmAgKHRoZXkgbWlnaHQgYmVcbiAgICAgICAgLy8gdGhlIHNhbWUgaW5zdGFuY2UsIGJ1dCB0aGF0IGlzIGlycmVsZXZhbnQpOlxuICAgICAgICAvLyAtIGBmaW5hbE1vZHVsZUluamVjdG9yYCBpcyB1c2VkIHRvIHJldHJpZXZlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgLCB0aHVzIGl0IG11c3QgYmVcbiAgICAgICAgLy8gICBvbiB0aGUgc2FtZSB0cmVlIGFzIHRoZSBgTmdNb2R1bGVgIHRoYXQgZGVjbGFyZXMgdGhpcyBkb3duZ3JhZGVkIGNvbXBvbmVudC5cbiAgICAgICAgLy8gLSBgZmluYWxQYXJlbnRJbmplY3RvcmAgaXMgdXNlZCBmb3IgYWxsIG90aGVyIGluamVjdGlvbiBwdXJwb3Nlcy5cbiAgICAgICAgLy8gICAoTm90ZSB0aGF0IEFuZ3VsYXIga25vd3MgdG8gb25seSB0cmF2ZXJzZSB0aGUgY29tcG9uZW50LXRyZWUgcGFydCBvZiB0aGF0IGluamVjdG9yLFxuICAgICAgICAvLyAgIHdoZW4gbG9va2luZyBmb3IgYW4gaW5qZWN0YWJsZSBhbmQgdGhlbiBzd2l0Y2ggdG8gdGhlIG1vZHVsZSBpbmplY3Rvci4pXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoZXJlIGFyZSBiYXNpY2FsbHkgdGhyZWUgY2FzZXM6XG4gICAgICAgIC8vIC0gSWYgdGhlcmUgaXMgbm8gcGFyZW50IGNvbXBvbmVudCAodGh1cyBubyBgcGFyZW50SW5qZWN0b3JgKSwgd2UgYm9vdHN0cmFwIHRoZSBkb3duZ3JhZGVkXG4gICAgICAgIC8vICAgYE5nTW9kdWxlYCBhbmQgdXNlIGl0cyBpbmplY3RvciBhcyBib3RoIGBmaW5hbE1vZHVsZUluamVjdG9yYCBhbmRcbiAgICAgICAgLy8gICBgZmluYWxQYXJlbnRJbmplY3RvcmAuXG4gICAgICAgIC8vIC0gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50IChhbmQgdGh1cyBhIGBwYXJlbnRJbmplY3RvcmApIGFuZCB3ZSBhcmUgc3VyZSB0aGF0IGl0XG4gICAgICAgIC8vICAgYmVsb25ncyB0byB0aGUgc2FtZSBgTmdNb2R1bGVgIGFzIHRoaXMgZG93bmdyYWRlZCBjb21wb25lbnQgKGUuZy4gYmVjYXVzZSB0aGVyZSBpcyBvbmx5XG4gICAgICAgIC8vICAgb25lIGRvd25ncmFkZWQgbW9kdWxlLCB3ZSB1c2UgdGhhdCBgcGFyZW50SW5qZWN0b3JgIGFzIGJvdGggYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZFxuICAgICAgICAvLyAgIGBmaW5hbFBhcmVudEluamVjdG9yYC5cbiAgICAgICAgLy8gLSBJZiB0aGVyZSBpcyBhIHBhcmVudCBjb21wb25lbnQsIGJ1dCBpdCBtYXkgYmVsb25nIHRvIGEgZGlmZmVyZW50IGBOZ01vZHVsZWAsIHRoZW4gd2VcbiAgICAgICAgLy8gICB1c2UgdGhlIGBwYXJlbnRJbmplY3RvcmAgYXMgYGZpbmFsUGFyZW50SW5qZWN0b3JgIGFuZCB0aGlzIGRvd25ncmFkZWQgY29tcG9uZW50J3NcbiAgICAgICAgLy8gICBkZWNsYXJpbmcgYE5nTW9kdWxlYCdzIGluamVjdG9yIGFzIGBmaW5hbE1vZHVsZUluamVjdG9yYC5cbiAgICAgICAgLy8gICBOb3RlIDE6IElmIHRoZSBgTmdNb2R1bGVgIGlzIGFscmVhZHkgYm9vdHN0cmFwcGVkLCB3ZSBqdXN0IGdldCBpdHMgaW5qZWN0b3IgKHdlIGRvbid0XG4gICAgICAgIC8vICAgICAgICAgICBib290c3RyYXAgYWdhaW4pLlxuICAgICAgICAvLyAgIE5vdGUgMjogSXQgaXMgcG9zc2libGUgdGhhdCAod2hpbGUgdGhlcmUgYXJlIG11bHRpcGxlIGRvd25ncmFkZWQgbW9kdWxlcykgdGhpc1xuICAgICAgICAvLyAgICAgICAgICAgZG93bmdyYWRlZCBjb21wb25lbnQgYW5kIGl0cyBwYXJlbnQgY29tcG9uZW50IGJvdGggYmVsb25nIHRvIHRoZSBzYW1lIE5nTW9kdWxlLlxuICAgICAgICAvLyAgICAgICAgICAgSW4gdGhhdCBjYXNlLCB3ZSBjb3VsZCBoYXZlIHVzZWQgdGhlIGBwYXJlbnRJbmplY3RvcmAgYXMgYm90aFxuICAgICAgICAvLyAgICAgICAgICAgYGZpbmFsTW9kdWxlSW5qZWN0b3JgIGFuZCBgZmluYWxQYXJlbnRJbmplY3RvcmAsIGJ1dCAoZm9yIHNpbXBsaWNpdHkpIHdlIGFyZVxuICAgICAgICAvLyAgICAgICAgICAgdHJlYXRpbmcgdGhpcyBjYXNlIGFzIGlmIHRoZXkgYmVsb25nIHRvIGRpZmZlcmVudCBgTmdNb2R1bGVgcy4gVGhhdCBkb2Vzbid0XG4gICAgICAgIC8vICAgICAgICAgICByZWFsbHkgYWZmZWN0IGFueXRoaW5nLCBzaW5jZSBgcGFyZW50SW5qZWN0b3JgIGhhcyBgbW9kdWxlSW5qZWN0b3JgIGFzIGFuY2VzdG9yXG4gICAgICAgIC8vICAgICAgICAgICBhbmQgdHJ5aW5nIHRvIHJlc29sdmUgYENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcmAgZnJvbSBlaXRoZXIgb25lIHdpbGwgcmV0dXJuXG4gICAgICAgIC8vICAgICAgICAgICB0aGUgc2FtZSBpbnN0YW5jZS5cblxuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHBhcmVudCBjb21wb25lbnQsIHVzZSBpdHMgaW5qZWN0b3IgYXMgcGFyZW50IGluamVjdG9yLlxuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgXCJ0b3AtbGV2ZWxcIiBBbmd1bGFyIGNvbXBvbmVudCwgdXNlIHRoZSBtb2R1bGUgaW5qZWN0b3IuXG4gICAgICAgIGNvbnN0IGZpbmFsUGFyZW50SW5qZWN0b3IgPSBwYXJlbnRJbmplY3RvciB8fCBtb2R1bGVJbmplY3RvciE7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIFwidG9wLWxldmVsXCIgQW5ndWxhciBjb21wb25lbnQgb3IgdGhlIHBhcmVudCBjb21wb25lbnQgbWF5IGJlbG9uZyB0byBhXG4gICAgICAgIC8vIGRpZmZlcmVudCBgTmdNb2R1bGVgLCB1c2UgdGhlIG1vZHVsZSBpbmplY3RvciBmb3IgbW9kdWxlLXNwZWNpZmljIGRlcGVuZGVuY2llcy5cbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50IHRoYXQgYmVsb25ncyB0byB0aGUgc2FtZSBgTmdNb2R1bGVgLCB1c2UgaXRzIGluamVjdG9yLlxuICAgICAgICBjb25zdCBmaW5hbE1vZHVsZUluamVjdG9yID0gbW9kdWxlSW5qZWN0b3IgfHwgcGFyZW50SW5qZWN0b3IhO1xuXG4gICAgICAgIGNvbnN0IGRvRG93bmdyYWRlID0gKGluamVjdG9yOiBJbmplY3RvciwgbW9kdWxlSW5qZWN0b3I6IEluamVjdG9yKSA9PiB7XG4gICAgICAgICAgLy8gUmV0cmlldmUgYENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcmAgZnJvbSB0aGUgaW5qZWN0b3IgdGllZCB0byB0aGUgYE5nTW9kdWxlYCB0aGlzXG4gICAgICAgICAgLy8gY29tcG9uZW50IGJlbG9uZ3MgdG8uXG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIgPVxuICAgICAgICAgICAgbW9kdWxlSW5qZWN0b3IuZ2V0KENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+ID1cbiAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShpbmZvLmNvbXBvbmVudCkhO1xuXG4gICAgICAgICAgaWYgKCFjb21wb25lbnRGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGluZyBDb21wb25lbnRGYWN0b3J5IGZvcjogJHtnZXRUeXBlTmFtZShpbmZvLmNvbXBvbmVudCl9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaW5qZWN0b3JQcm9taXNlID0gbmV3IFBhcmVudEluamVjdG9yUHJvbWlzZShlbGVtZW50KTtcbiAgICAgICAgICBjb25zdCBmYWNhZGUgPSBuZXcgRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcihcbiAgICAgICAgICAgIGVsZW1lbnQsXG4gICAgICAgICAgICBhdHRycyxcbiAgICAgICAgICAgIHNjb3BlLFxuICAgICAgICAgICAgbmdNb2RlbCxcbiAgICAgICAgICAgIGluamVjdG9yLFxuICAgICAgICAgICAgJGNvbXBpbGUsXG4gICAgICAgICAgICAkcGFyc2UsXG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5LFxuICAgICAgICAgICAgd3JhcENhbGxiYWNrLFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzID0gZmFjYWRlLmNvbXBpbGVDb250ZW50cygpO1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudFJlZiA9IGZhY2FkZS5jcmVhdGVDb21wb25lbnRBbmRTZXR1cChcbiAgICAgICAgICAgIHByb2plY3RhYmxlTm9kZXMsXG4gICAgICAgICAgICBpc05nVXBncmFkZUxpdGUsXG4gICAgICAgICAgICBpbmZvLnByb3BhZ2F0ZURpZ2VzdCxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaW5qZWN0b3JQcm9taXNlLnJlc29sdmUoY29tcG9uZW50UmVmLmluamVjdG9yKTtcblxuICAgICAgICAgIGlmIChyYW5Bc3luYykge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBydW4gYXN5bmMsIGl0IGlzIHBvc3NpYmxlIHRoYXQgaXQgaXMgbm90IHJ1biBpbnNpZGUgYVxuICAgICAgICAgICAgLy8gZGlnZXN0IGFuZCBpbml0aWFsIGlucHV0IHZhbHVlcyB3aWxsIG5vdCBiZSBkZXRlY3RlZC5cbiAgICAgICAgICAgIHNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge30pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkb3duZ3JhZGVGbiA9ICFpc05nVXBncmFkZUxpdGVcbiAgICAgICAgICA/IGRvRG93bmdyYWRlXG4gICAgICAgICAgOiAocEluamVjdG9yOiBJbmplY3RvciwgbUluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgICAgICBpZiAoIW5nWm9uZSkge1xuICAgICAgICAgICAgICAgIG5nWm9uZSA9IHBJbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHdyYXBDYWxsYmFjaygoKSA9PiBkb0Rvd25ncmFkZShwSW5qZWN0b3IsIG1JbmplY3RvcikpKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIC8vIE5PVEU6XG4gICAgICAgIC8vIE5vdCB1c2luZyBgUGFyZW50SW5qZWN0b3JQcm9taXNlLmFsbCgpYCAod2hpY2ggaXMgaW5oZXJpdGVkIGZyb20gYFN5bmNQcm9taXNlYCksIGJlY2F1c2VcbiAgICAgICAgLy8gQ2xvc3VyZSBDb21waWxlciAob3Igc29tZSByZWxhdGVkIHRvb2wpIGNvbXBsYWluczpcbiAgICAgICAgLy8gYFR5cGVFcnJvcjogLi4uJHNyYyRkb3duZ3JhZGVfY29tcG9uZW50X1BhcmVudEluamVjdG9yUHJvbWlzZS5hbGwgaXMgbm90IGEgZnVuY3Rpb25gXG4gICAgICAgIFN5bmNQcm9taXNlLmFsbChbZmluYWxQYXJlbnRJbmplY3RvciwgZmluYWxNb2R1bGVJbmplY3Rvcl0pLnRoZW4oKFtwSW5qZWN0b3IsIG1JbmplY3Rvcl0pID0+XG4gICAgICAgICAgZG93bmdyYWRlRm4ocEluamVjdG9yLCBtSW5qZWN0b3IpLFxuICAgICAgICApO1xuXG4gICAgICAgIHJhbkFzeW5jID0gdHJ1ZTtcbiAgICAgIH0sXG4gICAgfTtcbiAgfTtcblxuICAvLyBicmFja2V0LW5vdGF0aW9uIGJlY2F1c2Ugb2YgY2xvc3VyZSAtIHNlZSAjMTQ0NDFcbiAgZGlyZWN0aXZlRmFjdG9yeVsnJGluamVjdCddID0gWyRDT01QSUxFLCAkSU5KRUNUT1IsICRQQVJTRV07XG4gIHJldHVybiBkaXJlY3RpdmVGYWN0b3J5O1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzIHByb21pc2UtbGlrZSBvYmplY3QgdG8gd3JhcCBwYXJlbnQgaW5qZWN0b3JzLFxuICogdG8gcHJlc2VydmUgdGhlIHN5bmNocm9ub3VzIG5hdHVyZSBvZiBBbmd1bGFySlMncyBgJGNvbXBpbGVgLlxuICovXG5jbGFzcyBQYXJlbnRJbmplY3RvclByb21pc2UgZXh0ZW5kcyBTeW5jUHJvbWlzZTxJbmplY3Rvcj4ge1xuICBwcml2YXRlIGluamVjdG9yS2V5OiBzdHJpbmcgPSBjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIFN0b3JlIHRoZSBwcm9taXNlIG9uIHRoZSBlbGVtZW50LlxuICAgIGVsZW1lbnQuZGF0YSEodGhpcy5pbmplY3RvcktleSwgdGhpcyk7XG4gIH1cblxuICBvdmVycmlkZSByZXNvbHZlKGluamVjdG9yOiBJbmplY3Rvcik6IHZvaWQge1xuICAgIC8vIFN0b3JlIHRoZSByZWFsIGluamVjdG9yIG9uIHRoZSBlbGVtZW50LlxuICAgIHRoaXMuZWxlbWVudC5kYXRhISh0aGlzLmluamVjdG9yS2V5LCBpbmplY3Rvcik7XG5cbiAgICAvLyBSZWxlYXNlIHRoZSBlbGVtZW50IHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzLlxuICAgIHRoaXMuZWxlbWVudCA9IG51bGwhO1xuXG4gICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgICBzdXBlci5yZXNvbHZlKGluamVjdG9yKTtcbiAgfVxufVxuIl19