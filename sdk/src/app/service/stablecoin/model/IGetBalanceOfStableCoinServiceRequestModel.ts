import {
	IAccountWithKeyRequestModel,
	ITreasureyRequestModel,
} from './CoreRequestModel.js';

export default interface IGetBalanceOfStableCoinServiceRequestModel
	extends ITreasureyRequestModel,
		IAccountWithKeyRequestModel {}
