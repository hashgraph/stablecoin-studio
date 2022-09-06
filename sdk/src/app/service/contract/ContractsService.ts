/* eslint-disable @typescript-eslint/no-explicit-any */
import IContractRepository, {
	IContractParams,
} from '../../../port/out/contract/IContractRepository.js';
import Service from '../Service';

/**
 * Contracts Service
 */
export default class ContractsService extends Service {
	private contractRepository: IContractRepository;

	constructor(contractRepository: IContractRepository) {
		super();
		this.contractRepository = contractRepository;
	}

	/**
	 * getClient
	 * @param network
	 * @returns
	 */
	public getClient(network: 'previewnet' | 'mainnet' | 'testnet'): any {
		return this.contractRepository.getClient(network);
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
		return this.contractRepository.callContract(name, params);
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
		return this.contractRepository.encodeFuncionCall(
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
		return this.contractRepository.decodeFunctionResult(
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
		return this.contractRepository.getPublicKey(privateKey);
	}
}
