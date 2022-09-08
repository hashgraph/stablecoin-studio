/* eslint-disable @typescript-eslint/no-explicit-any */
import { hethers, Signer } from '@hashgraph/hethers';
import { ContractId } from '@hashgraph/sdk';
import { HederaNetwork } from '../../../core/enum.js';
import { StableCoin } from '../../../domain/context/stablecoin/StableCoin.js';
import { AppMetadata } from './hashconnect/types/types.js';
import { ICallContractRequest } from './types.js';

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
	decodeFunctionResult(
		functionName: string,
		resultAsBytes: ArrayBuffer,
		abi: Array<any>,
	): Uint8Array;
	getPublicKey(privateKey?: string): string;
	deployStableCoin(
		accountId: string,
		privateKey: string,
		stableCoin: StableCoin,
	): Promise<StableCoin>;
}
