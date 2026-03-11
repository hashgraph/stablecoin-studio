import { Client } from '@hiero-ledger/sdk';
import { PipelineContext, HederaSignedTx } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class SubmitToHederaStep implements PipelineStep {
  readonly name = 'SubmitToHedera';

  constructor(private readonly client: Client) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const signed = ctx.signedTransaction as HederaSignedTx;
    const response = await signed.transaction.execute(this.client);
    return { ...ctx, response };
  }
}
