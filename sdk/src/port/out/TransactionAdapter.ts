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
/* eslint-disable @typescript-eslint/no-unused-vars */
import TransactionResponse from '../../domain/context/transaction/TransactionResponse.js';
import StableCoinCapabilities from '../../domain/context/stablecoin/StableCoinCapabilities.js';
import { StableCoin } from '../../domain/context/stablecoin/StableCoin.js';
import ContractId from '../../domain/context/contract/ContractId.js';
import BigDecimal from '../../domain/context/shared/BigDecimal.js';
import { StableCoinRole } from '../../domain/context/stablecoin/StableCoinRole.js';
import Account from '../../domain/context/account/Account.js';
import { HederaId } from '../../domain/context/shared/HederaId.js';
import {
	CustomFee as HCustomFee,
	PublicKey as HPublicKey,
} from '@hashgraph/sdk';
import { MirrorNodeAdapter } from './mirror/MirrorNodeAdapter.js';
import { Environment } from '../../domain/context/network/Environment.js';
import LogService from '../../app/service/LogService.js';
import PublicKey from '../../domain/context/account/PublicKey.js';
import { KeysStruct } from '../../domain/context/factory/FactoryKey.js';
import FireblocksSettings from '../../domain/context/custodialwalletsettings/FireblocksSettings';
import DfnsSettings from '../../domain/context/custodialwalletsettings/DfnsSettings';
import { Transaction } from '@hashgraph/sdk';
import AWSKMSSettings from '../../domain/context/custodialwalletsettings/AWSKMSSettings';
import HWCSettings from '../../domain/context/hwalletconnectsettings/HWCSettings.js';
import { BigNumber } from 'ethers';

export interface InitializationData {
	account?: Account;
	pairing?: string;
	topic?: string;
}

export interface NetworkData {
	name?: Environment;
	recognized?: boolean;
	factoryId?: string;
	resolverId?: string;
}

