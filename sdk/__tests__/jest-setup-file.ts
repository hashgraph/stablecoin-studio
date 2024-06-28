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

import 'reflect-metadata';
import MultiKey from '../src/domain/context/account/MultiKey.js';
import {
	AccountViewModel,
	BigDecimal,
	ContractId,
	EvmAddress,
	HBAR_DECIMALS,
	HederaId,
	InitializationData,
	MAX_PERCENTAGE_DECIMALS,
	Network,
	PublicKey,
	RequestCustomFee,
	RequestFixedFee,
	RequestFractionalFee,
	StableCoinListViewModel,
	StableCoinRole,
	StableCoinViewModel,
	WalletEvents,
} from '../src/index.js';
import {
	CLIENT_ACCOUNT_ED25519,
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
} from './config.js';
import {
	ContractExecuteTransaction,
	CustomFee,
	TokenFeeScheduleUpdateTransaction,
	Transaction,
} from '@hashgraph/sdk';
import { TransactionType } from '../src/port/out/TransactionResponseEnums.js';
import TransactionResponse from '../src/domain/context/transaction/TransactionResponse.js';
import Account from '../src/domain/context/account/Account.js';
import TransactionResultViewModel from '../src/port/out/mirror/response/TransactionResultViewModel.js';
import {
	AccountTokenRelationViewModel,
	FreezeStatus,
	KycStatus,
} from '../src/port/out/mirror/response/AccountTokenRelationViewModel.js';
import ContractViewModel from '../src/port/out/mirror/response/ContractViewModel.js';
import Injectable from '../src/core/Injectable.js';
import TransactionAdapter from '../src/port/out/TransactionAdapter.js';
import { Environment } from '../src/domain/context/network/Environment.js';
import { MultiSigTransaction } from '../src/domain/context/transaction/MultiSigTransaction.js';
import { BigNumber, ethers } from 'ethers';
import EventService from '../src/app/service/event/EventService.js';
import { MirrorNodeAdapter } from '../src/port/out/mirror/MirrorNodeAdapter.js';
import NetworkService from '../src/app/service/NetworkService.js';

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
const feeScheduleKey: any = undefined;
let autoRenewPeriod = 1000;
const autoRenewAccount = AUTO_RENEW_ACCOUNT;

let proxyOwner = '0x0000000000000000000000000000000000000003';
let proxyPendingOwner = '0x0000000000000000000000000000000000000000';
let implementation = identifiers(
	HederaId.from(HEDERA_TOKEN_MANAGER_ADDRESS),
)[1];
let reserveAmount = '100000000000000';
let reserveAddress = '0x0000000000000000000000000000000000000001';
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

function grantRole(account: string, newRole: StableCoinRole) {
	let r = roles.get(account);
	if (!r) r = [newRole];
	else if (false == r.includes(newRole)) r.push(newRole);
	roles.set(account, r);

	let accounts = accounts_with_roles.get(newRole);
	if (!accounts) accounts = [account];
	else if (false == accounts.includes(account)) accounts.push(account);
	accounts_with_roles.set(newRole, accounts);
}

