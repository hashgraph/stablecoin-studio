import { TransactionType, HTSResponse } from '../sign/ISigner.js';
import {
	TransactionResponse,
	Client,
	TransactionReceipt,
	TransactionRecord,
	TransactionId,
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
		abi?: object[],
	): Promise<HTSResponse> {
		let results: Uint8Array = new Uint8Array();
		if (responseType === TransactionType.RECEIPT) {
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

		if (responseType === TransactionType.RECORD) {
			const transactionRecord:
				| TransactionRecord
				| Uint32Array
				| undefined = await this.getRecord(
				clientOrSigner,
				transactionResponse,
			);
			let record: Uint8Array | Uint32Array | undefined;
			if (nameFunction) {
				if (transactionRecord instanceof TransactionRecord) {
					record = transactionRecord?.contractFunctionResult?.bytes;
				} else if (transactionRecord instanceof Uint32Array) {
					record = transactionRecord;
				}
				if (!record) throw new Error('Invalid response type');
				results = this.decodeFunctionResult(nameFunction, record, abi);
			}
			if (record instanceof Uint32Array) {
				return this.createHTSResponse(
					undefined,
					responseType,
					results,
					undefined,
				);
			} else {
				const tr = transactionRecord as TransactionRecord;
				return this.createHTSResponse(
					tr?.transactionId,
					responseType,
					results,
					tr?.receipt,
				);
			}
		}

		throw new Error('The response type is neither RECORD nor RECEIPT.');
	}

	private async getRecord(
		clientOrSigner: Client | Signer,
		transactionResponse:
			| TransactionResponse
			| MessageTypes.TransactionResponse,
	): Promise<TransactionRecord | Uint32Array | undefined> {
		let transactionRecord: TransactionRecord | Uint32Array | undefined;
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
	): Promise<TransactionReceipt> {
		let transactionReceipt: TransactionReceipt;
		if (clientOrSigner instanceof Client) {
			if (transactionResponse instanceof TransactionResponse) {
				transactionReceipt = await transactionResponse.getReceipt(
					clientOrSigner,
				);
			} else {
				throw new Error('Incorrect response type');
			}
		} else {
			if (transactionResponse instanceof TransactionResponse) {
				transactionReceipt = await (
					transactionResponse as TransactionResponse
				).getReceiptWithSigner(clientOrSigner);
			} else {
				transactionReceipt =
					await this.getHashconnectTransactionReceipt(
						transactionResponse,
					);
			}
		}
		return transactionReceipt;
	}

	private async getHashconnectTransactionReceipt(
		transactionResponse: MessageTypes.TransactionResponse,
	): Promise<TransactionReceipt> {
		let receipt;
		if ((transactionResponse as MessageTypes.TransactionResponse).receipt) {
			receipt = TransactionReceipt.fromBytes(
				(transactionResponse as MessageTypes.TransactionResponse)
					.receipt as Uint8Array,
			);
		// } else if (
		// 	(transactionResponse as TransactionResponse).getReceiptWithSigner
		// ) {
		// 	receipt = (
		// 		transactionResponse as TransactionResponse
		// 	).getReceiptWithSigner(null as unknown as Signer);
		} else {
			throw new Error(
				`Unexpected receipt type from Hashpack: ${receipt}`,
			);
		}
		if (receipt) {
			return receipt;
		} else {
			throw new Error(
				`Unexpected receipt type from Hashpack: ${receipt}`,
			);
		}
	}

	private getHashconnectTransactionRecord(
		transactionResponse: MessageTypes.TransactionResponse,
	): Uint32Array | undefined {
		const record = transactionResponse.record;
		if (!record) {
			throw new Error(`Unexpected record type from Hashpack: ${record}`);
		} else {
			try {
				return new Uint32Array(Object.values(record));
			} catch (err) {
				console.log('Could not determine response type for: ', record);
				return undefined;
			}
		}
	}

	public createHTSResponse(
		transactionId: string | TransactionId | undefined,
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
		abi: any, // eslint-disable-line
	): Uint8Array {
		const web3 = new Web3();

		let functionAbi;
		if (abi) {
			functionAbi = abi.find(
				(func: { name: string }) => func.name === functionName,
			);
		} else {
			throw new HederaError(
				`ABI is undefined, so it could not be possible to find contract function`,
			);
		}
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
