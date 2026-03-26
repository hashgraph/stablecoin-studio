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

import { resetOperationRegistry } from '../../../core/decorator/OperationDecorator.js';
import { CreateStableCoinOperation } from '../../../core/operations/CreateStableCoinOperation.js';
import { ethers } from 'ethers';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';

describe('CreateStableCoinOperation', () => {
  let op: CreateStableCoinOperation;

  beforeEach(() => {
    op = new CreateStableCoinOperation();
  });

  afterEach(() => {
    resetOperationRegistry();
  });

  describe('getMethodName', () => {
    it('should return deployStableCoin', () => {
      expect(op.getMethodName()).toBe('deployStableCoin');
    });
  });

  describe('validateParams (via validate)', () => {
    const validBase = {
      name: 'TestToken',
      symbol: 'TEST',
      factoryAddress: VALID_ADDRESS,
      resolverAddress: VALID_ADDRESS,
      signerAddress: VALID_ADDRESS,
    };

    it('should validate all required params', () => {
      expect(() => op.validate(validBase)).not.toThrow();
    });

    it('should throw if name is missing', () => {
      expect(() => op.validate({ ...validBase, name: '' }))
        .toThrow('Token name is required');
    });

    it('should throw if symbol is missing', () => {
      expect(() => op.validate({ ...validBase, symbol: '' }))
        .toThrow('Token symbol is required');
    });

    it('should throw if factoryAddress is missing', () => {
      expect(() => op.validate({ ...validBase, factoryAddress: '' }))
        .toThrow('Factory address is required');
    });

    it('should throw if signerAddress is missing', () => {
      expect(() => op.validate({ ...validBase, signerAddress: '' }))
        .toThrow('Signer address is required');
    });

    it('should throw if decimals are out of range', () => {
      expect(() => op.validate({ ...validBase, decimals: 19 }))
        .toThrow('Decimals must be between 0 and 18');
    });
  });

  describe('buildHederaTransaction', () => {
    const validParams = {
      name: 'TestToken',
      symbol: 'TEST',
      factoryAddress: VALID_ADDRESS,
      resolverAddress: VALID_ADDRESS,
      signerAddress: VALID_ADDRESS,
    };

    it('should build a ContractExecuteTransaction targeting the factory', () => {
      const tx = op.buildHederaTransaction(validParams);
      // Should be a ContractExecuteTransaction with payable amount
      expect(tx).toBeDefined();
      expect(tx.constructor.name).toBe('ContractExecuteTransaction');
    });
  });

  describe('buildEVMTransaction', () => {
    const validParams = {
      name: 'TestToken',
      symbol: 'TEST',
      factoryAddress: VALID_ADDRESS,
      resolverAddress: VALID_ADDRESS,
      signerAddress: VALID_ADDRESS,
    };

    it('should encode the factory call with value', async () => {
      const tx = await op.buildEVMTransaction(validParams) as any;
      expect(tx.to).toBe(VALID_ADDRESS);
      expect(tx.data).toBeDefined();
      expect(tx.value).toBe(ethers.parseEther('45'));
    });
  });
});
