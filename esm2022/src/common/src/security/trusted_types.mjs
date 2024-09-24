/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * The Trusted Types policy, or null if Trusted Types are not
 * enabled/supported, or undefined if the policy has not been created yet.
 */
let policy;
/**
 * Returns the Trusted Types policy, or null if Trusted Types are not
 * enabled/supported. The first call to this function will create the policy.
 */
function getPolicy() {
    if (policy === undefined) {
        policy = null;
        const windowWithTrustedTypes = window;
        if (windowWithTrustedTypes.trustedTypes) {
            try {
                policy = windowWithTrustedTypes.trustedTypes.createPolicy('angular#unsafe-upgrade', {
                    createHTML: (s) => s,
                });
            }
            catch {
                // trustedTypes.createPolicy throws if called with a name that is
                // already registered, even in report-only mode. Until the API changes,
                // catch the error not to break the applications functionally. In such
                // cases, the code will fall back to using strings.
            }
        }
    }
    return policy;
}
/**
 * Unsafely promote a legacy AngularJS template to a TrustedHTML, falling back
 * to strings when Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, the template string should
 * always be under full control of the application author, as untrusted input
 * can cause an XSS vulnerability.
 */
export function trustedHTMLFromLegacyTemplate(html) {
    return getPolicy()?.createHTML(html) || html;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZF90eXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi9zcmMvc2VjdXJpdHkvdHJ1c3RlZF90eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFjSDs7O0dBR0c7QUFDSCxJQUFJLE1BQTRDLENBQUM7QUFFakQ7OztHQUdHO0FBQ0gsU0FBUyxTQUFTO0lBQ2hCLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDZCxNQUFNLHNCQUFzQixHQUFHLE1BQThELENBQUM7UUFDOUYsSUFBSSxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsd0JBQXdCLEVBQUU7b0JBQ2xGLFVBQVUsRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDN0IsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUFDLE1BQU0sQ0FBQztnQkFDUCxpRUFBaUU7Z0JBQ2pFLHVFQUF1RTtnQkFDdkUsc0VBQXNFO2dCQUN0RSxtREFBbUQ7WUFDckQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsSUFBWTtJQUN4RCxPQUFPLFNBQVMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDL0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmRldi9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3XG4gKiBBIG1vZHVsZSB0byBmYWNpbGl0YXRlIHVzZSBvZiBhIFRydXN0ZWQgVHlwZXMgcG9saWN5IGludGVybmFsbHkgd2l0aGluXG4gKiB0aGUgdXBncmFkZSBwYWNrYWdlLiBJdCBsYXppbHkgY29uc3RydWN0cyB0aGUgVHJ1c3RlZCBUeXBlcyBwb2xpY3ksIHByb3ZpZGluZ1xuICogaGVscGVyIHV0aWxpdGllcyBmb3IgcHJvbW90aW5nIHN0cmluZ3MgdG8gVHJ1c3RlZCBUeXBlcy4gV2hlbiBUcnVzdGVkIFR5cGVzXG4gKiBhcmUgbm90IGF2YWlsYWJsZSwgc3RyaW5ncyBhcmUgdXNlZCBhcyBhIGZhbGxiYWNrLlxuICogQHNlY3VyaXR5IEFsbCB1c2Ugb2YgdGhpcyBtb2R1bGUgaXMgc2VjdXJpdHktc2Vuc2l0aXZlIGFuZCBzaG91bGQgZ28gdGhyb3VnaFxuICogc2VjdXJpdHkgcmV2aWV3LlxuICovXG5cbmltcG9ydCB7VHJ1c3RlZEhUTUwsIFRydXN0ZWRUeXBlUG9saWN5LCBUcnVzdGVkVHlwZVBvbGljeUZhY3Rvcnl9IGZyb20gJy4vdHJ1c3RlZF90eXBlc19kZWZzJztcblxuLyoqXG4gKiBUaGUgVHJ1c3RlZCBUeXBlcyBwb2xpY3ksIG9yIG51bGwgaWYgVHJ1c3RlZCBUeXBlcyBhcmUgbm90XG4gKiBlbmFibGVkL3N1cHBvcnRlZCwgb3IgdW5kZWZpbmVkIGlmIHRoZSBwb2xpY3kgaGFzIG5vdCBiZWVuIGNyZWF0ZWQgeWV0LlxuICovXG5sZXQgcG9saWN5OiBUcnVzdGVkVHlwZVBvbGljeSB8IG51bGwgfCB1bmRlZmluZWQ7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgVHJ1c3RlZCBUeXBlcyBwb2xpY3ksIG9yIG51bGwgaWYgVHJ1c3RlZCBUeXBlcyBhcmUgbm90XG4gKiBlbmFibGVkL3N1cHBvcnRlZC4gVGhlIGZpcnN0IGNhbGwgdG8gdGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSB0aGUgcG9saWN5LlxuICovXG5mdW5jdGlvbiBnZXRQb2xpY3koKTogVHJ1c3RlZFR5cGVQb2xpY3kgfCBudWxsIHtcbiAgaWYgKHBvbGljeSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcG9saWN5ID0gbnVsbDtcbiAgICBjb25zdCB3aW5kb3dXaXRoVHJ1c3RlZFR5cGVzID0gd2luZG93IGFzIHVua25vd24gYXMge3RydXN0ZWRUeXBlcz86IFRydXN0ZWRUeXBlUG9saWN5RmFjdG9yeX07XG4gICAgaWYgKHdpbmRvd1dpdGhUcnVzdGVkVHlwZXMudHJ1c3RlZFR5cGVzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBwb2xpY3kgPSB3aW5kb3dXaXRoVHJ1c3RlZFR5cGVzLnRydXN0ZWRUeXBlcy5jcmVhdGVQb2xpY3koJ2FuZ3VsYXIjdW5zYWZlLXVwZ3JhZGUnLCB7XG4gICAgICAgICAgY3JlYXRlSFRNTDogKHM6IHN0cmluZykgPT4gcyxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gdHJ1c3RlZFR5cGVzLmNyZWF0ZVBvbGljeSB0aHJvd3MgaWYgY2FsbGVkIHdpdGggYSBuYW1lIHRoYXQgaXNcbiAgICAgICAgLy8gYWxyZWFkeSByZWdpc3RlcmVkLCBldmVuIGluIHJlcG9ydC1vbmx5IG1vZGUuIFVudGlsIHRoZSBBUEkgY2hhbmdlcyxcbiAgICAgICAgLy8gY2F0Y2ggdGhlIGVycm9yIG5vdCB0byBicmVhayB0aGUgYXBwbGljYXRpb25zIGZ1bmN0aW9uYWxseS4gSW4gc3VjaFxuICAgICAgICAvLyBjYXNlcywgdGhlIGNvZGUgd2lsbCBmYWxsIGJhY2sgdG8gdXNpbmcgc3RyaW5ncy5cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBvbGljeTtcbn1cblxuLyoqXG4gKiBVbnNhZmVseSBwcm9tb3RlIGEgbGVnYWN5IEFuZ3VsYXJKUyB0ZW1wbGF0ZSB0byBhIFRydXN0ZWRIVE1MLCBmYWxsaW5nIGJhY2tcbiAqIHRvIHN0cmluZ3Mgd2hlbiBUcnVzdGVkIFR5cGVzIGFyZSBub3QgYXZhaWxhYmxlLlxuICogQHNlY3VyaXR5IFRoaXMgaXMgYSBzZWN1cml0eS1zZW5zaXRpdmUgZnVuY3Rpb247IGFueSB1c2Ugb2YgdGhpcyBmdW5jdGlvblxuICogbXVzdCBnbyB0aHJvdWdoIHNlY3VyaXR5IHJldmlldy4gSW4gcGFydGljdWxhciwgdGhlIHRlbXBsYXRlIHN0cmluZyBzaG91bGRcbiAqIGFsd2F5cyBiZSB1bmRlciBmdWxsIGNvbnRyb2wgb2YgdGhlIGFwcGxpY2F0aW9uIGF1dGhvciwgYXMgdW50cnVzdGVkIGlucHV0XG4gKiBjYW4gY2F1c2UgYW4gWFNTIHZ1bG5lcmFiaWxpdHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnVzdGVkSFRNTEZyb21MZWdhY3lUZW1wbGF0ZShodG1sOiBzdHJpbmcpOiBUcnVzdGVkSFRNTCB8IHN0cmluZyB7XG4gIHJldHVybiBnZXRQb2xpY3koKT8uY3JlYXRlSFRNTChodG1sKSB8fCBodG1sO1xufVxuIl19