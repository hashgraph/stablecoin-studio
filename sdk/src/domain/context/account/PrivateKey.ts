import { ValueObject } from '../../../core/types.js';
import { PrivateKeyNotValid } from './error/PrivateKeyNotValid.js';
import PublicKey from './PublicKey.js';
import { PrivateKey as HPrivateKey } from '@hashgraph/sdk';
import { PrivateKeyTypeNotValid } from './error/PrivateKeyTypeNotValid.js';
import { PrivateKeyType } from '../../../core/enum.js';
import BaseError from '../../../core/error/BaseError.js';
import CheckStrings from '../../../core/checks/strings/CheckStrings.js';
import { RequestPrivateKey } from '../../../port/in/sdk/request/BaseRequest.js';

export default class PrivateKey extends ValueObject {
	public readonly key: string;
	public readonly type: string;
	public readonly publicKey: PublicKey;

	constructor(key: string, type: string) {
		super();
		this.type = this.validateType(type);
		this.key = key;
		this.publicKey = PublicKey.fromHederaKey(
			this.toHashgraphKey().publicKey,
		);
	}

	public static validate(val?: string | object): BaseError[] {
		const err: BaseError[] = [];
		if (typeof val === 'string') {
			if (!CheckStrings.isNotEmpty(val))
				err.push(new PrivateKeyNotValid(val ?? 'undefined'));
		} else if (typeof val === 'object') {
			const keys = Object.keys(val);
			if (!(keys.includes('key') && keys.includes('type'))) {
				err.push(new PrivateKeyNotValid(JSON.stringify(val)));
			} else {
				const pk = val as RequestPrivateKey;
				if (!CheckStrings.isNotEmpty(pk.key)) {
					err.push(new PrivateKeyNotValid(JSON.stringify(val)));
				} else if (!CheckStrings.isLengthBetween(pk.key, 64, 66)) {
					err.push(new PrivateKeyNotValid(pk.key));
				}
			}
		}
		return err;
	}

	public toString(): string {
		return JSON.stringify({
			key: this.key,
			type: this.type,
		});
	}

	public validateType(type?: string): string {
		if (!type) throw new PrivateKeyTypeNotValid(type ?? 'undefined');
		if (type !== PrivateKeyType.ED25519 && type !== PrivateKeyType.ECDSA) {
			throw new PrivateKeyNotValid(type);
		}
		return type;
	}

	public toHashgraphKey(): HPrivateKey {
		try {
			return this.type === PrivateKeyType.ED25519
				? HPrivateKey.fromStringED25519(this.key)
				: HPrivateKey.fromStringECDSA(this.key);
		} catch (error) {
			throw new PrivateKeyNotValid(this.key);
		}
	}
}
