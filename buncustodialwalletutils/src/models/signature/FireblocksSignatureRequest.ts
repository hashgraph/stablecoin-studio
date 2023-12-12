import { SignatureRequest } from './SignatureRequest';

export class FireblocksSignatureRequest extends SignatureRequest {
  private vaultAccountId: string;

  constructor(vaultAccountId: string, transactionBytes: Uint8Array) {
    super(transactionBytes);
    this.vaultAccountId = vaultAccountId;
  }

  public getVaultAccountId(): string {
    return this.vaultAccountId;
  }

  public setVaultAccountId(vaultAccountId: string): void {
    this.vaultAccountId = vaultAccountId;
  }
}
