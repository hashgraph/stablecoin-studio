import PublicKey from '../../../../domain/context/account/PublicKey.js';
import {
	IAccountWithKeyRequestModel as IAccountWithKeyRequestModel,
	IAmountRequestModel as IAmountRequestModel,
	IProxyContractIdRequestModel as IProxyContractIdRequestModel,
	ITokenIdRequestModel,
	ITargetIdRequestModel,
} from './CoreRequestModel.js';

export default interface IWipeStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		ITokenIdRequestModel,
		ITargetIdRequestModel,
		IAmountRequestModel {
	publicKey?: PublicKey;
}
