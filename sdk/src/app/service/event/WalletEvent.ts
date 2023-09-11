/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import {
	InitializationData,
	NetworkData,
} from '../../../port/out/TransactionAdapter.js';

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
	network: NetworkData;
}
export interface WalletConnectionStatusChangedEvent extends WalletBaseEvent {
	status: ConnectionState;
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
	walletDisconnect: (data: WalletBaseEvent) => void;
};

export default WalletEvent;
