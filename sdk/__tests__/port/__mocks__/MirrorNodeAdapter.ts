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

import { HederaId } from '../../../src/index.js';

const mockImplementation = () => ({
	set: jest.fn().mockResolvedValue('mocked set'),
	getStableCoinsList: jest.fn((accountId: HederaId) => {
		console.log(accountId);
	}),
	getTokenInfo: jest.fn((tokenId: HederaId) => {
		console.log(tokenId);
	}),
	getStableCoin: jest.fn((tokenId: HederaId) => {
		console.log(tokenId);
	}),
	getAccountInfo: jest.fn((accountId: HederaId | string) => {
		console.log(accountId);
	}),
	getContractMemo: jest.fn((contractId: HederaId) => {
		// Add mock implementation here
	}),
	getContractInfo: jest.fn((contractEvmAddress: string) => {
		// Add mock implementation here
	}),
	getAccountToken: jest.fn((targetId: HederaId, tokenId: HederaId) => {
		// Add mock implementation here
	}),
	getTransactionResult: jest.fn((transactionId: string) => {
		// Add mock implementation here
	}),
	getTransactionFinalError: jest.fn((transactionId: string) => {
		// Add mock implementation here
	}),
	accountToEvmAddress: jest.fn((accountId: HederaId) => {
		console.log(accountId);
	}),
	getHBARBalance: jest.fn((accountId: HederaId | string) => {
		console.log(accountId);
	}),
});

jest.mock('../../../src/port/out/mirror/MirrorNodeAdapter', () => {
	return {
		MirrorNodeAdapter: jest.fn().mockImplementation(mockImplementation),
	};
});
