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

import { StrategyFactory } from '../../src/factories/StrategyFactory';
import { FireblocksStrategy } from '../../src/strategies/signature/FireblocksStrategy';
import { DFNSStrategy } from '../../src/strategies/signature/DFNSStrategy';
import { TEST_TIMEOUT, fireblocksConfig, dfnsConfig } from '../utils/config';

describe('🧪 Factory TESTS', () => {
  describe('[Fireblocks] Signatures', () => {
    it(
      'get strategy',
      () => {
        const strategy =
          StrategyFactory.createSignatureStrategy(fireblocksConfig);

        expect(strategy instanceof FireblocksStrategy).toEqual(true);
      },
      TEST_TIMEOUT,
    );
  });

  describe('[DFNS] Signatures', () => {
    it(
      'get strategy',
      () => {
        const strategy = StrategyFactory.createSignatureStrategy(dfnsConfig);

        expect(strategy instanceof DFNSStrategy).toEqual(true);
      },
      TEST_TIMEOUT,
    );
  });
});
