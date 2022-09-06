import { hethers, Signer } from '@hashgraph/hethers';
import { HederaNetwork } from '../../../core/enum.js';
import { Account } from '../../../sdk.js';
import { AppMetadata } from './hashconnect/types/types.js';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Contract extends hethers.Contract {}

export { Signer };

export interface IniConfigOptions {
	appMetadata?: AppMetadata;
	account?: Account;
}
export interface IniConfig {
	network: HederaNetwork;
	options?: IniConfigOptions;
}

export interface IProvider {
	init(config: IniConfig): Promise<IProvider>;
	stop(): Promise<boolean>;
	deploy(factory: any, wallet: any, ...args: any): Promise<Contract>;
}
