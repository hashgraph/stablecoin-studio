export enum ErrorCode {
	AccountIdInValid = '10001',
	PrivateKeyInvalid = '10002',
	PrivateKeyTypeInvalid = '10003',
	PublicKeyInvalid = '10004',
	InitSupplyLargerThanMaxSupply = '10005',
	ContractKeyInvalid = '10006',
	DecimalRangeInvalid = '10007',
	AmountInvalid = '10008',
	NameLength = '10009',
	NameEmpty = '10010',
	SymbolLength = '10011',
	SymbolEmpty = '10012',
	MemoLength = '10013',
	InvalidContractId = '10014',
	AccountNotAssociatedToToken = '20001',
	MaxSupplyReached = '20002',
	RoleNotAssigned = '20003',
	ReceiptNotReceived = '30001',
	ContractNotFound = '30002',
	Unexpected = '30003',
}

export enum ErrorCategory {
	InputData = '1',
	Logic = '2',
	System = '3',
}

export function getErrorCategory(errorCode: ErrorCode): ErrorCategory {
	switch (true) {
		case errorCode.startsWith(ErrorCategory.InputData):
			return ErrorCategory.InputData;
		case errorCode.startsWith(ErrorCategory.Logic):
			return ErrorCategory.Logic;
		default:
			return ErrorCategory.System;
	}
}

export default class BaseError extends Error {
	errorCode: ErrorCode;
	errorCategory: ErrorCategory;

	/**
	 * Generic Error Constructor
	 */
	constructor(code: ErrorCode, msg: string) {
		super(msg);
		this.errorCode = code;
		this.errorCategory = getErrorCategory(code);
		Object.setPrototypeOf(this, BaseError.prototype);
	}
}

