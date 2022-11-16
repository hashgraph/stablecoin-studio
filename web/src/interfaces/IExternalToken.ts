import { IRole } from './IRole.js';

export interface IExternalToken {
	id: string;
	symbol: string;
	roles: IRole[];
}
