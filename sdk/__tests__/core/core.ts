import EOAccount from '../../src/domain/context/account/EOAccount.js';
import PrivateKey from '../../src/domain/context/account/PrivateKey.js';
import {
  Configuration,
  HederaNetwork,
  NetworkMode,
  HederaNetworkEnviroment,
  SDK,
  SDKInitOptions,
} from '../../src/index.js';

const ACCOUNT_ID = '0.0.47822430';
const PK =
  '302e020100300506032b65700422042010f13d4517ae383e2a1a0f915b2f6e70a823f3627e69ab1a8f516666fecdf386';
const TYPE = 'ED25519';

export const ACCOUNTS: { testnet: EOAccount } = {
  testnet: new EOAccount(ACCOUNT_ID, new PrivateKey(PK, TYPE)),
};

export const SDKConfig: { hethers: Configuration; hashpack: Configuration } = {
  hethers: {
    network: new HederaNetwork(HederaNetworkEnviroment.TEST),
    mode: NetworkMode.EOA,
    options: {
      account: ACCOUNTS.testnet,
    },
  },
  hashpack: {
    network: new HederaNetwork(HederaNetworkEnviroment.TEST),
    mode: NetworkMode.HASHPACK,
    options: {
      appMetadata: {
        icon: '',
        name: 'test-app',
        description: 'description example for test app',
        url: 'localhost',
      },
    },
  },
};

export const getSDKAsync = async (
  config?: Configuration,
  initOptions?: SDKInitOptions,
): Promise<SDK> => {
  return await new SDK(config ?? SDKConfig.hethers).init(initOptions);
};

export const getSDK = (config?: Configuration): SDK => {
  return new SDK(config ?? SDKConfig.hethers);
};

export const baseCoin: { name: string; symbol: string; decimals: number } = {
  name: 'TEST COIN',
  symbol: 'TEST COIN',
  decimals: 3,
};
