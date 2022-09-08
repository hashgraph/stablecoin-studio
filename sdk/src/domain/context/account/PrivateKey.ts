import { ValueObject } from '../../../core/types.js';
import { PrivateKeyNotValid } from './error/PrivateKeyNotValid.js';

export class PrivateKey extends ValueObject<string> {
	public readonly key: string;
	constructor(key: string) {
		super(key);
		this.validate(key);
		this.key = key;
	}

	public validate(str?: string): void {
		if (!str) throw new PrivateKeyNotValid(str ?? 'undefined');
		switch (str.length) {
			case 96:
			case 64:
			case 66:
				break;
			default:
				throw new PrivateKeyNotValid(str ?? 'undefined');
		}
	}
}
