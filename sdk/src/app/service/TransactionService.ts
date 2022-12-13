import { singleton } from 'tsyringe';
import Injectable from '../../core/Injectable.js';
import TransactionAdapter from '../../port/out/TransactionAdapter.js';
import Service from './Service.js';

@singleton()
export default class TransactionService extends Service {

	constructor() {
		super();
	}

	getHandler(): TransactionAdapter {
        return Injectable.resolveTransactionHandler()
    }
}
