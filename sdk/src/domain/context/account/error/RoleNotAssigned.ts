import BaseError, { ErrorCode } from "../../../../core/error/BaseError.js";

export class RoleNotAssigned extends BaseError {
	constructor(accountId: string, role: string) {
		super(ErrorCode.RoleNotAssigned, `Account ${accountId} does not have the role ${role} assigned`);
	}
}