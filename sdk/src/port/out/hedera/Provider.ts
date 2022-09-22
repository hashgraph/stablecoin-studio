/* eslint-disable @typescript-eslint/no-explicit-any */
import { hethers, Signer } from '@hashgraph/hethers';
import { HashConnectConnectionState } from 'hashconnect/dist/cjs/types/hashconnect.js';
import { HashConnectTypes } from 'hashconnect/dist/esm/types/index.js';
import { HederaNetwork } from '../../../core/enum.js';
import EventEmitter from '../../../core/eventEmitter.js';
import PrivateKey from '../../../domain/context/account/PrivateKey.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import HashPackProvider from './hashpack/HashPackProvider.js';
import { AppMetadata } from './hashpack/types/types.js';
import { ICallContractRequest, InitializationData } from './types.js';
import ProviderEvent from './ProviderEvent.js';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Contract extends hethers.Contract {}

export { Signer };

export interface IniConfigOptions {
	appMetadata?: AppMetadata;
}
export interface IniConfig {
	network: HederaNetwork;
	options?: IniConfigOptions;
}

export interface IProvider {
	initData: HashConnectTypes.InitilizationData;
	emitter: EventEmitter<ProviderEvent>;
	events: ProviderEvent;
	init(config: IniConfig): Promise<IProvider>;
	stop(): Promise<boolean>;
	callContract(
		name: string,
		parameters: ICallContractRequest,
	): Promise<Uint8Array>;
	encodeFunctionCall(
		functionName: string,
		parameters: any[],
		abi: Array<any>,
	): Uint8Array;
	getPublicKey(privateKey?: PrivateKey | string | undefined): string;
	deployStableCoin(
		accountId: string,
		privateKey: string,
		stableCoin: StableCoin,
	): Promise<StableCoin>;
	getAvailabilityExtension(): boolean;
	gethashConnectConectionState(): HashConnectConnectionState;
	disconectHaspack(): void;
	connectWallet(): Promise<IProvider>;
	getInitData(): InitializationData;
}
