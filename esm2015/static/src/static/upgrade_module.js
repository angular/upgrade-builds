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
import { Injector, NgModule, NgZone, Testability } from '@angular/core';
import * as angular from '../common/angular1';
import { $$TESTABILITY, $DELEGATE, $INJECTOR, $INTERVAL, $PROVIDE, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_MODULE_NAME } from '../common/constants';
import { controllerKey } from '../common/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
/**
 * \@description
 *
 * An `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * The `upgrade/static` package contains helpers that allow AngularJS and Angular components
 * to be used together inside a hybrid upgrade application, which supports AoT compilation.
 *
 * Specifically, the classes and functions in the `upgrade/static` module allow the following:
 *
 * 1. Creation of an Angular directive that wraps and exposes an AngularJS component so
 *    that it can be used in an Angular template. See `UpgradeComponent`.
 * 2. Creation of an AngularJS directive that wraps and exposes an Angular component so
 *    that it can be used in an AngularJS template. See `downgradeComponent`.
 * 3. Creation of an Angular root injector provider that wraps and exposes an AngularJS
 *    service so that it can be injected into an Angular context. See
 *    {\@link UpgradeModule#upgrading-an-angular-1-service Upgrading an AngularJS service} below.
 * 4. Creation of an AngularJS service that wraps and exposes an Angular injectable
 *    so that it can be injected into an AngularJS context. See `downgradeInjectable`.
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * \@usageNotes
 *
 * ```ts
 * import {UpgradeModule} from '\@angular/upgrade/static';
 * ```
 *
 * See also the {\@link UpgradeModule#examples examples} below.
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
 * #### Core AngularJS services
 * Importing this `NgModule` will add providers for the core
 * [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * #### Bootstrap
 * The runtime instance of this class contains a {\@link UpgradeModule#bootstrap `bootstrap()`}
 * method, which you use to bootstrap the top level AngularJS module onto an element in the
 * DOM for the hybrid upgrade app.
 *
 * It also contains properties to access the {\@link UpgradeModule#injector root injector}, the
 * bootstrap `NgZone` and the
 * [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
 *
 * ### Examples
 *
 * Import the `UpgradeModule` into your top level {\@link NgModule Angular `NgModule`}.
 *
 * {\@example upgrade/static/ts/full/module.ts region='ng2-module'}
 *
 * Then inject `UpgradeModule` into your Angular `NgModule` and use it to bootstrap the top level
 * [AngularJS module](https://docs.angularjs.org/api/ng/type/angular.Module) in the
 * `ngDoBootstrap()` method.
 *
 * {\@example upgrade/static/ts/full/module.ts region='bootstrap-ng1'}
 *
 * Finally, kick off the whole process, by bootstraping your top level Angular `NgModule`.
 *
 * {\@example upgrade/static/ts/full/module.ts region='bootstrap-ng2'}
 *
 * {\@a upgrading-an-angular-1-service}
 * ### Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng1-text-formatter-service"}
 *
 * Then you should define an Angular provider to be included in your `NgModule` `providers`
 * property.
 *
 * {\@example upgrade/static/ts/full/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {\@example upgrade/static/ts/full/module.ts region="use-ng1-upgraded-service"}
 *
 * \@experimental
 */
