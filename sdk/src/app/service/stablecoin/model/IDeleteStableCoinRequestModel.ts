import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface IDeleteStableCoinRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel {}
