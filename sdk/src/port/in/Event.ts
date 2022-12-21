/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from '../../core/Injectable.js';
import NetworkService from '../../app/service/NetworkService.js';
import WalletEvent, {
	ConnectionState,
	WalletEvents,
} from '../../app/service/event/WalletEvent.js';
import EventService from '../../app/service/event/EventService.js';

export { WalletEvent, WalletEvents, ConnectionState };

export type EventParameter<T extends keyof WalletEvent> = Parameters<
	WalletEvent[T]
>[0];

interface EventInPortBase {
	register(events: Partial<WalletEvent>): void;
}

class EventInPort implements EventInPortBase {
	constructor(
		private readonly networkService: NetworkService = Injectable.resolve<NetworkService>(
			NetworkService,
		),
		private readonly eventService: EventService = Injectable.resolve(
			EventService,
		),
	) {}

	register(events: Partial<WalletEvent>): void {
		Object.entries(events).map(([name, cll]) => {
			if (name in WalletEvents) {
				this.eventService.on(name as keyof WalletEvent, cll);
			}
		});
	}
}

const Event = new EventInPort();
export default Event;
