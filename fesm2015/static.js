/**
 * @license Angular v7.2.4
 * (c) 2010-2019 Google LLC. https://angular.io/
 * License: MIT
 */

import { Injector, ChangeDetectorRef, Testability, TestabilityRegistry, ApplicationRef, SimpleChange, NgZone, ComponentFactoryResolver, Version, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR, ɵlooseIdentical, EventEmitter, NgModule } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @return {?}
 */
function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
const ɵ0 = () => noNg();
/** @type {?} */
const noNgElement = (/** @type {?} */ ((ɵ0)));
noNgElement.cleanData = noNg;
/** @type {?} */
let angular = {
    bootstrap: noNg,
    module: noNg,
    element: noNgElement,
    version: (/** @type {?} */ (undefined)),
    resumeBootstrap: noNg,
    getTestability: noNg
};
try {
    if (window.hasOwnProperty('angular')) {
        angular = ((/** @type {?} */ (window))).angular;
    }
}
catch (_a) {
    // ignore in CJS mode.
}
/**
 * @deprecated Use `setAngularJSGlobal` instead.
 *
 * \@publicApi
 * @param {?} ng
 * @return {?}
 */
function setAngularLib(ng) {
    setAngularJSGlobal(ng);
}
/**
 * @deprecated Use `getAngularJSGlobal` instead.
 *
 * \@publicApi
 * @return {?}
 */
function getAngularLib() {
    return getAngularJSGlobal();
}
/**
 * Resets the AngularJS global.
 *
 * Used when AngularJS is loaded lazily, and not available on `window`.
 *
 * \@publicApi
 * @param {?} ng
 * @return {?}
 */
function setAngularJSGlobal(ng) {
    angular = ng;
    version = ng && ng.version;
}
/**
 * Returns the current AngularJS global.
 *
 * \@publicApi
 * @return {?}
 */
