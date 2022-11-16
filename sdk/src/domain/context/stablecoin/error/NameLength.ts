import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export default class NameLength extends BaseError {
    constructor(val: string, len: number) {
        super(ErrorCode.InvalidLength, `Name ${val} length is longer than ${len}`);
    }
}