import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';
import BigDecimal from '../../../../domain/context/stablecoin/BigDecimal.js';

export class AmountGreaterThanOwnerBalance extends BaseError {
	constructor(val: string | number | BigDecimal) {
		super(
			ErrorCode.InvalidAmount,
			`Amount ${val.toString()} is bigger than the token owner's balance`,
		);
	}
}
