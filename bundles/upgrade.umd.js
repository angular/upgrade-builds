/**
 * @license Angular v4.0.0-rc.3-77fd91d
 * (c) 2010-2017 Google, Inc. https://angular.io/
 * License: MIT
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/compiler'), require('@angular/platform-browser-dynamic')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/compiler', '@angular/platform-browser-dynamic'], factory) :
    (factory((global.ng = global.ng || {}, global.ng.upgrade = global.ng.upgrade || {}),global.ng.core,global.ng.compiler,global.ng.platformBrowserDynamic));
}(this, function (exports,_angular_core,_angular_compiler,_angular_platformBrowserDynamic) { 'use strict';

    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /**
     * @stable
     */
    var VERSION = new _angular_core.Version('4.0.0-rc.3-77fd91d');
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function noNg() {
        throw new Error('AngularJS v1.x is not loaded!');
    }
    var angular = {
        bootstrap: noNg,
        module: noNg,
        element: noNg,
        version: noNg,
        resumeBootstrap: noNg,
        getTestability: noNg
    };
    try {
        if (window.hasOwnProperty('angular')) {
            angular = window.angular;
        }
    }
    catch (e) {
    }
    var bootstrap = angular.bootstrap;
    var module$1 = angular.module;
    var element = angular.element;
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */ var $COMPILE = '$compile';
    var $CONTROLLER = '$controller';
    var $HTTP_BACKEND = '$httpBackend';
    var $INJECTOR = '$injector';
    var $PARSE = '$parse';
    var $ROOT_SCOPE = '$rootScope';
    var $SCOPE = '$scope';
    var $TEMPLATE_CACHE = '$templateCache';
    var $$TESTABILITY = '$$testability';
    var COMPILER_KEY = '$$angularCompiler';
    var INJECTOR_KEY = '$$angularInjector';
    var NG_ZONE_KEY = '$$angularNgZone';
    var REQUIRE_INJECTOR = '?^^' + INJECTOR_KEY;
    var REQUIRE_NG_MODEL = '?ngModel';
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */ var TagContentType;
    (function (TagContentType) {
        TagContentType[TagContentType["RAW_TEXT"] = 0] = "RAW_TEXT";
        TagContentType[TagContentType["ESCAPABLE_RAW_TEXT"] = 1] = "ESCAPABLE_RAW_TEXT";
        TagContentType[TagContentType["PARSABLE_DATA"] = 2] = "PARSABLE_DATA";
    })(TagContentType || (TagContentType = {}));
    var HtmlTagDefinition = (function () {
        function HtmlTagDefinition(_a) {
            var _b = _a === void 0 ? {} : _a, closedByChildren = _b.closedByChildren, requiredParents = _b.requiredParents, implicitNamespacePrefix = _b.implicitNamespacePrefix, _c = _b.contentType, contentType = _c === void 0 ? TagContentType.PARSABLE_DATA : _c, _d = _b.closedByParent, closedByParent = _d === void 0 ? false : _d, _e = _b.isVoid, isVoid = _e === void 0 ? false : _e, _f = _b.ignoreFirstLf, ignoreFirstLf = _f === void 0 ? false : _f;
            var _this = this;
            this.closedByChildren = {};
            this.closedByParent = false;
            this.canSelfClose = false;
            if (closedByChildren && closedByChildren.length > 0) {
                closedByChildren.forEach(function (tagName) { return _this.closedByChildren[tagName] = true; });
            }
            this.isVoid = isVoid;
            this.closedByParent = closedByParent || isVoid;
            if (requiredParents && requiredParents.length > 0) {
                this.requiredParents = {};
                // The first parent is the list is automatically when none of the listed parents are present
                this.parentToAdd = requiredParents[0];
                requiredParents.forEach(function (tagName) { return _this.requiredParents[tagName] = true; });
            }
            this.implicitNamespacePrefix = implicitNamespacePrefix;
            this.contentType = contentType;
            this.ignoreFirstLf = ignoreFirstLf;
        }
        HtmlTagDefinition.prototype.requireExtraParent = function (currentParent) {
            if (!this.requiredParents) {
                return false;
            }
            if (!currentParent) {
                return true;
            }
            var lcParent = currentParent.toLowerCase();
            var isParentTemplate = lcParent === 'template' || currentParent === 'ng-template';
            return !isParentTemplate && this.requiredParents[lcParent] != true;
        };
        HtmlTagDefinition.prototype.isClosedByChild = function (name) {
            return this.isVoid || name.toLowerCase() in this.closedByChildren;
        };
        return HtmlTagDefinition;
    }());
    // see http://www.w3.org/TR/html51/syntax.html#optional-tags
    // This implementation does not fully conform to the HTML5 spec.
    var TAG_DEFINITIONS = {
        'base': new HtmlTagDefinition({ isVoid: true }),
        'meta': new HtmlTagDefinition({ isVoid: true }),
        'area': new HtmlTagDefinition({ isVoid: true }),
        'embed': new HtmlTagDefinition({ isVoid: true }),
        'link': new HtmlTagDefinition({ isVoid: true }),
        'img': new HtmlTagDefinition({ isVoid: true }),
        'input': new HtmlTagDefinition({ isVoid: true }),
        'param': new HtmlTagDefinition({ isVoid: true }),
        'hr': new HtmlTagDefinition({ isVoid: true }),
        'br': new HtmlTagDefinition({ isVoid: true }),
        'source': new HtmlTagDefinition({ isVoid: true }),
        'track': new HtmlTagDefinition({ isVoid: true }),
        'wbr': new HtmlTagDefinition({ isVoid: true }),
        'p': new HtmlTagDefinition({
            closedByChildren: [
                'address', 'article', 'aside', 'blockquote', 'div', 'dl', 'fieldset', 'footer', 'form',
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr',
                'main', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul'
            ],
            closedByParent: true
        }),
        'thead': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'] }),
        'tbody': new HtmlTagDefinition({ closedByChildren: ['tbody', 'tfoot'], closedByParent: true }),
        'tfoot': new HtmlTagDefinition({ closedByChildren: ['tbody'], closedByParent: true }),
        'tr': new HtmlTagDefinition({
            closedByChildren: ['tr'],
            requiredParents: ['tbody', 'tfoot', 'thead'],
            closedByParent: true
        }),
        'td': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
        'th': new HtmlTagDefinition({ closedByChildren: ['td', 'th'], closedByParent: true }),
        'col': new HtmlTagDefinition({ requiredParents: ['colgroup'], isVoid: true }),
        'svg': new HtmlTagDefinition({ implicitNamespacePrefix: 'svg' }),
        'math': new HtmlTagDefinition({ implicitNamespacePrefix: 'math' }),
        'li': new HtmlTagDefinition({ closedByChildren: ['li'], closedByParent: true }),
        'dt': new HtmlTagDefinition({ closedByChildren: ['dt', 'dd'] }),
        'dd': new HtmlTagDefinition({ closedByChildren: ['dt', 'dd'], closedByParent: true }),
        'rb': new HtmlTagDefinition({ closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true }),
        'rt': new HtmlTagDefinition({ closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true }),
        'rtc': new HtmlTagDefinition({ closedByChildren: ['rb', 'rtc', 'rp'], closedByParent: true }),
        'rp': new HtmlTagDefinition({ closedByChildren: ['rb', 'rt', 'rtc', 'rp'], closedByParent: true }),
        'optgroup': new HtmlTagDefinition({ closedByChildren: ['optgroup'], closedByParent: true }),
        'option': new HtmlTagDefinition({ closedByChildren: ['option', 'optgroup'], closedByParent: true }),
        'pre': new HtmlTagDefinition({ ignoreFirstLf: true }),
        'listing': new HtmlTagDefinition({ ignoreFirstLf: true }),
        'style': new HtmlTagDefinition({ contentType: TagContentType.RAW_TEXT }),
        'script': new HtmlTagDefinition({ contentType: TagContentType.RAW_TEXT }),
        'title': new HtmlTagDefinition({ contentType: TagContentType.ESCAPABLE_RAW_TEXT }),
        'textarea': new HtmlTagDefinition({ contentType: TagContentType.ESCAPABLE_RAW_TEXT, ignoreFirstLf: true }),
    };
    var _DEFAULT_TAG_DEFINITION = new HtmlTagDefinition();
    function getHtmlTagDefinition(tagName) {
        return TAG_DEFINITIONS[tagName.toLowerCase()] || _DEFAULT_TAG_DEFINITION;
    }
    var _SELECTOR_REGEXP = new RegExp('(\\:not\\()|' +
        '([-\\w]+)|' +
        '(?:\\.([-\\w]+))|' +
        // "-" should appear first in the regexp below as FF31 parses "[.-\w]" as a range
        '(?:\\[([-.\\w*]+)(?:=([^\\]]*))?\\])|' +
        '(\\))|' +
        '(\\s*,\\s*)', // ","
    'g');
    /**
     * A css selector contains an element name,
     * css classes and attribute/value pairs with the purpose
     * of selecting subsets out of them.
     */
    var CssSelector = (function () {
        function CssSelector() {
            this.element = null;
            this.classNames = [];
            this.attrs = [];
            this.notSelectors = [];
        }
        CssSelector.parse = function (selector) {
            var results = [];
            var _addResult = function (res, cssSel) {
                if (cssSel.notSelectors.length > 0 && !cssSel.element && cssSel.classNames.length == 0 &&
                    cssSel.attrs.length == 0) {
                    cssSel.element = '*';
                }
                res.push(cssSel);
            };
            var cssSelector = new CssSelector();
            var match;
            var current = cssSelector;
            var inNot = false;
            _SELECTOR_REGEXP.lastIndex = 0;
            while (match = _SELECTOR_REGEXP.exec(selector)) {
                if (match[1]) {
                    if (inNot) {
                        throw new Error('Nesting :not is not allowed in a selector');
                    }
                    inNot = true;
                    current = new CssSelector();
                    cssSelector.notSelectors.push(current);
                }
                if (match[2]) {
                    current.setElement(match[2]);
                }
                if (match[3]) {
                    current.addClassName(match[3]);
                }
                if (match[4]) {
                    current.addAttribute(match[4], match[5]);
                }
                if (match[6]) {
                    inNot = false;
                    current = cssSelector;
                }
                if (match[7]) {
                    if (inNot) {
                        throw new Error('Multiple selectors in :not are not supported');
                    }
                    _addResult(results, cssSelector);
                    cssSelector = current = new CssSelector();
                }
            }
            _addResult(results, cssSelector);
            return results;
        };
        CssSelector.prototype.isElementSelector = function () {
            return this.hasElementSelector() && this.classNames.length == 0 && this.attrs.length == 0 &&
                this.notSelectors.length === 0;
        };
        CssSelector.prototype.hasElementSelector = function () { return !!this.element; };
        CssSelector.prototype.setElement = function (element) {
            if (element === void 0) {
                element = null;
            }
            this.element = element;
        };
        /** Gets a template string for an element that matches the selector. */
        CssSelector.prototype.getMatchingElementTemplate = function () {
            var tagName = this.element || 'div';
            var classAttr = this.classNames.length > 0 ? " class=\"" + this.classNames.join(' ') + "\"" : '';
            var attrs = '';
            for (var i = 0; i < this.attrs.length; i += 2) {
                var attrName = this.attrs[i];
                var attrValue = this.attrs[i + 1] !== '' ? "=\"" + this.attrs[i + 1] + "\"" : '';
                attrs += " " + attrName + attrValue;
            }
            return getHtmlTagDefinition(tagName).isVoid ? "<" + tagName + classAttr + attrs + "/>" :
                "<" + tagName + classAttr + attrs + "></" + tagName + ">";
        };
        CssSelector.prototype.addAttribute = function (name, value) {
            if (value === void 0) {
                value = '';
            }
            this.attrs.push(name, value && value.toLowerCase() || '');
        };
        CssSelector.prototype.addClassName = function (name) { this.classNames.push(name.toLowerCase()); };
        CssSelector.prototype.toString = function () {
            var res = this.element || '';
            if (this.classNames) {
                this.classNames.forEach(function (klass) { return res += "." + klass; });
            }
            if (this.attrs) {
                for (var i = 0; i < this.attrs.length; i += 2) {
                    var name_1 = this.attrs[i];
                    var value = this.attrs[i + 1];
                    res += "[" + name_1 + (value ? '=' + value : '') + "]";
                }
            }
            this.notSelectors.forEach(function (notSelector) { return res += ":not(" + notSelector + ")"; });
            return res;
        };
        return CssSelector;
    }());
    /**
     * Reads a list of CssSelectors and allows to calculate which ones
     * are contained in a given CssSelector.
     */
    var SelectorMatcher = (function () {
        function SelectorMatcher() {
            this._elementMap = new Map();
            this._elementPartialMap = new Map();
            this._classMap = new Map();
            this._classPartialMap = new Map();
            this._attrValueMap = new Map();
            this._attrValuePartialMap = new Map();
            this._listContexts = [];
        }
        SelectorMatcher.createNotMatcher = function (notSelectors) {
            var notMatcher = new SelectorMatcher();
            notMatcher.addSelectables(notSelectors, null);
            return notMatcher;
        };
        SelectorMatcher.prototype.addSelectables = function (cssSelectors, callbackCtxt) {
            var listContext = null;
            if (cssSelectors.length > 1) {
                listContext = new SelectorListContext(cssSelectors);
                this._listContexts.push(listContext);
            }
            for (var i = 0; i < cssSelectors.length; i++) {
                this._addSelectable(cssSelectors[i], callbackCtxt, listContext);
            }
        };
        /**
         * Add an object that can be found later on by calling `match`.
         * @param cssSelector A css selector
         * @param callbackCtxt An opaque object that will be given to the callback of the `match` function
         */
        SelectorMatcher.prototype._addSelectable = function (cssSelector, callbackCtxt, listContext) {
            var matcher = this;
            var element = cssSelector.element;
            var classNames = cssSelector.classNames;
            var attrs = cssSelector.attrs;
            var selectable = new SelectorContext(cssSelector, callbackCtxt, listContext);
            if (element) {
                var isTerminal = attrs.length === 0 && classNames.length === 0;
                if (isTerminal) {
                    this._addTerminal(matcher._elementMap, element, selectable);
                }
                else {
                    matcher = this._addPartial(matcher._elementPartialMap, element);
                }
            }
            if (classNames) {
                for (var i = 0; i < classNames.length; i++) {
                    var isTerminal = attrs.length === 0 && i === classNames.length - 1;
                    var className = classNames[i];
                    if (isTerminal) {
                        this._addTerminal(matcher._classMap, className, selectable);
                    }
                    else {
                        matcher = this._addPartial(matcher._classPartialMap, className);
                    }
                }
            }
            if (attrs) {
                for (var i = 0; i < attrs.length; i += 2) {
                    var isTerminal = i === attrs.length - 2;
                    var name_2 = attrs[i];
                    var value = attrs[i + 1];
                    if (isTerminal) {
                        var terminalMap = matcher._attrValueMap;
                        var terminalValuesMap = terminalMap.get(name_2);
                        if (!terminalValuesMap) {
                            terminalValuesMap = new Map();
                            terminalMap.set(name_2, terminalValuesMap);
                        }
                        this._addTerminal(terminalValuesMap, value, selectable);
                    }
                    else {
                        var partialMap = matcher._attrValuePartialMap;
                        var partialValuesMap = partialMap.get(name_2);
                        if (!partialValuesMap) {
                            partialValuesMap = new Map();
                            partialMap.set(name_2, partialValuesMap);
                        }
                        matcher = this._addPartial(partialValuesMap, value);
                    }
                }
            }
        };
        SelectorMatcher.prototype._addTerminal = function (map, name, selectable) {
            var terminalList = map.get(name);
            if (!terminalList) {
                terminalList = [];
                map.set(name, terminalList);
            }
            terminalList.push(selectable);
        };
        SelectorMatcher.prototype._addPartial = function (map, name) {
            var matcher = map.get(name);
            if (!matcher) {
                matcher = new SelectorMatcher();
                map.set(name, matcher);
            }
            return matcher;
        };
        /**
         * Find the objects that have been added via `addSelectable`
         * whose css selector is contained in the given css selector.
         * @param cssSelector A css selector
         * @param matchedCallback This callback will be called with the object handed into `addSelectable`
         * @return boolean true if a match was found
        */
        SelectorMatcher.prototype.match = function (cssSelector, matchedCallback) {
            var result = false;
            var element = cssSelector.element;
            var classNames = cssSelector.classNames;
            var attrs = cssSelector.attrs;
            for (var i = 0; i < this._listContexts.length; i++) {
                this._listContexts[i].alreadyMatched = false;
            }
            result = this._matchTerminal(this._elementMap, element, cssSelector, matchedCallback) || result;
            result = this._matchPartial(this._elementPartialMap, element, cssSelector, matchedCallback) ||
                result;
            if (classNames) {
                for (var i = 0; i < classNames.length; i++) {
                    var className = classNames[i];
                    result =
                        this._matchTerminal(this._classMap, className, cssSelector, matchedCallback) || result;
                    result =
                        this._matchPartial(this._classPartialMap, className, cssSelector, matchedCallback) ||
                            result;
                }
            }
            if (attrs) {
                for (var i = 0; i < attrs.length; i += 2) {
                    var name_3 = attrs[i];
                    var value = attrs[i + 1];
                    var terminalValuesMap = this._attrValueMap.get(name_3);
                    if (value) {
                        result =
                            this._matchTerminal(terminalValuesMap, '', cssSelector, matchedCallback) || result;
                    }
                    result =
                        this._matchTerminal(terminalValuesMap, value, cssSelector, matchedCallback) || result;
                    var partialValuesMap = this._attrValuePartialMap.get(name_3);
                    if (value) {
                        result = this._matchPartial(partialValuesMap, '', cssSelector, matchedCallback) || result;
                    }
                    result =
                        this._matchPartial(partialValuesMap, value, cssSelector, matchedCallback) || result;
                }
            }
            return result;
        };
        /** @internal */
        SelectorMatcher.prototype._matchTerminal = function (map, name, cssSelector, matchedCallback) {
            if (!map || typeof name !== 'string') {
                return false;
            }
            var selectables = map.get(name) || [];
            var starSelectables = map.get('*');
            if (starSelectables) {
                selectables = selectables.concat(starSelectables);
            }
            if (selectables.length === 0) {
                return false;
            }
            var selectable;
            var result = false;
            for (var i = 0; i < selectables.length; i++) {
                selectable = selectables[i];
                result = selectable.finalize(cssSelector, matchedCallback) || result;
            }
            return result;
        };
        /** @internal */
        SelectorMatcher.prototype._matchPartial = function (map, name, cssSelector, matchedCallback) {
            if (!map || typeof name !== 'string') {
                return false;
            }
            var nestedSelector = map.get(name);
            if (!nestedSelector) {
                return false;
            }
            // TODO(perf): get rid of recursion and measure again
            // TODO(perf): don't pass the whole selector into the recursion,
            // but only the not processed parts
            return nestedSelector.match(cssSelector, matchedCallback);
        };
        return SelectorMatcher;
    }());
    var SelectorListContext = (function () {
        function SelectorListContext(selectors) {
            this.selectors = selectors;
            this.alreadyMatched = false;
        }
        return SelectorListContext;
    }());
    // Store context to pass back selector and context when a selector is matched
    var SelectorContext = (function () {
        function SelectorContext(selector, cbContext, listContext) {
            this.selector = selector;
            this.cbContext = cbContext;
            this.listContext = listContext;
            this.notSelectors = selector.notSelectors;
        }
        SelectorContext.prototype.finalize = function (cssSelector, callback) {
            var result = true;
            if (this.notSelectors.length > 0 && (!this.listContext || !this.listContext.alreadyMatched)) {
                var notMatcher = SelectorMatcher.createNotMatcher(this.notSelectors);
                result = !notMatcher.match(cssSelector, null);
            }
            if (result && callback && (!this.listContext || !this.listContext.alreadyMatched)) {
                if (this.listContext) {
                    this.listContext.alreadyMatched = true;
                }
                callback(this.selector, this.cbContext);
            }
            return result;
        };
        return SelectorContext;
    }());
    /*
     * The following items are copied from the Angular Compiler to be used here
     * without the need to import the entire compiler into the build
     */
    var CLASS_ATTR = 'class';
    function createElementCssSelector(elementName, attributes) {
        var cssSelector = new CssSelector();
        var elNameNoNs = splitNsName(elementName)[1];
        cssSelector.setElement(elNameNoNs);
        for (var i = 0; i < attributes.length; i++) {
            var attrName = attributes[i][0];
            var attrNameNoNs = splitNsName(attrName)[1];
            var attrValue = attributes[i][1];
            cssSelector.addAttribute(attrNameNoNs, attrValue);
            if (attrName.toLowerCase() == CLASS_ATTR) {
                var classes = splitClasses(attrValue);
                classes.forEach(function (className) { return cssSelector.addClassName(className); });
            }
        }
        return cssSelector;
    }
    function splitNsName(elementName) {
        if (elementName[0] != ':') {
            return [null, elementName];
        }
        var colonIndex = elementName.indexOf(':', 1);
        if (colonIndex == -1) {
            throw new Error("Unsupported format \"" + elementName + "\" expecting \":namespace:name\"");
        }
        return [elementName.slice(1, colonIndex), elementName.slice(colonIndex + 1)];
    }
    function splitClasses(classAttrValue) {
        return classAttrValue.trim().split(/\s+/g);
    }
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * A `PropertyBinding` represents a mapping between a property name
     * and an attribute name. It is parsed from a string of the form
     * `"prop: attr"`; or simply `"propAndAttr" where the property
     * and attribute have the same identifier.
     */
    var PropertyBinding = (function () {
        function PropertyBinding(binding) {
            this.binding = binding;
            this.parseBinding();
        }
        PropertyBinding.prototype.parseBinding = function () {
            var parts = this.binding.split(':');
            this.prop = parts[0].trim();
            this.attr = (parts[1] || this.prop).trim();
            this.bracketAttr = "[" + this.attr + "]";
            this.parenAttr = "(" + this.attr + ")";
            this.bracketParenAttr = "[(" + this.attr + ")]";
            var capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.substr(1);
            this.onAttr = "on" + capitalAttr;
            this.bindAttr = "bind" + capitalAttr;
            this.bindonAttr = "bindon" + capitalAttr;
        };
        return PropertyBinding;
    }());
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * This class gives an extension point between the static and dynamic versions
     * of ngUpgrade:
     * * In the static version (this one) we must specify them manually as part of
     *   the call to `downgradeComponent(...)`.
     * * In the dynamic version (`DynamicNgContentSelectorHelper`) we are able to
     *   ask the compiler for the selectors of a component.
     */
    var NgContentSelectorHelper = (function () {
        function NgContentSelectorHelper() {
        }
        NgContentSelectorHelper.prototype.getNgContentSelectors = function (info) {
            // if no selectors are passed then default to a single "wildcard" selector
            return info.selectors || ['*'];
        };
        return NgContentSelectorHelper;
    }());
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function onError(e) {
        // TODO: (misko): We seem to not have a stack trace here!
        if (console.error) {
            console.error(e, e.stack);
        }
        else {
            // tslint:disable-next-line:no-console
            console.log(e, e.stack);
        }
        throw e;
    }
    function controllerKey(name) {
        return '$' + name + 'Controller';
    }
    function getAttributesAsArray(node) {
        var attributes = node.attributes;
        var asArray;
        if (attributes) {
            var attrLen = attributes.length;
            asArray = new Array(attrLen);
            for (var i = 0; i < attrLen; i++) {
                asArray[i] = [attributes[i].nodeName, attributes[i].nodeValue];
            }
        }
        return asArray || [];
    }
    function getComponentName(component) {
        // Return the name of the component or the first line of its stringified version.
        return component.overriddenName || component.name || component.toString().split('\n')[0];
    }
    var Deferred = (function () {
        function Deferred() {
            var _this = this;
            this.promise = new Promise(function (res, rej) {
                _this.resolve = res;
                _this.reject = rej;
            });
        }
        return Deferred;
    }());
    /**
     * @return Whether the passed-in component implements the subset of the
     *     `ControlValueAccessor` interface needed for AngularJS `ng-model`
     *     compatibility.
     */
    function supportsNgModel(component) {
        return typeof component.writeValue === 'function' &&
            typeof component.registerOnChange === 'function';
    }
    /**
     * Glue the AngularJS `NgModelController` (if it exists) to the component
     * (if it implements the needed subset of the `ControlValueAccessor` interface).
     */
    function hookupNgModel(ngModel, component) {
        if (ngModel && supportsNgModel(component)) {
            ngModel.$render = function () { component.writeValue(ngModel.$viewValue); };
            component.registerOnChange(ngModel.$setViewValue.bind(ngModel));
        }
    }
    var INITIAL_VALUE = {
        __UNINITIALIZED__: true
    };
    var DowngradeComponentAdapter = (function () {
        function DowngradeComponentAdapter(id, info, element, attrs, scope, ngModel, parentInjector, $injector, $compile, $parse, componentFactory) {
            this.id = id;
            this.info = info;
            this.element = element;
            this.attrs = attrs;
            this.scope = scope;
            this.ngModel = ngModel;
            this.parentInjector = parentInjector;
            this.$injector = $injector;
            this.$compile = $compile;
            this.$parse = $parse;
            this.componentFactory = componentFactory;
            this.inputChangeCount = 0;
            this.inputChanges = null;
            this.componentRef = null;
            this.component = null;
            this.changeDetector = null;
            this.element[0].id = id;
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
            var childInjector = _angular_core.ReflectiveInjector.resolveAndCreate([{ provide: $SCOPE, useValue: this.componentScope }], this.parentInjector);
            this.componentRef =
                this.componentFactory.create(childInjector, projectableNodes, this.element[0]);
            this.changeDetector = this.componentRef.changeDetectorRef;
            this.component = this.componentRef.instance;
            hookupNgModel(this.ngModel, this.component);
        };
        DowngradeComponentAdapter.prototype.setupInputs = function () {
            var _this = this;
            var attrs = this.attrs;
            var inputs = this.info.inputs || [];
            for (var i = 0; i < inputs.length; i++) {
                var input = new PropertyBinding(inputs[i]);
                var expr = null;
                if (attrs.hasOwnProperty(input.attr)) {
                    var observeFn = (function (prop) {
                        var prevValue = INITIAL_VALUE;
                        return function (currValue) {
                            if (prevValue === INITIAL_VALUE) {
                                prevValue = currValue;
                            }
                            _this.updateInput(prop, prevValue, currValue);
                            prevValue = currValue;
                        };
                    })(input.prop);
                    attrs.$observe(input.attr, observeFn);
                }
                else if (attrs.hasOwnProperty(input.bindAttr)) {
                    expr = attrs /** TODO #9100 */[input.bindAttr];
                }
                else if (attrs.hasOwnProperty(input.bracketAttr)) {
                    expr = attrs /** TODO #9100 */[input.bracketAttr];
                }
                else if (attrs.hasOwnProperty(input.bindonAttr)) {
                    expr = attrs /** TODO #9100 */[input.bindonAttr];
                }
                else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
                    expr = attrs /** TODO #9100 */[input.bracketParenAttr];
                }
                if (expr != null) {
                    var watchFn = (function (prop) {
                        return function (currValue, prevValue) {
                            return _this.updateInput(prop, prevValue, currValue);
                        };
                    })(input.prop);
                    this.componentScope.$watch(expr, watchFn);
                }
            }
            var prototype = this.info.component.prototype;
            if (prototype && prototype.ngOnChanges) {
                // Detect: OnChanges interface
                this.inputChanges = {};
                this.componentScope.$watch(function () { return _this.inputChangeCount; }, function () {
                    var inputChanges = _this.inputChanges;
                    _this.inputChanges = {};
                    _this.component.ngOnChanges(inputChanges);
                });
            }
            this.componentScope.$watch(function () { return _this.changeDetector && _this.changeDetector.detectChanges(); });
        };
        DowngradeComponentAdapter.prototype.setupOutputs = function () {
            var _this = this;
            var attrs = this.attrs;
            var outputs = this.info.outputs || [];
            for (var j = 0; j < outputs.length; j++) {
                var output = new PropertyBinding(outputs[j]);
                var expr = null;
                var assignExpr = false;
                var bindonAttr = output.bindonAttr ? output.bindonAttr.substring(0, output.bindonAttr.length - 6) : null;
                var bracketParenAttr = output.bracketParenAttr ?
                    "[(" + output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8) + ")]" :
                    null;
                if (attrs.hasOwnProperty(output.onAttr)) {
                    expr = attrs /** TODO #9100 */[output.onAttr];
                }
                else if (attrs.hasOwnProperty(output.parenAttr)) {
                    expr = attrs /** TODO #9100 */[output.parenAttr];
                }
                else if (attrs.hasOwnProperty(bindonAttr)) {
                    expr = attrs /** TODO #9100 */[bindonAttr];
                    assignExpr = true;
                }
                else if (attrs.hasOwnProperty(bracketParenAttr)) {
                    expr = attrs /** TODO #9100 */[bracketParenAttr];
                    assignExpr = true;
                }
                if (expr != null && assignExpr != null) {
                    var getter = this.$parse(expr);
                    var setter = getter.assign;
                    if (assignExpr && !setter) {
                        throw new Error("Expression '" + expr + "' is not assignable!");
                    }
                    var emitter = this.component[output.prop];
                    if (emitter) {
                        emitter.subscribe({
                            next: assignExpr ?
                                (function (setter) { return function (v /** TODO #9100 */) { return setter(_this.scope, v); }; })(setter) :
                                (function (getter) {
                                    return function (v /** TODO #9100 */) {
                                        return getter(_this.scope, { $event: v });
                                    };
                                })(getter)
                        });
                    }
                    else {
                        throw new Error("Missing emitter '" + output.prop + "' on component '" + getComponentName(this.info.component) + "'!");
                    }
                }
            }
        };
        DowngradeComponentAdapter.prototype.registerCleanup = function () {
            var _this = this;
            this.element.bind('$destroy', function () {
                _this.componentScope.$destroy();
                _this.componentRef.destroy();
            });
        };
        DowngradeComponentAdapter.prototype.getInjector = function () { return this.componentRef && this.componentRef.injector; };
        DowngradeComponentAdapter.prototype.updateInput = function (prop, prevValue, currValue) {
            if (this.inputChanges) {
                this.inputChangeCount++;
                this.inputChanges[prop] = new _angular_core.SimpleChange(prevValue, currValue, prevValue === currValue);
            }
            this.component[prop] = currValue;
        };
        DowngradeComponentAdapter.prototype.groupProjectableNodes = function () {
            var ngContentSelectorHelper = this.parentInjector.get(NgContentSelectorHelper);
            var ngContentSelectors = ngContentSelectorHelper.getNgContentSelectors(this.info);
            if (!ngContentSelectors) {
                throw new Error('Expecting ngContentSelectors for: ' + getComponentName(this.info.component));
            }
            return this._groupNodesBySelector(ngContentSelectors, this.element.contents());
        };
        /**
         * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
         */
        DowngradeComponentAdapter.prototype._groupNodesBySelector = function (ngContentSelectors, nodes) {
            var projectableNodes = [];
            var matcher = new SelectorMatcher();
            var wildcardNgContentIndex;
            for (var i = 0, ii = ngContentSelectors.length; i < ii; ++i) {
                projectableNodes[i] = [];
                var selector = ngContentSelectors[i];
                if (selector === '*') {
                    wildcardNgContentIndex = i;
                }
                else {
                    matcher.addSelectables(CssSelector.parse(selector), i);
                }
            }
            var _loop_1 = function (j, jj) {
                var ngContentIndices = [];
                var node = nodes[j];
                var selector = createElementCssSelector(node.nodeName.toLowerCase(), getAttributesAsArray(node));
                matcher.match(selector, function (_, index) { return ngContentIndices.push(index); });
                ngContentIndices.sort();
                if (wildcardNgContentIndex !== undefined) {
                    ngContentIndices.push(wildcardNgContentIndex);
                }
                if (ngContentIndices.length) {
                    projectableNodes[ngContentIndices[0]].push(node);
                }
            };
            for (var j = 0, jj = nodes.length; j < jj; ++j) {
                _loop_1(j, jj);
            }
            return projectableNodes;
        };
        return DowngradeComponentAdapter;
    }());
    var downgradeCount = 0;
    /**
     * @whatItDoes
     *
     * *Part of the [upgrade/static](/docs/ts/latest/api/#!?query=upgrade%2Fstatic)
     * library for hybrid upgrade apps that support AoT compilation*
     *
     * Allows an Angular component to be used from AngularJS.
     *
     * @howToUse
     *
     * Let's assume that you have an Angular component called `ng2Heroes` that needs
     * to be made available in AngularJS templates.
     *
     * {@example upgrade/static/ts/module.ts region="ng2-heroes"}
     *
     * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
     * that will make this Angular component available inside AngularJS templates.
     * The `downgradeComponent()` function returns a factory function that we
     * can use to define the AngularJS directive that wraps the "downgraded" component.
     *
     * {@example upgrade/static/ts/module.ts region="ng2-heroes-wrapper"}
     *
     * In this example you can see that we must provide information about the component being
     * "downgraded". This is because once the AoT compiler has run, all metadata about the
     * component has been removed from the code, and so cannot be inferred.
     *
     * We must do the following:
     * * specify the Angular component class that is to be downgraded
     * * specify all inputs and outputs that the AngularJS component expects
     * * specify the selectors used in any `ng-content` elements in the component's template
     *
     * @description
     *
     * A helper function that returns a factory function to be used for registering an
     * AngularJS wrapper directive for "downgrading" an Angular component.
     *
     * The parameter contains information about the Component that is being downgraded:
     *
     * * `component: Type<any>`: The type of the Component that will be downgraded
     * * `inputs: string[]`: A collection of strings that specify what inputs the component accepts
     * * `outputs: string[]`: A collection of strings that specify what outputs the component emits
     * * `selectors: string[]`: A collection of strings that specify what selectors are expected on
     *   `ng-content` elements in the template to enable content projection (a.k.a. transclusion in
     *   AngularJS)
     *
     * The `inputs` and `outputs` are strings that map the names of properties to camelCased
     * attribute names. They are of the form `"prop: attr"`; or simply `"propAndAttr" where the
     * property and attribute have the same identifier.
     *
     * The `selectors` are the values of the `select` attribute of each of the `ng-content` elements
     * that appear in the downgraded component's template.
     * These selectors must be provided in the order that they appear in the template as they are
     * mapped by index to the projected nodes.
     *
     * @experimental
     */
    function downgradeComponent(info) {
        var idPrefix = "NG2_UPGRADE_" + downgradeCount++ + "_";
        var idCount = 0;
        var directiveFactory = function ($compile, $injector, $parse) {
            return {
                restrict: 'E',
                terminal: true,
                require: [REQUIRE_INJECTOR, REQUIRE_NG_MODEL],
                link: function (scope, element, attrs, required) {
                    // We might have to compile the contents asynchronously, because this might have been
                    // triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
                    // been compiled.
                    var parentInjector = required[0] || $injector.get(INJECTOR_KEY);
                    var ngModel = required[1];
                    var downgradeFn = function (injector) {
                        var componentFactoryResolver = injector.get(_angular_core.ComponentFactoryResolver);
                        var componentFactory = componentFactoryResolver.resolveComponentFactory(info.component);
                        if (!componentFactory) {
                            throw new Error('Expecting ComponentFactory for: ' + getComponentName(info.component));
                        }
                        var id = idPrefix + (idCount++);
                        var injectorPromise = new ParentInjectorPromise$1(element);
                        var facade = new DowngradeComponentAdapter(id, info, element, attrs, scope, ngModel, injector, $injector, $compile, $parse, componentFactory);
                        var projectableNodes = facade.compileContents();
                        facade.createComponent(projectableNodes);
                        facade.setupInputs();
                        facade.setupOutputs();
                        facade.registerCleanup();
                        injectorPromise.resolve(facade.getInjector());
                    };
                    if (parentInjector instanceof ParentInjectorPromise$1) {
                        parentInjector.then(downgradeFn);
                    }
                    else {
                        downgradeFn(parentInjector);
                    }
                }
            };
        };
        // bracket-notation because of closure - see #14441
        directiveFactory['$inject'] = [$COMPILE, $INJECTOR, $PARSE];
        return directiveFactory;
    }
    /**
     * Synchronous promise-like object to wrap parent injectors,
     * to preserve the synchronous nature of Angular 1's $compile.
     */
    var ParentInjectorPromise$1 = (function () {
        function ParentInjectorPromise(element) {
            this.element = element;
            this.injectorKey = controllerKey(INJECTOR_KEY);
            this.callbacks = [];
            // Store the promise on the element.
            element.data(this.injectorKey, this);
        }
        ParentInjectorPromise.prototype.then = function (callback) {
            if (this.injector) {
                callback(this.injector);
            }
            else {
                this.callbacks.push(callback);
            }
        };
        ParentInjectorPromise.prototype.resolve = function (injector) {
            this.injector = injector;
            // Store the real injector on the element.
            this.element.data(this.injectorKey, injector);
            // Release the element to prevent memory leaks.
            this.element = null;
            // Run the queued callbacks.
            this.callbacks.forEach(function (callback) { return callback(injector); });
            this.callbacks.length = 0;
        };
        return ParentInjectorPromise;
    }());
    /**
     * @whatItDoes
     *
     * *Part of the [upgrade/static](/docs/ts/latest/api/#!?query=upgrade%2Fstatic)
     * library for hybrid upgrade apps that support AoT compilation*
     *
     * Allow an Angular service to be accessible from AngularJS.
     *
     * @howToUse
     *
     * First ensure that the service to be downgraded is provided in an {@link NgModule}
     * that will be part of the upgrade application. For example, let's assume we have
     * defined `HeroesService`
     *
     * {@example upgrade/static/ts/module.ts region="ng2-heroes-service"}
     *
     * and that we have included this in our upgrade app {@link NgModule}
     *
     * {@example upgrade/static/ts/module.ts region="ng2-module"}
     *
     * Now we can register the `downgradeInjectable` factory function for the service
     * on an AngularJS module.
     *
     * {@example upgrade/static/ts/module.ts region="downgrade-ng2-heroes-service"}
     *
     * Inside an AngularJS component's controller we can get hold of the
     * downgraded service via the name we gave when downgrading.
     *
     * {@example upgrade/static/ts/module.ts region="example-app"}
     *
     * @description
     *
     * Takes a `token` that identifies a service provided from Angular.
     *
     * Returns a [factory function](https://docs.angularjs.org/guide/di) that can be
     * used to register the service on an AngularJS module.
     *
     * The factory function provides access to the Angular service that
     * is identified by the `token` parameter.
     *
     * @experimental
     */
    function downgradeInjectable(token) {
        var factory = function (i) { return i.get(token); };
        factory.$inject = [INJECTOR_KEY];
        return factory;
    }
    /**
     * See `NgContentSelectorHelper` for more information about this class.
     */
    var DynamicNgContentSelectorHelper = (function (_super) {
        __extends(DynamicNgContentSelectorHelper, _super);
        /**
         * @param {?} compiler
         */
        function DynamicNgContentSelectorHelper(compiler) {
            var _this = _super.call(this) || this;
            _this.compiler = compiler;
            return _this;
        }
        /**
         * @param {?} info
         * @return {?}
         */
        DynamicNgContentSelectorHelper.prototype.getNgContentSelectors = function (info) {
            return this.compiler.getNgContentSelectors(info.component);
        };
        return DynamicNgContentSelectorHelper;
    }(NgContentSelectorHelper));
    DynamicNgContentSelectorHelper.decorators = [
        { type: _angular_core.Injectable },
    ];
    /**
     * @nocollapse
     */
    DynamicNgContentSelectorHelper.ctorParameters = function () { return [
        { type: _angular_core.Compiler, },
    ]; };
    var /** @type {?} */ CAMEL_CASE = /([A-Z])/g;
    var /** @type {?} */ INITIAL_VALUE$1 = {
        __UNINITIALIZED__: true
    };
    var /** @type {?} */ NOT_SUPPORTED = 'NOT_SUPPORTED';
    var UpgradeNg1ComponentAdapterBuilder = (function () {
        /**
         * @param {?} name
         */
        function UpgradeNg1ComponentAdapterBuilder(name) {
            this.name = name;
            this.inputs = [];
            this.inputsRename = [];
            this.outputs = [];
            this.outputsRename = [];
            this.propertyOutputs = [];
            this.checkProperties = [];
            this.propertyMap = {};
            this.linkFn = null;
            this.directive = null;
            this.$controller = null;
            var selector = name.replace(CAMEL_CASE, function (all /** TODO #9100 */, next) { return '-' + next.toLowerCase(); });
            var self = this;
            this.type =
                _angular_core.Directive({ selector: selector, inputs: this.inputsRename, outputs: this.outputsRename })
                    .Class({
                    constructor: [
                        new _angular_core.Inject($SCOPE), _angular_core.ElementRef,
                        function (scope, elementRef) {
                            return new UpgradeNg1ComponentAdapter(self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                        }
                    ],
                    ngOnInit: function () { },
                    ngOnChanges: function () { },
                    ngDoCheck: function () { },
                    ngOnDestroy: function () { },
                });
        }
        /**
         * @param {?} injector
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.prototype.extractDirective = function (injector) {
            var /** @type {?} */ directives = injector.get(this.name + 'Directive');
            if (directives.length > 1) {
                throw new Error('Only support single directive definition for: ' + this.name);
            }
            var /** @type {?} */ directive = directives[0];
            if (directive.replace)
                this.notSupported('replace');
            if (directive.terminal)
                this.notSupported('terminal');
            var /** @type {?} */ link = directive.link;
            if (typeof link == 'object') {
                if (((link)).post)
                    this.notSupported('link.post');
            }
            return directive;
        };
        /**
         * @param {?} feature
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.prototype.notSupported = function (feature) {
            throw new Error("Upgraded directive '" + this.name + "' does not support '" + feature + "'.");
        };
        /**
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = function () {
            var /** @type {?} */ btcIsObject = typeof this.directive.bindToController === 'object';
            if (btcIsObject && Object.keys(this.directive.scope).length) {
                throw new Error("Binding definitions on scope and controller at the same time are not supported.");
            }
            var /** @type {?} */ context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;
            if (typeof context == 'object') {
                for (var /** @type {?} */ name in context) {
                    if (((context)).hasOwnProperty(name)) {
                        var /** @type {?} */ localName = context[name];
                        var /** @type {?} */ type = localName.charAt(0);
                        var /** @type {?} */ typeOptions = localName.charAt(1);
                        localName = typeOptions === '?' ? localName.substr(2) : localName.substr(1);
                        localName = localName || name;
                        var /** @type {?} */ outputName = 'output_' + name;
                        var /** @type {?} */ outputNameRename = outputName + ': ' + name;
                        var /** @type {?} */ outputNameRenameChange = outputName + ': ' + name + 'Change';
                        var /** @type {?} */ inputName = 'input_' + name;
                        var /** @type {?} */ inputNameRename = inputName + ': ' + name;
                        switch (type) {
                            case '=':
                                this.propertyOutputs.push(outputName);
                                this.checkProperties.push(localName);
                                this.outputs.push(outputName);
                                this.outputsRename.push(outputNameRenameChange);
                                this.propertyMap[outputName] = localName;
                                this.inputs.push(inputName);
                                this.inputsRename.push(inputNameRename);
                                this.propertyMap[inputName] = localName;
                                break;
                            case '@':
                            // handle the '<' binding of angular 1.5 components
                            case '<':
                                this.inputs.push(inputName);
                                this.inputsRename.push(inputNameRename);
                                this.propertyMap[inputName] = localName;
                                break;
                            case '&':
                                this.outputs.push(outputName);
                                this.outputsRename.push(outputNameRename);
                                this.propertyMap[outputName] = localName;
                                break;
                            default:
                                var /** @type {?} */ json = JSON.stringify(context);
                                throw new Error("Unexpected mapping '" + type + "' in '" + json + "' in '" + this.name + "' directive.");
                        }
                    }
                }
            }
        };
        /**
         * @param {?} compile
         * @param {?} templateCache
         * @param {?} httpBackend
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.prototype.compileTemplate = function (compile, templateCache, httpBackend) {
            var _this = this;
            if (this.directive.template !== undefined) {
                this.linkFn = compileHtml(isFunction(this.directive.template) ? this.directive.template() :
                    this.directive.template);
            }
            else if (this.directive.templateUrl) {
                var /** @type {?} */ url_1 = isFunction(this.directive.templateUrl) ? this.directive.templateUrl() :
                    this.directive.templateUrl;
                var /** @type {?} */ html = templateCache.get(url_1);
                if (html !== undefined) {
                    this.linkFn = compileHtml(html);
                }
                else {
                    return new Promise(function (resolve, err) {
                        httpBackend('GET', url_1, null, function (status /** TODO #9100 */, response /** TODO #9100 */) {
                            if (status == 200) {
                                resolve(_this.linkFn = compileHtml(templateCache.put(url_1, response)));
                            }
                            else {
                                err("GET " + url_1 + " returned " + status + ": " + response);
                            }
                        });
                    });
                }
            }
            else {
                throw new Error("Directive '" + this.name + "' is not a component, it is missing template.");
            }
            return null;
            /**
             * @param {?} html
             * @return {?}
             */
            function compileHtml(html /** TODO #9100 */) {
                var /** @type {?} */ div = document.createElement('div');
                div.innerHTML = html;
                return compile(div.childNodes);
            }
        };
        /**
         * Upgrade ng1 components into Angular.
         * @param {?} exportedComponents
         * @param {?} injector
         * @return {?}
         */
        UpgradeNg1ComponentAdapterBuilder.resolve = function (exportedComponents, injector) {
            var /** @type {?} */ promises = [];
            var /** @type {?} */ compile = injector.get($COMPILE);
            var /** @type {?} */ templateCache = injector.get($TEMPLATE_CACHE);
            var /** @type {?} */ httpBackend = injector.get($HTTP_BACKEND);
            var /** @type {?} */ $controller = injector.get($CONTROLLER);
            for (var /** @type {?} */ name in exportedComponents) {
                if (((exportedComponents)).hasOwnProperty(name)) {
                    var /** @type {?} */ exportedComponent = exportedComponents[name];
                    exportedComponent.directive = exportedComponent.extractDirective(injector);
                    exportedComponent.$controller = $controller;
                    exportedComponent.extractBindings();
                    var /** @type {?} */ promise = exportedComponent.compileTemplate(compile, templateCache, httpBackend);
                    if (promise)
                        promises.push(promise);
                }
            }
            return Promise.all(promises);
        };
        return UpgradeNg1ComponentAdapterBuilder;
    }());
    var UpgradeNg1ComponentAdapter = (function () {
        /**
         * @param {?} linkFn
         * @param {?} scope
         * @param {?} directive
         * @param {?} elementRef
         * @param {?} $controller
         * @param {?} inputs
         * @param {?} outputs
         * @param {?} propOuts
         * @param {?} checkProperties
         * @param {?} propertyMap
         */
        function UpgradeNg1ComponentAdapter(linkFn, scope, directive, elementRef, $controller, inputs, outputs, propOuts, checkProperties, propertyMap) {
            this.linkFn = linkFn;
            this.directive = directive;
            this.$controller = $controller;
            this.inputs = inputs;
            this.outputs = outputs;
            this.propOuts = propOuts;
            this.checkProperties = checkProperties;
            this.propertyMap = propertyMap;
            this.controllerInstance = null;
            this.destinationObj = null;
            this.checkLastValues = [];
            this.$element = null;
            this.element = elementRef.nativeElement;
            this.componentScope = scope.$new(!!directive.scope);
            this.$element = element(this.element);
            var controllerType = directive.controller;
            if (directive.bindToController && controllerType) {
                this.controllerInstance = this.buildController(controllerType);
                this.destinationObj = this.controllerInstance;
            }
            else {
                this.destinationObj = this.componentScope;
            }
            for (var i = 0; i < inputs.length; i++) {
                this /** TODO #9100 */[inputs[i]] = null;
            }
            for (var j = 0; j < outputs.length; j++) {
                var emitter = this /** TODO #9100 */[outputs[j]] = new _angular_core.EventEmitter();
                this.setComponentProperty(outputs[j], (function (emitter /** TODO #9100 */) { return function (value /** TODO #9100 */) { return emitter.emit(value); }; })(emitter));
            }
            for (var k = 0; k < propOuts.length; k++) {
                this /** TODO #9100 */[propOuts[k]] = new _angular_core.EventEmitter();
                this.checkLastValues.push(INITIAL_VALUE$1);
            }
        }
        /**
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.ngOnInit = function () {
            var _this = this;
            if (!this.directive.bindToController && this.directive.controller) {
                this.controllerInstance = this.buildController(this.directive.controller);
            }
            if (this.controllerInstance && isFunction(this.controllerInstance.$onInit)) {
                this.controllerInstance.$onInit();
            }
            var /** @type {?} */ link = this.directive.link;
            if (typeof link == 'object')
                link = ((link)).pre;
            if (link) {
                var /** @type {?} */ attrs = NOT_SUPPORTED;
                var /** @type {?} */ transcludeFn = NOT_SUPPORTED;
                var /** @type {?} */ linkController = this.resolveRequired(this.$element, this.directive.require);
                ((this.directive.link))(this.componentScope, this.$element, attrs, linkController, transcludeFn);
            }
            var /** @type {?} */ childNodes = [];
            var /** @type {?} */ childNode /** TODO #9100 */;
            while (childNode = this.element.firstChild) {
                this.element.removeChild(childNode);
                childNodes.push(childNode);
            }
            this.linkFn(this.componentScope, function (clonedElement, scope) {
                for (var /** @type {?} */ i = 0, /** @type {?} */ ii = clonedElement.length; i < ii; i++) {
                    _this.element.appendChild(clonedElement[i]);
                }
            }, {
                parentBoundTranscludeFn: function (scope /** TODO #9100 */, cloneAttach /** TODO #9100 */) { cloneAttach(childNodes); }
            });
            if (this.controllerInstance && isFunction(this.controllerInstance.$postLink)) {
                this.controllerInstance.$postLink();
            }
        };
        /**
         * @param {?} changes
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.ngOnChanges = function (changes) {
            var _this = this;
            var /** @type {?} */ ng1Changes = {};
            Object.keys(changes).forEach(function (name) {
                var /** @type {?} */ change = changes[name];
                _this.setComponentProperty(name, change.currentValue);
                ng1Changes[_this.propertyMap[name]] = change;
            });
            if (isFunction(this.destinationObj.$onChanges)) {
                this.destinationObj.$onChanges(ng1Changes);
            }
        };
        /**
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.ngDoCheck = function () {
            var /** @type {?} */ destinationObj = this.destinationObj;
            var /** @type {?} */ lastValues = this.checkLastValues;
            var /** @type {?} */ checkProperties = this.checkProperties;
            for (var /** @type {?} */ i = 0; i < checkProperties.length; i++) {
                var /** @type {?} */ value = destinationObj[checkProperties[i]];
                var /** @type {?} */ last = lastValues[i];
                if (value !== last) {
                    if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {
                    }
                    else {
                        var /** @type {?} */ eventEmitter = ((this) /** TODO #9100 */)[this.propOuts[i]];
                        eventEmitter.emit(lastValues[i] = value);
                    }
                }
            }
            if (this.controllerInstance && isFunction(this.controllerInstance.$doCheck)) {
                this.controllerInstance.$doCheck();
            }
        };
        /**
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.ngOnDestroy = function () {
            if (this.controllerInstance && isFunction(this.controllerInstance.$onDestroy)) {
                this.controllerInstance.$onDestroy();
            }
        };
        /**
         * @param {?} name
         * @param {?} value
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function (name, value) {
            this.destinationObj[this.propertyMap[name]] = value;
        };
        /**
         * @param {?} controllerType
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.buildController = function (controllerType /** TODO #9100 */) {
            var /** @type {?} */ locals = { $scope: this.componentScope, $element: this.$element };
            var /** @type {?} */ controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);
            this.$element.data(controllerKey(this.directive.name), controller);
            return controller;
        };
        /**
         * @param {?} $element
         * @param {?} require
         * @return {?}
         */
        UpgradeNg1ComponentAdapter.prototype.resolveRequired = function ($element, require) {
            if (!require) {
                return undefined;
            }
            else if (typeof require == 'string') {
                var /** @type {?} */ name = (require);
                var /** @type {?} */ isOptional = false;
                var /** @type {?} */ startParent = false;
                var /** @type {?} */ searchParents = false;
                if (name.charAt(0) == '?') {
                    isOptional = true;
                    name = name.substr(1);
                }
                if (name.charAt(0) == '^') {
                    searchParents = true;
                    name = name.substr(1);
                }
                if (name.charAt(0) == '^') {
                    startParent = true;
                    name = name.substr(1);
                }
                var /** @type {?} */ key = controllerKey(name);
                if (startParent)
                    $element = $element.parent();
                var /** @type {?} */ dep = searchParents ? $element.inheritedData(key) : $element.data(key);
                if (!dep && !isOptional) {
                    throw new Error("Can not locate '" + require + "' in '" + this.directive.name + "'.");
                }
                return dep;
            }
            else if (require instanceof Array) {
                var /** @type {?} */ deps = [];
                for (var /** @type {?} */ i = 0; i < require.length; i++) {
                    deps.push(this.resolveRequired($element, require[i]));
                }
                return deps;
            }
            throw new Error("Directive '" + this.directive.name + "' require syntax unrecognized: " + this.directive.require);
        };
        return UpgradeNg1ComponentAdapter;
    }());
    /**
     * @param {?} value
     * @return {?}
     */
    function isFunction(value) {
        return typeof value === 'function';
    }
    var /** @type {?} */ upgradeCount = 0;
    /**
     * Use `UpgradeAdapter` to allow AngularJS and Angular to coexist in a single application.
     *
     * The `UpgradeAdapter` allows:
     * 1. creation of Angular component from AngularJS component directive
     *    (See [UpgradeAdapter#upgradeNg1Component()])
     * 2. creation of AngularJS directive from Angular component.
     *    (See [UpgradeAdapter#downgradeNg2Component()])
     * 3. Bootstrapping of a hybrid Angular application which contains both of the frameworks
     *    coexisting in a single application.
     *
     * ## Mental Model
     *
     * When reasoning about how a hybrid application works it is useful to have a mental model which
     * describes what is happening and explains what is happening at the lowest level.
     *
     * 1. There are two independent frameworks running in a single application, each framework treats
     *    the other as a black box.
     * 2. Each DOM element on the page is owned exactly by one framework. Whichever framework
     *    instantiated the element is the owner. Each framework only updates/interacts with its own
     *    DOM elements and ignores others.
     * 3. AngularJS directives always execute inside AngularJS framework codebase regardless of
     *    where they are instantiated.
     * 4. Angular components always execute inside Angular framework codebase regardless of
     *    where they are instantiated.
     * 5. An AngularJS component can be upgraded to an Angular component. This creates an
     *    Angular directive, which bootstraps the AngularJS component directive in that location.
     * 6. An Angular component can be downgraded to an AngularJS component directive. This creates
     *    an AngularJS directive, which bootstraps the Angular component in that location.
     * 7. Whenever an adapter component is instantiated the host element is owned by the framework
     *    doing the instantiation. The other framework then instantiates and owns the view for that
     *    component. This implies that component bindings will always follow the semantics of the
     *    instantiation framework. The syntax is always that of Angular syntax.
     * 8. AngularJS is always bootstrapped first and owns the bottom most view.
     * 9. The new application is running in Angular zone, and therefore it no longer needs calls to
     *    `$apply()`.
     *
     * ### Example
     *
     * ```
     * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module), myCompilerOptions);
     * const module = angular.module('myExample', []);
     * module.directive('ng2Comp', adapter.downgradeNg2Component(Ng2Component));
     *
     * module.directive('ng1Hello', function() {
     *   return {
     *      scope: { title: '=' },
     *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
     *   };
     * });
     *
     *
     * \@Component({
     *   selector: 'ng2-comp',
     *   inputs: ['name'],
     *   template: 'ng2[<ng1-hello [title]="name">transclude</ng1-hello>](<ng-content></ng-content>)',
     *   directives:
     * })
     * class Ng2Component {
     * }
     *
     * \@NgModule({
     *   declarations: [Ng2Component, adapter.upgradeNg1Component('ng1Hello')],
     *   imports: [BrowserModule]
     * })
     * class MyNg2Module {}
     *
     *
     * document.body.innerHTML = '<ng2-comp name="World">project</ng2-comp>';
     *
     * adapter.bootstrap(document.body, ['myExample']).ready(function() {
     *   expect(document.body.textContent).toEqual(
     *       "ng2[ng1[Hello World!](transclude)](project)");
     * });
     *
     * ```
     *
     * \@stable
     */
    var UpgradeAdapter = (function () {
        /**
         * @param {?} ng2AppModule
         * @param {?=} compilerOptions
         */
        function UpgradeAdapter(ng2AppModule, compilerOptions) {
            this.ng2AppModule = ng2AppModule;
            this.compilerOptions = compilerOptions;
            this.idPrefix = "NG2_UPGRADE_" + upgradeCount++ + "_";
            this.directiveResolver = new _angular_compiler.DirectiveResolver();
            this.downgradedComponents = [];
            /**
             * An internal map of ng1 components which need to up upgraded to ng2.
             *
             * We can't upgrade until injector is instantiated and we can retrieve the component metadata.
             * For this reason we keep a list of components to upgrade until ng1 injector is bootstrapped.
             *
             * \@internal
             */
            this.ng1ComponentsToBeUpgraded = {};
            this.upgradedProviders = [];
            this.moduleRef = null;
            if (!ng2AppModule) {
                throw new Error('UpgradeAdapter cannot be instantiated without an NgModule of the Angular app.');
            }
        }
        /**
         * Allows Angular Component to be used from AngularJS.
         *
         * Use `downgradeNg2Component` to create an AngularJS Directive Definition Factory from
         * Angular Component. The adapter will bootstrap Angular component from within the
         * AngularJS template.
         *
         * ## Mental Model
         *
         * 1. The component is instantiated by being listed in AngularJS template. This means that the
         *    host element is controlled by AngularJS, but the component's view will be controlled by
         *    Angular.
         * 2. Even thought the component is instantiated in AngularJS, it will be using Angular
         *    syntax. This has to be done, this way because we must follow Angular components do not
         *    declare how the attributes should be interpreted.
         * 3. `ng-model` is controlled by AngularJS and communicates with the downgraded Angular component
         *    by way of the `ControlValueAccessor` interface from \@angular/forms. Only components that
         *    implement this interface are eligible.
         *
         * ## Supported Features
         *
         * - Bindings:
         *   - Attribute: `<comp name="World">`
         *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
         *   - Expression:  `<comp [name]="username">`
         *   - Event:  `<comp (close)="doSomething()">`
         *   - ng-model: `<comp ng-model="name">`
         * - Content projection: yes
         *
         * ### Example
         *
         * ```
         * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
         * const module = angular.module('myExample', []);
         * module.directive('greet', adapter.downgradeNg2Component(Greeter));
         *
         * \@Component({
         *   selector: 'greet',
         *   template: '{{salutation}} {{name}}! - <ng-content></ng-content>'
         * })
         * class Greeter {
         *   \@Input() salutation: string;
         *   \@Input() name: string;
         * }
         *
         * \@NgModule({
         *   declarations: [Greeter],
         *   imports: [BrowserModule]
         * })
         * class MyNg2Module {}
         *
         * document.body.innerHTML =
         *   'ng1 template: <greet salutation="Hello" [name]="world">text</greet>';
         *
         * adapter.bootstrap(document.body, ['myExample']).ready(function() {
         *   expect(document.body.textContent).toEqual("ng1 template: Hello world! - text");
         * });
         * ```
         * @param {?} component
         * @return {?}
         */
        UpgradeAdapter.prototype.downgradeNg2Component = function (component) {
            this.downgradedComponents.push(component);
            var /** @type {?} */ metadata = this.directiveResolver.resolve(component);
            var /** @type {?} */ info = { component: component, inputs: metadata.inputs, outputs: metadata.outputs };
            return downgradeComponent(info);
        };
        /**
         * Allows AngularJS Component to be used from Angular.
         *
         * Use `upgradeNg1Component` to create an Angular component from AngularJS Component
         * directive. The adapter will bootstrap AngularJS component from within the Angular
         * template.
         *
         * ## Mental Model
         *
         * 1. The component is instantiated by being listed in Angular template. This means that the
         *    host element is controlled by Angular, but the component's view will be controlled by
         *    AngularJS.
         *
         * ## Supported Features
         *
         * - Bindings:
         *   - Attribute: `<comp name="World">`
         *   - Interpolation:  `<comp greeting="Hello {{name}}!">`
         *   - Expression:  `<comp [name]="username">`
         *   - Event:  `<comp (close)="doSomething()">`
         * - Transclusion: yes
         * - Only some of the features of
         *   [Directive Definition Object](https://docs.angularjs.org/api/ng/service/$compile) are
         *   supported:
         *   - `compile`: not supported because the host element is owned by Angular, which does
         *     not allow modifying DOM structure during compilation.
         *   - `controller`: supported. (NOTE: injection of `$attrs` and `$transclude` is not supported.)
         *   - `controllerAs`: supported.
         *   - `bindToController`: supported.
         *   - `link`: supported. (NOTE: only pre-link function is supported.)
         *   - `name`: supported.
         *   - `priority`: ignored.
         *   - `replace`: not supported.
         *   - `require`: supported.
         *   - `restrict`: must be set to 'E'.
         *   - `scope`: supported.
         *   - `template`: supported.
         *   - `templateUrl`: supported.
         *   - `terminal`: ignored.
         *   - `transclude`: supported.
         *
         *
         * ### Example
         *
         * ```
         * const adapter = new UpgradeAdapter(forwardRef(() => MyNg2Module));
         * const module = angular.module('myExample', []);
         *
         * module.directive('greet', function() {
         *   return {
         *     scope: {salutation: '=', name: '=' },
         *     template: '{{salutation}} {{name}}! - <span ng-transclude></span>'
         *   };
         * });
         *
         * module.directive('ng2', adapter.downgradeNg2Component(Ng2Component));
         *
         * \@Component({
         *   selector: 'ng2',
         *   template: 'ng2 template: <greet salutation="Hello" [name]="world">text</greet>'
         * })
         * class Ng2Component {
         * }
         *
         * \@NgModule({
         *   declarations: [Ng2Component, adapter.upgradeNg1Component('greet')],
         *   imports: [BrowserModule]
         * })
         * class MyNg2Module {}
         *
         * document.body.innerHTML = '<ng2></ng2>';
         *
         * adapter.bootstrap(document.body, ['myExample']).ready(function() {
         *   expect(document.body.textContent).toEqual("ng2 template: Hello world! - text");
         * });
         * ```
         * @param {?} name
         * @return {?}
         */
        UpgradeAdapter.prototype.upgradeNg1Component = function (name) {
            if (((this.ng1ComponentsToBeUpgraded)).hasOwnProperty(name)) {
                return this.ng1ComponentsToBeUpgraded[name].type;
            }
            else {
                return (this.ng1ComponentsToBeUpgraded[name] = new UpgradeNg1ComponentAdapterBuilder(name))
                    .type;
            }
        };
        /**
         * Registers the adapter's AngularJS upgrade module for unit testing in AngularJS.
         * Use this instead of `angular.mock.module()` to load the upgrade module into
         * the AngularJS testing injector.
         *
         * ### Example
         *
         * ```
         * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
         *
         * // configure the adapter with upgrade/downgrade components and services
         * upgradeAdapter.downgradeNg2Component(MyComponent);
         *
         * let upgradeAdapterRef: UpgradeAdapterRef;
         * let $compile, $rootScope;
         *
         * // We must register the adapter before any calls to `inject()`
         * beforeEach(() => {
         *   upgradeAdapterRef = upgradeAdapter.registerForNg1Tests(['heroApp']);
         * });
         *
         * beforeEach(inject((_$compile_, _$rootScope_) => {
         *   $compile = _$compile_;
         *   $rootScope = _$rootScope_;
         * }));
         *
         * it("says hello", (done) => {
         *   upgradeAdapterRef.ready(() => {
         *     const element = $compile("<my-component></my-component>")($rootScope);
         *     $rootScope.$apply();
         *     expect(element.html()).toContain("Hello World");
         *     done();
         *   })
         * });
         *
         * ```
         *
         * @param {?=} modules any AngularJS modules that the upgrade module should depend upon
         * @return {?} an {\@link UpgradeAdapterRef}, which lets you register a `ready()` callback to
         * run assertions once the Angular components are ready to test through AngularJS.
         */
        UpgradeAdapter.prototype.registerForNg1Tests = function (modules) {
            var _this = this;
            var /** @type {?} */ windowNgMock = ((window))['angular'].mock;
            if (!windowNgMock || !windowNgMock.module) {
                throw new Error('Failed to find \'angular.mock.module\'.');
            }
            this.declareNg1Module(modules);
            windowNgMock.module(this.ng1Module.name);
            var /** @type {?} */ upgrade = new UpgradeAdapterRef();
            this.ng2BootstrapDeferred.promise.then(function (ng1Injector) { ((upgrade))._bootstrapDone(_this.moduleRef, ng1Injector); }, onError);
            return upgrade;
        };
        /**
         * Bootstrap a hybrid AngularJS / Angular application.
         *
         * This `bootstrap` method is a direct replacement (takes same arguments) for AngularJS
         * [`bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method. Unlike
         * AngularJS, this bootstrap is asynchronous.
         *
         * ### Example
         *
         * ```
         * const adapter = new UpgradeAdapter(MyNg2Module);
         * const module = angular.module('myExample', []);
         * module.directive('ng2', adapter.downgradeNg2Component(Ng2));
         *
         * module.directive('ng1', function() {
         *   return {
         *      scope: { title: '=' },
         *      template: 'ng1[Hello {{title}}!](<span ng-transclude></span>)'
         *   };
         * });
         *
         *
         * \@Component({
         *   selector: 'ng2',
         *   inputs: ['name'],
         *   template: 'ng2[<ng1 [title]="name">transclude</ng1>](<ng-content></ng-content>)'
         * })
         * class Ng2 {
         * }
         *
         * \@NgModule({
         *   declarations: [Ng2, adapter.upgradeNg1Component('ng1')],
         *   imports: [BrowserModule]
         * })
         * class MyNg2Module {}
         *
         * document.body.innerHTML = '<ng2 name="World">project</ng2>';
         *
         * adapter.bootstrap(document.body, ['myExample']).ready(function() {
         *   expect(document.body.textContent).toEqual(
         *       "ng2[ng1[Hello World!](transclude)](project)");
         * });
         * ```
         * @param {?} element
         * @param {?=} modules
         * @param {?=} config
         * @return {?}
         */
        UpgradeAdapter.prototype.bootstrap = function (element$$, modules, config) {
            var _this = this;
            this.declareNg1Module(modules);
            var /** @type {?} */ upgrade = new UpgradeAdapterRef();
            // Make sure resumeBootstrap() only exists if the current bootstrap is deferred
            var /** @type {?} */ windowAngular = ((window) /** TODO #???? */)['angular'];
            windowAngular.resumeBootstrap = undefined;
            this.ngZone.run(function () { bootstrap(element$$, [_this.ng1Module.name], config); });
            var /** @type {?} */ ng1BootstrapPromise = new Promise(function (resolve) {
                if (windowAngular.resumeBootstrap) {
                    var /** @type {?} */ originalResumeBootstrap_1 = windowAngular.resumeBootstrap;
                    windowAngular.resumeBootstrap = function () {
                        windowAngular.resumeBootstrap = originalResumeBootstrap_1;
                        windowAngular.resumeBootstrap.apply(this, arguments);
                        resolve();
                    };
                }
                else {
                    resolve();
                }
            });
            Promise.all([this.ng2BootstrapDeferred.promise, ng1BootstrapPromise]).then(function (_g) {
                var ng1Injector = _g[0];
                element(element$$).data(controllerKey(INJECTOR_KEY), _this.moduleRef.injector);
                _this.moduleRef.injector.get(_angular_core.NgZone).run(function () { ((upgrade))._bootstrapDone(_this.moduleRef, ng1Injector); });
            }, onError);
            return upgrade;
        };
        /**
         * Allows AngularJS service to be accessible from Angular.
         *
         *
         * ### Example
         *
         * ```
         * class Login { ... }
         * class Server { ... }
         *
         * \@Injectable()
         * class Example {
         *   constructor(\@Inject('server') server, login: Login) {
         *     ...
         *   }
         * }
         *
         * const module = angular.module('myExample', []);
         * module.service('server', Server);
         * module.service('login', Login);
         *
         * const adapter = new UpgradeAdapter(MyNg2Module);
         * adapter.upgradeNg1Provider('server');
         * adapter.upgradeNg1Provider('login', {asToken: Login});
         *
         * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
         *   const example: Example = ref.ng2Injector.get(Example);
         * });
         *
         * ```
         * @param {?} name
         * @param {?=} options
         * @return {?}
         */
        UpgradeAdapter.prototype.upgradeNg1Provider = function (name, options) {
            var /** @type {?} */ token = options && options.asToken || name;
            this.upgradedProviders.push({
                provide: token,
                useFactory: function ($injector) { return $injector.get(name); },
                deps: [$INJECTOR]
            });
        };
        /**
         * Allows Angular service to be accessible from AngularJS.
         *
         *
         * ### Example
         *
         * ```
         * class Example {
         * }
         *
         * const adapter = new UpgradeAdapter(MyNg2Module);
         *
         * const module = angular.module('myExample', []);
         * module.factory('example', adapter.downgradeNg2Provider(Example));
         *
         * adapter.bootstrap(document.body, ['myExample']).ready((ref) => {
         *   const example: Example = ref.ng1Injector.get('example');
         * });
         *
         * ```
         * @param {?} token
         * @return {?}
         */
        UpgradeAdapter.prototype.downgradeNg2Provider = function (token) { return downgradeInjectable(token); };
        /**
         * Declare the AngularJS upgrade module for this adapter without bootstrapping the whole
         * hybrid application.
         *
         * This method is automatically called by `bootstrap()` and `registerForNg1Tests()`.
         *
         * @param {?=} modules The AngularJS modules that this upgrade module should depend upon.
         * @return {?} The AngularJS upgrade module that is declared by this method
         *
         * ### Example
         *
         * ```
         * const upgradeAdapter = new UpgradeAdapter(MyNg2Module);
         * upgradeAdapter.declareNg1Module(['heroApp']);
         * ```
         */
        UpgradeAdapter.prototype.declareNg1Module = function (modules) {
            var _this = this;
            if (modules === void 0) { modules = []; }
            var /** @type {?} */ delayApplyExps = [];
            var /** @type {?} */ original$applyFn;
            var /** @type {?} */ rootScopePrototype;
            var /** @type {?} */ rootScope;
            var /** @type {?} */ upgradeAdapter = this;
            var /** @type {?} */ ng1Module = this.ng1Module = module$1(this.idPrefix, modules);
            var /** @type {?} */ platformRef = _angular_platformBrowserDynamic.platformBrowserDynamic();
            this.ngZone = new _angular_core.NgZone({ enableLongStackTrace: Zone.hasOwnProperty('longStackTraceZoneSpec') });
            this.ng2BootstrapDeferred = new Deferred();
            ng1Module.factory(INJECTOR_KEY, function () { return _this.moduleRef.injector.get(_angular_core.Injector); })
                .constant(NG_ZONE_KEY, this.ngZone)
                .factory(COMPILER_KEY, function () { return _this.moduleRef.injector.get(_angular_core.Compiler); })
                .config([
                '$provide', '$injector',
                function (provide, ng1Injector) {
                    provide.decorator($ROOT_SCOPE, [
                        '$delegate',
                        function (rootScopeDelegate) {
                            // Capture the root apply so that we can delay first call to $apply until we
                            // bootstrap Angular and then we replay and restore the $apply.
                            rootScopePrototype = rootScopeDelegate.constructor.prototype;
                            if (rootScopePrototype.hasOwnProperty('$apply')) {
                                original$applyFn = rootScopePrototype.$apply;
                                rootScopePrototype.$apply = function (exp) { return delayApplyExps.push(exp); };
                            }
                            else {
                                throw new Error('Failed to find \'$apply\' on \'$rootScope\'!');
                            }
                            return rootScope = rootScopeDelegate;
                        }
                    ]);
                    if (ng1Injector.has($$TESTABILITY)) {
                        provide.decorator($$TESTABILITY, [
                            '$delegate',
                            function (testabilityDelegate) {
                                var /** @type {?} */ originalWhenStable = testabilityDelegate.whenStable;
                                // Cannot use arrow function below because we need the context
                                var /** @type {?} */ newWhenStable = function (callback) {
                                    originalWhenStable.call(this, function () {
                                        var /** @type {?} */ ng2Testability = upgradeAdapter.moduleRef.injector.get(_angular_core.Testability);
                                        if (ng2Testability.isStable()) {
                                            callback.apply(this, arguments);
                                        }
                                        else {
                                            ng2Testability.whenStable(newWhenStable.bind(this, callback));
                                        }
                                    });
                                };
                                testabilityDelegate.whenStable = newWhenStable;
                                return testabilityDelegate;
                            }
                        ]);
                    }
                }
            ]);
            ng1Module.run([
                '$injector', '$rootScope',
                function (ng1Injector, rootScope) {
                    UpgradeNg1ComponentAdapterBuilder.resolve(_this.ng1ComponentsToBeUpgraded, ng1Injector)
                        .then(function () {
                        // At this point we have ng1 injector and we have lifted ng1 components into ng2, we
                        // now can bootstrap ng2.
                        var /** @type {?} */ DynamicNgUpgradeModule = _angular_core.NgModule({
                            providers: [
                                { provide: $INJECTOR, useFactory: function () { return ng1Injector; } },
                                { provide: $COMPILE, useFactory: function () { return ng1Injector.get($COMPILE); } },
                                { provide: NgContentSelectorHelper, useClass: DynamicNgContentSelectorHelper },
                                _this.upgradedProviders
                            ],
                            imports: [_this.ng2AppModule],
                            entryComponents: _this.downgradedComponents
                        }).Class({
                            constructor: function DynamicNgUpgradeModule() { },
                            ngDoBootstrap: function () { }
                        });
                        ((platformRef))
                            ._bootstrapModuleWithZone(DynamicNgUpgradeModule, _this.compilerOptions, _this.ngZone)
                            .then(function (ref) {
                            _this.moduleRef = ref;
                            _this.ngZone.run(function () {
                                if (rootScopePrototype) {
                                    rootScopePrototype.$apply = original$applyFn; // restore original $apply
                                    while (delayApplyExps.length) {
                                        rootScope.$apply(delayApplyExps.shift());
                                    }
                                    rootScopePrototype = null;
                                }
                            });
                        })
                            .then(function () { return _this.ng2BootstrapDeferred.resolve(ng1Injector); }, onError)
                            .then(function () {
                            var /** @type {?} */ subscription = _this.ngZone.onMicrotaskEmpty.subscribe({ next: function () { return rootScope.$digest(); } });
                            rootScope.$on('$destroy', function () { subscription.unsubscribe(); });
                        });
                    })
                        .catch(function (e) { return _this.ng2BootstrapDeferred.reject(e); });
                }
            ]);
            return ng1Module;
        };
        return UpgradeAdapter;
    }());
    /**
     * Use `UpgradeAdapterRef` to control a hybrid AngularJS / Angular application.
     *
     * \@stable
     */
    var UpgradeAdapterRef = (function () {
        function UpgradeAdapterRef() {
            this._readyFn = null;
            this.ng1RootScope = null;
            this.ng1Injector = null;
            this.ng2ModuleRef = null;
            this.ng2Injector = null;
        }
        /**
         * @param {?} ngModuleRef
         * @param {?} ng1Injector
         * @return {?}
         */
        UpgradeAdapterRef.prototype._bootstrapDone = function (ngModuleRef, ng1Injector) {
            this.ng2ModuleRef = ngModuleRef;
            this.ng2Injector = ngModuleRef.injector;
            this.ng1Injector = ng1Injector;
            this.ng1RootScope = ng1Injector.get($ROOT_SCOPE);
            this._readyFn && this._readyFn(this);
        };
        /**
         * Register a callback function which is notified upon successful hybrid AngularJS / Angular
         * application has been bootstrapped.
         *
         * The `ready` callback function is invoked inside the Angular zone, therefore it does not
         * require a call to `$apply()`.
         * @param {?} fn
         * @return {?}
         */
        UpgradeAdapterRef.prototype.ready = function (fn) { this._readyFn = fn; };
        /**
         * Dispose of running hybrid AngularJS / Angular application.
         * @return {?}
         */
        UpgradeAdapterRef.prototype.dispose = function () {
            this.ng1Injector.get($ROOT_SCOPE).$destroy();
            this.ng2ModuleRef.destroy();
        };
        return UpgradeAdapterRef;
    }());

    exports.VERSION = VERSION;
    exports.UpgradeAdapter = UpgradeAdapter;
    exports.UpgradeAdapterRef = UpgradeAdapterRef;

}));
//# sourceMappingURL=upgrade.umd.js.map
