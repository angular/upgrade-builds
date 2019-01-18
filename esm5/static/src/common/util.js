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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9jb21tb24vdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFJSCxPQUFPLEVBQUMsMkJBQTJCLEVBQUUsb0JBQW9CLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFFOUUsSUFBTSx1QkFBdUIsR0FBRyxvQkFBb0IsQ0FBQztBQUNyRCxJQUFNLDhCQUE4QixHQUFHLGFBQWEsQ0FBQztBQUVyRCxNQUFNLFVBQVUsT0FBTyxDQUFDLENBQU07SUFDNUIseURBQXlEO0lBQ3pELElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtRQUNqQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDM0I7U0FBTTtRQUNMLHNDQUFzQztRQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekI7SUFDRCxNQUFNLENBQUMsQ0FBQztBQUNWLENBQUM7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUFDLElBQVk7SUFDeEMsT0FBTyxHQUFHLEdBQUcsSUFBSSxHQUFHLFlBQVksQ0FBQztBQUNuQyxDQUFDO0FBRUQsTUFBTSxVQUFVLGtCQUFrQixDQUFDLElBQVk7SUFDN0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEVBQUUsQ0FBQztTQUMzQyxPQUFPLENBQUMsOEJBQThCLEVBQUUsVUFBQyxDQUFDLEVBQUUsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFwQixDQUFvQixDQUFDLENBQUM7QUFDcEYsQ0FBQztBQUVELE1BQU0sVUFBVSxXQUFXLENBQUMsSUFBZTtJQUN6Qyw0RUFBNEU7SUFDNUUsT0FBUSxJQUFZLENBQUMsY0FB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QUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDaEUsSUFBSSxPQUFPLFNBQVMsQ0FBQyxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7WUFDckQsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDaEU7S0FDRjtBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQUMsSUFBUyxFQUFFLElBQVM7SUFDL0MsT0FBTyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7QUFDM0QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3RvciwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHtET1dOR1JBREVEX01PRFVMRV9DT1VOVF9LRVksIFVQR1JBREVfQVBQX1RZUEVfS0VZfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmNvbnN0IERJUkVDVElWRV9QUkVGSVhfUkVHRVhQID0gL14oPzp4fGRhdGEpWzpcXC1fXS9pO1xuY29uc3QgRElSRUNUSVZFX1NQRUNJQUxfQ0hBUlNfUkVHRVhQID0gL1s6XFwtX10rKC4pL2c7XG5cbmV4cG9ydCBmdW5jdGlvbiBvbkVycm9yKGU6IGFueSkge1xuICAvLyBUT0RPOiAobWlza28pOiBXZSBzZWVtIHRvIG5vdCBoYXZlIGEgc3RhY2sgdHJhY2UgaGVyZSFcbiAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGUsIGUuc3RhY2spO1xuICB9IGVsc2Uge1xuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2coZSwgZS5zdGFjayk7XG4gIH1cbiAgdGhyb3cgZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRyb2xsZXJLZXkobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuICckJyArIG5hbWUgKyAnQ29udHJvbGxlcic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXJlY3RpdmVOb3JtYWxpemUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIG5hbWUucmVwbGFjZShESVJFQ1RJVkVfUFJFRklYX1JFR0VYUCwgJycpXG4gICAgICAucmVwbGFjZShESVJFQ1RJVkVfU1BFQ0lBTF9DSEFSU19SRUdFWFAsIChfLCBsZXR0ZXIpID0+IGxldHRlci50b1VwcGVyQ2FzZSgpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVOYW1lKHR5cGU6IFR5cGU8YW55Pik6IHN0cmluZyB7XG4gIC8vIFJldHVybiB0aGUgbmFtZSBvZiB0aGUgdHlwZSBvciB0aGUgZmlyc3QgbGluZSBvZiBpdHMgc3RyaW5naWZpZWQgdmVyc2lvbi5cbiAgcmV0dXJuICh0eXBlIGFzIGFueSkub3ZlcnJpZGRlbk5hbWUgfHwgdHlwZS5uYW1lIHx8IHR5cGUudG9TdHJpbmcoKS5zcGxpdCgnXFxuJylbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpOiBudW1iZXIge1xuICByZXR1cm4gJGluamVjdG9yLmhhcyhET1dOR1JBREVEX01PRFVMRV9DT1VOVF9LRVkpID8gJGluamVjdG9yLmdldChET1dOR1JBREVEX01PRFVMRV9DT1VOVF9LRVkpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRVcGdyYWRlQXBwVHlwZSgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSk6IFVwZ3JhZGVBcHBUeXBlIHtcbiAgcmV0dXJuICRpbmplY3Rvci5oYXMoVVBHUkFERV9BUFBfVFlQRV9LRVkpID8gJGluamVjdG9yLmdldChVUEdSQURFX0FQUF9UWVBFX0tFWSkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBVcGdyYWRlQXBwVHlwZS5Ob25lO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZTogYW55KTogdmFsdWUgaXMgRnVuY3Rpb24ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVJbmplY3Rpb25LZXkoXG4gICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsIGRvd25ncmFkZWRNb2R1bGU6IHN0cmluZywgaW5qZWN0aW9uS2V5OiBzdHJpbmcsXG4gICAgYXR0ZW1wdGVkQWN0aW9uOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3QgdXBncmFkZUFwcFR5cGUgPSBnZXRVcGdyYWRlQXBwVHlwZSgkaW5qZWN0b3IpO1xuICBjb25zdCBkb3duZ3JhZGVkTW9kdWxlQ291bnQgPSBnZXREb3duZ3JhZGVkTW9kdWxlQ291bnQoJGluamVjdG9yKTtcblxuICAvLyBDaGVjayBmb3IgY29tbW9uIGVycm9ycy5cbiAgc3dpdGNoICh1cGdyYWRlQXBwVHlwZSkge1xuICAgIGNhc2UgVXBncmFkZUFwcFR5cGUuRHluYW1pYzpcbiAgICBjYXNlIFVwZ3JhZGVBcHBUeXBlLlN0YXRpYzpcbiAgICAgIGlmIChkb3duZ3JhZGVkTW9kdWxlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06ICdkb3duZ3JhZGVkTW9kdWxlJyB1bmV4cGVjdGVkbHkgc3BlY2lmaWVkLlxcbmAgK1xuICAgICAgICAgICAgJ1lvdSBzaG91bGQgbm90IHNwZWNpZnkgYSB2YWx1ZSBmb3IgXFwnZG93bmdyYWRlZE1vZHVsZVxcJywgdW5sZXNzIHlvdSBhcmUgZG93bmdyYWRpbmcgJyArXG4gICAgICAgICAgICAnbW9yZSB0aGFuIG9uZSBBbmd1bGFyIG1vZHVsZSAodmlhIFxcJ2Rvd25ncmFkZU1vZHVsZSgpXFwnKS4nKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgVXBncmFkZUFwcFR5cGUuTGl0ZTpcbiAgICAgIGlmICghZG93bmdyYWRlZE1vZHVsZSAmJiAoZG93bmdyYWRlZE1vZHVsZUNvdW50ID49IDIpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06ICdkb3duZ3JhZGVkTW9kdWxlJyBub3Qgc3BlY2lmaWVkLlxcbmAgK1xuICAgICAgICAgICAgJ1RoaXMgYXBwbGljYXRpb24gY29udGFpbnMgbW9yZSB0aGFuIG9uZSBkb3duZ3JhZGVkIEFuZ3VsYXIgbW9kdWxlLCB0aHVzIHlvdSBuZWVkIHRvICcgK1xuICAgICAgICAgICAgJ2Fsd2F5cyBzcGVjaWZ5IFxcJ2Rvd25ncmFkZWRNb2R1bGVcXCcgd2hlbiBkb3duZ3JhZGluZyBjb21wb25lbnRzIGFuZCBpbmplY3RhYmxlcy4nKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEkaW5qZWN0b3IuaGFzKGluamVjdGlvbktleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYEVycm9yIHdoaWxlICR7YXR0ZW1wdGVkQWN0aW9ufTogVW5hYmxlIHRvIGZpbmQgdGhlIHNwZWNpZmllZCBkb3duZ3JhZGVkIG1vZHVsZS5cXG5gICtcbiAgICAgICAgICAgICdEaWQgeW91IGZvcmdldCB0byBkb3duZ3JhZGUgYW4gQW5ndWxhciBtb2R1bGUgb3IgaW5jbHVkZSBpdCBpbiB0aGUgQW5ndWxhckpTICcgK1xuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uPycpO1xuICAgICAgfVxuXG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBFcnJvciB3aGlsZSAke2F0dGVtcHRlZEFjdGlvbn06IE5vdCBhIHZhbGlkICdAYW5ndWxhci91cGdyYWRlJyBhcHBsaWNhdGlvbi5cXG5gICtcbiAgICAgICAgICAnRGlkIHlvdSBmb3JnZXQgdG8gZG93bmdyYWRlIGFuIEFuZ3VsYXIgbW9kdWxlIG9yIGluY2x1ZGUgaXQgaW4gdGhlIEFuZ3VsYXJKUyAnICtcbiAgICAgICAgICAnYXBwbGljYXRpb24/Jyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlZmVycmVkPFI+IHtcbiAgcHJvbWlzZTogUHJvbWlzZTxSPjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHJlc29sdmUgITogKHZhbHVlPzogUiB8IFByb21pc2VMaWtlPFI+KSA9PiB2b2lkO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcmVqZWN0ICE6IChlcnJvcj86IGFueSkgPT4gdm9pZDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlcztcbiAgICAgIHRoaXMucmVqZWN0ID0gcmVqO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGF6eU1vZHVsZVJlZiB7XG4gIGluamVjdG9yPzogSW5qZWN0b3I7XG4gIHByb21pc2U/OiBQcm9taXNlPEluamVjdG9yPjtcbn1cblxuZXhwb3J0IGNvbnN0IGVudW0gVXBncmFkZUFwcFR5cGUge1xuICAvLyBBcHAgTk9UIHVzaW5nIGBAYW5ndWxhci91cGdyYWRlYC4gKFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiBpbiBhbiBgbmdVcGdyYWRlYCBhcHAuKVxuICBOb25lLFxuXG4gIC8vIEFwcCB1c2luZyB0aGUgZGVwcmVjYXRlZCBgQGFuZ3VsYXIvdXBncmFkZWAgQVBJcyAoYS5rLmEuIGR5bmFtaWMgYG5nVXBncmFkZWApLlxuICBEeW5hbWljLFxuXG4gIC8vIEFwcCB1c2luZyBgQGFuZ3VsYXIvdXBncmFkZS9zdGF0aWNgIHdpdGggYFVwZ3JhZGVNb2R1bGVgLlxuICBTdGF0aWMsXG5cbiAgLy8gQXBwIHVzaW5nIEBhbmd1bGFyL3VwZ3JhZGUvc3RhdGljYCB3aXRoIGBkb3duZ3JhZGVNb2R1bGUoKWAgKGEuay5hIGBuZ1VwZ3JhZGVgLWxpdGUgKS5cbiAgTGl0ZSxcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFdoZXRoZXIgdGhlIHBhc3NlZC1pbiBjb21wb25lbnQgaW1wbGVtZW50cyB0aGUgc3Vic2V0IG9mIHRoZVxuICogICAgIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgaW50ZXJmYWNlIG5lZWRlZCBmb3IgQW5ndWxhckpTIGBuZy1tb2RlbGBcbiAqICAgICBjb21wYXRpYmlsaXR5LlxuICovXG5mdW5jdGlvbiBzdXBwb3J0c05nTW9kZWwoY29tcG9uZW50OiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjb21wb25lbnQud3JpdGVWYWx1ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgdHlwZW9mIGNvbXBvbmVudC5yZWdpc3Rlck9uQ2hhbmdlID09PSAnZnVuY3Rpb24nO1xufVxuXG4vKipcbiAqIEdsdWUgdGhlIEFuZ3VsYXJKUyBgTmdNb2RlbENvbnRyb2xsZXJgIChpZiBpdCBleGlzdHMpIHRvIHRoZSBjb21wb25lbnRcbiAqIChpZiBpdCBpbXBsZW1lbnRzIHRoZSBuZWVkZWQgc3Vic2V0IG9mIHRoZSBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGludGVyZmFjZSkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBob29rdXBOZ01vZGVsKG5nTW9kZWw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyLCBjb21wb25lbnQ6IGFueSkge1xuICBpZiAobmdNb2RlbCAmJiBzdXBwb3J0c05nTW9kZWwoY29tcG9uZW50KSkge1xuICAgIG5nTW9kZWwuJHJlbmRlciA9ICgpID0+IHsgY29tcG9uZW50LndyaXRlVmFsdWUobmdNb2RlbC4kdmlld1ZhbHVlKTsgfTtcbiAgICBjb21wb25lbnQucmVnaXN0ZXJPbkNoYW5nZShuZ01vZGVsLiRzZXRWaWV3VmFsdWUuYmluZChuZ01vZGVsKSk7XG4gICAgaWYgKHR5cGVvZiBjb21wb25lbnQucmVnaXN0ZXJPblRvdWNoZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbXBvbmVudC5yZWdpc3Rlck9uVG91Y2hlZChuZ01vZGVsLiRzZXRUb3VjaGVkLmJpbmQobmdNb2RlbCkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFRlc3QgdHdvIHZhbHVlcyBmb3Igc3RyaWN0IGVxdWFsaXR5LCBhY2NvdW50aW5nIGZvciB0aGUgZmFjdCB0aGF0IGBOYU4gIT09IE5hTmAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJpY3RFcXVhbHModmFsMTogYW55LCB2YWwyOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIHZhbDEgPT09IHZhbDIgfHwgKHZhbDEgIT09IHZhbDEgJiYgdmFsMiAhPT0gdmFsMik7XG59XG4iXX0=