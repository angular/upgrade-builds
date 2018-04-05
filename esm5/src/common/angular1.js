/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @record
 */
export function IAnnotatedFunction() { }
function IAnnotatedFunction_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    IAnnotatedFunction.prototype.$inject;
}
/**
 * @record
 */
export function IModule() { }
function IModule_tsickle_Closure_declarations() {
    /** @type {?} */
    IModule.prototype.name;
    /** @type {?} */
    IModule.prototype.requires;
    /** @type {?} */
    IModule.prototype.config;
    /** @type {?} */
    IModule.prototype.directive;
    /** @type {?} */
    IModule.prototype.component;
    /** @type {?} */
    IModule.prototype.controller;
    /** @type {?} */
    IModule.prototype.factory;
    /** @type {?} */
    IModule.prototype.value;
    /** @type {?} */
    IModule.prototype.constant;
    /** @type {?} */
    IModule.prototype.run;
}
/**
 * @record
 */
export function ICompileService() { }
function ICompileService_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (element: Element|NodeList|Node[]|string, transclude?: Function): ILinkFn;
    */
}
/**
 * @record
 */
export function ILinkFn() { }
function ILinkFn_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (scope: IScope, cloneAttachFn?: ICloneAttachFunction, options?: ILinkFnOptions): IAugmentedJQuery;
    */
    /** @type {?|undefined} */
    ILinkFn.prototype.$$slots;
}
/**
 * @record
 */
export function ILinkFnOptions() { }
function ILinkFnOptions_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    ILinkFnOptions.prototype.parentBoundTranscludeFn;
    /** @type {?|undefined} */
    ILinkFnOptions.prototype.transcludeControllers;
    /** @type {?|undefined} */
    ILinkFnOptions.prototype.futureParentElement;
}
/**
 * @record
 */
export function IRootScopeService() { }
function IRootScopeService_tsickle_Closure_declarations() {
    /** @type {?} */
    IRootScopeService.prototype.$new;
    /** @type {?} */
    IRootScopeService.prototype.$id;
    /** @type {?} */
    IRootScopeService.prototype.$parent;
    /** @type {?} */
    IRootScopeService.prototype.$root;
    /** @type {?} */
    IRootScopeService.prototype.$watch;
    /** @type {?} */
    IRootScopeService.prototype.$on;
    /** @type {?} */
    IRootScopeService.prototype.$destroy;
    /** @type {?} */
    IRootScopeService.prototype.$apply;
    /** @type {?} */
    IRootScopeService.prototype.$digest;
    /** @type {?} */
    IRootScopeService.prototype.$evalAsync;
    /** @type {?} */
    IRootScopeService.prototype.$on;
    /** @type {?} */
    IRootScopeService.prototype.$$childTail;
    /** @type {?} */
    IRootScopeService.prototype.$$childHead;
    /** @type {?} */
    IRootScopeService.prototype.$$nextSibling;
    /* TODO: handle strange member:
    [key: string]: any;
    */
}
/**
 * @record
 */
export function IScope() { }
function IScope_tsickle_Closure_declarations() {
}
/**
 * @record
 */
export function IAngularBootstrapConfig() { }
function IAngularBootstrapConfig_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    IAngularBootstrapConfig.prototype.strictDi;
}
/**
 * @record
 */
export function IDirective() { }
function IDirective_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    IDirective.prototype.compile;
    /** @type {?|undefined} */
    IDirective.prototype.controller;
    /** @type {?|undefined} */
    IDirective.prototype.controllerAs;
    /** @type {?|undefined} */
    IDirective.prototype.bindToController;
    /** @type {?|undefined} */
    IDirective.prototype.link;
    /** @type {?|undefined} */
    IDirective.prototype.name;
    /** @type {?|undefined} */
    IDirective.prototype.priority;
    /** @type {?|undefined} */
    IDirective.prototype.replace;
    /** @type {?|undefined} */
    IDirective.prototype.require;
    /** @type {?|undefined} */
    IDirective.prototype.restrict;
    /** @type {?|undefined} */
    IDirective.prototype.scope;
    /** @type {?|undefined} */
    IDirective.prototype.template;
    /** @type {?|undefined} */
    IDirective.prototype.templateUrl;
    /** @type {?|undefined} */
    IDirective.prototype.templateNamespace;
    /** @type {?|undefined} */
    IDirective.prototype.terminal;
    /** @type {?|undefined} */
    IDirective.prototype.transclude;
}
/**
 * @record
 */
