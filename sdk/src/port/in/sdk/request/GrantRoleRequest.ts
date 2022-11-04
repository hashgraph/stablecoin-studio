import {
	AccountBaseRequest,
	RequestAccount
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import { OptionalField } from '../../../../core/decorators/OptionalDecorator.js';
import Validation from './validation/Validation.js';

export default class GrantRoleRequest
	extends ValidatedRequest<GrantRoleRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	targetId: string;
	proxyContractId: string;
	tokenId: string;
	role: string;

	@OptionalField()
	amount?: bigint;

	constructor({
		account,
		targetId,
		proxyContractId,
		tokenId,
		role,
		amount
	}: {
		account: RequestAccount;
		targetId?: string;
		proxyContractId?: string;
		tokenId?: string;
		role?: string;
		amount?: bigint;
	}) {
		super({
			account: Validation.checkAccountId(),
			targetId: Validation.checkHederaFormat(),
			proxyContractId: Validation.checkContractId(),
			tokenId: Validation.checkHederaFormat(),
			role: Validation.checkRole(),
			amount: (val) => {
				if (this.amount === undefined) {
					return;
				}
				Validation.checkNumber()
			},			
		});
		this.account = account;
		this.proxyContractId = proxyContractId!;
		this.tokenId = tokenId!;
		this.targetId = targetId!;
		this.role = role!;
		this.amount = amount;
	}
}
