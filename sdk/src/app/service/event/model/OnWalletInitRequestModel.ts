import { InitializationData } from '../../../../port/out/hedera/types.js';

export default interface OnWalletInitRequestModel {
	listener: (data: InitializationData) => void
}
