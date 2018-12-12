/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, ɵlooseIdentical as looseIdentical } from '@angular/core';
import { $SCOPE } from '../common/constants';
import { UpgradeHelper } from '../common/upgrade_helper';
import { isFunction } from '../common/util';
/** @type {?} */
const NOT_SUPPORTED = 'NOT_SUPPORTED';
/** @type {?} */
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
class Bindings {
    constructor() {
        this.twoWayBoundProperties = [];
        this.twoWayBoundLastValues = [];
        this.expressionBoundProperties = [];
        this.propertyToOutputMap = {};
    }
}
if (false) {
    /** @type {?} */
    Bindings.prototype.twoWayBoundProperties;
    /** @type {?} */
    Bindings.prototype.twoWayBoundLastValues;
    /** @type {?} */
    Bindings.prototype.expressionBoundProperties;
    /** @type {?} */
    Bindings.prototype.propertyToOutputMap;
}
/**
 * \@description
 *
 * A helper class that allows an AngularJS component to be used from Angular.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation.*
 *
 * This helper class should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
 * \@usageNotes
 * ### Examples
 *
 * Let's assume that you have an AngularJS component called `ng1Hero` that needs
 * to be made available in Angular templates.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng1-hero"}
 *
 * We must create a `Directive` that will make this AngularJS component
 * available inside Angular templates.
 *
 * {\@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper"}
 *
 * In this example you can see that we must derive from the `UpgradeComponent`
 * base class but also provide an {\@link Directive `\@Directive`} decorator. This is
 * because the AoT compiler requires that this information is statically available at
 * compile time.
 *
 * Note that we must do the following:
 * * specify the directive's selector (`ng1-hero`)
 * * specify all inputs and outputs that the AngularJS component expects
 * * derive from `UpgradeComponent`
 * * call the base class from the constructor, passing
 *   * the AngularJS name of the component (`ng1Hero`)
 *   * the `ElementRef` and `Injector` for the component wrapper
 *
 * \@publicApi
 */
