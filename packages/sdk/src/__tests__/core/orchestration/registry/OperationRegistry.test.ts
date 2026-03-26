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

import {
  Operation,
  resetOperationRegistry,
} from '../../../../core/decorator/OperationDecorator.js';
import { OperationRegistry } from '../../../../core/orchestration/registry/OperationRegistry.js';
import { ContractQueryRegistry } from '../../../../core/orchestration/registry/ContractQueryRegistry.js';
import { OPERATION_CONFIGS } from '../../../../core/operations/config/operations.js';
import { QUERY_CONFIGS } from '../../../../core/operations/config/queries.js';

// ── OperationRegistry tests ──────────────────────────────────────────────

describe('OperationRegistry', () => {
  beforeEach(() => {
    resetOperationRegistry();
  });

  afterEach(() => {
    resetOperationRegistry();
  });

  it('loads all config-driven operations by default', () => {
    const registry = new OperationRegistry();

    expect(registry.getAll().size).toBe(OPERATION_CONFIGS.length);
    for (const config of OPERATION_CONFIGS) {
      expect(registry.has(config.name)).toBe(true);
    }
  });

  it('also loads decorator-driven operations', () => {
    @Operation('customOp')
    class CustomOpHandler {
      getMethodName() { return 'customOp'; }
    }

    const registry = new OperationRegistry();

    expect(registry.getAll().size).toBe(OPERATION_CONFIGS.length + 1);
    expect(registry.has('customOp')).toBe(true);
  });

  it('registry.get(name) returns the correct instance', () => {
    const registry = new OperationRegistry();

    const burnOp = registry.get('burn');
    expect(burnOp).toBeDefined();
    expect((burnOp as any).getMethodName()).toBe('burn');
  });

  it('registry.get(nonexistent) throws a descriptive error', () => {
    const registry = new OperationRegistry();

    expect(() => registry.get('nonExistentCommand')).toThrow(
      "No entry registered for 'nonExistentCommand'"
    );
  });

  it('registry.has(name) returns false for unregistered commands', () => {
    const registry = new OperationRegistry();

    expect(registry.has('doesNotExist')).toBe(false);
  });

  it('registry.getAll() returns a copy (mutations do not affect the registry)', () => {
    const registry = new OperationRegistry();
    const copy = registry.getAll();
    copy.delete('burn');

    expect(registry.has('burn')).toBe(true);
  });
});

// ── ContractQueryRegistry tests ────────────────────────────────────────────────

describe('ContractQueryRegistry', () => {
  it('loads all config-driven queries', () => {
    const registry = new ContractQueryRegistry();

    // QUERY_CONFIGS (config-driven) + 1 custom query (getHold)
    expect(registry.getAll().size).toBe(QUERY_CONFIGS.length + 1);
    for (const config of QUERY_CONFIGS) {
      expect(registry.has(config.name)).toBe(true);
    }
  });

  it('registry.get(name) returns the correct instance', () => {
    const registry = new ContractQueryRegistry();

    const query = registry.get('getBalance');
    expect(query).toBeDefined();
    expect(query.getMethodName()).toBe('balanceOf');
  });

  it('registry.get(nonexistent) throws a descriptive error', () => {
    const registry = new ContractQueryRegistry();

    expect(() => registry.get('nonExistentQuery')).toThrow(
      "No entry registered for 'nonExistentQuery'"
    );
  });

  it('registry.has(name) returns false for unregistered queries', () => {
    const registry = new ContractQueryRegistry();

    expect(registry.has('doesNotExist')).toBe(false);
  });

  it('registry.getAll() returns a copy (mutations do not affect the registry)', () => {
    const registry = new ContractQueryRegistry();
    const copy = registry.getAll();
    copy.delete('getBalance');

    expect(registry.has('getBalance')).toBe(true);
  });
});
