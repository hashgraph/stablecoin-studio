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
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse';
import StableCoinCapabilities from '../../../../domain/context/stablecoin/StableCoinCapabilities';
import { HederaId } from '../../../../domain/context/shared/HederaId';
import { CapabilityDecider, Decision } from '../../CapabilityDecider';
import { Operation } from '../../../../domain/context/stablecoin/Capability';
import LogService from '../../../../app/service/LogService';
import { SigningError } from '../../hs/error/SigningError';
import { ethers } from 'ethers';
import {
	FreezableFacet__factory,
	KYCFacet__factory,
	PausableFacet__factory,
	DeletableFacet__factory,
} from '@hashgraph/stablecoin-npm-contracts';
import {
	FREEZE_GAS,
	UNFREEZE_GAS,
	GRANT_KYC_GAS,
	REVOKE_KYC_GAS,
	PAUSE_GAS,
	UNPAUSE_GAS,
	DELETE_GAS,
} from '../../../../core/Constants';
import type { TransactionExecutor } from '../TransactionExecutor';
import type { EvmAddressResolver } from '../EvmAddressResolver';
import { TransactionType } from '../../TransactionResponseEnums';

export class TokenControlOperations {
	constructor(
		private executor: TransactionExecutor,
		private evmResolver: EvmAddressResolver,
	) {}

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

				const iface = new ethers.Interface(FreezableFacet__factory.abi);
				const params = [await this.evmResolver.resolve(targetId)];
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'freeze',
					params,
					FREEZE_GAS,
					undefined,
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

				return await this.executor.processTransaction(
					freezeTx,
					TransactionType.RECEIPT,
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

				const iface = new ethers.Interface(FreezableFacet__factory.abi);
				const params = [await this.evmResolver.resolve(targetId)];
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'unfreeze',
					params,
					UNFREEZE_GAS,
					undefined,
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

				return await this.executor.processTransaction(
					unfreezeTx,
					TransactionType.RECEIPT,
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

				const iface = new ethers.Interface(KYCFacet__factory.abi);
				const params = [await this.evmResolver.resolve(targetId)];
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'grantKyc',
					params,
					GRANT_KYC_GAS,
					undefined,
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

				return await this.executor.processTransaction(
					grantKycTx,
					TransactionType.RECEIPT,
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

				const iface = new ethers.Interface(KYCFacet__factory.abi);
				const params = [await this.evmResolver.resolve(targetId)];
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'revokeKyc',
					params,
					REVOKE_KYC_GAS,
					undefined,
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

				return await this.executor.processTransaction(
					revokeKycTx,
					TransactionType.RECEIPT,
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

				const iface = new ethers.Interface(PausableFacet__factory.abi);
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'pause',
					[],
					PAUSE_GAS,
					undefined,
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

				return await this.executor.processTransaction(
					pauseTx,
					TransactionType.RECEIPT,
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

				const iface = new ethers.Interface(PausableFacet__factory.abi);
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'unpause',
					[],
					UNPAUSE_GAS,
					undefined,
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

				return await this.executor.processTransaction(
					unpauseTx,
					TransactionType.RECEIPT,
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

				const iface = new ethers.Interface(DeletableFacet__factory.abi);
				return await this.executor.executeContractCall(
					contractId,
					iface,
					'deleteToken',
					[],
					DELETE_GAS,
					undefined,
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

				return await this.executor.processTransaction(
					deleteTx,
					TransactionType.RECEIPT,
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
