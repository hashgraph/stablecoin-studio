import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Signer,
	TransactionResponse,
	ContractCreateFlow,
	ContractExecuteTransaction,
} from '@hashgraph/sdk';
import { HashConnect, MessageTypes } from 'hashconnect';
import { InitializationData } from '../types.js';

export class HashPackSigner implements ISigner {
	private hc: HashConnect;
	private initData: InitializationData;

	constructor(hc: HashConnect, initData: InitializationData) {
		this.hc = hc;
		this.initData = initData;
	}

	async signAndSendTransaction(
		transaction:
			| Transaction
			| ContractExecuteTransaction
			| ContractCreateFlow,
		signer?: Signer,
	): Promise<TransactionResponse | MessageTypes.TransactionResponse> {
		if (signer) {
			console.log(transaction);
			if (transaction instanceof ContractCreateFlow) {
				return await transaction.executeWithSigner(signer);
			} else {
				const signedT = await transaction.freezeWithSigner(signer);
				const t = await signer.signTransaction(signedT);
				return await this.hc.sendTransaction(this.initData.topic, {
					topic: this.initData.topic,
					byteArray: t.toBytes(),
					metadata: {
						accountToSign: signer.getAccountId().toString(),
						returnTransaction: false,
					},
				});
			}
		}
		throw new Error('Its necessary to have a Signer');
	}
}
