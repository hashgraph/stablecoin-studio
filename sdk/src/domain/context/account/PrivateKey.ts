import { ValueObject } from '../../../core/types.js';
import { PrivateKeyNotValid } from './error/PrivateKeyNotValid.js';
import PublicKey from './PublicKey.js';
import { PrivateKey as HPrivateKey } from '@hashgraph/sdk';
import { PrivateKeyTypeNotValid } from './error/PrivateKeyTypeNotValid.js';
import { PrivateKeyType } from '../../../core/enum.js';
import DomainError from '../../../core/error/BaseError.js';

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
