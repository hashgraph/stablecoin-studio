import { resetCommandRegistry } from '../../../../core/decorators/Command.js';
import { BurnHandler } from '../../../../core/handlers/commands/BurnHandler.js';
import { RescueHandler } from '../../../../core/handlers/commands/RescueHandler.js';
import { RescueHBARHandler } from '../../../../core/handlers/commands/RescueHBARHandler.js';

describe('Amount Command Handlers (Burn, Rescue, RescueHBAR)', () => {
  afterEach(() => {
    resetCommandRegistry();
  });

  describe('BurnHandler', () => {
    let handler: BurnHandler;
    beforeEach(() => { handler = new BurnHandler(); });

    it('should have methodName burn', () => {
      expect(handler.getMethodName()).toBe('burn');
    });

    it('should validate positive amount', () => {
      expect(() => handler.validate({ amount: '100' })).not.toThrow();
    });

    it('should reject zero amount', () => {
      expect(() => handler.validate({ amount: '0' })).toThrow('Amount must be positive');
    });

    it('should reject negative amount', () => {
      expect(() => handler.validate({ amount: '-1' })).toThrow('Amount must be positive');
    });

    it('should build hedera transaction', () => {
      const tx = handler.buildHederaTransaction({ amount: '100' });
      expect(tx).toBeDefined();
    });

    it('should build EVM transaction', async () => {
      const tx = await handler.buildEVMTransaction({ amount: '100' });
      expect((tx as any).data).toBeDefined();
      expect((tx as any).data.startsWith('0x')).toBe(true);
    });

    it('should return amount in result', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, { amount: '500' });
      expect(result.success).toBe(true);
      expect((result as any).amount).toBe('500');
    });
  });

  describe('RescueHandler', () => {
    let handler: RescueHandler;
    beforeEach(() => { handler = new RescueHandler(); });

    it('should have methodName rescue', () => {
      expect(handler.getMethodName()).toBe('rescue');
    });

    it('should return amount in result', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, { amount: '1000' });
      expect((result as any).amount).toBe('1000');
    });
  });

  describe('RescueHBARHandler', () => {
    let handler: RescueHBARHandler;
    beforeEach(() => { handler = new RescueHBARHandler(); });

    it('should have methodName rescueHBAR', () => {
      expect(handler.getMethodName()).toBe('rescueHBAR');
    });

    it('should return amount in result', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, { amount: '2000' });
      expect((result as any).amount).toBe('2000');
    });
  });
});
