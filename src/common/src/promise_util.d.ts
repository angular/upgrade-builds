/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export interface Thenable<T> {
    then(callback: (value: T) => any): any;
}
export declare function isThenable<T>(obj: unknown): obj is Thenable<T>;
/**
 * Synchronous, promise-like object.
 */
export declare class SyncPromise<T> {
    protected value: T | undefined;
    private resolved;
    private callbacks;
    static all<T>(valuesOrPromises: (T | Thenable<T>)[]): SyncPromise<T[]>;
    resolve(value: T): void;
    then(callback: (value: T) => unknown): void;
}
