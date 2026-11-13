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

import serial from '@ohos.busManager.serial';

// One immutable request and one captured native session per content page.
// Never obtain authorization parameters or close targets from global storage.
export class SerialDialogRequest {
  readonly tokenId: string;
  readonly deviceId: string;
  readonly appName: string;
  readonly portName: string;
  private readonly terminateSession: () => Promise<void>;
  private authorizationPending: boolean = false;
  private closePromise: Promise<void> | undefined = undefined;

  constructor(tokenId: string = '', deviceId: string = '', appName: string = '', portName: string = '',
    terminateSession: () => Promise<void> = () => Promise.reject(new Error('missing Serial content session'))) {
    this.tokenId = tokenId;
    this.deviceId = deviceId;
    this.appName = appName;
    this.portName = portName;
    this.terminateSession = terminateSession;
  }

  async authorizePort(): Promise<void> {
    if (this.authorizationPending) {
      return;
    }
    this.authorizationPending = true;
    try {
      if (this.tokenId.length === 0 || this.deviceId.length === 0 || this.portName.length === 0) {
        throw new Error('missing Serial authorization request parameters');
      }
      await serial.addPortAuthorization(this.tokenId, this.deviceId);
    } finally {
      try {
        await this.close();
      } catch (error) {
        // Do not replace the actual numeric grant error with a close failure.
        console.error('SerialRight terminate own session failed: ' + JSON.stringify(error));
      }
    }
  }

  async close(): Promise<void> {
    if (this.closePromise === undefined) {
      this.closePromise = this.terminateSession();
    }
    await this.closePromise;
  }
}
