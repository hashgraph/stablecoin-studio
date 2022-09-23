import {
	Transaction, ContractExecuteTransaction, TokenCreateTransaction, Hbar, TokenSupplyType, ContractCreateFlow, PrivateKey,
	TokenWipeTransaction, TokenMintTransaction, TokenBurnTransaction, TokenId, AccountId
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
			transaction.setAdminKey(values.adminKey);
		}
		if (values.freezeKey) {
			transaction.setFreezeKey(values.freezeKey);
		}
		if (values.wipeKey) {
			transaction.setWipeKey(values.wipeKey);
		}
		/*if (values.kycKey) {
			transaction.setKycKey(values.kycKey);
		}*/
		if (values.pauseKey) {
			transaction.setPauseKey(values.pauseKey);
		}
		if (values.supplyKey) {
			transaction.setSupplyKey(values.supplyKey);
		}
		if (maxSupply) {
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

	public static buildTokenWipeTransaction (accountId:string, tokenId: string, amount:number): Transaction{
        const transaction =  new TokenWipeTransaction()
		.setAccountId(AccountId.fromString(accountId))
		.setTokenId(TokenId.fromString(tokenId))
		.setAmount(amount)
	
        return transaction;
    }

	public static buildTokenMintTransaction (tokenId: string, amount:number): Transaction{
        const transaction =  new TokenMintTransaction()
		.setTokenId(TokenId.fromString(tokenId))
		.setAmount(amount)
	
        return transaction;
    }

	public static buildTokenBurnTransaction (tokenId: string, amount:number): Transaction{
        const transaction =  new new TokenBurnTransaction()
		.setTokenId(TokenId.fromString(tokenId))
		.setAmount(amount)
	
        return transaction;
    }
}