import { StableCoinRole } from '../../../../core/enum.js';
import {
	IAccountWithKeyRequestModel,
	IAmountOptionalRequestModel,
	IProxyContractIdRequestModel,
	ITargetIdRequestModel,
} from './CoreRequestModel.js';

export default interface IRoleStableCoinServiceRequestModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		IAmountOptionalRequestModel,
		ITargetIdRequestModel {
	role: StableCoinRole;
}
