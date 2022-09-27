import Event from '../../../core/event.js';
import EventEmitter from '../../../core/eventEmitter.js';
import { InitializationData } from '../../../index.js';
import { ProviderEventNames } from '../../../port/out/hedera/ProviderEvent.js';
import Service from '../Service.js';

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
			throw new Error(`Event (${event}) not registered yet`);
		}
		if (!Object.keys(this.emitters).includes(event.toString())) {
			const type = this.events[event];
			this.emitters[event] = new EventEmitter<typeof type>();
		}
		return this.emitters[event];
	}

	public on<E extends keyof Event>(event: E, listener: Event[E]): void {
		if (!this.events[event])
			throw new Error(
				`Event (${event}) emitter listener not registered yet`,
			);
		this.getEventEmitter(event).on(event, listener);
	}

	public emitInit(data: InitializationData): void {
		this.getEventEmitter(ProviderEventNames.providerInitEvent).emit(
			ProviderEventNames.providerInitEvent,
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
