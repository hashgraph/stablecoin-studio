/*
 *
 * Hedera Stable Coin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import Web3 from 'web3';
import LogService from '../../app/service/LogService.js';
import TransactionResponse from '../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseError } from './error/TransactionResponseError.js';

export interface TransactionResponseAdapter {
	manageResponse(): TransactionResponse;
}

export class TransactionResponseAdapter {
	public static decodeFunctionResult(
		functionName: string,
		resultAsBytes: ArrayBuffer,
		abi: any, // eslint-disable-line
	): Uint8Array {
		try {
			const web3 = new Web3();

			let functionAbi;
			if (abi) {
				functionAbi = abi.find(
					(func: { name: string }) => func.name === functionName,
				);
			} else {
				throw new TransactionResponseError({
					message: `ABI is undefined, so it could not be possible to find contract function`,
				});
			}
			if (!functionAbi?.outputs)
				throw new TransactionResponseError({
					message: `Contract function ${functionName} not found in ABI, are you using the right version?`,
				});
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
		} catch (error) {
			LogService.logError(error);
			throw new TransactionResponseError({
				message: 'Could not decode function result',
			});
		}
	}
}
