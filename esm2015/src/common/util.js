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
const /** @type {?} */ DIRECTIVE_PREFIX_REGEXP = /^(?:x|data)[:\-_]/i;
const /** @type {?} */ DIRECTIVE_SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;
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
 * @param {?} node
 * @return {?}
 */
export function getAttributesAsArray(node) {
    const /** @type {?} */ attributes = node.attributes;
    let /** @type {?} */ asArray = /** @type {?} */ ((undefined));
    if (attributes) {
        let /** @type {?} */ attrLen = attributes.length;
        asArray = new Array(attrLen);
        for (let /** @type {?} */ i = 0; i < attrLen; i++) {
            asArray[i] = [attributes[i].nodeName, /** @type {?} */ ((attributes[i].nodeValue))];
        }
    }
    return asArray || [];
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
function Deferred_tsickle_Closure_declarations() {
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
function LazyModuleRef_tsickle_Closure_declarations() {
    /** @type {?} */
    LazyModuleRef.prototype.needsNgZone;
    /** @type {?|undefined} */
    LazyModuleRef.prototype.injector;
    /** @type {?|undefined} */
    LazyModuleRef.prototype.promise;
}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBV0EsdUJBQU0sdUJBQXVCLEdBQUcsb0JBQW9CLENBQUM7QUFDckQsdUJBQU0sOEJBQThCLEdBQUcsYUFBYSxDQUFDOzs7OztBQUVyRCxNQUFNLGtCQUFrQixDQUFNOztJQUU1QixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDM0I7SUFBQyxJQUFJLENBQUMsQ0FBQzs7UUFFTixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekI7SUFDRCxNQUFNLENBQUMsQ0FBQztDQUNUOzs7OztBQUVELE1BQU0sd0JBQXdCLElBQVk7SUFDeEMsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsWUFBWSxDQUFDO0NBQ2xDOzs7OztBQUVELE1BQU0sNkJBQTZCLElBQVk7SUFDN0MsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxDQUFDO1NBQzNDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0NBQ25GOzs7OztBQUVELE1BQU0sK0JBQStCLElBQVU7SUFDN0MsdUJBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDbkMscUJBQUksT0FBTyxzQkFBdUIsU0FBUyxFQUFFLENBQUM7SUFDOUMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNmLHFCQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBQ2hDLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsQ0FBQyxxQkFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNqQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxxQkFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUM7U0FDbEU7S0FDRjtJQUNELE1BQU0sQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO0NBQ3RCOzs7OztBQUVELE1BQU0sMkJBQTJCLFNBQW9COztJQUVuRCxNQUFNLENBQUMsbUJBQUMsU0FBZ0IsRUFBQyxDQUFDLGNBQWMsSUFBSSxTQUFTLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FDbkc7Ozs7O0FBRUQsTUFBTSxxQkFBcUIsS0FBVTtJQUNuQyxNQUFNLENBQUMsT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDO0NBQ3BDOzs7O0FBRUQsTUFBTTtJQUtKO1FBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztTQUNuQixDQUFDLENBQUM7S0FDSjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFlRCx5QkFBeUIsU0FBYztJQUNyQyxNQUFNLENBQUMsT0FBTyxTQUFTLENBQUMsVUFBVSxLQUFLLFVBQVU7UUFDN0MsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLEtBQUssVUFBVSxDQUFDO0NBQ3REOzs7Ozs7OztBQU1ELE1BQU0sd0JBQXdCLE9BQW1DLEVBQUUsU0FBYztJQUMvRSxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN0RSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNoRSxFQUFFLENBQUMsQ0FBQyxPQUFPLFNBQVMsQ0FBQyxpQkFBaUIsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3RELFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2hFO0tBQ0Y7Q0FDRjs7Ozs7OztBQUtELE1BQU0sdUJBQXVCLElBQVMsRUFBRSxJQUFTO0lBQy9DLE1BQU0sQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7Q0FDMUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcblxuY29uc3QgRElSRUNUSVZFX1BSRUZJWF9SRUdFWFAgPSAvXig/Onh8ZGF0YSlbOlxcLV9dL2k7XG5jb25zdCBESVJFQ1RJVkVfU1BFQ0lBTF9DSEFSU19SRUdFWFAgPSAvWzpcXC1fXSsoLikvZztcblxuZXhwb3J0IGZ1bmN0aW9uIG9uRXJyb3IoZTogYW55KSB7XG4gIC8vIFRPRE86IChtaXNrbyk6IFdlIHNlZW0gdG8gbm90IGhhdmUgYSBzdGFjayB0cmFjZSBoZXJlIVxuICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoZSwgZS5zdGFjayk7XG4gIH0gZWxzZSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyhlLCBlLnN0YWNrKTtcbiAgfVxuICB0aHJvdyBlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udHJvbGxlcktleShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gJyQnICsgbmFtZSArICdDb250cm9sbGVyJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpcmVjdGl2ZU5vcm1hbGl6ZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKERJUkVDVElWRV9QUkVGSVhfUkVHRVhQLCAnJylcbiAgICAgIC5yZXBsYWNlKERJUkVDVElWRV9TUEVDSUFMX0NIQVJTX1JFR0VYUCwgKF8sIGxldHRlcikgPT4gbGV0dGVyLnRvVXBwZXJDYXNlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXR0cmlidXRlc0FzQXJyYXkobm9kZTogTm9kZSk6IFtzdHJpbmcsIHN0cmluZ11bXSB7XG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSBub2RlLmF0dHJpYnV0ZXM7XG4gIGxldCBhc0FycmF5OiBbc3RyaW5nLCBzdHJpbmddW10gPSB1bmRlZmluZWQgITtcbiAgaWYgKGF0dHJpYnV0ZXMpIHtcbiAgICBsZXQgYXR0ckxlbiA9IGF0dHJpYnV0ZXMubGVuZ3RoO1xuICAgIGFzQXJyYXkgPSBuZXcgQXJyYXkoYXR0ckxlbik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyTGVuOyBpKyspIHtcbiAgICAgIGFzQXJyYXlbaV0gPSBbYXR0cmlidXRlc1tpXS5ub2RlTmFtZSwgYXR0cmlidXRlc1tpXS5ub2RlVmFsdWUgIV07XG4gICAgfVxuICB9XG4gIHJldHVybiBhc0FycmF5IHx8IFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50TmFtZShjb21wb25lbnQ6IFR5cGU8YW55Pik6IHN0cmluZyB7XG4gIC8vIFJldHVybiB0aGUgbmFtZSBvZiB0aGUgY29tcG9uZW50IG9yIHRoZSBmaXJzdCBsaW5lIG9mIGl0cyBzdHJpbmdpZmllZCB2ZXJzaW9uLlxuICByZXR1cm4gKGNvbXBvbmVudCBhcyBhbnkpLm92ZXJyaWRkZW5OYW1lIHx8IGNvbXBvbmVudC5uYW1lIHx8IGNvbXBvbmVudC50b1N0cmluZygpLnNwbGl0KCdcXG4nKVswXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWU6IGFueSk6IHZhbHVlIGlzIEZ1bmN0aW9uIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZXhwb3J0IGNsYXNzIERlZmVycmVkPFI+IHtcbiAgcHJvbWlzZTogUHJvbWlzZTxSPjtcbiAgcmVzb2x2ZTogKHZhbHVlPzogUnxQcm9taXNlTGlrZTxSPikgPT4gdm9pZDtcbiAgcmVqZWN0OiAoZXJyb3I/OiBhbnkpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICB0aGlzLnJlc29sdmUgPSByZXM7XG4gICAgICB0aGlzLnJlamVjdCA9IHJlajtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExhenlNb2R1bGVSZWYge1xuICAvLyBXaGV0aGVyIHRoZSBBbmd1bGFySlMgYXBwIGhhcyBiZWVuIGJvb3RzdHJhcHBlZCBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmVcbiAgLy8gKGluIHdoaWNoIGNhc2UgY2FsbHMgdG8gQW5ndWxhciBBUElzIG5lZWQgdG8gYmUgYnJvdWdodCBiYWNrIGluKS5cbiAgbmVlZHNOZ1pvbmU6IGJvb2xlYW47XG4gIGluamVjdG9yPzogSW5qZWN0b3I7XG4gIHByb21pc2U/OiBQcm9taXNlPEluamVjdG9yPjtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHBhc3NlZC1pbiBjb21wb25lbnQgaW1wbGVtZW50cyB0aGUgc3Vic2V0IG9mIHRoZVxuICogICAgIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgaW50ZXJmYWNlIG5lZWRlZCBmb3IgQW5ndWxhckpTIGBuZy1tb2RlbGBcbiAqICAgICBjb21wYXRpYmlsaXR5LlxuICovXG5mdW5jdGlvbiBzdXBwb3J0c05nTW9kZWwoY29tcG9uZW50OiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjb21wb25lbnQud3JpdGVWYWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIGNvbXBvbmVudC5yZWdpc3Rlck9uQ2hhbmdlID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEdsdWUgdGhlIEFuZ3VsYXJKUyBgTmdNb2RlbENvbnRyb2xsZXJgIChpZiBpdCBleGlzdHMpIHRvIHRoZSBjb21wb25lbnRcbiAqIChpZiBpdCBpbXBsZW1lbnRzIHRoZSBuZWVkZWQgc3Vic2V0IG9mIHRoZSBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGludGVyZmFjZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBob29rdXBOZ01vZGVsKG5nTW9kZWw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyLCBjb21wb25lbnQ6IGFueSkge1xuICBpZiAobmdNb2RlbCAmJiBzdXBwb3J0c05nTW9kZWwoY29tcG9uZW50KSkge1xuICAgIG5nTW9kZWwuJHJlbmRlciA9ICgpID0+IHsgY29tcG9uZW50LndyaXRlVmFsdWUobmdNb2RlbC4kdmlld1ZhbHVlKTsgfTtcbiAgICBjb21wb25lbnQucmVnaXN0ZXJPbkNoYW5nZShuZ01vZGVsLiRzZXRWaWV3VmFsdWUuYmluZChuZ01vZGVsKSk7XG4gICAgaWYgKHR5cGVvZiBjb21wb25lbnQucmVnaXN0ZXJPblRvdWNoZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBvbmVudC5yZWdpc3Rlck9uVG91Y2hlZChuZ01vZGVsLiRzZXRUb3VjaGVkLmJpbmQobmdNb2RlbCkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRlc3QgdHdvIHZhbHVlcyBmb3Igc3RyaWN0IGVxdWFsaXR5LCBhY2NvdW50aW5nIGZvciB0aGUgZmFjdCB0aGF0IGBOYU4gIT09IE5hTmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpY3RFcXVhbHModmFsMTogYW55LCB2YWwyOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbDEgPT09IHZhbDIgfHwgKHZhbDEgIT09IHZhbDEgJiYgdmFsMiAhPT0gdmFsMik7XG59XG4iXX0=