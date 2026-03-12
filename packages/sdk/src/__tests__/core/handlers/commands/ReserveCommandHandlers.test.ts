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
import { UpdateReserveAddressHandler } from '../../../../core/handlers/commands/UpdateReserveAddressHandler.js';
import { UpdateReserveAmountHandler } from '../../../../core/handlers/commands/UpdateReserveAmountHandler.js';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';

describe('Reserve Command Handlers', () => {
  afterEach(() => {
    resetCommandRegistry();
  });

  describe('UpdateReserveAddressHandler', () => {
    let handler: UpdateReserveAddressHandler;
    beforeEach(() => { handler = new UpdateReserveAddressHandler(); });

    it('should have methodName updateReserveAddress', () => {
      expect(handler.getMethodName()).toBe('updateReserveAddress');
    });

    it('should validate reserveAddress', () => {
      expect(() => handler.validate({ reserveAddress: VALID_ADDRESS })).not.toThrow();
      expect(() => handler.validate({ reserveAddress: '' })).toThrow('Reserve address required');
    });

    it('should build hedera transaction', () => {
      const tx = handler.buildHederaTransaction({ reserveAddress: VALID_ADDRESS });
      expect(tx).toBeDefined();
    });
  });

  describe('UpdateReserveAmountHandler', () => {
    let handler: UpdateReserveAmountHandler;
    beforeEach(() => { handler = new UpdateReserveAmountHandler(); });

    it('should have methodName updateReserveAmount', () => {
      expect(handler.getMethodName()).toBe('updateReserveAmount');
    });

    it('should validate amount is non-negative', () => {
      expect(() => handler.validate({ amount: '0' })).not.toThrow();
      expect(() => handler.validate({ amount: '1000' })).not.toThrow();
      expect(() => handler.validate({ amount: '-1' })).toThrow('Amount must be non-negative');
    });

    it('should return amount in result', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, { amount: '500' }) as any;
      expect(result.success).toBe(true);
      expect(result.amount).toBe('500');
    });
  });
});
