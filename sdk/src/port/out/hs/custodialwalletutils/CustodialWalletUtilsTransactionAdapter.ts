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

import {HederaTransactionAdapter} from "../HederaTransactionAdapter";
import {singleton} from "tsyringe";
import Account from "domain/context/account/Account";
import {
	TokenAssociateTransaction,
	TokenBurnTransaction,
	TokenCreateTransaction,
	TokenDeleteTransaction,
	TokenFeeScheduleUpdateTransaction,
	TokenFreezeTransaction,
	TokenGrantKycTransaction,
	TokenMintTransaction,
	TokenPauseTransaction,
	TokenRevokeKycTransaction,
	TokenUnfreezeTransaction,
	TokenUnpauseTransaction,
	TokenWipeTransaction,
	Transaction,
	TransferTransaction
} from "@hashgraph/sdk";
import {TransactionType} from "../../TransactionResponseEnums";
import {CustodialWalletService, FireblocksConfig, SignatureRequest,} from "custodialwalletutils/build/esm/src";
import {HashpackTransactionResponseAdapter} from "../hashpack/HashpackTransactionResponseAdapter";
import LogService from "../../../../app/service/LogService";
import {SigningError} from "../error/SigningError";
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';

@singleton()
export class CustodialWalletUtilsTransactionAdapter extends HederaTransactionAdapter {
	getAccount(): Account {
		throw new Error('Method not implemented.');
	}
	signAndSendTransaction(
		t: Transaction,
		transactionType: TransactionType,
		nameFunction?: string,
		abi?: any[],
	): Promise<TransactionResponse> {
		try {
			LogService.logTrace(
				'Blade is singing and sending transaction:',
				nameFunction,
				t,
			);
			const fireblocksConfig = new FireblocksConfig(
				'',
				'',
				'',
				'',
				'',
			);
			const signatureService = new CustodialWalletService(fireblocksConfig);
			const signatureRequest = new SignatureRequest(t.toBytes());

			const signedTransaction = signatureService.signTransaction(signatureRequest)
				.then((signedTransactionBytes) => {
					return Transaction.fromBytes(signedTransactionBytes);
				})
				.catch((error) => {
					throw new Error(error);
				});
			let hashPackTransactionResponse;
			if (
				t instanceof TokenCreateTransaction ||
				t instanceof TokenWipeTransaction ||
				t instanceof TokenBurnTransaction ||
				t instanceof TokenMintTransaction ||
				t instanceof TokenPauseTransaction ||
				t instanceof TokenUnpauseTransaction ||
				t instanceof TokenDeleteTransaction ||
				t instanceof TokenFreezeTransaction ||
				t instanceof TokenUnfreezeTransaction ||
				t instanceof TokenGrantKycTransaction ||
				t instanceof TokenRevokeKycTransaction ||
				t instanceof TransferTransaction ||
				t instanceof TokenFeeScheduleUpdateTransaction ||
				t instanceof TokenAssociateTransaction
			) {
				hashPackTransactionResponse = await t.executeWithSigner(
					this.signer,
				);
			} else {
				hashPackTransactionResponse = await this.signer.call(trx);
			}
			return HashpackTransactionResponseAdapter.manageResponse(
				this.networkService.environment,
				this.signer,
				hashPackTransactionResponse,
				transactionType,
				nameFunction,
				abi,
			);
		} catch (error) {
			LogService.logError(error);
			throw new SigningError(error);
		}
	}
}
