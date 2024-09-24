/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export { getAngularJSGlobal, getAngularLib, setAngularJSGlobal, setAngularLib, } from '../src/common/src/angular1';
export { downgradeComponent } from '../src/common/src/downgrade_component';
export { downgradeInjectable } from '../src/common/src/downgrade_injectable';
export { VERSION } from '../src/common/src/version';
export { downgradeModule } from './src/downgrade_module';
export { UpgradeComponent } from './src/upgrade_component';
export { UpgradeModule } from './src/upgrade_module';
export * from './common';
// This file only re-exports items to appear in the public api. Keep it that way.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljX2FwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3B1YmxpY19hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGtCQUFrQixFQUNsQixhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLGFBQWEsR0FDZCxNQUFNLDRCQUE0QixDQUFDO0FBQ3BDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHdDQUF3QyxDQUFDO0FBQzNFLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNsRCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDekQsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ25ELGNBQWMsVUFBVSxDQUFDO0FBRXpCLGlGQUFpRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuZXhwb3J0IHtcbiAgZ2V0QW5ndWxhckpTR2xvYmFsLFxuICBnZXRBbmd1bGFyTGliLFxuICBzZXRBbmd1bGFySlNHbG9iYWwsXG4gIHNldEFuZ3VsYXJMaWIsXG59IGZyb20gJy4uL3NyYy9jb21tb24vc3JjL2FuZ3VsYXIxJztcbmV4cG9ydCB7ZG93bmdyYWRlQ29tcG9uZW50fSBmcm9tICcuLi9zcmMvY29tbW9uL3NyYy9kb3duZ3JhZGVfY29tcG9uZW50JztcbmV4cG9ydCB7ZG93bmdyYWRlSW5qZWN0YWJsZX0gZnJvbSAnLi4vc3JjL2NvbW1vbi9zcmMvZG93bmdyYWRlX2luamVjdGFibGUnO1xuZXhwb3J0IHtWRVJTSU9OfSBmcm9tICcuLi9zcmMvY29tbW9uL3NyYy92ZXJzaW9uJztcbmV4cG9ydCB7ZG93bmdyYWRlTW9kdWxlfSBmcm9tICcuL3NyYy9kb3duZ3JhZGVfbW9kdWxlJztcbmV4cG9ydCB7VXBncmFkZUNvbXBvbmVudH0gZnJvbSAnLi9zcmMvdXBncmFkZV9jb21wb25lbnQnO1xuZXhwb3J0IHtVcGdyYWRlTW9kdWxlfSBmcm9tICcuL3NyYy91cGdyYWRlX21vZHVsZSc7XG5leHBvcnQgKiBmcm9tICcuL2NvbW1vbic7XG5cbi8vIFRoaXMgZmlsZSBvbmx5IHJlLWV4cG9ydHMgaXRlbXMgdG8gYXBwZWFyIGluIHRoZSBwdWJsaWMgYXBpLiBLZWVwIGl0IHRoYXQgd2F5LlxuIl19