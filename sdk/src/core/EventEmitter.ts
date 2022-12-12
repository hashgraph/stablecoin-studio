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
