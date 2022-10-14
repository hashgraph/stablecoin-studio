import ContractsService from '../../../../src/app/service/contract/ContractsService.js';
import { IProvider } from '../../../../src/port/out/hedera/Provider.js';
import { ICallContractRequest } from '../../../../src/port/out/hedera/types.js';
import NetworkAdapter from '../../../../src/port/out/network/NetworkAdapter.js';
import { ACCOUNTS } from '../../../core/core.js';
import { HederaERC20__factory } from 'hedera-stable-coin-contracts/typechain-types/index.js';

const networkAdapter = jest.mock(
  '../../../../src/port/out/network/NetworkAdapter',
) as unknown as NetworkAdapter;

const provider = jest.mock(
  '../../../../src/port/out/hedera/Provider',
) as unknown as IProvider;

describe('🧪 [SERVICE] ContractService', () => {
  let contractService: ContractsService;

  beforeAll(async () => {
    // Mock
    contractService = new ContractsService(mockRepo(networkAdapter, provider));
  });
  it('Instantiate the class', () => {
    expect(contractService).not.toBeNull();
  });

  it('Get public key', () => {
    const spyPublicKey = jest.spyOn(provider, 'getPublicKeyString');
    contractService.getPublicKey(ACCOUNTS.testnet.privateKey.toString());

    expect(spyPublicKey).toHaveBeenCalledTimes(1);
    expect(spyPublicKey).toHaveBeenCalledWith(
      ACCOUNTS.testnet.privateKey.toString(),
    );
  });

  it('callContract', () => {
    const spyPublicKey = jest.spyOn(provider, 'callContract');
    const params: ICallContractRequest = {
      contractId: 'test',
      parameters: [],
      gas: 250_000,
      abi: HederaERC20__factory.abi,
    };
    contractService.callContract('initialize', params);

    expect(spyPublicKey).toHaveBeenCalledTimes(1);
    expect(spyPublicKey).toHaveBeenCalledWith('initialize', params);
  });

  it('encodeFuncionCall', () => {
    const spyPublicKey = jest.spyOn(provider, 'encodeFunctionCall');
    const params: string[] = [];
    contractService.encodeFuncionCall(
      'initialize',
      params,
      HederaERC20__factory.abi,
    );

    expect(spyPublicKey).toHaveBeenCalledTimes(1);
    expect(spyPublicKey).toHaveBeenCalledWith(
      'initialize',
      params,
      HederaERC20__factory.abi,
    );
  });
});

function mockRepo(
  networkAdapter: NetworkAdapter,
  provider: IProvider,
): NetworkAdapter {
  networkAdapter.provider = provider;
  networkAdapter.provider.callContract = jest.fn();
  networkAdapter.provider.getPublicKeyString = jest.fn();
  networkAdapter.provider.encodeFunctionCall = jest.fn();
  return networkAdapter;
}
