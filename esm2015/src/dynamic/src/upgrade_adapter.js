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
import { Compiler, Injector, NgModule, NgZone, Testability, isDevMode, resolveForwardRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as angular from '../../common/src/angular1';
import { $$TESTABILITY, $COMPILE, $INJECTOR, $ROOT_SCOPE, COMPILER_KEY, INJECTOR_KEY, LAZY_MODULE_REF, NG_ZONE_KEY, UPGRADE_APP_TYPE_KEY } from '../../common/src/constants';
import { downgradeComponent } from '../../common/src/downgrade_component';
import { downgradeInjectable } from '../../common/src/downgrade_injectable';
import { Deferred, controllerKey, onError } from '../../common/src/util';
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
 * \@publicApi
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
     * \@Input() salutation: string; / name: string;
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
        if (((/** @type {?} */ (this.ng1ComponentsToBeUpgraded))).hasOwnProperty(name)) {
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
        const windowNgMock = ((/** @type {?} */ (window)))['angular'].mock;
        if (!windowNgMock || !windowNgMock.module) {
            throw new Error('Failed to find \'angular.mock.module\'.');
        }
        this.declareNg1Module(modules);
        windowNgMock.module(this.ng1Module.name);
        /** @type {?} */
        const upgrade = new UpgradeAdapterRef();
        this.ng2BootstrapDeferred.promise.then((ng1Injector) => { ((/** @type {?} */ (upgrade)))._bootstrapDone(this.moduleRef, ng1Injector); }, onError);
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
    bootstrap(element, modules, config) {
        this.declareNg1Module(modules);
        /** @type {?} */
        const upgrade = new UpgradeAdapterRef();
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        /** @type {?} */
        const windowAngular = ((/** @type {?} */ (window)))['angular'];
        windowAngular.resumeBootstrap = undefined;
        this.ngZone.run(() => { angular.bootstrap(element, [this.ng1Module.name], (/** @type {?} */ (config))); });
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
            (/** @type {?} */ (angular.element(element).data))(controllerKey(INJECTOR_KEY), (/** @type {?} */ (this.moduleRef)).injector);
            (/** @type {?} */ (this.moduleRef)).injector.get(NgZone).run(() => { ((/** @type {?} */ (upgrade)))._bootstrapDone(this.moduleRef, ng1Injector); });
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
     * @private
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
        const ng1Module = this.ng1Module = angular.module_(this.idPrefix, modules);
        /** @type {?} */
        const platformRef = platformBrowserDynamic();
        this.ngZone = new NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
        this.ng2BootstrapDeferred = new Deferred();
        ng1Module.constant(UPGRADE_APP_TYPE_KEY, 1 /* Dynamic */)
            .factory(INJECTOR_KEY, () => (/** @type {?} */ (this.moduleRef)).injector.get(Injector))
            .factory(LAZY_MODULE_REF, [INJECTOR_KEY, (injector) => ((/** @type {?} */ ({ injector })))])
            .constant(NG_ZONE_KEY, this.ngZone)
            .factory(COMPILER_KEY, () => (/** @type {?} */ (this.moduleRef)).injector.get(Compiler))
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
                            // Cannot use arrow function below because we need the context
                            /** @type {?} */
                            const newWhenStable = function (callback) {
                                originalWhenStable.call(this, function () {
                                    /** @type {?} */
                                    const ng2Testability = (/** @type {?} */ (upgradeAdapter.moduleRef)).injector.get(Testability);
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
                    // Note: There is a bug in TS 2.4 that prevents us from
                    // inlining this into @NgModule
                    // TODO(tbosch): find or file a bug against TypeScript for this.
                    /** @type {?} */
                    const ngModule = {
                        providers: [
                            { provide: $INJECTOR, useFactory: () => ng1Injector },
                            { provide: $COMPILE, useFactory: () => ng1Injector.get($COMPILE) },
                            this.upgradedProviders
                        ],
                        imports: [resolveForwardRef(this.ng2AppModule)],
                        entryComponents: this.downgradedComponents
                    };
                    // At this point we have ng1 injector and we have prepared
                    // ng1 components to be upgraded, we now can bootstrap ng2.
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
                        .bootstrapModule(DynamicNgUpgradeModule, [(/** @type {?} */ (this.compilerOptions)), { ngZone: this.ngZone }])
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
                        let subscription = this.ngZone.onMicrotaskEmpty.subscribe({
                            next: () => {
                                if (rootScope.$$phase) {
                                    if (isDevMode()) {
                                        console.warn('A digest was triggered while one was already in progress. This may mean that something is triggering digests outside the Angular zone.');
                                    }
                                    return rootScope.$evalAsync(() => { });
                                }
                                return rootScope.$digest();
                            }
                        });
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
    /**
     * @type {?}
     * @private
     */
    UpgradeAdapter.prototype.idPrefix;
    /**
     * @type {?}
     * @private
     */
    UpgradeAdapter.prototype.downgradedComponents;
    /**
     * An internal map of ng1 components which need to up upgraded to ng2.
     *
     * We can't upgrade until injector is instantiated and we can retrieve the component metadata.
     * For this reason we keep a list of components to upgrade until ng1 injector is bootstrapped.
     *
     * \@internal
     * @type {?}
     * @private
     */
    UpgradeAdapter.prototype.ng1ComponentsToBeUpgraded;
    /**
     * @type {?}
     * @private
     */
    UpgradeAdapter.prototype.upgradedProviders;
    /**
     * @type {?}
     * @private
     */
    UpgradeAdapter.prototype.ngZone;
    /**
     * @type {?}
     * @private
     */
    UpgradeAdapter.prototype.ng1Module;
    /**
     * @type {?}
     * @private
     */
    UpgradeAdapter.prototype.moduleRef;
    /**
     * @type {?}
     * @private
     */
    UpgradeAdapter.prototype.ng2BootstrapDeferred;
    /**
     * @type {?}
     * @private
     */
    UpgradeAdapter.prototype.ng2AppModule;
    /**
     * @type {?}
     * @private
     */
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
        // store the promise on the element
        (/** @type {?} */ (element.data))(controllerKey(INJECTOR_KEY), this);
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
        // reset the element data to point to the real injector
        (/** @type {?} */ (this.element.data))(controllerKey(INJECTOR_KEY), injector);
        // clean out the element to prevent memory leaks
        this.element = (/** @type {?} */ (null));
        // run all the queued callbacks
        this.callbacks.forEach((callback) => callback(injector));
        this.callbacks.length = 0;
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    ParentInjectorPromise.prototype.injector;
    /**
     * @type {?}
     * @private
     */
    ParentInjectorPromise.prototype.callbacks;
    /**
     * @type {?}
     * @private
     */
    ParentInjectorPromise.prototype.element;
}
/**
 * Use `UpgradeAdapterRef` to control a hybrid AngularJS / Angular application.
 *
 * @deprecated Deprecated since v5. Use `upgrade/static` instead, which also supports
 * [Ahead-of-Time compilation](guide/aot-compiler).
 * \@publicApi
 */
export class UpgradeAdapterRef {
    constructor() {
        /* @internal */
        this._readyFn = null;
        this.ng1RootScope = (/** @type {?} */ (null));
        this.ng1Injector = (/** @type {?} */ (null));
        this.ng2ModuleRef = (/** @type {?} */ (null));
        this.ng2Injector = (/** @type {?} */ (null));
    }
    /* @internal */
    /**
     * @private
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
        (/** @type {?} */ (this.ng1Injector)).get($ROOT_SCOPE).$destroy();
        (/** @type {?} */ (this.ng2ModuleRef)).destroy();
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvZHluYW1pYy9zcmMvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFDLFFBQVEsRUFBbUIsUUFBUSxFQUFFLFFBQVEsRUFBZSxNQUFNLEVBQWtCLFdBQVcsRUFBUSxTQUFTLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDbEssT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFFekUsT0FBTyxLQUFLLE9BQU8sTUFBTSwyQkFBMkIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzNLLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBQzFFLE9BQU8sRUFBQyxRQUFRLEVBQWlDLGFBQWEsRUFBRSxPQUFPLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUV0RyxPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7SUFFcEUsWUFBWSxHQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0Y1QixNQUFNLE9BQU8sY0FBYzs7Ozs7SUFxQnpCLFlBQW9CLFlBQXVCLEVBQVUsZUFBaUM7UUFBbEUsaUJBQVksR0FBWixZQUFZLENBQVc7UUFBVSxvQkFBZSxHQUFmLGVBQWUs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QSxJQUFJLEVBQUUsQ0FBQztJQTJCeEMsQ0FBQzs7Ozs7Ozs7SUF4QlMsY0FBYyxDQUFDLFdBQTZCLEVBQUUsV0FBcUM7UUFDekYsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQzs7Ozs7Ozs7OztJQVNNLEtBQUssQ0FBQyxFQUFrRCxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQzs7Ozs7SUFLakYsT0FBTztRQUNaLG1CQUFBLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDL0MsbUJBQUEsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2hDLENBQUM7Q0FDRjs7Ozs7O0lBaENDLHFDQUFnRjs7SUFFaEYseUNBQXdEOztJQUN4RCx3Q0FBc0Q7O0lBQ3RELHlDQUErQzs7SUFDL0Msd0NBQXNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVyLCBDb21waWxlck9wdGlvbnMsIEluamVjdG9yLCBOZ01vZHVsZSwgTmdNb2R1bGVSZWYsIE5nWm9uZSwgU3RhdGljUHJvdmlkZXIsIFRlc3RhYmlsaXR5LCBUeXBlLCBpc0Rldk1vZGUsIHJlc29sdmVGb3J3YXJkUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7cGxhdGZvcm1Ccm93c2VyRHluYW1pY30gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci1keW5hbWljJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi8uLi9jb21tb24vc3JjL2FuZ3VsYXIxJztcbmltcG9ydCB7JCRURVNUQUJJTElUWSwgJENPTVBJTEUsICRJTkpFQ1RPUiwgJFJPT1RfU0NPUEUsIENPTVBJTEVSX0tFWSwgSU5KRUNUT1JfS0VZLCBMQVpZX01PRFVMRV9SRUYsIE5HX1pPTkVfS0VZLCBVUEdSQURFX0FQUF9UWVBFX0tFWX0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9jb25zdGFudHMnO1xuaW1wb3J0IHtkb3duZ3JhZGVDb21wb25lbnR9IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvZG93bmdyYWRlX2NvbXBvbmVudCc7XG5pbXBvcnQge2Rvd25ncmFkZUluamVjdGFibGV9IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvZG93bmdyYWRlX2luamVjdGFibGUnO1xuaW1wb3J0IHtEZWZlcnJlZCwgTGF6eU1vZHVsZVJlZiwgVXBncmFkZUFwcFR5cGUsIGNvbnRyb2xsZXJLZXksIG9uRXJyb3J9IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvdXRpbCc7XG5cbmltcG9ydCB7VXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSBmcm9tICcuL3VwZ3JhZGVfbmcxX2FkYXB0ZXInO1xuXG5sZXQgdXBncmFkZUNvdW50OiBudW1iZXIgPSAwO1xuXG4vKipcbiAqIFVzZSBgVXBncmFkZUFkYXB0ZXJgIHRvIGFsbG93IEFuZ3VsYXJKUyBhbmQgQW5ndWxhciB0byBjb2V4aXN0IGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoZSBgVXBncmFkZUFkYXB0ZXJgIGFsbG93czpcbiAqIDEuIGNyZWF0aW9uIG9mIEFuZ3VsYXIgY29tcG9uZW50IGZyb20gQW5ndWxhckpTIGNvbXBvbmVudCBkaXJlY3RpdmVcbiAqICAgIChTZWUgW1VwZ3JhZGVBZGFwdGVyI3VwZ3JhZGVOZzFDb21wb25lbnQoKV0pXG4gKiAyLiBjcmVhdGlvbiBvZiBBbmd1bGFySlMgZGlyZWN0aXZlIGZyb20gQW5ndWxhciBjb21wb25lbnQuXG4gKiAgICAoU2VlIFtVcGdyYWRlQWRhcHRlciNkb3duZ3JhZGVOZzJDb21wb25lbnQoKV0pXG4gKiAzLiBCb290c3RyYXBwaW5nIG9mIGEgaHlicmlkIEFuZ3VsYXIgYXBwbGljYXRpb24gd2hpY2ggY29udGFpbnMgYm90aCBvZiB0aGUgZnJhbWV3b3Jrc1xuICogICAgY29leGlzdGluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIE1lbnRhbCBNb2RlbFxuICpcbiAqIFdoZW4gcmVhc29uaW5nIGFib3V0IGhvdyBhIGh5YnJpZCBhcHBsaWNhdGlvbiB3b3JrcyBpdCBpcyB1c2VmdWwgdG8gaGF2ZSBhIG1lbnRhbCBtb2RlbCB3aGljaFxuICogZGVzY3JpYmVzIHdoYXQgaXMgaGFwcGVuaW5nIGFuZCBleHBsYWlucyB3aGF0IGlzIGhhcHBlbmluZyBhdCB0aGUgbG93ZXN0IGxldmVsLlxuICpcbiAqIDEuIFRoZXJlIGFyZSB0d28gaW5kZXBlbmRlbnQgZnJhbWV3b3JrcyBydW5uaW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLCBlYWNoIGZyYW1ld29yayB0cmVhdHNcbiAqICAgIHRoZSBvdGhlciBhcyBhIGJsYWNrIGJveC5cbiAqIDIuIEVhY2ggRE9NIGVsZW1lbnQgb24gdGhlIHBhZ2UgaXMgb3duZWQgZXhhY3RseSBieSBvbmUgZnJhbWV3b3JrLiBXaGljaGV2ZXIgZnJhbWV3b3JrXG4gKiAgICBpbnN0YW50aWF0ZWQgdGhlIGVsZW1lbnQgaXMgdGhlIG93bmVyLiBFYWNoIGZyYW1ld29yayBvbmx5IHVwZGF0ZXMvaW50ZXJhY3RzIHdpdGggaXRzIG93blxuICogICAgRE9NIGVsZW1lbnRzIGFuZCBpZ25vcmVzIG90aGVycy5cbiAqIDMuIEFuZ3VsYXJKUyBkaXJlY3RpdmVzIGFsd2F5cyBleGVjdXRlIGluc2lkZSBBbmd1bGFySlMgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDQuIEFuZ3VsYXIgY29tcG9uZW50cyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgQW5ndWxhciBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNS4gQW4gQW5ndWxhckpTIGNvbXBvbmVudCBjYW4gYmUgdXBncmFkZWQgdG8gYW4gQW5ndWxhciBjb21wb25lbnQuIFRoaXMgY3JlYXRlcyBhblxuICogICAgQW5ndWxhciBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXJKUyBjb21wb25lbnQgZGlyZWN0aXZlIGluIHRoYXQgbG9jYXRpb24uXG4gKiA2LiBBbiBBbmd1bGFyIGNvbXBvbmVudCBjYW4gYmUgZG93bmdyYWRlZCB0byBhbiBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZS4gVGhpcyBjcmVhdGVzXG4gKiAgICBhbiBBbmd1bGFySlMgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFyIGNvbXBvbmVudCBpbiB0aGF0IGxvY2F0aW9uLlxuICogNy4gV2hlbmV2ZXIgYW4gYWRhcHRlciBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnkgdGhlIGZyYW1ld29ya1xuICogICAgZG9pbmcgdGhlIGluc3RhbnRpYXRpb24uIFRoZSBvdGhlciBmcmFtZXdvcmsgdGhlbiBpbnN0YW50aWF0ZXMgYW5kIG93bnMgdGhlIHZpZXcgZm9yIHRoYXRcbiAqICAgIGNvbXBvbmVudC4gVGhpcyBpbXBsaWVzIHRoYXQgY29tcG9uZW50IGJpbmRpbmdzIHdpbGwgYWx3YXlzIGZvbGxvdyB0aGUgc2VtYW50aWNzIG9mIHRoZVxuICogICAgaW5zdGFudGlhdGlvbiBmcmFtZXdvcmsuIFRoZSBzeW50YXggaXMgYWx3YXlzIHRoYXQgb2YgQW5ndWxhciBzeW50YXguXG4gKiA4LiBBbmd1bGFySlMgaXMgYWx3YXlzIGJvb3RzdHJhcHBlZCBmaXJzdCBhbmQgb3ducyB0aGUgYm90dG9tIG1vc3Qgdmlldy5cbiAqIDkuIFRoZSBuZXcgYXBwbGljYXRpb24gaXMgcnVubmluZyBpbiBBbmd1bGFyIHpvbmUsIGFuZCB0aGVyZWZvcmUgaXQgbm8gbG9uZ2VyIG5lZWRzIGNhbGxzIHRvXG4gKiAgICBgJGFwcGx5KClgLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpLCBteUNvbXBpbGVyT3B0aW9ucyk7XG4gKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyQ29tcCcsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMkNvbXBvbmVudCkpO1xuICpcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMUhlbGxvJywgZnVuY3Rpb24oKSB7XG4gKiAgIHJldHVybiB7XG4gKiAgICAgIHNjb3BlOiB7IHRpdGxlOiAnPScgfSxcbiAqICAgICAgdGVtcGxhdGU6ICduZzFbSGVsbG8ge3t0aXRsZX19IV0oPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+KSdcbiAqICAgfTtcbiAqIH0pO1xuICpcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICduZzItY29tcCcsXG4gKiAgIGlucHV0czogWyduYW1lJ10sXG4gKiAgIHRlbXBsYXRlOiAnbmcyWzxuZzEtaGVsbG8gW3RpdGxlXT1cIm5hbWVcIj50cmFuc2NsdWRlPC9uZzEtaGVsbG8+XSg8bmctY29udGVudD48L25nLWNvbnRlbnQ+KScsXG4gKiAgIGRpcmVjdGl2ZXM6XG4gKiB9KVxuICogY2xhc3MgTmcyQ29tcG9uZW50IHtcbiAqIH1cbiAqXG4gKiBATmdNb2R1bGUoe1xuICogICBkZWNsYXJhdGlvbnM6IFtOZzJDb21wb25lbnQsIGFkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnbmcxSGVsbG8nKV0sXG4gKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICogfSlcbiAqIGNsYXNzIE15TmcyTW9kdWxlIHt9XG4gKlxuICpcbiAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxuZzItY29tcCBuYW1lPVwiV29ybGRcIj5wcm9qZWN0PC9uZzItY29tcD4nO1xuICpcbiAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcbiAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAqIH0pO1xuICpcbiAqIGBgYFxuICpcbiAqIEBkZXByZWNhdGVkIERlcHJlY2F0ZWQgc2luY2UgdjUuIFVzZSBgdXBncmFkZS9zdGF0aWNgIGluc3RlYWQsIHdoaWNoIGFsc28gc3VwcG9ydHNcbiAqIFtBaGVhZC1vZi1UaW1lIGNvbXBpbGF0aW9uXShndWlkZS9hb3QtY29tcGlsZXIpLlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgVXBncmFkZUFkYXB0ZXIge1xuICBwcml2YXRlIGlkUHJlZml4OiBzdHJpbmcgPSBgTkcyX1VQR1JBREVfJHt1cGdyYWRlQ291bnQrK31fYDtcbiAgcHJpdmF0ZSBkb3duZ3JhZGVkQ29tcG9uZW50czogVHlwZTxhbnk+W10gPSBbXTtcbiAgLyoqXG4gICAqIEFuIGludGVybmFsIG1hcCBvZiBuZzEgY29tcG9uZW50cyB3aGljaCBuZWVkIHRvIHVwIHVwZ3JhZGVkIHRvIG5nMi5cbiAgICpcbiAgICogV2UgY2FuJ3QgdXBncmFkZSB1bnRpbCBpbmplY3RvciBpcyBpbnN0YW50aWF0ZWQgYW5kIHdlIGNhbiByZXRyaWV2ZSB0aGUgY29tcG9uZW50IG1ldGFkYXRhLlxuICAgKiBGb3IgdGhpcyByZWFzb24gd2Uga2VlcCBhIGxpc3Qgb2YgY29tcG9uZW50cyB0byB1cGdyYWRlIHVudGlsIG5nMSBpbmplY3RvciBpcyBib290c3RyYXBwZWQuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgcHJpdmF0ZSBuZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkOiB7W25hbWU6IHN0cmluZ106IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0gPSB7fTtcbiAgcHJpdmF0ZSB1cGdyYWRlZFByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFtdO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBuZ1pvbmUgITogTmdab25lO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBuZzFNb2R1bGUgITogYW5ndWxhci5JTW9kdWxlO1xuICBwcml2YXRlIG1vZHVsZVJlZjogTmdNb2R1bGVSZWY8YW55PnxudWxsID0gbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgbmcyQm9vdHN0cmFwRGVmZXJyZWQgITogRGVmZXJyZWQ8YW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlPjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIG5nMkFwcE1vZHVsZTogVHlwZTxhbnk+LCBwcml2YXRlIGNvbXBpbGVyT3B0aW9ucz86IENvbXBpbGVyT3B0aW9ucykge1xuICAgIGlmICghbmcyQXBwTW9kdWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1VwZ3JhZGVBZGFwdGVyIGNhbm5vdCBiZSBpbnN0YW50aWF0ZWQgd2l0aG91dCBhbiBOZ01vZHVsZSBvZiB0aGUgQW5ndWxhciBhcHAuJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFyIENvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTLlxuICAgKlxuICAgKiBVc2UgYGRvd25ncmFkZU5nMkNvbXBvbmVudGAgdG8gY3JlYXRlIGFuIEFuZ3VsYXJKUyBEaXJlY3RpdmUgRGVmaW5pdGlvbiBGYWN0b3J5IGZyb21cbiAgICogQW5ndWxhciBDb21wb25lbnQuIFRoZSBhZGFwdGVyIHdpbGwgYm9vdHN0cmFwIEFuZ3VsYXIgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZVxuICAgKiBBbmd1bGFySlMgdGVtcGxhdGUuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBNZW50YWwgTW9kZWxcbiAgICpcbiAgICogMS4gVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgYnkgYmVpbmcgbGlzdGVkIGluIEFuZ3VsYXJKUyB0ZW1wbGF0ZS4gVGhpcyBtZWFucyB0aGF0IHRoZVxuICAgKiAgICBob3N0IGVsZW1lbnQgaXMgY29udHJvbGxlZCBieSBBbmd1bGFySlMsIGJ1dCB0aGUgY29tcG9uZW50J3MgdmlldyB3aWxsIGJlIGNvbnRyb2xsZWQgYnlcbiAgICogICAgQW5ndWxhci5cbiAgICogMi4gRXZlbiB0aG91Z2h0IHRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGluIEFuZ3VsYXJKUywgaXQgd2lsbCBiZSB1c2luZyBBbmd1bGFyXG4gICAqICAgIHN5bnRheC4gVGhpcyBoYXMgdG8gYmUgZG9uZSwgdGhpcyB3YXkgYmVjYXVzZSB3ZSBtdXN0IGZvbGxvdyBBbmd1bGFyIGNvbXBvbmVudHMgZG8gbm90XG4gICAqICAgIGRlY2xhcmUgaG93IHRoZSBhdHRyaWJ1dGVzIHNob3VsZCBiZSBpbnRlcnByZXRlZC5cbiAgICogMy4gYG5nLW1vZGVsYCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXJKUyBhbmQgY29tbXVuaWNhdGVzIHdpdGggdGhlIGRvd25ncmFkZWQgQW5ndWxhciBjb21wb25lbnRcbiAgICogICAgYnkgd2F5IG9mIHRoZSBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGludGVyZmFjZSBmcm9tIEBhbmd1bGFyL2Zvcm1zLiBPbmx5IGNvbXBvbmVudHMgdGhhdFxuICAgKiAgICBpbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgYXJlIGVsaWdpYmxlLlxuICAgKlxuICAgKiAjIyMgU3VwcG9ydGVkIEZlYXR1cmVzXG4gICAqXG4gICAqIC0gQmluZGluZ3M6XG4gICAqICAgLSBBdHRyaWJ1dGU6IGA8Y29tcCBuYW1lPVwiV29ybGRcIj5gXG4gICAqICAgLSBJbnRlcnBvbGF0aW9uOiAgYDxjb21wIGdyZWV0aW5nPVwiSGVsbG8ge3tuYW1lfX0hXCI+YFxuICAgKiAgIC0gRXhwcmVzc2lvbjogIGA8Y29tcCBbbmFtZV09XCJ1c2VybmFtZVwiPmBcbiAgICogICAtIEV2ZW50OiAgYDxjb21wIChjbG9zZSk9XCJkb1NvbWV0aGluZygpXCI+YFxuICAgKiAgIC0gbmctbW9kZWw6IGA8Y29tcCBuZy1tb2RlbD1cIm5hbWVcIj5gXG4gICAqIC0gQ29udGVudCBwcm9qZWN0aW9uOiB5ZXNcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoZm9yd2FyZFJlZigoKSA9PiBNeU5nMk1vZHVsZSkpO1xuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCdncmVldCcsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KEdyZWV0ZXIpKTtcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gICAqICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8bmctY29udGVudD48L25nLWNvbnRlbnQ+J1xuICAgKiB9KVxuICAgKiBjbGFzcyBHcmVldGVyIHtcbiAgICogICBASW5wdXQoKSBzYWx1dGF0aW9uOiBzdHJpbmc7XG4gICAqICAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuICAgKiB9XG4gICAqXG4gICAqIEBOZ01vZHVsZSh7XG4gICAqICAgZGVjbGFyYXRpb25zOiBbR3JlZXRlcl0sXG4gICAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmcyTW9kdWxlIHt9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID1cbiAgICogICAnbmcxIHRlbXBsYXRlOiA8Z3JlZXQgc2FsdXRhdGlvbj1cIkhlbGxvXCIgW25hbWVdPVwid29ybGRcIj50ZXh0PC9ncmVldD4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMSB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZG93bmdyYWRlTmcyQ29tcG9uZW50KGNvbXBvbmVudDogVHlwZTxhbnk+KTogRnVuY3Rpb24ge1xuICAgIHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuXG4gICAgcmV0dXJuIGRvd25ncmFkZUNvbXBvbmVudCh7Y29tcG9uZW50fSk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXJKUyBDb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXIuXG4gICAqXG4gICAqIFVzZSBgdXBncmFkZU5nMUNvbXBvbmVudGAgdG8gY3JlYXRlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGZyb20gQW5ndWxhckpTIENvbXBvbmVudFxuICAgKiBkaXJlY3RpdmUuIFRoZSBhZGFwdGVyIHdpbGwgYm9vdHN0cmFwIEFuZ3VsYXJKUyBjb21wb25lbnQgZnJvbSB3aXRoaW4gdGhlIEFuZ3VsYXJcbiAgICogdGVtcGxhdGUuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBNZW50YWwgTW9kZWxcbiAgICpcbiAgICogMS4gVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgYnkgYmVpbmcgbGlzdGVkIGluIEFuZ3VsYXIgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhciwgYnV0IHRoZSBjb21wb25lbnQncyB2aWV3IHdpbGwgYmUgY29udHJvbGxlZCBieVxuICAgKiAgICBBbmd1bGFySlMuXG4gICAqXG4gICAqICMjIyBTdXBwb3J0ZWQgRmVhdHVyZXNcbiAgICpcbiAgICogLSBCaW5kaW5nczpcbiAgICogICAtIEF0dHJpYnV0ZTogYDxjb21wIG5hbWU9XCJXb3JsZFwiPmBcbiAgICogICAtIEludGVycG9sYXRpb246ICBgPGNvbXAgZ3JlZXRpbmc9XCJIZWxsbyB7e25hbWV9fSFcIj5gXG4gICAqICAgLSBFeHByZXNzaW9uOiAgYDxjb21wIFtuYW1lXT1cInVzZXJuYW1lXCI+YFxuICAgKiAgIC0gRXZlbnQ6ICBgPGNvbXAgKGNsb3NlKT1cImRvU29tZXRoaW5nKClcIj5gXG4gICAqIC0gVHJhbnNjbHVzaW9uOiB5ZXNcbiAgICogLSBPbmx5IHNvbWUgb2YgdGhlIGZlYXR1cmVzIG9mXG4gICAqICAgW0RpcmVjdGl2ZSBEZWZpbml0aW9uIE9iamVjdF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3NlcnZpY2UvJGNvbXBpbGUpIGFyZVxuICAgKiAgIHN1cHBvcnRlZDpcbiAgICogICAtIGBjb21waWxlYDogbm90IHN1cHBvcnRlZCBiZWNhdXNlIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnkgQW5ndWxhciwgd2hpY2ggZG9lc1xuICAgKiAgICAgbm90IGFsbG93IG1vZGlmeWluZyBET00gc3RydWN0dXJlIGR1cmluZyBjb21waWxhdGlvbi5cbiAgICogICAtIGBjb250cm9sbGVyYDogc3VwcG9ydGVkLiAoTk9URTogaW5qZWN0aW9uIG9mIGAkYXR0cnNgIGFuZCBgJHRyYW5zY2x1ZGVgIGlzIG5vdCBzdXBwb3J0ZWQuKVxuICAgKiAgIC0gYGNvbnRyb2xsZXJBc2A6IHN1cHBvcnRlZC5cbiAgICogICAtIGBiaW5kVG9Db250cm9sbGVyYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYGxpbmtgOiBzdXBwb3J0ZWQuIChOT1RFOiBvbmx5IHByZS1saW5rIGZ1bmN0aW9uIGlzIHN1cHBvcnRlZC4pXG4gICAqICAgLSBgbmFtZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGBwcmlvcml0eWA6IGlnbm9yZWQuXG4gICAqICAgLSBgcmVwbGFjZWA6IG5vdCBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcmVxdWlyZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGByZXN0cmljdGA6IG11c3QgYmUgc2V0IHRvICdFJy5cbiAgICogICAtIGBzY29wZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGB0ZW1wbGF0ZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGB0ZW1wbGF0ZVVybGA6IHN1cHBvcnRlZC5cbiAgICogICAtIGB0ZXJtaW5hbGA6IGlnbm9yZWQuXG4gICAqICAgLSBgdHJhbnNjbHVkZWA6IHN1cHBvcnRlZC5cbiAgICpcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoZm9yd2FyZFJlZigoKSA9PiBNeU5nMk1vZHVsZSkpO1xuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCdncmVldCcsIGZ1bmN0aW9uKCkge1xuICAgKiAgIHJldHVybiB7XG4gICAqICAgICBzY29wZToge3NhbHV0YXRpb246ICc9JywgbmFtZTogJz0nIH0sXG4gICAqICAgICB0ZW1wbGF0ZTogJ3t7c2FsdXRhdGlvbn19IHt7bmFtZX19ISAtIDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPidcbiAgICogICB9O1xuICAgKiB9KTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyQ29tcG9uZW50KSk7XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbmcyJyxcbiAgICogICB0ZW1wbGF0ZTogJ25nMiB0ZW1wbGF0ZTogPGdyZWV0IHNhbHV0YXRpb249XCJIZWxsb1wiIFtuYW1lXT1cIndvcmxkXCI+dGV4dDwvZ3JlZXQ+J1xuICAgKiB9KVxuICAgKiBjbGFzcyBOZzJDb21wb25lbnQge1xuICAgKiB9XG4gICAqXG4gICAqIEBOZ01vZHVsZSh7XG4gICAqICAgZGVjbGFyYXRpb25zOiBbTmcyQ29tcG9uZW50LCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ2dyZWV0JyldLFxuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyPjwvbmcyPic7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFwibmcyIHRlbXBsYXRlOiBIZWxsbyB3b3JsZCEgLSB0ZXh0XCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICB1cGdyYWRlTmcxQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFR5cGU8YW55PiB7XG4gICAgaWYgKCg8YW55PnRoaXMubmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZCkuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLm5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWRbbmFtZV0udHlwZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICh0aGlzLm5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWRbbmFtZV0gPSBuZXcgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyKG5hbWUpKVxuICAgICAgICAgIC50eXBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGFkYXB0ZXIncyBBbmd1bGFySlMgdXBncmFkZSBtb2R1bGUgZm9yIHVuaXQgdGVzdGluZyBpbiBBbmd1bGFySlMuXG4gICAqIFVzZSB0aGlzIGluc3RlYWQgb2YgYGFuZ3VsYXIubW9jay5tb2R1bGUoKWAgdG8gbG9hZCB0aGUgdXBncmFkZSBtb2R1bGUgaW50b1xuICAgKiB0aGUgQW5ndWxhckpTIHRlc3RpbmcgaW5qZWN0b3IuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCB1cGdyYWRlQWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqXG4gICAqIC8vIGNvbmZpZ3VyZSB0aGUgYWRhcHRlciB3aXRoIHVwZ3JhZGUvZG93bmdyYWRlIGNvbXBvbmVudHMgYW5kIHNlcnZpY2VzXG4gICAqIHVwZ3JhZGVBZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChNeUNvbXBvbmVudCk7XG4gICAqXG4gICAqIGxldCB1cGdyYWRlQWRhcHRlclJlZjogVXBncmFkZUFkYXB0ZXJSZWY7XG4gICAqIGxldCAkY29tcGlsZSwgJHJvb3RTY29wZTtcbiAgICpcbiAgICogLy8gV2UgbXVzdCByZWdpc3RlciB0aGUgYWRhcHRlciBiZWZvcmUgYW55IGNhbGxzIHRvIGBpbmplY3QoKWBcbiAgICogYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAqICAgdXBncmFkZUFkYXB0ZXJSZWYgPSB1cGdyYWRlQWRhcHRlci5yZWdpc3RlckZvck5nMVRlc3RzKFsnaGVyb0FwcCddKTtcbiAgICogfSk7XG4gICAqXG4gICAqIGJlZm9yZUVhY2goaW5qZWN0KChfJGNvbXBpbGVfLCBfJHJvb3RTY29wZV8pID0+IHtcbiAgICogICAkY29tcGlsZSA9IF8kY29tcGlsZV87XG4gICAqICAgJHJvb3RTY29wZSA9IF8kcm9vdFNjb3BlXztcbiAgICogfSkpO1xuICAgKlxuICAgKiBpdChcInNheXMgaGVsbG9cIiwgKGRvbmUpID0+IHtcbiAgICogICB1cGdyYWRlQWRhcHRlclJlZi5yZWFkeSgoKSA9PiB7XG4gICAqICAgICBjb25zdCBlbGVtZW50ID0gJGNvbXBpbGUoXCI8bXktY29tcG9uZW50PjwvbXktY29tcG9uZW50PlwiKSgkcm9vdFNjb3BlKTtcbiAgICogICAgICRyb290U2NvcGUuJGFwcGx5KCk7XG4gICAqICAgICBleHBlY3QoZWxlbWVudC5odG1sKCkpLnRvQ29udGFpbihcIkhlbGxvIFdvcmxkXCIpO1xuICAgKiAgICAgZG9uZSgpO1xuICAgKiAgIH0pXG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZXMgYW55IEFuZ3VsYXJKUyBtb2R1bGVzIHRoYXQgdGhlIHVwZ3JhZGUgbW9kdWxlIHNob3VsZCBkZXBlbmQgdXBvblxuICAgKiBAcmV0dXJucyBhbiBgVXBncmFkZUFkYXB0ZXJSZWZgLCB3aGljaCBsZXRzIHlvdSByZWdpc3RlciBhIGByZWFkeSgpYCBjYWxsYmFjayB0b1xuICAgKiBydW4gYXNzZXJ0aW9ucyBvbmNlIHRoZSBBbmd1bGFyIGNvbXBvbmVudHMgYXJlIHJlYWR5IHRvIHRlc3QgdGhyb3VnaCBBbmd1bGFySlMuXG4gICAqL1xuICByZWdpc3RlckZvck5nMVRlc3RzKG1vZHVsZXM/OiBzdHJpbmdbXSk6IFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgICBjb25zdCB3aW5kb3dOZ01vY2sgPSAod2luZG93IGFzIGFueSlbJ2FuZ3VsYXInXS5tb2NrO1xuICAgIGlmICghd2luZG93TmdNb2NrIHx8ICF3aW5kb3dOZ01vY2subW9kdWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBmaW5kIFxcJ2FuZ3VsYXIubW9jay5tb2R1bGVcXCcuJyk7XG4gICAgfVxuICAgIHRoaXMuZGVjbGFyZU5nMU1vZHVsZShtb2R1bGVzKTtcbiAgICB3aW5kb3dOZ01vY2subW9kdWxlKHRoaXMubmcxTW9kdWxlLm5hbWUpO1xuICAgIGNvbnN0IHVwZ3JhZGUgPSBuZXcgVXBncmFkZUFkYXB0ZXJSZWYoKTtcbiAgICB0aGlzLm5nMkJvb3RzdHJhcERlZmVycmVkLnByb21pc2UudGhlbihcbiAgICAgICAgKG5nMUluamVjdG9yKSA9PiB7ICg8YW55PnVwZ3JhZGUpLl9ib290c3RyYXBEb25lKHRoaXMubW9kdWxlUmVmLCBuZzFJbmplY3Rvcik7IH0sIG9uRXJyb3IpO1xuICAgIHJldHVybiB1cGdyYWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEJvb3RzdHJhcCBhIGh5YnJpZCBBbmd1bGFySlMgLyBBbmd1bGFyIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBUaGlzIGBib290c3RyYXBgIG1ldGhvZCBpcyBhIGRpcmVjdCByZXBsYWNlbWVudCAodGFrZXMgc2FtZSBhcmd1bWVudHMpIGZvciBBbmd1bGFySlNcbiAgICogW2Bib290c3RyYXBgXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvZnVuY3Rpb24vYW5ndWxhci5ib290c3RyYXApIG1ldGhvZC4gVW5saWtlXG4gICAqIEFuZ3VsYXJKUywgdGhpcyBib290c3RyYXAgaXMgYXN5bmNocm9ub3VzLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMikpO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzEnLCBmdW5jdGlvbigpIHtcbiAgICogICByZXR1cm4ge1xuICAgKiAgICAgIHNjb3BlOiB7IHRpdGxlOiAnPScgfSxcbiAgICogICAgICB0ZW1wbGF0ZTogJ25nMVtIZWxsbyB7e3RpdGxlfX0hXSg8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4pJ1xuICAgKiAgIH07XG4gICAqIH0pO1xuICAgKlxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ25nMicsXG4gICAqICAgaW5wdXRzOiBbJ25hbWUnXSxcbiAgICogICB0ZW1wbGF0ZTogJ25nMls8bmcxIFt0aXRsZV09XCJuYW1lXCI+dHJhbnNjbHVkZTwvbmcxPl0oPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PiknXG4gICAqIH0pXG4gICAqIGNsYXNzIE5nMiB7XG4gICAqIH1cbiAgICpcbiAgICogQE5nTW9kdWxlKHtcbiAgICogICBkZWNsYXJhdGlvbnM6IFtOZzIsIGFkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnbmcxJyldLFxuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyIG5hbWU9XCJXb3JsZFwiPnByb2plY3Q8L25nMj4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcbiAgICogICAgICAgXCJuZzJbbmcxW0hlbGxvIFdvcmxkIV0odHJhbnNjbHVkZSldKHByb2plY3QpXCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBib290c3RyYXAoZWxlbWVudDogRWxlbWVudCwgbW9kdWxlcz86IGFueVtdLCBjb25maWc/OiBhbmd1bGFyLklBbmd1bGFyQm9vdHN0cmFwQ29uZmlnKTpcbiAgICAgIFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgICB0aGlzLmRlY2xhcmVOZzFNb2R1bGUobW9kdWxlcyk7XG5cbiAgICBjb25zdCB1cGdyYWRlID0gbmV3IFVwZ3JhZGVBZGFwdGVyUmVmKCk7XG5cbiAgICAvLyBNYWtlIHN1cmUgcmVzdW1lQm9vdHN0cmFwKCkgb25seSBleGlzdHMgaWYgdGhlIGN1cnJlbnQgYm9vdHN0cmFwIGlzIGRlZmVycmVkXG4gICAgY29uc3Qgd2luZG93QW5ndWxhciA9ICh3aW5kb3cgYXMgYW55IC8qKiBUT0RPICM/Pz8/ICovKVsnYW5ndWxhciddO1xuICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHsgYW5ndWxhci5ib290c3RyYXAoZWxlbWVudCwgW3RoaXMubmcxTW9kdWxlLm5hbWVdLCBjb25maWcgISk7IH0pO1xuICAgIGNvbnN0IG5nMUJvb3RzdHJhcFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXA7XG4gICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDtcbiAgICAgICAgICBjb25zdCByID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBQcm9taXNlLmFsbChbdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZC5wcm9taXNlLCBuZzFCb290c3RyYXBQcm9taXNlXSkudGhlbigoW25nMUluamVjdG9yXSkgPT4ge1xuICAgICAgYW5ndWxhci5lbGVtZW50KGVsZW1lbnQpLmRhdGEgIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIHRoaXMubW9kdWxlUmVmICEuaW5qZWN0b3IpO1xuICAgICAgdGhpcy5tb2R1bGVSZWYgIS5pbmplY3Rvci5nZXQ8Tmdab25lPihOZ1pvbmUpLnJ1bihcbiAgICAgICAgICAoKSA9PiB7ICg8YW55PnVwZ3JhZGUpLl9ib290c3RyYXBEb25lKHRoaXMubW9kdWxlUmVmLCBuZzFJbmplY3Rvcik7IH0pO1xuICAgIH0sIG9uRXJyb3IpO1xuICAgIHJldHVybiB1cGdyYWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgc2VydmljZSB0byBiZSBhY2Nlc3NpYmxlIGZyb20gQW5ndWxhci5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIExvZ2luIHsgLi4uIH1cbiAgICogY2xhc3MgU2VydmVyIHsgLi4uIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogICBjb25zdHJ1Y3RvcihASW5qZWN0KCdzZXJ2ZXInKSBzZXJ2ZXIsIGxvZ2luOiBMb2dpbikge1xuICAgKiAgICAgLi4uXG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5zZXJ2aWNlKCdzZXJ2ZXInLCBTZXJ2ZXIpO1xuICAgKiBtb2R1bGUuc2VydmljZSgnbG9naW4nLCBMb2dpbik7XG4gICAqXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKiBhZGFwdGVyLnVwZ3JhZGVOZzFQcm92aWRlcignc2VydmVyJyk7XG4gICAqIGFkYXB0ZXIudXBncmFkZU5nMVByb3ZpZGVyKCdsb2dpbicsIHthc1Rva2VuOiBMb2dpbn0pO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeSgocmVmKSA9PiB7XG4gICAqICAgY29uc3QgZXhhbXBsZTogRXhhbXBsZSA9IHJlZi5uZzJJbmplY3Rvci5nZXQoRXhhbXBsZSk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIHVwZ3JhZGVOZzFQcm92aWRlcihuYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiB7YXNUb2tlbjogYW55fSkge1xuICAgIGNvbnN0IHRva2VuID0gb3B0aW9ucyAmJiBvcHRpb25zLmFzVG9rZW4gfHwgbmFtZTtcbiAgICB0aGlzLnVwZ3JhZGVkUHJvdmlkZXJzLnB1c2goe1xuICAgICAgcHJvdmlkZTogdG9rZW4sXG4gICAgICB1c2VGYWN0b3J5OiAoJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+ICRpbmplY3Rvci5nZXQobmFtZSksXG4gICAgICBkZXBzOiBbJElOSkVDVE9SXVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFyIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXJKUy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEV4YW1wbGUge1xuICAgKiB9XG4gICAqXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKlxuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZmFjdG9yeSgnZXhhbXBsZScsIGFkYXB0ZXIuZG93bmdyYWRlTmcyUHJvdmlkZXIoRXhhbXBsZSkpO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeSgocmVmKSA9PiB7XG4gICAqICAgY29uc3QgZXhhbXBsZTogRXhhbXBsZSA9IHJlZi5uZzFJbmplY3Rvci5nZXQoJ2V4YW1wbGUnKTtcbiAgICogfSk7XG4gICAqXG4gICAqIGBgYFxuICAgKi9cbiAgZG93bmdyYWRlTmcyUHJvdmlkZXIodG9rZW46IGFueSk6IEZ1bmN0aW9uIHsgcmV0dXJuIGRvd25ncmFkZUluamVjdGFibGUodG9rZW4pOyB9XG5cbiAgLyoqXG4gICAqIERlY2xhcmUgdGhlIEFuZ3VsYXJKUyB1cGdyYWRlIG1vZHVsZSBmb3IgdGhpcyBhZGFwdGVyIHdpdGhvdXQgYm9vdHN0cmFwcGluZyB0aGUgd2hvbGVcbiAgICogaHlicmlkIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBhdXRvbWF0aWNhbGx5IGNhbGxlZCBieSBgYm9vdHN0cmFwKClgIGFuZCBgcmVnaXN0ZXJGb3JOZzFUZXN0cygpYC5cbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZXMgVGhlIEFuZ3VsYXJKUyBtb2R1bGVzIHRoYXQgdGhpcyB1cGdyYWRlIG1vZHVsZSBzaG91bGQgZGVwZW5kIHVwb24uXG4gICAqIEByZXR1cm5zIFRoZSBBbmd1bGFySlMgdXBncmFkZSBtb2R1bGUgdGhhdCBpcyBkZWNsYXJlZCBieSB0aGlzIG1ldGhvZFxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgdXBncmFkZUFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKiB1cGdyYWRlQWRhcHRlci5kZWNsYXJlTmcxTW9kdWxlKFsnaGVyb0FwcCddKTtcbiAgICogYGBgXG4gICAqL1xuICBwcml2YXRlIGRlY2xhcmVOZzFNb2R1bGUobW9kdWxlczogc3RyaW5nW10gPSBbXSk6IGFuZ3VsYXIuSU1vZHVsZSB7XG4gICAgY29uc3QgZGVsYXlBcHBseUV4cHM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgICBsZXQgb3JpZ2luYWwkYXBwbHlGbjogRnVuY3Rpb247XG4gICAgbGV0IHJvb3RTY29wZVByb3RvdHlwZTogYW55O1xuICAgIGxldCByb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2U7XG4gICAgY29uc3QgdXBncmFkZUFkYXB0ZXIgPSB0aGlzO1xuICAgIGNvbnN0IG5nMU1vZHVsZSA9IHRoaXMubmcxTW9kdWxlID0gYW5ndWxhci5tb2R1bGVfKHRoaXMuaWRQcmVmaXgsIG1vZHVsZXMpO1xuICAgIGNvbnN0IHBsYXRmb3JtUmVmID0gcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpO1xuXG4gICAgdGhpcy5uZ1pvbmUgPSBuZXcgTmdab25lKHtlbmFibGVMb25nU3RhY2tUcmFjZTogWm9uZS5oYXNPd25Qcm9wZXJ0eSgnbG9uZ1N0YWNrVHJhY2Vab25lU3BlYycpfSk7XG4gICAgdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIG5nMU1vZHVsZS5jb25zdGFudChVUEdSQURFX0FQUF9UWVBFX0tFWSwgVXBncmFkZUFwcFR5cGUuRHluYW1pYylcbiAgICAgICAgLmZhY3RvcnkoSU5KRUNUT1JfS0VZLCAoKSA9PiB0aGlzLm1vZHVsZVJlZiAhLmluamVjdG9yLmdldChJbmplY3RvcikpXG4gICAgICAgIC5mYWN0b3J5KFxuICAgICAgICAgICAgTEFaWV9NT0RVTEVfUkVGLFxuICAgICAgICAgICAgW0lOSkVDVE9SX0tFWSwgKGluamVjdG9yOiBJbmplY3RvcikgPT4gKHsgaW5qZWN0b3IgfSBhcyBMYXp5TW9kdWxlUmVmKV0pXG4gICAgICAgIC5jb25zdGFudChOR19aT05FX0tFWSwgdGhpcy5uZ1pvbmUpXG4gICAgICAgIC5mYWN0b3J5KENPTVBJTEVSX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYgIS5pbmplY3Rvci5nZXQoQ29tcGlsZXIpKVxuICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAnJHByb3ZpZGUnLCAnJGluamVjdG9yJyxcbiAgICAgICAgICAocHJvdmlkZTogYW5ndWxhci5JUHJvdmlkZVNlcnZpY2UsIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgIHByb3ZpZGUuZGVjb3JhdG9yKCRST09UX1NDT1BFLCBbXG4gICAgICAgICAgICAgICckZGVsZWdhdGUnLFxuICAgICAgICAgICAgICBmdW5jdGlvbihyb290U2NvcGVEZWxlZ2F0ZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSkge1xuICAgICAgICAgICAgICAgIC8vIENhcHR1cmUgdGhlIHJvb3QgYXBwbHkgc28gdGhhdCB3ZSBjYW4gZGVsYXkgZmlyc3QgY2FsbCB0byAkYXBwbHkgdW50aWwgd2VcbiAgICAgICAgICAgICAgICAvLyBib290c3RyYXAgQW5ndWxhciBhbmQgdGhlbiB3ZSByZXBsYXkgYW5kIHJlc3RvcmUgdGhlICRhcHBseS5cbiAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSByb290U2NvcGVEZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnJGFwcGx5JykpIHtcbiAgICAgICAgICAgICAgICAgIG9yaWdpbmFsJGFwcGx5Rm4gPSByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5O1xuICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IChleHA6IGFueSkgPT4gZGVsYXlBcHBseUV4cHMucHVzaChleHApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBmaW5kIFxcJyRhcHBseVxcJyBvbiBcXCckcm9vdFNjb3BlXFwnIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlID0gcm9vdFNjb3BlRGVsZWdhdGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgaWYgKG5nMUluamVjdG9yLmhhcygkJFRFU1RBQklMSVRZKSkge1xuICAgICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcigkJFRFU1RBQklMSVRZLCBbXG4gICAgICAgICAgICAgICAgJyRkZWxlZ2F0ZScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24odGVzdGFiaWxpdHlEZWxlZ2F0ZTogYW5ndWxhci5JVGVzdGFiaWxpdHlTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbFdoZW5TdGFibGU6IEZ1bmN0aW9uID0gdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1doZW5TdGFibGUgPSBmdW5jdGlvbihjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxXaGVuU3RhYmxlLmNhbGwodGhpcywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdXBncmFkZUFkYXB0ZXIubW9kdWxlUmVmICEuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAobmcyVGVzdGFiaWxpdHkuaXNTdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmcyVGVzdGFiaWxpdHkud2hlblN0YWJsZShuZXdXaGVuU3RhYmxlLmJpbmQodGhpcywgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdKTtcblxuICAgIG5nMU1vZHVsZS5ydW4oW1xuICAgICAgJyRpbmplY3RvcicsICckcm9vdFNjb3BlJyxcbiAgICAgIChuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCByb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UpID0+IHtcbiAgICAgICAgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyLnJlc29sdmUodGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkLCBuZzFJbmplY3RvcilcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgLy8gTm90ZTogVGhlcmUgaXMgYSBidWcgaW4gVFMgMi40IHRoYXQgcHJldmVudHMgdXMgZnJvbVxuICAgICAgICAgICAgICAvLyBpbmxpbmluZyB0aGlzIGludG8gQE5nTW9kdWxlXG4gICAgICAgICAgICAgIC8vIFRPRE8odGJvc2NoKTogZmluZCBvciBmaWxlIGEgYnVnIGFnYWluc3QgVHlwZVNjcmlwdCBmb3IgdGhpcy5cbiAgICAgICAgICAgICAgY29uc3QgbmdNb2R1bGUgPSB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgICAgICAgICB7cHJvdmlkZTogJElOSkVDVE9SLCB1c2VGYWN0b3J5OiAoKSA9PiBuZzFJbmplY3Rvcn0sXG4gICAgICAgICAgICAgICAgICB7cHJvdmlkZTogJENPTVBJTEUsIHVzZUZhY3Rvcnk6ICgpID0+IG5nMUluamVjdG9yLmdldCgkQ09NUElMRSl9LFxuICAgICAgICAgICAgICAgICAgdGhpcy51cGdyYWRlZFByb3ZpZGVyc1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgaW1wb3J0czogW3Jlc29sdmVGb3J3YXJkUmVmKHRoaXMubmcyQXBwTW9kdWxlKV0sXG4gICAgICAgICAgICAgICAgZW50cnlDb21wb25lbnRzOiB0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2UgaGF2ZSBuZzEgaW5qZWN0b3IgYW5kIHdlIGhhdmUgcHJlcGFyZWRcbiAgICAgICAgICAgICAgLy8gbmcxIGNvbXBvbmVudHMgdG8gYmUgdXBncmFkZWQsIHdlIG5vdyBjYW4gYm9vdHN0cmFwIG5nMi5cbiAgICAgICAgICAgICAgQE5nTW9kdWxlKHtqaXQ6IHRydWUsIC4uLm5nTW9kdWxlfSlcbiAgICAgICAgICAgICAgY2xhc3MgRHluYW1pY05nVXBncmFkZU1vZHVsZSB7XG4gICAgICAgICAgICAgICAgY29uc3RydWN0b3IoKSB7fVxuICAgICAgICAgICAgICAgIG5nRG9Cb290c3RyYXAoKSB7fVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBsYXRmb3JtUmVmXG4gICAgICAgICAgICAgICAgICAuYm9vdHN0cmFwTW9kdWxlKFxuICAgICAgICAgICAgICAgICAgICAgIER5bmFtaWNOZ1VwZ3JhZGVNb2R1bGUsIFt0aGlzLmNvbXBpbGVyT3B0aW9ucyAhLCB7bmdab25lOiB0aGlzLm5nWm9uZX1dKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlZjogTmdNb2R1bGVSZWY8YW55PikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZVJlZiA9IHJlZjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vdFNjb3BlUHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5ID0gb3JpZ2luYWwkYXBwbHlGbjsgIC8vIHJlc3RvcmUgb3JpZ2luYWwgJGFwcGx5XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZGVsYXlBcHBseUV4cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RTY29wZS4kYXBwbHkoZGVsYXlBcHBseUV4cHMuc2hpZnQoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZC5yZXNvbHZlKG5nMUluamVjdG9yKSwgb25FcnJvcilcbiAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHN1YnNjcmlwdGlvbiA9IHRoaXMubmdab25lLm9uTWljcm90YXNrRW1wdHkuc3Vic2NyaWJlKHtcbiAgICAgICAgICAgICAgICAgICAgICBuZXh0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm9vdFNjb3BlLiQkcGhhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGV2TW9kZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQSBkaWdlc3Qgd2FzIHRyaWdnZXJlZCB3aGlsZSBvbmUgd2FzIGFscmVhZHkgaW4gcHJvZ3Jlc3MuIFRoaXMgbWF5IG1lYW4gdGhhdCBzb21ldGhpbmcgaXMgdHJpZ2dlcmluZyBkaWdlc3RzIG91dHNpZGUgdGhlIEFuZ3VsYXIgem9uZS4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByb290U2NvcGUuJGV2YWxBc3luYygoKSA9PiB7fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByb290U2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4geyBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTsgfSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucmVqZWN0KGUpKTtcbiAgICAgIH1cbiAgICBdKTtcblxuICAgIHJldHVybiBuZzFNb2R1bGU7XG4gIH1cbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhckpTJ3MgJGNvbXBpbGUuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGluamVjdG9yICE6IEluamVjdG9yO1xuICBwcml2YXRlIGNhbGxiYWNrczogKChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSlbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgLy8gc3RvcmUgdGhlIHByb21pc2Ugb24gdGhlIGVsZW1lbnRcbiAgICBlbGVtZW50LmRhdGEgIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIHRoaXMpO1xuICB9XG5cbiAgdGhlbihjYWxsYmFjazogKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KSB7XG4gICAgaWYgKHRoaXMuaW5qZWN0b3IpIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMuaW5qZWN0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZXNvbHZlKGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMuaW5qZWN0b3IgPSBpbmplY3RvcjtcblxuICAgIC8vIHJlc2V0IHRoZSBlbGVtZW50IGRhdGEgdG8gcG9pbnQgdG8gdGhlIHJlYWwgaW5qZWN0b3JcbiAgICB0aGlzLmVsZW1lbnQuZGF0YSAhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgaW5qZWN0b3IpO1xuXG4gICAgLy8gY2xlYW4gb3V0IHRoZSBlbGVtZW50IHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbCAhO1xuXG4gICAgLy8gcnVuIGFsbCB0aGUgcXVldWVkIGNhbGxiYWNrc1xuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrKSA9PiBjYWxsYmFjayhpbmplY3RvcikpO1xuICAgIHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuXG4vKipcbiAqIFVzZSBgVXBncmFkZUFkYXB0ZXJSZWZgIHRvIGNvbnRyb2wgYSBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAZGVwcmVjYXRlZCBEZXByZWNhdGVkIHNpbmNlIHY1LiBVc2UgYHVwZ3JhZGUvc3RhdGljYCBpbnN0ZWFkLCB3aGljaCBhbHNvIHN1cHBvcnRzXG4gKiBbQWhlYWQtb2YtVGltZSBjb21waWxhdGlvbl0oZ3VpZGUvYW90LWNvbXBpbGVyKS5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX3JlYWR5Rm46ICgodXBncmFkZUFkYXB0ZXJSZWY/OiBVcGdyYWRlQWRhcHRlclJlZikgPT4gdm9pZCl8bnVsbCA9IG51bGw7XG5cbiAgcHVibGljIG5nMVJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSA9IG51bGwgITtcbiAgcHVibGljIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UgPSBudWxsICE7XG4gIHB1YmxpYyBuZzJNb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT4gPSBudWxsICE7XG4gIHB1YmxpYyBuZzJJbmplY3RvcjogSW5qZWN0b3IgPSBudWxsICE7XG5cbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Jvb3RzdHJhcERvbmUobmdNb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT4sIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpIHtcbiAgICB0aGlzLm5nMk1vZHVsZVJlZiA9IG5nTW9kdWxlUmVmO1xuICAgIHRoaXMubmcySW5qZWN0b3IgPSBuZ01vZHVsZVJlZi5pbmplY3RvcjtcbiAgICB0aGlzLm5nMUluamVjdG9yID0gbmcxSW5qZWN0b3I7XG4gICAgdGhpcy5uZzFSb290U2NvcGUgPSBuZzFJbmplY3Rvci5nZXQoJFJPT1RfU0NPUEUpO1xuICAgIHRoaXMuX3JlYWR5Rm4gJiYgdGhpcy5fcmVhZHlGbih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIGlzIG5vdGlmaWVkIHVwb24gc3VjY2Vzc2Z1bCBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhclxuICAgKiBhcHBsaWNhdGlvbiBoYXMgYmVlbiBib290c3RyYXBwZWQuXG4gICAqXG4gICAqIFRoZSBgcmVhZHlgIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGludm9rZWQgaW5zaWRlIHRoZSBBbmd1bGFyIHpvbmUsIHRoZXJlZm9yZSBpdCBkb2VzIG5vdFxuICAgKiByZXF1aXJlIGEgY2FsbCB0byBgJGFwcGx5KClgLlxuICAgKi9cbiAgcHVibGljIHJlYWR5KGZuOiAodXBncmFkZUFkYXB0ZXJSZWY6IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkKSB7IHRoaXMuX3JlYWR5Rm4gPSBmbjsgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIG9mIHJ1bm5pbmcgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXIgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICB0aGlzLm5nMUluamVjdG9yICEuZ2V0KCRST09UX1NDT1BFKS4kZGVzdHJveSgpO1xuICAgIHRoaXMubmcyTW9kdWxlUmVmICEuZGVzdHJveSgpO1xuICB9XG59XG4iXX0=