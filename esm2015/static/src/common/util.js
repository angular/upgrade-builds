/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOWNGRADED_MODULE_COUNT_KEY, UPGRADE_APP_TYPE_KEY } from './constants';
/** @type {?} */
const DIRECTIVE_PREFIX_REGEXP = /^(?:x|data)[:\-_]/i;
/** @type {?} */
const DIRECTIVE_SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;
/**
 * @param {?} e
 * @return {?}
 */
export function onError(e) {
    // TODO: (misko): We seem to not have a stack trace here!
    if (console.error) {
        console.error(e, e.stack);
    }
    else {
        // tslint:disable-next-line:no-console
        console.log(e, e.stack);
    }
    throw e;
}
/**
 * @param {?} name
 * @return {?}
 */
export function controllerKey(name) {
    return '$' + name + 'Controller';
}
/**
 * @param {?} name
 * @return {?}
 */
export function directiveNormalize(name) {
    return name.replace(DIRECTIVE_PREFIX_REGEXP, '')
        .replace(DIRECTIVE_SPECIAL_CHARS_REGEXP, (_, letter) => letter.toUpperCase());
}
/**
 * @param {?} type
 * @return {?}
 */
export function getTypeName(type) {
    // Return the name of the type or the first line of its stringified version.
    return ((/** @type {?} */ (type))).overriddenName || type.name || type.toString().split('\n')[0];
}
/**
 * @param {?} $injector
 * @return {?}
 */
export function getDowngradedModuleCount($injector) {
    return $injector.has(DOWNGRADED_MODULE_COUNT_KEY) ? $injector.get(DOWNGRADED_MODULE_COUNT_KEY) :
        0;
}
/**
 * @param {?} $injector
 * @return {?}
 */
export function getUpgradeAppType($injector) {
    return $injector.has(UPGRADE_APP_TYPE_KEY) ? $injector.get(UPGRADE_APP_TYPE_KEY) :
        0 /* None */;
}
/**
 * @param {?} value
 * @return {?}
 */
export function isFunction(value) {
    return typeof value === 'function';
}
/**
 * @param {?} $injector
 * @param {?} downgradedModule
 * @param {?} injectionKey
 * @param {?} attemptedAction
 * @return {?}
 */
