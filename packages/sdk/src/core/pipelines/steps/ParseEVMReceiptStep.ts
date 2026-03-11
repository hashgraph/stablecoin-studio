import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class ParseEVMReceiptStep implements PipelineStep {
  readonly name = 'ParseEVMReceipt';

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const receipt = await ctx.response.wait();
    return { ...ctx, receipt };
  }
}
