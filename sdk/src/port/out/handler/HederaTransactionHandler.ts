import { Transaction } from '@hashgraph/sdk';
import { HTSTransactionBuilder } from   './../builder/HTSTransactionBuilder.js'
import TransactionHandler from '../TransactionHandler';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { Operations } from '../../../domain/context/stablecoin/Capability.js';
import Web3 from 'web3';
import { CapabilityDecider, Decision } from './decider/CapabilityDecider.js';
import { CapabilityError } from './error/CapabilityError.js';
import StableCoinCapabilities from '../../../domain/context/stablecoin/StableCoinCapabilities.js';


export abstract class HederaTransactionHandler implements TransactionHandler<Transaction> {
    private web3 = new Web3(); 

    public async wipe(coin: StableCoinCapabilities, targetId: string, amount: Long): Promise<TransactionResponse> {
        const t: Transaction = HTSTransactionBuilder.buildTokenWipeTransaction(targetId, coin.tokenId, amount);    
        return this.signAndSendTransaction(t)
    }

    public async cashin(coin: StableCoinCapabilities, targetId: string, amount: Long): Promise<TransactionResponse> {
        let t: Transaction;
        switch(CapabilityDecider.decide()){
            case Decision.CONTRACT:
                const abi: ABI = {"value": "value"};
                return this.contractCall(new Contract(coin.proxyAddress, abi, ""), 
                    "mint", 
                    [targetId, amount],
                    150000000);
            case Decision.HTS:
                t = HTSTransactionBuilder.buildTokenMintTransaction(coin.coin.tokenId, amount);
                return this.signAndSendTransaction(t)
            default:
                const OperationNotAllowed = new CapabilityError(this.getAccount(), Operations.WIPE, coin.coin.tokenId);
                return new TransactionResponse(undefined, undefined, OperationNotAllowed)
        }
        
    }

    public async burn(coin: StableCoinCapabilities, amount: Long): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildTokenBurnTransaction(coin.tokenId, amount);
        return this.signAndSendTransaction(t)
    }

    public async freeze(coin: StableCoinCapabilities, targetId: string): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildFreezeTransaction(coin.tokenId, targetId);
        return this.signAndSendTransaction(t)
    }

    public async unfreeze(coin: StableCoinCapabilities, targetId: string): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildUnfreezeTransaction(coin.tokenId, targetId);
        return this.signAndSendTransaction(t)
    }

    public async pause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildPausedTransaction(coin.tokenId);
        return this.signAndSendTransaction(t)
    }

    public async unpause(coin: StableCoinCapabilities): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildUnpausedTransaction(coin.tokenId);
        return this.signAndSendTransaction(t)
    }

    public async transfer(coin: StableCoinCapabilities, amount: Long, inAccountId: string, outAccountId: string): Promise<TransactionResponse> {
        const t:Transaction = HTSTransactionBuilder.buildTransferTransaction(coin.tokenId, amount, inAccountId, outAccountId);
        return this.signAndSendTransaction(t)
    }

    public async rescue(coin: StableCoinCapabilities): Promise<TransactionResponse> {
        throw new Error('Method not implemented.');
    }

    public async delete(coin: StableCoinCapabilities): Promise<TransactionResponse> {
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