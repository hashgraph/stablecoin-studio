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
