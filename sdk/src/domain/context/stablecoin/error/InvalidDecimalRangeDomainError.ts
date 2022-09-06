import DomainError from '../../../error/DomainError.js';

export default class InvalidDecimalRangeDomainError extends DomainError {
    constructor(val: number) {
        super(`Invalid Decimal Value ${val}`);
    }
}