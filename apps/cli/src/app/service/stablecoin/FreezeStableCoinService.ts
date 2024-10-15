/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { language } from '../../../index.js';
import { utilsService } from '../../../index.js';
import Service from '../Service.js';
import {
  FreezeAccountRequest,
  StableCoin,
} from '@hashgraph/stablecoin-npm-sdk';
import colors from 'colors';

/**
 * Create Role Stablecoin Service
 */
export default class FreezeStableCoinService extends Service {
  constructor() {
    super('Freeze Stablecoin');
  }

  public async freezeAccount(req: FreezeAccountRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.freeze(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.freezeCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async unfreezeAccount(req: FreezeAccountRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.unFreeze(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.unfreezeCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async isAccountFrozenDisplay(
    req: FreezeAccountRequest,
  ): Promise<void> {
    let isFrozen = false;
    let response = language.getText('state.accountNotFrozen');
    await utilsService.showSpinner(
      StableCoin.isAccountFrozen(req).then((response) => (isFrozen = response)),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    if (isFrozen) {
      response = language.getText('state.accountFrozen');
    }

    console.log(
      response
        .replace('${address}', req.targetId)
        .replace('${token}', colors.yellow(req.tokenId)) + '\n',
    );

    utilsService.breakLine();
  }

  public async isAccountFrozen(req: FreezeAccountRequest): Promise<boolean> {
    return await StableCoin.isAccountFrozen(req);
  }
}
