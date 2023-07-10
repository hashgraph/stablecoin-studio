import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import OperationStableCoinService from '../../../../src/app/service/stablecoin/OperationStableCoinService';
import CapabilitiesStableCoinsService from '../../../../src/app/service/stablecoin/CapabilitiesStableCoinService.js';
import {/* BigDecimal, ContractId, EvmAddress,*/ CreateRequest, HederaId, PublicKey, StableCoin } from '@hashgraph-dev/stablecoin-npm-sdk';

const language: Language = new Language();
const currentAccount = {
  accountId: '0.0.12345',
  privateKey: {
    key: 'key',
    type: 'type',
  },
  network: 'testnet',
  alias: 'alias',
  importedTokens: [{
    id: '0.0.12345',
    symbol: 'TEST'
  }]
};
const currentMirror = {
  name: 'name',
  network: 'network',
  baseUrl: 'baseUrl',
  apiKey: 'apiKey',
  headerName: 'headerName',
  selected: true
};
const currentRPC = {
  name: 'name',
  network: 'network',
  baseUrl: 'baseUrl',
  apiKey: 'apiKey',
  headerName: 'headerName',
  selected: true
};
const tokenToCreate = new CreateRequest({
  name: 'name',
  symbol: 'Test',
  decimals: 6,
  createReserve: false,
});
const capabilities = [
  { operation: 'Rescue', access: 1 },
  { operation: 'RescueHBAR', access: 1 },
  { operation: 'Cash_in', access: 1 },
  { operation: 'Burn', access: 1 },
  { operation: 'Wipe', access: 1 },
  { operation: 'Pause', access: 1 },
  { operation: 'Unpause', access: 1 },
  { operation: 'Freeze', access: 1 },
  { operation: 'Unfreeze', access: 1 },
  { operation: 'Grant_KYC', access: 1 },
  { operation: 'Revoke_KYC', access: 1 },
  { operation: 'Delete', access: 1 },
  { operation: 'Role_Management', access: 1 },
  { operation: 'Admin Role', access: 1 },
  { operation: 'Admin Role', access: 1 },
];
const account = {
  id: new HederaId('0.0.12345'),
  publicKey: new PublicKey({
    key: 'key',
    type: 'type',
  }),
};

describe(`Testing OperationStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'getCurrentAccount').mockReturnValue(currentAccount);
    jest.spyOn(utilsService, 'getCurrentMirror').mockReturnValue(currentMirror);
    jest.spyOn(utilsService, 'getCurrentRPC').mockReturnValue(currentRPC);
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance start with Add', async () => {
    const {coin, reserve} = await StableCoin.create(tokenToCreate);
    jest.spyOn(CapabilitiesStableCoinsService.prototype, 'getCapabilitiesStableCoins').mockResolvedValue({ coin, capabilities, account });
    jest.spyOn(utilsService, 'defaultMultipleAsk').mockResolvedValueOnce(language.getText('wizard.manageImportedTokens.Add'));
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('0.0.12345').mockResolvedValueOnce('0.0.123456');

    const service = new OperationStableCoinService('tokenId', 'memo', 'symbol');
    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
  });

});
