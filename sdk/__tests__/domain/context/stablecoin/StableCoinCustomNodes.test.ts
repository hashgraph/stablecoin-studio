import { HederaNetwork, HederaNetworkEnviroment , Configuration, NetworkMode,ICreateStableCoinRequest} from '../../../../src/index.js';
import { AccountId
} from '@hashgraph/sdk';
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../../src/domain/context/stablecoin/TokenSupply.js';
import { TokenType } from '../../../../src/domain/context/stablecoin/TokenType.js';
import { ACCOUNTS, getSDKAsync } from '../../../core.js';
import { assert } from 'console';

describe('🧪 [DOMAIN] StableCoin',  () => {
	let sdk:any;
	
    it('Create an stable coin with custom nodes',   async ()  => {
		
		const conf:Configuration = {
			network: new HederaNetwork(HederaNetworkEnviroment.TEST, {"52.168.76.241:50211": new AccountId(4)},''),
			mode: NetworkMode.EOA,
			options: {
				account: ACCOUNTS.testnet,
			}
		}

		sdk = await getSDKAsync(conf);
		const create:ICreateStableCoinRequest  = {
				accountId: ACCOUNTS.testnet.accountId.id,
				privateKey: ACCOUNTS.testnet.privateKey.key,
				name: 'Custom Nodes', 
				symbol: 'CN',
				decimals: 2
			}
		
		await sdk.createStableCoin(create).then((result:any) => setTimeout(() =>{ 
			console.log(result);
			assert(result.name === create.name)
			assert(result.name !== 'prueba')
			}, 10000000));
		
		
	}, 10_100_000);
	
	it('Create an stable coin with empty nodes',   async ()  => {
		
		const conf:Configuration = {
			network: new HederaNetwork(HederaNetworkEnviroment.TEST),
			mode: NetworkMode.EOA,
			options: {
				account: ACCOUNTS.testnet,
			}
		}

		sdk = await getSDKAsync(conf);
		const create:ICreateStableCoinRequest  = {
				accountId: ACCOUNTS.testnet.accountId.id,
				privateKey: ACCOUNTS.testnet.privateKey.key,
				name: 'Custom Nodes', 
				symbol: 'CN',
				decimals: 2
			}
		
		await sdk.createStableCoin(create).then((result:any) => setTimeout(() =>{ 
			console.log(result);
			assert(result.name === create.name)
			assert(result.name !== 'prueba')
			}, 10000000));
		
		
	}, 10_100_000);
});
