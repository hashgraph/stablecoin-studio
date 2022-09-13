export enum HederaNetworkEnviroment {
	MAIN = 'mainnet',
	PREVIEW = 'previewnet' , 
	TEST = 'testnet',
	LOCAL = 'local'
}
export class HederaNetwork {
	hederaNetworkEnviroment:HederaNetworkEnviroment;
	nodes:unknown;	
	mirrorNodeUrl: unknown;
	constructor(hederaNetworkEnviroment:HederaNetworkEnviroment,nodes?:unknown ,mirrorNodeUrl?:string){
		this.hederaNetworkEnviroment = hederaNetworkEnviroment;
		this.nodes = nodes;
		this.mirrorNodeUrl = mirrorNodeUrl;
	}
}
export interface HederaNetworkSpec {
    name: string,
    consensusNodes: unknown,
	mirrorNodeUrl: unknown
}
export function getHederaNetwork(hederaNetwork: HederaNetwork): HederaNetworkSpec {
	const enviroment:HederaNetworkEnviroment = hederaNetwork.hederaNetworkEnviroment
	const nodes:unknown = hederaNetwork.nodes
	const mirrorNodeUrl:unknown = hederaNetwork.mirrorNodeUrl
    switch (enviroment) {
        case HederaNetworkEnviroment.MAIN:
            return {name:'mainnet', consensusNodes: nodes, mirrorNodeUrl: mirrorNodeUrl?mirrorNodeUrl:'https://mainnet.mirrornode.hedera.com/'};
        case HederaNetworkEnviroment.PREVIEW:
            return {name:'previewnet', consensusNodes: nodes, mirrorNodeUrl: mirrorNodeUrl?mirrorNodeUrl:'https://previewnet.mirrornode.hedera.com/'};
        case HederaNetworkEnviroment.TEST:
            return {name:'testnet', consensusNodes: nodes, mirrorNodeUrl: mirrorNodeUrl?mirrorNodeUrl:'https://testnet.mirrornode.hedera.com'};
		case HederaNetworkEnviroment.LOCAL:
			return {name:'local', consensusNodes: {"127.0.0.1:50211": "0.0.3"}, mirrorNodeUrl: mirrorNodeUrl?mirrorNodeUrl:'http://127.0.0.1:5551'};

    }
}

