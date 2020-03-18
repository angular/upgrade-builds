/**
 * @license Angular v9.0.7
 * (c) 2010-2020 Google LLC. https://angular.io/
 * License: MIT
 */

import { Type } from '@angular/core';

declare let angular: {
    bootstrap: (e: Element, modules: (string | IInjectable)[], config?: IAngularBootstrapConfig) => IInjectorService;
    module: (prefix: string, dependencies?: string[]) => IModule;
    element: {
        (e: string | Element | Document | IAugmentedJQuery): IAugmentedJQuery;
        cleanData: (nodes: Node[] | NodeList) => void;
    };
    injector: (modules: Array<string | IInjectable>, strictDi?: boolean) => IInjectorService;
    version: {
        major: number;
    };
    resumeBootstrap: () => void;
    getTestability: (e: Element) => ITestabilityService;
};


/**
 * A helper function to use when unit testing AngularJS services that depend upon downgraded Angular
 * services.
 *
 * This function returns an AngularJS module that is configured to wire up the AngularJS and Angular
 * injectors without the need to actually bootstrap a hybrid application.
 * This makes it simpler and faster to unit test services.
 *
 * Use the returned AngularJS module in a call to
 * [`angular.mocks.module`](https://docs.angularjs.org/api/ngMock/function/angular.mock.module) to
 * include this module in the unit test injector.
 *
 * In the following code snippet, we are configuring the `$injector` with two modules:
 * The AngularJS `ng1AppModule`, which is the AngularJS part of our hybrid application and the
 * `Ng2AppModule`, which is the Angular part.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts"
 * region="angularjs-setup"></code-example>
 *
 * Once this is done we can get hold of services via the AngularJS `$injector` as normal.
 * Services that are (or have dependencies on) a downgraded Angular service, will be instantiated as
 * needed by the Angular root `Injector`.
 *
 * In the following code snippet, `heroesService` is a downgraded Angular service that we are
 * accessing from AngularJS.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts"
 * region="angularjs-spec"></code-example>
 *
 * <div class="alert is-important">
 *
 * This helper is for testing services not components.
 * For Component testing you must still bootstrap a hybrid app. See `UpgradeModule` or
 * `downgradeModule` for more information.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The resulting configuration does not wire up AngularJS digests to Zone hooks. It is the
 * responsibility of the test writer to call `$rootScope.$apply`, as necessary, to trigger
 * AngularJS handlers of async events from Angular.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The helper sets up global variables to hold the shared Angular and AngularJS injectors.
 *
 * * Only call this helper once per spec.
 * * Do not use `createAngularJSTestingModule` in the same spec as `createAngularTestingModule`.
 *
 * </div>
 *
 * Here is the example application and its unit tests that use `createAngularTestingModule`
 * and `createAngularJSTestingModule`.
 *
 * <code-tabs>
 *  <code-pane header="module.spec.ts" path="upgrade/static/ts/full/module.spec.ts"></code-pane>
 *  <code-pane header="module.ts" path="upgrade/static/ts/full/module.ts"></code-pane>
 * </code-tabs>
 *
 *
 * @param angularModules a collection of Angular modules to include in the configuration.
 *
 * @publicApi
 */
export declare function createAngularJSTestingModule(angularModules: any[]): string;

/**
 * A helper function to use when unit testing Angular services that depend upon upgraded AngularJS
 * services.
 *
 * This function returns an `NgModule` decorated class that is configured to wire up the Angular
 * and AngularJS injectors without the need to actually bootstrap a hybrid application.
 * This makes it simpler and faster to unit test services.
 *
 * Use the returned class as an "import" when configuring the `TestBed`.
 *
 * In the following code snippet, we are configuring the TestBed with two imports.
 * The `Ng2AppModule` is the Angular part of our hybrid application and the `ng1AppModule` is the
 * AngularJS part.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts" region="angular-setup"></code-example>
 *
 * Once this is done we can get hold of services via the Angular `Injector` as normal.
 * Services that are (or have dependencies on) an upgraded AngularJS service, will be instantiated
 * as needed by the AngularJS `$injector`.
 *
 * In the following code snippet, `HeroesService` is an Angular service that depends upon an
 * AngularJS service, `titleCase`.
 *
 * <code-example path="upgrade/static/ts/full/module.spec.ts" region="angular-spec"></code-example>
 *
 * <div class="alert is-important">
 *
 * This helper is for testing services not Components.
 * For Component testing you must still bootstrap a hybrid app. See `UpgradeModule` or
 * `downgradeModule` for more information.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The resulting configuration does not wire up AngularJS digests to Zone hooks. It is the
 * responsibility of the test writer to call `$rootScope.$apply`, as necessary, to trigger
 * AngularJS handlers of async events from Angular.
 *
 * </div>
 *
 * <div class="alert is-important">
 *
 * The helper sets up global variables to hold the shared Angular and AngularJS injectors.
 *
 * * Only call this helper once per spec.
 * * Do not use `createAngularTestingModule` in the same spec as `createAngularJSTestingModule`.
 *
 * </div>
 *
 * Here is the example application and its unit tests that use `createAngularTestingModule`
 * and `createAngularJSTestingModule`.
 *
 * <code-tabs>
 *  <code-pane header="module.spec.ts" path="upgrade/static/ts/full/module.spec.ts"></code-pane>
 *  <code-pane header="module.ts" path="upgrade/static/ts/full/module.ts"></code-pane>
 * </code-tabs>
 *
 *
 * @param angularJSModules a collection of the names of AngularJS modules to include in the
 * configuration.
 * @param [strictDi] whether the AngularJS injector should have `strictDI` enabled.
 *
 * @publicApi
 */
