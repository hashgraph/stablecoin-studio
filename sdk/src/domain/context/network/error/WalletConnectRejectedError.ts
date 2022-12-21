import BaseError, { ErrorCode } from '../../../../core/error/BaseError.js';
import { SupportedWallets } from '../../../../port/in/request/ConnectRequest.js';

export class WalletConnectRejectedError extends BaseError {
	constructor(wallet: SupportedWallets) {
		super(
			ErrorCode.PairingRejected,
			`The user rejected the pair request for: ${wallet}`,
		);
		Object.setPrototypeOf(this, WalletConnectRejectedError.prototype);
	}
}
