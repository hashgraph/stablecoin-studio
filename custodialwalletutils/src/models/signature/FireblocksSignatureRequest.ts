import { SignatureRequest } from "./SignatureRequest";

export class FireblocksSignatureRequest extends SignatureRequest {
  private _accountId: string;
  private _vaultAccountId: string;

  constructor(
    accountId: string,
    vaultAccountId: string,
    publicKey: string,
    transactionBytes: Uint8Array
  ) {
    super(publicKey, transactionBytes);
    this.setAccountId(accountId);
    this.setVaultAccountId(vaultAccountId);
  }

  get accountId(): string {
    return this._accountId;
  }

  set accountId(value: string) {
    this.setAccountId(value);
  }

  get vaultAccountId(): string {
    return this._vaultAccountId;
  }

  set vaultAccountId(value: string) {
    this.setVaultAccountId(value);
  }

  private setAccountId(value: string): void {
    if (!value) {
      throw new Error("Can't be empty");
    }
    this._accountId = value;
  }

  private setVaultAccountId(value: string): void {
    if (!value) {
      throw new Error("Can't be empty");
    }
    this._vaultAccountId = value;
  }
}
