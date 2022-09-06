import { hethers } from '@hashgraph/hethers';
import { HederaNetwork } from '../../../../core/enum.js';
import { Contract, Signer, IniConfig, IProvider } from '../Provider.js';

type DefaultHederaProvider = hethers.providers.DefaultHederaProvider;

export default class HethersProvider implements IProvider {
	public hethersProvider: DefaultHederaProvider;
	private network: HederaNetwork;
	/**
	 * init
	 */
	public init({ network }: IniConfig): Promise<HethersProvider> {
		this.network = network;
		this.hethersProvider = this.getHethersProvider(network);
		return new Promise((r) => {
			r(this);
		});
	}

	public async stop(): Promise<boolean> {
		return new Promise((res) => {
			res(true);
		});
	}

	public async deploy(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		factory: any,
		wallet: Signer,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		...args: any[]
	): Promise<Contract> {
		const f = new hethers.ContractFactory(
			factory.abi,
			factory.bytecode,
			wallet,
		);
		const contract = await f.deploy(...args, { gasLimit: 200000 });
		await contract.deployTransaction.wait();
		console.log(` ${factory.name} - address ${contract.address}`);
		return contract;
	}

	private getHethersProvider(network: HederaNetwork): DefaultHederaProvider {
		switch (network) {
			case HederaNetwork.MAIN:
			case HederaNetwork.PREVIEW:
			case HederaNetwork.TEST:
				return hethers.getDefaultProvider(network);
			case HederaNetwork.CUSTOM:
			default:
				throw new Error('Network not supported');
		}
	}

	getBalance(): Promise<number> {
		throw new Error('Method not implemented.');
	}
}
