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

import { ISignatureStrategy, IStrategyConfig } from '../';

/**
 * Factory class for creating signature strategies.
 * This class provides a static method to create signature strategy instances based on the provided configuration.
 *
 * @export
 * @class StrategyFactory
 */
export class StrategyFactory {
  /**
   * Creates a signature strategy based on the provided strategy configuration.
   * The method delegates the creation of the strategy to the configuration object itself.
   *
   * @static
   * @param {IStrategyConfig} strategyConfig - The configuration object that determines which signature strategy to use.
   * @returns {ISignatureStrategy} An instance of a class that implements the ISignatureStrategy interface.
   */
  static createSignatureStrategy(
    strategyConfig: IStrategyConfig,
  ): ISignatureStrategy {
    return strategyConfig.getSignatureStrategy();
  }
}
