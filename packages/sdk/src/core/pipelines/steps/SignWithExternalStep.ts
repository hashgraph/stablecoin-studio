import { PipelineContext, SerializedTx } from '../../types/PipelineContext.js';
import { PipelineStep } from '../PipelineStep.js';

export interface ExternalSigningClient {
  sign(bytes: Uint8Array): Promise<Uint8Array>;
}

export class SignWithExternalStep implements PipelineStep {
  readonly name = 'SignWithExternal';

  constructor(private readonly externalClient: ExternalSigningClient) {}

  async execute(ctx: PipelineContext): Promise<PipelineContext> {
    const serialized = ctx.signedTransaction as SerializedTx;
    const signedBytes = await this.externalClient.sign(serialized.transactionBytes);
    const signedTransaction: SerializedTx = {
      kind: 'serialized',
      transactionBytes: signedBytes,
      bodyBytes: serialized.bodyBytes,
    };
    return { ...ctx, signedTransaction };
  }
}
