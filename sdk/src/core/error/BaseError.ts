export enum ErrorCode {
	AccountIdInValid = '10001',
	PrivateKeyInvalid = '10002',
	PrivateKeyTypeInvalid = '10003',
	PublicKeyInvalid = '10004',
	ContractKeyInvalid = '10006',
	InvalidAmount = '10008',
	InvalidIdFormatHedera = '10009',
	InvalidContractId = '10014',
	InvalidType = '10015',
	InvalidLength = '10016',
	EmptyValue = '10017',
	InvalidRange = '10018',
	InvalidRole = '10019',
	InvalidSupplierType = '10020',
	InvalidValue = '10021',
	AccountNotAssociatedToToken = '20001',
	MaxSupplyReached = '20002',
	RoleNotAssigned = '20003',
	OperationNotAllowed = '20004',
	InsufficientFunds = '20005',
	ReceiptNotReceived = '30001',
	ContractNotFound = '30002',
	Unexpected = '30003',
	RuntimeError = '30004',
	InvalidResponse = '30005',
	NotFound = '30006',
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
	message: string;
	errorCode: ErrorCode;
	errorCategory: ErrorCategory;

	/**
	 * Generic Error Constructor
	 */
	constructor(code: ErrorCode, msg: string) {
		super(msg);
		this.message = msg;
		this.errorCode = code;
		this.errorCategory = getErrorCategory(code);
		Object.setPrototypeOf(this, BaseError.prototype);
	}
}
