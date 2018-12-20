/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, Type } from '@angular/core';
import * as angular from './angular1';
export declare function onError(e: any): void;
export declare function controllerKey(name: string): string;
export declare function directiveNormalize(name: string): string;
export declare function getTypeName(type: Type<any>): string;
export declare function getDowngradedModuleCount($injector: angular.IInjectorService): number;
export declare function getUpgradeAppType($injector: angular.IInjectorService): UpgradeAppType;
export declare function isFunction(value: any): value is Function;
export declare function validateInjectionKey($injector: angular.IInjectorService, downgradedModule: string, injectionKey: string, attemptedAction: string): void;
export declare class Deferred<R> {
    promise: Promise<R>;
    resolve: (value?: R | PromiseLike<R>) => void;
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
export declare function hookupNgModel(ngModel: angular.INgModelController, component: any): void;
/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export declare function strictEquals(val1: any, val2: any): boolean;
