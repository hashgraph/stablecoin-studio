import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class BuildEVMStep implements PipelineStep {
  readonly name = 'BuildEVM';

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const transaction = await ctx.handler.buildEVMTransaction(ctx.params);
    return { ...ctx, transaction };
  }
}
