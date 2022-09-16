import { ISigner, TransactionType } from "../sign/ISigner";
import {
    Transaction,Signer,Wallet,TransactionResponse,Client
} from '@hashgraph/sdk';

export class HashConnectSigner extends ISigner{
    
    constructor (client:Client) {
        super(client);
    };

    async signAndSendTransaction ( transaction:Transaction, signer?:Signer):Promise<TransactionResponse>{
        if (signer){
            transaction.signWithSigner(signer);    
            return transaction.executeWithSigner(signer);
        }
        throw new Error("Is necessary to have a Signer");
    };
}