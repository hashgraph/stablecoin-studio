import { RequestAccount } from '../sdk.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class AllowanceRequest extends ValidatedRequest<AllowanceRequest> {
	account: RequestAccount;
	amount: string;
	proxyContractId: string;
	targetId: string;
	tokenId: string;

	constructor({
		account,
		amount,
		proxyContractId,
		targetId,
		tokenId,
	}: {
		account: RequestAccount;
		amount: string;
		proxyContractId: string;
		targetId: string;
		tokenId: string;
	}) {
		super({
			account: Validation.checkAccount(),
			amount: Validation.checkAmount(),
			proxyContractId: Validation.checkContractId(),
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
		});
		this.account = account;
		this.amount = amount;
		this.proxyContractId = proxyContractId;
		this.targetId = targetId;
		this.tokenId = tokenId;
	}
}
