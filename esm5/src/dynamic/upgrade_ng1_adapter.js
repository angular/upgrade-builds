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
import { Directive, ElementRef, EventEmitter, Inject, Injector } from '@angular/core';
import * as angular from '../common/angular1';
import { $SCOPE } from '../common/constants';
import { UpgradeHelper } from '../common/upgrade_helper';
import { isFunction, strictEquals } from '../common/util';
var /** @type {?} */ CAMEL_CASE = /([A-Z])/g;
var /** @type {?} */ INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var /** @type {?} */ NOT_SUPPORTED = 'NOT_SUPPORTED';
var UpgradeNg1ComponentAdapterBuilder = /** @class */ (function () {
    function UpgradeNg1ComponentAdapterBuilder(name) {
        this.name = name;
        this.inputs = [];
        this.inputsRename = [];
        this.outputs = [];
        this.outputsRename = [];
        this.propertyOutputs = [];
        this.checkProperties = [];
        this.propertyMap = {};
        this.directive = null;
        var /** @type {?} */ selector = name.replace(CAMEL_CASE, function (all, next) { return '-' + next.toLowerCase(); });
        var /** @type {?} */ self = this;
        // Note: There is a bug in TS 2.4 that prevents us from
        // inlining this into @Directive
        // TODO(tbosch): find or file a bug against TypeScript for this.
        var /** @type {?} */ directive = { selector: selector, inputs: this.inputsRename, outputs: this.outputsRename };
        var MyClass = /** @class */ (function () {
            function MyClass(scope, injector, elementRef) {
                var /** @type {?} */ helper = new UpgradeHelper(injector, name, elementRef, this.directive);
                return /** @type {?} */ (new UpgradeNg1ComponentAdapter(helper, scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap));
            }
            /**
             * @return {?}
             */
            MyClass.prototype.ngOnInit = /**
             * @return {?}
             */
            function () {
                /* needs to be here for ng2 to properly detect it */
            };
            /**
             * @return {?}
             */
            MyClass.prototype.ngOnChanges = /**
             * @return {?}
             */
            function () {
                /* needs to be here for ng2 to properly detect it */
            };
            /**
             * @return {?}
             */
            MyClass.prototype.ngDoCheck = /**
             * @return {?}
             */
            function () {
                /* needs to be here for ng2 to properly detect it */
            };
            /**
             * @return {?}
             */
            MyClass.prototype.ngOnDestroy = /**
             * @return {?}
             */
            function () {
                /* needs to be here for ng2 to properly detect it */
            };
            MyClass.decorators = [
                { type: Directive, args: [directive,] },
            ];
            /** @nocollapse */
            MyClass.ctorParameters = function () { return [
                { type: undefined, decorators: [{ type: Inject, args: [$SCOPE,] },] },
                { type: Injector, },
                { type: ElementRef, },
            ]; };
            return MyClass;
        }());
        function MyClass_tsickle_Closure_declarations() {
            /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
            MyClass.decorators;
            /**
             * @nocollapse
             * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
             */
            MyClass.ctorParameters;
            /** @type {?} */
            MyClass.prototype.directive;
        }
        this.type = MyClass;
    }
    /**
     * @return {?}
     */
    UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = /**
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ btcIsObject = typeof /** @type {?} */ ((this.directive)).bindToController === 'object';
        if (btcIsObject && Object.keys(/** @type {?} */ ((/** @type {?} */ ((this.directive)).scope))).length) {
            throw new Error("Binding definitions on scope and controller at the same time are not supported.");
        }
        var /** @type {?} */ context = (btcIsObject) ? /** @type {?} */ ((this.directive)).bindToController : /** @type {?} */ ((this.directive)).scope;
        if (typeof context == 'object') {
            Object.keys(context).forEach(function (propName) {
                var /** @type {?} */ definition = context[propName];
                var /** @type {?} */ bindingType = definition.charAt(0);
                var /** @type {?} */ bindingOptions = definition.charAt(1);
                var /** @type {?} */ attrName = definition.substring(bindingOptions === '?' ? 2 : 1) || propName;
                // QUESTION: What about `=*`? Ignore? Throw? Support?
                var /** @type {?} */ inputName = "input_" + attrName;
                var /** @type {?} */ inputNameRename = inputName + ": " + attrName;
                var /** @type {?} */ outputName = "output_" + attrName;
                var /** @type {?} */ outputNameRename = outputName + ": " + attrName;
                var /** @type {?} */ outputNameRenameChange = outputNameRename + "Change";
                switch (bindingType) {
                    case '@':
                    case '<':
                        _this.inputs.push(inputName);
                        _this.inputsRename.push(inputNameRename);
                        _this.propertyMap[inputName] = propName;
                        break;
                    case '=':
                        _this.inputs.push(inputName);
                        _this.inputsRename.push(inputNameRename);
                        _this.propertyMap[inputName] = propName;
                        _this.outputs.push(outputName);
                        _this.outputsRename.push(outputNameRenameChange);
                        _this.propertyMap[outputName] = propName;
                        _this.checkProperties.push(propName);
                        _this.propertyOutputs.push(outputName);
                        break;
                    case '&':
                        _this.outputs.push(outputName);
                        _this.outputsRename.push(outputNameRename);
                        _this.propertyMap[outputName] = propName;
                        break;
                    default:
                        var /** @type {?} */ json = JSON.stringify(context);
                        throw new Error("Unexpected mapping '" + bindingType + "' in '" + json + "' in '" + _this.name + "' directive.");
                }
            });
        }
    };
    /**
     * Upgrade ng1 components into Angular.
     */
    /**
     * Upgrade ng1 components into Angular.
     * @param {?} exportedComponents
     * @param {?} $injector
     * @return {?}
     */
    UpgradeNg1ComponentAdapterBuilder.resolve = /**
     * Upgrade ng1 components into Angular.
     * @param {?} exportedComponents
     * @param {?} $injector
     * @return {?}
     */
    function (exportedComponents, $injector) {
        var /** @type {?} */ promises = Object.keys(exportedComponents).map(function (name) {
            var /** @type {?} */ exportedComponent = exportedComponents[name];
            exportedComponent.directive = UpgradeHelper.getDirective($injector, name);
            exportedComponent.extractBindings();
            return Promise
                .resolve(UpgradeHelper.getTemplate($injector, exportedComponent.directive, true))
                .then(function (template) { return exportedComponent.template = template; });
        });
        return Promise.all(promises);
    };
    return UpgradeNg1ComponentAdapterBuilder;
}());
export { UpgradeNg1ComponentAdapterBuilder };
function UpgradeNg1ComponentAdapterBuilder_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.type;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.inputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.inputsRename;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.outputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.outputsRename;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.propertyOutputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.checkProperties;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.propertyMap;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.directive;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.template;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.name;
}
var UpgradeNg1ComponentAdapter = /** @class */ (function () {
    function UpgradeNg1ComponentAdapter(helper, scope, template, inputs, outputs, propOuts, checkProperties, propertyMap) {
        this.helper = helper;
        this.template = template;
        this.inputs = inputs;
        this.outputs = outputs;
        this.propOuts = propOuts;
        this.checkProperties = checkProperties;
        this.propertyMap = propertyMap;
        this.controllerInstance = null;
        this.destinationObj = null;
        this.checkLastValues = [];
        this.$element = null;
        this.directive = helper.directive;
        this.element = helper.element;
        this.$element = helper.$element;
        this.componentScope = scope.$new(!!this.directive.scope);
        var /** @type {?} */ controllerType = this.directive.controller;
        if (this.directive.bindToController && controllerType) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
            this.destinationObj = this.controllerInstance;
        }
        else {
            this.destinationObj = this.componentScope;
        }
        for (var /** @type {?} */ i = 0; i < inputs.length; i++) {
            (/** @type {?} */ (this))[inputs[i]] = null;
        }
        for (var /** @type {?} */ j = 0; j < outputs.length; j++) {
            var /** @type {?} */ emitter = (/** @type {?} */ (this))[outputs[j]] = new EventEmitter();
            if (this.propOuts.indexOf(outputs[j]) === -1) {
                this.setComponentProperty(outputs[j], (function (emitter) { return function (value) { return emitter.emit(value); }; })(emitter));
            }
        }
        for (var /** @type {?} */ k = 0; k < propOuts.length; k++) {
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    /**
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.ngOnInit = /**
     * @return {?}
     */
    function () {
        // Collect contents, insert and compile template
        var /** @type {?} */ attachChildNodes = this.helper.prepareTransclusion();
        var /** @type {?} */ linkFn = this.helper.compileTemplate(this.template);
        // Instantiate controller (if not already done so)
        var /** @type {?} */ controllerType = this.directive.controller;
        var /** @type {?} */ bindToController = this.directive.bindToController;
        if (controllerType && !bindToController) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
        }
        // Require other controllers
        var /** @type {?} */ requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
        // Hook: $onInit
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        // Linking
        var /** @type {?} */ link = this.directive.link;
        var /** @type {?} */ preLink = (typeof link == 'object') && (/** @type {?} */ (link)).pre;
        var /** @type {?} */ postLink = (typeof link == 'object') ? (/** @type {?} */ (link)).post : link;
        var /** @type {?} */ attrs = NOT_SUPPORTED;
        var /** @type {?} */ transcludeFn = NOT_SUPPORTED;
        if (preLink) {
            preLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        linkFn(this.componentScope, /** @type {?} */ ((null)), { parentBoundTranscludeFn: attachChildNodes });
        if (postLink) {
            postLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        // Hook: $postLink
        if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
            this.controllerInstance.$postLink();
        }
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.ngOnChanges = /**
     * @param {?} changes
     * @return {?}
     */
    function (changes) {
        var _this = this;
        var /** @type {?} */ ng1Changes = {};
        Object.keys(changes).forEach(function (name) {
            var /** @type {?} */ change = changes[name];
            _this.setComponentProperty(name, change.currentValue);
            ng1Changes[_this.propertyMap[name]] = change;
        });
        if (isFunction(/** @type {?} */ ((this.destinationObj)).$onChanges)) {
            /** @type {?} */ ((/** @type {?} */ ((this.destinationObj)).$onChanges))(ng1Changes);
        }
    };
    /**
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.ngDoCheck = /**
     * @return {?}
     */
    function () {
        var _this = this;
        var /** @type {?} */ destinationObj = this.destinationObj;
        var /** @type {?} */ lastValues = this.checkLastValues;
        var /** @type {?} */ checkProperties = this.checkProperties;
        var /** @type {?} */ propOuts = this.propOuts;
        checkProperties.forEach(function (propName, i) {
            var /** @type {?} */ value = /** @type {?} */ ((destinationObj))[propName];
            var /** @type {?} */ last = lastValues[i];
            if (!strictEquals(last, value)) {
                var /** @type {?} */ eventEmitter = (/** @type {?} */ (_this))[propOuts[i]];
                eventEmitter.emit(lastValues[i] = value);
            }
        });
        if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
            this.controllerInstance.$doCheck();
        }
    };
    /**
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.ngOnDestroy = /**
     * @return {?}
     */
    function () {
        if (this.controllerInstance && isFunction(this.controllerInstance.$onDestroy)) {
            this.controllerInstance.$onDestroy();
        }
        this.componentScope.$destroy();
    };
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.setComponentProperty = /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    function (name, value) {
        /** @type {?} */ ((this.destinationObj))[this.propertyMap[name]] = value;
    };
    return UpgradeNg1ComponentAdapter;
}());
function UpgradeNg1ComponentAdapter_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.controllerInstance;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.destinationObj;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.checkLastValues;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.directive;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.element;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.$element;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.componentScope;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.helper;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.template;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.inputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.outputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.propOuts;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.checkProperties;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.propertyMap;
}
//# sourceMappingURL=upgrade_ng1_adapter.js.map