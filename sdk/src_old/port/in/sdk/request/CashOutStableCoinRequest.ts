import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import {
	AccountBaseRequest,
	ContractBaseRequest,
	RequestAccount,
	RequestPublicKey,
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CashOutStableCoinRequest
	extends ValidatedRequest<CashOutStableCoinRequest>
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
		tokenId,
		publicKey,
	}: {
		account: RequestAccount;
		amount: string;
		proxyContractId: string;
		tokenId: string;
		publicKey?: RequestPublicKey;
	}) {
		super({
			account: Validation.checkAccount(),
			amount: Validation.checkAmount(),
			proxyContractId: Validation.checkContractId(),
			tokenId: Validation.checkHederaIdFormat(),
			publicKey: Validation.checkPublicKey(),
		});

		this.account = account;
		this.amount = amount;
		this.proxyContractId = proxyContractId;
		this.tokenId = tokenId;
		this.publicKey = publicKey;
	}
}
