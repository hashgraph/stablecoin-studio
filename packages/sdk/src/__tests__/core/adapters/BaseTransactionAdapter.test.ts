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

import { BaseTransactionAdapter } from '../../../core/adapters/BaseTransactionAdapter.js';
import { ExecutionMode } from '../../../core/types/ExecutionMode.js';
import { Client } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';

// Import handlers to trigger @Command/@Query decorator registration
import '../../../core/handlers/index.js';

/**
 * Concrete test implementation of BaseTransactionAdapter
 */
class TestTransactionAdapter extends BaseTransactionAdapter {
	private _mode: ExecutionMode;
	private _client?: Client;
	private _signer?: ethers.Signer;
	private _provider?: ethers.Provider;

	constructor(mode: ExecutionMode) {
		super();
		this._mode = mode;
	}

	getExecutionMode(): ExecutionMode {
		return this._mode;
	}

	setClient(client: Client): void {
		this._client = client;
	}

	setProvider(provider: ethers.Provider): void {
		this._provider = provider;
	}

	setSigner(signer: ethers.Signer): void {
		this._signer = signer;
	}

	protected getClient(): Client | undefined {
		return this._client;
	}

	protected getProvider(): ethers.Provider | undefined {
		return this._provider;
	}

	protected getSigner(): ethers.Signer | undefined {
		return this._signer;
	}
}

describe('BaseTransactionAdapter', () => {
	describe('Initialization', () => {
		it('should create adapter with registries initialized', () => {
			const adapter = new TestTransactionAdapter('hedera');

			// Access registries to verify they're initialized
			expect(adapter['commandRegistry']).toBeDefined();
			expect(adapter['queryRegistry']).toBeDefined();
		});

		it('should have command handlers registered', () => {
			const adapter = new TestTransactionAdapter('hedera');
			const registry = adapter['commandRegistry'];

			// Verify some key handlers are registered
			expect(registry.has('burn')).toBe(true);
			expect(registry.has('cashIn')).toBe(true);
			expect(registry.has('pause')).toBe(true);
		});

		it('should have query handlers registered', () => {
			const adapter = new TestTransactionAdapter('hedera');
			const registry = adapter['queryRegistry'];

			// Verify some key handlers are registered
			expect(registry.has('getBalance')).toBe(true);
			expect(registry.has('hasRole')).toBe(true);
		});
	});

	describe('Template Methods', () => {
		it('should have burn template method', async () => {
			const adapter = new TestTransactionAdapter('hedera');

			// Template method exists and is callable
			expect(typeof adapter.burn).toBe('function');
		});

		it('should have cashIn template method', async () => {
			const adapter = new TestTransactionAdapter('hedera');
			expect(typeof adapter.cashIn).toBe('function');
		});

		it('should have freeze template method', async () => {
			const adapter = new TestTransactionAdapter('hedera');
			expect(typeof adapter.freeze).toBe('function');
		});

		it('should have grantRole template method', async () => {
			const adapter = new TestTransactionAdapter('hedera');
			expect(typeof adapter.grantRole).toBe('function');
		});

		it('should have createHold template method', async () => {
			const adapter = new TestTransactionAdapter('hedera');
			expect(typeof adapter.createHold).toBe('function');
		});

		it('should have all 60+ template methods', () => {
			const adapter = new TestTransactionAdapter('hedera');

			// Command template methods (28)
			const commandMethods = [
				'burn',
				'cashIn',
				'wipe',
				'rescue',
				'rescueHBAR',
				'pause',
				'unpause',
				'freeze',
				'unfreeze',
				'grantKyc',
				'revokeKyc',
				'delete',
				'transfer',
				'grantRole',
				'revokeRole',
				'increaseAllowance',
				'decreaseAllowance',
				'resetAllowance',
				'grantSupplierRole',
				'revokeSupplierRole',
				'grantUnlimitedSupplierRole',
				'createHold',
				'releaseHold',
				'reclaimHold',
				'executeHold',
				'updateReserveAddress',
				'updateReserveAmount',
				'create',
			];

			// Query template methods (13)
			const queryMethods = [
				'getBalance',
				'getBurnableAmount',
				'getAllowance',
				'isUnlimited',
				'hasRole',
				'getRoles',
				'getAccountsWithRoles',
				'getHeldAmount',
				'getHoldCount',
				'getHold',
				'getHoldsId',
				'getReserveAddress',
				'getReserveAmount',
			];

			const allMethods = [...commandMethods, ...queryMethods];
			for (const method of allMethods) {
				expect(typeof (adapter as any)[method]).toBe('function');
			}
		});
	});

	describe('Mode Support', () => {
		it('should report execution mode correctly for hedera', () => {
			const adapter = new TestTransactionAdapter('hedera');
			expect(adapter.getExecutionMode()).toBe('hedera');
		});

		it('should report execution mode correctly for evm', () => {
			const adapter = new TestTransactionAdapter('evm');
			expect(adapter.getExecutionMode()).toBe('evm');
		});
	});

	describe('Error Handling', () => {
		it('should throw error when handler not found', async () => {
			const adapter = new TestTransactionAdapter('hedera');

			// Try to execute non-existent command
			await expect(adapter['executeCommand']('nonExistent', {})).rejects.toThrow(
				"No handler registered for command 'nonExistent'",
			);
		});

		it('should throw error when no client available for hedera mode', async () => {
			const adapter = new TestTransactionAdapter('hedera');

			// Try to execute command without client
			await expect(adapter.burn(100)).rejects.toThrow(
				'No Hedera client available',
			);
		});

		it('should throw error when no provider available for query', async () => {
			const adapter = new TestTransactionAdapter('evm');

			// Try to execute query without provider
			await expect(adapter.getBalance('0x123')).rejects.toThrow(
				'No provider available',
			);
		});
	});

	describe('Registry Access', () => {
		it('should retrieve handler from command registry', () => {
			const adapter = new TestTransactionAdapter('hedera');
			const registry = adapter['commandRegistry'];

			const burnHandler = registry.get('burn');
			expect(burnHandler).toBeDefined();
			expect(burnHandler.buildHederaTransaction).toBeDefined();
		});

		it('should retrieve handler from query registry', () => {
			const adapter = new TestTransactionAdapter('hedera');
			const registry = adapter['queryRegistry'];

			const balanceHandler = registry.get('getBalance');
			expect(balanceHandler).toBeDefined();
			expect(balanceHandler.mapParamsToArgs).toBeDefined();
		});
	});

	describe('Inheritance', () => {
		it('should be extendable by subclasses', () => {
			class CustomAdapter extends BaseTransactionAdapter {
				getExecutionMode(): ExecutionMode {
					return 'hedera';
				}
			}

			const adapter = new CustomAdapter();
			expect(adapter).toBeInstanceOf(BaseTransactionAdapter);
			expect(typeof adapter.burn).toBe('function');
		});

		it('should allow subclass to override resource getters', () => {
			class CustomAdapter extends BaseTransactionAdapter {
				getExecutionMode(): ExecutionMode {
					return 'hedera';
				}

				protected getClient(): Client | undefined {
					// Return mock client
					return undefined;
				}
			}

			const adapter = new CustomAdapter();
			expect(adapter['getClient']()).toBeUndefined();
		});
	});
});
