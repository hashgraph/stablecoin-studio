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

import ContractId from './ContractId.js';
import { InvalidEvmAddress } from './error/InvalidEvmAddress.js';

export default class EvmAddress {
	public readonly value: string;

	constructor(value: string) {
		if (value.length == 42 && value.startsWith('0x')) {
			this.value = value;
		} else if (value.length === 40) {
			this.value = '0x' + value;
		} else {
			throw new InvalidEvmAddress(value);
		}
	}

	static fromContractId(value: ContractId): EvmAddress {
		return new EvmAddress(value.toHederaAddress().toSolidityAddress());
	}

	/* toContractId(): ContractId {
		return ContractId.fromHederaEthereumAddress(this.value);
	} */

	toString(): string {
		return this.value;
	}
}
