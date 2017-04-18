/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Type } from '@angular/core';
import * as angular from '../common/angular1';
export declare class UpgradeNg1ComponentAdapterBuilder {
    name: string;
    type: Type<any>;
    inputs: string[];
    inputsRename: string[];
    outputs: string[];
    outputsRename: string[];
    propertyOutputs: string[];
    checkProperties: string[];
    propertyMap: {
        [name: string]: string;
    };
    linkFn: angular.ILinkFn | null;
    directive: angular.IDirective | null;
    $controller: angular.IControllerService | null;
    constructor(name: string);
    extractDirective(injector: angular.IInjectorService): angular.IDirective;
    private notSupported(feature);
    extractBindings(): void;
    compileTemplate(compile: angular.ICompileService, templateCache: angular.ITemplateCacheService, httpBackend: angular.IHttpBackendService): Promise<angular.ILinkFn> | null;
    /**
     * Upgrade ng1 components into Angular.
     */
    static resolve(exportedComponents: {
        [name: string]: UpgradeNg1ComponentAdapterBuilder;
    }, injector: angular.IInjectorService): Promise<angular.ILinkFn[]>;
}
