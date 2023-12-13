import { SignatureRequest } from './SignatureRequest';

export class DFNSSignatureRequest extends SignatureRequest {
  private walletId: string;

  constructor(walletId: string, transactionBytes: Uint8Array) {
    super(transactionBytes);
    this.walletId = walletId;
  }

  public getWalletId(): string {
    return this.walletId;
  }

  public setWalletId(walletId: string): void {
    this.walletId = walletId;
  }
}
