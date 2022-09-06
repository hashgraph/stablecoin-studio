/* eslint-disable @typescript-eslint/no-explicit-any */

import Web3 from 'web3';
import StableCoin from '../../../domain/context/stablecoin/StableCoin.js';
import NetworkAdapter from '../network/NetworkAdapter.js';
import IContractRepository, { IContractParams } from './IContractRepository.js';
const {
	Client,
	ContractExecuteTransaction,
	AccountId,
} = require('@hashgraph/sdk');

export default class ContractRepository implements IContractRepository {
	private web3;
	private networkAdapter: NetworkAdapter;
	/**
	 *
	 */
	constructor(networkAdapter: NetworkAdapter, web3: Web3) {
		this.networkAdapter = networkAdapter;
		this.web3 = web3;
	}

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

	public getPublicKey(privateKey: string): string {
		const { PrivateKey } = require('@hashgraph/sdk');

		const publicKey =
			PrivateKey.fromString(privateKey).publicKey.toStringDer();

		return publicKey;
	}

	public async createStableCoin(accountId: string, privateKey: string, coin: StableCoin): Promise<StableCoin> {
		await this.networkAdapter.provider.deploy(accountId, privateKey, coin);
		return coin;
	}
}
