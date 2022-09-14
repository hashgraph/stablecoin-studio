import { ISign, ResponseType } from "../sign/ISign";
import {
    Transaction,Signer,Wallet,TransactionResponse,Client
} from '@hashgraph/sdk';

export class HashConnectSign extends ISign{
    
    async signAndSendTransaction ( transaction:Transaction, signer:Signer):Transaction{
        transaction.signWithSigner(signer);    
        return transaction.executeWithSigner(Client);
    };
    manageResponse(transactionResponse:TransactionResponse, responseType:ResponseType ):Transaction{
        
        let response:any;
        return response;
    };
}