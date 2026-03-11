import { Transaction, Client } from '@hiero-ledger/sdk';
import { PipelineContext, SerializedTx } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class SubmitSignedHederaTransactionStep implements PipelineStep {
  readonly name = 'SubmitSignedHederaTransaction';

  constructor(private readonly client: Client) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const serialized = ctx.signedTransaction as SerializedTx;
    const tx = Transaction.fromBytes(serialized.transactionBytes);
    const response = await tx.execute(this.client);
    return { ...ctx, response };
  }
}
