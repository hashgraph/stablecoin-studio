import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class AnalyzeStep implements PipelineStep {
  readonly name = 'Analyze';

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const result = ctx.handler.analyze(ctx.receipt, ctx.params);
    return { ...ctx, result };
  }
}
