import {
	IAccountWithKeyRequestModel,
	IAmountOptionalRequestModel,
	IProxyContractIdRequestModel,
	ITargetIdRequestModel,
} from './CoreRequestModel.js';

export default interface ISupplierRoleStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		IAmountOptionalRequestModel,
		ITargetIdRequestModel {}