export declare function createAngularTestingModule(angularJSModules: string[], strictDi?: boolean): Type<any>;

declare type DirectiveRequireProperty = SingleOrListOrMap<string>;

declare type DirectiveTranscludeProperty = boolean | 'element' | {
    [key: string]: string;
};

declare interface IAngularBootstrapConfig {
    strictDi?: boolean;
}

declare interface IAnnotatedFunction extends Function {
    $inject?: Function extends {
        $inject?: string[];
    } ? Ng1Token[] : ReadonlyArray<Ng1Token>;
}

declare type IAugmentedJQuery = Node[] & {
    on?: (name: string, fn: () => void) => void;
    data?: (name: string, value?: any) => any;
    text?: () => string;
    inheritedData?: (name: string, value?: any) => any;
    contents?: () => IAugmentedJQuery;
    parent?: () => IAugmentedJQuery;
    empty?: () => void;
    append?: (content: IAugmentedJQuery | string) => IAugmentedJQuery;
    controller?: (name: string) => any;
    isolateScope?: () => IScope;
    injector?: () => IInjectorService;
    triggerHandler?: (eventTypeOrObject: string | Event, extraParameters?: any[]) => IAugmentedJQuery;
    remove?: () => void;
    removeData?: () => void;
};

declare interface IComponent {
    bindings?: {
        [key: string]: string;
    };
    controller?: string | IInjectable;
    controllerAs?: string;
    require?: DirectiveRequireProperty;
    template?: string | Function;
    templateUrl?: string | Function;
    transclude?: DirectiveTranscludeProperty;
}

declare type IInjectable = (Ng1Token | Function)[] | IAnnotatedFunction;

declare interface IInjectorService {
    get(key: string): any;
    has(key: string): boolean;
}

declare interface IModule {
    name: string;
    requires: (string | IInjectable)[];
    config(fn: IInjectable): IModule;
    directive(selector: string, factory: IInjectable): IModule;
    component(selector: string, component: IComponent): IModule;
    controller(name: string, type: IInjectable): IModule;
    factory(key: Ng1Token, factoryFn: IInjectable): IModule;
    value(key: Ng1Token, value: any): IModule;
    constant(token: Ng1Token, value: any): IModule;
    run(a: IInjectable): IModule;
}

declare interface IRootScopeService {
    $new(isolate?: boolean): IScope;
    $id: string;
    $parent: IScope;
    $root: IScope;
    $watch(exp: Ng1Expression, fn?: (a1?: any, a2?: any) => void): Function;
    $on(event: string, fn?: (event?: any, ...args: any[]) => void): Function;
    $destroy(): any;
    $apply(exp?: Ng1Expression): any;
    $digest(): any;
    $evalAsync(exp: Ng1Expression, locals?: any): void;
    $on(event: string, fn?: (event?: any, ...args: any[]) => void): Function;
    $$childTail: IScope;
    $$childHead: IScope;
    $$nextSibling: IScope;
    [key: string]: any;
}

declare interface IScope extends IRootScopeService {
}

declare interface ITestabilityService {
    findBindings(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
    findModels(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
    getLocation(): string;
    setLocation(url: string): void;
    whenStable(callback: Function): void;
}

declare type Ng1Expression = string | Function;


declare type Ng1Token = string;

declare type SingleOrListOrMap<T> = T | T[] | {
    [key: string]: T;
};

export declare const ɵangular_packages_upgrade_static_testing_testing_a: typeof angular.module;

export declare const ɵangular_packages_upgrade_static_testing_testing_b = "$$angularUpgradeAppType";

export declare const enum ɵangular_packages_upgrade_static_testing_testing_c {
    None = 0,
    Dynamic = 1,
    Static = 2,
    Lite = 3
}

export declare const ɵangular_packages_upgrade_static_testing_testing_d = "$$angularInjector";

export { }
