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
import { RescueRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';

/**
 * Create Stablecoin Service
 */
export default class RescueStableCoinService extends Service {
  constructor() {
    super('Rescue Stablecoin');
  }

  /**
   * List Stablecoins can be managed
   */
  public async rescueStableCoin(req: RescueRequest): Promise<void> {
    await utilsService.showSpinner(StableCoin.rescue(req), {
      text: language.getText('state.loading'),
      successText: language.getText('state.rescueCompleted') + '\n',
    });

    console.log(language.getText('operation.success'));

    utilsService.breakLine();
  }
}
