import { __assign, __decorate, __extends, __metadata, __param } from "tslib";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, ElementRef, EventEmitter, Inject, Injector } from '@angular/core';
import { $SCOPE } from '../../common/src/constants';
import { UpgradeHelper } from '../../common/src/upgrade_helper';
import { isFunction, strictEquals } from '../../common/src/util';
import * as i0 from "@angular/core";
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
        var MyClass = /** @class */ (function (_super) {
            __extends(MyClass, _super);
            function MyClass(scope, injector, elementRef) {
                var _this = this;
                _this = _super.call(this, new UpgradeHelper(injector, name, elementRef, self.directive || undefined), scope, self.template, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap) || this;
                return _this;
            }
            MyClass = __decorate([
                Directive(__assign({ jit: true }, directive)),
                __param(0, Inject($SCOPE)),
                __metadata("design:paramtypes", [Object, Injector, ElementRef])
            ], MyClass);
            return MyClass;
        }(UpgradeNg1ComponentAdapter));
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
        var preLink = typeof link == 'object' && link.pre;
        var postLink = typeof link == 'object' ? link.post : link;
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
    UpgradeNg1ComponentAdapter.prototype.ngOnDestroy = function () { this.helper.onDestroy(this.componentScope, this.controllerInstance); };
    UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function (name, value) {
        this.destinationObj[this.propertyMap[name]] = value;
    };
    UpgradeNg1ComponentAdapter.ɵfac = function UpgradeNg1ComponentAdapter_Factory(t) { i0.ɵɵinvalidFactory(); };
    UpgradeNg1ComponentAdapter.ɵdir = i0.ɵɵdefineDirective({ type: UpgradeNg1ComponentAdapter, features: [i0.ɵɵNgOnChangesFeature] });
    return UpgradeNg1ComponentAdapter;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3JjL2R5bmFtaWMvc3JjL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQVcsVUFBVSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFrRSxNQUFNLGVBQWUsQ0FBQztBQUc5SixPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDbEQsT0FBTyxFQUEyQyxhQUFhLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUN4RyxPQUFPLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBQyxNQUFNLHVCQUF1QixDQUFDOztBQUcvRCxJQUFNLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDOUIsSUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBQ0YsSUFBTSxhQUFhLEdBQVEsZUFBZSxDQUFDO0FBRzNDO0lBY0UsMkNBQW1CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBWC9CLFdBQU0sR0FBYSxFQUFFLENBQUM7UUFDdEIsaUJBQVksR0FBYSxFQUFFLENBQUM7UUFDNUIsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQUN2QixrQkFBYSxHQUFhLEVBQUUsQ0FBQztRQUM3QixvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUMvQixvQkFBZSxHQUFhLEVBQUUsQ0FBQztRQUMvQixnQkFBVyxHQUE2QixFQUFFLENBQUM7UUFDM0MsY0FBUyxHQUFvQixJQUFJLENBQUM7UUFLaEMsSUFBTSxRQUFRLEdBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsVUFBQyxHQUFXLEVBQUUsSUFBWSxJQUFLLE9BQUEsR0FBRyxHQUFHLElBQUks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LFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLElBQU0sWUFBWSxHQUF1QixLQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDO2FBQzFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzNFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNwQztJQUNILENBQUM7SUFFRCxnREFBVyxHQUFYLGNBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXRGLHlEQUFvQixHQUFwQixVQUFxQixJQUFZLEVBQUUsS0FBVTtRQUMzQyxJQUFJLENBQUMsY0FBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3hELENBQUM7O21FQXpIRywwQkFBMEI7cUNBekloQztDQW1RQyxBQTFIRCxJQTBIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0LCBJbmplY3RvciwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJQXR0cmlidXRlcywgSURpcmVjdGl2ZSwgSURpcmVjdGl2ZVByZVBvc3QsIElJbmplY3RvclNlcnZpY2UsIElMaW5rRm4sIElTY29wZSwgSVRyYW5zY2x1ZGVGdW5jdGlvbn0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9hbmd1bGFyMSc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi4vLi4vY29tbW9uL3NyYy9jb25zdGFudHMnO1xuaW1wb3J0IHtJQmluZGluZ0Rlc3RpbmF0aW9uLCBJQ29udHJvbGxlckluc3RhbmNlLCBVcGdyYWRlSGVscGVyfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL3VwZ3JhZGVfaGVscGVyJztcbmltcG9ydCB7aXNGdW5jdGlvbiwgc3RyaWN0RXF1YWxzfSBmcm9tICcuLi8uLi9jb21tb24vc3JjL3V0aWwnO1xuXG5cbmNvbnN0IENBTUVMX0NBU0UgPSAvKFtBLVpdKS9nO1xuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5jb25zdCBOT1RfU1VQUE9SVEVEOiBhbnkgPSAnTk9UX1NVUFBPUlRFRCc7XG5cblxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlciB7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICB0eXBlICE6IFR5cGU8YW55PjtcbiAgaW5wdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBpbnB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHM6IHN0cmluZ1tdID0gW107XG4gIG91dHB1dHNSZW5hbWU6IHN0cmluZ1tdID0gW107XG4gIHByb3BlcnR5T3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgY2hlY2tQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuICBwcm9wZXJ0eU1hcDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gIGRpcmVjdGl2ZTogSURpcmVjdGl2ZXxudWxsID0gbnVsbDtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHRlbXBsYXRlICE6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPVxuICAgICAgICBuYW1lLnJlcGxhY2UoQ0FNRUxfQ0FTRSwgKGFsbDogc3RyaW5nLCBuZXh0OiBzdHJpbmcpID0+ICctJyArIG5leHQudG9Mb3dlckNhc2UoKSk7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBOb3RlOiBUaGVyZSBpcyBhIGJ1ZyBpbiBUUyAyLjQgdGhhdCBwcmV2ZW50cyB1cyBmcm9tXG4gICAgLy8gaW5saW5pbmcgdGhpcyBpbnRvIEBEaXJlY3RpdmVcbiAgICAvLyBUT0RPKHRib3NjaCk6IGZpbmQgb3IgZmlsZSBhIGJ1ZyBhZ2FpbnN0IFR5cGVTY3JpcHQgZm9yIHRoaXMuXG4gICAgY29uc3QgZGlyZWN0aXZlID0ge3NlbGVjdG9yOiBzZWxlY3RvciwgaW5wdXRzOiB0aGlzLmlucHV0c1JlbmFtZSwgb3V0cHV0czogdGhpcy5vdXRwdXRzUmVuYW1lfTtcblxuICAgIEBEaXJlY3RpdmUoe2ppdDogdHJ1ZSwgLi4uZGlyZWN0aXZlfSlcbiAgICBjbGFzcyBNeUNsYXNzIGV4dGVuZHMgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXIgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjayxcbiAgICAgICAgT25EZXN0cm95IHtcbiAgICAgIGNvbnN0cnVjdG9yKEBJbmplY3QoJFNDT1BFKSBzY29wZTogSVNjb3BlLCBpbmplY3RvcjogSW5qZWN0b3IsIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYpIHtcbiAgICAgICAgc3VwZXIoXG4gICAgICAgICAgICBuZXcgVXBncmFkZUhlbHBlcihpbmplY3RvciwgbmFtZSwgZWxlbWVudFJlZiwgc2VsZi5kaXJlY3RpdmUgfHwgdW5kZWZpbmVkKSwgc2NvcGUsXG4gICAgICAgICAgICBzZWxmLnRlbXBsYXRlLCBzZWxmLmlucHV0cywgc2VsZi5vdXRwdXRzLCBzZWxmLnByb3BlcnR5T3V0cHV0cywgc2VsZi5jaGVja1Byb3BlcnRpZXMsXG4gICAgICAgICAgICBzZWxmLnByb3BlcnR5TWFwKSBhcyBhbnk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudHlwZSA9IE15Q2xhc3M7XG4gIH1cblxuICBleHRyYWN0QmluZGluZ3MoKSB7XG4gICAgY29uc3QgYnRjSXNPYmplY3QgPSB0eXBlb2YgdGhpcy5kaXJlY3RpdmUgIS5iaW5kVG9Db250cm9sbGVyID09PSAnb2JqZWN0JztcbiAgICBpZiAoYnRjSXNPYmplY3QgJiYgT2JqZWN0LmtleXModGhpcy5kaXJlY3RpdmUgIS5zY29wZSAhKS5sZW5ndGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQmluZGluZyBkZWZpbml0aW9ucyBvbiBzY29wZSBhbmQgY29udHJvbGxlciBhdCB0aGUgc2FtZSB0aW1lIGFyZSBub3Qgc3VwcG9ydGVkLmApO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbnRleHQgPSAoYnRjSXNPYmplY3QpID8gdGhpcy5kaXJlY3RpdmUgIS5iaW5kVG9Db250cm9sbGVyIDogdGhpcy5kaXJlY3RpdmUgIS5zY29wZTtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dCA9PSAnb2JqZWN0Jykge1xuICAgICAgT2JqZWN0LmtleXMoY29udGV4dCkuZm9yRWFjaChwcm9wTmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IGRlZmluaXRpb24gPSBjb250ZXh0W3Byb3BOYW1lXTtcbiAgICAgICAgY29uc3QgYmluZGluZ1R5cGUgPSBkZWZpbml0aW9uLmNoYXJBdCgwKTtcbiAgICAgICAgY29uc3QgYmluZGluZ09wdGlvbnMgPSBkZWZpbml0aW9uLmNoYXJBdCgxKTtcbiAgICAgICAgY29uc3QgYXR0ck5hbWUgPSBkZWZpbml0aW9uLnN1YnN0cmluZyhiaW5kaW5nT3B0aW9ucyA9PT0gJz8nID8gMiA6IDEpIHx8IHByb3BOYW1lO1xuXG4gICAgICAgIC8vIFFVRVNUSU9OOiBXaGF0IGFib3V0IGA9KmA/IElnbm9yZT8gVGhyb3c/IFN1cHBvcnQ/XG5cbiAgICAgICAgY29uc3QgaW5wdXROYW1lID0gYGlucHV0XyR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3QgaW5wdXROYW1lUmVuYW1lID0gYCR7aW5wdXROYW1lfTogJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lID0gYG91dHB1dF8ke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWVSZW5hbWUgPSBgJHtvdXRwdXROYW1lfTogJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBvdXRwdXROYW1lUmVuYW1lQ2hhbmdlID0gYCR7b3V0cHV0TmFtZVJlbmFtZX1DaGFuZ2VgO1xuXG4gICAgICAgIHN3aXRjaCAoYmluZGluZ1R5cGUpIHtcbiAgICAgICAgICBjYXNlICdAJzpcbiAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzUmVuYW1lLnB1c2goaW5wdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbaW5wdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnPSc6XG4gICAgICAgICAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLmlucHV0c1JlbmFtZS5wdXNoKGlucHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW2lucHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLm91dHB1dHNSZW5hbWUucHVzaChvdXRwdXROYW1lUmVuYW1lQ2hhbmdlKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbb3V0cHV0TmFtZV0gPSBwcm9wTmFtZTtcblxuICAgICAgICAgICAgdGhpcy5jaGVja1Byb3BlcnRpZXMucHVzaChwcm9wTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5T3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnJic6XG4gICAgICAgICAgICB0aGlzLm91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0c1JlbmFtZS5wdXNoKG91dHB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtvdXRwdXROYW1lXSA9IHByb3BOYW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGxldCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY29udGV4dCk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYFVuZXhwZWN0ZWQgbWFwcGluZyAnJHtiaW5kaW5nVHlwZX0nIGluICcke2pzb259JyBpbiAnJHt0aGlzLm5hbWV9JyBkaXJlY3RpdmUuYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGdyYWRlIG5nMSBjb21wb25lbnRzIGludG8gQW5ndWxhci5cbiAgICovXG4gIHN0YXRpYyByZXNvbHZlKFxuICAgICAgZXhwb3J0ZWRDb21wb25lbnRzOiB7W25hbWU6IHN0cmluZ106IFVwZ3JhZGVOZzFDb21wb25lbnRBZGFwdGVyQnVpbGRlcn0sXG4gICAgICAkaW5qZWN0b3I6IElJbmplY3RvclNlcnZpY2UpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBPYmplY3Qua2V5cyhleHBvcnRlZENvbXBvbmVudHMpLm1hcChuYW1lID0+IHtcbiAgICAgIGNvbnN0IGV4cG9ydGVkQ29tcG9uZW50ID0gZXhwb3J0ZWRDb21wb25lbnRzW25hbWVdO1xuICAgICAgZXhwb3J0ZWRDb21wb25lbnQuZGlyZWN0aXZlID0gVXBncmFkZUhlbHBlci5nZXREaXJlY3RpdmUoJGluamVjdG9yLCBuYW1lKTtcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50LmV4dHJhY3RCaW5kaW5ncygpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAgIC5yZXNvbHZlKFVwZ3JhZGVIZWxwZXIuZ2V0VGVtcGxhdGUoJGluamVjdG9yLCBleHBvcnRlZENvbXBvbmVudC5kaXJlY3RpdmUsIHRydWUpKVxuICAgICAgICAgIC50aGVuKHRlbXBsYXRlID0+IGV4cG9ydGVkQ29tcG9uZW50LnRlbXBsYXRlID0gdGVtcGxhdGUpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgfVxufVxuXG5jbGFzcyBVcGdyYWRlTmcxQ29tcG9uZW50QWRhcHRlciBpbXBsZW1lbnRzIE9uSW5pdCwgT25DaGFuZ2VzLCBEb0NoZWNrIHtcbiAgcHJpdmF0ZSBjb250cm9sbGVySW5zdGFuY2U6IElDb250cm9sbGVySW5zdGFuY2V8bnVsbCA9IG51bGw7XG4gIGRlc3RpbmF0aW9uT2JqOiBJQmluZGluZ0Rlc3RpbmF0aW9ufG51bGwgPSBudWxsO1xuICBjaGVja0xhc3RWYWx1ZXM6IGFueVtdID0gW107XG4gIGRpcmVjdGl2ZTogSURpcmVjdGl2ZTtcbiAgZWxlbWVudDogRWxlbWVudDtcbiAgJGVsZW1lbnQ6IGFueSA9IG51bGw7XG4gIGNvbXBvbmVudFNjb3BlOiBJU2NvcGU7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGhlbHBlcjogVXBncmFkZUhlbHBlciwgc2NvcGU6IElTY29wZSwgcHJpdmF0ZSB0ZW1wbGF0ZTogc3RyaW5nLFxuICAgICAgcHJpdmF0ZSBpbnB1dHM6IHN0cmluZ1tdLCBwcml2YXRlIG91dHB1dHM6IHN0cmluZ1tdLCBwcml2YXRlIHByb3BPdXRzOiBzdHJpbmdbXSxcbiAgICAgIHByaXZhdGUgY2hlY2tQcm9wZXJ0aWVzOiBzdHJpbmdbXSwgcHJpdmF0ZSBwcm9wZXJ0eU1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHtcbiAgICB0aGlzLmRpcmVjdGl2ZSA9IGhlbHBlci5kaXJlY3RpdmU7XG4gICAgdGhpcy5lbGVtZW50ID0gaGVscGVyLmVsZW1lbnQ7XG4gICAgdGhpcy4kZWxlbWVudCA9IGhlbHBlci4kZWxlbWVudDtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlID0gc2NvcGUuJG5ldyghIXRoaXMuZGlyZWN0aXZlLnNjb3BlKTtcblxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcblxuICAgIGlmICh0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyICYmIGNvbnRyb2xsZXJUeXBlKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA9IHRoaXMuaGVscGVyLmJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgdGhpcy5jb21wb25lbnRTY29wZSk7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqID0gdGhpcy5jb250cm9sbGVySW5zdGFuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmogPSB0aGlzLmNvbXBvbmVudFNjb3BlO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAodGhpcyBhcyBhbnkpW2lucHV0c1tpXV0gPSBudWxsO1xuICAgIH1cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG91dHB1dHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IGVtaXR0ZXIgPSAodGhpcyBhcyBhbnkpW291dHB1dHNbal1dID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgICBpZiAodGhpcy5wcm9wT3V0cy5pbmRleE9mKG91dHB1dHNbal0pID09PSAtMSkge1xuICAgICAgICB0aGlzLnNldENvbXBvbmVudFByb3BlcnR5KFxuICAgICAgICAgICAgb3V0cHV0c1tqXSwgKGVtaXR0ZXIgPT4gKHZhbHVlOiBhbnkpID0+IGVtaXR0ZXIuZW1pdCh2YWx1ZSkpKGVtaXR0ZXIpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgayA9IDA7IGsgPCBwcm9wT3V0cy5sZW5ndGg7IGsrKykge1xuICAgICAgdGhpcy5jaGVja0xhc3RWYWx1ZXMucHVzaChJTklUSUFMX1ZBTFVFKTtcbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBDb2xsZWN0IGNvbnRlbnRzLCBpbnNlcnQgYW5kIGNvbXBpbGUgdGVtcGxhdGVcbiAgICBjb25zdCBhdHRhY2hDaGlsZE5vZGVzOiBJTGlua0ZufHVuZGVmaW5lZCA9IHRoaXMuaGVscGVyLnByZXBhcmVUcmFuc2NsdXNpb24oKTtcbiAgICBjb25zdCBsaW5rRm4gPSB0aGlzLmhlbHBlci5jb21waWxlVGVtcGxhdGUodGhpcy50ZW1wbGF0ZSk7XG5cbiAgICAvLyBJbnN0YW50aWF0ZSBjb250cm9sbGVyIChpZiBub3QgYWxyZWFkeSBkb25lIHNvKVxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcbiAgICBjb25zdCBiaW5kVG9Db250cm9sbGVyID0gdGhpcy5kaXJlY3RpdmUuYmluZFRvQ29udHJvbGxlcjtcbiAgICBpZiAoY29udHJvbGxlclR5cGUgJiYgIWJpbmRUb0NvbnRyb2xsZXIpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlID0gdGhpcy5oZWxwZXIuYnVpbGRDb250cm9sbGVyKGNvbnRyb2xsZXJUeXBlLCB0aGlzLmNvbXBvbmVudFNjb3BlKTtcbiAgICB9XG5cbiAgICAvLyBSZXF1aXJlIG90aGVyIGNvbnRyb2xsZXJzXG4gICAgY29uc3QgcmVxdWlyZWRDb250cm9sbGVycyA9XG4gICAgICAgIHRoaXMuaGVscGVyLnJlc29sdmVBbmRCaW5kUmVxdWlyZWRDb250cm9sbGVycyh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSk7XG5cbiAgICAvLyBIb29rOiAkb25Jbml0XG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCkpIHtcbiAgICAgIHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkluaXQoKTtcbiAgICB9XG5cbiAgICAvLyBMaW5raW5nXG4gICAgY29uc3QgbGluayA9IHRoaXMuZGlyZWN0aXZlLmxpbms7XG4gICAgY29uc3QgcHJlTGluayA9IHR5cGVvZiBsaW5rID09ICdvYmplY3QnICYmIGxpbmsucHJlO1xuICAgIGNvbnN0IHBvc3RMaW5rID0gdHlwZW9mIGxpbmsgPT0gJ29iamVjdCcgPyBsaW5rLnBvc3QgOiBsaW5rO1xuICAgIGNvbnN0IGF0dHJzOiBJQXR0cmlidXRlcyA9IE5PVF9TVVBQT1JURUQ7XG4gICAgY29uc3QgdHJhbnNjbHVkZUZuOiBJVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy5jb21wb25lbnRTY29wZSwgbnVsbCAhLCB7cGFyZW50Qm91bmRUcmFuc2NsdWRlRm46IGF0dGFjaENoaWxkTm9kZXN9KTtcblxuICAgIGlmIChwb3N0TGluaykge1xuICAgICAgcG9zdExpbmsodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJHBvc3RMaW5rXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IG5nMUNoYW5nZXM6IGFueSA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGNoYW5nZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBjb25zdCBjaGFuZ2U6IFNpbXBsZUNoYW5nZSA9IGNoYW5nZXNbbmFtZV07XG4gICAgICB0aGlzLnNldENvbXBvbmVudFByb3BlcnR5KG5hbWUsIGNoYW5nZS5jdXJyZW50VmFsdWUpO1xuICAgICAgbmcxQ2hhbmdlc1t0aGlzLnByb3BlcnR5TWFwW25hbWVdXSA9IGNoYW5nZTtcbiAgICB9KTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuZGVzdGluYXRpb25PYmogIS4kb25DaGFuZ2VzKSkge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiAhLiRvbkNoYW5nZXMgIShuZzFDaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3QgZGVzdGluYXRpb25PYmogPSB0aGlzLmRlc3RpbmF0aW9uT2JqO1xuICAgIGNvbnN0IGxhc3RWYWx1ZXMgPSB0aGlzLmNoZWNrTGFzdFZhbHVlcztcbiAgICBjb25zdCBjaGVja1Byb3BlcnRpZXMgPSB0aGlzLmNoZWNrUHJvcGVydGllcztcbiAgICBjb25zdCBwcm9wT3V0cyA9IHRoaXMucHJvcE91dHM7XG4gICAgY2hlY2tQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGRlc3RpbmF0aW9uT2JqICFbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgbGFzdCA9IGxhc3RWYWx1ZXNbaV07XG4gICAgICBpZiAoIXN0cmljdEVxdWFscyhsYXN0LCB2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbcHJvcE91dHNbaV1dO1xuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChsYXN0VmFsdWVzW2ldID0gdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2spKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkgeyB0aGlzLmhlbHBlci5vbkRlc3Ryb3kodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy5jb250cm9sbGVySW5zdGFuY2UpOyB9XG5cbiAgc2V0Q29tcG9uZW50UHJvcGVydHkobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5kZXN0aW5hdGlvbk9iaiAhW3RoaXMucHJvcGVydHlNYXBbbmFtZV1dID0gdmFsdWU7XG4gIH1cbn1cbiJdfQ==