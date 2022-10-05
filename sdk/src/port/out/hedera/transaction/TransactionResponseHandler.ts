import { TransactionType, HTSResponse } from '../sign/ISigner.js';
import {
	TransactionResponse,
	Client,
	TransactionReceipt,
	TransactionRecord,
} from '@hashgraph/sdk';
import HederaError from '../error/HederaError.js';
import Web3 from 'web3';
import { MessageTypes } from 'hashconnect';
import { Signer } from '@hashgraph/sdk/lib/Signer.js';

export class TransactionResposeHandler {
	public async manageResponse(
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
		responseType: TransactionType,
		clientOrSigner: Client | Signer,
		nameFunction?: string,
		abi?: any,
	): Promise<HTSResponse> {
		let results: Uint8Array = new Uint8Array();

		if (responseType == TransactionType.RECEIPT) {
			const transactionReceipt: TransactionReceipt | undefined =
				await this.getReceipt(clientOrSigner, transactionResponse);
			let transId;
			if (transactionResponse instanceof TransactionResponse) {
				transId = transactionResponse.transactionId;
			} else {
				transId = transactionResponse.id;
			}
			return this.createHTSResponse(
				transId,
				responseType,
				results,
				transactionReceipt,
			);
		}

		if (responseType == TransactionType.RECORD) {
			const transactionRecord: TransactionRecord | undefined =
				await this.getRecord(clientOrSigner, transactionResponse);

			if (
				nameFunction &&
				transactionRecord?.contractFunctionResult?.bytes
			) {
				results = this.decodeFunctionResult(
					nameFunction,
					transactionRecord.contractFunctionResult.bytes,
					abi,
				);
			}
			return this.createHTSResponse(
				transactionRecord?.transactionId,
				responseType,
				results,
				transactionRecord?.receipt,
			);
		}

		throw new Error('The response type is neither RECORD nor RECEIPT.');
	}

	private async getRecord(
		clientOrSigner: Client | Signer,
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
	): Promise<TransactionRecord | undefined> {
		let transactionRecord: TransactionRecord | undefined;
		if (clientOrSigner instanceof Client) {
			if (transactionResponse instanceof TransactionResponse) {
				transactionRecord = await transactionResponse.getRecord(
					clientOrSigner,
				);
			} else {
				transactionRecord =
					this.getHashconnectTransactionRecord(transactionResponse);
			}
		} else {
			if (transactionResponse instanceof TransactionResponse) {
				transactionRecord =
					await transactionResponse.getRecordWithSigner(
						clientOrSigner,
					);
			} else {
				transactionRecord =
					this.getHashconnectTransactionRecord(transactionResponse);
			}
		}
		return transactionRecord;
	}

	private async getReceipt(
		clientOrSigner: Client | Signer,
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
	): Promise<TransactionReceipt | undefined> {
		let transactionReceipt: TransactionReceipt | undefined;
		if (clientOrSigner instanceof Client) {
			if (transactionResponse instanceof TransactionResponse) {
				transactionReceipt = await transactionResponse.getReceipt(
					clientOrSigner,
				);
			} else {
				transactionReceipt =
					this.getHashconnectTransactionReceipt(transactionResponse);
			}
		} else {
			console.log(transactionResponse);
			if (transactionResponse instanceof TransactionResponse) {
				transactionReceipt =
					await transactionResponse.getReceiptWithSigner(
						clientOrSigner,
					);
			} else {
				transactionReceipt =
					this.getHashconnectTransactionReceipt(transactionResponse);
			}
		}
		return transactionReceipt;
	}

	private getHashconnectTransactionReceipt(
		transactionResponse: MessageTypes.TransactionResponse,
	): TransactionReceipt | undefined {
		const receipt = transactionResponse.receipt;
		console.log(receipt);
		if (receipt && receipt instanceof Uint8Array) {
			return TransactionReceipt.fromBytes(receipt);
		} else if (!receipt) {
			return undefined;
		} else {
			throw new Error(
				`Unexpected receipt type from Hashpack: ${receipt}`,
			);
		}
	}

	private getHashconnectTransactionRecord(
		transactionResponse: MessageTypes.TransactionResponse,
	): TransactionRecord | undefined {
		console.log(transactionResponse);
		const record = transactionResponse.record;
		if (record && record instanceof Uint8Array) {
			return TransactionRecord.fromBytes(record);
		} else if (!record) {
			return undefined;
		} else {
			throw new Error(`Unexpected receipt type from Hashpack: ${record}`);
		}
	}

	public createHTSResponse(
		transactionId: any,
		responseType: TransactionType,
		responseParam: Uint8Array,
		receipt?: TransactionReceipt,
	): HTSResponse {
		return new HTSResponse(
			transactionId,
			responseType,
			responseParam,
			receipt,
		);
	}

	public decodeFunctionResult(
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
				`Contract function ${functionName} not found in ABI, are you using the right version?`,
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
