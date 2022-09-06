// import {
// 	HashConnect,
// 	HashConnectTypes,
// 	MessageTypes,
// } from 'hashconnect/dist/cjs/main';
// import { HashConnectSigner } from 'hashconnect/dist/cjs/provider/signer.js';
import { Signer, IniConfig, IProvider } from '../Provider.js';
import { Contract, hethers } from '@hashgraph/hethers';
import { HederaNetwork } from '../../../../sdk.js';

export default class HashPackProvider 
// implements IProvider 
{
	// private hc: HashConnect;
	// private initData: HashConnectTypes.InitilizationData;
	// private network: HederaNetwork;

	// public async init({
	// 	network,
	// 	options,
	// }: IniConfig): Promise<HashPackProvider> {
	// 	this.hc = new HashConnect();
	// 	this.network = network;
	// 	this.registerEvents();
	// 	if (options && options?.appMetadata) {
	// 		this.initData = await this.hc.init(
	// 			options.appMetadata,
	// 			network as Partial<'mainnet' | 'testnet' | 'previewnet'>,
	// 		);
	// 	} else {
	// 		throw new Error('No app metadata');
	// 	}
	// 	return this;
	// }

	// public async stop(): Promise<boolean> {
	// 	await this.hc.disconnect(this.initData.topic);
	// 	await this.hc.clearConnectionsAndData();
	// 	return new Promise((res) => {
	// 		res(true);
	// 	});
	// }

	// public async deploy(
	// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 	factory: any,
	// 	wallet: Signer,
	// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	// 	...args: any[]
	// ): Promise<Contract> {
	// 	// TODO
	// 	const f = new hethers.ContractFactory(
	// 		factory.abi,
	// 		factory.bytecode,
	// 		wallet,
	// 	);
	// 	const contract = await f.deploy(...args, { gasLimit: 200000 });
	// 	await contract.deployTransaction.wait();
	// 	console.log(` ${factory.name} - address ${contract.address}`);
	// 	return contract;
	// }

	// private getSigner(): HashConnectSigner {
	// 	const provider = this.hc.getProvider(
	// 		this.network,
	// 		this.initData.topic,
	// 		'0.0.1', // TODO
	// 	);
	// 	return this.hc.getSigner(provider);
	// }

	// registerEvents(): void {
	// 	return;
	// }

	// getBalance(): Promise<number> {
	// 	throw new Error('Method not implemented.');
	// }

	// public async sendTransaction(
	// 	trans: MessageTypes.Transaction,
	// ): Promise<MessageTypes.TransactionResponse> {
	// 	// await this.getSigner().signTransaction(trans);
	// 	// return this.hc.sendTransaction(this.initData.topic, trans);
	// 	throw new Error('Not implemented');	
	// }

	// public async signTransaction(): Promise<void> {
	// 	throw new Error("Not implemented");	
	// }
}
