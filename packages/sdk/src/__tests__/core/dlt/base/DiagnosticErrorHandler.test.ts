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

import { DiagnosticErrorHandler } from '../../../../core/dlt/base/DiagnosticErrorHandler.js';
import { PipelineError } from '../../../../core/errors/PipelineError.js';
import { ExecutionContext, TransactionBuilder } from '../../../../core/types/ExecutionContext.js';
import { ExecutionStep } from '../../../../core/dlt/base/ExecutionStep.js';
import { ExecutionErrorHandler } from '../../../../core/dlt/base/ExecutionErrorHandler.js';
import {
  TransactionDiagnostics,
  DiagnosticReport,
} from '../../../../core/dlt/shared/TransactionDiagnostics.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

const mockBuilder: TransactionBuilder = {
  buildHederaTransaction: jest.fn(),
  buildEVMTransaction: jest.fn(),
  extractResult: jest.fn(),
  supportsMode: jest.fn().mockReturnValue(true),
  getSupportedModes: jest.fn().mockReturnValue(['hedera', 'evm']),
  validate: jest.fn(),
};

function makeContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    operationName: 'burn',
    params: { contractAddress: '0x1234' },
    builder: mockBuilder,
    ...overrides,
  };
}

function makeStep(name: string): ExecutionStep {
  return { name, execute: jest.fn() };
}

