import { QueryResponse } from "../../../../core/query/QueryResponse.js";
import PublicKey from "../../../../domain/context/account/PublicKey.js";
import ContractId from "../../../../domain/context/contract/ContractId.js";
import BigDecimal from "../../../../domain/context/shared/BigDecimal.js";
import { HederaId } from "../../../../domain/context/shared/HederaId.js";

export default interface StableCoinViewModel extends QueryResponse {
	tokenId?: HederaId;
	name?: string;
	symbol?: string;
	decimals?: number;
	totalSupply?: BigDecimal;
	maxSupply?: BigDecimal;
	initialSupply?: BigDecimal;
	treasury?: HederaId;
	proxyAddress?: ContractId;
	evmProxyAddress?: string;
	expirationTime?: string;
	freezeDefault?: boolean;
	autoRenewAccount?: HederaId;
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
