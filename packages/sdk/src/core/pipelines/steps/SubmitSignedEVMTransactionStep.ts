import { ethers } from 'ethers';
import { PipelineContext, SerializedTx } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class SubmitSignedEVMTransactionStep implements PipelineStep {
  readonly name = 'SubmitSignedEVMTransaction';

  constructor(private readonly provider: ethers.Provider) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const serialized = ctx.signedTransaction as SerializedTx;
    const rawTransaction = ethers.hexlify(serialized.transactionBytes);
    const response = await this.provider.broadcastTransaction(rawTransaction);
    return { ...ctx, response };
  }
}
