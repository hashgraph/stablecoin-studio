import { QueryResponse } from "../../../../core/query/QueryResponse.js";
import PublicKey from "../../../../domain/context/account/PublicKey.js";
import ContractId from "../../../../domain/context/contract/ContractId.js";
import BigDecimal from "../../../../domain/context/shared/BigDecimal.js";

export default interface StableCoinViewModel extends QueryResponse {
	tokenId?: string;
	name?: string;
	symbol?: string;
	decimals?: number;
	totalSupply?: BigDecimal;
	maxSupply?: BigDecimal;
	initialSupply?: BigDecimal;
	treasury?: string;
	proxyAddress: string;
	evmProxyAddress?: string;
	expirationTime?: string;
	freezeDefault?: boolean;
	autoRenewAccount?: string;
	autoRenewAccountPeriod?: number;
	paused?: boolean;
	deleted?: boolean;
	adminKey?: ContractId | PublicKey | undefined;
	kycKey?: ContractId | PublicKey | undefined;
	freezeKey?: ContractId | PublicKey | undefined;
	wipeKey?: ContractId | PublicKey | undefined;
	supplyKey?: ContractId | PublicKey | undefined;
	pauseKey?: ContractId | PublicKey | undefined;
}
