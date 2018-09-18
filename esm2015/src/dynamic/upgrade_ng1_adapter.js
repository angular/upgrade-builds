/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,uselessCode} checked by tsc
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
/** @type {?} */
const CAMEL_CASE = /([A-Z])/g;
/** @type {?} */
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
/** @type {?} */
const NOT_SUPPORTED = 'NOT_SUPPORTED';
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
        /** @type {?} */
        const selector = name.replace(CAMEL_CASE, (all, next) => '-' + next.toLowerCase());
        /** @type {?} */
        const self = this;
        /** @type {?} */
        const directive = { selector: selector, inputs: this.inputsRename, outputs: this.outputsRename };
        class MyClass {
            /**
             * @param {?} scope
             * @param {?} injector
             * @param {?} elementRef
             */
            constructor(scope, injector, elementRef) {
                /** @type {?} */
                const helper = new UpgradeHelper(injector, name, elementRef, this.directive);
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
            { type: Directive, args: [Object.assign({ jit: true }, directive),] },
        ];
        /** @nocollapse */
        MyClass.ctorParameters = () => [
            { type: undefined, decorators: [{ type: Inject, args: [$SCOPE,] }] },
            { type: Injector },
            { type: ElementRef }
        ];
        if (false) {
            /** @type {?} */
            MyClass.prototype.directive;
        }
        this.type = MyClass;
    }
    /**
     * @return {?}
     */
    extractBindings() {
        /** @type {?} */
        const btcIsObject = typeof /** @type {?} */ ((this.directive)).bindToController === 'object';
        if (btcIsObject && Object.keys(/** @type {?} */ ((/** @type {?} */ ((this.directive)).scope))).length) {
            throw new Error(`Binding definitions on scope and controller at the same time are not supported.`);
        }
        /** @type {?} */
        const context = (btcIsObject) ? /** @type {?} */ ((this.directive)).bindToController : /** @type {?} */ ((this.directive)).scope;
        if (typeof context == 'object') {
            Object.keys(context).forEach(propName => {
                /** @type {?} */
                const definition = context[propName];
                /** @type {?} */
                const bindingType = definition.charAt(0);
                /** @type {?} */
                const bindingOptions = definition.charAt(1);
                /** @type {?} */
                const attrName = definition.substring(bindingOptions === '?' ? 2 : 1) || propName;
                /** @type {?} */
                const inputName = `input_${attrName}`;
                /** @type {?} */
                const inputNameRename = `${inputName}: ${attrName}`;
                /** @type {?} */
                const outputName = `output_${attrName}`;
                /** @type {?} */
                const outputNameRename = `${outputName}: ${attrName}`;
                /** @type {?} */
                const outputNameRenameChange = `${outputNameRename}Change`;
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
                        /** @type {?} */
                        let json = JSON.stringify(context);
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
        /** @type {?} */
        const promises = Object.keys(exportedComponents).map(name => {
            /** @type {?} */
            const exportedComponent = exportedComponents[name];
            exportedComponent.directive = UpgradeHelper.getDirective($injector, name);
            exportedComponent.extractBindings();
            return Promise
                .resolve(UpgradeHelper.getTemplate($injector, exportedComponent.directive, true))
                .then(template => exportedComponent.template = template);
        });
        return Promise.all(promises);
    }
}
if (false) {
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
        /** @type {?} */
        const controllerType = this.directive.controller;
        if (this.directive.bindToController && controllerType) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
            this.destinationObj = this.controllerInstance;
        }
        else {
            this.destinationObj = this.componentScope;
        }
        for (let i = 0; i < inputs.length; i++) {
            (/** @type {?} */ (this))[inputs[i]] = null;
        }
        for (let j = 0; j < outputs.length; j++) {
            /** @type {?} */
            const emitter = (/** @type {?} */ (this))[outputs[j]] = new EventEmitter();
            if (this.propOuts.indexOf(outputs[j]) === -1) {
                this.setComponentProperty(outputs[j], (emitter => (value) => emitter.emit(value))(emitter));
            }
        }
        for (let k = 0; k < propOuts.length; k++) {
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        /** @type {?} */
        const attachChildNodes = this.helper.prepareTransclusion();
        /** @type {?} */
        const linkFn = this.helper.compileTemplate(this.template);
        /** @type {?} */
        const controllerType = this.directive.controller;
        /** @type {?} */
        const bindToController = this.directive.bindToController;
        if (controllerType && !bindToController) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
        }
        /** @type {?} */
        const requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
        // Hook: $onInit
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        /** @type {?} */
        const link = this.directive.link;
        /** @type {?} */
        const preLink = (typeof link == 'object') && (/** @type {?} */ (link)).pre;
        /** @type {?} */
        const postLink = (typeof link == 'object') ? (/** @type {?} */ (link)).post : link;
        /** @type {?} */
        const attrs = NOT_SUPPORTED;
        /** @type {?} */
        const transcludeFn = NOT_SUPPORTED;
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
        /** @type {?} */
        const ng1Changes = {};
        Object.keys(changes).forEach(name => {
            /** @type {?} */
            const change = changes[name];
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
        /** @type {?} */
        const destinationObj = this.destinationObj;
        /** @type {?} */
        const lastValues = this.checkLastValues;
        /** @type {?} */
        const checkProperties = this.checkProperties;
        /** @type {?} */
        const propOuts = this.propOuts;
        checkProperties.forEach((propName, i) => {
            /** @type {?} */
            const value = /** @type {?} */ ((destinationObj))[propName];
            /** @type {?} */
            const last = lastValues[i];
            if (!strictEquals(last, value)) {
                /** @type {?} */
                const eventEmitter = (/** @type {?} */ (this))[propOuts[i]];
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
    ngOnDestroy() { this.helper.onDestroy(this.componentScope, this.controllerInstance); }
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    setComponentProperty(name, value) {
        /** @type {?} */ ((this.destinationObj))[this.propertyMap[name]] = value;
    }
}
if (false) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2R5bmFtaWMvdXBncmFkZV9uZzFfYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQVcsVUFBVSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUF1RCxNQUFNLGVBQWUsQ0FBQztBQUVuSixPQUFPLEtBQUssT0FBTyxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQTJDLGFBQWEsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2pHLE9BQU8sRUFBQyxVQUFVLEVBQUUsWUFBWSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7O0FBR3hELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQzs7QUFDOUIsTUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDOztBQUNGLE1BQU0sYUFBYSxHQUFRLGVBQWUsQ0FBQztBQUczQyxNQUFNOzs7O0lBY0osWUFBbUIsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7c0JBWFosRUFBRTs0QkFDSSxFQUFFO3VCQUNQLEVBQUU7NkJBQ0ksRUFBRTsrQkFDQSxFQUFFOytCQUNGLEVBQUU7MkJBQ1UsRUFBRTt5QkFDTCxJQUFJOztRQUt2QyxNQUFNLFFBQVEsR0FDVixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQVcsRUFBRSxJQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzs7UUFDdEYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDOztRQUtsQixNQUFNLFNBQVMsR0FBRyxFQUFDLFFBQVEsRUFBRSxR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M0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3BDO0tBQ0Y7Ozs7SUFFRCxXQUFXLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFFOzs7Ozs7SUFFdEYsb0JBQW9CLENBQUMsSUFBWSxFQUFFLEtBQVU7MkJBQzNDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLO0tBQ3REO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdCwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgT25Jbml0LCBTaW1wbGVDaGFuZ2UsIFNpbXBsZUNoYW5nZXMsIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4uL2NvbW1vbi9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vY29tbW9uL2NvbnN0YW50cyc7XG5pbXBvcnQge0lCaW5kaW5nRGVzdGluYXRpb24sIElDb250cm9sbGVySW5zdGFuY2UsIFVwZ3JhZGVIZWxwZXJ9IGZyb20gJy4uL2NvbW1vbi91cGdyYWRlX2hlbHBlcic7XG5pbXBvcnQge2lzRnVuY3Rpb24sIHN0cmljdEVxdWFsc30gZnJvbSAnLi4vY29tbW9uL3V0aWwnO1xuXG5cbmNvbnN0IENBTUVMX0NBU0UgPSAvKFtBLVpdKS9nO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5jb25zdCBOT1RfU1VQUE9SVEVEOiBhbnkgPSAnTk9UX1NVUFBPUlRFRCc7XG5cblxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlciB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICB0eXBlICE6IFR5cGU8YW55PjtcbiAgaW5wdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBpbnB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHM6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIHByb3BlcnR5T3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgY2hlY2tQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICBwcm9wZXJ0eU1hcDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlfG51bGwgPSBudWxsO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgdGVtcGxhdGUgITogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9XG4gICAgICAgIG5hbWUucmVwbGFjZShDQU1FTF9DQVNFLCAoYWxsOiBzdHJpbmcsIG5leHQ6IHN0cmluZykgPT4gJy0nICsgbmV4dC50b0xvd2VyQ2FzZSgpKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIE5vdGU6IFRoZXJlIGlzIGEgYnVnIGluIFRTIDIuNCB0aGF0IHByZXZlbnRzIHVzIGZyb21cbiAgICAvLyBpbmxpbmluZyB0aGlzIGludG8gQERpcmVjdGl2ZVxuICAgIC8vIFRPRE8odGJvc2NoKTogZmluZCBvciBmaWxlIGEgYnVnIGFnYWluc3QgVHlwZVNjcmlwdCBmb3IgdGhpcy5cbiAgICBjb25zdCBkaXJlY3RpdmUgPSB7c2VsZWN0b3I6IHNlbGVjdG9yLCBpbnB1dHM6IHRoaXMuaW5wdXRzUmVuYW1lLCBvdXRwdXRzOiB0aGlzLm91dHB1dHNSZW5hbWV9O1xuXG4gICAgQERpcmVjdGl2ZSh7aml0OiB0cnVlLCAuLi5kaXJlY3RpdmV9KVxuICAgIGNsYXNzIE15Q2xhc3Mge1xuICAgICAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gICAgICBkaXJlY3RpdmUgITogYW5ndWxhci5JRGlyZWN0aXZlO1xuICAgICAgY29uc3RydWN0b3IoXG4gICAgICAgICAgQEluamVjdCgkU0NPUEUpIHNjb3BlOiBhbmd1bGFyLklTY29wZSwgaW5qZWN0b3I6IEluamVjdG9yLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIGNvbnN0IGhlbHBlciA9IG5ldyBVcGdyYWRlSGVscGVyKGluamVjdG9yLCBuYW1lLCBlbGVtZW50UmVmLCB0aGlzLmRpcmVjdGl2ZSk7XG4gICAgICAgIHJldHVybiBuZXcgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXIoXG4gICAgICAgICAgICBoZWxwZXIsIHNjb3BlLCBzZWxmLnRlbXBsYXRlLCBzZWxmLmlucHV0cywgc2VsZi5vdXRwdXRzLCBzZWxmLnByb3BlcnR5T3V0cHV0cyxcbiAgICAgICAgICAgIHNlbGYuY2hlY2tQcm9wZXJ0aWVzLCBzZWxmLnByb3BlcnR5TWFwKSBhcyBhbnk7XG4gICAgICB9XG4gICAgICBuZ09uSW5pdCgpIHsgLyogbmVlZHMgdG8gYmUgaGVyZSBmb3IgbmcyIHRvIHByb3Blcmx5IGRldGVjdCBpdCAqL1xuICAgICAgfVxuICAgICAgbmdPbkNoYW5nZXMoKSB7IC8qIG5lZWRzIHRvIGJlIGhlcmUgZm9yIG5nMiB0byBwcm9wZXJseSBkZXRlY3QgaXQgKi9cbiAgICAgIH1cbiAgICAgIG5nRG9DaGVjaygpIHsgLyogbmVlZHMgdG8gYmUgaGVyZSBmb3IgbmcyIHRvIHByb3Blcmx5IGRldGVjdCBpdCAqL1xuICAgICAgfVxuICAgICAgbmdPbkRlc3Ryb3koKSB7IC8qIG5lZWRzIHRvIGJlIGhlcmUgZm9yIG5nMiB0byBwcm9wZXJseSBkZXRlY3QgaXQgKi9cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50eXBlID0gTXlDbGFzcztcbiAgfVxuXG4gIGV4dHJhY3RCaW5kaW5ncygpIHtcbiAgICBjb25zdCBidGNJc09iamVjdCA9IHR5cGVvZiB0aGlzLmRpcmVjdGl2ZSAhLmJpbmRUb0NvbnRyb2xsZXIgPT09ICdvYmplY3QnO1xuICAgIGlmIChidGNJc09iamVjdCAmJiBPYmplY3Qua2V5cyh0aGlzLmRpcmVjdGl2ZSAhLnNjb3BlICEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgYXJlIG5vdCBzdXBwb3J0ZWQuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dCA9IChidGNJc09iamVjdCkgPyB0aGlzLmRpcmVjdGl2ZSAhLmJpbmRUb0NvbnRyb2xsZXIgOiB0aGlzLmRpcmVjdGl2ZSAhLnNjb3BlO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuICAgICAgICBjb25zdCBiaW5kaW5nT3B0aW9ucyA9IGRlZmluaXRpb24uY2hhckF0KDEpO1xuICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGRlZmluaXRpb24uc3Vic3RyaW5nKGJpbmRpbmdPcHRpb25zID09PSAnPycgPyAyIDogMSkgfHwgcHJvcE5hbWU7XG5cbiAgICAgICAgLy8gUVVFU1RJT046IFdoYXQgYWJvdXQgYD0qYD8gSWdub3JlPyBUaHJvdz8gU3VwcG9ydD9cblxuICAgICAgICBjb25zdCBpbnB1dE5hbWUgPSBgaW5wdXRfJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBpbnB1dE5hbWVSZW5hbWUgPSBgJHtpbnB1dE5hbWV9OiAke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSBgb3V0cHV0XyR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZVJlbmFtZSA9IGAke291dHB1dE5hbWV9OiAke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWVSZW5hbWVDaGFuZ2UgPSBgJHtvdXRwdXROYW1lUmVuYW1lfUNoYW5nZWA7XG5cbiAgICAgICAgc3dpdGNoIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgdGhpcy5pbnB1dHMucHVzaChpbnB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dHNSZW5hbWUucHVzaChpbnB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtpbnB1dE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzUmVuYW1lLnB1c2goaW5wdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbaW5wdXROYW1lXSA9IHByb3BOYW1lO1xuXG4gICAgICAgICAgICB0aGlzLm91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0c1JlbmFtZS5wdXNoKG91dHB1dE5hbWVSZW5hbWVDaGFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtvdXRwdXROYW1lXSA9IHByb3BOYW1lO1xuXG4gICAgICAgICAgICB0aGlzLmNoZWNrUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlPdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgIHRoaXMub3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5vdXRwdXRzUmVuYW1lLnB1c2gob3V0cHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW291dHB1dE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke3RoaXMubmFtZX0nIGRpcmVjdGl2ZS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZ3JhZGUgbmcxIGNvbXBvbmVudHMgaW50byBBbmd1bGFyLlxuICAgKi9cbiAgc3RhdGljIHJlc29sdmUoXG4gICAgICBleHBvcnRlZENvbXBvbmVudHM6IHtbbmFtZTogc3RyaW5nXTogVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSxcbiAgICAgICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IHByb21pc2VzID0gT2JqZWN0LmtleXMoZXhwb3J0ZWRDb21wb25lbnRzKS5tYXAobmFtZSA9PiB7XG4gICAgICBjb25zdCBleHBvcnRlZENvbXBvbmVudCA9IGV4cG9ydGVkQ29tcG9uZW50c1tuYW1lXTtcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50LmRpcmVjdGl2ZSA9IFVwZ3JhZGVIZWxwZXIuZ2V0RGlyZWN0aXZlKCRpbmplY3RvciwgbmFtZSk7XG4gICAgICBleHBvcnRlZENvbXBvbmVudC5leHRyYWN0QmluZGluZ3MoKTtcblxuICAgICAgcmV0dXJuIFByb21pc2VcbiAgICAgICAgICAucmVzb2x2ZShVcGdyYWRlSGVscGVyLmdldFRlbXBsYXRlKCRpbmplY3RvciwgZXhwb3J0ZWRDb21wb25lbnQuZGlyZWN0aXZlLCB0cnVlKSlcbiAgICAgICAgICAudGhlbih0ZW1wbGF0ZSA9PiBleHBvcnRlZENvbXBvbmVudC50ZW1wbGF0ZSA9IHRlbXBsYXRlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gIH1cbn1cblxuY2xhc3MgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXIgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjayB7XG4gIHByaXZhdGUgY29udHJvbGxlckluc3RhbmNlOiBJQ29udHJvbGxlckluc3RhbmNlfG51bGwgPSBudWxsO1xuICBkZXN0aW5hdGlvbk9iajogSUJpbmRpbmdEZXN0aW5hdGlvbnxudWxsID0gbnVsbDtcbiAgY2hlY2tMYXN0VmFsdWVzOiBhbnlbXSA9IFtdO1xuICBwcml2YXRlIGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlO1xuICBlbGVtZW50OiBFbGVtZW50O1xuICAkZWxlbWVudDogYW55ID0gbnVsbDtcbiAgY29tcG9uZW50U2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBoZWxwZXI6IFVwZ3JhZGVIZWxwZXIsIHNjb3BlOiBhbmd1bGFyLklTY29wZSwgcHJpdmF0ZSB0ZW1wbGF0ZTogc3RyaW5nLFxuICAgICAgcHJpdmF0ZSBpbnB1dHM6IHN0cmluZ1tdLCBwcml2YXRlIG91dHB1dHM6IHN0cmluZ1tdLCBwcml2YXRlIHByb3BPdXRzOiBzdHJpbmdbXSxcbiAgICAgIHByaXZhdGUgY2hlY2tQcm9wZXJ0aWVzOiBzdHJpbmdbXSwgcHJpdmF0ZSBwcm9wZXJ0eU1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHtcbiAgICB0aGlzLmRpcmVjdGl2ZSA9IGhlbHBlci5kaXJlY3RpdmU7XG4gICAgdGhpcy5lbGVtZW50ID0gaGVscGVyLmVsZW1lbnQ7XG4gICAgdGhpcy4kZWxlbWVudCA9IGhlbHBlci4kZWxlbWVudDtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlID0gc2NvcGUuJG5ldyghIXRoaXMuZGlyZWN0aXZlLnNjb3BlKTtcblxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcblxuICAgIGlmICh0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyICYmIGNvbnRyb2xsZXJUeXBlKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA9IHRoaXMuaGVscGVyLmJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgdGhpcy5jb21wb25lbnRTY29wZSk7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqID0gdGhpcy5jb250cm9sbGVySW5zdGFuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmogPSB0aGlzLmNvbXBvbmVudFNjb3BlO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAodGhpcyBhcyBhbnkpW2lucHV0c1tpXV0gPSBudWxsO1xuICAgIH1cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG91dHB1dHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IGVtaXR0ZXIgPSAodGhpcyBhcyBhbnkpW291dHB1dHNbal1dID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgICBpZiAodGhpcy5wcm9wT3V0cy5pbmRleE9mKG91dHB1dHNbal0pID09PSAtMSkge1xuICAgICAgICB0aGlzLnNldENvbXBvbmVudFByb3BlcnR5KFxuICAgICAgICAgICAgb3V0cHV0c1tqXSwgKGVtaXR0ZXIgPT4gKHZhbHVlOiBhbnkpID0+IGVtaXR0ZXIuZW1pdCh2YWx1ZSkpKGVtaXR0ZXIpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgayA9IDA7IGsgPCBwcm9wT3V0cy5sZW5ndGg7IGsrKykge1xuICAgICAgdGhpcy5jaGVja0xhc3RWYWx1ZXMucHVzaChJTklUSUFMX1ZBTFVFKTtcbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBDb2xsZWN0IGNvbnRlbnRzLCBpbnNlcnQgYW5kIGNvbXBpbGUgdGVtcGxhdGVcbiAgICBjb25zdCBhdHRhY2hDaGlsZE5vZGVzOiBhbmd1bGFyLklMaW5rRm58dW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSh0aGlzLnRlbXBsYXRlKTtcblxuICAgIC8vIEluc3RhbnRpYXRlIGNvbnRyb2xsZXIgKGlmIG5vdCBhbHJlYWR5IGRvbmUgc28pXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGlmIChjb250cm9sbGVyVHlwZSAmJiAhYmluZFRvQ29udHJvbGxlcikge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuY29tcG9uZW50U2NvcGUpO1xuICAgIH1cblxuICAgIC8vIFJlcXVpcmUgb3RoZXIgY29udHJvbGxlcnNcbiAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzID1cbiAgICAgICAgdGhpcy5oZWxwZXIucmVzb2x2ZUFuZEJpbmRSZXF1aXJlZENvbnRyb2xsZXJzKHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcblxuICAgIC8vIEhvb2s6ICRvbkluaXRcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCgpO1xuICAgIH1cblxuICAgIC8vIExpbmtpbmdcbiAgICBjb25zdCBsaW5rID0gdGhpcy5kaXJlY3RpdmUubGluaztcbiAgICBjb25zdCBwcmVMaW5rID0gKHR5cGVvZiBsaW5rID09ICdvYmplY3QnKSAmJiAobGluayBhcyBhbmd1bGFyLklEaXJlY3RpdmVQcmVQb3N0KS5wcmU7XG4gICAgY29uc3QgcG9zdExpbmsgPSAodHlwZW9mIGxpbmsgPT0gJ29iamVjdCcpID8gKGxpbmsgYXMgYW5ndWxhci5JRGlyZWN0aXZlUHJlUG9zdCkucG9zdCA6IGxpbms7XG4gICAgY29uc3QgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMgPSBOT1RfU1VQUE9SVEVEO1xuICAgIGNvbnN0IHRyYW5zY2x1ZGVGbjogYW5ndWxhci5JVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy5jb21wb25lbnRTY29wZSwgbnVsbCAhLCB7cGFyZW50Qm91bmRUcmFuc2NsdWRlRm46IGF0dGFjaENoaWxkTm9kZXN9KTtcblxuICAgIGlmIChwb3N0TGluaykge1xuICAgICAgcG9zdExpbmsodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJHBvc3RMaW5rXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IG5nMUNoYW5nZXM6IGFueSA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGNoYW5nZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBjb25zdCBjaGFuZ2U6IFNpbXBsZUNoYW5nZSA9IGNoYW5nZXNbbmFtZV07XG4gICAgICB0aGlzLnNldENvbXBvbmVudFByb3BlcnR5KG5hbWUsIGNoYW5nZS5jdXJyZW50VmFsdWUpO1xuICAgICAgbmcxQ2hhbmdlc1t0aGlzLnByb3BlcnR5TWFwW25hbWVdXSA9IGNoYW5nZTtcbiAgICB9KTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuZGVzdGluYXRpb25PYmogIS4kb25DaGFuZ2VzKSkge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiAhLiRvbkNoYW5nZXMgIShuZzFDaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3QgZGVzdGluYXRpb25PYmogPSB0aGlzLmRlc3RpbmF0aW9uT2JqO1xuICAgIGNvbnN0IGxhc3RWYWx1ZXMgPSB0aGlzLmNoZWNrTGFzdFZhbHVlcztcbiAgICBjb25zdCBjaGVja1Byb3BlcnRpZXMgPSB0aGlzLmNoZWNrUHJvcGVydGllcztcbiAgICBjb25zdCBwcm9wT3V0cyA9IHRoaXMucHJvcE91dHM7XG4gICAgY2hlY2tQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGRlc3RpbmF0aW9uT2JqICFbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgbGFzdCA9IGxhc3RWYWx1ZXNbaV07XG4gICAgICBpZiAoIXN0cmljdEVxdWFscyhsYXN0LCB2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbcHJvcE91dHNbaV1dO1xuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChsYXN0VmFsdWVzW2ldID0gdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2spKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkgeyB0aGlzLmhlbHBlci5vbkRlc3Ryb3kodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy5jb250cm9sbGVySW5zdGFuY2UpOyB9XG5cbiAgc2V0Q29tcG9uZW50UHJvcGVydHkobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5kZXN0aW5hdGlvbk9iaiAhW3RoaXMucHJvcGVydHlNYXBbbmFtZV1dID0gdmFsdWU7XG4gIH1cbn1cbiJdfQ==