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

import { OperationRegistry } from '../../../core/orchestration/registry/OperationRegistry.js';
import { ContractQueryRegistry } from '../../../core/orchestration/registry/ContractQueryRegistry.js';
import { OPERATION_CONFIGS } from '../../../core/operations/config/operations.js';
import { QUERY_CONFIGS } from '../../../core/operations/config/queries.js';

// Import to trigger @Operation decorators
import '../../../core/operations/CreateStableCoinOperation.js';
import '../../../core/operations/UpdateTokenOperation.js';
import '../../../core/operations/UpdateCustomFeesOperation.js';
import '../../../core/operations/CreateHoldByControllerOperation.js';
import '../../../core/operations/MultiRoleOperations.js';
import '../../../core/operations/HoldOperations.js';

const EXPECTED_OPERATIONS = [
  ...OPERATION_CONFIGS.map((c) => c.name),
  'create',                  // CreateStableCoinOperation (decorator-driven)
  'updateToken',             // UpdateTokenOperation (decorator-driven)
  'updateCustomFees',        // UpdateCustomFeesOperation (decorator-driven)
  'createHoldByController',  // CreateHoldByControllerOperation (decorator-driven)
  'grantMultiRoles',         // GrantMultiRolesOperation (decorator-driven)
  'revokeMultiRoles',        // RevokeMultiRolesOperation (decorator-driven)
  'createHold',              // CreateHoldOperation (decorator-driven)
  'executeHold',             // ExecuteHoldOperation (decorator-driven)
  'releaseHold',             // ReleaseHoldOperation (decorator-driven)
  'reclaimHold',             // ReclaimHoldOperation (decorator-driven)
];

const EXPECTED_QUERIES = [
  ...QUERY_CONFIGS.map((c) => c.name),
  'getHold',              // GetHoldQuery (custom — tuple parameter)
];

describe('Registry Completeness', () => {
  describe('Operation Registry', () => {
    let registry: OperationRegistry;

    beforeAll(() => {
      registry = new OperationRegistry();
    });

    it(`should have all ${EXPECTED_OPERATIONS.length} operations registered`, () => {
      for (const name of EXPECTED_OPERATIONS) {
        expect(registry.has(name)).toBe(true);
      }
    });

    it('should have exactly the expected number of operations', () => {
      expect(registry.getAll().size).toBe(EXPECTED_OPERATIONS.length);
    });

    it('should return valid instances for all operations', () => {
      for (const name of EXPECTED_OPERATIONS) {
        const operation = registry.get(name);
        expect(operation).toBeDefined();
        // Config-driven ops have getMethodName(), composite ops have getCommandName()
        const op = operation as any;
        const identifier = op.getMethodName?.() ?? op.getCommandName?.();
        expect(identifier).toBeDefined();
      }
    });
  });

  describe('Query Registry', () => {
    let registry: ContractQueryRegistry;

    beforeAll(() => {
      registry = new ContractQueryRegistry();
    });

    it(`should have all ${EXPECTED_QUERIES.length} queries registered`, () => {
      for (const name of EXPECTED_QUERIES) {
        expect(registry.has(name)).toBe(true);
      }
    });

    it('should have exactly the expected number of queries', () => {
      expect(registry.getAll().size).toBe(EXPECTED_QUERIES.length);
    });

    it('should return valid instances for all queries', () => {
      for (const name of EXPECTED_QUERIES) {
        const query = registry.get(name);
        expect(query).toBeDefined();
        expect(query.getMethodName()).toBeDefined();
      }
    });
  });
});
