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

import { PipelineContext, TransactionResultLike } from '../types/PipelineContext.js';
import { PipelineStep } from './PipelineStep.js';
import {
  PipelineErrorHandler,
  DefaultPipelineErrorHandler,
} from './PipelineErrorHandler.js';

export class BasePipeline {
  constructor(
    private steps: PipelineStep[],
    private errorHandler: PipelineErrorHandler = new DefaultPipelineErrorHandler()
  ) {}

  async execute<TResult extends TransactionResultLike = TransactionResultLike>(
    context: PipelineContext
  ): Promise<TResult> {
    let ctx = context;
    for (const step of this.steps) {
      try {
        ctx = await step.execute(ctx);
      } catch (error) {
        ctx = await this.errorHandler.handle(error, step, ctx);
      }
    }
    if (!ctx.result) {
      throw new Error(`Pipeline completed but no result was produced for '${ctx.command}'`);
    }
    return ctx.result as TResult;
  }

  getSteps(): readonly PipelineStep[] {
    return this.steps;
  }
}
