import { MAINNET_ADDRESS_BOOK, PREVIEWNET_ADDRESS_BOOK, TESTNET_ADDRESS_BOOK
} from '@hashgraph/sdk';

export enum HederaNetworkEnviroment {
	MAIN,
	PREVIEW, 
	TEST,
	LOCAL
}
export class HederaNetwork {
	hederaNetworkEnviroment:HederaNetworkEnviroment;
	nodes:[];	

	constructor(hederaNetworkEnviroment:HederaNetworkEnviroment,nodes:[]){
		this.hederaNetworkEnviroment = hederaNetworkEnviroment;
		this.nodes = nodes
	}
}
export interface HederaNetworkSpec {
    name: string,
    consensusNodes: {},
	mirrorNodeUrl: string
}
export function getHederaNetwork(hederaNetwork: HederaNetwork): HederaNetworkSpec {
	const enviroment:HederaNetworkEnviroment = hederaNetwork.hederaNetworkEnviroment
	const nodes:[] = hederaNetwork.nodes
    switch (enviroment) {
        case HederaNetworkEnviroment.MAIN:
            return {name:'mainnet', consensusNodes: nodes?nodes:MAINNET_ADDRESS_BOOK, mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com/'};
        case HederaNetworkEnviroment.PREVIEW:
            return {name:'previewnet', consensusNodes: nodes?nodes:PREVIEWNET_ADDRESS_BOOK, mirrorNodeUrl: 'https://previewnet.mirrornode.hedera.com/'};
        case HederaNetworkEnviroment.TEST:
            return {name:'testnet', consensusNodes: nodes?nodes:TESTNET_ADDRESS_BOOK, mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com'};
		case HederaNetworkEnviroment.LOCAL:
			return {name:'local', consensusNodes: {"127.0.0.1:50211": "0.0.3"}, mirrorNodeUrl: 'http://127.0.0.1:5551'};

    }
}

/**
 * 
 * export type HederaNetwork = {
	MAIN : {
		name:'mainnet', 
		consensusNodes: AddressBooks.MAINNET_ADDRESS_BOOK, 
		mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com/'
	},
	PREVIEW: {
		name:'previewnet', 
		consensusNodes: AddressBooks.PREVIEWNET_ADDRESS_BOOK, 
		mirrorNodeUrl: 'https://previewnet.mirrornode.hedera.com/'
	}, 
	TEST:{
		name:'testnet', 
		consensusNodes: AddressBooks.TESTNET_ADDRESS_BOOK, 
		mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com'
	},
	LOCAL: {
		name:'local', 
		consensusNodes: {"127.0.0.1:50211": "0.0.3"} , 
		mirrorNodeUrl: 'http://127.0.0.1:5551'
	}
}
 */