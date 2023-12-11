import { SignatureStrategyFactory } from "../../factories/SignatureStrategyFactory";
import { SignatureRequest } from "../../models/signature/SignatureRequest";
import { IStrategyConfig } from "../../strategies/IStrategyConfig";

export class SignatureService {
  constructor(private config: IStrategyConfig) {}

  signTransaction(signatureRequest: SignatureRequest): Promise<Uint8Array> {
    const strategy = SignatureStrategyFactory.createStrategy(this.config);
    return strategy.sign(signatureRequest);
  }
}
