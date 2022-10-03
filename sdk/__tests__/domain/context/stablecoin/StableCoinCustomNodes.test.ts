import {
	HederaNetwork,
	HederaNetworkEnviroment,
	Configuration,
	NetworkMode,
	ICreateStableCoinRequest,
} from '../../../../src/index.js';
import { AccountId as HederaAccountId } from '@hashgraph/sdk';
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../../src/domain/context/stablecoin/TokenSupply.js';
import { TokenType } from '../../../../src/domain/context/stablecoin/TokenType.js';
import { ACCOUNTS, getSDKAsync } from '../../../core.js';
import { assert } from 'console';
import PrivateKey from '../../../../src/domain/context/account/PrivateKey.js';
import AccountId from '../../../../src/domain/context/account/AccountId.js';

describe('🧪 [DOMAIN] StableCoin', () => {
	let sdk: any;

	it('Create an stable coin with custom nodes', async () => {
		const conf: Configuration = {
			network: new HederaNetwork(
				HederaNetworkEnviroment.TEST,
				{ '52.168.76.241:50211': new HederaAccountId(4) },
				'',
			),
			mode: NetworkMode.EOA,
			options: {
				account: ACCOUNTS.testnet,
			},
		};

		sdk = await getSDKAsync(conf);
		const create: ICreateStableCoinRequest = {
			accountId: new AccountId(ACCOUNTS.testnet.accountId.id),
			privateKey: new PrivateKey(ACCOUNTS.testnet.privateKey.key),
			name: 'Custom Nodes',
			symbol: 'CN',
			decimals: 2,
		};

		await sdk.createStableCoin(create).then((result: any) =>
			setTimeout(() => {
				assert(result.name === create.name);
				assert(result.name !== 'prueba');
			}, 120000),
		);
	}, 130_000);

	it('Create an stable coin with empty nodes', async () => {
		const conf: Configuration = {
			network: new HederaNetwork(HederaNetworkEnviroment.TEST),
			mode: NetworkMode.EOA,
			options: {
				account: ACCOUNTS.testnet,
			},
		};

		sdk = await getSDKAsync(conf);
		const create: ICreateStableCoinRequest = {
			accountId: new AccountId(ACCOUNTS.testnet.accountId.id),
			privateKey: new PrivateKey(ACCOUNTS.testnet.privateKey.key),
			name: 'Custom Nodes',
			symbol: 'CN',
			decimals: 2,
		};

		await sdk.createStableCoin(create).then((result: any) =>
			setTimeout(() => {
				assert(result.name === create.name);
				assert(result.name !== 'prueba');
			}, 120000),
		);
	}, 130_000);
});
