import PublicKey from "../account/PublicKey.js";
import { HederaId } from "../shared/HederaId.js";

export default class CustodialWalletSettings {
  constructor(
    public hederaAccountId: HederaId,
    public hederaAccountPublicKey: PublicKey
  ) {}
}