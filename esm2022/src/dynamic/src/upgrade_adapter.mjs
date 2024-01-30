/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate } from "tslib";
import { Compiler, Injector, NgModule, NgZone, resolveForwardRef, Testability, } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrap, element as angularElement, module_ as angularModule, } from '../../common/src/angular1';
import { $$TESTABILITY, $COMPILE, $INJECTOR, $ROOT_SCOPE, COMPILER_KEY, INJECTOR_KEY, LAZY_MODULE_REF, NG_ZONE_KEY, UPGRADE_APP_TYPE_KEY, } from '../../common/src/constants';
import { downgradeComponent } from '../../common/src/downgrade_component';
import { downgradeInjectable } from '../../common/src/downgrade_injectable';
import { controllerKey, Deferred, destroyApp, onError, } from '../../common/src/util';
import { UpgradeNg1ComponentAdapterBuilder } from './upgrade_ng1_adapter';
let upgradeCount = 0;
/**
 * Use `UpgradeAdapter` to allow AngularJS and Angular to coexist in a single application.
 *
 * The `UpgradeAdapter` allows:
 * 1. creation of Angular component from AngularJS component directive
 *    (See {@link UpgradeAdapter#upgradeNg1Component})
 * 2. creation of AngularJS directive from Angular component.
 *    (See {@link UpgradeAdapter#downgradeNg2Component})
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
export class UpgradeAdapter {
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
    upgradeNg1Component(name) {
        if (this.ng1ComponentsToBeUpgraded.hasOwnProperty(name)) {
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
    registerForNg1Tests(modules) {
        const windowNgMock = window['angular'].mock;
        if (!windowNgMock || !windowNgMock.module) {
            throw new Error("Failed to find 'angular.mock.module'.");
        }
        const { ng1Module, ng2BootstrapDeferred } = this.declareNg1Module(modules);
        windowNgMock.module(ng1Module.name);
        const upgrade = new UpgradeAdapterRef();
        ng2BootstrapDeferred.promise.then((ng1Injector) => {
            // @ts-expect-error
            upgrade._bootstrapDone(this.moduleRef, ng1Injector);
        }, onError);
        return upgrade;
    }
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
    bootstrap(element, modules, config) {
        const { ng1Module, ng2BootstrapDeferred, ngZone } = this.declareNg1Module(modules);
        const upgrade = new UpgradeAdapterRef();
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        const windowAngular = window['angular'];
        windowAngular.resumeBootstrap = undefined;
        ngZone.run(() => {
            bootstrap(element, [ng1Module.name], config);
        });
        const ng1BootstrapPromise = new Promise((resolve) => {
            if (windowAngular.resumeBootstrap) {
                const originalResumeBootstrap = windowAngular.resumeBootstrap;
                windowAngular.resumeBootstrap = function () {
                    windowAngular.resumeBootstrap = originalResumeBootstrap;
                    const r = windowAngular.resumeBootstrap.apply(this, arguments);
                    resolve();
                    return r;
                };
            }
            else {
                resolve();
            }
        });
        Promise.all([ng2BootstrapDeferred.promise, ng1BootstrapPromise]).then(([ng1Injector]) => {
            angularElement(element).data(controllerKey(INJECTOR_KEY), this.moduleRef.injector);
            this.moduleRef.injector.get(NgZone).run(() => {
                // @ts-expect-error
                upgrade._bootstrapDone(this.moduleRef, ng1Injector);
            });
        }, onError);
        return upgrade;
    }
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
    upgradeNg1Provider(name, options) {
        const token = (options && options.asToken) || name;
        this.upgradedProviders.push({
            provide: token,
            useFactory: ($injector) => $injector.get(name),
            deps: [$INJECTOR],
        });
    }
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
    downgradeNg2Provider(token) {
        return downgradeInjectable(token);
    }
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
    declareNg1Module(modules = []) {
        const delayApplyExps = [];
        let original$applyFn;
        let rootScopePrototype;
        const upgradeAdapter = this;
        const ng1Module = angularModule(this.idPrefix, modules);
        const platformRef = platformBrowserDynamic();
        const ngZone = new NgZone({
            enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec'),
        });
        const ng2BootstrapDeferred = new Deferred();
        ng1Module
            .constant(UPGRADE_APP_TYPE_KEY, 1 /* UpgradeAppType.Dynamic */)
            .factory(INJECTOR_KEY, () => this.moduleRef.injector.get(Injector))
            .factory(LAZY_MODULE_REF, [
            INJECTOR_KEY,
            (injector) => ({ injector }),
        ])
            .constant(NG_ZONE_KEY, ngZone)
            .factory(COMPILER_KEY, () => this.moduleRef.injector.get(Compiler))
            .config([
            '$provide',
            '$injector',
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
                            throw new Error("Failed to find '$apply' on '$rootScope'!");
                        }
                        return rootScopeDelegate;
                    },
                ]);
                if (ng1Injector.has($$TESTABILITY)) {
                    provide.decorator($$TESTABILITY, [
                        '$delegate',
                        function (testabilityDelegate) {
                            const originalWhenStable = testabilityDelegate.whenStable;
                            // Cannot use arrow function below because we need the context
                            const newWhenStable = function (callback) {
                                originalWhenStable.call(this, function () {
                                    const ng2Testability = upgradeAdapter.moduleRef.injector.get(Testability);
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
                        },
                    ]);
                }
            },
        ]);
        ng1Module.run([
            '$injector',
            '$rootScope',
            (ng1Injector, rootScope) => {
                UpgradeNg1ComponentAdapterBuilder.resolve(this.ng1ComponentsToBeUpgraded, ng1Injector)
                    .then(() => {
                    // At this point we have ng1 injector and we have prepared
                    // ng1 components to be upgraded, we now can bootstrap ng2.
                    let DynamicNgUpgradeModule = class DynamicNgUpgradeModule {
                        ngDoBootstrap() { }
                    };
                    DynamicNgUpgradeModule = __decorate([
                        NgModule({
                            jit: true,
                            providers: [
                                { provide: $INJECTOR, useFactory: () => ng1Injector },
                                { provide: $COMPILE, useFactory: () => ng1Injector.get($COMPILE) },
                                this.upgradedProviders,
                            ],
                            imports: [resolveForwardRef(this.ng2AppModule)],
                        })
                    ], DynamicNgUpgradeModule);
                    platformRef
                        .bootstrapModule(DynamicNgUpgradeModule, [this.compilerOptions, { ngZone }])
                        .then((ref) => {
                        this.moduleRef = ref;
                        ngZone.run(() => {
                            if (rootScopePrototype) {
                                rootScopePrototype.$apply = original$applyFn; // restore original $apply
                                while (delayApplyExps.length) {
                                    rootScope.$apply(delayApplyExps.shift());
                                }
                                rootScopePrototype = null;
                            }
                        });
                    })
                        .then(() => ng2BootstrapDeferred.resolve(ng1Injector), onError)
                        .then(() => {
                        let subscription = ngZone.onMicrotaskEmpty.subscribe({
                            next: () => {
                                if (rootScope.$$phase) {
                                    if (typeof ngDevMode === 'undefined' || ngDevMode) {
                                        console.warn('A digest was triggered while one was already in progress. This may mean that something is triggering digests outside the Angular zone.');
                                    }
                                    return rootScope.$evalAsync(() => { });
                                }
                                return rootScope.$digest();
                            },
                        });
                        rootScope.$on('$destroy', () => {
                            subscription.unsubscribe();
                        });
                        // Destroy the AngularJS app once the Angular `PlatformRef` is destroyed.
                        // This does not happen in a typical SPA scenario, but it might be useful for
                        // other use-cases where disposing of an Angular/AngularJS app is necessary
                        // (such as Hot Module Replacement (HMR)).
                        // See https://github.com/angular/angular/issues/39935.
                        platformRef.onDestroy(() => destroyApp(ng1Injector));
                    });
                })
                    .catch((e) => ng2BootstrapDeferred.reject(e));
            },
        ]);
        return { ng1Module, ng2BootstrapDeferred, ngZone };
    }
}
/**
 * Use `UpgradeAdapterRef` to control a hybrid AngularJS / Angular application.
 *
 * @deprecated Deprecated since v5. Use `upgrade/static` instead, which also supports
 * [Ahead-of-Time compilation](guide/aot-compiler).
 * @publicApi
 */
