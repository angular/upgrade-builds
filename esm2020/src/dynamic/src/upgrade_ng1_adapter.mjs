import { __decorate, __metadata, __param } from "tslib";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject, Injector } from '@angular/core';
import { $SCOPE } from '../../common/src/constants';
import { UpgradeHelper } from '../../common/src/upgrade_helper';
import { isFunction, strictEquals } from '../../common/src/util';
import * as i0 from "@angular/core";
import * as i1 from "../../common/src/upgrade_helper";
const CAMEL_CASE = /([A-Z])/g;
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
const NOT_SUPPORTED = 'NOT_SUPPORTED';
function getInputPropertyMapName(name) {
    return `input_${name}`;
}
function getOutputPropertyMapName(name) {
    return `output_${name}`;
}
export class UpgradeNg1ComponentAdapterBuilder {
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
        const selector = name.replace(CAMEL_CASE, (all, next) => '-' + next.toLowerCase());
        const self = this;
        // Note: There is a bug in TS 2.4 that prevents us from
        // inlining this into @Directive
        // TODO(tbosch): find or file a bug against TypeScript for this.
        const directive = { selector: selector, inputs: this.inputsRename, outputs: this.outputsRename };
        let MyClass = class MyClass extends UpgradeNg1ComponentAdapter {
            constructor(scope, injector, elementRef) {
                super(new UpgradeHelper(injector, name, elementRef, self.directive || undefined), scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
            }
        };
        MyClass = __decorate([
            Directive({ jit: true, ...directive }),
            __param(0, Inject($SCOPE)),
            __metadata("design:paramtypes", [Object, Injector, ElementRef])
        ], MyClass);
        this.type = MyClass;
    }
    extractBindings() {
        const btcIsObject = typeof this.directive.bindToController === 'object';
        if (btcIsObject && Object.keys(this.directive.scope).length) {
            throw new Error(`Binding definitions on scope and controller at the same time are not supported.`);
        }
        const context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;
        if (typeof context == 'object') {
            Object.keys(context).forEach(propName => {
                const definition = context[propName];
                const bindingType = definition.charAt(0);
                const bindingOptions = definition.charAt(1);
                const attrName = definition.substring(bindingOptions === '?' ? 2 : 1) || propName;
                // QUESTION: What about `=*`? Ignore? Throw? Support?
                const inputName = getInputPropertyMapName(attrName);
                const inputNameRename = `${inputName}: ${attrName}`;
                const outputName = getOutputPropertyMapName(attrName);
                const outputNameRename = `${outputName}: ${attrName}`;
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
                        let json = JSON.stringify(context);
                        throw new Error(`Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
                }
            });
        }
    }
    /**
     * Upgrade ng1 components into Angular.
     */
    static resolve(exportedComponents, $injector) {
        const promises = Object.keys(exportedComponents).map(name => {
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
class UpgradeNg1ComponentAdapter {
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
        const controllerType = this.directive.controller;
        if (this.directive.bindToController && controllerType) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
            this.destinationObj = this.controllerInstance;
        }
        else {
            this.destinationObj = this.componentScope;
        }
        for (let i = 0; i < inputs.length; i++) {
            this[inputs[i]] = null;
        }
        for (let j = 0; j < outputs.length; j++) {
            const emitter = this[outputs[j]] = new EventEmitter();
            if (this.propOuts.indexOf(outputs[j]) === -1) {
                this.setComponentProperty(outputs[j], (emitter => (value) => emitter.emit(value))(emitter));
            }
        }
        for (let k = 0; k < propOuts.length; k++) {
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    ngOnInit() {
        // Collect contents, insert and compile template
        const attachChildNodes = this.helper.prepareTransclusion();
        const linkFn = this.helper.compileTemplate(this.template);
        // Instantiate controller (if not already done so)
        const controllerType = this.directive.controller;
        const bindToController = this.directive.bindToController;
        if (controllerType && !bindToController) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
        }
        // Require other controllers
        const requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
        // Hook: $onInit
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        // Linking
        const link = this.directive.link;
        const preLink = typeof link == 'object' && link.pre;
        const postLink = typeof link == 'object' ? link.post : link;
        const attrs = NOT_SUPPORTED;
        const transcludeFn = NOT_SUPPORTED;
        if (preLink) {
            preLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        linkFn(this.componentScope, null, { parentBoundTranscludeFn: attachChildNodes });
        if (postLink) {
            postLink(this.componentScope, this.$element, attrs, requiredControllers, transcludeFn);
        }
        // Hook: $postLink
        if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
            this.controllerInstance.$postLink();
        }
    }
    ngOnChanges(changes) {
        const ng1Changes = {};
        Object.keys(changes).forEach(name => {
            const change = changes[name];
            const propertyMapName = getInputPropertyMapName(name);
            this.setComponentProperty(propertyMapName, change.currentValue);
            ng1Changes[this.propertyMap[propertyMapName]] = change;
        });
        if (isFunction(this.destinationObj.$onChanges)) {
            this.destinationObj.$onChanges(ng1Changes);
        }
    }
    ngDoCheck() {
        const destinationObj = this.destinationObj;
        const lastValues = this.checkLastValues;
        const checkProperties = this.checkProperties;
        const propOuts = this.propOuts;
        checkProperties.forEach((propName, i) => {
            const value = destinationObj[propName];
            const last = lastValues[i];
            if (!strictEquals(last, value)) {
                const eventEmitter = this[propOuts[i]];
                eventEmitter.emit(lastValues[i] = value);
            }
        });
        if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
            this.controllerInstance.$doCheck();
        }
    }
    ngOnDestroy() {
        this.helper.onDestroy(this.componentScope, this.controllerInstance);
    }
    setComponentProperty(name, value) {
        this.destinationObj[this.propertyMap[name]] = value;
    }
}
UpgradeNg1ComponentAdapter.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.1+sha-a0cb501", ngImport: i0, type: UpgradeNg1ComponentAdapter, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive });
UpgradeNg1ComponentAdapter.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.1+sha-a0cb501", type: UpgradeNg1ComponentAdapter, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.1+sha-a0cb501", ngImport: i0, type: UpgradeNg1ComponentAdapter, decorators: [{
            type: Directive
        }], ctorParameters: function () { return [{ type: i1.UpgradeHelper }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2R5bmFtaWMvc3JjL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQVcsVUFBVSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFrRSxNQUFNLGVBQWUsQ0FBQztBQUc5SixPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDbEQsT0FBTyxFQUEyQyxhQUFhLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUN4RyxPQUFPLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBQyxNQUFNLHVCQUF1QixDQUFDOzs7QUFHL0QsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzlCLE1BQU0sYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUNGLE1BQU0sYUFBYSxHQUFRLGVBQWUsQ0FBQztBQUUzQyxTQUFTLHVCQUF1QixDQUFDLElBQVk7SUFDM0MsT0FBTyxTQUFTLElBQUksRUFBRSxDQUFDO0FBQ3pCLENBQUM7QUFFRCxTQUFTLHdCQUF3QixDQUFDLElBQVk7SUFDNUMsT0FBTyxVQUFVLElBQUksRUFBRSxDQUFDO0FBQzFCLENBQUM7QUFFRCxNQUFNLE9BQU8saUNBQWlDO0lBYzVDLFlBQW1CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBWC9CLFdBQU0sR0FBYSxFQUFFLENBQUM7UUFDdEIsaUJBQVksR0FBYSxFQUFFLENBQUM7UUFDNUIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixrQkFBYSxHQUFhLEVBQUUsQ0FBQztRQUM3QixvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUMvQixvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUMv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QUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLGNBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4QyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLE1BQU0sWUFBWSxHQUF1QixJQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO2FBQzFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNwQztJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQsb0JBQW9CLENBQUMsSUFBWSxFQUFFLEtBQVU7UUFDM0MsSUFBSSxDQUFDLGNBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3ZELENBQUM7O2tJQTVIRywwQkFBMEI7c0hBQTFCLDBCQUEwQjtzR0FBMUIsMEJBQTBCO2tCQUQvQixTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdCwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFNpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlcywgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SUF0dHJpYnV0ZXMsIElEaXJlY3RpdmUsIElEaXJlY3RpdmVQcmVQb3N0LCBJSW5qZWN0b3JTZXJ2aWNlLCBJTGlua0ZuLCBJU2NvcGUsIElUcmFuc2NsdWRlRnVuY3Rpb259IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvYW5ndWxhcjEnO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7SUJpbmRpbmdEZXN0aW5hdGlvbiwgSUNvbnRyb2xsZXJJbnN0YW5jZSwgVXBncmFkZUhlbHBlcn0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy91cGdyYWRlX2hlbHBlcic7XG5pbXBvcnQge2lzRnVuY3Rpb24sIHN0cmljdEVxdWFsc30gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy91dGlsJztcblxuXG5jb25zdCBDQU1FTF9DQVNFID0gLyhbQS1aXSkvZztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuXG5mdW5jdGlvbiBnZXRJbnB1dFByb3BlcnR5TWFwTmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYGlucHV0XyR7bmFtZX1gO1xufVxuXG5mdW5jdGlvbiBnZXRPdXRwdXRQcm9wZXJ0eU1hcE5hbWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBvdXRwdXRfJHtuYW1lfWA7XG59XG5cbmV4cG9ydCBjbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgdHlwZSE6IFR5cGU8YW55PjtcbiAgaW5wdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBpbnB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHM6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIHByb3BlcnR5T3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgY2hlY2tQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICBwcm9wZXJ0eU1hcDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGRpcmVjdGl2ZTogSURpcmVjdGl2ZXxudWxsID0gbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHRlbXBsYXRlITogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9XG4gICAgICAgIG5hbWUucmVwbGFjZShDQU1FTF9DQVNFLCAoYWxsOiBzdHJpbmcsIG5leHQ6IHN0cmluZykgPT4gJy0nICsgbmV4dC50b0xvd2VyQ2FzZSgpKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIE5vdGU6IFRoZXJlIGlzIGEgYnVnIGluIFRTIDIuNCB0aGF0IHByZXZlbnRzIHVzIGZyb21cbiAgICAvLyBpbmxpbmluZyB0aGlzIGludG8gQERpcmVjdGl2ZVxuICAgIC8vIFRPRE8odGJvc2NoKTogZmluZCBvciBmaWxlIGEgYnVnIGFnYWluc3QgVHlwZVNjcmlwdCBmb3IgdGhpcy5cbiAgICBjb25zdCBkaXJlY3RpdmUgPSB7c2VsZWN0b3I6IHNlbGVjdG9yLCBpbnB1dHM6IHRoaXMuaW5wdXRzUmVuYW1lLCBvdXRwdXRzOiB0aGlzLm91dHB1dHNSZW5hbWV9O1xuXG4gICAgQERpcmVjdGl2ZSh7aml0OiB0cnVlLCAuLi5kaXJlY3RpdmV9KVxuICAgIGNsYXNzIE15Q2xhc3MgZXh0ZW5kcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlciBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9uRGVzdHJveSB7XG4gICAgICBjb25zdHJ1Y3RvcihASW5qZWN0KCRTQ09QRSkgc2NvcGU6IElTY29wZSwgaW5qZWN0b3I6IEluamVjdG9yLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHN1cGVyKFxuICAgICAgICAgICAgbmV3IFVwZ3JhZGVIZWxwZXIoaW5qZWN0b3IsIG5hbWUsIGVsZW1lbnRSZWYsIHNlbGYuZGlyZWN0aXZlIHx8IHVuZGVmaW5lZCksIHNjb3BlLFxuICAgICAgICAgICAgc2VsZi50ZW1wbGF0ZSwgc2VsZi5pbnB1dHMsIHNlbGYub3V0cHV0cywgc2VsZi5wcm9wZXJ0eU91dHB1dHMsIHNlbGYuY2hlY2tQcm9wZXJ0aWVzLFxuICAgICAgICAgICAgc2VsZi5wcm9wZXJ0eU1hcCkgYXMgYW55O1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnR5cGUgPSBNeUNsYXNzO1xuICB9XG5cbiAgZXh0cmFjdEJpbmRpbmdzKCkge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIHRoaXMuZGlyZWN0aXZlIS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXModGhpcy5kaXJlY3RpdmUhLnNjb3BlISkubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEJpbmRpbmcgZGVmaW5pdGlvbnMgb24gc2NvcGUgYW5kIGNvbnRyb2xsZXIgYXQgdGhlIHNhbWUgdGltZSBhcmUgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gKGJ0Y0lzT2JqZWN0KSA/IHRoaXMuZGlyZWN0aXZlIS5iaW5kVG9Db250cm9sbGVyIDogdGhpcy5kaXJlY3RpdmUhLnNjb3BlO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuICAgICAgICBjb25zdCBiaW5kaW5nT3B0aW9ucyA9IGRlZmluaXRpb24uY2hhckF0KDEpO1xuICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGRlZmluaXRpb24uc3Vic3RyaW5nKGJpbmRpbmdPcHRpb25zID09PSAnPycgPyAyIDogMSkgfHwgcHJvcE5hbWU7XG5cbiAgICAgICAgLy8gUVVFU1RJT046IFdoYXQgYWJvdXQgYD0qYD8gSWdub3JlPyBUaHJvdz8gU3VwcG9ydD9cblxuICAgICAgICBjb25zdCBpbnB1dE5hbWUgPSBnZXRJbnB1dFByb3BlcnR5TWFwTmFtZShhdHRyTmFtZSk7XG4gICAgICAgIGNvbnN0IGlucHV0TmFtZVJlbmFtZSA9IGAke2lucHV0TmFtZX06ICR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IGdldE91dHB1dFByb3BlcnR5TWFwTmFtZShhdHRyTmFtZSk7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWVSZW5hbWUgPSBgJHtvdXRwdXROYW1lfTogJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lUmVuYW1lQ2hhbmdlID0gYCR7b3V0cHV0TmFtZVJlbmFtZX1DaGFuZ2VgO1xuXG4gICAgICAgIHN3aXRjaCAoYmluZGluZ1R5cGUpIHtcbiAgICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzUmVuYW1lLnB1c2goaW5wdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbaW5wdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlucHV0c1JlbmFtZS5wdXNoKGlucHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW2lucHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLm91dHB1dHNSZW5hbWUucHVzaChvdXRwdXROYW1lUmVuYW1lQ2hhbmdlKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbb3V0cHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5jaGVja1Byb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5T3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICB0aGlzLm91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0c1JlbmFtZS5wdXNoKG91dHB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtvdXRwdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxldCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGV4dCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgbWFwcGluZyAnJHtiaW5kaW5nVHlwZX0nIGluICcke2pzb259JyBpbiAnJHt0aGlzLm5hbWV9JyBkaXJlY3RpdmUuYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGdyYWRlIG5nMSBjb21wb25lbnRzIGludG8gQW5ndWxhci5cbiAgICovXG4gIHN0YXRpYyByZXNvbHZlKFxuICAgICAgZXhwb3J0ZWRDb21wb25lbnRzOiB7W25hbWU6IHN0cmluZ106IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0sXG4gICAgICAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBPYmplY3Qua2V5cyhleHBvcnRlZENvbXBvbmVudHMpLm1hcChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGV4cG9ydGVkQ29tcG9uZW50ID0gZXhwb3J0ZWRDb21wb25lbnRzW25hbWVdO1xuICAgICAgZXhwb3J0ZWRDb21wb25lbnQuZGlyZWN0aXZlID0gVXBncmFkZUhlbHBlci5nZXREaXJlY3RpdmUoJGluamVjdG9yLCBuYW1lKTtcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50LmV4dHJhY3RCaW5kaW5ncygpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgIC5yZXNvbHZlKFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUoJGluamVjdG9yLCBleHBvcnRlZENvbXBvbmVudC5kaXJlY3RpdmUsIHRydWUpKVxuICAgICAgICAgIC50aGVuKHRlbXBsYXRlID0+IGV4cG9ydGVkQ29tcG9uZW50LnRlbXBsYXRlID0gdGVtcGxhdGUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxufVxuXG5ARGlyZWN0aXZlKClcbmNsYXNzIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIERvQ2hlY2sge1xuICBwcml2YXRlIGNvbnRyb2xsZXJJbnN0YW5jZTogSUNvbnRyb2xsZXJJbnN0YW5jZXxudWxsID0gbnVsbDtcbiAgZGVzdGluYXRpb25PYmo6IElCaW5kaW5nRGVzdGluYXRpb258bnVsbCA9IG51bGw7XG4gIGNoZWNrTGFzdFZhbHVlczogYW55W10gPSBbXTtcbiAgZGlyZWN0aXZlOiBJRGlyZWN0aXZlO1xuICBlbGVtZW50OiBFbGVtZW50O1xuICAkZWxlbWVudDogYW55ID0gbnVsbDtcbiAgY29tcG9uZW50U2NvcGU6IElTY29wZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaGVscGVyOiBVcGdyYWRlSGVscGVyLCBzY29wZTogSVNjb3BlLCBwcml2YXRlIHRlbXBsYXRlOiBzdHJpbmcsXG4gICAgICBwcml2YXRlIGlucHV0czogc3RyaW5nW10sIHByaXZhdGUgb3V0cHV0czogc3RyaW5nW10sIHByaXZhdGUgcHJvcE91dHM6IHN0cmluZ1tdLFxuICAgICAgcHJpdmF0ZSBjaGVja1Byb3BlcnRpZXM6IHN0cmluZ1tdLCBwcml2YXRlIHByb3BlcnR5TWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgIHRoaXMuZGlyZWN0aXZlID0gaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmVsZW1lbnQgPSBoZWxwZXIuZWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gaGVscGVyLiRlbGVtZW50O1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuXG4gICAgaWYgKHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgJiYgY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLmNvbXBvbmVudFNjb3BlKTtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmogPSB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiA9IHRoaXMuY29tcG9uZW50U2NvcGU7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICh0aGlzIGFzIGFueSlbaW5wdXRzW2ldXSA9IG51bGw7XG4gICAgfVxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgb3V0cHV0cy5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgZW1pdHRlciA9ICh0aGlzIGFzIGFueSlbb3V0cHV0c1tqXV0gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICAgIGlmICh0aGlzLnByb3BPdXRzLmluZGV4T2Yob3V0cHV0c1tqXSkgPT09IC0xKSB7XG4gICAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkoXG4gICAgICAgICAgICBvdXRwdXRzW2pdLCAoZW1pdHRlciA9PiAodmFsdWU6IGFueSkgPT4gZW1pdHRlci5lbWl0KHZhbHVlKSkoZW1pdHRlcikpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBrID0gMDsgayA8IHByb3BPdXRzLmxlbmd0aDsgaysrKSB7XG4gICAgICB0aGlzLmNoZWNrTGFzdFZhbHVlcy5wdXNoKElOSVRJQUxfVkFMVUUpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIENvbGxlY3QgY29udGVudHMsIGluc2VydCBhbmQgY29tcGlsZSB0ZW1wbGF0ZVxuICAgIGNvbnN0IGF0dGFjaENoaWxkTm9kZXM6IElMaW5rRm58dW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSh0aGlzLnRlbXBsYXRlKTtcblxuICAgIC8vIEluc3RhbnRpYXRlIGNvbnRyb2xsZXIgKGlmIG5vdCBhbHJlYWR5IGRvbmUgc28pXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGlmIChjb250cm9sbGVyVHlwZSAmJiAhYmluZFRvQ29udHJvbGxlcikge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuY29tcG9uZW50U2NvcGUpO1xuICAgIH1cblxuICAgIC8vIFJlcXVpcmUgb3RoZXIgY29udHJvbGxlcnNcbiAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzID1cbiAgICAgICAgdGhpcy5oZWxwZXIucmVzb2x2ZUFuZEJpbmRSZXF1aXJlZENvbnRyb2xsZXJzKHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcblxuICAgIC8vIEhvb2s6ICRvbkluaXRcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCgpO1xuICAgIH1cblxuICAgIC8vIExpbmtpbmdcbiAgICBjb25zdCBsaW5rID0gdGhpcy5kaXJlY3RpdmUubGluaztcbiAgICBjb25zdCBwcmVMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgJiYgbGluay5wcmU7XG4gICAgY29uc3QgcG9zdExpbmsgPSB0eXBlb2YgbGluayA9PSAnb2JqZWN0JyA/IGxpbmsucG9zdCA6IGxpbms7XG4gICAgY29uc3QgYXR0cnM6IElBdHRyaWJ1dGVzID0gTk9UX1NVUFBPUlRFRDtcbiAgICBjb25zdCB0cmFuc2NsdWRlRm46IElUcmFuc2NsdWRlRnVuY3Rpb24gPSBOT1RfU1VQUE9SVEVEO1xuICAgIGlmIChwcmVMaW5rKSB7XG4gICAgICBwcmVMaW5rKHRoaXMuY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIGxpbmtGbih0aGlzLmNvbXBvbmVudFNjb3BlLCBudWxsISwge3BhcmVudEJvdW5kVHJhbnNjbHVkZUZuOiBhdHRhY2hDaGlsZE5vZGVzfSk7XG5cbiAgICBpZiAocG9zdExpbmspIHtcbiAgICAgIHBvc3RMaW5rKHRoaXMuY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRwb3N0TGlua1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBuZzFDaGFuZ2VzOiBhbnkgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjaGFuZ2VzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgY2hhbmdlOiBTaW1wbGVDaGFuZ2UgPSBjaGFuZ2VzW25hbWVdO1xuICAgICAgY29uc3QgcHJvcGVydHlNYXBOYW1lID0gZ2V0SW5wdXRQcm9wZXJ0eU1hcE5hbWUobmFtZSk7XG4gICAgICB0aGlzLnNldENvbXBvbmVudFByb3BlcnR5KHByb3BlcnR5TWFwTmFtZSwgY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgICBuZzFDaGFuZ2VzW3RoaXMucHJvcGVydHlNYXBbcHJvcGVydHlNYXBOYW1lXV0gPSBjaGFuZ2U7XG4gICAgfSk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLmRlc3RpbmF0aW9uT2JqIS4kb25DaGFuZ2VzKSkge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiEuJG9uQ2hhbmdlcyEobmcxQ2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGNvbnN0IGRlc3RpbmF0aW9uT2JqID0gdGhpcy5kZXN0aW5hdGlvbk9iajtcbiAgICBjb25zdCBsYXN0VmFsdWVzID0gdGhpcy5jaGVja0xhc3RWYWx1ZXM7XG4gICAgY29uc3QgY2hlY2tQcm9wZXJ0aWVzID0gdGhpcy5jaGVja1Byb3BlcnRpZXM7XG4gICAgY29uc3QgcHJvcE91dHMgPSB0aGlzLnByb3BPdXRzO1xuICAgIGNoZWNrUHJvcGVydGllcy5mb3JFYWNoKChwcm9wTmFtZSwgaSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBkZXN0aW5hdGlvbk9iaiFbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgbGFzdCA9IGxhc3RWYWx1ZXNbaV07XG4gICAgICBpZiAoIXN0cmljdEVxdWFscyhsYXN0LCB2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbcHJvcE91dHNbaV1dO1xuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChsYXN0VmFsdWVzW2ldID0gdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2spKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuaGVscGVyLm9uRGVzdHJveSh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSk7XG4gIH1cblxuICBzZXRDb21wb25lbnRQcm9wZXJ0eShuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLmRlc3RpbmF0aW9uT2JqIVt0aGlzLnByb3BlcnR5TWFwW25hbWVdXSA9IHZhbHVlO1xuICB9XG59XG4iXX0=