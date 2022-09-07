import {
	IAccountWithKeyRequestModel,
	ITreasureyRequestModel,
} from './CoreRequestModel.js';

export default interface IGetNameOfStableCoinServiceRequestModel
	extends ITreasureyRequestModel,
		IAccountWithKeyRequestModel {}
