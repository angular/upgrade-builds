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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBV0EsdUJBQU0sdUJBQXVCLEdBQUcsb0JBQW9CLENBQUM7QUFDckQsdUJBQU0sOEJBQThCLEdBQUcsYUFBYSxDQUFDOzs7OztBQUVyRCxNQUFNLGtCQUFrQixDQUFNOztJQUU1QixJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7UUFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzNCO1NBQU07O1FBRUwsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3pCO0lBQ0QsTUFBTSxDQUFDLENBQUM7Q0FDVDs7Ozs7QUFFRCxNQUFNLHdCQUF3QixJQUFZO0lBQ3hDLE9BQU8sR0FBRyxHQUFHLElBQUksR0FBRyxZQUFZLENBQUM7Q0FDbEM7Ozs7O0FBRUQsTUFBTSw2QkFBNkIsSUFBWTtJQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxDQUFDO1NBQzNDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO0NBQ25GOzs7OztBQUVELE1BQU0sMkJBQTJCLFNBQW9COztJQUVuRCxPQUFPLG1CQUFDLFNBQWdCLEVBQUMsQ0FBQyxjQUFjLElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25HOzs7OztBQUVELE1BQU0scUJBQXFCLEtBQVU7SUFDbkMsT0FBTyxPQUFPLEtBQUssS0FBSyxVQUFVLENBQUM7Q0FDcEM7Ozs7QUFFRCxNQUFNO0lBT0o7UUFDRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1NBQ25CLENBQUMsQ0FBQztLQUNKO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWVELHlCQUF5QixTQUFjO0lBQ3JDLE9BQU8sT0FBTyxTQUFTLENBQUMsVUFBVSxLQUFLLFVBQVU7UUFDN0MsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLEtBQUssVUFBVSxDQUFDO0NBQ3REOzs7Ozs7OztBQU1ELE1BQU0sd0JBQXdCLE9BQW1DLEVBQUUsU0FBYztJQUMvRSxJQUFJLE9BQU8sSUFBSSxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDekMsT0FBTyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdEUsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxPQUFPLFNBQVMsQ0FBQyxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7WUFDckQsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDaEU7S0FDRjtDQUNGOzs7Ozs7O0FBS0QsTUFBTSx1QkFBdUIsSUFBUyxFQUFFLElBQVM7SUFDL0MsT0FBTyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7Q0FDMUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0b3IsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcblxuY29uc3QgRElSRUNUSVZFX1BSRUZJWF9SRUdFWFAgPSAvXig/Onh8ZGF0YSlbOlxcLV9dL2k7XG5jb25zdCBESVJFQ1RJVkVfU1BFQ0lBTF9DSEFSU19SRUdFWFAgPSAvWzpcXC1fXSsoLikvZztcblxuZXhwb3J0IGZ1bmN0aW9uIG9uRXJyb3IoZTogYW55KSB7XG4gIC8vIFRPRE86IChtaXNrbyk6IFdlIHNlZW0gdG8gbm90IGhhdmUgYSBzdGFjayB0cmFjZSBoZXJlIVxuICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoZSwgZS5zdGFjayk7XG4gIH0gZWxzZSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyhlLCBlLnN0YWNrKTtcbiAgfVxuICB0aHJvdyBlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udHJvbGxlcktleShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gJyQnICsgbmFtZSArICdDb250cm9sbGVyJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpcmVjdGl2ZU5vcm1hbGl6ZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKERJUkVDVElWRV9QUkVGSVhfUkVHRVhQLCAnJylcbiAgICAgIC5yZXBsYWNlKERJUkVDVElWRV9TUEVDSUFMX0NIQVJTX1JFR0VYUCwgKF8sIGxldHRlcikgPT4gbGV0dGVyLnRvVXBwZXJDYXNlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50TmFtZShjb21wb25lbnQ6IFR5cGU8YW55Pik6IHN0cmluZyB7XG4gIC8vIFJldHVybiB0aGUgbmFtZSBvZiB0aGUgY29tcG9uZW50IG9yIHRoZSBmaXJzdCBsaW5lIG9mIGl0cyBzdHJpbmdpZmllZCB2ZXJzaW9uLlxuICByZXR1cm4gKGNvbXBvbmVudCBhcyBhbnkpLm92ZXJyaWRkZW5OYW1lIHx8IGNvbXBvbmVudC5uYW1lIHx8IGNvbXBvbmVudC50b1N0cmluZygpLnNwbGl0KCdcXG4nKVswXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWU6IGFueSk6IHZhbHVlIGlzIEZ1bmN0aW9uIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZXhwb3J0IGNsYXNzIERlZmVycmVkPFI+IHtcbiAgcHJvbWlzZTogUHJvbWlzZTxSPjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlc29sdmUgITogKHZhbHVlPzogUiB8IFByb21pc2VMaWtlPFI+KSA9PiB2b2lkO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVqZWN0ICE6IChlcnJvcj86IGFueSkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlcztcbiAgICAgIHRoaXMucmVqZWN0ID0gcmVqO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGF6eU1vZHVsZVJlZiB7XG4gIC8vIFdoZXRoZXIgdGhlIEFuZ3VsYXJKUyBhcHAgaGFzIGJlZW4gYm9vdHN0cmFwcGVkIG91dHNpZGUgdGhlIEFuZ3VsYXIgem9uZVxuICAvLyAoaW4gd2hpY2ggY2FzZSBjYWxscyB0byBBbmd1bGFyIEFQSXMgbmVlZCB0byBiZSBicm91Z2h0IGJhY2sgaW4pLlxuICBuZWVkc05nWm9uZTogYm9vbGVhbjtcbiAgaW5qZWN0b3I/OiBJbmplY3RvcjtcbiAgcHJvbWlzZT86IFByb21pc2U8SW5qZWN0b3I+O1xufVxuXG4vKipcbiAqIEByZXR1cm4gV2hldGhlciB0aGUgcGFzc2VkLWluIGNvbXBvbmVudCBpbXBsZW1lbnRzIHRoZSBzdWJzZXQgb2YgdGhlXG4gKiAgICAgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UgbmVlZGVkIGZvciBBbmd1bGFySlMgYG5nLW1vZGVsYFxuICogICAgIGNvbXBhdGliaWxpdHkuXG4gKi9cbmZ1bmN0aW9uIHN1cHBvcnRzTmdNb2RlbChjb21wb25lbnQ6IGFueSkge1xuICByZXR1cm4gdHlwZW9mIGNvbXBvbmVudC53cml0ZVZhbHVlID09PSAnZnVuY3Rpb24nICYmXG4gICAgICB0eXBlb2YgY29tcG9uZW50LnJlZ2lzdGVyT25DaGFuZ2UgPT09ICdmdW5jdGlvbic7XG59XG5cbi8qKlxuICogR2x1ZSB0aGUgQW5ndWxhckpTIGBOZ01vZGVsQ29udHJvbGxlcmAgKGlmIGl0IGV4aXN0cykgdG8gdGhlIGNvbXBvbmVudFxuICogKGlmIGl0IGltcGxlbWVudHMgdGhlIG5lZWRlZCBzdWJzZXQgb2YgdGhlIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgaW50ZXJmYWNlKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGhvb2t1cE5nTW9kZWwobmdNb2RlbDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIsIGNvbXBvbmVudDogYW55KSB7XG4gIGlmIChuZ01vZGVsICYmIHN1cHBvcnRzTmdNb2RlbChjb21wb25lbnQpKSB7XG4gICAgbmdNb2RlbC4kcmVuZGVyID0gKCkgPT4geyBjb21wb25lbnQud3JpdGVWYWx1ZShuZ01vZGVsLiR2aWV3VmFsdWUpOyB9O1xuICAgIGNvbXBvbmVudC5yZWdpc3Rlck9uQ2hhbmdlKG5nTW9kZWwuJHNldFZpZXdWYWx1ZS5iaW5kKG5nTW9kZWwpKTtcbiAgICBpZiAodHlwZW9mIGNvbXBvbmVudC5yZWdpc3Rlck9uVG91Y2hlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29tcG9uZW50LnJlZ2lzdGVyT25Ub3VjaGVkKG5nTW9kZWwuJHNldFRvdWNoZWQuYmluZChuZ01vZGVsKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGVzdCB0d28gdmFsdWVzIGZvciBzdHJpY3QgZXF1YWxpdHksIGFjY291bnRpbmcgZm9yIHRoZSBmYWN0IHRoYXQgYE5hTiAhPT0gTmFOYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmljdEVxdWFscyh2YWwxOiBhbnksIHZhbDI6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gdmFsMSA9PT0gdmFsMiB8fCAodmFsMSAhPT0gdmFsMSAmJiB2YWwyICE9PSB2YWwyKTtcbn1cbiJdfQ==