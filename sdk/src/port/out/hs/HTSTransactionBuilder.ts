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

import {
	Key,
	TokenId,
	AccountId,
	Transaction,
	CustomFee as HCustomFee,
	ContractExecuteTransaction,
	TokenWipeTransaction,
	TokenMintTransaction,
	TokenBurnTransaction,
	TransferTransaction,
	TokenPauseTransaction,
	TokenUnpauseTransaction,
	TokenDeleteTransaction,
	TokenFreezeTransaction,
	TokenUnfreezeTransaction,
	TokenAssociateTransaction,
	TokenGrantKycTransaction,
	TokenRevokeKycTransaction,
	TokenFeeScheduleUpdateTransaction,
	TokenUpdateTransaction,
} from '@hashgraph/sdk';
import Long from 'long';
import LogService from '../../../app/service/LogService.js';
import { TransactionBuildingError } from './error/TransactionBuildingError.js';

export class HTSTransactionBuilder {
	public static buildContractExecuteTransaction(
		contractId: string,
		functionCallParameters: Uint8Array,
		gas: number,
		value?: number,
	): Transaction {
		try {
			const transaction = new ContractExecuteTransaction()
				.setContractId(contractId)
				.setFunctionParameters(functionCallParameters)
				.setGas(gas);

			if (value) transaction.setPayableAmount(value);

			return transaction;
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildTokenWipeTransaction(
		accountId: string,
		tokenId: string,
		amount: Long,
	): Transaction {
		try {
			return new TokenWipeTransaction()
				.setAccountId(AccountId.fromString(accountId))
				.setTokenId(TokenId.fromString(tokenId))
				.setAmount(amount);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildTokenMintTransaction(
		tokenId: string,
		amount: Long,
	): Transaction {
		try {
			return new TokenMintTransaction()
				.setTokenId(TokenId.fromString(tokenId))
				.setAmount(amount);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildTokenBurnTransaction(
		tokenId: string,
		amount: Long,
	): Transaction {
		try {
			return new TokenBurnTransaction()
				.setTokenId(TokenId.fromString(tokenId))
				.setAmount(amount);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildTransferTransaction(
		tokenId: string,
		amount: Long,
		outAccountId: string,
		inAccountId: string,
	): Transaction {
		try {
			return new TransferTransaction()
				.addTokenTransfer(
					tokenId,
					AccountId.fromString(outAccountId),
					-amount,
				)
				.addTokenTransfer(
					tokenId,
					AccountId.fromString(inAccountId),
					amount,
				);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildTransfersTransaction(
		tokenId: string,
		amounts: Long[],
		outAccountId: string,
		inAccountsIds: string[],
	): Transaction {
		try {
			const t = new TransferTransaction();

			let totalAmount: Long = new Long(0);

			for (let i = 0; i < inAccountsIds.length; i++) {
				totalAmount = totalAmount.add(amounts[i]);
				t.addTokenTransfer(
					tokenId,
					AccountId.fromString(inAccountsIds[i]),
					amounts[i],
				);
			}

			t.addTokenTransfer(
				tokenId,
				AccountId.fromString(outAccountId),
				totalAmount.mul(-1),
			);

			return t;
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildDeleteTransaction(tokenId: string): Transaction {
		try {
			return new TokenDeleteTransaction().setTokenId(tokenId);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildPausedTransaction(tokenId: string): Transaction {
		try {
			return new TokenPauseTransaction().setTokenId(tokenId);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildUnpausedTransaction(tokenId: string): Transaction {
		try {
			return new TokenUnpauseTransaction().setTokenId(tokenId);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildFreezeTransaction(
		tokenId: string,
		targetId: string,
	): Transaction {
		try {
			return new TokenFreezeTransaction()
				.setTokenId(tokenId)
				.setAccountId(targetId);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildUnfreezeTransaction(
		tokenId: string,
		targetId: string,
	): Transaction {
		try {
			return new TokenUnfreezeTransaction()
				.setTokenId(tokenId)
				.setAccountId(targetId);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildApprovedTransferTransaction(
		tokenId: string,
		amount: Long,
		outAccountId: string,
		inAccountId: string,
	): Transaction {
		try {
			return new TransferTransaction()
				.addApprovedTokenTransfer(
					tokenId,
					AccountId.fromString(outAccountId),
					-amount,
				)
				.addApprovedTokenTransfer(
					tokenId,
					AccountId.fromString(inAccountId),
					amount,
				);
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildAssociateTokenTransaction(
		tokenId: string,
		targetId: string,
	): Transaction {
		try {
			return new TokenAssociateTransaction({
				accountId: targetId,
				tokenIds: [tokenId],
			});
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildGrantTokenKycTransaction(
		tokenId: string,
		targetId: string,
	): Transaction {
		try {
			return new TokenGrantKycTransaction({
				tokenId: tokenId,
				accountId: targetId,
			});
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildRevokeTokenKycTransaction(
		tokenId: string,
		targetId: string,
	): Transaction {
		try {
			return new TokenRevokeKycTransaction({
				tokenId: tokenId,
				accountId: targetId,
			});
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildUpdateCustomFeesTransaction(
		tokenId: string,
		customFees: HCustomFee[],
	): Transaction {
		try {
			return new TokenFeeScheduleUpdateTransaction({
				tokenId: tokenId,
				customFees: customFees,
			});
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}

	public static buildUpdateTokenTransaction(
		tokenId: string,
		kycKey: Key | undefined,
		freezeKey: Key | undefined,
		feeScheduleKey: Key | undefined,
		pauseKey: Key | undefined,
		wipeKey: Key | undefined,
		supplyKey: Key | undefined,
	): Transaction {
		try {
			const tokenUpdateTransaction: TokenUpdateTransaction =
				new TokenUpdateTransaction({
					tokenId: tokenId,
				});
			if (kycKey) tokenUpdateTransaction.setKycKey(kycKey);
			if (freezeKey) tokenUpdateTransaction.setFreezeKey(freezeKey);
			if (feeScheduleKey)
				tokenUpdateTransaction.setFeeScheduleKey(feeScheduleKey);
			if (pauseKey) tokenUpdateTransaction.setPauseKey(pauseKey);
			if (wipeKey) tokenUpdateTransaction.setWipeKey(wipeKey);
			if (supplyKey) tokenUpdateTransaction.setSupplyKey(supplyKey);
			return tokenUpdateTransaction;
		} catch (error) {
			LogService.logError(error);
			throw new TransactionBuildingError(error);
		}
	}
}
