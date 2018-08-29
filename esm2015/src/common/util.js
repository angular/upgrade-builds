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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQVdBLE1BQU0sdUJBQXVCLEdBQUcsb0JBQW9CLENBQUM7O0FBQ3JELE1BQU0sOEJBQThCLEdBQUcsYUFBYSxDQUFDOzs7OztBQUVyRCxNQUFNLFVBQVUsT0FBTyxDQUFDLENBQU07O0lBRTVCLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDM0I7U0FBTTs7UUFFTCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekI7SUFDRCxNQUFNLENBQUMsQ0FBQztDQUNUOzs7OztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsSUFBWTtJQUN4QyxPQUFPLEdBQUcsR0FBRyxJQUFJLEdBQUcsWUFBWSxDQUFDO0NBQ2xDOzs7OztBQUVELE1BQU0sVUFBVSxrQkFBa0IsQ0FBQyxJQUFZO0lBQzdDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLENBQUM7U0FDM0MsT0FBTyxDQUFDLDhCQUE4QixFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Q0FDbkY7Ozs7O0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLFNBQW9COztJQUVuRCxPQUFPLG1CQUFDLFNBQWdCLEVBQUMsQ0FBQyxjQUFjLElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25HOzs7OztBQUVELE1BQU0sVUFBVSxVQUFVLENBQUMsS0FBVTtJQUNuQyxPQUFPLE9BQU8sS0FBSyxLQUFLLFVBQVUsQ0FBQztDQUNwQzs7OztBQUVELE1BQU0sT0FBTyxRQUFRO0lBT25CO1FBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztTQUNuQixDQUFDLENBQUM7S0FDSjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZUQsU0FBUyxlQUFlLENBQUMsU0FBYztJQUNyQyxPQUFPLE9BQU8sU0FBUyxDQUFDLFVBQVUsS0FBSyxVQUFVO1FBQzdDLE9BQU8sU0FBUyxDQUFDLGdCQUFnQixLQUFLLFVBQVUsQ0FBQztDQUN0RDs7Ozs7Ozs7QUFNRCxNQUFNLFVBQVUsYUFBYSxDQUFDLE9BQW1DLEVBQUUsU0FBYztJQUMvRSxJQUFJLE9BQU8sSUFBSSxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDekMsT0FBTyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdEUsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxPQUFPLFNBQVMsQ0FBQyxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7WUFDckQsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDaEU7S0FDRjtDQUNGOzs7Ozs7O0FBS0QsTUFBTSxVQUFVLFlBQVksQ0FBQyxJQUFTLEVBQUUsSUFBUztJQUMvQyxPQUFPLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztDQUMxRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RvciwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuXG5jb25zdCBESVJFQ1RJVkVfUFJFRklYX1JFR0VYUCA9IC9eKD86eHxkYXRhKVs6XFwtX10vaTtcbmNvbnN0IERJUkVDVElWRV9TUEVDSUFMX0NIQVJTX1JFR0VYUCA9IC9bOlxcLV9dKyguKS9nO1xuXG5leHBvcnQgZnVuY3Rpb24gb25FcnJvcihlOiBhbnkpIHtcbiAgLy8gVE9ETzogKG1pc2tvKTogV2Ugc2VlbSB0byBub3QgaGF2ZSBhIHN0YWNrIHRyYWNlIGhlcmUhXG4gIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihlLCBlLnN0YWNrKTtcbiAgfSBlbHNlIHtcbiAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uc29sZVxuICAgIGNvbnNvbGUubG9nKGUsIGUuc3RhY2spO1xuICB9XG4gIHRocm93IGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb250cm9sbGVyS2V5KG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiAnJCcgKyBuYW1lICsgJ0NvbnRyb2xsZXInO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGlyZWN0aXZlTm9ybWFsaXplKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBuYW1lLnJlcGxhY2UoRElSRUNUSVZFX1BSRUZJWF9SRUdFWFAsICcnKVxuICAgICAgLnJlcGxhY2UoRElSRUNUSVZFX1NQRUNJQUxfQ0hBUlNfUkVHRVhQLCAoXywgbGV0dGVyKSA9PiBsZXR0ZXIudG9VcHBlckNhc2UoKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21wb25lbnROYW1lKGNvbXBvbmVudDogVHlwZTxhbnk+KTogc3RyaW5nIHtcbiAgLy8gUmV0dXJuIHRoZSBuYW1lIG9mIHRoZSBjb21wb25lbnQgb3IgdGhlIGZpcnN0IGxpbmUgb2YgaXRzIHN0cmluZ2lmaWVkIHZlcnNpb24uXG4gIHJldHVybiAoY29tcG9uZW50IGFzIGFueSkub3ZlcnJpZGRlbk5hbWUgfHwgY29tcG9uZW50Lm5hbWUgfHwgY29tcG9uZW50LnRvU3RyaW5nKCkuc3BsaXQoJ1xcbicpWzBdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZTogYW55KTogdmFsdWUgaXMgRnVuY3Rpb24ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgY2xhc3MgRGVmZXJyZWQ8Uj4ge1xuICBwcm9taXNlOiBQcm9taXNlPFI+O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVzb2x2ZSAhOiAodmFsdWU/OiBSIHwgUHJvbWlzZUxpa2U8Uj4pID0+IHZvaWQ7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICByZWplY3QgITogKGVycm9yPzogYW55KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzO1xuICAgICAgdGhpcy5yZWplY3QgPSByZWo7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMYXp5TW9kdWxlUmVmIHtcbiAgLy8gV2hldGhlciB0aGUgQW5ndWxhckpTIGFwcCBoYXMgYmVlbiBib290c3RyYXBwZWQgb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lXG4gIC8vIChpbiB3aGljaCBjYXNlIGNhbGxzIHRvIEFuZ3VsYXIgQVBJcyBuZWVkIHRvIGJlIGJyb3VnaHQgYmFjayBpbikuXG4gIG5lZWRzTmdab25lOiBib29sZWFuO1xuICBpbmplY3Rvcj86IEluamVjdG9yO1xuICBwcm9taXNlPzogUHJvbWlzZTxJbmplY3Rvcj47XG59XG5cbi8qKlxuICogQHJldHVybiBXaGV0aGVyIHRoZSBwYXNzZWQtaW4gY29tcG9uZW50IGltcGxlbWVudHMgdGhlIHN1YnNldCBvZiB0aGVcbiAqICAgICBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGludGVyZmFjZSBuZWVkZWQgZm9yIEFuZ3VsYXJKUyBgbmctbW9kZWxgXG4gKiAgICAgY29tcGF0aWJpbGl0eS5cbiAqL1xuZnVuY3Rpb24gc3VwcG9ydHNOZ01vZGVsKGNvbXBvbmVudDogYW55KSB7XG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LndyaXRlVmFsdWUgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIHR5cGVvZiBjb21wb25lbnQucmVnaXN0ZXJPbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBHbHVlIHRoZSBBbmd1bGFySlMgYE5nTW9kZWxDb250cm9sbGVyYCAoaWYgaXQgZXhpc3RzKSB0byB0aGUgY29tcG9uZW50XG4gKiAoaWYgaXQgaW1wbGVtZW50cyB0aGUgbmVlZGVkIHN1YnNldCBvZiB0aGUgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaG9va3VwTmdNb2RlbChuZ01vZGVsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciwgY29tcG9uZW50OiBhbnkpIHtcbiAgaWYgKG5nTW9kZWwgJiYgc3VwcG9ydHNOZ01vZGVsKGNvbXBvbmVudCkpIHtcbiAgICBuZ01vZGVsLiRyZW5kZXIgPSAoKSA9PiB7IGNvbXBvbmVudC53cml0ZVZhbHVlKG5nTW9kZWwuJHZpZXdWYWx1ZSk7IH07XG4gICAgY29tcG9uZW50LnJlZ2lzdGVyT25DaGFuZ2UobmdNb2RlbC4kc2V0Vmlld1ZhbHVlLmJpbmQobmdNb2RlbCkpO1xuICAgIGlmICh0eXBlb2YgY29tcG9uZW50LnJlZ2lzdGVyT25Ub3VjaGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb21wb25lbnQucmVnaXN0ZXJPblRvdWNoZWQobmdNb2RlbC4kc2V0VG91Y2hlZC5iaW5kKG5nTW9kZWwpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUZXN0IHR3byB2YWx1ZXMgZm9yIHN0cmljdCBlcXVhbGl0eSwgYWNjb3VudGluZyBmb3IgdGhlIGZhY3QgdGhhdCBgTmFOICE9PSBOYU5gLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaWN0RXF1YWxzKHZhbDE6IGFueSwgdmFsMjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWwxID09PSB2YWwyIHx8ICh2YWwxICE9PSB2YWwxICYmIHZhbDIgIT09IHZhbDIpO1xufVxuIl19