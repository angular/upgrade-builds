import { __decorate, __metadata } from "tslib";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject, Injector, } from '@angular/core';
import { $SCOPE } from '../../common/src/constants';
import { UpgradeHelper, } from '../../common/src/upgrade_helper';
import { isFunction, strictEquals } from '../../common/src/util';
import { trustedHTMLFromLegacyTemplate } from '../../common/src/security/trusted_types';
import * as i0 from "@angular/core";
import * as i1 from "../../common/src/upgrade_helper";
const CAMEL_CASE = /([A-Z])/g;
const INITIAL_VALUE = {
    __UNINITIALIZED__: true,
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
        let MyClass = class MyClass extends UpgradeNg1ComponentAdapter {
            constructor(scope, injector, elementRef) {
                super(new UpgradeHelper(injector, name, elementRef, self.directive || undefined), scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
            }
            static { this.ctorParameters = () => [
                { type: undefined, decorators: [{ type: Inject, args: [$SCOPE,] }] },
                { type: Injector },
                { type: ElementRef }
            ]; }
        };
        MyClass = __decorate([
            Directive({
                jit: true,
                selector: selector,
                inputs: this.inputsRename,
                outputs: this.outputsRename,
            }),
            __metadata("design:paramtypes", [Object, Injector, ElementRef])
        ], MyClass);
        this.type = MyClass;
    }
    extractBindings() {
        const btcIsObject = typeof this.directive.bindToController === 'object';
        if (btcIsObject && Object.keys(this.directive.scope).length) {
            throw new Error(`Binding definitions on scope and controller at the same time are not supported.`);
        }
        const context = btcIsObject ? this.directive.bindToController : this.directive.scope;
        if (typeof context == 'object') {
            Object.keys(context).forEach((propName) => {
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
        const promises = Object.entries(exportedComponents).map(([name, exportedComponent]) => {
            exportedComponent.directive = UpgradeHelper.getDirective($injector, name);
            exportedComponent.extractBindings();
            return Promise.resolve(UpgradeHelper.getTemplate($injector, exportedComponent.directive, true)).then((template) => (exportedComponent.template = template));
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
        for (const input of this.inputs) {
            this[input] = null;
        }
        for (const output of this.outputs) {
            const emitter = (this[output] = new EventEmitter());
            if (this.propOuts.indexOf(output) === -1) {
                this.setComponentProperty(output, ((emitter) => (value) => emitter.emit(value))(emitter));
            }
        }
        this.checkLastValues.push(...Array(propOuts.length).fill(INITIAL_VALUE));
    }
    ngOnInit() {
        // Collect contents, insert and compile template
        const attachChildNodes = this.helper.prepareTransclusion();
        const linkFn = this.helper.compileTemplate(trustedHTMLFromLegacyTemplate(this.template));
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
        Object.keys(changes).forEach((propertyMapName) => {
            const change = changes[propertyMapName];
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
                eventEmitter.emit((lastValues[i] = value));
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.2.2+sha-614c311", ngImport: i0, type: UpgradeNg1ComponentAdapter, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.2.2+sha-614c311", type: UpgradeNg1ComponentAdapter, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.2.2+sha-614c311", ngImport: i0, type: UpgradeNg1ComponentAdapter, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i1.UpgradeHelper }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2R5bmFtaWMvc3JjL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBRVQsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sUUFBUSxHQU9ULE1BQU0sZUFBZSxDQUFDO0FBVXZCLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNsRCxPQUFPLEVBR0wsYUFBYSxHQUNkLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsNkJBQTZCLEVBQUMsTUFBTSx5Q0FBeUMsQ0FBQzs7O0FBRXRGLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM5QixNQUFNLGFBQWEsR0FBRztJQUNwQixpQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFDRixNQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFFM0MsU0FBUyx1QkFBdUIsQ0FBQyxJQUFZO0lBQzNDLE9BQU8sU0FBUyxJQUFJLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBRUQsU0FBUyx3QkFBd0IsQ0FBQyxJQUFZO0lBQzVDLE9BQU8sVUFBVSxJQUFJLEVBQUUsQ0FBQztBQUMxQixDQUFDO0FBRUQsTUFBTSxPQUFPLGlDQUFpQztJQVk1QyxZQUFtQixJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQVYvQixXQUFNLEdBQWEsRUFBRSxDQUFDO1FBQ3RCLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBQzVCLFlBQU8sR0FBYSxFQUFFLENBQUM7UUFDdkIsa0JBQWEsR0FBYSxFQUFFLENBQUM7UUFDN0Isb0JBQWUsR0FB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TSxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sWUFBWSxHQUF1QixJQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDNUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3JDLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVELG9CQUFvQixDQUFDLElBQVksRUFBRSxLQUFVO1FBQzNDLElBQUksQ0FBQyxjQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN2RCxDQUFDO3lIQXJJRywwQkFBMEI7NkdBQTFCLDBCQUEwQjs7c0dBQTFCLDBCQUEwQjtrQkFEL0IsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIERvQ2hlY2ssXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3RvcixcbiAgT25DaGFuZ2VzLFxuICBPbkRlc3Ryb3ksXG4gIE9uSW5pdCxcbiAgU2ltcGxlQ2hhbmdlLFxuICBTaW1wbGVDaGFuZ2VzLFxuICBUeXBlLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtcbiAgSUF0dHJpYnV0ZXMsXG4gIElEaXJlY3RpdmUsXG4gIElJbmplY3RvclNlcnZpY2UsXG4gIElMaW5rRm4sXG4gIElTY29wZSxcbiAgSVRyYW5zY2x1ZGVGdW5jdGlvbixcbn0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9jb25zdGFudHMnO1xuaW1wb3J0IHtcbiAgSUJpbmRpbmdEZXN0aW5hdGlvbixcbiAgSUNvbnRyb2xsZXJJbnN0YW5jZSxcbiAgVXBncmFkZUhlbHBlcixcbn0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy91cGdyYWRlX2hlbHBlcic7XG5pbXBvcnQge2lzRnVuY3Rpb24sIHN0cmljdEVxdWFsc30gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy91dGlsJztcbmltcG9ydCB7dHJ1c3RlZEhUTUxGcm9tTGVnYWN5VGVtcGxhdGV9IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvc2VjdXJpdHkvdHJ1c3RlZF90eXBlcyc7XG5cbmNvbnN0IENBTUVMX0NBU0UgPSAvKFtBLVpdKS9nO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWUsXG59O1xuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuXG5mdW5jdGlvbiBnZXRJbnB1dFByb3BlcnR5TWFwTmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYGlucHV0XyR7bmFtZX1gO1xufVxuXG5mdW5jdGlvbiBnZXRPdXRwdXRQcm9wZXJ0eU1hcE5hbWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBvdXRwdXRfJHtuYW1lfWA7XG59XG5cbmV4cG9ydCBjbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIge1xuICB0eXBlOiBUeXBlPGFueT47XG4gIGlucHV0czogc3RyaW5nW10gPSBbXTtcbiAgaW5wdXRzUmVuYW1lOiBzdHJpbmdbXSA9IFtdO1xuICBvdXRwdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBvdXRwdXRzUmVuYW1lOiBzdHJpbmdbXSA9IFtdO1xuICBwcm9wZXJ0eU91dHB1dHM6IHN0cmluZ1tdID0gW107XG4gIGNoZWNrUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgcHJvcGVydHlNYXA6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBkaXJlY3RpdmU6IElEaXJlY3RpdmUgfCBudWxsID0gbnVsbDtcbiAgdGVtcGxhdGUhOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gbmFtZS5yZXBsYWNlKFxuICAgICAgQ0FNRUxfQ0FTRSxcbiAgICAgIChhbGw6IHN0cmluZywgbmV4dDogc3RyaW5nKSA9PiAnLScgKyBuZXh0LnRvTG93ZXJDYXNlKCksXG4gICAgKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIEBEaXJlY3RpdmUoe1xuICAgICAgaml0OiB0cnVlLFxuICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgaW5wdXRzOiB0aGlzLmlucHV0c1JlbmFtZSxcbiAgICAgIG91dHB1dHM6IHRoaXMub3V0cHV0c1JlbmFtZSxcbiAgICB9KVxuICAgIGNsYXNzIE15Q2xhc3NcbiAgICAgIGV4dGVuZHMgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJcbiAgICAgIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIERvQ2hlY2ssIE9uRGVzdHJveVxuICAgIHtcbiAgICAgIGNvbnN0cnVjdG9yKEBJbmplY3QoJFNDT1BFKSBzY29wZTogSVNjb3BlLCBpbmplY3RvcjogSW5qZWN0b3IsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgc3VwZXIoXG4gICAgICAgICAgbmV3IFVwZ3JhZGVIZWxwZXIoaW5qZWN0b3IsIG5hbWUsIGVsZW1lbnRSZWYsIHNlbGYuZGlyZWN0aXZlIHx8IHVuZGVmaW5lZCksXG4gICAgICAgICAgc2NvcGUsXG4gICAgICAgICAgc2VsZi50ZW1wbGF0ZSxcbiAgICAgICAgICBzZWxmLmlucHV0cyxcbiAgICAgICAgICBzZWxmLm91dHB1dHMsXG4gICAgICAgICAgc2VsZi5wcm9wZXJ0eU91dHB1dHMsXG4gICAgICAgICAgc2VsZi5jaGVja1Byb3BlcnRpZXMsXG4gICAgICAgICAgc2VsZi5wcm9wZXJ0eU1hcCxcbiAgICAgICAgKSBhcyBhbnk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudHlwZSA9IE15Q2xhc3M7XG4gIH1cblxuICBleHRyYWN0QmluZGluZ3MoKSB7XG4gICAgY29uc3QgYnRjSXNPYmplY3QgPSB0eXBlb2YgdGhpcy5kaXJlY3RpdmUhLmJpbmRUb0NvbnRyb2xsZXIgPT09ICdvYmplY3QnO1xuICAgIGlmIChidGNJc09iamVjdCAmJiBPYmplY3Qua2V5cyh0aGlzLmRpcmVjdGl2ZSEuc2NvcGUhKS5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYEJpbmRpbmcgZGVmaW5pdGlvbnMgb24gc2NvcGUgYW5kIGNvbnRyb2xsZXIgYXQgdGhlIHNhbWUgdGltZSBhcmUgbm90IHN1cHBvcnRlZC5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gYnRjSXNPYmplY3QgPyB0aGlzLmRpcmVjdGl2ZSEuYmluZFRvQ29udHJvbGxlciA6IHRoaXMuZGlyZWN0aXZlIS5zY29wZTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoY29udGV4dCkuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuICAgICAgICBjb25zdCBiaW5kaW5nT3B0aW9ucyA9IGRlZmluaXRpb24uY2hhckF0KDEpO1xuICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGRlZmluaXRpb24uc3Vic3RyaW5nKGJpbmRpbmdPcHRpb25zID09PSAnPycgPyAyIDogMSkgfHwgcHJvcE5hbWU7XG5cbiAgICAgICAgLy8gUVVFU1RJT046IFdoYXQgYWJvdXQgYD0qYD8gSWdub3JlPyBUaHJvdz8gU3VwcG9ydD9cblxuICAgICAgICBjb25zdCBpbnB1dE5hbWUgPSBnZXRJbnB1dFByb3BlcnR5TWFwTmFtZShhdHRyTmFtZSk7XG4gICAgICAgIGNvbnN0IGlucHV0TmFtZVJlbmFtZSA9IGAke2lucHV0TmFtZX06ICR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IGdldE91dHB1dFByb3BlcnR5TWFwTmFtZShhdHRyTmFtZSk7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWVSZW5hbWUgPSBgJHtvdXRwdXROYW1lfTogJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lUmVuYW1lQ2hhbmdlID0gYCR7b3V0cHV0TmFtZVJlbmFtZX1DaGFuZ2VgO1xuXG4gICAgICAgIHN3aXRjaCAoYmluZGluZ1R5cGUpIHtcbiAgICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzUmVuYW1lLnB1c2goaW5wdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbaW5wdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlucHV0c1JlbmFtZS5wdXNoKGlucHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW2lucHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLm91dHB1dHNSZW5hbWUucHVzaChvdXRwdXROYW1lUmVuYW1lQ2hhbmdlKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbb3V0cHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5jaGVja1Byb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5T3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICB0aGlzLm91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0c1JlbmFtZS5wdXNoKG91dHB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtvdXRwdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxldCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGV4dCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIGBVbmV4cGVjdGVkIG1hcHBpbmcgJyR7YmluZGluZ1R5cGV9JyBpbiAnJHtqc29ufScgaW4gJyR7dGhpcy5uYW1lfScgZGlyZWN0aXZlLmAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBncmFkZSBuZzEgY29tcG9uZW50cyBpbnRvIEFuZ3VsYXIuXG4gICAqL1xuICBzdGF0aWMgcmVzb2x2ZShcbiAgICBleHBvcnRlZENvbXBvbmVudHM6IHtbbmFtZTogc3RyaW5nXTogVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSxcbiAgICAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UsXG4gICk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBwcm9taXNlcyA9IE9iamVjdC5lbnRyaWVzKGV4cG9ydGVkQ29tcG9uZW50cykubWFwKChbbmFtZSwgZXhwb3J0ZWRDb21wb25lbnRdKSA9PiB7XG4gICAgICBleHBvcnRlZENvbXBvbmVudC5kaXJlY3RpdmUgPSBVcGdyYWRlSGVscGVyLmdldERpcmVjdGl2ZSgkaW5qZWN0b3IsIG5hbWUpO1xuICAgICAgZXhwb3J0ZWRDb21wb25lbnQuZXh0cmFjdEJpbmRpbmdzKCk7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoXG4gICAgICAgIFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUoJGluamVjdG9yLCBleHBvcnRlZENvbXBvbmVudC5kaXJlY3RpdmUsIHRydWUpLFxuICAgICAgKS50aGVuKCh0ZW1wbGF0ZSkgPT4gKGV4cG9ydGVkQ29tcG9uZW50LnRlbXBsYXRlID0gdGVtcGxhdGUpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gIH1cbn1cblxuQERpcmVjdGl2ZSgpXG5jbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlciBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrIHtcbiAgcHJpdmF0ZSBjb250cm9sbGVySW5zdGFuY2U6IElDb250cm9sbGVySW5zdGFuY2UgfCBudWxsID0gbnVsbDtcbiAgZGVzdGluYXRpb25PYmo6IElCaW5kaW5nRGVzdGluYXRpb24gfCBudWxsID0gbnVsbDtcbiAgY2hlY2tMYXN0VmFsdWVzOiBhbnlbXSA9IFtdO1xuICBkaXJlY3RpdmU6IElEaXJlY3RpdmU7XG4gIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICRlbGVtZW50OiBhbnkgPSBudWxsO1xuICBjb21wb25lbnRTY29wZTogSVNjb3BlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgaGVscGVyOiBVcGdyYWRlSGVscGVyLFxuICAgIHNjb3BlOiBJU2NvcGUsXG4gICAgcHJpdmF0ZSB0ZW1wbGF0ZTogc3RyaW5nLFxuICAgIHByaXZhdGUgaW5wdXRzOiBzdHJpbmdbXSxcbiAgICBwcml2YXRlIG91dHB1dHM6IHN0cmluZ1tdLFxuICAgIHByaXZhdGUgcHJvcE91dHM6IHN0cmluZ1tdLFxuICAgIHByaXZhdGUgY2hlY2tQcm9wZXJ0aWVzOiBzdHJpbmdbXSxcbiAgICBwcml2YXRlIHByb3BlcnR5TWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgKSB7XG4gICAgdGhpcy5kaXJlY3RpdmUgPSBoZWxwZXIuZGlyZWN0aXZlO1xuICAgIHRoaXMuZWxlbWVudCA9IGhlbHBlci5lbGVtZW50O1xuICAgIHRoaXMuJGVsZW1lbnQgPSBoZWxwZXIuJGVsZW1lbnQ7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZSA9IHNjb3BlLiRuZXcoISF0aGlzLmRpcmVjdGl2ZS5zY29wZSk7XG5cbiAgICBjb25zdCBjb250cm9sbGVyVHlwZSA9IHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXI7XG5cbiAgICBpZiAodGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciAmJiBjb250cm9sbGVyVHlwZSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuY29tcG9uZW50U2NvcGUpO1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiA9IHRoaXMuY29udHJvbGxlckluc3RhbmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqID0gdGhpcy5jb21wb25lbnRTY29wZTtcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGlucHV0IG9mIHRoaXMuaW5wdXRzKSB7XG4gICAgICAodGhpcyBhcyBhbnkpW2lucHV0XSA9IG51bGw7XG4gICAgfVxuICAgIGZvciAoY29uc3Qgb3V0cHV0IG9mIHRoaXMub3V0cHV0cykge1xuICAgICAgY29uc3QgZW1pdHRlciA9ICgodGhpcyBhcyBhbnkpW291dHB1dF0gPSBuZXcgRXZlbnRFbWl0dGVyKCkpO1xuICAgICAgaWYgKHRoaXMucHJvcE91dHMuaW5kZXhPZihvdXRwdXQpID09PSAtMSkge1xuICAgICAgICB0aGlzLnNldENvbXBvbmVudFByb3BlcnR5KFxuICAgICAgICAgIG91dHB1dCxcbiAgICAgICAgICAoXG4gICAgICAgICAgICAoZW1pdHRlcikgPT4gKHZhbHVlOiBhbnkpID0+XG4gICAgICAgICAgICAgIGVtaXR0ZXIuZW1pdCh2YWx1ZSlcbiAgICAgICAgICApKGVtaXR0ZXIpLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmNoZWNrTGFzdFZhbHVlcy5wdXNoKC4uLkFycmF5KHByb3BPdXRzLmxlbmd0aCkuZmlsbChJTklUSUFMX1ZBTFVFKSk7XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBDb2xsZWN0IGNvbnRlbnRzLCBpbnNlcnQgYW5kIGNvbXBpbGUgdGVtcGxhdGVcbiAgICBjb25zdCBhdHRhY2hDaGlsZE5vZGVzOiBJTGlua0ZuIHwgdW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSh0cnVzdGVkSFRNTEZyb21MZWdhY3lUZW1wbGF0ZSh0aGlzLnRlbXBsYXRlKSk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyIChpZiBub3QgYWxyZWFkeSBkb25lIHNvKVxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICBjb25zdCBiaW5kVG9Db250cm9sbGVyID0gdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlcjtcbiAgICBpZiAoY29udHJvbGxlclR5cGUgJiYgIWJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLmNvbXBvbmVudFNjb3BlKTtcbiAgICB9XG5cbiAgICAvLyBSZXF1aXJlIG90aGVyIGNvbnRyb2xsZXJzXG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9IHRoaXMuaGVscGVyLnJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyhcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLFxuICAgICk7XG5cbiAgICAvLyBIb29rOiAkb25Jbml0XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBMaW5raW5nXG4gICAgY29uc3QgbGluayA9IHRoaXMuZGlyZWN0aXZlLmxpbms7XG4gICAgY29uc3QgcHJlTGluayA9IHR5cGVvZiBsaW5rID09ICdvYmplY3QnICYmIGxpbmsucHJlO1xuICAgIGNvbnN0IHBvc3RMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgPyBsaW5rLnBvc3QgOiBsaW5rO1xuICAgIGNvbnN0IGF0dHJzOiBJQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBJVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy5jb21wb25lbnRTY29wZSwgbnVsbCEsIHtwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbjogYXR0YWNoQ2hpbGROb2Rlc30pO1xuXG4gICAgaWYgKHBvc3RMaW5rKSB7XG4gICAgICBwb3N0TGluayh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkcG9zdExpbmtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmspKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmsoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgbmcxQ2hhbmdlczogYW55ID0ge307XG4gICAgT2JqZWN0LmtleXMoY2hhbmdlcykuZm9yRWFjaCgocHJvcGVydHlNYXBOYW1lKSA9PiB7XG4gICAgICBjb25zdCBjaGFuZ2U6IFNpbXBsZUNoYW5nZSA9IGNoYW5nZXNbcHJvcGVydHlNYXBOYW1lXTtcbiAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkocHJvcGVydHlNYXBOYW1lLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICAgIG5nMUNoYW5nZXNbdGhpcy5wcm9wZXJ0eU1hcFtwcm9wZXJ0eU1hcE5hbWVdXSA9IGNoYW5nZTtcbiAgICB9KTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuZGVzdGluYXRpb25PYmohLiRvbkNoYW5nZXMpKSB7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqIS4kb25DaGFuZ2VzIShuZzFDaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3QgZGVzdGluYXRpb25PYmogPSB0aGlzLmRlc3RpbmF0aW9uT2JqO1xuICAgIGNvbnN0IGxhc3RWYWx1ZXMgPSB0aGlzLmNoZWNrTGFzdFZhbHVlcztcbiAgICBjb25zdCBjaGVja1Byb3BlcnRpZXMgPSB0aGlzLmNoZWNrUHJvcGVydGllcztcbiAgICBjb25zdCBwcm9wT3V0cyA9IHRoaXMucHJvcE91dHM7XG4gICAgY2hlY2tQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGRlc3RpbmF0aW9uT2JqIVtwcm9wTmFtZV07XG4gICAgICBjb25zdCBsYXN0ID0gbGFzdFZhbHVlc1tpXTtcbiAgICAgIGlmICghc3RyaWN0RXF1YWxzKGxhc3QsIHZhbHVlKSkge1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtwcm9wT3V0c1tpXV07XG4gICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KChsYXN0VmFsdWVzW2ldID0gdmFsdWUpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmhlbHBlci5vbkRlc3Ryb3kodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuICB9XG5cbiAgc2V0Q29tcG9uZW50UHJvcGVydHkobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5kZXN0aW5hdGlvbk9iaiFbdGhpcy5wcm9wZXJ0eU1hcFtuYW1lXV0gPSB2YWx1ZTtcbiAgfVxufVxuIl19