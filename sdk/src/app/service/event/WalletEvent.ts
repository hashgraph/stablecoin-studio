import { HashConnectTypes, MessageTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/types';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { TransactionAdapterInitializationData } from '../../../port/out/TransactionAdapter.js';

export enum WalletEvents {
	walletInit = 'walletInit',
	walletFound = 'walletFound',
	walletPaired = 'walletPaired',
	walletConnectionStatusChanged = 'walletConnectionStatusChanged',
	walletAcknowledgeMessage = 'walletAcknowledgeMessage',
	walletDisconnect = 'walletDisconnect',
}

export interface WalletBaseEvent {
	wallet: SupportedWallets;
}

export interface WalletInitEvent extends WalletBaseEvent {
	initData: TransactionAdapterInitializationData;
}

export interface WalletFoundEvent {
	name: string;
}

type WalletEvent = {
	walletInit: (data: WalletInitEvent) => void;
	walletFound: () => void;
	walletPaired: (data: HashConnectTypes.SavedPairingData) => void;
	walletConnectionStatusChanged: (state: HashConnectConnectionState) => void;
	walletAcknowledgeMessage: (state: MessageTypes.Acknowledge) => void;
	walletDisconnect: () => void;
};

export default WalletEvent;
