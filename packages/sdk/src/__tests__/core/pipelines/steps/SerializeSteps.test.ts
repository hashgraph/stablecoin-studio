import { SerializeHederaStep } from '../../../../core/pipelines/steps/SerializeHederaStep.js';
import { SerializeEVMStep } from '../../../../core/pipelines/steps/SerializeEVMStep.js';
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

describe('SerializeHederaStep', () => {
  it('has the correct name', () => {
    const step = new SerializeHederaStep({} as any);
    expect(step.name).toBe('SerializeHedera');
  });

  it('calls freezeWith on the transaction with the client', async () => {
    const txBytes = new Uint8Array([1, 2, 3]);
    const mockFrozen = {
      toBytes: jest.fn().mockReturnValue(txBytes),
      _signedTransactions: { get: jest.fn().mockReturnValue({ bodyBytes: undefined }) },
    };
    const mockTx = { freezeWith: jest.fn().mockReturnValue(mockFrozen) };
    const mockClient = {} as any;

    const step = new SerializeHederaStep(mockClient);
    const ctx = makeMockContext({ transaction: mockTx as any });

    await step.execute(ctx);

    expect(mockTx.freezeWith).toHaveBeenCalledWith(mockClient);
  });

  it('returns signedTransaction with kind serialized and transactionBytes', async () => {
    const txBytes = new Uint8Array([0xaa, 0xbb]);
    const mockFrozen = {
      toBytes: jest.fn().mockReturnValue(txBytes),
      _signedTransactions: { get: jest.fn().mockReturnValue(null) },
    };
    const mockTx = { freezeWith: jest.fn().mockReturnValue(mockFrozen) };

    const step = new SerializeHederaStep({} as any);
    const ctx = makeMockContext({ transaction: mockTx as any });

    const result = await step.execute(ctx);

    expect(result.signedTransaction).toMatchObject({
      kind: 'serialized',
      transactionBytes: txBytes,
    });
  });

  it('extracts bodyBytes from _signedTransactions when available', async () => {
    const txBytes = new Uint8Array([1, 2, 3]);
    const bodyBytes = new Uint8Array([10, 20, 30]);
    const mockFrozen = {
      toBytes: jest.fn().mockReturnValue(txBytes),
      _signedTransactions: {
        get: jest.fn().mockReturnValue({ bodyBytes }),
      },
    };
    const mockTx = { freezeWith: jest.fn().mockReturnValue(mockFrozen) };

    const step = new SerializeHederaStep({} as any);
    const ctx = makeMockContext({ transaction: mockTx as any });

    const result = await step.execute(ctx);

    expect((result.signedTransaction as any).bodyBytes).toEqual(bodyBytes);
  });

  it('sets bodyBytes to undefined when _signedTransactions is unavailable', async () => {
    const txBytes = new Uint8Array([1, 2, 3]);
    const mockFrozen = {
      toBytes: jest.fn().mockReturnValue(txBytes),
      _signedTransactions: undefined,
    };
    const mockTx = { freezeWith: jest.fn().mockReturnValue(mockFrozen) };

    const step = new SerializeHederaStep({} as any);
    const ctx = makeMockContext({ transaction: mockTx as any });

    const result = await step.execute(ctx);

    expect((result.signedTransaction as any).bodyBytes).toBeUndefined();
  });

  it('propagates the rest of the context unchanged', async () => {
    const txBytes = new Uint8Array([1, 2, 3]);
    const mockFrozen = {
      toBytes: jest.fn().mockReturnValue(txBytes),
      _signedTransactions: { get: jest.fn().mockReturnValue(null) },
    };
    const mockTx = { freezeWith: jest.fn().mockReturnValue(mockFrozen) };

    const step = new SerializeHederaStep({} as any);
    const ctx = makeMockContext({ transaction: mockTx as any });

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
  });
});

describe('SerializeEVMStep', () => {
  it('has the correct name', () => {
    const step = new SerializeEVMStep();
    expect(step.name).toBe('SerializeEVM');
  });

  it('serializes the EVM transaction and returns signedTransaction with kind serialized', async () => {
    const mockUnsignedSerialized = '0x0201';
    const expectedBytes = new Uint8Array([0x02, 0x01]); // ethers.getBytes('0x0201') = [2, 1]

    const ethersModule = require('ethers');
    const fromSpy = jest
      .spyOn(ethersModule.Transaction, 'from')
      .mockReturnValue({ unsignedSerialized: mockUnsignedSerialized } as any);

    try {
      const step = new SerializeEVMStep();
      const ctx = makeMockContext({ transaction: { to: '0x123' } as any });

      const result = await step.execute(ctx);

      expect(fromSpy).toHaveBeenCalled();
      // ethers.getBytes('0x0201') produces Uint8Array([0x02, 0x01])
      expect(result.signedTransaction).toEqual({
        kind: 'serialized',
        transactionBytes: expectedBytes,
      });
    } finally {
      fromSpy.mockRestore();
    }
  });

  it('propagates the rest of the context unchanged', async () => {
    const mockTxBytes = new Uint8Array([0x01]);
    const ethersModule = require('ethers');
    const fromSpy = jest
      .spyOn(ethersModule.Transaction, 'from')
      .mockReturnValue({ unsignedSerialized: '0x01' } as any);
    const getBytesSpy = jest
      .spyOn(ethersModule, 'getBytes')
      .mockReturnValue(mockTxBytes);

    try {
      const step = new SerializeEVMStep();
      const ctx = makeMockContext({ transaction: {} as any });

      const result = await step.execute(ctx);

      expect(result.command).toBe('test-command');
      expect(result.params).toEqual({ foo: 'bar' });
    } finally {
      fromSpy.mockRestore();
      getBytesSpy.mockRestore();
    }
  });
});
