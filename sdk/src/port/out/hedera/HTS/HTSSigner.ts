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
        console.log(JSON.stringify(this.client))
        console.log(transaction);
        
        return await transaction.freezeWith(this.client).execute(this.client);
   };
   public setClient(client:Client ){
        this.client = client;
   }
}