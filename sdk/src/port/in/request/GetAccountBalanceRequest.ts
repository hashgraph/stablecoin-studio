import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetAccountBalanceRequest extends ValidatedRequest<GetAccountBalanceRequest> {
	targetId: string;
	tokenId: string;

	constructor({ targetId, tokenId }: { targetId: string; tokenId: string }) {
		super({
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.tokenId = tokenId;
		this.targetId = targetId;
	}
}
