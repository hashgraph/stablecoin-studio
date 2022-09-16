import {  TransactionType, HTSResponse } from "../sign/ISigner";
import {TransactionResponse, Client, TransactionReceipt, TransactionRecord, Status } from "@hashgraph/sdk";
import HederaError from '../error/HederaError.js';
import Web3 from 'web3';

export  class TransactionResposeHandler {

    public async manageResponse(transactionResponse:TransactionResponse, responseType:TransactionType, client:Client, nameFunction?:string, abi?:any ):Promise<HTSResponse> {
        
        let results : Uint8Array = new Uint8Array();
        if (responseType == TransactionType.RECEIPT) { 
            const transactionReceipt: TransactionReceipt = await transactionResponse.getReceipt(client);            
            return this.createHTSResponse(transactionResponse.transactionId,
                                          responseType,
                                          results,
                                          transactionReceipt
                                          );
        }

        if (responseType == TransactionType.RECORD) {            
            const transactionRecord: TransactionRecord = await transactionResponse.getRecord(client);
            
            if (nameFunction) {
                results = this.decodeFunctionResult(nameFunction,
                                                    transactionRecord.contractFunctionResult?.bytes,
                                                    abi
                );
            }   
            return this.createHTSResponse(transactionRecord.transactionId,
                                        responseType,                                          
                                        results,
                                        transactionRecord.receipt
                                        );
        }   

        throw new Error ("The response type is neither RECORD nor RECEIPT.")
    };

    public  createHTSResponse(transactionId:any, 
                              responseType:TransactionType,
                              responseParam:Uint8Array,
                              receipt: TransactionReceipt
                              ): HTSResponse {
                                               
        return new HTSResponse(transactionId, responseType, responseParam, receipt);
    }

    public  decodeFunctionResult(
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