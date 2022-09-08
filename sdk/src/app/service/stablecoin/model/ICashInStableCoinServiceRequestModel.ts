import {
	IAccountWithKeyRequestModel,
	IAmountRequestModel,
	ITokenIdRequestModel,
	IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface ICashInStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAmountRequestModel,
		IAccountWithKeyRequestModel,
		ITokenIdRequestModel {}
