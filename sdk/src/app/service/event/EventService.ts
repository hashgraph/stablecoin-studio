import { HashConnectTypes } from 'hashconnect/types';
import Event from '../../../core/event.js';
import EventEmitter from '../../../core/eventEmitter.js';
import Service from '../Service.js';
import { EventListenerNotFound } from './error/EventListenerNotFound.js';
import { EventNotFound } from './error/EventNotFound.js';
import { HaspackEventNames } from './ProviderEvent.js';

export default class EventService extends Service {
	
	private events: { [key: keyof Event]: Event };
	private emitters: { [key: keyof Event]: EventEmitter<Event> } = {};

	constructor(events: { [key: keyof Event]: Event }) {
		super();
		this.events = events;
	}

	private getEventEmitter<E extends keyof Event>(
		event: E,
	): EventEmitter<Event> {
		if (!Object.keys(this.events).includes(event.toString())) {
			throw new EventNotFound(`Event (${event}) not registered yet`);
		}
		if (!Object.keys(this.emitters).includes(event.toString())) {
			const type = this.events[event];
			this.emitters[event] = new EventEmitter<typeof type>();
		}
		return this.emitters[event];
	}

	public on<E extends keyof Event>(event: E, listener: Event[E]): void {
		if (!this.events[event])
			throw new EventListenerNotFound(event.toString());
		this.getEventEmitter(event).on(event, listener);
	}

	public emitInit(data:  HashConnectTypes.SavedPairingData): void {
		this.getEventEmitter(HaspackEventNames.providerInitEvent).emit(
			HaspackEventNames.providerInitEvent,
			data,
		);
	}

	public emit<E extends keyof Event>(
		event: E,
		...args: Parameters<Event[E]>
	): boolean {
		return this.getEventEmitter(event).emit(event, ...args);
	}

	public eventNames(): (keyof Event | string)[] {
		return Object.keys(this.events);
	}
}
