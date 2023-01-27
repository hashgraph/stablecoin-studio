import type { IExternalToken } from './IExternalToken.js';

export interface IAccountToken {
	id: string;
	externalTokens: IExternalToken[];
}
