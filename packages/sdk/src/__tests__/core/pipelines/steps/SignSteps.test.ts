import { SignWithClientStep } from '../../../../core/pipelines/steps/SignWithClientStep.js';
import { SignWithSignerStep } from '../../../../core/pipelines/steps/SignWithSignerStep.js';
import {
  SignWithExternalStep,
  ExternalSigningClient,
} from '../../../../core/pipelines/steps/SignWithExternalStep.js';
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

describe('SignWithClientStep', () => {
  it('has the correct name', () => {
    const mockClient = {} as any;
    const step = new SignWithClientStep(mockClient);
    expect(step.name).toBe('SignWithClient');
  });

  it('freezes transaction with client and signs with operator private key', async () => {
    const mockPrivateKey = {};
    const mockSigned = { kind: 'signed-tx' };
    const mockFrozen = {
      sign: jest.fn().mockResolvedValue(mockSigned),
    };
    const mockTx = {
      freezeWith: jest.fn().mockReturnValue(mockFrozen),
    };
    const mockClient = {
      _operator: { privateKey: mockPrivateKey },
    } as any;

    const step = new SignWithClientStep(mockClient);
    const ctx = makeMockContext({ transaction: mockTx as any });

    const result = await step.execute(ctx);

    expect(mockTx.freezeWith).toHaveBeenCalledWith(mockClient);
    expect(mockFrozen.sign).toHaveBeenCalledWith(mockPrivateKey);
    expect(result.signedTransaction).toEqual({ kind: 'hedera', transaction: mockSigned });
  });

  it('sets signedTransaction with kind hedera', async () => {
    const mockSigned = { id: 'signed-hedera' };
    const mockFrozen = { sign: jest.fn().mockResolvedValue(mockSigned) };
    const mockTx = { freezeWith: jest.fn().mockReturnValue(mockFrozen) };
    const mockClient = {
      _operator: { privateKey: {} },
    } as any;

    const step = new SignWithClientStep(mockClient);
    const ctx = makeMockContext({ transaction: mockTx as any });

    const result = await step.execute(ctx);

    expect(result.signedTransaction).toMatchObject({ kind: 'hedera' });
  });

  it('propagates the rest of the context', async () => {
    const mockFrozen = { sign: jest.fn().mockResolvedValue({}) };
    const mockTx = { freezeWith: jest.fn().mockReturnValue(mockFrozen) };
    const mockClient = { _operator: { privateKey: {} } } as any;

    const step = new SignWithClientStep(mockClient);
    const ctx = makeMockContext({ transaction: mockTx as any });

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
  });
});

describe('SignWithSignerStep', () => {
  it('has the correct name', () => {
    const mockSigner = {} as any;
    const step = new SignWithSignerStep(mockSigner);
    expect(step.name).toBe('SignWithSigner');
  });

  it('calls signer.signTransaction with the transaction', async () => {
    const mockRawTx = '0xdeadbeef';
    const mockSigner = {
      signTransaction: jest.fn().mockResolvedValue(mockRawTx),
    } as any;
    const mockTx = { to: '0x123', value: '0' } as any;

    const step = new SignWithSignerStep(mockSigner);
    const ctx = makeMockContext({ transaction: mockTx });

    await step.execute(ctx);

    expect(mockSigner.signTransaction).toHaveBeenCalledWith(mockTx);
  });

  it('returns signedTransaction with kind evm and raw transaction', async () => {
    const mockRawTx = '0xdeadbeef';
    const mockSigner = {
      signTransaction: jest.fn().mockResolvedValue(mockRawTx),
    } as any;

    const step = new SignWithSignerStep(mockSigner);
    const ctx = makeMockContext({ transaction: {} as any });

    const result = await step.execute(ctx);

    expect(result.signedTransaction).toEqual({
      kind: 'evm',
      rawTransaction: mockRawTx,
    });
  });

  it('propagates the rest of the context', async () => {
    const mockSigner = {
      signTransaction: jest.fn().mockResolvedValue('0x'),
    } as any;

    const step = new SignWithSignerStep(mockSigner);
    const ctx = makeMockContext({ transaction: {} as any });

    const result = await step.execute(ctx);

    expect(result.command).toBe('test-command');
    expect(result.params).toEqual({ foo: 'bar' });
  });
});

describe('SignWithExternalStep', () => {
  it('has the correct name', () => {
    const mockExternalClient: ExternalSigningClient = {
      sign: jest.fn(),
    };
    const step = new SignWithExternalStep(mockExternalClient);
    expect(step.name).toBe('SignWithExternal');
  });

  it('calls externalClient.sign with serialized transaction bytes', async () => {
    const inputBytes = new Uint8Array([1, 2, 3]);
    const signedBytes = new Uint8Array([4, 5, 6]);
    const mockExternalClient: ExternalSigningClient = {
      sign: jest.fn().mockResolvedValue(signedBytes),
    };

    const step = new SignWithExternalStep(mockExternalClient);
    const ctx = makeMockContext({
      signedTransaction: {
        kind: 'serialized',
        transactionBytes: inputBytes,
      },
    });

    await step.execute(ctx);

    expect(mockExternalClient.sign).toHaveBeenCalledWith(inputBytes);
  });

  it('returns updated serialized signedTransaction with signed bytes', async () => {
    const inputBytes = new Uint8Array([1, 2, 3]);
    const signedBytes = new Uint8Array([4, 5, 6]);
    const mockExternalClient: ExternalSigningClient = {
      sign: jest.fn().mockResolvedValue(signedBytes),
    };

    const step = new SignWithExternalStep(mockExternalClient);
    const ctx = makeMockContext({
      signedTransaction: {
        kind: 'serialized',
        transactionBytes: inputBytes,
      },
    });

    const result = await step.execute(ctx);

    expect(result.signedTransaction).toEqual({
      kind: 'serialized',
      transactionBytes: signedBytes,
      bodyBytes: undefined,
    });
  });

  it('preserves bodyBytes from original serialized transaction', async () => {
    const inputBytes = new Uint8Array([1, 2, 3]);
    const bodyBytes = new Uint8Array([7, 8, 9]);
    const signedBytes = new Uint8Array([4, 5, 6]);
    const mockExternalClient: ExternalSigningClient = {
      sign: jest.fn().mockResolvedValue(signedBytes),
    };

    const step = new SignWithExternalStep(mockExternalClient);
    const ctx = makeMockContext({
      signedTransaction: {
        kind: 'serialized',
        transactionBytes: inputBytes,
        bodyBytes,
      },
    });

    const result = await step.execute(ctx);

    expect((result.signedTransaction as any).bodyBytes).toEqual(bodyBytes);
  });
});
