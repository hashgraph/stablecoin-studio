import {
	IRequestBalanceOf,
	ITokenIdRequestModel,
} from './IRequestContracts.js';

export type IGetCapabilitiesRequest = IRequestBalanceOf &
	ITokenIdRequestModel;
