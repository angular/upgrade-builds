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
        var testabilityRegistry = this.componentRef.injector.get(TestabilityRegistry);
        var destroyComponentRef = this.wrapCallback(function () { return _this.componentRef.destroy(); });
        var destroyed = false;
        this.element.on('$destroy', function () { return _this.componentScope.$destroy(); });
        this.componentScope.$on('$destroy', function () {
            if (!destroyed) {
                destroyed = true;
                testabilityRegistry.unregisterApplication(_this.componentRef.location.nativeElement);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL3NyYy9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBZ0QsUUFBUSxFQUFhLFlBQVksRUFBaUMsV0FBVyxFQUFFLG1CQUFtQixFQUFPLE1BQU0sZUFBZSxDQUFDO0FBR3hOLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxXQUFXLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUVoRSxJQUFNLGFBQWEsR0FBRztJQUNwQixpQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFFRjtJQWFFLG1DQUNZLE9BQXlCLEVBQVUsS0FBa0IsRUFBVSxLQUFhLEVBQzVFLE9BQTJCLEVBQVUsY0FBd0IsRUFDN0QsU0FBMkIsRUFBVSxRQUF5QixFQUM5RCxNQUFxQixFQUFVLGdCQUF1QyxFQUN0RSxZQUF5QztRQUp6QyxZQUFPLEdBQVAsT0FBTyxDQUFrQjtRQUFVLFVBQUssR0FBTCxLQUFLLENBQWE7UUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFRO1FBQzVFLFlBQU8sR0FBUCxPQUFPLENBQW9CO1FBQVUsbUJBQWMsR0FBZCxjQUFjLENBQVU7UUFDN0QsY0FBUyxHQUFULFNBQVMsQ0FBa0I7UUFBVSxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUM5RCxXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQVUscUJBQWdCLEdBQWhCLGdCQUFnQixDQUF1QjtRQUN0RSxpQkFBWSxHQUFa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T0FBTyxDQUFDLGVBQWUsSUFBSSxPQUFPLENBQUMsa0JBQWtCO1lBQy9FLE9BQU8sQ0FBQyxpQkFBaUIsSUFBSSxPQUFPLENBQUMsZ0JBQWdCLElBQUksT0FBTyxDQUFDLHFCQUFxQixDQUFDO0tBQzVGO0lBQ0QsT0FBTyxFQUFFLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDakYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcHBsaWNhdGlvblJlZiwgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3RvciwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2UsIFNpbXBsZUNoYW5nZXMsIFN0YXRpY1Byb3ZpZGVyLCBUZXN0YWJpbGl0eSwgVGVzdGFiaWxpdHlSZWdpc3RyeSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7SUF0dHJpYnV0ZXMsIElBdWdtZW50ZWRKUXVlcnksIElDb21waWxlU2VydmljZSwgSUluamVjdG9yU2VydmljZSwgSU5nTW9kZWxDb250cm9sbGVyLCBJUGFyc2VTZXJ2aWNlLCBJU2NvcGV9IGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHtQcm9wZXJ0eUJpbmRpbmd9IGZyb20gJy4vY29tcG9uZW50X2luZm8nO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Z2V0VHlwZU5hbWUsIGhvb2t1cE5nTW9kZWwsIHN0cmljdEVxdWFsc30gZnJvbSAnLi91dGlsJztcblxuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmV4cG9ydCBjbGFzcyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpbXBsZW1lbnRzT25DaGFuZ2VzID0gZmFsc2U7XG4gIHByaXZhdGUgaW5wdXRDaGFuZ2VDb3VudDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZXM6IFNpbXBsZUNoYW5nZXMgPSB7fTtcbiAgcHJpdmF0ZSBjb21wb25lbnRTY29wZTogSVNjb3BlO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBjb21wb25lbnRSZWYgITogQ29tcG9uZW50UmVmPGFueT47XG4gIHByaXZhdGUgY29tcG9uZW50OiBhbnk7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIGNoYW5nZURldGVjdG9yICE6IENoYW5nZURldGVjdG9yUmVmO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSB2aWV3Q2hhbmdlRGV0ZWN0b3IgITogQ2hhbmdlRGV0ZWN0b3JSZWY7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIGVsZW1lbnQ6IElBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgYXR0cnM6IElBdHRyaWJ1dGVzLCBwcml2YXRlIHNjb3BlOiBJU2NvcGUsXG4gICAgICBwcml2YXRlIG5nTW9kZWw6IElOZ01vZGVsQ29udHJvbGxlciwgcHJpdmF0ZSBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsXG4gICAgICBwcml2YXRlICRpbmplY3RvcjogSUluamVjdG9yU2VydmljZSwgcHJpdmF0ZSAkY29tcGlsZTogSUNvbXBpbGVTZXJ2aWNlLFxuICAgICAgcHJpdmF0ZSAkcGFyc2U6IElQYXJzZVNlcnZpY2UsIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+LFxuICAgICAgcHJpdmF0ZSB3cmFwQ2FsbGJhY2s6IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT4gVCkge1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCk7XG4gIH1cblxuICBjb21waWxlQ29udGVudHMoKTogTm9kZVtdW10ge1xuICAgIGNvbnN0IGNvbXBpbGVkUHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IHRoaXMuZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCk7XG4gICAgY29uc3QgbGlua0ZucyA9IHByb2plY3RhYmxlTm9kZXMubWFwKG5vZGVzID0+IHRoaXMuJGNvbXBpbGUobm9kZXMpKTtcblxuICAgIHRoaXMuZWxlbWVudC5lbXB0eSAhKCk7XG5cbiAgICBsaW5rRm5zLmZvckVhY2gobGlua0ZuID0+IHtcbiAgICAgIGxpbmtGbih0aGlzLnNjb3BlLCAoY2xvbmU6IE5vZGVbXSkgPT4ge1xuICAgICAgICBjb21waWxlZFByb2plY3RhYmxlTm9kZXMucHVzaChjbG9uZSk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmQgIShjbG9uZSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb21waWxlZFByb2plY3RhYmxlTm9kZXM7XG4gIH1cblxuICBjcmVhdGVDb21wb25lbnQocHJvamVjdGFibGVOb2RlczogTm9kZVtdW10pIHtcbiAgICBjb25zdCBwcm92aWRlcnM6IFN0YXRpY1Byb3ZpZGVyW10gPSBbe3Byb3ZpZGU6ICRTQ09QRSwgdXNlVmFsdWU6IHRoaXMuY29tcG9uZW50U2NvcGV9XTtcbiAgICBjb25zdCBjaGlsZEluamVjdG9yID0gSW5qZWN0b3IuY3JlYXRlKFxuICAgICAgICB7cHJvdmlkZXJzOiBwcm92aWRlcnMsIHBhcmVudDogdGhpcy5wYXJlbnRJbmplY3RvciwgbmFtZTogJ0Rvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXInfSk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFJlZiA9XG4gICAgICAgIHRoaXMuY29tcG9uZW50RmFjdG9yeS5jcmVhdGUoY2hpbGRJbmplY3RvciwgcHJvamVjdGFibGVOb2RlcywgdGhpcy5lbGVtZW50WzBdKTtcbiAgICB0aGlzLnZpZXdDaGFuZ2VEZXRlY3RvciA9IHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChDaGFuZ2VEZXRlY3RvclJlZik7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvciA9IHRoaXMuY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmO1xuICAgIHRoaXMuY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRSZWYuaW5zdGFuY2U7XG5cbiAgICAvLyB0ZXN0YWJpbGl0eSBob29rIGlzIGNvbW1vbmx5IGFkZGVkIGR1cmluZyBjb21wb25lbnQgYm9vdHN0cmFwIGluXG4gICAgLy8gcGFja2FnZXMvY29yZS9zcmMvYXBwbGljYXRpb25fcmVmLmJvb3RzdHJhcCgpXG4gICAgLy8gaW4gZG93bmdyYWRlZCBhcHBsaWNhdGlvbiwgY29tcG9uZW50IGNyZWF0aW9uIHdpbGwgdGFrZSBwbGFjZSBoZXJlIGFzIHdlbGwgYXMgYWRkaW5nIHRoZVxuICAgIC8vIHRlc3RhYmlsaXR5IGhvb2suXG4gICAgY29uc3QgdGVzdGFiaWxpdHkgPSB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHksIG51bGwpO1xuICAgIGlmICh0ZXN0YWJpbGl0eSkge1xuICAgICAgdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24odGhpcy5jb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCwgdGVzdGFiaWxpdHkpO1xuICAgIH1cblxuICAgIGhvb2t1cE5nTW9kZWwodGhpcy5uZ01vZGVsLCB0aGlzLmNvbXBvbmVudCk7XG4gIH1cblxuICBzZXR1cElucHV0cyhtYW51YWxseUF0dGFjaFZpZXc6IGJvb2xlYW4sIHByb3BhZ2F0ZURpZ2VzdCA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cnM7XG4gICAgY29uc3QgaW5wdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmlucHV0cyB8fCBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW5wdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKGlucHV0c1tpXS5wcm9wTmFtZSwgaW5wdXRzW2ldLnRlbXBsYXRlTmFtZSk7XG4gICAgICBsZXQgZXhwcjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYXR0cikpIHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZUZuID0gKHByb3AgPT4ge1xuICAgICAgICAgIGxldCBwcmV2VmFsdWUgPSBJTklUSUFMX1ZBTFVFO1xuICAgICAgICAgIHJldHVybiAoY3VyclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSwgYm90aCBgJG9ic2VydmUoKWAgYW5kIGAkd2F0Y2goKWAgd2lsbCBjYWxsIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIXN0cmljdEVxdWFscyhwcmV2VmFsdWUsIGN1cnJWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKHByZXZWYWx1ZSA9PT0gSU5JVElBTF9WQUxVRSkge1xuICAgICAgICAgICAgICAgIHByZXZWYWx1ZSA9IGN1cnJWYWx1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuICAgICAgICAgICAgICBwcmV2VmFsdWUgPSBjdXJyVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkoaW5wdXQucHJvcCk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKGlucHV0LmF0dHIsIG9ic2VydmVGbik7XG5cbiAgICAgICAgLy8gVXNlIGAkd2F0Y2goKWAgKGluIGFkZGl0aW9uIHRvIGAkb2JzZXJ2ZSgpYCkgaW4gb3JkZXIgdG8gaW5pdGlhbGl6ZSB0aGUgaW5wdXQgaW4gdGltZVxuICAgICAgICAvLyBmb3IgYG5nT25DaGFuZ2VzKClgLiBUaGlzIGlzIG5lY2Vzc2FyeSBpZiB3ZSBhcmUgYWxyZWFkeSBpbiBhIGAkZGlnZXN0YCwgd2hpY2ggbWVhbnMgdGhhdFxuICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAgKHdoaWNoIGlzIGNhbGxlZCBieSBhIHdhdGNoZXIpIHdpbGwgcnVuIGJlZm9yZSB0aGUgYCRvYnNlcnZlKClgIGNhbGxiYWNrLlxuICAgICAgICBsZXQgdW53YXRjaDogRnVuY3Rpb258bnVsbCA9IHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgICB1bndhdGNoID0gbnVsbDtcbiAgICAgICAgICBvYnNlcnZlRm4oYXR0cnNbaW5wdXQuYXR0cl0pO1xuICAgICAgICB9KTtcblxuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5iaW5kQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJpbmRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5icmFja2V0QXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJpbmRvbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5iaW5kb25BdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJyYWNrZXRQYXJlbkF0dHJdO1xuICAgICAgfVxuICAgICAgaWYgKGV4cHIgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCB3YXRjaEZuID1cbiAgICAgICAgICAgIChwcm9wID0+IChjdXJyVmFsdWU6IGFueSwgcHJldlZhbHVlOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpKShpbnB1dC5wcm9wKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goZXhwciwgd2F0Y2hGbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW52b2tlIGBuZ09uQ2hhbmdlcygpYCBhbmQgQ2hhbmdlIERldGVjdGlvbiAod2hlbiBuZWNlc3NhcnkpXG4gICAgY29uc3QgZGV0ZWN0Q2hhbmdlcyA9ICgpID0+IHRoaXMuY2hhbmdlRGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIGNvbnN0IHByb3RvdHlwZSA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5jb21wb25lbnRUeXBlLnByb3RvdHlwZTtcbiAgICB0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMgPSAhIShwcm90b3R5cGUgJiYgKDxPbkNoYW5nZXM+cHJvdG90eXBlKS5uZ09uQ2hhbmdlcyk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB0aGlzLmlucHV0Q2hhbmdlQ291bnQsIHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHtcbiAgICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWBcbiAgICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaW5wdXRDaGFuZ2VzID0gdGhpcy5pbnB1dENoYW5nZXM7XG4gICAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzID0ge307XG4gICAgICAgICg8T25DaGFuZ2VzPnRoaXMuY29tcG9uZW50KS5uZ09uQ2hhbmdlcyhpbnB1dENoYW5nZXMgISk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudmlld0NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuXG4gICAgICAvLyBJZiBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gd2hlbiBpbnB1dHMgY2hhbmdlLlxuICAgICAgaWYgKCFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgICAgZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8vIElmIG5vdCBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gb24gZXZlcnkgZGlnZXN0XG4gICAgaWYgKHByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2godGhpcy53cmFwQ2FsbGJhY2soZGV0ZWN0Q2hhbmdlcykpO1xuICAgIH1cblxuICAgIC8vIElmIG5lY2Vzc2FyeSwgYXR0YWNoIHRoZSB2aWV3IHNvIHRoYXQgaXQgd2lsbCBiZSBkaXJ0eS1jaGVja2VkLlxuICAgIC8vIChBbGxvdyB0aW1lIGZvciB0aGUgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgdG8gYmUgc2V0IGFuZCBgbmdPbkNoYW5nZXMoKWAgdG8gYmUgY2FsbGVkLilcbiAgICBpZiAobWFudWFsbHlBdHRhY2hWaWV3IHx8ICFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIGxldCB1bndhdGNoOiBGdW5jdGlvbnxudWxsID0gdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgdW53YXRjaCA9IG51bGw7XG5cbiAgICAgICAgY29uc3QgYXBwUmVmID0gdGhpcy5wYXJlbnRJbmplY3Rvci5nZXQ8QXBwbGljYXRpb25SZWY+KEFwcGxpY2F0aW9uUmVmKTtcbiAgICAgICAgYXBwUmVmLmF0dGFjaFZpZXcodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0dXBPdXRwdXRzKCkge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBvdXRwdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm91dHB1dHMgfHwgW107XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBvdXRwdXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKG91dHB1dHNbal0ucHJvcE5hbWUsIG91dHB1dHNbal0udGVtcGxhdGVOYW1lKTtcbiAgICAgIGNvbnN0IGJpbmRvbkF0dHIgPSBvdXRwdXQuYmluZG9uQXR0ci5zdWJzdHJpbmcoMCwgb3V0cHV0LmJpbmRvbkF0dHIubGVuZ3RoIC0gNik7XG4gICAgICBjb25zdCBicmFja2V0UGFyZW5BdHRyID1cbiAgICAgICAgICBgWygke291dHB1dC5icmFja2V0UGFyZW5BdHRyLnN1YnN0cmluZygyLCBvdXRwdXQuYnJhY2tldFBhcmVuQXR0ci5sZW5ndGggLSA4KX0pXWA7XG4gICAgICAvLyBvcmRlciBiZWxvdyBpcyBpbXBvcnRhbnQgLSBmaXJzdCB1cGRhdGUgYmluZGluZ3MgdGhlbiBldmFsdWF0ZSBleHByZXNzaW9uc1xuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJpbmRvbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tiaW5kb25BdHRyXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW2JyYWNrZXRQYXJlbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXQub25BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbb3V0cHV0Lm9uQXR0cl0pO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dC5wYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tvdXRwdXQucGFyZW5BdHRyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVUb091dHB1dChvdXRwdXQ6IFByb3BlcnR5QmluZGluZywgZXhwcjogc3RyaW5nLCBpc0Fzc2lnbm1lbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGdldHRlciA9IHRoaXMuJHBhcnNlKGV4cHIpO1xuICAgIGNvbnN0IHNldHRlciA9IGdldHRlci5hc3NpZ247XG4gICAgaWYgKGlzQXNzaWdubWVudCAmJiAhc2V0dGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cHJlc3Npb24gJyR7ZXhwcn0nIGlzIG5vdCBhc3NpZ25hYmxlIWApO1xuICAgIH1cbiAgICBjb25zdCBlbWl0dGVyID0gdGhpcy5jb21wb25lbnRbb3V0cHV0LnByb3BdIGFzIEV2ZW50RW1pdHRlcjxhbnk+O1xuICAgIGlmIChlbWl0dGVyKSB7XG4gICAgICBlbWl0dGVyLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IGlzQXNzaWdubWVudCA/ICh2OiBhbnkpID0+IHNldHRlciAhKHRoaXMuc2NvcGUsIHYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHY6IGFueSkgPT4gZ2V0dGVyKHRoaXMuc2NvcGUsIHsnJGV2ZW50Jzogdn0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBNaXNzaW5nIGVtaXR0ZXIgJyR7b3V0cHV0LnByb3B9JyBvbiBjb21wb25lbnQgJyR7Z2V0VHlwZU5hbWUodGhpcy5jb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUpfSchYCk7XG4gICAgfVxuICB9XG5cbiAgcmVnaXN0ZXJDbGVhbnVwKCkge1xuICAgIGNvbnN0IHRlc3RhYmlsaXR5UmVnaXN0cnkgPSB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSk7XG4gICAgY29uc3QgZGVzdHJveUNvbXBvbmVudFJlZiA9IHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHRoaXMuY29tcG9uZW50UmVmLmRlc3Ryb3koKSk7XG4gICAgbGV0IGRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5lbGVtZW50Lm9uICEoJyRkZXN0cm95JywgKCkgPT4gdGhpcy5jb21wb25lbnRTY29wZS4kZGVzdHJveSgpKTtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICBpZiAoIWRlc3Ryb3llZCkge1xuICAgICAgICBkZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB0ZXN0YWJpbGl0eVJlZ2lzdHJ5LnVucmVnaXN0ZXJBcHBsaWNhdGlvbih0aGlzLmNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgZGVzdHJveUNvbXBvbmVudFJlZigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0SW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3I7IH1cblxuICBwcml2YXRlIHVwZGF0ZUlucHV0KHByb3A6IHN0cmluZywgcHJldlZhbHVlOiBhbnksIGN1cnJWYWx1ZTogYW55KSB7XG4gICAgaWYgKHRoaXMuaW1wbGVtZW50c09uQ2hhbmdlcykge1xuICAgICAgdGhpcy5pbnB1dENoYW5nZXNbcHJvcF0gPSBuZXcgU2ltcGxlQ2hhbmdlKHByZXZWYWx1ZSwgY3VyclZhbHVlLCBwcmV2VmFsdWUgPT09IGN1cnJWYWx1ZSk7XG4gICAgfVxuXG4gICAgdGhpcy5pbnB1dENoYW5nZUNvdW50Kys7XG4gICAgdGhpcy5jb21wb25lbnRbcHJvcF0gPSBjdXJyVmFsdWU7XG4gIH1cblxuICBncm91cFByb2plY3RhYmxlTm9kZXMoKSB7XG4gICAgbGV0IG5nQ29udGVudFNlbGVjdG9ycyA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5uZ0NvbnRlbnRTZWxlY3RvcnM7XG4gICAgcmV0dXJuIGdyb3VwTm9kZXNCeVNlbGVjdG9yKG5nQ29udGVudFNlbGVjdG9ycywgdGhpcy5lbGVtZW50LmNvbnRlbnRzICEoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBHcm91cCBhIHNldCBvZiBET00gbm9kZXMgaW50byBgbmdDb250ZW50YCBncm91cHMsIGJhc2VkIG9uIHRoZSBnaXZlbiBjb250ZW50IHNlbGVjdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwTm9kZXNCeVNlbGVjdG9yKG5nQ29udGVudFNlbGVjdG9yczogc3RyaW5nW10sIG5vZGVzOiBOb2RlW10pOiBOb2RlW11bXSB7XG4gIGNvbnN0IHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gW107XG4gIGxldCB3aWxkY2FyZE5nQ29udGVudEluZGV4OiBudW1iZXI7XG5cbiAgZm9yIChsZXQgaSA9IDAsIGlpID0gbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aDsgaSA8IGlpOyArK2kpIHtcbiAgICBwcm9qZWN0YWJsZU5vZGVzW2ldID0gW107XG4gIH1cblxuICBmb3IgKGxldCBqID0gMCwgamogPSBub2Rlcy5sZW5ndGg7IGogPCBqajsgKytqKSB7XG4gICAgY29uc3Qgbm9kZSA9IG5vZGVzW2pdO1xuICAgIGNvbnN0IG5nQ29udGVudEluZGV4ID0gZmluZE1hdGNoaW5nTmdDb250ZW50SW5kZXgobm9kZSwgbmdDb250ZW50U2VsZWN0b3JzKTtcbiAgICBpZiAobmdDb250ZW50SW5kZXggIT0gbnVsbCkge1xuICAgICAgcHJvamVjdGFibGVOb2Rlc1tuZ0NvbnRlbnRJbmRleF0ucHVzaChub2RlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcHJvamVjdGFibGVOb2Rlcztcbn1cblxuZnVuY3Rpb24gZmluZE1hdGNoaW5nTmdDb250ZW50SW5kZXgoZWxlbWVudDogYW55LCBuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdKTogbnVtYmVyfG51bGwge1xuICBjb25zdCBuZ0NvbnRlbnRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICBsZXQgd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyID0gLTE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBuZ0NvbnRlbnRTZWxlY3RvcnNbaV07XG4gICAgaWYgKHNlbGVjdG9yID09PSAnKicpIHtcbiAgICAgIHdpbGRjYXJkTmdDb250ZW50SW5kZXggPSBpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobWF0Y2hlc1NlbGVjdG9yKGVsZW1lbnQsIHNlbGVjdG9yKSkge1xuICAgICAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2goaSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5nQ29udGVudEluZGljZXMuc29ydCgpO1xuXG4gIGlmICh3aWxkY2FyZE5nQ29udGVudEluZGV4ICE9PSAtMSkge1xuICAgIG5nQ29udGVudEluZGljZXMucHVzaCh3aWxkY2FyZE5nQ29udGVudEluZGV4KTtcbiAgfVxuICByZXR1cm4gbmdDb250ZW50SW5kaWNlcy5sZW5ndGggPyBuZ0NvbnRlbnRJbmRpY2VzWzBdIDogbnVsbDtcbn1cblxubGV0IF9tYXRjaGVzOiAodGhpczogYW55LCBzZWxlY3Rvcjogc3RyaW5nKSA9PiBib29sZWFuO1xuXG5mdW5jdGlvbiBtYXRjaGVzU2VsZWN0b3IoZWw6IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoIV9tYXRjaGVzKSB7XG4gICAgY29uc3QgZWxQcm90byA9IDxhbnk+RWxlbWVudC5wcm90b3R5cGU7XG4gICAgX21hdGNoZXMgPSBlbFByb3RvLm1hdGNoZXMgfHwgZWxQcm90by5tYXRjaGVzU2VsZWN0b3IgfHwgZWxQcm90by5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgZWxQcm90by5tc01hdGNoZXNTZWxlY3RvciB8fCBlbFByb3RvLm9NYXRjaGVzU2VsZWN0b3IgfHwgZWxQcm90by53ZWJraXRNYXRjaGVzU2VsZWN0b3I7XG4gIH1cbiAgcmV0dXJuIGVsLm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERSA/IF9tYXRjaGVzLmNhbGwoZWwsIHNlbGVjdG9yKSA6IGZhbHNlO1xufVxuIl19