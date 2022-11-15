import { ValueObject } from '../../../core/types.js';
import { AccountIdNotValid } from './error/AccountIdNotValid.js';

export default class AccountId extends ValueObject {
	public static readonly NULL: AccountId = new AccountId('0.0.0');
	public readonly id: string;
	constructor(id: string) {
		super();
		AccountId.validate(id);
		this.id = id;
	}

	public toString(): string {
		return this.id;
	}

	public static validate(str?: string): void {
		if (!/\d\.\d\.\d/.test(str ?? '')) {
			throw new AccountIdNotValid(str ?? 'undefined');
		}
	}
}
