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
let angular = /** @type {?} */ ({
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
catch (e) {
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
/** @type {?} */
export const bootstrap = (e, modules, config) => angular.bootstrap(e, modules, config);
/** @type {?} */
export const module = (prefix, dependencies) => angular.module(prefix, dependencies);
/** @type {?} */
export const element = (e) => angular.element(e);
/** @type {?} */
export const resumeBootstrap = () => angular.resumeBootstrap();
/** @type {?} */
export const getTestability = (e) => angular.getTestability(e);
/** @type {?} */
export let version = angular.version;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vYW5ndWxhcjEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1TkE7SUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7Q0FDbEQ7O0FBR0QsSUFBSSxPQUFPLHFCQVFGO0lBQ1AsU0FBUyxFQUFFLElBQUk7SUFDZixNQUFNLEVBQUUsSUFBSTtJQUNaLE9BQU8sRUFBRSxJQUFJO0lBQ2IsT0FBTyxFQUFFLFNBQVM7SUFDbEIsZUFBZSxFQUFFLElBQUk7SUFDckIsY0FBYyxFQUFFLElBQUk7Q0FDckIsRUFBQztBQUVGLElBQUk7SUFDRixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDcEMsT0FBTyxHQUFHLG1CQUFNLE1BQU0sRUFBQyxDQUFDLE9BQU8sQ0FBQztLQUNqQztDQUNGO0FBQUMsT0FBTyxDQUFDLEVBQUU7O0NBRVg7Ozs7OztBQUtELE1BQU0sd0JBQXdCLEVBQU87SUFDbkMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDeEI7Ozs7O0FBS0QsTUFBTTtJQUNKLE9BQU8sa0JBQWtCLEVBQUUsQ0FBQztDQUM3Qjs7Ozs7Ozs7OztBQVNELE1BQU0sNkJBQTZCLEVBQU87SUFDeEMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNiLE9BQU8sR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQztDQUM1Qjs7Ozs7OztBQU9ELE1BQU07SUFDSixPQUFPLE9BQU8sQ0FBQztDQUNoQjs7QUFFRCxhQUFhLFNBQVMsR0FDbEIsQ0FBQyxDQUFVLEVBQUUsT0FBaUMsRUFBRSxNQUFnQyxFQUFFLEVBQUUsQ0FDaEYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUU5QyxhQUFhLE1BQU0sR0FBRyxDQUFDLE1BQWMsRUFBRSxZQUF1QixFQUFFLEVBQUUsQ0FDOUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7O0FBRXpDLGFBQWEsT0FBTyxHQUFHLENBQUMsQ0FBbUIsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFbkUsYUFBYSxlQUFlLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDOztBQUUvRCxhQUFhLGNBQWMsR0FBRyxDQUFDLENBQVUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFeEUsV0FBVyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHR5cGUgTmcxVG9rZW4gPSBzdHJpbmc7XG5cbmV4cG9ydCB0eXBlIE5nMUV4cHJlc3Npb24gPSBzdHJpbmcgfCBGdW5jdGlvbjtcblxuZXhwb3J0IGludGVyZmFjZSBJQW5ub3RhdGVkRnVuY3Rpb24gZXh0ZW5kcyBGdW5jdGlvbiB7ICRpbmplY3Q/OiBSZWFkb25seUFycmF5PE5nMVRva2VuPjsgfVxuXG5leHBvcnQgdHlwZSBJSW5qZWN0YWJsZSA9IChOZzFUb2tlbiB8IEZ1bmN0aW9uKVtdIHwgSUFubm90YXRlZEZ1bmN0aW9uO1xuXG5leHBvcnQgdHlwZSBTaW5nbGVPckxpc3RPck1hcDxUPiA9IFQgfCBUW10gfCB7W2tleTogc3RyaW5nXTogVH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU1vZHVsZSB7XG4gIG5hbWU6IHN0cmluZztcbiAgcmVxdWlyZXM6IChzdHJpbmd8SUluamVjdGFibGUpW107XG4gIGNvbmZpZyhmbjogSUluamVjdGFibGUpOiBJTW9kdWxlO1xuICBkaXJlY3RpdmUoc2VsZWN0b3I6IHN0cmluZywgZmFjdG9yeTogSUluamVjdGFibGUpOiBJTW9kdWxlO1xuICBjb21wb25lbnQoc2VsZWN0b3I6IHN0cmluZywgY29tcG9uZW50OiBJQ29tcG9uZW50KTogSU1vZHVsZTtcbiAgY29udHJvbGxlcihuYW1lOiBzdHJpbmcsIHR5cGU6IElJbmplY3RhYmxlKTogSU1vZHVsZTtcbiAgZmFjdG9yeShrZXk6IE5nMVRva2VuLCBmYWN0b3J5Rm46IElJbmplY3RhYmxlKTogSU1vZHVsZTtcbiAgdmFsdWUoa2V5OiBOZzFUb2tlbiwgdmFsdWU6IGFueSk6IElNb2R1bGU7XG4gIGNvbnN0YW50KHRva2VuOiBOZzFUb2tlbiwgdmFsdWU6IGFueSk6IElNb2R1bGU7XG4gIHJ1bihhOiBJSW5qZWN0YWJsZSk6IElNb2R1bGU7XG59XG5leHBvcnQgaW50ZXJmYWNlIElDb21waWxlU2VydmljZSB7XG4gIChlbGVtZW50OiBFbGVtZW50fE5vZGVMaXN0fE5vZGVbXXxzdHJpbmcsIHRyYW5zY2x1ZGU/OiBGdW5jdGlvbik6IElMaW5rRm47XG59XG5leHBvcnQgaW50ZXJmYWNlIElMaW5rRm4ge1xuICAoc2NvcGU6IElTY29wZSwgY2xvbmVBdHRhY2hGbj86IElDbG9uZUF0dGFjaEZ1bmN0aW9uLCBvcHRpb25zPzogSUxpbmtGbk9wdGlvbnMpOiBJQXVnbWVudGVkSlF1ZXJ5O1xuICAkJHNsb3RzPzoge1tzbG90TmFtZTogc3RyaW5nXTogSUxpbmtGbn07XG59XG5leHBvcnQgaW50ZXJmYWNlIElMaW5rRm5PcHRpb25zIHtcbiAgcGFyZW50Qm91bmRUcmFuc2NsdWRlRm4/OiBGdW5jdGlvbjtcbiAgdHJhbnNjbHVkZUNvbnRyb2xsZXJzPzoge1trZXk6IHN0cmluZ106IGFueX07XG4gIGZ1dHVyZVBhcmVudEVsZW1lbnQ/OiBOb2RlO1xufVxuZXhwb3J0IGludGVyZmFjZSBJUm9vdFNjb3BlU2VydmljZSB7XG4gICRuZXcoaXNvbGF0ZT86IGJvb2xlYW4pOiBJU2NvcGU7XG4gICRpZDogc3RyaW5nO1xuICAkcGFyZW50OiBJU2NvcGU7XG4gICRyb290OiBJU2NvcGU7XG4gICR3YXRjaChleHA6IE5nMUV4cHJlc3Npb24sIGZuPzogKGExPzogYW55LCBhMj86IGFueSkgPT4gdm9pZCk6IEZ1bmN0aW9uO1xuICAkb24oZXZlbnQ6IHN0cmluZywgZm4/OiAoZXZlbnQ/OiBhbnksIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKTogRnVuY3Rpb247XG4gICRkZXN0cm95KCk6IGFueTtcbiAgJGFwcGx5KGV4cD86IE5nMUV4cHJlc3Npb24pOiBhbnk7XG4gICRkaWdlc3QoKTogYW55O1xuICAkZXZhbEFzeW5jKGV4cDogTmcxRXhwcmVzc2lvbiwgbG9jYWxzPzogYW55KTogdm9pZDtcbiAgJG9uKGV2ZW50OiBzdHJpbmcsIGZuPzogKGV2ZW50PzogYW55LCAuLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IEZ1bmN0aW9uO1xuICAkJGNoaWxkVGFpbDogSVNjb3BlO1xuICAkJGNoaWxkSGVhZDogSVNjb3BlO1xuICAkJG5leHRTaWJsaW5nOiBJU2NvcGU7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSVNjb3BlIGV4dGVuZHMgSVJvb3RTY29wZVNlcnZpY2Uge31cblxuZXhwb3J0IGludGVyZmFjZSBJQW5ndWxhckJvb3RzdHJhcENvbmZpZyB7IHN0cmljdERpPzogYm9vbGVhbjsgfVxuZXhwb3J0IGludGVyZmFjZSBJRGlyZWN0aXZlIHtcbiAgY29tcGlsZT86IElEaXJlY3RpdmVDb21waWxlRm47XG4gIGNvbnRyb2xsZXI/OiBJQ29udHJvbGxlcjtcbiAgY29udHJvbGxlckFzPzogc3RyaW5nO1xuICBiaW5kVG9Db250cm9sbGVyPzogYm9vbGVhbnx7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgbGluaz86IElEaXJlY3RpdmVMaW5rRm58SURpcmVjdGl2ZVByZVBvc3Q7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIHByaW9yaXR5PzogbnVtYmVyO1xuICByZXBsYWNlPzogYm9vbGVhbjtcbiAgcmVxdWlyZT86IERpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eTtcbiAgcmVzdHJpY3Q/OiBzdHJpbmc7XG4gIHNjb3BlPzogYm9vbGVhbnx7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbiAgdGVtcGxhdGU/OiBzdHJpbmd8RnVuY3Rpb247XG4gIHRlbXBsYXRlVXJsPzogc3RyaW5nfEZ1bmN0aW9uO1xuICB0ZW1wbGF0ZU5hbWVzcGFjZT86IHN0cmluZztcbiAgdGVybWluYWw/OiBib29sZWFuO1xuICB0cmFuc2NsdWRlPzogRGlyZWN0aXZlVHJhbnNjbHVkZVByb3BlcnR5O1xufVxuZXhwb3J0IHR5cGUgRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5ID0gU2luZ2xlT3JMaXN0T3JNYXA8c3RyaW5nPjtcbmV4cG9ydCB0eXBlIERpcmVjdGl2ZVRyYW5zY2x1ZGVQcm9wZXJ0eSA9IGJvb2xlYW4gfCAnZWxlbWVudCcgfCB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcbmV4cG9ydCBpbnRlcmZhY2UgSURpcmVjdGl2ZUNvbXBpbGVGbiB7XG4gICh0ZW1wbGF0ZUVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnksIHRlbXBsYXRlQXR0cmlidXRlczogSUF0dHJpYnV0ZXMsXG4gICB0cmFuc2NsdWRlOiBJVHJhbnNjbHVkZUZ1bmN0aW9uKTogSURpcmVjdGl2ZVByZVBvc3Q7XG59XG5leHBvcnQgaW50ZXJmYWNlIElEaXJlY3RpdmVQcmVQb3N0IHtcbiAgcHJlPzogSURpcmVjdGl2ZUxpbmtGbjtcbiAgcG9zdD86IElEaXJlY3RpdmVMaW5rRm47XG59XG5leHBvcnQgaW50ZXJmYWNlIElEaXJlY3RpdmVMaW5rRm4ge1xuICAoc2NvcGU6IElTY29wZSwgaW5zdGFuY2VFbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5LCBpbnN0YW5jZUF0dHJpYnV0ZXM6IElBdHRyaWJ1dGVzLFxuICAgY29udHJvbGxlcjogYW55LCB0cmFuc2NsdWRlOiBJVHJhbnNjbHVkZUZ1bmN0aW9uKTogdm9pZDtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbXBvbmVudCB7XG4gIGJpbmRpbmdzPzoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG4gIGNvbnRyb2xsZXI/OiBzdHJpbmd8SUluamVjdGFibGU7XG4gIGNvbnRyb2xsZXJBcz86IHN0cmluZztcbiAgcmVxdWlyZT86IERpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eTtcbiAgdGVtcGxhdGU/OiBzdHJpbmd8RnVuY3Rpb247XG4gIHRlbXBsYXRlVXJsPzogc3RyaW5nfEZ1bmN0aW9uO1xuICB0cmFuc2NsdWRlPzogRGlyZWN0aXZlVHJhbnNjbHVkZVByb3BlcnR5O1xufVxuZXhwb3J0IGludGVyZmFjZSBJQXR0cmlidXRlcyB7XG4gICRvYnNlcnZlKGF0dHI6IHN0cmluZywgZm46ICh2OiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkO1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5leHBvcnQgaW50ZXJmYWNlIElUcmFuc2NsdWRlRnVuY3Rpb24ge1xuICAvLyBJZiB0aGUgc2NvcGUgaXMgcHJvdmlkZWQsIHRoZW4gdGhlIGNsb25lQXR0YWNoRm4gbXVzdCBiZSBhcyB3ZWxsLlxuICAoc2NvcGU6IElTY29wZSwgY2xvbmVBdHRhY2hGbjogSUNsb25lQXR0YWNoRnVuY3Rpb24pOiBJQXVnbWVudGVkSlF1ZXJ5O1xuICAvLyBJZiBvbmUgYXJndW1lbnQgaXMgcHJvdmlkZWQsIHRoZW4gaXQncyBhc3N1bWVkIHRvIGJlIHRoZSBjbG9uZUF0dGFjaEZuLlxuICAoY2xvbmVBdHRhY2hGbj86IElDbG9uZUF0dGFjaEZ1bmN0aW9uKTogSUF1Z21lbnRlZEpRdWVyeTtcbn1cbmV4cG9ydCBpbnRlcmZhY2UgSUNsb25lQXR0YWNoRnVuY3Rpb24ge1xuICAvLyBMZXQncyBoaW50IGJ1dCBub3QgZm9yY2UgY2xvbmVBdHRhY2hGbidzIHNpZ25hdHVyZVxuICAoY2xvbmVkRWxlbWVudD86IElBdWdtZW50ZWRKUXVlcnksIHNjb3BlPzogSVNjb3BlKTogYW55O1xufVxuZXhwb3J0IHR5cGUgSUF1Z21lbnRlZEpRdWVyeSA9IE5vZGVbXSAmIHtcbiAgb24/OiAobmFtZTogc3RyaW5nLCBmbjogKCkgPT4gdm9pZCkgPT4gdm9pZDtcbiAgZGF0YT86IChuYW1lOiBzdHJpbmcsIHZhbHVlPzogYW55KSA9PiBhbnk7XG4gIHRleHQ/OiAoKSA9PiBzdHJpbmc7XG4gIGluaGVyaXRlZERhdGE/OiAobmFtZTogc3RyaW5nLCB2YWx1ZT86IGFueSkgPT4gYW55O1xuICBjb250ZW50cz86ICgpID0+IElBdWdtZW50ZWRKUXVlcnk7XG4gIHBhcmVudD86ICgpID0+IElBdWdtZW50ZWRKUXVlcnk7XG4gIGVtcHR5PzogKCkgPT4gdm9pZDtcbiAgYXBwZW5kPzogKGNvbnRlbnQ6IElBdWdtZW50ZWRKUXVlcnkgfCBzdHJpbmcpID0+IElBdWdtZW50ZWRKUXVlcnk7XG4gIGNvbnRyb2xsZXI/OiAobmFtZTogc3RyaW5nKSA9PiBhbnk7XG4gIGlzb2xhdGVTY29wZT86ICgpID0+IElTY29wZTtcbiAgaW5qZWN0b3I/OiAoKSA9PiBJSW5qZWN0b3JTZXJ2aWNlO1xuICByZW1vdmU/OiAoKSA9PiB2b2lkO1xuICByZW1vdmVEYXRhPzogKCkgPT4gdm9pZDtcbn07XG5leHBvcnQgaW50ZXJmYWNlIElQcm92aWRlciB7ICRnZXQ6IElJbmplY3RhYmxlOyB9XG5leHBvcnQgaW50ZXJmYWNlIElQcm92aWRlU2VydmljZSB7XG4gIHByb3ZpZGVyKHRva2VuOiBOZzFUb2tlbiwgcHJvdmlkZXI6IElQcm92aWRlcik6IElQcm92aWRlcjtcbiAgZmFjdG9yeSh0b2tlbjogTmcxVG9rZW4sIGZhY3Rvcnk6IElJbmplY3RhYmxlKTogSVByb3ZpZGVyO1xuICBzZXJ2aWNlKHRva2VuOiBOZzFUb2tlbiwgdHlwZTogSUluamVjdGFibGUpOiBJUHJvdmlkZXI7XG4gIHZhbHVlKHRva2VuOiBOZzFUb2tlbiwgdmFsdWU6IGFueSk6IElQcm92aWRlcjtcbiAgY29uc3RhbnQodG9rZW46IE5nMVRva2VuLCB2YWx1ZTogYW55KTogdm9pZDtcbiAgZGVjb3JhdG9yKHRva2VuOiBOZzFUb2tlbiwgZmFjdG9yeTogSUluamVjdGFibGUpOiB2b2lkO1xufVxuZXhwb3J0IGludGVyZmFjZSBJUGFyc2VTZXJ2aWNlIHsgKGV4cHJlc3Npb246IHN0cmluZyk6IElDb21waWxlZEV4cHJlc3Npb247IH1cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbXBpbGVkRXhwcmVzc2lvbiB7XG4gIChjb250ZXh0OiBhbnksIGxvY2FsczogYW55KTogYW55O1xuICBhc3NpZ24/OiAoY29udGV4dDogYW55LCB2YWx1ZTogYW55KSA9PiBhbnk7XG59XG5leHBvcnQgaW50ZXJmYWNlIElIdHRwQmFja2VuZFNlcnZpY2Uge1xuICAobWV0aG9kOiBzdHJpbmcsIHVybDogc3RyaW5nLCBwb3N0PzogYW55LCBjYWxsYmFjaz86IEZ1bmN0aW9uLCBoZWFkZXJzPzogYW55LCB0aW1lb3V0PzogbnVtYmVyLFxuICAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbik6IHZvaWQ7XG59XG5leHBvcnQgaW50ZXJmYWNlIElDYWNoZU9iamVjdCB7XG4gIHB1dDxUPihrZXk6IHN0cmluZywgdmFsdWU/OiBUKTogVDtcbiAgZ2V0KGtleTogc3RyaW5nKTogYW55O1xufVxuZXhwb3J0IGludGVyZmFjZSBJVGVtcGxhdGVDYWNoZVNlcnZpY2UgZXh0ZW5kcyBJQ2FjaGVPYmplY3Qge31cbmV4cG9ydCBpbnRlcmZhY2UgSVRlbXBsYXRlUmVxdWVzdFNlcnZpY2Uge1xuICAodGVtcGxhdGU6IHN0cmluZ3xhbnkgLyogVHJ1c3RlZFJlc291cmNlVXJsICovLCBpZ25vcmVSZXF1ZXN0RXJyb3I/OiBib29sZWFuKTogUHJvbWlzZTxzdHJpbmc+O1xuICB0b3RhbFBlbmRpbmdSZXF1ZXN0czogbnVtYmVyO1xufVxuZXhwb3J0IHR5cGUgSUNvbnRyb2xsZXIgPSBzdHJpbmcgfCBJSW5qZWN0YWJsZTtcbmV4cG9ydCBpbnRlcmZhY2UgSUNvbnRyb2xsZXJTZXJ2aWNlIHtcbiAgKGNvbnRyb2xsZXJDb25zdHJ1Y3RvcjogSUNvbnRyb2xsZXIsIGxvY2Fscz86IGFueSwgbGF0ZXI/OiBhbnksIGlkZW50PzogYW55KTogYW55O1xuICAoY29udHJvbGxlck5hbWU6IHN0cmluZywgbG9jYWxzPzogYW55KTogYW55O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElJbmplY3RvclNlcnZpY2Uge1xuICBnZXQoa2V5OiBzdHJpbmcpOiBhbnk7XG4gIGhhcyhrZXk6IHN0cmluZyk6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUludGVydmFsU2VydmljZSB7XG4gIChmdW5jOiBGdW5jdGlvbiwgZGVsYXk6IG51bWJlciwgY291bnQ/OiBudW1iZXIsIGludm9rZUFwcGx5PzogYm9vbGVhbixcbiAgIC4uLmFyZ3M6IGFueVtdKTogUHJvbWlzZTxhbnk+O1xuICBjYW5jZWwocHJvbWlzZTogUHJvbWlzZTxhbnk+KTogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVGVzdGFiaWxpdHlTZXJ2aWNlIHtcbiAgZmluZEJpbmRpbmdzKGVsZW1lbnQ6IEVsZW1lbnQsIGV4cHJlc3Npb246IHN0cmluZywgb3B0X2V4YWN0TWF0Y2g/OiBib29sZWFuKTogRWxlbWVudFtdO1xuICBmaW5kTW9kZWxzKGVsZW1lbnQ6IEVsZW1lbnQsIGV4cHJlc3Npb246IHN0cmluZywgb3B0X2V4YWN0TWF0Y2g/OiBib29sZWFuKTogRWxlbWVudFtdO1xuICBnZXRMb2NhdGlvbigpOiBzdHJpbmc7XG4gIHNldExvY2F0aW9uKHVybDogc3RyaW5nKTogdm9pZDtcbiAgd2hlblN0YWJsZShjYWxsYmFjazogRnVuY3Rpb24pOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOZ01vZGVsQ29udHJvbGxlciB7XG4gICRyZW5kZXIoKTogdm9pZDtcbiAgJGlzRW1wdHkodmFsdWU6IGFueSk6IGJvb2xlYW47XG4gICRzZXRWYWxpZGl0eSh2YWxpZGF0aW9uRXJyb3JLZXk6IHN0cmluZywgaXNWYWxpZDogYm9vbGVhbik6IHZvaWQ7XG4gICRzZXRQcmlzdGluZSgpOiB2b2lkO1xuICAkc2V0RGlydHkoKTogdm9pZDtcbiAgJHNldFVudG91Y2hlZCgpOiB2b2lkO1xuICAkc2V0VG91Y2hlZCgpOiB2b2lkO1xuICAkcm9sbGJhY2tWaWV3VmFsdWUoKTogdm9pZDtcbiAgJHZhbGlkYXRlKCk6IHZvaWQ7XG4gICRjb21taXRWaWV3VmFsdWUoKTogdm9pZDtcbiAgJHNldFZpZXdWYWx1ZSh2YWx1ZTogYW55LCB0cmlnZ2VyOiBzdHJpbmcpOiB2b2lkO1xuXG4gICR2aWV3VmFsdWU6IGFueTtcbiAgJG1vZGVsVmFsdWU6IGFueTtcbiAgJHBhcnNlcnM6IEZ1bmN0aW9uW107XG4gICRmb3JtYXR0ZXJzOiBGdW5jdGlvbltdO1xuICAkdmFsaWRhdG9yczoge1trZXk6IHN0cmluZ106IEZ1bmN0aW9ufTtcbiAgJGFzeW5jVmFsaWRhdG9yczoge1trZXk6IHN0cmluZ106IEZ1bmN0aW9ufTtcbiAgJHZpZXdDaGFuZ2VMaXN0ZW5lcnM6IEZ1bmN0aW9uW107XG4gICRlcnJvcjogT2JqZWN0O1xuICAkcGVuZGluZzogT2JqZWN0O1xuICAkdW50b3VjaGVkOiBib29sZWFuO1xuICAkdG91Y2hlZDogYm9vbGVhbjtcbiAgJHByaXN0aW5lOiBib29sZWFuO1xuICAkZGlydHk6IGJvb2xlYW47XG4gICR2YWxpZDogYm9vbGVhbjtcbiAgJGludmFsaWQ6IGJvb2xlYW47XG4gICRuYW1lOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIG5vTmcoKSB7XG4gIHRocm93IG5ldyBFcnJvcignQW5ndWxhckpTIHYxLnggaXMgbm90IGxvYWRlZCEnKTtcbn1cblxuXG5sZXQgYW5ndWxhcjoge1xuICBib290c3RyYXA6IChlOiBFbGVtZW50LCBtb2R1bGVzOiAoc3RyaW5nIHwgSUluamVjdGFibGUpW10sIGNvbmZpZz86IElBbmd1bGFyQm9vdHN0cmFwQ29uZmlnKSA9PlxuICAgICAgICAgICAgICAgICBJSW5qZWN0b3JTZXJ2aWNlLFxuICBtb2R1bGU6IChwcmVmaXg6IHN0cmluZywgZGVwZW5kZW5jaWVzPzogc3RyaW5nW10pID0+IElNb2R1bGUsXG4gIGVsZW1lbnQ6IChlOiBFbGVtZW50IHwgc3RyaW5nKSA9PiBJQXVnbWVudGVkSlF1ZXJ5LFxuICB2ZXJzaW9uOiB7bWFqb3I6IG51bWJlcn0sXG4gIHJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCxcbiAgZ2V0VGVzdGFiaWxpdHk6IChlOiBFbGVtZW50KSA9PiBJVGVzdGFiaWxpdHlTZXJ2aWNlXG59ID0gPGFueT57XG4gIGJvb3RzdHJhcDogbm9OZyxcbiAgbW9kdWxlOiBub05nLFxuICBlbGVtZW50OiBub05nLFxuICB2ZXJzaW9uOiB1bmRlZmluZWQsXG4gIHJlc3VtZUJvb3RzdHJhcDogbm9OZyxcbiAgZ2V0VGVzdGFiaWxpdHk6IG5vTmdcbn07XG5cbnRyeSB7XG4gIGlmICh3aW5kb3cuaGFzT3duUHJvcGVydHkoJ2FuZ3VsYXInKSkge1xuICAgIGFuZ3VsYXIgPSAoPGFueT53aW5kb3cpLmFuZ3VsYXI7XG4gIH1cbn0gY2F0Y2ggKGUpIHtcbiAgLy8gaWdub3JlIGluIENKUyBtb2RlLlxufVxuXG4vKipcbiAqIEBkZXByZWNhdGVkIFVzZSBgc2V0QW5ndWxhckpTR2xvYmFsYCBpbnN0ZWFkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QW5ndWxhckxpYihuZzogYW55KTogdm9pZCB7XG4gIHNldEFuZ3VsYXJKU0dsb2JhbChuZyk7XG59XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgVXNlIGBnZXRBbmd1bGFySlNHbG9iYWxgIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmd1bGFyTGliKCk6IGFueSB7XG4gIHJldHVybiBnZXRBbmd1bGFySlNHbG9iYWwoKTtcbn1cblxuLyoqXG4gKiBSZXNldHMgdGhlIEFuZ3VsYXJKUyBnbG9iYWwuXG4gKlxuICogVXNlZCB3aGVuIEFuZ3VsYXJKUyBpcyBsb2FkZWQgbGF6aWx5LCBhbmQgbm90IGF2YWlsYWJsZSBvbiBgd2luZG93YC5cbiAqXG4gKlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0QW5ndWxhckpTR2xvYmFsKG5nOiBhbnkpOiB2b2lkIHtcbiAgYW5ndWxhciA9IG5nO1xuICB2ZXJzaW9uID0gbmcgJiYgbmcudmVyc2lvbjtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjdXJyZW50IEFuZ3VsYXJKUyBnbG9iYWwuXG4gKlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFuZ3VsYXJKU0dsb2JhbCgpOiBhbnkge1xuICByZXR1cm4gYW5ndWxhcjtcbn1cblxuZXhwb3J0IGNvbnN0IGJvb3RzdHJhcCA9XG4gICAgKGU6IEVsZW1lbnQsIG1vZHVsZXM6IChzdHJpbmcgfCBJSW5qZWN0YWJsZSlbXSwgY29uZmlnPzogSUFuZ3VsYXJCb290c3RyYXBDb25maWcpID0+XG4gICAgICAgIGFuZ3VsYXIuYm9vdHN0cmFwKGUsIG1vZHVsZXMsIGNvbmZpZyk7XG5cbmV4cG9ydCBjb25zdCBtb2R1bGUgPSAocHJlZml4OiBzdHJpbmcsIGRlcGVuZGVuY2llcz86IHN0cmluZ1tdKSA9PlxuICAgIGFuZ3VsYXIubW9kdWxlKHByZWZpeCwgZGVwZW5kZW5jaWVzKTtcblxuZXhwb3J0IGNvbnN0IGVsZW1lbnQgPSAoZTogRWxlbWVudCB8IHN0cmluZykgPT4gYW5ndWxhci5lbGVtZW50KGUpO1xuXG5leHBvcnQgY29uc3QgcmVzdW1lQm9vdHN0cmFwID0gKCkgPT4gYW5ndWxhci5yZXN1bWVCb290c3RyYXAoKTtcblxuZXhwb3J0IGNvbnN0IGdldFRlc3RhYmlsaXR5ID0gKGU6IEVsZW1lbnQpID0+IGFuZ3VsYXIuZ2V0VGVzdGFiaWxpdHkoZSk7XG5cbmV4cG9ydCBsZXQgdmVyc2lvbiA9IGFuZ3VsYXIudmVyc2lvbjtcbiJdfQ==