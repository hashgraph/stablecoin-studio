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
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */

import 'reflect-metadata';
import { BigNumber, ethers } from 'ethers';
import {
	ContractExecuteTransaction,
	CustomFee,
	TokenFeeScheduleUpdateTransaction,
	Transaction,
	ContractId as HContractId,
	TokenWipeTransaction,
	TokenPauseTransaction,
	TokenUnpauseTransaction,
	TokenFreezeTransaction,
	TokenUnfreezeTransaction,
	TokenGrantKycTransaction,
	TokenRevokeKycTransaction,
} from '@hashgraph/sdk';
import { StableCoinFactory__factory } from '@hashgraph/stablecoin-npm-contracts';
import {
	IStrategyConfig,
	SignatureRequest,
} from '@hashgraph/hedera-custodians-integration';
import {
	CLIENT_PUBLIC_KEY_ED25519,
	HEDERA_TOKEN_MANAGER_ADDRESS,
	GET_TRANSACTION,
	GET_TRANSACTIONS,
	SIGNATURE,
	TRANSACTION,
	UPDATE,
	PAGINATION,
	DELETE,
	DECIMALS,
	PROXY_CONTRACT_ID,
	PROXY_ADMIN_CONTRACT_ID,
	MAX_SUPPLY,
	INITIAL_SUPPLY,
	INITIAL_HBAR_SUPPLY,
	EXPIRATION_TIMESTAMP,
	AUTO_RENEW_ACCOUNT,
	RESERVE_AMOUNT,
	RESERVE_ADDRESS,
	CLIENT_PRIVATE_KEY_ECDSA_2,
} from './config.js';
import {
	AccountViewModel,
	BigDecimal,
	ContractId,
	EvmAddress,
	HBAR_DECIMALS,
	HederaId,
	InitializationData,
	PublicKey,
	RequestCustomFee,
	StableCoinListViewModel,
	StableCoinRole,
	StableCoinViewModel,
	TokenSupplyType,
} from '../src/index.js';
import {
	CREATE_SC_GAS,
	TOKEN_CREATION_COST_HBAR,
} from '../src/core/Constants.js';
import LogService from '../src/app/service/LogService.js';
import {
	AccountTokenRelationViewModel,
	FreezeStatus,
	KycStatus,
} from '../src/port/out/mirror/response/AccountTokenRelationViewModel.js';
import ContractViewModel from '../src/port/out/mirror/response/ContractViewModel.js';
import { TransactionType } from '../src/port/out/TransactionResponseEnums.js';
import { MirrorNodeAdapter } from '../src/port/out/mirror/MirrorNodeAdapter.js';
import TransactionResultViewModel from '../src/port/out/mirror/response/TransactionResultViewModel.js';
import TransactionResponse from '../src/domain/context/transaction/TransactionResponse.js';
import MultiKey from '../src/domain/context/account/MultiKey.js';
import Account from '../src/domain/context/account/Account.js';
import Injectable from '../src/core/Injectable.js';
import { Environment } from '../src/domain/context/network/Environment.js';
import { MultiSigTransaction } from '../src/domain/context/transaction/MultiSigTransaction.js';
import { StableCoinProps } from '../src/domain/context/stablecoin/StableCoin.js';
import { FactoryCashinRole } from '../src/domain/context/factory/FactoryCashinRole.js';
import { FactoryKey } from '../src/domain/context/factory/FactoryKey.js';
import { FactoryRole } from '../src/domain/context/factory/FactoryRole.js';
import { FactoryStableCoin } from '../src/domain/context/factory/FactoryStableCoin.js';
import { REGEX_TRANSACTION } from '../src/port/out/error/TransactionResponseError.js';

interface token {
	tokenId: string;
	customFees: CustomFee[];
}

interface allowance {
	isUnlimited: boolean;
	amount: string;
}

const tokens = new Map<string, token>();
const roles = new Map<string, StableCoinRole[]>();
const accounts_with_roles = new Map<string, string[]>();
const suppliers = new Map<string, allowance>();
const balances = new Map<string, string>();
const HBAR_balances = new Map<string, string>();
const freeze_status = new Map<string, boolean>();
const kyc_status = new Map<string, boolean>();
let pause_status = false;
let delete_status = false;
const initialSupply = INITIAL_SUPPLY;
const maxSupply = MAX_SUPPLY;
let totalSupply = initialSupply;
let metadata = 'nothing';
let TokenName = 'TokenName';
let TokenSymbol = 'TN';
const expirationTimestamp = EXPIRATION_TIMESTAMP;
const adminKey = new ContractId(PROXY_CONTRACT_ID);
let kycKey: any = new ContractId(PROXY_CONTRACT_ID);
let freezeKey: any = new ContractId(PROXY_CONTRACT_ID);
let wipeKey: any = new ContractId(PROXY_CONTRACT_ID);
const supplyKey = new ContractId(PROXY_CONTRACT_ID);
let pauseKey: any = new ContractId(PROXY_CONTRACT_ID);
const feeScheduleKey = CLIENT_PUBLIC_KEY_ED25519;
let autoRenewPeriod = 1000;
const autoRenewAccount = AUTO_RENEW_ACCOUNT;

let proxyOwner = '0x0000000000000000000000000000000000000003';
let proxyPendingOwner = '0x0000000000000000000000000000000000000000';
let implementation = identifiers(
	HederaId.from(HEDERA_TOKEN_MANAGER_ADDRESS),
)[1];
let reserveAmount = RESERVE_AMOUNT;
let reserveAddress = RESERVE_ADDRESS;
let user_account: Account;

