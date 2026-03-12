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

import { getRegisteredCommands, resetCommandRegistry } from '../../../core/decorators/Command.js';
import { getRegisteredQueries, resetQueryRegistry } from '../../../core/decorators/Query.js';

// Import all handlers to trigger @Command/@Query registration
import '../../../core/handlers/commands/index.js';
import '../../../core/handlers/queries/index.js';

const EXPECTED_COMMANDS = [
  'pause', 'unpause', 'delete',
  'burn', 'rescue', 'rescueHBAR',
  'freeze', 'unfreeze', 'grantKyc', 'revokeKyc',
  'cashIn', 'wipe', 'transfer',
  'grantRole', 'revokeRole',
  'increaseAllowance', 'decreaseAllowance', 'resetAllowance',
  'grantSupplierRole', 'revokeSupplierRole', 'grantUnlimitedSupplierRole',
  'createHold', 'releaseHold', 'reclaimHold', 'executeHold',
  'updateReserveAddress', 'updateReserveAmount',
  'create',
];

const EXPECTED_QUERIES = [
  'getBalance', 'getBurnableAmount', 'getReserveAddress', 'getReserveAmount',
  'hasRole', 'getRoles', 'getAccountsWithRoles', 'getAllowance', 'isUnlimited',
  'getHeldAmount', 'getHoldCount', 'getHold', 'getHoldsId',
];

describe('Registry Completeness', () => {
  afterAll(() => {
    resetCommandRegistry();
    resetQueryRegistry();
  });

  describe('Command Registry', () => {
    it(`should have all ${EXPECTED_COMMANDS.length} commands registered`, () => {
      const registry = getRegisteredCommands();
      for (const cmd of EXPECTED_COMMANDS) {
        expect(registry.has(cmd)).toBe(true);
      }
    });

    it('should have exactly the expected number of commands', () => {
      const registry = getRegisteredCommands();
      expect(registry.size).toBe(EXPECTED_COMMANDS.length);
    });

    it('should instantiate all command handlers', () => {
      const registry = getRegisteredCommands();
      for (const [name, HandlerClass] of registry) {
        const handler = new HandlerClass();
        expect(handler).toBeDefined();
      }
    });
  });

  describe('Query Registry', () => {
    it(`should have all ${EXPECTED_QUERIES.length} queries registered`, () => {
      const registry = getRegisteredQueries();
      for (const q of EXPECTED_QUERIES) {
        expect(registry.has(q)).toBe(true);
      }
    });

    it('should have exactly the expected number of queries', () => {
      const registry = getRegisteredQueries();
      expect(registry.size).toBe(EXPECTED_QUERIES.length);
    });

    it('should instantiate all query handlers', () => {
      const registry = getRegisteredQueries();
      for (const [name, HandlerClass] of registry) {
        const handler = new HandlerClass();
        expect(handler).toBeDefined();
      }
    });
  });
});
