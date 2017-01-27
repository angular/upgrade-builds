/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter } from '@angular/core/index';
import * as angular from '../angular_js';
import { looseIdentical } from '../facade/lang';
import { controllerKey } from '../util';
import { $COMPILE, $CONTROLLER, $HTTP_BACKEND, $INJECTOR, $SCOPE, $TEMPLATE_CACHE } from './constants';
const /** @type {?} */ REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
const /** @type {?} */ NOT_SUPPORTED = 'NOT_SUPPORTED';
const /** @type {?} */ INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
class Bindings {
    constructor() {
        this.twoWayBoundProperties = [];
        this.twoWayBoundLastValues = [];
        this.expressionBoundProperties = [];
        this.propertyToOutputMap = {};
    }
}
function Bindings_tsickle_Closure_declarations() {
    /** @type {?} */
    Bindings.prototype.twoWayBoundProperties;
    /** @type {?} */
    Bindings.prototype.twoWayBoundLastValues;
    /** @type {?} */
    Bindings.prototype.expressionBoundProperties;
    /** @type {?} */
    Bindings.prototype.propertyToOutputMap;
}
/**
 * \@whatItDoes
 *
 * *Part of the [upgrade/static](/docs/ts/latest/api/#!?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allows an AngularJS component to be used from Angular.
 *
 * \@howToUse
 *
 * Let's assume that you have an AngularJS component called `ng1Hero` that needs
 * to be made available in Angular templates.
 *
 * {\@example upgrade/static/ts/module.ts region="ng1-hero"}
 *
 * We must create a {\@link Directive} that will make this AngularJS component
 * available inside Angular templates.
 *
 * {\@example upgrade/static/ts/module.ts region="ng1-hero-wrapper"}
 *
 * In this example you can see that we must derive from the {\@link UpgradeComponent}
 * base class but also provide an {\@link Directive `\@Directive`} decorator. This is
 * because the AoT compiler requires that this information is statically available at
 * compile time.
 *
 * Note that we must do the following:
 * * specify the directive's selector (`ng1-hero`)
 * * specify all inputs and outputs that the AngularJS component expects
 * * derive from `UpgradeComponent`
 * * call the base class from the constructor, passing
 *   * the AngularJS name of the component (`ng1Hero`)
 *   * the {\@link ElementRef} and {\@link Injector} for the component wrapper
 *
 * \@description
 *
 * A helper class that should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
 * \@experimental
 */
