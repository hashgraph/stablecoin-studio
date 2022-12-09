import {
	AccountBaseRequest,
	ContractBaseRequest,
	RequestAccount,
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class AssociateTokenRequest
	extends ValidatedRequest<AssociateTokenRequest>
	implements AccountBaseRequest, ContractBaseRequest
{
	account: RequestAccount;
	proxyContractId: string;

	constructor({
		account,
		proxyContractId,
	}: {
		account: RequestAccount;
		proxyContractId: string;
	}) {
		super({
			account: Validation.checkAccount(),
			proxyContractId: Validation.checkHederaIdFormat(),
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
	}
}
