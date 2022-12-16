import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import { Environment } from '../../../../../domain/context/network/Environment.js';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet.js';

export class SelectWalletCommandResponse implements CommandResponse {
	constructor(public readonly walletType: SupportedWallets) {}
}

export class SelectWalletCommand extends Command<SelectWalletCommandResponse> {
	constructor(
		public readonly environment: Environment,
		public readonly wallet: SupportedWallets,
	) {
		super();
	}
}
