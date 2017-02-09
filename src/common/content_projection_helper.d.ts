/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Type } from '@angular/core';
import * as angular from './angular1';
export declare class ContentProjectionHelper {
    groupProjectableNodes($injector: angular.IInjectorService, component: Type<any>, nodes: Node[]): Node[][];
}
