import { Environment } from '../../../domain/context/network/Environment.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { InitializationData } from '../../../port/out/TransactionAdapter.js';

export enum WalletEvents {
	walletInit = 'walletInit',
	walletFound = 'walletFound',
	walletPaired = 'walletPaired',
	walletConnectionStatusChanged = 'walletConnectionStatusChanged',
	walletAcknowledgeMessage = 'walletAcknowledgeMessage',
	walletDisconnect = 'walletDisconnect',
}

export enum ConnectionState {
	Connecting = 'Connecting',
	Connected = 'Connected',
	Disconnected = 'Disconnected',
	Paired = 'Paired',
}

export interface WalletBaseEvent {
	wallet: SupportedWallets;
}

export interface WalletInitEvent extends WalletBaseEvent {
	initData: InitializationData;
}

export interface WalletFoundEvent {
	name: string;
}
export interface WalletPairedEvent {
	data: InitializationData;
	network: Environment;
}
export interface WalletConnectionStatusChangedEvent {
	status: ConnectionState;
}
export interface WalletAcknowledgeMessageEvent {
	result: boolean;
}

type WalletEvent = {
	walletInit: (data: WalletInitEvent) => void;
	walletFound: (data: WalletFoundEvent) => void;
	walletPaired: (data: WalletPairedEvent) => void;
	walletConnectionStatusChanged: (
		data: WalletConnectionStatusChangedEvent,
	) => void;
	walletAcknowledgeMessage: (data: WalletAcknowledgeMessageEvent) => void;
	walletDisconnect: () => void;
};

export default WalletEvent;
