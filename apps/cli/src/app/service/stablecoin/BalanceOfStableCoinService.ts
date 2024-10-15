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
  GetAccountBalanceRequest,
  StableCoin,
  Balance,
} from '@hashgraph/stablecoin-npm-sdk';

export default class BalanceOfStableCoinsService extends Service {
  constructor() {
    super('Balance Of Stablecoin');
  }

  public async getBalanceOfStableCoin(
    req: GetAccountBalanceRequest,
  ): Promise<void> {
    let respDetail: Balance;

    await utilsService.showSpinner(
      StableCoin.getBalanceOf(req).then((response) => {
        respDetail = response;
      }),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.balanceCompleted') + '\n',
      },
    );

    console.log('Balance of Stablecoin: ', respDetail.value.toString());

    utilsService.breakLine();
  }

  public async getBalanceOfStableCoin_2(
    req: GetAccountBalanceRequest,
  ): Promise<string> {
    let respDetail: Balance;

    await utilsService.showSpinner(
      StableCoin.getBalanceOf(req).then((response) => {
        respDetail = response;
      }),
      {
        text: '',
        successText: '',
      },
    );

    return respDetail.value.toString();
  }
}
