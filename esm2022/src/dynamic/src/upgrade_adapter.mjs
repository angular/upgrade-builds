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
 * [Ahead-of-Time compilation](tools/cli/aot-compiler).
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
 * [Ahead-of-Time compilation](tools/cli/aot-compiler).
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvZHluYW1pYy9zcmMvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQ0wsUUFBUSxFQUVSLFFBQVEsRUFDUixRQUFRLEVBRVIsTUFBTSxFQUNOLGlCQUFpQixFQUVqQixXQUFXLEdBRVosTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sbUNBQW1DLENBQUM7QUFFekUsT0FBTyxFQUNMLFNBQVMsRUFDVCxPQUFPLElBQUksY0FBYyxFQVF6QixPQUFPLElBQUksYUFBYSxHQUN6QixNQUFNLDJCQUEyQixDQUFDO0FBQ25DLE9BQU8sRUFDTCxhQUFhLEVBQ2IsUUFBUSxFQUNSLFNBQVMsRUFDVCxXQUFXLEVBQ1gsWUFBWSxFQUNaLFlBQVksRUFDWixlQUFlLEVBQ2YsV0FBVyxFQUNYLG9CQUFvQixHQUNyQixNQUFNLDRCQUE0QixDQUFDO0FBQ3BDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBQzFFLE9BQU8sRUFDTCxhQUFhLEVBQ2IsUUFBUSxFQUNSLFVBQVUsRUFFVixPQUFPLEdBRVIsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQixPQUFPLEVBQUMsaUNBQWlDLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUV4RSxJQUFJLFlBQVksR0FBVyxDQUFDLENBQUM7QUFFN0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlGRztBQUNILE1BQU0sT0FBTyxjQUFjO0lBZXpCLFlBQ1UsWUFBdUIsRUFDdkIsZUFBaUM7UUFEakMsaUJBQVksR0FBWixZQUFZLENBQVc7UUFDdkIsb0JBQWUsR0FBZixlQUFlLENBQWtCO1FBaEJuQyxhQUFRLEdBQVcsZUFBZSxZQUFZLEVBQUUsR0FBRyxDQUFDO1FBQ3BELHlCQUFvQixHQUFnQixFQUFFLENBQUM7UUFDL0M7Ozs7Ozs7V0FPRztRQUNLLDhCQUF5QixHQUF3RCxFQUFFLENBQUM7UUFDcEYsc0JBQWlCLEdBQXFCLEVBQUUsQ0FBQztRQUN6QyxjQUFTLEdBQTRCLElBQUksQ0FBQztRQU1oRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FDYiwrRUFBK0UsQ0FDaEYsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BMkRHO0lBQ0gscUJBQXFCLENBQUMsU0FBb0I7UUFDeEMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUUxQyxPQUFPLGtCQUFrQixDQUFDLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BNkVHO0lBQ0gsbUJBQW1CLENBQUMsSUFBWTtRQUM5QixJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN4RCxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbkQsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksaUNBQWlDLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3hGLElBQUksQ0FBQztRQUNWLENBQUM7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O09BeUNHO0lBQ0gsbUJBQW1CLENBQUMsT0FBa0I7UUFDcEMsTUFBTSxZQUFZLEdBQUksTUFBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNyRCxJQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzFDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBQ0QsTUFBTSxFQUFDLFNBQVMsRUFBRSxvQkFBb0IsRUFBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN6RSxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUM7UUFDeEMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ2hELG1CQUFtQjtZQUNuQixPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ1osT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQTRDRztJQUNILFNBQVMsQ0FDUCxPQUFnQixFQUNoQixPQUFlLEVBQ2YsTUFBZ0M7UUFFaEMsTUFBTSxFQUFDLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLEVBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFakYsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1FBRXhDLCtFQUErRTtRQUMvRSxNQUFNLGFBQWEsR0FBSSxNQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsYUFBYSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7UUFFMUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDZCxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU8sQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3hELElBQUksYUFBYSxDQUFDLGVBQWUsRUFBRSxDQUFDO2dCQUNsQyxNQUFNLHVCQUF1QixHQUFlLGFBQWEsQ0FBQyxlQUFlLENBQUM7Z0JBQzFFLGFBQWEsQ0FBQyxlQUFlLEdBQUc7b0JBQzlCLGFBQWEsQ0FBQyxlQUFlLEdBQUcsdUJBQXVCLENBQUM7b0JBQ3hELE1BQU0sQ0FBQyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDL0QsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQyxDQUFDO1lBQ0osQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDO1lBQ1osQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFO1lBQ3RGLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckYsSUFBSSxDQUFDLFNBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFTLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3BELG1CQUFtQjtnQkFDbkIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ1osT0FBTyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0E4Qkc7SUFDSCxrQkFBa0IsQ0FBQyxJQUFZLEVBQUUsT0FBd0I7UUFDdkQsTUFBTSxLQUFLLEdBQUcsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQztRQUNuRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1lBQzFCLE9BQU8sRUFBRSxLQUFLO1lBQ2QsVUFBVSxFQUFFLENBQUMsU0FBMkIsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDaEUsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDO1NBQ2xCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FvQkc7SUFDSCxvQkFBb0IsQ0FBQyxLQUFVO1FBQzdCLE9BQU8sbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7Ozs7O09BZ0JHO0lBQ0ssZ0JBQWdCLENBQUMsVUFBb0IsRUFBRTtRQUs3QyxNQUFNLGNBQWMsR0FBZSxFQUFFLENBQUM7UUFDdEMsSUFBSSxnQkFBMEIsQ0FBQztRQUMvQixJQUFJLGtCQUF1QixDQUFDO1FBQzVCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQztRQUM1QixNQUFNLFNBQVMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4RCxNQUFNLFdBQVcsR0FBRyxzQkFBc0IsRUFBRSxDQUFDO1FBRTdDLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDO1lBQ3hCLG9CQUFvQixFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUM7U0FDcEUsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLFFBQVEsRUFBb0IsQ0FBQztRQUM5RCxTQUFTO2FBQ04sUUFBUSxDQUFDLG9CQUFvQixpQ0FBeUI7YUFDdEQsT0FBTyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkUsT0FBTyxDQUFDLGVBQWUsRUFBRTtZQUN4QixZQUFZO1lBQ1osQ0FBQyxRQUFrQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFDLENBQWtCO1NBQ3RELENBQUM7YUFDRCxRQUFRLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQzthQUM3QixPQUFPLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNuRSxNQUFNLENBQUM7WUFDTixVQUFVO1lBQ1YsV0FBVztZQUNYLENBQUMsT0FBd0IsRUFBRSxXQUE2QixFQUFFLEVBQUU7Z0JBQzFELE9BQU8sQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFO29CQUM3QixXQUFXO29CQUNYLFVBQVUsaUJBQW9DO3dCQUM1Qyw0RUFBNEU7d0JBQzVFLCtEQUErRDt3QkFDL0Qsa0JBQWtCLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQzt3QkFDN0QsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQzs0QkFDaEQsZ0JBQWdCLEdBQUcsa0JBQWtCLENBQUMsTUFBTSxDQUFDOzRCQUM3QyxrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFRLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3JFLENBQUM7NkJBQU0sQ0FBQzs0QkFDTixNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7d0JBQzlELENBQUM7d0JBQ0QsT0FBTyxpQkFBaUIsQ0FBQztvQkFDM0IsQ0FBQztpQkFDRixDQUFDLENBQUM7Z0JBQ0gsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7b0JBQ25DLE9BQU8sQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFO3dCQUMvQixXQUFXO3dCQUNYLFVBQVUsbUJBQXdDOzRCQUNoRCxNQUFNLGtCQUFrQixHQUFhLG1CQUFtQixDQUFDLFVBQVUsQ0FBQzs0QkFDcEUsOERBQThEOzRCQUM5RCxNQUFNLGFBQWEsR0FBRyxVQUF5QixRQUFrQjtnQ0FDL0Qsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtvQ0FDNUIsTUFBTSxjQUFjLEdBQ2xCLGNBQWMsQ0FBQyxTQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQ0FDdEQsSUFBSSxjQUFjLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQzt3Q0FDOUIsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7b0NBQ2xDLENBQUM7eUNBQU0sQ0FBQzt3Q0FDTixjQUFjLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0NBQ2hFLENBQUM7Z0NBQ0gsQ0FBQyxDQUFDLENBQUM7NEJBQ0wsQ0FBQyxDQUFDOzRCQUVGLG1CQUFtQixDQUFDLFVBQVUsR0FBRyxhQUFhLENBQUM7NEJBQy9DLE9BQU8sbUJBQW1CLENBQUM7d0JBQzdCLENBQUM7cUJBQ0YsQ0FBQyxDQUFDO2dCQUNMLENBQUM7WUFDSCxDQUFDO1NBQ0YsQ0FBQyxDQUFDO1FBRUwsU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUNaLFdBQVc7WUFDWCxZQUFZO1lBQ1osQ0FBQyxXQUE2QixFQUFFLFNBQTRCLEVBQUUsRUFBRTtnQkFDOUQsaUNBQWlDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxXQUFXLENBQUM7cUJBQ25GLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ1QsMERBQTBEO29CQUMxRCwyREFBMkQ7b0JBVTNELElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXNCO3dCQUMxQixhQUFhLEtBQUksQ0FBQztxQkFDbkIsQ0FBQTtvQkFGSyxzQkFBc0I7d0JBVDNCLFFBQVEsQ0FBQzs0QkFDUixHQUFHLEVBQUUsSUFBSTs0QkFDVCxTQUFTLEVBQUU7Z0NBQ1QsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUM7Z0NBQ25ELEVBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBQztnQ0FDaEUsSUFBSSxDQUFDLGlCQUFpQjs2QkFDdkI7NEJBQ0QsT0FBTyxFQUFFLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO3lCQUNoRCxDQUFDO3VCQUNJLHNCQUFzQixDQUUzQjtvQkFDRCxXQUFXO3lCQUNSLGVBQWUsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFnQixFQUFFLEVBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQzt5QkFDMUUsSUFBSSxDQUFDLENBQUMsR0FBcUIsRUFBRSxFQUFFO3dCQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQzt3QkFDckIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7NEJBQ2QsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO2dDQUN2QixrQkFBa0IsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQywwQkFBMEI7Z0NBQ3hFLE9BQU8sY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDO29DQUM3QixTQUFTLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dDQUMzQyxDQUFDO2dDQUNELGtCQUFrQixHQUFHLElBQUksQ0FBQzs0QkFDNUIsQ0FBQzt3QkFDSCxDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUM7eUJBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRSxPQUFPLENBQUM7eUJBQzlELElBQUksQ0FBQyxHQUFHLEVBQUU7d0JBQ1QsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQzs0QkFDbkQsSUFBSSxFQUFFLEdBQUcsRUFBRTtnQ0FDVCxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQ0FDdEIsSUFBSSxPQUFPLFNBQVMsS0FBSyxXQUFXLElBQUksU0FBUyxFQUFFLENBQUM7d0NBQ2xELE9BQU8sQ0FBQyxJQUFJLENBQ1Ysd0lBQXdJLENBQ3pJLENBQUM7b0NBQ0osQ0FBQztvQ0FFRCxPQUFPLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7Z0NBQ3hDLENBQUM7Z0NBRUQsT0FBTyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBQzdCLENBQUM7eUJBQ0YsQ0FBQyxDQUFDO3dCQUNILFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTs0QkFDN0IsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUM3QixDQUFDLENBQUMsQ0FBQzt3QkFFSCx5RUFBeUU7d0JBQ3pFLDZFQUE2RTt3QkFDN0UsMkVBQTJFO3dCQUMzRSwwQ0FBMEM7d0JBQzFDLHVEQUF1RDt3QkFDdkQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztvQkFDdkQsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDO3FCQUNELEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsQ0FBQztTQUNGLENBQUMsQ0FBQztRQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDbkQsQ0FBQztDQUNGO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSxPQUFPLGlCQUFpQjtJQUE5QjtRQUNFLGVBQWU7UUFDUCxhQUFRLEdBQTRELElBQUksQ0FBQztRQUUxRSxpQkFBWSxHQUFzQixJQUFLLENBQUM7UUFDeEMsZ0JBQVcsR0FBcUIsSUFBSyxDQUFDO1FBQ3RDLGlCQUFZLEdBQXFCLElBQUssQ0FBQztRQUN2QyxnQkFBVyxHQUFhLElBQUssQ0FBQztJQTZCdkMsQ0FBQztJQTNCQyxlQUFlO0lBQ1AsY0FBYyxDQUFDLFdBQTZCLEVBQUUsV0FBNkI7UUFDakYsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDaEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLEtBQUssQ0FBQyxFQUFrRDtRQUM3RCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSSxPQUFPO1FBQ1osSUFBSSxDQUFDLFdBQVksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLFlBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMvQixDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ29tcGlsZXIsXG4gIENvbXBpbGVyT3B0aW9ucyxcbiAgSW5qZWN0b3IsXG4gIE5nTW9kdWxlLFxuICBOZ01vZHVsZVJlZixcbiAgTmdab25lLFxuICByZXNvbHZlRm9yd2FyZFJlZixcbiAgU3RhdGljUHJvdmlkZXIsXG4gIFRlc3RhYmlsaXR5LFxuICBUeXBlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7cGxhdGZvcm1Ccm93c2VyRHluYW1pY30gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci1keW5hbWljJztcblxuaW1wb3J0IHtcbiAgYm9vdHN0cmFwLFxuICBlbGVtZW50IGFzIGFuZ3VsYXJFbGVtZW50LFxuICBJQW5ndWxhckJvb3RzdHJhcENvbmZpZyxcbiAgSUF1Z21lbnRlZEpRdWVyeSxcbiAgSUluamVjdG9yU2VydmljZSxcbiAgSU1vZHVsZSxcbiAgSVByb3ZpZGVTZXJ2aWNlLFxuICBJUm9vdFNjb3BlU2VydmljZSxcbiAgSVRlc3RhYmlsaXR5U2VydmljZSxcbiAgbW9kdWxlXyBhcyBhbmd1bGFyTW9kdWxlLFxufSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2FuZ3VsYXIxJztcbmltcG9ydCB7XG4gICQkVEVTVEFCSUxJVFksXG4gICRDT01QSUxFLFxuICAkSU5KRUNUT1IsXG4gICRST09UX1NDT1BFLFxuICBDT01QSUxFUl9LRVksXG4gIElOSkVDVE9SX0tFWSxcbiAgTEFaWV9NT0RVTEVfUkVGLFxuICBOR19aT05FX0tFWSxcbiAgVVBHUkFERV9BUFBfVFlQRV9LRVksXG59IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7ZG93bmdyYWRlQ29tcG9uZW50fSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2Rvd25ncmFkZV9jb21wb25lbnQnO1xuaW1wb3J0IHtkb3duZ3JhZGVJbmplY3RhYmxlfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2Rvd25ncmFkZV9pbmplY3RhYmxlJztcbmltcG9ydCB7XG4gIGNvbnRyb2xsZXJLZXksXG4gIERlZmVycmVkLFxuICBkZXN0cm95QXBwLFxuICBMYXp5TW9kdWxlUmVmLFxuICBvbkVycm9yLFxuICBVcGdyYWRlQXBwVHlwZSxcbn0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy91dGlsJztcblxuaW1wb3J0IHtVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9IGZyb20gJy4vdXBncmFkZV9uZzFfYWRhcHRlcic7XG5cbmxldCB1cGdyYWRlQ291bnQ6IG51bWJlciA9IDA7XG5cbi8qKlxuICogVXNlIGBVcGdyYWRlQWRhcHRlcmAgdG8gYWxsb3cgQW5ndWxhckpTIGFuZCBBbmd1bGFyIHRvIGNvZXhpc3QgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogVGhlIGBVcGdyYWRlQWRhcHRlcmAgYWxsb3dzOlxuICogMS4gY3JlYXRpb24gb2YgQW5ndWxhciBjb21wb25lbnQgZnJvbSBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZVxuICogICAgKFNlZSB7QGxpbmsgVXBncmFkZUFkYXB0ZXIjdXBncmFkZU5nMUNvbXBvbmVudH0pXG4gKiAyLiBjcmVhdGlvbiBvZiBBbmd1bGFySlMgZGlyZWN0aXZlIGZyb20gQW5ndWxhciBjb21wb25lbnQuXG4gKiAgICAoU2VlIHtAbGluayBVcGdyYWRlQWRhcHRlciNkb3duZ3JhZGVOZzJDb21wb25lbnR9KVxuICogMy4gQm9vdHN0cmFwcGluZyBvZiBhIGh5YnJpZCBBbmd1bGFyIGFwcGxpY2F0aW9uIHdoaWNoIGNvbnRhaW5zIGJvdGggb2YgdGhlIGZyYW1ld29ya3NcbiAqICAgIGNvZXhpc3RpbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqICMjIyBNZW50YWwgTW9kZWxcbiAqXG4gKiBXaGVuIHJlYXNvbmluZyBhYm91dCBob3cgYSBoeWJyaWQgYXBwbGljYXRpb24gd29ya3MgaXQgaXMgdXNlZnVsIHRvIGhhdmUgYSBtZW50YWwgbW9kZWwgd2hpY2hcbiAqIGRlc2NyaWJlcyB3aGF0IGlzIGhhcHBlbmluZyBhbmQgZXhwbGFpbnMgd2hhdCBpcyBoYXBwZW5pbmcgYXQgdGhlIGxvd2VzdCBsZXZlbC5cbiAqXG4gKiAxLiBUaGVyZSBhcmUgdHdvIGluZGVwZW5kZW50IGZyYW1ld29ya3MgcnVubmluZyBpbiBhIHNpbmdsZSBhcHBsaWNhdGlvbiwgZWFjaCBmcmFtZXdvcmsgdHJlYXRzXG4gKiAgICB0aGUgb3RoZXIgYXMgYSBibGFjayBib3guXG4gKiAyLiBFYWNoIERPTSBlbGVtZW50IG9uIHRoZSBwYWdlIGlzIG93bmVkIGV4YWN0bHkgYnkgb25lIGZyYW1ld29yay4gV2hpY2hldmVyIGZyYW1ld29ya1xuICogICAgaW5zdGFudGlhdGVkIHRoZSBlbGVtZW50IGlzIHRoZSBvd25lci4gRWFjaCBmcmFtZXdvcmsgb25seSB1cGRhdGVzL2ludGVyYWN0cyB3aXRoIGl0cyBvd25cbiAqICAgIERPTSBlbGVtZW50cyBhbmQgaWdub3JlcyBvdGhlcnMuXG4gKiAzLiBBbmd1bGFySlMgZGlyZWN0aXZlcyBhbHdheXMgZXhlY3V0ZSBpbnNpZGUgQW5ndWxhckpTIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA0LiBBbmd1bGFyIGNvbXBvbmVudHMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIEFuZ3VsYXIgZnJhbWV3b3JrIGNvZGViYXNlIHJlZ2FyZGxlc3Mgb2ZcbiAqICAgIHdoZXJlIHRoZXkgYXJlIGluc3RhbnRpYXRlZC5cbiAqIDUuIEFuIEFuZ3VsYXJKUyBjb21wb25lbnQgY2FuIGJlIHVwZ3JhZGVkIHRvIGFuIEFuZ3VsYXIgY29tcG9uZW50LiBUaGlzIGNyZWF0ZXMgYW5cbiAqICAgIEFuZ3VsYXIgZGlyZWN0aXZlLCB3aGljaCBib290c3RyYXBzIHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZSBpbiB0aGF0IGxvY2F0aW9uLlxuICogNi4gQW4gQW5ndWxhciBjb21wb25lbnQgY2FuIGJlIGRvd25ncmFkZWQgdG8gYW4gQW5ndWxhckpTIGNvbXBvbmVudCBkaXJlY3RpdmUuIFRoaXMgY3JlYXRlc1xuICogICAgYW4gQW5ndWxhckpTIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhciBjb21wb25lbnQgaW4gdGhhdCBsb2NhdGlvbi5cbiAqIDcuIFdoZW5ldmVyIGFuIGFkYXB0ZXIgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IHRoZSBmcmFtZXdvcmtcbiAqICAgIGRvaW5nIHRoZSBpbnN0YW50aWF0aW9uLiBUaGUgb3RoZXIgZnJhbWV3b3JrIHRoZW4gaW5zdGFudGlhdGVzIGFuZCBvd25zIHRoZSB2aWV3IGZvciB0aGF0XG4gKiAgICBjb21wb25lbnQuIFRoaXMgaW1wbGllcyB0aGF0IGNvbXBvbmVudCBiaW5kaW5ncyB3aWxsIGFsd2F5cyBmb2xsb3cgdGhlIHNlbWFudGljcyBvZiB0aGVcbiAqICAgIGluc3RhbnRpYXRpb24gZnJhbWV3b3JrLiBUaGUgc3ludGF4IGlzIGFsd2F5cyB0aGF0IG9mIEFuZ3VsYXIgc3ludGF4LlxuICogOC4gQW5ndWxhckpTIGlzIGFsd2F5cyBib290c3RyYXBwZWQgZmlyc3QgYW5kIG93bnMgdGhlIGJvdHRvbSBtb3N0IHZpZXcuXG4gKiA5LiBUaGUgbmV3IGFwcGxpY2F0aW9uIGlzIHJ1bm5pbmcgaW4gQW5ndWxhciB6b25lLCBhbmQgdGhlcmVmb3JlIGl0IG5vIGxvbmdlciBuZWVkcyBjYWxscyB0b1xuICogICAgYCRhcHBseSgpYC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihmb3J3YXJkUmVmKCgpID0+IE15TmcyTW9kdWxlKSwgbXlDb21waWxlck9wdGlvbnMpO1xuICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMkNvbXAnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChOZzJDb21wb25lbnQpKTtcbiAqXG4gKiBtb2R1bGUuZGlyZWN0aXZlKCduZzFIZWxsbycsIGZ1bmN0aW9uKCkge1xuICogICByZXR1cm4ge1xuICogICAgICBzY29wZTogeyB0aXRsZTogJz0nIH0sXG4gKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gKiAgIH07XG4gKiB9KTtcbiAqXG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbmcyLWNvbXAnLFxuICogICBpbnB1dHM6IFsnbmFtZSddLFxuICogICB0ZW1wbGF0ZTogJ25nMls8bmcxLWhlbGxvIFt0aXRsZV09XCJuYW1lXCI+dHJhbnNjbHVkZTwvbmcxLWhlbGxvPl0oPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PiknLFxuICogICBkaXJlY3RpdmVzOlxuICogfSlcbiAqIGNsYXNzIE5nMkNvbXBvbmVudCB7XG4gKiB9XG4gKlxuICogQE5nTW9kdWxlKHtcbiAqICAgZGVjbGFyYXRpb25zOiBbTmcyQ29tcG9uZW50LCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ25nMUhlbGxvJyldLFxuICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAqIH0pXG4gKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICpcbiAqXG4gKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyLWNvbXAgbmFtZT1cIldvcmxkXCI+cHJvamVjdDwvbmcyLWNvbXA+JztcbiAqXG4gKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXG4gKiAgICAgICBcIm5nMltuZzFbSGVsbG8gV29ybGQhXSh0cmFuc2NsdWRlKV0ocHJvamVjdClcIik7XG4gKiB9KTtcbiAqXG4gKiBgYGBcbiAqXG4gKiBAZGVwcmVjYXRlZCBEZXByZWNhdGVkIHNpbmNlIHY1LiBVc2UgYHVwZ3JhZGUvc3RhdGljYCBpbnN0ZWFkLCB3aGljaCBhbHNvIHN1cHBvcnRzXG4gKiBbQWhlYWQtb2YtVGltZSBjb21waWxhdGlvbl0odG9vbHMvY2xpL2FvdC1jb21waWxlcikuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlQWRhcHRlciB7XG4gIHByaXZhdGUgaWRQcmVmaXg6IHN0cmluZyA9IGBORzJfVVBHUkFERV8ke3VwZ3JhZGVDb3VudCsrfV9gO1xuICBwcml2YXRlIGRvd25ncmFkZWRDb21wb25lbnRzOiBUeXBlPGFueT5bXSA9IFtdO1xuICAvKipcbiAgICogQW4gaW50ZXJuYWwgbWFwIG9mIG5nMSBjb21wb25lbnRzIHdoaWNoIG5lZWQgdG8gdXAgdXBncmFkZWQgdG8gbmcyLlxuICAgKlxuICAgKiBXZSBjYW4ndCB1cGdyYWRlIHVudGlsIGluamVjdG9yIGlzIGluc3RhbnRpYXRlZCBhbmQgd2UgY2FuIHJldHJpZXZlIHRoZSBjb21wb25lbnQgbWV0YWRhdGEuXG4gICAqIEZvciB0aGlzIHJlYXNvbiB3ZSBrZWVwIGEgbGlzdCBvZiBjb21wb25lbnRzIHRvIHVwZ3JhZGUgdW50aWwgbmcxIGluamVjdG9yIGlzIGJvb3RzdHJhcHBlZC5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwcml2YXRlIG5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWQ6IHtbbmFtZTogc3RyaW5nXTogVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSA9IHt9O1xuICBwcml2YXRlIHVwZ3JhZGVkUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW107XG4gIHByaXZhdGUgbW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBuZzJBcHBNb2R1bGU6IFR5cGU8YW55PixcbiAgICBwcml2YXRlIGNvbXBpbGVyT3B0aW9ucz86IENvbXBpbGVyT3B0aW9ucyxcbiAgKSB7XG4gICAgaWYgKCFuZzJBcHBNb2R1bGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1VwZ3JhZGVBZGFwdGVyIGNhbm5vdCBiZSBpbnN0YW50aWF0ZWQgd2l0aG91dCBhbiBOZ01vZHVsZSBvZiB0aGUgQW5ndWxhciBhcHAuJyxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFyIENvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhckpTLlxuICAgKlxuICAgKiBVc2UgYGRvd25ncmFkZU5nMkNvbXBvbmVudGAgdG8gY3JlYXRlIGFuIEFuZ3VsYXJKUyBEaXJlY3RpdmUgRGVmaW5pdGlvbiBGYWN0b3J5IGZyb21cbiAgICogQW5ndWxhciBDb21wb25lbnQuIFRoZSBhZGFwdGVyIHdpbGwgYm9vdHN0cmFwIEFuZ3VsYXIgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZVxuICAgKiBBbmd1bGFySlMgdGVtcGxhdGUuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBNZW50YWwgTW9kZWxcbiAgICpcbiAgICogMS4gVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgYnkgYmVpbmcgbGlzdGVkIGluIEFuZ3VsYXJKUyB0ZW1wbGF0ZS4gVGhpcyBtZWFucyB0aGF0IHRoZVxuICAgKiAgICBob3N0IGVsZW1lbnQgaXMgY29udHJvbGxlZCBieSBBbmd1bGFySlMsIGJ1dCB0aGUgY29tcG9uZW50J3MgdmlldyB3aWxsIGJlIGNvbnRyb2xsZWQgYnlcbiAgICogICAgQW5ndWxhci5cbiAgICogMi4gRXZlbiB0aG91Z2h0IHRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGluIEFuZ3VsYXJKUywgaXQgd2lsbCBiZSB1c2luZyBBbmd1bGFyXG4gICAqICAgIHN5bnRheC4gVGhpcyBoYXMgdG8gYmUgZG9uZSwgdGhpcyB3YXkgYmVjYXVzZSB3ZSBtdXN0IGZvbGxvdyBBbmd1bGFyIGNvbXBvbmVudHMgZG8gbm90XG4gICAqICAgIGRlY2xhcmUgaG93IHRoZSBhdHRyaWJ1dGVzIHNob3VsZCBiZSBpbnRlcnByZXRlZC5cbiAgICogMy4gYG5nLW1vZGVsYCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXJKUyBhbmQgY29tbXVuaWNhdGVzIHdpdGggdGhlIGRvd25ncmFkZWQgQW5ndWxhciBjb21wb25lbnRcbiAgICogICAgYnkgd2F5IG9mIHRoZSBgQ29udHJvbFZhbHVlQWNjZXNzb3JgIGludGVyZmFjZSBmcm9tIEBhbmd1bGFyL2Zvcm1zLiBPbmx5IGNvbXBvbmVudHMgdGhhdFxuICAgKiAgICBpbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgYXJlIGVsaWdpYmxlLlxuICAgKlxuICAgKiAjIyMgU3VwcG9ydGVkIEZlYXR1cmVzXG4gICAqXG4gICAqIC0gQmluZGluZ3M6XG4gICAqICAgLSBBdHRyaWJ1dGU6IGA8Y29tcCBuYW1lPVwiV29ybGRcIj5gXG4gICAqICAgLSBJbnRlcnBvbGF0aW9uOiAgYDxjb21wIGdyZWV0aW5nPVwiSGVsbG8ge3tuYW1lfX0hXCI+YFxuICAgKiAgIC0gRXhwcmVzc2lvbjogIGA8Y29tcCBbbmFtZV09XCJ1c2VybmFtZVwiPmBcbiAgICogICAtIEV2ZW50OiAgYDxjb21wIChjbG9zZSk9XCJkb1NvbWV0aGluZygpXCI+YFxuICAgKiAgIC0gbmctbW9kZWw6IGA8Y29tcCBuZy1tb2RlbD1cIm5hbWVcIj5gXG4gICAqIC0gQ29udGVudCBwcm9qZWN0aW9uOiB5ZXNcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoZm9yd2FyZFJlZigoKSA9PiBNeU5nMk1vZHVsZSkpO1xuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCdncmVldCcsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KEdyZWV0ZXIpKTtcbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gICAqICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8bmctY29udGVudD48L25nLWNvbnRlbnQ+J1xuICAgKiB9KVxuICAgKiBjbGFzcyBHcmVldGVyIHtcbiAgICogICBASW5wdXQoKSBzYWx1dGF0aW9uOiBzdHJpbmc7XG4gICAqICAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuICAgKiB9XG4gICAqXG4gICAqIEBOZ01vZHVsZSh7XG4gICAqICAgZGVjbGFyYXRpb25zOiBbR3JlZXRlcl0sXG4gICAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmcyTW9kdWxlIHt9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID1cbiAgICogICAnbmcxIHRlbXBsYXRlOiA8Z3JlZXQgc2FsdXRhdGlvbj1cIkhlbGxvXCIgW25hbWVdPVwid29ybGRcIj50ZXh0PC9ncmVldD4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMSB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgZG93bmdyYWRlTmcyQ29tcG9uZW50KGNvbXBvbmVudDogVHlwZTxhbnk+KTogRnVuY3Rpb24ge1xuICAgIHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuXG4gICAgcmV0dXJuIGRvd25ncmFkZUNvbXBvbmVudCh7Y29tcG9uZW50fSk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXJKUyBDb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXIuXG4gICAqXG4gICAqIFVzZSBgdXBncmFkZU5nMUNvbXBvbmVudGAgdG8gY3JlYXRlIGFuIEFuZ3VsYXIgY29tcG9uZW50IGZyb20gQW5ndWxhckpTIENvbXBvbmVudFxuICAgKiBkaXJlY3RpdmUuIFRoZSBhZGFwdGVyIHdpbGwgYm9vdHN0cmFwIEFuZ3VsYXJKUyBjb21wb25lbnQgZnJvbSB3aXRoaW4gdGhlIEFuZ3VsYXJcbiAgICogdGVtcGxhdGUuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBNZW50YWwgTW9kZWxcbiAgICpcbiAgICogMS4gVGhlIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgYnkgYmVpbmcgbGlzdGVkIGluIEFuZ3VsYXIgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhciwgYnV0IHRoZSBjb21wb25lbnQncyB2aWV3IHdpbGwgYmUgY29udHJvbGxlZCBieVxuICAgKiAgICBBbmd1bGFySlMuXG4gICAqXG4gICAqICMjIyBTdXBwb3J0ZWQgRmVhdHVyZXNcbiAgICpcbiAgICogLSBCaW5kaW5nczpcbiAgICogICAtIEF0dHJpYnV0ZTogYDxjb21wIG5hbWU9XCJXb3JsZFwiPmBcbiAgICogICAtIEludGVycG9sYXRpb246ICBgPGNvbXAgZ3JlZXRpbmc9XCJIZWxsbyB7e25hbWV9fSFcIj5gXG4gICAqICAgLSBFeHByZXNzaW9uOiAgYDxjb21wIFtuYW1lXT1cInVzZXJuYW1lXCI+YFxuICAgKiAgIC0gRXZlbnQ6ICBgPGNvbXAgKGNsb3NlKT1cImRvU29tZXRoaW5nKClcIj5gXG4gICAqIC0gVHJhbnNjbHVzaW9uOiB5ZXNcbiAgICogLSBPbmx5IHNvbWUgb2YgdGhlIGZlYXR1cmVzIG9mXG4gICAqICAgW0RpcmVjdGl2ZSBEZWZpbml0aW9uIE9iamVjdF0oaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3NlcnZpY2UvJGNvbXBpbGUpIGFyZVxuICAgKiAgIHN1cHBvcnRlZDpcbiAgICogICAtIGBjb21waWxlYDogbm90IHN1cHBvcnRlZCBiZWNhdXNlIHRoZSBob3N0IGVsZW1lbnQgaXMgb3duZWQgYnkgQW5ndWxhciwgd2hpY2ggZG9lc1xuICAgKiAgICAgbm90IGFsbG93IG1vZGlmeWluZyBET00gc3RydWN0dXJlIGR1cmluZyBjb21waWxhdGlvbi5cbiAgICogICAtIGBjb250cm9sbGVyYDogc3VwcG9ydGVkLiAoTk9URTogaW5qZWN0aW9uIG9mIGAkYXR0cnNgIGFuZCBgJHRyYW5zY2x1ZGVgIGlzIG5vdCBzdXBwb3J0ZWQuKVxuICAgKiAgIC0gYGNvbnRyb2xsZXJBc2A6IHN1cHBvcnRlZC5cbiAgICogICAtIGBiaW5kVG9Db250cm9sbGVyYDogc3VwcG9ydGVkLlxuICAgKiAgIC0gYGxpbmtgOiBzdXBwb3J0ZWQuIChOT1RFOiBvbmx5IHByZS1saW5rIGZ1bmN0aW9uIGlzIHN1cHBvcnRlZC4pXG4gICAqICAgLSBgbmFtZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGBwcmlvcml0eWA6IGlnbm9yZWQuXG4gICAqICAgLSBgcmVwbGFjZWA6IG5vdCBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcmVxdWlyZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGByZXN0cmljdGA6IG11c3QgYmUgc2V0IHRvICdFJy5cbiAgICogICAtIGBzY29wZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGB0ZW1wbGF0ZWA6IHN1cHBvcnRlZC5cbiAgICogICAtIGB0ZW1wbGF0ZVVybGA6IHN1cHBvcnRlZC5cbiAgICogICAtIGB0ZXJtaW5hbGA6IGlnbm9yZWQuXG4gICAqICAgLSBgdHJhbnNjbHVkZWA6IHN1cHBvcnRlZC5cbiAgICpcbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoZm9yd2FyZFJlZigoKSA9PiBNeU5nMk1vZHVsZSkpO1xuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCdncmVldCcsIGZ1bmN0aW9uKCkge1xuICAgKiAgIHJldHVybiB7XG4gICAqICAgICBzY29wZToge3NhbHV0YXRpb246ICc9JywgbmFtZTogJz0nIH0sXG4gICAqICAgICB0ZW1wbGF0ZTogJ3t7c2FsdXRhdGlvbn19IHt7bmFtZX19ISAtIDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPidcbiAgICogICB9O1xuICAgKiB9KTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyQ29tcG9uZW50KSk7XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbmcyJyxcbiAgICogICB0ZW1wbGF0ZTogJ25nMiB0ZW1wbGF0ZTogPGdyZWV0IHNhbHV0YXRpb249XCJIZWxsb1wiIFtuYW1lXT1cIndvcmxkXCI+dGV4dDwvZ3JlZXQ+J1xuICAgKiB9KVxuICAgKiBjbGFzcyBOZzJDb21wb25lbnQge1xuICAgKiB9XG4gICAqXG4gICAqIEBOZ01vZHVsZSh7XG4gICAqICAgZGVjbGFyYXRpb25zOiBbTmcyQ29tcG9uZW50LCBhZGFwdGVyLnVwZ3JhZGVOZzFDb21wb25lbnQoJ2dyZWV0JyldLFxuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyPjwvbmcyPic7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFwibmcyIHRlbXBsYXRlOiBIZWxsbyB3b3JsZCEgLSB0ZXh0XCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICB1cGdyYWRlTmcxQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFR5cGU8YW55PiB7XG4gICAgaWYgKHRoaXMubmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZC5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMubmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZFtuYW1lXS50eXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gKHRoaXMubmcxQ29tcG9uZW50c1RvQmVVcGdyYWRlZFtuYW1lXSA9IG5ldyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIobmFtZSkpXG4gICAgICAgIC50eXBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWdpc3RlcnMgdGhlIGFkYXB0ZXIncyBBbmd1bGFySlMgdXBncmFkZSBtb2R1bGUgZm9yIHVuaXQgdGVzdGluZyBpbiBBbmd1bGFySlMuXG4gICAqIFVzZSB0aGlzIGluc3RlYWQgb2YgYGFuZ3VsYXIubW9jay5tb2R1bGUoKWAgdG8gbG9hZCB0aGUgdXBncmFkZSBtb2R1bGUgaW50b1xuICAgKiB0aGUgQW5ndWxhckpTIHRlc3RpbmcgaW5qZWN0b3IuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCB1cGdyYWRlQWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqXG4gICAqIC8vIGNvbmZpZ3VyZSB0aGUgYWRhcHRlciB3aXRoIHVwZ3JhZGUvZG93bmdyYWRlIGNvbXBvbmVudHMgYW5kIHNlcnZpY2VzXG4gICAqIHVwZ3JhZGVBZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChNeUNvbXBvbmVudCk7XG4gICAqXG4gICAqIGxldCB1cGdyYWRlQWRhcHRlclJlZjogVXBncmFkZUFkYXB0ZXJSZWY7XG4gICAqIGxldCAkY29tcGlsZSwgJHJvb3RTY29wZTtcbiAgICpcbiAgICogLy8gV2UgbXVzdCByZWdpc3RlciB0aGUgYWRhcHRlciBiZWZvcmUgYW55IGNhbGxzIHRvIGBpbmplY3QoKWBcbiAgICogYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAqICAgdXBncmFkZUFkYXB0ZXJSZWYgPSB1cGdyYWRlQWRhcHRlci5yZWdpc3RlckZvck5nMVRlc3RzKFsnaGVyb0FwcCddKTtcbiAgICogfSk7XG4gICAqXG4gICAqIGJlZm9yZUVhY2goaW5qZWN0KChfJGNvbXBpbGVfLCBfJHJvb3RTY29wZV8pID0+IHtcbiAgICogICAkY29tcGlsZSA9IF8kY29tcGlsZV87XG4gICAqICAgJHJvb3RTY29wZSA9IF8kcm9vdFNjb3BlXztcbiAgICogfSkpO1xuICAgKlxuICAgKiBpdChcInNheXMgaGVsbG9cIiwgKGRvbmUpID0+IHtcbiAgICogICB1cGdyYWRlQWRhcHRlclJlZi5yZWFkeSgoKSA9PiB7XG4gICAqICAgICBjb25zdCBlbGVtZW50ID0gJGNvbXBpbGUoXCI8bXktY29tcG9uZW50PjwvbXktY29tcG9uZW50PlwiKSgkcm9vdFNjb3BlKTtcbiAgICogICAgICRyb290U2NvcGUuJGFwcGx5KCk7XG4gICAqICAgICBleHBlY3QoZWxlbWVudC5odG1sKCkpLnRvQ29udGFpbihcIkhlbGxvIFdvcmxkXCIpO1xuICAgKiAgICAgZG9uZSgpO1xuICAgKiAgIH0pXG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZXMgYW55IEFuZ3VsYXJKUyBtb2R1bGVzIHRoYXQgdGhlIHVwZ3JhZGUgbW9kdWxlIHNob3VsZCBkZXBlbmQgdXBvblxuICAgKiBAcmV0dXJucyBhbiBgVXBncmFkZUFkYXB0ZXJSZWZgLCB3aGljaCBsZXRzIHlvdSByZWdpc3RlciBhIGByZWFkeSgpYCBjYWxsYmFjayB0b1xuICAgKiBydW4gYXNzZXJ0aW9ucyBvbmNlIHRoZSBBbmd1bGFyIGNvbXBvbmVudHMgYXJlIHJlYWR5IHRvIHRlc3QgdGhyb3VnaCBBbmd1bGFySlMuXG4gICAqL1xuICByZWdpc3RlckZvck5nMVRlc3RzKG1vZHVsZXM/OiBzdHJpbmdbXSk6IFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgICBjb25zdCB3aW5kb3dOZ01vY2sgPSAod2luZG93IGFzIGFueSlbJ2FuZ3VsYXInXS5tb2NrO1xuICAgIGlmICghd2luZG93TmdNb2NrIHx8ICF3aW5kb3dOZ01vY2subW9kdWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmluZCAnYW5ndWxhci5tb2NrLm1vZHVsZScuXCIpO1xuICAgIH1cbiAgICBjb25zdCB7bmcxTW9kdWxlLCBuZzJCb290c3RyYXBEZWZlcnJlZH0gPSB0aGlzLmRlY2xhcmVOZzFNb2R1bGUobW9kdWxlcyk7XG4gICAgd2luZG93TmdNb2NrLm1vZHVsZShuZzFNb2R1bGUubmFtZSk7XG4gICAgY29uc3QgdXBncmFkZSA9IG5ldyBVcGdyYWRlQWRhcHRlclJlZigpO1xuICAgIG5nMkJvb3RzdHJhcERlZmVycmVkLnByb21pc2UudGhlbigobmcxSW5qZWN0b3IpID0+IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIHVwZ3JhZGUuX2Jvb3RzdHJhcERvbmUodGhpcy5tb2R1bGVSZWYhLCBuZzFJbmplY3Rvcik7XG4gICAgfSwgb25FcnJvcik7XG4gICAgcmV0dXJuIHVwZ3JhZGU7XG4gIH1cblxuICAvKipcbiAgICogQm9vdHN0cmFwIGEgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXIgYXBwbGljYXRpb24uXG4gICAqXG4gICAqIFRoaXMgYGJvb3RzdHJhcGAgbWV0aG9kIGlzIGEgZGlyZWN0IHJlcGxhY2VtZW50ICh0YWtlcyBzYW1lIGFyZ3VtZW50cykgZm9yIEFuZ3VsYXJKU1xuICAgKiBbYGJvb3RzdHJhcGBdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9mdW5jdGlvbi9hbmd1bGFyLmJvb3RzdHJhcCkgbWV0aG9kLiBVbmxpa2VcbiAgICogQW5ndWxhckpTLCB0aGlzIGJvb3RzdHJhcCBpcyBhc3luY2hyb25vdXMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcyJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyKSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMScsIGZ1bmN0aW9uKCkge1xuICAgKiAgIHJldHVybiB7XG4gICAqICAgICAgc2NvcGU6IHsgdGl0bGU6ICc9JyB9LFxuICAgKiAgICAgIHRlbXBsYXRlOiAnbmcxW0hlbGxvIHt7dGl0bGV9fSFdKDxzcGFuIG5nLXRyYW5zY2x1ZGU+PC9zcGFuPiknXG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbmcyJyxcbiAgICogICBpbnB1dHM6IFsnbmFtZSddLFxuICAgKiAgIHRlbXBsYXRlOiAnbmcyWzxuZzEgW3RpdGxlXT1cIm5hbWVcIj50cmFuc2NsdWRlPC9uZzE+XSg8bmctY29udGVudD48L25nLWNvbnRlbnQ+KSdcbiAgICogfSlcbiAgICogY2xhc3MgTmcyIHtcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW05nMiwgYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCduZzEnKV0sXG4gICAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdXG4gICAqIH0pXG4gICAqIGNsYXNzIE15TmcyTW9kdWxlIHt9XG4gICAqXG4gICAqIGRvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0gJzxuZzIgbmFtZT1cIldvcmxkXCI+cHJvamVjdDwvbmcyPic7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFxuICAgKiAgICAgICBcIm5nMltuZzFbSGVsbG8gV29ybGQhXSh0cmFuc2NsdWRlKV0ocHJvamVjdClcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGJvb3RzdHJhcChcbiAgICBlbGVtZW50OiBFbGVtZW50LFxuICAgIG1vZHVsZXM/OiBhbnlbXSxcbiAgICBjb25maWc/OiBJQW5ndWxhckJvb3RzdHJhcENvbmZpZyxcbiAgKTogVXBncmFkZUFkYXB0ZXJSZWYge1xuICAgIGNvbnN0IHtuZzFNb2R1bGUsIG5nMkJvb3RzdHJhcERlZmVycmVkLCBuZ1pvbmV9ID0gdGhpcy5kZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXMpO1xuXG4gICAgY29uc3QgdXBncmFkZSA9IG5ldyBVcGdyYWRlQWRhcHRlclJlZigpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHJlc3VtZUJvb3RzdHJhcCgpIG9ubHkgZXhpc3RzIGlmIHRoZSBjdXJyZW50IGJvb3RzdHJhcCBpcyBkZWZlcnJlZFxuICAgIGNvbnN0IHdpbmRvd0FuZ3VsYXIgPSAod2luZG93IGFzIGFueSlbJ2FuZ3VsYXInXTtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIG5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgYm9vdHN0cmFwKGVsZW1lbnQsIFtuZzFNb2R1bGUubmFtZV0sIGNvbmZpZyEpO1xuICAgIH0pO1xuICAgIGNvbnN0IG5nMUJvb3RzdHJhcFByb21pc2UgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsUmVzdW1lQm9vdHN0cmFwOiAoKSA9PiB2b2lkID0gd2luZG93QW5ndWxhci5yZXN1bWVCb290c3RyYXA7XG4gICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gb3JpZ2luYWxSZXN1bWVCb290c3RyYXA7XG4gICAgICAgICAgY29uc3QgciA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgUHJvbWlzZS5hbGwoW25nMkJvb3RzdHJhcERlZmVycmVkLnByb21pc2UsIG5nMUJvb3RzdHJhcFByb21pc2VdKS50aGVuKChbbmcxSW5qZWN0b3JdKSA9PiB7XG4gICAgICBhbmd1bGFyRWxlbWVudChlbGVtZW50KS5kYXRhIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIHRoaXMubW9kdWxlUmVmIS5pbmplY3Rvcik7XG4gICAgICB0aGlzLm1vZHVsZVJlZiEuaW5qZWN0b3IuZ2V0PE5nWm9uZT4oTmdab25lKS5ydW4oKCkgPT4ge1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIHVwZ3JhZGUuX2Jvb3RzdHJhcERvbmUodGhpcy5tb2R1bGVSZWYsIG5nMUluamVjdG9yKTtcbiAgICAgIH0pO1xuICAgIH0sIG9uRXJyb3IpO1xuICAgIHJldHVybiB1cGdyYWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgc2VydmljZSB0byBiZSBhY2Nlc3NpYmxlIGZyb20gQW5ndWxhci5cbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIExvZ2luIHsgLi4uIH1cbiAgICogY2xhc3MgU2VydmVyIHsgLi4uIH1cbiAgICpcbiAgICogQEluamVjdGFibGUoKVxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogICBjb25zdHJ1Y3RvcihASW5qZWN0KCdzZXJ2ZXInKSBzZXJ2ZXIsIGxvZ2luOiBMb2dpbikge1xuICAgKiAgICAgLi4uXG4gICAqICAgfVxuICAgKiB9XG4gICAqXG4gICAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5zZXJ2aWNlKCdzZXJ2ZXInLCBTZXJ2ZXIpO1xuICAgKiBtb2R1bGUuc2VydmljZSgnbG9naW4nLCBMb2dpbik7XG4gICAqXG4gICAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKiBhZGFwdGVyLnVwZ3JhZGVOZzFQcm92aWRlcignc2VydmVyJyk7XG4gICAqIGFkYXB0ZXIudXBncmFkZU5nMVByb3ZpZGVyKCdsb2dpbicsIHthc1Rva2VuOiBMb2dpbn0pO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeSgocmVmKSA9PiB7XG4gICAqICAgY29uc3QgZXhhbXBsZTogRXhhbXBsZSA9IHJlZi5uZzJJbmplY3Rvci5nZXQoRXhhbXBsZSk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIHVwZ3JhZGVOZzFQcm92aWRlcihuYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiB7YXNUb2tlbjogYW55fSkge1xuICAgIGNvbnN0IHRva2VuID0gKG9wdGlvbnMgJiYgb3B0aW9ucy5hc1Rva2VuKSB8fCBuYW1lO1xuICAgIHRoaXMudXBncmFkZWRQcm92aWRlcnMucHVzaCh7XG4gICAgICBwcm92aWRlOiB0b2tlbixcbiAgICAgIHVzZUZhY3Rvcnk6ICgkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UpID0+ICRpbmplY3Rvci5nZXQobmFtZSksXG4gICAgICBkZXBzOiBbJElOSkVDVE9SXSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciBzZXJ2aWNlIHRvIGJlIGFjY2Vzc2libGUgZnJvbSBBbmd1bGFySlMuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBFeGFtcGxlIHtcbiAgICogfVxuICAgKlxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICpcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmZhY3RvcnkoJ2V4YW1wbGUnLCBhZGFwdGVyLmRvd25ncmFkZU5nMlByb3ZpZGVyKEV4YW1wbGUpKTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIGNvbnN0IGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcxSW5qZWN0b3IuZ2V0KCdleGFtcGxlJyk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIGRvd25ncmFkZU5nMlByb3ZpZGVyKHRva2VuOiBhbnkpOiBGdW5jdGlvbiB7XG4gICAgcmV0dXJuIGRvd25ncmFkZUluamVjdGFibGUodG9rZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY2xhcmUgdGhlIEFuZ3VsYXJKUyB1cGdyYWRlIG1vZHVsZSBmb3IgdGhpcyBhZGFwdGVyIHdpdGhvdXQgYm9vdHN0cmFwcGluZyB0aGUgd2hvbGVcbiAgICogaHlicmlkIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCBpcyBhdXRvbWF0aWNhbGx5IGNhbGxlZCBieSBgYm9vdHN0cmFwKClgIGFuZCBgcmVnaXN0ZXJGb3JOZzFUZXN0cygpYC5cbiAgICpcbiAgICogQHBhcmFtIG1vZHVsZXMgVGhlIEFuZ3VsYXJKUyBtb2R1bGVzIHRoYXQgdGhpcyB1cGdyYWRlIG1vZHVsZSBzaG91bGQgZGVwZW5kIHVwb24uXG4gICAqIEByZXR1cm5zIFRoZSBBbmd1bGFySlMgdXBncmFkZSBtb2R1bGUgdGhhdCBpcyBkZWNsYXJlZCBieSB0aGlzIG1ldGhvZFxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgdXBncmFkZUFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKiB1cGdyYWRlQWRhcHRlci5kZWNsYXJlTmcxTW9kdWxlKFsnaGVyb0FwcCddKTtcbiAgICogYGBgXG4gICAqL1xuICBwcml2YXRlIGRlY2xhcmVOZzFNb2R1bGUobW9kdWxlczogc3RyaW5nW10gPSBbXSk6IHtcbiAgICBuZzFNb2R1bGU6IElNb2R1bGU7XG4gICAgbmcyQm9vdHN0cmFwRGVmZXJyZWQ6IERlZmVycmVkPElJbmplY3RvclNlcnZpY2U+O1xuICAgIG5nWm9uZTogTmdab25lO1xuICB9IHtcbiAgICBjb25zdCBkZWxheUFwcGx5RXhwczogRnVuY3Rpb25bXSA9IFtdO1xuICAgIGxldCBvcmlnaW5hbCRhcHBseUZuOiBGdW5jdGlvbjtcbiAgICBsZXQgcm9vdFNjb3BlUHJvdG90eXBlOiBhbnk7XG4gICAgY29uc3QgdXBncmFkZUFkYXB0ZXIgPSB0aGlzO1xuICAgIGNvbnN0IG5nMU1vZHVsZSA9IGFuZ3VsYXJNb2R1bGUodGhpcy5pZFByZWZpeCwgbW9kdWxlcyk7XG4gICAgY29uc3QgcGxhdGZvcm1SZWYgPSBwbGF0Zm9ybUJyb3dzZXJEeW5hbWljKCk7XG5cbiAgICBjb25zdCBuZ1pvbmUgPSBuZXcgTmdab25lKHtcbiAgICAgIGVuYWJsZUxvbmdTdGFja1RyYWNlOiBab25lLmhhc093blByb3BlcnR5KCdsb25nU3RhY2tUcmFjZVpvbmVTcGVjJyksXG4gICAgfSk7XG4gICAgY29uc3QgbmcyQm9vdHN0cmFwRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQ8SUluamVjdG9yU2VydmljZT4oKTtcbiAgICBuZzFNb2R1bGVcbiAgICAgIC5jb25zdGFudChVUEdSQURFX0FQUF9UWVBFX0tFWSwgVXBncmFkZUFwcFR5cGUuRHluYW1pYylcbiAgICAgIC5mYWN0b3J5KElOSkVDVE9SX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYhLmluamVjdG9yLmdldChJbmplY3RvcikpXG4gICAgICAuZmFjdG9yeShMQVpZX01PRFVMRV9SRUYsIFtcbiAgICAgICAgSU5KRUNUT1JfS0VZLFxuICAgICAgICAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiAoe2luamVjdG9yfSkgYXMgTGF6eU1vZHVsZVJlZixcbiAgICAgIF0pXG4gICAgICAuY29uc3RhbnQoTkdfWk9ORV9LRVksIG5nWm9uZSlcbiAgICAgIC5mYWN0b3J5KENPTVBJTEVSX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYhLmluamVjdG9yLmdldChDb21waWxlcikpXG4gICAgICAuY29uZmlnKFtcbiAgICAgICAgJyRwcm92aWRlJyxcbiAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgIChwcm92aWRlOiBJUHJvdmlkZVNlcnZpY2UsIG5nMUluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgcHJvdmlkZS5kZWNvcmF0b3IoJFJPT1RfU0NPUEUsIFtcbiAgICAgICAgICAgICckZGVsZWdhdGUnLFxuICAgICAgICAgICAgZnVuY3Rpb24gKHJvb3RTY29wZURlbGVnYXRlOiBJUm9vdFNjb3BlU2VydmljZSkge1xuICAgICAgICAgICAgICAvLyBDYXB0dXJlIHRoZSByb290IGFwcGx5IHNvIHRoYXQgd2UgY2FuIGRlbGF5IGZpcnN0IGNhbGwgdG8gJGFwcGx5IHVudGlsIHdlXG4gICAgICAgICAgICAgIC8vIGJvb3RzdHJhcCBBbmd1bGFyIGFuZCB0aGVuIHdlIHJlcGxheSBhbmQgcmVzdG9yZSB0aGUgJGFwcGx5LlxuICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSByb290U2NvcGVEZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgICAgICAgICAgIGlmIChyb290U2NvcGVQcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJyRhcHBseScpKSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWwkYXBwbHlGbiA9IHJvb3RTY29wZVByb3RvdHlwZS4kYXBwbHk7XG4gICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IChleHA6IGFueSkgPT4gZGVsYXlBcHBseUV4cHMucHVzaChleHApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBmaW5kICckYXBwbHknIG9uICckcm9vdFNjb3BlJyFcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJvb3RTY29wZURlbGVnYXRlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdKTtcbiAgICAgICAgICBpZiAobmcxSW5qZWN0b3IuaGFzKCQkVEVTVEFCSUxJVFkpKSB7XG4gICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcigkJFRFU1RBQklMSVRZLCBbXG4gICAgICAgICAgICAgICckZGVsZWdhdGUnLFxuICAgICAgICAgICAgICBmdW5jdGlvbiAodGVzdGFiaWxpdHlEZWxlZ2F0ZTogSVRlc3RhYmlsaXR5U2VydmljZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsV2hlblN0YWJsZTogRnVuY3Rpb24gPSB0ZXN0YWJpbGl0eURlbGVnYXRlLndoZW5TdGFibGU7XG4gICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdXaGVuU3RhYmxlID0gZnVuY3Rpb24gKHRoaXM6IHVua25vd24sIGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgICAgICAgICAgICAgICAgb3JpZ2luYWxXaGVuU3RhYmxlLmNhbGwodGhpcywgZnVuY3Rpb24gKHRoaXM6IHVua25vd24pIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmcyVGVzdGFiaWxpdHk6IFRlc3RhYmlsaXR5ID1cbiAgICAgICAgICAgICAgICAgICAgICB1cGdyYWRlQWRhcHRlci5tb2R1bGVSZWYhLmluamVjdG9yLmdldChUZXN0YWJpbGl0eSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZzJUZXN0YWJpbGl0eS5pc1N0YWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBuZzJUZXN0YWJpbGl0eS53aGVuU3RhYmxlKG5ld1doZW5TdGFibGUuYmluZCh0aGlzLCBjYWxsYmFjaykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGVzdGFiaWxpdHlEZWxlZ2F0ZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIF0pO1xuXG4gICAgbmcxTW9kdWxlLnJ1bihbXG4gICAgICAnJGluamVjdG9yJyxcbiAgICAgICckcm9vdFNjb3BlJyxcbiAgICAgIChuZzFJbmplY3RvcjogSUluamVjdG9yU2VydmljZSwgcm9vdFNjb3BlOiBJUm9vdFNjb3BlU2VydmljZSkgPT4ge1xuICAgICAgICBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIucmVzb2x2ZSh0aGlzLm5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWQsIG5nMUluamVjdG9yKVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgd2UgaGF2ZSBuZzEgaW5qZWN0b3IgYW5kIHdlIGhhdmUgcHJlcGFyZWRcbiAgICAgICAgICAgIC8vIG5nMSBjb21wb25lbnRzIHRvIGJlIHVwZ3JhZGVkLCB3ZSBub3cgY2FuIGJvb3RzdHJhcCBuZzIuXG4gICAgICAgICAgICBATmdNb2R1bGUoe1xuICAgICAgICAgICAgICBqaXQ6IHRydWUsXG4gICAgICAgICAgICAgIHByb3ZpZGVyczogW1xuICAgICAgICAgICAgICAgIHtwcm92aWRlOiAkSU5KRUNUT1IsIHVzZUZhY3Rvcnk6ICgpID0+IG5nMUluamVjdG9yfSxcbiAgICAgICAgICAgICAgICB7cHJvdmlkZTogJENPTVBJTEUsIHVzZUZhY3Rvcnk6ICgpID0+IG5nMUluamVjdG9yLmdldCgkQ09NUElMRSl9LFxuICAgICAgICAgICAgICAgIHRoaXMudXBncmFkZWRQcm92aWRlcnMsXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIGltcG9ydHM6IFtyZXNvbHZlRm9yd2FyZFJlZih0aGlzLm5nMkFwcE1vZHVsZSldLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGNsYXNzIER5bmFtaWNOZ1VwZ3JhZGVNb2R1bGUge1xuICAgICAgICAgICAgICBuZ0RvQm9vdHN0cmFwKCkge31cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXRmb3JtUmVmXG4gICAgICAgICAgICAgIC5ib290c3RyYXBNb2R1bGUoRHluYW1pY05nVXBncmFkZU1vZHVsZSwgW3RoaXMuY29tcGlsZXJPcHRpb25zISwge25nWm9uZX1dKVxuICAgICAgICAgICAgICAudGhlbigocmVmOiBOZ01vZHVsZVJlZjxhbnk+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVSZWYgPSByZWY7XG4gICAgICAgICAgICAgICAgbmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAocm9vdFNjb3BlUHJvdG90eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZS4kYXBwbHkgPSBvcmlnaW5hbCRhcHBseUZuOyAvLyByZXN0b3JlIG9yaWdpbmFsICRhcHBseVxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoZGVsYXlBcHBseUV4cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlLiRhcHBseShkZWxheUFwcGx5RXhwcy5zaGlmdCgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAudGhlbigoKSA9PiBuZzJCb290c3RyYXBEZWZlcnJlZC5yZXNvbHZlKG5nMUluamVjdG9yKSwgb25FcnJvcilcbiAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBzdWJzY3JpcHRpb24gPSBuZ1pvbmUub25NaWNyb3Rhc2tFbXB0eS5zdWJzY3JpYmUoe1xuICAgICAgICAgICAgICAgICAgbmV4dDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocm9vdFNjb3BlLiQkcGhhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdBIGRpZ2VzdCB3YXMgdHJpZ2dlcmVkIHdoaWxlIG9uZSB3YXMgYWxyZWFkeSBpbiBwcm9ncmVzcy4gVGhpcyBtYXkgbWVhbiB0aGF0IHNvbWV0aGluZyBpcyB0cmlnZ2VyaW5nIGRpZ2VzdHMgb3V0c2lkZSB0aGUgQW5ndWxhciB6b25lLicsXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByb290U2NvcGUuJGV2YWxBc3luYygoKSA9PiB7fSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcm9vdFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIERlc3Ryb3kgdGhlIEFuZ3VsYXJKUyBhcHAgb25jZSB0aGUgQW5ndWxhciBgUGxhdGZvcm1SZWZgIGlzIGRlc3Ryb3llZC5cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGRvZXMgbm90IGhhcHBlbiBpbiBhIHR5cGljYWwgU1BBIHNjZW5hcmlvLCBidXQgaXQgbWlnaHQgYmUgdXNlZnVsIGZvclxuICAgICAgICAgICAgICAgIC8vIG90aGVyIHVzZS1jYXNlcyB3aGVyZSBkaXNwb3Npbmcgb2YgYW4gQW5ndWxhci9Bbmd1bGFySlMgYXBwIGlzIG5lY2Vzc2FyeVxuICAgICAgICAgICAgICAgIC8vIChzdWNoIGFzIEhvdCBNb2R1bGUgUmVwbGFjZW1lbnQgKEhNUikpLlxuICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2lzc3Vlcy8zOTkzNS5cbiAgICAgICAgICAgICAgICBwbGF0Zm9ybVJlZi5vbkRlc3Ryb3koKCkgPT4gZGVzdHJveUFwcChuZzFJbmplY3RvcikpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaCgoZSkgPT4gbmcyQm9vdHN0cmFwRGVmZXJyZWQucmVqZWN0KGUpKTtcbiAgICAgIH0sXG4gICAgXSk7XG5cbiAgICByZXR1cm4ge25nMU1vZHVsZSwgbmcyQm9vdHN0cmFwRGVmZXJyZWQsIG5nWm9uZX07XG4gIH1cbn1cblxuLyoqXG4gKiBVc2UgYFVwZ3JhZGVBZGFwdGVyUmVmYCB0byBjb250cm9sIGEgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXIgYXBwbGljYXRpb24uXG4gKlxuICogQGRlcHJlY2F0ZWQgRGVwcmVjYXRlZCBzaW5jZSB2NS4gVXNlIGB1cGdyYWRlL3N0YXRpY2AgaW5zdGVhZCwgd2hpY2ggYWxzbyBzdXBwb3J0c1xuICogW0FoZWFkLW9mLVRpbWUgY29tcGlsYXRpb25dKHRvb2xzL2NsaS9hb3QtY29tcGlsZXIpLlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgVXBncmFkZUFkYXB0ZXJSZWYge1xuICAvKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfcmVhZHlGbjogKCh1cGdyYWRlQWRhcHRlclJlZjogVXBncmFkZUFkYXB0ZXJSZWYpID0+IHZvaWQpIHwgbnVsbCA9IG51bGw7XG5cbiAgcHVibGljIG5nMVJvb3RTY29wZTogSVJvb3RTY29wZVNlcnZpY2UgPSBudWxsITtcbiAgcHVibGljIG5nMUluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlID0gbnVsbCE7XG4gIHB1YmxpYyBuZzJNb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT4gPSBudWxsITtcbiAgcHVibGljIG5nMkluamVjdG9yOiBJbmplY3RvciA9IG51bGwhO1xuXG4gIC8qIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9ib290c3RyYXBEb25lKG5nTW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+LCBuZzFJbmplY3RvcjogSUluamVjdG9yU2VydmljZSkge1xuICAgIHRoaXMubmcyTW9kdWxlUmVmID0gbmdNb2R1bGVSZWY7XG4gICAgdGhpcy5uZzJJbmplY3RvciA9IG5nTW9kdWxlUmVmLmluamVjdG9yO1xuICAgIHRoaXMubmcxSW5qZWN0b3IgPSBuZzFJbmplY3RvcjtcbiAgICB0aGlzLm5nMVJvb3RTY29wZSA9IG5nMUluamVjdG9yLmdldCgkUk9PVF9TQ09QRSk7XG4gICAgdGhpcy5fcmVhZHlGbiAmJiB0aGlzLl9yZWFkeUZuKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hpY2ggaXMgbm90aWZpZWQgdXBvbiBzdWNjZXNzZnVsIGh5YnJpZCBBbmd1bGFySlMgLyBBbmd1bGFyXG4gICAqIGFwcGxpY2F0aW9uIGhhcyBiZWVuIGJvb3RzdHJhcHBlZC5cbiAgICpcbiAgICogVGhlIGByZWFkeWAgY2FsbGJhY2sgZnVuY3Rpb24gaXMgaW52b2tlZCBpbnNpZGUgdGhlIEFuZ3VsYXIgem9uZSwgdGhlcmVmb3JlIGl0IGRvZXMgbm90XG4gICAqIHJlcXVpcmUgYSBjYWxsIHRvIGAkYXBwbHkoKWAuXG4gICAqL1xuICBwdWJsaWMgcmVhZHkoZm46ICh1cGdyYWRlQWRhcHRlclJlZjogVXBncmFkZUFkYXB0ZXJSZWYpID0+IHZvaWQpIHtcbiAgICB0aGlzLl9yZWFkeUZuID0gZm47XG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZSBvZiBydW5uaW5nIGh5YnJpZCBBbmd1bGFySlMgLyBBbmd1bGFyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgcHVibGljIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5uZzFJbmplY3RvciEuZ2V0KCRST09UX1NDT1BFKS4kZGVzdHJveSgpO1xuICAgIHRoaXMubmcyTW9kdWxlUmVmIS5kZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==