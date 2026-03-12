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

import { resetQueryRegistry } from '../../../../core/decorators/Query.js';
import { GetHeldAmountHandler } from '../../../../core/handlers/queries/GetHeldAmountHandler.js';
import { GetHoldCountHandler } from '../../../../core/handlers/queries/GetHoldCountHandler.js';
import { GetHoldHandler } from '../../../../core/handlers/queries/GetHoldHandler.js';
import { GetHoldsIdHandler } from '../../../../core/handlers/queries/GetHoldsIdHandler.js';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';
const CONTRACT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

describe('Hold Query Handlers', () => {
  afterEach(() => {
    resetQueryRegistry();
  });

  describe('GetHeldAmountHandler', () => {
    let handler: GetHeldAmountHandler;
    beforeEach(() => { handler = new GetHeldAmountHandler(); });

    it('should have methodName getHeldAmountFor', () => {
      expect(handler.getMethodName()).toBe('getHeldAmountFor');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, targetId: VALID_ADDRESS });
      expect(args).toEqual([VALID_ADDRESS]);
    });

    it('should create result from data', () => {
      const result = (handler as any).createResult(BigInt('250'));
      expect(result).toEqual({ success: true, amount: '250' });
    });
  });

  describe('GetHoldCountHandler', () => {
    let handler: GetHoldCountHandler;
    beforeEach(() => { handler = new GetHoldCountHandler(); });

    it('should have methodName getHoldCountFor', () => {
      expect(handler.getMethodName()).toBe('getHoldCountFor');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, targetId: VALID_ADDRESS });
      expect(args).toEqual([VALID_ADDRESS]);
    });

    it('should create result from data', () => {
      const result = (handler as any).createResult(5);
      expect(result).toEqual({ success: true, count: 5 });
    });

    it('should handle zero count', () => {
      const result = (handler as any).createResult(0);
      expect(result).toEqual({ success: true, count: 0 });
    });
  });

  describe('GetHoldHandler', () => {
    let handler: GetHoldHandler;
    beforeEach(() => { handler = new GetHoldHandler(); });

    it('should have methodName getHoldFor', () => {
      expect(handler.getMethodName()).toBe('getHoldFor');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, targetId: VALID_ADDRESS, holdId: 1 });
      expect(args).toEqual([VALID_ADDRESS, 1]);
    });

    it('should create result from tuple data', () => {
      const mockHold = {
        holdId: '0x01',
        recipient: VALID_ADDRESS,
        notary: VALID_ADDRESS,
        amount: BigInt('100'),
        expiration: BigInt('999999'),
        releaseTime: BigInt('0'),
      };
      const result = (handler as any).createResult(mockHold);
      expect(result.success).toBe(true);
      expect(result.hold).toBeDefined();
    });
  });

  describe('GetHoldsIdHandler', () => {
    let handler: GetHoldsIdHandler;
    beforeEach(() => { handler = new GetHoldsIdHandler(); });

    it('should have methodName getHoldsIdFor', () => {
      expect(handler.getMethodName()).toBe('getHoldsIdFor');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, targetId: VALID_ADDRESS, start: 0, end: 10 });
      expect(args).toEqual([VALID_ADDRESS, 0, 10]);
    });

    it('should create result from array', () => {
      const ids = [BigInt(1), BigInt(2), BigInt(3)];
      const result = (handler as any).createResult(ids);
      expect(result.success).toBe(true);
      expect(result.holdIds).toEqual(['1', '2', '3']);
    });

    it('should handle non-array data', () => {
      const result = (handler as any).createResult(null);
      expect(result).toEqual({ success: true, holdIds: [] });
    });
  });
});
