import { ValueObject } from '../../../core/types.js';
import { PrivateKeyNotValid } from './error/PrivateKeyNotValid.js';

export default class PrivateKey extends ValueObject<string> {
	public readonly key: string;
	public readonly _type: string;

	constructor(key: string) {
		super();
		this._type = this.getType(key);
		this.key = key;
	}

	public toString(): string {
		return JSON.stringify({
			key: this.key,
			_type: this._type,
		});
	}

	public getType(key?: string): string {
		if (!key) throw new PrivateKeyNotValid(key ?? 'undefined');
		switch (key.length) {
			case 96:
			case 64:
			case 66:
				return 'ED25519';
			default:
				throw new PrivateKeyNotValid(key);
		}
	}

}
