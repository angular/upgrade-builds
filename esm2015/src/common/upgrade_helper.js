/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
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
// Constants
/** @type {?} */
const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
/**
 * @record
 */
export function IBindingDestination() { }
if (false) {
    /** @type {?|undefined} */
    IBindingDestination.prototype.$onChanges;
    /* Skipping unhandled member: [key: string]: any;*/
}
/**
 * @record
 */
export function IControllerInstance() { }
if (false) {
    /** @type {?|undefined} */
    IControllerInstance.prototype.$doCheck;
    /** @type {?|undefined} */
    IControllerInstance.prototype.$onDestroy;
    /** @type {?|undefined} */
    IControllerInstance.prototype.$onInit;
    /** @type {?|undefined} */
    IControllerInstance.prototype.$postLink;
}
// Classes
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
            const $templateCache = (/** @type {?} */ ($injector.get($TEMPLATE_CACHE)));
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
                const $httpBackend = (/** @type {?} */ ($injector.get($HTTP_BACKEND)));
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
        // TODO: Document that we do not pre-assign bindings on the controller instance.
        // Quoted properties below so that this code can be optimized with Closure Compiler.
        /** @type {?} */
        const locals = { '$scope': $scope, '$element': this.$element };
        /** @type {?} */
        const controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);
        (/** @type {?} */ (this.$element.data))(controllerKey((/** @type {?} */ (this.directive.name))), controller);
        return controller;
    }
    /**
     * @param {?=} template
     * @return {?}
     */
    compileTemplate(template) {
        if (template === undefined) {
            template = (/** @type {?} */ (UpgradeHelper.getTemplate(this.$injector, this.directive)));
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
            return (/** @type {?} */ (cloneAttachFn))($template, scope);
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
                    slots[slotName] = (scope, cloneAttach) => (/** @type {?} */ (cloneAttach))(nodes, scope);
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
            const requiredControllersMap = (/** @type {?} */ (requiredControllers));
            Object.keys(requiredControllersMap).forEach(key => {
                controllerInstance[key] = requiredControllersMap[key];
            });
        }
        return requiredControllers;
    }
    /**
     * @private
     * @param {?} html
     * @return {?}
     */
    compileHtml(html) {
        this.element.innerHTML = html;
        return this.$compile(this.element.childNodes);
    }
    /**
     * @private
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
     * @private
     * @return {?}
     */
    getDirectiveRequire() {
        /** @type {?} */
        const require = this.directive.require || (/** @type {?} */ ((this.directive.controller && this.directive.name)));
        if (isMap(require)) {
            Object.keys(require).forEach(key => {
                /** @type {?} */
                const value = require[key];
                /** @type {?} */
                const match = (/** @type {?} */ (value.match(REQUIRE_PREFIX_RE)));
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
     * @private
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
            Object.keys(require).forEach(key => value[key] = (/** @type {?} */ (this.resolveRequire(require[key]))));
            return value;
        }
        else if (typeof require === 'string') {
            /** @type {?} */
            const match = (/** @type {?} */ (require.match(REQUIRE_PREFIX_RE)));
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
            const elem = startOnParent ? (/** @type {?} */ (this.$element.parent))() : this.$element;
            /** @type {?} */
            const value = searchParents ? (/** @type {?} */ (elem.inheritedData))(ctrlKey) : (/** @type {?} */ (elem.data))(ctrlKey);
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
    /**
     * @type {?}
     * @private
     */
    UpgradeHelper.prototype.$compile;
    /**
     * @type {?}
     * @private
     */
    UpgradeHelper.prototype.$controller;
    /**
     * @type {?}
     * @private
     */
    UpgradeHelper.prototype.injector;
    /**
     * @type {?}
     * @private
     */
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
// NOTE: Only works for `typeof T !== 'object'`.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vdXBncmFkZV9oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFVQSxPQUFPLEtBQUssT0FBTyxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLEVBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUM3RixPQUFPLEVBQUMsYUFBYSxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7O01BSS9ELGlCQUFpQixHQUFHLHdCQUF3Qjs7OztBQUdsRCx5Q0FHQzs7O0lBREMseUNBQThDOzs7Ozs7QUFHaEQseUNBS0M7OztJQUpDLHVDQUFzQjs7SUFDdEIseUNBQXdCOztJQUN4QixzQ0FBcUI7O0lBQ3JCLHdDQUF1Qjs7O0FBSXpCLE1BQU0sT0FBTyxhQUFhOzs7Ozs7O0lBU3hCLFlBQ1ksUUFBa0IsRUFBVSxJQUFZLEVBQUUsVUFBc0IsRUFDeEUsU0FBOEI7UUFEdEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLFNBQUksR0FBSixJQUFJLENBQVE7UUFFbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxD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Qzs7Ozs7O0FBRUQsU0FBUyxZQUFZLENBQUMsSUFBWSxFQUFFLE9BQWU7SUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxvQ0FBb0MsT0FBTyxJQUFJLENBQUMsQ0FBQztBQUM5RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VsZW1lbnRSZWYsIEluamVjdG9yLCBTaW1wbGVDaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7JENPTVBJTEUsICRDT05UUk9MTEVSLCAkSFRUUF9CQUNLRU5ELCAkSU5KRUNUT1IsICRURU1QTEFURV9DQUNIRX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtjb250cm9sbGVyS2V5LCBkaXJlY3RpdmVOb3JtYWxpemUsIGlzRnVuY3Rpb259IGZyb20gJy4vdXRpbCc7XG5cblxuLy8gQ29uc3RhbnRzXG5jb25zdCBSRVFVSVJFX1BSRUZJWF9SRSA9IC9eKFxcXlxcXj8pPyhcXD8pPyhcXF5cXF4/KT8vO1xuXG4vLyBJbnRlcmZhY2VzXG5leHBvcnQgaW50ZXJmYWNlIElCaW5kaW5nRGVzdGluYXRpb24ge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG4gICRvbkNoYW5nZXM/OiAoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ29udHJvbGxlckluc3RhbmNlIGV4dGVuZHMgSUJpbmRpbmdEZXN0aW5hdGlvbiB7XG4gICRkb0NoZWNrPzogKCkgPT4gdm9pZDtcbiAgJG9uRGVzdHJveT86ICgpID0+IHZvaWQ7XG4gICRvbkluaXQ/OiAoKSA9PiB2b2lkO1xuICAkcG9zdExpbms/OiAoKSA9PiB2b2lkO1xufVxuXG4vLyBDbGFzc2VzXG5leHBvcnQgY2xhc3MgVXBncmFkZUhlbHBlciB7XG4gIHB1YmxpYyByZWFkb25seSAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZTtcbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IEVsZW1lbnQ7XG4gIHB1YmxpYyByZWFkb25seSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5O1xuICBwdWJsaWMgcmVhZG9ubHkgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmU7XG5cbiAgcHJpdmF0ZSByZWFkb25seSAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XG4gIHByaXZhdGUgcmVhZG9ubHkgJGNvbnRyb2xsZXI6IGFuZ3VsYXIuSUNvbnRyb2xsZXJTZXJ2aWNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgbmFtZTogc3RyaW5nLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgZGlyZWN0aXZlPzogYW5ndWxhci5JRGlyZWN0aXZlKSB7XG4gICAgdGhpcy4kaW5qZWN0b3IgPSBpbmplY3Rvci5nZXQoJElOSkVDVE9SKTtcbiAgICB0aGlzLiRjb21waWxlID0gdGhpcy4kaW5qZWN0b3IuZ2V0KCRDT01QSUxFKTtcbiAgICB0aGlzLiRjb250cm9sbGVyID0gdGhpcy4kaW5qZWN0b3IuZ2V0KCRDT05UUk9MTEVSKTtcblxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KHRoaXMuZWxlbWVudCk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZSA9IGRpcmVjdGl2ZSB8fCBVcGdyYWRlSGVscGVyLmdldERpcmVjdGl2ZSh0aGlzLiRpbmplY3RvciwgbmFtZSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0RGlyZWN0aXZlKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCBuYW1lOiBzdHJpbmcpOiBhbmd1bGFyLklEaXJlY3RpdmUge1xuICAgIGNvbnN0IGRpcmVjdGl2ZXM6IGFuZ3VsYXIuSURpcmVjdGl2ZVtdID0gJGluamVjdG9yLmdldChuYW1lICsgJ0RpcmVjdGl2ZScpO1xuICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgT25seSBzdXBwb3J0IHNpbmdsZSBkaXJlY3RpdmUgZGVmaW5pdGlvbiBmb3I6ICR7bmFtZX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RpdmUgPSBkaXJlY3RpdmVzWzBdO1xuXG4gICAgLy8gQW5ndWxhckpTIHdpbGwgdHJhbnNmb3JtIGBsaW5rOiB4eXpgIHRvIGBjb21waWxlOiAoKSA9PiB4eXpgLiBTbyB3ZSBjYW4gb25seSB0ZWxsIHRoZXJlIHdhcyBhXG4gICAgLy8gdXNlci1kZWZpbmVkIGBjb21waWxlYCBpZiB0aGVyZSBpcyBubyBgbGlua2AuIEluIG90aGVyIGNhc2VzLCB3ZSB3aWxsIGp1c3QgaWdub3JlIGBjb21waWxlYC5cbiAgICBpZiAoZGlyZWN0aXZlLmNvbXBpbGUgJiYgIWRpcmVjdGl2ZS5saW5rKSBub3RTdXBwb3J0ZWQobmFtZSwgJ2NvbXBpbGUnKTtcbiAgICBpZiAoZGlyZWN0aXZlLnJlcGxhY2UpIG5vdFN1cHBvcnRlZChuYW1lLCAncmVwbGFjZScpO1xuICAgIGlmIChkaXJlY3RpdmUudGVybWluYWwpIG5vdFN1cHBvcnRlZChuYW1lLCAndGVybWluYWwnKTtcblxuICAgIHJldHVybiBkaXJlY3RpdmU7XG4gIH1cblxuICBzdGF0aWMgZ2V0VGVtcGxhdGUoXG4gICAgICAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSwgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmUsXG4gICAgICBmZXRjaFJlbW90ZVRlbXBsYXRlID0gZmFsc2UpOiBzdHJpbmd8UHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAoZGlyZWN0aXZlLnRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBnZXRPckNhbGw8c3RyaW5nPihkaXJlY3RpdmUudGVtcGxhdGUpO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aXZlLnRlbXBsYXRlVXJsKSB7XG4gICAgICBjb25zdCAkdGVtcGxhdGVDYWNoZSA9ICRpbmplY3Rvci5nZXQoJFRFTVBMQVRFX0NBQ0hFKSBhcyBhbmd1bGFyLklUZW1wbGF0ZUNhY2hlU2VydmljZTtcbiAgICAgIGNvbnN0IHVybCA9IGdldE9yQ2FsbDxzdHJpbmc+KGRpcmVjdGl2ZS50ZW1wbGF0ZVVybCk7XG4gICAgICBjb25zdCB0ZW1wbGF0ZSA9ICR0ZW1wbGF0ZUNhY2hlLmdldCh1cmwpO1xuXG4gICAgICBpZiAodGVtcGxhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9IGVsc2UgaWYgKCFmZXRjaFJlbW90ZVRlbXBsYXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9hZGluZyBkaXJlY3RpdmUgdGVtcGxhdGVzIGFzeW5jaHJvbm91c2x5IGlzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgJGh0dHBCYWNrZW5kID0gJGluamVjdG9yLmdldCgkSFRUUF9CQUNLRU5EKSBhcyBhbmd1bGFyLklIdHRwQmFja2VuZFNlcnZpY2U7XG4gICAgICAgICRodHRwQmFja2VuZCgnR0VUJywgdXJsLCBudWxsLCAoc3RhdHVzOiBudW1iZXIsIHJlc3BvbnNlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBpZiAoc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJlc29sdmUoJHRlbXBsYXRlQ2FjaGUucHV0KHVybCwgcmVzcG9uc2UpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KGBHRVQgY29tcG9uZW50IHRlbXBsYXRlIGZyb20gJyR7dXJsfScgcmV0dXJuZWQgJyR7c3RhdHVzfTogJHtyZXNwb25zZX0nYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYERpcmVjdGl2ZSAnJHtkaXJlY3RpdmUubmFtZX0nIGlzIG5vdCBhIGNvbXBvbmVudCwgaXQgaXMgbWlzc2luZyB0ZW1wbGF0ZS5gKTtcbiAgICB9XG4gIH1cblxuICBidWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGU6IGFuZ3VsYXIuSUNvbnRyb2xsZXIsICRzY29wZTogYW5ndWxhci5JU2NvcGUpIHtcbiAgICAvLyBUT0RPOiBEb2N1bWVudCB0aGF0IHdlIGRvIG5vdCBwcmUtYXNzaWduIGJpbmRpbmdzIG9uIHRoZSBjb250cm9sbGVyIGluc3RhbmNlLlxuICAgIC8vIFF1b3RlZCBwcm9wZXJ0aWVzIGJlbG93IHNvIHRoYXQgdGhpcyBjb2RlIGNhbiBiZSBvcHRpbWl6ZWQgd2l0aCBDbG9zdXJlIENvbXBpbGVyLlxuICAgIGNvbnN0IGxvY2FscyA9IHsnJHNjb3BlJzogJHNjb3BlLCAnJGVsZW1lbnQnOiB0aGlzLiRlbGVtZW50fTtcbiAgICBjb25zdCBjb250cm9sbGVyID0gdGhpcy4kY29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgbG9jYWxzLCBudWxsLCB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyQXMpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5kYXRhICEoY29udHJvbGxlcktleSh0aGlzLmRpcmVjdGl2ZS5uYW1lICEpLCBjb250cm9sbGVyKTtcblxuICAgIHJldHVybiBjb250cm9sbGVyO1xuICB9XG5cbiAgY29tcGlsZVRlbXBsYXRlKHRlbXBsYXRlPzogc3RyaW5nKTogYW5ndWxhci5JTGlua0ZuIHtcbiAgICBpZiAodGVtcGxhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGVtcGxhdGUgPSBVcGdyYWRlSGVscGVyLmdldFRlbXBsYXRlKHRoaXMuJGluamVjdG9yLCB0aGlzLmRpcmVjdGl2ZSkgYXMgc3RyaW5nO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNvbXBpbGVIdG1sKHRlbXBsYXRlKTtcbiAgfVxuXG4gIG9uRGVzdHJveSgkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBjb250cm9sbGVySW5zdGFuY2U/OiBhbnkpIHtcbiAgICBpZiAoY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24oY29udHJvbGxlckluc3RhbmNlLiRvbkRlc3Ryb3kpKSB7XG4gICAgICBjb250cm9sbGVySW5zdGFuY2UuJG9uRGVzdHJveSgpO1xuICAgIH1cbiAgICAkc2NvcGUuJGRlc3Ryb3koKTtcblxuICAgIC8vIENsZWFuIHRoZSBqUXVlcnkvanFMaXRlIGRhdGEgb24gdGhlIGNvbXBvbmVudCtjaGlsZCBlbGVtZW50cy5cbiAgICAvLyBFcXVpdmVsZW50IHRvIGhvdyBqUXVlcnkvanFMaXRlIGludm9rZSBgY2xlYW5EYXRhYCBvbiBhbiBFbGVtZW50ICh0aGlzLmVsZW1lbnQpXG4gICAgLy8gIGh0dHBzOi8vZ2l0aHViLmNvbS9qcXVlcnkvanF1ZXJ5L2Jsb2IvZTc0M2NiZDI4NTUzMjY3Zjk1NWY3MWVhNzI0ODM3NzkxNTYxM2ZkOS9zcmMvbWFuaXB1bGF0aW9uLmpzI0wyMjNcbiAgICAvLyAgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzI2ZGRjNWY4MzBmOTAyYTNkMjJmNGIyYWFiNzBkODZkNGQ2ODhjODIvc3JjL2pxTGl0ZS5qcyNMMzA2LUwzMTJcbiAgICAvLyBgY2xlYW5EYXRhYCB3aWxsIGludm9rZSB0aGUgQW5ndWxhckpTIGAkZGVzdHJveWAgRE9NIGV2ZW50XG4gICAgLy8gIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi8yNmRkYzVmODMwZjkwMmEzZDIyZjRiMmFhYjcwZDg2ZDRkNjg4YzgyL3NyYy9Bbmd1bGFyLmpzI0wxOTExLUwxOTI0XG4gICAgYW5ndWxhci5lbGVtZW50LmNsZWFuRGF0YShbdGhpcy5lbGVtZW50XSk7XG4gICAgYW5ndWxhci5lbGVtZW50LmNsZWFuRGF0YSh0aGlzLmVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnKicpKTtcbiAgfVxuXG4gIHByZXBhcmVUcmFuc2NsdXNpb24oKTogYW5ndWxhci5JTGlua0ZufHVuZGVmaW5lZCB7XG4gICAgY29uc3QgdHJhbnNjbHVkZSA9IHRoaXMuZGlyZWN0aXZlLnRyYW5zY2x1ZGU7XG4gICAgY29uc3QgY29udGVudENoaWxkTm9kZXMgPSB0aGlzLmV4dHJhY3RDaGlsZE5vZGVzKCk7XG4gICAgY29uc3QgYXR0YWNoQ2hpbGRyZW5GbjogYW5ndWxhci5JTGlua0ZuID0gKHNjb3BlLCBjbG9uZUF0dGFjaEZuKSA9PiB7XG4gICAgICAvLyBTaW5jZSBBbmd1bGFySlMgdjEuNS44LCBgY2xvbmVBdHRhY2hGbmAgd2lsbCB0cnkgdG8gZGVzdHJveSB0aGUgdHJhbnNjbHVzaW9uIHNjb3BlIGlmXG4gICAgICAvLyBgJHRlbXBsYXRlYCBpcyBlbXB0eS4gU2luY2UgdGhlIHRyYW5zY2x1ZGVkIGNvbnRlbnQgY29tZXMgZnJvbSBBbmd1bGFyLCBub3QgQW5ndWxhckpTLFxuICAgICAgLy8gdGhlcmUgd2lsbCBiZSBubyB0cmFuc2NsdXNpb24gc2NvcGUgaGVyZS5cbiAgICAgIC8vIFByb3ZpZGUgYSBkdW1teSBgc2NvcGUuJGRlc3Ryb3koKWAgbWV0aG9kIHRvIHByZXZlbnQgYGNsb25lQXR0YWNoRm5gIGZyb20gdGhyb3dpbmcuXG4gICAgICBzY29wZSA9IHNjb3BlIHx8IHskZGVzdHJveTogKCkgPT4gdW5kZWZpbmVkfTtcbiAgICAgIHJldHVybiBjbG9uZUF0dGFjaEZuICEoJHRlbXBsYXRlLCBzY29wZSk7XG4gICAgfTtcbiAgICBsZXQgJHRlbXBsYXRlID0gY29udGVudENoaWxkTm9kZXM7XG5cbiAgICBpZiAodHJhbnNjbHVkZSkge1xuICAgICAgY29uc3Qgc2xvdHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICBpZiAodHlwZW9mIHRyYW5zY2x1ZGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICR0ZW1wbGF0ZSA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHNsb3RNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBjb25zdCBmaWxsZWRTbG90cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgICAgLy8gUGFyc2UgdGhlIGVsZW1lbnQgc2VsZWN0b3JzLlxuICAgICAgICBPYmplY3Qua2V5cyh0cmFuc2NsdWRlKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBsZXQgc2VsZWN0b3IgPSB0cmFuc2NsdWRlW3Nsb3ROYW1lXTtcbiAgICAgICAgICBjb25zdCBvcHRpb25hbCA9IHNlbGVjdG9yLmNoYXJBdCgwKSA9PT0gJz8nO1xuICAgICAgICAgIHNlbGVjdG9yID0gb3B0aW9uYWwgPyBzZWxlY3Rvci5zdWJzdHJpbmcoMSkgOiBzZWxlY3RvcjtcblxuICAgICAgICAgIHNsb3RNYXBbc2VsZWN0b3JdID0gc2xvdE5hbWU7XG4gICAgICAgICAgc2xvdHNbc2xvdE5hbWVdID0gbnVsbDsgICAgICAgICAgICAvLyBgbnVsbGA6IERlZmluZWQgYnV0IG5vdCB5ZXQgZmlsbGVkLlxuICAgICAgICAgIGZpbGxlZFNsb3RzW3Nsb3ROYW1lXSA9IG9wdGlvbmFsOyAgLy8gQ29uc2lkZXIgb3B0aW9uYWwgc2xvdHMgYXMgZmlsbGVkLlxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgdGhlIG1hdGNoaW5nIGVsZW1lbnRzIGludG8gdGhlaXIgc2xvdC5cbiAgICAgICAgY29udGVudENoaWxkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICBjb25zdCBzbG90TmFtZSA9IHNsb3RNYXBbZGlyZWN0aXZlTm9ybWFsaXplKG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSldO1xuICAgICAgICAgIGlmIChzbG90TmFtZSkge1xuICAgICAgICAgICAgZmlsbGVkU2xvdHNbc2xvdE5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IHNsb3RzW3Nsb3ROYW1lXSB8fCBbXTtcbiAgICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXS5wdXNoKG5vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkdGVtcGxhdGUucHVzaChub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciByZXF1aXJlZCBzbG90cyB0aGF0IHdlcmUgbm90IGZpbGxlZC5cbiAgICAgICAgT2JqZWN0LmtleXMoZmlsbGVkU2xvdHMpLmZvckVhY2goc2xvdE5hbWUgPT4ge1xuICAgICAgICAgIGlmICghZmlsbGVkU2xvdHNbc2xvdE5hbWVdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVpcmVkIHRyYW5zY2x1c2lvbiBzbG90ICcke3Nsb3ROYW1lfScgb24gZGlyZWN0aXZlOiAke3RoaXMubmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNsb3RzKS5maWx0ZXIoc2xvdE5hbWUgPT4gc2xvdHNbc2xvdE5hbWVdKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlcyA9IHNsb3RzW3Nsb3ROYW1lXTtcbiAgICAgICAgICBzbG90c1tzbG90TmFtZV0gPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBjbG9uZUF0dGFjaDogYW5ndWxhci5JQ2xvbmVBdHRhY2hGdW5jdGlvbikgPT5cbiAgICAgICAgICAgICAgY2xvbmVBdHRhY2ggIShub2Rlcywgc2NvcGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQXR0YWNoIGAkJHNsb3RzYCB0byBkZWZhdWx0IHNsb3QgdHJhbnNjbHVkZSBmbi5cbiAgICAgIGF0dGFjaENoaWxkcmVuRm4uJCRzbG90cyA9IHNsb3RzO1xuXG4gICAgICAvLyBBbmd1bGFySlMgdjEuNisgaWdub3JlcyBlbXB0eSBvciB3aGl0ZXNwYWNlLW9ubHkgdHJhbnNjbHVkZWQgdGV4dCBub2Rlcy4gQnV0IEFuZ3VsYXJcbiAgICAgIC8vIHJlbW92ZXMgYWxsIHRleHQgY29udGVudCBhZnRlciB0aGUgZmlyc3QgaW50ZXJwb2xhdGlvbiBhbmQgdXBkYXRlcyBpdCBsYXRlciwgYWZ0ZXJcbiAgICAgIC8vIGV2YWx1YXRpbmcgdGhlIGV4cHJlc3Npb25zLiBUaGlzIHdvdWxkIHJlc3VsdCBpbiBBbmd1bGFySlMgZmFpbGluZyB0byByZWNvZ25pemUgdGV4dFxuICAgICAgLy8gbm9kZXMgdGhhdCBzdGFydCB3aXRoIGFuIGludGVycG9sYXRpb24gYXMgdHJhbnNjbHVkZWQgY29udGVudCBhbmQgdXNlIHRoZSBmYWxsYmFja1xuICAgICAgLy8gY29udGVudCBpbnN0ZWFkLlxuICAgICAgLy8gVG8gYXZvaWQgdGhpcyBpc3N1ZSwgd2UgYWRkIGFcbiAgICAgIC8vIFt6ZXJvLXdpZHRoIG5vbi1qb2luZXIgY2hhcmFjdGVyXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9aZXJvLXdpZHRoX25vbi1qb2luZXIpXG4gICAgICAvLyB0byBlbXB0eSB0ZXh0IG5vZGVzICh3aGljaCBjYW4gb25seSBiZSBhIHJlc3VsdCBvZiBBbmd1bGFyIHJlbW92aW5nIHRoZWlyIGluaXRpYWwgY29udGVudCkuXG4gICAgICAvLyBOT1RFOiBUcmFuc2NsdWRlZCB0ZXh0IGNvbnRlbnQgdGhhdCBzdGFydHMgd2l0aCB3aGl0ZXNwYWNlIGZvbGxvd2VkIGJ5IGFuIGludGVycG9sYXRpb25cbiAgICAgIC8vICAgICAgIHdpbGwgc3RpbGwgZmFpbCB0byBiZSBkZXRlY3RlZCBieSBBbmd1bGFySlMgdjEuNitcbiAgICAgICR0ZW1wbGF0ZS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUgJiYgIW5vZGUubm9kZVZhbHVlKSB7XG4gICAgICAgICAgbm9kZS5ub2RlVmFsdWUgPSAnXFx1MjAwQyc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhdHRhY2hDaGlsZHJlbkZuO1xuICB9XG5cbiAgcmVzb2x2ZUFuZEJpbmRSZXF1aXJlZENvbnRyb2xsZXJzKGNvbnRyb2xsZXJJbnN0YW5jZTogSUNvbnRyb2xsZXJJbnN0YW5jZXxudWxsKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlUmVxdWlyZSA9IHRoaXMuZ2V0RGlyZWN0aXZlUmVxdWlyZSgpO1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPSB0aGlzLnJlc29sdmVSZXF1aXJlKGRpcmVjdGl2ZVJlcXVpcmUpO1xuXG4gICAgaWYgKGNvbnRyb2xsZXJJbnN0YW5jZSAmJiB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyICYmIGlzTWFwKGRpcmVjdGl2ZVJlcXVpcmUpKSB7XG4gICAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzTWFwID0gcmVxdWlyZWRDb250cm9sbGVycyBhc3tba2V5OiBzdHJpbmddOiBJQ29udHJvbGxlckluc3RhbmNlfTtcbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmVkQ29udHJvbGxlcnNNYXApLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29udHJvbGxlckluc3RhbmNlW2tleV0gPSByZXF1aXJlZENvbnRyb2xsZXJzTWFwW2tleV07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVxdWlyZWRDb250cm9sbGVycztcbiAgfVxuXG4gIHByaXZhdGUgY29tcGlsZUh0bWwoaHRtbDogc3RyaW5nKTogYW5ndWxhci5JTGlua0ZuIHtcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gdGhpcy4kY29tcGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcyk7XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RDaGlsZE5vZGVzKCk6IE5vZGVbXSB7XG4gICAgY29uc3QgY2hpbGROb2RlczogTm9kZVtdID0gW107XG4gICAgbGV0IGNoaWxkTm9kZTogTm9kZXxudWxsO1xuXG4gICAgd2hpbGUgKGNoaWxkTm9kZSA9IHRoaXMuZWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGROb2RlKTtcbiAgICAgIGNoaWxkTm9kZXMucHVzaChjaGlsZE5vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZE5vZGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREaXJlY3RpdmVSZXF1aXJlKCk6IGFuZ3VsYXIuRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5IHtcbiAgICBjb25zdCByZXF1aXJlID0gdGhpcy5kaXJlY3RpdmUucmVxdWlyZSB8fCAodGhpcy5kaXJlY3RpdmUuY29udHJvbGxlciAmJiB0aGlzLmRpcmVjdGl2ZS5uYW1lKSAhO1xuXG4gICAgaWYgKGlzTWFwKHJlcXVpcmUpKSB7XG4gICAgICBPYmplY3Qua2V5cyhyZXF1aXJlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gcmVxdWlyZVtrZXldO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHZhbHVlLm1hdGNoKFJFUVVJUkVfUFJFRklYX1JFKSAhO1xuICAgICAgICBjb25zdCBuYW1lID0gdmFsdWUuc3Vic3RyaW5nKG1hdGNoWzBdLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgcmVxdWlyZVtrZXldID0gbWF0Y2hbMF0gKyBrZXk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1aXJlO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlUmVxdWlyZShyZXF1aXJlOiBhbmd1bGFyLkRpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eSwgY29udHJvbGxlckluc3RhbmNlPzogYW55KTpcbiAgICAgIGFuZ3VsYXIuU2luZ2xlT3JMaXN0T3JNYXA8SUNvbnRyb2xsZXJJbnN0YW5jZT58bnVsbCB7XG4gICAgaWYgKCFyZXF1aXJlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVxdWlyZSkpIHtcbiAgICAgIHJldHVybiByZXF1aXJlLm1hcChyZXEgPT4gdGhpcy5yZXNvbHZlUmVxdWlyZShyZXEpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXF1aXJlID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgdmFsdWU6IHtba2V5OiBzdHJpbmddOiBJQ29udHJvbGxlckluc3RhbmNlfSA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZSkuZm9yRWFjaChrZXkgPT4gdmFsdWVba2V5XSA9IHRoaXMucmVzb2x2ZVJlcXVpcmUocmVxdWlyZVtrZXldKSAhKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXF1aXJlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgbWF0Y2ggPSByZXF1aXJlLm1hdGNoKFJFUVVJUkVfUFJFRklYX1JFKSAhO1xuICAgICAgY29uc3QgaW5oZXJpdFR5cGUgPSBtYXRjaFsxXSB8fCBtYXRjaFszXTtcblxuICAgICAgY29uc3QgbmFtZSA9IHJlcXVpcmUuc3Vic3RyaW5nKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICBjb25zdCBpc09wdGlvbmFsID0gISFtYXRjaFsyXTtcbiAgICAgIGNvbnN0IHNlYXJjaFBhcmVudHMgPSAhIWluaGVyaXRUeXBlO1xuICAgICAgY29uc3Qgc3RhcnRPblBhcmVudCA9IGluaGVyaXRUeXBlID09PSAnXl4nO1xuXG4gICAgICBjb25zdCBjdHJsS2V5ID0gY29udHJvbGxlcktleShuYW1lKTtcbiAgICAgIGNvbnN0IGVsZW0gPSBzdGFydE9uUGFyZW50ID8gdGhpcy4kZWxlbWVudC5wYXJlbnQgISgpIDogdGhpcy4kZWxlbWVudDtcbiAgICAgIGNvbnN0IHZhbHVlID0gc2VhcmNoUGFyZW50cyA/IGVsZW0uaW5oZXJpdGVkRGF0YSAhKGN0cmxLZXkpIDogZWxlbS5kYXRhICEoY3RybEtleSk7XG5cbiAgICAgIGlmICghdmFsdWUgJiYgIWlzT3B0aW9uYWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBmaW5kIHJlcXVpcmVkICcke3JlcXVpcmV9JyBpbiB1cGdyYWRlZCBkaXJlY3RpdmUgJyR7dGhpcy5uYW1lfScuYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbnJlY29nbml6ZWQgJ3JlcXVpcmUnIHN5bnRheCBvbiB1cGdyYWRlZCBkaXJlY3RpdmUgJyR7dGhpcy5uYW1lfSc6ICR7cmVxdWlyZX1gKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0T3JDYWxsPFQ+KHByb3BlcnR5OiBUIHwgRnVuY3Rpb24pOiBUIHtcbiAgcmV0dXJuIGlzRnVuY3Rpb24ocHJvcGVydHkpID8gcHJvcGVydHkoKSA6IHByb3BlcnR5O1xufVxuXG4vLyBOT1RFOiBPbmx5IHdvcmtzIGZvciBgdHlwZW9mIFQgIT09ICdvYmplY3QnYC5cbmZ1bmN0aW9uIGlzTWFwPFQ+KHZhbHVlOiBhbmd1bGFyLlNpbmdsZU9yTGlzdE9yTWFwPFQ+KTogdmFsdWUgaXMge1trZXk6IHN0cmluZ106IFR9IHtcbiAgcmV0dXJuIHZhbHVlICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG5mdW5jdGlvbiBub3RTdXBwb3J0ZWQobmFtZTogc3RyaW5nLCBmZWF0dXJlOiBzdHJpbmcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBVcGdyYWRlZCBkaXJlY3RpdmUgJyR7bmFtZX0nIGNvbnRhaW5zIHVuc3VwcG9ydGVkIGZlYXR1cmU6ICcke2ZlYXR1cmV9Jy5gKTtcbn1cbiJdfQ==