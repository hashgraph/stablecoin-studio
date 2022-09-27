/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICallContractRequest } from '../../../port/out/hedera/types.js';
import NetworkAdapter from '../../../port/out/network/NetworkAdapter.js';
import Service from '../Service';

/**
 * Contracts Service
 */
export default class ContractsService extends Service {
	private networkAdapter: NetworkAdapter;

	constructor(networkAdapter: NetworkAdapter) {
		super();
		this.networkAdapter = networkAdapter;
	}

	/**
	 * callContract
	 * @param name
	 * @param params
	 * @returns
	 */
	public async callContract(
		name: string,
		params: ICallContractRequest,
	): Promise<Uint8Array> {
		return this.networkAdapter.provider.callContract(name, params);
	}

	/**
	 * encodeFuncionCall
	 * @returns
	 */
	public encodeFuncionCall(
		functionName: any,
		parameters: any[],
		abi: any,
	): Uint8Array {
		return this.networkAdapter.provider.encodeFunctionCall(
			functionName,
			parameters,
			abi,
		);
	}

	/**
	 * getPublicKey
	 * @returns
	 */
	public getPublicKey(privateKey: string): string {
		return this.networkAdapter.provider.getPublicKeyString(privateKey);
	}
}
