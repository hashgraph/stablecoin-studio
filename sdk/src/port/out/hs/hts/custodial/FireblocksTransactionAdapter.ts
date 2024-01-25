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

import {
	CustodialWalletService,
	FireblocksConfig,
	SignatureRequest,
} from '@hashgraph/hedera-custodians-integration';
import { singleton } from 'tsyringe';

import { Client, Transaction } from '@hashgraph/sdk';

import EventService from '../../../../../app/service/event/EventService';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../../app/service/event/WalletEvent';
import LogService from '../../../../../app/service/LogService';
import NetworkService from '../../../../../app/service/NetworkService';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator';
import Injectable from '../../../../../core/Injectable';
import { Environment } from '../../../../../domain/context/network/Environment';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet';
import TransactionResponse from '../../../../../domain/context/transaction/TransactionResponse.js';
import { MirrorNodeAdapter } from '../../../mirror/MirrorNodeAdapter';
import { InitializationData } from '../../../TransactionAdapter';
import { TransactionType } from '../../../TransactionResponseEnums';
import { SigningError } from '../../error/SigningError';
import { HederaTransactionAdapter } from '../../HederaTransactionAdapter';
import { TransactionResponse as HTransactionResponse } from '@hashgraph/sdk/lib/exports';
import Account, {
	AccountProps,
} from '../../../../../domain/context/account/Account';
import { HTSTransactionResponseAdapter } from '../HTSTransactionResponseAdapter';
import FireblocksSettings from '../../../../../domain/context/custodialwalletsettings/FireblocksSettings';

@singleton()
export class FireblocksTransactionAdapter extends HederaTransactionAdapter {
	private _client: Client;
	private custodialWalletService: CustodialWalletService;
	public network: Environment;
	public account: Account;

	constructor(
		@lazyInject(EventService) public readonly eventService: EventService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: SupportedWallets.FIREBLOCKS,
			initData: {},
		});
		LogService.logTrace('Fireblocks Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	public get client(): Client {
		return this._client;
	}

	private initClient(accountId: string, publicKey: string): void {
		const currentNetwork = this.networkService.environment;
		switch (currentNetwork) {
			case 'testnet':
				this._client = Client.forTestnet();
				break;
			case 'mainnet':
				this._client = Client.forMainnet();
				break;
			default:
				throw new Error('Network not supported');
		}
		this._client.setOperatorWith(accountId, publicKey, this.signingService);
	}

	private signingService = async (
		message: Uint8Array,
	): Promise<Uint8Array> => {
		const uint8Array = new Uint8Array(message);
		const signatureRequest = new SignatureRequest(uint8Array);
		return await this.custodialWalletService.signTransaction(
			signatureRequest,
		);
	};

	private initCustodialWalletService(
		apiKey: string,
		apiSecretKey: string,
		baseUrl: string,
		vaultAccountId: string,
		assetId: string,
	): void {
		const fireblocksConfig = new FireblocksConfig(
			apiKey,
			apiSecretKey,
			baseUrl,
			vaultAccountId,
			assetId,
		);
		this.custodialWalletService = new CustodialWalletService(
			fireblocksConfig,
		);
	}

	getAccount(): Account {
		return this.account;
	}

	async register(
		fireblocksSettings: FireblocksSettings,
	): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		const accountId = fireblocksSettings.hederaAccountId;
		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			accountId,
		);
		const accountProps: AccountProps = {
			id: accountId,
			publicKey: accountMirror.publicKey,
		};
		this.account = new Account(accountProps);
		this.initCustodialWalletService(
			fireblocksSettings.apiKey,
			fireblocksSettings.apiSecretKey,
			fireblocksSettings.baseUrl,
			fireblocksSettings.vaultAccountId,
			fireblocksSettings.assetId,
		);
		this.initClient(accountId, fireblocksSettings.hederaAccountPublicKey);
		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.FIREBLOCKS,
			data: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			network: {
				name: this.networkService.environment,
				recognized: true,
				factoryId: this.networkService.configuration
					? this.networkService.configuration.factoryAddress
					: '',
			},
		};
		this.eventService.emit(WalletEvents.walletPaired, eventData);
		LogService.logTrace('Fireblocks registered as handler: ', eventData);
		return Promise.resolve({
			account: this.getAccount(),
		});
	}

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse> {
		try {
			LogService.logTrace(
				'Fireblocks signing and sending transaction:',
				nameFunction,
			);

			const tr: HTransactionResponse = await t.execute(this._client);

			this.logTransaction(
				tr.transactionId.toString(),
				this.networkService.environment,
			);

			return HTSTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				tr,
				transactionType,
				this._client,
				nameFunction,
				abi,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(error);
		}
	}
}
