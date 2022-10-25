import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export default class SymbolEmpty extends BaseError {
    constructor() {
        super(ErrorCode.SymbolEmpty, `Symbol is empty`);
    }
}