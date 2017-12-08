/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, NgZone } from '@angular/core';
/**
 * @whatItDoes
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allows AngularJS and Angular components to be used together inside a hybrid upgrade
 * application, which supports AoT compilation.
 *
 * Specifically, the classes and functions in the `upgrade/static` module allow the following:
 * 1. Creation of an Angular directive that wraps and exposes an AngularJS component so
 *    that it can be used in an Angular template. See {@link UpgradeComponent}.
 * 2. Creation of an AngularJS directive that wraps and exposes an Angular component so
 *    that it can be used in an AngularJS template. See {@link downgradeComponent}.
 * 3. Creation of an Angular root injector provider that wraps and exposes an AngularJS
 *    service so that it can be injected into an Angular context. See
 *    {@link UpgradeModule#upgrading-an-angular-1-service Upgrading an AngularJS service} below.
 * 4. Creation of an AngularJS service that wraps and exposes an Angular injectable
 *    so that it can be injected into an AngularJS context. See {@link downgradeInjectable}.
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application. See the
 *    {@link UpgradeModule#example example} below.
 *
 * ## Mental Model
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
 *    in the DOM. See {@link UpgradeComponent}.
 * 6. An Angular component can be "downgraded"" to an AngularJS component. This is achieved by
 *    defining an AngularJS directive, which bootstraps the Angular component at its location
 *    in the DOM. See {@link downgradeComponent}.
 * 7. Whenever an "upgraded"/"downgraded" component is instantiated the host element is owned by
 *    the framework doing the instantiation. The other framework then instantiates and owns the
 *    view for that component.
 *    a. This implies that the component bindings will always follow the semantics of the
 *       instantiation framework.
 *    b. The DOM attributes are parsed by the framework that owns the current template. So
 * attributes
 *       in AngularJS templates must use kebab-case, while AngularJS templates must use camelCase.
 *    c. However the template binding syntax will always use the Angular style, e.g. square
 *       brackets (`[...]`) for property binding.
 * 8. AngularJS is always bootstrapped first and owns the root component.
 * 9. The new application is running in an Angular zone, and therefore it no longer needs calls
 * to
 *    `$apply()`.
 *
 * @howToUse
 *
 * `import {UpgradeModule} from '@angular/upgrade/static';`
 *
 * ## Example
 * Import the {@link UpgradeModule} into your top level {@link NgModule Angular `NgModule`}.
 *
 * {@example upgrade/static/ts/module.ts region='ng2-module'}
 *
 * Then bootstrap the hybrid upgrade app's module, get hold of the {@link UpgradeModule} instance
 * and use it to bootstrap the top level [AngularJS
 * module](https://docs.angularjs.org/api/ng/type/angular.Module).
 *
 * {@example upgrade/static/ts/module.ts region='bootstrap'}
 *
 * {@a upgrading-an-angular-1-service}
 *
 * ## Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {@example upgrade/static/ts/module.ts region="ng1-title-case-service"}
 *
 * Then you should define an Angular provider to be included in your {@link NgModule} `providers`
 * property.
 *
 * {@example upgrade/static/ts/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {@example upgrade/static/ts/module.ts region="use-ng1-upgraded-service"}
 *
 * @description
 *
 * This class is an `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * ## Core AngularJS services
 * Importing this {@link NgModule} will add providers for the core
 * [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * ## Bootstrap
 * The runtime instance of this class contains a {@link UpgradeModule#bootstrap `bootstrap()`}
 * method, which you use to bootstrap the top level AngularJS module onto an element in the
 * DOM for the hybrid upgrade app.
 *
 * It also contains properties to access the {@link UpgradeModule#injector root injector}, the
 * bootstrap {@link NgZone} and the
 * [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
 *
 * @experimental
 */
export declare class UpgradeModule {
    /** The bootstrap zone for the upgrade application */
    ngZone: NgZone;
    /**
     * The AngularJS `$injector` for the upgrade application.
     */
    $injector: any;
    /** The Angular Injector **/
    injector: Injector;
    constructor(
        /** The root {@link Injector} for the upgrade application. */
        injector: Injector, 
        /** The bootstrap zone for the upgrade application */
        ngZone: NgZone);
    /**
     * Bootstrap an AngularJS application from this NgModule
     * @param element the element on which to bootstrap the AngularJS application
     * @param [modules] the AngularJS modules to bootstrap for this application
     * @param [config] optional extra AngularJS bootstrap configuration
     */
    bootstrap(element: Element, modules?: string[], config?: any): void;
}
