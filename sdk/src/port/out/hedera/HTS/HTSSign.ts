import { ISigner, TransactionType } from "../sign/ISigner";
import {
    Transaction,Signer,Wallet,TransactionResponse,Client
} from '@hashgraph/sdk';

export class HTSSign extends ISigner{

    constructor (client:Client) {
        super(client);  
    };

    async signAndSendTransaction ( transaction:Transaction, signer?:Signer):Transaction{
        return transaction.execute(this.client);
    };
    
}