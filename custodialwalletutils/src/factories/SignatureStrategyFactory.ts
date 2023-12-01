import { ISignatureStrategy } from "../strategies/signature/ISignatureStrategy";
import { FireblocksSignatureRequest } from "../models/signature/FireblocksSignatureRequest";
import { FireblocksStrategy } from "../strategies/signature/FireblocksStrategy";
import { ISignatureRequest } from "../models/signature/ISignatureRequest";

export class SignatureStrategyFactory {
  static createStrategy(
    signatureRequest: ISignatureRequest
  ): ISignatureStrategy {
    if (signatureRequest instanceof FireblocksSignatureRequest) {
      return new FireblocksStrategy();
    } else {
      throw new Error("Unrecognized signature request type");
    }
  }
}