function hexToDecimal(hexString: string): number {
	if (!/^0x[a-fA-F0-9]+$|^[a-fA-F0-9]+$/.test(hexString)) {
		throw new Error('Invalid hexadecimal input.');
	}
	return parseInt(hexString, 16);
}

function identifiers(accountId: HederaId | string): string[] {
	let id;
	let accountEvmAddress;

	if (accountId instanceof HederaId) {
		id = accountId.toString();
		accountEvmAddress =
			'0x' + accountId.toHederaAddress().toSolidityAddress();
	} else {
		id = '0.0.' + hexToDecimal('0x' + accountId.toUpperCase().substring(2));
		accountEvmAddress = accountId.toString();
	}

	return [id, '0x' + accountEvmAddress.toUpperCase().substring(2)];
}

function grantRole(account: string, newRole: StableCoinRole): void {
	let r = roles.get(account);
	if (!r) r = [newRole];
	else if (false == r.includes(newRole)) r.push(newRole);
	roles.set(account, r);

	let accounts = accounts_with_roles.get(newRole);
	if (!accounts) accounts = [account];
	else if (false == accounts.includes(account)) accounts.push(account);
	accounts_with_roles.set(newRole, accounts);
}

function revokeRole(account: string, oldRole: StableCoinRole): void {
	let r = roles.get(account);
	if (r) {
		if (r.includes(oldRole)) {
			r = r.filter((role) => role !== oldRole);
			roles.set(account, r);

			const accounts = accounts_with_roles.get(oldRole);
			if (accounts) {
				accounts?.filter((item) => item !== account);
				accounts_with_roles.set(oldRole, accounts);
			}
		}
	}
}

function grantSupplierRole(supplier: string, amount: BigDecimal): void {
	grantRole(supplier, StableCoinRole.CASHIN_ROLE);

	const newAllowance: allowance = {
		isUnlimited: false,
		amount: amount.toString(),
	};

	suppliers.set(supplier, newAllowance);
}

function grantUnlimitedSupplierRole(supplier: string): void {
	grantRole(supplier, StableCoinRole.CASHIN_ROLE);

	const newAllowance: allowance = {
		isUnlimited: true,
		amount: '0',
	};

	suppliers.set(supplier, newAllowance);
}

function revokeSupplierRole(supplier: string): void {
	revokeRole(supplier, StableCoinRole.CASHIN_ROLE);
	const supplierAllowance = suppliers.get(supplier);
	if (supplierAllowance) suppliers.delete(supplier);
}

function assignKey(value: any, id: number): void {
	switch (id) {
		case 2:
			kycKey = value;
			break;
		case 4:
			freezeKey = value;
			break;
		case 8:
			wipeKey = value;
			break;
		case 64:
			pauseKey = value;
			break;
	}
}

function wipe(account: string, amount: any): void {
	let accountBalance = balances.get(account);
	if (accountBalance) {
		accountBalance = BigDecimal.fromString(accountBalance)
			.toBigNumber()
			.sub(amount)
			.toString();
		balances.set(account, accountBalance);
	}
	totalSupply = BigDecimal.fromString(totalSupply)
		.toBigNumber()
		.sub(amount)
		.toString();
}

