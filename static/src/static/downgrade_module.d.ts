/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModuleFactory, NgModuleRef, Provider } from '@angular/core';
/** @experimental */
export declare function downgradeModule<T>(moduleFactoryOrBootstrapFn: NgModuleFactory<T> | ((extraProviders: Provider[]) => Promise<NgModuleRef<T>>)): string;
