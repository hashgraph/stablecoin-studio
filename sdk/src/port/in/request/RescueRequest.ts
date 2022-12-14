import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class RescueRequest extends ValidatedRequest<RescueRequest> {
	tokenId: string;
	amount: string;

	constructor({ tokenId, amount }: { tokenId: string; amount: string }) {
		super({
			tokenId: Validation.checkHederaIdFormat(),
			amount: Validation.checkAmount(),
		});
		this.tokenId = tokenId;
		this.amount = amount;
	}
}
