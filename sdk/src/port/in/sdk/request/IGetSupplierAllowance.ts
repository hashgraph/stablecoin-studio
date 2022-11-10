import {
	RequestContracts,
	TargetIdRequestModel,
	TokenIdRequestModel,
} from './model/ContractRequests.js';

export type IGetSupplierAllowance = RequestContracts &
	TargetIdRequestModel &
	TokenIdRequestModel;
