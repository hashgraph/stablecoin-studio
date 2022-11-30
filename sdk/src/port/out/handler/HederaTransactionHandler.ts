import { Transaction } from '@hashgraph/sdk';
import { HTSTransactionBuilder } from   './../builder/HTSTransactionBuilder.js'
import TransactionHandler from '../TransactionHandler';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import StableCoin from '../../../domain/context/stablecoin/StableCoin.js';
import { Operations } from '../../../domain/context/stablecoin/Capability.js';
import Contract from '../../../domain/context/stablecoin/Contract.js';
import { ABI } from '../../../domain/context/stablecoin/Contract.js';
import Web3 from 'web3';
import { CapabilityDecider, Decision } from './decider/CapabilityDecider.js';
import { CapabilityError } from './error/CapabilityError.js';

export abstract class HederaTransactionHandler implements TransactionHandler<Transaction> {
    private web3 = new Web3(); 

    public async wipe(coin: StableCoin, targetId: string, amount: Long): Promise<TransactionResponse> {
        /*const t: Transaction;
        switch(CapabilityDecider.decide()){
            case Decision.CONTRACT:
                const abi: ABI = {"value": "value"};
                return this.contractCall(new Contract(coin.proxyAddress, abi, ""), 
                    "mint", 
                    [targetId, amount],
                    150000000);
            
            case Decision.HTS:*/
                const t: Transaction = HTSTransactionBuilder.buildTokenWipeTransaction(targetId, coin.tokenId, amount);    
                return this.signAndSendTransaction(t)    
                
            /*default:
                const OperationNotAllowed = new CapabilityError(this.getAccount(), Operations.WIPE, coin.tokenId);
                return new TransactionResponse(undefined, undefined, OperationNotAllowed)
        }*/
    }

    public async mint(coin: StableCoin, amount: Long): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildTokenMintTransaction(coin.tokenId, amount);
        return this.signAndSendTransaction(t)
    }

    public async burn(coin: StableCoin, amount: Long): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildTokenBurnTransaction(coin.tokenId, amount);
        return this.signAndSendTransaction(t)
    }

    public async freeze(coin: StableCoin, targetId: string): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildFreezeTransaction(coin.tokenId, targetId);
        return this.signAndSendTransaction(t)
    }

    public async unfreeze(coin: StableCoin, targetId: string): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildUnfreezeTransaction(coin.tokenId, targetId);
        return this.signAndSendTransaction(t)
    }

    public async pause(coin: StableCoin): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildPausedTransaction(coin.tokenId);
        return this.signAndSendTransaction(t)
    }

    public async unpause(coin: StableCoin): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildUnpausedTransaction(coin.tokenId);
        return this.signAndSendTransaction(t)
    }

    public async transfer(coin: StableCoin, amount: Long, inAccountId: string, outAccountId: string): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildTransferTransaction(coin.tokenId, amount, inAccountId, outAccountId);
        return this.signAndSendTransaction(t)
    }

    public async rescue(coin: StableCoin): Promise<TransactionResponse> {
        throw new Error('Method not implemented.');
    }

    public async delete(coin: StableCoin): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildDeleteTransaction(coin.tokenId);
        return this.signAndSendTransaction(t)
    }

    public async contractCall(contract: Contract, 
        functionName: string, 
        parameters: any[],
        gas: number,
        value?: number): Promise<TransactionResponse> {

		const functionCallParameters = this.encodeFunctionCall(
			functionName,
			parameters,
			contract.abi,
		);

		const transaction: Transaction =
            HTSTransactionBuilder.buildContractExecuteTransaction(
				contract.address,
				functionCallParameters,
				gas,
				value
		);
		
        return await this.signAndSendTransaction(transaction);
    }

    private encodeFunctionCall(
		functionName: string,
		parameters: string[],
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		abi: ABI,
	): Uint8Array {
		const functionAbi = abi.find(
			(func: { name: string; type: string }) =>
				func.name === functionName && func.type === 'function',
		);
		if (!functionAbi) {
			console.log(`Contract function ${functionName} not found in ABI, are you using the right version?`);
        }

		const encodedParametersHex = this.web3.eth.abi
			.encodeFunctionCall(functionAbi, parameters)
			.slice(2);

		return Buffer.from(encodedParametersHex, 'hex');
	}

    abstract getAccount(): string;

    abstract signAndSendTransaction(t: Transaction): Promise<TransactionResponse> ;
    
}