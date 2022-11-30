import { TransactionResponse as HTransactionResponse,
         Transaction, 
         Client
       } from '@hashgraph/sdk';
import { HederaTransactionHandler } from './HederaTransactionHandler.js';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { HTSTransactionResponseHandler } from './response/HTSTransactionResponseHandler.js';
import { TransactionType } from './response/TransactionResponseEnums.js';


export class HTSTransactionHandler extends HederaTransactionHandler {
    private _client:Client;

    public get client () {
        return this._client
    }

    constructor (client:Client) {
        super();
        this._client = client
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
