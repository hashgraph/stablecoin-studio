import { HashConnect, HashConnectTypes ,MessageTypes} from 'hashconnect/dist/cjs/main';
import { HashConnectSigner } from 'hashconnect/dist/cjs/provider/signer.js';
import { IniConfig, IProvider } from '../Provider.js';
import { HederaNetwork,getHederaNetwork, AppMetadata } from '../../../in/sdk/sdk.js';
import { ContractId } from '@hashgraph/sdk';
import { StableCoin } from '../../../../domain/context/stablecoin/StableCoin.js';
import { ICallContractRequest } from '../types.js';
import { HashConnectConnectionState } from 'hashconnect/dist/cjs/types/hashconnect.js';

export default class HashPackProvider implements IProvider {
	private hc: HashConnect;
	private initData: HashConnectTypes.InitilizationData;
	private network: HederaNetwork;
	private extensionMetadata:AppMetadata;	

	public async init({
		network,
		options,
	}: IniConfig): Promise<HashPackProvider> {
		this.hc = new HashConnect(true);
		this.network = network;
		this.registerEvents();
		if (options && options?.appMetadata) {
			this.initData = await this.hc.init(
				options.appMetadata,
				getHederaNetwork(network)?.name as Partial<'mainnet' | 'testnet' | 'previewnet'>,
			);
		} else {
			throw new Error('No app metadata');
		}
		let topic = this.initData.topic;
		const state = await this.hc.connect();
        
        this.hc.findLocalWallets();
		this.hc.connectToLocalWallet();

		return this;
	}

	public async callContract(
		name: string,
		parameters: ICallContractRequest,
	): Promise<Uint8Array> {
		throw new Error('Method not implemented.');
	}

	public encodeFunctionCall(
		functionName: string,
		parameters: any[],
		abi: any[],
	): Uint8Array {
		throw new Error('Method not implemented.');
	}

	public decodeFunctionResult(
		functionName: string,
		resultAsBytes: ArrayBuffer,
		abi: any[],
	): Uint8Array {
		throw new Error('Method not implemented.');
	}

	public getPublicKey(privateKey?: string | undefined): string {
		throw new Error('Method not implemented.');
	}

	public async deployStableCoin(
		accountId: string,
		privateKey: string,
		stableCoin: StableCoin,
	): Promise<ContractId> {
		throw new Error('Method not implemented.');
	}

	public async stop(): Promise<boolean> {
		const topic = this.initData.topic;
		await this.hc.disconnect(topic);
		await this.hc.clearConnectionsAndData();
		return new Promise((res) => {
			res(true);
		});
	}

	private getSigner(): HashConnectSigner {
		const provider = this.hc.getProvider(
			getHederaNetwork(this.network)?.name,
			this.initData.topic,
			'0.0.1', // TODO
		);
		return this.hc.getSigner(provider);
	}

	registerEvents(): void {

		const foundExtensionEventHandler = (data: HashConnectTypes.WalletMetadata) => {
			console.log("====foundExtensionEvent====");
			console.log(JSON.stringify(data));
		
		  };
		
	   	const pairingEventHandler = (data: MessageTypes.ApprovePairing) => {
			 console.log("====pairingEvent:::Wallet connected=====");
			 console.log(JSON.stringify(data));
	
		};
		
	   	const acknowledgeEventHandler = (data: MessageTypes.Acknowledge) => {
			console.log("====Acknowledge:::Wallet request received =====");
			console.log(JSON.stringify(data));
	
	   };

	    const transactionEventHandler = (data: MessageTypes.Transaction) => {
			console.log("====Transaction:::Transaction executed =====");
			console.log(JSON.stringify(data));
	
 		};

   		const additionalAccountRequestEventHandler = (data: MessageTypes.AdditionalAccountRequest) => {
			console.log("====AdditionalAccountRequest:::AdditionalAccountRequest=====");
			console.log(JSON.stringify(data));
		}
		
		const connectionStatusChangeEventHandler = (data: HashConnectConnectionState) => {
			console.log("====AdditionalAccountRequest:::AdditionalAccountRequest=====");
			console.log(JSON.stringify(data));
		}
		const authRequestEventHandler = (data: MessageTypes.AuthenticationRequest) => {
			console.log("====AdditionalAccountRequest:::AdditionalAccountRequest=====");
			console.log(JSON.stringify(data));
		}
		
		/*const signRequestEventHandler = (data: ) => {
			console.log("====AdditionalAccountRequest:::AdditionalAccountRequest=====");
			console.log(JSON.stringify(data));
		}*/
	};
	

	getBalance(): Promise<number> {
		throw new Error('Method not implemented.');
	}
}
