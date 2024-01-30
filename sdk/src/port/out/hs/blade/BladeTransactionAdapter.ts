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
import LogService from '../../../../app/service/LogService';
import NetworkService from '../../../../app/service/NetworkService';
import EventService from '../../../../app/service/event/EventService';
import { WalletEvents } from '../../../../app/service/event/WalletEvent';
import Injectable from '../../../../core/Injectable';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator';
import { RuntimeError } from '../../../../core/error/RuntimeError';
import Account from '../../../../domain/context/account/Account';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse';
import { SupportedWallets } from '../../../in/request/ConnectRequest';
import { InitializationData } from '../../TransactionAdapter';
import { TransactionType } from '../../TransactionResponseEnums';
import { HederaId } from '../../../../domain/context/shared/HederaId';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter';
import { SigningError } from '../error/SigningError';
import { HashpackTransactionResponseAdapter } from '../hashpack/HashpackTransactionResponseAdapter';
import { QueryBus } from '../../../../core/query/QueryBus';
import { AccountIdNotValid } from '../../../../domain/context/account/error/AccountIdNotValid';
import { GetAccountInfoQuery } from '../../../../app/usecase/query/account/info/GetAccountInfoQuery';

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

	private async setSigner(): Promise<void> {
		this.signer = this.bc.getSigner();
	}

	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('Blade Registered as handler');
		this.connectBlade(true);

		return Promise.resolve({
			account: this.account,
		});
	}

	async connectBlade(pair = true, network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;
		try {
			this.bc = await BladeConnector.init(
				ConnectorStrategy.EXTENSION, // preferred strategy is optional
				{
					// dApp metadata options are optional, but are highly recommended to use
					name: 'Stablecoin Studio',
					description:
						'Stablecoin Studio is an open-source SDK that makes it easy for web3 stablecoin platforms, institutional issuers, enterprises, and payment providers to build stablecoin applications on the Hedera network.',
					url: 'https://hedera.com/stablecoin-studio',
					icons: [],
				},
			);
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
			const params = {
				network: bladeNetwork,
				dAppCode: 'SomeAwesomeDApp', // optional while testing, request specific one by contacting us
			};

			const pairedAccountIds = await this.bc.createSession(params);
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
		if (this.bc) await this.bc.killSession();

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
			'There are no accounts currently paired with HashPack!',
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