function smartContractCalls(functionName: string, decoded: any): void {
	if (functionName == 'deployStableCoin') {
		const requestedToken = (decoded as any).requestedToken;

		TokenName = requestedToken.tokenName;
		TokenSymbol = requestedToken.tokenSymbol;
		metadata = requestedToken.metadata;
		proxyOwner = requestedToken.proxyAdminOwnerAccount;

		const keys = requestedToken[10];

		keys.forEach(
			(key: {
				publicKey: string;
				keyType: { toString: () => string };
			}) => {
				if (key.publicKey !== '0x') {
					const pk = new PublicKey(key.publicKey);
					assignKey(pk, parseInt(key.keyType.toString()));
				} else
					assignKey(
						new ContractId(PROXY_CONTRACT_ID),
						parseInt(key.keyType.toString()),
					);
			},
		);
	} else if (functionName == 'transferOwnership') {
		proxyPendingOwner =
			'0x' + (decoded as any).newOwner.toUpperCase().substring(2);
	} else if (functionName == 'acceptOwnership') {
		proxyOwner = proxyPendingOwner;
		proxyPendingOwner = '0x0000000000000000000000000000000000000000';
	} else if (functionName == 'upgrade') {
		implementation =
			'0x' + (decoded as any).implementation.toUpperCase().substring(2);
	} else if (functionName == 'setAmount') {
		reserveAmount = (decoded as any).newValue;
	} else if (functionName == 'grantRole') {
		const account =
			'0x' + (decoded as any).account.toUpperCase().substring(2);
		const newRole = (decoded as any).role;
		grantRole(account, newRole);
	} else if (functionName == 'revokeRole') {
		const account =
			'0x' + (decoded as any).account.toUpperCase().substring(2);
		const oldRole = (decoded as any).role;
		revokeRole(account, oldRole);
	} else if (functionName == 'grantRoles') {
		const accounts = (decoded as any).accounts;
		const newRoles = (decoded as any).roles;
		const amounts = (decoded as any).amounts;

		newRoles.forEach((newRole: StableCoinRole) => {
			if (newRole == StableCoinRole.CASHIN_ROLE) {
				for (let i = 0; i < accounts.length; i++) {
					if (amounts[i] == 0)
						grantUnlimitedSupplierRole(
							'0x' + accounts[i].toUpperCase().substring(2),
						);
					else
						grantSupplierRole(
							'0x' + accounts[i].toUpperCase().substring(2),
							amounts[i],
						);
				}
			} else {
				accounts.forEach((account: string) => {
					grantRole(
						'0x' + account.toUpperCase().substring(2),
						newRole,
					);
				});
			}
		});
	} else if (functionName == 'revokeRoles') {
		const accounts = (decoded as any).accounts;
		const oldRoles = (decoded as any).roles;

		oldRoles.forEach((oldRole: StableCoinRole) => {
			if (oldRole == StableCoinRole.CASHIN_ROLE) {
				accounts.forEach((account: string) => {
					revokeSupplierRole(
						'0x' + account.toUpperCase().substring(2),
					);
				});
			} else {
				accounts.forEach((account: string) => {
					revokeRole(
						'0x' + account.toUpperCase().substring(2),
						oldRole,
					);
				});
			}
		});
	} else if (functionName == 'grantSupplierRole') {
		const supplier =
			'0x' + (decoded as any).supplier.toUpperCase().substring(2);
		const amount = (decoded as any).amount;
		grantSupplierRole(supplier, amount);
	} else if (functionName == 'grantUnlimitedSupplierRole') {
		const supplier =
			'0x' + (decoded as any).supplier.toUpperCase().substring(2);
		grantUnlimitedSupplierRole(supplier);
	} else if (functionName == 'revokeSupplierRole') {
		const supplier =
			'0x' + (decoded as any).supplier.toUpperCase().substring(2);
		revokeSupplierRole(supplier);
	} else if (functionName == 'resetSupplierAllowance') {
		const supplier =
			'0x' + (decoded as any).supplier.toUpperCase().substring(2);
		const supplierAllowance = suppliers.get(supplier);
		if (supplierAllowance) {
			supplierAllowance.amount = '0';
			suppliers.set(supplier, supplierAllowance);
		}
	} else if (functionName == 'increaseSupplierAllowance') {
		const supplier =
			'0x' + (decoded as any).supplier.toUpperCase().substring(2);
		const amount = (decoded as any).amount;
		const supplierAllowance = suppliers.get(supplier);
		if (supplierAllowance) {
			supplierAllowance.amount = BigDecimal.fromString(
				supplierAllowance.amount,
			)
				.toBigNumber()
				.add(amount)
				.toString();
			suppliers.set(supplier, supplierAllowance);
		} else grantSupplierRole(supplier, amount);
	} else if (functionName == 'decreaseSupplierAllowance') {
		const supplier =
			'0x' + (decoded as any).supplier.toUpperCase().substring(2);
		const amount = (decoded as any).amount;
		const supplierAllowance = suppliers.get(supplier);
		if (supplierAllowance) {
			supplierAllowance.amount = BigDecimal.fromString(
				supplierAllowance.amount,
			)
				.toBigNumber()
				.sub(amount)
				.toString();
			suppliers.set(supplier, supplierAllowance);
		}
	} else if (functionName == 'burn') {
		const amount = (decoded as any).amount;
		const account = identifiers(HederaId.from(PROXY_CONTRACT_ID))[1];
		let treasury_balance = balances.get(account);
		if (treasury_balance) {
			treasury_balance = BigDecimal.fromString(treasury_balance)
				.toBigNumber()
				.sub(amount)
				.toString();
			balances.set(account, treasury_balance);
		}
		totalSupply = BigDecimal.fromString(totalSupply)
			.toBigNumber()
			.sub(amount)
			.toString();
	} else if (functionName == 'mint') {
		const amount = (decoded as any).amount;
		const account =
			'0x' + (decoded as any).account.toUpperCase().substring(2);
		let accountBalance = balances.get(account);
		if (accountBalance) {
			accountBalance = BigDecimal.fromString(accountBalance)
				.toBigNumber()
				.add(amount)
				.toString();
			balances.set(account, accountBalance);
		} else balances.set(account, amount.toString());
		totalSupply = BigDecimal.fromString(totalSupply)
			.toBigNumber()
			.add(amount)
			.toString();
	} else if (functionName == 'deleteToken') {
		delete_status = true;
	} else if (functionName == 'freeze') {
		const account =
			'0x' + (decoded as any).account.toUpperCase().substring(2);
		freeze_status.set(account, true);
	} else if (functionName == 'unfreeze') {
		const account =
			'0x' + (decoded as any).account.toUpperCase().substring(2);
		freeze_status.set(account, false);
	} else if (functionName == 'grantKyc') {
		const account =
			'0x' + (decoded as any).account.toUpperCase().substring(2);
		kyc_status.set(account, true);
	} else if (functionName == 'revokeKyc') {
		const account =
			'0x' + (decoded as any).account.toUpperCase().substring(2);
		kyc_status.set(account, false);
	} else if (functionName == 'pause') {
		pause_status = true;
	} else if (functionName == 'unpause') {
		pause_status = false;
	} else if (functionName == 'rescue') {
		const amount = (decoded as any).amount;
		const account =
			'0x' +
			identifiers(HederaId.from(PROXY_CONTRACT_ID))[1]
				.toUpperCase()
				.substring(2);
		const sender = identifiers(user_account.id)[1];

		let treasury_balance = balances.get(account);
		if (treasury_balance) {
			treasury_balance = BigDecimal.fromString(treasury_balance)
				.toBigNumber()
				.sub(amount)
				.toString();
			balances.set(account, treasury_balance);
		}

		let accountBalance = balances.get(sender);
		if (accountBalance) {
			accountBalance = BigDecimal.fromString(accountBalance)
				.toBigNumber()
				.add(amount)
				.toString();
			balances.set(sender, accountBalance);
		} else balances.set(sender, amount.toString());
	} else if (functionName == 'rescueHBAR') {
		const amount = (decoded as any).amount;
		const account =
			'0x' +
			identifiers(HederaId.from(PROXY_CONTRACT_ID))[1]
				.toUpperCase()
				.substring(2);
		const sender =
			'0x' + identifiers(user_account.id)[1].toUpperCase().substring(2);

		let treasury_balance = HBAR_balances.get(account);
		if (treasury_balance) {
			treasury_balance = BigDecimal.fromString(treasury_balance)
				.toBigNumber()
				.sub(amount)
				.toString();
			HBAR_balances.set(account, treasury_balance);
		}

		let accountBalance = HBAR_balances.get(sender);
		if (accountBalance) {
			accountBalance = BigDecimal.fromString(accountBalance)
				.toBigNumber()
				.add(amount)
				.toString();
			HBAR_balances.set(sender, accountBalance);
		} else HBAR_balances.set(sender, amount.toString());
	} else if (functionName == 'updateReserveAddress') {
		const newAddress =
			'0x' + (decoded as any).newAddress.toUpperCase().substring(2);
		reserveAddress = identifiers(newAddress)[0];
	} else if (functionName == 'wipe') {
		const amount = (decoded as any).amount;
		const account =
			'0x' + (decoded as any).account.toUpperCase().substring(2);
		wipe(account, amount);
	} else if (functionName == 'updateToken') {
		const updatedToken = (decoded as any).updatedToken;
		TokenName = updatedToken.tokenName;
		TokenSymbol = updatedToken.tokenSymbol;
		metadata = updatedToken.tokenMetadataURI;
		autoRenewPeriod = parseInt(updatedToken.autoRenewPeriod.toString());

		const keys = updatedToken[2];
		keys.forEach(
			(key: {
				publicKey: string;
				keyType: { toString: () => string };
			}) => {
				if (key.publicKey == '0x')
					assignKey(
						HederaId.from(autoRenewAccount),
						parseInt(key.keyType.toString()),
					);
			},
		);
	}
}

