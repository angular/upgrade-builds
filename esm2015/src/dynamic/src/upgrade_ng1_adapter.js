/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __param } from "tslib";
import { Directive, ElementRef, EventEmitter, Inject, Injector } from '@angular/core';
import { $SCOPE } from '../../common/src/constants';
import { UpgradeHelper } from '../../common/src/upgrade_helper';
import { isFunction, strictEquals } from '../../common/src/util';
const CAMEL_CASE = /([A-Z])/g;
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
const NOT_SUPPORTED = 'NOT_SUPPORTED';
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
        let MyClass = /** @class */ (() => {
            let MyClass = class MyClass extends UpgradeNg1ComponentAdapter {
                constructor(scope, injector, elementRef) {
                    super(new UpgradeHelper(injector, name, elementRef, self.directive || undefined), scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                }
            };
            MyClass = __decorate([
                Directive(Object.assign({ jit: true }, directive)),
                __param(0, Inject($SCOPE)),
                __metadata("design:paramtypes", [Object, Injector, ElementRef])
            ], MyClass);
            return MyClass;
        })();
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
                const inputName = `input_${attrName}`;
                const inputNameRename = `${inputName}: ${attrName}`;
                const outputName = `output_${attrName}`;
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
let UpgradeNg1ComponentAdapter = /** @class */ (() => {
    let UpgradeNg1ComponentAdapter = class UpgradeNg1ComponentAdapter {
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
                this.setComponentProperty(name, change.currentValue);
                ng1Changes[this.propertyMap[name]] = change;
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
    };
    UpgradeNg1ComponentAdapter = __decorate([
        Directive(),
        __metadata("design:paramtypes", [UpgradeHelper, Object, String, Array, Array, Array, Array, Object])
    ], UpgradeNg1ComponentAdapter);
    return UpgradeNg1ComponentAdapter;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2R5bmFtaWMvc3JjL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQVcsVUFBVSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFrRSxNQUFNLGVBQWUsQ0FBQztBQUc5SixPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDbEQsT0FBTyxFQUEyQyxhQUFhLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUN4RyxPQUFPLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRy9ELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM5QixNQUFNLGFBQWEsR0FBRztJQUNwQixpQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFDRixNQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFHM0MsTUFBTSxPQUFPLGlDQUFpQztJQWM1QyxZQUFtQixJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQVgvQixXQUFNLEdBQWEsRUFBRSxDQUFDO1FBQ3RCLGlCQUFZLEdBQWEsRUFBRSxDQUFDO1FBQzVCLFlBQU8sR0FBYSxFQUFFLENBQUM7UUFDdkIsa0JBQWEsR0FBYSxFQUFFLENBQUM7UUFDN0Isb0JBQWUsR0FBYSxFQUFFLENBQUM7UUFDL0Isb0JBQWUsR0FBYSxFQUFFLENBQUM7UUFDL0IsZ0JBQVcsR0FBNkIsRUFBRSxDQUFDO1FBQzNDLGNBQVMsR0FBb0IsSUFBSSxDQUFDO1FBS2hDLE1BQU0sUUFBUSxHQUNWLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBVyxFQUFFLElBQVksRUFBRSxFQUFFLENBQUMsR0FB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QUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtvQkFDOUIsTUFBTSxZQUFZLEdBQXVCLElBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkUsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7aUJBQzFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUMzRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDcEM7UUFDSCxDQUFDO1FBRUQsV0FBVztZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDdEUsQ0FBQztRQUVELG9CQUFvQixDQUFDLElBQVksRUFBRSxLQUFVO1lBQzNDLElBQUksQ0FBQyxjQUFlLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUN2RCxDQUFDO0tBQ0YsQ0FBQTtJQTVISywwQkFBMEI7UUFEL0IsU0FBUyxFQUFFO3lDQVdVLGFBQWE7T0FWN0IsMEJBQTBCLENBNEgvQjtJQUFELGlDQUFDO0tBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdCwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBPbkluaXQsIFNpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlcywgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SUF0dHJpYnV0ZXMsIElEaXJlY3RpdmUsIElEaXJlY3RpdmVQcmVQb3N0LCBJSW5qZWN0b3JTZXJ2aWNlLCBJTGlua0ZuLCBJU2NvcGUsIElUcmFuc2NsdWRlRnVuY3Rpb259IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvYW5ndWxhcjEnO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4uLy4uL2NvbW1vbi9zcmMvY29uc3RhbnRzJztcbmltcG9ydCB7SUJpbmRpbmdEZXN0aW5hdGlvbiwgSUNvbnRyb2xsZXJJbnN0YW5jZSwgVXBncmFkZUhlbHBlcn0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy91cGdyYWRlX2hlbHBlcic7XG5pbXBvcnQge2lzRnVuY3Rpb24sIHN0cmljdEVxdWFsc30gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy91dGlsJztcblxuXG5jb25zdCBDQU1FTF9DQVNFID0gLyhbQS1aXSkvZztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuXG5cbmV4cG9ydCBjbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgdHlwZSE6IFR5cGU8YW55PjtcbiAgaW5wdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBpbnB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHM6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIHByb3BlcnR5T3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgY2hlY2tQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICBwcm9wZXJ0eU1hcDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGRpcmVjdGl2ZTogSURpcmVjdGl2ZXxudWxsID0gbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHRlbXBsYXRlICE6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPVxuICAgICAgICBuYW1lLnJlcGxhY2UoQ0FNRUxfQ0FTRSwgKGFsbDogc3RyaW5nLCBuZXh0OiBzdHJpbmcpID0+ICctJyArIG5leHQudG9Mb3dlckNhc2UoKSk7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBOb3RlOiBUaGVyZSBpcyBhIGJ1ZyBpbiBUUyAyLjQgdGhhdCBwcmV2ZW50cyB1cyBmcm9tXG4gICAgLy8gaW5saW5pbmcgdGhpcyBpbnRvIEBEaXJlY3RpdmVcbiAgICAvLyBUT0RPKHRib3NjaCk6IGZpbmQgb3IgZmlsZSBhIGJ1ZyBhZ2FpbnN0IFR5cGVTY3JpcHQgZm9yIHRoaXMuXG4gICAgY29uc3QgZGlyZWN0aXZlID0ge3NlbGVjdG9yOiBzZWxlY3RvciwgaW5wdXRzOiB0aGlzLmlucHV0c1JlbmFtZSwgb3V0cHV0czogdGhpcy5vdXRwdXRzUmVuYW1lfTtcblxuICAgIEBEaXJlY3RpdmUoe2ppdDogdHJ1ZSwgLi4uZGlyZWN0aXZlfSlcbiAgICBjbGFzcyBNeUNsYXNzIGV4dGVuZHMgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXIgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPbkRlc3Ryb3kge1xuICAgICAgY29uc3RydWN0b3IoQEluamVjdCgkU0NPUEUpIHNjb3BlOiBJU2NvcGUsIGluamVjdG9yOiBJbmplY3RvciwgZWxlbWVudFJlZjogRWxlbWVudFJlZikge1xuICAgICAgICBzdXBlcihcbiAgICAgICAgICAgIG5ldyBVcGdyYWRlSGVscGVyKGluamVjdG9yLCBuYW1lLCBlbGVtZW50UmVmLCBzZWxmLmRpcmVjdGl2ZSB8fCB1bmRlZmluZWQpLCBzY29wZSxcbiAgICAgICAgICAgIHNlbGYudGVtcGxhdGUsIHNlbGYuaW5wdXRzLCBzZWxmLm91dHB1dHMsIHNlbGYucHJvcGVydHlPdXRwdXRzLCBzZWxmLmNoZWNrUHJvcGVydGllcyxcbiAgICAgICAgICAgIHNlbGYucHJvcGVydHlNYXApIGFzIGFueTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50eXBlID0gTXlDbGFzcztcbiAgfVxuXG4gIGV4dHJhY3RCaW5kaW5ncygpIHtcbiAgICBjb25zdCBidGNJc09iamVjdCA9IHR5cGVvZiB0aGlzLmRpcmVjdGl2ZSEuYmluZFRvQ29udHJvbGxlciA9PT0gJ29iamVjdCc7XG4gICAgaWYgKGJ0Y0lzT2JqZWN0ICYmIE9iamVjdC5rZXlzKHRoaXMuZGlyZWN0aXZlIS5zY29wZSEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgYXJlIG5vdCBzdXBwb3J0ZWQuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dCA9IChidGNJc09iamVjdCkgPyB0aGlzLmRpcmVjdGl2ZSEuYmluZFRvQ29udHJvbGxlciA6IHRoaXMuZGlyZWN0aXZlIS5zY29wZTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoY29udGV4dCkuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb250ZXh0W3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBkZWZpbml0aW9uLmNoYXJBdCgwKTtcbiAgICAgICAgY29uc3QgYmluZGluZ09wdGlvbnMgPSBkZWZpbml0aW9uLmNoYXJBdCgxKTtcbiAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBkZWZpbml0aW9uLnN1YnN0cmluZyhiaW5kaW5nT3B0aW9ucyA9PT0gJz8nID8gMiA6IDEpIHx8IHByb3BOYW1lO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgY29uc3QgaW5wdXROYW1lID0gYGlucHV0XyR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3QgaW5wdXROYW1lUmVuYW1lID0gYCR7aW5wdXROYW1lfTogJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lID0gYG91dHB1dF8ke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWVSZW5hbWUgPSBgJHtvdXRwdXROYW1lfTogJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lUmVuYW1lQ2hhbmdlID0gYCR7b3V0cHV0TmFtZVJlbmFtZX1DaGFuZ2VgO1xuXG4gICAgICAgIHN3aXRjaCAoYmluZGluZ1R5cGUpIHtcbiAgICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzUmVuYW1lLnB1c2goaW5wdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbaW5wdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlucHV0c1JlbmFtZS5wdXNoKGlucHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW2lucHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLm91dHB1dHNSZW5hbWUucHVzaChvdXRwdXROYW1lUmVuYW1lQ2hhbmdlKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbb3V0cHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5jaGVja1Byb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5T3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICB0aGlzLm91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0c1JlbmFtZS5wdXNoKG91dHB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtvdXRwdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxldCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGV4dCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgbWFwcGluZyAnJHtiaW5kaW5nVHlwZX0nIGluICcke2pzb259JyBpbiAnJHt0aGlzLm5hbWV9JyBkaXJlY3RpdmUuYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGdyYWRlIG5nMSBjb21wb25lbnRzIGludG8gQW5ndWxhci5cbiAgICovXG4gIHN0YXRpYyByZXNvbHZlKFxuICAgICAgZXhwb3J0ZWRDb21wb25lbnRzOiB7W25hbWU6IHN0cmluZ106IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0sXG4gICAgICAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBPYmplY3Qua2V5cyhleHBvcnRlZENvbXBvbmVudHMpLm1hcChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGV4cG9ydGVkQ29tcG9uZW50ID0gZXhwb3J0ZWRDb21wb25lbnRzW25hbWVdO1xuICAgICAgZXhwb3J0ZWRDb21wb25lbnQuZGlyZWN0aXZlID0gVXBncmFkZUhlbHBlci5nZXREaXJlY3RpdmUoJGluamVjdG9yLCBuYW1lKTtcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50LmV4dHJhY3RCaW5kaW5ncygpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgIC5yZXNvbHZlKFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUoJGluamVjdG9yLCBleHBvcnRlZENvbXBvbmVudC5kaXJlY3RpdmUsIHRydWUpKVxuICAgICAgICAgIC50aGVuKHRlbXBsYXRlID0+IGV4cG9ydGVkQ29tcG9uZW50LnRlbXBsYXRlID0gdGVtcGxhdGUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxufVxuXG5ARGlyZWN0aXZlKClcbmNsYXNzIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIERvQ2hlY2sge1xuICBwcml2YXRlIGNvbnRyb2xsZXJJbnN0YW5jZTogSUNvbnRyb2xsZXJJbnN0YW5jZXxudWxsID0gbnVsbDtcbiAgZGVzdGluYXRpb25PYmo6IElCaW5kaW5nRGVzdGluYXRpb258bnVsbCA9IG51bGw7XG4gIGNoZWNrTGFzdFZhbHVlczogYW55W10gPSBbXTtcbiAgZGlyZWN0aXZlOiBJRGlyZWN0aXZlO1xuICBlbGVtZW50OiBFbGVtZW50O1xuICAkZWxlbWVudDogYW55ID0gbnVsbDtcbiAgY29tcG9uZW50U2NvcGU6IElTY29wZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgaGVscGVyOiBVcGdyYWRlSGVscGVyLCBzY29wZTogSVNjb3BlLCBwcml2YXRlIHRlbXBsYXRlOiBzdHJpbmcsXG4gICAgICBwcml2YXRlIGlucHV0czogc3RyaW5nW10sIHByaXZhdGUgb3V0cHV0czogc3RyaW5nW10sIHByaXZhdGUgcHJvcE91dHM6IHN0cmluZ1tdLFxuICAgICAgcHJpdmF0ZSBjaGVja1Byb3BlcnRpZXM6IHN0cmluZ1tdLCBwcml2YXRlIHByb3BlcnR5TWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgIHRoaXMuZGlyZWN0aXZlID0gaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmVsZW1lbnQgPSBoZWxwZXIuZWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gaGVscGVyLiRlbGVtZW50O1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuXG4gICAgaWYgKHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgJiYgY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLmNvbXBvbmVudFNjb3BlKTtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmogPSB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiA9IHRoaXMuY29tcG9uZW50U2NvcGU7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICh0aGlzIGFzIGFueSlbaW5wdXRzW2ldXSA9IG51bGw7XG4gICAgfVxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgb3V0cHV0cy5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgZW1pdHRlciA9ICh0aGlzIGFzIGFueSlbb3V0cHV0c1tqXV0gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICAgIGlmICh0aGlzLnByb3BPdXRzLmluZGV4T2Yob3V0cHV0c1tqXSkgPT09IC0xKSB7XG4gICAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkoXG4gICAgICAgICAgICBvdXRwdXRzW2pdLCAoZW1pdHRlciA9PiAodmFsdWU6IGFueSkgPT4gZW1pdHRlci5lbWl0KHZhbHVlKSkoZW1pdHRlcikpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBrID0gMDsgayA8IHByb3BPdXRzLmxlbmd0aDsgaysrKSB7XG4gICAgICB0aGlzLmNoZWNrTGFzdFZhbHVlcy5wdXNoKElOSVRJQUxfVkFMVUUpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIENvbGxlY3QgY29udGVudHMsIGluc2VydCBhbmQgY29tcGlsZSB0ZW1wbGF0ZVxuICAgIGNvbnN0IGF0dGFjaENoaWxkTm9kZXM6IElMaW5rRm58dW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSh0aGlzLnRlbXBsYXRlKTtcblxuICAgIC8vIEluc3RhbnRpYXRlIGNvbnRyb2xsZXIgKGlmIG5vdCBhbHJlYWR5IGRvbmUgc28pXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGlmIChjb250cm9sbGVyVHlwZSAmJiAhYmluZFRvQ29udHJvbGxlcikge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuY29tcG9uZW50U2NvcGUpO1xuICAgIH1cblxuICAgIC8vIFJlcXVpcmUgb3RoZXIgY29udHJvbGxlcnNcbiAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzID1cbiAgICAgICAgdGhpcy5oZWxwZXIucmVzb2x2ZUFuZEJpbmRSZXF1aXJlZENvbnRyb2xsZXJzKHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcblxuICAgIC8vIEhvb2s6ICRvbkluaXRcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCgpO1xuICAgIH1cblxuICAgIC8vIExpbmtpbmdcbiAgICBjb25zdCBsaW5rID0gdGhpcy5kaXJlY3RpdmUubGluaztcbiAgICBjb25zdCBwcmVMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgJiYgbGluay5wcmU7XG4gICAgY29uc3QgcG9zdExpbmsgPSB0eXBlb2YgbGluayA9PSAnb2JqZWN0JyA/IGxpbmsucG9zdCA6IGxpbms7XG4gICAgY29uc3QgYXR0cnM6IElBdHRyaWJ1dGVzID0gTk9UX1NVUFBPUlRFRDtcbiAgICBjb25zdCB0cmFuc2NsdWRlRm46IElUcmFuc2NsdWRlRnVuY3Rpb24gPSBOT1RfU1VQUE9SVEVEO1xuICAgIGlmIChwcmVMaW5rKSB7XG4gICAgICBwcmVMaW5rKHRoaXMuY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIGxpbmtGbih0aGlzLmNvbXBvbmVudFNjb3BlLCBudWxsISwge3BhcmVudEJvdW5kVHJhbnNjbHVkZUZuOiBhdHRhY2hDaGlsZE5vZGVzfSk7XG5cbiAgICBpZiAocG9zdExpbmspIHtcbiAgICAgIHBvc3RMaW5rKHRoaXMuY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIC8vIEhvb2s6ICRwb3N0TGlua1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRwb3N0TGluaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBjb25zdCBuZzFDaGFuZ2VzOiBhbnkgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhjaGFuZ2VzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgY29uc3QgY2hhbmdlOiBTaW1wbGVDaGFuZ2UgPSBjaGFuZ2VzW25hbWVdO1xuICAgICAgdGhpcy5zZXRDb21wb25lbnRQcm9wZXJ0eShuYW1lLCBjaGFuZ2UuY3VycmVudFZhbHVlKTtcbiAgICAgIG5nMUNoYW5nZXNbdGhpcy5wcm9wZXJ0eU1hcFtuYW1lXV0gPSBjaGFuZ2U7XG4gICAgfSk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbih0aGlzLmRlc3RpbmF0aW9uT2JqIS4kb25DaGFuZ2VzKSkge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiEuJG9uQ2hhbmdlcyEobmcxQ2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgbmdEb0NoZWNrKCkge1xuICAgIGNvbnN0IGRlc3RpbmF0aW9uT2JqID0gdGhpcy5kZXN0aW5hdGlvbk9iajtcbiAgICBjb25zdCBsYXN0VmFsdWVzID0gdGhpcy5jaGVja0xhc3RWYWx1ZXM7XG4gICAgY29uc3QgY2hlY2tQcm9wZXJ0aWVzID0gdGhpcy5jaGVja1Byb3BlcnRpZXM7XG4gICAgY29uc3QgcHJvcE91dHMgPSB0aGlzLnByb3BPdXRzO1xuICAgIGNoZWNrUHJvcGVydGllcy5mb3JFYWNoKChwcm9wTmFtZSwgaSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBkZXN0aW5hdGlvbk9iaiFbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgbGFzdCA9IGxhc3RWYWx1ZXNbaV07XG4gICAgICBpZiAoIXN0cmljdEVxdWFscyhsYXN0LCB2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbcHJvcE91dHNbaV1dO1xuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChsYXN0VmFsdWVzW2ldID0gdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2spKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuaGVscGVyLm9uRGVzdHJveSh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSk7XG4gIH1cblxuICBzZXRDb21wb25lbnRQcm9wZXJ0eShuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLmRlc3RpbmF0aW9uT2JqIVt0aGlzLnByb3BlcnR5TWFwW25hbWVdXSA9IHZhbHVlO1xuICB9XG59XG4iXX0=