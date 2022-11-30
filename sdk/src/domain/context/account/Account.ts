import { Environment } from '../network/Network.js';
import { HederaId } from '../shared/HederaId.js';
import PrivateKey from './PrivateKey.js';
import PublicKey from './PublicKey.js';

export interface AccountProps {
	id: string;
	environment: Environment;
	privateKey?: PrivateKey;
	publicKey?: PublicKey;
	evmAddress?: string;
}

export default class Account {
	public id: HederaId;
	public environment: Environment;
	public privateKey?: PrivateKey;
	public publicKey?: PublicKey;
	public evmAddress?: string;
	constructor(props: AccountProps) {
		Object.assign(this, props);
	}
}
