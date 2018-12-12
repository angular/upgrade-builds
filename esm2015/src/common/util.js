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
    /** @type {?} */
    LazyModuleRef.prototype.needsNgZone;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBVUEsT0FBTyxFQUFDLDJCQUEyQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sYUFBYSxDQUFDOztNQUV4RSx1QkFBdUIsR0FBRyxvQkFBb0I7O01BQzlDLDhCQUE4QixHQUFHLGFBQWE7Ozs7O0FBRXBELE1BQU0sVUFBVSxPQUFPLENBQUMsQ0FBTTtJQUM1Qix5REFBeUQ7SUFDekQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMzQjtTQUFNO1FBQ0wsc0NBQXNDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6QjtJQUNELE1BQU0sQ0FBQyxDQUFDO0FBQ1YsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUFDLElBQVk7SUFDeEMsT0FBTyxHQUFHLEdBQUcsSUFBSSxHQUFHLFlBQVksQ0FBQztBQUNuQyxDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxJQUFZO0lBQzdDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLENBQUM7U0FDM0MsT0FBTyxDQUFDLDhCQUE4QixFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDcEYsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFDLElBQWU7SUFDekMsNEVBQTRFO0lBQzVFLE9BQU8sQ0FBQyxtQkFBQSxJQUFJLEVBQU8sQ0FBQyxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElB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SUFBSSxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDekMsT0FBTyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLE9BQU8sU0FBUyxDQUFDLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtZQUNyRCxTQUFTLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNoRTtLQUNGO0FBQ0gsQ0FBQzs7Ozs7OztBQUtELE1BQU0sVUFBVSxZQUFZLENBQUMsSUFBUyxFQUFFLElBQVM7SUFDL0MsT0FBTyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDM0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RvciwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHtET1dOR1JBREVEX01PRFVMRV9DT1VOVF9LRVksIFVQR1JBREVfQVBQX1RZUEVfS0VZfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNvbnN0IERJUkVDVElWRV9QUkVGSVhfUkVHRVhQID0gL14oPzp4fGRhdGEpWzpcXC1fXS9pO1xuY29uc3QgRElSRUNUSVZFX1NQRUNJQUxfQ0hBUlNfUkVHRVhQID0gL1s6XFwtX10rKC4pL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbkVycm9yKGU6IGFueSkge1xuICAvLyBUT0RPOiAobWlza28pOiBXZSBzZWVtIHRvIG5vdCBoYXZlIGEgc3RhY2sgdHJhY2UgaGVyZSFcbiAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGUsIGUuc3RhY2spO1xuICB9IGVsc2Uge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2coZSwgZS5zdGFjayk7XG4gIH1cbiAgdGhyb3cgZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRyb2xsZXJLZXkobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuICckJyArIG5hbWUgKyAnQ29udHJvbGxlcic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXJlY3RpdmVOb3JtYWxpemUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5hbWUucmVwbGFjZShESVJFQ1RJVkVfUFJFRklYX1JFR0VYUCwgJycpXG4gICAgICAucmVwbGFjZShESVJFQ1RJVkVfU1BFQ0lBTF9DSEFSU19SRUdFWFAsIChfLCBsZXR0ZXIpID0+IGxldHRlci50b1VwcGVyQ2FzZSgpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVOYW1lKHR5cGU6IFR5cGU8YW55Pik6IHN0cmluZyB7XG4gIC8vIFJldHVybiB0aGUgbmFtZSBvZiB0aGUgdHlwZSBvciB0aGUgZmlyc3QgbGluZSBvZiBpdHMgc3RyaW5naWZpZWQgdmVyc2lvbi5cbiAgcmV0dXJuICh0eXBlIGFzIGFueSkub3ZlcnJpZGRlbk5hbWUgfHwgdHlwZS5uYW1lIHx8IHR5cGUudG9TdHJpbmcoKS5zcGxpdCgnXFxuJylbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpOiBudW1iZXIge1xuICByZXR1cm4gJGluamVjdG9yLmhhcyhET1dOR1JBREVEX01PRFVMRV9DT1VOVF9LRVkpID8gJGluamVjdG9yLmdldChET1dOR1JBREVEX01PRFVMRV9DT1VOVF9LRVkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVcGdyYWRlQXBwVHlwZSgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSk6IFVwZ3JhZGVBcHBUeXBlIHtcbiAgcmV0dXJuICRpbmplY3Rvci5oYXMoVVBHUkFERV9BUFBfVFlQRV9LRVkpID8gJGluamVjdG9yLmdldChVUEdSQURFX0FQUF9UWVBFX0tFWSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVcGdyYWRlQXBwVHlwZS5Ob25lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZTogYW55KTogdmFsdWUgaXMgRnVuY3Rpb24ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVJbmplY3Rpb25LZXkoXG4gICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsIGRvd25ncmFkZWRNb2R1bGU6IHN0cmluZywgaW5qZWN0aW9uS2V5OiBzdHJpbmcsXG4gICAgYXR0ZW1wdGVkQWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgdXBncmFkZUFwcFR5cGUgPSBnZXRVcGdyYWRlQXBwVHlwZSgkaW5qZWN0b3IpO1xuICBjb25zdCBkb3duZ3JhZGVkTW9kdWxlQ291bnQgPSBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQoJGluamVjdG9yKTtcblxuICAvLyBDaGVjayBmb3IgY29tbW9uIGVycm9ycy5cbiAgc3dpdGNoICh1cGdyYWRlQXBwVHlwZSkge1xuICAgIGNhc2UgVXBncmFkZUFwcFR5cGUuRHluYW1pYzpcbiAgICBjYXNlIFVwZ3JhZGVBcHBUeXBlLlN0YXRpYzpcbiAgICAgIGlmIChkb3duZ3JhZGVkTW9kdWxlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06ICdkb3duZ3JhZGVkTW9kdWxlJyB1bmV4cGVjdGVkbHkgc3BlY2lmaWVkLlxcbmAgK1xuICAgICAgICAgICAgJ1lvdSBzaG91bGQgbm90IHNwZWNpZnkgYSB2YWx1ZSBmb3IgXFwnZG93bmdyYWRlZE1vZHVsZVxcJywgdW5sZXNzIHlvdSBhcmUgZG93bmdyYWRpbmcgJyArXG4gICAgICAgICAgICAnbW9yZSB0aGFuIG9uZSBBbmd1bGFyIG1vZHVsZSAodmlhIFxcJ2Rvd25ncmFkZU1vZHVsZSgpXFwnKS4nKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgVXBncmFkZUFwcFR5cGUuTGl0ZTpcbiAgICAgIGlmICghZG93bmdyYWRlZE1vZHVsZSAmJiAoZG93bmdyYWRlZE1vZHVsZUNvdW50ID49IDIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06ICdkb3duZ3JhZGVkTW9kdWxlJyBub3Qgc3BlY2lmaWVkLlxcbmAgK1xuICAgICAgICAgICAgJ1RoaXMgYXBwbGljYXRpb24gY29udGFpbnMgbW9yZSB0aGFuIG9uZSBkb3duZ3JhZGVkIEFuZ3VsYXIgbW9kdWxlLCB0aHVzIHlvdSBuZWVkIHRvICcgK1xuICAgICAgICAgICAgJ2Fsd2F5cyBzcGVjaWZ5IFxcJ2Rvd25ncmFkZWRNb2R1bGVcXCcgd2hlbiBkb3duZ3JhZGluZyBjb21wb25lbnRzIGFuZCBpbmplY3RhYmxlcy4nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEkaW5qZWN0b3IuaGFzKGluamVjdGlvbktleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogVW5hYmxlIHRvIGZpbmQgdGhlIHNwZWNpZmllZCBkb3duZ3JhZGVkIG1vZHVsZS5cXG5gICtcbiAgICAgICAgICAgICdEaWQgeW91IGZvcmdldCB0byBkb3duZ3JhZGUgYW4gQW5ndWxhciBtb2R1bGUgb3IgaW5jbHVkZSBpdCBpbiB0aGUgQW5ndWxhckpTICcgK1xuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uPycpO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06IE5vdCBhIHZhbGlkICdAYW5ndWxhci91cGdyYWRlJyBhcHBsaWNhdGlvbi5cXG5gICtcbiAgICAgICAgICAnRGlkIHlvdSBmb3JnZXQgdG8gZG93bmdyYWRlIGFuIEFuZ3VsYXIgbW9kdWxlIG9yIGluY2x1ZGUgaXQgaW4gdGhlIEFuZ3VsYXJKUyAnICtcbiAgICAgICAgICAnYXBwbGljYXRpb24/Jyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmVycmVkPFI+IHtcbiAgcHJvbWlzZTogUHJvbWlzZTxSPjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlc29sdmUgITogKHZhbHVlPzogUiB8IFByb21pc2VMaWtlPFI+KSA9PiB2b2lkO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVqZWN0ICE6IChlcnJvcj86IGFueSkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlcztcbiAgICAgIHRoaXMucmVqZWN0ID0gcmVqO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGF6eU1vZHVsZVJlZiB7XG4gIC8vIFdoZXRoZXIgdGhlIEFuZ3VsYXJKUyBhcHAgaGFzIGJlZW4gYm9vdHN0cmFwcGVkIG91dHNpZGUgdGhlIEFuZ3VsYXIgem9uZVxuICAvLyAoaW4gd2hpY2ggY2FzZSBjYWxscyB0byBBbmd1bGFyIEFQSXMgbmVlZCB0byBiZSBicm91Z2h0IGJhY2sgaW4pLlxuICBuZWVkc05nWm9uZTogYm9vbGVhbjtcbiAgaW5qZWN0b3I/OiBJbmplY3RvcjtcbiAgcHJvbWlzZT86IFByb21pc2U8SW5qZWN0b3I+O1xufVxuXG5leHBvcnQgY29uc3QgZW51bSBVcGdyYWRlQXBwVHlwZSB7XG4gIC8vIEFwcCBOT1QgdXNpbmcgYEBhbmd1bGFyL3VwZ3JhZGVgLiAoVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuIGluIGFuIGBuZ1VwZ3JhZGVgIGFwcC4pXG4gIE5vbmUsXG5cbiAgLy8gQXBwIHVzaW5nIHRoZSBkZXByZWNhdGVkIGBAYW5ndWxhci91cGdyYWRlYCBBUElzIChhLmsuYS4gZHluYW1pYyBgbmdVcGdyYWRlYCkuXG4gIER5bmFtaWMsXG5cbiAgLy8gQXBwIHVzaW5nIGBAYW5ndWxhci91cGdyYWRlL3N0YXRpY2Agd2l0aCBgVXBncmFkZU1vZHVsZWAuXG4gIFN0YXRpYyxcblxuICAvLyBBcHAgdXNpbmcgQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWNgIHdpdGggYGRvd25ncmFkZU1vZHVsZSgpYCAoYS5rLmEgYG5nVXBncmFkZWAtbGl0ZSApLlxuICBMaXRlLFxufVxuXG4vKipcbiAqIEByZXR1cm4gV2hldGhlciB0aGUgcGFzc2VkLWluIGNvbXBvbmVudCBpbXBsZW1lbnRzIHRoZSBzdWJzZXQgb2YgdGhlXG4gKiAgICAgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UgbmVlZGVkIGZvciBBbmd1bGFySlMgYG5nLW1vZGVsYFxuICogICAgIGNvbXBhdGliaWxpdHkuXG4gKi9cbmZ1bmN0aW9uIHN1cHBvcnRzTmdNb2RlbChjb21wb25lbnQ6IGFueSkge1xuICByZXR1cm4gdHlwZW9mIGNvbXBvbmVudC53cml0ZVZhbHVlID09PSAnZnVuY3Rpb24nICYmXG4gICAgICB0eXBlb2YgY29tcG9uZW50LnJlZ2lzdGVyT25DaGFuZ2UgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogR2x1ZSB0aGUgQW5ndWxhckpTIGBOZ01vZGVsQ29udHJvbGxlcmAgKGlmIGl0IGV4aXN0cykgdG8gdGhlIGNvbXBvbmVudFxuICogKGlmIGl0IGltcGxlbWVudHMgdGhlIG5lZWRlZCBzdWJzZXQgb2YgdGhlIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgaW50ZXJmYWNlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhvb2t1cE5nTW9kZWwobmdNb2RlbDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIsIGNvbXBvbmVudDogYW55KSB7XG4gIGlmIChuZ01vZGVsICYmIHN1cHBvcnRzTmdNb2RlbChjb21wb25lbnQpKSB7XG4gICAgbmdNb2RlbC4kcmVuZGVyID0gKCkgPT4geyBjb21wb25lbnQud3JpdGVWYWx1ZShuZ01vZGVsLiR2aWV3VmFsdWUpOyB9O1xuICAgIGNvbXBvbmVudC5yZWdpc3Rlck9uQ2hhbmdlKG5nTW9kZWwuJHNldFZpZXdWYWx1ZS5iaW5kKG5nTW9kZWwpKTtcbiAgICBpZiAodHlwZW9mIGNvbXBvbmVudC5yZWdpc3Rlck9uVG91Y2hlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcG9uZW50LnJlZ2lzdGVyT25Ub3VjaGVkKG5nTW9kZWwuJHNldFRvdWNoZWQuYmluZChuZ01vZGVsKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGVzdCB0d28gdmFsdWVzIGZvciBzdHJpY3QgZXF1YWxpdHksIGFjY291bnRpbmcgZm9yIHRoZSBmYWN0IHRoYXQgYE5hTiAhPT0gTmFOYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmljdEVxdWFscyh2YWwxOiBhbnksIHZhbDI6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsMSA9PT0gdmFsMiB8fCAodmFsMSAhPT0gdmFsMSAmJiB2YWwyICE9PSB2YWwyKTtcbn1cbiJdfQ==