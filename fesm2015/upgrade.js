/**
 * @license Angular v6.1.9
 * (c) 2010-2018 Google, Inc. https://angular.io/
 * License: MIT
 */

import { Version, ApplicationRef, ChangeDetectorRef, Injector, SimpleChange, Testability, TestabilityRegistry, ComponentFactoryResolver, NgZone, Directive, ElementRef, EventEmitter, Inject, Compiler, NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const VERSION = new Version('6.1.9');

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @return {?}
 */
function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
/** @type {?} */
let angular = /** @type {?} */ ({
    bootstrap: noNg,
    module: noNg,
    element: noNg,
    version: undefined,
    resumeBootstrap: noNg,
    getTestability: noNg
});
try {
    if (window.hasOwnProperty('angular')) {
        angular = (/** @type {?} */ (window)).angular;
    }
}
catch (e) {
    // ignore in CJS mode.
}
/** @type {?} */
const bootstrap = (e, modules, config) => angular.bootstrap(e, modules, config);
/** @type {?} */
const module$1 = (prefix, dependencies) => angular.module(prefix, dependencies);
/** @type {?} */
const element = e => angular.element(e);
/** @type {?} */
let version = angular.version;

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
const $HTTP_BACKEND = '$httpBackend';
/** @type {?} */
const $INJECTOR = '$injector';
/** @type {?} */
const $PARSE = '$parse';
/** @type {?} */
const $ROOT_SCOPE = '$rootScope';
/** @type {?} */
const $SCOPE = '$scope';
/** @type {?} */
const $TEMPLATE_CACHE = '$templateCache';
/** @type {?} */
const $$TESTABILITY = '$$testability';
/** @type {?} */
const COMPILER_KEY = '$$angularCompiler';
/** @type {?} */
const INJECTOR_KEY = '$$angularInjector';
/** @type {?} */
const LAZY_MODULE_REF = '$$angularLazyModuleRef';
/** @type {?} */
const NG_ZONE_KEY = '$$angularNgZone';
/** @type {?} */
const REQUIRE_INJECTOR = '?^^' + INJECTOR_KEY;
/** @type {?} */
const REQUIRE_NG_MODEL = '?ngModel';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** @type {?} */
const DIRECTIVE_PREFIX_REGEXP = /^(?:x|data)[:\-_]/i;
/** @type {?} */
const DIRECTIVE_SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;
/**
 * @param {?} e
 * @return {?}
 */
function onError(e) {
    // TODO: (misko): We seem to not have a stack trace here!
    if (console.error) {
        console.error(e, e.stack);
    }
    else {
        // tslint:disable-next-line:no-console
        console.log(e, e.stack);
    }
    throw e;
}
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
 * @param {?} component
 * @return {?}
 */
function getComponentName(component) {
    // Return the name of the component or the first line of its stringified version.
    return (/** @type {?} */ (component)).overriddenName || component.name || component.toString().split('\n')[0];
}
/**
 * @param {?} value
 * @return {?}
 */
function isFunction(value) {
    return typeof value === 'function';
}
/**
 * @template R
 */
class Deferred {
    constructor() {
        this.promise = new Promise((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
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
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
        const linkFns = projectableNodes.map(nodes => this.$compile(nodes)); /** @type {?} */
        ((this.element.empty))();
        linkFns.forEach(linkFn => {
            linkFn(this.scope, (clone) => {
                compiledProjectableNodes.push(clone); /** @type {?} */
                ((this.element.append))(clone);
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
        /** @type {?} */
        const testability = this.componentRef.injector.get(Testability, null);
        if (testability) {
            this.componentRef.injector.get(TestabilityRegistry)
                .registerApplication(this.componentRef.location.nativeElement, testability);
        }
        hookupNgModel(this.ngModel, this.component);
    }
    /**
     * @param {?} needsNgZone
     * @param {?=} propagateDigest
     * @return {?}
     */
    setupInputs(needsNgZone, propagateDigest = true) {
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
                /** @type {?} */
                let unwatch = this.componentScope.$watch(() => {
                    /** @type {?} */ ((unwatch))();
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
        /** @type {?} */
        const detectChanges = () => this.changeDetector.detectChanges();
        /** @type {?} */
        const prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && (/** @type {?} */ (prototype)).ngOnChanges);
        this.componentScope.$watch(() => this.inputChangeCount, this.wrapCallback(() => {
            // Invoke `ngOnChanges()`
            if (this.implementsOnChanges) {
                /** @type {?} */
                const inputChanges = this.inputChanges;
                this.inputChanges = {};
                (/** @type {?} */ (this.component)).ngOnChanges(/** @type {?} */ ((inputChanges)));
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
        if (needsNgZone || !propagateDigest) {
            /** @type {?} */
            let unwatch = this.componentScope.$watch(() => {
                /** @type {?} */ ((unwatch))();
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
        const emitter = /** @type {?} */ (this.component[output.prop]);
        if (emitter) {
            emitter.subscribe({
                next: isAssignment ? (v) => /** @type {?} */ ((setter))(this.scope, v) :
                    (v) => getter(this.scope, { '$event': v })
            });
        }
        else {
            throw new Error(`Missing emitter '${output.prop}' on component '${getComponentName(this.componentFactory.componentType)}'!`);
        }
    }
    /**
     * @return {?}
     */
    registerCleanup() {
        /** @type {?} */
        const destroyComponentRef = this.wrapCallback(() => this.componentRef.destroy());
        /** @type {?} */
        let destroyed = false; /** @type {?} */
        ((this.element.on))('$destroy', () => this.componentScope.$destroy());
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
        return groupNodesBySelector(ngContentSelectors, /** @type {?} */ ((this.element.contents))());
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
        const elProto = /** @type {?} */ (Element.prototype);
        _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
            elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
    }
    return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
 * \@experimental
 * @param {?} info contains information about the Component that is being downgraded:
 *
 * * `component: Type<any>`: The type of the Component that will be downgraded
 * * `propagateDigest?: boolean`: Whether to perform {\@link ChangeDetectorRef#detectChanges
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
        /** @type {?} */
        let needsNgZone = false;
        /** @type {?} */
        let wrapCallback = (cb) => cb;
        /** @type {?} */
        let ngZone;
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: (scope, element, attrs, required) => {
                /** @type {?} */
                const ngModel = required[1];
                /** @type {?} */
                let parentInjector = required[0];
                /** @type {?} */
                let ranAsync = false;
                if (!parentInjector) {
                    /** @type {?} */
                    const lazyModuleRef = /** @type {?} */ ($injector.get(LAZY_MODULE_REF));
                    needsNgZone = lazyModuleRef.needsNgZone;
                    parentInjector = lazyModuleRef.injector || /** @type {?} */ (lazyModuleRef.promise);
                }
                /** @type {?} */
                const doDowngrade = (injector) => {
                    /** @type {?} */
                    const componentFactoryResolver = injector.get(ComponentFactoryResolver);
                    /** @type {?} */
                    const componentFactory = /** @type {?} */ ((componentFactoryResolver.resolveComponentFactory(info.component)));
                    if (!componentFactory) {
                        throw new Error('Expecting ComponentFactory for: ' + getComponentName(info.component));
                    }
                    /** @type {?} */
                    const injectorPromise = new ParentInjectorPromise(element);
                    /** @type {?} */
                    const facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory, wrapCallback);
                    /** @type {?} */
                    const projectableNodes = facade.compileContents();
                    facade.createComponent(projectableNodes);
                    facade.setupInputs(needsNgZone, info.propagateDigest);
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
                const downgradeFn = !needsNgZone ? doDowngrade : (injector) => {
                    if (!ngZone) {
                        ngZone = injector.get(NgZone);
                        wrapCallback = (cb) => () => NgZone.isInAngularZone() ? cb() : ngZone.run(cb);
                    }
                    wrapCallback(() => doDowngrade(injector))();
                };
                if (isThenable(parentInjector)) {
                    parentInjector.then(downgradeFn);
                }
                else {
                    downgradeFn(parentInjector);
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
        /** @type {?} */ ((
        // Store the promise on the element.
        element.data))(this.injectorKey, this);
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
        this.injector = injector; /** @type {?} */
        ((
        // Store the real injector on the element.
        this.element.data))(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = /** @type {?} */ ((null));
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
    return isFunction((/** @type {?} */ (obj)).then);
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
 * \@experimental
 * @param {?} token an `InjectionToken` that identifies a service provided from Angular.
 *
 * @return {?} a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 */
function downgradeInjectable(token) {
    /** @type {?} */
    const factory = function (i) { return i.get(token); };
    (/** @type {?} */ (factory))['$inject'] = [INJECTOR_KEY];
    return factory;
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
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
            const $templateCache = /** @type {?} */ ($injector.get($TEMPLATE_CACHE));
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
                const $httpBackend = /** @type {?} */ ($injector.get($HTTP_BACKEND));
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
        /** @type {?} */
        const locals = { '$scope': $scope, '$element': this.$element };
        /** @type {?} */
        const controller = this.$controller(controllerType, locals, null, this.directive.controllerAs); /** @type {?} */
        ((this.$element.data))(controllerKey(/** @type {?} */ ((this.directive.name))), controller);
        return controller;
    }
    /**
     * @param {?=} template
     * @return {?}
     */
    compileTemplate(template) {
        if (template === undefined) {
            template = /** @type {?} */ (UpgradeHelper.getTemplate(this.$injector, this.directive));
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
        $scope.$destroy(); /** @type {?} */
        ((this.$element.triggerHandler))('$destroy');
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
            return /** @type {?} */ ((cloneAttachFn))($template, scope);
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
                    slots[slotName] = (scope, cloneAttach) => /** @type {?} */ ((cloneAttach))(nodes, scope);
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
            const requiredControllersMap = /** @type {?} */ (requiredControllers);
            Object.keys(requiredControllersMap).forEach(key => {
                controllerInstance[key] = requiredControllersMap[key];
            });
        }
        return requiredControllers;
    }
    /**
     * @param {?} html
     * @return {?}
     */
    compileHtml(html) {
        this.element.innerHTML = html;
        return this.$compile(this.element.childNodes);
    }
    /**
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
     * @return {?}
     */
    getDirectiveRequire() {
        /** @type {?} */
        const require = this.directive.require || /** @type {?} */ (((this.directive.controller && this.directive.name)));
        if (isMap(require)) {
            Object.keys(require).forEach(key => {
                /** @type {?} */
                const value = require[key];
                /** @type {?} */
                const match = /** @type {?} */ ((value.match(REQUIRE_PREFIX_RE)));
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
            Object.keys(require).forEach(key => value[key] = /** @type {?} */ ((this.resolveRequire(require[key]))));
            return value;
        }
        else if (typeof require === 'string') {
            /** @type {?} */
            const match = /** @type {?} */ ((require.match(REQUIRE_PREFIX_RE)));
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
            const elem = startOnParent ? /** @type {?} */ ((this.$element.parent))() : this.$element;
            /** @type {?} */
            const value = searchParents ? /** @type {?} */ ((elem.inheritedData))(ctrlKey) : /** @type {?} */ ((elem.data))(ctrlKey);
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
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
const CAMEL_CASE = /([A-Z])/g;
/** @type {?} */
const INITIAL_VALUE$1 = {
    __UNINITIALIZED__: true
};
/** @type {?} */
const NOT_SUPPORTED = 'NOT_SUPPORTED';
class UpgradeNg1ComponentAdapterBuilder {
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
        this.directive = null;
        /** @type {?} */
        const selector = name.replace(CAMEL_CASE, (all, next) => '-' + next.toLowerCase());
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const directive = { selector: selector, inputs: this.inputsRename, outputs: this.outputsRename };
        class MyClass {
            /**
             * @param {?} scope
             * @param {?} injector
             * @param {?} elementRef
             */
            constructor(scope, injector, elementRef) {
                /** @type {?} */
                const helper = new UpgradeHelper(injector, name, elementRef, this.directive);
                return /** @type {?} */ (new UpgradeNg1ComponentAdapter(helper, scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap));
            }
            /**
             * @return {?}
             */
            ngOnInit() {
                /* needs to be here for ng2 to properly detect it */
            }
            /**
             * @return {?}
             */
            ngOnChanges() {
                /* needs to be here for ng2 to properly detect it */
            }
            /**
             * @return {?}
             */
            ngDoCheck() {
                /* needs to be here for ng2 to properly detect it */
            }
            /**
             * @return {?}
             */
            ngOnDestroy() {
                /* needs to be here for ng2 to properly detect it */
            }
        }
        MyClass.decorators = [
            { type: Directive, args: [Object.assign({ jit: true }, directive),] },
        ];
        /** @nocollapse */
        MyClass.ctorParameters = () => [
            { type: undefined, decorators: [{ type: Inject, args: [$SCOPE,] }] },
            { type: Injector },
            { type: ElementRef }
        ];
        this.type = MyClass;
    }
    /**
     * @return {?}
     */
    extractBindings() {
        /** @type {?} */
        const btcIsObject = typeof /** @type {?} */ ((this.directive)).bindToController === 'object';
        if (btcIsObject && Object.keys(/** @type {?} */ ((/** @type {?} */ ((this.directive)).scope))).length) {
            throw new Error(`Binding definitions on scope and controller at the same time are not supported.`);
        }
        /** @type {?} */
        const context = (btcIsObject) ? /** @type {?} */ ((this.directive)).bindToController : /** @type {?} */ ((this.directive)).scope;
        if (typeof context == 'object') {
            Object.keys(context).forEach(propName => {
                /** @type {?} */
                const definition = context[propName];
                /** @type {?} */
                const bindingType = definition.charAt(0);
                /** @type {?} */
                const bindingOptions = definition.charAt(1);
                /** @type {?} */
                const attrName = definition.substring(bindingOptions === '?' ? 2 : 1) || propName;
                /** @type {?} */
                const inputName = `input_${attrName}`;
                /** @type {?} */
                const inputNameRename = `${inputName}: ${attrName}`;
                /** @type {?} */
                const outputName = `output_${attrName}`;
                /** @type {?} */
                const outputNameRename = `${outputName}: ${attrName}`;
                /** @type {?} */
                const outputNameRenameChange = `${outputNameRename}Change`;
                switch (bindingType) {
                    case '@':
                    case '<':
                        this.inputs.push(inputName);
                        this.inputsRename.push(inputNameRename);
                        this.propertyMap[inputName] = propName;
                        break;
                    case '=':
                        this.inputs.push(inputName);
                        this.inputsRename.push(inputNameRename);
                        this.propertyMap[inputName] = propName;
                        this.outputs.push(outputName);
                        this.outputsRename.push(outputNameRenameChange);
                        this.propertyMap[outputName] = propName;
                        this.checkProperties.push(propName);
                        this.propertyOutputs.push(outputName);
                        break;
                    case '&':
                        this.outputs.push(outputName);
                        this.outputsRename.push(outputNameRename);
                        this.propertyMap[outputName] = propName;
                        break;
                    default:
                        /** @type {?} */
                        let json = JSON.stringify(context);
                        throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
                }
            });
        }
    }
    /**
     * Upgrade ng1 components into Angular.
     * @param {?} exportedComponents
     * @param {?} $injector
     * @return {?}
     */
    static resolve(exportedComponents, $injector) {
        /** @type {?} */
        const promises = Object.keys(exportedComponents).map(name => {
            /** @type {?} */
            const exportedComponent = exportedComponents[name];
            exportedComponent.directive = UpgradeHelper.getDirective($injector, name);
            exportedComponent.extractBindings();
            return Promise
                .resolve(UpgradeHelper.getTemplate($injector, exportedComponent.directive, true))
                .then(template => exportedComponent.template = template);
        });
        return Promise.all(promises);
    }
}
class UpgradeNg1ComponentAdapter {
    /**
     * @param {?} helper
     * @param {?} scope
     * @param {?} template
     * @param {?} inputs
     * @param {?} outputs
     * @param {?} propOuts
     * @param {?} checkProperties
     * @param {?} propertyMap
     */
    constructor(helper, scope, template, inputs, outputs, propOuts, checkProperties, propertyMap) {
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
        /** @type {?} */
        const controllerType = this.directive.controller;
        if (this.directive.bindToController && controllerType) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
            this.destinationObj = this.controllerInstance;
        }
        else {
            this.destinationObj = this.componentScope;
        }
        for (let i = 0; i < inputs.length; i++) {
            (/** @type {?} */ (this))[inputs[i]] = null;
        }
        for (let j = 0; j < outputs.length; j++) {
            /** @type {?} */
            const emitter = (/** @type {?} */ (this))[outputs[j]] = new EventEmitter();
            if (this.propOuts.indexOf(outputs[j]) === -1) {
                this.setComponentProperty(outputs[j], (emitter => (value) => emitter.emit(value))(emitter));
            }
        }
        for (let k = 0; k < propOuts.length; k++) {
            this.checkLastValues.push(INITIAL_VALUE$1);
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        /** @type {?} */
        const attachChildNodes = this.helper.prepareTransclusion();
        /** @type {?} */
        const linkFn = this.helper.compileTemplate(this.template);
        /** @type {?} */
        const controllerType = this.directive.controller;
        /** @type {?} */
        const bindToController = this.directive.bindToController;
        if (controllerType && !bindToController) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
        }
        /** @type {?} */
        const requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
        // Hook: $onInit
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        /** @type {?} */
        const link = this.directive.link;
        /** @type {?} */
        const preLink = (typeof link == 'object') && (/** @type {?} */ (link)).pre;
        /** @type {?} */
        const postLink = (typeof link == 'object') ? (/** @type {?} */ (link)).post : link;
        /** @type {?} */
        const attrs = NOT_SUPPORTED;
        /** @type {?} */
        const transcludeFn = NOT_SUPPORTED;
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
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        /** @type {?} */
        const ng1Changes = {};
        Object.keys(changes).forEach(name => {
            /** @type {?} */
            const change = changes[name];
            this.setComponentProperty(name, change.currentValue);
            ng1Changes[this.propertyMap[name]] = change;
        });
        if (isFunction(/** @type {?} */ ((this.destinationObj)).$onChanges)) {
            /** @type {?} */ ((/** @type {?} */ ((this.destinationObj)).$onChanges))(ng1Changes);
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        /** @type {?} */
        const destinationObj = this.destinationObj;
        /** @type {?} */
        const lastValues = this.checkLastValues;
        /** @type {?} */
        const checkProperties = this.checkProperties;
        /** @type {?} */
        const propOuts = this.propOuts;
        checkProperties.forEach((propName, i) => {
            /** @type {?} */
            const value = /** @type {?} */ ((destinationObj))[propName];
            /** @type {?} */
            const last = lastValues[i];
            if (!strictEquals(last, value)) {
                /** @type {?} */
                const eventEmitter = (/** @type {?} */ (this))[propOuts[i]];
                eventEmitter.emit(lastValues[i] = value);
            }
        });
        if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
            this.controllerInstance.$doCheck();
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() { this.helper.onDestroy(this.componentScope, this.controllerInstance); }
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    setComponentProperty(name, value) {
        /** @type {?} */ ((this.destinationObj))[this.propertyMap[name]] = value;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
/** @type {?} */
let upgradeCount = 0;
/**
 * Use `UpgradeAdapter` to allow AngularJS and Angular to coexist in a single application.
 *
 * The `UpgradeAdapter` allows:
 * 1. creation of Angular component from AngularJS component directive
 *    (See [UpgradeAdapter#upgradeNg1Component()])
 * 2. creation of AngularJS directive from Angular component.
 *    (See [UpgradeAdapter#downgradeNg2Component()])
 * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
 *    coexisting in a single application.
 *
 * \@usageNotes
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
 * 3. AngularJS directives always execute inside AngularJS framework codebase regardless of
 *    where they are instantiated.
 * 4. Angular components always execute inside Angular framework codebase regardless of
 *    where they are instantiated.
 * 5. An AngularJS component can be upgraded to an Angular component. This creates an
 *    Angular directive, which bootstraps the AngularJS component directive in that location.
 * 6. An Angular component can be downgraded to an AngularJS component directive. This creates
 *    an AngularJS directive, which bootstraps the Angular component in that location.
 * 7. Whenever an adapter component is instantiated the host element is owned by the framework
 *    doing the instantiation. The other framework then instantiates and owns the view for that
 *    component. This implies that component bindings will always follow the semantics of the
 *    instantiation framework. The syntax is always that of Angular syntax.
 * 8. AngularJS is always bootstrapped first and owns the bottom most view.
 * 9. The new application is running in Angular zone, and therefore it no longer needs calls to
 *    `$apply()`.
 *
 * ### Example
 *
 * ```
 * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module), myCompilerOptions);
 * const module = angular.module('myExample', []);
 * module.directive('ng2Comp', adapter.downgradeNg2Component(Ng2Component));
 *
 * module.directive('ng1Hello', function() {
 *   return {
 *      scope: { title: '=' },
 *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
 *   };
 * });
 *
 *
 * \@Component({
 *   selector: 'ng2-comp',
 *   inputs: ['name'],
 *   template: 'ng2[<ng1-hello [title]="name">transclude</ng1-hello>](<ng-content></ng-content>)',
 *   directives:
 * })
 * class Ng2Component {
 * }
 *
 * \@NgModule({
 *   declarations: [Ng2Component, adapter.upgradeNg1Component('ng1Hello')],
 *   imports: [BrowserModule]
 * })
 * class MyNg2Module {}
 *
 *
 * document.body.innerHTML = '<ng2-comp name="World">project</ng2-comp>';
 *
 * adapter.bootstrap(document.body, ['myExample']).ready(function() {
 *   expect(document.body.textContent).toEqual(
 *       "ng2[ng1[Hello World!](transclude)](project)");
 * });
 *
 * ```
 *
 * @deprecated Deprecated since v5. Use `upgrade/static` instead, which also supports
 * [Ahead-of-Time compilation](guide/aot-compiler).
 */
class UpgradeAdapter {
    /**
     * @param {?} ng2AppModule
     * @param {?=} compilerOptions
     */
    constructor(ng2AppModule, compilerOptions) {
        this.ng2AppModule = ng2AppModule;
        this.compilerOptions = compilerOptions;
        this.idPrefix = `NG2_UPGRADE_${upgradeCount++}_`;
        this.downgradedComponents = [];
        /**
         * An internal map of ng1 components which need to up upgraded to ng2.
         *
         * We can't upgrade until injector is instantiated and we can retrieve the component metadata.
         * For this reason we keep a list of components to upgrade until ng1 injector is bootstrapped.
         *
         * \@internal
         */
        this.ng1ComponentsToBeUpgraded = {};
        this.upgradedProviders = [];
        this.moduleRef = null;
        if (!ng2AppModule) {
            throw new Error('UpgradeAdapter cannot be instantiated without an NgModule of the Angular app.');
        }
    }
    /**
     * Allows Angular Component to be used from AngularJS.
     *
     * Use `downgradeNg2Component` to create an AngularJS Directive Definition Factory from
     * Angular Component. The adapter will bootstrap Angular component from within the
     * AngularJS template.
     *
     * \@usageNotes
     * ### Mental Model
     *
     * 1. The component is instantiated by being listed in AngularJS template. This means that the
     *    host element is controlled by AngularJS, but the component's view will be controlled by
     *    Angular.
     * 2. Even thought the component is instantiated in AngularJS, it will be using Angular
     *    syntax. This has to be done, this way because we must follow Angular components do not
     *    declare how the attributes should be interpreted.
     * 3. `ng-model` is controlled by AngularJS and communicates with the downgraded Angular component
     *    by way of the `ControlValueAccessor` interface from \@angular/forms. Only components that
     *    implement this interface are eligible.
     *
     * ### Supported Features
     *
     * - Bindings:
     *   - Attribute: `<comp name="World">`
     *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
     *   - Expression:  `<comp [name]="username">`
     *   - Event:  `<comp (close)="doSomething()">`
     *   - ng-model: `<comp ng-model="name">`
     * - Content projection: yes
     *
     * ### Example
     *
     * ```
     * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
     * const module = angular.module('myExample', []);
     * module.directive('greet', adapter.downgradeNg2Component(Greeter));
     *
     * \@Component({
     *   selector: 'greet',
     *   template: '{{salutation}} {{name}}! - <ng-content></ng-content>'
     * })
     * class Greeter {
     * \@Input() salutation: string;
     * \@Input() name: string;
     * }
     *
     * \@NgModule({
     *   declarations: [Greeter],
     *   imports: [BrowserModule]
     * })
     * class MyNg2Module {}
     *
     * document.body.innerHTML =
     *   'ng1 template: <greet salutation="Hello" [name]="world">text</greet>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng1 template: Hello world! - text");
     * });
     * ```
     * @param {?} component
     * @return {?}
     */
    downgradeNg2Component(component) {
        this.downgradedComponents.push(component);
        return downgradeComponent({ component });
    }
    /**
     * Allows AngularJS Component to be used from Angular.
     *
     * Use `upgradeNg1Component` to create an Angular component from AngularJS Component
     * directive. The adapter will bootstrap AngularJS component from within the Angular
     * template.
     *
     * \@usageNotes
     * ### Mental Model
     *
     * 1. The component is instantiated by being listed in Angular template. This means that the
     *    host element is controlled by Angular, but the component's view will be controlled by
     *    AngularJS.
     *
     * ### Supported Features
     *
     * - Bindings:
     *   - Attribute: `<comp name="World">`
     *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
     *   - Expression:  `<comp [name]="username">`
     *   - Event:  `<comp (close)="doSomething()">`
     * - Transclusion: yes
     * - Only some of the features of
     *   [Directive Definition Object](https://docs.angularjs.org/api/ng/service/$compile) are
     *   supported:
     *   - `compile`: not supported because the host element is owned by Angular, which does
     *     not allow modifying DOM structure during compilation.
     *   - `controller`: supported. (NOTE: injection of `$attrs` and `$transclude` is not supported.)
     *   - `controllerAs`: supported.
     *   - `bindToController`: supported.
     *   - `link`: supported. (NOTE: only pre-link function is supported.)
     *   - `name`: supported.
     *   - `priority`: ignored.
     *   - `replace`: not supported.
     *   - `require`: supported.
     *   - `restrict`: must be set to 'E'.
     *   - `scope`: supported.
     *   - `template`: supported.
     *   - `templateUrl`: supported.
     *   - `terminal`: ignored.
     *   - `transclude`: supported.
     *
     *
     * ### Example
     *
     * ```
     * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
     * const module = angular.module('myExample', []);
     *
     * module.directive('greet', function() {
     *   return {
     *     scope: {salutation: '=', name: '=' },
     *     template: '{{salutation}} {{name}}! - <span ng-transclude></span>'
     *   };
     * });
     *
     * module.directive('ng2', adapter.downgradeNg2Component(Ng2Component));
     *
     * \@Component({
     *   selector: 'ng2',
     *   template: 'ng2 template: <greet salutation="Hello" [name]="world">text</greet>'
     * })
     * class Ng2Component {
     * }
     *
     * \@NgModule({
     *   declarations: [Ng2Component, adapter.upgradeNg1Component('greet')],
     *   imports: [BrowserModule]
     * })
     * class MyNg2Module {}
     *
     * document.body.innerHTML = '<ng2></ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual("ng2 template: Hello world! - text");
     * });
     * ```
     * @param {?} name
     * @return {?}
     */
    upgradeNg1Component(name) {
        if ((/** @type {?} */ (this.ng1ComponentsToBeUpgraded)).hasOwnProperty(name)) {
            return this.ng1ComponentsToBeUpgraded[name].type;
        }
        else {
            return (this.ng1ComponentsToBeUpgraded[name] = new UpgradeNg1ComponentAdapterBuilder(name))
                .type;
        }
    }
    /**
     * Registers the adapter's AngularJS upgrade module for unit testing in AngularJS.
     * Use this instead of `angular.mock.module()` to load the upgrade module into
     * the AngularJS testing injector.
     *
     * \@usageNotes
     * ### Example
     *
     * ```
     * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
     *
     * // configure the adapter with upgrade/downgrade components and services
     * upgradeAdapter.downgradeNg2Component(MyComponent);
     *
     * let upgradeAdapterRef: UpgradeAdapterRef;
     * let $compile, $rootScope;
     *
     * // We must register the adapter before any calls to `inject()`
     * beforeEach(() => {
     *   upgradeAdapterRef = upgradeAdapter.registerForNg1Tests(['heroApp']);
     * });
     *
     * beforeEach(inject((_$compile_, _$rootScope_) => {
     *   $compile = _$compile_;
     *   $rootScope = _$rootScope_;
     * }));
     *
     * it("says hello", (done) => {
     *   upgradeAdapterRef.ready(() => {
     *     const element = $compile("<my-component></my-component>")($rootScope);
     *     $rootScope.$apply();
     *     expect(element.html()).toContain("Hello World");
     *     done();
     *   })
     * });
     *
     * ```
     *
     * @param {?=} modules any AngularJS modules that the upgrade module should depend upon
     * @return {?} an `UpgradeAdapterRef`, which lets you register a `ready()` callback to
     * run assertions once the Angular components are ready to test through AngularJS.
     */
    registerForNg1Tests(modules) {
        /** @type {?} */
        const windowNgMock = (/** @type {?} */ (window))['angular'].mock;
        if (!windowNgMock || !windowNgMock.module) {
            throw new Error('Failed to find \'angular.mock.module\'.');
        }
        this.declareNg1Module(modules);
        windowNgMock.module(this.ng1Module.name);
        /** @type {?} */
        const upgrade = new UpgradeAdapterRef();
        this.ng2BootstrapDeferred.promise.then((ng1Injector) => { (/** @type {?} */ (upgrade))._bootstrapDone(this.moduleRef, ng1Injector); }, onError);
        return upgrade;
    }
    /**
     * Bootstrap a hybrid AngularJS / Angular application.
     *
     * This `bootstrap` method is a direct replacement (takes same arguments) for AngularJS
     * [`bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method. Unlike
     * AngularJS, this bootstrap is asynchronous.
     *
     * \@usageNotes
     * ### Example
     *
     * ```
     * const adapter = new UpgradeAdapter(MyNg2Module);
     * const module = angular.module('myExample', []);
     * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
     *
     * module.directive('ng1', function() {
     *   return {
     *      scope: { title: '=' },
     *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
     *   };
     * });
     *
     *
     * \@Component({
     *   selector: 'ng2',
     *   inputs: ['name'],
     *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)'
     * })
     * class Ng2 {
     * }
     *
     * \@NgModule({
     *   declarations: [Ng2, adapter.upgradeNg1Component('ng1')],
     *   imports: [BrowserModule]
     * })
     * class MyNg2Module {}
     *
     * document.body.innerHTML = '<ng2 name="World">project</ng2>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual(
     *       "ng2[ng1[Hello World!](transclude)](project)");
     * });
     * ```
     * @param {?} element
     * @param {?=} modules
     * @param {?=} config
     * @return {?}
     */
    bootstrap(element$$1, modules, config) {
        this.declareNg1Module(modules);
        /** @type {?} */
        const upgrade = new UpgradeAdapterRef();
        /** @type {?} */
        const windowAngular = (/** @type {?} */ (window /** TODO #???? */) /** TODO #???? */)['angular'];
        windowAngular.resumeBootstrap = undefined;
        this.ngZone.run(() => { bootstrap(element$$1, [this.ng1Module.name], /** @type {?} */ ((config))); });
        /** @type {?} */
        const ng1BootstrapPromise = new Promise((resolve) => {
            if (windowAngular.resumeBootstrap) {
                /** @type {?} */
                const originalResumeBootstrap = windowAngular.resumeBootstrap;
                windowAngular.resumeBootstrap = function () {
                    windowAngular.resumeBootstrap = originalResumeBootstrap;
                    /** @type {?} */
                    const r = windowAngular.resumeBootstrap.apply(this, arguments);
                    resolve();
                    return r;
                };
            }
            else {
                resolve();
            }
        });
        Promise.all([this.ng2BootstrapDeferred.promise, ng1BootstrapPromise]).then(([ng1Injector]) => {
            /** @type {?} */ ((element(element$$1).data))(controllerKey(INJECTOR_KEY), /** @type {?} */ ((this.moduleRef)).injector); /** @type {?} */
            ((this.moduleRef)).injector.get(NgZone).run(() => { (/** @type {?} */ (upgrade))._bootstrapDone(this.moduleRef, ng1Injector); });
        }, onError);
        return upgrade;
    }
    /**
     * Allows AngularJS service to be accessible from Angular.
     *
     * \@usageNotes
     * ### Example
     *
     * ```
     * class Login { ... }
     * class Server { ... }
     *
     * \@Injectable()
     * class Example {
     *   constructor(\@Inject('server') server, login: Login) {
     *     ...
     *   }
     * }
     *
     * const module = angular.module('myExample', []);
     * module.service('server', Server);
     * module.service('login', Login);
     *
     * const adapter = new UpgradeAdapter(MyNg2Module);
     * adapter.upgradeNg1Provider('server');
     * adapter.upgradeNg1Provider('login', {asToken: Login});
     *
     * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
     *   const example: Example = ref.ng2Injector.get(Example);
     * });
     *
     * ```
     * @param {?} name
     * @param {?=} options
     * @return {?}
     */
    upgradeNg1Provider(name, options) {
        /** @type {?} */
        const token = options && options.asToken || name;
        this.upgradedProviders.push({
            provide: token,
            useFactory: ($injector) => $injector.get(name),
            deps: [$INJECTOR]
        });
    }
    /**
     * Allows Angular service to be accessible from AngularJS.
     *
     * \@usageNotes
     * ### Example
     *
     * ```
     * class Example {
     * }
     *
     * const adapter = new UpgradeAdapter(MyNg2Module);
     *
     * const module = angular.module('myExample', []);
     * module.factory('example', adapter.downgradeNg2Provider(Example));
     *
     * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
     *   const example: Example = ref.ng1Injector.get('example');
     * });
     *
     * ```
     * @param {?} token
     * @return {?}
     */
    downgradeNg2Provider(token) { return downgradeInjectable(token); }
    /**
     * Declare the AngularJS upgrade module for this adapter without bootstrapping the whole
     * hybrid application.
     *
     * This method is automatically called by `bootstrap()` and `registerForNg1Tests()`.
     *
     * \@usageNotes
     * ### Example
     *
     * ```
     * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
     * upgradeAdapter.declareNg1Module(['heroApp']);
     * ```
     * @param {?=} modules The AngularJS modules that this upgrade module should depend upon.
     * @return {?} The AngularJS upgrade module that is declared by this method
     *
     */
    declareNg1Module(modules = []) {
        /** @type {?} */
        const delayApplyExps = [];
        /** @type {?} */
        let original$applyFn;
        /** @type {?} */
        let rootScopePrototype;
        /** @type {?} */
        let rootScope;
        /** @type {?} */
        const upgradeAdapter = this;
        /** @type {?} */
        const ng1Module = this.ng1Module = module$1(this.idPrefix, modules);
        /** @type {?} */
        const platformRef = platformBrowserDynamic();
        this.ngZone = new NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
        this.ng2BootstrapDeferred = new Deferred();
        ng1Module.factory(INJECTOR_KEY, () => /** @type {?} */ ((this.moduleRef)).injector.get(Injector))
            .factory(LAZY_MODULE_REF, [
            INJECTOR_KEY,
            (injector) => (/** @type {?} */ ({ injector, needsNgZone: false }))
        ])
            .constant(NG_ZONE_KEY, this.ngZone)
            .factory(COMPILER_KEY, () => /** @type {?} */ ((this.moduleRef)).injector.get(Compiler))
            .config([
            '$provide', '$injector',
            (provide, ng1Injector) => {
                provide.decorator($ROOT_SCOPE, [
                    '$delegate',
                    function (rootScopeDelegate) {
                        // Capture the root apply so that we can delay first call to $apply until we
                        // bootstrap Angular and then we replay and restore the $apply.
                        rootScopePrototype = rootScopeDelegate.constructor.prototype;
                        if (rootScopePrototype.hasOwnProperty('$apply')) {
                            original$applyFn = rootScopePrototype.$apply;
                            rootScopePrototype.$apply = (exp) => delayApplyExps.push(exp);
                        }
                        else {
                            throw new Error('Failed to find \'$apply\' on \'$rootScope\'!');
                        }
                        return rootScope = rootScopeDelegate;
                    }
                ]);
                if (ng1Injector.has($$TESTABILITY)) {
                    provide.decorator($$TESTABILITY, [
                        '$delegate',
                        function (testabilityDelegate) {
                            /** @type {?} */
                            const originalWhenStable = testabilityDelegate.whenStable;
                            /** @type {?} */
                            const newWhenStable = function (callback) {
                                originalWhenStable.call(this, function () {
                                    /** @type {?} */
                                    const ng2Testability = /** @type {?} */ ((upgradeAdapter.moduleRef)).injector.get(Testability);
                                    if (ng2Testability.isStable()) {
                                        callback.apply(this, arguments);
                                    }
                                    else {
                                        ng2Testability.whenStable(newWhenStable.bind(this, callback));
                                    }
                                });
                            };
                            testabilityDelegate.whenStable = newWhenStable;
                            return testabilityDelegate;
                        }
                    ]);
                }
            }
        ]);
        ng1Module.run([
            '$injector', '$rootScope',
            (ng1Injector, rootScope) => {
                UpgradeNg1ComponentAdapterBuilder.resolve(this.ng1ComponentsToBeUpgraded, ng1Injector)
                    .then(() => {
                    /** @type {?} */
                    const ngModule = {
                        providers: [
                            { provide: $INJECTOR, useFactory: () => ng1Injector },
                            { provide: $COMPILE, useFactory: () => ng1Injector.get($COMPILE) },
                            this.upgradedProviders
                        ],
                        imports: [this.ng2AppModule],
                        entryComponents: this.downgradedComponents
                    };
                    class DynamicNgUpgradeModule {
                        constructor() { }
                        /**
                         * @return {?}
                         */
                        ngDoBootstrap() { }
                    }
                    DynamicNgUpgradeModule.decorators = [
                        { type: NgModule, args: [Object.assign({ jit: true }, ngModule),] },
                    ];
                    /** @nocollapse */
                    DynamicNgUpgradeModule.ctorParameters = () => [];
                    platformRef
                        .bootstrapModule(DynamicNgUpgradeModule, [/** @type {?} */ ((this.compilerOptions)), { ngZone: this.ngZone }])
                        .then((ref) => {
                        this.moduleRef = ref;
                        this.ngZone.run(() => {
                            if (rootScopePrototype) {
                                rootScopePrototype.$apply = original$applyFn; // restore original $apply
                                while (delayApplyExps.length) {
                                    rootScope.$apply(delayApplyExps.shift());
                                }
                                rootScopePrototype = null;
                            }
                        });
                    })
                        .then(() => this.ng2BootstrapDeferred.resolve(ng1Injector), onError)
                        .then(() => {
                        /** @type {?} */
                        let subscription = this.ngZone.onMicrotaskEmpty.subscribe({ next: () => rootScope.$digest() });
                        rootScope.$on('$destroy', () => { subscription.unsubscribe(); });
                    });
                })
                    .catch((e) => this.ng2BootstrapDeferred.reject(e));
            }
        ]);
        return ng1Module;
    }
}
/**
 * Use `UpgradeAdapterRef` to control a hybrid AngularJS / Angular application.
 *
 * @deprecated Deprecated since v5. Use `upgrade/static` instead, which also supports
 * [Ahead-of-Time compilation](guide/aot-compiler).
 */
class UpgradeAdapterRef {
    constructor() {
        this._readyFn = null;
        this.ng1RootScope = /** @type {?} */ ((null));
        this.ng1Injector = /** @type {?} */ ((null));
        this.ng2ModuleRef = /** @type {?} */ ((null));
        this.ng2Injector = /** @type {?} */ ((null));
    }
    /**
     * @param {?} ngModuleRef
     * @param {?} ng1Injector
     * @return {?}
     */
    _bootstrapDone(ngModuleRef, ng1Injector) {
        this.ng2ModuleRef = ngModuleRef;
        this.ng2Injector = ngModuleRef.injector;
        this.ng1Injector = ng1Injector;
        this.ng1RootScope = ng1Injector.get($ROOT_SCOPE);
        this._readyFn && this._readyFn(this);
    }
    /**
     * Register a callback function which is notified upon successful hybrid AngularJS / Angular
     * application has been bootstrapped.
     *
     * The `ready` callback function is invoked inside the Angular zone, therefore it does not
     * require a call to `$apply()`.
     * @param {?} fn
     * @return {?}
     */
    ready(fn) { this._readyFn = fn; }
    /**
     * Dispose of running hybrid AngularJS / Angular application.
     * @return {?}
     */
    dispose() {
        /** @type {?} */ ((this.ng1Injector)).get($ROOT_SCOPE).$destroy(); /** @type {?} */
        ((this.ng2ModuleRef)).destroy();
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */
// This file only re-exports content of the `src` folder. Keep it that way.

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
 */

/**
 * Generated bundle index. Do not edit.
 */

export { VERSION, UpgradeAdapter, UpgradeAdapterRef };
//# sourceMappingURL=upgrade.js.map
