/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { HederaNetwork, HederaNetworkEnviroment, NetworkMode, SDK } from 'hedera-stable-coin-sdk';

export enum HashConnectConnectionState {
	Connected = 'Connected',
	Disconnected = 'Disconnected',
	Paired = 'Paired',
	Connecting = 'Connecting',
}

interface HashConnectData {
	encryptionKey: string;
	pairingData: [];
	pairingString: string;
	topic: string;
}

interface SDKContextProviderProps {
	data: {
		accoundId: string;
		availabilityExtension: boolean;
		status: 'connected' | 'disconnected';
	};
	hashconnectData: HashConnectData | null;
	pairingData: [];
	init: () => void;
	connectWallet: () => void;
	getStatus: () => HashConnectConnectionState;
}

interface AppMetadata {
	icon: string;
	name: string;
	description: string;
	url: string;
}

interface SDKInitialData {
	hashconnectData: HashConnectData | null;
	pairingData: [];
}

const init: SDKContextProviderProps = {
	data: {
		accoundId: '',
		availabilityExtension: false,
		status: 'disconnected',
	},
	hashconnectData: null,
	pairingData: [],
	init: () => {},
	connectWallet: () => {},
	getStatus: () => HashConnectConnectionState.Disconnected,
};

const appMetadata: AppMetadata = {
	name: 'dApp Example',
	description: 'An example hedera dApp',
	icon: 'https://absolute.url/to/icon.png',
	url: '',
};

export const SDKContext = createContext<SDKContextProviderProps>(init);

export const SDKContextProvider = ({ children }: { children: ReactNode }) => {
	const storedData = localStorage.getItem('hashconnectData');

	const sdk = new SDK({
		network: new HederaNetwork(HederaNetworkEnviroment.TEST), // TODO: dynamic data
		mode: NetworkMode.HASHPACK,
		options: {
			appMetadata,
		},
	});

	const initializeHashConnect = async () => {
		await sdk.init();
	};

	useEffect(() => {
		if (!storedData) initializeHashConnect();
	}, [storedData]);

	const initialData: SDKInitialData = {
		hashconnectData: null,
		pairingData: [],
	};

	if (storedData) {
		const jsonData = JSON.parse(storedData);
		initialData.hashconnectData = jsonData;

		const { pairingData } = jsonData;
		console.log('pairingDataContext', pairingData);

		if (pairingData.length > 0) initialData.pairingData = pairingData;
	}

	const initHashconnect = async () => {
		const response = await sdk.init();
		console.log('======RESPONSE INIT======', response);
	};

	const connectWallet = async () => {
		const response = await sdk.connectWallet();
		console.log('======RESPONSE CONNECT======', response);
	};

	const getStatus = (): HashConnectConnectionState => {
		const response = sdk.gethashConnectConectionStatus();
		console.log('======RESPONSE STATUS======', response);
		return response;
	};

	const value: SDKContextProviderProps = {
		data: {
			accoundId: '',
			availabilityExtension: false,
			status: 'disconnected',
		},
		hashconnectData: initialData.hashconnectData,
		pairingData: initialData.pairingData,
		init: initHashconnect,
		connectWallet,
		getStatus,
	};

	return <SDKContext.Provider value={value}>{children}</SDKContext.Provider>;
};
