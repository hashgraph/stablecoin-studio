import { SubmitToHederaStep } from '../../../../core/pipelines/steps/SubmitToHederaStep.js';
import { SubmitToRPCStep } from '../../../../core/pipelines/steps/SubmitToRPCStep.js';
import { SubmitSignedHederaTransactionStep } from '../../../../core/pipelines/steps/SubmitSignedHederaTransactionStep.js';
import { SubmitSignedEVMTransactionStep } from '../../../../core/pipelines/steps/SubmitSignedEVMTransactionStep.js';
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

describe('SubmitToHederaStep', () => {
  it('has the correct name', () => {
    const step = new SubmitToHederaStep({} as any);
    expect(step.name).toBe('SubmitToHedera');
  });

  it('calls execute on the signed hedera transaction with the client', async () => {
    const mockResponse = { transactionId: 'tx-001' };
    const mockSignedTx = {
      execute: jest.fn().mockResolvedValue(mockResponse),
    };
    const mockClient = {} as any;

    const step = new SubmitToHederaStep(mockClient);
    const ctx = makeMockContext({
      signedTransaction: { kind: 'hedera', transaction: mockSignedTx as any },
    });

    await step.execute(ctx);

    expect(mockSignedTx.execute).toHaveBeenCalledWith(mockClient);
  });

  it('returns context with response set', async () => {
    const mockResponse = { transactionId: 'tx-001' };
    const mockSignedTx = { execute: jest.fn().mockResolvedValue(mockResponse) };
    const mockClient = {} as any;

    const step = new SubmitToHederaStep(mockClient);
    const ctx = makeMockContext({
      signedTransaction: { kind: 'hedera', transaction: mockSignedTx as any },
    });

    const result = await step.execute(ctx);

    expect(result.response).toBe(mockResponse);
  });

  it('propagates the rest of the context unchanged', async () => {
    const mockSignedTx = { execute: jest.fn().mockResolvedValue({}) };
    const mockClient = {} as any;

    const step = new SubmitToHederaStep(mockClient);
    const ctx = makeMockContext({
      signedTransaction: { kind: 'hedera', transaction: mockSignedTx as any },
    });

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
  });
});

describe('SubmitToRPCStep', () => {
  it('has the correct name', () => {
    const step = new SubmitToRPCStep({} as any);
    expect(step.name).toBe('SubmitToRPC');
  });

  it('calls provider.broadcastTransaction with the raw transaction', async () => {
    const mockRawTx = '0xdeadbeef';
    const mockResponse = { hash: '0xabcd' };
    const mockProvider = {
      broadcastTransaction: jest.fn().mockResolvedValue(mockResponse),
    } as any;

    const step = new SubmitToRPCStep(mockProvider);
    const ctx = makeMockContext({
      signedTransaction: { kind: 'evm', rawTransaction: mockRawTx },
    });

    await step.execute(ctx);

    expect(mockProvider.broadcastTransaction).toHaveBeenCalledWith(mockRawTx);
  });

  it('returns context with response set', async () => {
    const mockResponse = { hash: '0xabcd' };
    const mockProvider = {
      broadcastTransaction: jest.fn().mockResolvedValue(mockResponse),
    } as any;

    const step = new SubmitToRPCStep(mockProvider);
    const ctx = makeMockContext({
      signedTransaction: { kind: 'evm', rawTransaction: '0x1234' },
    });

    const result = await step.execute(ctx);

    expect(result.response).toBe(mockResponse);
  });

  it('propagates the rest of the context unchanged', async () => {
    const mockProvider = {
      broadcastTransaction: jest.fn().mockResolvedValue({}),
    } as any;

    const step = new SubmitToRPCStep(mockProvider);
    const ctx = makeMockContext({
      signedTransaction: { kind: 'evm', rawTransaction: '0x' },
    });

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
  });
});

describe('SubmitSignedHederaTransactionStep', () => {
  it('has the correct name', () => {
    const step = new SubmitSignedHederaTransactionStep({} as any);
    expect(step.name).toBe('SubmitSignedHederaTransaction');
  });

  it('deserializes bytes and executes with client', async () => {
    const txBytes = new Uint8Array([1, 2, 3]);
    const mockResponse = { transactionId: 'tx-ext-001' };
    const mockTx = { execute: jest.fn().mockResolvedValue(mockResponse) };
    const mockClient = {} as any;

    // Mock Transaction.fromBytes at the module level via jest
    const hederaSdk = require('@hiero-ledger/sdk');
    const originalFromBytes = hederaSdk.Transaction.fromBytes;
    hederaSdk.Transaction.fromBytes = jest.fn().mockReturnValue(mockTx);

    try {
      const step = new SubmitSignedHederaTransactionStep(mockClient);
      const ctx = makeMockContext({
        signedTransaction: { kind: 'serialized', transactionBytes: txBytes },
      });

      const result = await step.execute(ctx);

      expect(hederaSdk.Transaction.fromBytes).toHaveBeenCalledWith(txBytes);
      expect(mockTx.execute).toHaveBeenCalledWith(mockClient);
      expect(result.response).toBe(mockResponse);
    } finally {
      hederaSdk.Transaction.fromBytes = originalFromBytes;
    }
  });

  it('propagates the rest of the context unchanged', async () => {
    const txBytes = new Uint8Array([1, 2, 3]);
    const mockTx = { execute: jest.fn().mockResolvedValue({}) };
    const mockClient = {} as any;

    const hederaSdk = require('@hiero-ledger/sdk');
    const originalFromBytes = hederaSdk.Transaction.fromBytes;
    hederaSdk.Transaction.fromBytes = jest.fn().mockReturnValue(mockTx);

    try {
      const step = new SubmitSignedHederaTransactionStep(mockClient);
      const ctx = makeMockContext({
        signedTransaction: { kind: 'serialized', transactionBytes: txBytes },
      });

      const result = await step.execute(ctx);

      expect(result.command).toBe('test-command');
      expect(result.params).toEqual({ foo: 'bar' });
    } finally {
      hederaSdk.Transaction.fromBytes = originalFromBytes;
    }
  });
});

describe('SubmitSignedEVMTransactionStep', () => {
  it('has the correct name', () => {
    const step = new SubmitSignedEVMTransactionStep({} as any);
    expect(step.name).toBe('SubmitSignedEVMTransaction');
  });

  it('converts bytes to hex and calls provider.broadcastTransaction', async () => {
    const txBytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const mockResponse = { hash: '0xresult' };
    const mockProvider = {
      broadcastTransaction: jest.fn().mockResolvedValue(mockResponse),
    } as any;

    const step = new SubmitSignedEVMTransactionStep(mockProvider);
    const ctx = makeMockContext({
      signedTransaction: { kind: 'serialized', transactionBytes: txBytes },
    });

    const result = await step.execute(ctx);

    expect(mockProvider.broadcastTransaction).toHaveBeenCalledWith('0xdeadbeef');
    expect(result.response).toBe(mockResponse);
  });

  it('propagates the rest of the context unchanged', async () => {
    const mockProvider = {
      broadcastTransaction: jest.fn().mockResolvedValue({}),
    } as any;

    const step = new SubmitSignedEVMTransactionStep(mockProvider);
    const ctx = makeMockContext({
      signedTransaction: { kind: 'serialized', transactionBytes: new Uint8Array([0x01]) },
    });

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
  });
});
