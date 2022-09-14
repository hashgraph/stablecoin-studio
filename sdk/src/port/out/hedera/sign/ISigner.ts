import { Transaction, PrivateKey, Client, TransactionResponse } from '@hashgraph/sdk';
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
	topic:String|undefined;
	reponseParam:Uint8Array|undefined;
    error:String|undefined;
    
    constructor( 
        idTransaction:String,
        transactionStatus:Status,
        transactionType:TransactionType,
        topic?:String,
        reponseParam?:Uint8Array,
        error?:String)
    {
        this.idTransaction =idTransaction;    
        this.transactionStatus =transactionStatus;
        this.transactionType =transactionType;
        this.topic = topic;
        this.reponseParam =reponseParam;
        this.error = error;
    }
    
}
export class ISigner{

    client:Client;

    constructor (client:Client) {
        this.client = client;
    };

    async signAndSendTransaction(transaction:Transaction, privateKey?:PrivateKey):Promise<TransactionResponse>{
        throw new Error ("not an implementation!!");
    }

}
