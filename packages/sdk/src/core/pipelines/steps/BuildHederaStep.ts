import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class BuildHederaStep implements PipelineStep {
  readonly name = 'BuildHedera';

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const transaction = ctx.handler.buildHederaTransaction(ctx.params);
    return { ...ctx, transaction };
  }
}
