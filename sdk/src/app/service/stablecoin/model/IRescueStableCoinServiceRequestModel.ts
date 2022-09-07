import {
	IAccountWithKeyRequestModel,
	IAmountRequestModel,
	ITreasureyRequestModel,
} from './CoreRequestModel.js';

export default interface IRescueStableCoinServiceRequestModel
	extends ITreasureyRequestModel,
		IAccountWithKeyRequestModel,
		IAmountRequestModel {}