function revokeRole(account: string, oldRole: StableCoinRole) {
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

function grantSupplierRole(supplier: string, amount: BigDecimal) {
	grantRole(supplier, StableCoinRole.CASHIN_ROLE);

	const newAllowance: allowance = {
		isUnlimited: false,
		amount: amount.toString(),
	};

	suppliers.set(supplier, newAllowance);
}

function grantUnlimitedSupplierRole(supplier: string) {
	grantRole(supplier, StableCoinRole.CASHIN_ROLE);

	const newAllowance: allowance = {
		isUnlimited: true,
		amount: '0',
	};

	suppliers.set(supplier, newAllowance);
}

function revokeSupplierRole(supplier: string) {
	revokeRole(supplier, StableCoinRole.CASHIN_ROLE);
	const supplierAllowance = suppliers.get(supplier);
	if (supplierAllowance) suppliers.delete(supplier);
}

function assignKey(value: any, id: number) {
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

function smartContractCalls(functionName: string, decoded: any) {
	if (functionName == 'transferOwnership') {
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
		reserveAddress = newAddress;
	} else if (functionName == 'wipe') {
		const amount = (decoded as any).amount;
		const account =
			'0x' + (decoded as any).account.toUpperCase().substring(2);
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
) {
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

jest.mock('../src/port/out/mirror/MirrorNodeAdapter', () => {
	const actual = jest.requireActual(
		'../src/port/out/mirror/MirrorNodeAdapter.ts',
	);

	const singletonInstance = new actual.MirrorNodeAdapter();

	singletonInstance.set = jest.fn().mockResolvedValue('mocked set');
	singletonInstance.getStableCoinsList = jest.fn((accountId: HederaId) => {
		const response: StableCoinListViewModel = {
			coins: [{ symbol: 'A', id: accountId.toString() }],
		};
		return response;
	});
	singletonInstance.getTokenInfo = jest.fn((tokenId: HederaId) => {
		const response = {
			status: 200,
			data: null,
		};
		return response;
	});
	singletonInstance.getStableCoin = jest.fn((tokenId: HederaId) => {
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
			reserveAddress: new ContractId(
				'0.0.' +
					hexToDecimal(
						'0x' + reserveAddress.toUpperCase().substring(2),
					),
			),
			reserveAmount: BigDecimal.fromString(reserveAmount, DECIMALS),
			customFees: requestCustomFees,
			metadata: metadata,
		};
		return response;
	});
	singletonInstance.getAccountInfo = jest.fn(
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
	singletonInstance.getContractMemo = jest.fn((contractId: HederaId) => {
		return '0x0000000000000000000000000000000000000001';
	});
	singletonInstance.getContractInfo = jest.fn(
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
	singletonInstance.getAccountToken = jest.fn(
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
	singletonInstance.getTransactionResult = jest.fn(
		(transactionId: string) => {
			const response: TransactionResultViewModel = {
				result: 'resultMessage',
			};
			return response;
		},
	);
	singletonInstance.getTransactionFinalError = jest.fn(
		(transactionId: string) => {
			const response: TransactionResultViewModel = {
				result: 'resultMessage',
			};
			return response;
		},
	);
	singletonInstance.accountToEvmAddress = jest.fn((accountId: HederaId) => {
		const ids = identifiers(accountId);
		return ids[1];
	});
	singletonInstance.getHBARBalance = jest.fn(
		(accountId: HederaId | string) => {
			const balance = HBAR_balances.get(identifiers(accountId)[1]);
			if (balance) return BigDecimal.fromString(balance, HBAR_DECIMALS);
			return BigDecimal.fromString('0', HBAR_DECIMALS);
		},
	);

	return {
		MirrorNodeAdapter: jest.fn(() => singletonInstance),
	};
});

jest.mock('../src/port/out/hs/hts/HTSTransactionAdapter', () => {
	const actual = jest.requireActual(
		'../src/port/out/hs/hts/HTSTransactionAdapter.ts',
	);

	const singletonInstance = new actual.HTSTransactionAdapter();

	singletonInstance.init = jest.fn(() => {
		balances.set(
			identifiers(HederaId.from(PROXY_CONTRACT_ID))[1],
			initialSupply,
		);
		HBAR_balances.set(
			identifiers(HederaId.from(PROXY_CONTRACT_ID))[1],
			INITIAL_HBAR_SUPPLY,
		);
	});

	singletonInstance.register = function (account: Account) {
		user_account = account;
		Injectable.registerTransactionHandler(this); // `this` now correctly refers to the singletonInstance
		const response = {
			account: account,
			pairing: 'pairing',
			topic: 'topic',
		};
		return response;
	};

	singletonInstance.stop = function () {
		return Promise.resolve(true);
	};

	singletonInstance.signAndSendTransaction = function (
		t: Transaction,
		transactionType: TransactionType,
		functionName: string,
		abi: object[],
	) {
		signAndSendTransaction(t, transactionType, functionName, abi);
		const response = new TransactionResponse('1', null, undefined);
		return Promise.resolve(response);
	};

	singletonInstance.getAccount = function () {
		return user_account;
	};

	singletonInstance.sign = function (
		message: string | Transaction,
	): Promise<string> {
		return Promise.resolve('signedMessage');
	};

	singletonInstance.getMirrorNodeAdapter = function () {
		return new MirrorNodeAdapter();
	};

	return {
		HTSTransactionAdapter: jest.fn(() => singletonInstance),
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
		return new ContractId(
			'0.0.' +
				hexToDecimal('0x' + reserveAddress.toUpperCase().substring(2)),
		);
	});
	singletonInstance.getReserveAmount = jest.fn((address: EvmAddress) => {
		return BigNumber.from(reserveAmount);
	});
	singletonInstance.getReserveLatestRoundData = jest.fn(
		(address: EvmAddress) => {
			[BigNumber.from('1000'), BigNumber.from('1000')];
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
