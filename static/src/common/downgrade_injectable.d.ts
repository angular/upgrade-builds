/**
 * @whatItDoes
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
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
export declare function downgradeInjectable(token: any): Function;
