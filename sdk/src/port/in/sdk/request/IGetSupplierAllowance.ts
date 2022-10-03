import {
	IRequestContracts,
	ITargetIdRequestModel,
	ITokenIdRequestModel,
} from './IRequestContracts.js';

export type IGetSupplierAllowance = IRequestContracts &
	ITargetIdRequestModel &
	ITokenIdRequestModel;
