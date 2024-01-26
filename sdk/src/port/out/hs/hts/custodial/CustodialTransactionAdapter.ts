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

import {HederaTransactionAdapter} from '../../HederaTransactionAdapter';
import {Client, Transaction} from "@hashgraph/sdk";
import {CustodialWalletService, SignatureRequest} from "@hashgraph/hedera-custodians-integration";
import DfnsSettings from "../../../../../domain/context/custodialwalletsettings/DfnsSettings";
import FireblocksSettings from "../../../../../domain/context/custodialwalletsettings/FireblocksSettings";
import Account from "../../../../../domain/context/account/Account";
import {InitializationData} from "../../../TransactionAdapter";
import {lazyInject} from "../../../../../core/decorator/LazyInjectDecorator";
import EventService from "../../../../../app/service/event/EventService";
import {MirrorNodeAdapter} from "../../../mirror/MirrorNodeAdapter";
import NetworkService from "../../../../../app/service/NetworkService";
import {Environment} from "../../../../../domain/context/network/Environment";
import {TransactionType} from "../../../TransactionResponseEnums";
import TransactionResponse from "../../../../../domain/context/transaction/TransactionResponse";
import LogService from "../../../../../app/service/LogService";
import {TransactionResponse as HTransactionResponse} from "@hashgraph/sdk/lib/exports";
import {HTSTransactionResponseAdapter} from "../HTSTransactionResponseAdapter";
import {SigningError} from "../../error/SigningError";
import {SupportedWallets} from "../../../../../domain/context/network/Wallet";
import {WalletPairedEvent} from "../../../../../app/service/event/WalletEvent";

export abstract class CustodialTransactionAdapter extends HederaTransactionAdapter {
	protected client: Client;
	protected custodialWalletService: CustodialWalletService;
	public account: Account;
	protected network: Environment;

	constructor(
		@lazyInject(EventService) public readonly eventService: EventService,
		@lazyInject(MirrorNodeAdapter) public readonly mirrorNodeAdapter: MirrorNodeAdapter,
		@lazyInject(NetworkService) public readonly networkService: NetworkService,
	) {
		super(mirrorNodeAdapter, networkService);
	}

	protected initClient(accountId: string, publicKey: string): void {
		const currentNetwork = this.networkService.environment;
		switch (currentNetwork) {
			case 'testnet':
				this.client = Client.forTestnet();
				break;
			case 'mainnet':
				this.client = Client.forMainnet();
				break;
			default:
				throw new Error('Network not supported');
		}
		this.client.setOperatorWith(accountId, publicKey, this.signingService);
	}

	protected signingService = async (message: Uint8Array): Promise<Uint8Array> => {
		const signatureRequest = new SignatureRequest(message);
		return await this.custodialWalletService.signTransaction(signatureRequest);
	};

	public abstract register(settings: DfnsSettings | FireblocksSettings): Promise<InitializationData>;

	public signAndSendTransaction = async (
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse> => {
		try {
			LogService.logTrace('Custodial wallet signing and sending transaction:', nameFunction,);

			const tr: HTransactionResponse = await t.execute(this.client);
			this.logTransaction(tr.transactionId.toString(), this.networkService.environment,);

			return HTSTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				tr,
				transactionType,
				this.client,
				nameFunction,
				abi,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(error);
		}
	}

	protected createWalletPairedEvent(wallet: SupportedWallets): WalletPairedEvent {
		return {
			wallet: wallet,
			data: {
				account: this.account,
				pairing: '',
				topic: '',
			},
			network: {
				name: this.networkService.environment,
				recognized: true,
				factoryId: this.networkService.configuration?.factoryAddress ?? '',
			},
		};
	}

	public getAccount(): Account {
		return this.account;
	}
}
