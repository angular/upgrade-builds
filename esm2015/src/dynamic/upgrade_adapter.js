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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvZHluYW1pYy91cGdyYWRlX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsUUFBUSxFQUE4QixRQUFRLEVBQUUsUUFBUSxFQUFlLE1BQU0sRUFBa0IsV0FBVyxFQUFPLE1BQU0sZUFBZSxDQUFDO0FBQy9JLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBRXpFLE9BQU8sS0FBSyxPQUFPLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM5SSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQztBQUNqRSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNuRSxPQUFPLEVBQUMsUUFBUSxFQUFpQixhQUFhLEVBQUUsT0FBTyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0UsT0FBTyxFQUFDLGlDQUFpQyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7O0FBRXhFLElBQUksWUFBWSxHQUFXLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1GN0IsTUFBTTs7Ozs7SUFxQkosWUFBb0IsWUFBdUIsRUFBVSxlQUFpQztRQUFsRSxpQkFBWSxHQUFaLFlBQVksQ0FBVztRQUFVLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjt3QkFwQjNELGVBQWUsWUFBWSxFQUFFLEdBQUc7b0NBQ2YsRUFBRTs7Ozs7Ozs7O3lDQVMyQyxFQUFFO2lDQUM3QyxFQUFFO3lCQUtMLElBQUk7UUFLN0MsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNqQixNQUFNLElBQUksS0FBSyxDQUNYLCtFQUErRSxDQUFDLENBQUM7U0FDdEY7S0FDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBOERELHFCQUFxQixDQUFDLFNBQW9CO1FBQ3hDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFMUMsT0FBTyxrQkFBa0IsQ0FBQyxFQUFDLFNBQVMsRUFBQyxDQUFDLENBQUM7S0FDeEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWdGRCxtQkFBbUIsQ0FBQyxJQUFZO1FBQzlCLElBQUksbUJBQU0sSUFBSSxDQUFDLHlCQUF5QixFQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlELE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztTQUNsRDthQUFNO1lBQ0wsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUN0RixJQUFJLENBQUM7U0FDWDtLQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBNENELG1CQUFtQixDQUFDLE9BQWtCOztRQUNwQyxNQUFNLFlBQVksR0FBRyxtQkFBQyxNQUFhLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDckQsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7WUFDekMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1NBQzVEO1FBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9CLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7UUFDekMsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNsQyxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsbUJBQU0sT0FBTyxFQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9GLE9BQU8sT0FBTyxDQUFDO0tBQ2hCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQStDRCxTQUFTLENBQUMsT0FBZ0IsRUFBRSxPQUFlLEVBQUUsTUFBd0M7UUFFbkYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDOztRQUUvQixNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7O1FBR3hDLE1BQU0sYUFBYSxHQUFHLG1CQUFDLE1BQWEsQ0FBQyxpQkFBaUIsb0JBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRSxhQUFhLENBQUMsZUFBZSxHQUFHLFNBQVMsQ0FBQztRQUUxQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHFCQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztRQUN4RixNQUFNLG1CQUFtQixHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDbEQsSUFBSSxhQUFhLENBQUMsZUFBZSxFQUFFOztnQkFDakMsTUFBTSx1QkFBdUIsR0FBZSxhQUFhLENBQUMsZUFBZSxDQUFDO2dCQUMxRSxhQUFhLENBQUMsZUFBZSxHQUFHO29CQUM5QixhQUFhLENBQUMsZUFBZSxHQUFHLHVCQUF1QixDQUFDOztvQkFDeEQsTUFBTSxDQUFDLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUMvRCxPQUFPLEVBQUUsQ0FBQztvQkFDVixPQUFPLENBQUMsQ0FBQztpQkFDVixDQUFDO2FBQ0g7aUJBQU07Z0JBQ0wsT0FBTyxFQUFFLENBQUM7YUFDWDtTQUNGLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUU7K0JBQzNGLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMscUJBQUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRO2NBQ3RGLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBUyxNQUFNLEVBQUUsR0FBRyxDQUM3QyxHQUFHLEVBQUUsR0FBRyxtQkFBTSxPQUFPLEVBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFO1NBQzFFLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDWixPQUFPLE9BQU8sQ0FBQztLQUNoQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFpQ0Qsa0JBQWtCLENBQUMsSUFBWSxFQUFFLE9BQXdCOztRQUN2RCxNQUFNLEtBQUssR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUM7UUFDakQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQztZQUMxQixPQUFPLEVBQUUsS0FBSztZQUNkLFVBQVUsRUFBRSxDQUFDLFNBQW1DLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ3hFLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQztTQUNsQixDQUFDLENBQUM7S0FDSjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBdUJELG9CQUFvQixDQUFDLEtBQVUsSUFBYyxPQUFPLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQW1CekUsZ0JBQWdCLENBQUMsVUFBb0IsRUFBRTs7UUFDN0MsTUFBTSxjQUFjLEdBQWUsRUFBRSxDQUFDOztRQUN0QyxJQUFJLGdCQUFnQixDQUFXOztRQUMvQixJQUFJLGtCQUFrQixDQUFNOztRQUM1QixJQUFJLFNBQVMsQ0FBNEI7O1FBQ3pDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQzs7UUFDNUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7O1FBQzFFLE1BQU0sV0FBVyxHQUFHLHNCQUFzQixFQUFFLENBQUM7UUFFN0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsRUFBQyxDQUFDLENBQUM7UUFDaEcsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFDM0MsU0FBUyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLG9CQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN6RSxPQUFPLENBQ0osZUFBZSxFQUNmO1lBQ0UsWUFBWTtZQUNaLENBQUMsUUFBa0IsRUFBRSxFQUFFLENBQUMsbUJBQUMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBbUIsRUFBQztTQUM1RSxDQUFDO2FBQ0wsUUFBUSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ2xDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFLG9CQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNwRSxNQUFNLENBQUM7WUFDTixVQUFVLEVBQUUsV0FBVztZQUN2QixDQUFDLE9BQWdDLEVBQUUsV0FBcUMsRUFBRSxFQUFFO2dCQUMxRSxPQUFPLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRTtvQkFDN0IsV0FBVztvQkFDWCxVQUFTLGlCQUE0Qzs7O3dCQUduRCxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO3dCQUM3RCxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRTs0QkFDL0MsZ0JBQWdCLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDOzRCQUM3QyxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFRLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQ3BFOzZCQUFNOzRCQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQzt5QkFDakU7d0JBQ0QsT0FBTyxTQUFTLEdBQUcsaUJBQWlCLENBQUM7cUJBQ3RDO2lCQUNGLENBQUMsQ0FBQztnQkFDSCxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUU7b0JBQ2xDLE9BQU8sQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFO3dCQUMvQixXQUFXO3dCQUNYLFVBQVMsbUJBQWdEOzs0QkFDdkQsTUFBTSxrQkFBa0IsR0FBYSxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7OzRCQUVwRSxNQUFNLGFBQWEsR0FBRyxVQUFTLFFBQWtCO2dDQUMvQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFOztvQ0FDNUIsTUFBTSxjQUFjLHNCQUNoQixjQUFjLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO29DQUN6RCxJQUFJLGNBQWMsQ0FBQyxRQUFRLEVBQUUsRUFBRTt3Q0FDN0IsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7cUNBQ2pDO3lDQUFNO3dDQUNMLGNBQWMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztxQ0FDL0Q7aUNBQ0YsQ0FBQyxDQUFDOzZCQUNKLENBQUM7NEJBRUYsbUJBQW1CLENBQUMsVUFBVSxHQUFHLGFBQWEsQ0FBQzs0QkFDL0MsT0FBTyxtQkFBbUIsQ0FBQzt5QkFDNUI7cUJBQ0YsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFUCxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQ1osV0FBVyxFQUFFLFlBQVk7WUFDekIsQ0FBQyxXQUFxQyxFQUFFLFNBQW9DLEVBQUUsRUFBRTtnQkFDOUUsaUNBQWlDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxXQUFXLENBQUM7cUJBQ2pGLElBQUksQ0FBQyxHQUFHLEVBQUU7O29CQUlULE1BQU0sUUFBUSxHQUFHO3dCQUNmLFNBQVMsRUFBRTs0QkFDVCxFQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLFdBQVcsRUFBQzs0QkFDbkQsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFDOzRCQUNoRSxJQUFJLENBQUMsaUJBQWlCO3lCQUN2Qjt3QkFDRCxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO3dCQUM1QixlQUFlLEVBQUUsSUFBSSxDQUFDLG9CQUFvQjtxQkFDM0MsQ0FBQztvQkFHRjt3QkFFRSxpQkFBZ0I7Ozs7d0JBQ2hCLGFBQWEsTUFBSzs7O2dDQUhuQixRQUFRLHlCQUFFLEdBQUcsRUFBRSxJQUFJLElBQUssUUFBUTs7OztvQkFLakMsV0FBVzt5QkFDTixlQUFlLENBQ1osc0JBQXNCLEVBQUUsb0JBQUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQzt5QkFDM0UsSUFBSSxDQUFDLENBQUMsR0FBcUIsRUFBRSxFQUFFO3dCQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQzt3QkFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFOzRCQUNuQixJQUFJLGtCQUFrQixFQUFFO2dDQUN0QixrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUM7Z0NBQzdDLE9BQU8sY0FBYyxDQUFDLE1BQU0sRUFBRTtvQ0FDNUIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztpQ0FDMUM7Z0NBQ0Qsa0JBQWtCLEdBQUcsSUFBSSxDQUFDOzZCQUMzQjt5QkFDRixDQUFDLENBQUM7cUJBQ0osQ0FBQzt5QkFDRCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLENBQUM7eUJBQ25FLElBQUksQ0FBQyxHQUFHLEVBQUU7O3dCQUNULElBQUksWUFBWSxHQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxDQUFDLENBQUM7d0JBQzlFLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRSxHQUFHLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDbEUsQ0FBQyxDQUFDO2lCQUNSLENBQUM7cUJBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEQ7U0FDRixDQUFDLENBQUM7UUFFSCxPQUFPLFNBQVMsQ0FBQzs7Q0FFcEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTUQ7Ozs7SUFLRSxZQUFvQixPQUFpQztRQUFqQyxZQUFPLEdBQVAsT0FBTyxDQUEwQjt5QkFGQSxFQUFFOzs7UUFJckQsT0FBTyxDQUFDLElBQUksR0FBRyxhQUFhLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSTtLQUNqRDs7Ozs7SUFFRCxJQUFJLENBQUMsUUFBcUM7UUFDeEMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDekI7YUFBTTtZQUNMLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQy9CO0tBQ0Y7Ozs7O0lBRUQsT0FBTyxDQUFDLFFBQWtCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOzs7UUFHekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLFFBQVE7O1FBR3pELElBQUksQ0FBQyxPQUFPLHNCQUFHLElBQUksRUFBRSxDQUFDOztRQUd0QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0tBQzNCO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7OztBQVNELE1BQU07O3dCQUV1RSxJQUFJOytDQUU5QixJQUFJOzhDQUNOLElBQUk7K0NBQ1gsSUFBSTs4Q0FDYixJQUFJOzs7Ozs7O0lBRzNCLGNBQWMsQ0FBQyxXQUE2QixFQUFFLFdBQXFDO1FBQ3pGLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDOzs7Ozs7Ozs7OztJQVVoQyxLQUFLLENBQUMsRUFBa0QsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs7Ozs7SUFLL0UsT0FBTzsyQkFDWixJQUFJLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsUUFBUTtVQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU87O0NBRTlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVyLCBDb21waWxlck9wdGlvbnMsIERpcmVjdGl2ZSwgSW5qZWN0b3IsIE5nTW9kdWxlLCBOZ01vZHVsZVJlZiwgTmdab25lLCBTdGF0aWNQcm92aWRlciwgVGVzdGFiaWxpdHksIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtwbGF0Zm9ybUJyb3dzZXJEeW5hbWljfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyLWR5bmFtaWMnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5pbXBvcnQgeyQkVEVTVEFCSUxJVFksICRDT01QSUxFLCAkSU5KRUNUT1IsICRST09UX1NDT1BFLCBDT01QSUxFUl9LRVksIElOSkVDVE9SX0tFWSwgTEFaWV9NT0RVTEVfUkVGLCBOR19aT05FX0tFWX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge2Rvd25ncmFkZUNvbXBvbmVudH0gZnJvbSAnLi4vY29tbW9uL2Rvd25ncmFkZV9jb21wb25lbnQnO1xuaW1wb3J0IHtkb3duZ3JhZGVJbmplY3RhYmxlfSBmcm9tICcuLi9jb21tb24vZG93bmdyYWRlX2luamVjdGFibGUnO1xuaW1wb3J0IHtEZWZlcnJlZCwgTGF6eU1vZHVsZVJlZiwgY29udHJvbGxlcktleSwgb25FcnJvcn0gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuXG5pbXBvcnQge1VwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0gZnJvbSAnLi91cGdyYWRlX25nMV9hZGFwdGVyJztcblxubGV0IHVwZ3JhZGVDb3VudDogbnVtYmVyID0gMDtcblxuLyoqXG4gKiBVc2UgYFVwZ3JhZGVBZGFwdGVyYCB0byBhbGxvdyBBbmd1bGFySlMgYW5kIEFuZ3VsYXIgdG8gY29leGlzdCBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiBUaGUgYFVwZ3JhZGVBZGFwdGVyYCBhbGxvd3M6XG4gKiAxLiBjcmVhdGlvbiBvZiBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyBjb21wb25lbnQgZGlyZWN0aXZlXG4gKiAgICAoU2VlIFtVcGdyYWRlQWRhcHRlciN1cGdyYWRlTmcxQ29tcG9uZW50KCldKVxuICogMi4gY3JlYXRpb24gb2YgQW5ndWxhckpTIGRpcmVjdGl2ZSBmcm9tIEFuZ3VsYXIgY29tcG9uZW50LlxuICogICAgKFNlZSBbVXBncmFkZUFkYXB0ZXIjZG93bmdyYWRlTmcyQ29tcG9uZW50KCldKVxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgQW5ndWxhckpTIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA0LiBBbmd1bGFyIGNvbXBvbmVudHMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIEFuZ3VsYXIgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDUuIEFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FuIGJlIHVwZ3JhZGVkIHRvIGFuIEFuZ3VsYXIgY29tcG9uZW50LiBUaGlzIGNyZWF0ZXMgYW5cbiAqICAgIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZSBpbiB0aGF0IGxvY2F0aW9uLlxuICogNi4gQW4gQW5ndWxhciBjb21wb25lbnQgY2FuIGJlIGRvd25ncmFkZWQgdG8gYW4gQW5ndWxhckpTIGNvbXBvbmVudCBkaXJlY3RpdmUuIFRoaXMgY3JlYXRlc1xuICogICAgYW4gQW5ndWxhckpTIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhciBjb21wb25lbnQgaW4gdGhhdCBsb2NhdGlvbi5cbiAqIDcuIFdoZW5ldmVyIGFuIGFkYXB0ZXIgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IHRoZSBmcmFtZXdvcmtcbiAqICAgIGRvaW5nIHRoZSBpbnN0YW50aWF0aW9uLiBUaGUgb3RoZXIgZnJhbWV3b3JrIHRoZW4gaW5zdGFudGlhdGVzIGFuZCBvd25zIHRoZSB2aWV3IGZvciB0aGF0XG4gKiAgICBjb21wb25lbnQuIFRoaXMgaW1wbGllcyB0aGF0IGNvbXBvbmVudCBiaW5kaW5ncyB3aWxsIGFsd2F5cyBmb2xsb3cgdGhlIHNlbWFudGljcyBvZiB0aGVcbiAqICAgIGluc3RhbnRpYXRpb24gZnJhbWV3b3JrLiBUaGUgc3ludGF4IGlzIGFsd2F5cyB0aGF0IG9mIEFuZ3VsYXIgc3ludGF4LlxuICogOC4gQW5ndWxhckpTIGlzIGFsd2F5cyBib290c3RyYXBwZWQgZmlyc3QgYW5kIG93bnMgdGhlIGJvdHRvbSBtb3N0IHZpZXcuXG4gKiA5LiBUaGUgbmV3IGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gQW5ndWxhciB6b25lLCBhbmQgdGhlcmVmb3JlIGl0IG5vIGxvbmdlciBuZWVkcyBjYWxscyB0b1xuICogICAgYCRhcHBseSgpYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihmb3J3YXJkUmVmKCgpID0+IE15TmcyTW9kdWxlKSwgbXlDb21waWxlck9wdGlvbnMpO1xuICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMkNvbXAnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzJDb21wb25lbnQpKTtcbiAqXG4gKiBtb2R1bGUuZGlyZWN0aXZlKCduZzFIZWxsbycsIGZ1bmN0aW9uKCkge1xuICogICByZXR1cm4ge1xuICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gKiAgIH07XG4gKiB9KTtcbiAqXG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbmcyLWNvbXAnLFxuICogICBpbnB1dHM6IFsnbmFtZSddLFxuICogICB0ZW1wbGF0ZTogJ25nMls8bmcxLWhlbGxvIFt0aXRsZV09XCJuYW1lXCI+dHJhbnNjbHVkZTwvbmcxLWhlbGxvPl0oPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PiknLFxuICogICBkaXJlY3RpdmVzOlxuICogfSlcbiAqIGNsYXNzIE5nMkNvbXBvbmVudCB7XG4gKiB9XG4gKlxuICogQE5nTW9kdWxlKHtcbiAqICAgZGVjbGFyYXRpb25zOiBbTmcyQ29tcG9uZW50LCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMUhlbGxvJyldLFxuICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAqIH0pXG4gKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICpcbiAqXG4gKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyLWNvbXAgbmFtZT1cIldvcmxkXCI+cHJvamVjdDwvbmcyLWNvbXA+JztcbiAqXG4gKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gKiAgICAgICBcIm5nMltuZzFbSGVsbG8gV29ybGQhXSh0cmFuc2NsdWRlKV0ocHJvamVjdClcIik7XG4gKiB9KTtcbiAqXG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBEZXByZWNhdGVkIHNpbmNlIHY1LiBVc2UgYHVwZ3JhZGUvc3RhdGljYCBpbnN0ZWFkLCB3aGljaCBhbHNvIHN1cHBvcnRzXG4gKiBbQWhlYWQtb2YtVGltZSBjb21waWxhdGlvbl0oZ3VpZGUvYW90LWNvbXBpbGVyKS5cbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpZFByZWZpeDogc3RyaW5nID0gYE5HMl9VUEdSQURFXyR7dXBncmFkZUNvdW50Kyt9X2A7XG4gIHByaXZhdGUgZG93bmdyYWRlZENvbXBvbmVudHM6IFR5cGU8YW55PltdID0gW107XG4gIC8qKlxuICAgKiBBbiBpbnRlcm5hbCBtYXAgb2YgbmcxIGNvbXBvbmVudHMgd2hpY2ggbmVlZCB0byB1cCB1cGdyYWRlZCB0byBuZzIuXG4gICAqXG4gICAqIFdlIGNhbid0IHVwZ3JhZGUgdW50aWwgaW5qZWN0b3IgaXMgaW5zdGFudGlhdGVkIGFuZCB3ZSBjYW4gcmV0cmlldmUgdGhlIGNvbXBvbmVudCBtZXRhZGF0YS5cbiAgICogRm9yIHRoaXMgcmVhc29uIHdlIGtlZXAgYSBsaXN0IG9mIGNvbXBvbmVudHMgdG8gdXBncmFkZSB1bnRpbCBuZzEgaW5qZWN0b3IgaXMgYm9vdHN0cmFwcGVkLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHByaXZhdGUgbmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZDoge1tuYW1lOiBzdHJpbmddOiBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9ID0ge307XG4gIHByaXZhdGUgdXBncmFkZWRQcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbXTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgbmdab25lICE6IE5nWm9uZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgbmcxTW9kdWxlICE6IGFuZ3VsYXIuSU1vZHVsZTtcbiAgcHJpdmF0ZSBtb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT58bnVsbCA9IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIG5nMkJvb3RzdHJhcERlZmVycmVkICE6IERlZmVycmVkPGFuZ3VsYXIuSUluamVjdG9yU2VydmljZT47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuZzJBcHBNb2R1bGU6IFR5cGU8YW55PiwgcHJpdmF0ZSBjb21waWxlck9wdGlvbnM/OiBDb21waWxlck9wdGlvbnMpIHtcbiAgICBpZiAoIW5nMkFwcE1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdVcGdyYWRlQWRhcHRlciBjYW5ub3QgYmUgaW5zdGFudGlhdGVkIHdpdGhvdXQgYW4gTmdNb2R1bGUgb2YgdGhlIEFuZ3VsYXIgYXBwLicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciBDb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXJKUy5cbiAgICpcbiAgICogVXNlIGBkb3duZ3JhZGVOZzJDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFySlMgRGlyZWN0aXZlIERlZmluaXRpb24gRmFjdG9yeSBmcm9tXG4gICAqIEFuZ3VsYXIgQ29tcG9uZW50LiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIHdpdGhpbiB0aGVcbiAgICogQW5ndWxhckpTIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgTWVudGFsIE1vZGVsXG4gICAqXG4gICAqIDEuIFRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGJ5IGJlaW5nIGxpc3RlZCBpbiBBbmd1bGFySlMgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhckpTLCBidXQgdGhlIGNvbXBvbmVudCdzIHZpZXcgd2lsbCBiZSBjb250cm9sbGVkIGJ5XG4gICAqICAgIEFuZ3VsYXIuXG4gICAqIDIuIEV2ZW4gdGhvdWdodCB0aGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBpbiBBbmd1bGFySlMsIGl0IHdpbGwgYmUgdXNpbmcgQW5ndWxhclxuICAgKiAgICBzeW50YXguIFRoaXMgaGFzIHRvIGJlIGRvbmUsIHRoaXMgd2F5IGJlY2F1c2Ugd2UgbXVzdCBmb2xsb3cgQW5ndWxhciBjb21wb25lbnRzIGRvIG5vdFxuICAgKiAgICBkZWNsYXJlIGhvdyB0aGUgYXR0cmlidXRlcyBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXG4gICAqIDMuIGBuZy1tb2RlbGAgaXMgY29udHJvbGxlZCBieSBBbmd1bGFySlMgYW5kIGNvbW11bmljYXRlcyB3aXRoIHRoZSBkb3duZ3JhZGVkIEFuZ3VsYXIgY29tcG9uZW50XG4gICAqICAgIGJ5IHdheSBvZiB0aGUgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UgZnJvbSBAYW5ndWxhci9mb3Jtcy4gT25seSBjb21wb25lbnRzIHRoYXRcbiAgICogICAgaW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlIGFyZSBlbGlnaWJsZS5cbiAgICpcbiAgICogIyMjIFN1cHBvcnRlZCBGZWF0dXJlc1xuICAgKlxuICAgKiAtIEJpbmRpbmdzOlxuICAgKiAgIC0gQXR0cmlidXRlOiBgPGNvbXAgbmFtZT1cIldvcmxkXCI+YFxuICAgKiAgIC0gSW50ZXJwb2xhdGlvbjogIGA8Y29tcCBncmVldGluZz1cIkhlbGxvIHt7bmFtZX19IVwiPmBcbiAgICogICAtIEV4cHJlc3Npb246ICBgPGNvbXAgW25hbWVdPVwidXNlcm5hbWVcIj5gXG4gICAqICAgLSBFdmVudDogIGA8Y29tcCAoY2xvc2UpPVwiZG9Tb21ldGhpbmcoKVwiPmBcbiAgICogICAtIG5nLW1vZGVsOiBgPGNvbXAgbmctbW9kZWw9XCJuYW1lXCI+YFxuICAgKiAtIENvbnRlbnQgcHJvamVjdGlvbjogeWVzXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChHcmVldGVyKSk7XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICAgKiAgIHRlbXBsYXRlOiAne3tzYWx1dGF0aW9ufX0ge3tuYW1lfX0hIC0gPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PidcbiAgICogfSlcbiAgICogY2xhc3MgR3JlZXRlciB7XG4gICAqICAgQElucHV0KCkgc2FsdXRhdGlvbjogc3RyaW5nO1xuICAgKiAgIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW0dyZWV0ZXJdLFxuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9XG4gICAqICAgJ25nMSB0ZW1wbGF0ZTogPGdyZWV0IHNhbHV0YXRpb249XCJIZWxsb1wiIFtuYW1lXT1cIndvcmxkXCI+dGV4dDwvZ3JlZXQ+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXCJuZzEgdGVtcGxhdGU6IEhlbGxvIHdvcmxkISAtIHRleHRcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGRvd25ncmFkZU5nMkNvbXBvbmVudChjb21wb25lbnQ6IFR5cGU8YW55Pik6IEZ1bmN0aW9uIHtcbiAgICB0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcblxuICAgIHJldHVybiBkb3duZ3JhZGVDb21wb25lbnQoe2NvbXBvbmVudH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgQ29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFyLlxuICAgKlxuICAgKiBVc2UgYHVwZ3JhZGVOZzFDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyBDb21wb25lbnRcbiAgICogZGlyZWN0aXZlLiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFySlMgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZSBBbmd1bGFyXG4gICAqIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgTWVudGFsIE1vZGVsXG4gICAqXG4gICAqIDEuIFRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGJ5IGJlaW5nIGxpc3RlZCBpbiBBbmd1bGFyIHRlbXBsYXRlLiBUaGlzIG1lYW5zIHRoYXQgdGhlXG4gICAqICAgIGhvc3QgZWxlbWVudCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXIsIGJ1dCB0aGUgY29tcG9uZW50J3MgdmlldyB3aWxsIGJlIGNvbnRyb2xsZWQgYnlcbiAgICogICAgQW5ndWxhckpTLlxuICAgKlxuICAgKiAjIyMgU3VwcG9ydGVkIEZlYXR1cmVzXG4gICAqXG4gICAqIC0gQmluZGluZ3M6XG4gICAqICAgLSBBdHRyaWJ1dGU6IGA8Y29tcCBuYW1lPVwiV29ybGRcIj5gXG4gICAqICAgLSBJbnRlcnBvbGF0aW9uOiAgYDxjb21wIGdyZWV0aW5nPVwiSGVsbG8ge3tuYW1lfX0hXCI+YFxuICAgKiAgIC0gRXhwcmVzc2lvbjogIGA8Y29tcCBbbmFtZV09XCJ1c2VybmFtZVwiPmBcbiAgICogICAtIEV2ZW50OiAgYDxjb21wIChjbG9zZSk9XCJkb1NvbWV0aGluZygpXCI+YFxuICAgKiAtIFRyYW5zY2x1c2lvbjogeWVzXG4gICAqIC0gT25seSBzb21lIG9mIHRoZSBmZWF0dXJlcyBvZlxuICAgKiAgIFtEaXJlY3RpdmUgRGVmaW5pdGlvbiBPYmplY3RdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9zZXJ2aWNlLyRjb21waWxlKSBhcmVcbiAgICogICBzdXBwb3J0ZWQ6XG4gICAqICAgLSBgY29tcGlsZWA6IG5vdCBzdXBwb3J0ZWQgYmVjYXVzZSB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IEFuZ3VsYXIsIHdoaWNoIGRvZXNcbiAgICogICAgIG5vdCBhbGxvdyBtb2RpZnlpbmcgRE9NIHN0cnVjdHVyZSBkdXJpbmcgY29tcGlsYXRpb24uXG4gICAqICAgLSBgY29udHJvbGxlcmA6IHN1cHBvcnRlZC4gKE5PVEU6IGluamVjdGlvbiBvZiBgJGF0dHJzYCBhbmQgYCR0cmFuc2NsdWRlYCBpcyBub3Qgc3VwcG9ydGVkLilcbiAgICogICAtIGBjb250cm9sbGVyQXNgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgYmluZFRvQ29udHJvbGxlcmA6IHN1cHBvcnRlZC5cbiAgICogICAtIGBsaW5rYDogc3VwcG9ydGVkLiAoTk9URTogb25seSBwcmUtbGluayBmdW5jdGlvbiBpcyBzdXBwb3J0ZWQuKVxuICAgKiAgIC0gYG5hbWVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcHJpb3JpdHlgOiBpZ25vcmVkLlxuICAgKiAgIC0gYHJlcGxhY2VgOiBub3Qgc3VwcG9ydGVkLlxuICAgKiAgIC0gYHJlcXVpcmVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcmVzdHJpY3RgOiBtdXN0IGJlIHNldCB0byAnRScuXG4gICAqICAgLSBgc2NvcGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVVcmxgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVybWluYWxgOiBpZ25vcmVkLlxuICAgKiAgIC0gYHRyYW5zY2x1ZGVgOiBzdXBwb3J0ZWQuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBmdW5jdGlvbigpIHtcbiAgICogICByZXR1cm4ge1xuICAgKiAgICAgc2NvcGU6IHtzYWx1dGF0aW9uOiAnPScsIG5hbWU6ICc9JyB9LFxuICAgKiAgICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4nXG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMkNvbXBvbmVudCkpO1xuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ25nMicsXG4gICAqICAgdGVtcGxhdGU6ICduZzIgdGVtcGxhdGU6IDxncmVldCBzYWx1dGF0aW9uPVwiSGVsbG9cIiBbbmFtZV09XCJ3b3JsZFwiPnRleHQ8L2dyZWV0PidcbiAgICogfSlcbiAgICogY2xhc3MgTmcyQ29tcG9uZW50IHtcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW05nMkNvbXBvbmVudCwgYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCdncmVldCcpXSxcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMj48L25nMj4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMiB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXBncmFkZU5nMUNvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBUeXBlPGFueT4ge1xuICAgIGlmICgoPGFueT50aGlzLm5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWQpLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdLnR5cGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAodGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdID0gbmV3IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcihuYW1lKSlcbiAgICAgICAgICAudHlwZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBhZGFwdGVyJ3MgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIGZvciB1bml0IHRlc3RpbmcgaW4gQW5ndWxhckpTLlxuICAgKiBVc2UgdGhpcyBpbnN0ZWFkIG9mIGBhbmd1bGFyLm1vY2subW9kdWxlKClgIHRvIGxvYWQgdGhlIHVwZ3JhZGUgbW9kdWxlIGludG9cbiAgICogdGhlIEFuZ3VsYXJKUyB0ZXN0aW5nIGluamVjdG9yLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgdXBncmFkZUFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKlxuICAgKiAvLyBjb25maWd1cmUgdGhlIGFkYXB0ZXIgd2l0aCB1cGdyYWRlL2Rvd25ncmFkZSBjb21wb25lbnRzIGFuZCBzZXJ2aWNlc1xuICAgKiB1cGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTXlDb21wb25lbnQpO1xuICAgKlxuICAgKiBsZXQgdXBncmFkZUFkYXB0ZXJSZWY6IFVwZ3JhZGVBZGFwdGVyUmVmO1xuICAgKiBsZXQgJGNvbXBpbGUsICRyb290U2NvcGU7XG4gICAqXG4gICAqIC8vIFdlIG11c3QgcmVnaXN0ZXIgdGhlIGFkYXB0ZXIgYmVmb3JlIGFueSBjYWxscyB0byBgaW5qZWN0KClgXG4gICAqIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgKiAgIHVwZ3JhZGVBZGFwdGVyUmVmID0gdXBncmFkZUFkYXB0ZXIucmVnaXN0ZXJGb3JOZzFUZXN0cyhbJ2hlcm9BcHAnXSk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBiZWZvcmVFYWNoKGluamVjdCgoXyRjb21waWxlXywgXyRyb290U2NvcGVfKSA9PiB7XG4gICAqICAgJGNvbXBpbGUgPSBfJGNvbXBpbGVfO1xuICAgKiAgICRyb290U2NvcGUgPSBfJHJvb3RTY29wZV87XG4gICAqIH0pKTtcbiAgICpcbiAgICogaXQoXCJzYXlzIGhlbGxvXCIsIChkb25lKSA9PiB7XG4gICAqICAgdXBncmFkZUFkYXB0ZXJSZWYucmVhZHkoKCkgPT4ge1xuICAgKiAgICAgY29uc3QgZWxlbWVudCA9ICRjb21waWxlKFwiPG15LWNvbXBvbmVudD48L215LWNvbXBvbmVudD5cIikoJHJvb3RTY29wZSk7XG4gICAqICAgICAkcm9vdFNjb3BlLiRhcHBseSgpO1xuICAgKiAgICAgZXhwZWN0KGVsZW1lbnQuaHRtbCgpKS50b0NvbnRhaW4oXCJIZWxsbyBXb3JsZFwiKTtcbiAgICogICAgIGRvbmUoKTtcbiAgICogICB9KVxuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVzIGFueSBBbmd1bGFySlMgbW9kdWxlcyB0aGF0IHRoZSB1cGdyYWRlIG1vZHVsZSBzaG91bGQgZGVwZW5kIHVwb25cbiAgICogQHJldHVybnMgYW4gYFVwZ3JhZGVBZGFwdGVyUmVmYCwgd2hpY2ggbGV0cyB5b3UgcmVnaXN0ZXIgYSBgcmVhZHkoKWAgY2FsbGJhY2sgdG9cbiAgICogcnVuIGFzc2VydGlvbnMgb25jZSB0aGUgQW5ndWxhciBjb21wb25lbnRzIGFyZSByZWFkeSB0byB0ZXN0IHRocm91Z2ggQW5ndWxhckpTLlxuICAgKi9cbiAgcmVnaXN0ZXJGb3JOZzFUZXN0cyhtb2R1bGVzPzogc3RyaW5nW10pOiBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgY29uc3Qgd2luZG93TmdNb2NrID0gKHdpbmRvdyBhcyBhbnkpWydhbmd1bGFyJ10ubW9jaztcbiAgICBpZiAoIXdpbmRvd05nTW9jayB8fCAhd2luZG93TmdNb2NrLm1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmluZCBcXCdhbmd1bGFyLm1vY2subW9kdWxlXFwnLicpO1xuICAgIH1cbiAgICB0aGlzLmRlY2xhcmVOZzFNb2R1bGUobW9kdWxlcyk7XG4gICAgd2luZG93TmdNb2NrLm1vZHVsZSh0aGlzLm5nMU1vZHVsZS5uYW1lKTtcbiAgICBjb25zdCB1cGdyYWRlID0gbmV3IFVwZ3JhZGVBZGFwdGVyUmVmKCk7XG4gICAgdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZC5wcm9taXNlLnRoZW4oXG4gICAgICAgIChuZzFJbmplY3RvcikgPT4geyAoPGFueT51cGdyYWRlKS5fYm9vdHN0cmFwRG9uZSh0aGlzLm1vZHVsZVJlZiwgbmcxSW5qZWN0b3IpOyB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYSBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBgYm9vdHN0cmFwYCBtZXRob2QgaXMgYSBkaXJlY3QgcmVwbGFjZW1lbnQgKHRha2VzIHNhbWUgYXJndW1lbnRzKSBmb3IgQW5ndWxhckpTXG4gICAqIFtgYm9vdHN0cmFwYF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL2Z1bmN0aW9uL2FuZ3VsYXIuYm9vdHN0cmFwKSBtZXRob2QuIFVubGlrZVxuICAgKiBBbmd1bGFySlMsIHRoaXMgYm9vdHN0cmFwIGlzIGFzeW5jaHJvbm91cy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzIpKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcxJywgZnVuY3Rpb24oKSB7XG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gICAqICAgICAgdGVtcGxhdGU6ICduZzFbSGVsbG8ge3t0aXRsZX19IV0oPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+KSdcbiAgICogICB9O1xuICAgKiB9KTtcbiAgICpcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICduZzInLFxuICAgKiAgIGlucHV0czogWyduYW1lJ10sXG4gICAqICAgdGVtcGxhdGU6ICduZzJbPG5nMSBbdGl0bGVdPVwibmFtZVwiPnRyYW5zY2x1ZGU8L25nMT5dKDxuZy1jb250ZW50PjwvbmctY29udGVudD4pJ1xuICAgKiB9KVxuICAgKiBjbGFzcyBOZzIge1xuICAgKiB9XG4gICAqXG4gICAqIEBOZ01vZHVsZSh7XG4gICAqICAgZGVjbGFyYXRpb25zOiBbTmcyLCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMScpXSxcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMiBuYW1lPVwiV29ybGRcIj5wcm9qZWN0PC9uZzI+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gICAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgYm9vdHN0cmFwKGVsZW1lbnQ6IEVsZW1lbnQsIG1vZHVsZXM/OiBhbnlbXSwgY29uZmlnPzogYW5ndWxhci5JQW5ndWxhckJvb3RzdHJhcENvbmZpZyk6XG4gICAgICBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgdGhpcy5kZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXMpO1xuXG4gICAgY29uc3QgdXBncmFkZSA9IG5ldyBVcGdyYWRlQWRhcHRlclJlZigpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHJlc3VtZUJvb3RzdHJhcCgpIG9ubHkgZXhpc3RzIGlmIHRoZSBjdXJyZW50IGJvb3RzdHJhcCBpcyBkZWZlcnJlZFxuICAgIGNvbnN0IHdpbmRvd0FuZ3VsYXIgPSAod2luZG93IGFzIGFueSAvKiogVE9ETyAjPz8/PyAqLylbJ2FuZ3VsYXInXTtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7IGFuZ3VsYXIuYm9vdHN0cmFwKGVsZW1lbnQsIFt0aGlzLm5nMU1vZHVsZS5uYW1lXSwgY29uZmlnICEpOyB9KTtcbiAgICBjb25zdCBuZzFCb290c3RyYXBQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCkge1xuICAgICAgICBjb25zdCBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gb3JpZ2luYWxSZXN1bWVCb290c3RyYXA7XG4gICAgICAgICAgY29uc3QgciA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgUHJvbWlzZS5hbGwoW3RoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucHJvbWlzZSwgbmcxQm9vdHN0cmFwUHJvbWlzZV0pLnRoZW4oKFtuZzFJbmplY3Rvcl0pID0+IHtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChlbGVtZW50KS5kYXRhICEoY29udHJvbGxlcktleShJTkpFQ1RPUl9LRVkpLCB0aGlzLm1vZHVsZVJlZiAhLmluamVjdG9yKTtcbiAgICAgIHRoaXMubW9kdWxlUmVmICEuaW5qZWN0b3IuZ2V0PE5nWm9uZT4oTmdab25lKS5ydW4oXG4gICAgICAgICAgKCkgPT4geyAoPGFueT51cGdyYWRlKS5fYm9vdHN0cmFwRG9uZSh0aGlzLm1vZHVsZVJlZiwgbmcxSW5qZWN0b3IpOyB9KTtcbiAgICB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhckpTIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXIuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBMb2dpbiB7IC4uLiB9XG4gICAqIGNsYXNzIFNlcnZlciB7IC4uLiB9XG4gICAqXG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRXhhbXBsZSB7XG4gICAqICAgY29uc3RydWN0b3IoQEluamVjdCgnc2VydmVyJykgc2VydmVyLCBsb2dpbjogTG9naW4pIHtcbiAgICogICAgIC4uLlxuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuc2VydmljZSgnc2VydmVyJywgU2VydmVyKTtcbiAgICogbW9kdWxlLnNlcnZpY2UoJ2xvZ2luJywgTG9naW4pO1xuICAgKlxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogYWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIoJ3NlcnZlcicpO1xuICAgKiBhZGFwdGVyLnVwZ3JhZGVOZzFQcm92aWRlcignbG9naW4nLCB7YXNUb2tlbjogTG9naW59KTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIGNvbnN0IGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcySW5qZWN0b3IuZ2V0KEV4YW1wbGUpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICB1cGdyYWRlTmcxUHJvdmlkZXIobmFtZTogc3RyaW5nLCBvcHRpb25zPzoge2FzVG9rZW46IGFueX0pIHtcbiAgICBjb25zdCB0b2tlbiA9IG9wdGlvbnMgJiYgb3B0aW9ucy5hc1Rva2VuIHx8IG5hbWU7XG4gICAgdGhpcy51cGdyYWRlZFByb3ZpZGVycy5wdXNoKHtcbiAgICAgIHByb3ZpZGU6IHRva2VuLFxuICAgICAgdXNlRmFjdG9yeTogKCRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKSA9PiAkaW5qZWN0b3IuZ2V0KG5hbWUpLFxuICAgICAgZGVwczogWyRJTkpFQ1RPUl1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFySlMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogfVxuICAgKlxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICpcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmZhY3RvcnkoJ2V4YW1wbGUnLCBhZGFwdGVyLmRvd25ncmFkZU5nMlByb3ZpZGVyKEV4YW1wbGUpKTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIGNvbnN0IGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcxSW5qZWN0b3IuZ2V0KCdleGFtcGxlJyk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIGRvd25ncmFkZU5nMlByb3ZpZGVyKHRva2VuOiBhbnkpOiBGdW5jdGlvbiB7IHJldHVybiBkb3duZ3JhZGVJbmplY3RhYmxlKHRva2VuKTsgfVxuXG4gIC8qKlxuICAgKiBEZWNsYXJlIHRoZSBBbmd1bGFySlMgdXBncmFkZSBtb2R1bGUgZm9yIHRoaXMgYWRhcHRlciB3aXRob3V0IGJvb3RzdHJhcHBpbmcgdGhlIHdob2xlXG4gICAqIGh5YnJpZCBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgYXV0b21hdGljYWxseSBjYWxsZWQgYnkgYGJvb3RzdHJhcCgpYCBhbmQgYHJlZ2lzdGVyRm9yTmcxVGVzdHMoKWAuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVzIFRoZSBBbmd1bGFySlMgbW9kdWxlcyB0aGF0IHRoaXMgdXBncmFkZSBtb2R1bGUgc2hvdWxkIGRlcGVuZCB1cG9uLlxuICAgKiBAcmV0dXJucyBUaGUgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIHRoYXQgaXMgZGVjbGFyZWQgYnkgdGhpcyBtZXRob2RcbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IHVwZ3JhZGVBZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogdXBncmFkZUFkYXB0ZXIuZGVjbGFyZU5nMU1vZHVsZShbJ2hlcm9BcHAnXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcHJpdmF0ZSBkZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXM6IHN0cmluZ1tdID0gW10pOiBhbmd1bGFyLklNb2R1bGUge1xuICAgIGNvbnN0IGRlbGF5QXBwbHlFeHBzOiBGdW5jdGlvbltdID0gW107XG4gICAgbGV0IG9yaWdpbmFsJGFwcGx5Rm46IEZ1bmN0aW9uO1xuICAgIGxldCByb290U2NvcGVQcm90b3R5cGU6IGFueTtcbiAgICBsZXQgcm9vdFNjb3BlOiBhbmd1bGFyLklSb290U2NvcGVTZXJ2aWNlO1xuICAgIGNvbnN0IHVwZ3JhZGVBZGFwdGVyID0gdGhpcztcbiAgICBjb25zdCBuZzFNb2R1bGUgPSB0aGlzLm5nMU1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKHRoaXMuaWRQcmVmaXgsIG1vZHVsZXMpO1xuICAgIGNvbnN0IHBsYXRmb3JtUmVmID0gcGxhdGZvcm1Ccm93c2VyRHluYW1pYygpO1xuXG4gICAgdGhpcy5uZ1pvbmUgPSBuZXcgTmdab25lKHtlbmFibGVMb25nU3RhY2tUcmFjZTogWm9uZS5oYXNPd25Qcm9wZXJ0eSgnbG9uZ1N0YWNrVHJhY2Vab25lU3BlYycpfSk7XG4gICAgdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIG5nMU1vZHVsZS5mYWN0b3J5KElOSkVDVE9SX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYgIS5pbmplY3Rvci5nZXQoSW5qZWN0b3IpKVxuICAgICAgICAuZmFjdG9yeShcbiAgICAgICAgICAgIExBWllfTU9EVUxFX1JFRixcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgSU5KRUNUT1JfS0VZLFxuICAgICAgICAgICAgICAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiAoeyBpbmplY3RvciwgbmVlZHNOZ1pvbmU6IGZhbHNlIH0gYXMgTGF6eU1vZHVsZVJlZilcbiAgICAgICAgICAgIF0pXG4gICAgICAgIC5jb25zdGFudChOR19aT05FX0tFWSwgdGhpcy5uZ1pvbmUpXG4gICAgICAgIC5mYWN0b3J5KENPTVBJTEVSX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYgIS5pbmplY3Rvci5nZXQoQ29tcGlsZXIpKVxuICAgICAgICAuY29uZmlnKFtcbiAgICAgICAgICAnJHByb3ZpZGUnLCAnJGluamVjdG9yJyxcbiAgICAgICAgICAocHJvdmlkZTogYW5ndWxhci5JUHJvdmlkZVNlcnZpY2UsIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICAgIHByb3ZpZGUuZGVjb3JhdG9yKCRST09UX1NDT1BFLCBbXG4gICAgICAgICAgICAgICckZGVsZWdhdGUnLFxuICAgICAgICAgICAgICBmdW5jdGlvbihyb290U2NvcGVEZWxlZ2F0ZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSkge1xuICAgICAgICAgICAgICAgIC8vIENhcHR1cmUgdGhlIHJvb3QgYXBwbHkgc28gdGhhdCB3ZSBjYW4gZGVsYXkgZmlyc3QgY2FsbCB0byAkYXBwbHkgdW50aWwgd2VcbiAgICAgICAgICAgICAgICAvLyBib290c3RyYXAgQW5ndWxhciBhbmQgdGhlbiB3ZSByZXBsYXkgYW5kIHJlc3RvcmUgdGhlICRhcHBseS5cbiAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSByb290U2NvcGVEZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnJGFwcGx5JykpIHtcbiAgICAgICAgICAgICAgICAgIG9yaWdpbmFsJGFwcGx5Rm4gPSByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5O1xuICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IChleHA6IGFueSkgPT4gZGVsYXlBcHBseUV4cHMucHVzaChleHApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBmaW5kIFxcJyRhcHBseVxcJyBvbiBcXCckcm9vdFNjb3BlXFwnIScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlID0gcm9vdFNjb3BlRGVsZWdhdGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgaWYgKG5nMUluamVjdG9yLmhhcygkJFRFU1RBQklMSVRZKSkge1xuICAgICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcigkJFRFU1RBQklMSVRZLCBbXG4gICAgICAgICAgICAgICAgJyRkZWxlZ2F0ZScsXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24odGVzdGFiaWxpdHlEZWxlZ2F0ZTogYW5ndWxhci5JVGVzdGFiaWxpdHlTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbFdoZW5TdGFibGU6IEZ1bmN0aW9uID0gdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1doZW5TdGFibGUgPSBmdW5jdGlvbihjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxXaGVuU3RhYmxlLmNhbGwodGhpcywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdXBncmFkZUFkYXB0ZXIubW9kdWxlUmVmICEuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAobmcyVGVzdGFiaWxpdHkuaXNTdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmcyVGVzdGFiaWxpdHkud2hlblN0YWJsZShuZXdXaGVuU3RhYmxlLmJpbmQodGhpcywgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdKTtcblxuICAgIG5nMU1vZHVsZS5ydW4oW1xuICAgICAgJyRpbmplY3RvcicsICckcm9vdFNjb3BlJyxcbiAgICAgIChuZzFJbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLCByb290U2NvcGU6IGFuZ3VsYXIuSVJvb3RTY29wZVNlcnZpY2UpID0+IHtcbiAgICAgICAgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyLnJlc29sdmUodGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkLCBuZzFJbmplY3RvcilcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgLy8gTm90ZTogVGhlcmUgaXMgYSBidWcgaW4gVFMgMi40IHRoYXQgcHJldmVudHMgdXMgZnJvbVxuICAgICAgICAgICAgICAvLyBpbmxpbmluZyB0aGlzIGludG8gQE5nTW9kdWxlXG4gICAgICAgICAgICAgIC8vIFRPRE8odGJvc2NoKTogZmluZCBvciBmaWxlIGEgYnVnIGFnYWluc3QgVHlwZVNjcmlwdCBmb3IgdGhpcy5cbiAgICAgICAgICAgICAgY29uc3QgbmdNb2R1bGUgPSB7XG4gICAgICAgICAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgICAgICAgICB7cHJvdmlkZTogJElOSkVDVE9SLCB1c2VGYWN0b3J5OiAoKSA9PiBuZzFJbmplY3Rvcn0sXG4gICAgICAgICAgICAgICAgICB7cHJvdmlkZTogJENPTVBJTEUsIHVzZUZhY3Rvcnk6ICgpID0+IG5nMUluamVjdG9yLmdldCgkQ09NUElMRSl9LFxuICAgICAgICAgICAgICAgICAgdGhpcy51cGdyYWRlZFByb3ZpZGVyc1xuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgaW1wb3J0czogW3RoaXMubmcyQXBwTW9kdWxlXSxcbiAgICAgICAgICAgICAgICBlbnRyeUNvbXBvbmVudHM6IHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHNcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCB3ZSBoYXZlIG5nMSBpbmplY3RvciBhbmQgd2UgaGF2ZSBwcmVwYXJlZFxuICAgICAgICAgICAgICAvLyBuZzEgY29tcG9uZW50cyB0byBiZSB1cGdyYWRlZCwgd2Ugbm93IGNhbiBib290c3RyYXAgbmcyLlxuICAgICAgICAgICAgICBATmdNb2R1bGUoe2ppdDogdHJ1ZSwgLi4ubmdNb2R1bGV9KVxuICAgICAgICAgICAgICBjbGFzcyBEeW5hbWljTmdVcGdyYWRlTW9kdWxlIHtcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHt9XG4gICAgICAgICAgICAgICAgbmdEb0Jvb3RzdHJhcCgpIHt9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGxhdGZvcm1SZWZcbiAgICAgICAgICAgICAgICAgIC5ib290c3RyYXBNb2R1bGUoXG4gICAgICAgICAgICAgICAgICAgICAgRHluYW1pY05nVXBncmFkZU1vZHVsZSwgW3RoaXMuY29tcGlsZXJPcHRpb25zICEsIHtuZ1pvbmU6IHRoaXMubmdab25lfV0pXG4gICAgICAgICAgICAgICAgICAudGhlbigocmVmOiBOZ01vZHVsZVJlZjxhbnk+KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kdWxlUmVmID0gcmVmO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChyb290U2NvcGVQcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZS4kYXBwbHkgPSBvcmlnaW5hbCRhcHBseUZuOyAgLy8gcmVzdG9yZSBvcmlnaW5hbCAkYXBwbHlcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChkZWxheUFwcGx5RXhwcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlLiRhcHBseShkZWxheUFwcGx5RXhwcy5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLm5nMkJvb3RzdHJhcERlZmVycmVkLnJlc29sdmUobmcxSW5qZWN0b3IpLCBvbkVycm9yKVxuICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc3Vic2NyaXB0aW9uID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmdab25lLm9uTWljcm90YXNrRW1wdHkuc3Vic2NyaWJlKHtuZXh0OiAoKSA9PiByb290U2NvcGUuJGRpZ2VzdCgpfSk7XG4gICAgICAgICAgICAgICAgICAgIHJvb3RTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4geyBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTsgfSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucmVqZWN0KGUpKTtcbiAgICAgIH1cbiAgICBdKTtcblxuICAgIHJldHVybiBuZzFNb2R1bGU7XG4gIH1cbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhckpTJ3MgJGNvbXBpbGUuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGluamVjdG9yICE6IEluamVjdG9yO1xuICBwcml2YXRlIGNhbGxiYWNrczogKChpbmplY3RvcjogSW5qZWN0b3IpID0+IGFueSlbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgLy8gc3RvcmUgdGhlIHByb21pc2Ugb24gdGhlIGVsZW1lbnRcbiAgICBlbGVtZW50LmRhdGEgIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIHRoaXMpO1xuICB9XG5cbiAgdGhlbihjYWxsYmFjazogKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KSB7XG4gICAgaWYgKHRoaXMuaW5qZWN0b3IpIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMuaW5qZWN0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gIH1cblxuICByZXNvbHZlKGluamVjdG9yOiBJbmplY3Rvcikge1xuICAgIHRoaXMuaW5qZWN0b3IgPSBpbmplY3RvcjtcblxuICAgIC8vIHJlc2V0IHRoZSBlbGVtZW50IGRhdGEgdG8gcG9pbnQgdG8gdGhlIHJlYWwgaW5qZWN0b3JcbiAgICB0aGlzLmVsZW1lbnQuZGF0YSAhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgaW5qZWN0b3IpO1xuXG4gICAgLy8gY2xlYW4gb3V0IHRoZSBlbGVtZW50IHRvIHByZXZlbnQgbWVtb3J5IGxlYWtzXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbCAhO1xuXG4gICAgLy8gcnVuIGFsbCB0aGUgcXVldWVkIGNhbGxiYWNrc1xuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrKSA9PiBjYWxsYmFjayhpbmplY3RvcikpO1xuICAgIHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuXG4vKipcbiAqIFVzZSBgVXBncmFkZUFkYXB0ZXJSZWZgIHRvIGNvbnRyb2wgYSBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAZGVwcmVjYXRlZCBEZXByZWNhdGVkIHNpbmNlIHY1LiBVc2UgYHVwZ3JhZGUvc3RhdGljYCBpbnN0ZWFkLCB3aGljaCBhbHNvIHN1cHBvcnRzXG4gKiBbQWhlYWQtb2YtVGltZSBjb21waWxhdGlvbl0oZ3VpZGUvYW90LWNvbXBpbGVyKS5cbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX3JlYWR5Rm46ICgodXBncmFkZUFkYXB0ZXJSZWY/OiBVcGdyYWRlQWRhcHRlclJlZikgPT4gdm9pZCl8bnVsbCA9IG51bGw7XG5cbiAgcHVibGljIG5nMVJvb3RTY29wZTogYW5ndWxhci5JUm9vdFNjb3BlU2VydmljZSA9IG51bGwgITtcbiAgcHVibGljIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UgPSBudWxsICE7XG4gIHB1YmxpYyBuZzJNb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT4gPSBudWxsICE7XG4gIHB1YmxpYyBuZzJJbmplY3RvcjogSW5qZWN0b3IgPSBudWxsICE7XG5cbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Jvb3RzdHJhcERvbmUobmdNb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT4sIG5nMUluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpIHtcbiAgICB0aGlzLm5nMk1vZHVsZVJlZiA9IG5nTW9kdWxlUmVmO1xuICAgIHRoaXMubmcySW5qZWN0b3IgPSBuZ01vZHVsZVJlZi5pbmplY3RvcjtcbiAgICB0aGlzLm5nMUluamVjdG9yID0gbmcxSW5qZWN0b3I7XG4gICAgdGhpcy5uZzFSb290U2NvcGUgPSBuZzFJbmplY3Rvci5nZXQoJFJPT1RfU0NPUEUpO1xuICAgIHRoaXMuX3JlYWR5Rm4gJiYgdGhpcy5fcmVhZHlGbih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIGlzIG5vdGlmaWVkIHVwb24gc3VjY2Vzc2Z1bCBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhclxuICAgKiBhcHBsaWNhdGlvbiBoYXMgYmVlbiBib290c3RyYXBwZWQuXG4gICAqXG4gICAqIFRoZSBgcmVhZHlgIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGludm9rZWQgaW5zaWRlIHRoZSBBbmd1bGFyIHpvbmUsIHRoZXJlZm9yZSBpdCBkb2VzIG5vdFxuICAgKiByZXF1aXJlIGEgY2FsbCB0byBgJGFwcGx5KClgLlxuICAgKi9cbiAgcHVibGljIHJlYWR5KGZuOiAodXBncmFkZUFkYXB0ZXJSZWY6IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkKSB7IHRoaXMuX3JlYWR5Rm4gPSBmbjsgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIG9mIHJ1bm5pbmcgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXIgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICB0aGlzLm5nMUluamVjdG9yICEuZ2V0KCRST09UX1NDT1BFKS4kZGVzdHJveSgpO1xuICAgIHRoaXMubmcyTW9kdWxlUmVmICEuZGVzdHJveSgpO1xuICB9XG59XG4iXX0=