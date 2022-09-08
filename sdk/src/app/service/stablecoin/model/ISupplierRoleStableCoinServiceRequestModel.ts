import {
	IAccountWithKeyRequestModel,
	IAmountOptionalRequestModel,
	IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface ISupplierRoleStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		IAmountOptionalRequestModel {
	address: string;
}
