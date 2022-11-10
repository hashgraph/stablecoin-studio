import {
	AccountRequestModel,
	TokenIdRequestModel,
} from './model/ContractRequests.js';

export type IGetCapabilitiesRequest = AccountRequestModel &
	TokenIdRequestModel;
