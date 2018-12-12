/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
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
if (false) {
    /** @type {?|undefined} */
    IAnnotatedFunction.prototype.$inject;
}
/**
 * @record
 */
export function IModule() { }
if (false) {
    /** @type {?} */
    IModule.prototype.name;
    /** @type {?} */
    IModule.prototype.requires;
    /**
     * @param {?} fn
     * @return {?}
     */
    IModule.prototype.config = function (fn) { };
    /**
     * @param {?} selector
     * @param {?} factory
     * @return {?}
     */
    IModule.prototype.directive = function (selector, factory) { };
    /**
     * @param {?} selector
     * @param {?} component
     * @return {?}
     */
    IModule.prototype.component = function (selector, component) { };
    /**
     * @param {?} name
     * @param {?} type
     * @return {?}
     */
    IModule.prototype.controller = function (name, type) { };
    /**
     * @param {?} key
     * @param {?} factoryFn
     * @return {?}
     */
    IModule.prototype.factory = function (key, factoryFn) { };
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    IModule.prototype.value = function (key, value) { };
    /**
     * @param {?} token
     * @param {?} value
     * @return {?}
     */
    IModule.prototype.constant = function (token, value) { };
    /**
     * @param {?} a
     * @return {?}
     */
    IModule.prototype.run = function (a) { };
}
/**
 * @record
 */
export function ICompileService() { }
/**
 * @record
 */
export function ILinkFn() { }
if (false) {
    /** @type {?|undefined} */
    ILinkFn.prototype.$$slots;
    /* Skipping unhandled member: (scope: IScope, cloneAttachFn?: ICloneAttachFunction, options?: ILinkFnOptions): IAugmentedJQuery;*/
}
/**
 * @record
 */
