/**
 * @license Angular v20.0.0-next.4+sha-5948cd0
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import { Version } from '@angular/core';

/**
 * @module
 * @description
 * Entry point for all public APIs of the upgrade package.
 */

/**
 * @publicApi
 */
declare const VERSION: Version;

type Ng1Token = string;
type Ng1Expression = string | Function;
interface IAnnotatedFunction extends Function {
    $inject?: Function extends {
        $inject?: string[];
    } ? Ng1Token[] : ReadonlyArray<Ng1Token>;
}
type IInjectable = (Ng1Token | Function)[] | IAnnotatedFunction;
type SingleOrListOrMap<T> = T | T[] | {
    [key: string]: T;
};
interface IModule {
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
interface ICompileService {
    (element: Element | NodeList | Node[] | string, transclude?: Function): ILinkFn;
}
interface ILinkFn {
    (scope: IScope, cloneAttachFn?: ICloneAttachFunction, options?: ILinkFnOptions): IAugmentedJQuery;
    $$slots?: {
        [slotName: string]: ILinkFn;
    };
}
interface ILinkFnOptions {
    parentBoundTranscludeFn?: Function;
    transcludeControllers?: {
        [key: string]: any;
    };
    futureParentElement?: Node;
}
interface IRootScopeService {
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
interface IScope extends IRootScopeService {
}
interface IAngularBootstrapConfig {
    strictDi?: boolean;
}
interface IDirective {
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
type DirectiveRequireProperty = SingleOrListOrMap<string>;
type DirectiveTranscludeProperty = boolean | 'element' | {
    [key: string]: string;
};
interface IDirectiveCompileFn {
    (templateElement: IAugmentedJQuery, templateAttributes: IAttributes, transclude: ITranscludeFunction): IDirectivePrePost;
}
interface IDirectivePrePost {
    pre?: IDirectiveLinkFn;
    post?: IDirectiveLinkFn;
}
interface IDirectiveLinkFn {
    (scope: IScope, instanceElement: IAugmentedJQuery, instanceAttributes: IAttributes, controller: any, transclude: ITranscludeFunction): void;
}
interface IComponent {
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
interface IAttributes {
    $observe(attr: string, fn: (v: string) => void): void;
    [key: string]: any;
}
interface ITranscludeFunction {
    (scope: IScope, cloneAttachFn: ICloneAttachFunction): IAugmentedJQuery;
    (cloneAttachFn?: ICloneAttachFunction): IAugmentedJQuery;
}
interface ICloneAttachFunction {
    (clonedElement: IAugmentedJQuery, scope: IScope): any;
}
type IAugmentedJQuery = Node[] & {
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
interface IProvider {
    $get: IInjectable;
}
interface IProvideService {
    provider(token: Ng1Token, provider: IProvider): IProvider;
    factory(token: Ng1Token, factory: IInjectable): IProvider;
    service(token: Ng1Token, type: IInjectable): IProvider;
    value(token: Ng1Token, value: any): IProvider;
    constant(token: Ng1Token, value: any): void;
    decorator(token: Ng1Token, factory: IInjectable): void;
}
interface IParseService {
    (expression: string): ICompiledExpression;
}
interface ICompiledExpression {
    (context: any, locals: any): any;
    assign?: (context: any, value: any) => any;
}
interface IHttpBackendService {
    (method: string, url: string, post?: any, callback?: Function, headers?: any, timeout?: number, withCredentials?: boolean): void;
}
interface ICacheObject {
    put<T>(key: string, value?: T): T;
    get(key: string): any;
}
interface ITemplateCacheService extends ICacheObject {
}
type IController = string | IInjectable;
interface IControllerService {
    (controllerConstructor: IController, locals?: any, later?: any, ident?: any): any;
    (controllerName: string, locals?: any): any;
}
interface IInjectorService {
    get(key: string): any;
    has(key: string): boolean;
}
interface IIntervalService {
    (func: Function, delay: number, count?: number, invokeApply?: boolean, ...args: any[]): Promise<any>;
    cancel(promise: Promise<any>): boolean;
}
interface ITestabilityService {
    findBindings(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
    findModels(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
    getLocation(): string;
    setLocation(url: string): void;
    whenStable(callback: Function): void;
}
interface INgModelController {
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
 * @deprecated Use `setAngularJSGlobal` instead.
 *
 * @publicApi
 */
declare function setAngularLib(ng: any): void;
/**
 * @deprecated Use `getAngularJSGlobal` instead.
 *
 * @publicApi
 */
declare function getAngularLib(): any;
/**
 * Resets the AngularJS global.
 *
 * Used when AngularJS is loaded lazily, and not available on `window`.
 *
 * @publicApi
 */
declare function setAngularJSGlobal(ng: any): void;
/**
 * Returns the current AngularJS global.
 *
 * @publicApi
 */
declare function getAngularJSGlobal(): any;
declare const bootstrap: typeof angular.bootstrap;
declare const module_: typeof angular.module;
declare const element: typeof angular.element;
declare const injector: typeof angular.injector;
declare const resumeBootstrap: typeof angular.resumeBootstrap;
declare const getTestability: typeof angular.getTestability;

type angular1_d_DirectiveRequireProperty = DirectiveRequireProperty;
type angular1_d_DirectiveTranscludeProperty = DirectiveTranscludeProperty;
type angular1_d_IAngularBootstrapConfig = IAngularBootstrapConfig;
type angular1_d_IAnnotatedFunction = IAnnotatedFunction;
type angular1_d_IAttributes = IAttributes;
type angular1_d_IAugmentedJQuery = IAugmentedJQuery;
type angular1_d_ICacheObject = ICacheObject;
type angular1_d_ICloneAttachFunction = ICloneAttachFunction;
type angular1_d_ICompileService = ICompileService;
type angular1_d_ICompiledExpression = ICompiledExpression;
type angular1_d_IComponent = IComponent;
type angular1_d_IController = IController;
type angular1_d_IControllerService = IControllerService;
type angular1_d_IDirective = IDirective;
type angular1_d_IDirectiveCompileFn = IDirectiveCompileFn;
type angular1_d_IDirectiveLinkFn = IDirectiveLinkFn;
type angular1_d_IDirectivePrePost = IDirectivePrePost;
type angular1_d_IHttpBackendService = IHttpBackendService;
type angular1_d_IInjectable = IInjectable;
type angular1_d_IInjectorService = IInjectorService;
type angular1_d_IIntervalService = IIntervalService;
type angular1_d_ILinkFn = ILinkFn;
type angular1_d_ILinkFnOptions = ILinkFnOptions;
type angular1_d_IModule = IModule;
type angular1_d_INgModelController = INgModelController;
type angular1_d_IParseService = IParseService;
type angular1_d_IProvideService = IProvideService;
type angular1_d_IProvider = IProvider;
type angular1_d_IRootScopeService = IRootScopeService;
type angular1_d_IScope = IScope;
type angular1_d_ITemplateCacheService = ITemplateCacheService;
type angular1_d_ITestabilityService = ITestabilityService;
type angular1_d_ITranscludeFunction = ITranscludeFunction;
type angular1_d_Ng1Expression = Ng1Expression;
type angular1_d_Ng1Token = Ng1Token;
type angular1_d_SingleOrListOrMap<T> = SingleOrListOrMap<T>;
declare const angular1_d_bootstrap: typeof bootstrap;
declare const angular1_d_element: typeof element;
declare const angular1_d_getAngularJSGlobal: typeof getAngularJSGlobal;
declare const angular1_d_getAngularLib: typeof getAngularLib;
declare const angular1_d_getTestability: typeof getTestability;
declare const angular1_d_injector: typeof injector;
declare const angular1_d_module_: typeof module_;
declare const angular1_d_resumeBootstrap: typeof resumeBootstrap;
declare const angular1_d_setAngularJSGlobal: typeof setAngularJSGlobal;
declare const angular1_d_setAngularLib: typeof setAngularLib;
declare namespace angular1_d {
  export { type angular1_d_DirectiveRequireProperty as DirectiveRequireProperty, type angular1_d_DirectiveTranscludeProperty as DirectiveTranscludeProperty, type angular1_d_IAngularBootstrapConfig as IAngularBootstrapConfig, type angular1_d_IAnnotatedFunction as IAnnotatedFunction, type angular1_d_IAttributes as IAttributes, type angular1_d_IAugmentedJQuery as IAugmentedJQuery, type angular1_d_ICacheObject as ICacheObject, type angular1_d_ICloneAttachFunction as ICloneAttachFunction, type angular1_d_ICompileService as ICompileService, type angular1_d_ICompiledExpression as ICompiledExpression, type angular1_d_IComponent as IComponent, type angular1_d_IController as IController, type angular1_d_IControllerService as IControllerService, type angular1_d_IDirective as IDirective, type angular1_d_IDirectiveCompileFn as IDirectiveCompileFn, type angular1_d_IDirectiveLinkFn as IDirectiveLinkFn, type angular1_d_IDirectivePrePost as IDirectivePrePost, type angular1_d_IHttpBackendService as IHttpBackendService, type angular1_d_IInjectable as IInjectable, type angular1_d_IInjectorService as IInjectorService, type angular1_d_IIntervalService as IIntervalService, type angular1_d_ILinkFn as ILinkFn, type angular1_d_ILinkFnOptions as ILinkFnOptions, type angular1_d_IModule as IModule, type angular1_d_INgModelController as INgModelController, type angular1_d_IParseService as IParseService, type angular1_d_IProvideService as IProvideService, type angular1_d_IProvider as IProvider, type angular1_d_IRootScopeService as IRootScopeService, type angular1_d_IScope as IScope, type angular1_d_ITemplateCacheService as ITemplateCacheService, type angular1_d_ITestabilityService as ITestabilityService, type angular1_d_ITranscludeFunction as ITranscludeFunction, type angular1_d_Ng1Expression as Ng1Expression, type angular1_d_Ng1Token as Ng1Token, type angular1_d_SingleOrListOrMap as SingleOrListOrMap, angular1_d_bootstrap as bootstrap, angular1_d_element as element, angular1_d_getAngularJSGlobal as getAngularJSGlobal, angular1_d_getAngularLib as getAngularLib, angular1_d_getTestability as getTestability, angular1_d_injector as injector, angular1_d_module_ as module_, angular1_d_resumeBootstrap as resumeBootstrap, angular1_d_setAngularJSGlobal as setAngularJSGlobal, angular1_d_setAngularLib as setAngularLib };
}

export { type IRootScopeService as I, type SingleOrListOrMap as S, VERSION as V, type IInjectorService as a, type IAngularBootstrapConfig as b, type IAugmentedJQuery as c, type IDirective as d, type IController as e, type IScope as f, type ILinkFn as g, type INgModelController as h, getAngularJSGlobal as i, getAngularLib as j, setAngularLib as k, angular1_d as l, setAngularJSGlobal as s };
