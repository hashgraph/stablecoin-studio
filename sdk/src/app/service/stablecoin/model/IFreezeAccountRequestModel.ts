import PublicKey from '../../../../domain/context/account/PublicKey.js';
import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
	ITargetIdRequestModel,
	ITokenIdRequestModel,
} from './CoreRequestModel.js';

export default interface IFreezeAccountRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		ITokenIdRequestModel,
		ITargetIdRequestModel {
	publicKey?: PublicKey;
}
