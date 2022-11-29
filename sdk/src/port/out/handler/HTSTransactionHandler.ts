import { Transaction,Client, TransactionResponse } from '@hashgraph/sdk';
import { HTSTransactionBuilder } from   './../builder/HTSTransactionBuilder.js'
import { HTSTransactionResponseHandler } from './response/HTSTransactionResponseHandler.js';
import { HTSResponse, TransactionType } from './response/TransactionResponse.js';

export class HTSTransactionHandler{
    private _client:Client;

    public get client (){
        return this._client
    }

    constructor (client:Client){
        this._client = client

    }

    /**
     * Que deberia hacer el transaction handler (Orquestar la transaccion)
     * 
        Generar la transaccion de hts.
        Enviarla a firma y gestionar la respuesta traduciendola en caso de ser necesrio 
        Devolver el objeto comun de la transaccion.

    */

    public async wipe(accountId: string, tokenId: string, amount: Long): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildTokenWipeTransaction(accountId, tokenId, amount);        
        return this.signAndSendTransaction(t)

    }

    public async mint(tokenId: string, amount: Long): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildTokenMintTransaction(tokenId, amount);
        return this.signAndSendTransaction(t)
    }

    public async burn(tokenId: string, amount: Long): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildTokenBurnTransaction(tokenId, amount);
        return this.signAndSendTransaction(t)
    }

    public async freeze(tokenId: string, targetId: string): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildFreezeTransaction(tokenId, targetId);
        return this.signAndSendTransaction(t)
    }

    public async unfreeze(tokenId: string, targetId: string): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildUnfreezeTransaction(tokenId, targetId);
        return this.signAndSendTransaction(t)
    }

    public async pause(tokenId: string): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildPausedTransaction(tokenId);
        return this.signAndSendTransaction(t)
    }

    public async unpause(tokenId: string): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildUnpausedTransaction(tokenId);
        return this.signAndSendTransaction(t)
    }

    public async transfer(tokenId: string, amount: Long, inAccountId: string, outAccountId: string): Promise<TransactionResponse> {
        let t:Transaction = HTSTransactionBuilder.buildTransferTransaction(tokenId, amount, inAccountId, outAccountId);
        return this.signAndSendTransaction(t)
    }

    private async signAndSendTransaction(t: Transaction): Promise<TransactionResponse> { 	
		try {
			let tr:TransactionResponse = await t.execute(this.client);
            return tr;
		} catch (error) {
            console.log(`echo3 -> ${error}`)
			throw error;
		}
    }
    
}
