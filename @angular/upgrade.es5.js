/**
 * @license Angular v4.3.0-beta.0-6c1a8da
 * (c) 2010-2017 Google, Inc. https://angular.io/
 * License: MIT
 */
import { Compiler, ComponentFactoryResolver, Directive, ElementRef, EventEmitter, Inject, Injector, NgModule, NgZone, ReflectiveInjector, SimpleChange, Testability, Version } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of the common package.
 */
/**
 * \@stable
 */
var VERSION = new Version('4.3.0-beta.0-6c1a8da');
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @return {?}
 */
function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
}
var angular = ({
    bootstrap: noNg,
    module: noNg,
    element: noNg,
    version: noNg,
    resumeBootstrap: noNg,
    getTestability: noNg
});
try {
    if (window.hasOwnProperty('angular')) {
        angular = ((window)).angular;
    }
}
catch (e) {
    // ignore in CJS mode.
}
/**
 * Resets the AngularJS library.
 *
 * Used when angularjs is loaded lazily, and not available on `window`.
 *
 * \@stable
 * @param {?} ng
 * @return {?}
 */
/**
 * Returns the current version of the AngularJS library.
 *
 * \@stable
 * @return {?}
 */
var bootstrap = function (e, modules, config) { return angular.bootstrap(e, modules, config); };
var module$1 = function (prefix, dependencies) { return angular.module(prefix, dependencies); };
var element = function (e) { return angular.element(e); };
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var $COMPILE = '$compile';
var $CONTROLLER = '$controller';
var $HTTP_BACKEND = '$httpBackend';
var $INJECTOR = '$injector';
var $PARSE = '$parse';
var $ROOT_SCOPE = '$rootScope';
var $SCOPE = '$scope';
var $TEMPLATE_CACHE = '$templateCache';
var $$TESTABILITY = '$$testability';
var COMPILER_KEY = '$$angularCompiler';
var INJECTOR_KEY = '$$angularInjector';
var NG_ZONE_KEY = '$$angularNgZone';
var REQUIRE_INJECTOR = '?^^' + INJECTOR_KEY;
var REQUIRE_NG_MODEL = '?ngModel';
/**
 * A `PropertyBinding` represents a mapping between a property name
 * and an attribute name. It is parsed from a string of the form
 * `"prop: attr"`; or simply `"propAndAttr" where the property
 * and attribute have the same identifier.
 */
var PropertyBinding = (function () {
    /**
     * @param {?} prop
     * @param {?} attr
     */
    function PropertyBinding(prop, attr) {
        this.prop = prop;
        this.attr = attr;
        this.parseBinding();
    }
    /**
     * @return {?}
     */
    PropertyBinding.prototype.parseBinding = function () {
        this.bracketAttr = "[" + this.attr + "]";
        this.parenAttr = "(" + this.attr + ")";
        this.bracketParenAttr = "[(" + this.attr + ")]";
        var /** @type {?} */ capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.substr(1);
        this.onAttr = "on" + capitalAttr;
        this.bindAttr = "bind" + capitalAttr;
        this.bindonAttr = "bindon" + capitalAttr;
    };
    return PropertyBinding;
}());
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
 * @param {?} node
 * @return {?}
 */
/**
 * @param {?} component
 * @return {?}
 */
