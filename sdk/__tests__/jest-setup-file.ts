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
	HederaId,
	InitializationData,
	Network,
	PublicKey,
	StableCoinListViewModel,
	StableCoinRole,
	StableCoinViewModel,
} from '../src/index.js';
import { CLIENT_ACCOUNT_ED25519, CLIENT_PUBLIC_KEY_ED25519 } from './config.js';
import { Transaction } from '@hashgraph/sdk';
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
import { BigNumber } from 'ethers';

/*jest.mock('../src/port/out/mirror/MirrorNodeAdapter', () => {
	const decimals = 3;

	return {
		MirrorNodeAdapter: jest.fn().mockImplementation(() => ({
			set: jest.fn().mockResolvedValue('mocked set'),
			getStableCoinsList: jest.fn((accountId: HederaId) => {
				const response: StableCoinListViewModel = {
					coins: [{ symbol: 'A', id: accountId.toString() }],
				};
				return response;
			}),
			getTokenInfo: jest.fn((tokenId: HederaId) => {
				const response = {
					status: 200,
					data: null,
				};
				return response;
			}),
			getStableCoin: jest.fn((tokenId: HederaId) => {
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
					customFees: [],
					metadata: 'nothing',
				};
				return response;
			}),
			getAccountInfo: jest.fn((accountId: HederaId | string) => {
				const response: AccountViewModel = {
					id: accountId.toString(),
					accountEvmAddress: '0x001',
					publicKey: CLIENT_PUBLIC_KEY_ED25519,
					alias: 'anything',
					multiKey: new MultiKey([], 0),
				};
				return response;
			}),
			getContractMemo: jest.fn((contractId: HederaId) => {
				return 'Memo';
			}),
			getContractInfo: jest.fn((contractEvmAddress: string) => {
				const response: ContractViewModel = {
					id: '1',
					evmAddress: contractEvmAddress,
				};
				return response;
			}),
			getAccountToken: jest.fn(
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
			),
			getTransactionResult: jest.fn((transactionId: string) => {
				const response: TransactionResultViewModel = {
					result: 'resultMessage',
				};
				return response;
			}),
			getTransactionFinalError: jest.fn((transactionId: string) => {
				const response: TransactionResultViewModel = {
					result: 'resultMessage',
				};
				return response;
			}),
			accountToEvmAddress: jest.fn((accountId: HederaId) => {
				const response = new EvmAddress(
					'0x0000000000000000000000000000000000000001',
				);
				return response;
			}),
			getHBARBalance: jest.fn((accountId: HederaId | string) => {
				const response = BigDecimal.fromString('1000', decimals);
				return response;
			}),
		})),
	};
});*/

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
			customFees: [],
			metadata: 'nothing',
		};
		return response;
	});
	singletonInstance.getAccountInfo = jest.fn(
		(accountId: HederaId | string) => {
			const response: AccountViewModel = {
				id: accountId.toString(),
				accountEvmAddress: '0x001',
				publicKey: CLIENT_PUBLIC_KEY_ED25519,
				alias: 'anything',
				multiKey: new MultiKey([], 0),
			};
			return response;
		},
	);
	singletonInstance.getContractMemo = jest.fn((contractId: HederaId) => {
		return 'Memo';
	});
	singletonInstance.getContractInfo = jest.fn(
		(contractEvmAddress: string) => {
			const response: ContractViewModel = {
				id: '1',
				evmAddress: '0x0000000000000000000000000000000000000001',
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
		const response = new EvmAddress(
			'0x0000000000000000000000000000000000000001',
		);
		return response;
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
		return BigNumber.from('1000');
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
			return '0x0000000000000000000000000000000000000001';
		},
	);
	singletonInstance.getProxyAdmin = jest.fn((proxy: EvmAddress) => {
		return '0x0000000000000000000000000000000000000002';
	});
	singletonInstance.getProxyOwner = jest.fn((proxyAdmin: EvmAddress) => {
		return '0x0000000000000000000000000000000000000003';
	});
	singletonInstance.getProxyPendingOwner = jest.fn(
		(proxyAdmin: EvmAddress) => {
			return '0x0000000000000000000000000000000000000004';
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
				'0x0000000000000000000000000000000000000001',
				'0x0000000000000000000000000000000000000002',
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

/*jest.mock('../src/port/out/rpc/RPCQueryAdapter', () => {
	return {
		RPCQueryAdapter: jest.fn().mockImplementation(() => ({
			constructor: jest.fn(() => {}),
			init: jest.fn(
				(urlRpcProvider?: string, apiKey?: string) => {
					return 'init';
				},
			),
			connect: jest.fn(() => {}),
			balanceOf: jest.fn(
				(address: EvmAddress, target: EvmAddress) => {
					return BigNumber.from('10');
				},
			),
			getReserveAddress: jest.fn((address: EvmAddress) => {
				return ContractId.from('0.0.1');
			}),
			getReserveAmount: jest.fn((address: EvmAddress) => {
				return BigNumber.from('1000');
			}),
			getReserveLatestRoundData: jest.fn(
				(address: EvmAddress) => {
					[BigNumber.from('1000'), BigNumber.from('1000')];
				},
			),
			isLimite: jest.fn(
				(address: EvmAddress, target: EvmAddress) => {
					return false;
				},
			),
			isUnlimited: jest.fn(
				(address: EvmAddress, target: EvmAddress) => {
					return true;
				},
			),
			getRoles: jest.fn(
				(address: EvmAddress, target: EvmAddress) => {
					return ['role_1', 'role_2'];
				},
			),
			getProxyImplementation: jest.fn(
				(proxyAdmin: EvmAddress, proxy: EvmAddress) => {
					return '0x0000000000000000000000000000000000000001';
				},
			),
			getProxyAdmin: jest.fn((proxy: EvmAddress) => {
				return '0x0000000000000000000000000000000000000002';
			}),
			getProxyOwner: jest.fn((proxyAdmin: EvmAddress) => {
				return '0x0000000000000000000000000000000000000003';
			}),
			getProxyPendingOwner: jest.fn(
				(proxyAdmin: EvmAddress) => {
					return '0x0000000000000000000000000000000000000004';
				},
			),
			getAccountsWithRole: jest.fn(
				(address: EvmAddress, role: string) => {
					return [
						'0x0000000000000000000000000000000000000001',
						'0x0000000000000000000000000000000000000002',
					];
				},
			),
			hasRole: jest.fn(
				(address: EvmAddress, target: EvmAddress, role: StableCoinRole) => {
					return true;
				},
			),
			supplierAllowance: jest.fn(
				(address: EvmAddress, target: EvmAddress) => {
					return BigNumber.from('1000');
				},
			),
			getReserveDecimals: jest.fn((address: EvmAddress) => {
				return 3;
			}),
			getTokenManagerList: jest.fn(
				(factoryAddress: EvmAddress) => {
					return [
						'0x0000000000000000000000000000000000000001',
						'0x0000000000000000000000000000000000000002',
					];
				},
			),
			getMetadata: jest.fn((address: EvmAddress) => {
				return 'metadata';
			}),
		})
	)}
	
});*/
