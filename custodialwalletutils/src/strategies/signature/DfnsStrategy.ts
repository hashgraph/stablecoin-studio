import { ISignatureStrategy } from "./ISignatureStrategy";
import { DfnsSignatureRequest } from "../../models/signature/DfnsSignatureRequest";

export class DfnsStrategy implements ISignatureStrategy {
  async sign(request: DfnsSignatureRequest): Promise<Uint8Array> {
    return null;
  }
}