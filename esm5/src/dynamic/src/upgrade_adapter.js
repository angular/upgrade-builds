/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Compiler, Injector, NgModule, NgZone, Testability, isDevMode, resolveForwardRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as angular from '../../common/src/angular1';
import { $$TESTABILITY, $COMPILE, $INJECTOR, $ROOT_SCOPE, COMPILER_KEY, INJECTOR_KEY, LAZY_MODULE_REF, NG_ZONE_KEY, UPGRADE_APP_TYPE_KEY } from '../../common/src/constants';
import { downgradeComponent } from '../../common/src/downgrade_component';
import { downgradeInjectable } from '../../common/src/downgrade_injectable';
import { Deferred, controllerKey, onError } from '../../common/src/util';
import { UpgradeNg1ComponentAdapterBuilder } from './upgrade_ng1_adapter';
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
        this.ng2BootstrapDeferred.promise.then(function (ng1Injector) { upgrade._bootstrapDone(_this.moduleRef, ng1Injector); }, onError);
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
    UpgradeAdapter.prototype.bootstrap = function (element, modules, config) {
        var _this = this;
        this.declareNg1Module(modules);
        var upgrade = new UpgradeAdapterRef();
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        var windowAngular = window /** TODO #???? */['angular'];
        windowAngular.resumeBootstrap = undefined;
        this.ngZone.run(function () { angular.bootstrap(element, [_this.ng1Module.name], config); });
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
            var _b = tslib_1.__read(_a, 1), ng1Injector = _b[0];
            angular.element(element).data(controllerKey(INJECTOR_KEY), _this.moduleRef.injector);
            _this.moduleRef.injector.get(NgZone).run(function () { upgrade._bootstrapDone(_this.moduleRef, ng1Injector); });
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
    UpgradeAdapter.prototype.downgradeNg2Provider = function (token) { return downgradeInjectable(token); };
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
        var rootScope;
        var upgradeAdapter = this;
        var ng1Module = this.ng1Module = angular.module_(this.idPrefix, modules);
        var platformRef = platformBrowserDynamic();
        this.ngZone = new NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
        this.ng2BootstrapDeferred = new Deferred();
        ng1Module.constant(UPGRADE_APP_TYPE_KEY, 1 /* Dynamic */)
            .factory(INJECTOR_KEY, function () { return _this.moduleRef.injector.get(Injector); })
            .factory(LAZY_MODULE_REF, [INJECTOR_KEY, function (injector) { return ({ injector: injector }); }])
            .constant(NG_ZONE_KEY, this.ngZone)
            .factory(COMPILER_KEY, function () { return _this.moduleRef.injector.get(Compiler); })
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
                            var originalWhenStable = testabilityDelegate.whenStable;
                            // Cannot use arrow function below because we need the context
                            var newWhenStable = function (callback) {
                                originalWhenStable.call(this, function () {
                                    var ng2Testability = upgradeAdapter.moduleRef.injector.get(Testability);
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
                        imports: [resolveForwardRef(_this.ng2AppModule)],
                        entryComponents: _this.downgradedComponents
                    };
                    // At this point we have ng1 injector and we have prepared
                    // ng1 components to be upgraded, we now can bootstrap ng2.
                    var DynamicNgUpgradeModule = /** @class */ (function () {
                        function DynamicNgUpgradeModule() {
                        }
                        DynamicNgUpgradeModule.prototype.ngDoBootstrap = function () { };
                        DynamicNgUpgradeModule = tslib_1.__decorate([
                            NgModule(tslib_1.__assign({ jit: true }, ngModule)),
                            tslib_1.__metadata("design:paramtypes", [])
                        ], DynamicNgUpgradeModule);
                        return DynamicNgUpgradeModule;
                    }());
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
                                    if (isDevMode()) {
                                        console.warn('A digest was triggered while one was already in progress. This may mean that something is triggering digests outside the Angular zone.');
                                    }
                                    return rootScope.$evalAsync(function () { });
                                }
                                return rootScope.$digest();
                            }
                        });
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
export { UpgradeAdapter };
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of AngularJS's $compile.
 */
