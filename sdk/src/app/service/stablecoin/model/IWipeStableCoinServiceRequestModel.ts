import {
	IAccountWithKeyRequestModel as IAccountWithKeyRequestModel,
	IAmountRequestModel as IAmountRequestModel,
	IProxyContractIdRequestModel as IProxyContractIdRequestModel,
	ITokenIdRequestModel,
} from './CoreRequestModel.js';

export default interface IWipeStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		ITokenIdRequestModel,
		IAmountRequestModel {}
