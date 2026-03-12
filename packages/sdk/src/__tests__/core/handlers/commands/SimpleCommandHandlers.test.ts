import { resetCommandRegistry } from '../../../../core/decorators/Command.js';
import { PauseHandler, PauseResult } from '../../../../core/handlers/commands/PauseHandler.js';
import { UnpauseHandler, UnpauseResult } from '../../../../core/handlers/commands/UnpauseHandler.js';
import { DeleteHandler } from '../../../../core/handlers/commands/DeleteHandler.js';

describe('Simple Command Handlers (no params)', () => {
  afterEach(() => {
    resetCommandRegistry();
  });

  describe('PauseHandler', () => {
    let handler: PauseHandler;
    beforeEach(() => { handler = new PauseHandler(); });

    it('should have methodName pause', () => {
      expect(handler.getMethodName()).toBe('pause');
    });

    it('should support both modes', () => {
      expect(handler.supportsMode('hedera')).toBe(true);
      expect(handler.supportsMode('evm')).toBe(true);
    });

    it('should build hedera transaction', () => {
      const tx = handler.buildHederaTransaction({});
      expect(tx).toBeDefined();
    });

    it('should build EVM transaction with empty args', async () => {
      const tx = await handler.buildEVMTransaction({});
      expect((tx as any).data).toBeDefined();
    });

    it('should create PauseResult with paused=true', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, {}) as PauseResult;
      expect(result.success).toBe(true);
      expect(result.paused).toBe(true);
    });
  });

  describe('UnpauseHandler', () => {
    let handler: UnpauseHandler;
    beforeEach(() => { handler = new UnpauseHandler(); });

    it('should have methodName unpause', () => {
      expect(handler.getMethodName()).toBe('unpause');
    });

    it('should create UnpauseResult with paused=false', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, {}) as UnpauseResult;
      expect(result.success).toBe(true);
      expect(result.paused).toBe(false);
    });
  });

  describe('DeleteHandler', () => {
    let handler: DeleteHandler;
    beforeEach(() => { handler = new DeleteHandler(); });

    it('should have methodName deleteToken', () => {
      expect(handler.getMethodName()).toBe('deleteToken');
    });

    it('should build hedera transaction', () => {
      const tx = handler.buildHederaTransaction({});
      expect(tx).toBeDefined();
    });

    it('should create TransactionResult', () => {
      const result = handler.analyze({ transactionId: 'tx-1' }, {});
      expect(result.success).toBe(true);
    });
  });
});
