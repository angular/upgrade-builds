/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Compiler, Injector, isDevMode, NgModule, NgZone, resolveForwardRef, Testability } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { bootstrap, element as angularElement, module_ as angularModule } from '../../common/src/angular1';
import { $$TESTABILITY, $COMPILE, $INJECTOR, $ROOT_SCOPE, COMPILER_KEY, INJECTOR_KEY, LAZY_MODULE_REF, NG_ZONE_KEY, UPGRADE_APP_TYPE_KEY } from '../../common/src/constants';
import { downgradeComponent } from '../../common/src/downgrade_component';
import { downgradeInjectable } from '../../common/src/downgrade_injectable';
import { controllerKey, Deferred, onError } from '../../common/src/util';
import { UpgradeNg1ComponentAdapterBuilder } from './upgrade_ng1_adapter';
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
            throw new Error('Failed to find \'angular.mock.module\'.');
        }
        this.declareNg1Module(modules);
        windowNgMock.module(this.ng1Module.name);
        const upgrade = new UpgradeAdapterRef();
        this.ng2BootstrapDeferred.promise.then((ng1Injector) => {
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
        this.declareNg1Module(modules);
        const upgrade = new UpgradeAdapterRef();
        // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
        const windowAngular = window /** TODO #???? */['angular'];
        windowAngular.resumeBootstrap = undefined;
        this.ngZone.run(() => {
            bootstrap(element, [this.ng1Module.name], config);
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
        Promise.all([this.ng2BootstrapDeferred.promise, ng1BootstrapPromise]).then(([ng1Injector]) => {
            angularElement(element).data(controllerKey(INJECTOR_KEY), this.moduleRef.injector);
            this.moduleRef.injector.get(NgZone).run(() => {
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
        let rootScope;
        const upgradeAdapter = this;
        const ng1Module = this.ng1Module = angularModule(this.idPrefix, modules);
        const platformRef = platformBrowserDynamic();
        this.ngZone = new NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
        this.ng2BootstrapDeferred = new Deferred();
        ng1Module.constant(UPGRADE_APP_TYPE_KEY, 1 /* Dynamic */)
            .factory(INJECTOR_KEY, () => this.moduleRef.injector.get(Injector))
            .factory(LAZY_MODULE_REF, [INJECTOR_KEY, (injector) => ({ injector })])
            .constant(NG_ZONE_KEY, this.ngZone)
            .factory(COMPILER_KEY, () => this.moduleRef.injector.get(Compiler))
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
                    let DynamicNgUpgradeModule = class DynamicNgUpgradeModule {
                        constructor() { }
                        ngDoBootstrap() { }
                    };
                    DynamicNgUpgradeModule = __decorate([
                        NgModule(Object.assign({ jit: true }, ngModule)),
                        __metadata("design:paramtypes", [])
                    ], DynamicNgUpgradeModule);
                    platformRef
                        .bootstrapModule(DynamicNgUpgradeModule, [this.compilerOptions, { ngZone: this.ngZone }])
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
                        rootScope.$on('$destroy', () => {
                            subscription.unsubscribe();
                        });
                    });
                })
                    .catch((e) => this.ng2BootstrapDeferred.reject(e));
            }
        ]);
        return ng1Module;
    }
}
/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of AngularJS's $compile.
 */
