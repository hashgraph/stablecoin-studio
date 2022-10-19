import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Signer,
	TransactionResponse,
	ContractCreateFlow,
	ContractExecuteTransaction,
	AccountInfo,
	TokenMintTransaction,
} from '@hashgraph/sdk';
import { HashConnect, MessageTypes } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import HashPackAccount from '../../../../domain/context/account/HashPackAccount.js';
import { getHederaNetwork, HederaNetwork } from '../../../../core/enum.js';
import { HashConnectSigner } from 'hashconnect/provider/signer';
import { NetworkType } from 'hashconnect/types';

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
		let trans = transaction
		if (this.signer) {
			if (
				trans instanceof ContractCreateFlow ||
				trans instanceof TokenMintTransaction
			) {
				console.log(transaction);
				if (!(transaction as Transaction).isFrozen()) {
					trans = await(transaction as Transaction).freezeWithSigner(
						this.signer,
					);
				}
				return await trans.executeWithSigner(this.signer);
			} else {
				const signedT = await trans.freezeWithSigner(this.signer);
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

	async getAccountInfo(): Promise<AccountInfo> {
		return await this.hashConnectSigner.getAccountInfo() as unknown as AccountInfo;
	}
}
