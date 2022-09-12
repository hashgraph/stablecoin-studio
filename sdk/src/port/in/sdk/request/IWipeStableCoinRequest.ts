import {
	IRequestContractsAmount,
	ITokenIdRequestModel,
	ITargetIdRequestModel,
} from './IRequestContracts.js';

export type IWipeStableCoinRequest = IRequestContractsAmount &
	ITokenIdRequestModel &
	ITargetIdRequestModel;
