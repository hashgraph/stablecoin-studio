import { Transaction } from '@hashgraph/sdk';
import { HTSTransactionBuilder } from   './../builder/HTSTransactionBuilder.js'
import TransactionHandler from '../TransactionHandler';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { Operations } from '../../../domain/context/stablecoin/Capability.js';
import Web3 from 'web3';
import { CapabilityDecider, Decision } from './decider/CapabilityDecider.js';
import { CapabilityError } from './error/CapabilityError.js';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';
import {
    HederaERC20__factory,
} from 'hedera-stable-coin-contracts/typechain-types/index.js';
import { TransactionType } from './response/TransactionResponseEnums.js';
import BigDecimal from '../../../domain/context/shared/BigDecimal.js';

export abstract class HederaTransactionHandler implements TransactionHandler<Transaction> {
    private web3 = new Web3(); 

    public async wipe(stableCoinCapabilities: StableCoinCapabilities, targetId: string, amount: BigDecimal): Promise<TransactionResponse> {
        const t: Transaction = HTSTransactionBuilder.buildTokenWipeTransaction(targetId, stableCoinCapabilities.coin.tokenId?.value!, amount.toLong());    
        return this.signAndSendTransaction(t, TransactionType.RECEIPT)    
    }

    public async cashin(coin: StableCoinCapabilities, targetId: string, amount: BigDecimal): Promise<TransactionResponse> {
        try{
            let t: Transaction;
            switch(CapabilityDecider.decide()){
                case Decision.CONTRACT:
                    if(!coin.coin.proxyAddress) throw new Error("StableCoin " + coin.coin.name + " does not have a proxy Address");
                    return this.contractCall(
                        coin.coin.proxyAddress.value, 
                        "mint", 
                        [targetId, amount],
                        150000000,
                        TransactionType.RECEIPT
                        );
                case Decision.HTS:
                    if(!coin.coin.tokenId) throw new Error("StableCoin " + coin.coin.name + " does not have an underlying token");
                    t = HTSTransactionBuilder.buildTokenMintTransaction(coin.coin.tokenId.value, amount.toLong());
                    return this.signAndSendTransaction(t, TransactionType.RECEIPT)
                default:
                    let tokenId = coin.coin.tokenId ? coin.coin.tokenId.value : "";
                    const OperationNotAllowed = new CapabilityError(this.getAccount(), Operations.CASH_IN, tokenId);
                    return new TransactionResponse(undefined, undefined, OperationNotAllowed);
            }
        }catch(error){
            throw new Error("Unexpected error in HederaTransactionHandler Cashin operation : " + error)
        }
    }

    public async burn(stableCoinCapabilities: StableCoinCapabilities, amount: BigDecimal): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildTokenBurnTransaction(stableCoinCapabilities.coin.tokenId?.value!, amount.toLong());
        return this.signAndSendTransaction(t, TransactionType.RECEIPT)
    }

    public async freeze(stableCoinCapabilities: StableCoinCapabilities, targetId: string): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildFreezeTransaction(stableCoinCapabilities.coin.tokenId?.value!, targetId);
        return this.signAndSendTransaction(t, TransactionType.RECEIPT)
    }

    public async unfreeze(stableCoinCapabilities: StableCoinCapabilities, targetId: string): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildUnfreezeTransaction(stableCoinCapabilities.coin.tokenId?.value!, targetId);
        return this.signAndSendTransaction(t, TransactionType.RECEIPT)
    }

    public async pause(stableCoinCapabilities: StableCoinCapabilities): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildPausedTransaction(stableCoinCapabilities.coin.tokenId?.value!);
        return this.signAndSendTransaction(t, TransactionType.RECEIPT)
    }

    public async unpause(stableCoinCapabilities: StableCoinCapabilities): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildUnpausedTransaction(stableCoinCapabilities.coin.tokenId?.value!);
        return this.signAndSendTransaction(t, TransactionType.RECEIPT);
    }

    public async transfer(stableCoinCapabilities: StableCoinCapabilities, amount: BigDecimal, inAccountId: string, outAccountId: string): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildTransferTransaction(stableCoinCapabilities.coin.tokenId?.value!, amount.toLong(), inAccountId, outAccountId);
        return this.signAndSendTransaction(t, TransactionType.RECEIPT)
    }

    public async rescue(stableCoinCapabilities: StableCoinCapabilities): Promise<TransactionResponse> {
        throw new Error('Method not implemented.');
    }

    public async delete(stableCoinCapabilities: StableCoinCapabilities): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildDeleteTransaction(stableCoinCapabilities.coin.tokenId?.value!);
        return this.signAndSendTransaction(t, TransactionType.RECEIPT)
    }


    public async contractCall(contractAddress: string, 
        functionName: string, 
        parameters: any[],
        gas: number,
        trxType: TransactionType,
        value?: number): Promise<TransactionResponse> {

		const functionCallParameters = this.encodeFunctionCall(
			functionName,
			parameters,
			HederaERC20__factory.abi
		);

		const transaction: Transaction =
            HTSTransactionBuilder.buildContractExecuteTransaction(
				contractAddress,
				functionCallParameters,
				gas,
				value
		);
		
        return await this.signAndSendTransaction(transaction, trxType);
    }

    private encodeFunctionCall(
		functionName: string,
		parameters: any[],
        abi: any[]
	): Uint8Array {
		const functionAbi = abi.find(
			(func: { name: any; type: string }) =>
				func.name === functionName && func.type === 'function',
		);
		if (!functionAbi) {
            let message = `Contract function ${functionName} not found in ABI, are you using the right version?`;
			console.log(message);
            throw new Error(message);
        }
		const encodedParametersHex = this.web3.eth.abi
			.encodeFunctionCall(functionAbi, parameters)
			.slice(2);

		return Buffer.from(encodedParametersHex, 'hex');
	}

    abstract getAccount(): string;

    abstract signAndSendTransaction(t: Transaction, 
        transactionType: TransactionType, 
        nameFunction?: string,
        abi?: any[]): Promise<TransactionResponse> ;
    
}