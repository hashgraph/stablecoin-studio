import { ConstructorFragment } from '@hashgraph/hethers/lib/utils';
import {
    Transaction,Signer,Client,TransactionResponse
} from '@hashgraph/sdk';
/* Debe de firmar de una u otra forma en funcion de la configuracion del SDK*/
export enum TransactionType{
    RECORD,
    RECEIPT
}
export enum Status {
    SUCCES,
    ERROR
}
export class HTSResponse{
    idTransaction:String;
	transactionStatus:Status;
	transactionType:TransactionType;
	error:String|undefined;
	reponseParam:Uint8Array|undefined;
	topic:String|undefined;
    
    constructor( 
        idTransaction:String,
        transactionStatus:Status,
        transactionType:TransactionType,
        error?:String,
        reponseParam?:Uint8Array,
        topic?:String)
    {
        this.idTransaction =idTransaction;    
        this.transactionStatus =transactionStatus;
        this.transactionType =transactionType;
        this.error = error;
        this.reponseParam =reponseParam;
        this.topic = topic;
    }
    
}
export class ISigner{

    client:Client;

    constructor (client:Client) {
        this.client = client;
    };
    async signAndSendTransaction(transaction:Transaction,transactionType:TransactionType, signer?:Signer):Promise<TransactionResponse>{
        throw new Error ("not an implementation!!");
    }

}
