import { MAINNET_ADDRESS_BOOK, PREVIEWNET_ADDRESS_BOOK, TESTNET_ADDRESS_BOOK
} from '@hashgraph/sdk';
export enum HederaNetwork {
	MAIN,
	PREVIEW, 
	TEST,
	LOCAL,
}
export interface HederaNetworkSpec {
    name: string,
    consensusNodes: {},
	mirrorNodeUrl: string
}
export function getHederaNetwork(hederaNetwork: HederaNetwork): HederaNetworkSpec {
    switch (hederaNetwork) {
        case HederaNetwork.MAIN:
            return {name:'mainnet', consensusNodes: MAINNET_ADDRESS_BOOK, mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com/'};
        case HederaNetwork.PREVIEW:
            return {name:'previewnet', consensusNodes: PREVIEWNET_ADDRESS_BOOK, mirrorNodeUrl: 'https://previewnet.mirrornode.hedera.com/'};
        case HederaNetwork.TEST:
            return {name:'testnet', consensusNodes: TESTNET_ADDRESS_BOOK, mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com'};
		case HederaNetwork.LOCAL:
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