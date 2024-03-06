import { __decorate, __metadata, __param } from "tslib";
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
        };
        MyClass = __decorate([
            Directive({
                jit: true,
                selector: selector,
                inputs: this.inputsRename,
                outputs: this.outputsRename,
            }),
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.3.0-next.1+sha-7243c70", ngImport: i0, type: UpgradeNg1ComponentAdapter, deps: "invalid", target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "17.3.0-next.1+sha-7243c70", type: UpgradeNg1ComponentAdapter, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.3.0-next.1+sha-7243c70", ngImport: i0, type: UpgradeNg1ComponentAdapter, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i1.UpgradeHelper }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }, { type: undefined }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2R5bmFtaWMvc3JjL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFDTCxTQUFTLEVBRVQsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sUUFBUSxHQU9ULE1BQU0sZUFBZSxDQUFDO0FBVXZCLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNsRCxPQUFPLEVBR0wsYUFBYSxHQUNkLE1BQU0saUNBQWlDLENBQUM7QUFDekMsT0FBTyxFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQzs7O0FBRS9ELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM5QixNQUFNLGFBQWEsR0FBRztJQUNwQixpQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFDRixNQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFFM0MsU0FBUyx1QkFBdUIsQ0FBQyxJQUFZO0lBQzNDLE9BQU8sU0FBUyxJQUFJLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBRUQsU0FBUyx3QkFBd0IsQ0FBQyxJQUFZO0lBQzVDLE9BQU8sVUFBVSxJQUFJLEVBQUUsQ0FBQztBQUMxQixDQUFDO0FBRUQsTUFBTSxPQUFPLGlDQUFpQztJQVk1QyxZQUFtQixJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQVYvQixXQUFNLEdBQWEsRUFBRSxDQUFDO1FBQ3RCLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBQzVCLFlBQU8sR0FBYSxFQUFFLENBQUM7UUFDdkIsa0JBQWEsR0FBYSxFQUFFLENBQUM7UUFDN0Isb0JBQWUsR0FBYSxFQUFFLENBQUM7UUFDL0Isb0JBQWUsR0FBYSxFQUFFLENBQUM7UUFDL0IsZ0JBQVcsR0FBNkIsRUFBRSxDQUFDO1FBQzNDLGNBQVMsR0FBc0IsSUFBSSxDQUFDO1FBSWxDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQzNCLFVBQVUsRUFDVixDQUFDLEdBQVcsRUFBRSxJQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQ3hELENBQUM7UUFDRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFFbEIsSUFNTSxPQUFPLEdBTmIsTUFNTSxPQUNKLFNBQVEsMEJBQTBCO1lBR2xDLFlBQTRCLEtBQWEsRUFBRSxRQUFrQixFQUFFLFVBQXNCO2dCQUNuRixLQUFLLENBQ0gsSUFBSSxhQUFhLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsRUFDMUUsS0FBSyxFQUNMLElBQUksQ0FBQyxRQUFRLEVBQ2IsSUFBSSxDQUFDLE1BQU0sRUFDWCxJQUFJLENBQUMsT0FBTyxFQUNaLElBQUksQ0FBQyxlQUFlLEVBQ3BCLElBQUksQ0FBQyxlQUFlLEVBQ3BCLElBQUksQ0FBQyxXQUFXLENBQ1YsQ0FBQztZQUNYLENBQUM7U0FDRixDQUFBO1FBaEJLLE9BQU87WUFOWixTQUFTLENBQUM7Z0JBQ1QsR0FBRyxFQUFFLElBQUk7Z0JBQ1QsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWTtnQkFDekIsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhO2FBQzVCLENBQUM7WUFLYSxXQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtxREFBMEIsUUFBUSxFQUFjLFVBQVU7V0FKakYsT0FBTyxDQWdCWjtRQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxlQUFlO1FBQ2IsTUFBTSxXQUFXLEdBQUcsT0FBTyxJQUFJLENBQUMsU0FBVSxDQUFDLGdCQUFnQixLQUFLLFFBQVEsQ0FBQztRQUN6RSxJQUFJLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFVLENBQUMsS0FBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDOUQsTUFBTSxJQUFJLEtBQUssQ0FDYixpRkFBaUYsQ0FDbEYsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFVLENBQUMsS0FBSyxDQUFDO1FBRXZGLElBQUksT0FBTyxPQUFPLElBQUksUUFBUSxFQUFFLENBQUM7WUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDeEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNyQyxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLGNBQWMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDO2dCQUVsRixxREFBcUQ7Z0JBRXJELE1BQU0sU0FBUyxHQUFHLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLGVBQWUsR0FBRyxHQUFHLFNBQVMsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDcEQsTUFBTSxVQUFVLEdBQUcsd0JBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxVQUFVLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ3RELE1BQU0sc0JBQXNCLEdBQUcsR0FBRyxnQkFBZ0IsUUFBUSxDQUFDO2dCQUUzRCxRQUFRLFdBQVcsRUFBRSxDQUFDO29CQUNwQixLQUFLLEdBQUcsQ0FBQztvQkFDVCxLQUFLLEdBQUc7d0JBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO3dCQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFFBQVEsQ0FBQzt3QkFDdkMsTUFBTTtvQkFDUixLQUFLLEdBQUc7d0JBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO3dCQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFFBQVEsQ0FBQzt3QkFFdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQzlCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7d0JBQ2hELElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDO3dCQUV4QyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDcEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ3RDLE1BQU07b0JBQ1IsS0FBSyxHQUFHO3dCQUNOLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUM5QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO3dCQUMxQyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFFBQVEsQ0FBQzt3QkFDeEMsTUFBTTtvQkFDUjt3QkFDRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNuQyxNQUFNLElBQUksS0FBSyxDQUNiLHVCQUF1QixXQUFXLFNBQVMsSUFBSSxTQUFTLElBQUksQ0FBQyxJQUFJLGNBQWMsQ0FDaEYsQ0FBQztnQkFDTixDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FDWixrQkFBdUUsRUFDdkUsU0FBMkI7UUFFM0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLEVBQUUsRUFBRTtZQUNwRixpQkFBaUIsQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUUsaUJBQWlCLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFcEMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUNwQixhQUFhLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQ3hFLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9CLENBQUM7Q0FDRjtBQUVELE1BQ00sMEJBQTBCO0lBUzlCLFlBQ1UsTUFBcUIsRUFDN0IsS0FBYSxFQUNMLFFBQWdCLEVBQ2hCLE1BQWdCLEVBQ2hCLE9BQWlCLEVBQ2pCLFFBQWtCLEVBQ2xCLGVBQXlCLEVBQ3pCLFdBQW9DO1FBUHBDLFdBQU0sR0FBTixNQUFNLENBQWU7UUFFckIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUNoQixXQUFNLEdBQU4sTUFBTSxDQUFVO1FBQ2hCLFlBQU8sR0FBUCxPQUFPLENBQVU7UUFDakIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUNsQixvQkFBZSxHQUFmLGVBQWUsQ0FBVTtRQUN6QixnQkFBVyxHQUFYLFdBQVcsQ0FBeUI7UUFoQnRDLHVCQUFrQixHQUErQixJQUFJLENBQUM7UUFDOUQsbUJBQWMsR0FBK0IsSUFBSSxDQUFDO1FBQ2xELG9CQUFlLEdBQVUsRUFBRSxDQUFDO1FBRzVCLGFBQVEsR0FBUSxJQUFJLENBQUM7UUFhbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7UUFDaEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXpELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDO1FBRWpELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMzRixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUNoRCxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDL0IsSUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM5QixDQUFDO1FBQ0QsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbEMsTUFBTSxPQUFPLEdBQUcsQ0FBRSxJQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1lBQzdELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLG9CQUFvQixDQUN2QixNQUFNLEVBQ04sQ0FDRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFVLEVBQUUsRUFBRSxDQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUN0QixDQUFDLE9BQU8sQ0FBQyxDQUNYLENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQztRQUNELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsUUFBUTtRQUNOLGdEQUFnRDtRQUNoRCxNQUFNLGdCQUFnQixHQUF3QixJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDaEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTFELGtEQUFrRDtRQUNsRCxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQztRQUNqRCxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUM7UUFDekQsSUFBSSxjQUFjLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdGLENBQUM7UUFFRCw0QkFBNEI7UUFDNUIsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGlDQUFpQyxDQUN2RSxJQUFJLENBQUMsa0JBQWtCLENBQ3hCLENBQUM7UUFFRixnQkFBZ0I7UUFDaEIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQzNFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNwQyxDQUFDO1FBRUQsVUFBVTtRQUNWLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1FBQ2pDLE1BQU0sT0FBTyxHQUFHLE9BQU8sSUFBSSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BELE1BQU0sUUFBUSxHQUFHLE9BQU8sSUFBSSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzVELE1BQU0sS0FBSyxHQUFnQixhQUFhLENBQUM7UUFDekMsTUFBTSxZQUFZLEdBQXdCLGFBQWEsQ0FBQztRQUN4RCxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ1osT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUssRUFBRSxFQUFDLHVCQUF1QixFQUFFLGdCQUFnQixFQUFDLENBQUMsQ0FBQztRQUVoRixJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsUUFBUSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUVELGtCQUFrQjtRQUNsQixJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDN0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3RDLENBQUM7SUFDSCxDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLE1BQU0sVUFBVSxHQUFRLEVBQUUsQ0FBQztRQUMzQixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGVBQWUsRUFBRSxFQUFFO1lBQy9DLE1BQU0sTUFBTSxHQUFpQixPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDdEQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEUsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDekQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBZSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLGNBQWUsQ0FBQyxVQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0MsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTO1FBQ1AsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUMzQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQ3hDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7UUFDN0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUMvQixlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RDLE1BQU0sS0FBSyxHQUFHLGNBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN4QyxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsTUFBTSxZQUFZLEdBQXVCLElBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkUsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksSUFBSSxDQUFDLGtCQUFrQixJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztZQUM1RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckMsQ0FBQztJQUNILENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQsb0JBQW9CLENBQUMsSUFBWSxFQUFFLEtBQVU7UUFDM0MsSUFBSSxDQUFDLGNBQWUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3ZELENBQUM7eUhBcklHLDBCQUEwQjs2R0FBMUIsMEJBQTBCOztzR0FBMUIsMEJBQTBCO2tCQUQvQixTQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRG9DaGVjayxcbiAgRWxlbWVudFJlZixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIEluamVjdG9yLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBTaW1wbGVDaGFuZ2UsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIFR5cGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBJQXR0cmlidXRlcyxcbiAgSURpcmVjdGl2ZSxcbiAgSUluamVjdG9yU2VydmljZSxcbiAgSUxpbmtGbixcbiAgSVNjb3BlLFxuICBJVHJhbnNjbHVkZUZ1bmN0aW9uLFxufSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2FuZ3VsYXIxJztcbmltcG9ydCB7JFNDT1BFfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL2NvbnN0YW50cyc7XG5pbXBvcnQge1xuICBJQmluZGluZ0Rlc3RpbmF0aW9uLFxuICBJQ29udHJvbGxlckluc3RhbmNlLFxuICBVcGdyYWRlSGVscGVyLFxufSBmcm9tICcuLi8uLi9jb21tb24vc3JjL3VwZ3JhZGVfaGVscGVyJztcbmltcG9ydCB7aXNGdW5jdGlvbiwgc3RyaWN0RXF1YWxzfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL3V0aWwnO1xuXG5jb25zdCBDQU1FTF9DQVNFID0gLyhbQS1aXSkvZztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlLFxufTtcbmNvbnN0IE5PVF9TVVBQT1JURUQ6IGFueSA9ICdOT1RfU1VQUE9SVEVEJztcblxuZnVuY3Rpb24gZ2V0SW5wdXRQcm9wZXJ0eU1hcE5hbWUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBpbnB1dF8ke25hbWV9YDtcbn1cblxuZnVuY3Rpb24gZ2V0T3V0cHV0UHJvcGVydHlNYXBOYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBgb3V0cHV0XyR7bmFtZX1gO1xufVxuXG5leHBvcnQgY2xhc3MgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyIHtcbiAgdHlwZTogVHlwZTxhbnk+O1xuICBpbnB1dHM6IHN0cmluZ1tdID0gW107XG4gIGlucHV0c1JlbmFtZTogc3RyaW5nW10gPSBbXTtcbiAgb3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgb3V0cHV0c1JlbmFtZTogc3RyaW5nW10gPSBbXTtcbiAgcHJvcGVydHlPdXRwdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBjaGVja1Byb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG4gIHByb3BlcnR5TWFwOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgZGlyZWN0aXZlOiBJRGlyZWN0aXZlIHwgbnVsbCA9IG51bGw7XG4gIHRlbXBsYXRlITogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IG5hbWUucmVwbGFjZShcbiAgICAgIENBTUVMX0NBU0UsXG4gICAgICAoYWxsOiBzdHJpbmcsIG5leHQ6IHN0cmluZykgPT4gJy0nICsgbmV4dC50b0xvd2VyQ2FzZSgpLFxuICAgICk7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBARGlyZWN0aXZlKHtcbiAgICAgIGppdDogdHJ1ZSxcbiAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgIGlucHV0czogdGhpcy5pbnB1dHNSZW5hbWUsXG4gICAgICBvdXRwdXRzOiB0aGlzLm91dHB1dHNSZW5hbWUsXG4gICAgfSlcbiAgICBjbGFzcyBNeUNsYXNzXG4gICAgICBleHRlbmRzIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyXG4gICAgICBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrLCBPbkRlc3Ryb3lcbiAgICB7XG4gICAgICBjb25zdHJ1Y3RvcihASW5qZWN0KCRTQ09QRSkgc2NvcGU6IElTY29wZSwgaW5qZWN0b3I6IEluamVjdG9yLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHN1cGVyKFxuICAgICAgICAgIG5ldyBVcGdyYWRlSGVscGVyKGluamVjdG9yLCBuYW1lLCBlbGVtZW50UmVmLCBzZWxmLmRpcmVjdGl2ZSB8fCB1bmRlZmluZWQpLFxuICAgICAgICAgIHNjb3BlLFxuICAgICAgICAgIHNlbGYudGVtcGxhdGUsXG4gICAgICAgICAgc2VsZi5pbnB1dHMsXG4gICAgICAgICAgc2VsZi5vdXRwdXRzLFxuICAgICAgICAgIHNlbGYucHJvcGVydHlPdXRwdXRzLFxuICAgICAgICAgIHNlbGYuY2hlY2tQcm9wZXJ0aWVzLFxuICAgICAgICAgIHNlbGYucHJvcGVydHlNYXAsXG4gICAgICAgICkgYXMgYW55O1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnR5cGUgPSBNeUNsYXNzO1xuICB9XG5cbiAgZXh0cmFjdEJpbmRpbmdzKCkge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIHRoaXMuZGlyZWN0aXZlIS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXModGhpcy5kaXJlY3RpdmUhLnNjb3BlISkubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgYXJlIG5vdCBzdXBwb3J0ZWQuYCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dCA9IGJ0Y0lzT2JqZWN0ID8gdGhpcy5kaXJlY3RpdmUhLmJpbmRUb0NvbnRyb2xsZXIgOiB0aGlzLmRpcmVjdGl2ZSEuc2NvcGU7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHQgPT0gJ29iamVjdCcpIHtcbiAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb250ZXh0W3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBkZWZpbml0aW9uLmNoYXJBdCgwKTtcbiAgICAgICAgY29uc3QgYmluZGluZ09wdGlvbnMgPSBkZWZpbml0aW9uLmNoYXJBdCgxKTtcbiAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBkZWZpbml0aW9uLnN1YnN0cmluZyhiaW5kaW5nT3B0aW9ucyA9PT0gJz8nID8gMiA6IDEpIHx8IHByb3BOYW1lO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgY29uc3QgaW5wdXROYW1lID0gZ2V0SW5wdXRQcm9wZXJ0eU1hcE5hbWUoYXR0ck5hbWUpO1xuICAgICAgICBjb25zdCBpbnB1dE5hbWVSZW5hbWUgPSBgJHtpbnB1dE5hbWV9OiAke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSBnZXRPdXRwdXRQcm9wZXJ0eU1hcE5hbWUoYXR0ck5hbWUpO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lUmVuYW1lID0gYCR7b3V0cHV0TmFtZX06ICR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZVJlbmFtZUNoYW5nZSA9IGAke291dHB1dE5hbWVSZW5hbWV9Q2hhbmdlYDtcblxuICAgICAgICBzd2l0Y2ggKGJpbmRpbmdUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlucHV0c1JlbmFtZS5wdXNoKGlucHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW2lucHV0TmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJz0nOlxuICAgICAgICAgICAgdGhpcy5pbnB1dHMucHVzaChpbnB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dHNSZW5hbWUucHVzaChpbnB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtpbnB1dE5hbWVdID0gcHJvcE5hbWU7XG5cbiAgICAgICAgICAgIHRoaXMub3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5vdXRwdXRzUmVuYW1lLnB1c2gob3V0cHV0TmFtZVJlbmFtZUNoYW5nZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW291dHB1dE5hbWVdID0gcHJvcE5hbWU7XG5cbiAgICAgICAgICAgIHRoaXMuY2hlY2tQcm9wZXJ0aWVzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLm91dHB1dHNSZW5hbWUucHVzaChvdXRwdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbb3V0cHV0TmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZXQganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke3RoaXMubmFtZX0nIGRpcmVjdGl2ZS5gLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZ3JhZGUgbmcxIGNvbXBvbmVudHMgaW50byBBbmd1bGFyLlxuICAgKi9cbiAgc3RhdGljIHJlc29sdmUoXG4gICAgZXhwb3J0ZWRDb21wb25lbnRzOiB7W25hbWU6IHN0cmluZ106IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0sXG4gICAgJGluamVjdG9yOiBJSW5qZWN0b3JTZXJ2aWNlLFxuICApOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBPYmplY3QuZW50cmllcyhleHBvcnRlZENvbXBvbmVudHMpLm1hcCgoW25hbWUsIGV4cG9ydGVkQ29tcG9uZW50XSkgPT4ge1xuICAgICAgZXhwb3J0ZWRDb21wb25lbnQuZGlyZWN0aXZlID0gVXBncmFkZUhlbHBlci5nZXREaXJlY3RpdmUoJGluamVjdG9yLCBuYW1lKTtcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50LmV4dHJhY3RCaW5kaW5ncygpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuICAgICAgICBVcGdyYWRlSGVscGVyLmdldFRlbXBsYXRlKCRpbmplY3RvciwgZXhwb3J0ZWRDb21wb25lbnQuZGlyZWN0aXZlLCB0cnVlKSxcbiAgICAgICkudGhlbigodGVtcGxhdGUpID0+IChleHBvcnRlZENvbXBvbmVudC50ZW1wbGF0ZSA9IHRlbXBsYXRlKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICB9XG59XG5cbkBEaXJlY3RpdmUoKVxuY2xhc3MgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXIgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjayB7XG4gIHByaXZhdGUgY29udHJvbGxlckluc3RhbmNlOiBJQ29udHJvbGxlckluc3RhbmNlIHwgbnVsbCA9IG51bGw7XG4gIGRlc3RpbmF0aW9uT2JqOiBJQmluZGluZ0Rlc3RpbmF0aW9uIHwgbnVsbCA9IG51bGw7XG4gIGNoZWNrTGFzdFZhbHVlczogYW55W10gPSBbXTtcbiAgZGlyZWN0aXZlOiBJRGlyZWN0aXZlO1xuICBlbGVtZW50OiBFbGVtZW50O1xuICAkZWxlbWVudDogYW55ID0gbnVsbDtcbiAgY29tcG9uZW50U2NvcGU6IElTY29wZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGhlbHBlcjogVXBncmFkZUhlbHBlcixcbiAgICBzY29wZTogSVNjb3BlLFxuICAgIHByaXZhdGUgdGVtcGxhdGU6IHN0cmluZyxcbiAgICBwcml2YXRlIGlucHV0czogc3RyaW5nW10sXG4gICAgcHJpdmF0ZSBvdXRwdXRzOiBzdHJpbmdbXSxcbiAgICBwcml2YXRlIHByb3BPdXRzOiBzdHJpbmdbXSxcbiAgICBwcml2YXRlIGNoZWNrUHJvcGVydGllczogc3RyaW5nW10sXG4gICAgcHJpdmF0ZSBwcm9wZXJ0eU1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICkge1xuICAgIHRoaXMuZGlyZWN0aXZlID0gaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmVsZW1lbnQgPSBoZWxwZXIuZWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gaGVscGVyLiRlbGVtZW50O1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuXG4gICAgaWYgKHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgJiYgY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLmNvbXBvbmVudFNjb3BlKTtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmogPSB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiA9IHRoaXMuY29tcG9uZW50U2NvcGU7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBpbnB1dCBvZiB0aGlzLmlucHV0cykge1xuICAgICAgKHRoaXMgYXMgYW55KVtpbnB1dF0gPSBudWxsO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IG91dHB1dCBvZiB0aGlzLm91dHB1dHMpIHtcbiAgICAgIGNvbnN0IGVtaXR0ZXIgPSAoKHRoaXMgYXMgYW55KVtvdXRwdXRdID0gbmV3IEV2ZW50RW1pdHRlcigpKTtcbiAgICAgIGlmICh0aGlzLnByb3BPdXRzLmluZGV4T2Yob3V0cHV0KSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5zZXRDb21wb25lbnRQcm9wZXJ0eShcbiAgICAgICAgICBvdXRwdXQsXG4gICAgICAgICAgKFxuICAgICAgICAgICAgKGVtaXR0ZXIpID0+ICh2YWx1ZTogYW55KSA9PlxuICAgICAgICAgICAgICBlbWl0dGVyLmVtaXQodmFsdWUpXG4gICAgICAgICAgKShlbWl0dGVyKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5jaGVja0xhc3RWYWx1ZXMucHVzaCguLi5BcnJheShwcm9wT3V0cy5sZW5ndGgpLmZpbGwoSU5JVElBTF9WQUxVRSkpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gQ29sbGVjdCBjb250ZW50cywgaW5zZXJ0IGFuZCBjb21waWxlIHRlbXBsYXRlXG4gICAgY29uc3QgYXR0YWNoQ2hpbGROb2RlczogSUxpbmtGbiB8IHVuZGVmaW5lZCA9IHRoaXMuaGVscGVyLnByZXBhcmVUcmFuc2NsdXNpb24oKTtcbiAgICBjb25zdCBsaW5rRm4gPSB0aGlzLmhlbHBlci5jb21waWxlVGVtcGxhdGUodGhpcy50ZW1wbGF0ZSk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyIChpZiBub3QgYWxyZWFkeSBkb25lIHNvKVxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICBjb25zdCBiaW5kVG9Db250cm9sbGVyID0gdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlcjtcbiAgICBpZiAoY29udHJvbGxlclR5cGUgJiYgIWJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLmNvbXBvbmVudFNjb3BlKTtcbiAgICB9XG5cbiAgICAvLyBSZXF1aXJlIG90aGVyIGNvbnRyb2xsZXJzXG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9IHRoaXMuaGVscGVyLnJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyhcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLFxuICAgICk7XG5cbiAgICAvLyBIb29rOiAkb25Jbml0XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBMaW5raW5nXG4gICAgY29uc3QgbGluayA9IHRoaXMuZGlyZWN0aXZlLmxpbms7XG4gICAgY29uc3QgcHJlTGluayA9IHR5cGVvZiBsaW5rID09ICdvYmplY3QnICYmIGxpbmsucHJlO1xuICAgIGNvbnN0IHBvc3RMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgPyBsaW5rLnBvc3QgOiBsaW5rO1xuICAgIGNvbnN0IGF0dHJzOiBJQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBJVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy5jb21wb25lbnRTY29wZSwgbnVsbCEsIHtwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbjogYXR0YWNoQ2hpbGROb2Rlc30pO1xuXG4gICAgaWYgKHBvc3RMaW5rKSB7XG4gICAgICBwb3N0TGluayh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkcG9zdExpbmtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmspKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmsoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgbmcxQ2hhbmdlczogYW55ID0ge307XG4gICAgT2JqZWN0LmtleXMoY2hhbmdlcykuZm9yRWFjaCgocHJvcGVydHlNYXBOYW1lKSA9PiB7XG4gICAgICBjb25zdCBjaGFuZ2U6IFNpbXBsZUNoYW5nZSA9IGNoYW5nZXNbcHJvcGVydHlNYXBOYW1lXTtcbiAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkocHJvcGVydHlNYXBOYW1lLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICAgIG5nMUNoYW5nZXNbdGhpcy5wcm9wZXJ0eU1hcFtwcm9wZXJ0eU1hcE5hbWVdXSA9IGNoYW5nZTtcbiAgICB9KTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuZGVzdGluYXRpb25PYmohLiRvbkNoYW5nZXMpKSB7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqIS4kb25DaGFuZ2VzIShuZzFDaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3QgZGVzdGluYXRpb25PYmogPSB0aGlzLmRlc3RpbmF0aW9uT2JqO1xuICAgIGNvbnN0IGxhc3RWYWx1ZXMgPSB0aGlzLmNoZWNrTGFzdFZhbHVlcztcbiAgICBjb25zdCBjaGVja1Byb3BlcnRpZXMgPSB0aGlzLmNoZWNrUHJvcGVydGllcztcbiAgICBjb25zdCBwcm9wT3V0cyA9IHRoaXMucHJvcE91dHM7XG4gICAgY2hlY2tQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGRlc3RpbmF0aW9uT2JqIVtwcm9wTmFtZV07XG4gICAgICBjb25zdCBsYXN0ID0gbGFzdFZhbHVlc1tpXTtcbiAgICAgIGlmICghc3RyaWN0RXF1YWxzKGxhc3QsIHZhbHVlKSkge1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtwcm9wT3V0c1tpXV07XG4gICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KChsYXN0VmFsdWVzW2ldID0gdmFsdWUpKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2soKTtcbiAgICB9XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLmhlbHBlci5vbkRlc3Ryb3kodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuICB9XG5cbiAgc2V0Q29tcG9uZW50UHJvcGVydHkobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5kZXN0aW5hdGlvbk9iaiFbdGhpcy5wcm9wZXJ0eU1hcFtuYW1lXV0gPSB2YWx1ZTtcbiAgfVxufVxuIl19