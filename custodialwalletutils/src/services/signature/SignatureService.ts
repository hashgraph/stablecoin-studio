import { SignatureStrategyFactory } from "../../factories/SignatureStrategyFactory";
import { ISignatureRequest } from "../../models/signature/ISignatureRequest";

export class SignatureService {
  signTransaction(signatureRequest: ISignatureRequest): Promise<Uint8Array> {
    // By using the factory we will get the correct strategy
    const strategy = SignatureStrategyFactory.createStrategy(signatureRequest);
    // We will use the strategy to sign the transaction
    return strategy.sign(signatureRequest);
  }
}