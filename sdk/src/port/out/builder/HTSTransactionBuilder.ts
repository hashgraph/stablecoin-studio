import {
	Transaction,
	ContractExecuteTransaction,
	TokenWipeTransaction,
	TokenMintTransaction,
	TokenBurnTransaction,
	TokenId,
	AccountId,
	TransferTransaction,
	AccountAllowanceApproveTransaction,
	TokenPauseTransaction,
	TokenUnpauseTransaction,
	TokenDeleteTransaction,
	TokenFreezeTransaction,
	TokenUnfreezeTransaction,
} from '@hashgraph/sdk';
import { TransactionBuildingError } from './error/TransactionBuildingError.js';

export class HTSTransactionBuilder {
	public static buildContractExecuteTransaction(
		contractId: string,
		functionCallParameters: Uint8Array,
		gas: number,
		value?: number
	): Transaction {
		try {
			const transaction =  new ContractExecuteTransaction()
				.setContractId(contractId)
				.setFunctionParameters(functionCallParameters)
				.setGas(gas);

			if(value) transaction.setPayableAmount(value);

			return transaction;
			
		} catch (error) {
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
			throw new TransactionBuildingError(error);
		}
	}

	public static approveTokenAllowance(): Transaction {
		return new AccountAllowanceApproveTransaction().approveTokenAllowance(
			'0.0.48705516',
			'0.0.47624288',
			'0.0.47793222',
			100000000000000,
		);
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
			throw new TransactionBuildingError(error);
		}
	}

	public static buildDeleteTransaction(tokenId: string): Transaction {
		try {
			return new TokenDeleteTransaction().setTokenId(tokenId);
		} catch (error) {
			throw new TransactionBuildingError(error);
		}
	}

	public static buildPausedTransaction(tokenId: string): Transaction {
		try {
			return new TokenPauseTransaction().setTokenId(tokenId);
		} catch (error) {
			throw new TransactionBuildingError(error);
		}
	}

	public static buildUnpausedTransaction(tokenId: string): Transaction {
		try {
			return new TokenUnpauseTransaction().setTokenId(tokenId);
		} catch (error) {
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
			throw new TransactionBuildingError(error);
		}
	}
}
