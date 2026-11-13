/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

import { AlertDialog } from '@ohos.arkui.advanced.Dialog'
import { SerialDialogRequest } from '../util/SerialDialogRequest';
import { BusinessError } from '@ohos.base';

@Entry({ useSharedStorage: true })
@Component
struct SerialDialogComponent {
  @LocalStorageProp('serialRequest') private request: SerialDialogRequest = new SerialDialogRequest();

  confirmDialogController: CustomDialogController = new CustomDialogController({
    builder: AlertDialog({
      primaryTitle: $r('app.string.serial_right_title'),
      content: $r('app.string.usb_right_content', this.request.appName, this.request.portName),
      primaryButton: {
        value: $r('app.string.notAllowButton'),
        action: () => {
          console.info('SerialRight not allowed');
          this.closeDialog()
        },
      },
      secondaryButton: {
        value: $r('app.string.allowButton'),
        action: () => {
          this.authorizePort();
        }
      },
    }),
    autoCancel: false,
    cancel: () => {
      console.info('SerialRight dialog canceled');
      this.closeDialog()
    }
  })

  async authorizePort(): Promise<void> {
    try {
      await this.request.authorizePort();
      console.info('SerialRight addPortAuthorization completed');
    } catch (error) {
      let err: BusinessError = error;
      console.error('SerialRight addPortAuthorization failed: code=' + err.code + ', message=' + err.message);
    }
  }

  closeDialog(): void {
    console.info('SerialRight close dialog');
    this.request.close().catch((error: BusinessError) => {
      console.error('SerialRight close own session failed: code=' + error.code + ', message=' + error.message);
    });
  }

  aboutToAppear(): void {
    console.info('SerialRight show dialog for port=' + this.request.portName);
    setTimeout(() => {
        this.confirmDialogController.open();
    });
  }

  build() {
  }
}
