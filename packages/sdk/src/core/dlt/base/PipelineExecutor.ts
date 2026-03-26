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

import { ExecutionContext, OperationOutcome } from '../../types/ExecutionContext.js';
import { ExecutionStep } from './ExecutionStep.js';
import {
  ExecutionErrorHandler,
  DefaultExecutionErrorHandler,
} from './ExecutionErrorHandler.js';
import { logger } from '../../Logger.js';

export class PipelineExecutor {
  constructor(
    private steps: ExecutionStep[],
    private errorHandler: ExecutionErrorHandler = new DefaultExecutionErrorHandler()
  ) {}

  async execute<TResult extends OperationOutcome = OperationOutcome>(
    context: ExecutionContext
  ): Promise<TResult> {
    let ctx = context;
    for (const step of this.steps) {
      logger.step(`  → ${step.name}`);
      try {
        ctx = await step.execute(ctx);
      } catch (error) {
        logger.error(`  ✗ ${step.name}: ${error instanceof Error ? error.message : String(error)}`);
        ctx = await this.errorHandler.handle(error, step, ctx);
      }
    }
    if (!ctx.result) {
      throw new Error(`Execution completed but no result was produced for '${ctx.operationName}'`);
    }
    return ctx.result as TResult;
  }

  getSteps(): readonly ExecutionStep[] {
    return this.steps;
  }
}
