import { ValueObject } from '../../../core/types.js';
import { PublicKeyNotValid } from './error/PublicKeyNotValid.js';
import { PublicKey as HPublicKey } from '@hashgraph/sdk';
import CheckStrings from '../../../core/checks/strings/CheckStrings.js';
import { RequestPublicKey } from '../../../port/in/sdk/request/BaseRequest.js';
import BaseError from '../../../core/error/BaseError.js';
import PrivateKey from './PrivateKey.js';

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
		return new PrivateKey(key, type).publicKey;
	}

	public static isNull(val?: {key: string, type: string}): boolean {
		if(!val) return false;
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

	public static validate(val?: string | object): BaseError[] {
		const err: BaseError[] = [];
		if (typeof val === 'string') {
			if (!CheckStrings.isNotEmpty(val))
				err.push(new PublicKeyNotValid(val ?? 'undefined'));
		} else if (typeof val === 'object') {
			const keys = Object.keys(val);
			if (!(keys.includes('key') && keys.includes('type'))) {
				err.push(new PublicKeyNotValid(JSON.stringify(val)));
			} else {
				const pk = val as RequestPublicKey;
				if (!CheckStrings.isNotEmpty(pk.key)) {
					err.push(new PublicKeyNotValid(JSON.stringify(val)));
				} else if (!CheckStrings.isLengthBetween(pk.key, 64, 66)) {
					err.push(new PublicKeyNotValid(pk.key, pk.type));
				}
			}
		}
		return err;
	}
}
