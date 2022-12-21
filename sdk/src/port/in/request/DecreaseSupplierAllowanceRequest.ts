import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class DecreaseSupplierAllowanceRequest
	extends ValidatedRequest<DecreaseSupplierAllowanceRequest>
{
	targetId: string;
	tokenId: string;
	amount: string;

	constructor({
		targetId,
		tokenId,
		amount
	}: {
		targetId: string;
		tokenId: string;
		amount: string;
	}) {
		super({
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			amount: Validation.checkAmount()
		});
		this.tokenId = tokenId;
		this.targetId = targetId;
		this.amount = amount;
	}
}
