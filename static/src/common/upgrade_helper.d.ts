/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, Injector, SimpleChanges } from '@angular/core';
import * as angular from './angular1';
export declare const REQUIRE_PREFIX_RE: RegExp;
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
    private readonly $templateCache;
    constructor(injector: Injector, name: string, elementRef: ElementRef);
    buildController(controllerType: angular.IController, $scope: angular.IScope): any;
    compileTemplate(): angular.ILinkFn;
    getDirective(): angular.IDirective;
    prepareTransclusion(): angular.ILinkFn | undefined;
    resolveRequire(require: angular.DirectiveRequireProperty): angular.SingleOrListOrMap<IControllerInstance> | null;
    private compileHtml(html);
    private extractChildNodes();
    private getOrCall<T>(property);
    private notSupported(feature);
}
