import DomainError from "../../../error/DomainError.js";

export class AccountIdNotValid extends DomainError {
    constructor(val: string) {
        super(`AccountId ${val} is not a valid ID`);        
    }
}