/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Injector, isDevMode, NgModule, NgZone, Testability } from '@angular/core';
import { bootstrap, element as angularElement, module_ as angularModule } from '../../src/common/src/angular1';
import { $$TESTABILITY, $DELEGATE, $INJECTOR, $INTERVAL, $PROVIDE, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_APP_TYPE_KEY, UPGRADE_MODULE_NAME } from '../../src/common/src/constants';
import { controllerKey } from '../../src/common/src/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
/**
 * @description
 *
 * An `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static)
 * library for hybrid upgrade apps that support AOT compilation*
 *
 * The `upgrade/static` package contains helpers that allow AngularJS and Angular components
 * to be used together inside a hybrid upgrade application, which supports AOT compilation.
 *
 * Specifically, the classes and functions in the `upgrade/static` module allow the following:
 *
 * 1. Creation of an Angular directive that wraps and exposes an AngularJS component so
 *    that it can be used in an Angular template. See `UpgradeComponent`.
 * 2. Creation of an AngularJS directive that wraps and exposes an Angular component so
 *    that it can be used in an AngularJS template. See `downgradeComponent`.
 * 3. Creation of an Angular root injector provider that wraps and exposes an AngularJS
 *    service so that it can be injected into an Angular context. See
 *    {@link UpgradeModule#upgrading-an-angular-1-service Upgrading an AngularJS service} below.
 * 4. Creation of an AngularJS service that wraps and exposes an Angular injectable
 *    so that it can be injected into an AngularJS context. See `downgradeInjectable`.
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * @usageNotes
 *
 * ```ts
 * import {UpgradeModule} from '@angular/upgrade/static';
 * ```
 *
 * See also the {@link UpgradeModule#examples examples} below.
 *
 * ### Mental Model
 *
 * When reasoning about how a hybrid application works it is useful to have a mental model which
 * describes what is happening and explains what is happening at the lowest level.
 *
 * 1. There are two independent frameworks running in a single application, each framework treats
 *    the other as a black box.
 * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
 *    instantiated the element is the owner. Each framework only updates/interacts with its own
 *    DOM elements and ignores others.
 * 3. AngularJS directives always execute inside the AngularJS framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular components always execute inside the Angular framework codebase regardless of
 *    where they are instantiated.
 * 5. An AngularJS component can be "upgraded"" to an Angular component. This is achieved by
 *    defining an Angular directive, which bootstraps the AngularJS component at its location
 *    in the DOM. See `UpgradeComponent`.
 * 6. An Angular component can be "downgraded" to an AngularJS component. This is achieved by
 *    defining an AngularJS directive, which bootstraps the Angular component at its location
 *    in the DOM. See `downgradeComponent`.
 * 7. Whenever an "upgraded"/"downgraded" component is instantiated the host element is owned by
 *    the framework doing the instantiation. The other framework then instantiates and owns the
 *    view for that component.
 *    1. This implies that the component bindings will always follow the semantics of the
 *       instantiation framework.
 *    2. The DOM attributes are parsed by the framework that owns the current template. So
 *       attributes in AngularJS templates must use kebab-case, while AngularJS templates must use
 *       camelCase.
 *    3. However the template binding syntax will always use the Angular style, e.g. square
 *       brackets (`[...]`) for property binding.
 * 8. Angular is bootstrapped first; AngularJS is bootstrapped second. AngularJS always owns the
 *    root component of the application.
 * 9. The new application is running in an Angular zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### The `UpgradeModule` class
 *
 * This class is an `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * * Core AngularJS services
 *   Importing this `NgModule` will add providers for the core
 *   [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * * Bootstrap
 *   The runtime instance of this class contains a {@link UpgradeModule#bootstrap `bootstrap()`}
 *   method, which you use to bootstrap the top level AngularJS module onto an element in the
 *   DOM for the hybrid upgrade app.
 *
 *   It also contains properties to access the {@link UpgradeModule#injector root injector}, the
 *   bootstrap `NgZone` and the
 *   [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
 *
 * ### Examples
 *
 * Import the `UpgradeModule` into your top level {@link NgModule Angular `NgModule`}.
 *
 * {@example upgrade/static/ts/full/module.ts region='ng2-module'}
 *
 * Then inject `UpgradeModule` into your Angular `NgModule` and use it to bootstrap the top level
 * [AngularJS module](https://docs.angularjs.org/api/ng/type/angular.Module) in the
 * `ngDoBootstrap()` method.
 *
 * {@example upgrade/static/ts/full/module.ts region='bootstrap-ng1'}
 *
 * Finally, kick off the whole process, by bootstraping your top level Angular `NgModule`.
 *
 * {@example upgrade/static/ts/full/module.ts region='bootstrap-ng2'}
 *
 * {@a upgrading-an-angular-1-service}
 * ### Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-text-formatter-service"}
 *
 * Then you should define an Angular provider to be included in your `NgModule` `providers`
 * property.
 *
 * {@example upgrade/static/ts/full/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {@example upgrade/static/ts/full/module.ts region="use-ng1-upgraded-service"}
 *
 * @publicApi
 */
