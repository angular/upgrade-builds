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
import { Compiler, Injector, NgModule, NgZone, Testability } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as angular from '../common/angular1';
import { $$TESTABILITY, $COMPILE, $INJECTOR, $ROOT_SCOPE, COMPILER_KEY, INJECTOR_KEY, LAZY_MODULE_REF, NG_ZONE_KEY } from '../common/constants';
import { downgradeComponent } from '../common/downgrade_component';
import { downgradeInjectable } from '../common/downgrade_injectable';
import { Deferred, controllerKey, onError } from '../common/util';
import { UpgradeNg1ComponentAdapterBuilder } from './upgrade_ng1_adapter';
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
 * @deprecated Deprecated since v5. Use `upgrade/static` instead, which also supports
 * [Ahead-of-Time compilation](guide/aot-compiler).
 */
export class UpgradeAdapter {
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
    bootstrap(element, modules, config) {
        this.declareNg1Module(modules);
        /** @type {?} */
        const upgrade = new UpgradeAdapterRef();
        /** @type {?} */
        const windowAngular = (/** @type {?} */ (window /** TODO #???? */) /** TODO #???? */)['angular'];
        windowAngular.resumeBootstrap = undefined;
        this.ngZone.run(() => { angular.bootstrap(element, [this.ng1Module.name], /** @type {?} */ ((config))); });
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
            /** @type {?} */ ((angular.element(element).data))(controllerKey(INJECTOR_KEY), /** @type {?} */ ((this.moduleRef)).injector); /** @type {?} */
            ((this.moduleRef)).injector.get(NgZone).run(() => { (/** @type {?} */ (upgrade))._bootstrapDone(this.moduleRef, ng1Injector); });
        }, onError);
        return upgrade;
    }
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
    downgradeNg2Provider(token) { return downgradeInjectable(token); }
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
        const ng1Module = this.ng1Module = angular.module(this.idPrefix, modules);
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
if (false) {
    /** @type {?} */
    UpgradeAdapter.prototype.idPrefix;
    /** @type {?} */
    UpgradeAdapter.prototype.downgradedComponents;
    /**
     * An internal map of ng1 components which need to up upgraded to ng2.
     *
     * We can't upgrade until injector is instantiated and we can retrieve the component metadata.
     * For this reason we keep a list of components to upgrade until ng1 injector is bootstrapped.
     *
     * \@internal
     * @type {?}
     */
    UpgradeAdapter.prototype.ng1ComponentsToBeUpgraded;
    /** @type {?} */
    UpgradeAdapter.prototype.upgradedProviders;
    /** @type {?} */
    UpgradeAdapter.prototype.ngZone;
    /** @type {?} */
    UpgradeAdapter.prototype.ng1Module;
    /** @type {?} */
    UpgradeAdapter.prototype.moduleRef;
    /** @type {?} */
    UpgradeAdapter.prototype.ng2BootstrapDeferred;
    /** @type {?} */
    UpgradeAdapter.prototype.ng2AppModule;
    /** @type {?} */
    UpgradeAdapter.prototype.compilerOptions;
}
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of AngularJS's $compile.
 */
class ParentInjectorPromise {
    /**
     * @param {?} element
     */
    constructor(element) {
        this.element = element;
        this.callbacks = [];
        /** @type {?} */ ((
        // store the promise on the element
        element.data))(controllerKey(INJECTOR_KEY), this);
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
        // reset the element data to point to the real injector
        this.element.data))(controllerKey(INJECTOR_KEY), injector);
        // clean out the element to prevent memory leaks
        this.element = /** @type {?} */ ((null));
        // run all the queued callbacks
        this.callbacks.forEach((callback) => callback(injector));
        this.callbacks.length = 0;
    }
}
if (false) {
    /** @type {?} */
    ParentInjectorPromise.prototype.injector;
    /** @type {?} */
    ParentInjectorPromise.prototype.callbacks;
    /** @type {?} */
    ParentInjectorPromise.prototype.element;
}
/**
 * Use `UpgradeAdapterRef` to control a hybrid AngularJS / Angular application.
 *
 * @deprecated Deprecated since v5. Use `upgrade/static` instead, which also supports
 * [Ahead-of-Time compilation](guide/aot-compiler).
 */
