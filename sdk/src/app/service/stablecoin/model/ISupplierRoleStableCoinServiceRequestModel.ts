import {
	IAccountWithKeyRequestModel,
	IAmountOptionalRequestModel,
	ITreasureyRequestModel,
} from './CoreRequestModel.js';

export default interface ISupplierRoleStableCoinServiceRequestModel
	extends ITreasureyRequestModel,
		IAccountWithKeyRequestModel,
		IAmountOptionalRequestModel {
	address: string;
}