export function validateInjectionKey($injector, downgradedModule, injectionKey, attemptedAction) {
    /** @type {?} */
    const upgradeAppType = getUpgradeAppType($injector);
    /** @type {?} */
    const downgradedModuleCount = getDowngradedModuleCount($injector);
    // Check for common errors.
    switch (upgradeAppType) {
        case 1 /* Dynamic */:
        case 2 /* Static */:
            if (downgradedModule) {
                throw new Error(`Error while ${attemptedAction}: 'downgradedModule' unexpectedly specified.\n` +
                    'You should not specify a value for \'downgradedModule\', unless you are downgrading ' +
                    'more than one Angular module (via \'downgradeModule()\').');
            }
            break;
        case 3 /* Lite */:
            if (!downgradedModule && (downgradedModuleCount >= 2)) {
                throw new Error(`Error while ${attemptedAction}: 'downgradedModule' not specified.\n` +
                    'This application contains more than one downgraded Angular module, thus you need to ' +
                    'always specify \'downgradedModule\' when downgrading components and injectables.');
            }
            if (!$injector.has(injectionKey)) {
                throw new Error(`Error while ${attemptedAction}: Unable to find the specified downgraded module.\n` +
                    'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                    'application?');
            }
            break;
        default:
            throw new Error(`Error while ${attemptedAction}: Not a valid '@angular/upgrade' application.\n` +
                'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                'application?');
    }
}
/**
 * @template R
 */
export class Deferred {
    constructor() {
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
if (false) {
    /** @type {?} */
    Deferred.prototype.promise;
    /** @type {?} */
    Deferred.prototype.resolve;
    /** @type {?} */
    Deferred.prototype.reject;
}
/**
 * @record
 */
export function LazyModuleRef() { }
if (false) {
    /** @type {?|undefined} */
    LazyModuleRef.prototype.injector;
    /** @type {?|undefined} */
    LazyModuleRef.prototype.promise;
}
/** @enum {number} */
const UpgradeAppType = {
    // App NOT using `@angular/upgrade`. (This should never happen in an `ngUpgrade` app.)
    None: 0,
    // App using the deprecated `@angular/upgrade` APIs (a.k.a. dynamic `ngUpgrade`).
    Dynamic: 1,
    // App using `@angular/upgrade/static` with `UpgradeModule`.
    Static: 2,
    // App using @angular/upgrade/static` with `downgradeModule()` (a.k.a `ngUpgrade`-lite ).
    Lite: 3,
};
export { UpgradeAppType };
/**
 * @param {?} component
 * @return {?} Whether the passed-in component implements the subset of the
 *     `ControlValueAccessor` interface needed for AngularJS `ng-model`
 *     compatibility.
 */
function supportsNgModel(component) {
    return typeof component.writeValue === 'function' &&
        typeof component.registerOnChange === 'function';
}
/**
 * Glue the AngularJS `NgModelController` (if it exists) to the component
 * (if it implements the needed subset of the `ControlValueAccessor` interface).
 * @param {?} ngModel
 * @param {?} component
 * @return {?}
 */
export function hookupNgModel(ngModel, component) {
    if (ngModel && supportsNgModel(component)) {
        ngModel.$render = () => { component.writeValue(ngModel.$viewValue); };
        component.registerOnChange(ngModel.$setViewValue.bind(ngModel));
        if (typeof component.registerOnTouched === 'function') {
            component.registerOnTouched(ngModel.$setTouched.bind(ngModel));
        }
    }
}
/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 * @param {?} val1
 * @param {?} val2
 * @return {?}
 */
export function strictEquals(val1, val2) {
    return val1 === val2 || (val1 !== val1 && val2 !== val2);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVVBLE9BQU8sRUFBQywyQkFBMkIsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7TUFFeEUsdUJBQXVCLEdBQUcsb0JBQW9COztNQUM5Qyw4QkFBOEIsR0FBRyxhQUFhOzs7OztBQUVwRCxNQUFNLFVBQVUsT0FBTyxDQUFDLENBQU07SUFDNUIseURBQXlEO0lBQ3pELElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDM0I7U0FBTTtRQUNMLHNDQUFzQztRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekI7SUFDRCxNQUFNLENBQUMsQ0FBQztBQUNWLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGFBQWEsQ0FBQyxJQUFZO0lBQ3hDLE9BQU8sR0FBRyxHQUFHLElBQUksR0FBRyxZQUFZLENBQUM7QUFDbkMsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsSUFBWTtJQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxDQUFDO1NBQzNDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQ3BGLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLFdBQVcsQ0FBQyxJQUFlO0lBQ3pDLDRFQUE0RTtJQUM1RSxPQUFPLENBQUMsbUJBQUEsSUFBSSxFQUFPLENBQUMsQ0FBQyxjQUFjLElB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LElBQUksT0FBTyxJQUFJLGVBQWUsQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUN6QyxPQUFPLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksT0FBTyxTQUFTLENBQUMsaUJBQWlCLEtBQUssVUFBVSxFQUFFO1lBQ3JELFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2hFO0tBQ0Y7QUFDSCxDQUFDOzs7Ozs7O0FBS0QsTUFBTSxVQUFVLFlBQVksQ0FBQyxJQUFTLEVBQUUsSUFBUztJQUMvQyxPQUFPLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztBQUMzRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQge0RPV05HUkFERURfTU9EVUxFX0NPVU5UX0tFWSwgVVBHUkFERV9BUFBfVFlQRV9LRVl9IGZyb20gJy4vY29uc3RhbnRzJztcblxuY29uc3QgRElSRUNUSVZFX1BSRUZJWF9SRUdFWFAgPSAvXig/Onh8ZGF0YSlbOlxcLV9dL2k7XG5jb25zdCBESVJFQ1RJVkVfU1BFQ0lBTF9DSEFSU19SRUdFWFAgPSAvWzpcXC1fXSsoLikvZztcblxuZXhwb3J0IGZ1bmN0aW9uIG9uRXJyb3IoZTogYW55KSB7XG4gIC8vIFRPRE86IChtaXNrbyk6IFdlIHNlZW0gdG8gbm90IGhhdmUgYSBzdGFjayB0cmFjZSBoZXJlIVxuICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoZSwgZS5zdGFjayk7XG4gIH0gZWxzZSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyhlLCBlLnN0YWNrKTtcbiAgfVxuICB0aHJvdyBlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udHJvbGxlcktleShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gJyQnICsgbmFtZSArICdDb250cm9sbGVyJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpcmVjdGl2ZU5vcm1hbGl6ZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKERJUkVDVElWRV9QUkVGSVhfUkVHRVhQLCAnJylcbiAgICAgIC5yZXBsYWNlKERJUkVDVElWRV9TUEVDSUFMX0NIQVJTX1JFR0VYUCwgKF8sIGxldHRlcikgPT4gbGV0dGVyLnRvVXBwZXJDYXNlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWUodHlwZTogVHlwZTxhbnk+KTogc3RyaW5nIHtcbiAgLy8gUmV0dXJuIHRoZSBuYW1lIG9mIHRoZSB0eXBlIG9yIHRoZSBmaXJzdCBsaW5lIG9mIGl0cyBzdHJpbmdpZmllZCB2ZXJzaW9uLlxuICByZXR1cm4gKHR5cGUgYXMgYW55KS5vdmVycmlkZGVuTmFtZSB8fCB0eXBlLm5hbWUgfHwgdHlwZS50b1N0cmluZygpLnNwbGl0KCdcXG4nKVswXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERvd25ncmFkZWRNb2R1bGVDb3VudCgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSk6IG51bWJlciB7XG4gIHJldHVybiAkaW5qZWN0b3IuaGFzKERPV05HUkFERURfTU9EVUxFX0NPVU5UX0tFWSkgPyAkaW5qZWN0b3IuZ2V0KERPV05HUkFERURfTU9EVUxFX0NPVU5UX0tFWSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFVwZ3JhZGVBcHBUeXBlKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKTogVXBncmFkZUFwcFR5cGUge1xuICByZXR1cm4gJGluamVjdG9yLmhhcyhVUEdSQURFX0FQUF9UWVBFX0tFWSkgPyAkaW5qZWN0b3IuZ2V0KFVQR1JBREVfQVBQX1RZUEVfS0VZKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVwZ3JhZGVBcHBUeXBlLk5vbmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBGdW5jdGlvbiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUluamVjdGlvbktleShcbiAgICAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSwgZG93bmdyYWRlZE1vZHVsZTogc3RyaW5nLCBpbmplY3Rpb25LZXk6IHN0cmluZyxcbiAgICBhdHRlbXB0ZWRBY3Rpb246IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCB1cGdyYWRlQXBwVHlwZSA9IGdldFVwZ3JhZGVBcHBUeXBlKCRpbmplY3Rvcik7XG4gIGNvbnN0IGRvd25ncmFkZWRNb2R1bGVDb3VudCA9IGdldERvd25ncmFkZWRNb2R1bGVDb3VudCgkaW5qZWN0b3IpO1xuXG4gIC8vIENoZWNrIGZvciBjb21tb24gZXJyb3JzLlxuICBzd2l0Y2ggKHVwZ3JhZGVBcHBUeXBlKSB7XG4gICAgY2FzZSBVcGdyYWRlQXBwVHlwZS5EeW5hbWljOlxuICAgIGNhc2UgVXBncmFkZUFwcFR5cGUuU3RhdGljOlxuICAgICAgaWYgKGRvd25ncmFkZWRNb2R1bGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogJ2Rvd25ncmFkZWRNb2R1bGUnIHVuZXhwZWN0ZWRseSBzcGVjaWZpZWQuXFxuYCArXG4gICAgICAgICAgICAnWW91IHNob3VsZCBub3Qgc3BlY2lmeSBhIHZhbHVlIGZvciBcXCdkb3duZ3JhZGVkTW9kdWxlXFwnLCB1bmxlc3MgeW91IGFyZSBkb3duZ3JhZGluZyAnICtcbiAgICAgICAgICAgICdtb3JlIHRoYW4gb25lIEFuZ3VsYXIgbW9kdWxlICh2aWEgXFwnZG93bmdyYWRlTW9kdWxlKClcXCcpLicpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBVcGdyYWRlQXBwVHlwZS5MaXRlOlxuICAgICAgaWYgKCFkb3duZ3JhZGVkTW9kdWxlICYmIChkb3duZ3JhZGVkTW9kdWxlQ291bnQgPj0gMikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogJ2Rvd25ncmFkZWRNb2R1bGUnIG5vdCBzcGVjaWZpZWQuXFxuYCArXG4gICAgICAgICAgICAnVGhpcyBhcHBsaWNhdGlvbiBjb250YWlucyBtb3JlIHRoYW4gb25lIGRvd25ncmFkZWQgQW5ndWxhciBtb2R1bGUsIHRodXMgeW91IG5lZWQgdG8gJyArXG4gICAgICAgICAgICAnYWx3YXlzIHNwZWNpZnkgXFwnZG93bmdyYWRlZE1vZHVsZVxcJyB3aGVuIGRvd25ncmFkaW5nIGNvbXBvbmVudHMgYW5kIGluamVjdGFibGVzLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoISRpbmplY3Rvci5oYXMoaW5qZWN0aW9uS2V5KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRXJyb3Igd2hpbGUgJHthdHRlbXB0ZWRBY3Rpb259OiBVbmFibGUgdG8gZmluZCB0aGUgc3BlY2lmaWVkIGRvd25ncmFkZWQgbW9kdWxlLlxcbmAgK1xuICAgICAgICAgICAgJ0RpZCB5b3UgZm9yZ2V0IHRvIGRvd25ncmFkZSBhbiBBbmd1bGFyIG1vZHVsZSBvciBpbmNsdWRlIGl0IGluIHRoZSBBbmd1bGFySlMgJyArXG4gICAgICAgICAgICAnYXBwbGljYXRpb24/Jyk7XG4gICAgICB9XG5cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogTm90IGEgdmFsaWQgJ0Bhbmd1bGFyL3VwZ3JhZGUnIGFwcGxpY2F0aW9uLlxcbmAgK1xuICAgICAgICAgICdEaWQgeW91IGZvcmdldCB0byBkb3duZ3JhZGUgYW4gQW5ndWxhciBtb2R1bGUgb3IgaW5jbHVkZSBpdCBpbiB0aGUgQW5ndWxhckpTICcgK1xuICAgICAgICAgICdhcHBsaWNhdGlvbj8nKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVmZXJyZWQ8Uj4ge1xuICBwcm9taXNlOiBQcm9taXNlPFI+O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVzb2x2ZSAhOiAodmFsdWU/OiBSIHwgUHJvbWlzZUxpa2U8Uj4pID0+IHZvaWQ7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICByZWplY3QgITogKGVycm9yPzogYW55KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzO1xuICAgICAgdGhpcy5yZWplY3QgPSByZWo7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMYXp5TW9kdWxlUmVmIHtcbiAgaW5qZWN0b3I/OiBJbmplY3RvcjtcbiAgcHJvbWlzZT86IFByb21pc2U8SW5qZWN0b3I+O1xufVxuXG5leHBvcnQgY29uc3QgZW51bSBVcGdyYWRlQXBwVHlwZSB7XG4gIC8vIEFwcCBOT1QgdXNpbmcgYEBhbmd1bGFyL3VwZ3JhZGVgLiAoVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIGluIGFuIGBuZ1VwZ3JhZGVgIGFwcC4pXG4gIE5vbmUsXG5cbiAgLy8gQXBwIHVzaW5nIHRoZSBkZXByZWNhdGVkIGBAYW5ndWxhci91cGdyYWRlYCBBUElzIChhLmsuYS4gZHluYW1pYyBgbmdVcGdyYWRlYCkuXG4gIER5bmFtaWMsXG5cbiAgLy8gQXBwIHVzaW5nIGBAYW5ndWxhci91cGdyYWRlL3N0YXRpY2Agd2l0aCBgVXBncmFkZU1vZHVsZWAuXG4gIFN0YXRpYyxcblxuICAvLyBBcHAgdXNpbmcgQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWNgIHdpdGggYGRvd25ncmFkZU1vZHVsZSgpYCAoYS5rLmEgYG5nVXBncmFkZWAtbGl0ZSApLlxuICBMaXRlLFxufVxuXG4vKipcbiAqIEByZXR1cm4gV2hldGhlciB0aGUgcGFzc2VkLWluIGNvbXBvbmVudCBpbXBsZW1lbnRzIHRoZSBzdWJzZXQgb2YgdGhlXG4gKiAgICAgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UgbmVlZGVkIGZvciBBbmd1bGFySlMgYG5nLW1vZGVsYFxuICogICAgIGNvbXBhdGliaWxpdHkuXG4gKi9cbmZ1bmN0aW9uIHN1cHBvcnRzTmdNb2RlbChjb21wb25lbnQ6IGFueSkge1xuICByZXR1cm4gdHlwZW9mIGNvbXBvbmVudC53cml0ZVZhbHVlID09PSAnZnVuY3Rpb24nICYmXG4gICAgICB0eXBlb2YgY29tcG9uZW50LnJlZ2lzdGVyT25DaGFuZ2UgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogR2x1ZSB0aGUgQW5ndWxhckpTIGBOZ01vZGVsQ29udHJvbGxlcmAgKGlmIGl0IGV4aXN0cykgdG8gdGhlIGNvbXBvbmVudFxuICogKGlmIGl0IGltcGxlbWVudHMgdGhlIG5lZWRlZCBzdWJzZXQgb2YgdGhlIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgaW50ZXJmYWNlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhvb2t1cE5nTW9kZWwobmdNb2RlbDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIsIGNvbXBvbmVudDogYW55KSB7XG4gIGlmIChuZ01vZGVsICYmIHN1cHBvcnRzTmdNb2RlbChjb21wb25lbnQpKSB7XG4gICAgbmdNb2RlbC4kcmVuZGVyID0gKCkgPT4geyBjb21wb25lbnQud3JpdGVWYWx1ZShuZ01vZGVsLiR2aWV3VmFsdWUpOyB9O1xuICAgIGNvbXBvbmVudC5yZWdpc3Rlck9uQ2hhbmdlKG5nTW9kZWwuJHNldFZpZXdWYWx1ZS5iaW5kKG5nTW9kZWwpKTtcbiAgICBpZiAodHlwZW9mIGNvbXBvbmVudC5yZWdpc3Rlck9uVG91Y2hlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcG9uZW50LnJlZ2lzdGVyT25Ub3VjaGVkKG5nTW9kZWwuJHNldFRvdWNoZWQuYmluZChuZ01vZGVsKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGVzdCB0d28gdmFsdWVzIGZvciBzdHJpY3QgZXF1YWxpdHksIGFjY291bnRpbmcgZm9yIHRoZSBmYWN0IHRoYXQgYE5hTiAhPT0gTmFOYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmljdEVxdWFscyh2YWwxOiBhbnksIHZhbDI6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsMSA9PT0gdmFsMiB8fCAodmFsMSAhPT0gdmFsMSAmJiB2YWwyICE9PSB2YWwyKTtcbn1cbiJdfQ==