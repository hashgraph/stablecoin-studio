import {
	AccountBaseRequest,
	RequestAccount
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class ResetCashInLimitRequest
	extends ValidatedRequest<ResetCashInLimitRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	targetId: string;
	proxyContractId: string;

	constructor({
		account,
		targetId,
		proxyContractId,
	}: {
		account: RequestAccount;
		targetId: string;
		proxyContractId: string;
	}) {
		super({
			account: Validation.checkAccount(),
			targetId: Validation.checkHederaIdFormat(),
			proxyContractId: Validation.checkHederaIdFormat(),
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.targetId = targetId;
	}
}
