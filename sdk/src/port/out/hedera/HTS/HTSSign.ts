import { ISigner } from "../sign/ISigner";
import { Transaction, Signer, Client, TransactionResponse } from '@hashgraph/sdk';

export class HTSSign extends ISigner{

    constructor (client:Client) {
        super(client);  
    };

    async signAndSendTransaction(transaction:Transaction, signer?:Signer):TransactionResponse {
        
        if (signer) {
            transaction = transaction.signWithSigner(signer);
        }
        return transaction.execute(this.client);
    };
}