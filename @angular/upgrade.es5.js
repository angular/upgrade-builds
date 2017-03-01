var _slicedToArray=function(){function sliceIterator(arr,i){var _arr=[];var _n=true;var _d=false;var _e=undefined;try{for(var _i=arr[Symbol.iterator](),_s;!(_n=(_s=_i.next()).done);_n=true){_arr.push(_s.value);if(i&&_arr.length===i)break;}}catch(err){_d=true;_e=err;}finally{try{if(!_n&&_i["return"])_i["return"]();}finally{if(_d)throw _e;}}return _arr;}return function(arr,i){if(Array.isArray(arr)){return arr;}else if(Symbol.iterator in Object(arr)){return sliceIterator(arr,i);}else{throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}/**
 * @license Angular v4.0.0-rc.1-a6996a9
 * (c) 2010-2017 Google, Inc. https://angular.io/
 * License: MIT
 */import{Version,NgModule,Testability,Compiler,Injector,NgZone,ComponentFactoryResolver,SimpleChange,ReflectiveInjector,ElementRef,Inject,Directive,EventEmitter}from'@angular/core';import{DirectiveResolver,createElementCssSelector,CssSelector,SelectorMatcher}from'@angular/compiler';import{platformBrowserDynamic}from'@angular/platform-browser-dynamic';/**
 * @stable
 */var/** @type {?} */VERSION=new Version('4.0.0-rc.1-a6996a9');/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *//**
 * @return {?}
 */function noNg(){throw new Error('AngularJS v1.x is not loaded!');}var/** @type {?} */angular={bootstrap:noNg,module:noNg,element:noNg,version:noNg,resumeBootstrap:noNg,getTestability:noNg};try{if(window.hasOwnProperty('angular')){angular=window.angular;}}catch(e){}var/** @type {?} */_bootstrap=angular.bootstrap;var/** @type {?} */module$1=angular.module;var/** @type {?} */element=angular.element;/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *//**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */var/** @type {?} */$COMPILE='$compile';var/** @type {?} */$CONTROLLER='$controller';var/** @type {?} */$HTTP_BACKEND='$httpBackend';var/** @type {?} */$INJECTOR='$injector';var/** @type {?} */$PARSE='$parse';var/** @type {?} */$ROOT_SCOPE='$rootScope';var/** @type {?} */$SCOPE='$scope';var/** @type {?} */$TEMPLATE_CACHE='$templateCache';var/** @type {?} */$$TESTABILITY='$$testability';var/** @type {?} */COMPILER_KEY='$$angularCompiler';var/** @type {?} */INJECTOR_KEY='$$angularInjector';var/** @type {?} */NG_ZONE_KEY='$$angularNgZone';var/** @type {?} */REQUIRE_INJECTOR='?^^'+INJECTOR_KEY;var/** @type {?} */REQUIRE_NG_MODEL='?ngModel';/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */var ContentProjectionHelper=function(){function ContentProjectionHelper(){_classCallCheck(this,ContentProjectionHelper);}_createClass(ContentProjectionHelper,[{key:'groupProjectableNodes',/**
     * @param {?} $injector
     * @param {?} component
     * @param {?} nodes
     * @return {?}
     */value:function groupProjectableNodes($injector,component,nodes){// By default, do not support multi-slot projection,
// as `upgrade/static` does not support it yet.
return[nodes];}}]);return ContentProjectionHelper;}();/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *//**
 * A `PropertyBinding` represents a mapping between a property name
 * and an attribute name. It is parsed from a string of the form
 * `"prop: attr"`; or simply `"propAndAttr" where the property
 * and attribute have the same identifier.
 */var PropertyBinding=function(){/**
     * @param {?} binding
     */function PropertyBinding(binding){_classCallCheck(this,PropertyBinding);this.binding=binding;this.parseBinding();}/**
     * @return {?}
     */_createClass(PropertyBinding,[{key:'parseBinding',value:function parseBinding(){var/** @type {?} */parts=this.binding.split(':');this.prop=parts[0].trim();this.attr=(parts[1]||this.prop).trim();this.bracketAttr='['+this.attr+']';this.parenAttr='('+this.attr+')';this.bracketParenAttr='[('+this.attr+')]';var/** @type {?} */capitalAttr=this.attr.charAt(0).toUpperCase()+this.attr.substr(1);this.onAttr='on'+capitalAttr;this.bindAttr='bind'+capitalAttr;this.bindonAttr='bindon'+capitalAttr;}}]);return PropertyBinding;}();/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *//**
 * @param {?} e
 * @return {?}
 */function onError(e){// TODO: (misko): We seem to not have a stack trace here!
if(console.error){console.error(e,e.stack);}else{// tslint:disable-next-line:no-console
console.log(e,e.stack);}throw e;}/**
 * @param {?} name
 * @return {?}
 */function controllerKey(name){return'$'+name+'Controller';}/**
 * @param {?} node
 * @return {?}
 */function getAttributesAsArray(node){var/** @type {?} */attributes=node.attributes;var/** @type {?} */asArray=void 0;if(attributes){var/** @type {?} */attrLen=attributes.length;asArray=new Array(attrLen);for(var/** @type {?} */i=0;i<attrLen;i++){asArray[i]=[attributes[i].nodeName,attributes[i].nodeValue];}}return asArray||[];}/**
 * @param {?} component
 * @return {?}
 */function getComponentName(component){// Return the name of the component or the first line of its stringified version.
return component.overriddenName||component.name||component.toString().split('\n')[0];}var Deferred=function Deferred(){var _this=this;_classCallCheck(this,Deferred);this.promise=new Promise(function(res,rej){_this.resolve=res;_this.reject=rej;});};/**
 * @param {?} component
 * @return {?} Whether the passed-in component implements the subset of the
 *     `ControlValueAccessor` interface needed for AngularJS `ng-model`
 *     compatibility.
 */function supportsNgModel(component){return typeof component.writeValue==='function'&&typeof component.registerOnChange==='function';}/**
 * Glue the AngularJS `NgModelController` (if it exists) to the component
 * (if it implements the needed subset of the `ControlValueAccessor` interface).
 * @param {?} ngModel
 * @param {?} component
 * @return {?}
 */function hookupNgModel(ngModel,component){if(ngModel&&supportsNgModel(component)){ngModel.$render=function(){component.writeValue(ngModel.$viewValue);};component.registerOnChange(ngModel.$setViewValue.bind(ngModel));}}var/** @type {?} */INITIAL_VALUE={__UNINITIALIZED__:true};var DowngradeComponentAdapter=function(){/**
     * @param {?} id
     * @param {?} info
     * @param {?} element
     * @param {?} attrs
     * @param {?} scope
     * @param {?} ngModel
     * @param {?} parentInjector
     * @param {?} $injector
     * @param {?} $compile
     * @param {?} $parse
     * @param {?} componentFactory
     */function DowngradeComponentAdapter(id,info,element,attrs,scope,ngModel,parentInjector,$injector,$compile,$parse,componentFactory){_classCallCheck(this,DowngradeComponentAdapter);this.id=id;this.info=info;this.element=element;this.attrs=attrs;this.scope=scope;this.ngModel=ngModel;this.parentInjector=parentInjector;this.$injector=$injector;this.$compile=$compile;this.$parse=$parse;this.componentFactory=componentFactory;this.inputChangeCount=0;this.inputChanges=null;this.componentRef=null;this.component=null;this.changeDetector=null;this.element[0].id=id;this.componentScope=scope.$new();}/**
     * @return {?}
     */_createClass(DowngradeComponentAdapter,[{key:'compileContents',value:function compileContents(){var _this2=this;var/** @type {?} */compiledProjectableNodes=[];// The projected content has to be grouped, before it is compiled.
var/** @type {?} */projectionHelper=this.parentInjector.get(ContentProjectionHelper);var/** @type {?} */projectableNodes=projectionHelper.groupProjectableNodes(this.$injector,this.info.component,this.element.contents());var/** @type {?} */linkFns=projectableNodes.map(function(nodes){return _this2.$compile(nodes);});this.element.empty();linkFns.forEach(function(linkFn){linkFn(_this2.scope,function(clone){compiledProjectableNodes.push(clone);_this2.element.append(clone);});});return compiledProjectableNodes;}/**
     * @param {?} projectableNodes
     * @return {?}
     */},{key:'createComponent',value:function createComponent(projectableNodes){var/** @type {?} */childInjector=ReflectiveInjector.resolveAndCreate([{provide:$SCOPE,useValue:this.componentScope}],this.parentInjector);this.componentRef=this.componentFactory.create(childInjector,projectableNodes,this.element[0]);this.changeDetector=this.componentRef.changeDetectorRef;this.component=this.componentRef.instance;hookupNgModel(this.ngModel,this.component);}/**
     * @return {?}
     */},{key:'setupInputs',value:function setupInputs(){var _this3=this;var/** @type {?} */attrs=this.attrs;var/** @type {?} */inputs=this.info.inputs||[];for(var/** @type {?} */i=0;i<inputs.length;i++){var/** @type {?} */input=new PropertyBinding(inputs[i]);var/** @type {?} */expr=null;if(attrs.hasOwnProperty(input.attr)){var/** @type {?} */observeFn=function(prop){var/** @type {?} */prevValue=INITIAL_VALUE;return function(currValue){if(prevValue===INITIAL_VALUE){prevValue=currValue;}_this3.updateInput(prop,prevValue,currValue);prevValue=currValue;};}(input.prop);attrs.$observe(input.attr,observeFn);}else if(attrs.hasOwnProperty(input.bindAttr)){expr=attrs[/** TODO #9100 */input.bindAttr];}else if(attrs.hasOwnProperty(input.bracketAttr)){expr=attrs[/** TODO #9100 */input.bracketAttr];}else if(attrs.hasOwnProperty(input.bindonAttr)){expr=attrs[/** TODO #9100 */input.bindonAttr];}else if(attrs.hasOwnProperty(input.bracketParenAttr)){expr=attrs[/** TODO #9100 */input.bracketParenAttr];}if(expr!=null){var/** @type {?} */watchFn=function(prop){return function(currValue,prevValue){return _this3.updateInput(prop,prevValue,currValue);};}(input.prop);this.componentScope.$watch(expr,watchFn);}}var/** @type {?} */prototype=this.info.component.prototype;if(prototype&&prototype.ngOnChanges){// Detect: OnChanges interface
this.inputChanges={};this.componentScope.$watch(function(){return _this3.inputChangeCount;},function(){var/** @type {?} */inputChanges=_this3.inputChanges;_this3.inputChanges={};_this3.component.ngOnChanges(inputChanges);});}this.componentScope.$watch(function(){return _this3.changeDetector&&_this3.changeDetector.detectChanges();});}/**
     * @return {?}
     */},{key:'setupOutputs',value:function setupOutputs(){var _this4=this;var/** @type {?} */attrs=this.attrs;var/** @type {?} */outputs=this.info.outputs||[];for(var/** @type {?} */j=0;j<outputs.length;j++){var/** @type {?} */output=new PropertyBinding(outputs[j]);var/** @type {?} */expr=null;var/** @type {?} */assignExpr=false;var/** @type {?} */bindonAttr=output.bindonAttr?output.bindonAttr.substring(0,output.bindonAttr.length-6):null;var/** @type {?} */bracketParenAttr=output.bracketParenAttr?'[('+output.bracketParenAttr.substring(2,output.bracketParenAttr.length-8)+')]':null;if(attrs.hasOwnProperty(output.onAttr)){expr=attrs[/** TODO #9100 */output.onAttr];}else if(attrs.hasOwnProperty(output.parenAttr)){expr=attrs[/** TODO #9100 */output.parenAttr];}else if(attrs.hasOwnProperty(bindonAttr)){expr=attrs[/** TODO #9100 */bindonAttr];assignExpr=true;}else if(attrs.hasOwnProperty(bracketParenAttr)){expr=attrs[/** TODO #9100 */bracketParenAttr];assignExpr=true;}if(expr!=null&&assignExpr!=null){var/** @type {?} */getter=this.$parse(expr);var/** @type {?} */setter=getter.assign;if(assignExpr&&!setter){throw new Error('Expression \''+expr+'\' is not assignable!');}var/** @type {?} */emitter=this.component[output.prop];if(emitter){emitter.subscribe({next:assignExpr?function(setter){return function(v/** TODO #9100 */){return setter(_this4.scope,v);};}(setter):function(getter){return function(v/** TODO #9100 */){return getter(_this4.scope,{$event:v});};}(getter)});}else{throw new Error('Missing emitter \''+output.prop+'\' on component \''+getComponentName(this.info.component)+'\'!');}}}}/**
     * @return {?}
     */},{key:'registerCleanup',value:function registerCleanup(){var _this5=this;this.element.bind('$destroy',function(){_this5.componentScope.$destroy();_this5.componentRef.destroy();});}/**
     * @return {?}
     */},{key:'getInjector',value:function getInjector(){return this.componentRef&&this.componentRef.injector;}/**
     * @param {?} prop
     * @param {?} prevValue
     * @param {?} currValue
     * @return {?}
     */},{key:'updateInput',value:function updateInput(prop,prevValue,currValue){if(this.inputChanges){this.inputChangeCount++;this.inputChanges[prop]=new SimpleChange(prevValue,currValue,prevValue===currValue);}this.component[prop]=currValue;}}]);return DowngradeComponentAdapter;}();var/** @type {?} */downgradeCount=0;/**
 * \@whatItDoes
 *
 * *Part of the [upgrade/static](/docs/ts/latest/api/#!?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allows an Angular component to be used from AngularJS.
 *
 * \@howToUse
 *
 * Let's assume that you have an Angular component called `ng2Heroes` that needs
 * to be made available in AngularJS templates.
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-heroes"}
 *
 * We must create an AngularJS [directive](https://docs.angularjs.org/guide/directive)
 * that will make this Angular component available inside AngularJS templates.
 * The `downgradeComponent()` function returns a factory function that we
 * can use to define the AngularJS directive that wraps the "downgraded" component.
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-heroes-wrapper"}
 *
 * In this example you can see that we must provide information about the component being
 * "downgraded". This is because once the AoT compiler has run, all metadata about the
 * component has been removed from the code, and so cannot be inferred.
 *
 * We must do the following:
 * * specify the Angular component class that is to be downgraded
 * * specify all inputs and outputs that the AngularJS component expects
 *
 * \@description
 *
 * A helper function that returns a factory function to be used for registering an
 * AngularJS wrapper directive for "downgrading" an Angular component.
 *
 * The parameter contains information about the Component that is being downgraded:
 *
 * * `component: Type<any>`: The type of the Component that will be downgraded
 * * `inputs: string[]`: A collection of strings that specify what inputs the component accepts.
 * * `outputs: string[]`: A collection of strings that specify what outputs the component emits.
 *
 * The `inputs` and `outputs` are strings that map the names of properties to camelCased
 * attribute names. They are of the form `"prop: attr"`; or simply `"propAndAttr" where the
 * property and attribute have the same identifier.
 *
 * \@experimental
 * @param {?} info
 * @return {?}
 */function downgradeComponent(info){var/** @type {?} */idPrefix='NG2_UPGRADE_'+downgradeCount++ +'_';var/** @type {?} */idCount=0;var/** @type {?} */directiveFactory=function directiveFactory($compile,$injector,$parse){return{restrict:'E',terminal:true,require:[REQUIRE_INJECTOR,REQUIRE_NG_MODEL],link:function link(scope,element,attrs,required){// We might have to compile the contents asynchronously, because this might have been
// triggered by `UpgradeNg1ComponentAdapterBuilder`, before the Angular templates have
// been compiled.
var/** @type {?} */parentInjector=required[0]||$injector.get(INJECTOR_KEY);var/** @type {?} */ngModel=required[1];var/** @type {?} */downgradeFn=function downgradeFn(injector){var/** @type {?} */componentFactoryResolver=injector.get(ComponentFactoryResolver);var/** @type {?} */componentFactory=componentFactoryResolver.resolveComponentFactory(info.component);if(!componentFactory){throw new Error('Expecting ComponentFactory for: '+getComponentName(info.component));}var/** @type {?} */id=idPrefix+idCount++;var/** @type {?} */injectorPromise=new ParentInjectorPromise$1(element);var/** @type {?} */facade=new DowngradeComponentAdapter(id,info,element,attrs,scope,ngModel,injector,$injector,$compile,$parse,componentFactory);var/** @type {?} */projectableNodes=facade.compileContents();facade.createComponent(projectableNodes);facade.setupInputs();facade.setupOutputs();facade.registerCleanup();injectorPromise.resolve(facade.getInjector());};if(parentInjector instanceof ParentInjectorPromise$1){parentInjector.then(downgradeFn);}else{downgradeFn(parentInjector);}}};};// bracket-notation because of closure - see #14441
directiveFactory['$inject']=[$COMPILE,$INJECTOR,$PARSE];return directiveFactory;}/**
 * Synchronous promise-like object to wrap parent injectors,
 * to preserve the synchronous nature of Angular 1's $compile.
 */var ParentInjectorPromise$1=function(){/**
     * @param {?} element
     */function ParentInjectorPromise$1(element){_classCallCheck(this,ParentInjectorPromise$1);this.element=element;this.injectorKey=controllerKey(INJECTOR_KEY);this.callbacks=[];// Store the promise on the element.
element.data(this.injectorKey,this);}/**
     * @param {?} callback
     * @return {?}
     */_createClass(ParentInjectorPromise$1,[{key:'then',value:function then(callback){if(this.injector){callback(this.injector);}else{this.callbacks.push(callback);}}/**
     * @param {?} injector
     * @return {?}
     */},{key:'resolve',value:function resolve(injector){this.injector=injector;// Store the real injector on the element.
this.element.data(this.injectorKey,injector);// Release the element to prevent memory leaks.
this.element=null;// Run the queued callbacks.
this.callbacks.forEach(function(callback){return callback(injector);});this.callbacks.length=0;}}]);return ParentInjectorPromise$1;}();/**
 * \@whatItDoes
 *
 * *Part of the [upgrade/static](/docs/ts/latest/api/#!?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AoT compilation*
 *
 * Allow an Angular service to be accessible from AngularJS.
 *
 * \@howToUse
 *
 * First ensure that the service to be downgraded is provided in an {\@link NgModule}
 * that will be part of the upgrade application. For example, let's assume we have
 * defined `HeroesService`
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-heroes-service"}
 *
 * and that we have included this in our upgrade app {\@link NgModule}
 *
 * {\@example upgrade/static/ts/module.ts region="ng2-module"}
 *
 * Now we can register the `downgradeInjectable` factory function for the service
 * on an AngularJS module.
 *
 * {\@example upgrade/static/ts/module.ts region="downgrade-ng2-heroes-service"}
 *
 * Inside an AngularJS component's controller we can get hold of the
 * downgraded service via the name we gave when downgrading.
 *
 * {\@example upgrade/static/ts/module.ts region="example-app"}
 *
 * \@description
 *
 * Takes a `token` that identifies a service provided from Angular.
 *
 * Returns a [factory function](https://docs.angularjs.org/guide/di) that can be
 * used to register the service on an AngularJS module.
 *
 * The factory function provides access to the Angular service that
 * is identified by the `token` parameter.
 *
 * \@experimental
 * @param {?} token
 * @return {?}
 */function downgradeInjectable(token){var/** @type {?} */factory=function factory(i){return i.get(token);};factory.$inject=[INJECTOR_KEY];return factory;}var DynamicContentProjectionHelper=function(_ContentProjectionHel){_inherits(DynamicContentProjectionHelper,_ContentProjectionHel);function DynamicContentProjectionHelper(){_classCallCheck(this,DynamicContentProjectionHelper);return _possibleConstructorReturn(this,(DynamicContentProjectionHelper.__proto__||Object.getPrototypeOf(DynamicContentProjectionHelper)).apply(this,arguments));}_createClass(DynamicContentProjectionHelper,[{key:'groupProjectableNodes',/**
     * @param {?} $injector
     * @param {?} component
     * @param {?} nodes
     * @return {?}
     */value:function groupProjectableNodes($injector,component,nodes){var/** @type {?} */ng2Compiler=$injector.get(COMPILER_KEY);var/** @type {?} */ngContentSelectors=ng2Compiler.getNgContentSelectors(component);if(!ngContentSelectors){throw new Error('Expecting ngContentSelectors for: '+getComponentName(component));}return this.groupNodesBySelector(ngContentSelectors,nodes);}/**
     * Group a set of DOM nodes into `ngContent` groups, based on the given content selectors.
     * @param {?} ngContentSelectors
     * @param {?} nodes
     * @return {?}
     */},{key:'groupNodesBySelector',value:function groupNodesBySelector(ngContentSelectors,nodes){var/** @type {?} */projectableNodes=[];var/** @type {?} */matcher=new SelectorMatcher();var/** @type {?} */wildcardNgContentIndex=void 0;for(var/** @type {?} */i=0,/** @type {?} */ii=ngContentSelectors.length;i<ii;++i){projectableNodes[i]=[];var/** @type {?} */selector=ngContentSelectors[i];if(selector==='*'){wildcardNgContentIndex=i;}else{matcher.addSelectables(CssSelector.parse(selector),i);}}var _loop=function _loop(j,jj){var/** @type {?} */ngContentIndices=[];var/** @type {?} */node=nodes[j];var/** @type {?} */selector=createElementCssSelector(node.nodeName.toLowerCase(),getAttributesAsArray(node));matcher.match(selector,function(_,index){return ngContentIndices.push(index);});ngContentIndices.sort();if(wildcardNgContentIndex!==undefined){ngContentIndices.push(wildcardNgContentIndex);}if(ngContentIndices.length){projectableNodes[ngContentIndices[0]].push(node);}};for(var/** @type {?} */j=0,/** @type {?} */jj=nodes.length;j<jj;++j){_loop(j,jj);}return projectableNodes;}}]);return DynamicContentProjectionHelper;}(ContentProjectionHelper);var/** @type {?} */CAMEL_CASE=/([A-Z])/g;var/** @type {?} */INITIAL_VALUE$1={__UNINITIALIZED__:true};var/** @type {?} */NOT_SUPPORTED='NOT_SUPPORTED';var UpgradeNg1ComponentAdapterBuilder=function(){/**
     * @param {?} name
     */function UpgradeNg1ComponentAdapterBuilder(name){_classCallCheck(this,UpgradeNg1ComponentAdapterBuilder);this.name=name;this.inputs=[];this.inputsRename=[];this.outputs=[];this.outputsRename=[];this.propertyOutputs=[];this.checkProperties=[];this.propertyMap={};this.linkFn=null;this.directive=null;this.$controller=null;var selector=name.replace(CAMEL_CASE,function(all/** TODO #9100 */,next){return'-'+next.toLowerCase();});var self=this;this.type=Directive({selector:selector,inputs:this.inputsRename,outputs:this.outputsRename}).Class({constructor:[new Inject($SCOPE),ElementRef,function(scope,elementRef){return new UpgradeNg1ComponentAdapter(self.linkFn,scope,self.directive,elementRef,self.$controller,self.inputs,self.outputs,self.propertyOutputs,self.checkProperties,self.propertyMap);}],ngOnInit:function ngOnInit(){},ngOnChanges:function ngOnChanges(){},ngDoCheck:function ngDoCheck(){},ngOnDestroy:function ngOnDestroy(){}});}/**
     * @param {?} injector
     * @return {?}
     */_createClass(UpgradeNg1ComponentAdapterBuilder,[{key:'extractDirective',value:function extractDirective(injector){var/** @type {?} */directives=injector.get(this.name+'Directive');if(directives.length>1){throw new Error('Only support single directive definition for: '+this.name);}var/** @type {?} */directive=directives[0];if(directive.replace)this.notSupported('replace');if(directive.terminal)this.notSupported('terminal');var/** @type {?} */link=directive.link;if((typeof link==='undefined'?'undefined':_typeof(link))=='object'){if(link.post)this.notSupported('link.post');}return directive;}/**
     * @param {?} feature
     * @return {?}
     */},{key:'notSupported',value:function notSupported(feature){throw new Error('Upgraded directive \''+this.name+'\' does not support \''+feature+'\'.');}/**
     * @return {?}
     */},{key:'extractBindings',value:function extractBindings(){var/** @type {?} */btcIsObject=_typeof(this.directive.bindToController)==='object';if(btcIsObject&&Object.keys(this.directive.scope).length){throw new Error('Binding definitions on scope and controller at the same time are not supported.');}var/** @type {?} */context=btcIsObject?this.directive.bindToController:this.directive.scope;if((typeof context==='undefined'?'undefined':_typeof(context))=='object'){for(var/** @type {?} */name in context){if(context.hasOwnProperty(name)){var/** @type {?} */localName=context[name];var/** @type {?} */type=localName.charAt(0);var/** @type {?} */typeOptions=localName.charAt(1);localName=typeOptions==='?'?localName.substr(2):localName.substr(1);localName=localName||name;var/** @type {?} */outputName='output_'+name;var/** @type {?} */outputNameRename=outputName+': '+name;var/** @type {?} */outputNameRenameChange=outputName+': '+name+'Change';var/** @type {?} */inputName='input_'+name;var/** @type {?} */inputNameRename=inputName+': '+name;switch(type){case'=':this.propertyOutputs.push(outputName);this.checkProperties.push(localName);this.outputs.push(outputName);this.outputsRename.push(outputNameRenameChange);this.propertyMap[outputName]=localName;this.inputs.push(inputName);this.inputsRename.push(inputNameRename);this.propertyMap[inputName]=localName;break;case'@':// handle the '<' binding of angular 1.5 components
case'<':this.inputs.push(inputName);this.inputsRename.push(inputNameRename);this.propertyMap[inputName]=localName;break;case'&':this.outputs.push(outputName);this.outputsRename.push(outputNameRename);this.propertyMap[outputName]=localName;break;default:var/** @type {?} */json=JSON.stringify(context);throw new Error('Unexpected mapping \''+type+'\' in \''+json+'\' in \''+this.name+'\' directive.');}}}}}/**
     * @param {?} compile
     * @param {?} templateCache
     * @param {?} httpBackend
     * @return {?}
     */},{key:'compileTemplate',value:function compileTemplate(compile,templateCache,httpBackend){var _this7=this;if(this.directive.template!==undefined){this.linkFn=compileHtml(isFunction(this.directive.template)?this.directive.template():this.directive.template);}else if(this.directive.templateUrl){var/** @type {?} */url=isFunction(this.directive.templateUrl)?this.directive.templateUrl():this.directive.templateUrl;var/** @type {?} */html=templateCache.get(url);if(html!==undefined){this.linkFn=compileHtml(html);}else{return new Promise(function(resolve,err){httpBackend('GET',url,null,function(status/** TODO #9100 */,response/** TODO #9100 */){if(status==200){resolve(_this7.linkFn=compileHtml(templateCache.put(url,response)));}else{err('GET '+url+' returned '+status+': '+response);}});});}}else{throw new Error('Directive \''+this.name+'\' is not a component, it is missing template.');}return null;/**
         * @param {?} html
         * @return {?}
         */function compileHtml(html/** TODO #9100 */){var/** @type {?} */div=document.createElement('div');div.innerHTML=html;return compile(div.childNodes);}}/**
     * Upgrade ng1 components into Angular.
     * @param {?} exportedComponents
     * @param {?} injector
     * @return {?}
     */}],[{key:'resolve',value:function resolve(exportedComponents,injector){var/** @type {?} */promises=[];var/** @type {?} */compile=injector.get($COMPILE);var/** @type {?} */templateCache=injector.get($TEMPLATE_CACHE);var/** @type {?} */httpBackend=injector.get($HTTP_BACKEND);var/** @type {?} */$controller=injector.get($CONTROLLER);for(var/** @type {?} */name in exportedComponents){if(exportedComponents.hasOwnProperty(name)){var/** @type {?} */exportedComponent=exportedComponents[name];exportedComponent.directive=exportedComponent.extractDirective(injector);exportedComponent.$controller=$controller;exportedComponent.extractBindings();var/** @type {?} */promise=exportedComponent.compileTemplate(compile,templateCache,httpBackend);if(promise)promises.push(promise);}}return Promise.all(promises);}}]);return UpgradeNg1ComponentAdapterBuilder;}();var UpgradeNg1ComponentAdapter=function(){/**
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
     */function UpgradeNg1ComponentAdapter(linkFn,scope,directive,elementRef,$controller,inputs,outputs,propOuts,checkProperties,propertyMap){_classCallCheck(this,UpgradeNg1ComponentAdapter);this.linkFn=linkFn;this.directive=directive;this.$controller=$controller;this.inputs=inputs;this.outputs=outputs;this.propOuts=propOuts;this.checkProperties=checkProperties;this.propertyMap=propertyMap;this.controllerInstance=null;this.destinationObj=null;this.checkLastValues=[];this.$element=null;this.element=elementRef.nativeElement;this.componentScope=scope.$new(!!directive.scope);this.$element=element(this.element);var controllerType=directive.controller;if(directive.bindToController&&controllerType){this.controllerInstance=this.buildController(controllerType);this.destinationObj=this.controllerInstance;}else{this.destinationObj=this.componentScope;}for(var i=0;i<inputs.length;i++){this/** TODO #9100 */[inputs[i]]=null;}for(var j=0;j<outputs.length;j++){var emitter=this/** TODO #9100 */[outputs[j]]=new EventEmitter();this.setComponentProperty(outputs[j],function(emitter/** TODO #9100 */){return function(value/** TODO #9100 */){return emitter.emit(value);};}(emitter));}for(var k=0;k<propOuts.length;k++){this/** TODO #9100 */[propOuts[k]]=new EventEmitter();this.checkLastValues.push(INITIAL_VALUE$1);}}/**
     * @return {?}
     */_createClass(UpgradeNg1ComponentAdapter,[{key:'ngOnInit',value:function ngOnInit(){var _this8=this;if(!this.directive.bindToController&&this.directive.controller){this.controllerInstance=this.buildController(this.directive.controller);}if(this.controllerInstance&&isFunction(this.controllerInstance.$onInit)){this.controllerInstance.$onInit();}var/** @type {?} */link=this.directive.link;if((typeof link==='undefined'?'undefined':_typeof(link))=='object')link=link.pre;if(link){var/** @type {?} */attrs=NOT_SUPPORTED;var/** @type {?} */transcludeFn=NOT_SUPPORTED;var/** @type {?} */linkController=this.resolveRequired(this.$element,this.directive.require);this.directive.link(this.componentScope,this.$element,attrs,linkController,transcludeFn);}var/** @type {?} */childNodes=[];var/** @type {?} */childNode=void 0/** TODO #9100 */;while(childNode=this.element.firstChild){this.element.removeChild(childNode);childNodes.push(childNode);}this.linkFn(this.componentScope,function(clonedElement,scope){for(var/** @type {?} */i=0,/** @type {?} */ii=clonedElement.length;i<ii;i++){_this8.element.appendChild(clonedElement[i]);}},{parentBoundTranscludeFn:function parentBoundTranscludeFn(scope/** TODO #9100 */,cloneAttach/** TODO #9100 */){cloneAttach(childNodes);}});if(this.controllerInstance&&isFunction(this.controllerInstance.$postLink)){this.controllerInstance.$postLink();}}/**
     * @param {?} changes
     * @return {?}
     */},{key:'ngOnChanges',value:function ngOnChanges(changes){var _this9=this;var/** @type {?} */ng1Changes={};Object.keys(changes).forEach(function(name){var/** @type {?} */change=changes[name];_this9.setComponentProperty(name,change.currentValue);ng1Changes[_this9.propertyMap[name]]=change;});if(isFunction(this.destinationObj.$onChanges)){this.destinationObj.$onChanges(ng1Changes);}}/**
     * @return {?}
     */},{key:'ngDoCheck',value:function ngDoCheck(){var/** @type {?} */destinationObj=this.destinationObj;var/** @type {?} */lastValues=this.checkLastValues;var/** @type {?} */checkProperties=this.checkProperties;for(var/** @type {?} */i=0;i<checkProperties.length;i++){var/** @type {?} */value=destinationObj[checkProperties[i]];var/** @type {?} */last=lastValues[i];if(value!==last){if(typeof value=='number'&&isNaN(value)&&typeof last=='number'&&isNaN(last)){}else{var/** @type {?} */eventEmitter=this[/** TODO #9100 */this.propOuts[i]];eventEmitter.emit(lastValues[i]=value);}}}if(this.controllerInstance&&isFunction(this.controllerInstance.$doCheck)){this.controllerInstance.$doCheck();}}/**
     * @return {?}
     */},{key:'ngOnDestroy',value:function ngOnDestroy(){if(this.controllerInstance&&isFunction(this.controllerInstance.$onDestroy)){this.controllerInstance.$onDestroy();}}/**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */},{key:'setComponentProperty',value:function setComponentProperty(name,value){this.destinationObj[this.propertyMap[name]]=value;}/**
     * @param {?} controllerType
     * @return {?}
     */},{key:'buildController',value:function buildController(controllerType/** TODO #9100 */){var/** @type {?} */locals={$scope:this.componentScope,$element:this.$element};var/** @type {?} */controller=this.$controller(controllerType,locals,null,this.directive.controllerAs);this.$element.data(controllerKey(this.directive.name),controller);return controller;}/**
     * @param {?} $element
     * @param {?} require
     * @return {?}
     */},{key:'resolveRequired',value:function resolveRequired($element,require){if(!require){return undefined;}else if(typeof require=='string'){var/** @type {?} */name=require;var/** @type {?} */isOptional=false;var/** @type {?} */startParent=false;var/** @type {?} */searchParents=false;if(name.charAt(0)=='?'){isOptional=true;name=name.substr(1);}if(name.charAt(0)=='^'){searchParents=true;name=name.substr(1);}if(name.charAt(0)=='^'){startParent=true;name=name.substr(1);}var/** @type {?} */key=controllerKey(name);if(startParent)$element=$element.parent();var/** @type {?} */dep=searchParents?$element.inheritedData(key):$element.data(key);if(!dep&&!isOptional){throw new Error('Can not locate \''+require+'\' in \''+this.directive.name+'\'.');}return dep;}else if(require instanceof Array){var/** @type {?} */deps=[];for(var/** @type {?} */i=0;i<require.length;i++){deps.push(this.resolveRequired($element,require[i]));}return deps;}throw new Error('Directive \''+this.directive.name+'\' require syntax unrecognized: '+this.directive.require);}}]);return UpgradeNg1ComponentAdapter;}();/**
 * @param {?} value
 * @return {?}
 */function isFunction(value){return typeof value==='function';}var/** @type {?} */upgradeCount=0;/**
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
 */var UpgradeAdapter=function(){/**
     * @param {?} ng2AppModule
     * @param {?=} compilerOptions
     */function UpgradeAdapter(ng2AppModule,compilerOptions){_classCallCheck(this,UpgradeAdapter);this.ng2AppModule=ng2AppModule;this.compilerOptions=compilerOptions;this.idPrefix='NG2_UPGRADE_'+upgradeCount++ +'_';this.directiveResolver=new DirectiveResolver();this.downgradedComponents=[];this.ng1ComponentsToBeUpgraded={};this.upgradedProviders=[];this.moduleRef=null;if(!ng2AppModule){throw new Error('UpgradeAdapter cannot be instantiated without an NgModule of the Angular app.');}}/**
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
     */_createClass(UpgradeAdapter,[{key:'downgradeNg2Component',value:function downgradeNg2Component(component){this.downgradedComponents.push(component);var/** @type {?} */metadata=this.directiveResolver.resolve(component);var/** @type {?} */info={component:component,inputs:metadata.inputs,outputs:metadata.outputs};return downgradeComponent(info);}/**
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
     */},{key:'upgradeNg1Component',value:function upgradeNg1Component(name){if(this.ng1ComponentsToBeUpgraded.hasOwnProperty(name)){return this.ng1ComponentsToBeUpgraded[name].type;}else{return(this.ng1ComponentsToBeUpgraded[name]=new UpgradeNg1ComponentAdapterBuilder(name)).type;}}/**
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
     */},{key:'registerForNg1Tests',value:function registerForNg1Tests(modules){var _this10=this;var/** @type {?} */windowNgMock=window['angular'].mock;if(!windowNgMock||!windowNgMock.module){throw new Error('Failed to find \'angular.mock.module\'.');}this.declareNg1Module(modules);windowNgMock.module(this.ng1Module.name);var/** @type {?} */upgrade=new UpgradeAdapterRef();this.ng2BootstrapDeferred.promise.then(function(ng1Injector){upgrade._bootstrapDone(_this10.moduleRef,ng1Injector);},onError);return upgrade;}/**
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
     */},{key:'bootstrap',value:function bootstrap(element$$,modules,config){var _this11=this;this.declareNg1Module(modules);var/** @type {?} */upgrade=new UpgradeAdapterRef();// Make sure resumeBootstrap() only exists if the current bootstrap is deferred
var/** @type {?} */windowAngular=window[/** TODO #???? */'angular'];windowAngular.resumeBootstrap=undefined;this.ngZone.run(function(){_bootstrap(element$$,[_this11.ng1Module.name],config);});var/** @type {?} */ng1BootstrapPromise=new Promise(function(resolve){if(windowAngular.resumeBootstrap){var/** @type {?} */originalResumeBootstrap=windowAngular.resumeBootstrap;windowAngular.resumeBootstrap=function(){windowAngular.resumeBootstrap=originalResumeBootstrap;windowAngular.resumeBootstrap.apply(this,arguments);resolve();};}else{resolve();}});Promise.all([this.ng2BootstrapDeferred.promise,ng1BootstrapPromise]).then(function(_ref){var _ref2=_slicedToArray(_ref,1),ng1Injector=_ref2[0];element(element$$).data(controllerKey(INJECTOR_KEY),_this11.moduleRef.injector);_this11.moduleRef.injector.get(NgZone).run(function(){upgrade._bootstrapDone(_this11.moduleRef,ng1Injector);});},onError);return upgrade;}/**
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
     */},{key:'upgradeNg1Provider',value:function upgradeNg1Provider(name,options){var/** @type {?} */token=options&&options.asToken||name;this.upgradedProviders.push({provide:token,useFactory:function useFactory($injector){return $injector.get(name);},deps:[$INJECTOR]});}/**
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
     */},{key:'downgradeNg2Provider',value:function downgradeNg2Provider(token){return downgradeInjectable(token);}/**
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
     */},{key:'declareNg1Module',value:function declareNg1Module(){var _this12=this;var modules=arguments.length>0&&arguments[0]!==undefined?arguments[0]:[];var/** @type {?} */delayApplyExps=[];var/** @type {?} */original$applyFn=void 0;var/** @type {?} */rootScopePrototype=void 0;var/** @type {?} */rootScope=void 0;var/** @type {?} */upgradeAdapter=this;var/** @type {?} */ng1Module=this.ng1Module=module$1(this.idPrefix,modules);var/** @type {?} */platformRef=platformBrowserDynamic();this.ngZone=new NgZone({enableLongStackTrace:Zone.hasOwnProperty('longStackTraceZoneSpec')});this.ng2BootstrapDeferred=new Deferred();ng1Module.factory(INJECTOR_KEY,function(){return _this12.moduleRef.injector.get(Injector);}).constant(NG_ZONE_KEY,this.ngZone).factory(COMPILER_KEY,function(){return _this12.moduleRef.injector.get(Compiler);}).config(['$provide','$injector',function(provide,ng1Injector){provide.decorator($ROOT_SCOPE,['$delegate',function(rootScopeDelegate){// Capture the root apply so that we can delay first call to $apply until we
// bootstrap Angular and then we replay and restore the $apply.
rootScopePrototype=rootScopeDelegate.constructor.prototype;if(rootScopePrototype.hasOwnProperty('$apply')){original$applyFn=rootScopePrototype.$apply;rootScopePrototype.$apply=function(exp){return delayApplyExps.push(exp);};}else{throw new Error('Failed to find \'$apply\' on \'$rootScope\'!');}return rootScope=rootScopeDelegate;}]);if(ng1Injector.has($$TESTABILITY)){provide.decorator($$TESTABILITY,['$delegate',function(testabilityDelegate){var/** @type {?} */originalWhenStable=testabilityDelegate.whenStable;// Cannot use arrow function below because we need the context
var/** @type {?} */newWhenStable=function newWhenStable(callback){originalWhenStable.call(this,function(){var/** @type {?} */ng2Testability=upgradeAdapter.moduleRef.injector.get(Testability);if(ng2Testability.isStable()){callback.apply(this,arguments);}else{ng2Testability.whenStable(newWhenStable.bind(this,callback));}});};testabilityDelegate.whenStable=newWhenStable;return testabilityDelegate;}]);}}]);ng1Module.run(['$injector','$rootScope',function(ng1Injector,rootScope){UpgradeNg1ComponentAdapterBuilder.resolve(_this12.ng1ComponentsToBeUpgraded,ng1Injector).then(function(){// At this point we have ng1 injector and we have lifted ng1 components into ng2, we
// now can bootstrap ng2.
var/** @type {?} */DynamicNgUpgradeModule=NgModule({providers:[{provide:$INJECTOR,useFactory:function useFactory(){return ng1Injector;}},{provide:$COMPILE,useFactory:function useFactory(){return ng1Injector.get($COMPILE);}},{provide:ContentProjectionHelper,useClass:DynamicContentProjectionHelper},_this12.upgradedProviders],imports:[_this12.ng2AppModule],entryComponents:_this12.downgradedComponents}).Class({constructor:function DynamicNgUpgradeModule(){},ngDoBootstrap:function ngDoBootstrap(){}});platformRef._bootstrapModuleWithZone(DynamicNgUpgradeModule,_this12.compilerOptions,_this12.ngZone).then(function(ref){_this12.moduleRef=ref;_this12.ngZone.run(function(){if(rootScopePrototype){rootScopePrototype.$apply=original$applyFn;// restore original $apply
while(delayApplyExps.length){rootScope.$apply(delayApplyExps.shift());}rootScopePrototype=null;}});}).then(function(){return _this12.ng2BootstrapDeferred.resolve(ng1Injector);},onError).then(function(){var/** @type {?} */subscription=_this12.ngZone.onMicrotaskEmpty.subscribe({next:function next(){return rootScope.$digest();}});rootScope.$on('$destroy',function(){subscription.unsubscribe();});});}).catch(function(e){return _this12.ng2BootstrapDeferred.reject(e);});}]);return ng1Module;}}]);return UpgradeAdapter;}();/**
 * Use `UpgradeAdapterRef` to control a hybrid AngularJS / Angular application.
 *
 * \@stable
 */var UpgradeAdapterRef=function(){function UpgradeAdapterRef(){_classCallCheck(this,UpgradeAdapterRef);this._readyFn=null;this.ng1RootScope=null;this.ng1Injector=null;this.ng2ModuleRef=null;this.ng2Injector=null;}/**
     * @param {?} ngModuleRef
     * @param {?} ng1Injector
     * @return {?}
     */_createClass(UpgradeAdapterRef,[{key:'_bootstrapDone',value:function _bootstrapDone(ngModuleRef,ng1Injector){this.ng2ModuleRef=ngModuleRef;this.ng2Injector=ngModuleRef.injector;this.ng1Injector=ng1Injector;this.ng1RootScope=ng1Injector.get($ROOT_SCOPE);this._readyFn&&this._readyFn(this);}/**
     * Register a callback function which is notified upon successful hybrid AngularJS / Angular
     * application has been bootstrapped.
     *
     * The `ready` callback function is invoked inside the Angular zone, therefore it does not
     * require a call to `$apply()`.
     * @param {?} fn
     * @return {?}
     */},{key:'ready',value:function ready(fn){this._readyFn=fn;}/**
     * Dispose of running hybrid AngularJS / Angular application.
     * @return {?}
     */},{key:'dispose',value:function dispose(){this.ng1Injector.get($ROOT_SCOPE).$destroy();this.ng2ModuleRef.destroy();}}]);return UpgradeAdapterRef;}();export{VERSION,UpgradeAdapter,UpgradeAdapterRef};
