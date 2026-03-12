import { resetQueryRegistry } from '../../../../core/decorators/Query.js';
import { GetBalanceHandler } from '../../../../core/handlers/queries/GetBalanceHandler.js';
import { GetBurnableAmountHandler } from '../../../../core/handlers/queries/GetBurnableAmountHandler.js';
import { GetReserveAddressHandler } from '../../../../core/handlers/queries/GetReserveAddressHandler.js';
import { GetReserveAmountHandler } from '../../../../core/handlers/queries/GetReserveAmountHandler.js';

const VALID_ADDRESS = '0x1234567890123456789012345678901234567890';
const CONTRACT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

describe('Balance & Reserve Query Handlers', () => {
  afterEach(() => {
    resetQueryRegistry();
  });

  describe('GetBalanceHandler', () => {
    let handler: GetBalanceHandler;
    beforeEach(() => { handler = new GetBalanceHandler(); });

    it('should have methodName balanceOf', () => {
      expect(handler.getMethodName()).toBe('balanceOf');
    });

    it('should map params to args correctly', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT, targetId: VALID_ADDRESS });
      expect(args).toEqual([VALID_ADDRESS]);
    });

    it('should create result from data', () => {
      const result = (handler as any).createResult(BigInt('1000000'));
      expect(result).toEqual({ success: true, balance: '1000000' });
    });

    it('should handle zero balance', () => {
      const result = (handler as any).createResult(BigInt(0));
      expect(result).toEqual({ success: true, balance: '0' });
    });
  });

  describe('GetBurnableAmountHandler', () => {
    let handler: GetBurnableAmountHandler;
    beforeEach(() => { handler = new GetBurnableAmountHandler(); });

    it('should have methodName getBurnableAmount', () => {
      expect(handler.getMethodName()).toBe('getBurnableAmount');
    });

    it('should map params to empty args', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT });
      expect(args).toEqual([]);
    });

    it('should create result from data', () => {
      const result = (handler as any).createResult(BigInt('500'));
      expect(result).toEqual({ success: true, amount: '500' });
    });
  });

  describe('GetReserveAddressHandler', () => {
    let handler: GetReserveAddressHandler;
    beforeEach(() => { handler = new GetReserveAddressHandler(); });

    it('should have methodName getReserveAddress', () => {
      expect(handler.getMethodName()).toBe('getReserveAddress');
    });

    it('should map params to empty args', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT });
      expect(args).toEqual([]);
    });

    it('should create result from data', () => {
      const result = (handler as any).createResult(VALID_ADDRESS);
      expect(result).toEqual({ success: true, reserveAddress: VALID_ADDRESS });
    });
  });

  describe('GetReserveAmountHandler', () => {
    let handler: GetReserveAmountHandler;
    beforeEach(() => { handler = new GetReserveAmountHandler(); });

    it('should have methodName getReserveAmount', () => {
      expect(handler.getMethodName()).toBe('getReserveAmount');
    });

    it('should map params to empty args', () => {
      const args = (handler as any).mapParamsToArgs({ contractAddress: CONTRACT });
      expect(args).toEqual([]);
    });

    it('should create result from data', () => {
      const result = (handler as any).createResult(BigInt('999'));
      expect(result).toEqual({ success: true, amount: '999' });
    });
  });
});
