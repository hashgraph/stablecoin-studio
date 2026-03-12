import { BaseCompositeHandler, SubCommand } from '../../../core/handlers/BaseCompositeHandler.js';
import { TransactionResultLike } from '../../../core/types/PipelineContext.js';
import { CommandParams, TransactionResult } from '../../../core/handlers/types.js';

interface TestCompositeParams extends CommandParams {
  name: string;
  initialAmount: string;
}

interface TestCompositeResult extends TransactionResult {
  proxyAddress: string;
  tokenId: string;
}

class TestCompositeHandler extends BaseCompositeHandler<TestCompositeParams, TestCompositeResult> {
  constructor() {
    super('createToken', ['hedera', 'evm']);
  }

  protected getSubCommands(params: TestCompositeParams): SubCommand[] {
    return [
      { command: 'deployProxy', params: { name: params.name } },
      { command: 'initializeToken', params: { amount: params.initialAmount } },
    ];
  }

  protected createResult(
    subResults: Map<string, TransactionResultLike>,
    _params: TestCompositeParams,
  ): TestCompositeResult {
    const deployResult = subResults.get('deployProxy')!;
    const initResult = subResults.get('initializeToken')!;
    return {
      success: true,
      transactionId: deployResult.transactionId,
      proxyAddress: (deployResult as any).proxyAddress,
      tokenId: (initResult as any).tokenId,
    };
  }

  protected validateParams(params: TestCompositeParams): void {
    if (!params.name) throw new Error('Name is required');
  }
}

describe('BaseCompositeHandler', () => {
  let handler: TestCompositeHandler;

  beforeEach(() => {
    handler = new TestCompositeHandler();
  });

  describe('getCommandName', () => {
    it('should return the command name', () => {
      expect(handler.getCommandName()).toBe('createToken');
    });
  });

  describe('supportsMode', () => {
    it('should support configured modes', () => {
      expect(handler.supportsMode('hedera')).toBe(true);
      expect(handler.supportsMode('evm')).toBe(true);
    });
  });

  describe('getSupportedModes', () => {
    it('should return a copy of supported modes', () => {
      const modes = handler.getSupportedModes();
      expect(modes).toEqual(['hedera', 'evm']);
      modes.push('hedera');
      expect(handler.getSupportedModes()).toEqual(['hedera', 'evm']);
    });
  });

  describe('execute', () => {
    it('should execute sub-commands sequentially', async () => {
      const executionOrder: string[] = [];
      const executor = jest.fn().mockImplementation(async (command: string, params: any) => {
        executionOrder.push(command);
        if (command === 'deployProxy') {
          return { success: true, transactionId: 'tx-1', proxyAddress: '0xProxy' };
        }
        return { success: true, transactionId: 'tx-2', tokenId: 'token-123' };
      });

      const result = await handler.execute(executor, {
        name: 'MyToken',
        initialAmount: '1000',
      });

      expect(executionOrder).toEqual(['deployProxy', 'initializeToken']);
      expect(executor).toHaveBeenCalledTimes(2);
      expect(result.success).toBe(true);
      expect(result.proxyAddress).toBe('0xProxy');
      expect(result.tokenId).toBe('token-123');
    });

    it('should validate params before executing', async () => {
      const executor = jest.fn();

      await expect(handler.execute(executor, {
        name: '',
        initialAmount: '1000',
      })).rejects.toThrow('Name is required');

      expect(executor).not.toHaveBeenCalled();
    });

    it('should propagate executor errors', async () => {
      const executor = jest.fn().mockRejectedValue(new Error('Deploy failed'));

      await expect(handler.execute(executor, {
        name: 'MyToken',
        initialAmount: '1000',
      })).rejects.toThrow('Deploy failed');
    });

    it('should pass correct params to executor', async () => {
      const executor = jest.fn().mockResolvedValue({ success: true, transactionId: 'tx-1' });

      await handler.execute(executor, {
        name: 'TestToken',
        initialAmount: '5000',
      });

      expect(executor).toHaveBeenCalledWith('deployProxy', { name: 'TestToken' });
      expect(executor).toHaveBeenCalledWith('initializeToken', { amount: '5000' });
    });
  });
});
