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
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
} from '#blade';
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
import { HederaId } from '../../../../domain/context/shared/HederaId.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';
import { SigningError } from '../error/SigningError.js';
import { HashpackTransactionResponseAdapter } from '../hashpack/HashpackTransactionResponseAdapter.js';
import { QueryBus } from '../../../../core/query/QueryBus.js';
import { AccountIdNotValid } from '../../../../domain/context/account/error/AccountIdNotValid.js';
import { GetAccountInfoQuery } from '../../../../app/usecase/query/account/info/GetAccountInfoQuery.js';
import { SDK } from '../../../in';

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
		@lazyInject(QueryBus)
		private readonly queryBus: QueryBus,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	async init(network?: string): Promise<string> {
		const currentNetwork = await this.connectBlade(false, network);
		const eventData = {
			initData: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			wallet: SupportedWallets.BLADE,
		};
		this.eventService.emit(WalletEvents.walletInit, eventData);

		return currentNetwork;
	}

	private setSigner(): void {
		this.signer = this.bc.getSigners()[0];
	}

	private async killSession(): Promise<void> {
		if (!this.bc) return;

		try {
			await this.bc.killSession();
		} catch (e) {
			// ignore
		}
	}

	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('Blade Registered as handler');
		await this.connectBlade(true);

		return Promise.resolve({
			account: this.account,
		});
	}

	async connectBlade(pair = true, network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;
		try {
			this.bc = await BladeConnector.init(ConnectorStrategy.AUTO, {
				...SDK.appMetadata,
				icons: [SDK.appMetadata.icon],
			});
		} catch (error: any) {
			LogService.logTrace('Error initializing Blade', error);
			return currentNetwork;
		}

		LogService.logTrace('Client Initialized');
		this.eventService.emit(WalletEvents.walletFound, {
			wallet: SupportedWallets.BLADE,
			name: SupportedWallets.BLADE,
		});

		if (pair) {
			LogService.logTrace('Checking for previously saved pairings: ');
			const bladeNetwork =
				currentNetwork == 'testnet'
					? HederaNetwork.Testnet
					: HederaNetwork.Mainnet;
			const pairedAccountIds = await this.bc.createSession({
				network: bladeNetwork,
			});

			if (pairedAccountIds) {
				const accountInfo = await this.getAccountInfo(
					pairedAccountIds[0],
				);

				if (accountInfo) {
					this.account = new Account({
						id: pairedAccountIds[0],
						publicKey: accountInfo.publicKey,
					});
				}
			}

			this.setSigner();

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
		}

		return currentNetwork;
	}

	async stop(): Promise<boolean> {
		await this.killSession();

		LogService.logTrace('Blade stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.BLADE,
		});
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
			} else {
				hashPackTransactionResponse = await this.signer.call(trx);
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
		await this.init(network);
	}

	getAccount(): Account {
		if (this.account) return this.account;
		throw new RuntimeError(
			'There are no accounts currently paired with Blade!',
		);
	}

	async getAccountInfo(id: string): Promise<Account> {
		const account = (
			await this.queryBus.execute(
				new GetAccountInfoQuery(HederaId.from(id)),
			)
		).account;
		if (!account.id) throw new AccountIdNotValid(id.toString());
		return new Account({
			id: account.id,
			publicKey: account.publicKey,
			evmAddress: account.accountEvmAddress,
		});
	}
}
