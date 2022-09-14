import {  TransactionType,HTSResponse } from "../sign/ISigner";
import {TransactionResponse, Client, TransactionReceipt, TransactionRecord, Status } from "@hashgraph/sdk";
import HederaError from '../error/HederaError.js';
import Web3 from 'web3';

export  class TransactionResposeHandler {

    public static manageResponse(transactionResponse:TransactionResponse, responseType:TransactionType,client:Client, abi?:any ):HTSResponse | undefined {
        
        if (responseType == TransactionType.RECEIPT) { 
            const transactionReceipt: TransactionReceipt = transactionResponse.getReceipt(Client);            
            return this.createHTSResponse(transactionResponse.transactionId,
                                          transactionReceipt.status,
                                          responseType,
                                          transactionReceipt.topicId);
        }

        if (responseType == TransactionType.RECORD) {
            const transactionRecord: TransactionRecord = transactionResponse.getRecord(Client);
            
            const results = this.decodeFunctionResult(
                transactionRecord.name,
                transactionRecord.contractFunctionResult?.bytes,
                abi,
            );
            return this.createHTSResponse(transactionRecord.transactionId,
                                          transactionRecord.receipt.status,
                                          responseType,
                                          transactionRecord.receipt.topicId,
                                          results);
        }   
    };

    public static createHTSResponse(transactionId:any, 
                                    transactionStatus:Status,
                                    responseType:TransactionType,
                                    topic:String,
                                    responseParam?:Uint8Array,
                                    error?:string): HTSResponse {
        return new HTSResponse(transactionId, transactionStatus, responseType, topic, responseParam, error);
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