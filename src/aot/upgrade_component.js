/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter } from '@angular/core';
import * as angular from '../angular_js';
import { looseIdentical } from '../facade/lang';
import { controllerKey } from '../util';
import { $COMPILE, $CONTROLLER, $HTTP_BACKEND, $INJECTOR, $SCOPE, $TEMPLATE_CACHE } from './constants';
var NOT_SUPPORTED = 'NOT_SUPPORTED';
var INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var Bindings = (function () {
    function Bindings() {
        this.twoWayBoundProperties = [];
        this.twoWayBoundLastValues = [];
        this.expressionBoundProperties = [];
        this.propertyToOutputMap = {};
    }
    return Bindings;
}());
/**
 * @experimental
 */
export var UpgradeComponent = (function () {
    function UpgradeComponent(name, elementRef, injector) {
        this.name = name;
        this.elementRef = elementRef;
        this.injector = injector;
        this.controllerInstance = null;
        this.bindingDestination = null;
        this.$injector = injector.get($INJECTOR);
        this.$compile = this.$injector.get($COMPILE);
        this.$templateCache = this.$injector.get($TEMPLATE_CACHE);
        this.$httpBackend = this.$injector.get($HTTP_BACKEND);
        this.$controller = this.$injector.get($CONTROLLER);
        this.element = elementRef.nativeElement;
        this.$element = angular.element(this.element);
        this.directive = this.getDirective(name);
        this.bindings = this.initializeBindings(this.directive);
        this.linkFn = this.compileTemplate(this.directive);
        // We ask for the Angular 1 scope from the Angular 2 injector, since
        // we will put the new component scope onto the new injector for each component
        var $parentScope = injector.get($SCOPE);
        // QUESTION 1: Should we create an isolated scope if the scope is only true?
        // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
        this.$componentScope = $parentScope.$new(!!this.directive.scope);
        var controllerType = this.directive.controller;
        // QUESTION: shouldn't we be building the controller in any case?
        if (this.directive.bindToController) {
            if (controllerType) {
                this.bindingDestination = this.controllerInstance = this.buildController(controllerType, this.$componentScope, this.$element, this.directive.controllerAs);
            }
            else {
                throw new Error("Upgraded directive '" + name + "' specifies 'bindToController' but no controller.");
            }
        }
        else {
            this.bindingDestination = this.$componentScope;
        }
        this.setupOutputs();
    }
    UpgradeComponent.prototype.ngOnInit = function () {
        var _this = this;
        // QUESTION: why not just use $compile instead of reproducing parts of it
        if (!this.directive.bindToController && this.directive.controller) {
            this.controllerInstance = this.buildController(this.directive.controller, this.$componentScope, this.$element, this.directive.controllerAs);
        }
        var attrs = NOT_SUPPORTED;
        var transcludeFn = NOT_SUPPORTED;
        var linkController = this.resolveRequired(this.$element, this.directive.require);
        var link = this.directive.link;
        var preLink = (typeof link == 'object') && link.pre;
        var postLink = (typeof link == 'object') ? link.post : link;
        if (preLink) {
            preLink(this.$componentScope, this.$element, attrs, linkController, transcludeFn);
        }
        var childNodes = [];
        var childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        var attachElement = function (clonedElements, scope) { _this.$element.append(clonedElements); };
        var attachChildNodes = function (scope, cloneAttach) { return cloneAttach(childNodes); };
        this.linkFn(this.$componentScope, attachElement, { parentBoundTranscludeFn: attachChildNodes });
        if (postLink) {
            postLink(this.$componentScope, this.$element, attrs, linkController, transcludeFn);
        }
        if (this.controllerInstance && this.controllerInstance.$onInit) {
            this.controllerInstance.$onInit();
        }
    };
    UpgradeComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach(function (propName) { _this.bindingDestination[propName] = changes[propName].currentValue; });
        if (this.bindingDestination.$onChanges) {
            this.bindingDestination.$onChanges(changes);
        }
    };
    UpgradeComponent.prototype.ngDoCheck = function () {
        var _this = this;
        var twoWayBoundProperties = this.bindings.twoWayBoundProperties;
        var twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
        var propertyToOutputMap = this.bindings.propertyToOutputMap;
        twoWayBoundProperties.forEach(function (propName, idx) {
            var newValue = _this.bindingDestination[propName];
            var oldValue = twoWayBoundLastValues[idx];
            if (!looseIdentical(newValue, oldValue)) {
                var outputName = propertyToOutputMap[propName];
                var eventEmitter = _this[outputName];
                eventEmitter.emit(newValue);
                twoWayBoundLastValues[idx] = newValue;
            }
        });
    };
    UpgradeComponent.prototype.getDirective = function (name) {
        var directives = this.$injector.get(name + 'Directive');
        if (directives.length > 1) {
            throw new Error('Only support single directive definition for: ' + this.name);
        }
        var directive = directives[0];
        if (directive.replace)
            this.notSupported('replace');
        if (directive.terminal)
            this.notSupported('terminal');
        if (directive.compile)
            this.notSupported('compile');
        var link = directive.link;
        // QUESTION: why not support link.post?
        if (typeof link == 'object') {
            if (link.post)
                this.notSupported('link.post');
        }
        return directive;
    };
    UpgradeComponent.prototype.initializeBindings = function (directive) {
        var _this = this;
        var btcIsObject = typeof directive.bindToController === 'object';
        if (btcIsObject && Object.keys(directive.scope).length) {
            throw new Error("Binding definitions on scope and controller at the same time is not supported.");
        }
        var context = (btcIsObject) ? directive.bindToController : directive.scope;
        var bindings = new Bindings();
        if (typeof context == 'object') {
            Object.keys(context).forEach(function (propName) {
                var definition = context[propName];
                var bindingType = definition.charAt(0);
                // QUESTION: What about `=*`? Ignore? Throw? Support?
                switch (bindingType) {
                    case '@':
                    case '<':
                        // We don't need to do anything special. They will be defined as inputs on the
                        // upgraded component facade and the change propagation will be handled by
                        // `ngOnChanges()`.
                        break;
                    case '=':
                        bindings.twoWayBoundProperties.push(propName);
                        bindings.twoWayBoundLastValues.push(INITIAL_VALUE);
                        bindings.propertyToOutputMap[propName] = propName + 'Change';
                        break;
                    case '&':
                        bindings.expressionBoundProperties.push(propName);
                        bindings.propertyToOutputMap[propName] = propName;
                        break;
                    default:
                        var json = JSON.stringify(context);
                        throw new Error("Unexpected mapping '" + bindingType + "' in '" + json + "' in '" + _this.name + "' directive.");
                }
            });
        }
        return bindings;
    };
    UpgradeComponent.prototype.compileTemplate = function (directive) {
        if (this.directive.template !== undefined) {
            return this.compileHtml(getOrCall(this.directive.template));
        }
        else if (this.directive.templateUrl) {
            var url = getOrCall(this.directive.templateUrl);
            var html = this.$templateCache.get(url);
            if (html !== undefined) {
                return this.compileHtml(html);
            }
            else {
                throw new Error('loading directive templates asynchronously is not supported');
            }
        }
        else {
            throw new Error("Directive '" + this.name + "' is not a component, it is missing template.");
        }
    };
    UpgradeComponent.prototype.buildController = function (controllerType, $scope, $element, controllerAs) {
        var locals = { $scope: $scope, $element: $element };
        var controller = this.$controller(controllerType, locals, null, controllerAs);
        $element.data(controllerKey(this.directive.name), controller);
        return controller;
    };
    UpgradeComponent.prototype.resolveRequired = function ($element, require) {
        // TODO
    };
    UpgradeComponent.prototype.setupOutputs = function () {
        var _this = this;
        // Set up the outputs for `=` bindings
        this.bindings.twoWayBoundProperties.forEach(function (propName) {
            var outputName = _this.bindings.propertyToOutputMap[propName];
            _this[outputName] = new EventEmitter();
        });
        // Set up the outputs for `&` bindings
        this.bindings.expressionBoundProperties.forEach(function (propName) {
            var outputName = _this.bindings.propertyToOutputMap[propName];
            var emitter = _this[outputName] = new EventEmitter();
            // QUESTION: Do we want the ng1 component to call the function with `<value>` or with
            //           `{$event: <value>}`. The former is closer to ng2, the latter to ng1.
            _this.bindingDestination[propName] = function (value) { return emitter.emit(value); };
        });
    };
    UpgradeComponent.prototype.notSupported = function (feature) {
        throw new Error("Upgraded directive '" + this.name + "' contains unsupported feature: '" + feature + "'.");
    };
    UpgradeComponent.prototype.compileHtml = function (html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return this.$compile(div.childNodes);
    };
    return UpgradeComponent;
}());
function getOrCall(property) {
    return typeof (property) === 'function' ? property() : property;
}
//# sourceMappingURL=upgrade_component.js.map