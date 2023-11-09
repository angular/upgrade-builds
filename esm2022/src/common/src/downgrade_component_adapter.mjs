/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ApplicationRef, ChangeDetectorRef, Injector, SimpleChange, Testability, TestabilityRegistry } from '@angular/core';
import { PropertyBinding } from './component_info';
import { $SCOPE } from './constants';
import { cleanData, getTypeName, hookupNgModel, strictEquals } from './util';
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
export class DowngradeComponentAdapter {
    constructor(element, attrs, scope, ngModel, parentInjector, $compile, $parse, componentFactory, wrapCallback) {
        this.element = element;
        this.attrs = attrs;
        this.scope = scope;
        this.ngModel = ngModel;
        this.parentInjector = parentInjector;
        this.$compile = $compile;
        this.$parse = $parse;
        this.componentFactory = componentFactory;
        this.wrapCallback = wrapCallback;
        this.implementsOnChanges = false;
        this.inputChangeCount = 0;
        this.inputChanges = {};
        this.componentScope = scope.$new();
    }
    compileContents() {
        const compiledProjectableNodes = [];
        const projectableNodes = this.groupProjectableNodes();
        const linkFns = projectableNodes.map(nodes => this.$compile(nodes));
        this.element.empty();
        linkFns.forEach(linkFn => {
            linkFn(this.scope, (clone) => {
                compiledProjectableNodes.push(clone);
                this.element.append(clone);
            });
        });
        return compiledProjectableNodes;
    }
    createComponentAndSetup(projectableNodes, manuallyAttachView = false, propagateDigest = true) {
        const component = this.createComponent(projectableNodes);
        this.setupInputs(manuallyAttachView, propagateDigest, component);
        this.setupOutputs(component.componentRef);
        this.registerCleanup(component.componentRef);
        return component.componentRef;
    }
    createComponent(projectableNodes) {
        const providers = [{ provide: $SCOPE, useValue: this.componentScope }];
        const childInjector = Injector.create({ providers: providers, parent: this.parentInjector, name: 'DowngradeComponentAdapter' });
        const componentRef = this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        const viewChangeDetector = componentRef.injector.get(ChangeDetectorRef);
        const changeDetector = componentRef.changeDetectorRef;
        // testability hook is commonly added during component bootstrap in
        // packages/core/src/application_ref.bootstrap()
        // in downgraded application, component creation will take place here as well as adding the
        // testability hook.
        const testability = componentRef.injector.get(Testability, null);
        if (testability) {
            componentRef.injector.get(TestabilityRegistry)
                .registerApplication(componentRef.location.nativeElement, testability);
        }
        hookupNgModel(this.ngModel, componentRef.instance);
        return { viewChangeDetector, componentRef, changeDetector };
    }
    setupInputs(manuallyAttachView, propagateDigest = true, { componentRef, changeDetector, viewChangeDetector }) {
        const attrs = this.attrs;
        const inputs = this.componentFactory.inputs || [];
        for (const input of inputs) {
            const inputBinding = new PropertyBinding(input.propName, input.templateName);
            let expr = null;
            if (attrs.hasOwnProperty(inputBinding.attr)) {
                const observeFn = (prop => {
                    let prevValue = INITIAL_VALUE;
                    return (currValue) => {
                        // Initially, both `$observe()` and `$watch()` will call this function.
                        if (!strictEquals(prevValue, currValue)) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            this.updateInput(componentRef, prop, prevValue, currValue);
                            prevValue = currValue;
                        }
                    };
                })(inputBinding.prop);
                attrs.$observe(inputBinding.attr, observeFn);
                // Use `$watch()` (in addition to `$observe()`) in order to initialize the input in time
                // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
                // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
                let unwatch = this.componentScope.$watch(() => {
                    unwatch();
                    unwatch = null;
                    observeFn(attrs[inputBinding.attr]);
                });
            }
            else if (attrs.hasOwnProperty(inputBinding.bindAttr)) {
                expr = attrs[inputBinding.bindAttr];
            }
            else if (attrs.hasOwnProperty(inputBinding.bracketAttr)) {
                expr = attrs[inputBinding.bracketAttr];
            }
            else if (attrs.hasOwnProperty(inputBinding.bindonAttr)) {
                expr = attrs[inputBinding.bindonAttr];
            }
            else if (attrs.hasOwnProperty(inputBinding.bracketParenAttr)) {
                expr = attrs[inputBinding.bracketParenAttr];
            }
            if (expr != null) {
                const watchFn = ((prop) => (currValue, prevValue) => this.updateInput(componentRef, prop, prevValue, currValue))(inputBinding.prop);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        // Invoke `ngOnChanges()` and Change Detection (when necessary)
        const detectChanges = () => changeDetector.detectChanges();
        const prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && prototype.ngOnChanges);
        this.componentScope.$watch(() => this.inputChangeCount, this.wrapCallback(() => {
            // Invoke `ngOnChanges()`
            if (this.implementsOnChanges) {
                const inputChanges = this.inputChanges;
                this.inputChanges = {};
                componentRef.instance.ngOnChanges(inputChanges);
            }
            viewChangeDetector.markForCheck();
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
            let unwatch = this.componentScope.$watch(() => {
                unwatch();
                unwatch = null;
                const appRef = this.parentInjector.get(ApplicationRef);
                appRef.attachView(componentRef.hostView);
            });
        }
    }
    setupOutputs(componentRef) {
        const attrs = this.attrs;
        const outputs = this.componentFactory.outputs || [];
        for (const output of outputs) {
            const outputBindings = new PropertyBinding(output.propName, output.templateName);
            const bindonAttr = outputBindings.bindonAttr.substring(0, outputBindings.bindonAttr.length - 6);
            const bracketParenAttr = `[(${outputBindings.bracketParenAttr.substring(2, outputBindings.bracketParenAttr.length - 8)})]`;
            // order below is important - first update bindings then evaluate expressions
            if (attrs.hasOwnProperty(bindonAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[bindonAttr], true);
            }
            if (attrs.hasOwnProperty(bracketParenAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[bracketParenAttr], true);
            }
            if (attrs.hasOwnProperty(outputBindings.onAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[outputBindings.onAttr]);
            }
            if (attrs.hasOwnProperty(outputBindings.parenAttr)) {
                this.subscribeToOutput(componentRef, outputBindings, attrs[outputBindings.parenAttr]);
            }
        }
    }
    subscribeToOutput(componentRef, output, expr, isAssignment = false) {
        const getter = this.$parse(expr);
        const setter = getter.assign;
        if (isAssignment && !setter) {
            throw new Error(`Expression '${expr}' is not assignable!`);
        }
        const emitter = componentRef.instance[output.prop];
        if (emitter) {
            const subscription = emitter.subscribe({
                next: isAssignment ? (v) => setter(this.scope, v) :
                    (v) => getter(this.scope, { '$event': v })
            });
            componentRef.onDestroy(() => subscription.unsubscribe());
        }
        else {
            throw new Error(`Missing emitter '${output.prop}' on component '${getTypeName(this.componentFactory.componentType)}'!`);
        }
    }
    registerCleanup(componentRef) {
        const testabilityRegistry = componentRef.injector.get(TestabilityRegistry);
        const destroyComponentRef = this.wrapCallback(() => componentRef.destroy());
        let destroyed = false;
        this.element.on('$destroy', () => {
            // The `$destroy` event may have been triggered by the `cleanData()` call in the
            // `componentScope` `$destroy` handler below. In that case, we don't want to call
            // `componentScope.$destroy()` again.
            if (!destroyed)
                this.componentScope.$destroy();
        });
        this.componentScope.$on('$destroy', () => {
            if (!destroyed) {
                destroyed = true;
                testabilityRegistry.unregisterApplication(componentRef.location.nativeElement);
                // The `componentScope` might be getting destroyed, because an ancestor element is being
                // removed/destroyed. If that is the case, jqLite/jQuery would normally invoke `cleanData()`
                // on the removed element and all descendants.
                //   https://github.com/angular/angular.js/blob/2e72ea13fa98bebf6ed4b5e3c45eaf5f990ed16f/src/jqLite.js#L349-L355
                //   https://github.com/jquery/jquery/blob/6984d1747623dbc5e87fd6c261a5b6b1628c107c/src/manipulation.js#L182
                //
                // Here, however, `destroyComponentRef()` may under some circumstances remove the element
                // from the DOM and therefore it will no longer be a descendant of the removed element when
                // `cleanData()` is called. This would result in a memory leak, because the element's data
                // and event handlers (and all objects directly or indirectly referenced by them) would be
                // retained.
                //
                // To ensure the element is always properly cleaned up, we manually call `cleanData()` on
                // this element and its descendants before destroying the `ComponentRef`.
                cleanData(this.element[0]);
                destroyComponentRef();
            }
        });
    }
    updateInput(componentRef, prop, prevValue, currValue) {
        if (this.implementsOnChanges) {
            this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
        }
        this.inputChangeCount++;
        componentRef.instance[prop] = currValue;
    }
    groupProjectableNodes() {
        let ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, this.element.contents());
    }
}
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 */
export function groupNodesBySelector(ngContentSelectors, nodes) {
    const projectableNodes = [];
    for (let i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
        projectableNodes[i] = [];
    }
    for (let j = 0, jj = nodes.length; j < jj; ++j) {
        const node = nodes[j];
        const ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
        if (ngContentIndex != null) {
            projectableNodes[ngContentIndex].push(node);
        }
    }
    return projectableNodes;
}
function findMatchingNgContentIndex(element, ngContentSelectors) {
    const ngContentIndices = [];
    let wildcardNgContentIndex = -1;
    for (let i = 0; i < ngContentSelectors.length; i++) {
        const selector = ngContentSelectors[i];
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
function matchesSelector(el, selector) {
    const elProto = Element.prototype;
    return el.nodeType === Node.ELEMENT_NODE
        // matches is supported by all browsers from 2014 onwards except non-chromium edge
        ?
            (elProto.matches ?? elProto.msMatchesSelector).call(el, selector) :
        false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvdXBncmFkZS9zcmMvY29tbW9uL3NyYy9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBRSxpQkFBaUIsRUFBZ0QsUUFBUSxFQUFhLFlBQVksRUFBaUMsV0FBVyxFQUFFLG1CQUFtQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR2xOLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ25DLE9BQU8sRUFBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFM0UsTUFBTSxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUYsTUFBTSxPQUFPLHlCQUF5QjtJQU1wQyxZQUNZLE9BQXlCLEVBQVUsS0FBa0IsRUFBVSxLQUFhLEVBQzVFLE9BQTJCLEVBQVUsY0FBd0IsRUFDN0QsUUFBeUIsRUFBVSxNQUFxQixFQUN4RCxnQkFBdUMsRUFDdkMsWUFBeUM7UUFKekMsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7UUFBVSxVQUFLLEdBQUwsS0FBSyxDQUFhO1FBQVUsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUM1RSxZQUFPLEdBQVAsT0FBTyxDQUFvQjtRQUFVLG1CQUFjLEdBQWQsY0FBYyxDQUFVO1FBQzdELGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUN4RCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQXVCO1FBQ3ZDLGlCQUFZLEdBQVosWUFBWSxDQUE2QjtRQVY3Qyx3QkFBbUIs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LE1BQU0sUUFBUSxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRSxDQUFDO1lBQ3JCLHNCQUFzQixHQUFHLENBQUMsQ0FBQztRQUM3QixDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksZUFBZSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUN2QyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0IsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBQ0QsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFeEIsSUFBSSxzQkFBc0IsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ2xDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDRCxPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM5RCxDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsRUFBTyxFQUFFLFFBQWdCO0lBQ2hELE1BQU0sT0FBTyxHQUFRLE9BQU8sQ0FBQyxTQUFTLENBQUM7SUFFdkMsT0FBTyxFQUFFLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxZQUFZO1FBQ3BDLGtGQUFrRjtRQUNsRixDQUFDO1lBQ0QsQ0FBQyxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNuRSxLQUFLLENBQUM7QUFDWixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXBwbGljYXRpb25SZWYsIENoYW5nZURldGVjdG9yUmVmLCBDb21wb25lbnRGYWN0b3J5LCBDb21wb25lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5qZWN0b3IsIE9uQ2hhbmdlcywgU2ltcGxlQ2hhbmdlLCBTaW1wbGVDaGFuZ2VzLCBTdGF0aWNQcm92aWRlciwgVGVzdGFiaWxpdHksIFRlc3RhYmlsaXR5UmVnaXN0cnl9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0lBdHRyaWJ1dGVzLCBJQXVnbWVudGVkSlF1ZXJ5LCBJQ29tcGlsZVNlcnZpY2UsIElOZ01vZGVsQ29udHJvbGxlciwgSVBhcnNlU2VydmljZSwgSVNjb3BlfSBmcm9tICcuL2FuZ3VsYXIxJztcbmltcG9ydCB7UHJvcGVydHlCaW5kaW5nfSBmcm9tICcuL2NvbXBvbmVudF9pbmZvJztcbmltcG9ydCB7JFNDT1BFfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2NsZWFuRGF0YSwgZ2V0VHlwZU5hbWUsIGhvb2t1cE5nTW9kZWwsIHN0cmljdEVxdWFsc30gZnJvbSAnLi91dGlsJztcblxuY29uc3QgSU5JVElBTF9WQUxVRSA9IHtcbiAgX19VTklOSVRJQUxJWkVEX186IHRydWVcbn07XG5cbmV4cG9ydCBjbGFzcyBEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyIHtcbiAgcHJpdmF0ZSBpbXBsZW1lbnRzT25DaGFuZ2VzID0gZmFsc2U7XG4gIHByaXZhdGUgaW5wdXRDaGFuZ2VDb3VudDogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZXM6IFNpbXBsZUNoYW5nZXMgPSB7fTtcbiAgcHJpdmF0ZSBjb21wb25lbnRTY29wZTogSVNjb3BlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBlbGVtZW50OiBJQXVnbWVudGVkSlF1ZXJ5LCBwcml2YXRlIGF0dHJzOiBJQXR0cmlidXRlcywgcHJpdmF0ZSBzY29wZTogSVNjb3BlLFxuICAgICAgcHJpdmF0ZSBuZ01vZGVsOiBJTmdNb2RlbENvbnRyb2xsZXIsIHByaXZhdGUgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgcHJpdmF0ZSAkY29tcGlsZTogSUNvbXBpbGVTZXJ2aWNlLCBwcml2YXRlICRwYXJzZTogSVBhcnNlU2VydmljZSxcbiAgICAgIHByaXZhdGUgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+LFxuICAgICAgcHJpdmF0ZSB3cmFwQ2FsbGJhY2s6IDxUPihjYjogKCkgPT4gVCkgPT4gKCkgPT4gVCkge1xuICAgIHRoaXMuY29tcG9uZW50U2NvcGUgPSBzY29wZS4kbmV3KCk7XG4gIH1cblxuICBjb21waWxlQ29udGVudHMoKTogTm9kZVtdW10ge1xuICAgIGNvbnN0IGNvbXBpbGVkUHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSBbXTtcbiAgICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IHRoaXMuZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCk7XG4gICAgY29uc3QgbGlua0ZucyA9IHByb2plY3RhYmxlTm9kZXMubWFwKG5vZGVzID0+IHRoaXMuJGNvbXBpbGUobm9kZXMpKTtcblxuICAgIHRoaXMuZWxlbWVudC5lbXB0eSEoKTtcblxuICAgIGxpbmtGbnMuZm9yRWFjaChsaW5rRm4gPT4ge1xuICAgICAgbGlua0ZuKHRoaXMuc2NvcGUsIChjbG9uZTogTm9kZVtdKSA9PiB7XG4gICAgICAgIGNvbXBpbGVkUHJvamVjdGFibGVOb2Rlcy5wdXNoKGNsb25lKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZCEoY2xvbmUpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzO1xuICB9XG5cbiAgY3JlYXRlQ29tcG9uZW50QW5kU2V0dXAoXG4gICAgICBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSwgbWFudWFsbHlBdHRhY2hWaWV3ID0gZmFsc2UsXG4gICAgICBwcm9wYWdhdGVEaWdlc3QgPSB0cnVlKTogQ29tcG9uZW50UmVmPGFueT4ge1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXMpO1xuICAgIHRoaXMuc2V0dXBJbnB1dHMobWFudWFsbHlBdHRhY2hWaWV3LCBwcm9wYWdhdGVEaWdlc3QsIGNvbXBvbmVudCk7XG4gICAgdGhpcy5zZXR1cE91dHB1dHMoY29tcG9uZW50LmNvbXBvbmVudFJlZik7XG4gICAgdGhpcy5yZWdpc3RlckNsZWFudXAoY29tcG9uZW50LmNvbXBvbmVudFJlZik7XG5cbiAgICByZXR1cm4gY29tcG9uZW50LmNvbXBvbmVudFJlZjtcbiAgfVxuXG4gIHByaXZhdGUgY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdKTogQ29tcG9uZW50SW5mbyB7XG4gICAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW3twcm92aWRlOiAkU0NPUEUsIHVzZVZhbHVlOiB0aGlzLmNvbXBvbmVudFNjb3BlfV07XG4gICAgY29uc3QgY2hpbGRJbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZShcbiAgICAgICAge3Byb3ZpZGVyczogcHJvdmlkZXJzLCBwYXJlbnQ6IHRoaXMucGFyZW50SW5qZWN0b3IsIG5hbWU6ICdEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyJ30pO1xuXG4gICAgY29uc3QgY29tcG9uZW50UmVmID1cbiAgICAgICAgdGhpcy5jb21wb25lbnRGYWN0b3J5LmNyZWF0ZShjaGlsZEluamVjdG9yLCBwcm9qZWN0YWJsZU5vZGVzLCB0aGlzLmVsZW1lbnRbMF0pO1xuICAgIGNvbnN0IHZpZXdDaGFuZ2VEZXRlY3RvciA9IGNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgIGNvbnN0IGNoYW5nZURldGVjdG9yID0gY29tcG9uZW50UmVmLmNoYW5nZURldGVjdG9yUmVmO1xuXG4gICAgLy8gdGVzdGFiaWxpdHkgaG9vayBpcyBjb21tb25seSBhZGRlZCBkdXJpbmcgY29tcG9uZW50IGJvb3RzdHJhcCBpblxuICAgIC8vIHBhY2thZ2VzL2NvcmUvc3JjL2FwcGxpY2F0aW9uX3JlZi5ib290c3RyYXAoKVxuICAgIC8vIGluIGRvd25ncmFkZWQgYXBwbGljYXRpb24sIGNvbXBvbmVudCBjcmVhdGlvbiB3aWxsIHRha2UgcGxhY2UgaGVyZSBhcyB3ZWxsIGFzIGFkZGluZyB0aGVcbiAgICAvLyB0ZXN0YWJpbGl0eSBob29rLlxuICAgIGNvbnN0IHRlc3RhYmlsaXR5ID0gY29tcG9uZW50UmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eSwgbnVsbCk7XG4gICAgaWYgKHRlc3RhYmlsaXR5KSB7XG4gICAgICBjb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5UmVnaXN0cnkpXG4gICAgICAgICAgLnJlZ2lzdGVyQXBwbGljYXRpb24oY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQsIHRlc3RhYmlsaXR5KTtcbiAgICB9XG5cbiAgICBob29rdXBOZ01vZGVsKHRoaXMubmdNb2RlbCwgY29tcG9uZW50UmVmLmluc3RhbmNlKTtcblxuICAgIHJldHVybiB7dmlld0NoYW5nZURldGVjdG9yLCBjb21wb25lbnRSZWYsIGNoYW5nZURldGVjdG9yfTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0dXBJbnB1dHMoXG4gICAgICBtYW51YWxseUF0dGFjaFZpZXc6IGJvb2xlYW4sIHByb3BhZ2F0ZURpZ2VzdCA9IHRydWUsXG4gICAgICB7Y29tcG9uZW50UmVmLCBjaGFuZ2VEZXRlY3Rvciwgdmlld0NoYW5nZURldGVjdG9yfTogQ29tcG9uZW50SW5mbyk6IHZvaWQge1xuICAgIGNvbnN0IGF0dHJzID0gdGhpcy5hdHRycztcbiAgICBjb25zdCBpbnB1dHMgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkuaW5wdXRzIHx8IFtdO1xuICAgIGZvciAoY29uc3QgaW5wdXQgb2YgaW5wdXRzKSB7XG4gICAgICBjb25zdCBpbnB1dEJpbmRpbmcgPSBuZXcgUHJvcGVydHlCaW5kaW5nKGlucHV0LnByb3BOYW1lLCBpbnB1dC50ZW1wbGF0ZU5hbWUpO1xuICAgICAgbGV0IGV4cHI6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0QmluZGluZy5hdHRyKSkge1xuICAgICAgICBjb25zdCBvYnNlcnZlRm4gPSAocHJvcCA9PiB7XG4gICAgICAgICAgbGV0IHByZXZWYWx1ZSA9IElOSVRJQUxfVkFMVUU7XG4gICAgICAgICAgcmV0dXJuIChjdXJyVmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGx5LCBib3RoIGAkb2JzZXJ2ZSgpYCBhbmQgYCR3YXRjaCgpYCB3aWxsIGNhbGwgdGhpcyBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghc3RyaWN0RXF1YWxzKHByZXZWYWx1ZSwgY3VyclZhbHVlKSkge1xuICAgICAgICAgICAgICBpZiAocHJldlZhbHVlID09PSBJTklUSUFMX1ZBTFVFKSB7XG4gICAgICAgICAgICAgICAgcHJldlZhbHVlID0gY3VyclZhbHVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdGhpcy51cGRhdGVJbnB1dChjb21wb25lbnRSZWYsIHByb3AsIHByZXZWYWx1ZSwgY3VyclZhbHVlKTtcbiAgICAgICAgICAgICAgcHJldlZhbHVlID0gY3VyclZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pKGlucHV0QmluZGluZy5wcm9wKTtcbiAgICAgICAgYXR0cnMuJG9ic2VydmUoaW5wdXRCaW5kaW5nLmF0dHIsIG9ic2VydmVGbik7XG5cbiAgICAgICAgLy8gVXNlIGAkd2F0Y2goKWAgKGluIGFkZGl0aW9uIHRvIGAkb2JzZXJ2ZSgpYCkgaW4gb3JkZXIgdG8gaW5pdGlhbGl6ZSB0aGUgaW5wdXQgaW4gdGltZVxuICAgICAgICAvLyBmb3IgYG5nT25DaGFuZ2VzKClgLiBUaGlzIGlzIG5lY2Vzc2FyeSBpZiB3ZSBhcmUgYWxyZWFkeSBpbiBhIGAkZGlnZXN0YCwgd2hpY2ggbWVhbnMgdGhhdFxuICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAgKHdoaWNoIGlzIGNhbGxlZCBieSBhIHdhdGNoZXIpIHdpbGwgcnVuIGJlZm9yZSB0aGUgYCRvYnNlcnZlKClgIGNhbGxiYWNrLlxuICAgICAgICBsZXQgdW53YXRjaDogRnVuY3Rpb258bnVsbCA9IHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgICB1bndhdGNoISgpO1xuICAgICAgICAgIHVud2F0Y2ggPSBudWxsO1xuICAgICAgICAgIG9ic2VydmVGbihhdHRyc1tpbnB1dEJpbmRpbmcuYXR0cl0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXRCaW5kaW5nLmJpbmRBdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXRCaW5kaW5nLmJpbmRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXRCaW5kaW5nLmJyYWNrZXRBdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXRCaW5kaW5nLmJyYWNrZXRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXRCaW5kaW5nLmJpbmRvbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dEJpbmRpbmcuYmluZG9uQXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0QmluZGluZy5icmFja2V0UGFyZW5BdHRyKSkge1xuICAgICAgICBleHByID0gYXR0cnNbaW5wdXRCaW5kaW5nLmJyYWNrZXRQYXJlbkF0dHJdO1xuICAgICAgfVxuICAgICAgaWYgKGV4cHIgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCB3YXRjaEZuID1cbiAgICAgICAgICAgICgocHJvcCkgPT4gKGN1cnJWYWx1ZTogdW5rbm93biwgcHJldlZhbHVlOiB1bmtub3duKSA9PlxuICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0KGNvbXBvbmVudFJlZiwgcHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpKShpbnB1dEJpbmRpbmcucHJvcCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKGV4cHIsIHdhdGNoRm4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWAgYW5kIENoYW5nZSBEZXRlY3Rpb24gKHdoZW4gbmVjZXNzYXJ5KVxuICAgIGNvbnN0IGRldGVjdENoYW5nZXMgPSAoKSA9PiBjaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgY29uc3QgcHJvdG90eXBlID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmNvbXBvbmVudFR5cGUucHJvdG90eXBlO1xuICAgIHRoaXMuaW1wbGVtZW50c09uQ2hhbmdlcyA9ICEhKHByb3RvdHlwZSAmJiAoPE9uQ2hhbmdlcz5wcm90b3R5cGUpLm5nT25DaGFuZ2VzKTtcblxuICAgIHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHRoaXMuaW5wdXRDaGFuZ2VDb3VudCwgdGhpcy53cmFwQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgLy8gSW52b2tlIGBuZ09uQ2hhbmdlcygpYFxuICAgICAgaWYgKHRoaXMuaW1wbGVtZW50c09uQ2hhbmdlcykge1xuICAgICAgICBjb25zdCBpbnB1dENoYW5nZXMgPSB0aGlzLmlucHV0Q2hhbmdlcztcbiAgICAgICAgdGhpcy5pbnB1dENoYW5nZXMgPSB7fTtcbiAgICAgICAgKDxPbkNoYW5nZXM+Y29tcG9uZW50UmVmLmluc3RhbmNlKS5uZ09uQ2hhbmdlcyhpbnB1dENoYW5nZXMpO1xuICAgICAgfVxuXG4gICAgICB2aWV3Q2hhbmdlRGV0ZWN0b3IubWFya0ZvckNoZWNrKCk7XG5cbiAgICAgIC8vIElmIG9wdGVkIG91dCBvZiBwcm9wYWdhdGluZyBkaWdlc3RzLCBpbnZva2UgY2hhbmdlIGRldGVjdGlvbiB3aGVuIGlucHV0cyBjaGFuZ2UuXG4gICAgICBpZiAoIXByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgICBkZXRlY3RDaGFuZ2VzKCk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgLy8gSWYgbm90IG9wdGVkIG91dCBvZiBwcm9wYWdhdGluZyBkaWdlc3RzLCBpbnZva2UgY2hhbmdlIGRldGVjdGlvbiBvbiBldmVyeSBkaWdlc3RcbiAgICBpZiAocHJvcGFnYXRlRGlnZXN0KSB7XG4gICAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCh0aGlzLndyYXBDYWxsYmFjayhkZXRlY3RDaGFuZ2VzKSk7XG4gICAgfVxuXG4gICAgLy8gSWYgbmVjZXNzYXJ5LCBhdHRhY2ggdGhlIHZpZXcgc28gdGhhdCBpdCB3aWxsIGJlIGRpcnR5LWNoZWNrZWQuXG4gICAgLy8gKEFsbG93IHRpbWUgZm9yIHRoZSBpbml0aWFsIGlucHV0IHZhbHVlcyB0byBiZSBzZXQgYW5kIGBuZ09uQ2hhbmdlcygpYCB0byBiZSBjYWxsZWQuKVxuICAgIGlmIChtYW51YWxseUF0dGFjaFZpZXcgfHwgIXByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgbGV0IHVud2F0Y2g6IEZ1bmN0aW9ufG51bGwgPSB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgIHVud2F0Y2ghKCk7XG4gICAgICAgIHVud2F0Y2ggPSBudWxsO1xuXG4gICAgICAgIGNvbnN0IGFwcFJlZiA9IHRoaXMucGFyZW50SW5qZWN0b3IuZ2V0PEFwcGxpY2F0aW9uUmVmPihBcHBsaWNhdGlvblJlZik7XG4gICAgICAgIGFwcFJlZi5hdHRhY2hWaWV3KGNvbXBvbmVudFJlZi5ob3N0Vmlldyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldHVwT3V0cHV0cyhjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KSB7XG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLmF0dHJzO1xuICAgIGNvbnN0IG91dHB1dHMgPSB0aGlzLmNvbXBvbmVudEZhY3Rvcnkub3V0cHV0cyB8fCBbXTtcbiAgICBmb3IgKGNvbnN0IG91dHB1dCBvZiBvdXRwdXRzKSB7XG4gICAgICBjb25zdCBvdXRwdXRCaW5kaW5ncyA9IG5ldyBQcm9wZXJ0eUJpbmRpbmcob3V0cHV0LnByb3BOYW1lLCBvdXRwdXQudGVtcGxhdGVOYW1lKTtcbiAgICAgIGNvbnN0IGJpbmRvbkF0dHIgPVxuICAgICAgICAgIG91dHB1dEJpbmRpbmdzLmJpbmRvbkF0dHIuc3Vic3RyaW5nKDAsIG91dHB1dEJpbmRpbmdzLmJpbmRvbkF0dHIubGVuZ3RoIC0gNik7XG4gICAgICBjb25zdCBicmFja2V0UGFyZW5BdHRyID0gYFsoJHtcbiAgICAgICAgICBvdXRwdXRCaW5kaW5ncy5icmFja2V0UGFyZW5BdHRyLnN1YnN0cmluZyhcbiAgICAgICAgICAgICAgMiwgb3V0cHV0QmluZGluZ3MuYnJhY2tldFBhcmVuQXR0ci5sZW5ndGggLSA4KX0pXWA7XG4gICAgICAvLyBvcmRlciBiZWxvdyBpcyBpbXBvcnRhbnQgLSBmaXJzdCB1cGRhdGUgYmluZGluZ3MgdGhlbiBldmFsdWF0ZSBleHByZXNzaW9uc1xuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJpbmRvbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQoY29tcG9uZW50UmVmLCBvdXRwdXRCaW5kaW5ncywgYXR0cnNbYmluZG9uQXR0cl0sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGJyYWNrZXRQYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQoY29tcG9uZW50UmVmLCBvdXRwdXRCaW5kaW5ncywgYXR0cnNbYnJhY2tldFBhcmVuQXR0cl0sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dEJpbmRpbmdzLm9uQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChjb21wb25lbnRSZWYsIG91dHB1dEJpbmRpbmdzLCBhdHRyc1tvdXRwdXRCaW5kaW5ncy5vbkF0dHJdKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShvdXRwdXRCaW5kaW5ncy5wYXJlbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQoY29tcG9uZW50UmVmLCBvdXRwdXRCaW5kaW5ncywgYXR0cnNbb3V0cHV0QmluZGluZ3MucGFyZW5BdHRyXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVUb091dHB1dChcbiAgICAgIGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT4sIG91dHB1dDogUHJvcGVydHlCaW5kaW5nLCBleHByOiBzdHJpbmcsXG4gICAgICBpc0Fzc2lnbm1lbnQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGdldHRlciA9IHRoaXMuJHBhcnNlKGV4cHIpO1xuICAgIGNvbnN0IHNldHRlciA9IGdldHRlci5hc3NpZ247XG4gICAgaWYgKGlzQXNzaWdubWVudCAmJiAhc2V0dGVyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cHJlc3Npb24gJyR7ZXhwcn0nIGlzIG5vdCBhc3NpZ25hYmxlIWApO1xuICAgIH1cbiAgICBjb25zdCBlbWl0dGVyID0gY29tcG9uZW50UmVmLmluc3RhbmNlW291dHB1dC5wcm9wXSBhcyBFdmVudEVtaXR0ZXI8YW55PjtcbiAgICBpZiAoZW1pdHRlcikge1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gZW1pdHRlci5zdWJzY3JpYmUoe1xuICAgICAgICBuZXh0OiBpc0Fzc2lnbm1lbnQgPyAodjogYW55KSA9PiBzZXR0ZXIhKHRoaXMuc2NvcGUsIHYpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHY6IGFueSkgPT4gZ2V0dGVyKHRoaXMuc2NvcGUsIHsnJGV2ZW50Jzogdn0pXG4gICAgICB9KTtcbiAgICAgIGNvbXBvbmVudFJlZi5vbkRlc3Ryb3koKCkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE1pc3NpbmcgZW1pdHRlciAnJHtvdXRwdXQucHJvcH0nIG9uIGNvbXBvbmVudCAnJHtcbiAgICAgICAgICBnZXRUeXBlTmFtZSh0aGlzLmNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZSl9JyFgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyQ2xlYW51cChjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+KSB7XG4gICAgY29uc3QgdGVzdGFiaWxpdHlSZWdpc3RyeSA9IGNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSk7XG4gICAgY29uc3QgZGVzdHJveUNvbXBvbmVudFJlZiA9IHRoaXMud3JhcENhbGxiYWNrKCgpID0+IGNvbXBvbmVudFJlZi5kZXN0cm95KCkpO1xuICAgIGxldCBkZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuZWxlbWVudC5vbiEoJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgLy8gVGhlIGAkZGVzdHJveWAgZXZlbnQgbWF5IGhhdmUgYmVlbiB0cmlnZ2VyZWQgYnkgdGhlIGBjbGVhbkRhdGEoKWAgY2FsbCBpbiB0aGVcbiAgICAgIC8vIGBjb21wb25lbnRTY29wZWAgYCRkZXN0cm95YCBoYW5kbGVyIGJlbG93LiBJbiB0aGF0IGNhc2UsIHdlIGRvbid0IHdhbnQgdG8gY2FsbFxuICAgICAgLy8gYGNvbXBvbmVudFNjb3BlLiRkZXN0cm95KClgIGFnYWluLlxuICAgICAgaWYgKCFkZXN0cm95ZWQpIHRoaXMuY29tcG9uZW50U2NvcGUuJGRlc3Ryb3koKTtcbiAgICB9KTtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICBpZiAoIWRlc3Ryb3llZCkge1xuICAgICAgICBkZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB0ZXN0YWJpbGl0eVJlZ2lzdHJ5LnVucmVnaXN0ZXJBcHBsaWNhdGlvbihjb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCk7XG5cbiAgICAgICAgLy8gVGhlIGBjb21wb25lbnRTY29wZWAgbWlnaHQgYmUgZ2V0dGluZyBkZXN0cm95ZWQsIGJlY2F1c2UgYW4gYW5jZXN0b3IgZWxlbWVudCBpcyBiZWluZ1xuICAgICAgICAvLyByZW1vdmVkL2Rlc3Ryb3llZC4gSWYgdGhhdCBpcyB0aGUgY2FzZSwganFMaXRlL2pRdWVyeSB3b3VsZCBub3JtYWxseSBpbnZva2UgYGNsZWFuRGF0YSgpYFxuICAgICAgICAvLyBvbiB0aGUgcmVtb3ZlZCBlbGVtZW50IGFuZCBhbGwgZGVzY2VuZGFudHMuXG4gICAgICAgIC8vICAgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzJlNzJlYTEzZmE5OGJlYmY2ZWQ0YjVlM2M0NWVhZjVmOTkwZWQxNmYvc3JjL2pxTGl0ZS5qcyNMMzQ5LUwzNTVcbiAgICAgICAgLy8gICBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iLzY5ODRkMTc0NzYyM2RiYzVlODdmZDZjMjYxYTViNmIxNjI4YzEwN2Mvc3JjL21hbmlwdWxhdGlvbi5qcyNMMTgyXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEhlcmUsIGhvd2V2ZXIsIGBkZXN0cm95Q29tcG9uZW50UmVmKClgIG1heSB1bmRlciBzb21lIGNpcmN1bXN0YW5jZXMgcmVtb3ZlIHRoZSBlbGVtZW50XG4gICAgICAgIC8vIGZyb20gdGhlIERPTSBhbmQgdGhlcmVmb3JlIGl0IHdpbGwgbm8gbG9uZ2VyIGJlIGEgZGVzY2VuZGFudCBvZiB0aGUgcmVtb3ZlZCBlbGVtZW50IHdoZW5cbiAgICAgICAgLy8gYGNsZWFuRGF0YSgpYCBpcyBjYWxsZWQuIFRoaXMgd291bGQgcmVzdWx0IGluIGEgbWVtb3J5IGxlYWssIGJlY2F1c2UgdGhlIGVsZW1lbnQncyBkYXRhXG4gICAgICAgIC8vIGFuZCBldmVudCBoYW5kbGVycyAoYW5kIGFsbCBvYmplY3RzIGRpcmVjdGx5IG9yIGluZGlyZWN0bHkgcmVmZXJlbmNlZCBieSB0aGVtKSB3b3VsZCBiZVxuICAgICAgICAvLyByZXRhaW5lZC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVG8gZW5zdXJlIHRoZSBlbGVtZW50IGlzIGFsd2F5cyBwcm9wZXJseSBjbGVhbmVkIHVwLCB3ZSBtYW51YWxseSBjYWxsIGBjbGVhbkRhdGEoKWAgb25cbiAgICAgICAgLy8gdGhpcyBlbGVtZW50IGFuZCBpdHMgZGVzY2VuZGFudHMgYmVmb3JlIGRlc3Ryb3lpbmcgdGhlIGBDb21wb25lbnRSZWZgLlxuICAgICAgICBjbGVhbkRhdGEodGhpcy5lbGVtZW50WzBdKTtcblxuICAgICAgICBkZXN0cm95Q29tcG9uZW50UmVmKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZUlucHV0KFxuICAgICAgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8YW55PiwgcHJvcDogc3RyaW5nLCBwcmV2VmFsdWU6IGFueSwgY3VyclZhbHVlOiBhbnkpIHtcbiAgICBpZiAodGhpcy5pbXBsZW1lbnRzT25DaGFuZ2VzKSB7XG4gICAgICB0aGlzLmlucHV0Q2hhbmdlc1twcm9wXSA9IG5ldyBTaW1wbGVDaGFuZ2UocHJldlZhbHVlLCBjdXJyVmFsdWUsIHByZXZWYWx1ZSA9PT0gY3VyclZhbHVlKTtcbiAgICB9XG5cbiAgICB0aGlzLmlucHV0Q2hhbmdlQ291bnQrKztcbiAgICBjb21wb25lbnRSZWYuaW5zdGFuY2VbcHJvcF0gPSBjdXJyVmFsdWU7XG4gIH1cblxuICBwcml2YXRlIGdyb3VwUHJvamVjdGFibGVOb2RlcygpIHtcbiAgICBsZXQgbmdDb250ZW50U2VsZWN0b3JzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5Lm5nQ29udGVudFNlbGVjdG9ycztcbiAgICByZXR1cm4gZ3JvdXBOb2Rlc0J5U2VsZWN0b3IobmdDb250ZW50U2VsZWN0b3JzLCB0aGlzLmVsZW1lbnQuY29udGVudHMhKCkpO1xuICB9XG59XG5cbi8qKlxuICogR3JvdXAgYSBzZXQgb2YgRE9NIG5vZGVzIGludG8gYG5nQ29udGVudGAgZ3JvdXBzLCBiYXNlZCBvbiB0aGUgZ2l2ZW4gY29udGVudCBzZWxlY3RvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cE5vZGVzQnlTZWxlY3RvcihuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdLCBub2RlczogTm9kZVtdKTogTm9kZVtdW10ge1xuICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwLCBpaSA9IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkgPCBpaTsgKytpKSB7XG4gICAgcHJvamVjdGFibGVOb2Rlc1tpXSA9IFtdO1xuICB9XG5cbiAgZm9yIChsZXQgaiA9IDAsIGpqID0gbm9kZXMubGVuZ3RoOyBqIDwgamo7ICsraikge1xuICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tqXTtcbiAgICBjb25zdCBuZ0NvbnRlbnRJbmRleCA9IGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KG5vZGUsIG5nQ29udGVudFNlbGVjdG9ycyk7XG4gICAgaWYgKG5nQ29udGVudEluZGV4ICE9IG51bGwpIHtcbiAgICAgIHByb2plY3RhYmxlTm9kZXNbbmdDb250ZW50SW5kZXhdLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByb2plY3RhYmxlTm9kZXM7XG59XG5cbmZ1bmN0aW9uIGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KGVsZW1lbnQ6IGFueSwgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSk6IG51bWJlcnxudWxsIHtcbiAgY29uc3QgbmdDb250ZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgbGV0IHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlciA9IC0xO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gbmdDb250ZW50U2VsZWN0b3JzW2ldO1xuICAgIGlmIChzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gaTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hdGNoZXNTZWxlY3RvcihlbGVtZW50LCBzZWxlY3RvcikpIHtcbiAgICAgICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKGkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBuZ0NvbnRlbnRJbmRpY2VzLnNvcnQoKTtcblxuICBpZiAod2lsZGNhcmROZ0NvbnRlbnRJbmRleCAhPT0gLTEpIHtcbiAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2god2lsZGNhcmROZ0NvbnRlbnRJbmRleCk7XG4gIH1cbiAgcmV0dXJuIG5nQ29udGVudEluZGljZXMubGVuZ3RoID8gbmdDb250ZW50SW5kaWNlc1swXSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIG1hdGNoZXNTZWxlY3RvcihlbDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGVsUHJvdG8gPSA8YW55PkVsZW1lbnQucHJvdG90eXBlO1xuXG4gIHJldHVybiBlbC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREVcbiAgICAgIC8vIG1hdGNoZXMgaXMgc3VwcG9ydGVkIGJ5IGFsbCBicm93c2VycyBmcm9tIDIwMTQgb253YXJkcyBleGNlcHQgbm9uLWNocm9taXVtIGVkZ2VcbiAgICAgID9cbiAgICAgIChlbFByb3RvLm1hdGNoZXMgPz8gZWxQcm90by5tc01hdGNoZXNTZWxlY3RvcikuY2FsbChlbCwgc2VsZWN0b3IpIDpcbiAgICAgIGZhbHNlO1xufVxuXG5pbnRlcmZhY2UgQ29tcG9uZW50SW5mbyB7XG4gIGNvbXBvbmVudFJlZjogQ29tcG9uZW50UmVmPGFueT47XG4gIGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZjtcbiAgdmlld0NoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZjtcbn1cbiJdfQ==