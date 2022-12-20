import KeyProps, { KeyType } from './KeyProps.js';
import { PublicKey as HPublicKey } from '@hashgraph/sdk';
import PrivateKey from './PrivateKey.js';
import BaseError from '../../../core/error/BaseError.js';

export default class PublicKey implements KeyProps {
	public static readonly NULL: PublicKey = new PublicKey({
		key: 'null',
		type: KeyType.NULL,
	});

	public readonly key: string;
	public readonly type: string;
	constructor(params: KeyProps) {
		const { key, type } = params;
		PublicKey.validate(key);
		this.key = key;
		this.type = type;
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
