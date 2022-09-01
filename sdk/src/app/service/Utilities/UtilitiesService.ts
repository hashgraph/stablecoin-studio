/* eslint-disable @typescript-eslint/no-explicit-any */
import { contractCall } from 'hedera-stable-coin-contracts/scripts/utils';
import Service from '../Service';

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
}
