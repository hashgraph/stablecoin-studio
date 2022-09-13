import {
	IAccountWithKeyRequestModel,
	IAmountRequestModel,
	IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface IRescueStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		IAmountRequestModel {}