export class UpgradeComponent {
    /**
     * Create a new `UpgradeComponent` instance. You should not normally need to do this.
     * Instead you should derive a new class from this one and call the super constructor
     * from the base class.
     *
     * {\@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper" }
     *
     * * The `name` parameter should be the name of the AngularJS directive.
     * * The `elementRef` and `injector` parameters should be acquired from Angular by dependency
     *   injection into the base class constructor.
     * @param {?} name
     * @param {?} elementRef
     * @param {?} injector
     */
    constructor(name, elementRef, injector) {
        this.name = name;
        this.elementRef = elementRef;
        this.injector = injector;
        this.helper = new UpgradeHelper(injector, name, elementRef);
        this.$injector = this.helper.$injector;
        this.element = this.helper.element;
        this.$element = this.helper.$element;
        this.directive = this.helper.directive;
        this.bindings = this.initializeBindings(this.directive);
        // We ask for the AngularJS scope from the Angular injector, since
        // we will put the new component scope onto the new injector for each component
        /** @type {?} */
        const $parentScope = injector.get($SCOPE);
        // QUESTION 1: Should we create an isolated scope if the scope is only true?
        // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
        this.$componentScope = $parentScope.$new(!!this.directive.scope);
        this.initializeOutputs();
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        // Collect contents, insert and compile template
        /** @type {?} */
        const attachChildNodes = this.helper.prepareTransclusion();
        /** @type {?} */
        const linkFn = this.helper.compileTemplate();
        // Instantiate controller
        /** @type {?} */
        const controllerType = this.directive.controller;
        /** @type {?} */
        const bindToController = this.directive.bindToController;
        if (controllerType) {
            this.controllerInstance = this.helper.buildController(controllerType, this.$componentScope);
        }
        else if (bindToController) {
            throw new Error(`Upgraded directive '${this.directive.name}' specifies 'bindToController' but no controller.`);
        }
        // Set up outputs
        this.bindingDestination = bindToController ? this.controllerInstance : this.$componentScope;
        this.bindOutputs();
        // Require other controllers
        /** @type {?} */
        const requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
        // Hook: $onChanges
        if (this.pendingChanges) {
            this.forwardChanges(this.pendingChanges);
            this.pendingChanges = null;
        }
        // Hook: $onInit
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        // Hook: $doCheck
        if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
            /** @type {?} */
            const callDoCheck = () => (/** @type {?} */ (this.controllerInstance.$doCheck))();
            this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
            callDoCheck();
        }
        // Linking
        /** @type {?} */
        const link = this.directive.link;
        /** @type {?} */
        const preLink = (typeof link == 'object') && ((/** @type {?} */ (link))).pre;
        /** @type {?} */
        const postLink = (typeof link == 'object') ? ((/** @type {?} */ (link))).post : link;
        /** @type {?} */
        const attrs = NOT_SUPPORTED;
        /** @type {?} */
        const transcludeFn = NOT_SUPPORTED;
        if (preLink) {
            preLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        linkFn(this.$componentScope, (/** @type {?} */ (null)), { parentBoundTranscludeFn: attachChildNodes });
        if (postLink) {
            postLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        // Hook: $postLink
        if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
            this.controllerInstance.$postLink();
        }
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    ngOnChanges(changes) {
        if (!this.bindingDestination) {
            this.pendingChanges = changes;
        }
        else {
            this.forwardChanges(changes);
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        /** @type {?} */
        const twoWayBoundProperties = this.bindings.twoWayBoundProperties;
        /** @type {?} */
        const twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
        /** @type {?} */
        const propertyToOutputMap = this.bindings.propertyToOutputMap;
        twoWayBoundProperties.forEach((propName, idx) => {
            /** @type {?} */
            const newValue = this.bindingDestination[propName];
            /** @type {?} */
            const oldValue = twoWayBoundLastValues[idx];
            if (!looseIdentical(newValue, oldValue)) {
                /** @type {?} */
                const outputName = propertyToOutputMap[propName];
                /** @type {?} */
                const eventEmitter = ((/** @type {?} */ (this)))[outputName];
                eventEmitter.emit(newValue);
                twoWayBoundLastValues[idx] = newValue;
            }
        });
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (isFunction(this.unregisterDoCheckWatcher)) {
            this.unregisterDoCheckWatcher();
        }
        this.helper.onDestroy(this.$componentScope, this.controllerInstance);
    }
    /**
     * @param {?} directive
     * @return {?}
     */
    initializeBindings(directive) {
        /** @type {?} */
        const btcIsObject = typeof directive.bindToController === 'object';
        if (btcIsObject && Object.keys((/** @type {?} */ (directive.scope))).length) {
            throw new Error(`Binding definitions on scope and controller at the same time is not supported.`);
        }
        /** @type {?} */
        const context = (btcIsObject) ? directive.bindToController : directive.scope;
        /** @type {?} */
        const bindings = new Bindings();
        if (typeof context == 'object') {
            Object.keys(context).forEach(propName => {
                /** @type {?} */
                const definition = context[propName];
                /** @type {?} */
                const bindingType = definition.charAt(0);
                // QUESTION: What about `=*`? Ignore? Throw? Support?
                switch (bindingType) {
                    case '@':
                    case '<':
                        // We don't need to do anything special. They will be defined as inputs on the
                        // upgraded component facade and the change propagation will be handled by
                        // `ngOnChanges()`.
                        break;
                    case '=':
                        bindings.twoWayBoundProperties.push(propName);
                        bindings.twoWayBoundLastValues.push(INITIAL_VALUE);
                        bindings.propertyToOutputMap[propName] = propName + 'Change';
                        break;
                    case '&':
                        bindings.expressionBoundProperties.push(propName);
                        bindings.propertyToOutputMap[propName] = propName;
                        break;
                    default:
                        /** @type {?} */
                        let json = JSON.stringify(context);
                        throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
                }
            });
        }
        return bindings;
    }
    /**
     * @return {?}
     */
    initializeOutputs() {
        // Initialize the outputs for `=` and `&` bindings
        this.bindings.twoWayBoundProperties.concat(this.bindings.expressionBoundProperties)
            .forEach(propName => {
            /** @type {?} */
            const outputName = this.bindings.propertyToOutputMap[propName];
            ((/** @type {?} */ (this)))[outputName] = new EventEmitter();
        });
    }
    /**
     * @return {?}
     */
    bindOutputs() {
        // Bind `&` bindings to the corresponding outputs
        this.bindings.expressionBoundProperties.forEach(propName => {
            /** @type {?} */
            const outputName = this.bindings.propertyToOutputMap[propName];
            /** @type {?} */
            const emitter = ((/** @type {?} */ (this)))[outputName];
            this.bindingDestination[propName] = (value) => emitter.emit(value);
        });
    }
    /**
     * @param {?} changes
     * @return {?}
     */
    forwardChanges(changes) {
        // Forward input changes to `bindingDestination`
        Object.keys(changes).forEach(propName => this.bindingDestination[propName] = changes[propName].currentValue);
        if (isFunction(this.bindingDestination.$onChanges)) {
            this.bindingDestination.$onChanges(changes);
        }
    }
}
if (false) {
    /** @type {?} */
    UpgradeComponent.prototype.helper;
    /** @type {?} */
    UpgradeComponent.prototype.$injector;
    /** @type {?} */
    UpgradeComponent.prototype.element;
    /** @type {?} */
    UpgradeComponent.prototype.$element;
    /** @type {?} */
    UpgradeComponent.prototype.$componentScope;
    /** @type {?} */
    UpgradeComponent.prototype.directive;
    /** @type {?} */
    UpgradeComponent.prototype.bindings;
    /** @type {?} */
    UpgradeComponent.prototype.controllerInstance;
    /** @type {?} */
    UpgradeComponent.prototype.bindingDestination;
    /** @type {?} */
    UpgradeComponent.prototype.pendingChanges;
    /** @type {?} */
    UpgradeComponent.prototype.unregisterDoCheckWatcher;
    /** @type {?} */
    UpgradeComponent.prototype.name;
    /** @type {?} */
    UpgradeComponent.prototype.elementRef;
    /** @type {?} */
    UpgradeComponent.prototype.injector;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy91cGdyYWRlL3N0YXRpYy9zcmMvc3RhdGljL3VwZ3JhZGVfY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxFQUFzQixZQUFZLEVBQXlELGVBQWUsSUFBSSxjQUFjLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFMUosT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBMkMsYUFBYSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFDakcsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGdCQUFnQixDQUFDOztNQUVwQyxhQUFhLEdBQVEsZUFBZTs7TUFDcEMsYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEI7QUFFRCxNQUFNLFFBQVE7SUFBZDtRQUNFLDBCQUFxQixHQUFhLEVBQUUsQ0FBQztRQUNyQywwQkFBcUIsR0FBVSxFQUFFLENBQUM7UUFFbEMsOEJBQXlCLEdBQWEsRUFBRSxDQUFDO1FBRXpDLHdCQUFtQixHQUFpQyxFQUFFLENBQUM7SUFDekQsQ0FBQztDQUFBOzs7SUFOQyx5Q0FBcUM7O0lBQ3JDLHlDQUFrQzs7SUFFbEMsNkNBQXlDOztJQUV6Qyx1Q0FBdUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEN6RCxNQUFNLE9BQU8sZ0JBQWdCOzs7Ozs7Ozs7Ozs7Ozs7SUFxQzNCLFlBQW9CLElBQVksRUFBVSxVQUFzQixFQUFVLFFBQWtCO1FBQXhFLFNBQUksR0FBSixJQUFJLENBQVE7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUMxRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFNUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUV2QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFFckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Ozs7Y0FJbEQsWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ3pDLDRFQUE0RTtRQUM1RSw2RkFBNkY7UUFDN0YsSUFBSSxDQUFDLGVBQWUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWpFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzNCLENBQUM7Ozs7SUFFRCxRQUFROzs7Y0FFQSxnQkFBZ0IsR0FBOEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRTs7Y0FDL0UsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFOzs7Y0FHdEMsY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVTs7Y0FDMUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0I7UUFDeEQsSUFBSSxjQUFjLEVBQUU7WUFDbEIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7U0FDN0Y7YUFBTSxJQUFJLGdCQUFnQixFQUFFO1lBQzNCLE1BQU0sSUFBSSxLQUFLLENBQ1gsdUJBQXVCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxtREFBbUQsQ0FBQyxDQUFDO1NBQ3BHO1FBRUQsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQzVGLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7O2NBR2IsbUJBQW1CLEdBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBRTFFLG1CQUFtQjtRQUNuQixJQUFJLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDdkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7U0FDNUI7UUFFRCxnQkFBZ0I7UUFDaEIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMxRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDbkM7UUFFRCxpQkFBaUI7UUFDakIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsRUFBRTs7a0JBQ3JFLFdBQVcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxtQkFBQSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFFOUQsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNqRixXQUFXLEVBQUUsQ0FBQztTQUNmOzs7Y0FHSyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJOztjQUMxQixPQUFPLEdBQUcsQ0FBQyxPQUFPLElBQUksSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLG1CQUFBLElBQUksRUFBNkIsQ0FBQyxDQUFDLEdBQUc7O2NBQzlFLFFBQVEsR0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFBLElBQUksRUFBNkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTs7Y0FDdEYsS0FBSyxHQUF3QixhQUFhOztjQUMxQyxZQUFZLEdBQWdDLGFBQWE7UUFDL0QsSUFBSSxPQUFPLEVBQUU7WUFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBRSxtQkFBbUIsRUFBRSxZQUFZLENBQUMsQ0FBQztTQUN4RjtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLG1CQUFBLElBQUksRUFBRSxFQUFFLEVBQUMsdUJBQXVCLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQyxDQUFDO1FBRWxGLElBQUksUUFBUSxFQUFFO1lBQ1osUUFBUSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDekY7UUFFRCxrQkFBa0I7UUFDbEIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM1RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDckM7SUFDSCxDQUFDOzs7OztJQUVELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzVCLElBQUksQ0FBQyxjQUFjLEdBQUcsT0FBTyxDQUFDO1NBQy9CO2FBQU07WUFDTCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzlCO0lBQ0gsQ0FBQzs7OztJQUVELFNBQVM7O2NBQ0QscUJBQXFCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUI7O2NBQzNELHFCQUFxQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCOztjQUMzRCxtQkFBbUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQjtRQUU3RCxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEVBQUU7O2tCQUN4QyxRQUFRLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQzs7a0JBQzVDLFFBQVEsR0FBRyxxQkFBcUIsQ0FBQyxHQUFHLENBQUM7WUFFM0MsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUU7O3NCQUNqQyxVQUFVLEdBQUcsbUJBQW1CLENBQUMsUUFBUSxDQUFDOztzQkFDMUMsWUFBWSxHQUFzQixDQUFDLG1CQUFBLElBQUksRUFBTyxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUVqRSxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QixxQkFBcUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7YUFDdkM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7SUFFRCxXQUFXO1FBQ1QsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLEVBQUU7WUFDN0MsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7U0FDakM7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7Ozs7O0lBRU8sa0JBQWtCLENBQUMsU0FBNkI7O2NBQ2hELFdBQVcsR0FBRyxPQUFPLFNBQVMsQ0FBQyxnQkFBZ0IsS0FBSyxRQUFRO1FBQ2xFLElBQUksV0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQUEsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ3hELE1BQU0sSUFBSSxLQUFLLENBQ1gsZ0ZBQWdGLENBQUMsQ0FBQztTQUN2Rjs7Y0FFSyxPQUFPLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSzs7Y0FDdEUsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFO1FBRS9CLElBQUksT0FBTyxPQUFPLElBQUksUUFBUSxFQUFFO1lBQzlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFOztzQkFDaEMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7O3NCQUM5QixXQUFXLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBRXhDLHFEQUFxRDtnQkFFckQsUUFBUSxXQUFXLEVBQUU7b0JBQ25CLEtBQUssR0FBRyxDQUFDO29CQUNULEtBQUssR0FBRzt3QkFDTiw4RUFBOEU7d0JBQzlFLDBFQUEwRTt3QkFDMUUsbUJBQW1CO3dCQUNuQixNQUFNO29CQUNSLEtBQUssR0FBRzt3QkFDTixRQUFRLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUM5QyxRQUFRLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3dCQUNuRCxRQUFRLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQzt3QkFDN0QsTUFBTTtvQkFDUixLQUFLLEdBQUc7d0JBQ04sUUFBUSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDbEQsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQzt3QkFDbEQsTUFBTTtvQkFDUjs7NEJBQ00sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO3dCQUNsQyxNQUFNLElBQUksS0FBSyxDQUNYLHVCQUF1QixXQUFXLFNBQVMsSUFBSSxTQUFTLElBQUksQ0FBQyxJQUFJLGNBQWMsQ0FBQyxDQUFDO2lCQUN4RjtZQUNILENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDOzs7O0lBRU8saUJBQWlCO1FBQ3ZCLGtEQUFrRDtRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHlCQUF5QixDQUFDO2FBQzlFLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTs7a0JBQ1osVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDO1lBQzlELENBQUMsbUJBQUEsSUFBSSxFQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDO0lBQ1QsQ0FBQzs7OztJQUVPLFdBQVc7UUFDakIsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFOztrQkFDbkQsVUFBVSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDOztrQkFDeEQsT0FBTyxHQUFHLENBQUMsbUJBQUEsSUFBSSxFQUFPLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFFekMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFFLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQzs7Ozs7SUFFTyxjQUFjLENBQUMsT0FBc0I7UUFDM0MsZ0RBQWdEO1FBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUN4QixRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFcEYsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2xELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDN0M7SUFDSCxDQUFDO0NBQ0Y7OztJQW5PQyxrQ0FBOEI7O0lBRTlCLHFDQUE0Qzs7SUFFNUMsbUNBQXlCOztJQUN6QixvQ0FBMkM7O0lBQzNDLDJDQUF3Qzs7SUFFeEMscUNBQXNDOztJQUN0QyxvQ0FBMkI7O0lBRzNCLDhDQUFrRDs7SUFFbEQsOENBQWtEOztJQU1sRCwwQ0FBK0M7O0lBRy9DLG9EQUE2Qzs7SUFhakMsZ0NBQW9COztJQUFFLHNDQUE4Qjs7SUFBRSxvQ0FBMEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RG9DaGVjaywgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3RvciwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgU2ltcGxlQ2hhbmdlcywgybVsb29zZUlkZW50aWNhbCBhcyBsb29zZUlkZW50aWNhbH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge0lCaW5kaW5nRGVzdGluYXRpb24sIElDb250cm9sbGVySW5zdGFuY2UsIFVwZ3JhZGVIZWxwZXJ9IGZyb20gJy4uL2NvbW1vbi91cGdyYWRlX2hlbHBlcic7XG5pbXBvcnQge2lzRnVuY3Rpb259IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmNsYXNzIEJpbmRpbmdzIHtcbiAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICB0d29XYXlCb3VuZExhc3RWYWx1ZXM6IGFueVtdID0gW107XG5cbiAgZXhwcmVzc2lvbkJvdW5kUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblxuICBwcm9wZXJ0eVRvT3V0cHV0TWFwOiB7W3Byb3BOYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG59XG5cbi8qKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQSBoZWxwZXIgY2xhc3MgdGhhdCBhbGxvd3MgYW4gQW5ndWxhckpTIGNvbXBvbmVudCB0byBiZSB1c2VkIGZyb20gQW5ndWxhci5cbiAqXG4gKiAqUGFydCBvZiB0aGUgW3VwZ3JhZGUvc3RhdGljXShhcGk/cXVlcnk9dXBncmFkZSUyRnN0YXRpYylcbiAqIGxpYnJhcnkgZm9yIGh5YnJpZCB1cGdyYWRlIGFwcHMgdGhhdCBzdXBwb3J0IEFvVCBjb21waWxhdGlvbi4qXG4gKlxuICogVGhpcyBoZWxwZXIgY2xhc3Mgc2hvdWxkIGJlIHVzZWQgYXMgYSBiYXNlIGNsYXNzIGZvciBjcmVhdGluZyBBbmd1bGFyIGRpcmVjdGl2ZXNcbiAqIHRoYXQgd3JhcCBBbmd1bGFySlMgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgXCJ1cGdyYWRlZFwiLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiAjIyMgRXhhbXBsZXNcbiAqXG4gKiBMZXQncyBhc3N1bWUgdGhhdCB5b3UgaGF2ZSBhbiBBbmd1bGFySlMgY29tcG9uZW50IGNhbGxlZCBgbmcxSGVyb2AgdGhhdCBuZWVkc1xuICogdG8gYmUgbWFkZSBhdmFpbGFibGUgaW4gQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvXCJ9XG4gKlxuICogV2UgbXVzdCBjcmVhdGUgYSBgRGlyZWN0aXZlYCB0aGF0IHdpbGwgbWFrZSB0aGlzIEFuZ3VsYXJKUyBjb21wb25lbnRcbiAqIGF2YWlsYWJsZSBpbnNpZGUgQW5ndWxhciB0ZW1wbGF0ZXMuXG4gKlxuICoge0BleGFtcGxlIHVwZ3JhZGUvc3RhdGljL3RzL2Z1bGwvbW9kdWxlLnRzIHJlZ2lvbj1cIm5nMS1oZXJvLXdyYXBwZXJcIn1cbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUgeW91IGNhbiBzZWUgdGhhdCB3ZSBtdXN0IGRlcml2ZSBmcm9tIHRoZSBgVXBncmFkZUNvbXBvbmVudGBcbiAqIGJhc2UgY2xhc3MgYnV0IGFsc28gcHJvdmlkZSBhbiB7QGxpbmsgRGlyZWN0aXZlIGBARGlyZWN0aXZlYH0gZGVjb3JhdG9yLiBUaGlzIGlzXG4gKiBiZWNhdXNlIHRoZSBBb1QgY29tcGlsZXIgcmVxdWlyZXMgdGhhdCB0aGlzIGluZm9ybWF0aW9uIGlzIHN0YXRpY2FsbHkgYXZhaWxhYmxlIGF0XG4gKiBjb21waWxlIHRpbWUuXG4gKlxuICogTm90ZSB0aGF0IHdlIG11c3QgZG8gdGhlIGZvbGxvd2luZzpcbiAqICogc3BlY2lmeSB0aGUgZGlyZWN0aXZlJ3Mgc2VsZWN0b3IgKGBuZzEtaGVyb2ApXG4gKiAqIHNwZWNpZnkgYWxsIGlucHV0cyBhbmQgb3V0cHV0cyB0aGF0IHRoZSBBbmd1bGFySlMgY29tcG9uZW50IGV4cGVjdHNcbiAqICogZGVyaXZlIGZyb20gYFVwZ3JhZGVDb21wb25lbnRgXG4gKiAqIGNhbGwgdGhlIGJhc2UgY2xhc3MgZnJvbSB0aGUgY29uc3RydWN0b3IsIHBhc3NpbmdcbiAqICAgKiB0aGUgQW5ndWxhckpTIG5hbWUgb2YgdGhlIGNvbXBvbmVudCAoYG5nMUhlcm9gKVxuICogICAqIHRoZSBgRWxlbWVudFJlZmAgYW5kIGBJbmplY3RvcmAgZm9yIHRoZSBjb21wb25lbnQgd3JhcHBlclxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIFVwZ3JhZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjaywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBoZWxwZXI6IFVwZ3JhZGVIZWxwZXI7XG5cbiAgcHJpdmF0ZSAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZTtcblxuICBwcml2YXRlIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gIHByaXZhdGUgJGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeTtcbiAgcHJpdmF0ZSAkY29tcG9uZW50U2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xuXG4gIHByaXZhdGUgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmU7XG4gIHByaXZhdGUgYmluZGluZ3M6IEJpbmRpbmdzO1xuXG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNvbnRyb2xsZXJJbnN0YW5jZSAhOiBJQ29udHJvbGxlckluc3RhbmNlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBiaW5kaW5nRGVzdGluYXRpb24gITogSUJpbmRpbmdEZXN0aW5hdGlvbjtcblxuICAvLyBXZSB3aWxsIGJlIGluc3RhbnRpYXRpbmcgdGhlIGNvbnRyb2xsZXIgaW4gdGhlIGBuZ09uSW5pdGAgaG9vaywgd2hlbiB0aGVcbiAgLy8gZmlyc3QgYG5nT25DaGFuZ2VzYCB3aWxsIGhhdmUgYmVlbiBhbHJlYWR5IHRyaWdnZXJlZC4gV2Ugc3RvcmUgdGhlXG4gIC8vIGBTaW1wbGVDaGFuZ2VzYCBhbmQgXCJwbGF5IHRoZW0gYmFja1wiIGxhdGVyLlxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBwZW5kaW5nQ2hhbmdlcyAhOiBTaW1wbGVDaGFuZ2VzIHwgbnVsbDtcblxuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSB1bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIgITogRnVuY3Rpb247XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgVXBncmFkZUNvbXBvbmVudGAgaW5zdGFuY2UuIFlvdSBzaG91bGQgbm90IG5vcm1hbGx5IG5lZWQgdG8gZG8gdGhpcy5cbiAgICogSW5zdGVhZCB5b3Ugc2hvdWxkIGRlcml2ZSBhIG5ldyBjbGFzcyBmcm9tIHRoaXMgb25lIGFuZCBjYWxsIHRoZSBzdXBlciBjb25zdHJ1Y3RvclxuICAgKiBmcm9tIHRoZSBiYXNlIGNsYXNzLlxuICAgKlxuICAgKiB7QGV4YW1wbGUgdXBncmFkZS9zdGF0aWMvdHMvZnVsbC9tb2R1bGUudHMgcmVnaW9uPVwibmcxLWhlcm8td3JhcHBlclwiIH1cbiAgICpcbiAgICogKiBUaGUgYG5hbWVgIHBhcmFtZXRlciBzaG91bGQgYmUgdGhlIG5hbWUgb2YgdGhlIEFuZ3VsYXJKUyBkaXJlY3RpdmUuXG4gICAqICogVGhlIGBlbGVtZW50UmVmYCBhbmQgYGluamVjdG9yYCBwYXJhbWV0ZXJzIHNob3VsZCBiZSBhY3F1aXJlZCBmcm9tIEFuZ3VsYXIgYnkgZGVwZW5kZW5jeVxuICAgKiAgIGluamVjdGlvbiBpbnRvIHRoZSBiYXNlIGNsYXNzIGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuYW1lOiBzdHJpbmcsIHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgICB0aGlzLmhlbHBlciA9IG5ldyBVcGdyYWRlSGVscGVyKGluamVjdG9yLCBuYW1lLCBlbGVtZW50UmVmKTtcblxuICAgIHRoaXMuJGluamVjdG9yID0gdGhpcy5oZWxwZXIuJGluamVjdG9yO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gdGhpcy5oZWxwZXIuZWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gdGhpcy5oZWxwZXIuJGVsZW1lbnQ7XG5cbiAgICB0aGlzLmRpcmVjdGl2ZSA9IHRoaXMuaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmJpbmRpbmdzID0gdGhpcy5pbml0aWFsaXplQmluZGluZ3ModGhpcy5kaXJlY3RpdmUpO1xuXG4gICAgLy8gV2UgYXNrIGZvciB0aGUgQW5ndWxhckpTIHNjb3BlIGZyb20gdGhlIEFuZ3VsYXIgaW5qZWN0b3IsIHNpbmNlXG4gICAgLy8gd2Ugd2lsbCBwdXQgdGhlIG5ldyBjb21wb25lbnQgc2NvcGUgb250byB0aGUgbmV3IGluamVjdG9yIGZvciBlYWNoIGNvbXBvbmVudFxuICAgIGNvbnN0ICRwYXJlbnRTY29wZSA9IGluamVjdG9yLmdldCgkU0NPUEUpO1xuICAgIC8vIFFVRVNUSU9OIDE6IFNob3VsZCB3ZSBjcmVhdGUgYW4gaXNvbGF0ZWQgc2NvcGUgaWYgdGhlIHNjb3BlIGlzIG9ubHkgdHJ1ZT9cbiAgICAvLyBRVUVTVElPTiAyOiBTaG91bGQgd2UgbWFrZSB0aGUgc2NvcGUgYWNjZXNzaWJsZSB0aHJvdWdoIGAkZWxlbWVudC5zY29wZSgpL2lzb2xhdGVTY29wZSgpYD9cbiAgICB0aGlzLiRjb21wb25lbnRTY29wZSA9ICRwYXJlbnRTY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgdGhpcy5pbml0aWFsaXplT3V0cHV0cygpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gQ29sbGVjdCBjb250ZW50cywgaW5zZXJ0IGFuZCBjb21waWxlIHRlbXBsYXRlXG4gICAgY29uc3QgYXR0YWNoQ2hpbGROb2RlczogYW5ndWxhci5JTGlua0ZufHVuZGVmaW5lZCA9IHRoaXMuaGVscGVyLnByZXBhcmVUcmFuc2NsdXNpb24oKTtcbiAgICBjb25zdCBsaW5rRm4gPSB0aGlzLmhlbHBlci5jb21waWxlVGVtcGxhdGUoKTtcblxuICAgIC8vIEluc3RhbnRpYXRlIGNvbnRyb2xsZXJcbiAgICBjb25zdCBjb250cm9sbGVyVHlwZSA9IHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXI7XG4gICAgY29uc3QgYmluZFRvQ29udHJvbGxlciA9IHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXI7XG4gICAgaWYgKGNvbnRyb2xsZXJUeXBlKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA9IHRoaXMuaGVscGVyLmJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgdGhpcy4kY29tcG9uZW50U2NvcGUpO1xuICAgIH0gZWxzZSBpZiAoYmluZFRvQ29udHJvbGxlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBVcGdyYWRlZCBkaXJlY3RpdmUgJyR7dGhpcy5kaXJlY3RpdmUubmFtZX0nIHNwZWNpZmllcyAnYmluZFRvQ29udHJvbGxlcicgYnV0IG5vIGNvbnRyb2xsZXIuYCk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHVwIG91dHB1dHNcbiAgICB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbiA9IGJpbmRUb0NvbnRyb2xsZXIgPyB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA6IHRoaXMuJGNvbXBvbmVudFNjb3BlO1xuICAgIHRoaXMuYmluZE91dHB1dHMoKTtcblxuICAgIC8vIFJlcXVpcmUgb3RoZXIgY29udHJvbGxlcnNcbiAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzID1cbiAgICAgICAgdGhpcy5oZWxwZXIucmVzb2x2ZUFuZEJpbmRSZXF1aXJlZENvbnRyb2xsZXJzKHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcblxuICAgIC8vIEhvb2s6ICRvbkNoYW5nZXNcbiAgICBpZiAodGhpcy5wZW5kaW5nQ2hhbmdlcykge1xuICAgICAgdGhpcy5mb3J3YXJkQ2hhbmdlcyh0aGlzLnBlbmRpbmdDaGFuZ2VzKTtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBudWxsO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRvbkluaXRcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCgpO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRkb0NoZWNrXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2spKSB7XG4gICAgICBjb25zdCBjYWxsRG9DaGVjayA9ICgpID0+IHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrICEoKTtcblxuICAgICAgdGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIgPSB0aGlzLiRjb21wb25lbnRTY29wZS4kcGFyZW50LiR3YXRjaChjYWxsRG9DaGVjayk7XG4gICAgICBjYWxsRG9DaGVjaygpO1xuICAgIH1cblxuICAgIC8vIExpbmtpbmdcbiAgICBjb25zdCBsaW5rID0gdGhpcy5kaXJlY3RpdmUubGluaztcbiAgICBjb25zdCBwcmVMaW5rID0gKHR5cGVvZiBsaW5rID09ICdvYmplY3QnKSAmJiAobGluayBhcyBhbmd1bGFyLklEaXJlY3RpdmVQcmVQb3N0KS5wcmU7XG4gICAgY29uc3QgcG9zdExpbmsgPSAodHlwZW9mIGxpbmsgPT0gJ29iamVjdCcpID8gKGxpbmsgYXMgYW5ndWxhci5JRGlyZWN0aXZlUHJlUG9zdCkucG9zdCA6IGxpbms7XG4gICAgY29uc3QgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMgPSBOT1RfU1VQUE9SVEVEO1xuICAgIGNvbnN0IHRyYW5zY2x1ZGVGbjogYW5ndWxhci5JVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgbGlua0ZuKHRoaXMuJGNvbXBvbmVudFNjb3BlLCBudWxsICEsIHtwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbjogYXR0YWNoQ2hpbGROb2Rlc30pO1xuXG4gICAgaWYgKHBvc3RMaW5rKSB7XG4gICAgICBwb3N0TGluayh0aGlzLiRjb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJHBvc3RMaW5rXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmICghdGhpcy5iaW5kaW5nRGVzdGluYXRpb24pIHtcbiAgICAgIHRoaXMucGVuZGluZ0NoYW5nZXMgPSBjaGFuZ2VzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvcndhcmRDaGFuZ2VzKGNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBjb25zdCB0d29XYXlCb3VuZFByb3BlcnRpZXMgPSB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcztcbiAgICBjb25zdCB0d29XYXlCb3VuZExhc3RWYWx1ZXMgPSB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kTGFzdFZhbHVlcztcbiAgICBjb25zdCBwcm9wZXJ0eVRvT3V0cHV0TWFwID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwO1xuXG4gICAgdHdvV2F5Qm91bmRQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpZHgpID0+IHtcbiAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5iaW5kaW5nRGVzdGluYXRpb25bcHJvcE5hbWVdO1xuICAgICAgY29uc3Qgb2xkVmFsdWUgPSB0d29XYXlCb3VuZExhc3RWYWx1ZXNbaWR4XTtcblxuICAgICAgaWYgKCFsb29zZUlkZW50aWNhbChuZXdWYWx1ZSwgb2xkVmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSBwcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbb3V0cHV0TmFtZV07XG5cbiAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQobmV3VmFsdWUpO1xuICAgICAgICB0d29XYXlCb3VuZExhc3RWYWx1ZXNbaWR4XSA9IG5ld1ZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odGhpcy51bnJlZ2lzdGVyRG9DaGVja1dhdGNoZXIpKSB7XG4gICAgICB0aGlzLnVucmVnaXN0ZXJEb0NoZWNrV2F0Y2hlcigpO1xuICAgIH1cbiAgICB0aGlzLmhlbHBlci5vbkRlc3Ryb3kodGhpcy4kY29tcG9uZW50U2NvcGUsIHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZUJpbmRpbmdzKGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlKSB7XG4gICAgY29uc3QgYnRjSXNPYmplY3QgPSB0eXBlb2YgZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgPT09ICdvYmplY3QnO1xuICAgIGlmIChidGNJc09iamVjdCAmJiBPYmplY3Qua2V5cyhkaXJlY3RpdmUuc2NvcGUgISkubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEJpbmRpbmcgZGVmaW5pdGlvbnMgb24gc2NvcGUgYW5kIGNvbnRyb2xsZXIgYXQgdGhlIHNhbWUgdGltZSBpcyBub3Qgc3VwcG9ydGVkLmApO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRleHQgPSAoYnRjSXNPYmplY3QpID8gZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgOiBkaXJlY3RpdmUuc2NvcGU7XG4gICAgY29uc3QgYmluZGluZ3MgPSBuZXcgQmluZGluZ3MoKTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoY29udGV4dCkuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb250ZXh0W3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBkZWZpbml0aW9uLmNoYXJBdCgwKTtcblxuICAgICAgICAvLyBRVUVTVElPTjogV2hhdCBhYm91dCBgPSpgPyBJZ25vcmU/IFRocm93PyBTdXBwb3J0P1xuXG4gICAgICAgIHN3aXRjaCAoYmluZGluZ1R5cGUpIHtcbiAgICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgc3BlY2lhbC4gVGhleSB3aWxsIGJlIGRlZmluZWQgYXMgaW5wdXRzIG9uIHRoZVxuICAgICAgICAgICAgLy8gdXBncmFkZWQgY29tcG9uZW50IGZhY2FkZSBhbmQgdGhlIGNoYW5nZSBwcm9wYWdhdGlvbiB3aWxsIGJlIGhhbmRsZWQgYnlcbiAgICAgICAgICAgIC8vIGBuZ09uQ2hhbmdlcygpYC5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJz0nOlxuICAgICAgICAgICAgYmluZGluZ3MudHdvV2F5Qm91bmRQcm9wZXJ0aWVzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgICAgYmluZGluZ3MudHdvV2F5Qm91bmRMYXN0VmFsdWVzLnB1c2goSU5JVElBTF9WQUxVRSk7XG4gICAgICAgICAgICBiaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXSA9IHByb3BOYW1lICsgJ0NoYW5nZSc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgIGJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICBiaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxldCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGV4dCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgbWFwcGluZyAnJHtiaW5kaW5nVHlwZX0nIGluICcke2pzb259JyBpbiAnJHt0aGlzLm5hbWV9JyBkaXJlY3RpdmUuYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBiaW5kaW5ncztcbiAgfVxuXG4gIHByaXZhdGUgaW5pdGlhbGl6ZU91dHB1dHMoKSB7XG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgb3V0cHV0cyBmb3IgYD1gIGFuZCBgJmAgYmluZGluZ3NcbiAgICB0aGlzLmJpbmRpbmdzLnR3b1dheUJvdW5kUHJvcGVydGllcy5jb25jYXQodGhpcy5iaW5kaW5ncy5leHByZXNzaW9uQm91bmRQcm9wZXJ0aWVzKVxuICAgICAgICAuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IHRoaXMuYmluZGluZ3MucHJvcGVydHlUb091dHB1dE1hcFtwcm9wTmFtZV07XG4gICAgICAgICAgKHRoaXMgYXMgYW55KVtvdXRwdXROYW1lXSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGJpbmRPdXRwdXRzKCkge1xuICAgIC8vIEJpbmQgYCZgIGJpbmRpbmdzIHRvIHRoZSBjb3JyZXNwb25kaW5nIG91dHB1dHNcbiAgICB0aGlzLmJpbmRpbmdzLmV4cHJlc3Npb25Cb3VuZFByb3BlcnRpZXMuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICBjb25zdCBvdXRwdXROYW1lID0gdGhpcy5iaW5kaW5ncy5wcm9wZXJ0eVRvT3V0cHV0TWFwW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IGVtaXR0ZXIgPSAodGhpcyBhcyBhbnkpW291dHB1dE5hbWVdO1xuXG4gICAgICB0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbltwcm9wTmFtZV0gPSAodmFsdWU6IGFueSkgPT4gZW1pdHRlci5lbWl0KHZhbHVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZm9yd2FyZENoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIC8vIEZvcndhcmQgaW5wdXQgY2hhbmdlcyB0byBgYmluZGluZ0Rlc3RpbmF0aW9uYFxuICAgIE9iamVjdC5rZXlzKGNoYW5nZXMpLmZvckVhY2goXG4gICAgICAgIHByb3BOYW1lID0+IHRoaXMuYmluZGluZ0Rlc3RpbmF0aW9uW3Byb3BOYW1lXSA9IGNoYW5nZXNbcHJvcE5hbWVdLmN1cnJlbnRWYWx1ZSk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLmJpbmRpbmdEZXN0aW5hdGlvbi4kb25DaGFuZ2VzKSkge1xuICAgICAgdGhpcy5iaW5kaW5nRGVzdGluYXRpb24uJG9uQ2hhbmdlcyhjaGFuZ2VzKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==