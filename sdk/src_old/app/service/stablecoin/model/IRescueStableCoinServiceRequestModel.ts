import {
	IAccountWithKeyRequestModel,
	IAmountRequestModel,
	IProxyContractIdRequestModel,
	ITokenIdRequestModel,
} from './CoreRequestModel.js';

export default interface IRescueStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		IAmountRequestModel,
		ITokenIdRequestModel {}
