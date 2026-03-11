import { Client } from '@hiero-ledger/sdk';
import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class SignWithClientStep implements PipelineStep {
  readonly name = 'SignWithClient';

  constructor(private readonly client: Client) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const tx = ctx.transaction as any;
    const frozen = tx.freezeWith(this.client);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientAny = this.client as any;
    const privateKey = clientAny._operator?.privateKey ?? clientAny.operatorKey;
    const signed = await frozen.sign(privateKey);
    const signedTransaction = { kind: 'hedera' as const, transaction: signed };
    return { ...ctx, signedTransaction };
  }
}
