/**
 * @license Angular v20.0.0-next.5+sha-0ae1889
 * (c) 2010-2025 Google LLC. https://angular.io/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { NgModule, Injector } from '@angular/core';
import { module_, UPGRADE_APP_TYPE_KEY, INJECTOR_KEY, injector as injector$1, $INJECTOR } from '../constants-nqBIph3y.mjs';
import { TestBed } from '@angular/core/testing';

let $injector = null;
let injector;
function $injectorFactory() {
    return $injector;
}
class AngularTestingModule {
    constructor(i) {
        injector = i;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.0-next.5+sha-0ae1889", ngImport: i0, type: AngularTestingModule, deps: [{ token: i0.Injector }], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "20.0.0-next.5+sha-0ae1889", ngImport: i0, type: AngularTestingModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "20.0.0-next.5+sha-0ae1889", ngImport: i0, type: AngularTestingModule, providers: [{ provide: $INJECTOR, useFactory: $injectorFactory }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.0-next.5+sha-0ae1889", ngImport: i0, type: AngularTestingModule, decorators: [{
            type: NgModule,
            args: [{ providers: [{ provide: $INJECTOR, useFactory: $injectorFactory }] }]
        }], ctorParameters: () => [{ type: i0.Injector }] });
/**
 * A helper function to use when unit testing Angular services that depend upon upgraded AngularJS
 * services.
 *
 * This function returns an `NgModule` decorated class that is configured to wire up the Angular
 * and AngularJS injectors without the need to actually bootstrap a hybrid application.
 * This makes it simpler and faster to unit test services.
 *
 * Use the returned class as an "import" when configuring the `TestBed`.
 *
 * In the following code snippet, we are configuring the TestBed with two imports.
 * The `Ng2AppModule` is the Angular part of our hybrid application and the `ng1AppModule` is the
 * AngularJS part.
 *
 * {@example upgrade/static/ts/full/module.spec.ts region='angular-setup'}
 *
 * Once this is done we can get hold of services via the Angular `Injector` as normal.
 * Services that are (or have dependencies on) an upgraded AngularJS service, will be instantiated
 * as needed by the AngularJS `$injector`.
 *
 * In the following code snippet, `HeroesService` is an Angular service that depends upon an
 * AngularJS service, `titleCase`.
 *
 * {@example upgrade/static/ts/full/module.spec.ts region='angular-spec'}
 *
 * <div class="docs-alert docs-alert-important">
 *
 * This helper is for testing services not Components.
 * For Component testing you must still bootstrap a hybrid app. See `UpgradeModule` or
 * `downgradeModule` for more information.
 *
 * </div>
 *
 * <div class="docs-alert docs-alert-important">
 *
 * The resulting configuration does not wire up AngularJS digests to Zone hooks. It is the
 * responsibility of the test writer to call `$rootScope.$apply`, as necessary, to trigger
 * AngularJS handlers of async events from Angular.
 *
 * </div>
 *
 * <div class="docs-alert docs-alert-important">
 *
 * The helper sets up global variables to hold the shared Angular and AngularJS injectors.
 *
 * * Only call this helper once per spec.
 * * Do not use `createAngularTestingModule` in the same spec as `createAngularJSTestingModule`.
 *
 * </div>
 *
 * Here is the example application and its unit tests that use `createAngularTestingModule`
 * and `createAngularJSTestingModule`.
 *
 * <code-tabs>
 *  <code-pane header="module.spec.ts" path="upgrade/static/ts/full/module.spec.ts"></code-pane>
 *  <code-pane header="module.ts" path="upgrade/static/ts/full/module.ts"></code-pane>
 * </code-tabs>
 *
 *
 * @param angularJSModules a collection of the names of AngularJS modules to include in the
 * configuration.
 * @param [strictDi] whether the AngularJS injector should have `strictDI` enabled.
 *
 * @publicApi
 */
function createAngularTestingModule(angularJSModules, strictDi) {
    module_('$$angularJSTestingModule', angularJSModules)
        .constant(UPGRADE_APP_TYPE_KEY, 2 /* UpgradeAppType.Static */)
        .factory(INJECTOR_KEY, () => injector);
    $injector = injector$1(['ng', '$$angularJSTestingModule'], strictDi);
    return AngularTestingModule;
}

/**
 * A helper function to use when unit testing AngularJS services that depend upon downgraded Angular
 * services.
 *
 * This function returns an AngularJS module that is configured to wire up the AngularJS and Angular
 * injectors without the need to actually bootstrap a hybrid application.
 * This makes it simpler and faster to unit test services.
 *
 * Use the returned AngularJS module in a call to
 * [`angular.mocks.module`](https://docs.angularjs.org/api/ngMock/function/angular.mock.module) to
 * include this module in the unit test injector.
 *
 * In the following code snippet, we are configuring the `$injector` with two modules:
 * The AngularJS `ng1AppModule`, which is the AngularJS part of our hybrid application and the
 * `Ng2AppModule`, which is the Angular part.
 *
 * {@example upgrade/static/ts/full/module.spec.ts region='angularjs-setup'}
 *
 * Once this is done we can get hold of services via the AngularJS `$injector` as normal.
 * Services that are (or have dependencies on) a downgraded Angular service, will be instantiated as
 * needed by the Angular root `Injector`.
 *
 * In the following code snippet, `heroesService` is a downgraded Angular service that we are
 * accessing from AngularJS.
 *
 * {@example upgrade/static/ts/full/module.spec.ts region='angularjs-spec'}
 *
 * <div class="docs-alert docs-alert-important">
 *
 * This helper is for testing services not components.
 * For Component testing you must still bootstrap a hybrid app. See `UpgradeModule` or
 * `downgradeModule` for more information.
 *
 * </div>
 *
 * <div class="docs-alert docs-alert-important">
 *
 * The resulting configuration does not wire up AngularJS digests to Zone hooks. It is the
 * responsibility of the test writer to call `$rootScope.$apply`, as necessary, to trigger
 * AngularJS handlers of async events from Angular.
 *
 * </div>
 *
 * <div class="docs-alert docs-alert-important">
 *
 * The helper sets up global variables to hold the shared Angular and AngularJS injectors.
 *
 * * Only call this helper once per spec.
 * * Do not use `createAngularJSTestingModule` in the same spec as `createAngularTestingModule`.
 *
 * </div>
 *
 * Here is the example application and its unit tests that use `createAngularTestingModule`
 * and `createAngularJSTestingModule`.
 *
 * <code-tabs>
 *  <code-pane header="module.spec.ts" path="upgrade/static/ts/full/module.spec.ts"></code-pane>
 *  <code-pane header="module.ts" path="upgrade/static/ts/full/module.ts"></code-pane>
 * </code-tabs>
 *
 *
 * @param angularModules a collection of Angular modules to include in the configuration.
 *
 * @publicApi
 */
function createAngularJSTestingModule(angularModules) {
    return module_('$$angularJSTestingModule', [])
        .constant(UPGRADE_APP_TYPE_KEY, 2 /* UpgradeAppType.Static */)
        .factory(INJECTOR_KEY, [
        $INJECTOR,
        ($injector) => {
            TestBed.configureTestingModule({
                imports: angularModules,
                providers: [{ provide: $INJECTOR, useValue: $injector }],
            });
            return TestBed.inject(Injector);
        },
    ]).name;
}

export { createAngularJSTestingModule, createAngularTestingModule };
//# sourceMappingURL=testing.mjs.map
