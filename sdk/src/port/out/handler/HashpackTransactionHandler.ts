import { Transaction, Signer, PublicKey as HPublicKey } from '@hashgraph/sdk';
import { singleton } from 'tsyringe';
import { HederaTransactionHandler } from './HederaTransactionHandler.js';
import { HashConnect } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import { HashConnectSigner } from 'hashconnect/provider/signer';
import { NetworkType } from 'hashconnect/types';
import { SigningError } from './error/SigningError.js';
import Account from '../../../domain/context/account/Account.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import { HashpackTransactionResponseHandler } from './response/HashpackTransactionResponseHandler.js';
import { TransactionType } from './response/TransactionResponseEnums.js';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { Injectable } from '../../../core/Injectable.js';

@singleton()
export class HashpackTransactionHandler extends HederaTransactionHandler {
	private hc: HashConnect;
	public account: Account;
	public topic: string;
	public provider: HashConnectProvider;
	public signer: Signer;
	public hashConnectSigner: HashConnectSigner;

	constructor() {
		super();
		this.hc = new HashConnect();
	}

	register(): boolean {
		return !!Injectable.registerTransactionHandler(this);
	}
	stop(): Promise<boolean> {
		return Promise.resolve(!!Injectable.disposeTransactionHandler(this));
	}

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse> {
		if (!this.signer) throw new SigningError('Signer is empty');
		try {
			await this.getAccountKey(); // Ensure we have the public key
			let signedT = t;
			if (!t.isFrozen()) {
				signedT = await t.freezeWithSigner(this.signer);
			}
			const trx = await this.signer.signTransaction(signedT);
			const HashPackTransactionResponse = await this.hc.sendTransaction(
				this.topic,
				{
					topic: this.topic,
					byteArray: trx.toBytes(),
					metadata: {
						accountToSign: this.signer.getAccountId().toString(),
						returnTransaction: false,
						getRecord: true,
					},
				},
			);

			return HashpackTransactionResponseHandler.manageResponse(
				HashPackTransactionResponse,
				transactionType,
				nameFunction,
				abi,
			);
		} catch (error) {
			throw new SigningError(error);
		}
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

	getAccount(): string {
		if (this.account.id) return this.account.id.value;
		return '';
	}
}
