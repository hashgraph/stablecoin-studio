import {
	IAccountWithKeyRequestModel as IAccountWithKeyRequestModel,
	IAmountRequestModel as IAmountRequestModel,
	ITreasureyRequestModel as ITreasureyRequestModel,
} from './CoreRequestModel.js';

export default interface IWipeStableCoinServiceRequestModel
	extends ITreasureyRequestModel,
		IAccountWithKeyRequestModel,
		IAmountRequestModel {
	address: string;
}
