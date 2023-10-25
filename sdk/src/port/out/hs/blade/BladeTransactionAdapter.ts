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
	Transaction,
	Signer,
	PublicKey as HPublicKey,
	TokenBurnTransaction,
	TokenCreateTransaction,
	TokenDeleteTransaction,
	TokenFreezeTransaction,
	TokenMintTransaction,
	TokenPauseTransaction,
	TokenUnfreezeTransaction,
	TokenUnpauseTransaction,
	TokenWipeTransaction,
	TransferTransaction,
	TokenRevokeKycTransaction,
	TokenGrantKycTransaction,
	TokenFeeScheduleUpdateTransaction,
	TokenAssociateTransaction,
} from '@hashgraph/sdk';
import { singleton } from 'tsyringe';
import { HederaTransactionAdapter } from '../HederaTransactionAdapter.js';

import Account from '../../../../domain/context/account/Account.js';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import Injectable from '../../../../core/Injectable.js';
import { SigningError } from '../error/SigningError.js';

import { TransactionType } from '../../TransactionResponseEnums.js';
import LogService from '../../../../app/service/LogService.js';
import EventService from '../../../../app/service/event/EventService.js';
import { PairingError } from '../hashpack/error/PairingError.js';
import { InitializationData } from '../../TransactionAdapter.js';
import { lazyInject } from '../../../../core/decorator/LazyInjectDecorator.js';
import NetworkService from '../../../../app/service/NetworkService.js';
import { RuntimeError } from '../../../../core/error/RuntimeError.js';
import {
	WalletEvents,
} from '../../../../app/service/event/WalletEvent.js';
import { SupportedWallets } from '../../../in/Network.js'; 
import { MirrorNodeAdapter } from '../../mirror/MirrorNodeAdapter.js';
import { HederaId } from '../../../../domain/context/shared/HederaId.js';
import { QueryBus } from '../../../../core/query/QueryBus.js';
import { AccountIdNotValid } from '../../../../domain/context/account/error/AccountIdNotValid.js';
import { GetAccountInfoQuery } from '../../../../app/usecase/query/account/info/GetAccountInfoQuery.js';

import {BladeConnector, ConnectorStrategy, HederaNetwork} from '@bladelabs/blade-web3.js';
import { HashpackTransactionResponseAdapter } from '../hashpack/HashpackTransactionResponseAdapter.js';


@singleton()
export class BladeTransactionAdapter extends HederaTransactionAdapter {
	private bc: BladeConnector;
	public account: Account;
	
	public signer: Signer|null;
	private initData: string;
	private availableExtension = false;
	
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

	async init(network?: string): Promise<string> {
		const currentNetwork = network ?? this.networkService.environment;
		this.bc = await BladeConnector.init(
			ConnectorStrategy.WALLET_CONNECT, // preferred strategy is optional 
			{ // dApp metadata options are optional, but are highly recommended to use
			  name: "Awesome DApp",
			  description: "DApp description",
			  url: "https://awesome-dapp.io/",
			  icons: ["some-image-url.png"]
			}
		  );
		LogService.logTrace(
			'Checking for previously saved pairings: ',
		);
		const params = {
			network: HederaNetwork.Testnet,
			dAppCode: "SomeAwesomeDApp" // optional while testing, request specific one by contacting us
		  }
		  
		  const pairedAccountIds = await this.bc.createSession(params);
		  // retrieving the currently active signer to perform all the Hedera operations
		  this.setSigner(currentNetwork);
		  this.eventService.emit(WalletEvents.walletFound, {
			wallet: SupportedWallets.BLADE,
			name: SupportedWallets.BLADE,
		});
		LogService.logTrace(
				'Previous paring found: ',
				this.account,
			);
		
		
		return currentNetwork;
	}

	private async setSigner(network: string): Promise<void> {

		this.signer = this.bc.getSigner()
		
	}

	async register(): Promise<InitializationData> {
		console.log("llego")
		Injectable.registerTransactionHandler(this);
		LogService.logTrace('Blade Registered as handler');
		console.log("llego")
		this.init()
		return Promise.resolve({
			name: SupportedWallets.BLADE,
			account: this.account,
			
			
		});
	}

	
	async stop(): Promise<boolean> {
		if (this.bc)
			await this.bc.killSession();
		
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
				this.logTransaction(
					JSON.parse(
						JSON.stringify(hashPackTransactionResponse),
					).response.transactionId.toString(),
					this.networkService.environment,
				);
			} else {
				hashPackTransactionResponse = await this.signer.call(
					trx,
				);
				this.logTransaction(
					hashPackTransactionResponse
						? (hashPackTransactionResponse as any)
								.transactionId ?? ''
						: (hashPackTransactionResponse as any)
								.transactionId ?? '',
					this.networkService.environment,
				);
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
