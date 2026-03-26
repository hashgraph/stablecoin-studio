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

import { PipelineExecutor } from '../../../../core/dlt/base/PipelineExecutor.js';
import { ExecutionStep } from '../../../../core/dlt/base/ExecutionStep.js';
import {
  DefaultExecutionErrorHandler,
  ExecutionErrorHandler,
} from '../../../../core/dlt/base/ExecutionErrorHandler.js';
import { ExecutionContext, TransactionBuilder } from '../../../../core/types/ExecutionContext.js';
import { PipelineError } from '../../../../core/errors/PipelineError.js';

// ── Mock helpers ───────────────────────────────────────────────────────────────

class MockStep implements ExecutionStep {
  readonly name: string;
  private executeFn: (ctx: ExecutionContext) => Promise<ExecutionContext>;

  constructor(name: string, fn: (ctx: ExecutionContext) => Promise<ExecutionContext>) {
    this.name = name;
    this.executeFn = fn;
  }

  async execute(ctx: ExecutionContext): Promise<ExecutionContext> {
    return this.executeFn(ctx);
  }
}

const mockHandler: TransactionBuilder = {
  buildHederaTransaction: jest.fn(),
  buildEVMTransaction: jest.fn(),
  extractResult: jest.fn(),
  supportsMode: jest.fn().mockReturnValue(true),
  getSupportedModes: jest.fn().mockReturnValue(['hedera', 'evm']),
  validate: jest.fn(),
};

function makeContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    operationName: 'TestCommand',
    params: {},
    builder: mockHandler,
    ...overrides,
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('PipelineExecutor', () => {
  // Test 1: Pipeline executes steps in correct order
  it('should execute steps in the correct order', async () => {
    const executionOrder: string[] = [];

    const step1 = new MockStep('Step1', async (ctx) => {
      executionOrder.push('Step1');
      return ctx;
    });
    const step2 = new MockStep('Step2', async (ctx) => {
      executionOrder.push('Step2');
      return ctx;
    });
    const step3 = new MockStep('Step3', async (ctx) => {
      executionOrder.push('Step3');
      return { ...ctx, result: { success: true } };
    });

    const pipeline = new PipelineExecutor([step1, step2, step3]);
    await pipeline.execute(makeContext());

    expect(executionOrder).toEqual(['Step1', 'Step2', 'Step3']);
  });

  // Test 2: Each step receives the enriched context from the previous step
  it('should pass enriched context from one step to the next', async () => {
    const step1 = new MockStep('Step1', async (ctx) => {
      return { ...ctx, params: { ...ctx.params, enrichedByStep1: true } };
    });

    let receivedCtxInStep2: ExecutionContext | undefined;
    const step2 = new MockStep('Step2', async (ctx) => {
      receivedCtxInStep2 = ctx;
      return { ...ctx, result: { success: true } };
    });

    const pipeline = new PipelineExecutor([step1, step2]);
    await pipeline.execute(makeContext());

    expect(receivedCtxInStep2?.params).toMatchObject({ enrichedByStep1: true });
  });

  // Test 3: Pipeline returns ctx.result at the end
  it('should return ctx.result at the end of execution', async () => {
    const expectedResult = { success: true, transactionId: 'tx-123' };

    const step = new MockStep('FinalStep', async (ctx) => {
      return { ...ctx, result: expectedResult };
    });

    const pipeline = new PipelineExecutor([step]);
    const result = await pipeline.execute(makeContext());

    expect(result).toEqual(expectedResult);
  });

  // Test 4: Pipeline throws if no result at the end
  it('should throw if no result is produced at the end of execution', async () => {
    const step = new MockStep('NoResultStep', async (ctx) => ctx);

    const pipeline = new PipelineExecutor([step]);

    await expect(pipeline.execute(makeContext())).rejects.toThrow(
      "Execution completed but no result was produced for 'TestCommand'"
    );
  });

  // Test 5: Error in a step is propagated to the errorHandler
  it('should call errorHandler when a step throws', async () => {
    const originalError = new Error('Step failed');
    const failingStep = new MockStep('FailingStep', async () => {
      throw originalError;
    });

    const mockErrorHandler: ExecutionErrorHandler = {
      handle: jest.fn().mockResolvedValue({
        ...makeContext(),
        result: { success: false },
      }),
    };

    const pipeline = new PipelineExecutor([failingStep], mockErrorHandler);
    await pipeline.execute(makeContext());

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(
      originalError,
      failingStep,
      expect.objectContaining({ operationName: 'TestCommand' })
    );
  });

  // Test 6: ErrorHandler can return context (retry success) → pipeline continues
  it('should continue pipeline execution when errorHandler returns a context', async () => {
    const failingStep = new MockStep('FailingStep', async () => {
      throw new Error('Transient failure');
    });

    const recoveryContext = makeContext({ result: { success: true, recovered: true } });

    const mockErrorHandler: ExecutionErrorHandler = {
      handle: jest.fn().mockResolvedValue(recoveryContext),
    };

    const pipeline = new PipelineExecutor([failingStep], mockErrorHandler);
    const result = await pipeline.execute(makeContext());

    expect(result).toMatchObject({ success: true, recovered: true });
  });

  // Test 7: ErrorHandler can throw → pipeline stops
  it('should stop pipeline when errorHandler throws', async () => {
    const failingStep = new MockStep('FailingStep', async () => {
      throw new Error('Step error');
    });

    const handlerError = new PipelineError({
      message: 'Handler also failed',
      step: 'FailingStep',
      command: 'TestCommand',
    });

    const mockErrorHandler: ExecutionErrorHandler = {
      handle: jest.fn().mockRejectedValue(handlerError),
    };

    const pipeline = new PipelineExecutor([failingStep], mockErrorHandler);

    await expect(pipeline.execute(makeContext())).rejects.toThrow(handlerError);
  });

  // Test 8: DefaultExecutionErrorHandler retries on retryable steps (UNAVAILABLE/BUSY/timeout)
  it('DefaultExecutionErrorHandler should retry on UNAVAILABLE error in retryable step', async () => {
    const executeCount = { count: 0 };

    const submitStep = new MockStep('SubmitToHedera', async (ctx) => {
      executeCount.count++;
      if (executeCount.count < 2) {
        throw new Error('UNAVAILABLE: service unavailable');
      }
      return { ...ctx, result: { success: true } };
    });

    const errorHandler = new DefaultExecutionErrorHandler(2);
    const pipeline = new PipelineExecutor([submitStep], errorHandler);
    const result = await pipeline.execute(makeContext());

    expect(result.success).toBe(true);
    expect(executeCount.count).toBe(2);
  }, 15000);

  // Test 9: DefaultExecutionErrorHandler does NOT retry on non-retryable steps
  it('DefaultExecutionErrorHandler should not retry on non-retryable steps', async () => {
    const failingStep = new MockStep('BuildHederaStep', async () => {
      throw new Error('UNAVAILABLE: some error');
    });

    const errorHandler = new DefaultExecutionErrorHandler(2);
    const pipeline = new PipelineExecutor([failingStep], errorHandler);

    await expect(pipeline.execute(makeContext())).rejects.toThrow(PipelineError);
  });

  // Test 10: DefaultExecutionErrorHandler respects maxRetries
  it('DefaultExecutionErrorHandler should throw PipelineError after exhausting maxRetries', async () => {
    const executeCount = { count: 0 };

    const submitStep = new MockStep('SubmitToHedera', async () => {
      executeCount.count++;
      throw new Error('BUSY: always busy');
    });

    const maxRetries = 2;
    const errorHandler = new DefaultExecutionErrorHandler(maxRetries);
    const pipeline = new PipelineExecutor([submitStep], errorHandler);

    await expect(pipeline.execute(makeContext())).rejects.toThrow(PipelineError);
    // original execute + maxRetries retries
    expect(executeCount.count).toBe(maxRetries + 1);
  }, 15000);

  // Test 11: PipelineError contains step name, command, and cause
  it('DefaultExecutionErrorHandler should wrap errors in PipelineError with correct metadata', async () => {
    const originalError = new Error('Original problem');

    const failingStep = new MockStep('NonRetryableStep', async () => {
      throw originalError;
    });

    const errorHandler = new DefaultExecutionErrorHandler();
    const pipeline = new PipelineExecutor([failingStep], errorHandler);

    let caughtError: unknown;
    try {
      await pipeline.execute(makeContext({ operationName: 'MyCommand' }));
    } catch (e) {
      caughtError = e;
    }

    expect(caughtError).toBeInstanceOf(PipelineError);
    const pipelineError = caughtError as PipelineError;
    expect(pipelineError.step).toBe('NonRetryableStep');
    expect(pipelineError.command).toBe('MyCommand');
    expect(pipelineError.cause).toBe(originalError);
  });

  // getSteps() returns the steps
  it('getSteps() should return the pipeline steps', () => {
    const step1 = new MockStep('Step1', async (ctx) => ctx);
    const step2 = new MockStep('Step2', async (ctx) => ctx);

    const pipeline = new PipelineExecutor([step1, step2]);

    expect(pipeline.getSteps()).toHaveLength(2);
    expect(pipeline.getSteps()[0]).toBe(step1);
    expect(pipeline.getSteps()[1]).toBe(step2);
  });
});
