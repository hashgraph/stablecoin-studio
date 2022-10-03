import { TransactionType, HTSResponse } from '../sign/ISigner.js';
import {
	TransactionResponse,
	Client,
	TransactionReceipt,
	TransactionRecord,
} from '@hashgraph/sdk';
import HederaError from '../error/HederaError.js';
import Web3 from 'web3';
import { HashConnectSigner } from 'hashconnect/provider/signer';
import { MessageTypes } from 'hashconnect';
import { Signer } from '@hashgraph/sdk/lib/Signer.js';

export class TransactionResposeHandler {
	public async manageResponse(
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
		responseType: TransactionType,
		clientOrSigner: Client | HashConnectSigner,
		nameFunction?: string,
		abi?: any,
	): Promise<HTSResponse> {
		let results: Uint8Array = new Uint8Array();

		if (responseType == TransactionType.RECEIPT) {
			const transactionReceipt: TransactionReceipt =
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
			const transactionRecord: TransactionRecord = await this.getRecord(
				clientOrSigner,
				transactionResponse,
			);

			if (
				nameFunction &&
				transactionRecord.contractFunctionResult?.bytes
			) {
				results = this.decodeFunctionResult(
					nameFunction,
					transactionRecord.contractFunctionResult.bytes,
					abi,
				);
			}
			return this.createHTSResponse(
				transactionRecord.transactionId,
				responseType,
				results,
				transactionRecord.receipt,
			);
		}

		throw new Error('The response type is neither RECORD nor RECEIPT.');
	}

	private async getRecord(
		clientOrSigner: Client | HashConnectSigner,
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
	) {
		let transactionRecord: TransactionRecord;
		if (clientOrSigner instanceof Client) {
			if (transactionResponse instanceof TransactionResponse) {
				transactionRecord = await transactionResponse.getRecord(
					clientOrSigner,
				);
			} else {
				transactionRecord =
					this.getHashconnectTransactionRecord(transactionResponse);
			}
		} else if (clientOrSigner instanceof HashConnectSigner) {
			if (transactionResponse instanceof TransactionResponse) {
				transactionRecord =
					await transactionResponse.getRecordWithSigner(
						clientOrSigner as unknown as Signer,
					);
			} else {
				transactionRecord =
					this.getHashconnectTransactionRecord(transactionResponse);
			}
		} else {
			throw new Error('Unsupported Client');
		}
		return transactionRecord;
	}

	private async getReceipt(
		clientOrSigner: Client | HashConnectSigner,
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
	) {
		let transactionReceipt: TransactionReceipt;
		if (clientOrSigner instanceof Client) {
			if (transactionResponse instanceof TransactionResponse) {
				transactionReceipt = await transactionResponse.getReceipt(
					clientOrSigner,
				);
			} else {
				transactionReceipt =
					this.getHashconnectTransactionReceipt(transactionResponse);
			}
		} else if (clientOrSigner instanceof HashConnectSigner) {
			if (transactionResponse instanceof TransactionResponse) {
				transactionReceipt =
					await transactionResponse.getReceiptWithSigner(
						clientOrSigner as unknown as Signer,
					);
			} else {
				transactionReceipt =
					this.getHashconnectTransactionReceipt(transactionResponse);
			}
		} else {
			throw new Error('Unsupported Client');
		}
		return transactionReceipt;
	}

	private getHashconnectTransactionReceipt(
		transactionResponse: MessageTypes.TransactionResponse,
	): TransactionReceipt {
		const receipt = transactionResponse.receipt;
		if (receipt && typeof receipt === 'string') {
			throw new Error(
				`Unexpected receipt type from Hashpack: ${receipt}`,
			);
		} else {
			return TransactionReceipt.fromBytes(receipt as Uint8Array);
		}
	}

	private getHashconnectTransactionRecord(
		transactionResponse: MessageTypes.TransactionResponse,
	): TransactionRecord {
		const record = transactionResponse.record;
		if (record && typeof record === 'string') {
			throw new Error(`Unexpected receipt type from Hashpack: ${record}`);
		} else {
			return TransactionRecord.fromBytes(record as Uint8Array);
		}
	}

	public createHTSResponse(
		transactionId: any,
		responseType: TransactionType,
		responseParam: Uint8Array,
		receipt: TransactionReceipt,
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
