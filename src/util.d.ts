/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as angular from './angular_js';
export declare function onError(e: any): void;
export declare function controllerKey(name: string): string;
export declare function getAttributesAsArray(node: Node): [string, string][];
export declare class Deferred<R> {
    promise: Promise<R>;
    resolve: (value?: R | PromiseLike<R>) => void;
    reject: (error?: any) => void;
    constructor();
}
/**
 * Glue the AngularJS ngModelController if it exists to the component if it
 * implements the needed subset of ControlValueAccessor.
 */
export declare function hookupNgModel(ngModel: angular.INgModelController, component: any): void;
