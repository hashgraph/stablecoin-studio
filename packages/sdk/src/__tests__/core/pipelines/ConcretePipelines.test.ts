/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { HederaExecutePipeline } from '../../../core/pipelines/HederaExecutePipeline.js';
import { EVMExecutePipeline } from '../../../core/pipelines/EVMExecutePipeline.js';
import { HederaSerializePipeline } from '../../../core/pipelines/HederaSerializePipeline.js';
import { EVMSerializePipeline } from '../../../core/pipelines/EVMSerializePipeline.js';
import { ExternalSigningClient } from '../../../core/pipelines/steps/SignWithExternalStep.js';
import { PipelineContext, CommandHandlerLike } from '../../../core/types/PipelineContext.js';

// ── Shared mock factories ──────────────────────────────────────────────────────

function makeMockClient() {
  return {
    _operator: { privateKey: {} },
  } as any;
}

function makeMockProvider() {
  return {
    broadcastTransaction: jest.fn(),
  } as any;
}

function makeMockSigner() {
  return {
    signTransaction: jest.fn(),
  } as any;
}

function makeMockExternalClient(): ExternalSigningClient {
  return { sign: jest.fn() };
}

function makeMockHandler(): CommandHandlerLike {
  return {
    buildHederaTransaction: jest.fn(),
    buildEVMTransaction: jest.fn(),
    analyze: jest.fn(),
    supportsMode: jest.fn().mockReturnValue(true),
    getSupportedModes: jest.fn().mockReturnValue(['hedera', 'evm']),
    validate: jest.fn(),
  };
}

function makeBaseContext(overrides: Partial<PipelineContext> = {}): PipelineContext {
  return {
    command: 'TestCommand',
    params: { symbol: 'TKN' },
    handler: makeMockHandler(),
    ...overrides,
  };
}

// ── Step order tests ───────────────────────────────────────────────────────────

describe('HederaExecutePipeline step order', () => {
  it('has exactly 5 steps', () => {
    const pipeline = new HederaExecutePipeline(makeMockClient());
    expect(pipeline.getSteps()).toHaveLength(5);
  });

  it('has steps in the correct order: BuildHedera → SignWithClient → SubmitToHedera → ParseHederaReceipt → Analyze', () => {
    const pipeline = new HederaExecutePipeline(makeMockClient());
    const names = pipeline.getSteps().map(s => s.name);
    expect(names).toEqual([
      'BuildHedera',
      'SignWithClient',
      'SubmitToHedera',
      'ParseHederaReceipt',
      'Analyze',
    ]);
  });
});

describe('EVMExecutePipeline step order', () => {
  it('has exactly 5 steps', () => {
    const pipeline = new EVMExecutePipeline(makeMockProvider(), makeMockSigner());
    expect(pipeline.getSteps()).toHaveLength(5);
  });

  it('has steps in the correct order: BuildEVM → SignWithSigner → SubmitToRPC → ParseEVMReceipt → Analyze', () => {
    const pipeline = new EVMExecutePipeline(makeMockProvider(), makeMockSigner());
    const names = pipeline.getSteps().map(s => s.name);
    expect(names).toEqual([
      'BuildEVM',
      'SignWithSigner',
      'SubmitToRPC',
      'ParseEVMReceipt',
      'Analyze',
    ]);
  });
});

describe('HederaSerializePipeline step order', () => {
  it('has exactly 6 steps', () => {
    const pipeline = new HederaSerializePipeline(makeMockClient(), makeMockExternalClient());
    expect(pipeline.getSteps()).toHaveLength(6);
  });

  it('has steps in the correct order: BuildHedera → SerializeHedera → SignWithExternal → SubmitSignedHederaTransaction → ParseHederaReceipt → Analyze', () => {
    const pipeline = new HederaSerializePipeline(makeMockClient(), makeMockExternalClient());
    const names = pipeline.getSteps().map(s => s.name);
    expect(names).toEqual([
      'BuildHedera',
      'SerializeHedera',
      'SignWithExternal',
      'SubmitSignedHederaTransaction',
      'ParseHederaReceipt',
      'Analyze',
    ]);
  });
});

describe('EVMSerializePipeline step order', () => {
  it('has exactly 6 steps', () => {
    const pipeline = new EVMSerializePipeline(makeMockProvider(), makeMockExternalClient());
    expect(pipeline.getSteps()).toHaveLength(6);
  });

  it('has steps in the correct order: BuildEVM → SerializeEVM → SignWithExternal → SubmitSignedEVMTransaction → ParseEVMReceipt → Analyze', () => {
    const pipeline = new EVMSerializePipeline(makeMockProvider(), makeMockExternalClient());
    const names = pipeline.getSteps().map(s => s.name);
    expect(names).toEqual([
      'BuildEVM',
      'SerializeEVM',
      'SignWithExternal',
      'SubmitSignedEVMTransaction',
      'ParseEVMReceipt',
      'Analyze',
    ]);
  });
});