export class UpgradeModule {
    /**
     * @param {?} injector
     * @param {?} ngZone
     */
    constructor(/** The root `Injector` for the upgrade application. */
    /** The root `Injector` for the upgrade application. */
    injector, ngZone) {
        this.ngZone = ngZone;
        this.injector = new NgAdapterInjector(injector);
    }
    /**
     * Bootstrap an AngularJS application from this NgModule
     * @param {?} element the element on which to bootstrap the AngularJS application
     * @param {?=} modules
     * @param {?=} config
     * @return {?}
     */
    bootstrap(element, modules = [], config /*angular.IAngularBootstrapConfig*/) {
        /** @type {?} */
        const INIT_MODULE_NAME = UPGRADE_MODULE_NAME + '.init';
        /** @type {?} */
        const initModule = angular
            .module(INIT_MODULE_NAME, [])
            .value(INJECTOR_KEY, this.injector)
            .factory(LAZY_MODULE_REF, [
            INJECTOR_KEY,
            (injector) => (/** @type {?} */ ({ injector, needsNgZone: false }))
        ])
            .config([
            $PROVIDE, $INJECTOR,
            ($provide, $injector) => {
                if ($injector.has($$TESTABILITY)) {
                    $provide.decorator($$TESTABILITY, [
                        $DELEGATE,
                        (testabilityDelegate) => {
                            /** @type {?} */
                            const originalWhenStable = testabilityDelegate.whenStable;
                            /** @type {?} */
                            const injector = this.injector;
                            /** @type {?} */
                            const newWhenStable = function (callback) {
                                originalWhenStable.call(testabilityDelegate, function () {
                                    /** @type {?} */
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
                            /** @type {?} */
                            let wrappedInterval = (fn, delay, count, invokeApply, ...pass) => {
                                return this.ngZone.runOutsideAngular(() => {
                                    return intervalDelegate((...args) => {
                                        // Run callback in the next VM turn - $interval calls
                                        // $rootScope.$apply, and running the callback in NgZone will
                                        // cause a '$digest already in progress' error if it's in the
                                        // same vm turn.
                                        setTimeout(() => { this.ngZone.run(() => fn(...args)); });
                                    }, delay, count, invokeApply, ...pass);
                                });
                            };
                            (/** @type {?} */ (wrappedInterval))['cancel'] = intervalDelegate.cancel;
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
                this.injector.get($INJECTOR); /** @type {?} */
                ((
                // Put the injector on the DOM, so that it can be "required"
                angular.element(element).data))(controllerKey(INJECTOR_KEY), this.injector);
                // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
                // We need to do this in the next tick so that we don't prevent the bootup
                // stabilizing
                setTimeout(() => {
                    /** @type {?} */
                    const $rootScope = $injector.get('$rootScope');
                    /** @type {?} */
                    const subscription = this.ngZone.onMicrotaskEmpty.subscribe(() => $rootScope.$digest());
                    $rootScope.$on('$destroy', () => { subscription.unsubscribe(); });
                }, 0);
            }
        ]);
        /** @type {?} */
        const upgradeModule = angular.module(UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));
        /** @type {?} */
        const windowAngular = (/** @type {?} */ (window))['angular'];
        windowAngular.resumeBootstrap = undefined;
        // Bootstrap the AngularJS application inside our zone
        this.ngZone.run(() => { angular.bootstrap(element, [upgradeModule.name], config); });
        // Patch resumeBootstrap() to run inside the ngZone
        if (windowAngular.resumeBootstrap) {
            /** @type {?} */
            const originalResumeBootstrap = windowAngular.resumeBootstrap;
            /** @type {?} */
            const ngZone = this.ngZone;
            windowAngular.resumeBootstrap = function () {
                /** @type {?} */
                let args = arguments;
                windowAngular.resumeBootstrap = originalResumeBootstrap;
                return ngZone.run(() => windowAngular.resumeBootstrap.apply(this, args));
            };
        }
    }
}
UpgradeModule.decorators = [
    { type: NgModule, args: [{ providers: [angular1Providers] },] }
];
/** @nocollapse */
UpgradeModule.ctorParameters = () => [
    { type: Injector },
    { type: NgZone }
];
if (false) {
    /**
     * The AngularJS `$injector` for the upgrade application.
     * @type {?}
     */
    UpgradeModule.prototype.$injector;
    /**
     * The Angular Injector *
     * @type {?}
     */
    UpgradeModule.prototype.injector;
    /**
     * The bootstrap zone for the upgrade application
     * @type {?}
     */
    UpgradeModule.prototype.ngZone;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvc3RhdGljL3VwZ3JhZGVfbW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV0RSxPQUFPLEtBQUssT0FBTyxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsbUJBQW1CLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNqSixPQUFPLEVBQWdCLGFBQWEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTVELE9BQU8sRUFBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQzNFLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUl6QyxNQUFNOzs7OztJQVFKO0lBRUksQUFEQSx1REFBdUQ7SUFDdkQsUUFBa0IsRUFFWDtRQUFBLFdBQU0sR0FBTixNQUFNO1FBQ2YsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ2pEOzs7Ozs7OztJQVFELFNBQVMsQ0FDTCxPQUFnQixFQUFFLFVBQW9CLEVBQUUsRUFBRSxNQUFZOztRQUN4RCxNQUFNLGdCQUFnQixHQUFHLG1CQUFtQixHQUFH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O2dCQUM5QixJQUFJLElBQUksR0FBRyxTQUFTLENBQUM7Z0JBQ3JCLGFBQWEsQ0FBQyxlQUFlLEdBQUcsdUJBQXVCLENBQUM7Z0JBQ3hELE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUMxRSxDQUFDO1NBQ0g7S0FDRjs7O1lBN0lGLFFBQVEsU0FBQyxFQUFDLFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUM7Ozs7WUF2SWxDLFFBQVE7WUFBWSxNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBOZ01vZHVsZSwgTmdab25lLCBUZXN0YWJpbGl0eX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi4vY29tbW9uL2FuZ3VsYXIxJztcbmltcG9ydCB7JCRURVNUQUJJTElUWSwgJERFTEVHQVRFLCAkSU5KRUNUT1IsICRJTlRFUlZBTCwgJFBST1ZJREUsIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBVUEdSQURFX01PRFVMRV9OQU1FfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7TGF6eU1vZHVsZVJlZiwgY29udHJvbGxlcktleX0gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuXG5pbXBvcnQge2FuZ3VsYXIxUHJvdmlkZXJzLCBzZXRUZW1wSW5qZWN0b3JSZWZ9IGZyb20gJy4vYW5ndWxhcjFfcHJvdmlkZXJzJztcbmltcG9ydCB7TmdBZGFwdGVySW5qZWN0b3J9IGZyb20gJy4vdXRpbCc7XG5cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBbiBgTmdNb2R1bGVgLCB3aGljaCB5b3UgaW1wb3J0IHRvIHByb3ZpZGUgQW5ndWxhckpTIGNvcmUgc2VydmljZXMsXG4gKiBhbmQgaGFzIGFuIGluc3RhbmNlIG1ldGhvZCB1c2VkIHRvIGJvb3RzdHJhcCB0aGUgaHlicmlkIHVwZ3JhZGUgYXBwbGljYXRpb24uXG4gKlxuICogKlBhcnQgb2YgdGhlIFt1cGdyYWRlL3N0YXRpY10oYXBpP3F1ZXJ5PXVwZ3JhZGUvc3RhdGljKVxuICogbGlicmFyeSBmb3IgaHlicmlkIHVwZ3JhZGUgYXBwcyB0aGF0IHN1cHBvcnQgQW9UIGNvbXBpbGF0aW9uKlxuICpcbiAqIFRoZSBgdXBncmFkZS9zdGF0aWNgIHBhY2thZ2UgY29udGFpbnMgaGVscGVycyB0aGF0IGFsbG93IEFuZ3VsYXJKUyBhbmQgQW5ndWxhciBjb21wb25lbnRzXG4gKiB0byBiZSB1c2VkIHRvZ2V0aGVyIGluc2lkZSBhIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLCB3aGljaCBzdXBwb3J0cyBBb1QgY29tcGlsYXRpb24uXG4gKlxuICogU3BlY2lmaWNhbGx5LCB0aGUgY2xhc3NlcyBhbmQgZnVuY3Rpb25zIGluIHRoZSBgdXBncmFkZS9zdGF0aWNgIG1vZHVsZSBhbGxvdyB0aGUgZm9sbG93aW5nOlxuICpcbiAqIDEuIENyZWF0aW9uIG9mIGFuIEFuZ3VsYXIgZGlyZWN0aXZlIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhckpTIGNvbXBvbmVudCBzb1xuICogICAgdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiBhbiBBbmd1bGFyIHRlbXBsYXRlLiBTZWUgYFVwZ3JhZGVDb21wb25lbnRgLlxuICogMi4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhckpTIGRpcmVjdGl2ZSB0aGF0IHdyYXBzIGFuZCBleHBvc2VzIGFuIEFuZ3VsYXIgY29tcG9uZW50IHNvXG4gKiAgICB0aGF0IGl0IGNhbiBiZSB1c2VkIGluIGFuIEFuZ3VsYXJKUyB0ZW1wbGF0ZS4gU2VlIGBkb3duZ3JhZGVDb21wb25lbnRgLlxuICogMy4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhciByb290IGluamVjdG9yIHByb3ZpZGVyIHRoYXQgd3JhcHMgYW5kIGV4cG9zZXMgYW4gQW5ndWxhckpTXG4gKiAgICBzZXJ2aWNlIHNvIHRoYXQgaXQgY2FuIGJlIGluamVjdGVkIGludG8gYW4gQW5ndWxhciBjb250ZXh0LiBTZWVcbiAqICAgIHtAbGluayBVcGdyYWRlTW9kdWxlI3VwZ3JhZGluZy1hbi1hbmd1bGFyLTEtc2VydmljZSBVcGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2V9IGJlbG93LlxuICogNC4gQ3JlYXRpb24gb2YgYW4gQW5ndWxhckpTIHNlcnZpY2UgdGhhdCB3cmFwcyBhbmQgZXhwb3NlcyBhbiBBbmd1bGFyIGluamVjdGFibGVcbiAqICAgIHNvIHRoYXQgaXQgY2FuIGJlIGluamVjdGVkIGludG8gYW4gQW5ndWxhckpTIGNvbnRleHQuIFNlZSBgZG93bmdyYWRlSW5qZWN0YWJsZWAuXG4gKiAzLiBCb290c3RyYXBwaW5nIG9mIGEgaHlicmlkIEFuZ3VsYXIgYXBwbGljYXRpb24gd2hpY2ggY29udGFpbnMgYm90aCBvZiB0aGUgZnJhbWV3b3Jrc1xuICogICAgY29leGlzdGluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1VwZ3JhZGVNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL3VwZ3JhZGUvc3RhdGljJztcbiAqIGBgYFxuICpcbiAqIFNlZSBhbHNvIHRoZSB7QGxpbmsgVXBncmFkZU1vZHVsZSNleGFtcGxlcyBleGFtcGxlc30gYmVsb3cuXG4gKlxuICogIyMjIE1lbnRhbCBNb2RlbFxuICpcbiAqIFdoZW4gcmVhc29uaW5nIGFib3V0IGhvdyBhIGh5YnJpZCBhcHBsaWNhdGlvbiB3b3JrcyBpdCBpcyB1c2VmdWwgdG8gaGF2ZSBhIG1lbnRhbCBtb2RlbCB3aGljaFxuICogZGVzY3JpYmVzIHdoYXQgaXMgaGFwcGVuaW5nIGFuZCBleHBsYWlucyB3aGF0IGlzIGhhcHBlbmluZyBhdCB0aGUgbG93ZXN0IGxldmVsLlxuICpcbiAqIDEuIFRoZXJlIGFyZSB0d28gaW5kZXBlbmRlbnQgZnJhbWV3b3JrcyBydW5uaW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLCBlYWNoIGZyYW1ld29yayB0cmVhdHNcbiAqICAgIHRoZSBvdGhlciBhcyBhIGJsYWNrIGJveC5cbiAqIDIuIEVhY2ggRE9NIGVsZW1lbnQgb24gdGhlIHBhZ2UgaXMgb3duZWQgZXhhY3RseSBieSBvbmUgZnJhbWV3b3JrLiBXaGljaGV2ZXIgZnJhbWV3b3JrXG4gKiAgICBpbnN0YW50aWF0ZWQgdGhlIGVsZW1lbnQgaXMgdGhlIG93bmVyLiBFYWNoIGZyYW1ld29yayBvbmx5IHVwZGF0ZXMvaW50ZXJhY3RzIHdpdGggaXRzIG93blxuICogICAgRE9NIGVsZW1lbnRzIGFuZCBpZ25vcmVzIG90aGVycy5cbiAqIDMuIEFuZ3VsYXJKUyBkaXJlY3RpdmVzIGFsd2F5cyBleGVjdXRlIGluc2lkZSB0aGUgQW5ndWxhckpTIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA0LiBBbmd1bGFyIGNvbXBvbmVudHMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIHRoZSBBbmd1bGFyIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA1LiBBbiBBbmd1bGFySlMgY29tcG9uZW50IGNhbiBiZSBcInVwZ3JhZGVkXCJcIiB0byBhbiBBbmd1bGFyIGNvbXBvbmVudC4gVGhpcyBpcyBhY2hpZXZlZCBieVxuICogICAgZGVmaW5pbmcgYW4gQW5ndWxhciBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXJKUyBjb21wb25lbnQgYXQgaXRzIGxvY2F0aW9uXG4gKiAgICBpbiB0aGUgRE9NLiBTZWUgYFVwZ3JhZGVDb21wb25lbnRgLlxuICogNi4gQW4gQW5ndWxhciBjb21wb25lbnQgY2FuIGJlIFwiZG93bmdyYWRlZFwiIHRvIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQuIFRoaXMgaXMgYWNoaWV2ZWQgYnlcbiAqICAgIGRlZmluaW5nIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXIgY29tcG9uZW50IGF0IGl0cyBsb2NhdGlvblxuICogICAgaW4gdGhlIERPTS4gU2VlIGBkb3duZ3JhZGVDb21wb25lbnRgLlxuICogNy4gV2hlbmV2ZXIgYW4gXCJ1cGdyYWRlZFwiL1wiZG93bmdyYWRlZFwiIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieVxuICogICAgdGhlIGZyYW1ld29yayBkb2luZyB0aGUgaW5zdGFudGlhdGlvbi4gVGhlIG90aGVyIGZyYW1ld29yayB0aGVuIGluc3RhbnRpYXRlcyBhbmQgb3ducyB0aGVcbiAqICAgIHZpZXcgZm9yIHRoYXQgY29tcG9uZW50LlxuICogICAgMS4gVGhpcyBpbXBsaWVzIHRoYXQgdGhlIGNvbXBvbmVudCBiaW5kaW5ncyB3aWxsIGFsd2F5cyBmb2xsb3cgdGhlIHNlbWFudGljcyBvZiB0aGVcbiAqICAgICAgIGluc3RhbnRpYXRpb24gZnJhbWV3b3JrLlxuICogICAgMi4gVGhlIERPTSBhdHRyaWJ1dGVzIGFyZSBwYXJzZWQgYnkgdGhlIGZyYW1ld29yayB0aGF0IG93bnMgdGhlIGN1cnJlbnQgdGVtcGxhdGUuIFNvXG4gKiAgICAgICBhdHRyaWJ1dGVzIGluIEFuZ3VsYXJKUyB0ZW1wbGF0ZXMgbXVzdCB1c2Uga2ViYWItY2FzZSwgd2hpbGUgQW5ndWxhckpTIHRlbXBsYXRlcyBtdXN0IHVzZVxuICogICAgICAgY2FtZWxDYXNlLlxuICogICAgMy4gSG93ZXZlciB0aGUgdGVtcGxhdGUgYmluZGluZyBzeW50YXggd2lsbCBhbHdheXMgdXNlIHRoZSBBbmd1bGFyIHN0eWxlLCBlLmcuIHNxdWFyZVxuICogICAgICAgYnJhY2tldHMgKGBbLi4uXWApIGZvciBwcm9wZXJ0eSBiaW5kaW5nLlxuICogOC4gQW5ndWxhciBpcyBib290c3RyYXBwZWQgZmlyc3Q7IEFuZ3VsYXJKUyBpcyBib290c3RyYXBwZWQgc2Vjb25kLiBBbmd1bGFySlMgYWx3YXlzIG93bnMgdGhlXG4gKiAgICByb290IGNvbXBvbmVudCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKiA5LiBUaGUgbmV3IGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gYW4gQW5ndWxhciB6b25lLCBhbmQgdGhlcmVmb3JlIGl0IG5vIGxvbmdlciBuZWVkcyBjYWxscyB0b1xuICogICAgYCRhcHBseSgpYC5cbiAqXG4gKiAjIyMgVGhlIGBVcGdyYWRlTW9kdWxlYCBjbGFzc1xuICpcbiAqIFRoaXMgY2xhc3MgaXMgYW4gYE5nTW9kdWxlYCwgd2hpY2ggeW91IGltcG9ydCB0byBwcm92aWRlIEFuZ3VsYXJKUyBjb3JlIHNlcnZpY2VzLFxuICogYW5kIGhhcyBhbiBpbnN0YW5jZSBtZXRob2QgdXNlZCB0byBib290c3RyYXAgdGhlIGh5YnJpZCB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyMgQ29yZSBBbmd1bGFySlMgc2VydmljZXNcbiAqIEltcG9ydGluZyB0aGlzIGBOZ01vZHVsZWAgd2lsbCBhZGQgcHJvdmlkZXJzIGZvciB0aGUgY29yZVxuICogW0FuZ3VsYXJKUyBzZXJ2aWNlc10oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3NlcnZpY2UpIHRvIHRoZSByb290IGluamVjdG9yLlxuICpcbiAqICMjIyMgQm9vdHN0cmFwXG4gKiBUaGUgcnVudGltZSBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIGNvbnRhaW5zIGEge0BsaW5rIFVwZ3JhZGVNb2R1bGUjYm9vdHN0cmFwIGBib290c3RyYXAoKWB9XG4gKiBtZXRob2QsIHdoaWNoIHlvdSB1c2UgdG8gYm9vdHN0cmFwIHRoZSB0b3AgbGV2ZWwgQW5ndWxhckpTIG1vZHVsZSBvbnRvIGFuIGVsZW1lbnQgaW4gdGhlXG4gKiBET00gZm9yIHRoZSBoeWJyaWQgdXBncmFkZSBhcHAuXG4gKlxuICogSXQgYWxzbyBjb250YWlucyBwcm9wZXJ0aWVzIHRvIGFjY2VzcyB0aGUge0BsaW5rIFVwZ3JhZGVNb2R1bGUjaW5qZWN0b3Igcm9vdCBpbmplY3Rvcn0sIHRoZVxuICogYm9vdHN0cmFwIGBOZ1pvbmVgIGFuZCB0aGVcbiAqIFtBbmd1bGFySlMgJGluamVjdG9yXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvYXV0by9zZXJ2aWNlLyRpbmplY3RvcikuXG4gKlxuICogIyMjIEV4YW1wbGVzXG4gKlxuICogSW1wb3J0IHRoZSBgVXBncmFkZU1vZHVsZWAgaW50byB5b3VyIHRvcCBsZXZlbCB7QGxpbmsgTmdNb2R1bGUgQW5ndWxhciBgTmdNb2R1bGVgfS5cbiAqXG4gKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPSduZzItbW9kdWxlJ31cbiAqXG4gKiBUaGVuIGluamVjdCBgVXBncmFkZU1vZHVsZWAgaW50byB5b3VyIEFuZ3VsYXIgYE5nTW9kdWxlYCBhbmQgdXNlIGl0IHRvIGJvb3RzdHJhcCB0aGUgdG9wIGxldmVsXG4gKiBbQW5ndWxhckpTIG1vZHVsZV0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvYW5ndWxhci5Nb2R1bGUpIGluIHRoZVxuICogYG5nRG9Cb290c3RyYXAoKWAgbWV0aG9kLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J2Jvb3RzdHJhcC1uZzEnfVxuICpcbiAqIEZpbmFsbHksIGtpY2sgb2ZmIHRoZSB3aG9sZSBwcm9jZXNzLCBieSBib290c3RyYXBpbmcgeW91ciB0b3AgbGV2ZWwgQW5ndWxhciBgTmdNb2R1bGVgLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249J2Jvb3RzdHJhcC1uZzInfVxuICpcbiAqIHtAYSB1cGdyYWRpbmctYW4tYW5ndWxhci0xLXNlcnZpY2V9XG4gKiAjIyMgVXBncmFkaW5nIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlXG4gKlxuICogVGhlcmUgaXMgbm8gc3BlY2lmaWMgQVBJIGZvciB1cGdyYWRpbmcgYW4gQW5ndWxhckpTIHNlcnZpY2UuIEluc3RlYWQgeW91IHNob3VsZCBqdXN0IGZvbGxvdyB0aGVcbiAqIGZvbGxvd2luZyByZWNpcGU6XG4gKlxuICogTGV0J3Mgc2F5IHlvdSBoYXZlIGFuIEFuZ3VsYXJKUyBzZXJ2aWNlOlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJuZzEtdGV4dC1mb3JtYXR0ZXItc2VydmljZVwifVxuICpcbiAqIFRoZW4geW91IHNob3VsZCBkZWZpbmUgYW4gQW5ndWxhciBwcm92aWRlciB0byBiZSBpbmNsdWRlZCBpbiB5b3VyIGBOZ01vZHVsZWAgYHByb3ZpZGVyc2BcbiAqIHByb3BlcnR5LlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJ1cGdyYWRlLW5nMS1zZXJ2aWNlXCJ9XG4gKlxuICogVGhlbiB5b3UgY2FuIHVzZSB0aGUgXCJ1cGdyYWRlZFwiIEFuZ3VsYXJKUyBzZXJ2aWNlIGJ5IGluamVjdGluZyBpdCBpbnRvIGFuIEFuZ3VsYXIgY29tcG9uZW50XG4gKiBvciBzZXJ2aWNlLlxuICpcbiAqIHtAZXhhbXBsZSB1cGdyYWRlL3N0YXRpYy90cy9mdWxsL21vZHVsZS50cyByZWdpb249XCJ1c2UtbmcxLXVwZ3JhZGVkLXNlcnZpY2VcIn1cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBOZ01vZHVsZSh7cHJvdmlkZXJzOiBbYW5ndWxhcjFQcm92aWRlcnNdfSlcbmV4cG9ydCBjbGFzcyBVcGdyYWRlTW9kdWxlIHtcbiAgLyoqXG4gICAqIFRoZSBBbmd1bGFySlMgYCRpbmplY3RvcmAgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljICRpbmplY3RvcjogYW55IC8qYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKi87XG4gIC8qKiBUaGUgQW5ndWxhciBJbmplY3RvciAqKi9cbiAgcHVibGljIGluamVjdG9yOiBJbmplY3RvcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKiBUaGUgcm9vdCBgSW5qZWN0b3JgIGZvciB0aGUgdXBncmFkZSBhcHBsaWNhdGlvbi4gKi9cbiAgICAgIGluamVjdG9yOiBJbmplY3RvcixcbiAgICAgIC8qKiBUaGUgYm9vdHN0cmFwIHpvbmUgZm9yIHRoZSB1cGdyYWRlIGFwcGxpY2F0aW9uICovXG4gICAgICBwdWJsaWMgbmdab25lOiBOZ1pvbmUpIHtcbiAgICB0aGlzLmluamVjdG9yID0gbmV3IE5nQWRhcHRlckluamVjdG9yKGluamVjdG9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYW4gQW5ndWxhckpTIGFwcGxpY2F0aW9uIGZyb20gdGhpcyBOZ01vZHVsZVxuICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCBvbiB3aGljaCB0byBib290c3RyYXAgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvblxuICAgKiBAcGFyYW0gW21vZHVsZXNdIHRoZSBBbmd1bGFySlMgbW9kdWxlcyB0byBib290c3RyYXAgZm9yIHRoaXMgYXBwbGljYXRpb25cbiAgICogQHBhcmFtIFtjb25maWddIG9wdGlvbmFsIGV4dHJhIEFuZ3VsYXJKUyBib290c3RyYXAgY29uZmlndXJhdGlvblxuICAgKi9cbiAgYm9vdHN0cmFwKFxuICAgICAgZWxlbWVudDogRWxlbWVudCwgbW9kdWxlczogc3RyaW5nW10gPSBbXSwgY29uZmlnPzogYW55IC8qYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyovKSB7XG4gICAgY29uc3QgSU5JVF9NT0RVTEVfTkFNRSA9IFVQR1JBREVfTU9EVUxFX05BTUUgKyAnLmluaXQnO1xuXG4gICAgLy8gQ3JlYXRlIGFuIG5nMSBtb2R1bGUgdG8gYm9vdHN0cmFwXG4gICAgY29uc3QgaW5pdE1vZHVsZSA9XG4gICAgICAgIGFuZ3VsYXJcbiAgICAgICAgICAgIC5tb2R1bGUoSU5JVF9NT0RVTEVfTkFNRSwgW10pXG5cbiAgICAgICAgICAgIC52YWx1ZShJTkpFQ1RPUl9LRVksIHRoaXMuaW5qZWN0b3IpXG5cbiAgICAgICAgICAgIC5mYWN0b3J5KFxuICAgICAgICAgICAgICAgIExBWllfTU9EVUxFX1JFRixcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICBJTkpFQ1RPUl9LRVksXG4gICAgICAgICAgICAgICAgICAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiAoeyBpbmplY3RvciwgbmVlZHNOZ1pvbmU6IGZhbHNlIH0gYXMgTGF6eU1vZHVsZVJlZilcbiAgICAgICAgICAgICAgICBdKVxuXG4gICAgICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAgICAgJFBST1ZJREUsICRJTkpFQ1RPUixcbiAgICAgICAgICAgICAgKCRwcm92aWRlOiBhbmd1bGFyLklQcm92aWRlU2VydmljZSwgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoJGluamVjdG9yLmhhcygkJFRFU1RBQklMSVRZKSkge1xuICAgICAgICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCQkVEVTVEFCSUxJVFksIFtcbiAgICAgICAgICAgICAgICAgICAgJERFTEVHQVRFLFxuICAgICAgICAgICAgICAgICAgICAodGVzdGFiaWxpdHlEZWxlZ2F0ZTogYW5ndWxhci5JVGVzdGFiaWxpdHlTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmplY3RvciA9IHRoaXMuaW5qZWN0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdXaGVuU3RhYmxlID0gZnVuY3Rpb24oY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFdoZW5TdGFibGUuY2FsbCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID0gaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5nMlRlc3RhYmlsaXR5LmlzU3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nMlRlc3RhYmlsaXR5LndoZW5TdGFibGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld1doZW5TdGFibGUuYmluZCh0ZXN0YWJpbGl0eURlbGVnYXRlLCBjYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdGFiaWxpdHlEZWxlZ2F0ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCRpbmplY3Rvci5oYXMoJElOVEVSVkFMKSkge1xuICAgICAgICAgICAgICAgICAgJHByb3ZpZGUuZGVjb3JhdG9yKCRJTlRFUlZBTCwgW1xuICAgICAgICAgICAgICAgICAgICAkREVMRUdBVEUsXG4gICAgICAgICAgICAgICAgICAgIChpbnRlcnZhbERlbGVnYXRlOiBhbmd1bGFyLklJbnRlcnZhbFNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBXcmFwIHRoZSAkaW50ZXJ2YWwgc2VydmljZSBzbyB0aGF0IHNldEludGVydmFsIGlzIGNhbGxlZCBvdXRzaWRlIE5nWm9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAvLyBidXQgdGhlIGNhbGxiYWNrIGlzIHN0aWxsIGludm9rZWQgd2l0aGluIGl0LiBUaGlzIGlzIHNvIHRoYXQgJGludGVydmFsXG4gICAgICAgICAgICAgICAgICAgICAgLy8gd29uJ3QgYmxvY2sgc3RhYmlsaXR5LCB3aGljaCBwcmVzZXJ2ZXMgdGhlIGJlaGF2aW9yIGZyb20gQW5ndWxhckpTLlxuICAgICAgICAgICAgICAgICAgICAgIGxldCB3cmFwcGVkSW50ZXJ2YWwgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAoZm46IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCBjb3VudD86IG51bWJlciwgaW52b2tlQXBwbHk/OiBib29sZWFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4ucGFzczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGludGVydmFsRGVsZWdhdGUoKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJ1biBjYWxsYmFjayBpbiB0aGUgbmV4dCBWTSB0dXJuIC0gJGludGVydmFsIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICRyb290U2NvcGUuJGFwcGx5LCBhbmQgcnVubmluZyB0aGUgY2FsbGJhY2sgaW4gTmdab25lIHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2F1c2UgYSAnJGRpZ2VzdCBhbHJlYWR5IGluIHByb2dyZXNzJyBlcnJvciBpZiBpdCdzIGluIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzYW1lIHZtIHR1cm4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLm5nWm9uZS5ydW4oKCkgPT4gZm4oLi4uYXJncykpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGRlbGF5LCBjb3VudCwgaW52b2tlQXBwbHksIC4uLnBhc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgICAgKHdyYXBwZWRJbnRlcnZhbCBhcyBhbnkpWydjYW5jZWwnXSA9IGludGVydmFsRGVsZWdhdGUuY2FuY2VsO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3cmFwcGVkSW50ZXJ2YWw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSlcblxuICAgICAgICAgICAgLnJ1bihbXG4gICAgICAgICAgICAgICRJTkpFQ1RPUixcbiAgICAgICAgICAgICAgKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kaW5qZWN0b3IgPSAkaW5qZWN0b3I7XG5cbiAgICAgICAgICAgICAgICAvLyBJbml0aWFsaXplIHRoZSBuZzEgJGluamVjdG9yIHByb3ZpZGVyXG4gICAgICAgICAgICAgICAgc2V0VGVtcEluamVjdG9yUmVmKCRpbmplY3Rvcik7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmplY3Rvci5nZXQoJElOSkVDVE9SKTtcblxuICAgICAgICAgICAgICAgIC8vIFB1dCB0aGUgaW5qZWN0b3Igb24gdGhlIERPTSwgc28gdGhhdCBpdCBjYW4gYmUgXCJyZXF1aXJlZFwiXG4gICAgICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLmRhdGEgIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIHRoaXMuaW5qZWN0b3IpO1xuXG4gICAgICAgICAgICAgICAgLy8gV2lyZSB1cCB0aGUgbmcxIHJvb3RTY29wZSB0byBydW4gYSBkaWdlc3QgY3ljbGUgd2hlbmV2ZXIgdGhlIHpvbmUgc2V0dGxlc1xuICAgICAgICAgICAgICAgIC8vIFdlIG5lZWQgdG8gZG8gdGhpcyBpbiB0aGUgbmV4dCB0aWNrIHNvIHRoYXQgd2UgZG9uJ3QgcHJldmVudCB0aGUgYm9vdHVwXG4gICAgICAgICAgICAgICAgLy8gc3RhYmlsaXppbmdcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0ICRyb290U2NvcGUgPSAkaW5qZWN0b3IuZ2V0KCckcm9vdFNjb3BlJyk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPVxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmdab25lLm9uTWljcm90YXNrRW1wdHkuc3Vic2NyaWJlKCgpID0+ICRyb290U2NvcGUuJGRpZ2VzdCgpKTtcbiAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHsgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7IH0pO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcblxuICAgIGNvbnN0IHVwZ3JhZGVNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZShVUEdSQURFX01PRFVMRV9OQU1FLCBbSU5JVF9NT0RVTEVfTkFNRV0uY29uY2F0KG1vZHVsZXMpKTtcblxuICAgIC8vIE1ha2Ugc3VyZSByZXN1bWVCb290c3RyYXAoKSBvbmx5IGV4aXN0cyBpZiB0aGUgY3VycmVudCBib290c3RyYXAgaXMgZGVmZXJyZWRcbiAgICBjb25zdCB3aW5kb3dBbmd1bGFyID0gKHdpbmRvdyBhcyBhbnkpWydhbmd1bGFyJ107XG4gICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSB1bmRlZmluZWQ7XG5cbiAgICAvLyBCb290c3RyYXAgdGhlIEFuZ3VsYXJKUyBhcHBsaWNhdGlvbiBpbnNpZGUgb3VyIHpvbmVcbiAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4geyBhbmd1bGFyLmJvb3RzdHJhcChlbGVtZW50LCBbdXBncmFkZU1vZHVsZS5uYW1lXSwgY29uZmlnKTsgfSk7XG5cbiAgICAvLyBQYXRjaCByZXN1bWVCb290c3RyYXAoKSB0byBydW4gaW5zaWRlIHRoZSBuZ1pvbmVcbiAgICBpZiAod2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXApIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXA7XG4gICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLm5nWm9uZTtcbiAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGxldCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICByZXR1cm4gbmdab25lLnJ1bigoKSA9PiB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcC5hcHBseSh0aGlzLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuIl19