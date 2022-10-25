import {
	DelegateContractId,
	PublicKey as HPublicKey,
	ContractId as HContractId,
} from '@hashgraph/sdk';
import { ValueObject } from '../../../core/types.js';
import { proto } from '@hashgraph/proto';
import Long from 'long';
import InvalidKeyForContract from './error/InvalidKeyForContract.js';

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
		const normalizedInput = key.replace(/\s/g, '');
		const normalizedHexInput = normalizedInput
			.replace(/0x/g, '')
			.toLowerCase();
		const keyProto = Buffer.from(normalizedHexInput, 'hex');
		const out = proto.Key.decode(keyProto);
		let id =
			out?.contractID?.contractNum ||
			out?.delegatableContractId?.contractNum;
		if (options.strict && !id) {
			throw new InvalidKeyForContract(out);
		} else if (!id) {
			id = Long.ZERO;
		}
		return new ContractId('0.0.' + id.toString());
	}

	public static fromHederaContractId(con: HContractId | DelegateContractId) {
		return new ContractId(String(con));
	}

	public toDelegateContractId(): DelegateContractId {
		return DelegateContractId.fromString(this.id);
	}

	public toString(): string {
		return this.id;
	}
}
