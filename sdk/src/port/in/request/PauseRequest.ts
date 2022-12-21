import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class PauseRequest extends ValidatedRequest<PauseRequest> {
	tokenId: string;

	constructor({ tokenId }: { tokenId: string }) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.tokenId = tokenId;
	}
}
