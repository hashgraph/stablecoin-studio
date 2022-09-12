import { PublicKey as HPublicKey } from '@hashgraph/sdk';
import { ValueObject } from '../../../core/types.js';
import { proto } from '@hashgraph/proto';
import InvalidKeyForContractIdDomainError from './error/InvalidKeyForContractIdDomainError.js';
import Long from 'long';

export default class ContractId extends ValueObject {
	public readonly id: string;

	constructor(id: string) {
		super();
		this.id = id;
	}

	public static fromProtoBufKey(
		key: string,
		options: { strict: boolean } = { strict: false },
	): ContractId {
		const out: proto.Key = proto.Key.decode(Buffer.from(key, 'hex'));
		let id =
			out?.contractID?.contractNum ||
			out?.delegatableContractId?.contractNum;
		if (options.strict && !id) {
			throw new InvalidKeyForContractIdDomainError(out);
		} else if (!id) {
			id = Long.ZERO;
		}
		return new ContractId('0.0.' + id.toString());
	}

	public toString(): string {
		throw new Error('Method not implemented.');
	}
}
