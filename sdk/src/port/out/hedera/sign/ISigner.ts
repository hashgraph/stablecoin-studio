import { Transaction, Signer, Client, TransactionResponse } from '@hashgraph/sdk';
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
    idTransaction:string;
	transactionStatus:Status;
	transactionType:TransactionType;
	reponseParam:Uint8Array;
    topic:string|undefined;	
    error:string|undefined;
        
    constructor( 
        idTransaction:string,
        transactionStatus:Status,
        transactionType:TransactionType,
        reponseParam:Uint8Array,
        topic?:string,        
        error?:string)
    {
        this.idTransaction =idTransaction;    
        this.transactionStatus =transactionStatus;
        this.transactionType =transactionType;
        this.reponseParam = reponseParam ;
        this.topic = topic;        
        this.error = error;
    }
    
}
export class ISigner{

    client:Client;

    constructor (client:Client) {
        this.client = client;
    };

    async signAndSendTransaction(transaction:Transaction, signer?:Signer):Promise<TransactionResponse>{
        throw new Error ("not an implementation!!");
    }

}
