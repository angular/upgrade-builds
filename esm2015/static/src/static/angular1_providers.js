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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjFfcHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL3N0YXRpYy9hbmd1bGFyMV9wcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQWVJLGVBQWUsR0FBMEIsSUFBSTs7Ozs7QUFDakQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLFFBQTBCO0lBQzNELGVBQWUsR0FBRyxRQUFRLENBQUM7QUFDN0IsQ0FBQzs7OztBQUNELE1BQU0sVUFBVSxlQUFlO0lBQzdCLElBQUksQ0FBQyxlQUFlLEVBQUU7UUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDO0tBQzlFOztVQUVLLFFBQVEsR0FBcUIsZUFBZTtJQUNsRCxlQUFlLEdBQUcsSUFBSSxDQUFDLENBQUUsMENBQTBDO0lBQ25FLE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLENBQW1CO0lBQ2xELE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM3QixDQUFDOzs7OztBQUVELE1BQU0sVUFBVSxjQUFjLENBQUMsQ0FBbUI7SUFDaEQsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNCLENBQUM7Ozs7O0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxDQUFtQjtJQUM5QyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekIsQ0FBQzs7QUFFRCxNQUFNLE9BQU8saUJBQWlCLEdBQUc7SUFDL0IseUZBQXlGO0lBQ3pGLDJFQUEyRTtJQUMzRSx3Q0FBd0M7SUFDeEMseUZBQXlGO0lBQ3pGLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUM7SUFDN0QsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBQztJQUMxRSxFQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBQztJQUN0RSxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBQztDQUNuRSIsInNvdXJjZXNDb250ZW50IjpbIlxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0lJbmplY3RvclNlcnZpY2V9IGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5cbi8vIFdlIGhhdmUgdG8gZG8gYSBsaXR0bGUgZGFuY2UgdG8gZ2V0IHRoZSBuZzEgaW5qZWN0b3IgaW50byB0aGUgbW9kdWxlIGluamVjdG9yLlxuLy8gV2Ugc3RvcmUgdGhlIG5nMSBpbmplY3RvciBzbyB0aGF0IHRoZSBwcm92aWRlciBpbiB0aGUgbW9kdWxlIGluamVjdG9yIGNhbiBhY2Nlc3MgaXRcbi8vIFRoZW4gd2UgXCJnZXRcIiB0aGUgbmcxIGluamVjdG9yIGZyb20gdGhlIG1vZHVsZSBpbmplY3Rvciwgd2hpY2ggdHJpZ2dlcnMgdGhlIHByb3ZpZGVyIHRvIHJlYWRcbi8vIHRoZSBzdG9yZWQgaW5qZWN0b3IgYW5kIHJlbGVhc2UgdGhlIHJlZmVyZW5jZSB0byBpdC5cbmxldCB0ZW1wSW5qZWN0b3JSZWY6IElJbmplY3RvclNlcnZpY2V8bnVsbCA9IG51bGw7XG5leHBvcnQgZnVuY3Rpb24gc2V0VGVtcEluamVjdG9yUmVmKGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlKSB7XG4gIHRlbXBJbmplY3RvclJlZiA9IGluamVjdG9yO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGluamVjdG9yRmFjdG9yeSgpIHtcbiAgaWYgKCF0ZW1wSW5qZWN0b3JSZWYpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBnZXQgdGhlIEFuZ3VsYXJKUyBpbmplY3RvciBiZWZvcmUgaXQgYmVpbmcgc2V0LicpO1xuICB9XG5cbiAgY29uc3QgaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UgPSB0ZW1wSW5qZWN0b3JSZWY7XG4gIHRlbXBJbmplY3RvclJlZiA9IG51bGw7ICAvLyBjbGVhciB0aGUgdmFsdWUgdG8gcHJldmVudCBtZW1vcnkgbGVha3NcbiAgcmV0dXJuIGluamVjdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm9vdFNjb3BlRmFjdG9yeShpOiBJSW5qZWN0b3JTZXJ2aWNlKSB7XG4gIHJldHVybiBpLmdldCgnJHJvb3RTY29wZScpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUZhY3RvcnkoaTogSUluamVjdG9yU2VydmljZSkge1xuICByZXR1cm4gaS5nZXQoJyRjb21waWxlJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZhY3RvcnkoaTogSUluamVjdG9yU2VydmljZSkge1xuICByZXR1cm4gaS5nZXQoJyRwYXJzZScpO1xufVxuXG5leHBvcnQgY29uc3QgYW5ndWxhcjFQcm92aWRlcnMgPSBbXG4gIC8vIFdlIG11c3QgdXNlIGV4cG9ydGVkIG5hbWVkIGZ1bmN0aW9ucyBmb3IgdGhlIG5nMiBmYWN0b3JpZXMgdG8ga2VlcCB0aGUgY29tcGlsZXIgaGFwcHk6XG4gIC8vID4gTWV0YWRhdGEgY29sbGVjdGVkIGNvbnRhaW5zIGFuIGVycm9yIHRoYXQgd2lsbCBiZSByZXBvcnRlZCBhdCBydW50aW1lOlxuICAvLyA+ICAgRnVuY3Rpb24gY2FsbHMgYXJlIG5vdCBzdXBwb3J0ZWQuXG4gIC8vID4gICBDb25zaWRlciByZXBsYWNpbmcgdGhlIGZ1bmN0aW9uIG9yIGxhbWJkYSB3aXRoIGEgcmVmZXJlbmNlIHRvIGFuIGV4cG9ydGVkIGZ1bmN0aW9uXG4gIHtwcm92aWRlOiAnJGluamVjdG9yJywgdXNlRmFjdG9yeTogaW5qZWN0b3JGYWN0b3J5LCBkZXBzOiBbXX0sXG4gIHtwcm92aWRlOiAnJHJvb3RTY29wZScsIHVzZUZhY3Rvcnk6IHJvb3RTY29wZUZhY3RvcnksIGRlcHM6IFsnJGluamVjdG9yJ119LFxuICB7cHJvdmlkZTogJyRjb21waWxlJywgdXNlRmFjdG9yeTogY29tcGlsZUZhY3RvcnksIGRlcHM6IFsnJGluamVjdG9yJ119LFxuICB7cHJvdmlkZTogJyRwYXJzZScsIHVzZUZhY3Rvcnk6IHBhcnNlRmFjdG9yeSwgZGVwczogWyckaW5qZWN0b3InXX1cbl07XG4iXX0=