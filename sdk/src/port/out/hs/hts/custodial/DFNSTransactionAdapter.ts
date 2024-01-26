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

import {CustodialWalletService, DFNSConfig,} from '@hashgraph/hedera-custodians-integration';
import {singleton} from 'tsyringe';
import LogService from '../../../../../app/service/LogService';
import {InitializationData} from '../../../TransactionAdapter';
import Injectable from '../../../../../core/Injectable';
import {WalletEvents,} from '../../../../../app/service/event/WalletEvent';
import {SupportedWallets} from '../../../../../domain/context/network/Wallet';
import Account from '../../../../../domain/context/account/Account';
import DfnsSettings from '../../../../../domain/context/custodialwalletsettings/DfnsSettings';
import {CustodialTransactionAdapter} from "./CustodialTransactionAdapter";

@singleton()
export class DFNSTransactionAdapter extends CustodialTransactionAdapter {

	init(): Promise<string> {
		this.eventService.emit(WalletEvents.walletInit, {
			wallet: SupportedWallets.DFNS,
			initData: {},
		});
		LogService.logTrace('DFNS Initialized');
		return Promise.resolve(this.networkService.environment);
	}

	private initCustodialWalletService(settings: DfnsSettings): void {
		this.custodialWalletService = new CustodialWalletService(
			new DFNSConfig(
				settings.serviceAccountSecretKey,
				settings.serviceAccountCredentialId,
				settings.serviceAccountAuthToken,
				settings.appOrigin,
				settings.appId,
				settings.baseUrl,
				settings.walletId,
			),
		);
	}

	async register(settings: DfnsSettings): Promise<InitializationData> {
		Injectable.registerTransactionHandler(this);

		const accountMirror = await this.mirrorNodeAdapter.getAccountInfo(settings.hederaAccountId);
		if (!accountMirror.publicKey) {
			throw new Error('PublicKey not found in the mirror node');
		}

		this.initCustodialWalletService(settings);
		this.initClient(settings.hederaAccountId, accountMirror.publicKey.key);

		this.account = new Account({
			id: settings.hederaAccountId,
			publicKey: accountMirror.publicKey,
		});

		const eventData = this.createWalletPairedEvent(SupportedWallets.DFNS);
		this.eventService.emit(WalletEvents.walletPaired, eventData);
		LogService.logTrace('DFNS registered as handler: ', eventData);

		return { account: this.getAccount() };
	}

}
