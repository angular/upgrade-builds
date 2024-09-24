/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// We have to do a little dance to get the ng1 injector into the module injector.
// We store the ng1 injector so that the provider in the module injector can access it
// Then we "get" the ng1 injector from the module injector, which triggers the provider to read
// the stored injector and release the reference to it.
let tempInjectorRef = null;
export function setTempInjectorRef(injector) {
    tempInjectorRef = injector;
}
export function injectorFactory() {
    if (!tempInjectorRef) {
        throw new Error('Trying to get the AngularJS injector before it being set.');
    }
    const injector = tempInjectorRef;
    tempInjectorRef = null; // clear the value to prevent memory leaks
    return injector;
}
export function rootScopeFactory(i) {
    return i.get('$rootScope');
}
export function compileFactory(i) {
    return i.get('$compile');
}
export function parseFactory(i) {
    return i.get('$parse');
}
export const angular1Providers = [
    // We must use exported named functions for the ng2 factories to keep the compiler happy:
    // > Metadata collected contains an error that will be reported at runtime:
    // >   Function calls are not supported.
    // >   Consider replacing the function or lambda with a reference to an exported function
    { provide: '$injector', useFactory: injectorFactory, deps: [] },
    { provide: '$rootScope', useFactory: rootScopeFactory, deps: ['$injector'] },
    { provide: '$compile', useFactory: compileFactory, deps: ['$injector'] },
    { provide: '$parse', useFactory: parseFactory, deps: ['$injector'] },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhcjFfcHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL2FuZ3VsYXIxX3Byb3ZpZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxpRkFBaUY7QUFDakYsc0ZBQXNGO0FBQ3RGLCtGQUErRjtBQUMvRix1REFBdUQ7QUFDdkQsSUFBSSxlQUFlLEdBQTRCLElBQUksQ0FBQztBQUNwRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsUUFBMEI7SUFDM0QsZUFBZSxHQUFHLFFBQVEsQ0FBQztBQUM3QixDQUFDO0FBQ0QsTUFBTSxVQUFVLGVBQWU7SUFDN0IsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQsTUFBTSxRQUFRLEdBQXFCLGVBQWUsQ0FBQztJQUNuRCxlQUFlLEdBQUcsSUFBSSxDQUFDLENBQUMsMENBQTBDO0lBQ2xFLE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxNQUFNLFVBQVUsZ0JBQWdCLENBQUMsQ0FBbUI7SUFDbEQsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUFDLENBQW1CO0lBQ2hELE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBRUQsTUFBTSxVQUFVLFlBQVksQ0FBQyxDQUFtQjtJQUM5QyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekIsQ0FBQztBQUVELE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHO0lBQy9CLHlGQUF5RjtJQUN6RiwyRUFBMkU7SUFDM0Usd0NBQXdDO0lBQ3hDLHlGQUF5RjtJQUN6RixFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDO0lBQzdELEVBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUM7SUFDMUUsRUFBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUM7SUFDdEUsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUM7Q0FDbkUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJSW5qZWN0b3JTZXJ2aWNlfSBmcm9tICcuLi8uLi9zcmMvY29tbW9uL3NyYy9hbmd1bGFyMSc7XG5cbi8vIFdlIGhhdmUgdG8gZG8gYSBsaXR0bGUgZGFuY2UgdG8gZ2V0IHRoZSBuZzEgaW5qZWN0b3IgaW50byB0aGUgbW9kdWxlIGluamVjdG9yLlxuLy8gV2Ugc3RvcmUgdGhlIG5nMSBpbmplY3RvciBzbyB0aGF0IHRoZSBwcm92aWRlciBpbiB0aGUgbW9kdWxlIGluamVjdG9yIGNhbiBhY2Nlc3MgaXRcbi8vIFRoZW4gd2UgXCJnZXRcIiB0aGUgbmcxIGluamVjdG9yIGZyb20gdGhlIG1vZHVsZSBpbmplY3Rvciwgd2hpY2ggdHJpZ2dlcnMgdGhlIHByb3ZpZGVyIHRvIHJlYWRcbi8vIHRoZSBzdG9yZWQgaW5qZWN0b3IgYW5kIHJlbGVhc2UgdGhlIHJlZmVyZW5jZSB0byBpdC5cbmxldCB0ZW1wSW5qZWN0b3JSZWY6IElJbmplY3RvclNlcnZpY2UgfCBudWxsID0gbnVsbDtcbmV4cG9ydCBmdW5jdGlvbiBzZXRUZW1wSW5qZWN0b3JSZWYoaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UpIHtcbiAgdGVtcEluamVjdG9yUmVmID0gaW5qZWN0b3I7XG59XG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0b3JGYWN0b3J5KCkge1xuICBpZiAoIXRlbXBJbmplY3RvclJlZikge1xuICAgIHRocm93IG5ldyBFcnJvcignVHJ5aW5nIHRvIGdldCB0aGUgQW5ndWxhckpTIGluamVjdG9yIGJlZm9yZSBpdCBiZWluZyBzZXQuJyk7XG4gIH1cblxuICBjb25zdCBpbmplY3RvcjogSUluamVjdG9yU2VydmljZSA9IHRlbXBJbmplY3RvclJlZjtcbiAgdGVtcEluamVjdG9yUmVmID0gbnVsbDsgLy8gY2xlYXIgdGhlIHZhbHVlIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gIHJldHVybiBpbmplY3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvb3RTY29wZUZhY3RvcnkoaTogSUluamVjdG9yU2VydmljZSkge1xuICByZXR1cm4gaS5nZXQoJyRyb290U2NvcGUnKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVGYWN0b3J5KGk6IElJbmplY3RvclNlcnZpY2UpIHtcbiAgcmV0dXJuIGkuZ2V0KCckY29tcGlsZScpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VGYWN0b3J5KGk6IElJbmplY3RvclNlcnZpY2UpIHtcbiAgcmV0dXJuIGkuZ2V0KCckcGFyc2UnKTtcbn1cblxuZXhwb3J0IGNvbnN0IGFuZ3VsYXIxUHJvdmlkZXJzID0gW1xuICAvLyBXZSBtdXN0IHVzZSBleHBvcnRlZCBuYW1lZCBmdW5jdGlvbnMgZm9yIHRoZSBuZzIgZmFjdG9yaWVzIHRvIGtlZXAgdGhlIGNvbXBpbGVyIGhhcHB5OlxuICAvLyA+IE1ldGFkYXRhIGNvbGxlY3RlZCBjb250YWlucyBhbiBlcnJvciB0aGF0IHdpbGwgYmUgcmVwb3J0ZWQgYXQgcnVudGltZTpcbiAgLy8gPiAgIEZ1bmN0aW9uIGNhbGxzIGFyZSBub3Qgc3VwcG9ydGVkLlxuICAvLyA+ICAgQ29uc2lkZXIgcmVwbGFjaW5nIHRoZSBmdW5jdGlvbiBvciBsYW1iZGEgd2l0aCBhIHJlZmVyZW5jZSB0byBhbiBleHBvcnRlZCBmdW5jdGlvblxuICB7cHJvdmlkZTogJyRpbmplY3RvcicsIHVzZUZhY3Rvcnk6IGluamVjdG9yRmFjdG9yeSwgZGVwczogW119LFxuICB7cHJvdmlkZTogJyRyb290U2NvcGUnLCB1c2VGYWN0b3J5OiByb290U2NvcGVGYWN0b3J5LCBkZXBzOiBbJyRpbmplY3RvciddfSxcbiAge3Byb3ZpZGU6ICckY29tcGlsZScsIHVzZUZhY3Rvcnk6IGNvbXBpbGVGYWN0b3J5LCBkZXBzOiBbJyRpbmplY3RvciddfSxcbiAge3Byb3ZpZGU6ICckcGFyc2UnLCB1c2VGYWN0b3J5OiBwYXJzZUZhY3RvcnksIGRlcHM6IFsnJGluamVjdG9yJ119LFxuXTtcbiJdfQ==