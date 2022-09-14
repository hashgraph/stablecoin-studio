import {
    Transaction,Signer
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
export class TransactionResponse{
    idTransaction:String;
	transactionStatus:Status;
	transactionType:TransactionType;
	error:String|undefined;
	reponseParam:[]|undefined;
	topic:String|undefined;

    constructor( 

        idTransaction:String,
        transactionStatus:Status,
        transactionType:TransactionType,
        error?:String,
        reponseParam?:[],
        topic?:String){
        this.idTransaction =idTransaction;    
        this.transactionStatus =transactionStatus;
        this.transactionType =transactionType;
        this.error = error;
        this.reponseParam =reponseParam;
        this.topic = topic;
    }
    
}
export class ISign{

    async signTransaction(transaction:Transaction, signer:Signer,responseType:ResponseType):Promise<TransactionResponse>{
        let response:any = await this.signAndSendTransaction(transaction, signer);
        return this.manageResponse(response, responseType)
    }

    async signAndSendTransaction(transaction:Transaction, signer:Signer):Promise<Uint8Array>{
        throw new Error("Use one implementation");
    }

    manageResponse(response:any,responseType:ResponseType):TransactionResponse{
        throw new Error("Use one implementation")
    };
    


}
