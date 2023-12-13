import { SignatureRequest } from '../../models/signature/SignatureRequest';

export interface ISignatureStrategy {
  sign(request: SignatureRequest): Promise<Uint8Array>;
}