class ParentInjectorPromise {
    constructor(element) {
        this.element = element;
        this.callbacks = [];
        // store the promise on the element
        element.data(controllerKey(INJECTOR_KEY), this);
    }
    then(callback) {
        if (this.injector) {
            callback(this.injector);
        }
        else {
            this.callbacks.push(callback);
        }
    }
    resolve(injector) {
        this.injector = injector;
        // reset the element data to point to the real injector
        this.element.data(controllerKey(INJECTOR_KEY), injector);
        // clean out the element to prevent memory leaks
        this.element = null;
        // run all the queued callbacks
        this.callbacks.forEach((callback) => callback(injector));
        this.callbacks.length = 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvZHluYW1pYy9zcmMvdXBncmFkZV9hZGFwdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsUUFBUSxFQUFtQixRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBZSxNQUFNLEVBQUUsaUJBQWlCLEVBQWtCLFdBQVcsRUFBTyxNQUFNLGVBQWUsQ0FBQztBQUNsSyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUV6RSxPQUFPLEVBQUMsU0FBUyxFQUFFLE9BQU8sSUFBSSxjQUFjLEVBQWlJLE9BQU8sSUFBSSxhQUFhLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUN4TyxPQUFPLEVBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzNLLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLHNDQUFzQyxDQUFDO0FBQ3hFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHVDQUF1QyxDQUFDO0FBQzFFLE9BQU8sRUFBQyxhQUFhLEVBQUUsUUFBUSxFQUFpQixPQUFPLEVBQWlCLE1BQU0sdUJBQXVCLENBQUM7QUFFdEcsT0FBTyxFQUFDLGlDQUFpQyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFeEUsSUFBSSxZQUFZLEdBQVcsQ0FBQyxDQUFDO0FBRTdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpRkc7QUFDSCxNQUFNLE9BQU8sY0FBYztJQXFCekIsWUFBb0Is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QUE2QjtRQUNqRixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUNoQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDeEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksS0FBSyxDQUFDLEVBQWtEO1FBQzdELElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU87UUFDWixJQUFJLENBQUMsV0FBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QyxJQUFJLENBQUMsWUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQy9CLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbXBpbGVyLCBDb21waWxlck9wdGlvbnMsIEluamVjdG9yLCBpc0Rldk1vZGUsIE5nTW9kdWxlLCBOZ01vZHVsZVJlZiwgTmdab25lLCByZXNvbHZlRm9yd2FyZFJlZiwgU3RhdGljUHJvdmlkZXIsIFRlc3RhYmlsaXR5LCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7cGxhdGZvcm1Ccm93c2VyRHluYW1pY30gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci1keW5hbWljJztcblxuaW1wb3J0IHtib290c3RyYXAsIGVsZW1lbnQgYXMgYW5ndWxhckVsZW1lbnQsIElBbmd1bGFyQm9vdHN0cmFwQ29uZmlnLCBJQXVnbWVudGVkSlF1ZXJ5LCBJSW5qZWN0b3JTZXJ2aWNlLCBJTW9kdWxlLCBJUHJvdmlkZVNlcnZpY2UsIElSb290U2NvcGVTZXJ2aWNlLCBJVGVzdGFiaWxpdHlTZXJ2aWNlLCBtb2R1bGVfIGFzIGFuZ3VsYXJNb2R1bGV9IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvYW5ndWxhcjEnO1xuaW1wb3J0IHskJFRFU1RBQklMSVRZLCAkQ09NUElMRSwgJElOSkVDVE9SLCAkUk9PVF9TQ09QRSwgQ09NUElMRVJfS0VZLCBJTkpFQ1RPUl9LRVksIExBWllfTU9EVUxFX1JFRiwgTkdfWk9ORV9LRVksIFVQR1JBREVfQVBQX1RZUEVfS0VZfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2NvbnN0YW50cyc7XG5pbXBvcnQge2Rvd25ncmFkZUNvbXBvbmVudH0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9kb3duZ3JhZGVfY29tcG9uZW50JztcbmltcG9ydCB7ZG93bmdyYWRlSW5qZWN0YWJsZX0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9kb3duZ3JhZGVfaW5qZWN0YWJsZSc7XG5pbXBvcnQge2NvbnRyb2xsZXJLZXksIERlZmVycmVkLCBMYXp5TW9kdWxlUmVmLCBvbkVycm9yLCBVcGdyYWRlQXBwVHlwZX0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy91dGlsJztcblxuaW1wb3J0IHtVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9IGZyb20gJy4vdXBncmFkZV9uZzFfYWRhcHRlcic7XG5cbmxldCB1cGdyYWRlQ291bnQ6IG51bWJlciA9IDA7XG5cbi8qKlxuICogVXNlIGBVcGdyYWRlQWRhcHRlcmAgdG8gYWxsb3cgQW5ndWxhckpTIGFuZCBBbmd1bGFyIHRvIGNvZXhpc3QgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24uXG4gKlxuICogVGhlIGBVcGdyYWRlQWRhcHRlcmAgYWxsb3dzOlxuICogMS4gY3JlYXRpb24gb2YgQW5ndWxhciBjb21wb25lbnQgZnJvbSBBbmd1bGFySlMgY29tcG9uZW50IGRpcmVjdGl2ZVxuICogICAgKFNlZSBbVXBncmFkZUFkYXB0ZXIjdXBncmFkZU5nMUNvbXBvbmVudCgpXSlcbiAqIDIuIGNyZWF0aW9uIG9mIEFuZ3VsYXJKUyBkaXJlY3RpdmUgZnJvbSBBbmd1bGFyIGNvbXBvbmVudC5cbiAqICAgIChTZWUgW1VwZ3JhZGVBZGFwdGVyI2Rvd25ncmFkZU5nMkNvbXBvbmVudCgpXSlcbiAqIDMuIEJvb3RzdHJhcHBpbmcgb2YgYSBoeWJyaWQgQW5ndWxhciBhcHBsaWNhdGlvbiB3aGljaCBjb250YWlucyBib3RoIG9mIHRoZSBmcmFtZXdvcmtzXG4gKiAgICBjb2V4aXN0aW5nIGluIGEgc2luZ2xlIGFwcGxpY2F0aW9uLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgTWVudGFsIE1vZGVsXG4gKlxuICogV2hlbiByZWFzb25pbmcgYWJvdXQgaG93IGEgaHlicmlkIGFwcGxpY2F0aW9uIHdvcmtzIGl0IGlzIHVzZWZ1bCB0byBoYXZlIGEgbWVudGFsIG1vZGVsIHdoaWNoXG4gKiBkZXNjcmliZXMgd2hhdCBpcyBoYXBwZW5pbmcgYW5kIGV4cGxhaW5zIHdoYXQgaXMgaGFwcGVuaW5nIGF0IHRoZSBsb3dlc3QgbGV2ZWwuXG4gKlxuICogMS4gVGhlcmUgYXJlIHR3byBpbmRlcGVuZGVudCBmcmFtZXdvcmtzIHJ1bm5pbmcgaW4gYSBzaW5nbGUgYXBwbGljYXRpb24sIGVhY2ggZnJhbWV3b3JrIHRyZWF0c1xuICogICAgdGhlIG90aGVyIGFzIGEgYmxhY2sgYm94LlxuICogMi4gRWFjaCBET00gZWxlbWVudCBvbiB0aGUgcGFnZSBpcyBvd25lZCBleGFjdGx5IGJ5IG9uZSBmcmFtZXdvcmsuIFdoaWNoZXZlciBmcmFtZXdvcmtcbiAqICAgIGluc3RhbnRpYXRlZCB0aGUgZWxlbWVudCBpcyB0aGUgb3duZXIuIEVhY2ggZnJhbWV3b3JrIG9ubHkgdXBkYXRlcy9pbnRlcmFjdHMgd2l0aCBpdHMgb3duXG4gKiAgICBET00gZWxlbWVudHMgYW5kIGlnbm9yZXMgb3RoZXJzLlxuICogMy4gQW5ndWxhckpTIGRpcmVjdGl2ZXMgYWx3YXlzIGV4ZWN1dGUgaW5zaWRlIEFuZ3VsYXJKUyBmcmFtZXdvcmsgY29kZWJhc2UgcmVnYXJkbGVzcyBvZlxuICogICAgd2hlcmUgdGhleSBhcmUgaW5zdGFudGlhdGVkLlxuICogNC4gQW5ndWxhciBjb21wb25lbnRzIGFsd2F5cyBleGVjdXRlIGluc2lkZSBBbmd1bGFyIGZyYW1ld29yayBjb2RlYmFzZSByZWdhcmRsZXNzIG9mXG4gKiAgICB3aGVyZSB0aGV5IGFyZSBpbnN0YW50aWF0ZWQuXG4gKiA1LiBBbiBBbmd1bGFySlMgY29tcG9uZW50IGNhbiBiZSB1cGdyYWRlZCB0byBhbiBBbmd1bGFyIGNvbXBvbmVudC4gVGhpcyBjcmVhdGVzIGFuXG4gKiAgICBBbmd1bGFyIGRpcmVjdGl2ZSwgd2hpY2ggYm9vdHN0cmFwcyB0aGUgQW5ndWxhckpTIGNvbXBvbmVudCBkaXJlY3RpdmUgaW4gdGhhdCBsb2NhdGlvbi5cbiAqIDYuIEFuIEFuZ3VsYXIgY29tcG9uZW50IGNhbiBiZSBkb3duZ3JhZGVkIHRvIGFuIEFuZ3VsYXJKUyBjb21wb25lbnQgZGlyZWN0aXZlLiBUaGlzIGNyZWF0ZXNcbiAqICAgIGFuIEFuZ3VsYXJKUyBkaXJlY3RpdmUsIHdoaWNoIGJvb3RzdHJhcHMgdGhlIEFuZ3VsYXIgY29tcG9uZW50IGluIHRoYXQgbG9jYXRpb24uXG4gKiA3LiBXaGVuZXZlciBhbiBhZGFwdGVyIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQgdGhlIGhvc3QgZWxlbWVudCBpcyBvd25lZCBieSB0aGUgZnJhbWV3b3JrXG4gKiAgICBkb2luZyB0aGUgaW5zdGFudGlhdGlvbi4gVGhlIG90aGVyIGZyYW1ld29yayB0aGVuIGluc3RhbnRpYXRlcyBhbmQgb3ducyB0aGUgdmlldyBmb3IgdGhhdFxuICogICAgY29tcG9uZW50LiBUaGlzIGltcGxpZXMgdGhhdCBjb21wb25lbnQgYmluZGluZ3Mgd2lsbCBhbHdheXMgZm9sbG93IHRoZSBzZW1hbnRpY3Mgb2YgdGhlXG4gKiAgICBpbnN0YW50aWF0aW9uIGZyYW1ld29yay4gVGhlIHN5bnRheCBpcyBhbHdheXMgdGhhdCBvZiBBbmd1bGFyIHN5bnRheC5cbiAqIDguIEFuZ3VsYXJKUyBpcyBhbHdheXMgYm9vdHN0cmFwcGVkIGZpcnN0IGFuZCBvd25zIHRoZSBib3R0b20gbW9zdCB2aWV3LlxuICogOS4gVGhlIG5ldyBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIEFuZ3VsYXIgem9uZSwgYW5kIHRoZXJlZm9yZSBpdCBubyBsb25nZXIgbmVlZHMgY2FsbHMgdG9cbiAqICAgIGAkYXBwbHkoKWAuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGNvbnN0IGFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoZm9yd2FyZFJlZigoKSA9PiBNeU5nMk1vZHVsZSksIG15Q29tcGlsZXJPcHRpb25zKTtcbiAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gKiBtb2R1bGUuZGlyZWN0aXZlKCduZzJDb21wJywgYWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTmcyQ29tcG9uZW50KSk7XG4gKlxuICogbW9kdWxlLmRpcmVjdGl2ZSgnbmcxSGVsbG8nLCBmdW5jdGlvbigpIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICAgc2NvcGU6IHsgdGl0bGU6ICc9JyB9LFxuICogICAgICB0ZW1wbGF0ZTogJ25nMVtIZWxsbyB7e3RpdGxlfX0hXSg8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4pJ1xuICogICB9O1xuICogfSk7XG4gKlxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ25nMi1jb21wJyxcbiAqICAgaW5wdXRzOiBbJ25hbWUnXSxcbiAqICAgdGVtcGxhdGU6ICduZzJbPG5nMS1oZWxsbyBbdGl0bGVdPVwibmFtZVwiPnRyYW5zY2x1ZGU8L25nMS1oZWxsbz5dKDxuZy1jb250ZW50PjwvbmctY29udGVudD4pJyxcbiAqICAgZGlyZWN0aXZlczpcbiAqIH0pXG4gKiBjbGFzcyBOZzJDb21wb25lbnQge1xuICogfVxuICpcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGRlY2xhcmF0aW9uczogW05nMkNvbXBvbmVudCwgYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCduZzFIZWxsbycpXSxcbiAqICAgaW1wb3J0czogW0Jyb3dzZXJNb2R1bGVdXG4gKiB9KVxuICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAqXG4gKlxuICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMi1jb21wIG5hbWU9XCJXb3JsZFwiPnByb2plY3Q8L25nMi1jb21wPic7XG4gKlxuICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gKiAgIGV4cGVjdChkb2N1bWVudC5ib2R5LnRleHRDb250ZW50KS50b0VxdWFsKFxuICogICAgICAgXCJuZzJbbmcxW0hlbGxvIFdvcmxkIV0odHJhbnNjbHVkZSldKHByb2plY3QpXCIpO1xuICogfSk7XG4gKlxuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgRGVwcmVjYXRlZCBzaW5jZSB2NS4gVXNlIGB1cGdyYWRlL3N0YXRpY2AgaW5zdGVhZCwgd2hpY2ggYWxzbyBzdXBwb3J0c1xuICogW0FoZWFkLW9mLVRpbWUgY29tcGlsYXRpb25dKGd1aWRlL2FvdC1jb21waWxlcikuXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBVcGdyYWRlQWRhcHRlciB7XG4gIHByaXZhdGUgaWRQcmVmaXg6IHN0cmluZyA9IGBORzJfVVBHUkFERV8ke3VwZ3JhZGVDb3VudCsrfV9gO1xuICBwcml2YXRlIGRvd25ncmFkZWRDb21wb25lbnRzOiBUeXBlPGFueT5bXSA9IFtdO1xuICAvKipcbiAgICogQW4gaW50ZXJuYWwgbWFwIG9mIG5nMSBjb21wb25lbnRzIHdoaWNoIG5lZWQgdG8gdXAgdXBncmFkZWQgdG8gbmcyLlxuICAgKlxuICAgKiBXZSBjYW4ndCB1cGdyYWRlIHVudGlsIGluamVjdG9yIGlzIGluc3RhbnRpYXRlZCBhbmQgd2UgY2FuIHJldHJpZXZlIHRoZSBjb21wb25lbnQgbWV0YWRhdGEuXG4gICAqIEZvciB0aGlzIHJlYXNvbiB3ZSBrZWVwIGEgbGlzdCBvZiBjb21wb25lbnRzIHRvIHVwZ3JhZGUgdW50aWwgbmcxIGluamVjdG9yIGlzIGJvb3RzdHJhcHBlZC5cbiAgICpcbiAgICogQGludGVybmFsXG4gICAqL1xuICBwcml2YXRlIG5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWQ6IHtbbmFtZTogc3RyaW5nXTogVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSA9IHt9O1xuICBwcml2YXRlIHVwZ3JhZGVkUHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW107XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIG5nWm9uZSE6IE5nWm9uZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgbmcxTW9kdWxlITogSU1vZHVsZTtcbiAgcHJpdmF0ZSBtb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT58bnVsbCA9IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIG5nMkJvb3RzdHJhcERlZmVycmVkITogRGVmZXJyZWQ8SUluamVjdG9yU2VydmljZT47XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuZzJBcHBNb2R1bGU6IFR5cGU8YW55PiwgcHJpdmF0ZSBjb21waWxlck9wdGlvbnM/OiBDb21waWxlck9wdGlvbnMpIHtcbiAgICBpZiAoIW5nMkFwcE1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdVcGdyYWRlQWRhcHRlciBjYW5ub3QgYmUgaW5zdGFudGlhdGVkIHdpdGhvdXQgYW4gTmdNb2R1bGUgb2YgdGhlIEFuZ3VsYXIgYXBwLicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhciBDb21wb25lbnQgdG8gYmUgdXNlZCBmcm9tIEFuZ3VsYXJKUy5cbiAgICpcbiAgICogVXNlIGBkb3duZ3JhZGVOZzJDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFySlMgRGlyZWN0aXZlIERlZmluaXRpb24gRmFjdG9yeSBmcm9tXG4gICAqIEFuZ3VsYXIgQ29tcG9uZW50LiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIHdpdGhpbiB0aGVcbiAgICogQW5ndWxhckpTIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgTWVudGFsIE1vZGVsXG4gICAqXG4gICAqIDEuIFRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGJ5IGJlaW5nIGxpc3RlZCBpbiBBbmd1bGFySlMgdGVtcGxhdGUuIFRoaXMgbWVhbnMgdGhhdCB0aGVcbiAgICogICAgaG9zdCBlbGVtZW50IGlzIGNvbnRyb2xsZWQgYnkgQW5ndWxhckpTLCBidXQgdGhlIGNvbXBvbmVudCdzIHZpZXcgd2lsbCBiZSBjb250cm9sbGVkIGJ5XG4gICAqICAgIEFuZ3VsYXIuXG4gICAqIDIuIEV2ZW4gdGhvdWdodCB0aGUgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCBpbiBBbmd1bGFySlMsIGl0IHdpbGwgYmUgdXNpbmcgQW5ndWxhclxuICAgKiAgICBzeW50YXguIFRoaXMgaGFzIHRvIGJlIGRvbmUsIHRoaXMgd2F5IGJlY2F1c2Ugd2UgbXVzdCBmb2xsb3cgQW5ndWxhciBjb21wb25lbnRzIGRvIG5vdFxuICAgKiAgICBkZWNsYXJlIGhvdyB0aGUgYXR0cmlidXRlcyBzaG91bGQgYmUgaW50ZXJwcmV0ZWQuXG4gICAqIDMuIGBuZy1tb2RlbGAgaXMgY29udHJvbGxlZCBieSBBbmd1bGFySlMgYW5kIGNvbW11bmljYXRlcyB3aXRoIHRoZSBkb3duZ3JhZGVkIEFuZ3VsYXIgY29tcG9uZW50XG4gICAqICAgIGJ5IHdheSBvZiB0aGUgYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCBpbnRlcmZhY2UgZnJvbSBAYW5ndWxhci9mb3Jtcy4gT25seSBjb21wb25lbnRzIHRoYXRcbiAgICogICAgaW1wbGVtZW50IHRoaXMgaW50ZXJmYWNlIGFyZSBlbGlnaWJsZS5cbiAgICpcbiAgICogIyMjIFN1cHBvcnRlZCBGZWF0dXJlc1xuICAgKlxuICAgKiAtIEJpbmRpbmdzOlxuICAgKiAgIC0gQXR0cmlidXRlOiBgPGNvbXAgbmFtZT1cIldvcmxkXCI+YFxuICAgKiAgIC0gSW50ZXJwb2xhdGlvbjogIGA8Y29tcCBncmVldGluZz1cIkhlbGxvIHt7bmFtZX19IVwiPmBcbiAgICogICAtIEV4cHJlc3Npb246ICBgPGNvbXAgW25hbWVdPVwidXNlcm5hbWVcIj5gXG4gICAqICAgLSBFdmVudDogIGA8Y29tcCAoY2xvc2UpPVwiZG9Tb21ldGhpbmcoKVwiPmBcbiAgICogICAtIG5nLW1vZGVsOiBgPGNvbXAgbmctbW9kZWw9XCJuYW1lXCI+YFxuICAgKiAtIENvbnRlbnQgcHJvamVjdGlvbjogeWVzXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBhZGFwdGVyLmRvd25ncmFkZU5nMkNvbXBvbmVudChHcmVldGVyKSk7XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICAgKiAgIHRlbXBsYXRlOiAne3tzYWx1dGF0aW9ufX0ge3tuYW1lfX0hIC0gPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PidcbiAgICogfSlcbiAgICogY2xhc3MgR3JlZXRlciB7XG4gICAqICAgQElucHV0KCkgc2FsdXRhdGlvbjogc3RyaW5nO1xuICAgKiAgIEBJbnB1dCgpIG5hbWU6IHN0cmluZztcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW0dyZWV0ZXJdLFxuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9XG4gICAqICAgJ25nMSB0ZW1wbGF0ZTogPGdyZWV0IHNhbHV0YXRpb249XCJIZWxsb1wiIFtuYW1lXT1cIndvcmxkXCI+dGV4dDwvZ3JlZXQ+JztcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAqICAgZXhwZWN0KGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQpLnRvRXF1YWwoXCJuZzEgdGVtcGxhdGU6IEhlbGxvIHdvcmxkISAtIHRleHRcIik7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICovXG4gIGRvd25ncmFkZU5nMkNvbXBvbmVudChjb21wb25lbnQ6IFR5cGU8YW55Pik6IEZ1bmN0aW9uIHtcbiAgICB0aGlzLmRvd25ncmFkZWRDb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcblxuICAgIHJldHVybiBkb3duZ3JhZGVDb21wb25lbnQoe2NvbXBvbmVudH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93cyBBbmd1bGFySlMgQ29tcG9uZW50IHRvIGJlIHVzZWQgZnJvbSBBbmd1bGFyLlxuICAgKlxuICAgKiBVc2UgYHVwZ3JhZGVOZzFDb21wb25lbnRgIHRvIGNyZWF0ZSBhbiBBbmd1bGFyIGNvbXBvbmVudCBmcm9tIEFuZ3VsYXJKUyBDb21wb25lbnRcbiAgICogZGlyZWN0aXZlLiBUaGUgYWRhcHRlciB3aWxsIGJvb3RzdHJhcCBBbmd1bGFySlMgY29tcG9uZW50IGZyb20gd2l0aGluIHRoZSBBbmd1bGFyXG4gICAqIHRlbXBsYXRlLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgTWVudGFsIE1vZGVsXG4gICAqXG4gICAqIDEuIFRoZSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkIGJ5IGJlaW5nIGxpc3RlZCBpbiBBbmd1bGFyIHRlbXBsYXRlLiBUaGlzIG1lYW5zIHRoYXQgdGhlXG4gICAqICAgIGhvc3QgZWxlbWVudCBpcyBjb250cm9sbGVkIGJ5IEFuZ3VsYXIsIGJ1dCB0aGUgY29tcG9uZW50J3MgdmlldyB3aWxsIGJlIGNvbnRyb2xsZWQgYnlcbiAgICogICAgQW5ndWxhckpTLlxuICAgKlxuICAgKiAjIyMgU3VwcG9ydGVkIEZlYXR1cmVzXG4gICAqXG4gICAqIC0gQmluZGluZ3M6XG4gICAqICAgLSBBdHRyaWJ1dGU6IGA8Y29tcCBuYW1lPVwiV29ybGRcIj5gXG4gICAqICAgLSBJbnRlcnBvbGF0aW9uOiAgYDxjb21wIGdyZWV0aW5nPVwiSGVsbG8ge3tuYW1lfX0hXCI+YFxuICAgKiAgIC0gRXhwcmVzc2lvbjogIGA8Y29tcCBbbmFtZV09XCJ1c2VybmFtZVwiPmBcbiAgICogICAtIEV2ZW50OiAgYDxjb21wIChjbG9zZSk9XCJkb1NvbWV0aGluZygpXCI+YFxuICAgKiAtIFRyYW5zY2x1c2lvbjogeWVzXG4gICAqIC0gT25seSBzb21lIG9mIHRoZSBmZWF0dXJlcyBvZlxuICAgKiAgIFtEaXJlY3RpdmUgRGVmaW5pdGlvbiBPYmplY3RdKGh0dHBzOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy9zZXJ2aWNlLyRjb21waWxlKSBhcmVcbiAgICogICBzdXBwb3J0ZWQ6XG4gICAqICAgLSBgY29tcGlsZWA6IG5vdCBzdXBwb3J0ZWQgYmVjYXVzZSB0aGUgaG9zdCBlbGVtZW50IGlzIG93bmVkIGJ5IEFuZ3VsYXIsIHdoaWNoIGRvZXNcbiAgICogICAgIG5vdCBhbGxvdyBtb2RpZnlpbmcgRE9NIHN0cnVjdHVyZSBkdXJpbmcgY29tcGlsYXRpb24uXG4gICAqICAgLSBgY29udHJvbGxlcmA6IHN1cHBvcnRlZC4gKE5PVEU6IGluamVjdGlvbiBvZiBgJGF0dHJzYCBhbmQgYCR0cmFuc2NsdWRlYCBpcyBub3Qgc3VwcG9ydGVkLilcbiAgICogICAtIGBjb250cm9sbGVyQXNgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgYmluZFRvQ29udHJvbGxlcmA6IHN1cHBvcnRlZC5cbiAgICogICAtIGBsaW5rYDogc3VwcG9ydGVkLiAoTk9URTogb25seSBwcmUtbGluayBmdW5jdGlvbiBpcyBzdXBwb3J0ZWQuKVxuICAgKiAgIC0gYG5hbWVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcHJpb3JpdHlgOiBpZ25vcmVkLlxuICAgKiAgIC0gYHJlcGxhY2VgOiBub3Qgc3VwcG9ydGVkLlxuICAgKiAgIC0gYHJlcXVpcmVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgcmVzdHJpY3RgOiBtdXN0IGJlIHNldCB0byAnRScuXG4gICAqICAgLSBgc2NvcGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVtcGxhdGVVcmxgOiBzdXBwb3J0ZWQuXG4gICAqICAgLSBgdGVybWluYWxgOiBpZ25vcmVkLlxuICAgKiAgIC0gYHRyYW5zY2x1ZGVgOiBzdXBwb3J0ZWQuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKGZvcndhcmRSZWYoKCkgPT4gTXlOZzJNb2R1bGUpKTtcbiAgICogY29uc3QgbW9kdWxlID0gYW5ndWxhci5tb2R1bGUoJ215RXhhbXBsZScsIFtdKTtcbiAgICpcbiAgICogbW9kdWxlLmRpcmVjdGl2ZSgnZ3JlZXQnLCBmdW5jdGlvbigpIHtcbiAgICogICByZXR1cm4ge1xuICAgKiAgICAgc2NvcGU6IHtzYWx1dGF0aW9uOiAnPScsIG5hbWU6ICc9JyB9LFxuICAgKiAgICAgdGVtcGxhdGU6ICd7e3NhbHV0YXRpb259fSB7e25hbWV9fSEgLSA8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4nXG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMkNvbXBvbmVudCkpO1xuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ25nMicsXG4gICAqICAgdGVtcGxhdGU6ICduZzIgdGVtcGxhdGU6IDxncmVldCBzYWx1dGF0aW9uPVwiSGVsbG9cIiBbbmFtZV09XCJ3b3JsZFwiPnRleHQ8L2dyZWV0PidcbiAgICogfSlcbiAgICogY2xhc3MgTmcyQ29tcG9uZW50IHtcbiAgICogfVxuICAgKlxuICAgKiBATmdNb2R1bGUoe1xuICAgKiAgIGRlY2xhcmF0aW9uczogW05nMkNvbXBvbmVudCwgYWRhcHRlci51cGdyYWRlTmcxQ29tcG9uZW50KCdncmVldCcpXSxcbiAgICogICBpbXBvcnRzOiBbQnJvd3Nlck1vZHVsZV1cbiAgICogfSlcbiAgICogY2xhc3MgTXlOZzJNb2R1bGUge31cbiAgICpcbiAgICogZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSAnPG5nMj48L25nMj4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcIm5nMiB0ZW1wbGF0ZTogSGVsbG8gd29ybGQhIC0gdGV4dFwiKTtcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgdXBncmFkZU5nMUNvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBUeXBlPGFueT4ge1xuICAgIGlmICgoPGFueT50aGlzLm5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWQpLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdLnR5cGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAodGhpcy5uZzFDb21wb25lbnRzVG9CZVVwZ3JhZGVkW25hbWVdID0gbmV3IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcihuYW1lKSlcbiAgICAgICAgICAudHlwZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIHRoZSBhZGFwdGVyJ3MgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIGZvciB1bml0IHRlc3RpbmcgaW4gQW5ndWxhckpTLlxuICAgKiBVc2UgdGhpcyBpbnN0ZWFkIG9mIGBhbmd1bGFyLm1vY2subW9kdWxlKClgIHRvIGxvYWQgdGhlIHVwZ3JhZGUgbW9kdWxlIGludG9cbiAgICogdGhlIEFuZ3VsYXJKUyB0ZXN0aW5nIGluamVjdG9yLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgdXBncmFkZUFkYXB0ZXIgPSBuZXcgVXBncmFkZUFkYXB0ZXIoTXlOZzJNb2R1bGUpO1xuICAgKlxuICAgKiAvLyBjb25maWd1cmUgdGhlIGFkYXB0ZXIgd2l0aCB1cGdyYWRlL2Rvd25ncmFkZSBjb21wb25lbnRzIGFuZCBzZXJ2aWNlc1xuICAgKiB1cGdyYWRlQWRhcHRlci5kb3duZ3JhZGVOZzJDb21wb25lbnQoTXlDb21wb25lbnQpO1xuICAgKlxuICAgKiBsZXQgdXBncmFkZUFkYXB0ZXJSZWY6IFVwZ3JhZGVBZGFwdGVyUmVmO1xuICAgKiBsZXQgJGNvbXBpbGUsICRyb290U2NvcGU7XG4gICAqXG4gICAqIC8vIFdlIG11c3QgcmVnaXN0ZXIgdGhlIGFkYXB0ZXIgYmVmb3JlIGFueSBjYWxscyB0byBgaW5qZWN0KClgXG4gICAqIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgKiAgIHVwZ3JhZGVBZGFwdGVyUmVmID0gdXBncmFkZUFkYXB0ZXIucmVnaXN0ZXJGb3JOZzFUZXN0cyhbJ2hlcm9BcHAnXSk7XG4gICAqIH0pO1xuICAgKlxuICAgKiBiZWZvcmVFYWNoKGluamVjdCgoXyRjb21waWxlXywgXyRyb290U2NvcGVfKSA9PiB7XG4gICAqICAgJGNvbXBpbGUgPSBfJGNvbXBpbGVfO1xuICAgKiAgICRyb290U2NvcGUgPSBfJHJvb3RTY29wZV87XG4gICAqIH0pKTtcbiAgICpcbiAgICogaXQoXCJzYXlzIGhlbGxvXCIsIChkb25lKSA9PiB7XG4gICAqICAgdXBncmFkZUFkYXB0ZXJSZWYucmVhZHkoKCkgPT4ge1xuICAgKiAgICAgY29uc3QgZWxlbWVudCA9ICRjb21waWxlKFwiPG15LWNvbXBvbmVudD48L215LWNvbXBvbmVudD5cIikoJHJvb3RTY29wZSk7XG4gICAqICAgICAkcm9vdFNjb3BlLiRhcHBseSgpO1xuICAgKiAgICAgZXhwZWN0KGVsZW1lbnQuaHRtbCgpKS50b0NvbnRhaW4oXCJIZWxsbyBXb3JsZFwiKTtcbiAgICogICAgIGRvbmUoKTtcbiAgICogICB9KVxuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVzIGFueSBBbmd1bGFySlMgbW9kdWxlcyB0aGF0IHRoZSB1cGdyYWRlIG1vZHVsZSBzaG91bGQgZGVwZW5kIHVwb25cbiAgICogQHJldHVybnMgYW4gYFVwZ3JhZGVBZGFwdGVyUmVmYCwgd2hpY2ggbGV0cyB5b3UgcmVnaXN0ZXIgYSBgcmVhZHkoKWAgY2FsbGJhY2sgdG9cbiAgICogcnVuIGFzc2VydGlvbnMgb25jZSB0aGUgQW5ndWxhciBjb21wb25lbnRzIGFyZSByZWFkeSB0byB0ZXN0IHRocm91Z2ggQW5ndWxhckpTLlxuICAgKi9cbiAgcmVnaXN0ZXJGb3JOZzFUZXN0cyhtb2R1bGVzPzogc3RyaW5nW10pOiBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgY29uc3Qgd2luZG93TmdNb2NrID0gKHdpbmRvdyBhcyBhbnkpWydhbmd1bGFyJ10ubW9jaztcbiAgICBpZiAoIXdpbmRvd05nTW9jayB8fCAhd2luZG93TmdNb2NrLm1vZHVsZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gZmluZCBcXCdhbmd1bGFyLm1vY2subW9kdWxlXFwnLicpO1xuICAgIH1cbiAgICB0aGlzLmRlY2xhcmVOZzFNb2R1bGUobW9kdWxlcyk7XG4gICAgd2luZG93TmdNb2NrLm1vZHVsZSh0aGlzLm5nMU1vZHVsZS5uYW1lKTtcbiAgICBjb25zdCB1cGdyYWRlID0gbmV3IFVwZ3JhZGVBZGFwdGVyUmVmKCk7XG4gICAgdGhpcy5uZzJCb290c3RyYXBEZWZlcnJlZC5wcm9taXNlLnRoZW4oKG5nMUluamVjdG9yKSA9PiB7XG4gICAgICAoPGFueT51cGdyYWRlKS5fYm9vdHN0cmFwRG9uZSh0aGlzLm1vZHVsZVJlZiwgbmcxSW5qZWN0b3IpO1xuICAgIH0sIG9uRXJyb3IpO1xuICAgIHJldHVybiB1cGdyYWRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEJvb3RzdHJhcCBhIGh5YnJpZCBBbmd1bGFySlMgLyBBbmd1bGFyIGFwcGxpY2F0aW9uLlxuICAgKlxuICAgKiBUaGlzIGBib290c3RyYXBgIG1ldGhvZCBpcyBhIGRpcmVjdCByZXBsYWNlbWVudCAodGFrZXMgc2FtZSBhcmd1bWVudHMpIGZvciBBbmd1bGFySlNcbiAgICogW2Bib290c3RyYXBgXShodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvZnVuY3Rpb24vYW5ndWxhci5ib290c3RyYXApIG1ldGhvZC4gVW5saWtlXG4gICAqIEFuZ3VsYXJKUywgdGhpcyBib290c3RyYXAgaXMgYXN5bmNocm9ub3VzLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5kaXJlY3RpdmUoJ25nMicsIGFkYXB0ZXIuZG93bmdyYWRlTmcyQ29tcG9uZW50KE5nMikpO1xuICAgKlxuICAgKiBtb2R1bGUuZGlyZWN0aXZlKCduZzEnLCBmdW5jdGlvbigpIHtcbiAgICogICByZXR1cm4ge1xuICAgKiAgICAgIHNjb3BlOiB7IHRpdGxlOiAnPScgfSxcbiAgICogICAgICB0ZW1wbGF0ZTogJ25nMVtIZWxsbyB7e3RpdGxlfX0hXSg8c3BhbiBuZy10cmFuc2NsdWRlPjwvc3Bhbj4pJ1xuICAgKiAgIH07XG4gICAqIH0pO1xuICAgKlxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ25nMicsXG4gICAqICAgaW5wdXRzOiBbJ25hbWUnXSxcbiAgICogICB0ZW1wbGF0ZTogJ25nMls8bmcxIFt0aXRsZV09XCJuYW1lXCI+dHJhbnNjbHVkZTwvbmcxPl0oPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PiknXG4gICAqIH0pXG4gICAqIGNsYXNzIE5nMiB7XG4gICAqIH1cbiAgICpcbiAgICogQE5nTW9kdWxlKHtcbiAgICogICBkZWNsYXJhdGlvbnM6IFtOZzIsIGFkYXB0ZXIudXBncmFkZU5nMUNvbXBvbmVudCgnbmcxJyldLFxuICAgKiAgIGltcG9ydHM6IFtCcm93c2VyTW9kdWxlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeU5nMk1vZHVsZSB7fVxuICAgKlxuICAgKiBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9ICc8bmcyIG5hbWU9XCJXb3JsZFwiPnByb2plY3Q8L25nMj4nO1xuICAgKlxuICAgKiBhZGFwdGVyLmJvb3RzdHJhcChkb2N1bWVudC5ib2R5LCBbJ215RXhhbXBsZSddKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICogICBleHBlY3QoZG9jdW1lbnQuYm9keS50ZXh0Q29udGVudCkudG9FcXVhbChcbiAgICogICAgICAgXCJuZzJbbmcxW0hlbGxvIFdvcmxkIV0odHJhbnNjbHVkZSldKHByb2plY3QpXCIpO1xuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuICBib290c3RyYXAoZWxlbWVudDogRWxlbWVudCwgbW9kdWxlcz86IGFueVtdLCBjb25maWc/OiBJQW5ndWxhckJvb3RzdHJhcENvbmZpZyk6XG4gICAgICBVcGdyYWRlQWRhcHRlclJlZiB7XG4gICAgdGhpcy5kZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXMpO1xuXG4gICAgY29uc3QgdXBncmFkZSA9IG5ldyBVcGdyYWRlQWRhcHRlclJlZigpO1xuXG4gICAgLy8gTWFrZSBzdXJlIHJlc3VtZUJvb3RzdHJhcCgpIG9ubHkgZXhpc3RzIGlmIHRoZSBjdXJyZW50IGJvb3RzdHJhcCBpcyBkZWZlcnJlZFxuICAgIGNvbnN0IHdpbmRvd0FuZ3VsYXIgPSAod2luZG93IGFzIGFueSAvKiogVE9ETyAjPz8/PyAqLylbJ2FuZ3VsYXInXTtcbiAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IHVuZGVmaW5lZDtcblxuICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICBib290c3RyYXAoZWxlbWVudCwgW3RoaXMubmcxTW9kdWxlLm5hbWVdLCBjb25maWchKTtcbiAgICB9KTtcbiAgICBjb25zdCBuZzFCb290c3RyYXBQcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcbiAgICAgIGlmICh3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCkge1xuICAgICAgICBjb25zdCBvcmlnaW5hbFJlc3VtZUJvb3RzdHJhcDogKCkgPT4gdm9pZCA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwO1xuICAgICAgICB3aW5kb3dBbmd1bGFyLnJlc3VtZUJvb3RzdHJhcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwID0gb3JpZ2luYWxSZXN1bWVCb290c3RyYXA7XG4gICAgICAgICAgY29uc3QgciA9IHdpbmRvd0FuZ3VsYXIucmVzdW1lQm9vdHN0cmFwLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgUHJvbWlzZS5hbGwoW3RoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucHJvbWlzZSwgbmcxQm9vdHN0cmFwUHJvbWlzZV0pLnRoZW4oKFtuZzFJbmplY3Rvcl0pID0+IHtcbiAgICAgIGFuZ3VsYXJFbGVtZW50KGVsZW1lbnQpLmRhdGEhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgdGhpcy5tb2R1bGVSZWYhLmluamVjdG9yKTtcbiAgICAgIHRoaXMubW9kdWxlUmVmIS5pbmplY3Rvci5nZXQ8Tmdab25lPihOZ1pvbmUpLnJ1bigoKSA9PiB7XG4gICAgICAgICg8YW55PnVwZ3JhZGUpLl9ib290c3RyYXBEb25lKHRoaXMubW9kdWxlUmVmLCBuZzFJbmplY3Rvcik7XG4gICAgICB9KTtcbiAgICB9LCBvbkVycm9yKTtcbiAgICByZXR1cm4gdXBncmFkZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGxvd3MgQW5ndWxhckpTIHNlcnZpY2UgdG8gYmUgYWNjZXNzaWJsZSBmcm9tIEFuZ3VsYXIuXG4gICAqXG4gICAqIEB1c2FnZU5vdGVzXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBjbGFzcyBMb2dpbiB7IC4uLiB9XG4gICAqIGNsYXNzIFNlcnZlciB7IC4uLiB9XG4gICAqXG4gICAqIEBJbmplY3RhYmxlKClcbiAgICogY2xhc3MgRXhhbXBsZSB7XG4gICAqICAgY29uc3RydWN0b3IoQEluamVjdCgnc2VydmVyJykgc2VydmVyLCBsb2dpbjogTG9naW4pIHtcbiAgICogICAgIC4uLlxuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBjb25zdCBtb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbXlFeGFtcGxlJywgW10pO1xuICAgKiBtb2R1bGUuc2VydmljZSgnc2VydmVyJywgU2VydmVyKTtcbiAgICogbW9kdWxlLnNlcnZpY2UoJ2xvZ2luJywgTG9naW4pO1xuICAgKlxuICAgKiBjb25zdCBhZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogYWRhcHRlci51cGdyYWRlTmcxUHJvdmlkZXIoJ3NlcnZlcicpO1xuICAgKiBhZGFwdGVyLnVwZ3JhZGVOZzFQcm92aWRlcignbG9naW4nLCB7YXNUb2tlbjogTG9naW59KTtcbiAgICpcbiAgICogYWRhcHRlci5ib290c3RyYXAoZG9jdW1lbnQuYm9keSwgWydteUV4YW1wbGUnXSkucmVhZHkoKHJlZikgPT4ge1xuICAgKiAgIGNvbnN0IGV4YW1wbGU6IEV4YW1wbGUgPSByZWYubmcySW5qZWN0b3IuZ2V0KEV4YW1wbGUpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICB1cGdyYWRlTmcxUHJvdmlkZXIobmFtZTogc3RyaW5nLCBvcHRpb25zPzoge2FzVG9rZW46IGFueX0pIHtcbiAgICBjb25zdCB0b2tlbiA9IG9wdGlvbnMgJiYgb3B0aW9ucy5hc1Rva2VuIHx8IG5hbWU7XG4gICAgdGhpcy51cGdyYWRlZFByb3ZpZGVycy5wdXNoKHtcbiAgICAgIHByb3ZpZGU6IHRva2VuLFxuICAgICAgdXNlRmFjdG9yeTogKCRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSkgPT4gJGluamVjdG9yLmdldChuYW1lKSxcbiAgICAgIGRlcHM6IFskSU5KRUNUT1JdXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWxsb3dzIEFuZ3VsYXIgc2VydmljZSB0byBiZSBhY2Nlc3NpYmxlIGZyb20gQW5ndWxhckpTLlxuICAgKlxuICAgKiBAdXNhZ2VOb3Rlc1xuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgRXhhbXBsZSB7XG4gICAqIH1cbiAgICpcbiAgICogY29uc3QgYWRhcHRlciA9IG5ldyBVcGdyYWRlQWRhcHRlcihNeU5nMk1vZHVsZSk7XG4gICAqXG4gICAqIGNvbnN0IG1vZHVsZSA9IGFuZ3VsYXIubW9kdWxlKCdteUV4YW1wbGUnLCBbXSk7XG4gICAqIG1vZHVsZS5mYWN0b3J5KCdleGFtcGxlJywgYWRhcHRlci5kb3duZ3JhZGVOZzJQcm92aWRlcihFeGFtcGxlKSk7XG4gICAqXG4gICAqIGFkYXB0ZXIuYm9vdHN0cmFwKGRvY3VtZW50LmJvZHksIFsnbXlFeGFtcGxlJ10pLnJlYWR5KChyZWYpID0+IHtcbiAgICogICBjb25zdCBleGFtcGxlOiBFeGFtcGxlID0gcmVmLm5nMUluamVjdG9yLmdldCgnZXhhbXBsZScpO1xuICAgKiB9KTtcbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBkb3duZ3JhZGVOZzJQcm92aWRlcih0b2tlbjogYW55KTogRnVuY3Rpb24ge1xuICAgIHJldHVybiBkb3duZ3JhZGVJbmplY3RhYmxlKHRva2VuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNsYXJlIHRoZSBBbmd1bGFySlMgdXBncmFkZSBtb2R1bGUgZm9yIHRoaXMgYWRhcHRlciB3aXRob3V0IGJvb3RzdHJhcHBpbmcgdGhlIHdob2xlXG4gICAqIGh5YnJpZCBhcHBsaWNhdGlvbi5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgaXMgYXV0b21hdGljYWxseSBjYWxsZWQgYnkgYGJvb3RzdHJhcCgpYCBhbmQgYHJlZ2lzdGVyRm9yTmcxVGVzdHMoKWAuXG4gICAqXG4gICAqIEBwYXJhbSBtb2R1bGVzIFRoZSBBbmd1bGFySlMgbW9kdWxlcyB0aGF0IHRoaXMgdXBncmFkZSBtb2R1bGUgc2hvdWxkIGRlcGVuZCB1cG9uLlxuICAgKiBAcmV0dXJucyBUaGUgQW5ndWxhckpTIHVwZ3JhZGUgbW9kdWxlIHRoYXQgaXMgZGVjbGFyZWQgYnkgdGhpcyBtZXRob2RcbiAgICpcbiAgICogQHVzYWdlTm90ZXNcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIGNvbnN0IHVwZ3JhZGVBZGFwdGVyID0gbmV3IFVwZ3JhZGVBZGFwdGVyKE15TmcyTW9kdWxlKTtcbiAgICogdXBncmFkZUFkYXB0ZXIuZGVjbGFyZU5nMU1vZHVsZShbJ2hlcm9BcHAnXSk7XG4gICAqIGBgYFxuICAgKi9cbiAgcHJpdmF0ZSBkZWNsYXJlTmcxTW9kdWxlKG1vZHVsZXM6IHN0cmluZ1tdID0gW10pOiBJTW9kdWxlIHtcbiAgICBjb25zdCBkZWxheUFwcGx5RXhwczogRnVuY3Rpb25bXSA9IFtdO1xuICAgIGxldCBvcmlnaW5hbCRhcHBseUZuOiBGdW5jdGlvbjtcbiAgICBsZXQgcm9vdFNjb3BlUHJvdG90eXBlOiBhbnk7XG4gICAgbGV0IHJvb3RTY29wZTogSVJvb3RTY29wZVNlcnZpY2U7XG4gICAgY29uc3QgdXBncmFkZUFkYXB0ZXIgPSB0aGlzO1xuICAgIGNvbnN0IG5nMU1vZHVsZSA9IHRoaXMubmcxTW9kdWxlID0gYW5ndWxhck1vZHVsZSh0aGlzLmlkUHJlZml4LCBtb2R1bGVzKTtcbiAgICBjb25zdCBwbGF0Zm9ybVJlZiA9IHBsYXRmb3JtQnJvd3NlckR5bmFtaWMoKTtcblxuICAgIHRoaXMubmdab25lID0gbmV3IE5nWm9uZSh7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IFpvbmUuaGFzT3duUHJvcGVydHkoJ2xvbmdTdGFja1RyYWNlWm9uZVNwZWMnKX0pO1xuICAgIHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcbiAgICBuZzFNb2R1bGUuY29uc3RhbnQoVVBHUkFERV9BUFBfVFlQRV9LRVksIFVwZ3JhZGVBcHBUeXBlLkR5bmFtaWMpXG4gICAgICAgIC5mYWN0b3J5KElOSkVDVE9SX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYhLmluamVjdG9yLmdldChJbmplY3RvcikpXG4gICAgICAgIC5mYWN0b3J5KFxuICAgICAgICAgICAgTEFaWV9NT0RVTEVfUkVGLCBbSU5KRUNUT1JfS0VZLCAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiAoe2luamVjdG9yfSBhcyBMYXp5TW9kdWxlUmVmKV0pXG4gICAgICAgIC5jb25zdGFudChOR19aT05FX0tFWSwgdGhpcy5uZ1pvbmUpXG4gICAgICAgIC5mYWN0b3J5KENPTVBJTEVSX0tFWSwgKCkgPT4gdGhpcy5tb2R1bGVSZWYhLmluamVjdG9yLmdldChDb21waWxlcikpXG4gICAgICAgIC5jb25maWcoW1xuICAgICAgICAgICckcHJvdmlkZScsICckaW5qZWN0b3InLFxuICAgICAgICAgIChwcm92aWRlOiBJUHJvdmlkZVNlcnZpY2UsIG5nMUluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlKSA9PiB7XG4gICAgICAgICAgICBwcm92aWRlLmRlY29yYXRvcigkUk9PVF9TQ09QRSwgW1xuICAgICAgICAgICAgICAnJGRlbGVnYXRlJyxcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocm9vdFNjb3BlRGVsZWdhdGU6IElSb290U2NvcGVTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2FwdHVyZSB0aGUgcm9vdCBhcHBseSBzbyB0aGF0IHdlIGNhbiBkZWxheSBmaXJzdCBjYWxsIHRvICRhcHBseSB1bnRpbCB3ZVxuICAgICAgICAgICAgICAgIC8vIGJvb3RzdHJhcCBBbmd1bGFyIGFuZCB0aGVuIHdlIHJlcGxheSBhbmQgcmVzdG9yZSB0aGUgJGFwcGx5LlxuICAgICAgICAgICAgICAgIHJvb3RTY29wZVByb3RvdHlwZSA9IHJvb3RTY29wZURlbGVnYXRlLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICAgICAgICAgICAgICBpZiAocm9vdFNjb3BlUHJvdG90eXBlLmhhc093blByb3BlcnR5KCckYXBwbHknKSkge1xuICAgICAgICAgICAgICAgICAgb3JpZ2luYWwkYXBwbHlGbiA9IHJvb3RTY29wZVByb3RvdHlwZS4kYXBwbHk7XG4gICAgICAgICAgICAgICAgICByb290U2NvcGVQcm90b3R5cGUuJGFwcGx5ID0gKGV4cDogYW55KSA9PiBkZWxheUFwcGx5RXhwcy5wdXNoKGV4cCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZpbmQgXFwnJGFwcGx5XFwnIG9uIFxcJyRyb290U2NvcGVcXCchJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiByb290U2NvcGUgPSByb290U2NvcGVEZWxlZ2F0ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBpZiAobmcxSW5qZWN0b3IuaGFzKCQkVEVTVEFCSUxJVFkpKSB7XG4gICAgICAgICAgICAgIHByb3ZpZGUuZGVjb3JhdG9yKCQkVEVTVEFCSUxJVFksIFtcbiAgICAgICAgICAgICAgICAnJGRlbGVnYXRlJyxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbih0ZXN0YWJpbGl0eURlbGVnYXRlOiBJVGVzdGFiaWxpdHlTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbFdoZW5TdGFibGU6IEZ1bmN0aW9uID0gdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlO1xuICAgICAgICAgICAgICAgICAgLy8gQ2Fubm90IHVzZSBhcnJvdyBmdW5jdGlvbiBiZWxvdyBiZWNhdXNlIHdlIG5lZWQgdGhlIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1doZW5TdGFibGUgPSBmdW5jdGlvbih0aGlzOiB1bmtub3duLCBjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxXaGVuU3RhYmxlLmNhbGwodGhpcywgZnVuY3Rpb24odGhpczogdW5rbm93bikge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5nMlRlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVwZ3JhZGVBZGFwdGVyLm1vZHVsZVJlZiEuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5KTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAobmcyVGVzdGFiaWxpdHkuaXNTdGFibGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmcyVGVzdGFiaWxpdHkud2hlblN0YWJsZShuZXdXaGVuU3RhYmxlLmJpbmQodGhpcywgY2FsbGJhY2spKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgdGVzdGFiaWxpdHlEZWxlZ2F0ZS53aGVuU3RhYmxlID0gbmV3V2hlblN0YWJsZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0YWJpbGl0eURlbGVnYXRlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdKTtcblxuICAgIG5nMU1vZHVsZS5ydW4oW1xuICAgICAgJyRpbmplY3RvcicsICckcm9vdFNjb3BlJyxcbiAgICAgIChuZzFJbmplY3RvcjogSUluamVjdG9yU2VydmljZSwgcm9vdFNjb3BlOiBJUm9vdFNjb3BlU2VydmljZSkgPT4ge1xuICAgICAgICBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIucmVzb2x2ZSh0aGlzLm5nMUNvbXBvbmVudHNUb0JlVXBncmFkZWQsIG5nMUluamVjdG9yKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAvLyBOb3RlOiBUaGVyZSBpcyBhIGJ1ZyBpbiBUUyAyLjQgdGhhdCBwcmV2ZW50cyB1cyBmcm9tXG4gICAgICAgICAgICAgIC8vIGlubGluaW5nIHRoaXMgaW50byBATmdNb2R1bGVcbiAgICAgICAgICAgICAgLy8gVE9ETyh0Ym9zY2gpOiBmaW5kIG9yIGZpbGUgYSBidWcgYWdhaW5zdCBUeXBlU2NyaXB0IGZvciB0aGlzLlxuICAgICAgICAgICAgICBjb25zdCBuZ01vZHVsZSA9IHtcbiAgICAgICAgICAgICAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgICAgICAgICAgIHtwcm92aWRlOiAkSU5KRUNUT1IsIHVzZUZhY3Rvcnk6ICgpID0+IG5nMUluamVjdG9yfSxcbiAgICAgICAgICAgICAgICAgIHtwcm92aWRlOiAkQ09NUElMRSwgdXNlRmFjdG9yeTogKCkgPT4gbmcxSW5qZWN0b3IuZ2V0KCRDT01QSUxFKX0sXG4gICAgICAgICAgICAgICAgICB0aGlzLnVwZ3JhZGVkUHJvdmlkZXJzXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBpbXBvcnRzOiBbcmVzb2x2ZUZvcndhcmRSZWYodGhpcy5uZzJBcHBNb2R1bGUpXSxcbiAgICAgICAgICAgICAgICBlbnRyeUNvbXBvbmVudHM6IHRoaXMuZG93bmdyYWRlZENvbXBvbmVudHNcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCB3ZSBoYXZlIG5nMSBpbmplY3RvciBhbmQgd2UgaGF2ZSBwcmVwYXJlZFxuICAgICAgICAgICAgICAvLyBuZzEgY29tcG9uZW50cyB0byBiZSB1cGdyYWRlZCwgd2Ugbm93IGNhbiBib290c3RyYXAgbmcyLlxuICAgICAgICAgICAgICBATmdNb2R1bGUoe2ppdDogdHJ1ZSwgLi4ubmdNb2R1bGV9KVxuICAgICAgICAgICAgICBjbGFzcyBEeW5hbWljTmdVcGdyYWRlTW9kdWxlIHtcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3RvcigpIHt9XG4gICAgICAgICAgICAgICAgbmdEb0Jvb3RzdHJhcCgpIHt9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcGxhdGZvcm1SZWZcbiAgICAgICAgICAgICAgICAgIC5ib290c3RyYXBNb2R1bGUoXG4gICAgICAgICAgICAgICAgICAgICAgRHluYW1pY05nVXBncmFkZU1vZHVsZSwgW3RoaXMuY29tcGlsZXJPcHRpb25zISwge25nWm9uZTogdGhpcy5uZ1pvbmV9XSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKChyZWY6IE5nTW9kdWxlUmVmPGFueT4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb2R1bGVSZWYgPSByZWY7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZVByb3RvdHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlLiRhcHBseSA9IG9yaWdpbmFsJGFwcGx5Rm47ICAvLyByZXN0b3JlIG9yaWdpbmFsICRhcHBseVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGRlbGF5QXBwbHlFeHBzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByb290U2NvcGUuJGFwcGx5KGRlbGF5QXBwbHlFeHBzLnNoaWZ0KCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vdFNjb3BlUHJvdG90eXBlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucmVzb2x2ZShuZzFJbmplY3RvciksIG9uRXJyb3IpXG4gICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzdWJzY3JpcHRpb24gPSB0aGlzLm5nWm9uZS5vbk1pY3JvdGFza0VtcHR5LnN1YnNjcmliZSh7XG4gICAgICAgICAgICAgICAgICAgICAgbmV4dDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvb3RTY29wZS4kJHBoYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0Rldk1vZGUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0EgZGlnZXN0IHdhcyB0cmlnZ2VyZWQgd2hpbGUgb25lIHdhcyBhbHJlYWR5IGluIHByb2dyZXNzLiBUaGlzIG1heSBtZWFuIHRoYXQgc29tZXRoaW5nIGlzIHRyaWdnZXJpbmcgZGlnZXN0cyBvdXRzaWRlIHRoZSBBbmd1bGFyIHpvbmUuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlLiRldmFsQXN5bmMoKCkgPT4ge30pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByb290U2NvcGUuJG9uKCckZGVzdHJveScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHRoaXMubmcyQm9vdHN0cmFwRGVmZXJyZWQucmVqZWN0KGUpKTtcbiAgICAgIH1cbiAgICBdKTtcblxuICAgIHJldHVybiBuZzFNb2R1bGU7XG4gIH1cbn1cblxuLyoqXG4gKiBTeW5jaHJvbm91cyBwcm9taXNlLWxpa2Ugb2JqZWN0IHRvIHdyYXAgcGFyZW50IGluamVjdG9ycyxcbiAqIHRvIHByZXNlcnZlIHRoZSBzeW5jaHJvbm91cyBuYXR1cmUgb2YgQW5ndWxhckpTJ3MgJGNvbXBpbGUuXG4gKi9cbmNsYXNzIFBhcmVudEluamVjdG9yUHJvbWlzZSB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGluamVjdG9yITogSW5qZWN0b3I7XG4gIHByaXZhdGUgY2FsbGJhY2tzOiAoKGluamVjdG9yOiBJbmplY3RvcikgPT4gYW55KVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5KSB7XG4gICAgLy8gc3RvcmUgdGhlIHByb21pc2Ugb24gdGhlIGVsZW1lbnRcbiAgICBlbGVtZW50LmRhdGEhKGNvbnRyb2xsZXJLZXkoSU5KRUNUT1JfS0VZKSwgdGhpcyk7XG4gIH1cblxuICB0aGVuKGNhbGxiYWNrOiAoaW5qZWN0b3I6IEluamVjdG9yKSA9PiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbmplY3Rvcikge1xuICAgICAgY2FsbGJhY2sodGhpcy5pbmplY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbiAgfVxuXG4gIHJlc29sdmUoaW5qZWN0b3I6IEluamVjdG9yKSB7XG4gICAgdGhpcy5pbmplY3RvciA9IGluamVjdG9yO1xuXG4gICAgLy8gcmVzZXQgdGhlIGVsZW1lbnQgZGF0YSB0byBwb2ludCB0byB0aGUgcmVhbCBpbmplY3RvclxuICAgIHRoaXMuZWxlbWVudC5kYXRhIShjb250cm9sbGVyS2V5KElOSkVDVE9SX0tFWSksIGluamVjdG9yKTtcblxuICAgIC8vIGNsZWFuIG91dCB0aGUgZWxlbWVudCB0byBwcmV2ZW50IG1lbW9yeSBsZWFrc1xuICAgIHRoaXMuZWxlbWVudCA9IG51bGwhO1xuXG4gICAgLy8gcnVuIGFsbCB0aGUgcXVldWVkIGNhbGxiYWNrc1xuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goKGNhbGxiYWNrKSA9PiBjYWxsYmFjayhpbmplY3RvcikpO1xuICAgIHRoaXMuY2FsbGJhY2tzLmxlbmd0aCA9IDA7XG4gIH1cbn1cblxuXG4vKipcbiAqIFVzZSBgVXBncmFkZUFkYXB0ZXJSZWZgIHRvIGNvbnRyb2wgYSBoeWJyaWQgQW5ndWxhckpTIC8gQW5ndWxhciBhcHBsaWNhdGlvbi5cbiAqXG4gKiBAZGVwcmVjYXRlZCBEZXByZWNhdGVkIHNpbmNlIHY1LiBVc2UgYHVwZ3JhZGUvc3RhdGljYCBpbnN0ZWFkLCB3aGljaCBhbHNvIHN1cHBvcnRzXG4gKiBbQWhlYWQtb2YtVGltZSBjb21waWxhdGlvbl0oZ3VpZGUvYW90LWNvbXBpbGVyKS5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVBZGFwdGVyUmVmIHtcbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX3JlYWR5Rm46ICgodXBncmFkZUFkYXB0ZXJSZWY6IFVwZ3JhZGVBZGFwdGVyUmVmKSA9PiB2b2lkKXxudWxsID0gbnVsbDtcblxuICBwdWJsaWMgbmcxUm9vdFNjb3BlOiBJUm9vdFNjb3BlU2VydmljZSA9IG51bGwhO1xuICBwdWJsaWMgbmcxSW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UgPSBudWxsITtcbiAgcHVibGljIG5nMk1vZHVsZVJlZjogTmdNb2R1bGVSZWY8YW55PiA9IG51bGwhO1xuICBwdWJsaWMgbmcySW5qZWN0b3I6IEluamVjdG9yID0gbnVsbCE7XG5cbiAgLyogQGludGVybmFsICovXG4gIHByaXZhdGUgX2Jvb3RzdHJhcERvbmUobmdNb2R1bGVSZWY6IE5nTW9kdWxlUmVmPGFueT4sIG5nMUluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlKSB7XG4gICAgdGhpcy5uZzJNb2R1bGVSZWYgPSBuZ01vZHVsZVJlZjtcbiAgICB0aGlzLm5nMkluamVjdG9yID0gbmdNb2R1bGVSZWYuaW5qZWN0b3I7XG4gICAgdGhpcy5uZzFJbmplY3RvciA9IG5nMUluamVjdG9yO1xuICAgIHRoaXMubmcxUm9vdFNjb3BlID0gbmcxSW5qZWN0b3IuZ2V0KCRST09UX1NDT1BFKTtcbiAgICB0aGlzLl9yZWFkeUZuICYmIHRoaXMuX3JlYWR5Rm4odGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGljaCBpcyBub3RpZmllZCB1cG9uIHN1Y2Nlc3NmdWwgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXJcbiAgICogYXBwbGljYXRpb24gaGFzIGJlZW4gYm9vdHN0cmFwcGVkLlxuICAgKlxuICAgKiBUaGUgYHJlYWR5YCBjYWxsYmFjayBmdW5jdGlvbiBpcyBpbnZva2VkIGluc2lkZSB0aGUgQW5ndWxhciB6b25lLCB0aGVyZWZvcmUgaXQgZG9lcyBub3RcbiAgICogcmVxdWlyZSBhIGNhbGwgdG8gYCRhcHBseSgpYC5cbiAgICovXG4gIHB1YmxpYyByZWFkeShmbjogKHVwZ3JhZGVBZGFwdGVyUmVmOiBVcGdyYWRlQWRhcHRlclJlZikgPT4gdm9pZCkge1xuICAgIHRoaXMuX3JlYWR5Rm4gPSBmbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlIG9mIHJ1bm5pbmcgaHlicmlkIEFuZ3VsYXJKUyAvIEFuZ3VsYXIgYXBwbGljYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZGlzcG9zZSgpIHtcbiAgICB0aGlzLm5nMUluamVjdG9yIS5nZXQoJFJPT1RfU0NPUEUpLiRkZXN0cm95KCk7XG4gICAgdGhpcy5uZzJNb2R1bGVSZWYhLmRlc3Ryb3koKTtcbiAgfVxufVxuIl19