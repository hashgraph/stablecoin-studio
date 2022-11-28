import { AccountBaseRequest, RequestAccount } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetListStableCoinRequest
	extends ValidatedRequest<GetListStableCoinRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;

	constructor({ account }: { account: RequestAccount }) {
		super({
			account: Validation.checkAccount(),
		});

		this.account = account;
	}
}
