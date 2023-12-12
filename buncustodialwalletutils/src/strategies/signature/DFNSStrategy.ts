import { ISignatureStrategy } from './ISignatureStrategy';
import { DFNSSignatureRequest } from '../../models/signature/DFNSSignatureRequest';

export class DFNSStrategy implements ISignatureStrategy {
  async sign(request: DFNSSignatureRequest): Promise<Uint8Array> {
    return Uint8Array.from([]);
  }
}
