import { PublicKey } from '../sdk.js';
import {
	IRequestContractsAmount,
	ITokenIdRequestModel,
} from './IRequestContracts.js';

export type ICashOutStableCoinRequest = IRequestContractsAmount &
	ITokenIdRequestModel & { publicKey?: PublicKey };
