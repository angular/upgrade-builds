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
/** @typedef {?} */
var Ng1Token;
export { Ng1Token };
/** @typedef {?} */
var Ng1Expression;
export { Ng1Expression };
/**
 * @record
 */
export function IAnnotatedFunction() { }
/** @type {?|undefined} */
IAnnotatedFunction.prototype.$inject;
/** @typedef {?} */
var IInjectable;
export { IInjectable };
/** @typedef {?} */
var SingleOrListOrMap;
export { SingleOrListOrMap };
/**
 * @record
 */
export function IModule() { }
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
/**
 * @record
 */
export function ICompileService() { }
/**
 * @record
 */
export function ILinkFn() { }
/* TODO: handle strange member:
(scope: IScope, cloneAttachFn?: ICloneAttachFunction, options?: ILinkFnOptions): IAugmentedJQuery;
*/
/** @type {?|undefined} */
ILinkFn.prototype.$$slots;
/**
 * @record
 */
export function ILinkFnOptions() { }
/** @type {?|undefined} */
ILinkFnOptions.prototype.parentBoundTranscludeFn;
/** @type {?|undefined} */
ILinkFnOptions.prototype.transcludeControllers;
/** @type {?|undefined} */
ILinkFnOptions.prototype.futureParentElement;
/**
 * @record
 */
export function IRootScopeService() { }
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
/**
 * @record
 */
export function IScope() { }
/**
 * @record
 */
export function IAngularBootstrapConfig() { }
/** @type {?|undefined} */
IAngularBootstrapConfig.prototype.strictDi;
/**
 * @record
 */
export function IDirective() { }
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
/** @typedef {?} */
var DirectiveRequireProperty;
export { DirectiveRequireProperty };
/** @typedef {?} */
var DirectiveTranscludeProperty;
export { DirectiveTranscludeProperty };
/**
 * @record
 */
export function IDirectiveCompileFn() { }
/**
 * @record
 */
export function IDirectivePrePost() { }
/** @type {?|undefined} */
IDirectivePrePost.prototype.pre;
/** @type {?|undefined} */
IDirectivePrePost.prototype.post;
/**
 * @record
 */
export function IDirectiveLinkFn() { }
/**
 * @record
 */
export function IComponent() { }
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
/**
 * @record
 */
export function IAttributes() { }
/** @type {?} */
IAttributes.prototype.$observe;
/**
 * @record
 */
export function ITranscludeFunction() { }
/**
 * @record
 */
export function ICloneAttachFunction() { }
/** @typedef {?} */
var IAugmentedJQuery;
export { IAugmentedJQuery };
/**
 * @record
 */
export function IProvider() { }
/** @type {?} */
IProvider.prototype.$get;
/**
 * @record
 */
export function IProvideService() { }
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
/**
 * @record
 */
export function IParseService() { }
/**
 * @record
 */
export function ICompiledExpression() { }
/* TODO: handle strange member:
(context: any, locals: any): any;
*/
/** @type {?|undefined} */
ICompiledExpression.prototype.assign;
/**
 * @record
 */
export function IHttpBackendService() { }
/**
 * @record
 */
export function ICacheObject() { }
/** @type {?} */
ICacheObject.prototype.put;
/** @type {?} */
ICacheObject.prototype.get;
/**
 * @record
 */
export function ITemplateCacheService() { }
/**
 * @record
 */
export function ITemplateRequestService() { }
/* TODO: handle strange member:
(template: string|any __ TrustedResourceUrl __, ignoreRequestError?: boolean): Promise<string>;
*/
/** @type {?} */
ITemplateRequestService.prototype.totalPendingRequests;
/** @typedef {?} */
var IController;
export { IController };
/**
 * @record
 */
export function IControllerService() { }
/**
 * @record
 */
export function IInjectorService() { }
/** @type {?} */
IInjectorService.prototype.get;
/** @type {?} */
IInjectorService.prototype.has;
/**
 * @record
 */
export function IIntervalService() { }
/* TODO: handle strange member:
(func: Function, delay: number, count?: number, invokeApply?: boolean,
   ...args: any[]): Promise<any>;
*/
/** @type {?} */
IIntervalService.prototype.cancel;
/**
 * @record
 */
export function ITestabilityService() { }
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
/**
 * @record
 */
export function INgModelController() { }
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
/**
 * @return {?}
 */
