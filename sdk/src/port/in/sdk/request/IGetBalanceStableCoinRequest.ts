import {
	IRequestBalanceOf,
	ITokenIdRequestModel,
} from './IRequestContracts.js';

export type IGetBalanceStableCoinRequest = IRequestBalanceOf &
	ITokenIdRequestModel;
