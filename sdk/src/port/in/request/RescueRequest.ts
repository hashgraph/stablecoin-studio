import {
	AccountBaseRequest,
	RequestAccount
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class RescueRequest
	extends ValidatedRequest<RescueRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	proxyContractId: string;
	tokenId: string;
	amount: string | undefined;

	constructor({
		account,
		proxyContractId,
		tokenId,
		amount
	}: {
		account: RequestAccount;
		proxyContractId: string;
		tokenId: string;
		amount: string;
	}) {
		super({
			account: Validation.checkAccount(),
			proxyContractId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			amount: Validation.checkAmount()
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.tokenId = tokenId;
		this.amount = amount;
	}
}
