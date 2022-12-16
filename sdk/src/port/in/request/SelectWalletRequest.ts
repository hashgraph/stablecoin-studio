import { Environment } from '../../../domain/context/network/Environment.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export interface SelectWalletRequestProps {
	wallet: SupportedWallets;
	network: Environment;
}

export default class SelectWalletRequest extends ValidatedRequest<SelectWalletRequest> {
	wallet: SupportedWallets;
	network: Environment;
	constructor(props: SelectWalletRequestProps) {
		super({
			network: Validation.checkString({ emptyCheck: true }),
			wallet: Validation.checkString({ emptyCheck: true }),
		});
		Object.assign(this, props);
	}
}
