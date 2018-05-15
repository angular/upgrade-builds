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
import { platformBrowser } from '@angular/platform-browser';
import * as angular from '../common/angular1';
import { $INJECTOR, INJECTOR_KEY, LAZY_MODULE_REF, UPGRADE_MODULE_NAME } from '../common/constants';
import { isFunction } from '../common/util';
import { angular1Providers, setTempInjectorRef } from './angular1_providers';
import { NgAdapterInjector } from './util';
/**
 * \@experimental
 * @template T
 * @param {?} moduleFactoryOrBootstrapFn
 * @return {?}
 */
export function downgradeModule(moduleFactoryOrBootstrapFn) {
    const /** @type {?} */ LAZY_MODULE_NAME = UPGRADE_MODULE_NAME + '.lazy';
    const /** @type {?} */ bootstrapFn = isFunction(moduleFactoryOrBootstrapFn) ?
        moduleFactoryOrBootstrapFn :
        (extraProviders) => platformBrowser(extraProviders).bootstrapModuleFactory(moduleFactoryOrBootstrapFn);
    let /** @type {?} */ injector;
    // Create an ng1 module to bootstrap.
    angular.module(LAZY_MODULE_NAME, [])
        .factory(INJECTOR_KEY, () => {
        if (!injector) {
            throw new Error('Trying to get the Angular injector before bootstrapping an Angular module.');
        }
        return injector;
    })
        .factory(LAZY_MODULE_REF, [
        $INJECTOR,
        ($injector) => {
            setTempInjectorRef($injector);
            const /** @type {?} */ result = {
                needsNgZone: true,
                promise: bootstrapFn(angular1Providers).then(ref => {
                    injector = result.injector = new NgAdapterInjector(ref.injector);
                    injector.get($INJECTOR);
                    return injector;
                })
            };
            return result;
        }
    ]);
    return LAZY_MODULE_NAME;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9zdGF0aWMvZG93bmdyYWRlX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVNBLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUUxRCxPQUFPLEtBQUssT0FBTyxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2xHLE9BQU8sRUFBZ0IsVUFBVSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFekQsT0FBTyxFQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDM0UsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sUUFBUSxDQUFDOzs7Ozs7O0FBSXpDLE1BQU0sMEJBQ0YsMEJBQytEO0lBQ2pFLHVCQUFNLGdCQUFnQixHQUFHLG1CQUFtQixHQUFHLE9BQU8sQ0FBQztJQUN2RCx1QkFBTSxXQUFXLEdBQUcsVUFBVSxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQztRQUN4RCwwQkFBMEIsQ0FBQyxDQUFDO1FBQzVCLENBQUMsY0FBZ0MsRUFBRSxFQUFFLENBQ2pDLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRTNGLHFCQUFJLFFBQWtCLENBQUM7O0lBR3ZCLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDO1NBQy9CLE9BQU8sQ0FDSixZQUFZLEVBQ1osR0FBRyxFQUFFO1FBQ0gsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLE1BQU0sSUFBSSxLQUFLLENBQ1gsNEVBQTRFLENBQUMsQ0FBQztTQUNuRjtRQUNELE9BQU8sUUFBUSxDQUFDO0tBQ2pCLENBQUM7U0FDTCxPQUFPLENBQUMsZUFBZSxFQUFFO1FBQ3hCLFNBQVM7UUFDVCxDQUFDLFNBQW1DLEVBQUUsRUFBRTtZQUN0QyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM5Qix1QkFBTSxNQUFNLEdBQWtCO2dCQUM1QixXQUFXLEVBQUUsSUFBSTtnQkFDakIsT0FBTyxFQUFFLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDakQsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2pFLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBRXhCLE9BQU8sUUFBUSxDQUFDO2lCQUNqQixDQUFDO2FBQ0gsQ0FBQztZQUNGLE9BQU8sTUFBTSxDQUFDO1NBQ2Y7S0FDRixDQUFDLENBQUM7SUFFUCxPQUFPLGdCQUFnQixDQUFDO0NBQ3pCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBOZ01vZHVsZUZhY3RvcnksIE5nTW9kdWxlUmVmLCBTdGF0aWNQcm92aWRlcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge3BsYXRmb3JtQnJvd3Nlcn0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi4vY29tbW9uL2FuZ3VsYXIxJztcbmltcG9ydCB7JElOSkVDVE9SLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgVVBHUkFERV9NT0RVTEVfTkFNRX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge0xhenlNb2R1bGVSZWYsIGlzRnVuY3Rpb259IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuaW1wb3J0IHthbmd1bGFyMVByb3ZpZGVycywgc2V0VGVtcEluamVjdG9yUmVmfSBmcm9tICcuL2FuZ3VsYXIxX3Byb3ZpZGVycyc7XG5pbXBvcnQge05nQWRhcHRlckluamVjdG9yfSBmcm9tICcuL3V0aWwnO1xuXG5cbi8qKiBAZXhwZXJpbWVudGFsICovXG5leHBvcnQgZnVuY3Rpb24gZG93bmdyYWRlTW9kdWxlPFQ+KFxuICAgIG1vZHVsZUZhY3RvcnlPckJvb3RzdHJhcEZuOiBOZ01vZHVsZUZhY3Rvcnk8VD58XG4gICAgKChleHRyYVByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSkgPT4gUHJvbWlzZTxOZ01vZHVsZVJlZjxUPj4pKTogc3RyaW5nIHtcbiAgY29uc3QgTEFaWV9NT0RVTEVfTkFNRSA9IFVQR1JBREVfTU9EVUxFX05BTUUgKyAnLmxhenknO1xuICBjb25zdCBib290c3RyYXBGbiA9IGlzRnVuY3Rpb24obW9kdWxlRmFjdG9yeU9yQm9vdHN0cmFwRm4pID9cbiAgICAgIG1vZHVsZUZhY3RvcnlPckJvb3RzdHJhcEZuIDpcbiAgICAgIChleHRyYVByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSkgPT5cbiAgICAgICAgICBwbGF0Zm9ybUJyb3dzZXIoZXh0cmFQcm92aWRlcnMpLmJvb3RzdHJhcE1vZHVsZUZhY3RvcnkobW9kdWxlRmFjdG9yeU9yQm9vdHN0cmFwRm4pO1xuXG4gIGxldCBpbmplY3RvcjogSW5qZWN0b3I7XG5cbiAgLy8gQ3JlYXRlIGFuIG5nMSBtb2R1bGUgdG8gYm9vdHN0cmFwLlxuICBhbmd1bGFyLm1vZHVsZShMQVpZX01PRFVMRV9OQU1FLCBbXSlcbiAgICAgIC5mYWN0b3J5KFxuICAgICAgICAgIElOSkVDVE9SX0tFWSxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWluamVjdG9yKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICdUcnlpbmcgdG8gZ2V0IHRoZSBBbmd1bGFyIGluamVjdG9yIGJlZm9yZSBib290c3RyYXBwaW5nIGFuIEFuZ3VsYXIgbW9kdWxlLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGluamVjdG9yO1xuICAgICAgICAgIH0pXG4gICAgICAuZmFjdG9yeShMQVpZX01PRFVMRV9SRUYsIFtcbiAgICAgICAgJElOSkVDVE9SLFxuICAgICAgICAoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICBzZXRUZW1wSW5qZWN0b3JSZWYoJGluamVjdG9yKTtcbiAgICAgICAgICBjb25zdCByZXN1bHQ6IExhenlNb2R1bGVSZWYgPSB7XG4gICAgICAgICAgICBuZWVkc05nWm9uZTogdHJ1ZSxcbiAgICAgICAgICAgIHByb21pc2U6IGJvb3RzdHJhcEZuKGFuZ3VsYXIxUHJvdmlkZXJzKS50aGVuKHJlZiA9PiB7XG4gICAgICAgICAgICAgIGluamVjdG9yID0gcmVzdWx0LmluamVjdG9yID0gbmV3IE5nQWRhcHRlckluamVjdG9yKHJlZi5pbmplY3Rvcik7XG4gICAgICAgICAgICAgIGluamVjdG9yLmdldCgkSU5KRUNUT1IpO1xuXG4gICAgICAgICAgICAgIHJldHVybiBpbmplY3RvcjtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICBdKTtcblxuICByZXR1cm4gTEFaWV9NT0RVTEVfTkFNRTtcbn1cbiJdfQ==