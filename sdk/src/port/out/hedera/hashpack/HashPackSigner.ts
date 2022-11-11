import { ISigner } from '../sign/ISigner';
import {
	Transaction,
	Signer,
	TransactionResponse,
	ContractCreateFlow,
	ContractExecuteTransaction,
	PublicKey as HPublicKey,
	TokenCreateTransaction,
	TokenMintTransaction,
	TokenBurnTransaction,
	TokenWipeTransaction,
} from '@hashgraph/sdk';
import { HashConnect, MessageTypes } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import HashPackAccount from '../../../../domain/context/account/HashPackAccount.js';
import { getHederaNetwork, HederaNetwork } from '../../../../core/enum.js';
import { HashConnectSigner } from 'hashconnect/provider/signer';
import { NetworkType } from 'hashconnect/types';
import { SigningError } from '../error/SigningError.js';

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
			| ContractCreateFlow
			| TokenCreateTransaction
			| TokenWipeTransaction
			| TokenMintTransaction
			| TokenBurnTransaction,
	): Promise<TransactionResponse | MessageTypes.TransactionResponse> {
		if (this.signer) {
			try {
				await this.getAccountKey(); // Ensure we have the public key
				if (transaction instanceof ContractCreateFlow) {
					try {
						return await transaction.executeWithSigner(this.signer);
					} catch (err) {
						console.error(err);
						throw err;
					}
				} else if (
					transaction instanceof TokenCreateTransaction ||
					transaction instanceof TokenWipeTransaction ||
					transaction instanceof TokenBurnTransaction ||
					transaction instanceof TokenMintTransaction
				) {
					let t = await transaction.freezeWithSigner(this.signer);
					t = await transaction.signWithSigner(this.signer);
					return await t.executeWithSigner(this.signer);
				} else if (transaction instanceof Transaction) {
					let signedT = transaction;
					if (!transaction.isFrozen()) {
						signedT = await transaction.freezeWithSigner(
							this.signer,
						);
					}
					const t = await this.signer.signTransaction(signedT);
					return await this.hc.sendTransaction(this.topic, {
						topic: this.topic,
						byteArray: t.toBytes(),
						metadata: {
							accountToSign: this.signer
								.getAccountId()
								.toString(),
							returnTransaction: false,
							getRecord: true,
						},
					});
				}
			} catch (error) {
				throw new SigningError(error);
			}
		}
		throw new SigningError('Signer is empty');
	}

	async getAccountKey(): Promise<HPublicKey> {
		if (this.hashConnectSigner.getAccountKey) {
			return this.hashConnectSigner.getAccountKey();
		}
		this.hashConnectSigner = await this.hc.getSignerWithAccountKey(
			this.provider,
		);
		this.signer = this.hashConnectSigner as unknown as Signer;
		if (this.hashConnectSigner.getAccountKey) {
			return this.hashConnectSigner.getAccountKey();
		} else {
			throw new SigningError('Public key is empty');
		}
	}
}
