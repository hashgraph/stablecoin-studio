import CheckNums from '../../../../core/checks/numbers/CheckNums.js';
import { Account, PrivateKey, StableCoin, PublicKey } from '../sdk.js';
import {
	AccountBaseRequest,
	RequestAccount,
	RequestKey,
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CreateStableCoinRequest
	extends ValidatedRequest<CreateStableCoinRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	name: string;
	symbol: string;
	decimals: number;
	initialSupply?: bigint;
	maxSupply?: bigint;
	memo?: string;
	freezeDefault?: boolean;
	autoRenewAccount?: string;
	adminKey?: RequestKey;
	freezeKey?: RequestKey;
	KYCKey?: RequestKey;
	wipeKey?: RequestKey;
	pauseKey?: RequestKey;
	supplyKey?: RequestKey;
	treasury?: string;

	constructor({
		account,
		name,
		symbol,
		decimals,
		initialSupply,
		maxSupply,
		memo,
		freezeDefault,
		autoRenewAccount,
		adminKey,
		freezeKey,
		KYCKey,
		wipeKey,
		pauseKey,
		supplyKey,
		treasury,
	}: {
		account: RequestAccount;
		name: string;
		symbol: string;
		decimals: number;
		initialSupply?: bigint;
		maxSupply?: bigint;
		memo?: string;
		freezeDefault?: boolean;
		autoRenewAccount?: string;
		adminKey?: RequestKey;
		freezeKey?: RequestKey;
		KYCKey?: RequestKey;
		wipeKey?: RequestKey;
		pauseKey?: RequestKey;
		supplyKey?: RequestKey;
		treasury?: string;
	}) {
		super({
			account: (val) => {
				const { accountId, privateKey, evmAddress } =
					val as RequestAccount;
				if (privateKey) {
					new Account(
						accountId,
						new PrivateKey(privateKey.key, privateKey.type),
						evmAddress,
					);
				} else {
					new Account(accountId, undefined, evmAddress);
				}
			},
			name: (val) => {
				return StableCoin.checkName(val as string);
			},
			symbol: (val) => {
				return StableCoin.checkSymbol(val as string);
			},
			decimals: (val) => {
				return StableCoin.checkDecimals(val as number);
			},
			treasury: Validation.checkContractId(),
			initialSupply: (val) => {
				CheckNums.isWithinRange(val as bigint, 0n, StableCoin.MAX_SUPPLY)
			},
			maxSupply: Validation.checkContractId(),
			adminKey: Validation.checkKey(),
			freezeKey: Validation.checkKey(),
			KYCKey: Validation.checkKey(),
			wipeKey: Validation.checkKey(),
			pauseKey: Validation.checkKey(),
			supplyKey: Validation.checkKey(),
		});
		this.account = account;
		this.name = name;
		this.symbol = symbol;
		this.decimals = decimals;
		this.initialSupply = initialSupply;
		this.maxSupply = maxSupply;
		this.memo = memo;
		this.freezeDefault = freezeDefault;
		this.autoRenewAccount = autoRenewAccount;
		this.adminKey = adminKey;
		this.freezeKey = freezeKey;
		this.KYCKey = KYCKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.supplyKey = supplyKey;
		this.treasury = treasury;
	}
}
