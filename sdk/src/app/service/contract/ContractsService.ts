/* eslint-disable @typescript-eslint/no-explicit-any */
import { IContractParams } from '../../../port/out/hedera/types.js';
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
		params: IContractParams,
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
	 * decodeFunctionResult
	 * @returns
	 */
	public decodeFunctionResult(
		abi: any,
		functionName: any,
		resultAsBytes: any,
	): Uint8Array {
		return this.networkAdapter.provider.decodeFunctionResult(
			abi,
			functionName,
			resultAsBytes,
		);
	}

	/**
	 * getPublicKey
	 * @returns
	 */
	public getPublicKey(privateKey: string): string {
		return this.networkAdapter.provider.getPublicKey(privateKey);
	}
}
