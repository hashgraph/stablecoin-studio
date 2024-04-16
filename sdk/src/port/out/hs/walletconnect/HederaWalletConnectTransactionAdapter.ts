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

import { HederaTransactionAdapter } from '../HederaTransactionAdapter';
import { TransactionType } from '../../TransactionResponseEnums';
import { LedgerId, Transaction } from '@hashgraph/sdk';
import Account from '../../../../domain/context/account/Account';
import { Environment } from '../../../../domain/context/network/Environment';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator';
import EventService from '../../../../app/service/event/EventService';
import NetworkService from '../../../../app/service/NetworkService';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter';
import { BackendAdapter } from '../../backend/BackendAdapter';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent';
import { SupportedWallets } from '../../../../domain/context/network/Wallet';
import LogService from '../../../../app/service/LogService';
import { InitializationData } from '../../TransactionAdapter';
import Injectable from '../../../../core/Injectable';
import { SignClientTypes } from '@walletconnect/types';
import { DAppConnector } from '@hashgraph/hedera-wallet-connect';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { singleton } from 'tsyringe';
import { QueryBus } from '../../../../core/query/QueryBus';
import { NetworkName } from '@hashgraph/sdk/lib/client/Client';
import { HederaId } from '../../../../domain/context/shared/HederaId.js';

@singleton()
export class HederaWalletConnectTransactionAdapter extends HederaTransactionAdapter {
	public account: Account;
	protected network: Environment;
	protected dAppConnector: DAppConnector | undefined;

	constructor(
		@lazyInject(EventService)
		public readonly eventService: EventService,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(QueryBus)
		public readonly queryBus: QueryBus,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	async init(network?: NetworkName): Promise<string> {
		// TODO: to ENV file ⬇️
		const projectId = 'e8847fc2148698b9d2006253eb1c631a';
		const metadata: SignClientTypes.Metadata = {
			name: 'name',
			description: 'description',
			url: 'https://78a6-139-47-73-174.ngrok-free.app/',
			icons: ['icons'],
		};
		// TODO: END to ENV file ⬆️
		network = network || 'mainnet';
		const hwcNetwork =
			network === 'testnet'
				? LedgerId.TESTNET
				: network === 'previewnet'
				? LedgerId.PREVIEWNET
				: LedgerId.MAINNET;
		const eventData = {
			wallet: SupportedWallets.HWALLETCONNECT,
			initData: {},
		};
		// Create dApp Connector instance
		this.dAppConnector = new DAppConnector(metadata, hwcNetwork, projectId);
		await this.dAppConnector.init({ logger: 'debug' });
		LogService.logTrace(this.dAppConnector);

		try {
			//await this.dAppConnector.openModal();
		} catch (e) {
			console.log('❌ open modal error: ', e);
		}

		this.eventService.emit(WalletEvents.walletInit, eventData);
		LogService.logInfo('✅ HederaWalletConnect Initialized.');
		LogService.logTrace(
			`HederaWalletConnect Initialized with account: ${this.account} and network: ${network}`,
		);
		return network;
	}

	// TODO: review
	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('WalletConnect Registered as handler');

		await this.dAppConnector?.connectQR();

		const walletConnectSigners = this.dAppConnector?.signers;

		if (!walletConnectSigners) {
			window.alert('no signers');
			throw new Error();
		}

		const accountId = walletConnectSigners[0].getAccountId().toString();
		window.alert(accountId);

		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			accountId,
		);

		window.alert(JSON.stringify(accountMirror));

		this.account.id = new HederaId(accountId);
		window.alert(JSON.stringify(this.account.id));

		this.account.publicKey = accountMirror.publicKey;
		window.alert(JSON.stringify(this.account.publicKey));

		this.network = this.networkService.environment;
		window.alert(this.network);

		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.HWALLETCONNECT,
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
		LogService.logTrace('WalletConnect registered as handler: ', eventData);
		return Promise.resolve({
			account: this.getAccount(),
		});
	}

	// async function hedera_signAndExecuteTransaction(_: Event) {
	// 	const transaction = new TransferTransaction()
	// 		.setTransactionId(TransactionId.generate(getState('sign-send-from')))
	// 		.addHbarTransfer(getState('sign-send-from'), new Hbar(-getState('sign-send-amount')))
	// 		.addHbarTransfer(getState('sign-send-to'), new Hbar(+getState('sign-send-amount')))
	//
	// 	const params: SignAndExecuteTransactionParams = {
	// 		transactionList: transactionToBase64String(transaction),
	// 		signerAccountId: 'hedera:testnet:' + getState('sign-send-from'),
	// 	}
	//
	// 	console.log(params)
	//
	// 	return await dAppConnector!.signAndExecuteTransaction(params)
	// }

	async signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string | undefined,
		abi?: any[] | undefined,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}

	getAccount(): Account {
		return this.account;
	}
	sign(message: string | Transaction): Promise<string> {
		throw new Error('Method not implemented.');
	}
}
