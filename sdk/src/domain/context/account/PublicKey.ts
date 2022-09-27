import { ValueObject } from '../../../core/types.js';
import { PublicKeyNotValid } from './error/PublicKeyNotValid.js';
import { PublicKey as HPublicKey } from '@hashgraph/sdk';

export default class PublicKey extends ValueObject {
	public static readonly NULL: PublicKey = new PublicKey({
		key: 'null',
		type: 'null',
	});
	
	public readonly key: string;
	public readonly type: string;
	constructor(params: { key: string; type: string }) {
		const { key, type } = params;
		super();
		this.validate(key);
		this.key = key;
		this.type = type;
	}

	public static fromHederaKey(key: HPublicKey): PublicKey {
		return new PublicKey({
			key: key.toStringRaw(),
			type: key._key._type
		})
	}

	public toHederaKey(): HPublicKey {
		return HPublicKey.fromString(this.key)
	}

	public toString(): string {
		return JSON.stringify({
			key: this.key,
			_type: this.type,
		});
	}

	public validate(str?: string): void {
		if (!str) throw new PublicKeyNotValid(str ?? 'undefined');
	}
}
