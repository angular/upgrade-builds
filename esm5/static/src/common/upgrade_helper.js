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
var REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
// Classes
var UpgradeHelper = /** @class */ (function () {
    function UpgradeHelper(injector, name, elementRef, directive) {
        this.injector = injector;
        this.name = name;
        this.$injector = injector.get($INJECTOR);
        this.$compile = this.$injector.get($COMPILE);
        this.$controller = this.$injector.get($CONTROLLER);
        this.element = elementRef.nativeElement;
        this.$element = angular.element(this.element);
        this.directive = directive || UpgradeHelper.getDirective(this.$injector, name);
    }
    UpgradeHelper.getDirective = function ($injector, name) {
        var directives = $injector.get(name + 'Directive');
        if (directives.length > 1) {
            throw new Error("Only support single directive definition for: " + name);
        }
        var directive = directives[0];
        // AngularJS will transform `link: xyz` to `compile: () => xyz`. So we can only tell there was a
        // user-defined `compile` if there is no `link`. In other cases, we will just ignore `compile`.
        if (directive.compile && !directive.link)
            notSupported(name, 'compile');
        if (directive.replace)
            notSupported(name, 'replace');
        if (directive.terminal)
            notSupported(name, 'terminal');
        return directive;
    };
    UpgradeHelper.getTemplate = function ($injector, directive, fetchRemoteTemplate) {
        if (fetchRemoteTemplate === void 0) { fetchRemoteTemplate = false; }
        if (directive.template !== undefined) {
            return getOrCall(directive.template);
        }
        else if (directive.templateUrl) {
            var $templateCache_1 = $injector.get($TEMPLATE_CACHE);
            var url_1 = getOrCall(directive.templateUrl);
            var template = $templateCache_1.get(url_1);
            if (template !== undefined) {
                return template;
            }
            else if (!fetchRemoteTemplate) {
                throw new Error('loading directive templates asynchronously is not supported');
            }
            return new Promise(function (resolve, reject) {
                var $httpBackend = $injector.get($HTTP_BACKEND);
                $httpBackend('GET', url_1, null, function (status, response) {
                    if (status === 200) {
                        resolve($templateCache_1.put(url_1, response));
                    }
                    else {
                        reject("GET component template from '" + url_1 + "' returned '" + status + ": " + response + "'");
                    }
                });
            });
        }
        else {
            throw new Error("Directive '" + directive.name + "' is not a component, it is missing template.");
        }
    };
    UpgradeHelper.prototype.buildController = function (controllerType, $scope) {
        // TODO: Document that we do not pre-assign bindings on the controller instance.
        // Quoted properties below so that this code can be optimized with Closure Compiler.
        var locals = { '$scope': $scope, '$element': this.$element };
        var controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);
        this.$element.data(controllerKey(this.directive.name), controller);
        return controller;
    };
    UpgradeHelper.prototype.compileTemplate = function (template) {
        if (template === undefined) {
            template = UpgradeHelper.getTemplate(this.$injector, this.directive);
        }
        return this.compileHtml(template);
    };
    UpgradeHelper.prototype.onDestroy = function ($scope, controllerInstance) {
        if (controllerInstance && isFunction(controllerInstance.$onDestroy)) {
            controllerInstance.$onDestroy();
        }
        $scope.$destroy();
        this.$element.triggerHandler('$destroy');
    };
    UpgradeHelper.prototype.prepareTransclusion = function () {
        var _this = this;
        var transclude = this.directive.transclude;
        var contentChildNodes = this.extractChildNodes();
        var attachChildrenFn = function (scope, cloneAttachFn) {
            // Since AngularJS v1.5.8, `cloneAttachFn` will try to destroy the transclusion scope if
            // `$template` is empty. Since the transcluded content comes from Angular, not AngularJS,
            // there will be no transclusion scope here.
            // Provide a dummy `scope.$destroy()` method to prevent `cloneAttachFn` from throwing.
            scope = scope || { $destroy: function () { return undefined; } };
            return cloneAttachFn($template, scope);
        };
        var $template = contentChildNodes;
        if (transclude) {
            var slots_1 = Object.create(null);
            if (typeof transclude === 'object') {
                $template = [];
                var slotMap_1 = Object.create(null);
                var filledSlots_1 = Object.create(null);
                // Parse the element selectors.
                Object.keys(transclude).forEach(function (slotName) {
                    var selector = transclude[slotName];
                    var optional = selector.charAt(0) === '?';
                    selector = optional ? selector.substring(1) : selector;
                    slotMap_1[selector] = slotName;
                    slots_1[slotName] = null; // `null`: Defined but not yet filled.
                    filledSlots_1[slotName] = optional; // Consider optional slots as filled.
                });
                // Add the matching elements into their slot.
                contentChildNodes.forEach(function (node) {
                    var slotName = slotMap_1[directiveNormalize(node.nodeName.toLowerCase())];
                    if (slotName) {
                        filledSlots_1[slotName] = true;
                        slots_1[slotName] = slots_1[slotName] || [];
                        slots_1[slotName].push(node);
                    }
                    else {
                        $template.push(node);
                    }
                });
                // Check for required slots that were not filled.
                Object.keys(filledSlots_1).forEach(function (slotName) {
                    if (!filledSlots_1[slotName]) {
                        throw new Error("Required transclusion slot '" + slotName + "' on directive: " + _this.name);
                    }
                });
                Object.keys(slots_1).filter(function (slotName) { return slots_1[slotName]; }).forEach(function (slotName) {
                    var nodes = slots_1[slotName];
                    slots_1[slotName] = function (scope, cloneAttach) {
                        return cloneAttach(nodes, scope);
                    };
                });
            }
            // Attach `$$slots` to default slot transclude fn.
            attachChildrenFn.$$slots = slots_1;
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
            $template.forEach(function (node) {
                if (node.nodeType === Node.TEXT_NODE && !node.nodeValue) {
                    node.nodeValue = '\u200C';
                }
            });
        }
        return attachChildrenFn;
    };
    UpgradeHelper.prototype.resolveAndBindRequiredControllers = function (controllerInstance) {
        var directiveRequire = this.getDirectiveRequire();
        var requiredControllers = this.resolveRequire(directiveRequire);
        if (controllerInstance && this.directive.bindToController && isMap(directiveRequire)) {
            var requiredControllersMap_1 = requiredControllers;
            Object.keys(requiredControllersMap_1).forEach(function (key) {
                controllerInstance[key] = requiredControllersMap_1[key];
            });
        }
        return requiredControllers;
    };
    UpgradeHelper.prototype.compileHtml = function (html) {
        this.element.innerHTML = html;
        return this.$compile(this.element.childNodes);
    };
    UpgradeHelper.prototype.extractChildNodes = function () {
        var childNodes = [];
        var childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        return childNodes;
    };
    UpgradeHelper.prototype.getDirectiveRequire = function () {
        var require = this.directive.require || (this.directive.controller && this.directive.name);
        if (isMap(require)) {
            Object.keys(require).forEach(function (key) {
                var value = require[key];
                var match = value.match(REQUIRE_PREFIX_RE);
                var name = value.substring(match[0].length);
                if (!name) {
                    require[key] = match[0] + key;
                }
            });
        }
        return require;
    };
    UpgradeHelper.prototype.resolveRequire = function (require, controllerInstance) {
        var _this = this;
        if (!require) {
            return null;
        }
        else if (Array.isArray(require)) {
            return require.map(function (req) { return _this.resolveRequire(req); });
        }
        else if (typeof require === 'object') {
            var value_1 = {};
            Object.keys(require).forEach(function (key) { return value_1[key] = _this.resolveRequire(require[key]); });
            return value_1;
        }
        else if (typeof require === 'string') {
            var match = require.match(REQUIRE_PREFIX_RE);
            var inheritType = match[1] || match[3];
            var name_1 = require.substring(match[0].length);
            var isOptional = !!match[2];
            var searchParents = !!inheritType;
            var startOnParent = inheritType === '^^';
            var ctrlKey = controllerKey(name_1);
            var elem = startOnParent ? this.$element.parent() : this.$element;
            var value = searchParents ? elem.inheritedData(ctrlKey) : elem.data(ctrlKey);
            if (!value && !isOptional) {
                throw new Error("Unable to find required '" + require + "' in upgraded directive '" + this.name + "'.");
            }
            return value;
        }
        else {
            throw new Error("Unrecognized 'require' syntax on upgraded directive '" + this.name + "': " + require);
        }
    };
    return UpgradeHelper;
}());
export { UpgradeHelper };
function getOrCall(property) {
    return isFunction(property) ? property() : property;
}
// NOTE: Only works for `typeof T !== 'object'`.
function isMap(value) {
    return value && !Array.isArray(value) && typeof value === 'object';
}
function notSupported(name, feature) {
    throw new Error("Upgraded directive '" + name + "' contains unsupported feature: '" + feature + "'.");
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvY29tbW9uL3VwZ3JhZGVfaGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUlILE9BQU8sS0FBSyxPQUFPLE1BQU0sWUFBWSxDQUFDO0FBQ3RDLE9BQU8sRUFBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzdGLE9BQU8sRUFBQyxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBR3JFLFlBQVk7QUFDWixJQUFNLGlCQUFpQixHQUFHLHdCQUF3QixDQUFDO0FBZW5ELFVBQVU7QUFDVjtJQVNFLHVCQUNZLFFBQWtCLEVBQVUsSUFBWSxFQUFFLFVBQXNCLEVBQ3hFLFNBQThCO1FBRHRCLGFBQVEsR0FBUixRQUFRLENBQVU7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFRO1FBRWxELElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFbkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLElBQUksYUFBYSxD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QWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RWxlbWVudFJlZiwgSW5qZWN0b3IsIFNpbXBsZUNoYW5nZXN9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHskQ09NUElMRSwgJENPTlRST0xMRVIsICRIVFRQX0JBQ0tFTkQsICRJTkpFQ1RPUiwgJFRFTVBMQVRFX0NBQ0hFfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2NvbnRyb2xsZXJLZXksIGRpcmVjdGl2ZU5vcm1hbGl6ZSwgaXNGdW5jdGlvbn0gZnJvbSAnLi91dGlsJztcblxuXG4vLyBDb25zdGFudHNcbmNvbnN0IFJFUVVJUkVfUFJFRklYX1JFID0gL14oXFxeXFxePyk/KFxcPyk/KFxcXlxcXj8pPy87XG5cbi8vIEludGVyZmFjZXNcbmV4cG9ydCBpbnRlcmZhY2UgSUJpbmRpbmdEZXN0aW5hdGlvbiB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbiAgJG9uQ2hhbmdlcz86IChjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElDb250cm9sbGVySW5zdGFuY2UgZXh0ZW5kcyBJQmluZGluZ0Rlc3RpbmF0aW9uIHtcbiAgJGRvQ2hlY2s/OiAoKSA9PiB2b2lkO1xuICAkb25EZXN0cm95PzogKCkgPT4gdm9pZDtcbiAgJG9uSW5pdD86ICgpID0+IHZvaWQ7XG4gICRwb3N0TGluaz86ICgpID0+IHZvaWQ7XG59XG5cbi8vIENsYXNzZXNcbmV4cG9ydCBjbGFzcyBVcGdyYWRlSGVscGVyIHtcbiAgcHVibGljIHJlYWRvbmx5ICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlO1xuICBwdWJsaWMgcmVhZG9ubHkgZWxlbWVudDogRWxlbWVudDtcbiAgcHVibGljIHJlYWRvbmx5ICRlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnk7XG4gIHB1YmxpYyByZWFkb25seSBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZTtcblxuICBwcml2YXRlIHJlYWRvbmx5ICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZTtcbiAgcHJpdmF0ZSByZWFkb25seSAkY29udHJvbGxlcjogYW5ndWxhci5JQ29udHJvbGxlclNlcnZpY2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGluamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSBuYW1lOiBzdHJpbmcsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgICBkaXJlY3RpdmU/OiBhbmd1bGFyLklEaXJlY3RpdmUpIHtcbiAgICB0aGlzLiRpbmplY3RvciA9IGluamVjdG9yLmdldCgkSU5KRUNUT1IpO1xuICAgIHRoaXMuJGNvbXBpbGUgPSB0aGlzLiRpbmplY3Rvci5nZXQoJENPTVBJTEUpO1xuICAgIHRoaXMuJGNvbnRyb2xsZXIgPSB0aGlzLiRpbmplY3Rvci5nZXQoJENPTlRST0xMRVIpO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xuICAgIHRoaXMuJGVsZW1lbnQgPSBhbmd1bGFyLmVsZW1lbnQodGhpcy5lbGVtZW50KTtcblxuICAgIHRoaXMuZGlyZWN0aXZlID0gZGlyZWN0aXZlIHx8IFVwZ3JhZGVIZWxwZXIuZ2V0RGlyZWN0aXZlKHRoaXMuJGluamVjdG9yLCBuYW1lKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXREaXJlY3RpdmUoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsIG5hbWU6IHN0cmluZyk6IGFuZ3VsYXIuSURpcmVjdGl2ZSB7XG4gICAgY29uc3QgZGlyZWN0aXZlczogYW5ndWxhci5JRGlyZWN0aXZlW10gPSAkaW5qZWN0b3IuZ2V0KG5hbWUgKyAnRGlyZWN0aXZlJyk7XG4gICAgaWYgKGRpcmVjdGl2ZXMubGVuZ3RoID4gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBPbmx5IHN1cHBvcnQgc2luZ2xlIGRpcmVjdGl2ZSBkZWZpbml0aW9uIGZvcjogJHtuYW1lfWApO1xuICAgIH1cblxuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IGRpcmVjdGl2ZXNbMF07XG5cbiAgICAvLyBBbmd1bGFySlMgd2lsbCB0cmFuc2Zvcm0gYGxpbms6IHh5emAgdG8gYGNvbXBpbGU6ICgpID0+IHh5emAuIFNvIHdlIGNhbiBvbmx5IHRlbGwgdGhlcmUgd2FzIGFcbiAgICAvLyB1c2VyLWRlZmluZWQgYGNvbXBpbGVgIGlmIHRoZXJlIGlzIG5vIGBsaW5rYC4gSW4gb3RoZXIgY2FzZXMsIHdlIHdpbGwganVzdCBpZ25vcmUgYGNvbXBpbGVgLlxuICAgIGlmIChkaXJlY3RpdmUuY29tcGlsZSAmJiAhZGlyZWN0aXZlLmxpbmspIG5vdFN1cHBvcnRlZChuYW1lLCAnY29tcGlsZScpO1xuICAgIGlmIChkaXJlY3RpdmUucmVwbGFjZSkgbm90U3VwcG9ydGVkKG5hbWUsICdyZXBsYWNlJyk7XG4gICAgaWYgKGRpcmVjdGl2ZS50ZXJtaW5hbCkgbm90U3VwcG9ydGVkKG5hbWUsICd0ZXJtaW5hbCcpO1xuXG4gICAgcmV0dXJuIGRpcmVjdGl2ZTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRUZW1wbGF0ZShcbiAgICAgICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZSxcbiAgICAgIGZldGNoUmVtb3RlVGVtcGxhdGUgPSBmYWxzZSk6IHN0cmluZ3xQcm9taXNlPHN0cmluZz4ge1xuICAgIGlmIChkaXJlY3RpdmUudGVtcGxhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGdldE9yQ2FsbDxzdHJpbmc+KGRpcmVjdGl2ZS50ZW1wbGF0ZSk7XG4gICAgfSBlbHNlIGlmIChkaXJlY3RpdmUudGVtcGxhdGVVcmwpIHtcbiAgICAgIGNvbnN0ICR0ZW1wbGF0ZUNhY2hlID0gJGluamVjdG9yLmdldCgkVEVNUExBVEVfQ0FDSEUpIGFzIGFuZ3VsYXIuSVRlbXBsYXRlQ2FjaGVTZXJ2aWNlO1xuICAgICAgY29uc3QgdXJsID0gZ2V0T3JDYWxsPHN0cmluZz4oZGlyZWN0aXZlLnRlbXBsYXRlVXJsKTtcbiAgICAgIGNvbnN0IHRlbXBsYXRlID0gJHRlbXBsYXRlQ2FjaGUuZ2V0KHVybCk7XG5cbiAgICAgIGlmICh0ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgIH0gZWxzZSBpZiAoIWZldGNoUmVtb3RlVGVtcGxhdGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2FkaW5nIGRpcmVjdGl2ZSB0ZW1wbGF0ZXMgYXN5bmNocm9ub3VzbHkgaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCAkaHR0cEJhY2tlbmQgPSAkaW5qZWN0b3IuZ2V0KCRIVFRQX0JBQ0tFTkQpIGFzIGFuZ3VsYXIuSUh0dHBCYWNrZW5kU2VydmljZTtcbiAgICAgICAgJGh0dHBCYWNrZW5kKCdHRVQnLCB1cmwsIG51bGwsIChzdGF0dXM6IG51bWJlciwgcmVzcG9uc2U6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGlmIChzdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgcmVzb2x2ZSgkdGVtcGxhdGVDYWNoZS5wdXQodXJsLCByZXNwb25zZSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QoYEdFVCBjb21wb25lbnQgdGVtcGxhdGUgZnJvbSAnJHt1cmx9JyByZXR1cm5lZCAnJHtzdGF0dXN9OiAke3Jlc3BvbnNlfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRGlyZWN0aXZlICcke2RpcmVjdGl2ZS5uYW1lfScgaXMgbm90IGEgY29tcG9uZW50LCBpdCBpcyBtaXNzaW5nIHRlbXBsYXRlLmApO1xuICAgIH1cbiAgfVxuXG4gIGJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZTogYW5ndWxhci5JQ29udHJvbGxlciwgJHNjb3BlOiBhbmd1bGFyLklTY29wZSkge1xuICAgIC8vIFRPRE86IERvY3VtZW50IHRoYXQgd2UgZG8gbm90IHByZS1hc3NpZ24gYmluZGluZ3Mgb24gdGhlIGNvbnRyb2xsZXIgaW5zdGFuY2UuXG4gICAgLy8gUXVvdGVkIHByb3BlcnRpZXMgYmVsb3cgc28gdGhhdCB0aGlzIGNvZGUgY2FuIGJlIG9wdGltaXplZCB3aXRoIENsb3N1cmUgQ29tcGlsZXIuXG4gICAgY29uc3QgbG9jYWxzID0geyckc2NvcGUnOiAkc2NvcGUsICckZWxlbWVudCc6IHRoaXMuJGVsZW1lbnR9O1xuICAgIGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLiRjb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCBsb2NhbHMsIG51bGwsIHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXJBcyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmRhdGEgIShjb250cm9sbGVyS2V5KHRoaXMuZGlyZWN0aXZlLm5hbWUgISksIGNvbnRyb2xsZXIpO1xuXG4gICAgcmV0dXJuIGNvbnRyb2xsZXI7XG4gIH1cblxuICBjb21waWxlVGVtcGxhdGUodGVtcGxhdGU/OiBzdHJpbmcpOiBhbmd1bGFyLklMaW5rRm4ge1xuICAgIGlmICh0ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0ZW1wbGF0ZSA9IFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUodGhpcy4kaW5qZWN0b3IsIHRoaXMuZGlyZWN0aXZlKSBhcyBzdHJpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZUh0bWwodGVtcGxhdGUpO1xuICB9XG5cbiAgb25EZXN0cm95KCRzY29wZTogYW5ndWxhci5JU2NvcGUsIGNvbnRyb2xsZXJJbnN0YW5jZT86IGFueSkge1xuICAgIGlmIChjb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbihjb250cm9sbGVySW5zdGFuY2UuJG9uRGVzdHJveSkpIHtcbiAgICAgIGNvbnRyb2xsZXJJbnN0YW5jZS4kb25EZXN0cm95KCk7XG4gICAgfVxuICAgICRzY29wZS4kZGVzdHJveSgpO1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlckhhbmRsZXIgISgnJGRlc3Ryb3knKTtcbiAgfVxuXG4gIHByZXBhcmVUcmFuc2NsdXNpb24oKTogYW5ndWxhci5JTGlua0ZufHVuZGVmaW5lZCB7XG4gICAgY29uc3QgdHJhbnNjbHVkZSA9IHRoaXMuZGlyZWN0aXZlLnRyYW5zY2x1ZGU7XG4gICAgY29uc3QgY29udGVudENoaWxkTm9kZXMgPSB0aGlzLmV4dHJhY3RDaGlsZE5vZGVzKCk7XG4gICAgY29uc3QgYXR0YWNoQ2hpbGRyZW5GbjogYW5ndWxhci5JTGlua0ZuID0gKHNjb3BlLCBjbG9uZUF0dGFjaEZuKSA9PiB7XG4gICAgICAvLyBTaW5jZSBBbmd1bGFySlMgdjEuNS44LCBgY2xvbmVBdHRhY2hGbmAgd2lsbCB0cnkgdG8gZGVzdHJveSB0aGUgdHJhbnNjbHVzaW9uIHNjb3BlIGlmXG4gICAgICAvLyBgJHRlbXBsYXRlYCBpcyBlbXB0eS4gU2luY2UgdGhlIHRyYW5zY2x1ZGVkIGNvbnRlbnQgY29tZXMgZnJvbSBBbmd1bGFyLCBub3QgQW5ndWxhckpTLFxuICAgICAgLy8gdGhlcmUgd2lsbCBiZSBubyB0cmFuc2NsdXNpb24gc2NvcGUgaGVyZS5cbiAgICAgIC8vIFByb3ZpZGUgYSBkdW1teSBgc2NvcGUuJGRlc3Ryb3koKWAgbWV0aG9kIHRvIHByZXZlbnQgYGNsb25lQXR0YWNoRm5gIGZyb20gdGhyb3dpbmcuXG4gICAgICBzY29wZSA9IHNjb3BlIHx8IHskZGVzdHJveTogKCkgPT4gdW5kZWZpbmVkfTtcbiAgICAgIHJldHVybiBjbG9uZUF0dGFjaEZuICEoJHRlbXBsYXRlLCBzY29wZSk7XG4gICAgfTtcbiAgICBsZXQgJHRlbXBsYXRlID0gY29udGVudENoaWxkTm9kZXM7XG5cbiAgICBpZiAodHJhbnNjbHVkZSkge1xuICAgICAgY29uc3Qgc2xvdHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgICBpZiAodHlwZW9mIHRyYW5zY2x1ZGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICR0ZW1wbGF0ZSA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHNsb3RNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBjb25zdCBmaWxsZWRTbG90cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgICAgLy8gUGFyc2UgdGhlIGVsZW1lbnQgc2VsZWN0b3JzLlxuICAgICAgICBPYmplY3Qua2V5cyh0cmFuc2NsdWRlKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBsZXQgc2VsZWN0b3IgPSB0cmFuc2NsdWRlW3Nsb3ROYW1lXTtcbiAgICAgICAgICBjb25zdCBvcHRpb25hbCA9IHNlbGVjdG9yLmNoYXJBdCgwKSA9PT0gJz8nO1xuICAgICAgICAgIHNlbGVjdG9yID0gb3B0aW9uYWwgPyBzZWxlY3Rvci5zdWJzdHJpbmcoMSkgOiBzZWxlY3RvcjtcblxuICAgICAgICAgIHNsb3RNYXBbc2VsZWN0b3JdID0gc2xvdE5hbWU7XG4gICAgICAgICAgc2xvdHNbc2xvdE5hbWVdID0gbnVsbDsgICAgICAgICAgICAvLyBgbnVsbGA6IERlZmluZWQgYnV0IG5vdCB5ZXQgZmlsbGVkLlxuICAgICAgICAgIGZpbGxlZFNsb3RzW3Nsb3ROYW1lXSA9IG9wdGlvbmFsOyAgLy8gQ29uc2lkZXIgb3B0aW9uYWwgc2xvdHMgYXMgZmlsbGVkLlxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgdGhlIG1hdGNoaW5nIGVsZW1lbnRzIGludG8gdGhlaXIgc2xvdC5cbiAgICAgICAgY29udGVudENoaWxkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICBjb25zdCBzbG90TmFtZSA9IHNsb3RNYXBbZGlyZWN0aXZlTm9ybWFsaXplKG5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKSldO1xuICAgICAgICAgIGlmIChzbG90TmFtZSkge1xuICAgICAgICAgICAgZmlsbGVkU2xvdHNbc2xvdE5hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IHNsb3RzW3Nsb3ROYW1lXSB8fCBbXTtcbiAgICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXS5wdXNoKG5vZGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkdGVtcGxhdGUucHVzaChub2RlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENoZWNrIGZvciByZXF1aXJlZCBzbG90cyB0aGF0IHdlcmUgbm90IGZpbGxlZC5cbiAgICAgICAgT2JqZWN0LmtleXMoZmlsbGVkU2xvdHMpLmZvckVhY2goc2xvdE5hbWUgPT4ge1xuICAgICAgICAgIGlmICghZmlsbGVkU2xvdHNbc2xvdE5hbWVdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVpcmVkIHRyYW5zY2x1c2lvbiBzbG90ICcke3Nsb3ROYW1lfScgb24gZGlyZWN0aXZlOiAke3RoaXMubmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5rZXlzKHNsb3RzKS5maWx0ZXIoc2xvdE5hbWUgPT4gc2xvdHNbc2xvdE5hbWVdKS5mb3JFYWNoKHNsb3ROYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlcyA9IHNsb3RzW3Nsb3ROYW1lXTtcbiAgICAgICAgICBzbG90c1tzbG90TmFtZV0gPSAoc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBjbG9uZUF0dGFjaDogYW5ndWxhci5JQ2xvbmVBdHRhY2hGdW5jdGlvbikgPT5cbiAgICAgICAgICAgICAgY2xvbmVBdHRhY2ggIShub2Rlcywgc2NvcGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQXR0YWNoIGAkJHNsb3RzYCB0byBkZWZhdWx0IHNsb3QgdHJhbnNjbHVkZSBmbi5cbiAgICAgIGF0dGFjaENoaWxkcmVuRm4uJCRzbG90cyA9IHNsb3RzO1xuXG4gICAgICAvLyBBbmd1bGFySlMgdjEuNisgaWdub3JlcyBlbXB0eSBvciB3aGl0ZXNwYWNlLW9ubHkgdHJhbnNjbHVkZWQgdGV4dCBub2Rlcy4gQnV0IEFuZ3VsYXJcbiAgICAgIC8vIHJlbW92ZXMgYWxsIHRleHQgY29udGVudCBhZnRlciB0aGUgZmlyc3QgaW50ZXJwb2xhdGlvbiBhbmQgdXBkYXRlcyBpdCBsYXRlciwgYWZ0ZXJcbiAgICAgIC8vIGV2YWx1YXRpbmcgdGhlIGV4cHJlc3Npb25zLiBUaGlzIHdvdWxkIHJlc3VsdCBpbiBBbmd1bGFySlMgZmFpbGluZyB0byByZWNvZ25pemUgdGV4dFxuICAgICAgLy8gbm9kZXMgdGhhdCBzdGFydCB3aXRoIGFuIGludGVycG9sYXRpb24gYXMgdHJhbnNjbHVkZWQgY29udGVudCBhbmQgdXNlIHRoZSBmYWxsYmFja1xuICAgICAgLy8gY29udGVudCBpbnN0ZWFkLlxuICAgICAgLy8gVG8gYXZvaWQgdGhpcyBpc3N1ZSwgd2UgYWRkIGFcbiAgICAgIC8vIFt6ZXJvLXdpZHRoIG5vbi1qb2luZXIgY2hhcmFjdGVyXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9aZXJvLXdpZHRoX25vbi1qb2luZXIpXG4gICAgICAvLyB0byBlbXB0eSB0ZXh0IG5vZGVzICh3aGljaCBjYW4gb25seSBiZSBhIHJlc3VsdCBvZiBBbmd1bGFyIHJlbW92aW5nIHRoZWlyIGluaXRpYWwgY29udGVudCkuXG4gICAgICAvLyBOT1RFOiBUcmFuc2NsdWRlZCB0ZXh0IGNvbnRlbnQgdGhhdCBzdGFydHMgd2l0aCB3aGl0ZXNwYWNlIGZvbGxvd2VkIGJ5IGFuIGludGVycG9sYXRpb25cbiAgICAgIC8vICAgICAgIHdpbGwgc3RpbGwgZmFpbCB0byBiZSBkZXRlY3RlZCBieSBBbmd1bGFySlMgdjEuNitcbiAgICAgICR0ZW1wbGF0ZS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUgJiYgIW5vZGUubm9kZVZhbHVlKSB7XG4gICAgICAgICAgbm9kZS5ub2RlVmFsdWUgPSAnXFx1MjAwQyc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBhdHRhY2hDaGlsZHJlbkZuO1xuICB9XG5cbiAgcmVzb2x2ZUFuZEJpbmRSZXF1aXJlZENvbnRyb2xsZXJzKGNvbnRyb2xsZXJJbnN0YW5jZTogSUNvbnRyb2xsZXJJbnN0YW5jZXxudWxsKSB7XG4gICAgY29uc3QgZGlyZWN0aXZlUmVxdWlyZSA9IHRoaXMuZ2V0RGlyZWN0aXZlUmVxdWlyZSgpO1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPSB0aGlzLnJlc29sdmVSZXF1aXJlKGRpcmVjdGl2ZVJlcXVpcmUpO1xuXG4gICAgaWYgKGNvbnRyb2xsZXJJbnN0YW5jZSAmJiB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyICYmIGlzTWFwKGRpcmVjdGl2ZVJlcXVpcmUpKSB7XG4gICAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzTWFwID0gcmVxdWlyZWRDb250cm9sbGVycyBhc3tba2V5OiBzdHJpbmddOiBJQ29udHJvbGxlckluc3RhbmNlfTtcbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmVkQ29udHJvbGxlcnNNYXApLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29udHJvbGxlckluc3RhbmNlW2tleV0gPSByZXF1aXJlZENvbnRyb2xsZXJzTWFwW2tleV07XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVxdWlyZWRDb250cm9sbGVycztcbiAgfVxuXG4gIHByaXZhdGUgY29tcGlsZUh0bWwoaHRtbDogc3RyaW5nKTogYW5ndWxhci5JTGlua0ZuIHtcbiAgICB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID0gaHRtbDtcbiAgICByZXR1cm4gdGhpcy4kY29tcGlsZSh0aGlzLmVsZW1lbnQuY2hpbGROb2Rlcyk7XG4gIH1cblxuICBwcml2YXRlIGV4dHJhY3RDaGlsZE5vZGVzKCk6IE5vZGVbXSB7XG4gICAgY29uc3QgY2hpbGROb2RlczogTm9kZVtdID0gW107XG4gICAgbGV0IGNoaWxkTm9kZTogTm9kZXxudWxsO1xuXG4gICAgd2hpbGUgKGNoaWxkTm9kZSA9IHRoaXMuZWxlbWVudC5maXJzdENoaWxkKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQoY2hpbGROb2RlKTtcbiAgICAgIGNoaWxkTm9kZXMucHVzaChjaGlsZE5vZGUpO1xuICAgIH1cblxuICAgIHJldHVybiBjaGlsZE5vZGVzO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXREaXJlY3RpdmVSZXF1aXJlKCk6IGFuZ3VsYXIuRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5IHtcbiAgICBjb25zdCByZXF1aXJlID0gdGhpcy5kaXJlY3RpdmUucmVxdWlyZSB8fCAodGhpcy5kaXJlY3RpdmUuY29udHJvbGxlciAmJiB0aGlzLmRpcmVjdGl2ZS5uYW1lKSAhO1xuXG4gICAgaWYgKGlzTWFwKHJlcXVpcmUpKSB7XG4gICAgICBPYmplY3Qua2V5cyhyZXF1aXJlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gcmVxdWlyZVtrZXldO1xuICAgICAgICBjb25zdCBtYXRjaCA9IHZhbHVlLm1hdGNoKFJFUVVJUkVfUFJFRklYX1JFKSAhO1xuICAgICAgICBjb25zdCBuYW1lID0gdmFsdWUuc3Vic3RyaW5nKG1hdGNoWzBdLmxlbmd0aCk7XG5cbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgcmVxdWlyZVtrZXldID0gbWF0Y2hbMF0gKyBrZXk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1aXJlO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNvbHZlUmVxdWlyZShyZXF1aXJlOiBhbmd1bGFyLkRpcmVjdGl2ZVJlcXVpcmVQcm9wZXJ0eSwgY29udHJvbGxlckluc3RhbmNlPzogYW55KTpcbiAgICAgIGFuZ3VsYXIuU2luZ2xlT3JMaXN0T3JNYXA8SUNvbnRyb2xsZXJJbnN0YW5jZT58bnVsbCB7XG4gICAgaWYgKCFyZXF1aXJlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmVxdWlyZSkpIHtcbiAgICAgIHJldHVybiByZXF1aXJlLm1hcChyZXEgPT4gdGhpcy5yZXNvbHZlUmVxdWlyZShyZXEpKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXF1aXJlID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgdmFsdWU6IHtba2V5OiBzdHJpbmddOiBJQ29udHJvbGxlckluc3RhbmNlfSA9IHt9O1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZSkuZm9yRWFjaChrZXkgPT4gdmFsdWVba2V5XSA9IHRoaXMucmVzb2x2ZVJlcXVpcmUocmVxdWlyZVtrZXldKSAhKTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXF1aXJlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgbWF0Y2ggPSByZXF1aXJlLm1hdGNoKFJFUVVJUkVfUFJFRklYX1JFKSAhO1xuICAgICAgY29uc3QgaW5oZXJpdFR5cGUgPSBtYXRjaFsxXSB8fCBtYXRjaFszXTtcblxuICAgICAgY29uc3QgbmFtZSA9IHJlcXVpcmUuc3Vic3RyaW5nKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICBjb25zdCBpc09wdGlvbmFsID0gISFtYXRjaFsyXTtcbiAgICAgIGNvbnN0IHNlYXJjaFBhcmVudHMgPSAhIWluaGVyaXRUeXBlO1xuICAgICAgY29uc3Qgc3RhcnRPblBhcmVudCA9IGluaGVyaXRUeXBlID09PSAnXl4nO1xuXG4gICAgICBjb25zdCBjdHJsS2V5ID0gY29udHJvbGxlcktleShuYW1lKTtcbiAgICAgIGNvbnN0IGVsZW0gPSBzdGFydE9uUGFyZW50ID8gdGhpcy4kZWxlbWVudC5wYXJlbnQgISgpIDogdGhpcy4kZWxlbWVudDtcbiAgICAgIGNvbnN0IHZhbHVlID0gc2VhcmNoUGFyZW50cyA/IGVsZW0uaW5oZXJpdGVkRGF0YSAhKGN0cmxLZXkpIDogZWxlbS5kYXRhICEoY3RybEtleSk7XG5cbiAgICAgIGlmICghdmFsdWUgJiYgIWlzT3B0aW9uYWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYFVuYWJsZSB0byBmaW5kIHJlcXVpcmVkICcke3JlcXVpcmV9JyBpbiB1cGdyYWRlZCBkaXJlY3RpdmUgJyR7dGhpcy5uYW1lfScuYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVbnJlY29nbml6ZWQgJ3JlcXVpcmUnIHN5bnRheCBvbiB1cGdyYWRlZCBkaXJlY3RpdmUgJyR7dGhpcy5uYW1lfSc6ICR7cmVxdWlyZX1gKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0T3JDYWxsPFQ+KHByb3BlcnR5OiBUIHwgRnVuY3Rpb24pOiBUIHtcbiAgcmV0dXJuIGlzRnVuY3Rpb24ocHJvcGVydHkpID8gcHJvcGVydHkoKSA6IHByb3BlcnR5O1xufVxuXG4vLyBOT1RFOiBPbmx5IHdvcmtzIGZvciBgdHlwZW9mIFQgIT09ICdvYmplY3QnYC5cbmZ1bmN0aW9uIGlzTWFwPFQ+KHZhbHVlOiBhbmd1bGFyLlNpbmdsZU9yTGlzdE9yTWFwPFQ+KTogdmFsdWUgaXMge1trZXk6IHN0cmluZ106IFR9IHtcbiAgcmV0dXJuIHZhbHVlICYmICFBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG5mdW5jdGlvbiBub3RTdXBwb3J0ZWQobmFtZTogc3RyaW5nLCBmZWF0dXJlOiBzdHJpbmcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBVcGdyYWRlZCBkaXJlY3RpdmUgJyR7bmFtZX0nIGNvbnRhaW5zIHVuc3VwcG9ydGVkIGZlYXR1cmU6ICcke2ZlYXR1cmV9Jy5gKTtcbn1cbiJdfQ==