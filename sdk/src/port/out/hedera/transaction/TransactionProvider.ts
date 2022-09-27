import {
	Transaction,
	ContractExecuteTransaction,
	TokenCreateTransaction,
	Hbar,
	TokenSupplyType,
	ContractCreateFlow,
	PrivateKey,
	PublicKey as HPublicKey,
	DelegateContractId,
} from '@hashgraph/sdk';
import { ContractId, PublicKey } from '../../../in/sdk/sdk.js';
import { ICreateTokenResponse } from '../types.js';

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
console.log("key && key !== PublicKey.NULL");				
				return key.toHederaKey();
			} else if (key && key === PublicKey.NULL) {
console.log("!key");				
				return contractId.toDelegateContractId();
			} else {
console.log("undefined");				
				return undefined;
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
			.setTreasuryAccountId(values.treasuryAccountId.id);

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
		admPrivateKey: string,
		parameters: any,
		gas: number,
	): ContractCreateFlow {
		const transaction = new ContractCreateFlow()
			.setBytecode(factory.bytecode)
			.setGas(gas)
			.setAdminKey(PrivateKey.fromStringED25519(admPrivateKey));
		if (parameters) {
			transaction.setConstructorParameters(parameters);
		}
		return transaction;
	}
}
