/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject } from '@angular/core/index';
import * as angular from './angular_js';
import { NG1_COMPILE, NG1_CONTROLLER, NG1_HTTP_BACKEND, NG1_SCOPE, NG1_TEMPLATE_CACHE } from './constants';
import { controllerKey } from './util';
const /** @type {?} */ CAMEL_CASE = /([A-Z])/g;
const /** @type {?} */ INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
const /** @type {?} */ NOT_SUPPORTED = 'NOT_SUPPORTED';
export class UpgradeNg1ComponentAdapterBuilder {
    /**
     * @param {?} name
     */
    constructor(name) {
        this.name = name;
        this.inputs = [];
        this.inputsRename = [];
        this.outputs = [];
        this.outputsRename = [];
        this.propertyOutputs = [];
        this.checkProperties = [];
        this.propertyMap = {};
        this.linkFn = null;
        this.directive = null;
        this.$controller = null;
        const selector = name.replace(CAMEL_CASE, (all /** TODO #9100 */, next) => '-' + next.toLowerCase());
        const self = this;
        this.type =
            Directive({ selector: selector, inputs: this.inputsRename, outputs: this.outputsRename })
                .Class({
                constructor: [
                    new Inject(NG1_SCOPE), ElementRef,
                    function (scope, elementRef) {
                        return new UpgradeNg1ComponentAdapter(self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                    }
                ],
                ngOnInit: function () { },
                ngOnChanges: function () { },
                ngDoCheck: function () { },
                ngOnDestroy: function () { },
            });
    }
    /**
     * @param {?} injector
     * @return {?}
     */
    extractDirective(injector) {
        const /** @type {?} */ directives = injector.get(this.name + 'Directive');
        if (directives.length > 1) {
            throw new Error('Only support single directive definition for: ' + this.name);
        }
        const /** @type {?} */ directive = directives[0];
        if (directive.replace)
            this.notSupported('replace');
        if (directive.terminal)
            this.notSupported('terminal');
        const /** @type {?} */ link = directive.link;
        if (typeof link == 'object') {
            if (((link)).post)
                this.notSupported('link.post');
        }
        return directive;
    }
    /**
     * @param {?} feature
     * @return {?}
     */
    notSupported(feature) {
        throw new Error(`Upgraded directive '${this.name}' does not support '${feature}'.`);
    }
    /**
     * @return {?}
     */
    extractBindings() {
        const /** @type {?} */ btcIsObject = typeof this.directive.bindToController === 'object';
        if (btcIsObject && Object.keys(this.directive.scope).length) {
            throw new Error(`Binding definitions on scope and controller at the same time are not supported.`);
        }
        const /** @type {?} */ context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;
        if (typeof context == 'object') {
            for (const name in context) {
                if (((context)).hasOwnProperty(name)) {
                    let /** @type {?} */ localName = context[name];
                    const /** @type {?} */ type = localName.charAt(0);
                    const /** @type {?} */ typeOptions = localName.charAt(1);
                    localName = typeOptions === '?' ? localName.substr(2) : localName.substr(1);
                    localName = localName || name;
                    const /** @type {?} */ outputName = 'output_' + name;
                    const /** @type {?} */ outputNameRename = outputName + ': ' + name;
                    const /** @type {?} */ outputNameRenameChange = outputName + ': ' + name + 'Change';
                    const /** @type {?} */ inputName = 'input_' + name;
                    const /** @type {?} */ inputNameRename = inputName + ': ' + name;
                    switch (type) {
                        case '=':
                            this.propertyOutputs.push(outputName);
                            this.checkProperties.push(localName);
                            this.outputs.push(outputName);
                            this.outputsRename.push(outputNameRenameChange);
                            this.propertyMap[outputName] = localName;
                            this.inputs.push(inputName);
                            this.inputsRename.push(inputNameRename);
                            this.propertyMap[inputName] = localName;
                            break;
                        case '@':
                        // handle the '<' binding of angular 1.5 components
                        case '<':
                            this.inputs.push(inputName);
                            this.inputsRename.push(inputNameRename);
                            this.propertyMap[inputName] = localName;
                            break;
                        case '&':
                            this.outputs.push(outputName);
                            this.outputsRename.push(outputNameRename);
                            this.propertyMap[outputName] = localName;
                            break;
                        default:
                            let /** @type {?} */ json = JSON.stringify(context);
                            throw new Error(`Unexpected mapping '${type}' in '${json}' in '${this.name}' directive.`);
                    }
                }
            }
        }
    }
    /**
     * @param {?} compile
     * @param {?} templateCache
     * @param {?} httpBackend
     * @return {?}
     */
    compileTemplate(compile, templateCache, httpBackend) {
        if (this.directive.template !== undefined) {
            this.linkFn = compileHtml(isFunction(this.directive.template) ? this.directive.template() :
                this.directive.template);
        }
        else if (this.directive.templateUrl) {
            const /** @type {?} */ url = isFunction(this.directive.templateUrl) ? this.directive.templateUrl() :
                this.directive.templateUrl;
            const /** @type {?} */ html = templateCache.get(url);
            if (html !== undefined) {
                this.linkFn = compileHtml(html);
            }
            else {
                return new Promise((resolve, err) => {
                    httpBackend('GET', url, null, (status /** TODO #9100 */, response /** TODO #9100 */) => {
                        if (status == 200) {
                            resolve(this.linkFn = compileHtml(templateCache.put(url, response)));
                        }
                        else {
                            err(`GET ${url} returned ${status}: ${response}`);
                        }
                    });
                });
            }
        }
        else {
            throw new Error(`Directive '${this.name}' is not a component, it is missing template.`);
        }
        return null;
        /**
         * @param {?} html
         * @return {?}
         */
        function compileHtml(html /** TODO #9100 */) {
            const /** @type {?} */ div = document.createElement('div');
            div.innerHTML = html;
            return compile(div.childNodes);
        }
    }
    /**
     * Upgrade ng1 components into Angular.
     * @param {?} exportedComponents
     * @param {?} injector
     * @return {?}
     */
    static resolve(exportedComponents, injector) {
        const /** @type {?} */ promises = [];
        const /** @type {?} */ compile = injector.get(NG1_COMPILE);
        const /** @type {?} */ templateCache = injector.get(NG1_TEMPLATE_CACHE);
        const /** @type {?} */ httpBackend = injector.get(NG1_HTTP_BACKEND);
        const /** @type {?} */ $controller = injector.get(NG1_CONTROLLER);
        for (const name in exportedComponents) {
            if (((exportedComponents)).hasOwnProperty(name)) {
                const /** @type {?} */ exportedComponent = exportedComponents[name];
                exportedComponent.directive = exportedComponent.extractDirective(injector);
                exportedComponent.$controller = $controller;
                exportedComponent.extractBindings();
                const /** @type {?} */ promise = exportedComponent.compileTemplate(compile, templateCache, httpBackend);
                if (promise)
                    promises.push(promise);
            }
        }
        return Promise.all(promises);
    }
}
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
    UpgradeNg1ComponentAdapterBuilder.prototype.linkFn;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.directive;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.$controller;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.name;
}
class UpgradeNg1ComponentAdapter {
    /**
     * @param {?} linkFn
     * @param {?} scope
     * @param {?} directive
     * @param {?} elementRef
     * @param {?} $controller
     * @param {?} inputs
     * @param {?} outputs
     * @param {?} propOuts
     * @param {?} checkProperties
     * @param {?} propertyMap
     */
    constructor(linkFn, scope, directive, elementRef, $controller, inputs, outputs, propOuts, checkProperties, propertyMap) {
        this.linkFn = linkFn;
        this.directive = directive;
        this.$controller = $controller;
        this.inputs = inputs;
        this.outputs = outputs;
        this.propOuts = propOuts;
        this.checkProperties = checkProperties;
        this.propertyMap = propertyMap;
        this.controllerInstance = null;
        this.destinationObj = null;
        this.checkLastValues = [];
        this.$element = null;
        this.element = elementRef.nativeElement;
        this.componentScope = scope.$new(!!directive.scope);
        this.$element = angular.element(this.element);
        const controllerType = directive.controller;
        if (directive.bindToController && controllerType) {
            this.controllerInstance = this.buildController(controllerType);
            this.destinationObj = this.controllerInstance;
        }
        else {
            this.destinationObj = this.componentScope;
        }
        for (let i = 0; i < inputs.length; i++) {
            this[inputs[i]] = null;
        }
        for (let j = 0; j < outputs.length; j++) {
            const emitter = this[outputs[j]] = new EventEmitter();
            this.setComponentProperty(outputs[j], ((emitter /** TODO #9100 */) => (value /** TODO #9100 */) => emitter.emit(value))(emitter));
        }
        for (let k = 0; k < propOuts.length; k++) {
            this[propOuts[k]] = new EventEmitter();
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        if (!this.directive.bindToController && this.directive.controller) {
            this.controllerInstance = this.buildController(this.directive.controller);
        }
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        let /** @type {?} */ link = this.directive.link;
        if (typeof link == 'object')
            link = ((link)).pre;
        if (link) {
            const /** @type {?} */ attrs = NOT_SUPPORTED;
            const /** @type {?} */ transcludeFn = NOT_SUPPORTED;
            const /** @type {?} */ linkController = this.resolveRequired(this.$element, this.directive.require);
            ((this.directive.link))(this.componentScope, this.$element, attrs, linkController, transcludeFn);
        }
        const /** @type {?} */ childNodes = [];
        let /** @type {?} */ childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        this.linkFn(this.componentScope, (clonedElement, scope) => {
            for (let /** @type {?} */ i = 0, /** @type {?} */ ii = clonedElement.length; i < ii; i++) {
                this.element.appendChild(clonedElement[i]);
            }
        }, {
            parentBoundTranscludeFn: (scope /** TODO #9100 */, cloneAttach /** TODO #9100 */) => { cloneAttach(childNodes); }
        });
        if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
            this.controllerInstance.$postLink();
        }
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        const /** @type {?} */ ng1Changes = {};
        Object.keys(changes).forEach(name => {
            const /** @type {?} */ change = changes[name];
            this.setComponentProperty(name, change.currentValue);
            ng1Changes[this.propertyMap[name]] = change;
        });
        if (isFunction(this.destinationObj.$onChanges)) {
            this.destinationObj.$onChanges(ng1Changes);
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        const /** @type {?} */ destinationObj = this.destinationObj;
        const /** @type {?} */ lastValues = this.checkLastValues;
        const /** @type {?} */ checkProperties = this.checkProperties;
        for (let /** @type {?} */ i = 0; i < checkProperties.length; i++) {
            const /** @type {?} */ value = destinationObj[checkProperties[i]];
            const /** @type {?} */ last = lastValues[i];
            if (value !== last) {
                if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {
                }
                else {
                    const /** @type {?} */ eventEmitter = ((this) /** TODO #9100 */)[this.propOuts[i]];
                    eventEmitter.emit(lastValues[i] = value);
                }
            }
        }
        if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
            this.controllerInstance.$doCheck();
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.controllerInstance && isFunction(this.controllerInstance.$onDestroy)) {
            this.controllerInstance.$onDestroy();
        }
    }
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    setComponentProperty(name, value) {
        this.destinationObj[this.propertyMap[name]] = value;
    }
    /**
     * @param {?} controllerType
     * @return {?}
     */
    buildController(controllerType /** TODO #9100 */) {
        const /** @type {?} */ locals = { $scope: this.componentScope, $element: this.$element };
        const /** @type {?} */ controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);
        this.$element.data(controllerKey(this.directive.name), controller);
        return controller;
    }
    /**
     * @param {?} $element
     * @param {?} require
     * @return {?}
     */
    resolveRequired($element, require) {
        if (!require) {
            return undefined;
        }
        else if (typeof require == 'string') {
            let /** @type {?} */ name = (require);
            let /** @type {?} */ isOptional = false;
            let /** @type {?} */ startParent = false;
            let /** @type {?} */ searchParents = false;
            if (name.charAt(0) == '?') {
                isOptional = true;
                name = name.substr(1);
            }
            if (name.charAt(0) == '^') {
                searchParents = true;
                name = name.substr(1);
            }
            if (name.charAt(0) == '^') {
                startParent = true;
                name = name.substr(1);
            }
            const /** @type {?} */ key = controllerKey(name);
            if (startParent)
                $element = $element.parent();
            const /** @type {?} */ dep = searchParents ? $element.inheritedData(key) : $element.data(key);
            if (!dep && !isOptional) {
                throw new Error(`Can not locate '${require}' in '${this.directive.name}'.`);
            }
            return dep;
        }
        else if (require instanceof Array) {
            const /** @type {?} */ deps = [];
            for (let /** @type {?} */ i = 0; i < require.length; i++) {
                deps.push(this.resolveRequired($element, require[i]));
            }
            return deps;
        }
        throw new Error(`Directive '${this.directive.name}' require syntax unrecognized: ${this.directive.require}`);
    }
}
function UpgradeNg1ComponentAdapter_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.controllerInstance;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.destinationObj;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.checkLastValues;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.componentScope;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.element;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.$element;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.linkFn;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.directive;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.$controller;
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
/**
 * @param {?} value
 * @return {?}
 */
function isFunction(value) {
    return typeof value === 'function';
}
//# sourceMappingURL=upgrade_ng1_adapter.js.map