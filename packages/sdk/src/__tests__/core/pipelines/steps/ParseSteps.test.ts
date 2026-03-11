import { ParseHederaReceiptStep } from '../../../../core/pipelines/steps/ParseHederaReceiptStep.js';
import { ParseEVMReceiptStep } from '../../../../core/pipelines/steps/ParseEVMReceiptStep.js';
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

describe('ParseHederaReceiptStep', () => {
  it('has the correct name', () => {
    const step = new ParseHederaReceiptStep({} as any);
    expect(step.name).toBe('ParseHederaReceipt');
  });

  it('calls getReceipt on the response with the client', async () => {
    const mockReceipt = { status: { toString: () => 'SUCCESS' } };
    const mockClient = {} as any;
    const mockResponse = { getReceipt: jest.fn().mockResolvedValue(mockReceipt) };

    const step = new ParseHederaReceiptStep(mockClient);
    const ctx = makeMockContext({ response: mockResponse });

    await step.execute(ctx);

    expect(mockResponse.getReceipt).toHaveBeenCalledWith(mockClient);
  });

  it('returns context with receipt set from getReceipt', async () => {
    const mockReceipt = { status: { toString: () => 'SUCCESS' } };
    const mockClient = {} as any;
    const mockResponse = { getReceipt: jest.fn().mockResolvedValue(mockReceipt) };

    const step = new ParseHederaReceiptStep(mockClient);
    const ctx = makeMockContext({ response: mockResponse });

    const result = await step.execute(ctx);

    expect(result.receipt).toBe(mockReceipt);
  });

  it('propagates the rest of the context unchanged', async () => {
    const mockResponse = { getReceipt: jest.fn().mockResolvedValue({}) };
    const mockClient = {} as any;

    const step = new ParseHederaReceiptStep(mockClient);
    const ctx = makeMockContext({ response: mockResponse });

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
    expect(result.response).toBe(mockResponse);
  });
});

describe('ParseEVMReceiptStep', () => {
  it('has the correct name', () => {
    const step = new ParseEVMReceiptStep();
    expect(step.name).toBe('ParseEVMReceipt');
  });

  it('calls wait() on the response', async () => {
    const mockReceipt = { blockNumber: 12345, status: 1 };
    const mockResponse = { wait: jest.fn().mockResolvedValue(mockReceipt) };

    const step = new ParseEVMReceiptStep();
    const ctx = makeMockContext({ response: mockResponse });

    await step.execute(ctx);

    expect(mockResponse.wait).toHaveBeenCalled();
  });

  it('returns context with receipt set from wait()', async () => {
    const mockReceipt = { blockNumber: 12345, status: 1 };
    const mockResponse = { wait: jest.fn().mockResolvedValue(mockReceipt) };

    const step = new ParseEVMReceiptStep();
    const ctx = makeMockContext({ response: mockResponse });

    const result = await step.execute(ctx);

    expect(result.receipt).toBe(mockReceipt);
  });

  it('propagates the rest of the context unchanged', async () => {
    const mockResponse = { wait: jest.fn().mockResolvedValue({}) };

    const step = new ParseEVMReceiptStep();
    const ctx = makeMockContext({ response: mockResponse });

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
    expect(result.response).toBe(mockResponse);
  });
});
