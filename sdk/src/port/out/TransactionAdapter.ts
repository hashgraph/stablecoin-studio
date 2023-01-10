/*
 *
 * Hedera Stable Coin SDK
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
import { KeyType } from '../../domain/context/account/KeyProps.js';
import AccountViewModel from './mirror/response/AccountViewModel.js';
import { PublicKey as HPublicKey } from '@hashgraph/sdk';
import { MirrorNodeAdapter } from './mirror/MirrorNodeAdapter.js';
import { Environment } from '../../domain/context/network/Environment.js';

export interface InitializationData {
	account?: Account;
	pairing?: string;
	topic?: string;
}

interface ITransactionAdapter {
	create(
		coin: StableCoin,
		factory: ContractId,
		hederaERC20: ContractId,
		createPoR: boolean,
		PoR?: ContractId,
		PoRInitialAmount? : BigDecimal
	): Promise<TransactionResponse>;
	init(): Promise<Environment>;
	register(account?: Account): Promise<InitializationData>;
	stop(): Promise<boolean>;
	associateToken(
		coin: StableCoinCapabilities | string,
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
	): Promise<TransactionResponse>;
	cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse>;
	unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse>;
	pause(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	unpause(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	delete(coin: StableCoinCapabilities): Promise<TransactionResponse>;
	transfer(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
		sourceId: Account,
		targetId: HederaId,
	): Promise<TransactionResponse>;
	getAccount(): Account;
	getMirrorNodeAdapter(): MirrorNodeAdapter;
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
		coin: StableCoinCapabilities,
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
	): Promise<TransactionResponse>;
	increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse>;
	getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<string[], Error>>;
}

export default abstract class TransactionAdapter
	implements ITransactionAdapter, RoleTransactionAdapter
{
	init(): Promise<Environment> {
		throw new Error('Method not implemented.');
	}
	create(
		coin: StableCoin,
		factory: ContractId,
		hederaERC20: ContractId,
		createPoR: boolean,
		PoR?: ContractId,
		PoRInitialAmount? : BigDecimal
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	getAccount(): Account {
		throw new Error('Method not implemented.');
	}
	register(account?: Account): Promise<InitializationData> {
		throw new Error('Method not implemented.');
	}
	stop(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	wipe(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	cashin(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	burn(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	pause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	unpause(
		coin: StableCoinCapabilities,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	rescue(
		coin: StableCoinCapabilities,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	delete(
		coin: StableCoinCapabilities,
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
		coin: StableCoinCapabilities,
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
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	increaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}
	decreaseSupplierAllowance(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		amount: BigDecimal,
	): Promise<TransactionResponse<any, Error>> {
		throw new Error('Method not implemented.');
	}

	getRoles(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse<string[], Error>> {
		throw new Error('Method not implemented.');
	}

	getMirrorNodeAdapter(): MirrorNodeAdapter {
		throw new Error('Method not implemented.');
	}

	async accountToEvmAddress(accountId: HederaId): Promise<string> {
		const accountInfoViewModel: AccountViewModel =
			await this.getMirrorNodeAdapter().getAccountInfo(accountId);
		if (accountInfoViewModel.accountEvmAddress) {
			return accountInfoViewModel.accountEvmAddress;
		} else if (accountInfoViewModel.publicKey) {
			return this.getAccountEvmAddressFromPrivateKeyType(
				accountInfoViewModel.publicKey.type,
				accountInfoViewModel.publicKey.key,
				accountId,
			);
		} else {
			return Promise.reject<string>('');
		}
	}

	private async getAccountEvmAddressFromPrivateKeyType(
		privateKeyType: string,
		publicKey: string,
		accountId: HederaId,
	): Promise<string> {
		switch (privateKeyType) {
			case KeyType.ECDSA:
				return HPublicKey.fromString(publicKey).toEthereumAddress();

			default:
				return '0x' + accountId.toHederaAddress().toSolidityAddress();
		}
	}
}