function getComponentName(component) {
    // Return the name of the component or the first line of its stringified version.
    return ((component)).overriddenName || component.name || component.toString().split('\n')[0];
}
var Deferred = (function () {
    function Deferred() {
        var _this = this;
        this.promise = new Promise(function (res, rej) {
            _this.resolve = res;
            _this.reject = rej;
        });
    }
    return Deferred;
}());
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
        ngModel.$render = function () { component.writeValue(ngModel.$viewValue); };
        component.registerOnChange(ngModel.$setViewValue.bind(ngModel));
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
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var DowngradeComponentAdapter = (function () {
    /**
     * @param {?} id
     * @param {?} element
     * @param {?} attrs
     * @param {?} scope
     * @param {?} ngModel
     * @param {?} parentInjector
     * @param {?} $injector
     * @param {?} $compile
     * @param {?} $parse
     * @param {?} componentFactory
     */
    function DowngradeComponentAdapter(id, element, attrs, scope, ngModel, parentInjector, $injector, $compile, $parse, componentFactory) {
        this.id = id;
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.ngModel = ngModel;
        this.parentInjector = parentInjector;
        this.$injector = $injector;
        this.$compile = $compile;
        this.$parse = $parse;
        this.componentFactory = componentFactory;
        this.inputChangeCount = 0;
        this.inputChanges = null;
        this.componentRef = null;
        this.component = null;
        this.changeDetector = null;
        this.element[0].id = id;
        this.componentScope = scope.$new();
    }
    /**
     * @return {?}
     */
    DowngradeComponentAdapter.prototype.compileContents = function () {
        var _this = this;
        var /** @type {?} */ compiledProjectableNodes = [];
        var /** @type {?} */ projectableNodes = this.groupProjectableNodes();
        var /** @type {?} */ linkFns = projectableNodes.map(function (nodes) { return _this.$compile(nodes); }); /** @type {?} */
        ((this.element.empty))();
        linkFns.forEach(function (linkFn) {
            linkFn(_this.scope, function (clone) {
                compiledProjectableNodes.push(clone); /** @type {?} */
                ((_this.element.append))(clone);
            });
        });
        return compiledProjectableNodes;
    };
    /**
     * @param {?} projectableNodes
     * @return {?}
     */
    DowngradeComponentAdapter.prototype.createComponent = function (projectableNodes) {
        var /** @type {?} */ childInjector = ReflectiveInjector.resolveAndCreate([{ provide: $SCOPE, useValue: this.componentScope }], this.parentInjector);
        this.componentRef =
            this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        this.changeDetector = this.componentRef.changeDetectorRef;
        this.component = this.componentRef.instance;
        hookupNgModel(this.ngModel, this.component);
    };
    /**
     * @return {?}
     */
    DowngradeComponentAdapter.prototype.setupInputs = function () {
        var _this = this;
        var /** @type {?} */ attrs = this.attrs;
        var /** @type {?} */ inputs = this.componentFactory.inputs || [];
        var _loop_1 = function (i) {
            var /** @type {?} */ input = new PropertyBinding(inputs[i].propName, inputs[i].templateName);
            var /** @type {?} */ expr = null;
            if (attrs.hasOwnProperty(input.attr)) {
                var /** @type {?} */ observeFn_1 = (function (prop) {
                    var /** @type {?} */ prevValue = INITIAL_VALUE;
                    return function (currValue) {
                        // Initially, both `$observe()` and `$watch()` will call this function.
                        if (!strictEquals(prevValue, currValue)) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            _this.updateInput(prop, prevValue, currValue);
                            prevValue = currValue;
                        }
                    };
                })(input.prop);
                attrs.$observe(input.attr, observeFn_1);
                // Use `$watch()` (in addition to `$observe()`) in order to initialize the input  in time
                // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
                // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
                var /** @type {?} */ unwatch_1 = this_1.componentScope.$watch(function () {
                    unwatch_1('');
                    unwatch_1 = null;
                    observeFn_1(((attrs))[input.attr]);
                });
            }
            else if (attrs.hasOwnProperty(input.bindAttr)) {
                expr = ((attrs) /** TODO #9100 */)[input.bindAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketAttr)) {
                expr = ((attrs) /** TODO #9100 */)[input.bracketAttr];
            }
            else if (attrs.hasOwnProperty(input.bindonAttr)) {
                expr = ((attrs) /** TODO #9100 */)[input.bindonAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
                expr = ((attrs) /** TODO #9100 */)[input.bracketParenAttr];
            }
            if (expr != null) {
                var /** @type {?} */ watchFn = (function (prop) { return function (currValue, prevValue) { return _this.updateInput(prop, prevValue, currValue); }; })(input.prop);
                this_1.componentScope.$watch(expr, watchFn);
            }
        };
        var this_1 = this;
        for (var /** @type {?} */ i = 0; i < inputs.length; i++) {
            _loop_1(/** @type {?} */ i);
        }
        var /** @type {?} */ prototype = this.componentFactory.componentType.prototype;
        if (prototype && ((prototype)).ngOnChanges) {
            // Detect: OnChanges interface
            this.inputChanges = {};
            this.componentScope.$watch(function () { return _this.inputChangeCount; }, function () {
                var /** @type {?} */ inputChanges = _this.inputChanges;
                _this.inputChanges = {};
                ((_this.component)).ngOnChanges(/** @type {?} */ ((inputChanges)));
            });
        }
        this.componentScope.$watch(function () { return _this.changeDetector && _this.changeDetector.detectChanges(); });
    };
    /**
     * @return {?}
     */
    DowngradeComponentAdapter.prototype.setupOutputs = function () {
        var _this = this;
        var /** @type {?} */ attrs = this.attrs;
        var /** @type {?} */ outputs = this.componentFactory.outputs || [];
        for (var /** @type {?} */ j = 0; j < outputs.length; j++) {
            var /** @type {?} */ output = new PropertyBinding(outputs[j].propName, outputs[j].templateName);
            var /** @type {?} */ expr = null;
            var /** @type {?} */ assignExpr = false;
            var /** @type {?} */ bindonAttr = output.bindonAttr ? output.bindonAttr.substring(0, output.bindonAttr.length - 6) : null;
            var /** @type {?} */ bracketParenAttr = output.bracketParenAttr ?
                "[(" + output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8) + ")]" :
                null;
            if (attrs.hasOwnProperty(output.onAttr)) {
                expr = ((attrs) /** TODO #9100 */)[output.onAttr];
            }
            else if (attrs.hasOwnProperty(output.parenAttr)) {
                expr = ((attrs) /** TODO #9100 */)[output.parenAttr];
            }
            else if (attrs.hasOwnProperty(/** @type {?} */ ((bindonAttr)))) {
                expr = ((attrs) /** TODO #9100 */)[((bindonAttr))];
                assignExpr = true;
            }
            else if (attrs.hasOwnProperty(/** @type {?} */ ((bracketParenAttr)))) {
                expr = ((attrs) /** TODO #9100 */)[((bracketParenAttr))];
                assignExpr = true;
            }
            if (expr != null && assignExpr != null) {
                var /** @type {?} */ getter = this.$parse(expr);
                var /** @type {?} */ setter = getter.assign;
                if (assignExpr && !setter) {
                    throw new Error("Expression '" + expr + "' is not assignable!");
                }
                var /** @type {?} */ emitter = (this.component[output.prop]);
                if (emitter) {
                    emitter.subscribe({
                        next: assignExpr ?
                            (function (setter) { return function (v /** TODO #9100 */) { return setter(_this.scope, v); }; })(setter) :
                            (function (getter) { return function (v /** TODO #9100 */) { return getter(_this.scope, { '$event': v }); }; })(getter)
                    });
                }
                else {
                    throw new Error("Missing emitter '" + output.prop + "' on component '" + getComponentName(this.componentFactory.componentType) + "'!");
                }
            }
        }
    };
    /**
     * @return {?}
     */
    DowngradeComponentAdapter.prototype.registerCleanup = function () {
        var _this = this;
        ((this.element.bind))('$destroy', function () {
            _this.componentScope.$destroy(); /** @type {?} */
            ((_this.componentRef)).destroy();
        });
    };
    /**
     * @return {?}
     */
    DowngradeComponentAdapter.prototype.getInjector = function () { return ((this.componentRef)) && ((this.componentRef)).injector; };
    /**
     * @param {?} prop
     * @param {?} prevValue
     * @param {?} currValue
     * @return {?}
     */
    DowngradeComponentAdapter.prototype.updateInput = function (prop, prevValue, currValue) {
        if (this.inputChanges) {
            this.inputChangeCount++;
            this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
        }
        this.component[prop] = currValue;
    };
    /**
     * @return {?}
     */
    DowngradeComponentAdapter.prototype.groupProjectableNodes = function () {
        var /** @type {?} */ ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, /** @type {?} */ ((this.element.contents))());
    };
    return DowngradeComponentAdapter;
}());
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 * @param {?} ngContentSelectors
 * @param {?} nodes
 * @return {?}
 */
