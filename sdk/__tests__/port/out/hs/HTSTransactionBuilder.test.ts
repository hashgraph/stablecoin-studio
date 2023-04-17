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

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import {
	AccountId,
	ContractExecuteTransaction,
	Hbar,
	HbarUnit,
	TokenId,
	TokenWipeTransaction,
	TokenMintTransaction,
	TokenBurnTransaction,
	TransferTransaction,
	TokenDeleteTransaction,
	TokenPauseTransaction,
	TokenUnpauseTransaction,
	TokenFreezeTransaction,
	TokenUnfreezeTransaction,
	TokenGrantKycTransaction,
	TokenRevokeKycTransaction,
	ContractId,
	PublicKey,
	TokenUpdateTransaction,
	DelegateContractId,
	Timestamp,
} from '@hashgraph/sdk';
import { CLIENT_ACCOUNT_ECDSA } from '../../../config.js';
import Long from 'long';
import { LoggerTransports, SDK } from '../../../../src/index.js';
import { HTSTransactionBuilder } from '../../../../src/port/out/hs/HTSTransactionBuilder.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
	const contractId = '1111';
	const accountId = '2222';
	const tokenId = '3333';

	const contractId2 = '1110';
	const accountId2 = '2220';
	const tokenId2 = '3330';

	const newTokenName = 'NEW_TOKEN_NAME';
	const newTokenSymbol = 'NEW_TOKEN_SYMBOL';
	const newAutoRenewPeriod = 3888000;
	const newExpirationTime = 1686582131144337000;

	// const accountId3 = '2200';
	it('Test create contractExecuteTransaction', () => {
		const t: ContractExecuteTransaction =
			HTSTransactionBuilder.buildContractExecuteTransaction(
				contractId,
				new Uint8Array(),
				1000,
				1,
			) as ContractExecuteTransaction;
		expect(t?.gas?.low).toEqual(1000);
		expect(t?.gas?.low).toEqual(1000);
		expect(t?.contractId).toEqual(ContractId.fromString(contractId));
		expect(t?.payableAmount).toEqual(Hbar.from(1, HbarUnit.Hbar));

		expect(t?.gas?.low).not.toEqual(1001);
		expect(t?.contractId).not.toEqual(ContractId.fromString(contractId2));
		expect(t?.payableAmount).not.toEqual(Hbar.from(1, HbarUnit.Megabar));
	});

	it('Test create buildTokenWipeTransaction', () => {
		const t: TokenWipeTransaction =
			HTSTransactionBuilder.buildTokenWipeTransaction(
				accountId,
				tokenId,
				Long.ONE,
			) as TokenWipeTransaction;
		expect(t?.accountId).toEqual(AccountId.fromString(accountId));
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.amount).toEqual(Long.ONE);

		expect(t?.accountId).not.toEqual(AccountId.fromString(accountId2));
		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
		expect(t?.amount).not.toEqual(Long.ZERO);
	});

	it('Test create buildTokenMintTransaction', () => {
		const t: TokenMintTransaction =
			HTSTransactionBuilder.buildTokenMintTransaction(
				tokenId,
				Long.ONE,
			) as TokenMintTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.amount).toEqual(Long.ONE);

		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
		expect(t?.amount).not.toEqual(Long.ZERO);
	});

	it('Test create buildTokenBurnTransaction', () => {
		const t: TokenBurnTransaction =
			HTSTransactionBuilder.buildTokenBurnTransaction(
				tokenId,
				Long.ONE,
			) as TokenBurnTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.amount).toEqual(Long.ONE);

		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
		expect(t?.amount).not.toEqual(Long.ZERO);
	});

	it('Test create buildTokenTransferTransaction', () => {
		const t: TransferTransaction =
			HTSTransactionBuilder.buildTransferTransaction(
				tokenId,
				Long.ONE,
				accountId,
				accountId2,
			) as TransferTransaction;
		expect(
			t?.tokenTransfers
				.get(TokenId.fromString(tokenId))
				?.get(AccountId.fromString(accountId)),
		).toEqual(Long.ONE.multiply(-1));
		expect(
			t?.tokenTransfers
				.get(TokenId.fromString(tokenId))
				?.get(AccountId.fromString(accountId2)),
		).toEqual(Long.ONE);

		expect(
			t?.tokenTransfers
				.get(TokenId.fromString(tokenId))
				?.get(AccountId.fromString(accountId)),
		).not.toEqual(Long.ONE);
		expect(
			t?.tokenTransfers
				.get(TokenId.fromString(tokenId))
				?.get(AccountId.fromString(accountId2)),
		).not.toEqual(Long.ONE.multiply(-1));
	});

	it('Test create buildDeleteTransaction', () => {
		const t: TokenDeleteTransaction =
			HTSTransactionBuilder.buildDeleteTransaction(
				tokenId,
			) as TokenDeleteTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));

		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
	});

	it('Test create buildPausedTransaction', () => {
		const t: TokenPauseTransaction =
			HTSTransactionBuilder.buildPausedTransaction(
				tokenId,
			) as TokenPauseTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));

		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
	});

	it('Test create buildUnpausedTransaction', () => {
		const t: TokenUnpauseTransaction =
			HTSTransactionBuilder.buildUnpausedTransaction(
				tokenId,
			) as TokenUnpauseTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));

		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
	});

	it('Test create buildFreezeTransaction', () => {
		const t: TokenFreezeTransaction =
			HTSTransactionBuilder.buildFreezeTransaction(
				tokenId,
				accountId,
			) as TokenFreezeTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.accountId).toEqual(AccountId.fromString(accountId));

		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
		expect(t?.accountId).not.toEqual(AccountId.fromString(accountId2));
	});

	it('Test create buildUnreezeTransaction', () => {
		const t: TokenUnfreezeTransaction =
			HTSTransactionBuilder.buildUnfreezeTransaction(
				tokenId,
				accountId,
			) as TokenUnfreezeTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.accountId).toEqual(AccountId.fromString(accountId));

		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
		expect(t?.accountId).not.toEqual(AccountId.fromString(accountId2));
	});

	it('Test create buildGrantKYCTransaction', () => {
		const t: TokenGrantKycTransaction =
			HTSTransactionBuilder.buildGrantTokenKycTransaction(
				tokenId,
				accountId,
			) as TokenGrantKycTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.accountId).toEqual(AccountId.fromString(accountId));

		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
		expect(t?.accountId).not.toEqual(AccountId.fromString(accountId2));
	});

	it('Test create buildRevokeKYCTransaction', () => {
		const t: TokenRevokeKycTransaction =
			HTSTransactionBuilder.buildRevokeTokenKycTransaction(
				tokenId,
				accountId,
			) as TokenRevokeKycTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.accountId).toEqual(AccountId.fromString(accountId));

		expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
		expect(t?.accountId).not.toEqual(AccountId.fromString(accountId2));
	});

	it('Test create buildApprovedTransferTransaction', () => {
		const t: TransferTransaction =
			HTSTransactionBuilder.buildTransferTransaction(
				tokenId,
				Long.ONE,
				accountId,
				accountId2,
			) as TransferTransaction;
		expect(
			t?.tokenTransfers
				.get(TokenId.fromString(tokenId))
				?.get(AccountId.fromString(accountId)),
		).toEqual(Long.ONE.multiply(-1));
		expect(
			t?.tokenTransfers
				.get(TokenId.fromString(tokenId))
				?.get(AccountId.fromString(accountId2)),
		).toEqual(Long.ONE);

		expect(
			t?.tokenTransfers
				.get(TokenId.fromString(tokenId))
				?.get(AccountId.fromString(accountId)),
		).not.toEqual(Long.ONE);
		expect(
			t?.tokenTransfers
				.get(TokenId.fromString(tokenId))
				?.get(AccountId.fromString(accountId2)),
		).not.toEqual(Long.ONE.multiply(-1));
	});

	it('Test create TokenUpdateTransaction with name, symbol, autorenew account, autorenew period, expiration time and public keys', () => {
		const t: TokenUpdateTransaction =
			HTSTransactionBuilder.buildUpdateTokenTransaction(
				tokenId,
				newTokenName,
				newTokenSymbol,
				newAutoRenewPeriod,
				Timestamp.fromDate(newExpirationTime),
				PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
				PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
				PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
				PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
				PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
			) as TokenUpdateTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.tokenName).toEqual(newTokenName);
		expect(t?.tokenSymbol).toEqual(newTokenSymbol);
		expect(t?.autoRenewPeriod?.seconds.low).toEqual(newAutoRenewPeriod);
		expect(t?.expirationTime).toEqual(
			Timestamp.fromDate(newExpirationTime),
		);
		expect(t?.kycKey).toEqual(
			PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
		);
		expect(t?.freezeKey).toEqual(
			PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
		);
		expect(t?.feeScheduleKey).toEqual(
			PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
		);
		expect(t?.pauseKey).toEqual(
			PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
		);
		expect(t?.wipeKey).toEqual(
			PublicKey.fromString(CLIENT_ACCOUNT_ECDSA.publicKey?.key!),
		);
	});

	it('Test create TokenUpdateTransaction with name, symbol, autorenew account, autorenew period, expiration time and delegate contract ids as keys', () => {
		const t: TokenUpdateTransaction =
			HTSTransactionBuilder.buildUpdateTokenTransaction(
				tokenId,
				newTokenName,
				newTokenSymbol,
				newAutoRenewPeriod,
				Timestamp.fromDate(newExpirationTime),
				DelegateContractId.fromString('0.0.1'),
				DelegateContractId.fromString('0.0.1'),
				DelegateContractId.fromString('0.0.1'),
				DelegateContractId.fromString('0.0.1'),
				DelegateContractId.fromString('0.0.1'),
			) as TokenUpdateTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.tokenName).toEqual(newTokenName);
		expect(t?.tokenSymbol).toEqual(newTokenSymbol);
		expect(t?.autoRenewPeriod?.seconds.low).toEqual(newAutoRenewPeriod);
		expect(t?.expirationTime).toEqual(
			Timestamp.fromDate(newExpirationTime),
		);
		expect(t?.kycKey).toEqual(DelegateContractId.fromString('0.0.1'));
		expect(t?.freezeKey).toEqual(DelegateContractId.fromString('0.0.1'));
		expect(t?.feeScheduleKey).toEqual(
			DelegateContractId.fromString('0.0.1'),
		);
		expect(t?.pauseKey).toEqual(DelegateContractId.fromString('0.0.1'));
		expect(t?.wipeKey).toEqual(DelegateContractId.fromString('0.0.1'));
	});

	it('Test create TokenUpdateTransaction with undefined name, symbol, autorenew account, autorenew period, expiration time and keys', () => {
		const t: TokenUpdateTransaction =
			HTSTransactionBuilder.buildUpdateTokenTransaction(
				tokenId,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
				undefined,
			) as TokenUpdateTransaction;
		expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
		expect(t?.tokenName).toBeNull();
		expect(t?.tokenSymbol).toBeNull();
		expect(t?.autoRenewAccountId).toBeNull();
		expect(t?.autoRenewPeriod).toBeNull();
		expect(t?.expirationTime).toBeNull();
		expect(t?.kycKey).toBeNull();
		expect(t?.freezeKey).toBeNull();
		expect(t?.feeScheduleKey).toBeNull();
		expect(t?.pauseKey).toBeNull();
		expect(t?.wipeKey).toBeNull();
	});
});
