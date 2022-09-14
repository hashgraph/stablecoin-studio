import { ISign, ResponseType } from "../sign/ISign";
import {
    Transaction,Signer,Wallet,TransactionResponse,Client
} from '@hashgraph/sdk';

export class HTSSign extends ISign{
    
    async signAndSendTransaction ( transaction:Transaction, signer:Signer):Transaction{
        transaction.sign( Wallet.privateKey);    
        return transaction.execute(Client);
    };
    manageResponse(transactionResponse:TransactionResponse, responseType:ResponseType ):TransactionResponse{
        
        let response:any;
        if (responseType == ResponseType.RECEIPT){ 
           response = transactionResponse.getReceipt(Client);
        }
        if (responseType == ResponseType.RECEIPT){
            response = transactionResponse.getRecord(Client);
        }   
        return response;
    };
}