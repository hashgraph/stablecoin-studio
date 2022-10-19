import { PublicKey } from '../sdk.js';
import {
	IRequestContractsAmount,
	ITokenIdRequestModel,
	ITargetIdRequestModel,
} from './IRequestContracts.js';

export type IWipeStableCoinRequest = IRequestContractsAmount &
	ITokenIdRequestModel &
	ITargetIdRequestModel & { publicKey?: PublicKey };
