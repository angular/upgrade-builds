/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactory, Injector } from '@angular/core';
import * as angular from './angular1';
import { ComponentInfo } from './component_info';
export declare class DowngradeComponentAdapter {
    private id;
    private info;
    private element;
    private attrs;
    private scope;
    private ngModel;
    private parentInjector;
    private $injector;
    private $compile;
    private $parse;
    private componentFactory;
    private inputChangeCount;
    private inputChanges;
    private componentScope;
    private componentRef;
    private component;
    private changeDetector;
    constructor(id: string, info: ComponentInfo, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, scope: angular.IScope, ngModel: angular.INgModelController, parentInjector: Injector, $injector: angular.IInjectorService, $compile: angular.ICompileService, $parse: angular.IParseService, componentFactory: ComponentFactory<any>);
    compileContents(): Node[][];
    createComponent(projectableNodes: Node[][]): void;
    setupInputs(): void;
    setupOutputs(): void;
    registerCleanup(): void;
    getInjector(): Injector;
}
