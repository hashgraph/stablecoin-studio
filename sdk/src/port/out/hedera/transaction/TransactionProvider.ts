import { ContractFactory } from '@hashgraph/hethers';
import {
	Transaction,
	ContractExecuteTransaction,
	TokenCreateTransaction,
	Hbar,
	TokenSupplyType,
	TokenWipeTransaction,
	TokenMintTransaction,
	TokenBurnTransaction,
	TokenId,
	AccountId,
	TransferTransaction,
	PublicKey as HPublicKey,
	DelegateContractId,
	ContractFunctionParameters,
	AccountAllowanceApproveTransaction,
	TokenPauseTransaction,
	TokenUnpauseTransaction,
} from '@hashgraph/sdk';
import { ContractId, PublicKey } from '../../../in/sdk/sdk.js';
import { ICreateTokenResponse } from '../types.js';
import ContractCreateFlow from './ContractCreateFlow.js';
import { TransactionBuildingError } from './error/TransactionBuildingError.js';

export class TransactionProvider {
	public static buildContractExecuteTransaction(
		contractId: string,
		functionCallParameters: Uint8Array,
		gas: number,
	): Transaction {
		try {
			return new ContractExecuteTransaction()
				.setContractId(contractId)
				.setFunctionParameters(functionCallParameters)
				.setGas(gas);
		} catch (error) {
			throw new TransactionBuildingError(error);
		}
	}

	public static buildTokenCreateTransaction(
		contractId: ContractId,
		values: ICreateTokenResponse,
		maxSupply: Long | undefined,
	): Transaction {
		try {
			const getKey = (
				contractId: ContractId,
				key?: PublicKey,
			): HPublicKey | DelegateContractId | undefined => {
				if (key && !PublicKey.isNull(key)) {
					return key.toHederaKey();
				} else if (key && PublicKey.isNull(key)) {
					return contractId.toDelegateContractId();
				} else {
					return undefined;
				}
			};

			const getTreasuryAccount = (
				accountId: AccountId,
				contractId: ContractId,
				supplyKey?: PublicKey,
			): AccountId => {
				if (supplyKey && !PublicKey.isNull(supplyKey)) {
					return accountId;
				} else {
					return AccountId.fromString(contractId.toString());
				}
			};

			const transaction = new TokenCreateTransaction()
				.setMaxTransactionFee(new Hbar(25))
				.setTokenName(values.name)
				.setTokenSymbol(values.symbol)
				.setDecimals(values.decimals)
				.setInitialSupply(values.initialSupply)
				.setTokenMemo(values.memo)
				.setFreezeDefault(values.freezeDefault)
				.setTreasuryAccountId(
					getTreasuryAccount(
						AccountId.fromString(values.treasuryAccountId.id),
						contractId,
						values.supplyKey,
					),
				);
			if (values.autoRenewAccountId) {
				transaction.setAutoRenewAccountId(
					AccountId.fromString(values.autoRenewAccountId.toString()),
				);
			}

			const adminKey = getKey(contractId, values.adminKey);
			const freezeKey = getKey(contractId, values.freezeKey);
			const wipeKey = getKey(contractId, values.wipeKey);
			const pauseKey = getKey(contractId, values.pauseKey);
			const supplyKey = getKey(contractId, values.supplyKey);

			adminKey && transaction.setAdminKey(adminKey);
			freezeKey && transaction.setFreezeKey(freezeKey);
			wipeKey && transaction.setWipeKey(wipeKey);
			pauseKey && transaction.setPauseKey(pauseKey);
			supplyKey && transaction.setSupplyKey(supplyKey);

			/*if (values.kycKey) {
			transaction.setKycKey(values.kycKey);
		}*/
			if (maxSupply) {
				transaction.setMaxSupply(values.maxSupply);
				transaction.setSupplyType(TokenSupplyType.Finite);
			}
			return transaction;
		} catch (error) {
			throw new TransactionBuildingError(error);
		}
	}

	public static buildContractCreateFlowTransaction(
		factory: ContractFactory,
		parameters: Uint8Array | ContractFunctionParameters,
		gas: number,
		admKey?: HPublicKey,
	): ContractCreateFlow {
		try {
			const transaction = new ContractCreateFlow()
				.setBytecode(factory.bytecode)
				.setGas(gas);
			admKey && transaction.setAdminKey(admKey);
			if (parameters) {
				transaction.setConstructorParameters(parameters);
			}
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
