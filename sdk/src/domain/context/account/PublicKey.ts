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

import KeyProps, { KeyType } from './KeyProps.js';
import { PublicKey as HPublicKey } from '@hashgraph/sdk';
import PrivateKey from './PrivateKey.js';
import BaseError from '../../../core/error/BaseError.js';
import { RuntimeError } from '../../../core/error/RuntimeError.js';

export default class PublicKey implements KeyProps {
	public static readonly NULL: PublicKey = new PublicKey({
		key: 'null',
		type: KeyType.NULL,
	});

	public readonly key: string;
	public readonly type: string;
	constructor(params: Partial<KeyProps> | string) {
		let key: string, type: string;
		if (typeof params === 'string') {
			key = this.formatKey(params);
			type = this.getTypeFromLength(key);
		} else {
			if (!params.key) {
				throw new RuntimeError('Invalid public key');
			}
			key = this.formatKey(params.key);
			type = params.type ?? HPublicKey.fromString(key)._key._type;
		}
		PublicKey.validate(key);
		this.key = key;
		this.type = type;
	}

	private getTypeFromLength(params: string): string {
		switch (params.length) {
			case 66 | 68:
				return KeyType.ECDSA;
			default:
				return KeyType.ED25519;
		}
	}

	private formatKey(key: string): string {
		if (key.length > 0 && key.startsWith('0x')) {
			return key.substring(2);
		}
		return key;
	}

	public static fromHederaKey(key: HPublicKey): PublicKey {
		return new PublicKey({
			key: key.toStringRaw(),
			type: key._key._type,
		});
	}

	public static fromPrivateKey(key: string, type: string): PublicKey {
		return new PrivateKey({ key, type }).publicKey;
	}

	public static isNull(val?: { key: string; type: string }): boolean {
		if (!val) return false;
		return (
			val.key === PublicKey.NULL.key && val.type === PublicKey.NULL.type
		);
	}

	public toHederaKey(): HPublicKey {
		return HPublicKey.fromString(this.key);
	}

	public toString(): string {
		return JSON.stringify({
			key: this.key,
			_type: this.type,
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public static validate(val?: string | object): BaseError[] {
		const err: BaseError[] = [];
		return err;
	}
}
