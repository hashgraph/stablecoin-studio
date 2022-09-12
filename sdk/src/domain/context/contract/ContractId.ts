import { PublicKey as HPublicKey } from '@hashgraph/sdk';
import { ValueObject } from '../../../core/types.js';

export default class ContractId extends ValueObject {
	public readonly id: string;

	constructor(id: string) {
		super();
		this.id = id;
	}

	public static fromKey(key: string ): ContractId {
        console.log(HPublicKey.fromBytes(key));
        return new ContractId(key);
    };

	public toString(): string {
		throw new Error('Method not implemented.');
	}
}
