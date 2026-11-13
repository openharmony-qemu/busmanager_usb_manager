/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import UIExtensionAbility from '@ohos.app.ability.UIExtensionAbility';
import UIExtensionContentSession from '@ohos.app.ability.UIExtensionContentSession';
import Want from '@ohos.app.ability.Want';
import rpc from '@ohos.rpc';
import {terminateDialog} from '../util/DialogUtil';
import {SerialDialogRequest} from '../util/SerialDialogRequest';

let TAG: string = 'UsbService';

const BG_COLOR = '#00000000';
const COLOR_MODE_NOT_SET = -1;

function serialParameter(want: Want, key: string): string {
  let value = want.parameters?.[key];
  return typeof value === 'string' ? value : '';
}

export default class UsbDialogAbility extends UIExtensionAbility {
  /**
   * Lifecycle function, called back when a service extension is started for initialization.
   */
  onSessionCreate(want: Want, session: UIExtensionContentSession): void {
    console.log(TAG + 'UsbDialogAbility onSessionCreate');
    console.log(JSON.stringify(want));

    let isSerial: boolean = want.parameters?.['portName'] !== undefined;
    try {
      if (isSerial) {
        let request = new SerialDialogRequest(serialParameter(want, 'tokenId'), serialParameter(want, 'deviceId'),
          serialParameter(want, 'appName'), serialParameter(want, 'portName'), () => session.terminateSelf());
        session.loadContent('pages/SerialDialog', new LocalStorage({ serialRequest: request }));
      } else {
        // Preserve the existing USB route; Serial never replaces its globals.
        globalThis.extensionContext = this.context;
        globalThis.want = want;
        globalThis.windowNum = 0;
        AppStorage.setOrCreate('session', session);
        session.loadContent('pages/UsbDialog');
      }
      session.setWindowBackgroundColor(BG_COLOR);
      this.context?.getApplicationContext()?.setColorMode(COLOR_MODE_NOT_SET);
    } catch (error) {
      console.error(TAG + 'UsbFunctionSwitchAbility onSessionCreate error: ' + error?.code);
      if (isSerial) {
        session.terminateSelf().catch((closeError: Error) => {
          console.error(TAG + 'terminate own Serial session failed: ' + JSON.stringify(closeError));
        });
      } else {
        terminateDialog();
      }
    }
  }

  onSessionDestroy(session): void {
    console.log(TAG + 'UsbDialogAbility onSessionDestroy');
  }
};

