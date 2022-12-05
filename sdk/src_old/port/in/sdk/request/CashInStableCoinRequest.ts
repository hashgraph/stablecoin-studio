import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import {
	AccountBaseRequest,
	ContractBaseRequest,
	RequestAccount,
	RequestPublicKey,
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CashInStableCoinRequest
	extends ValidatedRequest<CashInStableCoinRequest>
	implements AccountBaseRequest, ContractBaseRequest
{
	account: RequestAccount;
	amount: string;
	proxyContractId: string;
	targetId: string;
	tokenId: string;

	@OptionalField()
	publicKey?: RequestPublicKey;

	constructor({
		account,
		amount,
		proxyContractId,
		targetId,
		tokenId,
		publicKey,
	}: {
		account: RequestAccount;
		amount: string;
		proxyContractId: string;
		targetId: string;
		tokenId: string;
		publicKey?: RequestPublicKey;
	}) {
		super({
			account: Validation.checkAccount(),
			amount: Validation.checkAmount(),
			proxyContractId: Validation.checkHederaIdFormat(),
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			publicKey: Validation.checkPublicKey(),
		});

		this.account = account;
		this.amount = amount;
		this.proxyContractId = proxyContractId;
		this.targetId = targetId;
		this.tokenId = tokenId;
		this.publicKey = publicKey;
	}
}