// ── Integration tests (full flow with mocks) ──────────────────────────────────

describe('HederaExecutePipeline integration', () => {
  it('executes full flow and returns result from handler.analyze', async () => {
    const mockTx = { kind: 'hedera-tx' };
    const mockFrozenTx = {
      sign: jest.fn().mockResolvedValue({ kind: 'signed-hedera-tx' }),
    };
    const mockSignedTx = { kind: 'signed-hedera-tx' };
    const mockTxWithFreeze = {
      freezeWith: jest.fn().mockReturnValue(mockFrozenTx),
    };
    const mockResponse = { transactionId: 'tx-001' };
    const mockReceipt = { status: 'SUCCESS', tokenId: '0.0.999' };
    const expectedResult = { success: true, tokenId: '0.0.999' };

    const mockHandler = makeMockHandler();
    (mockHandler.buildHederaTransaction as jest.Mock).mockReturnValue(mockTxWithFreeze);
    (mockHandler.analyze as jest.Mock).mockReturnValue(expectedResult);

    const mockClient = {
      _operator: { privateKey: {} },
    } as any;

    // We need to mock the signed transaction's execute method
    // The signed tx returned by frozen.sign() needs an .execute method
    const mockSignedTxWithExecute = {
      execute: jest.fn().mockResolvedValue(mockResponse),
    };
    mockFrozenTx.sign = jest.fn().mockResolvedValue(mockSignedTxWithExecute);

    const mockResponseWithReceipt = {
      getReceipt: jest.fn().mockResolvedValue(mockReceipt),
    };
    mockSignedTxWithExecute.execute = jest.fn().mockResolvedValue(mockResponseWithReceipt);

    const pipeline = new HederaExecutePipeline(mockClient);
    const ctx = makeBaseContext({ handler: mockHandler });

    const result = await pipeline.execute(ctx);

    expect(result).toBe(expectedResult);
    expect(mockHandler.buildHederaTransaction).toHaveBeenCalledWith(ctx.params);
    expect(mockFrozenTx.sign).toHaveBeenCalled();
    expect(mockSignedTxWithExecute.execute).toHaveBeenCalledWith(mockClient);
    expect(mockResponseWithReceipt.getReceipt).toHaveBeenCalledWith(mockClient);
    expect(mockHandler.analyze).toHaveBeenCalledWith(mockReceipt, ctx.params);
  });
});

describe('EVMExecutePipeline integration', () => {
  it('executes full flow and returns result from handler.analyze', async () => {
    const mockTx = { to: '0xabc', value: '0' };
    const mockRawTx = '0xdeadbeef';
    const mockResponse = { hash: '0xresult' };
    const mockReceipt = { blockNumber: 100, status: 1 };
    const expectedResult = { success: true, transactionId: '0xresult' };

    const mockHandler = makeMockHandler();
    (mockHandler.buildEVMTransaction as jest.Mock).mockResolvedValue(mockTx);
    (mockHandler.analyze as jest.Mock).mockReturnValue(expectedResult);

    const mockSigner = {
      signTransaction: jest.fn().mockResolvedValue(mockRawTx),
    } as any;

    const mockResponseWithWait = {
      wait: jest.fn().mockResolvedValue(mockReceipt),
    };
    const mockProvider = {
      broadcastTransaction: jest.fn().mockResolvedValue(mockResponseWithWait),
    } as any;

    const pipeline = new EVMExecutePipeline(mockProvider, mockSigner);
    const ctx = makeBaseContext({ handler: mockHandler });

    const result = await pipeline.execute(ctx);

    expect(result).toBe(expectedResult);
    expect(mockHandler.buildEVMTransaction).toHaveBeenCalledWith(ctx.params);
    expect(mockSigner.signTransaction).toHaveBeenCalledWith(mockTx);
    expect(mockProvider.broadcastTransaction).toHaveBeenCalledWith(mockRawTx);
    expect(mockResponseWithWait.wait).toHaveBeenCalled();
    expect(mockHandler.analyze).toHaveBeenCalledWith(mockReceipt, ctx.params);
  });
});