export class UpgradeAdapterRef {
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
if (false) {
    /** @type {?} */
    UpgradeAdapterRef.prototype._readyFn;
    /** @type {?} */
    UpgradeAdapterRef.prototype.ng1RootScope;
    /** @type {?} */
    UpgradeAdapterRef.prototype.ng1Injector;
    /** @type {?} */
    UpgradeAdapterRef.prototype.ng2ModuleRef;
    /** @type {?} */
    UpgradeAdapterRef.prototype.ng2Injector;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL2R5bmFtaWMvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFFBQVEsRUFBOEIsUUFBUSxFQUFFLFFBQVEsRUFBZSxNQUFNLEVBQWtCLFdBQVcsRUFBTyxNQUFNLGVBQWUsQ0FBQztBQUMvSSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUV6RSxPQUFPLEtBQUssT0FBTyxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDOUksT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sK0JBQStCLENBQUM7QUFDakUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDbkUsT0FBTyxFQUFDLFFBQVEsRUFBaUIsYUFBYSxFQUFFLE9BQU8sRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRS9FLE9BQU8sRUFBQyxpQ0FBaUMsRUFBQyxNQUFNLHVCQUF1QixDQUFDOztBQUV4RSxJQUFJLFlBQVksR0FBVyxDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtGN0IsTUFBTTs7Ozs7SUFxQkosWUFBb0IsWUFBdUIsRUFBVSxlQUFpQztRQUFsRSxpQkFBWSxHQUFaLFlBQVksQ0FBVztRQUFVLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjt3QkFwQjNELGVBQWUsWUFBWSxFQUFFLEdBQUc7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LFdBQVcsQ0FBQztRQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7SUFVaEMsS0FBSyxDQUFDLEVBQWtELElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7Ozs7O0lBSy9FLE9BQU87MkJBQ1osSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsV0FBVyxFQUFFLFFBQVE7VUFDNUMsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPOztDQUU5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21waWxlciwgQ29tcGlsZXJPcHRpb25zLCBEaXJlY3RpdmUsIEluamVjdG9yLCBOZ01vZHVsZSwgTmdNb2R1bGVSZWYsIE5nWm9uZSwgU3RhdGljUHJvdmlkZXIsIFRlc3RhYmlsaXR5LCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7cGxhdGZvcm1Ccm93c2VyRHluYW1pY30gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci1keW5hbWljJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi9jb21tb24vYW5ndWxhcjEnO1xuaW1wb3J0IHskJFRFU1RBQklMSVRZLCAkQ09NUElMRSwgJElOSkVDVE9SLCAkUk9PVF9TQ09QRSwgQ09NUElMRVJfS0VZLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgTkdfWk9ORV9LRVl9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHtkb3duZ3JhZGVDb21wb25lbnR9IGZyb20gJy4uL2NvbW1vbi9kb3duZ3JhZGVfY29tcG9uZW50JztcbmltcG9ydCB7ZG93bmdyYWRlSW5qZWN0YWJsZX0gZnJvbSAnLi4vY29tbW9uL2Rvd25ncmFkZV9pbmplY3RhYmxlJztcbmltcG9ydCB7RGVmZXJyZWQsIExhenlNb2R1bGVSZWYsIGNvbnRyb2xsZXJLZXksIG9uRXJyb3J9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuaW1wb3J0IHtVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9IGZyb20gJy4vdXBncmFkZV9uZzFfYWRhcHRlcic7XG5cbmxldCB1cGdyYWRlQ291bnQ6IG51bWJlciA9IDA7XG5cbi8qKlxuICogVXNlIGBVcGdyYWRlQWRhcHRlcmAgdG8gYWxsb3cgQW5ndWxhckpTIGFuZCBBbmd1bGFyIHRvIGNvZXhpc3QgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogVGhlIGBVcGdyYWRlQWRhcHRlcmAgYWxsb3dzOlxuICogMS4gY3JlYXRpb24gb2YgQW5ndWxhciBjb21wb25lbnQgZnJvbSBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZVxuICogICAgKFNlZSBbVXBncmFkZUFkYXB0ZXIjdXBncmFkZU5nMUNvbXBvbmVudCgpXSlcbiAqIDIuIGNyZWF0aW9uIG9mIEFuZ3VsYXJKUyBkaXJlY3RpdmUgZnJvbSBBbmd1bGFyIGNvbXBvbmVudC5cbiAqICAgIChTZWUgW1VwZ3JhZGVBZGFwdGVyI2Rvd25ncmFkZU5nMkNvbXBvbmVudCgpXSlcbiAqIDMuIEJvb3RzdHJhcHBpbmcgb2YgYSBoeWJyaWQgQW5ndWxhciBhcHBsaWNhdGlvbiB3aGljaCBjb250YWlucyBib3RoIG9mIHRoZSBmcmFtZXdvcmtzXG4gKiAgICBjb2V4aXN0aW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIE1lbnRhbCBNb2RlbFxuICpcbiAqIFdoZW4gcmVhc29uaW5nIGFib3V0IGhvdyBhIGh5YnJpZCBhcHBsaWNhdGlvbiB3b3JrcyBpdCBpcyB1c2VmdWwgdG8gaGF2ZSBhIG1lbnRhbCBtb2RlbCB3aGljaFxuICogZGVzY3JpYmVzIHdoYXQgaXMgaGFwcGVuaW5nIGFuZCBleHBsYWlucyB3aGF0IGlzIGhhcHBlbmluZyBhdCB0aGUgbG93ZXN0IGxldmVsLlxuICpcbiAqIDEuIFRoZXJlIGFyZSB0d28gaW5kZXBlbmRlbnQgZnJhbWV3b3JrcyBydW5uaW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLCBlYWNoIGZyYW1ld29yayB0cmVhdHNcbiAqICAgIHRoZSBvdGhlciBhcyBhIGJsYWNrIGJveC5cbiAqIDIuIEVhY2ggRE9NIGVsZW1lbnQgb24gdGhlIHBhZ2UgaXMgb3duZWQgZXhhY3RseSBieSBvbmUgZnJhbWV3b3JrLiBXaGljaGV2ZXIgZnJhbWV3b3JrXG4gKiAgICBpbnN0YW50aWF0ZWQgdGhlIGVsZW1lbnQgaXMgdGhlIG93bmVyLiBFYWNoIGZyYW1ld29yayBvbmx5IHVwZGF0ZXMvaW50ZXJhY3RzIHdpdGggaXRzIG93blxuICogICAgRE9NIGVsZW1lbnRzIGFuZCBpZ25vcmVzIG90aGVycy5cbiAqIDMuIEFuZ3VsYXJKUyBkaXJlY3RpdmVzIGFsd2F5cyBleGVjdXRlIGluc2lkZSBBbmd1bGFySlMgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDQuIEFuZ3VsYXIgY29tcG9uZW50cyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgQW5ndWxhciBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNS4gQW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYW4gYmUgdXBncmFkZWQgdG8gYW4gQW5ndWxhciBjb21wb25lbnQuIFRoaXMgY3JlYXRlcyBhblxuICogICAgQW5ndWxhciBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXJKUyBjb21wb25lbnQgZGlyZWN0aXZlIGluIHRoYXQgbG9jYXRpb24uXG4gKiA2LiBBbiBBbmd1bGFyIGNvbXBvbmVudCBjYW4gYmUgZG93bmdyYWRlZCB0byBhbiBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZS4gVGhpcyBjcmVhdGVzXG4gKiAgICBhbiBBbmd1bGFySlMgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFyIGNvbXBvbmVudCBpbiB0aGF0IGxvY2F0aW9uLlxuICogNy4gV2hlbmV2ZXIgYW4gYWRhcHRlciBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnkgdGhlIGZyYW1ld29ya1xuICogICAgZG9pbmcgdGhlIGluc3RhbnRpYXRpb24uIFRoZSBvdGhlciBmcmFtZXdvcmsgdGhlbiBpbnN0YW50aWF0ZXMgYW5kIG93bnMgdGhlIHZpZXcgZm9yIHRoYXRcbiAqICAgIGNvbXBvbmVudC4gVGhpcyBpbXBsaWVzIHRoYXQgY29tcG9uZW50IGJpbmRpbmdzIHdpbGwgYWx3YXlzIGZvbGxvdyB0aGUgc2VtYW50aWNzIG9mIHRoZVxuICogICAgaW5zdGFudGlhdGlvbiBmcmFtZXdvcmsuIFRoZSBzeW50YXggaXMgYWx3YXlzIHRoYXQgb2YgQW5ndWxhciBzeW50YXguXG4gKiA4LiBBbmd1bGFySlMgaXMgYWx3YXlzIGJvb3RzdHJhcHBlZCBmaXJzdCBhbmQgb3ducyB0aGUgYm90dG9tIG1vc3Qgdmlldy5cbiAqIDkuIFRoZSBuZXcgYXBwbGljYXRpb24gaXMgcnVubmluZyBpbiBBbmd1bGFyIHpvbmUsIGFuZCB0aGVyZWZvcmUgaXQgbm8gbG9uZ2VyIG5lZWRzIGNhbGxzIHRvXG4gKiAgICBgJGFwcGx5KClgLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpLCBteUNvbXBpbGVyT3B0aW9ucyk7XG4gKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyQ29tcCcsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMkNvbXBvbmVudCkpO1xuICpcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMUhlbGxvJywgZnVuY3Rpb24oKSB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgIHNjb3BlOiB7IHRpdGxlOiAnPScgfSxcbiAqICAgICAgdGVtcGxhdGU6ICduZzFbSGVsbG8ge3t0aXRsZX19IV0oPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+KSdcbiAqICAgfTtcbiAqIH0pO1xuICpcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICduZzItY29tcCcsXG4gKiAgIGlucHV0czogWyduYW1lJ10sXG4gKiAgIHRlbXBsYXRlOiAnbmcyWzxuZzEtaGVsbG8gW3RpdGxlXT1cIm5hbWVcIj50cmFuc2NsdWRlPC9uZzEtaGVsbG8+XSg8bmctY29udGVudD48L25nLWNvbnRlbnQ+KScsXG4gKiAgIGRpcmVjdGl2ZXM6XG4gKiB9KVxuICogY2xhc3MgTmcyQ29tcG9uZW50IHtcbiAqIH1cbiAqXG4gKiBATmdNb2R1bGUoe1xuICogICBkZWNsYXJhdGlvbnM6IFtOZzJDb21wb25lbnQsIGFkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnbmcxSGVsbG8nKV0sXG4gKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICogfSlcbiAqIGNsYXNzIE15TmcyTW9kdWxlIHt9XG4gKlxuICpcbiAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxuZzItY29tcCBuYW1lPVwiV29ybGRcIj5wcm9qZWN0PC9uZzItY29tcD4nO1xuICpcbiAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcbiAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAqIH0pO1xuICpcbiAqIGBgYFxuICpcbiAqIEBkZXByZWNhdGVkIERlcHJlY2F0ZWQgc2luY2UgdjUuIFVzZSBgdXBncmFkZS9zdGF0aWNgIGluc3RlYWQsIHdoaWNoIGFsc28gc3VwcG9ydHNcbiAqIFtBaGVhZC1vZi1UaW1lIGNvbXBpbGF0aW9uXShndWlkZS9hb3QtY29tcGlsZXIpLlxuICovXG5leHBvcnQgY2xhc3MgVXBncmFkZUFkYXB0ZXIge1xuICBwcml2YXRlIGlkUHJlZml4OiBzdHJpbmcgPSBgTkcyX1VQR1JBREVfJHt1cGdyYWRlQ291bnQrK31fYDtcbiAgcHJpdmF0ZSBkb3duZ3JhZGVkQ29tcG9uZW50czogVHlwZTxhbnk+W10gPSBbXTtcbiAgLyoqXG4gICAqIEFuIGludGVybmFsIG1hcCBvZiBuZzEgY29tcG9uZW50cyB3aGljaCBuZWVkIHRvIHVwIHVwZ3JhZGVkIHRvIG5nMi5cbiAgICpcbiAgICogV2UgY2FuJ3QgdXBncmFkZSB1bnRpbCBpbmplY3RvciBpcyBpbnN0YW50aWF0ZWQgYW5kIHdlIGNhbiByZXRyaWV2ZSB0aGUgY29tcG9uZW50IG1ldGFkYXRhLlxuICAgKiBGb3IgdGhpcyByZWFzb24gd2Uga2VlcCBhIGxpc3Qgb2YgY29tcG9uZW50cyB0byB1cGdyYWRlIHVudGlsIG5nMSBpbmplY3RvciBpcyBib290c3RyYXBwZWQuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcHJpdmF0ZSBuZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkOiB7W25hbWU6IHN0cmluZ106IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0gPSB7fTtcbiAgcHJpdmF0ZSB1cGdyYWRlZFByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtdO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBuZ1pvbmUgITogTmdab25lO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBuZzFNb2R1bGUgITogYW5ndWxhci5JTW9kdWxlO1xuICBwcml2YXRlIG1vZHVsZVJlZjogTmdNb2R1bGVSZWY8YW55PnxudWxsID0gbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgbmcyQm9vdHN0cmFwRGVmZXJyZWQgITogRGVmZXJyZWQ8YW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlPjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5nMkFwcE1vZHVsZTogVHlwZTxhbnk+LCBwcml2YXRlIGNvbXBpbGVyT3B0aW9ucz86IENvbXBpbGVyT3B0aW9ucykge1xuICAgIGlmICghbmcyQXBwTW9kdWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1VwZ3JhZGVBZGFwdGVyIGNhbm5vdCBiZSBpbnN0YW50aWF0ZWQgd2l0aG91dCBhbiBOZ01vZHVsZSBvZiB0aGUgQW5ndWxhciBhcHAuJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFyIENvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTLlxuICAgKlxuICAgKiBVc2UgYGRvd25ncmFkZU5nMkNvbXBvbmVudGAgdG8gY3JlYXRlIGFuIEFuZ3VsYXJKUyBEaXJlY3RpdmUgRGVmaW5pdGlvbiBGYWN0b3J5IGZyb21cbiAgICogQW5ndWxhciBDb21wb25lbnQuIFRoZSBhZGFwdGVyIHdpbGwgYm9vdHN0cmFwIEFuZ3VsYXIgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZVxuICAgKiBBbmd1bGFySlMgdGVtcGxhdGUuXG4gICAqXG4gICAqICMjIE1lbnRhbCBNb2RlbFxuICAgKlxuICAgKiAxLiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBieSBiZWluZyBsaXN0ZWQgaW4gQW5ndWxhckpTIHRlbXBsYXRlLiBUaGlzIG1lYW5zIHRoYXQgdGhlXG4gICAqICAgIGhvc3QgZWxlbWVudCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXJKUywgYnV0IHRoZSBjb21wb25lbnQncyB2aWV3IHdpbGwgYmUgY29udHJvbGxlZCBieVxuICAgKiAgICBBbmd1bGFyLlxuICAgKiAyLiBFdmVuIHRob3VnaHQgdGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgaW4gQW5ndWxhckpTLCBpdCB3aWxsIGJlIHVzaW5nIEFuZ3VsYXJcbiAgICogICAgc3ludGF4LiBUaGlzIGhhcyB0byBiZSBkb25lLCB0aGlzIHdheSBiZWNhdXNlIHdlIG11c3QgZm9sbG93IEFuZ3VsYXIgY29tcG9uZW50cyBkbyBub3RcbiAgICogICAgZGVjbGFyZSBob3cgdGhlIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIGludGVycHJldGVkLlxuICAgKiAzLiBgbmctbW9kZWxgIGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhckpTIGFuZCBjb21tdW5pY2F0ZXMgd2l0aCB0aGUgZG93bmdyYWRlZCBBbmd1bGFyIGNvbXBvbmVudFxuICAgKiAgICBieSB3YXkgb2YgdGhlIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgaW50ZXJmYWNlIGZyb20gQGFuZ3VsYXIvZm9ybXMuIE9ubHkgY29tcG9uZW50cyB0aGF0XG4gICAqICAgIGltcGxlbWVudCB0aGlzIGludGVyZmFjZSBhcmUgZWxpZ2libGUuXG4gICAqXG4gICAqICMjIFN1cHBvcnRlZCBGZWF0dXJlc1xuICAgKlxuICAgKiAtIEJpbmRpbmdzOlxuICAgKiAgIC0gQXR0cmlidXRlOiBgPGNvbXAgbmFtZT1cIldvcmxkXCI+YFxuICAgKiAgIC0gSW50ZXJwb2xhdGlvbjogIGA8Y29tcCBncmVldGluZz1cIkhlbGxvIHt7bmFtZX19IVwiPmBcbiAgICogICAtIEV4cHJlc3Npb246ICBgPGNvbXAgW25hbWVdPVwidXNlcm5hbWVcIj5gXG4gICAqICAgLSBFdmVudDogIGA8Y29tcCAoY2xvc2UpPVwiZG9Tb21ldGhpbmcoKVwiPmBcbiAgICogICAtIG5nLW1vZGVsOiBgPGNvbXAgbmctbW9kZWw9XCJuYW1lXCI+YFxuICAgKiAtIENvbnRlbnQgcHJvamVjdGlvbjogeWVzXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChHcmVldGVyKSk7XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICAgKiAgIHRlbXBsYXRlOiAne3tzYWx1dGF0aW9ufX0ge3tuYW1lfX0hIC0gPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PidcbiAgICogfSlcbiAgICogY2xhc3MgR3JlZXRlciB7XG4gICAqICAgQElucHV0KCkgc2FsdXRhdGlvbjogc3RyaW5nO1xuICAgKiAgIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW0dyZWV0ZXJdLFxuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9XG4gICAqICAgJ25nMSB0ZW1wbGF0ZTogPGdyZWV0IHNhbHV0YXRpb249XCJIZWxsb1wiIFtuYW1lXT1cIndvcmxkXCI+dGV4dDwvZ3JlZXQ+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXCJuZzEgdGVtcGxhdGU6IEhlbGxvIHdvcmxkISAtIHRleHRcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGRvd25ncmFkZU5nMkNvbXBvbmVudChjb21wb25lbnQ6IFR5cGU8YW55Pik6IEZ1bmN0aW9uIHtcbiAgICB0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcblxuICAgIHJldHVybiBkb3duZ3JhZGVDb21wb25lbnQoe2NvbXBvbmVudH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgQ29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFyLlxuICAgKlxuICAgKiBVc2UgYHVwZ3JhZGVOZzFDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyBDb21wb25lbnRcbiAgICogZGlyZWN0aXZlLiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFySlMgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZSBBbmd1bGFyXG4gICAqIHRlbXBsYXRlLlxuICAgKlxuICAgKiAjIyBNZW50YWwgTW9kZWxcbiAgICpcbiAgICogMS4gVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgYnkgYmVpbmcgbGlzdGVkIGluIEFuZ3VsYXIgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhciwgYnV0IHRoZSBjb21wb25lbnQncyB2aWV3IHdpbGwgYmUgY29udHJvbGxlZCBieVxuICAgKiAgICBBbmd1bGFySlMuXG4gICAqXG4gICAqICMjIFN1cHBvcnRlZCBGZWF0dXJlc1xuICAgKlxuICAgKiAtIEJpbmRpbmdzOlxuICAgKiAgIC0gQXR0cmlidXRlOiBgPGNvbXAgbmFtZT1cIldvcmxkXCI+YFxuICAgKiAgIC0gSW50ZXJwb2xhdGlvbjogIGA8Y29tcCBncmVldGluZz1cIkhlbGxvIHt7bmFtZX19IVwiPmBcbiAgICogICAtIEV4cHJlc3Npb246ICBgPGNvbXAgW25hbWVdPVwidXNlcm5hbWVcIj5gXG4gICAqICAgLSBFdmVudDogIGA8Y29tcCAoY2xvc2UpPVwiZG9Tb21ldGhpbmcoKVwiPmBcbiAgICogLSBUcmFuc2NsdXNpb246IHllc1xuICAgKiAtIE9ubHkgc29tZSBvZiB0aGUgZmVhdHVyZXMgb2ZcbiAgICogICBbRGlyZWN0aXZlIERlZmluaXRpb24gT2JqZWN0XShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZS8kY29tcGlsZSkgYXJlXG4gICAqICAgc3VwcG9ydGVkOlxuICAgKiAgIC0gYGNvbXBpbGVgOiBub3Qgc3VwcG9ydGVkIGJlY2F1c2UgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieSBBbmd1bGFyLCB3aGljaCBkb2VzXG4gICAqICAgICBub3QgYWxsb3cgbW9kaWZ5aW5nIERPTSBzdHJ1Y3R1cmUgZHVyaW5nIGNvbXBpbGF0aW9uLlxuICAgKiAgIC0gYGNvbnRyb2xsZXJgOiBzdXBwb3J0ZWQuIChOT1RFOiBpbmplY3Rpb24gb2YgYCRhdHRyc2AgYW5kIGAkdHJhbnNjbHVkZWAgaXMgbm90IHN1cHBvcnRlZC4pXG4gICAqICAgLSBgY29udHJvbGxlckFzYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYGJpbmRUb0NvbnRyb2xsZXJgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgbGlua2A6IHN1cHBvcnRlZC4gKE5PVEU6IG9ubHkgcHJlLWxpbmsgZnVuY3Rpb24gaXMgc3VwcG9ydGVkLilcbiAgICogICAtIGBuYW1lYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHByaW9yaXR5YDogaWdub3JlZC5cbiAgICogICAtIGByZXBsYWNlYDogbm90IHN1cHBvcnRlZC5cbiAgICogICAtIGByZXF1aXJlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHJlc3RyaWN0YDogbXVzdCBiZSBzZXQgdG8gJ0UnLlxuICAgKiAgIC0gYHNjb3BlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlbXBsYXRlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlbXBsYXRlVXJsYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlcm1pbmFsYDogaWdub3JlZC5cbiAgICogICAtIGB0cmFuc2NsdWRlYDogc3VwcG9ydGVkLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihmb3J3YXJkUmVmKCgpID0+IE15TmcyTW9kdWxlKSk7XG4gICAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ2dyZWV0JywgZnVuY3Rpb24oKSB7XG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgIHNjb3BlOiB7c2FsdXRhdGlvbjogJz0nLCBuYW1lOiAnPScgfSxcbiAgICogICAgIHRlbXBsYXRlOiAne3tzYWx1dGF0aW9ufX0ge3tuYW1lfX0hIC0gPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+J1xuICAgKiAgIH07XG4gICAqIH0pO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzJDb21wb25lbnQpKTtcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICduZzInLFxuICAgKiAgIHRlbXBsYXRlOiAnbmcyIHRlbXBsYXRlOiA8Z3JlZXQgc2FsdXRhdGlvbj1cIkhlbGxvXCIgW25hbWVdPVwid29ybGRcIj50ZXh0PC9ncmVldD4nXG4gICAqIH0pXG4gICAqIGNsYXNzIE5nMkNvbXBvbmVudCB7XG4gICAqIH1cbiAgICpcbiAgICogQE5nTW9kdWxlKHtcbiAgICogICBkZWNsYXJhdGlvbnM6IFtOZzJDb21wb25lbnQsIGFkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnZ3JlZXQnKV0sXG4gICAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmcyTW9kdWxlIHt9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxuZzI+PC9uZzI+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXCJuZzIgdGVtcGxhdGU6IEhlbGxvIHdvcmxkISAtIHRleHRcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIHVwZ3JhZGVOZzFDb21wb25lbnQobmFtZTogc3RyaW5nKTogVHlwZTxhbnk+IHtcbiAgICBpZiAoKDxhbnk+dGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkKS5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMubmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZFtuYW1lXS50eXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRoaXMubmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZFtuYW1lXSA9IG5ldyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIobmFtZSkpXG4gICAgICAgICAgLnR5cGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyB0aGUgYWRhcHRlcidzIEFuZ3VsYXJKUyB1cGdyYWRlIG1vZHVsZSBmb3IgdW5pdCB0ZXN0aW5nIGluIEFuZ3VsYXJKUy5cbiAgICogVXNlIHRoaXMgaW5zdGVhZCBvZiBgYW5ndWxhci5tb2NrLm1vZHVsZSgpYCB0byBsb2FkIHRoZSB1cGdyYWRlIG1vZHVsZSBpbnRvXG4gICAqIHRoZSBBbmd1bGFySlMgdGVzdGluZyBpbmplY3Rvci5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IHVwZ3JhZGVBZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICpcbiAgICogLy8gY29uZmlndXJlIHRoZSBhZGFwdGVyIHdpdGggdXBncmFkZS9kb3duZ3JhZGUgY29tcG9uZW50cyBhbmQgc2VydmljZXNcbiAgICogdXBncmFkZUFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE15Q29tcG9uZW50KTtcbiAgICpcbiAgICogbGV0IHVwZ3JhZGVBZGFwdGVyUmVmOiBVcGdyYWRlQWRhcHRlclJlZjtcbiAgICogbGV0ICRjb21waWxlLCAkcm9vdFNjb3BlO1xuICAgKlxuICAgKiAvLyBXZSBtdXN0IHJlZ2lzdGVyIHRoZSBhZGFwdGVyIGJlZm9yZSBhbnkgY2FsbHMgdG8gYGluamVjdCgpYFxuICAgKiBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICogICB1cGdyYWRlQWRhcHRlclJlZiA9IHVwZ3JhZGVBZGFwdGVyLnJlZ2lzdGVyRm9yTmcxVGVzdHMoWydoZXJvQXBwJ10pO1xuICAgKiB9KTtcbiAgICpcbiAgICogYmVmb3JlRWFjaChpbmplY3QoKF8kY29tcGlsZV8sIF8kcm9vdFNjb3BlXykgPT4ge1xuICAgKiAgICRjb21waWxlID0gXyRjb21waWxlXztcbiAgICogICAkcm9vdFNjb3BlID0gXyRyb290U2NvcGVfO1xuICAgKiB9KSk7XG4gICAqXG4gICAqIGl0KFwic2F5cyBoZWxsb1wiLCAoZG9uZSkgPT4ge1xuICAgKiAgIHVwZ3JhZGVBZGFwdGVyUmVmLnJlYWR5KCgpID0+IHtcbiAgICogICAgIGNvbnN0IGVsZW1lbnQgPSAkY29tcGlsZShcIjxteS1jb21wb25lbnQ+PC9teS1jb21wb25lbnQ+XCIpKCRyb290U2NvcGUpO1xuICAgKiAgICAgJHJvb3RTY29wZS4kYXBwbHkoKTtcbiAgICogICAgIGV4cGVjdChlbGVtZW50Lmh0bWwoKSkudG9Db250YWluKFwiSGVsbG8gV29ybGRcIik7XG4gICAqICAgICBkb25lKCk7XG4gICAqICAgfSlcbiAgICogfSk7XG4gICAqXG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlcyBhbnkgQW5ndWxhckpTIG1vZHVsZXMgdGhhdCB0aGUgdXBncmFkZSBtb2R1bGUgc2hvdWxkIGRlcGVuZCB1cG9uXG4gICAqIEByZXR1cm5zIGFuIGBVcGdyYWRlQWRhcHRlclJlZmAsIHdoaWNoIGxldHMgeW91IHJlZ2lzdGVyIGEgYHJlYWR5KClgIGNhbGxiYWNrIHRvXG4gICAqIHJ1biBhc3NlcnRpb25zIG9uY2UgdGhlIEFuZ3VsYXIgY29tcG9uZW50cyBhcmUgcmVhZHkgdG8gdGVzdCB0aHJvdWdoIEFuZ3VsYXJKUy5cbiAgICovXG4gIHJlZ2lzdGVyRm9yTmcxVGVzdHMobW9kdWxlcz86IHN0cmluZ1tdKTogVXBncmFkZUFkYXB0ZXJSZWYge1xuICAgIGNvbnN0IHdpbmRvd05nTW9jayA9ICh3aW5kb3cgYXMgYW55KVsnYW5ndWxhciddLm1vY2s7XG4gICAgaWYgKCF3aW5kb3dOZ01vY2sgfHwgIXdpbmRvd05nTW9jay5tb2R1bGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZpbmQgXFwnYW5ndWxhci5tb2NrLm1vZHVsZVxcJy4nKTtcbiAgICB9XG4gICAgdGhpcy5kZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXMpO1xuICAgIHdpbmRvd05nTW9jay5tb2R1bGUodGhpcy5uZzFNb2R1bGUubmFtZSk7XG4gICAgY29uc3QgdXBncmFkZSA9IG5ldyBVcGdyYWRlQWRhcHRlclJlZigpO1xuICAgIHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucHJvbWlzZS50aGVuKFxuICAgICAgICAobmcxSW5qZWN0b3IpID0+IHsgKDxhbnk+dXBncmFkZSkuX2Jvb3RzdHJhcERvbmUodGhpcy5tb2R1bGVSZWYsIG5nMUluamVjdG9yKTsgfSwgb25FcnJvcik7XG4gICAgcmV0dXJuIHVwZ3JhZGU7XG4gIH1cblxuICAvKipcbiAgICogQm9vdHN0cmFwIGEgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXIgYXBwbGljYXRpb24uXG4gICAqXG4gICAqIFRoaXMgYGJvb3RzdHJhcGAgbWV0aG9kIGlzIGEgZGlyZWN0IHJlcGxhY2VtZW50ICh0YWtlcyBzYW1lIGFyZ3VtZW50cykgZm9yIEFuZ3VsYXJKU1xuICAgKiBbYGJvb3RzdHJhcGBdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9mdW5jdGlvbi9hbmd1bGFyLmJvb3RzdHJhcCkgbWV0aG9kLiBVbmxpa2VcbiAgICogQW5ndWxhckpTLCB0aGlzIGJvb3RzdHJhcCBpcyBhc3luY2hyb25vdXMuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyKSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMScsIGZ1bmN0aW9uKCkge1xuICAgKiAgIHJldHVybiB7XG4gICAqICAgICAgc2NvcGU6IHsgdGl0bGU6ICc9JyB9LFxuICAgKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbmcyJyxcbiAgICogICBpbnB1dHM6IFsnbmFtZSddLFxuICAgKiAgIHRlbXBsYXRlOiAnbmcyWzxuZzEgW3RpdGxlXT1cIm5hbWVcIj50cmFuc2NsdWRlPC9uZzE+XSg8bmctY29udGVudD48L25nLWNvbnRlbnQ+KSdcbiAgICogfSlcbiAgICogY2xhc3MgTmcyIHtcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW05nMiwgYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCduZzEnKV0sXG4gICAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmcyTW9kdWxlIHt9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxuZzIgbmFtZT1cIldvcmxkXCI+cHJvamVjdDwvbmcyPic7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFxuICAgKiAgICAgICBcIm5nMltuZzFbSGVsbG8gV29ybGQhXSh0cmFuc2NsdWRlKV0ocHJvamVjdClcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGJvb3RzdHJhcChlbGVtZW50OiBFbGVtZW50LCBtb2R1bGVzPzogYW55W10sIGNvbmZpZz86IGFuZ3VsYXIuSUFuZ3VsYXJCb290c3RyYXBDb25maWcpOlxuICAgICAgVXBncmFkZUFkYXB0ZXJSZWYge1xuICAgIHRoaXMuZGVjbGFyZU5nMU1vZHVsZShtb2R1bGVzKTtcblxuICAgIGNvbnN0IHVwZ3JhZGUgPSBuZXcgVXBncmFkZUFkYXB0ZXJSZWYoKTtcblxuICAgIC8vIE1ha2Ugc3VyZSByZXN1bWVCb290c3RyYXAoKSBvbmx5IGV4aXN0cyBpZiB0aGUgY3VycmVudCBib290c3RyYXAgaXMgZGVmZXJyZWRcbiAgICBjb25zdCB3aW5kb3dBbmd1bGFyID0gKHdpbmRvdyBhcyBhbnkgLyoqIFRPRE8gIz8/Pz8gKi8pWydhbmd1bGFyJ107XG4gICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4geyBhbmd1bGFyLmJvb3RzdHJhcChlbGVtZW50LCBbdGhpcy5uZzFNb2R1bGUubmFtZV0sIGNvbmZpZyAhKTsgfSk7XG4gICAgY29uc3QgbmcxQm9vdHN0cmFwUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAod2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXApIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxSZXN1bWVCb290c3RyYXA6ICgpID0+IHZvaWQgPSB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcDtcbiAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICAgIGNvbnN0IHIgPSB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIFByb21pc2UuYWxsKFt0aGlzLm5nMkJvb3RzdHJhcERlZmVycmVkLnByb21pc2UsIG5nMUJvb3RzdHJhcFByb21pc2VdKS50aGVuKChbbmcxSW5qZWN0b3JdKSA9PiB7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoZWxlbWVudCkuZGF0YSAhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgdGhpcy5tb2R1bGVSZWYgIS5pbmplY3Rvcik7XG4gICAgICB0aGlzLm1vZHVsZVJlZiAhLmluamVjdG9yLmdldDxOZ1pvbmU+KE5nWm9uZSkucnVuKFxuICAgICAgICAgICgpID0+IHsgKDxhbnk+dXBncmFkZSkuX2Jvb3RzdHJhcERvbmUodGhpcy5tb2R1bGVSZWYsIG5nMUluamVjdG9yKTsgfSk7XG4gICAgfSwgb25FcnJvcik7XG4gICAgcmV0dXJuIHVwZ3JhZGU7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXJKUyBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFyLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgTG9naW4geyAuLi4gfVxuICAgKiBjbGFzcyBTZXJ2ZXIgeyAuLi4gfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEV4YW1wbGUge1xuICAgKiAgIGNvbnN0cnVjdG9yKEBJbmplY3QoJ3NlcnZlcicpIHNlcnZlciwgbG9naW46IExvZ2luKSB7XG4gICAqICAgICAuLi5cbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLnNlcnZpY2UoJ3NlcnZlcicsIFNlcnZlcik7XG4gICAqIG1vZHVsZS5zZXJ2aWNlKCdsb2dpbicsIExvZ2luKTtcbiAgICpcbiAgICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqIGFkYXB0ZXIudXBncmFkZU5nMVByb3ZpZGVyKCdzZXJ2ZXInKTtcbiAgICogYWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIoJ2xvZ2luJywge2FzVG9rZW46IExvZ2lufSk7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KChyZWYpID0+IHtcbiAgICogICBjb25zdCBleGFtcGxlOiBFeGFtcGxlID0gcmVmLm5nMkluamVjdG9yLmdldChFeGFtcGxlKTtcbiAgICogfSk7XG4gICAqXG4gICAqIGBgYFxuICAgKi9cbiAgdXBncmFkZU5nMVByb3ZpZGVyKG5hbWU6IHN0cmluZywgb3B0aW9ucz86IHthc1Rva2VuOiBhbnl9KSB7XG4gICAgY29uc3QgdG9rZW4gPSBvcHRpb25zICYmIG9wdGlvbnMuYXNUb2tlbiB8fCBuYW1lO1xuICAgIHRoaXMudXBncmFkZWRQcm92aWRlcnMucHVzaCh7XG4gICAgICBwcm92aWRlOiB0b2tlbixcbiAgICAgIHVzZUZhY3Rvcnk6ICgkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSkgPT4gJGluamVjdG9yLmdldChuYW1lKSxcbiAgICAgIGRlcHM6IFskSU5KRUNUT1JdXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXIgc2VydmljZSB0byBiZSBhY2Nlc3NpYmxlIGZyb20gQW5ndWxhckpTLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgRXhhbXBsZSB7XG4gICAqIH1cbiAgICpcbiAgICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqXG4gICAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5mYWN0b3J5KCdleGFtcGxlJywgYWRhcHRlci5kb3duZ3JhZGVOZzJQcm92aWRlcihFeGFtcGxlKSk7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KChyZWYpID0+IHtcbiAgICogICBjb25zdCBleGFtcGxlOiBFeGFtcGxlID0gcmVmLm5nMUluamVjdG9yLmdldCgnZXhhbXBsZScpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBkb3duZ3JhZGVOZzJQcm92aWRlcih0b2tlbjogYW55KTogRnVuY3Rpb24geyByZXR1cm4gZG93bmdyYWRlSW5qZWN0YWJsZSh0b2tlbik7IH1cblxuICAvKipcbiAgICogRGVjbGFyZSB0aGUgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIGZvciB0aGlzIGFkYXB0ZXIgd2l0aG91dCBib290c3RyYXBwaW5nIHRoZSB3aG9sZVxuICAgKiBoeWJyaWQgYXBwbGljYXRpb24uXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGF1dG9tYXRpY2FsbHkgY2FsbGVkIGJ5IGBib290c3RyYXAoKWAgYW5kIGByZWdpc3RlckZvck5nMVRlc3RzKClgLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlcyBUaGUgQW5ndWxhckpTIG1vZHVsZXMgdGhhdCB0aGlzIHVwZ3JhZGUgbW9kdWxlIHNob3VsZCBkZXBlbmQgdXBvbi5cbiAgICogQHJldHVybnMgVGhlIEFuZ3VsYXJKUyB1cGdyYWRlIG1vZHVsZSB0aGF0IGlzIGRlY2xhcmVkIGJ5IHRoaXMgbWV0aG9kXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCB1cGdyYWRlQWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqIHVwZ3JhZGVBZGFwdGVyLmRlY2xhcmVOZzFNb2R1bGUoWydoZXJvQXBwJ10pO1xuICAgKiBgYGBcbiAgICovXG4gIHByaXZhdGUgZGVjbGFyZU5nMU1vZHVsZShtb2R1bGVzOiBzdHJpbmdbXSA9IFtdKTogYW5ndWxhci5JTW9kdWxlIHtcbiAgICBjb25zdCBkZWxheUFwcGx5RXhwczogRnVuY3Rpb25bXSA9IFtdO1xuICAgIGxldCBvcmlnaW5hbCRhcHBseUZuOiBGdW5jdGlvbjtcbiAgICBsZXQgcm9vdFNjb3BlUHJvdG90eXBlOiBhbnk7XG4gICAgbGV0IHJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZTtcbiAgICBjb25zdCB1cGdyYWRlQWRhcHRlciA9IHRoaXM7XG4gICAgY29uc3QgbmcxTW9kdWxlID0gdGhpcy5uZzFNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSh0aGlzLmlkUHJlZml4LCBtb2R1bGVzKTtcbiAgICBjb25zdCBwbGF0Zm9ybVJlZiA9IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKTtcblxuICAgIHRoaXMubmdab25lID0gbmV3IE5nWm9uZSh7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IFpvbmUuaGFzT3duUHJvcGVydHkoJ2xvbmdTdGFja1RyYWNlWm9uZVNwZWMnKX0pO1xuICAgIHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcbiAgICBuZzFNb2R1bGUuZmFjdG9yeShJTkpFQ1RPUl9LRVksICgpID0+IHRoaXMubW9kdWxlUmVmICEuaW5qZWN0b3IuZ2V0KEluamVjdG9yKSlcbiAgICAgICAgLmZhY3RvcnkoXG4gICAgICAgICAgICBMQVpZX01PRFVMRV9SRUYsXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIElOSkVDVE9SX0tFWSxcbiAgICAgICAgICAgICAgKGluamVjdG9yOiBJbmplY3RvcikgPT4gKHsgaW5qZWN0b3IsIG5lZWRzTmdab25lOiBmYWxzZSB9IGFzIExhenlNb2R1bGVSZWYpXG4gICAgICAgICAgICBdKVxuICAgICAgICAuY29uc3RhbnQoTkdfWk9ORV9LRVksIHRoaXMubmdab25lKVxuICAgICAgICAuZmFjdG9yeShDT01QSUxFUl9LRVksICgpID0+IHRoaXMubW9kdWxlUmVmICEuaW5qZWN0b3IuZ2V0KENvbXBpbGVyKSlcbiAgICAgICAgLmNvbmZpZyhbXG4gICAgICAgICAgJyRwcm92aWRlJywgJyRpbmplY3RvcicsXG4gICAgICAgICAgKHByb3ZpZGU6IGFuZ3VsYXIuSVByb3ZpZGVTZXJ2aWNlLCBuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcigkUk9PVF9TQ09QRSwgW1xuICAgICAgICAgICAgICAnJGRlbGVnYXRlJyxcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocm9vdFNjb3BlRGVsZWdhdGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAvLyBDYXB0dXJlIHRoZSByb290IGFwcGx5IHNvIHRoYXQgd2UgY2FuIGRlbGF5IGZpcnN0IGNhbGwgdG8gJGFwcGx5IHVudGlsIHdlXG4gICAgICAgICAgICAgICAgLy8gYm9vdHN0cmFwIEFuZ3VsYXIgYW5kIHRoZW4gd2UgcmVwbGF5IGFuZCByZXN0b3JlIHRoZSAkYXBwbHkuXG4gICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlID0gcm9vdFNjb3BlRGVsZWdhdGUuY29uc3RydWN0b3IucHJvdG90eXBlO1xuICAgICAgICAgICAgICAgIGlmIChyb290U2NvcGVQcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJyRhcHBseScpKSB7XG4gICAgICAgICAgICAgICAgICBvcmlnaW5hbCRhcHBseUZuID0gcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseTtcbiAgICAgICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZS4kYXBwbHkgPSAoZXhwOiBhbnkpID0+IGRlbGF5QXBwbHlFeHBzLnB1c2goZXhwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmluZCBcXCckYXBwbHlcXCcgb24gXFwnJHJvb3RTY29wZVxcJyEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvb3RTY29wZSA9IHJvb3RTY29wZURlbGVnYXRlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGlmIChuZzFJbmplY3Rvci5oYXMoJCRURVNUQUJJTElUWSkpIHtcbiAgICAgICAgICAgICAgcHJvdmlkZS5kZWNvcmF0b3IoJCRURVNUQUJJTElUWSwgW1xuICAgICAgICAgICAgICAgICckZGVsZWdhdGUnLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHRlc3RhYmlsaXR5RGVsZWdhdGU6IGFuZ3VsYXIuSVRlc3RhYmlsaXR5U2VydmljZSkge1xuICAgICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgIC8vIENhbm5vdCB1c2UgYXJyb3cgZnVuY3Rpb24gYmVsb3cgYmVjYXVzZSB3ZSBuZWVkIHRoZSBjb250ZXh0XG4gICAgICAgICAgICAgICAgICBjb25zdCBuZXdXaGVuU3RhYmxlID0gZnVuY3Rpb24oY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsV2hlblN0YWJsZS5jYWxsKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5nMlRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVBZGFwdGVyLm1vZHVsZVJlZiAhLmluamVjdG9yLmdldChUZXN0YWJpbGl0eSk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKG5nMlRlc3RhYmlsaXR5LmlzU3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nMlRlc3RhYmlsaXR5LndoZW5TdGFibGUobmV3V2hlblN0YWJsZS5iaW5kKHRoaXMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgIHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZSA9IG5ld1doZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdGFiaWxpdHlEZWxlZ2F0ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXSk7XG5cbiAgICBuZzFNb2R1bGUucnVuKFtcbiAgICAgICckaW5qZWN0b3InLCAnJHJvb3RTY29wZScsXG4gICAgICAobmcxSW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSwgcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlKSA9PiB7XG4gICAgICAgIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlci5yZXNvbHZlKHRoaXMubmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZCwgbmcxSW5qZWN0b3IpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgIC8vIE5vdGU6IFRoZXJlIGlzIGEgYnVnIGluIFRTIDIuNCB0aGF0IHByZXZlbnRzIHVzIGZyb21cbiAgICAgICAgICAgICAgLy8gaW5saW5pbmcgdGhpcyBpbnRvIEBOZ01vZHVsZVxuICAgICAgICAgICAgICAvLyBUT0RPKHRib3NjaCk6IGZpbmQgb3IgZmlsZSBhIGJ1ZyBhZ2FpbnN0IFR5cGVTY3JpcHQgZm9yIHRoaXMuXG4gICAgICAgICAgICAgIGNvbnN0IG5nTW9kdWxlID0ge1xuICAgICAgICAgICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgICAgICAgICAge3Byb3ZpZGU6ICRJTkpFQ1RPUiwgdXNlRmFjdG9yeTogKCkgPT4gbmcxSW5qZWN0b3J9LFxuICAgICAgICAgICAgICAgICAge3Byb3ZpZGU6ICRDT01QSUxFLCB1c2VGYWN0b3J5OiAoKSA9PiBuZzFJbmplY3Rvci5nZXQoJENPTVBJTEUpfSxcbiAgICAgICAgICAgICAgICAgIHRoaXMudXBncmFkZWRQcm92aWRlcnNcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIGltcG9ydHM6IFt0aGlzLm5nMkFwcE1vZHVsZV0sXG4gICAgICAgICAgICAgICAgZW50cnlDb21wb25lbnRzOiB0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2UgaGF2ZSBuZzEgaW5qZWN0b3IgYW5kIHdlIGhhdmUgcHJlcGFyZWRcbiAgICAgICAgICAgICAgLy8gbmcxIGNvbXBvbmVudHMgdG8gYmUgdXBncmFkZWQsIHdlIG5vdyBjYW4gYm9vdHN0cmFwIG5nMi5cbiAgICAgICAgICAgICAgQE5nTW9kdWxlKHtqaXQ6IHRydWUsIC4uLm5nTW9kdWxlfSlcbiAgICAgICAgICAgICAgY2xhc3MgRHluYW1pY05nVXBncmFkZU1vZHVsZSB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IoKSB7fVxuICAgICAgICAgICAgICAgIG5nRG9Cb290c3RyYXAoKSB7fVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYXRmb3JtUmVmXG4gICAgICAgICAgICAgICAgICAuYm9vdHN0cmFwTW9kdWxlKFxuICAgICAgICAgICAgICAgICAgICAgIER5bmFtaWNOZ1VwZ3JhZGVNb2R1bGUsIFt0aGlzLmNvbXBpbGVyT3B0aW9ucyAhLCB7bmdab25lOiB0aGlzLm5nWm9uZX1dKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlZjogTmdNb2R1bGVSZWY8YW55PikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZVJlZiA9IHJlZjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vdFNjb3BlUHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5ID0gb3JpZ2luYWwkYXBwbHlGbjsgIC8vIHJlc3RvcmUgb3JpZ2luYWwgJGFwcGx5XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZGVsYXlBcHBseUV4cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RTY29wZS4kYXBwbHkoZGVsYXlBcHBseUV4cHMuc2hpZnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZC5yZXNvbHZlKG5nMUluamVjdG9yKSwgb25FcnJvcilcbiAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YnNjcmlwdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LnN1YnNjcmliZSh7bmV4dDogKCkgPT4gcm9vdFNjb3BlLiRkaWdlc3QoKX0pO1xuICAgICAgICAgICAgICAgICAgICByb290U2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHsgc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7IH0pO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlKSA9PiB0aGlzLm5nMkJvb3RzdHJhcERlZmVycmVkLnJlamVjdChlKSk7XG4gICAgICB9XG4gICAgXSk7XG5cbiAgICByZXR1cm4gbmcxTW9kdWxlO1xuICB9XG59XG5cbi8qKlxuICogU3luY2hyb25vdXMgcHJvbWlzZS1saWtlIG9iamVjdCB0byB3cmFwIHBhcmVudCBpbmplY3RvcnMsXG4gKiB0byBwcmVzZXJ2ZSB0aGUgc3luY2hyb25vdXMgbmF0dXJlIG9mIEFuZ3VsYXJKUydzICRjb21waWxlLlxuICovXG5jbGFzcyBQYXJlbnRJbmplY3RvclByb21pc2Uge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBpbmplY3RvciAhOiBJbmplY3RvcjtcbiAgcHJpdmF0ZSBjYWxsYmFja3M6ICgoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSkge1xuICAgIC8vIHN0b3JlIHRoZSBwcm9taXNlIG9uIHRoZSBlbGVtZW50XG4gICAgZWxlbWVudC5kYXRhICEoY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpLCB0aGlzKTtcbiAgfVxuXG4gIHRoZW4oY2FsbGJhY2s6IChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSkge1xuICAgIGlmICh0aGlzLmluamVjdG9yKSB7XG4gICAgICBjYWxsYmFjayh0aGlzLmluamVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZShpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmluamVjdG9yID0gaW5qZWN0b3I7XG5cbiAgICAvLyByZXNldCB0aGUgZWxlbWVudCBkYXRhIHRvIHBvaW50IHRvIHRoZSByZWFsIGluamVjdG9yXG4gICAgdGhpcy5lbGVtZW50LmRhdGEgIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIGluamVjdG9yKTtcblxuICAgIC8vIGNsZWFuIG91dCB0aGUgZWxlbWVudCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuICAgIHRoaXMuZWxlbWVudCA9IG51bGwgITtcblxuICAgIC8vIHJ1biBhbGwgdGhlIHF1ZXVlZCBjYWxsYmFja3NcbiAgICB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKChjYWxsYmFjaykgPT4gY2FsbGJhY2soaW5qZWN0b3IpKTtcbiAgICB0aGlzLmNhbGxiYWNrcy5sZW5ndGggPSAwO1xuICB9XG59XG5cblxuLyoqXG4gKiBVc2UgYFVwZ3JhZGVBZGFwdGVyUmVmYCB0byBjb250cm9sIGEgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXIgYXBwbGljYXRpb24uXG4gKlxuICogQGRlcHJlY2F0ZWQgRGVwcmVjYXRlZCBzaW5jZSB2NS4gVXNlIGB1cGdyYWRlL3N0YXRpY2AgaW5zdGVhZCwgd2hpY2ggYWxzbyBzdXBwb3J0c1xuICogW0FoZWFkLW9mLVRpbWUgY29tcGlsYXRpb25dKGd1aWRlL2FvdC1jb21waWxlcikuXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlQWRhcHRlclJlZiB7XG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9yZWFkeUZuOiAoKHVwZ3JhZGVBZGFwdGVyUmVmPzogVXBncmFkZUFkYXB0ZXJSZWYpID0+IHZvaWQpfG51bGwgPSBudWxsO1xuXG4gIHB1YmxpYyBuZzFSb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UgPSBudWxsICE7XG4gIHB1YmxpYyBuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlID0gbnVsbCAhO1xuICBwdWJsaWMgbmcyTW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+ID0gbnVsbCAhO1xuICBwdWJsaWMgbmcySW5qZWN0b3I6IEluamVjdG9yID0gbnVsbCAhO1xuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9ib290c3RyYXBEb25lKG5nTW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+LCBuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSB7XG4gICAgdGhpcy5uZzJNb2R1bGVSZWYgPSBuZ01vZHVsZVJlZjtcbiAgICB0aGlzLm5nMkluamVjdG9yID0gbmdNb2R1bGVSZWYuaW5qZWN0b3I7XG4gICAgdGhpcy5uZzFJbmplY3RvciA9IG5nMUluamVjdG9yO1xuICAgIHRoaXMubmcxUm9vdFNjb3BlID0gbmcxSW5qZWN0b3IuZ2V0KCRST09UX1NDT1BFKTtcbiAgICB0aGlzLl9yZWFkeUZuICYmIHRoaXMuX3JlYWR5Rm4odGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGljaCBpcyBub3RpZmllZCB1cG9uIHN1Y2Nlc3NmdWwgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXJcbiAgICogYXBwbGljYXRpb24gaGFzIGJlZW4gYm9vdHN0cmFwcGVkLlxuICAgKlxuICAgKiBUaGUgYHJlYWR5YCBjYWxsYmFjayBmdW5jdGlvbiBpcyBpbnZva2VkIGluc2lkZSB0aGUgQW5ndWxhciB6b25lLCB0aGVyZWZvcmUgaXQgZG9lcyBub3RcbiAgICogcmVxdWlyZSBhIGNhbGwgdG8gYCRhcHBseSgpYC5cbiAgICovXG4gIHB1YmxpYyByZWFkeShmbjogKHVwZ3JhZGVBZGFwdGVyUmVmOiBVcGdyYWRlQWRhcHRlclJlZikgPT4gdm9pZCkgeyB0aGlzLl9yZWFkeUZuID0gZm47IH1cblxuICAvKipcbiAgICogRGlzcG9zZSBvZiBydW5uaW5nIGh5YnJpZCBBbmd1bGFySlMgLyBBbmd1bGFyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5uZzFJbmplY3RvciAhLmdldCgkUk9PVF9TQ09QRSkuJGRlc3Ryb3koKTtcbiAgICB0aGlzLm5nMk1vZHVsZVJlZiAhLmRlc3Ryb3koKTtcbiAgfVxufVxuIl19