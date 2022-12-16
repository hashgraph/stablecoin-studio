import { AccountBaseRequest, RequestAccount } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CapabilitiesRequest
	extends ValidatedRequest<CapabilitiesRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	tokenId: string;

	constructor({
		account,
		tokenId,
	}: {
		account: RequestAccount;
		tokenId: string;
	}) {
		super({
			account: Validation.checkAccount(),
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.account = account;
		this.tokenId = tokenId;
	}
}
