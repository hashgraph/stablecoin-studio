import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
	ITokenIdRequestModel,
	ITargetIdRequestModel,
} from './CoreRequestModel.js';

export default interface IGetBalanceOfStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		ITokenIdRequestModel,
		ITargetIdRequestModel,
		IAccountWithKeyRequestModel {}
