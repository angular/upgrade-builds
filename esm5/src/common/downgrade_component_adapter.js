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
import { getComponentName, hookupNgModel, strictEquals } from './util';
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
    DowngradeComponentAdapter.prototype.setupInputs = function (needsNgZone, propagateDigest) {
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
                var watchFn = (function (prop) {
                    return function (currValue, prevValue) {
                        return _this.updateInput(prop, prevValue, currValue);
                    };
                })(input.prop);
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
                _this.component.ngOnChanges((inputChanges));
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
        if (needsNgZone || !propagateDigest) {
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
            throw new Error("Missing emitter '" + output.prop + "' on component '" + getComponentName(this.componentFactory.componentType) + "'!");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL2Rvd25ncmFkZV9jb21wb25lbnRfYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBUUEsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBZ0QsUUFBUSxFQUFhLFlBQVksRUFBaUMsV0FBVyxFQUFFLG1CQUFtQixFQUFPLE1BQU0sZUFBZSxDQUFDO0FBR3hOLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ25DLE9BQU8sRUFBdUIsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUUzRixJQUFNLGFBQWEsR0FBRztJQUNwQixpQkFBaUIsRUFBRSxJQUFJO0NBQ3hCLENBQUM7QUFFRixJQUFBO0lBVUUsbUNBQ1ksT0FBaUMsRUFBVSxLQUEwQixFQUNyRSxLQUFxQixFQUFVLE9BQW1DLEVBQ2xFLGNBQXdCLEVBQVUsU0FBbUMsRUFDckUsUUFBaUMsRUFBVSxNQUE2QixFQUN4RSxnQkFBdUMsRUFDdkMsWUFBeUM7UUFMekMsWUFBTyxHQUFQLE9BQU8sQ0FBMEI7UUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFxQjtRQUNyRSxVQUFLLEdBQUwsS0FBSyxDQUFnQjtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQTRCO1FBQ2xFLG1CQUFjLEdBQWQsY0FBYyxDQUFVO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBMEI7UUFDckUsYUFBUSxHQUFSLFFBQVEsQ0FBeUI7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUF1QjtRQUN4RSxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXVCO1FBQ3ZDLGlCQUFZLEdBQVosWUFBWSxD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Q0FBQztLQUMvQztJQUNELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Q0FDN0Q7QUFFRCxJQUFJLFFBQWtELENBQUM7QUFFdkQseUJBQXlCLEVBQU8sRUFBRSxRQUFnQjtJQUNoRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDZCxJQUFNLE9BQU8sR0FBUSxPQUFPLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLFFBQVEsR0FBRyxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxlQUFlLElBQUksT0FBTyxDQUFDLGtCQUFrQjtZQUMvRSxPQUFPLENBQUMsaUJBQWlCLElBQUksT0FBTyxDQUFDLGdCQUFnQixJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQztLQUM1RjtJQUNELE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Q0FDaEYiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXBwbGljYXRpb25SZWYsIENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBTdGF0aWNQcm92aWRlciwgVGVzdGFiaWxpdHksIFRlc3RhYmlsaXR5UmVnaXN0cnksIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgKiBhcyBhbmd1bGFyIGZyb20gJy4vYW5ndWxhcjEnO1xuaW1wb3J0IHtQcm9wZXJ0eUJpbmRpbmd9IGZyb20gJy4vY29tcG9uZW50X2luZm8nO1xuaW1wb3J0IHskU0NPUEV9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Z2V0QXR0cmlidXRlc0FzQXJyYXksIGdldENvbXBvbmVudE5hbWUsIGhvb2t1cE5nTW9kZWwsIHN0cmljdEVxdWFsc30gZnJvbSAnLi91dGlsJztcblxuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmV4cG9ydCBjbGFzcyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpbXBsZW1lbnRzT25DaGFuZ2VzID0gZmFsc2U7XG4gIHByaXZhdGUgaW5wdXRDaGFuZ2VDb3VudDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZXM6IFNpbXBsZUNoYW5nZXMgPSB7fTtcbiAgcHJpdmF0ZSBjb21wb25lbnRTY29wZTogYW5ndWxhci5JU2NvcGU7XG4gIHByaXZhdGUgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PjtcbiAgcHJpdmF0ZSBjb21wb25lbnQ6IGFueTtcbiAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvcjogQ2hhbmdlRGV0ZWN0b3JSZWY7XG4gIHByaXZhdGUgdmlld0NoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgZWxlbWVudDogYW5ndWxhci5JQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlIGF0dHJzOiBhbmd1bGFyLklBdHRyaWJ1dGVzLFxuICAgICAgcHJpdmF0ZSBzY29wZTogYW5ndWxhci5JU2NvcGUsIHByaXZhdGUgbmdNb2RlbDogYW5ndWxhci5JTmdNb2RlbENvbnRyb2xsZXIsXG4gICAgICBwcml2YXRlIHBhcmVudEluamVjdG9yOiBJbmplY3RvciwgcHJpdmF0ZSAkaW5qZWN0b3I6IGFuZ3VsYXIuSUluamVjdG9yU2VydmljZSxcbiAgICAgIHByaXZhdGUgJGNvbXBpbGU6IGFuZ3VsYXIuSUNvbXBpbGVTZXJ2aWNlLCBwcml2YXRlICRwYXJzZTogYW5ndWxhci5JUGFyc2VTZXJ2aWNlLFxuICAgICAgcHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4sXG4gICAgICBwcml2YXRlIHdyYXBDYWxsYmFjazogPFQ+KGNiOiAoKSA9PiBUKSA9PiAoKSA9PiBUKSB7XG4gICAgdGhpcy5jb21wb25lbnRTY29wZSA9IHNjb3BlLiRuZXcoKTtcbiAgfVxuXG4gIGNvbXBpbGVDb250ZW50cygpOiBOb2RlW11bXSB7XG4gICAgY29uc3QgY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IFtdO1xuICAgIGNvbnN0IHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gdGhpcy5ncm91cFByb2plY3RhYmxlTm9kZXMoKTtcbiAgICBjb25zdCBsaW5rRm5zID0gcHJvamVjdGFibGVOb2Rlcy5tYXAobm9kZXMgPT4gdGhpcy4kY29tcGlsZShub2RlcykpO1xuXG4gICAgdGhpcy5lbGVtZW50LmVtcHR5ICEoKTtcblxuICAgIGxpbmtGbnMuZm9yRWFjaChsaW5rRm4gPT4ge1xuICAgICAgbGlua0ZuKHRoaXMuc2NvcGUsIChjbG9uZTogTm9kZVtdKSA9PiB7XG4gICAgICAgIGNvbXBpbGVkUHJvamVjdGFibGVOb2Rlcy5wdXNoKGNsb25lKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZCAhKGNsb25lKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbXBpbGVkUHJvamVjdGFibGVOb2RlcztcbiAgfVxuXG4gIGNyZWF0ZUNvbXBvbmVudChwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSkge1xuICAgIGNvbnN0IHByb3ZpZGVyczogU3RhdGljUHJvdmlkZXJbXSA9IFt7cHJvdmlkZTogJFNDT1BFLCB1c2VWYWx1ZTogdGhpcy5jb21wb25lbnRTY29wZX1dO1xuICAgIGNvbnN0IGNoaWxkSW5qZWN0b3IgPSBJbmplY3Rvci5jcmVhdGUoXG4gICAgICAgIHtwcm92aWRlcnM6IHByb3ZpZGVycywgcGFyZW50OiB0aGlzLnBhcmVudEluamVjdG9yLCBuYW1lOiAnRG93bmdyYWRlQ29tcG9uZW50QWRhcHRlcid9KTtcblxuICAgIHRoaXMuY29tcG9uZW50UmVmID1cbiAgICAgICAgdGhpcy5jb21wb25lbnRGYWN0b3J5LmNyZWF0ZShjaGlsZEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzLCB0aGlzLmVsZW1lbnRbMF0pO1xuICAgIHRoaXMudmlld0NoYW5nZURldGVjdG9yID0gdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yID0gdGhpcy5jb21wb25lbnRSZWYuY2hhbmdlRGV0ZWN0b3JSZWY7XG4gICAgdGhpcy5jb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudFJlZi5pbnN0YW5jZTtcblxuICAgIC8vIHRlc3RhYmlsaXR5IGhvb2sgaXMgY29tbW9ubHkgYWRkZWQgZHVyaW5nIGNvbXBvbmVudCBib290c3RyYXAgaW5cbiAgICAvLyBwYWNrYWdlcy9jb3JlL3NyYy9hcHBsaWNhdGlvbl9yZWYuYm9vdHN0cmFwKClcbiAgICAvLyBpbiBkb3duZ3JhZGVkIGFwcGxpY2F0aW9uLCBjb21wb25lbnQgY3JlYXRpb24gd2lsbCB0YWtlIHBsYWNlIGhlcmUgYXMgd2VsbCBhcyBhZGRpbmcgdGhlXG4gICAgLy8gdGVzdGFiaWxpdHkgaG9vay5cbiAgICBjb25zdCB0ZXN0YWJpbGl0eSA9IHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eSwgbnVsbCk7XG4gICAgaWYgKHRlc3RhYmlsaXR5KSB7XG4gICAgICB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgICAucmVnaXN0ZXJBcHBsaWNhdGlvbih0aGlzLmNvbXBvbmVudFJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50LCB0ZXN0YWJpbGl0eSk7XG4gICAgfVxuXG4gICAgaG9va3VwTmdNb2RlbCh0aGlzLm5nTW9kZWwsIHRoaXMuY29tcG9uZW50KTtcbiAgfVxuXG4gIHNldHVwSW5wdXRzKG5lZWRzTmdab25lOiBib29sZWFuLCBwcm9wYWdhdGVEaWdlc3QgPSB0cnVlKTogdm9pZCB7XG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLmF0dHJzO1xuICAgIGNvbnN0IGlucHV0cyA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5pbnB1dHMgfHwgW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGlucHV0ID0gbmV3IFByb3BlcnR5QmluZGluZyhpbnB1dHNbaV0ucHJvcE5hbWUsIGlucHV0c1tpXS50ZW1wbGF0ZU5hbWUpO1xuICAgICAgbGV0IGV4cHI6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmF0dHIpKSB7XG4gICAgICAgIGNvbnN0IG9ic2VydmVGbiA9IChwcm9wID0+IHtcbiAgICAgICAgICBsZXQgcHJldlZhbHVlID0gSU5JVElBTF9WQUxVRTtcbiAgICAgICAgICByZXR1cm4gKGN1cnJWYWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAvLyBJbml0aWFsbHksIGJvdGggYCRvYnNlcnZlKClgIGFuZCBgJHdhdGNoKClgIHdpbGwgY2FsbCB0aGlzIGZ1bmN0aW9uLlxuICAgICAgICAgICAgaWYgKCFzdHJpY3RFcXVhbHMocHJldlZhbHVlLCBjdXJyVmFsdWUpKSB7XG4gICAgICAgICAgICAgIGlmIChwcmV2VmFsdWUgPT09IElOSVRJQUxfVkFMVUUpIHtcbiAgICAgICAgICAgICAgICBwcmV2VmFsdWUgPSBjdXJyVmFsdWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0KHByb3AsIHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgICAgICAgcHJldlZhbHVlID0gY3VyclZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pKGlucHV0LnByb3ApO1xuICAgICAgICBhdHRycy4kb2JzZXJ2ZShpbnB1dC5hdHRyLCBvYnNlcnZlRm4pO1xuXG4gICAgICAgIC8vIFVzZSBgJHdhdGNoKClgIChpbiBhZGRpdGlvbiB0byBgJG9ic2VydmUoKWApIGluIG9yZGVyIHRvIGluaXRpYWxpemUgdGhlIGlucHV0IGluIHRpbWVcbiAgICAgICAgLy8gZm9yIGBuZ09uQ2hhbmdlcygpYC4gVGhpcyBpcyBuZWNlc3NhcnkgaWYgd2UgYXJlIGFscmVhZHkgaW4gYSBgJGRpZ2VzdGAsIHdoaWNoIG1lYW5zIHRoYXRcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzKClgICh3aGljaCBpcyBjYWxsZWQgYnkgYSB3YXRjaGVyKSB3aWxsIHJ1biBiZWZvcmUgdGhlIGAkb2JzZXJ2ZSgpYCBjYWxsYmFjay5cbiAgICAgICAgbGV0IHVud2F0Y2g6IEZ1bmN0aW9ufG51bGwgPSB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgICAgdW53YXRjaCAhKCk7XG4gICAgICAgICAgdW53YXRjaCA9IG51bGw7XG4gICAgICAgICAgb2JzZXJ2ZUZuKGF0dHJzW2lucHV0LmF0dHJdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYmluZEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5iaW5kQXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJyYWNrZXRBdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXQuYnJhY2tldEF0dHJdO1xuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5iaW5kb25BdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXQuYmluZG9uQXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJyYWNrZXRQYXJlbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5icmFja2V0UGFyZW5BdHRyXTtcbiAgICAgIH1cbiAgICAgIGlmIChleHByICE9IG51bGwpIHtcbiAgICAgICAgY29uc3Qgd2F0Y2hGbiA9XG4gICAgICAgICAgICAocHJvcCA9PiAoY3VyclZhbHVlOiBhbnksIHByZXZWYWx1ZTogYW55KSA9PlxuICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0KHByb3AsIHByZXZWYWx1ZSwgY3VyclZhbHVlKSkoaW5wdXQucHJvcCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKGV4cHIsIHdhdGNoRm4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWAgYW5kIENoYW5nZSBEZXRlY3Rpb24gKHdoZW4gbmVjZXNzYXJ5KVxuICAgIGNvbnN0IGRldGVjdENoYW5nZXMgPSAoKSA9PiB0aGlzLmNoYW5nZURldGVjdG9yLmRldGVjdENoYW5nZXMoKTtcbiAgICBjb25zdCBwcm90b3R5cGUgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZS5wcm90b3R5cGU7XG4gICAgdGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzID0gISEocHJvdG90eXBlICYmICg8T25DaGFuZ2VzPnByb3RvdHlwZSkubmdPbkNoYW5nZXMpO1xuXG4gICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4gdGhpcy5pbnB1dENoYW5nZUNvdW50LCB0aGlzLndyYXBDYWxsYmFjaygoKSA9PiB7XG4gICAgICAvLyBJbnZva2UgYG5nT25DaGFuZ2VzKClgXG4gICAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICAgIGNvbnN0IGlucHV0Q2hhbmdlcyA9IHRoaXMuaW5wdXRDaGFuZ2VzO1xuICAgICAgICB0aGlzLmlucHV0Q2hhbmdlcyA9IHt9O1xuICAgICAgICAoPE9uQ2hhbmdlcz50aGlzLmNvbXBvbmVudCkubmdPbkNoYW5nZXMoaW5wdXRDaGFuZ2VzICEpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnZpZXdDaGFuZ2VEZXRlY3Rvci5tYXJrRm9yQ2hlY2soKTtcblxuICAgICAgLy8gSWYgb3B0ZWQgb3V0IG9mIHByb3BhZ2F0aW5nIGRpZ2VzdHMsIGludm9rZSBjaGFuZ2UgZGV0ZWN0aW9uIHdoZW4gaW5wdXRzIGNoYW5nZS5cbiAgICAgIGlmICghcHJvcGFnYXRlRGlnZXN0KSB7XG4gICAgICAgIGRldGVjdENoYW5nZXMoKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICAvLyBJZiBub3Qgb3B0ZWQgb3V0IG9mIHByb3BhZ2F0aW5nIGRpZ2VzdHMsIGludm9rZSBjaGFuZ2UgZGV0ZWN0aW9uIG9uIGV2ZXJ5IGRpZ2VzdFxuICAgIGlmIChwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKHRoaXMud3JhcENhbGxiYWNrKGRldGVjdENoYW5nZXMpKTtcbiAgICB9XG5cbiAgICAvLyBJZiBuZWNlc3NhcnksIGF0dGFjaCB0aGUgdmlldyBzbyB0aGF0IGl0IHdpbGwgYmUgZGlydHktY2hlY2tlZC5cbiAgICAvLyAoQWxsb3cgdGltZSBmb3IgdGhlIGluaXRpYWwgaW5wdXQgdmFsdWVzIHRvIGJlIHNldCBhbmQgYG5nT25DaGFuZ2VzKClgIHRvIGJlIGNhbGxlZC4pXG4gICAgaWYgKG5lZWRzTmdab25lIHx8ICFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgIGxldCB1bndhdGNoOiBGdW5jdGlvbnxudWxsID0gdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goKCkgPT4ge1xuICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgdW53YXRjaCA9IG51bGw7XG5cbiAgICAgICAgY29uc3QgYXBwUmVmID0gdGhpcy5wYXJlbnRJbmplY3Rvci5nZXQ8QXBwbGljYXRpb25SZWY+KEFwcGxpY2F0aW9uUmVmKTtcbiAgICAgICAgYXBwUmVmLmF0dGFjaFZpZXcodGhpcy5jb21wb25lbnRSZWYuaG9zdFZpZXcpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgc2V0dXBPdXRwdXRzKCkge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBvdXRwdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm91dHB1dHMgfHwgW107XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCBvdXRwdXRzLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKG91dHB1dHNbal0ucHJvcE5hbWUsIG91dHB1dHNbal0udGVtcGxhdGVOYW1lKTtcbiAgICAgIGNvbnN0IGJpbmRvbkF0dHIgPSBvdXRwdXQuYmluZG9uQXR0ci5zdWJzdHJpbmcoMCwgb3V0cHV0LmJpbmRvbkF0dHIubGVuZ3RoIC0gNik7XG4gICAgICBjb25zdCBicmFja2V0UGFyZW5BdHRyID1cbiAgICAgICAgICBgWygke291dHB1dC5icmFja2V0UGFyZW5BdHRyLnN1YnN0cmluZygyLCBvdXRwdXQuYnJhY2tldFBhcmVuQXR0ci5sZW5ndGggLSA4KX0pXWA7XG4gICAgICAvLyBvcmRlciBiZWxvdyBpcyBpbXBvcnRhbnQgLSBmaXJzdCB1cGRhdGUgYmluZGluZ3MgdGhlbiBldmFsdWF0ZSBleHByZXNzaW9uc1xuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJpbmRvbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tiaW5kb25BdHRyXSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW2JyYWNrZXRQYXJlbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXQub25BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbb3V0cHV0Lm9uQXR0cl0pO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dC5wYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tvdXRwdXQucGFyZW5BdHRyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVUb091dHB1dChvdXRwdXQ6IFByb3BlcnR5QmluZGluZywgZXhwcjogc3RyaW5nLCBpc0Fzc2lnbm1lbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGdldHRlciA9IHRoaXMuJHBhcnNlKGV4cHIpO1xuICAgIGNvbnN0IHNldHRlciA9IGdldHRlci5hc3NpZ247XG4gICAgaWYgKGlzQXNzaWdubWVudCAmJiAhc2V0dGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cHJlc3Npb24gJyR7ZXhwcn0nIGlzIG5vdCBhc3NpZ25hYmxlIWApO1xuICAgIH1cbiAgICBjb25zdCBlbWl0dGVyID0gdGhpcy5jb21wb25lbnRbb3V0cHV0LnByb3BdIGFzIEV2ZW50RW1pdHRlcjxhbnk+O1xuICAgIGlmIChlbWl0dGVyKSB7XG4gICAgICBlbWl0dGVyLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6IGlzQXNzaWdubWVudCA/ICh2OiBhbnkpID0+IHNldHRlciAhKHRoaXMuc2NvcGUsIHYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHY6IGFueSkgPT4gZ2V0dGVyKHRoaXMuc2NvcGUsIHsnJGV2ZW50Jzogdn0pXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBNaXNzaW5nIGVtaXR0ZXIgJyR7b3V0cHV0LnByb3B9JyBvbiBjb21wb25lbnQgJyR7Z2V0Q29tcG9uZW50TmFtZSh0aGlzLmNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZSl9JyFgKTtcbiAgICB9XG4gIH1cblxuICByZWdpc3RlckNsZWFudXAoKSB7XG4gICAgY29uc3QgZGVzdHJveUNvbXBvbmVudFJlZiA9IHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHRoaXMuY29tcG9uZW50UmVmLmRlc3Ryb3koKSk7XG4gICAgbGV0IGRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5lbGVtZW50Lm9uICEoJyRkZXN0cm95JywgKCkgPT4gdGhpcy5jb21wb25lbnRTY29wZS4kZGVzdHJveSgpKTtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICBpZiAoIWRlc3Ryb3llZCkge1xuICAgICAgICBkZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgICAgIC51bnJlZ2lzdGVyQXBwbGljYXRpb24odGhpcy5jb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIGRlc3Ryb3lDb21wb25lbnRSZWYoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yOyB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVJbnB1dChwcm9wOiBzdHJpbmcsIHByZXZWYWx1ZTogYW55LCBjdXJyVmFsdWU6IGFueSkge1xuICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzW3Byb3BdID0gbmV3IFNpbXBsZUNoYW5nZShwcmV2VmFsdWUsIGN1cnJWYWx1ZSwgcHJldlZhbHVlID09PSBjdXJyVmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuaW5wdXRDaGFuZ2VDb3VudCsrO1xuICAgIHRoaXMuY29tcG9uZW50W3Byb3BdID0gY3VyclZhbHVlO1xuICB9XG5cbiAgZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCkge1xuICAgIGxldCBuZ0NvbnRlbnRTZWxlY3RvcnMgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkubmdDb250ZW50U2VsZWN0b3JzO1xuICAgIHJldHVybiBncm91cE5vZGVzQnlTZWxlY3RvcihuZ0NvbnRlbnRTZWxlY3RvcnMsIHRoaXMuZWxlbWVudC5jb250ZW50cyAhKCkpO1xuICB9XG59XG5cbi8qKlxuICogR3JvdXAgYSBzZXQgb2YgRE9NIG5vZGVzIGludG8gYG5nQ29udGVudGAgZ3JvdXBzLCBiYXNlZCBvbiB0aGUgZ2l2ZW4gY29udGVudCBzZWxlY3RvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cE5vZGVzQnlTZWxlY3RvcihuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdLCBub2RlczogTm9kZVtdKTogTm9kZVtdW10ge1xuICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IFtdO1xuICBsZXQgd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyO1xuXG4gIGZvciAobGV0IGkgPSAwLCBpaSA9IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkgPCBpaTsgKytpKSB7XG4gICAgcHJvamVjdGFibGVOb2Rlc1tpXSA9IFtdO1xuICB9XG5cbiAgZm9yIChsZXQgaiA9IDAsIGpqID0gbm9kZXMubGVuZ3RoOyBqIDwgamo7ICsraikge1xuICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tqXTtcbiAgICBjb25zdCBuZ0NvbnRlbnRJbmRleCA9IGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KG5vZGUsIG5nQ29udGVudFNlbGVjdG9ycyk7XG4gICAgaWYgKG5nQ29udGVudEluZGV4ICE9IG51bGwpIHtcbiAgICAgIHByb2plY3RhYmxlTm9kZXNbbmdDb250ZW50SW5kZXhdLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByb2plY3RhYmxlTm9kZXM7XG59XG5cbmZ1bmN0aW9uIGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KGVsZW1lbnQ6IGFueSwgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSk6IG51bWJlcnxudWxsIHtcbiAgY29uc3QgbmdDb250ZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgbGV0IHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlciA9IC0xO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gbmdDb250ZW50U2VsZWN0b3JzW2ldO1xuICAgIGlmIChzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gaTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hdGNoZXNTZWxlY3RvcihlbGVtZW50LCBzZWxlY3RvcikpIHtcbiAgICAgICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKGkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBuZ0NvbnRlbnRJbmRpY2VzLnNvcnQoKTtcblxuICBpZiAod2lsZGNhcmROZ0NvbnRlbnRJbmRleCAhPT0gLTEpIHtcbiAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2god2lsZGNhcmROZ0NvbnRlbnRJbmRleCk7XG4gIH1cbiAgcmV0dXJuIG5nQ29udGVudEluZGljZXMubGVuZ3RoID8gbmdDb250ZW50SW5kaWNlc1swXSA6IG51bGw7XG59XG5cbmxldCBfbWF0Y2hlczogKHRoaXM6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuZnVuY3Rpb24gbWF0Y2hlc1NlbGVjdG9yKGVsOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFfbWF0Y2hlcykge1xuICAgIGNvbnN0IGVsUHJvdG8gPSA8YW55PkVsZW1lbnQucHJvdG90eXBlO1xuICAgIF9tYXRjaGVzID0gZWxQcm90by5tYXRjaGVzIHx8IGVsUHJvdG8ubWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgIGVsUHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHwgZWxQcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xuICB9XG4gIHJldHVybiBlbC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUgPyBfbWF0Y2hlcy5jYWxsKGVsLCBzZWxlY3RvcikgOiBmYWxzZTtcbn1cbiJdfQ==