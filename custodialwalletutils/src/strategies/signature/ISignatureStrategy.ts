import { ISignatureRequest } from "../../models/signature/ISignatureRequest";

export interface ISignatureStrategy {
  sign(request: ISignatureRequest): Promise<Uint8Array>;
}