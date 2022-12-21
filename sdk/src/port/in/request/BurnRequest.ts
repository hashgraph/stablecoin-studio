import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class BurnRequest extends ValidatedRequest<BurnRequest> {
	amount: string;
	tokenId: string;

	constructor({ amount, tokenId }: { amount: string; tokenId: string }) {
		super({
			amount: Validation.checkAmount(),
			tokenId: Validation.checkHederaIdFormat(),
		});

		this.amount = amount;
		this.tokenId = tokenId;
	}
}
