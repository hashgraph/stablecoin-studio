import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
	ITokenIdRequestModel,
	ITargetIdRequestModel,
} from './CoreRequestModel.js';

export default interface IGetCapabilitiesServiceRequestModel
	extends IProxyContractIdRequestModel,
		ITokenIdRequestModel,
		ITargetIdRequestModel,
		IAccountWithKeyRequestModel {}
