import { resetCommandRegistry } from '../../../../core/decorators/Command.js';
import { GrantRoleHandler } from '../../../../core/handlers/commands/GrantRoleHandler.js';
import { RevokeRoleHandler } from '../../../../core/handlers/commands/RevokeRoleHandler.js';
import { IncreaseAllowanceHandler } from '../../../../core/handlers/commands/IncreaseAllowanceHandler.js';
import { DecreaseAllowanceHandler } from '../../../../core/handlers/commands/DecreaseAllowanceHandler.js';
import { ResetAllowanceHandler } from '../../../../core/handlers/commands/ResetAllowanceHandler.js';
import { GrantSupplierRoleHandler } from '../../../../core/handlers/commands/GrantSupplierRoleHandler.js';
import { RevokeSupplierRoleHandler } from '../../../../core/handlers/commands/RevokeSupplierRoleHandler.js';
import { GrantUnlimitedSupplierRoleHandler } from '../../../../core/handlers/commands/GrantUnlimitedSupplierRoleHandler.js';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';
const VALID_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('Role Command Handlers', () => {
  afterEach(() => {
    resetCommandRegistry();
  });

  describe('GrantRoleHandler', () => {
    let handler: GrantRoleHandler;
    beforeEach(() => { handler = new GrantRoleHandler(); });

    it('should have methodName grantRole', () => {
      expect(handler.getMethodName()).toBe('grantRole');
    });

    it('should validate role and targetId', () => {
      expect(() => handler.validate({ role: VALID_ROLE, targetId: VALID_ADDRESS })).not.toThrow();
      expect(() => handler.validate({ role: '', targetId: VALID_ADDRESS })).toThrow('Role required');
      expect(() => handler.validate({ role: VALID_ROLE, targetId: '' })).toThrow('Target account required');
    });
  });

  describe('RevokeRoleHandler', () => {
    let handler: RevokeRoleHandler;
    beforeEach(() => { handler = new RevokeRoleHandler(); });

    it('should have methodName revokeRole', () => {
      expect(handler.getMethodName()).toBe('revokeRole');
    });

    it('should validate role and targetId', () => {
      expect(() => handler.validate({ role: VALID_ROLE, targetId: VALID_ADDRESS })).not.toThrow();
    });
  });

  describe('IncreaseAllowanceHandler', () => {
    let handler: IncreaseAllowanceHandler;
    beforeEach(() => { handler = new IncreaseAllowanceHandler(); });

    it('should have methodName increaseSupplierAllowance', () => {
      expect(handler.getMethodName()).toBe('increaseSupplierAllowance');
    });

    it('should validate targetId and amount', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS, amount: '100' })).not.toThrow();
      expect(() => handler.validate({ targetId: VALID_ADDRESS, amount: '0' })).toThrow('Amount must be positive');
    });
  });

  describe('DecreaseAllowanceHandler', () => {
    let handler: DecreaseAllowanceHandler;
    beforeEach(() => { handler = new DecreaseAllowanceHandler(); });

    it('should have methodName decreaseSupplierAllowance', () => {
      expect(handler.getMethodName()).toBe('decreaseSupplierAllowance');
    });

    it('should validate targetId and amount', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS, amount: '100' })).not.toThrow();
    });
  });

  describe('ResetAllowanceHandler', () => {
    let handler: ResetAllowanceHandler;
    beforeEach(() => { handler = new ResetAllowanceHandler(); });

    it('should have methodName resetSupplierAllowance', () => {
      expect(handler.getMethodName()).toBe('resetSupplierAllowance');
    });

    it('should validate targetId', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS })).not.toThrow();
    });
  });

  describe('GrantSupplierRoleHandler', () => {
    let handler: GrantSupplierRoleHandler;
    beforeEach(() => { handler = new GrantSupplierRoleHandler(); });

    it('should have methodName grantSupplierRole', () => {
      expect(handler.getMethodName()).toBe('grantSupplierRole');
    });

    it('should validate targetId and amount', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS, amount: '100' })).not.toThrow();
    });
  });

  describe('RevokeSupplierRoleHandler', () => {
    let handler: RevokeSupplierRoleHandler;
    beforeEach(() => { handler = new RevokeSupplierRoleHandler(); });

    it('should have methodName revokeSupplierRole', () => {
      expect(handler.getMethodName()).toBe('revokeSupplierRole');
    });

    it('should validate targetId', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS })).not.toThrow();
    });
  });

  describe('GrantUnlimitedSupplierRoleHandler', () => {
    let handler: GrantUnlimitedSupplierRoleHandler;
    beforeEach(() => { handler = new GrantUnlimitedSupplierRoleHandler(); });

    it('should have methodName grantUnlimitedSupplierRole', () => {
      expect(handler.getMethodName()).toBe('grantUnlimitedSupplierRole');
    });

    it('should validate targetId', () => {
      expect(() => handler.validate({ targetId: VALID_ADDRESS })).not.toThrow();
    });
  });
});
