/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOWNGRADED_MODULE_COUNT_KEY, UPGRADE_APP_TYPE_KEY } from './constants';
var DIRECTIVE_PREFIX_REGEXP = /^(?:x|data)[:\-_]/i;
var DIRECTIVE_SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;
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
export function controllerKey(name) {
    return '$' + name + 'Controller';
}
export function directiveNormalize(name) {
    return name.replace(DIRECTIVE_PREFIX_REGEXP, '')
        .replace(DIRECTIVE_SPECIAL_CHARS_REGEXP, function (_, letter) { return letter.toUpperCase(); });
}
export function getTypeName(type) {
    // Return the name of the type or the first line of its stringified version.
    return type.overriddenName || type.name || type.toString().split('\n')[0];
}
export function getDowngradedModuleCount($injector) {
    return $injector.has(DOWNGRADED_MODULE_COUNT_KEY) ? $injector.get(DOWNGRADED_MODULE_COUNT_KEY) :
        0;
}
export function getUpgradeAppType($injector) {
    return $injector.has(UPGRADE_APP_TYPE_KEY) ? $injector.get(UPGRADE_APP_TYPE_KEY) :
        0 /* None */;
}
export function isFunction(value) {
    return typeof value === 'function';
}
export function validateInjectionKey($injector, downgradedModule, injectionKey, attemptedAction) {
    var upgradeAppType = getUpgradeAppType($injector);
    var downgradedModuleCount = getDowngradedModuleCount($injector);
    // Check for common errors.
    switch (upgradeAppType) {
        case 1 /* Dynamic */:
        case 2 /* Static */:
            if (downgradedModule) {
                throw new Error("Error while " + attemptedAction + ": 'downgradedModule' unexpectedly specified.\n" +
                    'You should not specify a value for \'downgradedModule\', unless you are downgrading ' +
                    'more than one Angular module (via \'downgradeModule()\').');
            }
            break;
        case 3 /* Lite */:
            if (!downgradedModule && (downgradedModuleCount >= 2)) {
                throw new Error("Error while " + attemptedAction + ": 'downgradedModule' not specified.\n" +
                    'This application contains more than one downgraded Angular module, thus you need to ' +
                    'always specify \'downgradedModule\' when downgrading components and injectables.');
            }
            if (!$injector.has(injectionKey)) {
                throw new Error("Error while " + attemptedAction + ": Unable to find the specified downgraded module.\n" +
                    'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                    'application?');
            }
            break;
        default:
            throw new Error("Error while " + attemptedAction + ": Not a valid '@angular/upgrade' application.\n" +
                'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                'application?');
    }
}
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        this.promise = new Promise(function (res, rej) {
            _this.resolve = res;
            _this.reject = rej;
        });
    }
    return Deferred;
}());
export { Deferred };
/**
 * @return Whether the passed-in component implements the subset of the
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
 */
