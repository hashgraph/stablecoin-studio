import PublicKey from '../../../../domain/context/account/PublicKey.js';
import {
	IAccountWithKeyRequestModel,
	IAmountRequestModel,
	ITokenIdRequestModel,
	IProxyContractIdRequestModel,
	ITargetIdRequestModel,
} from './CoreRequestModel.js';

export default interface ICashInStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAmountRequestModel,
		IAccountWithKeyRequestModel,
		ITokenIdRequestModel,
		ITargetIdRequestModel {
			publicKey?: PublicKey
		}
