import { ISignatureStrategy } from "../strategies/signature/ISignatureStrategy";
import { FireblocksSignatureRequest } from "../models/signature/FireblocksSignatureRequest";
import { FireblocksStrategy } from "../strategies/signature/FireblocksStrategy";
import { SignatureRequest } from "../models/signature/SignatureRequest";
import { DfnsSignatureRequest } from "../models/signature/DfnsSignatureRequest";
import { DfnsStrategy } from "../strategies/signature/DfnsStrategy";

export class SignatureStrategyFactory {
  static createStrategy(
    signatureRequest: SignatureRequest
  ): ISignatureStrategy {
    if (signatureRequest instanceof FireblocksSignatureRequest) {
      return new FireblocksStrategy();
    } else if (signatureRequest instanceof DfnsSignatureRequest) {
      return new DfnsStrategy();
    } else {
      throw new Error("Unrecognized signature request type");
    }
  }
}