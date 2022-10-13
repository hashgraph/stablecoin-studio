/* eslint-disable @typescript-eslint/no-explicit-any */
import { hethers, Signer } from '@hashgraph/hethers';
import { HashConnectConnectionState } from 'hashconnect/types';
import { HashConnectTypes } from 'hashconnect/types';
import { HederaNetwork } from '../../../core/enum.js';
import PrivateKey from '../../../domain/context/account/PrivateKey.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import { AppMetadata } from './hashpack/types/types.js';
import {
	ICallContractRequest,
	IHTSTokenRequest,
	IWipeTokenRequest,
	ITransferTokenRequest,
	InitializationData } from './types.js';

import EventService from '../../../app/service/event/EventService.js';
import { Account } from '../../in/sdk/sdk.js';


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
	eventService: EventService;
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
	getPublicKeyString(privateKey?: PrivateKey | string | undefined, privateKeyType?: string): string;
	deployStableCoin(
		stableCoin: StableCoin,
		account: Account,
	): Promise<StableCoin>;
	getAvailabilityExtension(): boolean;
	gethashConnectConectionState(): HashConnectConnectionState;
	disconectHaspack(): void;
	connectWallet(): Promise<IProvider>;
	getInitData(): InitializationData;
	wipeHTS(parameters: IWipeTokenRequest): Promise<boolean>;
	cashInHTS(parameters: IHTSTokenRequest): Promise<boolean>;
	cashOutHTS(parameters: IHTSTokenRequest): Promise<boolean>;
	transferHTS(parameters: ITransferTokenRequest): Promise<boolean>;
}