export function IDirectiveCompileFn() { }
function IDirectiveCompileFn_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (templateElement: IAugmentedJQuery, templateAttributes: IAttributes,
       transclude: ITranscludeFunction): IDirectivePrePost;
    */
}
/**
 * @record
 */
export function IDirectivePrePost() { }
function IDirectivePrePost_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    IDirectivePrePost.prototype.pre;
    /** @type {?|undefined} */
    IDirectivePrePost.prototype.post;
}
/**
 * @record
 */
export function IDirectiveLinkFn() { }
function IDirectiveLinkFn_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (scope: IScope, instanceElement: IAugmentedJQuery, instanceAttributes: IAttributes,
       controller: any, transclude: ITranscludeFunction): void;
    */
}
/**
 * @record
 */
export function IComponent() { }
function IComponent_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    IComponent.prototype.bindings;
    /** @type {?|undefined} */
    IComponent.prototype.controller;
    /** @type {?|undefined} */
    IComponent.prototype.controllerAs;
    /** @type {?|undefined} */
    IComponent.prototype.require;
    /** @type {?|undefined} */
    IComponent.prototype.template;
    /** @type {?|undefined} */
    IComponent.prototype.templateUrl;
    /** @type {?|undefined} */
    IComponent.prototype.transclude;
}
/**
 * @record
 */
export function IAttributes() { }
function IAttributes_tsickle_Closure_declarations() {
    /** @type {?} */
    IAttributes.prototype.$observe;
    /* TODO: handle strange member:
    [key: string]: any;
    */
}
/**
 * @record
 */
export function ITranscludeFunction() { }
function ITranscludeFunction_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (scope: IScope, cloneAttachFn: ICloneAttachFunction): IAugmentedJQuery;
    */
    /* TODO: handle strange member:
    (cloneAttachFn?: ICloneAttachFunction): IAugmentedJQuery;
    */
}
/**
 * @record
 */
export function ICloneAttachFunction() { }
function ICloneAttachFunction_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (clonedElement?: IAugmentedJQuery, scope?: IScope): any;
    */
}
/**
 * @record
 */
export function IProvider() { }
function IProvider_tsickle_Closure_declarations() {
    /** @type {?} */
    IProvider.prototype.$get;
}
/**
 * @record
 */
export function IProvideService() { }
function IProvideService_tsickle_Closure_declarations() {
    /** @type {?} */
    IProvideService.prototype.provider;
    /** @type {?} */
    IProvideService.prototype.factory;
    /** @type {?} */
    IProvideService.prototype.service;
    /** @type {?} */
    IProvideService.prototype.value;
    /** @type {?} */
    IProvideService.prototype.constant;
    /** @type {?} */
    IProvideService.prototype.decorator;
}
/**
 * @record
 */
export function IParseService() { }
function IParseService_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (expression: string): ICompiledExpression;
    */
}
/**
 * @record
 */
export function ICompiledExpression() { }
function ICompiledExpression_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (context: any, locals: any): any;
    */
    /** @type {?|undefined} */
    ICompiledExpression.prototype.assign;
}
/**
 * @record
 */
export function IHttpBackendService() { }
function IHttpBackendService_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (method: string, url: string, post?: any, callback?: Function, headers?: any, timeout?: number,
       withCredentials?: boolean): void;
    */
}
/**
 * @record
 */
export function ICacheObject() { }
function ICacheObject_tsickle_Closure_declarations() {
    /** @type {?} */
    ICacheObject.prototype.put;
    /** @type {?} */
    ICacheObject.prototype.get;
}
/**
 * @record
 */
export function ITemplateCacheService() { }
function ITemplateCacheService_tsickle_Closure_declarations() {
}
/**
 * @record
 */
export function ITemplateRequestService() { }
function ITemplateRequestService_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (template: string|any __ TrustedResourceUrl __, ignoreRequestError?: boolean): Promise<string>;
    */
    /** @type {?} */
    ITemplateRequestService.prototype.totalPendingRequests;
}
/**
 * @record
 */
export function IControllerService() { }
function IControllerService_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (controllerConstructor: IController, locals?: any, later?: any, ident?: any): any;
    */
    /* TODO: handle strange member:
    (controllerName: string, locals?: any): any;
    */
}
/**
 * @record
 */
export function IInjectorService() { }
function IInjectorService_tsickle_Closure_declarations() {
    /** @type {?} */
    IInjectorService.prototype.get;
    /** @type {?} */
    IInjectorService.prototype.has;
}
/**
 * @record
 */
