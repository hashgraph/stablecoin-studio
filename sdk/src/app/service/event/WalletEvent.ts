import { Account } from '@hashgraph/hethers/lib/utils.js';
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

export interface WalletFoundEvent extends WalletBaseEvent {
	name: string;
}
export interface WalletPairedEvent extends WalletBaseEvent {
	data: InitializationData;
	network: Environment;
}
export interface WalletConnectionStatusChangedEvent extends WalletBaseEvent {
	status: ConnectionState;
}

export interface WalletAccountChanged extends WalletBaseEvent {
	account: Account;
}
export interface WalletAcknowledgeMessageEvent extends WalletBaseEvent {
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
	walletAccountChanged: (data: WalletAccountChanged) => void;
	walletDisconnect: () => void;
};

export default WalletEvent;
