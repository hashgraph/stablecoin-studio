import { ISigner } from "../sign/ISigner";
import { Transaction, Signer, Client, TransactionResponse } from '@hashgraph/sdk';

export class HTSSigner extends ISigner{

    constructor (client:Client) {
        super(client);  
    };

    async signAndSendTransaction(transaction:Transaction, signer?:Signer):Promise <TransactionResponse> {
        
        if (signer) {
            transaction = transaction.signWithSigner(signer);
        }
              
        //return await transaction.freezeWith(this.client).execute(this.client);
        return await transaction.execute(this.client);
   };

}