import {  TransactionType, HTSResponse } from "../sign/ISigner";
import {TransactionResponse, Client, TransactionReceipt, TransactionRecord, Status } from "@hashgraph/sdk";
import HederaError from '../error/HederaError.js';
import Web3 from 'web3';

export  class TransactionResposeHandler {

    public static manageResponse(transactionResponse:TransactionResponse, responseType:TransactionType,client:Client, abi?:any ):HTSResponse {
        
        if (responseType == TransactionType.RECEIPT) { 
            const transactionReceipt: TransactionReceipt = transactionResponse.getReceipt(client);            
            return this.createHTSResponse(transactionResponse.transactionId,
                                          transactionReceipt.status,
                                          responseType,
                                          new Uint8Array(),
                                          transactionReceipt.topicId
                                          );
        }

        if (responseType == TransactionType.RECORD) {
            const transactionRecord: TransactionRecord = transactionResponse.getRecord(client);
            
            const results = this.decodeFunctionResult(
                transactionRecord.name,
                transactionRecord.contractFunctionResult?.bytes,
                abi,
            );
            return this.createHTSResponse(transactionRecord.transactionId,
                                          transactionRecord.receipt.status,
                                          responseType,                                          
                                          results,
                                          transactionRecord.receipt.topicId);
        }   

        throw new Error ("The response type is neither RECORD nor RECEIPT.")
    };

    public static createHTSResponse(transactionId:any, 
                                    transactionStatus:Status,
                                    responseType:TransactionType,
                                    responseParam:Uint8Array,
                                    topic?:string,                                    
                                    error?:string): HTSResponse {
                                        
        return new HTSResponse(transactionId, transactionStatus, responseType, responseParam, topic, error);
    }

    public static decodeFunctionResult(
		functionName: string,
		resultAsBytes: ArrayBuffer,
		abi: any[],
	): Uint8Array {
        const web3 = new Web3();

		const functionAbi = abi.find(
			(func: { name: any }) => func.name === functionName,
		);
		if (!functionAbi?.outputs)
			throw new HederaError(
				'Contract function not found in ABI, are you using the right version?',
			);
		const functionParameters = functionAbi?.outputs;
		const resultHex = '0x'.concat(
			Buffer.from(resultAsBytes).toString('hex'),
		);
		const result = web3.eth.abi.decodeParameters(
			functionParameters || [],
			resultHex,
		);

		const jsonParsedArray = JSON.parse(JSON.stringify(result));

		return jsonParsedArray;
	}

}