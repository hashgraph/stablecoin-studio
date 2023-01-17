import {
  CreateRequest,
  HederaERC20AddressTestnet,
  FactoryAddressTestnet,
  TokenSupplyType,
  StableCoinViewModel
} from 'hedera-stable-coin-sdk';
import { utilsService } from '../../../../src/index.js';
import { IAccountConfig } from '../../../../src/domain/configuration/interfaces/IAccountConfig.js';
import { IPrivateKey } from '../../../../src/domain/configuration/interfaces/IPrivateKey.js';
import { INetworkConfig } from '../../../../src/domain/configuration/interfaces/INetworkConfig.js';
import CreateStableCoinService from '../../../../src/app/service/stablecoin/CreateStableCoinService';


describe(`Testing ${CreateStableCoinService.name} class`, () => {
  let createStableCoin: CreateStableCoinService;
  let account: IAccountConfig;
  let network: INetworkConfig;
  let tokenToCreate: CreateRequest;

  beforeAll(() => async function(){
    createStableCoin = new CreateStableCoinService();

    const privateKey: IPrivateKey = 
    {
      key: '0x77989f3fd05a7c07d6f9079c7c42bf4ba82bb50d407d31f04fc0752d0e971a08',
      type: 'ED25519'
    }

    account = 
    {
        accountId: '0.0.49046006',
        privateKey: privateKey,
        network: 'testnet',
        alias: '',
    }

    network = 
    {
      name: 'testnet',
      mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
      chainId: 296,
      consensusNodes: [],
    }

    utilsService.setCurrentAccount(account);
    utilsService.setCurrentNetwotk(network);
    await utilsService.initSDK();

  });

  beforeEach(
    () => {
      tokenToCreate = new CreateRequest({
        name: 'CLITestToken',
        symbol: 'CLT',
        decimals: 6,
        initialSupply: "1000",
        maxSupply: "0",
        freezeDefault: false,
        autoRenewAccount: undefined,
        adminKey: undefined,
        freezeKey: undefined,
        KYCKey: undefined,
        wipeKey: undefined,
        pauseKey: undefined,
        supplyKey: undefined,
        treasury: undefined,
        supplyType: TokenSupplyType.INFINITE,
        stableCoinFactory: FactoryAddressTestnet,
        hederaERC20: HederaERC20AddressTestnet,
        reserveAddress: "0.0.0",
        reserveInitialAmount: "0",
        createReserve: false,
      });
    }
  );

  it('Create Stable Coin', () => async function(){

    let createdToken: StableCoinViewModel = await createStableCoin.createStableCoin(tokenToCreate);

    console.log(createdToken);
    expect(createdToken).not.toBeNull();
  });
});