function getAngularJSGlobal() {
    return angular;
}
/** @type {?} */
const bootstrap = (e, modules, config) => angular.bootstrap(e, modules, config);
/** @type {?} */
const module$1 = (prefix, dependencies) => angular.module(prefix, dependencies);
/** @type {?} */
const element = (/** @type {?} */ ((e => angular.element(e))));
element.cleanData = nodes => angular.element.cleanData(nodes);
/** @type {?} */
let version = angular.version;

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @type {?} */
const $COMPILE = '$compile';
/** @type {?} */
const $CONTROLLER = '$controller';
/** @type {?} */
const $DELEGATE = '$delegate';
/** @type {?} */
const $HTTP_BACKEND = '$httpBackend';
/** @type {?} */
const $INJECTOR = '$injector';
/** @type {?} */
const $INTERVAL = '$interval';
/** @type {?} */
const $PARSE = '$parse';
/** @type {?} */
const $PROVIDE = '$provide';
/** @type {?} */
const $SCOPE = '$scope';
/** @type {?} */
const $TEMPLATE_CACHE = '$templateCache';
/** @type {?} */
const $$TESTABILITY = '$$testability';
/** @type {?} */
const DOWNGRADED_MODULE_COUNT_KEY = '$$angularDowngradedModuleCount';
/** @type {?} */
const INJECTOR_KEY = '$$angularInjector';
/** @type {?} */
const LAZY_MODULE_REF = '$$angularLazyModuleRef';
/** @type {?} */
const UPGRADE_APP_TYPE_KEY = '$$angularUpgradeAppType';
/** @type {?} */
const REQUIRE_INJECTOR = '?^^' + INJECTOR_KEY;
/** @type {?} */
const REQUIRE_NG_MODEL = '?ngModel';
/** @type {?} */
const UPGRADE_MODULE_NAME = '$$UpgradeModule';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A `PropertyBinding` represents a mapping between a property name
 * and an attribute name. It is parsed from a string of the form
 * `"prop: attr"`; or simply `"propAndAttr" where the property
 * and attribute have the same identifier.
 */
class PropertyBinding {
    /**
     * @param {?} prop
     * @param {?} attr
     */
    constructor(prop, attr) {
        this.prop = prop;
        this.attr = attr;
        this.parseBinding();
    }
    /**
     * @private
     * @return {?}
     */
    parseBinding() {
        this.bracketAttr = `[${this.attr}]`;
        this.parenAttr = `(${this.attr})`;
        this.bracketParenAttr = `[(${this.attr})]`;
        /** @type {?} */
        const capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.substr(1);
        this.onAttr = `on${capitalAttr}`;
        this.bindAttr = `bind${capitalAttr}`;
        this.bindonAttr = `bindon${capitalAttr}`;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const DIRECTIVE_PREFIX_REGEXP = /^(?:x|data)[:\-_]/i;
/** @type {?} */
const DIRECTIVE_SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;
/**
 * @param {?} name
 * @return {?}
 */
function controllerKey(name) {
    return '$' + name + 'Controller';
}
/**
 * @param {?} name
 * @return {?}
 */
function directiveNormalize(name) {
    return name.replace(DIRECTIVE_PREFIX_REGEXP, '')
        .replace(DIRECTIVE_SPECIAL_CHARS_REGEXP, (_, letter) => letter.toUpperCase());
}
/**
 * @param {?} type
 * @return {?}
 */
function getTypeName(type) {
    // Return the name of the type or the first line of its stringified version.
    return ((/** @type {?} */ (type))).overriddenName || type.name || type.toString().split('\n')[0];
}
/**
 * @param {?} $injector
 * @return {?}
 */
function getDowngradedModuleCount($injector) {
    return $injector.has(DOWNGRADED_MODULE_COUNT_KEY) ? $injector.get(DOWNGRADED_MODULE_COUNT_KEY) :
        0;
}
/**
 * @param {?} $injector
 * @return {?}
 */
function getUpgradeAppType($injector) {
    return $injector.has(UPGRADE_APP_TYPE_KEY) ? $injector.get(UPGRADE_APP_TYPE_KEY) :
        0 /* None */;
}
/**
 * @param {?} value
 * @return {?}
 */
function isFunction(value) {
    return typeof value === 'function';
}
/**
 * @param {?} $injector
 * @param {?} downgradedModule
 * @param {?} injectionKey
 * @param {?} attemptedAction
 * @return {?}
 */
function validateInjectionKey($injector, downgradedModule, injectionKey, attemptedAction) {
    /** @type {?} */
    const upgradeAppType = getUpgradeAppType($injector);
    /** @type {?} */
    const downgradedModuleCount = getDowngradedModuleCount($injector);
    // Check for common errors.
    switch (upgradeAppType) {
        case 1 /* Dynamic */:
        case 2 /* Static */:
            if (downgradedModule) {
                throw new Error(`Error while ${attemptedAction}: 'downgradedModule' unexpectedly specified.\n` +
                    'You should not specify a value for \'downgradedModule\', unless you are downgrading ' +
                    'more than one Angular module (via \'downgradeModule()\').');
            }
            break;
        case 3 /* Lite */:
            if (!downgradedModule && (downgradedModuleCount >= 2)) {
                throw new Error(`Error while ${attemptedAction}: 'downgradedModule' not specified.\n` +
                    'This application contains more than one downgraded Angular module, thus you need to ' +
                    'always specify \'downgradedModule\' when downgrading components and injectables.');
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
/**
 * @param {?} component
 * @return {?} Whether the passed-in component implements the subset of the
 *     `ControlValueAccessor` interface needed for AngularJS `ng-model`
 *     compatibility.
 */
function supportsNgModel(component) {
    return typeof component.writeValue === 'function' &&
        typeof component.registerOnChange === 'function';
}
/**
 * Glue the AngularJS `NgModelController` (if it exists) to the component
 * (if it implements the needed subset of the `ControlValueAccessor` interface).
 * @param {?} ngModel
 * @param {?} component
 * @return {?}
 */
function hookupNgModel(ngModel, component) {
    if (ngModel && supportsNgModel(component)) {
        ngModel.$render = () => { component.writeValue(ngModel.$viewValue); };
        component.registerOnChange(ngModel.$setViewValue.bind(ngModel));
        if (typeof component.registerOnTouched === 'function') {
            component.registerOnTouched(ngModel.$setTouched.bind(ngModel));
        }
    }
}
/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 * @param {?} val1
 * @param {?} val2
 * @return {?}
 */
function strictEquals(val1, val2) {
    return val1 === val2 || (val1 !== val1 && val2 !== val2);
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
class DowngradeComponentAdapter {
    /**
     * @param {?} element
     * @param {?} attrs
     * @param {?} scope
     * @param {?} ngModel
     * @param {?} parentInjector
     * @param {?} $injector
     * @param {?} $compile
     * @param {?} $parse
     * @param {?} componentFactory
     * @param {?} wrapCallback
     */
    constructor(element, attrs, scope, ngModel, parentInjector, $injector, $compile, $parse, componentFactory, wrapCallback) {
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.ngModel = ngModel;
        this.parentInjector = parentInjector;
        this.$injector = $injector;
        this.$compile = $compile;
        this.$parse = $parse;
        this.componentFactory = componentFactory;
        this.wrapCallback = wrapCallback;
        this.implementsOnChanges = false;
        this.inputChangeCount = 0;
        this.inputChanges = {};
        this.componentScope = scope.$new();
    }
    /**
     * @return {?}
     */
    compileContents() {
        /** @type {?} */
        const compiledProjectableNodes = [];
        /** @type {?} */
        const projectableNodes = this.groupProjectableNodes();
        /** @type {?} */
        const linkFns = projectableNodes.map(nodes => this.$compile(nodes));
        (/** @type {?} */ (this.element.empty))();
        linkFns.forEach(linkFn => {
            linkFn(this.scope, (clone) => {
                compiledProjectableNodes.push(clone);
                (/** @type {?} */ (this.element.append))(clone);
            });
        });
        return compiledProjectableNodes;
    }
    /**
     * @param {?} projectableNodes
     * @return {?}
     */
    createComponent(projectableNodes) {
        /** @type {?} */
        const providers = [{ provide: $SCOPE, useValue: this.componentScope }];
        /** @type {?} */
        const childInjector = Injector.create({ providers: providers, parent: this.parentInjector, name: 'DowngradeComponentAdapter' });
        this.componentRef =
            this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        this.viewChangeDetector = this.componentRef.injector.get(ChangeDetectorRef);
        this.changeDetector = this.componentRef.changeDetectorRef;
        this.component = this.componentRef.instance;
        // testability hook is commonly added during component bootstrap in
        // packages/core/src/application_ref.bootstrap()
        // in downgraded application, component creation will take place here as well as adding the
        // testability hook.
        /** @type {?} */
        const testability = this.componentRef.injector.get(Testability, null);
        if (testability) {
            this.componentRef.injector.get(TestabilityRegistry)
                .registerApplication(this.componentRef.location.nativeElement, testability);
        }
        hookupNgModel(this.ngModel, this.component);
    }
    /**
     * @param {?} manuallyAttachView
     * @param {?=} propagateDigest
     * @return {?}
     */
    setupInputs(manuallyAttachView, propagateDigest = true) {
        /** @type {?} */
        const attrs = this.attrs;
        /** @type {?} */
        const inputs = this.componentFactory.inputs || [];
        for (let i = 0; i < inputs.length; i++) {
            /** @type {?} */
            const input = new PropertyBinding(inputs[i].propName, inputs[i].templateName);
            /** @type {?} */
            let expr = null;
            if (attrs.hasOwnProperty(input.attr)) {
                /** @type {?} */
                const observeFn = (prop => {
                    /** @type {?} */
                    let prevValue = INITIAL_VALUE;
                    return (currValue) => {
                        // Initially, both `$observe()` and `$watch()` will call this function.
                        if (!strictEquals(prevValue, currValue)) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            this.updateInput(prop, prevValue, currValue);
                            prevValue = currValue;
                        }
                    };
                })(input.prop);
                attrs.$observe(input.attr, observeFn);
                // Use `$watch()` (in addition to `$observe()`) in order to initialize the input in time
                // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
                // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
                /** @type {?} */
                let unwatch = this.componentScope.$watch(() => {
                    (/** @type {?} */ (unwatch))();
                    unwatch = null;
                    observeFn(attrs[input.attr]);
                });
            }
            else if (attrs.hasOwnProperty(input.bindAttr)) {
                expr = attrs[input.bindAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketAttr)) {
                expr = attrs[input.bracketAttr];
            }
            else if (attrs.hasOwnProperty(input.bindonAttr)) {
                expr = attrs[input.bindonAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
                expr = attrs[input.bracketParenAttr];
            }
            if (expr != null) {
                /** @type {?} */
                const watchFn = (prop => (currValue, prevValue) => this.updateInput(prop, prevValue, currValue))(input.prop);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        // Invoke `ngOnChanges()` and Change Detection (when necessary)
        /** @type {?} */
        const detectChanges = () => this.changeDetector.detectChanges();
        /** @type {?} */
        const prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && ((/** @type {?} */ (prototype))).ngOnChanges);
        this.componentScope.$watch(() => this.inputChangeCount, this.wrapCallback(() => {
            // Invoke `ngOnChanges()`
            if (this.implementsOnChanges) {
                /** @type {?} */
                const inputChanges = this.inputChanges;
                this.inputChanges = {};
                ((/** @type {?} */ (this.component))).ngOnChanges((/** @type {?} */ (inputChanges)));
            }
            this.viewChangeDetector.markForCheck();
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
            /** @type {?} */
            let unwatch = this.componentScope.$watch(() => {
                (/** @type {?} */ (unwatch))();
                unwatch = null;
                /** @type {?} */
                const appRef = this.parentInjector.get(ApplicationRef);
                appRef.attachView(this.componentRef.hostView);
            });
        }
    }
    /**
     * @return {?}
     */
    setupOutputs() {
        /** @type {?} */
        const attrs = this.attrs;
        /** @type {?} */
        const outputs = this.componentFactory.outputs || [];
        for (let j = 0; j < outputs.length; j++) {
            /** @type {?} */
            const output = new PropertyBinding(outputs[j].propName, outputs[j].templateName);
            /** @type {?} */
            const bindonAttr = output.bindonAttr.substring(0, output.bindonAttr.length - 6);
            /** @type {?} */
            const bracketParenAttr = `[(${output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8)})]`;
            // order below is important - first update bindings then evaluate expressions
            if (attrs.hasOwnProperty(bindonAttr)) {
                this.subscribeToOutput(output, attrs[bindonAttr], true);
            }
            if (attrs.hasOwnProperty(bracketParenAttr)) {
                this.subscribeToOutput(output, attrs[bracketParenAttr], true);
            }
            if (attrs.hasOwnProperty(output.onAttr)) {
                this.subscribeToOutput(output, attrs[output.onAttr]);
            }
            if (attrs.hasOwnProperty(output.parenAttr)) {
                this.subscribeToOutput(output, attrs[output.parenAttr]);
            }
        }
    }
    /**
     * @private
     * @param {?} output
     * @param {?} expr
     * @param {?=} isAssignment
     * @return {?}
     */
    subscribeToOutput(output, expr, isAssignment = false) {
        /** @type {?} */
        const getter = this.$parse(expr);
        /** @type {?} */
        const setter = getter.assign;
        if (isAssignment && !setter) {
            throw new Error(`Expression '${expr}' is not assignable!`);
        }
        /** @type {?} */
        const emitter = (/** @type {?} */ (this.component[output.prop]));
        if (emitter) {
            emitter.subscribe({
                next: isAssignment ? (v) => (/** @type {?} */ (setter))(this.scope, v) :
                    (v) => getter(this.scope, { '$event': v })
            });
        }
        else {
            throw new Error(`Missing emitter '${output.prop}' on component '${getTypeName(this.componentFactory.componentType)}'!`);
        }
    }
    /**
     * @return {?}
     */
    registerCleanup() {
        /** @type {?} */
        const destroyComponentRef = this.wrapCallback(() => this.componentRef.destroy());
        /** @type {?} */
        let destroyed = false;
        (/** @type {?} */ (this.element.on))('$destroy', () => this.componentScope.$destroy());
        this.componentScope.$on('$destroy', () => {
            if (!destroyed) {
                destroyed = true;
                this.componentRef.injector.get(TestabilityRegistry)
                    .unregisterApplication(this.componentRef.location.nativeElement);
                destroyComponentRef();
            }
        });
    }
    /**
     * @return {?}
     */
    getInjector() { return this.componentRef.injector; }
    /**
     * @private
     * @param {?} prop
     * @param {?} prevValue
     * @param {?} currValue
     * @return {?}
     */
    updateInput(prop, prevValue, currValue) {
        if (this.implementsOnChanges) {
            this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
        }
        this.inputChangeCount++;
        this.component[prop] = currValue;
    }
    /**
     * @return {?}
     */
    groupProjectableNodes() {
        /** @type {?} */
        let ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, (/** @type {?} */ (this.element.contents))());
    }
}
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 * @param {?} ngContentSelectors
 * @param {?} nodes
 * @return {?}
 */
function groupNodesBySelector(ngContentSelectors, nodes) {
    /** @type {?} */
    const projectableNodes = [];
    for (let i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
        projectableNodes[i] = [];
    }
    for (let j = 0, jj = nodes.length; j < jj; ++j) {
        /** @type {?} */
        const node = nodes[j];
        /** @type {?} */
        const ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
        if (ngContentIndex != null) {
            projectableNodes[ngContentIndex].push(node);
        }
    }
    return projectableNodes;
}
/**
 * @param {?} element
 * @param {?} ngContentSelectors
 * @return {?}
 */
function findMatchingNgContentIndex(element, ngContentSelectors) {
    /** @type {?} */
    const ngContentIndices = [];
    /** @type {?} */
    let wildcardNgContentIndex = -1;
    for (let i = 0; i < ngContentSelectors.length; i++) {
        /** @type {?} */
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
/** @type {?} */
let _matches;
/**
 * @param {?} el
 * @param {?} selector
 * @return {?}
 */
function matchesSelector(el, selector) {
    if (!_matches) {
        /** @type {?} */
        const elProto = (/** @type {?} */ (Element.prototype));
        _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
            elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
    }
    return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * \@description
 *
 * A helper function that allows an Angular component to be used from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper function returns a factory function to be used for registering
 * an AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * \@usageNotes
 * ### Examples
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-heroes-wrapper"}
 *
 * \@publicApi
 * @param {?} info contains information about the Component that is being downgraded:
 *
 * - `component: Type<any>`: The type of the Component that will be downgraded
 * - `downgradedModule?: string`: The name of the downgraded module (if any) that the component
 *   "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose
 *   corresponding Angular module will be bootstrapped, when the component needs to be instantiated.
 *   <br />
 *   (This option is only necessary when using `downgradeModule()` to downgrade more than one
 *   Angular module.)
 * - `propagateDigest?: boolean`: Whether to perform {\@link ChangeDetectorRef#detectChanges
 *   change detection} on the component on every
 *   [$digest](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest). If set to `false`,
 *   change detection will still be performed when any of the component's inputs changes.
 *   (Default: true)
 *
 * @return {?} a factory function that can be used to register the component in an
 * AngularJS module.
 *
 */
function downgradeComponent(info) {
    /** @type {?} */
    const directiveFactory = function ($compile, $injector, $parse) {
        // When using `downgradeModule()`, we need to handle certain things specially. For example:
        // - We always need to attach the component view to the `ApplicationRef` for it to be
        //   dirty-checked.
        // - We need to ensure callbacks to Angular APIs (e.g. change detection) are run inside the
        //   Angular zone.
        //   NOTE: This is not needed, when using `UpgradeModule`, because `$digest()` will be run
        //         inside the Angular zone (except if explicitly escaped, in which case we shouldn't
        //         force it back in).
        /** @type {?} */
        const isNgUpgradeLite = getUpgradeAppType($injector) === 3 /* Lite */;
        /** @type {?} */
        const wrapCallback = !isNgUpgradeLite ? cb => cb : cb => () => NgZone.isInAngularZone() ? cb() : ngZone.run(cb);
        /** @type {?} */
        let ngZone;
        // When downgrading multiple modules, special handling is needed wrt injectors.
        /** @type {?} */
        const hasMultipleDowngradedModules = isNgUpgradeLite && (getDowngradedModuleCount($injector) > 1);
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: (scope, element, attrs, required) => {
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                /** @type {?} */
                const ngModel = required[1];
                /** @type {?} */
                const parentInjector = required[0];
                /** @type {?} */
                let moduleInjector = undefined;
                /** @type {?} */
                let ranAsync = false;
                if (!parentInjector || hasMultipleDowngradedModules) {
                    /** @type {?} */
                    const downgradedModule = info.downgradedModule || '';
                    /** @type {?} */
                    const lazyModuleRefKey = `${LAZY_MODULE_REF}${downgradedModule}`;
                    /** @type {?} */
                    const attemptedAction = `instantiating component '${getTypeName(info.component)}'`;
                    validateInjectionKey($injector, downgradedModule, lazyModuleRefKey, attemptedAction);
                    /** @type {?} */
                    const lazyModuleRef = (/** @type {?} */ ($injector.get(lazyModuleRefKey)));
                    moduleInjector = lazyModuleRef.injector || (/** @type {?} */ (lazyModuleRef.promise));
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
                /** @type {?} */
                const finalParentInjector = parentInjector || (/** @type {?} */ (moduleInjector));
                // If this is a "top-level" Angular component or the parent component may belong to a
                // different `NgModule`, use the module injector for module-specific dependencies.
                // If there is a parent component that belongs to the same `NgModule`, use its injector.
                /** @type {?} */
                const finalModuleInjector = moduleInjector || (/** @type {?} */ (parentInjector));
                /** @type {?} */
                const doDowngrade = (injector, moduleInjector) => {
                    // Retrieve `ComponentFactoryResolver` from the injector tied to the `NgModule` this
                    // component belongs to.
                    /** @type {?} */
                    const componentFactoryResolver = moduleInjector.get(ComponentFactoryResolver);
                    /** @type {?} */
                    const componentFactory = (/** @type {?} */ (componentFactoryResolver.resolveComponentFactory(info.component)));
                    if (!componentFactory) {
                        throw new Error(`Expecting ComponentFactory for: ${getTypeName(info.component)}`);
                    }
                    /** @type {?} */
                    const injectorPromise = new ParentInjectorPromise(element);
                    /** @type {?} */
                    const facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory, wrapCallback);
                    /** @type {?} */
                    const projectableNodes = facade.compileContents();
                    facade.createComponent(projectableNodes);
                    facade.setupInputs(isNgUpgradeLite, info.propagateDigest);
                    facade.setupOutputs();
                    facade.registerCleanup();
                    injectorPromise.resolve(facade.getInjector());
                    if (ranAsync) {
                        // If this is run async, it is possible that it is not run inside a
                        // digest and initial input values will not be detected.
                        scope.$evalAsync(() => { });
                    }
                };
                /** @type {?} */
                const downgradeFn = !isNgUpgradeLite ? doDowngrade : (pInjector, mInjector) => {
                    if (!ngZone) {
                        ngZone = pInjector.get(NgZone);
                    }
                    wrapCallback(() => doDowngrade(pInjector, mInjector))();
                };
                if (isThenable(finalParentInjector) || isThenable(finalModuleInjector)) {
                    Promise.all([finalParentInjector, finalModuleInjector])
                        .then(([pInjector, mInjector]) => downgradeFn(pInjector, mInjector));
                }
                else {
                    downgradeFn(finalParentInjector, finalModuleInjector);
                }
                ranAsync = true;
            }
        };
    };
    // bracket-notation because of closure - see #14441
    directiveFactory['$inject'] = [$COMPILE, $INJECTOR, $PARSE];
    return directiveFactory;
}
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of Angular 1's $compile.
 */
class ParentInjectorPromise {
    /**
     * @param {?} element
     */
    constructor(element) {
        this.element = element;
        this.injectorKey = controllerKey(INJECTOR_KEY);
        this.callbacks = [];
        // Store the promise on the element.
        (/** @type {?} */ (element.data))(this.injectorKey, this);
    }
    /**
     * @param {?} callback
     * @return {?}
     */
    then(callback) {
        if (this.injector) {
            callback(this.injector);
        }
        else {
            this.callbacks.push(callback);
        }
    }
    /**
     * @param {?} injector
     * @return {?}
     */
    resolve(injector) {
        this.injector = injector;
        // Store the real injector on the element.
        (/** @type {?} */ (this.element.data))(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = (/** @type {?} */ (null));
        // Run the queued callbacks.
        this.callbacks.forEach(callback => callback(injector));
        this.callbacks.length = 0;
    }
}
/**
 * @template T
 * @param {?} obj
 * @return {?}
 */
function isThenable(obj) {
    return isFunction(((/** @type {?} */ (obj))).then);
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * \@description
 *
 * A helper function to allow an Angular service to be accessible from AngularJS.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * This helper function returns a factory function that provides access to the Angular
 * service identified by the `token` parameter.
 *
 * \@usageNotes
 * ### Examples
 *
 * First ensure that the service to be downgraded is provided in an `NgModule`
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app `NgModule`
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {\@example upgrade/static/ts/full/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {\@example upgrade/static/ts/full/module.ts region="example-app"}
 *
 * <div class="alert is-important">
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
 * \@publicApi
 * @param {?} token an `InjectionToken` that identifies a service provided from Angular.
 * @param {?=} downgradedModule the name of the downgraded module (if any) that the injectable
 * "belongs to", as returned by a call to `downgradeModule()`. It is the module, whose injector will
 * be used for instantiating the injectable.<br />
 * (This option is only necessary when using `downgradeModule()` to downgrade more than one Angular
 * module.)
 *
 * @return {?} a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 */
function downgradeInjectable(token, downgradedModule = '') {
    /** @type {?} */
    const factory = function ($injector) {
        /** @type {?} */
        const injectorKey = `${INJECTOR_KEY}${downgradedModule}`;
        /** @type {?} */
        const injectableName = isFunction(token) ? getTypeName(token) : String(token);
        /** @type {?} */
        const attemptedAction = `instantiating injectable '${injectableName}'`;
        validateInjectionKey($injector, downgradedModule, injectorKey, attemptedAction);
        /** @type {?} */
        const injector = $injector.get(injectorKey);
        return injector.get(token);
    };
    ((/** @type {?} */ (factory)))['$inject'] = [$INJECTOR];
    return factory;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * \@publicApi
 * @type {?}
 */
const VERSION = new Version('7.2.4');

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// We have to do a little dance to get the ng1 injector into the module injector.
// We store the ng1 injector so that the provider in the module injector can access it
// Then we "get" the ng1 injector from the module injector, which triggers the provider to read
// the stored injector and release the reference to it.
/** @type {?} */
let tempInjectorRef = null;
/**
 * @param {?} injector
 * @return {?}
 */
function setTempInjectorRef(injector) {
    tempInjectorRef = injector;
}
/**
 * @return {?}
 */
function injectorFactory() {
    if (!tempInjectorRef) {
        throw new Error('Trying to get the AngularJS injector before it being set.');
    }
    /** @type {?} */
    const injector = tempInjectorRef;
    tempInjectorRef = null; // clear the value to prevent memory leaks
    return injector;
}
/**
 * @param {?} i
 * @return {?}
 */
function rootScopeFactory(i) {
    return i.get('$rootScope');
}
/**
 * @param {?} i
 * @return {?}
 */
function compileFactory(i) {
    return i.get('$compile');
}
/**
 * @param {?} i
 * @return {?}
 */
function parseFactory(i) {
    return i.get('$parse');
}
/** @type {?} */
const angular1Providers = [
    // We must use exported named functions for the ng2 factories to keep the compiler happy:
    // > Metadata collected contains an error that will be reported at runtime:
    // >   Function calls are not supported.
    // >   Consider replacing the function or lambda with a reference to an exported function
    { provide: '$injector', useFactory: injectorFactory, deps: [] },
    { provide: '$rootScope', useFactory: rootScopeFactory, deps: ['$injector'] },
    { provide: '$compile', useFactory: compileFactory, deps: ['$injector'] },
    { provide: '$parse', useFactory: parseFactory, deps: ['$injector'] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class NgAdapterInjector {
    /**
     * @param {?} modInjector
     */
    constructor(modInjector) {
        this.modInjector = modInjector;
    }
    // When Angular locate a service in the component injector tree, the not found value is set to
    // `NOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR`. In such a case we should not walk up to the module
    // injector.
    // AngularJS only supports a single tree and should always check the module injector.
    /**
     * @param {?} token
     * @param {?=} notFoundValue
     * @return {?}
     */
    get(token, notFoundValue) {
        if (notFoundValue === ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR) {
            return notFoundValue;
        }
        return this.modInjector.get(token, notFoundValue);
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
let moduleUid = 0;
/**
 * \@description
 *
 * A helper function for creating an AngularJS module that can bootstrap an Angular module
 * "on-demand" (possibly lazily) when a {\@link downgradeComponent downgraded component} needs to be
 * instantiated.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static) library for hybrid upgrade apps that
 * support AoT compilation.*
 *
 * It allows loading/bootstrapping the Angular part of a hybrid application lazily and not having to
 * pay the cost up-front. For example, you can have an AngularJS application that uses Angular for
 * specific routes and only instantiate the Angular modules if/when the user visits one of these
 * routes.
 *
 * The Angular module will be bootstrapped once (when requested for the first time) and the same
 * reference will be used from that point onwards.
 *
 * `downgradeModule()` requires either an `NgModuleFactory` or a function:
 * - `NgModuleFactory`: If you pass an `NgModuleFactory`, it will be used to instantiate a module
 *   using `platformBrowser`'s {\@link PlatformRef#bootstrapModuleFactory bootstrapModuleFactory()}.
 * - `Function`: If you pass a function, it is expected to return a promise resolving to an
 *   `NgModuleRef`. The function is called with an array of extra {\@link StaticProvider Providers}
 *   that are expected to be available from the returned `NgModuleRef`'s `Injector`.
 *
 * `downgradeModule()` returns the name of the created AngularJS wrapper module. You can use it to
 * declare a dependency in your main AngularJS module.
 *
 * {\@example upgrade/static/ts/lite/module.ts region="basic-how-to"}
 *
 * For more details on how to use `downgradeModule()` see
 * [Upgrading for Performance](guide/upgrade-performance).
 *
 * \@usageNotes
 *
 * Apart from `UpgradeModule`, you can use the rest of the `upgrade/static` helpers as usual to
 * build a hybrid application. Note that the Angular pieces (e.g. downgraded services) will not be
 * available until the downgraded module has been bootstrapped, i.e. by instantiating a downgraded
 * component.
 *
 * <div class="alert is-important">
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
 *    inside the {\@link NgZone Angular zone}.
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
 * [Upgrading for Performance](guide/upgrade-performance).
 *
 * <div class="alert is-helpful">
 *
 *   You can manually trigger a change detection run in AngularJS using
 *   [scope.$apply(...)](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply) or
 *   [$rootScope.$digest()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$digest).
 *
 *   You can manually trigger a change detection run in Angular using {\@link NgZone#run
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
 * - When using {\@link PlatformRef#bootstrapmodule `bootstrapModule()`} or
 *   {\@link PlatformRef#bootstrapmodulefactory `bootstrapModuleFactory()`} to bootstrap the
 *   downgraded modules, each one is considered a "root" module. As a consequence, a new instance
 *   will be created for every injectable provided in `"root"` (via
 *   {\@link Injectable#providedIn `providedIn`}).
 *   If this is not your intention, you can have a shared module (that will act as act as the "root"
 *   module) and create all downgraded modules using that module's injector:
 *
 *   {\@example upgrade/static/ts/lite-multi-shared/module.ts region="shared-root-module"}
 *
 * \@publicApi
 * @template T
 * @param {?} moduleFactoryOrBootstrapFn
 * @return {?}
 */
function downgradeModule(moduleFactoryOrBootstrapFn) {
    /** @type {?} */
    const lazyModuleName = `${UPGRADE_MODULE_NAME}.lazy${++moduleUid}`;
    /** @type {?} */
    const lazyModuleRefKey = `${LAZY_MODULE_REF}${lazyModuleName}`;
    /** @type {?} */
    const lazyInjectorKey = `${INJECTOR_KEY}${lazyModuleName}`;
    /** @type {?} */
    const bootstrapFn = isFunction(moduleFactoryOrBootstrapFn) ?
        moduleFactoryOrBootstrapFn :
        (extraProviders) => platformBrowser(extraProviders).bootstrapModuleFactory(moduleFactoryOrBootstrapFn);
    /** @type {?} */
    let injector;
    // Create an ng1 module to bootstrap.
    module$1(lazyModuleName, [])
        .constant(UPGRADE_APP_TYPE_KEY, 3 /* Lite */)
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
            /** @type {?} */
            const result = {
                promise: bootstrapFn(angular1Providers).then(ref => {
                    injector = result.injector = new NgAdapterInjector(ref.injector);
                    injector.get($INJECTOR);
                    return injector;
                })
            };
            return result;
        }
    ])
        .config([
        $INJECTOR, $PROVIDE,
        ($injector, $provide) => {
            $provide.constant(DOWNGRADED_MODULE_COUNT_KEY, getDowngradedModuleCount($injector) + 1);
        }
    ]);
    return lazyModuleName;
}
/**
 * @template T
 * @param {?} x
 * @return {?}
 */
function identity(x) {
    return x;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
// Constants
/** @type {?} */
const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
// Classes
class UpgradeHelper {
    /**
     * @param {?} injector
     * @param {?} name
     * @param {?} elementRef
     * @param {?=} directive
     */
    constructor(injector, name, elementRef, directive) {
        this.injector = injector;
        this.name = name;
        this.$injector = injector.get($INJECTOR);
        this.$compile = this.$injector.get($COMPILE);
        this.$controller = this.$injector.get($CONTROLLER);
        this.element = elementRef.nativeElement;
        this.$element = element(this.element);
        this.directive = directive || UpgradeHelper.getDirective(this.$injector, name);
    }
    /**
     * @param {?} $injector
     * @param {?} name
     * @return {?}
     */
    static getDirective($injector, name) {
        /** @type {?} */
        const directives = $injector.get(name + 'Directive');
        if (directives.length > 1) {
            throw new Error(`Only support single directive definition for: ${name}`);
        }
        /** @type {?} */
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
    /**
     * @param {?} $injector
     * @param {?} directive
     * @param {?=} fetchRemoteTemplate
     * @return {?}
     */
    static getTemplate($injector, directive, fetchRemoteTemplate = false) {
        if (directive.template !== undefined) {
            return getOrCall(directive.template);
        }
        else if (directive.templateUrl) {
            /** @type {?} */
            const $templateCache = (/** @type {?} */ ($injector.get($TEMPLATE_CACHE)));
            /** @type {?} */
            const url = getOrCall(directive.templateUrl);
            /** @type {?} */
            const template = $templateCache.get(url);
            if (template !== undefined) {
                return template;
            }
            else if (!fetchRemoteTemplate) {
                throw new Error('loading directive templates asynchronously is not supported');
            }
            return new Promise((resolve, reject) => {
                /** @type {?} */
                const $httpBackend = (/** @type {?} */ ($injector.get($HTTP_BACKEND)));
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
    /**
     * @param {?} controllerType
     * @param {?} $scope
     * @return {?}
     */
    buildController(controllerType, $scope) {
        // TODO: Document that we do not pre-assign bindings on the controller instance.
        // Quoted properties below so that this code can be optimized with Closure Compiler.
        /** @type {?} */
        const locals = { '$scope': $scope, '$element': this.$element };
        /** @type {?} */
        const controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);
        (/** @type {?} */ (this.$element.data))(controllerKey((/** @type {?} */ (this.directive.name))), controller);
        return controller;
    }
    /**
     * @param {?=} template
     * @return {?}
     */
    compileTemplate(template) {
        if (template === undefined) {
            template = (/** @type {?} */ (UpgradeHelper.getTemplate(this.$injector, this.directive)));
        }
        return this.compileHtml(template);
    }
    /**
     * @param {?} $scope
     * @param {?=} controllerInstance
     * @return {?}
     */
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
        element.cleanData([this.element]);
        element.cleanData(this.element.querySelectorAll('*'));
    }
    /**
     * @return {?}
     */
    prepareTransclusion() {
        /** @type {?} */
        const transclude = this.directive.transclude;
        /** @type {?} */
        const contentChildNodes = this.extractChildNodes();
        /** @type {?} */
        const attachChildrenFn = (scope, cloneAttachFn) => {
            // Since AngularJS v1.5.8, `cloneAttachFn` will try to destroy the transclusion scope if
            // `$template` is empty. Since the transcluded content comes from Angular, not AngularJS,
            // there will be no transclusion scope here.
            // Provide a dummy `scope.$destroy()` method to prevent `cloneAttachFn` from throwing.
            scope = scope || { $destroy: () => undefined };
            return (/** @type {?} */ (cloneAttachFn))($template, scope);
        };
        /** @type {?} */
        let $template = contentChildNodes;
        if (transclude) {
            /** @type {?} */
            const slots = Object.create(null);
            if (typeof transclude === 'object') {
                $template = [];
                /** @type {?} */
                const slotMap = Object.create(null);
                /** @type {?} */
                const filledSlots = Object.create(null);
                // Parse the element selectors.
                Object.keys(transclude).forEach(slotName => {
                    /** @type {?} */
                    let selector = transclude[slotName];
                    /** @type {?} */
                    const optional = selector.charAt(0) === '?';
                    selector = optional ? selector.substring(1) : selector;
                    slotMap[selector] = slotName;
                    slots[slotName] = null; // `null`: Defined but not yet filled.
                    filledSlots[slotName] = optional; // Consider optional slots as filled.
                });
                // Add the matching elements into their slot.
                contentChildNodes.forEach(node => {
                    /** @type {?} */
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
                    /** @type {?} */
                    const nodes = slots[slotName];
                    slots[slotName] = (scope, cloneAttach) => (/** @type {?} */ (cloneAttach))(nodes, scope);
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
    /**
     * @param {?} controllerInstance
     * @return {?}
     */
    resolveAndBindRequiredControllers(controllerInstance) {
        /** @type {?} */
        const directiveRequire = this.getDirectiveRequire();
        /** @type {?} */
        const requiredControllers = this.resolveRequire(directiveRequire);
        if (controllerInstance && this.directive.bindToController && isMap(directiveRequire)) {
            /** @type {?} */
            const requiredControllersMap = (/** @type {?} */ (requiredControllers));
            Object.keys(requiredControllersMap).forEach(key => {
                controllerInstance[key] = requiredControllersMap[key];
            });
        }
        return requiredControllers;
    }
    /**
     * @private
     * @param {?} html
     * @return {?}
     */
    compileHtml(html) {
        this.element.innerHTML = html;
        return this.$compile(this.element.childNodes);
    }
    /**
     * @private
     * @return {?}
     */
    extractChildNodes() {
        /** @type {?} */
        const childNodes = [];
        /** @type {?} */
        let childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        return childNodes;
    }
    /**
     * @private
     * @return {?}
     */
    getDirectiveRequire() {
        /** @type {?} */
        const require = this.directive.require || (/** @type {?} */ ((this.directive.controller && this.directive.name)));
        if (isMap(require)) {
            Object.keys(require).forEach(key => {
                /** @type {?} */
                const value = require[key];
                /** @type {?} */
                const match = (/** @type {?} */ (value.match(REQUIRE_PREFIX_RE)));
                /** @type {?} */
                const name = value.substring(match[0].length);
                if (!name) {
                    require[key] = match[0] + key;
                }
            });
        }
        return require;
    }
    /**
     * @private
     * @param {?} require
     * @param {?=} controllerInstance
     * @return {?}
     */
    resolveRequire(require, controllerInstance) {
        if (!require) {
            return null;
        }
        else if (Array.isArray(require)) {
            return require.map(req => this.resolveRequire(req));
        }
        else if (typeof require === 'object') {
            /** @type {?} */
            const value = {};
            Object.keys(require).forEach(key => value[key] = (/** @type {?} */ (this.resolveRequire(require[key]))));
            return value;
        }
        else if (typeof require === 'string') {
            /** @type {?} */
            const match = (/** @type {?} */ (require.match(REQUIRE_PREFIX_RE)));
            /** @type {?} */
            const inheritType = match[1] || match[3];
            /** @type {?} */
            const name = require.substring(match[0].length);
            /** @type {?} */
            const isOptional = !!match[2];
            /** @type {?} */
            const searchParents = !!inheritType;
            /** @type {?} */
            const startOnParent = inheritType === '^^';
            /** @type {?} */
            const ctrlKey = controllerKey(name);
            /** @type {?} */
            const elem = startOnParent ? (/** @type {?} */ (this.$element.parent))() : this.$element;
            /** @type {?} */
            const value = searchParents ? (/** @type {?} */ (elem.inheritedData))(ctrlKey) : (/** @type {?} */ (elem.data))(ctrlKey);
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
/**
 * @template T
 * @param {?} property
 * @return {?}
 */
function getOrCall(property) {
    return isFunction(property) ? property() : property;
}
// NOTE: Only works for `typeof T !== 'object'`.
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
    throw new Error(`Upgraded directive '${name}' contains unsupported feature: '${feature}'.`);
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @type {?} */
const NOT_SUPPORTED = 'NOT_SUPPORTED';
/** @type {?} */
const INITIAL_VALUE$1 = {
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
/**
 * \@description
 *
 * A helper class that allows an AngularJS component to be used from Angular.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation.*
 *
 * This helper class should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
 * \@usageNotes
 * ### Examples
 *
 * Let's assume that you have an AngularJS component called `ng1Hero` that needs
 * to be made available in Angular templates.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng1-hero"}
 *
 * We must create a `Directive` that will make this AngularJS component
 * available inside Angular templates.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper"}
 *
 * In this example you can see that we must derive from the `UpgradeComponent`
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
 *   * the `ElementRef` and `Injector` for the component wrapper
 *
 * \@publicApi
 */
class UpgradeComponent {
    /**
     * Create a new `UpgradeComponent` instance. You should not normally need to do this.
     * Instead you should derive a new class from this one and call the super constructor
     * from the base class.
     *
     * {\@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper" }
     *
     * * The `name` parameter should be the name of the AngularJS directive.
     * * The `elementRef` and `injector` parameters should be acquired from Angular by dependency
     *   injection into the base class constructor.
     * @param {?} name
     * @param {?} elementRef
     * @param {?} injector
     */
    constructor(name, elementRef, injector) {
        this.name = name;
        this.elementRef = elementRef;
        this.injector = injector;
        this.helper = new UpgradeHelper(injector, name, elementRef);
        this.$injector = this.helper.$injector;
        this.element = this.helper.element;
        this.$element = this.helper.$element;
        this.directive = this.helper.directive;
        this.bindings = this.initializeBindings(this.directive);
        // We ask for the AngularJS scope from the Angular injector, since
        // we will put the new component scope onto the new injector for each component
        /** @type {?} */
        const $parentScope = injector.get($SCOPE);
        // QUESTION 1: Should we create an isolated scope if the scope is only true?
        // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
        this.$componentScope = $parentScope.$new(!!this.directive.scope);
        this.initializeOutputs();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        // Collect contents, insert and compile template
        /** @type {?} */
        const attachChildNodes = this.helper.prepareTransclusion();
        /** @type {?} */
        const linkFn = this.helper.compileTemplate();
        // Instantiate controller
        /** @type {?} */
        const controllerType = this.directive.controller;
        /** @type {?} */
        const bindToController = this.directive.bindToController;
        if (controllerType) {
            this.controllerInstance = this.helper.buildController(controllerType, this.$componentScope);
        }
        else if (bindToController) {
            throw new Error(`Upgraded directive '${this.directive.name}' specifies 'bindToController' but no controller.`);
        }
        // Set up outputs
        this.bindingDestination = bindToController ? this.controllerInstance : this.$componentScope;
        this.bindOutputs();
        // Require other controllers
        /** @type {?} */
        const requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
        // Hook: $onChanges
        if (this.pendingChanges) {
            this.forwardChanges(this.pendingChanges);
            this.pendingChanges = null;
        }
        // Hook: $onInit
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        // Hook: $doCheck
        if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
            /** @type {?} */
            const callDoCheck = () => (/** @type {?} */ (this.controllerInstance.$doCheck))();
            this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
            callDoCheck();
        }
        // Linking
        /** @type {?} */
        const link = this.directive.link;
        /** @type {?} */
        const preLink = (typeof link == 'object') && ((/** @type {?} */ (link))).pre;
        /** @type {?} */
        const postLink = (typeof link == 'object') ? ((/** @type {?} */ (link))).post : link;
        /** @type {?} */
        const attrs = NOT_SUPPORTED;
        /** @type {?} */
        const transcludeFn = NOT_SUPPORTED;
        if (preLink) {
            preLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        linkFn(this.$componentScope, (/** @type {?} */ (null)), { parentBoundTranscludeFn: attachChildNodes });
        if (postLink) {
            postLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        // Hook: $postLink
        if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
            this.controllerInstance.$postLink();
        }
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (!this.bindingDestination) {
            this.pendingChanges = changes;
        }
        else {
            this.forwardChanges(changes);
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        /** @type {?} */
        const twoWayBoundProperties = this.bindings.twoWayBoundProperties;
        /** @type {?} */
        const twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
        /** @type {?} */
        const propertyToOutputMap = this.bindings.propertyToOutputMap;
        twoWayBoundProperties.forEach((propName, idx) => {
            /** @type {?} */
            const newValue = this.bindingDestination[propName];
            /** @type {?} */
            const oldValue = twoWayBoundLastValues[idx];
            if (!ɵlooseIdentical(newValue, oldValue)) {
                /** @type {?} */
                const outputName = propertyToOutputMap[propName];
                /** @type {?} */
                const eventEmitter = ((/** @type {?} */ (this)))[outputName];
                eventEmitter.emit(newValue);
                twoWayBoundLastValues[idx] = newValue;
            }
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (isFunction(this.unregisterDoCheckWatcher)) {
            this.unregisterDoCheckWatcher();
        }
        this.helper.onDestroy(this.$componentScope, this.controllerInstance);
    }
    /**
     * @private
     * @param {?} directive
     * @return {?}
     */
    initializeBindings(directive) {
        /** @type {?} */
        const btcIsObject = typeof directive.bindToController === 'object';
        if (btcIsObject && Object.keys((/** @type {?} */ (directive.scope))).length) {
            throw new Error(`Binding definitions on scope and controller at the same time is not supported.`);
        }
        /** @type {?} */
        const context = (btcIsObject) ? directive.bindToController : directive.scope;
        /** @type {?} */
        const bindings = new Bindings();
        if (typeof context == 'object') {
            Object.keys(context).forEach(propName => {
                /** @type {?} */
                const definition = context[propName];
                /** @type {?} */
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
                        bindings.twoWayBoundLastValues.push(INITIAL_VALUE$1);
                        bindings.propertyToOutputMap[propName] = propName + 'Change';
                        break;
                    case '&':
                        bindings.expressionBoundProperties.push(propName);
                        bindings.propertyToOutputMap[propName] = propName;
                        break;
                    default:
                        /** @type {?} */
                        let json = JSON.stringify(context);
                        throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
                }
            });
        }
        return bindings;
    }
    /**
     * @private
     * @return {?}
     */
    initializeOutputs() {
        // Initialize the outputs for `=` and `&` bindings
        this.bindings.twoWayBoundProperties.concat(this.bindings.expressionBoundProperties)
            .forEach(propName => {
            /** @type {?} */
            const outputName = this.bindings.propertyToOutputMap[propName];
            ((/** @type {?} */ (this)))[outputName] = new EventEmitter();
        });
    }
    /**
     * @private
     * @return {?}
     */
    bindOutputs() {
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach(propName => {
            /** @type {?} */
            const outputName = this.bindings.propertyToOutputMap[propName];
            /** @type {?} */
            const emitter = ((/** @type {?} */ (this)))[outputName];
            this.bindingDestination[propName] = (value) => emitter.emit(value);
        });
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    forwardChanges(changes) {
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach(propName => this.bindingDestination[propName] = changes[propName].currentValue);
        if (isFunction(this.bindingDestination.$onChanges)) {
            this.bindingDestination.$onChanges(changes);
        }
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * \@description
 *
 * An `NgModule`, which you import to provide AngularJS core services,
 * and has an instance method used to bootstrap the hybrid upgrade application.
 *
 * *Part of the [upgrade/static](api?query=upgrade/static)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * The `upgrade/static` package contains helpers that allow AngularJS and Angular components
 * to be used together inside a hybrid upgrade application, which supports AoT compilation.
 *
 * Specifically, the classes and functions in the `upgrade/static` module allow the following:
 *
 * 1. Creation of an Angular directive that wraps and exposes an AngularJS component so
 *    that it can be used in an Angular template. See `UpgradeComponent`.
 * 2. Creation of an AngularJS directive that wraps and exposes an Angular component so
 *    that it can be used in an AngularJS template. See `downgradeComponent`.
 * 3. Creation of an Angular root injector provider that wraps and exposes an AngularJS
 *    service so that it can be injected into an Angular context. See
 *    {\@link UpgradeModule#upgrading-an-angular-1-service Upgrading an AngularJS service} below.
 * 4. Creation of an AngularJS service that wraps and exposes an Angular injectable
 *    so that it can be injected into an AngularJS context. See `downgradeInjectable`.
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * \@usageNotes
 *
 * ```ts
 * import {UpgradeModule} from '\@angular/upgrade/static';
 * ```
 *
 * See also the {\@link UpgradeModule#examples examples} below.
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
 * * Core AngularJS services
 *   Importing this `NgModule` will add providers for the core
 *   [AngularJS services](https://docs.angularjs.org/api/ng/service) to the root injector.
 *
 * * Bootstrap
 *   The runtime instance of this class contains a {\@link UpgradeModule#bootstrap `bootstrap()`}
 *   method, which you use to bootstrap the top level AngularJS module onto an element in the
 *   DOM for the hybrid upgrade app.
 *
 *   It also contains properties to access the {\@link UpgradeModule#injector root injector}, the
 *   bootstrap `NgZone` and the
 *   [AngularJS $injector](https://docs.angularjs.org/api/auto/service/$injector).
 *
 * ### Examples
 *
 * Import the `UpgradeModule` into your top level {\@link NgModule Angular `NgModule`}.
 *
 * {\@example upgrade/static/ts/full/module.ts region='ng2-module'}
 *
 * Then inject `UpgradeModule` into your Angular `NgModule` and use it to bootstrap the top level
 * [AngularJS module](https://docs.angularjs.org/api/ng/type/angular.Module) in the
 * `ngDoBootstrap()` method.
 *
 * {\@example upgrade/static/ts/full/module.ts region='bootstrap-ng1'}
 *
 * Finally, kick off the whole process, by bootstraping your top level Angular `NgModule`.
 *
 * {\@example upgrade/static/ts/full/module.ts region='bootstrap-ng2'}
 *
 * {\@a upgrading-an-angular-1-service}
 * ### Upgrading an AngularJS service
 *
 * There is no specific API for upgrading an AngularJS service. Instead you should just follow the
 * following recipe:
 *
 * Let's say you have an AngularJS service:
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng1-text-formatter-service"}
 *
 * Then you should define an Angular provider to be included in your `NgModule` `providers`
 * property.
 *
 * {\@example upgrade/static/ts/full/module.ts region="upgrade-ng1-service"}
 *
 * Then you can use the "upgraded" AngularJS service by injecting it into an Angular component
 * or service.
 *
 * {\@example upgrade/static/ts/full/module.ts region="use-ng1-upgraded-service"}
 *
 * \@publicApi
 */
class UpgradeModule {
    /**
     * @param {?} injector
     * @param {?} ngZone
     */
    constructor(
    /** The root `Injector` for the upgrade application. */
    injector, ngZone) {
        this.ngZone = ngZone;
        this.injector = new NgAdapterInjector(injector);
    }
    /**
     * Bootstrap an AngularJS application from this NgModule
     * @param {?} element the element on which to bootstrap the AngularJS application
     * @param {?=} modules
     * @param {?=} config
     * @return {?}
     */
    bootstrap(element$$1, modules = [], config /*angular.IAngularBootstrapConfig*/) {
        /** @type {?} */
        const INIT_MODULE_NAME = UPGRADE_MODULE_NAME + '.init';
        // Create an ng1 module to bootstrap
        /** @type {?} */
        const initModule = module$1(INIT_MODULE_NAME, [])
            .constant(UPGRADE_APP_TYPE_KEY, 2 /* Static */)
            .value(INJECTOR_KEY, this.injector)
            .factory(LAZY_MODULE_REF, [INJECTOR_KEY, (injector) => ((/** @type {?} */ ({ injector })))])
            .config([
            $PROVIDE, $INJECTOR,
            ($provide, $injector) => {
                if ($injector.has($$TESTABILITY)) {
                    $provide.decorator($$TESTABILITY, [
                        $DELEGATE,
                        (testabilityDelegate) => {
                            /** @type {?} */
                            const originalWhenStable = testabilityDelegate.whenStable;
                            /** @type {?} */
                            const injector = this.injector;
                            // Cannot use arrow function below because we need the context
                            /** @type {?} */
                            const newWhenStable = function (callback) {
                                originalWhenStable.call(testabilityDelegate, function () {
                                    /** @type {?} */
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
                        }
                    ]);
                }
                if ($injector.has($INTERVAL)) {
                    $provide.decorator($INTERVAL, [
                        $DELEGATE,
                        (intervalDelegate) => {
                            // Wrap the $interval service so that setInterval is called outside NgZone,
                            // but the callback is still invoked within it. This is so that $interval
                            // won't block stability, which preserves the behavior from AngularJS.
                            /** @type {?} */
                            let wrappedInterval = (fn, delay, count, invokeApply, ...pass) => {
                                return this.ngZone.runOutsideAngular(() => {
                                    return intervalDelegate((...args) => {
                                        // Run callback in the next VM turn - $interval calls
                                        // $rootScope.$apply, and running the callback in NgZone will
                                        // cause a '$digest already in progress' error if it's in the
                                        // same vm turn.
                                        setTimeout(() => { this.ngZone.run(() => fn(...args)); });
                                    }, delay, count, invokeApply, ...pass);
                                });
                            };
                            ((/** @type {?} */ (wrappedInterval)))['cancel'] = intervalDelegate.cancel;
                            return wrappedInterval;
                        }
                    ]);
                }
            }
        ])
            .run([
            $INJECTOR,
            ($injector) => {
                this.$injector = $injector;
                // Initialize the ng1 $injector provider
                setTempInjectorRef($injector);
                this.injector.get($INJECTOR);
                // Put the injector on the DOM, so that it can be "required"
                (/** @type {?} */ (element(element$$1).data))(controllerKey(INJECTOR_KEY), this.injector);
                // Wire up the ng1 rootScope to run a digest cycle whenever the zone settles
                // We need to do this in the next tick so that we don't prevent the bootup
                // stabilizing
                setTimeout(() => {
                    /** @type {?} */
                    const $rootScope = $injector.get('$rootScope');
                    /** @type {?} */
                    const subscription = this.ngZone.onMicrotaskEmpty.subscribe(() => $rootScope.$digest());
                    $rootScope.$on('$destroy', () => { subscription.unsubscribe(); });
                }, 0);
            }
        ]);
        /** @type {?} */
        const upgradeModule = module$1(UPGRADE_MODULE_NAME, [INIT_MODULE_NAME].concat(modules));
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        /** @type {?} */
        const windowAngular = ((/** @type {?} */ (window)))['angular'];
        windowAngular.resumeBootstrap = undefined;
        // Bootstrap the AngularJS application inside our zone
        this.ngZone.run(() => { bootstrap(element$$1, [upgradeModule.name], config); });
        // Patch resumeBootstrap() to run inside the ngZone
        if (windowAngular.resumeBootstrap) {
            /** @type {?} */
            const originalResumeBootstrap = windowAngular.resumeBootstrap;
            /** @type {?} */
            const ngZone = this.ngZone;
            windowAngular.resumeBootstrap = function () {
                /** @type {?} */
                let args = arguments;
                windowAngular.resumeBootstrap = originalResumeBootstrap;
                return ngZone.run(() => windowAngular.resumeBootstrap.apply(this, args));
            };
        }
    }
}
UpgradeModule.decorators = [
    { type: NgModule, args: [{ providers: [angular1Providers] },] }
];
/** @nocollapse */
UpgradeModule.ctorParameters = () => [
    { type: Injector },
    { type: NgZone }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * Generated bundle index. Do not edit.
 */

export { angular1Providers as ɵangular_packages_upgrade_static_static_e, compileFactory as ɵangular_packages_upgrade_static_static_c, injectorFactory as ɵangular_packages_upgrade_static_static_a, parseFactory as ɵangular_packages_upgrade_static_static_d, rootScopeFactory as ɵangular_packages_upgrade_static_static_b, getAngularJSGlobal, getAngularLib, setAngularJSGlobal, setAngularLib, downgradeComponent, downgradeInjectable, VERSION, downgradeModule, UpgradeComponent, UpgradeModule };
//# sourceMappingURL=static.js.map
