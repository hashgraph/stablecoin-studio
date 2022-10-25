import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export default class InvalidAmountextends extends BaseError {
    constructor(val: number, expected: number) {
        super(ErrorCode.AmountInvalid, `Invalid Amount ${val}, expected ${expected} decimals`);
    }
}