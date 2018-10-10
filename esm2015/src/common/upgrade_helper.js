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
const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
// Classes
export class UpgradeHelper {
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
    static getDirective($injector, name) {
        const directives = $injector.get(name + 'Directive');
        if (directives.length > 1) {
            throw new Error(`Only support single directive definition for: ${name}`);
        }
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
    static getTemplate($injector, directive, fetchRemoteTemplate = false) {
        if (directive.template !== undefined) {
            return getOrCall(directive.template);
        }
        else if (directive.templateUrl) {
            const $templateCache = $injector.get($TEMPLATE_CACHE);
            const url = getOrCall(directive.templateUrl);
            const template = $templateCache.get(url);
            if (template !== undefined) {
                return template;
            }
            else if (!fetchRemoteTemplate) {
                throw new Error('loading directive templates asynchronously is not supported');
            }
            return new Promise((resolve, reject) => {
                const $httpBackend = $injector.get($HTTP_BACKEND);
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
    buildController(controllerType, $scope) {
        // TODO: Document that we do not pre-assign bindings on the controller instance.
        // Quoted properties below so that this code can be optimized with Closure Compiler.
        const locals = { '$scope': $scope, '$element': this.$element };
        const controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);
        this.$element.data(controllerKey(this.directive.name), controller);
        return controller;
    }
    compileTemplate(template) {
        if (template === undefined) {
            template = UpgradeHelper.getTemplate(this.$injector, this.directive);
        }
        return this.compileHtml(template);
    }
    onDestroy($scope, controllerInstance) {
        if (controllerInstance && isFunction(controllerInstance.$onDestroy)) {
            controllerInstance.$onDestroy();
        }
        $scope.$destroy();
        this.$element.triggerHandler('$destroy');
    }
    prepareTransclusion() {
        const transclude = this.directive.transclude;
        const contentChildNodes = this.extractChildNodes();
        const attachChildrenFn = (scope, cloneAttachFn) => {
            // Since AngularJS v1.5.8, `cloneAttachFn` will try to destroy the transclusion scope if
            // `$template` is empty. Since the transcluded content comes from Angular, not AngularJS,
            // there will be no transclusion scope here.
            // Provide a dummy `scope.$destroy()` method to prevent `cloneAttachFn` from throwing.
            scope = scope || { $destroy: () => undefined };
            return cloneAttachFn($template, scope);
        };
        let $template = contentChildNodes;
        if (transclude) {
            const slots = Object.create(null);
            if (typeof transclude === 'object') {
                $template = [];
                const slotMap = Object.create(null);
                const filledSlots = Object.create(null);
                // Parse the element selectors.
                Object.keys(transclude).forEach(slotName => {
                    let selector = transclude[slotName];
                    const optional = selector.charAt(0) === '?';
                    selector = optional ? selector.substring(1) : selector;
                    slotMap[selector] = slotName;
                    slots[slotName] = null; // `null`: Defined but not yet filled.
                    filledSlots[slotName] = optional; // Consider optional slots as filled.
                });
                // Add the matching elements into their slot.
                contentChildNodes.forEach(node => {
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
                    const nodes = slots[slotName];
                    slots[slotName] = (scope, cloneAttach) => cloneAttach(nodes, scope);
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
    resolveAndBindRequiredControllers(controllerInstance) {
        const directiveRequire = this.getDirectiveRequire();
        const requiredControllers = this.resolveRequire(directiveRequire);
        if (controllerInstance && this.directive.bindToController && isMap(directiveRequire)) {
            const requiredControllersMap = requiredControllers;
            Object.keys(requiredControllersMap).forEach(key => {
                controllerInstance[key] = requiredControllersMap[key];
            });
        }
        return requiredControllers;
    }
    compileHtml(html) {
        this.element.innerHTML = html;
        return this.$compile(this.element.childNodes);
    }
    extractChildNodes() {
        const childNodes = [];
        let childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        return childNodes;
    }
    getDirectiveRequire() {
        const require = this.directive.require || (this.directive.controller && this.directive.name);
        if (isMap(require)) {
            Object.keys(require).forEach(key => {
                const value = require[key];
                const match = value.match(REQUIRE_PREFIX_RE);
                const name = value.substring(match[0].length);
                if (!name) {
                    require[key] = match[0] + key;
                }
            });
        }
        return require;
    }
    resolveRequire(require, controllerInstance) {
        if (!require) {
            return null;
        }
        else if (Array.isArray(require)) {
            return require.map(req => this.resolveRequire(req));
        }
        else if (typeof require === 'object') {
            const value = {};
            Object.keys(require).forEach(key => value[key] = this.resolveRequire(require[key]));
            return value;
        }
        else if (typeof require === 'string') {
            const match = require.match(REQUIRE_PREFIX_RE);
            const inheritType = match[1] || match[3];
            const name = require.substring(match[0].length);
            const isOptional = !!match[2];
            const searchParents = !!inheritType;
            const startOnParent = inheritType === '^^';
            const ctrlKey = controllerKey(name);
            const elem = startOnParent ? this.$element.parent() : this.$element;
            const value = searchParents ? elem.inheritedData(ctrlKey) : elem.data(ctrlKey);
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
function getOrCall(property) {
    return isFunction(property) ? property() : property;
}
// NOTE: Only works for `typeof T !== 'object'`.
function isMap(value) {
    return value && !Array.isArray(value) && typeof value === 'object';
}
function notSupported(name, feature) {
    throw new Error(`Upgraded directive '${name}' contains unsupported feature: '${feature}'.`);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vdXBncmFkZV9oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxLQUFLLE9BQU8sTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0YsT0FBTyxFQUFDLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFHckUsWUFBWTtBQUNaLE1BQU0saUJBQWlCLEdBQUcsd0JBQXdCLENBQUM7QUFlbkQsVUFBVTtBQUNWLE1BQU0sT0FBTyxhQUFhO0lBU3hCLFlBQ1ksUUFBa0IsRUFBVSxJQUFZLEVBQUUsVUFBc0IsRUFDeEUsU0FBOEI7UUFEdEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLFNBQUksR0FBSixJQUFJLENBQVE7UUFFbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsSUFBSSxhQUFhLENBQUMsWUFB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QUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ3RFLE1BQU0sS0FBSyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVuRixJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUN6QixNQUFNLElBQUksS0FBSyxDQUNYLDRCQUE0QixPQUFPLDRCQUE0QixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQzthQUNuRjtZQUVELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7YUFBTTtZQUNMLE1BQU0sSUFBSSxLQUFLLENBQ1gsd0RBQXdELElBQUksQ0FBQyxJQUFJLE1BQU0sT0FBTyxFQUFFLENBQUMsQ0FBQztTQUN2RjtJQUNILENBQUM7Q0FDRjtBQUVELFNBQVMsU0FBUyxDQUFJLFFBQXNCO0lBQzFDLE9BQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ3RELENBQUM7QUFFRCxnREFBZ0Q7QUFDaEQsU0FBUyxLQUFLLENBQUksS0FBbUM7SUFDbkQsT0FBTyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUNyRSxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsSUFBWSxFQUFFLE9BQWU7SUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxvQ0FBb0MsT0FBTyxJQUFJLENBQUMsQ0FBQztBQUM5RixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0VsZW1lbnRSZWYsIEluamVjdG9yLCBTaW1wbGVDaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7JENPTVBJTEUsICRDT05UUk9MTEVSLCAkSFRUUF9CQUNLRU5ELCAkSU5KRUNUT1IsICRURU1QTEFURV9DQUNIRX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtjb250cm9sbGVyS2V5LCBkaXJlY3RpdmVOb3JtYWxpemUsIGlzRnVuY3Rpb259IGZyb20gJy4vdXRpbCc7XG5cblxuLy8gQ29uc3RhbnRzXG5jb25zdCBSRVFVSVJFX1BSRUZJWF9SRSA9IC9eKFxcXlxcXj8pPyhcXD8pPyhcXF5cXF4/KT8vO1xuXG4vLyBJbnRlcmZhY2VzXG5leHBvcnQgaW50ZXJmYWNlIElCaW5kaW5nRGVzdGluYXRpb24ge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG4gICRvbkNoYW5nZXM/OiAoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykgPT4gdm9pZDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJQ29udHJvbGxlckluc3RhbmNlIGV4dGVuZHMgSUJpbmRpbmdEZXN0aW5hdGlvbiB7XG4gICRkb0NoZWNrPzogKCkgPT4gdm9pZDtcbiAgJG9uRGVzdHJveT86ICgpID0+IHZvaWQ7XG4gICRvbkluaXQ/OiAoKSA9PiB2b2lkO1xuICAkcG9zdExpbms/OiAoKSA9PiB2b2lkO1xufVxuXG4vLyBDbGFzc2VzXG5leHBvcnQgY2xhc3MgVXBncmFkZUhlbHBlciB7XG4gIHB1YmxpYyByZWFkb25seSAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZTtcbiAgcHVibGljIHJlYWRvbmx5IGVsZW1lbnQ6IEVsZW1lbnQ7XG4gIHB1YmxpYyByZWFkb25seSAkZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5O1xuICBwdWJsaWMgcmVhZG9ubHkgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmU7XG5cbiAgcHJpdmF0ZSByZWFkb25seSAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2U7XG4gIHByaXZhdGUgcmVhZG9ubHkgJGNvbnRyb2xsZXI6IGFuZ3VsYXIuSUNvbnRyb2xsZXJTZXJ2aWNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgbmFtZTogc3RyaW5nLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgICAgZGlyZWN0aXZlPzogYW5ndWxhci5JRGlyZWN0aXZlKSB7XG4gICAgdGhpcy4kaW5qZWN0b3IgPSBpbmplY3Rvci5nZXQoJElOSkVDVE9SKTtcbiAgICB0aGlzLiRjb21waWxlID0gdGhpcy4kaW5qZWN0b3IuZ2V0KCRDT01QSUxFKTtcbiAgICB0aGlzLiRjb250cm9sbGVyID0gdGhpcy4kaW5qZWN0b3IuZ2V0KCRDT05UUk9MTEVSKTtcblxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gYW5ndWxhci5lbGVtZW50KHRoaXMuZWxlbWVudCk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZSA9IGRpcmVjdGl2ZSB8fCBVcGdyYWRlSGVscGVyLmdldERpcmVjdGl2ZSh0aGlzLiRpbmplY3RvciwgbmFtZSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0RGlyZWN0aXZlKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCBuYW1lOiBzdHJpbmcpOiBhbmd1bGFyLklEaXJlY3RpdmUge1xuICAgIGNvbnN0IGRpcmVjdGl2ZXM6IGFuZ3VsYXIuSURpcmVjdGl2ZVtdID0gJGluamVjdG9yLmdldChuYW1lICsgJ0RpcmVjdGl2ZScpO1xuICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgT25seSBzdXBwb3J0IHNpbmdsZSBkaXJlY3RpdmUgZGVmaW5pdGlvbiBmb3I6ICR7bmFtZX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RpdmUgPSBkaXJlY3RpdmVzWzBdO1xuXG4gICAgLy8gQW5ndWxhckpTIHdpbGwgdHJhbnNmb3JtIGBsaW5rOiB4eXpgIHRvIGBjb21waWxlOiAoKSA9PiB4eXpgLiBTbyB3ZSBjYW4gb25seSB0ZWxsIHRoZXJlIHdhcyBhXG4gICAgLy8gdXNlci1kZWZpbmVkIGBjb21waWxlYCBpZiB0aGVyZSBpcyBubyBgbGlua2AuIEluIG90aGVyIGNhc2VzLCB3ZSB3aWxsIGp1c3QgaWdub3JlIGBjb21waWxlYC5cbiAgICBpZiAoZGlyZWN0aXZlLmNvbXBpbGUgJiYgIWRpcmVjdGl2ZS5saW5rKSBub3RTdXBwb3J0ZWQobmFtZSwgJ2NvbXBpbGUnKTtcbiAgICBpZiAoZGlyZWN0aXZlLnJlcGxhY2UpIG5vdFN1cHBvcnRlZChuYW1lLCAncmVwbGFjZScpO1xuICAgIGlmIChkaXJlY3RpdmUudGVybWluYWwpIG5vdFN1cHBvcnRlZChuYW1lLCAndGVybWluYWwnKTtcblxuICAgIHJldHVybiBkaXJlY3RpdmU7XG4gIH1cblxuICBzdGF0aWMgZ2V0VGVtcGxhdGUoXG4gICAgICAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSwgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmUsXG4gICAgICBmZXRjaFJlbW90ZVRlbXBsYXRlID0gZmFsc2UpOiBzdHJpbmd8UHJvbWlzZTxzdHJpbmc+IHtcbiAgICBpZiAoZGlyZWN0aXZlLnRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBnZXRPckNhbGw8c3RyaW5nPihkaXJlY3RpdmUudGVtcGxhdGUpO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aXZlLnRlbXBsYXRlVXJsKSB7XG4gICAgICBjb25zdCAkdGVtcGxhdGVDYWNoZSA9ICRpbmplY3Rvci5nZXQoJFRFTVBMQVRFX0NBQ0hFKSBhcyBhbmd1bGFyLklUZW1wbGF0ZUNhY2hlU2VydmljZTtcbiAgICAgIGNvbnN0IHVybCA9IGdldE9yQ2FsbDxzdHJpbmc+KGRpcmVjdGl2ZS50ZW1wbGF0ZVVybCk7XG4gICAgICBjb25zdCB0ZW1wbGF0ZSA9ICR0ZW1wbGF0ZUNhY2hlLmdldCh1cmwpO1xuXG4gICAgICBpZiAodGVtcGxhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9IGVsc2UgaWYgKCFmZXRjaFJlbW90ZVRlbXBsYXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9hZGluZyBkaXJlY3RpdmUgdGVtcGxhdGVzIGFzeW5jaHJvbm91c2x5IGlzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgJGh0dHBCYWNrZW5kID0gJGluamVjdG9yLmdldCgkSFRUUF9CQUNLRU5EKSBhcyBhbmd1bGFyLklIdHRwQmFja2VuZFNlcnZpY2U7XG4gICAgICAgICRodHRwQmFja2VuZCgnR0VUJywgdXJsLCBudWxsLCAoc3RhdHVzOiBudW1iZXIsIHJlc3BvbnNlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBpZiAoc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHJlc29sdmUoJHRlbXBsYXRlQ2FjaGUucHV0KHVybCwgcmVzcG9uc2UpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KGBHRVQgY29tcG9uZW50IHRlbXBsYXRlIGZyb20gJyR7dXJsfScgcmV0dXJuZWQgJyR7c3RhdHVzfTogJHtyZXNwb25zZX0nYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYERpcmVjdGl2ZSAnJHtkaXJlY3RpdmUubmFtZX0nIGlzIG5vdCBhIGNvbXBvbmVudCwgaXQgaXMgbWlzc2luZyB0ZW1wbGF0ZS5gKTtcbiAgICB9XG4gIH1cblxuICBidWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGU6IGFuZ3VsYXIuSUNvbnRyb2xsZXIsICRzY29wZTogYW5ndWxhci5JU2NvcGUpIHtcbiAgICAvLyBUT0RPOiBEb2N1bWVudCB0aGF0IHdlIGRvIG5vdCBwcmUtYXNzaWduIGJpbmRpbmdzIG9uIHRoZSBjb250cm9sbGVyIGluc3RhbmNlLlxuICAgIC8vIFF1b3RlZCBwcm9wZXJ0aWVzIGJlbG93IHNvIHRoYXQgdGhpcyBjb2RlIGNhbiBiZSBvcHRpbWl6ZWQgd2l0aCBDbG9zdXJlIENvbXBpbGVyLlxuICAgIGNvbnN0IGxvY2FscyA9IHsnJHNjb3BlJzogJHNjb3BlLCAnJGVsZW1lbnQnOiB0aGlzLiRlbGVtZW50fTtcbiAgICBjb25zdCBjb250cm9sbGVyID0gdGhpcy4kY29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgbG9jYWxzLCBudWxsLCB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyQXMpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5kYXRhICEoY29udHJvbGxlcktleSh0aGlzLmRpcmVjdGl2ZS5uYW1lICEpLCBjb250cm9sbGVyKTtcblxuICAgIHJldHVybiBjb250cm9sbGVyO1xuICB9XG5cbiAgY29tcGlsZVRlbXBsYXRlKHRlbXBsYXRlPzogc3RyaW5nKTogYW5ndWxhci5JTGlua0ZuIHtcbiAgICBpZiAodGVtcGxhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGVtcGxhdGUgPSBVcGdyYWRlSGVscGVyLmdldFRlbXBsYXRlKHRoaXMuJGluamVjdG9yLCB0aGlzLmRpcmVjdGl2ZSkgYXMgc3RyaW5nO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNvbXBpbGVIdG1sKHRlbXBsYXRlKTtcbiAgfVxuXG4gIG9uRGVzdHJveSgkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBjb250cm9sbGVySW5zdGFuY2U/OiBhbnkpIHtcbiAgICBpZiAoY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24oY29udHJvbGxlckluc3RhbmNlLiRvbkRlc3Ryb3kpKSB7XG4gICAgICBjb250cm9sbGVySW5zdGFuY2UuJG9uRGVzdHJveSgpO1xuICAgIH1cbiAgICAkc2NvcGUuJGRlc3Ryb3koKTtcbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXJIYW5kbGVyICEoJyRkZXN0cm95Jyk7XG4gIH1cblxuICBwcmVwYXJlVHJhbnNjbHVzaW9uKCk6IGFuZ3VsYXIuSUxpbmtGbnx1bmRlZmluZWQge1xuICAgIGNvbnN0IHRyYW5zY2x1ZGUgPSB0aGlzLmRpcmVjdGl2ZS50cmFuc2NsdWRlO1xuICAgIGNvbnN0IGNvbnRlbnRDaGlsZE5vZGVzID0gdGhpcy5leHRyYWN0Q2hpbGROb2RlcygpO1xuICAgIGNvbnN0IGF0dGFjaENoaWxkcmVuRm46IGFuZ3VsYXIuSUxpbmtGbiA9IChzY29wZSwgY2xvbmVBdHRhY2hGbikgPT4ge1xuICAgICAgLy8gU2luY2UgQW5ndWxhckpTIHYxLjUuOCwgYGNsb25lQXR0YWNoRm5gIHdpbGwgdHJ5IHRvIGRlc3Ryb3kgdGhlIHRyYW5zY2x1c2lvbiBzY29wZSBpZlxuICAgICAgLy8gYCR0ZW1wbGF0ZWAgaXMgZW1wdHkuIFNpbmNlIHRoZSB0cmFuc2NsdWRlZCBjb250ZW50IGNvbWVzIGZyb20gQW5ndWxhciwgbm90IEFuZ3VsYXJKUyxcbiAgICAgIC8vIHRoZXJlIHdpbGwgYmUgbm8gdHJhbnNjbHVzaW9uIHNjb3BlIGhlcmUuXG4gICAgICAvLyBQcm92aWRlIGEgZHVtbXkgYHNjb3BlLiRkZXN0cm95KClgIG1ldGhvZCB0byBwcmV2ZW50IGBjbG9uZUF0dGFjaEZuYCBmcm9tIHRocm93aW5nLlxuICAgICAgc2NvcGUgPSBzY29wZSB8fCB7JGRlc3Ryb3k6ICgpID0+IHVuZGVmaW5lZH07XG4gICAgICByZXR1cm4gY2xvbmVBdHRhY2hGbiAhKCR0ZW1wbGF0ZSwgc2NvcGUpO1xuICAgIH07XG4gICAgbGV0ICR0ZW1wbGF0ZSA9IGNvbnRlbnRDaGlsZE5vZGVzO1xuXG4gICAgaWYgKHRyYW5zY2x1ZGUpIHtcbiAgICAgIGNvbnN0IHNsb3RzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgaWYgKHR5cGVvZiB0cmFuc2NsdWRlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAkdGVtcGxhdGUgPSBbXTtcblxuICAgICAgICBjb25zdCBzbG90TWFwID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgY29uc3QgZmlsbGVkU2xvdHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICAgIC8vIFBhcnNlIHRoZSBlbGVtZW50IHNlbGVjdG9ycy5cbiAgICAgICAgT2JqZWN0LmtleXModHJhbnNjbHVkZSkuZm9yRWFjaChzbG90TmFtZSA9PiB7XG4gICAgICAgICAgbGV0IHNlbGVjdG9yID0gdHJhbnNjbHVkZVtzbG90TmFtZV07XG4gICAgICAgICAgY29uc3Qgb3B0aW9uYWwgPSBzZWxlY3Rvci5jaGFyQXQoMCkgPT09ICc/JztcbiAgICAgICAgICBzZWxlY3RvciA9IG9wdGlvbmFsID8gc2VsZWN0b3Iuc3Vic3RyaW5nKDEpIDogc2VsZWN0b3I7XG5cbiAgICAgICAgICBzbG90TWFwW3NlbGVjdG9yXSA9IHNsb3ROYW1lO1xuICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IG51bGw7ICAgICAgICAgICAgLy8gYG51bGxgOiBEZWZpbmVkIGJ1dCBub3QgeWV0IGZpbGxlZC5cbiAgICAgICAgICBmaWxsZWRTbG90c1tzbG90TmFtZV0gPSBvcHRpb25hbDsgIC8vIENvbnNpZGVyIG9wdGlvbmFsIHNsb3RzIGFzIGZpbGxlZC5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIHRoZSBtYXRjaGluZyBlbGVtZW50cyBpbnRvIHRoZWlyIHNsb3QuXG4gICAgICAgIGNvbnRlbnRDaGlsZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgICAgY29uc3Qgc2xvdE5hbWUgPSBzbG90TWFwW2RpcmVjdGl2ZU5vcm1hbGl6ZShub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpXTtcbiAgICAgICAgICBpZiAoc2xvdE5hbWUpIHtcbiAgICAgICAgICAgIGZpbGxlZFNsb3RzW3Nsb3ROYW1lXSA9IHRydWU7XG4gICAgICAgICAgICBzbG90c1tzbG90TmFtZV0gPSBzbG90c1tzbG90TmFtZV0gfHwgW107XG4gICAgICAgICAgICBzbG90c1tzbG90TmFtZV0ucHVzaChub2RlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHRlbXBsYXRlLnB1c2gobm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDaGVjayBmb3IgcmVxdWlyZWQgc2xvdHMgdGhhdCB3ZXJlIG5vdCBmaWxsZWQuXG4gICAgICAgIE9iamVjdC5rZXlzKGZpbGxlZFNsb3RzKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBpZiAoIWZpbGxlZFNsb3RzW3Nsb3ROYW1lXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBSZXF1aXJlZCB0cmFuc2NsdXNpb24gc2xvdCAnJHtzbG90TmFtZX0nIG9uIGRpcmVjdGl2ZTogJHt0aGlzLm5hbWV9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBPYmplY3Qua2V5cyhzbG90cykuZmlsdGVyKHNsb3ROYW1lID0+IHNsb3RzW3Nsb3ROYW1lXSkuZm9yRWFjaChzbG90TmFtZSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZXMgPSBzbG90c1tzbG90TmFtZV07XG4gICAgICAgICAgc2xvdHNbc2xvdE5hbWVdID0gKHNjb3BlOiBhbmd1bGFyLklTY29wZSwgY2xvbmVBdHRhY2g6IGFuZ3VsYXIuSUNsb25lQXR0YWNoRnVuY3Rpb24pID0+XG4gICAgICAgICAgICAgIGNsb25lQXR0YWNoICEobm9kZXMsIHNjb3BlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEF0dGFjaCBgJCRzbG90c2AgdG8gZGVmYXVsdCBzbG90IHRyYW5zY2x1ZGUgZm4uXG4gICAgICBhdHRhY2hDaGlsZHJlbkZuLiQkc2xvdHMgPSBzbG90cztcblxuICAgICAgLy8gQW5ndWxhckpTIHYxLjYrIGlnbm9yZXMgZW1wdHkgb3Igd2hpdGVzcGFjZS1vbmx5IHRyYW5zY2x1ZGVkIHRleHQgbm9kZXMuIEJ1dCBBbmd1bGFyXG4gICAgICAvLyByZW1vdmVzIGFsbCB0ZXh0IGNvbnRlbnQgYWZ0ZXIgdGhlIGZpcnN0IGludGVycG9sYXRpb24gYW5kIHVwZGF0ZXMgaXQgbGF0ZXIsIGFmdGVyXG4gICAgICAvLyBldmFsdWF0aW5nIHRoZSBleHByZXNzaW9ucy4gVGhpcyB3b3VsZCByZXN1bHQgaW4gQW5ndWxhckpTIGZhaWxpbmcgdG8gcmVjb2duaXplIHRleHRcbiAgICAgIC8vIG5vZGVzIHRoYXQgc3RhcnQgd2l0aCBhbiBpbnRlcnBvbGF0aW9uIGFzIHRyYW5zY2x1ZGVkIGNvbnRlbnQgYW5kIHVzZSB0aGUgZmFsbGJhY2tcbiAgICAgIC8vIGNvbnRlbnQgaW5zdGVhZC5cbiAgICAgIC8vIFRvIGF2b2lkIHRoaXMgaXNzdWUsIHdlIGFkZCBhXG4gICAgICAvLyBbemVyby13aWR0aCBub24tam9pbmVyIGNoYXJhY3Rlcl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvWmVyby13aWR0aF9ub24tam9pbmVyKVxuICAgICAgLy8gdG8gZW1wdHkgdGV4dCBub2RlcyAod2hpY2ggY2FuIG9ubHkgYmUgYSByZXN1bHQgb2YgQW5ndWxhciByZW1vdmluZyB0aGVpciBpbml0aWFsIGNvbnRlbnQpLlxuICAgICAgLy8gTk9URTogVHJhbnNjbHVkZWQgdGV4dCBjb250ZW50IHRoYXQgc3RhcnRzIHdpdGggd2hpdGVzcGFjZSBmb2xsb3dlZCBieSBhbiBpbnRlcnBvbGF0aW9uXG4gICAgICAvLyAgICAgICB3aWxsIHN0aWxsIGZhaWwgdG8gYmUgZGV0ZWN0ZWQgYnkgQW5ndWxhckpTIHYxLjYrXG4gICAgICAkdGVtcGxhdGUuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFICYmICFub2RlLm5vZGVWYWx1ZSkge1xuICAgICAgICAgIG5vZGUubm9kZVZhbHVlID0gJ1xcdTIwMEMnO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0YWNoQ2hpbGRyZW5GbjtcbiAgfVxuXG4gIHJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyhjb250cm9sbGVySW5zdGFuY2U6IElDb250cm9sbGVySW5zdGFuY2V8bnVsbCkge1xuICAgIGNvbnN0IGRpcmVjdGl2ZVJlcXVpcmUgPSB0aGlzLmdldERpcmVjdGl2ZVJlcXVpcmUoKTtcbiAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzID0gdGhpcy5yZXNvbHZlUmVxdWlyZShkaXJlY3RpdmVSZXF1aXJlKTtcblxuICAgIGlmIChjb250cm9sbGVySW5zdGFuY2UgJiYgdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciAmJiBpc01hcChkaXJlY3RpdmVSZXF1aXJlKSkge1xuICAgICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVyc01hcCA9IHJlcXVpcmVkQ29udHJvbGxlcnMgYXN7W2tleTogc3RyaW5nXTogSUNvbnRyb2xsZXJJbnN0YW5jZX07XG4gICAgICBPYmplY3Qua2V5cyhyZXF1aXJlZENvbnRyb2xsZXJzTWFwKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnRyb2xsZXJJbnN0YW5jZVtrZXldID0gcmVxdWlyZWRDb250cm9sbGVyc01hcFtrZXldO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVpcmVkQ29udHJvbGxlcnM7XG4gIH1cblxuICBwcml2YXRlIGNvbXBpbGVIdG1sKGh0bWw6IHN0cmluZyk6IGFuZ3VsYXIuSUxpbmtGbiB7XG4gICAgdGhpcy5lbGVtZW50LmlubmVySFRNTCA9IGh0bWw7XG4gICAgcmV0dXJuIHRoaXMuJGNvbXBpbGUodGhpcy5lbGVtZW50LmNoaWxkTm9kZXMpO1xuICB9XG5cbiAgcHJpdmF0ZSBleHRyYWN0Q2hpbGROb2RlcygpOiBOb2RlW10ge1xuICAgIGNvbnN0IGNoaWxkTm9kZXM6IE5vZGVbXSA9IFtdO1xuICAgIGxldCBjaGlsZE5vZGU6IE5vZGV8bnVsbDtcblxuICAgIHdoaWxlIChjaGlsZE5vZGUgPSB0aGlzLmVsZW1lbnQuZmlyc3RDaGlsZCkge1xuICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKGNoaWxkTm9kZSk7XG4gICAgICBjaGlsZE5vZGVzLnB1c2goY2hpbGROb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGROb2RlcztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RGlyZWN0aXZlUmVxdWlyZSgpOiBhbmd1bGFyLkRpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eSB7XG4gICAgY29uc3QgcmVxdWlyZSA9IHRoaXMuZGlyZWN0aXZlLnJlcXVpcmUgfHwgKHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXIgJiYgdGhpcy5kaXJlY3RpdmUubmFtZSkgITtcblxuICAgIGlmIChpc01hcChyZXF1aXJlKSkge1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHJlcXVpcmVba2V5XTtcbiAgICAgICAgY29uc3QgbWF0Y2ggPSB2YWx1ZS5tYXRjaChSRVFVSVJFX1BSRUZJWF9SRSkgITtcbiAgICAgICAgY29uc3QgbmFtZSA9IHZhbHVlLnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpO1xuXG4gICAgICAgIGlmICghbmFtZSkge1xuICAgICAgICAgIHJlcXVpcmVba2V5XSA9IG1hdGNoWzBdICsga2V5O1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVxdWlyZTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzb2x2ZVJlcXVpcmUocmVxdWlyZTogYW5ndWxhci5EaXJlY3RpdmVSZXF1aXJlUHJvcGVydHksIGNvbnRyb2xsZXJJbnN0YW5jZT86IGFueSk6XG4gICAgICBhbmd1bGFyLlNpbmdsZU9yTGlzdE9yTWFwPElDb250cm9sbGVySW5zdGFuY2U+fG51bGwge1xuICAgIGlmICghcmVxdWlyZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcXVpcmUpKSB7XG4gICAgICByZXR1cm4gcmVxdWlyZS5tYXAocmVxID0+IHRoaXMucmVzb2x2ZVJlcXVpcmUocmVxKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IHZhbHVlOiB7W2tleTogc3RyaW5nXTogSUNvbnRyb2xsZXJJbnN0YW5jZX0gPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmUpLmZvckVhY2goa2V5ID0+IHZhbHVlW2tleV0gPSB0aGlzLnJlc29sdmVSZXF1aXJlKHJlcXVpcmVba2V5XSkgISk7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IG1hdGNoID0gcmVxdWlyZS5tYXRjaChSRVFVSVJFX1BSRUZJWF9SRSkgITtcbiAgICAgIGNvbnN0IGluaGVyaXRUeXBlID0gbWF0Y2hbMV0gfHwgbWF0Y2hbM107XG5cbiAgICAgIGNvbnN0IG5hbWUgPSByZXF1aXJlLnN1YnN0cmluZyhtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgY29uc3QgaXNPcHRpb25hbCA9ICEhbWF0Y2hbMl07XG4gICAgICBjb25zdCBzZWFyY2hQYXJlbnRzID0gISFpbmhlcml0VHlwZTtcbiAgICAgIGNvbnN0IHN0YXJ0T25QYXJlbnQgPSBpbmhlcml0VHlwZSA9PT0gJ15eJztcblxuICAgICAgY29uc3QgY3RybEtleSA9IGNvbnRyb2xsZXJLZXkobmFtZSk7XG4gICAgICBjb25zdCBlbGVtID0gc3RhcnRPblBhcmVudCA/IHRoaXMuJGVsZW1lbnQucGFyZW50ICEoKSA6IHRoaXMuJGVsZW1lbnQ7XG4gICAgICBjb25zdCB2YWx1ZSA9IHNlYXJjaFBhcmVudHMgPyBlbGVtLmluaGVyaXRlZERhdGEgIShjdHJsS2V5KSA6IGVsZW0uZGF0YSAhKGN0cmxLZXkpO1xuXG4gICAgICBpZiAoIXZhbHVlICYmICFpc09wdGlvbmFsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBVbmFibGUgdG8gZmluZCByZXF1aXJlZCAnJHtyZXF1aXJlfScgaW4gdXBncmFkZWQgZGlyZWN0aXZlICcke3RoaXMubmFtZX0nLmApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5yZWNvZ25pemVkICdyZXF1aXJlJyBzeW50YXggb24gdXBncmFkZWQgZGlyZWN0aXZlICcke3RoaXMubmFtZX0nOiAke3JlcXVpcmV9YCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldE9yQ2FsbDxUPihwcm9wZXJ0eTogVCB8IEZ1bmN0aW9uKTogVCB7XG4gIHJldHVybiBpc0Z1bmN0aW9uKHByb3BlcnR5KSA/IHByb3BlcnR5KCkgOiBwcm9wZXJ0eTtcbn1cblxuLy8gTk9URTogT25seSB3b3JrcyBmb3IgYHR5cGVvZiBUICE9PSAnb2JqZWN0J2AuXG5mdW5jdGlvbiBpc01hcDxUPih2YWx1ZTogYW5ndWxhci5TaW5nbGVPckxpc3RPck1hcDxUPik6IHZhbHVlIGlzIHtba2V5OiBzdHJpbmddOiBUfSB7XG4gIHJldHVybiB2YWx1ZSAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbn1cblxuZnVuY3Rpb24gbm90U3VwcG9ydGVkKG5hbWU6IHN0cmluZywgZmVhdHVyZTogc3RyaW5nKSB7XG4gIHRocm93IG5ldyBFcnJvcihgVXBncmFkZWQgZGlyZWN0aXZlICcke25hbWV9JyBjb250YWlucyB1bnN1cHBvcnRlZCBmZWF0dXJlOiAnJHtmZWF0dXJlfScuYCk7XG59XG4iXX0=