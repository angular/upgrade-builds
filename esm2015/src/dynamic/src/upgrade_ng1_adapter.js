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
            class MyClass extends UpgradeNg1ComponentAdapter {
                constructor(scope, injector, elementRef) {
                    super(new UpgradeHelper(injector, name, elementRef, self.directive || undefined), scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                }
            }
            MyClass.decorators = [
                { type: Directive, args: [Object.assign({ jit: true }, directive),] }
            ];
            MyClass.ctorParameters = () => [
                { type: undefined, decorators: [{ type: Inject, args: [$SCOPE,] }] },
                { type: Injector },
                { type: ElementRef }
            ];
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
    }
    UpgradeNg1ComponentAdapter.decorators = [
        { type: Directive }
    ];
    UpgradeNg1ComponentAdapter.ctorParameters = () => [
        { type: UpgradeHelper },
        { type: undefined },
        { type: String },
        { type: Array },
        { type: Array },
        { type: Array },
        { type: Array },
        { type: undefined }
    ];
    return UpgradeNg1ComponentAdapter;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2R5bmFtaWMvc3JjL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBVyxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQWtFLE1BQU0sZUFBZSxDQUFDO0FBRzlKLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNsRCxPQUFPLEVBQTJDLGFBQWEsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ3hHLE9BQU8sRUFBQyxVQUFVLEVBQUUsWUFBWSxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFHL0QsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzlCLE1BQU0sYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUNGLE1BQU0sYUFBYSxHQUFRLGVBQWUsQ0FBQztBQUczQyxNQUFNLE9BQU8saUNBQWlDO0lBYzVDLFlBQW1CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBWC9CLFdBQU0sR0FBYSxFQUFFLENBQUM7UUFDdEIsaUJBQVksR0FBYSxFQUFFLENBQUM7UUFDNUIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixrQkFBYSxHQUFhLEVBQUUsQ0FBQztRQUM3QixvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUMvQixvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUMvQixnQkFBVyxHQUE2QixFQUFFLENBQUM7UUFDM0MsY0FBUyxHQUFvQixJQUFJLENBQUM7UUFLaEMsTUFBTSxRQUFRLEdBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFFLEVBQUUsQ0FBQyxHQUFH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QyxDQUFDLENBQUM7b0JBQ25FLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO2lCQUMxQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDM0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO2FBQ3BDO1FBQ0gsQ0FBQztRQUVELFdBQVc7WUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxvQkFBb0IsQ0FBQyxJQUFZLEVBQUUsS0FBVTtZQUMzQyxJQUFJLENBQUMsY0FBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDdkQsQ0FBQzs7O2dCQTVIRixTQUFTOzs7Z0JBN0h3QyxhQUFhOzs7Ozs7Ozs7SUEwUC9ELGlDQUFDO0tBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0LCBJbmplY3RvciwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJQXR0cmlidXRlcywgSURpcmVjdGl2ZSwgSURpcmVjdGl2ZVByZVBvc3QsIElJbmplY3RvclNlcnZpY2UsIElMaW5rRm4sIElTY29wZSwgSVRyYW5zY2x1ZGVGdW5jdGlvbn0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9jb25zdGFudHMnO1xuaW1wb3J0IHtJQmluZGluZ0Rlc3RpbmF0aW9uLCBJQ29udHJvbGxlckluc3RhbmNlLCBVcGdyYWRlSGVscGVyfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL3VwZ3JhZGVfaGVscGVyJztcbmltcG9ydCB7aXNGdW5jdGlvbiwgc3RyaWN0RXF1YWxzfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL3V0aWwnO1xuXG5cbmNvbnN0IENBTUVMX0NBU0UgPSAvKFtBLVpdKS9nO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5jb25zdCBOT1RfU1VQUE9SVEVEOiBhbnkgPSAnTk9UX1NVUFBPUlRFRCc7XG5cblxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlciB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICB0eXBlITogVHlwZTxhbnk+O1xuICBpbnB1dHM6IHN0cmluZ1tdID0gW107XG4gIGlucHV0c1JlbmFtZTogc3RyaW5nW10gPSBbXTtcbiAgb3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgb3V0cHV0c1JlbmFtZTogc3RyaW5nW10gPSBbXTtcbiAgcHJvcGVydHlPdXRwdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBjaGVja1Byb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG4gIHByb3BlcnR5TWFwOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgZGlyZWN0aXZlOiBJRGlyZWN0aXZlfG51bGwgPSBudWxsO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgdGVtcGxhdGUgITogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzZWxlY3RvciA9XG4gICAgICAgIG5hbWUucmVwbGFjZShDQU1FTF9DQVNFLCAoYWxsOiBzdHJpbmcsIG5leHQ6IHN0cmluZykgPT4gJy0nICsgbmV4dC50b0xvd2VyQ2FzZSgpKTtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIE5vdGU6IFRoZXJlIGlzIGEgYnVnIGluIFRTIDIuNCB0aGF0IHByZXZlbnRzIHVzIGZyb21cbiAgICAvLyBpbmxpbmluZyB0aGlzIGludG8gQERpcmVjdGl2ZVxuICAgIC8vIFRPRE8odGJvc2NoKTogZmluZCBvciBmaWxlIGEgYnVnIGFnYWluc3QgVHlwZVNjcmlwdCBmb3IgdGhpcy5cbiAgICBjb25zdCBkaXJlY3RpdmUgPSB7c2VsZWN0b3I6IHNlbGVjdG9yLCBpbnB1dHM6IHRoaXMuaW5wdXRzUmVuYW1lLCBvdXRwdXRzOiB0aGlzLm91dHB1dHNSZW5hbWV9O1xuXG4gICAgQERpcmVjdGl2ZSh7aml0OiB0cnVlLCAuLi5kaXJlY3RpdmV9KVxuICAgIGNsYXNzIE15Q2xhc3MgZXh0ZW5kcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlciBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9uRGVzdHJveSB7XG4gICAgICBjb25zdHJ1Y3RvcihASW5qZWN0KCRTQ09QRSkgc2NvcGU6IElTY29wZSwgaW5qZWN0b3I6IEluamVjdG9yLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIHN1cGVyKFxuICAgICAgICAgICAgbmV3IFVwZ3JhZGVIZWxwZXIoaW5qZWN0b3IsIG5hbWUsIGVsZW1lbnRSZWYsIHNlbGYuZGlyZWN0aXZlIHx8IHVuZGVmaW5lZCksIHNjb3BlLFxuICAgICAgICAgICAgc2VsZi50ZW1wbGF0ZSwgc2VsZi5pbnB1dHMsIHNlbGYub3V0cHV0cywgc2VsZi5wcm9wZXJ0eU91dHB1dHMsIHNlbGYuY2hlY2tQcm9wZXJ0aWVzLFxuICAgICAgICAgICAgc2VsZi5wcm9wZXJ0eU1hcCkgYXMgYW55O1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnR5cGUgPSBNeUNsYXNzO1xuICB9XG5cbiAgZXh0cmFjdEJpbmRpbmdzKCkge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIHRoaXMuZGlyZWN0aXZlIS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXModGhpcy5kaXJlY3RpdmUhLnNjb3BlISkubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEJpbmRpbmcgZGVmaW5pdGlvbnMgb24gc2NvcGUgYW5kIGNvbnRyb2xsZXIgYXQgdGhlIHNhbWUgdGltZSBhcmUgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gKGJ0Y0lzT2JqZWN0KSA/IHRoaXMuZGlyZWN0aXZlIS5iaW5kVG9Db250cm9sbGVyIDogdGhpcy5kaXJlY3RpdmUhLnNjb3BlO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuICAgICAgICBjb25zdCBiaW5kaW5nT3B0aW9ucyA9IGRlZmluaXRpb24uY2hhckF0KDEpO1xuICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGRlZmluaXRpb24uc3Vic3RyaW5nKGJpbmRpbmdPcHRpb25zID09PSAnPycgPyAyIDogMSkgfHwgcHJvcE5hbWU7XG5cbiAgICAgICAgLy8gUVVFU1RJT046IFdoYXQgYWJvdXQgYD0qYD8gSWdub3JlPyBUaHJvdz8gU3VwcG9ydD9cblxuICAgICAgICBjb25zdCBpbnB1dE5hbWUgPSBgaW5wdXRfJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBpbnB1dE5hbWVSZW5hbWUgPSBgJHtpbnB1dE5hbWV9OiAke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSBgb3V0cHV0XyR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZVJlbmFtZSA9IGAke291dHB1dE5hbWV9OiAke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWVSZW5hbWVDaGFuZ2UgPSBgJHtvdXRwdXROYW1lUmVuYW1lfUNoYW5nZWA7XG5cbiAgICAgICAgc3dpdGNoIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgdGhpcy5pbnB1dHMucHVzaChpbnB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dHNSZW5hbWUucHVzaChpbnB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtpbnB1dE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzUmVuYW1lLnB1c2goaW5wdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbaW5wdXROYW1lXSA9IHByb3BOYW1lO1xuXG4gICAgICAgICAgICB0aGlzLm91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0c1JlbmFtZS5wdXNoKG91dHB1dE5hbWVSZW5hbWVDaGFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtvdXRwdXROYW1lXSA9IHByb3BOYW1lO1xuXG4gICAgICAgICAgICB0aGlzLmNoZWNrUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlPdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgIHRoaXMub3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5vdXRwdXRzUmVuYW1lLnB1c2gob3V0cHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW291dHB1dE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke3RoaXMubmFtZX0nIGRpcmVjdGl2ZS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZ3JhZGUgbmcxIGNvbXBvbmVudHMgaW50byBBbmd1bGFyLlxuICAgKi9cbiAgc3RhdGljIHJlc29sdmUoXG4gICAgICBleHBvcnRlZENvbXBvbmVudHM6IHtbbmFtZTogc3RyaW5nXTogVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSxcbiAgICAgICRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBwcm9taXNlcyA9IE9iamVjdC5rZXlzKGV4cG9ydGVkQ29tcG9uZW50cykubWFwKG5hbWUgPT4ge1xuICAgICAgY29uc3QgZXhwb3J0ZWRDb21wb25lbnQgPSBleHBvcnRlZENvbXBvbmVudHNbbmFtZV07XG4gICAgICBleHBvcnRlZENvbXBvbmVudC5kaXJlY3RpdmUgPSBVcGdyYWRlSGVscGVyLmdldERpcmVjdGl2ZSgkaW5qZWN0b3IsIG5hbWUpO1xuICAgICAgZXhwb3J0ZWRDb21wb25lbnQuZXh0cmFjdEJpbmRpbmdzKCk7XG5cbiAgICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgICAgLnJlc29sdmUoVXBncmFkZUhlbHBlci5nZXRUZW1wbGF0ZSgkaW5qZWN0b3IsIGV4cG9ydGVkQ29tcG9uZW50LmRpcmVjdGl2ZSwgdHJ1ZSkpXG4gICAgICAgICAgLnRoZW4odGVtcGxhdGUgPT4gZXhwb3J0ZWRDb21wb25lbnQudGVtcGxhdGUgPSB0ZW1wbGF0ZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpO1xuICB9XG59XG5cbkBEaXJlY3RpdmUoKVxuY2xhc3MgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXIgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjayB7XG4gIHByaXZhdGUgY29udHJvbGxlckluc3RhbmNlOiBJQ29udHJvbGxlckluc3RhbmNlfG51bGwgPSBudWxsO1xuICBkZXN0aW5hdGlvbk9iajogSUJpbmRpbmdEZXN0aW5hdGlvbnxudWxsID0gbnVsbDtcbiAgY2hlY2tMYXN0VmFsdWVzOiBhbnlbXSA9IFtdO1xuICBkaXJlY3RpdmU6IElEaXJlY3RpdmU7XG4gIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICRlbGVtZW50OiBhbnkgPSBudWxsO1xuICBjb21wb25lbnRTY29wZTogSVNjb3BlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBoZWxwZXI6IFVwZ3JhZGVIZWxwZXIsIHNjb3BlOiBJU2NvcGUsIHByaXZhdGUgdGVtcGxhdGU6IHN0cmluZyxcbiAgICAgIHByaXZhdGUgaW5wdXRzOiBzdHJpbmdbXSwgcHJpdmF0ZSBvdXRwdXRzOiBzdHJpbmdbXSwgcHJpdmF0ZSBwcm9wT3V0czogc3RyaW5nW10sXG4gICAgICBwcml2YXRlIGNoZWNrUHJvcGVydGllczogc3RyaW5nW10sIHByaXZhdGUgcHJvcGVydHlNYXA6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7XG4gICAgdGhpcy5kaXJlY3RpdmUgPSBoZWxwZXIuZGlyZWN0aXZlO1xuICAgIHRoaXMuZWxlbWVudCA9IGhlbHBlci5lbGVtZW50O1xuICAgIHRoaXMuJGVsZW1lbnQgPSBoZWxwZXIuJGVsZW1lbnQ7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZSA9IHNjb3BlLiRuZXcoISF0aGlzLmRpcmVjdGl2ZS5zY29wZSk7XG5cbiAgICBjb25zdCBjb250cm9sbGVyVHlwZSA9IHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXI7XG5cbiAgICBpZiAodGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlciAmJiBjb250cm9sbGVyVHlwZSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuY29tcG9uZW50U2NvcGUpO1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiA9IHRoaXMuY29udHJvbGxlckluc3RhbmNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqID0gdGhpcy5jb21wb25lbnRTY29wZTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgKHRoaXMgYXMgYW55KVtpbnB1dHNbaV1dID0gbnVsbDtcbiAgICB9XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBvdXRwdXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBlbWl0dGVyID0gKHRoaXMgYXMgYW55KVtvdXRwdXRzW2pdXSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICAgICAgaWYgKHRoaXMucHJvcE91dHMuaW5kZXhPZihvdXRwdXRzW2pdKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5zZXRDb21wb25lbnRQcm9wZXJ0eShcbiAgICAgICAgICAgIG91dHB1dHNbal0sIChlbWl0dGVyID0+ICh2YWx1ZTogYW55KSA9PiBlbWl0dGVyLmVtaXQodmFsdWUpKShlbWl0dGVyKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGsgPSAwOyBrIDwgcHJvcE91dHMubGVuZ3RoOyBrKyspIHtcbiAgICAgIHRoaXMuY2hlY2tMYXN0VmFsdWVzLnB1c2goSU5JVElBTF9WQUxVRSk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgLy8gQ29sbGVjdCBjb250ZW50cywgaW5zZXJ0IGFuZCBjb21waWxlIHRlbXBsYXRlXG4gICAgY29uc3QgYXR0YWNoQ2hpbGROb2RlczogSUxpbmtGbnx1bmRlZmluZWQgPSB0aGlzLmhlbHBlci5wcmVwYXJlVHJhbnNjbHVzaW9uKCk7XG4gICAgY29uc3QgbGlua0ZuID0gdGhpcy5oZWxwZXIuY29tcGlsZVRlbXBsYXRlKHRoaXMudGVtcGxhdGUpO1xuXG4gICAgLy8gSW5zdGFudGlhdGUgY29udHJvbGxlciAoaWYgbm90IGFscmVhZHkgZG9uZSBzbylcbiAgICBjb25zdCBjb250cm9sbGVyVHlwZSA9IHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXI7XG4gICAgY29uc3QgYmluZFRvQ29udHJvbGxlciA9IHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXI7XG4gICAgaWYgKGNvbnRyb2xsZXJUeXBlICYmICFiaW5kVG9Db250cm9sbGVyKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA9IHRoaXMuaGVscGVyLmJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgdGhpcy5jb21wb25lbnRTY29wZSk7XG4gICAgfVxuXG4gICAgLy8gUmVxdWlyZSBvdGhlciBjb250cm9sbGVyc1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPVxuICAgICAgICB0aGlzLmhlbHBlci5yZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnModGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuXG4gICAgLy8gSG9vazogJG9uSW5pdFxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gTGlua2luZ1xuICAgIGNvbnN0IGxpbmsgPSB0aGlzLmRpcmVjdGl2ZS5saW5rO1xuICAgIGNvbnN0IHByZUxpbmsgPSB0eXBlb2YgbGluayA9PSAnb2JqZWN0JyAmJiBsaW5rLnByZTtcbiAgICBjb25zdCBwb3N0TGluayA9IHR5cGVvZiBsaW5rID09ICdvYmplY3QnID8gbGluay5wb3N0IDogbGluaztcbiAgICBjb25zdCBhdHRyczogSUF0dHJpYnV0ZXMgPSBOT1RfU1VQUE9SVEVEO1xuICAgIGNvbnN0IHRyYW5zY2x1ZGVGbjogSVRyYW5zY2x1ZGVGdW5jdGlvbiA9IE5PVF9TVVBQT1JURUQ7XG4gICAgaWYgKHByZUxpbmspIHtcbiAgICAgIHByZUxpbmsodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgbGlua0ZuKHRoaXMuY29tcG9uZW50U2NvcGUsIG51bGwhLCB7cGFyZW50Qm91bmRUcmFuc2NsdWRlRm46IGF0dGFjaENoaWxkTm9kZXN9KTtcblxuICAgIGlmIChwb3N0TGluaykge1xuICAgICAgcG9zdExpbmsodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJHBvc3RMaW5rXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IG5nMUNoYW5nZXM6IGFueSA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGNoYW5nZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBjb25zdCBjaGFuZ2U6IFNpbXBsZUNoYW5nZSA9IGNoYW5nZXNbbmFtZV07XG4gICAgICB0aGlzLnNldENvbXBvbmVudFByb3BlcnR5KG5hbWUsIGNoYW5nZS5jdXJyZW50VmFsdWUpO1xuICAgICAgbmcxQ2hhbmdlc1t0aGlzLnByb3BlcnR5TWFwW25hbWVdXSA9IGNoYW5nZTtcbiAgICB9KTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuZGVzdGluYXRpb25PYmohLiRvbkNoYW5nZXMpKSB7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqIS4kb25DaGFuZ2VzIShuZzFDaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3QgZGVzdGluYXRpb25PYmogPSB0aGlzLmRlc3RpbmF0aW9uT2JqO1xuICAgIGNvbnN0IGxhc3RWYWx1ZXMgPSB0aGlzLmNoZWNrTGFzdFZhbHVlcztcbiAgICBjb25zdCBjaGVja1Byb3BlcnRpZXMgPSB0aGlzLmNoZWNrUHJvcGVydGllcztcbiAgICBjb25zdCBwcm9wT3V0cyA9IHRoaXMucHJvcE91dHM7XG4gICAgY2hlY2tQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGRlc3RpbmF0aW9uT2JqIVtwcm9wTmFtZV07XG4gICAgICBjb25zdCBsYXN0ID0gbGFzdFZhbHVlc1tpXTtcbiAgICAgIGlmICghc3RyaWN0RXF1YWxzKGxhc3QsIHZhbHVlKSkge1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtwcm9wT3V0c1tpXV07XG4gICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KGxhc3RWYWx1ZXNbaV0gPSB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5oZWxwZXIub25EZXN0cm95KHRoaXMuY29tcG9uZW50U2NvcGUsIHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcbiAgfVxuXG4gIHNldENvbXBvbmVudFByb3BlcnR5KG5hbWU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIHRoaXMuZGVzdGluYXRpb25PYmohW3RoaXMucHJvcGVydHlNYXBbbmFtZV1dID0gdmFsdWU7XG4gIH1cbn1cbiJdfQ==