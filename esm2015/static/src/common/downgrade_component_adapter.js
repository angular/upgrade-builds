/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
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
/** @type {?} */
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
export class DowngradeComponentAdapter {
    /**
     * @param {?} element
     * @param {?} attrs
     * @param {?} scope
     * @param {?} ngModel
     * @param {?} parentInjector
     * @param {?} $injector
     * @param {?} $compile
     * @param {?} $parse
     * @param {?} componentFactory
     * @param {?} wrapCallback
     */
    constructor(element, attrs, scope, ngModel, parentInjector, $injector, $compile, $parse, componentFactory, wrapCallback) {
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
    /**
     * @return {?}
     */
    compileContents() {
        /** @type {?} */
        const compiledProjectableNodes = [];
        /** @type {?} */
        const projectableNodes = this.groupProjectableNodes();
        /** @type {?} */
        const linkFns = projectableNodes.map(nodes => this.$compile(nodes));
        (/** @type {?} */ (this.element.empty))();
        linkFns.forEach(linkFn => {
            linkFn(this.scope, (clone) => {
                compiledProjectableNodes.push(clone);
                (/** @type {?} */ (this.element.append))(clone);
            });
        });
        return compiledProjectableNodes;
    }
    /**
     * @param {?} projectableNodes
     * @return {?}
     */
    createComponent(projectableNodes) {
        /** @type {?} */
        const providers = [{ provide: $SCOPE, useValue: this.componentScope }];
        /** @type {?} */
        const childInjector = Injector.create({ providers: providers, parent: this.parentInjector, name: 'DowngradeComponentAdapter' });
        this.componentRef =
            this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
        this.viewChangeDetector = this.componentRef.injector.get(ChangeDetectorRef);
        this.changeDetector = this.componentRef.changeDetectorRef;
        this.component = this.componentRef.instance;
        // testability hook is commonly added during component bootstrap in
        // packages/core/src/application_ref.bootstrap()
        // in downgraded application, component creation will take place here as well as adding the
        // testability hook.
        /** @type {?} */
        const testability = this.componentRef.injector.get(Testability, null);
        if (testability) {
            this.componentRef.injector.get(TestabilityRegistry)
                .registerApplication(this.componentRef.location.nativeElement, testability);
        }
        hookupNgModel(this.ngModel, this.component);
    }
    /**
     * @param {?} needsNgZone
     * @param {?=} propagateDigest
     * @return {?}
     */
    setupInputs(needsNgZone, propagateDigest = true) {
        /** @type {?} */
        const attrs = this.attrs;
        /** @type {?} */
        const inputs = this.componentFactory.inputs || [];
        for (let i = 0; i < inputs.length; i++) {
            /** @type {?} */
            const input = new PropertyBinding(inputs[i].propName, inputs[i].templateName);
            /** @type {?} */
            let expr = null;
            if (attrs.hasOwnProperty(input.attr)) {
                /** @type {?} */
                const observeFn = (prop => {
                    /** @type {?} */
                    let prevValue = INITIAL_VALUE;
                    return (currValue) => {
                        // Initially, both `$observe()` and `$watch()` will call this function.
                        if (!strictEquals(prevValue, currValue)) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            this.updateInput(prop, prevValue, currValue);
                            prevValue = currValue;
                        }
                    };
                })(input.prop);
                attrs.$observe(input.attr, observeFn);
                // Use `$watch()` (in addition to `$observe()`) in order to initialize the input in time
                // for `ngOnChanges()`. This is necessary if we are already in a `$digest`, which means that
                // `ngOnChanges()` (which is called by a watcher) will run before the `$observe()` callback.
                /** @type {?} */
                let unwatch = this.componentScope.$watch(() => {
                    (/** @type {?} */ (unwatch))();
                    unwatch = null;
                    observeFn(attrs[input.attr]);
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
                /** @type {?} */
                const watchFn = (prop => (currValue, prevValue) => this.updateInput(prop, prevValue, currValue))(input.prop);
                this.componentScope.$watch(expr, watchFn);
            }
        }
        // Invoke `ngOnChanges()` and Change Detection (when necessary)
        /** @type {?} */
        const detectChanges = () => this.changeDetector.detectChanges();
        /** @type {?} */
        const prototype = this.componentFactory.componentType.prototype;
        this.implementsOnChanges = !!(prototype && ((/** @type {?} */ (prototype))).ngOnChanges);
        this.componentScope.$watch(() => this.inputChangeCount, this.wrapCallback(() => {
            // Invoke `ngOnChanges()`
            if (this.implementsOnChanges) {
                /** @type {?} */
                const inputChanges = this.inputChanges;
                this.inputChanges = {};
                ((/** @type {?} */ (this.component))).ngOnChanges((/** @type {?} */ (inputChanges)));
            }
            this.viewChangeDetector.markForCheck();
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
            /** @type {?} */
            let unwatch = this.componentScope.$watch(() => {
                (/** @type {?} */ (unwatch))();
                unwatch = null;
                /** @type {?} */
                const appRef = this.parentInjector.get(ApplicationRef);
                appRef.attachView(this.componentRef.hostView);
            });
        }
    }
    /**
     * @return {?}
     */
    setupOutputs() {
        /** @type {?} */
        const attrs = this.attrs;
        /** @type {?} */
        const outputs = this.componentFactory.outputs || [];
        for (let j = 0; j < outputs.length; j++) {
            /** @type {?} */
            const output = new PropertyBinding(outputs[j].propName, outputs[j].templateName);
            /** @type {?} */
            const bindonAttr = output.bindonAttr.substring(0, output.bindonAttr.length - 6);
            /** @type {?} */
            const bracketParenAttr = `[(${output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8)})]`;
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
    }
    /**
     * @param {?} output
     * @param {?} expr
     * @param {?=} isAssignment
     * @return {?}
     */
    subscribeToOutput(output, expr, isAssignment = false) {
        /** @type {?} */
        const getter = this.$parse(expr);
        /** @type {?} */
        const setter = getter.assign;
        if (isAssignment && !setter) {
            throw new Error(`Expression '${expr}' is not assignable!`);
        }
        /** @type {?} */
        const emitter = (/** @type {?} */ (this.component[output.prop]));
        if (emitter) {
            emitter.subscribe({
                next: isAssignment ? (v) => (/** @type {?} */ (setter))(this.scope, v) :
                    (v) => getter(this.scope, { '$event': v })
            });
        }
        else {
            throw new Error(`Missing emitter '${output.prop}' on component '${getTypeName(this.componentFactory.componentType)}'!`);
        }
    }
    /**
     * @return {?}
     */
    registerCleanup() {
        /** @type {?} */
        const destroyComponentRef = this.wrapCallback(() => this.componentRef.destroy());
        /** @type {?} */
        let destroyed = false;
        (/** @type {?} */ (this.element.on))('$destroy', () => this.componentScope.$destroy());
        this.componentScope.$on('$destroy', () => {
            if (!destroyed) {
                destroyed = true;
                this.componentRef.injector.get(TestabilityRegistry)
                    .unregisterApplication(this.componentRef.location.nativeElement);
                destroyComponentRef();
            }
        });
    }
    /**
     * @return {?}
     */
    getInjector() { return this.componentRef.injector; }
    /**
     * @param {?} prop
     * @param {?} prevValue
     * @param {?} currValue
     * @return {?}
     */
    updateInput(prop, prevValue, currValue) {
        if (this.implementsOnChanges) {
            this.inputChanges[prop] = new SimpleChange(prevValue, currValue, prevValue === currValue);
        }
        this.inputChangeCount++;
        this.component[prop] = currValue;
    }
    /**
     * @return {?}
     */
    groupProjectableNodes() {
        /** @type {?} */
        let ngContentSelectors = this.componentFactory.ngContentSelectors;
        return groupNodesBySelector(ngContentSelectors, (/** @type {?} */ (this.element.contents))());
    }
}
if (false) {
    /** @type {?} */
    DowngradeComponentAdapter.prototype.implementsOnChanges;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.inputChangeCount;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.inputChanges;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.componentScope;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.componentRef;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.component;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.changeDetector;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.viewChangeDetector;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.element;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.attrs;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.scope;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.ngModel;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.parentInjector;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.$injector;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.$compile;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.$parse;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.componentFactory;
    /** @type {?} */
    DowngradeComponentAdapter.prototype.wrapCallback;
}
/**
 * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
 * @param {?} ngContentSelectors
 * @param {?} nodes
 * @return {?}
 */
export function groupNodesBySelector(ngContentSelectors, nodes) {
    /** @type {?} */
    const projectableNodes = [];
    /** @type {?} */
    let wildcardNgContentIndex;
    for (let i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
        projectableNodes[i] = [];
    }
    for (let j = 0, jj = nodes.length; j < jj; ++j) {
        /** @type {?} */
        const node = nodes[j];
        /** @type {?} */
        const ngContentIndex = findMatchingNgContentIndex(node, ngContentSelectors);
        if (ngContentIndex != null) {
            projectableNodes[ngContentIndex].push(node);
        }
    }
    return projectableNodes;
}
/**
 * @param {?} element
 * @param {?} ngContentSelectors
 * @return {?}
 */
function findMatchingNgContentIndex(element, ngContentSelectors) {
    /** @type {?} */
    const ngContentIndices = [];
    /** @type {?} */
    let wildcardNgContentIndex = -1;
    for (let i = 0; i < ngContentSelectors.length; i++) {
        /** @type {?} */
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
/** @type {?} */
let _matches;
/**
 * @param {?} el
 * @param {?} selector
 * @return {?}
 */
function matchesSelector(el, selector) {
    if (!_matches) {
        /** @type {?} */
        const elProto = (/** @type {?} */ (Element.prototype));
        _matches = elProto.matches || elProto.matchesSelector || elProto.mozMatchesSelector ||
            elProto.msMatchesSelector || elProto.oMatchesSelector || elProto.webkitMatchesSelector;
    }
    return el.nodeType === Node.ELEMENT_NODE ? _matches.call(el, selector) : false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmdyYWRlX2NvbXBvbmVudF9hZGFwdGVyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvdXBncmFkZS9zdGF0aWMvc3JjL2NvbW1vbi9kb3duZ3JhZGVfY29tcG9uZW50X2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsY0FBYyxFQUFFLGlCQUFpQixFQUFnRCxRQUFRLEVBQWEsWUFBWSxFQUFpQyxXQUFXLEVBQUUsbUJBQW1CLEVBQU8sTUFBTSxlQUFlLENBQUM7QUFHeE4sT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDbkMsT0FBTyxFQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFDLE1BQU0sUUFBUSxDQUFDOztNQUUxRCxhQUFhLEdBQUc7SUFDcEIsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QjtBQUVELE1BQU0sT0FBTyx5QkFBeUI7Ozs7Ozs7Ozs7Ozs7SUFhcEMsWUFDWSxPQUFpQyxFQUFVLEtBQTBCLEVBQ3JFLEtBQXFCLEVBQVUsT0FBbUMsRUFDbEUsY0FBd0IsRUFBVSxTQUFtQyxFQUNyRSxRQUFpQyxFQUFVLE1BQTZCLEVBQ3hFLGdCQUF1QyxFQUN2QyxZQUF5QztRQUx6QyxZQUFPLEdBQVAsT0FBTyxDQUEwQjtRQUFVLFVBQUssR0FBTCxLQUFLLENBQXFCO1FBQ3JFLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBNEI7UUFDbEUsbUJBQWMsR0FBZCxjQUFjLENBQVU7UUFBVSxjQUFTLEdBQVQsU0FBUyxDQUEwQjtRQUNyRSxhQUFRLEdBQVIsUUFBUSxDQUF5QjtRQUFVLFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQ3hFLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBdUI7UUFDdkMsaUJBQVksR0FBWixZQUFZ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QUFLLENBQUM7QUFDakYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcHBsaWNhdGlvblJlZiwgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudEZhY3RvcnksIENvbXBvbmVudFJlZiwgRXZlbnRFbWl0dGVyLCBJbmplY3RvciwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2UsIFNpbXBsZUNoYW5nZXMsIFN0YXRpY1Byb3ZpZGVyLCBUZXN0YWJpbGl0eSwgVGVzdGFiaWxpdHlSZWdpc3RyeSwgVHlwZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCAqIGFzIGFuZ3VsYXIgZnJvbSAnLi9hbmd1bGFyMSc7XG5pbXBvcnQge1Byb3BlcnR5QmluZGluZ30gZnJvbSAnLi9jb21wb25lbnRfaW5mbyc7XG5pbXBvcnQgeyRTQ09QRX0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtnZXRUeXBlTmFtZSwgaG9va3VwTmdNb2RlbCwgc3RyaWN0RXF1YWxzfSBmcm9tICcuL3V0aWwnO1xuXG5jb25zdCBJTklUSUFMX1ZBTFVFID0ge1xuICBfX1VOSU5JVElBTElaRURfXzogdHJ1ZVxufTtcblxuZXhwb3J0IGNsYXNzIERvd25ncmFkZUNvbXBvbmVudEFkYXB0ZXIge1xuICBwcml2YXRlIGltcGxlbWVudHNPbkNoYW5nZXMgPSBmYWxzZTtcbiAgcHJpdmF0ZSBpbnB1dENoYW5nZUNvdW50OiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGlucHV0Q2hhbmdlczogU2ltcGxlQ2hhbmdlcyA9IHt9O1xuICBwcml2YXRlIGNvbXBvbmVudFNjb3BlOiBhbmd1bGFyLklTY29wZTtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgY29tcG9uZW50UmVmICE6IENvbXBvbmVudFJlZjxhbnk+O1xuICBwcml2YXRlIGNvbXBvbmVudDogYW55O1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3RvciAhOiBDaGFuZ2VEZXRlY3RvclJlZjtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgdmlld0NoYW5nZURldGVjdG9yICE6IENoYW5nZURldGVjdG9yUmVmO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBlbGVtZW50OiBhbmd1bGFyLklBdWdtZW50ZWRKUXVlcnksIHByaXZhdGUgYXR0cnM6IGFuZ3VsYXIuSUF0dHJpYnV0ZXMsXG4gICAgICBwcml2YXRlIHNjb3BlOiBhbmd1bGFyLklTY29wZSwgcHJpdmF0ZSBuZ01vZGVsOiBhbmd1bGFyLklOZ01vZGVsQ29udHJvbGxlcixcbiAgICAgIHByaXZhdGUgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yLCBwcml2YXRlICRpbmplY3RvcjogYW5ndWxhci5JSW5qZWN0b3JTZXJ2aWNlLFxuICAgICAgcHJpdmF0ZSAkY29tcGlsZTogYW5ndWxhci5JQ29tcGlsZVNlcnZpY2UsIHByaXZhdGUgJHBhcnNlOiBhbmd1bGFyLklQYXJzZVNlcnZpY2UsXG4gICAgICBwcml2YXRlIGNvbXBvbmVudEZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55PixcbiAgICAgIHByaXZhdGUgd3JhcENhbGxiYWNrOiA8VD4oY2I6ICgpID0+IFQpID0+ICgpID0+IFQpIHtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlID0gc2NvcGUuJG5ldygpO1xuICB9XG5cbiAgY29tcGlsZUNvbnRlbnRzKCk6IE5vZGVbXVtdIHtcbiAgICBjb25zdCBjb21waWxlZFByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdID0gW107XG4gICAgY29uc3QgcHJvamVjdGFibGVOb2RlczogTm9kZVtdW10gPSB0aGlzLmdyb3VwUHJvamVjdGFibGVOb2RlcygpO1xuICAgIGNvbnN0IGxpbmtGbnMgPSBwcm9qZWN0YWJsZU5vZGVzLm1hcChub2RlcyA9PiB0aGlzLiRjb21waWxlKG5vZGVzKSk7XG5cbiAgICB0aGlzLmVsZW1lbnQuZW1wdHkgISgpO1xuXG4gICAgbGlua0Zucy5mb3JFYWNoKGxpbmtGbiA9PiB7XG4gICAgICBsaW5rRm4odGhpcy5zY29wZSwgKGNsb25lOiBOb2RlW10pID0+IHtcbiAgICAgICAgY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzLnB1c2goY2xvbmUpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kICEoY2xvbmUpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY29tcGlsZWRQcm9qZWN0YWJsZU5vZGVzO1xuICB9XG5cbiAgY3JlYXRlQ29tcG9uZW50KHByb2plY3RhYmxlTm9kZXM6IE5vZGVbXVtdKSB7XG4gICAgY29uc3QgcHJvdmlkZXJzOiBTdGF0aWNQcm92aWRlcltdID0gW3twcm92aWRlOiAkU0NPUEUsIHVzZVZhbHVlOiB0aGlzLmNvbXBvbmVudFNjb3BlfV07XG4gICAgY29uc3QgY2hpbGRJbmplY3RvciA9IEluamVjdG9yLmNyZWF0ZShcbiAgICAgICAge3Byb3ZpZGVyczogcHJvdmlkZXJzLCBwYXJlbnQ6IHRoaXMucGFyZW50SW5qZWN0b3IsIG5hbWU6ICdEb3duZ3JhZGVDb21wb25lbnRBZGFwdGVyJ30pO1xuXG4gICAgdGhpcy5jb21wb25lbnRSZWYgPVxuICAgICAgICB0aGlzLmNvbXBvbmVudEZhY3RvcnkuY3JlYXRlKGNoaWxkSW5qZWN0b3IsIHByb2plY3RhYmxlTm9kZXMsIHRoaXMuZWxlbWVudFswXSk7XG4gICAgdGhpcy52aWV3Q2hhbmdlRGV0ZWN0b3IgPSB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3IgPSB0aGlzLmNvbXBvbmVudFJlZi5jaGFuZ2VEZXRlY3RvclJlZjtcbiAgICB0aGlzLmNvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50UmVmLmluc3RhbmNlO1xuXG4gICAgLy8gdGVzdGFiaWxpdHkgaG9vayBpcyBjb21tb25seSBhZGRlZCBkdXJpbmcgY29tcG9uZW50IGJvb3RzdHJhcCBpblxuICAgIC8vIHBhY2thZ2VzL2NvcmUvc3JjL2FwcGxpY2F0aW9uX3JlZi5ib290c3RyYXAoKVxuICAgIC8vIGluIGRvd25ncmFkZWQgYXBwbGljYXRpb24sIGNvbXBvbmVudCBjcmVhdGlvbiB3aWxsIHRha2UgcGxhY2UgaGVyZSBhcyB3ZWxsIGFzIGFkZGluZyB0aGVcbiAgICAvLyB0ZXN0YWJpbGl0eSBob29rLlxuICAgIGNvbnN0IHRlc3RhYmlsaXR5ID0gdGhpcy5jb21wb25lbnRSZWYuaW5qZWN0b3IuZ2V0KFRlc3RhYmlsaXR5LCBudWxsKTtcbiAgICBpZiAodGVzdGFiaWxpdHkpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yLmdldChUZXN0YWJpbGl0eVJlZ2lzdHJ5KVxuICAgICAgICAgIC5yZWdpc3RlckFwcGxpY2F0aW9uKHRoaXMuY29tcG9uZW50UmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQsIHRlc3RhYmlsaXR5KTtcbiAgICB9XG5cbiAgICBob29rdXBOZ01vZGVsKHRoaXMubmdNb2RlbCwgdGhpcy5jb21wb25lbnQpO1xuICB9XG5cbiAgc2V0dXBJbnB1dHMobmVlZHNOZ1pvbmU6IGJvb2xlYW4sIHByb3BhZ2F0ZURpZ2VzdCA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cnM7XG4gICAgY29uc3QgaW5wdXRzID0gdGhpcy5jb21wb25lbnRGYWN0b3J5LmlucHV0cyB8fCBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgaW5wdXQgPSBuZXcgUHJvcGVydHlCaW5kaW5nKGlucHV0c1tpXS5wcm9wTmFtZSwgaW5wdXRzW2ldLnRlbXBsYXRlTmFtZSk7XG4gICAgICBsZXQgZXhwcjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYXR0cikpIHtcbiAgICAgICAgY29uc3Qgb2JzZXJ2ZUZuID0gKHByb3AgPT4ge1xuICAgICAgICAgIGxldCBwcmV2VmFsdWUgPSBJTklUSUFMX1ZBTFVFO1xuICAgICAgICAgIHJldHVybiAoY3VyclZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIC8vIEluaXRpYWxseSwgYm90aCBgJG9ic2VydmUoKWAgYW5kIGAkd2F0Y2goKWAgd2lsbCBjYWxsIHRoaXMgZnVuY3Rpb24uXG4gICAgICAgICAgICBpZiAoIXN0cmljdEVxdWFscyhwcmV2VmFsdWUsIGN1cnJWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgaWYgKHByZXZWYWx1ZSA9PT0gSU5JVElBTF9WQUxVRSkge1xuICAgICAgICAgICAgICAgIHByZXZWYWx1ZSA9IGN1cnJWYWx1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpO1xuICAgICAgICAgICAgICBwcmV2VmFsdWUgPSBjdXJyVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSkoaW5wdXQucHJvcCk7XG4gICAgICAgIGF0dHJzLiRvYnNlcnZlKGlucHV0LmF0dHIsIG9ic2VydmVGbik7XG5cbiAgICAgICAgLy8gVXNlIGAkd2F0Y2goKWAgKGluIGFkZGl0aW9uIHRvIGAkb2JzZXJ2ZSgpYCkgaW4gb3JkZXIgdG8gaW5pdGlhbGl6ZSB0aGUgaW5wdXQgaW4gdGltZVxuICAgICAgICAvLyBmb3IgYG5nT25DaGFuZ2VzKClgLiBUaGlzIGlzIG5lY2Vzc2FyeSBpZiB3ZSBhcmUgYWxyZWFkeSBpbiBhIGAkZGlnZXN0YCwgd2hpY2ggbWVhbnMgdGhhdFxuICAgICAgICAvLyBgbmdPbkNoYW5nZXMoKWAgKHdoaWNoIGlzIGNhbGxlZCBieSBhIHdhdGNoZXIpIHdpbGwgcnVuIGJlZm9yZSB0aGUgYCRvYnNlcnZlKClgIGNhbGxiYWNrLlxuICAgICAgICBsZXQgdW53YXRjaDogRnVuY3Rpb258bnVsbCA9IHRoaXMuY29tcG9uZW50U2NvcGUuJHdhdGNoKCgpID0+IHtcbiAgICAgICAgICB1bndhdGNoICEoKTtcbiAgICAgICAgICB1bndhdGNoID0gbnVsbDtcbiAgICAgICAgICBvYnNlcnZlRm4oYXR0cnNbaW5wdXQuYXR0cl0pO1xuICAgICAgICB9KTtcblxuICAgICAgfSBlbHNlIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShpbnB1dC5iaW5kQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJpbmRBdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldEF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5icmFja2V0QXR0cl07XG4gICAgICB9IGVsc2UgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KGlucHV0LmJpbmRvbkF0dHIpKSB7XG4gICAgICAgIGV4cHIgPSBhdHRyc1tpbnB1dC5iaW5kb25BdHRyXTtcbiAgICAgIH0gZWxzZSBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoaW5wdXQuYnJhY2tldFBhcmVuQXR0cikpIHtcbiAgICAgICAgZXhwciA9IGF0dHJzW2lucHV0LmJyYWNrZXRQYXJlbkF0dHJdO1xuICAgICAgfVxuICAgICAgaWYgKGV4cHIgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCB3YXRjaEZuID1cbiAgICAgICAgICAgIChwcm9wID0+IChjdXJyVmFsdWU6IGFueSwgcHJldlZhbHVlOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlSW5wdXQocHJvcCwgcHJldlZhbHVlLCBjdXJyVmFsdWUpKShpbnB1dC5wcm9wKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2goZXhwciwgd2F0Y2hGbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSW52b2tlIGBuZ09uQ2hhbmdlcygpYCBhbmQgQ2hhbmdlIERldGVjdGlvbiAod2hlbiBuZWNlc3NhcnkpXG4gICAgY29uc3QgZGV0ZWN0Q2hhbmdlcyA9ICgpID0+IHRoaXMuY2hhbmdlRGV0ZWN0b3IuZGV0ZWN0Q2hhbmdlcygpO1xuICAgIGNvbnN0IHByb3RvdHlwZSA9IHRoaXMuY29tcG9uZW50RmFjdG9yeS5jb21wb25lbnRUeXBlLnByb3RvdHlwZTtcbiAgICB0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMgPSAhIShwcm90b3R5cGUgJiYgKDxPbkNoYW5nZXM+cHJvdG90eXBlKS5uZ09uQ2hhbmdlcyk7XG5cbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB0aGlzLmlucHV0Q2hhbmdlQ291bnQsIHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHtcbiAgICAgIC8vIEludm9rZSBgbmdPbkNoYW5nZXMoKWBcbiAgICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgICAgY29uc3QgaW5wdXRDaGFuZ2VzID0gdGhpcy5pbnB1dENoYW5nZXM7XG4gICAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzID0ge307XG4gICAgICAgICg8T25DaGFuZ2VzPnRoaXMuY29tcG9uZW50KS5uZ09uQ2hhbmdlcyhpbnB1dENoYW5nZXMgISk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMudmlld0NoYW5nZURldGVjdG9yLm1hcmtGb3JDaGVjaygpO1xuXG4gICAgICAvLyBJZiBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gd2hlbiBpbnB1dHMgY2hhbmdlLlxuICAgICAgaWYgKCFwcm9wYWdhdGVEaWdlc3QpIHtcbiAgICAgICAgZGV0ZWN0Q2hhbmdlcygpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8vIElmIG5vdCBvcHRlZCBvdXQgb2YgcHJvcGFnYXRpbmcgZGlnZXN0cywgaW52b2tlIGNoYW5nZSBkZXRlY3Rpb24gb24gZXZlcnkgZGlnZXN0XG4gICAgaWYgKHByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgdGhpcy5jb21wb25lbnRTY29wZS4kd2F0Y2godGhpcy53cmFwQ2FsbGJhY2soZGV0ZWN0Q2hhbmdlcykpO1xuICAgIH1cblxuICAgIC8vIElmIG5lY2Vzc2FyeSwgYXR0YWNoIHRoZSB2aWV3IHNvIHRoYXQgaXQgd2lsbCBiZSBkaXJ0eS1jaGVja2VkLlxuICAgIC8vIChBbGxvdyB0aW1lIGZvciB0aGUgaW5pdGlhbCBpbnB1dCB2YWx1ZXMgdG8gYmUgc2V0IGFuZCBgbmdPbkNoYW5nZXMoKWAgdG8gYmUgY2FsbGVkLilcbiAgICBpZiAobmVlZHNOZ1pvbmUgfHwgIXByb3BhZ2F0ZURpZ2VzdCkge1xuICAgICAgbGV0IHVud2F0Y2g6IEZ1bmN0aW9ufG51bGwgPSB0aGlzLmNvbXBvbmVudFNjb3BlLiR3YXRjaCgoKSA9PiB7XG4gICAgICAgIHVud2F0Y2ggISgpO1xuICAgICAgICB1bndhdGNoID0gbnVsbDtcblxuICAgICAgICBjb25zdCBhcHBSZWYgPSB0aGlzLnBhcmVudEluamVjdG9yLmdldDxBcHBsaWNhdGlvblJlZj4oQXBwbGljYXRpb25SZWYpO1xuICAgICAgICBhcHBSZWYuYXR0YWNoVmlldyh0aGlzLmNvbXBvbmVudFJlZi5ob3N0Vmlldyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBzZXR1cE91dHB1dHMoKSB7XG4gICAgY29uc3QgYXR0cnMgPSB0aGlzLmF0dHJzO1xuICAgIGNvbnN0IG91dHB1dHMgPSB0aGlzLmNvbXBvbmVudEZhY3Rvcnkub3V0cHV0cyB8fCBbXTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG91dHB1dHMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGNvbnN0IG91dHB1dCA9IG5ldyBQcm9wZXJ0eUJpbmRpbmcob3V0cHV0c1tqXS5wcm9wTmFtZSwgb3V0cHV0c1tqXS50ZW1wbGF0ZU5hbWUpO1xuICAgICAgY29uc3QgYmluZG9uQXR0ciA9IG91dHB1dC5iaW5kb25BdHRyLnN1YnN0cmluZygwLCBvdXRwdXQuYmluZG9uQXR0ci5sZW5ndGggLSA2KTtcbiAgICAgIGNvbnN0IGJyYWNrZXRQYXJlbkF0dHIgPVxuICAgICAgICAgIGBbKCR7b3V0cHV0LmJyYWNrZXRQYXJlbkF0dHIuc3Vic3RyaW5nKDIsIG91dHB1dC5icmFja2V0UGFyZW5BdHRyLmxlbmd0aCAtIDgpfSldYDtcbiAgICAgIC8vIG9yZGVyIGJlbG93IGlzIGltcG9ydGFudCAtIGZpcnN0IHVwZGF0ZSBiaW5kaW5ncyB0aGVuIGV2YWx1YXRlIGV4cHJlc3Npb25zXG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkoYmluZG9uQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW2JpbmRvbkF0dHJdLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGlmIChhdHRycy5oYXNPd25Qcm9wZXJ0eShicmFja2V0UGFyZW5BdHRyKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZVRvT3V0cHV0KG91dHB1dCwgYXR0cnNbYnJhY2tldFBhcmVuQXR0cl0sIHRydWUpO1xuICAgICAgfVxuICAgICAgaWYgKGF0dHJzLmhhc093blByb3BlcnR5KG91dHB1dC5vbkF0dHIpKSB7XG4gICAgICAgIHRoaXMuc3Vic2NyaWJlVG9PdXRwdXQob3V0cHV0LCBhdHRyc1tvdXRwdXQub25BdHRyXSk7XG4gICAgICB9XG4gICAgICBpZiAoYXR0cnMuaGFzT3duUHJvcGVydHkob3V0cHV0LnBhcmVuQXR0cikpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpYmVUb091dHB1dChvdXRwdXQsIGF0dHJzW291dHB1dC5wYXJlbkF0dHJdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN1YnNjcmliZVRvT3V0cHV0KG91dHB1dDogUHJvcGVydHlCaW5kaW5nLCBleHByOiBzdHJpbmcsIGlzQXNzaWdubWVudDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgY29uc3QgZ2V0dGVyID0gdGhpcy4kcGFyc2UoZXhwcik7XG4gICAgY29uc3Qgc2V0dGVyID0gZ2V0dGVyLmFzc2lnbjtcbiAgICBpZiAoaXNBc3NpZ25tZW50ICYmICFzZXR0ZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwcmVzc2lvbiAnJHtleHByfScgaXMgbm90IGFzc2lnbmFibGUhYCk7XG4gICAgfVxuICAgIGNvbnN0IGVtaXR0ZXIgPSB0aGlzLmNvbXBvbmVudFtvdXRwdXQucHJvcF0gYXMgRXZlbnRFbWl0dGVyPGFueT47XG4gICAgaWYgKGVtaXR0ZXIpIHtcbiAgICAgIGVtaXR0ZXIuc3Vic2NyaWJlKHtcbiAgICAgICAgbmV4dDogaXNBc3NpZ25tZW50ID8gKHY6IGFueSkgPT4gc2V0dGVyICEodGhpcy5zY29wZSwgdikgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAodjogYW55KSA9PiBnZXR0ZXIodGhpcy5zY29wZSwgeyckZXZlbnQnOiB2fSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYE1pc3NpbmcgZW1pdHRlciAnJHtvdXRwdXQucHJvcH0nIG9uIGNvbXBvbmVudCAnJHtnZXRUeXBlTmFtZSh0aGlzLmNvbXBvbmVudEZhY3RvcnkuY29tcG9uZW50VHlwZSl9JyFgKTtcbiAgICB9XG4gIH1cblxuICByZWdpc3RlckNsZWFudXAoKSB7XG4gICAgY29uc3QgZGVzdHJveUNvbXBvbmVudFJlZiA9IHRoaXMud3JhcENhbGxiYWNrKCgpID0+IHRoaXMuY29tcG9uZW50UmVmLmRlc3Ryb3koKSk7XG4gICAgbGV0IGRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5lbGVtZW50Lm9uICEoJyRkZXN0cm95JywgKCkgPT4gdGhpcy5jb21wb25lbnRTY29wZS4kZGVzdHJveSgpKTtcbiAgICB0aGlzLmNvbXBvbmVudFNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICBpZiAoIWRlc3Ryb3llZCkge1xuICAgICAgICBkZXN0cm95ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbXBvbmVudFJlZi5pbmplY3Rvci5nZXQoVGVzdGFiaWxpdHlSZWdpc3RyeSlcbiAgICAgICAgICAgIC51bnJlZ2lzdGVyQXBwbGljYXRpb24odGhpcy5jb21wb25lbnRSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCk7XG4gICAgICAgIGRlc3Ryb3lDb21wb25lbnRSZWYoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuY29tcG9uZW50UmVmLmluamVjdG9yOyB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVJbnB1dChwcm9wOiBzdHJpbmcsIHByZXZWYWx1ZTogYW55LCBjdXJyVmFsdWU6IGFueSkge1xuICAgIGlmICh0aGlzLmltcGxlbWVudHNPbkNoYW5nZXMpIHtcbiAgICAgIHRoaXMuaW5wdXRDaGFuZ2VzW3Byb3BdID0gbmV3IFNpbXBsZUNoYW5nZShwcmV2VmFsdWUsIGN1cnJWYWx1ZSwgcHJldlZhbHVlID09PSBjdXJyVmFsdWUpO1xuICAgIH1cblxuICAgIHRoaXMuaW5wdXRDaGFuZ2VDb3VudCsrO1xuICAgIHRoaXMuY29tcG9uZW50W3Byb3BdID0gY3VyclZhbHVlO1xuICB9XG5cbiAgZ3JvdXBQcm9qZWN0YWJsZU5vZGVzKCkge1xuICAgIGxldCBuZ0NvbnRlbnRTZWxlY3RvcnMgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnkubmdDb250ZW50U2VsZWN0b3JzO1xuICAgIHJldHVybiBncm91cE5vZGVzQnlTZWxlY3RvcihuZ0NvbnRlbnRTZWxlY3RvcnMsIHRoaXMuZWxlbWVudC5jb250ZW50cyAhKCkpO1xuICB9XG59XG5cbi8qKlxuICogR3JvdXAgYSBzZXQgb2YgRE9NIG5vZGVzIGludG8gYG5nQ29udGVudGAgZ3JvdXBzLCBiYXNlZCBvbiB0aGUgZ2l2ZW4gY29udGVudCBzZWxlY3RvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cE5vZGVzQnlTZWxlY3RvcihuZ0NvbnRlbnRTZWxlY3RvcnM6IHN0cmluZ1tdLCBub2RlczogTm9kZVtdKTogTm9kZVtdW10ge1xuICBjb25zdCBwcm9qZWN0YWJsZU5vZGVzOiBOb2RlW11bXSA9IFtdO1xuICBsZXQgd2lsZGNhcmROZ0NvbnRlbnRJbmRleDogbnVtYmVyO1xuXG4gIGZvciAobGV0IGkgPSAwLCBpaSA9IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkgPCBpaTsgKytpKSB7XG4gICAgcHJvamVjdGFibGVOb2Rlc1tpXSA9IFtdO1xuICB9XG5cbiAgZm9yIChsZXQgaiA9IDAsIGpqID0gbm9kZXMubGVuZ3RoOyBqIDwgamo7ICsraikge1xuICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tqXTtcbiAgICBjb25zdCBuZ0NvbnRlbnRJbmRleCA9IGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KG5vZGUsIG5nQ29udGVudFNlbGVjdG9ycyk7XG4gICAgaWYgKG5nQ29udGVudEluZGV4ICE9IG51bGwpIHtcbiAgICAgIHByb2plY3RhYmxlTm9kZXNbbmdDb250ZW50SW5kZXhdLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHByb2plY3RhYmxlTm9kZXM7XG59XG5cbmZ1bmN0aW9uIGZpbmRNYXRjaGluZ05nQ29udGVudEluZGV4KGVsZW1lbnQ6IGFueSwgbmdDb250ZW50U2VsZWN0b3JzOiBzdHJpbmdbXSk6IG51bWJlcnxudWxsIHtcbiAgY29uc3QgbmdDb250ZW50SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgbGV0IHdpbGRjYXJkTmdDb250ZW50SW5kZXg6IG51bWJlciA9IC0xO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG5nQ29udGVudFNlbGVjdG9ycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gbmdDb250ZW50U2VsZWN0b3JzW2ldO1xuICAgIGlmIChzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICB3aWxkY2FyZE5nQ29udGVudEluZGV4ID0gaTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKG1hdGNoZXNTZWxlY3RvcihlbGVtZW50LCBzZWxlY3RvcikpIHtcbiAgICAgICAgbmdDb250ZW50SW5kaWNlcy5wdXNoKGkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBuZ0NvbnRlbnRJbmRpY2VzLnNvcnQoKTtcblxuICBpZiAod2lsZGNhcmROZ0NvbnRlbnRJbmRleCAhPT0gLTEpIHtcbiAgICBuZ0NvbnRlbnRJbmRpY2VzLnB1c2god2lsZGNhcmROZ0NvbnRlbnRJbmRleCk7XG4gIH1cbiAgcmV0dXJuIG5nQ29udGVudEluZGljZXMubGVuZ3RoID8gbmdDb250ZW50SW5kaWNlc1swXSA6IG51bGw7XG59XG5cbmxldCBfbWF0Y2hlczogKHRoaXM6IGFueSwgc2VsZWN0b3I6IHN0cmluZykgPT4gYm9vbGVhbjtcblxuZnVuY3Rpb24gbWF0Y2hlc1NlbGVjdG9yKGVsOiBhbnksIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFfbWF0Y2hlcykge1xuICAgIGNvbnN0IGVsUHJvdG8gPSA8YW55PkVsZW1lbnQucHJvdG90eXBlO1xuICAgIF9tYXRjaGVzID0gZWxQcm90by5tYXRjaGVzIHx8IGVsUHJvdG8ubWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ubW96TWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgIGVsUHJvdG8ubXNNYXRjaGVzU2VsZWN0b3IgfHwgZWxQcm90by5vTWF0Y2hlc1NlbGVjdG9yIHx8IGVsUHJvdG8ud2Via2l0TWF0Y2hlc1NlbGVjdG9yO1xuICB9XG4gIHJldHVybiBlbC5ub2RlVHlwZSA9PT0gTm9kZS5FTEVNRU5UX05PREUgPyBfbWF0Y2hlcy5jYWxsKGVsLCBzZWxlY3RvcikgOiBmYWxzZTtcbn1cbiJdfQ==