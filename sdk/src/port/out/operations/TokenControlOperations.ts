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

import {
	TokenFreezeTransaction,
	TokenUnfreezeTransaction,
	TokenPauseTransaction,
	TokenUnpauseTransaction,
	TokenGrantKycTransaction,
	TokenRevokeKycTransaction,
	TokenDeleteTransaction,
	TokenId,
	AccountId,
} from '@hiero-ledger/sdk';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities';
import { HederaId } from '../../../domain/context/shared/HederaId';
import { CapabilityDecider, Decision } from '../CapabilityDecider';
import { Operation } from '../../../domain/context/stablecoin/Capability';
import LogService from '../../../app/service/LogService';
import { SigningError } from '../hs/error/SigningError';
import { TransactionHelpers } from './TransactionHelpers';
import type { BaseHederaTransactionAdapter } from '../BaseHederaTransactionAdapter';

/**
 * Token control operations: freeze, unfreeze, pause, unpause, delete, KYC
 */
export class TokenControlOperations {
	constructor(private adapter: BaseHederaTransactionAdapter) {}

	async freeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.FREEZE,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = (this.adapter as any).getFacetInterface(
					'FreezableFacet',
				);
				const params = [await this.adapter.getEVMAddress(targetId)];
				return await (this.adapter as any).executeContractCall(
					contractId,
					iface,
					'freeze',
					params,
					TransactionHelpers.getGasLimit('FREEZE'),
					undefined,
					startDate,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const freezeTx = new TokenFreezeTransaction()
					.setAccountId(AccountId.fromString(targetId.toString()))
					.setTokenId(TokenId.fromString(coin.coin.tokenId.value));

				return await (this.adapter as any).processTransaction(
					freezeTx,
					startDate,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in freeze(): ${error}`);
		}
	}

	async unfreeze(
		coin: StableCoinCapabilities,
		targetId: HederaId,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.UNFREEZE,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = (this.adapter as any).getFacetInterface(
					'FreezableFacet',
				);
				const params = [await this.adapter.getEVMAddress(targetId)];
				return await (this.adapter as any).executeContractCall(
					contractId,
					iface,
					'unfreeze',
					params,
					TransactionHelpers.getGasLimit('UNFREEZE'),
					undefined,
					startDate,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const unfreezeTx = new TokenUnfreezeTransaction()
					.setAccountId(AccountId.fromString(targetId.toString()))
					.setTokenId(TokenId.fromString(coin.coin.tokenId.value));

				return await (this.adapter as any).processTransaction(
					unfreezeTx,
					startDate,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in unfreeze(): ${error}`);
		}
	}

	async grantKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.GRANT_KYC,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = (this.adapter as any).getFacetInterface(
					'KYCFacet',
				);
				const params = [await this.adapter.getEVMAddress(targetId)];
				return await (this.adapter as any).executeContractCall(
					contractId,
					iface,
					'grantKyc',
					params,
					TransactionHelpers.getGasLimit('GRANT_KYC'),
					undefined,
					undefined,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const grantKycTx = new TokenGrantKycTransaction()
					.setAccountId(AccountId.fromString(targetId.toString()))
					.setTokenId(TokenId.fromString(coin.coin.tokenId.value));

				return await (this.adapter as any).processTransaction(
					grantKycTx,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in grantKyc(): ${error}`);
		}
	}

	async revokeKyc(
		coin: StableCoinCapabilities,
		targetId: HederaId,
	): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.REVOKE_KYC,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = (this.adapter as any).getFacetInterface(
					'KYCFacet',
				);
				const params = [await this.adapter.getEVMAddress(targetId)];
				return await (this.adapter as any).executeContractCall(
					contractId,
					iface,
					'revokeKyc',
					params,
					TransactionHelpers.getGasLimit('REVOKE_KYC'),
					undefined,
					undefined,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const revokeKycTx = new TokenRevokeKycTransaction()
					.setAccountId(AccountId.fromString(targetId.toString()))
					.setTokenId(TokenId.fromString(coin.coin.tokenId.value));

				return await (this.adapter as any).processTransaction(
					revokeKycTx,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in revokeKyc(): ${error}`);
		}
	}

	async pause(
		coin: StableCoinCapabilities,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.PAUSE,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = (this.adapter as any).getFacetInterface(
					'PausableFacet',
				);
				return await (this.adapter as any).executeContractCall(
					contractId,
					iface,
					'pause',
					[],
					TransactionHelpers.getGasLimit('PAUSE'),
					undefined,
					startDate,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const pauseTx = new TokenPauseTransaction().setTokenId(
					TokenId.fromString(coin.coin.tokenId.value),
				);

				return await (this.adapter as any).processTransaction(
					pauseTx,
					startDate,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in pause(): ${error}`);
		}
	}

	async unpause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.UNPAUSE,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = (this.adapter as any).getFacetInterface(
					'PausableFacet',
				);
				return await (this.adapter as any).executeContractCall(
					contractId,
					iface,
					'unpause',
					[],
					TransactionHelpers.getGasLimit('UNPAUSE'),
					undefined,
					undefined,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const unpauseTx = new TokenUnpauseTransaction().setTokenId(
					TokenId.fromString(coin.coin.tokenId.value),
				);

				return await (this.adapter as any).processTransaction(
					unpauseTx,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in unpause(): ${error}`);
		}
	}

	async delete(
		coin: StableCoinCapabilities,
		startDate?: string,
	): Promise<TransactionResponse> {
		try {
			const decision = CapabilityDecider.getAccessDecision(
				coin,
				Operation.DELETE,
			);

			if (decision === Decision.CONTRACT) {
				const contractId = coin.coin.proxyAddress?.value;
				const evmAddress = coin.coin.evmProxyAddress?.value;
				if (!contractId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a proxy address`,
					);
				}

				const iface = (this.adapter as any).getFacetInterface(
					'DeletableFacet',
				);
				return await (this.adapter as any).executeContractCall(
					contractId,
					iface,
					'deleteToken',
					[],
					TransactionHelpers.getGasLimit('DELETE'),
					undefined,
					startDate,
					evmAddress,
				);
			} else if (decision === Decision.HTS) {
				if (!coin.coin.tokenId) {
					throw new Error(
						`StableCoin ${coin.coin.name} does not have a token ID`,
					);
				}

				const deleteTx = new TokenDeleteTransaction().setTokenId(
					TokenId.fromString(coin.coin.tokenId.value),
				);

				return await (this.adapter as any).processTransaction(
					deleteTx,
					startDate,
				);
			}
			throw new Error(`Operation not permitted for token`);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(`Unexpected error in delete(): ${error}`);
		}
	}
}
