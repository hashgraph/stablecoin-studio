import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
	ITokenIdRequestModel,
} from './CoreRequestModel.js';

export default interface IGetBalanceOfStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		ITokenIdRequestModel,
		IAccountWithKeyRequestModel {
	targetId: string;
}
