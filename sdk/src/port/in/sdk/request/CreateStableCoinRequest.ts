import { OptionalField } from '../../../../core/decorators/OptionalDecorator.js';
import { StableCoin, TokenSupplyType } from '../sdk.js';
import {
	AccountBaseRequest,
	RequestAccount,
	RequestPublicKey,
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

	@OptionalField()
	initialSupply?: bigint;

	@OptionalField()
	maxSupply?: bigint;

	@OptionalField()
	freezeDefault?: boolean;

	@OptionalField()
	autoRenewAccount?: string;

	@OptionalField()
	adminKey?: RequestPublicKey;

	@OptionalField()
	freezeKey?: RequestPublicKey;

	@OptionalField()
	KYCKey?: RequestPublicKey;

	@OptionalField()
	wipeKey?: RequestPublicKey;

	@OptionalField()
	pauseKey?: RequestPublicKey;

	@OptionalField()
	supplyKey?: RequestPublicKey;

	@OptionalField()
	treasury?: string;

	@OptionalField()
	supplyType?: TokenSupplyType;

	constructor({
		account,
		name,
		symbol,
		decimals,
		initialSupply,
		maxSupply,
		freezeDefault,
		autoRenewAccount,
		adminKey,
		freezeKey,
		KYCKey,
		wipeKey,
		pauseKey,
		supplyKey,
		treasury,
		supplyType,
	}: {
		account: RequestAccount;
		name: string;
		symbol: string;
		decimals: number;
		initialSupply?: bigint;
		maxSupply?: bigint;
		freezeDefault?: boolean;
		autoRenewAccount?: string;
		adminKey?: RequestPublicKey;
		freezeKey?: RequestPublicKey;
		KYCKey?: RequestPublicKey;
		wipeKey?: RequestPublicKey;
		pauseKey?: RequestPublicKey;
		supplyKey?: RequestPublicKey;
		treasury?: string;
		supplyType?: TokenSupplyType;
	}) {
		super({
			account: Validation.checkAccountId(),
			name: (val) => {
				return StableCoin.checkName(val as string);
			},
			symbol: (val) => {
				return StableCoin.checkSymbol(val as string);
			},
			decimals: (val) => {
				return StableCoin.checkDecimals(val as number);
			},
			initialSupply: (val) => {
				if (this.initialSupply === undefined) {
					return;
				}
				return StableCoin.checkInitialSupply(
					val as bigint,
					this.maxSupply,
					this.supplyType,
				);
			},
			maxSupply: (val) => {
				if (this.maxSupply === undefined) {
					return;
				}
				return StableCoin.checkMaxSupply(
					val as bigint,
					this.initialSupply,
					this.supplyType,
				);
			},
			autoRenewAccount: Validation.checkAccountId(),
			adminKey: Validation.checkPublicKey(),
			freezeKey: Validation.checkPublicKey(),
			KYCKey: Validation.checkPublicKey(),
			wipeKey: Validation.checkPublicKey(),
			pauseKey: Validation.checkPublicKey(),
			supplyKey: Validation.checkPublicKey(),
			treasury: Validation.checkContractId(),
		});
		this.account = account;
		this.name = name;
		this.symbol = symbol;
		this.decimals = decimals;
		this.initialSupply = initialSupply;
		this.maxSupply = maxSupply;
		this.freezeDefault = freezeDefault;
		this.autoRenewAccount = autoRenewAccount;
		this.adminKey = adminKey;
		this.freezeKey = freezeKey;
		this.KYCKey = KYCKey;
		this.wipeKey = wipeKey;
		this.pauseKey = pauseKey;
		this.supplyKey = supplyKey;
		this.treasury = treasury;
		this.supplyType = supplyType;
	}
}
