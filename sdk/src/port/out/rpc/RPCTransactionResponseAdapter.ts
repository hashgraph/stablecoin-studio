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

/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { ethers } from 'ethers';
import LogService from '../../../app/service/LogService.js';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseError } from '../error/TransactionResponseError.js';
import { TransactionResponseAdapter } from '../TransactionResponseAdapter.js';

export class RPCTransactionResponseAdapter extends TransactionResponseAdapter {
	public static async manageResponse(
		response: ethers.ContractTransaction,
		network: string,
		eventName?: string,
	): Promise<TransactionResponse> {
		LogService.logTrace('Constructing response from:', response);
		try {
			const receipt = await response.wait();
			LogService.logTrace('Receipt:', receipt);
			if (receipt.events && eventName) {
				const returnEvent = receipt.events.filter(
					(e) => e.event && e.event === eventName,
				);
				if (returnEvent.length > 0 && returnEvent[0].args) {
					return new TransactionResponse(
						receipt.transactionHash,
						returnEvent[0].args,
					);
				}
			}
			return Promise.resolve(
				new TransactionResponse(
					receipt.transactionHash,
					receipt.status,
				),
			);
		} catch (error) {
			LogService.logError('Uncaught Exception:', JSON.stringify(error));
			throw new TransactionResponseError({
				message: '',
				network: network,
				name: eventName,
				status: 'error',
				transactionId: (error as any)?.transactionHash,
				RPC_relay: true,
			});
		}
	}
}
