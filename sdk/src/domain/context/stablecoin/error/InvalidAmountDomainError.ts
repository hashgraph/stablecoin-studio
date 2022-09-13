import DomainError from '../../../error/DomainError.js';

export default class InvalidDecimalRangeDomainError extends DomainError {
    constructor(val: number, expected: number) {
        super(`Invalid Amount ${val}, expected ${expected} decimals`);
    }
}