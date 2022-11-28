import { Transaction,Client, TransactionResponse } from '@hashgraph/sdk';
import {HTSTransactionBuilder} from   './../builder/HTSTransactionBuilder.js'
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


    public async wipe(accountId: string, tokenId: string, amount: Long,): Promise<any>{

        let t:Transaction = HTSTransactionBuilder["buildTokenWipeTransaction"](accountId,tokenId,amount);
        console.log("echo1 -> " + JSON.stringify(t))
        return   this.signAndSendTransaction(t)

    }
    public async cashIn (accountId: string, tokenId: string, amount: Long,): Promise<any>{

        let t:Transaction = HTSTransactionBuilder.buildTokenMintTransaction(tokenId,amount);
        console.log("echo1 -> " + JSON.stringify(t))
        return   this.signAndSendTransaction(t)

    }

    private async  signAndSendTransaction(t: Transaction): Promise<TransactionResponse> { 
	
		try {

			let tr:TransactionResponse = await t.execute(this.client);
            console.log("echo2 -> " + JSON.stringify(tr))
            return tr

		} catch (error) {
            console.log("echo3 -> ")
			throw error;
		}
    }

   
    
}
