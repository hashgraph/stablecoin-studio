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

import PublicKey from './PublicKey.js';
import { proto } from '@hashgraph/proto';
import { UnsupportedKeyType } from './error/UnsupportedKeyType.js';
import { KeyType } from './KeyProps.js';
import Hex from '../../../core/Hex.js';

export default class MultiKey {
	keys: PublicKey[];
	threshold: number;

	constructor(keys: PublicKey[], threshold: number) {
		this.keys = keys;
		this.threshold = threshold;
	}

	public static fromProtobuf(protobuf: string): MultiKey {
		const uint8Array = Uint8Array.from(Buffer.from(protobuf, 'hex'));
		const decoded_key = proto.Key.decode(uint8Array);

		if (decoded_key.keyList) {
			if (!decoded_key.keyList.keys)
				throw new UnsupportedKeyType(`No Keys found in key list`);

			const keys: PublicKey[] = this.getPublicKeys(
				decoded_key.keyList.keys,
			);

			return new MultiKey(keys, keys.length);
		} else if (decoded_key.thresholdKey) {
			if (!decoded_key.thresholdKey.threshold)
				throw new UnsupportedKeyType(
					`Threshold undefined in threshold key`,
				);
			if (!decoded_key.thresholdKey.keys)
				throw new UnsupportedKeyType(`No Keys found in threshold key`);
			if (!decoded_key.thresholdKey.keys.keys)
				throw new UnsupportedKeyType(
					`No key list found in threshold key`,
				);

			const threshold = decoded_key.thresholdKey.threshold;

			const keys: PublicKey[] = this.getPublicKeys(
				decoded_key.thresholdKey.keys.keys,
			);

			return new MultiKey(keys, threshold);
		} else {
			throw new UnsupportedKeyType(decoded_key.key ?? 'empty');
		}
	}

	private static getPublicKeys(listOfKeys: proto.IKey[]): PublicKey[] {
		const keys: PublicKey[] = [];

		listOfKeys.forEach((key) => {
			let uint8ArrayKey: Uint8Array = new Uint8Array();
			let keyType: KeyType;

			if (key.ed25519) {
				uint8ArrayKey = key.ed25519;
				keyType = KeyType.ED25519;
			} else if (key.ECDSASecp256k1) {
				uint8ArrayKey = key.ECDSASecp256k1;
				keyType = KeyType.ECDSA;
			} else
				throw new UnsupportedKeyType(
					`Only ECDSASecp256k1 and ed25519 are supported`,
				);

			const hexKey = Hex.fromUint8Array(uint8ArrayKey);

			const pk = new PublicKey({
				key: hexKey,
				type: keyType,
			});

			keys.push(pk);
		});

		return keys;
	}
}
