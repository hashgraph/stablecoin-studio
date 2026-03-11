import { ethers } from 'ethers';
import { PipelineContext, EVMSignedTx } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class SubmitToRPCStep implements PipelineStep {
  readonly name = 'SubmitToRPC';

  constructor(private readonly provider: ethers.Provider) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const signedTx = ctx.signedTransaction as EVMSignedTx;
    const response = await this.provider.broadcastTransaction(signedTx.rawTransaction);
    return { ...ctx, response };
  }
}
