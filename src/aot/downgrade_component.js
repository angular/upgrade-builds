/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ComponentFactoryResolver } from '@angular/core';
import { $INJECTOR, $PARSE, INJECTOR_KEY, REQUIRE_NG1_MODEL } from './constants';
import { DowngradeComponentAdapter } from './downgrade_component_adapter';
var /** @type {?} */ downgradeCount = 0;
/**
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
 */
export function downgradeComponent(info) {
    var /** @type {?} */ idPrefix = "NG2_UPGRADE_" + downgradeCount++ + "_";
    var /** @type {?} */ idCount = 0;
    var /** @type {?} */ directiveFactory = function ($injector, $parse) {
        return {
            restrict: 'E',
            require: ['?^' + INJECTOR_KEY, REQUIRE_NG1_MODEL],
            link: function (scope, element, attrs, required, transclude) {
                var /** @type {?} */ parentInjector = required[0];
                if (parentInjector === null) {
                    parentInjector = $injector.get(INJECTOR_KEY);
                }
                var /** @type {?} */ ngModel = required[1];
                var /** @type {?} */ componentFactoryResolver = parentInjector.get(ComponentFactoryResolver);
                var /** @type {?} */ componentFactory = componentFactoryResolver.resolveComponentFactory(info.component);
                if (!componentFactory) {
                    throw new Error('Expecting ComponentFactory for: ' + info.component);
                }
                var /** @type {?} */ facade = new DowngradeComponentAdapter(idPrefix + (idCount++), info, element, attrs, scope, ngModel, parentInjector, $parse, componentFactory);
                facade.setupInputs();
                facade.createComponent();
                facade.projectContent();
                facade.setupOutputs();
                facade.registerCleanup();
            }
        };
    };
    directiveFactory.$inject = [$INJECTOR, $PARSE];
    return directiveFactory;
}
//# sourceMappingURL=downgrade_component.js.map