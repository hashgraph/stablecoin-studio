import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Signer,
	TransactionResponse,
	ContractCreateFlow,
	ContractExecuteTransaction,
	PublicKey as HPublicKey,
} from '@hashgraph/sdk';
import { HashConnect, MessageTypes } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import HashPackAccount from '../../../../domain/context/account/HashPackAccount.js';
import { getHederaNetwork, HederaNetwork } from '../../../../core/enum.js';
import { HashConnectSigner } from 'hashconnect/provider/signer';
import { NetworkType } from 'hashconnect/types';
import HederaError from '../error/HederaError.js';

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
			getHederaNetwork(network).name as NetworkType,
			topic,
			account.accountId.id,
		);
		this.hashConnectSigner = this.hc.getSigner(this.provider);
		this.signer = this.hashConnectSigner as unknown as Signer;
	}

	async signAndSendTransaction(
		transaction:
			| Transaction
			| ContractExecuteTransaction
			| ContractCreateFlow,
	): Promise<TransactionResponse | MessageTypes.TransactionResponse> {
		if (this.signer) {
			if (transaction instanceof ContractCreateFlow) {
				await this.getAccountKey();
				try {
					return await transaction.executeWithSigner(this.signer);
				} catch (err) {
					console.error(err);
					throw err;
				}
			} else {
				let signedT = transaction;
				if (!transaction.isFrozen()) {
					signedT = await transaction.freezeWithSigner(this.signer);
				}
				const t = await this.signer.signTransaction(signedT);
				return await this.hc.sendTransaction(this.topic, {
					topic: this.topic,
					byteArray: t.toBytes(),
					metadata: {
						accountToSign: this.signer.getAccountId().toString(),
						returnTransaction: false,
						getRecord: true,
					},
				});
			}
		}
		throw new Error('Its necessary to have a Signer');
	}

	async getAccountKey(): Promise<HPublicKey> {
		this.hashConnectSigner = await this.hc.getSignerWithAccountKey(
			this.provider,
		);
		this.signer = this.hashConnectSigner as unknown as Signer;
		if (this.hashConnectSigner.getAccountKey) {
			return this.hashConnectSigner.getAccountKey();
		} else {
			throw new HederaError('Could not fetch account public key');
		}
	}
}
