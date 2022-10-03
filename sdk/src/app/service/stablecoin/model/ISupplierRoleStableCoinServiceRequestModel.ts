import {
	IAccountWithKeyRequestModel,
	IAmountOptionalRequestModel,
	IProxyContractIdRequestModel,
	ITargetIdRequestModel,
	ITokenIdRequestModel,
} from './CoreRequestModel.js';

export default interface ISupplierRoleStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		IAmountOptionalRequestModel,
		ITargetIdRequestModel,
		ITokenIdRequestModel {}
