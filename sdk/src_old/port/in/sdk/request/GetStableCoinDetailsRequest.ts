import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetStableCoinDetailsRequest extends ValidatedRequest<GetStableCoinDetailsRequest> {
	id: string;

	constructor({ id }: { id: string }) {
		super({
			id: Validation.checkHederaIdFormat(),
			// id: Validation.checkHederaIdFormat(),
		});

		this.id = id;
	}
}
