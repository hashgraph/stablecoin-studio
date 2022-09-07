import {
	IAccountWithKeyRequestModel,
	IAmountRequestModel,
	ITreasureyRequestModel,
} from './CoreRequestModel.js';

export default interface ISupplierRoleStableCoinServiceRequestModel
	extends ITreasureyRequestModel,
		IAccountWithKeyRequestModel,
		IAmountRequestModel {
	address: string;
}
