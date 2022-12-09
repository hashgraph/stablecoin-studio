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
	account: RequestAccount;
	wallet: SupportedWallets;

	constructor({
		account,
		wallet,
	}: {
		account: RequestAccount;
		wallet: SupportedWallets;
	}) {
		super({
			account: Validation.checkAccount(),
			wallet: Validation.checkString({ emptyCheck: true }),
		});
		this.account = account;
		this.wallet = wallet;
	}
}
