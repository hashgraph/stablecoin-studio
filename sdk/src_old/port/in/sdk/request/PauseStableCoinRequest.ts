import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import {
	AccountBaseRequest,
	RequestAccount,
	RequestPublicKey,
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class PauseStableCoinRequest
	extends ValidatedRequest<PauseStableCoinRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	proxyContractId: string;
	tokenId: string;

	@OptionalField()
	publicKey?: RequestPublicKey;

	constructor({
		account,
		proxyContractId,
		tokenId,
		publicKey,
	}: {
		account: RequestAccount;
		proxyContractId: string;
		tokenId: string;
		publicKey?: RequestPublicKey;
	}) {
		super({
			account: Validation.checkAccount(),
			proxyContractId: Validation.checkContractId(),
			tokenId: Validation.checkHederaIdFormat(),
			publicKey: Validation.checkPublicKey(),
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.tokenId = tokenId;
		this.publicKey = publicKey;
	}
}