export function hookupNgModel(ngModel, component) {
    if (ngModel && supportsNgModel(component)) {
        ngModel.$render = function () { component.writeValue(ngModel.$viewValue); };
        component.registerOnChange(ngModel.$setViewValue.bind(ngModel));
        if (typeof component.registerOnTouched === 'function') {
            component.registerOnTouched(ngModel.$setTouched.bind(ngModel));
        }
    }
}
/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export function strictEquals(val1, val2) {
    return val1 === val2 || (val1 !== val1 && val2 !== val2);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBQywyQkFBMkIsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUU5RSxJQUFNLHVCQUF1QixHQUFHLG9CQUFvQixDQUFDO0FBQ3JELElBQU0sOEJBQThCLEdBQUcsYUFBYSxDQUFDO0FBRXJELE1BQU0sVUFBVSxPQUFPLENBQUMsQ0FBTTtJQUM1Qix5REFBeUQ7SUFDekQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMzQjtTQUFNO1FBQ0wsc0NBQXNDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6QjtJQUNELE1BQU0sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsSUFBWTtJQUN4QyxPQUFPLEdBQUcsR0FBRyxJQUFJLEdBQUcsWUFBWSxDQUFDO0FBQ25DLENBQUM7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsSUFBWTtJQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxDQUFDO1NBQzNDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxVQUFDLENBQUMsRUFBRSxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQXBCLENBQW9CLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBRUQsTUFBTSxVQUFVLFdBQVcsQ0FBQyxJQUFlO0lBQ3pDLDRFQUE0RTtJQUM1RSxPQUFRLElBQVksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JGLENBQUM7QUFFRCxNQUFNLFVBQVUsd0JBQXdCLENBQUMsU0FBbUM7SUFDMUUsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRUQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLFNBQW1DO0lBQ25FLE9BQU8sU0FBUyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztvQkFDbEIsQ0FBQztBQUNuRSxDQUFDO0FBRUQsTUFBTSxVQUFVLFVBQVUsQ0FBQyxLQUFVO0lBQ25DLE9BQU8sT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDO0FBQ3JDLENBQUM7QUFFRCxNQUFNLFVBQVUsb0JBQW9CLENBQ2hDLFNBQW1DLEVBQUUsZ0JBQXdCLEVBQUUsWUFBb0IsRUFDbkYsZUFBdUI7SUFDekIsSUFBTSxjQUFjLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEQsSUFBTSxxQkFBcUIsR0FBRyx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUVsRSwyQkFBMkI7SUFDM0IsUUFBUSxjQUFjLEVBQUU7UUFDdEIscUJBQTRCO1FBQzVCO1lBQ0UsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FDWCxpQkFBZSxlQUFlLG1EQUFnRDtvQkFDOUUsc0ZBQXNGO29CQUN0RiwyREFBMkQsQ0FBQyxDQUFDO2FBQ2xFO1lBQ0QsTUFBTTtRQUNSO1lBQ0UsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMscUJBQXFCLElBQUksQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JELE1BQU0sSUFBSSxLQUFLLENBQ1gsaUJBQWUsZUFBZSwwQ0FBdUM7b0JBQ3JFLHNGQUFzRjtvQkFDdEYsa0ZBQWtGLENBQUMsQ0FBQzthQUN6RjtZQUVELElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksS0FBSyxDQUNYLGlCQUFlLGVBQWUsd0RBQXFEO29CQUNuRiwrRUFBK0U7b0JBQy9FLGNBQWMsQ0FBQyxDQUFDO2FBQ3JCO1lBRUQsTUFBTTtRQUNSO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FDWCxpQkFBZSxlQUFlLG9EQUFpRDtnQkFDL0UsK0VBQStFO2dCQUMvRSxjQUFjLENBQUMsQ0FBQztLQUN2QjtBQUNILENBQUM7QUFFRDtJQU9FO1FBQUEsaUJBS0M7UUFKQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUc7WUFDbEMsS0FBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7WUFDbkIsS0FBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0gsZUFBQztBQUFELENBQUMsQUFiRCxJQWFDOztBQXdCRDs7OztHQUlHO0FBQ0gsU0FBUyxlQUFlLENBQUMsU0FBYztJQUNyQyxPQUFPLE9BQU8sU0FBUyxDQUFDLFVBQVUsS0FBSyxVQUFVO1FBQzdDLE9BQU8sU0FBUyxDQUFDLGdCQUFnQixLQUFLLFVBQVUsQ0FBQztBQUN2RCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGFBQWEsQ0FBQyxPQUFtQyxFQUFFLFNBQWM7SUFDL0UsSUFBSSxPQUFPLElBQUksZUFBZSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ3pDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsY0FBUSxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLE9BQU8sU0FBUyxDQUFDLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtZQUNyRCxTQUFTLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNoRTtLQUNGO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBQyxJQUFTLEVBQUUsSUFBUztJQUMvQyxPQUFPLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztBQUMzRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQge0RPV05HUkFERURfTU9EVUxFX0NPVU5UX0tFWSwgVVBHUkFERV9BUFBfVFlQRV9LRVl9IGZyb20gJy4vY29uc3RhbnRzJztcblxuY29uc3QgRElSRUNUSVZFX1BSRUZJWF9SRUdFWFAgPSAvXig/Onh8ZGF0YSlbOlxcLV9dL2k7XG5jb25zdCBESVJFQ1RJVkVfU1BFQ0lBTF9DSEFSU19SRUdFWFAgPSAvWzpcXC1fXSsoLikvZztcblxuZXhwb3J0IGZ1bmN0aW9uIG9uRXJyb3IoZTogYW55KSB7XG4gIC8vIFRPRE86IChtaXNrbyk6IFdlIHNlZW0gdG8gbm90IGhhdmUgYSBzdGFjayB0cmFjZSBoZXJlIVxuICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoZSwgZS5zdGFjayk7XG4gIH0gZWxzZSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLWNvbnNvbGVcbiAgICBjb25zb2xlLmxvZyhlLCBlLnN0YWNrKTtcbiAgfVxuICB0aHJvdyBlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udHJvbGxlcktleShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gJyQnICsgbmFtZSArICdDb250cm9sbGVyJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpcmVjdGl2ZU5vcm1hbGl6ZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKERJUkVDVElWRV9QUkVGSVhfUkVHRVhQLCAnJylcbiAgICAgIC5yZXBsYWNlKERJUkVDVElWRV9TUEVDSUFMX0NIQVJTX1JFR0VYUCwgKF8sIGxldHRlcikgPT4gbGV0dGVyLnRvVXBwZXJDYXNlKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZU5hbWUodHlwZTogVHlwZTxhbnk+KTogc3RyaW5nIHtcbiAgLy8gUmV0dXJuIHRoZSBuYW1lIG9mIHRoZSB0eXBlIG9yIHRoZSBmaXJzdCBsaW5lIG9mIGl0cyBzdHJpbmdpZmllZCB2ZXJzaW9uLlxuICByZXR1cm4gKHR5cGUgYXMgYW55KS5vdmVycmlkZGVuTmFtZSB8fCB0eXBlLm5hbWUgfHwgdHlwZS50b1N0cmluZygpLnNwbGl0KCdcXG4nKVswXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldERvd25ncmFkZWRNb2R1bGVDb3VudCgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSk6IG51bWJlciB7XG4gIHJldHVybiAkaW5qZWN0b3IuaGFzKERPV05HUkFERURfTU9EVUxFX0NPVU5UX0tFWSkgPyAkaW5qZWN0b3IuZ2V0KERPV05HUkFERURfTU9EVUxFX0NPVU5UX0tFWSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFVwZ3JhZGVBcHBUeXBlKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKTogVXBncmFkZUFwcFR5cGUge1xuICByZXR1cm4gJGluamVjdG9yLmhhcyhVUEdSQURFX0FQUF9UWVBFX0tFWSkgPyAkaW5qZWN0b3IuZ2V0KFVQR1JBREVfQVBQX1RZUEVfS0VZKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVwZ3JhZGVBcHBUeXBlLk5vbmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBGdW5jdGlvbiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUluamVjdGlvbktleShcbiAgICAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSwgZG93bmdyYWRlZE1vZHVsZTogc3RyaW5nLCBpbmplY3Rpb25LZXk6IHN0cmluZyxcbiAgICBhdHRlbXB0ZWRBY3Rpb246IHN0cmluZyk6IHZvaWQge1xuICBjb25zdCB1cGdyYWRlQXBwVHlwZSA9IGdldFVwZ3JhZGVBcHBUeXBlKCRpbmplY3Rvcik7XG4gIGNvbnN0IGRvd25ncmFkZWRNb2R1bGVDb3VudCA9IGdldERvd25ncmFkZWRNb2R1bGVDb3VudCgkaW5qZWN0b3IpO1xuXG4gIC8vIENoZWNrIGZvciBjb21tb24gZXJyb3JzLlxuICBzd2l0Y2ggKHVwZ3JhZGVBcHBUeXBlKSB7XG4gICAgY2FzZSBVcGdyYWRlQXBwVHlwZS5EeW5hbWljOlxuICAgIGNhc2UgVXBncmFkZUFwcFR5cGUuU3RhdGljOlxuICAgICAgaWYgKGRvd25ncmFkZWRNb2R1bGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogJ2Rvd25ncmFkZWRNb2R1bGUnIHVuZXhwZWN0ZWRseSBzcGVjaWZpZWQuXFxuYCArXG4gICAgICAgICAgICAnWW91IHNob3VsZCBub3Qgc3BlY2lmeSBhIHZhbHVlIGZvciBcXCdkb3duZ3JhZGVkTW9kdWxlXFwnLCB1bmxlc3MgeW91IGFyZSBkb3duZ3JhZGluZyAnICtcbiAgICAgICAgICAgICdtb3JlIHRoYW4gb25lIEFuZ3VsYXIgbW9kdWxlICh2aWEgXFwnZG93bmdyYWRlTW9kdWxlKClcXCcpLicpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSBVcGdyYWRlQXBwVHlwZS5MaXRlOlxuICAgICAgaWYgKCFkb3duZ3JhZGVkTW9kdWxlICYmIChkb3duZ3JhZGVkTW9kdWxlQ291bnQgPj0gMikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogJ2Rvd25ncmFkZWRNb2R1bGUnIG5vdCBzcGVjaWZpZWQuXFxuYCArXG4gICAgICAgICAgICAnVGhpcyBhcHBsaWNhdGlvbiBjb250YWlucyBtb3JlIHRoYW4gb25lIGRvd25ncmFkZWQgQW5ndWxhciBtb2R1bGUsIHRodXMgeW91IG5lZWQgdG8gJyArXG4gICAgICAgICAgICAnYWx3YXlzIHNwZWNpZnkgXFwnZG93bmdyYWRlZE1vZHVsZVxcJyB3aGVuIGRvd25ncmFkaW5nIGNvbXBvbmVudHMgYW5kIGluamVjdGFibGVzLicpO1xuICAgICAgfVxuXG4gICAgICBpZiAoISRpbmplY3Rvci5oYXMoaW5qZWN0aW9uS2V5KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgRXJyb3Igd2hpbGUgJHthdHRlbXB0ZWRBY3Rpb259OiBVbmFibGUgdG8gZmluZCB0aGUgc3BlY2lmaWVkIGRvd25ncmFkZWQgbW9kdWxlLlxcbmAgK1xuICAgICAgICAgICAgJ0RpZCB5b3UgZm9yZ2V0IHRvIGRvd25ncmFkZSBhbiBBbmd1bGFyIG1vZHVsZSBvciBpbmNsdWRlIGl0IGluIHRoZSBBbmd1bGFySlMgJyArXG4gICAgICAgICAgICAnYXBwbGljYXRpb24/Jyk7XG4gICAgICB9XG5cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogTm90IGEgdmFsaWQgJ0Bhbmd1bGFyL3VwZ3JhZGUnIGFwcGxpY2F0aW9uLlxcbmAgK1xuICAgICAgICAgICdEaWQgeW91IGZvcmdldCB0byBkb3duZ3JhZGUgYW4gQW5ndWxhciBtb2R1bGUgb3IgaW5jbHVkZSBpdCBpbiB0aGUgQW5ndWxhckpTICcgK1xuICAgICAgICAgICdhcHBsaWNhdGlvbj8nKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGVmZXJyZWQ8Uj4ge1xuICBwcm9taXNlOiBQcm9taXNlPFI+O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVzb2x2ZSAhOiAodmFsdWU/OiBSIHwgUHJvbWlzZUxpa2U8Uj4pID0+IHZvaWQ7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICByZWplY3QgITogKGVycm9yPzogYW55KSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzO1xuICAgICAgdGhpcy5yZWplY3QgPSByZWo7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMYXp5TW9kdWxlUmVmIHtcbiAgLy8gV2hldGhlciB0aGUgQW5ndWxhckpTIGFwcCBoYXMgYmVlbiBib290c3RyYXBwZWQgb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lXG4gIC8vIChpbiB3aGljaCBjYXNlIGNhbGxzIHRvIEFuZ3VsYXIgQVBJcyBuZWVkIHRvIGJlIGJyb3VnaHQgYmFjayBpbikuXG4gIG5lZWRzTmdab25lOiBib29sZWFuO1xuICBpbmplY3Rvcj86IEluamVjdG9yO1xuICBwcm9taXNlPzogUHJvbWlzZTxJbmplY3Rvcj47XG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFVwZ3JhZGVBcHBUeXBlIHtcbiAgLy8gQXBwIE5PVCB1c2luZyBgQGFuZ3VsYXIvdXBncmFkZWAuIChUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4gaW4gYW4gYG5nVXBncmFkZWAgYXBwLilcbiAgTm9uZSxcblxuICAvLyBBcHAgdXNpbmcgdGhlIGRlcHJlY2F0ZWQgYEBhbmd1bGFyL3VwZ3JhZGVgIEFQSXMgKGEuay5hLiBkeW5hbWljIGBuZ1VwZ3JhZGVgKS5cbiAgRHluYW1pYyxcblxuICAvLyBBcHAgdXNpbmcgYEBhbmd1bGFyL3VwZ3JhZGUvc3RhdGljYCB3aXRoIGBVcGdyYWRlTW9kdWxlYC5cbiAgU3RhdGljLFxuXG4gIC8vIEFwcCB1c2luZyBAYW5ndWxhci91cGdyYWRlL3N0YXRpY2Agd2l0aCBgZG93bmdyYWRlTW9kdWxlKClgIChhLmsuYSBgbmdVcGdyYWRlYC1saXRlICkuXG4gIExpdGUsXG59XG5cbi8qKlxuICogQHJldHVybiBXaGV0aGVyIHRoZSBwYXNzZWQtaW4gY29tcG9uZW50IGltcGxlbWVudHMgdGhlIHN1YnNldCBvZiB0aGVcbiAqICAgICBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGludGVyZmFjZSBuZWVkZWQgZm9yIEFuZ3VsYXJKUyBgbmctbW9kZWxgXG4gKiAgICAgY29tcGF0aWJpbGl0eS5cbiAqL1xuZnVuY3Rpb24gc3VwcG9ydHNOZ01vZGVsKGNvbXBvbmVudDogYW55KSB7XG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LndyaXRlVmFsdWUgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIHR5cGVvZiBjb21wb25lbnQucmVnaXN0ZXJPbkNoYW5nZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuLyoqXG4gKiBHbHVlIHRoZSBBbmd1bGFySlMgYE5nTW9kZWxDb250cm9sbGVyYCAoaWYgaXQgZXhpc3RzKSB0byB0aGUgY29tcG9uZW50XG4gKiAoaWYgaXQgaW1wbGVtZW50cyB0aGUgbmVlZGVkIHN1YnNldCBvZiB0aGUgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaG9va3VwTmdNb2RlbChuZ01vZGVsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlciwgY29tcG9uZW50OiBhbnkpIHtcbiAgaWYgKG5nTW9kZWwgJiYgc3VwcG9ydHNOZ01vZGVsKGNvbXBvbmVudCkpIHtcbiAgICBuZ01vZGVsLiRyZW5kZXIgPSAoKSA9PiB7IGNvbXBvbmVudC53cml0ZVZhbHVlKG5nTW9kZWwuJHZpZXdWYWx1ZSk7IH07XG4gICAgY29tcG9uZW50LnJlZ2lzdGVyT25DaGFuZ2UobmdNb2RlbC4kc2V0Vmlld1ZhbHVlLmJpbmQobmdNb2RlbCkpO1xuICAgIGlmICh0eXBlb2YgY29tcG9uZW50LnJlZ2lzdGVyT25Ub3VjaGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb21wb25lbnQucmVnaXN0ZXJPblRvdWNoZWQobmdNb2RlbC4kc2V0VG91Y2hlZC5iaW5kKG5nTW9kZWwpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUZXN0IHR3byB2YWx1ZXMgZm9yIHN0cmljdCBlcXVhbGl0eSwgYWNjb3VudGluZyBmb3IgdGhlIGZhY3QgdGhhdCBgTmFOICE9PSBOYU5gLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaWN0RXF1YWxzKHZhbDE6IGFueSwgdmFsMjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWwxID09PSB2YWwyIHx8ICh2YWwxICE9PSB2YWwxICYmIHZhbDIgIT09IHZhbDIpO1xufVxuIl19