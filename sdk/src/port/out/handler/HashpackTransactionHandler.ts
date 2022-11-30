import { Transaction, TransactionResponse, Signer, PublicKey as HPublicKey } from '@hashgraph/sdk';
import { HederaTransactionHandler } from './HederaTransactionHandler.js';
import { HashConnect, MessageTypes } from 'hashconnect';
import { HashConnectProvider } from 'hashconnect/provider/provider';
import { HashConnectSigner } from 'hashconnect/provider/signer';
import { NetworkType } from 'hashconnect/types';
import { SigningError } from './error/SigningError.js';
import Account from '../../../domain/context/account/Account.js';
import Network from '../../../domain/context/network/Network.js';
import { HashpackTransactionResponseHandler } from './response/HashpackTransactionResponseHandler.js';
import { TransactionType } from './response/TransactionResponseEnums.js';


export class HashpackTransactionHandler extends HederaTransactionHandler{
    private hc: HashConnect;
	public account: Account;
	public topic: string;
	public provider: HashConnectProvider;
	public signer: Signer;
	public hashConnectSigner: HashConnectSigner;

	constructor(
		hc: HashConnect,
		account: Account,
		network: Network,
		topic: string,
	) {
        super();
		this.hc = hc;
		this.account = account;
		this.topic = topic;
		this.provider = this.hc.getProvider(
			network.environment as NetworkType,
			topic,
			account.id,
		);
		this.hashConnectSigner = this.hc.getSigner(this.provider);
		this.signer = this.hashConnectSigner as unknown as Signer;
	}


    async signAndSendTransaction(t: Transaction): Promise<TransactionResponse> {
		if (this.signer) {
			try {
				await this.getAccountKey(); // Ensure we have the public key
                let signedT = t;
                if (!t.isFrozen()) {
                    signedT = await t.freezeWithSigner(
                        this.signer,
                    );
                }
                const trx = await this.signer.signTransaction(signedT);
                const HashPackTransactionResponse = await this.hc.sendTransaction(this.topic, {
                    topic: this.topic,
                    byteArray: trx.toBytes(),
                    metadata: {
                        accountToSign: this.signer
                            .getAccountId()
                            .toString(),
                        returnTransaction: false,
                        getRecord: true,
                    },
                });

				return HashpackTransactionResponseHandler.manageResponse(
					HashPackTransactionResponse, 
					TransactionType.RECEIPT);

            }
			catch (error) {
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
    
	getAccount(): string{ return ""}
}