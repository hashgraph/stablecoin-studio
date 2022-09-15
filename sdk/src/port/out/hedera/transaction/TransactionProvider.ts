//Creacion de todas las transacciones que necesitemos sin firmar y sin congelar//
import { Transaction, ContractExecuteTransaction, TokenCreateTransaction, Hbar, TokenSupplyType, ContractCreateFlow, PrivateKey} from '@hashgraph/sdk';
import ICreateTokenResponse from '../../../out/hedera/types.js'

export class TransactionProvider{

    public buildContractExecuteTransaction (contractId:string, functionCallParameters:Uint8Array, gas:number) : Transaction{  
        const transaction = new ContractExecuteTransaction()
			.setContractId(contractId)
			.setFunctionParameters(functionCallParameters)
			.setGas(gas)
        
        return transaction;    
    }

    public buildTokenCreateTransaction (values: ICreateTokenResponse, gas:number) : Transaction{
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
			.setSupplyKey(values.supplyKey)
            .gas(gas);

		if (values.maxSupply) {
			transaction.setMaxSupply(values.maxSupply);
			transaction.setSupplyType(TokenSupplyType.Finite);
		}
    }

    public buildContractCreateFlowTransaction (factory:any, admPrivateKey: string, parameters:any, gas:number): Transaction{
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