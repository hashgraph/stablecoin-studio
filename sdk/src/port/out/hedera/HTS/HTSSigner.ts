import { ISigner } from "../sign/ISigner";
import { Transaction, Signer, Client, TransactionResponse } from '@hashgraph/sdk';

export class HTSSigner extends ISigner{

    constructor (client:Client) {
        super(client);  
    };

    async signAndSendTransaction(transaction:Transaction, signer?:Signer):TransactionResponse {
        
        if (signer) {
            transaction = transaction.signWithSigner(signer);
        }
        console.log(transaction);
        return transaction.execute(this.client);
    };
}