/* eslint-disable @typescript-eslint/no-explicit-any */
import Service from '../Service';

const { Client } = require('@hashgraph/sdk');

export interface IContractParams {
	treasuryId: string;
	parameters: any[];
	clientSdk: any;
	gas: number;
	abi: any;
}

/**
 * Utilities Service
 */
export default class UtilitiesService extends Service {
	constructor() {
		super();
	}

	public getPublicKey(privateKey: string): string {
		const { PrivateKey } = require('@hashgraph/sdk');

		const publicKey =
			PrivateKey.fromString(privateKey).publicKey.toStringDer();

		return publicKey;
	}

	public async contractCall(
		contractId: any,
		functionName: string,
		parameters: any[],
		clientOperator: any,
		gas: any,
		abi: any,
	): Promise<[]> {
		const {
			encodeFunctionCall,
			decodeFunctionResult,
		} = require('hedera-stable-coin-contracts/scripts/utils');
		const {
			ContractExecuteTransaction,
			AccountId,
		} = require('@hashgraph/sdk');

		const functionCallParameters = encodeFunctionCall(
			functionName,
			parameters,
			abi,
		);

		const contractTx = await new ContractExecuteTransaction()
			.setContractId(contractId)
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
			.execute(clientOperator);
		const record = await contractTx.getRecord(clientOperator);

		const results = decodeFunctionResult(
			abi,
			functionName,
			record.contractFunctionResult?.bytes,
		);

		return results;
	}

	public async callContract(
		name: string,
		params: IContractParams,
	): Promise<[]> {
		const { treasuryId, parameters, clientSdk, gas, abi } = params;

		return await this.contractCall(
			treasuryId,
			name,
			parameters,
			clientSdk,
			gas,
			abi,
		);
	}

	public getClient(network: 'previewnet' | 'mainnet' | 'testnet') {
		switch (network) {
			case 'previewnet':
				return Client.forPreviewnet();
				break;
			case 'mainnet':
				return Client.forMainnet();
				break;
			default:
			case 'testnet':
				return Client.forTestnet();
				break;
		}
	}
}
