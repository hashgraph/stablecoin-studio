import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import {
	AccountBaseRequest,
	RequestAccount,
	RequestPublicKey,
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class FreezeAccountStableCoinRequest
	extends ValidatedRequest<FreezeAccountStableCoinRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	proxyContractId: string;
	tokenId: string;
	targetId: string;

	@OptionalField()
	publicKey?: RequestPublicKey;

	constructor({
		account,
		proxyContractId,
		tokenId,
		targetId,
		publicKey,
	}: {
		account: RequestAccount;
		proxyContractId: string;
		tokenId: string;
		targetId: string;
		publicKey?: RequestPublicKey;
	}) {
		super({
			account: Validation.checkAccount(),
			proxyContractId: Validation.checkHederaIdFormat(),
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			publicKey: Validation.checkPublicKey(),
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.tokenId = tokenId;
		this.targetId = targetId;
		this.publicKey = publicKey;
	}
}
