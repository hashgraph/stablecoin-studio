import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class DeleteRequest extends ValidatedRequest<DeleteRequest> {
	tokenId: string;

	constructor({ tokenId }: { tokenId: string }) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.tokenId = tokenId;
	}
}
