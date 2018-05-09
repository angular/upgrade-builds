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
 * ### Examples
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {@example upgrade/static/ts/module.ts region="ng2-heroes-wrapper"}
 *
 * @param info contains information about the Component that is being downgraded:
 *
 * * `component: Type<any>`: The type of the Component that will be downgraded
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
                    var componentFactory = (componentFactoryResolver.resolveComponentFactory(info.component));
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
                        wrapCallback = function (cb) {
                            return function () {
                                return NgZone.isInAngularZone() ? cb() : ngZone.run(cb);
                            };
                        };
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
var /**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of Angular 1's $compile.
 */
ParentInjectorPromise = /** @class */ (function () {
    function ParentInjectorPromise(element) {
        this.element = element;
        this.injectorKey = controllerKey(INJECTOR_KEY);
        this.callbacks = [];
        // Store the promise on the element.
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
        // Store the real injector on the element.
        this.element.data(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = (null);
        // Run the queued callbacks.
        this.callbacks.forEach(function (callback) { return callback(injector); });
        this.callbacks.length = 0;
    };
    return ParentInjectorPromise;
}());
function isThenable(obj) {
    return isFunction(obj.then);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi9kb3duZ3JhZGVfY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFRQSxPQUFPLEVBQW1CLHdCQUF3QixFQUFZLE1BQU0sRUFBTyxNQUFNLGVBQWUsQ0FBQztBQUdqRyxPQUFPLEVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUMzSCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUN4RSxPQUFPLEVBQWdCLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUNsRixNQUFNLDZCQUE2QixJQVVsQztJQUNDLElBQU0sZ0JBQWdCLEdBQ1csVUFDSSxRQUFpQyxFQUNqQyxTQUFtQyxFQUNuQyxNQUE2Qjs7Ozs7O1FBTWhFLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLFlBQVksR0FBRyxVQUFJLEVBQVcsSUFBSyxPQUFBLEVBQUUsRUFBRixDQUFFLENBQUM7UUFDMUMsSUFBSSxNQUFjLENBQUM7UUFFbkIsTUFBTSxDQUFDO1lBQ0wsUUFBUSxFQUFFLEdBQUc7WUFDYixRQUFRLEVBQUUsSUFBSTtZQUNkLE9BQU8sRUFBRSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDO1lBQzdDLElBQUksRUFBRSxVQUFDLEtBQXFCLEVBQUUsT0FBaUMsRUFBRSxLQUEwQixFQUNwRixRQUFlOzs7O2dCQUtwQixJQUFNLE9BQU8sR0FBK0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dC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RCxvQkFBdUIsR0FBVztJQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFFLEdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN0QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsIEluamVjdG9yLCBOZ1pvbmUsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0UsIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0Rvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXJ9IGZyb20gJy4vZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgY29udHJvbGxlcktleSwgZ2V0Q29tcG9uZW50TmFtZSwgaXNGdW5jdGlvbn0gZnJvbSAnLi91dGlsJztcblxuXG5pbnRlcmZhY2UgVGhlbmFibGU8VD4ge1xuICB0aGVuKGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IGFueSk6IGFueTtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIGhlbHBlciBmdW5jdGlvbiB0aGF0IGFsbG93cyBhbiBBbmd1bGFyIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTLlxuICpcbiAqICpQYXJ0IG9mIHRoZSBbdXBncmFkZS9zdGF0aWNdKGFwaT9xdWVyeT11cGdyYWRlJTJGc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQW9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIHJldHVybnMgYSBmYWN0b3J5IGZ1bmN0aW9uIHRvIGJlIHVzZWQgZm9yIHJlZ2lzdGVyaW5nXG4gKiBhbiBBbmd1bGFySlMgd3JhcHBlciBkaXJlY3RpdmUgZm9yIFwiZG93bmdyYWRpbmdcIiBhbiBBbmd1bGFyIGNvbXBvbmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBMZXQncyBhc3N1bWUgdGhhdCB5b3UgaGF2ZSBhbiBBbmd1bGFyIGNvbXBvbmVudCBjYWxsZWQgYG5nMkhlcm9lc2AgdGhhdCBuZWVkc1xuICogdG8gYmUgbWFkZSBhdmFpbGFibGUgaW4gQW5ndWxhckpTIHRlbXBsYXRlcy5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMi1oZXJvZXNcIn1cbiAqXG4gKiBXZSBtdXN0IGNyZWF0ZSBhbiBBbmd1bGFySlMgW2RpcmVjdGl2ZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvZ3VpZGUvZGlyZWN0aXZlKVxuICogdGhhdCB3aWxsIG1ha2UgdGhpcyBBbmd1bGFyIGNvbXBvbmVudCBhdmFpbGFibGUgaW5zaWRlIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMuXG4gKiBUaGUgYGRvd25ncmFkZUNvbXBvbmVudCgpYCBmdW5jdGlvbiByZXR1cm5zIGEgZmFjdG9yeSBmdW5jdGlvbiB0aGF0IHdlXG4gKiBjYW4gdXNlIHRvIGRlZmluZSB0aGUgQW5ndWxhckpTIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIHRoZSBcImRvd25ncmFkZWRcIiBjb21wb25lbnQuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL21vZHVsZS50cyByZWdpb249XCJuZzItaGVyb2VzLXdyYXBwZXJcIn1cbiAqXG4gKiBAcGFyYW0gaW5mbyBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgQ29tcG9uZW50IHRoYXQgaXMgYmVpbmcgZG93bmdyYWRlZDpcbiAqXG4gKiAqIGBjb21wb25lbnQ6IFR5cGU8YW55PmA6IFRoZSB0eXBlIG9mIHRoZSBDb21wb25lbnQgdGhhdCB3aWxsIGJlIGRvd25ncmFkZWRcbiAqXG4gKiBAcmV0dXJucyBhIGZhY3RvcnkgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZWdpc3RlciB0aGUgY29tcG9uZW50IGluIGFuXG4gKiBBbmd1bGFySlMgbW9kdWxlLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvd25ncmFkZUNvbXBvbmVudChpbmZvOiB7XG4gIGNvbXBvbmVudDogVHlwZTxhbnk+O1xuICAvKiogQGV4cGVyaW1lbnRhbCAqL1xuICBwcm9wYWdhdGVEaWdlc3Q/OiBib29sZWFuO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIGlucHV0cz86IHN0cmluZ1tdO1xuICAvKiogQGRlcHJlY2F0ZWQgc2luY2UgdjQuIFRoaXMgcGFyYW1ldGVyIGlzIG5vIGxvbmdlciB1c2VkICovXG4gIG91dHB1dHM/OiBzdHJpbmdbXTtcbiAgLyoqIEBkZXByZWNhdGVkIHNpbmNlIHY0LiBUaGlzIHBhcmFtZXRlciBpcyBubyBsb25nZXIgdXNlZCAqL1xuICBzZWxlY3RvcnM/OiBzdHJpbmdbXTtcbn0pOiBhbnkgLyogYW5ndWxhci5JSW5qZWN0YWJsZSAqLyB7XG4gIGNvbnN0IGRpcmVjdGl2ZUZhY3Rvcnk6XG4gICAgICBhbmd1bGFyLklBbm5vdGF0ZWRGdW5jdGlvbiA9IGZ1bmN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSk6IGFuZ3VsYXIuSURpcmVjdGl2ZSB7XG4gICAgLy8gV2hlbiB1c2luZyBgVXBncmFkZU1vZHVsZWAsIHdlIGRvbid0IG5lZWQgdG8gZW5zdXJlIGNhbGxiYWNrcyB0byBBbmd1bGFyIEFQSXMgKGUuZy4gY2hhbmdlXG4gICAgLy8gZGV0ZWN0aW9uKSBhcmUgcnVuIGluc2lkZSB0aGUgQW5ndWxhciB6b25lLCBiZWNhdXNlIGAkZGlnZXN0KClgIHdpbGwgYmUgcnVuIGluc2lkZSB0aGUgem9uZVxuICAgIC8vIChleGNlcHQgaWYgZXhwbGljaXRseSBlc2NhcGVkLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZG4ndCBmb3JjZSBpdCBiYWNrIGluKS5cbiAgICAvLyBXaGVuIHVzaW5nIGBkb3duZ3JhZGVNb2R1bGUoKWAgdGhvdWdoLCB3ZSBuZWVkIHRvIGVuc3VyZSBzdWNoIGNhbGxiYWNrcyBhcmUgcnVuIGluc2lkZSB0aGVcbiAgICAvLyBBbmd1bGFyIHpvbmUuXG4gICAgbGV0IG5lZWRzTmdab25lID0gZmFsc2U7XG4gICAgbGV0IHdyYXBDYWxsYmFjayA9IDxUPihjYjogKCkgPT4gVCkgPT4gY2I7XG4gICAgbGV0IG5nWm9uZTogTmdab25lO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICAgIHJlcXVpcmU6IFtSRVFVSVJFX0lOSkVDVE9SLCBSRVFVSVJFX05HX01PREVMXSxcbiAgICAgIGxpbms6IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgcmVxdWlyZWQ6IGFueVtdKSA9PiB7XG4gICAgICAgIC8vIFdlIG1pZ2h0IGhhdmUgdG8gY29tcGlsZSB0aGUgY29udGVudHMgYXN5bmNocm9ub3VzbHksIGJlY2F1c2UgdGhpcyBtaWdodCBoYXZlIGJlZW5cbiAgICAgICAgLy8gdHJpZ2dlcmVkIGJ5IGBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJgLCBiZWZvcmUgdGhlIEFuZ3VsYXIgdGVtcGxhdGVzIGhhdmVcbiAgICAgICAgLy8gYmVlbiBjb21waWxlZC5cblxuICAgICAgICBjb25zdCBuZ01vZGVsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciA9IHJlcXVpcmVkWzFdO1xuICAgICAgICBsZXQgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yfFRoZW5hYmxlPEluamVjdG9yPnx1bmRlZmluZWQgPSByZXF1aXJlZFswXTtcbiAgICAgICAgbGV0IHJhbkFzeW5jID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFwYXJlbnRJbmplY3Rvcikge1xuICAgICAgICAgIGNvbnN0IGxhenlNb2R1bGVSZWYgPSAkaW5qZWN0b3IuZ2V0KExBWllfTU9EVUxFX1JFRikgYXMgTGF6eU1vZHVsZVJlZjtcbiAgICAgICAgICBuZWVkc05nWm9uZSA9IGxhenlNb2R1bGVSZWYubmVlZHNOZ1pvbmU7XG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IgPSBsYXp5TW9kdWxlUmVmLmluamVjdG9yIHx8IGxhenlNb2R1bGVSZWYucHJvbWlzZSBhcyBQcm9taXNlPEluamVjdG9yPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRvRG93bmdyYWRlID0gKGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyID1cbiAgICAgICAgICAgICAgaW5qZWN0b3IuZ2V0KENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcik7XG4gICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+ID1cbiAgICAgICAgICAgICAgY29tcG9uZW50RmFjdG9yeVJlc29sdmVyLnJlc29sdmVDb21wb25lbnRGYWN0b3J5KGluZm8uY29tcG9uZW50KSAhO1xuXG4gICAgICAgICAgaWYgKCFjb21wb25lbnRGYWN0b3J5KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGluZyBDb21wb25lbnRGYWN0b3J5IGZvcjogJyArIGdldENvbXBvbmVudE5hbWUoaW5mby5jb21wb25lbnQpKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpbmplY3RvclByb21pc2UgPSBuZXcgUGFyZW50SW5qZWN0b3JQcm9taXNlKGVsZW1lbnQpO1xuICAgICAgICAgIGNvbnN0IGZhY2FkZSA9IG5ldyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyKFxuICAgICAgICAgICAgICBlbGVtZW50LCBhdHRycywgc2NvcGUsIG5nTW9kZWwsIGluamVjdG9yLCAkaW5qZWN0b3IsICRjb21waWxlLCAkcGFyc2UsXG4gICAgICAgICAgICAgIGNvbXBvbmVudEZhY3RvcnksIHdyYXBDYWxsYmFjayk7XG5cbiAgICAgICAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzID0gZmFjYWRlLmNvbXBpbGVDb250ZW50cygpO1xuICAgICAgICAgIGZhY2FkZS5jcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2Rlcyk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwSW5wdXRzKG5lZWRzTmdab25lLCBpbmZvLnByb3BhZ2F0ZURpZ2VzdCk7XG4gICAgICAgICAgZmFjYWRlLnNldHVwT3V0cHV0cygpO1xuICAgICAgICAgIGZhY2FkZS5yZWdpc3RlckNsZWFudXAoKTtcblxuICAgICAgICAgIGluamVjdG9yUHJvbWlzZS5yZXNvbHZlKGZhY2FkZS5nZXRJbmplY3RvcigpKTtcblxuICAgICAgICAgIGlmIChyYW5Bc3luYykge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBydW4gYXN5bmMsIGl0IGlzIHBvc3NpYmxlIHRoYXQgaXQgaXMgbm90IHJ1biBpbnNpZGUgYVxuICAgICAgICAgICAgLy8gZGlnZXN0IGFuZCBpbml0aWFsIGlucHV0IHZhbHVlcyB3aWxsIG5vdCBiZSBkZXRlY3RlZC5cbiAgICAgICAgICAgIHNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge30pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBkb3duZ3JhZGVGbiA9ICFuZWVkc05nWm9uZSA/IGRvRG93bmdyYWRlIDogKGluamVjdG9yOiBJbmplY3RvcikgPT4ge1xuICAgICAgICAgIGlmICghbmdab25lKSB7XG4gICAgICAgICAgICBuZ1pvbmUgPSBpbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgICAgIHdyYXBDYWxsYmFjayA9IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT5cbiAgICAgICAgICAgICAgICBOZ1pvbmUuaXNJbkFuZ3VsYXJab25lKCkgPyBjYigpIDogbmdab25lLnJ1bihjYik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgd3JhcENhbGxiYWNrKCgpID0+IGRvRG93bmdyYWRlKGluamVjdG9yKSkoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoaXNUaGVuYWJsZTxJbmplY3Rvcj4ocGFyZW50SW5qZWN0b3IpKSB7XG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IudGhlbihkb3duZ3JhZGVGbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG93bmdyYWRlRm4ocGFyZW50SW5qZWN0b3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmFuQXN5bmMgPSB0cnVlO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gYnJhY2tldC1ub3RhdGlvbiBiZWNhdXNlIG9mIGNsb3N1cmUgLSBzZWUgIzE0NDQxXG4gIGRpcmVjdGl2ZUZhY3RvcnlbJyRpbmplY3QnXSA9IFskQ09NUElMRSwgJElOSkVDVE9SLCAkUEFSU0VdO1xuICByZXR1cm4gZGlyZWN0aXZlRmFjdG9yeTtcbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhciAxJ3MgJGNvbXBpbGUuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSB7XG4gIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcml2YXRlIGluamVjdG9yS2V5OiBzdHJpbmcgPSBjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSk7XG4gIHByaXZhdGUgY2FsbGJhY2tzOiAoKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAvLyBTdG9yZSB0aGUgcHJvbWlzZSBvbiB0aGUgZWxlbWVudC5cbiAgICBlbGVtZW50LmRhdGEgISh0aGlzLmluamVjdG9yS2V5LCB0aGlzKTtcbiAgfVxuXG4gIHRoZW4oY2FsbGJhY2s6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSkge1xuICAgIGlmICh0aGlzLmluamVjdG9yKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLmluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZShpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG5cbiAgICAvLyBTdG9yZSB0aGUgcmVhbCBpbmplY3RvciBvbiB0aGUgZWxlbWVudC5cbiAgICB0aGlzLmVsZW1lbnQuZGF0YSAhKHRoaXMuaW5qZWN0b3JLZXksIGluamVjdG9yKTtcblxuICAgIC8vIFJlbGVhc2UgdGhlIGVsZW1lbnQgdG8gcHJldmVudCBtZW1vcnkgbGVha3MuXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbCAhO1xuXG4gICAgLy8gUnVuIHRoZSBxdWV1ZWQgY2FsbGJhY2tzLlxuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2soaW5qZWN0b3IpKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVGhlbmFibGU8VD4ob2JqOiBvYmplY3QpOiBvYmogaXMgVGhlbmFibGU8VD4ge1xuICByZXR1cm4gaXNGdW5jdGlvbigob2JqIGFzIGFueSkudGhlbik7XG59XG4iXX0=