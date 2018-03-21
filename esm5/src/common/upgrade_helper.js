/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
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
var /** @type {?} */ REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
/**
 * @record
 */
export function IBindingDestination() { }
function IBindingDestination_tsickle_Closure_declarations() {
    /* TODO: handle strange member:
    [key: string]: any;
    */
    /** @type {?|undefined} */
    IBindingDestination.prototype.$onChanges;
}
/**
 * @record
 */
export function IControllerInstance() { }
function IControllerInstance_tsickle_Closure_declarations() {
    /** @type {?|undefined} */
    IControllerInstance.prototype.$doCheck;
    /** @type {?|undefined} */
    IControllerInstance.prototype.$onDestroy;
    /** @type {?|undefined} */
    IControllerInstance.prototype.$onInit;
    /** @type {?|undefined} */
    IControllerInstance.prototype.$postLink;
}
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
    /**
     * @param {?} $injector
     * @param {?} name
     * @return {?}
     */
    UpgradeHelper.getDirective = /**
     * @param {?} $injector
     * @param {?} name
     * @return {?}
     */
    function ($injector, name) {
        var /** @type {?} */ directives = $injector.get(name + 'Directive');
        if (directives.length > 1) {
            throw new Error("Only support single directive definition for: " + name);
        }
        var /** @type {?} */ directive = directives[0];
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
    /**
     * @param {?} $injector
     * @param {?} directive
     * @param {?=} fetchRemoteTemplate
     * @return {?}
     */
    UpgradeHelper.getTemplate = /**
     * @param {?} $injector
     * @param {?} directive
     * @param {?=} fetchRemoteTemplate
     * @return {?}
     */
    function ($injector, directive, fetchRemoteTemplate) {
        if (fetchRemoteTemplate === void 0) { fetchRemoteTemplate = false; }
        if (directive.template !== undefined) {
            return getOrCall(directive.template);
        }
        else if (directive.templateUrl) {
            var /** @type {?} */ $templateCache_1 = /** @type {?} */ ($injector.get($TEMPLATE_CACHE));
            var /** @type {?} */ url_1 = getOrCall(directive.templateUrl);
            var /** @type {?} */ template = $templateCache_1.get(url_1);
            if (template !== undefined) {
                return template;
            }
            else if (!fetchRemoteTemplate) {
                throw new Error('loading directive templates asynchronously is not supported');
            }
            return new Promise(function (resolve, reject) {
                var /** @type {?} */ $httpBackend = /** @type {?} */ ($injector.get($HTTP_BACKEND));
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
    /**
     * @param {?} controllerType
     * @param {?} $scope
     * @return {?}
     */
    UpgradeHelper.prototype.buildController = /**
     * @param {?} controllerType
     * @param {?} $scope
     * @return {?}
     */
    function (controllerType, $scope) {
        // TODO: Document that we do not pre-assign bindings on the controller instance.
        // Quoted properties below so that this code can be optimized with Closure Compiler.
        var /** @type {?} */ locals = { '$scope': $scope, '$element': this.$element };
        var /** @type {?} */ controller = this.$controller(controllerType, locals, null, this.directive.controllerAs); /** @type {?} */
        ((this.$element.data))(controllerKey(/** @type {?} */ ((this.directive.name))), controller);
        return controller;
    };
    /**
     * @param {?=} template
     * @return {?}
     */
    UpgradeHelper.prototype.compileTemplate = /**
     * @param {?=} template
     * @return {?}
     */
    function (template) {
        if (template === undefined) {
            template = /** @type {?} */ (UpgradeHelper.getTemplate(this.$injector, this.directive));
        }
        return this.compileHtml(template);
    };
    /**
     * @return {?}
     */
    UpgradeHelper.prototype.prepareTransclusion = /**
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ transclude = this.directive.transclude;
        var /** @type {?} */ contentChildNodes = this.extractChildNodes();
        var /** @type {?} */ attachChildrenFn = function (scope, cloneAttachFn) {
            // Since AngularJS v1.5.8, `cloneAttachFn` will try to destroy the transclusion scope if
            // `$template` is empty. Since the transcluded content comes from Angular, not AngularJS,
            // there will be no transclusion scope here.
            // Provide a dummy `scope.$destroy()` method to prevent `cloneAttachFn` from throwing.
            scope = scope || { $destroy: function () { return undefined; } };
            return /** @type {?} */ ((cloneAttachFn))($template, scope);
        };
        var /** @type {?} */ $template = contentChildNodes;
        if (transclude) {
            var /** @type {?} */ slots_1 = Object.create(null);
            if (typeof transclude === 'object') {
                $template = [];
                var /** @type {?} */ slotMap_1 = Object.create(null);
                var /** @type {?} */ filledSlots_1 = Object.create(null);
                // Parse the element selectors.
                Object.keys(transclude).forEach(function (slotName) {
                    var /** @type {?} */ selector = transclude[slotName];
                    var /** @type {?} */ optional = selector.charAt(0) === '?';
                    selector = optional ? selector.substring(1) : selector;
                    slotMap_1[selector] = slotName;
                    slots_1[slotName] = null; // `null`: Defined but not yet filled.
                    filledSlots_1[slotName] = optional; // Consider optional slots as filled.
                });
                // Add the matching elements into their slot.
                contentChildNodes.forEach(function (node) {
                    var /** @type {?} */ slotName = slotMap_1[directiveNormalize(node.nodeName.toLowerCase())];
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
                    var /** @type {?} */ nodes = slots_1[slotName];
                    slots_1[slotName] = function (scope, cloneAttach) { return ((cloneAttach))(nodes, scope); };
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
    /**
     * @param {?} controllerInstance
     * @return {?}
     */
    UpgradeHelper.prototype.resolveAndBindRequiredControllers = /**
     * @param {?} controllerInstance
     * @return {?}
     */
    function (controllerInstance) {
        var /** @type {?} */ directiveRequire = this.getDirectiveRequire();
        var /** @type {?} */ requiredControllers = this.resolveRequire(directiveRequire);
        if (controllerInstance && this.directive.bindToController && isMap(directiveRequire)) {
            var /** @type {?} */ requiredControllersMap_1 = /** @type {?} */ (requiredControllers);
            Object.keys(requiredControllersMap_1).forEach(function (key) {
                controllerInstance[key] = requiredControllersMap_1[key];
            });
        }
        return requiredControllers;
    };
    /**
     * @param {?} html
     * @return {?}
     */
    UpgradeHelper.prototype.compileHtml = /**
     * @param {?} html
     * @return {?}
     */
    function (html) {
        this.element.innerHTML = html;
        return this.$compile(this.element.childNodes);
    };
    /**
     * @return {?}
     */
    UpgradeHelper.prototype.extractChildNodes = /**
     * @return {?}
     */
    function () {
        var /** @type {?} */ childNodes = [];
        var /** @type {?} */ childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        return childNodes;
    };
    /**
     * @return {?}
     */
    UpgradeHelper.prototype.getDirectiveRequire = /**
     * @return {?}
     */
    function () {
        var /** @type {?} */ require = this.directive.require || /** @type {?} */ (((this.directive.controller && this.directive.name)));
        if (isMap(require)) {
            Object.keys(require).forEach(function (key) {
                var /** @type {?} */ value = require[key];
                var /** @type {?} */ match = /** @type {?} */ ((value.match(REQUIRE_PREFIX_RE)));
                var /** @type {?} */ name = value.substring(match[0].length);
                if (!name) {
                    require[key] = match[0] + key;
                }
            });
        }
        return require;
    };
    /**
     * @param {?} require
     * @param {?=} controllerInstance
     * @return {?}
     */
    UpgradeHelper.prototype.resolveRequire = /**
     * @param {?} require
     * @param {?=} controllerInstance
     * @return {?}
     */
    function (require, controllerInstance) {
        var _this = this;
        if (!require) {
            return null;
        }
        else if (Array.isArray(require)) {
            return require.map(function (req) { return _this.resolveRequire(req); });
        }
        else if (typeof require === 'object') {
            var /** @type {?} */ value_1 = {};
            Object.keys(require).forEach(function (key) { return value_1[key] = /** @type {?} */ ((_this.resolveRequire(require[key]))); });
            return value_1;
        }
        else if (typeof require === 'string') {
            var /** @type {?} */ match = /** @type {?} */ ((require.match(REQUIRE_PREFIX_RE)));
            var /** @type {?} */ inheritType = match[1] || match[3];
            var /** @type {?} */ name_1 = require.substring(match[0].length);
            var /** @type {?} */ isOptional = !!match[2];
            var /** @type {?} */ searchParents = !!inheritType;
            var /** @type {?} */ startOnParent = inheritType === '^^';
            var /** @type {?} */ ctrlKey = controllerKey(name_1);
            var /** @type {?} */ elem = startOnParent ? /** @type {?} */ ((this.$element.parent))() : this.$element;
            var /** @type {?} */ value = searchParents ? /** @type {?} */ ((elem.inheritedData))(ctrlKey) : /** @type {?} */ ((elem.data))(ctrlKey);
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
function UpgradeHelper_tsickle_Closure_declarations() {
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
    throw new Error("Upgraded directive '" + name + "' contains unsupported feature: '" + feature + "'.");
}
//# sourceMappingURL=upgrade_helper.js.map