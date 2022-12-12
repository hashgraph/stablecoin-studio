import { Environment } from '../network/Environment.js';
import { HederaId } from '../shared/HederaId.js';
import PrivateKey from './PrivateKey.js';
import PublicKey from './PublicKey.js';

export interface AccountProps {
	environment: Environment;
	id?: string;
	privateKey?: PrivateKey;
	publicKey?: PublicKey;
	evmAddress?: string;
}

export default class Account {
	public environment: Environment;
	public id: HederaId;
	public evmAddress: string;
	public privateKey?: PrivateKey;
	public publicKey?: PublicKey;
	constructor(props: AccountProps) {
		Object.assign(this, { ...props, id: HederaId.from(props.id) });
	}
}
