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

import { PipelineContext } from '../types/PipelineContext.js';
import { PipelineStep } from './PipelineStep.js';
import { PipelineError } from '../errors/PipelineError.js';

export interface PipelineErrorHandler {
  handle(
    error: unknown,
    step: PipelineStep,
    context: PipelineContext
  ): Promise<PipelineContext>;
}

export class DefaultPipelineErrorHandler implements PipelineErrorHandler {
  constructor(
    private maxRetries: number = 2,
    private retryableStepNames: Set<string> = new Set([
      'SubmitToHedera', 'SubmitToRPC'
    ])
  ) {}

  async handle(
    error: unknown,
    step: PipelineStep,
    context: PipelineContext
  ): Promise<PipelineContext> {
    const wrappedError = new PipelineError({
      message: `Failed at step '${step.name}' during '${context.command}'`,
      cause: error,
      step: step.name,
      command: context.command,
      context: { hasTransaction: !!context.transaction },
    });

    if (this.isRetryable(error, step)) {
      return this.retryStep(step, context);
    }

    throw wrappedError;
  }

  private isRetryable(error: unknown, step: PipelineStep): boolean {
    if (!this.retryableStepNames.has(step.name)) return false;
    return error instanceof Error && (
      error.message.includes('UNAVAILABLE') ||
      error.message.includes('BUSY') ||
      error.message.includes('timeout')
    );
  }

  private async retryStep(
    step: PipelineStep,
    context: PipelineContext,
    attempt = 1
  ): Promise<PipelineContext> {
    if (attempt > this.maxRetries) {
      throw new PipelineError({
        message: `Max retries (${this.maxRetries}) exceeded at step '${step.name}'`,
        step: step.name,
        command: context.command,
      });
    }

    await new Promise(r => setTimeout(r, 500 * attempt));

    try {
      return await step.execute(context);
    } catch (retryError) {
      return this.retryStep(step, context, attempt + 1);
    }
  }
}
