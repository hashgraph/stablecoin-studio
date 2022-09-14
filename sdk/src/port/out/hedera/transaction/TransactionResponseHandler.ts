import {  TransactionType,HTSResponse } from "../sign/ISigner";
import {TransactionResponse, Client, TransactionReceipt, TransactionRecord} from "@hashgraph/sdk";
import HederaError from '../error/HederaError.js';
import Web3 from 'web3';

export  class TransactionResposeHandler {


    public static manageResponse(transactionResponse:TransactionResponse, responseType:TransactionType,client:Client, abi?:any ):HTSResponse | undefined{
        
        let response:HTSResponse|undefined;
        
        if (responseType == TransactionType.RECEIPT){ 
            const transactionReceipt: TransactionReceipt = transactionResponse.getReceipt(Client);
            response = new HTSResponse(transactionReceipt.idTransaction,
                transactionReceipt.Status,
                responseType,
                transactionReceipt.error);
        }

        if (responseType == TransactionType.RECORD){
            const transactionRecord: TransactionRecord= transactionResponse.getRecord(Client);
            
            const results = this.decodeFunctionResult(
                transactionRecord.name,
                transactionRecord.contractFunctionResult?.bytes,
                abi,
            );
            response = new HTSResponse(transactionRecord.idTransaction,
                transactionRecord.Status,
                responseType,
                transactionRecord.error,
                results);
        }   
        return response;
    };

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