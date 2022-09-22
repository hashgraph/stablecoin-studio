import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
	ITargetIdRequestModel,
} from './CoreRequestModel.js';

export default interface IGetBasicRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		ITargetIdRequestModel {}
