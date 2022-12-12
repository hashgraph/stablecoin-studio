import { Command } from '../../../../../core/command/Command.js';
import { CommandResponse } from '../../../../../core/command/CommandResponse.js';
import Account from '../../../../../domain/context/account/Account.js';
import { Environment } from '../../../../../domain/context/network/Environment.js';
import { SupportedWallets } from '../../../../../domain/context/network/Wallet.js';
import { TransactionAdapterInitializationData } from '../../../../../port/out/TransactionAdapter.js';

export class ConnectCommandResponse implements CommandResponse {
	constructor(
		public readonly payload: TransactionAdapterInitializationData,
		public readonly walletType: SupportedWallets,
	) {}
}

export class ConnectCommand extends Command<ConnectCommandResponse> {
	constructor(
		public readonly account: Account,
		public readonly environment: Environment,
		public readonly wallet: SupportedWallets,
	) {
		super();
	}
}
