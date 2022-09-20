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

    public static buildTokenCreateTransaction (values: ICreateTokenResponse, maxSupply: bigint | undefined) : Transaction{
        const transaction = new TokenCreateTransaction()
			.setMaxTransactionFee(new Hbar(25))
			.setTokenName(values.name)
			.setTokenSymbol(values.symbol)
			.setDecimals(values.decimals)
			.setInitialSupply(values.initialSupply)
			.setTokenMemo(values.memo)
			.setFreezeDefault(values.freezeDefault)
			.setTreasuryAccountId(values.treasuryAccountId)
			.setAdminKey(values.adminKey)
			.setFreezeKey(values.freezeKey)
			.setWipeKey(values.wipeKey)
			.setSupplyKey(values.supplyKey);

		if (maxSupply) {
			console.log("max="+maxSupply);
			transaction.setMaxSupply(values.maxSupply);
			transaction.setSupplyType(TokenSupplyType.Finite);
		}
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