import { HashConnectTypes } from 'hashconnect';
import { HashConnectConnectionState } from 'hashconnect/dist/esm/types/index.js';
import Event from '../../../core/event.js';
import EventEmitter from '../../../core/eventEmitter.js';
import { InitializationData } from '../../../index.js';
import { ProviderEventNames } from '../../../port/out/hedera/ProviderEvent.js';
import Service from '../Service.js';

export default class EventService extends Service {
	private events: { [key: keyof Event]: EventEmitter<Event> };

	constructor(emitters: { [key: keyof Event]: EventEmitter<Event> }) {
		super();
		this.events = emitters;
	}

	private on<E extends keyof Event>(event: E, listener: Event[E]): void {
		this.events[event].on(event, listener);
	}

	public EmitInit(data: InitializationData): void {
		this.events[ProviderEventNames.providerInit].emit(
			ProviderEventNames.providerInit,
			data,
		);
	}

	public OnWalletInit(listener: (data: InitializationData) => void): void {
		this.on(ProviderEventNames.providerInit, listener);
	}

	public OnWalletPaired(
		listener: (data: HashConnectTypes.SavedPairingData) => void,
	): void {
		this.on(ProviderEventNames.providerPairingEvent, listener);
	}

	public OnWalletConnectionChanged(
		listener: (state: HashConnectConnectionState) => void,
	): void {
		this.on(
			ProviderEventNames.providerConnectionStatusChangeEvent,
			listener,
		);
	}

	public OnWalletExtensionFound(listener: () => void): void {
		this.on(ProviderEventNames.providerFoundExtensionEvent, listener);
	}

	public OnWalletAcknowledgeMessageEvent(
		listener: (state: HashConnectConnectionState) => void,
	): void {
		this.on(ProviderEventNames.providerAcknowledgeMessageEvent,listener);
	}
}
