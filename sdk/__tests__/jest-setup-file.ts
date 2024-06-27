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

const tokens = new Map<string, token>();

let proxyOwner = '0x0000000000000000000000000000000000000003';
let proxyPendingOwner = '0x0000000000000000000000000000000000000000';
let implementation = identifiers(
	HederaId.from(HEDERA_TOKEN_MANAGER_ADDRESS),
)[1];
let reserveAmount = BigNumber.from('1000');

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
		id = '0.0.' + hexToDecimal(accountId);
		accountEvmAddress = accountId.toString();
	}

	return [id, accountEvmAddress];
}

jest.mock('../src/port/out/mirror/MirrorNodeAdapter', () => {
	const actual = jest.requireActual(
		'../src/port/out/mirror/MirrorNodeAdapter.ts',
	);

	const singletonInstance = new actual.MirrorNodeAdapter();

	const decimals = 3;

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
			name: 'TestToken',
			symbol: 'TT',
			decimals: decimals,
			totalSupply: BigDecimal.fromString('1000', decimals),
			maxSupply: BigDecimal.fromString('100000', decimals),
			initialSupply: BigDecimal.fromString('1000', decimals),
			treasury: HederaId.from('0.0.5'),
			proxyAddress: new ContractId('0.0.1'),
			proxyAdminAddress: new ContractId('0.0.1'),
			evmProxyAddress: new EvmAddress(
				'0x0000000000000000000000000000000000000001',
			),
			evmProxyAdminAddress: new EvmAddress(
				'0x0000000000000000000000000000000000000001',
			),
			expirationTime: '1000000',
			freezeDefault: false,
			autoRenewAccount: HederaId.from('0.0.5'),
			autoRenewPeriod: 1000,
			expirationTimestamp: 10000,
			paused: false,
			deleted: false,
			adminKey: new ContractId('0.0.1'),
			kycKey: new ContractId('0.0.1'),
			freezeKey: new ContractId('0.0.1'),
			wipeKey: new ContractId('0.0.1'),
			supplyKey: new ContractId('0.0.1'),
			pauseKey: new ContractId('0.0.1'),
			feeScheduleKey: undefined,
			reserveAddress: new ContractId('0.0.2'),
			reserveAmount: BigDecimal.fromString('100000', decimals),
			customFees: requestCustomFees,
			metadata: 'nothing',
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
			const response: AccountTokenRelationViewModel = {
				automaticAssociation: true,
				balance: BigDecimal.fromString('1000', decimals),
				createdTimestamp: '10000000',
				freezeStatus: FreezeStatus.UNFROZEN,
				kycStatus: KycStatus.GRANTED,
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
			const response = BigDecimal.fromString('1000', decimals);
			return response;
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

	singletonInstance.init = jest.fn(() => 'init');

	singletonInstance.register = function (account: Account) {
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
		if (t instanceof TokenFeeScheduleUpdateTransaction) {
			const tokenId = (
				t as TokenFeeScheduleUpdateTransaction
			).tokenId!.toString();
			const customFees = (t as TokenFeeScheduleUpdateTransaction)
				.customFees;
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

			if (functionName == 'transferOwnership') {
				proxyPendingOwner = (decoded as any).newOwner;
			} else if (functionName == 'acceptOwnership') {
				proxyOwner = proxyPendingOwner;
				proxyPendingOwner =
					'0x0000000000000000000000000000000000000000';
			} else if (functionName == 'upgrade') {
				implementation = (decoded as any).implementation;
			} else if (functionName == 'setAmount') {
				reserveAmount = (decoded as any).newValue;
			}
		}
		const response = new TransactionResponse('1', null, undefined);
		return Promise.resolve(response);
	};

	singletonInstance.getAccount = function () {
		const response = new Account({
			id: '0.0.1',
		});
		return response;
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
			return BigNumber.from('10');
		},
	);
	singletonInstance.getReserveAddress = jest.fn((address: EvmAddress) => {
		return ContractId.from('0.0.1');
	});
	singletonInstance.getReserveAmount = jest.fn((address: EvmAddress) => {
		return reserveAmount;
	});
	singletonInstance.getReserveLatestRoundData = jest.fn(
		(address: EvmAddress) => {
			[BigNumber.from('1000'), BigNumber.from('1000')];
		},
	);
	singletonInstance.isLimited = jest.fn(
		(address: EvmAddress, target: EvmAddress) => {
			return false;
		},
	);
	singletonInstance.isUnlimited = jest.fn(
		(address: EvmAddress, target: EvmAddress) => {
			return true;
		},
	);
	singletonInstance.getRoles = jest.fn(
		(address: EvmAddress, target: EvmAddress) => {
			return ['role_1', 'role_2'];
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
			return [
				'0x0000000000000000000000000000000000000001',
				'0x0000000000000000000000000000000000000002',
			];
		},
	);
	singletonInstance.hasRole = jest.fn(
		(address: EvmAddress, target: EvmAddress, role: StableCoinRole) => {
			return true;
		},
	);
	singletonInstance.supplierAllowance = jest.fn(
		(address: EvmAddress, target: EvmAddress) => {
			return BigNumber.from('1000');
		},
	);
	singletonInstance.getReserveDecimals = jest.fn((address: EvmAddress) => {
		return 3;
	});
	singletonInstance.getTokenManagerList = jest.fn(
		(factoryAddress: EvmAddress) => {
			return [
				identifiers(HederaId.from(HEDERA_TOKEN_MANAGER_ADDRESS))[1],
			];
		},
	);
	singletonInstance.getMetadata = jest.fn((address: EvmAddress) => {
		return 'metadata';
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
