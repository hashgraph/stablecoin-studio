import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import BaseError from '../../../core/error/BaseError.js';
import { InvalidSupplierType } from '../../../domain/context/stablecoin/error/InvalidSupplierType.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export default class CheckSupplierLimitRequest
	extends ValidatedRequest<CheckSupplierLimitRequest>
{
	targetId: string;
	tokenId: string;
    @OptionalField()
	supplierType?: string;

	constructor({
		targetId,
		tokenId,
		supplierType,
	}: {
		targetId: string;
		tokenId: string;
		supplierType?: string;
	}) {
		super({
			targetId: Validation.checkHederaIdFormat(),
			tokenId: Validation.checkHederaIdFormat(),
			supplierType: CheckSupplierLimitRequest.checkSupplierType()
		});
		this.targetId = targetId;
		this.tokenId = tokenId;
		this.supplierType = supplierType;
	}

	private static checkSupplierType = () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return (val: any): BaseError[] => {
			const err: BaseError[] = [];
			const supplierTypes: string[] = ['limited', 'unlimited'];
			if (!supplierTypes.includes(val)) {
				err.push(new InvalidSupplierType(val));
			}
			return err;
		};
	};
}
