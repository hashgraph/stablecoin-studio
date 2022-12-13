import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetSupplierAllowanceRequest
	extends ValidatedRequest<GetSupplierAllowanceRequest>
{
	targetId: string;
    tokenId: string;

	constructor({
		targetId,
        tokenId
	}: {
		targetId: string;
		tokenId: string;
	}) {
		super({
			targetId: Validation.checkHederaIdFormat(),
            tokenId: Validation.checkHederaIdFormat()
		});
		this.targetId = targetId;
        this.tokenId = tokenId;
	}
}