function signAndSendTransaction(
	t: Transaction,
	transactionType: TransactionType,
	functionName: string,
	abi: object[],
): void {
	if (t instanceof TokenFeeScheduleUpdateTransaction) {
		const tokenId = (
			t as TokenFeeScheduleUpdateTransaction
		).tokenId!.toString();
		const customFees = (t as TokenFeeScheduleUpdateTransaction).customFees;
		let token = tokens.get(tokenId);
		if (!token) {
			token = {
				tokenId: tokenId,
				customFees: [],
			};
		}
		token.customFees = customFees;
		tokens.set(tokenId, token);
	} else if (t instanceof TokenWipeTransaction) {
		const accountId = (t as TokenWipeTransaction).accountId!;
		const amountValue = (t as TokenWipeTransaction).amount?.toString();

		const account = identifiers(HederaId.from(accountId.toString()))[1];
		const amount = BigNumber.from(amountValue);

		wipe(account, amount);
	} else if (t instanceof TokenPauseTransaction) {
		pause_status = true;
	} else if (t instanceof TokenUnpauseTransaction) {
		pause_status = false;
	} else if (t instanceof TokenFreezeTransaction) {
		const accountId = (t as TokenFreezeTransaction).accountId!;
		const account = identifiers(HederaId.from(accountId.toString()))[1];

		freeze_status.set(account, true);
	} else if (t instanceof TokenUnfreezeTransaction) {
		const accountId = (t as TokenUnfreezeTransaction).accountId!;
		const account = identifiers(HederaId.from(accountId.toString()))[1];

		freeze_status.set(account, false);
	} else if (t instanceof TokenGrantKycTransaction) {
		const accountId = (t as TokenGrantKycTransaction).accountId!;
		const account = identifiers(HederaId.from(accountId.toString()))[1];

		kyc_status.set(account, true);
	} else if (t instanceof TokenRevokeKycTransaction) {
		const accountId = (t as TokenRevokeKycTransaction).accountId!;
		const account = identifiers(HederaId.from(accountId.toString()))[1];

		kyc_status.set(account, false);
	} else if (t instanceof ContractExecuteTransaction) {
		const iface = new ethers.utils.Interface(abi);
		const functionFragment = iface.getFunction(functionName);
		let decoded;
		if (t.functionParameters) {
			decoded = iface.decodeFunctionData(
				functionFragment,
				t.functionParameters,
			);
		}

		smartContractCalls(functionName, decoded);
	}
}

// * Jest Mocks

//* Mock console.log() and console.info() methods
global.console.log = jest.fn();
global.console.info = jest.fn();
LogService.log = jest.fn();
LogService.logInfo = jest.fn();

