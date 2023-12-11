import { SignatureRequest } from "./SignatureRequest";

export class FireblocksSignatureRequest extends SignatureRequest {
  private accountId: string;
  private vaultAccountId: string;

  constructor(
    accountId: string,
    vaultAccountId: string,
    transactionBytes: Uint8Array
  ) {
    super(transactionBytes);
    this.accountId = accountId;
    this.vaultAccountId = vaultAccountId;
  }

  public getAccountId(): string {
    return this.accountId;
  }

  public getVaultAccountId(): string {
    return this.vaultAccountId;
  }

  public setAccountId(accountId: string): void {
    this.accountId = accountId;
  }

  public setVaultAccountId(vaultAccountId: string): void {
    this.vaultAccountId = vaultAccountId;
  }
}
