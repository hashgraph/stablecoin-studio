import { StableCoinRole } from '../../../../core/enum.js';
import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
	ITargetIdRequestModel,
	ITokenIdRequestModel,
} from './CoreRequestModel.js';

export default interface IRoleStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		ITargetIdRequestModel,
		ITokenIdRequestModel {
	role: StableCoinRole;
}
