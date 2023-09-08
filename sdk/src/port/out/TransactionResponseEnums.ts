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

/*import {
	TransactionReceipt,
	TransactionId
} from '@hashgraph/sdk';*/

export enum TransactionType {
	RECORD,
	RECEIPT,
}
export enum Status {
	SUCCES,
	ERROR,
}
/*export class HTSResponse {
	idTransaction: string| TransactionId | undefined;
	transactionType: TransactionType;
	reponseParam: Uint8Array;
	receipt?: TransactionReceipt;

	constructor(
		idTransaction: string | TransactionId | undefined,
		transactionType: TransactionType,
		reponseParam: Uint8Array,
		receipt?: TransactionReceipt,
	) {
		this.idTransaction = idTransaction;
		this.transactionType = transactionType;
		this.reponseParam = reponseParam;
		this.receipt = receipt;
	}
}*/
