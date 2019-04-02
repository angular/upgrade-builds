/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export { getAngularJSGlobal, getAngularLib, setAngularJSGlobal, setAngularLib } from '../src/common/src/angular1';
export { downgradeComponent } from '../src/common/src/downgrade_component';
export { downgradeInjectable } from '../src/common/src/downgrade_injectable';
export { VERSION } from '../src/common/src/version';
export { downgradeModule } from './src/downgrade_module';
export { UpgradeComponent } from './src/upgrade_component';
export { UpgradeModule } from './src/upgrade_module';
