import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export default class NameEmpty extends BaseError {
    constructor() {
        super(ErrorCode.EmptyValue, `Name is empty`);
    }
}