/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// We have to do a little dance to get the ng1 injector into the module injector.
// We store the ng1 injector so that the provider in the module injector can access it
// Then we "get" the ng1 injector from the module injector, which triggers the provider to read
// the stored injector and release the reference to it.
/** @type {?} */
let tempInjectorRef = null;
/**
 * @param {?} injector
 * @return {?}
 */
export function setTempInjectorRef(injector) {
    tempInjectorRef = injector;
}
/**
 * @return {?}
 */
export function injectorFactory() {
    if (!tempInjectorRef) {
        throw new Error('Trying to get the AngularJS injector before it being set.');
    }
    /** @type {?} */
    const injector = tempInjectorRef;
    tempInjectorRef = null; // clear the value to prevent memory leaks
    return injector;
}
/**
 * @param {?} i
 * @return {?}
 */
export function rootScopeFactory(i) {
    return i.get('$rootScope');
}
/**
 * @param {?} i
 * @return {?}
 */
export function compileFactory(i) {
    return i.get('$compile');
}
/**
 * @param {?} i
 * @return {?}
 */
export function parseFactory(i) {
    return i.get('$parse');
}
/** @type {?} */
export const angular1Providers = [
    // We must use exported named functions for the ng2 factories to keep the compiler happy:
    // > Metadata collected contains an error that will be reported at runtime:
    // >   Function calls are not supported.
    // >   Consider replacing the function or lambda with a reference to an exported function
    { provide: '$injector', useFactory: injectorFactory, deps: [] },
    { provide: '$rootScope', useFactory: rootScopeFactory, deps: ['$injector'] },
    { provide: '$compile', useFactory: compileFactory, deps: ['$injector'] },
    { provide: '$parse', useFactory: parseFactory, deps: ['$injector'] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjFfcHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL2FuZ3VsYXIxX3Byb3ZpZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBZUksZUFBZSxHQUEwQixJQUFJOzs7OztBQUNqRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsUUFBMEI7SUFDM0QsZUFBZSxHQUFHLFFBQVEsQ0FBQztBQUM3QixDQUFDOzs7O0FBQ0QsTUFBTSxVQUFVLGVBQWU7SUFDN0IsSUFBSSxDQUFDLGVBQWUsRUFBRTtRQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7S0FDOUU7O1VBRUssUUFBUSxHQUFxQixlQUFlO0lBQ2xELGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBRSwwQ0FBMEM7SUFDbkUsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsQ0FBbUI7SUFDbEQsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FBQyxDQUFtQjtJQUNoRCxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDM0IsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsWUFBWSxDQUFDLENBQW1CO0lBQzlDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QixDQUFDOztBQUVELE1BQU0sT0FBTyxpQkFBaUIsR0FBRztJQUMvQix5RkFBeUY7SUFDekYsMkVBQTJFO0lBQzNFLHdDQUF3QztJQUN4Qyx5RkFBeUY7SUFDekYsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQztJQUM3RCxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFDO0lBQzFFLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFDO0lBQ3RFLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFDO0NBQ25FIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SUluamVjdG9yU2VydmljZX0gZnJvbSAnLi4vLi4vc3JjL2NvbW1vbi9zcmMvYW5ndWxhcjEnO1xuXG4vLyBXZSBoYXZlIHRvIGRvIGEgbGl0dGxlIGRhbmNlIHRvIGdldCB0aGUgbmcxIGluamVjdG9yIGludG8gdGhlIG1vZHVsZSBpbmplY3Rvci5cbi8vIFdlIHN0b3JlIHRoZSBuZzEgaW5qZWN0b3Igc28gdGhhdCB0aGUgcHJvdmlkZXIgaW4gdGhlIG1vZHVsZSBpbmplY3RvciBjYW4gYWNjZXNzIGl0XG4vLyBUaGVuIHdlIFwiZ2V0XCIgdGhlIG5nMSBpbmplY3RvciBmcm9tIHRoZSBtb2R1bGUgaW5qZWN0b3IsIHdoaWNoIHRyaWdnZXJzIHRoZSBwcm92aWRlciB0byByZWFkXG4vLyB0aGUgc3RvcmVkIGluamVjdG9yIGFuZCByZWxlYXNlIHRoZSByZWZlcmVuY2UgdG8gaXQuXG5sZXQgdGVtcEluamVjdG9yUmVmOiBJSW5qZWN0b3JTZXJ2aWNlfG51bGwgPSBudWxsO1xuZXhwb3J0IGZ1bmN0aW9uIHNldFRlbXBJbmplY3RvclJlZihpbmplY3RvcjogSUluamVjdG9yU2VydmljZSkge1xuICB0ZW1wSW5qZWN0b3JSZWYgPSBpbmplY3Rvcjtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpbmplY3RvckZhY3RvcnkoKSB7XG4gIGlmICghdGVtcEluamVjdG9yUmVmKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUcnlpbmcgdG8gZ2V0IHRoZSBBbmd1bGFySlMgaW5qZWN0b3IgYmVmb3JlIGl0IGJlaW5nIHNldC4nKTtcbiAgfVxuXG4gIGNvbnN0IGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlID0gdGVtcEluamVjdG9yUmVmO1xuICB0ZW1wSW5qZWN0b3JSZWYgPSBudWxsOyAgLy8gY2xlYXIgdGhlIHZhbHVlIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gIHJldHVybiBpbmplY3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvb3RTY29wZUZhY3RvcnkoaTogSUluamVjdG9yU2VydmljZSkge1xuICByZXR1cm4gaS5nZXQoJyRyb290U2NvcGUnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVGYWN0b3J5KGk6IElJbmplY3RvclNlcnZpY2UpIHtcbiAgcmV0dXJuIGkuZ2V0KCckY29tcGlsZScpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGYWN0b3J5KGk6IElJbmplY3RvclNlcnZpY2UpIHtcbiAgcmV0dXJuIGkuZ2V0KCckcGFyc2UnKTtcbn1cblxuZXhwb3J0IGNvbnN0IGFuZ3VsYXIxUHJvdmlkZXJzID0gW1xuICAvLyBXZSBtdXN0IHVzZSBleHBvcnRlZCBuYW1lZCBmdW5jdGlvbnMgZm9yIHRoZSBuZzIgZmFjdG9yaWVzIHRvIGtlZXAgdGhlIGNvbXBpbGVyIGhhcHB5OlxuICAvLyA+IE1ldGFkYXRhIGNvbGxlY3RlZCBjb250YWlucyBhbiBlcnJvciB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXQgcnVudGltZTpcbiAgLy8gPiAgIEZ1bmN0aW9uIGNhbGxzIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAvLyA+ICAgQ29uc2lkZXIgcmVwbGFjaW5nIHRoZSBmdW5jdGlvbiBvciBsYW1iZGEgd2l0aCBhIHJlZmVyZW5jZSB0byBhbiBleHBvcnRlZCBmdW5jdGlvblxuICB7cHJvdmlkZTogJyRpbmplY3RvcicsIHVzZUZhY3Rvcnk6IGluamVjdG9yRmFjdG9yeSwgZGVwczogW119LFxuICB7cHJvdmlkZTogJyRyb290U2NvcGUnLCB1c2VGYWN0b3J5OiByb290U2NvcGVGYWN0b3J5LCBkZXBzOiBbJyRpbmplY3RvciddfSxcbiAge3Byb3ZpZGU6ICckY29tcGlsZScsIHVzZUZhY3Rvcnk6IGNvbXBpbGVGYWN0b3J5LCBkZXBzOiBbJyRpbmplY3RvciddfSxcbiAge3Byb3ZpZGU6ICckcGFyc2UnLCB1c2VGYWN0b3J5OiBwYXJzZUZhY3RvcnksIGRlcHM6IFsnJGluamVjdG9yJ119XG5dO1xuIl19