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

import { resetCommandRegistry } from '../../../../core/decorators/Command.js';
import { CreateStableCoinHandler } from '../../../../core/handlers/commands/CreateStableCoinHandler.js';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';

describe('CreateStableCoinHandler', () => {
  let handler: CreateStableCoinHandler;

  beforeEach(() => {
    handler = new CreateStableCoinHandler();
  });

  afterEach(() => {
    resetCommandRegistry();
  });

  describe('getCommandName', () => {
    it('should return create', () => {
      expect(handler.getCommandName()).toBe('create');
    });
  });

  describe('validateParams', () => {
    const validBase = {
      name: 'TestToken',
      symbol: 'TEST',
      decimals: 18,
      factoryAddress: VALID_ADDRESS,
      resolverAddress: VALID_ADDRESS,
      createReserve: false,
    };

    it('should validate all required params', () => {
      expect(() => (handler as any).validateParams(validBase)).not.toThrow();
    });

    it('should throw if name is missing', () => {
      expect(() => (handler as any).validateParams({ ...validBase, name: '' }))
        .toThrow('Token name is required');
    });

    it('should throw if symbol is missing', () => {
      expect(() => (handler as any).validateParams({ ...validBase, symbol: '' }))
        .toThrow('Token symbol is required');
    });

    it('should throw if decimals are out of range', () => {
      expect(() => (handler as any).validateParams({ ...validBase, decimals: 19 }))
        .toThrow('Decimals must be between 0 and 18');
    });
  });

  describe('getSubCommands', () => {
    const baseParams = {
      name: 'TestToken',
      symbol: 'TEST',
      decimals: 18,
      factoryAddress: VALID_ADDRESS,
      resolverAddress: VALID_ADDRESS,
    };

    it('should return 2 sub-commands when no reserve', () => {
      const subCommands = (handler as any).getSubCommands({
        ...baseParams,
        createReserve: false,
      });

      expect(subCommands).toHaveLength(2);
      expect(subCommands[0].command).toBe('deployProxy');
      expect(subCommands[1].command).toBe('initializeToken');
    });

    it('should return 3 sub-commands when reserve is enabled', () => {
      const subCommands = (handler as any).getSubCommands({
        ...baseParams,
        createReserve: true,
        reserveAddress: VALID_ADDRESS,
      });

      expect(subCommands).toHaveLength(3);
      expect(subCommands[2].command).toBe('configureReserve');
    });
  });

  describe('execute', () => {
    const baseParams = {
      name: 'TestToken',
      symbol: 'TEST',
      decimals: 18,
      factoryAddress: VALID_ADDRESS,
      resolverAddress: VALID_ADDRESS,
    };

    it('should execute sub-commands in order', async () => {
      const executionOrder: string[] = [];
      const executor = jest.fn().mockImplementation(async (command: string) => {
        executionOrder.push(command);
        if (command === 'deployProxy') {
          return { success: true, transactionId: 'tx-1', proxyAddress: '0xProxy' };
        }
        return { success: true, transactionId: 'tx-2', tokenId: 'token-123' };
      });

      const result = await handler.execute(executor, {
        ...baseParams,
        createReserve: false,
      });

      expect(executionOrder).toEqual(['deployProxy', 'initializeToken']);
      expect(result.proxyAddress).toBe('0xProxy');
      expect(result.tokenId).toBe('token-123');
    });
  });
});
