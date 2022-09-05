/* eslint-disable @typescript-eslint/no-explicit-any */
import Service from '../Service';
import Web3 from 'web3';

export interface IContractParams {
	treasuryId: string;
	parameters: any[];
	clientSdk: any;
	gas: number;
	abi: any;
}

const {
	Client,
	ContractExecuteTransaction,
	AccountId,
} = require('@hashgraph/sdk');

/**
 * Utilities Service
 */
export default class ContractsService extends Service {
	constructor() {
		super();
	}

	private web3 = new Web3();

	/**
	 * getClient
	 * @param network
	 * @returns
	 */
	public getClient(network: 'previewnet' | 'mainnet' | 'testnet'): any {
		switch (network) {
			case 'previewnet':
				return Client.forPreviewnet();
			case 'mainnet':
				return Client.forMainnet();
			default:
			case 'testnet':
				return Client.forTestnet();
		}
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
		const { treasuryId, parameters, clientSdk, gas, abi } = params;

		const functionCallParameters = this.encodeFuncionCall(
			name,
			parameters,
			abi,
		);

		const contractTx = await new ContractExecuteTransaction()
			.setContractId(treasuryId)
			.setFunctionParameters(functionCallParameters)
			.setGas(gas)
			.setNodeAccountIds([
				AccountId.fromString('0.0.3'),
				AccountId.fromString('0.0.5'),
				AccountId.fromString('0.0.6'),
				AccountId.fromString('0.0.7'),
				AccountId.fromString('0.0.8'),
				AccountId.fromString('0.0.9'),
			])
			.execute(clientSdk);
		const record = await contractTx.getRecord(clientSdk);

		const results = this.decodeFunctionResult(
			abi,
			name,
			record.contractFunctionResult?.bytes,
		);

		return results;
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
		const functionAbi = abi.find(
			(func: { name: any; type: string }) =>
				func.name === functionName && func.type === 'function',
		);
		const encodedParametersHex = this.web3.eth.abi
			.encodeFunctionCall(functionAbi, parameters)
			.slice(2);

		return Buffer.from(encodedParametersHex, 'hex');
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
		const functionAbi = abi.find(
			(func: { name: any }) => func.name === functionName,
		);
		const functionParameters = functionAbi?.outputs;
		const resultHex = '0x'.concat(
			Buffer.from(resultAsBytes).toString('hex'),
		);
		const result = this.web3.eth.abi.decodeParameters(
			functionParameters || [],
			resultHex,
		);

		const jsonParsedArray = JSON.parse(JSON.stringify(result));

		return jsonParsedArray;
	}
}
