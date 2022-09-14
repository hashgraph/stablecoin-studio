import { ISigner } from "../sign/ISigner";
import { Transaction, PrivateKey, Client, TransactionResponse } from '@hashgraph/sdk';

export class HTSSign extends ISigner{

    constructor (client:Client) {
        super(client);  
    };

    async signAndSendTransaction(transaction:Transaction, privateKey?:PrivateKey):TransactionResponse {
        if (privateKey) {
            transaction = transaction.sign(privateKey);
        }
        return transaction.execute(this.client);
    };
}