let UpgradeModule = /** @class */ (() => {
    let UpgradeModule = class UpgradeModule {
        constructor(
        /** The root `Injector` for the upgrade application. */
        injector, 
        /** The bootstrap zone for the upgrade application */
        ngZone) {
            this.ngZone = ngZone;
            this.injector = new NgAdapterInjector(injector);
        }
        /**
         * Bootstrap an AngularJS application from this NgModule
         * @param element the element on which to bootstrap the AngularJS application
         * @param [modules] the AngularJS modules to bootstrap for this application
         * @param [config] optional extra AngularJS bootstrap configuration
         */
        bootstrap(element, modules = [], config /*angular.IAngularBootstrapConfig*/) {
            const INIT_MODULE_NAME = UPGRADE_MODULE_NAME + '.init';
            // Create an ng1 module to bootstrap
            const initModule = angularModule(INIT_MODULE_NAME, [])
                .constant(UPGRADE_APP_TYPE_KEY, 2 /* Static */)
                .value(INJECTOR_KEY, this.injector)
                .factory(LAZY_MODULE_REF, [INJECTOR_KEY, (injector) => ({ injector })])
                .config([
                $PROVIDE, $INJECTOR,
                ($provide, $injector) => {
                    if ($injector.has($$TESTABILITY)) {
                        $provide.decorator($$TESTABILITY, [
                            $DELEGATE,
                            (testabilityDelegate) => {
                                const originalWhenStable = testabilityDelegate.whenStable;
                                const injector = this.injector;
                                // Cannot use arrow function below because we need the context
                                const newWhenStable = function (callback) {
                                    originalWhenStable.call(testabilityDelegate, function () {
                                        const ng2Testability = injector.get(Testability);
                                        if (ng2Testability.isStable()) {
                                            callback();
                                        }
                                        else {
                                            ng2Testability.whenStable(newWhenStable.bind(testabilityDelegate, callback));
                                        }
                                    });
                                };
                                testabilityDelegate.whenStable = newWhenStable;
                                return testabilityDelegate;
                            }
                        ]);
                    }
                    if ($injector.has($INTERVAL)) {
                        $provide.decorator($INTERVAL, [
                            $DELEGATE,
                            (intervalDelegate) => {
                                // Wrap the $interval service so that setInterval is called outside NgZone,
                                // but the callback is still invoked within it. This is so that $interval
                                // won't block stability, which preserves the behavior from AngularJS.
                                let wrappedInterval = (fn, delay, count, invokeApply, ...pass) => {
                                    return this.ngZone.runOutsideAngular(() => {
                                        return intervalDelegate((...args) => {
                                            // Run callback in the next VM turn - $interval calls
                                            // $rootScope.$apply, and running the callback in NgZone will
                                            // cause a '$digest already in progress' error if it's in the
                                            // same vm turn.
                                            setTimeout(() => {
                                                this.ngZone.run(() => fn(...args));
                                            });
                                        }, delay, count, invokeApply, ...pass);
                                    });
                                };
                                wrappedInterval['cancel'] = intervalDelegate.cancel;
                                return wrappedInterval;
                            }
                        ]);
                    }
                }
            ])
                .run([
                $INJECTOR,
                ($injector) => {
                    this.$injector = $injector;
                    // Initialize the ng1 $injector provider
                    setTempInjectorRef($injector);
                    this.injector.get($INJECTOR);
                    // Put the injector on the DOM, so that it can be "required"
                    angularElement(element).data(controllerKey(INJECTOR_KEY), this.injector);
                    // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
                    // We need to do this in the next tick so that we don't prevent the bootup
                    // stabilizing
                    setTimeout(() => {
                        const $rootScope = $injector.get('$rootScope');
                        const subscription = this.ngZone.onMicrotaskEmpty.subscribe(() => {
                            if ($rootScope.$$phase) {
                                if (isDevMode()) {
                                    console.warn('A digest was triggered while one was already in progress. This may mean that something is triggering digests outside the Angular zone.');
                                }
                                return $rootScope.$evalAsync();
                            }
                            return $rootScope.$digest();
                        });
                        $rootScope.$on('$destroy', () => {
                            subscription.unsubscribe();
                        });
                    }, 0);
                }
            ]);
            const upgradeModule = angularModule(UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));
            // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
            const windowAngular = window['angular'];
            windowAngular.resumeBootstrap = undefined;
            // Bootstrap the AngularJS application inside our zone
            this.ngZone.run(() => {
                bootstrap(element, [upgradeModule.name], config);
            });
            // Patch resumeBootstrap() to run inside the ngZone
            if (windowAngular.resumeBootstrap) {
                const originalResumeBootstrap = windowAngular.resumeBootstrap;
                const ngZone = this.ngZone;
                windowAngular.resumeBootstrap = function () {
                    let args = arguments;
                    windowAngular.resumeBootstrap = originalResumeBootstrap;
                    return ngZone.run(() => windowAngular.resumeBootstrap.apply(this, args));
                };
            }
        }
    };
    UpgradeModule = __decorate([
        NgModule({ providers: [angular1Providers] }),
        __metadata("design:paramtypes", [Injector,
            NgZone])
    ], UpgradeModule);
    return UpgradeModule;
})();
export { UpgradeModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvdXBncmFkZV9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRWpGLE9BQU8sRUFBQyxTQUFTLEVBQUUsT0FBTyxJQUFJLGNBQWMsRUFBNEUsT0FBTyxJQUFJLGFBQWEsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBQ3ZMLE9BQU8sRUFBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsb0JBQW9CLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNsTCxPQUFPLEVBQUMsYUFBYSxFQUFnQyxNQUFNLDJCQUEyQixDQUFDO0FBRXZGLE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzNFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUl6Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRIRztBQUVIO0lBQUEsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYTtRQVF4QjtRQUNJLHVEQUF1RDtRQUN2RCxRQUFrQjtRQUNsQixxREFBcUQ7UUFDOUMsTUFBYztZQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixD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S0FBQTtTQTNKWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIGlzRGV2TW9kZSwgTmdNb2R1bGUsIE5nWm9uZSwgVGVzdGFiaWxpdHl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge2Jvb3RzdHJhcCwgZWxlbWVudCBhcyBhbmd1bGFyRWxlbWVudCwgSUluamVjdG9yU2VydmljZSwgSUludGVydmFsU2VydmljZSwgSVByb3ZpZGVTZXJ2aWNlLCBJVGVzdGFiaWxpdHlTZXJ2aWNlLCBtb2R1bGVfIGFzIGFuZ3VsYXJNb2R1bGV9IGZyb20gJy4uLy4uL3NyYy9jb21tb24vc3JjL2FuZ3VsYXIxJztcbmltcG9ydCB7JCRURVNUQUJJTElUWSwgJERFTEVHQVRFLCAkSU5KRUNUT1IsICRJTlRFUlZBTCwgJFBST1ZJREUsIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBVUEdSQURFX0FQUF9UWVBFX0tFWSwgVVBHUkFERV9NT0RVTEVfTkFNRX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7Y29udHJvbGxlcktleSwgTGF6eU1vZHVsZVJlZiwgVXBncmFkZUFwcFR5cGV9IGZyb20gJy4uLy4uL3NyYy9jb21tb24vc3JjL3V0aWwnO1xuXG5pbXBvcnQge2FuZ3VsYXIxUHJvdmlkZXJzLCBzZXRUZW1wSW5qZWN0b3JSZWZ9IGZyb20gJy4vYW5ndWxhcjFfcHJvdmlkZXJzJztcbmltcG9ydCB7TmdBZGFwdGVySW5qZWN0b3J9IGZyb20gJy4vdXRpbCc7XG5cblxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEFuIGBOZ01vZHVsZWAsIHdoaWNoIHlvdSBpbXBvcnQgdG8gcHJvdmlkZSBBbmd1bGFySlMgY29yZSBzZXJ2aWNlcyxcbiAqIGFuZCBoYXMgYW4gaW5zdGFuY2UgbWV0aG9kIHVzZWQgdG8gYm9vdHN0cmFwIHRoZSBoeWJyaWQgdXBncmFkZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZS9zdGF0aWMpXG4gKiBsaWJyYXJ5IGZvciBoeWJyaWQgdXBncmFkZSBhcHBzIHRoYXQgc3VwcG9ydCBBT1QgY29tcGlsYXRpb24qXG4gKlxuICogVGhlIGB1cGdyYWRlL3N0YXRpY2AgcGFja2FnZSBjb250YWlucyBoZWxwZXJzIHRoYXQgYWxsb3cgQW5ndWxhckpTIGFuZCBBbmd1bGFyIGNvbXBvbmVudHNcbiAqIHRvIGJlIHVzZWQgdG9nZXRoZXIgaW5zaWRlIGEgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24sIHdoaWNoIHN1cHBvcnRzIEFPVCBjb21waWxhdGlvbi5cbiAqXG4gKiBTcGVjaWZpY2FsbHksIHRoZSBjbGFzc2VzIGFuZCBmdW5jdGlvbnMgaW4gdGhlIGB1cGdyYWRlL3N0YXRpY2AgbW9kdWxlIGFsbG93IHRoZSBmb2xsb3dpbmc6XG4gKlxuICogMS4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhciBkaXJlY3RpdmUgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFySlMgY29tcG9uZW50IHNvXG4gKiAgICB0aGF0IGl0IGNhbiBiZSB1c2VkIGluIGFuIEFuZ3VsYXIgdGVtcGxhdGUuIFNlZSBgVXBncmFkZUNvbXBvbmVudGAuXG4gKiAyLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFySlMgZGlyZWN0aXZlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhciBjb21wb25lbnQgc29cbiAqICAgIHRoYXQgaXQgY2FuIGJlIHVzZWQgaW4gYW4gQW5ndWxhckpTIHRlbXBsYXRlLiBTZWUgYGRvd25ncmFkZUNvbXBvbmVudGAuXG4gKiAzLiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFyIHJvb3QgaW5qZWN0b3IgcHJvdmlkZXIgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFySlNcbiAqICAgIHNlcnZpY2Ugc28gdGhhdCBpdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBhbiBBbmd1bGFyIGNvbnRleHQuIFNlZVxuICogICAge0BsaW5rIFVwZ3JhZGVNb2R1bGUjdXBncmFkaW5nLWFuLWFuZ3VsYXItMS1zZXJ2aWNlIFVwZ3JhZGluZyBhbiBBbmd1bGFySlMgc2VydmljZX0gYmVsb3cuXG4gKiA0LiBDcmVhdGlvbiBvZiBhbiBBbmd1bGFySlMgc2VydmljZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXIgaW5qZWN0YWJsZVxuICogICAgc28gdGhhdCBpdCBjYW4gYmUgaW5qZWN0ZWQgaW50byBhbiBBbmd1bGFySlMgY29udGV4dC4gU2VlIGBkb3duZ3JhZGVJbmplY3RhYmxlYC5cbiAqIDMuIEJvb3RzdHJhcHBpbmcgb2YgYSBoeWJyaWQgQW5ndWxhciBhcHBsaWNhdGlvbiB3aGljaCBjb250YWlucyBib3RoIG9mIHRoZSBmcmFtZXdvcmtzXG4gKiAgICBjb2V4aXN0aW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7VXBncmFkZU1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWMnO1xuICogYGBgXG4gKlxuICogU2VlIGFsc28gdGhlIHtAbGluayBVcGdyYWRlTW9kdWxlI2V4YW1wbGVzIGV4YW1wbGVzfSBiZWxvdy5cbiAqXG4gKiAjIyMgTWVudGFsIE1vZGVsXG4gKlxuICogV2hlbiByZWFzb25pbmcgYWJvdXQgaG93IGEgaHlicmlkIGFwcGxpY2F0aW9uIHdvcmtzIGl0IGlzIHVzZWZ1bCB0byBoYXZlIGEgbWVudGFsIG1vZGVsIHdoaWNoXG4gKiBkZXNjcmliZXMgd2hhdCBpcyBoYXBwZW5pbmcgYW5kIGV4cGxhaW5zIHdoYXQgaXMgaGFwcGVuaW5nIGF0IHRoZSBsb3dlc3QgbGV2ZWwuXG4gKlxuICogMS4gVGhlcmUgYXJlIHR3byBpbmRlcGVuZGVudCBmcmFtZXdvcmtzIHJ1bm5pbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24sIGVhY2ggZnJhbWV3b3JrIHRyZWF0c1xuICogICAgdGhlIG90aGVyIGFzIGEgYmxhY2sgYm94LlxuICogMi4gRWFjaCBET00gZWxlbWVudCBvbiB0aGUgcGFnZSBpcyBvd25lZCBleGFjdGx5IGJ5IG9uZSBmcmFtZXdvcmsuIFdoaWNoZXZlciBmcmFtZXdvcmtcbiAqICAgIGluc3RhbnRpYXRlZCB0aGUgZWxlbWVudCBpcyB0aGUgb3duZXIuIEVhY2ggZnJhbWV3b3JrIG9ubHkgdXBkYXRlcy9pbnRlcmFjdHMgd2l0aCBpdHMgb3duXG4gKiAgICBET00gZWxlbWVudHMgYW5kIGlnbm9yZXMgb3RoZXJzLlxuICogMy4gQW5ndWxhckpTIGRpcmVjdGl2ZXMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIHRoZSBBbmd1bGFySlMgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDQuIEFuZ3VsYXIgY29tcG9uZW50cyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgdGhlIEFuZ3VsYXIgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDUuIEFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FuIGJlIFwidXBncmFkZWRcIlwiIHRvIGFuIEFuZ3VsYXIgY29tcG9uZW50LiBUaGlzIGlzIGFjaGlldmVkIGJ5XG4gKiAgICBkZWZpbmluZyBhbiBBbmd1bGFyIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBhdCBpdHMgbG9jYXRpb25cbiAqICAgIGluIHRoZSBET00uIFNlZSBgVXBncmFkZUNvbXBvbmVudGAuXG4gKiA2LiBBbiBBbmd1bGFyIGNvbXBvbmVudCBjYW4gYmUgXCJkb3duZ3JhZGVkXCIgdG8gYW4gQW5ndWxhckpTIGNvbXBvbmVudC4gVGhpcyBpcyBhY2hpZXZlZCBieVxuICogICAgZGVmaW5pbmcgYW4gQW5ndWxhckpTIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhciBjb21wb25lbnQgYXQgaXRzIGxvY2F0aW9uXG4gKiAgICBpbiB0aGUgRE9NLiBTZWUgYGRvd25ncmFkZUNvbXBvbmVudGAuXG4gKiA3LiBXaGVuZXZlciBhbiBcInVwZ3JhZGVkXCIvXCJkb3duZ3JhZGVkXCIgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5XG4gKiAgICB0aGUgZnJhbWV3b3JrIGRvaW5nIHRoZSBpbnN0YW50aWF0aW9uLiBUaGUgb3RoZXIgZnJhbWV3b3JrIHRoZW4gaW5zdGFudGlhdGVzIGFuZCBvd25zIHRoZVxuICogICAgdmlldyBmb3IgdGhhdCBjb21wb25lbnQuXG4gKiAgICAxLiBUaGlzIGltcGxpZXMgdGhhdCB0aGUgY29tcG9uZW50IGJpbmRpbmdzIHdpbGwgYWx3YXlzIGZvbGxvdyB0aGUgc2VtYW50aWNzIG9mIHRoZVxuICogICAgICAgaW5zdGFudGlhdGlvbiBmcmFtZXdvcmsuXG4gKiAgICAyLiBUaGUgRE9NIGF0dHJpYnV0ZXMgYXJlIHBhcnNlZCBieSB0aGUgZnJhbWV3b3JrIHRoYXQgb3ducyB0aGUgY3VycmVudCB0ZW1wbGF0ZS4gU29cbiAqICAgICAgIGF0dHJpYnV0ZXMgaW4gQW5ndWxhckpTIHRlbXBsYXRlcyBtdXN0IHVzZSBrZWJhYi1jYXNlLCB3aGlsZSBBbmd1bGFySlMgdGVtcGxhdGVzIG11c3QgdXNlXG4gKiAgICAgICBjYW1lbENhc2UuXG4gKiAgICAzLiBIb3dldmVyIHRoZSB0ZW1wbGF0ZSBiaW5kaW5nIHN5bnRheCB3aWxsIGFsd2F5cyB1c2UgdGhlIEFuZ3VsYXIgc3R5bGUsIGUuZy4gc3F1YXJlXG4gKiAgICAgICBicmFja2V0cyAoYFsuLi5dYCkgZm9yIHByb3BlcnR5IGJpbmRpbmcuXG4gKiA4LiBBbmd1bGFyIGlzIGJvb3RzdHJhcHBlZCBmaXJzdDsgQW5ndWxhckpTIGlzIGJvb3RzdHJhcHBlZCBzZWNvbmQuIEFuZ3VsYXJKUyBhbHdheXMgb3ducyB0aGVcbiAqICAgIHJvb3QgY29tcG9uZW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqIDkuIFRoZSBuZXcgYXBwbGljYXRpb24gaXMgcnVubmluZyBpbiBhbiBBbmd1bGFyIHpvbmUsIGFuZCB0aGVyZWZvcmUgaXQgbm8gbG9uZ2VyIG5lZWRzIGNhbGxzIHRvXG4gKiAgICBgJGFwcGx5KClgLlxuICpcbiAqICMjIyBUaGUgYFVwZ3JhZGVNb2R1bGVgIGNsYXNzXG4gKlxuICogVGhpcyBjbGFzcyBpcyBhbiBgTmdNb2R1bGVgLCB3aGljaCB5b3UgaW1wb3J0IHRvIHByb3ZpZGUgQW5ndWxhckpTIGNvcmUgc2VydmljZXMsXG4gKiBhbmQgaGFzIGFuIGluc3RhbmNlIG1ldGhvZCB1c2VkIHRvIGJvb3RzdHJhcCB0aGUgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gKlxuICogKiBDb3JlIEFuZ3VsYXJKUyBzZXJ2aWNlc1xuICogICBJbXBvcnRpbmcgdGhpcyBgTmdNb2R1bGVgIHdpbGwgYWRkIHByb3ZpZGVycyBmb3IgdGhlIGNvcmVcbiAqICAgW0FuZ3VsYXJKUyBzZXJ2aWNlc10oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3NlcnZpY2UpIHRvIHRoZSByb290IGluamVjdG9yLlxuICpcbiAqICogQm9vdHN0cmFwXG4gKiAgIFRoZSBydW50aW1lIGluc3RhbmNlIG9mIHRoaXMgY2xhc3MgY29udGFpbnMgYSB7QGxpbmsgVXBncmFkZU1vZHVsZSNib290c3RyYXAgYGJvb3RzdHJhcCgpYH1cbiAqICAgbWV0aG9kLCB3aGljaCB5b3UgdXNlIHRvIGJvb3RzdHJhcCB0aGUgdG9wIGxldmVsIEFuZ3VsYXJKUyBtb2R1bGUgb250byBhbiBlbGVtZW50IGluIHRoZVxuICogICBET00gZm9yIHRoZSBoeWJyaWQgdXBncmFkZSBhcHAuXG4gKlxuICogICBJdCBhbHNvIGNvbnRhaW5zIHByb3BlcnRpZXMgdG8gYWNjZXNzIHRoZSB7QGxpbmsgVXBncmFkZU1vZHVsZSNpbmplY3RvciByb290IGluamVjdG9yfSwgdGhlXG4gKiAgIGJvb3RzdHJhcCBgTmdab25lYCBhbmQgdGhlXG4gKiAgIFtBbmd1bGFySlMgJGluamVjdG9yXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvYXV0by9zZXJ2aWNlLyRpbmplY3RvcikuXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogSW1wb3J0IHRoZSBgVXBncmFkZU1vZHVsZWAgaW50byB5b3VyIHRvcCBsZXZlbCB7QGxpbmsgTmdNb2R1bGUgQW5ndWxhciBgTmdNb2R1bGVgfS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPSduZzItbW9kdWxlJ31cbiAqXG4gKiBUaGVuIGluamVjdCBgVXBncmFkZU1vZHVsZWAgaW50byB5b3VyIEFuZ3VsYXIgYE5nTW9kdWxlYCBhbmQgdXNlIGl0IHRvIGJvb3RzdHJhcCB0aGUgdG9wIGxldmVsXG4gKiBbQW5ndWxhckpTIG1vZHVsZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvYW5ndWxhci5Nb2R1bGUpIGluIHRoZVxuICogYG5nRG9Cb290c3RyYXAoKWAgbWV0aG9kLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J2Jvb3RzdHJhcC1uZzEnfVxuICpcbiAqIEZpbmFsbHksIGtpY2sgb2ZmIHRoZSB3aG9sZSBwcm9jZXNzLCBieSBib290c3RyYXBpbmcgeW91ciB0b3AgbGV2ZWwgQW5ndWxhciBgTmdNb2R1bGVgLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J2Jvb3RzdHJhcC1uZzInfVxuICpcbiAqIHtAYSB1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2V9XG4gKiAjIyMgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlXG4gKlxuICogVGhlcmUgaXMgbm8gc3BlY2lmaWMgQVBJIGZvciB1cGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2UuIEluc3RlYWQgeW91IHNob3VsZCBqdXN0IGZvbGxvdyB0aGVcbiAqIGZvbGxvd2luZyByZWNpcGU6XG4gKlxuICogTGV0J3Mgc2F5IHlvdSBoYXZlIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlOlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtdGV4dC1mb3JtYXR0ZXItc2VydmljZVwifVxuICpcbiAqIFRoZW4geW91IHNob3VsZCBkZWZpbmUgYW4gQW5ndWxhciBwcm92aWRlciB0byBiZSBpbmNsdWRlZCBpbiB5b3VyIGBOZ01vZHVsZWAgYHByb3ZpZGVyc2BcbiAqIHByb3BlcnR5LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJ1cGdyYWRlLW5nMS1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3UgY2FuIHVzZSB0aGUgXCJ1cGdyYWRlZFwiIEFuZ3VsYXJKUyBzZXJ2aWNlIGJ5IGluamVjdGluZyBpdCBpbnRvIGFuIEFuZ3VsYXIgY29tcG9uZW50XG4gKiBvciBzZXJ2aWNlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJ1c2UtbmcxLXVwZ3JhZGVkLXNlcnZpY2VcIn1cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBOZ01vZHVsZSh7cHJvdmlkZXJzOiBbYW5ndWxhcjFQcm92aWRlcnNdfSlcbmV4cG9ydCBjbGFzcyBVcGdyYWRlTW9kdWxlIHtcbiAgLyoqXG4gICAqIFRoZSBBbmd1bGFySlMgYCRpbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljICRpbmplY3RvcjogYW55IC8qYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKi87XG4gIC8qKiBUaGUgQW5ndWxhciBJbmplY3RvciAqKi9cbiAgcHVibGljIGluamVjdG9yOiBJbmplY3RvcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBUaGUgcm9vdCBgSW5qZWN0b3JgIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi4gKi9cbiAgICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgIC8qKiBUaGUgYm9vdHN0cmFwIHpvbmUgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uICovXG4gICAgICBwdWJsaWMgbmdab25lOiBOZ1pvbmUpIHtcbiAgICB0aGlzLmluamVjdG9yID0gbmV3IE5nQWRhcHRlckluamVjdG9yKGluamVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYW4gQW5ndWxhckpTIGFwcGxpY2F0aW9uIGZyb20gdGhpcyBOZ01vZHVsZVxuICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCBvbiB3aGljaCB0byBib290c3RyYXAgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gW21vZHVsZXNdIHRoZSBBbmd1bGFySlMgbW9kdWxlcyB0byBib290c3RyYXAgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIFtjb25maWddIG9wdGlvbmFsIGV4dHJhIEFuZ3VsYXJKUyBib290c3RyYXAgY29uZmlndXJhdGlvblxuICAgKi9cbiAgYm9vdHN0cmFwKFxuICAgICAgZWxlbWVudDogRWxlbWVudCwgbW9kdWxlczogc3RyaW5nW10gPSBbXSwgY29uZmlnPzogYW55IC8qYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyovKSB7XG4gICAgY29uc3QgSU5JVF9NT0RVTEVfTkFNRSA9IFVQR1JBREVfTU9EVUxFX05BTUUgKyAnLmluaXQnO1xuXG4gICAgLy8gQ3JlYXRlIGFuIG5nMSBtb2R1bGUgdG8gYm9vdHN0cmFwXG4gICAgY29uc3QgaW5pdE1vZHVsZSA9XG4gICAgICAgIGFuZ3VsYXJNb2R1bGUoSU5JVF9NT0RVTEVfTkFNRSwgW10pXG5cbiAgICAgICAgICAgIC5jb25zdGFudChVUEdSQURFX0FQUF9UWVBFX0tFWSwgVXBncmFkZUFwcFR5cGUuU3RhdGljKVxuXG4gICAgICAgICAgICAudmFsdWUoSU5KRUNUT1JfS0VZLCB0aGlzLmluamVjdG9yKVxuXG4gICAgICAgICAgICAuZmFjdG9yeShcbiAgICAgICAgICAgICAgICBMQVpZX01PRFVMRV9SRUYsXG4gICAgICAgICAgICAgICAgW0lOSkVDVE9SX0tFWSwgKGluamVjdG9yOiBJbmplY3RvcikgPT4gKHtpbmplY3Rvcn0gYXMgTGF6eU1vZHVsZVJlZildKVxuXG4gICAgICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAgICAgJFBST1ZJREUsICRJTkpFQ1RPUixcbiAgICAgICAgICAgICAgKCRwcm92aWRlOiBJUHJvdmlkZVNlcnZpY2UsICRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICgkaW5qZWN0b3IuaGFzKCQkVEVTVEFCSUxJVFkpKSB7XG4gICAgICAgICAgICAgICAgICAkcHJvdmlkZS5kZWNvcmF0b3IoJCRURVNUQUJJTElUWSwgW1xuICAgICAgICAgICAgICAgICAgICAkREVMRUdBVEUsXG4gICAgICAgICAgICAgICAgICAgICh0ZXN0YWJpbGl0eURlbGVnYXRlOiBJVGVzdGFiaWxpdHlTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmplY3RvciA9IHRoaXMuaW5qZWN0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdXaGVuU3RhYmxlID0gZnVuY3Rpb24oY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFdoZW5TdGFibGUuY2FsbCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID0gaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5nMlRlc3RhYmlsaXR5LmlzU3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nMlRlc3RhYmlsaXR5LndoZW5TdGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1doZW5TdGFibGUuYmluZCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBjYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdGFiaWxpdHlEZWxlZ2F0ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJElOVEVSVkFMKSkge1xuICAgICAgICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCRJTlRFUlZBTCwgW1xuICAgICAgICAgICAgICAgICAgICAkREVMRUdBVEUsXG4gICAgICAgICAgICAgICAgICAgIChpbnRlcnZhbERlbGVnYXRlOiBJSW50ZXJ2YWxTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gV3JhcCB0aGUgJGludGVydmFsIHNlcnZpY2Ugc28gdGhhdCBzZXRJbnRlcnZhbCBpcyBjYWxsZWQgb3V0c2lkZSBOZ1pvbmUsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gYnV0IHRoZSBjYWxsYmFjayBpcyBzdGlsbCBpbnZva2VkIHdpdGhpbiBpdC4gVGhpcyBpcyBzbyB0aGF0ICRpbnRlcnZhbFxuICAgICAgICAgICAgICAgICAgICAgIC8vIHdvbid0IGJsb2NrIHN0YWJpbGl0eSwgd2hpY2ggcHJlc2VydmVzIHRoZSBiZWhhdmlvciBmcm9tIEFuZ3VsYXJKUy5cbiAgICAgICAgICAgICAgICAgICAgICBsZXQgd3JhcHBlZEludGVydmFsID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKGZuOiBGdW5jdGlvbiwgZGVsYXk6IG51bWJlciwgY291bnQ/OiBudW1iZXIsIGludm9rZUFwcGx5PzogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnBhc3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnRlcnZhbERlbGVnYXRlKCguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSdW4gY2FsbGJhY2sgaW4gdGhlIG5leHQgVk0gdHVybiAtICRpbnRlcnZhbCBjYWxsc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAkcm9vdFNjb3BlLiRhcHBseSwgYW5kIHJ1bm5pbmcgdGhlIGNhbGxiYWNrIGluIE5nWm9uZSB3aWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhdXNlIGEgJyRkaWdlc3QgYWxyZWFkeSBpbiBwcm9ncmVzcycgZXJyb3IgaWYgaXQncyBpbiB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2FtZSB2bSB0dXJuLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gZm4oLi4uYXJncykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGRlbGF5LCBjb3VudCwgaW52b2tlQXBwbHksIC4uLnBhc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgKHdyYXBwZWRJbnRlcnZhbCBhcyBhbnkpWydjYW5jZWwnXSA9IGludGVydmFsRGVsZWdhdGUuY2FuY2VsO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3cmFwcGVkSW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgLnJ1bihbXG4gICAgICAgICAgICAgICRJTkpFQ1RPUixcbiAgICAgICAgICAgICAgKCRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJGluamVjdG9yID0gJGluamVjdG9yO1xuXG4gICAgICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSB0aGUgbmcxICRpbmplY3RvciBwcm92aWRlclxuICAgICAgICAgICAgICAgIHNldFRlbXBJbmplY3RvclJlZigkaW5qZWN0b3IpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5qZWN0b3IuZ2V0KCRJTkpFQ1RPUik7XG5cbiAgICAgICAgICAgICAgICAvLyBQdXQgdGhlIGluamVjdG9yIG9uIHRoZSBET00sIHNvIHRoYXQgaXQgY2FuIGJlIFwicmVxdWlyZWRcIlxuICAgICAgICAgICAgICAgIGFuZ3VsYXJFbGVtZW50KGVsZW1lbnQpLmRhdGEhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgdGhpcy5pbmplY3Rvcik7XG5cbiAgICAgICAgICAgICAgICAvLyBXaXJlIHVwIHRoZSBuZzEgcm9vdFNjb3BlIHRvIHJ1biBhIGRpZ2VzdCBjeWNsZSB3aGVuZXZlciB0aGUgem9uZSBzZXR0bGVzXG4gICAgICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBkbyB0aGlzIGluIHRoZSBuZXh0IHRpY2sgc28gdGhhdCB3ZSBkb24ndCBwcmV2ZW50IHRoZSBib290dXBcbiAgICAgICAgICAgICAgICAvLyBzdGFiaWxpemluZ1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc3QgJHJvb3RTY29wZSA9ICRpbmplY3Rvci5nZXQoJyRyb290U2NvcGUnKTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMubmdab25lLm9uTWljcm90YXNrRW1wdHkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCRyb290U2NvcGUuJCRwaGFzZSkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdBIGRpZ2VzdCB3YXMgdHJpZ2dlcmVkIHdoaWxlIG9uZSB3YXMgYWxyZWFkeSBpbiBwcm9ncmVzcy4gVGhpcyBtYXkgbWVhbiB0aGF0IHNvbWV0aGluZyBpcyB0cmlnZ2VyaW5nIGRpZ2VzdHMgb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lLicpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAkcm9vdFNjb3BlLiRldmFsQXN5bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcblxuICAgIGNvbnN0IHVwZ3JhZGVNb2R1bGUgPSBhbmd1bGFyTW9kdWxlKFVQR1JBREVfTU9EVUxFX05BTUUsIFtJTklUX01PRFVMRV9OQU1FXS5jb25jYXQobW9kdWxlcykpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHJlc3VtZUJvb3RzdHJhcCgpIG9ubHkgZXhpc3RzIGlmIHRoZSBjdXJyZW50IGJvb3RzdHJhcCBpcyBkZWZlcnJlZFxuICAgIGNvbnN0IHdpbmRvd0FuZ3VsYXIgPSAod2luZG93IGFzIGFueSlbJ2FuZ3VsYXInXTtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIEJvb3RzdHJhcCB0aGUgQW5ndWxhckpTIGFwcGxpY2F0aW9uIGluc2lkZSBvdXIgem9uZVxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICBib290c3RyYXAoZWxlbWVudCwgW3VwZ3JhZGVNb2R1bGUubmFtZV0sIGNvbmZpZyk7XG4gICAgfSk7XG5cbiAgICAvLyBQYXRjaCByZXN1bWVCb290c3RyYXAoKSB0byBydW4gaW5zaWRlIHRoZSBuZ1pvbmVcbiAgICBpZiAod2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXApIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXA7XG4gICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLm5nWm9uZTtcbiAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICByZXR1cm4gbmdab25lLnJ1bigoKSA9PiB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcC5hcHBseSh0aGlzLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuIl19