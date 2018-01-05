/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactory, Injector } from '@angular/core';
import * as angular from './angular1';
export declare class DowngradeComponentAdapter {
    private element;
    private attrs;
    private scope;
    private ngModel;
    private parentInjector;
    private $injector;
    private $compile;
    private $parse;
    private componentFactory;
    private wrapCallback;
    private implementsOnChanges;
    private inputChangeCount;
    private inputChanges;
    private componentScope;
    private componentRef;
    private component;
    private changeDetector;
    constructor(element: angular.IAugmentedJQuery, attrs: angular.IAttributes, scope: angular.IScope, ngModel: angular.INgModelController, parentInjector: Injector, $injector: angular.IInjectorService, $compile: angular.ICompileService, $parse: angular.IParseService, componentFactory: ComponentFactory<any>, wrapCallback: <T>(cb: () => T) => () => T);
    compileContents(): Node[][];
    createComponent(projectableNodes: Node[][]): void;
    setupInputs(needsNgZone: boolean, propagateDigest?: boolean): void;
    setupOutputs(): void;
    registerCleanup(): void;
    getInjector(): Injector;
    private updateInput(prop, prevValue, currValue);
    groupProjectableNodes(): Node[][];
}
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 */
export declare function groupNodesBySelector(ngContentSelectors: string[], nodes: Node[]): Node[][];
