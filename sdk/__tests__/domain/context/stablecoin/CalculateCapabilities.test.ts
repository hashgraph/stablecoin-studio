import { HederaNetwork, HederaNetworkEnviroment , Configuration, NetworkMode,ICreateStableCoinRequest} from '../../../../src/index.js';
import { AccountId, PrivateKey
} from '@hashgraph/sdk';
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../../src/domain/context/stablecoin/TokenSupply.js';
import { TokenType } from '../../../../src/domain/context/stablecoin/TokenType.js';
import { ACCOUNTS, getSDKAsync } from '../../../core.js';
import { assert } from 'console';
import { Capabilities } from '../../../../src/domain/context/stablecoin/Capabilities.js';

describe('🧪 [DOMAIN] StableCoin',  () => {
	let sdk:any;
	
    it('Create an stable coin with all funtionality',   async ()  => {
		
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
				decimals: 2,
			}
		let id:String = ''; 

		await sdk.createStableCoin(create).then((result:any) => { 
			console.log('result ->' + result);
			id = result.id;
			});
		
			console.log("id ->" + id);
			let cap:Capabilities [] = await sdk.getCapabilitiesStableCoin(id,PrivateKey.fromString( ACCOUNTS.testnet.privateKey.key).publicKey.toString());
			console.log(cap);

	}, 10_100_000);

	it('Create an stable with sdk permmisions',   async ()  => {
		
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
				decimals: 2,
			}
		let id:String = ''; 

		await sdk.createStableCoin(create).then((result:any) => { 
			console.log('result ->' + result);
			id = result.id;
			});
		
			console.log("id ->" + id);
			let cap:Capabilities [] = await sdk.getCapabilitiesStableCoin(id,PrivateKey.fromString( ACCOUNTS.testnet.privateKey.key).publicKey.toString());
			console.log(cap);

	}, 10_100_000);


});