export function ILinkFnOptions() { }
if (false) {
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
if (false) {
    /** @type {?} */
    IRootScopeService.prototype.$id;
    /** @type {?} */
    IRootScopeService.prototype.$parent;
    /** @type {?} */
    IRootScopeService.prototype.$root;
    /** @type {?} */
    IRootScopeService.prototype.$$childTail;
    /** @type {?} */
    IRootScopeService.prototype.$$childHead;
    /** @type {?} */
    IRootScopeService.prototype.$$nextSibling;
    /* Skipping unhandled member: [key: string]: any;*/
    /**
     * @param {?=} isolate
     * @return {?}
     */
    IRootScopeService.prototype.$new = function (isolate) { };
    /**
     * @param {?} exp
     * @param {?=} fn
     * @return {?}
     */
    IRootScopeService.prototype.$watch = function (exp, fn) { };
    /**
     * @param {?} event
     * @param {?=} fn
     * @return {?}
     */
    IRootScopeService.prototype.$on = function (event, fn) { };
    /**
     * @return {?}
     */
    IRootScopeService.prototype.$destroy = function () { };
    /**
     * @param {?=} exp
     * @return {?}
     */
    IRootScopeService.prototype.$apply = function (exp) { };
    /**
     * @return {?}
     */
    IRootScopeService.prototype.$digest = function () { };
    /**
     * @param {?} exp
     * @param {?=} locals
     * @return {?}
     */
    IRootScopeService.prototype.$evalAsync = function (exp, locals) { };
    /**
     * @param {?} event
     * @param {?=} fn
     * @return {?}
     */
    IRootScopeService.prototype.$on = function (event, fn) { };
}
/**
 * @record
 */
export function IScope() { }
/**
 * @record
 */
export function IAngularBootstrapConfig() { }
if (false) {
    /** @type {?|undefined} */
    IAngularBootstrapConfig.prototype.strictDi;
}
/**
 * @record
 */
export function IDirective() { }
if (false) {
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
/**
 * @record
 */
export function IDirectivePrePost() { }
if (false) {
    /** @type {?|undefined} */
    IDirectivePrePost.prototype.pre;
    /** @type {?|undefined} */
    IDirectivePrePost.prototype.post;
}
/**
 * @record
 */
export function IDirectiveLinkFn() { }
/**
 * @record
 */
export function IComponent() { }
if (false) {
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
if (false) {
    /* Skipping unhandled member: [key: string]: any;*/
    /**
     * @param {?} attr
     * @param {?} fn
     * @return {?}
     */
    IAttributes.prototype.$observe = function (attr, fn) { };
}
/**
 * @record
 */
export function ITranscludeFunction() { }
/**
 * @record
 */
export function ICloneAttachFunction() { }
/**
 * @record
 */
export function IProvider() { }
if (false) {
    /** @type {?} */
    IProvider.prototype.$get;
}
/**
 * @record
 */
export function IProvideService() { }
if (false) {
    /**
     * @param {?} token
     * @param {?} provider
     * @return {?}
     */
    IProvideService.prototype.provider = function (token, provider) { };
    /**
     * @param {?} token
     * @param {?} factory
     * @return {?}
     */
    IProvideService.prototype.factory = function (token, factory) { };
    /**
     * @param {?} token
     * @param {?} type
     * @return {?}
     */
    IProvideService.prototype.service = function (token, type) { };
    /**
     * @param {?} token
     * @param {?} value
     * @return {?}
     */
    IProvideService.prototype.value = function (token, value) { };
    /**
     * @param {?} token
     * @param {?} value
     * @return {?}
     */
    IProvideService.prototype.constant = function (token, value) { };
    /**
     * @param {?} token
     * @param {?} factory
     * @return {?}
     */
    IProvideService.prototype.decorator = function (token, factory) { };
}
/**
 * @record
 */
export function IParseService() { }
/**
 * @record
 */
export function ICompiledExpression() { }
if (false) {
    /** @type {?|undefined} */
    ICompiledExpression.prototype.assign;
    /* Skipping unhandled member: (context: any, locals: any): any;*/
}
/**
 * @record
 */
export function IHttpBackendService() { }
/**
 * @record
 */
export function ICacheObject() { }
if (false) {
    /**
     * @template T
     * @param {?} key
     * @param {?=} value
     * @return {?}
     */
    ICacheObject.prototype.put = function (key, value) { };
    /**
     * @param {?} key
     * @return {?}
     */
    ICacheObject.prototype.get = function (key) { };
}
/**
 * @record
 */
export function ITemplateCacheService() { }
/**
 * @record
 */
export function ITemplateRequestService() { }
if (false) {
    /** @type {?} */
    ITemplateRequestService.prototype.totalPendingRequests;
    /* Skipping unhandled member: (template: string|any __ TrustedResourceUrl __, ignoreRequestError?: boolean): Promise<string>;*/
}
/**
 * @record
 */
export function IControllerService() { }
/**
 * @record
 */
export function IInjectorService() { }
if (false) {
    /**
     * @param {?} key
     * @return {?}
     */
    IInjectorService.prototype.get = function (key) { };
    /**
     * @param {?} key
     * @return {?}
     */
    IInjectorService.prototype.has = function (key) { };
}
/**
 * @record
 */
export function IIntervalService() { }
if (false) {
    /* Skipping unhandled member: (func: Function, delay: number, count?: number, invokeApply?: boolean,
       ...args: any[]): Promise<any>;*/
    /**
     * @param {?} promise
     * @return {?}
     */
    IIntervalService.prototype.cancel = function (promise) { };
}
/**
 * @record
 */
export function ITestabilityService() { }
if (false) {
    /**
     * @param {?} element
     * @param {?} expression
     * @param {?=} opt_exactMatch
     * @return {?}
     */
    ITestabilityService.prototype.findBindings = function (element, expression, opt_exactMatch) { };
    /**
     * @param {?} element
     * @param {?} expression
     * @param {?=} opt_exactMatch
     * @return {?}
     */
    ITestabilityService.prototype.findModels = function (element, expression, opt_exactMatch) { };
    /**
     * @return {?}
     */
    ITestabilityService.prototype.getLocation = function () { };
    /**
     * @param {?} url
     * @return {?}
     */
    ITestabilityService.prototype.setLocation = function (url) { };
    /**
     * @param {?} callback
     * @return {?}
     */
    ITestabilityService.prototype.whenStable = function (callback) { };
}
/**
 * @record
 */
export function INgModelController() { }
if (false) {
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
    /**
     * @return {?}
     */
    INgModelController.prototype.$render = function () { };
    /**
     * @param {?} value
     * @return {?}
     */
    INgModelController.prototype.$isEmpty = function (value) { };
    /**
     * @param {?} validationErrorKey
     * @param {?} isValid
     * @return {?}
     */
    INgModelController.prototype.$setValidity = function (validationErrorKey, isValid) { };
    /**
     * @return {?}
     */
    INgModelController.prototype.$setPristine = function () { };
    /**
     * @return {?}
     */
    INgModelController.prototype.$setDirty = function () { };
    /**
     * @return {?}
     */
    INgModelController.prototype.$setUntouched = function () { };
    /**
     * @return {?}
     */
    INgModelController.prototype.$setTouched = function () { };
    /**
     * @return {?}
     */
    INgModelController.prototype.$rollbackViewValue = function () { };
    /**
     * @return {?}
     */
    INgModelController.prototype.$validate = function () { };
    /**
     * @return {?}
     */
    INgModelController.prototype.$commitViewValue = function () { };
    /**
     * @param {?} value
     * @param {?} trigger
     * @return {?}
     */
    INgModelController.prototype.$setViewValue = function (value, trigger) { };
}
/**
 * @return {?}
 */
function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
const ɵ0 = () => noNg();
/** @type {?} */
const noNgElement = (/** @type {?} */ ((ɵ0)));
noNgElement.cleanData = noNg;
/** @type {?} */
let angular = {
    bootstrap: noNg,
    module: noNg,
    element: noNgElement,
    version: (/** @type {?} */ (undefined)),
    resumeBootstrap: noNg,
    getTestability: noNg
};
try {
    if (window.hasOwnProperty('angular')) {
        angular = ((/** @type {?} */ (window))).angular;
    }
}
catch (e) {
    // ignore in CJS mode.
}
/**
 * @deprecated Use `setAngularJSGlobal` instead.
 *
 * \@publicApi
 * @param {?} ng
 * @return {?}
 */
export function setAngularLib(ng) {
    setAngularJSGlobal(ng);
}
/**
 * @deprecated Use `getAngularJSGlobal` instead.
 *
 * \@publicApi
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
 * \@publicApi
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
 * \@publicApi
 * @return {?}
 */
export function getAngularJSGlobal() {
    return angular;
}
/** @type {?} */
export const bootstrap = (e, modules, config) => angular.bootstrap(e, modules, config);
/** @type {?} */
export const module = (prefix, dependencies) => angular.module(prefix, dependencies);
/** @type {?} */
export const element = (/** @type {?} */ ((e => angular.element(e))));
element.cleanData = nodes => angular.element.cleanData(nodes);
/** @type {?} */
export const resumeBootstrap = () => angular.resumeBootstrap();
/** @type {?} */
export const getTestability = e => angular.getTestability(e);
/** @type {?} */
export let version = angular.version;
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjEuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vYW5ndWxhcjEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFZQSx3Q0FLQzs7O0lBREMscUNBQW9GOzs7OztBQU90Riw2QkFXQzs7O0lBVkMsdUJBQWE7O0lBQ2IsMkJBQWlDOzs7OztJQUNqQyw2Q0FBaUM7Ozs7OztJQUNqQywrREFBMkQ7Ozs7OztJQUMzRCxpRUFBNEQ7Ozs7OztJQUM1RCx5REFBcUQ7Ozs7OztJQUNyRCwwREFBd0Q7Ozs7OztJQUN4RCxvREFBMEM7Ozs7OztJQUMxQyx5REFBK0M7Ozs7O0lBQy9DLHlDQUE2Qjs7Ozs7QUFFL0IscUNBRUM7Ozs7QUFDRCw2QkFHQzs7O0lBREMsMEJBQXdDOzs7Ozs7QUFFMUMsb0NBSUM7OztJQUhDLGlEQUFtQzs7SUFDbkMsK0NBQTZDOztJQUM3Qyw2Q0FBMkI7Ozs7O0FBRTdCLHVDQWdCQzs7O0lBZEMsZ0NBQVk7O0lBQ1osb0NBQWdCOztJQUNoQixrQ0FBYzs7SUFRZCx3Q0FBb0I7O0lBQ3BCLHdDQUFvQjs7SUFDcEIsMENBQXNCOzs7Ozs7SUFidEIsMERBQWdDOzs7Ozs7SUFJaEMsNERBQXdFOzs7Ozs7SUFDeEUsMkRBQXlFOzs7O0lBQ3pFLHVEQUFnQjs7Ozs7SUFDaEIsd0RBQWlDOzs7O0lBQ2pDLHNEQUFlOzs7Ozs7SUFDZixvRUFBbUQ7Ozs7OztJQUNuRCwyREFBeUU7Ozs7O0FBTTNFLDRCQUFvRDs7OztBQUVwRCw2Q0FBZ0U7OztJQUFyQiwyQ0FBbUI7Ozs7O0FBQzlELGdDQWlCQzs7O0lBaEJDLDZCQUE4Qjs7SUFDOUIsZ0NBQXlCOztJQUN6QixrQ0FBc0I7O0lBQ3RCLHNDQUFtRDs7SUFDbkQsMEJBQTBDOztJQUMxQywwQkFBYzs7SUFDZCw4QkFBa0I7O0lBQ2xCLDZCQUFrQjs7SUFDbEIsNkJBQW1DOztJQUNuQyw4QkFBa0I7O0lB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ZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHR5cGUgTmcxVG9rZW4gPSBzdHJpbmc7XG5cbmV4cG9ydCB0eXBlIE5nMUV4cHJlc3Npb24gPSBzdHJpbmcgfCBGdW5jdGlvbjtcblxuZXhwb3J0IGludGVyZmFjZSBJQW5ub3RhdGVkRnVuY3Rpb24gZXh0ZW5kcyBGdW5jdGlvbiB7XG4gIC8vIE9sZGVyIHZlcnNpb25zIG9mIGBAdHlwZXMvYW5ndWxhcmAgdHlwaW5ncyBleHRlbmQgdGhlIGdsb2JhbCBgRnVuY3Rpb25gIGludGVyZmFjZSB3aXRoXG4gIC8vIGAkaW5qZWN0Pzogc3RyaW5nW11gLCB3aGljaCBpcyBub3QgY29tcGF0aWJsZSB3aXRoIGAkaW5qZWN0PzogUmVhZG9ubHlBcnJheTxzdHJpbmc+YCAodXNlZCBpblxuICAvLyBsYXRlc3QgdmVyc2lvbnMpLlxuICAkaW5qZWN0PzogRnVuY3Rpb24gZXh0ZW5kc3skaW5qZWN0Pzogc3RyaW5nW119PyBOZzFUb2tlbltdOiBSZWFkb25seUFycmF5PE5nMVRva2VuPjtcbn1cblxuZXhwb3J0IHR5cGUgSUluamVjdGFibGUgPSAoTmcxVG9rZW4gfCBGdW5jdGlvbilbXSB8IElBbm5vdGF0ZWRGdW5jdGlvbjtcblxuZXhwb3J0IHR5cGUgU2luZ2xlT3JMaXN0T3JNYXA8VD4gPSBUIHwgVFtdIHwge1trZXk6IHN0cmluZ106IFR9O1xuXG5leHBvcnQgaW50ZXJmYWNlIElNb2R1bGUge1xuICBuYW1lOiBzdHJpbmc7XG4gIHJlcXVpcmVzOiAoc3RyaW5nfElJbmplY3RhYmxlKVtdO1xuICBjb25maWcoZm46IElJbmplY3RhYmxlKTogSU1vZHVsZTtcbiAgZGlyZWN0aXZlKHNlbGVjdG9yOiBzdHJpbmcsIGZhY3Rvcnk6IElJbmplY3RhYmxlKTogSU1vZHVsZTtcbiAgY29tcG9uZW50KHNlbGVjdG9yOiBzdHJpbmcsIGNvbXBvbmVudDogSUNvbXBvbmVudCk6IElNb2R1bGU7XG4gIGNvbnRyb2xsZXIobmFtZTogc3RyaW5nLCB0eXBlOiBJSW5qZWN0YWJsZSk6IElNb2R1bGU7XG4gIGZhY3Rvcnkoa2V5OiBOZzFUb2tlbiwgZmFjdG9yeUZuOiBJSW5qZWN0YWJsZSk6IElNb2R1bGU7XG4gIHZhbHVlKGtleTogTmcxVG9rZW4sIHZhbHVlOiBhbnkpOiBJTW9kdWxlO1xuICBjb25zdGFudCh0b2tlbjogTmcxVG9rZW4sIHZhbHVlOiBhbnkpOiBJTW9kdWxlO1xuICBydW4oYTogSUluamVjdGFibGUpOiBJTW9kdWxlO1xufVxuZXhwb3J0IGludGVyZmFjZSBJQ29tcGlsZVNlcnZpY2Uge1xuICAoZWxlbWVudDogRWxlbWVudHxOb2RlTGlzdHxOb2RlW118c3RyaW5nLCB0cmFuc2NsdWRlPzogRnVuY3Rpb24pOiBJTGlua0ZuO1xufVxuZXhwb3J0IGludGVyZmFjZSBJTGlua0ZuIHtcbiAgKHNjb3BlOiBJU2NvcGUsIGNsb25lQXR0YWNoRm4/OiBJQ2xvbmVBdHRhY2hGdW5jdGlvbiwgb3B0aW9ucz86IElMaW5rRm5PcHRpb25zKTogSUF1Z21lbnRlZEpRdWVyeTtcbiAgJCRzbG90cz86IHtbc2xvdE5hbWU6IHN0cmluZ106IElMaW5rRm59O1xufVxuZXhwb3J0IGludGVyZmFjZSBJTGlua0ZuT3B0aW9ucyB7XG4gIHBhcmVudEJvdW5kVHJhbnNjbHVkZUZuPzogRnVuY3Rpb247XG4gIHRyYW5zY2x1ZGVDb250cm9sbGVycz86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuICBmdXR1cmVQYXJlbnRFbGVtZW50PzogTm9kZTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVJvb3RTY29wZVNlcnZpY2Uge1xuICAkbmV3KGlzb2xhdGU/OiBib29sZWFuKTogSVNjb3BlO1xuICAkaWQ6IHN0cmluZztcbiAgJHBhcmVudDogSVNjb3BlO1xuICAkcm9vdDogSVNjb3BlO1xuICAkd2F0Y2goZXhwOiBOZzFFeHByZXNzaW9uLCBmbj86IChhMT86IGFueSwgYTI/OiBhbnkpID0+IHZvaWQpOiBGdW5jdGlvbjtcbiAgJG9uKGV2ZW50OiBzdHJpbmcsIGZuPzogKGV2ZW50PzogYW55LCAuLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IEZ1bmN0aW9uO1xuICAkZGVzdHJveSgpOiBhbnk7XG4gICRhcHBseShleHA/OiBOZzFFeHByZXNzaW9uKTogYW55O1xuICAkZGlnZXN0KCk6IGFueTtcbiAgJGV2YWxBc3luYyhleHA6IE5nMUV4cHJlc3Npb24sIGxvY2Fscz86IGFueSk6IHZvaWQ7XG4gICRvbihldmVudDogc3RyaW5nLCBmbj86IChldmVudD86IGFueSwgLi4uYXJnczogYW55W10pID0+IHZvaWQpOiBGdW5jdGlvbjtcbiAgJCRjaGlsZFRhaWw6IElTY29wZTtcbiAgJCRjaGlsZEhlYWQ6IElTY29wZTtcbiAgJCRuZXh0U2libGluZzogSVNjb3BlO1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5leHBvcnQgaW50ZXJmYWNlIElTY29wZSBleHRlbmRzIElSb290U2NvcGVTZXJ2aWNlIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUFuZ3VsYXJCb290c3RyYXBDb25maWcgeyBzdHJpY3REaT86IGJvb2xlYW47IH1cbmV4cG9ydCBpbnRlcmZhY2UgSURpcmVjdGl2ZSB7XG4gIGNvbXBpbGU/OiBJRGlyZWN0aXZlQ29tcGlsZUZuO1xuICBjb250cm9sbGVyPzogSUNvbnRyb2xsZXI7XG4gIGNvbnRyb2xsZXJBcz86IHN0cmluZztcbiAgYmluZFRvQ29udHJvbGxlcj86IGJvb2xlYW58e1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGxpbms/OiBJRGlyZWN0aXZlTGlua0ZufElEaXJlY3RpdmVQcmVQb3N0O1xuICBuYW1lPzogc3RyaW5nO1xuICBwcmlvcml0eT86IG51bWJlcjtcbiAgcmVwbGFjZT86IGJvb2xlYW47XG4gIHJlcXVpcmU/OiBEaXJlY3RpdmVSZXF1aXJlUHJvcGVydHk7XG4gIHJlc3RyaWN0Pzogc3RyaW5nO1xuICBzY29wZT86IGJvb2xlYW58e1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIHRlbXBsYXRlPzogc3RyaW5nfEZ1bmN0aW9uO1xuICB0ZW1wbGF0ZVVybD86IHN0cmluZ3xGdW5jdGlvbjtcbiAgdGVtcGxhdGVOYW1lc3BhY2U/OiBzdHJpbmc7XG4gIHRlcm1pbmFsPzogYm9vbGVhbjtcbiAgdHJhbnNjbHVkZT86IERpcmVjdGl2ZVRyYW5zY2x1ZGVQcm9wZXJ0eTtcbn1cbmV4cG9ydCB0eXBlIERpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eSA9IFNpbmdsZU9yTGlzdE9yTWFwPHN0cmluZz47XG5leHBvcnQgdHlwZSBEaXJlY3RpdmVUcmFuc2NsdWRlUHJvcGVydHkgPSBib29sZWFuIHwgJ2VsZW1lbnQnIHwge1trZXk6IHN0cmluZ106IHN0cmluZ307XG5leHBvcnQgaW50ZXJmYWNlIElEaXJlY3RpdmVDb21waWxlRm4ge1xuICAodGVtcGxhdGVFbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5LCB0ZW1wbGF0ZUF0dHJpYnV0ZXM6IElBdHRyaWJ1dGVzLFxuICAgdHJhbnNjbHVkZTogSVRyYW5zY2x1ZGVGdW5jdGlvbik6IElEaXJlY3RpdmVQcmVQb3N0O1xufVxuZXhwb3J0IGludGVyZmFjZSBJRGlyZWN0aXZlUHJlUG9zdCB7XG4gIHByZT86IElEaXJlY3RpdmVMaW5rRm47XG4gIHBvc3Q/OiBJRGlyZWN0aXZlTGlua0ZuO1xufVxuZXhwb3J0IGludGVyZmFjZSBJRGlyZWN0aXZlTGlua0ZuIHtcbiAgKHNjb3BlOiBJU2NvcGUsIGluc3RhbmNlRWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeSwgaW5zdGFuY2VBdHRyaWJ1dGVzOiBJQXR0cmlidXRlcyxcbiAgIGNvbnRyb2xsZXI6IGFueSwgdHJhbnNjbHVkZTogSVRyYW5zY2x1ZGVGdW5jdGlvbik6IHZvaWQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIElDb21wb25lbnQge1xuICBiaW5kaW5ncz86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBjb250cm9sbGVyPzogc3RyaW5nfElJbmplY3RhYmxlO1xuICBjb250cm9sbGVyQXM/OiBzdHJpbmc7XG4gIHJlcXVpcmU/OiBEaXJlY3RpdmVSZXF1aXJlUHJvcGVydHk7XG4gIHRlbXBsYXRlPzogc3RyaW5nfEZ1bmN0aW9uO1xuICB0ZW1wbGF0ZVVybD86IHN0cmluZ3xGdW5jdGlvbjtcbiAgdHJhbnNjbHVkZT86IERpcmVjdGl2ZVRyYW5zY2x1ZGVQcm9wZXJ0eTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUF0dHJpYnV0ZXMge1xuICAkb2JzZXJ2ZShhdHRyOiBzdHJpbmcsIGZuOiAodjogc3RyaW5nKSA9PiB2b2lkKTogdm9pZDtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuZXhwb3J0IGludGVyZmFjZSBJVHJhbnNjbHVkZUZ1bmN0aW9uIHtcbiAgLy8gSWYgdGhlIHNjb3BlIGlzIHByb3ZpZGVkLCB0aGVuIHRoZSBjbG9uZUF0dGFjaEZuIG11c3QgYmUgYXMgd2VsbC5cbiAgKHNjb3BlOiBJU2NvcGUsIGNsb25lQXR0YWNoRm46IElDbG9uZUF0dGFjaEZ1bmN0aW9uKTogSUF1Z21lbnRlZEpRdWVyeTtcbiAgLy8gSWYgb25lIGFyZ3VtZW50IGlzIHByb3ZpZGVkLCB0aGVuIGl0J3MgYXNzdW1lZCB0byBiZSB0aGUgY2xvbmVBdHRhY2hGbi5cbiAgKGNsb25lQXR0YWNoRm4/OiBJQ2xvbmVBdHRhY2hGdW5jdGlvbik6IElBdWdtZW50ZWRKUXVlcnk7XG59XG5leHBvcnQgaW50ZXJmYWNlIElDbG9uZUF0dGFjaEZ1bmN0aW9uIHtcbiAgLy8gTGV0J3MgaGludCBidXQgbm90IGZvcmNlIGNsb25lQXR0YWNoRm4ncyBzaWduYXR1cmVcbiAgKGNsb25lZEVsZW1lbnQ/OiBJQXVnbWVudGVkSlF1ZXJ5LCBzY29wZT86IElTY29wZSk6IGFueTtcbn1cbmV4cG9ydCB0eXBlIElBdWdtZW50ZWRKUXVlcnkgPSBOb2RlW10gJiB7XG4gIG9uPzogKG5hbWU6IHN0cmluZywgZm46ICgpID0+IHZvaWQpID0+IHZvaWQ7XG4gIGRhdGE/OiAobmFtZTogc3RyaW5nLCB2YWx1ZT86IGFueSkgPT4gYW55O1xuICB0ZXh0PzogKCkgPT4gc3RyaW5nO1xuICBpbmhlcml0ZWREYXRhPzogKG5hbWU6IHN0cmluZywgdmFsdWU/OiBhbnkpID0+IGFueTtcbiAgY29udGVudHM/OiAoKSA9PiBJQXVnbWVudGVkSlF1ZXJ5O1xuICBwYXJlbnQ/OiAoKSA9PiBJQXVnbWVudGVkSlF1ZXJ5O1xuICBlbXB0eT86ICgpID0+IHZvaWQ7XG4gIGFwcGVuZD86IChjb250ZW50OiBJQXVnbWVudGVkSlF1ZXJ5IHwgc3RyaW5nKSA9PiBJQXVnbWVudGVkSlF1ZXJ5O1xuICBjb250cm9sbGVyPzogKG5hbWU6IHN0cmluZykgPT4gYW55O1xuICBpc29sYXRlU2NvcGU/OiAoKSA9PiBJU2NvcGU7XG4gIGluamVjdG9yPzogKCkgPT4gSUluamVjdG9yU2VydmljZTtcbiAgdHJpZ2dlckhhbmRsZXI/OiAoZXZlbnRUeXBlT3JPYmplY3Q6IHN0cmluZyB8IEV2ZW50LCBleHRyYVBhcmFtZXRlcnM/OiBhbnlbXSkgPT4gSUF1Z21lbnRlZEpRdWVyeTtcbiAgcmVtb3ZlPzogKCkgPT4gdm9pZDtcbiAgcmVtb3ZlRGF0YT86ICgpID0+IHZvaWQ7XG59O1xuZXhwb3J0IGludGVyZmFjZSBJUHJvdmlkZXIgeyAkZ2V0OiBJSW5qZWN0YWJsZTsgfVxuZXhwb3J0IGludGVyZmFjZSBJUHJvdmlkZVNlcnZpY2Uge1xuICBwcm92aWRlcih0b2tlbjogTmcxVG9rZW4sIHByb3ZpZGVyOiBJUHJvdmlkZXIpOiBJUHJvdmlkZXI7XG4gIGZhY3RvcnkodG9rZW46IE5nMVRva2VuLCBmYWN0b3J5OiBJSW5qZWN0YWJsZSk6IElQcm92aWRlcjtcbiAgc2VydmljZSh0b2tlbjogTmcxVG9rZW4sIHR5cGU6IElJbmplY3RhYmxlKTogSVByb3ZpZGVyO1xuICB2YWx1ZSh0b2tlbjogTmcxVG9rZW4sIHZhbHVlOiBhbnkpOiBJUHJvdmlkZXI7XG4gIGNvbnN0YW50KHRva2VuOiBOZzFUb2tlbiwgdmFsdWU6IGFueSk6IHZvaWQ7XG4gIGRlY29yYXRvcih0b2tlbjogTmcxVG9rZW4sIGZhY3Rvcnk6IElJbmplY3RhYmxlKTogdm9pZDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVBhcnNlU2VydmljZSB7IChleHByZXNzaW9uOiBzdHJpbmcpOiBJQ29tcGlsZWRFeHByZXNzaW9uOyB9XG5leHBvcnQgaW50ZXJmYWNlIElDb21waWxlZEV4cHJlc3Npb24ge1xuICAoY29udGV4dDogYW55LCBsb2NhbHM6IGFueSk6IGFueTtcbiAgYXNzaWduPzogKGNvbnRleHQ6IGFueSwgdmFsdWU6IGFueSkgPT4gYW55O1xufVxuZXhwb3J0IGludGVyZmFjZSBJSHR0cEJhY2tlbmRTZXJ2aWNlIHtcbiAgKG1ldGhvZDogc3RyaW5nLCB1cmw6IHN0cmluZywgcG9zdD86IGFueSwgY2FsbGJhY2s/OiBGdW5jdGlvbiwgaGVhZGVycz86IGFueSwgdGltZW91dD86IG51bWJlcixcbiAgIHdpdGhDcmVkZW50aWFscz86IGJvb2xlYW4pOiB2b2lkO1xufVxuZXhwb3J0IGludGVyZmFjZSBJQ2FjaGVPYmplY3Qge1xuICBwdXQ8VD4oa2V5OiBzdHJpbmcsIHZhbHVlPzogVCk6IFQ7XG4gIGdldChrZXk6IHN0cmluZyk6IGFueTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVRlbXBsYXRlQ2FjaGVTZXJ2aWNlIGV4dGVuZHMgSUNhY2hlT2JqZWN0IHt9XG5leHBvcnQgaW50ZXJmYWNlIElUZW1wbGF0ZVJlcXVlc3RTZXJ2aWNlIHtcbiAgKHRlbXBsYXRlOiBzdHJpbmd8YW55IC8qIFRydXN0ZWRSZXNvdXJjZVVybCAqLywgaWdub3JlUmVxdWVzdEVycm9yPzogYm9vbGVhbik6IFByb21pc2U8c3RyaW5nPjtcbiAgdG90YWxQZW5kaW5nUmVxdWVzdHM6IG51bWJlcjtcbn1cbmV4cG9ydCB0eXBlIElDb250cm9sbGVyID0gc3RyaW5nIHwgSUluamVjdGFibGU7XG5leHBvcnQgaW50ZXJmYWNlIElDb250cm9sbGVyU2VydmljZSB7XG4gIChjb250cm9sbGVyQ29uc3RydWN0b3I6IElDb250cm9sbGVyLCBsb2NhbHM/OiBhbnksIGxhdGVyPzogYW55LCBpZGVudD86IGFueSk6IGFueTtcbiAgKGNvbnRyb2xsZXJOYW1lOiBzdHJpbmcsIGxvY2Fscz86IGFueSk6IGFueTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJSW5qZWN0b3JTZXJ2aWNlIHtcbiAgZ2V0KGtleTogc3RyaW5nKTogYW55O1xuICBoYXMoa2V5OiBzdHJpbmcpOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElJbnRlcnZhbFNlcnZpY2Uge1xuICAoZnVuYzogRnVuY3Rpb24sIGRlbGF5OiBudW1iZXIsIGNvdW50PzogbnVtYmVyLCBpbnZva2VBcHBseT86IGJvb2xlYW4sXG4gICAuLi5hcmdzOiBhbnlbXSk6IFByb21pc2U8YW55PjtcbiAgY2FuY2VsKHByb21pc2U6IFByb21pc2U8YW55Pik6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRlc3RhYmlsaXR5U2VydmljZSB7XG4gIGZpbmRCaW5kaW5ncyhlbGVtZW50OiBFbGVtZW50LCBleHByZXNzaW9uOiBzdHJpbmcsIG9wdF9leGFjdE1hdGNoPzogYm9vbGVhbik6IEVsZW1lbnRbXTtcbiAgZmluZE1vZGVscyhlbGVtZW50OiBFbGVtZW50LCBleHByZXNzaW9uOiBzdHJpbmcsIG9wdF9leGFjdE1hdGNoPzogYm9vbGVhbik6IEVsZW1lbnRbXTtcbiAgZ2V0TG9jYXRpb24oKTogc3RyaW5nO1xuICBzZXRMb2NhdGlvbih1cmw6IHN0cmluZyk6IHZvaWQ7XG4gIHdoZW5TdGFibGUoY2FsbGJhY2s6IEZ1bmN0aW9uKTogdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTmdNb2RlbENvbnRyb2xsZXIge1xuICAkcmVuZGVyKCk6IHZvaWQ7XG4gICRpc0VtcHR5KHZhbHVlOiBhbnkpOiBib29sZWFuO1xuICAkc2V0VmFsaWRpdHkodmFsaWRhdGlvbkVycm9yS2V5OiBzdHJpbmcsIGlzVmFsaWQ6IGJvb2xlYW4pOiB2b2lkO1xuICAkc2V0UHJpc3RpbmUoKTogdm9pZDtcbiAgJHNldERpcnR5KCk6IHZvaWQ7XG4gICRzZXRVbnRvdWNoZWQoKTogdm9pZDtcbiAgJHNldFRvdWNoZWQoKTogdm9pZDtcbiAgJHJvbGxiYWNrVmlld1ZhbHVlKCk6IHZvaWQ7XG4gICR2YWxpZGF0ZSgpOiB2b2lkO1xuICAkY29tbWl0Vmlld1ZhbHVlKCk6IHZvaWQ7XG4gICRzZXRWaWV3VmFsdWUodmFsdWU6IGFueSwgdHJpZ2dlcjogc3RyaW5nKTogdm9pZDtcblxuICAkdmlld1ZhbHVlOiBhbnk7XG4gICRtb2RlbFZhbHVlOiBhbnk7XG4gICRwYXJzZXJzOiBGdW5jdGlvbltdO1xuICAkZm9ybWF0dGVyczogRnVuY3Rpb25bXTtcbiAgJHZhbGlkYXRvcnM6IHtba2V5OiBzdHJpbmddOiBGdW5jdGlvbn07XG4gICRhc3luY1ZhbGlkYXRvcnM6IHtba2V5OiBzdHJpbmddOiBGdW5jdGlvbn07XG4gICR2aWV3Q2hhbmdlTGlzdGVuZXJzOiBGdW5jdGlvbltdO1xuICAkZXJyb3I6IE9iamVjdDtcbiAgJHBlbmRpbmc6IE9iamVjdDtcbiAgJHVudG91Y2hlZDogYm9vbGVhbjtcbiAgJHRvdWNoZWQ6IGJvb2xlYW47XG4gICRwcmlzdGluZTogYm9vbGVhbjtcbiAgJGRpcnR5OiBib29sZWFuO1xuICAkdmFsaWQ6IGJvb2xlYW47XG4gICRpbnZhbGlkOiBib29sZWFuO1xuICAkbmFtZTogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBub05nKCk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IEVycm9yKCdBbmd1bGFySlMgdjEueCBpcyBub3QgbG9hZGVkIScpO1xufVxuXG5jb25zdCBub05nRWxlbWVudDogdHlwZW9mIGFuZ3VsYXIuZWxlbWVudCA9ICgoKSA9PiBub05nKCkpIGFzIGFueTtcbm5vTmdFbGVtZW50LmNsZWFuRGF0YSA9IG5vTmc7XG5cbmxldCBhbmd1bGFyOiB7XG4gIGJvb3RzdHJhcDogKGU6IEVsZW1lbnQsIG1vZHVsZXM6IChzdHJpbmcgfCBJSW5qZWN0YWJsZSlbXSwgY29uZmlnPzogSUFuZ3VsYXJCb290c3RyYXBDb25maWcpID0+XG4gICAgICAgICAgICAgICAgIElJbmplY3RvclNlcnZpY2UsXG4gIG1vZHVsZTogKHByZWZpeDogc3RyaW5nLCBkZXBlbmRlbmNpZXM/OiBzdHJpbmdbXSkgPT4gSU1vZHVsZSxcbiAgZWxlbWVudDoge1xuICAgIChlOiBzdHJpbmcgfCBFbGVtZW50IHwgRG9jdW1lbnQgfCBJQXVnbWVudGVkSlF1ZXJ5KTogSUF1Z21lbnRlZEpRdWVyeTtcbiAgICBjbGVhbkRhdGE6IChub2RlczogTm9kZVtdIHwgTm9kZUxpc3QpID0+IHZvaWQ7XG4gIH0sXG4gIHZlcnNpb246IHttYWpvcjogbnVtYmVyfSxcbiAgcmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkLFxuICBnZXRUZXN0YWJpbGl0eTogKGU6IEVsZW1lbnQpID0+IElUZXN0YWJpbGl0eVNlcnZpY2Vcbn0gPSB7XG4gIGJvb3RzdHJhcDogbm9OZyxcbiAgbW9kdWxlOiBub05nLFxuICBlbGVtZW50OiBub05nRWxlbWVudCxcbiAgdmVyc2lvbjogdW5kZWZpbmVkIGFzIGFueSxcbiAgcmVzdW1lQm9vdHN0cmFwOiBub05nLFxuICBnZXRUZXN0YWJpbGl0eTogbm9OZ1xufTtcblxudHJ5IHtcbiAgaWYgKHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSgnYW5ndWxhcicpKSB7XG4gICAgYW5ndWxhciA9ICg8YW55PndpbmRvdykuYW5ndWxhcjtcbiAgfVxufSBjYXRjaCAoZSkge1xuICAvLyBpZ25vcmUgaW4gQ0pTIG1vZGUuXG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgVXNlIGBzZXRBbmd1bGFySlNHbG9iYWxgIGluc3RlYWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QW5ndWxhckxpYihuZzogYW55KTogdm9pZCB7XG4gIHNldEFuZ3VsYXJKU0dsb2JhbChuZyk7XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgVXNlIGBnZXRBbmd1bGFySlNHbG9iYWxgIGluc3RlYWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5ndWxhckxpYigpOiBhbnkge1xuICByZXR1cm4gZ2V0QW5ndWxhckpTR2xvYmFsKCk7XG59XG5cbi8qKlxuICogUmVzZXRzIHRoZSBBbmd1bGFySlMgZ2xvYmFsLlxuICpcbiAqIFVzZWQgd2hlbiBBbmd1bGFySlMgaXMgbG9hZGVkIGxhemlseSwgYW5kIG5vdCBhdmFpbGFibGUgb24gYHdpbmRvd2AuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QW5ndWxhckpTR2xvYmFsKG5nOiBhbnkpOiB2b2lkIHtcbiAgYW5ndWxhciA9IG5nO1xuICB2ZXJzaW9uID0gbmcgJiYgbmcudmVyc2lvbjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50IEFuZ3VsYXJKUyBnbG9iYWwuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5ndWxhckpTR2xvYmFsKCk6IGFueSB7XG4gIHJldHVybiBhbmd1bGFyO1xufVxuXG5leHBvcnQgY29uc3QgYm9vdHN0cmFwOiB0eXBlb2YgYW5ndWxhci5ib290c3RyYXAgPSAoZSwgbW9kdWxlcywgY29uZmlnPykgPT5cbiAgICBhbmd1bGFyLmJvb3RzdHJhcChlLCBtb2R1bGVzLCBjb25maWcpO1xuXG5leHBvcnQgY29uc3QgbW9kdWxlOiB0eXBlb2YgYW5ndWxhci5tb2R1bGUgPSAocHJlZml4LCBkZXBlbmRlbmNpZXM/KSA9PlxuICAgIGFuZ3VsYXIubW9kdWxlKHByZWZpeCwgZGVwZW5kZW5jaWVzKTtcblxuZXhwb3J0IGNvbnN0IGVsZW1lbnQ6IHR5cGVvZiBhbmd1bGFyLmVsZW1lbnQgPSAoZSA9PiBhbmd1bGFyLmVsZW1lbnQoZSkpIGFzIHR5cGVvZiBhbmd1bGFyLmVsZW1lbnQ7XG5lbGVtZW50LmNsZWFuRGF0YSA9IG5vZGVzID0+IGFuZ3VsYXIuZWxlbWVudC5jbGVhbkRhdGEobm9kZXMpO1xuXG5leHBvcnQgY29uc3QgcmVzdW1lQm9vdHN0cmFwOiB0eXBlb2YgYW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSAoKSA9PiBhbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCgpO1xuXG5leHBvcnQgY29uc3QgZ2V0VGVzdGFiaWxpdHk6IHR5cGVvZiBhbmd1bGFyLmdldFRlc3RhYmlsaXR5ID0gZSA9PiBhbmd1bGFyLmdldFRlc3RhYmlsaXR5KGUpO1xuXG5leHBvcnQgbGV0IHZlcnNpb24gPSBhbmd1bGFyLnZlcnNpb247XG4iXX0=