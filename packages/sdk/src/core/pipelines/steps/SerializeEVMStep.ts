import { ethers } from 'ethers';
import { PipelineContext } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export class SerializeEVMStep implements PipelineStep {
  readonly name = 'SerializeEVM';

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const tx = ctx.transaction as ethers.ContractTransaction;
    const serialized = ethers.Transaction.from(tx).unsignedSerialized;
    const transactionBytes = ethers.getBytes(serialized);
    const signedTransaction = {
      kind: 'serialized' as const,
      transactionBytes,
    };
    return { ...ctx, signedTransaction };
  }
}
