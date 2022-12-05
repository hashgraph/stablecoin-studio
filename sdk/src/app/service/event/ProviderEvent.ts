import { HashConnectTypes, MessageTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/types';
import Event from '../../../core/event.js';

export const HaspackEventNames = {
	providerInitEvent: 'providerInitEvent',
	providerFoundExtensionEvent: 'providerFoundExtensionEvent',
	providerPairingEvent: 'providerPairingEvent',
	providerConnectionStatusChangeEvent: 'providerConnectionStatusChangeEvent',
	providerAcknowledgeMessageEvent: 'providerAcknowledgeMessageEvent',
};

export const ProviderEventNames = {
	providerInitEvent: 'providerInitEvent',
	providerFoundExtensionEvent: 'providerFoundExtensionEvent',
	providerPairingEvent: 'providerPairingEvent',
	providerConnectionStatusChangeEvent: 'providerConnectionStatusChangeEvent',
	providerAcknowledgeMessageEvent: 'providerAcknowledgeMessageEvent',
};

interface ProviderEvent extends Event {
	providerInitEvent: (data: any) => void;
	providerFoundExtensionEvent: () => void;
	providerPairingEvent: (data: HashConnectTypes.SavedPairingData) => void;
	providerConnectionStatusChangeEvent: (
		state: HashConnectConnectionState,
	) => void;
	providerAcknowledgeMessageEvent: (
		state: MessageTypes.Acknowledge,
	) => void;
}

export default ProviderEvent;
