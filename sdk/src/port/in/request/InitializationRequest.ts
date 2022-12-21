import WalletEvent from '../../../app/service/event/WalletEvent.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { BaseRequest } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';

export { SupportedWallets };

export default class InitializationRequest
	extends ValidatedRequest<InitializationRequest>
	implements BaseRequest
{
	network: Environment;
	events?: Partial<WalletEvent>;

	constructor({
		network,
		events,
	}: {
		network: Environment;
		events?: Partial<WalletEvent>;
	}) {
		super({});
		this.network = network;
		this.events = events;
	}
}
