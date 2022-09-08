import {
	IAccountWithKeyRequestModel,
	IAmountRequestModel,
	ITreasureyRequestModel,
} from './CoreRequestModel.js';

export default interface ICashInStableCoinServiceRequestModel
	extends ITreasureyRequestModel,
		IAmountRequestModel,
		IAccountWithKeyRequestModel {}