function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
/** @type {?} */
const noNgElement = /** @type {?} */ ((() => noNg()));
noNgElement.cleanData = noNg;
/** @type {?} */
let angular = {
    bootstrap: noNg,
    module: noNg,
    element: noNgElement,
    version: /** @type {?} */ (undefined),
    resumeBootstrap: noNg,
    getTestability: noNg
};
try {
    if (window.hasOwnProperty('angular')) {
        angular = (/** @type {?} */ (window)).angular;
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
export const element = /** @type {?} */ ((e => angular.element(e)));
element.cleanData = nodes => angular.element.cleanData(nodes);
/** @type {?} */
export const resumeBootstrap = () => angular.resumeBootstrap();
/** @type {?} */
export const getTestability = e => angular.getTestability(e);
/** @type {?} */
export let version = angular.version;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vYW5ndWxhcjEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUE2TkEsU0FBUyxJQUFJO0lBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0NBQ2xEOztBQUVELE1BQU0sV0FBVyxxQkFBMkIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBUSxFQUFDO0FBQ2xFLFdBQVcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDOztBQUU3QixJQUFJLE9BQU8sR0FXUDtJQUNGLFNBQVMsRUFBRSxJQUFJO0lBQ2YsTUFBTSxFQUFFLElBQUk7SUFDWixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLG9CQUFFLFNBQWdCLENBQUE7SUFDekIsZUFBZSxFQUFFLElBQUk7SUFDckIsY0FBYyxFQUFFLElBQUk7Q0FDckIsQ0FBQztBQUVGLElBQUk7SUFDRixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDcEMsT0FBTyxHQUFHLG1CQUFNLE1BQU0sRUFBQyxDQUFDLE9BQU8sQ0FBQztLQUNqQztDQUNGO0FBQUMsT0FBTyxDQUFDLEVBQUU7O0NBRVg7Ozs7Ozs7O0FBT0QsTUFBTSxVQUFVLGFBQWEsQ0FBQyxFQUFPO0lBQ25DLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3hCOzs7Ozs7O0FBT0QsTUFBTSxVQUFVLGFBQWE7SUFDM0IsT0FBTyxrQkFBa0IsRUFBRSxDQUFDO0NBQzdCOzs7Ozs7Ozs7O0FBU0QsTUFBTSxVQUFVLGtCQUFrQixDQUFDLEVBQU87SUFDeEMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNiLE9BQU8sR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQztDQUM1Qjs7Ozs7OztBQU9ELE1BQU0sVUFBVSxrQkFBa0I7SUFDaEMsT0FBTyxPQUFPLENBQUM7Q0FDaEI7O0FBRUQsYUFBYSxTQUFTLEdBQTZCLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFPLEVBQUUsRUFBRSxDQUN2RSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRTFDLGFBQWEsTUFBTSxHQUEwQixDQUFDLE1BQU0sRUFBRSxZQUFhLEVBQUUsRUFBRSxDQUNuRSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQzs7QUFFekMsYUFBYSxPQUFPLHFCQUEyQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBMkIsRUFBQztBQUNuRyxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTlELGFBQWEsZUFBZSxHQUFtQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7O0FBRS9GLGFBQWEsY0FBYyxHQUFrQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTVGLFdBQVcsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmV4cG9ydCB0eXBlIE5nMVRva2VuID0gc3RyaW5nO1xuXG5leHBvcnQgdHlwZSBOZzFFeHByZXNzaW9uID0gc3RyaW5nIHwgRnVuY3Rpb247XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUFubm90YXRlZEZ1bmN0aW9uIGV4dGVuZHMgRnVuY3Rpb24ge1xuICAvLyBPbGRlciB2ZXJzaW9ucyBvZiBgQHR5cGVzL2FuZ3VsYXJgIHR5cGluZ3MgZXh0ZW5kIHRoZSBnbG9iYWwgYEZ1bmN0aW9uYCBpbnRlcmZhY2Ugd2l0aFxuICAvLyBgJGluamVjdD86IHN0cmluZ1tdYCwgd2hpY2ggaXMgbm90IGNvbXBhdGlibGUgd2l0aCBgJGluamVjdD86IFJlYWRvbmx5QXJyYXk8c3RyaW5nPmAgKHVzZWQgaW5cbiAgLy8gbGF0ZXN0IHZlcnNpb25zKS5cbiAgJGluamVjdD86IEZ1bmN0aW9uIGV4dGVuZHN7JGluamVjdD86IHN0cmluZ1tdfT8gTmcxVG9rZW5bXTogUmVhZG9ubHlBcnJheTxOZzFUb2tlbj47XG59XG5cbmV4cG9ydCB0eXBlIElJbmplY3RhYmxlID0gKE5nMVRva2VuIHwgRnVuY3Rpb24pW10gfCBJQW5ub3RhdGVkRnVuY3Rpb247XG5cbmV4cG9ydCB0eXBlIFNpbmdsZU9yTGlzdE9yTWFwPFQ+ID0gVCB8IFRbXSB8IHtba2V5OiBzdHJpbmddOiBUfTtcblxuZXhwb3J0IGludGVyZmFjZSBJTW9kdWxlIHtcbiAgbmFtZTogc3RyaW5nO1xuICByZXF1aXJlczogKHN0cmluZ3xJSW5qZWN0YWJsZSlbXTtcbiAgY29uZmlnKGZuOiBJSW5qZWN0YWJsZSk6IElNb2R1bGU7XG4gIGRpcmVjdGl2ZShzZWxlY3Rvcjogc3RyaW5nLCBmYWN0b3J5OiBJSW5qZWN0YWJsZSk6IElNb2R1bGU7XG4gIGNvbXBvbmVudChzZWxlY3Rvcjogc3RyaW5nLCBjb21wb25lbnQ6IElDb21wb25lbnQpOiBJTW9kdWxlO1xuICBjb250cm9sbGVyKG5hbWU6IHN0cmluZywgdHlwZTogSUluamVjdGFibGUpOiBJTW9kdWxlO1xuICBmYWN0b3J5KGtleTogTmcxVG9rZW4sIGZhY3RvcnlGbjogSUluamVjdGFibGUpOiBJTW9kdWxlO1xuICB2YWx1ZShrZXk6IE5nMVRva2VuLCB2YWx1ZTogYW55KTogSU1vZHVsZTtcbiAgY29uc3RhbnQodG9rZW46IE5nMVRva2VuLCB2YWx1ZTogYW55KTogSU1vZHVsZTtcbiAgcnVuKGE6IElJbmplY3RhYmxlKTogSU1vZHVsZTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbXBpbGVTZXJ2aWNlIHtcbiAgKGVsZW1lbnQ6IEVsZW1lbnR8Tm9kZUxpc3R8Tm9kZVtdfHN0cmluZywgdHJhbnNjbHVkZT86IEZ1bmN0aW9uKTogSUxpbmtGbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUxpbmtGbiB7XG4gIChzY29wZTogSVNjb3BlLCBjbG9uZUF0dGFjaEZuPzogSUNsb25lQXR0YWNoRnVuY3Rpb24sIG9wdGlvbnM/OiBJTGlua0ZuT3B0aW9ucyk6IElBdWdtZW50ZWRKUXVlcnk7XG4gICQkc2xvdHM/OiB7W3Nsb3ROYW1lOiBzdHJpbmddOiBJTGlua0ZufTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUxpbmtGbk9wdGlvbnMge1xuICBwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbj86IEZ1bmN0aW9uO1xuICB0cmFuc2NsdWRlQ29udHJvbGxlcnM/OiB7W2tleTogc3RyaW5nXTogYW55fTtcbiAgZnV0dXJlUGFyZW50RWxlbWVudD86IE5vZGU7XG59XG5leHBvcnQgaW50ZXJmYWNlIElSb290U2NvcGVTZXJ2aWNlIHtcbiAgJG5ldyhpc29sYXRlPzogYm9vbGVhbik6IElTY29wZTtcbiAgJGlkOiBzdHJpbmc7XG4gICRwYXJlbnQ6IElTY29wZTtcbiAgJHJvb3Q6IElTY29wZTtcbiAgJHdhdGNoKGV4cDogTmcxRXhwcmVzc2lvbiwgZm4/OiAoYTE/OiBhbnksIGEyPzogYW55KSA9PiB2b2lkKTogRnVuY3Rpb247XG4gICRvbihldmVudDogc3RyaW5nLCBmbj86IChldmVudD86IGFueSwgLi4uYXJnczogYW55W10pID0+IHZvaWQpOiBGdW5jdGlvbjtcbiAgJGRlc3Ryb3koKTogYW55O1xuICAkYXBwbHkoZXhwPzogTmcxRXhwcmVzc2lvbik6IGFueTtcbiAgJGRpZ2VzdCgpOiBhbnk7XG4gICRldmFsQXN5bmMoZXhwOiBOZzFFeHByZXNzaW9uLCBsb2NhbHM/OiBhbnkpOiB2b2lkO1xuICAkb24oZXZlbnQ6IHN0cmluZywgZm4/OiAoZXZlbnQ/OiBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTogRnVuY3Rpb247XG4gICQkY2hpbGRUYWlsOiBJU2NvcGU7XG4gICQkY2hpbGRIZWFkOiBJU2NvcGU7XG4gICQkbmV4dFNpYmxpbmc6IElTY29wZTtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuZXhwb3J0IGludGVyZmFjZSBJU2NvcGUgZXh0ZW5kcyBJUm9vdFNjb3BlU2VydmljZSB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIElBbmd1bGFyQm9vdHN0cmFwQ29uZmlnIHsgc3RyaWN0RGk/OiBib29sZWFuOyB9XG5leHBvcnQgaW50ZXJmYWNlIElEaXJlY3RpdmUge1xuICBjb21waWxlPzogSURpcmVjdGl2ZUNvbXBpbGVGbjtcbiAgY29udHJvbGxlcj86IElDb250cm9sbGVyO1xuICBjb250cm9sbGVyQXM/OiBzdHJpbmc7XG4gIGJpbmRUb0NvbnRyb2xsZXI/OiBib29sZWFufHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICBsaW5rPzogSURpcmVjdGl2ZUxpbmtGbnxJRGlyZWN0aXZlUHJlUG9zdDtcbiAgbmFtZT86IHN0cmluZztcbiAgcHJpb3JpdHk/OiBudW1iZXI7XG4gIHJlcGxhY2U/OiBib29sZWFuO1xuICByZXF1aXJlPzogRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5O1xuICByZXN0cmljdD86IHN0cmluZztcbiAgc2NvcGU/OiBib29sZWFufHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuICB0ZW1wbGF0ZT86IHN0cmluZ3xGdW5jdGlvbjtcbiAgdGVtcGxhdGVVcmw/OiBzdHJpbmd8RnVuY3Rpb247XG4gIHRlbXBsYXRlTmFtZXNwYWNlPzogc3RyaW5nO1xuICB0ZXJtaW5hbD86IGJvb2xlYW47XG4gIHRyYW5zY2x1ZGU/OiBEaXJlY3RpdmVUcmFuc2NsdWRlUHJvcGVydHk7XG59XG5leHBvcnQgdHlwZSBEaXJlY3RpdmVSZXF1aXJlUHJvcGVydHkgPSBTaW5nbGVPckxpc3RPck1hcDxzdHJpbmc+O1xuZXhwb3J0IHR5cGUgRGlyZWN0aXZlVHJhbnNjbHVkZVByb3BlcnR5ID0gYm9vbGVhbiB8ICdlbGVtZW50JyB8IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuZXhwb3J0IGludGVyZmFjZSBJRGlyZWN0aXZlQ29tcGlsZUZuIHtcbiAgKHRlbXBsYXRlRWxlbWVudDogSUF1Z21lbnRlZEpRdWVyeSwgdGVtcGxhdGVBdHRyaWJ1dGVzOiBJQXR0cmlidXRlcyxcbiAgIHRyYW5zY2x1ZGU6IElUcmFuc2NsdWRlRnVuY3Rpb24pOiBJRGlyZWN0aXZlUHJlUG9zdDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSURpcmVjdGl2ZVByZVBvc3Qge1xuICBwcmU/OiBJRGlyZWN0aXZlTGlua0ZuO1xuICBwb3N0PzogSURpcmVjdGl2ZUxpbmtGbjtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSURpcmVjdGl2ZUxpbmtGbiB7XG4gIChzY29wZTogSVNjb3BlLCBpbnN0YW5jZUVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnksIGluc3RhbmNlQXR0cmlidXRlczogSUF0dHJpYnV0ZXMsXG4gICBjb250cm9sbGVyOiBhbnksIHRyYW5zY2x1ZGU6IElUcmFuc2NsdWRlRnVuY3Rpb24pOiB2b2lkO1xufVxuZXhwb3J0IGludGVyZmFjZSBJQ29tcG9uZW50IHtcbiAgYmluZGluZ3M/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgY29udHJvbGxlcj86IHN0cmluZ3xJSW5qZWN0YWJsZTtcbiAgY29udHJvbGxlckFzPzogc3RyaW5nO1xuICByZXF1aXJlPzogRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5O1xuICB0ZW1wbGF0ZT86IHN0cmluZ3xGdW5jdGlvbjtcbiAgdGVtcGxhdGVVcmw/OiBzdHJpbmd8RnVuY3Rpb247XG4gIHRyYW5zY2x1ZGU/OiBEaXJlY3RpdmVUcmFuc2NsdWRlUHJvcGVydHk7XG59XG5leHBvcnQgaW50ZXJmYWNlIElBdHRyaWJ1dGVzIHtcbiAgJG9ic2VydmUoYXR0cjogc3RyaW5nLCBmbjogKHY6IHN0cmluZykgPT4gdm9pZCk6IHZvaWQ7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVRyYW5zY2x1ZGVGdW5jdGlvbiB7XG4gIC8vIElmIHRoZSBzY29wZSBpcyBwcm92aWRlZCwgdGhlbiB0aGUgY2xvbmVBdHRhY2hGbiBtdXN0IGJlIGFzIHdlbGwuXG4gIChzY29wZTogSVNjb3BlLCBjbG9uZUF0dGFjaEZuOiBJQ2xvbmVBdHRhY2hGdW5jdGlvbik6IElBdWdtZW50ZWRKUXVlcnk7XG4gIC8vIElmIG9uZSBhcmd1bWVudCBpcyBwcm92aWRlZCwgdGhlbiBpdCdzIGFzc3VtZWQgdG8gYmUgdGhlIGNsb25lQXR0YWNoRm4uXG4gIChjbG9uZUF0dGFjaEZuPzogSUNsb25lQXR0YWNoRnVuY3Rpb24pOiBJQXVnbWVudGVkSlF1ZXJ5O1xufVxuZXhwb3J0IGludGVyZmFjZSBJQ2xvbmVBdHRhY2hGdW5jdGlvbiB7XG4gIC8vIExldCdzIGhpbnQgYnV0IG5vdCBmb3JjZSBjbG9uZUF0dGFjaEZuJ3Mgc2lnbmF0dXJlXG4gIChjbG9uZWRFbGVtZW50PzogSUF1Z21lbnRlZEpRdWVyeSwgc2NvcGU/OiBJU2NvcGUpOiBhbnk7XG59XG5leHBvcnQgdHlwZSBJQXVnbWVudGVkSlF1ZXJ5ID0gTm9kZVtdICYge1xuICBvbj86IChuYW1lOiBzdHJpbmcsIGZuOiAoKSA9PiB2b2lkKSA9PiB2b2lkO1xuICBkYXRhPzogKG5hbWU6IHN0cmluZywgdmFsdWU/OiBhbnkpID0+IGFueTtcbiAgdGV4dD86ICgpID0+IHN0cmluZztcbiAgaW5oZXJpdGVkRGF0YT86IChuYW1lOiBzdHJpbmcsIHZhbHVlPzogYW55KSA9PiBhbnk7XG4gIGNvbnRlbnRzPzogKCkgPT4gSUF1Z21lbnRlZEpRdWVyeTtcbiAgcGFyZW50PzogKCkgPT4gSUF1Z21lbnRlZEpRdWVyeTtcbiAgZW1wdHk/OiAoKSA9PiB2b2lkO1xuICBhcHBlbmQ/OiAoY29udGVudDogSUF1Z21lbnRlZEpRdWVyeSB8IHN0cmluZykgPT4gSUF1Z21lbnRlZEpRdWVyeTtcbiAgY29udHJvbGxlcj86IChuYW1lOiBzdHJpbmcpID0+IGFueTtcbiAgaXNvbGF0ZVNjb3BlPzogKCkgPT4gSVNjb3BlO1xuICBpbmplY3Rvcj86ICgpID0+IElJbmplY3RvclNlcnZpY2U7XG4gIHRyaWdnZXJIYW5kbGVyPzogKGV2ZW50VHlwZU9yT2JqZWN0OiBzdHJpbmcgfCBFdmVudCwgZXh0cmFQYXJhbWV0ZXJzPzogYW55W10pID0+IElBdWdtZW50ZWRKUXVlcnk7XG4gIHJlbW92ZT86ICgpID0+IHZvaWQ7XG4gIHJlbW92ZURhdGE/OiAoKSA9PiB2b2lkO1xufTtcbmV4cG9ydCBpbnRlcmZhY2UgSVByb3ZpZGVyIHsgJGdldDogSUluamVjdGFibGU7IH1cbmV4cG9ydCBpbnRlcmZhY2UgSVByb3ZpZGVTZXJ2aWNlIHtcbiAgcHJvdmlkZXIodG9rZW46IE5nMVRva2VuLCBwcm92aWRlcjogSVByb3ZpZGVyKTogSVByb3ZpZGVyO1xuICBmYWN0b3J5KHRva2VuOiBOZzFUb2tlbiwgZmFjdG9yeTogSUluamVjdGFibGUpOiBJUHJvdmlkZXI7XG4gIHNlcnZpY2UodG9rZW46IE5nMVRva2VuLCB0eXBlOiBJSW5qZWN0YWJsZSk6IElQcm92aWRlcjtcbiAgdmFsdWUodG9rZW46IE5nMVRva2VuLCB2YWx1ZTogYW55KTogSVByb3ZpZGVyO1xuICBjb25zdGFudCh0b2tlbjogTmcxVG9rZW4sIHZhbHVlOiBhbnkpOiB2b2lkO1xuICBkZWNvcmF0b3IodG9rZW46IE5nMVRva2VuLCBmYWN0b3J5OiBJSW5qZWN0YWJsZSk6IHZvaWQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIElQYXJzZVNlcnZpY2UgeyAoZXhwcmVzc2lvbjogc3RyaW5nKTogSUNvbXBpbGVkRXhwcmVzc2lvbjsgfVxuZXhwb3J0IGludGVyZmFjZSBJQ29tcGlsZWRFeHByZXNzaW9uIHtcbiAgKGNvbnRleHQ6IGFueSwgbG9jYWxzOiBhbnkpOiBhbnk7XG4gIGFzc2lnbj86IChjb250ZXh0OiBhbnksIHZhbHVlOiBhbnkpID0+IGFueTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUh0dHBCYWNrZW5kU2VydmljZSB7XG4gIChtZXRob2Q6IHN0cmluZywgdXJsOiBzdHJpbmcsIHBvc3Q/OiBhbnksIGNhbGxiYWNrPzogRnVuY3Rpb24sIGhlYWRlcnM/OiBhbnksIHRpbWVvdXQ/OiBudW1iZXIsXG4gICB3aXRoQ3JlZGVudGlhbHM/OiBib29sZWFuKTogdm9pZDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUNhY2hlT2JqZWN0IHtcbiAgcHV0PFQ+KGtleTogc3RyaW5nLCB2YWx1ZT86IFQpOiBUO1xuICBnZXQoa2V5OiBzdHJpbmcpOiBhbnk7XG59XG5leHBvcnQgaW50ZXJmYWNlIElUZW1wbGF0ZUNhY2hlU2VydmljZSBleHRlbmRzIElDYWNoZU9iamVjdCB7fVxuZXhwb3J0IGludGVyZmFjZSBJVGVtcGxhdGVSZXF1ZXN0U2VydmljZSB7XG4gICh0ZW1wbGF0ZTogc3RyaW5nfGFueSAvKiBUcnVzdGVkUmVzb3VyY2VVcmwgKi8sIGlnbm9yZVJlcXVlc3RFcnJvcj86IGJvb2xlYW4pOiBQcm9taXNlPHN0cmluZz47XG4gIHRvdGFsUGVuZGluZ1JlcXVlc3RzOiBudW1iZXI7XG59XG5leHBvcnQgdHlwZSBJQ29udHJvbGxlciA9IHN0cmluZyB8IElJbmplY3RhYmxlO1xuZXhwb3J0IGludGVyZmFjZSBJQ29udHJvbGxlclNlcnZpY2Uge1xuICAoY29udHJvbGxlckNvbnN0cnVjdG9yOiBJQ29udHJvbGxlciwgbG9jYWxzPzogYW55LCBsYXRlcj86IGFueSwgaWRlbnQ/OiBhbnkpOiBhbnk7XG4gIChjb250cm9sbGVyTmFtZTogc3RyaW5nLCBsb2NhbHM/OiBhbnkpOiBhbnk7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUluamVjdG9yU2VydmljZSB7XG4gIGdldChrZXk6IHN0cmluZyk6IGFueTtcbiAgaGFzKGtleTogc3RyaW5nKTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJSW50ZXJ2YWxTZXJ2aWNlIHtcbiAgKGZ1bmM6IEZ1bmN0aW9uLCBkZWxheTogbnVtYmVyLCBjb3VudD86IG51bWJlciwgaW52b2tlQXBwbHk/OiBib29sZWFuLFxuICAgLi4uYXJnczogYW55W10pOiBQcm9taXNlPGFueT47XG4gIGNhbmNlbChwcm9taXNlOiBQcm9taXNlPGFueT4pOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElUZXN0YWJpbGl0eVNlcnZpY2Uge1xuICBmaW5kQmluZGluZ3MoZWxlbWVudDogRWxlbWVudCwgZXhwcmVzc2lvbjogc3RyaW5nLCBvcHRfZXhhY3RNYXRjaD86IGJvb2xlYW4pOiBFbGVtZW50W107XG4gIGZpbmRNb2RlbHMoZWxlbWVudDogRWxlbWVudCwgZXhwcmVzc2lvbjogc3RyaW5nLCBvcHRfZXhhY3RNYXRjaD86IGJvb2xlYW4pOiBFbGVtZW50W107XG4gIGdldExvY2F0aW9uKCk6IHN0cmluZztcbiAgc2V0TG9jYXRpb24odXJsOiBzdHJpbmcpOiB2b2lkO1xuICB3aGVuU3RhYmxlKGNhbGxiYWNrOiBGdW5jdGlvbik6IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5nTW9kZWxDb250cm9sbGVyIHtcbiAgJHJlbmRlcigpOiB2b2lkO1xuICAkaXNFbXB0eSh2YWx1ZTogYW55KTogYm9vbGVhbjtcbiAgJHNldFZhbGlkaXR5KHZhbGlkYXRpb25FcnJvcktleTogc3RyaW5nLCBpc1ZhbGlkOiBib29sZWFuKTogdm9pZDtcbiAgJHNldFByaXN0aW5lKCk6IHZvaWQ7XG4gICRzZXREaXJ0eSgpOiB2b2lkO1xuICAkc2V0VW50b3VjaGVkKCk6IHZvaWQ7XG4gICRzZXRUb3VjaGVkKCk6IHZvaWQ7XG4gICRyb2xsYmFja1ZpZXdWYWx1ZSgpOiB2b2lkO1xuICAkdmFsaWRhdGUoKTogdm9pZDtcbiAgJGNvbW1pdFZpZXdWYWx1ZSgpOiB2b2lkO1xuICAkc2V0Vmlld1ZhbHVlKHZhbHVlOiBhbnksIHRyaWdnZXI6IHN0cmluZyk6IHZvaWQ7XG5cbiAgJHZpZXdWYWx1ZTogYW55O1xuICAkbW9kZWxWYWx1ZTogYW55O1xuICAkcGFyc2VyczogRnVuY3Rpb25bXTtcbiAgJGZvcm1hdHRlcnM6IEZ1bmN0aW9uW107XG4gICR2YWxpZGF0b3JzOiB7W2tleTogc3RyaW5nXTogRnVuY3Rpb259O1xuICAkYXN5bmNWYWxpZGF0b3JzOiB7W2tleTogc3RyaW5nXTogRnVuY3Rpb259O1xuICAkdmlld0NoYW5nZUxpc3RlbmVyczogRnVuY3Rpb25bXTtcbiAgJGVycm9yOiBPYmplY3Q7XG4gICRwZW5kaW5nOiBPYmplY3Q7XG4gICR1bnRvdWNoZWQ6IGJvb2xlYW47XG4gICR0b3VjaGVkOiBib29sZWFuO1xuICAkcHJpc3RpbmU6IGJvb2xlYW47XG4gICRkaXJ0eTogYm9vbGVhbjtcbiAgJHZhbGlkOiBib29sZWFuO1xuICAkaW52YWxpZDogYm9vbGVhbjtcbiAgJG5hbWU6IHN0cmluZztcbn1cblxuZnVuY3Rpb24gbm9OZygpOiBuZXZlciB7XG4gIHRocm93IG5ldyBFcnJvcignQW5ndWxhckpTIHYxLnggaXMgbm90IGxvYWRlZCEnKTtcbn1cblxuY29uc3Qgbm9OZ0VsZW1lbnQ6IHR5cGVvZiBhbmd1bGFyLmVsZW1lbnQgPSAoKCkgPT4gbm9OZygpKSBhcyBhbnk7XG5ub05nRWxlbWVudC5jbGVhbkRhdGEgPSBub05nO1xuXG5sZXQgYW5ndWxhcjoge1xuICBib290c3RyYXA6IChlOiBFbGVtZW50LCBtb2R1bGVzOiAoc3RyaW5nIHwgSUluamVjdGFibGUpW10sIGNvbmZpZz86IElBbmd1bGFyQm9vdHN0cmFwQ29uZmlnKSA9PlxuICAgICAgICAgICAgICAgICBJSW5qZWN0b3JTZXJ2aWNlLFxuICBtb2R1bGU6IChwcmVmaXg6IHN0cmluZywgZGVwZW5kZW5jaWVzPzogc3RyaW5nW10pID0+IElNb2R1bGUsXG4gIGVsZW1lbnQ6IHtcbiAgICAoZTogc3RyaW5nIHwgRWxlbWVudCB8IERvY3VtZW50IHwgSUF1Z21lbnRlZEpRdWVyeSk6IElBdWdtZW50ZWRKUXVlcnk7XG4gICAgY2xlYW5EYXRhOiAobm9kZXM6IE5vZGVbXSB8IE5vZGVMaXN0KSA9PiB2b2lkO1xuICB9LFxuICB2ZXJzaW9uOiB7bWFqb3I6IG51bWJlcn0sXG4gIHJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCxcbiAgZ2V0VGVzdGFiaWxpdHk6IChlOiBFbGVtZW50KSA9PiBJVGVzdGFiaWxpdHlTZXJ2aWNlXG59ID0ge1xuICBib290c3RyYXA6IG5vTmcsXG4gIG1vZHVsZTogbm9OZyxcbiAgZWxlbWVudDogbm9OZ0VsZW1lbnQsXG4gIHZlcnNpb246IHVuZGVmaW5lZCBhcyBhbnksXG4gIHJlc3VtZUJvb3RzdHJhcDogbm9OZyxcbiAgZ2V0VGVzdGFiaWxpdHk6IG5vTmdcbn07XG5cbnRyeSB7XG4gIGlmICh3aW5kb3cuaGFzT3duUHJvcGVydHkoJ2FuZ3VsYXInKSkge1xuICAgIGFuZ3VsYXIgPSAoPGFueT53aW5kb3cpLmFuZ3VsYXI7XG4gIH1cbn0gY2F0Y2ggKGUpIHtcbiAgLy8gaWdub3JlIGluIENKUyBtb2RlLlxufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkIFVzZSBgc2V0QW5ndWxhckpTR2xvYmFsYCBpbnN0ZWFkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEFuZ3VsYXJMaWIobmc6IGFueSk6IHZvaWQge1xuICBzZXRBbmd1bGFySlNHbG9iYWwobmcpO1xufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkIFVzZSBgZ2V0QW5ndWxhckpTR2xvYmFsYCBpbnN0ZWFkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFuZ3VsYXJMaWIoKTogYW55IHtcbiAgcmV0dXJuIGdldEFuZ3VsYXJKU0dsb2JhbCgpO1xufVxuXG4vKipcbiAqIFJlc2V0cyB0aGUgQW5ndWxhckpTIGdsb2JhbC5cbiAqXG4gKiBVc2VkIHdoZW4gQW5ndWxhckpTIGlzIGxvYWRlZCBsYXppbHksIGFuZCBub3QgYXZhaWxhYmxlIG9uIGB3aW5kb3dgLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEFuZ3VsYXJKU0dsb2JhbChuZzogYW55KTogdm9pZCB7XG4gIGFuZ3VsYXIgPSBuZztcbiAgdmVyc2lvbiA9IG5nICYmIG5nLnZlcnNpb247XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgY3VycmVudCBBbmd1bGFySlMgZ2xvYmFsLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFuZ3VsYXJKU0dsb2JhbCgpOiBhbnkge1xuICByZXR1cm4gYW5ndWxhcjtcbn1cblxuZXhwb3J0IGNvbnN0IGJvb3RzdHJhcDogdHlwZW9mIGFuZ3VsYXIuYm9vdHN0cmFwID0gKGUsIG1vZHVsZXMsIGNvbmZpZz8pID0+XG4gICAgYW5ndWxhci5ib290c3RyYXAoZSwgbW9kdWxlcywgY29uZmlnKTtcblxuZXhwb3J0IGNvbnN0IG1vZHVsZTogdHlwZW9mIGFuZ3VsYXIubW9kdWxlID0gKHByZWZpeCwgZGVwZW5kZW5jaWVzPykgPT5cbiAgICBhbmd1bGFyLm1vZHVsZShwcmVmaXgsIGRlcGVuZGVuY2llcyk7XG5cbmV4cG9ydCBjb25zdCBlbGVtZW50OiB0eXBlb2YgYW5ndWxhci5lbGVtZW50ID0gKGUgPT4gYW5ndWxhci5lbGVtZW50KGUpKSBhcyB0eXBlb2YgYW5ndWxhci5lbGVtZW50O1xuZWxlbWVudC5jbGVhbkRhdGEgPSBub2RlcyA9PiBhbmd1bGFyLmVsZW1lbnQuY2xlYW5EYXRhKG5vZGVzKTtcblxuZXhwb3J0IGNvbnN0IHJlc3VtZUJvb3RzdHJhcDogdHlwZW9mIGFuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gKCkgPT4gYW5ndWxhci5yZXN1bWVCb290c3RyYXAoKTtcblxuZXhwb3J0IGNvbnN0IGdldFRlc3RhYmlsaXR5OiB0eXBlb2YgYW5ndWxhci5nZXRUZXN0YWJpbGl0eSA9IGUgPT4gYW5ndWxhci5nZXRUZXN0YWJpbGl0eShlKTtcblxuZXhwb3J0IGxldCB2ZXJzaW9uID0gYW5ndWxhci52ZXJzaW9uO1xuIl19