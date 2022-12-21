import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { AccountBaseRequest, RequestAccount } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CapabilitiesRequest
	extends ValidatedRequest<CapabilitiesRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	tokenId: string;
	@OptionalField()
	tokenIsPaused?: boolean;
	@OptionalField()
	tokenIsDeleted?: boolean;

	constructor({
		account,
		tokenId,
		tokenIsPaused,
		tokenIsDeleted
	}: {
		account: RequestAccount;
		tokenId: string;
		tokenIsPaused?: boolean;
		tokenIsDeleted?: boolean;
	}) {
		super({
			account: Validation.checkAccount(),
			tokenId: Validation.checkHederaIdFormat()
		});
		this.account = account;
		this.tokenId = tokenId;
		this.tokenIsPaused = tokenIsPaused;
		this.tokenIsDeleted = tokenIsDeleted;
	}
}
