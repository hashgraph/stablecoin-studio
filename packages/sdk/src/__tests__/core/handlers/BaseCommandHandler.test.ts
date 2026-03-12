import { BaseCommandHandler } from '../../../core/handlers/BaseCommandHandler.js';
import { ContractFunctionParameters, Long } from '@hiero-ledger/sdk';
import { CommandParams, TransactionResult } from '../../../core/handlers/types.js';

// Handler concreto de prueba
interface TestParams extends CommandParams {
  amount: string;
}

interface TestResult extends TransactionResult {
  processedAmount: string;
}

class TestHandler extends BaseCommandHandler<TestParams, TestResult> {
  constructor() {
    super('testMethod', ['function testMethod(uint256 amount)'], 100_000);
  }

  protected mapParamsToArgs(params: TestParams): unknown[] {
    return [BigInt(params.amount)];
  }

  protected buildHederaFunctionParams(params: TestParams): ContractFunctionParameters {
    return new ContractFunctionParameters().addUint256(Long.fromString(params.amount));
  }

  protected createResult(receipt: any, params: TestParams): TestResult {
    return {
      success: true,
      transactionId: receipt?.transactionId ?? 'test-tx-id',
      processedAmount: params.amount,
    };
  }

  protected validateParams(params: TestParams): void {
    if (BigInt(params.amount) <= 0n) {
      throw new Error('Amount must be positive');
    }
  }
}

// Handler sin params (como pause)
class NoParamsHandler extends BaseCommandHandler<CommandParams, TransactionResult> {
  constructor() {
    super('pause', ['function pause()'], 80_000, ['hedera', 'evm']);
  }

  protected mapParamsToArgs(): unknown[] {
    return [];
  }

  protected buildHederaFunctionParams(): ContractFunctionParameters {
    return new ContractFunctionParameters();
  }

  protected createResult(receipt: any): TransactionResult {
    return { success: true, transactionId: receipt?.transactionId ?? '' };
  }
}

// Handler solo Hedera
class HederaOnlyHandler extends BaseCommandHandler<TestParams, TestResult> {
  constructor() {
    super('hederaOnly', ['function hederaOnly(uint256)'], 50_000, ['hedera']);
  }

  protected mapParamsToArgs(params: TestParams): unknown[] {
    return [BigInt(params.amount)];
  }

  protected buildHederaFunctionParams(params: TestParams): ContractFunctionParameters {
    return new ContractFunctionParameters().addUint256(Long.fromString(params.amount));
  }

  protected createResult(receipt: any, params: TestParams): TestResult {
    return { success: true, processedAmount: params.amount };
  }
}

describe('BaseCommandHandler', () => {
  let handler: TestHandler;

  beforeEach(() => {
    handler = new TestHandler();
  });

  describe('supportsMode', () => {
    it('should support hedera and evm by default', () => {
      expect(handler.supportsMode('hedera')).toBe(true);
      expect(handler.supportsMode('evm')).toBe(true);
    });

    it('should respect custom supported modes', () => {
      const hederaOnly = new HederaOnlyHandler();
      expect(hederaOnly.supportsMode('hedera')).toBe(true);
      expect(hederaOnly.supportsMode('evm')).toBe(false);
    });
  });

  describe('getSupportedModes', () => {
    it('should return a copy of supported modes', () => {
      const modes = handler.getSupportedModes();
      expect(modes).toEqual(['hedera', 'evm']);
      modes.push('hedera'); // mutating the copy
      expect(handler.getSupportedModes()).toEqual(['hedera', 'evm']); // original unchanged
    });
  });

  describe('validate', () => {
    it('should not throw for valid params', () => {
      expect(() => handler.validate({ amount: '100' })).not.toThrow();
    });

    it('should throw for invalid params', () => {
      expect(() => handler.validate({ amount: '0' })).toThrow('Amount must be positive');
    });

    it('should throw for negative amount', () => {
      expect(() => handler.validate({ amount: '-1' })).toThrow('Amount must be positive');
    });
  });

  describe('buildHederaTransaction', () => {
    it('should return a ContractExecuteTransaction', () => {
      const tx = handler.buildHederaTransaction({ amount: '100' });
      expect(tx).toBeDefined();
      expect(tx.constructor.name).toBe('ContractExecuteTransaction');
    });

    it('should throw on invalid params', () => {
      expect(() => handler.buildHederaTransaction({ amount: '0' }))
        .toThrow('Amount must be positive');
    });
  });

  describe('buildEVMTransaction', () => {
    it('should return an object with encoded data', async () => {
      const tx = await handler.buildEVMTransaction({ amount: '100' });
      expect(tx).toBeDefined();
      expect((tx as any).data).toBeDefined();
      expect(typeof (tx as any).data).toBe('string');
      expect((tx as any).data.startsWith('0x')).toBe(true);
    });

    it('should throw on invalid params', async () => {
      await expect(handler.buildEVMTransaction({ amount: '0' }))
        .rejects.toThrow('Amount must be positive');
    });
  });

  describe('analyze', () => {
    it('should create result from receipt', () => {
      const receipt = { transactionId: 'tx-123' };
      const result = handler.analyze(receipt, { amount: '500' });
      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('tx-123');
      expect((result as TestResult).processedAmount).toBe('500');
    });
  });

  describe('getMethodName', () => {
    it('should return the contract method name', () => {
      expect(handler.getMethodName()).toBe('testMethod');
    });
  });

  describe('NoParamsHandler', () => {
    it('should work with handlers that have no params', () => {
      const pauseHandler = new NoParamsHandler();
      const tx = pauseHandler.buildHederaTransaction({});
      expect(tx).toBeDefined();
      expect(pauseHandler.getMethodName()).toBe('pause');
    });
  });
});
