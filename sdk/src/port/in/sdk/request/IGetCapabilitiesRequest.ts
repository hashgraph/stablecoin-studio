import {
	IAccountRequestModel,
	ITokenIdRequestModel,
} from './IRequestContracts.js';

export type IGetCapabilitiesRequest = IAccountRequestModel &
	ITokenIdRequestModel;
