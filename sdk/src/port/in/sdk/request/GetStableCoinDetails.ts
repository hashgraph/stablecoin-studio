import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class GetStableCoinDetails extends ValidatedRequest<GetStableCoinDetails> {
	id: string;

	constructor({ id }: { id: string }) {
		super({
			id: Validation.checkHederaIdFormat(),
			// id: Validation.checkContractId(),
		});

		this.id = id;
	}
}
