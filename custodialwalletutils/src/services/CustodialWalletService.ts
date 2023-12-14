/*
 *
 * Hedera Stablecoin SDK
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

import { IStrategyConfig } from '../strategies/config/IStrategyConfig';
import { StrategyFactory } from '../factories/StrategyFactory';
import { SignatureRequest } from '../models/signature/SignatureRequest';

export class CustodialWalletService {
  constructor(private config: IStrategyConfig) {}

  getconfig(): IStrategyConfig{
    return this.config;
  }

  setconfig(newConfig: IStrategyConfig){
   this.config = newConfig;
  }

  signTransaction(signatureRequest: SignatureRequest): Promise<Uint8Array> {
    const strategy = StrategyFactory.createSignatureStrategy(this.config);
    return strategy.sign(signatureRequest);
  }
}
