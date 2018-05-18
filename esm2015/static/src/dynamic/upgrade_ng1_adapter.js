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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBncmFkZV9uZzFfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3VwZ3JhZGUvc3RhdGljL3NyYy9keW5hbWljL3VwZ3JhZGVfbmcxX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFXLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBdUQsTUFBTSxlQUFlLENBQUM7QUFFbkosT0FBTyxLQUFLLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDM0MsT0FBTyxFQUEyQyxhQUFhLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRyxPQUFPLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBR3hELHVCQUFNLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDOUIsdUJBQU0sYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUNGLHVCQUFNLGFBQWEsR0FBUSxlQUFlLENBQUM7QUFHM0MsTUFBTTs7OztJQVlKLFlBQW1CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO3NCQVZaLEVBQUU7NEJBQ0ksRUFBRTt1QkFDUCxFQUFFOzZCQUNJLEVBQUU7K0JBQ0EsRUFBRTsrQkFDRixFQUFFOzJCQUNVLEVBQUU7eUJBQ0wsSUFBSTtRQUl2Qyx1QkFBTSxRQUFRLEdBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFXLEVBQUUsSUFBWSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDdEYsdUJBQU0sSUFBSSxHQUFHLElBQUksQ0FBQzs7OztRQUtsQix1QkFBTSxTQUFTLEdBQUcsRUFB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QUU7WUFDM0UsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3BDO0tBQ0Y7Ozs7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUM3RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUM7U0FDdEM7UUFFRCxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ2hDOzs7Ozs7SUFFRCxvQkFBb0IsQ0FBQyxJQUFZLEVBQUUsS0FBVTsyQkFDM0MsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUs7S0FDdEQ7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtEaXJlY3RpdmUsIERvQ2hlY2ssIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0LCBJbmplY3RvciwgT25DaGFuZ2VzLCBPbkluaXQsIFNpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlcywgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi4vY29tbW9uL2FuZ3VsYXIxJztcbmltcG9ydCB7JFNDT1BFfSBmcm9tICcuLi9jb21tb24vY29uc3RhbnRzJztcbmltcG9ydCB7SUJpbmRpbmdEZXN0aW5hdGlvbiwgSUNvbnRyb2xsZXJJbnN0YW5jZSwgVXBncmFkZUhlbHBlcn0gZnJvbSAnLi4vY29tbW9uL3VwZ3JhZGVfaGVscGVyJztcbmltcG9ydCB7aXNGdW5jdGlvbiwgc3RyaWN0RXF1YWxzfSBmcm9tICcuLi9jb21tb24vdXRpbCc7XG5cblxuY29uc3QgQ0FNRUxfQ0FTRSA9IC8oW0EtWl0pL2c7XG5jb25zdCBJTklUSUFMX1ZBTFVFID0ge1xuICBfX1VOSU5JVElBTElaRURfXzogdHJ1ZVxufTtcbmNvbnN0IE5PVF9TVVBQT1JURUQ6IGFueSA9ICdOT1RfU1VQUE9SVEVEJztcblxuXG5leHBvcnQgY2xhc3MgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyIHtcbiAgdHlwZTogVHlwZTxhbnk+O1xuICBpbnB1dHM6IHN0cmluZ1tdID0gW107XG4gIGlucHV0c1JlbmFtZTogc3RyaW5nW10gPSBbXTtcbiAgb3V0cHV0czogc3RyaW5nW10gPSBbXTtcbiAgb3V0cHV0c1JlbmFtZTogc3RyaW5nW10gPSBbXTtcbiAgcHJvcGVydHlPdXRwdXRzOiBzdHJpbmdbXSA9IFtdO1xuICBjaGVja1Byb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG4gIHByb3BlcnR5TWFwOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgZGlyZWN0aXZlOiBhbmd1bGFyLklEaXJlY3RpdmV8bnVsbCA9IG51bGw7XG4gIHRlbXBsYXRlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IHNlbGVjdG9yID1cbiAgICAgICAgbmFtZS5yZXBsYWNlKENBTUVMX0NBU0UsIChhbGw6IHN0cmluZywgbmV4dDogc3RyaW5nKSA9PiAnLScgKyBuZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gTm90ZTogVGhlcmUgaXMgYSBidWcgaW4gVFMgMi40IHRoYXQgcHJldmVudHMgdXMgZnJvbVxuICAgIC8vIGlubGluaW5nIHRoaXMgaW50byBARGlyZWN0aXZlXG4gICAgLy8gVE9ETyh0Ym9zY2gpOiBmaW5kIG9yIGZpbGUgYSBidWcgYWdhaW5zdCBUeXBlU2NyaXB0IGZvciB0aGlzLlxuICAgIGNvbnN0IGRpcmVjdGl2ZSA9IHtzZWxlY3Rvcjogc2VsZWN0b3IsIGlucHV0czogdGhpcy5pbnB1dHNSZW5hbWUsIG91dHB1dHM6IHRoaXMub3V0cHV0c1JlbmFtZX07XG5cbiAgICBARGlyZWN0aXZlKGRpcmVjdGl2ZSlcbiAgICBjbGFzcyBNeUNsYXNzIHtcbiAgICAgIGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlO1xuICAgICAgY29uc3RydWN0b3IoXG4gICAgICAgICAgQEluamVjdCgkU0NPUEUpIHNjb3BlOiBhbmd1bGFyLklTY29wZSwgaW5qZWN0b3I6IEluamVjdG9yLCBlbGVtZW50UmVmOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIGNvbnN0IGhlbHBlciA9IG5ldyBVcGdyYWRlSGVscGVyKGluamVjdG9yLCBuYW1lLCBlbGVtZW50UmVmLCB0aGlzLmRpcmVjdGl2ZSk7XG4gICAgICAgIHJldHVybiBuZXcgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXIoXG4gICAgICAgICAgICBoZWxwZXIsIHNjb3BlLCBzZWxmLnRlbXBsYXRlLCBzZWxmLmlucHV0cywgc2VsZi5vdXRwdXRzLCBzZWxmLnByb3BlcnR5T3V0cHV0cyxcbiAgICAgICAgICAgIHNlbGYuY2hlY2tQcm9wZXJ0aWVzLCBzZWxmLnByb3BlcnR5TWFwKSBhcyBhbnk7XG4gICAgICB9XG4gICAgICBuZ09uSW5pdCgpIHsgLyogbmVlZHMgdG8gYmUgaGVyZSBmb3IgbmcyIHRvIHByb3Blcmx5IGRldGVjdCBpdCAqL1xuICAgICAgfVxuICAgICAgbmdPbkNoYW5nZXMoKSB7IC8qIG5lZWRzIHRvIGJlIGhlcmUgZm9yIG5nMiB0byBwcm9wZXJseSBkZXRlY3QgaXQgKi9cbiAgICAgIH1cbiAgICAgIG5nRG9DaGVjaygpIHsgLyogbmVlZHMgdG8gYmUgaGVyZSBmb3IgbmcyIHRvIHByb3Blcmx5IGRldGVjdCBpdCAqL1xuICAgICAgfVxuICAgICAgbmdPbkRlc3Ryb3koKSB7IC8qIG5lZWRzIHRvIGJlIGhlcmUgZm9yIG5nMiB0byBwcm9wZXJseSBkZXRlY3QgaXQgKi9cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50eXBlID0gTXlDbGFzcztcbiAgfVxuXG4gIGV4dHJhY3RCaW5kaW5ncygpIHtcbiAgICBjb25zdCBidGNJc09iamVjdCA9IHR5cGVvZiB0aGlzLmRpcmVjdGl2ZSAhLmJpbmRUb0NvbnRyb2xsZXIgPT09ICdvYmplY3QnO1xuICAgIGlmIChidGNJc09iamVjdCAmJiBPYmplY3Qua2V5cyh0aGlzLmRpcmVjdGl2ZSAhLnNjb3BlICEpLmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBCaW5kaW5nIGRlZmluaXRpb25zIG9uIHNjb3BlIGFuZCBjb250cm9sbGVyIGF0IHRoZSBzYW1lIHRpbWUgYXJlIG5vdCBzdXBwb3J0ZWQuYCk7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGV4dCA9IChidGNJc09iamVjdCkgPyB0aGlzLmRpcmVjdGl2ZSAhLmJpbmRUb0NvbnRyb2xsZXIgOiB0aGlzLmRpcmVjdGl2ZSAhLnNjb3BlO1xuXG4gICAgaWYgKHR5cGVvZiBjb250ZXh0ID09ICdvYmplY3QnKSB7XG4gICAgICBPYmplY3Qua2V5cyhjb250ZXh0KS5mb3JFYWNoKHByb3BOYW1lID0+IHtcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGNvbnRleHRbcHJvcE5hbWVdO1xuICAgICAgICBjb25zdCBiaW5kaW5nVHlwZSA9IGRlZmluaXRpb24uY2hhckF0KDApO1xuICAgICAgICBjb25zdCBiaW5kaW5nT3B0aW9ucyA9IGRlZmluaXRpb24uY2hhckF0KDEpO1xuICAgICAgICBjb25zdCBhdHRyTmFtZSA9IGRlZmluaXRpb24uc3Vic3RyaW5nKGJpbmRpbmdPcHRpb25zID09PSAnPycgPyAyIDogMSkgfHwgcHJvcE5hbWU7XG5cbiAgICAgICAgLy8gUVVFU1RJT046IFdoYXQgYWJvdXQgYD0qYD8gSWdub3JlPyBUaHJvdz8gU3VwcG9ydD9cblxuICAgICAgICBjb25zdCBpbnB1dE5hbWUgPSBgaW5wdXRfJHthdHRyTmFtZX1gO1xuICAgICAgICBjb25zdCBpbnB1dE5hbWVSZW5hbWUgPSBgJHtpbnB1dE5hbWV9OiAke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWUgPSBgb3V0cHV0XyR7YXR0ck5hbWV9YDtcbiAgICAgICAgY29uc3Qgb3V0cHV0TmFtZVJlbmFtZSA9IGAke291dHB1dE5hbWV9OiAke2F0dHJOYW1lfWA7XG4gICAgICAgIGNvbnN0IG91dHB1dE5hbWVSZW5hbWVDaGFuZ2UgPSBgJHtvdXRwdXROYW1lUmVuYW1lfUNoYW5nZWA7XG5cbiAgICAgICAgc3dpdGNoIChiaW5kaW5nVHlwZSkge1xuICAgICAgICAgIGNhc2UgJ0AnOlxuICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgdGhpcy5pbnB1dHMucHVzaChpbnB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dHNSZW5hbWUucHVzaChpbnB1dE5hbWVSZW5hbWUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtpbnB1dE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICc9JzpcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzLnB1c2goaW5wdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXRzUmVuYW1lLnB1c2goaW5wdXROYW1lUmVuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlNYXBbaW5wdXROYW1lXSA9IHByb3BOYW1lO1xuXG4gICAgICAgICAgICB0aGlzLm91dHB1dHMucHVzaChvdXRwdXROYW1lKTtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0c1JlbmFtZS5wdXNoKG91dHB1dE5hbWVSZW5hbWVDaGFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5wcm9wZXJ0eU1hcFtvdXRwdXROYW1lXSA9IHByb3BOYW1lO1xuXG4gICAgICAgICAgICB0aGlzLmNoZWNrUHJvcGVydGllcy5wdXNoKHByb3BOYW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJvcGVydHlPdXRwdXRzLnB1c2gob3V0cHV0TmFtZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICcmJzpcbiAgICAgICAgICAgIHRoaXMub3V0cHV0cy5wdXNoKG91dHB1dE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5vdXRwdXRzUmVuYW1lLnB1c2gob3V0cHV0TmFtZVJlbmFtZSk7XG4gICAgICAgICAgICB0aGlzLnByb3BlcnR5TWFwW291dHB1dE5hbWVdID0gcHJvcE5hbWU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbGV0IGpzb24gPSBKU09OLnN0cmluZ2lmeShjb250ZXh0KTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgVW5leHBlY3RlZCBtYXBwaW5nICcke2JpbmRpbmdUeXBlfScgaW4gJyR7anNvbn0nIGluICcke3RoaXMubmFtZX0nIGRpcmVjdGl2ZS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFVwZ3JhZGUgbmcxIGNvbXBvbmVudHMgaW50byBBbmd1bGFyLlxuICAgKi9cbiAgc3RhdGljIHJlc29sdmUoXG4gICAgICBleHBvcnRlZENvbXBvbmVudHM6IHtbbmFtZTogc3RyaW5nXTogVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXJCdWlsZGVyfSxcbiAgICAgICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIGNvbnN0IHByb21pc2VzID0gT2JqZWN0LmtleXMoZXhwb3J0ZWRDb21wb25lbnRzKS5tYXAobmFtZSA9PiB7XG4gICAgICBjb25zdCBleHBvcnRlZENvbXBvbmVudCA9IGV4cG9ydGVkQ29tcG9uZW50c1tuYW1lXTtcbiAgICAgIGV4cG9ydGVkQ29tcG9uZW50LmRpcmVjdGl2ZSA9IFVwZ3JhZGVIZWxwZXIuZ2V0RGlyZWN0aXZlKCRpbmplY3RvciwgbmFtZSk7XG4gICAgICBleHBvcnRlZENvbXBvbmVudC5leHRyYWN0QmluZGluZ3MoKTtcblxuICAgICAgcmV0dXJuIFByb21pc2VcbiAgICAgICAgICAucmVzb2x2ZShVcGdyYWRlSGVscGVyLmdldFRlbXBsYXRlKCRpbmplY3RvciwgZXhwb3J0ZWRDb21wb25lbnQuZGlyZWN0aXZlLCB0cnVlKSlcbiAgICAgICAgICAudGhlbih0ZW1wbGF0ZSA9PiBleHBvcnRlZENvbXBvbmVudC50ZW1wbGF0ZSA9IHRlbXBsYXRlKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gIH1cbn1cblxuY2xhc3MgVXBncmFkZU5nMUNvbXBvbmVudEFkYXB0ZXIgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgRG9DaGVjayB7XG4gIHByaXZhdGUgY29udHJvbGxlckluc3RhbmNlOiBJQ29udHJvbGxlckluc3RhbmNlfG51bGwgPSBudWxsO1xuICBkZXN0aW5hdGlvbk9iajogSUJpbmRpbmdEZXN0aW5hdGlvbnxudWxsID0gbnVsbDtcbiAgY2hlY2tMYXN0VmFsdWVzOiBhbnlbXSA9IFtdO1xuICBwcml2YXRlIGRpcmVjdGl2ZTogYW5ndWxhci5JRGlyZWN0aXZlO1xuICBlbGVtZW50OiBFbGVtZW50O1xuICAkZWxlbWVudDogYW55ID0gbnVsbDtcbiAgY29tcG9uZW50U2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBoZWxwZXI6IFVwZ3JhZGVIZWxwZXIsIHNjb3BlOiBhbmd1bGFyLklTY29wZSwgcHJpdmF0ZSB0ZW1wbGF0ZTogc3RyaW5nLFxuICAgICAgcHJpdmF0ZSBpbnB1dHM6IHN0cmluZ1tdLCBwcml2YXRlIG91dHB1dHM6IHN0cmluZ1tdLCBwcml2YXRlIHByb3BPdXRzOiBzdHJpbmdbXSxcbiAgICAgIHByaXZhdGUgY2hlY2tQcm9wZXJ0aWVzOiBzdHJpbmdbXSwgcHJpdmF0ZSBwcm9wZXJ0eU1hcDoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHtcbiAgICB0aGlzLmRpcmVjdGl2ZSA9IGhlbHBlci5kaXJlY3RpdmU7XG4gICAgdGhpcy5lbGVtZW50ID0gaGVscGVyLmVsZW1lbnQ7XG4gICAgdGhpcy4kZWxlbWVudCA9IGhlbHBlci4kZWxlbWVudDtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlID0gc2NvcGUuJG5ldyghIXRoaXMuZGlyZWN0aXZlLnNjb3BlKTtcblxuICAgIGNvbnN0IGNvbnRyb2xsZXJUeXBlID0gdGhpcy5kaXJlY3RpdmUuY29udHJvbGxlcjtcblxuICAgIGlmICh0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyICYmIGNvbnRyb2xsZXJUeXBlKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSA9IHRoaXMuaGVscGVyLmJ1aWxkQ29udHJvbGxlcihjb250cm9sbGVyVHlwZSwgdGhpcy5jb21wb25lbnRTY29wZSk7XG4gICAgICB0aGlzLmRlc3RpbmF0aW9uT2JqID0gdGhpcy5jb250cm9sbGVySW5zdGFuY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVzdGluYXRpb25PYmogPSB0aGlzLmNvbXBvbmVudFNjb3BlO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAodGhpcyBhcyBhbnkpW2lucHV0c1tpXV0gPSBudWxsO1xuICAgIH1cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG91dHB1dHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IGVtaXR0ZXIgPSAodGhpcyBhcyBhbnkpW291dHB1dHNbal1dID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gICAgICBpZiAodGhpcy5wcm9wT3V0cy5pbmRleE9mKG91dHB1dHNbal0pID09PSAtMSkge1xuICAgICAgICB0aGlzLnNldENvbXBvbmVudFByb3BlcnR5KFxuICAgICAgICAgICAgb3V0cHV0c1tqXSwgKGVtaXR0ZXIgPT4gKHZhbHVlOiBhbnkpID0+IGVtaXR0ZXIuZW1pdCh2YWx1ZSkpKGVtaXR0ZXIpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChsZXQgayA9IDA7IGsgPCBwcm9wT3V0cy5sZW5ndGg7IGsrKykge1xuICAgICAgdGhpcy5jaGVja0xhc3RWYWx1ZXMucHVzaChJTklUSUFMX1ZBTFVFKTtcbiAgICB9XG4gIH1cblxuICBuZ09uSW5pdCgpIHtcbiAgICAvLyBDb2xsZWN0IGNvbnRlbnRzLCBpbnNlcnQgYW5kIGNvbXBpbGUgdGVtcGxhdGVcbiAgICBjb25zdCBhdHRhY2hDaGlsZE5vZGVzOiBhbmd1bGFyLklMaW5rRm58dW5kZWZpbmVkID0gdGhpcy5oZWxwZXIucHJlcGFyZVRyYW5zY2x1c2lvbigpO1xuICAgIGNvbnN0IGxpbmtGbiA9IHRoaXMuaGVscGVyLmNvbXBpbGVUZW1wbGF0ZSh0aGlzLnRlbXBsYXRlKTtcblxuICAgIC8vIEluc3RhbnRpYXRlIGNvbnRyb2xsZXIgKGlmIG5vdCBhbHJlYWR5IGRvbmUgc28pXG4gICAgY29uc3QgY29udHJvbGxlclR5cGUgPSB0aGlzLmRpcmVjdGl2ZS5jb250cm9sbGVyO1xuICAgIGNvbnN0IGJpbmRUb0NvbnRyb2xsZXIgPSB0aGlzLmRpcmVjdGl2ZS5iaW5kVG9Db250cm9sbGVyO1xuICAgIGlmIChjb250cm9sbGVyVHlwZSAmJiAhYmluZFRvQ29udHJvbGxlcikge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UgPSB0aGlzLmhlbHBlci5idWlsZENvbnRyb2xsZXIoY29udHJvbGxlclR5cGUsIHRoaXMuY29tcG9uZW50U2NvcGUpO1xuICAgIH1cblxuICAgIC8vIFJlcXVpcmUgb3RoZXIgY29udHJvbGxlcnNcbiAgICBjb25zdCByZXF1aXJlZENvbnRyb2xsZXJzID1cbiAgICAgICAgdGhpcy5oZWxwZXIucmVzb2x2ZUFuZEJpbmRSZXF1aXJlZENvbnRyb2xsZXJzKHRoaXMuY29udHJvbGxlckluc3RhbmNlKTtcblxuICAgIC8vIEhvb2s6ICRvbkluaXRcbiAgICBpZiAodGhpcy5jb250cm9sbGVySW5zdGFuY2UgJiYgaXNGdW5jdGlvbih0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25Jbml0KSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJG9uSW5pdCgpO1xuICAgIH1cblxuICAgIC8vIExpbmtpbmdcbiAgICBjb25zdCBsaW5rID0gdGhpcy5kaXJlY3RpdmUubGluaztcbiAgICBjb25zdCBwcmVMaW5rID0gKHR5cGVvZiBsaW5rID09ICdvYmplY3QnKSAmJiAobGluayBhcyBhbmd1bGFyLklEaXJlY3RpdmVQcmVQb3N0KS5wcmU7XG4gICAgY29uc3QgcG9zdExpbmsgPSAodHlwZW9mIGxpbmsgPT0gJ29iamVjdCcpID8gKGxpbmsgYXMgYW5ndWxhci5JRGlyZWN0aXZlUHJlUG9zdCkucG9zdCA6IGxpbms7XG4gICAgY29uc3QgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMgPSBOT1RfU1VQUE9SVEVEO1xuICAgIGNvbnN0IHRyYW5zY2x1ZGVGbjogYW5ndWxhci5JVHJhbnNjbHVkZUZ1bmN0aW9uID0gTk9UX1NVUFBPUlRFRDtcbiAgICBpZiAocHJlTGluaykge1xuICAgICAgcHJlTGluayh0aGlzLmNvbXBvbmVudFNjb3BlLCB0aGlzLiRlbGVtZW50LCBhdHRycywgcmVxdWlyZWRDb250cm9sbGVycywgdHJhbnNjbHVkZUZuKTtcbiAgICB9XG5cbiAgICBsaW5rRm4odGhpcy5jb21wb25lbnRTY29wZSwgbnVsbCAhLCB7cGFyZW50Qm91bmRUcmFuc2NsdWRlRm46IGF0dGFjaENoaWxkTm9kZXN9KTtcblxuICAgIGlmIChwb3N0TGluaykge1xuICAgICAgcG9zdExpbmsodGhpcy5jb21wb25lbnRTY29wZSwgdGhpcy4kZWxlbWVudCwgYXR0cnMsIHJlcXVpcmVkQ29udHJvbGxlcnMsIHRyYW5zY2x1ZGVGbik7XG4gICAgfVxuXG4gICAgLy8gSG9vazogJHBvc3RMaW5rXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKSkge1xuICAgICAgdGhpcy5jb250cm9sbGVySW5zdGFuY2UuJHBvc3RMaW5rKCk7XG4gICAgfVxuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IG5nMUNoYW5nZXM6IGFueSA9IHt9O1xuICAgIE9iamVjdC5rZXlzKGNoYW5nZXMpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICBjb25zdCBjaGFuZ2U6IFNpbXBsZUNoYW5nZSA9IGNoYW5nZXNbbmFtZV07XG4gICAgICB0aGlzLnNldENvbXBvbmVudFByb3BlcnR5KG5hbWUsIGNoYW5nZS5jdXJyZW50VmFsdWUpO1xuICAgICAgbmcxQ2hhbmdlc1t0aGlzLnByb3BlcnR5TWFwW25hbWVdXSA9IGNoYW5nZTtcbiAgICB9KTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHRoaXMuZGVzdGluYXRpb25PYmogIS4kb25DaGFuZ2VzKSkge1xuICAgICAgdGhpcy5kZXN0aW5hdGlvbk9iaiAhLiRvbkNoYW5nZXMgIShuZzFDaGFuZ2VzKTtcbiAgICB9XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7XG4gICAgY29uc3QgZGVzdGluYXRpb25PYmogPSB0aGlzLmRlc3RpbmF0aW9uT2JqO1xuICAgIGNvbnN0IGxhc3RWYWx1ZXMgPSB0aGlzLmNoZWNrTGFzdFZhbHVlcztcbiAgICBjb25zdCBjaGVja1Byb3BlcnRpZXMgPSB0aGlzLmNoZWNrUHJvcGVydGllcztcbiAgICBjb25zdCBwcm9wT3V0cyA9IHRoaXMucHJvcE91dHM7XG4gICAgY2hlY2tQcm9wZXJ0aWVzLmZvckVhY2goKHByb3BOYW1lLCBpKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGRlc3RpbmF0aW9uT2JqICFbcHJvcE5hbWVdO1xuICAgICAgY29uc3QgbGFzdCA9IGxhc3RWYWx1ZXNbaV07XG4gICAgICBpZiAoIXN0cmljdEVxdWFscyhsYXN0LCB2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgZXZlbnRFbWl0dGVyOiBFdmVudEVtaXR0ZXI8YW55PiA9ICh0aGlzIGFzIGFueSlbcHJvcE91dHNbaV1dO1xuICAgICAgICBldmVudEVtaXR0ZXIuZW1pdChsYXN0VmFsdWVzW2ldID0gdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuY29udHJvbGxlckluc3RhbmNlICYmIGlzRnVuY3Rpb24odGhpcy5jb250cm9sbGVySW5zdGFuY2UuJGRvQ2hlY2spKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kZG9DaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZSAmJiBpc0Z1bmN0aW9uKHRoaXMuY29udHJvbGxlckluc3RhbmNlLiRvbkRlc3Ryb3kpKSB7XG4gICAgICB0aGlzLmNvbnRyb2xsZXJJbnN0YW5jZS4kb25EZXN0cm95KCk7XG4gICAgfVxuXG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kZGVzdHJveSgpO1xuICB9XG5cbiAgc2V0Q29tcG9uZW50UHJvcGVydHkobmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5kZXN0aW5hdGlvbk9iaiAhW3RoaXMucHJvcGVydHlNYXBbbmFtZV1dID0gdmFsdWU7XG4gIH1cbn1cbiJdfQ==