jest.mock('../src/port/out/mirror/MirrorNodeAdapter', () => {
	const actual = jest.requireActual(
		'../src/port/out/mirror/MirrorNodeAdapter.ts',
	);

	const MirrorNodeAdapterMock = new actual.MirrorNodeAdapter();

	MirrorNodeAdapterMock.set = jest.fn().mockResolvedValue('mocked set');
	MirrorNodeAdapterMock.getStableCoinsList = jest.fn(
		(accountId: HederaId) => {
			const response: StableCoinListViewModel = {
				coins: [{ symbol: 'A', id: accountId.toString() }],
			};
			return response;
		},
	);
	MirrorNodeAdapterMock.getTokenInfo = jest.fn((tokenId: HederaId) => {
		const response = {
			status: 200,
			data: null,
		};
		return response;
	});
	MirrorNodeAdapterMock.getStableCoin = jest.fn((tokenId: HederaId) => {
		const customFees = tokens.get(tokenId.toString())?.customFees;

		const requestCustomFees: RequestCustomFee[] = [];

		if (customFees) {
			customFees.forEach((customFee) => {
				requestCustomFees.push({
					collectorId: customFee.feeCollectorAccountId!.toString(),
					collectorsExempt: customFee.allCollectorsAreExempt,
					decimals: 3,
				});
			});
		}

		const response: StableCoinViewModel = {
			tokenId: tokenId,
			name: TokenName,
			symbol: TokenSymbol,
			decimals: DECIMALS,
			totalSupply: BigDecimal.fromString(totalSupply, DECIMALS),
			maxSupply: BigDecimal.fromString(maxSupply, DECIMALS),
			initialSupply: BigDecimal.fromString(initialSupply, DECIMALS),
			treasury: HederaId.from(PROXY_CONTRACT_ID),
			proxyAddress: new ContractId(PROXY_CONTRACT_ID),
			proxyAdminAddress: new ContractId(PROXY_ADMIN_CONTRACT_ID),
			evmProxyAddress: new EvmAddress(
				identifiers(HederaId.from(PROXY_CONTRACT_ID))[1],
			),
			evmProxyAdminAddress: new EvmAddress(
				identifiers(HederaId.from(PROXY_ADMIN_CONTRACT_ID))[1],
			),
			expirationTime: expirationTimestamp,
			freezeDefault: false,
			autoRenewAccount: HederaId.from(autoRenewAccount),
			autoRenewPeriod: autoRenewPeriod,
			expirationTimestamp: parseInt(expirationTimestamp),
			paused: pause_status,
			deleted: delete_status,
			adminKey: adminKey,
			kycKey: kycKey,
			freezeKey: freezeKey,
			wipeKey: wipeKey,
			supplyKey: supplyKey,
			pauseKey: pauseKey,
			feeScheduleKey: feeScheduleKey,
			reserveAddress: new ContractId(reserveAddress),
			reserveAmount: BigDecimal.fromString(reserveAmount, DECIMALS),
			customFees: requestCustomFees,
			metadata: metadata,
		};
		return response;
	});
	MirrorNodeAdapterMock.getAccountInfo = jest.fn(
		(accountId: HederaId | string) => {
			const ids = identifiers(accountId);

			const response: AccountViewModel = {
				id: ids[0],
				accountEvmAddress: ids[1],
				publicKey: CLIENT_PUBLIC_KEY_ED25519,
				alias: 'anything',
				multiKey: new MultiKey([], 0),
			};
			return response;
		},
	);
	MirrorNodeAdapterMock.getContractMemo = jest.fn((contractId: HederaId) => {
		return '0x0000000000000000000000000000000000000001';
	});
	MirrorNodeAdapterMock.getContractInfo = jest.fn(
		(contractEvmAddress: string) => {
			let accountId;

			if (contractEvmAddress.toString().indexOf('.') !== -1) {
				accountId = HederaId.from(contractEvmAddress);
			} else {
				accountId = contractEvmAddress;
			}

			const ids = identifiers(accountId);

			const response: ContractViewModel = {
				id: ids[0],
				evmAddress: ids[1],
			};
			return response;
		},
	);
	MirrorNodeAdapterMock.getAccountToken = jest.fn(
		(targetId: HederaId, tokenId: HederaId) => {
			const account =
				'0x' + identifiers(targetId)[1].toUpperCase().substring(2);
			let balance = balances.get(account);
			if (!balance) balance = '0';
			const freeze = freeze_status.get(account)
				? FreezeStatus.FROZEN
				: FreezeStatus.UNFROZEN;
			const kyc = kyc_status.get(account)
				? KycStatus.GRANTED
				: KycStatus.REVOKED;

			const response: AccountTokenRelationViewModel = {
				automaticAssociation: true,
				balance: BigDecimal.fromString(balance, DECIMALS),
				createdTimestamp: '10000000',
				freezeStatus: freeze,
				kycStatus: kyc,
				tokenId: tokenId,
			};
			return response;
		},
	);
	MirrorNodeAdapterMock.getTransactionResult = jest.fn(
		(transactionId: string) => {
			const response: TransactionResultViewModel = {
				result: 'resultMessage',
			};
			return response;
		},
	);
	MirrorNodeAdapterMock.getTransactionFinalError = jest.fn(
		(transactionId: string) => {
			const response: TransactionResultViewModel = {
				result: 'resultMessage',
			};
			return response;
		},
	);
	MirrorNodeAdapterMock.accountToEvmAddress = jest.fn(
		(accountId: HederaId) => {
			const ids = identifiers(accountId);
			return ids[1];
		},
	);
	MirrorNodeAdapterMock.getHBARBalance = jest.fn(
		(accountId: HederaId | string) => {
			const balance = HBAR_balances.get(identifiers(accountId)[1]);
			if (balance) return BigDecimal.fromString(balance, HBAR_DECIMALS);
			return BigDecimal.fromString('0', HBAR_DECIMALS);
		},
	);

	MirrorNodeAdapterMock.getContractResults = jest.fn(
		async (
			transactionId: string,
			numberOfResultItems: number,
			timeout = 30,
			requestInterval = 3,
		) => {
			// Simulate transactionId formatting
			transactionId = transactionId
				.replace('@', '-')
				.replace(/.([^.]*)$/, '-$1');

			// Mock the behavior of retries and timeout
			let call_OK = false;
			const results: string[] = [];
			const BYTES_32_LENGTH = 64; // Assuming 64 for the byte length

			const mockResponseData = '0x'.padEnd(
				2 + numberOfResultItems * BYTES_32_LENGTH,
				'1',
			); // Mock response with data

			do {
				timeout -= requestInterval;

				if (mockResponseData && mockResponseData.length > 2) {
					try {
						call_OK = true;

						if (numberOfResultItems == 0) {
							numberOfResultItems =
								(mockResponseData.length - 2) / BYTES_32_LENGTH;
						}

						if (
							mockResponseData.startsWith('0x') &&
							mockResponseData.length >=
								2 + numberOfResultItems * BYTES_32_LENGTH
						) {
							for (let i = 0; i < numberOfResultItems; i++) {
								const start = 2 + i * BYTES_32_LENGTH;
								const end = start + BYTES_32_LENGTH;
								const result = `0x${mockResponseData.slice(
									start,
									end,
								)}`;
								results.push(result);
							}
							return results;
						}

						return null;
					} catch (error) {
						return Promise.reject(new Error('InvalidResponse'));
					}
				}

				await new Promise((r) => setTimeout(r, requestInterval * 1000)); // Simulate async delay
			} while (timeout > 0 && !call_OK);

			return results;
		},
	);

	return {
		MirrorNodeAdapter: jest.fn(() => MirrorNodeAdapterMock),
	};
});

