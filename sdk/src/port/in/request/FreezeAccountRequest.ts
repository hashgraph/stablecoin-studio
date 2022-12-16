import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class FreezeAccountStableCoinRequest extends ValidatedRequest<FreezeAccountStableCoinRequest> {
	tokenId: string;
	targetId: string;

	constructor({ tokenId, targetId }: { tokenId: string; targetId: string }) {
		super({
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.tokenId = tokenId;
		this.targetId = targetId;
	}
}
