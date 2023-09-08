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

import BaseEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import WalletEvent from '../app/service/event/WalletEvent.js';

/**
 * Allows to emit events to be received by a listener, based on the NodeJS.EventEmitter
 * Example usage:
 * ```js
 * const { once, EventEmitter } = require('events');
 *
 * async function run() {
 *   const ee = new EventEmitter();
 *
 *   process.nextTick(() => {
 *     ee.emit('myevent', 42);
 *   });
 *
 *   const [value] = await once(ee, 'myevent');
 *   console.log(value);
 *
 *   const err = new Error('kaboom');
 *   process.nextTick(() => {
 *     ee.emit('error', err);
 *   });
 *
 *   try {
 *     await once(ee, 'myevent');
 *   } catch (err) {
 *     console.log('error happened', err);
 *   }
 * }
 *
 * run();
 * ```
 */
export default class EventEmitter<
	T extends WalletEvent,
> extends (BaseEmitter as {
	new <T extends WalletEvent>(): TypedEmitter<T>;
})<T> {}
