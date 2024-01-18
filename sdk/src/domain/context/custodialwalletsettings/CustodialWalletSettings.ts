import PublicKey from "../account/PublicKey.js";
import { HederaId } from "../shared/HederaId.js";

export default class CustodialWalletSettings {
  hederaAccountId: HederaId;
	hederaAccountPublicKey: PublicKey;

  constructor(hederaAccountId: HederaId, hederaAccountPublicKey: PublicKey) {
    this.hederaAccountId = hederaAccountId;
    this.hederaAccountPublicKey = hederaAccountPublicKey;
  }
}