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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjFfcHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL3N0YXRpYy9hbmd1bGFyMV9wcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQWNJLGVBQWUsR0FBa0MsSUFBSTs7Ozs7QUFDekQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLFFBQWtDO0lBQ25FLGVBQWUsR0FBRyxRQUFRLENBQUM7QUFDN0IsQ0FBQzs7OztBQUNELE1BQU0sVUFBVSxlQUFlO0lBQzdCLElBQUksQ0FBQyxlQUFlLEVBQUU7UUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO0tBQzlFOztVQUVLLFFBQVEsR0FBNkIsZUFBZTtJQUMxRCxlQUFlLEdBQUcsSUFBSSxDQUFDLENBQUUsMENBQTBDO0lBQ25FLE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLENBQTJCO0lBQzFELE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsQ0FBMkI7SUFDeEQsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNCLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxDQUEyQjtJQUN0RCxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekIsQ0FBQzs7QUFFRCxNQUFNLE9BQU8saUJBQWlCLEdBQUc7SUFDL0IseUZBQXlGO0lBQ3pGLDJFQUEyRTtJQUMzRSx3Q0FBd0M7SUFDeEMseUZBQXlGO0lBQ3pGLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUM7SUFDN0QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBQztJQUMxRSxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBQztJQUN0RSxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBQztDQUNuRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi9jb21tb24vYW5ndWxhcjEnO1xuXG4vLyBXZSBoYXZlIHRvIGRvIGEgbGl0dGxlIGRhbmNlIHRvIGdldCB0aGUgbmcxIGluamVjdG9yIGludG8gdGhlIG1vZHVsZSBpbmplY3Rvci5cbi8vIFdlIHN0b3JlIHRoZSBuZzEgaW5qZWN0b3Igc28gdGhhdCB0aGUgcHJvdmlkZXIgaW4gdGhlIG1vZHVsZSBpbmplY3RvciBjYW4gYWNjZXNzIGl0XG4vLyBUaGVuIHdlIFwiZ2V0XCIgdGhlIG5nMSBpbmplY3RvciBmcm9tIHRoZSBtb2R1bGUgaW5qZWN0b3IsIHdoaWNoIHRyaWdnZXJzIHRoZSBwcm92aWRlciB0byByZWFkXG4vLyB0aGUgc3RvcmVkIGluamVjdG9yIGFuZCByZWxlYXNlIHRoZSByZWZlcmVuY2UgdG8gaXQuXG5sZXQgdGVtcEluamVjdG9yUmVmOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2V8bnVsbCA9IG51bGw7XG5leHBvcnQgZnVuY3Rpb24gc2V0VGVtcEluamVjdG9yUmVmKGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpIHtcbiAgdGVtcEluamVjdG9yUmVmID0gaW5qZWN0b3I7XG59XG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0b3JGYWN0b3J5KCkge1xuICBpZiAoIXRlbXBJbmplY3RvclJlZikge1xuICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIGdldCB0aGUgQW5ndWxhckpTIGluamVjdG9yIGJlZm9yZSBpdCBiZWluZyBzZXQuJyk7XG4gIH1cblxuICBjb25zdCBpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlID0gdGVtcEluamVjdG9yUmVmO1xuICB0ZW1wSW5qZWN0b3JSZWYgPSBudWxsOyAgLy8gY2xlYXIgdGhlIHZhbHVlIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gIHJldHVybiBpbmplY3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvb3RTY29wZUZhY3RvcnkoaTogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSB7XG4gIHJldHVybiBpLmdldCgnJHJvb3RTY29wZScpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUZhY3RvcnkoaTogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSB7XG4gIHJldHVybiBpLmdldCgnJGNvbXBpbGUnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRmFjdG9yeShpOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpIHtcbiAgcmV0dXJuIGkuZ2V0KCckcGFyc2UnKTtcbn1cblxuZXhwb3J0IGNvbnN0IGFuZ3VsYXIxUHJvdmlkZXJzID0gW1xuICAvLyBXZSBtdXN0IHVzZSBleHBvcnRlZCBuYW1lZCBmdW5jdGlvbnMgZm9yIHRoZSBuZzIgZmFjdG9yaWVzIHRvIGtlZXAgdGhlIGNvbXBpbGVyIGhhcHB5OlxuICAvLyA+IE1ldGFkYXRhIGNvbGxlY3RlZCBjb250YWlucyBhbiBlcnJvciB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXQgcnVudGltZTpcbiAgLy8gPiAgIEZ1bmN0aW9uIGNhbGxzIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAvLyA+ICAgQ29uc2lkZXIgcmVwbGFjaW5nIHRoZSBmdW5jdGlvbiBvciBsYW1iZGEgd2l0aCBhIHJlZmVyZW5jZSB0byBhbiBleHBvcnRlZCBmdW5jdGlvblxuICB7cHJvdmlkZTogJyRpbmplY3RvcicsIHVzZUZhY3Rvcnk6IGluamVjdG9yRmFjdG9yeSwgZGVwczogW119LFxuICB7cHJvdmlkZTogJyRyb290U2NvcGUnLCB1c2VGYWN0b3J5OiByb290U2NvcGVGYWN0b3J5LCBkZXBzOiBbJyRpbmplY3RvciddfSxcbiAge3Byb3ZpZGU6ICckY29tcGlsZScsIHVzZUZhY3Rvcnk6IGNvbXBpbGVGYWN0b3J5LCBkZXBzOiBbJyRpbmplY3RvciddfSxcbiAge3Byb3ZpZGU6ICckcGFyc2UnLCB1c2VGYWN0b3J5OiBwYXJzZUZhY3RvcnksIGRlcHM6IFsnJGluamVjdG9yJ119XG5dO1xuIl19