import { TransactionResponse as HTransactionResponse,
         Transaction, 
         Client
       } from '@hashgraph/sdk';
import { HTSTransactionBuilder } from   './../builder/HTSTransactionBuilder.js'
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import TransactionHandler from   './../TransactionHandler.js'
import StableCoin from '../../../domain/context/stablecoin/StableCoin.js';
import Contract from '../../../domain/context/contract/Contract.js';
import { Response } from '../../../domain/context/transaction/Response.js';
import { HTSTransactionResponseHandler } from './response/HTSTransactionResponseHandler.js';
import { TransactionType } from '../../../../src/port/out/handler/response/TransactionResponse.js';

export class HTSTransactionHandler implements TransactionHandler<Transaction> {
    private _client:Client;

    public get client () {
        return this._client
    }

    constructor (client:Client) {
        this._client = client
    }

    public async wipe(coin: StableCoin, accountId: string, amount: Long): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildTokenWipeTransaction(accountId, coin.tokenId, amount);        
        return this.signAndSendTransaction(t)
    }

    public async mint(coin: StableCoin, amount: Long): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildTokenMintTransaction(coin.tokenId, amount);
        return this.signAndSendTransaction(t)
    }

    public async burn(coin: StableCoin, amount: Long): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildTokenBurnTransaction(coin.tokenId, amount);
        return this.signAndSendTransaction(t)
    }

    public async freeze(coin: StableCoin, targetId: string): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildFreezeTransaction(coin.tokenId, targetId);
        return this.signAndSendTransaction(t)
    }

    public async unfreeze(coin: StableCoin, targetId: string): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildUnfreezeTransaction(coin.tokenId, targetId);
        return this.signAndSendTransaction(t)
    }

    public async pause(coin: StableCoin): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildPausedTransaction(coin.tokenId);
        return this.signAndSendTransaction(t)
    }

    public async unpause(coin: StableCoin): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildUnpausedTransaction(coin.tokenId);
        return this.signAndSendTransaction(t)
    }

    public async transfer(coin: StableCoin, amount: Long, inAccountId: string, outAccountId: string): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildTransferTransaction(coin.tokenId, amount, inAccountId, outAccountId);
        return this.signAndSendTransaction(t)
    }

    public async delete(coin: StableCoin): Promise<TransactionResponse<Record<string, any>, Error, Response>> {
        let t:Transaction = HTSTransactionBuilder.buildDeleteTransaction(coin.tokenId);
        return this.signAndSendTransaction(t)
    }

    public async rescue(coin: StableCoin, amount: Long): Promise<TransactionResponse<Record<string, any>, Error, Response>> {
        throw new Error('Method not implemented.');
    }
    
    public async contractCall(contract: Contract, functionName: string, param: unknown[]): Promise<TransactionResponse<Record<string, any>, Error, Response>> {
        throw new Error('Method not implemented.');
    }


    public async signAndSendTransaction(t: Transaction): Promise<TransactionResponse> { 	
		try {
			let tr:HTransactionResponse = await t.execute(this.client);
            return HTSTransactionResponseHandler.manageResponse(tr, TransactionType.RECEIPT, this.client);
		} catch (error) {
            console.log(`echo3 -> ${error}`)
			throw error;
		}
    }
}
