/**
 * @license Angular v20.0.0-next.0+sha-51b8ff2
 * (c) 2010-2024 Google LLC. https://angular.io/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { ɵNG_MOD_DEF, Injector, ChangeDetectorRef, Testability, TestabilityRegistry, ApplicationRef, SimpleChange, ɵSIGNAL, NgZone, ComponentFactoryResolver, Version, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, PlatformRef, EventEmitter, Directive, NgModule } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
const noNgElement = (() => noNg());
noNgElement.cleanData = noNg;
let angular = {
    bootstrap: noNg,
    module: noNg,
    element: noNgElement,
    injector: noNg,
    version: undefined,
    resumeBootstrap: noNg,
    getTestability: noNg,
};
try {
    if (window.hasOwnProperty('angular')) {
        angular = window.angular;
    }
}
catch {
    // ignore in CJS mode.
}
/**
 * @deprecated Use `setAngularJSGlobal` instead.
 *
 * @publicApi
 */
function setAngularLib(ng) {
    setAngularJSGlobal(ng);
}
/**
 * @deprecated Use `getAngularJSGlobal` instead.
 *
 * @publicApi
 */
function getAngularLib() {
    return getAngularJSGlobal();
}
/**
 * Resets the AngularJS global.
 *
 * Used when AngularJS is loaded lazily, and not available on `window`.
 *
 * @publicApi
 */
function setAngularJSGlobal(ng) {
    angular = ng;
}
/**
 * Returns the current AngularJS global.
 *
 * @publicApi
 */
function getAngularJSGlobal() {
    return angular;
}
const bootstrap = (e, modules, config) => angular.bootstrap(e, modules, config);
// Do not declare as `module` to avoid webpack bug
// (see https://github.com/angular/angular/issues/30050).
const module_ = (prefix, dependencies) => angular.module(prefix, dependencies);
const element = ((e) => angular.element(e));
element.cleanData = (nodes) => angular.element.cleanData(nodes);
const injector = (modules, strictDi) => angular.injector(modules, strictDi);
const resumeBootstrap = () => angular.resumeBootstrap();
const getTestability = (e) => angular.getTestability(e);

var angular1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    setAngularLib: setAngularLib,
    getAngularLib: getAngularLib,
    setAngularJSGlobal: setAngularJSGlobal,
    getAngularJSGlobal: getAngularJSGlobal,
    bootstrap: bootstrap,
    module_: module_,
    element: element,
    injector: injector,
    resumeBootstrap: resumeBootstrap,
    getTestability: getTestability
});

const $COMPILE = '$compile';
const $CONTROLLER = '$controller';
const $DELEGATE = '$delegate';
const $EXCEPTION_HANDLER = '$exceptionHandler';
const $HTTP_BACKEND = '$httpBackend';
const $INJECTOR = '$injector';
const $INTERVAL = '$interval';
const $PARSE = '$parse';
const $PROVIDE = '$provide';
const $ROOT_ELEMENT = '$rootElement';
const $ROOT_SCOPE = '$rootScope';
const $SCOPE = '$scope';
const $TEMPLATE_CACHE = '$templateCache';
const $TEMPLATE_REQUEST = '$templateRequest';
const $$TESTABILITY = '$$testability';
const COMPILER_KEY = '$$angularCompiler';
const DOWNGRADED_MODULE_COUNT_KEY = '$$angularDowngradedModuleCount';
const GROUP_PROJECTABLE_NODES_KEY = '$$angularGroupProjectableNodes';
const INJECTOR_KEY = '$$angularInjector';
const LAZY_MODULE_REF = '$$angularLazyModuleRef';
const NG_ZONE_KEY = '$$angularNgZone';
const UPGRADE_APP_TYPE_KEY = '$$angularUpgradeAppType';
const REQUIRE_INJECTOR = '?^^' + INJECTOR_KEY;
const REQUIRE_NG_MODEL = '?ngModel';
const UPGRADE_MODULE_NAME = '$$UpgradeModule';

var constants = /*#__PURE__*/Object.freeze({
    __proto__: null,
    $COMPILE: $COMPILE,
    $CONTROLLER: $CONTROLLER,
    $DELEGATE: $DELEGATE,
    $EXCEPTION_HANDLER: $EXCEPTION_HANDLER,
    $HTTP_BACKEND: $HTTP_BACKEND,
    $INJECTOR: $INJECTOR,
    $INTERVAL: $INTERVAL,
    $PARSE: $PARSE,
    $PROVIDE: $PROVIDE,
    $ROOT_ELEMENT: $ROOT_ELEMENT,
    $ROOT_SCOPE: $ROOT_SCOPE,
    $SCOPE: $SCOPE,
    $TEMPLATE_CACHE: $TEMPLATE_CACHE,
    $TEMPLATE_REQUEST: $TEMPLATE_REQUEST,
    $$TESTABILITY: $$TESTABILITY,
    COMPILER_KEY: COMPILER_KEY,
    DOWNGRADED_MODULE_COUNT_KEY: DOWNGRADED_MODULE_COUNT_KEY,
    GROUP_PROJECTABLE_NODES_KEY: GROUP_PROJECTABLE_NODES_KEY,
    INJECTOR_KEY: INJECTOR_KEY,
    LAZY_MODULE_REF: LAZY_MODULE_REF,
    NG_ZONE_KEY: NG_ZONE_KEY,
    UPGRADE_APP_TYPE_KEY: UPGRADE_APP_TYPE_KEY,
    REQUIRE_INJECTOR: REQUIRE_INJECTOR,
    REQUIRE_NG_MODEL: REQUIRE_NG_MODEL,
    UPGRADE_MODULE_NAME: UPGRADE_MODULE_NAME
});

/**
 * A `PropertyBinding` represents a mapping between a property name
 * and an attribute name. It is parsed from a string of the form
 * `"prop: attr"`; or simply `"propAndAttr" where the property
 * and attribute have the same identifier.
 */
class PropertyBinding {
    prop;
    attr;
    bracketAttr;
    bracketParenAttr;
    parenAttr;
    onAttr;
    bindAttr;
    bindonAttr;
    constructor(prop, attr) {
        this.prop = prop;
        this.attr = attr;
        this.bracketAttr = `[${this.attr}]`;
        this.parenAttr = `(${this.attr})`;
        this.bracketParenAttr = `[(${this.attr})]`;
        const capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.slice(1);
        this.onAttr = `on${capitalAttr}`;
        this.bindAttr = `bind${capitalAttr}`;
        this.bindonAttr = `bindon${capitalAttr}`;
    }
}

const DIRECTIVE_PREFIX_REGEXP = /^(?:x|data)[:\-_]/i;
const DIRECTIVE_SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;
function onError(e) {
    // TODO: (misko): We seem to not have a stack trace here!
    console.error(e, e.stack);
    throw e;
}
/**
 * Clean the jqLite/jQuery data on the element and all its descendants.
 * Equivalent to how jqLite/jQuery invoke `cleanData()` on an Element when removed:
 *   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/jqLite.js#L349-L355
 *   https://github.com/jquery/jquery/blob/6984d1747623dbc5e87fd6c261a5b6b1628c107c/src/manipulation.js#L182
 *
 * NOTE:
 * `cleanData()` will also invoke the AngularJS `$destroy` DOM event on the element:
 *   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/Angular.js#L1932-L1945
 *
 * @param node The DOM node whose data needs to be cleaned.
 */
function cleanData(node) {
    element.cleanData([node]);
    if (isParentNode(node)) {
        element.cleanData(node.querySelectorAll('*'));
    }
}
function controllerKey(name) {
    return '$' + name + 'Controller';
}
/**
 * Destroy an AngularJS app given the app `$injector`.
 *
 * NOTE: Destroying an app is not officially supported by AngularJS, but try to do our best by
 *       destroying `$rootScope` and clean the jqLite/jQuery data on `$rootElement` and all
 *       descendants.
 *
 * @param $injector The `$injector` of the AngularJS app to destroy.
 */
