/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { IInjectorService } from '../common/angular1';
export declare function setTempInjectorRef(injector: IInjectorService): void;
export declare function injectorFactory(): IInjectorService;
export declare function rootScopeFactory(i: IInjectorService): any;
export declare function compileFactory(i: IInjectorService): any;
export declare function parseFactory(i: IInjectorService): any;
export declare const angular1Providers: {
    provide: string;
    useFactory: typeof rootScopeFactory;
    deps: string[];
}[];
