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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi91dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUtILE9BQU8sRUFBQywyQkFBMkIsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUU5RSxJQUFNLHVCQUF1QixHQUFHLG9CQUFvQixDQUFDO0FBQ3JELElBQU0sOEJBQThCLEdBQUcsYUFBYSxDQUFDO0FBRXJELE1BQU0sVUFBVSxPQUFPLENBQUMsQ0FBTTtJQUM1Qix5REFBeUQ7SUFDekQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO1FBQ2pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMzQjtTQUFNO1FBQ0wsc0NBQXNDO1FBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6QjtJQUNELE1BQU0sQ0FBQyxDQUFDO0FBQ1YsQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsSUFBWTtJQUN4QyxPQUFPLEdBQUcsR0FBRyxJQUFJLEdBQUcsWUFBWSxDQUFDO0FBQ25DLENBQUM7QUFFRCxNQUFNLFVBQVUsa0JBQWtCLENBQUMsSUFBWTtJQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxDQUFDO1NBQzNDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxVQUFDLENBQUMsRUFBRSxNQUFNLElBQUssT0FBQSxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQXBCLENBQW9CLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBRUQsTUFBTSxVQUFVLFdBQVcsQ0FBQyxJQUFlO0lBQ3pDLDRFQUE0RTtJQUM1RSxPQUFRLElBQVksQ0FBQyxjQUFjLElBQUksSUFBSSxD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LGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLE9BQU8sU0FBUyxDQUFDLGlCQUFpQixLQUFLLFVBQVUsRUFBRTtZQUNyRCxTQUFTLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNoRTtLQUNGO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBQyxJQUFTLEVBQUUsSUFBUztJQUMvQyxPQUFPLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztBQUMzRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdG9yLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJSW5qZWN0b3JTZXJ2aWNlLCBJTmdNb2RlbENvbnRyb2xsZXJ9IGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHtET1dOR1JBREVEX01PRFVMRV9DT1VOVF9LRVksIFVQR1JBREVfQVBQX1RZUEVfS0VZfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNvbnN0IERJUkVDVElWRV9QUkVGSVhfUkVHRVhQID0gL14oPzp4fGRhdGEpWzpcXC1fXS9pO1xuY29uc3QgRElSRUNUSVZFX1NQRUNJQUxfQ0hBUlNfUkVHRVhQID0gL1s6XFwtX10rKC4pL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbkVycm9yKGU6IGFueSkge1xuICAvLyBUT0RPOiAobWlza28pOiBXZSBzZWVtIHRvIG5vdCBoYXZlIGEgc3RhY2sgdHJhY2UgaGVyZSFcbiAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGUsIGUuc3RhY2spO1xuICB9IGVsc2Uge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2coZSwgZS5zdGFjayk7XG4gIH1cbiAgdGhyb3cgZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRyb2xsZXJLZXkobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuICckJyArIG5hbWUgKyAnQ29udHJvbGxlcic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXJlY3RpdmVOb3JtYWxpemUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5hbWUucmVwbGFjZShESVJFQ1RJVkVfUFJFRklYX1JFR0VYUCwgJycpXG4gICAgICAucmVwbGFjZShESVJFQ1RJVkVfU1BFQ0lBTF9DSEFSU19SRUdFWFAsIChfLCBsZXR0ZXIpID0+IGxldHRlci50b1VwcGVyQ2FzZSgpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVOYW1lKHR5cGU6IFR5cGU8YW55Pik6IHN0cmluZyB7XG4gIC8vIFJldHVybiB0aGUgbmFtZSBvZiB0aGUgdHlwZSBvciB0aGUgZmlyc3QgbGluZSBvZiBpdHMgc3RyaW5naWZpZWQgdmVyc2lvbi5cbiAgcmV0dXJuICh0eXBlIGFzIGFueSkub3ZlcnJpZGRlbk5hbWUgfHwgdHlwZS5uYW1lIHx8IHR5cGUudG9TdHJpbmcoKS5zcGxpdCgnXFxuJylbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQoJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlKTogbnVtYmVyIHtcbiAgcmV0dXJuICRpbmplY3Rvci5oYXMoRE9XTkdSQURFRF9NT0RVTEVfQ09VTlRfS0VZKSA/ICRpbmplY3Rvci5nZXQoRE9XTkdSQURFRF9NT0RVTEVfQ09VTlRfS0VZKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAwO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VXBncmFkZUFwcFR5cGUoJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlKTogVXBncmFkZUFwcFR5cGUge1xuICByZXR1cm4gJGluamVjdG9yLmhhcyhVUEdSQURFX0FQUF9UWVBFX0tFWSkgPyAkaW5qZWN0b3IuZ2V0KFVQR1JBREVfQVBQX1RZUEVfS0VZKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFVwZ3JhZGVBcHBUeXBlLk5vbmU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlOiBhbnkpOiB2YWx1ZSBpcyBGdW5jdGlvbiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUluamVjdGlvbktleShcbiAgICAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UsIGRvd25ncmFkZWRNb2R1bGU6IHN0cmluZywgaW5qZWN0aW9uS2V5OiBzdHJpbmcsXG4gICAgYXR0ZW1wdGVkQWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgdXBncmFkZUFwcFR5cGUgPSBnZXRVcGdyYWRlQXBwVHlwZSgkaW5qZWN0b3IpO1xuICBjb25zdCBkb3duZ3JhZGVkTW9kdWxlQ291bnQgPSBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQoJGluamVjdG9yKTtcblxuICAvLyBDaGVjayBmb3IgY29tbW9uIGVycm9ycy5cbiAgc3dpdGNoICh1cGdyYWRlQXBwVHlwZSkge1xuICAgIGNhc2UgVXBncmFkZUFwcFR5cGUuRHluYW1pYzpcbiAgICBjYXNlIFVwZ3JhZGVBcHBUeXBlLlN0YXRpYzpcbiAgICAgIGlmIChkb3duZ3JhZGVkTW9kdWxlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06ICdkb3duZ3JhZGVkTW9kdWxlJyB1bmV4cGVjdGVkbHkgc3BlY2lmaWVkLlxcbmAgK1xuICAgICAgICAgICAgJ1lvdSBzaG91bGQgbm90IHNwZWNpZnkgYSB2YWx1ZSBmb3IgXFwnZG93bmdyYWRlZE1vZHVsZVxcJywgdW5sZXNzIHlvdSBhcmUgZG93bmdyYWRpbmcgJyArXG4gICAgICAgICAgICAnbW9yZSB0aGFuIG9uZSBBbmd1bGFyIG1vZHVsZSAodmlhIFxcJ2Rvd25ncmFkZU1vZHVsZSgpXFwnKS4nKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgVXBncmFkZUFwcFR5cGUuTGl0ZTpcbiAgICAgIGlmICghZG93bmdyYWRlZE1vZHVsZSAmJiAoZG93bmdyYWRlZE1vZHVsZUNvdW50ID49IDIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06ICdkb3duZ3JhZGVkTW9kdWxlJyBub3Qgc3BlY2lmaWVkLlxcbmAgK1xuICAgICAgICAgICAgJ1RoaXMgYXBwbGljYXRpb24gY29udGFpbnMgbW9yZSB0aGFuIG9uZSBkb3duZ3JhZGVkIEFuZ3VsYXIgbW9kdWxlLCB0aHVzIHlvdSBuZWVkIHRvICcgK1xuICAgICAgICAgICAgJ2Fsd2F5cyBzcGVjaWZ5IFxcJ2Rvd25ncmFkZWRNb2R1bGVcXCcgd2hlbiBkb3duZ3JhZGluZyBjb21wb25lbnRzIGFuZCBpbmplY3RhYmxlcy4nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEkaW5qZWN0b3IuaGFzKGluamVjdGlvbktleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogVW5hYmxlIHRvIGZpbmQgdGhlIHNwZWNpZmllZCBkb3duZ3JhZGVkIG1vZHVsZS5cXG5gICtcbiAgICAgICAgICAgICdEaWQgeW91IGZvcmdldCB0byBkb3duZ3JhZGUgYW4gQW5ndWxhciBtb2R1bGUgb3IgaW5jbHVkZSBpdCBpbiB0aGUgQW5ndWxhckpTICcgK1xuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uPycpO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06IE5vdCBhIHZhbGlkICdAYW5ndWxhci91cGdyYWRlJyBhcHBsaWNhdGlvbi5cXG5gICtcbiAgICAgICAgICAnRGlkIHlvdSBmb3JnZXQgdG8gZG93bmdyYWRlIGFuIEFuZ3VsYXIgbW9kdWxlIG9yIGluY2x1ZGUgaXQgaW4gdGhlIEFuZ3VsYXJKUyAnICtcbiAgICAgICAgICAnYXBwbGljYXRpb24/Jyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmVycmVkPFI+IHtcbiAgcHJvbWlzZTogUHJvbWlzZTxSPjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlc29sdmUgITogKHZhbHVlPzogUiB8IFByb21pc2VMaWtlPFI+KSA9PiB2b2lkO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVqZWN0ICE6IChlcnJvcj86IGFueSkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlcztcbiAgICAgIHRoaXMucmVqZWN0ID0gcmVqO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGF6eU1vZHVsZVJlZiB7XG4gIGluamVjdG9yPzogSW5qZWN0b3I7XG4gIHByb21pc2U/OiBQcm9taXNlPEluamVjdG9yPjtcbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gVXBncmFkZUFwcFR5cGUge1xuICAvLyBBcHAgTk9UIHVzaW5nIGBAYW5ndWxhci91cGdyYWRlYC4gKFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiBpbiBhbiBgbmdVcGdyYWRlYCBhcHAuKVxuICBOb25lLFxuXG4gIC8vIEFwcCB1c2luZyB0aGUgZGVwcmVjYXRlZCBgQGFuZ3VsYXIvdXBncmFkZWAgQVBJcyAoYS5rLmEuIGR5bmFtaWMgYG5nVXBncmFkZWApLlxuICBEeW5hbWljLFxuXG4gIC8vIEFwcCB1c2luZyBgQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWNgIHdpdGggYFVwZ3JhZGVNb2R1bGVgLlxuICBTdGF0aWMsXG5cbiAgLy8gQXBwIHVzaW5nIEBhbmd1bGFyL3VwZ3JhZGUvc3RhdGljYCB3aXRoIGBkb3duZ3JhZGVNb2R1bGUoKWAgKGEuay5hIGBuZ1VwZ3JhZGVgLWxpdGUgKS5cbiAgTGl0ZSxcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHBhc3NlZC1pbiBjb21wb25lbnQgaW1wbGVtZW50cyB0aGUgc3Vic2V0IG9mIHRoZVxuICogICAgIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgaW50ZXJmYWNlIG5lZWRlZCBmb3IgQW5ndWxhckpTIGBuZy1tb2RlbGBcbiAqICAgICBjb21wYXRpYmlsaXR5LlxuICovXG5mdW5jdGlvbiBzdXBwb3J0c05nTW9kZWwoY29tcG9uZW50OiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjb21wb25lbnQud3JpdGVWYWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIGNvbXBvbmVudC5yZWdpc3Rlck9uQ2hhbmdlID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEdsdWUgdGhlIEFuZ3VsYXJKUyBgTmdNb2RlbENvbnRyb2xsZXJgIChpZiBpdCBleGlzdHMpIHRvIHRoZSBjb21wb25lbnRcbiAqIChpZiBpdCBpbXBsZW1lbnRzIHRoZSBuZWVkZWQgc3Vic2V0IG9mIHRoZSBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGludGVyZmFjZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBob29rdXBOZ01vZGVsKG5nTW9kZWw6IElOZ01vZGVsQ29udHJvbGxlciwgY29tcG9uZW50OiBhbnkpIHtcbiAgaWYgKG5nTW9kZWwgJiYgc3VwcG9ydHNOZ01vZGVsKGNvbXBvbmVudCkpIHtcbiAgICBuZ01vZGVsLiRyZW5kZXIgPSAoKSA9PiB7IGNvbXBvbmVudC53cml0ZVZhbHVlKG5nTW9kZWwuJHZpZXdWYWx1ZSk7IH07XG4gICAgY29tcG9uZW50LnJlZ2lzdGVyT25DaGFuZ2UobmdNb2RlbC4kc2V0Vmlld1ZhbHVlLmJpbmQobmdNb2RlbCkpO1xuICAgIGlmICh0eXBlb2YgY29tcG9uZW50LnJlZ2lzdGVyT25Ub3VjaGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb21wb25lbnQucmVnaXN0ZXJPblRvdWNoZWQobmdNb2RlbC4kc2V0VG91Y2hlZC5iaW5kKG5nTW9kZWwpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUZXN0IHR3byB2YWx1ZXMgZm9yIHN0cmljdCBlcXVhbGl0eSwgYWNjb3VudGluZyBmb3IgdGhlIGZhY3QgdGhhdCBgTmFOICE9PSBOYU5gLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyaWN0RXF1YWxzKHZhbDE6IGFueSwgdmFsMjogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiB2YWwxID09PSB2YWwyIHx8ICh2YWwxICE9PSB2YWwxICYmIHZhbDIgIT09IHZhbDIpO1xufVxuIl19