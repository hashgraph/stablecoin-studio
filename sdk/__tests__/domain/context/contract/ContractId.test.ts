import { ContractId } from '../../../../src/index.js';

describe('🧪 [DOMAIN] ContractId', () => {
	it('Instantiate the class', () => {
		const key = '0.0.423123';
		const contract = new ContractId('0.0.423123');
		expect(contract).not.toBeNull();
		expect(contract.id).toBe(key);
	});

	it('Create from ProtoBufKey', () => {
		const key = { key: '420518f3c4fe16', type: 'ProtobufEncoded' };
		expect(ContractId.fromProtoBufKey(key.key)).not.toBeNull();
	});
});
