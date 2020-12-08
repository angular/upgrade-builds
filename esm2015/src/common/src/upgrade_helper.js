/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { element as angularElement } from './angular1';
import { $COMPILE, $CONTROLLER, $HTTP_BACKEND, $INJECTOR, $TEMPLATE_CACHE } from './constants';
import { controllerKey, directiveNormalize, isFunction } from './util';
// Constants
const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
// Classes
export class UpgradeHelper {
    constructor(injector, name, elementRef, directive) {
        this.name = name;
        this.$injector = injector.get($INJECTOR);
        this.$compile = this.$injector.get($COMPILE);
        this.$controller = this.$injector.get($CONTROLLER);
        this.element = elementRef.nativeElement;
        this.$element = angularElement(this.element);
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
    static getTemplate($injector, directive, fetchRemoteTemplate = false, $element) {
        if (directive.template !== undefined) {
            return getOrCall(directive.template, $element);
        }
        else if (directive.templateUrl) {
            const $templateCache = $injector.get($TEMPLATE_CACHE);
            const url = getOrCall(directive.templateUrl, $element);
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
            template =
                UpgradeHelper.getTemplate(this.$injector, this.directive, false, this.$element);
        }
        return this.compileHtml(template);
    }
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
        angularElement.cleanData([this.element]);
        angularElement.cleanData(this.element.querySelectorAll('*'));
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
                    slots[slotName] = (scope, cloneAttach) => {
                        return cloneAttach(nodes, scope);
                    };
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
function getOrCall(property, ...args) {
    return isFunction(property) ? property(...args) : property;
}
// NOTE: Only works for `typeof T !== 'object'`.
function isMap(value) {
    return value && !Array.isArray(value) && typeof value === 'object';
}
function notSupported(name, feature) {
    throw new Error(`Upgraded directive '${name}' contains unsupported feature: '${feature}'.`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vc3JjL3VwZ3JhZGVfaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sRUFBMkIsT0FBTyxJQUFJLGNBQWMsRUFBeU0sTUFBTSxZQUFZLENBQUM7QUFDdlIsT0FBTyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0YsT0FBTyxFQUFDLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFJckUsWUFBWTtBQUNaLE1BQU0saUJBQWlCLEdBQUcsd0JBQXdCLENBQUM7QUFlbkQsVUFBVTtBQUNWLE1BQU0sT0FBTyxhQUFhO0lBU3hCLFlBQ0ksUUFBa0IsRUFBVSxJQUFZLEVBQUUsVUFBc0IsRUFBRSxTQUFzQjtRQUE1RCxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFbkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsSUFBSSxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUks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O0FBQ3JFLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFZLEVBQUUsT0FBZTtJQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixJQUFJLG9DQUFvQyxPQUFPLElBQUksQ0FBQyxDQUFDO0FBQzlGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFbGVtZW50UmVmLCBJbmplY3RvciwgU2ltcGxlQ2hhbmdlc30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5LCBlbGVtZW50IGFzIGFuZ3VsYXJFbGVtZW50LCBJQXVnbWVudGVkSlF1ZXJ5LCBJQ2xvbmVBdHRhY2hGdW5jdGlvbiwgSUNvbXBpbGVTZXJ2aWNlLCBJQ29udHJvbGxlciwgSUNvbnRyb2xsZXJTZXJ2aWNlLCBJRGlyZWN0aXZlLCBJSHR0cEJhY2tlbmRTZXJ2aWNlLCBJSW5qZWN0b3JTZXJ2aWNlLCBJTGlua0ZuLCBJU2NvcGUsIElUZW1wbGF0ZUNhY2hlU2VydmljZSwgU2luZ2xlT3JMaXN0T3JNYXB9IGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHskQ09NUElMRSwgJENPTlRST0xMRVIsICRIVFRQX0JBQ0tFTkQsICRJTkpFQ1RPUiwgJFRFTVBMQVRFX0NBQ0hFfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2NvbnRyb2xsZXJLZXksIGRpcmVjdGl2ZU5vcm1hbGl6ZSwgaXNGdW5jdGlvbn0gZnJvbSAnLi91dGlsJztcblxuXG5cbi8vIENvbnN0YW50c1xuY29uc3QgUkVRVUlSRV9QUkVGSVhfUkUgPSAvXihcXF5cXF4/KT8oXFw/KT8oXFxeXFxePyk/LztcblxuLy8gSW50ZXJmYWNlc1xuZXhwb3J0IGludGVyZmFjZSBJQmluZGluZ0Rlc3RpbmF0aW9uIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xuICAkb25DaGFuZ2VzPzogKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbnRyb2xsZXJJbnN0YW5jZSBleHRlbmRzIElCaW5kaW5nRGVzdGluYXRpb24ge1xuICAkZG9DaGVjaz86ICgpID0+IHZvaWQ7XG4gICRvbkRlc3Ryb3k/OiAoKSA9PiB2b2lkO1xuICAkb25Jbml0PzogKCkgPT4gdm9pZDtcbiAgJHBvc3RMaW5rPzogKCkgPT4gdm9pZDtcbn1cblxuLy8gQ2xhc3Nlc1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVIZWxwZXIge1xuICBwdWJsaWMgcmVhZG9ubHkgJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlO1xuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogRWxlbWVudDtcbiAgcHVibGljIHJlYWRvbmx5ICRlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5O1xuICBwdWJsaWMgcmVhZG9ubHkgZGlyZWN0aXZlOiBJRGlyZWN0aXZlO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgJGNvbXBpbGU6IElDb21waWxlU2VydmljZTtcbiAgcHJpdmF0ZSByZWFkb25seSAkY29udHJvbGxlcjogSUNvbnRyb2xsZXJTZXJ2aWNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgaW5qZWN0b3I6IEluamVjdG9yLCBwcml2YXRlIG5hbWU6IHN0cmluZywgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgZGlyZWN0aXZlPzogSURpcmVjdGl2ZSkge1xuICAgIHRoaXMuJGluamVjdG9yID0gaW5qZWN0b3IuZ2V0KCRJTkpFQ1RPUik7XG4gICAgdGhpcy4kY29tcGlsZSA9IHRoaXMuJGluamVjdG9yLmdldCgkQ09NUElMRSk7XG4gICAgdGhpcy4kY29udHJvbGxlciA9IHRoaXMuJGluamVjdG9yLmdldCgkQ09OVFJPTExFUik7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy4kZWxlbWVudCA9IGFuZ3VsYXJFbGVtZW50KHRoaXMuZWxlbWVudCk7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZSA9IGRpcmVjdGl2ZSB8fCBVcGdyYWRlSGVscGVyLmdldERpcmVjdGl2ZSh0aGlzLiRpbmplY3RvciwgbmFtZSk7XG4gIH1cblxuICBzdGF0aWMgZ2V0RGlyZWN0aXZlKCRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSwgbmFtZTogc3RyaW5nKTogSURpcmVjdGl2ZSB7XG4gICAgY29uc3QgZGlyZWN0aXZlczogSURpcmVjdGl2ZVtdID0gJGluamVjdG9yLmdldChuYW1lICsgJ0RpcmVjdGl2ZScpO1xuICAgIGlmIChkaXJlY3RpdmVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgT25seSBzdXBwb3J0IHNpbmdsZSBkaXJlY3RpdmUgZGVmaW5pdGlvbiBmb3I6ICR7bmFtZX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBkaXJlY3RpdmUgPSBkaXJlY3RpdmVzWzBdO1xuXG4gICAgLy8gQW5ndWxhckpTIHdpbGwgdHJhbnNmb3JtIGBsaW5rOiB4eXpgIHRvIGBjb21waWxlOiAoKSA9PiB4eXpgLiBTbyB3ZSBjYW4gb25seSB0ZWxsIHRoZXJlIHdhcyBhXG4gICAgLy8gdXNlci1kZWZpbmVkIGBjb21waWxlYCBpZiB0aGVyZSBpcyBubyBgbGlua2AuIEluIG90aGVyIGNhc2VzLCB3ZSB3aWxsIGp1c3QgaWdub3JlIGBjb21waWxlYC5cbiAgICBpZiAoZGlyZWN0aXZlLmNvbXBpbGUgJiYgIWRpcmVjdGl2ZS5saW5rKSBub3RTdXBwb3J0ZWQobmFtZSwgJ2NvbXBpbGUnKTtcbiAgICBpZiAoZGlyZWN0aXZlLnJlcGxhY2UpIG5vdFN1cHBvcnRlZChuYW1lLCAncmVwbGFjZScpO1xuICAgIGlmIChkaXJlY3RpdmUudGVybWluYWwpIG5vdFN1cHBvcnRlZChuYW1lLCAndGVybWluYWwnKTtcblxuICAgIHJldHVybiBkaXJlY3RpdmU7XG4gIH1cblxuICBzdGF0aWMgZ2V0VGVtcGxhdGUoXG4gICAgICAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UsIGRpcmVjdGl2ZTogSURpcmVjdGl2ZSwgZmV0Y2hSZW1vdGVUZW1wbGF0ZSA9IGZhbHNlLFxuICAgICAgJGVsZW1lbnQ/OiBJQXVnbWVudGVkSlF1ZXJ5KTogc3RyaW5nfFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKGRpcmVjdGl2ZS50ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZ2V0T3JDYWxsPHN0cmluZz4oZGlyZWN0aXZlLnRlbXBsYXRlLCAkZWxlbWVudCk7XG4gICAgfSBlbHNlIGlmIChkaXJlY3RpdmUudGVtcGxhdGVVcmwpIHtcbiAgICAgIGNvbnN0ICR0ZW1wbGF0ZUNhY2hlID0gJGluamVjdG9yLmdldCgkVEVNUExBVEVfQ0FDSEUpIGFzIElUZW1wbGF0ZUNhY2hlU2VydmljZTtcbiAgICAgIGNvbnN0IHVybCA9IGdldE9yQ2FsbDxzdHJpbmc+KGRpcmVjdGl2ZS50ZW1wbGF0ZVVybCwgJGVsZW1lbnQpO1xuICAgICAgY29uc3QgdGVtcGxhdGUgPSAkdGVtcGxhdGVDYWNoZS5nZXQodXJsKTtcblxuICAgICAgaWYgKHRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgfSBlbHNlIGlmICghZmV0Y2hSZW1vdGVUZW1wbGF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvYWRpbmcgZGlyZWN0aXZlIHRlbXBsYXRlcyBhc3luY2hyb25vdXNseSBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0ICRodHRwQmFja2VuZCA9ICRpbmplY3Rvci5nZXQoJEhUVFBfQkFDS0VORCkgYXMgSUh0dHBCYWNrZW5kU2VydmljZTtcbiAgICAgICAgJGh0dHBCYWNrZW5kKCdHRVQnLCB1cmwsIG51bGwsIChzdGF0dXM6IG51bWJlciwgcmVzcG9uc2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGlmIChzdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgcmVzb2x2ZSgkdGVtcGxhdGVDYWNoZS5wdXQodXJsLCByZXNwb25zZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QoYEdFVCBjb21wb25lbnQgdGVtcGxhdGUgZnJvbSAnJHt1cmx9JyByZXR1cm5lZCAnJHtzdGF0dXN9OiAke3Jlc3BvbnNlfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGlyZWN0aXZlICcke2RpcmVjdGl2ZS5uYW1lfScgaXMgbm90IGEgY29tcG9uZW50LCBpdCBpcyBtaXNzaW5nIHRlbXBsYXRlLmApO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZTogSUNvbnRyb2xsZXIsICRzY29wZTogSVNjb3BlKSB7XG4gICAgLy8gVE9ETzogRG9jdW1lbnQgdGhhdCB3ZSBkbyBub3QgcHJlLWFzc2lnbiBiaW5kaW5ncyBvbiB0aGUgY29udHJvbGxlciBpbnN0YW5jZS5cbiAgICAvLyBRdW90ZWQgcHJvcGVydGllcyBiZWxvdyBzbyB0aGF0IHRoaXMgY29kZSBjYW4gYmUgb3B0aW1pemVkIHdpdGggQ2xvc3VyZSBDb21waWxlci5cbiAgICBjb25zdCBsb2NhbHMgPSB7JyRzY29wZSc6ICRzY29wZSwgJyRlbGVtZW50JzogdGhpcy4kZWxlbWVudH07XG4gICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuJGNvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIGxvY2FscywgbnVsbCwgdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlckFzKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuZGF0YSEoY29udHJvbGxlcktleSh0aGlzLmRpcmVjdGl2ZS5uYW1lISksIGNvbnRyb2xsZXIpO1xuXG4gICAgcmV0dXJuIGNvbnRyb2xsZXI7XG4gIH1cblxuICBjb21waWxlVGVtcGxhdGUodGVtcGxhdGU/OiBzdHJpbmcpOiBJTGlua0ZuIHtcbiAgICBpZiAodGVtcGxhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGVtcGxhdGUgPVxuICAgICAgICAgIFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUodGhpcy4kaW5qZWN0b3IsIHRoaXMuZGlyZWN0aXZlLCBmYWxzZSwgdGhpcy4kZWxlbWVudCkgYXMgc3RyaW5nO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmNvbXBpbGVIdG1sKHRlbXBsYXRlKTtcbiAgfVxuXG4gIG9uRGVzdHJveSgkc2NvcGU6IElTY29wZSwgY29udHJvbGxlckluc3RhbmNlPzogYW55KSB7XG4gICAgaWYgKGNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKGNvbnRyb2xsZXJJbnN0YW5jZS4kb25EZXN0cm95KSkge1xuICAgICAgY29udHJvbGxlckluc3RhbmNlLiRvbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgJHNjb3BlLiRkZXN0cm95KCk7XG5cbiAgICAvLyBDbGVhbiB0aGUgalF1ZXJ5L2pxTGl0ZSBkYXRhIG9uIHRoZSBjb21wb25lbnQrY2hpbGQgZWxlbWVudHMuXG4gICAgLy8gRXF1aXZlbGVudCB0byBob3cgalF1ZXJ5L2pxTGl0ZSBpbnZva2UgYGNsZWFuRGF0YWAgb24gYW4gRWxlbWVudCAodGhpcy5lbGVtZW50KVxuICAgIC8vICBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iL2U3NDNjYmQyODU1MzI2N2Y5NTVmNzFlYTcyNDgzNzc5MTU2MTNmZDkvc3JjL21hbmlwdWxhdGlvbi5qcyNMMjIzXG4gICAgLy8gIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi8yNmRkYzVmODMwZjkwMmEzZDIyZjRiMmFhYjcwZDg2ZDRkNjg4YzgyL3NyYy9qcUxpdGUuanMjTDMwNi1MMzEyXG4gICAgLy8gYGNsZWFuRGF0YWAgd2lsbCBpbnZva2UgdGhlIEFuZ3VsYXJKUyBgJGRlc3Ryb3lgIERPTSBldmVudFxuICAgIC8vICBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvMjZkZGM1ZjgzMGY5MDJhM2QyMmY0YjJhYWI3MGQ4NmQ0ZDY4OGM4Mi9zcmMvQW5ndWxhci5qcyNMMTkxMS1MMTkyNFxuICAgIGFuZ3VsYXJFbGVtZW50LmNsZWFuRGF0YShbdGhpcy5lbGVtZW50XSk7XG4gICAgYW5ndWxhckVsZW1lbnQuY2xlYW5EYXRhKHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCcqJykpO1xuICB9XG5cbiAgcHJlcGFyZVRyYW5zY2x1c2lvbigpOiBJTGlua0ZufHVuZGVmaW5lZCB7XG4gICAgY29uc3QgdHJhbnNjbHVkZSA9IHRoaXMuZGlyZWN0aXZlLnRyYW5zY2x1ZGU7XG4gICAgY29uc3QgY29udGVudENoaWxkTm9kZXMgPSB0aGlzLmV4dHJhY3RDaGlsZE5vZGVzKCk7XG4gICAgY29uc3QgYXR0YWNoQ2hpbGRyZW5GbjogSUxpbmtGbiA9IChzY29wZSwgY2xvbmVBdHRhY2hGbikgPT4ge1xuICAgICAgLy8gU2luY2UgQW5ndWxhckpTIHYxLjUuOCwgYGNsb25lQXR0YWNoRm5gIHdpbGwgdHJ5IHRvIGRlc3Ryb3kgdGhlIHRyYW5zY2x1c2lvbiBzY29wZSBpZlxuICAgICAgLy8gYCR0ZW1wbGF0ZWAgaXMgZW1wdHkuIFNpbmNlIHRoZSB0cmFuc2NsdWRlZCBjb250ZW50IGNvbWVzIGZyb20gQW5ndWxhciwgbm90IEFuZ3VsYXJKUyxcbiAgICAgIC8vIHRoZXJlIHdpbGwgYmUgbm8gdHJhbnNjbHVzaW9uIHNjb3BlIGhlcmUuXG4gICAgICAvLyBQcm92aWRlIGEgZHVtbXkgYHNjb3BlLiRkZXN0cm95KClgIG1ldGhvZCB0byBwcmV2ZW50IGBjbG9uZUF0dGFjaEZuYCBmcm9tIHRocm93aW5nLlxuICAgICAgc2NvcGUgPSBzY29wZSB8fCB7JGRlc3Ryb3k6ICgpID0+IHVuZGVmaW5lZH07XG4gICAgICByZXR1cm4gY2xvbmVBdHRhY2hGbiEoJHRlbXBsYXRlLCBzY29wZSk7XG4gICAgfTtcbiAgICBsZXQgJHRlbXBsYXRlID0gY29udGVudENoaWxkTm9kZXM7XG5cbiAgICBpZiAodHJhbnNjbHVkZSkge1xuICAgICAgY29uc3Qgc2xvdHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICBpZiAodHlwZW9mIHRyYW5zY2x1ZGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICR0ZW1wbGF0ZSA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHNsb3RNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBjb25zdCBmaWxsZWRTbG90cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgICAgLy8gUGFyc2UgdGhlIGVsZW1lbnQgc2VsZWN0b3JzLlxuICAgICAgICBPYmplY3Qua2V5cyh0cmFuc2NsdWRlKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBsZXQgc2VsZWN0b3IgPSB0cmFuc2NsdWRlW3Nsb3ROYW1lXTtcbiAgICAgICAgICBjb25zdCBvcHRpb25hbCA9IHNlbGVjdG9yLmNoYXJBdCgwKSA9PT0gJz8nO1xuICAgICAgICAgIHNlbGVjdG9yID0gb3B0aW9uYWwgPyBzZWxlY3Rvci5zdWJzdHJpbmcoMSkgOiBzZWxlY3RvcjtcblxuICAgICAgICAgIHNsb3RNYXBbc2VsZWN0b3JdID0gc2xvdE5hbWU7XG4gICAgICAgICAgc2xvdHNbc2xvdE5hbWVdID0gbnVsbDsgICAgICAgICAgICAvLyBgbnVsbGA6IERlZmluZWQgYnV0IG5vdCB5ZXQgZmlsbGVkLlxuICAgICAgICAgIGZpbGxlZFNsb3RzW3Nsb3ROYW1lXSA9IG9wdGlvbmFsOyAgLy8gQ29uc2lkZXIgb3B0aW9uYWwgc2xvdHMgYXMgZmlsbGVkLlxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgdGhlIG1hdGNoaW5nIGVsZW1lbnRzIGludG8gdGhlaXIgc2xvdC5cbiAgICAgICAgY29udGVudENoaWxkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICBjb25zdCBzbG90TmFtZSA9IHNsb3RNYXBbZGlyZWN0aXZlTm9ybWFsaXplKG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSldO1xuICAgICAgICAgIGlmIChzbG90TmFtZSkge1xuICAgICAgICAgICAgZmlsbGVkU2xvdHNbc2xvdE5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IHNsb3RzW3Nsb3ROYW1lXSB8fCBbXTtcbiAgICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXS5wdXNoKG5vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkdGVtcGxhdGUucHVzaChub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciByZXF1aXJlZCBzbG90cyB0aGF0IHdlcmUgbm90IGZpbGxlZC5cbiAgICAgICAgT2JqZWN0LmtleXMoZmlsbGVkU2xvdHMpLmZvckVhY2goc2xvdE5hbWUgPT4ge1xuICAgICAgICAgIGlmICghZmlsbGVkU2xvdHNbc2xvdE5hbWVdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVpcmVkIHRyYW5zY2x1c2lvbiBzbG90ICcke3Nsb3ROYW1lfScgb24gZGlyZWN0aXZlOiAke3RoaXMubmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNsb3RzKS5maWx0ZXIoc2xvdE5hbWUgPT4gc2xvdHNbc2xvdE5hbWVdKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlcyA9IHNsb3RzW3Nsb3ROYW1lXTtcbiAgICAgICAgICBzbG90c1tzbG90TmFtZV0gPSAoc2NvcGU6IElTY29wZSwgY2xvbmVBdHRhY2g6IElDbG9uZUF0dGFjaEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY2xvbmVBdHRhY2ghKG5vZGVzLCBzY29wZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEF0dGFjaCBgJCRzbG90c2AgdG8gZGVmYXVsdCBzbG90IHRyYW5zY2x1ZGUgZm4uXG4gICAgICBhdHRhY2hDaGlsZHJlbkZuLiQkc2xvdHMgPSBzbG90cztcblxuICAgICAgLy8gQW5ndWxhckpTIHYxLjYrIGlnbm9yZXMgZW1wdHkgb3Igd2hpdGVzcGFjZS1vbmx5IHRyYW5zY2x1ZGVkIHRleHQgbm9kZXMuIEJ1dCBBbmd1bGFyXG4gICAgICAvLyByZW1vdmVzIGFsbCB0ZXh0IGNvbnRlbnQgYWZ0ZXIgdGhlIGZpcnN0IGludGVycG9sYXRpb24gYW5kIHVwZGF0ZXMgaXQgbGF0ZXIsIGFmdGVyXG4gICAgICAvLyBldmFsdWF0aW5nIHRoZSBleHByZXNzaW9ucy4gVGhpcyB3b3VsZCByZXN1bHQgaW4gQW5ndWxhckpTIGZhaWxpbmcgdG8gcmVjb2duaXplIHRleHRcbiAgICAgIC8vIG5vZGVzIHRoYXQgc3RhcnQgd2l0aCBhbiBpbnRlcnBvbGF0aW9uIGFzIHRyYW5zY2x1ZGVkIGNvbnRlbnQgYW5kIHVzZSB0aGUgZmFsbGJhY2tcbiAgICAgIC8vIGNvbnRlbnQgaW5zdGVhZC5cbiAgICAgIC8vIFRvIGF2b2lkIHRoaXMgaXNzdWUsIHdlIGFkZCBhXG4gICAgICAvLyBbemVyby13aWR0aCBub24tam9pbmVyIGNoYXJhY3Rlcl0oaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvWmVyby13aWR0aF9ub24tam9pbmVyKVxuICAgICAgLy8gdG8gZW1wdHkgdGV4dCBub2RlcyAod2hpY2ggY2FuIG9ubHkgYmUgYSByZXN1bHQgb2YgQW5ndWxhciByZW1vdmluZyB0aGVpciBpbml0aWFsIGNvbnRlbnQpLlxuICAgICAgLy8gTk9URTogVHJhbnNjbHVkZWQgdGV4dCBjb250ZW50IHRoYXQgc3RhcnRzIHdpdGggd2hpdGVzcGFjZSBmb2xsb3dlZCBieSBhbiBpbnRlcnBvbGF0aW9uXG4gICAgICAvLyAgICAgICB3aWxsIHN0aWxsIGZhaWwgdG8gYmUgZGV0ZWN0ZWQgYnkgQW5ndWxhckpTIHYxLjYrXG4gICAgICAkdGVtcGxhdGUuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFICYmICFub2RlLm5vZGVWYWx1ZSkge1xuICAgICAgICAgIG5vZGUubm9kZVZhbHVlID0gJ1xcdTIwMEMnO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXR0YWNoQ2hpbGRyZW5GbjtcbiAgfVxuXG4gIHJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyhjb250cm9sbGVySW5zdGFuY2U6IElDb250cm9sbGVySW5zdGFuY2V8bnVsbCkge1xuICAgIGNvbnN0IGRpcmVjdGl2ZVJlcXVpcmUgPSB0aGlzLmdldERpcmVjdGl2ZVJlcXVpcmUoKTtcbiAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzID0gdGhpcy5yZXNvbHZlUmVxdWlyZShkaXJlY3RpdmVSZXF1aXJlKTtcblxuICAgIGlmIChjb250cm9sbGVySW5zdGFuY2UgJiYgdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciAmJiBpc01hcChkaXJlY3RpdmVSZXF1aXJlKSkge1xuICAgICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVyc01hcCA9IHJlcXVpcmVkQ29udHJvbGxlcnMgYXMge1trZXk6IHN0cmluZ106IElDb250cm9sbGVySW5zdGFuY2V9O1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZWRDb250cm9sbGVyc01hcCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb250cm9sbGVySW5zdGFuY2Vba2V5XSA9IHJlcXVpcmVkQ29udHJvbGxlcnNNYXBba2V5XTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1aXJlZENvbnRyb2xsZXJzO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21waWxlSHRtbChodG1sOiBzdHJpbmcpOiBJTGlua0ZuIHtcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gdGhpcy4kY29tcGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcyk7XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RDaGlsZE5vZGVzKCk6IE5vZGVbXSB7XG4gICAgY29uc3QgY2hpbGROb2RlczogTm9kZVtdID0gW107XG4gICAgbGV0IGNoaWxkTm9kZTogTm9kZXxudWxsO1xuXG4gICAgd2hpbGUgKGNoaWxkTm9kZSA9IHRoaXMuZWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGROb2RlKTtcbiAgICAgIGNoaWxkTm9kZXMucHVzaChjaGlsZE5vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZE5vZGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREaXJlY3RpdmVSZXF1aXJlKCk6IERpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eSB7XG4gICAgY29uc3QgcmVxdWlyZSA9IHRoaXMuZGlyZWN0aXZlLnJlcXVpcmUgfHwgKHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXIgJiYgdGhpcy5kaXJlY3RpdmUubmFtZSkhO1xuXG4gICAgaWYgKGlzTWFwKHJlcXVpcmUpKSB7XG4gICAgICBPYmplY3Qua2V5cyhyZXF1aXJlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gcmVxdWlyZVtrZXldO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHZhbHVlLm1hdGNoKFJFUVVJUkVfUFJFRklYX1JFKSE7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB2YWx1ZS5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcblxuICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICByZXF1aXJlW2tleV0gPSBtYXRjaFswXSArIGtleTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVpcmU7XG4gIH1cblxuICBwcml2YXRlIHJlc29sdmVSZXF1aXJlKHJlcXVpcmU6IERpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eSwgY29udHJvbGxlckluc3RhbmNlPzogYW55KTpcbiAgICAgIFNpbmdsZU9yTGlzdE9yTWFwPElDb250cm9sbGVySW5zdGFuY2U+fG51bGwge1xuICAgIGlmICghcmVxdWlyZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcXVpcmUpKSB7XG4gICAgICByZXR1cm4gcmVxdWlyZS5tYXAocmVxID0+IHRoaXMucmVzb2x2ZVJlcXVpcmUocmVxKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcmVxdWlyZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGNvbnN0IHZhbHVlOiB7W2tleTogc3RyaW5nXTogSUNvbnRyb2xsZXJJbnN0YW5jZX0gPSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmUpLmZvckVhY2goa2V5ID0+IHZhbHVlW2tleV0gPSB0aGlzLnJlc29sdmVSZXF1aXJlKHJlcXVpcmVba2V5XSkhKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXF1aXJlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgbWF0Y2ggPSByZXF1aXJlLm1hdGNoKFJFUVVJUkVfUFJFRklYX1JFKSE7XG4gICAgICBjb25zdCBpbmhlcml0VHlwZSA9IG1hdGNoWzFdIHx8IG1hdGNoWzNdO1xuXG4gICAgICBjb25zdCBuYW1lID0gcmVxdWlyZS5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgIGNvbnN0IGlzT3B0aW9uYWwgPSAhIW1hdGNoWzJdO1xuICAgICAgY29uc3Qgc2VhcmNoUGFyZW50cyA9ICEhaW5oZXJpdFR5cGU7XG4gICAgICBjb25zdCBzdGFydE9uUGFyZW50ID0gaW5oZXJpdFR5cGUgPT09ICdeXic7XG5cbiAgICAgIGNvbnN0IGN0cmxLZXkgPSBjb250cm9sbGVyS2V5KG5hbWUpO1xuICAgICAgY29uc3QgZWxlbSA9IHN0YXJ0T25QYXJlbnQgPyB0aGlzLiRlbGVtZW50LnBhcmVudCEoKSA6IHRoaXMuJGVsZW1lbnQ7XG4gICAgICBjb25zdCB2YWx1ZSA9IHNlYXJjaFBhcmVudHMgPyBlbGVtLmluaGVyaXRlZERhdGEhKGN0cmxLZXkpIDogZWxlbS5kYXRhIShjdHJsS2V5KTtcblxuICAgICAgaWYgKCF2YWx1ZSAmJiAhaXNPcHRpb25hbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGZpbmQgcmVxdWlyZWQgJyR7cmVxdWlyZX0nIGluIHVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHt0aGlzLm5hbWV9Jy5gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVucmVjb2duaXplZCAncmVxdWlyZScgc3ludGF4IG9uIHVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHt0aGlzLm5hbWV9JzogJHtyZXF1aXJlfWApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRPckNhbGw8VD4ocHJvcGVydHk6IFR8RnVuY3Rpb24sIC4uLmFyZ3M6IGFueVtdKTogVCB7XG4gIHJldHVybiBpc0Z1bmN0aW9uKHByb3BlcnR5KSA/IHByb3BlcnR5KC4uLmFyZ3MpIDogcHJvcGVydHk7XG59XG5cbi8vIE5PVEU6IE9ubHkgd29ya3MgZm9yIGB0eXBlb2YgVCAhPT0gJ29iamVjdCdgLlxuZnVuY3Rpb24gaXNNYXA8VD4odmFsdWU6IFNpbmdsZU9yTGlzdE9yTWFwPFQ+KTogdmFsdWUgaXMge1trZXk6IHN0cmluZ106IFR9IHtcbiAgcmV0dXJuIHZhbHVlICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG5mdW5jdGlvbiBub3RTdXBwb3J0ZWQobmFtZTogc3RyaW5nLCBmZWF0dXJlOiBzdHJpbmcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBVcGdyYWRlZCBkaXJlY3RpdmUgJyR7bmFtZX0nIGNvbnRhaW5zIHVuc3VwcG9ydGVkIGZlYXR1cmU6ICcke2ZlYXR1cmV9Jy5gKTtcbn1cbiJdfQ==