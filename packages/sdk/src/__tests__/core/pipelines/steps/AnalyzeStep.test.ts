import { AnalyzeStep } from '../../../../core/pipelines/steps/AnalyzeStep.js';
import { PipelineContext } from '../../../../core/types/PipelineContext.js';

function makeMockContext(overrides: Partial<PipelineContext> = {}): PipelineContext {
  const mockHandler = {
    buildHederaTransaction: jest.fn(),
    buildEVMTransaction: jest.fn(),
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

describe('AnalyzeStep', () => {
  it('has the correct name', () => {
    const step = new AnalyzeStep();
    expect(step.name).toBe('Analyze');
  });

  it('calls handler.analyze with receipt and params', async () => {
    const mockReceipt = { status: 'SUCCESS', tokenId: '0.0.123' };
    const mockResult = { success: true, tokenId: '0.0.123' };
    const mockHandler = {
      buildHederaTransaction: jest.fn(),
      buildEVMTransaction: jest.fn(),
      analyze: jest.fn().mockReturnValue(mockResult),
      supportsMode: jest.fn().mockReturnValue(true),
      getSupportedModes: jest.fn().mockReturnValue(['hedera']),
      validate: jest.fn(),
    };

    const step = new AnalyzeStep();
    const ctx = makeMockContext({
      handler: mockHandler,
      receipt: mockReceipt,
      params: { symbol: 'TKN', decimals: 6 },
    });

    await step.execute(ctx);

    expect(mockHandler.analyze).toHaveBeenCalledWith(mockReceipt, { symbol: 'TKN', decimals: 6 });
  });

  it('sets result in context from handler.analyze return value', async () => {
    const mockResult = { success: true, transactionId: 'tx-abc' };
    const mockHandler = {
      buildHederaTransaction: jest.fn(),
      buildEVMTransaction: jest.fn(),
      analyze: jest.fn().mockReturnValue(mockResult),
      supportsMode: jest.fn().mockReturnValue(true),
      getSupportedModes: jest.fn().mockReturnValue(['hedera']),
      validate: jest.fn(),
    };

    const step = new AnalyzeStep();
    const ctx = makeMockContext({
      handler: mockHandler,
      receipt: { status: 'SUCCESS' },
    });

    const result = await step.execute(ctx);

    expect(result.result).toBe(mockResult);
  });

  it('propagates the rest of the context unchanged', async () => {
    const mockHandler = {
      buildHederaTransaction: jest.fn(),
      buildEVMTransaction: jest.fn(),
      analyze: jest.fn().mockReturnValue({ success: true }),
      supportsMode: jest.fn().mockReturnValue(true),
      getSupportedModes: jest.fn().mockReturnValue(['hedera']),
      validate: jest.fn(),
    };

    const mockReceipt = { status: 'SUCCESS' };
    const step = new AnalyzeStep();
    const ctx = makeMockContext({
      handler: mockHandler,
      receipt: mockReceipt,
    });

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
    expect(result.receipt).toBe(mockReceipt);
  });

  it('works with undefined receipt (passes undefined to handler.analyze)', async () => {
    const mockHandler = {
      buildHederaTransaction: jest.fn(),
      buildEVMTransaction: jest.fn(),
      analyze: jest.fn().mockReturnValue({ success: true }),
      supportsMode: jest.fn().mockReturnValue(true),
      getSupportedModes: jest.fn().mockReturnValue(['hedera']),
      validate: jest.fn(),
    };

    const step = new AnalyzeStep();
    const ctx = makeMockContext({ handler: mockHandler });

    const result = await step.execute(ctx);

    expect(mockHandler.analyze).toHaveBeenCalledWith(undefined, expect.any(Object));
    expect(result.result).toEqual({ success: true });
  });
});
