import {
	IAccountWithKeyRequestModel,
	IProxyContractIdRequestModel,
	ITargetIdRequestModel,
} from './CoreRequestModel.js';

export default interface IGetSupplierAllowanceModel
	extends IProxyContractIdRequestModel,
		IAccountWithKeyRequestModel,
		ITargetIdRequestModel {
	tokenId: string;
}
