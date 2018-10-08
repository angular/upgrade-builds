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
        $scope.$destroy(); /** @type {?} */
        ((this.$element.triggerHandler))('$destroy');
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vdXBncmFkZV9oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFVQSxPQUFPLEtBQUssT0FBTyxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUM3RixPQUFPLEVBQUMsYUFBYSxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7QUFJckUsTUFBTSxpQkFBaUIsR0FBRyx3QkFBd0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdCbkQsTUFBTTs7Ozs7OztJQVNKLFlBQ1ksVUFBNEIsSUFBWSxFQUFFLFVBQXNCLEVBQ3hFLFNBQThCO1FBRHRCLGFBQVEsR0FBUixRQUFRO1FBQW9CLFNBQUksR0FBSixJQUFJLENBQVE7UUFFbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsSUFBSSxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksQ0FB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QUFNLE9BQU8sRUFBRSxDQUFDLENBQUM7U0FDdkY7O0NBRUo7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVELG1CQUFzQixRQUFzQjtJQUMxQyxPQUFPLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztDQUNyRDs7Ozs7O0FBR0QsZUFBa0IsS0FBbUM7SUFDbkQsT0FBTyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztDQUNwRTs7Ozs7O0FBRUQsc0JBQXNCLElBQVksRUFBRSxPQUFlO0lBQ2pELE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLElBQUksb0NBQW9DLE9BQU8sSUFBSSxDQUFDLENBQUM7Q0FDN0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RWxlbWVudFJlZiwgSW5qZWN0b3IsIFNpbXBsZUNoYW5nZXN9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHskQ09NUElMRSwgJENPTlRST0xMRVIsICRIVFRQX0JBQ0tFTkQsICRJTkpFQ1RPUiwgJFRFTVBMQVRFX0NBQ0hFfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2NvbnRyb2xsZXJLZXksIGRpcmVjdGl2ZU5vcm1hbGl6ZSwgaXNGdW5jdGlvbn0gZnJvbSAnLi91dGlsJztcblxuXG4vLyBDb25zdGFudHNcbmNvbnN0IFJFUVVJUkVfUFJFRklYX1JFID0gL14oXFxeXFxePyk/KFxcPyk/KFxcXlxcXj8pPy87XG5cbi8vIEludGVyZmFjZXNcbmV4cG9ydCBpbnRlcmZhY2UgSUJpbmRpbmdEZXN0aW5hdGlvbiB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbiAgJG9uQ2hhbmdlcz86IChjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElDb250cm9sbGVySW5zdGFuY2UgZXh0ZW5kcyBJQmluZGluZ0Rlc3RpbmF0aW9uIHtcbiAgJGRvQ2hlY2s/OiAoKSA9PiB2b2lkO1xuICAkb25EZXN0cm95PzogKCkgPT4gdm9pZDtcbiAgJG9uSW5pdD86ICgpID0+IHZvaWQ7XG4gICRwb3N0TGluaz86ICgpID0+IHZvaWQ7XG59XG5cbi8vIENsYXNzZXNcbmV4cG9ydCBjbGFzcyBVcGdyYWRlSGVscGVyIHtcbiAgcHVibGljIHJlYWRvbmx5ICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlO1xuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogRWxlbWVudDtcbiAgcHVibGljIHJlYWRvbmx5ICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XG4gIHB1YmxpYyByZWFkb25seSBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZTtcblxuICBwcml2YXRlIHJlYWRvbmx5ICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZTtcbiAgcHJpdmF0ZSByZWFkb25seSAkY29udHJvbGxlcjogYW5ndWxhci5JQ29udHJvbGxlclNlcnZpY2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGluamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSBuYW1lOiBzdHJpbmcsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBkaXJlY3RpdmU/OiBhbmd1bGFyLklEaXJlY3RpdmUpIHtcbiAgICB0aGlzLiRpbmplY3RvciA9IGluamVjdG9yLmdldCgkSU5KRUNUT1IpO1xuICAgIHRoaXMuJGNvbXBpbGUgPSB0aGlzLiRpbmplY3Rvci5nZXQoJENPTVBJTEUpO1xuICAgIHRoaXMuJGNvbnRyb2xsZXIgPSB0aGlzLiRpbmplY3Rvci5nZXQoJENPTlRST0xMRVIpO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuJGVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQodGhpcy5lbGVtZW50KTtcblxuICAgIHRoaXMuZGlyZWN0aXZlID0gZGlyZWN0aXZlIHx8IFVwZ3JhZGVIZWxwZXIuZ2V0RGlyZWN0aXZlKHRoaXMuJGluamVjdG9yLCBuYW1lKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXREaXJlY3RpdmUoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsIG5hbWU6IHN0cmluZyk6IGFuZ3VsYXIuSURpcmVjdGl2ZSB7XG4gICAgY29uc3QgZGlyZWN0aXZlczogYW5ndWxhci5JRGlyZWN0aXZlW10gPSAkaW5qZWN0b3IuZ2V0KG5hbWUgKyAnRGlyZWN0aXZlJyk7XG4gICAgaWYgKGRpcmVjdGl2ZXMubGVuZ3RoID4gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBPbmx5IHN1cHBvcnQgc2luZ2xlIGRpcmVjdGl2ZSBkZWZpbml0aW9uIGZvcjogJHtuYW1lfWApO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGRpcmVjdGl2ZXNbMF07XG5cbiAgICAvLyBBbmd1bGFySlMgd2lsbCB0cmFuc2Zvcm0gYGxpbms6IHh5emAgdG8gYGNvbXBpbGU6ICgpID0+IHh5emAuIFNvIHdlIGNhbiBvbmx5IHRlbGwgdGhlcmUgd2FzIGFcbiAgICAvLyB1c2VyLWRlZmluZWQgYGNvbXBpbGVgIGlmIHRoZXJlIGlzIG5vIGBsaW5rYC4gSW4gb3RoZXIgY2FzZXMsIHdlIHdpbGwganVzdCBpZ25vcmUgYGNvbXBpbGVgLlxuICAgIGlmIChkaXJlY3RpdmUuY29tcGlsZSAmJiAhZGlyZWN0aXZlLmxpbmspIG5vdFN1cHBvcnRlZChuYW1lLCAnY29tcGlsZScpO1xuICAgIGlmIChkaXJlY3RpdmUucmVwbGFjZSkgbm90U3VwcG9ydGVkKG5hbWUsICdyZXBsYWNlJyk7XG4gICAgaWYgKGRpcmVjdGl2ZS50ZXJtaW5hbCkgbm90U3VwcG9ydGVkKG5hbWUsICd0ZXJtaW5hbCcpO1xuXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRUZW1wbGF0ZShcbiAgICAgICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZSxcbiAgICAgIGZldGNoUmVtb3RlVGVtcGxhdGUgPSBmYWxzZSk6IHN0cmluZ3xQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmIChkaXJlY3RpdmUudGVtcGxhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGdldE9yQ2FsbDxzdHJpbmc+KGRpcmVjdGl2ZS50ZW1wbGF0ZSk7XG4gICAgfSBlbHNlIGlmIChkaXJlY3RpdmUudGVtcGxhdGVVcmwpIHtcbiAgICAgIGNvbnN0ICR0ZW1wbGF0ZUNhY2hlID0gJGluamVjdG9yLmdldCgkVEVNUExBVEVfQ0FDSEUpIGFzIGFuZ3VsYXIuSVRlbXBsYXRlQ2FjaGVTZXJ2aWNlO1xuICAgICAgY29uc3QgdXJsID0gZ2V0T3JDYWxsPHN0cmluZz4oZGlyZWN0aXZlLnRlbXBsYXRlVXJsKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlID0gJHRlbXBsYXRlQ2FjaGUuZ2V0KHVybCk7XG5cbiAgICAgIGlmICh0ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgIH0gZWxzZSBpZiAoIWZldGNoUmVtb3RlVGVtcGxhdGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2FkaW5nIGRpcmVjdGl2ZSB0ZW1wbGF0ZXMgYXN5bmNocm9ub3VzbHkgaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCAkaHR0cEJhY2tlbmQgPSAkaW5qZWN0b3IuZ2V0KCRIVFRQX0JBQ0tFTkQpIGFzIGFuZ3VsYXIuSUh0dHBCYWNrZW5kU2VydmljZTtcbiAgICAgICAgJGh0dHBCYWNrZW5kKCdHRVQnLCB1cmwsIG51bGwsIChzdGF0dXM6IG51bWJlciwgcmVzcG9uc2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGlmIChzdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgcmVzb2x2ZSgkdGVtcGxhdGVDYWNoZS5wdXQodXJsLCByZXNwb25zZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QoYEdFVCBjb21wb25lbnQgdGVtcGxhdGUgZnJvbSAnJHt1cmx9JyByZXR1cm5lZCAnJHtzdGF0dXN9OiAke3Jlc3BvbnNlfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGlyZWN0aXZlICcke2RpcmVjdGl2ZS5uYW1lfScgaXMgbm90IGEgY29tcG9uZW50LCBpdCBpcyBtaXNzaW5nIHRlbXBsYXRlLmApO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZTogYW5ndWxhci5JQ29udHJvbGxlciwgJHNjb3BlOiBhbmd1bGFyLklTY29wZSkge1xuICAgIC8vIFRPRE86IERvY3VtZW50IHRoYXQgd2UgZG8gbm90IHByZS1hc3NpZ24gYmluZGluZ3Mgb24gdGhlIGNvbnRyb2xsZXIgaW5zdGFuY2UuXG4gICAgLy8gUXVvdGVkIHByb3BlcnRpZXMgYmVsb3cgc28gdGhhdCB0aGlzIGNvZGUgY2FuIGJlIG9wdGltaXplZCB3aXRoIENsb3N1cmUgQ29tcGlsZXIuXG4gICAgY29uc3QgbG9jYWxzID0geyckc2NvcGUnOiAkc2NvcGUsICckZWxlbWVudCc6IHRoaXMuJGVsZW1lbnR9O1xuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLiRjb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCBsb2NhbHMsIG51bGwsIHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXJBcyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmRhdGEgIShjb250cm9sbGVyS2V5KHRoaXMuZGlyZWN0aXZlLm5hbWUgISksIGNvbnRyb2xsZXIpO1xuXG4gICAgcmV0dXJuIGNvbnRyb2xsZXI7XG4gIH1cblxuICBjb21waWxlVGVtcGxhdGUodGVtcGxhdGU/OiBzdHJpbmcpOiBhbmd1bGFyLklMaW5rRm4ge1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0ZW1wbGF0ZSA9IFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUodGhpcy4kaW5qZWN0b3IsIHRoaXMuZGlyZWN0aXZlKSBhcyBzdHJpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZUh0bWwodGVtcGxhdGUpO1xuICB9XG5cbiAgb25EZXN0cm95KCRzY29wZTogYW5ndWxhci5JU2NvcGUsIGNvbnRyb2xsZXJJbnN0YW5jZT86IGFueSkge1xuICAgIGlmIChjb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbihjb250cm9sbGVySW5zdGFuY2UuJG9uRGVzdHJveSkpIHtcbiAgICAgIGNvbnRyb2xsZXJJbnN0YW5jZS4kb25EZXN0cm95KCk7XG4gICAgfVxuICAgICRzY29wZS4kZGVzdHJveSgpO1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlckhhbmRsZXIgISgnJGRlc3Ryb3knKTtcbiAgfVxuXG4gIHByZXBhcmVUcmFuc2NsdXNpb24oKTogYW5ndWxhci5JTGlua0ZufHVuZGVmaW5lZCB7XG4gICAgY29uc3QgdHJhbnNjbHVkZSA9IHRoaXMuZGlyZWN0aXZlLnRyYW5zY2x1ZGU7XG4gICAgY29uc3QgY29udGVudENoaWxkTm9kZXMgPSB0aGlzLmV4dHJhY3RDaGlsZE5vZGVzKCk7XG4gICAgY29uc3QgYXR0YWNoQ2hpbGRyZW5GbjogYW5ndWxhci5JTGlua0ZuID0gKHNjb3BlLCBjbG9uZUF0dGFjaEZuKSA9PiB7XG4gICAgICAvLyBTaW5jZSBBbmd1bGFySlMgdjEuNS44LCBgY2xvbmVBdHRhY2hGbmAgd2lsbCB0cnkgdG8gZGVzdHJveSB0aGUgdHJhbnNjbHVzaW9uIHNjb3BlIGlmXG4gICAgICAvLyBgJHRlbXBsYXRlYCBpcyBlbXB0eS4gU2luY2UgdGhlIHRyYW5zY2x1ZGVkIGNvbnRlbnQgY29tZXMgZnJvbSBBbmd1bGFyLCBub3QgQW5ndWxhckpTLFxuICAgICAgLy8gdGhlcmUgd2lsbCBiZSBubyB0cmFuc2NsdXNpb24gc2NvcGUgaGVyZS5cbiAgICAgIC8vIFByb3ZpZGUgYSBkdW1teSBgc2NvcGUuJGRlc3Ryb3koKWAgbWV0aG9kIHRvIHByZXZlbnQgYGNsb25lQXR0YWNoRm5gIGZyb20gdGhyb3dpbmcuXG4gICAgICBzY29wZSA9IHNjb3BlIHx8IHskZGVzdHJveTogKCkgPT4gdW5kZWZpbmVkfTtcbiAgICAgIHJldHVybiBjbG9uZUF0dGFjaEZuICEoJHRlbXBsYXRlLCBzY29wZSk7XG4gICAgfTtcbiAgICBsZXQgJHRlbXBsYXRlID0gY29udGVudENoaWxkTm9kZXM7XG5cbiAgICBpZiAodHJhbnNjbHVkZSkge1xuICAgICAgY29uc3Qgc2xvdHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICBpZiAodHlwZW9mIHRyYW5zY2x1ZGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICR0ZW1wbGF0ZSA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHNsb3RNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBjb25zdCBmaWxsZWRTbG90cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgICAgLy8gUGFyc2UgdGhlIGVsZW1lbnQgc2VsZWN0b3JzLlxuICAgICAgICBPYmplY3Qua2V5cyh0cmFuc2NsdWRlKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBsZXQgc2VsZWN0b3IgPSB0cmFuc2NsdWRlW3Nsb3ROYW1lXTtcbiAgICAgICAgICBjb25zdCBvcHRpb25hbCA9IHNlbGVjdG9yLmNoYXJBdCgwKSA9PT0gJz8nO1xuICAgICAgICAgIHNlbGVjdG9yID0gb3B0aW9uYWwgPyBzZWxlY3Rvci5zdWJzdHJpbmcoMSkgOiBzZWxlY3RvcjtcblxuICAgICAgICAgIHNsb3RNYXBbc2VsZWN0b3JdID0gc2xvdE5hbWU7XG4gICAgICAgICAgc2xvdHNbc2xvdE5hbWVdID0gbnVsbDsgICAgICAgICAgICAvLyBgbnVsbGA6IERlZmluZWQgYnV0IG5vdCB5ZXQgZmlsbGVkLlxuICAgICAgICAgIGZpbGxlZFNsb3RzW3Nsb3ROYW1lXSA9IG9wdGlvbmFsOyAgLy8gQ29uc2lkZXIgb3B0aW9uYWwgc2xvdHMgYXMgZmlsbGVkLlxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgdGhlIG1hdGNoaW5nIGVsZW1lbnRzIGludG8gdGhlaXIgc2xvdC5cbiAgICAgICAgY29udGVudENoaWxkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICBjb25zdCBzbG90TmFtZSA9IHNsb3RNYXBbZGlyZWN0aXZlTm9ybWFsaXplKG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSldO1xuICAgICAgICAgIGlmIChzbG90TmFtZSkge1xuICAgICAgICAgICAgZmlsbGVkU2xvdHNbc2xvdE5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IHNsb3RzW3Nsb3ROYW1lXSB8fCBbXTtcbiAgICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXS5wdXNoKG5vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkdGVtcGxhdGUucHVzaChub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciByZXF1aXJlZCBzbG90cyB0aGF0IHdlcmUgbm90IGZpbGxlZC5cbiAgICAgICAgT2JqZWN0LmtleXMoZmlsbGVkU2xvdHMpLmZvckVhY2goc2xvdE5hbWUgPT4ge1xuICAgICAgICAgIGlmICghZmlsbGVkU2xvdHNbc2xvdE5hbWVdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVpcmVkIHRyYW5zY2x1c2lvbiBzbG90ICcke3Nsb3ROYW1lfScgb24gZGlyZWN0aXZlOiAke3RoaXMubmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNsb3RzKS5maWx0ZXIoc2xvdE5hbWUgPT4gc2xvdHNbc2xvdE5hbWVdKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlcyA9IHNsb3RzW3Nsb3ROYW1lXTtcbiAgICAgICAgICBzbG90c1tzbG90TmFtZV0gPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBjbG9uZUF0dGFjaDogYW5ndWxhci5JQ2xvbmVBdHRhY2hGdW5jdGlvbikgPT5cbiAgICAgICAgICAgICAgY2xvbmVBdHRhY2ggIShub2Rlcywgc2NvcGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQXR0YWNoIGAkJHNsb3RzYCB0byBkZWZhdWx0IHNsb3QgdHJhbnNjbHVkZSBmbi5cbiAgICAgIGF0dGFjaENoaWxkcmVuRm4uJCRzbG90cyA9IHNsb3RzO1xuXG4gICAgICAvLyBBbmd1bGFySlMgdjEuNisgaWdub3JlcyBlbXB0eSBvciB3aGl0ZXNwYWNlLW9ubHkgdHJhbnNjbHVkZWQgdGV4dCBub2Rlcy4gQnV0IEFuZ3VsYXJcbiAgICAgIC8vIHJlbW92ZXMgYWxsIHRleHQgY29udGVudCBhZnRlciB0aGUgZmlyc3QgaW50ZXJwb2xhdGlvbiBhbmQgdXBkYXRlcyBpdCBsYXRlciwgYWZ0ZXJcbiAgICAgIC8vIGV2YWx1YXRpbmcgdGhlIGV4cHJlc3Npb25zLiBUaGlzIHdvdWxkIHJlc3VsdCBpbiBBbmd1bGFySlMgZmFpbGluZyB0byByZWNvZ25pemUgdGV4dFxuICAgICAgLy8gbm9kZXMgdGhhdCBzdGFydCB3aXRoIGFuIGludGVycG9sYXRpb24gYXMgdHJhbnNjbHVkZWQgY29udGVudCBhbmQgdXNlIHRoZSBmYWxsYmFja1xuICAgICAgLy8gY29udGVudCBpbnN0ZWFkLlxuICAgICAgLy8gVG8gYXZvaWQgdGhpcyBpc3N1ZSwgd2UgYWRkIGFcbiAgICAgIC8vIFt6ZXJvLXdpZHRoIG5vbi1qb2luZXIgY2hhcmFjdGVyXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9aZXJvLXdpZHRoX25vbi1qb2luZXIpXG4gICAgICAvLyB0byBlbXB0eSB0ZXh0IG5vZGVzICh3aGljaCBjYW4gb25seSBiZSBhIHJlc3VsdCBvZiBBbmd1bGFyIHJlbW92aW5nIHRoZWlyIGluaXRpYWwgY29udGVudCkuXG4gICAgICAvLyBOT1RFOiBUcmFuc2NsdWRlZCB0ZXh0IGNvbnRlbnQgdGhhdCBzdGFydHMgd2l0aCB3aGl0ZXNwYWNlIGZvbGxvd2VkIGJ5IGFuIGludGVycG9sYXRpb25cbiAgICAgIC8vICAgICAgIHdpbGwgc3RpbGwgZmFpbCB0byBiZSBkZXRlY3RlZCBieSBBbmd1bGFySlMgdjEuNitcbiAgICAgICR0ZW1wbGF0ZS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUgJiYgIW5vZGUubm9kZVZhbHVlKSB7XG4gICAgICAgICAgbm9kZS5ub2RlVmFsdWUgPSAnXFx1MjAwQyc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhdHRhY2hDaGlsZHJlbkZuO1xuICB9XG5cbiAgcmVzb2x2ZUFuZEJpbmRSZXF1aXJlZENvbnRyb2xsZXJzKGNvbnRyb2xsZXJJbnN0YW5jZTogSUNvbnRyb2xsZXJJbnN0YW5jZXxudWxsKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlUmVxdWlyZSA9IHRoaXMuZ2V0RGlyZWN0aXZlUmVxdWlyZSgpO1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPSB0aGlzLnJlc29sdmVSZXF1aXJlKGRpcmVjdGl2ZVJlcXVpcmUpO1xuXG4gICAgaWYgKGNvbnRyb2xsZXJJbnN0YW5jZSAmJiB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyICYmIGlzTWFwKGRpcmVjdGl2ZVJlcXVpcmUpKSB7XG4gICAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzTWFwID0gcmVxdWlyZWRDb250cm9sbGVycyBhc3tba2V5OiBzdHJpbmddOiBJQ29udHJvbGxlckluc3RhbmNlfTtcbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmVkQ29udHJvbGxlcnNNYXApLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29udHJvbGxlckluc3RhbmNlW2tleV0gPSByZXF1aXJlZENvbnRyb2xsZXJzTWFwW2tleV07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVxdWlyZWRDb250cm9sbGVycztcbiAgfVxuXG4gIHByaXZhdGUgY29tcGlsZUh0bWwoaHRtbDogc3RyaW5nKTogYW5ndWxhci5JTGlua0ZuIHtcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gdGhpcy4kY29tcGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcyk7XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RDaGlsZE5vZGVzKCk6IE5vZGVbXSB7XG4gICAgY29uc3QgY2hpbGROb2RlczogTm9kZVtdID0gW107XG4gICAgbGV0IGNoaWxkTm9kZTogTm9kZXxudWxsO1xuXG4gICAgd2hpbGUgKGNoaWxkTm9kZSA9IHRoaXMuZWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGROb2RlKTtcbiAgICAgIGNoaWxkTm9kZXMucHVzaChjaGlsZE5vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZE5vZGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREaXJlY3RpdmVSZXF1aXJlKCk6IGFuZ3VsYXIuRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5IHtcbiAgICBjb25zdCByZXF1aXJlID0gdGhpcy5kaXJlY3RpdmUucmVxdWlyZSB8fCAodGhpcy5kaXJlY3RpdmUuY29udHJvbGxlciAmJiB0aGlzLmRpcmVjdGl2ZS5uYW1lKSAhO1xuXG4gICAgaWYgKGlzTWFwKHJlcXVpcmUpKSB7XG4gICAgICBPYmplY3Qua2V5cyhyZXF1aXJlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gcmVxdWlyZVtrZXldO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHZhbHVlLm1hdGNoKFJFUVVJUkVfUFJFRklYX1JFKSAhO1xuICAgICAgICBjb25zdCBuYW1lID0gdmFsdWUuc3Vic3RyaW5nKG1hdGNoWzBdLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgcmVxdWlyZVtrZXldID0gbWF0Y2hbMF0gKyBrZXk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1aXJlO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlUmVxdWlyZShyZXF1aXJlOiBhbmd1bGFyLkRpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eSwgY29udHJvbGxlckluc3RhbmNlPzogYW55KTpcbiAgICAgIGFuZ3VsYXIuU2luZ2xlT3JMaXN0T3JNYXA8SUNvbnRyb2xsZXJJbnN0YW5jZT58bnVsbCB7XG4gICAgaWYgKCFyZXF1aXJlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVxdWlyZSkpIHtcbiAgICAgIHJldHVybiByZXF1aXJlLm1hcChyZXEgPT4gdGhpcy5yZXNvbHZlUmVxdWlyZShyZXEpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXF1aXJlID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgdmFsdWU6IHtba2V5OiBzdHJpbmddOiBJQ29udHJvbGxlckluc3RhbmNlfSA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZSkuZm9yRWFjaChrZXkgPT4gdmFsdWVba2V5XSA9IHRoaXMucmVzb2x2ZVJlcXVpcmUocmVxdWlyZVtrZXldKSAhKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXF1aXJlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgbWF0Y2ggPSByZXF1aXJlLm1hdGNoKFJFUVVJUkVfUFJFRklYX1JFKSAhO1xuICAgICAgY29uc3QgaW5oZXJpdFR5cGUgPSBtYXRjaFsxXSB8fCBtYXRjaFszXTtcblxuICAgICAgY29uc3QgbmFtZSA9IHJlcXVpcmUuc3Vic3RyaW5nKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICBjb25zdCBpc09wdGlvbmFsID0gISFtYXRjaFsyXTtcbiAgICAgIGNvbnN0IHNlYXJjaFBhcmVudHMgPSAhIWluaGVyaXRUeXBlO1xuICAgICAgY29uc3Qgc3RhcnRPblBhcmVudCA9IGluaGVyaXRUeXBlID09PSAnXl4nO1xuXG4gICAgICBjb25zdCBjdHJsS2V5ID0gY29udHJvbGxlcktleShuYW1lKTtcbiAgICAgIGNvbnN0IGVsZW0gPSBzdGFydE9uUGFyZW50ID8gdGhpcy4kZWxlbWVudC5wYXJlbnQgISgpIDogdGhpcy4kZWxlbWVudDtcbiAgICAgIGNvbnN0IHZhbHVlID0gc2VhcmNoUGFyZW50cyA/IGVsZW0uaW5oZXJpdGVkRGF0YSAhKGN0cmxLZXkpIDogZWxlbS5kYXRhICEoY3RybEtleSk7XG5cbiAgICAgIGlmICghdmFsdWUgJiYgIWlzT3B0aW9uYWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBmaW5kIHJlcXVpcmVkICcke3JlcXVpcmV9JyBpbiB1cGdyYWRlZCBkaXJlY3RpdmUgJyR7dGhpcy5uYW1lfScuYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbnJlY29nbml6ZWQgJ3JlcXVpcmUnIHN5bnRheCBvbiB1cGdyYWRlZCBkaXJlY3RpdmUgJyR7dGhpcy5uYW1lfSc6ICR7cmVxdWlyZX1gKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0T3JDYWxsPFQ+KHByb3BlcnR5OiBUIHwgRnVuY3Rpb24pOiBUIHtcbiAgcmV0dXJuIGlzRnVuY3Rpb24ocHJvcGVydHkpID8gcHJvcGVydHkoKSA6IHByb3BlcnR5O1xufVxuXG4vLyBOT1RFOiBPbmx5IHdvcmtzIGZvciBgdHlwZW9mIFQgIT09ICdvYmplY3QnYC5cbmZ1bmN0aW9uIGlzTWFwPFQ+KHZhbHVlOiBhbmd1bGFyLlNpbmdsZU9yTGlzdE9yTWFwPFQ+KTogdmFsdWUgaXMge1trZXk6IHN0cmluZ106IFR9IHtcbiAgcmV0dXJuIHZhbHVlICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG5mdW5jdGlvbiBub3RTdXBwb3J0ZWQobmFtZTogc3RyaW5nLCBmZWF0dXJlOiBzdHJpbmcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBVcGdyYWRlZCBkaXJlY3RpdmUgJyR7bmFtZX0nIGNvbnRhaW5zIHVuc3VwcG9ydGVkIGZlYXR1cmU6ICcke2ZlYXR1cmV9Jy5gKTtcbn1cbiJdfQ==