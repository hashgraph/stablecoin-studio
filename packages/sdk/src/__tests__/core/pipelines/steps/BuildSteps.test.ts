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
