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

import { PipelineError } from '../../../core/errors/PipelineError.js';

describe('PipelineError', () => {
  it('should create a PipelineError with step, command, and context', () => {
    const error = new PipelineError({
      message: 'Something went wrong',
      step: 'BuildHederaStep',
      command: 'CreateToken',
      context: { hasTransaction: true },
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PipelineError);
    expect(error.message).toBe('Something went wrong');
    expect(error.name).toBe('PipelineError');
    expect(error.step).toBe('BuildHederaStep');
    expect(error.command).toBe('CreateToken');
    expect(error.context).toEqual({ hasTransaction: true });
  });

  it('should default context to empty object when not provided', () => {
    const error = new PipelineError({
      message: 'Error without context',
      step: 'SubmitToHedera',
      command: 'TransferToken',
    });

    expect(error.context).toEqual({});
  });

  it('should propagate cause correctly', () => {
    const originalError = new Error('Original cause');
    const error = new PipelineError({
      message: 'Wrapper error',
      cause: originalError,
      step: 'SignWithClientStep',
      command: 'MintToken',
    });

    expect(error.cause).toBe(originalError);
  });

  it('should have correct prototype chain for instanceof checks', () => {
    const error = new PipelineError({
      message: 'Test',
      step: 'TestStep',
      command: 'TestCommand',
    });

    expect(error instanceof PipelineError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
});

