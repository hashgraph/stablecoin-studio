import {
	IAccountWithKeyRequestModel as IAccountWithKeyRequestModel,
	IAmountRequestModel as IAmountRequestModel,
	IProxyContractIdRequestModel as IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface IWipeStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		IAmountRequestModel {}
