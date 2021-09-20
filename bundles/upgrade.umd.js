/**
 * @license Angular v13.0.0-next.6+46.sha-6ba6bdf.with-local-changes
 * (c) 2010-2021 Google LLC. https://angular.io/
 * License: MIT
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/platform-browser-dynamic')) :
    typeof define === 'function' && define.amd ? define('@angular/upgrade', ['exports', '@angular/core', '@angular/platform-browser-dynamic'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.upgrade = {}), global.ng.core, global.ng.platformBrowserDynamic));
}(this, (function (exports, i0, platformBrowserDynamic) { 'use strict';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @publicApi
     */
    var VERSION = new i0.Version('13.0.0-next.6+46.sha-6ba6bdf.with-local-changes');

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar)
                        ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function noNg() {
        throw new Error('AngularJS v1.x is not loaded!');
    }
    var noNgElement = (function () { return noNg(); });
    noNgElement.cleanData = noNg;
    var angular = {
        bootstrap: noNg,
        module: noNg,
        element: noNgElement,
        injector: noNg,
        version: undefined,
        resumeBootstrap: noNg,
        getTestability: noNg
    };
    try {
        if (window.hasOwnProperty('angular')) {
            angular = window.angular;
        }
    }
    catch (_a) {
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
    var bootstrap = function (e, modules, config) { return angular.bootstrap(e, modules, config); };
    // Do not declare as `module` to avoid webpack bug
    // (see https://github.com/angular/angular/issues/30050).
    var module_ = function (prefix, dependencies) { return angular.module(prefix, dependencies); };
    var element = (function (e) { return angular.element(e); });
    element.cleanData = function (nodes) { return angular.element.cleanData(nodes); };
    var injector = function (modules, strictDi) { return angular.injector(modules, strictDi); };
    var resumeBootstrap = function () { return angular.resumeBootstrap(); };
    var getTestability = function (e) { return angular.getTestability(e); };

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var $COMPILE = '$compile';
    var $CONTROLLER = '$controller';
    var $DELEGATE = '$delegate';
    var $EXCEPTION_HANDLER = '$exceptionHandler';
    var $HTTP_BACKEND = '$httpBackend';
    var $INJECTOR = '$injector';
    var $INTERVAL = '$interval';
    var $PARSE = '$parse';
    var $PROVIDE = '$provide';
    var $ROOT_ELEMENT = '$rootElement';
    var $ROOT_SCOPE = '$rootScope';
    var $SCOPE = '$scope';
    var $TEMPLATE_CACHE = '$templateCache';
    var $TEMPLATE_REQUEST = '$templateRequest';
    var $$TESTABILITY = '$$testability';
    var COMPILER_KEY = '$$angularCompiler';
    var DOWNGRADED_MODULE_COUNT_KEY = '$$angularDowngradedModuleCount';
    var GROUP_PROJECTABLE_NODES_KEY = '$$angularGroupProjectableNodes';
    var INJECTOR_KEY = '$$angularInjector';
    var LAZY_MODULE_REF = '$$angularLazyModuleRef';
    var NG_ZONE_KEY = '$$angularNgZone';
    var UPGRADE_APP_TYPE_KEY = '$$angularUpgradeAppType';
    var REQUIRE_INJECTOR = '?^^' + INJECTOR_KEY;
    var REQUIRE_NG_MODEL = '?ngModel';
    var UPGRADE_MODULE_NAME = '$$UpgradeModule';

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
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
    var PropertyBinding = /** @class */ (function () {
        function PropertyBinding(prop, attr) {
            this.prop = prop;
            this.attr = attr;
            this.parseBinding();
        }
        PropertyBinding.prototype.parseBinding = function () {
            this.bracketAttr = "[" + this.attr + "]";
            this.parenAttr = "(" + this.attr + ")";
            this.bracketParenAttr = "[(" + this.attr + ")]";
            var capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.substr(1);
            this.onAttr = "on" + capitalAttr;
            this.bindAttr = "bind" + capitalAttr;
            this.bindonAttr = "bindon" + capitalAttr;
        };
        return PropertyBinding;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var DIRECTIVE_PREFIX_REGEXP = /^(?:x|data)[:\-_]/i;
    var DIRECTIVE_SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;
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
        var $rootElement = $injector.get($ROOT_ELEMENT);
        var $rootScope = $injector.get($ROOT_SCOPE);
        $rootScope.$destroy();
        cleanData($rootElement[0]);
    }
    function directiveNormalize(name) {
        return name.replace(DIRECTIVE_PREFIX_REGEXP, '')
            .replace(DIRECTIVE_SPECIAL_CHARS_REGEXP, function (_, letter) { return letter.toUpperCase(); });
    }
    function getTypeName(type) {
        // Return the name of the type or the first line of its stringified version.
        return type.overriddenName || type.name || type.toString().split('\n')[0];
    }
    function getDowngradedModuleCount($injector) {
        return $injector.has(DOWNGRADED_MODULE_COUNT_KEY) ? $injector.get(DOWNGRADED_MODULE_COUNT_KEY) :
            0;
    }
    function getUpgradeAppType($injector) {
        return $injector.has(UPGRADE_APP_TYPE_KEY) ? $injector.get(UPGRADE_APP_TYPE_KEY) :
            0 /* None */;
    }
    function isFunction(value) {
        return typeof value === 'function';
    }
    function isParentNode(node) {
        return isFunction(node.querySelectorAll);
    }
    function validateInjectionKey($injector, downgradedModule, injectionKey, attemptedAction) {
        var upgradeAppType = getUpgradeAppType($injector);
        var downgradedModuleCount = getDowngradedModuleCount($injector);
        // Check for common errors.
        switch (upgradeAppType) {
            case 1 /* Dynamic */:
            case 2 /* Static */:
                if (downgradedModule) {
                    throw new Error("Error while " + attemptedAction + ": 'downgradedModule' unexpectedly specified.\n" +
                        'You should not specify a value for \'downgradedModule\', unless you are downgrading ' +
                        'more than one Angular module (via \'downgradeModule()\').');
                }
                break;
            case 3 /* Lite */:
                if (!downgradedModule && (downgradedModuleCount >= 2)) {
                    throw new Error("Error while " + attemptedAction + ": 'downgradedModule' not specified.\n" +
                        'This application contains more than one downgraded Angular module, thus you need to ' +
                        'always specify \'downgradedModule\' when downgrading components and injectables.');
                }
                if (!$injector.has(injectionKey)) {
                    throw new Error("Error while " + attemptedAction + ": Unable to find the specified downgraded module.\n" +
                        'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                        'application?');
                }
                break;
            default:
                throw new Error("Error while " + attemptedAction + ": Not a valid '@angular/upgrade' application.\n" +
                    'Did you forget to downgrade an Angular module or include it in the AngularJS ' +
                    'application?');
        }
    }
    var Deferred = /** @class */ (function () {
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
     * @return Whether the passed-in component implements the subset of the
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
     */
    function hookupNgModel(ngModel, component) {
        if (ngModel && supportsNgModel(component)) {
            ngModel.$render = function () {
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

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var INITIAL_VALUE = {
        __UNINITIALIZED__: true
    };
    var DowngradeComponentAdapter = /** @class */ (function () {
        function DowngradeComponentAdapter(element, attrs, scope, ngModel, parentInjector, $compile, $parse, componentFactory, wrapCallback) {
            this.element = element;
            this.attrs = attrs;
            this.scope = scope;
            this.ngModel = ngModel;
            this.parentInjector = parentInjector;
            this.$compile = $compile;
            this.$parse = $parse;
            this.componentFactory = componentFactory;
            this.wrapCallback = wrapCallback;
            this.implementsOnChanges = false;
            this.inputChangeCount = 0;
            this.inputChanges = {};
            this.componentScope = scope.$new();
        }
        DowngradeComponentAdapter.prototype.compileContents = function () {
            var _this = this;
            var compiledProjectableNodes = [];
            var projectableNodes = this.groupProjectableNodes();
            var linkFns = projectableNodes.map(function (nodes) { return _this.$compile(nodes); });
            this.element.empty();
            linkFns.forEach(function (linkFn) {
                linkFn(_this.scope, function (clone) {
                    compiledProjectableNodes.push(clone);
                    _this.element.append(clone);
                });
            });
            return compiledProjectableNodes;
        };
        DowngradeComponentAdapter.prototype.createComponent = function (projectableNodes) {
            var providers = [{ provide: $SCOPE, useValue: this.componentScope }];
            var childInjector = i0.Injector.create({ providers: providers, parent: this.parentInjector, name: 'DowngradeComponentAdapter' });
            this.componentRef =
                this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
            this.viewChangeDetector = this.componentRef.injector.get(i0.ChangeDetectorRef);
            this.changeDetector = this.componentRef.changeDetectorRef;
            this.component = this.componentRef.instance;
            // testability hook is commonly added during component bootstrap in
            // packages/core/src/application_ref.bootstrap()
            // in downgraded application, component creation will take place here as well as adding the
            // testability hook.
            var testability = this.componentRef.injector.get(i0.Testability, null);
            if (testability) {
                this.componentRef.injector.get(i0.TestabilityRegistry)
                    .registerApplication(this.componentRef.location.nativeElement, testability);
            }
            hookupNgModel(this.ngModel, this.component);
        };
        DowngradeComponentAdapter.prototype.setupInputs = function (manuallyAttachView, propagateDigest) {
            var _this = this;
            if (propagateDigest === void 0) { propagateDigest = true; }
            var attrs = this.attrs;
            var inputs = this.componentFactory.inputs || [];
            var _loop_1 = function (i) {
                var input = new PropertyBinding(inputs[i].propName, inputs[i].templateName);
                var expr = null;
                if (attrs.hasOwnProperty(input.attr)) {
                    var observeFn_1 = (function (prop) {
                        var prevValue = INITIAL_VALUE;
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
                    // Use `$watch()` (in addition to `$observe()`) in order to initialize the input in time
                    // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
                    // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
                    var unwatch_1 = this_1.componentScope.$watch(function () {
                        unwatch_1();
                        unwatch_1 = null;
                        observeFn_1(attrs[input.attr]);
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
                    var watchFn = (function (prop) { return function (currValue, prevValue) { return _this.updateInput(prop, prevValue, currValue); }; })(input.prop);
                    this_1.componentScope.$watch(expr, watchFn);
                }
            };
            var this_1 = this;
            for (var i = 0; i < inputs.length; i++) {
                _loop_1(i);
            }
            // Invoke `ngOnChanges()` and Change Detection (when necessary)
            var detectChanges = function () { return _this.changeDetector.detectChanges(); };
            var prototype = this.componentFactory.componentType.prototype;
            this.implementsOnChanges = !!(prototype && prototype.ngOnChanges);
            this.componentScope.$watch(function () { return _this.inputChangeCount; }, this.wrapCallback(function () {
                // Invoke `ngOnChanges()`
                if (_this.implementsOnChanges) {
                    var inputChanges = _this.inputChanges;
                    _this.inputChanges = {};
                    _this.component.ngOnChanges(inputChanges);
                }
                _this.viewChangeDetector.markForCheck();
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
                var unwatch_2 = this.componentScope.$watch(function () {
                    unwatch_2();
                    unwatch_2 = null;
                    var appRef = _this.parentInjector.get(i0.ApplicationRef);
                    appRef.attachView(_this.componentRef.hostView);
                });
            }
        };
        DowngradeComponentAdapter.prototype.setupOutputs = function () {
            var attrs = this.attrs;
            var outputs = this.componentFactory.outputs || [];
            for (var j = 0; j < outputs.length; j++) {
                var output = new PropertyBinding(outputs[j].propName, outputs[j].templateName);
                var bindonAttr = output.bindonAttr.substring(0, output.bindonAttr.length - 6);
                var bracketParenAttr = "[(" + output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8) + ")]";
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
        };
        DowngradeComponentAdapter.prototype.subscribeToOutput = function (output, expr, isAssignment) {
            var _this = this;
            if (isAssignment === void 0) { isAssignment = false; }
            var getter = this.$parse(expr);
            var setter = getter.assign;
            if (isAssignment && !setter) {
                throw new Error("Expression '" + expr + "' is not assignable!");
            }
            var emitter = this.component[output.prop];
            if (emitter) {
                emitter.subscribe({
                    next: isAssignment ? function (v) { return setter(_this.scope, v); } :
                        function (v) { return getter(_this.scope, { '$event': v }); }
                });
            }
            else {
                throw new Error("Missing emitter '" + output.prop + "' on component '" + getTypeName(this.componentFactory.componentType) + "'!");
            }
        };
        DowngradeComponentAdapter.prototype.registerCleanup = function () {
            var _this = this;
            var testabilityRegistry = this.componentRef.injector.get(i0.TestabilityRegistry);
            var destroyComponentRef = this.wrapCallback(function () { return _this.componentRef.destroy(); });
            var destroyed = false;
            this.element.on('$destroy', function () {
                // The `$destroy` event may have been triggered by the `cleanData()` call in the
                // `componentScope` `$destroy` handler below. In that case, we don't want to call
                // `componentScope.$destroy()` again.
                if (!destroyed)
                    _this.componentScope.$destroy();
            });
            this.componentScope.$on('$destroy', function () {
                if (!destroyed) {
                    destroyed = true;
                    testabilityRegistry.unregisterApplication(_this.componentRef.location.nativeElement);
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
                    cleanData(_this.element[0]);
                    destroyComponentRef();
                }
            });
        };
        DowngradeComponentAdapter.prototype.getInjector = function () {
            return this.componentRef.injector;
        };
        DowngradeComponentAdapter.prototype.updateInput = function (prop, prevValue, currValue) {
            if (this.implementsOnChanges) {
                this.inputChanges[prop] = new i0.SimpleChange(prevValue, currValue, prevValue === currValue);
            }
            this.inputChangeCount++;
            this.component[prop] = currValue;
        };
        DowngradeComponentAdapter.prototype.groupProjectableNodes = function () {
            var ngContentSelectors = this.componentFactory.ngContentSelectors;
            return groupNodesBySelector(ngContentSelectors, this.element.contents());
        };
        return DowngradeComponentAdapter;
    }());
    /**
     * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
     */
    function groupNodesBySelector(ngContentSelectors, nodes) {
        var projectableNodes = [];
        for (var i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
            projectableNodes[i] = [];
        }
        for (var j = 0, jj = nodes.length; j < jj; ++j) {
            var node = nodes[j];
            var ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
            if (ngContentIndex != null) {
                projectableNodes[ngContentIndex].push(node);
            }
        }
        return projectableNodes;
    }
    function findMatchingNgContentIndex(element, ngContentSelectors) {
        var ngContentIndices = [];
        var wildcardNgContentIndex = -1;
        for (var i = 0; i < ngContentSelectors.length; i++) {
            var selector = ngContentSelectors[i];
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
    function matchesSelector(el, selector) {
        if (!_matches) {
            var elProto = Element.prototype;
            _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
                elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
        }
        return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
    }

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function isThenable(obj) {
        return !!obj && isFunction(obj.then);
    }
    /**
     * Synchronous, promise-like object.
     */
    var SyncPromise = /** @class */ (function () {
        function SyncPromise() {
            this.resolved = false;
            this.callbacks = [];
        }
        SyncPromise.all = function (valuesOrPromises) {
            var aggrPromise = new SyncPromise();
            var resolvedCount = 0;
            var results = [];
            var resolve = function (idx, value) {
                results[idx] = value;
                if (++resolvedCount === valuesOrPromises.length)
                    aggrPromise.resolve(results);
            };
            valuesOrPromises.forEach(function (p, idx) {
                if (isThenable(p)) {
                    p.then(function (v) { return resolve(idx, v); });
                }
                else {
                    resolve(idx, p);
                }
            });
            return aggrPromise;
        };
        SyncPromise.prototype.resolve = function (value) {
            // Do nothing, if already resolved.
            if (this.resolved)
                return;
            this.value = value;
            this.resolved = true;
            // Run the queued callbacks.
            this.callbacks.forEach(function (callback) { return callback(value); });
            this.callbacks.length = 0;
        };
        SyncPromise.prototype.then = function (callback) {
            if (this.resolved) {
                callback(this.value);
            }
            else {
                this.callbacks.push(callback);
            }
        };
        return SyncPromise;
    }());

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
     * visit the [Upgrade guide](guide/upgrade#using-angular-components-from-angularjs-code).
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
     * - `propagateDigest?: boolean`: Whether to perform {@link ChangeDetectorRef#detectChanges
     *   change detection} on the component on every
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
        var directiveFactory = function ($compile, $injector, $parse) {
            // When using `downgradeModule()`, we need to handle certain things specially. For example:
            // - We always need to attach the component view to the `ApplicationRef` for it to be
            //   dirty-checked.
            // - We need to ensure callbacks to Angular APIs (e.g. change detection) are run inside the
            //   Angular zone.
            //   NOTE: This is not needed, when using `UpgradeModule`, because `$digest()` will be run
            //         inside the Angular zone (except if explicitly escaped, in which case we shouldn't
            //         force it back in).
            var isNgUpgradeLite = getUpgradeAppType($injector) === 3 /* Lite */;
            var wrapCallback = !isNgUpgradeLite ? function (cb) { return cb; } : function (cb) { return function () { return i0.NgZone.isInAngularZone() ? cb() : ngZone.run(cb); }; };
            var ngZone;
            // When downgrading multiple modules, special handling is needed wrt injectors.
            var hasMultipleDowngradedModules = isNgUpgradeLite && (getDowngradedModuleCount($injector) > 1);
            return {
                restrict: 'E',
                terminal: true,
                require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
                link: function (scope, element, attrs, required) {
                    // We might have to compile the contents asynchronously, because this might have been
                    // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                    // been compiled.
                    var ngModel = required[1];
                    var parentInjector = required[0];
                    var moduleInjector = undefined;
                    var ranAsync = false;
                    if (!parentInjector || hasMultipleDowngradedModules) {
                        var downgradedModule = info.downgradedModule || '';
                        var lazyModuleRefKey = "" + LAZY_MODULE_REF + downgradedModule;
                        var attemptedAction = "instantiating component '" + getTypeName(info.component) + "'";
                        validateInjectionKey($injector, downgradedModule, lazyModuleRefKey, attemptedAction);
                        var lazyModuleRef = $injector.get(lazyModuleRefKey);
                        moduleInjector = lazyModuleRef.injector || lazyModuleRef.promise;
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
                    var finalParentInjector = parentInjector || moduleInjector;
                    // If this is a "top-level" Angular component or the parent component may belong to a
                    // different `NgModule`, use the module injector for module-specific dependencies.
                    // If there is a parent component that belongs to the same `NgModule`, use its injector.
                    var finalModuleInjector = moduleInjector || parentInjector;
                    var doDowngrade = function (injector, moduleInjector) {
                        // Retrieve `ComponentFactoryResolver` from the injector tied to the `NgModule` this
                        // component belongs to.
                        var componentFactoryResolver = moduleInjector.get(i0.ComponentFactoryResolver);
                        var componentFactory = componentFactoryResolver.resolveComponentFactory(info.component);
                        if (!componentFactory) {
                            throw new Error("Expecting ComponentFactory for: " + getTypeName(info.component));
                        }
                        var injectorPromise = new ParentInjectorPromise(element);
                        var facade = new DowngradeComponentAdapter(element, attrs, scope, ngModel, injector, $compile, $parse, componentFactory, wrapCallback);
                        var projectableNodes = facade.compileContents();
                        facade.createComponent(projectableNodes);
                        facade.setupInputs(isNgUpgradeLite, info.propagateDigest);
                        facade.setupOutputs();
                        facade.registerCleanup();
                        injectorPromise.resolve(facade.getInjector());
                        if (ranAsync) {
                            // If this is run async, it is possible that it is not run inside a
                            // digest and initial input values will not be detected.
                            scope.$evalAsync(function () { });
                        }
                    };
                    var downgradeFn = !isNgUpgradeLite ? doDowngrade : function (pInjector, mInjector) {
                        if (!ngZone) {
                            ngZone = pInjector.get(i0.NgZone);
                        }
                        wrapCallback(function () { return doDowngrade(pInjector, mInjector); })();
                    };
                    // NOTE:
                    // Not using `ParentInjectorPromise.all()` (which is inherited from `SyncPromise`), because
                    // Closure Compiler (or some related tool) complains:
                    // `TypeError: ...$src$downgrade_component_ParentInjectorPromise.all is not a function`
                    SyncPromise.all([finalParentInjector, finalModuleInjector])
                        .then(function (_a) {
                        var _b = __read(_a, 2), pInjector = _b[0], mInjector = _b[1];
                        return downgradeFn(pInjector, mInjector);
                    });
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
     * to preserve the synchronous nature of AngularJS's `$compile`.
     */
    var ParentInjectorPromise = /** @class */ (function (_super) {
        __extends(ParentInjectorPromise, _super);
        function ParentInjectorPromise(element) {
            var _this = _super.call(this) || this;
            _this.element = element;
            _this.injectorKey = controllerKey(INJECTOR_KEY);
            // Store the promise on the element.
            element.data(_this.injectorKey, _this);
            return _this;
        }
        ParentInjectorPromise.prototype.resolve = function (injector) {
            // Store the real injector on the element.
            this.element.data(this.injectorKey, injector);
            // Release the element to prevent memory leaks.
            this.element = null;
            // Resolve the promise.
            _super.prototype.resolve.call(this, injector);
        };
        return ParentInjectorPromise;
    }(SyncPromise));

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
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
    function downgradeInjectable(token, downgradedModule) {
        if (downgradedModule === void 0) { downgradedModule = ''; }
        var factory = function ($injector) {
            var injectorKey = "" + INJECTOR_KEY + downgradedModule;
            var injectableName = isFunction(token) ? getTypeName(token) : String(token);
            var attemptedAction = "instantiating injectable '" + injectableName + "'";
            validateInjectionKey($injector, downgradedModule, injectorKey, attemptedAction);
            try {
                var injector = $injector.get(injectorKey);
                return injector.get(token);
            }
            catch (err) {
                throw new Error("Error while " + attemptedAction + ": " + (err.message || err));
            }
        };
        factory['$inject'] = [$INJECTOR];
        return factory;
    }

    // Constants
    var REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
    // Classes
    var UpgradeHelper = /** @class */ (function () {
        function UpgradeHelper(injector, name, elementRef, directive) {
            this.name = name;
            this.$injector = injector.get($INJECTOR);
            this.$compile = this.$injector.get($COMPILE);
            this.$controller = this.$injector.get($CONTROLLER);
            this.element = elementRef.nativeElement;
            this.$element = element(this.element);
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
        UpgradeHelper.getTemplate = function ($injector, directive, fetchRemoteTemplate, $element) {
            if (fetchRemoteTemplate === void 0) { fetchRemoteTemplate = false; }
            if (directive.template !== undefined) {
                return getOrCall(directive.template, $element);
            }
            else if (directive.templateUrl) {
                var $templateCache_1 = $injector.get($TEMPLATE_CACHE);
                var url_1 = getOrCall(directive.templateUrl, $element);
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
                template =
                    UpgradeHelper.getTemplate(this.$injector, this.directive, false, this.$element);
            }
            return this.compileHtml(template);
        };
        UpgradeHelper.prototype.onDestroy = function ($scope, controllerInstance) {
            if (controllerInstance && isFunction(controllerInstance.$onDestroy)) {
                controllerInstance.$onDestroy();
            }
            $scope.$destroy();
            cleanData(this.element);
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
                var name = require.substring(match[0].length);
                var isOptional = !!match[2];
                var searchParents = !!inheritType;
                var startOnParent = inheritType === '^^';
                var ctrlKey = controllerKey(name);
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
    function getOrCall(property) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return isFunction(property) ? property.apply(void 0, __spreadArray([], __read(args))) : property;
    }
    // NOTE: Only works for `typeof T !== 'object'`.
    function isMap(value) {
        return value && !Array.isArray(value) && typeof value === 'object';
    }
    function notSupported(name, feature) {
        throw new Error("Upgraded directive '" + name + "' contains unsupported feature: '" + feature + "'.");
    }

    var CAMEL_CASE = /([A-Z])/g;
    var INITIAL_VALUE$1 = {
        __UNINITIALIZED__: true
    };
    var NOT_SUPPORTED = 'NOT_SUPPORTED';
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
            var selector = name.replace(CAMEL_CASE, function (all, next) { return '-' + next.toLowerCase(); });
            var self = this;
            // Note: There is a bug in TS 2.4 that prevents us from
            // inlining this into @Directive
            // TODO(tbosch): find or file a bug against TypeScript for this.
            var directive = { selector: selector, inputs: this.inputsRename, outputs: this.outputsRename };
            var MyClass = /** @class */ (function (_super) {
                __extends(MyClass, _super);
                function MyClass(scope, injector, elementRef) {
                    return _super.call(this, new UpgradeHelper(injector, name, elementRef, self.directive || undefined), scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap) || this;
                }
                return MyClass;
            }(UpgradeNg1ComponentAdapter));
            MyClass = __decorate([
                i0.Directive(Object.assign({ jit: true }, directive)),
                __param(0, i0.Inject($SCOPE)),
                __metadata("design:paramtypes", [Object, i0.Injector, i0.ElementRef])
            ], MyClass);
            this.type = MyClass;
        }
        UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = function () {
            var _this = this;
            var btcIsObject = typeof this.directive.bindToController === 'object';
            if (btcIsObject && Object.keys(this.directive.scope).length) {
                throw new Error("Binding definitions on scope and controller at the same time are not supported.");
            }
            var context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;
            if (typeof context == 'object') {
                Object.keys(context).forEach(function (propName) {
                    var definition = context[propName];
                    var bindingType = definition.charAt(0);
                    var bindingOptions = definition.charAt(1);
                    var attrName = definition.substring(bindingOptions === '?' ? 2 : 1) || propName;
                    // QUESTION: What about `=*`? Ignore? Throw? Support?
                    var inputName = "input_" + attrName;
                    var inputNameRename = inputName + ": " + attrName;
                    var outputName = "output_" + attrName;
                    var outputNameRename = outputName + ": " + attrName;
                    var outputNameRenameChange = outputNameRename + "Change";
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
                            var json = JSON.stringify(context);
                            throw new Error("Unexpected mapping '" + bindingType + "' in '" + json + "' in '" + _this.name + "' directive.");
                    }
                });
            }
        };
        /**
         * Upgrade ng1 components into Angular.
         */
        UpgradeNg1ComponentAdapterBuilder.resolve = function (exportedComponents, $injector) {
            var promises = Object.keys(exportedComponents).map(function (name) {
                var exportedComponent = exportedComponents[name];
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
            var controllerType = this.directive.controller;
            if (this.directive.bindToController && controllerType) {
                this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
                this.destinationObj = this.controllerInstance;
            }
            else {
                this.destinationObj = this.componentScope;
            }
            for (var i = 0; i < inputs.length; i++) {
                this[inputs[i]] = null;
            }
            for (var j = 0; j < outputs.length; j++) {
                var emitter = this[outputs[j]] = new i0.EventEmitter();
                if (this.propOuts.indexOf(outputs[j]) === -1) {
                    this.setComponentProperty(outputs[j], (function (emitter) { return function (value) { return emitter.emit(value); }; })(emitter));
                }
            }
            for (var k = 0; k < propOuts.length; k++) {
                this.checkLastValues.push(INITIAL_VALUE$1);
            }
        }
        UpgradeNg1ComponentAdapter.prototype.ngOnInit = function () {
            // Collect contents, insert and compile template
            var attachChildNodes = this.helper.prepareTransclusion();
            var linkFn = this.helper.compileTemplate(this.template);
            // Instantiate controller (if not already done so)
            var controllerType = this.directive.controller;
            var bindToController = this.directive.bindToController;
            if (controllerType && !bindToController) {
                this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
            }
            // Require other controllers
            var requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
            // Hook: $onInit
            if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
                this.controllerInstance.$onInit();
            }
            // Linking
            var link = this.directive.link;
            var preLink = typeof link == 'object' && link.pre;
            var postLink = typeof link == 'object' ? link.post : link;
            var attrs = NOT_SUPPORTED;
            var transcludeFn = NOT_SUPPORTED;
            if (preLink) {
                preLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
            }
            linkFn(this.componentScope, null, { parentBoundTranscludeFn: attachChildNodes });
            if (postLink) {
                postLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
            }
            // Hook: $postLink
            if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
                this.controllerInstance.$postLink();
            }
        };
        UpgradeNg1ComponentAdapter.prototype.ngOnChanges = function (changes) {
            var _this = this;
            var ng1Changes = {};
            Object.keys(changes).forEach(function (name) {
                var change = changes[name];
                _this.setComponentProperty(name, change.currentValue);
                ng1Changes[_this.propertyMap[name]] = change;
            });
            if (isFunction(this.destinationObj.$onChanges)) {
                this.destinationObj.$onChanges(ng1Changes);
            }
        };
        UpgradeNg1ComponentAdapter.prototype.ngDoCheck = function () {
            var _this = this;
            var destinationObj = this.destinationObj;
            var lastValues = this.checkLastValues;
            var checkProperties = this.checkProperties;
            var propOuts = this.propOuts;
            checkProperties.forEach(function (propName, i) {
                var value = destinationObj[propName];
                var last = lastValues[i];
                if (!strictEquals(last, value)) {
                    var eventEmitter = _this[propOuts[i]];
                    eventEmitter.emit(lastValues[i] = value);
                }
            });
            if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
                this.controllerInstance.$doCheck();
            }
        };
        UpgradeNg1ComponentAdapter.prototype.ngOnDestroy = function () {
            this.helper.onDestroy(this.componentScope, this.controllerInstance);
        };
        UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function (name, value) {
            this.destinationObj[this.propertyMap[name]] = value;
        };
        return UpgradeNg1ComponentAdapter;
    }());
    UpgradeNg1ComponentAdapter.ɵfac = function UpgradeNg1ComponentAdapter_Factory(t) { i0.ɵɵinvalidFactory(); };
    UpgradeNg1ComponentAdapter.ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: UpgradeNg1ComponentAdapter, features: [i0.ɵɵNgOnChangesFeature] });
    (function () {
        (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(UpgradeNg1ComponentAdapter, [{
                type: i0.Directive
            }], function () { return [{ type: UpgradeHelper }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }]; }, null);
    })();

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
     * @usageNotes
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
     * @Component({
     *   selector: 'ng2-comp',
     *   inputs: ['name'],
     *   template: 'ng2[<ng1-hello [title]="name">transclude</ng1-hello>](<ng-content></ng-content>)',
     *   directives:
     * })
     * class Ng2Component {
     * }
     *
     * @NgModule({
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
     * @publicApi
     */
    var UpgradeAdapter = /** @class */ (function () {
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
             * @internal
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
         * @usageNotes
         * ### Mental Model
         *
         * 1. The component is instantiated by being listed in AngularJS template. This means that the
         *    host element is controlled by AngularJS, but the component's view will be controlled by
         *    Angular.
         * 2. Even thought the component is instantiated in AngularJS, it will be using Angular
         *    syntax. This has to be done, this way because we must follow Angular components do not
         *    declare how the attributes should be interpreted.
         * 3. `ng-model` is controlled by AngularJS and communicates with the downgraded Angular component
         *    by way of the `ControlValueAccessor` interface from @angular/forms. Only components that
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
         * @Component({
         *   selector: 'greet',
         *   template: '{{salutation}} {{name}}! - <ng-content></ng-content>'
         * })
         * class Greeter {
         *   @Input() salutation: string;
         *   @Input() name: string;
         * }
         *
         * @NgModule({
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
         * @usageNotes
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
         * @Component({
         *   selector: 'ng2',
         *   template: 'ng2 template: <greet salutation="Hello" [name]="world">text</greet>'
         * })
         * class Ng2Component {
         * }
         *
         * @NgModule({
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
         */
        UpgradeAdapter.prototype.upgradeNg1Component = function (name) {
            if (this.ng1ComponentsToBeUpgraded.hasOwnProperty(name)) {
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
         * @usageNotes
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
         * @param modules any AngularJS modules that the upgrade module should depend upon
         * @returns an `UpgradeAdapterRef`, which lets you register a `ready()` callback to
         * run assertions once the Angular components are ready to test through AngularJS.
         */
        UpgradeAdapter.prototype.registerForNg1Tests = function (modules) {
            var _this = this;
            var windowNgMock = window['angular'].mock;
            if (!windowNgMock || !windowNgMock.module) {
                throw new Error('Failed to find \'angular.mock.module\'.');
            }
            this.declareNg1Module(modules);
            windowNgMock.module(this.ng1Module.name);
            var upgrade = new UpgradeAdapterRef();
            this.ng2BootstrapDeferred.promise.then(function (ng1Injector) {
                upgrade._bootstrapDone(_this.moduleRef, ng1Injector);
            }, onError);
            return upgrade;
        };
        /**
         * Bootstrap a hybrid AngularJS / Angular application.
         *
         * This `bootstrap` method is a direct replacement (takes same arguments) for AngularJS
         * [`bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method. Unlike
         * AngularJS, this bootstrap is asynchronous.
         *
         * @usageNotes
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
         * @Component({
         *   selector: 'ng2',
         *   inputs: ['name'],
         *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)'
         * })
         * class Ng2 {
         * }
         *
         * @NgModule({
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
         */
        UpgradeAdapter.prototype.bootstrap = function (element$1, modules, config) {
            var _this = this;
            this.declareNg1Module(modules);
            var upgrade = new UpgradeAdapterRef();
            // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
            var windowAngular = window /** TODO #???? */['angular'];
            windowAngular.resumeBootstrap = undefined;
            this.ngZone.run(function () {
                bootstrap(element$1, [_this.ng1Module.name], config);
            });
            var ng1BootstrapPromise = new Promise(function (resolve) {
                if (windowAngular.resumeBootstrap) {
                    var originalResumeBootstrap_1 = windowAngular.resumeBootstrap;
                    windowAngular.resumeBootstrap = function () {
                        windowAngular.resumeBootstrap = originalResumeBootstrap_1;
                        var r = windowAngular.resumeBootstrap.apply(this, arguments);
                        resolve();
                        return r;
                    };
                }
                else {
                    resolve();
                }
            });
            Promise.all([this.ng2BootstrapDeferred.promise, ng1BootstrapPromise]).then(function (_a) {
                var _b = __read(_a, 1), ng1Injector = _b[0];
                element(element$1).data(controllerKey(INJECTOR_KEY), _this.moduleRef.injector);
                _this.moduleRef.injector.get(i0.NgZone).run(function () {
                    upgrade._bootstrapDone(_this.moduleRef, ng1Injector);
                });
            }, onError);
            return upgrade;
        };
        /**
         * Allows AngularJS service to be accessible from Angular.
         *
         * @usageNotes
         * ### Example
         *
         * ```
         * class Login { ... }
         * class Server { ... }
         *
         * @Injectable()
         * class Example {
         *   constructor(@Inject('server') server, login: Login) {
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
         */
        UpgradeAdapter.prototype.upgradeNg1Provider = function (name, options) {
            var token = options && options.asToken || name;
            this.upgradedProviders.push({
                provide: token,
                useFactory: function ($injector) { return $injector.get(name); },
                deps: [$INJECTOR]
            });
        };
        /**
         * Allows Angular service to be accessible from AngularJS.
         *
         * @usageNotes
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
         */
        UpgradeAdapter.prototype.downgradeNg2Provider = function (token) {
            return downgradeInjectable(token);
        };
        /**
         * Declare the AngularJS upgrade module for this adapter without bootstrapping the whole
         * hybrid application.
         *
         * This method is automatically called by `bootstrap()` and `registerForNg1Tests()`.
         *
         * @param modules The AngularJS modules that this upgrade module should depend upon.
         * @returns The AngularJS upgrade module that is declared by this method
         *
         * @usageNotes
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
            var delayApplyExps = [];
            var original$applyFn;
            var rootScopePrototype;
            var upgradeAdapter = this;
            var ng1Module = this.ng1Module = module_(this.idPrefix, modules);
            var platformRef = platformBrowserDynamic.platformBrowserDynamic();
            this.ngZone = new i0.NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
            this.ng2BootstrapDeferred = new Deferred();
            ng1Module.constant(UPGRADE_APP_TYPE_KEY, 1 /* Dynamic */)
                .factory(INJECTOR_KEY, function () { return _this.moduleRef.injector.get(i0.Injector); })
                .factory(LAZY_MODULE_REF, [INJECTOR_KEY, function (injector) { return ({ injector: injector }); }])
                .constant(NG_ZONE_KEY, this.ngZone)
                .factory(COMPILER_KEY, function () { return _this.moduleRef.injector.get(i0.Compiler); })
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
                            return rootScopeDelegate;
                        }
                    ]);
                    if (ng1Injector.has($$TESTABILITY)) {
                        provide.decorator($$TESTABILITY, [
                            '$delegate',
                            function (testabilityDelegate) {
                                var originalWhenStable = testabilityDelegate.whenStable;
                                // Cannot use arrow function below because we need the context
                                var newWhenStable = function (callback) {
                                    originalWhenStable.call(this, function () {
                                        var ng2Testability = upgradeAdapter.moduleRef.injector.get(i0.Testability);
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
                        // Note: There is a bug in TS 2.4 that prevents us from
                        // inlining this into @NgModule
                        // TODO(tbosch): find or file a bug against TypeScript for this.
                        var ngModule = {
                            providers: [
                                { provide: $INJECTOR, useFactory: function () { return ng1Injector; } },
                                { provide: $COMPILE, useFactory: function () { return ng1Injector.get($COMPILE); } },
                                _this.upgradedProviders
                            ],
                            imports: [i0.resolveForwardRef(_this.ng2AppModule)],
                            entryComponents: _this.downgradedComponents
                        };
                        // At this point we have ng1 injector and we have prepared
                        // ng1 components to be upgraded, we now can bootstrap ng2.
                        var DynamicNgUpgradeModule = /** @class */ (function () {
                            function DynamicNgUpgradeModule() {
                            }
                            DynamicNgUpgradeModule.prototype.ngDoBootstrap = function () { };
                            return DynamicNgUpgradeModule;
                        }());
                        DynamicNgUpgradeModule = __decorate([
                            i0.NgModule(Object.assign({ jit: true }, ngModule)),
                            __metadata("design:paramtypes", [])
                        ], DynamicNgUpgradeModule);
                        platformRef
                            .bootstrapModule(DynamicNgUpgradeModule, [_this.compilerOptions, { ngZone: _this.ngZone }])
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
                            var subscription = _this.ngZone.onMicrotaskEmpty.subscribe({
                                next: function () {
                                    if (rootScope.$$phase) {
                                        if (i0.isDevMode()) {
                                            console.warn('A digest was triggered while one was already in progress. This may mean that something is triggering digests outside the Angular zone.');
                                        }
                                        return rootScope.$evalAsync(function () { });
                                    }
                                    return rootScope.$digest();
                                }
                            });
                            rootScope.$on('$destroy', function () {
                                subscription.unsubscribe();
                            });
                            // Destroy the AngularJS app once the Angular `PlatformRef` is destroyed.
                            // This does not happen in a typical SPA scenario, but it might be useful for
                            // other use-cases where disposing of an Angular/AngularJS app is necessary
                            // (such as Hot Module Replacement (HMR)).
                            // See https://github.com/angular/angular/issues/39935.
                            platformRef.onDestroy(function () { return destroyApp(ng1Injector); });
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
     * Synchronous promise-like object to wrap parent injectors,
     * to preserve the synchronous nature of AngularJS's $compile.
     */
    var ParentInjectorPromise$1 = /** @class */ (function () {
        function ParentInjectorPromise(element) {
            this.element = element;
            this.callbacks = [];
            // store the promise on the element
            element.data(controllerKey(INJECTOR_KEY), this);
        }
        ParentInjectorPromise.prototype.then = function (callback) {
            if (this.injector) {
                callback(this.injector);
            }
            else {
                this.callbacks.push(callback);
            }
        };
        ParentInjectorPromise.prototype.resolve = function (injector) {
            this.injector = injector;
            // reset the element data to point to the real injector
            this.element.data(controllerKey(INJECTOR_KEY), injector);
            // clean out the element to prevent memory leaks
            this.element = null;
            // run all the queued callbacks
            this.callbacks.forEach(function (callback) { return callback(injector); });
            this.callbacks.length = 0;
        };
        return ParentInjectorPromise;
    }());
    /**
     * Use `UpgradeAdapterRef` to control a hybrid AngularJS / Angular application.
     *
     * @deprecated Deprecated since v5. Use `upgrade/static` instead, which also supports
     * [Ahead-of-Time compilation](guide/aot-compiler).
     * @publicApi
     */
    var UpgradeAdapterRef = /** @class */ (function () {
        function UpgradeAdapterRef() {
            /* @internal */
            this._readyFn = null;
            this.ng1RootScope = null;
            this.ng1Injector = null;
            this.ng2ModuleRef = null;
            this.ng2Injector = null;
        }
        /* @internal */
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
         */
        UpgradeAdapterRef.prototype.ready = function (fn) {
            this._readyFn = fn;
        };
        /**
         * Dispose of running hybrid AngularJS / Angular application.
         */
        UpgradeAdapterRef.prototype.dispose = function () {
            this.ng1Injector.get($ROOT_SCOPE).$destroy();
            this.ng2ModuleRef.destroy();
        };
        return UpgradeAdapterRef;
    }());

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    // This file only re-exports content of the `src` folder. Keep it that way.

    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.UpgradeAdapter = UpgradeAdapter;
    exports.UpgradeAdapterRef = UpgradeAdapterRef;
    exports.VERSION = VERSION;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=upgrade.umd.js.map
