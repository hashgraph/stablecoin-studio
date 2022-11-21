import PublicKey from '../../../../domain/context/account/PublicKey.js';
import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
	ITokenIdRequestModel,
} from './CoreRequestModel.js';

export default interface IPauseStableCoinRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		ITokenIdRequestModel {
	publicKey?: PublicKey;
}
