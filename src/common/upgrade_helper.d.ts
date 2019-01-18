/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, Injector, SimpleChanges } from '@angular/core';
import * as angular from './angular1';
export interface IBindingDestination {
    [key: string]: any;
    $onChanges?: (changes: SimpleChanges) => void;
}
export interface IControllerInstance extends IBindingDestination {
    $doCheck?: () => void;
    $onDestroy?: () => void;
    $onInit?: () => void;
    $postLink?: () => void;
}
export declare class UpgradeHelper {
    private injector;
    private name;
    readonly $injector: angular.IInjectorService;
    readonly element: Element;
    readonly $element: angular.IAugmentedJQuery;
    readonly directive: angular.IDirective;
    private readonly $compile;
    private readonly $controller;
    constructor(injector: Injector, name: string, elementRef: ElementRef, directive?: angular.IDirective);
    static getDirective($injector: angular.IInjectorService, name: string): angular.IDirective;
    static getTemplate($injector: angular.IInjectorService, directive: angular.IDirective, fetchRemoteTemplate?: boolean): string | Promise<string>;
    buildController(controllerType: angular.IController, $scope: angular.IScope): any;
    compileTemplate(template?: string): angular.ILinkFn;
    onDestroy($scope: angular.IScope, controllerInstance?: any): void;
    prepareTransclusion(): angular.ILinkFn | undefined;
    resolveAndBindRequiredControllers(controllerInstance: IControllerInstance | null): IControllerInstance | {
        [key: string]: IControllerInstance;
    } | IControllerInstance[] | null;
    private compileHtml;
    private extractChildNodes;
    private getDirectiveRequire;
    private resolveRequire;
}
