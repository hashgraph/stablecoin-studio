import {
	AccountBaseRequest,
	RequestAccount
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetAccountBalanceRequest
	extends ValidatedRequest<GetAccountBalanceRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	targetId: string;
	proxyContractId: string;
	tokenId: string;

	constructor({
		account,
		targetId,
		proxyContractId,
		tokenId,
	}: {
		account: RequestAccount;
		targetId: string;
		proxyContractId: string;
		tokenId: string;
	}) {
		super({
			account: Validation.checkAccount(),
			targetId: Validation.checkHederaIdFormat(),
			proxyContractId: Validation.checkContractId(),
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.tokenId = tokenId;
		this.targetId = targetId;
	}
}