export function IIntervalService() { }
function IIntervalService_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    (func: Function, delay: number, count?: number, invokeApply?: boolean,
       ...args: any[]): Promise<any>;
    */
    /** @type {?} */
    IIntervalService.prototype.cancel;
}
/**
 * @record
 */
export function ITestabilityService() { }
function ITestabilityService_tsickle_Closure_declarations() {
    /** @type {?} */
    ITestabilityService.prototype.findBindings;
    /** @type {?} */
    ITestabilityService.prototype.findModels;
    /** @type {?} */
    ITestabilityService.prototype.getLocation;
    /** @type {?} */
    ITestabilityService.prototype.setLocation;
    /** @type {?} */
    ITestabilityService.prototype.whenStable;
}
/**
 * @record
 */
export function INgModelController() { }
function INgModelController_tsickle_Closure_declarations() {
    /** @type {?} */
    INgModelController.prototype.$render;
    /** @type {?} */
    INgModelController.prototype.$isEmpty;
    /** @type {?} */
    INgModelController.prototype.$setValidity;
    /** @type {?} */
    INgModelController.prototype.$setPristine;
    /** @type {?} */
    INgModelController.prototype.$setDirty;
    /** @type {?} */
    INgModelController.prototype.$setUntouched;
    /** @type {?} */
    INgModelController.prototype.$setTouched;
    /** @type {?} */
    INgModelController.prototype.$rollbackViewValue;
    /** @type {?} */
    INgModelController.prototype.$validate;
    /** @type {?} */
    INgModelController.prototype.$commitViewValue;
    /** @type {?} */
    INgModelController.prototype.$setViewValue;
    /** @type {?} */
    INgModelController.prototype.$viewValue;
    /** @type {?} */
    INgModelController.prototype.$modelValue;
    /** @type {?} */
    INgModelController.prototype.$parsers;
    /** @type {?} */
    INgModelController.prototype.$formatters;
    /** @type {?} */
    INgModelController.prototype.$validators;
    /** @type {?} */
    INgModelController.prototype.$asyncValidators;
    /** @type {?} */
    INgModelController.prototype.$viewChangeListeners;
    /** @type {?} */
    INgModelController.prototype.$error;
    /** @type {?} */
    INgModelController.prototype.$pending;
    /** @type {?} */
    INgModelController.prototype.$untouched;
    /** @type {?} */
    INgModelController.prototype.$touched;
    /** @type {?} */
    INgModelController.prototype.$pristine;
    /** @type {?} */
    INgModelController.prototype.$dirty;
    /** @type {?} */
    INgModelController.prototype.$valid;
    /** @type {?} */
    INgModelController.prototype.$invalid;
    /** @type {?} */
    INgModelController.prototype.$name;
}
/**
 * @return {?}
 */
function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
var /** @type {?} */ angular = /** @type {?} */ ({
    bootstrap: noNg,
    module: noNg,
    element: noNg,
    version: undefined,
    resumeBootstrap: noNg,
    getTestability: noNg
});
try {
    if (window.hasOwnProperty('angular')) {
        angular = (/** @type {?} */ (window)).angular;
    }
}
catch (/** @type {?} */ e) {
    // ignore in CJS mode.
}
/**
 * @deprecated Use `setAngularJSGlobal` instead.
 * @param {?} ng
 * @return {?}
 */
export function setAngularLib(ng) {
    setAngularJSGlobal(ng);
}
/**
 * @deprecated Use `getAngularJSGlobal` instead.
 * @return {?}
 */
export function getAngularLib() {
    return getAngularJSGlobal();
}
/**
 * Resets the AngularJS global.
 *
 * Used when AngularJS is loaded lazily, and not available on `window`.
 *
 * \@stable
 * @param {?} ng
 * @return {?}
 */
export function setAngularJSGlobal(ng) {
    angular = ng;
    version = ng && ng.version;
}
/**
 * Returns the current AngularJS global.
 *
 * \@stable
 * @return {?}
 */
export function getAngularJSGlobal() {
    return angular;
}
export var /** @type {?} */ bootstrap = function (e, modules, config) {
    return angular.bootstrap(e, modules, config);
};
export var /** @type {?} */ module = function (prefix, dependencies) {
    return angular.module(prefix, dependencies);
};
export var /** @type {?} */ element = function (e) { return angular.element(e); };
export var /** @type {?} */ resumeBootstrap = function () { return angular.resumeBootstrap(); };
export var /** @type {?} */ getTestability = function (e) { return angular.getTestability(e); };
export var /** @type {?} */ version = angular.version;
//# sourceMappingURL=angular1.js.map