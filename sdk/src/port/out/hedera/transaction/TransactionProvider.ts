import {
	Transaction,
	ContractExecuteTransaction,
	TokenCreateTransaction,
	Hbar,
	TokenSupplyType,
	ContractCreateFlow,
	TokenWipeTransaction,
	TokenMintTransaction,
	TokenBurnTransaction,
	TokenId,
	AccountId,
	TransferTransaction,
	PublicKey as HPublicKey,
	DelegateContractId,
} from '@hashgraph/sdk';
import { ContractId, PublicKey } from '../../../in/sdk/sdk.js';
import { ICreateTokenResponse } from '../types.js';
import PrivateKey from '../../../../domain/context/account/PrivateKey';

export class TransactionProvider {
	public static buildContractExecuteTransaction(
		contractId: string,
		functionCallParameters: Uint8Array,
		gas: number,
	): Transaction {
		const transaction = new ContractExecuteTransaction()
			.setContractId(contractId)
			.setFunctionParameters(functionCallParameters)
			.setGas(gas);

		return transaction;
	}

	public static buildTokenCreateTransaction(
		contractId: ContractId,
		values: ICreateTokenResponse,
		maxSupply: bigint | undefined,
	): Transaction {
		const getKey = (
			contractId: ContractId,
			key?: PublicKey,
		): HPublicKey | DelegateContractId | undefined => {
			if (key && key !== PublicKey.NULL) {
				return key.toHederaKey();
			} else if (key && key === PublicKey.NULL) {
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
			if (supplyKey && supplyKey !== PublicKey.NULL) {
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
	}

	public static buildContractCreateFlowTransaction(
		factory: any,
		parameters: any,
		gas: number,
		admKey?: string,
	): ContractCreateFlow {
		const transaction = new ContractCreateFlow()
			.setBytecode(factory.bytecode)
			.setGas(gas);
		admKey &&
			transaction.setAdminKey(
				HPublicKey.fromString(admKey),
			);
		if (parameters) {
			transaction.setConstructorParameters(parameters);
		}
		return transaction;
	}

	public static buildTokenWipeTransaction(
		accountId: string,
		tokenId: string,
		amount: number,
	): Transaction {
		const transaction = new TokenWipeTransaction()
			.setAccountId(AccountId.fromString(accountId))
			.setTokenId(TokenId.fromString(tokenId))
			.setAmount(amount);

		return transaction;
	}

	public static buildTokenMintTransaction(
		tokenId: string,
		amount: number,
	): Transaction {
		const transaction = new TokenMintTransaction()
			.setTokenId(TokenId.fromString(tokenId))
			.setAmount(amount);

		return transaction;
	}

	public static buildTokenBurnTransaction(
		tokenId: string,
		amount: number,
	): Transaction {
		const transaction = new TokenBurnTransaction()
			.setTokenId(TokenId.fromString(tokenId))
			.setAmount(amount);

		return transaction;
	}
	public static buildTransferTransaction(
		tokenId: string,
		amount: number,
		outAccountId: string,
		inAccountId: string,
	): Transaction {
		const transaction = new TransferTransaction()
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

		return transaction;
	}
}
