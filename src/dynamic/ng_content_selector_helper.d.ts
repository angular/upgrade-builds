/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Compiler } from '@angular/core';
import { ComponentInfo } from '../common/component_info';
import { NgContentSelectorHelper } from '../common/ng_content_selector_helper';
/**
 * See `NgContentSelectorHelper` for more information about this class.
 */
export declare class DynamicNgContentSelectorHelper extends NgContentSelectorHelper {
    private compiler;
    constructor(compiler: Compiler);
    getNgContentSelectors(info: ComponentInfo): string[];
}