interface ITransactionAdapter {
	create(
		coin: StableCoin,
		factory: ContractId,
		createReserve: boolean,
		resolver: ContractId,
		configId: string,
		configVersion: number,
		proxyOwnerAccount: HederaId,
		reserveAddress?: ContractId,
		reserveInitialAmount?: BigDecimal,
	): Promise<TransactionResponse>;
	init(): Promise<Environment>;
	register(account?: Account): Promise<InitializationData>;
	stop(): Promise<boolean>;
	associateToken(
		tokenId: HederaId,
		targetId: HederaId,
	): Promise<TransactionResponse>;
	balanceOf(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>>;
	wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse>;
	cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse>;
	burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse>;
	freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse>;
	unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse>;
	pause(
		coin: StableCoinCapabilities,
		startDate?: string,
	): Promise<TransactionResponse>;
	unpause(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse>;
	rescueHBAR(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse>;
	delete(
		coin: StableCoinCapabilities,
		startDate?: string,
	): Promise<TransactionResponse>;
	transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: Account,
		targetId: HederaId,
	): Promise<TransactionResponse>;
	transfers(
		coin: StableCoinCapabilities,
		amounts: BigDecimal[],
		targetsId: HederaId[],
		targetId: HederaId,
	): Promise<TransactionResponse>;
	getAccount(): Account;
	getReserveAddress(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse>;
	updateReserveAddress(
		coin: StableCoinCapabilities,
		reserveAddress: ContractId,
	): Promise<TransactionResponse>;
	getReserveAmount(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse>;
	updateReserveAmount(
		reserveAddress: ContractId,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	update(
		coin: StableCoinCapabilities,
		name: string | undefined,
		symbol: string | undefined,
		autoRenewPeriod: number | undefined,
		expirationTime: number | undefined,
		kycKey: PublicKey | undefined,
		freezeKey: PublicKey | undefined,
		feeScheduleKey: PublicKey | undefined,
		pauseKey: PublicKey | undefined,
		wipeKey: PublicKey | undefined,
		metadata: string | undefined,
	): Promise<TransactionResponse>;
	updateConfigVersion(
		coin: StableCoinCapabilities,
		configVersion: number,
	): Promise<TransactionResponse>;
	updateResolver(
		coin: StableCoinCapabilities,
		resolver: ContractId,
		configVersion: number,
		configId: string,
	): Promise<TransactionResponse>;
	updateConfig(
		coin: StableCoinCapabilities,
		configId: string,
		configVersion: number,
	): Promise<TransactionResponse>;
	getMirrorNodeAdapter(): MirrorNodeAdapter;
	sign(message: string | Transaction): Promise<string>;
	submit(t: Transaction): Promise<TransactionResponse>;
}

interface RoleTransactionAdapter {
	grantRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse>;
	revokeRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse>;
	grantRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
		amounts: BigDecimal[],
		startDate?: string,
	): Promise<TransactionResponse>;
	revokeRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
	): Promise<TransactionResponse>;
	hasRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse<boolean, Error>>;
	grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse>;
	revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse>;
	balanceOf(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>>;
	associateToken(
		tokenId: HederaId,
		targetId: HederaId,
	): Promise<TransactionResponse>;
	isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>>;
	supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>>;
	resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse>;
	increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse>;
	decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse>;
	grantKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>>;
	revokeKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>>;
	updateCustomFees(
		coin: StableCoinCapabilities,
		customFees: HCustomFee[],
	): Promise<TransactionResponse<boolean, Error>>;
	getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<string[], Error>>;
}

interface IHoldTransactionAdapter {
	createHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		escrow: HederaId,
		expirationDate: BigDecimal,
		targetId?: HederaId,
	): Promise<TransactionResponse>;
	createHoldByController(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		escrow: HederaId,
		expirationDate: BigDecimal,
		sourceId: HederaId,
		targetId?: HederaId,
	): Promise<TransactionResponse>;
	executeHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number,
		targetId?: HederaId,
	): Promise<TransactionResponse>;
	releaseHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number,
	): Promise<TransactionResponse>;
	reclaimHold(
		coin: StableCoinCapabilities,
		sourceId: HederaId,
		holdId: number,
	): Promise<TransactionResponse>;
}

export default abstract class TransactionAdapter
	implements
		ITransactionAdapter,
		RoleTransactionAdapter,
		IHoldTransactionAdapter
{
	transfers(
		coin: StableCoinCapabilities,
		amounts: BigDecimal[],
		targetsId: HederaId[],
		targetId: HederaId,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	init(): Promise<Environment> {
		throw new Error('Method not implemented.');
	}
	create(
		coin: StableCoin,
		factory: ContractId,
		createReserve: boolean,
		resolver: ContractId,
		configId: string,
		configVersion: number,
		proxyOwnerAccount: HederaId,
		reserveAddress?: ContractId,
		reserveInitialAmount?: BigDecimal,
		reserveConfigId?: string,
		reserveConfigVersion?: number,
	): Promise<TransactionResponse<any, Error>> {
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
	wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	pause(
		coin: StableCoinCapabilities,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	unpause(
		coin: StableCoinCapabilities,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	rescueHBAR(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	delete(
		coin: StableCoinCapabilities,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: Account,
		targetId: HederaId,
		isApproval = false,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	getReserveAddress(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	updateReserveAddress(
		coin: StableCoinCapabilities,
		reserveAddress: ContractId,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	getReserveAmount(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	updateReserveAmount(
		reserveAddress: ContractId,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	update(
		coin: StableCoinCapabilities,
		name: string | undefined,
		symbol: string | undefined,
		autoRenewPeriod: number | undefined,
		expirationTime: number | undefined,
		kycKey: PublicKey | undefined,
		freezeKey: PublicKey | undefined,
		feeScheduleKey: PublicKey | undefined,
		pauseKey: PublicKey | undefined,
		wipeKey: PublicKey | undefined,
		metadata: string | undefined,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	grantRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	revokeRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	grantRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
		amounts: BigDecimal[],
		startDate?: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	revokeRoles(
		coin: StableCoinCapabilities,
		targetsId: HederaId[],
		roles: StableCoinRole[],
		startDate?: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	hasRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		role: StableCoinRole,
	): Promise<TransactionResponse<boolean, Error>> {
		throw new Error('Method not implemented.');
	}
	grantSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	grantUnlimitedSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	revokeSupplierRole(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	balanceOf(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		throw new Error('Method not implemented.');
	}
	associateToken(
		tokenId: HederaId,
		targetId: HederaId,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	isUnlimitedSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		throw new Error('Method not implemented.');
	}
	supplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<BigDecimal, Error>> {
		throw new Error('Method not implemented.');
	}
	resetSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
		startDate?: string,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	grantKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		throw new Error('Method not implemented.');
	}
	revokeKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<boolean, Error>> {
		throw new Error('Method not implemented.');
	}
	public async updateCustomFees(
		coin: StableCoinCapabilities,
		customFees: HCustomFee[],
	): Promise<TransactionResponse<boolean, Error>> {
		throw new Error('Method not implemented.');
	}

	getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<string[], Error>> {
		throw new Error('Method not implemented.');
	}
	updateConfigVersion(
		coin: StableCoinCapabilities,
		configVersion: number,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	updateResolver(
		coin: StableCoinCapabilities,
		resolver: ContractId,
		configVersion: number,
		configId: string,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	updateConfig(
		coin: StableCoinCapabilities,
		configId: string,
		configVersion: number,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	createHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		escrow: HederaId,
		expirationDate: BigDecimal,
		targetId?: HederaId,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	createHoldByController(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		escrow: HederaId,
		expirationDate: BigDecimal,
		sourceId: HederaId,
		targetId?: HederaId,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	executeHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number,
		targetId?: HederaId,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	releaseHold(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: HederaId,
		holdId: number,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	reclaimHold(
		coin: StableCoinCapabilities,
		sourceId: HederaId,
		holdId: number,
	): Promise<TransactionResponse> {
		throw new Error('Method not implemented.');
	}
	getMirrorNodeAdapter(): MirrorNodeAdapter {
		throw new Error('Method not implemented.');
	}

	async getEVMAddress(parameter: any): Promise<any> {
		if (parameter instanceof ContractId) {
			const test = (
				await this.getMirrorNodeAdapter().getContractInfo(
					parameter.toString(),
				)
			).evmAddress.toString();
			return test;
		}
		if (parameter instanceof HederaId) {
			return (
				await this.getMirrorNodeAdapter().accountToEvmAddress(parameter)
			).toString();
		}
		return parameter;
	}

	setKeysForSmartContract(providedKeys: any[]): KeysStruct[] {
		const keys: KeysStruct[] = [];

		providedKeys.forEach((providedKey, index) => {
			if (providedKey) {
				const key = new KeysStruct();
				switch (index) {
					case 0: {
						key.keyType = BigNumber.from(1); // admin
						break;
					}
					case 1: {
						key.keyType = BigNumber.from(2); // kyc
						break;
					}
					case 2: {
						key.keyType = BigNumber.from(4); // freeze
						break;
					}
					case 3: {
						key.keyType = BigNumber.from(8); // wipe
						break;
					}
					case 4: {
						key.keyType = BigNumber.from(16); // supply
						break;
					}
					case 5: {
						key.keyType = BigNumber.from(32); // fee schedule
						break;
					}
					case 6: {
						key.keyType = BigNumber.from(64); // pause
						break;
					}
				}
				const providedKeyCasted = providedKey as PublicKey;
				key.publicKey =
					providedKeyCasted.key == PublicKey.NULL.key
						? '0x'
						: HPublicKey.fromString(
								providedKeyCasted.key,
						  ).toBytesRaw();
				key.isEd25519 = providedKeyCasted.type === 'ED25519';
				keys.push(key);
			}
		});
		return keys;
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
}
