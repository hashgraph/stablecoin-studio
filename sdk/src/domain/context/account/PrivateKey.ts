import { ValueObject } from '../../../core/types.js';
import { PrivateKeyNotValid } from './error/PrivateKeyNotValid.js';
import PublicKey from './PublicKey.js';
import { PrivateKey as HPrivateKey } from '@hashgraph/sdk';
import { PrivateKeyTypeNotValid } from './error/PrivateKeyTypeNotValid.js';
import { PrivateKeyType } from '../../../core/enum.js';

export default class PrivateKey extends ValueObject {
	public readonly key: string;
	public readonly type: string;
	public readonly publicKey: PublicKey;

	constructor(key: string, type: string) {
		super();
		this.type = this.validateType(type);
		this.key = key;
		this.publicKey = PublicKey.fromHederaKey(
			HPrivateKey.fromString(key).publicKey,
		);
	}

	public toString(): string {
		return JSON.stringify({
			key: this.key,
			type: this.type,
		});
	}

	public validateType(type?: string): string {
		if (!type) throw new PrivateKeyTypeNotValid(type ?? 'undefined');
		if (type !== PrivateKeyType.ED25519 && type !== PrivateKeyType.ECSA) {
			throw new PrivateKeyNotValid(type);
		}
		return type;
	}
}
