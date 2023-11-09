/**
 * @license Angular v17.1.0-next.0+sha-645447d
 * (c) 2010-2022 Google LLC. https://angular.io/
 * License: MIT
 */


import { DoCheck } from '@angular/core';
import { ElementRef } from '@angular/core';
import * as i0 from '@angular/core';
import { Injector } from '@angular/core';
import { NgModuleFactory } from '@angular/core';
import { NgModuleRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { OnChanges } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { PlatformRef } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { StaticProvider } from '@angular/core';
import { Type } from '@angular/core';
import { Version } from '@angular/core';

declare const $$TESTABILITY = "$$testability";


declare const $COMPILE = "$compile";

declare const $CONTROLLER = "$controller";

declare const $DELEGATE = "$delegate";

declare const $EXCEPTION_HANDLER = "$exceptionHandler";

declare const $HTTP_BACKEND = "$httpBackend";

declare const $INJECTOR = "$injector";

declare const $INTERVAL = "$interval";

declare const $PARSE = "$parse";

declare const $PROVIDE = "$provide";

declare const $ROOT_ELEMENT = "$rootElement";

declare const $ROOT_SCOPE = "$rootScope";

declare const $SCOPE = "$scope";

declare const $TEMPLATE_CACHE = "$templateCache";

declare const $TEMPLATE_REQUEST = "$templateRequest";

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

declare const bootstrap: typeof angular.bootstrap;

/**
 * Clean the jqLite/jQuery data on the element and all its descendants.
 * Equivalent to how jqLite/jQuery invoke `cleanData()` on an Element when removed:
 *   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/jqLite.js#L349-L355
 *   https://github.com/jquery/jquery/blob/6984d1747623dbc5e87fd6c261a5b6b1628c107c/src/manipulation.js#L182
 *
 * NOTE:
 * `cleanData()` will also invoke the AngularJS `$destroy` DOM event on the element:
 *   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/Angular.js#L1932-L1945
 *
 * @param node The DOM node whose data needs to be cleaned.
 */
declare function cleanData(node: Node): void;

declare const COMPILER_KEY = "$$angularCompiler";

declare function controllerKey(name: string): string;

declare class Deferred<R> {
    promise: Promise<R>;
    resolve: (value: R | PromiseLike<R>) => void;
    reject: (error?: any) => void;
    constructor();
}

/**
 * Destroy an AngularJS app given the app `$injector`.
 *
 * NOTE: Destroying an app is not officially supported by AngularJS, but try to do our best by
 *       destroying `$rootScope` and clean the jqLite/jQuery data on `$rootElement` and all
 *       descendants.
 *
 * @param $injector The `$injector` of the AngularJS app to destroy.
 */
declare function destroyApp($injector: IInjectorService): void;

declare function directiveNormalize(name: string): string;

declare type DirectiveRequireProperty = SingleOrListOrMap<string>;

declare type DirectiveTranscludeProperty = boolean | 'element' | {
    [key: string]: string;
};

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
 * visit the [Upgrade guide](guide/upgrade#using-angular-components-from-angularjs-code).
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
export declare function downgradeComponent(info: {
    component: Type<any>;
    downgradedModule?: string;
    propagateDigest?: boolean;
    /** @deprecated since v4. This parameter is no longer used */
    inputs?: string[];
    /** @deprecated since v4. This parameter is no longer used */
    outputs?: string[];
    /** @deprecated since v4. This parameter is no longer used */
    selectors?: string[];
}): any;

declare const DOWNGRADED_MODULE_COUNT_KEY = "$$angularDowngradedModuleCount";


/**
 * @description
 *
 * A helper function to allow an Angular service to be accessible from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation*
 *
 * This helper function returns a factory function that provides access to the Angular
 * service identified by the `token` parameter.
 *
 * @usageNotes
 * ### Examples
 *
 * First ensure that the service to be downgraded is provided in an `NgModule`
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app `NgModule`
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {@example upgrade/static/ts/full/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {@example upgrade/static/ts/full/module.ts region="example-app"}
 *
 * <div class="alert is-important">
 *
 *   When using `downgradeModule()`, downgraded injectables will not be available until the Angular
 *   module that provides them is instantiated. In order to be safe, you need to ensure that the
 *   downgraded injectables are not used anywhere _outside_ the part of the app where it is
 *   guaranteed that their module has been instantiated.
 *
 *   For example, it is _OK_ to use a downgraded service in an upgraded component that is only used
 *   from a downgraded Angular component provided by the same Angular module as the injectable, but
 *   it is _not OK_ to use it in an AngularJS component that may be used independently of Angular or
 *   use it in a downgraded Angular component from a different module.
 *
 * </div>
 *
 * @param token an `InjectionToken` that identifies a service provided from Angular.
 * @param downgradedModule the name of the downgraded module (if any) that the injectable
 * "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose injector will
 * be used for instantiating the injectable.<br />
 * (This option is only necessary when using `downgradeModule()` to downgrade more than one Angular
 * module.)
 *
 * @returns a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 * @publicApi
 */
export declare function downgradeInjectable(token: any, downgradedModule?: string): Function;

/**
 * @description
 *
 * A helper function for creating an AngularJS module that can bootstrap an Angular module
 * "on-demand" (possibly lazily) when a {@link downgradeComponent downgraded component} needs to be
 * instantiated.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static) library for hybrid upgrade apps that
 * support AOT compilation.*
 *
 * It allows loading/bootstrapping the Angular part of a hybrid application lazily and not having to
 * pay the cost up-front. For example, you can have an AngularJS application that uses Angular for
 * specific routes and only instantiate the Angular modules if/when the user visits one of these
 * routes.
 *
 * The Angular module will be bootstrapped once (when requested for the first time) and the same
 * reference will be used from that point onwards.
 *
 * `downgradeModule()` requires either an `NgModuleFactory`, `NgModule` class or a function:
 * - `NgModuleFactory`: If you pass an `NgModuleFactory`, it will be used to instantiate a module
 *   using `platformBrowser`'s {@link PlatformRef#bootstrapModuleFactory bootstrapModuleFactory()}.
 *   NOTE: this type of the argument is deprecated. Please either provide an `NgModule` class or a
 *   bootstrap function instead.
 * - `NgModule` class: If you pass an NgModule class, it will be used to instantiate a module
 *   using `platformBrowser`'s {@link PlatformRef#bootstrapModule bootstrapModule()}.
 * - `Function`: If you pass a function, it is expected to return a promise resolving to an
 *   `NgModuleRef`. The function is called with an array of extra {@link StaticProvider Providers}
 *   that are expected to be available from the returned `NgModuleRef`'s `Injector`.
 *
 * `downgradeModule()` returns the name of the created AngularJS wrapper module. You can use it to
 * declare a dependency in your main AngularJS module.
 *
 * {@example upgrade/static/ts/lite/module.ts region="basic-how-to"}
 *
 * For more details on how to use `downgradeModule()` see
 * [Upgrading for Performance](guide/upgrade-performance).
 *
 * @usageNotes
 *
 * Apart from `UpgradeModule`, you can use the rest of the `upgrade/static` helpers as usual to
 * build a hybrid application. Note that the Angular pieces (e.g. downgraded services) will not be
 * available until the downgraded module has been bootstrapped, i.e. by instantiating a downgraded
 * component.
 *
 * <div class="alert is-important">
 *
 *   You cannot use `downgradeModule()` and `UpgradeModule` in the same hybrid application.<br />
 *   Use one or the other.
 *
 * </div>
 *
 * ### Differences with `UpgradeModule`
 *
 * Besides their different API, there are two important internal differences between
 * `downgradeModule()` and `UpgradeModule` that affect the behavior of hybrid applications:
 *
 * 1. Unlike `UpgradeModule`, `downgradeModule()` does not bootstrap the main AngularJS module
 *    inside the {@link NgZone Angular zone}.
 * 2. Unlike `UpgradeModule`, `downgradeModule()` does not automatically run a
 *    [$digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest) when changes are
 *    detected in the Angular part of the application.
 *
 * What this means is that applications using `UpgradeModule` will run change detection more
 * frequently in order to ensure that both frameworks are properly notified about possible changes.
 * This will inevitably result in more change detection runs than necessary.
 *
 * `downgradeModule()`, on the other side, does not try to tie the two change detection systems as
 * tightly, restricting the explicit change detection runs only to cases where it knows it is
 * necessary (e.g. when the inputs of a downgraded component change). This improves performance,
 * especially in change-detection-heavy applications, but leaves it up to the developer to manually
 * notify each framework as needed.
 *
 * For a more detailed discussion of the differences and their implications, see
 * [Upgrading for Performance](guide/upgrade-performance).
 *
 * <div class="alert is-helpful">
 *
 *   You can manually trigger a change detection run in AngularJS using
 *   [scope.$apply(...)](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply) or
 *   [$rootScope.$digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest).
 *
 *   You can manually trigger a change detection run in Angular using {@link NgZone#run
 *   ngZone.run(...)}.
 *
 * </div>
 *
 * ### Downgrading multiple modules
 *
 * It is possible to downgrade multiple modules and include them in an AngularJS application. In
 * that case, each downgraded module will be bootstrapped when an associated downgraded component or
 * injectable needs to be instantiated.
 *
 * Things to keep in mind, when downgrading multiple modules:
 *
 * - Each downgraded component/injectable needs to be explicitly associated with a downgraded
 *   module. See `downgradeComponent()` and `downgradeInjectable()` for more details.
 *
 * - If you want some injectables to be shared among all downgraded modules, you can provide them as
 *   `StaticProvider`s, when creating the `PlatformRef` (e.g. via `platformBrowser` or
 *   `platformBrowserDynamic`).
 *
 * - When using {@link PlatformRef#bootstrapmodule `bootstrapModule()`} or
 *   {@link PlatformRef#bootstrapmodulefactory `bootstrapModuleFactory()`} to bootstrap the
 *   downgraded modules, each one is considered a "root" module. As a consequence, a new instance
 *   will be created for every injectable provided in `"root"` (via
 *   {@link Injectable#providedIn `providedIn`}).
 *   If this is not your intention, you can have a shared module (that will act as act as the "root"
 *   module) and create all downgraded modules using that module's injector:
 *
 *   {@example upgrade/static/ts/lite-multi-shared/module.ts region="shared-root-module"}
 *
 * @publicApi
 */
export declare function downgradeModule<T>(moduleOrBootstrapFn: Type<T> | ((extraProviders: StaticProvider[]) => Promise<NgModuleRef<T>>)): string;

/**
 * @description
 *
 * A helper function for creating an AngularJS module that can bootstrap an Angular module
 * "on-demand" (possibly lazily) when a {@link downgradeComponent downgraded component} needs to be
 * instantiated.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static) library for hybrid upgrade apps that
 * support AOT compilation.*
 *
 * It allows loading/bootstrapping the Angular part of a hybrid application lazily and not having to
 * pay the cost up-front. For example, you can have an AngularJS application that uses Angular for
 * specific routes and only instantiate the Angular modules if/when the user visits one of these
 * routes.
 *
 * The Angular module will be bootstrapped once (when requested for the first time) and the same
 * reference will be used from that point onwards.
 *
 * `downgradeModule()` requires either an `NgModuleFactory`, `NgModule` class or a function:
 * - `NgModuleFactory`: If you pass an `NgModuleFactory`, it will be used to instantiate a module
 *   using `platformBrowser`'s {@link PlatformRef#bootstrapModuleFactory bootstrapModuleFactory()}.
 *   NOTE: this type of the argument is deprecated. Please either provide an `NgModule` class or a
 *   bootstrap function instead.
 * - `NgModule` class: If you pass an NgModule class, it will be used to instantiate a module
 *   using `platformBrowser`'s {@link PlatformRef#bootstrapModule bootstrapModule()}.
 * - `Function`: If you pass a function, it is expected to return a promise resolving to an
 *   `NgModuleRef`. The function is called with an array of extra {@link StaticProvider Providers}
 *   that are expected to be available from the returned `NgModuleRef`'s `Injector`.
 *
 * `downgradeModule()` returns the name of the created AngularJS wrapper module. You can use it to
 * declare a dependency in your main AngularJS module.
 *
 * {@example upgrade/static/ts/lite/module.ts region="basic-how-to"}
 *
 * For more details on how to use `downgradeModule()` see
 * [Upgrading for Performance](guide/upgrade-performance).
 *
 * @usageNotes
 *
 * Apart from `UpgradeModule`, you can use the rest of the `upgrade/static` helpers as usual to
 * build a hybrid application. Note that the Angular pieces (e.g. downgraded services) will not be
 * available until the downgraded module has been bootstrapped, i.e. by instantiating a downgraded
 * component.
 *
 * <div class="alert is-important">
 *
 *   You cannot use `downgradeModule()` and `UpgradeModule` in the same hybrid application.<br />
 *   Use one or the other.
 *
 * </div>
 *
 * ### Differences with `UpgradeModule`
 *
 * Besides their different API, there are two important internal differences between
 * `downgradeModule()` and `UpgradeModule` that affect the behavior of hybrid applications:
 *
 * 1. Unlike `UpgradeModule`, `downgradeModule()` does not bootstrap the main AngularJS module
 *    inside the {@link NgZone Angular zone}.
 * 2. Unlike `UpgradeModule`, `downgradeModule()` does not automatically run a
 *    [$digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest) when changes are
 *    detected in the Angular part of the application.
 *
 * What this means is that applications using `UpgradeModule` will run change detection more
 * frequently in order to ensure that both frameworks are properly notified about possible changes.
 * This will inevitably result in more change detection runs than necessary.
 *
 * `downgradeModule()`, on the other side, does not try to tie the two change detection systems as
 * tightly, restricting the explicit change detection runs only to cases where it knows it is
 * necessary (e.g. when the inputs of a downgraded component change). This improves performance,
 * especially in change-detection-heavy applications, but leaves it up to the developer to manually
 * notify each framework as needed.
 *
 * For a more detailed discussion of the differences and their implications, see
 * [Upgrading for Performance](guide/upgrade-performance).
 *
 * <div class="alert is-helpful">
 *
 *   You can manually trigger a change detection run in AngularJS using
 *   [scope.$apply(...)](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply) or
 *   [$rootScope.$digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest).
 *
 *   You can manually trigger a change detection run in Angular using {@link NgZone#run
 *   ngZone.run(...)}.
 *
 * </div>
 *
 * ### Downgrading multiple modules
 *
 * It is possible to downgrade multiple modules and include them in an AngularJS application. In
 * that case, each downgraded module will be bootstrapped when an associated downgraded component or
 * injectable needs to be instantiated.
 *
 * Things to keep in mind, when downgrading multiple modules:
 *
 * - Each downgraded component/injectable needs to be explicitly associated with a downgraded
 *   module. See `downgradeComponent()` and `downgradeInjectable()` for more details.
 *
 * - If you want some injectables to be shared among all downgraded modules, you can provide them as
 *   `StaticProvider`s, when creating the `PlatformRef` (e.g. via `platformBrowser` or
 *   `platformBrowserDynamic`).
 *
 * - When using {@link PlatformRef#bootstrapmodule `bootstrapModule()`} or
 *   {@link PlatformRef#bootstrapmodulefactory `bootstrapModuleFactory()`} to bootstrap the
 *   downgraded modules, each one is considered a "root" module. As a consequence, a new instance
 *   will be created for every injectable provided in `"root"` (via
 *   {@link Injectable#providedIn `providedIn`}).
 *   If this is not your intention, you can have a shared module (that will act as act as the "root"
 *   module) and create all downgraded modules using that module's injector:
 *
 *   {@example upgrade/static/ts/lite-multi-shared/module.ts region="shared-root-module"}
 *
 * @publicApi
 *
 * @deprecated Passing `NgModuleFactory` as the `downgradeModule` function argument is deprecated,
 *     please pass an NgModule class reference instead.
 */
export declare function downgradeModule<T>(moduleOrBootstrapFn: NgModuleFactory<T>): string;

declare const element: typeof angular.element;

/**
 * Returns the current AngularJS global.
 *
 * @publicApi
 */
export declare function getAngularJSGlobal(): any;

/**
 * @deprecated Use `getAngularJSGlobal` instead.
 *
 * @publicApi
 */
export declare function getAngularLib(): any;

declare function getDowngradedModuleCount($injector: IInjectorService): number;

declare const getTestability: typeof angular.getTestability;

declare function getTypeName(type: Type<any>): string;

declare function getUpgradeAppType($injector: IInjectorService): UpgradeAppType;

declare const GROUP_PROJECTABLE_NODES_KEY = "$$angularGroupProjectableNodes";

/**
 * Glue the AngularJS `NgModelController` (if it exists) to the component
 * (if it implements the needed subset of the `ControlValueAccessor` interface).
 */
declare function hookupNgModel(ngModel: INgModelController, component: any): void;

declare interface IAngularBootstrapConfig {
    strictDi?: boolean;
}

declare interface IAnnotatedFunction extends Function {
    $inject?: Function extends {
        $inject?: string[];
    } ? Ng1Token[] : ReadonlyArray<Ng1Token>;
}

declare interface IAttributes {
    $observe(attr: string, fn: (v: string) => void): void;
    [key: string]: any;
}

declare type IAugmentedJQuery = Node[] & {
    on?: (name: string, fn: () => void) => void;
    data?: (name: string, value?: any) => any;
    text?: () => string;
    inheritedData?: (name: string, value?: any) => any;
    children?: () => IAugmentedJQuery;
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

declare interface IBindingDestination {
    [key: string]: any;
    $onChanges?: (changes: SimpleChanges) => void;
}

declare interface ICacheObject {
    put<T>(key: string, value?: T): T;
    get(key: string): any;
}

declare interface ICloneAttachFunction {
    (clonedElement: IAugmentedJQuery, scope: IScope): any;
}

declare interface ICompiledExpression {
    (context: any, locals: any): any;
    assign?: (context: any, value: any) => any;
}

declare interface ICompileService {
    (element: Element | NodeList | Node[] | string, transclude?: Function): ILinkFn;
}

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

declare type IController = string | IInjectable;

declare interface IControllerInstance extends IBindingDestination {
    $doCheck?: () => void;
    $onDestroy?: () => void;
    $onInit?: () => void;
    $postLink?: () => void;
}

declare interface IControllerService {
    (controllerConstructor: IController, locals?: any, later?: any, ident?: any): any;
    (controllerName: string, locals?: any): any;
}

declare interface IDirective {
    compile?: IDirectiveCompileFn;
    controller?: IController;
    controllerAs?: string;
    bindToController?: boolean | {
        [key: string]: string;
    };
    link?: IDirectiveLinkFn | IDirectivePrePost;
    name?: string;
    priority?: number;
    replace?: boolean;
    require?: DirectiveRequireProperty;
    restrict?: string;
    scope?: boolean | {
        [key: string]: string;
    };
    template?: string | Function;
    templateUrl?: string | Function;
    templateNamespace?: string;
    terminal?: boolean;
    transclude?: DirectiveTranscludeProperty;
}

declare interface IDirectiveCompileFn {
    (templateElement: IAugmentedJQuery, templateAttributes: IAttributes, transclude: ITranscludeFunction): IDirectivePrePost;
}

declare interface IDirectiveLinkFn {
    (scope: IScope, instanceElement: IAugmentedJQuery, instanceAttributes: IAttributes, controller: any, transclude: ITranscludeFunction): void;
}

declare interface IDirectivePrePost {
    pre?: IDirectiveLinkFn;
    post?: IDirectiveLinkFn;
}

declare interface IHttpBackendService {
    (method: string, url: string, post?: any, callback?: Function, headers?: any, timeout?: number, withCredentials?: boolean): void;
}

declare type IInjectable = (Ng1Token | Function)[] | IAnnotatedFunction;

declare interface IInjectorService {
    get(key: string): any;
    has(key: string): boolean;
}

declare interface IIntervalService {
    (func: Function, delay: number, count?: number, invokeApply?: boolean, ...args: any[]): Promise<any>;
    cancel(promise: Promise<any>): boolean;
}

declare interface ILinkFn {
    (scope: IScope, cloneAttachFn?: ICloneAttachFunction, options?: ILinkFnOptions): IAugmentedJQuery;
    $$slots?: {
        [slotName: string]: ILinkFn;
    };
}

declare interface ILinkFnOptions {
    parentBoundTranscludeFn?: Function;
    transcludeControllers?: {
        [key: string]: any;
    };
    futureParentElement?: Node;
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

declare interface INgModelController {
    $render(): void;
    $isEmpty(value: any): boolean;
    $setValidity(validationErrorKey: string, isValid: boolean): void;
    $setPristine(): void;
    $setDirty(): void;
    $setUntouched(): void;
    $setTouched(): void;
    $rollbackViewValue(): void;
    $validate(): void;
    $commitViewValue(): void;
    $setViewValue(value: any, trigger: string): void;
    $viewValue: any;
    $modelValue: any;
    $parsers: Function[];
    $formatters: Function[];
    $validators: {
        [key: string]: Function;
    };
    $asyncValidators: {
        [key: string]: Function;
    };
    $viewChangeListeners: Function[];
    $error: Object;
    $pending: Object;
    $untouched: boolean;
    $touched: boolean;
    $pristine: boolean;
    $dirty: boolean;
    $valid: boolean;
    $invalid: boolean;
    $name: string;
}

declare const injector: typeof angular.injector;

declare const INJECTOR_KEY = "$$angularInjector";

declare interface IParseService {
    (expression: string): ICompiledExpression;
}

declare interface IProvider {
    $get: IInjectable;
}

declare interface IProvideService {
    provider(token: Ng1Token, provider: IProvider): IProvider;
    factory(token: Ng1Token, factory: IInjectable): IProvider;
    service(token: Ng1Token, type: IInjectable): IProvider;
    value(token: Ng1Token, value: any): IProvider;
    constant(token: Ng1Token, value: any): void;
    decorator(token: Ng1Token, factory: IInjectable): void;
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
    $$phase: any;
    [key: string]: any;
}

declare interface IScope extends IRootScopeService {
}

declare function isFunction(value: any): value is Function;

declare function isNgModuleType(value: any): value is Type<unknown>;

declare interface ITemplateCacheService extends ICacheObject {
}

declare interface ITestabilityService {
    findBindings(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
    findModels(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
    getLocation(): string;
    setLocation(url: string): void;
    whenStable(callback: Function): void;
}

declare interface ITranscludeFunction {
    (scope: IScope, cloneAttachFn: ICloneAttachFunction): IAugmentedJQuery;
    (cloneAttachFn?: ICloneAttachFunction): IAugmentedJQuery;
}

declare const LAZY_MODULE_REF = "$$angularLazyModuleRef";

declare interface LazyModuleRef {
    injector?: Injector;
    promise?: Promise<Injector>;
}

declare const module_: typeof angular.module;

declare type Ng1Expression = string | Function;


declare type Ng1Token = string;

declare const NG_ZONE_KEY = "$$angularNgZone";

declare function onError(e: any): void;

declare const REQUIRE_INJECTOR: string;

declare const REQUIRE_NG_MODEL = "?ngModel";

declare const resumeBootstrap: typeof angular.resumeBootstrap;

/**
 * Resets the AngularJS global.
 *
 * Used when AngularJS is loaded lazily, and not available on `window`.
 *
 * @publicApi
 */
export declare function setAngularJSGlobal(ng: any): void;

/**
 * @deprecated Use `setAngularJSGlobal` instead.
 *
 * @publicApi
 */
export declare function setAngularLib(ng: any): void;

declare type SingleOrListOrMap<T> = T | T[] | {
    [key: string]: T;
};

/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
declare function strictEquals(val1: any, val2: any): boolean;

declare const UPGRADE_APP_TYPE_KEY = "$$angularUpgradeAppType";

declare const UPGRADE_MODULE_NAME = "$$UpgradeModule";

declare const enum UpgradeAppType {
    None = 0,
    Dynamic = 1,
    Static = 2,
    Lite = 3
}

/**
 * @description
 *
 * A helper class that allows an AngularJS component to be used from Angular.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation.*
 *
 * This helper class should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
 * @usageNotes
 * ### Examples
 *
 * Let's assume that you have an AngularJS component called `ng1Hero` that needs
 * to be made available in Angular templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-hero"}
 *
 * We must create a `Directive` that will make this AngularJS component
 * available inside Angular templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper"}
 *
 * In this example you can see that we must derive from the `UpgradeComponent`
 * base class but also provide an {@link Directive `@Directive`} decorator. This is
 * because the AOT compiler requires that this information is statically available at
 * compile time.
 *
 * Note that we must do the following:
 * * specify the directive's selector (`ng1-hero`)
 * * specify all inputs and outputs that the AngularJS component expects
 * * derive from `UpgradeComponent`
 * * call the base class from the constructor, passing
 *   * the AngularJS name of the component (`ng1Hero`)
 *   * the `ElementRef` and `Injector` for the component wrapper
 *
 * @publicApi
 * @extensible
 */
export declare class UpgradeComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
    private helper;
    private $element;
    private $componentScope;
    private directive;
    private bindings;
    private controllerInstance?;
    private bindingDestination?;
    private pendingChanges;
    private unregisterDoCheckWatcher?;
    /**
     * Create a new `UpgradeComponent` instance. You should not normally need to do this.
     * Instead you should derive a new class from this one and call the super constructor
     * from the base class.
     *
     * {@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper" }
     *
     * * The `name` parameter should be the name of the AngularJS directive.
     * * The `elementRef` and `injector` parameters should be acquired from Angular by dependency
     *   injection into the base class constructor.
     */
    constructor(name: string, elementRef: ElementRef, injector: Injector);
    /** @nodoc */
    ngOnInit(): void;
    /** @nodoc */
    ngOnChanges(changes: SimpleChanges): void;
    /** @nodoc */
    ngDoCheck(): void;
    /** @nodoc */
    ngOnDestroy(): void;
    private initializeBindings;
    private initializeOutputs;
    private bindOutputs;
    private forwardChanges;
    static ɵfac: i0.ɵɵFactoryDeclaration<UpgradeComponent, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<UpgradeComponent, never, never, {}, {}, never, never, false, never>;
}

declare class UpgradeHelper {
    private name;
    readonly $injector: IInjectorService;
    readonly element: Element;
    readonly $element: IAugmentedJQuery;
    readonly directive: IDirective;
    private readonly $compile;
    private readonly $controller;
    constructor(injector: Injector, name: string, elementRef: ElementRef, directive?: IDirective);
    static getDirective($injector: IInjectorService, name: string): IDirective;
    static getTemplate($injector: IInjectorService, directive: IDirective, fetchRemoteTemplate?: boolean, $element?: IAugmentedJQuery): string | Promise<string>;
    buildController(controllerType: IController, $scope: IScope): any;
    compileTemplate(template?: string): ILinkFn;
    onDestroy($scope: IScope, controllerInstance?: any): void;
    prepareTransclusion(): ILinkFn | undefined;
    resolveAndBindRequiredControllers(controllerInstance: IControllerInstance | null): SingleOrListOrMap<IControllerInstance> | null;
    private compileHtml;
    private extractChildNodes;
    private getDirectiveRequire;
    private resolveRequire;
}

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
 * * Core AngularJS services<br />
 *   Importing this `NgModule` will add providers for the core
 *   [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * * Bootstrap<br />
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
 * Finally, kick off the whole process, by bootstrapping your top level Angular `NgModule`.
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
export declare class UpgradeModule {
    /** The bootstrap zone for the upgrade application */
    ngZone: NgZone;
    /**
     * The owning `NgModuleRef`s `PlatformRef` instance.
     * This is used to tie the lifecycle of the bootstrapped AngularJS apps to that of the Angular
     * `PlatformRef`.
     */
    private platformRef;
    /**
     * The AngularJS `$injector` for the upgrade application.
     */
    $injector: any;
    /** The Angular Injector **/
    injector: Injector;
    constructor(
    /** The root `Injector` for the upgrade application. */
    injector: Injector, 
    /** The bootstrap zone for the upgrade application */
    ngZone: NgZone, 
    /**
     * The owning `NgModuleRef`s `PlatformRef` instance.
     * This is used to tie the lifecycle of the bootstrapped AngularJS apps to that of the Angular
     * `PlatformRef`.
     */
    platformRef: PlatformRef);
    /**
     * Bootstrap an AngularJS application from this NgModule
     * @param element the element on which to bootstrap the AngularJS application
     * @param [modules] the AngularJS modules to bootstrap for this application
     * @param [config] optional extra AngularJS bootstrap configuration
     * @return The value returned by
     *     [angular.bootstrap()](https://docs.angularjs.org/api/ng/function/angular.bootstrap).
     */
    bootstrap(element: Element, modules?: string[], config?: any): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<UpgradeModule, never>;
    static ɵmod: i0.ɵɵNgModuleDeclaration<UpgradeModule, never, never, never>;
    static ɵinj: i0.ɵɵInjectorDeclaration<UpgradeModule>;
}

declare function validateInjectionKey($injector: IInjectorService, downgradedModule: string, injectionKey: string, attemptedAction: string): void;

/**
 * @publicApi
 */
export declare const VERSION: Version;

declare namespace ɵangular1 {
    export {
        setAngularLib,
        getAngularLib,
        setAngularJSGlobal,
        getAngularJSGlobal,
        Ng1Token,
        Ng1Expression,
        IAnnotatedFunction,
        IInjectable,
        SingleOrListOrMap,
        IModule,
        ICompileService,
        ILinkFn,
        ILinkFnOptions,
        IRootScopeService,
        IScope,
        IAngularBootstrapConfig,
        IDirective,
        DirectiveRequireProperty,
        DirectiveTranscludeProperty,
        IDirectiveCompileFn,
        IDirectivePrePost,
        IDirectiveLinkFn,
        IComponent,
        IAttributes,
        ITranscludeFunction,
        ICloneAttachFunction,
        IAugmentedJQuery,
        IProvider,
        IProvideService,
        IParseService,
        ICompiledExpression,
        IHttpBackendService,
        ICacheObject,
        ITemplateCacheService,
        IController,
        IControllerService,
        IInjectorService,
        IIntervalService,
        ITestabilityService,
        INgModelController,
        bootstrap,
        module_,
        element,
        injector,
        resumeBootstrap,
        getTestability
    }
}
export { ɵangular1 }

declare namespace ɵconstants {
    export {
        $COMPILE,
        $CONTROLLER,
        $DELEGATE,
        $EXCEPTION_HANDLER,
        $HTTP_BACKEND,
        $INJECTOR,
        $INTERVAL,
        $PARSE,
        $PROVIDE,
        $ROOT_ELEMENT,
        $ROOT_SCOPE,
        $SCOPE,
        $TEMPLATE_CACHE,
        $TEMPLATE_REQUEST,
        $$TESTABILITY,
        COMPILER_KEY,
        DOWNGRADED_MODULE_COUNT_KEY,
        GROUP_PROJECTABLE_NODES_KEY,
        INJECTOR_KEY,
        LAZY_MODULE_REF,
        NG_ZONE_KEY,
        UPGRADE_APP_TYPE_KEY,
        REQUIRE_INJECTOR,
        REQUIRE_NG_MODEL,
        UPGRADE_MODULE_NAME
    }
}
export { ɵconstants }

declare namespace ɵupgradeHelper {
    export {
        IBindingDestination,
        IControllerInstance,
        UpgradeHelper
    }
}
export { ɵupgradeHelper }

declare namespace ɵutil {
    export {
        onError,
        cleanData,
        controllerKey,
        destroyApp,
        directiveNormalize,
        getTypeName,
        getDowngradedModuleCount,
        getUpgradeAppType,
        isFunction,
        isNgModuleType,
        validateInjectionKey,
        hookupNgModel,
        strictEquals,
        Deferred,
        LazyModuleRef,
        UpgradeAppType
    }
}
export { ɵutil }

export { }