jest.mock('../src/port/out/hs/hts/HTSTransactionAdapter', () => {
	const actual = jest.requireActual(
		'../src/port/out/hs/hts/HTSTransactionAdapter.ts',
	);

	const HTSTransactionAdapterMock = new actual.HTSTransactionAdapter();

	HTSTransactionAdapterMock.init = jest.fn(() => {
		balances.set(
			identifiers(HederaId.from(PROXY_CONTRACT_ID))[1],
			initialSupply,
		);
		HBAR_balances.set(
			identifiers(HederaId.from(PROXY_CONTRACT_ID))[1],
			INITIAL_HBAR_SUPPLY,
		);
	});

	HTSTransactionAdapterMock.register = function (
		account: Account,
	): InitializationData {
		user_account = account;
		user_account.publicKey = account.privateKey?.publicKey;
		Injectable.registerTransactionHandler(this); // `this` now correctly refers to the singletonInstance
		const response = {
			account: account,
			pairing: 'pairing',
			topic: 'topic',
		};
		return response;
	};

	HTSTransactionAdapterMock.stop = function (): Promise<boolean> {
		return Promise.resolve(true);
	};

	HTSTransactionAdapterMock.signAndSendTransaction = function (
		t: Transaction,
		transactionType: TransactionType,
		functionName: string,
		abi: object[],
	): Promise<TransactionResponse> {
		signAndSendTransaction(t, transactionType, functionName, abi);
		const tokenAddress = '0x000000000000000000000000000000000054C563';
		const reservAddressReturned = identifiers(
			HederaId.from(reserveAddress),
		)[1];
		const reserveProxyAdmin = identifiers(HederaId.from('0.0.0'))[1];
		const response = [
			[
				'',
				'',
				'',
				tokenAddress,
				reservAddressReturned,
				reserveProxyAdmin,
			],
		];
		const returnedResponse = new TransactionResponse(
			'1',
			response,
			undefined,
		);
		return Promise.resolve(returnedResponse);
	};

	HTSTransactionAdapterMock.getAccount = function (): Account {
		return user_account;
	};

	HTSTransactionAdapterMock.sign = function (
		message: string | Transaction,
	): Promise<string> {
		return Promise.resolve('signedMessage');
	};

	HTSTransactionAdapterMock.getMirrorNodeAdapter =
		function (): MirrorNodeAdapter {
			return new MirrorNodeAdapter();
		};

	HTSTransactionAdapterMock.create = async function (
		coin: StableCoinProps,
		factory: ContractId,
		hederaTokenManager: ContractId,
		createReserve: boolean,
		reserveAddress?: ContractId,
		reserveInitialAmount?: BigDecimal,
		proxyAdminOwnerAccount?: ContractId,
	): Promise<TransactionResponse<any, Error>> {
		const mirrorNodeAdapter = new MirrorNodeAdapter();
		try {
			const cashinRole: FactoryCashinRole = {
				account:
					coin.cashInRoleAccount == undefined ||
					coin.cashInRoleAccount.toString() == '0.0.0'
						? '0x0000000000000000000000000000000000000000'
						: await this.getEVMAddress(coin.cashInRoleAccount),
				allowance: coin.cashInRoleAllowance
					? coin.cashInRoleAllowance.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
			};
			const providedKeys = [
				coin.adminKey,
				coin.kycKey,
				coin.freezeKey,
				coin.wipeKey,
				coin.supplyKey,
				coin.feeScheduleKey,
				coin.pauseKey,
			];

			const keys: FactoryKey[] =
				this.setKeysForSmartContract(providedKeys);

			const providedRoles = [
				{
					account: coin.burnRoleAccount,
					role: StableCoinRole.BURN_ROLE,
				},
				{
					account: coin.wipeRoleAccount,
					role: StableCoinRole.WIPE_ROLE,
				},
				{
					account: coin.rescueRoleAccount,
					role: StableCoinRole.RESCUE_ROLE,
				},
				{
					account: coin.pauseRoleAccount,
					role: StableCoinRole.PAUSE_ROLE,
				},
				{
					account: coin.freezeRoleAccount,
					role: StableCoinRole.FREEZE_ROLE,
				},
				{
					account: coin.deleteRoleAccount,
					role: StableCoinRole.DELETE_ROLE,
				},
				{ account: coin.kycRoleAccount, role: StableCoinRole.KYC_ROLE },
				{
					account: coin.feeRoleAccount,
					role: StableCoinRole.CUSTOM_FEES_ROLE,
				},
			];

			const roles = await Promise.all(
				providedRoles
					.filter((item) => {
						return (
							item.account &&
							item.account.value !== HederaId.NULL.value
						);
					})
					.map(async (item) => {
						const role = new FactoryRole();
						role.role = item.role;
						role.account = await this.getEVMAddress(item.account!);
						return role;
					}),
			);

			const stableCoinToCreate = new FactoryStableCoin(
				coin.name,
				coin.symbol,
				coin.freezeDefault ?? false,
				coin.supplyType == TokenSupplyType.FINITE,
				coin.maxSupply
					? coin.maxSupply.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
				coin.initialSupply
					? coin.initialSupply.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
				coin.decimals,
				reserveAddress == undefined ||
				reserveAddress.toString() == '0.0.0'
					? '0x0000000000000000000000000000000000000000'
					: (
							await mirrorNodeAdapter.getContractInfo(
								reserveAddress.value,
							)
					  ).evmAddress,
				reserveInitialAmount
					? reserveInitialAmount.toFixedNumber()
					: BigDecimal.ZERO.toFixedNumber(),
				createReserve,
				keys,
				roles,
				cashinRole,
				coin.metadata ?? '',
				proxyAdminOwnerAccount == undefined ||
				proxyAdminOwnerAccount.toString() == '0.0.0'
					? '0x0000000000000000000000000000000000000000'
					: HContractId.fromString(
							proxyAdminOwnerAccount.value,
					  ).toSolidityAddress(),
			);
			const params = [
				stableCoinToCreate,
				(
					await mirrorNodeAdapter.getContractInfo(
						hederaTokenManager.value,
					)
				).evmAddress,
			];

			return await this.contractCall(
				factory.value,
				'deployStableCoin',
				params,
				CREATE_SC_GAS,
				TransactionType.RECORD,
				StableCoinFactory__factory.abi,
				TOKEN_CREATION_COST_HBAR,
			);
		} catch (error) {
			throw new Error(
				`Unexpected error in HederaTransactionHandler create operation: ${error}`,
			);
		}
	};

	return {
		HTSTransactionAdapter: jest.fn(() => HTSTransactionAdapterMock),
	};
});

