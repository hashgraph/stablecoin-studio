import { ISignatureRequest } from "./ISignatureRequest";

export class FireblocksSignatureRequest implements ISignatureRequest {
  publicKey: string;
  transactionBytes: Uint8Array;
  accountId: string;
  vaultAccountId: string;
}
