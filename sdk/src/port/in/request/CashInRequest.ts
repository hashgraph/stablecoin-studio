
import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import {
	BaseRequest,
	RequestPublicKey,
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CashInRequest
	extends ValidatedRequest<CashInRequest>
	implements BaseRequest
{
	amount: string;
	targetId: string;
	tokenId: string;

	@OptionalField()
	publicKey?: RequestPublicKey;

	constructor({
		amount,
		targetId,
		tokenId,
		publicKey,
	}: {
		amount: string;
		targetId: string;
		tokenId: string;
		publicKey?: RequestPublicKey;
	}) {
		super({
			amount: Validation.checkAmount(),
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			publicKey: Validation.checkPublicKey(),
		});
		this.amount = amount;
		this.targetId = targetId;
		this.tokenId = tokenId;
		this.publicKey = publicKey;
	}
}
