import {
	IAccountWithKeyRequestModel,
	ITokenIdRequestModel,
} from './CoreRequestModel.js';

export default interface IGetCapabilitiesServiceRequestModel
	extends ITokenIdRequestModel,
		IAccountWithKeyRequestModel {}