jest.mock('../src/port/out/backend/BackendAdapter', () => {
	let multiSigTransaction: MultiSigTransaction;

	return {
		BackendAdapter: jest.fn().mockImplementation(() => ({
			set: jest.fn().mockResolvedValue('mocked set'),
			addTransaction: jest.fn(
				(
					transactionMessage: string,
					description: string,
					HederaAccountId: string,
					keyList: string[],
					threshold: number,
					network: Environment,
					startDate: string,
				) => {
					multiSigTransaction = new MultiSigTransaction(
						'1',
						transactionMessage,
						description,
						'pending',
						threshold,
						keyList,
						[],
						[],
						network,
						HederaAccountId,
						startDate,
					);
				},
			),
			signTransaction: jest.fn(
				(
					transactionId: string,
					transactionSignature: string,
					publicKey: string,
				) => {
					multiSigTransaction.signed_keys.push(publicKey);
					multiSigTransaction.signatures.push(transactionSignature);
					if (
						multiSigTransaction.signed_keys.length ==
						multiSigTransaction.threshold
					)
						multiSigTransaction.status = 'signed';
				},
			),
			deleteTransaction: jest
				.fn()
				.mockResolvedValue('mocked deleteTransaction'),
			getTransactions: jest.fn(() => {
				return {
					transactions: [multiSigTransaction],
					pagination: {
						totalItems: 0,
						itemCount: 0,
						itemsPerPage: 10,
						totalPages: 0,
						currentPage: 1,
					},
				};
			}),
			getTransaction: jest.fn(() => {
				return multiSigTransaction;
			}),
			// Add other methods as necessary
		})),
	};
});

jest.mock('../src/port/out/rpc/RPCQueryAdapter', () => {
	const actual = jest.requireActual('../src/port/out/rpc/RPCQueryAdapter.ts');

	const singletonInstance = new actual.RPCQueryAdapter();

	singletonInstance.init = jest.fn(
		(urlRpcProvider?: string, apiKey?: string) => {
			return 'init';
		},
	);
	singletonInstance.connect = jest.fn(() => {
		console.log('connecting');
	});
	singletonInstance.balanceOf = jest.fn(
		(address: EvmAddress, target: EvmAddress) => {
			const balance = balances.get(
				'0x' + target.toString().toUpperCase().substring(2),
			);
			if (balance) return BigDecimal.fromString(balance, DECIMALS);
			return BigDecimal.fromString('0', DECIMALS);
		},
	);
	singletonInstance.getReserveAddress = jest.fn((address: EvmAddress) => {
		return new ContractId(reserveAddress);
	});
	singletonInstance.getReserveAmount = jest.fn((address: EvmAddress) => {
		return BigNumber.from(reserveAmount);
	});
	singletonInstance.getReserveLatestRoundData = jest.fn(
		(address: EvmAddress) => {
			const b: BigNumber[] = [];
			b.push(BigNumber.from('1000'));
			b.push(BigNumber.from(reserveAmount));
			b.push(BigNumber.from('0'));
			b.push(BigNumber.from('0'));
			b.push(BigNumber.from('0'));
			return b;
		},
	);
	singletonInstance.isLimited = jest.fn(
		(address: EvmAddress, target: EvmAddress) => {
			const supplierAllowance = suppliers.get(
				'0x' + target.toString().toUpperCase().substring(2),
			);
			if (!supplierAllowance) return false;
			return !supplierAllowance.isUnlimited;
		},
	);
	singletonInstance.isUnlimited = jest.fn(
		(address: EvmAddress, target: EvmAddress) => {
			const supplierAllowance = suppliers.get(
				'0x' + target.toString().toUpperCase().substring(2),
			);
			if (!supplierAllowance) return false;
			return supplierAllowance.isUnlimited;
		},
	);
	singletonInstance.getRoles = jest.fn(
		(address: EvmAddress, target: EvmAddress) => {
			const r = roles.get(
				'0x' + target.toString().toUpperCase().substring(2),
			);
			if (!r) return [];
			return r;
		},
	);
	singletonInstance.getProxyImplementation = jest.fn(
		(proxyAdmin: EvmAddress, proxy: EvmAddress) => {
			return implementation;
		},
	);
	singletonInstance.getProxyAdmin = jest.fn((proxy: EvmAddress) => {
		return '0x0000000000000000000000000000000000000002';
	});
	singletonInstance.getProxyOwner = jest.fn((proxyAdmin: EvmAddress) => {
		return proxyOwner;
	});
	singletonInstance.getProxyPendingOwner = jest.fn(
		(proxyAdmin: EvmAddress) => {
			return proxyPendingOwner;
		},
	);
	singletonInstance.getAccountsWithRole = jest.fn(
		(address: EvmAddress, role: string) => {
			const accounts = accounts_with_roles.get(role);
			if (!accounts) return [];
			return accounts;
		},
	);
	singletonInstance.hasRole = jest.fn(
		(address: EvmAddress, target: EvmAddress, role: StableCoinRole) => {
			const target_roles = roles.get(
				'0x' + target.toString().toUpperCase().substring(2),
			);
			if (!target_roles) return false;
			if (target_roles?.includes(role)) return true;
			return false;
		},
	);
	singletonInstance.supplierAllowance = jest.fn(
		(address: EvmAddress, target: EvmAddress) => {
			const supplierAllowance = suppliers.get(
				'0x' + target.toString().toUpperCase().substring(2),
			);
			if (!supplierAllowance) return 0;
			return supplierAllowance.amount;
		},
	);
	singletonInstance.getReserveDecimals = jest.fn((address: EvmAddress) => {
		return DECIMALS;
	});
	singletonInstance.getTokenManagerList = jest.fn(
		(factoryAddress: EvmAddress) => {
			return [
				'0x' +
					identifiers(HederaId.from(HEDERA_TOKEN_MANAGER_ADDRESS))[1]
						.toUpperCase()
						.substring(2),
			];
		},
	);
	singletonInstance.getMetadata = jest.fn((address: EvmAddress) => {
		return metadata;
	});

	return {
		RPCQueryAdapter: jest.fn(() => singletonInstance),
	};
});

