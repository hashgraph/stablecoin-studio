import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface IPauseStableCoinRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel {}
