import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import {
	BaseRequest,
	RequestAccount,
} from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export { SupportedWallets };

export default class ConnectRequest
	extends ValidatedRequest<ConnectRequest>
	implements BaseRequest
{
	@OptionalField()
	account?: RequestAccount;
	network: Environment;
	wallet: SupportedWallets;

	constructor({
		account,
		network,
		wallet,
	}: {
		account?: RequestAccount;
		network: Environment;
		wallet: SupportedWallets;
	}) {
		super({
			account: Validation.checkAccount(),
			wallet: Validation.checkString({ emptyCheck: true }),
		});
		this.account = account;
		this.network = network;
		this.wallet = wallet;
	}
}
