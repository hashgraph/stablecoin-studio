import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface IGetNameOfStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel {}
