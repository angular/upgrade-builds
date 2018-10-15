/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as angular from './angular1';
import { $COMPILE, $CONTROLLER, $HTTP_BACKEND, $INJECTOR, $TEMPLATE_CACHE } from './constants';
import { controllerKey, directiveNormalize, isFunction } from './util';
/** @type {?} */
const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
/**
 * @record
 */
export function IBindingDestination() { }
/* TODO: handle strange member:
[key: string]: any;
*/
/** @type {?|undefined} */
IBindingDestination.prototype.$onChanges;
/**
 * @record
 */
export function IControllerInstance() { }
/** @type {?|undefined} */
IControllerInstance.prototype.$doCheck;
/** @type {?|undefined} */
IControllerInstance.prototype.$onDestroy;
/** @type {?|undefined} */
IControllerInstance.prototype.$onInit;
/** @type {?|undefined} */
IControllerInstance.prototype.$postLink;
export class UpgradeHelper {
    /**
     * @param {?} injector
     * @param {?} name
     * @param {?} elementRef
     * @param {?=} directive
     */
    constructor(injector, name, elementRef, directive) {
        this.injector = injector;
        this.name = name;
        this.$injector = injector.get($INJECTOR);
        this.$compile = this.$injector.get($COMPILE);
        this.$controller = this.$injector.get($CONTROLLER);
        this.element = elementRef.nativeElement;
        this.$element = angular.element(this.element);
        this.directive = directive || UpgradeHelper.getDirective(this.$injector, name);
    }
    /**
     * @param {?} $injector
     * @param {?} name
     * @return {?}
     */
    static getDirective($injector, name) {
        /** @type {?} */
        const directives = $injector.get(name + 'Directive');
        if (directives.length > 1) {
            throw new Error(`Only support single directive definition for: ${name}`);
        }
        /** @type {?} */
        const directive = directives[0];
        // AngularJS will transform `link: xyz` to `compile: () => xyz`. So we can only tell there was a
        // user-defined `compile` if there is no `link`. In other cases, we will just ignore `compile`.
        if (directive.compile && !directive.link)
            notSupported(name, 'compile');
        if (directive.replace)
            notSupported(name, 'replace');
        if (directive.terminal)
            notSupported(name, 'terminal');
        return directive;
    }
    /**
     * @param {?} $injector
     * @param {?} directive
     * @param {?=} fetchRemoteTemplate
     * @return {?}
     */
    static getTemplate($injector, directive, fetchRemoteTemplate = false) {
        if (directive.template !== undefined) {
            return getOrCall(directive.template);
        }
        else if (directive.templateUrl) {
            /** @type {?} */
            const $templateCache = /** @type {?} */ ($injector.get($TEMPLATE_CACHE));
            /** @type {?} */
            const url = getOrCall(directive.templateUrl);
            /** @type {?} */
            const template = $templateCache.get(url);
            if (template !== undefined) {
                return template;
            }
            else if (!fetchRemoteTemplate) {
                throw new Error('loading directive templates asynchronously is not supported');
            }
            return new Promise((resolve, reject) => {
                /** @type {?} */
                const $httpBackend = /** @type {?} */ ($injector.get($HTTP_BACKEND));
                $httpBackend('GET', url, null, (status, response) => {
                    if (status === 200) {
                        resolve($templateCache.put(url, response));
                    }
                    else {
                        reject(`GET component template from '${url}' returned '${status}: ${response}'`);
                    }
                });
            });
        }
        else {
            throw new Error(`Directive '${directive.name}' is not a component, it is missing template.`);
        }
    }
    /**
     * @param {?} controllerType
     * @param {?} $scope
     * @return {?}
     */
    buildController(controllerType, $scope) {
        /** @type {?} */
        const locals = { '$scope': $scope, '$element': this.$element };
        /** @type {?} */
        const controller = this.$controller(controllerType, locals, null, this.directive.controllerAs); /** @type {?} */
        ((this.$element.data))(controllerKey(/** @type {?} */ ((this.directive.name))), controller);
        return controller;
    }
    /**
     * @param {?=} template
     * @return {?}
     */
    compileTemplate(template) {
        if (template === undefined) {
            template = /** @type {?} */ (UpgradeHelper.getTemplate(this.$injector, this.directive));
        }
        return this.compileHtml(template);
    }
    /**
     * @param {?} $scope
     * @param {?=} controllerInstance
     * @return {?}
     */
    onDestroy($scope, controllerInstance) {
        if (controllerInstance && isFunction(controllerInstance.$onDestroy)) {
            controllerInstance.$onDestroy();
        }
        $scope.$destroy();
        // Clean the jQuery/jqLite data on the component+child elements.
        // Equivelent to how jQuery/jqLite invoke `cleanData` on an Element (this.element)
        //  https://github.com/jquery/jquery/blob/e743cbd28553267f955f71ea7248377915613fd9/src/manipulation.js#L223
        //  https://github.com/angular/angular.js/blob/26ddc5f830f902a3d22f4b2aab70d86d4d688c82/src/jqLite.js#L306-L312
        // `cleanData` will invoke the AngularJS `$destroy` DOM event
        //  https://github.com/angular/angular.js/blob/26ddc5f830f902a3d22f4b2aab70d86d4d688c82/src/Angular.js#L1911-L1924
        angular.element.cleanData([this.element]);
        angular.element.cleanData(this.element.querySelectorAll('*'));
    }
    /**
     * @return {?}
     */
    prepareTransclusion() {
        /** @type {?} */
        const transclude = this.directive.transclude;
        /** @type {?} */
        const contentChildNodes = this.extractChildNodes();
        /** @type {?} */
        const attachChildrenFn = (scope, cloneAttachFn) => {
            // Since AngularJS v1.5.8, `cloneAttachFn` will try to destroy the transclusion scope if
            // `$template` is empty. Since the transcluded content comes from Angular, not AngularJS,
            // there will be no transclusion scope here.
            // Provide a dummy `scope.$destroy()` method to prevent `cloneAttachFn` from throwing.
            scope = scope || { $destroy: () => undefined };
            return /** @type {?} */ ((cloneAttachFn))($template, scope);
        };
        /** @type {?} */
        let $template = contentChildNodes;
        if (transclude) {
            /** @type {?} */
            const slots = Object.create(null);
            if (typeof transclude === 'object') {
                $template = [];
                /** @type {?} */
                const slotMap = Object.create(null);
                /** @type {?} */
                const filledSlots = Object.create(null);
                // Parse the element selectors.
                Object.keys(transclude).forEach(slotName => {
                    /** @type {?} */
                    let selector = transclude[slotName];
                    /** @type {?} */
                    const optional = selector.charAt(0) === '?';
                    selector = optional ? selector.substring(1) : selector;
                    slotMap[selector] = slotName;
                    slots[slotName] = null; // `null`: Defined but not yet filled.
                    filledSlots[slotName] = optional; // Consider optional slots as filled.
                });
                // Add the matching elements into their slot.
                contentChildNodes.forEach(node => {
                    /** @type {?} */
                    const slotName = slotMap[directiveNormalize(node.nodeName.toLowerCase())];
                    if (slotName) {
                        filledSlots[slotName] = true;
                        slots[slotName] = slots[slotName] || [];
                        slots[slotName].push(node);
                    }
                    else {
                        $template.push(node);
                    }
                });
                // Check for required slots that were not filled.
                Object.keys(filledSlots).forEach(slotName => {
                    if (!filledSlots[slotName]) {
                        throw new Error(`Required transclusion slot '${slotName}' on directive: ${this.name}`);
                    }
                });
                Object.keys(slots).filter(slotName => slots[slotName]).forEach(slotName => {
                    /** @type {?} */
                    const nodes = slots[slotName];
                    slots[slotName] = (scope, cloneAttach) => /** @type {?} */ ((cloneAttach))(nodes, scope);
                });
            }
            // Attach `$$slots` to default slot transclude fn.
            attachChildrenFn.$$slots = slots;
            // AngularJS v1.6+ ignores empty or whitespace-only transcluded text nodes. But Angular
            // removes all text content after the first interpolation and updates it later, after
            // evaluating the expressions. This would result in AngularJS failing to recognize text
            // nodes that start with an interpolation as transcluded content and use the fallback
            // content instead.
            // To avoid this issue, we add a
            // [zero-width non-joiner character](https://en.wikipedia.org/wiki/Zero-width_non-joiner)
            // to empty text nodes (which can only be a result of Angular removing their initial content).
            // NOTE: Transcluded text content that starts with whitespace followed by an interpolation
            //       will still fail to be detected by AngularJS v1.6+
            $template.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && !node.nodeValue) {
                    node.nodeValue = '\u200C';
                }
            });
        }
        return attachChildrenFn;
    }
    /**
     * @param {?} controllerInstance
     * @return {?}
     */
    resolveAndBindRequiredControllers(controllerInstance) {
        /** @type {?} */
        const directiveRequire = this.getDirectiveRequire();
        /** @type {?} */
        const requiredControllers = this.resolveRequire(directiveRequire);
        if (controllerInstance && this.directive.bindToController && isMap(directiveRequire)) {
            /** @type {?} */
            const requiredControllersMap = /** @type {?} */ (requiredControllers);
            Object.keys(requiredControllersMap).forEach(key => {
                controllerInstance[key] = requiredControllersMap[key];
            });
        }
        return requiredControllers;
    }
    /**
     * @param {?} html
     * @return {?}
     */
    compileHtml(html) {
        this.element.innerHTML = html;
        return this.$compile(this.element.childNodes);
    }
    /**
     * @return {?}
     */
    extractChildNodes() {
        /** @type {?} */
        const childNodes = [];
        /** @type {?} */
        let childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        return childNodes;
    }
    /**
     * @return {?}
     */
    getDirectiveRequire() {
        /** @type {?} */
        const require = this.directive.require || /** @type {?} */ (((this.directive.controller && this.directive.name)));
        if (isMap(require)) {
            Object.keys(require).forEach(key => {
                /** @type {?} */
                const value = require[key];
                /** @type {?} */
                const match = /** @type {?} */ ((value.match(REQUIRE_PREFIX_RE)));
                /** @type {?} */
                const name = value.substring(match[0].length);
                if (!name) {
                    require[key] = match[0] + key;
                }
            });
        }
        return require;
    }
    /**
     * @param {?} require
     * @param {?=} controllerInstance
     * @return {?}
     */
    resolveRequire(require, controllerInstance) {
        if (!require) {
            return null;
        }
        else if (Array.isArray(require)) {
            return require.map(req => this.resolveRequire(req));
        }
        else if (typeof require === 'object') {
            /** @type {?} */
            const value = {};
            Object.keys(require).forEach(key => value[key] = /** @type {?} */ ((this.resolveRequire(require[key]))));
            return value;
        }
        else if (typeof require === 'string') {
            /** @type {?} */
            const match = /** @type {?} */ ((require.match(REQUIRE_PREFIX_RE)));
            /** @type {?} */
            const inheritType = match[1] || match[3];
            /** @type {?} */
            const name = require.substring(match[0].length);
            /** @type {?} */
            const isOptional = !!match[2];
            /** @type {?} */
            const searchParents = !!inheritType;
            /** @type {?} */
            const startOnParent = inheritType === '^^';
            /** @type {?} */
            const ctrlKey = controllerKey(name);
            /** @type {?} */
            const elem = startOnParent ? /** @type {?} */ ((this.$element.parent))() : this.$element;
            /** @type {?} */
            const value = searchParents ? /** @type {?} */ ((elem.inheritedData))(ctrlKey) : /** @type {?} */ ((elem.data))(ctrlKey);
            if (!value && !isOptional) {
                throw new Error(`Unable to find required '${require}' in upgraded directive '${this.name}'.`);
            }
            return value;
        }
        else {
            throw new Error(`Unrecognized 'require' syntax on upgraded directive '${this.name}': ${require}`);
        }
    }
}
if (false) {
    /** @type {?} */
    UpgradeHelper.prototype.$injector;
    /** @type {?} */
    UpgradeHelper.prototype.element;
    /** @type {?} */
    UpgradeHelper.prototype.$element;
    /** @type {?} */
    UpgradeHelper.prototype.directive;
    /** @type {?} */
    UpgradeHelper.prototype.$compile;
    /** @type {?} */
    UpgradeHelper.prototype.$controller;
    /** @type {?} */
    UpgradeHelper.prototype.injector;
    /** @type {?} */
    UpgradeHelper.prototype.name;
}
/**
 * @template T
 * @param {?} property
 * @return {?}
 */
