import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { BaseRequest, RequestPublicKey } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CashInRequest
	extends ValidatedRequest<CashInRequest>
	implements BaseRequest
{
	amount: string;
	targetId: string;
	tokenId: string;

	constructor({
		amount,
		targetId,
		tokenId,
	}: {
		amount: string;
		targetId: string;
		tokenId: string;
	}) {
		super({
			amount: Validation.checkAmount(),
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.amount = amount;
		this.targetId = targetId;
		this.tokenId = tokenId;
	}
}
