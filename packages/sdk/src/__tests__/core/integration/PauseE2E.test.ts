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

// Undo the global mock from jest-setup-file so we test the real implementation
jest.unmock('../../../core/orchestration/TransactionOrchestrator');

import { ContractExecuteTransaction, Status } from '@hiero-ledger/sdk';
import { StableCoinSDK } from '../../../core/StableCoinSDK.js';
import { TransactionOrchestrator } from '../../../core/orchestration/TransactionOrchestrator.js';

// Valid Solidity address for contract
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000001234';

describe('Pause E2E Integration', () => {
  it('should build a valid Hedera transaction for pause via TransactionOrchestrator', () => {
    // We can't execute the full pipeline without a real Hedera Client,
    // but we CAN verify that the TransactionOrchestrator correctly resolves
    // the builder and that the builder produces a valid transaction.

    const executor = new TransactionOrchestrator({
      network: 'testnet',
      signing: { type: 'client', client: {} as any },
      diagnostics: false,
    });

    // Resolve the builder and build transaction manually
    const builder = (executor as any).resolveBuilder('pause');
    expect(builder).toBeDefined();
    expect(builder.getMethodName()).toBe('pause');

    // Build Hedera transaction
    const tx = builder.buildHederaTransaction({
      contractAddress: CONTRACT_ADDRESS,
    });

    expect(tx).toBeInstanceOf(ContractExecuteTransaction);
  });

  it('should build a valid EVM transaction for pause via TransactionOrchestrator', async () => {
    const executor = new TransactionOrchestrator({
      network: 'testnet',
      signing: { type: 'client', client: {} as any },
      diagnostics: false,
    });

    const builder = (executor as any).resolveBuilder('pause');

    // Build EVM transaction
    const evmTx = await builder.buildEVMTransaction({
      contractAddress: CONTRACT_ADDRESS,
    });

    expect(evmTx).toBeDefined();
    expect(evmTx.data).toBeDefined();
    // pause() selector is 0x8456cb59
    expect(evmTx.data).toContain('8456cb59');
    expect(evmTx.gasLimit).toBe(100_000);
  });

  it('should extractResult from receipt and produce result', () => {
    const executor = new TransactionOrchestrator({
      network: 'testnet',
      signing: { type: 'client', client: {} as any },
      diagnostics: false,
    });

    const builder = (executor as any).resolveBuilder('pause');

    // Simulate a receipt
    const mockReceipt = {
      status: Status.Success,
      transactionId: { toString: () => '0.0.1234@1234567890.000' },
    };

    const result = builder.extractResult(mockReceipt, {});
    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('0.0.1234@1234567890.000');
  });

  it('should execute full pipeline with mocked client', async () => {
    // Mock a minimal Hedera Client that can freeze, sign, execute, and get receipt
    const mockReceipt = {
      status: Status.Success,
      transactionId: { toString: () => '0.0.5678@9876543210.000' },
    };

    const mockResponse = {
      getReceipt: jest.fn().mockResolvedValue(mockReceipt),
    };

    const mockSignedTx = {
      execute: jest.fn().mockResolvedValue(mockResponse),
    };

    const mockFrozenTx = {
      sign: jest.fn().mockResolvedValue(mockSignedTx),
    };

    // We need to mock ContractExecuteTransaction behavior
    // The pipeline will call: builder.buildHederaTransaction → freezeWith → sign → execute → getReceipt
    const mockPrivateKey = { publicKey: {} };
    const mockClient = {
      _operator: { privateKey: mockPrivateKey },
    };

    // Override the builder's buildHederaTransaction to return a mockable tx
    const executor = new TransactionOrchestrator({
      network: 'testnet',
      signing: { type: 'client', client: mockClient as any },
      diagnostics: false,
    });

    const builder = (executor as any).resolveBuilder('pause');

    // Instead of executing through TransactionOrchestrator (which creates a real ContractExecuteTransaction
    // that can't be mocked easily), we test the pipeline manually with our mock
    const { PipelineExecutor } = await import('../../../core/dlt/base/PipelineExecutor.js');

    // Create a mini-pipeline that simulates the flow
    const mockBuildStep = {
      name: 'BuildHedera',
      execute: jest.fn().mockImplementation(async (ctx: any) => {
        const transaction = builder.buildHederaTransaction({ contractAddress: CONTRACT_ADDRESS });
        return { ...ctx, transaction };
      }),
    };

    const mockSignStep = {
      name: 'SignWithClient',
      execute: jest.fn().mockImplementation(async (ctx: any) => {
        return { ...ctx, signedTransaction: { kind: 'hedera', transaction: mockSignedTx } };
      }),
    };

    const mockSubmitStep = {
      name: 'SubmitToHedera',
      execute: jest.fn().mockImplementation(async (ctx: any) => {
        return { ...ctx, response: mockResponse };
      }),
    };

    const mockParseStep = {
      name: 'ParseHederaReceipt',
      execute: jest.fn().mockImplementation(async (ctx: any) => {
        return { ...ctx, receipt: mockReceipt };
      }),
    };

    const { ExtractResultStep } = await import('../../../core/dlt/shared/ExtractResultStep.js');

    const pipeline = new PipelineExecutor([
      mockBuildStep,
      mockSignStep,
      mockSubmitStep,
      mockParseStep,
      new ExtractResultStep(),
    ]);

    const context = {
      operationName: 'pause',
      params: { contractAddress: CONTRACT_ADDRESS },
      builder,
    };

    const result = await pipeline.execute(context);

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('0.0.5678@9876543210.000');
    expect(mockBuildStep.execute).toHaveBeenCalled();
    expect(mockSignStep.execute).toHaveBeenCalled();
    expect(mockSubmitStep.execute).toHaveBeenCalled();
    expect(mockParseStep.execute).toHaveBeenCalled();
  });
});