function groupNodesBySelector(ngContentSelectors, nodes) {
    var /** @type {?} */ projectableNodes = [];
    var /** @type {?} */ wildcardNgContentIndex;
    for (var /** @type {?} */ i = 0, /** @type {?} */ ii = ngContentSelectors.length; i < ii; ++i) {
        projectableNodes[i] = [];
    }
    for (var /** @type {?} */ j = 0, /** @type {?} */ jj = nodes.length; j < jj; ++j) {
        var /** @type {?} */ node = nodes[j];
        var /** @type {?} */ ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
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
    var /** @type {?} */ ngContentIndices = [];
    var /** @type {?} */ wildcardNgContentIndex = -1;
    for (var /** @type {?} */ i = 0; i < ngContentSelectors.length; i++) {
        var /** @type {?} */ selector = ngContentSelectors[i];
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
var _matches;
/**
 * @param {?} el
 * @param {?} selector
 * @return {?}
 */
function matchesSelector(el, selector) {
    if (!_matches) {
        var /** @type {?} */ elProto = (Element.prototype);
        _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
            elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
    }
    return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var downgradeCount = 0;
/**
 * \@whatItDoes
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allows an Angular component to be used from AngularJS.
 *
 * \@howToUse
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-heroes-wrapper"}
 *
 * \@description
 *
 * A helper function that returns a factory function to be used for registering an
 * AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * The parameter contains information about the Component that is being downgraded:
 *
 * * `component: Type<any>`: The type of the Component that will be downgraded
 *
 * \@experimental
 * @param {?} info
 * @return {?}
 */
function downgradeComponent(info) {
    var /** @type {?} */ idPrefix = "NG2_UPGRADE_" + downgradeCount++ + "_";
    var /** @type {?} */ idCount = 0;
    var /** @type {?} */ directiveFactory = function ($compile, $injector, $parse) {
        return {
            restrict: 'E',
            terminal: true,
            require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
            link: function (scope, element, attrs, required) {
                // We might have to compile the contents asynchronously, because this might have been
                // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                // been compiled.
                var /** @type {?} */ parentInjector = required[0] || $injector.get(INJECTOR_KEY);
                var /** @type {?} */ ngModel = required[1];
                var /** @type {?} */ downgradeFn = function (injector) {
                    var /** @type {?} */ componentFactoryResolver = injector.get(ComponentFactoryResolver);
                    var /** @type {?} */ componentFactory = ((componentFactoryResolver.resolveComponentFactory(info.component)));
                    if (!componentFactory) {
                        throw new Error('Expecting ComponentFactory for: ' + getComponentName(info.component));
                    }
                    var /** @type {?} */ id = idPrefix + (idCount++);
                    var /** @type {?} */ injectorPromise = new ParentInjectorPromise$1(element);
                    var /** @type {?} */ facade = new DowngradeComponentAdapter(id, element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory);
                    var /** @type {?} */ projectableNodes = facade.compileContents();
                    facade.createComponent(projectableNodes);
                    facade.setupInputs();
                    facade.setupOutputs();
                    facade.registerCleanup();
                    injectorPromise.resolve(facade.getInjector());
                };
                if (parentInjector instanceof ParentInjectorPromise$1) {
                    parentInjector.then(downgradeFn);
                }
                else {
                    downgradeFn(parentInjector);
                }
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
var ParentInjectorPromise$1 = (function () {
    /**
     * @param {?} element
     */
    function ParentInjectorPromise$1(element) {
        this.element = element;
        this.injectorKey = controllerKey(INJECTOR_KEY);
        this.callbacks = [];
        // Store the promise on the element.
        element.data(this.injectorKey, this);
    }
    /**
     * @param {?} callback
     * @return {?}
     */
    ParentInjectorPromise$1.prototype.then = function (callback) {
        if (this.injector) {
            callback(this.injector);
        }
        else {
            this.callbacks.push(callback);
        }
    };
    /**
     * @param {?} injector
     * @return {?}
     */
    ParentInjectorPromise$1.prototype.resolve = function (injector) {
        this.injector = injector; /** @type {?} */
        ((
        // Store the real injector on the element.
        this.element.data))(this.injectorKey, injector);
        // Release the element to prevent memory leaks.
        this.element = ((null));
        // Run the queued callbacks.
        this.callbacks.forEach(function (callback) { return callback(injector); });
        this.callbacks.length = 0;
    };
    return ParentInjectorPromise$1;
}());
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * \@whatItDoes
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allow an Angular service to be accessible from AngularJS.
 *
 * \@howToUse
 *
 * First ensure that the service to be downgraded is provided in an {\@link NgModule}
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app {\@link NgModule}
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {\@example upgrade/static/ts/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {\@example upgrade/static/ts/module.ts region="example-app"}
 *
 * \@description
 *
 * Takes a `token` that identifies a service provided from Angular.
 *
 * Returns a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 * The factory function provides access to the Angular service that
 * is identified by the `token` parameter.
 *
 * \@experimental
 * @param {?} token
 * @return {?}
 */
function downgradeInjectable(token) {
    var /** @type {?} */ factory = function (i) { return i.get(token); };
    ((factory))['$inject'] = [INJECTOR_KEY];
    return factory;
}
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var CAMEL_CASE = /([A-Z])/g;
var INITIAL_VALUE$1 = {
    __UNINITIALIZED__: true
};
var NOT_SUPPORTED = 'NOT_SUPPORTED';
var UpgradeNg1ComponentAdapterBuilder = (function () {
    /**
     * @param {?} name
     */
    function UpgradeNg1ComponentAdapterBuilder(name) {
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
        var selector = name.replace(CAMEL_CASE, function (all /** TODO #9100 */, next) { return '-' + next.toLowerCase(); });
        var self = this;
        this.type = Directive({
            selector: selector,
            inputs: this.inputsRename,
            outputs: this.outputsRename
        }).Class({
            constructor: [
                new Inject($SCOPE), ElementRef,
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
    UpgradeNg1ComponentAdapterBuilder.prototype.extractDirective = function (injector) {
        var /** @type {?} */ directives = injector.get(this.name + 'Directive');
        if (directives.length > 1) {
            throw new Error('Only support single directive definition for: ' + this.name);
        }
        var /** @type {?} */ directive = directives[0];
        if (directive.replace)
            this.notSupported('replace');
        if (directive.terminal)
            this.notSupported('terminal');
        var /** @type {?} */ link = directive.link;
        if (typeof link == 'object') {
            if (((link)).post)
                this.notSupported('link.post');
        }
        return directive;
    };
    /**
     * @param {?} feature
     * @return {?}
     */
    UpgradeNg1ComponentAdapterBuilder.prototype.notSupported = function (feature) {
        throw new Error("Upgraded directive '" + this.name + "' does not support '" + feature + "'.");
    };
    /**
     * @return {?}
     */
    UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = function () {
        var _this = this;
        var /** @type {?} */ btcIsObject = typeof ((this.directive)).bindToController === 'object';
        if (btcIsObject && Object.keys(/** @type {?} */ ((this.directive)).scope).length) {
            throw new Error("Binding definitions on scope and controller at the same time are not supported.");
        }
        var /** @type {?} */ context = (btcIsObject) ? ((this.directive)).bindToController : ((this.directive)).scope;
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
     * @param {?} compile
     * @param {?} templateCache
     * @param {?} httpBackend
     * @return {?}
     */
    UpgradeNg1ComponentAdapterBuilder.prototype.compileTemplate = function (compile, templateCache, httpBackend) {
        var _this = this;
        if (((this.directive)).template !== undefined) {
            this.linkFn = compileHtml(isFunction(/** @type {?} */ ((this.directive)).template) ? ((((this.directive)).template))() : ((this.directive)).template);
        }
        else if (((this.directive)).templateUrl) {
            var /** @type {?} */ url_1 = isFunction(/** @type {?} */ ((this.directive)).templateUrl) ?
                ((((this.directive)).templateUrl))() : ((this.directive)).templateUrl;
            var /** @type {?} */ html = templateCache.get(url_1);
            if (html !== undefined) {
                this.linkFn = compileHtml(html);
            }
            else {
                return new Promise(function (resolve, err) {
                    httpBackend('GET', url_1, null, function (status /** TODO #9100 */, response /** TODO #9100 */) {
                        if (status == 200) {
                            resolve(_this.linkFn = compileHtml(templateCache.put(url_1, response)));
                        }
                        else {
                            err("GET " + url_1 + " returned " + status + ": " + response);
                        }
                    });
                });
            }
        }
        else {
            throw new Error("Directive '" + this.name + "' is not a component, it is missing template.");
        }
        return null;
        /**
         * @param {?} html
         * @return {?}
         */
        function compileHtml(html /** TODO #9100 */) {
            var /** @type {?} */ div = document.createElement('div');
            div.innerHTML = html;
            return compile(div.childNodes);
        }
    };
    /**
     * Upgrade ng1 components into Angular.
     * @param {?} exportedComponents
     * @param {?} injector
     * @return {?}
     */
    UpgradeNg1ComponentAdapterBuilder.resolve = function (exportedComponents, injector) {
        var /** @type {?} */ promises = [];
        var /** @type {?} */ compile = injector.get($COMPILE);
        var /** @type {?} */ templateCache = injector.get($TEMPLATE_CACHE);
        var /** @type {?} */ httpBackend = injector.get($HTTP_BACKEND);
        var /** @type {?} */ $controller = injector.get($CONTROLLER);
        for (var /** @type {?} */ name in exportedComponents) {
            if (((exportedComponents)).hasOwnProperty(name)) {
                var /** @type {?} */ exportedComponent = exportedComponents[name];
                exportedComponent.directive = exportedComponent.extractDirective(injector);
                exportedComponent.$controller = $controller;
                exportedComponent.extractBindings();
                var /** @type {?} */ promise = ((exportedComponent.compileTemplate(compile, templateCache, httpBackend)));
                if (promise)
                    promises.push(promise);
            }
        }
        return Promise.all(promises);
    };
    return UpgradeNg1ComponentAdapterBuilder;
}());
var UpgradeNg1ComponentAdapter = (function () {
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
    function UpgradeNg1ComponentAdapter(linkFn, scope, directive, elementRef, $controller, inputs, outputs, propOuts, checkProperties, propertyMap) {
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
        this.$element = element(this.element);
        var controllerType = directive.controller;
        if (directive.bindToController && controllerType) {
            this.controllerInstance = this.buildController(controllerType);
            this.destinationObj = this.controllerInstance;
        }
        else {
            this.destinationObj = this.componentScope;
        }
        for (var i = 0; i < inputs.length; i++) {
            this /** TODO #9100 */[inputs[i]] = null;
        }
        for (var j = 0; j < outputs.length; j++) {
            var emitter = this[outputs[j]] = new EventEmitter();
            this.setComponentProperty(outputs[j], (function (emitter) { return function (value) { return emitter.emit(value); }; })(emitter));
        }
        for (var k = 0; k < propOuts.length; k++) {
            this.checkLastValues.push(INITIAL_VALUE$1);
        }
    }
    /**
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.directive.bindToController && this.directive.controller) {
            this.controllerInstance = this.buildController(this.directive.controller);
        }
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        var /** @type {?} */ link = this.directive.link;
        if (typeof link == 'object')
            link = ((link)).pre;
        if (link) {
            var /** @type {?} */ attrs = NOT_SUPPORTED;
            var /** @type {?} */ transcludeFn = NOT_SUPPORTED;
            var /** @type {?} */ linkController = this.resolveRequired(this.$element, /** @type {?} */ ((this.directive.require)));
            ((this.directive.link))(this.componentScope, this.$element, attrs, linkController, transcludeFn);
        }
        var /** @type {?} */ childNodes = [];
        var /** @type {?} */ childNode;
        while (childNode = this.element.firstChild) {
            this.element.removeChild(childNode);
            childNodes.push(childNode);
        }
        this.linkFn(this.componentScope, function (clonedElement, scope) {
            for (var /** @type {?} */ i = 0, /** @type {?} */ ii = ((clonedElement)).length; i < ii; i++) {
                _this.element.appendChild(/** @type {?} */ ((clonedElement))[i]);
            }
        }, {
            parentBoundTranscludeFn: function (scope /** TODO #9100 */, cloneAttach /** TODO #9100 */) { cloneAttach(childNodes); }
        });
        if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
            this.controllerInstance.$postLink();
        }
    };
    /**
     * @param {?} changes
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.ngOnChanges = function (changes) {
        var _this = this;
        var /** @type {?} */ ng1Changes = {};
        Object.keys(changes).forEach(function (name) {
            var /** @type {?} */ change = changes[name];
            _this.setComponentProperty(name, change.currentValue);
            ng1Changes[_this.propertyMap[name]] = change;
        });
        if (isFunction(/** @type {?} */ ((this.destinationObj)).$onChanges)) {
            ((((this.destinationObj)).$onChanges))(ng1Changes);
        }
    };
    /**
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.ngDoCheck = function () {
        var _this = this;
        var /** @type {?} */ destinationObj = this.destinationObj;
        var /** @type {?} */ lastValues = this.checkLastValues;
        var /** @type {?} */ checkProperties = this.checkProperties;
        var /** @type {?} */ propOuts = this.propOuts;
        checkProperties.forEach(function (propName, i) {
            var /** @type {?} */ value = ((destinationObj))[propName];
            var /** @type {?} */ last = lastValues[i];
            if (!strictEquals(last, value)) {
                var /** @type {?} */ eventEmitter = ((_this))[propOuts[i]];
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
    UpgradeNg1ComponentAdapter.prototype.ngOnDestroy = function () {
        if (this.controllerInstance && isFunction(this.controllerInstance.$onDestroy)) {
            this.controllerInstance.$onDestroy();
        }
    };
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function (name, value) {
        ((this.destinationObj))[this.propertyMap[name]] = value;
    };
    /**
     * @param {?} controllerType
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.buildController = function (controllerType /** TODO #9100 */) {
        var /** @type {?} */ locals = { $scope: this.componentScope, $element: this.$element };
        var /** @type {?} */ controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);
        this.$element.data(controllerKey(/** @type {?} */ ((this.directive.name))), controller);
        return controller;
    };
    /**
     * @param {?} $element
     * @param {?} require
     * @return {?}
     */
    UpgradeNg1ComponentAdapter.prototype.resolveRequired = function ($element, require) {
        if (!require) {
            return undefined;
        }
        else if (typeof require == 'string') {
            var /** @type {?} */ name = (require);
            var /** @type {?} */ isOptional = false;
            var /** @type {?} */ startParent = false;
            var /** @type {?} */ searchParents = false;
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
            var /** @type {?} */ key = controllerKey(name);
            if (startParent)
                $element = (($element.parent))();
            var /** @type {?} */ dep = searchParents ? (($element.inheritedData))(key) : (($element.data))(key);
            if (!dep && !isOptional) {
                throw new Error("Can not locate '" + require + "' in '" + this.directive.name + "'.");
            }
            return dep;
        }
        else if (require instanceof Array) {
            var /** @type {?} */ deps = [];
            for (var /** @type {?} */ i = 0; i < require.length; i++) {
                deps.push(this.resolveRequired($element, require[i]));
            }
            return deps;
        }
        throw new Error("Directive '" + this.directive.name + "' require syntax unrecognized: " + this.directive.require);
    };
    return UpgradeNg1ComponentAdapter;
}());
/**
 * @param {?} value
 * @return {?}
 */
function isFunction(value) {
    return typeof value === 'function';
}
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var upgradeCount = 0;
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
 * ## Mental Model
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
 * \@stable
 */
var UpgradeAdapter = (function () {
    /**
     * @param {?} ng2AppModule
     * @param {?=} compilerOptions
     */
    function UpgradeAdapter(ng2AppModule, compilerOptions) {
        this.ng2AppModule = ng2AppModule;
        this.compilerOptions = compilerOptions;
        this.idPrefix = "NG2_UPGRADE_" + upgradeCount++ + "_";
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
     * ## Mental Model
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
     * ## Supported Features
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
     *   \@Input() salutation: string;
     *   \@Input() name: string;
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
    UpgradeAdapter.prototype.downgradeNg2Component = function (component) {
        this.downgradedComponents.push(component);
        return downgradeComponent({ component: component });
    };
    /**
     * Allows AngularJS Component to be used from Angular.
     *
     * Use `upgradeNg1Component` to create an Angular component from AngularJS Component
     * directive. The adapter will bootstrap AngularJS component from within the Angular
     * template.
     *
     * ## Mental Model
     *
     * 1. The component is instantiated by being listed in Angular template. This means that the
     *    host element is controlled by Angular, but the component's view will be controlled by
     *    AngularJS.
     *
     * ## Supported Features
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
    UpgradeAdapter.prototype.upgradeNg1Component = function (name) {
        if (((this.ng1ComponentsToBeUpgraded)).hasOwnProperty(name)) {
            return this.ng1ComponentsToBeUpgraded[name].type;
        }
        else {
            return (this.ng1ComponentsToBeUpgraded[name] = new UpgradeNg1ComponentAdapterBuilder(name))
                .type;
        }
    };
    /**
     * Registers the adapter's AngularJS upgrade module for unit testing in AngularJS.
     * Use this instead of `angular.mock.module()` to load the upgrade module into
     * the AngularJS testing injector.
     *
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
     * @return {?} an {\@link UpgradeAdapterRef}, which lets you register a `ready()` callback to
     * run assertions once the Angular components are ready to test through AngularJS.
     */
    UpgradeAdapter.prototype.registerForNg1Tests = function (modules) {
        var _this = this;
        var /** @type {?} */ windowNgMock = ((window))['angular'].mock;
        if (!windowNgMock || !windowNgMock.module) {
            throw new Error('Failed to find \'angular.mock.module\'.');
        }
        this.declareNg1Module(modules);
        windowNgMock.module(this.ng1Module.name);
        var /** @type {?} */ upgrade = new UpgradeAdapterRef();
        this.ng2BootstrapDeferred.promise.then(function (ng1Injector) { ((upgrade))._bootstrapDone(_this.moduleRef, ng1Injector); }, onError);
        return upgrade;
    };
    /**
     * Bootstrap a hybrid AngularJS / Angular application.
     *
     * This `bootstrap` method is a direct replacement (takes same arguments) for AngularJS
     * [`bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method. Unlike
     * AngularJS, this bootstrap is asynchronous.
     *
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
    UpgradeAdapter.prototype.bootstrap = function (element$$1, modules, config) {
        var _this = this;
        this.declareNg1Module(modules);
        var /** @type {?} */ upgrade = new UpgradeAdapterRef();
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        var /** @type {?} */ windowAngular = ((window) /** TODO #???? */)['angular'];
        windowAngular.resumeBootstrap = undefined;
        this.ngZone.run(function () { bootstrap(element$$1, [_this.ng1Module.name], /** @type {?} */ ((config))); });
        var /** @type {?} */ ng1BootstrapPromise = new Promise(function (resolve) {
            if (windowAngular.resumeBootstrap) {
                var /** @type {?} */ originalResumeBootstrap_1 = windowAngular.resumeBootstrap;
                windowAngular.resumeBootstrap = function () {
                    windowAngular.resumeBootstrap = originalResumeBootstrap_1;
                    windowAngular.resumeBootstrap.apply(this, arguments);
                    resolve();
                };
            }
            else {
                resolve();
            }
        });
        Promise.all([this.ng2BootstrapDeferred.promise, ng1BootstrapPromise]).then(function (_a) {
            var ng1Injector = _a[0];
            ((element(element$$1).data))(controllerKey(INJECTOR_KEY), /** @type {?} */ ((_this.moduleRef)).injector); /** @type {?} */
            ((_this.moduleRef)).injector.get(NgZone).run(function () { ((upgrade))._bootstrapDone(_this.moduleRef, ng1Injector); });
        }, onError);
        return upgrade;
    };
    /**
     * Allows AngularJS service to be accessible from Angular.
     *
     *
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
    UpgradeAdapter.prototype.upgradeNg1Provider = function (name, options) {
        var /** @type {?} */ token = options && options.asToken || name;
        this.upgradedProviders.push({
            provide: token,
            useFactory: function ($injector) { return $injector.get(name); },
            deps: [$INJECTOR]
        });
    };
    /**
     * Allows Angular service to be accessible from AngularJS.
     *
     *
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
    UpgradeAdapter.prototype.downgradeNg2Provider = function (token) { return downgradeInjectable(token); };
    /**
     * Declare the AngularJS upgrade module for this adapter without bootstrapping the whole
     * hybrid application.
     *
     * This method is automatically called by `bootstrap()` and `registerForNg1Tests()`.
     *
     * @param {?=} modules The AngularJS modules that this upgrade module should depend upon.
     * @return {?} The AngularJS upgrade module that is declared by this method
     *
     * ### Example
     *
     * ```
     * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
     * upgradeAdapter.declareNg1Module(['heroApp']);
     * ```
     */
    UpgradeAdapter.prototype.declareNg1Module = function (modules) {
        var _this = this;
        if (modules === void 0) { modules = []; }
        var /** @type {?} */ delayApplyExps = [];
        var /** @type {?} */ original$applyFn;
        var /** @type {?} */ rootScopePrototype;
        var /** @type {?} */ rootScope;
        var /** @type {?} */ upgradeAdapter = this;
        var /** @type {?} */ ng1Module = this.ng1Module = module$1(this.idPrefix, modules);
        var /** @type {?} */ platformRef = platformBrowserDynamic();
        this.ngZone = new NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
        this.ng2BootstrapDeferred = new Deferred();
        ng1Module.factory(INJECTOR_KEY, function () { return ((_this.moduleRef)).injector.get(Injector); })
            .constant(NG_ZONE_KEY, this.ngZone)
            .factory(COMPILER_KEY, function () { return ((_this.moduleRef)).injector.get(Compiler); })
            .config([
            '$provide', '$injector',
            function (provide, ng1Injector) {
                provide.decorator($ROOT_SCOPE, [
                    '$delegate',
                    function (rootScopeDelegate) {
                        // Capture the root apply so that we can delay first call to $apply until we
                        // bootstrap Angular and then we replay and restore the $apply.
                        rootScopePrototype = rootScopeDelegate.constructor.prototype;
                        if (rootScopePrototype.hasOwnProperty('$apply')) {
                            original$applyFn = rootScopePrototype.$apply;
                            rootScopePrototype.$apply = function (exp) { return delayApplyExps.push(exp); };
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
                            var /** @type {?} */ originalWhenStable = testabilityDelegate.whenStable;
                            // Cannot use arrow function below because we need the context
                            var /** @type {?} */ newWhenStable = function (callback) {
                                originalWhenStable.call(this, function () {
                                    var /** @type {?} */ ng2Testability = ((upgradeAdapter.moduleRef)).injector.get(Testability);
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
            function (ng1Injector, rootScope) {
                UpgradeNg1ComponentAdapterBuilder.resolve(_this.ng1ComponentsToBeUpgraded, ng1Injector)
                    .then(function () {
                    // At this point we have ng1 injector and we have lifted ng1 components into ng2, we
                    // now can bootstrap ng2.
                    var /** @type {?} */ DynamicNgUpgradeModule = NgModule({
                        providers: [
                            { provide: $INJECTOR, useFactory: function () { return ng1Injector; } },
                            { provide: $COMPILE, useFactory: function () { return ng1Injector.get($COMPILE); } },
                            _this.upgradedProviders
                        ],
                        imports: [_this.ng2AppModule],
                        entryComponents: _this.downgradedComponents
                    }).Class({
                        constructor: function DynamicNgUpgradeModule() { },
                        ngDoBootstrap: function () { }
                    });
                    ((platformRef))
                        ._bootstrapModuleWithZone(DynamicNgUpgradeModule, _this.compilerOptions, _this.ngZone)
                        .then(function (ref) {
                        _this.moduleRef = ref;
                        _this.ngZone.run(function () {
                            if (rootScopePrototype) {
                                rootScopePrototype.$apply = original$applyFn; // restore original $apply
                                while (delayApplyExps.length) {
                                    rootScope.$apply(delayApplyExps.shift());
                                }
                                rootScopePrototype = null;
                            }
                        });
                    })
                        .then(function () { return _this.ng2BootstrapDeferred.resolve(ng1Injector); }, onError)
                        .then(function () {
                        var /** @type {?} */ subscription = _this.ngZone.onMicrotaskEmpty.subscribe({ next: function () { return rootScope.$digest(); } });
                        rootScope.$on('$destroy', function () { subscription.unsubscribe(); });
                    });
                })
                    .catch(function (e) { return _this.ng2BootstrapDeferred.reject(e); });
            }
        ]);
        return ng1Module;
    };
    return UpgradeAdapter;
}());
/**
 * Use `UpgradeAdapterRef` to control a hybrid AngularJS / Angular application.
 *
 * \@stable
 */
var UpgradeAdapterRef = (function () {
    function UpgradeAdapterRef() {
        this._readyFn = null;
        this.ng1RootScope = ((null));
        this.ng1Injector = ((null));
        this.ng2ModuleRef = ((null));
        this.ng2Injector = ((null));
    }
    /**
     * @param {?} ngModuleRef
     * @param {?} ng1Injector
     * @return {?}
     */
    UpgradeAdapterRef.prototype._bootstrapDone = function (ngModuleRef, ng1Injector) {
        this.ng2ModuleRef = ngModuleRef;
        this.ng2Injector = ngModuleRef.injector;
        this.ng1Injector = ng1Injector;
        this.ng1RootScope = ng1Injector.get($ROOT_SCOPE);
        this._readyFn && this._readyFn(this);
    };
    /**
     * Register a callback function which is notified upon successful hybrid AngularJS / Angular
     * application has been bootstrapped.
     *
     * The `ready` callback function is invoked inside the Angular zone, therefore it does not
     * require a call to `$apply()`.
     * @param {?} fn
     * @return {?}
     */
    UpgradeAdapterRef.prototype.ready = function (fn) { this._readyFn = fn; };
    /**
     * Dispose of running hybrid AngularJS / Angular application.
     * @return {?}
     */
    UpgradeAdapterRef.prototype.dispose = function () {
        ((this.ng1Injector)).get($ROOT_SCOPE).$destroy(); /** @type {?} */
        ((this.ng2ModuleRef)).destroy();
    };
    return UpgradeAdapterRef;
}());
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of the upgrade/dynamic package, allowing
 * Angular 1 and Angular 2+ to run side by side in the same application.
 */
// This file only re-exports content of the `src` folder. Keep it that way.
/**
 * Generated bundle index. Do not edit.
 */
export { VERSION, UpgradeAdapter, UpgradeAdapterRef };
//# sourceMappingURL=upgrade.es5.js.map