export class UpgradeComponent {
    /**
     * Create a new `UpgradeComponent` instance. You should not normally need to do this.
     * Instead you should derive a new class from this one and call the super constructor
     * from the base class.
     *
     * {\@example upgrade/static/ts/module.ts region="ng1-hero-wrapper" }
     *
     * * The `name` parameter should be the name of the AngularJS directive.
     * * The `elementRef` and `injector` parameters should be acquired from Angular by dependency
     *   injection into the base class constructor.
     *
     * Note that we must manually implement lifecycle hooks that call through to the super class.
     * This is because, at the moment, the AoT compiler is not able to tell that the
     * `UpgradeComponent`
     * already implements them and so does not wire up calls to them at runtime.
     * @param {?} name
     * @param {?} elementRef
     * @param {?} injector
     */
    constructor(name, elementRef, injector) {
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
        // We ask for the AngularJS scope from the Angular injector, since
        // we will put the new component scope onto the new injector for each component
        const $parentScope = injector.get($SCOPE);
        // QUESTION 1: Should we create an isolated scope if the scope is only true?
        // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
        this.$componentScope = $parentScope.$new(!!this.directive.scope);
        const controllerType = this.directive.controller;
        const bindToController = this.directive.bindToController;
        if (controllerType) {
            this.controllerInstance = this.buildController(controllerType, this.$componentScope, this.$element, this.directive.controllerAs);
        }
        else if (bindToController) {
            throw new Error(`Upgraded directive '${name}' specifies 'bindToController' but no controller.`);
        }
        this.bindingDestination = bindToController ? this.controllerInstance : this.$componentScope;
        this.setupOutputs();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        const /** @type {?} */ attrs = NOT_SUPPORTED;
        const /** @type {?} */ transcludeFn = NOT_SUPPORTED;
        const /** @type {?} */ directiveRequire = this.getDirectiveRequire(this.directive);
        const /** @type {?} */ requiredControllers = this.resolveRequire(this.directive.name, this.$element, directiveRequire);
        if (this.directive.bindToController && isMap(directiveRequire)) {
            const /** @type {?} */ requiredControllersMap = (requiredControllers);
            Object.keys(requiredControllersMap).forEach(key => {
                this.controllerInstance[key] = requiredControllersMap[key];
            });
        }
        this.callLifecycleHook('$onInit', this.controllerInstance);
        if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
            const /** @type {?} */ callDoCheck = () => this.callLifecycleHook('$doCheck', this.controllerInstance);
            this.$componentScope.$parent.$watch(callDoCheck);
            callDoCheck();
        }
        const /** @type {?} */ link = this.directive.link;
        const /** @type {?} */ preLink = (typeof link == 'object') && ((link)).pre;
        const /** @type {?} */ postLink = (typeof link == 'object') ? ((link)).post : link;
        if (preLink) {
            preLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        const /** @type {?} */ childNodes = [];
        let /** @type {?} */ childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        const /** @type {?} */ attachElement = (clonedElements, scope) => { this.$element.append(clonedElements); };
        const /** @type {?} */ attachChildNodes = (scope, cloneAttach) => cloneAttach(childNodes);
        this.linkFn(this.$componentScope, attachElement, { parentBoundTranscludeFn: attachChildNodes });
        if (postLink) {
            postLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        this.callLifecycleHook('$postLink', this.controllerInstance);
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach(propName => this.bindingDestination[propName] = changes[propName].currentValue);
        this.callLifecycleHook('$onChanges', this.bindingDestination, changes);
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        const /** @type {?} */ twoWayBoundProperties = this.bindings.twoWayBoundProperties;
        const /** @type {?} */ twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
        const /** @type {?} */ propertyToOutputMap = this.bindings.propertyToOutputMap;
        twoWayBoundProperties.forEach((propName, idx) => {
            const /** @type {?} */ newValue = this.bindingDestination[propName];
            const /** @type {?} */ oldValue = twoWayBoundLastValues[idx];
            if (!looseIdentical(newValue, oldValue)) {
                const /** @type {?} */ outputName = propertyToOutputMap[propName];
                const /** @type {?} */ eventEmitter = ((this))[outputName];
                eventEmitter.emit(newValue);
                twoWayBoundLastValues[idx] = newValue;
            }
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        this.callLifecycleHook('$onDestroy', this.controllerInstance);
        this.$componentScope.$destroy();
    }
    /**
     * @param {?} method
     * @param {?} context
     * @param {?=} arg
     * @return {?}
     */
    callLifecycleHook(method, context, arg) {
        if (context && isFunction(context[method])) {
            context[method](arg);
        }
    }
    /**
     * @param {?} name
     * @return {?}
     */
    getDirective(name) {
        const /** @type {?} */ directives = this.$injector.get(name + 'Directive');
        if (directives.length > 1) {
            throw new Error('Only support single directive definition for: ' + this.name);
        }
        const /** @type {?} */ directive = directives[0];
        if (directive.replace)
            this.notSupported('replace');
        if (directive.terminal)
            this.notSupported('terminal');
        if (directive.compile)
            this.notSupported('compile');
        const /** @type {?} */ link = directive.link;
        // QUESTION: why not support link.post?
        if (typeof link == 'object') {
            if (((link)).post)
                this.notSupported('link.post');
        }
        return directive;
    }
    /**
     * @param {?} directive
     * @return {?}
     */
    getDirectiveRequire(directive) {
        const /** @type {?} */ require = directive.require || (directive.controller && directive.name);
        if (isMap(require)) {
            Object.keys(require).forEach(key => {
                const /** @type {?} */ value = require[key];
                const /** @type {?} */ match = value.match(REQUIRE_PREFIX_RE);
                const /** @type {?} */ name = value.substring(match[0].length);
                if (!name) {
                    require[key] = match[0] + key;
                }
            });
        }
        return require;
    }
    /**
     * @param {?} directive
     * @return {?}
     */
    initializeBindings(directive) {
        const /** @type {?} */ btcIsObject = typeof directive.bindToController === 'object';
        if (btcIsObject && Object.keys(directive.scope).length) {
            throw new Error(`Binding definitions on scope and controller at the same time is not supported.`);
        }
        const /** @type {?} */ context = (btcIsObject) ? directive.bindToController : directive.scope;
        const /** @type {?} */ bindings = new Bindings();
        if (typeof context == 'object') {
            Object.keys(context).forEach(propName => {
                const /** @type {?} */ definition = context[propName];
                const /** @type {?} */ bindingType = definition.charAt(0);
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
                        let /** @type {?} */ json = JSON.stringify(context);
                        throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
                }
            });
        }
        return bindings;
    }
    /**
     * @param {?} directive
     * @return {?}
     */
    compileTemplate(directive) {
        if (this.directive.template !== undefined) {
            return this.compileHtml(getOrCall(this.directive.template));
        }
        else if (this.directive.templateUrl) {
            const /** @type {?} */ url = getOrCall(this.directive.templateUrl);
            const /** @type {?} */ html = (this.$templateCache.get(url));
            if (html !== undefined) {
                return this.compileHtml(html);
            }
            else {
                throw new Error('loading directive templates asynchronously is not supported');
            }
        }
        else {
            throw new Error(`Directive '${this.name}' is not a component, it is missing template.`);
        }
    }
    /**
     * @param {?} controllerType
     * @param {?} $scope
     * @param {?} $element
     * @param {?} controllerAs
     * @return {?}
     */
    buildController(controllerType, $scope, $element, controllerAs) {
        // TODO: Document that we do not pre-assign bindings on the controller instance
        const /** @type {?} */ locals = { $scope, $element };
        const /** @type {?} */ controller = this.$controller(controllerType, locals, null, controllerAs);
        $element.data(controllerKey(this.directive.name), controller);
        return controller;
    }
    /**
     * @param {?} directiveName
     * @param {?} $element
     * @param {?} require
     * @return {?}
     */
    resolveRequire(directiveName, $element, require) {
        if (!require) {
            return null;
        }
        else if (Array.isArray(require)) {
            return require.map(req => this.resolveRequire(directiveName, $element, req));
        }
        else if (typeof require === 'object') {
            const /** @type {?} */ value = {};
            Object.keys(require).forEach(key => value[key] = this.resolveRequire(directiveName, $element, require[key]));
            return value;
        }
        else if (typeof require === 'string') {
            const /** @type {?} */ match = require.match(REQUIRE_PREFIX_RE);
            const /** @type {?} */ inheritType = match[1] || match[3];
            const /** @type {?} */ name = require.substring(match[0].length);
            const /** @type {?} */ isOptional = !!match[2];
            const /** @type {?} */ searchParents = !!inheritType;
            const /** @type {?} */ startOnParent = inheritType === '^^';
            const /** @type {?} */ ctrlKey = controllerKey(name);
            if (startOnParent) {
                $element = $element.parent();
            }
            const /** @type {?} */ value = searchParents ? $element.inheritedData(ctrlKey) : $element.data(ctrlKey);
            if (!value && !isOptional) {
                throw new Error(`Unable to find required '${require}' in upgraded directive '${directiveName}'.`);
            }
            return value;
        }
        else {
            throw new Error(`Unrecognized require syntax on upgraded directive '${directiveName}': ${require}`);
        }
    }
    /**
     * @return {?}
     */
    setupOutputs() {
        // Set up the outputs for `=` bindings
        this.bindings.twoWayBoundProperties.forEach(propName => {
            const /** @type {?} */ outputName = this.bindings.propertyToOutputMap[propName];
            ((this))[outputName] = new EventEmitter();
        });
        // Set up the outputs for `&` bindings
        this.bindings.expressionBoundProperties.forEach(propName => {
            const /** @type {?} */ outputName = this.bindings.propertyToOutputMap[propName];
            const /** @type {?} */ emitter = ((this))[outputName] = new EventEmitter();
            // QUESTION: Do we want the ng1 component to call the function with `<value>` or with
            //           `{$event: <value>}`. The former is closer to ng2, the latter to ng1.
            this.bindingDestination[propName] = (value) => emitter.emit(value);
        });
    }
    /**
     * @param {?} feature
     * @return {?}
     */
    notSupported(feature) {
        throw new Error(`Upgraded directive '${this.name}' contains unsupported feature: '${feature}'.`);
    }
    /**
     * @param {?} html
     * @return {?}
     */
    compileHtml(html) {
        const /** @type {?} */ div = document.createElement('div');
        div.innerHTML = html;
        return this.$compile(div.childNodes);
    }
}
function UpgradeComponent_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeComponent.prototype.$injector;
    /** @type {?} */
    UpgradeComponent.prototype.$compile;
    /** @type {?} */
    UpgradeComponent.prototype.$templateCache;
    /** @type {?} */
    UpgradeComponent.prototype.$httpBackend;
    /** @type {?} */
    UpgradeComponent.prototype.$controller;
    /** @type {?} */
    UpgradeComponent.prototype.element;
    /** @type {?} */
    UpgradeComponent.prototype.$element;
    /** @type {?} */
    UpgradeComponent.prototype.$componentScope;
    /** @type {?} */
    UpgradeComponent.prototype.directive;
    /** @type {?} */
    UpgradeComponent.prototype.bindings;
    /** @type {?} */
    UpgradeComponent.prototype.linkFn;
    /** @type {?} */
    UpgradeComponent.prototype.controllerInstance;
    /** @type {?} */
    UpgradeComponent.prototype.bindingDestination;
    /** @type {?} */
    UpgradeComponent.prototype.name;
    /** @type {?} */
    UpgradeComponent.prototype.elementRef;
    /** @type {?} */
    UpgradeComponent.prototype.injector;
}
/**
 * @param {?} property
 * @return {?}
 */
function getOrCall(property) {
    return isFunction(property) ? property() : property;
}
/**
 * @param {?} value
 * @return {?}
 */
function isFunction(value) {
    return typeof value === 'function';
}
/**
 * @param {?} value
 * @return {?}
 */
function isMap(value) {
    return value && !Array.isArray(value) && typeof value === 'object';
}
//# sourceMappingURL=upgrade_component.js.map