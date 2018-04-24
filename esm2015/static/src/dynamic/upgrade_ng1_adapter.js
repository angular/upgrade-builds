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
            { type: undefined, decorators: [{ type: Inject, args: [$SCOPE,] },] },
            { type: Injector, },
            { type: ElementRef, },
        ];
        function MyClass_tsickle_Closure_declarations() {
            /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
            MyClass.decorators;
            /**
             * @nocollapse
             * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
             */
            MyClass.ctorParameters;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9keW5hbWljL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFXLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBdUQsTUFBTSxlQUFlLENBQUM7QUFFbkosT0FBTyxLQUFLLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUEyQyxhQUFhLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRyxPQUFPLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3hELHVCQUFNLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDOUIsdUJBQU0sYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUNGLHVCQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFHM0MsTUFBTTs7OztJQVlKLFlBQW1CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO3NCQVZaLEVBQUU7NEJBQ0ksRUFBRTt1QkFDUCxFQUFFOzZCQUNJLEVBQUU7K0JBQ0EsRUFBRTsrQkFDRixFQUFFOzJCQUNVLEVBQUU7eUJBQ0wsSUFBSTtRQUl2Qyx1QkFBTSxRQUFRLEdBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDdEYsdUJBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7OztRQUtsQix1QkFBTSxTQUFTLEdBQUcsRUFB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Q0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQix1QkFBTSxZQUFZLEdBQXNCLG1CQUFDLElBQVcsRUFBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRSxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQzthQUMxQztTQUNGLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDcEM7S0FDRjs7OztJQUVELFdBQVc7UUFDVCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxDQUFDO1NBQ3RDO1FBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUNoQzs7Ozs7O0lBRUQsb0JBQW9CLENBQUMsSUFBWSxFQUFFLEtBQVU7MkJBQzNDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLO0tBQ3REO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdCwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgT25Jbml0LCBTaW1wbGVDaGFuZ2UsIFNpbXBsZUNoYW5nZXMsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge0lCaW5kaW5nRGVzdGluYXRpb24sIElDb250cm9sbGVySW5zdGFuY2UsIFVwZ3JhZGVIZWxwZXJ9IGZyb20gJy4uL2NvbW1vbi91cGdyYWRlX2hlbHBlcic7XG5pbXBvcnQge2lzRnVuY3Rpb24sIHN0cmljdEVxdWFsc30gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuXG5cbmNvbnN0IENBTUVMX0NBU0UgPSAvKFtBLVpdKS9nO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5jb25zdCBOT1RfU1VQUE9SVEVEOiBhbnkgPSAnTk9UX1NVUFBPUlRFRCc7XG5cblxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlciB7XG4gIHR5cGU6IFR5cGU8YW55PjtcbiAgaW5wdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBpbnB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHM6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIHByb3BlcnR5T3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgY2hlY2tQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICBwcm9wZXJ0eU1hcDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlfG51bGwgPSBudWxsO1xuICB0ZW1wbGF0ZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9XG4gICAgICAgIG5hbWUucmVwbGFjZShDQU1FTF9DQVNFLCAoYWxsOiBzdHJpbmcsIG5leHQ6IHN0cmluZykgPT4gJy0nICsgbmV4dC50b0xvd2VyQ2FzZSgpKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIE5vdGU6IFRoZXJlIGlzIGEgYnVnIGluIFRTIDIuNCB0aGF0IHByZXZlbnRzIHVzIGZyb21cbiAgICAvLyBpbmxpbmluZyB0aGlzIGludG8gQERpcmVjdGl2ZVxuICAgIC8vIFRPRE8odGJvc2NoKTogZmluZCBvciBmaWxlIGEgYnVnIGFnYWluc3QgVHlwZVNjcmlwdCBmb3IgdGhpcy5cbiAgICBjb25zdCBkaXJlY3RpdmUgPSB7c2VsZWN0b3I6IHNlbGVjdG9yLCBpbnB1dHM6IHRoaXMuaW5wdXRzUmVuYW1lLCBvdXRwdXRzOiB0aGlzLm91dHB1dHNSZW5hbWV9O1xuXG4gICAgQERpcmVjdGl2ZShkaXJlY3RpdmUpXG4gICAgY2xhc3MgTXlDbGFzcyB7XG4gICAgICBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZTtcbiAgICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICAgIEBJbmplY3QoJFNDT1BFKSBzY29wZTogYW5ndWxhci5JU2NvcGUsIGluamVjdG9yOiBJbmplY3RvciwgZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xuICAgICAgICBjb25zdCBoZWxwZXIgPSBuZXcgVXBncmFkZUhlbHBlcihpbmplY3RvciwgbmFtZSwgZWxlbWVudFJlZiwgdGhpcy5kaXJlY3RpdmUpO1xuICAgICAgICByZXR1cm4gbmV3IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyKFxuICAgICAgICAgICAgaGVscGVyLCBzY29wZSwgc2VsZi50ZW1wbGF0ZSwgc2VsZi5pbnB1dHMsIHNlbGYub3V0cHV0cywgc2VsZi5wcm9wZXJ0eU91dHB1dHMsXG4gICAgICAgICAgICBzZWxmLmNoZWNrUHJvcGVydGllcywgc2VsZi5wcm9wZXJ0eU1hcCkgYXMgYW55O1xuICAgICAgfVxuICAgICAgbmdPbkluaXQoKSB7IC8qIG5lZWRzIHRvIGJlIGhlcmUgZm9yIG5nMiB0byBwcm9wZXJseSBkZXRlY3QgaXQgKi9cbiAgICAgIH1cbiAgICAgIG5nT25DaGFuZ2VzKCkgeyAvKiBuZWVkcyB0byBiZSBoZXJlIGZvciBuZzIgdG8gcHJvcGVybHkgZGV0ZWN0IGl0ICovXG4gICAgICB9XG4gICAgICBuZ0RvQ2hlY2soKSB7IC8qIG5lZWRzIHRvIGJlIGhlcmUgZm9yIG5nMiB0byBwcm9wZXJseSBkZXRlY3QgaXQgKi9cbiAgICAgIH1cbiAgICAgIG5nT25EZXN0cm95KCkgeyAvKiBuZWVkcyB0byBiZSBoZXJlIGZvciBuZzIgdG8gcHJvcGVybHkgZGV0ZWN0IGl0ICovXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudHlwZSA9IE15Q2xhc3M7XG4gIH1cblxuICBleHRyYWN0QmluZGluZ3MoKSB7XG4gICAgY29uc3QgYnRjSXNPYmplY3QgPSB0eXBlb2YgdGhpcy5kaXJlY3RpdmUgIS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXModGhpcy5kaXJlY3RpdmUgIS5zY29wZSAhKS5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQmluZGluZyBkZWZpbml0aW9ucyBvbiBzY29wZSBhbmQgY29udHJvbGxlciBhdCB0aGUgc2FtZSB0aW1lIGFyZSBub3Qgc3VwcG9ydGVkLmApO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRleHQgPSAoYnRjSXNPYmplY3QpID8gdGhpcy5kaXJlY3RpdmUgIS5iaW5kVG9Db250cm9sbGVyIDogdGhpcy5kaXJlY3RpdmUgIS5zY29wZTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoY29udGV4dCkuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb250ZXh0W3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBkZWZpbml0aW9uLmNoYXJBdCgwKTtcbiAgICAgICAgY29uc3QgYmluZGluZ09wdGlvbnMgPSBkZWZpbml0aW9uLmNoYXJBdCgxKTtcbiAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBkZWZpbml0aW9uLnN1YnN0cmluZyhiaW5kaW5nT3B0aW9ucyA9PT0gJz8nID8gMiA6IDEpIHx8IHByb3BOYW1lO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgY29uc3QgaW5wdXROYW1lID0gYGlucHV0XyR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3QgaW5wdXROYW1lUmVuYW1lID0gYCR7aW5wdXROYW1lfTogJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lID0gYG91dHB1dF8ke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWVSZW5hbWUgPSBgJHtvdXRwdXROYW1lfTogJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lUmVuYW1lQ2hhbmdlID0gYCR7b3V0cHV0TmFtZVJlbmFtZX1DaGFuZ2VgO1xuXG4gICAgICAgIHN3aXRjaCAoYmluZGluZ1R5cGUpIHtcbiAgICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzUmVuYW1lLnB1c2goaW5wdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbaW5wdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlucHV0c1JlbmFtZS5wdXNoKGlucHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW2lucHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLm91dHB1dHNSZW5hbWUucHVzaChvdXRwdXROYW1lUmVuYW1lQ2hhbmdlKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbb3V0cHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5jaGVja1Byb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5T3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICB0aGlzLm91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0c1JlbmFtZS5wdXNoKG91dHB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtvdXRwdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxldCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGV4dCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgbWFwcGluZyAnJHtiaW5kaW5nVHlwZX0nIGluICcke2pzb259JyBpbiAnJHt0aGlzLm5hbWV9JyBkaXJlY3RpdmUuYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGdyYWRlIG5nMSBjb21wb25lbnRzIGludG8gQW5ndWxhci5cbiAgICovXG4gIHN0YXRpYyByZXNvbHZlKFxuICAgICAgZXhwb3J0ZWRDb21wb25lbnRzOiB7W25hbWU6IHN0cmluZ106IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0sXG4gICAgICAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBwcm9taXNlcyA9IE9iamVjdC5rZXlzKGV4cG9ydGVkQ29tcG9uZW50cykubWFwKG5hbWUgPT4ge1xuICAgICAgY29uc3QgZXhwb3J0ZWRDb21wb25lbnQgPSBleHBvcnRlZENvbXBvbmVudHNbbmFtZV07XG4gICAgICBleHBvcnRlZENvbXBvbmVudC5kaXJlY3RpdmUgPSBVcGdyYWRlSGVscGVyLmdldERpcmVjdGl2ZSgkaW5qZWN0b3IsIG5hbWUpO1xuICAgICAgZXhwb3J0ZWRDb21wb25lbnQuZXh0cmFjdEJpbmRpbmdzKCk7XG5cbiAgICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgICAgLnJlc29sdmUoVXBncmFkZUhlbHBlci5nZXRUZW1wbGF0ZSgkaW5qZWN0b3IsIGV4cG9ydGVkQ29tcG9uZW50LmRpcmVjdGl2ZSwgdHJ1ZSkpXG4gICAgICAgICAgLnRoZW4odGVtcGxhdGUgPT4gZXhwb3J0ZWRDb21wb25lbnQudGVtcGxhdGUgPSB0ZW1wbGF0ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICB9XG59XG5cbmNsYXNzIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIERvQ2hlY2sge1xuICBwcml2YXRlIGNvbnRyb2xsZXJJbnN0YW5jZTogSUNvbnRyb2xsZXJJbnN0YW5jZXxudWxsID0gbnVsbDtcbiAgZGVzdGluYXRpb25PYmo6IElCaW5kaW5nRGVzdGluYXRpb258bnVsbCA9IG51bGw7XG4gIGNoZWNrTGFzdFZhbHVlczogYW55W10gPSBbXTtcbiAgcHJpdmF0ZSBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZTtcbiAgZWxlbWVudDogRWxlbWVudDtcbiAgJGVsZW1lbnQ6IGFueSA9IG51bGw7XG4gIGNvbXBvbmVudFNjb3BlOiBhbmd1bGFyLklTY29wZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaGVscGVyOiBVcGdyYWRlSGVscGVyLCBzY29wZTogYW5ndWxhci5JU2NvcGUsIHByaXZhdGUgdGVtcGxhdGU6IHN0cmluZyxcbiAgICAgIHByaXZhdGUgaW5wdXRzOiBzdHJpbmdbXSwgcHJpdmF0ZSBvdXRwdXRzOiBzdHJpbmdbXSwgcHJpdmF0ZSBwcm9wT3V0czogc3RyaW5nW10sXG4gICAgICBwcml2YXRlIGNoZWNrUHJvcGVydGllczogc3RyaW5nW10sIHByaXZhdGUgcHJvcGVydHlNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgdGhpcy5kaXJlY3RpdmUgPSBoZWxwZXIuZGlyZWN0aXZlO1xuICAgIHRoaXMuZWxlbWVudCA9IGhlbHBlci5lbGVtZW50O1xuICAgIHRoaXMuJGVsZW1lbnQgPSBoZWxwZXIuJGVsZW1lbnQ7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZSA9IHNjb3BlLiRuZXcoISF0aGlzLmRpcmVjdGl2ZS5zY29wZSk7XG5cbiAgICBjb25zdCBjb250cm9sbGVyVHlwZSA9IHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXI7XG5cbiAgICBpZiAodGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciAmJiBjb250cm9sbGVyVHlwZSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuY29tcG9uZW50U2NvcGUpO1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiA9IHRoaXMuY29udHJvbGxlckluc3RhbmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqID0gdGhpcy5jb21wb25lbnRTY29wZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgKHRoaXMgYXMgYW55KVtpbnB1dHNbaV1dID0gbnVsbDtcbiAgICB9XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBvdXRwdXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBlbWl0dGVyID0gKHRoaXMgYXMgYW55KVtvdXRwdXRzW2pdXSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgICAgaWYgKHRoaXMucHJvcE91dHMuaW5kZXhPZihvdXRwdXRzW2pdKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5zZXRDb21wb25lbnRQcm9wZXJ0eShcbiAgICAgICAgICAgIG91dHB1dHNbal0sIChlbWl0dGVyID0+ICh2YWx1ZTogYW55KSA9PiBlbWl0dGVyLmVtaXQodmFsdWUpKShlbWl0dGVyKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGsgPSAwOyBrIDwgcHJvcE91dHMubGVuZ3RoOyBrKyspIHtcbiAgICAgIHRoaXMuY2hlY2tMYXN0VmFsdWVzLnB1c2goSU5JVElBTF9WQUxVRSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gQ29sbGVjdCBjb250ZW50cywgaW5zZXJ0IGFuZCBjb21waWxlIHRlbXBsYXRlXG4gICAgY29uc3QgYXR0YWNoQ2hpbGROb2RlczogYW5ndWxhci5JTGlua0ZufHVuZGVmaW5lZCA9IHRoaXMuaGVscGVyLnByZXBhcmVUcmFuc2NsdXNpb24oKTtcbiAgICBjb25zdCBsaW5rRm4gPSB0aGlzLmhlbHBlci5jb21waWxlVGVtcGxhdGUodGhpcy50ZW1wbGF0ZSk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyIChpZiBub3QgYWxyZWFkeSBkb25lIHNvKVxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICBjb25zdCBiaW5kVG9Db250cm9sbGVyID0gdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlcjtcbiAgICBpZiAoY29udHJvbGxlclR5cGUgJiYgIWJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLmNvbXBvbmVudFNjb3BlKTtcbiAgICB9XG5cbiAgICAvLyBSZXF1aXJlIG90aGVyIGNvbnRyb2xsZXJzXG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9XG4gICAgICAgIHRoaXMuaGVscGVyLnJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSk7XG5cbiAgICAvLyBIb29rOiAkb25Jbml0XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBMaW5raW5nXG4gICAgY29uc3QgbGluayA9IHRoaXMuZGlyZWN0aXZlLmxpbms7XG4gICAgY29uc3QgcHJlTGluayA9ICh0eXBlb2YgbGluayA9PSAnb2JqZWN0JykgJiYgKGxpbmsgYXMgYW5ndWxhci5JRGlyZWN0aXZlUHJlUG9zdCkucHJlO1xuICAgIGNvbnN0IHBvc3RMaW5rID0gKHR5cGVvZiBsaW5rID09ICdvYmplY3QnKSA/IChsaW5rIGFzIGFuZ3VsYXIuSURpcmVjdGl2ZVByZVBvc3QpLnBvc3QgOiBsaW5rO1xuICAgIGNvbnN0IGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzID0gTk9UX1NVUFBPUlRFRDtcbiAgICBjb25zdCB0cmFuc2NsdWRlRm46IGFuZ3VsYXIuSVRyYW5zY2x1ZGVGdW5jdGlvbiA9IE5PVF9TVVBQT1JURUQ7XG4gICAgaWYgKHByZUxpbmspIHtcbiAgICAgIHByZUxpbmsodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgbGlua0ZuKHRoaXMuY29tcG9uZW50U2NvcGUsIG51bGwgISwge3BhcmVudEJvdW5kVHJhbnNjbHVkZUZuOiBhdHRhY2hDaGlsZE5vZGVzfSk7XG5cbiAgICBpZiAocG9zdExpbmspIHtcbiAgICAgIHBvc3RMaW5rKHRoaXMuY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRwb3N0TGlua1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBuZzFDaGFuZ2VzOiBhbnkgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjaGFuZ2VzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgY2hhbmdlOiBTaW1wbGVDaGFuZ2UgPSBjaGFuZ2VzW25hbWVdO1xuICAgICAgdGhpcy5zZXRDb21wb25lbnRQcm9wZXJ0eShuYW1lLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICAgIG5nMUNoYW5nZXNbdGhpcy5wcm9wZXJ0eU1hcFtuYW1lXV0gPSBjaGFuZ2U7XG4gICAgfSk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLmRlc3RpbmF0aW9uT2JqICEuJG9uQ2hhbmdlcykpIHtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmogIS4kb25DaGFuZ2VzICEobmcxQ2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGNvbnN0IGRlc3RpbmF0aW9uT2JqID0gdGhpcy5kZXN0aW5hdGlvbk9iajtcbiAgICBjb25zdCBsYXN0VmFsdWVzID0gdGhpcy5jaGVja0xhc3RWYWx1ZXM7XG4gICAgY29uc3QgY2hlY2tQcm9wZXJ0aWVzID0gdGhpcy5jaGVja1Byb3BlcnRpZXM7XG4gICAgY29uc3QgcHJvcE91dHMgPSB0aGlzLnByb3BPdXRzO1xuICAgIGNoZWNrUHJvcGVydGllcy5mb3JFYWNoKChwcm9wTmFtZSwgaSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBkZXN0aW5hdGlvbk9iaiAhW3Byb3BOYW1lXTtcbiAgICAgIGNvbnN0IGxhc3QgPSBsYXN0VmFsdWVzW2ldO1xuICAgICAgaWYgKCFzdHJpY3RFcXVhbHMobGFzdCwgdmFsdWUpKSB7XG4gICAgICAgIGNvbnN0IGV2ZW50RW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4gPSAodGhpcyBhcyBhbnkpW3Byb3BPdXRzW2ldXTtcbiAgICAgICAgZXZlbnRFbWl0dGVyLmVtaXQobGFzdFZhbHVlc1tpXSA9IHZhbHVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25EZXN0cm95KSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uRGVzdHJveSgpO1xuICAgIH1cblxuICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJGRlc3Ryb3koKTtcbiAgfVxuXG4gIHNldENvbXBvbmVudFByb3BlcnR5KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIHRoaXMuZGVzdGluYXRpb25PYmogIVt0aGlzLnByb3BlcnR5TWFwW25hbWVdXSA9IHZhbHVlO1xuICB9XG59XG4iXX0=