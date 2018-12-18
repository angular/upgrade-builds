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
// We have to do a little dance to get the ng1 injector into the module injector.
// We store the ng1 injector so that the provider in the module injector can access it
// Then we "get" the ng1 injector from the module injector, which triggers the provider to read
// the stored injector and release the reference to it.
/** @type {?} */
let tempInjectorRef;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjFfcHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL3N0YXRpYy9hbmd1bGFyMV9wcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQWNJLGVBQThDOzs7OztBQUNsRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsUUFBa0M7SUFDbkUsZUFBZSxHQUFHLFFBQVEsQ0FBQztBQUM3QixDQUFDOzs7O0FBQ0QsTUFBTSxVQUFVLGVBQWU7SUFDN0IsSUFBSSxDQUFDLGVBQWUsRUFBRTtRQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7S0FDOUU7O1VBRUssUUFBUSxHQUFrQyxlQUFlO0lBQy9ELGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBRSwwQ0FBMEM7SUFDbkUsT0FBTyxRQUFRLENBQUM7QUFDbEIsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsQ0FBMkI7SUFDMUQsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGNBQWMsQ0FBQyxDQUEyQjtJQUN4RCxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDM0IsQ0FBQzs7Ozs7QUFFRCxNQUFNLFVBQVUsWUFBWSxDQUFDLENBQTJCO0lBQ3RELE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6QixDQUFDOztBQUVELE1BQU0sT0FBTyxpQkFBaUIsR0FBRztJQUMvQix5RkFBeUY7SUFDekYsMkVBQTJFO0lBQzNFLHdDQUF3QztJQUN4Qyx5RkFBeUY7SUFDekYsRUFBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQztJQUM3RCxFQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFDO0lBQzFFLEVBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFDO0lBQ3RFLEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFDO0NBQ25FIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5cbi8vIFdlIGhhdmUgdG8gZG8gYSBsaXR0bGUgZGFuY2UgdG8gZ2V0IHRoZSBuZzEgaW5qZWN0b3IgaW50byB0aGUgbW9kdWxlIGluamVjdG9yLlxuLy8gV2Ugc3RvcmUgdGhlIG5nMSBpbmplY3RvciBzbyB0aGF0IHRoZSBwcm92aWRlciBpbiB0aGUgbW9kdWxlIGluamVjdG9yIGNhbiBhY2Nlc3MgaXRcbi8vIFRoZW4gd2UgXCJnZXRcIiB0aGUgbmcxIGluamVjdG9yIGZyb20gdGhlIG1vZHVsZSBpbmplY3Rvciwgd2hpY2ggdHJpZ2dlcnMgdGhlIHByb3ZpZGVyIHRvIHJlYWRcbi8vIHRoZSBzdG9yZWQgaW5qZWN0b3IgYW5kIHJlbGVhc2UgdGhlIHJlZmVyZW5jZSB0byBpdC5cbmxldCB0ZW1wSW5qZWN0b3JSZWY6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZXxudWxsO1xuZXhwb3J0IGZ1bmN0aW9uIHNldFRlbXBJbmplY3RvclJlZihpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSB7XG4gIHRlbXBJbmplY3RvclJlZiA9IGluamVjdG9yO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdG9yRmFjdG9yeSgpIHtcbiAgaWYgKCF0ZW1wSW5qZWN0b3JSZWYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBnZXQgdGhlIEFuZ3VsYXJKUyBpbmplY3RvciBiZWZvcmUgaXQgYmVpbmcgc2V0LicpO1xuICB9XG5cbiAgY29uc3QgaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZXxudWxsID0gdGVtcEluamVjdG9yUmVmO1xuICB0ZW1wSW5qZWN0b3JSZWYgPSBudWxsOyAgLy8gY2xlYXIgdGhlIHZhbHVlIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gIHJldHVybiBpbmplY3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvb3RTY29wZUZhY3RvcnkoaTogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSB7XG4gIHJldHVybiBpLmdldCgnJHJvb3RTY29wZScpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUZhY3RvcnkoaTogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSB7XG4gIHJldHVybiBpLmdldCgnJGNvbXBpbGUnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRmFjdG9yeShpOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpIHtcbiAgcmV0dXJuIGkuZ2V0KCckcGFyc2UnKTtcbn1cblxuZXhwb3J0IGNvbnN0IGFuZ3VsYXIxUHJvdmlkZXJzID0gW1xuICAvLyBXZSBtdXN0IHVzZSBleHBvcnRlZCBuYW1lZCBmdW5jdGlvbnMgZm9yIHRoZSBuZzIgZmFjdG9yaWVzIHRvIGtlZXAgdGhlIGNvbXBpbGVyIGhhcHB5OlxuICAvLyA+IE1ldGFkYXRhIGNvbGxlY3RlZCBjb250YWlucyBhbiBlcnJvciB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXQgcnVudGltZTpcbiAgLy8gPiAgIEZ1bmN0aW9uIGNhbGxzIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAvLyA+ICAgQ29uc2lkZXIgcmVwbGFjaW5nIHRoZSBmdW5jdGlvbiBvciBsYW1iZGEgd2l0aCBhIHJlZmVyZW5jZSB0byBhbiBleHBvcnRlZCBmdW5jdGlvblxuICB7cHJvdmlkZTogJyRpbmplY3RvcicsIHVzZUZhY3Rvcnk6IGluamVjdG9yRmFjdG9yeSwgZGVwczogW119LFxuICB7cHJvdmlkZTogJyRyb290U2NvcGUnLCB1c2VGYWN0b3J5OiByb290U2NvcGVGYWN0b3J5LCBkZXBzOiBbJyRpbmplY3RvciddfSxcbiAge3Byb3ZpZGU6ICckY29tcGlsZScsIHVzZUZhY3Rvcnk6IGNvbXBpbGVGYWN0b3J5LCBkZXBzOiBbJyRpbmplY3RvciddfSxcbiAge3Byb3ZpZGU6ICckcGFyc2UnLCB1c2VGYWN0b3J5OiBwYXJzZUZhY3RvcnksIGRlcHM6IFsnJGluamVjdG9yJ119XG5dO1xuIl19