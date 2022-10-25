import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export default class NameEmpty extends BaseError {
    constructor() {
        super(ErrorCode.NameEmpty, `Name is empty`);
    }
}