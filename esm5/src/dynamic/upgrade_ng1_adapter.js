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
var CAMEL_CASE = /([A-Z])/g;
var INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var NOT_SUPPORTED = 'NOT_SUPPORTED';
var UpgradeNg1ComponentAdapterBuilder = /** @class */ (function () {
    function UpgradeNg1ComponentAdapterBuilder(name) {
        this.name = name;
        this.inputs = [];
        this.inputsRename = [];
        this.outputs = [];
        this.outputsRename = [];
        this.propertyOutputs = [];
        this.checkProperties = [];
        this.propertyMap = {};
        this.directive = null;
        var selector = name.replace(CAMEL_CASE, function (all, next) { return '-' + next.toLowerCase(); });
        var self = this;
        // Note: There is a bug in TS 2.4 that prevents us from
        // inlining this into @Directive
        // TODO(tbosch): find or file a bug against TypeScript for this.
        var directive = { selector: selector, inputs: this.inputsRename, outputs: this.outputsRename };
        var MyClass = /** @class */ (function () {
            function MyClass(scope, injector, elementRef) {
                var helper = new UpgradeHelper(injector, name, elementRef, this.directive);
                return new UpgradeNg1ComponentAdapter(helper, scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
            }
            MyClass.prototype.ngOnInit = function () {
            };
            MyClass.prototype.ngOnChanges = function () {
            };
            MyClass.prototype.ngDoCheck = function () {
            };
            MyClass.prototype.ngOnDestroy = function () {
            };
            MyClass.decorators = [
                { type: Directive, args: [directive,] },
            ];
            /** @nocollapse */
            MyClass.ctorParameters = function () { return [
                { type: undefined, decorators: [{ type: Inject, args: [$SCOPE,] }] },
                { type: Injector },
                { type: ElementRef }
            ]; };
            return MyClass;
        }());
        this.type = MyClass;
    }
    UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = function () {
        var _this = this;
        var btcIsObject = typeof this.directive.bindToController === 'object';
        if (btcIsObject && Object.keys(this.directive.scope).length) {
            throw new Error("Binding definitions on scope and controller at the same time are not supported.");
        }
        var context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;
        if (typeof context == 'object') {
            Object.keys(context).forEach(function (propName) {
                var definition = context[propName];
                var bindingType = definition.charAt(0);
                var bindingOptions = definition.charAt(1);
                var attrName = definition.substring(bindingOptions === '?' ? 2 : 1) || propName;
                // QUESTION: What about `=*`? Ignore? Throw? Support?
                var inputName = "input_" + attrName;
                var inputNameRename = inputName + ": " + attrName;
                var outputName = "output_" + attrName;
                var outputNameRename = outputName + ": " + attrName;
                var outputNameRenameChange = outputNameRename + "Change";
                switch (bindingType) {
                    case '@':
                    case '<':
                        _this.inputs.push(inputName);
                        _this.inputsRename.push(inputNameRename);
                        _this.propertyMap[inputName] = propName;
                        break;
                    case '=':
                        _this.inputs.push(inputName);
                        _this.inputsRename.push(inputNameRename);
                        _this.propertyMap[inputName] = propName;
                        _this.outputs.push(outputName);
                        _this.outputsRename.push(outputNameRenameChange);
                        _this.propertyMap[outputName] = propName;
                        _this.checkProperties.push(propName);
                        _this.propertyOutputs.push(outputName);
                        break;
                    case '&':
                        _this.outputs.push(outputName);
                        _this.outputsRename.push(outputNameRename);
                        _this.propertyMap[outputName] = propName;
                        break;
                    default:
                        var json = JSON.stringify(context);
                        throw new Error("Unexpected mapping '" + bindingType + "' in '" + json + "' in '" + _this.name + "' directive.");
                }
            });
        }
    };
    /**
     * Upgrade ng1 components into Angular.
     */
    UpgradeNg1ComponentAdapterBuilder.resolve = function (exportedComponents, $injector) {
        var promises = Object.keys(exportedComponents).map(function (name) {
            var exportedComponent = exportedComponents[name];
            exportedComponent.directive = UpgradeHelper.getDirective($injector, name);
            exportedComponent.extractBindings();
            return Promise
                .resolve(UpgradeHelper.getTemplate($injector, exportedComponent.directive, true))
                .then(function (template) { return exportedComponent.template = template; });
        });
        return Promise.all(promises);
    };
    return UpgradeNg1ComponentAdapterBuilder;
}());
export { UpgradeNg1ComponentAdapterBuilder };
var UpgradeNg1ComponentAdapter = /** @class */ (function () {
    function UpgradeNg1ComponentAdapter(helper, scope, template, inputs, outputs, propOuts, checkProperties, propertyMap) {
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
        var controllerType = this.directive.controller;
        if (this.directive.bindToController && controllerType) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
            this.destinationObj = this.controllerInstance;
        }
        else {
            this.destinationObj = this.componentScope;
        }
        for (var i = 0; i < inputs.length; i++) {
            this[inputs[i]] = null;
        }
        for (var j = 0; j < outputs.length; j++) {
            var emitter = this[outputs[j]] = new EventEmitter();
            if (this.propOuts.indexOf(outputs[j]) === -1) {
                this.setComponentProperty(outputs[j], (function (emitter) { return function (value) { return emitter.emit(value); }; })(emitter));
            }
        }
        for (var k = 0; k < propOuts.length; k++) {
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    UpgradeNg1ComponentAdapter.prototype.ngOnInit = function () {
        // Collect contents, insert and compile template
        var attachChildNodes = this.helper.prepareTransclusion();
        var linkFn = this.helper.compileTemplate(this.template);
        // Instantiate controller (if not already done so)
        var controllerType = this.directive.controller;
        var bindToController = this.directive.bindToController;
        if (controllerType && !bindToController) {
            this.controllerInstance = this.helper.buildController(controllerType, this.componentScope);
        }
        // Require other controllers
        var requiredControllers = this.helper.resolveAndBindRequiredControllers(this.controllerInstance);
        // Hook: $onInit
        if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
            this.controllerInstance.$onInit();
        }
        // Linking
        var link = this.directive.link;
        var preLink = (typeof link == 'object') && link.pre;
        var postLink = (typeof link == 'object') ? link.post : link;
        var attrs = NOT_SUPPORTED;
        var transcludeFn = NOT_SUPPORTED;
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
    };
    UpgradeNg1ComponentAdapter.prototype.ngOnChanges = function (changes) {
        var _this = this;
        var ng1Changes = {};
        Object.keys(changes).forEach(function (name) {
            var change = changes[name];
            _this.setComponentProperty(name, change.currentValue);
            ng1Changes[_this.propertyMap[name]] = change;
        });
        if (isFunction(this.destinationObj.$onChanges)) {
            this.destinationObj.$onChanges(ng1Changes);
        }
    };
    UpgradeNg1ComponentAdapter.prototype.ngDoCheck = function () {
        var _this = this;
        var destinationObj = this.destinationObj;
        var lastValues = this.checkLastValues;
        var checkProperties = this.checkProperties;
        var propOuts = this.propOuts;
        checkProperties.forEach(function (propName, i) {
            var value = destinationObj[propName];
            var last = lastValues[i];
            if (!strictEquals(last, value)) {
                var eventEmitter = _this[propOuts[i]];
                eventEmitter.emit(lastValues[i] = value);
            }
        });
        if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
            this.controllerInstance.$doCheck();
        }
    };
    UpgradeNg1ComponentAdapter.prototype.ngOnDestroy = function () {
        if (this.controllerInstance && isFunction(this.controllerInstance.$onDestroy)) {
            this.controllerInstance.$onDestroy();
        }
        this.componentScope.$destroy();
    };
    UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function (name, value) {
        this.destinationObj[this.propertyMap[name]] = value;
    };
    return UpgradeNg1ComponentAdapter;
}());

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2R5bmFtaWMvdXBncmFkZV9uZzFfYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFXLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBdUQsTUFBTSxlQUFlLENBQUM7QUFFbkosT0FBTyxLQUFLLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUEyQyxhQUFhLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRyxPQUFPLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3hELElBQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM5QixJQUFNLGFBQWEsR0FBRztJQUNwQixpQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFDRixJQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFHM0M7SUFZRSwyQ0FBbUIsSUFBWTtRQUFaLFNBQUksR0FBSixJQUFJLENBQVE7UUFWL0IsV0FBTSxHQUFhLEVBQUUsQ0FBQztRQUN0QixpQkFBWSxHQUFhLEVBQUUsQ0FBQztRQUM1QixZQUFPLEdBQWEsRUFBRSxDQUFDO1FBQ3ZCLGtCQUFhLEdBQWEsRUFBRSxDQUFDO1FBQzdCLG9CQUFlLEdBQWEsRUFBRSxDQUFDO1FBQy9CLG9CQUFlLEdBQWEsRUFBRSxDQUFDO1FBQy9CLGdCQUFXLEdBQTZCLEVBQUUsQ0FBQztRQUMzQyxjQUFTLEdBQTRCLElBQUksQ0FBQztRQUl4QyxJQUFNLFFBQVEsR0FDVixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxVQUFDLEdBQVcsRUFBRSxJ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QUcsY0FBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxJQUFNLElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLElBQU0sWUFBWSxHQUF1QixLQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO2FBQzFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNwQztJQUNILENBQUM7SUFFRCxnREFBVyxHQUFYO1FBQ0UsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDdEM7UUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCx5REFBb0IsR0FBcEIsVUFBcUIsSUFBWSxFQUFFLEtBQVU7UUFDM0MsSUFBSSxDQUFDLGNBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN4RCxDQUFDO0lBQ0gsaUNBQUM7QUFBRCxDQUFDLEFBaElELElBZ0lDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgRWxlbWVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3QsIEluamVjdG9yLCBPbkNoYW5nZXMsIE9uSW5pdCwgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuLi9jb21tb24vYW5ndWxhcjEnO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4uL2NvbW1vbi9jb25zdGFudHMnO1xuaW1wb3J0IHtJQmluZGluZ0Rlc3RpbmF0aW9uLCBJQ29udHJvbGxlckluc3RhbmNlLCBVcGdyYWRlSGVscGVyfSBmcm9tICcuLi9jb21tb24vdXBncmFkZV9oZWxwZXInO1xuaW1wb3J0IHtpc0Z1bmN0aW9uLCBzdHJpY3RFcXVhbHN9IGZyb20gJy4uL2NvbW1vbi91dGlsJztcblxuXG5jb25zdCBDQU1FTF9DQVNFID0gLyhbQS1aXSkvZztcbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuY29uc3QgTk9UX1NVUFBPUlRFRDogYW55ID0gJ05PVF9TVVBQT1JURUQnO1xuXG5cbmV4cG9ydCBjbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXIge1xuICB0eXBlOiBUeXBlPGFueT47XG4gIGlucHV0czogc3RyaW5nW10gPSBbXTtcbiAgaW5wdXRzUmVuYW1lOiBzdHJpbmdbXSA9IFtdO1xuICBvdXRwdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBvdXRwdXRzUmVuYW1lOiBzdHJpbmdbXSA9IFtdO1xuICBwcm9wZXJ0eU91dHB1dHM6IHN0cmluZ1tdID0gW107XG4gIGNoZWNrUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcbiAgcHJvcGVydHlNYXA6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBkaXJlY3RpdmU6IGFuZ3VsYXIuSURpcmVjdGl2ZXxudWxsID0gbnVsbDtcbiAgdGVtcGxhdGU6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPVxuICAgICAgICBuYW1lLnJlcGxhY2UoQ0FNRUxfQ0FTRSwgKGFsbDogc3RyaW5nLCBuZXh0OiBzdHJpbmcpID0+ICctJyArIG5leHQudG9Mb3dlckNhc2UoKSk7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBOb3RlOiBUaGVyZSBpcyBhIGJ1ZyBpbiBUUyAyLjQgdGhhdCBwcmV2ZW50cyB1cyBmcm9tXG4gICAgLy8gaW5saW5pbmcgdGhpcyBpbnRvIEBEaXJlY3RpdmVcbiAgICAvLyBUT0RPKHRib3NjaCk6IGZpbmQgb3IgZmlsZSBhIGJ1ZyBhZ2FpbnN0IFR5cGVTY3JpcHQgZm9yIHRoaXMuXG4gICAgY29uc3QgZGlyZWN0aXZlID0ge3NlbGVjdG9yOiBzZWxlY3RvciwgaW5wdXRzOiB0aGlzLmlucHV0c1JlbmFtZSwgb3V0cHV0czogdGhpcy5vdXRwdXRzUmVuYW1lfTtcblxuICAgIEBEaXJlY3RpdmUoZGlyZWN0aXZlKVxuICAgIGNsYXNzIE15Q2xhc3Mge1xuICAgICAgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmU7XG4gICAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgICBASW5qZWN0KCRTQ09QRSkgc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBpbmplY3RvcjogSW5qZWN0b3IsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgY29uc3QgaGVscGVyID0gbmV3IFVwZ3JhZGVIZWxwZXIoaW5qZWN0b3IsIG5hbWUsIGVsZW1lbnRSZWYsIHRoaXMuZGlyZWN0aXZlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlcihcbiAgICAgICAgICAgIGhlbHBlciwgc2NvcGUsIHNlbGYudGVtcGxhdGUsIHNlbGYuaW5wdXRzLCBzZWxmLm91dHB1dHMsIHNlbGYucHJvcGVydHlPdXRwdXRzLFxuICAgICAgICAgICAgc2VsZi5jaGVja1Byb3BlcnRpZXMsIHNlbGYucHJvcGVydHlNYXApIGFzIGFueTtcbiAgICAgIH1cbiAgICAgIG5nT25Jbml0KCkgeyAvKiBuZWVkcyB0byBiZSBoZXJlIGZvciBuZzIgdG8gcHJvcGVybHkgZGV0ZWN0IGl0ICovXG4gICAgICB9XG4gICAgICBuZ09uQ2hhbmdlcygpIHsgLyogbmVlZHMgdG8gYmUgaGVyZSBmb3IgbmcyIHRvIHByb3Blcmx5IGRldGVjdCBpdCAqL1xuICAgICAgfVxuICAgICAgbmdEb0NoZWNrKCkgeyAvKiBuZWVkcyB0byBiZSBoZXJlIGZvciBuZzIgdG8gcHJvcGVybHkgZGV0ZWN0IGl0ICovXG4gICAgICB9XG4gICAgICBuZ09uRGVzdHJveSgpIHsgLyogbmVlZHMgdG8gYmUgaGVyZSBmb3IgbmcyIHRvIHByb3Blcmx5IGRldGVjdCBpdCAqL1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnR5cGUgPSBNeUNsYXNzO1xuICB9XG5cbiAgZXh0cmFjdEJpbmRpbmdzKCkge1xuICAgIGNvbnN0IGJ0Y0lzT2JqZWN0ID0gdHlwZW9mIHRoaXMuZGlyZWN0aXZlICEuYmluZFRvQ29udHJvbGxlciA9PT0gJ29iamVjdCc7XG4gICAgaWYgKGJ0Y0lzT2JqZWN0ICYmIE9iamVjdC5rZXlzKHRoaXMuZGlyZWN0aXZlICEuc2NvcGUgISkubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYEJpbmRpbmcgZGVmaW5pdGlvbnMgb24gc2NvcGUgYW5kIGNvbnRyb2xsZXIgYXQgdGhlIHNhbWUgdGltZSBhcmUgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZXh0ID0gKGJ0Y0lzT2JqZWN0KSA/IHRoaXMuZGlyZWN0aXZlICEuYmluZFRvQ29udHJvbGxlciA6IHRoaXMuZGlyZWN0aXZlICEuc2NvcGU7XG5cbiAgICBpZiAodHlwZW9mIGNvbnRleHQgPT0gJ29iamVjdCcpIHtcbiAgICAgIE9iamVjdC5rZXlzKGNvbnRleHQpLmZvckVhY2gocHJvcE5hbWUgPT4ge1xuICAgICAgICBjb25zdCBkZWZpbml0aW9uID0gY29udGV4dFtwcm9wTmFtZV07XG4gICAgICAgIGNvbnN0IGJpbmRpbmdUeXBlID0gZGVmaW5pdGlvbi5jaGFyQXQoMCk7XG4gICAgICAgIGNvbnN0IGJpbmRpbmdPcHRpb25zID0gZGVmaW5pdGlvbi5jaGFyQXQoMSk7XG4gICAgICAgIGNvbnN0IGF0dHJOYW1lID0gZGVmaW5pdGlvbi5zdWJzdHJpbmcoYmluZGluZ09wdGlvbnMgPT09ICc/JyA/IDIgOiAxKSB8fCBwcm9wTmFtZTtcblxuICAgICAgICAvLyBRVUVTVElPTjogV2hhdCBhYm91dCBgPSpgPyBJZ25vcmU/IFRocm93PyBTdXBwb3J0P1xuXG4gICAgICAgIGNvbnN0IGlucHV0TmFtZSA9IGBpbnB1dF8ke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IGlucHV0TmFtZVJlbmFtZSA9IGAke2lucHV0TmFtZX06ICR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZSA9IGBvdXRwdXRfJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lUmVuYW1lID0gYCR7b3V0cHV0TmFtZX06ICR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZVJlbmFtZUNoYW5nZSA9IGAke291dHB1dE5hbWVSZW5hbWV9Q2hhbmdlYDtcblxuICAgICAgICBzd2l0Y2ggKGJpbmRpbmdUeXBlKSB7XG4gICAgICAgICAgY2FzZSAnQCc6XG4gICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlucHV0c1JlbmFtZS5wdXNoKGlucHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW2lucHV0TmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJz0nOlxuICAgICAgICAgICAgdGhpcy5pbnB1dHMucHVzaChpbnB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dHNSZW5hbWUucHVzaChpbnB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtpbnB1dE5hbWVdID0gcHJvcE5hbWU7XG5cbiAgICAgICAgICAgIHRoaXMub3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5vdXRwdXRzUmVuYW1lLnB1c2gob3V0cHV0TmFtZVJlbmFtZUNoYW5nZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW291dHB1dE5hbWVdID0gcHJvcE5hbWU7XG5cbiAgICAgICAgICAgIHRoaXMuY2hlY2tQcm9wZXJ0aWVzLnB1c2gocHJvcE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJyYnOlxuICAgICAgICAgICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLm91dHB1dHNSZW5hbWUucHVzaChvdXRwdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbb3V0cHV0TmFtZV0gPSBwcm9wTmFtZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBsZXQganNvbiA9IEpTT04uc3RyaW5naWZ5KGNvbnRleHQpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIGBVbmV4cGVjdGVkIG1hcHBpbmcgJyR7YmluZGluZ1R5cGV9JyBpbiAnJHtqc29ufScgaW4gJyR7dGhpcy5uYW1lfScgZGlyZWN0aXZlLmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBncmFkZSBuZzEgY29tcG9uZW50cyBpbnRvIEFuZ3VsYXIuXG4gICAqL1xuICBzdGF0aWMgcmVzb2x2ZShcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50czoge1tuYW1lOiBzdHJpbmddOiBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlckJ1aWxkZXJ9LFxuICAgICAgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBPYmplY3Qua2V5cyhleHBvcnRlZENvbXBvbmVudHMpLm1hcChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGV4cG9ydGVkQ29tcG9uZW50ID0gZXhwb3J0ZWRDb21wb25lbnRzW25hbWVdO1xuICAgICAgZXhwb3J0ZWRDb21wb25lbnQuZGlyZWN0aXZlID0gVXBncmFkZUhlbHBlci5nZXREaXJlY3RpdmUoJGluamVjdG9yLCBuYW1lKTtcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50LmV4dHJhY3RCaW5kaW5ncygpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgIC5yZXNvbHZlKFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUoJGluamVjdG9yLCBleHBvcnRlZENvbXBvbmVudC5kaXJlY3RpdmUsIHRydWUpKVxuICAgICAgICAgIC50aGVuKHRlbXBsYXRlID0+IGV4cG9ydGVkQ29tcG9uZW50LnRlbXBsYXRlID0gdGVtcGxhdGUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxufVxuXG5jbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlciBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrIHtcbiAgcHJpdmF0ZSBjb250cm9sbGVySW5zdGFuY2U6IElDb250cm9sbGVySW5zdGFuY2V8bnVsbCA9IG51bGw7XG4gIGRlc3RpbmF0aW9uT2JqOiBJQmluZGluZ0Rlc3RpbmF0aW9ufG51bGwgPSBudWxsO1xuICBjaGVja0xhc3RWYWx1ZXM6IGFueVtdID0gW107XG4gIHByaXZhdGUgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmU7XG4gIGVsZW1lbnQ6IEVsZW1lbnQ7XG4gICRlbGVtZW50OiBhbnkgPSBudWxsO1xuICBjb21wb25lbnRTY29wZTogYW5ndWxhci5JU2NvcGU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGhlbHBlcjogVXBncmFkZUhlbHBlciwgc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBwcml2YXRlIHRlbXBsYXRlOiBzdHJpbmcsXG4gICAgICBwcml2YXRlIGlucHV0czogc3RyaW5nW10sIHByaXZhdGUgb3V0cHV0czogc3RyaW5nW10sIHByaXZhdGUgcHJvcE91dHM6IHN0cmluZ1tdLFxuICAgICAgcHJpdmF0ZSBjaGVja1Byb3BlcnRpZXM6IHN0cmluZ1tdLCBwcml2YXRlIHByb3BlcnR5TWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkge1xuICAgIHRoaXMuZGlyZWN0aXZlID0gaGVscGVyLmRpcmVjdGl2ZTtcbiAgICB0aGlzLmVsZW1lbnQgPSBoZWxwZXIuZWxlbWVudDtcbiAgICB0aGlzLiRlbGVtZW50ID0gaGVscGVyLiRlbGVtZW50O1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCEhdGhpcy5kaXJlY3RpdmUuc2NvcGUpO1xuXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuXG4gICAgaWYgKHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXIgJiYgY29udHJvbGxlclR5cGUpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLmNvbXBvbmVudFNjb3BlKTtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmogPSB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiA9IHRoaXMuY29tcG9uZW50U2NvcGU7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICh0aGlzIGFzIGFueSlbaW5wdXRzW2ldXSA9IG51bGw7XG4gICAgfVxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgb3V0cHV0cy5sZW5ndGg7IGorKykge1xuICAgICAgY29uc3QgZW1pdHRlciA9ICh0aGlzIGFzIGFueSlbb3V0cHV0c1tqXV0gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgICAgIGlmICh0aGlzLnByb3BPdXRzLmluZGV4T2Yob3V0cHV0c1tqXSkgPT09IC0xKSB7XG4gICAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkoXG4gICAgICAgICAgICBvdXRwdXRzW2pdLCAoZW1pdHRlciA9PiAodmFsdWU6IGFueSkgPT4gZW1pdHRlci5lbWl0KHZhbHVlKSkoZW1pdHRlcikpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGxldCBrID0gMDsgayA8IHByb3BPdXRzLmxlbmd0aDsgaysrKSB7XG4gICAgICB0aGlzLmNoZWNrTGFzdFZhbHVlcy5wdXNoKElOSVRJQUxfVkFMVUUpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIC8vIENvbGxlY3QgY29udGVudHMsIGluc2VydCBhbmQgY29tcGlsZSB0ZW1wbGF0ZVxuICAgIGNvbnN0IGF0dGFjaENoaWxkTm9kZXM6IGFuZ3VsYXIuSUxpbmtGbnx1bmRlZmluZWQgPSB0aGlzLmhlbHBlci5wcmVwYXJlVHJhbnNjbHVzaW9uKCk7XG4gICAgY29uc3QgbGlua0ZuID0gdGhpcy5oZWxwZXIuY29tcGlsZVRlbXBsYXRlKHRoaXMudGVtcGxhdGUpO1xuXG4gICAgLy8gSW5zdGFudGlhdGUgY29udHJvbGxlciAoaWYgbm90IGFscmVhZHkgZG9uZSBzbylcbiAgICBjb25zdCBjb250cm9sbGVyVHlwZSA9IHRoaXMuZGlyZWN0aXZlLmNvbnRyb2xsZXI7XG4gICAgY29uc3QgYmluZFRvQ29udHJvbGxlciA9IHRoaXMuZGlyZWN0aXZlLmJpbmRUb0NvbnRyb2xsZXI7XG4gICAgaWYgKGNvbnRyb2xsZXJUeXBlICYmICFiaW5kVG9Db250cm9sbGVyKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA9IHRoaXMuaGVscGVyLmJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgdGhpcy5jb21wb25lbnRTY29wZSk7XG4gICAgfVxuXG4gICAgLy8gUmVxdWlyZSBvdGhlciBjb250cm9sbGVyc1xuICAgIGNvbnN0IHJlcXVpcmVkQ29udHJvbGxlcnMgPVxuICAgICAgICB0aGlzLmhlbHBlci5yZXNvbHZlQW5kQmluZFJlcXVpcmVkQ29udHJvbGxlcnModGhpcy5jb250cm9sbGVySW5zdGFuY2UpO1xuXG4gICAgLy8gSG9vazogJG9uSW5pdFxuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KCk7XG4gICAgfVxuXG4gICAgLy8gTGlua2luZ1xuICAgIGNvbnN0IGxpbmsgPSB0aGlzLmRpcmVjdGl2ZS5saW5rO1xuICAgIGNvbnN0IHByZUxpbmsgPSAodHlwZW9mIGxpbmsgPT0gJ29iamVjdCcpICYmIChsaW5rIGFzIGFuZ3VsYXIuSURpcmVjdGl2ZVByZVBvc3QpLnByZTtcbiAgICBjb25zdCBwb3N0TGluayA9ICh0eXBlb2YgbGluayA9PSAnb2JqZWN0JykgPyAobGluayBhcyBhbmd1bGFyLklEaXJlY3RpdmVQcmVQb3N0KS5wb3N0IDogbGluaztcbiAgICBjb25zdCBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBhbmd1bGFyLklUcmFuc2NsdWRlRnVuY3Rpb24gPSBOT1RfU1VQUE9SVEVEO1xuICAgIGlmIChwcmVMaW5rKSB7XG4gICAgICBwcmVMaW5rKHRoaXMuY29tcG9uZW50U2NvcGUsIHRoaXMuJGVsZW1lbnQsIGF0dHJzLCByZXF1aXJlZENvbnRyb2xsZXJzLCB0cmFuc2NsdWRlRm4pO1xuICAgIH1cblxuICAgIGxpbmtGbih0aGlzLmNvbXBvbmVudFNjb3BlLCBudWxsICEsIHtwYXJlbnRCb3VuZFRyYW5zY2x1ZGVGbjogYXR0YWNoQ2hpbGROb2Rlc30pO1xuXG4gICAgaWYgKHBvc3RMaW5rKSB7XG4gICAgICBwb3N0TGluayh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICAvLyBIb29rOiAkcG9zdExpbmtcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmspKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kcG9zdExpbmsoKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgY29uc3QgbmcxQ2hhbmdlczogYW55ID0ge307XG4gICAgT2JqZWN0LmtleXMoY2hhbmdlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGNoYW5nZTogU2ltcGxlQ2hhbmdlID0gY2hhbmdlc1tuYW1lXTtcbiAgICAgIHRoaXMuc2V0Q29tcG9uZW50UHJvcGVydHkobmFtZSwgY2hhbmdlLmN1cnJlbnRWYWx1ZSk7XG4gICAgICBuZzFDaGFuZ2VzW3RoaXMucHJvcGVydHlNYXBbbmFtZV1dID0gY2hhbmdlO1xuICAgIH0pO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24odGhpcy5kZXN0aW5hdGlvbk9iaiAhLiRvbkNoYW5nZXMpKSB7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqICEuJG9uQ2hhbmdlcyAhKG5nMUNoYW5nZXMpO1xuICAgIH1cbiAgfVxuXG4gIG5nRG9DaGVjaygpIHtcbiAgICBjb25zdCBkZXN0aW5hdGlvbk9iaiA9IHRoaXMuZGVzdGluYXRpb25PYmo7XG4gICAgY29uc3QgbGFzdFZhbHVlcyA9IHRoaXMuY2hlY2tMYXN0VmFsdWVzO1xuICAgIGNvbnN0IGNoZWNrUHJvcGVydGllcyA9IHRoaXMuY2hlY2tQcm9wZXJ0aWVzO1xuICAgIGNvbnN0IHByb3BPdXRzID0gdGhpcy5wcm9wT3V0cztcbiAgICBjaGVja1Byb3BlcnRpZXMuZm9yRWFjaCgocHJvcE5hbWUsIGkpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gZGVzdGluYXRpb25PYmogIVtwcm9wTmFtZV07XG4gICAgICBjb25zdCBsYXN0ID0gbGFzdFZhbHVlc1tpXTtcbiAgICAgIGlmICghc3RyaWN0RXF1YWxzKGxhc3QsIHZhbHVlKSkge1xuICAgICAgICBjb25zdCBldmVudEVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gKHRoaXMgYXMgYW55KVtwcm9wT3V0c1tpXV07XG4gICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KGxhc3RWYWx1ZXNbaV0gPSB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaykpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRkb0NoZWNrKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uRGVzdHJveSkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiRkZXN0cm95KCk7XG4gIH1cblxuICBzZXRDb21wb25lbnRQcm9wZXJ0eShuYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLmRlc3RpbmF0aW9uT2JqICFbdGhpcy5wcm9wZXJ0eU1hcFtuYW1lXV0gPSB2YWx1ZTtcbiAgfVxufVxuIl19