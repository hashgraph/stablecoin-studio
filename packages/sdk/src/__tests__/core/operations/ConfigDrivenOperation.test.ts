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

import { ConfigDrivenOperation } from '../../../core/operations/ConfigDrivenOperation.js';
import { OperationConfig } from '../../../core/operations/config/configTypes.js';

describe('ConfigDrivenOperation', () => {
  // ── No-arg operation (like pause) ───────────────────────────────
  describe('no-arg operation', () => {
    const config: OperationConfig = {
      name: 'pause', method: 'pause', abi: 'function pause()', gas: 80_000,
    };
    let op: ConfigDrivenOperation;

    beforeEach(() => { op = new ConfigDrivenOperation(config); });

    it('should build Hedera transaction', () => {
      const tx = op.buildHederaTransaction({});
      expect(tx).toBeDefined();
      expect(tx.constructor.name).toBe('ContractExecuteTransaction');
    });

    it('should build EVM transaction', async () => {
      const tx = await op.buildEVMTransaction({});
      expect((tx as any).data).toBeDefined();
      expect((tx as any).data.startsWith('0x')).toBe(true);
    });

    it('should create default result', () => {
      const result = op.extractResult({ transactionId: 'tx-1' }, {});
      expect(result).toEqual({ success: true, transactionId: 'tx-1' });
    });

    it('should support hedera and evm by default', () => {
      expect(op.supportsMode('hedera')).toBe(true);
      expect(op.supportsMode('evm')).toBe(true);
    });

    it('should return method name', () => {
      expect(op.getMethodName()).toBe('pause');
    });
  });

  // ── Single address arg (like freeze) ────────────────────────────
  describe('address arg operation', () => {
    const config: OperationConfig = {
      name: 'freeze', method: 'freeze',
      abi: 'function freeze(address account)', gas: 80_000,
      args: [{ param: 'targetId', type: 'address' }],
    };
    let op: ConfigDrivenOperation;

    beforeEach(() => { op = new ConfigDrivenOperation(config); });

    it('should build Hedera transaction with address', () => {
      const tx = op.buildHederaTransaction({ targetId: '0x0000000000000000000000000000000000001234' });
      expect(tx).toBeDefined();
    });

    it('should build EVM transaction with address', async () => {
      const tx = await op.buildEVMTransaction({ targetId: '0x0000000000000000000000000000000000001234' });
      expect((tx as any).data).toContain('1234');
    });

    it('should validate address is required', () => {
      expect(() => op.validate({ targetId: '' })).toThrow('targetId is required');
      expect(() => op.validate({ targetId: undefined })).toThrow('targetId is required');
    });

    it('should accept valid address', () => {
      expect(() => op.validate({ targetId: '0x0000000000000000000000000000000000001234' })).not.toThrow();
    });
  });

  // ── Single uint256 arg (like burn) ──────────────────────────────
  describe('uint256 arg operation', () => {
    const config: OperationConfig = {
      name: 'burn', method: 'burn',
      abi: 'function burn(uint256 amount)', gas: 100_000,
      args: [{ param: 'amount', type: 'uint256' }],
      resultFields: ['amount'],
    };
    let op: ConfigDrivenOperation;

    beforeEach(() => { op = new ConfigDrivenOperation(config); });

    it('should build Hedera transaction with uint256', () => {
      const tx = op.buildHederaTransaction({ amount: '100' });
      expect(tx).toBeDefined();
    });

    it('should build EVM transaction with uint256', async () => {
      const tx = await op.buildEVMTransaction({ amount: '100' });
      expect((tx as any).data).toBeDefined();
    });

    it('should reject zero amount', () => {
      expect(() => op.validate({ amount: '0' })).toThrow('Amount must be positive');
    });

    it('should reject negative amount', () => {
      expect(() => op.validate({ amount: '-1' })).toThrow('Amount must be positive');
    });

    it('should accept positive amount', () => {
      expect(() => op.validate({ amount: '100' })).not.toThrow();
    });

    it('should echo amount in result', () => {
      const result = op.extractResult({ transactionId: 'tx-1' }, { amount: '500' });
      expect(result).toEqual({
        success: true, transactionId: 'tx-1', amount: '500',
      });
    });
  });

  // ── uint256 with allowZero (like updateReserveAmount) ───────────
  describe('uint256 with allowZero', () => {
    const config: OperationConfig = {
      name: 'updateReserveAmount', method: 'updateReserveAmount',
      abi: 'function updateReserveAmount(uint256 amount)', gas: 80_000,
      args: [{ param: 'amount', type: 'uint256', allowZero: true }],
      resultFields: ['amount'],
    };
    let op: ConfigDrivenOperation;

    beforeEach(() => { op = new ConfigDrivenOperation(config); });

    it('should accept zero amount', () => {
      expect(() => op.validate({ amount: '0' })).not.toThrow();
    });

    it('should accept positive amount', () => {
      expect(() => op.validate({ amount: '100' })).not.toThrow();
    });
  });

  // ── bytes32 arg (like releaseHold) ──────────────────────────────
  describe('bytes32 arg operation', () => {
    const config: OperationConfig = {
      name: 'releaseHold', method: 'releaseHold',
      abi: 'function releaseHold(bytes32 holdId)', gas: 80_000,
      args: [{ param: 'holdId', type: 'bytes32' }],
    };
    let op: ConfigDrivenOperation;

    beforeEach(() => { op = new ConfigDrivenOperation(config); });

    it('should build Hedera transaction with bytes32', () => {
      const tx = op.buildHederaTransaction({ holdId: '0x1234000000000000000000000000000000000000000000000000000000000000' });
      expect(tx).toBeDefined();
    });

    it('should validate bytes32 is required', () => {
      expect(() => op.validate({ holdId: '' })).toThrow('holdId is required');
    });

    it('should accept valid bytes32', () => {
      expect(() => op.validate({ holdId: '0x1234000000000000000000000000000000000000000000000000000000000000' })).not.toThrow();
    });
  });

  // ── Mixed args (like transfer: address+address+uint256) ─────────
  describe('mixed args operation', () => {
    const config: OperationConfig = {
      name: 'transfer', method: 'transfer',
      abi: 'function transfer(address from, address to, uint256 amount)', gas: 120_000,
      args: [
        { param: 'fromId', type: 'address' },
        { param: 'targetId', type: 'address' },
        { param: 'amount', type: 'uint256' },
      ],
      resultFields: ['fromId', 'targetId', 'amount'],
    };
    let op: ConfigDrivenOperation;

    beforeEach(() => { op = new ConfigDrivenOperation(config); });

    it('should build Hedera transaction with mixed args', () => {
      const tx = op.buildHederaTransaction({
        fromId: '0x0000000000000000000000000000000000001111',
        targetId: '0x0000000000000000000000000000000000002222',
        amount: '100',
      });
      expect(tx).toBeDefined();
    });

    it('should validate all args', () => {
      expect(() => op.validate({
        fromId: '', targetId: '0x0000000000000000000000000000000000002222', amount: '100',
      })).toThrow('fromId is required');

      expect(() => op.validate({
        fromId: '0x0000000000000000000000000000000000001111', targetId: '0x0000000000000000000000000000000000002222', amount: '0',
      })).toThrow('Amount must be positive');
    });

    it('should echo all resultFields', () => {
      const result = op.extractResult({ transactionId: 'tx-1' }, {
        fromId: '0x1', targetId: '0x2', amount: '500',
      });
      expect(result).toEqual({
        success: true, transactionId: 'tx-1',
        fromId: '0x1', targetId: '0x2', amount: '500',
      });
    });
  });

  // ── bytes32 + address (like grantRole) ──────────────────────────
  describe('bytes32 + address args', () => {
    const config: OperationConfig = {
      name: 'grantRole', method: 'grantRole',
      abi: 'function grantRole(bytes32 role, address account)', gas: 80_000,
      args: [
        { param: 'role', type: 'bytes32' },
        { param: 'targetId', type: 'address' },
      ],
    };
    let op: ConfigDrivenOperation;

    beforeEach(() => { op = new ConfigDrivenOperation(config); });

    it('should build Hedera transaction with bytes32 + address', () => {
      const tx = op.buildHederaTransaction({
        role: '0xabcd000000000000000000000000000000000000000000000000000000000000',
        targetId: '0x0000000000000000000000000000000000001234',
      });
      expect(tx).toBeDefined();
    });

    it('should validate both args', () => {
      expect(() => op.validate({ role: '', targetId: '0x1234' })).toThrow('role is required');
      expect(() => op.validate({ role: '0xabc0000000000000000000000000000000000000000000000000000000000000', targetId: '' })).toThrow('targetId is required');
    });
  });

  // ── 5-arg operation (like createHold) ───────────────────────────
  describe('multi-arg operation', () => {
    const config: OperationConfig = {
      name: 'createHold', method: 'createHold',
      abi: 'function createHold(bytes32 holdId, address recipient, address notary, uint256 amount, uint256 expiration)',
      gas: 150_000,
      args: [
        { param: 'holdId', type: 'bytes32' },
        { param: 'recipient', type: 'address' },
        { param: 'notary', type: 'address' },
        { param: 'amount', type: 'uint256' },
        { param: 'expiration', type: 'uint256' },
      ],
    };
    let op: ConfigDrivenOperation;

    beforeEach(() => { op = new ConfigDrivenOperation(config); });

    it('should build Hedera transaction with 5 args', () => {
      const tx = op.buildHederaTransaction({
        holdId: '0x1234000000000000000000000000000000000000000000000000000000000000',
        recipient: '0x0000000000000000000000000000000000001111',
        notary: '0x0000000000000000000000000000000000002222',
        amount: '100',
        expiration: '999',
      });
      expect(tx).toBeDefined();
    });
  });

  // ── staticResult (constant fields in result) ────────────────────
  describe('staticResult', () => {
    const config: OperationConfig = {
      name: 'pause', method: 'pause', abi: 'function pause()', gas: 80_000,
      staticResult: { paused: true },
    };
    let op: ConfigDrivenOperation;

    beforeEach(() => { op = new ConfigDrivenOperation(config); });

    it('should include static fields in result', () => {
      const result = op.extractResult({ transactionId: 'tx-1' }, {});
      expect(result).toEqual({
        success: true, transactionId: 'tx-1', paused: true,
      });
    });
  });

  // ── Null receipt handling ───────────────────────────────────────
  describe('null receipt', () => {
    const config: OperationConfig = {
      name: 'test', method: 'test', abi: 'function test()', gas: 80_000,
    };

    it('should handle null receipt gracefully', () => {
      const op = new ConfigDrivenOperation(config);
      const result = op.extractResult(null, {});
      expect(result).toEqual({ success: true, transactionId: '' });
    });
  });

  // ── Config array integration ────────────────────────────────────
  describe('OPERATION_CONFIGS integration', () => {
    it('should instantiate all 27 operations from config', async () => {
      const { OPERATION_CONFIGS } = await import('../../../core/operations/config/operations.js');
      expect(OPERATION_CONFIGS.length).toBe(27);

      for (const config of OPERATION_CONFIGS) {
        const op = new ConfigDrivenOperation(config);
        expect(op.getMethodName()).toBe(config.method);
        expect(op.supportsMode('hedera')).toBe(true);
        expect(op.supportsMode('evm')).toBe(true);
      }
    });
  });
});
