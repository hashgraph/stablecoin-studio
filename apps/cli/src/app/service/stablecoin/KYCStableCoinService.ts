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
import { KYCRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';
import colors from 'colors';

/**
 * Create Role Stablecoin Service
 */
export default class KYCStableCoinService extends Service {
  constructor() {
    super('KYC Stablecoin');
  }

  public async grantKYCToAccount(req: KYCRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.grantKyc(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.KYCGranted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async revokeKYCFromAccount(req: KYCRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.revokeKyc(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.KYCRevoked') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }

  public async isAccountKYCGranted(req: KYCRequest): Promise<void> {
    let isGranted = false;
    let response = language.getText('state.accountKYCNotGranted');
    await utilsService.showSpinner(
      StableCoin.isAccountKYCGranted(req).then(
        (response) => (isGranted = response),
      ),
      {
        text: language.getText('state.loading'),
        successText: language.getText('state.loadCompleted') + '\n',
      },
    );
    if (isGranted) {
      response = language.getText('state.accountKYCGranted');
    }

    console.log(
      response
        .replace('${address}', req.targetId)
        .replace('${token}', colors.yellow(req.tokenId)) + '\n',
    );

    utilsService.breakLine();
  }
}
