/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
	ValidationChecks = '10022',
	InvalidEvmAddress = '10023',
	InvalidRequest = '10024',
	AccountIdNotExists = '10026',
	AccountNotAssociatedToToken = '20001',
	MaxSupplyReached = '20002',
	RoleNotAssigned = '20003',
	OperationNotAllowed = '20004',
	InsufficientFunds = '20005',
	KYCNotEnabled = '20006',
	AccountNotKyc = '20007',
	AccountFreeze = '20008',
	ReceiptNotReceived = '30001',
	ContractNotFound = '30002',
	Unexpected = '30003',
	RuntimeError = '30004',
	InvalidResponse = '30005',
	NotFound = '30006',
	UnsupportedKeyType = '30007',
	InitializationError = '40001',
	PairingError = '40002',
	TransactionCheck = '40003',
	SigningError = '40004',
	TransactionError = '40005',
	DeplymentError = '40006',
	ProviderError = '40007',
	PairingRejected = '40008',
	BackendError = '40009',
}

export enum ErrorCategory {
	InputData = '1',
	Logic = '2',
	System = '3',
	Provider = '4',
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

	toString(stack = false): string {
		return `${this.errorCode} - ${stack ? this.stack : this.message}`;
	}
}
