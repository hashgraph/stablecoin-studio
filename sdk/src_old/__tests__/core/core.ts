import EOAccount from '../../src_old/domain/context/account/EOAccount.js.js';
import PrivateKey from '../../src_old/domain/context/account/PrivateKey.js.js';
import {
  Configuration,
  HederaNetwork,
  NetworkMode,
  HederaNetworkEnviroment,
  SDK,
  SDKInitOptions,
  ValidationResponse,
} from '../../src_old/index.js.js';
import { RequestAccount } from '../../src_old/port/in/sdk/request/BaseRequest.js.js';

const ACCOUNT_ID = '0.0.47822430';
const PK =
  '302e020100300506032b65700422042010f13d4517ae383e2a1a0f915b2f6e70a823f3627e69ab1a8f516666fecdf386';
const TYPE = 'ED25519';
export const FACTORY_ID = '0.0.49045465';
export const HEDERAERC20_ID = '0.0.49059747';


export const EXAMPLE_TOKEN = {
  proxyContractId: '0.0.48826169',
  tokenId: '0.0.48826175',
};

export const MAX_SUPPLY = 9_223_372_036_854_775_807n;

export const ACCOUNTS: { testnet: EOAccount } = {
  testnet: new EOAccount(ACCOUNT_ID, new PrivateKey(PK, TYPE)),
};

export const REQUEST_ACCOUNTS: { testnet: RequestAccount } = {
  testnet: {
    accountId: ACCOUNT_ID,
    privateKey: {
      key: PK,
      type: TYPE,
    },
  },
};

export const SDKConfig: { hethers: Configuration; hashpack: Configuration } = {
  hethers: {
    network: new HederaNetwork(HederaNetworkEnviroment.TEST),
    mode: NetworkMode.EOA,
    options: {
      account: REQUEST_ACCOUNTS.testnet,
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

export const logValidation = (val: ValidationResponse[]): void => {
  val.map((v) =>
    v.errors.map((e) =>
      console.log(`${v.name} - [${e.errorCode}] ${e.message}`),
    ),
  );
};
