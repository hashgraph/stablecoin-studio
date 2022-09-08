import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
} from './CoreRequestModel.js';

export default interface IGetBalanceOfStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel {
			targetId: string;
		}
