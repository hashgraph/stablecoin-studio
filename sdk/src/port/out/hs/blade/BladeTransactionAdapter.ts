/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	BladeConnector,
	ConnectorStrategy,
	HederaNetwork,
} from '@bladelabs/blade-web3.js';
import {
	Signer,
	TokenAssociateTransaction,
	TokenBurnTransaction,
	TokenCreateTransaction,
	TokenDeleteTransaction,
	TokenFeeScheduleUpdateTransaction,
	TokenFreezeTransaction,
	TokenGrantKycTransaction,
	TokenMintTransaction,
	TokenPauseTransaction,
	TokenRevokeKycTransaction,
	TokenUnfreezeTransaction,
	TokenUnpauseTransaction,
	TokenWipeTransaction,
	Transaction,
	TransferTransaction,
} from '@hashgraph/sdk';
import { singleton } from 'tsyringe';
import LogService from '../../../../app/service/LogService.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import EventService from '../../../../app/service/event/EventService.js';
import { WalletEvents } from '../../../../app/service/event/WalletEvent.js';
import Injectable from '../../../../core/Injectable.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { RuntimeError } from '../../../../core/error/RuntimeError.js';
import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { SupportedWallets } from '../../../in/request/ConnectRequest.js';
import { InitializationData } from '../../TransactionAdapter.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import { SigningError } from '../error/SigningError.js';
import { HashpackTransactionResponseAdapter } from '../hashpack/HashpackTransactionResponseAdapter.js';
import PublicKey from '../../../../domain/context/account/PublicKey.js';

@singleton()
export class BladeTransactionAdapter extends HederaTransactionAdapter {
	private bc: BladeConnector;
	public account: Account;

	public signer: Signer | null;

	constructor(
		@lazyInject(EventService)
		public readonly eventService: EventService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	async init(network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;
		this.bc = await BladeConnector.init(
			ConnectorStrategy.EXTENSION, // preferred strategy is optional
			{
				// dApp metadata options are optional, but are highly recommended to use
				name: 'Awesome DApp',
				description: 'DApp description',
				url: 'https://awesome-dapp.io/',
				icons: ['some-image-url.png'],
			},
		);
		LogService.logTrace('Checking for previously saved pairings: ');
		const params = {
			network: HederaNetwork.Testnet,
			dAppCode: 'SomeAwesomeDApp', // optional while testing, request specific one by contacting us
		};

		const pairedAccountIds = await this.bc.createSession(params);

		const bladeSigner = this.bc.getSigner();
		const accountInfo = await bladeSigner?.getAccountInfo();

		if (accountInfo && accountInfo.accountId) {
			const accountId = accountInfo?.accountId.toString();

			if (accountId) {
				const publicKey =
					accountInfo.key.toString().length > 64
						? accountInfo.key.toString().slice(-64)
						: accountInfo.key.toString();
				this.account = new Account({
					id: accountId!,
					publicKey: new PublicKey(publicKey),
				});
			}
		}

		this.setSigner(currentNetwork);
		this.eventService.emit(WalletEvents.walletFound, {
			wallet: SupportedWallets.BLADE,
			name: SupportedWallets.BLADE,
		});
		const iniData: InitializationData = {
			account: this.account,
		};
		this.eventService.emit(WalletEvents.walletPaired, {
			data: iniData,
			network: {
				name: currentNetwork,
				recognized: true,
				factoryId: this.networkService.configuration
					? this.networkService.configuration.factoryAddress
					: '',
			},
			wallet: SupportedWallets.BLADE,
		});
		LogService.logTrace('Previous paring found: ', this.account);

		return currentNetwork;
	}

	private async setSigner(network: string): Promise<void> {
		this.signer = this.bc.getSigner();
	}

	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('Blade Registered as handler');
		this.init();

		return Promise.resolve({
			account: this.account,
		});
	}

	async stop(): Promise<boolean> {
		if (this.bc) await this.bc.killSession();

		LogService.logTrace('Blade stopped');
		/*this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.BLADE,
		});*/
		return Promise.resolve(true);
	}

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse> {
		if (!this.signer) throw new SigningError('Signer is empty');
		try {
			LogService.logTrace(
				'Blade is singing and sending transaction:',
				nameFunction,
				t,
			);

			let signedT = t;
			if (!t.isFrozen()) {
				signedT = await t.freezeWithSigner(this.signer);
			}
			const trx = await this.signer.signTransaction(signedT);
			const hashPackTrx = {
				//topic: this.initData.topic,
				byteArray: trx.toBytes(),
				metadata: {
					accountToSign: this.account.id.toString(),
					returnTransaction: false,
					getRecord: true,
				},
			};
			let hashPackTransactionResponse;
			if (
				t instanceof TokenCreateTransaction ||
				t instanceof TokenWipeTransaction ||
				t instanceof TokenBurnTransaction ||
				t instanceof TokenMintTransaction ||
				t instanceof TokenPauseTransaction ||
				t instanceof TokenUnpauseTransaction ||
				t instanceof TokenDeleteTransaction ||
				t instanceof TokenFreezeTransaction ||
				t instanceof TokenUnfreezeTransaction ||
				t instanceof TokenGrantKycTransaction ||
				t instanceof TokenRevokeKycTransaction ||
				t instanceof TransferTransaction ||
				t instanceof TokenFeeScheduleUpdateTransaction ||
				t instanceof TokenAssociateTransaction
			) {
				hashPackTransactionResponse = await t.executeWithSigner(
					this.signer,
				);
				/*this.logTransaction(
					JSON.parse(
						JSON.stringify(hashPackTransactionResponse),
					).response.transactionId.toString(),
					this.networkService.environment,
				);*/
			} else {
				hashPackTransactionResponse = await this.signer.call(trx);
				/*this.logTransaction(
					hashPackTransactionResponse
						? (hashPackTransactionResponse as any).transactionId ??
								''
						: (hashPackTransactionResponse as any).transactionId ??
								'',
					this.networkService.environment,
				);*/
			}
			return HashpackTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				this.signer,
				hashPackTransactionResponse,
				transactionType,
				nameFunction,
				abi,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(error);
		}
	}
	public async restart(network: string): Promise<void> {
		await this.stop();
		//await this.init(network);
	}

	getAccount(): Account {
		if (this.account) return this.account;
		throw new RuntimeError(
			'There are no accounts currently paired with HashPack!',
		);
	}
}
