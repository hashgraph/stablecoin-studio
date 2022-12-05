import { HashConnectTypes, MessageTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/types';
import Event from '../../../core/event.js';
import { InitializationData } from './types.js';

export const HaspackEventNames = {
	providerInitEvent: 'providerInitEvent',
	providerFoundExtensionEvent: 'providerFoundExtensionEvent',
	providerPairingEvent: 'providerPairingEvent',
	providerConnectionStatusChangeEvent: 'providerConnectionStatusChangeEvent',
	providerAcknowledgeMessageEvent: 'providerAcknowledgeMessageEvent',
};

interface HaspackProviderEvent extends Event {
	providerInitEvent: (data: InitializationData) => void;
	providerFoundExtensionEvent: () => void;
	providerPairingEvent: (data: HashConnectTypes.SavedPairingData) => void;
	providerConnectionStatusChangeEvent: (
		state: HashConnectConnectionState,
	) => void;
	providerAcknowledgeMessageEvent: (
		state: MessageTypes.Acknowledge,
	) => void;
}

export default HaspackProviderEvent;
