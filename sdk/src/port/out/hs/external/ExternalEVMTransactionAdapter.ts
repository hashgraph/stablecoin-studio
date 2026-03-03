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

import { Transaction, ContractExecuteTransaction } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import { singleton } from 'tsyringe';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import { BaseHederaTransactionAdapter } from '../BaseHederaTransactionAdapter.js';
import TransactionResponse, {
	TransactionMetadata,
} from '../../../../domain/context/transaction/TransactionResponse.js';
import { SupportedWallets } from '../../../../domain/context/network/Wallet.js';
import { TransactionType } from '../../TransactionResponseEnums.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import Account from '../../../../domain/context/account/Account.js';
import { InitializationData } from '../../TransactionAdapter.js';
import Injectable from '../../../../core/Injectable.js';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../app/service/event/WalletEvent.js';
import LogService from '../../../../app/service/LogService.js';
import EventService from '../../../../app/service/event/EventService.js';

const HEDERA_CHAIN_IDS: Record<string, number> = {
	mainnet: 295,
	testnet: 296,
	previewnet: 297,
};

@singleton()
export class ExternalEVMTransactionAdapter extends BaseHederaTransactionAdapter {
	public account: Account;

	constructor(
		@lazyInject(EventService)
		public readonly eventService: EventService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService,
	) {
		super();
	}

	public setExternalWalletSettings(_offsetMinutes = 0): void {
		// EVM transactions don't use Hedera TransactionId validity window
	}

	public async processTransaction(
		tx: Transaction,
		_transactionType: TransactionType,
		_startDate?: string,
	): Promise<TransactionResponse> {
		if (!(tx instanceof ContractExecuteTransaction)) {
			return new TransactionResponse(
				undefined,
				undefined,
				new Error(
					`ExternalEVMTransactionAdapter only supports ContractExecuteTransaction. ` +
						`Received: ${tx.constructor.name}. ` +
						`Use ExternalHederaTransactionAdapter for native HTS operations.`,
				),
			);
		}
		return this.serializeEvmTransaction(tx);
	}

	private async serializeEvmTransaction(
		tx: ContractExecuteTransaction,
	): Promise<TransactionResponse> {
		try {
			const contractId = tx.contractId;
			if (!contractId) throw new Error('Contract ID is missing');
			if (!tx.functionParameters)
				throw new Error('Function parameters are missing');

			const contractInfo =
				await this.mirrorNodeAdapter.getContractInfo(
					contractId.toString(),
				);
			if (!contractInfo.evmAddress) {
				throw new Error(
					`EVM address not found for contract ${contractId}`,
				);
			}

			const chainId =
				HEDERA_CHAIN_IDS[this.networkService.environment] ?? 296;

			const evmTx = {
				to: contractInfo.evmAddress,
				data:
					'0x' +
					Buffer.from(tx.functionParameters).toString('hex'),
				value: tx.payableAmount
					? ethers.parseEther(tx.payableAmount.toString())
					: 0n,
				gasLimit: tx.gas?.toNumber() ?? 1_000_000,
				chainId,
			};

			const serializedBytes =
				ethers.Transaction.from(evmTx).unsignedSerialized;

			const metadata: TransactionMetadata = {
				transactionType: 'EVM Contract Call',
				description: `Contract call to ${contractInfo.evmAddress}`,
				requiredSigners: [this.account.id.toString()],
			};

			return new TransactionResponse(
				undefined,
				undefined,
				undefined,
				{
					serializedTransaction: serializedBytes,
					metadata,
				},
			);
		} catch (error) {
			return new TransactionResponse(
				undefined,
				undefined,
				error as Error,
			);
		}
	}

	public getAccount(): Account {
		return this.account;
	}

	public supportsEvmOperations(): boolean {
		return true;
	}

	public getNetworkService(): NetworkService {
		return this.networkService;
	}

	public getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.mirrorNodeAdapter;
	}

	public getSupportedWallet(): SupportedWallets {
		return SupportedWallets.EXTERNAL_EVM;
	}

	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: SupportedWallets.EXTERNAL_EVM,
			initData: {},
		});
		LogService.logTrace('ExternalEVMTransactionAdapter Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	async register(account: Account): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);

		LogService.logTrace('ExternalEVMTransactionAdapter: Getting account info for', account.id.toString());
		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			account.id,
		);
		LogService.logTrace('ExternalEVMTransactionAdapter: accountMirror =', accountMirror);

		this.account = account;
		this.account.publicKey = accountMirror.publicKey;
		this.account.evmAddress = accountMirror.accountEvmAddress;

		LogService.logTrace(
			'ExternalEVMTransactionAdapter: Account evmAddress set to: ',
			this.account.evmAddress,
		);

		const eventData: WalletPairedEvent = {
			wallet: SupportedWallets.EXTERNAL_EVM,
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
		LogService.logTrace(
			'ExternalEVMTransactionAdapter registered as handler: ',
			eventData,
		);
		return Promise.resolve({
			account: this.getAccount(),
		});
	}

	stop(): Promise<boolean> {
		LogService.logTrace('ExternalEVMTransactionAdapter stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.EXTERNAL_EVM,
		});
		return Promise.resolve(true);
	}
}
