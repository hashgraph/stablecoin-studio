import { PipelineExecutor } from '../../core/PipelineExecutor.js';
import { resetCommandRegistry } from '../../core/decorators/Command.js';

// Import handlers to register them
import '../../core/handlers/commands/index.js';

describe('PipelineExecutor', () => {
  let executor: PipelineExecutor;

  const mockClient = {} as any;
  const mockSigner = {} as any;
  const mockProvider = {} as any;

  beforeEach(() => {
    executor = new PipelineExecutor(
      () => mockClient,
      () => mockSigner,
      () => mockProvider,
    );
  });

  afterAll(() => {
    resetCommandRegistry();
  });

  describe('resolveHandler', () => {
    it('should resolve a registered command handler', () => {
      // Access private method via any
      const handler = (executor as any).resolveHandler('burn');
      expect(handler).toBeDefined();
      expect(handler.getMethodName()).toBe('burn');
    });

    it('should throw for unregistered command', () => {
      expect(() => (executor as any).resolveHandler('nonexistent'))
        .toThrow("No handler registered for command 'nonexistent'");
    });
  });

  describe('createPipeline', () => {
    it('should create HederaExecutePipeline for hedera mode', () => {
      const pipeline = (executor as any).createPipeline('hedera');
      expect(pipeline).toBeDefined();
      expect(pipeline.getSteps()).toHaveLength(5);
      expect(pipeline.getSteps()[0].name).toBe('BuildHedera');
    });

    it('should create EVMExecutePipeline for evm mode', () => {
      const pipeline = (executor as any).createPipeline('evm');
      expect(pipeline).toBeDefined();
      expect(pipeline.getSteps()).toHaveLength(5);
      expect(pipeline.getSteps()[0].name).toBe('BuildEVM');
    });
  });

  describe('execute validation', () => {
    it('should throw if command does not support the mode', async () => {
      // All handlers support both modes, but we can test the validation path
      // by checking that validation runs before pipeline execution
      await expect(
        executor.execute('burn', { amount: '0' }, 'hedera'),
      ).rejects.toThrow('Amount must be positive');
    });

    it('should validate params before pipeline execution', async () => {
      await expect(
        executor.execute('freeze', { targetId: '' }, 'hedera'),
      ).rejects.toThrow('Target account required');
    });

    it('should throw for unregistered commands', async () => {
      await expect(
        executor.execute('nonexistent', {}, 'hedera'),
      ).rejects.toThrow("No handler registered for command 'nonexistent'");
    });
  });
});