var ParentInjectorPromise = /** @class */ (function () {
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
    UpgradeAdapterRef.prototype.ready = function (fn) { this._readyFn = fn; };
    /**
     * Dispose of running hybrid AngularJS / Angular application.
     */
    UpgradeAdapterRef.prototype.dispose = function () {
        this.ng1Injector.get($ROOT_SCOPE).$destroy();
        this.ng2ModuleRef.destroy();
    };
    return UpgradeAdapterRef;
}());
export { UpgradeAdapterRef };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvZHluYW1pYy9zcmMvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFtQixRQUFRLEVBQUUsUUFBUSxFQUFlLE1BQU0sRUFBa0IsV0FBVyxFQUFRLFNBQVMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNsSyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUV6RSxPQUFPLEtBQUssT0FBTyxNQUFNLDJCQUEyQixDQUFDO0FBQ3JELE9BQU8sRUFBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDM0ssT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sc0NBQXNDLENBQUM7QUFDeEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sdUNBQXVDLENBQUM7QUFDMUUsT0FBTyxFQUFDLFFBQVEsRUFBaUMsYUFBYSxFQUFFLE9BQU8sRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRXRHLE9BQU8sRUFBQyxpQ0FBaUMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRXhFLElBQUksWUFBWSxHQUFXLENBQUMsQ0FBQztBQUU3Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUZHO0FBQ0g7SUFxQkUsd0JBQW9CLFlBQXVCLEVBQVUsZUFBaUM7UUFBbEUsaUJBQVksR0FBWixZQUFZLENBQVc7UUFBVSxvQkFB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QU0sQ0FBQztJQTJCeEMsQ0FBQztJQXpCQyxlQUFlO0lBQ1AsMENBQWMsR0FBdEIsVUFBdUIsV0FBNkIsRUFBRSxXQUFxQztRQUN6RixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksaUNBQUssR0FBWixVQUFhLEVBQWtELElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXhGOztPQUVHO0lBQ0ksbUNBQU8sR0FBZDtRQUNFLElBQUksQ0FBQyxXQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQy9DLElBQUksQ0FBQyxZQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDaEMsQ0FBQztJQUNILHdCQUFDO0FBQUQsQ0FBQyxBQWxDRCxJQWtDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlciwgQ29tcGlsZXJPcHRpb25zLCBJbmplY3RvciwgTmdNb2R1bGUsIE5nTW9kdWxlUmVmLCBOZ1pvbmUsIFN0YXRpY1Byb3ZpZGVyLCBUZXN0YWJpbGl0eSwgVHlwZSwgaXNEZXZNb2RlLCByZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge3BsYXRmb3JtQnJvd3NlckR5bmFtaWN9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXItZHluYW1pYyc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9hbmd1bGFyMSc7XG5pbXBvcnQgeyQkVEVTVEFCSUxJVFksICRDT01QSUxFLCAkSU5KRUNUT1IsICRST09UX1NDT1BFLCBDT01QSUxFUl9LRVksIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBOR19aT05FX0tFWSwgVVBHUkFERV9BUFBfVFlQRV9LRVl9IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7ZG93bmdyYWRlQ29tcG9uZW50fSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2Rvd25ncmFkZV9jb21wb25lbnQnO1xuaW1wb3J0IHtkb3duZ3JhZGVJbmplY3RhYmxlfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2Rvd25ncmFkZV9pbmplY3RhYmxlJztcbmltcG9ydCB7RGVmZXJyZWQsIExhenlNb2R1bGVSZWYsIFVwZ3JhZGVBcHBUeXBlLCBjb250cm9sbGVyS2V5LCBvbkVycm9yfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL3V0aWwnO1xuXG5pbXBvcnQge1VwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0gZnJvbSAnLi91cGdyYWRlX25nMV9hZGFwdGVyJztcblxubGV0IHVwZ3JhZGVDb3VudDogbnVtYmVyID0gMDtcblxuLyoqXG4gKiBVc2UgYFVwZ3JhZGVBZGFwdGVyYCB0byBhbGxvdyBBbmd1bGFySlMgYW5kIEFuZ3VsYXIgdG8gY29leGlzdCBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBUaGUgYFVwZ3JhZGVBZGFwdGVyYCBhbGxvd3M6XG4gKiAxLiBjcmVhdGlvbiBvZiBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyBjb21wb25lbnQgZGlyZWN0aXZlXG4gKiAgICAoU2VlIFtVcGdyYWRlQWRhcHRlciN1cGdyYWRlTmcxQ29tcG9uZW50KCldKVxuICogMi4gY3JlYXRpb24gb2YgQW5ndWxhckpTIGRpcmVjdGl2ZSBmcm9tIEFuZ3VsYXIgY29tcG9uZW50LlxuICogICAgKFNlZSBbVXBncmFkZUFkYXB0ZXIjZG93bmdyYWRlTmcyQ29tcG9uZW50KCldKVxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgQW5ndWxhckpTIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA0LiBBbmd1bGFyIGNvbXBvbmVudHMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIEFuZ3VsYXIgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDUuIEFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FuIGJlIHVwZ3JhZGVkIHRvIGFuIEFuZ3VsYXIgY29tcG9uZW50LiBUaGlzIGNyZWF0ZXMgYW5cbiAqICAgIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZSBpbiB0aGF0IGxvY2F0aW9uLlxuICogNi4gQW4gQW5ndWxhciBjb21wb25lbnQgY2FuIGJlIGRvd25ncmFkZWQgdG8gYW4gQW5ndWxhckpTIGNvbXBvbmVudCBkaXJlY3RpdmUuIFRoaXMgY3JlYXRlc1xuICogICAgYW4gQW5ndWxhckpTIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhciBjb21wb25lbnQgaW4gdGhhdCBsb2NhdGlvbi5cbiAqIDcuIFdoZW5ldmVyIGFuIGFkYXB0ZXIgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IHRoZSBmcmFtZXdvcmtcbiAqICAgIGRvaW5nIHRoZSBpbnN0YW50aWF0aW9uLiBUaGUgb3RoZXIgZnJhbWV3b3JrIHRoZW4gaW5zdGFudGlhdGVzIGFuZCBvd25zIHRoZSB2aWV3IGZvciB0aGF0XG4gKiAgICBjb21wb25lbnQuIFRoaXMgaW1wbGllcyB0aGF0IGNvbXBvbmVudCBiaW5kaW5ncyB3aWxsIGFsd2F5cyBmb2xsb3cgdGhlIHNlbWFudGljcyBvZiB0aGVcbiAqICAgIGluc3RhbnRpYXRpb24gZnJhbWV3b3JrLiBUaGUgc3ludGF4IGlzIGFsd2F5cyB0aGF0IG9mIEFuZ3VsYXIgc3ludGF4LlxuICogOC4gQW5ndWxhckpTIGlzIGFsd2F5cyBib290c3RyYXBwZWQgZmlyc3QgYW5kIG93bnMgdGhlIGJvdHRvbSBtb3N0IHZpZXcuXG4gKiA5LiBUaGUgbmV3IGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gQW5ndWxhciB6b25lLCBhbmQgdGhlcmVmb3JlIGl0IG5vIGxvbmdlciBuZWVkcyBjYWxscyB0b1xuICogICAgYCRhcHBseSgpYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihmb3J3YXJkUmVmKCgpID0+IE15TmcyTW9kdWxlKSwgbXlDb21waWxlck9wdGlvbnMpO1xuICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMkNvbXAnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzJDb21wb25lbnQpKTtcbiAqXG4gKiBtb2R1bGUuZGlyZWN0aXZlKCduZzFIZWxsbycsIGZ1bmN0aW9uKCkge1xuICogICByZXR1cm4ge1xuICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gKiAgIH07XG4gKiB9KTtcbiAqXG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbmcyLWNvbXAnLFxuICogICBpbnB1dHM6IFsnbmFtZSddLFxuICogICB0ZW1wbGF0ZTogJ25nMls8bmcxLWhlbGxvIFt0aXRsZV09XCJuYW1lXCI+dHJhbnNjbHVkZTwvbmcxLWhlbGxvPl0oPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PiknLFxuICogICBkaXJlY3RpdmVzOlxuICogfSlcbiAqIGNsYXNzIE5nMkNvbXBvbmVudCB7XG4gKiB9XG4gKlxuICogQE5nTW9kdWxlKHtcbiAqICAgZGVjbGFyYXRpb25zOiBbTmcyQ29tcG9uZW50LCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMUhlbGxvJyldLFxuICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAqIH0pXG4gKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICpcbiAqXG4gKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyLWNvbXAgbmFtZT1cIldvcmxkXCI+cHJvamVjdDwvbmcyLWNvbXA+JztcbiAqXG4gKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gKiAgICAgICBcIm5nMltuZzFbSGVsbG8gV29ybGQhXSh0cmFuc2NsdWRlKV0ocHJvamVjdClcIik7XG4gKiB9KTtcbiAqXG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBEZXByZWNhdGVkIHNpbmNlIHY1LiBVc2UgYHVwZ3JhZGUvc3RhdGljYCBpbnN0ZWFkLCB3aGljaCBhbHNvIHN1cHBvcnRzXG4gKiBbQWhlYWQtb2YtVGltZSBjb21waWxhdGlvbl0oZ3VpZGUvYW90LWNvbXBpbGVyKS5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpZFByZWZpeDogc3RyaW5nID0gYE5HMl9VUEdSQURFXyR7dXBncmFkZUNvdW50Kyt9X2A7XG4gIHByaXZhdGUgZG93bmdyYWRlZENvbXBvbmVudHM6IFR5cGU8YW55PltdID0gW107XG4gIC8qKlxuICAgKiBBbiBpbnRlcm5hbCBtYXAgb2YgbmcxIGNvbXBvbmVudHMgd2hpY2ggbmVlZCB0byB1cCB1cGdyYWRlZCB0byBuZzIuXG4gICAqXG4gICAqIFdlIGNhbid0IHVwZ3JhZGUgdW50aWwgaW5qZWN0b3IgaXMgaW5zdGFudGlhdGVkIGFuZCB3ZSBjYW4gcmV0cmlldmUgdGhlIGNvbXBvbmVudCBtZXRhZGF0YS5cbiAgICogRm9yIHRoaXMgcmVhc29uIHdlIGtlZXAgYSBsaXN0IG9mIGNvbXBvbmVudHMgdG8gdXBncmFkZSB1bnRpbCBuZzEgaW5qZWN0b3IgaXMgYm9vdHN0cmFwcGVkLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHByaXZhdGUgbmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZDoge1tuYW1lOiBzdHJpbmddOiBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9ID0ge307XG4gIHByaXZhdGUgdXBncmFkZWRQcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbXTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgbmdab25lICE6IE5nWm9uZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgbmcxTW9kdWxlICE6IGFuZ3VsYXIuSU1vZHVsZTtcbiAgcHJpdmF0ZSBtb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT58bnVsbCA9IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIG5nMkJvb3RzdHJhcERlZmVycmVkICE6IERlZmVycmVkPGFuZ3VsYXIuSUluamVjdG9yU2VydmljZT47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuZzJBcHBNb2R1bGU6IFR5cGU8YW55PiwgcHJpdmF0ZSBjb21waWxlck9wdGlvbnM/OiBDb21waWxlck9wdGlvbnMpIHtcbiAgICBpZiAoIW5nMkFwcE1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdVcGdyYWRlQWRhcHRlciBjYW5ub3QgYmUgaW5zdGFudGlhdGVkIHdpdGhvdXQgYW4gTmdNb2R1bGUgb2YgdGhlIEFuZ3VsYXIgYXBwLicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciBDb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXJKUy5cbiAgICpcbiAgICogVXNlIGBkb3duZ3JhZGVOZzJDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFySlMgRGlyZWN0aXZlIERlZmluaXRpb24gRmFjdG9yeSBmcm9tXG4gICAqIEFuZ3VsYXIgQ29tcG9uZW50LiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIHdpdGhpbiB0aGVcbiAgICogQW5ndWxhckpTIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgTWVudGFsIE1vZGVsXG4gICAqXG4gICAqIDEuIFRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGJ5IGJlaW5nIGxpc3RlZCBpbiBBbmd1bGFySlMgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhckpTLCBidXQgdGhlIGNvbXBvbmVudCdzIHZpZXcgd2lsbCBiZSBjb250cm9sbGVkIGJ5XG4gICAqICAgIEFuZ3VsYXIuXG4gICAqIDIuIEV2ZW4gdGhvdWdodCB0aGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBpbiBBbmd1bGFySlMsIGl0IHdpbGwgYmUgdXNpbmcgQW5ndWxhclxuICAgKiAgICBzeW50YXguIFRoaXMgaGFzIHRvIGJlIGRvbmUsIHRoaXMgd2F5IGJlY2F1c2Ugd2UgbXVzdCBmb2xsb3cgQW5ndWxhciBjb21wb25lbnRzIGRvIG5vdFxuICAgKiAgICBkZWNsYXJlIGhvdyB0aGUgYXR0cmlidXRlcyBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXG4gICAqIDMuIGBuZy1tb2RlbGAgaXMgY29udHJvbGxlZCBieSBBbmd1bGFySlMgYW5kIGNvbW11bmljYXRlcyB3aXRoIHRoZSBkb3duZ3JhZGVkIEFuZ3VsYXIgY29tcG9uZW50XG4gICAqICAgIGJ5IHdheSBvZiB0aGUgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UgZnJvbSBAYW5ndWxhci9mb3Jtcy4gT25seSBjb21wb25lbnRzIHRoYXRcbiAgICogICAgaW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlIGFyZSBlbGlnaWJsZS5cbiAgICpcbiAgICogIyMjIFN1cHBvcnRlZCBGZWF0dXJlc1xuICAgKlxuICAgKiAtIEJpbmRpbmdzOlxuICAgKiAgIC0gQXR0cmlidXRlOiBgPGNvbXAgbmFtZT1cIldvcmxkXCI+YFxuICAgKiAgIC0gSW50ZXJwb2xhdGlvbjogIGA8Y29tcCBncmVldGluZz1cIkhlbGxvIHt7bmFtZX19IVwiPmBcbiAgICogICAtIEV4cHJlc3Npb246ICBgPGNvbXAgW25hbWVdPVwidXNlcm5hbWVcIj5gXG4gICAqICAgLSBFdmVudDogIGA8Y29tcCAoY2xvc2UpPVwiZG9Tb21ldGhpbmcoKVwiPmBcbiAgICogICAtIG5nLW1vZGVsOiBgPGNvbXAgbmctbW9kZWw9XCJuYW1lXCI+YFxuICAgKiAtIENvbnRlbnQgcHJvamVjdGlvbjogeWVzXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChHcmVldGVyKSk7XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICAgKiAgIHRlbXBsYXRlOiAne3tzYWx1dGF0aW9ufX0ge3tuYW1lfX0hIC0gPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PidcbiAgICogfSlcbiAgICogY2xhc3MgR3JlZXRlciB7XG4gICAqICAgQElucHV0KCkgc2FsdXRhdGlvbjogc3RyaW5nO1xuICAgKiAgIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW0dyZWV0ZXJdLFxuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9XG4gICAqICAgJ25nMSB0ZW1wbGF0ZTogPGdyZWV0IHNhbHV0YXRpb249XCJIZWxsb1wiIFtuYW1lXT1cIndvcmxkXCI+dGV4dDwvZ3JlZXQ+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXCJuZzEgdGVtcGxhdGU6IEhlbGxvIHdvcmxkISAtIHRleHRcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGRvd25ncmFkZU5nMkNvbXBvbmVudChjb21wb25lbnQ6IFR5cGU8YW55Pik6IEZ1bmN0aW9uIHtcbiAgICB0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcblxuICAgIHJldHVybiBkb3duZ3JhZGVDb21wb25lbnQoe2NvbXBvbmVudH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgQ29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFyLlxuICAgKlxuICAgKiBVc2UgYHVwZ3JhZGVOZzFDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyBDb21wb25lbnRcbiAgICogZGlyZWN0aXZlLiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFySlMgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZSBBbmd1bGFyXG4gICAqIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgTWVudGFsIE1vZGVsXG4gICAqXG4gICAqIDEuIFRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGJ5IGJlaW5nIGxpc3RlZCBpbiBBbmd1bGFyIHRlbXBsYXRlLiBUaGlzIG1lYW5zIHRoYXQgdGhlXG4gICAqICAgIGhvc3QgZWxlbWVudCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXIsIGJ1dCB0aGUgY29tcG9uZW50J3MgdmlldyB3aWxsIGJlIGNvbnRyb2xsZWQgYnlcbiAgICogICAgQW5ndWxhckpTLlxuICAgKlxuICAgKiAjIyMgU3VwcG9ydGVkIEZlYXR1cmVzXG4gICAqXG4gICAqIC0gQmluZGluZ3M6XG4gICAqICAgLSBBdHRyaWJ1dGU6IGA8Y29tcCBuYW1lPVwiV29ybGRcIj5gXG4gICAqICAgLSBJbnRlcnBvbGF0aW9uOiAgYDxjb21wIGdyZWV0aW5nPVwiSGVsbG8ge3tuYW1lfX0hXCI+YFxuICAgKiAgIC0gRXhwcmVzc2lvbjogIGA8Y29tcCBbbmFtZV09XCJ1c2VybmFtZVwiPmBcbiAgICogICAtIEV2ZW50OiAgYDxjb21wIChjbG9zZSk9XCJkb1NvbWV0aGluZygpXCI+YFxuICAgKiAtIFRyYW5zY2x1c2lvbjogeWVzXG4gICAqIC0gT25seSBzb21lIG9mIHRoZSBmZWF0dXJlcyBvZlxuICAgKiAgIFtEaXJlY3RpdmUgRGVmaW5pdGlvbiBPYmplY3RdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9zZXJ2aWNlLyRjb21waWxlKSBhcmVcbiAgICogICBzdXBwb3J0ZWQ6XG4gICAqICAgLSBgY29tcGlsZWA6IG5vdCBzdXBwb3J0ZWQgYmVjYXVzZSB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IEFuZ3VsYXIsIHdoaWNoIGRvZXNcbiAgICogICAgIG5vdCBhbGxvdyBtb2RpZnlpbmcgRE9NIHN0cnVjdHVyZSBkdXJpbmcgY29tcGlsYXRpb24uXG4gICAqICAgLSBgY29udHJvbGxlcmA6IHN1cHBvcnRlZC4gKE5PVEU6IGluamVjdGlvbiBvZiBgJGF0dHJzYCBhbmQgYCR0cmFuc2NsdWRlYCBpcyBub3Qgc3VwcG9ydGVkLilcbiAgICogICAtIGBjb250cm9sbGVyQXNgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgYmluZFRvQ29udHJvbGxlcmA6IHN1cHBvcnRlZC5cbiAgICogICAtIGBsaW5rYDogc3VwcG9ydGVkLiAoTk9URTogb25seSBwcmUtbGluayBmdW5jdGlvbiBpcyBzdXBwb3J0ZWQuKVxuICAgKiAgIC0gYG5hbWVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcHJpb3JpdHlgOiBpZ25vcmVkLlxuICAgKiAgIC0gYHJlcGxhY2VgOiBub3Qgc3VwcG9ydGVkLlxuICAgKiAgIC0gYHJlcXVpcmVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcmVzdHJpY3RgOiBtdXN0IGJlIHNldCB0byAnRScuXG4gICAqICAgLSBgc2NvcGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVVcmxgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVybWluYWxgOiBpZ25vcmVkLlxuICAgKiAgIC0gYHRyYW5zY2x1ZGVgOiBzdXBwb3J0ZWQuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBmdW5jdGlvbigpIHtcbiAgICogICByZXR1cm4ge1xuICAgKiAgICAgc2NvcGU6IHtzYWx1dGF0aW9uOiAnPScsIG5hbWU6ICc9JyB9LFxuICAgKiAgICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4nXG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMkNvbXBvbmVudCkpO1xuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ25nMicsXG4gICAqICAgdGVtcGxhdGU6ICduZzIgdGVtcGxhdGU6IDxncmVldCBzYWx1dGF0aW9uPVwiSGVsbG9cIiBbbmFtZV09XCJ3b3JsZFwiPnRleHQ8L2dyZWV0PidcbiAgICogfSlcbiAgICogY2xhc3MgTmcyQ29tcG9uZW50IHtcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW05nMkNvbXBvbmVudCwgYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCdncmVldCcpXSxcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMj48L25nMj4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMiB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXBncmFkZU5nMUNvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBUeXBlPGFueT4ge1xuICAgIGlmICgoPGFueT50aGlzLm5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWQpLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdLnR5cGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAodGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdID0gbmV3IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcihuYW1lKSlcbiAgICAgICAgICAudHlwZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBhZGFwdGVyJ3MgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIGZvciB1bml0IHRlc3RpbmcgaW4gQW5ndWxhckpTLlxuICAgKiBVc2UgdGhpcyBpbnN0ZWFkIG9mIGBhbmd1bGFyLm1vY2subW9kdWxlKClgIHRvIGxvYWQgdGhlIHVwZ3JhZGUgbW9kdWxlIGludG9cbiAgICogdGhlIEFuZ3VsYXJKUyB0ZXN0aW5nIGluamVjdG9yLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgdXBncmFkZUFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKlxuICAgKiAvLyBjb25maWd1cmUgdGhlIGFkYXB0ZXIgd2l0aCB1cGdyYWRlL2Rvd25ncmFkZSBjb21wb25lbnRzIGFuZCBzZXJ2aWNlc1xuICAgKiB1cGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTXlDb21wb25lbnQpO1xuICAgKlxuICAgKiBsZXQgdXBncmFkZUFkYXB0ZXJSZWY6IFVwZ3JhZGVBZGFwdGVyUmVmO1xuICAgKiBsZXQgJGNvbXBpbGUsICRyb290U2NvcGU7XG4gICAqXG4gICAqIC8vIFdlIG11c3QgcmVnaXN0ZXIgdGhlIGFkYXB0ZXIgYmVmb3JlIGFueSBjYWxscyB0byBgaW5qZWN0KClgXG4gICAqIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgKiAgIHVwZ3JhZGVBZGFwdGVyUmVmID0gdXBncmFkZUFkYXB0ZXIucmVnaXN0ZXJGb3JOZzFUZXN0cyhbJ2hlcm9BcHAnXSk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBiZWZvcmVFYWNoKGluamVjdCgoXyRjb21waWxlXywgXyRyb290U2NvcGVfKSA9PiB7XG4gICAqICAgJGNvbXBpbGUgPSBfJGNvbXBpbGVfO1xuICAgKiAgICRyb290U2NvcGUgPSBfJHJvb3RTY29wZV87XG4gICAqIH0pKTtcbiAgICpcbiAgICogaXQoXCJzYXlzIGhlbGxvXCIsIChkb25lKSA9PiB7XG4gICAqICAgdXBncmFkZUFkYXB0ZXJSZWYucmVhZHkoKCkgPT4ge1xuICAgKiAgICAgY29uc3QgZWxlbWVudCA9ICRjb21waWxlKFwiPG15LWNvbXBvbmVudD48L215LWNvbXBvbmVudD5cIikoJHJvb3RTY29wZSk7XG4gICAqICAgICAkcm9vdFNjb3BlLiRhcHBseSgpO1xuICAgKiAgICAgZXhwZWN0KGVsZW1lbnQuaHRtbCgpKS50b0NvbnRhaW4oXCJIZWxsbyBXb3JsZFwiKTtcbiAgICogICAgIGRvbmUoKTtcbiAgICogICB9KVxuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVzIGFueSBBbmd1bGFySlMgbW9kdWxlcyB0aGF0IHRoZSB1cGdyYWRlIG1vZHVsZSBzaG91bGQgZGVwZW5kIHVwb25cbiAgICogQHJldHVybnMgYW4gYFVwZ3JhZGVBZGFwdGVyUmVmYCwgd2hpY2ggbGV0cyB5b3UgcmVnaXN0ZXIgYSBgcmVhZHkoKWAgY2FsbGJhY2sgdG9cbiAgICogcnVuIGFzc2VydGlvbnMgb25jZSB0aGUgQW5ndWxhciBjb21wb25lbnRzIGFyZSByZWFkeSB0byB0ZXN0IHRocm91Z2ggQW5ndWxhckpTLlxuICAgKi9cbiAgcmVnaXN0ZXJGb3JOZzFUZXN0cyhtb2R1bGVzPzogc3RyaW5nW10pOiBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgY29uc3Qgd2luZG93TmdNb2NrID0gKHdpbmRvdyBhcyBhbnkpWydhbmd1bGFyJ10ubW9jaztcbiAgICBpZiAoIXdpbmRvd05nTW9jayB8fCAhd2luZG93TmdNb2NrLm1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmluZCBcXCdhbmd1bGFyLm1vY2subW9kdWxlXFwnLicpO1xuICAgIH1cbiAgICB0aGlzLmRlY2xhcmVOZzFNb2R1bGUobW9kdWxlcyk7XG4gICAgd2luZG93TmdNb2NrLm1vZHVsZSh0aGlzLm5nMU1vZHVsZS5uYW1lKTtcbiAgICBjb25zdCB1cGdyYWRlID0gbmV3IFVwZ3JhZGVBZGFwdGVyUmVmKCk7XG4gICAgdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZC5wcm9taXNlLnRoZW4oXG4gICAgICAgIChuZzFJbmplY3RvcikgPT4geyAoPGFueT51cGdyYWRlKS5fYm9vdHN0cmFwRG9uZSh0aGlzLm1vZHVsZVJlZiwgbmcxSW5qZWN0b3IpOyB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYSBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBgYm9vdHN0cmFwYCBtZXRob2QgaXMgYSBkaXJlY3QgcmVwbGFjZW1lbnQgKHRha2VzIHNhbWUgYXJndW1lbnRzKSBmb3IgQW5ndWxhckpTXG4gICAqIFtgYm9vdHN0cmFwYF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL2Z1bmN0aW9uL2FuZ3VsYXIuYm9vdHN0cmFwKSBtZXRob2QuIFVubGlrZVxuICAgKiBBbmd1bGFySlMsIHRoaXMgYm9vdHN0cmFwIGlzIGFzeW5jaHJvbm91cy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzIpKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcxJywgZnVuY3Rpb24oKSB7XG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gICAqICAgICAgdGVtcGxhdGU6ICduZzFbSGVsbG8ge3t0aXRsZX19IV0oPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+KSdcbiAgICogICB9O1xuICAgKiB9KTtcbiAgICpcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICduZzInLFxuICAgKiAgIGlucHV0czogWyduYW1lJ10sXG4gICAqICAgdGVtcGxhdGU6ICduZzJbPG5nMSBbdGl0bGVdPVwibmFtZVwiPnRyYW5zY2x1ZGU8L25nMT5dKDxuZy1jb250ZW50PjwvbmctY29udGVudD4pJ1xuICAgKiB9KVxuICAgKiBjbGFzcyBOZzIge1xuICAgKiB9XG4gICAqXG4gICAqIEBOZ01vZHVsZSh7XG4gICAqICAgZGVjbGFyYXRpb25zOiBbTmcyLCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMScpXSxcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMiBuYW1lPVwiV29ybGRcIj5wcm9qZWN0PC9uZzI+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gICAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgYm9vdHN0cmFwKGVsZW1lbnQ6IEVsZW1lbnQsIG1vZHVsZXM/OiBhbnlbXSwgY29uZmlnPzogYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyk6XG4gICAgICBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgdGhpcy5kZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXMpO1xuXG4gICAgY29uc3QgdXBncmFkZSA9IG5ldyBVcGdyYWRlQWRhcHRlclJlZigpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHJlc3VtZUJvb3RzdHJhcCgpIG9ubHkgZXhpc3RzIGlmIHRoZSBjdXJyZW50IGJvb3RzdHJhcCBpcyBkZWZlcnJlZFxuICAgIGNvbnN0IHdpbmRvd0FuZ3VsYXIgPSAod2luZG93IGFzIGFueSAvKiogVE9ETyAjPz8/PyAqLylbJ2FuZ3VsYXInXTtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7IGFuZ3VsYXIuYm9vdHN0cmFwKGVsZW1lbnQsIFt0aGlzLm5nMU1vZHVsZS5uYW1lXSwgY29uZmlnICEpOyB9KTtcbiAgICBjb25zdCBuZzFCb290c3RyYXBQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCkge1xuICAgICAgICBjb25zdCBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gb3JpZ2luYWxSZXN1bWVCb290c3RyYXA7XG4gICAgICAgICAgY29uc3QgciA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgUHJvbWlzZS5hbGwoW3RoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucHJvbWlzZSwgbmcxQm9vdHN0cmFwUHJvbWlzZV0pLnRoZW4oKFtuZzFJbmplY3Rvcl0pID0+IHtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5kYXRhICEoY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpLCB0aGlzLm1vZHVsZVJlZiAhLmluamVjdG9yKTtcbiAgICAgIHRoaXMubW9kdWxlUmVmICEuaW5qZWN0b3IuZ2V0PE5nWm9uZT4oTmdab25lKS5ydW4oXG4gICAgICAgICAgKCkgPT4geyAoPGFueT51cGdyYWRlKS5fYm9vdHN0cmFwRG9uZSh0aGlzLm1vZHVsZVJlZiwgbmcxSW5qZWN0b3IpOyB9KTtcbiAgICB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhckpTIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXIuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBMb2dpbiB7IC4uLiB9XG4gICAqIGNsYXNzIFNlcnZlciB7IC4uLiB9XG4gICAqXG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRXhhbXBsZSB7XG4gICAqICAgY29uc3RydWN0b3IoQEluamVjdCgnc2VydmVyJykgc2VydmVyLCBsb2dpbjogTG9naW4pIHtcbiAgICogICAgIC4uLlxuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuc2VydmljZSgnc2VydmVyJywgU2VydmVyKTtcbiAgICogbW9kdWxlLnNlcnZpY2UoJ2xvZ2luJywgTG9naW4pO1xuICAgKlxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogYWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIoJ3NlcnZlcicpO1xuICAgKiBhZGFwdGVyLnVwZ3JhZGVOZzFQcm92aWRlcignbG9naW4nLCB7YXNUb2tlbjogTG9naW59KTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIGNvbnN0IGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcySW5qZWN0b3IuZ2V0KEV4YW1wbGUpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICB1cGdyYWRlTmcxUHJvdmlkZXIobmFtZTogc3RyaW5nLCBvcHRpb25zPzoge2FzVG9rZW46IGFueX0pIHtcbiAgICBjb25zdCB0b2tlbiA9IG9wdGlvbnMgJiYgb3B0aW9ucy5hc1Rva2VuIHx8IG5hbWU7XG4gICAgdGhpcy51cGdyYWRlZFByb3ZpZGVycy5wdXNoKHtcbiAgICAgIHByb3ZpZGU6IHRva2VuLFxuICAgICAgdXNlRmFjdG9yeTogKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiAkaW5qZWN0b3IuZ2V0KG5hbWUpLFxuICAgICAgZGVwczogWyRJTkpFQ1RPUl1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFySlMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogfVxuICAgKlxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICpcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmZhY3RvcnkoJ2V4YW1wbGUnLCBhZGFwdGVyLmRvd25ncmFkZU5nMlByb3ZpZGVyKEV4YW1wbGUpKTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIGNvbnN0IGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcxSW5qZWN0b3IuZ2V0KCdleGFtcGxlJyk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIGRvd25ncmFkZU5nMlByb3ZpZGVyKHRva2VuOiBhbnkpOiBGdW5jdGlvbiB7IHJldHVybiBkb3duZ3JhZGVJbmplY3RhYmxlKHRva2VuKTsgfVxuXG4gIC8qKlxuICAgKiBEZWNsYXJlIHRoZSBBbmd1bGFySlMgdXBncmFkZSBtb2R1bGUgZm9yIHRoaXMgYWRhcHRlciB3aXRob3V0IGJvb3RzdHJhcHBpbmcgdGhlIHdob2xlXG4gICAqIGh5YnJpZCBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgYXV0b21hdGljYWxseSBjYWxsZWQgYnkgYGJvb3RzdHJhcCgpYCBhbmQgYHJlZ2lzdGVyRm9yTmcxVGVzdHMoKWAuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVzIFRoZSBBbmd1bGFySlMgbW9kdWxlcyB0aGF0IHRoaXMgdXBncmFkZSBtb2R1bGUgc2hvdWxkIGRlcGVuZCB1cG9uLlxuICAgKiBAcmV0dXJucyBUaGUgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIHRoYXQgaXMgZGVjbGFyZWQgYnkgdGhpcyBtZXRob2RcbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IHVwZ3JhZGVBZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogdXBncmFkZUFkYXB0ZXIuZGVjbGFyZU5nMU1vZHVsZShbJ2hlcm9BcHAnXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcHJpdmF0ZSBkZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXM6IHN0cmluZ1tdID0gW10pOiBhbmd1bGFyLklNb2R1bGUge1xuICAgIGNvbnN0IGRlbGF5QXBwbHlFeHBzOiBGdW5jdGlvbltdID0gW107XG4gICAgbGV0IG9yaWdpbmFsJGFwcGx5Rm46IEZ1bmN0aW9uO1xuICAgIGxldCByb290U2NvcGVQcm90b3R5cGU6IGFueTtcbiAgICBsZXQgcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlO1xuICAgIGNvbnN0IHVwZ3JhZGVBZGFwdGVyID0gdGhpcztcbiAgICBjb25zdCBuZzFNb2R1bGUgPSB0aGlzLm5nMU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlXyh0aGlzLmlkUHJlZml4LCBtb2R1bGVzKTtcbiAgICBjb25zdCBwbGF0Zm9ybVJlZiA9IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKTtcblxuICAgIHRoaXMubmdab25lID0gbmV3IE5nWm9uZSh7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IFpvbmUuaGFzT3duUHJvcGVydHkoJ2xvbmdTdGFja1RyYWNlWm9uZVNwZWMnKX0pO1xuICAgIHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcbiAgICBuZzFNb2R1bGUuY29uc3RhbnQoVVBHUkFERV9BUFBfVFlQRV9LRVksIFVwZ3JhZGVBcHBUeXBlLkR5bmFtaWMpXG4gICAgICAgIC5mYWN0b3J5KElOSkVDVE9SX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYgIS5pbmplY3Rvci5nZXQoSW5qZWN0b3IpKVxuICAgICAgICAuZmFjdG9yeShcbiAgICAgICAgICAgIExBWllfTU9EVUxFX1JFRixcbiAgICAgICAgICAgIFtJTkpFQ1RPUl9LRVksIChpbmplY3RvcjogSW5qZWN0b3IpID0+ICh7IGluamVjdG9yIH0gYXMgTGF6eU1vZHVsZVJlZildKVxuICAgICAgICAuY29uc3RhbnQoTkdfWk9ORV9LRVksIHRoaXMubmdab25lKVxuICAgICAgICAuZmFjdG9yeShDT01QSUxFUl9LRVksICgpID0+IHRoaXMubW9kdWxlUmVmICEuaW5qZWN0b3IuZ2V0KENvbXBpbGVyKSlcbiAgICAgICAgLmNvbmZpZyhbXG4gICAgICAgICAgJyRwcm92aWRlJywgJyRpbmplY3RvcicsXG4gICAgICAgICAgKHByb3ZpZGU6IGFuZ3VsYXIuSVByb3ZpZGVTZXJ2aWNlLCBuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcigkUk9PVF9TQ09QRSwgW1xuICAgICAgICAgICAgICAnJGRlbGVnYXRlJyxcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocm9vdFNjb3BlRGVsZWdhdGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAvLyBDYXB0dXJlIHRoZSByb290IGFwcGx5IHNvIHRoYXQgd2UgY2FuIGRlbGF5IGZpcnN0IGNhbGwgdG8gJGFwcGx5IHVudGlsIHdlXG4gICAgICAgICAgICAgICAgLy8gYm9vdHN0cmFwIEFuZ3VsYXIgYW5kIHRoZW4gd2UgcmVwbGF5IGFuZCByZXN0b3JlIHRoZSAkYXBwbHkuXG4gICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlID0gcm9vdFNjb3BlRGVsZWdhdGUuY29uc3RydWN0b3IucHJvdG90eXBlO1xuICAgICAgICAgICAgICAgIGlmIChyb290U2NvcGVQcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJyRhcHBseScpKSB7XG4gICAgICAgICAgICAgICAgICBvcmlnaW5hbCRhcHBseUZuID0gcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseTtcbiAgICAgICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZS4kYXBwbHkgPSAoZXhwOiBhbnkpID0+IGRlbGF5QXBwbHlFeHBzLnB1c2goZXhwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmluZCBcXCckYXBwbHlcXCcgb24gXFwnJHJvb3RTY29wZVxcJyEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvb3RTY29wZSA9IHJvb3RTY29wZURlbGVnYXRlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGlmIChuZzFJbmplY3Rvci5oYXMoJCRURVNUQUJJTElUWSkpIHtcbiAgICAgICAgICAgICAgcHJvdmlkZS5kZWNvcmF0b3IoJCRURVNUQUJJTElUWSwgW1xuICAgICAgICAgICAgICAgICckZGVsZWdhdGUnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHRlc3RhYmlsaXR5RGVsZWdhdGU6IGFuZ3VsYXIuSVRlc3RhYmlsaXR5U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgIC8vIENhbm5vdCB1c2UgYXJyb3cgZnVuY3Rpb24gYmVsb3cgYmVjYXVzZSB3ZSBuZWVkIHRoZSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdXaGVuU3RhYmxlID0gZnVuY3Rpb24oY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsV2hlblN0YWJsZS5jYWxsKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5nMlRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVBZGFwdGVyLm1vZHVsZVJlZiAhLmluamVjdG9yLmdldChUZXN0YWJpbGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKG5nMlRlc3RhYmlsaXR5LmlzU3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nMlRlc3RhYmlsaXR5LndoZW5TdGFibGUobmV3V2hlblN0YWJsZS5iaW5kKHRoaXMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgIHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZSA9IG5ld1doZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdGFiaWxpdHlEZWxlZ2F0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG5cbiAgICBuZzFNb2R1bGUucnVuKFtcbiAgICAgICckaW5qZWN0b3InLCAnJHJvb3RTY29wZScsXG4gICAgICAobmcxSW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSwgcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlKSA9PiB7XG4gICAgICAgIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlci5yZXNvbHZlKHRoaXMubmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZCwgbmcxSW5qZWN0b3IpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIE5vdGU6IFRoZXJlIGlzIGEgYnVnIGluIFRTIDIuNCB0aGF0IHByZXZlbnRzIHVzIGZyb21cbiAgICAgICAgICAgICAgLy8gaW5saW5pbmcgdGhpcyBpbnRvIEBOZ01vZHVsZVxuICAgICAgICAgICAgICAvLyBUT0RPKHRib3NjaCk6IGZpbmQgb3IgZmlsZSBhIGJ1ZyBhZ2FpbnN0IFR5cGVTY3JpcHQgZm9yIHRoaXMuXG4gICAgICAgICAgICAgIGNvbnN0IG5nTW9kdWxlID0ge1xuICAgICAgICAgICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgICAgICAgICAge3Byb3ZpZGU6ICRJTkpFQ1RPUiwgdXNlRmFjdG9yeTogKCkgPT4gbmcxSW5qZWN0b3J9LFxuICAgICAgICAgICAgICAgICAge3Byb3ZpZGU6ICRDT01QSUxFLCB1c2VGYWN0b3J5OiAoKSA9PiBuZzFJbmplY3Rvci5nZXQoJENPTVBJTEUpfSxcbiAgICAgICAgICAgICAgICAgIHRoaXMudXBncmFkZWRQcm92aWRlcnNcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGltcG9ydHM6IFtyZXNvbHZlRm9yd2FyZFJlZih0aGlzLm5nMkFwcE1vZHVsZSldLFxuICAgICAgICAgICAgICAgIGVudHJ5Q29tcG9uZW50czogdGhpcy5kb3duZ3JhZGVkQ29tcG9uZW50c1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50IHdlIGhhdmUgbmcxIGluamVjdG9yIGFuZCB3ZSBoYXZlIHByZXBhcmVkXG4gICAgICAgICAgICAgIC8vIG5nMSBjb21wb25lbnRzIHRvIGJlIHVwZ3JhZGVkLCB3ZSBub3cgY2FuIGJvb3RzdHJhcCBuZzIuXG4gICAgICAgICAgICAgIEBOZ01vZHVsZSh7aml0OiB0cnVlLCAuLi5uZ01vZHVsZX0pXG4gICAgICAgICAgICAgIGNsYXNzIER5bmFtaWNOZ1VwZ3JhZGVNb2R1bGUge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yKCkge31cbiAgICAgICAgICAgICAgICBuZ0RvQm9vdHN0cmFwKCkge31cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwbGF0Zm9ybVJlZlxuICAgICAgICAgICAgICAgICAgLmJvb3RzdHJhcE1vZHVsZShcbiAgICAgICAgICAgICAgICAgICAgICBEeW5hbWljTmdVcGdyYWRlTW9kdWxlLCBbdGhpcy5jb21waWxlck9wdGlvbnMgISwge25nWm9uZTogdGhpcy5uZ1pvbmV9XSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKChyZWY6IE5nTW9kdWxlUmVmPGFueT4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVSZWYgPSByZWY7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IG9yaWdpbmFsJGFwcGx5Rm47ICAvLyByZXN0b3JlIG9yaWdpbmFsICRhcHBseVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGRlbGF5QXBwbHlFeHBzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByb290U2NvcGUuJGFwcGx5KGRlbGF5QXBwbHlFeHBzLnNoaWZ0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucmVzb2x2ZShuZzFJbmplY3RvciksIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJzY3JpcHRpb24gPSB0aGlzLm5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgICAgICAgICAgbmV4dDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZS4kJHBoYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0EgZGlnZXN0IHdhcyB0cmlnZ2VyZWQgd2hpbGUgb25lIHdhcyBhbHJlYWR5IGluIHByb2dyZXNzLiBUaGlzIG1heSBtZWFuIHRoYXQgc29tZXRoaW5nIGlzIHRyaWdnZXJpbmcgZGlnZXN0cyBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmUuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByb290U2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHsgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7IH0pO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlKSA9PiB0aGlzLm5nMkJvb3RzdHJhcERlZmVycmVkLnJlamVjdChlKSk7XG4gICAgICB9XG4gICAgXSk7XG5cbiAgICByZXR1cm4gbmcxTW9kdWxlO1xuICB9XG59XG5cbi8qKlxuICogU3luY2hyb25vdXMgcHJvbWlzZS1saWtlIG9iamVjdCB0byB3cmFwIHBhcmVudCBpbmplY3RvcnMsXG4gKiB0byBwcmVzZXJ2ZSB0aGUgc3luY2hyb25vdXMgbmF0dXJlIG9mIEFuZ3VsYXJKUydzICRjb21waWxlLlxuICovXG5jbGFzcyBQYXJlbnRJbmplY3RvclByb21pc2Uge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBpbmplY3RvciAhOiBJbmplY3RvcjtcbiAgcHJpdmF0ZSBjYWxsYmFja3M6ICgoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgIC8vIHN0b3JlIHRoZSBwcm9taXNlIG9uIHRoZSBlbGVtZW50XG4gICAgZWxlbWVudC5kYXRhICEoY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpLCB0aGlzKTtcbiAgfVxuXG4gIHRoZW4oY2FsbGJhY2s6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSkge1xuICAgIGlmICh0aGlzLmluamVjdG9yKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLmluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZShpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG5cbiAgICAvLyByZXNldCB0aGUgZWxlbWVudCBkYXRhIHRvIHBvaW50IHRvIHRoZSByZWFsIGluamVjdG9yXG4gICAgdGhpcy5lbGVtZW50LmRhdGEgIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIGluamVjdG9yKTtcblxuICAgIC8vIGNsZWFuIG91dCB0aGUgZWxlbWVudCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuICAgIHRoaXMuZWxlbWVudCA9IG51bGwgITtcblxuICAgIC8vIHJ1biBhbGwgdGhlIHF1ZXVlZCBjYWxsYmFja3NcbiAgICB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4gY2FsbGJhY2soaW5qZWN0b3IpKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG59XG5cblxuLyoqXG4gKiBVc2UgYFVwZ3JhZGVBZGFwdGVyUmVmYCB0byBjb250cm9sIGEgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXIgYXBwbGljYXRpb24uXG4gKlxuICogQGRlcHJlY2F0ZWQgRGVwcmVjYXRlZCBzaW5jZSB2NS4gVXNlIGB1cGdyYWRlL3N0YXRpY2AgaW5zdGVhZCwgd2hpY2ggYWxzbyBzdXBwb3J0c1xuICogW0FoZWFkLW9mLVRpbWUgY29tcGlsYXRpb25dKGd1aWRlL2FvdC1jb21waWxlcikuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlQWRhcHRlclJlZiB7XG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yZWFkeUZuOiAoKHVwZ3JhZGVBZGFwdGVyUmVmPzogVXBncmFkZUFkYXB0ZXJSZWYpID0+IHZvaWQpfG51bGwgPSBudWxsO1xuXG4gIHB1YmxpYyBuZzFSb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UgPSBudWxsICE7XG4gIHB1YmxpYyBuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlID0gbnVsbCAhO1xuICBwdWJsaWMgbmcyTW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+ID0gbnVsbCAhO1xuICBwdWJsaWMgbmcySW5qZWN0b3I6IEluamVjdG9yID0gbnVsbCAhO1xuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9ib290c3RyYXBEb25lKG5nTW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+LCBuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSB7XG4gICAgdGhpcy5uZzJNb2R1bGVSZWYgPSBuZ01vZHVsZVJlZjtcbiAgICB0aGlzLm5nMkluamVjdG9yID0gbmdNb2R1bGVSZWYuaW5qZWN0b3I7XG4gICAgdGhpcy5uZzFJbmplY3RvciA9IG5nMUluamVjdG9yO1xuICAgIHRoaXMubmcxUm9vdFNjb3BlID0gbmcxSW5qZWN0b3IuZ2V0KCRST09UX1NDT1BFKTtcbiAgICB0aGlzLl9yZWFkeUZuICYmIHRoaXMuX3JlYWR5Rm4odGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGljaCBpcyBub3RpZmllZCB1cG9uIHN1Y2Nlc3NmdWwgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXJcbiAgICogYXBwbGljYXRpb24gaGFzIGJlZW4gYm9vdHN0cmFwcGVkLlxuICAgKlxuICAgKiBUaGUgYHJlYWR5YCBjYWxsYmFjayBmdW5jdGlvbiBpcyBpbnZva2VkIGluc2lkZSB0aGUgQW5ndWxhciB6b25lLCB0aGVyZWZvcmUgaXQgZG9lcyBub3RcbiAgICogcmVxdWlyZSBhIGNhbGwgdG8gYCRhcHBseSgpYC5cbiAgICovXG4gIHB1YmxpYyByZWFkeShmbjogKHVwZ3JhZGVBZGFwdGVyUmVmOiBVcGdyYWRlQWRhcHRlclJlZikgPT4gdm9pZCkgeyB0aGlzLl9yZWFkeUZuID0gZm47IH1cblxuICAvKipcbiAgICogRGlzcG9zZSBvZiBydW5uaW5nIGh5YnJpZCBBbmd1bGFySlMgLyBBbmd1bGFyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5uZzFJbmplY3RvciAhLmdldCgkUk9PVF9TQ09QRSkuJGRlc3Ryb3koKTtcbiAgICB0aGlzLm5nMk1vZHVsZVJlZiAhLmRlc3Ryb3koKTtcbiAgfVxufVxuIl19