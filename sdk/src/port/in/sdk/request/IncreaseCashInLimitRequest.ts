import {
	AccountBaseRequest,
	RequestAccount
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class IncreaseCashInLimitRequest
	extends ValidatedRequest<IncreaseCashInLimitRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	targetId: string;
	proxyContractId: string;
	tokenId: string;
	amount: string;

	constructor({
		account,
		targetId,
		proxyContractId,
		tokenId,
		amount
	}: {
		account: RequestAccount;
		targetId: string;
		proxyContractId: string;
		tokenId: string;
		amount: string;
	}) {
		super({
			account: Validation.checkAccount(),
			targetId: Validation.checkHederaIdFormat(),
			proxyContractId: Validation.checkContractId(),
			tokenId: Validation.checkHederaIdFormat(),
			amount: Validation.checkAmount()
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.tokenId = tokenId;
		this.targetId = targetId;
		this.amount = amount;
	}
}
