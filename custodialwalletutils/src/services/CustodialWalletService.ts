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

import { IStrategyConfig, SignatureRequest, StrategyFactory } from '../';
/**
 * Service class for managing custodial wallet operations.
 *
 * @export
 * @class CustodialWalletService
 */
export class CustodialWalletService {
  /**
   * Creates an instance of CustodialWalletService with a given signature strategy configuration.
   *
   * @param {IStrategyConfig} config - The configuration for the signature strategy.
   */
  constructor(private config: IStrategyConfig) {}

  /**
   * Retrieves the current signature strategy configuration.
   *
   * @returns {IStrategyConfig} The current strategy configuration.
   */
  getConfig(): IStrategyConfig {
    return this.config;
  }

  /**
   * Sets or updates the signature strategy configuration.
   *
   * @param {IStrategyConfig} newConfig - The new configuration for the signature strategy.
   */
  setConfig(newConfig: IStrategyConfig): void {
    this.config = newConfig;
  }

  /**
   * Signs a transaction based on the provided signature request.
   * The method utilizes the signature strategy defined in the current configuration to sign the transaction.
   *
   * @param {SignatureRequest} signatureRequest - The request containing the transaction details to be signed.
   * @returns {Promise<Uint8Array>} A promise that resolves to the signed transaction bytes.
   */
  signTransaction(signatureRequest: SignatureRequest): Promise<Uint8Array> {
    const strategy = StrategyFactory.createSignatureStrategy(this.config);
    return strategy.sign(signatureRequest);
  }
}
