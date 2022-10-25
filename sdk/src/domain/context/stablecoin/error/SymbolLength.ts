import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export default class SymbolLength extends BaseError {
    constructor(val: string, len: number) {
        super(ErrorCode.SymbolLength, `Symbol ${val} length is longer than ${len}`);
    }
}