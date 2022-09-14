import {  TransactionType,HTSResponse } from "./sign/ISigner";
import {TransactionResponse,Client} from "@hashgraph/sdk";

export  class TransactionResposeHandler {
    
    public static manageResponse(transactionResponse:TransactionResponse, responseType:TransactionType,client:Client,abi?:any ):HTSResponse{
        
    let response:any;
    if (responseType == TransactionType.RECEIPT){ 
       response = transactionResponse.getReceipt(Client);
    }
    if (responseType == TransactionType.RECORD){
        response = transactionResponse.getRecord(Client);
    }   
    return response;
    };
}