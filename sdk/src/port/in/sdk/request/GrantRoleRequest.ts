import {
	AccountBaseRequest,
	RequestAccount
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import { OptionalField } from '../../../../core/decorators/OptionalDecorator.js';
import Validation from './validation/Validation.js';
import BaseError from '../../../../core/error/BaseError.js';
import { InvalidSupplierType } from '../../../../domain/context/stablecoin/error/InvalidSupplierType.js';
import { StableCoinRole } from '../sdk.js';

export default class GrantRoleRequest
	extends ValidatedRequest<GrantRoleRequest>
	implements AccountBaseRequest
{
	account: RequestAccount;
	targetId: string;
	proxyContractId: string;
	tokenId: string;
	role: StableCoinRole | undefined;

	@OptionalField()
	supplierType?: string | undefined;

	@OptionalField()
	amount?: string | undefined;

	constructor({
		account,
		targetId,
		proxyContractId,
		tokenId,
		role,
		supplierType,
		amount
	}: {
		account: RequestAccount;
		targetId: string;
		proxyContractId: string;
		tokenId: string;
		role: StableCoinRole | undefined;
		supplierType?: string;
		amount?: string;
	}) {
		super({
			account: Validation.checkAccount(),
			targetId: Validation.checkHederaIdFormat(),
			proxyContractId: Validation.checkContractId(),
			tokenId: Validation.checkHederaIdFormat(),
			role: Validation.checkRole(),	
			supplierType: GrantRoleRequest.checkSupplierType(),
			amount: Validation.checkAmount()
		});
		this.account = account;
		this.proxyContractId = proxyContractId;
		this.tokenId = tokenId;
		this.targetId = targetId;
		this.role = role;
		this.supplierType = supplierType;
		this.amount = amount;
	}

	private static checkSupplierType = () => {
		return (val: any): BaseError[] => {
			const err: BaseError[] = [];
			const supplierTypes: string[] = ['limited', 'unlimited'];
			if (!supplierTypes.includes(val.toLowerCase())) {
				err.push(new InvalidSupplierType(val));
			}
			return err;
		};
	};
}
