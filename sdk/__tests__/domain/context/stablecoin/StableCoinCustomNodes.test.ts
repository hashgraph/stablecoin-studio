import { HederaNetwork, HederaNetworkEnviroment , Configuration, NetworkMode,ICreateStableCoinRequest} from '../../../../src/index.js';
import { AccountId as HederaAccountId } from '@hashgraph/sdk';
import { ACCOUNTS, getSDKAsync } from '../../../core.js';
import { assert } from 'console';

describe('🧪 [DOMAIN] StableCoin',  () => {
	let sdk:any;
	
    it('Create an stable coin with custom nodes',   async ()  => {
		
		const conf:Configuration = {
			network: new HederaNetwork(HederaNetworkEnviroment.TEST, {"52.168.76.241:50211": new HederaAccountId(4)},''),
			mode: NetworkMode.EOA,
			options: {
				account: ACCOUNTS.testnet,
			}
		}

		sdk = await getSDKAsync(conf);
		const create:ICreateStableCoinRequest  = {
				account: ACCOUNTS.testnet,
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
		const create: ICreateStableCoinRequest = {
			account: ACCOUNTS.testnet,
			name: 'Custom Nodes',
			symbol: 'CN',
			decimals: 2,
		};
		
		await sdk.createStableCoin(create).then((result:any) => setTimeout(() =>{ 
			console.log(result);
			assert(result.name === create.name)
			assert(result.name !== 'prueba')
			}, 10000000));
		
		
	}, 10_100_000);
});