function getOrCall(property) {
    return isFunction(property) ? property() : property;
}
/**
 * @template T
 * @param {?} value
 * @return {?}
 */
function isMap(value) {
    return value && !Array.isArray(value) && typeof value === 'object';
}
/**
 * @param {?} name
 * @param {?} feature
 * @return {?}
 */
function notSupported(name, feature) {
    throw new Error(`Upgraded directive '${name}' contains unsupported feature: '${feature}'.`);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvY29tbW9uL3VwZ3JhZGVfaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBVUEsT0FBTyxLQUFLLE9BQU8sTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0YsT0FBTyxFQUFDLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7O0FBSXJFLE1BQU0saUJBQWlCLEdBQUcsd0JBQXdCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQm5ELE1BQU0sT0FBTyxhQUFhOzs7Ozs7O0lBU3hCLFlBQ1ksVUFBNEIsSUFBWSxFQUFFLFVBQXNCLEVBQ3hFLFNBQThCO1FBRHRCLGFBQVEsR0FBUixRQUFRO1FBQW9CLFNBQUksR0FBSixJQUFJLENBQVE7UUFFbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsSUFBSSxhQUFhLENB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SSxLQUFLLENBQ1gsNEJBQTRCLE9BQU8sNEJBQTRCLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDO2FBQ25GO1lBRUQsT0FBTyxLQUFLLENBQUM7U0FDZDthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FDWCx3REFBd0QsSUFBSSxDQUFDLElBQUksTUFBTSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZGOztDQUVKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFRCxTQUFTLFNBQVMsQ0FBSSxRQUFzQjtJQUMxQyxPQUFPLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztDQUNyRDs7Ozs7O0FBR0QsU0FBUyxLQUFLLENBQUksS0FBbUM7SUFDbkQsT0FBTyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztDQUNwRTs7Ozs7O0FBRUQsU0FBUyxZQUFZLENBQUMsSUFBWSxFQUFFLE9BQWU7SUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxvQ0FBb0MsT0FBTyxJQUFJLENBQUMsQ0FBQztDQUM3RiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFbGVtZW50UmVmLCBJbmplY3RvciwgU2ltcGxlQ2hhbmdlc30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRDT01QSUxFLCAkQ09OVFJPTExFUiwgJEhUVFBfQkFDS0VORCwgJElOSkVDVE9SLCAkVEVNUExBVEVfQ0FDSEV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y29udHJvbGxlcktleSwgZGlyZWN0aXZlTm9ybWFsaXplLCBpc0Z1bmN0aW9ufSBmcm9tICcuL3V0aWwnO1xuXG5cbi8vIENvbnN0YW50c1xuY29uc3QgUkVRVUlSRV9QUkVGSVhfUkUgPSAvXihcXF5cXF4/KT8oXFw/KT8oXFxeXFxePyk/LztcblxuLy8gSW50ZXJmYWNlc1xuZXhwb3J0IGludGVyZmFjZSBJQmluZGluZ0Rlc3RpbmF0aW9uIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xuICAkb25DaGFuZ2VzPzogKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbnRyb2xsZXJJbnN0YW5jZSBleHRlbmRzIElCaW5kaW5nRGVzdGluYXRpb24ge1xuICAkZG9DaGVjaz86ICgpID0+IHZvaWQ7XG4gICRvbkRlc3Ryb3k/OiAoKSA9PiB2b2lkO1xuICAkb25Jbml0PzogKCkgPT4gdm9pZDtcbiAgJHBvc3RMaW5rPzogKCkgPT4gdm9pZDtcbn1cblxuLy8gQ2xhc3Nlc1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVIZWxwZXIge1xuICBwdWJsaWMgcmVhZG9ubHkgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2U7XG4gIHB1YmxpYyByZWFkb25seSBlbGVtZW50OiBFbGVtZW50O1xuICBwdWJsaWMgcmVhZG9ubHkgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcbiAgcHVibGljIHJlYWRvbmx5IGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlO1xuICBwcml2YXRlIHJlYWRvbmx5ICRjb250cm9sbGVyOiBhbmd1bGFyLklDb250cm9sbGVyU2VydmljZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yLCBwcml2YXRlIG5hbWU6IHN0cmluZywgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgIGRpcmVjdGl2ZT86IGFuZ3VsYXIuSURpcmVjdGl2ZSkge1xuICAgIHRoaXMuJGluamVjdG9yID0gaW5qZWN0b3IuZ2V0KCRJTkpFQ1RPUik7XG4gICAgdGhpcy4kY29tcGlsZSA9IHRoaXMuJGluamVjdG9yLmdldCgkQ09NUElMRSk7XG4gICAgdGhpcy4kY29udHJvbGxlciA9IHRoaXMuJGluamVjdG9yLmdldCgkQ09OVFJPTExFUik7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy4kZWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCh0aGlzLmVsZW1lbnQpO1xuXG4gICAgdGhpcy5kaXJlY3RpdmUgPSBkaXJlY3RpdmUgfHwgVXBncmFkZUhlbHBlci5nZXREaXJlY3RpdmUodGhpcy4kaW5qZWN0b3IsIG5hbWUpO1xuICB9XG5cbiAgc3RhdGljIGdldERpcmVjdGl2ZSgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSwgbmFtZTogc3RyaW5nKTogYW5ndWxhci5JRGlyZWN0aXZlIHtcbiAgICBjb25zdCBkaXJlY3RpdmVzOiBhbmd1bGFyLklEaXJlY3RpdmVbXSA9ICRpbmplY3Rvci5nZXQobmFtZSArICdEaXJlY3RpdmUnKTtcbiAgICBpZiAoZGlyZWN0aXZlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE9ubHkgc3VwcG9ydCBzaW5nbGUgZGlyZWN0aXZlIGRlZmluaXRpb24gZm9yOiAke25hbWV9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0aXZlID0gZGlyZWN0aXZlc1swXTtcblxuICAgIC8vIEFuZ3VsYXJKUyB3aWxsIHRyYW5zZm9ybSBgbGluazogeHl6YCB0byBgY29tcGlsZTogKCkgPT4geHl6YC4gU28gd2UgY2FuIG9ubHkgdGVsbCB0aGVyZSB3YXMgYVxuICAgIC8vIHVzZXItZGVmaW5lZCBgY29tcGlsZWAgaWYgdGhlcmUgaXMgbm8gYGxpbmtgLiBJbiBvdGhlciBjYXNlcywgd2Ugd2lsbCBqdXN0IGlnbm9yZSBgY29tcGlsZWAuXG4gICAgaWYgKGRpcmVjdGl2ZS5jb21waWxlICYmICFkaXJlY3RpdmUubGluaykgbm90U3VwcG9ydGVkKG5hbWUsICdjb21waWxlJyk7XG4gICAgaWYgKGRpcmVjdGl2ZS5yZXBsYWNlKSBub3RTdXBwb3J0ZWQobmFtZSwgJ3JlcGxhY2UnKTtcbiAgICBpZiAoZGlyZWN0aXZlLnRlcm1pbmFsKSBub3RTdXBwb3J0ZWQobmFtZSwgJ3Rlcm1pbmFsJyk7XG5cbiAgICByZXR1cm4gZGlyZWN0aXZlO1xuICB9XG5cbiAgc3RhdGljIGdldFRlbXBsYXRlKFxuICAgICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsIGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlLFxuICAgICAgZmV0Y2hSZW1vdGVUZW1wbGF0ZSA9IGZhbHNlKTogc3RyaW5nfFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKGRpcmVjdGl2ZS50ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZ2V0T3JDYWxsPHN0cmluZz4oZGlyZWN0aXZlLnRlbXBsYXRlKTtcbiAgICB9IGVsc2UgaWYgKGRpcmVjdGl2ZS50ZW1wbGF0ZVVybCkge1xuICAgICAgY29uc3QgJHRlbXBsYXRlQ2FjaGUgPSAkaW5qZWN0b3IuZ2V0KCRURU1QTEFURV9DQUNIRSkgYXMgYW5ndWxhci5JVGVtcGxhdGVDYWNoZVNlcnZpY2U7XG4gICAgICBjb25zdCB1cmwgPSBnZXRPckNhbGw8c3RyaW5nPihkaXJlY3RpdmUudGVtcGxhdGVVcmwpO1xuICAgICAgY29uc3QgdGVtcGxhdGUgPSAkdGVtcGxhdGVDYWNoZS5nZXQodXJsKTtcblxuICAgICAgaWYgKHRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgfSBlbHNlIGlmICghZmV0Y2hSZW1vdGVUZW1wbGF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvYWRpbmcgZGlyZWN0aXZlIHRlbXBsYXRlcyBhc3luY2hyb25vdXNseSBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0ICRodHRwQmFja2VuZCA9ICRpbmplY3Rvci5nZXQoJEhUVFBfQkFDS0VORCkgYXMgYW5ndWxhci5JSHR0cEJhY2tlbmRTZXJ2aWNlO1xuICAgICAgICAkaHR0cEJhY2tlbmQoJ0dFVCcsIHVybCwgbnVsbCwgKHN0YXR1czogbnVtYmVyLCByZXNwb25zZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKHN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKCR0ZW1wbGF0ZUNhY2hlLnB1dCh1cmwsIHJlc3BvbnNlKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlamVjdChgR0VUIGNvbXBvbmVudCB0ZW1wbGF0ZSBmcm9tICcke3VybH0nIHJldHVybmVkICcke3N0YXR1c306ICR7cmVzcG9uc2V9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaXJlY3RpdmUgJyR7ZGlyZWN0aXZlLm5hbWV9JyBpcyBub3QgYSBjb21wb25lbnQsIGl0IGlzIG1pc3NpbmcgdGVtcGxhdGUuYCk7XG4gICAgfVxuICB9XG5cbiAgYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlOiBhbmd1bGFyLklDb250cm9sbGVyLCAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlKSB7XG4gICAgLy8gVE9ETzogRG9jdW1lbnQgdGhhdCB3ZSBkbyBub3QgcHJlLWFzc2lnbiBiaW5kaW5ncyBvbiB0aGUgY29udHJvbGxlciBpbnN0YW5jZS5cbiAgICAvLyBRdW90ZWQgcHJvcGVydGllcyBiZWxvdyBzbyB0aGF0IHRoaXMgY29kZSBjYW4gYmUgb3B0aW1pemVkIHdpdGggQ2xvc3VyZSBDb21waWxlci5cbiAgICBjb25zdCBsb2NhbHMgPSB7JyRzY29wZSc6ICRzY29wZSwgJyRlbGVtZW50JzogdGhpcy4kZWxlbWVudH07XG4gICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuJGNvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIGxvY2FscywgbnVsbCwgdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlckFzKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuZGF0YSAhKGNvbnRyb2xsZXJLZXkodGhpcy5kaXJlY3RpdmUubmFtZSAhKSwgY29udHJvbGxlcik7XG5cbiAgICByZXR1cm4gY29udHJvbGxlcjtcbiAgfVxuXG4gIGNvbXBpbGVUZW1wbGF0ZSh0ZW1wbGF0ZT86IHN0cmluZyk6IGFuZ3VsYXIuSUxpbmtGbiB7XG4gICAgaWYgKHRlbXBsYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRlbXBsYXRlID0gVXBncmFkZUhlbHBlci5nZXRUZW1wbGF0ZSh0aGlzLiRpbmplY3RvciwgdGhpcy5kaXJlY3RpdmUpIGFzIHN0cmluZztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jb21waWxlSHRtbCh0ZW1wbGF0ZSk7XG4gIH1cblxuICBvbkRlc3Ryb3koJHNjb3BlOiBhbmd1bGFyLklTY29wZSwgY29udHJvbGxlckluc3RhbmNlPzogYW55KSB7XG4gICAgaWYgKGNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKGNvbnRyb2xsZXJJbnN0YW5jZS4kb25EZXN0cm95KSkge1xuICAgICAgY29udHJvbGxlckluc3RhbmNlLiRvbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgJHNjb3BlLiRkZXN0cm95KCk7XG5cbiAgICAvLyBDbGVhbiB0aGUgalF1ZXJ5L2pxTGl0ZSBkYXRhIG9uIHRoZSBjb21wb25lbnQrY2hpbGQgZWxlbWVudHMuXG4gICAgLy8gRXF1aXZlbGVudCB0byBob3cgalF1ZXJ5L2pxTGl0ZSBpbnZva2UgYGNsZWFuRGF0YWAgb24gYW4gRWxlbWVudCAodGhpcy5lbGVtZW50KVxuICAgIC8vICBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iL2U3NDNjYmQyODU1MzI2N2Y5NTVmNzFlYTcyNDgzNzc5MTU2MTNmZDkvc3JjL21hbmlwdWxhdGlvbi5qcyNMMjIzXG4gICAgLy8gIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi8yNmRkYzVmODMwZjkwMmEzZDIyZjRiMmFhYjcwZDg2ZDRkNjg4YzgyL3NyYy9qcUxpdGUuanMjTDMwNi1MMzEyXG4gICAgLy8gYGNsZWFuRGF0YWAgd2lsbCBpbnZva2UgdGhlIEFuZ3VsYXJKUyBgJGRlc3Ryb3lgIERPTSBldmVudFxuICAgIC8vICBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvMjZkZGM1ZjgzMGY5MDJhM2QyMmY0YjJhYWI3MGQ4NmQ0ZDY4OGM4Mi9zcmMvQW5ndWxhci5qcyNMMTkxMS1MMTkyNFxuICAgIGFuZ3VsYXIuZWxlbWVudC5jbGVhbkRhdGEoW3RoaXMuZWxlbWVudF0pO1xuICAgIGFuZ3VsYXIuZWxlbWVudC5jbGVhbkRhdGEodGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSk7XG4gIH1cblxuICBwcmVwYXJlVHJhbnNjbHVzaW9uKCk6IGFuZ3VsYXIuSUxpbmtGbnx1bmRlZmluZWQge1xuICAgIGNvbnN0IHRyYW5zY2x1ZGUgPSB0aGlzLmRpcmVjdGl2ZS50cmFuc2NsdWRlO1xuICAgIGNvbnN0IGNvbnRlbnRDaGlsZE5vZGVzID0gdGhpcy5leHRyYWN0Q2hpbGROb2RlcygpO1xuICAgIGNvbnN0IGF0dGFjaENoaWxkcmVuRm46IGFuZ3VsYXIuSUxpbmtGbiA9IChzY29wZSwgY2xvbmVBdHRhY2hGbikgPT4ge1xuICAgICAgLy8gU2luY2UgQW5ndWxhckpTIHYxLjUuOCwgYGNsb25lQXR0YWNoRm5gIHdpbGwgdHJ5IHRvIGRlc3Ryb3kgdGhlIHRyYW5zY2x1c2lvbiBzY29wZSBpZlxuICAgICAgLy8gYCR0ZW1wbGF0ZWAgaXMgZW1wdHkuIFNpbmNlIHRoZSB0cmFuc2NsdWRlZCBjb250ZW50IGNvbWVzIGZyb20gQW5ndWxhciwgbm90IEFuZ3VsYXJKUyxcbiAgICAgIC8vIHRoZXJlIHdpbGwgYmUgbm8gdHJhbnNjbHVzaW9uIHNjb3BlIGhlcmUuXG4gICAgICAvLyBQcm92aWRlIGEgZHVtbXkgYHNjb3BlLiRkZXN0cm95KClgIG1ldGhvZCB0byBwcmV2ZW50IGBjbG9uZUF0dGFjaEZuYCBmcm9tIHRocm93aW5nLlxuICAgICAgc2NvcGUgPSBzY29wZSB8fCB7JGRlc3Ryb3k6ICgpID0+IHVuZGVmaW5lZH07XG4gICAgICByZXR1cm4gY2xvbmVBdHRhY2hGbiAhKCR0ZW1wbGF0ZSwgc2NvcGUpO1xuICAgIH07XG4gICAgbGV0ICR0ZW1wbGF0ZSA9IGNvbnRlbnRDaGlsZE5vZGVzO1xuXG4gICAgaWYgKHRyYW5zY2x1ZGUpIHtcbiAgICAgIGNvbnN0IHNsb3RzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgaWYgKHR5cGVvZiB0cmFuc2NsdWRlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAkdGVtcGxhdGUgPSBbXTtcblxuICAgICAgICBjb25zdCBzbG90TWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgY29uc3QgZmlsbGVkU2xvdHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICAgIC8vIFBhcnNlIHRoZSBlbGVtZW50IHNlbGVjdG9ycy5cbiAgICAgICAgT2JqZWN0LmtleXModHJhbnNjbHVkZSkuZm9yRWFjaChzbG90TmFtZSA9PiB7XG4gICAgICAgICAgbGV0IHNlbGVjdG9yID0gdHJhbnNjbHVkZVtzbG90TmFtZV07XG4gICAgICAgICAgY29uc3Qgb3B0aW9uYWwgPSBzZWxlY3Rvci5jaGFyQXQoMCkgPT09ICc/JztcbiAgICAgICAgICBzZWxlY3RvciA9IG9wdGlvbmFsID8gc2VsZWN0b3Iuc3Vic3RyaW5nKDEpIDogc2VsZWN0b3I7XG5cbiAgICAgICAgICBzbG90TWFwW3NlbGVjdG9yXSA9IHNsb3ROYW1lO1xuICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IG51bGw7ICAgICAgICAgICAgLy8gYG51bGxgOiBEZWZpbmVkIGJ1dCBub3QgeWV0IGZpbGxlZC5cbiAgICAgICAgICBmaWxsZWRTbG90c1tzbG90TmFtZV0gPSBvcHRpb25hbDsgIC8vIENvbnNpZGVyIG9wdGlvbmFsIHNsb3RzIGFzIGZpbGxlZC5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBtYXRjaGluZyBlbGVtZW50cyBpbnRvIHRoZWlyIHNsb3QuXG4gICAgICAgIGNvbnRlbnRDaGlsZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgICAgY29uc3Qgc2xvdE5hbWUgPSBzbG90TWFwW2RpcmVjdGl2ZU5vcm1hbGl6ZShub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpXTtcbiAgICAgICAgICBpZiAoc2xvdE5hbWUpIHtcbiAgICAgICAgICAgIGZpbGxlZFNsb3RzW3Nsb3ROYW1lXSA9IHRydWU7XG4gICAgICAgICAgICBzbG90c1tzbG90TmFtZV0gPSBzbG90c1tzbG90TmFtZV0gfHwgW107XG4gICAgICAgICAgICBzbG90c1tzbG90TmFtZV0ucHVzaChub2RlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHRlbXBsYXRlLnB1c2gobm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgcmVxdWlyZWQgc2xvdHMgdGhhdCB3ZXJlIG5vdCBmaWxsZWQuXG4gICAgICAgIE9iamVjdC5rZXlzKGZpbGxlZFNsb3RzKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBpZiAoIWZpbGxlZFNsb3RzW3Nsb3ROYW1lXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXF1aXJlZCB0cmFuc2NsdXNpb24gc2xvdCAnJHtzbG90TmFtZX0nIG9uIGRpcmVjdGl2ZTogJHt0aGlzLm5hbWV9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBPYmplY3Qua2V5cyhzbG90cykuZmlsdGVyKHNsb3ROYW1lID0+IHNsb3RzW3Nsb3ROYW1lXSkuZm9yRWFjaChzbG90TmFtZSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZXMgPSBzbG90c1tzbG90TmFtZV07XG4gICAgICAgICAgc2xvdHNbc2xvdE5hbWVdID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgY2xvbmVBdHRhY2g6IGFuZ3VsYXIuSUNsb25lQXR0YWNoRnVuY3Rpb24pID0+XG4gICAgICAgICAgICAgIGNsb25lQXR0YWNoICEobm9kZXMsIHNjb3BlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEF0dGFjaCBgJCRzbG90c2AgdG8gZGVmYXVsdCBzbG90IHRyYW5zY2x1ZGUgZm4uXG4gICAgICBhdHRhY2hDaGlsZHJlbkZuLiQkc2xvdHMgPSBzbG90cztcblxuICAgICAgLy8gQW5ndWxhckpTIHYxLjYrIGlnbm9yZXMgZW1wdHkgb3Igd2hpdGVzcGFjZS1vbmx5IHRyYW5zY2x1ZGVkIHRleHQgbm9kZXMuIEJ1dCBBbmd1bGFyXG4gICAgICAvLyByZW1vdmVzIGFsbCB0ZXh0IGNvbnRlbnQgYWZ0ZXIgdGhlIGZpcnN0IGludGVycG9sYXRpb24gYW5kIHVwZGF0ZXMgaXQgbGF0ZXIsIGFmdGVyXG4gICAgICAvLyBldmFsdWF0aW5nIHRoZSBleHByZXNzaW9ucy4gVGhpcyB3b3VsZCByZXN1bHQgaW4gQW5ndWxhckpTIGZhaWxpbmcgdG8gcmVjb2duaXplIHRleHRcbiAgICAgIC8vIG5vZGVzIHRoYXQgc3RhcnQgd2l0aCBhbiBpbnRlcnBvbGF0aW9uIGFzIHRyYW5zY2x1ZGVkIGNvbnRlbnQgYW5kIHVzZSB0aGUgZmFsbGJhY2tcbiAgICAgIC8vIGNvbnRlbnQgaW5zdGVhZC5cbiAgICAgIC8vIFRvIGF2b2lkIHRoaXMgaXNzdWUsIHdlIGFkZCBhXG4gICAgICAvLyBbemVyby13aWR0aCBub24tam9pbmVyIGNoYXJhY3Rlcl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvWmVyby13aWR0aF9ub24tam9pbmVyKVxuICAgICAgLy8gdG8gZW1wdHkgdGV4dCBub2RlcyAod2hpY2ggY2FuIG9ubHkgYmUgYSByZXN1bHQgb2YgQW5ndWxhciByZW1vdmluZyB0aGVpciBpbml0aWFsIGNvbnRlbnQpLlxuICAgICAgLy8gTk9URTogVHJhbnNjbHVkZWQgdGV4dCBjb250ZW50IHRoYXQgc3RhcnRzIHdpdGggd2hpdGVzcGFjZSBmb2xsb3dlZCBieSBhbiBpbnRlcnBvbGF0aW9uXG4gICAgICAvLyAgICAgICB3aWxsIHN0aWxsIGZhaWwgdG8gYmUgZGV0ZWN0ZWQgYnkgQW5ndWxhckpTIHYxLjYrXG4gICAgICAkdGVtcGxhdGUuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFICYmICFub2RlLm5vZGVWYWx1ZSkge1xuICAgICAgICAgIG5vZGUubm9kZVZhbHVlID0gJ1xcdTIwMEMnO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0YWNoQ2hpbGRyZW5GbjtcbiAgfVxuXG4gIHJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyhjb250cm9sbGVySW5zdGFuY2U6IElDb250cm9sbGVySW5zdGFuY2V8bnVsbCkge1xuICAgIGNvbnN0IGRpcmVjdGl2ZVJlcXVpcmUgPSB0aGlzLmdldERpcmVjdGl2ZVJlcXVpcmUoKTtcbiAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzID0gdGhpcy5yZXNvbHZlUmVxdWlyZShkaXJlY3RpdmVSZXF1aXJlKTtcblxuICAgIGlmIChjb250cm9sbGVySW5zdGFuY2UgJiYgdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciAmJiBpc01hcChkaXJlY3RpdmVSZXF1aXJlKSkge1xuICAgICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVyc01hcCA9IHJlcXVpcmVkQ29udHJvbGxlcnMgYXN7W2tleTogc3RyaW5nXTogSUNvbnRyb2xsZXJJbnN0YW5jZX07XG4gICAgICBPYmplY3Qua2V5cyhyZXF1aXJlZENvbnRyb2xsZXJzTWFwKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnRyb2xsZXJJbnN0YW5jZVtrZXldID0gcmVxdWlyZWRDb250cm9sbGVyc01hcFtrZXldO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVpcmVkQ29udHJvbGxlcnM7XG4gIH1cblxuICBwcml2YXRlIGNvbXBpbGVIdG1sKGh0bWw6IHN0cmluZyk6IGFuZ3VsYXIuSUxpbmtGbiB7XG4gICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIHRoaXMuJGNvbXBpbGUodGhpcy5lbGVtZW50LmNoaWxkTm9kZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBleHRyYWN0Q2hpbGROb2RlcygpOiBOb2RlW10ge1xuICAgIGNvbnN0IGNoaWxkTm9kZXM6IE5vZGVbXSA9IFtdO1xuICAgIGxldCBjaGlsZE5vZGU6IE5vZGV8bnVsbDtcblxuICAgIHdoaWxlIChjaGlsZE5vZGUgPSB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkTm9kZSk7XG4gICAgICBjaGlsZE5vZGVzLnB1c2goY2hpbGROb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGROb2RlcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGlyZWN0aXZlUmVxdWlyZSgpOiBhbmd1bGFyLkRpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eSB7XG4gICAgY29uc3QgcmVxdWlyZSA9IHRoaXMuZGlyZWN0aXZlLnJlcXVpcmUgfHwgKHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXIgJiYgdGhpcy5kaXJlY3RpdmUubmFtZSkgITtcblxuICAgIGlmIChpc01hcChyZXF1aXJlKSkge1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHJlcXVpcmVba2V5XTtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB2YWx1ZS5tYXRjaChSRVFVSVJFX1BSRUZJWF9SRSkgITtcbiAgICAgICAgY29uc3QgbmFtZSA9IHZhbHVlLnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpO1xuXG4gICAgICAgIGlmICghbmFtZSkge1xuICAgICAgICAgIHJlcXVpcmVba2V5XSA9IG1hdGNoWzBdICsga2V5O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVxdWlyZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZVJlcXVpcmUocmVxdWlyZTogYW5ndWxhci5EaXJlY3RpdmVSZXF1aXJlUHJvcGVydHksIGNvbnRyb2xsZXJJbnN0YW5jZT86IGFueSk6XG4gICAgICBhbmd1bGFyLlNpbmdsZU9yTGlzdE9yTWFwPElDb250cm9sbGVySW5zdGFuY2U+fG51bGwge1xuICAgIGlmICghcmVxdWlyZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcXVpcmUpKSB7XG4gICAgICByZXR1cm4gcmVxdWlyZS5tYXAocmVxID0+IHRoaXMucmVzb2x2ZVJlcXVpcmUocmVxKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IHZhbHVlOiB7W2tleTogc3RyaW5nXTogSUNvbnRyb2xsZXJJbnN0YW5jZX0gPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmUpLmZvckVhY2goa2V5ID0+IHZhbHVlW2tleV0gPSB0aGlzLnJlc29sdmVSZXF1aXJlKHJlcXVpcmVba2V5XSkgISk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gcmVxdWlyZS5tYXRjaChSRVFVSVJFX1BSRUZJWF9SRSkgITtcbiAgICAgIGNvbnN0IGluaGVyaXRUeXBlID0gbWF0Y2hbMV0gfHwgbWF0Y2hbM107XG5cbiAgICAgIGNvbnN0IG5hbWUgPSByZXF1aXJlLnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgY29uc3QgaXNPcHRpb25hbCA9ICEhbWF0Y2hbMl07XG4gICAgICBjb25zdCBzZWFyY2hQYXJlbnRzID0gISFpbmhlcml0VHlwZTtcbiAgICAgIGNvbnN0IHN0YXJ0T25QYXJlbnQgPSBpbmhlcml0VHlwZSA9PT0gJ15eJztcblxuICAgICAgY29uc3QgY3RybEtleSA9IGNvbnRyb2xsZXJLZXkobmFtZSk7XG4gICAgICBjb25zdCBlbGVtID0gc3RhcnRPblBhcmVudCA/IHRoaXMuJGVsZW1lbnQucGFyZW50ICEoKSA6IHRoaXMuJGVsZW1lbnQ7XG4gICAgICBjb25zdCB2YWx1ZSA9IHNlYXJjaFBhcmVudHMgPyBlbGVtLmluaGVyaXRlZERhdGEgIShjdHJsS2V5KSA6IGVsZW0uZGF0YSAhKGN0cmxLZXkpO1xuXG4gICAgICBpZiAoIXZhbHVlICYmICFpc09wdGlvbmFsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gZmluZCByZXF1aXJlZCAnJHtyZXF1aXJlfScgaW4gdXBncmFkZWQgZGlyZWN0aXZlICcke3RoaXMubmFtZX0nLmApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5yZWNvZ25pemVkICdyZXF1aXJlJyBzeW50YXggb24gdXBncmFkZWQgZGlyZWN0aXZlICcke3RoaXMubmFtZX0nOiAke3JlcXVpcmV9YCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldE9yQ2FsbDxUPihwcm9wZXJ0eTogVCB8IEZ1bmN0aW9uKTogVCB7XG4gIHJldHVybiBpc0Z1bmN0aW9uKHByb3BlcnR5KSA/IHByb3BlcnR5KCkgOiBwcm9wZXJ0eTtcbn1cblxuLy8gTk9URTogT25seSB3b3JrcyBmb3IgYHR5cGVvZiBUICE9PSAnb2JqZWN0J2AuXG5mdW5jdGlvbiBpc01hcDxUPih2YWx1ZTogYW5ndWxhci5TaW5nbGVPckxpc3RPck1hcDxUPik6IHZhbHVlIGlzIHtba2V5OiBzdHJpbmddOiBUfSB7XG4gIHJldHVybiB2YWx1ZSAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbn1cblxuZnVuY3Rpb24gbm90U3VwcG9ydGVkKG5hbWU6IHN0cmluZywgZmVhdHVyZTogc3RyaW5nKSB7XG4gIHRocm93IG5ldyBFcnJvcihgVXBncmFkZWQgZGlyZWN0aXZlICcke25hbWV9JyBjb250YWlucyB1bnN1cHBvcnRlZCBmZWF0dXJlOiAnJHtmZWF0dXJlfScuYCk7XG59XG4iXX0=