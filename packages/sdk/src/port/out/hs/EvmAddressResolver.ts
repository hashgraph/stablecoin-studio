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

import ContractId from '../../../domain/context/contract/ContractId';
import { HederaId } from '../../../domain/context/shared/HederaId';
import { EVM_ZERO_ADDRESS } from '../../../core/Constants';
import { MirrorNodeAdapter } from '../mirror/MirrorNodeAdapter';
import PublicKey from '../../../domain/context/account/PublicKey';
import { PublicKey as HPublicKey } from '@hiero-ledger/sdk';
import { KeysStruct } from '../../../domain/context/factory/FactoryKey';

/**
 * Utility for resolving Hedera IDs and ContractIds to EVM addresses.
 * Extracted from TransactionAdapter to remove business logic from the adapter.
 *
 * Uses a lazy getter for MirrorNodeAdapter to avoid constructor-time
 * resolution issues with dependency injection.
 */
export class EvmAddressResolver {
	constructor(private readonly getMirrorNode: () => MirrorNodeAdapter) {}

	async resolve(parameter: ContractId | HederaId | string): Promise<string> {
		if (parameter instanceof ContractId) {
			if (parameter.value == HederaId.NULL.value) {
				return EVM_ZERO_ADDRESS;
			}
			return (
				await this.getMirrorNode().getContractInfo(parameter.toString())
			).evmAddress.toString();
		}
		if (parameter instanceof HederaId) {
			if (parameter.value == HederaId.NULL.value) {
				return EVM_ZERO_ADDRESS;
			}
			return (
				await this.getMirrorNode().accountToEvmAddress(parameter)
			).toString();
		}
		return parameter as string;
	}

	getMirrorNodeAdapter(): MirrorNodeAdapter {
		return this.getMirrorNode();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	buildKeysForSmartContract(providedKeys: any[]): KeysStruct[] {
		const KEY_TYPE_BITS = [1, 2, 4, 8, 16, 32, 64];
		const keys: KeysStruct[] = [];

		providedKeys.forEach((providedKey, index) => {
			if (providedKey && index < KEY_TYPE_BITS.length) {
				const key = new KeysStruct();
				key.keyType = BigInt(KEY_TYPE_BITS[index]);
				key.publicKey =
					providedKey.key == PublicKey.NULL.key
						? '0x'
						: HPublicKey.fromString(providedKey.key).toBytesRaw();
				key.isEd25519 = providedKey.type === 'ED25519';
				keys.push(key);
			}
		});
		return keys;
	}
}
