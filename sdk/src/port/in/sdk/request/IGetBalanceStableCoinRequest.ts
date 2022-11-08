import {
	RequestBalanceOf,
	TokenIdRequestModel,
} from './model/ContractRequests.js';

export type IGetBalanceStableCoinRequest = RequestBalanceOf &
	TokenIdRequestModel;
