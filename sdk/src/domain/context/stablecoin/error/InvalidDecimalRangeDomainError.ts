import DomainError from '../../../../core/error/BaseError.js';

export default class InvalidDecimalRangeDomainError extends DomainError {
    constructor(val: number) {
        super(`Invalid Decimal Value ${val}`);
    }
}