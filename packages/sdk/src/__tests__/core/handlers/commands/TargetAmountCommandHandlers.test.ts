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
import { CashInHandler } from '../../../../core/handlers/commands/CashInHandler.js';
import { WipeHandler } from '../../../../core/handlers/commands/WipeHandler.js';
import { TransferHandler } from '../../../../core/handlers/commands/TransferHandler.js';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';

describe('TargetAmount Command Handlers (CashIn, Wipe, Transfer)', () => {
  afterEach(() => {
    resetCommandRegistry();
  });

  describe('CashInHandler', () => {
    let handler: CashInHandler;
    beforeEach(() => { handler = new CashInHandler(); });

    it('should have methodName mint', () => {
      expect(handler.getMethodName()).toBe('mint');
    });

    it('should validate targetId and amount', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS, amount: '100' })).not.toThrow();
      expect(() => handler.validate({ targetId: '', amount: '100' })).toThrow('Target account required');
      expect(() => handler.validate({ targetId: VALID_ADDRESS, amount: '0' })).toThrow('Amount must be positive');
    });

    it('should build hedera transaction', () => {
      const tx = handler.buildHederaTransaction({ targetId: VALID_ADDRESS, amount: '100' });
      expect(tx).toBeDefined();
    });

    it('should return result with targetId and amount', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, { targetId: VALID_ADDRESS, amount: '500' }) as any;
      expect(result.success).toBe(true);
      expect(result.targetId).toBe(VALID_ADDRESS);
      expect(result.amount).toBe('500');
    });
  });

  describe('WipeHandler', () => {
    let handler: WipeHandler;
    beforeEach(() => { handler = new WipeHandler(); });

    it('should have methodName wipe', () => {
      expect(handler.getMethodName()).toBe('wipe');
    });

    it('should validate targetId and amount', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS, amount: '100' })).not.toThrow();
    });

    it('should return result with targetId and amount', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, { targetId: VALID_ADDRESS, amount: '200' }) as any;
      expect(result.targetId).toBe(VALID_ADDRESS);
      expect(result.amount).toBe('200');
    });
  });

  describe('TransferHandler', () => {
    let handler: TransferHandler;
    beforeEach(() => { handler = new TransferHandler(); });

    it('should have methodName transfer', () => {
      expect(handler.getMethodName()).toBe('transfer');
    });

    it('should validate all three params', () => {
      expect(() => handler.validate({ fromId: VALID_ADDRESS, targetId: VALID_ADDRESS, amount: '100' })).not.toThrow();
      expect(() => handler.validate({ fromId: '', targetId: VALID_ADDRESS, amount: '100' })).toThrow('From account required');
      expect(() => handler.validate({ fromId: VALID_ADDRESS, targetId: '', amount: '100' })).toThrow('Target account required');
    });

    it('should return result with fromId, targetId, and amount', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, { fromId: VALID_ADDRESS, targetId: VALID_ADDRESS, amount: '300' }) as any;
      expect(result.success).toBe(true);
      expect(result.fromId).toBe(VALID_ADDRESS);
      expect(result.targetId).toBe(VALID_ADDRESS);
      expect(result.amount).toBe('300');
    });
  });
});
