/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isFunction } from './util';
export function isThenable(obj) {
    return !!obj && isFunction(obj.then);
}
/**
 * Synchronous, promise-like object.
 */
var SyncPromise = /** @class */ (function () {
    function SyncPromise() {
        this.resolved = false;
        this.callbacks = [];
    }
    SyncPromise.all = function (valuesOrPromises) {
        var aggrPromise = new SyncPromise();
        var resolvedCount = 0;
        var results = [];
        var resolve = function (idx, value) {
            results[idx] = value;
            if (++resolvedCount === valuesOrPromises.length)
                aggrPromise.resolve(results);
        };
        valuesOrPromises.forEach(function (p, idx) {
            if (isThenable(p)) {
                p.then(function (v) { return resolve(idx, v); });
            }
            else {
                resolve(idx, p);
            }
        });
        return aggrPromise;
    };
    SyncPromise.prototype.resolve = function (value) {
        // Do nothing, if already resolved.
        if (this.resolved)
            return;
        this.value = value;
        this.resolved = true;
        // Run the queued callbacks.
        this.callbacks.forEach(function (callback) { return callback(value); });
        this.callbacks.length = 0;
    };
    SyncPromise.prototype.then = function (callback) {
        if (this.resolved) {
            callback(this.value);
        }
        else {
            this.callbacks.push(callback);
        }
    };
    return SyncPromise;
}());
export { SyncPromise };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvbWlzZV91dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL3NyYy9wcm9taXNlX3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUlsQyxNQUFNLFVBQVUsVUFBVSxDQUFJLEdBQVk7SUFDeEMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLFVBQVUsQ0FBRSxHQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDaEQsQ0FBQztBQUVEOztHQUVHO0FBQ0g7SUFBQTtRQUVVLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsY0FBUyxHQUE4QixFQUFFLENBQUM7SUEwQ3BELENBQUM7SUF4Q1EsZUFBRyxHQUFWLFVBQWMsZ0JBQW1DO1FBQy9DLElBQU0sV0FBVyxHQUFHLElBQUksV0FBVyxFQUFPLENBQUM7UUFFM0MsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLElBQU0sT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUN4QixJQUFNLE9BQU8sR0FBRyxVQUFDLEdBQVcsRUFBRSxLQUFRO1lBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDckIsSUFBSSxFQUFFLGFBQWEsS0FBSyxnQkFBZ0IsQ0FBQyxNQUFNO2dCQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEYsQ0FBQyxDQUFDO1FBRUYsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxFQUFFLEdBQUc7WUFDOUIsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2pCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFmLENBQWUsQ0FBQyxDQUFDO2FBQzlCO2lCQUFNO2dCQUNMLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDakI7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFRCw2QkFBTyxHQUFQLFVBQVEsS0FBUTtRQUNkLG1DQUFtQztRQUNuQyxJQUFJLElBQUksQ0FBQyxRQUFRO1lBQUUsT0FBTztRQUUxQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUVyQiw0QkFBNEI7UUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBQSxRQUFRLElBQUksT0FBQSxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQWYsQ0FBZSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCwwQkFBSSxHQUFKLFVBQUssUUFBK0I7UUFDbEMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBTyxDQUFDLENBQUM7U0FDeEI7YUFBTTtZQUNMLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO0lBQ0gsQ0FBQztJQUNILGtCQUFDO0FBQUQsQ0FBQyxBQTdDRCxJQTZDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc0Z1bmN0aW9ufSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRoZW5hYmxlPFQ+IHsgdGhlbihjYWxsYmFjazogKHZhbHVlOiBUKSA9PiBhbnkpOiBhbnk7IH1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVGhlbmFibGU8VD4ob2JqOiB1bmtub3duKTogb2JqIGlzIFRoZW5hYmxlPFQ+IHtcbiAgcmV0dXJuICEhb2JqICYmIGlzRnVuY3Rpb24oKG9iaiBhcyBhbnkpLnRoZW4pO1xufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzLCBwcm9taXNlLWxpa2Ugb2JqZWN0LlxuICovXG5leHBvcnQgY2xhc3MgU3luY1Byb21pc2U8VD4ge1xuICBwcm90ZWN0ZWQgdmFsdWU6IFR8dW5kZWZpbmVkO1xuICBwcml2YXRlIHJlc29sdmVkID0gZmFsc2U7XG4gIHByaXZhdGUgY2FsbGJhY2tzOiAoKHZhbHVlOiBUKSA9PiB1bmtub3duKVtdID0gW107XG5cbiAgc3RhdGljIGFsbDxUPih2YWx1ZXNPclByb21pc2VzOiAoVHxUaGVuYWJsZTxUPilbXSk6IFN5bmNQcm9taXNlPFRbXT4ge1xuICAgIGNvbnN0IGFnZ3JQcm9taXNlID0gbmV3IFN5bmNQcm9taXNlPFRbXT4oKTtcblxuICAgIGxldCByZXNvbHZlZENvdW50ID0gMDtcbiAgICBjb25zdCByZXN1bHRzOiBUW10gPSBbXTtcbiAgICBjb25zdCByZXNvbHZlID0gKGlkeDogbnVtYmVyLCB2YWx1ZTogVCkgPT4ge1xuICAgICAgcmVzdWx0c1tpZHhdID0gdmFsdWU7XG4gICAgICBpZiAoKytyZXNvbHZlZENvdW50ID09PSB2YWx1ZXNPclByb21pc2VzLmxlbmd0aCkgYWdnclByb21pc2UucmVzb2x2ZShyZXN1bHRzKTtcbiAgICB9O1xuXG4gICAgdmFsdWVzT3JQcm9taXNlcy5mb3JFYWNoKChwLCBpZHgpID0+IHtcbiAgICAgIGlmIChpc1RoZW5hYmxlKHApKSB7XG4gICAgICAgIHAudGhlbih2ID0+IHJlc29sdmUoaWR4LCB2KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKGlkeCwgcCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYWdnclByb21pc2U7XG4gIH1cblxuICByZXNvbHZlKHZhbHVlOiBUKTogdm9pZCB7XG4gICAgLy8gRG8gbm90aGluZywgaWYgYWxyZWFkeSByZXNvbHZlZC5cbiAgICBpZiAodGhpcy5yZXNvbHZlZCkgcmV0dXJuO1xuXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMucmVzb2x2ZWQgPSB0cnVlO1xuXG4gICAgLy8gUnVuIHRoZSBxdWV1ZWQgY2FsbGJhY2tzLlxuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2sodmFsdWUpKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG5cbiAgdGhlbihjYWxsYmFjazogKHZhbHVlOiBUKSA9PiB1bmtub3duKTogdm9pZCB7XG4gICAgaWYgKHRoaXMucmVzb2x2ZWQpIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMudmFsdWUgISk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxufVxuIl19