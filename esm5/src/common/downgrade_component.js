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
 * @description
 *
 * A helper function that allows an Angular component to be used from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
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
 * @param info contains information about the Component that is being downgraded:
 *
 * * `component: Type<any>`: The type of the Component that will be downgraded
 * * `propagateDigest?: boolean`: Whether to perform {@link ChangeDetectorRef#detectChanges
 *   change detection} on the component on every
 *   [$digest](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest). If set to `false`,
 *   change detection will still be performed when any of the component's inputs changes.
 *   (Default: true)
 *
 * @returns a factory function that can be used to register the component in an
 * AngularJS module.
 *
 * @experimental
 */
export function downgradeComponent(info) {
    var directiveFactory = function ($compile, $injector, $parse) {
        // When using `UpgradeModule`, we don't need to ensure callbacks to Angular APIs (e.g. change
        // detection) are run inside the Angular zone, because `$digest()` will be run inside the zone
        // (except if explicitly escaped, in which case we shouldn't force it back in).
        // When using `downgradeModule()` though, we need to ensure such callbacks are run inside the
        // Angular zone.
        var needsNgZone = false;
        var wrapCallback = function (cb) { return cb; };
        var ngZone;
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: function (scope, element, attrs, required) {
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                var ngModel = required[1];
                var parentInjector = required[0];
                var ranAsync = false;
                if (!parentInjector) {
                    var lazyModuleRef = $injector.get(LAZY_MODULE_REF);
                    needsNgZone = lazyModuleRef.needsNgZone;
                    parentInjector = lazyModuleRef.injector || lazyModuleRef.promise;
                }
                var doDowngrade = function (injector) {
                    var componentFactoryResolver = injector.get(ComponentFactoryResolver);
                    var componentFactory = componentFactoryResolver.resolveComponentFactory(info.component);
                    if (!componentFactory) {
                        throw new Error('Expecting ComponentFactory for: ' + getComponentName(info.component));
                    }
                    var injectorPromise = new ParentInjectorPromise(element);
                    var facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory, wrapCallback);
                    var projectableNodes = facade.compileContents();
                    facade.createComponent(projectableNodes);
                    facade.setupInputs(needsNgZone, info.propagateDigest);
                    facade.setupOutputs();
                    facade.registerCleanup();
                    injectorPromise.resolve(facade.getInjector());
                    if (ranAsync) {
                        // If this is run async, it is possible that it is not run inside a
                        // digest and initial input values will not be detected.
                        scope.$evalAsync(function () { });
                    }
                };
                var downgradeFn = !needsNgZone ? doDowngrade : function (injector) {
                    if (!ngZone) {
                        ngZone = injector.get(NgZone);
                        wrapCallback = function (cb) { return function () {
                            return NgZone.isInAngularZone() ? cb() : ngZone.run(cb);
                        }; };
                    }
                    wrapCallback(function () { return doDowngrade(injector); })();
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
var ParentInjectorPromise = /** @class */ (function () {
    function ParentInjectorPromise(element) {
        this.element = element;
        this.injectorKey = controllerKey(INJECTOR_KEY);
        this.callbacks = [];
        // Store the promise on the element.
        element.data(this.injectorKey, this);
    }
    ParentInjectorPromise.prototype.then = function (callback) {
        if (this.injector) {
            callback(this.injector);
        }
        else {
            this.callbacks.push(callback);
        }
    };
    ParentInjectorPromise.prototype.resolve = function (injector) {
        this.injector = injector;
        // Store the real injector on the element.
        this.element.data(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = null;
        // Run the queued callbacks.
        this.callbacks.forEach(function (callback) { return callback(injector); });
        this.callbacks.length = 0;
    };
    return ParentInjectorPromise;
}());
function isThenable(obj) {
    return isFunction(obj.then);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi9kb3duZ3JhZGVfY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBbUIsd0JBQXdCLEVBQVksTUFBTSxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBR2pHLE9BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzNILE9BQU8sRUFBQyx5QkFBeUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBZ0IsYUFBYSxFQUFFLGdCQUFnQixFQUFFLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQU9sRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUNHO0FBQ0gsTUFBTSw2QkFBNkIsSUFVbEM7SUFDQyxJQUFNLGdCQUFnQixHQUNXLFVBQ0ksUUFBaUMsRUFDakMsU0FBbUMsRUFDbkMsTUFBNkI7UUFDaEUsNkZBQTZGO1FBQzdGLDhGQUE4RjtRQUM5RiwrRUFBK0U7UUFDL0UsNkZBQTZGO1FBQzdGLGdCQUFnQjtRQUNoQixJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxZQUFZLEdBQUcsVUFBSSxFQUFXLElBQUssT0FBQSxFQUFFLEVBQUYsQ0FBRSxDQUFDO1FBQzFDLElBQUksTUFBYyxDQUFDO1FBRW5CLE9BQU87WUFDTCxRQUFRLEVBQUUsR0FBRztZQUNiLFFBQVEsRUFBRSxJQUFJO1lBQ2QsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUM7WUFDN0MsSUFBSSxFQUFFLFVBQUMsS0FBcUIsRUFBRSxPQUFp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QUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0gsNEJBQUM7QUFBRCxDQUFDLEFBaENELElBZ0NDO0FBRUQsb0JBQXVCLEdBQVc7SUFDaEMsT0FBTyxVQUFVLENBQUUsR0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBJbmplY3RvciwgTmdab25lLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7JENPTVBJTEUsICRJTkpFQ1RPUiwgJFBBUlNFLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgUkVRVUlSRV9JTkpFQ1RPUiwgUkVRVUlSRV9OR19NT0RFTH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyfSBmcm9tICcuL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlcic7XG5pbXBvcnQge0xhenlNb2R1bGVSZWYsIGNvbnRyb2xsZXJLZXksIGdldENvbXBvbmVudE5hbWUsIGlzRnVuY3Rpb259IGZyb20gJy4vdXRpbCc7XG5cblxuaW50ZXJmYWNlIFRoZW5hYmxlPFQ+IHtcbiAgdGhlbihjYWxsYmFjazogKHZhbHVlOiBUKSA9PiBhbnkpOiBhbnk7XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgZnVuY3Rpb24gdGhhdCBhbGxvd3MgYW4gQW5ndWxhciBjb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXJKUy5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbipcbiAqXG4gKiBUaGlzIGhlbHBlciBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0byBiZSB1c2VkIGZvciByZWdpc3RlcmluZ1xuICogYW4gQW5ndWxhckpTIHdyYXBwZXIgZGlyZWN0aXZlIGZvciBcImRvd25ncmFkaW5nXCIgYW4gQW5ndWxhciBjb21wb25lbnQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBFeGFtcGxlc1xuICpcbiAqIExldCdzIGFzc3VtZSB0aGF0IHlvdSBoYXZlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbGxlZCBgbmcySGVyb2VzYCB0aGF0IG5lZWRzXG4gKiB0byBiZSBtYWRlIGF2YWlsYWJsZSBpbiBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYW4gQW5ndWxhckpTIFtkaXJlY3RpdmVdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2d1aWRlL2RpcmVjdGl2ZSlcbiAqIHRoYXQgd2lsbCBtYWtlIHRoaXMgQW5ndWxhciBjb21wb25lbnQgYXZhaWxhYmxlIGluc2lkZSBBbmd1bGFySlMgdGVtcGxhdGVzLlxuICogVGhlIGBkb3duZ3JhZGVDb21wb25lbnQoKWAgZnVuY3Rpb24gcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCB3ZVxuICogY2FuIHVzZSB0byBkZWZpbmUgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUgdGhhdCB3cmFwcyB0aGUgXCJkb3duZ3JhZGVkXCIgY29tcG9uZW50LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXdyYXBwZXJcIn1cbiAqXG4gKiBAcGFyYW0gaW5mbyBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQ29tcG9uZW50IHRoYXQgaXMgYmVpbmcgZG93bmdyYWRlZDpcbiAqXG4gKiAqIGBjb21wb25lbnQ6IFR5cGU8YW55PmA6IFRoZSB0eXBlIG9mIHRoZSBDb21wb25lbnQgdGhhdCB3aWxsIGJlIGRvd25ncmFkZWRcbiAqICogYHByb3BhZ2F0ZURpZ2VzdD86IGJvb2xlYW5gOiBXaGV0aGVyIHRvIHBlcmZvcm0ge0BsaW5rIENoYW5nZURldGVjdG9yUmVmI2RldGVjdENoYW5nZXNcbiAqICAgY2hhbmdlIGRldGVjdGlvbn0gb24gdGhlIGNvbXBvbmVudCBvbiBldmVyeVxuICogICBbJGRpZ2VzdF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZSMkZGlnZXN0KS4gSWYgc2V0IHRvIGBmYWxzZWAsXG4gKiAgIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBzdGlsbCBiZSBwZXJmb3JtZWQgd2hlbiBhbnkgb2YgdGhlIGNvbXBvbmVudCdzIGlucHV0cyBjaGFuZ2VzLlxuICogICAoRGVmYXVsdDogdHJ1ZSlcbiAqXG4gKiBAcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGluIGFuXG4gKiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUNvbXBvbmVudChpbmZvOiB7XG4gIGNvbXBvbmVudDogVHlwZTxhbnk+O1xuICAvKiogQGV4cGVyaW1lbnRhbCAqL1xuICBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIGlucHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIG91dHB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBzZWxlY3RvcnM/OiBzdHJpbmdbXTtcbn0pOiBhbnkgLyogYW5ndWxhci5JSW5qZWN0YWJsZSAqLyB7XG4gIGNvbnN0IGRpcmVjdGl2ZUZhY3Rvcnk6XG4gICAgICBhbmd1bGFyLklBbm5vdGF0ZWRGdW5jdGlvbiA9IGZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSk6IGFuZ3VsYXIuSURpcmVjdGl2ZSB7XG4gICAgLy8gV2hlbiB1c2luZyBgVXBncmFkZU1vZHVsZWAsIHdlIGRvbid0IG5lZWQgdG8gZW5zdXJlIGNhbGxiYWNrcyB0byBBbmd1bGFyIEFQSXMgKGUuZy4gY2hhbmdlXG4gICAgLy8gZGV0ZWN0aW9uKSBhcmUgcnVuIGluc2lkZSB0aGUgQW5ndWxhciB6b25lLCBiZWNhdXNlIGAkZGlnZXN0KClgIHdpbGwgYmUgcnVuIGluc2lkZSB0aGUgem9uZVxuICAgIC8vIChleGNlcHQgaWYgZXhwbGljaXRseSBlc2NhcGVkLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZG4ndCBmb3JjZSBpdCBiYWNrIGluKS5cbiAgICAvLyBXaGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAgdGhvdWdoLCB3ZSBuZWVkIHRvIGVuc3VyZSBzdWNoIGNhbGxiYWNrcyBhcmUgcnVuIGluc2lkZSB0aGVcbiAgICAvLyBBbmd1bGFyIHpvbmUuXG4gICAgbGV0IG5lZWRzTmdab25lID0gZmFsc2U7XG4gICAgbGV0IHdyYXBDYWxsYmFjayA9IDxUPihjYjogKCkgPT4gVCkgPT4gY2I7XG4gICAgbGV0IG5nWm9uZTogTmdab25lO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6IFtSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMXSxcbiAgICAgIGxpbms6IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgcmVxdWlyZWQ6IGFueVtdKSA9PiB7XG4gICAgICAgIC8vIFdlIG1pZ2h0IGhhdmUgdG8gY29tcGlsZSB0aGUgY29udGVudHMgYXN5bmNocm9ub3VzbHksIGJlY2F1c2UgdGhpcyBtaWdodCBoYXZlIGJlZW5cbiAgICAgICAgLy8gdHJpZ2dlcmVkIGJ5IGBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJgLCBiZWZvcmUgdGhlIEFuZ3VsYXIgdGVtcGxhdGVzIGhhdmVcbiAgICAgICAgLy8gYmVlbiBjb21waWxlZC5cblxuICAgICAgICBjb25zdCBuZ01vZGVsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciA9IHJlcXVpcmVkWzFdO1xuICAgICAgICBsZXQgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yfFRoZW5hYmxlPEluamVjdG9yPnx1bmRlZmluZWQgPSByZXF1aXJlZFswXTtcbiAgICAgICAgbGV0IHJhbkFzeW5jID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFwYXJlbnRJbmplY3Rvcikge1xuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWYgPSAkaW5qZWN0b3IuZ2V0KExBWllfTU9EVUxFX1JFRikgYXMgTGF6eU1vZHVsZVJlZjtcbiAgICAgICAgICBuZWVkc05nWm9uZSA9IGxhenlNb2R1bGVSZWYubmVlZHNOZ1pvbmU7XG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IgPSBsYXp5TW9kdWxlUmVmLmluamVjdG9yIHx8IGxhenlNb2R1bGVSZWYucHJvbWlzZSBhcyBQcm9taXNlPEluamVjdG9yPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRvRG93bmdyYWRlID0gKGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyID1cbiAgICAgICAgICAgICAgaW5qZWN0b3IuZ2V0KENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+ID1cbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGluZm8uY29tcG9uZW50KSAhO1xuXG4gICAgICAgICAgaWYgKCFjb21wb25lbnRGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGluZyBDb21wb25lbnRGYWN0b3J5IGZvcjogJyArIGdldENvbXBvbmVudE5hbWUoaW5mby5jb21wb25lbnQpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpbmplY3RvclByb21pc2UgPSBuZXcgUGFyZW50SW5qZWN0b3JQcm9taXNlKGVsZW1lbnQpO1xuICAgICAgICAgIGNvbnN0IGZhY2FkZSA9IG5ldyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyKFxuICAgICAgICAgICAgICBlbGVtZW50LCBhdHRycywgc2NvcGUsIG5nTW9kZWwsIGluamVjdG9yLCAkaW5qZWN0b3IsICRjb21waWxlLCAkcGFyc2UsXG4gICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnksIHdyYXBDYWxsYmFjayk7XG5cbiAgICAgICAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzID0gZmFjYWRlLmNvbXBpbGVDb250ZW50cygpO1xuICAgICAgICAgIGZhY2FkZS5jcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2Rlcyk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwSW5wdXRzKG5lZWRzTmdab25lLCBpbmZvLnByb3BhZ2F0ZURpZ2VzdCk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwT3V0cHV0cygpO1xuICAgICAgICAgIGZhY2FkZS5yZWdpc3RlckNsZWFudXAoKTtcblxuICAgICAgICAgIGluamVjdG9yUHJvbWlzZS5yZXNvbHZlKGZhY2FkZS5nZXRJbmplY3RvcigpKTtcblxuICAgICAgICAgIGlmIChyYW5Bc3luYykge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBydW4gYXN5bmMsIGl0IGlzIHBvc3NpYmxlIHRoYXQgaXQgaXMgbm90IHJ1biBpbnNpZGUgYVxuICAgICAgICAgICAgLy8gZGlnZXN0IGFuZCBpbml0aWFsIGlucHV0IHZhbHVlcyB3aWxsIG5vdCBiZSBkZXRlY3RlZC5cbiAgICAgICAgICAgIHNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge30pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkb3duZ3JhZGVGbiA9ICFuZWVkc05nWm9uZSA/IGRvRG93bmdyYWRlIDogKGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIGlmICghbmdab25lKSB7XG4gICAgICAgICAgICBuZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgICAgIHdyYXBDYWxsYmFjayA9IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT5cbiAgICAgICAgICAgICAgICBOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkgPyBjYigpIDogbmdab25lLnJ1bihjYik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd3JhcENhbGxiYWNrKCgpID0+IGRvRG93bmdyYWRlKGluamVjdG9yKSkoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNUaGVuYWJsZTxJbmplY3Rvcj4ocGFyZW50SW5qZWN0b3IpKSB7XG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IudGhlbihkb3duZ3JhZGVGbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG93bmdyYWRlRm4ocGFyZW50SW5qZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmFuQXN5bmMgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gYnJhY2tldC1ub3RhdGlvbiBiZWNhdXNlIG9mIGNsb3N1cmUgLSBzZWUgIzE0NDQxXG4gIGRpcmVjdGl2ZUZhY3RvcnlbJyRpbmplY3QnXSA9IFskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0VdO1xuICByZXR1cm4gZGlyZWN0aXZlRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhciAxJ3MgJGNvbXBpbGUuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGluamVjdG9yICE6IEluamVjdG9yO1xuICBwcml2YXRlIGluamVjdG9yS2V5OiBzdHJpbmcgPSBjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSk7XG4gIHByaXZhdGUgY2FsbGJhY2tzOiAoKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAvLyBTdG9yZSB0aGUgcHJvbWlzZSBvbiB0aGUgZWxlbWVudC5cbiAgICBlbGVtZW50LmRhdGEgISh0aGlzLmluamVjdG9yS2V5LCB0aGlzKTtcbiAgfVxuXG4gIHRoZW4oY2FsbGJhY2s6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSkge1xuICAgIGlmICh0aGlzLmluamVjdG9yKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLmluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZShpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG5cbiAgICAvLyBTdG9yZSB0aGUgcmVhbCBpbmplY3RvciBvbiB0aGUgZWxlbWVudC5cbiAgICB0aGlzLmVsZW1lbnQuZGF0YSAhKHRoaXMuaW5qZWN0b3JLZXksIGluamVjdG9yKTtcblxuICAgIC8vIFJlbGVhc2UgdGhlIGVsZW1lbnQgdG8gcHJldmVudCBtZW1vcnkgbGVha3MuXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbCAhO1xuXG4gICAgLy8gUnVuIHRoZSBxdWV1ZWQgY2FsbGJhY2tzLlxuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2soaW5qZWN0b3IpKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVGhlbmFibGU8VD4ob2JqOiBvYmplY3QpOiBvYmogaXMgVGhlbmFibGU8VD4ge1xuICByZXR1cm4gaXNGdW5jdGlvbigob2JqIGFzIGFueSkudGhlbik7XG59XG4iXX0=