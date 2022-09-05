/* eslint-disable @typescript-eslint/no-explicit-any */
import Service from '../Service';

const { Client } = require('@hashgraph/sdk');
const { ContractExecuteTransaction, AccountId } = require('@hashgraph/sdk');

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

	public async callContract(
		name: string,
		params: IContractParams,
	): Promise<[]> {
		const {
			contractCall,
		} = require('hedera-stable-coin-contracts/scripts/utils');

		const { treasuryId, parameters, clientSdk, gas, abi } = params;

		return await contractCall(
			treasuryId,
			name,
			parameters,
			clientSdk,
			gas,
			abi,
		);
	}

	public getClient(network: 'previewnet' | 'mainnet' | 'testnet'): any {
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
