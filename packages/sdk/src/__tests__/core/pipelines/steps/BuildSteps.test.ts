import { BuildHederaStep } from '../../../../core/pipelines/steps/BuildHederaStep.js';
import { BuildEVMStep } from '../../../../core/pipelines/steps/BuildEVMStep.js';
import { PipelineContext } from '../../../../core/types/PipelineContext.js';

function makeMockContext(overrides: Partial<PipelineContext> = {}): PipelineContext {
  const mockHandler = {
    buildHederaTransaction: jest.fn().mockReturnValue({ type: 'hedera-tx' }),
    buildEVMTransaction: jest.fn().mockResolvedValue({ type: 'evm-tx' }),
    analyze: jest.fn(),
    supportsMode: jest.fn().mockReturnValue(true),
    getSupportedModes: jest.fn().mockReturnValue(['hedera', 'evm']),
    validate: jest.fn(),
  };
  return {
    command: 'test-command',
    params: { foo: 'bar' },
    handler: mockHandler,
    ...overrides,
  };
}

describe('BuildHederaStep', () => {
  it('has the correct name', () => {
    const step = new BuildHederaStep();
    expect(step.name).toBe('BuildHedera');
  });

  it('calls handler.buildHederaTransaction with ctx.params', async () => {
    const step = new BuildHederaStep();
    const ctx = makeMockContext();

    await step.execute(ctx);

    expect(ctx.handler.buildHederaTransaction).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('returns context with transaction set from handler result', async () => {
    const step = new BuildHederaStep();
    const ctx = makeMockContext();

    const result = await step.execute(ctx);

    expect(result.transaction).toEqual({ type: 'hedera-tx' });
  });

  it('propagates the rest of the context without modification', async () => {
    const step = new BuildHederaStep();
    const ctx = makeMockContext();

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
    expect(result.handler).toBe(ctx.handler);
  });

  it('does not modify signedTransaction or response or receipt', async () => {
    const step = new BuildHederaStep();
    const ctx = makeMockContext();

    const result = await step.execute(ctx);

    expect(result.signedTransaction).toBeUndefined();
    expect(result.response).toBeUndefined();
    expect(result.receipt).toBeUndefined();
  });
});

describe('BuildEVMStep', () => {
  it('has the correct name', () => {
    const step = new BuildEVMStep();
    expect(step.name).toBe('BuildEVM');
  });

  it('calls handler.buildEVMTransaction with ctx.params', async () => {
    const step = new BuildEVMStep();
    const ctx = makeMockContext();

    await step.execute(ctx);

    expect(ctx.handler.buildEVMTransaction).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('returns context with transaction set from handler result', async () => {
    const step = new BuildEVMStep();
    const ctx = makeMockContext();

    const result = await step.execute(ctx);

    expect(result.transaction).toEqual({ type: 'evm-tx' });
  });

  it('propagates the rest of the context without modification', async () => {
    const step = new BuildEVMStep();
    const ctx = makeMockContext();

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
    expect(result.handler).toBe(ctx.handler);
  });

  it('awaits the async buildEVMTransaction result', async () => {
    const step = new BuildEVMStep();
    const resolvedTx = { type: 'async-evm-tx' };
    const ctx = makeMockContext();
    (ctx.handler.buildEVMTransaction as jest.Mock).mockResolvedValue(resolvedTx);

    const result = await step.execute(ctx);

    expect(result.transaction).toEqual(resolvedTx);
  });
});
