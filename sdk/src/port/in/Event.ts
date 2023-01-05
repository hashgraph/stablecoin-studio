/*
 *
 * Hedera Stable Coin SDK
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
