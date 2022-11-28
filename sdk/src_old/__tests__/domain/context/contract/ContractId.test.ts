import { ContractId } from '../../../../src_old/index.js.js';
import { DelegateContractId, ContractId as HContractId } from '@hashgraph/sdk';

describe('🧪 [DOMAIN] ContractId', () => {
  it('Instantiate the class', () => {
    const key = '0.0.423123';
    const contract = new ContractId('0.0.423123');
    expect(contract).not.toBeNull();
    expect(contract.id).toBe(key);
  });

  it('Create from ProtoBufKey', () => {
    const key = { key: '420518f3c4fe16', type: 'ProtobufEncoded' };
    const out = ContractId.fromProtoBufKey(key.key);
    expect(out.id).toBe('0.0.48210547');
  });

  it('Create from HederaContractId', () => {
    const hederaTokenId = '0.0.48523956';
    const hederaContractId = HContractId.fromString(hederaTokenId);
    const contractId = ContractId.fromHederaContractId(hederaContractId);

    expect(contractId).not.toBeNull();
    expect(contractId.id).toBe(hederaTokenId);
  });

  it('Test toString', () => {
    const key = '0.0.423123';
    const contract = new ContractId('0.0.423123');
    expect(contract.toString()).toBe(key);
  });

  it('Test toDelegateContractId', () => {
    const contract = new ContractId('0.0.423123');

    const delegatecontractId = contract.toDelegateContractId();
    expect(delegatecontractId).toBeInstanceOf(DelegateContractId);
    expect(String(delegatecontractId)).toBe('0.0.423123');
  });
});
