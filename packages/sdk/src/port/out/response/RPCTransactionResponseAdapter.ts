/*
 *
 * Hedera Stablecoin SDK
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
 * Hedera Stablecoin SDK
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

import { BaseContract, ethers, Result, TransactionReceipt } from 'ethers';
import LogService from '../../../app/service/LogService.js';
import TransactionResponse from '../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseError } from '../error/TransactionResponseError.js';
import { TransactionResponseAdapter } from '../TransactionResponseAdapter.js';
import { Time } from '../../../core/Time.js';

interface EventData<
	T extends BaseContract,
	TEventName extends keyof T['filters'],
> {
	eventName: TEventName;
	contract: T;
}

export class RPCTransactionResponseAdapter extends TransactionResponseAdapter {
	public static async manageResponse<
		T extends BaseContract,
		TEventName extends keyof T['filters'],
	>(
		response: ethers.ContractTransactionResponse,
		network: string,
		event?: EventData<T, TEventName>,
	): Promise<TransactionResponse> {
		LogService.logTrace('Constructing response from:', response);
		try {
			const receipt = await response.wait();
			LogService.logTrace('Receipt:', receipt);
			await Time.delay(1, 'seconds');
			if (receipt === null) {
				LogService.logError(
					`The transaction ${response.hash} was not mined or the network did not respond`,
					{
						transactionHash: response.hash,
						network: network,
					},
				);
				throw new TransactionResponseError({
					message:
						'The transaction could not be confirmed or was rejected by the network..',
					network: network,
					name: event?.eventName.toString(),
					status: 'timeout_or_reverted',
					transactionId: response.hash,
					RPC_relay: true,
				});
			}

			let txResponse: number | Result | null = receipt.status;
			if (receipt.logs && event?.eventName) {
				txResponse = await this.decodeEvent(
					event.contract,
					event.eventName,
					receipt,
				);
			}

			return new TransactionResponse(receipt.hash, txResponse);
		} catch (error) {
			LogService.logError('Uncaught Exception:', JSON.stringify(error));
			throw new TransactionResponseError({
				message: '',
				network: network,
				name: event?.eventName.toString(),
				status: 'error',
				transactionId: (error as any)?.transactionHash,
				RPC_relay: true,
			});
		}
	}

	private static async decodeEvent<
		T extends BaseContract,
		TEventName extends keyof T['filters'],
	>(
		contract: T,
		eventName: TEventName,
		transactionReceipt: TransactionReceipt | null,
	): Promise<Result> {
		if (transactionReceipt == null) {
			throw new Error('Transaction receipt is empty');
		}

		const eventFragment = contract.interface.getEvent(eventName as string);
		if (eventFragment === null) {
			throw new Error(
				`Event "${eventName as string}" doesn't exist in the contract`,
			);
		}

		const topic = eventFragment.topicHash;
		const contractAddress = await contract.getAddress();

		const eventLog = transactionReceipt.logs.find(
			(log) =>
				log.address.toLowerCase() === contractAddress.toLowerCase() &&
				log.topics[0] === topic,
		);

		if (!eventLog) {
			throw new Error(
				`Event log for "${
					eventName as string
				}" not found in transaction receipt`,
			);
		}

		const decodedArgs = contract.interface.decodeEventLog(
			eventFragment,
			eventLog.data,
			eventLog.topics,
		);

		return decodedArgs;
	}
}
