import { injectable } from 'tsyringe';
import Account from '../../domain/context/account/Account.js';
import Service from './Service.js';

@injectable()
export default class AccountService extends Service {
	constructor(
		public readonly mirrorNodeAdapter: Service,
		public readonly rpcNodeAdapter: Service,
	) {
		super();
	}

	getCurrentAccount(): Account {
		// TODO
		return new Account({ id: '0.0.1', environment: 'testnet' });
	}
}
