/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactory, Injector } from '@angular/core';
import { IAttributes, IAugmentedJQuery, ICompileService, IInjectorService, INgModelController, IParseService, IScope } from './angular1';
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
    private viewChangeDetector;
    constructor(element: IAugmentedJQuery, attrs: IAttributes, scope: IScope, ngModel: INgModelController, parentInjector: Injector, $injector: IInjectorService, $compile: ICompileService, $parse: IParseService, componentFactory: ComponentFactory<any>, wrapCallback: <T>(cb: () => T) => () => T);
    compileContents(): Node[][];
    createComponent(projectableNodes: Node[][]): void;
    setupInputs(manuallyAttachView: boolean, propagateDigest?: boolean): void;
    setupOutputs(): void;
    private subscribeToOutput;
    registerCleanup(): void;
    getInjector(): Injector;
    private updateInput;
    groupProjectableNodes(): Node[][];
}
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 */
export declare function groupNodesBySelector(ngContentSelectors: string[], nodes: Node[]): Node[][];
