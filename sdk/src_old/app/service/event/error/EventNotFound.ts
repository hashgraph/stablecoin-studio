import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export class EventNotFound extends BaseError {
    constructor(name: string) {
        super(ErrorCode.RuntimeError, `Event ${name} is not registered yet`);
    }
}