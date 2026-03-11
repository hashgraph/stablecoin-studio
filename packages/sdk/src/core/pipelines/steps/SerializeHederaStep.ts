import { Client } from '@hiero-ledger/sdk';
import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class SerializeHederaStep implements PipelineStep {
  readonly name = 'SerializeHedera';

  constructor(private readonly client: Client) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const tx = ctx.transaction as any;
    const frozen = tx.freezeWith(this.client);
    const transactionBytes: Uint8Array = frozen.toBytes();
    // Extract the body bytes from the first signed transaction entry (for external signers that need raw body)
    const bodyBytes: Uint8Array | undefined =
      frozen._signedTransactions?.get(0)?.bodyBytes ?? undefined;
    const signedTransaction = {
      kind: 'serialized' as const,
      transactionBytes,
      bodyBytes,
    };
    return { ...ctx, signedTransaction };
  }
}
