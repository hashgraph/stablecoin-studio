import { IStrategyConfig } from "../strategies/IStrategyConfig";
import { SignatureStrategyFactory } from "../factories/SignatureStrategyFactory";
import { SignatureRequest } from "../models/signature/SignatureRequest";

export class CustodialWalletService {
  constructor(private config: IStrategyConfig) {}

  signTransaction(signatureRequest: SignatureRequest): Promise<Uint8Array> {
    const strategy = SignatureStrategyFactory.createStrategy(this.config);
    return strategy.sign(signatureRequest);
  }
}
