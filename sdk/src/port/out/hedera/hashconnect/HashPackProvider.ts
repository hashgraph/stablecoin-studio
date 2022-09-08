import { HashConnect, HashConnectTypes } from 'hashconnect/dist/cjs/main';
import { HashConnectSigner } from 'hashconnect/dist/cjs/provider/signer.js';
import { IniConfig, IProvider } from '../Provider.js';
import { HederaNetwork } from '../../../in/sdk/sdk.js';
import { ContractId } from '@hashgraph/sdk';
import { StableCoin } from '../../../../domain/context/stablecoin/StableCoin.js';
import { ICallContractRequest } from '../types.js';

export default class HashPackProvider implements IProvider {
	private hc: HashConnect;
	private initData: HashConnectTypes.InitilizationData;
	private network: HederaNetwork;

	public async init({
		network,
		options,
	}: IniConfig): Promise<HashPackProvider> {
		this.hc = new HashConnect();
		this.network = network;
		this.registerEvents();
		if (options && options?.appMetadata) {
			this.initData = await this.hc.init(
				options.appMetadata,
				network as Partial<'mainnet' | 'testnet' | 'previewnet'>,
			);
		} else {
			throw new Error('No app metadata');
		}
		return this;
	}

	public async callContract(
		name: string,
		parameters: ICallContractRequest,
	): Promise<Uint8Array> {
		throw new Error('Method not implemented.');
	}

	public encodeFunctionCall(
		functionName: string,
		parameters: any[],
		abi: any[],
	): Uint8Array {
		throw new Error('Method not implemented.');
	}

	public decodeFunctionResult(
		functionName: string,
		resultAsBytes: ArrayBuffer,
		abi: any[],
	): Uint8Array {
		throw new Error('Method not implemented.');
	}

	public getPublicKey(privateKey?: string | undefined): string {
		throw new Error('Method not implemented.');
	}

	public async deployStableCoin(
		accountId: string,
		privateKey: string,
		stableCoin: StableCoin,
	): Promise<ContractId> {
		throw new Error('Method not implemented.');
	}

	public async stop(): Promise<boolean> {
		const topic = this.initData.topic;
		await this.hc.disconnect(topic);
		await this.hc.clearConnectionsAndData();
		return new Promise((res) => {
			res(true);
		});
	}

	private getSigner(): HashConnectSigner {
		const provider = this.hc.getProvider(
			this.network,
			this.initData.topic,
			'0.0.1', // TODO
		);
		return this.hc.getSigner(provider);
	}

	registerEvents(): void {
		return;
	}

	getBalance(): Promise<number> {
		throw new Error('Method not implemented.');
	}
}
