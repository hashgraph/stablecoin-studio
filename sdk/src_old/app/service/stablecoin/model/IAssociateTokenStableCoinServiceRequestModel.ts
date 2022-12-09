import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface IAssociateTokenStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel {}
