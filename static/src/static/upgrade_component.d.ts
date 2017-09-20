/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DoCheck, ElementRef, Injector, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
/**
 * @whatItDoes
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allows an AngularJS component to be used from Angular.
 *
 * @howToUse
 *
 * Let's assume that you have an AngularJS component called `ng1Hero` that needs
 * to be made available in Angular templates.
 *
 * {@example upgrade/static/ts/module.ts region="ng1-hero"}
 *
 * We must create a {@link Directive} that will make this AngularJS component
 * available inside Angular templates.
 *
 * {@example upgrade/static/ts/module.ts region="ng1-hero-wrapper"}
 *
 * In this example you can see that we must derive from the {@link UpgradeComponent}
 * base class but also provide an {@link Directive `@Directive`} decorator. This is
 * because the AoT compiler requires that this information is statically available at
 * compile time.
 *
 * Note that we must do the following:
 * * specify the directive's selector (`ng1-hero`)
 * * specify all inputs and outputs that the AngularJS component expects
 * * derive from `UpgradeComponent`
 * * call the base class from the constructor, passing
 *   * the AngularJS name of the component (`ng1Hero`)
 *   * the {@link ElementRef} and {@link Injector} for the component wrapper
 *
 * @description
 *
 * A helper class that should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
 * @experimental
 */
export declare class UpgradeComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
    private name;
    private elementRef;
    private injector;
    private helper;
    private $injector;
    private element;
    private $element;
    private $componentScope;
    private directive;
    private bindings;
    private controllerInstance;
    private bindingDestination;
    private pendingChanges;
    private unregisterDoCheckWatcher;
    /**
     * Create a new `UpgradeComponent` instance. You should not normally need to do this.
     * Instead you should derive a new class from this one and call the super constructor
     * from the base class.
     *
     * {@example upgrade/static/ts/module.ts region="ng1-hero-wrapper" }
     *
     * * The `name` parameter should be the name of the AngularJS directive.
     * * The `elementRef` and `injector` parameters should be acquired from Angular by dependency
     *   injection into the base class constructor.
     *
     * Note that we must manually implement lifecycle hooks that call through to the super class.
     * This is because, at the moment, the AoT compiler is not able to tell that the
     * `UpgradeComponent`
     * already implements them and so does not wire up calls to them at runtime.
     */
    constructor(name: string, elementRef: ElementRef, injector: Injector);
    ngOnInit(): void;
    ngOnChanges(changes: SimpleChanges): void;
    ngDoCheck(): void;
    ngOnDestroy(): void;
    private initializeBindings(directive);
    private initializeOutputs();
    private bindOutputs();
    private forwardChanges(changes);
}
