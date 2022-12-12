import EventEmitter from '../../../core/EventEmitter.js';
import Service from '../Service.js';
import { EventListenerNotFound } from './error/EventListenerNotFound.js';
import { EventNotFound } from './error/EventNotFound.js';
import { singleton } from 'tsyringe';
import WalletEvent, { WalletEvents } from './WalletEvent.js';

type WalletEventIndex = Record<keyof WalletEvent, WalletEvent>;
type WalletEventEmitterIndex = Partial<
	Record<keyof WalletEvent, EventEmitter<WalletEvent>>
>;

@singleton()
export default class EventService extends Service {
	private events: WalletEventIndex;
	private emitters: WalletEventEmitterIndex = {};

	constructor(events: typeof WalletEvents) {
		super();
		this.events = Object.keys(events).reduce(
			(p, c) => ({ ...p, [c]: events }),
			{},
		) as WalletEventIndex;
	}

	private getEventEmitter<E extends keyof WalletEvent>(
		event: E,
	): EventEmitter<WalletEvent> {
		if (!Object.keys(this.events).includes(event.toString())) {
			throw new EventNotFound(
				`WalletEvent (${event}) not registered yet`,
			);
		}
		if (!Object.keys(this.emitters).includes(event.toString())) {
			const type = this.events[event];
			this.emitters[event] = new EventEmitter<typeof type>();
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.emitters[event]!;
	}

	public on<E extends keyof WalletEvent>(
		event: E,
		listener: WalletEvent[E],
	): void {
		if (!this.events[event])
			throw new EventListenerNotFound(event.toString());
		this.getEventEmitter(event).on(event, listener);
	}

	public emit<E extends keyof WalletEvent>(
		event: E,
		...args: Parameters<WalletEvent[E]>
	): boolean {
		return this.getEventEmitter(event).emit(event, ...args);
	}

	public eventNames(): (keyof WalletEvent | string)[] {
		return Object.keys(this.events);
	}
}
