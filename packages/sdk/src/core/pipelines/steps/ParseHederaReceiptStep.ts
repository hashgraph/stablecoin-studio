import { Client } from '@hiero-ledger/sdk';
import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class ParseHederaReceiptStep implements PipelineStep {
  readonly name = 'ParseHederaReceipt';

  constructor(private readonly client: Client) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const receipt = await ctx.response.getReceipt(this.client);
    return { ...ctx, receipt };
  }
}
