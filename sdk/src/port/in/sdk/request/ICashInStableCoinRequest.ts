import {
	IRequestContractsAmount,
	ITokenIdRequestModel,
	ITargetIdRequestModel,
} from './IRequestContracts.js';

export type ICashInStableCoinRequest = IRequestContractsAmount &
	ITokenIdRequestModel &
	ITargetIdRequestModel;
