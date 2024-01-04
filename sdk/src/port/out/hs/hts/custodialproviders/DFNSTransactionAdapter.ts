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

import { Client, Transaction } from '@hashgraph/sdk';
import TransactionResponse from 'domain/context/transaction/TransactionResponse';
import { TransactionType } from 'port/out/TransactionResponseEnums';
import { HederaTransactionAdapter } from '../../HederaTransactionAdapter';
import {
	CustodialWalletService,
	DFNSConfig,
	SignatureRequest,
} from 'custodialwalletutils/build/cjs/src';
import { Environment } from '../../../../../domain/context/network/Environment';
import { singleton } from 'tsyringe';
import fs from 'fs';
import path from 'path';
import LogService from '../../../../../app/service/LogService';
import { TransactionResponse as HTransactionResponse } from '@hashgraph/sdk/lib/exports';
import { HTSTransactionResponseAdapter } from '../../hts/HTSTransactionResponseAdapter';
import { SigningError } from '../../error/SigningError';
import { InitializationData } from '../../../TransactionAdapter';
import Injectable from '../../../../../core/Injectable';
import {
	WalletEvents,
	WalletPairedEvent,
} from '../../../../../app/service/event/WalletEvent';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet';
import { lazyInject } from '../../../../../core/decorator/LazyInjectDecorator';
import EventService from '../../../../../app/service/event/EventService';
import { MirrorNodeAdapter } from '../../../mirror/MirrorNodeAdapter';
import NetworkService from '../../../../../app/service/NetworkService';
import Account, {
	AccountProps,
} from '../../../../../domain/context/account/Account';

//------------------  dfns  ------------------//
const serviceAccountSecretKey = '';
// const serviceAccountSecretKey = fs.readFileSync(
// 	path.resolve('/home/mario/Documents/dfns-secret.key'),
// 	'utf8',
// );
const dfnsWalletId = 'wa-6qfr0-heg0c-985bmvv9hphbok47'; // Wallet EdDSA
const dfnsTestUrl = 'https://api.dfns.ninja';
const dfnsAppId = 'ap-b6uj2-95t58-55o0cprm1lqqkpn';
const dfnsAppOrigin = 'http://stablecoin.es';
const dfnsEcdsaServiceAccountAuthToken =
	'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJhdXRoLmRmbnMubmluamEiLCJhdWQiOiJkZm5zOmF1dGg6dXNlciIsInN1YiI6Im9yLTZsOTI3LXVnNnAzLThrbXFtYzRwbjlhYjdmY24iLCJqdGkiOiJ1ai03amNsYS03OWZxMC05cGxxbzk1aGl0YjRkZm9nIiwic2NvcGUiOiIiLCJwZXJtaXNzaW9ucyI6W10sImh0dHBzOi8vY3VzdG9tL3VzZXJuYW1lIjoiIiwiaHR0cHM6Ly9jdXN0b20vYXBwX21ldGFkYXRhIjp7InVzZXJJZCI6InRvLW1wNWkyLTAxYjI4LXRiYW9kZ3JlZW5iaDRldCIsIm9yZ0lkIjoib3ItNmw5MjctdWc2cDMtOGttcW1jNHBuOWFiN2ZjbiIsInRva2VuS2luZCI6IlNlcnZpY2VBY2NvdW50In0sImlhdCI6MTY5Mjk1MDA2MywiZXhwIjoxNzU2MDIyMDYzfQ.LypKM9xoSUCz1jafHth3gUoGKH2KiJRQVYioQUvLeznNX4W1jW1EFMQnEteyvYcwXX5zkm5JtEbYIR_kEpkF3Zsqs2J-nE_U_oRPd0jNdDFZmANCydJUZE2pNYSvWuBXb4M4WE5xyPVb3Jty8eTVcMTLHxnHeo5dgcas4bGvO8qhYClzKi24Vyx5p2MIkZOe9J43hq-yvnZqkEWUeLLyAza2hjLntbI7x2B9JVwAsf3SPaxriSUnTZmjrOArj_qWZ9UYQLqo8y6ntRCSxgH-tGs3G56kmfgncTwSI_6lieu8CRUcJDiJPuNbWcC2Ukaebwbx10iaBNm6x_M7smVmUg';
const dfnsEcdsaServiceaccountCredentialId =
	'Y2ktM2ZvNGotOWpwZWEtOG84b3Y2MmQyNjlzZ2oxYQ';
//------------------  end dfns  ------------------//
const dfnsAccountId = '0.0.4480877';
const dfnsPublicKey =
	'94ac3f274e59cb947c4685d16cfa2d8a5d055984f43a70e1c62d986a47477061';

@singleton()
export class DFNSTransactionAdapter extends HederaTransactionAdapter {
	private _client: Client;
	private custodialWalletService: CustodialWalletService;
	public network: Environment;
	public account: Account;
	private dfnsConfig: DFNSConfig;

	constructor(
		@lazyInject(EventService) public readonly eventService: EventService,
		@lazyInject(MirrorNodeAdapter)
		public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService)
		public readonly networkService: NetworkService, //private fireblocksConfig?: FireblocksConfig, //private dfnsConfig?: DFNSConfig,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: SupportedWallets.DFNS,
			initData: {},
		});
		LogService.logTrace('Client Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	async register(): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);
		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(
			dfnsAccountId,
		);
		this.initClient();
		this.initCustodialWalletService();
		const publicKey = accountMirror.publicKey;
		const accountProps: AccountProps = {
			id: dfnsAccountId,
			publicKey: publicKey,
		};
		this.account = new Account(accountProps);
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
		LogService.logTrace('Client registered as handler: ', eventData);
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
				'[DFNS] Signing and sending transaction:',
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

	private initClient(): void {
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
		this._client.setOperatorWith(
			dfnsAccountId,
			dfnsPublicKey,
			this.signingService,
		);
	}

	private signingService = async (
		message: Uint8Array,
	): Promise<Uint8Array> => {
		const signatureRequest = new SignatureRequest(message);
		return await this.custodialWalletService.signTransaction(
			signatureRequest,
		);
	};

	private initCustodialWalletService(): void {
		//DELETE
		this.dfnsConfig = new DFNSConfig(
			serviceAccountSecretKey,
			dfnsEcdsaServiceaccountCredentialId,
			dfnsEcdsaServiceAccountAuthToken,
			dfnsAppOrigin,
			dfnsAppId,
			dfnsTestUrl,
			dfnsWalletId,
		);
		if (this.dfnsConfig) {
			this.custodialWalletService = new CustodialWalletService(
				this.dfnsConfig,
			);
		} else {
			throw new Error(
				'No custodial wallet service configuration provided',
			);
		}
	}

	getAccount(): Account {
		return this.account;
	}
}
