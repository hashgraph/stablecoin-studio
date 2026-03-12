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
import { HasRoleHandler } from '../../../../core/handlers/queries/HasRoleHandler.js';
import { GetRolesHandler } from '../../../../core/handlers/queries/GetRolesHandler.js';
import { GetAccountsWithRolesHandler } from '../../../../core/handlers/queries/GetAccountsWithRolesHandler.js';
import { GetAllowanceHandler } from '../../../../core/handlers/queries/GetAllowanceHandler.js';
import { IsUnlimitedHandler } from '../../../../core/handlers/queries/IsUnlimitedHandler.js';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';
const VALID_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000001';
const CONTRACT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

describe('Role Query Handlers', () => {
  afterEach(() => {
    resetQueryRegistry();
  });

  describe('HasRoleHandler', () => {
    let handler: HasRoleHandler;
    beforeEach(() => { handler = new HasRoleHandler(); });

    it('should have methodName hasRole', () => {
      expect(handler.getMethodName()).toBe('hasRole');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, role: VALID_ROLE, targetId: VALID_ADDRESS });
      expect(args).toEqual([VALID_ROLE, VALID_ADDRESS]);
    });

    it('should create result for true', () => {
      const result = (handler as any).createResult(true);
      expect(result).toEqual({ success: true, hasRole: true });
    });

    it('should create result for false', () => {
      const result = (handler as any).createResult(false);
      expect(result).toEqual({ success: true, hasRole: false });
    });
  });

  describe('GetRolesHandler', () => {
    let handler: GetRolesHandler;
    beforeEach(() => { handler = new GetRolesHandler(); });

    it('should have methodName getRoles', () => {
      expect(handler.getMethodName()).toBe('getRoles');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, targetId: VALID_ADDRESS });
      expect(args).toEqual([VALID_ADDRESS]);
    });

    it('should create result from array', () => {
      const roles = [VALID_ROLE, '0x0000000000000000000000000000000000000000000000000000000000000002'];
      const result = (handler as any).createResult(roles);
      expect(result.success).toBe(true);
      expect(result.roles).toHaveLength(2);
    });

    it('should handle non-array data', () => {
      const result = (handler as any).createResult(null);
      expect(result).toEqual({ success: true, roles: [] });
    });
  });

  describe('GetAccountsWithRolesHandler', () => {
    let handler: GetAccountsWithRolesHandler;
    beforeEach(() => { handler = new GetAccountsWithRolesHandler(); });

    it('should have methodName getAccountsWithRole', () => {
      expect(handler.getMethodName()).toBe('getAccountsWithRole');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, role: VALID_ROLE });
      expect(args).toEqual([VALID_ROLE]);
    });

    it('should create result from array', () => {
      const accounts = [VALID_ADDRESS];
      const result = (handler as any).createResult(accounts);
      expect(result).toEqual({ success: true, accounts: [VALID_ADDRESS] });
    });

    it('should handle non-array data', () => {
      const result = (handler as any).createResult(undefined);
      expect(result).toEqual({ success: true, accounts: [] });
    });
  });

  describe('GetAllowanceHandler', () => {
    let handler: GetAllowanceHandler;
    beforeEach(() => { handler = new GetAllowanceHandler(); });

    it('should have methodName supplierAllowance', () => {
      expect(handler.getMethodName()).toBe('supplierAllowance');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, targetId: VALID_ADDRESS });
      expect(args).toEqual([VALID_ADDRESS]);
    });

    it('should create result from data', () => {
      const result = (handler as any).createResult(BigInt('5000'));
      expect(result).toEqual({ success: true, allowance: '5000' });
    });
  });

  describe('IsUnlimitedHandler', () => {
    let handler: IsUnlimitedHandler;
    beforeEach(() => { handler = new IsUnlimitedHandler(); });

    it('should have methodName isUnlimitedSupplierAllowance', () => {
      expect(handler.getMethodName()).toBe('isUnlimitedSupplierAllowance');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, targetId: VALID_ADDRESS });
      expect(args).toEqual([VALID_ADDRESS]);
    });

    it('should create result for true', () => {
      const result = (handler as any).createResult(true);
      expect(result).toEqual({ success: true, isUnlimited: true });
    });

    it('should create result for false', () => {
      const result = (handler as any).createResult(false);
      expect(result).toEqual({ success: true, isUnlimited: false });
    });
  });
});
