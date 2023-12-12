import { IStrategyConfig } from '../strategies/IStrategyConfig';
import { StrategyFactory } from '../factories/StrategyFactory';
import { SignatureRequest } from '../models/signature/SignatureRequest';

export class CustodialWalletService {
  constructor(private config: IStrategyConfig) {}

  signTransaction(signatureRequest: SignatureRequest): Promise<Uint8Array> {
    const strategy = StrategyFactory.createSignatureStrategy(this.config);
    return strategy.sign(signatureRequest);
  }
}
