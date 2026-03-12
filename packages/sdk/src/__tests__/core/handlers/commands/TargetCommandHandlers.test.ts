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
import { FreezeHandler } from '../../../../core/handlers/commands/FreezeHandler.js';
import { UnfreezeHandler } from '../../../../core/handlers/commands/UnfreezeHandler.js';
import { GrantKycHandler } from '../../../../core/handlers/commands/GrantKycHandler.js';
import { RevokeKycHandler } from '../../../../core/handlers/commands/RevokeKycHandler.js';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';

describe('Target Command Handlers (Freeze, Unfreeze, GrantKyc, RevokeKyc)', () => {
  afterEach(() => {
    resetCommandRegistry();
  });

  describe('FreezeHandler', () => {
    let handler: FreezeHandler;
    beforeEach(() => { handler = new FreezeHandler(); });

    it('should have methodName freeze', () => {
      expect(handler.getMethodName()).toBe('freeze');
    });

    it('should validate targetId required', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS })).not.toThrow();
      expect(() => handler.validate({ targetId: '' })).toThrow('Target account required');
    });

    it('should build hedera transaction', () => {
      const tx = handler.buildHederaTransaction({ targetId: VALID_ADDRESS });
      expect(tx).toBeDefined();
    });

    it('should build EVM transaction', async () => {
      const tx = await handler.buildEVMTransaction({ targetId: VALID_ADDRESS });
      expect((tx as any).data).toBeDefined();
    });
  });

  describe('UnfreezeHandler', () => {
    let handler: UnfreezeHandler;
    beforeEach(() => { handler = new UnfreezeHandler(); });

    it('should have methodName unfreeze', () => {
      expect(handler.getMethodName()).toBe('unfreeze');
    });

    it('should validate targetId', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS })).not.toThrow();
    });
  });

  describe('GrantKycHandler', () => {
    let handler: GrantKycHandler;
    beforeEach(() => { handler = new GrantKycHandler(); });

    it('should have methodName grantKyc', () => {
      expect(handler.getMethodName()).toBe('grantKyc');
    });

    it('should validate targetId', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS })).not.toThrow();
    });
  });

  describe('RevokeKycHandler', () => {
    let handler: RevokeKycHandler;
    beforeEach(() => { handler = new RevokeKycHandler(); });

    it('should have methodName revokeKyc', () => {
      expect(handler.getMethodName()).toBe('revokeKyc');
    });

    it('should validate targetId', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS })).not.toThrow();
    });
  });
});
