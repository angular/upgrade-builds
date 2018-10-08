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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy91cGdyYWRlL3NyYy9jb21tb24vdXBncmFkZV9oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBSUgsT0FBTyxLQUFLLE9BQU8sTUFBTSxZQUFZLENBQUM7QUFDdEMsT0FBTyxFQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDN0YsT0FBTyxFQUFDLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFHckUsWUFBWTtBQUNaLElBQU0saUJBQWlCLEdBQUcsd0JBQXdCLENBQUM7QUFlbkQsVUFBVTtBQUNWO0lBU0UsdUJBQ1ksUUFBa0IsRUFBVSxJQUFZLEVBQUUsVUFBc0IsRUFDeEUsU0FBOEI7UUFEdEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUFVLFNBQUksR0FBSixJQUFJLENBQVE7UUFFbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7UUFDeEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsSUFBSSxhQUFhLENBQUMsWUFBWSxDQUFD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QUksR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7WUFDdEUsSUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRW5GLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQ1gsOEJBQTRCLE9BQU8saUNBQTRCLElBQUksQ0FBQyxJQUFJLE9BQUksQ0FBQyxDQUFDO2FBQ25GO1lBRUQsT0FBTyxLQUFLLENBQUM7U0FDZDthQUFNO1lBQ0wsTUFBTSxJQUFJLEtBQUssQ0FDWCwwREFBd0QsSUFBSSxDQUFDLElBQUksV0FBTSxPQUFTLENBQUMsQ0FBQztTQUN2RjtJQUNILENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUF0UUQsSUFzUUM7O0FBRUQsbUJBQXNCLFFBQXNCO0lBQzFDLE9BQU8sVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQ3RELENBQUM7QUFFRCxnREFBZ0Q7QUFDaEQsZUFBa0IsS0FBbUM7SUFDbkQsT0FBTyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQztBQUNyRSxDQUFDO0FBRUQsc0JBQXNCLElBQVksRUFBRSxPQUFlO0lBQ2pELE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXVCLElBQUkseUNBQW9DLE9BQU8sT0FBSSxDQUFDLENBQUM7QUFDOUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFbGVtZW50UmVmLCBJbmplY3RvciwgU2ltcGxlQ2hhbmdlc30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRDT01QSUxFLCAkQ09OVFJPTExFUiwgJEhUVFBfQkFDS0VORCwgJElOSkVDVE9SLCAkVEVNUExBVEVfQ0FDSEV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y29udHJvbGxlcktleSwgZGlyZWN0aXZlTm9ybWFsaXplLCBpc0Z1bmN0aW9ufSBmcm9tICcuL3V0aWwnO1xuXG5cbi8vIENvbnN0YW50c1xuY29uc3QgUkVRVUlSRV9QUkVGSVhfUkUgPSAvXihcXF5cXF4/KT8oXFw/KT8oXFxeXFxePyk/LztcblxuLy8gSW50ZXJmYWNlc1xuZXhwb3J0IGludGVyZmFjZSBJQmluZGluZ0Rlc3RpbmF0aW9uIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xuICAkb25DaGFuZ2VzPzogKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNvbnRyb2xsZXJJbnN0YW5jZSBleHRlbmRzIElCaW5kaW5nRGVzdGluYXRpb24ge1xuICAkZG9DaGVjaz86ICgpID0+IHZvaWQ7XG4gICRvbkRlc3Ryb3k/OiAoKSA9PiB2b2lkO1xuICAkb25Jbml0PzogKCkgPT4gdm9pZDtcbiAgJHBvc3RMaW5rPzogKCkgPT4gdm9pZDtcbn1cblxuLy8gQ2xhc3Nlc1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVIZWxwZXIge1xuICBwdWJsaWMgcmVhZG9ubHkgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2U7XG4gIHB1YmxpYyByZWFkb25seSBlbGVtZW50OiBFbGVtZW50O1xuICBwdWJsaWMgcmVhZG9ubHkgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcbiAgcHVibGljIHJlYWRvbmx5IGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlO1xuXG4gIHByaXZhdGUgcmVhZG9ubHkgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlO1xuICBwcml2YXRlIHJlYWRvbmx5ICRjb250cm9sbGVyOiBhbmd1bGFyLklDb250cm9sbGVyU2VydmljZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yLCBwcml2YXRlIG5hbWU6IHN0cmluZywgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICAgIGRpcmVjdGl2ZT86IGFuZ3VsYXIuSURpcmVjdGl2ZSkge1xuICAgIHRoaXMuJGluamVjdG9yID0gaW5qZWN0b3IuZ2V0KCRJTkpFQ1RPUik7XG4gICAgdGhpcy4kY29tcGlsZSA9IHRoaXMuJGluamVjdG9yLmdldCgkQ09NUElMRSk7XG4gICAgdGhpcy4kY29udHJvbGxlciA9IHRoaXMuJGluamVjdG9yLmdldCgkQ09OVFJPTExFUik7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy4kZWxlbWVudCA9IGFuZ3VsYXIuZWxlbWVudCh0aGlzLmVsZW1lbnQpO1xuXG4gICAgdGhpcy5kaXJlY3RpdmUgPSBkaXJlY3RpdmUgfHwgVXBncmFkZUhlbHBlci5nZXREaXJlY3RpdmUodGhpcy4kaW5qZWN0b3IsIG5hbWUpO1xuICB9XG5cbiAgc3RhdGljIGdldERpcmVjdGl2ZSgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSwgbmFtZTogc3RyaW5nKTogYW5ndWxhci5JRGlyZWN0aXZlIHtcbiAgICBjb25zdCBkaXJlY3RpdmVzOiBhbmd1bGFyLklEaXJlY3RpdmVbXSA9ICRpbmplY3Rvci5nZXQobmFtZSArICdEaXJlY3RpdmUnKTtcbiAgICBpZiAoZGlyZWN0aXZlcy5sZW5ndGggPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE9ubHkgc3VwcG9ydCBzaW5nbGUgZGlyZWN0aXZlIGRlZmluaXRpb24gZm9yOiAke25hbWV9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgZGlyZWN0aXZlID0gZGlyZWN0aXZlc1swXTtcblxuICAgIC8vIEFuZ3VsYXJKUyB3aWxsIHRyYW5zZm9ybSBgbGluazogeHl6YCB0byBgY29tcGlsZTogKCkgPT4geHl6YC4gU28gd2UgY2FuIG9ubHkgdGVsbCB0aGVyZSB3YXMgYVxuICAgIC8vIHVzZXItZGVmaW5lZCBgY29tcGlsZWAgaWYgdGhlcmUgaXMgbm8gYGxpbmtgLiBJbiBvdGhlciBjYXNlcywgd2Ugd2lsbCBqdXN0IGlnbm9yZSBgY29tcGlsZWAuXG4gICAgaWYgKGRpcmVjdGl2ZS5jb21waWxlICYmICFkaXJlY3RpdmUubGluaykgbm90U3VwcG9ydGVkKG5hbWUsICdjb21waWxlJyk7XG4gICAgaWYgKGRpcmVjdGl2ZS5yZXBsYWNlKSBub3RTdXBwb3J0ZWQobmFtZSwgJ3JlcGxhY2UnKTtcbiAgICBpZiAoZGlyZWN0aXZlLnRlcm1pbmFsKSBub3RTdXBwb3J0ZWQobmFtZSwgJ3Rlcm1pbmFsJyk7XG5cbiAgICByZXR1cm4gZGlyZWN0aXZlO1xuICB9XG5cbiAgc3RhdGljIGdldFRlbXBsYXRlKFxuICAgICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsIGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlLFxuICAgICAgZmV0Y2hSZW1vdGVUZW1wbGF0ZSA9IGZhbHNlKTogc3RyaW5nfFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKGRpcmVjdGl2ZS50ZW1wbGF0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZ2V0T3JDYWxsPHN0cmluZz4oZGlyZWN0aXZlLnRlbXBsYXRlKTtcbiAgICB9IGVsc2UgaWYgKGRpcmVjdGl2ZS50ZW1wbGF0ZVVybCkge1xuICAgICAgY29uc3QgJHRlbXBsYXRlQ2FjaGUgPSAkaW5qZWN0b3IuZ2V0KCRURU1QTEFURV9DQUNIRSkgYXMgYW5ndWxhci5JVGVtcGxhdGVDYWNoZVNlcnZpY2U7XG4gICAgICBjb25zdCB1cmwgPSBnZXRPckNhbGw8c3RyaW5nPihkaXJlY3RpdmUudGVtcGxhdGVVcmwpO1xuICAgICAgY29uc3QgdGVtcGxhdGUgPSAkdGVtcGxhdGVDYWNoZS5nZXQodXJsKTtcblxuICAgICAgaWYgKHRlbXBsYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgfSBlbHNlIGlmICghZmV0Y2hSZW1vdGVUZW1wbGF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvYWRpbmcgZGlyZWN0aXZlIHRlbXBsYXRlcyBhc3luY2hyb25vdXNseSBpcyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0ICRodHRwQmFja2VuZCA9ICRpbmplY3Rvci5nZXQoJEhUVFBfQkFDS0VORCkgYXMgYW5ndWxhci5JSHR0cEJhY2tlbmRTZXJ2aWNlO1xuICAgICAgICAkaHR0cEJhY2tlbmQoJ0dFVCcsIHVybCwgbnVsbCwgKHN0YXR1czogbnVtYmVyLCByZXNwb25zZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgaWYgKHN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKCR0ZW1wbGF0ZUNhY2hlLnB1dCh1cmwsIHJlc3BvbnNlKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlamVjdChgR0VUIGNvbXBvbmVudCB0ZW1wbGF0ZSBmcm9tICcke3VybH0nIHJldHVybmVkICcke3N0YXR1c306ICR7cmVzcG9uc2V9J2ApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaXJlY3RpdmUgJyR7ZGlyZWN0aXZlLm5hbWV9JyBpcyBub3QgYSBjb21wb25lbnQsIGl0IGlzIG1pc3NpbmcgdGVtcGxhdGUuYCk7XG4gICAgfVxuICB9XG5cbiAgYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlOiBhbmd1bGFyLklDb250cm9sbGVyLCAkc2NvcGU6IGFuZ3VsYXIuSVNjb3BlKSB7XG4gICAgLy8gVE9ETzogRG9jdW1lbnQgdGhhdCB3ZSBkbyBub3QgcHJlLWFzc2lnbiBiaW5kaW5ncyBvbiB0aGUgY29udHJvbGxlciBpbnN0YW5jZS5cbiAgICAvLyBRdW90ZWQgcHJvcGVydGllcyBiZWxvdyBzbyB0aGF0IHRoaXMgY29kZSBjYW4gYmUgb3B0aW1pemVkIHdpdGggQ2xvc3VyZSBDb21waWxlci5cbiAgICBjb25zdCBsb2NhbHMgPSB7JyRzY29wZSc6ICRzY29wZSwgJyRlbGVtZW50JzogdGhpcy4kZWxlbWVudH07XG4gICAgY29uc3QgY29udHJvbGxlciA9IHRoaXMuJGNvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIGxvY2FscywgbnVsbCwgdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlckFzKTtcblxuICAgIHRoaXMuJGVsZW1lbnQuZGF0YSAhKGNvbnRyb2xsZXJLZXkodGhpcy5kaXJlY3RpdmUubmFtZSAhKSwgY29udHJvbGxlcik7XG5cbiAgICByZXR1cm4gY29udHJvbGxlcjtcbiAgfVxuXG4gIGNvbXBpbGVUZW1wbGF0ZSh0ZW1wbGF0ZT86IHN0cmluZyk6IGFuZ3VsYXIuSUxpbmtGbiB7XG4gICAgaWYgKHRlbXBsYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRlbXBsYXRlID0gVXBncmFkZUhlbHBlci5nZXRUZW1wbGF0ZSh0aGlzLiRpbmplY3RvciwgdGhpcy5kaXJlY3RpdmUpIGFzIHN0cmluZztcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jb21waWxlSHRtbCh0ZW1wbGF0ZSk7XG4gIH1cblxuICBvbkRlc3Ryb3koJHNjb3BlOiBhbmd1bGFyLklTY29wZSwgY29udHJvbGxlckluc3RhbmNlPzogYW55KSB7XG4gICAgaWYgKGNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKGNvbnRyb2xsZXJJbnN0YW5jZS4kb25EZXN0cm95KSkge1xuICAgICAgY29udHJvbGxlckluc3RhbmNlLiRvbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgJHNjb3BlLiRkZXN0cm95KCk7XG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VySGFuZGxlciAhKCckZGVzdHJveScpO1xuICB9XG5cbiAgcHJlcGFyZVRyYW5zY2x1c2lvbigpOiBhbmd1bGFyLklMaW5rRm58dW5kZWZpbmVkIHtcbiAgICBjb25zdCB0cmFuc2NsdWRlID0gdGhpcy5kaXJlY3RpdmUudHJhbnNjbHVkZTtcbiAgICBjb25zdCBjb250ZW50Q2hpbGROb2RlcyA9IHRoaXMuZXh0cmFjdENoaWxkTm9kZXMoKTtcbiAgICBjb25zdCBhdHRhY2hDaGlsZHJlbkZuOiBhbmd1bGFyLklMaW5rRm4gPSAoc2NvcGUsIGNsb25lQXR0YWNoRm4pID0+IHtcbiAgICAgIC8vIFNpbmNlIEFuZ3VsYXJKUyB2MS41LjgsIGBjbG9uZUF0dGFjaEZuYCB3aWxsIHRyeSB0byBkZXN0cm95IHRoZSB0cmFuc2NsdXNpb24gc2NvcGUgaWZcbiAgICAgIC8vIGAkdGVtcGxhdGVgIGlzIGVtcHR5LiBTaW5jZSB0aGUgdHJhbnNjbHVkZWQgY29udGVudCBjb21lcyBmcm9tIEFuZ3VsYXIsIG5vdCBBbmd1bGFySlMsXG4gICAgICAvLyB0aGVyZSB3aWxsIGJlIG5vIHRyYW5zY2x1c2lvbiBzY29wZSBoZXJlLlxuICAgICAgLy8gUHJvdmlkZSBhIGR1bW15IGBzY29wZS4kZGVzdHJveSgpYCBtZXRob2QgdG8gcHJldmVudCBgY2xvbmVBdHRhY2hGbmAgZnJvbSB0aHJvd2luZy5cbiAgICAgIHNjb3BlID0gc2NvcGUgfHwgeyRkZXN0cm95OiAoKSA9PiB1bmRlZmluZWR9O1xuICAgICAgcmV0dXJuIGNsb25lQXR0YWNoRm4gISgkdGVtcGxhdGUsIHNjb3BlKTtcbiAgICB9O1xuICAgIGxldCAkdGVtcGxhdGUgPSBjb250ZW50Q2hpbGROb2RlcztcblxuICAgIGlmICh0cmFuc2NsdWRlKSB7XG4gICAgICBjb25zdCBzbG90cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgICAgIGlmICh0eXBlb2YgdHJhbnNjbHVkZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgJHRlbXBsYXRlID0gW107XG5cbiAgICAgICAgY29uc3Qgc2xvdE1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGNvbnN0IGZpbGxlZFNsb3RzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgICAgICAvLyBQYXJzZSB0aGUgZWxlbWVudCBzZWxlY3RvcnMuXG4gICAgICAgIE9iamVjdC5rZXlzKHRyYW5zY2x1ZGUpLmZvckVhY2goc2xvdE5hbWUgPT4ge1xuICAgICAgICAgIGxldCBzZWxlY3RvciA9IHRyYW5zY2x1ZGVbc2xvdE5hbWVdO1xuICAgICAgICAgIGNvbnN0IG9wdGlvbmFsID0gc2VsZWN0b3IuY2hhckF0KDApID09PSAnPyc7XG4gICAgICAgICAgc2VsZWN0b3IgPSBvcHRpb25hbCA/IHNlbGVjdG9yLnN1YnN0cmluZygxKSA6IHNlbGVjdG9yO1xuXG4gICAgICAgICAgc2xvdE1hcFtzZWxlY3Rvcl0gPSBzbG90TmFtZTtcbiAgICAgICAgICBzbG90c1tzbG90TmFtZV0gPSBudWxsOyAgICAgICAgICAgIC8vIGBudWxsYDogRGVmaW5lZCBidXQgbm90IHlldCBmaWxsZWQuXG4gICAgICAgICAgZmlsbGVkU2xvdHNbc2xvdE5hbWVdID0gb3B0aW9uYWw7ICAvLyBDb25zaWRlciBvcHRpb25hbCBzbG90cyBhcyBmaWxsZWQuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCB0aGUgbWF0Y2hpbmcgZWxlbWVudHMgaW50byB0aGVpciBzbG90LlxuICAgICAgICBjb250ZW50Q2hpbGROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAgIGNvbnN0IHNsb3ROYW1lID0gc2xvdE1hcFtkaXJlY3RpdmVOb3JtYWxpemUobm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKV07XG4gICAgICAgICAgaWYgKHNsb3ROYW1lKSB7XG4gICAgICAgICAgICBmaWxsZWRTbG90c1tzbG90TmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgc2xvdHNbc2xvdE5hbWVdID0gc2xvdHNbc2xvdE5hbWVdIHx8IFtdO1xuICAgICAgICAgICAgc2xvdHNbc2xvdE5hbWVdLnB1c2gobm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICR0ZW1wbGF0ZS5wdXNoKG5vZGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHJlcXVpcmVkIHNsb3RzIHRoYXQgd2VyZSBub3QgZmlsbGVkLlxuICAgICAgICBPYmplY3Qua2V5cyhmaWxsZWRTbG90cykuZm9yRWFjaChzbG90TmFtZSA9PiB7XG4gICAgICAgICAgaWYgKCFmaWxsZWRTbG90c1tzbG90TmFtZV0pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUmVxdWlyZWQgdHJhbnNjbHVzaW9uIHNsb3QgJyR7c2xvdE5hbWV9JyBvbiBkaXJlY3RpdmU6ICR7dGhpcy5uYW1lfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgT2JqZWN0LmtleXMoc2xvdHMpLmZpbHRlcihzbG90TmFtZSA9PiBzbG90c1tzbG90TmFtZV0pLmZvckVhY2goc2xvdE5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGVzID0gc2xvdHNbc2xvdE5hbWVdO1xuICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IChzY29wZTogYW5ndWxhci5JU2NvcGUsIGNsb25lQXR0YWNoOiBhbmd1bGFyLklDbG9uZUF0dGFjaEZ1bmN0aW9uKSA9PlxuICAgICAgICAgICAgICBjbG9uZUF0dGFjaCAhKG5vZGVzLCBzY29wZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBdHRhY2ggYCQkc2xvdHNgIHRvIGRlZmF1bHQgc2xvdCB0cmFuc2NsdWRlIGZuLlxuICAgICAgYXR0YWNoQ2hpbGRyZW5Gbi4kJHNsb3RzID0gc2xvdHM7XG5cbiAgICAgIC8vIEFuZ3VsYXJKUyB2MS42KyBpZ25vcmVzIGVtcHR5IG9yIHdoaXRlc3BhY2Utb25seSB0cmFuc2NsdWRlZCB0ZXh0IG5vZGVzLiBCdXQgQW5ndWxhclxuICAgICAgLy8gcmVtb3ZlcyBhbGwgdGV4dCBjb250ZW50IGFmdGVyIHRoZSBmaXJzdCBpbnRlcnBvbGF0aW9uIGFuZCB1cGRhdGVzIGl0IGxhdGVyLCBhZnRlclxuICAgICAgLy8gZXZhbHVhdGluZyB0aGUgZXhwcmVzc2lvbnMuIFRoaXMgd291bGQgcmVzdWx0IGluIEFuZ3VsYXJKUyBmYWlsaW5nIHRvIHJlY29nbml6ZSB0ZXh0XG4gICAgICAvLyBub2RlcyB0aGF0IHN0YXJ0IHdpdGggYW4gaW50ZXJwb2xhdGlvbiBhcyB0cmFuc2NsdWRlZCBjb250ZW50IGFuZCB1c2UgdGhlIGZhbGxiYWNrXG4gICAgICAvLyBjb250ZW50IGluc3RlYWQuXG4gICAgICAvLyBUbyBhdm9pZCB0aGlzIGlzc3VlLCB3ZSBhZGQgYVxuICAgICAgLy8gW3plcm8td2lkdGggbm9uLWpvaW5lciBjaGFyYWN0ZXJdKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1plcm8td2lkdGhfbm9uLWpvaW5lcilcbiAgICAgIC8vIHRvIGVtcHR5IHRleHQgbm9kZXMgKHdoaWNoIGNhbiBvbmx5IGJlIGEgcmVzdWx0IG9mIEFuZ3VsYXIgcmVtb3ZpbmcgdGhlaXIgaW5pdGlhbCBjb250ZW50KS5cbiAgICAgIC8vIE5PVEU6IFRyYW5zY2x1ZGVkIHRleHQgY29udGVudCB0aGF0IHN0YXJ0cyB3aXRoIHdoaXRlc3BhY2UgZm9sbG93ZWQgYnkgYW4gaW50ZXJwb2xhdGlvblxuICAgICAgLy8gICAgICAgd2lsbCBzdGlsbCBmYWlsIHRvIGJlIGRldGVjdGVkIGJ5IEFuZ3VsYXJKUyB2MS42K1xuICAgICAgJHRlbXBsYXRlLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSAmJiAhbm9kZS5ub2RlVmFsdWUpIHtcbiAgICAgICAgICBub2RlLm5vZGVWYWx1ZSA9ICdcXHUyMDBDJztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGF0dGFjaENoaWxkcmVuRm47XG4gIH1cblxuICByZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnMoY29udHJvbGxlckluc3RhbmNlOiBJQ29udHJvbGxlckluc3RhbmNlfG51bGwpIHtcbiAgICBjb25zdCBkaXJlY3RpdmVSZXF1aXJlID0gdGhpcy5nZXREaXJlY3RpdmVSZXF1aXJlKCk7XG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9IHRoaXMucmVzb2x2ZVJlcXVpcmUoZGlyZWN0aXZlUmVxdWlyZSk7XG5cbiAgICBpZiAoY29udHJvbGxlckluc3RhbmNlICYmIHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgJiYgaXNNYXAoZGlyZWN0aXZlUmVxdWlyZSkpIHtcbiAgICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnNNYXAgPSByZXF1aXJlZENvbnRyb2xsZXJzIGFze1trZXk6IHN0cmluZ106IElDb250cm9sbGVySW5zdGFuY2V9O1xuICAgICAgT2JqZWN0LmtleXMocmVxdWlyZWRDb250cm9sbGVyc01hcCkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjb250cm9sbGVySW5zdGFuY2Vba2V5XSA9IHJlcXVpcmVkQ29udHJvbGxlcnNNYXBba2V5XTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXF1aXJlZENvbnRyb2xsZXJzO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21waWxlSHRtbChodG1sOiBzdHJpbmcpOiBhbmd1bGFyLklMaW5rRm4ge1xuICAgIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPSBodG1sO1xuICAgIHJldHVybiB0aGlzLiRjb21waWxlKHRoaXMuZWxlbWVudC5jaGlsZE5vZGVzKTtcbiAgfVxuXG4gIHByaXZhdGUgZXh0cmFjdENoaWxkTm9kZXMoKTogTm9kZVtdIHtcbiAgICBjb25zdCBjaGlsZE5vZGVzOiBOb2RlW10gPSBbXTtcbiAgICBsZXQgY2hpbGROb2RlOiBOb2RlfG51bGw7XG5cbiAgICB3aGlsZSAoY2hpbGROb2RlID0gdGhpcy5lbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZChjaGlsZE5vZGUpO1xuICAgICAgY2hpbGROb2Rlcy5wdXNoKGNoaWxkTm9kZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkTm9kZXM7XG4gIH1cblxuICBwcml2YXRlIGdldERpcmVjdGl2ZVJlcXVpcmUoKTogYW5ndWxhci5EaXJlY3RpdmVSZXF1aXJlUHJvcGVydHkge1xuICAgIGNvbnN0IHJlcXVpcmUgPSB0aGlzLmRpcmVjdGl2ZS5yZXF1aXJlIHx8ICh0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyICYmIHRoaXMuZGlyZWN0aXZlLm5hbWUpICE7XG5cbiAgICBpZiAoaXNNYXAocmVxdWlyZSkpIHtcbiAgICAgIE9iamVjdC5rZXlzKHJlcXVpcmUpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSByZXF1aXJlW2tleV07XG4gICAgICAgIGNvbnN0IG1hdGNoID0gdmFsdWUubWF0Y2goUkVRVUlSRV9QUkVGSVhfUkUpICE7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB2YWx1ZS5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcblxuICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICByZXF1aXJlW2tleV0gPSBtYXRjaFswXSArIGtleTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcXVpcmU7XG4gIH1cblxuICBwcml2YXRlIHJlc29sdmVSZXF1aXJlKHJlcXVpcmU6IGFuZ3VsYXIuRGlyZWN0aXZlUmVxdWlyZVByb3BlcnR5LCBjb250cm9sbGVySW5zdGFuY2U/OiBhbnkpOlxuICAgICAgYW5ndWxhci5TaW5nbGVPckxpc3RPck1hcDxJQ29udHJvbGxlckluc3RhbmNlPnxudWxsIHtcbiAgICBpZiAoIXJlcXVpcmUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXF1aXJlKSkge1xuICAgICAgcmV0dXJuIHJlcXVpcmUubWFwKHJlcSA9PiB0aGlzLnJlc29sdmVSZXF1aXJlKHJlcSkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlcXVpcmUgPT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zdCB2YWx1ZToge1trZXk6IHN0cmluZ106IElDb250cm9sbGVySW5zdGFuY2V9ID0ge307XG4gICAgICBPYmplY3Qua2V5cyhyZXF1aXJlKS5mb3JFYWNoKGtleSA9PiB2YWx1ZVtrZXldID0gdGhpcy5yZXNvbHZlUmVxdWlyZShyZXF1aXJlW2tleV0pICEpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHJlcXVpcmUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBtYXRjaCA9IHJlcXVpcmUubWF0Y2goUkVRVUlSRV9QUkVGSVhfUkUpICE7XG4gICAgICBjb25zdCBpbmhlcml0VHlwZSA9IG1hdGNoWzFdIHx8IG1hdGNoWzNdO1xuXG4gICAgICBjb25zdCBuYW1lID0gcmVxdWlyZS5zdWJzdHJpbmcobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgIGNvbnN0IGlzT3B0aW9uYWwgPSAhIW1hdGNoWzJdO1xuICAgICAgY29uc3Qgc2VhcmNoUGFyZW50cyA9ICEhaW5oZXJpdFR5cGU7XG4gICAgICBjb25zdCBzdGFydE9uUGFyZW50ID0gaW5oZXJpdFR5cGUgPT09ICdeXic7XG5cbiAgICAgIGNvbnN0IGN0cmxLZXkgPSBjb250cm9sbGVyS2V5KG5hbWUpO1xuICAgICAgY29uc3QgZWxlbSA9IHN0YXJ0T25QYXJlbnQgPyB0aGlzLiRlbGVtZW50LnBhcmVudCAhKCkgOiB0aGlzLiRlbGVtZW50O1xuICAgICAgY29uc3QgdmFsdWUgPSBzZWFyY2hQYXJlbnRzID8gZWxlbS5pbmhlcml0ZWREYXRhICEoY3RybEtleSkgOiBlbGVtLmRhdGEgIShjdHJsS2V5KTtcblxuICAgICAgaWYgKCF2YWx1ZSAmJiAhaXNPcHRpb25hbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGZpbmQgcmVxdWlyZWQgJyR7cmVxdWlyZX0nIGluIHVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHt0aGlzLm5hbWV9Jy5gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVucmVjb2duaXplZCAncmVxdWlyZScgc3ludGF4IG9uIHVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHt0aGlzLm5hbWV9JzogJHtyZXF1aXJlfWApO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRPckNhbGw8VD4ocHJvcGVydHk6IFQgfCBGdW5jdGlvbik6IFQge1xuICByZXR1cm4gaXNGdW5jdGlvbihwcm9wZXJ0eSkgPyBwcm9wZXJ0eSgpIDogcHJvcGVydHk7XG59XG5cbi8vIE5PVEU6IE9ubHkgd29ya3MgZm9yIGB0eXBlb2YgVCAhPT0gJ29iamVjdCdgLlxuZnVuY3Rpb24gaXNNYXA8VD4odmFsdWU6IGFuZ3VsYXIuU2luZ2xlT3JMaXN0T3JNYXA8VD4pOiB2YWx1ZSBpcyB7W2tleTogc3RyaW5nXTogVH0ge1xuICByZXR1cm4gdmFsdWUgJiYgIUFycmF5LmlzQXJyYXkodmFsdWUpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCc7XG59XG5cbmZ1bmN0aW9uIG5vdFN1cHBvcnRlZChuYW1lOiBzdHJpbmcsIGZlYXR1cmU6IHN0cmluZykge1xuICB0aHJvdyBuZXcgRXJyb3IoYFVwZ3JhZGVkIGRpcmVjdGl2ZSAnJHtuYW1lfScgY29udGFpbnMgdW5zdXBwb3J0ZWQgZmVhdHVyZTogJyR7ZmVhdHVyZX0nLmApO1xufVxuIl19