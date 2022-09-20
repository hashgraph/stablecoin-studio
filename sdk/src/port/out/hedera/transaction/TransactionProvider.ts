import {
	Transaction, ContractExecuteTransaction, TokenCreateTransaction, Hbar, TokenSupplyType, ContractCreateFlow, PrivateKey
} from '@hashgraph/sdk';
import { ICreateTokenResponse } from '../types.js';

export class TransactionProvider{

    public static buildContractExecuteTransaction (contractId:string, functionCallParameters:Uint8Array, gas:number) : Transaction{  
        const transaction = new ContractExecuteTransaction()
			.setContractId(contractId)
			.setFunctionParameters(functionCallParameters)
			.setGas(gas)
        
        return transaction;    
    }

    public static buildTokenCreateTransaction (values: ICreateTokenResponse, maxSupply: bigint | undefined) : Transaction {
        const transaction = new TokenCreateTransaction()
			.setMaxTransactionFee(new Hbar(25))
			.setTokenName(values.name)
			.setTokenSymbol(values.symbol)
			.setDecimals(values.decimals)
			.setInitialSupply(values.initialSupply)
			.setTokenMemo(values.memo)
			.setFreezeDefault(values.freezeDefault)
			.setTreasuryAccountId(values.treasuryAccountId);
		
		if (values.adminKey) {
			console.log("se setea el admin key");
			transaction.setAdminKey(values.adminKey);
		}
		if (values.freezeKey) {
			console.log("se setea el freeze key");
			transaction.setFreezeKey(values.freezeKey);
		}
		if (values.wipeKey) {
			console.log("se setea el wipe key");
			transaction.setWipeKey(values.wipeKey);
		}
		/*if (values.kycKey) {
			console.log("se setea el kyc key");
			transaction.setKycKey(values.kycKey);
		}*/
		if (values.pauseKey) {
			console.log("se setea el pause key");
			transaction.setPauseKey(values.pauseKey);
		}
		if (values.supplyKey) {
			console.log("se setea el supply key key: " + values.supplyKey);
			transaction.setSupplyKey(values.supplyKey);
		}
		if (maxSupply) {
			transaction.setMaxSupply(values.maxSupply);
			transaction.setSupplyType(TokenSupplyType.Finite);
		}
console.log("transaction: " + transaction);		
		return transaction;
    }

    public static buildContractCreateFlowTransaction (factory:any, admPrivateKey: string, parameters:any, gas:number): Transaction{
        const transaction =  new ContractCreateFlow()
            .setBytecode(factory.bytecode)    
            .setGas(gas)    
            .setAdminKey(PrivateKey.fromStringED25519(admPrivateKey));
        if (parameters) {
            transaction.setConstructorParameters(parameters);
        }
        return transaction;
    }
}