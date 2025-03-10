import {
	DelegateContractId,
	ContractId as HContractId,
	Long,
} from '@hashgraph/sdk';
import { proto } from '@hashgraph/proto';
import InvalidKeyForContract from './error/InvalidKeyForContract.js';
import BaseError from '../../../core/error/BaseError.js';
import CheckStrings from '../../../core/checks/strings/CheckStrings.js';
import { InvalidContractId } from './error/InvalidContractId.js';
import { HederaId } from '../shared/HederaId.js';

export default class ContractId extends HederaId {
	public readonly value: string;

	constructor(value: string) {
		if (value.length == 42 && value.startsWith('0x')) {
			throw new InvalidContractId(value);
		}
		super(value);
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

	public static fromHederaEthereumAddress(evmAddress: string) {
		return new ContractId(
			HContractId.fromSolidityAddress(evmAddress).toString(),
		);
	}

	public static validate(id: string): BaseError[] {
		const err: BaseError[] = [];
		if (!CheckStrings.isNotEmpty(id)) {
			err.push(new InvalidContractId(id));
		} else {
			try {
				if (!(id.length == 42 && id.startsWith('0x')))
					HContractId.fromString(id);
			} catch (error) {
				console.error(error);
				err.push(new InvalidContractId(id));
			}
		}
		return err;
	}

	public toDelegateContractId(): DelegateContractId {
		return DelegateContractId.fromString(this.value);
	}

	public toString(): string {
		return this.value;
	}
}