describe('HederaSerializePipeline integration', () => {
  it('executes full flow: build → serialize → external sign → submit → parse → analyze', async () => {
    const txBytes = new Uint8Array([1, 2, 3]);
    const signedBytes = new Uint8Array([4, 5, 6]);
    const mockReceipt = { status: 'SUCCESS' };
    const expectedResult = { success: true };

    const mockHandler = makeMockHandler();
    const mockFrozenTx = {
      toBytes: jest.fn().mockReturnValue(txBytes),
      _signedTransactions: { get: jest.fn().mockReturnValue(null) },
    };
    const mockTx = { freezeWith: jest.fn().mockReturnValue(mockFrozenTx) };
    (mockHandler.buildHederaTransaction as jest.Mock).mockReturnValue(mockTx);
    (mockHandler.analyze as jest.Mock).mockReturnValue(expectedResult);

    const mockExternalClient: ExternalSigningClient = {
      sign: jest.fn().mockResolvedValue(signedBytes),
    };

    const mockResponseWithReceipt = {
      getReceipt: jest.fn().mockResolvedValue(mockReceipt),
    };

    // Mock Transaction.fromBytes for the SubmitSignedHederaTransactionStep
    const hederaSdk = require('@hiero-ledger/sdk');
    const originalFromBytes = hederaSdk.Transaction.fromBytes;
    const mockDeserializedTx = {
      execute: jest.fn().mockResolvedValue(mockResponseWithReceipt),
    };
    hederaSdk.Transaction.fromBytes = jest.fn().mockReturnValue(mockDeserializedTx);

    const mockClient = {} as any;

    try {
      const pipeline = new HederaSerializePipeline(mockClient, mockExternalClient);
      const ctx = makeBaseContext({ handler: mockHandler });

      const result = await pipeline.execute(ctx);

      expect(result).toBe(expectedResult);
      expect(mockHandler.buildHederaTransaction).toHaveBeenCalledWith(ctx.params);
      expect(mockTx.freezeWith).toHaveBeenCalledWith(mockClient);
      expect(mockExternalClient.sign).toHaveBeenCalledWith(txBytes);
      expect(hederaSdk.Transaction.fromBytes).toHaveBeenCalledWith(signedBytes);
      expect(mockDeserializedTx.execute).toHaveBeenCalledWith(mockClient);
      expect(mockResponseWithReceipt.getReceipt).toHaveBeenCalledWith(mockClient);
      expect(mockHandler.analyze).toHaveBeenCalledWith(mockReceipt, ctx.params);
    } finally {
      hederaSdk.Transaction.fromBytes = originalFromBytes;
    }
  });
});

describe('EVMSerializePipeline integration', () => {
  it('executes full flow: build → serialize → external sign → submit → parse → analyze', async () => {
    const mockUnsignedSerialized = '0x0102';
    const signedBytes = new Uint8Array([0x04, 0x05]);
    const mockReceipt = { blockNumber: 200, status: 1 };
    const expectedResult = { success: true };

    const mockHandler = makeMockHandler();
    const mockTx = { to: '0xabc' };
    (mockHandler.buildEVMTransaction as jest.Mock).mockResolvedValue(mockTx);
    (mockHandler.analyze as jest.Mock).mockReturnValue(expectedResult);

    const mockExternalClient: ExternalSigningClient = {
      sign: jest.fn().mockResolvedValue(signedBytes),
    };

    const mockResponseWithWait = {
      wait: jest.fn().mockResolvedValue(mockReceipt),
    };
    const mockProvider = {
      broadcastTransaction: jest.fn().mockResolvedValue(mockResponseWithWait),
    } as any;

    // Mock ethers.Transaction.from for SerializeEVMStep
    const ethersModule = require('ethers');
    const originalTransactionFrom = ethersModule.Transaction.from;
    ethersModule.Transaction.from = jest.fn().mockReturnValue({
      unsignedSerialized: mockUnsignedSerialized,
    });

    try {
      const pipeline = new EVMSerializePipeline(mockProvider, mockExternalClient);
      const ctx = makeBaseContext({ handler: mockHandler });

      const result = await pipeline.execute(ctx);

      expect(result).toBe(expectedResult);
      expect(mockHandler.buildEVMTransaction).toHaveBeenCalledWith(ctx.params);
      expect(ethersModule.Transaction.from).toHaveBeenCalled();
      expect(mockExternalClient.sign).toHaveBeenCalled();
      expect(mockProvider.broadcastTransaction).toHaveBeenCalled();
      expect(mockResponseWithWait.wait).toHaveBeenCalled();
      expect(mockHandler.analyze).toHaveBeenCalledWith(mockReceipt, ctx.params);
    } finally {
      ethersModule.Transaction.from = originalTransactionFrom;
    }
  });
});
