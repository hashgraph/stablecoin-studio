import { InvalidIdFormat } from './error/InvalidIdFormat.js';

const HEDERA_FORMAT_ID_REGEX =
	/^(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))\.(0|(?:[1-9]\d*))(?:-([a-z]{5}))?$/;

export class HederaId {
	value: string
	constructor(value: string) {
		if (!HEDERA_FORMAT_ID_REGEX.exec(value)) {
			throw new InvalidIdFormat(value);
		}
		this.value = value;
	}

	static from(value?: string): HederaId {
		return new HederaId(value ?? '');
	}
}
