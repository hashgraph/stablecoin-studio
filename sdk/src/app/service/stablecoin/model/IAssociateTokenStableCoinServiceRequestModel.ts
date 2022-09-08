import {
	IAccountWithKeyRequestModel,
	ITreasureyRequestModel,
} from './CoreRequestModel.js';

export default interface IAssociateTokenStableCoinServiceRequestModel
	extends ITreasureyRequestModel,
		IAccountWithKeyRequestModel {}
