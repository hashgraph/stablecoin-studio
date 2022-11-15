import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";


export class InvalidSupplierType extends BaseError {
	constructor(role: string) {
		super(
			ErrorCode.InvalidSupplierType,
			`Supplier type ${role} does not exist`,
		);
	}
}