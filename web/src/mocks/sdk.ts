import PublicKey from 'hedera-stable-coin-sdk/build/esm/src/domain/context/account/PublicKey.js';
import ContractId from 'hedera-stable-coin-sdk/build/esm/src/domain/context/contract/ContractId.js';
import BigDecimal from 'hedera-stable-coin-sdk/build/esm/src/domain/context/shared/BigDecimal.js';
import { HederaId } from 'hedera-stable-coin-sdk/build/esm/src/domain/context/shared/HederaId.js';

export const mockedStableCoinsList = {
	coins:[
		{ symbol: 'HBAR', id: '0.0.123' },
		{ symbol: 'EXP', id: '0.0.13234' },
		{ symbol: 'MCC', id: '0.0.48451290'},
 		{ symbol: 'MCC2', id: '0.0.48471242'},
 		{ symbol: 'MCC3', id: '0.0.48478857'}
	]
};

export const mockedSelectedStableCoin = {
	tokenId: HederaId.from('0.0.49319786'),
	name: 'TEST_ACCELERATOR_SC',
	symbol: 'TEST',
	decimals: 6,
	initialSupply: BigDecimal.fromString('1000.', 6),
	totalSupply: BigDecimal.fromString('1000.', 6),
	maxSupply: BigDecimal.fromString('1000', 6),
	proxyAddress: ContractId.from('0.0.49319785'),
	evmProxyAddress: '0000000000000000000000000000000002f08f69',
	treasury: HederaId.from('0.0.49319785'),
	paused: false,
	deleted: false,
	freezeDefault: false,
	autoRenewAccount: HederaId.from('0.0.49071854'),
	autoRenewAccountPeriod: 90,
	adminKey: ContractId.from('0.0.49319785'),
	kycKey: undefined,
	freezeKey: ContractId.from('0.0.49319785'),
	wipeKey: ContractId.from('0.0.49319785'),
	supplyKey: ContractId.from('0.0.49319785'),
	pauseKey: ContractId.from('0.0.49319785'),
};
export const mockedStableCoinCapabilities = {
	coin: mockedSelectedStableCoin,
	capabilities: [
		{ operation: 'Rescue', access: 1 },
		{ operation: 'Cash_in', access: 1 },
		{ operation: 'Burn', access: 1 },
		{ operation: 'Wipe', access: 1 },
		{ operation: 'Pause', access: 1 },
		{ operation: 'Unpause', access: 1 },
		{ operation: 'Freeze', access: 1 },
		{ operation: 'Unfreeze', access: 1 },
		{ operation: 'Delete', access: 1 },
		{ operation: 'Role_Management', access: 1 },
		{ operation: 'Admin Role', access: 1 },
		{ operation: 'Admin Role', access: 1 },
	],
	account: {
		id: HederaId.from('0.0.48471385' ),
		publicKey: new PublicKey({
			key: '03cce92867cd5e08c67da3fdd0bbae217f7ac73237e2d9058f7551e4ed6d9bf5ce',
			type: 'ECDSA_SECP256K1',
		}),
	},
};

export const mockedWalletData = {
  topic: 'da96975a-ebd9-4382-98f8-41fe25bc2b6b',
  pairingString: 'eWNvbiI6ImNzbHRpQWNjb3VudCI6ZmFsc2V9',
  encryptionKey: 'XdXXecXX-XcXc-XbaX-bXXd-XXXbXXXXcXXX',
  savedPairings: [
    {
      accountIds: ['0.0.48450590'],
      metadata: {
        name: 'HashPack',
        description: 'An example wallet',
        icon: 'https://www.hashpack.app/img/logo.svg',
        url: 'chrome&#45;extension&#58;&#47;&#47;gjagmgiddbbciopjhllkdnddhcglnemk',
        encryptionKey: 'XdXXecXX-XcXc-XbaX-bXXd-XXXbXXXXcXXX',
      },
      network: 'testnet',
      topic: 'da96975a-ebd9-4382-98f8-41fe25bc2b6b',
      origin: 'chrome-extension://gjagmgiddbbciopjhllkdnddhcglnemk',
      encryptionKey: 'XdXXecXX-XcXc-XbaX-bXXd-XXXbXXXXcXXX',
      lastUsed: 1664888808450,
    },
  ],
}

export const mockedFoundWallets = ['HashPack'];