/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Type } from '@angular/core';
import * as angular from './angular1';
export declare function onError(e: any): void;
export declare function controllerKey(name: string): string;
export declare function getAttributesAsArray(node: Node): [string, string][];
export declare function getComponentName(component: Type<any>): string;
export declare class Deferred<R> {
    promise: Promise<R>;
    resolve: (value?: R | PromiseLike<R>) => void;
    reject: (error?: any) => void;
    constructor();
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
