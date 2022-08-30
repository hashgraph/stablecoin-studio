import Service from '../Service';

/**
 * Utilities Service
 */
export default class UtilitiesService extends Service {
	constructor() {
		super('Utilities');
	}

	public getPublicKey(privateKey: string): string {
		const { PrivateKey } = require('@hashgraph/sdk');

		const publicKey =
			PrivateKey.fromString(privateKey).publicKey.toStringDer();

		return publicKey;
	}
}
