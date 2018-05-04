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
let /** @type {?} */ angular = /** @type {?} */ ({
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
 *
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
 *
 * @return {?}
 */
export function getAngularJSGlobal() {
    return angular;
}
export const /** @type {?} */ bootstrap = (e, modules, config) => angular.bootstrap(e, modules, config);
export const /** @type {?} */ module = (prefix, dependencies) => angular.module(prefix, dependencies);
export const /** @type {?} */ element = (e) => angular.element(e);
export const /** @type {?} */ resumeBootstrap = () => angular.resumeBootstrap();
export const /** @type {?} */ getTestability = (e) => angular.getTestability(e);
export let /** @type {?} */ version = angular.version;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvY29tbW9uL2FuZ3VsYXIxLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVOQTtJQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztDQUNsRDtBQUdELHFCQUFJLE9BQU8scUJBUUY7SUFDUCxTQUFTLEVBQUUsSUFBSTtJQUNmLE1BQU0sRUFBRSxJQUFJO0lBQ1osT0FBTyxFQUFFLElBQUk7SUFDYixPQUFPLEVBQUUsU0FBUztJQUNsQixlQUFlLEVBQUUsSUFBSTtJQUNyQixjQUFjLEVBQUUsSUFBSTtDQUNyQixDQUFBLENBQUM7QUFFRixJQUFJLENBQUM7SUFDSCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyQyxPQUFPLEdBQUcsbUJBQU0sTUFBTSxFQUFDLENBQUMsT0FBTyxDQUFDO0tBQ2pDO0NBQ0Y7QUFBQyxLQUFLLENBQUMsQ0FBQyxpQkFBQSxDQUFDLEVBQUUsQ0FBQzs7Q0FFWjs7Ozs7O0FBS0QsTUFBTSx3QkFBd0IsRUFBTztJQUNuQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUN4Qjs7Ozs7QUFLRCxNQUFNO0lBQ0osTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Q0FDN0I7Ozs7Ozs7Ozs7QUFTRCxNQUFNLDZCQUE2QixFQUFPO0lBQ3hDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDYixPQUFPLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUM7Q0FDNUI7Ozs7Ozs7QUFPRCxNQUFNO0lBQ0osTUFBTSxDQUFDLE9BQU8sQ0FBQztDQUNoQjtBQUVELE1BQU0sQ0FBQyx1QkFBTSxTQUFTLEdBQ2xCLENBQUMsQ0FBVSxFQUFFLE9BQWlDLEVBQUUsTUFBZ0MsRUFBRSxFQUFFLENBQ2hGLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUU5QyxNQUFNLENBQUMsdUJBQU0sTUFBTSxHQUFHLENBQUMsTUFBYyxFQUFFLFlBQXVCLEVBQUUsRUFBRSxDQUM5RCxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztBQUV6QyxNQUFNLENBQUMsdUJBQU0sT0FBTyxHQUFHLENBQUMsQ0FBbUIsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVuRSxNQUFNLENBQUMsdUJBQU0sZUFBZSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUUvRCxNQUFNLENBQUMsdUJBQU0sY0FBYyxHQUFHLENBQUMsQ0FBVSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRXhFLE1BQU0sQ0FBQyxxQkFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHR5cGUgTmcxVG9rZW4gPSBzdHJpbmc7XG5cbmV4cG9ydCB0eXBlIE5nMUV4cHJlc3Npb24gPSBzdHJpbmcgfCBGdW5jdGlvbjtcblxuZXhwb3J0IGludGVyZmFjZSBJQW5ub3RhdGVkRnVuY3Rpb24gZXh0ZW5kcyBGdW5jdGlvbiB7ICRpbmplY3Q/OiBOZzFUb2tlbltdOyB9XG5cbmV4cG9ydCB0eXBlIElJbmplY3RhYmxlID0gKE5nMVRva2VuIHwgRnVuY3Rpb24pW10gfCBJQW5ub3RhdGVkRnVuY3Rpb247XG5cbmV4cG9ydCB0eXBlIFNpbmdsZU9yTGlzdE9yTWFwPFQ+ID0gVCB8IFRbXSB8IHtba2V5OiBzdHJpbmddOiBUfTtcblxuZXhwb3J0IGludGVyZmFjZSBJTW9kdWxlIHtcbiAgbmFtZTogc3RyaW5nO1xuICByZXF1aXJlczogKHN0cmluZ3xJSW5qZWN0YWJsZSlbXTtcbiAgY29uZmlnKGZuOiBJSW5qZWN0YWJsZSk6IElNb2R1bGU7XG4gIGRpcmVjdGl2ZShzZWxlY3Rvcjogc3RyaW5nLCBmYWN0b3J5OiBJSW5qZWN0YWJsZSk6IElNb2R1bGU7XG4gIGNvbXBvbmVudChzZWxlY3Rvcjogc3RyaW5nLCBjb21wb25lbnQ6IElDb21wb25lbnQpOiBJTW9kdWxlO1xuICBjb250cm9sbGVyKG5hbWU6IHN0cmluZywgdHlwZTogSUluamVjdGFibGUpOiBJTW9kdWxlO1xuICBmYWN0b3J5KGtleTogTmcxVG9rZW4sIGZhY3RvcnlGbjogSUluamVjdGFibGUpOiBJTW9kdWxlO1xuICB2YWx1ZShrZXk6IE5nMVRva2VuLCB2YWx1ZTogYW55KTogSU1vZHVsZTtcbiAgY29uc3RhbnQodG9rZW46IE5nMVRva2VuLCB2YWx1ZTogYW55KTogSU1vZHVsZTtcbiAgcnVuKGE6IElJbmplY3RhYmxlKTogSU1vZHVsZTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbXBpbGVTZXJ2aWNlIHtcbiAgKGVsZW1lbnQ6IEVsZW1lbnR8Tm9kZUxpc3R8Tm9kZVtdfHN0cmluZywgdHJhbnNjbHVkZT86IEZ1bmN0aW9uKTogSUxpbmtGbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUxpbmtGbiB7XG4gIChzY29wZTogSVNjb3BlLCBjbG9uZUF0dGFjaEZuPzogSUNsb25lQXR0YWNoRnVuY3Rpb24sIG9wdGlvbnM/OiBJTGlua0ZuT3B0aW9ucyk6IElBdWdtZW50ZWRKUXVlcnk7XG4gICQkc2xvdHM/OiB7W3Nsb3ROYW1lOiBzdHJpbmddOiBJTGlua0ZufTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUxpbmtGbk9wdGlvbnMge1xuICBwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbj86IEZ1bmN0aW9uO1xuICB0cmFuc2NsdWRlQ29udHJvbGxlcnM/OiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgZnV0dXJlUGFyZW50RWxlbWVudD86IE5vZGU7XG59XG5leHBvcnQgaW50ZXJmYWNlIElSb290U2NvcGVTZXJ2aWNlIHtcbiAgJG5ldyhpc29sYXRlPzogYm9vbGVhbik6IElTY29wZTtcbiAgJGlkOiBzdHJpbmc7XG4gICRwYXJlbnQ6IElTY29wZTtcbiAgJHJvb3Q6IElTY29wZTtcbiAgJHdhdGNoKGV4cDogTmcxRXhwcmVzc2lvbiwgZm4/OiAoYTE/OiBhbnksIGEyPzogYW55KSA9PiB2b2lkKTogRnVuY3Rpb247XG4gICRvbihldmVudDogc3RyaW5nLCBmbj86IChldmVudD86IGFueSwgLi4uYXJnczogYW55W10pID0+IHZvaWQpOiBGdW5jdGlvbjtcbiAgJGRlc3Ryb3koKTogYW55O1xuICAkYXBwbHkoZXhwPzogTmcxRXhwcmVzc2lvbik6IGFueTtcbiAgJGRpZ2VzdCgpOiBhbnk7XG4gICRldmFsQXN5bmMoZXhwOiBOZzFFeHByZXNzaW9uLCBsb2NhbHM/OiBhbnkpOiB2b2lkO1xuICAkb24oZXZlbnQ6IHN0cmluZywgZm4/OiAoZXZlbnQ/OiBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTogRnVuY3Rpb247XG4gICQkY2hpbGRUYWlsOiBJU2NvcGU7XG4gICQkY2hpbGRIZWFkOiBJU2NvcGU7XG4gICQkbmV4dFNpYmxpbmc6IElTY29wZTtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuZXhwb3J0IGludGVyZmFjZSBJU2NvcGUgZXh0ZW5kcyBJUm9vdFNjb3BlU2VydmljZSB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIElBbmd1bGFyQm9vdHN0cmFwQ29uZmlnIHsgc3RyaWN0RGk/OiBib29sZWFuOyB9XG5leHBvcnQgaW50ZXJmYWNlIElEaXJlY3RpdmUge1xuICBjb21waWxlPzogSURpcmVjdGl2ZUNvbXBpbGVGbjtcbiAgY29udHJvbGxlcj86IElDb250cm9sbGVyO1xuICBjb250cm9sbGVyQXM/OiBzdHJpbmc7XG4gIGJpbmRUb0NvbnRyb2xsZXI/OiBib29sZWFufHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBsaW5rPzogSURpcmVjdGl2ZUxpbmtGbnxJRGlyZWN0aXZlUHJlUG9zdDtcbiAgbmFtZT86IHN0cmluZztcbiAgcHJpb3JpdHk/OiBudW1iZXI7XG4gIHJlcGxhY2U/OiBib29sZWFuO1xuICByZXF1aXJlPzogRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5O1xuICByZXN0cmljdD86IHN0cmluZztcbiAgc2NvcGU/OiBib29sZWFufHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICB0ZW1wbGF0ZT86IHN0cmluZ3xGdW5jdGlvbjtcbiAgdGVtcGxhdGVVcmw/OiBzdHJpbmd8RnVuY3Rpb247XG4gIHRlbXBsYXRlTmFtZXNwYWNlPzogc3RyaW5nO1xuICB0ZXJtaW5hbD86IGJvb2xlYW47XG4gIHRyYW5zY2x1ZGU/OiBEaXJlY3RpdmVUcmFuc2NsdWRlUHJvcGVydHk7XG59XG5leHBvcnQgdHlwZSBEaXJlY3RpdmVSZXF1aXJlUHJvcGVydHkgPSBTaW5nbGVPckxpc3RPck1hcDxzdHJpbmc+O1xuZXhwb3J0IHR5cGUgRGlyZWN0aXZlVHJhbnNjbHVkZVByb3BlcnR5ID0gYm9vbGVhbiB8ICdlbGVtZW50JyB8IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuZXhwb3J0IGludGVyZmFjZSBJRGlyZWN0aXZlQ29tcGlsZUZuIHtcbiAgKHRlbXBsYXRlRWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeSwgdGVtcGxhdGVBdHRyaWJ1dGVzOiBJQXR0cmlidXRlcyxcbiAgIHRyYW5zY2x1ZGU6IElUcmFuc2NsdWRlRnVuY3Rpb24pOiBJRGlyZWN0aXZlUHJlUG9zdDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSURpcmVjdGl2ZVByZVBvc3Qge1xuICBwcmU/OiBJRGlyZWN0aXZlTGlua0ZuO1xuICBwb3N0PzogSURpcmVjdGl2ZUxpbmtGbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSURpcmVjdGl2ZUxpbmtGbiB7XG4gIChzY29wZTogSVNjb3BlLCBpbnN0YW5jZUVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnksIGluc3RhbmNlQXR0cmlidXRlczogSUF0dHJpYnV0ZXMsXG4gICBjb250cm9sbGVyOiBhbnksIHRyYW5zY2x1ZGU6IElUcmFuc2NsdWRlRnVuY3Rpb24pOiB2b2lkO1xufVxuZXhwb3J0IGludGVyZmFjZSBJQ29tcG9uZW50IHtcbiAgYmluZGluZ3M/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgY29udHJvbGxlcj86IHN0cmluZ3xJSW5qZWN0YWJsZTtcbiAgY29udHJvbGxlckFzPzogc3RyaW5nO1xuICByZXF1aXJlPzogRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5O1xuICB0ZW1wbGF0ZT86IHN0cmluZ3xGdW5jdGlvbjtcbiAgdGVtcGxhdGVVcmw/OiBzdHJpbmd8RnVuY3Rpb247XG4gIHRyYW5zY2x1ZGU/OiBEaXJlY3RpdmVUcmFuc2NsdWRlUHJvcGVydHk7XG59XG5leHBvcnQgaW50ZXJmYWNlIElBdHRyaWJ1dGVzIHtcbiAgJG9ic2VydmUoYXR0cjogc3RyaW5nLCBmbjogKHY6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQ7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVRyYW5zY2x1ZGVGdW5jdGlvbiB7XG4gIC8vIElmIHRoZSBzY29wZSBpcyBwcm92aWRlZCwgdGhlbiB0aGUgY2xvbmVBdHRhY2hGbiBtdXN0IGJlIGFzIHdlbGwuXG4gIChzY29wZTogSVNjb3BlLCBjbG9uZUF0dGFjaEZuOiBJQ2xvbmVBdHRhY2hGdW5jdGlvbik6IElBdWdtZW50ZWRKUXVlcnk7XG4gIC8vIElmIG9uZSBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhlbiBpdCdzIGFzc3VtZWQgdG8gYmUgdGhlIGNsb25lQXR0YWNoRm4uXG4gIChjbG9uZUF0dGFjaEZuPzogSUNsb25lQXR0YWNoRnVuY3Rpb24pOiBJQXVnbWVudGVkSlF1ZXJ5O1xufVxuZXhwb3J0IGludGVyZmFjZSBJQ2xvbmVBdHRhY2hGdW5jdGlvbiB7XG4gIC8vIExldCdzIGhpbnQgYnV0IG5vdCBmb3JjZSBjbG9uZUF0dGFjaEZuJ3Mgc2lnbmF0dXJlXG4gIChjbG9uZWRFbGVtZW50PzogSUF1Z21lbnRlZEpRdWVyeSwgc2NvcGU/OiBJU2NvcGUpOiBhbnk7XG59XG5leHBvcnQgdHlwZSBJQXVnbWVudGVkSlF1ZXJ5ID0gTm9kZVtdICYge1xuICBvbj86IChuYW1lOiBzdHJpbmcsIGZuOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xuICBkYXRhPzogKG5hbWU6IHN0cmluZywgdmFsdWU/OiBhbnkpID0+IGFueTtcbiAgdGV4dD86ICgpID0+IHN0cmluZztcbiAgaW5oZXJpdGVkRGF0YT86IChuYW1lOiBzdHJpbmcsIHZhbHVlPzogYW55KSA9PiBhbnk7XG4gIGNvbnRlbnRzPzogKCkgPT4gSUF1Z21lbnRlZEpRdWVyeTtcbiAgcGFyZW50PzogKCkgPT4gSUF1Z21lbnRlZEpRdWVyeTtcbiAgZW1wdHk/OiAoKSA9PiB2b2lkO1xuICBhcHBlbmQ/OiAoY29udGVudDogSUF1Z21lbnRlZEpRdWVyeSB8IHN0cmluZykgPT4gSUF1Z21lbnRlZEpRdWVyeTtcbiAgY29udHJvbGxlcj86IChuYW1lOiBzdHJpbmcpID0+IGFueTtcbiAgaXNvbGF0ZVNjb3BlPzogKCkgPT4gSVNjb3BlO1xuICBpbmplY3Rvcj86ICgpID0+IElJbmplY3RvclNlcnZpY2U7XG4gIHJlbW92ZT86ICgpID0+IHZvaWQ7XG4gIHJlbW92ZURhdGE/OiAoKSA9PiB2b2lkO1xufTtcbmV4cG9ydCBpbnRlcmZhY2UgSVByb3ZpZGVyIHsgJGdldDogSUluamVjdGFibGU7IH1cbmV4cG9ydCBpbnRlcmZhY2UgSVByb3ZpZGVTZXJ2aWNlIHtcbiAgcHJvdmlkZXIodG9rZW46IE5nMVRva2VuLCBwcm92aWRlcjogSVByb3ZpZGVyKTogSVByb3ZpZGVyO1xuICBmYWN0b3J5KHRva2VuOiBOZzFUb2tlbiwgZmFjdG9yeTogSUluamVjdGFibGUpOiBJUHJvdmlkZXI7XG4gIHNlcnZpY2UodG9rZW46IE5nMVRva2VuLCB0eXBlOiBJSW5qZWN0YWJsZSk6IElQcm92aWRlcjtcbiAgdmFsdWUodG9rZW46IE5nMVRva2VuLCB2YWx1ZTogYW55KTogSVByb3ZpZGVyO1xuICBjb25zdGFudCh0b2tlbjogTmcxVG9rZW4sIHZhbHVlOiBhbnkpOiB2b2lkO1xuICBkZWNvcmF0b3IodG9rZW46IE5nMVRva2VuLCBmYWN0b3J5OiBJSW5qZWN0YWJsZSk6IHZvaWQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIElQYXJzZVNlcnZpY2UgeyAoZXhwcmVzc2lvbjogc3RyaW5nKTogSUNvbXBpbGVkRXhwcmVzc2lvbjsgfVxuZXhwb3J0IGludGVyZmFjZSBJQ29tcGlsZWRFeHByZXNzaW9uIHtcbiAgKGNvbnRleHQ6IGFueSwgbG9jYWxzOiBhbnkpOiBhbnk7XG4gIGFzc2lnbj86IChjb250ZXh0OiBhbnksIHZhbHVlOiBhbnkpID0+IGFueTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUh0dHBCYWNrZW5kU2VydmljZSB7XG4gIChtZXRob2Q6IHN0cmluZywgdXJsOiBzdHJpbmcsIHBvc3Q/OiBhbnksIGNhbGxiYWNrPzogRnVuY3Rpb24sIGhlYWRlcnM/OiBhbnksIHRpbWVvdXQ/OiBudW1iZXIsXG4gICB3aXRoQ3JlZGVudGlhbHM/OiBib29sZWFuKTogdm9pZDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUNhY2hlT2JqZWN0IHtcbiAgcHV0PFQ+KGtleTogc3RyaW5nLCB2YWx1ZT86IFQpOiBUO1xuICBnZXQoa2V5OiBzdHJpbmcpOiBhbnk7XG59XG5leHBvcnQgaW50ZXJmYWNlIElUZW1wbGF0ZUNhY2hlU2VydmljZSBleHRlbmRzIElDYWNoZU9iamVjdCB7fVxuZXhwb3J0IGludGVyZmFjZSBJVGVtcGxhdGVSZXF1ZXN0U2VydmljZSB7XG4gICh0ZW1wbGF0ZTogc3RyaW5nfGFueSAvKiBUcnVzdGVkUmVzb3VyY2VVcmwgKi8sIGlnbm9yZVJlcXVlc3RFcnJvcj86IGJvb2xlYW4pOiBQcm9taXNlPHN0cmluZz47XG4gIHRvdGFsUGVuZGluZ1JlcXVlc3RzOiBudW1iZXI7XG59XG5leHBvcnQgdHlwZSBJQ29udHJvbGxlciA9IHN0cmluZyB8IElJbmplY3RhYmxlO1xuZXhwb3J0IGludGVyZmFjZSBJQ29udHJvbGxlclNlcnZpY2Uge1xuICAoY29udHJvbGxlckNvbnN0cnVjdG9yOiBJQ29udHJvbGxlciwgbG9jYWxzPzogYW55LCBsYXRlcj86IGFueSwgaWRlbnQ/OiBhbnkpOiBhbnk7XG4gIChjb250cm9sbGVyTmFtZTogc3RyaW5nLCBsb2NhbHM/OiBhbnkpOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUluamVjdG9yU2VydmljZSB7XG4gIGdldChrZXk6IHN0cmluZyk6IGFueTtcbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJSW50ZXJ2YWxTZXJ2aWNlIHtcbiAgKGZ1bmM6IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCBjb3VudD86IG51bWJlciwgaW52b2tlQXBwbHk/OiBib29sZWFuLFxuICAgLi4uYXJnczogYW55W10pOiBQcm9taXNlPGFueT47XG4gIGNhbmNlbChwcm9taXNlOiBQcm9taXNlPGFueT4pOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElUZXN0YWJpbGl0eVNlcnZpY2Uge1xuICBmaW5kQmluZGluZ3MoZWxlbWVudDogRWxlbWVudCwgZXhwcmVzc2lvbjogc3RyaW5nLCBvcHRfZXhhY3RNYXRjaD86IGJvb2xlYW4pOiBFbGVtZW50W107XG4gIGZpbmRNb2RlbHMoZWxlbWVudDogRWxlbWVudCwgZXhwcmVzc2lvbjogc3RyaW5nLCBvcHRfZXhhY3RNYXRjaD86IGJvb2xlYW4pOiBFbGVtZW50W107XG4gIGdldExvY2F0aW9uKCk6IHN0cmluZztcbiAgc2V0TG9jYXRpb24odXJsOiBzdHJpbmcpOiB2b2lkO1xuICB3aGVuU3RhYmxlKGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5nTW9kZWxDb250cm9sbGVyIHtcbiAgJHJlbmRlcigpOiB2b2lkO1xuICAkaXNFbXB0eSh2YWx1ZTogYW55KTogYm9vbGVhbjtcbiAgJHNldFZhbGlkaXR5KHZhbGlkYXRpb25FcnJvcktleTogc3RyaW5nLCBpc1ZhbGlkOiBib29sZWFuKTogdm9pZDtcbiAgJHNldFByaXN0aW5lKCk6IHZvaWQ7XG4gICRzZXREaXJ0eSgpOiB2b2lkO1xuICAkc2V0VW50b3VjaGVkKCk6IHZvaWQ7XG4gICRzZXRUb3VjaGVkKCk6IHZvaWQ7XG4gICRyb2xsYmFja1ZpZXdWYWx1ZSgpOiB2b2lkO1xuICAkdmFsaWRhdGUoKTogdm9pZDtcbiAgJGNvbW1pdFZpZXdWYWx1ZSgpOiB2b2lkO1xuICAkc2V0Vmlld1ZhbHVlKHZhbHVlOiBhbnksIHRyaWdnZXI6IHN0cmluZyk6IHZvaWQ7XG5cbiAgJHZpZXdWYWx1ZTogYW55O1xuICAkbW9kZWxWYWx1ZTogYW55O1xuICAkcGFyc2VyczogRnVuY3Rpb25bXTtcbiAgJGZvcm1hdHRlcnM6IEZ1bmN0aW9uW107XG4gICR2YWxpZGF0b3JzOiB7W2tleTogc3RyaW5nXTogRnVuY3Rpb259O1xuICAkYXN5bmNWYWxpZGF0b3JzOiB7W2tleTogc3RyaW5nXTogRnVuY3Rpb259O1xuICAkdmlld0NoYW5nZUxpc3RlbmVyczogRnVuY3Rpb25bXTtcbiAgJGVycm9yOiBPYmplY3Q7XG4gICRwZW5kaW5nOiBPYmplY3Q7XG4gICR1bnRvdWNoZWQ6IGJvb2xlYW47XG4gICR0b3VjaGVkOiBib29sZWFuO1xuICAkcHJpc3RpbmU6IGJvb2xlYW47XG4gICRkaXJ0eTogYm9vbGVhbjtcbiAgJHZhbGlkOiBib29sZWFuO1xuICAkaW52YWxpZDogYm9vbGVhbjtcbiAgJG5hbWU6IHN0cmluZztcbn1cblxuZnVuY3Rpb24gbm9OZygpIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdBbmd1bGFySlMgdjEueCBpcyBub3QgbG9hZGVkIScpO1xufVxuXG5cbmxldCBhbmd1bGFyOiB7XG4gIGJvb3RzdHJhcDogKGU6IEVsZW1lbnQsIG1vZHVsZXM6IChzdHJpbmcgfCBJSW5qZWN0YWJsZSlbXSwgY29uZmlnPzogSUFuZ3VsYXJCb290c3RyYXBDb25maWcpID0+XG4gICAgICAgICAgICAgICAgIElJbmplY3RvclNlcnZpY2UsXG4gIG1vZHVsZTogKHByZWZpeDogc3RyaW5nLCBkZXBlbmRlbmNpZXM/OiBzdHJpbmdbXSkgPT4gSU1vZHVsZSxcbiAgZWxlbWVudDogKGU6IEVsZW1lbnQgfCBzdHJpbmcpID0+IElBdWdtZW50ZWRKUXVlcnksXG4gIHZlcnNpb246IHttYWpvcjogbnVtYmVyfSxcbiAgcmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkLFxuICBnZXRUZXN0YWJpbGl0eTogKGU6IEVsZW1lbnQpID0+IElUZXN0YWJpbGl0eVNlcnZpY2Vcbn0gPSA8YW55PntcbiAgYm9vdHN0cmFwOiBub05nLFxuICBtb2R1bGU6IG5vTmcsXG4gIGVsZW1lbnQ6IG5vTmcsXG4gIHZlcnNpb246IHVuZGVmaW5lZCxcbiAgcmVzdW1lQm9vdHN0cmFwOiBub05nLFxuICBnZXRUZXN0YWJpbGl0eTogbm9OZ1xufTtcblxudHJ5IHtcbiAgaWYgKHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnYW5ndWxhcicpKSB7XG4gICAgYW5ndWxhciA9ICg8YW55PndpbmRvdykuYW5ndWxhcjtcbiAgfVxufSBjYXRjaCAoZSkge1xuICAvLyBpZ25vcmUgaW4gQ0pTIG1vZGUuXG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgVXNlIGBzZXRBbmd1bGFySlNHbG9iYWxgIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRBbmd1bGFyTGliKG5nOiBhbnkpOiB2b2lkIHtcbiAgc2V0QW5ndWxhckpTR2xvYmFsKG5nKTtcbn1cblxuLyoqXG4gKiBAZGVwcmVjYXRlZCBVc2UgYGdldEFuZ3VsYXJKU0dsb2JhbGAgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFuZ3VsYXJMaWIoKTogYW55IHtcbiAgcmV0dXJuIGdldEFuZ3VsYXJKU0dsb2JhbCgpO1xufVxuXG4vKipcbiAqIFJlc2V0cyB0aGUgQW5ndWxhckpTIGdsb2JhbC5cbiAqXG4gKiBVc2VkIHdoZW4gQW5ndWxhckpTIGlzIGxvYWRlZCBsYXppbHksIGFuZCBub3QgYXZhaWxhYmxlIG9uIGB3aW5kb3dgLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRBbmd1bGFySlNHbG9iYWwobmc6IGFueSk6IHZvaWQge1xuICBhbmd1bGFyID0gbmc7XG4gIHZlcnNpb24gPSBuZyAmJiBuZy52ZXJzaW9uO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGN1cnJlbnQgQW5ndWxhckpTIGdsb2JhbC5cbiAqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5ndWxhckpTR2xvYmFsKCk6IGFueSB7XG4gIHJldHVybiBhbmd1bGFyO1xufVxuXG5leHBvcnQgY29uc3QgYm9vdHN0cmFwID1cbiAgICAoZTogRWxlbWVudCwgbW9kdWxlczogKHN0cmluZyB8IElJbmplY3RhYmxlKVtdLCBjb25maWc/OiBJQW5ndWxhckJvb3RzdHJhcENvbmZpZykgPT5cbiAgICAgICAgYW5ndWxhci5ib290c3RyYXAoZSwgbW9kdWxlcywgY29uZmlnKTtcblxuZXhwb3J0IGNvbnN0IG1vZHVsZSA9IChwcmVmaXg6IHN0cmluZywgZGVwZW5kZW5jaWVzPzogc3RyaW5nW10pID0+XG4gICAgYW5ndWxhci5tb2R1bGUocHJlZml4LCBkZXBlbmRlbmNpZXMpO1xuXG5leHBvcnQgY29uc3QgZWxlbWVudCA9IChlOiBFbGVtZW50IHwgc3RyaW5nKSA9PiBhbmd1bGFyLmVsZW1lbnQoZSk7XG5cbmV4cG9ydCBjb25zdCByZXN1bWVCb290c3RyYXAgPSAoKSA9PiBhbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCgpO1xuXG5leHBvcnQgY29uc3QgZ2V0VGVzdGFiaWxpdHkgPSAoZTogRWxlbWVudCkgPT4gYW5ndWxhci5nZXRUZXN0YWJpbGl0eShlKTtcblxuZXhwb3J0IGxldCB2ZXJzaW9uID0gYW5ndWxhci52ZXJzaW9uO1xuIl19