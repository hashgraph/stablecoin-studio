import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export default class MemoLength extends BaseError {
    constructor(val: string, len: number) {
        super(ErrorCode.InvalidLength, `Memo ${val} length is longer than ${len}`);
    }
}