jest.mock('axios', () => {
	return {
		create: jest.fn(() => ({
			post: jest.fn((url, body, config) => {
				const expectedTransaction = TRANSACTION;
				if (
					url == '' &&
					body.transaction_message ==
						expectedTransaction.transaction_message &&
					body.description == expectedTransaction.description &&
					body.hedera_account_id ==
						expectedTransaction.hedera_account_id &&
					body.key_list.length ==
						expectedTransaction.key_list.length &&
					body.key_list[0] == expectedTransaction.key_list[0] &&
					body.key_list[1] == expectedTransaction.key_list[1] &&
					body.threshold == expectedTransaction.threshold &&
					body.network == expectedTransaction.network &&
					config.headers.Origin == expectedTransaction.originHeader &&
					new Date(body.start_date).getTime() ==
						new Date(expectedTransaction.startDate).getTime()
				)
					return {
						status: 201,
						data: {
							transactionId: 'transactionId',
						},
					};
				return {
					status: 400,
				};
			}),
			put: jest.fn((url, body) => {
				const expectedSignature = SIGNATURE;
				const expectedUpdate = UPDATE;

				if (
					url == expectedSignature.transactionId + '/signature' &&
					body.signature == expectedSignature.transactionSignature &&
					body.public_key == expectedSignature.publicKey
				)
					return {
						status: 204,
					};
				else if (
					url == expectedUpdate.transactionId + '/update' &&
					body.status == expectedUpdate.status
				)
					return {
						status: 204,
					};
				else
					return {
						status: 400,
					};
			}),
			get: jest.fn((url, body) => {
				if (url == GET_TRANSACTION.id)
					return {
						status: 200,
						data: GET_TRANSACTION,
					};
				if (
					body.params.page == GET_TRANSACTIONS.page &&
					body.params.limit == GET_TRANSACTIONS.limit &&
					body.params.network == GET_TRANSACTIONS.network
				) {
					if (
						!body.params.publicKey &&
						!body.params.status &&
						!body.params.hederaAccountId
					)
						return {
							status: 200,
							data: {
								items: [GET_TRANSACTION],
								meta: PAGINATION,
							},
						};

					if (
						body.params.publicKey == GET_TRANSACTIONS.publicKey &&
						body.params.status == GET_TRANSACTIONS.status &&
						body.params.hederaAccountId ==
							GET_TRANSACTIONS.accountId
					)
						return {
							status: 200,
							data: {
								items: [GET_TRANSACTION],
								meta: PAGINATION,
							},
						};
				}

				return {
					status: 400,
				};
			}),
			delete: jest.fn((url, config) => {
				if (
					url == DELETE.transactionId &&
					config.headers.Origin == DELETE.originHeader
				)
					return {
						status: 200,
					};
				return {
					status: 400,
				};
			}),
		})),
	};
});

jest.mock('@hashgraph/hedera-custodians-integration', () => {
	const actual = jest.requireActual(
		'@hashgraph/hedera-custodians-integration',
	);

	let configuration: IStrategyConfig;

	return {
		...actual,
		CustodialWalletService: jest
			.fn()
			.mockImplementation((config: IStrategyConfig) => {
				configuration = config;
				return {
					signTransaction: async function (
						signatureRequest: SignatureRequest,
					): Promise<Uint8Array> {
						const message = signatureRequest.getTransactionBytes();
						const signer =
							CLIENT_PRIVATE_KEY_ECDSA_2.toHashgraphKey();
						const signed_Message = await signer.sign(message);
						return signed_Message;
					},
				};
			}),
	};
});
