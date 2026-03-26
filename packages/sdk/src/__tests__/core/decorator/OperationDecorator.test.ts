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
  getRegisteredOperations,
  resetOperationRegistry,
} from '../../../core/decorator/OperationDecorator.js';

// ── Command decorator tests ────────────────────────────────────────────────────

describe('Operation decorator', () => {
  beforeEach(() => {
    resetOperationRegistry();
  });

  afterEach(() => {
    resetOperationRegistry();
  });

  it('registers a class in the command registry when decorated', () => {
    @Operation('createToken')
    class CreateTokenHandler {
      execute() { return { success: true }; }
    }

    const registry = getRegisteredOperations();
    expect(registry.has('createToken')).toBe(true);
    expect(registry.get('createToken')).toBe(CreateTokenHandler);
  });

  it('throws when registering the same command name twice', () => {
    @Operation('mintToken')
    class MintTokenHandler {}

    expect(() => {
      @Operation('mintToken')
      class DuplicateMintHandler {}
    }).toThrow("Operation 'mintToken' already registered.");
  });

  it('resetOperationRegistry() clears all registered commands', () => {
    @Operation('burnToken')
    class BurnTokenHandler {}

    expect(getRegisteredOperations().size).toBe(1);

    resetOperationRegistry();

    expect(getRegisteredOperations().size).toBe(0);
  });

  it('getRegisteredOperations() returns all registered classes', () => {
    @Operation('transferToken')
    class TransferTokenHandler {}

    @Operation('wipeToken')
    class WipeTokenHandler {}

    const registry = getRegisteredOperations();
    expect(registry.size).toBe(2);
    expect(registry.get('transferToken')).toBe(TransferTokenHandler);
    expect(registry.get('wipeToken')).toBe(WipeTokenHandler);
  });

  it('getRegisteredOperations() returns a copy (mutations do not affect the internal registry)', () => {
    @Operation('pauseToken')
    class PauseTokenHandler {}

    const copy = getRegisteredOperations();
    copy.delete('pauseToken');

    // Internal registry is unaffected
    const second = getRegisteredOperations();
    expect(second.has('pauseToken')).toBe(true);
  });

  it('decorated class is still usable as a normal class', () => {
    @Operation('freezeToken')
    class FreezeTokenHandler {
      execute() { return 'frozen'; }
    }

    const instance = new FreezeTokenHandler();
    expect(instance.execute()).toBe('frozen');
  });
});
