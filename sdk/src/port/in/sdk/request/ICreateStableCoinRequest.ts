import AccountId from "../../../../domain/context/account/AccountId.js";
import PrivateKey from "../../../../domain/context/account/PrivateKey.js";

export interface ICreateStableCoinRequest {
	accountId: AccountId;
	privateKey: PrivateKey;
	name: string;
	symbol: string;
	decimals: number;
	initialSupply?: bigint;
	maxSupply?: bigint;
	memo?: string;
	freeze?: string;
	freezeDefault?: boolean;
}
