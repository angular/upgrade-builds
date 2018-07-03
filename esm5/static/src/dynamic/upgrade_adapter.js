/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Compiler, Injector, NgModule, NgZone, Testability } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as angular from '../common/angular1';
import { $$TESTABILITY, $COMPILE, $INJECTOR, $ROOT_SCOPE, COMPILER_KEY, INJECTOR_KEY, LAZY_MODULE_REF, NG_ZONE_KEY } from '../common/constants';
import { downgradeComponent } from '../common/downgrade_component';
import { downgradeInjectable } from '../common/downgrade_injectable';
import { Deferred, controllerKey, onError } from '../common/util';
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
     * ## Mental Model
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
     *
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
        var ng1Module = this.ng1Module = angular.module(this.idPrefix, modules);
        var platformRef = platformBrowserDynamic();
        this.ngZone = new NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
        this.ng2BootstrapDeferred = new Deferred();
        ng1Module.factory(INJECTOR_KEY, function () { return _this.moduleRef.injector.get(Injector); })
            .factory(LAZY_MODULE_REF, [
            INJECTOR_KEY,
            function (injector) { return ({ injector: injector, needsNgZone: false }); }
        ])
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
                        imports: [_this.ng2AppModule],
                        entryComponents: _this.downgradedComponents
                    };
                    // At this point we have ng1 injector and we have prepared
                    // ng1 components to be upgraded, we now can bootstrap ng2.
                    var DynamicNgUpgradeModule = /** @class */ (function () {
                        function DynamicNgUpgradeModule() {
                        }
                        DynamicNgUpgradeModule.prototype.ngDoBootstrap = function () { };
                        DynamicNgUpgradeModule.decorators = [
                            { type: NgModule, args: [ngModule,] },
                        ];
                        /** @nocollapse */
                        DynamicNgUpgradeModule.ctorParameters = function () { return []; };
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
                        var subscription = _this.ngZone.onMicrotaskEmpty.subscribe({ next: function () { return rootScope.$digest(); } });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL2R5bmFtaWMvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUE4QixRQUFRLEVBQUUsUUFBUSxFQUFlLE1BQU0sRUFBa0IsV0FBVyxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBQy9JLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBRXpFLE9BQU8sS0FBSyxPQUFPLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM5SSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNqRSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNuRSxPQUFPLEVBQUMsUUFBUSxFQUFpQixhQUFhLEVBQUUsT0FBTyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0UsT0FBTyxFQUFDLGlDQUFpQyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFeEUsSUFBSSxZQUFZLEdBQVcsQ0FBQyxDQUFDO0FBRTdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBK0VHO0FBQ0g7SUFrQkUsd0JBQW9CLFlBQXVCLEVBQVUsZUFBaUM7UUFBbEUsaUJBQVksR0FBWixZQUFZLENBQVc7UUFBVSxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFqQjlFLGFBQVEs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QThCLElBQU0sQ0FBQztRQUNqRCxnQkFBVyxHQUE2QixJQUFNLENBQUM7UUFDL0MsaUJBQVksR0FBcUIsSUFBTSxDQUFDO1FBQ3hDLGdCQUFXLEdBQWEsSUFBTSxDQUFDO0lBMkJ4QyxDQUFDO0lBekJDLGVBQWU7SUFDUCwwQ0FBYyxHQUF0QixVQUF1QixXQUE2QixFQUFFLFdBQXFDO1FBQ3pGLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxpQ0FBSyxHQUFaLFVBQWEsRUFBa0QsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFeEY7O09BRUc7SUFDSSxtQ0FBTyxHQUFkO1FBQ0UsSUFBSSxDQUFDLFdBQWEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0MsSUFBSSxDQUFDLFlBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBQ0gsd0JBQUM7QUFBRCxDQUFDLEFBbENELElBa0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVyLCBDb21waWxlck9wdGlvbnMsIERpcmVjdGl2ZSwgSW5qZWN0b3IsIE5nTW9kdWxlLCBOZ01vZHVsZVJlZiwgTmdab25lLCBTdGF0aWNQcm92aWRlciwgVGVzdGFiaWxpdHksIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtwbGF0Zm9ybUJyb3dzZXJEeW5hbWljfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWMnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5pbXBvcnQgeyQkVEVTVEFCSUxJVFksICRDT01QSUxFLCAkSU5KRUNUT1IsICRST09UX1NDT1BFLCBDT01QSUxFUl9LRVksIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBOR19aT05FX0tFWX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge2Rvd25ncmFkZUNvbXBvbmVudH0gZnJvbSAnLi4vY29tbW9uL2Rvd25ncmFkZV9jb21wb25lbnQnO1xuaW1wb3J0IHtkb3duZ3JhZGVJbmplY3RhYmxlfSBmcm9tICcuLi9jb21tb24vZG93bmdyYWRlX2luamVjdGFibGUnO1xuaW1wb3J0IHtEZWZlcnJlZCwgTGF6eU1vZHVsZVJlZiwgY29udHJvbGxlcktleSwgb25FcnJvcn0gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuXG5pbXBvcnQge1VwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0gZnJvbSAnLi91cGdyYWRlX25nMV9hZGFwdGVyJztcblxubGV0IHVwZ3JhZGVDb3VudDogbnVtYmVyID0gMDtcblxuLyoqXG4gKiBVc2UgYFVwZ3JhZGVBZGFwdGVyYCB0byBhbGxvdyBBbmd1bGFySlMgYW5kIEFuZ3VsYXIgdG8gY29leGlzdCBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBUaGUgYFVwZ3JhZGVBZGFwdGVyYCBhbGxvd3M6XG4gKiAxLiBjcmVhdGlvbiBvZiBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyBjb21wb25lbnQgZGlyZWN0aXZlXG4gKiAgICAoU2VlIFtVcGdyYWRlQWRhcHRlciN1cGdyYWRlTmcxQ29tcG9uZW50KCldKVxuICogMi4gY3JlYXRpb24gb2YgQW5ndWxhckpTIGRpcmVjdGl2ZSBmcm9tIEFuZ3VsYXIgY29tcG9uZW50LlxuICogICAgKFNlZSBbVXBncmFkZUFkYXB0ZXIjZG93bmdyYWRlTmcyQ29tcG9uZW50KCldKVxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogIyMgTWVudGFsIE1vZGVsXG4gKlxuICogV2hlbiByZWFzb25pbmcgYWJvdXQgaG93IGEgaHlicmlkIGFwcGxpY2F0aW9uIHdvcmtzIGl0IGlzIHVzZWZ1bCB0byBoYXZlIGEgbWVudGFsIG1vZGVsIHdoaWNoXG4gKiBkZXNjcmliZXMgd2hhdCBpcyBoYXBwZW5pbmcgYW5kIGV4cGxhaW5zIHdoYXQgaXMgaGFwcGVuaW5nIGF0IHRoZSBsb3dlc3QgbGV2ZWwuXG4gKlxuICogMS4gVGhlcmUgYXJlIHR3byBpbmRlcGVuZGVudCBmcmFtZXdvcmtzIHJ1bm5pbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24sIGVhY2ggZnJhbWV3b3JrIHRyZWF0c1xuICogICAgdGhlIG90aGVyIGFzIGEgYmxhY2sgYm94LlxuICogMi4gRWFjaCBET00gZWxlbWVudCBvbiB0aGUgcGFnZSBpcyBvd25lZCBleGFjdGx5IGJ5IG9uZSBmcmFtZXdvcmsuIFdoaWNoZXZlciBmcmFtZXdvcmtcbiAqICAgIGluc3RhbnRpYXRlZCB0aGUgZWxlbWVudCBpcyB0aGUgb3duZXIuIEVhY2ggZnJhbWV3b3JrIG9ubHkgdXBkYXRlcy9pbnRlcmFjdHMgd2l0aCBpdHMgb3duXG4gKiAgICBET00gZWxlbWVudHMgYW5kIGlnbm9yZXMgb3RoZXJzLlxuICogMy4gQW5ndWxhckpTIGRpcmVjdGl2ZXMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIEFuZ3VsYXJKUyBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSBBbmd1bGFyIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA1LiBBbiBBbmd1bGFySlMgY29tcG9uZW50IGNhbiBiZSB1cGdyYWRlZCB0byBhbiBBbmd1bGFyIGNvbXBvbmVudC4gVGhpcyBjcmVhdGVzIGFuXG4gKiAgICBBbmd1bGFyIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBkaXJlY3RpdmUgaW4gdGhhdCBsb2NhdGlvbi5cbiAqIDYuIEFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbiBiZSBkb3duZ3JhZGVkIHRvIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgZGlyZWN0aXZlLiBUaGlzIGNyZWF0ZXNcbiAqICAgIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXIgY29tcG9uZW50IGluIHRoYXQgbG9jYXRpb24uXG4gKiA3LiBXaGVuZXZlciBhbiBhZGFwdGVyIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieSB0aGUgZnJhbWV3b3JrXG4gKiAgICBkb2luZyB0aGUgaW5zdGFudGlhdGlvbi4gVGhlIG90aGVyIGZyYW1ld29yayB0aGVuIGluc3RhbnRpYXRlcyBhbmQgb3ducyB0aGUgdmlldyBmb3IgdGhhdFxuICogICAgY29tcG9uZW50LiBUaGlzIGltcGxpZXMgdGhhdCBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay4gVGhlIHN5bnRheCBpcyBhbHdheXMgdGhhdCBvZiBBbmd1bGFyIHN5bnRheC5cbiAqIDguIEFuZ3VsYXJKUyBpcyBhbHdheXMgYm9vdHN0cmFwcGVkIGZpcnN0IGFuZCBvd25zIHRoZSBib3R0b20gbW9zdCB2aWV3LlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIEFuZ3VsYXIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHMgdG9cbiAqICAgIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoZm9yd2FyZFJlZigoKSA9PiBNeU5nMk1vZHVsZSksIG15Q29tcGlsZXJPcHRpb25zKTtcbiAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gKiBtb2R1bGUuZGlyZWN0aXZlKCduZzJDb21wJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyQ29tcG9uZW50KSk7XG4gKlxuICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcxSGVsbG8nLCBmdW5jdGlvbigpIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICAgc2NvcGU6IHsgdGl0bGU6ICc9JyB9LFxuICogICAgICB0ZW1wbGF0ZTogJ25nMVtIZWxsbyB7e3RpdGxlfX0hXSg8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4pJ1xuICogICB9O1xuICogfSk7XG4gKlxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ25nMi1jb21wJyxcbiAqICAgaW5wdXRzOiBbJ25hbWUnXSxcbiAqICAgdGVtcGxhdGU6ICduZzJbPG5nMS1oZWxsbyBbdGl0bGVdPVwibmFtZVwiPnRyYW5zY2x1ZGU8L25nMS1oZWxsbz5dKDxuZy1jb250ZW50PjwvbmctY29udGVudD4pJyxcbiAqICAgZGlyZWN0aXZlczpcbiAqIH0pXG4gKiBjbGFzcyBOZzJDb21wb25lbnQge1xuICogfVxuICpcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGRlY2xhcmF0aW9uczogW05nMkNvbXBvbmVudCwgYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCduZzFIZWxsbycpXSxcbiAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdXG4gKiB9KVxuICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAqXG4gKlxuICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMi1jb21wIG5hbWU9XCJXb3JsZFwiPnByb2plY3Q8L25nMi1jb21wPic7XG4gKlxuICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFxuICogICAgICAgXCJuZzJbbmcxW0hlbGxvIFdvcmxkIV0odHJhbnNjbHVkZSldKHByb2plY3QpXCIpO1xuICogfSk7XG4gKlxuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgRGVwcmVjYXRlZCBzaW5jZSB2NS4gVXNlIGB1cGdyYWRlL3N0YXRpY2AgaW5zdGVhZCwgd2hpY2ggYWxzbyBzdXBwb3J0c1xuICogW0FoZWFkLW9mLVRpbWUgY29tcGlsYXRpb25dKGd1aWRlL2FvdC1jb21waWxlcikuXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlQWRhcHRlciB7XG4gIHByaXZhdGUgaWRQcmVmaXg6IHN0cmluZyA9IGBORzJfVVBHUkFERV8ke3VwZ3JhZGVDb3VudCsrfV9gO1xuICBwcml2YXRlIGRvd25ncmFkZWRDb21wb25lbnRzOiBUeXBlPGFueT5bXSA9IFtdO1xuICAvKipcbiAgICogQW4gaW50ZXJuYWwgbWFwIG9mIG5nMSBjb21wb25lbnRzIHdoaWNoIG5lZWQgdG8gdXAgdXBncmFkZWQgdG8gbmcyLlxuICAgKlxuICAgKiBXZSBjYW4ndCB1cGdyYWRlIHVudGlsIGluamVjdG9yIGlzIGluc3RhbnRpYXRlZCBhbmQgd2UgY2FuIHJldHJpZXZlIHRoZSBjb21wb25lbnQgbWV0YWRhdGEuXG4gICAqIEZvciB0aGlzIHJlYXNvbiB3ZSBrZWVwIGEgbGlzdCBvZiBjb21wb25lbnRzIHRvIHVwZ3JhZGUgdW50aWwgbmcxIGluamVjdG9yIGlzIGJvb3RzdHJhcHBlZC5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwcml2YXRlIG5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWQ6IHtbbmFtZTogc3RyaW5nXTogVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSA9IHt9O1xuICBwcml2YXRlIHVwZ3JhZGVkUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW107XG4gIHByaXZhdGUgbmdab25lOiBOZ1pvbmU7XG4gIHByaXZhdGUgbmcxTW9kdWxlOiBhbmd1bGFyLklNb2R1bGU7XG4gIHByaXZhdGUgbW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIG5nMkJvb3RzdHJhcERlZmVycmVkOiBEZWZlcnJlZDxhbmd1bGFyLklJbmplY3RvclNlcnZpY2U+O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgbmcyQXBwTW9kdWxlOiBUeXBlPGFueT4sIHByaXZhdGUgY29tcGlsZXJPcHRpb25zPzogQ29tcGlsZXJPcHRpb25zKSB7XG4gICAgaWYgKCFuZzJBcHBNb2R1bGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnVXBncmFkZUFkYXB0ZXIgY2Fubm90IGJlIGluc3RhbnRpYXRlZCB3aXRob3V0IGFuIE5nTW9kdWxlIG9mIHRoZSBBbmd1bGFyIGFwcC4nKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXIgQ29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFySlMuXG4gICAqXG4gICAqIFVzZSBgZG93bmdyYWRlTmcyQ29tcG9uZW50YCB0byBjcmVhdGUgYW4gQW5ndWxhckpTIERpcmVjdGl2ZSBEZWZpbml0aW9uIEZhY3RvcnkgZnJvbVxuICAgKiBBbmd1bGFyIENvbXBvbmVudC4gVGhlIGFkYXB0ZXIgd2lsbCBib290c3RyYXAgQW5ndWxhciBjb21wb25lbnQgZnJvbSB3aXRoaW4gdGhlXG4gICAqIEFuZ3VsYXJKUyB0ZW1wbGF0ZS5cbiAgICpcbiAgICogIyMgTWVudGFsIE1vZGVsXG4gICAqXG4gICAqIDEuIFRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGJ5IGJlaW5nIGxpc3RlZCBpbiBBbmd1bGFySlMgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhckpTLCBidXQgdGhlIGNvbXBvbmVudCdzIHZpZXcgd2lsbCBiZSBjb250cm9sbGVkIGJ5XG4gICAqICAgIEFuZ3VsYXIuXG4gICAqIDIuIEV2ZW4gdGhvdWdodCB0aGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBpbiBBbmd1bGFySlMsIGl0IHdpbGwgYmUgdXNpbmcgQW5ndWxhclxuICAgKiAgICBzeW50YXguIFRoaXMgaGFzIHRvIGJlIGRvbmUsIHRoaXMgd2F5IGJlY2F1c2Ugd2UgbXVzdCBmb2xsb3cgQW5ndWxhciBjb21wb25lbnRzIGRvIG5vdFxuICAgKiAgICBkZWNsYXJlIGhvdyB0aGUgYXR0cmlidXRlcyBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXG4gICAqIDMuIGBuZy1tb2RlbGAgaXMgY29udHJvbGxlZCBieSBBbmd1bGFySlMgYW5kIGNvbW11bmljYXRlcyB3aXRoIHRoZSBkb3duZ3JhZGVkIEFuZ3VsYXIgY29tcG9uZW50XG4gICAqICAgIGJ5IHdheSBvZiB0aGUgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UgZnJvbSBAYW5ndWxhci9mb3Jtcy4gT25seSBjb21wb25lbnRzIHRoYXRcbiAgICogICAgaW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlIGFyZSBlbGlnaWJsZS5cbiAgICpcbiAgICogIyMgU3VwcG9ydGVkIEZlYXR1cmVzXG4gICAqXG4gICAqIC0gQmluZGluZ3M6XG4gICAqICAgLSBBdHRyaWJ1dGU6IGA8Y29tcCBuYW1lPVwiV29ybGRcIj5gXG4gICAqICAgLSBJbnRlcnBvbGF0aW9uOiAgYDxjb21wIGdyZWV0aW5nPVwiSGVsbG8ge3tuYW1lfX0hXCI+YFxuICAgKiAgIC0gRXhwcmVzc2lvbjogIGA8Y29tcCBbbmFtZV09XCJ1c2VybmFtZVwiPmBcbiAgICogICAtIEV2ZW50OiAgYDxjb21wIChjbG9zZSk9XCJkb1NvbWV0aGluZygpXCI+YFxuICAgKiAgIC0gbmctbW9kZWw6IGA8Y29tcCBuZy1tb2RlbD1cIm5hbWVcIj5gXG4gICAqIC0gQ29udGVudCBwcm9qZWN0aW9uOiB5ZXNcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoZm9yd2FyZFJlZigoKSA9PiBNeU5nMk1vZHVsZSkpO1xuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCdncmVldCcsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KEdyZWV0ZXIpKTtcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gICAqICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8bmctY29udGVudD48L25nLWNvbnRlbnQ+J1xuICAgKiB9KVxuICAgKiBjbGFzcyBHcmVldGVyIHtcbiAgICogICBASW5wdXQoKSBzYWx1dGF0aW9uOiBzdHJpbmc7XG4gICAqICAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuICAgKiB9XG4gICAqXG4gICAqIEBOZ01vZHVsZSh7XG4gICAqICAgZGVjbGFyYXRpb25zOiBbR3JlZXRlcl0sXG4gICAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmcyTW9kdWxlIHt9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID1cbiAgICogICAnbmcxIHRlbXBsYXRlOiA8Z3JlZXQgc2FsdXRhdGlvbj1cIkhlbGxvXCIgW25hbWVdPVwid29ybGRcIj50ZXh0PC9ncmVldD4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMSB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZG93bmdyYWRlTmcyQ29tcG9uZW50KGNvbXBvbmVudDogVHlwZTxhbnk+KTogRnVuY3Rpb24ge1xuICAgIHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuXG4gICAgcmV0dXJuIGRvd25ncmFkZUNvbXBvbmVudCh7Y29tcG9uZW50fSk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXJKUyBDb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXIuXG4gICAqXG4gICAqIFVzZSBgdXBncmFkZU5nMUNvbXBvbmVudGAgdG8gY3JlYXRlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGZyb20gQW5ndWxhckpTIENvbXBvbmVudFxuICAgKiBkaXJlY3RpdmUuIFRoZSBhZGFwdGVyIHdpbGwgYm9vdHN0cmFwIEFuZ3VsYXJKUyBjb21wb25lbnQgZnJvbSB3aXRoaW4gdGhlIEFuZ3VsYXJcbiAgICogdGVtcGxhdGUuXG4gICAqXG4gICAqICMjIE1lbnRhbCBNb2RlbFxuICAgKlxuICAgKiAxLiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBieSBiZWluZyBsaXN0ZWQgaW4gQW5ndWxhciB0ZW1wbGF0ZS4gVGhpcyBtZWFucyB0aGF0IHRoZVxuICAgKiAgICBob3N0IGVsZW1lbnQgaXMgY29udHJvbGxlZCBieSBBbmd1bGFyLCBidXQgdGhlIGNvbXBvbmVudCdzIHZpZXcgd2lsbCBiZSBjb250cm9sbGVkIGJ5XG4gICAqICAgIEFuZ3VsYXJKUy5cbiAgICpcbiAgICogIyMgU3VwcG9ydGVkIEZlYXR1cmVzXG4gICAqXG4gICAqIC0gQmluZGluZ3M6XG4gICAqICAgLSBBdHRyaWJ1dGU6IGA8Y29tcCBuYW1lPVwiV29ybGRcIj5gXG4gICAqICAgLSBJbnRlcnBvbGF0aW9uOiAgYDxjb21wIGdyZWV0aW5nPVwiSGVsbG8ge3tuYW1lfX0hXCI+YFxuICAgKiAgIC0gRXhwcmVzc2lvbjogIGA8Y29tcCBbbmFtZV09XCJ1c2VybmFtZVwiPmBcbiAgICogICAtIEV2ZW50OiAgYDxjb21wIChjbG9zZSk9XCJkb1NvbWV0aGluZygpXCI+YFxuICAgKiAtIFRyYW5zY2x1c2lvbjogeWVzXG4gICAqIC0gT25seSBzb21lIG9mIHRoZSBmZWF0dXJlcyBvZlxuICAgKiAgIFtEaXJlY3RpdmUgRGVmaW5pdGlvbiBPYmplY3RdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9zZXJ2aWNlLyRjb21waWxlKSBhcmVcbiAgICogICBzdXBwb3J0ZWQ6XG4gICAqICAgLSBgY29tcGlsZWA6IG5vdCBzdXBwb3J0ZWQgYmVjYXVzZSB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IEFuZ3VsYXIsIHdoaWNoIGRvZXNcbiAgICogICAgIG5vdCBhbGxvdyBtb2RpZnlpbmcgRE9NIHN0cnVjdHVyZSBkdXJpbmcgY29tcGlsYXRpb24uXG4gICAqICAgLSBgY29udHJvbGxlcmA6IHN1cHBvcnRlZC4gKE5PVEU6IGluamVjdGlvbiBvZiBgJGF0dHJzYCBhbmQgYCR0cmFuc2NsdWRlYCBpcyBub3Qgc3VwcG9ydGVkLilcbiAgICogICAtIGBjb250cm9sbGVyQXNgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgYmluZFRvQ29udHJvbGxlcmA6IHN1cHBvcnRlZC5cbiAgICogICAtIGBsaW5rYDogc3VwcG9ydGVkLiAoTk9URTogb25seSBwcmUtbGluayBmdW5jdGlvbiBpcyBzdXBwb3J0ZWQuKVxuICAgKiAgIC0gYG5hbWVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcHJpb3JpdHlgOiBpZ25vcmVkLlxuICAgKiAgIC0gYHJlcGxhY2VgOiBub3Qgc3VwcG9ydGVkLlxuICAgKiAgIC0gYHJlcXVpcmVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcmVzdHJpY3RgOiBtdXN0IGJlIHNldCB0byAnRScuXG4gICAqICAgLSBgc2NvcGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVVcmxgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVybWluYWxgOiBpZ25vcmVkLlxuICAgKiAgIC0gYHRyYW5zY2x1ZGVgOiBzdXBwb3J0ZWQuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBmdW5jdGlvbigpIHtcbiAgICogICByZXR1cm4ge1xuICAgKiAgICAgc2NvcGU6IHtzYWx1dGF0aW9uOiAnPScsIG5hbWU6ICc9JyB9LFxuICAgKiAgICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4nXG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMkNvbXBvbmVudCkpO1xuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ25nMicsXG4gICAqICAgdGVtcGxhdGU6ICduZzIgdGVtcGxhdGU6IDxncmVldCBzYWx1dGF0aW9uPVwiSGVsbG9cIiBbbmFtZV09XCJ3b3JsZFwiPnRleHQ8L2dyZWV0PidcbiAgICogfSlcbiAgICogY2xhc3MgTmcyQ29tcG9uZW50IHtcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW05nMkNvbXBvbmVudCwgYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCdncmVldCcpXSxcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMj48L25nMj4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMiB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXBncmFkZU5nMUNvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBUeXBlPGFueT4ge1xuICAgIGlmICgoPGFueT50aGlzLm5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWQpLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdLnR5cGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAodGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdID0gbmV3IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcihuYW1lKSlcbiAgICAgICAgICAudHlwZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBhZGFwdGVyJ3MgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIGZvciB1bml0IHRlc3RpbmcgaW4gQW5ndWxhckpTLlxuICAgKiBVc2UgdGhpcyBpbnN0ZWFkIG9mIGBhbmd1bGFyLm1vY2subW9kdWxlKClgIHRvIGxvYWQgdGhlIHVwZ3JhZGUgbW9kdWxlIGludG9cbiAgICogdGhlIEFuZ3VsYXJKUyB0ZXN0aW5nIGluamVjdG9yLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgdXBncmFkZUFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKlxuICAgKiAvLyBjb25maWd1cmUgdGhlIGFkYXB0ZXIgd2l0aCB1cGdyYWRlL2Rvd25ncmFkZSBjb21wb25lbnRzIGFuZCBzZXJ2aWNlc1xuICAgKiB1cGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTXlDb21wb25lbnQpO1xuICAgKlxuICAgKiBsZXQgdXBncmFkZUFkYXB0ZXJSZWY6IFVwZ3JhZGVBZGFwdGVyUmVmO1xuICAgKiBsZXQgJGNvbXBpbGUsICRyb290U2NvcGU7XG4gICAqXG4gICAqIC8vIFdlIG11c3QgcmVnaXN0ZXIgdGhlIGFkYXB0ZXIgYmVmb3JlIGFueSBjYWxscyB0byBgaW5qZWN0KClgXG4gICAqIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgKiAgIHVwZ3JhZGVBZGFwdGVyUmVmID0gdXBncmFkZUFkYXB0ZXIucmVnaXN0ZXJGb3JOZzFUZXN0cyhbJ2hlcm9BcHAnXSk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBiZWZvcmVFYWNoKGluamVjdCgoXyRjb21waWxlXywgXyRyb290U2NvcGVfKSA9PiB7XG4gICAqICAgJGNvbXBpbGUgPSBfJGNvbXBpbGVfO1xuICAgKiAgICRyb290U2NvcGUgPSBfJHJvb3RTY29wZV87XG4gICAqIH0pKTtcbiAgICpcbiAgICogaXQoXCJzYXlzIGhlbGxvXCIsIChkb25lKSA9PiB7XG4gICAqICAgdXBncmFkZUFkYXB0ZXJSZWYucmVhZHkoKCkgPT4ge1xuICAgKiAgICAgY29uc3QgZWxlbWVudCA9ICRjb21waWxlKFwiPG15LWNvbXBvbmVudD48L215LWNvbXBvbmVudD5cIikoJHJvb3RTY29wZSk7XG4gICAqICAgICAkcm9vdFNjb3BlLiRhcHBseSgpO1xuICAgKiAgICAgZXhwZWN0KGVsZW1lbnQuaHRtbCgpKS50b0NvbnRhaW4oXCJIZWxsbyBXb3JsZFwiKTtcbiAgICogICAgIGRvbmUoKTtcbiAgICogICB9KVxuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVzIGFueSBBbmd1bGFySlMgbW9kdWxlcyB0aGF0IHRoZSB1cGdyYWRlIG1vZHVsZSBzaG91bGQgZGVwZW5kIHVwb25cbiAgICogQHJldHVybnMgYW4gYFVwZ3JhZGVBZGFwdGVyUmVmYCwgd2hpY2ggbGV0cyB5b3UgcmVnaXN0ZXIgYSBgcmVhZHkoKWAgY2FsbGJhY2sgdG9cbiAgICogcnVuIGFzc2VydGlvbnMgb25jZSB0aGUgQW5ndWxhciBjb21wb25lbnRzIGFyZSByZWFkeSB0byB0ZXN0IHRocm91Z2ggQW5ndWxhckpTLlxuICAgKi9cbiAgcmVnaXN0ZXJGb3JOZzFUZXN0cyhtb2R1bGVzPzogc3RyaW5nW10pOiBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgY29uc3Qgd2luZG93TmdNb2NrID0gKHdpbmRvdyBhcyBhbnkpWydhbmd1bGFyJ10ubW9jaztcbiAgICBpZiAoIXdpbmRvd05nTW9jayB8fCAhd2luZG93TmdNb2NrLm1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmluZCBcXCdhbmd1bGFyLm1vY2subW9kdWxlXFwnLicpO1xuICAgIH1cbiAgICB0aGlzLmRlY2xhcmVOZzFNb2R1bGUobW9kdWxlcyk7XG4gICAgd2luZG93TmdNb2NrLm1vZHVsZSh0aGlzLm5nMU1vZHVsZS5uYW1lKTtcbiAgICBjb25zdCB1cGdyYWRlID0gbmV3IFVwZ3JhZGVBZGFwdGVyUmVmKCk7XG4gICAgdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZC5wcm9taXNlLnRoZW4oXG4gICAgICAgIChuZzFJbmplY3RvcikgPT4geyAoPGFueT51cGdyYWRlKS5fYm9vdHN0cmFwRG9uZSh0aGlzLm1vZHVsZVJlZiwgbmcxSW5qZWN0b3IpOyB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYSBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBgYm9vdHN0cmFwYCBtZXRob2QgaXMgYSBkaXJlY3QgcmVwbGFjZW1lbnQgKHRha2VzIHNhbWUgYXJndW1lbnRzKSBmb3IgQW5ndWxhckpTXG4gICAqIFtgYm9vdHN0cmFwYF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL2Z1bmN0aW9uL2FuZ3VsYXIuYm9vdHN0cmFwKSBtZXRob2QuIFVubGlrZVxuICAgKiBBbmd1bGFySlMsIHRoaXMgYm9vdHN0cmFwIGlzIGFzeW5jaHJvbm91cy5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzIpKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcxJywgZnVuY3Rpb24oKSB7XG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gICAqICAgICAgdGVtcGxhdGU6ICduZzFbSGVsbG8ge3t0aXRsZX19IV0oPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+KSdcbiAgICogICB9O1xuICAgKiB9KTtcbiAgICpcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICduZzInLFxuICAgKiAgIGlucHV0czogWyduYW1lJ10sXG4gICAqICAgdGVtcGxhdGU6ICduZzJbPG5nMSBbdGl0bGVdPVwibmFtZVwiPnRyYW5zY2x1ZGU8L25nMT5dKDxuZy1jb250ZW50PjwvbmctY29udGVudD4pJ1xuICAgKiB9KVxuICAgKiBjbGFzcyBOZzIge1xuICAgKiB9XG4gICAqXG4gICAqIEBOZ01vZHVsZSh7XG4gICAqICAgZGVjbGFyYXRpb25zOiBbTmcyLCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMScpXSxcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMiBuYW1lPVwiV29ybGRcIj5wcm9qZWN0PC9uZzI+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gICAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgYm9vdHN0cmFwKGVsZW1lbnQ6IEVsZW1lbnQsIG1vZHVsZXM/OiBhbnlbXSwgY29uZmlnPzogYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyk6XG4gICAgICBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgdGhpcy5kZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXMpO1xuXG4gICAgY29uc3QgdXBncmFkZSA9IG5ldyBVcGdyYWRlQWRhcHRlclJlZigpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHJlc3VtZUJvb3RzdHJhcCgpIG9ubHkgZXhpc3RzIGlmIHRoZSBjdXJyZW50IGJvb3RzdHJhcCBpcyBkZWZlcnJlZFxuICAgIGNvbnN0IHdpbmRvd0FuZ3VsYXIgPSAod2luZG93IGFzIGFueSAvKiogVE9ETyAjPz8/PyAqLylbJ2FuZ3VsYXInXTtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7IGFuZ3VsYXIuYm9vdHN0cmFwKGVsZW1lbnQsIFt0aGlzLm5nMU1vZHVsZS5uYW1lXSwgY29uZmlnICEpOyB9KTtcbiAgICBjb25zdCBuZzFCb290c3RyYXBQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCkge1xuICAgICAgICBjb25zdCBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gb3JpZ2luYWxSZXN1bWVCb290c3RyYXA7XG4gICAgICAgICAgY29uc3QgciA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgUHJvbWlzZS5hbGwoW3RoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucHJvbWlzZSwgbmcxQm9vdHN0cmFwUHJvbWlzZV0pLnRoZW4oKFtuZzFJbmplY3Rvcl0pID0+IHtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5kYXRhICEoY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpLCB0aGlzLm1vZHVsZVJlZiAhLmluamVjdG9yKTtcbiAgICAgIHRoaXMubW9kdWxlUmVmICEuaW5qZWN0b3IuZ2V0PE5nWm9uZT4oTmdab25lKS5ydW4oXG4gICAgICAgICAgKCkgPT4geyAoPGFueT51cGdyYWRlKS5fYm9vdHN0cmFwRG9uZSh0aGlzLm1vZHVsZVJlZiwgbmcxSW5qZWN0b3IpOyB9KTtcbiAgICB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhckpTIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXIuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBMb2dpbiB7IC4uLiB9XG4gICAqIGNsYXNzIFNlcnZlciB7IC4uLiB9XG4gICAqXG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRXhhbXBsZSB7XG4gICAqICAgY29uc3RydWN0b3IoQEluamVjdCgnc2VydmVyJykgc2VydmVyLCBsb2dpbjogTG9naW4pIHtcbiAgICogICAgIC4uLlxuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuc2VydmljZSgnc2VydmVyJywgU2VydmVyKTtcbiAgICogbW9kdWxlLnNlcnZpY2UoJ2xvZ2luJywgTG9naW4pO1xuICAgKlxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogYWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIoJ3NlcnZlcicpO1xuICAgKiBhZGFwdGVyLnVwZ3JhZGVOZzFQcm92aWRlcignbG9naW4nLCB7YXNUb2tlbjogTG9naW59KTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIGNvbnN0IGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcySW5qZWN0b3IuZ2V0KEV4YW1wbGUpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICB1cGdyYWRlTmcxUHJvdmlkZXIobmFtZTogc3RyaW5nLCBvcHRpb25zPzoge2FzVG9rZW46IGFueX0pIHtcbiAgICBjb25zdCB0b2tlbiA9IG9wdGlvbnMgJiYgb3B0aW9ucy5hc1Rva2VuIHx8IG5hbWU7XG4gICAgdGhpcy51cGdyYWRlZFByb3ZpZGVycy5wdXNoKHtcbiAgICAgIHByb3ZpZGU6IHRva2VuLFxuICAgICAgdXNlRmFjdG9yeTogKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiAkaW5qZWN0b3IuZ2V0KG5hbWUpLFxuICAgICAgZGVwczogWyRJTkpFQ1RPUl1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFySlMuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogfVxuICAgKlxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICpcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmZhY3RvcnkoJ2V4YW1wbGUnLCBhZGFwdGVyLmRvd25ncmFkZU5nMlByb3ZpZGVyKEV4YW1wbGUpKTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIGNvbnN0IGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcxSW5qZWN0b3IuZ2V0KCdleGFtcGxlJyk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIGRvd25ncmFkZU5nMlByb3ZpZGVyKHRva2VuOiBhbnkpOiBGdW5jdGlvbiB7IHJldHVybiBkb3duZ3JhZGVJbmplY3RhYmxlKHRva2VuKTsgfVxuXG4gIC8qKlxuICAgKiBEZWNsYXJlIHRoZSBBbmd1bGFySlMgdXBncmFkZSBtb2R1bGUgZm9yIHRoaXMgYWRhcHRlciB3aXRob3V0IGJvb3RzdHJhcHBpbmcgdGhlIHdob2xlXG4gICAqIGh5YnJpZCBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgYXV0b21hdGljYWxseSBjYWxsZWQgYnkgYGJvb3RzdHJhcCgpYCBhbmQgYHJlZ2lzdGVyRm9yTmcxVGVzdHMoKWAuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVzIFRoZSBBbmd1bGFySlMgbW9kdWxlcyB0aGF0IHRoaXMgdXBncmFkZSBtb2R1bGUgc2hvdWxkIGRlcGVuZCB1cG9uLlxuICAgKiBAcmV0dXJucyBUaGUgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIHRoYXQgaXMgZGVjbGFyZWQgYnkgdGhpcyBtZXRob2RcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IHVwZ3JhZGVBZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogdXBncmFkZUFkYXB0ZXIuZGVjbGFyZU5nMU1vZHVsZShbJ2hlcm9BcHAnXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcHJpdmF0ZSBkZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXM6IHN0cmluZ1tdID0gW10pOiBhbmd1bGFyLklNb2R1bGUge1xuICAgIGNvbnN0IGRlbGF5QXBwbHlFeHBzOiBGdW5jdGlvbltdID0gW107XG4gICAgbGV0IG9yaWdpbmFsJGFwcGx5Rm46IEZ1bmN0aW9uO1xuICAgIGxldCByb290U2NvcGVQcm90b3R5cGU6IGFueTtcbiAgICBsZXQgcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlO1xuICAgIGNvbnN0IHVwZ3JhZGVBZGFwdGVyID0gdGhpcztcbiAgICBjb25zdCBuZzFNb2R1bGUgPSB0aGlzLm5nMU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKHRoaXMuaWRQcmVmaXgsIG1vZHVsZXMpO1xuICAgIGNvbnN0IHBsYXRmb3JtUmVmID0gcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpO1xuXG4gICAgdGhpcy5uZ1pvbmUgPSBuZXcgTmdab25lKHtlbmFibGVMb25nU3RhY2tUcmFjZTogWm9uZS5oYXNPd25Qcm9wZXJ0eSgnbG9uZ1N0YWNrVHJhY2Vab25lU3BlYycpfSk7XG4gICAgdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIG5nMU1vZHVsZS5mYWN0b3J5KElOSkVDVE9SX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYgIS5pbmplY3Rvci5nZXQoSW5qZWN0b3IpKVxuICAgICAgICAuZmFjdG9yeShcbiAgICAgICAgICAgIExBWllfTU9EVUxFX1JFRixcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgSU5KRUNUT1JfS0VZLFxuICAgICAgICAgICAgICAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiAoeyBpbmplY3RvciwgbmVlZHNOZ1pvbmU6IGZhbHNlIH0gYXMgTGF6eU1vZHVsZVJlZilcbiAgICAgICAgICAgIF0pXG4gICAgICAgIC5jb25zdGFudChOR19aT05FX0tFWSwgdGhpcy5uZ1pvbmUpXG4gICAgICAgIC5mYWN0b3J5KENPTVBJTEVSX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYgIS5pbmplY3Rvci5nZXQoQ29tcGlsZXIpKVxuICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAnJHByb3ZpZGUnLCAnJGluamVjdG9yJyxcbiAgICAgICAgICAocHJvdmlkZTogYW5ndWxhci5JUHJvdmlkZVNlcnZpY2UsIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgIHByb3ZpZGUuZGVjb3JhdG9yKCRST09UX1NDT1BFLCBbXG4gICAgICAgICAgICAgICckZGVsZWdhdGUnLFxuICAgICAgICAgICAgICBmdW5jdGlvbihyb290U2NvcGVEZWxlZ2F0ZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSkge1xuICAgICAgICAgICAgICAgIC8vIENhcHR1cmUgdGhlIHJvb3QgYXBwbHkgc28gdGhhdCB3ZSBjYW4gZGVsYXkgZmlyc3QgY2FsbCB0byAkYXBwbHkgdW50aWwgd2VcbiAgICAgICAgICAgICAgICAvLyBib290c3RyYXAgQW5ndWxhciBhbmQgdGhlbiB3ZSByZXBsYXkgYW5kIHJlc3RvcmUgdGhlICRhcHBseS5cbiAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSByb290U2NvcGVEZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnJGFwcGx5JykpIHtcbiAgICAgICAgICAgICAgICAgIG9yaWdpbmFsJGFwcGx5Rm4gPSByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5O1xuICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IChleHA6IGFueSkgPT4gZGVsYXlBcHBseUV4cHMucHVzaChleHApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBmaW5kIFxcJyRhcHBseVxcJyBvbiBcXCckcm9vdFNjb3BlXFwnIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlID0gcm9vdFNjb3BlRGVsZWdhdGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgaWYgKG5nMUluamVjdG9yLmhhcygkJFRFU1RBQklMSVRZKSkge1xuICAgICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcigkJFRFU1RBQklMSVRZLCBbXG4gICAgICAgICAgICAgICAgJyRkZWxlZ2F0ZScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24odGVzdGFiaWxpdHlEZWxlZ2F0ZTogYW5ndWxhci5JVGVzdGFiaWxpdHlTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbFdoZW5TdGFibGU6IEZ1bmN0aW9uID0gdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1doZW5TdGFibGUgPSBmdW5jdGlvbihjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxXaGVuU3RhYmxlLmNhbGwodGhpcywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdXBncmFkZUFkYXB0ZXIubW9kdWxlUmVmICEuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAobmcyVGVzdGFiaWxpdHkuaXNTdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmcyVGVzdGFiaWxpdHkud2hlblN0YWJsZShuZXdXaGVuU3RhYmxlLmJpbmQodGhpcywgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdKTtcblxuICAgIG5nMU1vZHVsZS5ydW4oW1xuICAgICAgJyRpbmplY3RvcicsICckcm9vdFNjb3BlJyxcbiAgICAgIChuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCByb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UpID0+IHtcbiAgICAgICAgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyLnJlc29sdmUodGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkLCBuZzFJbmplY3RvcilcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgLy8gTm90ZTogVGhlcmUgaXMgYSBidWcgaW4gVFMgMi40IHRoYXQgcHJldmVudHMgdXMgZnJvbVxuICAgICAgICAgICAgICAvLyBpbmxpbmluZyB0aGlzIGludG8gQE5nTW9kdWxlXG4gICAgICAgICAgICAgIC8vIFRPRE8odGJvc2NoKTogZmluZCBvciBmaWxlIGEgYnVnIGFnYWluc3QgVHlwZVNjcmlwdCBmb3IgdGhpcy5cbiAgICAgICAgICAgICAgY29uc3QgbmdNb2R1bGUgPSB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgICAgICAgICB7cHJvdmlkZTogJElOSkVDVE9SLCB1c2VGYWN0b3J5OiAoKSA9PiBuZzFJbmplY3Rvcn0sXG4gICAgICAgICAgICAgICAgICB7cHJvdmlkZTogJENPTVBJTEUsIHVzZUZhY3Rvcnk6ICgpID0+IG5nMUluamVjdG9yLmdldCgkQ09NUElMRSl9LFxuICAgICAgICAgICAgICAgICAgdGhpcy51cGdyYWRlZFByb3ZpZGVyc1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgaW1wb3J0czogW3RoaXMubmcyQXBwTW9kdWxlXSxcbiAgICAgICAgICAgICAgICBlbnRyeUNvbXBvbmVudHM6IHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHNcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCB3ZSBoYXZlIG5nMSBpbmplY3RvciBhbmQgd2UgaGF2ZSBwcmVwYXJlZFxuICAgICAgICAgICAgICAvLyBuZzEgY29tcG9uZW50cyB0byBiZSB1cGdyYWRlZCwgd2Ugbm93IGNhbiBib290c3RyYXAgbmcyLlxuICAgICAgICAgICAgICBATmdNb2R1bGUobmdNb2R1bGUpXG4gICAgICAgICAgICAgIGNsYXNzIER5bmFtaWNOZ1VwZ3JhZGVNb2R1bGUge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdG9yKCkge31cbiAgICAgICAgICAgICAgICBuZ0RvQm9vdHN0cmFwKCkge31cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwbGF0Zm9ybVJlZlxuICAgICAgICAgICAgICAgICAgLmJvb3RzdHJhcE1vZHVsZShcbiAgICAgICAgICAgICAgICAgICAgICBEeW5hbWljTmdVcGdyYWRlTW9kdWxlLCBbdGhpcy5jb21waWxlck9wdGlvbnMgISwge25nWm9uZTogdGhpcy5uZ1pvbmV9XSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKChyZWY6IE5nTW9kdWxlUmVmPGFueT4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVSZWYgPSByZWY7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IG9yaWdpbmFsJGFwcGx5Rm47ICAvLyByZXN0b3JlIG9yaWdpbmFsICRhcHBseVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGRlbGF5QXBwbHlFeHBzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByb290U2NvcGUuJGFwcGx5KGRlbGF5QXBwbHlFeHBzLnNoaWZ0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucmVzb2x2ZShuZzFJbmplY3RvciksIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJzY3JpcHRpb24gPVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUub25NaWNyb3Rhc2tFbXB0eS5zdWJzY3JpYmUoe25leHQ6ICgpID0+IHJvb3RTY29wZS4kZGlnZXN0KCl9KTtcbiAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpOyB9KTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZSkgPT4gdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZC5yZWplY3QoZSkpO1xuICAgICAgfVxuICAgIF0pO1xuXG4gICAgcmV0dXJuIG5nMU1vZHVsZTtcbiAgfVxufVxuXG4vKipcbiAqIFN5bmNocm9ub3VzIHByb21pc2UtbGlrZSBvYmplY3QgdG8gd3JhcCBwYXJlbnQgaW5qZWN0b3JzLFxuICogdG8gcHJlc2VydmUgdGhlIHN5bmNocm9ub3VzIG5hdHVyZSBvZiBBbmd1bGFySlMncyAkY29tcGlsZS5cbiAqL1xuY2xhc3MgUGFyZW50SW5qZWN0b3JQcm9taXNlIHtcbiAgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3I7XG4gIHByaXZhdGUgY2FsbGJhY2tzOiAoKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnkpIHtcbiAgICAvLyBzdG9yZSB0aGUgcHJvbWlzZSBvbiB0aGUgZWxlbWVudFxuICAgIGVsZW1lbnQuZGF0YSAhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgdGhpcyk7XG4gIH1cblxuICB0aGVuKGNhbGxiYWNrOiAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbmplY3Rvcikge1xuICAgICAgY2FsbGJhY2sodGhpcy5pbmplY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmUoaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5pbmplY3RvciA9IGluamVjdG9yO1xuXG4gICAgLy8gcmVzZXQgdGhlIGVsZW1lbnQgZGF0YSB0byBwb2ludCB0byB0aGUgcmVhbCBpbmplY3RvclxuICAgIHRoaXMuZWxlbWVudC5kYXRhICEoY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpLCBpbmplY3Rvcik7XG5cbiAgICAvLyBjbGVhbiBvdXQgdGhlIGVsZW1lbnQgdG8gcHJldmVudCBtZW1vcnkgbGVha3NcbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsICE7XG5cbiAgICAvLyBydW4gYWxsIHRoZSBxdWV1ZWQgY2FsbGJhY2tzXG4gICAgdGhpcy5jYWxsYmFja3MuZm9yRWFjaCgoY2FsbGJhY2spID0+IGNhbGxiYWNrKGluamVjdG9yKSk7XG4gICAgdGhpcy5jYWxsYmFja3MubGVuZ3RoID0gMDtcbiAgfVxufVxuXG5cbi8qKlxuICogVXNlIGBVcGdyYWRlQWRhcHRlclJlZmAgdG8gY29udHJvbCBhIGh5YnJpZCBBbmd1bGFySlMgLyBBbmd1bGFyIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBkZXByZWNhdGVkIERlcHJlY2F0ZWQgc2luY2UgdjUuIFVzZSBgdXBncmFkZS9zdGF0aWNgIGluc3RlYWQsIHdoaWNoIGFsc28gc3VwcG9ydHNcbiAqIFtBaGVhZC1vZi1UaW1lIGNvbXBpbGF0aW9uXShndWlkZS9hb3QtY29tcGlsZXIpLlxuICovXG5leHBvcnQgY2xhc3MgVXBncmFkZUFkYXB0ZXJSZWYge1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcmVhZHlGbjogKCh1cGdyYWRlQWRhcHRlclJlZj86IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkKXxudWxsID0gbnVsbDtcblxuICBwdWJsaWMgbmcxUm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlID0gbnVsbCAhO1xuICBwdWJsaWMgbmcxSW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSA9IG51bGwgITtcbiAgcHVibGljIG5nMk1vZHVsZVJlZjogTmdNb2R1bGVSZWY8YW55PiA9IG51bGwgITtcbiAgcHVibGljIG5nMkluamVjdG9yOiBJbmplY3RvciA9IG51bGwgITtcblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYm9vdHN0cmFwRG9uZShuZ01vZHVsZVJlZjogTmdNb2R1bGVSZWY8YW55PiwgbmcxSW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSkge1xuICAgIHRoaXMubmcyTW9kdWxlUmVmID0gbmdNb2R1bGVSZWY7XG4gICAgdGhpcy5uZzJJbmplY3RvciA9IG5nTW9kdWxlUmVmLmluamVjdG9yO1xuICAgIHRoaXMubmcxSW5qZWN0b3IgPSBuZzFJbmplY3RvcjtcbiAgICB0aGlzLm5nMVJvb3RTY29wZSA9IG5nMUluamVjdG9yLmdldCgkUk9PVF9TQ09QRSk7XG4gICAgdGhpcy5fcmVhZHlGbiAmJiB0aGlzLl9yZWFkeUZuKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hpY2ggaXMgbm90aWZpZWQgdXBvbiBzdWNjZXNzZnVsIGh5YnJpZCBBbmd1bGFySlMgLyBBbmd1bGFyXG4gICAqIGFwcGxpY2F0aW9uIGhhcyBiZWVuIGJvb3RzdHJhcHBlZC5cbiAgICpcbiAgICogVGhlIGByZWFkeWAgY2FsbGJhY2sgZnVuY3Rpb24gaXMgaW52b2tlZCBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZSwgdGhlcmVmb3JlIGl0IGRvZXMgbm90XG4gICAqIHJlcXVpcmUgYSBjYWxsIHRvIGAkYXBwbHkoKWAuXG4gICAqL1xuICBwdWJsaWMgcmVhZHkoZm46ICh1cGdyYWRlQWRhcHRlclJlZjogVXBncmFkZUFkYXB0ZXJSZWYpID0+IHZvaWQpIHsgdGhpcy5fcmVhZHlGbiA9IGZuOyB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2Ugb2YgcnVubmluZyBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgIHRoaXMubmcxSW5qZWN0b3IgIS5nZXQoJFJPT1RfU0NPUEUpLiRkZXN0cm95KCk7XG4gICAgdGhpcy5uZzJNb2R1bGVSZWYgIS5kZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==