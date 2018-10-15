/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector } from '@angular/core';
export declare class NgAdapterInjector implements Injector {
    private modInjector;
    constructor(modInjector: Injector);
    get(token: any, notFoundValue?: any): any;
}
