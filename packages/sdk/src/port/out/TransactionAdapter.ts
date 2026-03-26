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
import TransactionResponse from '../../domain/context/transaction/TransactionResponse.js';
import Account from '../../domain/context/account/Account.js';
import { Transaction } from '@hiero-ledger/sdk';
import { AbstractMirrorNodeAdapter } from './mirror/AbstractMirrorNodeAdapter.js';
import { Environment } from '../../domain/context/network/Environment.js';
import LogService from '../../core/service/LogService.js';
import FireblocksSettings from '../../domain/context/custodialwalletsettings/FireblocksSettings';
import DfnsSettings from '../../domain/context/custodialwalletsettings/DfnsSettings';
import AWSKMSSettings from '../../domain/context/custodialwalletsettings/AWSKMSSettings';
import HWCSettings from '../../domain/context/hwalletconnectsettings/HWCSettings.js';
import type { SigningConfig } from '../../core/config/SigningConfig.js';

// Re-export from domain (canonical location)
export { type InitializationData } from '../../domain/context/network/InitializationData.js';
export { type NetworkData } from '../../domain/context/network/NetworkData.js';
import type { InitializationData } from '../../domain/context/network/InitializationData.js';

/**
 * Abstract base class for wallet adapters.
 *
 * After the migration to TransactionOrchestrator + Pipeline,
 * adapters are "WalletConnectors" — they handle wallet lifecycle
 * (init, register, stop), account access, and multi-sig sign/submit.
 * All transaction execution goes through TransactionOrchestrator.
 */
export default abstract class TransactionAdapter {
	init(): Promise<Environment> {
		throw new Error('Method not implemented.');
	}
	getAccount(): Account {
		throw new Error('Method not implemented.');
	}
	register(
		input?:
			| Account
			| FireblocksSettings
			| DfnsSettings
			| AWSKMSSettings
			| HWCSettings,
	): Promise<InitializationData> {
		throw new Error('Method not implemented.');
	}
	stop(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	getMirrorNodeAdapter(): AbstractMirrorNodeAdapter {
		throw new Error('Method not implemented.');
	}

	logTransaction(id: string, network: string): void {
		const HASHSCAN_URL = `https://hashscan.io/${network}/transactionsById/`;
		const HASHSCAN_TX_URL = `https://hashscan.io/${network}/tx/`;
		const msg = `\nYou can see your transaction at ${
			id.startsWith('0x') ? HASHSCAN_TX_URL : HASHSCAN_URL
		}${id}\n`;
		LogService.logInfo(msg);
		console.log(msg);
	}

	sign(message: string | Transaction): Promise<string> {
		throw new Error('Method not implemented.');
	}
	submit(t: Transaction): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}

	/**
	 * Returns the signing configuration for the TransactionOrchestrator pipeline.
	 * Each adapter knows how to describe its own signing strategy.
	 */
	toSigningConfig(): SigningConfig {
		throw new Error('Method not implemented.');
	}

	/**
	 * Whether this adapter serializes transactions for external signing
	 * rather than executing them directly.
	 */
	isExternal(): boolean {
		return false;
	}
}
