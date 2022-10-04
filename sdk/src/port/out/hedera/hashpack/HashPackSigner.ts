import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Signer,
	TransactionResponse,
	ContractCreateFlow,
	ContractExecuteTransaction,
} from '@hashgraph/sdk';
import { HashConnect, MessageTypes } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import HashPackAccount from '../../../../domain/context/account/HashPackAccount.js';
import { getHederaNetwork, HederaNetwork } from '../../../../core/enum.js';
import { HashConnectSigner } from 'hashconnect/provider/signer';

export class HashPackSigner implements ISigner {
	private hc: HashConnect;
	public account: HashPackAccount;
	public topic: string;
	public provider: HashConnectProvider;
	public signer: Signer;
	public hashConnectSigner: HashConnectSigner;

	constructor(
		hc: HashConnect,
		account: HashPackAccount,
		network: HederaNetwork,
		topic: string,
	) {
		this.hc = hc;
		this.account = account;
		this.topic = topic;
		this.provider = this.hc.getProvider(
			getHederaNetwork(network).name,
			topic,
			account.accountId.id,
		);
		this.signer = this.hc.getSigner(this.provider) as unknown as Signer;
	}

	async signAndSendTransaction(
		transaction:
			| Transaction
			| ContractExecuteTransaction
			| ContractCreateFlow,
	): Promise<TransactionResponse | MessageTypes.TransactionResponse> {
		if (this.signer) {
			if (transaction instanceof ContractCreateFlow) {
				return await transaction.executeWithSigner(this.signer);
			} else {
				const signedT = await transaction.freezeWithSigner(
					this.signer,
				);
				const t = await this.signer.signTransaction(signedT);
				return await this.hc.sendTransaction(this.topic, {
					topic: this.topic,
					byteArray: t.toBytes(),
					metadata: {
						accountToSign: this.signer.getAccountId().toString(),
						returnTransaction: false,
					},
				});
			}
		}
		throw new Error('Its necessary to have a Signer');
	}
}
