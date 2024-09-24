/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi9zcmMvZG93bmdyYWRlX2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQW1CLHdCQUF3QixFQUFZLE1BQU0sRUFBTyxNQUFNLGVBQWUsQ0FBQztBQWFqRyxPQUFPLEVBQ0wsUUFBUSxFQUNSLFNBQVMsRUFDVCxNQUFNLEVBQ04sWUFBWSxFQUNaLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEdBQ2pCLE1BQU0sYUFBYSxDQUFDO0FBQ3JCLE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBQyxXQUFXLEVBQVcsTUFBTSxnQkFBZ0IsQ0FBQztBQUNyRCxPQUFPLEVBQ0wsYUFBYSxFQUNiLHdCQUF3QixFQUN4QixXQUFXLEVBQ1gsaUJBQWlCLEVBR2pCLG9CQUFvQixHQUNyQixNQUFNLFFBQVEsQ0FBQztBQUVoQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0RHO0FBQ0gsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBVWxDO0lBQ0MsTUFBTSxnQkFBZ0IsR0FBdUIsVUFDM0MsUUFBeUIsRUFDekIsU0FBMkIsRUFDM0IsTUFBcUI7UUFFckIsMkZBQTJGO1FBQzNGLHFGQUFxRjtRQUNyRixtQkFBbUI7UUFDbkIsMkZBQTJGO1FBQzNGLGtCQUFrQjtRQUNsQiwwRkFBMEY7UUFDMUYsNEZBQTRGO1FBQzVGLDZCQUE2QjtRQUM3QixNQUFNLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsZ0NBQXdCLENBQUM7UUFDN0UsTUFBTSxZQUFZLEdBQWtDLENBQUMsZUFBZTtZQUNsRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVB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QUUsUUFBUSxDQUFDLENBQUM7UUFFL0MsK0NBQStDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSyxDQUFDO1FBRXJCLHVCQUF1QjtRQUN2QixLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzFCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yLCBOZ1pvbmUsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBJQW5ub3RhdGVkRnVuY3Rpb24sXG4gIElBdHRyaWJ1dGVzLFxuICBJQXVnbWVudGVkSlF1ZXJ5LFxuICBJQ29tcGlsZVNlcnZpY2UsXG4gIElEaXJlY3RpdmUsXG4gIElJbmplY3RvclNlcnZpY2UsXG4gIElOZ01vZGVsQ29udHJvbGxlcixcbiAgSVBhcnNlU2VydmljZSxcbiAgSVNjb3BlLFxufSBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7XG4gICRDT01QSUxFLFxuICAkSU5KRUNUT1IsXG4gICRQQVJTRSxcbiAgSU5KRUNUT1JfS0VZLFxuICBMQVpZX01PRFVMRV9SRUYsXG4gIFJFUVVJUkVfSU5KRUNUT1IsXG4gIFJFUVVJUkVfTkdfTU9ERUwsXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7RG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcn0gZnJvbSAnLi9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXInO1xuaW1wb3J0IHtTeW5jUHJvbWlzZSwgVGhlbmFibGV9IGZyb20gJy4vcHJvbWlzZV91dGlsJztcbmltcG9ydCB7XG4gIGNvbnRyb2xsZXJLZXksXG4gIGdldERvd25ncmFkZWRNb2R1bGVDb3VudCxcbiAgZ2V0VHlwZU5hbWUsXG4gIGdldFVwZ3JhZGVBcHBUeXBlLFxuICBMYXp5TW9kdWxlUmVmLFxuICBVcGdyYWRlQXBwVHlwZSxcbiAgdmFsaWRhdGVJbmplY3Rpb25LZXksXG59IGZyb20gJy4vdXRpbCc7XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdGhhdCBhbGxvd3MgYW4gQW5ndWxhciBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXJKUy5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFPVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGlzIGhlbHBlciBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0byBiZSB1c2VkIGZvciByZWdpc3RlcmluZ1xuICogYW4gQW5ndWxhckpTIHdyYXBwZXIgZGlyZWN0aXZlIGZvciBcImRvd25ncmFkaW5nXCIgYW4gQW5ndWxhciBjb21wb25lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIExldCdzIGFzc3VtZSB0aGF0IHlvdSBoYXZlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbGxlZCBgbmcySGVyb2VzYCB0aGF0IG5lZWRzXG4gKiB0byBiZSBtYWRlIGF2YWlsYWJsZSBpbiBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYW4gQW5ndWxhckpTIFtkaXJlY3RpdmVdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2d1aWRlL2RpcmVjdGl2ZSlcbiAqIHRoYXQgd2lsbCBtYWtlIHRoaXMgQW5ndWxhciBjb21wb25lbnQgYXZhaWxhYmxlIGluc2lkZSBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICogVGhlIGBkb3duZ3JhZGVDb21wb25lbnQoKWAgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCB3ZVxuICogY2FuIHVzZSB0byBkZWZpbmUgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyB0aGUgXCJkb3duZ3JhZGVkXCIgY29tcG9uZW50LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXdyYXBwZXJcIn1cbiAqXG4gKiBGb3IgbW9yZSBkZXRhaWxzIGFuZCBleGFtcGxlcyBvbiBkb3duZ3JhZGluZyBBbmd1bGFyIGNvbXBvbmVudHMgdG8gQW5ndWxhckpTIGNvbXBvbmVudHMgcGxlYXNlXG4gKiB2aXNpdCB0aGUgW1VwZ3JhZGUgZ3VpZGVdKGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS91cGdyYWRlI3VzaW5nLWFuZ3VsYXItY29tcG9uZW50cy1mcm9tLWFuZ3VsYXJqcy1jb2RlKS5cbiAqXG4gKiBAcGFyYW0gaW5mbyBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQ29tcG9uZW50IHRoYXQgaXMgYmVpbmcgZG93bmdyYWRlZDpcbiAqXG4gKiAtIGBjb21wb25lbnQ6IFR5cGU8YW55PmA6IFRoZSB0eXBlIG9mIHRoZSBDb21wb25lbnQgdGhhdCB3aWxsIGJlIGRvd25ncmFkZWRcbiAqIC0gYGRvd25ncmFkZWRNb2R1bGU/OiBzdHJpbmdgOiBUaGUgbmFtZSBvZiB0aGUgZG93bmdyYWRlZCBtb2R1bGUgKGlmIGFueSkgdGhhdCB0aGUgY29tcG9uZW50XG4gKiAgIFwiYmVsb25ncyB0b1wiLCBhcyByZXR1cm5lZCBieSBhIGNhbGwgdG8gYGRvd25ncmFkZU1vZHVsZSgpYC4gSXQgaXMgdGhlIG1vZHVsZSwgd2hvc2VcbiAqICAgY29ycmVzcG9uZGluZyBBbmd1bGFyIG1vZHVsZSB3aWxsIGJlIGJvb3RzdHJhcHBlZCwgd2hlbiB0aGUgY29tcG9uZW50IG5lZWRzIHRvIGJlIGluc3RhbnRpYXRlZC5cbiAqICAgPGJyIC8+XG4gKiAgIChUaGlzIG9wdGlvbiBpcyBvbmx5IG5lY2Vzc2FyeSB3aGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAgdG8gZG93bmdyYWRlIG1vcmUgdGhhbiBvbmVcbiAqICAgQW5ndWxhciBtb2R1bGUuKVxuICogLSBgcHJvcGFnYXRlRGlnZXN0PzogYm9vbGVhbmA6IFdoZXRoZXIgdG8gcGVyZm9ybSB7QGxpbmsgQ2hhbmdlRGV0ZWN0b3JSZWYjZGV0ZWN0Q2hhbmdlc30gb24gdGhlXG4gKiBjb21wb25lbnQgb24gZXZlcnlcbiAqICAgWyRkaWdlc3RdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy90eXBlLyRyb290U2NvcGUuU2NvcGUjJGRpZ2VzdCkuIElmIHNldCB0byBgZmFsc2VgLFxuICogICBjaGFuZ2UgZGV0ZWN0aW9uIHdpbGwgc3RpbGwgYmUgcGVyZm9ybWVkIHdoZW4gYW55IG9mIHRoZSBjb21wb25lbnQncyBpbnB1dHMgY2hhbmdlcy5cbiAqICAgKERlZmF1bHQ6IHRydWUpXG4gKlxuICogQHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVnaXN0ZXIgdGhlIGNvbXBvbmVudCBpbiBhblxuICogQW5ndWxhckpTIG1vZHVsZS5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3duZ3JhZGVDb21wb25lbnQoaW5mbzoge1xuICBjb21wb25lbnQ6IFR5cGU8YW55PjtcbiAgZG93bmdyYWRlZE1vZHVsZT86IHN0cmluZztcbiAgcHJvcGFnYXRlRGlnZXN0PzogYm9vbGVhbjtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBpbnB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBvdXRwdXRzPzogc3RyaW5nW107XG4gIC8qKiBAZGVwcmVjYXRlZCBzaW5jZSB2NC4gVGhpcyBwYXJhbWV0ZXIgaXMgbm8gbG9uZ2VyIHVzZWQgKi9cbiAgc2VsZWN0b3JzPzogc3RyaW5nW107XG59KTogYW55IC8qIGFuZ3VsYXIuSUluamVjdGFibGUgKi8ge1xuICBjb25zdCBkaXJlY3RpdmVGYWN0b3J5OiBJQW5ub3RhdGVkRnVuY3Rpb24gPSBmdW5jdGlvbiAoXG4gICAgJGNvbXBpbGU6IElDb21waWxlU2VydmljZSxcbiAgICAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UsXG4gICAgJHBhcnNlOiBJUGFyc2VTZXJ2aWNlLFxuICApOiBJRGlyZWN0aXZlIHtcbiAgICAvLyBXaGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAsIHdlIG5lZWQgdG8gaGFuZGxlIGNlcnRhaW4gdGhpbmdzIHNwZWNpYWxseS4gRm9yIGV4YW1wbGU6XG4gICAgLy8gLSBXZSBhbHdheXMgbmVlZCB0byBhdHRhY2ggdGhlIGNvbXBvbmVudCB2aWV3IHRvIHRoZSBgQXBwbGljYXRpb25SZWZgIGZvciBpdCB0byBiZVxuICAgIC8vICAgZGlydHktY2hlY2tlZC5cbiAgICAvLyAtIFdlIG5lZWQgdG8gZW5zdXJlIGNhbGxiYWNrcyB0byBBbmd1bGFyIEFQSXMgKGUuZy4gY2hhbmdlIGRldGVjdGlvbikgYXJlIHJ1biBpbnNpZGUgdGhlXG4gICAgLy8gICBBbmd1bGFyIHpvbmUuXG4gICAgLy8gICBOT1RFOiBUaGlzIGlzIG5vdCBuZWVkZWQsIHdoZW4gdXNpbmcgYFVwZ3JhZGVNb2R1bGVgLCBiZWNhdXNlIGAkZGlnZXN0KClgIHdpbGwgYmUgcnVuXG4gICAgLy8gICAgICAgICBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZSAoZXhjZXB0IGlmIGV4cGxpY2l0bHkgZXNjYXBlZCwgaW4gd2hpY2ggY2FzZSB3ZSBzaG91bGRuJ3RcbiAgICAvLyAgICAgICAgIGZvcmNlIGl0IGJhY2sgaW4pLlxuICAgIGNvbnN0IGlzTmdVcGdyYWRlTGl0ZSA9IGdldFVwZ3JhZGVBcHBUeXBlKCRpbmplY3RvcikgPT09IFVwZ3JhZGVBcHBUeXBlLkxpdGU7XG4gICAgY29uc3Qgd3JhcENhbGxiYWNrOiA8VD4oY2I6ICgpID0+IFQpID0+IHR5cGVvZiBjYiA9ICFpc05nVXBncmFkZUxpdGVcbiAgICAgID8gKGNiKSA9PiBjYlxuICAgICAgOiAoY2IpID0+ICgpID0+IChOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkgPyBjYigpIDogbmdab25lLnJ1bihjYikpO1xuICAgIGxldCBuZ1pvbmU6IE5nWm9uZTtcblxuICAgIC8vIFdoZW4gZG93bmdyYWRpbmcgbXVsdGlwbGUgbW9kdWxlcywgc3BlY2lhbCBoYW5kbGluZyBpcyBuZWVkZWQgd3J0IGluamVjdG9ycy5cbiAgICBjb25zdCBoYXNNdWx0aXBsZURvd25ncmFkZWRNb2R1bGVzID0gaXNOZ1VwZ3JhZGVMaXRlICYmIGdldERvd25ncmFkZWRNb2R1bGVDb3VudCgkaW5qZWN0b3IpID4gMTtcblxuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgdGVybWluYWw6IHRydWUsXG4gICAgICByZXF1aXJlOiBbUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTF0sXG4gICAgICAvLyBDb250cm9sbGVyIG5lZWRzIHRvIGJlIHNldCBzbyB0aGF0IGBhbmd1bGFyLWNvbXBvbmVudC1yb3V0ZXIuanNgIChmcm9tIGJldGEgQW5ndWxhciAyKVxuICAgICAgLy8gY29uZmlndXJhdGlvbiBwcm9wZXJ0aWVzIGNhbiBiZSBtYWRlIGF2YWlsYWJsZS4gU2VlOlxuICAgICAgLy8gU2VlIEczOiBqYXZhc2NyaXB0L2FuZ3VsYXIyL2FuZ3VsYXIxX3JvdXRlcl9saWIuanNcbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi80N2JmMTFlZTk0NjY0MzY3YTI2ZWQ4YzkxYjliNTg2ZDNkZDQyMGY1L3NyYy9uZy9jb21waWxlLmpzI0wxNjcwLUwxNjkxLlxuICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCkge30sXG4gICAgICBsaW5rOiAoc2NvcGU6IElTY29wZSwgZWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IElBdHRyaWJ1dGVzLCByZXF1aXJlZDogYW55W10pID0+IHtcbiAgICAgICAgLy8gV2UgbWlnaHQgaGF2ZSB0byBjb21waWxlIHRoZSBjb250ZW50cyBhc3luY2hyb25vdXNseSwgYmVjYXVzZSB0aGlzIG1pZ2h0IGhhdmUgYmVlblxuICAgICAgICAvLyB0cmlnZ2VyZWQgYnkgYFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcmAsIGJlZm9yZSB0aGUgQW5ndWxhciB0ZW1wbGF0ZXMgaGF2ZVxuICAgICAgICAvLyBiZWVuIGNvbXBpbGVkLlxuXG4gICAgICAgIGNvbnN0IG5nTW9kZWw6IElOZ01vZGVsQ29udHJvbGxlciA9IHJlcXVpcmVkWzFdO1xuICAgICAgICBjb25zdCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IgfCBUaGVuYWJsZTxJbmplY3Rvcj4gfCB1bmRlZmluZWQgPSByZXF1aXJlZFswXTtcbiAgICAgICAgbGV0IG1vZHVsZUluamVjdG9yOiBJbmplY3RvciB8IFRoZW5hYmxlPEluamVjdG9yPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IHJhbkFzeW5jID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFwYXJlbnRJbmplY3RvciB8fCBoYXNNdWx0aXBsZURvd25ncmFkZWRNb2R1bGVzKSB7XG4gICAgICAgICAgY29uc3QgZG93bmdyYWRlZE1vZHVsZSA9IGluZm8uZG93bmdyYWRlZE1vZHVsZSB8fCAnJztcbiAgICAgICAgICBjb25zdCBsYXp5TW9kdWxlUmVmS2V5ID0gYCR7TEFaWV9NT0RVTEVfUkVGfSR7ZG93bmdyYWRlZE1vZHVsZX1gO1xuICAgICAgICAgIGNvbnN0IGF0dGVtcHRlZEFjdGlvbiA9IGBpbnN0YW50aWF0aW5nIGNvbXBvbmVudCAnJHtnZXRUeXBlTmFtZShpbmZvLmNvbXBvbmVudCl9J2A7XG5cbiAgICAgICAgICB2YWxpZGF0ZUluamVjdGlvbktleSgkaW5qZWN0b3IsIGRvd25ncmFkZWRNb2R1bGUsIGxhenlNb2R1bGVSZWZLZXksIGF0dGVtcHRlZEFjdGlvbik7XG5cbiAgICAgICAgICBjb25zdCBsYXp5TW9kdWxlUmVmID0gJGluamVjdG9yLmdldChsYXp5TW9kdWxlUmVmS2V5KSBhcyBMYXp5TW9kdWxlUmVmO1xuICAgICAgICAgIG1vZHVsZUluamVjdG9yID0gbGF6eU1vZHVsZVJlZi5pbmplY3RvciA/PyBsYXp5TW9kdWxlUmVmLnByb21pc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RlczpcbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlcmUgYXJlIHR3byBpbmplY3RvcnM6IGBmaW5hbE1vZHVsZUluamVjdG9yYCBhbmQgYGZpbmFsUGFyZW50SW5qZWN0b3JgICh0aGV5IG1pZ2h0IGJlXG4gICAgICAgIC8vIHRoZSBzYW1lIGluc3RhbmNlLCBidXQgdGhhdCBpcyBpcnJlbGV2YW50KTpcbiAgICAgICAgLy8gLSBgZmluYWxNb2R1bGVJbmplY3RvcmAgaXMgdXNlZCB0byByZXRyaWV2ZSBgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyYCwgdGh1cyBpdCBtdXN0IGJlXG4gICAgICAgIC8vICAgb24gdGhlIHNhbWUgdHJlZSBhcyB0aGUgYE5nTW9kdWxlYCB0aGF0IGRlY2xhcmVzIHRoaXMgZG93bmdyYWRlZCBjb21wb25lbnQuXG4gICAgICAgIC8vIC0gYGZpbmFsUGFyZW50SW5qZWN0b3JgIGlzIHVzZWQgZm9yIGFsbCBvdGhlciBpbmplY3Rpb24gcHVycG9zZXMuXG4gICAgICAgIC8vICAgKE5vdGUgdGhhdCBBbmd1bGFyIGtub3dzIHRvIG9ubHkgdHJhdmVyc2UgdGhlIGNvbXBvbmVudC10cmVlIHBhcnQgb2YgdGhhdCBpbmplY3RvcixcbiAgICAgICAgLy8gICB3aGVuIGxvb2tpbmcgZm9yIGFuIGluamVjdGFibGUgYW5kIHRoZW4gc3dpdGNoIHRvIHRoZSBtb2R1bGUgaW5qZWN0b3IuKVxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGVyZSBhcmUgYmFzaWNhbGx5IHRocmVlIGNhc2VzOlxuICAgICAgICAvLyAtIElmIHRoZXJlIGlzIG5vIHBhcmVudCBjb21wb25lbnQgKHRodXMgbm8gYHBhcmVudEluamVjdG9yYCksIHdlIGJvb3RzdHJhcCB0aGUgZG93bmdyYWRlZFxuICAgICAgICAvLyAgIGBOZ01vZHVsZWAgYW5kIHVzZSBpdHMgaW5qZWN0b3IgYXMgYm90aCBgZmluYWxNb2R1bGVJbmplY3RvcmAgYW5kXG4gICAgICAgIC8vICAgYGZpbmFsUGFyZW50SW5qZWN0b3JgLlxuICAgICAgICAvLyAtIElmIHRoZXJlIGlzIGEgcGFyZW50IGNvbXBvbmVudCAoYW5kIHRodXMgYSBgcGFyZW50SW5qZWN0b3JgKSBhbmQgd2UgYXJlIHN1cmUgdGhhdCBpdFxuICAgICAgICAvLyAgIGJlbG9uZ3MgdG8gdGhlIHNhbWUgYE5nTW9kdWxlYCBhcyB0aGlzIGRvd25ncmFkZWQgY29tcG9uZW50IChlLmcuIGJlY2F1c2UgdGhlcmUgaXMgb25seVxuICAgICAgICAvLyAgIG9uZSBkb3duZ3JhZGVkIG1vZHVsZSwgd2UgdXNlIHRoYXQgYHBhcmVudEluamVjdG9yYCBhcyBib3RoIGBmaW5hbE1vZHVsZUluamVjdG9yYCBhbmRcbiAgICAgICAgLy8gICBgZmluYWxQYXJlbnRJbmplY3RvcmAuXG4gICAgICAgIC8vIC0gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50LCBidXQgaXQgbWF5IGJlbG9uZyB0byBhIGRpZmZlcmVudCBgTmdNb2R1bGVgLCB0aGVuIHdlXG4gICAgICAgIC8vICAgdXNlIHRoZSBgcGFyZW50SW5qZWN0b3JgIGFzIGBmaW5hbFBhcmVudEluamVjdG9yYCBhbmQgdGhpcyBkb3duZ3JhZGVkIGNvbXBvbmVudCdzXG4gICAgICAgIC8vICAgZGVjbGFyaW5nIGBOZ01vZHVsZWAncyBpbmplY3RvciBhcyBgZmluYWxNb2R1bGVJbmplY3RvcmAuXG4gICAgICAgIC8vICAgTm90ZSAxOiBJZiB0aGUgYE5nTW9kdWxlYCBpcyBhbHJlYWR5IGJvb3RzdHJhcHBlZCwgd2UganVzdCBnZXQgaXRzIGluamVjdG9yICh3ZSBkb24ndFxuICAgICAgICAvLyAgICAgICAgICAgYm9vdHN0cmFwIGFnYWluKS5cbiAgICAgICAgLy8gICBOb3RlIDI6IEl0IGlzIHBvc3NpYmxlIHRoYXQgKHdoaWxlIHRoZXJlIGFyZSBtdWx0aXBsZSBkb3duZ3JhZGVkIG1vZHVsZXMpIHRoaXNcbiAgICAgICAgLy8gICAgICAgICAgIGRvd25ncmFkZWQgY29tcG9uZW50IGFuZCBpdHMgcGFyZW50IGNvbXBvbmVudCBib3RoIGJlbG9uZyB0byB0aGUgc2FtZSBOZ01vZHVsZS5cbiAgICAgICAgLy8gICAgICAgICAgIEluIHRoYXQgY2FzZSwgd2UgY291bGQgaGF2ZSB1c2VkIHRoZSBgcGFyZW50SW5qZWN0b3JgIGFzIGJvdGhcbiAgICAgICAgLy8gICAgICAgICAgIGBmaW5hbE1vZHVsZUluamVjdG9yYCBhbmQgYGZpbmFsUGFyZW50SW5qZWN0b3JgLCBidXQgKGZvciBzaW1wbGljaXR5KSB3ZSBhcmVcbiAgICAgICAgLy8gICAgICAgICAgIHRyZWF0aW5nIHRoaXMgY2FzZSBhcyBpZiB0aGV5IGJlbG9uZyB0byBkaWZmZXJlbnQgYE5nTW9kdWxlYHMuIFRoYXQgZG9lc24ndFxuICAgICAgICAvLyAgICAgICAgICAgcmVhbGx5IGFmZmVjdCBhbnl0aGluZywgc2luY2UgYHBhcmVudEluamVjdG9yYCBoYXMgYG1vZHVsZUluamVjdG9yYCBhcyBhbmNlc3RvclxuICAgICAgICAvLyAgICAgICAgICAgYW5kIHRyeWluZyB0byByZXNvbHZlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgIGZyb20gZWl0aGVyIG9uZSB3aWxsIHJldHVyblxuICAgICAgICAvLyAgICAgICAgICAgdGhlIHNhbWUgaW5zdGFuY2UuXG5cbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBwYXJlbnQgY29tcG9uZW50LCB1c2UgaXRzIGluamVjdG9yIGFzIHBhcmVudCBpbmplY3Rvci5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIFwidG9wLWxldmVsXCIgQW5ndWxhciBjb21wb25lbnQsIHVzZSB0aGUgbW9kdWxlIGluamVjdG9yLlxuICAgICAgICBjb25zdCBmaW5hbFBhcmVudEluamVjdG9yID0gcGFyZW50SW5qZWN0b3IgfHwgbW9kdWxlSW5qZWN0b3IhO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBcInRvcC1sZXZlbFwiIEFuZ3VsYXIgY29tcG9uZW50IG9yIHRoZSBwYXJlbnQgY29tcG9uZW50IG1heSBiZWxvbmcgdG8gYVxuICAgICAgICAvLyBkaWZmZXJlbnQgYE5nTW9kdWxlYCwgdXNlIHRoZSBtb2R1bGUgaW5qZWN0b3IgZm9yIG1vZHVsZS1zcGVjaWZpYyBkZXBlbmRlbmNpZXMuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgcGFyZW50IGNvbXBvbmVudCB0aGF0IGJlbG9uZ3MgdG8gdGhlIHNhbWUgYE5nTW9kdWxlYCwgdXNlIGl0cyBpbmplY3Rvci5cbiAgICAgICAgY29uc3QgZmluYWxNb2R1bGVJbmplY3RvciA9IG1vZHVsZUluamVjdG9yIHx8IHBhcmVudEluamVjdG9yITtcblxuICAgICAgICBjb25zdCBkb0Rvd25ncmFkZSA9IChpbmplY3RvcjogSW5qZWN0b3IsIG1vZHVsZUluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIC8vIFJldHJpZXZlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgIGZyb20gdGhlIGluamVjdG9yIHRpZWQgdG8gdGhlIGBOZ01vZHVsZWAgdGhpc1xuICAgICAgICAgIC8vIGNvbXBvbmVudCBiZWxvbmdzIHRvLlxuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyID1cbiAgICAgICAgICAgIG1vZHVsZUluamVjdG9yLmdldChDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIpO1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55PiA9XG4gICAgICAgICAgICBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIucmVzb2x2ZUNvbXBvbmVudEZhY3RvcnkoaW5mby5jb21wb25lbnQpITtcblxuICAgICAgICAgIGlmICghY29tcG9uZW50RmFjdG9yeSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RpbmcgQ29tcG9uZW50RmFjdG9yeSBmb3I6ICR7Z2V0VHlwZU5hbWUoaW5mby5jb21wb25lbnQpfWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IGluamVjdG9yUHJvbWlzZSA9IG5ldyBQYXJlbnRJbmplY3RvclByb21pc2UoZWxlbWVudCk7XG4gICAgICAgICAgY29uc3QgZmFjYWRlID0gbmV3IERvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXIoXG4gICAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgICAgYXR0cnMsXG4gICAgICAgICAgICBzY29wZSxcbiAgICAgICAgICAgIG5nTW9kZWwsXG4gICAgICAgICAgICBpbmplY3RvcixcbiAgICAgICAgICAgICRjb21waWxlLFxuICAgICAgICAgICAgJHBhcnNlLFxuICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeSxcbiAgICAgICAgICAgIHdyYXBDYWxsYmFjayxcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgY29uc3QgcHJvamVjdGFibGVOb2RlcyA9IGZhY2FkZS5jb21waWxlQ29udGVudHMoKTtcbiAgICAgICAgICBjb25zdCBjb21wb25lbnRSZWYgPSBmYWNhZGUuY3JlYXRlQ29tcG9uZW50QW5kU2V0dXAoXG4gICAgICAgICAgICBwcm9qZWN0YWJsZU5vZGVzLFxuICAgICAgICAgICAgaXNOZ1VwZ3JhZGVMaXRlLFxuICAgICAgICAgICAgaW5mby5wcm9wYWdhdGVEaWdlc3QsXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGluamVjdG9yUHJvbWlzZS5yZXNvbHZlKGNvbXBvbmVudFJlZi5pbmplY3Rvcik7XG5cbiAgICAgICAgICBpZiAocmFuQXN5bmMpIHtcbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgcnVuIGFzeW5jLCBpdCBpcyBwb3NzaWJsZSB0aGF0IGl0IGlzIG5vdCBydW4gaW5zaWRlIGFcbiAgICAgICAgICAgIC8vIGRpZ2VzdCBhbmQgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgd2lsbCBub3QgYmUgZGV0ZWN0ZWQuXG4gICAgICAgICAgICBzY29wZS4kZXZhbEFzeW5jKCgpID0+IHt9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZG93bmdyYWRlRm4gPSAhaXNOZ1VwZ3JhZGVMaXRlXG4gICAgICAgICAgPyBkb0Rvd25ncmFkZVxuICAgICAgICAgIDogKHBJbmplY3RvcjogSW5qZWN0b3IsIG1JbmplY3RvcjogSW5qZWN0b3IpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCFuZ1pvbmUpIHtcbiAgICAgICAgICAgICAgICBuZ1pvbmUgPSBwSW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB3cmFwQ2FsbGJhY2soKCkgPT4gZG9Eb3duZ3JhZGUocEluamVjdG9yLCBtSW5qZWN0b3IpKSgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAvLyBOT1RFOlxuICAgICAgICAvLyBOb3QgdXNpbmcgYFBhcmVudEluamVjdG9yUHJvbWlzZS5hbGwoKWAgKHdoaWNoIGlzIGluaGVyaXRlZCBmcm9tIGBTeW5jUHJvbWlzZWApLCBiZWNhdXNlXG4gICAgICAgIC8vIENsb3N1cmUgQ29tcGlsZXIgKG9yIHNvbWUgcmVsYXRlZCB0b29sKSBjb21wbGFpbnM6XG4gICAgICAgIC8vIGBUeXBlRXJyb3I6IC4uLiRzcmMkZG93bmdyYWRlX2NvbXBvbmVudF9QYXJlbnRJbmplY3RvclByb21pc2UuYWxsIGlzIG5vdCBhIGZ1bmN0aW9uYFxuICAgICAgICBTeW5jUHJvbWlzZS5hbGwoW2ZpbmFsUGFyZW50SW5qZWN0b3IsIGZpbmFsTW9kdWxlSW5qZWN0b3JdKS50aGVuKChbcEluamVjdG9yLCBtSW5qZWN0b3JdKSA9PlxuICAgICAgICAgIGRvd25ncmFkZUZuKHBJbmplY3RvciwgbUluamVjdG9yKSxcbiAgICAgICAgKTtcblxuICAgICAgICByYW5Bc3luYyA9IHRydWU7XG4gICAgICB9LFxuICAgIH07XG4gIH07XG5cbiAgLy8gYnJhY2tldC1ub3RhdGlvbiBiZWNhdXNlIG9mIGNsb3N1cmUgLSBzZWUgIzE0NDQxXG4gIGRpcmVjdGl2ZUZhY3RvcnlbJyRpbmplY3QnXSA9IFskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0VdO1xuICByZXR1cm4gZGlyZWN0aXZlRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhckpTJ3MgYCRjb21waWxlYC5cbiAqL1xuY2xhc3MgUGFyZW50SW5qZWN0b3JQcm9taXNlIGV4dGVuZHMgU3luY1Byb21pc2U8SW5qZWN0b3I+IHtcbiAgcHJpdmF0ZSBpbmplY3RvcktleTogc3RyaW5nID0gY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBTdG9yZSB0aGUgcHJvbWlzZSBvbiB0aGUgZWxlbWVudC5cbiAgICBlbGVtZW50LmRhdGEhKHRoaXMuaW5qZWN0b3JLZXksIHRoaXMpO1xuICB9XG5cbiAgb3ZlcnJpZGUgcmVzb2x2ZShpbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgICAvLyBTdG9yZSB0aGUgcmVhbCBpbmplY3RvciBvbiB0aGUgZWxlbWVudC5cbiAgICB0aGlzLmVsZW1lbnQuZGF0YSEodGhpcy5pbmplY3RvcktleSwgaW5qZWN0b3IpO1xuXG4gICAgLy8gUmVsZWFzZSB0aGUgZWxlbWVudCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrcy5cbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsITtcblxuICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UuXG4gICAgc3VwZXIucmVzb2x2ZShpbmplY3Rvcik7XG4gIH1cbn1cbiJdfQ==