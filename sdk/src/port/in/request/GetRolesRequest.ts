import {
	AccountBaseRequest,
	RequestAccount
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetRolesRequest
	extends ValidatedRequest<GetRolesRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	targetId: string;
	proxyContractId: string;
    tokenId: string

	constructor({
		account,
		targetId,
		proxyContractId,
        tokenId
	}: {
		account: RequestAccount;
		targetId: string;
		proxyContractId: string;
        tokenId: string;
	}) {
		super({
			account: Validation.checkAccount(),
			targetId: Validation.checkHederaIdFormat(),
			proxyContractId: Validation.checkHederaIdFormat(),
            tokenId: Validation.checkHederaIdFormat(),
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.targetId = targetId;
        this.tokenId = tokenId;
	}
}