function destroyApp($injector) {
    const $rootElement = $injector.get($ROOT_ELEMENT);
    const $rootScope = $injector.get($ROOT_SCOPE);
    $rootScope.$destroy();
    cleanData($rootElement[0]);
}
function directiveNormalize(name) {
    return name
        .replace(DIRECTIVE_PREFIX_REGEXP, '')
        .replace(DIRECTIVE_SPECIAL_CHARS_REGEXP, (_, letter) => letter.toUpperCase());
}
function getTypeName(type) {
    // Return the name of the type or the first line of its stringified version.
    return type.overriddenName || type.name || type.toString().split('\n')[0];
}
function getDowngradedModuleCount($injector) {
    return $injector.has(DOWNGRADED_MODULE_COUNT_KEY)
        ? $injector.get(DOWNGRADED_MODULE_COUNT_KEY)
        : 0;
}
function getUpgradeAppType($injector) {
    return $injector.has(UPGRADE_APP_TYPE_KEY)
        ? $injector.get(UPGRADE_APP_TYPE_KEY)
        : 0 /* UpgradeAppType.None */;
}
function isFunction(value) {
    return typeof value === 'function';
}
function isNgModuleType(value) {
    // NgModule class should have the `ɵmod` static property attached by AOT or JIT compiler.
    return isFunction(value) && !!value[ɵNG_MOD_DEF];
}
function isParentNode(node) {
    return isFunction(node.querySelectorAll);
}
function validateInjectionKey($injector, downgradedModule, injectionKey, attemptedAction) {
    const upgradeAppType = getUpgradeAppType($injector);
    const downgradedModuleCount = getDowngradedModuleCount($injector);
    // Check for common errors.
    switch (upgradeAppType) {
        case 1 /* UpgradeAppType.Dynamic */:
        case 2 /* UpgradeAppType.Static */:
            if (downgradedModule) {
                throw new Error(`Error while ${attemptedAction}: 'downgradedModule' unexpectedly specified.\n` +
                    "You should not specify a value for 'downgradedModule', unless you are downgrading " +
                    "more than one Angular module (via 'downgradeModule()').");
            }
            break;
        case 3 /* UpgradeAppType.Lite */:
            if (!downgradedModule && downgradedModuleCount >= 2) {
                throw new Error(`Error while ${attemptedAction}: 'downgradedModule' not specified.\n` +
                    'This application contains more than one downgraded Angular module, thus you need to ' +
                    "always specify 'downgradedModule' when downgrading components and injectables.");
            }
            if (!$injector.has(injectionKey)) {
                throw new Error(`Error while ${attemptedAction}: Unable to find the specified downgraded module.\n` +
                    'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                    'application?');
            }
            break;
        default:
            throw new Error(`Error while ${attemptedAction}: Not a valid '@angular/upgrade' application.\n` +
                'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                'application?');
    }
}
class Deferred {
    promise;
    resolve;
    reject;
    constructor() {
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
/**
 * @return Whether the passed-in component implements the subset of the
 *     `ControlValueAccessor` interface needed for AngularJS `ng-model`
 *     compatibility.
 */
function supportsNgModel(component) {
    return (typeof component.writeValue === 'function' && typeof component.registerOnChange === 'function');
}
/**
 * Glue the AngularJS `NgModelController` (if it exists) to the component
 * (if it implements the needed subset of the `ControlValueAccessor` interface).
 */
function hookupNgModel(ngModel, component) {
    if (ngModel && supportsNgModel(component)) {
        ngModel.$render = () => {
            component.writeValue(ngModel.$viewValue);
        };
        component.registerOnChange(ngModel.$setViewValue.bind(ngModel));
        if (typeof component.registerOnTouched === 'function') {
            component.registerOnTouched(ngModel.$setTouched.bind(ngModel));
        }
    }
}
/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
function strictEquals(val1, val2) {
    return val1 === val2 || (val1 !== val1 && val2 !== val2);
}

var util = /*#__PURE__*/Object.freeze({
    __proto__: null,
    onError: onError,
    cleanData: cleanData,
    controllerKey: controllerKey,
    destroyApp: destroyApp,
    directiveNormalize: directiveNormalize,
    getTypeName: getTypeName,
    getDowngradedModuleCount: getDowngradedModuleCount,
    getUpgradeAppType: getUpgradeAppType,
    isFunction: isFunction,
    isNgModuleType: isNgModuleType,
    validateInjectionKey: validateInjectionKey,
    Deferred: Deferred,
    hookupNgModel: hookupNgModel,
    strictEquals: strictEquals
});

const INITIAL_VALUE$1 = {
    __UNINITIALIZED__: true,
};
class DowngradeComponentAdapter {
    element;
    attrs;
    scope;
    ngModel;
    parentInjector;
    $compile;
    $parse;
    componentFactory;
    wrapCallback;
    unsafelyOverwriteSignalInputs;
    implementsOnChanges = false;
    inputChangeCount = 0;
    inputChanges = {};
    componentScope;
    constructor(element, attrs, scope, ngModel, parentInjector, $compile, $parse, componentFactory, wrapCallback, unsafelyOverwriteSignalInputs) {
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.ngModel = ngModel;
        this.parentInjector = parentInjector;
        this.$compile = $compile;
        this.$parse = $parse;
        this.componentFactory = componentFactory;
        this.wrapCallback = wrapCallback;
        this.unsafelyOverwriteSignalInputs = unsafelyOverwriteSignalInputs;
        this.componentScope = scope.$new();
    }
    compileContents() {
        const compiledProjectableNodes = [];
        const projectableNodes = this.groupProjectableNodes();
        const linkFns = projectableNodes.map((nodes) => this.$compile(nodes));
        this.element.empty();
        linkFns.forEach((linkFn) => {
            linkFn(this.scope, (clone) => {
                compiledProjectableNodes.push(clone);
                this.element.append(clone);
            });
        });
        return compiledProjectableNodes;
    }
    createComponentAndSetup(projectableNodes, manuallyAttachView = false, propagateDigest = true) {
        const component = this.createComponent(projectableNodes);
        this.setupInputs(manuallyAttachView, propagateDigest, component);
        this.setupOutputs(component.componentRef);
        this.registerCleanup(component.componentRef);
        return component.componentRef;
    }
    createComponent(projectableNodes) {
        const providers = [{ provide: $SCOPE, useValue: this.componentScope }];
        const childInjector = Injector.create({
            providers: providers,
            parent: this.parentInjector,
            name: 'DowngradeComponentAdapter',
        });
        const componentRef = this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        const viewChangeDetector = componentRef.injector.get(ChangeDetectorRef);
        const changeDetector = componentRef.changeDetectorRef;
        // testability hook is commonly added during component bootstrap in
        // packages/core/src/application_ref.bootstrap()
        // in downgraded application, component creation will take place here as well as adding the
        // testability hook.
        const testability = componentRef.injector.get(Testability, null);
        if (testability) {
            componentRef.injector
                .get(TestabilityRegistry)
                .registerApplication(componentRef.location.nativeElement, testability);
        }
        hookupNgModel(this.ngModel, componentRef.instance);
        return { viewChangeDetector, componentRef, changeDetector };
    }
    setupInputs(manuallyAttachView, propagateDigest = true, { componentRef, changeDetector, viewChangeDetector }) {
        const attrs = this.attrs;
        const inputs = this.componentFactory.inputs || [];
        for (const input of inputs) {
            const inputBinding = new PropertyBinding(input.propName, input.templateName);
            let expr = null;
            if (attrs.hasOwnProperty(inputBinding.attr)) {
                const observeFn = ((prop, isSignal) => {
                    let prevValue = INITIAL_VALUE$1;
                    return (currValue) => {
                        // Initially, both `$observe()` and `$watch()` will call this function.
                        if (!strictEquals(prevValue, currValue)) {
                            if (prevValue === INITIAL_VALUE$1) {
                                prevValue = currValue;
                            }
                            this.updateInput(componentRef, prop, prevValue, currValue, isSignal);
                            prevValue = currValue;
                        }
                    };
                })(inputBinding.prop, input.isSignal);
                attrs.$observe(inputBinding.attr, observeFn);
                // Use `$watch()` (in addition to `$observe()`) in order to initialize the input in time
                // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
                // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
                let unwatch = this.componentScope.$watch(() => {
                    unwatch();
                    unwatch = null;
                    observeFn(attrs[inputBinding.attr]);
                });
            }
            else if (attrs.hasOwnProperty(inputBinding.bindAttr)) {
                expr = attrs[inputBinding.bindAttr];
            }
            else if (attrs.hasOwnProperty(inputBinding.bracketAttr)) {
                expr = attrs[inputBinding.bracketAttr];
            }
            else if (attrs.hasOwnProperty(inputBinding.bindonAttr)) {
                expr = attrs[inputBinding.bindonAttr];
            }
            else if (attrs.hasOwnProperty(inputBinding.bracketParenAttr)) {
                expr = attrs[inputBinding.bracketParenAttr];
            }
            if (expr != null) {
                const watchFn = ((prop, isSignal) => (currValue, prevValue) => this.updateInput(componentRef, prop, prevValue, currValue, isSignal))(inputBinding.prop, input.isSignal);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        // Invoke `ngOnChanges()` and Change Detection (when necessary)
        const detectChanges = () => changeDetector.detectChanges();
        const prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && prototype.ngOnChanges);
        this.componentScope.$watch(() => this.inputChangeCount, this.wrapCallback(() => {
            // Invoke `ngOnChanges()`
            if (this.implementsOnChanges) {
                const inputChanges = this.inputChanges;
                this.inputChanges = {};
                componentRef.instance.ngOnChanges(inputChanges);
            }
            viewChangeDetector.markForCheck();
            // If opted out of propagating digests, invoke change detection when inputs change.
            if (!propagateDigest) {
                detectChanges();
            }
        }));
        // If not opted out of propagating digests, invoke change detection on every digest
        if (propagateDigest) {
            this.componentScope.$watch(this.wrapCallback(detectChanges));
        }
        // If necessary, attach the view so that it will be dirty-checked.
        // (Allow time for the initial input values to be set and `ngOnChanges()` to be called.)
        if (manuallyAttachView || !propagateDigest) {
            let unwatch = this.componentScope.$watch(() => {
                unwatch();
                unwatch = null;
                const appRef = this.parentInjector.get(ApplicationRef);
                appRef.attachView(componentRef.hostView);
            });
        }
    }
    setupOutputs(componentRef) {
        const attrs = this.attrs;
        const outputs = this.componentFactory.outputs || [];
        for (const output of outputs) {
            const outputBindings = new PropertyBinding(output.propName, output.templateName);
            const bindonAttr = outputBindings.bindonAttr.substring(0, outputBindings.bindonAttr.length - 6);
            const bracketParenAttr = `[(${outputBindings.bracketParenAttr.substring(2, outputBindings.bracketParenAttr.length - 8)})]`;
            // order below is important - first update bindings then evaluate expressions
            if (attrs.hasOwnProperty(bindonAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[bindonAttr], true);
            }
            if (attrs.hasOwnProperty(bracketParenAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[bracketParenAttr], true);
            }
            if (attrs.hasOwnProperty(outputBindings.onAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[outputBindings.onAttr]);
            }
            if (attrs.hasOwnProperty(outputBindings.parenAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[outputBindings.parenAttr]);
            }
        }
    }
    subscribeToOutput(componentRef, output, expr, isAssignment = false) {
        const getter = this.$parse(expr);
        const setter = getter.assign;
        if (isAssignment && !setter) {
            throw new Error(`Expression '${expr}' is not assignable!`);
        }
        const emitter = componentRef.instance[output.prop];
        if (emitter) {
            const subscription = emitter.subscribe({
                next: isAssignment
                    ? (v) => setter(this.scope, v)
                    : (v) => getter(this.scope, { '$event': v }),
            });
            componentRef.onDestroy(() => subscription.unsubscribe());
        }
        else {
            throw new Error(`Missing emitter '${output.prop}' on component '${getTypeName(this.componentFactory.componentType)}'!`);
        }
    }
    registerCleanup(componentRef) {
        const testabilityRegistry = componentRef.injector.get(TestabilityRegistry);
        const destroyComponentRef = this.wrapCallback(() => componentRef.destroy());
        let destroyed = false;
        this.element.on('$destroy', () => {
            // The `$destroy` event may have been triggered by the `cleanData()` call in the
            // `componentScope` `$destroy` handler below. In that case, we don't want to call
            // `componentScope.$destroy()` again.
            if (!destroyed)
                this.componentScope.$destroy();
        });
        this.componentScope.$on('$destroy', () => {
            if (!destroyed) {
                destroyed = true;
                testabilityRegistry.unregisterApplication(componentRef.location.nativeElement);
                // The `componentScope` might be getting destroyed, because an ancestor element is being
                // removed/destroyed. If that is the case, jqLite/jQuery would normally invoke `cleanData()`
                // on the removed element and all descendants.
                //   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/jqLite.js#L349-L355
                //   https://github.com/jquery/jquery/blob/6984d1747623dbc5e87fd6c261a5b6b1628c107c/src/manipulation.js#L182
                //
                // Here, however, `destroyComponentRef()` may under some circumstances remove the element
                // from the DOM and therefore it will no longer be a descendant of the removed element when
                // `cleanData()` is called. This would result in a memory leak, because the element's data
                // and event handlers (and all objects directly or indirectly referenced by them) would be
                // retained.
                //
                // To ensure the element is always properly cleaned up, we manually call `cleanData()` on
                // this element and its descendants before destroying the `ComponentRef`.
                cleanData(this.element[0]);
                destroyComponentRef();
            }
        });
    }
    updateInput(componentRef, prop, prevValue, currValue, isSignal) {
        if (this.implementsOnChanges) {
            this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
        }
        this.inputChangeCount++;
        if (isSignal && !this.unsafelyOverwriteSignalInputs) {
            const node = componentRef.instance[prop][ɵSIGNAL];
            node.applyValueToInputSignal(node, currValue);
        }
        else {
            componentRef.instance[prop] = currValue;
        }
    }
    groupProjectableNodes() {
        let ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, this.element.contents());
    }
}
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 */
function groupNodesBySelector(ngContentSelectors, nodes) {
    const projectableNodes = [];
    for (let i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
        projectableNodes[i] = [];
    }
    for (let j = 0, jj = nodes.length; j < jj; ++j) {
        const node = nodes[j];
        const ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
        if (ngContentIndex != null) {
            projectableNodes[ngContentIndex].push(node);
        }
    }
    return projectableNodes;
}
function findMatchingNgContentIndex(element, ngContentSelectors) {
    const ngContentIndices = [];
    let wildcardNgContentIndex = -1;
    for (let i = 0; i < ngContentSelectors.length; i++) {
        const selector = ngContentSelectors[i];
        if (selector === '*') {
            wildcardNgContentIndex = i;
        }
        else {
            if (matchesSelector(element, selector)) {
                ngContentIndices.push(i);
            }
        }
    }
    ngContentIndices.sort();
    if (wildcardNgContentIndex !== -1) {
        ngContentIndices.push(wildcardNgContentIndex);
    }
    return ngContentIndices.length ? ngContentIndices[0] : null;
}
function matchesSelector(el, selector) {
    const elProto = Element.prototype;
    return el.nodeType === Node.ELEMENT_NODE
        ? // matches is supported by all browsers from 2014 onwards except non-chromium edge
            (elProto.matches ?? elProto.msMatchesSelector).call(el, selector)
        : false;
}

function isThenable(obj) {
    return !!obj && isFunction(obj.then);
}
/**
 * Synchronous, promise-like object.
 */
class SyncPromise {
    value;
    resolved = false;
    callbacks = [];
    static all(valuesOrPromises) {
        const aggrPromise = new SyncPromise();
        let resolvedCount = 0;
        const results = [];
        const resolve = (idx, value) => {
            results[idx] = value;
            if (++resolvedCount === valuesOrPromises.length)
                aggrPromise.resolve(results);
        };
        valuesOrPromises.forEach((p, idx) => {
            if (isThenable(p)) {
                p.then((v) => resolve(idx, v));
            }
            else {
                resolve(idx, p);
            }
        });
        return aggrPromise;
    }
    resolve(value) {
        // Do nothing, if already resolved.
        if (this.resolved)
            return;
        this.value = value;
        this.resolved = true;
        // Run the queued callbacks.
        this.callbacks.forEach((callback) => callback(value));
        this.callbacks.length = 0;
    }
    then(callback) {
        if (this.resolved) {
            callback(this.value);
        }
        else {
            this.callbacks.push(callback);
        }
    }
}

/**
 * @description
 *
 * A helper function that allows an Angular component to be used from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation*
 *
 * This helper function returns a factory function to be used for registering
 * an AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * @usageNotes
 * ### Examples
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes-wrapper"}
 *
 * For more details and examples on downgrading Angular components to AngularJS components please
 * visit the [Upgrade guide](https://angular.io/guide/upgrade#using-angular-components-from-angularjs-code).
 *
 * @param info contains information about the Component that is being downgraded:
 *
 * - `component: Type<any>`: The type of the Component that will be downgraded
 * - `downgradedModule?: string`: The name of the downgraded module (if any) that the component
 *   "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose
 *   corresponding Angular module will be bootstrapped, when the component needs to be instantiated.
 *   <br />
 *   (This option is only necessary when using `downgradeModule()` to downgrade more than one
 *   Angular module.)
 * - `propagateDigest?: boolean`: Whether to perform {@link ChangeDetectorRef#detectChanges} on the
 * component on every
 *   [$digest](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest). If set to `false`,
 *   change detection will still be performed when any of the component's inputs changes.
 *   (Default: true)
 *
 * @returns a factory function that can be used to register the component in an
 * AngularJS module.
 *
 * @publicApi
 */
function downgradeComponent(info) {
    const directiveFactory = function ($compile, $injector, $parse) {
        const unsafelyOverwriteSignalInputs = info.unsafelyOverwriteSignalInputs ?? false;
        // When using `downgradeModule()`, we need to handle certain things specially. For example:
        // - We always need to attach the component view to the `ApplicationRef` for it to be
        //   dirty-checked.
        // - We need to ensure callbacks to Angular APIs (e.g. change detection) are run inside the
        //   Angular zone.
        //   NOTE: This is not needed, when using `UpgradeModule`, because `$digest()` will be run
        //         inside the Angular zone (except if explicitly escaped, in which case we shouldn't
        //         force it back in).
        const isNgUpgradeLite = getUpgradeAppType($injector) === 3 /* UpgradeAppType.Lite */;
        const wrapCallback = !isNgUpgradeLite
            ? (cb) => cb
            : (cb) => () => (NgZone.isInAngularZone() ? cb() : ngZone.run(cb));
        let ngZone;
        // When downgrading multiple modules, special handling is needed wrt injectors.
        const hasMultipleDowngradedModules = isNgUpgradeLite && getDowngradedModuleCount($injector) > 1;
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            // Controller needs to be set so that `angular-component-router.js` (from beta Angular 2)
            // configuration properties can be made available. See:
            // See G3: javascript/angular2/angular1_router_lib.js
            // https://github.com/angular/angular.js/blob/47bf11ee94664367a26ed8c91b9b586d3dd420f5/src/ng/compile.js#L1670-L1691.
            controller: function () { },
            link: (scope, element, attrs, required) => {
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                const ngModel = required[1];
                const parentInjector = required[0];
                let moduleInjector = undefined;
                let ranAsync = false;
                if (!parentInjector || hasMultipleDowngradedModules) {
                    const downgradedModule = info.downgradedModule || '';
                    const lazyModuleRefKey = `${LAZY_MODULE_REF}${downgradedModule}`;
                    const attemptedAction = `instantiating component '${getTypeName(info.component)}'`;
                    validateInjectionKey($injector, downgradedModule, lazyModuleRefKey, attemptedAction);
                    const lazyModuleRef = $injector.get(lazyModuleRefKey);
                    moduleInjector = lazyModuleRef.injector ?? lazyModuleRef.promise;
                }
                // Notes:
                //
                // There are two injectors: `finalModuleInjector` and `finalParentInjector` (they might be
                // the same instance, but that is irrelevant):
                // - `finalModuleInjector` is used to retrieve `ComponentFactoryResolver`, thus it must be
                //   on the same tree as the `NgModule` that declares this downgraded component.
                // - `finalParentInjector` is used for all other injection purposes.
                //   (Note that Angular knows to only traverse the component-tree part of that injector,
                //   when looking for an injectable and then switch to the module injector.)
                //
                // There are basically three cases:
                // - If there is no parent component (thus no `parentInjector`), we bootstrap the downgraded
                //   `NgModule` and use its injector as both `finalModuleInjector` and
                //   `finalParentInjector`.
                // - If there is a parent component (and thus a `parentInjector`) and we are sure that it
                //   belongs to the same `NgModule` as this downgraded component (e.g. because there is only
                //   one downgraded module, we use that `parentInjector` as both `finalModuleInjector` and
                //   `finalParentInjector`.
                // - If there is a parent component, but it may belong to a different `NgModule`, then we
                //   use the `parentInjector` as `finalParentInjector` and this downgraded component's
                //   declaring `NgModule`'s injector as `finalModuleInjector`.
                //   Note 1: If the `NgModule` is already bootstrapped, we just get its injector (we don't
                //           bootstrap again).
                //   Note 2: It is possible that (while there are multiple downgraded modules) this
                //           downgraded component and its parent component both belong to the same NgModule.
                //           In that case, we could have used the `parentInjector` as both
                //           `finalModuleInjector` and `finalParentInjector`, but (for simplicity) we are
                //           treating this case as if they belong to different `NgModule`s. That doesn't
                //           really affect anything, since `parentInjector` has `moduleInjector` as ancestor
                //           and trying to resolve `ComponentFactoryResolver` from either one will return
                //           the same instance.
                // If there is a parent component, use its injector as parent injector.
                // If this is a "top-level" Angular component, use the module injector.
                const finalParentInjector = parentInjector || moduleInjector;
                // If this is a "top-level" Angular component or the parent component may belong to a
                // different `NgModule`, use the module injector for module-specific dependencies.
                // If there is a parent component that belongs to the same `NgModule`, use its injector.
                const finalModuleInjector = moduleInjector || parentInjector;
                const doDowngrade = (injector, moduleInjector) => {
                    // Retrieve `ComponentFactoryResolver` from the injector tied to the `NgModule` this
                    // component belongs to.
                    const componentFactoryResolver = moduleInjector.get(ComponentFactoryResolver);
                    const componentFactory = componentFactoryResolver.resolveComponentFactory(info.component);
                    if (!componentFactory) {
                        throw new Error(`Expecting ComponentFactory for: ${getTypeName(info.component)}`);
                    }
                    const injectorPromise = new ParentInjectorPromise(element);
                    const facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $compile, $parse, componentFactory, wrapCallback, unsafelyOverwriteSignalInputs);
                    const projectableNodes = facade.compileContents();
                    const componentRef = facade.createComponentAndSetup(projectableNodes, isNgUpgradeLite, info.propagateDigest);
                    injectorPromise.resolve(componentRef.injector);
                    if (ranAsync) {
                        // If this is run async, it is possible that it is not run inside a
                        // digest and initial input values will not be detected.
                        scope.$evalAsync(() => { });
                    }
                };
                const downgradeFn = !isNgUpgradeLite
                    ? doDowngrade
                    : (pInjector, mInjector) => {
                        if (!ngZone) {
                            ngZone = pInjector.get(NgZone);
                        }
                        wrapCallback(() => doDowngrade(pInjector, mInjector))();
                    };
                // NOTE:
                // Not using `ParentInjectorPromise.all()` (which is inherited from `SyncPromise`), because
                // Closure Compiler (or some related tool) complains:
                // `TypeError: ...$src$downgrade_component_ParentInjectorPromise.all is not a function`
                SyncPromise.all([finalParentInjector, finalModuleInjector]).then(([pInjector, mInjector]) => downgradeFn(pInjector, mInjector));
                ranAsync = true;
            },
        };
    };
    // bracket-notation because of closure - see #14441
    directiveFactory['$inject'] = [$COMPILE, $INJECTOR, $PARSE];
    return directiveFactory;
}
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of AngularJS's `$compile`.
 */
class ParentInjectorPromise extends SyncPromise {
    element;
    injectorKey = controllerKey(INJECTOR_KEY);
    constructor(element) {
        super();
        this.element = element;
        // Store the promise on the element.
        element.data(this.injectorKey, this);
    }
    resolve(injector) {
        // Store the real injector on the element.
        this.element.data(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = null;
        // Resolve the promise.
        super.resolve(injector);
    }
}

/**
 * @description
 *
 * A helper function to allow an Angular service to be accessible from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation*
 *
 * This helper function returns a factory function that provides access to the Angular
 * service identified by the `token` parameter.
 *
 * @usageNotes
 * ### Examples
 *
 * First ensure that the service to be downgraded is provided in an `NgModule`
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app `NgModule`
 *
 * {@example upgrade/static/ts/full/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {@example upgrade/static/ts/full/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {@example upgrade/static/ts/full/module.ts region="example-app"}
 *
 * <div class="docs-alert docs-alert-important">
 *
 *   When using `downgradeModule()`, downgraded injectables will not be available until the Angular
 *   module that provides them is instantiated. In order to be safe, you need to ensure that the
 *   downgraded injectables are not used anywhere _outside_ the part of the app where it is
 *   guaranteed that their module has been instantiated.
 *
 *   For example, it is _OK_ to use a downgraded service in an upgraded component that is only used
 *   from a downgraded Angular component provided by the same Angular module as the injectable, but
 *   it is _not OK_ to use it in an AngularJS component that may be used independently of Angular or
 *   use it in a downgraded Angular component from a different module.
 *
 * </div>
 *
 * @param token an `InjectionToken` that identifies a service provided from Angular.
 * @param downgradedModule the name of the downgraded module (if any) that the injectable
 * "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose injector will
 * be used for instantiating the injectable.<br />
 * (This option is only necessary when using `downgradeModule()` to downgrade more than one Angular
 * module.)
 *
 * @returns a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 * @publicApi
 */
function downgradeInjectable(token, downgradedModule = '') {
    const factory = function ($injector) {
        const injectorKey = `${INJECTOR_KEY}${downgradedModule}`;
        const injectableName = isFunction(token) ? getTypeName(token) : String(token);
        const attemptedAction = `instantiating injectable '${injectableName}'`;
        validateInjectionKey($injector, downgradedModule, injectorKey, attemptedAction);
        try {
            const injector = $injector.get(injectorKey);
            return injector.get(token);
        }
        catch (err) {
            throw new Error(`Error while ${attemptedAction}: ${err.message || err}`);
        }
    };
    factory['$inject'] = [$INJECTOR];
    return factory;
}

/**
 * @module
 * @description
 * Entry point for all public APIs of the upgrade package.
 */
/**
 * @publicApi
 */
const VERSION = new Version('20.0.0-next.0+sha-51b8ff2');

/**
 * The Trusted Types policy, or null if Trusted Types are not
 * enabled/supported, or undefined if the policy has not been created yet.
 */
let policy;
/**
 * Returns the Trusted Types policy, or null if Trusted Types are not
 * enabled/supported. The first call to this function will create the policy.
 */
function getPolicy() {
    if (policy === undefined) {
        policy = null;
        const windowWithTrustedTypes = window;
        if (windowWithTrustedTypes.trustedTypes) {
            try {
                policy = windowWithTrustedTypes.trustedTypes.createPolicy('angular#unsafe-upgrade', {
                    createHTML: (s) => s,
                });
            }
            catch {
                // trustedTypes.createPolicy throws if called with a name that is
                // already registered, even in report-only mode. Until the API changes,
                // catch the error not to break the applications functionally. In such
                // cases, the code will fall back to using strings.
            }
        }
    }
    return policy;
}
/**
 * Unsafely promote a legacy AngularJS template to a TrustedHTML, falling back
 * to strings when Trusted Types are not available.
 * @security This is a security-sensitive function; any use of this function
 * must go through security review. In particular, the template string should
 * always be under full control of the application author, as untrusted input
 * can cause an XSS vulnerability.
 */
function trustedHTMLFromLegacyTemplate(html) {
    return getPolicy()?.createHTML(html) || html;
}

// Constants
const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
// Classes
class UpgradeHelper {
    name;
    $injector;
    element;
    $element;
    directive;
    $compile;
    $controller;
    constructor(injector, name, elementRef, directive) {
        this.name = name;
        this.$injector = injector.get($INJECTOR);
        this.$compile = this.$injector.get($COMPILE);
        this.$controller = this.$injector.get($CONTROLLER);
        this.element = elementRef.nativeElement;
        this.$element = element(this.element);
        this.directive = directive ?? UpgradeHelper.getDirective(this.$injector, name);
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
            return trustedHTMLFromLegacyTemplate(getOrCall(directive.template, $element));
        }
        else if (directive.templateUrl) {
            const $templateCache = $injector.get($TEMPLATE_CACHE);
            const url = getOrCall(directive.templateUrl, $element);
            const template = $templateCache.get(url);
            if (template !== undefined) {
                return trustedHTMLFromLegacyTemplate(template);
            }
            else if (!fetchRemoteTemplate) {
                throw new Error('loading directive templates asynchronously is not supported');
            }
            return new Promise((resolve, reject) => {
                const $httpBackend = $injector.get($HTTP_BACKEND);
                $httpBackend('GET', url, null, (status, response) => {
                    if (status === 200) {
                        resolve(trustedHTMLFromLegacyTemplate($templateCache.put(url, response)));
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
        this.$element.data?.(controllerKey(this.directive.name), controller);
        return controller;
    }
    compileTemplate(template) {
        if (template === undefined) {
            template = UpgradeHelper.getTemplate(this.$injector, this.directive, false, this.$element);
        }
        return this.compileHtml(template);
    }
    onDestroy($scope, controllerInstance) {
        if (controllerInstance && isFunction(controllerInstance.$onDestroy)) {
            controllerInstance.$onDestroy();
        }
        $scope.$destroy();
        cleanData(this.element);
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
                Object.keys(transclude).forEach((slotName) => {
                    let selector = transclude[slotName];
                    const optional = selector.charAt(0) === '?';
                    selector = optional ? selector.substring(1) : selector;
                    slotMap[selector] = slotName;
                    slots[slotName] = null; // `null`: Defined but not yet filled.
                    filledSlots[slotName] = optional; // Consider optional slots as filled.
                });
                // Add the matching elements into their slot.
                contentChildNodes.forEach((node) => {
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
                Object.keys(filledSlots).forEach((slotName) => {
                    if (!filledSlots[slotName]) {
                        throw new Error(`Required transclusion slot '${slotName}' on directive: ${this.name}`);
                    }
                });
                Object.keys(slots)
                    .filter((slotName) => slots[slotName])
                    .forEach((slotName) => {
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
            $template.forEach((node) => {
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
            Object.keys(requiredControllersMap).forEach((key) => {
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
        while ((childNode = this.element.firstChild)) {
            childNode.remove();
            childNodes.push(childNode);
        }
        return childNodes;
    }
    getDirectiveRequire() {
        const require = this.directive.require || (this.directive.controller && this.directive.name);
        if (isMap(require)) {
            Object.entries(require).forEach(([key, value]) => {
                const match = value.match(REQUIRE_PREFIX_RE);
                const name = value.substring(match[0].length);
                if (!name) {
                    require[key] = match[0] + key;
                }
            });
        }
        return require;
    }
    resolveRequire(require) {
        if (!require) {
            return null;
        }
        else if (Array.isArray(require)) {
            return require.map((req) => this.resolveRequire(req));
        }
        else if (typeof require === 'object') {
            const value = {};
            Object.keys(require).forEach((key) => (value[key] = this.resolveRequire(require[key])));
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

var upgrade_helper = /*#__PURE__*/Object.freeze({
    __proto__: null,
    UpgradeHelper: UpgradeHelper
});

/**
 * Note: We intentionally use cross entry-point relative paths here. This
 * is because the primary entry-point is deprecated and we also don't have
 * it available in G3.
 */

// We have to do a little dance to get the ng1 injector into the module injector.
// We store the ng1 injector so that the provider in the module injector can access it
// Then we "get" the ng1 injector from the module injector, which triggers the provider to read
// the stored injector and release the reference to it.
let tempInjectorRef = null;
function setTempInjectorRef(injector) {
    tempInjectorRef = injector;
}
function injectorFactory() {
    if (!tempInjectorRef) {
        throw new Error('Trying to get the AngularJS injector before it being set.');
    }
    const injector = tempInjectorRef;
    tempInjectorRef = null; // clear the value to prevent memory leaks
    return injector;
}
function rootScopeFactory(i) {
    return i.get('$rootScope');
}
function compileFactory(i) {
    return i.get('$compile');
}
function parseFactory(i) {
    return i.get('$parse');
}
const angular1Providers = [
    // We must use exported named functions for the ng2 factories to keep the compiler happy:
    // > Metadata collected contains an error that will be reported at runtime:
    // >   Function calls are not supported.
    // >   Consider replacing the function or lambda with a reference to an exported function
    { provide: '$injector', useFactory: injectorFactory, deps: [] },
    { provide: '$rootScope', useFactory: rootScopeFactory, deps: ['$injector'] },
    { provide: '$compile', useFactory: compileFactory, deps: ['$injector'] },
    { provide: '$parse', useFactory: parseFactory, deps: ['$injector'] },
];

class NgAdapterInjector {
    modInjector;
    constructor(modInjector) {
        this.modInjector = modInjector;
    }
    // When Angular locate a service in the component injector tree, the not found value is set to
    // `NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR`. In such a case we should not walk up to the module
    // injector.
    // AngularJS only supports a single tree and should always check the module injector.
    get(token, notFoundValue) {
        if (notFoundValue === ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
            return notFoundValue;
        }
        return this.modInjector.get(token, notFoundValue);
    }
}

let moduleUid = 0;
/**
 * @description
 *
 * A helper function for creating an AngularJS module that can bootstrap an Angular module
 * "on-demand" (possibly lazily) when a {@link downgradeComponent downgraded component} needs to be
 * instantiated.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static) library for hybrid upgrade apps that
 * support AOT compilation.*
 *
 * It allows loading/bootstrapping the Angular part of a hybrid application lazily and not having to
 * pay the cost up-front. For example, you can have an AngularJS application that uses Angular for
 * specific routes and only instantiate the Angular modules if/when the user visits one of these
 * routes.
 *
 * The Angular module will be bootstrapped once (when requested for the first time) and the same
 * reference will be used from that point onwards.
 *
 * `downgradeModule()` requires either an `NgModuleFactory`, `NgModule` class or a function:
 * - `NgModuleFactory`: If you pass an `NgModuleFactory`, it will be used to instantiate a module
 *   using `platformBrowser`'s {@link PlatformRef#bootstrapModuleFactory bootstrapModuleFactory()}.
 *   NOTE: this type of the argument is deprecated. Please either provide an `NgModule` class or a
 *   bootstrap function instead.
 * - `NgModule` class: If you pass an NgModule class, it will be used to instantiate a module
 *   using `platformBrowser`'s {@link PlatformRef#bootstrapModule bootstrapModule()}.
 * - `Function`: If you pass a function, it is expected to return a promise resolving to an
 *   `NgModuleRef`. The function is called with an array of extra {@link StaticProvider Providers}
 *   that are expected to be available from the returned `NgModuleRef`'s `Injector`.
 *
 * `downgradeModule()` returns the name of the created AngularJS wrapper module. You can use it to
 * declare a dependency in your main AngularJS module.
 *
 * {@example upgrade/static/ts/lite/module.ts region="basic-how-to"}
 *
 * For more details on how to use `downgradeModule()` see
 * [Upgrading for Performance](https://angular.io/guide/upgrade).
 *
 * @usageNotes
 *
 * Apart from `UpgradeModule`, you can use the rest of the `upgrade/static` helpers as usual to
 * build a hybrid application. Note that the Angular pieces (e.g. downgraded services) will not be
 * available until the downgraded module has been bootstrapped, i.e. by instantiating a downgraded
 * component.
 *
 * <div class="docs-alert docs-alert-important">
 *
 *   You cannot use `downgradeModule()` and `UpgradeModule` in the same hybrid application.<br />
 *   Use one or the other.
 *
 * </div>
 *
 * ### Differences with `UpgradeModule`
 *
 * Besides their different API, there are two important internal differences between
 * `downgradeModule()` and `UpgradeModule` that affect the behavior of hybrid applications:
 *
 * 1. Unlike `UpgradeModule`, `downgradeModule()` does not bootstrap the main AngularJS module
 *    inside the {@link NgZone Angular zone}.
 * 2. Unlike `UpgradeModule`, `downgradeModule()` does not automatically run a
 *    [$digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest) when changes are
 *    detected in the Angular part of the application.
 *
 * What this means is that applications using `UpgradeModule` will run change detection more
 * frequently in order to ensure that both frameworks are properly notified about possible changes.
 * This will inevitably result in more change detection runs than necessary.
 *
 * `downgradeModule()`, on the other side, does not try to tie the two change detection systems as
 * tightly, restricting the explicit change detection runs only to cases where it knows it is
 * necessary (e.g. when the inputs of a downgraded component change). This improves performance,
 * especially in change-detection-heavy applications, but leaves it up to the developer to manually
 * notify each framework as needed.
 *
 * For a more detailed discussion of the differences and their implications, see
 * [Upgrading for Performance](https://angular.io/guide/upgrade).
 *
 * <div class="docs-alert docs-alert-helpful">
 *
 *   You can manually trigger a change detection run in AngularJS using
 *   [scope.$apply(...)](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply) or
 *   [$rootScope.$digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest).
 *
 *   You can manually trigger a change detection run in Angular using {@link NgZone#run
 *   ngZone.run(...)}.
 *
 * </div>
 *
 * ### Downgrading multiple modules
 *
 * It is possible to downgrade multiple modules and include them in an AngularJS application. In
 * that case, each downgraded module will be bootstrapped when an associated downgraded component or
 * injectable needs to be instantiated.
 *
 * Things to keep in mind, when downgrading multiple modules:
 *
 * - Each downgraded component/injectable needs to be explicitly associated with a downgraded
 *   module. See `downgradeComponent()` and `downgradeInjectable()` for more details.
 *
 * - If you want some injectables to be shared among all downgraded modules, you can provide them as
 *   `StaticProvider`s, when creating the `PlatformRef` (e.g. via `platformBrowser` or
 *   `platformBrowserDynamic`).
 *
 * - When using {@link PlatformRef#bootstrapmodule `bootstrapModule()`} or
 *   {@link PlatformRef#bootstrapmodulefactory `bootstrapModuleFactory()`} to bootstrap the
 *   downgraded modules, each one is considered a "root" module. As a consequence, a new instance
 *   will be created for every injectable provided in `"root"` (via
 *   {@link Injectable#providedIn `providedIn`}).
 *   If this is not your intention, you can have a shared module (that will act as act as the "root"
 *   module) and create all downgraded modules using that module's injector:
 *
 *   {@example upgrade/static/ts/lite-multi-shared/module.ts region="shared-root-module"}
 *
 * @publicApi
 */
function downgradeModule(moduleOrBootstrapFn) {
    const lazyModuleName = `${UPGRADE_MODULE_NAME}.lazy${++moduleUid}`;
    const lazyModuleRefKey = `${LAZY_MODULE_REF}${lazyModuleName}`;
    const lazyInjectorKey = `${INJECTOR_KEY}${lazyModuleName}`;
    let bootstrapFn;
    if (isNgModuleType(moduleOrBootstrapFn)) {
        // NgModule class
        bootstrapFn = (extraProviders) => platformBrowser(extraProviders).bootstrapModule(moduleOrBootstrapFn);
    }
    else if (!isFunction(moduleOrBootstrapFn)) {
        // NgModule factory
        bootstrapFn = (extraProviders) => platformBrowser(extraProviders).bootstrapModuleFactory(moduleOrBootstrapFn);
    }
    else {
        // bootstrap function
        bootstrapFn = moduleOrBootstrapFn;
    }
    let injector;
    // Create an ng1 module to bootstrap.
    module_(lazyModuleName, [])
        .constant(UPGRADE_APP_TYPE_KEY, 3 /* ɵutil.UpgradeAppType.Lite */)
        .factory(INJECTOR_KEY, [lazyInjectorKey, identity])
        .factory(lazyInjectorKey, () => {
        if (!injector) {
            throw new Error('Trying to get the Angular injector before bootstrapping the corresponding ' +
                'Angular module.');
        }
        return injector;
    })
        .factory(LAZY_MODULE_REF, [lazyModuleRefKey, identity])
        .factory(lazyModuleRefKey, [
        $INJECTOR,
        ($injector) => {
            setTempInjectorRef($injector);
            const result = {
                promise: bootstrapFn(angular1Providers).then((ref) => {
                    injector = result.injector = new NgAdapterInjector(ref.injector);
                    injector.get($INJECTOR);
                    // Destroy the AngularJS app once the Angular `PlatformRef` is destroyed.
                    // This does not happen in a typical SPA scenario, but it might be useful for
                    // other use-cases where disposing of an Angular/AngularJS app is necessary
                    // (such as Hot Module Replacement (HMR)).
                    // See https://github.com/angular/angular/issues/39935.
                    injector.get(PlatformRef).onDestroy(() => destroyApp($injector));
                    return injector;
                }),
            };
            return result;
        },
    ])
        .config([
        $INJECTOR,
        $PROVIDE,
        ($injector, $provide) => {
            $provide.constant(DOWNGRADED_MODULE_COUNT_KEY, getDowngradedModuleCount($injector) + 1);
        },
    ]);
    return lazyModuleName;
}
function identity(x) {
    return x;
}

const NOT_SUPPORTED = 'NOT_SUPPORTED';
const INITIAL_VALUE = {
    __UNINITIALIZED__: true,
};
class Bindings {
    twoWayBoundProperties = [];
    twoWayBoundLastValues = [];
    expressionBoundProperties = [];
    propertyToOutputMap = {};
}
/**
 * @description
 *
 * A helper class that allows an AngularJS component to be used from Angular.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation.*
 *
 * This helper class should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
 * @usageNotes
 * ### Examples
 *
 * Let's assume that you have an AngularJS component called `ng1Hero` that needs
 * to be made available in Angular templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-hero"}
 *
 * We must create a `Directive` that will make this AngularJS component
 * available inside Angular templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper"}
 *
 * In this example you can see that we must derive from the `UpgradeComponent`
 * base class but also provide an {@link Directive `@Directive`} decorator. This is
 * because the AOT compiler requires that this information is statically available at
 * compile time.
 *
 * Note that we must do the following:
 * * specify the directive's selector (`ng1-hero`)
 * * specify all inputs and outputs that the AngularJS component expects
 * * derive from `UpgradeComponent`
 * * call the base class from the constructor, passing
 *   * the AngularJS name of the component (`ng1Hero`)
 *   * the `ElementRef` and `Injector` for the component wrapper
 *
 * @publicApi
 * @extensible
 */
class UpgradeComponent {
    helper;
    $element;
    $componentScope;
    directive;
    bindings;
    controllerInstance;
    bindingDestination;
    // We will be instantiating the controller in the `ngOnInit` hook, when the
    // first `ngOnChanges` will have been already triggered. We store the
    // `SimpleChanges` and "play them back" later.
    pendingChanges = null;
    unregisterDoCheckWatcher;
    /**
     * Create a new `UpgradeComponent` instance. You should not normally need to do this.
     * Instead you should derive a new class from this one and call the super constructor
     * from the base class.
     *
     * {@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper" }
     *
     * * The `name` parameter should be the name of the AngularJS directive.
     * * The `elementRef` and `injector` parameters should be acquired from Angular by dependency
     *   injection into the base class constructor.
     */
    constructor(name, elementRef, injector) {
        this.helper = new UpgradeHelper(injector, name, elementRef);
        this.$element = this.helper.$element;
        this.directive = this.helper.directive;
        this.bindings = this.initializeBindings(this.directive, name);
        // We ask for the AngularJS scope from the Angular injector, since
        // we will put the new component scope onto the new injector for each component
        const $parentScope = injector.get($SCOPE);
        // QUESTION 1: Should we create an isolated scope if the scope is only true?
        // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
        this.$componentScope = $parentScope.$new(!!this.directive.scope);
        this.initializeOutputs();
    }
    /** @nodoc */
    ngOnInit() {
        // Collect contents, insert and compile template
        const attachChildNodes = this.helper.prepareTransclusion();
        const linkFn = this.helper.compileTemplate();
        // Instantiate controller
        const controllerType = this.directive.controller;
        const bindToController = this.directive.bindToController;
        let controllerInstance = controllerType
            ? this.helper.buildController(controllerType, this.$componentScope)
            : undefined;
        let bindingDestination;
        if (!bindToController) {
            bindingDestination = this.$componentScope;
        }
        else if (controllerType && controllerInstance) {
            bindingDestination = controllerInstance;
        }
        else {
            throw new Error(`Upgraded directive '${this.directive.name}' specifies 'bindToController' but no controller.`);
        }
        this.controllerInstance = controllerInstance;
        this.bindingDestination = bindingDestination;
        // Set up outputs
        this.bindOutputs(bindingDestination);
        // Require other controllers
        const requiredControllers = this.helper.resolveAndBindRequiredControllers(controllerInstance);
        // Hook: $onChanges
        if (this.pendingChanges) {
            this.forwardChanges(this.pendingChanges, bindingDestination);
            this.pendingChanges = null;
        }
        // Hook: $onInit
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        // Hook: $doCheck
        if (controllerInstance && isFunction(controllerInstance.$doCheck)) {
            const callDoCheck = () => controllerInstance?.$doCheck?.();
            this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
            callDoCheck();
        }
        // Linking
        const link = this.directive.link;
        const preLink = typeof link == 'object' && link.pre;
        const postLink = typeof link == 'object' ? link.post : link;
        const attrs = NOT_SUPPORTED;
        const transcludeFn = NOT_SUPPORTED;
        if (preLink) {
            preLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        linkFn(this.$componentScope, null, { parentBoundTranscludeFn: attachChildNodes });
        if (postLink) {
            postLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        // Hook: $postLink
        if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
            this.controllerInstance.$postLink();
        }
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if (!this.bindingDestination) {
            this.pendingChanges = changes;
        }
        else {
            this.forwardChanges(changes, this.bindingDestination);
        }
    }
    /** @nodoc */
    ngDoCheck() {
        const twoWayBoundProperties = this.bindings.twoWayBoundProperties;
        const twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
        const propertyToOutputMap = this.bindings.propertyToOutputMap;
        twoWayBoundProperties.forEach((propName, idx) => {
            const newValue = this.bindingDestination?.[propName];
            const oldValue = twoWayBoundLastValues[idx];
            if (!Object.is(newValue, oldValue)) {
                const outputName = propertyToOutputMap[propName];
                const eventEmitter = this[outputName];
                eventEmitter.emit(newValue);
                twoWayBoundLastValues[idx] = newValue;
            }
        });
    }
    /** @nodoc */
    ngOnDestroy() {
        if (isFunction(this.unregisterDoCheckWatcher)) {
            this.unregisterDoCheckWatcher();
        }
        this.helper.onDestroy(this.$componentScope, this.controllerInstance);
    }
    initializeBindings(directive, name) {
        const btcIsObject = typeof directive.bindToController === 'object';
        if (btcIsObject && Object.keys(directive.scope).length) {
            throw new Error(`Binding definitions on scope and controller at the same time is not supported.`);
        }
        const context = btcIsObject ? directive.bindToController : directive.scope;
        const bindings = new Bindings();
        if (typeof context == 'object') {
            Object.keys(context).forEach((propName) => {
                const definition = context[propName];
                const bindingType = definition.charAt(0);
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
                        let json = JSON.stringify(context);
                        throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${name}' directive.`);
                }
            });
        }
        return bindings;
    }
    initializeOutputs() {
        // Initialize the outputs for `=` and `&` bindings
        this.bindings.twoWayBoundProperties
            .concat(this.bindings.expressionBoundProperties)
            .forEach((propName) => {
            const outputName = this.bindings.propertyToOutputMap[propName];
            this[outputName] = new EventEmitter();
        });
    }
    bindOutputs(bindingDestination) {
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach((propName) => {
            const outputName = this.bindings.propertyToOutputMap[propName];
            const emitter = this[outputName];
            bindingDestination[propName] = (value) => emitter.emit(value);
        });
    }
    forwardChanges(changes, bindingDestination) {
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach((propName) => (bindingDestination[propName] = changes[propName].currentValue));
        if (isFunction(bindingDestination.$onChanges)) {
            bindingDestination.$onChanges(changes);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0-next.0+sha-51b8ff2", ngImport: i0, type: UpgradeComponent, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.0.0-next.0+sha-51b8ff2", type: UpgradeComponent, isStandalone: true, usesOnChanges: true, ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0-next.0+sha-51b8ff2", ngImport: i0, type: UpgradeComponent, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: undefined }, { type: i0.ElementRef }, { type: i0.Injector }] });

/**
 * @description
 *
 * An `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static)
 * library for hybrid upgrade apps that support AOT compilation*
 *
 * The `upgrade/static` package contains helpers that allow AngularJS and Angular components
 * to be used together inside a hybrid upgrade application, which supports AOT compilation.
 *
 * Specifically, the classes and functions in the `upgrade/static` module allow the following:
 *
 * 1. Creation of an Angular directive that wraps and exposes an AngularJS component so
 *    that it can be used in an Angular template. See `UpgradeComponent`.
 * 2. Creation of an AngularJS directive that wraps and exposes an Angular component so
 *    that it can be used in an AngularJS template. See `downgradeComponent`.
 * 3. Creation of an Angular root injector provider that wraps and exposes an AngularJS
 *    service so that it can be injected into an Angular context. See
 *    {@link UpgradeModule#upgrading-an-angular-1-service Upgrading an AngularJS service} below.
 * 4. Creation of an AngularJS service that wraps and exposes an Angular injectable
 *    so that it can be injected into an AngularJS context. See `downgradeInjectable`.
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * @usageNotes
 *
 * ```ts
 * import {UpgradeModule} from '@angular/upgrade/static';
 * ```
 *
 * See also the {@link UpgradeModule#examples examples} below.
 *
 * ### Mental Model
 *
 * When reasoning about how a hybrid application works it is useful to have a mental model which
 * describes what is happening and explains what is happening at the lowest level.
 *
 * 1. There are two independent frameworks running in a single application, each framework treats
 *    the other as a black box.
 * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
 *    instantiated the element is the owner. Each framework only updates/interacts with its own
 *    DOM elements and ignores others.
 * 3. AngularJS directives always execute inside the AngularJS framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular components always execute inside the Angular framework codebase regardless of
 *    where they are instantiated.
 * 5. An AngularJS component can be "upgraded"" to an Angular component. This is achieved by
 *    defining an Angular directive, which bootstraps the AngularJS component at its location
 *    in the DOM. See `UpgradeComponent`.
 * 6. An Angular component can be "downgraded" to an AngularJS component. This is achieved by
 *    defining an AngularJS directive, which bootstraps the Angular component at its location
 *    in the DOM. See `downgradeComponent`.
 * 7. Whenever an "upgraded"/"downgraded" component is instantiated the host element is owned by
 *    the framework doing the instantiation. The other framework then instantiates and owns the
 *    view for that component.
 *    1. This implies that the component bindings will always follow the semantics of the
 *       instantiation framework.
 *    2. The DOM attributes are parsed by the framework that owns the current template. So
 *       attributes in AngularJS templates must use kebab-case, while AngularJS templates must use
 *       camelCase.
 *    3. However the template binding syntax will always use the Angular style, e.g. square
 *       brackets (`[...]`) for property binding.
 * 8. Angular is bootstrapped first; AngularJS is bootstrapped second. AngularJS always owns the
 *    root component of the application.
 * 9. The new application is running in an Angular zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### The `UpgradeModule` class
 *
 * This class is an `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * * Core AngularJS services<br />
 *   Importing this `NgModule` will add providers for the core
 *   [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * * Bootstrap<br />
 *   The runtime instance of this class contains a {@link UpgradeModule#bootstrap `bootstrap()`}
 *   method, which you use to bootstrap the top level AngularJS module onto an element in the
 *   DOM for the hybrid upgrade app.
 *
 *   It also contains properties to access the {@link UpgradeModule#injector root injector}, the
 *   bootstrap `NgZone` and the
 *   [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
 *
 * ### Examples
 *
 * Import the `UpgradeModule` into your top level {@link NgModule Angular `NgModule`}.
 *
 * {@example upgrade/static/ts/full/module.ts region='ng2-module'}
 *
 * Then inject `UpgradeModule` into your Angular `NgModule` and use it to bootstrap the top level
 * [AngularJS module](https://docs.angularjs.org/api/ng/type/angular.Module) in the
 * `ngDoBootstrap()` method.
 *
 * {@example upgrade/static/ts/full/module.ts region='bootstrap-ng1'}
 *
 * Finally, kick off the whole process, by bootstrapping your top level Angular `NgModule`.
 *
 * {@example upgrade/static/ts/full/module.ts region='bootstrap-ng2'}
 *
 * {@a upgrading-an-angular-1-service}
 * ### Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-text-formatter-service"}
 *
 * Then you should define an Angular provider to be included in your `NgModule` `providers`
 * property.
 *
 * {@example upgrade/static/ts/full/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {@example upgrade/static/ts/full/module.ts region="use-ng1-upgraded-service"}
 *
 * @publicApi
 */
class UpgradeModule {
    ngZone;
    platformRef;
    /**
     * The AngularJS `$injector` for the upgrade application.
     */
    $injector;
    /** The Angular Injector **/
    injector;
    constructor(
    /** The root `Injector` for the upgrade application. */
    injector, 
    /** The bootstrap zone for the upgrade application */
    ngZone, 
    /**
     * The owning `NgModuleRef`s `PlatformRef` instance.
     * This is used to tie the lifecycle of the bootstrapped AngularJS apps to that of the Angular
     * `PlatformRef`.
     */
    platformRef) {
        this.ngZone = ngZone;
        this.platformRef = platformRef;
        this.injector = new NgAdapterInjector(injector);
    }
    /**
     * Bootstrap an AngularJS application from this NgModule
     * @param element the element on which to bootstrap the AngularJS application
     * @param [modules] the AngularJS modules to bootstrap for this application
     * @param [config] optional extra AngularJS bootstrap configuration
     * @return The value returned by
     *     [angular.bootstrap()](https://docs.angularjs.org/api/ng/function/angular.bootstrap).
     */
    bootstrap(element$1, modules = [], config /*angular.IAngularBootstrapConfig*/) {
        const INIT_MODULE_NAME = UPGRADE_MODULE_NAME + '.init';
        // Create an ng1 module to bootstrap
        module_(INIT_MODULE_NAME, [])
            .constant(UPGRADE_APP_TYPE_KEY, 2 /* ɵutil.UpgradeAppType.Static */)
            .value(INJECTOR_KEY, this.injector)
            .factory(LAZY_MODULE_REF, [
            INJECTOR_KEY,
            (injector) => ({ injector }),
        ])
            .config([
            $PROVIDE,
            $INJECTOR,
            ($provide, $injector) => {
                if ($injector.has($$TESTABILITY)) {
                    $provide.decorator($$TESTABILITY, [
                        $DELEGATE,
                        (testabilityDelegate) => {
                            const originalWhenStable = testabilityDelegate.whenStable;
                            const injector = this.injector;
                            // Cannot use arrow function below because we need the context
                            const newWhenStable = function (callback) {
                                originalWhenStable.call(testabilityDelegate, function () {
                                    const ng2Testability = injector.get(Testability);
                                    if (ng2Testability.isStable()) {
                                        callback();
                                    }
                                    else {
                                        ng2Testability.whenStable(newWhenStable.bind(testabilityDelegate, callback));
                                    }
                                });
                            };
                            testabilityDelegate.whenStable = newWhenStable;
                            return testabilityDelegate;
                        },
                    ]);
                }
                if ($injector.has($INTERVAL)) {
                    $provide.decorator($INTERVAL, [
                        $DELEGATE,
                        (intervalDelegate) => {
                            // Wrap the $interval service so that setInterval is called outside NgZone,
                            // but the callback is still invoked within it. This is so that $interval
                            // won't block stability, which preserves the behavior from AngularJS.
                            let wrappedInterval = (fn, delay, count, invokeApply, ...pass) => {
                                return this.ngZone.runOutsideAngular(() => {
                                    return intervalDelegate((...args) => {
                                        // Run callback in the next VM turn - $interval calls
                                        // $rootScope.$apply, and running the callback in NgZone will
                                        // cause a '$digest already in progress' error if it's in the
                                        // same vm turn.
                                        setTimeout(() => {
                                            this.ngZone.run(() => fn(...args));
                                        });
                                    }, delay, count, invokeApply, ...pass);
                                });
                            };
                            Object.keys(intervalDelegate).forEach((prop) => (wrappedInterval[prop] = intervalDelegate[prop]));
                            // the `flush` method will be present when ngMocks is used
                            if (intervalDelegate.hasOwnProperty('flush')) {
                                wrappedInterval['flush'] = () => {
                                    intervalDelegate['flush']();
                                    return wrappedInterval;
                                };
                            }
                            return wrappedInterval;
                        },
                    ]);
                }
            },
        ])
            .run([
            $INJECTOR,
            ($injector) => {
                this.$injector = $injector;
                const $rootScope = $injector.get('$rootScope');
                // Initialize the ng1 $injector provider
                setTempInjectorRef($injector);
                this.injector.get($INJECTOR);
                // Put the injector on the DOM, so that it can be "required"
                element(element$1).data(controllerKey(INJECTOR_KEY), this.injector);
                // Destroy the AngularJS app once the Angular `PlatformRef` is destroyed.
                // This does not happen in a typical SPA scenario, but it might be useful for
                // other use-cases where disposing of an Angular/AngularJS app is necessary
                // (such as Hot Module Replacement (HMR)).
                // See https://github.com/angular/angular/issues/39935.
                this.platformRef.onDestroy(() => destroyApp($injector));
                // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
                // We need to do this in the next tick so that we don't prevent the bootup stabilizing
                setTimeout(() => {
                    const subscription = this.ngZone.onMicrotaskEmpty.subscribe(() => {
                        if ($rootScope.$$phase) {
                            if (typeof ngDevMode === 'undefined' || ngDevMode) {
                                console.warn('A digest was triggered while one was already in progress. This may mean that something is triggering digests outside the Angular zone.');
                            }
                            return $rootScope.$evalAsync();
                        }
                        return $rootScope.$digest();
                    });
                    $rootScope.$on('$destroy', () => {
                        subscription.unsubscribe();
                    });
                }, 0);
            },
        ]);
        const upgradeModule = module_(UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        const windowAngular = window['angular'];
        windowAngular.resumeBootstrap = undefined;
        // Bootstrap the AngularJS application inside our zone
        const returnValue = this.ngZone.run(() => bootstrap(element$1, [upgradeModule.name], config));
        // Patch resumeBootstrap() to run inside the ngZone
        if (windowAngular.resumeBootstrap) {
            const originalResumeBootstrap = windowAngular.resumeBootstrap;
            const ngZone = this.ngZone;
            windowAngular.resumeBootstrap = function () {
                let args = arguments;
                windowAngular.resumeBootstrap = originalResumeBootstrap;
                return ngZone.run(() => windowAngular.resumeBootstrap.apply(this, args));
            };
        }
        return returnValue;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0-next.0+sha-51b8ff2", ngImport: i0, type: UpgradeModule, deps: [{ token: i0.Injector }, { token: i0.NgZone }, { token: i0.PlatformRef }], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "20.0.0-next.0+sha-51b8ff2", ngImport: i0, type: UpgradeModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "20.0.0-next.0+sha-51b8ff2", ngImport: i0, type: UpgradeModule, providers: [angular1Providers] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0-next.0+sha-51b8ff2", ngImport: i0, type: UpgradeModule, decorators: [{
            type: NgModule,
            args: [{ providers: [angular1Providers] }]
        }], ctorParameters: () => [{ type: i0.Injector }, { type: i0.NgZone }, { type: i0.PlatformRef }] });

// This file only re-exports items to appear in the public api. Keep it that way.

// This file is not used to build this module. It is only used during editing

/**
 * Generated bundle index. Do not edit.
 */

export { UpgradeComponent, UpgradeModule, VERSION, downgradeComponent, downgradeInjectable, downgradeModule, getAngularJSGlobal, getAngularLib, setAngularJSGlobal, setAngularLib, angular1 as ɵangular1, constants as ɵconstants, upgrade_helper as ɵupgradeHelper, util as ɵutil };
//# sourceMappingURL=static.mjs.map