export class UpgradeAdapterRef {
    constructor() {
        /* @internal */
        this._readyFn = null;
        this.ng1RootScope = null;
        this.ng1Injector = null;
        this.ng2ModuleRef = null;
        this.ng2Injector = null;
    }
    /* @internal */
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
     */
    ready(fn) {
        this._readyFn = fn;
    }
    /**
     * Dispose of running hybrid AngularJS / Angular application.
     */
    dispose() {
        this.ng1Injector.get($ROOT_SCOPE).$destroy();
        this.ng2ModuleRef.destroy();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvZHluYW1pYy9zcmMvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsUUFBUSxFQUVSLFFBQVEsRUFDUixRQUFRLEVBRVIsTUFBTSxFQUNOLGlCQUFpQixFQUVqQixXQUFXLEdBRVosTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFFekUsT0FBTyxFQUNMLFNBQVMsRUFDVCxPQUFPLElBQUksY0FBYyxFQVF6QixPQUFPLElBQUksYUFBYSxHQUN6QixNQUFNLDJCQUEyQixDQUFDO0FBQ25DLE9BQU8sRUFDTCxhQUFhLEVBQ2IsUUFBUSxFQUNSLFNBQVMsRUFDVCxXQUFXLEVBQ1gsWUFBWSxFQUNaLFlBQVksRUFDWixlQUFlLEVBQ2YsV0FBVyxFQUNYLG9CQUFvQixHQUNyQixNQUFNLDRCQUE0QixDQUFDO0FBQ3BDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBQzFFLE9BQU8sRUFDTCxhQUFhLEVBQ2IsUUFBUSxFQUNSLFVBQVUsRUFFVixPQUFPLEdBRVIsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQixPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RSxJQUFJLFlBQVksR0FBVyxDQUFDLENBQUM7QUFFN0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlGRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBZXpCLFlBQ1UsWUFB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QUNGLENBQUMsQ0FBQztRQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDbkQsQ0FBQztDQUNGO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFPLGlCQUFpQjtJQUE5QjtRQUNFLGVBQWU7UUFDUCxhQUFRLEdBQTRELElBQUksQ0FBQztRQUUxRSxpQkFBWSxHQUFzQixJQUFLLENBQUM7UUFDeEMsZ0JBQVcsR0FBcUIsSUFBSyxDQUFDO1FBQ3RDLGlCQUFZLEdBQXFCLElBQUssQ0FBQztRQUN2QyxnQkFBVyxHQUFhLElBQUssQ0FBQztJQTZCdkMsQ0FBQztJQTNCQyxlQUFlO0lBQ1AsY0FBYyxDQUFDLFdBQTZCLEVBQUUsV0FBNkI7UUFDakYsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLEtBQUssQ0FBQyxFQUFrRDtRQUM3RCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPO1FBQ1osSUFBSSxDQUFDLFdBQVksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLFlBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMvQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcGlsZXIsXG4gIENvbXBpbGVyT3B0aW9ucyxcbiAgSW5qZWN0b3IsXG4gIE5nTW9kdWxlLFxuICBOZ01vZHVsZVJlZixcbiAgTmdab25lLFxuICByZXNvbHZlRm9yd2FyZFJlZixcbiAgU3RhdGljUHJvdmlkZXIsXG4gIFRlc3RhYmlsaXR5LFxuICBUeXBlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7cGxhdGZvcm1Ccm93c2VyRHluYW1pY30gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci1keW5hbWljJztcblxuaW1wb3J0IHtcbiAgYm9vdHN0cmFwLFxuICBlbGVtZW50IGFzIGFuZ3VsYXJFbGVtZW50LFxuICBJQW5ndWxhckJvb3RzdHJhcENvbmZpZyxcbiAgSUF1Z21lbnRlZEpRdWVyeSxcbiAgSUluamVjdG9yU2VydmljZSxcbiAgSU1vZHVsZSxcbiAgSVByb3ZpZGVTZXJ2aWNlLFxuICBJUm9vdFNjb3BlU2VydmljZSxcbiAgSVRlc3RhYmlsaXR5U2VydmljZSxcbiAgbW9kdWxlXyBhcyBhbmd1bGFyTW9kdWxlLFxufSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2FuZ3VsYXIxJztcbmltcG9ydCB7XG4gICQkVEVTVEFCSUxJVFksXG4gICRDT01QSUxFLFxuICAkSU5KRUNUT1IsXG4gICRST09UX1NDT1BFLFxuICBDT01QSUxFUl9LRVksXG4gIElOSkVDVE9SX0tFWSxcbiAgTEFaWV9NT0RVTEVfUkVGLFxuICBOR19aT05FX0tFWSxcbiAgVVBHUkFERV9BUFBfVFlQRV9LRVksXG59IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7ZG93bmdyYWRlQ29tcG9uZW50fSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2Rvd25ncmFkZV9jb21wb25lbnQnO1xuaW1wb3J0IHtkb3duZ3JhZGVJbmplY3RhYmxlfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2Rvd25ncmFkZV9pbmplY3RhYmxlJztcbmltcG9ydCB7XG4gIGNvbnRyb2xsZXJLZXksXG4gIERlZmVycmVkLFxuICBkZXN0cm95QXBwLFxuICBMYXp5TW9kdWxlUmVmLFxuICBvbkVycm9yLFxuICBVcGdyYWRlQXBwVHlwZSxcbn0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy91dGlsJztcblxuaW1wb3J0IHtVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9IGZyb20gJy4vdXBncmFkZV9uZzFfYWRhcHRlcic7XG5cbmxldCB1cGdyYWRlQ291bnQ6IG51bWJlciA9IDA7XG5cbi8qKlxuICogVXNlIGBVcGdyYWRlQWRhcHRlcmAgdG8gYWxsb3cgQW5ndWxhckpTIGFuZCBBbmd1bGFyIHRvIGNvZXhpc3QgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogVGhlIGBVcGdyYWRlQWRhcHRlcmAgYWxsb3dzOlxuICogMS4gY3JlYXRpb24gb2YgQW5ndWxhciBjb21wb25lbnQgZnJvbSBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZVxuICogICAgKFNlZSB7QGxpbmsgVXBncmFkZUFkYXB0ZXIjdXBncmFkZU5nMUNvbXBvbmVudH0pXG4gKiAyLiBjcmVhdGlvbiBvZiBBbmd1bGFySlMgZGlyZWN0aXZlIGZyb20gQW5ndWxhciBjb21wb25lbnQuXG4gKiAgICAoU2VlIHtAbGluayBVcGdyYWRlQWRhcHRlciNkb3duZ3JhZGVOZzJDb21wb25lbnR9KVxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgQW5ndWxhckpTIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA0LiBBbmd1bGFyIGNvbXBvbmVudHMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIEFuZ3VsYXIgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDUuIEFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FuIGJlIHVwZ3JhZGVkIHRvIGFuIEFuZ3VsYXIgY29tcG9uZW50LiBUaGlzIGNyZWF0ZXMgYW5cbiAqICAgIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZSBpbiB0aGF0IGxvY2F0aW9uLlxuICogNi4gQW4gQW5ndWxhciBjb21wb25lbnQgY2FuIGJlIGRvd25ncmFkZWQgdG8gYW4gQW5ndWxhckpTIGNvbXBvbmVudCBkaXJlY3RpdmUuIFRoaXMgY3JlYXRlc1xuICogICAgYW4gQW5ndWxhckpTIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhciBjb21wb25lbnQgaW4gdGhhdCBsb2NhdGlvbi5cbiAqIDcuIFdoZW5ldmVyIGFuIGFkYXB0ZXIgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IHRoZSBmcmFtZXdvcmtcbiAqICAgIGRvaW5nIHRoZSBpbnN0YW50aWF0aW9uLiBUaGUgb3RoZXIgZnJhbWV3b3JrIHRoZW4gaW5zdGFudGlhdGVzIGFuZCBvd25zIHRoZSB2aWV3IGZvciB0aGF0XG4gKiAgICBjb21wb25lbnQuIFRoaXMgaW1wbGllcyB0aGF0IGNvbXBvbmVudCBiaW5kaW5ncyB3aWxsIGFsd2F5cyBmb2xsb3cgdGhlIHNlbWFudGljcyBvZiB0aGVcbiAqICAgIGluc3RhbnRpYXRpb24gZnJhbWV3b3JrLiBUaGUgc3ludGF4IGlzIGFsd2F5cyB0aGF0IG9mIEFuZ3VsYXIgc3ludGF4LlxuICogOC4gQW5ndWxhckpTIGlzIGFsd2F5cyBib290c3RyYXBwZWQgZmlyc3QgYW5kIG93bnMgdGhlIGJvdHRvbSBtb3N0IHZpZXcuXG4gKiA5LiBUaGUgbmV3IGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gQW5ndWxhciB6b25lLCBhbmQgdGhlcmVmb3JlIGl0IG5vIGxvbmdlciBuZWVkcyBjYWxscyB0b1xuICogICAgYCRhcHBseSgpYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihmb3J3YXJkUmVmKCgpID0+IE15TmcyTW9kdWxlKSwgbXlDb21waWxlck9wdGlvbnMpO1xuICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMkNvbXAnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzJDb21wb25lbnQpKTtcbiAqXG4gKiBtb2R1bGUuZGlyZWN0aXZlKCduZzFIZWxsbycsIGZ1bmN0aW9uKCkge1xuICogICByZXR1cm4ge1xuICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gKiAgIH07XG4gKiB9KTtcbiAqXG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbmcyLWNvbXAnLFxuICogICBpbnB1dHM6IFsnbmFtZSddLFxuICogICB0ZW1wbGF0ZTogJ25nMls8bmcxLWhlbGxvIFt0aXRsZV09XCJuYW1lXCI+dHJhbnNjbHVkZTwvbmcxLWhlbGxvPl0oPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PiknLFxuICogICBkaXJlY3RpdmVzOlxuICogfSlcbiAqIGNsYXNzIE5nMkNvbXBvbmVudCB7XG4gKiB9XG4gKlxuICogQE5nTW9kdWxlKHtcbiAqICAgZGVjbGFyYXRpb25zOiBbTmcyQ29tcG9uZW50LCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMUhlbGxvJyldLFxuICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAqIH0pXG4gKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICpcbiAqXG4gKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyLWNvbXAgbmFtZT1cIldvcmxkXCI+cHJvamVjdDwvbmcyLWNvbXA+JztcbiAqXG4gKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gKiAgICAgICBcIm5nMltuZzFbSGVsbG8gV29ybGQhXSh0cmFuc2NsdWRlKV0ocHJvamVjdClcIik7XG4gKiB9KTtcbiAqXG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBEZXByZWNhdGVkIHNpbmNlIHY1LiBVc2UgYHVwZ3JhZGUvc3RhdGljYCBpbnN0ZWFkLCB3aGljaCBhbHNvIHN1cHBvcnRzXG4gKiBbQWhlYWQtb2YtVGltZSBjb21waWxhdGlvbl0oZ3VpZGUvYW90LWNvbXBpbGVyKS5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpZFByZWZpeDogc3RyaW5nID0gYE5HMl9VUEdSQURFXyR7dXBncmFkZUNvdW50Kyt9X2A7XG4gIHByaXZhdGUgZG93bmdyYWRlZENvbXBvbmVudHM6IFR5cGU8YW55PltdID0gW107XG4gIC8qKlxuICAgKiBBbiBpbnRlcm5hbCBtYXAgb2YgbmcxIGNvbXBvbmVudHMgd2hpY2ggbmVlZCB0byB1cCB1cGdyYWRlZCB0byBuZzIuXG4gICAqXG4gICAqIFdlIGNhbid0IHVwZ3JhZGUgdW50aWwgaW5qZWN0b3IgaXMgaW5zdGFudGlhdGVkIGFuZCB3ZSBjYW4gcmV0cmlldmUgdGhlIGNvbXBvbmVudCBtZXRhZGF0YS5cbiAgICogRm9yIHRoaXMgcmVhc29uIHdlIGtlZXAgYSBsaXN0IG9mIGNvbXBvbmVudHMgdG8gdXBncmFkZSB1bnRpbCBuZzEgaW5qZWN0b3IgaXMgYm9vdHN0cmFwcGVkLlxuICAgKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHByaXZhdGUgbmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZDoge1tuYW1lOiBzdHJpbmddOiBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9ID0ge307XG4gIHByaXZhdGUgdXBncmFkZWRQcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbXTtcbiAgcHJpdmF0ZSBtb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT4gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIG5nMkFwcE1vZHVsZTogVHlwZTxhbnk+LFxuICAgIHByaXZhdGUgY29tcGlsZXJPcHRpb25zPzogQ29tcGlsZXJPcHRpb25zLFxuICApIHtcbiAgICBpZiAoIW5nMkFwcE1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVXBncmFkZUFkYXB0ZXIgY2Fubm90IGJlIGluc3RhbnRpYXRlZCB3aXRob3V0IGFuIE5nTW9kdWxlIG9mIHRoZSBBbmd1bGFyIGFwcC4nLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXIgQ29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFySlMuXG4gICAqXG4gICAqIFVzZSBgZG93bmdyYWRlTmcyQ29tcG9uZW50YCB0byBjcmVhdGUgYW4gQW5ndWxhckpTIERpcmVjdGl2ZSBEZWZpbml0aW9uIEZhY3RvcnkgZnJvbVxuICAgKiBBbmd1bGFyIENvbXBvbmVudC4gVGhlIGFkYXB0ZXIgd2lsbCBib290c3RyYXAgQW5ndWxhciBjb21wb25lbnQgZnJvbSB3aXRoaW4gdGhlXG4gICAqIEFuZ3VsYXJKUyB0ZW1wbGF0ZS5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIE1lbnRhbCBNb2RlbFxuICAgKlxuICAgKiAxLiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBieSBiZWluZyBsaXN0ZWQgaW4gQW5ndWxhckpTIHRlbXBsYXRlLiBUaGlzIG1lYW5zIHRoYXQgdGhlXG4gICAqICAgIGhvc3QgZWxlbWVudCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXJKUywgYnV0IHRoZSBjb21wb25lbnQncyB2aWV3IHdpbGwgYmUgY29udHJvbGxlZCBieVxuICAgKiAgICBBbmd1bGFyLlxuICAgKiAyLiBFdmVuIHRob3VnaHQgdGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgaW4gQW5ndWxhckpTLCBpdCB3aWxsIGJlIHVzaW5nIEFuZ3VsYXJcbiAgICogICAgc3ludGF4LiBUaGlzIGhhcyB0byBiZSBkb25lLCB0aGlzIHdheSBiZWNhdXNlIHdlIG11c3QgZm9sbG93IEFuZ3VsYXIgY29tcG9uZW50cyBkbyBub3RcbiAgICogICAgZGVjbGFyZSBob3cgdGhlIGF0dHJpYnV0ZXMgc2hvdWxkIGJlIGludGVycHJldGVkLlxuICAgKiAzLiBgbmctbW9kZWxgIGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhckpTIGFuZCBjb21tdW5pY2F0ZXMgd2l0aCB0aGUgZG93bmdyYWRlZCBBbmd1bGFyIGNvbXBvbmVudFxuICAgKiAgICBieSB3YXkgb2YgdGhlIGBDb250cm9sVmFsdWVBY2Nlc3NvcmAgaW50ZXJmYWNlIGZyb20gQGFuZ3VsYXIvZm9ybXMuIE9ubHkgY29tcG9uZW50cyB0aGF0XG4gICAqICAgIGltcGxlbWVudCB0aGlzIGludGVyZmFjZSBhcmUgZWxpZ2libGUuXG4gICAqXG4gICAqICMjIyBTdXBwb3J0ZWQgRmVhdHVyZXNcbiAgICpcbiAgICogLSBCaW5kaW5nczpcbiAgICogICAtIEF0dHJpYnV0ZTogYDxjb21wIG5hbWU9XCJXb3JsZFwiPmBcbiAgICogICAtIEludGVycG9sYXRpb246ICBgPGNvbXAgZ3JlZXRpbmc9XCJIZWxsbyB7e25hbWV9fSFcIj5gXG4gICAqICAgLSBFeHByZXNzaW9uOiAgYDxjb21wIFtuYW1lXT1cInVzZXJuYW1lXCI+YFxuICAgKiAgIC0gRXZlbnQ6ICBgPGNvbXAgKGNsb3NlKT1cImRvU29tZXRoaW5nKClcIj5gXG4gICAqICAgLSBuZy1tb2RlbDogYDxjb21wIG5nLW1vZGVsPVwibmFtZVwiPmBcbiAgICogLSBDb250ZW50IHByb2plY3Rpb246IHllc1xuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihmb3J3YXJkUmVmKCgpID0+IE15TmcyTW9kdWxlKSk7XG4gICAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ2dyZWV0JywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoR3JlZXRlcikpO1xuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAgICogICB0ZW1wbGF0ZTogJ3t7c2FsdXRhdGlvbn19IHt7bmFtZX19ISAtIDxuZy1jb250ZW50PjwvbmctY29udGVudD4nXG4gICAqIH0pXG4gICAqIGNsYXNzIEdyZWV0ZXIge1xuICAgKiAgIEBJbnB1dCgpIHNhbHV0YXRpb246IHN0cmluZztcbiAgICogICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XG4gICAqIH1cbiAgICpcbiAgICogQE5nTW9kdWxlKHtcbiAgICogICBkZWNsYXJhdGlvbnM6IFtHcmVldGVyXSxcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPVxuICAgKiAgICduZzEgdGVtcGxhdGU6IDxncmVldCBzYWx1dGF0aW9uPVwiSGVsbG9cIiBbbmFtZV09XCJ3b3JsZFwiPnRleHQ8L2dyZWV0Pic7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFwibmcxIHRlbXBsYXRlOiBIZWxsbyB3b3JsZCEgLSB0ZXh0XCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBkb3duZ3JhZGVOZzJDb21wb25lbnQoY29tcG9uZW50OiBUeXBlPGFueT4pOiBGdW5jdGlvbiB7XG4gICAgdGhpcy5kb3duZ3JhZGVkQ29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG5cbiAgICByZXR1cm4gZG93bmdyYWRlQ29tcG9uZW50KHtjb21wb25lbnR9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhckpTIENvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhci5cbiAgICpcbiAgICogVXNlIGB1cGdyYWRlTmcxQ29tcG9uZW50YCB0byBjcmVhdGUgYW4gQW5ndWxhciBjb21wb25lbnQgZnJvbSBBbmd1bGFySlMgQ29tcG9uZW50XG4gICAqIGRpcmVjdGl2ZS4gVGhlIGFkYXB0ZXIgd2lsbCBib290c3RyYXAgQW5ndWxhckpTIGNvbXBvbmVudCBmcm9tIHdpdGhpbiB0aGUgQW5ndWxhclxuICAgKiB0ZW1wbGF0ZS5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIE1lbnRhbCBNb2RlbFxuICAgKlxuICAgKiAxLiBUaGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBieSBiZWluZyBsaXN0ZWQgaW4gQW5ndWxhciB0ZW1wbGF0ZS4gVGhpcyBtZWFucyB0aGF0IHRoZVxuICAgKiAgICBob3N0IGVsZW1lbnQgaXMgY29udHJvbGxlZCBieSBBbmd1bGFyLCBidXQgdGhlIGNvbXBvbmVudCdzIHZpZXcgd2lsbCBiZSBjb250cm9sbGVkIGJ5XG4gICAqICAgIEFuZ3VsYXJKUy5cbiAgICpcbiAgICogIyMjIFN1cHBvcnRlZCBGZWF0dXJlc1xuICAgKlxuICAgKiAtIEJpbmRpbmdzOlxuICAgKiAgIC0gQXR0cmlidXRlOiBgPGNvbXAgbmFtZT1cIldvcmxkXCI+YFxuICAgKiAgIC0gSW50ZXJwb2xhdGlvbjogIGA8Y29tcCBncmVldGluZz1cIkhlbGxvIHt7bmFtZX19IVwiPmBcbiAgICogICAtIEV4cHJlc3Npb246ICBgPGNvbXAgW25hbWVdPVwidXNlcm5hbWVcIj5gXG4gICAqICAgLSBFdmVudDogIGA8Y29tcCAoY2xvc2UpPVwiZG9Tb21ldGhpbmcoKVwiPmBcbiAgICogLSBUcmFuc2NsdXNpb246IHllc1xuICAgKiAtIE9ubHkgc29tZSBvZiB0aGUgZmVhdHVyZXMgb2ZcbiAgICogICBbRGlyZWN0aXZlIERlZmluaXRpb24gT2JqZWN0XShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvc2VydmljZS8kY29tcGlsZSkgYXJlXG4gICAqICAgc3VwcG9ydGVkOlxuICAgKiAgIC0gYGNvbXBpbGVgOiBub3Qgc3VwcG9ydGVkIGJlY2F1c2UgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieSBBbmd1bGFyLCB3aGljaCBkb2VzXG4gICAqICAgICBub3QgYWxsb3cgbW9kaWZ5aW5nIERPTSBzdHJ1Y3R1cmUgZHVyaW5nIGNvbXBpbGF0aW9uLlxuICAgKiAgIC0gYGNvbnRyb2xsZXJgOiBzdXBwb3J0ZWQuIChOT1RFOiBpbmplY3Rpb24gb2YgYCRhdHRyc2AgYW5kIGAkdHJhbnNjbHVkZWAgaXMgbm90IHN1cHBvcnRlZC4pXG4gICAqICAgLSBgY29udHJvbGxlckFzYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYGJpbmRUb0NvbnRyb2xsZXJgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgbGlua2A6IHN1cHBvcnRlZC4gKE5PVEU6IG9ubHkgcHJlLWxpbmsgZnVuY3Rpb24gaXMgc3VwcG9ydGVkLilcbiAgICogICAtIGBuYW1lYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHByaW9yaXR5YDogaWdub3JlZC5cbiAgICogICAtIGByZXBsYWNlYDogbm90IHN1cHBvcnRlZC5cbiAgICogICAtIGByZXF1aXJlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHJlc3RyaWN0YDogbXVzdCBiZSBzZXQgdG8gJ0UnLlxuICAgKiAgIC0gYHNjb3BlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlbXBsYXRlYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlbXBsYXRlVXJsYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYHRlcm1pbmFsYDogaWdub3JlZC5cbiAgICogICAtIGB0cmFuc2NsdWRlYDogc3VwcG9ydGVkLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihmb3J3YXJkUmVmKCgpID0+IE15TmcyTW9kdWxlKSk7XG4gICAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ2dyZWV0JywgZnVuY3Rpb24oKSB7XG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgIHNjb3BlOiB7c2FsdXRhdGlvbjogJz0nLCBuYW1lOiAnPScgfSxcbiAgICogICAgIHRlbXBsYXRlOiAne3tzYWx1dGF0aW9ufX0ge3tuYW1lfX0hIC0gPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+J1xuICAgKiAgIH07XG4gICAqIH0pO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzJDb21wb25lbnQpKTtcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICduZzInLFxuICAgKiAgIHRlbXBsYXRlOiAnbmcyIHRlbXBsYXRlOiA8Z3JlZXQgc2FsdXRhdGlvbj1cIkhlbGxvXCIgW25hbWVdPVwid29ybGRcIj50ZXh0PC9ncmVldD4nXG4gICAqIH0pXG4gICAqIGNsYXNzIE5nMkNvbXBvbmVudCB7XG4gICAqIH1cbiAgICpcbiAgICogQE5nTW9kdWxlKHtcbiAgICogICBkZWNsYXJhdGlvbnM6IFtOZzJDb21wb25lbnQsIGFkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnZ3JlZXQnKV0sXG4gICAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmcyTW9kdWxlIHt9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxuZzI+PC9uZzI+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXCJuZzIgdGVtcGxhdGU6IEhlbGxvIHdvcmxkISAtIHRleHRcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIHVwZ3JhZGVOZzFDb21wb25lbnQobmFtZTogc3RyaW5nKTogVHlwZTxhbnk+IHtcbiAgICBpZiAodGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdLnR5cGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAodGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdID0gbmV3IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcihuYW1lKSlcbiAgICAgICAgLnR5cGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyB0aGUgYWRhcHRlcidzIEFuZ3VsYXJKUyB1cGdyYWRlIG1vZHVsZSBmb3IgdW5pdCB0ZXN0aW5nIGluIEFuZ3VsYXJKUy5cbiAgICogVXNlIHRoaXMgaW5zdGVhZCBvZiBgYW5ndWxhci5tb2NrLm1vZHVsZSgpYCB0byBsb2FkIHRoZSB1cGdyYWRlIG1vZHVsZSBpbnRvXG4gICAqIHRoZSBBbmd1bGFySlMgdGVzdGluZyBpbmplY3Rvci5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IHVwZ3JhZGVBZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICpcbiAgICogLy8gY29uZmlndXJlIHRoZSBhZGFwdGVyIHdpdGggdXBncmFkZS9kb3duZ3JhZGUgY29tcG9uZW50cyBhbmQgc2VydmljZXNcbiAgICogdXBncmFkZUFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE15Q29tcG9uZW50KTtcbiAgICpcbiAgICogbGV0IHVwZ3JhZGVBZGFwdGVyUmVmOiBVcGdyYWRlQWRhcHRlclJlZjtcbiAgICogbGV0ICRjb21waWxlLCAkcm9vdFNjb3BlO1xuICAgKlxuICAgKiAvLyBXZSBtdXN0IHJlZ2lzdGVyIHRoZSBhZGFwdGVyIGJlZm9yZSBhbnkgY2FsbHMgdG8gYGluamVjdCgpYFxuICAgKiBiZWZvcmVFYWNoKCgpID0+IHtcbiAgICogICB1cGdyYWRlQWRhcHRlclJlZiA9IHVwZ3JhZGVBZGFwdGVyLnJlZ2lzdGVyRm9yTmcxVGVzdHMoWydoZXJvQXBwJ10pO1xuICAgKiB9KTtcbiAgICpcbiAgICogYmVmb3JlRWFjaChpbmplY3QoKF8kY29tcGlsZV8sIF8kcm9vdFNjb3BlXykgPT4ge1xuICAgKiAgICRjb21waWxlID0gXyRjb21waWxlXztcbiAgICogICAkcm9vdFNjb3BlID0gXyRyb290U2NvcGVfO1xuICAgKiB9KSk7XG4gICAqXG4gICAqIGl0KFwic2F5cyBoZWxsb1wiLCAoZG9uZSkgPT4ge1xuICAgKiAgIHVwZ3JhZGVBZGFwdGVyUmVmLnJlYWR5KCgpID0+IHtcbiAgICogICAgIGNvbnN0IGVsZW1lbnQgPSAkY29tcGlsZShcIjxteS1jb21wb25lbnQ+PC9teS1jb21wb25lbnQ+XCIpKCRyb290U2NvcGUpO1xuICAgKiAgICAgJHJvb3RTY29wZS4kYXBwbHkoKTtcbiAgICogICAgIGV4cGVjdChlbGVtZW50Lmh0bWwoKSkudG9Db250YWluKFwiSGVsbG8gV29ybGRcIik7XG4gICAqICAgICBkb25lKCk7XG4gICAqICAgfSlcbiAgICogfSk7XG4gICAqXG4gICAqIGBgYFxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlcyBhbnkgQW5ndWxhckpTIG1vZHVsZXMgdGhhdCB0aGUgdXBncmFkZSBtb2R1bGUgc2hvdWxkIGRlcGVuZCB1cG9uXG4gICAqIEByZXR1cm5zIGFuIGBVcGdyYWRlQWRhcHRlclJlZmAsIHdoaWNoIGxldHMgeW91IHJlZ2lzdGVyIGEgYHJlYWR5KClgIGNhbGxiYWNrIHRvXG4gICAqIHJ1biBhc3NlcnRpb25zIG9uY2UgdGhlIEFuZ3VsYXIgY29tcG9uZW50cyBhcmUgcmVhZHkgdG8gdGVzdCB0aHJvdWdoIEFuZ3VsYXJKUy5cbiAgICovXG4gIHJlZ2lzdGVyRm9yTmcxVGVzdHMobW9kdWxlcz86IHN0cmluZ1tdKTogVXBncmFkZUFkYXB0ZXJSZWYge1xuICAgIGNvbnN0IHdpbmRvd05nTW9jayA9ICh3aW5kb3cgYXMgYW55KVsnYW5ndWxhciddLm1vY2s7XG4gICAgaWYgKCF3aW5kb3dOZ01vY2sgfHwgIXdpbmRvd05nTW9jay5tb2R1bGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmaW5kICdhbmd1bGFyLm1vY2subW9kdWxlJy5cIik7XG4gICAgfVxuICAgIGNvbnN0IHtuZzFNb2R1bGUsIG5nMkJvb3RzdHJhcERlZmVycmVkfSA9IHRoaXMuZGVjbGFyZU5nMU1vZHVsZShtb2R1bGVzKTtcbiAgICB3aW5kb3dOZ01vY2subW9kdWxlKG5nMU1vZHVsZS5uYW1lKTtcbiAgICBjb25zdCB1cGdyYWRlID0gbmV3IFVwZ3JhZGVBZGFwdGVyUmVmKCk7XG4gICAgbmcyQm9vdHN0cmFwRGVmZXJyZWQucHJvbWlzZS50aGVuKChuZzFJbmplY3RvcikgPT4ge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgdXBncmFkZS5fYm9vdHN0cmFwRG9uZSh0aGlzLm1vZHVsZVJlZiEsIG5nMUluamVjdG9yKTtcbiAgICB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCb290c3RyYXAgYSBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBgYm9vdHN0cmFwYCBtZXRob2QgaXMgYSBkaXJlY3QgcmVwbGFjZW1lbnQgKHRha2VzIHNhbWUgYXJndW1lbnRzKSBmb3IgQW5ndWxhckpTXG4gICAqIFtgYm9vdHN0cmFwYF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL2Z1bmN0aW9uL2FuZ3VsYXIuYm9vdHN0cmFwKSBtZXRob2QuIFVubGlrZVxuICAgKiBBbmd1bGFySlMsIHRoaXMgYm9vdHN0cmFwIGlzIGFzeW5jaHJvbm91cy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzInLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzIpKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcxJywgZnVuY3Rpb24oKSB7XG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gICAqICAgICAgdGVtcGxhdGU6ICduZzFbSGVsbG8ge3t0aXRsZX19IV0oPHNwYW4gbmctdHJhbnNjbHVkZT48L3NwYW4+KSdcbiAgICogICB9O1xuICAgKiB9KTtcbiAgICpcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICduZzInLFxuICAgKiAgIGlucHV0czogWyduYW1lJ10sXG4gICAqICAgdGVtcGxhdGU6ICduZzJbPG5nMSBbdGl0bGVdPVwibmFtZVwiPnRyYW5zY2x1ZGU8L25nMT5dKDxuZy1jb250ZW50PjwvbmctY29udGVudD4pJ1xuICAgKiB9KVxuICAgKiBjbGFzcyBOZzIge1xuICAgKiB9XG4gICAqXG4gICAqIEBOZ01vZHVsZSh7XG4gICAqICAgZGVjbGFyYXRpb25zOiBbTmcyLCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMScpXSxcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMiBuYW1lPVwiV29ybGRcIj5wcm9qZWN0PC9uZzI+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gICAqICAgICAgIFwibmcyW25nMVtIZWxsbyBXb3JsZCFdKHRyYW5zY2x1ZGUpXShwcm9qZWN0KVwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgYm9vdHN0cmFwKFxuICAgIGVsZW1lbnQ6IEVsZW1lbnQsXG4gICAgbW9kdWxlcz86IGFueVtdLFxuICAgIGNvbmZpZz86IElBbmd1bGFyQm9vdHN0cmFwQ29uZmlnLFxuICApOiBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgY29uc3Qge25nMU1vZHVsZSwgbmcyQm9vdHN0cmFwRGVmZXJyZWQsIG5nWm9uZX0gPSB0aGlzLmRlY2xhcmVOZzFNb2R1bGUobW9kdWxlcyk7XG5cbiAgICBjb25zdCB1cGdyYWRlID0gbmV3IFVwZ3JhZGVBZGFwdGVyUmVmKCk7XG5cbiAgICAvLyBNYWtlIHN1cmUgcmVzdW1lQm9vdHN0cmFwKCkgb25seSBleGlzdHMgaWYgdGhlIGN1cnJlbnQgYm9vdHN0cmFwIGlzIGRlZmVycmVkXG4gICAgY29uc3Qgd2luZG93QW5ndWxhciA9ICh3aW5kb3cgYXMgYW55KVsnYW5ndWxhciddO1xuICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gdW5kZWZpbmVkO1xuXG4gICAgbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICBib290c3RyYXAoZWxlbWVudCwgW25nMU1vZHVsZS5uYW1lXSwgY29uZmlnISk7XG4gICAgfSk7XG4gICAgY29uc3QgbmcxQm9vdHN0cmFwUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICBpZiAod2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXApIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxSZXN1bWVCb290c3RyYXA6ICgpID0+IHZvaWQgPSB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcDtcbiAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAgPSBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDtcbiAgICAgICAgICBjb25zdCByID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXAuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBQcm9taXNlLmFsbChbbmcyQm9vdHN0cmFwRGVmZXJyZWQucHJvbWlzZSwgbmcxQm9vdHN0cmFwUHJvbWlzZV0pLnRoZW4oKFtuZzFJbmplY3Rvcl0pID0+IHtcbiAgICAgIGFuZ3VsYXJFbGVtZW50KGVsZW1lbnQpLmRhdGEhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgdGhpcy5tb2R1bGVSZWYhLmluamVjdG9yKTtcbiAgICAgIHRoaXMubW9kdWxlUmVmIS5pbmplY3Rvci5nZXQ8Tmdab25lPihOZ1pvbmUpLnJ1bigoKSA9PiB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgdXBncmFkZS5fYm9vdHN0cmFwRG9uZSh0aGlzLm1vZHVsZVJlZiwgbmcxSW5qZWN0b3IpO1xuICAgICAgfSk7XG4gICAgfSwgb25FcnJvcik7XG4gICAgcmV0dXJuIHVwZ3JhZGU7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXJKUyBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFyLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgTG9naW4geyAuLi4gfVxuICAgKiBjbGFzcyBTZXJ2ZXIgeyAuLi4gfVxuICAgKlxuICAgKiBASW5qZWN0YWJsZSgpXG4gICAqIGNsYXNzIEV4YW1wbGUge1xuICAgKiAgIGNvbnN0cnVjdG9yKEBJbmplY3QoJ3NlcnZlcicpIHNlcnZlciwgbG9naW46IExvZ2luKSB7XG4gICAqICAgICAuLi5cbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLnNlcnZpY2UoJ3NlcnZlcicsIFNlcnZlcik7XG4gICAqIG1vZHVsZS5zZXJ2aWNlKCdsb2dpbicsIExvZ2luKTtcbiAgICpcbiAgICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqIGFkYXB0ZXIudXBncmFkZU5nMVByb3ZpZGVyKCdzZXJ2ZXInKTtcbiAgICogYWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIoJ2xvZ2luJywge2FzVG9rZW46IExvZ2lufSk7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KChyZWYpID0+IHtcbiAgICogICBjb25zdCBleGFtcGxlOiBFeGFtcGxlID0gcmVmLm5nMkluamVjdG9yLmdldChFeGFtcGxlKTtcbiAgICogfSk7XG4gICAqXG4gICAqIGBgYFxuICAgKi9cbiAgdXBncmFkZU5nMVByb3ZpZGVyKG5hbWU6IHN0cmluZywgb3B0aW9ucz86IHthc1Rva2VuOiBhbnl9KSB7XG4gICAgY29uc3QgdG9rZW4gPSAob3B0aW9ucyAmJiBvcHRpb25zLmFzVG9rZW4pIHx8IG5hbWU7XG4gICAgdGhpcy51cGdyYWRlZFByb3ZpZGVycy5wdXNoKHtcbiAgICAgIHByb3ZpZGU6IHRva2VuLFxuICAgICAgdXNlRmFjdG9yeTogKCRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSkgPT4gJGluamVjdG9yLmdldChuYW1lKSxcbiAgICAgIGRlcHM6IFskSU5KRUNUT1JdLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFyIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXJKUy5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEV4YW1wbGUge1xuICAgKiB9XG4gICAqXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKlxuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZmFjdG9yeSgnZXhhbXBsZScsIGFkYXB0ZXIuZG93bmdyYWRlTmcyUHJvdmlkZXIoRXhhbXBsZSkpO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeSgocmVmKSA9PiB7XG4gICAqICAgY29uc3QgZXhhbXBsZTogRXhhbXBsZSA9IHJlZi5uZzFJbmplY3Rvci5nZXQoJ2V4YW1wbGUnKTtcbiAgICogfSk7XG4gICAqXG4gICAqIGBgYFxuICAgKi9cbiAgZG93bmdyYWRlTmcyUHJvdmlkZXIodG9rZW46IGFueSk6IEZ1bmN0aW9uIHtcbiAgICByZXR1cm4gZG93bmdyYWRlSW5qZWN0YWJsZSh0b2tlbik7XG4gIH1cblxuICAvKipcbiAgICogRGVjbGFyZSB0aGUgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIGZvciB0aGlzIGFkYXB0ZXIgd2l0aG91dCBib290c3RyYXBwaW5nIHRoZSB3aG9sZVxuICAgKiBoeWJyaWQgYXBwbGljYXRpb24uXG4gICAqXG4gICAqIFRoaXMgbWV0aG9kIGlzIGF1dG9tYXRpY2FsbHkgY2FsbGVkIGJ5IGBib290c3RyYXAoKWAgYW5kIGByZWdpc3RlckZvck5nMVRlc3RzKClgLlxuICAgKlxuICAgKiBAcGFyYW0gbW9kdWxlcyBUaGUgQW5ndWxhckpTIG1vZHVsZXMgdGhhdCB0aGlzIHVwZ3JhZGUgbW9kdWxlIHNob3VsZCBkZXBlbmQgdXBvbi5cbiAgICogQHJldHVybnMgVGhlIEFuZ3VsYXJKUyB1cGdyYWRlIG1vZHVsZSB0aGF0IGlzIGRlY2xhcmVkIGJ5IHRoaXMgbWV0aG9kXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCB1cGdyYWRlQWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqIHVwZ3JhZGVBZGFwdGVyLmRlY2xhcmVOZzFNb2R1bGUoWydoZXJvQXBwJ10pO1xuICAgKiBgYGBcbiAgICovXG4gIHByaXZhdGUgZGVjbGFyZU5nMU1vZHVsZShtb2R1bGVzOiBzdHJpbmdbXSA9IFtdKToge1xuICAgIG5nMU1vZHVsZTogSU1vZHVsZTtcbiAgICBuZzJCb290c3RyYXBEZWZlcnJlZDogRGVmZXJyZWQ8SUluamVjdG9yU2VydmljZT47XG4gICAgbmdab25lOiBOZ1pvbmU7XG4gIH0ge1xuICAgIGNvbnN0IGRlbGF5QXBwbHlFeHBzOiBGdW5jdGlvbltdID0gW107XG4gICAgbGV0IG9yaWdpbmFsJGFwcGx5Rm46IEZ1bmN0aW9uO1xuICAgIGxldCByb290U2NvcGVQcm90b3R5cGU6IGFueTtcbiAgICBjb25zdCB1cGdyYWRlQWRhcHRlciA9IHRoaXM7XG4gICAgY29uc3QgbmcxTW9kdWxlID0gYW5ndWxhck1vZHVsZSh0aGlzLmlkUHJlZml4LCBtb2R1bGVzKTtcbiAgICBjb25zdCBwbGF0Zm9ybVJlZiA9IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKTtcblxuICAgIGNvbnN0IG5nWm9uZSA9IG5ldyBOZ1pvbmUoe1xuICAgICAgZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IFpvbmUuaGFzT3duUHJvcGVydHkoJ2xvbmdTdGFja1RyYWNlWm9uZVNwZWMnKSxcbiAgICB9KTtcbiAgICBjb25zdCBuZzJCb290c3RyYXBEZWZlcnJlZCA9IG5ldyBEZWZlcnJlZDxJSW5qZWN0b3JTZXJ2aWNlPigpO1xuICAgIG5nMU1vZHVsZVxuICAgICAgLmNvbnN0YW50KFVQR1JBREVfQVBQX1RZUEVfS0VZLCBVcGdyYWRlQXBwVHlwZS5EeW5hbWljKVxuICAgICAgLmZhY3RvcnkoSU5KRUNUT1JfS0VZLCAoKSA9PiB0aGlzLm1vZHVsZVJlZiEuaW5qZWN0b3IuZ2V0KEluamVjdG9yKSlcbiAgICAgIC5mYWN0b3J5KExBWllfTU9EVUxFX1JFRiwgW1xuICAgICAgICBJTkpFQ1RPUl9LRVksXG4gICAgICAgIChpbmplY3RvcjogSW5qZWN0b3IpID0+ICh7aW5qZWN0b3J9KSBhcyBMYXp5TW9kdWxlUmVmLFxuICAgICAgXSlcbiAgICAgIC5jb25zdGFudChOR19aT05FX0tFWSwgbmdab25lKVxuICAgICAgLmZhY3RvcnkoQ09NUElMRVJfS0VZLCAoKSA9PiB0aGlzLm1vZHVsZVJlZiEuaW5qZWN0b3IuZ2V0KENvbXBpbGVyKSlcbiAgICAgIC5jb25maWcoW1xuICAgICAgICAnJHByb3ZpZGUnLFxuICAgICAgICAnJGluamVjdG9yJyxcbiAgICAgICAgKHByb3ZpZGU6IElQcm92aWRlU2VydmljZSwgbmcxSW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UpID0+IHtcbiAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcigkUk9PVF9TQ09QRSwgW1xuICAgICAgICAgICAgJyRkZWxlZ2F0ZScsXG4gICAgICAgICAgICBmdW5jdGlvbiAocm9vdFNjb3BlRGVsZWdhdGU6IElSb290U2NvcGVTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgIC8vIENhcHR1cmUgdGhlIHJvb3QgYXBwbHkgc28gdGhhdCB3ZSBjYW4gZGVsYXkgZmlyc3QgY2FsbCB0byAkYXBwbHkgdW50aWwgd2VcbiAgICAgICAgICAgICAgLy8gYm9vdHN0cmFwIEFuZ3VsYXIgYW5kIHRoZW4gd2UgcmVwbGF5IGFuZCByZXN0b3JlIHRoZSAkYXBwbHkuXG4gICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZSA9IHJvb3RTY29wZURlbGVnYXRlLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSgnJGFwcGx5JykpIHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbCRhcHBseUZuID0gcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseTtcbiAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5ID0gKGV4cDogYW55KSA9PiBkZWxheUFwcGx5RXhwcy5wdXNoKGV4cCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRmFpbGVkIHRvIGZpbmQgJyRhcHBseScgb24gJyRyb290U2NvcGUnIVwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlRGVsZWdhdGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0pO1xuICAgICAgICAgIGlmIChuZzFJbmplY3Rvci5oYXMoJCRURVNUQUJJTElUWSkpIHtcbiAgICAgICAgICAgIHByb3ZpZGUuZGVjb3JhdG9yKCQkVEVTVEFCSUxJVFksIFtcbiAgICAgICAgICAgICAgJyRkZWxlZ2F0ZScsXG4gICAgICAgICAgICAgIGZ1bmN0aW9uICh0ZXN0YWJpbGl0eURlbGVnYXRlOiBJVGVzdGFiaWxpdHlTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxXaGVuU3RhYmxlOiBGdW5jdGlvbiA9IHRlc3RhYmlsaXR5RGVsZWdhdGUud2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAvLyBDYW5ub3QgdXNlIGFycm93IGZ1bmN0aW9uIGJlbG93IGJlY2F1c2Ugd2UgbmVlZCB0aGUgY29udGV4dFxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1doZW5TdGFibGUgPSBmdW5jdGlvbiAodGhpczogdW5rbm93biwgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICBvcmlnaW5hbFdoZW5TdGFibGUuY2FsbCh0aGlzLCBmdW5jdGlvbiAodGhpczogdW5rbm93bikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZzJUZXN0YWJpbGl0eTogVGVzdGFiaWxpdHkgPVxuICAgICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVBZGFwdGVyLm1vZHVsZVJlZiEuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5nMlRlc3RhYmlsaXR5LmlzU3RhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIG5nMlRlc3RhYmlsaXR5LndoZW5TdGFibGUobmV3V2hlblN0YWJsZS5iaW5kKHRoaXMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGUgPSBuZXdXaGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgXSk7XG5cbiAgICBuZzFNb2R1bGUucnVuKFtcbiAgICAgICckaW5qZWN0b3InLFxuICAgICAgJyRyb290U2NvcGUnLFxuICAgICAgKG5nMUluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlLCByb290U2NvcGU6IElSb290U2NvcGVTZXJ2aWNlKSA9PiB7XG4gICAgICAgIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlci5yZXNvbHZlKHRoaXMubmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZCwgbmcxSW5qZWN0b3IpXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCB3ZSBoYXZlIG5nMSBpbmplY3RvciBhbmQgd2UgaGF2ZSBwcmVwYXJlZFxuICAgICAgICAgICAgLy8gbmcxIGNvbXBvbmVudHMgdG8gYmUgdXBncmFkZWQsIHdlIG5vdyBjYW4gYm9vdHN0cmFwIG5nMi5cbiAgICAgICAgICAgIEBOZ01vZHVsZSh7XG4gICAgICAgICAgICAgIGppdDogdHJ1ZSxcbiAgICAgICAgICAgICAgcHJvdmlkZXJzOiBbXG4gICAgICAgICAgICAgICAge3Byb3ZpZGU6ICRJTkpFQ1RPUiwgdXNlRmFjdG9yeTogKCkgPT4gbmcxSW5qZWN0b3J9LFxuICAgICAgICAgICAgICAgIHtwcm92aWRlOiAkQ09NUElMRSwgdXNlRmFjdG9yeTogKCkgPT4gbmcxSW5qZWN0b3IuZ2V0KCRDT01QSUxFKX0sXG4gICAgICAgICAgICAgICAgdGhpcy51cGdyYWRlZFByb3ZpZGVycyxcbiAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgaW1wb3J0czogW3Jlc29sdmVGb3J3YXJkUmVmKHRoaXMubmcyQXBwTW9kdWxlKV0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgY2xhc3MgRHluYW1pY05nVXBncmFkZU1vZHVsZSB7XG4gICAgICAgICAgICAgIG5nRG9Cb290c3RyYXAoKSB7fVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGxhdGZvcm1SZWZcbiAgICAgICAgICAgICAgLmJvb3RzdHJhcE1vZHVsZShEeW5hbWljTmdVcGdyYWRlTW9kdWxlLCBbdGhpcy5jb21waWxlck9wdGlvbnMhLCB7bmdab25lfV0pXG4gICAgICAgICAgICAgIC50aGVuKChyZWY6IE5nTW9kdWxlUmVmPGFueT4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vZHVsZVJlZiA9IHJlZjtcbiAgICAgICAgICAgICAgICBuZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChyb290U2NvcGVQcm90b3R5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IG9yaWdpbmFsJGFwcGx5Rm47IC8vIHJlc3RvcmUgb3JpZ2luYWwgJGFwcGx5XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChkZWxheUFwcGx5RXhwcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICByb290U2NvcGUuJGFwcGx5KGRlbGF5QXBwbHlFeHBzLnNoaWZ0KCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC50aGVuKCgpID0+IG5nMkJvb3RzdHJhcERlZmVycmVkLnJlc29sdmUobmcxSW5qZWN0b3IpLCBvbkVycm9yKVxuICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHN1YnNjcmlwdGlvbiA9IG5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgICAgICBuZXh0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb290U2NvcGUuJCRwaGFzZSkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ0EgZGlnZXN0IHdhcyB0cmlnZ2VyZWQgd2hpbGUgb25lIHdhcyBhbHJlYWR5IGluIHByb2dyZXNzLiBUaGlzIG1heSBtZWFuIHRoYXQgc29tZXRoaW5nIGlzIHRyaWdnZXJpbmcgZGlnZXN0cyBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmUuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb3RTY29wZS4kZXZhbEFzeW5jKCgpID0+IHt9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByb290U2NvcGUuJGRpZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByb290U2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gRGVzdHJveSB0aGUgQW5ndWxhckpTIGFwcCBvbmNlIHRoZSBBbmd1bGFyIGBQbGF0Zm9ybVJlZmAgaXMgZGVzdHJveWVkLlxuICAgICAgICAgICAgICAgIC8vIFRoaXMgZG9lcyBub3QgaGFwcGVuIGluIGEgdHlwaWNhbCBTUEEgc2NlbmFyaW8sIGJ1dCBpdCBtaWdodCBiZSB1c2VmdWwgZm9yXG4gICAgICAgICAgICAgICAgLy8gb3RoZXIgdXNlLWNhc2VzIHdoZXJlIGRpc3Bvc2luZyBvZiBhbiBBbmd1bGFyL0FuZ3VsYXJKUyBhcHAgaXMgbmVjZXNzYXJ5XG4gICAgICAgICAgICAgICAgLy8gKHN1Y2ggYXMgSG90IE1vZHVsZSBSZXBsYWNlbWVudCAoSE1SKSkuXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvaXNzdWVzLzM5OTM1LlxuICAgICAgICAgICAgICAgIHBsYXRmb3JtUmVmLm9uRGVzdHJveSgoKSA9PiBkZXN0cm95QXBwKG5nMUluamVjdG9yKSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKChlKSA9PiBuZzJCb290c3RyYXBEZWZlcnJlZC5yZWplY3QoZSkpO1xuICAgICAgfSxcbiAgICBdKTtcblxuICAgIHJldHVybiB7bmcxTW9kdWxlLCBuZzJCb290c3RyYXBEZWZlcnJlZCwgbmdab25lfTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZSBgVXBncmFkZUFkYXB0ZXJSZWZgIHRvIGNvbnRyb2wgYSBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAZGVwcmVjYXRlZCBEZXByZWNhdGVkIHNpbmNlIHY1LiBVc2UgYHVwZ3JhZGUvc3RhdGljYCBpbnN0ZWFkLCB3aGljaCBhbHNvIHN1cHBvcnRzXG4gKiBbQWhlYWQtb2YtVGltZSBjb21waWxhdGlvbl0oZ3VpZGUvYW90LWNvbXBpbGVyKS5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX3JlYWR5Rm46ICgodXBncmFkZUFkYXB0ZXJSZWY6IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuXG4gIHB1YmxpYyBuZzFSb290U2NvcGU6IElSb290U2NvcGVTZXJ2aWNlID0gbnVsbCE7XG4gIHB1YmxpYyBuZzFJbmplY3RvcjogSUluamVjdG9yU2VydmljZSA9IG51bGwhO1xuICBwdWJsaWMgbmcyTW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+ID0gbnVsbCE7XG4gIHB1YmxpYyBuZzJJbmplY3RvcjogSW5qZWN0b3IgPSBudWxsITtcblxuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYm9vdHN0cmFwRG9uZShuZ01vZHVsZVJlZjogTmdNb2R1bGVSZWY8YW55PiwgbmcxSW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UpIHtcbiAgICB0aGlzLm5nMk1vZHVsZVJlZiA9IG5nTW9kdWxlUmVmO1xuICAgIHRoaXMubmcySW5qZWN0b3IgPSBuZ01vZHVsZVJlZi5pbmplY3RvcjtcbiAgICB0aGlzLm5nMUluamVjdG9yID0gbmcxSW5qZWN0b3I7XG4gICAgdGhpcy5uZzFSb290U2NvcGUgPSBuZzFJbmplY3Rvci5nZXQoJFJPT1RfU0NPUEUpO1xuICAgIHRoaXMuX3JlYWR5Rm4gJiYgdGhpcy5fcmVhZHlGbih0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoaWNoIGlzIG5vdGlmaWVkIHVwb24gc3VjY2Vzc2Z1bCBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhclxuICAgKiBhcHBsaWNhdGlvbiBoYXMgYmVlbiBib290c3RyYXBwZWQuXG4gICAqXG4gICAqIFRoZSBgcmVhZHlgIGNhbGxiYWNrIGZ1bmN0aW9uIGlzIGludm9rZWQgaW5zaWRlIHRoZSBBbmd1bGFyIHpvbmUsIHRoZXJlZm9yZSBpdCBkb2VzIG5vdFxuICAgKiByZXF1aXJlIGEgY2FsbCB0byBgJGFwcGx5KClgLlxuICAgKi9cbiAgcHVibGljIHJlYWR5KGZuOiAodXBncmFkZUFkYXB0ZXJSZWY6IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkKSB7XG4gICAgdGhpcy5fcmVhZHlGbiA9IGZuO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3Bvc2Ugb2YgcnVubmluZyBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBkaXNwb3NlKCkge1xuICAgIHRoaXMubmcxSW5qZWN0b3IhLmdldCgkUk9PVF9TQ09QRSkuJGRlc3Ryb3koKTtcbiAgICB0aGlzLm5nMk1vZHVsZVJlZiEuZGVzdHJveSgpO1xuICB9XG59XG4iXX0=