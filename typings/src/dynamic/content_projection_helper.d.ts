import { Type } from '@angular/core';
import * as angular from '../common/angular1';
import { ContentProjectionHelper } from '../common/content_projection_helper';
export declare class DynamicContentProjectionHelper extends ContentProjectionHelper {
    groupProjectableNodes($injector: angular.IInjectorService, component: Type<any>, nodes: Node[]): Node[][];
    /**
     * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
     */
    groupNodesBySelector(ngContentSelectors: string[], nodes: Node[]): Node[][];
}
