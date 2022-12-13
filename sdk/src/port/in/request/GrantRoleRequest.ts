import ValidatedRequest from './validation/ValidatedRequest.js';
import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import Validation from './validation/Validation.js';
import BaseError from '../../../core/error/BaseError.js';
import { InvalidSupplierType } from '../../../domain/context/stablecoin/error/InvalidSupplierType.js';
import { StableCoinRole } from '../../../domain/context/stablecoin/StableCoinRole.js';

export default class GrantRoleRequest
	extends ValidatedRequest<GrantRoleRequest>
{
	targetId: string;
	tokenId: string;
	role: StableCoinRole | undefined;

	@OptionalField()
	supplierType?: string | undefined;

	@OptionalField()
	amount?: string | undefined;

	constructor({
		targetId,
		tokenId,
		role,
		supplierType,
		amount
	}: {
		targetId: string;
		tokenId: string;
		role: StableCoinRole | undefined;
		supplierType?: string;
		amount?: string;
	}) {
		super({
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			role: Validation.checkRole(),	
			supplierType: GrantRoleRequest.checkSupplierType(),
			amount: Validation.checkAmount()
		});
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