function makeMockDiagnostics(report: Partial<DiagnosticReport> = {}): TransactionDiagnostics {
  return {
    diagnose: jest.fn().mockResolvedValue({
      transactionId: 'tx-123',
      contractAddress: '0x1234',
      rawRevertReason: '0x08c379a0...',
      revertMessage: 'Paused',
      callTrace: [],
      timestamp: new Date(),
      ...report,
    }),
    decodeRevertReason: jest.fn(),
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('DiagnosticErrorHandler', () => {
  it('should delegate to inner handler first', async () => {
    const recoveredCtx = makeContext({ result: { success: true } });
    const innerHandler: ExecutionErrorHandler = {
      handle: jest.fn().mockResolvedValue(recoveredCtx),
    };

    const diagnostics = makeMockDiagnostics();
    const handler = new DiagnosticErrorHandler(diagnostics, innerHandler);

    const step = makeStep('SubmitToHedera');
    const result = await handler.handle(new Error('Transient'), step, makeContext());

    expect(result).toBe(recoveredCtx);
    // diagnostics should NOT be called when inner handler succeeds
    expect(diagnostics.diagnose).not.toHaveBeenCalled();
  });

  it('should enrich PipelineError with diagnostics when inner handler fails on diagnostic step', async () => {
    const pipelineError = new PipelineError({
      message: 'Failed at step',
      step: 'SubmitToHedera',
      command: 'burn',
    });

    const innerHandler: ExecutionErrorHandler = {
      handle: jest.fn().mockRejectedValue(pipelineError),
    };

    const diagnostics = makeMockDiagnostics({
      revertMessage: 'Token is paused',
      callTrace: [
        {
          from: '0x1111',
          to: '0x1234',
          callType: 'CALL',
          input: '0x',
          depth: 0,
        },
      ],
    });

    const handler = new DiagnosticErrorHandler(diagnostics, innerHandler);

    await expect(
      handler.handle(new Error('Tx failed'), makeStep('SubmitToHedera'), makeContext()),
    ).rejects.toThrow(PipelineError);

    expect(diagnostics.diagnose).toHaveBeenCalledWith(
      '', // no transactionId in context
      '0x1234',
      undefined,
    );

    expect(pipelineError.diagnostics).toBeDefined();
    expect(pipelineError.diagnostics?.revertMessage).toBe('Token is paused');
    expect(pipelineError.message).toContain('Token is paused');
    expect(pipelineError.context.callTrace).toHaveLength(1);
  });

  it('should NOT call diagnostics for non-diagnostic steps', async () => {
    const pipelineError = new PipelineError({
      message: 'Build failed',
      step: 'BuildHedera',
      command: 'burn',
    });

    const innerHandler: ExecutionErrorHandler = {
      handle: jest.fn().mockRejectedValue(pipelineError),
    };

    const diagnostics = makeMockDiagnostics();
    const handler = new DiagnosticErrorHandler(diagnostics, innerHandler);

    await expect(
      handler.handle(new Error('Build error'), makeStep('BuildHedera'), makeContext()),
    ).rejects.toThrow(PipelineError);

    expect(diagnostics.diagnose).not.toHaveBeenCalled();
    expect(pipelineError.diagnostics).toBeUndefined();
  });

  it('should extract transactionId from context.response', async () => {
    const pipelineError = new PipelineError({
      message: 'Parse failed',
      step: 'ParseHederaReceipt',
      command: 'burn',
    });

    const innerHandler: ExecutionErrorHandler = {
      handle: jest.fn().mockRejectedValue(pipelineError),
    };

    const diagnostics = makeMockDiagnostics();
    const handler = new DiagnosticErrorHandler(diagnostics, innerHandler);

    const ctx = makeContext({
      response: { transactionId: '0.0.1234@9999.000' } as any,
    });

    await expect(
      handler.handle(new Error('Parse error'), makeStep('ParseHederaReceipt'), ctx),
    ).rejects.toThrow(PipelineError);

    expect(diagnostics.diagnose).toHaveBeenCalledWith(
      '0.0.1234@9999.000',
      '0x1234',
      undefined,
    );
  });

  it('should handle diagnostics failure gracefully (best-effort)', async () => {
    const pipelineError = new PipelineError({
      message: 'Submit failed',
      step: 'SubmitToRPC',
      command: 'burn',
    });

    const innerHandler: ExecutionErrorHandler = {
      handle: jest.fn().mockRejectedValue(pipelineError),
    };

    const diagnostics: TransactionDiagnostics = {
      diagnose: jest.fn().mockRejectedValue(new Error('Mirror node down')),
      decodeRevertReason: jest.fn(),
    };

    const handler = new DiagnosticErrorHandler(diagnostics, innerHandler);

    // Should still throw the original PipelineError, not the diagnostics error
    await expect(
      handler.handle(new Error('RPC error'), makeStep('SubmitToRPC'), makeContext()),
    ).rejects.toThrow(pipelineError);

    // diagnostics was called but its failure was swallowed
    expect(diagnostics.diagnose).toHaveBeenCalled();
    expect(pipelineError.diagnostics).toBeUndefined();
  });

  it('should work with all diagnostic step names', async () => {
    const diagnosticSteps = [
      'SubmitToHedera',
      'SubmitToRPC',
      'SubmitSignedHederaTransaction',
      'SubmitSignedEVMTransaction',
      'ParseHederaReceipt',
      'ParseEVMReceipt',
    ];

    for (const stepName of diagnosticSteps) {
      const error = new PipelineError({
        message: `Failed at ${stepName}`,
        step: stepName,
        command: 'test',
      });

      const innerHandler: ExecutionErrorHandler = {
        handle: jest.fn().mockRejectedValue(error),
      };

      const diagnostics = makeMockDiagnostics();
      const handler = new DiagnosticErrorHandler(diagnostics, innerHandler);

      await expect(
        handler.handle(new Error('fail'), makeStep(stepName), makeContext()),
      ).rejects.toThrow(PipelineError);

      expect(diagnostics.diagnose).toHaveBeenCalled();
    }
  });

  it('should pass ABIs to diagnostics when provided', async () => {
    const pipelineError = new PipelineError({
      message: 'Failed',
      step: 'SubmitToHedera',
      command: 'burn',
    });

    const innerHandler: ExecutionErrorHandler = {
      handle: jest.fn().mockRejectedValue(pipelineError),
    };

    const diagnostics = makeMockDiagnostics();
    const abis = ['error InsufficientBalance(uint256 required, uint256 available)'];
    const handler = new DiagnosticErrorHandler(diagnostics, innerHandler, abis);

    await expect(
      handler.handle(new Error('fail'), makeStep('SubmitToHedera'), makeContext()),
    ).rejects.toThrow();

    expect(diagnostics.diagnose).toHaveBeenCalledWith('', '0x1234', abis);
  });
});
