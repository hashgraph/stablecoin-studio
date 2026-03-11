import { ethers } from 'ethers';
import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class SignWithSignerStep implements PipelineStep {
  readonly name = 'SignWithSigner';

  constructor(private readonly signer: ethers.Signer) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const tx = ctx.transaction as ethers.ContractTransaction;
    const rawTransaction = await this.signer.signTransaction(tx);
    const signedTransaction = { kind: 'evm' as const, rawTransaction };
    return { ...ctx, signedTransaction };
  }
}
