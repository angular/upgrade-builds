/**
 * @license Angular v21.0.0-rc.0+sha-a4fe078
 * (c) 2010-2025 Google LLC. https://angular.dev/
 * License: MIT
 */

import * as i0 from '@angular/core';
import { NgModule, Injector } from '@angular/core';
import { $INJECTOR, module_, UPGRADE_APP_TYPE_KEY, INJECTOR_KEY, injector as injector$1 } from './_constants-chunk.mjs';
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
  static ɵfac = i0.ɵɵngDeclareFactory({
    minVersion: "12.0.0",
    version: "21.0.0-rc.0+sha-a4fe078",
    ngImport: i0,
    type: AngularTestingModule,
    deps: [{
      token: i0.Injector
    }],
    target: i0.ɵɵFactoryTarget.NgModule
  });
  static ɵmod = i0.ɵɵngDeclareNgModule({
    minVersion: "14.0.0",
    version: "21.0.0-rc.0+sha-a4fe078",
    ngImport: i0,
    type: AngularTestingModule
  });
  static ɵinj = i0.ɵɵngDeclareInjector({
    minVersion: "12.0.0",
    version: "21.0.0-rc.0+sha-a4fe078",
    ngImport: i0,
    type: AngularTestingModule,
    providers: [{
      provide: $INJECTOR,
      useFactory: $injectorFactory
    }]
  });
}
i0.ɵɵngDeclareClassMetadata({
  minVersion: "12.0.0",
  version: "21.0.0-rc.0+sha-a4fe078",
  ngImport: i0,
  type: AngularTestingModule,
  decorators: [{
    type: NgModule,
    args: [{
      providers: [{
        provide: $INJECTOR,
        useFactory: $injectorFactory
      }]
    }]
  }],
  ctorParameters: () => [{
    type: i0.Injector
  }]
});
function createAngularTestingModule(angularJSModules, strictDi) {
  module_('$$angularJSTestingModule', angularJSModules).constant(UPGRADE_APP_TYPE_KEY, 2).factory(INJECTOR_KEY, () => injector);
  $injector = injector$1(['ng', '$$angularJSTestingModule'], strictDi);
  return AngularTestingModule;
}

function createAngularJSTestingModule(angularModules) {
  return module_('$$angularJSTestingModule', []).constant(UPGRADE_APP_TYPE_KEY, 2).factory(INJECTOR_KEY, [$INJECTOR, $injector => {
    TestBed.configureTestingModule({
      imports: angularModules,
      providers: [{
        provide: $INJECTOR,
        useValue: $injector
      }]
    });
    return TestBed.inject(Injector);
  }]).name;
}

export { createAngularJSTestingModule, createAngularTestingModule };
//# sourceMappingURL=static-testing.mjs.map
