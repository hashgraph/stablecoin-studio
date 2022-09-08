import { ValueObject } from '../../../core/types.js';
import { AccountIdNotValid } from './error/AccountIdNotValid.js';

export default class AccountId extends ValueObject<string> {
	public readonly id: string;
	constructor(id: string) {
		super(id);
        this.validate(id);
		this.id = id;
	}

    public toString(): string {
        return this.id;
    }

    public validate(str?: string): void {
        if(!/\d\.\d\.\d/.test(str ?? '')){
            throw new AccountIdNotValid(str ?? 'undefined')
        }
    }
}
