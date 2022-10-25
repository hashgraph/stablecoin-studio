import { IKey } from '../../../out/hedera/account/types/IKey.js';
import { Account, PrivateKey, StableCoin } from '../sdk.js';
import { AccountBaseRequest, IAccount } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';

export default class CreateStableCoinRequest
	extends ValidatedRequest<CreateStableCoinRequest>
	implements AccountBaseRequest
{
	account: IAccount;
	name: string;
	symbol: string;
	decimals: number;
	initialSupply?: bigint;
	maxSupply?: bigint;
	memo?: string;
	freezeDefault?: boolean;
	autoRenewAccount?: string;
	adminKey?: IKey;
	freezeKey?: IKey;
	KYCKey?: IKey;
	wipeKey?: IKey;
	pauseKey?: IKey;
	supplyKey?: IKey;
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
		account: IAccount;
		name: string;
		symbol: string;
		decimals: number;
		initialSupply?: bigint;
		maxSupply?: bigint;
		memo?: string;
		freezeDefault?: boolean;
		autoRenewAccount?: string;
		adminKey?: IKey;
		freezeKey?: IKey;
		KYCKey?: IKey;
		wipeKey?: IKey;
		pauseKey?: IKey;
		supplyKey?: IKey;
		treasury?: string;
	}) {
		super({
			account: (val) => {
				const { accountId, privateKey, evmAddress } = val as IAccount;
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
