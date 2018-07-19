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
 * @param {?} component
 * @return {?}
 */
export function getComponentName(component) {
    // Return the name of the component or the first line of its stringified version.
    return (/** @type {?} */ (component)).overriddenName || component.name || component.toString().split('\n')[0];
}
/**
 * @param {?} value
 * @return {?}
 */
export function isFunction(value) {
    return typeof value === 'function';
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
/** @type {?} */
LazyModuleRef.prototype.needsNgZone;
/** @type {?|undefined} */
LazyModuleRef.prototype.injector;
/** @type {?|undefined} */
LazyModuleRef.prototype.promise;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVdBLE1BQU0sdUJBQXVCLEdBQUcsb0JBQW9CLENBQUM7O0FBQ3JELE1BQU0sOEJBQThCLEdBQUcsYUFBYSxDQUFDOzs7OztBQUVyRCxNQUFNLGtCQUFrQixDQUFNOztJQUU1QixJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7UUFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzNCO1NBQU07O1FBRUwsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3pCO0lBQ0QsTUFBTSxDQUFDLENBQUM7Q0FDVDs7Ozs7QUFFRCxNQUFNLHdCQUF3QixJQUFZO0lBQ3hDLE9BQU8sR0FBRyxHQUFHLElBQUksR0FBRyxZQUFZLENBQUM7Q0FDbEM7Ozs7O0FBRUQsTUFBTSw2QkFBNkIsSUFBWTtJQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxDQUFDO1NBQzNDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0NBQ25GOzs7OztBQUVELE1BQU0sMkJBQTJCLFNBQW9COztJQUVuRCxPQUFPLG1CQUFDLFNBQWdCLEVBQUMsQ0FBQyxjQUFjLElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25HOzs7OztBQUVELE1BQU0scUJBQXFCLEtBQVU7SUFDbkMsT0FBTyxPQUFPLEtBQUssS0FBSyxVQUFVLENBQUM7Q0FDcEM7Ozs7QUFFRCxNQUFNO0lBT0o7UUFDRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ25CLENBQUMsQ0FBQztLQUNKO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlRCx5QkFBeUIsU0FBYztJQUNyQyxPQUFPLE9BQU8sU0FBUyxDQUFDLFVBQVUsS0FBSyxVQUFVO1FBQzdDLE9BQU8sU0FBUyxDQUFDLGdCQUFnQixLQUFLLFVBQVUsQ0FBQztDQUN0RDs7Ozs7Ozs7QUFNRCxNQUFNLHdCQUF3QixPQUFtQyxFQUFFLFNBQWM7SUFDL0UsSUFBSSxPQUFPLElBQUksZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ3pDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3RFLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLElBQUksT0FBTyxTQUFTLENBQUMsaUJBQWlCLEtBQUssVUFBVSxFQUFFO1lBQ3JELFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2hFO0tBQ0Y7Q0FDRjs7Ozs7OztBQUtELE1BQU0sdUJBQXVCLElBQVMsRUFBRSxJQUFTO0lBQy9DLE9BQU8sSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO0NBQzFEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5cbmNvbnN0IERJUkVDVElWRV9QUkVGSVhfUkVHRVhQID0gL14oPzp4fGRhdGEpWzpcXC1fXS9pO1xuY29uc3QgRElSRUNUSVZFX1NQRUNJQUxfQ0hBUlNfUkVHRVhQID0gL1s6XFwtX10rKC4pL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbkVycm9yKGU6IGFueSkge1xuICAvLyBUT0RPOiAobWlza28pOiBXZSBzZWVtIHRvIG5vdCBoYXZlIGEgc3RhY2sgdHJhY2UgaGVyZSFcbiAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGUsIGUuc3RhY2spO1xuICB9IGVsc2Uge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2coZSwgZS5zdGFjayk7XG4gIH1cbiAgdGhyb3cgZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRyb2xsZXJLZXkobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuICckJyArIG5hbWUgKyAnQ29udHJvbGxlcic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXJlY3RpdmVOb3JtYWxpemUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5hbWUucmVwbGFjZShESVJFQ1RJVkVfUFJFRklYX1JFR0VYUCwgJycpXG4gICAgICAucmVwbGFjZShESVJFQ1RJVkVfU1BFQ0lBTF9DSEFSU19SRUdFWFAsIChfLCBsZXR0ZXIpID0+IGxldHRlci50b1VwcGVyQ2FzZSgpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBvbmVudE5hbWUoY29tcG9uZW50OiBUeXBlPGFueT4pOiBzdHJpbmcge1xuICAvLyBSZXR1cm4gdGhlIG5hbWUgb2YgdGhlIGNvbXBvbmVudCBvciB0aGUgZmlyc3QgbGluZSBvZiBpdHMgc3RyaW5naWZpZWQgdmVyc2lvbi5cbiAgcmV0dXJuIChjb21wb25lbnQgYXMgYW55KS5vdmVycmlkZGVuTmFtZSB8fCBjb21wb25lbnQubmFtZSB8fCBjb21wb25lbnQudG9TdHJpbmcoKS5zcGxpdCgnXFxuJylbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBGdW5jdGlvbiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBjbGFzcyBEZWZlcnJlZDxSPiB7XG4gIHByb21pc2U6IFByb21pc2U8Uj47XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICByZXNvbHZlICE6ICh2YWx1ZT86IFIgfCBQcm9taXNlTGlrZTxSPikgPT4gdm9pZDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlamVjdCAhOiAoZXJyb3I/OiBhbnkpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICB0aGlzLnJlc29sdmUgPSByZXM7XG4gICAgICB0aGlzLnJlamVjdCA9IHJlajtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExhenlNb2R1bGVSZWYge1xuICAvLyBXaGV0aGVyIHRoZSBBbmd1bGFySlMgYXBwIGhhcyBiZWVuIGJvb3RzdHJhcHBlZCBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmVcbiAgLy8gKGluIHdoaWNoIGNhc2UgY2FsbHMgdG8gQW5ndWxhciBBUElzIG5lZWQgdG8gYmUgYnJvdWdodCBiYWNrIGluKS5cbiAgbmVlZHNOZ1pvbmU6IGJvb2xlYW47XG4gIGluamVjdG9yPzogSW5qZWN0b3I7XG4gIHByb21pc2U/OiBQcm9taXNlPEluamVjdG9yPjtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHBhc3NlZC1pbiBjb21wb25lbnQgaW1wbGVtZW50cyB0aGUgc3Vic2V0IG9mIHRoZVxuICogICAgIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgaW50ZXJmYWNlIG5lZWRlZCBmb3IgQW5ndWxhckpTIGBuZy1tb2RlbGBcbiAqICAgICBjb21wYXRpYmlsaXR5LlxuICovXG5mdW5jdGlvbiBzdXBwb3J0c05nTW9kZWwoY29tcG9uZW50OiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjb21wb25lbnQud3JpdGVWYWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIGNvbXBvbmVudC5yZWdpc3Rlck9uQ2hhbmdlID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEdsdWUgdGhlIEFuZ3VsYXJKUyBgTmdNb2RlbENvbnRyb2xsZXJgIChpZiBpdCBleGlzdHMpIHRvIHRoZSBjb21wb25lbnRcbiAqIChpZiBpdCBpbXBsZW1lbnRzIHRoZSBuZWVkZWQgc3Vic2V0IG9mIHRoZSBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGludGVyZmFjZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBob29rdXBOZ01vZGVsKG5nTW9kZWw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyLCBjb21wb25lbnQ6IGFueSkge1xuICBpZiAobmdNb2RlbCAmJiBzdXBwb3J0c05nTW9kZWwoY29tcG9uZW50KSkge1xuICAgIG5nTW9kZWwuJHJlbmRlciA9ICgpID0+IHsgY29tcG9uZW50LndyaXRlVmFsdWUobmdNb2RlbC4kdmlld1ZhbHVlKTsgfTtcbiAgICBjb21wb25lbnQucmVnaXN0ZXJPbkNoYW5nZShuZ01vZGVsLiRzZXRWaWV3VmFsdWUuYmluZChuZ01vZGVsKSk7XG4gICAgaWYgKHR5cGVvZiBjb21wb25lbnQucmVnaXN0ZXJPblRvdWNoZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBvbmVudC5yZWdpc3Rlck9uVG91Y2hlZChuZ01vZGVsLiRzZXRUb3VjaGVkLmJpbmQobmdNb2RlbCkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRlc3QgdHdvIHZhbHVlcyBmb3Igc3RyaWN0IGVxdWFsaXR5LCBhY2NvdW50aW5nIGZvciB0aGUgZmFjdCB0aGF0IGBOYU4gIT09IE5hTmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpY3RFcXVhbHModmFsMTogYW55LCB2YWwyOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbDEgPT09IHZhbDIgfHwgKHZhbDEgIT09IHZhbDEgJiYgdmFsMiAhPT0gdmFsMik7XG59XG4iXX0=