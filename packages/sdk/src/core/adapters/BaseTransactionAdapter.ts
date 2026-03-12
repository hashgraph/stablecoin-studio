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

import { Client } from '@hiero-ledger/sdk';
import { ethers } from 'ethers';
import { CommandHandlerRegistry } from '../registry/CommandHandlerRegistry.js';
import { QueryHandlerRegistry } from '../registry/QueryHandlerRegistry.js';
import { ExecutionMode } from '../types/ExecutionMode.js';
import { PipelineContext } from '../types/PipelineContext.js';
import { HederaExecutePipeline } from '../pipelines/HederaExecutePipeline.js';
import { EVMExecutePipeline } from '../pipelines/EVMExecutePipeline.js';
import { HederaSerializePipeline } from '../pipelines/HederaSerializePipeline.js';
import { EVMSerializePipeline } from '../pipelines/EVMSerializePipeline.js';
import { BasePipeline } from '../pipelines/BasePipeline.js';
import { ValidationError } from '../errors/ValidationError.js';

/**
 * BaseTransactionAdapter provides the bridge between the old adapter architecture
 * and the new handler + pipeline system.
 *
 * Subclasses (ClientTransactionAdapter, RPCTransactionAdapter, etc.) only need to:
 * 1. Provide the execution mode (hedera | evm)
 * 2. Optionally override getClient/getSigner/getProvider
 *
 * All 60 operations (burn, cashIn, freeze, roles, holds, etc.) are template methods
 * that delegate to executeCommand/executeQuery motor methods.
 */
export abstract class BaseTransactionAdapter {
	protected readonly commandRegistry: CommandHandlerRegistry;
	protected readonly queryRegistry: QueryHandlerRegistry;

	constructor() {
		this.commandRegistry = new CommandHandlerRegistry();
		this.queryRegistry = new QueryHandlerRegistry();
	}

	/**
	 * Subclasses must implement to return execution mode (hedera | evm)
	 */
	abstract getExecutionMode(): ExecutionMode;

	/**
	 * Subclasses may override to provide custom client (for Hedera mode)
	 */
	protected getClient(): Client | undefined {
		return undefined;
	}

	/**
	 * Subclasses may override to provide custom signer (for EVM mode)
	 */
	protected getSigner(): ethers.Signer | undefined {
		return undefined;
	}

	/**
	 * Subclasses may override to provide custom provider (for EVM mode)
	 */
	protected getProvider(): ethers.Provider | undefined {
		return undefined;
	}

	/**
	 * Motor method: executes a command through the handler + pipeline system
	 */
	protected async executeCommand(
		commandName: string,
		params: Record<string, unknown>,
	): Promise<any> {
		const handler = this.commandRegistry.get(commandName);
		const mode = this.getExecutionMode();

		// Validate handler supports this mode
		if (!handler.supportsMode(mode)) {
			throw new ValidationError(
				`Handler '${commandName}' does not support mode '${mode}'`,
			);
		}

		// Create pipeline context
		const context: PipelineContext = {
			command: commandName,
			params,
			handler,
		};

		// Select pipeline based on mode
		const pipeline = this.selectExecutePipeline(mode);

		// Execute pipeline
		const result = await pipeline.execute(context);
		if (result.error) {
			throw result.error;
		}

		return result.result;
	}

	/**
	 * Motor method: executes a query through the handler system
	 */
	protected async executeQuery(
		queryName: string,
		params: Record<string, unknown>,
	): Promise<any> {
		const handler = this.queryRegistry.get(queryName);

		// Queries don't support modes - they're just RPC reads
		const provider = this.getProvider();
		if (!provider) {
			throw new ValidationError('No provider available for query execution');
		}

		return await handler.execute(provider, params);
	}

	/**
	 * Select execute pipeline based on mode and available resources
	 */
	private selectExecutePipeline(mode: ExecutionMode): BasePipeline {
		if (mode === 'hedera') {
			const client = this.getClient();
			if (!client) {
				throw new ValidationError('No Hedera client available for hedera mode');
			}
			return new HederaExecutePipeline(client);
		} else if (mode === 'evm') {
			const signer = this.getSigner();
			const provider = this.getProvider();
			if (!signer || !provider) {
				throw new ValidationError(
					'No signer or provider available for evm mode',
				);
			}
			return new EVMExecutePipeline(provider, signer);
		}

		throw new ValidationError(`Unknown execution mode: ${mode}`);
	}

	/**
	 * Select serialize pipeline for preparing unsigned transactions
	 * Note: Serialize pipelines require ExternalSigningClient which is handled by specific adapters
	 * This method is provided as an extension point for subclasses that support serialization
	 */
	protected selectSerializePipeline(
		mode: ExecutionMode,
		externalClient?: any,
	): BasePipeline {
		if (mode === 'hedera') {
			if (!externalClient) {
				throw new ValidationError(
					'ExternalSigningClient required for Hedera serialization',
				);
			}
			const client = this.getClient();
			if (!client) {
				throw new ValidationError('No Hedera client available');
			}
			return new HederaSerializePipeline(client, externalClient);
		} else if (mode === 'evm') {
			if (!externalClient) {
				throw new ValidationError(
					'ExternalSigningClient required for EVM serialization',
				);
			}
			const provider = this.getProvider();
			if (!provider) {
				throw new ValidationError('No provider available');
			}
			return new EVMSerializePipeline(provider, externalClient);
		}

		throw new ValidationError(`Unknown execution mode: ${mode}`);
	}

	// ========== COMMAND TEMPLATE METHODS (60 total) ==========
	// Each simply delegates to executeCommand() motor method

