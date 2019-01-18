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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBVUEsT0FBTyxFQUFDLDJCQUEyQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sYUFBYSxDQUFDOztNQUV4RSx1QkFBdUIsR0FBRyxvQkFBb0I7O01BQzlDLDhCQUE4QixHQUFHLGFBQWE7Ozs7O0FBRXBELE1BQU0sVUFBVSxPQUFPLENBQUMsQ0FBTTtJQUM1Qix5REFBeUQ7SUFDekQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMzQjtTQUFNO1FBQ0wsc0NBQXNDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6QjtJQUNELE1BQU0sQ0FBQyxDQUFDO0FBQ1YsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUFDLElBQVk7SUFDeEMsT0FBTyxHQUFHLEdBQUcsSUFBSSxHQUFHLFlBQVksQ0FBQztBQUNuQyxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxJQUFZO0lBQzdDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLENBQUM7U0FDM0MsT0FBTyxDQUFDLDhCQUE4QixFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDcEYsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFDLElBQWU7SUFDekMsNEVBQTRFO0lBQzVFLE9BQU8sQ0FBQyxtQkFBQSxJQUFJLEVBQU8sQ0FBQyxDQUFDLGNBQWMsSUFBSSxJQUFJLENB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LElBQUksZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ3pDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEUsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxPQUFPLFNBQVMsQ0FBQyxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7WUFDckQsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDaEU7S0FDRjtBQUNILENBQUM7Ozs7Ozs7QUFLRCxNQUFNLFVBQVUsWUFBWSxDQUFDLElBQVMsRUFBRSxJQUFTO0lBQy9DLE9BQU8sSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQzNELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7RE9XTkdSQURFRF9NT0RVTEVfQ09VTlRfS0VZLCBVUEdSQURFX0FQUF9UWVBFX0tFWX0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5jb25zdCBESVJFQ1RJVkVfUFJFRklYX1JFR0VYUCA9IC9eKD86eHxkYXRhKVs6XFwtX10vaTtcbmNvbnN0IERJUkVDVElWRV9TUEVDSUFMX0NIQVJTX1JFR0VYUCA9IC9bOlxcLV9dKyguKS9nO1xuXG5leHBvcnQgZnVuY3Rpb24gb25FcnJvcihlOiBhbnkpIHtcbiAgLy8gVE9ETzogKG1pc2tvKTogV2Ugc2VlbSB0byBub3QgaGF2ZSBhIHN0YWNrIHRyYWNlIGhlcmUhXG4gIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihlLCBlLnN0YWNrKTtcbiAgfSBlbHNlIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgIGNvbnNvbGUubG9nKGUsIGUuc3RhY2spO1xuICB9XG4gIHRocm93IGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250cm9sbGVyS2V5KG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAnJCcgKyBuYW1lICsgJ0NvbnRyb2xsZXInO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlyZWN0aXZlTm9ybWFsaXplKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuYW1lLnJlcGxhY2UoRElSRUNUSVZFX1BSRUZJWF9SRUdFWFAsICcnKVxuICAgICAgLnJlcGxhY2UoRElSRUNUSVZFX1NQRUNJQUxfQ0hBUlNfUkVHRVhQLCAoXywgbGV0dGVyKSA9PiBsZXR0ZXIudG9VcHBlckNhc2UoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlTmFtZSh0eXBlOiBUeXBlPGFueT4pOiBzdHJpbmcge1xuICAvLyBSZXR1cm4gdGhlIG5hbWUgb2YgdGhlIHR5cGUgb3IgdGhlIGZpcnN0IGxpbmUgb2YgaXRzIHN0cmluZ2lmaWVkIHZlcnNpb24uXG4gIHJldHVybiAodHlwZSBhcyBhbnkpLm92ZXJyaWRkZW5OYW1lIHx8IHR5cGUubmFtZSB8fCB0eXBlLnRvU3RyaW5nKCkuc3BsaXQoJ1xcbicpWzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RG93bmdyYWRlZE1vZHVsZUNvdW50KCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKTogbnVtYmVyIHtcbiAgcmV0dXJuICRpbmplY3Rvci5oYXMoRE9XTkdSQURFRF9NT0RVTEVfQ09VTlRfS0VZKSA/ICRpbmplY3Rvci5nZXQoRE9XTkdSQURFRF9NT0RVTEVfQ09VTlRfS0VZKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VXBncmFkZUFwcFR5cGUoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpOiBVcGdyYWRlQXBwVHlwZSB7XG4gIHJldHVybiAkaW5qZWN0b3IuaGFzKFVQR1JBREVfQVBQX1RZUEVfS0VZKSA/ICRpbmplY3Rvci5nZXQoVVBHUkFERV9BUFBfVFlQRV9LRVkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVXBncmFkZUFwcFR5cGUuTm9uZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWU6IGFueSk6IHZhbHVlIGlzIEZ1bmN0aW9uIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlSW5qZWN0aW9uS2V5KFxuICAgICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCBkb3duZ3JhZGVkTW9kdWxlOiBzdHJpbmcsIGluamVjdGlvbktleTogc3RyaW5nLFxuICAgIGF0dGVtcHRlZEFjdGlvbjogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnN0IHVwZ3JhZGVBcHBUeXBlID0gZ2V0VXBncmFkZUFwcFR5cGUoJGluamVjdG9yKTtcbiAgY29uc3QgZG93bmdyYWRlZE1vZHVsZUNvdW50ID0gZ2V0RG93bmdyYWRlZE1vZHVsZUNvdW50KCRpbmplY3Rvcik7XG5cbiAgLy8gQ2hlY2sgZm9yIGNvbW1vbiBlcnJvcnMuXG4gIHN3aXRjaCAodXBncmFkZUFwcFR5cGUpIHtcbiAgICBjYXNlIFVwZ3JhZGVBcHBUeXBlLkR5bmFtaWM6XG4gICAgY2FzZSBVcGdyYWRlQXBwVHlwZS5TdGF0aWM6XG4gICAgICBpZiAoZG93bmdyYWRlZE1vZHVsZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRXJyb3Igd2hpbGUgJHthdHRlbXB0ZWRBY3Rpb259OiAnZG93bmdyYWRlZE1vZHVsZScgdW5leHBlY3RlZGx5IHNwZWNpZmllZC5cXG5gICtcbiAgICAgICAgICAgICdZb3Ugc2hvdWxkIG5vdCBzcGVjaWZ5IGEgdmFsdWUgZm9yIFxcJ2Rvd25ncmFkZWRNb2R1bGVcXCcsIHVubGVzcyB5b3UgYXJlIGRvd25ncmFkaW5nICcgK1xuICAgICAgICAgICAgJ21vcmUgdGhhbiBvbmUgQW5ndWxhciBtb2R1bGUgKHZpYSBcXCdkb3duZ3JhZGVNb2R1bGUoKVxcJykuJyk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFVwZ3JhZGVBcHBUeXBlLkxpdGU6XG4gICAgICBpZiAoIWRvd25ncmFkZWRNb2R1bGUgJiYgKGRvd25ncmFkZWRNb2R1bGVDb3VudCA+PSAyKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRXJyb3Igd2hpbGUgJHthdHRlbXB0ZWRBY3Rpb259OiAnZG93bmdyYWRlZE1vZHVsZScgbm90IHNwZWNpZmllZC5cXG5gICtcbiAgICAgICAgICAgICdUaGlzIGFwcGxpY2F0aW9uIGNvbnRhaW5zIG1vcmUgdGhhbiBvbmUgZG93bmdyYWRlZCBBbmd1bGFyIG1vZHVsZSwgdGh1cyB5b3UgbmVlZCB0byAnICtcbiAgICAgICAgICAgICdhbHdheXMgc3BlY2lmeSBcXCdkb3duZ3JhZGVkTW9kdWxlXFwnIHdoZW4gZG93bmdyYWRpbmcgY29tcG9uZW50cyBhbmQgaW5qZWN0YWJsZXMuJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghJGluamVjdG9yLmhhcyhpbmplY3Rpb25LZXkpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06IFVuYWJsZSB0byBmaW5kIHRoZSBzcGVjaWZpZWQgZG93bmdyYWRlZCBtb2R1bGUuXFxuYCArXG4gICAgICAgICAgICAnRGlkIHlvdSBmb3JnZXQgdG8gZG93bmdyYWRlIGFuIEFuZ3VsYXIgbW9kdWxlIG9yIGluY2x1ZGUgaXQgaW4gdGhlIEFuZ3VsYXJKUyAnICtcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbj8nKTtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXJyb3Igd2hpbGUgJHthdHRlbXB0ZWRBY3Rpb259OiBOb3QgYSB2YWxpZCAnQGFuZ3VsYXIvdXBncmFkZScgYXBwbGljYXRpb24uXFxuYCArXG4gICAgICAgICAgJ0RpZCB5b3UgZm9yZ2V0IHRvIGRvd25ncmFkZSBhbiBBbmd1bGFyIG1vZHVsZSBvciBpbmNsdWRlIGl0IGluIHRoZSBBbmd1bGFySlMgJyArXG4gICAgICAgICAgJ2FwcGxpY2F0aW9uPycpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZlcnJlZDxSPiB7XG4gIHByb21pc2U6IFByb21pc2U8Uj47XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICByZXNvbHZlICE6ICh2YWx1ZT86IFIgfCBQcm9taXNlTGlrZTxSPikgPT4gdm9pZDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlamVjdCAhOiAoZXJyb3I/OiBhbnkpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICB0aGlzLnJlc29sdmUgPSByZXM7XG4gICAgICB0aGlzLnJlamVjdCA9IHJlajtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExhenlNb2R1bGVSZWYge1xuICBpbmplY3Rvcj86IEluamVjdG9yO1xuICBwcm9taXNlPzogUHJvbWlzZTxJbmplY3Rvcj47XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFVwZ3JhZGVBcHBUeXBlIHtcbiAgLy8gQXBwIE5PVCB1c2luZyBgQGFuZ3VsYXIvdXBncmFkZWAuIChUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gaW4gYW4gYG5nVXBncmFkZWAgYXBwLilcbiAgTm9uZSxcblxuICAvLyBBcHAgdXNpbmcgdGhlIGRlcHJlY2F0ZWQgYEBhbmd1bGFyL3VwZ3JhZGVgIEFQSXMgKGEuay5hLiBkeW5hbWljIGBuZ1VwZ3JhZGVgKS5cbiAgRHluYW1pYyxcblxuICAvLyBBcHAgdXNpbmcgYEBhbmd1bGFyL3VwZ3JhZGUvc3RhdGljYCB3aXRoIGBVcGdyYWRlTW9kdWxlYC5cbiAgU3RhdGljLFxuXG4gIC8vIEFwcCB1c2luZyBAYW5ndWxhci91cGdyYWRlL3N0YXRpY2Agd2l0aCBgZG93bmdyYWRlTW9kdWxlKClgIChhLmsuYSBgbmdVcGdyYWRlYC1saXRlICkuXG4gIExpdGUsXG59XG5cbi8qKlxuICogQHJldHVybiBXaGV0aGVyIHRoZSBwYXNzZWQtaW4gY29tcG9uZW50IGltcGxlbWVudHMgdGhlIHN1YnNldCBvZiB0aGVcbiAqICAgICBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGludGVyZmFjZSBuZWVkZWQgZm9yIEFuZ3VsYXJKUyBgbmctbW9kZWxgXG4gKiAgICAgY29tcGF0aWJpbGl0eS5cbiAqL1xuZnVuY3Rpb24gc3VwcG9ydHNOZ01vZGVsKGNvbXBvbmVudDogYW55KSB7XG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LndyaXRlVmFsdWUgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIHR5cGVvZiBjb21wb25lbnQucmVnaXN0ZXJPbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBHbHVlIHRoZSBBbmd1bGFySlMgYE5nTW9kZWxDb250cm9sbGVyYCAoaWYgaXQgZXhpc3RzKSB0byB0aGUgY29tcG9uZW50XG4gKiAoaWYgaXQgaW1wbGVtZW50cyB0aGUgbmVlZGVkIHN1YnNldCBvZiB0aGUgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaG9va3VwTmdNb2RlbChuZ01vZGVsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciwgY29tcG9uZW50OiBhbnkpIHtcbiAgaWYgKG5nTW9kZWwgJiYgc3VwcG9ydHNOZ01vZGVsKGNvbXBvbmVudCkpIHtcbiAgICBuZ01vZGVsLiRyZW5kZXIgPSAoKSA9PiB7IGNvbXBvbmVudC53cml0ZVZhbHVlKG5nTW9kZWwuJHZpZXdWYWx1ZSk7IH07XG4gICAgY29tcG9uZW50LnJlZ2lzdGVyT25DaGFuZ2UobmdNb2RlbC4kc2V0Vmlld1ZhbHVlLmJpbmQobmdNb2RlbCkpO1xuICAgIGlmICh0eXBlb2YgY29tcG9uZW50LnJlZ2lzdGVyT25Ub3VjaGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb21wb25lbnQucmVnaXN0ZXJPblRvdWNoZWQobmdNb2RlbC4kc2V0VG91Y2hlZC5iaW5kKG5nTW9kZWwpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUZXN0IHR3byB2YWx1ZXMgZm9yIHN0cmljdCBlcXVhbGl0eSwgYWNjb3VudGluZyBmb3IgdGhlIGZhY3QgdGhhdCBgTmFOICE9PSBOYU5gLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaWN0RXF1YWxzKHZhbDE6IGFueSwgdmFsMjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWwxID09PSB2YWwyIHx8ICh2YWwxICE9PSB2YWwxICYmIHZhbDIgIT09IHZhbDIpO1xufVxuIl19