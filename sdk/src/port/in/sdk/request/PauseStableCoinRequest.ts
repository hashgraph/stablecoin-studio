import { AccountBaseRequest, RequestAccount } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class PauseStableCoinRequest
	extends ValidatedRequest<PauseStableCoinRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	proxyContractId: string;
	tokenId: string;

	constructor({
		account,
		proxyContractId,
		tokenId,
	}: {
		account: RequestAccount;
		proxyContractId: string;
		tokenId: string;
	}) {
		super({
			account: Validation.checkAccount(),
			proxyContractId: Validation.checkContractId(),
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.tokenId = tokenId;
	}
}