	// Token Operations
	async burn(amount: any): Promise<any> {
		return this.executeCommand('burn', { amount });
	}

	async cashIn(targetId: any, amount: any): Promise<any> {
		return this.executeCommand('cashIn', { targetId, amount });
	}

	async wipe(targetId: any, amount: any): Promise<any> {
		return this.executeCommand('wipe', { targetId, amount });
	}

	async rescue(amount: any): Promise<any> {
		return this.executeCommand('rescue', { amount });
	}

	async rescueHBAR(amount: any): Promise<any> {
		return this.executeCommand('rescueHBAR', { amount });
	}

	// Token Control Operations
	async pause(): Promise<any> {
		return this.executeCommand('pause', {});
	}

	async unpause(): Promise<any> {
		return this.executeCommand('unpause', {});
	}

	async freeze(targetId: any): Promise<any> {
		return this.executeCommand('freeze', { targetId });
	}

	async unfreeze(targetId: any): Promise<any> {
		return this.executeCommand('unfreeze', { targetId });
	}

	async grantKyc(targetId: any): Promise<any> {
		return this.executeCommand('grantKyc', { targetId });
	}

	async revokeKyc(targetId: any): Promise<any> {
		return this.executeCommand('revokeKyc', { targetId });
	}

	async delete(): Promise<any> {
		return this.executeCommand('delete', {});
	}

	async transfer(from: any, to: any, amount: any): Promise<any> {
		return this.executeCommand('transfer', { from, to, amount });
	}

	// Role Operations
	async grantRole(role: any, targetId: any): Promise<any> {
		return this.executeCommand('grantRole', { role, targetId });
	}

	async revokeRole(role: any, targetId: any): Promise<any> {
		return this.executeCommand('revokeRole', { role, targetId });
	}

	// Supplier Operations
	async increaseAllowance(targetId: any, amount: any): Promise<any> {
		return this.executeCommand('increaseAllowance', { targetId, amount });
	}

	async decreaseAllowance(targetId: any, amount: any): Promise<any> {
		return this.executeCommand('decreaseAllowance', { targetId, amount });
	}

	async resetAllowance(targetId: any): Promise<any> {
		return this.executeCommand('resetAllowance', { targetId });
	}

	async grantSupplierRole(targetId: any, amount: any): Promise<any> {
		return this.executeCommand('grantSupplierRole', { targetId, amount });
	}

	async revokeSupplierRole(targetId: any): Promise<any> {
		return this.executeCommand('revokeSupplierRole', { targetId });
	}

	async grantUnlimitedSupplierRole(targetId: any): Promise<any> {
		return this.executeCommand('grantUnlimitedSupplierRole', { targetId });
	}

	// Hold Operations
	async createHold(
		notionalAmount: any,
		escrowId: any,
		expirationDate: any,
		targetId: any,
	): Promise<any> {
		return this.executeCommand('createHold', {
			notionalAmount,
			escrowId,
			expirationDate,
			targetId,
		});
	}

	async releaseHold(holdId: any): Promise<any> {
		return this.executeCommand('releaseHold', { holdId });
	}

	async reclaimHold(holdId: any): Promise<any> {
		return this.executeCommand('reclaimHold', { holdId });
	}

	async executeHold(holdId: any, amount: any, targetId: any): Promise<any> {
		return this.executeCommand('executeHold', { holdId, amount, targetId });
	}

	// Reserve Operations
	async updateReserveAddress(reserveAddress: any): Promise<any> {
		return this.executeCommand('updateReserveAddress', { reserveAddress });
	}

	async updateReserveAmount(amount: any): Promise<any> {
		return this.executeCommand('updateReserveAmount', { amount });
	}

	// ========== QUERY TEMPLATE METHODS (13 total) ==========

	async getBalance(targetId: any): Promise<any> {
		return this.executeQuery('getBalance', { targetId });
	}

	async getBurnableAmount(): Promise<any> {
		return this.executeQuery('getBurnableAmount', {});
	}

	async getAllowance(targetId: any): Promise<any> {
		return this.executeQuery('getAllowance', { targetId });
	}

	async isUnlimited(targetId: any): Promise<any> {
		return this.executeQuery('isUnlimited', { targetId });
	}

	async hasRole(role: any, targetId: any): Promise<any> {
		return this.executeQuery('hasRole', { role, targetId });
	}

	async getRoles(targetId: any): Promise<any> {
		return this.executeQuery('getRoles', { targetId });
	}

	async getAccountsWithRoles(role: any): Promise<any> {
		return this.executeQuery('getAccountsWithRoles', { role });
	}

	async getHeldAmount(targetId: any): Promise<any> {
		return this.executeQuery('getHeldAmount', { targetId });
	}

	async getHoldCount(targetId: any): Promise<any> {
		return this.executeQuery('getHoldCount', { targetId });
	}

	async getHold(targetId: any, holdIndex: any): Promise<any> {
		return this.executeQuery('getHold', { targetId, holdIndex });
	}

	async getHoldsId(targetId: any): Promise<any> {
		return this.executeQuery('getHoldsId', { targetId });
	}

	async getReserveAddress(): Promise<any> {
		return this.executeQuery('getReserveAddress', {});
	}

	async getReserveAmount(): Promise<any> {
		return this.executeQuery('getReserveAmount', {});
	}

	// ========== COMPOSITE OPERATIONS ==========

	async create(
		symbol: any,
		name: any,
		memo: any,
		decimals: any,
		initialSupply: any,
		factory: any,
		resolver: any,
		configs: any,
	): Promise<any> {
		return this.executeCommand('create', {
			symbol,
			name,
			memo,
			decimals,
			initialSupply,
			factory,
			resolver,
			configs,
		});
	}
}
