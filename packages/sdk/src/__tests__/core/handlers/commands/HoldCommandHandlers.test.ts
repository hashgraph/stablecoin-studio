import { resetCommandRegistry } from '../../../../core/decorators/Command.js';
import { CreateHoldHandler } from '../../../../core/handlers/commands/CreateHoldHandler.js';
import { ReleaseHoldHandler } from '../../../../core/handlers/commands/ReleaseHoldHandler.js';
import { ReclaimHoldHandler } from '../../../../core/handlers/commands/ReclaimHoldHandler.js';
import { ExecuteHoldHandler } from '../../../../core/handlers/commands/ExecuteHoldHandler.js';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';
const VALID_HOLD_ID = '0x0000000000000000000000000000000000000000000000000000000000000001';

describe('Hold Command Handlers', () => {
  afterEach(() => {
    resetCommandRegistry();
  });

  describe('CreateHoldHandler', () => {
    let handler: CreateHoldHandler;
    beforeEach(() => { handler = new CreateHoldHandler(); });

    it('should have methodName createHold', () => {
      expect(handler.getMethodName()).toBe('createHold');
    });

    it('should validate all required params', () => {
      expect(() => handler.validate({
        holdId: VALID_HOLD_ID,
        recipient: VALID_ADDRESS,
        notary: VALID_ADDRESS,
        amount: '100',
        expiration: '1000000',
      })).not.toThrow();
      expect(() => handler.validate({
        holdId: '',
        recipient: VALID_ADDRESS,
        notary: VALID_ADDRESS,
        amount: '100',
        expiration: '1000000',
      })).toThrow('Hold ID required');
    });
  });

  describe('ReleaseHoldHandler', () => {
    let handler: ReleaseHoldHandler;
    beforeEach(() => { handler = new ReleaseHoldHandler(); });

    it('should have methodName releaseHold', () => {
      expect(handler.getMethodName()).toBe('releaseHold');
    });

    it('should validate holdId', () => {
      expect(() => handler.validate({ holdId: VALID_HOLD_ID })).not.toThrow();
      expect(() => handler.validate({ holdId: '' })).toThrow('Hold ID required');
    });
  });

  describe('ReclaimHoldHandler', () => {
    let handler: ReclaimHoldHandler;
    beforeEach(() => { handler = new ReclaimHoldHandler(); });

    it('should have methodName reclaimHold', () => {
      expect(handler.getMethodName()).toBe('reclaimHold');
    });

    it('should validate holdId', () => {
      expect(() => handler.validate({ holdId: VALID_HOLD_ID })).not.toThrow();
    });
  });

  describe('ExecuteHoldHandler', () => {
    let handler: ExecuteHoldHandler;
    beforeEach(() => { handler = new ExecuteHoldHandler(); });

    it('should have methodName executeHold', () => {
      expect(handler.getMethodName()).toBe('executeHold');
    });

    it('should validate holdId and amount', () => {
      expect(() => handler.validate({ holdId: VALID_HOLD_ID, amount: '100' })).not.toThrow();
      expect(() => handler.validate({ holdId: VALID_HOLD_ID, amount: '0' })).toThrow('Amount must be positive');
    });
  });
});
