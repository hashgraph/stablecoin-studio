import { HederaNetwork, HederaNetworkEnviroment , Configuration, NetworkMode,ICreateStableCoinRequest} from '../../../../src/index.js';
import { AccountId
} from '@hashgraph/sdk';
import { StableCoin } from '../../../../src/domain/context/stablecoin/StableCoin.js';
import { TokenSupplyType } from '../../../../src/domain/context/stablecoin/TokenSupply.js';
import { TokenType } from '../../../../src/domain/context/stablecoin/TokenType.js';
import { ACCOUNTS, getSDK } from '../../../core.js';
import { assert } from 'console';

describe('🧪 [DOMAIN] StableCoin', () => {
	let sdk:any;


	beforeEach(async () => {
		//const nodes = new Map();

		//nodes.set("34.94.106.61:50212",AccountId.fromString("0.0.3"));

		let conf:Configuration = {
			network: new HederaNetwork(HederaNetworkEnviroment.TEST, {"127.0.0.1:50211": new AccountId(3)}),
			mode: NetworkMode.EOA,
			options: {
				account: ACCOUNTS.testnet,
			}
		}
		sdk = await getSDK(conf);
	});
	
    it('Create an base instance', () => {
		let create:ICreateStableCoinRequest  = {
				accountId: ACCOUNTS.testnet.accountId.id,
				privateKey: ACCOUNTS.testnet.privateKey.key,
				name: 'Custom Nodes', 
				symbol: 'CN',
				decimals: 2,
				memo: 'CN'
			}
			//let result:StableCoin
		let sc:any;
		sdk.createStableCoin(create).then((result:any) => 
			{
				console.log(result);
				sc = result;
			}).catch((err:any) => {
				console.log(err);
			  });;
		console.log(sc);
		assert(sc.name =="Custom Nodes")
	});
	
});
