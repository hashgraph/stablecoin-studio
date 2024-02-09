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
	DFNSConfig,
} from '@hashgraph/hedera-custodians-integration';
import { singleton } from 'tsyringe';
import LogService from '../../../../../app/service/LogService';
import { WalletEvents } from '../../../../../app/service/event/WalletEvent';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet';
import DfnsSettings from '../../../../../domain/context/custodialwalletsettings/DfnsSettings';
import { CustodialTransactionAdapter } from './CustodialTransactionAdapter';

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

	initCustodialWalletService(settings: DfnsSettings): void {
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

	getSupportedWallet(): SupportedWallets {
		return SupportedWallets.DFNS;
	}

	stop(): Promise<boolean> {
		this.client?.close();
		LogService.logTrace('DFNS stopped');
		this.eventService.emit(WalletEvents.walletDisconnect, {
			wallet: SupportedWallets.DFNS,
		});
		return Promise.resolve(true);
	}
}
