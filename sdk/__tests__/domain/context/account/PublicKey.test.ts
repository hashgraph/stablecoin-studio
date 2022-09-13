import { PublicKey } from '../../../../src/index.js';

describe('🧪 [DOMAIN] PublicKey', () => {
	it('Instantiate the class', () => {
		const key =
			'd41996edecdc0975bb72d94bce4a1207d40f8a3b0a90c49d3ef3a697bb09c170';
		const pk = new PublicKey({
			key,
			type: 'ED25519',
		});
		expect(pk).not.toBeNull();
		expect(pk.key).toBe(key);
	});
});
