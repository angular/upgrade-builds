/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ApplicationRef, ChangeDetectorRef, Injector, SimpleChange, Testability, TestabilityRegistry } from '@angular/core';
import { PropertyBinding } from './component_info';
import { $SCOPE } from './constants';
import { getTypeName, hookupNgModel, strictEquals } from './util';
var INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var DowngradeComponentAdapter = /** @class */ (function () {
    function DowngradeComponentAdapter(element, attrs, scope, ngModel, parentInjector, $injector, $compile, $parse, componentFactory, wrapCallback) {
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.ngModel = ngModel;
        this.parentInjector = parentInjector;
        this.$injector = $injector;
        this.$compile = $compile;
        this.$parse = $parse;
        this.componentFactory = componentFactory;
        this.wrapCallback = wrapCallback;
        this.implementsOnChanges = false;
        this.inputChangeCount = 0;
        this.inputChanges = {};
        this.componentScope = scope.$new();
    }
    DowngradeComponentAdapter.prototype.compileContents = function () {
        var _this = this;
        var compiledProjectableNodes = [];
        var projectableNodes = this.groupProjectableNodes();
        var linkFns = projectableNodes.map(function (nodes) { return _this.$compile(nodes); });
        this.element.empty();
        linkFns.forEach(function (linkFn) {
            linkFn(_this.scope, function (clone) {
                compiledProjectableNodes.push(clone);
                _this.element.append(clone);
            });
        });
        return compiledProjectableNodes;
    };
    DowngradeComponentAdapter.prototype.createComponent = function (projectableNodes) {
        var providers = [{ provide: $SCOPE, useValue: this.componentScope }];
        var childInjector = Injector.create({ providers: providers, parent: this.parentInjector, name: 'DowngradeComponentAdapter' });
        this.componentRef =
            this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        this.viewChangeDetector = this.componentRef.injector.get(ChangeDetectorRef);
        this.changeDetector = this.componentRef.changeDetectorRef;
        this.component = this.componentRef.instance;
        // testability hook is commonly added during component bootstrap in
        // packages/core/src/application_ref.bootstrap()
        // in downgraded application, component creation will take place here as well as adding the
        // testability hook.
        var testability = this.componentRef.injector.get(Testability, null);
        if (testability) {
            this.componentRef.injector.get(TestabilityRegistry)
                .registerApplication(this.componentRef.location.nativeElement, testability);
        }
        hookupNgModel(this.ngModel, this.component);
    };
    DowngradeComponentAdapter.prototype.setupInputs = function (manuallyAttachView, propagateDigest) {
        var _this = this;
        if (propagateDigest === void 0) { propagateDigest = true; }
        var attrs = this.attrs;
        var inputs = this.componentFactory.inputs || [];
        var _loop_1 = function (i) {
            var input = new PropertyBinding(inputs[i].propName, inputs[i].templateName);
            var expr = null;
            if (attrs.hasOwnProperty(input.attr)) {
                var observeFn_1 = (function (prop) {
                    var prevValue = INITIAL_VALUE;
                    return function (currValue) {
                        // Initially, both `$observe()` and `$watch()` will call this function.
                        if (!strictEquals(prevValue, currValue)) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            _this.updateInput(prop, prevValue, currValue);
                            prevValue = currValue;
                        }
                    };
                })(input.prop);
                attrs.$observe(input.attr, observeFn_1);
                // Use `$watch()` (in addition to `$observe()`) in order to initialize the input in time
                // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
                // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
                var unwatch_1 = this_1.componentScope.$watch(function () {
                    unwatch_1();
                    unwatch_1 = null;
                    observeFn_1(attrs[input.attr]);
                });
            }
            else if (attrs.hasOwnProperty(input.bindAttr)) {
                expr = attrs[input.bindAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketAttr)) {
                expr = attrs[input.bracketAttr];
            }
            else if (attrs.hasOwnProperty(input.bindonAttr)) {
                expr = attrs[input.bindonAttr];
            }
            else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
                expr = attrs[input.bracketParenAttr];
            }
            if (expr != null) {
                var watchFn = (function (prop) { return function (currValue, prevValue) {
                    return _this.updateInput(prop, prevValue, currValue);
                }; })(input.prop);
                this_1.componentScope.$watch(expr, watchFn);
            }
        };
        var this_1 = this;
        for (var i = 0; i < inputs.length; i++) {
            _loop_1(i);
        }
        // Invoke `ngOnChanges()` and Change Detection (when necessary)
        var detectChanges = function () { return _this.changeDetector.detectChanges(); };
        var prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && prototype.ngOnChanges);
        this.componentScope.$watch(function () { return _this.inputChangeCount; }, this.wrapCallback(function () {
            // Invoke `ngOnChanges()`
            if (_this.implementsOnChanges) {
                var inputChanges = _this.inputChanges;
                _this.inputChanges = {};
                _this.component.ngOnChanges(inputChanges);
            }
            _this.viewChangeDetector.markForCheck();
            // If opted out of propagating digests, invoke change detection when inputs change.
            if (!propagateDigest) {
                detectChanges();
            }
        }));
        // If not opted out of propagating digests, invoke change detection on every digest
        if (propagateDigest) {
            this.componentScope.$watch(this.wrapCallback(detectChanges));
        }
        // If necessary, attach the view so that it will be dirty-checked.
        // (Allow time for the initial input values to be set and `ngOnChanges()` to be called.)
        if (manuallyAttachView || !propagateDigest) {
            var unwatch_2 = this.componentScope.$watch(function () {
                unwatch_2();
                unwatch_2 = null;
                var appRef = _this.parentInjector.get(ApplicationRef);
                appRef.attachView(_this.componentRef.hostView);
            });
        }
    };
    DowngradeComponentAdapter.prototype.setupOutputs = function () {
        var attrs = this.attrs;
        var outputs = this.componentFactory.outputs || [];
        for (var j = 0; j < outputs.length; j++) {
            var output = new PropertyBinding(outputs[j].propName, outputs[j].templateName);
            var bindonAttr = output.bindonAttr.substring(0, output.bindonAttr.length - 6);
            var bracketParenAttr = "[(" + output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8) + ")]";
            // order below is important - first update bindings then evaluate expressions
            if (attrs.hasOwnProperty(bindonAttr)) {
                this.subscribeToOutput(output, attrs[bindonAttr], true);
            }
            if (attrs.hasOwnProperty(bracketParenAttr)) {
                this.subscribeToOutput(output, attrs[bracketParenAttr], true);
            }
            if (attrs.hasOwnProperty(output.onAttr)) {
                this.subscribeToOutput(output, attrs[output.onAttr]);
            }
            if (attrs.hasOwnProperty(output.parenAttr)) {
                this.subscribeToOutput(output, attrs[output.parenAttr]);
            }
        }
    };
    DowngradeComponentAdapter.prototype.subscribeToOutput = function (output, expr, isAssignment) {
        var _this = this;
        if (isAssignment === void 0) { isAssignment = false; }
        var getter = this.$parse(expr);
        var setter = getter.assign;
        if (isAssignment && !setter) {
            throw new Error("Expression '" + expr + "' is not assignable!");
        }
        var emitter = this.component[output.prop];
        if (emitter) {
            emitter.subscribe({
                next: isAssignment ? function (v) { return setter(_this.scope, v); } :
                    function (v) { return getter(_this.scope, { '$event': v }); }
            });
        }
        else {
            throw new Error("Missing emitter '" + output.prop + "' on component '" + getTypeName(this.componentFactory.componentType) + "'!");
        }
    };
    DowngradeComponentAdapter.prototype.registerCleanup = function () {
        var _this = this;
        var destroyComponentRef = this.wrapCallback(function () { return _this.componentRef.destroy(); });
        var destroyed = false;
        this.element.on('$destroy', function () { return _this.componentScope.$destroy(); });
        this.componentScope.$on('$destroy', function () {
            if (!destroyed) {
                destroyed = true;
                _this.componentRef.injector.get(TestabilityRegistry)
                    .unregisterApplication(_this.componentRef.location.nativeElement);
                destroyComponentRef();
            }
        });
    };
    DowngradeComponentAdapter.prototype.getInjector = function () { return this.componentRef.injector; };
    DowngradeComponentAdapter.prototype.updateInput = function (prop, prevValue, currValue) {
        if (this.implementsOnChanges) {
            this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
        }
        this.inputChangeCount++;
        this.component[prop] = currValue;
    };
    DowngradeComponentAdapter.prototype.groupProjectableNodes = function () {
        var ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, this.element.contents());
    };
    return DowngradeComponentAdapter;
}());
export { DowngradeComponentAdapter };
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 */
export function groupNodesBySelector(ngContentSelectors, nodes) {
    var projectableNodes = [];
    var wildcardNgContentIndex;
    for (var i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
        projectableNodes[i] = [];
    }
    for (var j = 0, jj = nodes.length; j < jj; ++j) {
        var node = nodes[j];
        var ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
        if (ngContentIndex != null) {
            projectableNodes[ngContentIndex].push(node);
        }
    }
    return projectableNodes;
}
function findMatchingNgContentIndex(element, ngContentSelectors) {
    var ngContentIndices = [];
    var wildcardNgContentIndex = -1;
    for (var i = 0; i < ngContentSelectors.length; i++) {
        var selector = ngContentSelectors[i];
        if (selector === '*') {
            wildcardNgContentIndex = i;
        }
        else {
            if (matchesSelector(element, selector)) {
                ngContentIndices.push(i);
            }
        }
    }
    ngContentIndices.sort();
    if (wildcardNgContentIndex !== -1) {
        ngContentIndices.push(wildcardNgContentIndex);
    }
    return ngContentIndices.length ? ngContentIndices[0] : null;
}
var _matches;
function matchesSelector(el, selector) {
    if (!_matches) {
        var elProto = Element.prototype;
        _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
            elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
    }
    return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFFLGlCQUFpQixFQUFnRCxRQUFRLEVBQWEsWUFBWSxFQUFpQyxXQUFXLEVBQUUsbUJBQW1CLEVBQU8sTUFBTSxlQUFlLENBQUM7QUFHeE4sT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDbkMsT0FBTyxFQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRWhFLElBQU0sYUFBYSxHQUFHO0lBQ3BCLGlCQUFpQixFQUFFLElBQUk7Q0FDeEIsQ0FBQztBQUVGO0lBYUUsbUNBQ1ksT0FBaUMsRUFBVSxLQUEwQixFQUNyRSxLQUFxQixFQUFVLE9BQW1DLEVBQ2xFLGNBQXdCLEVBQVUsU0FBbUMsRUFDckUsUUFBaUMsRUFBVSxNQUE2QixFQUN4RSxnQkFBdUMsRUFDdkMsWUFBeUM7UUFMekMsWUFBTyxHQUFQLE9BQU8sQ0FBMEI7UUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFxQjtRQUNyRSxVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQTRCO1FBQ2xFLG1CQUFjLEdBQWQsY0FBYyxDQUFVO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBMEI7UUFDckUsYUFBUSxHQUFSLFFBQVEsQ0FBeUI7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUF1QjtRQUN4RSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXVCO1FBQ3ZDLGlCQUFZLEdBQVosWUFBWSxD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L0UsT0FBTyxDQUFDLGlCQUFpQixJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsSUFBSSxPQUFPLENBQUMscUJBQXFCLENBQUM7S0FDNUY7SUFDRCxPQUFPLEVBQUUsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNqRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FwcGxpY2F0aW9uUmVmLCBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50RmFjdG9yeSwgQ29tcG9uZW50UmVmLCBFdmVudEVtaXR0ZXIsIEluamVjdG9yLCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZSwgU2ltcGxlQ2hhbmdlcywgU3RhdGljUHJvdmlkZXIsIFRlc3RhYmlsaXR5LCBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBUeXBlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0ICogYXMgYW5ndWxhciBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7UHJvcGVydHlCaW5kaW5nfSBmcm9tICcuL2NvbXBvbmVudF9pbmZvJztcbmltcG9ydCB7JFNDT1BFfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2dldFR5cGVOYW1lLCBob29rdXBOZ01vZGVsLCBzdHJpY3RFcXVhbHN9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IElOSVRJQUxfVkFMVUUgPSB7XG4gIF9fVU5JTklUSUFMSVpFRF9fOiB0cnVlXG59O1xuXG5leHBvcnQgY2xhc3MgRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlciB7XG4gIHByaXZhdGUgaW1wbGVtZW50c09uQ2hhbmdlcyA9IGZhbHNlO1xuICBwcml2YXRlIGlucHV0Q2hhbmdlQ291bnQ6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgaW5wdXRDaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzID0ge307XG4gIHByaXZhdGUgY29tcG9uZW50U2NvcGU6IGFuZ3VsYXIuSVNjb3BlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBjb21wb25lbnRSZWYgITogQ29tcG9uZW50UmVmPGFueT47XG4gIHByaXZhdGUgY29tcG9uZW50OiBhbnk7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNoYW5nZURldGVjdG9yICE6IENoYW5nZURldGVjdG9yUmVmO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSB2aWV3Q2hhbmdlRGV0ZWN0b3IgITogQ2hhbmdlRGV0ZWN0b3JSZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGVsZW1lbnQ6IGFuZ3VsYXIuSUF1Z21lbnRlZEpRdWVyeSwgcHJpdmF0ZSBhdHRyczogYW5ndWxhci5JQXR0cmlidXRlcyxcbiAgICAgIHByaXZhdGUgc2NvcGU6IGFuZ3VsYXIuSVNjb3BlLCBwcml2YXRlIG5nTW9kZWw6IGFuZ3VsYXIuSU5nTW9kZWxDb250cm9sbGVyLFxuICAgICAgcHJpdmF0ZSBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIHByaXZhdGUgJGluamVjdG9yOiBhbmd1bGFyLklJbmplY3RvclNlcnZpY2UsXG4gICAgICBwcml2YXRlICRjb21waWxlOiBhbmd1bGFyLklDb21waWxlU2VydmljZSwgcHJpdmF0ZSAkcGFyc2U6IGFuZ3VsYXIuSVBhcnNlU2VydmljZSxcbiAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+LFxuICAgICAgcHJpdmF0ZSB3cmFwQ2FsbGJhY2s6IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT4gVCkge1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCk7XG4gIH1cblxuICBjb21waWxlQ29udGVudHMoKTogTm9kZVtdW10ge1xuICAgIGNvbnN0IGNvbXBpbGVkUHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IHRoaXMuZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCk7XG4gICAgY29uc3QgbGlua0ZucyA9IHByb2plY3RhYmxlTm9kZXMubWFwKG5vZGVzID0+IHRoaXMuJGNvbXBpbGUobm9kZXMpKTtcblxuICAgIHRoaXMuZWxlbWVudC5lbXB0eSAhKCk7XG5cbiAgICBsaW5rRm5zLmZvckVhY2gobGlua0ZuID0+IHtcbiAgICAgIGxpbmtGbih0aGlzLnNjb3BlLCAoY2xvbmU6IE5vZGVbXSkgPT4ge1xuICAgICAgICBjb21waWxlZFByb2plY3RhYmxlTm9kZXMucHVzaChjbG9uZSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmQgIShjbG9uZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb21waWxlZFByb2plY3RhYmxlTm9kZXM7XG4gIH1cblxuICBjcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2RlczogTm9kZVtdW10pIHtcbiAgICBjb25zdCBwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbe3Byb3ZpZGU6ICRTQ09QRSwgdXNlVmFsdWU6IHRoaXMuY29tcG9uZW50U2NvcGV9XTtcbiAgICBjb25zdCBjaGlsZEluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKFxuICAgICAgICB7cHJvdmlkZXJzOiBwcm92aWRlcnMsIHBhcmVudDogdGhpcy5wYXJlbnRJbmplY3RvciwgbmFtZTogJ0Rvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXInfSk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFJlZiA9XG4gICAgICAgIHRoaXMuY29tcG9uZW50RmFjdG9yeS5jcmVhdGUoY2hpbGRJbmplY3RvciwgcHJvamVjdGFibGVOb2RlcywgdGhpcy5lbGVtZW50WzBdKTtcbiAgICB0aGlzLnZpZXdDaGFuZ2VEZXRlY3RvciA9IHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChDaGFuZ2VEZXRlY3RvclJlZik7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvciA9IHRoaXMuY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmO1xuICAgIHRoaXMuY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRSZWYuaW5zdGFuY2U7XG5cbiAgICAvLyB0ZXN0YWJpbGl0eSBob29rIGlzIGNvbW1vbmx5IGFkZGVkIGR1cmluZyBjb21wb25lbnQgYm9vdHN0cmFwIGluXG4gICAgLy8gcGFja2FnZXMvY29yZS9zcmMvYXBwbGljYXRpb25fcmVmLmJvb3RzdHJhcCgpXG4gICAgLy8gaW4gZG93bmdyYWRlZCBhcHBsaWNhdGlvbiwgY29tcG9uZW50IGNyZWF0aW9uIHdpbGwgdGFrZSBwbGFjZSBoZXJlIGFzIHdlbGwgYXMgYWRkaW5nIHRoZVxuICAgIC8vIHRlc3RhYmlsaXR5IGhvb2suXG4gICAgY29uc3QgdGVzdGFiaWxpdHkgPSB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHksIG51bGwpO1xuICAgIGlmICh0ZXN0YWJpbGl0eSkge1xuICAgICAgdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24odGhpcy5jb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCwgdGVzdGFiaWxpdHkpO1xuICAgIH1cblxuICAgIGhvb2t1cE5nTW9kZWwodGhpcy5uZ01vZGVsLCB0aGlzLmNvbXBvbmVudCk7XG4gIH1cblxuICBzZXR1cElucHV0cyhtYW51YWxseUF0dGFjaFZpZXc6IGJvb2xlYW4sIHByb3BhZ2F0ZURpZ2VzdCA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cnM7XG4gICAgY29uc3QgaW5wdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmlucHV0cyB8fCBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW5wdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKGlucHV0c1tpXS5wcm9wTmFtZSwgaW5wdXRzW2ldLnRlbXBsYXRlTmFtZSk7XG4gICAgICBsZXQgZXhwcjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYXR0cikpIHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZUZuID0gKHByb3AgPT4ge1xuICAgICAgICAgIGxldCBwcmV2VmFsdWUgPSBJTklUSUFMX1ZBTFVFO1xuICAgICAgICAgIHJldHVybiAoY3VyclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSwgYm90aCBgJG9ic2VydmUoKWAgYW5kIGAkd2F0Y2goKWAgd2lsbCBjYWxsIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIXN0cmljdEVxdWFscyhwcmV2VmFsdWUsIGN1cnJWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKHByZXZWYWx1ZSA9PT0gSU5JVElBTF9WQUxVRSkge1xuICAgICAgICAgICAgICAgIHByZXZWYWx1ZSA9IGN1cnJWYWx1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuICAgICAgICAgICAgICBwcmV2VmFsdWUgPSBjdXJyVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkoaW5wdXQucHJvcCk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKGlucHV0LmF0dHIsIG9ic2VydmVGbik7XG5cbiAgICAgICAgLy8gVXNlIGAkd2F0Y2goKWAgKGluIGFkZGl0aW9uIHRvIGAkb2JzZXJ2ZSgpYCkgaW4gb3JkZXIgdG8gaW5pdGlhbGl6ZSB0aGUgaW5wdXQgaW4gdGltZVxuICAgICAgICAvLyBmb3IgYG5nT25DaGFuZ2VzKClgLiBUaGlzIGlzIG5lY2Vzc2FyeSBpZiB3ZSBhcmUgYWxyZWFkeSBpbiBhIGAkZGlnZXN0YCwgd2hpY2ggbWVhbnMgdGhhdFxuICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAgKHdoaWNoIGlzIGNhbGxlZCBieSBhIHdhdGNoZXIpIHdpbGwgcnVuIGJlZm9yZSB0aGUgYCRvYnNlcnZlKClgIGNhbGxiYWNrLlxuICAgICAgICBsZXQgdW53YXRjaDogRnVuY3Rpb258bnVsbCA9IHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgICB1bndhdGNoID0gbnVsbDtcbiAgICAgICAgICBvYnNlcnZlRm4oYXR0cnNbaW5wdXQuYXR0cl0pO1xuICAgICAgICB9KTtcblxuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5iaW5kQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJpbmRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5icmFja2V0QXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJpbmRvbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5iaW5kb25BdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJyYWNrZXRQYXJlbkF0dHJdO1xuICAgICAgfVxuICAgICAgaWYgKGV4cHIgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCB3YXRjaEZuID1cbiAgICAgICAgICAgIChwcm9wID0+IChjdXJyVmFsdWU6IGFueSwgcHJldlZhbHVlOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpKShpbnB1dC5wcm9wKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goZXhwciwgd2F0Y2hGbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW52b2tlIGBuZ09uQ2hhbmdlcygpYCBhbmQgQ2hhbmdlIERldGVjdGlvbiAod2hlbiBuZWNlc3NhcnkpXG4gICAgY29uc3QgZGV0ZWN0Q2hhbmdlcyA9ICgpID0+IHRoaXMuY2hhbmdlRGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIGNvbnN0IHByb3RvdHlwZSA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5jb21wb25lbnRUeXBlLnByb3RvdHlwZTtcbiAgICB0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMgPSAhIShwcm90b3R5cGUgJiYgKDxPbkNoYW5nZXM+cHJvdG90eXBlKS5uZ09uQ2hhbmdlcyk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB0aGlzLmlucHV0Q2hhbmdlQ291bnQsIHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHtcbiAgICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWBcbiAgICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaW5wdXRDaGFuZ2VzID0gdGhpcy5pbnB1dENoYW5nZXM7XG4gICAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzID0ge307XG4gICAgICAgICg8T25DaGFuZ2VzPnRoaXMuY29tcG9uZW50KS5uZ09uQ2hhbmdlcyhpbnB1dENoYW5nZXMgISk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudmlld0NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuXG4gICAgICAvLyBJZiBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gd2hlbiBpbnB1dHMgY2hhbmdlLlxuICAgICAgaWYgKCFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgICAgZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8vIElmIG5vdCBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gb24gZXZlcnkgZGlnZXN0XG4gICAgaWYgKHByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2godGhpcy53cmFwQ2FsbGJhY2soZGV0ZWN0Q2hhbmdlcykpO1xuICAgIH1cblxuICAgIC8vIElmIG5lY2Vzc2FyeSwgYXR0YWNoIHRoZSB2aWV3IHNvIHRoYXQgaXQgd2lsbCBiZSBkaXJ0eS1jaGVja2VkLlxuICAgIC8vIChBbGxvdyB0aW1lIGZvciB0aGUgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgdG8gYmUgc2V0IGFuZCBgbmdPbkNoYW5nZXMoKWAgdG8gYmUgY2FsbGVkLilcbiAgICBpZiAobWFudWFsbHlBdHRhY2hWaWV3IHx8ICFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIGxldCB1bndhdGNoOiBGdW5jdGlvbnxudWxsID0gdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgdW53YXRjaCA9IG51bGw7XG5cbiAgICAgICAgY29uc3QgYXBwUmVmID0gdGhpcy5wYXJlbnRJbmplY3Rvci5nZXQ8QXBwbGljYXRpb25SZWY+KEFwcGxpY2F0aW9uUmVmKTtcbiAgICAgICAgYXBwUmVmLmF0dGFjaFZpZXcodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0dXBPdXRwdXRzKCkge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBvdXRwdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm91dHB1dHMgfHwgW107XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBvdXRwdXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKG91dHB1dHNbal0ucHJvcE5hbWUsIG91dHB1dHNbal0udGVtcGxhdGVOYW1lKTtcbiAgICAgIGNvbnN0IGJpbmRvbkF0dHIgPSBvdXRwdXQuYmluZG9uQXR0ci5zdWJzdHJpbmcoMCwgb3V0cHV0LmJpbmRvbkF0dHIubGVuZ3RoIC0gNik7XG4gICAgICBjb25zdCBicmFja2V0UGFyZW5BdHRyID1cbiAgICAgICAgICBgWygke291dHB1dC5icmFja2V0UGFyZW5BdHRyLnN1YnN0cmluZygyLCBvdXRwdXQuYnJhY2tldFBhcmVuQXR0ci5sZW5ndGggLSA4KX0pXWA7XG4gICAgICAvLyBvcmRlciBiZWxvdyBpcyBpbXBvcnRhbnQgLSBmaXJzdCB1cGRhdGUgYmluZGluZ3MgdGhlbiBldmFsdWF0ZSBleHByZXNzaW9uc1xuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJpbmRvbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tiaW5kb25BdHRyXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW2JyYWNrZXRQYXJlbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXQub25BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbb3V0cHV0Lm9uQXR0cl0pO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dC5wYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tvdXRwdXQucGFyZW5BdHRyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVUb091dHB1dChvdXRwdXQ6IFByb3BlcnR5QmluZGluZywgZXhwcjogc3RyaW5nLCBpc0Fzc2lnbm1lbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGdldHRlciA9IHRoaXMuJHBhcnNlKGV4cHIpO1xuICAgIGNvbnN0IHNldHRlciA9IGdldHRlci5hc3NpZ247XG4gICAgaWYgKGlzQXNzaWdubWVudCAmJiAhc2V0dGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cHJlc3Npb24gJyR7ZXhwcn0nIGlzIG5vdCBhc3NpZ25hYmxlIWApO1xuICAgIH1cbiAgICBjb25zdCBlbWl0dGVyID0gdGhpcy5jb21wb25lbnRbb3V0cHV0LnByb3BdIGFzIEV2ZW50RW1pdHRlcjxhbnk+O1xuICAgIGlmIChlbWl0dGVyKSB7XG4gICAgICBlbWl0dGVyLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IGlzQXNzaWdubWVudCA/ICh2OiBhbnkpID0+IHNldHRlciAhKHRoaXMuc2NvcGUsIHYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHY6IGFueSkgPT4gZ2V0dGVyKHRoaXMuc2NvcGUsIHsnJGV2ZW50Jzogdn0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBNaXNzaW5nIGVtaXR0ZXIgJyR7b3V0cHV0LnByb3B9JyBvbiBjb21wb25lbnQgJyR7Z2V0VHlwZU5hbWUodGhpcy5jb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUpfSchYCk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJDbGVhbnVwKCkge1xuICAgIGNvbnN0IGRlc3Ryb3lDb21wb25lbnRSZWYgPSB0aGlzLndyYXBDYWxsYmFjaygoKSA9PiB0aGlzLmNvbXBvbmVudFJlZi5kZXN0cm95KCkpO1xuICAgIGxldCBkZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuZWxlbWVudC5vbiAhKCckZGVzdHJveScsICgpID0+IHRoaXMuY29tcG9uZW50U2NvcGUuJGRlc3Ryb3koKSk7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgaWYgKCFkZXN0cm95ZWQpIHtcbiAgICAgICAgZGVzdHJveWVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgICAudW5yZWdpc3RlckFwcGxpY2F0aW9uKHRoaXMuY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICBkZXN0cm95Q29tcG9uZW50UmVmKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRJbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3RvcjsgfVxuXG4gIHByaXZhdGUgdXBkYXRlSW5wdXQocHJvcDogc3RyaW5nLCBwcmV2VmFsdWU6IGFueSwgY3VyclZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICB0aGlzLmlucHV0Q2hhbmdlc1twcm9wXSA9IG5ldyBTaW1wbGVDaGFuZ2UocHJldlZhbHVlLCBjdXJyVmFsdWUsIHByZXZWYWx1ZSA9PT0gY3VyclZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLmlucHV0Q2hhbmdlQ291bnQrKztcbiAgICB0aGlzLmNvbXBvbmVudFtwcm9wXSA9IGN1cnJWYWx1ZTtcbiAgfVxuXG4gIGdyb3VwUHJvamVjdGFibGVOb2RlcygpIHtcbiAgICBsZXQgbmdDb250ZW50U2VsZWN0b3JzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm5nQ29udGVudFNlbGVjdG9ycztcbiAgICByZXR1cm4gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzLCB0aGlzLmVsZW1lbnQuY29udGVudHMgISgpKTtcbiAgfVxufVxuXG4vKipcbiAqIEdyb3VwIGEgc2V0IG9mIERPTSBub2RlcyBpbnRvIGBuZ0NvbnRlbnRgIGdyb3VwcywgYmFzZWQgb24gdGhlIGdpdmVuIGNvbnRlbnQgc2VsZWN0b3JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSwgbm9kZXM6IE5vZGVbXSk6IE5vZGVbXVtdIHtcbiAgY29uc3QgcHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgbGV0IHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlcjtcblxuICBmb3IgKGxldCBpID0gMCwgaWkgPSBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpIDwgaWk7ICsraSkge1xuICAgIHByb2plY3RhYmxlTm9kZXNbaV0gPSBbXTtcbiAgfVxuXG4gIGZvciAobGV0IGogPSAwLCBqaiA9IG5vZGVzLmxlbmd0aDsgaiA8IGpqOyArK2opIHtcbiAgICBjb25zdCBub2RlID0gbm9kZXNbal07XG4gICAgY29uc3QgbmdDb250ZW50SW5kZXggPSBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChub2RlLCBuZ0NvbnRlbnRTZWxlY3RvcnMpO1xuICAgIGlmIChuZ0NvbnRlbnRJbmRleCAhPSBudWxsKSB7XG4gICAgICBwcm9qZWN0YWJsZU5vZGVzW25nQ29udGVudEluZGV4XS5wdXNoKG5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwcm9qZWN0YWJsZU5vZGVzO1xufVxuXG5mdW5jdGlvbiBmaW5kTWF0Y2hpbmdOZ0NvbnRlbnRJbmRleChlbGVtZW50OiBhbnksIG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10pOiBudW1iZXJ8bnVsbCB7XG4gIGNvbnN0IG5nQ29udGVudEluZGljZXM6IG51bWJlcltdID0gW107XG4gIGxldCB3aWxkY2FyZE5nQ29udGVudEluZGV4OiBudW1iZXIgPSAtMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZ0NvbnRlbnRTZWxlY3RvcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IG5nQ29udGVudFNlbGVjdG9yc1tpXTtcbiAgICBpZiAoc2VsZWN0b3IgPT09ICcqJykge1xuICAgICAgd2lsZGNhcmROZ0NvbnRlbnRJbmRleCA9IGk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChtYXRjaGVzU2VsZWN0b3IoZWxlbWVudCwgc2VsZWN0b3IpKSB7XG4gICAgICAgIG5nQ29udGVudEluZGljZXMucHVzaChpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgbmdDb250ZW50SW5kaWNlcy5zb3J0KCk7XG5cbiAgaWYgKHdpbGRjYXJkTmdDb250ZW50SW5kZXggIT09IC0xKSB7XG4gICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKHdpbGRjYXJkTmdDb250ZW50SW5kZXgpO1xuICB9XG4gIHJldHVybiBuZ0NvbnRlbnRJbmRpY2VzLmxlbmd0aCA/IG5nQ29udGVudEluZGljZXNbMF0gOiBudWxsO1xufVxuXG5sZXQgX21hdGNoZXM6ICh0aGlzOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbmZ1bmN0aW9uIG1hdGNoZXNTZWxlY3RvcihlbDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGlmICghX21hdGNoZXMpIHtcbiAgICBjb25zdCBlbFByb3RvID0gPGFueT5FbGVtZW50LnByb3RvdHlwZTtcbiAgICBfbWF0Y2hlcyA9IGVsUHJvdG8ubWF0Y2hlcyB8fCBlbFByb3RvLm1hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBlbFByb3RvLm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ub01hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLndlYmtpdE1hdGNoZXNTZWxlY3RvcjtcbiAgfVxuICByZXR1cm4gZWwubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFID8gX21hdGNoZXMuY2FsbChlbCwgc2VsZWN0b3IpIDogZmFsc2U7XG59XG4iXX0=