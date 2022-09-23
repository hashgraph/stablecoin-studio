import { HashConnectTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/dist/esm/types/index.js';
import Event from '../../../core/event.js';
import { InitializationData } from './types.js';

export const ProviderEventNames = {
	providerInitEvent: 'providerInitEvent',
	providerFoundExtensionEvent: 'providerFoundExtensionEvent',
	providerPairingEvent: 'providerPairingEvent',
	providerConnectionStatusChangeEvent: 'providerConnectionStatusChangeEvent',
	providerAcknowledgeMessageEvent: 'providerAcknowledgeMessageEvent',
};

interface ProviderEvent extends Event {
	providerInitEvent: (data: InitializationData) => void;
	providerFoundExtensionEvent: () => void;
	providerPairingEvent: (data: HashConnectTypes.SavedPairingData) => void;
	providerConnectionStatusChangeEvent: (
		state: HashConnectConnectionState,
	) => void;
	providerAcknowledgeMessageEvent: (
		state: HashConnectConnectionState,
	) => void;
}

export default ProviderEvent;
