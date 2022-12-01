import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import Account from '../../../../../domain/context/account/Account.js';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet.js';

export class ConnectCommandResponse implements CommandResponse {
	constructor(
		public readonly pairingString: string,
		public readonly walletType: SupportedWallets,
	) {}
}

export class ConnectCommand extends Command<ConnectCommandResponse> {
	constructor(
		public readonly account: Account,
		public readonly wallet: SupportedWallets,
	) {
		super();
	}
}
