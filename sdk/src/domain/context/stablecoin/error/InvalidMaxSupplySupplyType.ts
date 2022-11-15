import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export default class InvalidMaxSupplySupplyType extends BaseError {
	constructor(val: string) {
		super(
			ErrorCode.InvalidAmount,
			`Invalid Max Supply ${val}, expected 0`,
		);
	}
}