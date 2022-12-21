import KeyProps, { KeyType } from './KeyProps.js';
import { PrivateKey as HPrivateKey } from '@hashgraph/sdk';
import PublicKey from './PublicKey.js';
import BaseError from '../../../core/error/BaseError.js';
import { PrivateKeyNotValid } from './error/PrivateKeyNotValid.js';

export default class PrivateKey implements KeyProps {
	public readonly key: string;
	public readonly type: string;
	public readonly publicKey: PublicKey;

	constructor(props: KeyProps) {
		const { key, type } = props;
		this.type = this.validateType(type);
		this.key = key;
		this.publicKey = PublicKey.fromHederaKey(
			this.toHashgraphKey().publicKey,
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public static validate(val?: string | object): BaseError[] {
		const err: BaseError[] = [];
		return err;
	}

	public toString(): string {
		return JSON.stringify({
			key: this.key,
			type: this.type,
		});
	}

	public validateType(type?: string): KeyType {
		if(type && Object.keys(KeyType).includes(type)){
			return Object.entries(KeyType).filter(([key,]) => key === type)[0][1];
		}
		return KeyType.NULL;
	}

	public toHashgraphKey(): HPrivateKey {
		try {
			return this.type === KeyType.ED25519
				? HPrivateKey.fromStringED25519(this.key)
				: HPrivateKey.fromStringECDSA(this.key);
		} catch (error) {
			throw new PrivateKeyNotValid(this.key);
		}
	}
}
