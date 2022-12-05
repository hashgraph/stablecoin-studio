import PublicKey from "../../../domain/context/account/PublicKey.js";

export default interface AccountInfo {
	account?: string;
	accountEvmAddress?: string;
	publicKey?: PublicKey;
}
