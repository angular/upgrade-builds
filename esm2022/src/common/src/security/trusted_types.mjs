/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3RlZF90eXBlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2NvbW1vbi9zcmMvc2VjdXJpdHkvdHJ1c3RlZF90eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFjSDs7O0dBR0c7QUFDSCxJQUFJLE1BQTRDLENBQUM7QUFFakQ7OztHQUdHO0FBQ0gsU0FBUyxTQUFTO0lBQ2hCLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ3pCLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDZCxNQUFNLHNCQUFzQixHQUFHLE1BQThELENBQUM7UUFDOUYsSUFBSSxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUM7Z0JBQ0gsTUFBTSxHQUFHLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsd0JBQXdCLEVBQUU7b0JBQ2xGLFVBQVUsRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDN0IsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUFDLE1BQU0sQ0FBQztnQkFDUCxpRUFBaUU7Z0JBQ2pFLHVFQUF1RTtnQkFDdkUsc0VBQXNFO2dCQUN0RSxtREFBbUQ7WUFDckQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLFVBQVUsNkJBQTZCLENBQUMsSUFBWTtJQUN4RCxPQUFPLFNBQVMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDL0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXdcbiAqIEEgbW9kdWxlIHRvIGZhY2lsaXRhdGUgdXNlIG9mIGEgVHJ1c3RlZCBUeXBlcyBwb2xpY3kgaW50ZXJuYWxseSB3aXRoaW5cbiAqIHRoZSB1cGdyYWRlIHBhY2thZ2UuIEl0IGxhemlseSBjb25zdHJ1Y3RzIHRoZSBUcnVzdGVkIFR5cGVzIHBvbGljeSwgcHJvdmlkaW5nXG4gKiBoZWxwZXIgdXRpbGl0aWVzIGZvciBwcm9tb3Rpbmcgc3RyaW5ncyB0byBUcnVzdGVkIFR5cGVzLiBXaGVuIFRydXN0ZWQgVHlwZXNcbiAqIGFyZSBub3QgYXZhaWxhYmxlLCBzdHJpbmdzIGFyZSB1c2VkIGFzIGEgZmFsbGJhY2suXG4gKiBAc2VjdXJpdHkgQWxsIHVzZSBvZiB0aGlzIG1vZHVsZSBpcyBzZWN1cml0eS1zZW5zaXRpdmUgYW5kIHNob3VsZCBnbyB0aHJvdWdoXG4gKiBzZWN1cml0eSByZXZpZXcuXG4gKi9cblxuaW1wb3J0IHtUcnVzdGVkSFRNTCwgVHJ1c3RlZFR5cGVQb2xpY3ksIFRydXN0ZWRUeXBlUG9saWN5RmFjdG9yeX0gZnJvbSAnLi90cnVzdGVkX3R5cGVzX2RlZnMnO1xuXG4vKipcbiAqIFRoZSBUcnVzdGVkIFR5cGVzIHBvbGljeSwgb3IgbnVsbCBpZiBUcnVzdGVkIFR5cGVzIGFyZSBub3RcbiAqIGVuYWJsZWQvc3VwcG9ydGVkLCBvciB1bmRlZmluZWQgaWYgdGhlIHBvbGljeSBoYXMgbm90IGJlZW4gY3JlYXRlZCB5ZXQuXG4gKi9cbmxldCBwb2xpY3k6IFRydXN0ZWRUeXBlUG9saWN5IHwgbnVsbCB8IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBUcnVzdGVkIFR5cGVzIHBvbGljeSwgb3IgbnVsbCBpZiBUcnVzdGVkIFR5cGVzIGFyZSBub3RcbiAqIGVuYWJsZWQvc3VwcG9ydGVkLiBUaGUgZmlyc3QgY2FsbCB0byB0aGlzIGZ1bmN0aW9uIHdpbGwgY3JlYXRlIHRoZSBwb2xpY3kuXG4gKi9cbmZ1bmN0aW9uIGdldFBvbGljeSgpOiBUcnVzdGVkVHlwZVBvbGljeSB8IG51bGwge1xuICBpZiAocG9saWN5ID09PSB1bmRlZmluZWQpIHtcbiAgICBwb2xpY3kgPSBudWxsO1xuICAgIGNvbnN0IHdpbmRvd1dpdGhUcnVzdGVkVHlwZXMgPSB3aW5kb3cgYXMgdW5rbm93biBhcyB7dHJ1c3RlZFR5cGVzPzogVHJ1c3RlZFR5cGVQb2xpY3lGYWN0b3J5fTtcbiAgICBpZiAod2luZG93V2l0aFRydXN0ZWRUeXBlcy50cnVzdGVkVHlwZXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBvbGljeSA9IHdpbmRvd1dpdGhUcnVzdGVkVHlwZXMudHJ1c3RlZFR5cGVzLmNyZWF0ZVBvbGljeSgnYW5ndWxhciN1bnNhZmUtdXBncmFkZScsIHtcbiAgICAgICAgICBjcmVhdGVIVE1MOiAoczogc3RyaW5nKSA9PiBzLFxuICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyB0cnVzdGVkVHlwZXMuY3JlYXRlUG9saWN5IHRocm93cyBpZiBjYWxsZWQgd2l0aCBhIG5hbWUgdGhhdCBpc1xuICAgICAgICAvLyBhbHJlYWR5IHJlZ2lzdGVyZWQsIGV2ZW4gaW4gcmVwb3J0LW9ubHkgbW9kZS4gVW50aWwgdGhlIEFQSSBjaGFuZ2VzLFxuICAgICAgICAvLyBjYXRjaCB0aGUgZXJyb3Igbm90IHRvIGJyZWFrIHRoZSBhcHBsaWNhdGlvbnMgZnVuY3Rpb25hbGx5LiBJbiBzdWNoXG4gICAgICAgIC8vIGNhc2VzLCB0aGUgY29kZSB3aWxsIGZhbGwgYmFjayB0byB1c2luZyBzdHJpbmdzLlxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcG9saWN5O1xufVxuXG4vKipcbiAqIFVuc2FmZWx5IHByb21vdGUgYSBsZWdhY3kgQW5ndWxhckpTIHRlbXBsYXRlIHRvIGEgVHJ1c3RlZEhUTUwsIGZhbGxpbmcgYmFja1xuICogdG8gc3RyaW5ncyB3aGVuIFRydXN0ZWQgVHlwZXMgYXJlIG5vdCBhdmFpbGFibGUuXG4gKiBAc2VjdXJpdHkgVGhpcyBpcyBhIHNlY3VyaXR5LXNlbnNpdGl2ZSBmdW5jdGlvbjsgYW55IHVzZSBvZiB0aGlzIGZ1bmN0aW9uXG4gKiBtdXN0IGdvIHRocm91Z2ggc2VjdXJpdHkgcmV2aWV3LiBJbiBwYXJ0aWN1bGFyLCB0aGUgdGVtcGxhdGUgc3RyaW5nIHNob3VsZFxuICogYWx3YXlzIGJlIHVuZGVyIGZ1bGwgY29udHJvbCBvZiB0aGUgYXBwbGljYXRpb24gYXV0aG9yLCBhcyB1bnRydXN0ZWQgaW5wdXRcbiAqIGNhbiBjYXVzZSBhbiBYU1MgdnVsbmVyYWJpbGl0eS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRydXN0ZWRIVE1MRnJvbUxlZ2FjeVRlbXBsYXRlKGh0bWw6IHN0cmluZyk6IFRydXN0ZWRIVE1MIHwgc3RyaW5nIHtcbiAgcmV0dXJuIGdldFBvbGljeSgpPy5jcmVhdGVIVE1MKGh0bWwpIHx8IGh0bWw7XG59XG4iXX0=