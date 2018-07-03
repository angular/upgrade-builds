/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject, Injector } from '@angular/core';
import * as angular from '../common/angular1';
import { $SCOPE } from '../common/constants';
import { UpgradeHelper } from '../common/upgrade_helper';
import { isFunction, strictEquals } from '../common/util';
const /** @type {?} */ CAMEL_CASE = /([A-Z])/g;
const /** @type {?} */ INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
const /** @type {?} */ NOT_SUPPORTED = 'NOT_SUPPORTED';
export class UpgradeNg1ComponentAdapterBuilder {
    /**
     * @param {?} name
     */
    constructor(name) {
        this.name = name;
        this.inputs = [];
        this.inputsRename = [];
        this.outputs = [];
        this.outputsRename = [];
        this.propertyOutputs = [];
        this.checkProperties = [];
        this.propertyMap = {};
        this.directive = null;
        const /** @type {?} */ selector = name.replace(CAMEL_CASE, (all, next) => '-' + next.toLowerCase());
        const /** @type {?} */ self = this;
        // Note: There is a bug in TS 2.4 that prevents us from
        // inlining this into @Directive
        // TODO(tbosch): find or file a bug against TypeScript for this.
        const /** @type {?} */ directive = { selector: selector, inputs: this.inputsRename, outputs: this.outputsRename };
        class MyClass {
            /**
             * @param {?} scope
             * @param {?} injector
             * @param {?} elementRef
             */
            constructor(scope, injector, elementRef) {
                const /** @type {?} */ helper = new UpgradeHelper(injector, name, elementRef, this.directive);
                return /** @type {?} */ (new UpgradeNg1ComponentAdapter(helper, scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap));
            }
            /**
             * @return {?}
             */
            ngOnInit() {
                /* needs to be here for ng2 to properly detect it */
            }
            /**
             * @return {?}
             */
            ngOnChanges() {
                /* needs to be here for ng2 to properly detect it */
            }
            /**
             * @return {?}
             */
            ngDoCheck() {
                /* needs to be here for ng2 to properly detect it */
            }
            /**
             * @return {?}
             */
            ngOnDestroy() {
                /* needs to be here for ng2 to properly detect it */
            }
        }
        MyClass.decorators = [
            { type: Directive, args: [directive,] },
        ];
        /** @nocollapse */
        MyClass.ctorParameters = () => [
            { type: undefined, decorators: [{ type: Inject, args: [$SCOPE,] }] },
            { type: Injector },
            { type: ElementRef }
        ];
        function MyClass_tsickle_Closure_declarations() {
            /** @type {?} */
            MyClass.prototype.directive;
        }
        this.type = MyClass;
    }
    /**
     * @return {?}
     */
    extractBindings() {
        const /** @type {?} */ btcIsObject = typeof /** @type {?} */ ((this.directive)).bindToController === 'object';
        if (btcIsObject && Object.keys(/** @type {?} */ ((/** @type {?} */ ((this.directive)).scope))).length) {
            throw new Error(`Binding definitions on scope and controller at the same time are not supported.`);
        }
        const /** @type {?} */ context = (btcIsObject) ? /** @type {?} */ ((this.directive)).bindToController : /** @type {?} */ ((this.directive)).scope;
        if (typeof context == 'object') {
            Object.keys(context).forEach(propName => {
                const /** @type {?} */ definition = context[propName];
                const /** @type {?} */ bindingType = definition.charAt(0);
                const /** @type {?} */ bindingOptions = definition.charAt(1);
                const /** @type {?} */ attrName = definition.substring(bindingOptions === '?' ? 2 : 1) || propName;
                // QUESTION: What about `=*`? Ignore? Throw? Support?
                const /** @type {?} */ inputName = `input_${attrName}`;
                const /** @type {?} */ inputNameRename = `${inputName}: ${attrName}`;
                const /** @type {?} */ outputName = `output_${attrName}`;
                const /** @type {?} */ outputNameRename = `${outputName}: ${attrName}`;
                const /** @type {?} */ outputNameRenameChange = `${outputNameRename}Change`;
                switch (bindingType) {
                    case '@':
                    case '<':
                        this.inputs.push(inputName);
                        this.inputsRename.push(inputNameRename);
                        this.propertyMap[inputName] = propName;
                        break;
                    case '=':
                        this.inputs.push(inputName);
                        this.inputsRename.push(inputNameRename);
                        this.propertyMap[inputName] = propName;
                        this.outputs.push(outputName);
                        this.outputsRename.push(outputNameRenameChange);
                        this.propertyMap[outputName] = propName;
                        this.checkProperties.push(propName);
                        this.propertyOutputs.push(outputName);
                        break;
                    case '&':
                        this.outputs.push(outputName);
                        this.outputsRename.push(outputNameRename);
                        this.propertyMap[outputName] = propName;
                        break;
                    default:
                        let /** @type {?} */ json = JSON.stringify(context);
                        throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
                }
            });
        }
    }
    /**
     * Upgrade ng1 components into Angular.
     * @param {?} exportedComponents
     * @param {?} $injector
     * @return {?}
     */
    static resolve(exportedComponents, $injector) {
        const /** @type {?} */ promises = Object.keys(exportedComponents).map(name => {
            const /** @type {?} */ exportedComponent = exportedComponents[name];
            exportedComponent.directive = UpgradeHelper.getDirective($injector, name);
            exportedComponent.extractBindings();
            return Promise
                .resolve(UpgradeHelper.getTemplate($injector, exportedComponent.directive, true))
                .then(template => exportedComponent.template = template);
        });
        return Promise.all(promises);
    }
}
function UpgradeNg1ComponentAdapterBuilder_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.type;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.inputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.inputsRename;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.outputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.outputsRename;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.propertyOutputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.checkProperties;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.propertyMap;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.directive;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.template;
    /** @type {?} */
    UpgradeNg1ComponentAdapterBuilder.prototype.name;
}
class UpgradeNg1ComponentAdapter {
    /**
     * @param {?} helper
     * @param {?} scope
     * @param {?} template
     * @param {?} inputs
     * @param {?} outputs
     * @param {?} propOuts
     * @param {?} checkProperties
     * @param {?} propertyMap
     */
    constructor(helper, scope, template, inputs, outputs, propOuts, checkProperties, propertyMap) {
        this.helper = helper;
        this.template = template;
        this.inputs = inputs;
        this.outputs = outputs;
        this.propOuts = propOuts;
        this.checkProperties = checkProperties;
        this.propertyMap = propertyMap;
        this.controllerInstance = null;
        this.destinationObj = null;
        this.checkLastValues = [];
        this.$element = null;
        this.directive = helper.directive;
        this.element = helper.element;
        this.$element = helper.$element;
        this.componentScope = scope.$new(!!this.directive.scope);
        const /** @type {?} */ controllerType = this.directive.controller;
        if (this.directive.bindToController && controllerType) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
            this.destinationObj = this.controllerInstance;
        }
        else {
            this.destinationObj = this.componentScope;
        }
        for (let /** @type {?} */ i = 0; i < inputs.length; i++) {
            (/** @type {?} */ (this))[inputs[i]] = null;
        }
        for (let /** @type {?} */ j = 0; j < outputs.length; j++) {
            const /** @type {?} */ emitter = (/** @type {?} */ (this))[outputs[j]] = new EventEmitter();
            if (this.propOuts.indexOf(outputs[j]) === -1) {
                this.setComponentProperty(outputs[j], (emitter => (value) => emitter.emit(value))(emitter));
            }
        }
        for (let /** @type {?} */ k = 0; k < propOuts.length; k++) {
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        // Collect contents, insert and compile template
        const /** @type {?} */ attachChildNodes = this.helper.prepareTransclusion();
        const /** @type {?} */ linkFn = this.helper.compileTemplate(this.template);
        // Instantiate controller (if not already done so)
        const /** @type {?} */ controllerType = this.directive.controller;
        const /** @type {?} */ bindToController = this.directive.bindToController;
        if (controllerType && !bindToController) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
        }
        // Require other controllers
        const /** @type {?} */ requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
        // Hook: $onInit
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        // Linking
        const /** @type {?} */ link = this.directive.link;
        const /** @type {?} */ preLink = (typeof link == 'object') && (/** @type {?} */ (link)).pre;
        const /** @type {?} */ postLink = (typeof link == 'object') ? (/** @type {?} */ (link)).post : link;
        const /** @type {?} */ attrs = NOT_SUPPORTED;
        const /** @type {?} */ transcludeFn = NOT_SUPPORTED;
        if (preLink) {
            preLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        linkFn(this.componentScope, /** @type {?} */ ((null)), { parentBoundTranscludeFn: attachChildNodes });
        if (postLink) {
            postLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
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
        const /** @type {?} */ ng1Changes = {};
        Object.keys(changes).forEach(name => {
            const /** @type {?} */ change = changes[name];
            this.setComponentProperty(name, change.currentValue);
            ng1Changes[this.propertyMap[name]] = change;
        });
        if (isFunction(/** @type {?} */ ((this.destinationObj)).$onChanges)) {
            /** @type {?} */ ((/** @type {?} */ ((this.destinationObj)).$onChanges))(ng1Changes);
        }
    }
    /**
     * @return {?}
     */
    ngDoCheck() {
        const /** @type {?} */ destinationObj = this.destinationObj;
        const /** @type {?} */ lastValues = this.checkLastValues;
        const /** @type {?} */ checkProperties = this.checkProperties;
        const /** @type {?} */ propOuts = this.propOuts;
        checkProperties.forEach((propName, i) => {
            const /** @type {?} */ value = /** @type {?} */ ((destinationObj))[propName];
            const /** @type {?} */ last = lastValues[i];
            if (!strictEquals(last, value)) {
                const /** @type {?} */ eventEmitter = (/** @type {?} */ (this))[propOuts[i]];
                eventEmitter.emit(lastValues[i] = value);
            }
        });
        if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
            this.controllerInstance.$doCheck();
        }
    }
    /**
     * @return {?}
     */
    ngOnDestroy() {
        if (this.controllerInstance && isFunction(this.controllerInstance.$onDestroy)) {
            this.controllerInstance.$onDestroy();
        }
        this.componentScope.$destroy();
    }
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    setComponentProperty(name, value) {
        /** @type {?} */ ((this.destinationObj))[this.propertyMap[name]] = value;
    }
}
function UpgradeNg1ComponentAdapter_tsickle_Closure_declarations() {
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.controllerInstance;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.destinationObj;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.checkLastValues;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.directive;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.element;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.$element;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.componentScope;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.helper;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.template;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.inputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.outputs;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.propOuts;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.checkProperties;
    /** @type {?} */
    UpgradeNg1ComponentAdapter.prototype.propertyMap;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9keW5hbWljL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFXLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBdUQsTUFBTSxlQUFlLENBQUM7QUFFbkosT0FBTyxLQUFLLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUEyQyxhQUFhLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRyxPQUFPLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3hELHVCQUFNLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDOUIsdUJBQU0sYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUNGLHVCQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFHM0MsTUFBTTs7OztJQVlKLFlBQW1CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO3NCQVZaLEVBQUU7NEJBQ0ksRUFBRTt1QkFDUCxFQUFFOzZCQUNJLEVBQUU7K0JBQ0EsRUFBRTsrQkFDRixFQUFFOzJCQUNVLEVBQUU7eUJBQ0wsSUFBSTtRQUl2Qyx1QkFBTSxRQUFRLEdBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDdEYsdUJBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7OztRQUtsQix1QkFBTSxTQUFTLEdBQUcsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFDLENBQUM7UUFFL0Y7Ozs7OztZQUdFLFlBQ29CLEtBQXFCLEVBQUUsUUFBa0IsRUFBRSxVQUFzQjtnQkFDbkYsdUJBQU0sTUFBTSxHQUFHLElBQUksYUFBYSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDN0UsTUFBTSxtQkFBQyxJQUFJLDBCQUEwQixDQUNqQyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQzdFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBUSxFQUFDO2FBQ3BEOzs7O1lBQ0QsUUFBUTs7YUFDUDs7OztZQUNELFdBQVc7O2FBQ1Y7Ozs7WUFDRCxTQUFTOzthQUNSOzs7O1lBQ0QsV0FBVzs7YUFDVjs7O29CQWpCRixTQUFTLFNBQUMsU0FBUzs7OztvREFJYixNQUFNLFNBQUMsTUFBTTtvQkF6Q3NDLFFBQVE7b0JBQTFDLFVBQVU7Ozs7OztRQXdEbEMsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7S0FDckI7Ozs7SUFFRCxlQUFlO1FBQ2IsdUJBQU0sV0FBVyxHQUFHLDBCQUFPLElBQUksQ0FBQyxTQUFTLEdBQUcsZ0JBQWdCLEtBQUssUUFBUSxDQUFDO1FBQzFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSx1Q0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDaEUsTUFBTSxJQUFJLEtBQUssQ0FDWCxpRkFBaUYsQ0FBQyxDQUFDO1NBQ3hGO1FBRUQsdUJBQU0sT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxvQkFBQyxJQUFJLENBQUMsU0FBUyxHQUFHLGdCQUFnQixDQUFDLENBQUMsb0JBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFFM0YsRUFBRSxDQUFDLENBQUMsT0FBTyxPQUFPLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDdEMsdUJBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDckMsdUJBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pDLHVCQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1Qyx1QkFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQzs7Z0JBSWxGLHVCQUFNLFNBQVMsR0FBRyxTQUFTLFFBQVEsRUFBRSxDQUFDO2dCQUN0Qyx1QkFBTSxlQUFlLEdBQUcsR0FBRyxTQUFTLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ3BELHVCQUFNLFVBQVUsR0FBRyxVQUFVLFFBQVEsRUFBRSxDQUFDO2dCQUN4Qyx1QkFBTSxnQkFBZ0IsR0FBRyxHQUFHLFVBQVUsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDdEQsdUJBQU0sc0JBQXNCLEdBQUcsR0FBRyxnQkFBZ0IsUUFBUSxDQUFDO2dCQUUzRCxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO29CQUNwQixLQUFLLEdBQUcsQ0FBQztvQkFDVCxLQUFLLEdBQUc7d0JBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO3dCQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFFBQVEsQ0FBQzt3QkFDdkMsS0FBSyxDQUFDO29CQUNSLEtBQUssR0FBRzt3QkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDNUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7d0JBQ3hDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsUUFBUSxDQUFDO3dCQUV2QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDOUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQzt3QkFDaEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUM7d0JBRXhDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUNwQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDdEMsS0FBSyxDQUFDO29CQUNSLEtBQUssR0FBRzt3QkFDTixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDOUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzt3QkFDMUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsR0FBRyxRQUFRLENBQUM7d0JBQ3hDLEtBQUssQ0FBQztvQkFDUjt3QkFDRSxxQkFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDbkMsTUFBTSxJQUFJLEtBQUssQ0FDWCx1QkFBdUIsV0FBVyxTQUFTLElBQUksU0FBUyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsQ0FBQztpQkFDeEY7YUFDRixDQUFDLENBQUM7U0FDSjtLQUNGOzs7Ozs7O0lBS0QsTUFBTSxDQUFDLE9BQU8sQ0FDVixrQkFBdUUsRUFDdkUsU0FBbUM7UUFDckMsdUJBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDMUQsdUJBQU0saUJBQWlCLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbkQsaUJBQWlCLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFFLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXBDLE1BQU0sQ0FBQyxPQUFPO2lCQUNULE9BQU8sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ2hGLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQztTQUM5RCxDQUFDLENBQUM7UUFFSCxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM5QjtDQUNGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUQ7Ozs7Ozs7Ozs7O0lBU0UsWUFDWSxRQUF1QixLQUFxQixFQUFVLFFBQWdCLEVBQ3RFLFFBQTBCLE9BQWlCLEVBQVUsUUFBa0IsRUFDdkUsaUJBQW1DLFdBQW9DO1FBRnZFLFdBQU0sR0FBTixNQUFNO1FBQWdELGFBQVEsR0FBUixRQUFRLENBQVE7UUFDdEUsV0FBTSxHQUFOLE1BQU07UUFBb0IsWUFBTyxHQUFQLE9BQU8sQ0FBVTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDdkUsb0JBQWUsR0FBZixlQUFlO1FBQW9CLGdCQUFXLEdBQVgsV0FBVyxDQUF5QjtrQ0FYNUIsSUFBSTs4QkFDaEIsSUFBSTsrQkFDdEIsRUFBRTt3QkFHWCxJQUFJO1FBT2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNsQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7UUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV6RCx1QkFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUM7UUFFakQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQzNGLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1NBQy9DO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7U0FDM0M7UUFFRCxHQUFHLENBQUMsQ0FBQyxxQkFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDdkMsbUJBQUMsSUFBVyxFQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQ2pDO1FBQ0QsR0FBRyxDQUFDLENBQUMscUJBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3hDLHVCQUFNLE9BQU8sR0FBRyxtQkFBQyxJQUFXLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1lBQ3BFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0MsSUFBSSxDQUFDLG9CQUFvQixDQUNyQixPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBVSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUM1RTtTQUNGO1FBQ0QsR0FBRyxDQUFDLENBQUMscUJBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzFDO0tBQ0Y7Ozs7SUFFRCxRQUFROztRQUVOLHVCQUFNLGdCQUFnQixHQUE4QixJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDdEYsdUJBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7UUFHMUQsdUJBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDO1FBQ2pELHVCQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUM7UUFDekQsRUFBRSxDQUFDLENBQUMsY0FBYyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzVGOztRQUdELHVCQUFNLG1CQUFtQixHQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOztRQUczRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ25DOztRQUdELHVCQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztRQUNqQyx1QkFBTSxPQUFPLEdBQUcsQ0FBQyxPQUFPLElBQUksSUFBSSxRQUFRLENBQUMsSUFBSSxtQkFBQyxJQUFpQyxFQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3JGLHVCQUFNLFFBQVEsR0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBQyxJQUFpQyxFQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDN0YsdUJBQU0sS0FBSyxHQUF3QixhQUFhLENBQUM7UUFDakQsdUJBQU0sWUFBWSxHQUFnQyxhQUFhLENBQUM7UUFDaEUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNaLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLG1CQUFtQixFQUFFLFlBQVksQ0FBQyxDQUFDO1NBQ3ZGO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLHFCQUFFLElBQUksSUFBSSxFQUFDLHVCQUF1QixFQUFFLGdCQUFnQixFQUFDLENBQUMsQ0FBQztRQUVqRixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2IsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLENBQUM7U0FDeEY7O1FBR0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztTQUNyQztLQUNGOzs7OztJQUVELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyx1QkFBTSxVQUFVLEdBQVEsRUFBRSxDQUFDO1FBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2xDLHVCQUFNLE1BQU0sR0FBaUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JELFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1NBQzdDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxDQUFDLFVBQVUsb0JBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7a0RBQ2pELElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxHQUFHLFVBQVU7U0FDOUM7S0FDRjs7OztJQUVELFNBQVM7UUFDUCx1QkFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUMzQyx1QkFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUN4Qyx1QkFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3Qyx1QkFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUMvQixlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RDLHVCQUFNLEtBQUssc0JBQUcsY0FBYyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBQ3pDLHVCQUFNLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsdUJBQU0sWUFBWSxHQUFzQixtQkFBQyxJQUFXLEVBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkUsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7YUFDMUM7U0FDRixDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3BDO0tBQ0Y7Ozs7SUFFRCxXQUFXO1FBQ1QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUN0QztRQUVELElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDaEM7Ozs7OztJQUVELG9CQUFvQixDQUFDLElBQVksRUFBRSxLQUFVOzJCQUMzQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSztLQUN0RDtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3QsIEluamVjdG9yLCBPbkNoYW5nZXMsIE9uSW5pdCwgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi9jb21tb24vYW5ndWxhcjEnO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHtJQmluZGluZ0Rlc3RpbmF0aW9uLCBJQ29udHJvbGxlckluc3RhbmNlLCBVcGdyYWRlSGVscGVyfSBmcm9tICcuLi9jb21tb24vdXBncmFkZV9oZWxwZXInO1xuaW1wb3J0IHtpc0Z1bmN0aW9uLCBzdHJpY3RFcXVhbHN9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuXG5jb25zdCBDQU1FTF9DQVNFID0gLyhbQS1aXSkvZztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuXG5cbmV4cG9ydCBjbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIge1xuICB0eXBlOiBUeXBlPGFueT47XG4gIGlucHV0czogc3RyaW5nW10gPSBbXTtcbiAgaW5wdXRzUmVuYW1lOiBzdHJpbmdbXSA9IFtdO1xuICBvdXRwdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBvdXRwdXRzUmVuYW1lOiBzdHJpbmdbXSA9IFtdO1xuICBwcm9wZXJ0eU91dHB1dHM6IHN0cmluZ1tdID0gW107XG4gIGNoZWNrUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgcHJvcGVydHlNYXA6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZXxudWxsID0gbnVsbDtcbiAgdGVtcGxhdGU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPVxuICAgICAgICBuYW1lLnJlcGxhY2UoQ0FNRUxfQ0FTRSwgKGFsbDogc3RyaW5nLCBuZXh0OiBzdHJpbmcpID0+ICctJyArIG5leHQudG9Mb3dlckNhc2UoKSk7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBOb3RlOiBUaGVyZSBpcyBhIGJ1ZyBpbiBUUyAyLjQgdGhhdCBwcmV2ZW50cyB1cyBmcm9tXG4gICAgLy8gaW5saW5pbmcgdGhpcyBpbnRvIEBEaXJlY3RpdmVcbiAgICAvLyBUT0RPKHRib3NjaCk6IGZpbmQgb3IgZmlsZSBhIGJ1ZyBhZ2FpbnN0IFR5cGVTY3JpcHQgZm9yIHRoaXMuXG4gICAgY29uc3QgZGlyZWN0aXZlID0ge3NlbGVjdG9yOiBzZWxlY3RvciwgaW5wdXRzOiB0aGlzLmlucHV0c1JlbmFtZSwgb3V0cHV0czogdGhpcy5vdXRwdXRzUmVuYW1lfTtcblxuICAgIEBEaXJlY3RpdmUoZGlyZWN0aXZlKVxuICAgIGNsYXNzIE15Q2xhc3Mge1xuICAgICAgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmU7XG4gICAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgICBASW5qZWN0KCRTQ09QRSkgc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBpbmplY3RvcjogSW5qZWN0b3IsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgY29uc3QgaGVscGVyID0gbmV3IFVwZ3JhZGVIZWxwZXIoaW5qZWN0b3IsIG5hbWUsIGVsZW1lbnRSZWYsIHRoaXMuZGlyZWN0aXZlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlcihcbiAgICAgICAgICAgIGhlbHBlciwgc2NvcGUsIHNlbGYudGVtcGxhdGUsIHNlbGYuaW5wdXRzLCBzZWxmLm91dHB1dHMsIHNlbGYucHJvcGVydHlPdXRwdXRzLFxuICAgICAgICAgICAgc2VsZi5jaGVja1Byb3BlcnRpZXMsIHNlbGYucHJvcGVydHlNYXApIGFzIGFueTtcbiAgICAgIH1cbiAgICAgIG5nT25Jbml0KCkgeyAvKiBuZWVkcyB0byBiZSBoZXJlIGZvciBuZzIgdG8gcHJvcGVybHkgZGV0ZWN0IGl0ICovXG4gICAgICB9XG4gICAgICBuZ09uQ2hhbmdlcygpIHsgLyogbmVlZHMgdG8gYmUgaGVyZSBmb3IgbmcyIHRvIHByb3Blcmx5IGRldGVjdCBpdCAqL1xuICAgICAgfVxuICAgICAgbmdEb0NoZWNrKCkgeyAvKiBuZWVkcyB0byBiZSBoZXJlIGZvciBuZzIgdG8gcHJvcGVybHkgZGV0ZWN0IGl0ICovXG4gICAgICB9XG4gICAgICBuZ09uRGVzdHJveSgpIHsgLyogbmVlZHMgdG8gYmUgaGVyZSBmb3IgbmcyIHRvIHByb3Blcmx5IGRldGVjdCBpdCAqL1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnR5cGUgPSBNeUNsYXNzO1xuICB9XG5cbiAgZXh0cmFjdEJpbmRpbmdzKCkge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIHRoaXMuZGlyZWN0aXZlICEuYmluZFRvQ29udHJvbGxlciA9PT0gJ29iamVjdCc7XG4gICAgaWYgKGJ0Y0lzT2JqZWN0ICYmIE9iamVjdC5rZXlzKHRoaXMuZGlyZWN0aXZlICEuc2NvcGUgISkubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEJpbmRpbmcgZGVmaW5pdGlvbnMgb24gc2NvcGUgYW5kIGNvbnRyb2xsZXIgYXQgdGhlIHNhbWUgdGltZSBhcmUgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gKGJ0Y0lzT2JqZWN0KSA/IHRoaXMuZGlyZWN0aXZlICEuYmluZFRvQ29udHJvbGxlciA6IHRoaXMuZGlyZWN0aXZlICEuc2NvcGU7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHQgPT0gJ29iamVjdCcpIHtcbiAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQpLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gY29udGV4dFtwcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gZGVmaW5pdGlvbi5jaGFyQXQoMCk7XG4gICAgICAgIGNvbnN0IGJpbmRpbmdPcHRpb25zID0gZGVmaW5pdGlvbi5jaGFyQXQoMSk7XG4gICAgICAgIGNvbnN0IGF0dHJOYW1lID0gZGVmaW5pdGlvbi5zdWJzdHJpbmcoYmluZGluZ09wdGlvbnMgPT09ICc/JyA/IDIgOiAxKSB8fCBwcm9wTmFtZTtcblxuICAgICAgICAvLyBRVUVTVElPTjogV2hhdCBhYm91dCBgPSpgPyBJZ25vcmU/IFRocm93PyBTdXBwb3J0P1xuXG4gICAgICAgIGNvbnN0IGlucHV0TmFtZSA9IGBpbnB1dF8ke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IGlucHV0TmFtZVJlbmFtZSA9IGAke2lucHV0TmFtZX06ICR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IGBvdXRwdXRfJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lUmVuYW1lID0gYCR7b3V0cHV0TmFtZX06ICR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZVJlbmFtZUNoYW5nZSA9IGAke291dHB1dE5hbWVSZW5hbWV9Q2hhbmdlYDtcblxuICAgICAgICBzd2l0Y2ggKGJpbmRpbmdUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlucHV0c1JlbmFtZS5wdXNoKGlucHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW2lucHV0TmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJz0nOlxuICAgICAgICAgICAgdGhpcy5pbnB1dHMucHVzaChpbnB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dHNSZW5hbWUucHVzaChpbnB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtpbnB1dE5hbWVdID0gcHJvcE5hbWU7XG5cbiAgICAgICAgICAgIHRoaXMub3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5vdXRwdXRzUmVuYW1lLnB1c2gob3V0cHV0TmFtZVJlbmFtZUNoYW5nZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW291dHB1dE5hbWVdID0gcHJvcE5hbWU7XG5cbiAgICAgICAgICAgIHRoaXMuY2hlY2tQcm9wZXJ0aWVzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLm91dHB1dHNSZW5hbWUucHVzaChvdXRwdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbb3V0cHV0TmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZXQganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIG1hcHBpbmcgJyR7YmluZGluZ1R5cGV9JyBpbiAnJHtqc29ufScgaW4gJyR7dGhpcy5uYW1lfScgZGlyZWN0aXZlLmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBncmFkZSBuZzEgY29tcG9uZW50cyBpbnRvIEFuZ3VsYXIuXG4gICAqL1xuICBzdGF0aWMgcmVzb2x2ZShcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50czoge1tuYW1lOiBzdHJpbmddOiBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9LFxuICAgICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBPYmplY3Qua2V5cyhleHBvcnRlZENvbXBvbmVudHMpLm1hcChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGV4cG9ydGVkQ29tcG9uZW50ID0gZXhwb3J0ZWRDb21wb25lbnRzW25hbWVdO1xuICAgICAgZXhwb3J0ZWRDb21wb25lbnQuZGlyZWN0aXZlID0gVXBncmFkZUhlbHBlci5nZXREaXJlY3RpdmUoJGluamVjdG9yLCBuYW1lKTtcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50LmV4dHJhY3RCaW5kaW5ncygpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgIC5yZXNvbHZlKFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUoJGluamVjdG9yLCBleHBvcnRlZENvbXBvbmVudC5kaXJlY3RpdmUsIHRydWUpKVxuICAgICAgICAgIC50aGVuKHRlbXBsYXRlID0+IGV4cG9ydGVkQ29tcG9uZW50LnRlbXBsYXRlID0gdGVtcGxhdGUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxufVxuXG5jbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlciBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrIHtcbiAgcHJpdmF0ZSBjb250cm9sbGVySW5zdGFuY2U6IElDb250cm9sbGVySW5zdGFuY2V8bnVsbCA9IG51bGw7XG4gIGRlc3RpbmF0aW9uT2JqOiBJQmluZGluZ0Rlc3RpbmF0aW9ufG51bGwgPSBudWxsO1xuICBjaGVja0xhc3RWYWx1ZXM6IGFueVtdID0gW107XG4gIHByaXZhdGUgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmU7XG4gIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICRlbGVtZW50OiBhbnkgPSBudWxsO1xuICBjb21wb25lbnRTY29wZTogYW5ndWxhci5JU2NvcGU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGhlbHBlcjogVXBncmFkZUhlbHBlciwgc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBwcml2YXRlIHRlbXBsYXRlOiBzdHJpbmcsXG4gICAgICBwcml2YXRlIGlucHV0czogc3RyaW5nW10sIHByaXZhdGUgb3V0cHV0czogc3RyaW5nW10sIHByaXZhdGUgcHJvcE91dHM6IHN0cmluZ1tdLFxuICAgICAgcHJpdmF0ZSBjaGVja1Byb3BlcnRpZXM6IHN0cmluZ1tdLCBwcml2YXRlIHByb3BlcnR5TWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgIHRoaXMuZGlyZWN0aXZlID0gaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmVsZW1lbnQgPSBoZWxwZXIuZWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gaGVscGVyLiRlbGVtZW50O1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuXG4gICAgaWYgKHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgJiYgY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLmNvbXBvbmVudFNjb3BlKTtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmogPSB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiA9IHRoaXMuY29tcG9uZW50U2NvcGU7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICh0aGlzIGFzIGFueSlbaW5wdXRzW2ldXSA9IG51bGw7XG4gICAgfVxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgb3V0cHV0cy5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgZW1pdHRlciA9ICh0aGlzIGFzIGFueSlbb3V0cHV0c1tqXV0gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICAgIGlmICh0aGlzLnByb3BPdXRzLmluZGV4T2Yob3V0cHV0c1tqXSkgPT09IC0xKSB7XG4gICAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkoXG4gICAgICAgICAgICBvdXRwdXRzW2pdLCAoZW1pdHRlciA9PiAodmFsdWU6IGFueSkgPT4gZW1pdHRlci5lbWl0KHZhbHVlKSkoZW1pdHRlcikpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBrID0gMDsgayA8IHByb3BPdXRzLmxlbmd0aDsgaysrKSB7XG4gICAgICB0aGlzLmNoZWNrTGFzdFZhbHVlcy5wdXNoKElOSVRJQUxfVkFMVUUpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIENvbGxlY3QgY29udGVudHMsIGluc2VydCBhbmQgY29tcGlsZSB0ZW1wbGF0ZVxuICAgIGNvbnN0IGF0dGFjaENoaWxkTm9kZXM6IGFuZ3VsYXIuSUxpbmtGbnx1bmRlZmluZWQgPSB0aGlzLmhlbHBlci5wcmVwYXJlVHJhbnNjbHVzaW9uKCk7XG4gICAgY29uc3QgbGlua0ZuID0gdGhpcy5oZWxwZXIuY29tcGlsZVRlbXBsYXRlKHRoaXMudGVtcGxhdGUpO1xuXG4gICAgLy8gSW5zdGFudGlhdGUgY29udHJvbGxlciAoaWYgbm90IGFscmVhZHkgZG9uZSBzbylcbiAgICBjb25zdCBjb250cm9sbGVyVHlwZSA9IHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXI7XG4gICAgY29uc3QgYmluZFRvQ29udHJvbGxlciA9IHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXI7XG4gICAgaWYgKGNvbnRyb2xsZXJUeXBlICYmICFiaW5kVG9Db250cm9sbGVyKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA9IHRoaXMuaGVscGVyLmJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgdGhpcy5jb21wb25lbnRTY29wZSk7XG4gICAgfVxuXG4gICAgLy8gUmVxdWlyZSBvdGhlciBjb250cm9sbGVyc1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPVxuICAgICAgICB0aGlzLmhlbHBlci5yZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnModGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuXG4gICAgLy8gSG9vazogJG9uSW5pdFxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gTGlua2luZ1xuICAgIGNvbnN0IGxpbmsgPSB0aGlzLmRpcmVjdGl2ZS5saW5rO1xuICAgIGNvbnN0IHByZUxpbmsgPSAodHlwZW9mIGxpbmsgPT0gJ29iamVjdCcpICYmIChsaW5rIGFzIGFuZ3VsYXIuSURpcmVjdGl2ZVByZVBvc3QpLnByZTtcbiAgICBjb25zdCBwb3N0TGluayA9ICh0eXBlb2YgbGluayA9PSAnb2JqZWN0JykgPyAobGluayBhcyBhbmd1bGFyLklEaXJlY3RpdmVQcmVQb3N0KS5wb3N0IDogbGluaztcbiAgICBjb25zdCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBhbmd1bGFyLklUcmFuc2NsdWRlRnVuY3Rpb24gPSBOT1RfU1VQUE9SVEVEO1xuICAgIGlmIChwcmVMaW5rKSB7XG4gICAgICBwcmVMaW5rKHRoaXMuY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIGxpbmtGbih0aGlzLmNvbXBvbmVudFNjb3BlLCBudWxsICEsIHtwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbjogYXR0YWNoQ2hpbGROb2Rlc30pO1xuXG4gICAgaWYgKHBvc3RMaW5rKSB7XG4gICAgICBwb3N0TGluayh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkcG9zdExpbmtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmspKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmsoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgbmcxQ2hhbmdlczogYW55ID0ge307XG4gICAgT2JqZWN0LmtleXMoY2hhbmdlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGNoYW5nZTogU2ltcGxlQ2hhbmdlID0gY2hhbmdlc1tuYW1lXTtcbiAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkobmFtZSwgY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgICBuZzFDaGFuZ2VzW3RoaXMucHJvcGVydHlNYXBbbmFtZV1dID0gY2hhbmdlO1xuICAgIH0pO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24odGhpcy5kZXN0aW5hdGlvbk9iaiAhLiRvbkNoYW5nZXMpKSB7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqICEuJG9uQ2hhbmdlcyAhKG5nMUNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBjb25zdCBkZXN0aW5hdGlvbk9iaiA9IHRoaXMuZGVzdGluYXRpb25PYmo7XG4gICAgY29uc3QgbGFzdFZhbHVlcyA9IHRoaXMuY2hlY2tMYXN0VmFsdWVzO1xuICAgIGNvbnN0IGNoZWNrUHJvcGVydGllcyA9IHRoaXMuY2hlY2tQcm9wZXJ0aWVzO1xuICAgIGNvbnN0IHByb3BPdXRzID0gdGhpcy5wcm9wT3V0cztcbiAgICBjaGVja1Byb3BlcnRpZXMuZm9yRWFjaCgocHJvcE5hbWUsIGkpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gZGVzdGluYXRpb25PYmogIVtwcm9wTmFtZV07XG4gICAgICBjb25zdCBsYXN0ID0gbGFzdFZhbHVlc1tpXTtcbiAgICAgIGlmICghc3RyaWN0RXF1YWxzKGxhc3QsIHZhbHVlKSkge1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtwcm9wT3V0c1tpXV07XG4gICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KGxhc3RWYWx1ZXNbaV0gPSB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uRGVzdHJveSkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiRkZXN0cm95KCk7XG4gIH1cblxuICBzZXRDb21wb25lbnRQcm9wZXJ0eShuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLmRlc3RpbmF0aW9uT2JqICFbdGhpcy5wcm9wZXJ0eU1hcFtuYW1lXV0gPSB2YWx1ZTtcbiAgfVxufVxuIl19