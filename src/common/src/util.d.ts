/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, Type } from '@angular/core';
import { IInjectorService, INgModelController } from './angular1';
export declare function onError(e: any): void;
/**
 * Clean the jqLite/jQuery data on the element and all its descendants.
 * Equivalent to how jqLite/jQuery invoke `cleanData()` on an Element when removed:
 *   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/jqLite.js#L349-L355
 *   https://github.com/jquery/jquery/blob/6984d1747623dbc5e87fd6c261a5b6b1628c107c/src/manipulation.js#L182
 *
 * NOTE:
 * `cleanData()` will also invoke the AngularJS `$destroy` DOM event on the element:
 *   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/Angular.js#L1932-L1945
 *
 * @param node The DOM node whose data needs to be cleaned.
 */
export declare function cleanData(node: Node): void;
export declare function controllerKey(name: string): string;
/**
 * Destroy an AngularJS app given the app `$injector`.
 *
 * NOTE: Destroying an app is not officially supported by AngularJS, but try to do our best by
 *       destroying `$rootScope` and clean the jqLite/jQuery data on `$rootElement` and all
 *       descendants.
 *
 * @param $injector The `$injector` of the AngularJS app to destroy.
 */
export declare function destroyApp($injector: IInjectorService): void;
export declare function directiveNormalize(name: string): string;
export declare function getTypeName(type: Type<any>): string;
export declare function getDowngradedModuleCount($injector: IInjectorService): number;
export declare function getUpgradeAppType($injector: IInjectorService): UpgradeAppType;
export declare function isFunction(value: any): value is Function;
export declare function validateInjectionKey($injector: IInjectorService, downgradedModule: string, injectionKey: string, attemptedAction: string): void;
export declare class Deferred<R> {
    promise: Promise<R>;
    resolve: (value: R | PromiseLike<R>) => void;
    reject: (error?: any) => void;
    constructor();
}
export interface LazyModuleRef {
    injector?: Injector;
    promise?: Promise<Injector>;
}
export declare const enum UpgradeAppType {
    None = 0,
    Dynamic = 1,
    Static = 2,
    Lite = 3
}
/**
 * Glue the AngularJS `NgModelController` (if it exists) to the component
 * (if it implements the needed subset of the `ControlValueAccessor` interface).
 */
export declare function hookupNgModel(ngModel: INgModelController, component: any): void;
/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export declare function strictEquals(val1: any, val2: any): boolean;
