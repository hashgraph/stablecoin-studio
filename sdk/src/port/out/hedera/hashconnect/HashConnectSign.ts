import { ISigner, TransactionType } from "../sign/ISigner";
import {
    Transaction,Signer,Wallet,TransactionResponse,Client
} from '@hashgraph/sdk';

export class HashConnectSign extends ISigner{
    
    constructor (client:Client) {
        super(client);
    };

    async signAndSendTransaction ( transaction:Transaction, signer:Signer):Transaction{
        transaction.signWithSigner(signer);    
        return transaction.executeWithSigner(signer);
    };
}